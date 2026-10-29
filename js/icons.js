// 丸いアイコン(人・温度計・天気・ハート)
const ICON = {
  c: '<circle cx="12" cy="8" r="4" fill="#fff"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" fill="#fff"/>',
  t: '<path d="M10 4a2 2 0 0 1 4 0v9.2a4 4 0 1 1-4 0z" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="17" r="2" fill="#fff"/><path d="M12 8v8" stroke="#fff" stroke-width="1.8"/>',
  w: '<path d="M7 15a4 4 0 0 1 .6-7.9A5.5 5.5 0 0 1 18 8.5a3.3 3.3 0 0 1-.5 6.5z" fill="#fff"/><path d="M8 18v3M12 18v3M16 18v3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
  h: '<path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" fill="#fff"/>'
};
const ICON_COLOR = { c: "#7fd6e6", t: "#f58fb8", w: "#7fd6e6", h: "#f58fb8" };

const ic = k => `<span class="ic" style="background:${ICON_COLOR[k]}"><svg viewBox="0 0 24 24">${ICON[k]}</svg></span>`;
