// ============================================================================
// KISSOISTA LAAMOIHIN (8.10.2026, Jämsä x:9165 "Miten koulutat oman
// algoritmisi?"). Jarno: "ensin kissoja paljon ... tarvitsee useamman toiston
// että näkee laamoja, ei kissoja".
// Käyttö esitys-data.js:ssä: `laamat: true`. Teksti oikealla, ruudukko vasemmalla.
//  - alussa syöte on täynnä kissoja
//  - rivit 1-3 (katso / ohita / seuraa): jokaisesta tulee VAIN yksi laama
//  - rivi 4 (toista tarpeeksi): laamoja alkaa tulla yhä nopeammin, kunnes
//    syöte on laamoja - yksi laatikkokissa jää (algoritmi ei unohda kokonaan)
// Spritet: assets/CatPackFree (Idle, drculacat, Box3; 32x32 kehykset) ja
// assets/Just_a_Llama (Sethey, vapaa käyttö; stand 18x21, Llama_jump 21x21 x8).
// ============================================================================
(function(){
'use strict';
const SARAKKEET = 5, RIVIT = 4;
const AJASTIN = [2.2, 4.2, 6.2];          // s, rivien 1-3 laamat ilman rivi-DOMia
const KIIHDYTYS = 8.2;                    // s, rivi 4 ilman rivi-DOMia

const kuva = src => { const i = new Image(); i.src = src; return i; };
const KISSAT = [
  { img: kuva('assets/CatPackFree/Idle.png'), w: 32, h: 32, n: 10, fps: 8 },
  { img: kuva('assets/CatPackFree/drculacat.png'), w: 32, h: 32, n: 6, fps: 6 },
  { img: kuva('assets/CatPackFree/Box3.png'), w: 32, h: 32, n: 4, fps: 5 },
];
const LAAMA_SEISOO = { img: kuva('assets/Just_a_Llama/llama_stand.png'), w: 18, h: 21 };
const LAAMA_HYPPY = { img: kuva('assets/Just_a_Llama/Llama_jump.png'), w: 21, h: 21, n: 8, fps: 12 };

const cv = document.createElement('canvas');
cv.id = 'laamat';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1, alue;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
  alue = { x: W*.04, y: H*.24, w: W*.44, h: H*.62 };
}
addEventListener('resize', koko); koko();

let aktiivinen = false, rafId = 0, alku = 0, solut = [], laamoja = 0, kiihtyyAlkaen = null, seuraavaLaama = 0, hiukkaset = [];

function alusta(){
  solut = [];
  for (let r = 0; r < RIVIT; r++) for (let c = 0; c < SARAKKEET; c++)
    solut.push({ c, r, kissa: KISSAT[(r*SARAKKEET + c) % 3 === 2 && Math.random() < .5 ? 2 : Math.random() < .3 ? 1 : 0], vaihe: Math.random()*10, laama: null });
  // yksi laatikkokissa jää loppuun asti
  solut[SARAKKEET*RIVIT - 1].kissa = KISSAT[2]; solut[SARAKKEET*RIVIT - 1].viimeinen = true;
  laamoja = 0; kiihtyyAlkaen = null; seuraavaLaama = 0; hiukkaset = [];
}

function vaihdaLaamaksi(t){
  const vapaat = solut.filter(s => !s.laama && !s.viimeinen);
  if (!vapaat.length) return;
  const s = vapaat[Math.floor(Math.random()*vapaat.length)];
  s.laama = { alkoi: t, seuraavaHyppy: t + 2 + Math.random()*4 };
  laamoja++;
  const { x, y, k } = solunPaikka(s);
  for (let i = 0; i < 10; i++) hiukkaset.push({ x, y: y - k*.4, vx: (Math.random()-.5)*k*3, vy: (Math.random()-.8)*k*3, ika: 0 });
}

function solunPaikka(s){
  const cw = alue.w / SARAKKEET, ch = alue.h / RIVIT, k = Math.min(cw, ch) * .82;
  return { x: alue.x + cw*(s.c + .5), y: alue.y + ch*(s.r + 1) - ch*.08, k };
}

function piirraKehys(sp, f, x, y, korkeus){
  const sk = korkeus / sp.h, w = sp.w * sk;
  ctx.drawImage(sp.img, f*sp.w, 0, sp.w, sp.h, Math.round(x - w/2), Math.round(y - korkeus), Math.round(w), Math.round(korkeus));
}

// rivi-DOM: rivi i (1..3) näkyy -> yksi laama; rivi 4 -> kiihdytys
let riviTehty = [];
function tarkistaRivit(t){
  const rivit = document.querySelectorAll('#teksti .leipa-rivi');
  const nakyy = i => rivit.length ? (rivit[i] && rivit[i].classList.contains('nakyy')) : (i < 3 ? t >= AJASTIN[i] : t >= KIIHDYTYS);
  for (let i = 1; i <= 2; i++) if (!riviTehty[i] && nakyy(i)) { riviTehty[i] = true; vaihdaLaamaksi(t); }
  if (!riviTehty[0] && nakyy(0) && t > 1.2) { riviTehty[0] = true; vaihdaLaamaksi(t); }
  if (kiihtyyAlkaen == null && nakyy(3)) { kiihtyyAlkaen = t; seuraavaLaama = t + .9; }
}

function piirra(t, dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  ctx.imageSmoothingEnabled = false;
  tarkistaRivit(t);
  if (kiihtyyAlkaen != null && t >= seuraavaLaama) {      // väli lyhenee: 0.9 s -> 0.12 s
    vaihdaLaamaksi(t);
    seuraavaLaama = t + Math.max(.12, .9 * Math.pow(.8, laamoja - 3));
  }
  for (const s of solut) {
    const { x, y, k } = solunPaikka(s);
    if (s.laama) {
      const e = Math.min(1, (t - s.laama.alkoi) / .35), kissaPois = Math.max(0, 1 - e*2), laamaSisaan = Math.max(0, e*2 - 1);
      if (kissaPois > 0) piirraKehys(s.kissa, Math.floor((t + s.vaihe) * s.kissa.fps) % s.kissa.n, x, y, k * kissaPois);
      if (laamaSisaan > 0) {
        const hyppy = t >= s.laama.seuraavaHyppy ? (t - s.laama.seuraavaHyppy) * LAAMA_HYPPY.fps : -1;
        const kk = k * .78 * (laamaSisaan < 1 ? 1 + Math.sin(laamaSisaan*Math.PI)*.25 : 1) * laamaSisaan;
        if (hyppy >= 0 && hyppy < LAAMA_HYPPY.n) piirraKehys(LAAMA_HYPPY, Math.floor(hyppy), x, y, kk);
        else {
          if (hyppy >= LAAMA_HYPPY.n) s.laama.seuraavaHyppy = t + 2 + Math.random()*4;
          piirraKehys(LAAMA_SEISOO, 0, x, y, kk);
        }
      }
    } else {
      piirraKehys(s.kissa, Math.floor((t + s.vaihe) * s.kissa.fps) % s.kissa.n, x, y, k);
    }
  }
  // pöllähdys vaihdossa
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (const h of hiukkaset) {
    h.ika += dt; h.x += h.vx*dt; h.y += h.vy*dt; h.vx *= .9; h.vy *= .9;
    const a = 1 - h.ika/.5; if (a <= 0) continue;
    const r = Math.max(2, H*.006) * a; ctx.globalAlpha = a; ctx.fillRect(h.x - r/2, h.y - r/2, r, r);
  }
  ctx.globalAlpha = 1;
  hiukkaset = hiukkaset.filter(h => h.ika < .5);
}

let edellinen = 0;
function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  piirra((ms - alku)/1000, dt);
  rafId = requestAnimationFrame(silmukka);
}

window.naytaLaamat = function(p){
  if (!(p && p.laamat)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); alusta(); riviTehty = [];
  aktiivinen = true; alku = performance.now(); edellinen = alku; cv.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
