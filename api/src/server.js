// コノミの api サーバー。履歴の読み書きを PostgreSQL で行い、作った画面(web/dist)も配信します。
//   GET  /api/health              … 動作確認
//   GET  /api/drinks?offset&limit … 新しい順に履歴を読む(limit は最大1000)
//   GET  /api/drinks/count        … 件数 { total }
//   POST /api/drinks              … 1杯分を保存 { weather, recipe } → 201 { id, at }
// 書き換え・削除の API はありません(だれでも消せると困るため。消すときはデータベースから)
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";
import { toRecord } from "./validate.js";

const PORT = Number(process.env.PORT) || 3001;
const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);
app.use(express.json({ limit: "10kb" }));

// 画面を別の場所(GitHub Pages など)に置くときは、その URL を CORS_ORIGIN に書く(カンマ区切り)
if (process.env.CORS_ORIGIN) app.use("/api", cors({ origin: process.env.CORS_ORIGIN.split(",").map(s => s.trim()) }));

const ROW = "id, at, weather, recipe";
const api = express.Router();

api.get("/health", async (req, res) => {
  await pool.query("select 1");
  res.json({ ok: true });
});

api.get("/drinks", async (req, res) => {
  const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
  const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit, 10) || 24));
  const { rows } = await pool.query(`select ${ROW} from drinks order by at desc, id desc offset $1 limit $2`, [offset, limit]);
  res.json(rows);
});

api.get("/drinks/count", async (req, res) => {
  const { rows } = await pool.query("select count(*)::int as total from drinks");
  res.json({ total: rows[0].total });
});

// いたずらで大量に追加されないように、1つの接続元から1分に30杯まで
api.post("/drinks", rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }), async (req, res) => {
  let rec;
  try { rec = toRecord(req.body); }
  catch (e) { return res.status(400).json({ error: e.message }); }
  const { rows } = await pool.query("insert into drinks (weather, recipe) values ($1, $2) returning id, at", [rec.weather, rec.recipe]);
  res.status(201).json(rows[0]);
});

api.use((req, res) => res.status(404).json({ error: "見つかりません" }));
app.use("/api", api);
app.use("/api", (err, req, res, next) => {
  // 送られてきた JSON が壊れている・大きすぎるなど(400番台)は、そのまま伝える
  if (err.status >= 400 && err.status < 500) return res.status(err.status).json({ error: "送られてきたデータを読めません" });
  console.error(err);
  res.status(500).json({ error: "サーバーでエラーが起きました" });
});

// 作った画面(npm run build でできる web/dist)があれば、同じサーバーで配信する
const dist = fileURLToPath(new URL("../../web/dist", import.meta.url));
if (existsSync(dist)) app.use(express.static(dist));

app.listen(PORT, () => console.log(`コノミ api: http://localhost:${PORT}  (画面: ${existsSync(dist) ? "web/dist を配信中" : "未ビルド"})`));
