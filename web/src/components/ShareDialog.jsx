// 「スマホで開く」:このサイトのURLをQRコードで表示する。
// スマホやタブレットのカメラで読み取ると、そのままサイトが開きます。
// QRコードの作成は qrcode-generator(MITライセンス)をこの端末の中で使うので、外部には送信しません。
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import qrcode from "qrcode-generator";
import { CONFIG } from "../config.js";

function siteUrl() {
  if (CONFIG.siteUrl) return CONFIG.siteUrl;
  return location.origin + location.pathname; // ?admin などは付けない
}
// 自分の端末の中でしか開けないURL(他の端末で読み取っても開けない)
const isLocalUrl = u => /^file:|\/\/(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(u);

// 親からは ref.current.open() / close() / isOpen() で操作します
export const ShareDialog = forwardRef(function ShareDialog(_, ref) {
  const dlg = useRef(null), input = useRef(null);
  const [state, setState] = useState({ url: "", svg: "", copied: false });

  useImperativeHandle(ref, () => ({
    open() {
      const url = siteUrl();
      qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
      const qr = qrcode(0, "M");
      qr.addData(url);
      qr.make();
      setState({ url, svg: qr.createSvgTag({ cellSize: 4, margin: 4, scalable: true, alt: "サイトのQRコード" }), copied: false });
      dlg.current.showModal();
    },
    close() { dlg.current.close(); },
    isOpen() { return dlg.current.open; }
  }));

  const local = state.url ? isLocalUrl(state.url) : false;
  const copy = async () => {
    try { await navigator.clipboard.writeText(state.url); setState(s => ({ ...s, copied: true })); }
    catch (e) { input.current.select(); }
  };

  return (
    <dialog className="share" id="share" aria-labelledby="share-title" ref={dlg}
      onClick={e => { if (e.target === dlg.current) dlg.current.close(); }}>{/* 外側を押したら閉じる */}
      <h2 id="share-title">スマホ・タブレットで開く</h2>
      <p className="share-lead">カメラでQRコードを読み取ってください</p>
      <div className="share-qr" id="share-qr" dangerouslySetInnerHTML={{ __html: state.svg }} />
      <p className="share-warn" id="share-warn" hidden={!local}>
        {local ? "このURLはこの端末の中でしか開けません。公開したURL(GitHub Pages など)を web/.env の VITE_SITE_URL に書いてください。" : ""}
      </p>
      <div className="share-url">
        <input id="share-url" ref={input} readOnly aria-label="サイトのURL" value={state.url} />
        <button type="button" className="ghost" id="share-copy" onClick={copy}>{state.copied ? "コピーしました" : "コピー"}</button>
      </div>
      <button type="button" className="ghost share-close" id="share-close" onClick={() => dlg.current.close()}>閉じる</button>
    </dialog>
  );
});
