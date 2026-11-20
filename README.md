# コノミ KONOMI

西暦2126年、空・からだ・気温・好みから、その人だけの一本を調合する自販機のプロトタイプ。

- **画面**: React(Vite)。見た目と動きは、素の HTML/JS 版とまったく同じです
- **履歴の保存先**: 次の3つから選べます(`web/.env`)
  1. このプロジェクトの **api サーバー + PostgreSQL**(みんなで共有)
  2. **Supabase**(みんなで共有)
  3. 何も設定しない → **この端末のブラウザ内**(IndexedDB)
- 天気と気温: [Open-Meteo](https://open-meteo.com/) から**実際に取得**(APIキー不要)
- カメラスキャン画面: 映像の上に解析している風の表示を重ねた**演出**(心拍・体温・表情・からだの調子は本当の解析ではありません)

## 必要なもの
- [Node.js](https://nodejs.org/) 20.19 以上(`node -v` で確認)
- api サーバーを使うときだけ: PostgreSQL 14 以上

## 動かし方(画面だけ・いちばん簡単)
```bash
npm install
npm run dev
```
表示された `http://localhost:5173/` を開きます。履歴はこのブラウザ内に保存されます。

> カメラと位置情報は `https://` か `localhost` でしか使えません。

## api サーバー + PostgreSQL で動かす
1. PostgreSQL にデータベースを作る(例: ユーザー `konomi`、データベース `konomi`)
2. `api/.env.example` をコピーして `api/.env` を作り、`DATABASE_URL` を書く
3. テーブルを作る(何度実行しても大丈夫)
   ```bash
   npm run db:init
   ```
4. `web/.env.example` をコピーして `web/.env` を作り、`VITE_API_URL=/api` と書く
5. 2つのターミナルで起動
   ```bash
   npm run dev:api
   ```
   ```bash
   npm run dev
   ```
   開発中は、画面(5173番)への `/api` が api サーバー(3001番)へ自動で転送されます。

### 本番(1つのサーバーで画面と api をまとめて動かす)
```bash
npm run build
npm start
```
`npm run build` でできた `web/dist` を、api サーバーがそのまま配信します。`http://localhost:3001/` を開きます。
Render・Railway・Fly.io などの「Node.js + PostgreSQL」が使えるサービスに置けます(そのときは `DATABASE_URL` などをサービスの環境変数に設定)。

### api の一覧
| | 内容 |
|---|---|
| `GET /api/health` | 動作確認 |
| `GET /api/drinks?offset=0&limit=24` | 新しい順に履歴を読む(limit は最大1000) |
| `GET /api/drinks/count` | 件数 `{ total }` |
| `POST /api/drinks` | 1杯分を保存 `{ weather, recipe }` → `201 { id, at }` |

- 日時はサーバーが付けます。名前・色・配合は、送られた項目と割合からサーバーで作り直して保存します(変な値を送られても保存しません)
- 1つの接続元から1分に30杯まで。書き換え・削除の api はありません(消すときはデータベースから)

## Supabase で動かす
1. [supabase.com](https://supabase.com/) でプロジェクトを作り、**SQL Editor** で `supabase/schema.sql` を Run
2. `web/.env` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_KEY`(**Publishable key** か anon public キー)を書く

> **secret キー / service_role キーは絶対に書かないでください。** 画面に入るキーはだれでも見られます。

## スマホ・タブレットで開く(QRコード)
ヘッダー右の **スマホで開く** を押すと、サイトのURLがQRコードで出ます。
公開したURLを `web/.env` の `VITE_SITE_URL` に書いてください(空なら、いま開いているURL)。

### GitHub Pages に置く(画面だけ)
`npm run build` でできた `web/dist` の中身を公開します。どの場所に置いても動くように作ってあります。
GitHub Pages では api サーバーは動かせないので、履歴は「この端末」か Supabase、または別の場所で動かした api サーバー(`VITE_API_URL` にその URL、api 側の `CORS_ORIGIN` に Pages の URL)を使います。

## 選べる項目
| 項目 | 選択肢の数 | 飲み物への効き方 |
|---|---|---|
| からだの調子 | 14 | 主な材料と色、説明の文 |
| きょうの気温(体感) | 8 | 色の濃さ。「のみたい温度」を選ばなければ温度のことばも |
| そらの様子 | 11 | 名前の頭とベースの水 |
| いまの好み | 13 | 2つ目の材料と色、名前のおしり |
| のみたい温度 | 5 | 温度のことば、色の濃さ、冷たいときは氷 |
| いまの気分 | 8 | トッピングのつぶの色、説明の文 |
| 飲み物の量 | 5 | ボトルの大きさ(中身はいつも満タン) |
| 刺激のつよさ | 6 | 上がってくる泡の数、説明の文 |

- 上の4つは必ず選びます(スキャンでも入ります)。下の4つは選ばなければ「おまかせ」で、調合するときに決まります
- 天気と気温は、本物の天気(天気コード・体感温度・湿度・風速)から自動で選ばれます
- 選択肢を増やす・変えるときは `shared/recipe.js` だけを書き換えます(画面にもサーバーの確認にも自動で反映)

## フォルダ構成
```
package.json        まとめて動かすためのコマンド(npm run dev など)
shared/
  recipe.js         味・選択肢のデータと、選んだ項目から飲み物を決める処理(画面と api の両方で使う)
web/                画面(React + Vite)
  index.html
  vite.config.js
  .env.example      設定の見本(保存先、QRコードのURL)
  src/
    main.jsx        入り口。見た目(styles)を読み込む順番もここ
    App.jsx         画面全体。選んだ項目・天気・操作中かどうか・履歴の更新を持つ
    config.js       設定(web/.env の値)
    styles/         見た目(CSS)。素の版からそのまま
      base.css / background.css / header.css / hero.css / machine.css
      scan.css / history.css / motion.css
    components/
      Background.jsx  背景の装飾と炭酸の泡、共通のSVG定義
      Header.jsx      天気・気温・時計・「スマホで開く」
      ShareDialog.jsx QRコードの画面
      Hero.jsx        ロゴと見本の瓶
      Machine.jsx     自販機本体(選択肢、注ぎ口、調合の演出、結果)
      ScanOverlay.jsx スキャン画面(演出)
      Insights.jsx    みんなの傾向(表彰台、TOP5、天気ごとの好み)
      History.jsx     これまでの一本
      AdminMenu.jsx   管理者メニュー(?admin)
      Bottle.jsx      ガラス瓶と中身のパーツ(液面の波・泡・漂う具)
      icons.jsx       丸いアイコン・天気のアイコン
    hooks/useIdle.js  2分操作がなければ最初の画面に戻す
    lib/
      store.js        履歴の保存先(api / Supabase / この端末)
      weather.js      現在地と天気の取得(Open-Meteo)
      camera.js       カメラの起動・停止
      migrate.js      古い版の履歴の引っ越し
      utils.js        小さな道具
api/                api サーバー(Node.js + Express + PostgreSQL)
  .env.example      設定の見本(DATABASE_URL など)
  db/schema.sql     テーブル
  src/server.js     api の本体と、web/dist の配信
  src/validate.js   送られてきた1杯分の確認
  src/db.js         PostgreSQL への接続
  src/init-db.js    テーブルを作る(npm run db:init)
supabase/
  schema.sql        Supabase を使うときのテーブル
```

## 担当を分けるときの目安
| やりたいこと | 触るファイル |
|---|---|
| 味・文言・選択肢を増やす | `shared/recipe.js` |
| 見た目(色、背景、ロゴ) | `web/src/styles/` |
| 動きの速さ・演出 | `web/src/styles/motion.css`, `web/src/components/Machine.jsx` |
| 瓶・アイコンの絵 | `web/src/components/Bottle.jsx`, `icons.jsx` |
| スキャン画面の見た目/演出 | `web/src/styles/scan.css`, `web/src/components/ScanOverlay.jsx` |
| 天気の判定(何℃から「さむい」か等) | `web/src/lib/weather.js` 先頭の `WEATHER` |
| 最初の画面に戻るまでの時間 | `web/src/hooks/useIdle.js` の `IDLE_MS` |
| api・データベース | `api/src/server.js`, `api/db/schema.sql` |
| 本物の解析につなぐ | `web/src/components/ScanOverlay.jsx` の `run()` の戻り値 |

## GitHub で共有する
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git push -u origin main
```
`.env` は `.gitignore` に入っているので共有されません(パスワードなどを書くため)。チームには `.env.example` を見て各自で作ってもらいます。

- `main` に直接 push せず、`feature/scan-ui` のように**ブランチを切って Pull Request**
- ファイルを機能で分けてあるので、担当が違えば衝突しにくくなります

## プライバシー
カメラ映像は端末内で表示するだけで、保存も送信もしません。
履歴に残すのは、日時・天気・気温・選んだ項目・飲み物の見た目だけです。体温・心拍・表情・顔の映像は記録しません。
- api サーバー / Supabase を設定したとき: この内容だけを送り、みんなで共有します
- 何も設定しないとき: この端末のブラウザ内(IndexedDB)にだけ保存し、送信しません

管理者メニューは URL の最後に `?admin` を付けると出ます(CSV 書き出し、この端末に保存しているときは全件削除)。隠しているだけで、パスワードなどの保護はありません。
天気の取得時に、現在地の座標を小数2桁(約1km)に丸めて Open-Meteo へ送ります。

## ライセンス
このプロジェクト自体のライセンスは未設定です。公開する前にチームで決めてください(例: MIT)。
使っている主なライブラリ: React、Vite、Express、node-postgres、[qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)(すべて MIT ライセンス)
