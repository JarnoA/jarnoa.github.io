// ============================================================================
// EIFFEL-KASA (TF 15.10.2026, Jarno: "By 2030, AI's... build eiffel tower pile
// on left, far back"). Montaasin rivi x:1965: pienet, usvaiset pikseli-
// Eiffel-tornit putoavat ruudun vasempaan laitaan yksi kerrallaan, yhä
// nopeammin, ja kasautuvat romukasaksi - kaukana taustalla (pieni, haalea).
// Käyttö esitys-data.js:ssä: `eiffel: true`.
// ============================================================================
(function(){
'use strict';
// 11 x 24 pikselin torni (X = runko)
const TORNI = [
  '.....X.....', '.....X.....', '....XXX....', '....XXX....', '....X.X....', '....XXX....',
  '....X.X....', '...XXXXX...', '...X.X.X...', '...XX.XX...', '...X...X...', '..XXXXXXX..',
  '..X.X.X.X..', '..XX...XX..', '..X.....X..', '.XXXXXXXXX.', '.X.X...X.X.', '.XX.....XX.',
  '.X.......X.', 'XX.......XX', 'X..XXXXX..X', 'X.X.....X.X', 'XX.......XX', 'X.........X',
];
const TW = 11, TH = 24;
const VARI = 'rgba(150,162,190,1)', ALPHA = 0.7;     // usvainen, kaukana
const KOKO = 0.13;                                   // tornin korkeus / ruudun korkeus
const ALUE = [0.03, 0.30], MAA = 0.88;               // kasan leveys (osuus) ja pohja
const MAX = 40;

const tcv = document.createElement('canvas'); tcv.width = TW; tcv.height = TH;
const tctx = tcv.getContext('2d'); tctx.fillStyle = VARI;
TORNI.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'X') tctx.fillRect(x, y, 1, 1); }));

const cv = document.createElement('canvas');
cv.id = 'eiffel';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
function liita(){ document.body.appendChild(cv); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

let tornit = [], kasa = [], aktiivinen = false, rafId = 0, alkuT = 0, edT = 0, seuraava = 0, luotu = 0;
const SOLUT = 40;                                    // kasan korkeuskartta
function kasanKorkeus(x){ const i = Math.max(0, Math.min(SOLUT - 1, Math.floor((x - W*ALUE[0]) / (W*(ALUE[1]-ALUE[0])) * SOLUT))); return kasa[i]; }
function lisaaKasaan(x, pituus, paksuus){
  const a = W*ALUE[0], b = W*ALUE[1];
  for (let i = 0; i < SOLUT; i++) {
    const cx = a + (i + 0.5) / SOLUT * (b - a);
    const d = Math.abs(cx - x) / (pituus / 2);
    if (d < 1) kasa[i] += paksuus * (1 - d*d);
  }
}

function uusi(){
  const h = H*KOKO;
  tornit.push({ x: W*(ALUE[0] + 0.03 + Math.random()*(ALUE[1] - ALUE[0] - 0.06)), y: -h, vy: 0,
    kulma: (Math.random() - 0.5) * 0.6, pyorii: (Math.random() - 0.5) * 3,
    lopKulma: (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random() * 0.5), lepaa: false, h });
  luotu++;
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms/1000, dt = Math.min(0.05, t - edT || 0); edT = t;
  const kulunut = t - alkuT;
  if (t >= seuraava && luotu < MAX) { uusi(); seuraava = t + Math.max(0.08, 0.55 - kulunut*0.09); } // kiihtyy
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  ctx.imageSmoothingEnabled = false; ctx.globalAlpha = ALPHA;
  for (const tr of tornit) {
    if (!tr.lepaa) {
      tr.vy += H*2.2*dt; tr.y += tr.vy*dt; tr.kulma += tr.pyorii*dt;
      const pinta = H*MAA - kasanKorkeus(tr.x) - tr.h*0.12;
      if (tr.y >= pinta) { tr.y = pinta; tr.lepaa = true; tr.kulma = tr.lopKulma; lisaaKasaan(tr.x, tr.h*0.9, tr.h*0.16); }
    }
    const w = tr.h * TW / TH;
    ctx.save(); ctx.translate(tr.x, tr.y); ctx.rotate(tr.kulma);
    ctx.drawImage(tcv, -w/2, -tr.h/2, w, tr.h); ctx.restore();
  }
  ctx.globalAlpha = 1;
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaEiffel = function(p){
  if (p && p.eiffel) {
    tornit = []; kasa = new Array(SOLUT).fill(0); luotu = 0;
    alkuT = performance.now()/1000; edT = alkuT; seuraava = alkuT + 0.2;
    aktiivinen = true; cv.style.opacity = 1;
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
    return;
  }
  if (!aktiivinen) return;
  aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
};
})();
