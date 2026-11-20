// 自販機本体:左=調合する瓶と結果、右=選択肢とボタン
// 調合の演出:
// 1. キャップが外れる → 2. 材料3色が管を流れる(太さ=配合の割合) → 3. 合流して瓶に注がれる
// → 4. 管が空になる → 5. キャップが閉まって、きらっと光る
import { Fragment, forwardRef, useImperativeHandle, useRef, useState } from "react";
import { D } from "@shared/recipe.js";
import { Bottle, DrinkBits, Bubbles, Ice, Mix, lookOf } from "./Bottle.jsx";
import { Ic } from "./icons.jsx";
import { wait, reduceMotion } from "../lib/utils.js";

// 上:3本の管が合流する注ぎ口(材料3つ分)
const TUBES = [
  "M18 4V26C18 50 60 40 60 66V80",  // 左:ベースの水
  "M60 4V80",                        // 中:からだの材料
  "M102 4V26C102 50 60 40 60 66V80" // 右:好みの材料
];
const INITIAL_POUR = {
  capOpen: false, fill: [false, false, false], drain: false, pour: "", liq: false, glow: false, bits: false,
  m1: "#7fd6e6", m2: "#f58fb8", flowStyle: null, pourFill: null, colors: null, look: lookOf({}), round: 0
};

// 選択肢(グループごと)。おまかせできるグループは、選ばなければ調合するときに決まる
function Choices({ sel, onSelect }) {
  return (
    <div id="groups" className="groups">
      {Object.entries(D).map(([k, g]) => (
        <fieldset key={k} className={g.optional ? "opt" : undefined}>
          <legend><Ic k={k} />{g.label}{g.optional && <small className="opt-note">えらばなければおまかせ</small>}</legend>
          <div className="chips">{Object.keys(g.o).map(v => (
            <label key={v}><input type="radio" name={k} value={v} checked={sel[k] === v} onChange={() => onSelect(k, v)} /><span>{v}</span></label>
          ))}</div>
        </fieldset>
      ))}
    </div>
  );
}

// できあがりのきらめき
function makeSparks() {
  return Array.from({ length: 12 }, () => {
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 70;
    return { "--x": `${Math.cos(a) * d}px`, "--y": `${Math.sin(a) * d}px`, animationDelay: `${Math.random() * .2}s` };
  });
}

// 親からは ref.current.pour(recipe, 状態の文を出す関数) / showResult(recipe) / reset() で操作します
export const Machine = forwardRef(function Machine({ sel, onSelect, status, busy, onScan, onMake, makeRef, cardRef }, ref) {
  const [p, setP] = useState(INITIAL_POUR);
  const [result, setResult] = useState(null);
  const [sparks, setSparks] = useState([]);
  const set = patch => setP(s => ({ ...s, ...patch }));
  const sparkTimer = useRef(null);

  const resetPour = () => setP(s => ({ ...s, capOpen: false, fill: [false, false, false], drain: false, pour: "", liq: false, glow: false, bits: false }));

  useImperativeHandle(ref, () => ({
    reset() { resetPour(); setP(s => ({ ...s, look: lookOf({}) })); setResult(null); },
    showResult(r) { setResult(r); },
    async pour(r, onStatus) {
      setResult(null);
      const color = [r.mix[0].color, r.colors.mixC, r.colors.mixH];
      setP(s => ({
        ...s, capOpen: false, fill: [false, false, false], drain: false, pour: "", liq: false, glow: false, bits: false,
        m1: r.colors.top, m2: r.colors.bottom, pourFill: r.colors.top, colors: r.colors, look: lookOf(r),
        flowStyle: color.map((c, i) => ({ stroke: c, strokeWidth: (1.5 + r.mix[i].pct / 10).toFixed(1) })) // 割合が多いほど太く流れる
      }));

      onStatus("材料を準備しています…");
      set({ capOpen: true });
      await wait(450);

      onStatus("調合中…");
      for (let i = 0; i < 3; i++) { setP(s => ({ ...s, fill: s.fill.map((f, j) => f || j === i) })); await wait(160); }
      await wait(600);

      set({ pour: "on" });
      await wait(250);
      set({ liq: true });      // 液体が下からたまっていく(2.4秒)
      await wait(1900);

      set({ drain: true });
      await wait(500);
      set({ pour: "on off" });
      await wait(450);

      setP(s => ({ ...s, bits: true, round: s.round + 1, capOpen: false })); // キャップが閉まる
      await wait(350);
      set({ glow: true });
      if (!reduceMotion) {
        setSparks(makeSparks());
        clearTimeout(sparkTimer.current);
        sparkTimer.current = setTimeout(() => setSparks([]), 1400);
      }
    }
  }));

  // ボトルが小さいときは注ぎ口との間があくので、液体の筋を上(注ぎ口)まで伸ばす
  const pourTop = -Math.round(300 * (1 - p.look.size) / p.look.size);

  return (
    <section className="card" ref={cardRef}>
      <div className="show" aria-live="polite">
        <div className="status" id="status">{status}</div>
        <div id="main">
          <svg className="disp" viewBox="0 0 120 80" aria-hidden="true">
            {TUBES.map((d, i) => <Fragment key={i}><path d={d} className="tube-glass" /><path d={d} className="tube-in" /></Fragment>)}
            {TUBES.map((d, i) => (
              <path key={i} d={d} id={"flow" + i} pathLength="100" style={p.flowStyle ? p.flowStyle[i] : undefined}
                className={"flow" + (p.fill[i] ? " fill" : "") + (p.drain ? " drain" : "")} />
            ))}
            {[18, 60, 102].map(x => <rect key={x} x={x - 7} y="0" width="14" height="8" rx="2" fill="url(#mt)" />)}
            <rect x="52" y="64" width="16" height="16" rx="3" fill="url(#mt)" />
          </svg>
          <Bottle className={p.glow ? "glow" : ""} capOpen={p.capOpen} size={p.look.size}
            over={<rect className={"pour" + (p.pour ? " " + p.pour : "")} id="pour" x="57" y={pourTop} width="6" height={292 - pourTop} rx="3" style={p.pourFill ? { fill: p.pourFill } : undefined} />}>
            <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
              <stop id="m1" offset="0" stopColor={p.m1} /><stop id="m2" offset="1" stopColor={p.m2} />
            </linearGradient></defs>
            <rect className={"liq" + (p.liq ? " on" : "")} id="liq" x="0" y={p.look.level} width="120" height={300 - p.look.level} fill="url(#mg)" />
            <g id="bits">{p.bits && <>
              <DrinkBits colors={p.colors} level={p.look.level} />
              <Bubbles key={p.round} top={p.look.level} n={p.look.fizz} />
              <Ice n={p.look.ice} level={p.look.level} />
            </>}</g>
          </Bottle>
          {sparks.map((st, i) => <i key={i} className="spark" style={st} />)}
        </div>
        <div className="res" id="res">
          {result && <><h2>{result.name}</h2><p>{result.text}</p><Mix recipe={result} /></>}
        </div>
      </div>
      <div className="panel">
        <Choices sel={sel} onSelect={onSelect} />
        <div className="btns">
          <button className="scan" id="scan" disabled={busy} onClick={onScan}>からだをスキャン</button>
          <button className="make" id="make" disabled={busy} onClick={onMake} ref={makeRef}>調合して出す</button>
        </div>
      </div>
    </section>
  );
});
