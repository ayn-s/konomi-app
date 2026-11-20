import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const shared = fileURLToPath(new URL("../shared", import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: "./", // GitHub Pages のように /リポジトリ名/ の下に置いても動くように
  resolve: { alias: { "@shared": shared } },
  server: {
    fs: { allow: [".."] },
    // 開発中は /api を api サーバー(npm run dev:api)へ転送する
    proxy: { "/api": "http://localhost:3001" }
  }
});
