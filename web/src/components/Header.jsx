// ページ上部のヘッダー:いまの天気・気温・時刻と「スマホで開く」ボタン
import { useEffect, useState } from "react";
import { SkyIcon } from "./icons.jsx";
import { WEEKDAY } from "../lib/utils.js";

// 時計(1秒ごと)
function Clock() {
  const [d, setD] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setD(new Date()), 1000); return () => clearInterval(t); }, []);
  const hm = d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  return (
    <time className="tb-clock" id="tb-clock" dateTime={d.toISOString()}>
      <span>{`${d.getMonth() + 1}/${d.getDate()}(${WEEKDAY[d.getDay()]})`}</span> <b>{hm}</b>
    </time>
  );
}

// headerWx = 最後に取得を試した結果(null なら取得中)、lastWeather = 最後に取得できた天気
export function Header({ headerWx, lastWeather, onShare }) {
  const ok = headerWx && headerWx.ok;
  const where = ok ? (headerWx.place.fallback ? headerWx.place.name : "現在地") : "";
  return (
    <header className="topbar" id="topbar">
      <div className="tb-wx" id="tb-wx" title={lastWeather ? `体感 ${lastWeather.feelC}℃` : undefined}>
        <SkyIcon id="tb-ic" sky={ok ? headerWx.sky : null} />
        <span id="tb-sky">{!headerWx ? "天気を取得中…" : ok ? `${where} ${headerWx.sky}` : "天気を取得できませんでした"}</span>
        <b id="tb-temp">{ok ? `${headerWx.tempC}℃` : ""}</b>
      </div>
      <Clock />
      <button type="button" className="tb-share" id="tb-share" aria-haspopup="dialog" onClick={onShare}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M11 18.5h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        <span>スマホで開く</span>
      </button>
    </header>
  );
}
