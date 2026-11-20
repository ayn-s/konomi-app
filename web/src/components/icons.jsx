// 丸いアイコン(からだ・気温・天気・好み・のみたい温度・気分・量・刺激)と、天気のアイコン
// 絵は決まった SVG の線なので、文字列のまま <svg> の中に入れています(利用者の入力は入りません)。
const ICON = {
  c: '<circle cx="12" cy="8" r="4" fill="#fff"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" fill="#fff"/>',
  t: '<path d="M10 4a2 2 0 0 1 4 0v9.2a4 4 0 1 1-4 0z" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="17" r="2" fill="#fff"/><path d="M12 8v8" stroke="#fff" stroke-width="1.8"/>',
  w: '<path d="M7 15a4 4 0 0 1 .6-7.9A5.5 5.5 0 0 1 18 8.5a3.3 3.3 0 0 1-.5 6.5z" fill="#fff"/><path d="M8 18v3M12 18v3M16 18v3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
  h: '<path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" fill="#fff"/>',
  p: '<path d="M6 7h10v8a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4z" fill="#fff"/><path d="M16 9h1.5a2.5 2.5 0 0 1 0 5H16" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M9 2.5c-.8 1 .8 2 0 3M13 2.5c-.8 1 .8 2 0 3" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>',
  m: '<circle cx="12" cy="12" r="9" fill="#fff"/><circle cx="9" cy="10" r="1.3" fill="#7d6bb8"/><circle cx="15" cy="10" r="1.3" fill="#7d6bb8"/><path d="M8.2 14a4.4 4.4 0 0 0 7.6 0" fill="none" stroke="#7d6bb8" stroke-width="1.6" stroke-linecap="round"/>',
  v: '<path d="M6 4h12l-1.6 16a1.5 1.5 0 0 1-1.5 1.3H9.1a1.5 1.5 0 0 1-1.5-1.3z" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M7.2 11h9.6l-.9 9H8.1z" fill="#fff"/>',
  s: '<circle cx="8" cy="16" r="3.2" fill="#fff"/><circle cx="15" cy="9" r="2.3" fill="#fff"/><circle cx="17" cy="17" r="1.6" fill="#fff"/><circle cx="10" cy="6" r="1.3" fill="#fff"/>'
};
const ICON_COLOR = { c: "#7fd6e6", t: "#f58fb8", w: "#7fd6e6", h: "#f58fb8", p: "#f6a96b", m: "#b49cf0", v: "#f6a96b", s: "#b49cf0" };

const CLOUD = '<path d="M7 14a4 4 0 0 1 .6-7.9A5.5 5.5 0 0 1 18 7.5a3.3 3.3 0 0 1-.5 6.5z" fill="#dfe4f2"/>';
export const SKY_ICON = {
  "晴れ":   '<circle cx="12" cy="12" r="4.5" fill="#f6c98a"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="#f6c98a" stroke-width="1.8" stroke-linecap="round"/>',
  "くもり時々晴れ": '<circle cx="8.5" cy="8" r="3.6" fill="#f6c98a"/><path d="M8.5 1.5v1.8M2 8h1.8M3.9 3.4l1.3 1.3M13.1 3.4l-1.3 1.3" stroke="#f6c98a" stroke-width="1.6" stroke-linecap="round"/><path d="M8 20a4 4 0 0 1 .5-8A5.2 5.2 0 0 1 18.4 12.6a3.7 3.7 0 0 1-.4 7.4z" fill="#dfe4f2"/>',
  "くもり": '<path d="M7 18a4.5 4.5 0 0 1 .6-9A6 6 0 0 1 19 10a4 4 0 0 1-.5 8z" fill="#dfe4f2"/>',
  "霧":     '<path d="M4 8h16M2 12h20M5 16h14M8 20h8" stroke="#dfe4f2" stroke-width="2" stroke-linecap="round"/>',
  "小雨":   CLOUD + '<path d="M9 17l-.6 2M14 17l-.6 2" stroke="#7fd6e6" stroke-width="1.8" stroke-linecap="round"/>',
  "雨":     CLOUD + '<path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3" stroke="#7fd6e6" stroke-width="1.8" stroke-linecap="round"/>',
  "大雨":   CLOUD + '<path d="M6.5 16l-1.5 5M10 16l-1.5 5M13.5 16l-1.5 5M17 16l-1.5 5" stroke="#5fb8e6" stroke-width="2" stroke-linecap="round"/>',
  "雷雨":   CLOUD + '<path d="M13 13.5l-3.5 5h3l-1.5 4.5 4.5-6h-3l1.5-3.5z" fill="#f6c98a"/>',
  "強風":   '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8" fill="none" stroke="#dfe4f2" stroke-width="1.9" stroke-linecap="round"/>',
  "みぞれ": CLOUD + '<path d="M9 17l-1 3" stroke="#7fd6e6" stroke-width="1.8" stroke-linecap="round"/><circle cx="14.5" cy="19" r="1.4" fill="#fff"/>',
  "雪":     CLOUD + '<circle cx="8" cy="18.5" r="1.3" fill="#fff"/><circle cx="12" cy="20" r="1.3" fill="#fff"/><circle cx="16" cy="18.5" r="1.3" fill="#fff"/>'
};

// 丸いアイコン。k = c / t / w / h
export function Ic({ k }) {
  return (
    <span className="ic" style={{ background: ICON_COLOR[k] }}>
      <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: ICON[k] }} />
    </span>
  );
}

// 天気のアイコン(ヘッダー・履歴・傾向で使う)
export function SkyIcon({ sky, id }) {
  return (
    <span className="tb-ic" id={id}>
      {sky != null && <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SKY_ICON[sky] || "" }} />}
    </span>
  );
}
