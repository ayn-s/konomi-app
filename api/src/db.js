// PostgreSQL への接続。接続先は環境変数 DATABASE_URL(api/.env)
import pg from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL が設定されていません。api/.env.example をコピーして api/.env を作ってください。");
  process.exit(1);
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // クラウドの PostgreSQL で SSL が必要なときは DATABASE_SSL=true
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  max: 10
});

// データベースが止まったり再起動したりしても、api サーバーは落とさない(次の読み書きでつなぎ直す)
pool.on("error", err => console.error("PostgreSQL との接続が切れました:", err.message));
