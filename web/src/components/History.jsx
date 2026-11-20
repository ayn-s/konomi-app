// これまでに作ったすべての一本(履歴)
// 保存先は lib/store.js(api サーバー / Supabase / この端末の IndexedDB)
// 記録するもの: 日時、そのときの天気と気温、選んだ項目、飲み物の見た目(名前・色・配合・量など)
// 記録しないもの: 体温・心拍・表情・顔やカメラ映像など、からだを読み取った値
import { useEffect, useRef, useState } from "react";
import { D } from "@shared/recipe.js";
import { dbCount, dbPage, SHARED } from "../lib/store.js";
import { fmtDate } from "../lib/utils.js";
import { DrinkBottle, Mix } from "./Bottle.jsx";
import { Ic, SkyIcon } from "./icons.jsx";
import { AdminMenu } from "./AdminMenu.jsx";

const HISTORY_PAGE = 24; // 一度に表示する件数(「もっと見る」で続きを表示)

function Item({ e, onAgain }) {
  const r = e.recipe;
  return (
    <article className="hi-item">
      <DrinkBottle recipe={r} id={e.id} />
      <div className="hi-body">
        <time dateTime={e.at}>{fmtDate(e.at)}</time>
        <div className="hi-wx">
          {e.weather ? <><SkyIcon sky={e.weather.sky} />{`${e.weather.sky} ${e.weather.tempC}℃`}</> : "天気の記録なし"}
        </div>
        <h3>{r.name}</h3>
        <ul className="hi-sel">{Object.entries(D).map(([k, g]) => (
          <li key={k}><Ic k={k} /><span>{g.short}</span><b>{r.sel[k] || "-"}</b></li>
        ))}</ul>
        <Mix recipe={r} />
        <button type="button" className="ghost hi-again" onClick={() => onAgain(r.sel)}>もう一度作る</button>
      </div>
    </article>
  );
}

// version が変わるたびに先頭から読み直す(調合したとき・定期的な読み直し・全件削除のあと)
export function History({ version, ready, onAgain, onChanged }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const shown = useRef(0);

  async function load(more = false) {
    try {
      const t = await dbCount();
      const from = more ? shown.current : 0;
      const list = await dbPage(from, more ? HISTORY_PAGE : Math.max(shown.current, HISTORY_PAGE));
      setItems(prev => more ? [...prev, ...list] : list);
      shown.current = from + list.length;
      setTotal(t);
      setError(false);
    } catch (e) {
      setError(true);
    }
    setLoaded(true);
  }

  useEffect(() => { if (ready) load(); }, [version, ready]);

  return (
    <section className="history" id="history" aria-label="これまでの一本">
      <div className="hi-head">
        <h2>これまでの一本</h2>
        <span className="hi-count" id="hi-count">{!error && total ? `全${total}件` : ""}</span>
      </div>
      <p className="hi-note">{(SHARED
        ? "履歴はみんなで共有されます(日時・天気・気温・選んだ項目・飲み物の見た目だけ)。"
        : "履歴はこの端末の中だけに保存されます。") + "体温・心拍・表情・顔の映像は記録しません。"}</p>
      <div className="hi-list" id="hi-list">
        {error
          ? <p className="hi-empty">この環境では履歴を保存できません(プライベートモードなど)。</p>
          : loaded && !items.length
            ? <p className="hi-empty">まだ履歴はありません。調合するとここに残ります。</p>
            : items.map(e => <Item key={e.id} e={e} onAgain={onAgain} />)}
      </div>
      <button type="button" className="ghost hi-more" id="hi-more" hidden={error || shown.current >= total} onClick={() => load(true)}>もっと見る</button>
      {new URLSearchParams(location.search).has("admin") && <AdminMenu onChanged={onChanged} />}
    </section>
  );
}
