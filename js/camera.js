// カメラの起動と停止。映像はこの端末の中だけで使い、保存も送信もしません。
let cameraStream = null;
let cameraError = ""; // 失敗した理由(画面に出す用)

async function startCamera(videoEl) {
  cameraError = "";
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { cameraError = "Insecure"; return false; }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    videoEl.srcObject = cameraStream;
    await videoEl.play();
    return true;
  } catch (e) {
    cameraError = e.name; // NotAllowedError(拒否) / NotFoundError(カメラなし) など
    return false;
  }
}

function stopCamera(videoEl) {
  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
  videoEl.srcObject = null;
}
