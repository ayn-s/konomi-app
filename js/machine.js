// 自販機本体:選択肢の表示、調合、スキャンからの自動調合

// --- 画面の組み立て ---
$("main").innerHTML = bottle(`
  <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
    <stop id="m1" offset="0" stop-color="#7fd6e6"/><stop id="m2" offset="1" stop-color="#f58fb8"/>
  </linearGradient></defs>
  <rect class="liq" id="liq" x="0" y="100" width="120" height="200" fill="url(#mg)"/>
  <g id="bits"></g>`);

$("groups").innerHTML = Object.entries(D).map(([k, g]) => `
  <fieldset>
    <legend>${ic(k)}${g.label}</legend>
    <div class="chips">${Object.keys(g.o).map(v =>
      `<label><input type="radio" name="${k}" value="${v}"><span>${v}</span></label>`).join("")}</div>
  </fieldset>`).join("");

// --- 操作中はボタンを止める ---
let busy = false;
const lock = v => { $("scan").disabled = v; $("make").disabled = v; };

// --- 調合(選ばれている4つから一本つくる)。選択が足りなければ false ---
async function doBrew() {
  const s = {};
  for (const k in D) s[k] = val(k);
  if (Object.values(s).some(v => !v)) { $("status").textContent = "4つとも選ぶか、スキャンしてください"; return false; }

  const cd = D.c.o[s.c], td = D.t.o[s.t], wd = D.w.o[s.w], hd = D.h.o[s.h];
  const liq = $("liq");
  liq.classList.remove("on");
  $("bits").innerHTML = ""; $("res").innerHTML = "";
  $("m1").setAttribute("stop-color", `hsl(${hd.h} 85% ${td.l + 14}%)`);
  $("m2").setAttribute("stop-color", `hsl(${cd.h} 75% ${td.l - 6}%)`);
  $("status").textContent = "調合中…";

  await sleep(60);
  liq.classList.add("on");
  await sleep(2500);

  $("bits").innerHTML =
    dot(46, 210, 9, `hsl(${cd.h} 80% 78%)`) + dot(78, 170, 7, `hsl(${hd.h} 85% 82%)`) +
    dot(60, 255, 6, "rgba(255,255,255,.6)") + dot(82, 235, 4, "rgba(255,255,255,.5)");

  const a = 45 + Math.floor(Math.random() * 10), b = 80 - a;
  $("status").textContent = "できあがり。取り出し口へどうぞ";
  $("res").innerHTML = `
    <h2>${wd.pre}${cd.ing}・${hd.s}</h2>
    <p>${td.w}一本です。${cd.msg}</p>
    <div class="mix">
      <span style="width:20%;background:#a9c4dc"></span>
      <span style="width:${a}%;background:hsl(${cd.h} 75% 60%)"></span>
      <span style="width:${b}%;background:hsl(${hd.h} 85% 66%)"></span>
    </div>
    <div class="lg">${wd.base} 20% / ${cd.ing} ${a}% / ${hd.ing} ${b}%</div>`;
  return true;
}

// --- 「調合して出す」ボタン ---
$("make").onclick = async () => {
  if (busy) return;
  busy = true; lock(true);
  await doBrew();
  busy = false; lock(false);
};

// --- 「からだをスキャン」ボタン:スキャン → 選択欄に反映 → そのまま調合 ---
$("scan").onclick = async () => {
  if (busy) return;
  busy = true; lock(true);
  const r = await runScan();
  if (r) {
    for (const k of ["c", "t", "w", "h"]) {
      document.querySelector(`input[name=${k}][value="${r[k]}"]`).checked = true;
    }
    const wx = r.weather;
    let where = "現在地";
    if (wx && wx.place && wx.place.fallback) {
      where = `${wx.place.name}(${wx.place.reason || "位置情報なし"})`;
    }
    $("status").textContent = wx && wx.ok
      ? `${where}は${r.w}、${wx.tempC}℃(体感${wx.feelC}℃)。からだは「${r.c}」、好みは「${r.h}」ですね。`
      : `天気を取得できなかったため(${wx && wx.error ? (wx.error.name === "AbortError" ? "通信が時間切れ" : wx.error.message) : "原因不明"})、天気と気温はランダムにしました。からだは「${r.c}」、好みは「${r.h}」。`;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("main").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    await sleep(2200);          // 読み取り結果を少し見せてから
    await doBrew();
  } else {
    $("status").textContent = "スキャンをやめました";
  }
  busy = false; lock(false);
};
