// 送られてきた1杯分を確かめて、保存する形にする。
// 名前・色・配合・見た目は、選んだ項目と割合からサーバーで作り直す(画面から変な値を送られても保存しない)
import { D, makeRecipe } from "../../shared/recipe.js";

export function toRecord(body) {
  if (!body || typeof body !== "object") throw new Error("中身がありません");
  const { recipe, weather } = body;
  if (!recipe || typeof recipe !== "object" || !recipe.sel) throw new Error("recipe.sel がありません");

  const sel = {};
  for (const k of Object.keys(D)) {
    const v = recipe.sel[k];
    if (typeof v !== "string" || !Object.hasOwn(D[k].o, v)) throw new Error(`recipe.sel.${k} が選択肢にありません`);
    sel[k] = v;
  }
  const a = recipe.a;
  if (!Number.isInteger(a) || a < 45 || a > 54) throw new Error("recipe.a は 45〜54 の整数です");

  let wx = null;
  if (weather != null) {
    if (typeof weather !== "object" || !Object.hasOwn(D.w.o, weather.sky)) throw new Error("weather.sky が選択肢にありません");
    if (typeof weather.tempC !== "number" || !Number.isFinite(weather.tempC) || Math.abs(weather.tempC) > 70) throw new Error("weather.tempC が正しくありません");
    wx = { sky: weather.sky, tempC: Math.round(weather.tempC) };
  }
  return { weather: wx, recipe: makeRecipe(sel, a) };
}
