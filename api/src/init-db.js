// テーブルを作る(npm run db:init)。db/schema.sql を実行します
import { readFile } from "node:fs/promises";
import { pool } from "./db.js";

const sql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
await pool.query(sql);
console.log("drinks テーブルを用意しました");
await pool.end();
