// ============================================================================
// VEHKALA: HEVI PIRSTOO VESIMOLEKYYLIT (11.10.2026, Mikkeli x:650, Jarno: "rakenna A").
// Käyttö esitys-data.js:ssä: `vehkala: true`.
// Kaiutin jytisee, vesilasin ("70 %") pinta väreilee, H2O-molekyyli tärisee
// joka bassoiskulla yhä enemmän ja hajoaa: vedyt ponnahtavat irti, happi
// halkeaa. Kokoontuu takaisin ja alkaa alusta (7 s jakso, ei klikkauksia).
// Pikselitaide 64x64, vasen puoli ruutua (teksti oikealla), tekstin alla (z 4).
// ============================================================================
(function(){
'use strict';
const R = 64, JAKSO = 7, ISKU = .5, HAJOAA = 4.2;
const cv = document.createElement('canvas');
cv.id = 'vehkala';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .4s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
const lc = document.createElement('canvas'); lc.width = R; lc.height = R;
const g = lc.getContext('2d');

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();
const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
function pallo(cx, cy, r, c, puoli){            // puoli: 0 = koko, -1 = vasen, 1 = oikea
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    if (x*x + y*y > r*r + .5) continue;
    if (puoli < 0 && x > 0 || puoli > 0 && x < 0) continue;
    px(cx + x, cy + y, 1, 1, (x + y < -r*.6) ? '#ffffff55' : c);
  }
}
function viiva(x1, y1, x2, y2, c){ const n = Math.max(Math.abs(x2-x1), Math.abs(y2-y1)); for (let i = 0; i <= n; i++) px(x1 + (x2-x1)*i/n, y1 + (y2-y1)*i/n, 1, 1, c); }

let ac = null;
function tomaus(){ try { if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)();
  const t = ac.currentTime, o = ac.createOscillator(), v = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
  v.gain.setValueAtTime(.09, t); v.gain.exponentialRampToValueAtTime(.0001, t + .14);
  o.connect(v).connect(ac.destination); o.start(t); o.stop(t + .16); } catch(e) {} }
function poks(){ try { if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)();
  const t = ac.currentTime, o = ac.createOscillator(), v = ac.createGain();
  o.type = 'square'; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(120, t + .25);
  v.gain.setValueAtTime(.05, t); v.gain.exponentialRampToValueAtTime(.0001, t + .28);
  o.connect(v).connect(ac.destination); o.start(t); o.stop(t + .3); } catch(e) {} }

const AANET = false;   // 11.10 Jarno: äänet pois
let aktiivinen = false, alku = 0, raf = 0, viimeIsku = -1, viimeJakso = -1;
function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku) / 1000, k = t % JAKSO, jakso = Math.floor(t / JAKSO);
  if (jakso !== viimeJakso) { viimeJakso = jakso; viimeIsku = -1; }
  const hajonnut = k >= HAJOAA;
  const iskuN = Math.floor(k / ISKU), isku = 1 - (k % ISKU) / ISKU;      // 1 heti iskun jälkeen
  if (!hajonnut && iskuN !== viimeIsku) { viimeIsku = iskuN; if (AANET) tomaus(); }
  if (hajonnut && viimeIsku !== 999) { viimeIsku = 999; if (AANET) poks(); }
  g.clearRect(0, 0, R, R);

  // kaiutin
  px(4, 24, 18, 34, '#26262c'); px(4, 24, 18, 1, '#3a3a42');
  const pump = hajonnut ? 0 : Math.round(isku*1.5);
  for (const [cy, r] of [[33, 3], [47, 6 + pump]]) {
    for (let a = 0; a < 40; a++) px(13 + Math.cos(a/40*6.283)*r, cy + Math.sin(a/40*6.283)*r, 1, 1, '#8a8a95');
    px(12, cy - 1, 3, 3, '#4a4a55');
  }
  // äänirenkaat
  if (!hajonnut) for (let i = 0; i < 3; i++) { const r = ((k*24 + i*6) % 18); for (let a = -6; a <= 6; a++) px(22 + r + 1, 47 + a*(1 + r*.06), 1, 1, `rgba(242,201,76,${1 - r/18})`); }

  // vesilasi
  px(30, 38, 1, 20, '#cfe8ff'); px(43, 38, 1, 20, '#cfe8ff'); px(30, 57, 14, 1, '#cfe8ff');
  for (let x = 31; x < 43; x++) {
    const aalto = hajonnut ? 0 : Math.round(Math.sin(x*1.3 + k*18) * isku * 1.2);
    px(x, 43 + aalto, 1, 57 - 43 - aalto, '#3d8fd1'); px(x, 43 + aalto, 1, 1, '#9fd4ff');
  }

  // H2O
  const cx = 37, cy = 16;
  const voima = Math.min(1, k / HAJOAA);
  const ravistus = hajonnut ? 0 : isku * voima * 2.5;
  const rx = (Math.random()-.5)*ravistus, ry = (Math.random()-.5)*ravistus;
  if (!hajonnut || k > JAKSO - .6) {
    const ox = cx + rx, oy = cy + ry;
    viiva(ox, oy, ox - 7, oy + 5, '#bbbbbb'); viiva(ox, oy, ox + 7, oy + 5, '#bbbbbb');
    pallo(ox - 7, oy + 5, 3, '#f4f4f8', 0); pallo(ox + 7, oy + 5, 3, '#f4f4f8', 0);
    pallo(ox, oy, 5, '#e04a3a', 0);
  } else {
    const e = k - HAJOAA, alpha = Math.max(0, 1 - e/2.2);
    g.globalAlpha = alpha;
    pallo(cx - 7 - e*14, cy + 5 + e*e*6, 3, '#f4f4f8', 0);
    pallo(cx + 7 + e*14, cy + 5 + e*e*6 - e*4, 3, '#f4f4f8', 0);
    pallo(cx - 1 - e*5, cy + e*e*4, 5, '#e04a3a', -1);
    pallo(cx + 1 + e*5, cy + e*e*4, 5, '#e04a3a', 1);
    for (let i = 0; i < 8; i++) { const a = i*.785; px(cx + Math.cos(a)*e*18, cy + Math.sin(a)*e*14, 1, 1, '#f2c94c'); }
    g.globalAlpha = 1;
  }

  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const S = Math.min(H*.62, W*.42), x0 = W*.04, y0 = H*.94 - S;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lc, x0, y0, S, S);
  const sk = S / R;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(S*.055)}px Georgia, serif`;
  ctx.fillText('70 %', x0 + 37*sk, y0 + 50*sk);
  ctx.font = `700 ${Math.round(S*.045)}px Georgia, serif`; ctx.fillStyle = '#f6efe4';
  if (!hajonnut) ctx.fillText('H₂O', x0 + 37*sk, y0 + 5*sk);
  raf = requestAnimationFrame(silmukka);
}

window.naytaVehkala = function(p){
  const paalle = !!(p && p.vehkala);
  if (paalle === aktiivinen) return;
  aktiivinen = paalle; cancelAnimationFrame(raf);
  if (!paalle) { cv.style.opacity = 0; return; }
  alku = performance.now(); viimeIsku = -1; viimeJakso = -1;
  cv.style.opacity = 1;
  raf = requestAnimationFrame(silmukka);
};
})();
