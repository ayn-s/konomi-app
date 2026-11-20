// みんなの傾向:履歴を集計して、人気の一本と天気ごとの好みを出す
import { useEffect, useState } from "react";
import { D } from "@shared/recipe.js";
import { dbAll } from "../lib/store.js";
import { DrinkBottle } from "./Bottle.jsx";
import { Ic, SkyIcon } from "./icons.jsx";

const RANK_TOP = 5;
const PODIUM_ORDER = [1, 0, 2]; // 表彰台は左から 2位・1位・3位

// 多い順に並べた [値, 件数] の配列
function tally(list, keyFn) {
  const m = new Map();
  for (const x of list) { const k = keyFn(x); if (k != null) m.set(k, (m.get(k) || 0) + 1); }
  return [...m].sort((a, b) => b[1] - a[1]);
}

// 表彰台:1〜3位の瓶を飾る。瓶の見た目はその名前でいちばん新しく作られた一本
function Podium({ all, rank }) {
  const latest = name => all.filter(e => e.recipe.name === name).sort((a, b) => b.at.localeCompare(a.at))[0];
  return (
    <div className="podium" id="podium" aria-label="人気の一本 表彰台">
      {PODIUM_ORDER.filter(i => rank[i]).map(i => {
        const [name, n] = rank[i];
        const e = latest(name);
        return (
          <figure key={i} className={`pd pd${i + 1}`} title={`${i + 1}位 ${name}:${n}杯`}>
            <div className="pd-bottle"><DrinkBottle recipe={e.recipe} id={"pd" + i} live /></div>
            <figcaption>
              <b className="pd-name">{name}</b>
              <span className="pd-n">{`${n}杯`}</span>
            </figcaption>
            <div className="pd-step"><span>{i + 1}</span></div>
          </figure>
        );
      })}
    </div>
  );
}

function Rank({ rank }) {
  const max = rank[0][1];
  return (
    <ol className="in-rank" id="in-rank">
      {rank.map(([name, n], i) => (
        <li key={name} title={`${name}:${n}杯`}>
          <span className="in-no">{i + 1}</span>
          <div className="in-bar-wrap">
            <div className="in-name">{name}</div>
            <div className="in-bar"><i style={{ width: `${Math.max(4, n / max * 100)}%` }} /></div>
          </div>
          <b>{`${n}杯`}</b>
        </li>
      ))}
      {/* まだ種類が少ないときも、順位の枠は TOP5 まで出しておく */}
      {Array.from({ length: RANK_TOP - rank.length }, (_, j) => (
        <li key={"empty" + j} className="in-empty">
          <span className="in-no">{rank.length + j + 1}</span>
          <div className="in-bar-wrap"><div className="in-name">まだありません</div><div className="in-bar" /></div>
          <b>-</b>
        </li>
      ))}
    </ol>
  );
}

function SkyPrefs({ all }) {
  const skies = tally(all, e => e.weather && Object.hasOwn(D.w.o, e.weather.sky) ? e.weather.sky : null);
  return (
    <ul className="in-sky" id="in-sky">
      {/* 天気の種類が多いので、記録がある天気だけを多い順に出す */}
      {skies.length === 0 && <li><span className="in-none">まだ天気の記録がありません</span></li>}
      {skies.map(([sky]) => {
        const list = all.filter(e => e.weather && e.weather.sky === sky);
        const [h, n] = tally(list, e => e.recipe.sel.h)[0];
        const pct = Math.round(n / list.length * 100);
        return (
          <li key={sky} title={`${sky}の日 ${list.length}杯のうち「${h}」が${n}杯`}>
            <SkyIcon sky={sky} /><span className="in-skyname">{sky}</span>
            <Ic k="h" /><b>{h}</b><span className="in-pct">{`${pct}%(${list.length}杯中)`}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function Insights({ version, ready }) {
  const [all, setAll] = useState([]);
  useEffect(() => {
    if (!ready) return;
    dbAll().then(setAll, () => setAll([]));
  }, [version, ready]);

  // 名前(天気・からだ・好みの組み合わせ)ごとに数える
  const rank = tally(all, e => e.recipe.name).slice(0, RANK_TOP);
  return (
    <section className="insights" id="insights" aria-label="みんなの傾向" hidden={!all.length}>
      <div className="hi-head"><h2>みんなの傾向</h2><span className="hi-count" id="in-count">{all.length ? `全${all.length}杯から集計` : ""}</span></div>
      {all.length > 0 && <Podium all={all} rank={rank} />}
      <div className="in-grid">
        <div className="in-box">
          <h3>{`よく作られた一本 TOP${RANK_TOP}`}</h3>
          {all.length > 0 && <Rank rank={rank} />}
        </div>
        <div className="in-box">
          <h3>天気ごとの人気の好み</h3>
          <p className="in-sub">そのとき実際に取得した天気で集計しています</p>
          {all.length > 0 && <SkyPrefs all={all} />}
        </div>
      </div>
    </section>
  );
}
