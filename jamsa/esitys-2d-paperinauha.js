// ============================================================================
// PAPERINAUHA (8.10.2026, x:10470 Kanelin "Tekoäly poistaa esteitä").
// Jarno: "pojan päälle älyttömän pitkä paperinauha taivaalta ylhäältä, joka
// pienenee pieniin palasiin" - Kaneli pilkkoo tekoälyllä tehtävän pieniin osiin.
// Käyttö esitys-data.js:ssä: `paperinauha: true`.
//  0-2.6 s  : loputon nauha valuu taivaalta lukupojan ylle ja huojuu
//  2.8 s    : leikkausviiva pyyhkäisee ylhäältä alas, nauha katkeaa paloiksi
//  3.4-6 s  : palat kutistuvat pieniksi lapuiksi siistiin riviin pojan ylle
// Pojan paikka luetaan Phaserista (kiinteatKuvat, lukupoika.png).
// ============================================================================
(function(){
'use strict';
const PALOJA = 12, SARAKKEITA = 6;
const cv = document.createElement('canvas');
cv.id = 'paperinauha';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', koko); koko();

function poika(){
  const sc = window.__paaKohtaus;
  const kk = sc && (sc.kiinteatKuvat || []).find(k => k.h && k.h.spritesheet && k.h.spritesheet.includes('lukupoika'));
  const img = kk && (kk.img || kk.kuva || kk.sprite);
  if (!img || !img.getBounds) return { x: W*.2, y: H*.56, w: H*.3, h: H*.42 };
  const b = img.getBounds(), sk = W / sc.scale.width;
  return { x: b.x*sk, y: b.y*sk, w: b.width*sk, h: b.height*sk };
}

const ease = e => e <= 0 ? 0 : e >= 1 ? 1 : e*e*(3 - 2*e);
let aktiivinen = false, rafId = 0, alku = 0, palat = null, rivit = [];

function alusta(){
  palat = null;
  rivit = Array.from({ length: 400 }, () => .35 + Math.random()*.55);   // "tekstirivien" pituudet
}

function nauhanX(y, t, P, sw){ return P.x + P.w*.5 - sw/2 + Math.sin(y*.012 + t*1.4) * sw*.18 * Math.min(1, t/1.5); }

function piirraPaperi(x, y, w, h, i0, rivinVali, kulma){
  ctx.fillStyle = '#f4ecd8'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(120,100,70,.18)'; ctx.fillRect(x + w - Math.max(1, w*.05), y, Math.max(1, w*.05), h);   // varjoreuna
  ctx.fillStyle = '#8f8574';
  for (let j = 0, yy = y + rivinVali*.7; yy < y + h - rivinVali*.3; j++, yy += rivinVali) {
    ctx.fillRect(x + w*.1, yy, w*.8 * rivit[(i0 + j) % rivit.length], Math.max(1, rivinVali*.22));
  }
}

function piirra(t){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const P = poika(), sw = Math.max(26, P.w*.32), pohja = P.y + P.h*.04;
  const loppu = pohja - H*.02;
  const RV = sw*.16;                                    // rivinväli
  const VALUU = 2.6, LEIKKAUS = 2.8, PALOITTELU = 3.4;

  if (t < PALOITTELU) {
    // 1) nauha valuu: alareuna laskeutuu, yläpää on aina ruudun yläpuolella (loputon)
    const ala = -H*.05 + (loppu + H*.05) * ease(t / VALUU), seg = 12;
    for (let y = -H*.1, i = 0; y < ala; y += seg, i++) {
      const h = Math.min(seg, ala - y);
      piirraPaperi(nauhanX(y, t, P, sw), y, sw, h + .5, 0, 9999);
    }
    // tekstirivit erikseen, jotta ne eivät katkea segmenttien kohdalla
    ctx.fillStyle = '#8f8574';
    let j = 0;
    for (let yy = -H*.1 + RV*.7; yy < ala - RV*.3; yy += RV, j++) {
      const x = nauhanX(yy, t, P, sw);
      ctx.fillRect(x + sw*.1, yy, sw*.8 * rivit[j % rivit.length], Math.max(1, RV*.22));
    }
    // 2) leikkausviiva pyyhkäisee
    if (t > LEIKKAUS - .5) {
      const e = Math.min(1, (t - (LEIKKAUS - .5)) / .6), yv = e * loppu;
      const g = ctx.createLinearGradient(0, yv - H*.06, 0, yv); g.addColorStop(0, 'rgba(127,216,255,0)'); g.addColorStop(1, 'rgba(127,216,255,.55)');
      ctx.fillStyle = g; ctx.fillRect(P.x + P.w*.5 - sw, yv - H*.06, sw*2, H*.06);
      ctx.fillStyle = 'rgba(200,240,255,.95)'; ctx.fillRect(P.x + P.w*.5 - sw, yv, sw*2, 2);
      // katkoviivat jo leikatuille kohdille
      ctx.fillStyle = 'rgba(60,140,200,.8)';
      for (let k = 1; k < PALOJA; k++) { const yk = loppu * k / PALOJA; if (yk < yv) ctx.fillRect(nauhanX(yk, t, P, sw) - 2, yk - 1, sw + 4, 2); }
    }
    return;
  }

  // 3) palat irtoavat ja asettuvat pieniksi lapuiksi siistiin riviin pojan ylle
  if (!palat) {
    const ph = loppu / PALOJA;
    palat = Array.from({ length: PALOJA }, (_, i) => ({ y0: i*ph, h0: ph, kierto: (Math.random()-.5)*.8, viive: (PALOJA - 1 - i) * .08, i0: Math.floor(i*ph / RV) }));
  }
  const lw = sw*.62, lh = lw*.62, vali = lw*.22;
  const rivinLeveys = SARAKKEITA*lw + (SARAKKEITA - 1)*vali;
  const x0 = Math.max(H*.02, P.x + P.w*.5 - rivinLeveys/2), y0 = pohja - H*.06 - 2*lh - vali;
  palat.forEach((p, i) => {
    const e = ease((t - PALOITTELU - p.viive) / 1.3);
    const c = i % SARAKKEITA, r = Math.floor(i / SARAKKEITA);
    const tx = x0 + c*(lw + vali), ty = y0 + r*(lh + vali) + Math.sin(t*1.6 + i)*lh*.06*e;
    const sx = nauhanX(p.y0, PALOITTELU, P, sw);
    const x = sx + (tx - sx)*e, y = p.y0 + (ty - p.y0)*e - Math.sin(Math.PI*e)*H*.05;
    const w = sw + (lw - sw)*e, h = p.h0 + (lh - p.h0)*e;
    ctx.save(); ctx.translate(x + w/2, y + h/2); ctx.rotate(p.kierto * Math.sin(Math.PI*e));
    piirraPaperi(-w/2, -h/2, w, h, p.i0, RV + (lh*.28 - RV)*e, 0);
    ctx.restore();
  });
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku)/1000; if (t >= 0) piirra(t);
  rafId = requestAnimationFrame(silmukka);
}

window.naytaPaperinauha = function(p){
  if (!(p && p.paperinauha)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); alusta();
  aktiivinen = true; alku = performance.now() + 400; cv.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
