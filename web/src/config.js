// 設定。値は web/.env に書きます(web/.env.example をコピーして作る)。
// 履歴の保存先は、上から順に設定があるものを使います。
//   1. VITE_API_URL      … このプロジェクトの api サーバー(PostgreSQL)
//   2. VITE_SUPABASE_URL … Supabase
//   3. どれも空          … この端末のブラウザ内(IndexedDB)
const env = import.meta.env;

export const CONFIG = {
  apiUrl: env.VITE_API_URL || "",            // 例: "/api" や "https://konomi-api.example.com/api"
  supabaseUrl: env.VITE_SUPABASE_URL || "",  // 例: "https://abcdefgh.supabase.co"
  supabaseKey: env.VITE_SUPABASE_KEY || "",  // Publishable key か anon public キー。secret / service_role キーは絶対に書かない
  supabaseTable: "drinks",
  // QRコードに入れるURL。空なら、いま開いているページのURLを使います
  siteUrl: env.VITE_SITE_URL || ""
};
