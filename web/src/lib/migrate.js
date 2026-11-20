// 以前の版(人ごとの履歴を localStorage に保存)からの引っ越し。この端末に保存するときだけ
import { dbAdd, STORE_MODE } from "./store.js";

let done = null;
export function migrateOldHistory() {
  return done || (done = (async () => {
    if (STORE_MODE !== "local") return;
    try {
      const old = JSON.parse(localStorage.getItem("konomi-history-v1"));
      if (!old || !old.people) return;
      for (const list of Object.values(old.people)) {
        for (const e of list) await dbAdd({ at: e.at, weather: e.weather, recipe: e.recipe });
      }
      localStorage.removeItem("konomi-history-v1");
    } catch (e) { /* 読めなければそのまま */ }
  })());
}
