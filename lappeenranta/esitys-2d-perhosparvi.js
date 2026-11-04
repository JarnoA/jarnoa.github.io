// ============================================================================
// PERHOSPARVI (TF 15.10.2026, Jarno: "on last page come more and more of
// them? Not filling the screen, but nicely"). Viimeisellä sivulla x:5300
// perhosia ilmestyy yksi kerrallaan ruudun reunoilta ja ne leijailevat
// pehmeästi - määrä kasvaa hitaasti kattoon asti (ei täytä ruutua).
// Sama pikselimuoto kuin moottorin ambienssiperhosella (5x3, siivet auki/kiinni).
// Käyttö esitys-data.js:ssä: `perhosparvi: true`.
// ============================================================================
(function(){
'use strict';
const MAX = 10;                 // katto: ei täytä ruutua
const VALI_S = 2.6;             // uusi perhonen n. näin usein (s)
const ALKU = 3;                 // heti alussa näin monta
const VARIT = ['#f2e6a0', '#ffd27a', '#b8d8ff', '#ffffff', '#f6c6e0'];
const AUKI = ['XX.XX', 'XXXXX', '.X.X.'], KIINNI = ['..X..', '..X..', '..X..'];

const cv = document.createElement('canvas');
cv.id = 'perhosparvi';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity 1.2s ease;';
const ctx = cv.getContext('2d');
function liita(){ document.body.appendChild(cv); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

let perhoset = [], aktiivinen = false, rafId = 0, edT = 0, seuraava = 0;

function uusi(t){
  const vasemmalta = Math.random() < 0.5;
  perhoset.push({
    x: vasemmalta ? -20 : W + 20,
    y: H * (0.35 + Math.random() * 0.45),
    vx: (vasemmalta ? 1 : -1) * (12 + Math.random() * 18),     // px/s, rauhallinen
    vaihe: Math.random() * 6.28, aalto: 0.6 + Math.random() * 0.8,
    koko: Math.max(3, Math.round(H * (0.005 + Math.random() * 0.003))),
    vari: VARIT[Math.floor(Math.random() * VARIT.length)],
    lepatus: 6 + Math.random() * 4, syntyi: t,
  });
}

function piirra(p, auki){
  const m = auki ? AUKI : KIINNI, k = p.koko;
  ctx.fillStyle = p.vari;
  for (let y = 0; y < 3; y++) for (let x = 0; x < 5; x++)
    if (m[y][x] === 'X') ctx.fillRect(Math.round(p.x + (x - 2) * k), Math.round(p.y + (y - 1) * k), k, k);
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms / 1000, dt = Math.min(0.05, t - edT || 0); edT = t;
  if (t >= seuraava && perhoset.length < MAX) { uusi(t); seuraava = t + VALI_S * (0.6 + Math.random() * 0.8); }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  for (const p of perhoset) {
    p.x += p.vx * dt;
    p.y += Math.sin(t * p.aalto + p.vaihe) * H * 0.018 * dt;            // pehmeä aaltoilu
    if (p.y < H * 0.25) p.y += H * 0.02 * dt; if (p.y > H * 0.85) p.y -= H * 0.02 * dt;
    if (p.x < -40) { p.x = -40; p.vx = Math.abs(p.vx); }              // kääntyy takaisin reunalta
    if (p.x > W + 40) { p.x = W + 40; p.vx = -Math.abs(p.vx); }
    ctx.globalAlpha = Math.min(1, (t - p.syntyi) / 1.5) * 0.9;
    piirra(p, Math.sin(t * p.lepatus + p.vaihe) > -0.2);
  }
  ctx.globalAlpha = 1;
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaPerhosparvi = function(p){
  if (p && p.perhosparvi) {
    if (!aktiivinen) {
      perhoset = []; const t = performance.now() / 1000;
      for (let i = 0; i < ALKU; i++) uusi(t);
      perhoset.forEach(b => { b.x = W * (0.15 + Math.random() * 0.7); });
      seuraava = t + VALI_S;
    }
    aktiivinen = true; cv.style.opacity = 1;
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
    return;
  }
  if (!aktiivinen) return;
  aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
};
})();
