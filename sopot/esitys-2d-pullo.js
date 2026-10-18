// ============================================================================
// VESIPULLO (TF 15.10.2026, Jarno: "huge water/coke bottle next to guide on
// right, water filled, maybe label 500 ml = 50 prompts. It can look like
// Coke, but of course not Coca Cola"). x:1625 'Me: "1/2 liter = 50 prompts"'.
// Yleinen limsapullo pikselityylinä: punainen etiketti, EI Coca-Colan
// muotopulloa (kaareva "contour"-muoto on tavaramerkki), EI logoa/fonttia.
// Pullo piirretään pieneen kanvaasiin ja skaalataan isoksi ilman pehmennystä.
// Vesi nousee pohjalta täyteen, pinnassa pieni aalto, kuplia nousee.
// Käyttö esitys-data.js:ssä: `pullo: true`.
// ============================================================================
(function(){
'use strict';
const ETIKETTI = ['500 ml', '= 50 prompts'];
const PW = 36, PH = 100;               // pikselikanvaasin koko (pullo)
const KORKEUS = 0.58;                  // pullon korkeus / ruudun korkeus
const KESKI_X = 0.70, MAA = 0.93;      // paikka: oikealla oppaasta, pohja maassa
const TAYTTO_S = 2.2;                  // täyttymisen kesto

const cv = document.createElement('canvas');
cv.id = 'pullo';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
const pcv = document.createElement('canvas'); pcv.width = PW; pcv.height = PH;
const pctx = pcv.getContext('2d');
function liita(){ document.body.appendChild(cv); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

// pullon leveys rivillä y (pikseleinä): korkki, kaula, olkapää, runko
function leveys(y){
  if (y < 6) return 10;                       // korkki
  if (y < 22) return 10;                      // kaula
  if (y < 34) return 10 + Math.round((y - 22) / 12 * 20); // olkapää levenee
  if (y < PH - 3) return 30;                  // runko
  return 28;                                  // pohjan pyöristys
}
const SISA_ALKU = 8;                          // veden yläraja (kaulan alku)
let kuplat = [], aktiivinen = false, rafId = 0, alkuT = 0, edT = 0;

function piirraPullo(t, tayttoOsuus){
  pctx.clearRect(0, 0, PW, PH);
  const pohja = PH - 1, ylin = SISA_ALKU;
  const pinta = Math.round(pohja - (pohja - ylin) * tayttoOsuus);
  for (let y = 0; y < PH; y++) {
    const w = leveys(y), x0 = Math.round((PW - w) / 2);
    if (y < 6) { pctx.fillStyle = '#c8202c'; pctx.fillRect(x0, y, w, 1); continue; }        // punainen korkki
    // vesi + ilma
    const aalto = Math.round(Math.sin(t*3 + y*0.3) * 0.6);
    const vedessa = y >= pinta + aalto;
    pctx.fillStyle = vedessa ? (y === pinta ? '#bfe9ff' : '#4fb6ec') : 'rgba(210,235,255,0.18)';
    pctx.fillRect(x0 + 1, y, w - 2, 1);
    // lasin reunat + kiilto
    pctx.fillStyle = 'rgba(230,245,255,0.9)'; pctx.fillRect(x0, y, 1, 1); pctx.fillRect(x0 + w - 1, y, 1, 1);
    if (y > 24 && y < PH - 6) { pctx.fillStyle = 'rgba(255,255,255,0.55)'; pctx.fillRect(x0 + 3, y, 1, 1); }
  }
  // etiketti (punainen nauha rungossa)
  const ey = 50, eh = 26, ex = Math.round((PW - 30) / 2);
  pctx.fillStyle = '#d42a2f'; pctx.fillRect(ex, ey, 30, eh);
  pctx.fillStyle = '#ffffff'; pctx.fillRect(ex, ey + 2, 30, 1); pctx.fillRect(ex, ey + eh - 3, 30, 1);
  // kuplat
  pctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (const k of kuplat) if (k.y > pinta + 1) pctx.fillRect(Math.round(k.x), Math.round(k.y), 1, 1);
  return { ey, eh };
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms/1000, dt = Math.min(.05, t - edT || 0); edT = t;
  const osuus = Math.min(1, (t - alkuT) / TAYTTO_S), helpotus = 1 - Math.pow(1 - osuus, 3);
  if (Math.random() < 0.25) kuplat.push({ x: 4 + Math.random()*(PW - 8), y: PH - 3, v: 6 + Math.random()*8 });
  kuplat.forEach(k => { k.y -= k.v*dt; k.x += Math.sin(t*4 + k.v)*0.05; });
  kuplat = kuplat.filter(k => k.y > SISA_ALKU + 2);
  const { ey, eh } = piirraPullo(t, helpotus);
  // skaalataan ruudulle pikseliterävänä
  const h = H*KORKEUS, s = h / PH, w = PW * s, x = W*KESKI_X - w/2, y = H*MAA - h;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(pcv, x, y, w, h);
  // etikettiteksti täydellä resoluutiolla, pikselifontin henkeen
  const kx = x + w/2, fy = y + (ey + eh/2) * s;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f2c94c';
  ctx.font = `800 ${Math.round(s*6.2)}px "Courier New",monospace`;
  ctx.fillText(ETIKETTI[0], kx, fy - s*4.2);
  ctx.font = `700 ${Math.round(s*4.4)}px "Courier New",monospace`;
  ctx.fillText(ETIKETTI[1], kx, fy + s*4.6);
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaPullo = function(p){
  if (p && p.pullo) {
    if (!aktiivinen) { alkuT = performance.now()/1000; kuplat = []; }
    aktiivinen = true; cv.style.opacity = 1;
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
    return;
  }
  if (!aktiivinen) return;
  aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
};
})();
