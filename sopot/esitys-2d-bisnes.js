// ============================================================================
// LIIKEMIES JA PUU (TF 15.10.2026, Jarno: "businessman.png, added axe to
// running, standing and cutting ... x:3300 running in screen, next entering
// x:3400 and cutting tree. businessman_tree.png, same effect as with
// beginning Gilgamesh cutting tree"). Googlen "best understanding of the law"
// -kohta: nykyajan Gilgamesh.
//
// businessman.png = 10 x 6 ruudukko, 128 x 128 kehykset. Rivit:
//   0 seisoo (6) · 1 kävelee (10) · 2 juoksee kirves (10) · 3 isku (4)
//   4 seisoo kirves ylhäällä (3) · 5 kaatuu (5)
// businessman_tree.png = puu + erillinen kanto oikeassa alakulmassa (kanto
// pyyhitään pois, puu jää). Iskut irrottavat latvuksesta sinisiä datapikseleitä
// kuten esitys-2d-setri.js:ssä.
//
// Käyttö esitys-data.js:ssä:
//   bisnes: 'juoksu' - juoksee vasemmalta puun viereen ja jää seisomaan
//   bisnes: 'hakkuu' - seisoo puun vieressä ja hakkaa (latvus muuttuu dataksi)
// Ruutuun sidottu kanvaasi tekstin alla (z 4), kuten setri-pikselit.
// ============================================================================
(function(){
'use strict';
const MIES = new Image(); MIES.src = 'assets/2d/sprites/businessman.png';
const PUU = new Image(); PUU.src = 'assets/2d/sprites/businessman_tree.png';
const K = 128;                                     // kehyksen koko
const RIVIT = { seisoo:[0,6,5], juoksee:[2,10,12], isku:[3,4,6], kirvesYlhaalla:[4,3,4] }; // [rivi, kehyksiä, fps]
const MIES_KORKEUS = 0.34;                         // kehyksen korkeus / ruudun korkeus
const PUU_KORKEUS = 0.66;
const MAA = 0.93;                                  // jalkojen taso (osuus ruudun korkeudesta)
const PUU_X = 0.62, MIES_LOPPU_X = 0.52;           // keskikohdat (osuus leveydestä)
const LATVA = 0.58, MAX_ISKUT = 30;

const cv = document.createElement('canvas');
cv.id = 'bisnes';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

// puun oma kanvaasi (latvus kuluu iskuista)
const pcv = document.createElement('canvas'), pctx = pcv.getContext('2d');
function puuAlusta(){
  pcv.width = PUU.naturalWidth; pcv.height = PUU.naturalHeight;
  pctx.clearRect(0, 0, pcv.width, pcv.height);
  pctx.drawImage(PUU, 0, 0);
  pctx.clearRect(pcv.width*0.63, pcv.height*0.78, pcv.width, pcv.height); // kanto pois
}

let aktiivinen = false, rafId = 0, tila = '', alkuT = 0, edT = 0;
let miesX = 0, edKehys = -1, iskut = 0, varina = 0, pikselit = [], kaatunut = false, polyt = [];

function puuRect(){
  const h = H*PUU_KORKEUS, w = h * pcv.width / pcv.height;
  return { x: W*PUU_X - w/2, y: H*MAA - h, w, h };
}

function isku(){
  varina = 1;
  if (iskut >= MAX_ISKUT) return;
  iskut++;
  const lh = Math.round(pcv.height*LATVA), data = pctx.getImageData(0, 0, pcv.width, lh).data;
  let x = 0, y = 0;
  for (let yritys = 0; yritys < 80; yritys++) {
    x = Math.floor(Math.random()*pcv.width); y = Math.floor(Math.random()*lh);
    if (data[(y*pcv.width + x)*4 + 3] > 100) break;
  }
  const r = puuRect(), kerroin = r.w / pcv.width, palat = 7 + Math.floor(Math.random()*5);
  pctx.save(); pctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < palat; i++) {
    const px = x + (Math.random()-.5)*120, py = y + (Math.random()-.5)*90, k = 18 + Math.random()*22;
    pctx.fillRect(px - k/2, py - k/2, k, k);
    pikselit.push({ x: r.x + px*kerroin, y: r.y + py*kerroin, vx: (Math.random()*.6 + .2)*H*.03, vy: -(Math.random()*.5 + .5)*H*.05,
      k: Math.max(3, k*kerroin*.8), ika: 0, kesto: 3 + Math.random()*2, vaihe: Math.random()*6 });
  }
  pctx.restore();
}

function piirraMies(liike, t, cx){
  const [rivi, n, fps] = RIVIT[liike], kehys = Math.floor(t*fps) % n;
  const s = H*MIES_KORKEUS;
  ctx.drawImage(MIES, kehys*K, rivi*K, K, K, cx - s/2, H*MAA - s*0.97, s, s);
  return kehys;
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms/1000, dt = Math.min(.05, t - edT || 0); edT = t;
  const ta = t - alkuT;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  ctx.imageSmoothingEnabled = false;
  // puu
  const r = puuRect();
  varina = Math.max(0, varina - dt*2.5);
  // kaatuu (15.10.2026, x:3500 "They didn't even ask"): puu kaatuu oikealle kiihtyen, pöly nousee
  let kaatoKulma = 0;
  if (tila === 'kaatuu') { const tk = Math.max(0, ta - 0.6); kaatoKulma = Math.min(Math.PI/2, 0.55 * tk * tk * 2.2);
    if (kaatoKulma >= Math.PI/2 && !kaatunut) { kaatunut = true; for (let i = 0; i < 40; i++) polyt.push({ x: r.x + r.w/2 + Math.random()*r.h, y: H*MAA, vx: (Math.random()-.5)*H*.2, vy: -Math.random()*H*.15, ika: 0, kesto: 1 + Math.random() }); } }
  ctx.save(); ctx.translate(r.x + r.w/2, r.y + r.h); ctx.rotate(Math.sin(t*28) * 0.02 * varina + kaatoKulma);
  ctx.drawImage(pcv, -r.w/2, -r.h, r.w, r.h); ctx.restore();
  // mies
  const loppu = W*MIES_LOPPU_X;
  if (tila === 'juoksu') {
    const nopeus = W*0.32;                           // px / s
    miesX = Math.min(loppu, -H*0.2 + ta*nopeus);
    piirraMies(miesX < loppu ? 'juoksee' : 'kirvesYlhaalla', ta, miesX);
  } else if (tila === 'kaatuu') {
    piirraMies('kirvesYlhaalla', ta, loppu);
    ctx.fillStyle = 'rgba(190,175,150,0.6)';
    polyt.forEach(d => { d.ika += dt; d.x += d.vx*dt; d.y += d.vy*dt; d.vy += H*0.2*dt; const a = 1 - d.ika/d.kesto; if (a > 0) { ctx.globalAlpha = a*0.7; ctx.fillRect(d.x - 4, d.y - 4, 8, 8); } });
    ctx.globalAlpha = 1;
  } else {
    const kehys = piirraMies('isku', ta, loppu);
    if (kehys !== edKehys) { if (kehys === 3 && edKehys !== -1) isku(); edKehys = kehys; }
  }
  // datapikselit (kuten setri)
  ctx.globalCompositeOperation = 'lighter';
  for (const p of pikselit) {
    p.ika += dt; p.x += (p.vx + Math.sin(p.ika*1.6 + p.vaihe)*H*.01)*dt; p.y += p.vy*dt; p.vy *= Math.exp(-.25*dt);
    const e = p.ika / p.kesto, a = (1 - e) * (.65 + .35*Math.sin(p.ika*9 + p.vaihe));
    ctx.fillStyle = `rgba(90,190,255,${(a*.35).toFixed(3)})`; ctx.fillRect(p.x - p.k, p.y - p.k, p.k*2, p.k*2);
    ctx.fillStyle = `rgba(170,230,255,${a.toFixed(3)})`; ctx.fillRect(p.x - p.k/2, p.y - p.k/2, p.k, p.k);
  }
  ctx.globalCompositeOperation = 'source-over';
  pikselit = pikselit.filter(p => p.ika < p.kesto);
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaBisnes = function(p){
  const uusi = p && p.bisnes;
  if (!uusi) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0; return;
  }
  if (!MIES.complete || !PUU.complete || !PUU.naturalWidth) { setTimeout(() => window.naytaBisnes(p), 200); return; }
  if (uusi === 'juoksu' || !aktiivinen) { puuAlusta(); iskut = 0; pikselit = []; }
  tila = uusi; alkuT = performance.now()/1000; edT = alkuT; edKehys = -1; kaatunut = false; polyt = [];
  aktiivinen = true; cv.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
