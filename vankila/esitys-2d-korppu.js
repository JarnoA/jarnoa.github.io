// ============================================================================
// KORPPU JA LUKKO (11.10.2026, Mikkeli x:560 "DDT – ei kasvimyrkky", Jarno:
// "pelin avaus animaatio, korppu lukko, auki?").
//
// Käyttö esitys-data.js:ssä: `korppu: true`.
// Kulku (kerran, sitten jää hehkumaan):
//   0.0-1.4 s  5,25" korppulevy, päällä iso munalukko, lukko nykii
//   1.4 s      KLIK: sanka ponnahtaa auki, lukko putoaa alas ruudusta
//   1.9 s      levy välähtää, etikettiin tulee "CRACKED BY DDT"
//   2.6-4.2 s  levystä lähtee kopioita viuhkaksi (jotta muutkin pääsevät pelaamaan)
// Pikselitaide: 64x64-kangas skaalataan ilman pehmennystä. Oikea puoli
// ruutua (teksti vasemmalla). Tekstin alla (z 4).
// ============================================================================
(function(){
'use strict';
const R = 64;
const cv = document.createElement('canvas');
cv.id = 'korppu';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .4s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
const lc = document.createElement('canvas'); lc.width = R; lc.height = R;
const g = lc.getContext('2d');

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

// ---------- äänet ----------
let ac = null;
function A(){ if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)(); return ac; }
function piip(f, kesto, voim, tyyppi){
  try { const a = A(), t = a.currentTime, o = a.createOscillator(), v = a.createGain();
    o.type = tyyppi || 'square'; o.frequency.value = f; v.gain.setValueAtTime(voim, t); v.gain.exponentialRampToValueAtTime(.0001, t + kesto);
    o.connect(v).connect(a.destination); o.start(t); o.stop(t + kesto + .02); } catch(e) {}
}

const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

// 5,25" korppu: musta tasku, keskireikä, lukuaukko, etiketti.
function korppu(x, y, s, etiketti){
  const n = Math.round(32*s), h = (v) => Math.round(v*s);
  px(x, y, n, n, '#1b1b1f'); px(x, y, n, 1, '#3a3a42'); px(x, y, 1, n, '#3a3a42');
  px(x + h(4), y + h(3), h(24), h(8), etiketti ? '#f4f1e6' : '#d8d3c4');           // etiketti
  if (etiketti) { px(x + h(5), y + h(5), h(22), 1, '#d23a3a'); px(x + h(5), y + h(8), h(16), 1, '#2f5fb8'); }
  else { px(x + h(5), y + h(5), h(18), 1, '#8a8478'); px(x + h(5), y + h(8), h(12), 1, '#8a8478'); }
  px(x + h(13), y + h(14), h(6), h(6), '#c9c9cf'); px(x + h(14), y + h(15), h(4), h(4), '#1b1b1f');  // keskireikä
  px(x + h(14), y + h(23), h(4), h(7), '#4a3b2a');                                                  // lukuaukko
}

// Munalukko: sanka + runko + avaimenreikä. auki = 0..1 (sanka nousee).
function lukko(cx, y, auki){
  const sankaY = y - 9 - Math.round(auki*5);
  px(cx - 5, sankaY, 2, 10, '#b8bcc6'); px(cx + 3, sankaY + Math.round(auki*3), 2, 10 - Math.round(auki*3), '#b8bcc6');
  px(cx - 5, sankaY, 10, 2, '#d7dae2');
  px(cx - 8, y, 16, 13, '#d9a62e'); px(cx - 8, y, 16, 2, '#f2c94c'); px(cx + 6, y, 2, 13, '#a87a18');
  px(cx - 1, y + 4, 2, 3, '#3d2a08'); px(cx - 2, y + 7, 4, 3, '#3d2a08');
}

let aktiivinen = false, alku = 0, raf = 0, klik = false, suhina = false;

function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku) / 1000;
  g.clearRect(0, 0, R, R);

  // kopiot viuhkaksi (piirretään alkuperäisen taakse)
  const kopioE = Math.min(1, Math.max(0, (t - 2.6) / 1.6));
  if (kopioE > 0) {
    if (!suhina) { suhina = true; for (let i = 0; i < 5; i++) setTimeout(() => piip(500 + i*140, .06, .03, 'triangle'), i*240); }
    const k = 1 - Math.pow(1 - kopioE, 3);
    for (let i = 0; i < 5; i++) {
      const kulma = (i - 2) * .38 * k;
      const dx = Math.sin(kulma) * 26 * k, dy = (1 - Math.cos(kulma)) * 10 * k + 4*k;
      korppu(16 + dx, 18 + dy, .8, true);
    }
  }

  // alkuperäinen levy
  const auki = t < 1.4 ? 0 : Math.min(1, (t - 1.4) / .15);
  const valmis = t > 1.9;
  korppu(16, 16, 1, valmis);

  // lukko: nykii, aukeaa, putoaa
  if (t < 1.4) {
    const nyk = Math.sin(t*28) * (t > .5 ? 1.2 : .4);
    lukko(32 + nyk, 30, 0);
  } else {
    if (!klik) { klik = true; piip(1800, .05, .06); piip(900, .09, .04); }
    const p = t - 1.55;
    const y = 30 + (p > 0 ? p*p*60 : 0), x = 32 + (p > 0 ? p*10 : 0);
    if (y < R + 10) lukko(x, y, auki);
  }

  // isolle kanvaasille
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const S = Math.min(H*.58, W*.36), x0 = W*.93 - S, y0 = H*.86 - S, sk = S / R;
  if (valmis) {                                                    // välähdys + hehku
    const v = Math.max(0, 1 - (t - 1.9)/.35);
    const gx = x0 + 32*sk, gy = y0 + 32*sk;
    const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, S*.6);
    gr.addColorStop(0, `rgba(176,203,64,${.18 + .5*v})`); gr.addColorStop(1, 'rgba(176,203,64,0)');
    ctx.fillStyle = gr; ctx.fillRect(gx - S*.6, gy - S*.6, S*1.2, S*1.2);
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lc, x0, y0, S, S);
  if (valmis) {                                                    // etiketin teksti terävänä
    ctx.font = `700 ${Math.round(S*.042)}px "Courier New", monospace`;
    ctx.fillStyle = '#1b1b1f'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('CRACKED BY DDT', x0 + 21*sk, y0 + 22.5*sk);
  }
  raf = requestAnimationFrame(silmukka);
}

window.naytaKorppu = function(p){
  const paalle = !!(p && p.korppu);
  if (paalle === aktiivinen) return;
  aktiivinen = paalle;
  cancelAnimationFrame(raf);
  if (!paalle) { cv.style.opacity = 0; return; }
  alku = performance.now(); klik = false; suhina = false;
  cv.style.opacity = 1;
  raf = requestAnimationFrame(silmukka);
};
})();
