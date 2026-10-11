// ============================================================================
// LIIMAA PITSAAN (11.10.2026, Mikkeli x:6170 "Liimaa pitsaan – kone ei tiedä,
// mikä on vitsi"). Käyttö esitys-data.js:ssä: `pitsa: true`.
// Etenee tekstirivien tahdissa (2,2 s välein), kerran, jää lopputilaan:
//   0.0  pitsa lautasella, juusto lipsuu reunan yli (kysymys)
//   2.2  liimapullo kallistuu ja pursottaa valkoista liimaa kastikkeeseen,
//        juusto pysähtyy (vastaus)
//   4.4  kolme pientä kiveä putoaa pitsan päälle (geologit suosittelevat)
//   6.6  punainen leima: VITSI (lähde: Reddit-vitsi, satiirisivusto)
// Pikselitaide 64x64, vasen puoli ruutua (teksti oikealla), tekstin alla (z 4).
// Ei ääniä, ei klikkauksia.
// ============================================================================
(function(){
'use strict';
const R = 64, V = 1.2;   // 11.10: rivit nopeutettu 2,2 → 1,2 s
const cv = document.createElement('canvas');
cv.id = 'pitsa';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .4s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
const lc = document.createElement('canvas'); lc.width = R; lc.height = R;
const g = lc.getContext('2d');
let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();
const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
function ympyra(cx, cy, r, c, ry){ ry = ry || r; for (let y = -ry; y <= ry; y++) { const w = Math.round(Math.sqrt(Math.max(0, 1 - (y*y)/(ry*ry))) * r); px(cx - w, cy + y, w*2 + 1, 1, c); } }
const JUUSTO = [[-8,-3],[-2,-6],[5,-4],[-6,3],[1,1],[7,3],[-1,6],[4,8]];
const KIVET = [[-5,-1],[3,-5],[6,4]];

let aktiivinen = false, alku = 0, raf = 0;
function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku) / 1000;
  g.clearRect(0, 0, R, R);
  const cx = 30, cy = 44;
  // lautanen + pitsa (soikio = perspektiivi)
  ympyra(cx, cy + 2, 25, '#cfd2d8', 9); ympyra(cx, cy + 1, 23, '#e9ecf1', 8);
  ympyra(cx, cy, 19, '#d9a05b', 7); ympyra(cx, cy, 16, '#c0392b', 6);
  for (const [x, y] of JUUSTO) px(cx + x*1.6, cy + y*.6, 4, 2, '#f2d06b');
  // juusto lipsuu (ennen liimaa)
  const liimaAlku = V;
  if (t < liimaAlku + .6) {
    const u = (t % 1.6) / 1.6;
    px(cx + 12 + u*9, cy - 1 + u*u*10, 5, 2, '#f2d06b');
  } else px(cx + 13, cy - 1, 5, 2, '#f2d06b');                     // jäi paikalleen, liimattuna
  // liima: valkoiset juovat kastikkeessa
  if (t > liimaAlku + .4) {
    const e = Math.min(1, (t - liimaAlku - .4) / 1.2);
    for (let i = 0; i < Math.floor(e*22); i++) { const a = i*.55; px(cx + Math.cos(a)*(4 + i*.55), cy + Math.sin(a)*(1.5 + i*.2), 2, 1, '#ffffff'); }
  }
  // liimapullo
  if (t > liimaAlku && t < liimaAlku*2 + .4) {
    const sisaan = Math.min(1, (t - liimaAlku) / .4), ulos = Math.max(0, (t - liimaAlku*2) / .4);
    const bx = 44 + (1 - sisaan)*20 + ulos*20, by = 8;
    px(bx, by + 4, 9, 14, '#f4f4f8'); px(bx + 1, by + 7, 7, 5, '#f2a03a');    // runko + etiketti
    px(bx + 3, by, 3, 4, '#f2a03a'); px(bx + 4, by - 2, 1, 2, '#f2a03a');     // korkki
    if (sisaan >= 1 && ulos === 0) for (let i = 0; i < 6; i++) px(bx + 4 - i*1.6, by + 18 + i*2.6, 1, 2, '#ffffff');   // valuva liima
  }
  // kivet putoavat
  const kiviAlku = V*2;
  KIVET.forEach(([kx, ky], i) => {
    const kt = t - kiviAlku - i*.3; if (kt < 0) return;
    const pudotus = Math.min(1, kt / .5), pomppu = kt > .5 && kt < .8 ? Math.sin((kt - .5)/.3*Math.PI)*2 : 0;
    const y = (cy + ky*.6) - (1 - pudotus)*40 - pomppu;
    px(cx + kx*1.6, y, 4, 3, '#8c8c96'); px(cx + kx*1.6, y, 4, 1, '#b4b4bd'); px(cx + kx*1.6 + 3, y + 1, 1, 2, '#5e5e66');
  });

  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const S = Math.min(H*.62, W*.42), x0 = W*.04, y0 = H*.93 - S, sk = S / R;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lc, x0, y0, S, S);
  // 11.10 Jarno: LIIMA-teksti ja VITSI-leima pois
  raf = requestAnimationFrame(silmukka);
}

window.naytaPitsa = function(p){
  const paalle = !!(p && p.pitsa);
  if (paalle === aktiivinen) return;
  aktiivinen = paalle; cancelAnimationFrame(raf);
  if (!paalle) { cv.style.opacity = 0; return; }
  alku = performance.now();
  cv.style.opacity = 1;
  raf = requestAnimationFrame(silmukka);
};
})();
