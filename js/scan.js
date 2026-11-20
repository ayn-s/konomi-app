// スキャン画面。カメラ映像の上に「解析している風」の表示を重ねる。
// 注意: 心拍・体温・表情・からだの調子は【演出(ランダム)】です。実際には解析していません。
// 天気と気温だけは js/weather.js で本物を取得しています。
const SCAN_STEPS = [
  "位置情報とカメラの許可を確認しています",
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
let scanCancelled = false;
let readoutTimer = null;

function startReadouts() {
  const rnd = (a, b, d = 0) => (a + Math.random() * (b - a)).toFixed(d);
  const tick = () => {
    $("ro-hr").textContent = rnd(66, 84);
    $("ro-temp").textContent = rnd(36.2, 36.8, 1);
    if (Math.random() < 0.25) $("ro-mood").textContent = MOODS[Math.floor(Math.random() * MOODS.length)];
  };
  tick();
  readoutTimer = setInterval(tick, 350);
}

function closeScan() {
  clearInterval(readoutTimer);
  stopCamera($("scan-video"));
  $("scan-overlay").hidden = true;
  document.body.classList.remove("scanning");
}

function cancelScan() { scanCancelled = true; closeScan(); }

$("scan-cancel").onclick = cancelScan;
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("scan-overlay").hidden) cancelScan();
});

// 戻り値: { c, t, w, h, weather } / やめたときは null
async function runScan() {
  scanCancelled = false;
  const video = $("scan-video"), frame = $("scan-frame"), bar = $("scan-bar"), note = $("scan-note");
  const list = $("scan-steps");
  list.innerHTML = SCAN_STEPS.map(s => `<li>${s}</li>`).join("");
  const items = [...list.children];
  const mark = i => {
    items.forEach((li, j) => { li.className = j < i ? "done" : j === i ? "now" : ""; });
    bar.style.width = Math.round(i / SCAN_STEPS.length * 100) + "%";
  };

  $("scan-overlay").hidden = false;
  document.body.classList.add("scanning");
  $("scan-cancel").focus();
  mark(0);
  note.textContent = "アドレスバー付近に許可の確認が出たら「許可」を選んでください。";

  // ボタンを押した直後に位置情報を聞く(ブラウザは操作の直後でないと許可の表示を小さくすることがあります)
  const place = await getPlace();
  if (scanCancelled) return null;

  const camOk = await startCamera(video);
  if (scanCancelled) return null;
  frame.classList.toggle("nocam", !camOk);
  note.textContent = camOk
    ? "映像はこの端末の中だけで使われ、保存・送信されません。心拍などの数値は演出です。"
    : (CAMERA_REASON[cameraError] || "カメラを使えませんでした。") + "演出だけで進めます。";
  startReadouts();

  // 位置はもう取得済みなので、天気だけ取りに行く
  const weatherP = fetchWeather(place);
  let weather = null;
  for (let i = 1; i < SCAN_STEPS.length; i++) {
    if (scanCancelled) return null;
    mark(i);
    if (i === 3) weather = await weatherP;
    await sleep(i === 3 ? 500 : 900);
  }
  if (scanCancelled) return null;
  mark(SCAN_STEPS.length);
  await sleep(700);
  closeScan();

  // 天気・気温は本物。取得できなかったときだけランダム。
  const real = weather && weather.ok;
  return {
    c: pick(D.c.o),                        // からだの調子(演出)
    h: pick(D.h.o),                        // 好み(演出。将来は履歴から)
    w: real ? weather.sky : pick(D.w.o),
    t: real ? weather.temp : pick(D.t.o),
    weather: weather
  };
}
