// スキャン画面。カメラ映像の上に「解析している風」の表示を重ねる。
// 注意: 心拍・体温・表情・からだの調子は【演出(ランダム)】です。実際には解析していません。
// 天気と気温だけは lib/weather.js で本物を取得しています。
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { D } from "@shared/recipe.js";
import { fetchWeather } from "../lib/weather.js";
import { startCamera, stopCamera, cameraError } from "../lib/camera.js";
import { pick, sleep } from "../lib/utils.js";

const SCAN_STEPS = [
  "カメラを起動しています",
  "顔を探しています",
  "表情と顔色を見ています",
  "現在地の天気を取得しています",
  "気温をたしかめています",
  "調合のヒントをまとめています"
];
// カメラが使えなかった理由を、利用者向けの文にする
const CAMERA_REASON = {
  NotAllowedError: "カメラの利用が許可されていません。ブラウザのアドレスバー付近でカメラを許可してください(埋め込み表示の場合は、ページを直接開いてください)。",
  NotFoundError: "カメラが見つかりませんでした。",
  NotReadableError: "ほかのアプリがカメラを使っているようです。",
  Insecure: "このページではカメラを使えません。https か localhost で開いてください。"
};
const MOODS = ["おだやか", "ねむそう", "きりっと", "ほっとしている"];
const rnd = (a, b, d = 0) => (a + Math.random() * (b - a)).toFixed(d);

// 親からは ref.current.run() で開き、結果 { c, t, w, h, m, weather } を受け取る(やめたときは null)
export const ScanOverlay = forwardRef(function ScanOverlay(_, ref) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(-1);     // いまの段階(-1 はまだ一度も開いていない)
  const [nocam, setNocam] = useState(false);
  const [note, setNote] = useState("");
  const [ro, setRo] = useState({ hr: "--", temp: "--", mood: "--" });
  const video = useRef(null), cancelBtn = useRef(null), cancelled = useRef(false), timer = useRef(null);

  const close = () => {
    clearInterval(timer.current);
    stopCamera(video.current);
    setOpen(false);
    document.body.classList.remove("scanning");
  };
  const cancel = () => { cancelled.current = true; close(); };

  // Esc でやめる
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") cancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => { if (open) cancelBtn.current.focus(); }, [open]);

  const startReadouts = () => {
    const tick = () => setRo(r => ({
      hr: rnd(66, 84), temp: rnd(36.2, 36.8, 1),
      mood: Math.random() < 0.25 ? MOODS[Math.floor(Math.random() * MOODS.length)] : r.mood
    }));
    tick();
    timer.current = setInterval(tick, 350);
  };

  useImperativeHandle(ref, () => ({
    async run() {
      cancelled.current = false;
      setOpen(true);
      document.body.classList.add("scanning");
      setStep(0);

      const weatherP = fetchWeather(); // カメラの許可を待っている間に並行して取得

      const camOk = await startCamera(video.current);
      if (cancelled.current) return null;
      setNocam(!camOk);
      setNote(camOk
        ? "映像はこの端末の中だけで使われ、保存・送信されません。心拍などの数値は演出です。"
        : (CAMERA_REASON[cameraError] || "カメラを使えませんでした。") + "演出だけで進めます。");
      startReadouts();

      let weather = null;
      for (let i = 1; i < SCAN_STEPS.length; i++) {
        if (cancelled.current) return null;
        setStep(i);
        if (i === 3) weather = await weatherP;
        await sleep(i === 3 ? 500 : 900);
      }
      if (cancelled.current) return null;
      setStep(SCAN_STEPS.length);
      await sleep(700);
      close();

      // 天気・気温は本物。取得できなかったときだけランダム。
      const real = weather && weather.ok;
      return {
        c: pick(D.c.o),                        // からだの調子(演出)
        m: pick(D.m.o),                        // いまの気分(表情から読んだ演出)
        h: pick(D.h.o),                        // 好み(演出。将来は履歴から)
        w: real ? weather.sky : pick(D.w.o),
        t: real ? weather.temp : pick(D.t.o),
        weather: weather
      };
    }
  }));

  return (
    <div className="scan-overlay" id="scan-overlay" role="dialog" aria-modal="true" aria-labelledby="scan-title" hidden={!open}>
      <div className="scan-box">
        <h2 id="scan-title">スキャン中</h2>
        <div className={"scan-frame" + (nocam ? " nocam" : "")} id="scan-frame">
          <video id="scan-video" playsInline muted ref={video} />
          <svg className="sil" viewBox="0 0 100 130" aria-hidden="true"><circle cx="50" cy="48" r="20" /><path d="M12 128c0-26 17-40 38-40s38 14 38 40z" /></svg>
          <div className="hud" aria-hidden="true">
            <i className="grid" /><i className="oval" />
            <i className="cr tl" /><i className="cr tr" /><i className="cr bl" /><i className="cr br" />
            <i className="beam" />
            <div className="ro">
              <span>心拍 <b id="ro-hr">{ro.hr}</b> bpm</span>
              <span>体温 <b id="ro-temp">{ro.temp}</b> ℃</span>
              <span>表情 <b id="ro-mood">{ro.mood}</b></span>
            </div>
          </div>
        </div>
        <div className="scan-bar"><i id="scan-bar" style={step >= 0 ? { width: Math.round(step / SCAN_STEPS.length * 100) + "%" } : undefined} /></div>
        <ol className="scan-steps" id="scan-steps">
          {step >= 0 && SCAN_STEPS.map((s, j) => <li key={j} className={j < step ? "done" : j === step ? "now" : undefined}>{s}</li>)}
        </ol>
        <p className="scan-note" id="scan-note">{note}</p>
        <button className="ghost" id="scan-cancel" type="button" ref={cancelBtn} onClick={cancel}>やめる</button>
      </div>
    </div>
  );
});
