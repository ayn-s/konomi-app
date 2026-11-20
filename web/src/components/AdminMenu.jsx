// 管理者メニュー:URL の最後に ?admin を付けたときだけ表示(例: index.html?admin)
// 履歴の CSV 書き出しと、全件削除(この端末に保存しているときだけ)ができます
import { useState } from "react";
import { D } from "@shared/recipe.js";
import { dbAll, dbClear, dbCount, STORE_MODE } from "../lib/store.js";
import { fmtDate } from "../lib/utils.js";

const WHERE = {
  api: "サーバー(PostgreSQL・みんなで共有)。履歴を消すときはデータベースから",
  supabase: "Supabase(みんなで共有)。履歴を消すときは Supabase の管理画面(Table Editor)から",
  local: "この端末のブラウザ(IndexedDB)"
};
const csvCell = v => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function AdminMenu({ onChanged }) {
  const [msg, setMsg] = useState("");

  async function exportCsv() {
    const all = (await dbAll()).sort((a, b) => a.at.localeCompare(b.at));
    const head = ["日時", "天気(実際)", "気温(℃)", ...Object.values(D).map(g => g.label), "名前", "配合"];
    const rows = all.map(e => [
      fmtDate(e.at), e.weather ? e.weather.sky : "", e.weather ? e.weather.tempC : "",
      ...Object.keys(D).map(k => e.recipe.sel[k]),
      e.recipe.name, e.recipe.mix.map(m => `${m.label} ${m.pct}%`).join(" / ")
    ]);
    const csv = "﻿" + [head, ...rows].map(r => r.map(csvCell).join(",")).join("\r\n"); // 先頭の ﻿ は Excel の文字化け対策
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `konomi-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg(`${all.length}件を書き出しました`);
  }

  async function clearAll() {
    const n = await dbCount();
    if (!n || !confirm(`履歴 ${n}件をすべて消します。元に戻せません。よろしいですか?`)) return;
    await dbClear();
    onChanged();
    setMsg(`${n}件を消しました`);
  }

  return (
    <div className="admin">
      <h3>管理者メニュー</h3>
      <div className="admin-btns">
        <button type="button" className="ghost" id="ad-csv" onClick={exportCsv}>履歴を CSV で書き出す</button>
        {STORE_MODE === "local" && <button type="button" className="ghost danger" id="ad-clear" onClick={clearAll}>履歴をすべて消す</button>}
      </div>
      <p className="admin-msg">{`保存先: ${WHERE[STORE_MODE]}`}</p>
      <p className="admin-msg" id="ad-msg" role="status">{msg}</p>
    </div>
  );
}
