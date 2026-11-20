// 履歴の保存先。web/.env の設定で、次のどれかを使います(src/config.js)。
//   api      … このプロジェクトの api サーバー(PostgreSQL)
//   supabase … Supabase
//   local    … この端末のブラウザ内(IndexedDB)
// どれでも同じ関数(dbAdd / dbCount / dbPage / dbAll / dbClear)で使えます。
// 記録するもの: { at: 日時, weather: { sky, tempC } | null, recipe: 飲み物の見た目と選んだ項目 }
import { CONFIG } from "../config.js";

export const STORE_MODE = CONFIG.apiUrl ? "api" : (CONFIG.supabaseUrl && CONFIG.supabaseKey) ? "supabase" : "local";
export const SHARED = STORE_MODE !== "local"; // みんなで共有する保存先か
const HISTORY_DB = { name: "konomi", version: 1, store: "drinks" };

// ===== IndexedDB(この端末だけ) =====
let dbP = null;
function openDB() {
  return dbP || (dbP = new Promise((resolve, reject) => {
    const req = indexedDB.open(HISTORY_DB.name, HISTORY_DB.version);
    req.onupgradeneeded = () => {
      const s = req.result.createObjectStore(HISTORY_DB.store, { keyPath: "id", autoIncrement: true });
      s.createIndex("at", "at");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}
// 読み書きを1回行う。fn(store) が返したリクエストの結果を返す
async function idbRun(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_DB.store, mode);
    const req = fn(tx.objectStore(HISTORY_DB.store));
    tx.oncomplete = () => resolve(req && req.result);
    tx.onerror = () => reject(tx.error);
  });
}
// 新しい順に、skip 件とばして limit 件読む
async function idbPage(skip, limit) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const out = [];
    const req = db.transaction(HISTORY_DB.store).objectStore(HISTORY_DB.store).index("at").openCursor(null, "prev");
    let skipped = false;
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) return resolve(out);
      if (!skipped && skip) { skipped = true; return cur.advance(skip); }
      out.push(cur.value);
      if (out.length >= limit) return resolve(out);
      cur.continue();
    };
    req.onerror = () => reject(req.error);
  });
}
const idb = {
  add: rec => idbRun("readwrite", s => s.add(rec)),
  count: () => idbRun("readonly", s => s.count()),
  page: idbPage,
  all: () => idbRun("readonly", s => s.getAll()),
  clear: () => idbRun("readwrite", s => s.clear())
};

// ===== Supabase(みんなで共有) =====
// supabase/schema.sql でテーブルと権限(読む・追加するだけ)を作っておきます
const SB_COLS = "id,at,weather,recipe";
async function sbFetch(query, opts = {}) {
  const headers = { apikey: CONFIG.supabaseKey, "Content-Type": "application/json", ...opts.headers };
  // 旧 anon キー(JWT)のときだけ Authorization も付ける
  if (CONFIG.supabaseKey.startsWith("eyJ")) headers.Authorization = "Bearer " + CONFIG.supabaseKey;
  const res = await fetch(`${CONFIG.supabaseUrl.replace(/\/$/, "")}/rest/v1/${CONFIG.supabaseTable}${query}`, { ...opts, headers });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res;
}
const sb = {
  // 日時はサーバー側で付ける(端末の時計がずれていても正しく並ぶ)
  add: rec => sbFetch("", {
    method: "POST", headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ weather: rec.weather, recipe: rec.recipe })
  }),
  async count() {
    const res = await sbFetch("?select=id&limit=1", { headers: { Prefer: "count=exact" } });
    return Number((res.headers.get("Content-Range") || "").split("/")[1]) || 0;
  },
  page: async (skip, limit) =>
    (await sbFetch(`?select=${SB_COLS}&order=at.desc,id.desc&offset=${skip}&limit=${limit}`)).json(),
  // 集計・書き出し用。1回に読めるのは最大1000件なので、分けて全部読む
  async all() {
    const out = [];
    for (let skip = 0; ; skip += 1000) {
      const rows = await sb.page(skip, 1000);
      out.push(...rows);
      if (rows.length < 1000) return out;
    }
  },
  // 誰でも消せると困るので、ページからは消せない設定にしてある(Supabase の管理画面で消す)
  clear: () => Promise.reject(new Error("Supabase の履歴は管理画面(Table Editor)から消してください"))
};

// ===== api サーバー(PostgreSQL。api/ フォルダ) =====
async function apiFetch(path, opts = {}) {
  const res = await fetch(CONFIG.apiUrl.replace(/\/$/, "") + path, {
    ...opts, headers: { "Content-Type": "application/json", ...opts.headers }
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res;
}
const api = {
  // 日時はサーバー側で付ける。名前・色・配合もサーバーが選んだ項目から作り直して保存する
  add: rec => apiFetch("/drinks", { method: "POST", body: JSON.stringify({ weather: rec.weather, recipe: rec.recipe }) }),
  count: async () => (await (await apiFetch("/drinks/count")).json()).total,
  page: async (skip, limit) => (await apiFetch(`/drinks?offset=${skip}&limit=${limit}`)).json(),
  async all() {
    const out = [];
    for (let skip = 0; ; skip += 1000) {
      const rows = await api.page(skip, 1000);
      out.push(...rows);
      if (rows.length < 1000) return out;
    }
  },
  // 誰でも消せると困るので、ページからは消せない(データベースを直接操作して消す)
  clear: () => Promise.reject(new Error("サーバーの履歴はデータベースから消してください"))
};

const store = { api, supabase: sb, local: idb }[STORE_MODE];
export const dbAdd = rec => store.add(rec);
export const dbCount = () => store.count();
export const dbPage = (skip, limit) => store.page(skip, limit);
export const dbAll = () => store.all();
export const dbClear = () => store.clear();
