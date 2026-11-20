// ガラス瓶の描画。<Bottle>中身</Bottle> で光る瓶ができます。
// over は瓶の外側(キャップの下)に重ねるもの。注ぎ口から落ちる液体の筋に使います
import { useMemo } from "react";

const BOTTLE_PATH = "M40 40h40v22c0 14 26 22 26 52v158a22 22 0 0 1-22 22H36a22 22 0 0 1-22-22V114c0-30 26-38 26-52z";

// size … ボトルの大きさ(1 がふつうの大きさ。底を基準に小さくする)
export function Bottle({ children, over = null, className = "", capOpen = false, size = 1 }) {
  return (
    <svg className={"bt" + (className ? " " + className : "")} viewBox="0 0 120 300" aria-hidden="true"
      style={size !== 1 ? { "--size": size } : undefined}>
      <path d={BOTTLE_PATH} fill="rgba(255,255,255,.1)" />
      <g clipPath="url(#cp)">{children}</g>
      <path d={BOTTLE_PATH} fill="none" stroke="rgba(255,255,255,.65)" strokeWidth="2" />
      <path d="M24 125v140" stroke="rgba(255,255,255,.35)" strokeWidth="5" strokeLinecap="round" />
      {over}
      <g className={"cap" + (capOpen ? " open" : "")}>
        <rect x="34" y="6" width="52" height="36" rx="5" fill="url(#mt)" />
        <path d="M34 17h52M34 28h52" stroke="rgba(0,0,0,.18)" />
      </g>
    </svg>
  );
}

// --- 中身のパーツ ---
const Gradient = ({ id, a, b }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} />
    </linearGradient>
  </defs>
);

export const Liquid = ({ id, a, b, y }) => (
  <><Gradient id={id} a={a} b={b} /><rect x="0" y={y} width="120" height={300 - y} fill={`url(#${id})`} /></>
);
export const Dot = ({ x, y, r, fill }) => <circle cx={x} cy={y} r={r} fill={fill} />;
export const Slice = ({ x, y }) => (
  <>
    <Dot x={x} y={y} r={19} fill="#f4d445" /><Dot x={x} y={y} r={14} fill="#fbe97c" />
    <path d={`M${x} ${y - 14}V${y + 14}M${x - 14} ${y}H${x + 14}M${x - 10} ${y - 10}L${x + 10} ${y + 10}M${x + 10} ${y - 10}L${x - 10} ${y + 10}`} stroke="#f4d445" strokeWidth="1.5" />
  </>
);
export const Leaf = ({ x, y, rot }) => <ellipse cx={x} cy={y} rx="13" ry="6" fill="#4f9a4d" transform={`rotate(${rot} ${x} ${y})`} />;

// --- 動く中身(styles/motion.css で動かします) ---
// 液面が揺れる液体。横に長い波の形を、1周期(40)ずつ横に流してループさせる
const WAVE_PERIOD = 40;
function wavePath(y, amp = 4) {
  let d = `M-160 ${y}`;
  for (let x = -160; x < 280; x += WAVE_PERIOD) d += ` q${WAVE_PERIOD / 4} ${-amp} ${WAVE_PERIOD / 2} 0 t${WAVE_PERIOD / 2} 0`;
  return d + " V300 H-160Z";
}
export const Wave = ({ y, fill, slow = false }) => <path className={"wave" + (slow ? " slow" : "")} d={wavePath(y)} fill={fill} />;
export const LiquidWave = ({ id, a, b, y }) => (
  <><Gradient id={id} a={a} b={b} /><Wave y={y} fill={`url(#${id})`} /></>
);

// 下から上がってくる泡。top は液面の高さ。位置や速さは表示したときに一度だけ決める
export function Bubbles({ top, n = 6 }) {
  const list = useMemo(() => Array.from({ length: n }, () => {
    const x = 28 + Math.random() * 64, r = 1.5 + Math.random() * 2.5, dur = 2.5 + Math.random() * 3;
    return { x: x.toFixed(1), r: r.toFixed(1), dur: dur.toFixed(1), delay: (Math.random() * dur).toFixed(1) };
  }), [n]);
  return list.map((b, i) => (
    <circle key={i} className="bub" cx={b.x} cy="288" r={b.r} fill="rgba(255,255,255,.75)"
      style={{ "--rise": `${288 - top - 6}px`, animationDuration: `${b.dur}s`, animationDelay: `-${b.delay}s` }} />
  ));
}

// 中でゆっくり漂う具(果物など)。子要素ごとに少しずつずらして揺らす
export const Drift = ({ children }) => <g className="drift">{children}</g>;

// --- できあがった飲み物 ---
// 見た目(ボトルの大きさ・氷・泡の数)。前の版の履歴には look がないので、そのときは元の見た目にする
// (少し前の版は量を液面の高さ level で表していたので、それも読めるようにしてある)
export const lookOf = r => ({ level: 100, size: 1, ice: 0, fizz: 0, ...r.look });

// 瓶の中の泡・つぶ・トッピング。液面(level)から底までの間に置く
const inLiquid = (level, f) => Math.round(level + (300 - level) * f);
export const DrinkBits = ({ colors, level = 100 }) => (
  <>
    <Dot x={46} y={inLiquid(level, .55)} r={9} fill={colors.bit1} /><Dot x={78} y={inLiquid(level, .35)} r={7} fill={colors.bit2} />
    <Dot x={60} y={inLiquid(level, .78)} r={6} fill="rgba(255,255,255,.6)" /><Dot x={82} y={inLiquid(level, .68)} r={4} fill="rgba(255,255,255,.5)" />
    {colors.mood && <><Dot x={34} y={inLiquid(level, .3)} r={4} fill={colors.mood} /><Dot x={70} y={inLiquid(level, .88)} r={5} fill={colors.mood} /></>}
  </>
);

// 液面に浮かぶ氷(冷たい飲み物)
const ICE = [[30, -2, -12], [56, 2, 8], [78, -1, -6]];
export const Ice = ({ n, level }) => ICE.slice(0, n).map(([x, dy, rot], i) => (
  <rect key={i} className="ice" x={x} y={level + dy} width="18" height="16" rx="4" transform={`rotate(${rot} ${x + 9} ${level + dy + 8})`} />
));

// できあがった瓶(履歴・表彰台の表示用)。id は SVG のグラデーション名がかぶらないように
// live なら液面が揺れて泡が上がる(表彰台用。履歴は数が多いので止めておく)
export function DrinkBottle({ recipe: r, id, live = false }) {
  const { level, size, ice, fizz } = lookOf(r);
  return (
    <Bottle size={size}>
      {live
        ? <><LiquidWave id={"dg" + id} a={r.colors.top} b={r.colors.bottom} y={level} /><DrinkBits colors={r.colors} level={level} /><Bubbles top={level} n={r.look ? fizz : 5} /></>
        : <><Liquid id={"dg" + id} a={r.colors.top} b={r.colors.bottom} y={level} /><DrinkBits colors={r.colors} level={level} /></>}
      <Ice n={ice} level={level} />
    </Bottle>
  );
}

// 配合バーと内訳
export function Mix({ recipe: r }) {
  const color = [r.mix[0].color, r.colors.mixC, r.colors.mixH];
  return (
    <>
      <div className="mix">{r.mix.map((m, i) => <span key={i} style={{ width: `${m.pct}%`, background: color[i] }} />)}</div>
      <div className="lg">{r.mix.map(m => `${m.label} ${m.pct}%`).join(" / ")}</div>
    </>
  );
}
