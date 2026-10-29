# コノミ KONOMI

西暦2126年、空・からだ・気温・好みから、その人だけの一本を調合する自販機のプロトタイプ。

- 天気と気温: [Open-Meteo](https://open-meteo.com/) から**実際に取得**(APIキー不要)
- カメラスキャン画面: 映像の上に解析している風の表示を重ねた**演出**(心拍・体温・表情・からだの調子は本当の解析ではありません)
- 好み: いまはランダム。将来は履歴などから

## 動かし方
1. このフォルダを VS Code で開く
2. 拡張機能「Live Server」を入れ(開くと推奨が出ます)、`index.html` を右クリック → **Open with Live Server**

> カメラと位置情報は `https://` か `localhost` でしか使えません。
> `index.html` をダブルクリックして開く方法(`file://`)だと、カメラや位置情報が使えない場合があります。
> その場合も、演出のみ+東京の天気で最後まで動きます。

## フォルダ構成(機能ごと)
```
index.html          ページの骨組み。スキャン画面のHTMLと、JSの読み込み順もここ
css/
  base.css          色・文字・ページ幅・共通パーツ(瓶、丸アイコン)
  background.css    背景の装飾
  hero.css          上部のロゴと見本の瓶
  machine.css       自販機本体(選択パネル、ボタン、結果)
  scan.css          スキャン画面(枠、走査線、心拍の表示など)
js/
  utils.js          小さな道具($, sleep, pick, val)
  data.js           味・選択肢のデータ
  icons.js          丸いアイコン
  bottle.js         ガラス瓶と中身パーツの描画
  hero.js           ロゴと見本の瓶
  weather.js        現在地と天気の取得(Open-Meteo)
  camera.js         カメラの起動・停止
  scan.js           スキャン画面の動き(ここが演出の本体)
  machine.js        スキャン・調合のボタンの動き
```

## 担当を分けるときの目安
| やりたいこと | 触るファイル |
|---|---|
| 味・文言・選択肢を増やす | `js/data.js` |
| 見た目(色、背景、ロゴ) | `css/` |
| 瓶・アイコンの絵 | `js/bottle.js`, `js/icons.js` |
| スキャン画面の見た目/演出 | `css/scan.css`, `js/scan.js` |
| 天気の判定(何℃から「さむい」か等) | `js/weather.js` 先頭の `WEATHER` |
| 本物の解析につなぐ | `js/scan.js` の `runScan()` の戻り値 |

## GitHub で共有する
```bash
cd konomi
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git push -u origin main
```
先に GitHub 上で空のリポジトリ(README等は作らない)を作っておいてください。
チームメンバーは **Settings → Collaborators** で招待します。

### 公開ページにする(GitHub Pages)
リポジトリの **Settings → Pages → Branch: `main` / `(root)`** を選んで Save。
数分後に `https://<ユーザー名>.github.io/<リポジトリ名>/` で開けます(https なのでカメラも使えます)。

### 進め方の目安
- `main` に直接 push せず、`feature/scan-ui` のように**ブランチを切って Pull Request**
- ファイルを機能で分けてあるので、担当が違えば衝突しにくくなります

## 位置情報が取れないとき
- スキャン後の表示に理由が出ます(許可されていない/OSの位置情報サービスがオフ/時間切れ)
- Windows・Macでは、ブラウザだけでなく**OS側の位置情報サービス**もオンにする必要があります

## 位置情報の診断
`location-test.html` を Live Server で開くと、自販機とは無関係に、このブラウザで位置情報が使えるかだけを調べられます
(許可の状態、安全な接続か、エラーの理由と直し方が出ます)。

## プライバシー
カメラ映像は端末内で表示するだけで、保存も送信もしません。
天気の取得時に、現在地の座標を小数2桁(約1km)に丸めて Open-Meteo へ送ります。

## ライセンス
未設定です。公開する前にチームで決めてください(例: MIT)。
