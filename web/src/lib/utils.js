// 小さな道具(どのファイルからも使います)
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const pick = obj => { const k = Object.keys(obj); return k[Math.floor(Math.random() * k.length)]; };
export const WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];

// 履歴の日時の表示(例: 2026/11/5(木) 14:20)
export function fmtDate(iso) {
  const d = new Date(iso);
  const hm = d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}(${WEEKDAY[d.getDay()]}) ${hm}`;
}

// 動きを減らす設定の人には、演出の待ち時間をなくす
export const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const wait = ms => sleep(reduceMotion ? 0 : ms);
