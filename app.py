"""コノミ KONOMI をFlaskで動かすための小さなサーバー。

使い方:
    pip install -r requirements.txt
    python app.py
    → ブラウザで http://127.0.0.1:8000/ を開く

画面(HTML/CSS/JS)をそのまま配るだけです。
将来、天気APIの中継やAIとの連携など「サーバー側の処理」を足すときは、ここに追加します。
"""
from pathlib import Path

from flask import Flask, send_from_directory

BASE = Path(__file__).resolve().parent

# static_folder=None: フォルダ全体を公開しない(app.py や .git が見えないように、配るものを下で明示する)
app = Flask(__name__, static_folder=None)


@app.route("/")
def index():
    return send_from_directory(BASE, "index.html")


@app.route("/location-test.html")
def location_test():
    return send_from_directory(BASE, "location-test.html")


@app.route("/css/<path:name>")
def css(name):
    return send_from_directory(BASE / "css", name)


@app.route("/js/<path:name>")
def js(name):
    return send_from_directory(BASE / "js", name)


if __name__ == "__main__":
    # 127.0.0.1 = 自分のパソコンからだけ開ける(カメラ・位置情報もこのアドレスなら使えます)
    app.run(host="127.0.0.1", port=8000, debug=True)
