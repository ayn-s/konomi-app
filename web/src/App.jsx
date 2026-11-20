// 画面全体。状態(選んだ項目・天気・操作中かどうか・履歴の更新)をここで持ち、各部品に渡します
import { useCallback, useEffect, useRef, useState } from "react";
import { D, REQUIRED, makeRecipe, fillOptional } from "@shared/recipe.js";
import { SvgDefs, Background } from "./components/Background.jsx";
import { Header } from "./components/Header.jsx";
import { ShareDialog } from "./components/ShareDialog.jsx";
import { Hero } from "./components/Hero.jsx";
import { Machine } from "./components/Machine.jsx";
import { ScanOverlay } from "./components/ScanOverlay.jsx";
import { Insights } from "./components/Insights.jsx";
import { History } from "./components/History.jsx";
import { fetchWeather } from "./lib/weather.js";
import { dbAdd, SHARED } from "./lib/store.js";
import { migrateOldHistory } from "./lib/migrate.js";
import { useIdle } from "./hooks/useIdle.js";

const HEADER_WEATHER_EVERY = 10 * 60 * 1000; // 天気は10分ごとに取り直す
const SHARED_RELOAD_EVERY = 60 * 1000;        // みんなで共有するときは1分ごとに履歴を読み直す
const STATUS_START = "スキャンするか、右で選んでください";

// 本物の天気が取れたら「そらの様子」「きょうの気温」を自動で選ぶ(自分で選んだあとは変えない)
const withWeather = (sel, wx) => wx && wx.ok
  ? { ...sel, w: sel.w || wx.sky, t: sel.t || wx.temp }
  : sel;

export default function App() {
  const [sel, setSel] = useState({});
  const [status, setStatus] = useState(STATUS_START);
  const [busy, setBusyState] = useState(false);
  const busyRef = useRef(false);
  const setBusy = v => { busyRef.current = v; setBusyState(v); };
  const [headerWx, setHeaderWx] = useState(null);     // 最後に取得を試した結果
  const [lastWeather, setLastWeather] = useState(null); // 最後に取得できた天気(履歴に記録する)
  const lastWeatherRef = useRef(null);
  const [version, setVersion] = useState(0);           // 履歴が変わったら増やす
  const [ready, setReady] = useState(false);
  const machine = useRef(null), scan = useRef(null), share = useRef(null), makeBtn = useRef(null), card = useRef(null);
  const historyChanged = useCallback(() => setVersion(v => v + 1), []);

  // 天気の表示を更新(スキャン後にも呼ぶ)
  const showHeaderWeather = useCallback(wx => {
    setHeaderWx(wx);
    if (!wx || !wx.ok) return;
    lastWeatherRef.current = wx;
    setLastWeather(wx);
    setSel(s => withWeather(s, wx));
  }, []);

  useEffect(() => {
    const refresh = async () => showHeaderWeather(await fetchWeather());
    refresh();
    const t = setInterval(refresh, HEADER_WEATHER_EVERY);
    return () => clearInterval(t);
  }, [showHeaderWeather]);

  // 履歴:古い版からの引っ越しが済んでから読み込む。共有のときは定期的に読み直す
  useEffect(() => { migrateOldHistory().then(() => setReady(true)); }, []);
  useEffect(() => {
    if (!SHARED) return;
    const t = setInterval(historyChanged, SHARED_RELOAD_EVERY);
    return () => clearInterval(t);
  }, [historyChanged]);

  const setChoices = s => setSel(prev => ({ ...prev, ...s }));

  // --- スキャン(結果を選択欄に入れる) ---
  async function onScan() {
    if (busyRef.current) return;
    setBusy(true);
    const r = await scan.current.run();
    if (r) {
      setChoices({ c: r.c, t: r.t, w: r.w, h: r.h, m: r.m });
      const wx = r.weather;
      if (wx && wx.ok) showHeaderWeather(wx);
      const where = wx && wx.place && wx.place.fallback ? wx.place.name + "(位置情報なし)" : "現在地";
      setStatus(wx && wx.ok
        ? `${where}は${r.w}、${wx.tempC}℃(体感${wx.feelC}℃)。からだは「${r.c}」、気分は「${r.m}」、好みは「${r.h}」ですね。`
        : `天気を取得できなかったため、天気と気温はランダムにしました。からだは「${r.c}」、気分は「${r.m}」、好みは「${r.h}」。`);
    } else {
      setStatus("スキャンをやめました");
    }
    setBusy(false);
  }

  // --- 調合 ---
  async function onMake() {
    if (busyRef.current) return;
    const missing = REQUIRED.filter(k => !sel[k]);
    if (missing.length) { setStatus(`「${missing.map(k => D[k].label).join("」「")}」を選ぶか、スキャンしてください`); return; }
    setBusy(true);

    const s = fillOptional(sel);  // 選んでいないおまかせの項目は、ここで決める
    setChoices(s);
    const r = makeRecipe(s);
    await machine.current.pour(r, setStatus);
    machine.current.showResult(r);
    const saved = await addHistory(r, lastWeatherRef.current); // 履歴に残す(天気・気温は実際に取得したもの)
    setStatus("できあがり。取り出し口へどうぞ" + (saved ? "" : "(履歴は保存できませんでした)"));
    setBusy(false);
  }

  async function addHistory(recipe, weather) {
    try {
      await dbAdd({
        at: new Date().toISOString(),
        weather: weather && weather.ok ? { sky: weather.sky, tempC: weather.tempC } : null,
        recipe
      });
      historyChanged();
      return true;
    } catch (e) {
      return false;
    }
  }

  // 履歴の「もう一度作る」:同じ項目を選んで、自販機まで戻る
  function onAgain(s) {
    if (busyRef.current) return;
    setSel({ ...s });  // 前の版の履歴にない項目は、選んでいない(おまかせ)にする
    setStatus("同じ組み合わせを選びました。「調合して出す」を押してください");
    card.current.scrollIntoView({ behavior: "smooth", block: "start" });
    makeBtn.current.focus({ preventScroll: true });
  }

  // しばらく操作がなければ最初の画面に戻す
  useIdle(() => {
    setSel(withWeather({}, lastWeatherRef.current)); // 天気と気温はまた自動で選ぶ
    machine.current.reset();
    setStatus(STATUS_START);
    if (share.current.isOpen()) share.current.close();
    window.scrollTo({ top: 0 });
  }, () => busyRef.current);

  return (
    <>
      <SvgDefs />
      <Background />
      <main>
        <Header headerWx={headerWx} lastWeather={lastWeather} onShare={() => share.current.open()} />
        <Hero />
        <Machine ref={machine} cardRef={card} makeRef={makeBtn} sel={sel} onSelect={(k, v) => setChoices({ [k]: v })}
          status={status} busy={busy} onScan={onScan} onMake={onMake} />
        <Insights version={version} ready={ready} />
        <History version={version} ready={ready} onAgain={onAgain} onChanged={historyChanged} />
        <p className="foot">2126年の自販機を想像したプロトタイプです。天気は Open-Meteo から実際に取得していますが、体調の解析は演出で、味はすべて架空のものです。</p>
      </main>
      <ScanOverlay ref={scan} />
      <ShareDialog ref={share} />
    </>
  );
}
