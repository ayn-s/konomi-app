// 実際の天気を取得する(Open-Meteo: 無料・APIキー不要)
// https://open-meteo.com/en/docs
export const WEATHER = {
  fallbackPlace: { lat: 35.6812, lon: 139.7671, name: "東京" }, // 位置情報が使えないときの場所
  // 体感温度(℃)がこの値「未満」なら、その選択肢にする(上から順に見る)
  feel: [
    [5, "さむい"],
    [10, "肌寒い"],
    [16, "すずしい"],
    [21, "ちょうどいい"],
    [25, "あたたかい"],
    [33, null],          // 25〜33℃は、湿度で「あつい」か「むしあつい」
    [Infinity, "とてもあつい"]
  ],
  humidFrom: 70,   // 湿度(%)がこれ以上なら「むしあつい」
  windyFrom: 10,   // 風速(m/秒)がこれ以上なら「強風」
  timeoutMs: 6000
};
// 現在地を取得(許可されなければ東京にする)
function getPlace() {
  const fb = { ...WEATHER.fallbackPlace, fallback: true };
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(fb);
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude, name: "現在地", fallback: false }),
      () => resolve(fb),
      { timeout: 5000, maximumAge: 600000 }
    );
  });
}

// 天気コード(WMO)と風速を、自販機の「そらの様子」の選択肢に変換
// https://open-meteo.com/en/docs の「WMO Weather interpretation codes」
function codeToSky(code, wind) {
  if (code >= 95) return "雷雨";                                        // 95-99 雷
  if (code === 65 || code === 82) return "大雨";                         // 強い雨・激しいにわか雨
  if ([56, 57, 66, 67].includes(code)) return "みぞれ";                  // 着氷性の霧雨・雨
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "雪";
  if (code === 63 || code === 81) return "雨";
  if ((code >= 51 && code <= 55) || code === 61 || code === 80) return "小雨";
  if (wind >= WEATHER.windyFrom) return "強風";                          // 降っていなくて風が強い
  if (code === 45 || code === 48) return "霧";
  if (code <= 1) return "晴れ";
  if (code === 2) return "くもり時々晴れ";
  return "くもり";
}

// 体感温度と湿度を、自販機の「きょうの気温」の選択肢に変換
function feelToTemp(c, humidity) {
  for (const [below, name] of WEATHER.feel) {
    if (c < below) return name || (humidity >= WEATHER.humidFrom ? "むしあつい" : "あつい");
  }
}

// 戻り値: { ok:true, sky, temp, tempC, feelC, place } か { ok:false }
export async function fetchWeather() {
  const place = await getPlace();
  // 座標は小数2桁(約1km)に丸めて送る
  const url = "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${place.lat.toFixed(2)}&longitude=${place.lon.toFixed(2)}` +
    "&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m&wind_speed_unit=ms&timezone=auto";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), WEATHER.timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const cur = (await res.json()).current;
    return {
      ok: true, place,
      sky: codeToSky(cur.weather_code, cur.wind_speed_10m ?? 0),
      temp: feelToTemp(cur.apparent_temperature, cur.relative_humidity_2m ?? 0),
      tempC: Math.round(cur.temperature_2m),
      feelC: Math.round(cur.apparent_temperature)
    };
  } catch (e) {
    return { ok: false, place, error: e };
  } finally {
    clearTimeout(timer);
  }
}
