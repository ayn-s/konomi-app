// 小さな道具(どのファイルからも使います)
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = obj => { const k = Object.keys(obj); return k[Math.floor(Math.random() * k.length)]; };
const val = name => (document.querySelector(`input[name=${name}]:checked`) || {}).value;
