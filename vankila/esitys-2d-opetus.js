// ============================================================================
// KUKA OPETTI TEKOÄLYN? (11.10.2026, Mikkeli x:5150, Jarno: "kuvitetaan
// animaatiolla").
// Käyttö esitys-data.js:ssä: `opetus: true`.
// Näkymätön armeija: kolme riviä näyttöjä (Kenia / Venezuela · Filippiinit /
// Suomi). Jokaiseen näyttöön tulee kuva - kissa, auto tai virnistävä
// puhekupla - ja sen alle kirjoittuu merkintä KISSA / AUTO / IRONIA, vihreä
// kuittaus, ja kuvasta lentää pienoiskuva ylös mustaan laatikkoon "TEKOÄLY",
// joka sykähtää. Rivit syttyvät tekstirivien tahdissa (2,2 s välein).
// Pikselitaide 96x72, vasen puoli ruutua (teksti oikealla), tekstin alla (z 4).
// Ei ihmisiä: näkymätön armeija näkyy vain näyttöinä. Ei ääniä.
// ============================================================================
(function(){
'use strict';
const LW = 96, LH = 72, RIVI_VALI = 1.2, JAKSO = 2.6;
const RIVIT = [{ y: 28, nimi: 'Kenia' }, { y: 43, nimi: 'Venezuela · Filippiinit' }, { y: 58, nimi: 'Suomi' }];
const SARAKKEET = [6, 36, 66];
const LAATIKKO = { x: 40, y: 3, w: 16, h: 13 };
const MERKINNAT = ['KISSA', 'AUTO', 'IRONIA'];

const cv = document.createElement('canvas');
cv.id = 'opetus';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
const lc = document.createElement('canvas'); lc.width = LW; lc.height = LH;
const g = lc.getContext('2d');
let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();
const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

// pienet kuvat (8x6) näytölle; s = skaala
function kuva(tyyppi, x, y, s){
  const p = (a, b, w, h, c) => px(x + a*s, y + b*s, Math.max(1, w*s), Math.max(1, h*s), c);
  if (tyyppi === 0) {            // kissa
    p(1, 0, 1, 1, '#e8913a'); p(6, 0, 1, 1, '#e8913a'); p(1, 1, 6, 4, '#e8913a');
    p(2, 2, 1, 1, '#1b1b1f'); p(5, 2, 1, 1, '#1b1b1f'); p(3, 3, 2, 1, '#f29bb0'); p(0, 3, 1, 1, '#f4f1e6'); p(7, 3, 1, 1, '#f4f1e6');
  } else if (tyyppi === 1) {     // auto
    p(2, 1, 4, 1, '#d23a3a'); p(0, 2, 8, 2, '#d23a3a'); p(3, 1, 2, 1, '#9fd4ff');
    p(1, 4, 2, 1, '#1b1b1f'); p(5, 4, 2, 1, '#1b1b1f'); p(7, 2, 1, 1, '#f2c94c');
  } else {                       // virnistävä puhekupla = ironia
    p(0, 0, 8, 4, '#f4f1e6'); p(1, 4, 1, 1, '#f4f1e6');
    p(2, 1, 1, 1, '#1b1b1f'); p(5, 1, 1, 1, '#1b1b1f'); p(2, 3, 4, 1, '#1b1b1f'); p(6, 2, 1, 1, '#1b1b1f');
  }
}

let aktiivinen = false, alku = 0, raf = 0, sykahdys = 0;
function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku) / 1000;
  g.clearRect(0, 0, LW, LH);
  sykahdys = Math.max(0, sykahdys - .04);

  // musta laatikko
  const L = LAATIKKO, hohto = .35 + sykahdys*.65;
  px(L.x - 1, L.y - 1, L.w + 2, L.h + 2, `rgba(176,203,64,${hohto})`);
  px(L.x, L.y, L.w, L.h, '#0b0b0e'); px(L.x, L.y, L.w, 1, '#2a2a30'); px(L.x + L.w - 1, L.y, 1, L.h, '#050507');

  const tekstit = [];
  RIVIT.forEach((r, ri) => {
    const rAlku = ri * RIVI_VALI;
    SARAKKEET.forEach((sx, ci) => {
      // näyttö + jalka
      const sy = r.y - 9, paalla = t > rAlku;
      px(sx, sy, 24, 12, '#3a3a42'); px(sx + 1, sy + 1, 22, 10, paalla ? '#16222e' : '#0d0f12');
      px(sx + 10, sy + 12, 4, 1, '#3a3a42'); px(sx + 8, sy + 13, 8, 1, '#3a3a42');
      if (!paalla) return;
      const oma = t - rAlku - ci*.35; if (oma < 0) return;
      const k = oma % JAKSO, n = Math.floor(oma / JAKSO), tyyppi = (n + ci + ri) % 3;
      if (k < 1.7) kuva(tyyppi, sx + 8, sy + 2, 1);
      if (k > .3 && k < 1.7) {                                      // merkintä kirjoittuu
        const sana = MERKINNAT[tyyppi], m = Math.min(sana.length, Math.floor((k - .3) / .12));
        tekstit.push({ x: sx + 12, y: sy + 9.6, s: sana.slice(0, m) + (k < 1.35 && Math.floor(k*6) % 2 ? '_' : ''), ok: k > 1.35 });
      }
      if (k >= 1.7 && k < 2.4) {                                    // pienoiskuva lentää laatikkoon
        const u = (k - 1.7) / .7, e = u*u;
        const x = sx + 8 + (L.x + 4 - sx - 8)*e, y = sy + 2 + (L.y + 4 - sy - 2)*e - Math.sin(u*Math.PI)*6;
        kuva(tyyppi, x, y, .5);
        if (k > 2.33) sykahdys = 1;
      }
    });
  });

  // isolle kanvaasille
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const S = Math.min(W*.46, H*.84*LW/LH), Sh = S*LH/LW, x0 = W*.04, y0 = H*.93 - Sh, sk = S / LW;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lc, x0, y0, S, Sh);
  ctx.textBaseline = 'middle';
  // laatikon teksti
  ctx.textAlign = 'center'; ctx.fillStyle = '#B0CB40'; ctx.font = `700 ${Math.round(sk*2.6)}px Georgia, serif`;
  ctx.fillText('TEKOÄLY', x0 + (L.x + L.w/2)*sk, y0 + (L.y + L.h/2)*sk);
  // rivien nimet
  ctx.textAlign = 'left'; ctx.font = `italic ${Math.round(sk*2.4)}px Georgia, serif`;
  RIVIT.forEach((r, ri) => { if (t > ri*RIVI_VALI) { ctx.fillStyle = 'rgba(246,239,228,.85)'; ctx.fillText(r.nimi, x0 + 6*sk, y0 + (r.y - 11)*sk); } });
  // merkinnät
  ctx.textAlign = 'center'; ctx.font = `700 ${Math.round(sk*2.2)}px "Courier New", monospace`;
  for (const tx of tekstit) { ctx.fillStyle = tx.ok ? '#7CFC7C' : '#f6efe4'; ctx.fillText(tx.s + (tx.ok ? ' ✓' : ''), x0 + tx.x*sk, y0 + tx.y*sk); }
  raf = requestAnimationFrame(silmukka);
}

window.naytaOpetus = function(p){
  const paalle = !!(p && p.opetus);
  if (paalle === aktiivinen) return;
  aktiivinen = paalle; cancelAnimationFrame(raf);
  if (!paalle) { cv.style.opacity = 0; return; }
  alku = performance.now(); sykahdys = 0;
  cv.style.opacity = 1;
  raf = requestAnimationFrame(silmukka);
};
})();
