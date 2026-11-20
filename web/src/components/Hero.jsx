// 上部:ロゴと、左右の見本の瓶4本
import { Bottle, LiquidWave, Wave, Bubbles, Drift, Dot, Slice, Leaf } from "./Bottle.jsx";
import { Ic } from "./icons.jsx";

const LemonMint = () => (
  <Bottle>
    <LiquidWave id="a1" a="#d4eb88" b="#86cc70" y={84} /><Bubbles top={84} />
    <Drift><Leaf x={38} y={110} rot={-30} /><Slice x={62} y={150} /><Leaf x={80} y={190} rot={25} /><Slice x={58} y={230} /><Leaf x={40} y={262} rot={-20} /></Drift>
  </Bottle>
);
const Strawberry = () => (
  <Bottle>
    <LiquidWave id="a2" a="#f9b8c6" b="#f08aa3" y={84} /><Bubbles top={84} n={4} />
    <Drift>
      <Dot x={50} y={140} r={16} fill="#d8344b" /><Dot x={82} y={152} r={9} fill="#4a5a9c" /><Dot x={66} y={205} r={17} fill="#c9283f" />
      <Dot x={40} y={230} r={9} fill="#4a5a9c" /><Dot x={55} y={265} r={15} fill="#d8344b" /><Dot x={84} y={258} r={9} fill="#4a5a9c" />
    </Drift>
  </Bottle>
);
const Orange = () => (
  <Bottle>
    <LiquidWave id="a3" a="#f7ad3f" b="#e5892a" y={90} />
    <rect x="64" y="100" width="10" height="145" fill="rgba(255,235,150,.55)" /><Bubbles top={90} n={9} />
  </Bottle>
);
const Coffee = () => (
  <Bottle>
    <Wave y={90} fill="#c79d73" slow />{/* 泡の層(奥) */}
    <LiquidWave id="a4" a="#3b2519" b="#1d100a" y={106} />{/* コーヒー(手前) */}
    <Drift><Dot x={30} y={100} r={3} fill="#4a2d1a" /><Dot x={58} y={98} r={4} fill="#4a2d1a" /><Dot x={88} y={102} r={3} fill="#4a2d1a" /></Drift>
    <rect x="64" y="130" width="10" height="130" fill="rgba(255,220,180,.3)" />
  </Bottle>
);

export function Hero() {
  return (
    <section className="hero" id="hero">
      <LemonMint /><Strawberry />
      <div className="logo">
        <div className="ic4">{["c", "t", "w", "h"].map(k => <Ic key={k} k={k} />)}</div>
        <h1>コノミ</h1>
        <div className="en">KONOMI</div>
        <p className="tag">西暦2126年。空とからだと気分を読み取って、いまのあなたのための一本をその場で調合します。</p>
      </div>
      <Orange /><Coffee />
    </section>
  );
}
