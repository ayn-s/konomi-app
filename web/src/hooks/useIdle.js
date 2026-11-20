// しばらく操作がなければ onIdle を呼ぶ(次のお客様に前の人の選択や結果を見せないため)
// isBusy() が true のあいだ(スキャン中・調合中)は待つ
import { useEffect, useRef } from "react";

export const IDLE_MS = 2 * 60 * 1000; // 2分

export function useIdle(onIdle, isBusy) {
  const cb = useRef(onIdle), busy = useRef(isBusy);
  cb.current = onIdle; busy.current = isBusy;
  useEffect(() => {
    let timer = null;
    const restart = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (busy.current()) return restart();
        cb.current();
      }, IDLE_MS);
    };
    const events = ["pointerdown", "keydown", "wheel", "touchstart"];
    events.forEach(ev => document.addEventListener(ev, restart, { passive: true }));
    restart();
    return () => { clearTimeout(timer); events.forEach(ev => document.removeEventListener(ev, restart)); };
  }, []);
}
