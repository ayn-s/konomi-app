// 実際の天気を取得する(Open-Meteo: 無料・APIキー不要)
// https://open-meteo.com/en/docs
const WEATHER = {
  fallbackPlace: { lat: 35.6812, lon: 139.7671, name: "東京" }, // 位置情報が使えないときの場所
  coldBelow: 18,   // 体感がこの℃未満なら「さむい」
  hotFrom: 26,     // 体感がこの℃以上なら「あつい」
  timeoutMs: 6000,
  geoWaitMs: 12000 // 位置情報の返事を待つ上限(許可の確認を待っている時間も含む)
};

// ---- 場所 ----
const GEO_REASON = {
  1: "位置情報がブロックされています(アドレスバー左のアイコンから位置情報を「許可」にして再読み込みしてください)",
  2: "位置を特定できませんでした(パソコン本体の位置情報サービスがオフかもしれません)",
  3: "位置の取得に時間がかかりすぎました",
  none: "位置情報の許可の返事がありませんでした(アドレスバー左のアイコンで位置情報が「許可」になっているか確認してください)"
};

// 場所を決める: 現在地 → だめなら東京
function getPlace() {
  const fb = { ...WEATHER.fallbackPlace, fallback: true };
  return new Promise(resolve => {
    // ブラウザの timeout は「許可の返事待ち」を含まないので、こちらでも上限を決める
    let done = false;
    const finish = v => { if (!done) { done = true; clearTimeout(timer); resolve(v); } };
    const timer = setTimeout(() => finish({ ...fb, reason: GEO_REASON.none }), WEATHER.geoWaitMs);
    if (!navigator.geolocation) return finish({ ...fb, reason: "このページでは位置情報を使えません(https か localhost で開いてください)" });
    navigator.geolocation.getCurrentPosition(
      p => finish({ lat: p.coords.latitude, lon: p.coords.longitude, name: "現在地", fallback: false }),
      err => finish({ ...fb, reason: GEO_REASON[err.code] || "位置情報を取得できませんでした" }),
      { timeout: 10000, maximumAge: 600000 }
    );
  });
}

// 天気コード(WMO)を、自販機の選択肢(晴れ/くもり/雨/雪)に変換
function codeToSky(code) {
  if (code <= 1) return "晴れ";
  if (code <= 3 || code === 45 || code === 48) return "くもり";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "雪";
  return "雨"; // 51-67, 80-82, 95-99
}

// 体感温度を、自販機の選択肢(さむい/ちょうどいい/あつい)に変換
function feelToTemp(c) {
  if (c < WEATHER.coldBelow) return "さむい";
  if (c >= WEATHER.hotFrom) return "あつい";
  return "ちょうどいい";
}

// 戻り値: { ok:true, sky, temp, tempC, feelC, place } か { ok:false }
async function fetchWeather(knownPlace) {
  const place = knownPlace || await getPlace();
  // 座標は小数2桁(約1km)に丸めて送る
  const url = "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${place.lat.toFixed(2)}&longitude=${place.lon.toFixed(2)}` +
    "&current=temperature_2m,apparent_temperature,weather_code&timezone=auto";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), WEATHER.timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const cur = (await res.json()).current;
    return {
      ok: true, place,
      sky: codeToSky(cur.weather_code),
      temp: feelToTemp(cur.apparent_temperature),
      tempC: Math.round(cur.temperature_2m),
      feelC: Math.round(cur.apparent_temperature)
    };
  } catch (e) {
    return { ok: false, place, error: e };
  } finally {
    clearTimeout(timer);
  }
}
