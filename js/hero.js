// 上部:ロゴと、左右の見本の瓶4本
const sampleBottles = {
  lemonMint: bottle(
    liquid("a1", "#d4eb88", "#86cc70", 84) +
    leaf(38, 110, -30) + slice(62, 150) + leaf(80, 190, 25) + slice(58, 230) + leaf(40, 262, -20)),
  strawberry: bottle(
    liquid("a2", "#f9b8c6", "#f08aa3", 84) +
    dot(50, 140, 16, "#d8344b") + dot(82, 152, 9, "#4a5a9c") + dot(66, 205, 17, "#c9283f") +
    dot(40, 230, 9, "#4a5a9c") + dot(55, 265, 15, "#d8344b") + dot(84, 258, 9, "#4a5a9c")),
  orange: bottle(
    liquid("a3", "#f7ad3f", "#e5892a", 90) +
    `<rect x="64" y="95" width="10" height="150" fill="rgba(255,235,150,.55)"/>`),
  coffee: bottle(
    liquid("a4", "#3b2519", "#1d100a", 104) +
    `<rect x="0" y="90" width="120" height="18" fill="#c79d73"/>` +
    dot(30, 100, 3, "#4a2d1a") + dot(58, 98, 4, "#4a2d1a") + dot(88, 102, 3, "#4a2d1a") +
    `<rect x="64" y="130" width="10" height="130" fill="rgba(255,220,180,.3)"/>`)
};

const logo = `
  <div class="logo">
    <div class="ic4">${["c", "t", "w", "h"].map(ic).join("")}</div>
    <h1>コノミ</h1>
    <div class="en">KONOMI</div>
    <p class="tag">西暦2126年。空とからだと気分を読み取って、いまのあなたのための一本をその場で調合します。</p>
  </div>`;

$("hero").innerHTML =
  sampleBottles.lemonMint + sampleBottles.strawberry + logo + sampleBottles.orange + sampleBottles.coffee;
