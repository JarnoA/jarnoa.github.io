// ============================================================================
// DATAKESKUS: TEKOÄLY ON YKSI VIIDESTÄ (TF 15.10.2026, x:4570 "AI uses about
// 1/5 of the electricity in data centres"). Pikselirakennus, viisi paikkaa
// syttyy vuorotellen: video, photos, games, cloud - viimeisenä AI eri värissä.
// Lähde: UNU-INWEH 2026, AI ≈ 20 % datakeskusten sähköstä 2025.
// Käyttö esitys-data.js:ssä: `datakeskus: true`.
// ============================================================================
(function(){
'use strict';
const PAIKAT = [
  { ikoni: '▶',  nimi: 'video' },
  { ikoni: '▣',  nimi: 'photos' },
  { ikoni: '◆',  nimi: 'games' },
  { ikoni: '☁',  nimi: 'cloud' },
  { ikoni: '✦',  nimi: 'AI', ai: true },
];
const VALI_S = 0.8, ALKU_S = 0.6;        // syttymisväli, ensimmäisen viive
const LEV = 0.46, KORK = 0.30;           // rakennuksen koko (osuus ruudusta)
const KESKI_X = 0.62, MAA = 0.90;
const SININEN = '#5fb8ff', KELTA = '#f2c94c';

const cv = document.createElement('canvas');
cv.id = 'datakeskus';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
function liita(){ document.body.appendChild(cv); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

let aktiivinen = false, rafId = 0, alkuT = 0;

function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms/1000, ta = t - alkuT;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const bw = W*LEV, bh = H*KORK, bx = W*KESKI_X - bw/2, by = H*MAA - bh;
  const px = Math.max(3, Math.round(H*0.006));                    // "pikselin" koko reunoille
  // rakennus: tumma laatikko, pikselireunat, katolla tuuletin-ritilä
  ctx.fillStyle = '#1d2433'; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = '#3a4560'; ctx.fillRect(bx, by, bw, px); ctx.fillRect(bx, by, px, bh); ctx.fillRect(bx + bw - px, by, px, bh);
  ctx.fillStyle = '#2a3346';
  for (let i = 0; i < 6; i++) ctx.fillRect(bx + bw*0.08 + i*bw*0.15, by - px*3, bw*0.1, px*3);
  // viisi paikkaa (palvelinkaapit)
  const n = PAIKAT.length, gap = bw*0.03, sw = (bw - gap*(n + 1)) / n, sh = bh*0.62, sy = by + bh*0.12;
  PAIKAT.forEach((p, i) => {
    const sx = bx + gap + i*(sw + gap);
    const paalla = ta > ALKU_S + i*VALI_S;
    const syttyy = Math.min(1, Math.max(0, (ta - ALKU_S - i*VALI_S) / 0.35));
    const vari = p.ai ? KELTA : SININEN;
    ctx.fillStyle = '#0f141f'; ctx.fillRect(sx, sy, sw, sh);
    if (paalla) {
      ctx.globalAlpha = 0.25 + 0.75*syttyy;
      ctx.fillStyle = p.ai ? 'rgba(242,201,76,0.22)' : 'rgba(95,184,255,0.16)'; ctx.fillRect(sx, sy, sw, sh);
      // vilkkuvat ledirivit
      for (let r = 0; r < 6; r++) {
        const on = Math.sin(t*5 + i*1.7 + r*2.3) > -0.2;
        ctx.fillStyle = on ? vari : 'rgba(255,255,255,0.08)';
        ctx.fillRect(sx + sw*0.15, sy + sh*0.55 + r*sh*0.07, sw*0.12, px);
      }
      ctx.fillStyle = vari; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `700 ${Math.round(sh*0.32)}px "Segoe UI Symbol","Apple Symbols",sans-serif`;
      ctx.fillText(p.ikoni, sx + sw/2, sy + sh*0.3);
      ctx.globalAlpha = 1;
    }
    // nimi alle
    ctx.fillStyle = paalla ? (p.ai ? KELTA : '#d6e6ff') : 'rgba(255,255,255,0.25)';
    ctx.font = `700 ${Math.round(bh*0.11)}px Georgia,serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(p.nimi, sx + sw/2, sy + sh + bh*0.06);
  });
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaDatakeskus = function(p){
  if (p && p.datakeskus) {
    alkuT = performance.now()/1000; aktiivinen = true; cv.style.opacity = 1;
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
    return;
  }
  if (!aktiivinen) return;
  aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
};
})();
