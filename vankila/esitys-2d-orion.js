// ============================================================================
// ORIONIN VYÖN TUHATVUOTINEN SOTA (11.10.2026, Mikkeli x:1500 "Kars Skywalker",
// Jarno: "kierrätys, algoritmikuplissa on avaruusalus ja laser, se?").
// Käyttö esitys-data.js:ssä: `orion: true`.
// Kierrätetty: ship-fly.png (sama alus kuin x:8940 kilpi) + punaiset
// pikseliammukset. Vasemmalla tähtitaivas ja Orionin vyön kolme tähteä; kaksi
// alusta kaartaa vastakkain ja ampuu, osumista pieniä välähdyksiä. Toistuu
// (8 s jakso), ei klikkauksia, ei ääniä. Tekstin alla (z 4).
// ============================================================================
(function(){
'use strict';
const ALUS = new Image(); ALUS.src = 'assets/2d/sprites/ship-fly.png';
const AF = 7, AW = 350, AH = 150, JAKSO = 8;
const cv = document.createElement('canvas');
cv.id = 'orion';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

const TAHDET = Array.from({length: 90}, (_, i) => { const s = Math.sin(i*91.7)*43758.5; const r = s - Math.floor(s); const s2 = Math.sin(i*17.3)*24634.6; const r2 = s2 - Math.floor(s2); return { x: r, y: r2*.8, v: (i % 5) / 5 }; });
// Orion: vyö (3) + Betelgeuse (punainen) + Rigel (sininen) + kaksi muuta kulmaa; alue = vasen puolisko
const ORION = [
  { x: .30, y: .34, r: 1.0, c: '#ffffff' }, { x: .35, y: .37, r: 1.0, c: '#ffffff' }, { x: .40, y: .40, r: 1.0, c: '#ffffff' },
  { x: .23, y: .14, r: .9, c: '#ff8a5c' }, { x: .48, y: .62, r: .9, c: '#9fc4ff' }, { x: .45, y: .16, r: .6, c: '#dfe8ff' }, { x: .22, y: .60, r: .6, c: '#dfe8ff' },
];

let aktiivinen = false, alku = 0, raf = 0, edT = 0, ammukset = [], valahdykset = [];
const rnd = (a, b) => a + Math.random()*(b - a);

function alus(i, k){
  // kaksi alusta kaartaa kahdeksikkoa vyön ympärillä vastakkaisiin suuntiin
  const vaihe = k / JAKSO * Math.PI*2 + i*Math.PI;
  const cx = W*.32, cy = H*.38, rx = W*.2, ry = H*.16;
  const x = cx + Math.sin(vaihe)*rx, y = cy + Math.sin(vaihe*2)*ry*.6 + (i ? H*.08 : -H*.04);
  const vx = Math.cos(vaihe);                                  // liikesuunta x
  return { x, y, oikealle: vx > 0 };
}

function silmukka(nyt){
  if (!aktiivinen) return;
  const t = (nyt - alku) / 1000, dt = Math.min(.05, (nyt - edT) / 1000); edT = nyt;
  const k = t % JAKSO;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  // tähtitaivas vasemmalla (pehmeä reuna oikealle)
  const gr = ctx.createLinearGradient(0, 0, W*.62, 0);
  gr.addColorStop(0, 'rgba(6,8,22,.78)'); gr.addColorStop(.8, 'rgba(6,8,22,.55)'); gr.addColorStop(1, 'rgba(6,8,22,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W*.62, H);
  // aukko Kars Skywalkerin kuvan kohdalle (kuva on Phaserissa tämän kanvaasin alla, ks. hahmot.js x:1500)
  ctx.save(); ctx.globalCompositeOperation = 'destination-out';
  const ax = W*.13, ay = H*.7, ag = ctx.createRadialGradient(ax, ay, 0, ax, ay, H*.42);
  ag.addColorStop(0, 'rgba(0,0,0,.9)'); ag.addColorStop(.6, 'rgba(0,0,0,.6)'); ag.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ag; ctx.fillRect(ax - H*.42, ay - H*.42, H*.84, H*.84); ctx.restore();
  for (const s of TAHDET) { const a = .35 + .4*Math.sin(t*2 + s.v*9); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(s.x*W*.6, s.y*H, 2, 2); }
  // Orion
  const p = Math.max(2, Math.round(H*.006));
  for (const o of ORION) {
    const x = o.x*W, y = o.y*H, r = o.r*p, hehku = 1 + .15*Math.sin(t*3 + o.x*20);
    const gg = ctx.createRadialGradient(x, y, 0, x, y, r*7*hehku);
    gg.addColorStop(0, o.c); gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg; ctx.globalAlpha = .55; ctx.fillRect(x - r*8, y - r*8, r*16, r*16); ctx.globalAlpha = 1;
    ctx.fillStyle = o.c; ctx.fillRect(x - r, y - r*3, r*2, r*6); ctx.fillRect(x - r*3, y - r, r*6, r*2);
  }
  ctx.font = `italic ${Math.round(H*.026)}px Georgia, serif`; ctx.fillStyle = 'rgba(246,239,228,.75)'; ctx.textAlign = 'center';
  ctx.fillText('Orionin vyö', W*.35, H*.47);

  // alukset + laukaukset
  for (let i = 0; i < 2; i++) {
    const A = alus(i, k);
    if (Math.random() < dt*2.2) ammukset.push({ x: A.x + (A.oikealle ? 1 : -1)*H*.06, y: A.y, vx: (A.oikealle ? 1 : -1)*W*.55, ika: 0, vari: i ? '#5cff7a' : '#ff3b2a' });
    if (ALUS.complete && ALUS.naturalWidth) {
      const ah = H*.085, aw = ah*AW/AH, f = Math.floor(t*8) % AF;
      ctx.save(); ctx.translate(A.x, A.y); if (!A.oikealle) ctx.scale(-1, 1);
      if (i) ctx.filter = 'hue-rotate(150deg) saturate(1.3)';
      ctx.drawImage(ALUS, f*AW, 0, AW, AH, -aw/2, -ah/2, aw, ah);
      ctx.restore(); ctx.filter = 'none';
    }
  }
  for (let j = ammukset.length - 1; j >= 0; j--) {
    const a = ammukset[j]; a.ika += dt; a.x += a.vx*dt;
    const q = H*.012;
    ctx.fillStyle = a.vari; ctx.globalAlpha = .35; ctx.fillRect(a.x - q*3, a.y - q, q*6, q*2); ctx.globalAlpha = 1;
    ctx.fillRect(a.x - q*2, a.y - q*.5, q*4, q);
    if (a.ika > .5 && Math.random() < .03) { valahdykset.push({ x: a.x, y: a.y, ika: 0 }); ammukset.splice(j, 1); continue; }
    if (a.x < -50 || a.x > W*.65) ammukset.splice(j, 1);
  }
  for (let j = valahdykset.length - 1; j >= 0; j--) {
    const v = valahdykset[j]; v.ika += dt; if (v.ika > .4) { valahdykset.splice(j, 1); continue; }
    const r = H*.03*(v.ika/.4)*2;
    ctx.fillStyle = `rgba(255,220,120,${1 - v.ika/.4})`;
    for (let n = 0; n < 8; n++) { const a = n*.785; ctx.fillRect(v.x + Math.cos(a)*r - 2, v.y + Math.sin(a)*r - 2, 4, 4); }
  }
  raf = requestAnimationFrame(silmukka);
}

window.naytaOrion = function(p){
  const paalle = !!(p && p.orion);
  if (paalle === aktiivinen) return;
  aktiivinen = paalle; cancelAnimationFrame(raf);
  if (!paalle) { cv.style.opacity = 0; return; }
  alku = edT = performance.now(); ammukset = []; valahdykset = [];
  cv.style.opacity = 1;
  raf = requestAnimationFrame(silmukka);
};
})();
