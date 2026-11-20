// 瓶の形・金属キャップ・光の線で共通して使うSVG定義と、背景の装飾
// (色のかたまり・光の曲線・ドット・球・炭酸の泡)
import { useMemo } from "react";

export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs>
      <clipPath id="cp"><path d="M40 40h40v22c0 14 26 22 26 52v158a22 22 0 0 1-22 22H36a22 22 0 0 1-22-22V114c0-30 26-38 26-52z" /></clipPath>
      <linearGradient id="mt" x1="0" x2="1"><stop offset="0" stopColor="#7d838c" /><stop offset=".35" stopColor="#e3e6ea" /><stop offset=".7" stopColor="#9aa0a8" /><stop offset="1" stopColor="#5f656d" /></linearGradient>
      <linearGradient id="gl" x1="0" x2="1"><stop offset="0" stopColor="#f6c98a" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#f6c98a" stopOpacity=".2" /></linearGradient>
    </defs></svg>
  );
}

// 背景の炭酸の泡。画面の下からゆっくり上がっていく(動きは styles/motion.css)
const FIZZ_COUNT = 18;
function Fizz() {
  const list = useMemo(() => Array.from({ length: FIZZ_COUNT }, () => {
    const size = 6 + Math.random() * 18, dur = 14 + Math.random() * 16;
    return {
      left: `${(Math.random() * 100).toFixed(1)}%`, size: `${size.toFixed(0)}px`,
      sway: `${(Math.random() * 80 - 40).toFixed(0)}px`, dur: `${dur.toFixed(0)}s`, delay: `-${(Math.random() * dur).toFixed(0)}s`
    };
  }), []);
  return (
    <div className="fizz">
      {list.map((b, i) => (
        <i key={i} style={{ left: b.left, width: b.size, height: b.size, "--sway": b.sway, animationDuration: b.dur, animationDelay: b.delay }} />
      ))}
    </div>
  );
}

export function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <i className="blob b1" /><i className="blob b2" /><i className="blob b3" /><i className="blob b4" />
      <svg className="curves" viewBox="0 0 1000 700" preserveAspectRatio="none"><path d="M-20 100C180 40 360 130 560 60S840 -10 1020 30" /><path d="M-20 560C220 480 330 640 560 640S860 560 1020 500" /></svg>
      <i className="dots d1" /><i className="dots d2" />
      <i className="orb o1" /><i className="orb o2" /><i className="orb o3" /><i className="orb o4" /><i className="orb o5" />
      <Fizz />
    </div>
  );
}
