// ============================================================================
// LASERSKATERIN VAUHTI (11.10.2026, Mikkeli x:12210, Jarno valitsi vaihtoehdon 1).
// Käyttö esitys-data.js:ssä: `laservauhti: true`.
// Kun laserskater.png kiitää sisään (kiintea-kuva, liukuSuunta 'vasen'), sen
// perässä viuhuvat vauhtiviivat, luistinten alta sinkoaa kipinöitä ja
// pysähtyessä nousee pölypilvi. Kuvan paikka luetaan Phaserista joka kehys,
// joten efekti seuraa kuvaa myös ikkunan koon muuttuessa. Ei ääniä.
// Tekstin alla (z 4).
// ============================================================================
(function(){
'use strict';
const cv = document.createElement('canvas');
cv.id = 'laservauhti';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .3s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();
const rnd = (a, b) => a + Math.random()*(b - a);

let aktiivinen = false, raf = 0, alku = 0, edT = 0, edX = null, kipinat = [], polyt = [], viivat = [], pysahtyi = false, liikeAlku = -1;

function kuvanPaikka(){
  const sc = window.__scene || window.__paaKohtaus; if (!sc || !sc.kiinteatKuvat) return null;
  const kk = sc.kiinteatKuvat.find(k => k.h.kuva === 'kuvat/laserskater.png'); if (!kk) return null;
  const r = sc.game.canvas.getBoundingClientRect(), sk = r.width / sc.scale.width, img = kk.img;
  const h = img.displayHeight*sk, w = img.displayWidth*sk;
  const keskiX = r.left + img.x*sk + (0.5 - img.originX)*w;           // kuvan keskikohta
  const jalat = r.top + img.y*sk;                                        // origin y = näkyvä alareuna
  return { x: keskiX, jalat, korkeus: h*.77, alpha: img.alpha };
}

function silmukka(nyt){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (nyt - edT)/1000); edT = nyt;
  const t = (nyt - alku)/1000;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const K = kuvanPaikka();
  if (K) {
    const v = edX == null ? 0 : (K.x - edX)/Math.max(dt, .001);          // px/s, + = oikealle
    edX = K.x;
    const vauhti = Math.abs(v);
    if (liikeAlku < 0 && vauhti > W*.25) liikeAlku = t;                    // liuku alkoi (kuvalla voi olla liukuViive)
    // vauhtiviivat kuvan takana (liikesuunnan vastakkaisella puolella)
    if (vauhti > W*.25) for (let i = 0; i < 3; i++) viivat.push({ x: K.x - Math.sign(v)*K.korkeus*.12, y: K.jalat - rnd(.1, .95)*K.korkeus, l: Math.min(W*.35, vauhti*.18)*rnd(.5, 1), s: -Math.sign(v), ika: 0 });
    // kipinät luistinten alta
    if (vauhti > W*.08 && liikeAlku >= 0 && t - liikeAlku < 1.6) for (let i = 0; i < 4; i++) kipinat.push({ x: K.x + rnd(-1, 1)*K.korkeus*.06, y: K.jalat - 2, vx: -Math.sign(v)*rnd(.2, .7)*vauhti*.5 + rnd(-40, 40), vy: -rnd(60, 260), ika: 0, kesto: rnd(.3, .7) });
    // pysähdys: pölypilvi kerran
    if (!pysahtyi && liikeAlku >= 0 && t - liikeAlku > .35 && vauhti < W*.05) {
      pysahtyi = true;
      for (let i = 0; i < 14; i++) polyt.push({ x: K.x + rnd(-1, 1)*K.korkeus*.18, y: K.jalat - rnd(0, 8), vx: rnd(-90, 90), vy: -rnd(10, 50), r: K.korkeus*rnd(.03, .07), ika: 0, kesto: rnd(.8, 1.4) });
    }
  }
  // piirto
  ctx.lineCap = 'round';
  for (let i = viivat.length - 1; i >= 0; i--) {
    const l = viivat[i]; l.ika += dt; if (l.ika > .35) { viivat.splice(i, 1); continue; }
    ctx.strokeStyle = `rgba(255,255,255,${.7*(1 - l.ika/.35)})`; ctx.lineWidth = Math.max(2, H*.004);
    ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x + l.s*l.l, l.y); ctx.stroke();
  }
  for (let i = kipinat.length - 1; i >= 0; i--) {
    const k = kipinat[i]; k.ika += dt; if (k.ika > k.kesto) { kipinat.splice(i, 1); continue; }
    k.vy += 700*dt; k.x += k.vx*dt; k.y += k.vy*dt;
    const u = k.ika/k.kesto, s = Math.max(2, H*.005)*(1 - u*.5);
    ctx.fillStyle = u < .4 ? '#fff6c2' : u < .7 ? '#f2c94c' : '#ff7a2a';
    ctx.fillRect(k.x - s/2, k.y - s/2, s, s);
  }
  for (let i = polyt.length - 1; i >= 0; i--) {
    const p = polyt[i]; p.ika += dt; if (p.ika > p.kesto) { polyt.splice(i, 1); continue; }
    p.x += p.vx*dt; p.y += p.vy*dt; p.vx *= .97;
    const u = p.ika/p.kesto, r = p.r*(1 + u*1.8);
    ctx.fillStyle = `rgba(190,180,165,${.45*(1 - u)})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2); ctx.fill();
  }
  if (liikeAlku >= 0 && t - liikeAlku > 4 && !viivat.length && !kipinat.length && !polyt.length) { ctx.clearRect(0,0,W,H); return; }   // efekti ohi, odotetaan seuraavaa saapumista
  raf = requestAnimationFrame(silmukka);
}

window.naytaLaservauhti = function(p){
  const paalle = !!(p && p.laservauhti);
  if (paalle === aktiivinen) return;
  aktiivinen = paalle; cancelAnimationFrame(raf);
  if (!paalle) { cv.style.opacity = 0; return; }
  alku = edT = performance.now(); edX = null; kipinat = []; polyt = []; viivat = []; pysahtyi = false; liikeAlku = -1;
  cv.style.opacity = 1;
  raf = requestAnimationFrame(silmukka);
};
})();
