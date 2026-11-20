// ガラス瓶の描画。bottle(中身のSVG) で光る瓶ができます。
const BOTTLE_PATH = "M40 40h40v22c0 14 26 22 26 52v158a22 22 0 0 1-22 22H36a22 22 0 0 1-22-22V114c0-30 26-38 26-52z";

function bottle(inner) {
  return `<svg class="bt" viewBox="0 0 120 300" aria-hidden="true">
    <path d="${BOTTLE_PATH}" fill="rgba(255,255,255,.1)"/>
    <g clip-path="url(#cp)">${inner}</g>
    <path d="${BOTTLE_PATH}" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="2"/>
    <path d="M24 125v140" stroke="rgba(255,255,255,.35)" stroke-width="5" stroke-linecap="round"/>
    <rect x="34" y="6" width="52" height="36" rx="5" fill="url(#mt)"/>
    <path d="M34 17h52M34 28h52" stroke="rgba(0,0,0,.18)"/>
  </svg>`;
}

// 中身のパーツ
const liquid = (id, a, b, y) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect x="0" y="${y}" width="120" height="${300 - y}" fill="url(#${id})"/>`;
const dot = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const slice = (x, y) =>
  dot(x, y, 19, "#f4d445") + dot(x, y, 14, "#fbe97c") +
  `<path d="M${x} ${y - 14}V${y + 14}M${x - 14} ${y}H${x + 14}M${x - 10} ${y - 10}L${x + 10} ${y + 10}M${x + 10} ${y - 10}L${x - 10} ${y + 10}" stroke="#f4d445" stroke-width="1.5"/>`;
const leaf = (x, y, rot) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="6" fill="#4f9a4d" transform="rotate(${rot} ${x} ${y})"/>`;
