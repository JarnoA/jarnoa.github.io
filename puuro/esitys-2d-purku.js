// ============================================================================
// VALKOISEN TALON PURKU ELÄVÄKSI (2.10.2026, x:7740). Pieni ja hiljainen
// (Jarno: "1 could be ok"): kuvat/whouse.png on jo maailmassa - tämä lisää
// pölypilviä kaivinkoneiden kauhoille, irtoavia lohkareita seinistä ja maata
// pitkin ajelehtivaa pölyä telojen kohdalle. Kuvan paikka luetaan Phaserista
// joka ruudussa (parallaksi); pisteet kuvan osuuksina (mitattu 2.10.2026).
// Trump-kuva (kiintea, keskellä edessä) jätetään vapaaksi.
// Käyttö esitys-data.js:ssä: `purku: true`.
// ============================================================================
(function(){
'use strict';
const KUVA = 'kuvat/whouse.png';
const KAUHAT = [{ x: .28, y: .55 }, { x: .76, y: .47 }];        // kauhat seinässä
const SEINAT = [{ x: .31, y: .5 }, { x: .73, y: .43 }];         // tästä irtoaa lohkareita
const TELAT = [{ x: .19, y: .7 }, { x: .84, y: .7 }];           // maapöly

const cv = document.createElement('canvas');
cv.id = 'purku';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', koko); koko();

let aktiivinen = false, rafId = 0, edellinen = 0, polyt = [], lohkareet = [], ajastimet = [0, 1.3, .6];

function kuva(){
  const sc = window.__paaKohtaus; if (!sc || !sc.kuvahahmot) return null;
  const kh = sc.kuvahahmot.find(k => k.h.kuva === KUVA); if (!kh || !kh.img.visible) return null;
  const cam = sc.cameras.main, b = kh.img.getBounds(), sk = W / sc.scale.width;
  return { x: (b.x - cam.scrollX * kh.img.scrollFactorX) * sk, y: (b.y - cam.scrollY * kh.img.scrollFactorY) * sk, w: b.width * sk, h: b.height * sk };
}

function piirra(dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const k = kuva(); if (!k) return;
  const P = (p) => [k.x + k.w*p.x, k.y + k.h*p.y];
  const s = k.h * .02;

  // kauhan isku -> pölypilvi + lohkareita (kauhat vuorotellen ~2.5 s välein)
  ajastimet[0] -= dt; ajastimet[1] -= dt;
  KAUHAT.forEach((kau, i) => {
    if (ajastimet[i] > 0) return;
    ajastimet[i] = 2.2 + Math.random()*1.2;
    const [x, y] = P(kau);
    for (let j=0;j<13;j++) polyt.push({ x: x + (Math.random()-.5)*s*2, y: y + (Math.random()-.5)*s, vx: (Math.random()-.5)*s*2.5, vy: -s*(.5 + Math.random()), r: s*(.8 + Math.random()*.9), ika: 0, kesto: 2.2 + Math.random(), a: .7 });
    const [lx, ly] = P(SEINAT[i]);
    for (let j=0;j<5;j++) lohkareet.push({ x: lx + (Math.random()-.5)*s*3, y: ly, vx: (Math.random()-.5)*s*3, vy: -s*Math.random()*2, koko: s*(.25 + Math.random()*.35), kierto: Math.random()*6, maa: k.y + k.h*.7, ika: 0 });
  });
  // telojen kohdalla jatkuva matala pöly
  ajastimet[2] -= dt;
  if (ajastimet[2] <= 0) { ajastimet[2] = .25;
    for (const t of TELAT) { const [x, y] = P(t); polyt.push({ x: x + (Math.random()-.5)*s*4, y, vx: (t.x < .5 ? 1 : -1) * s*(.8 + Math.random()), vy: -s*.15, r: s*(.9 + Math.random()), ika: 0, kesto: 3, a: .38 }); } }

  for (const p of polyt) {
    p.ika += dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vx *= .99; p.r += s*.6*dt;
    const e = p.ika / p.kesto, a = p.a * Math.sin(Math.PI * Math.min(1, e*1.2)) * (1 - e*.3);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); g.addColorStop(0, `rgba(150,130,112,${a})`); g.addColorStop(1, 'rgba(150,130,112,0)');   // tummempi kuin taivas -> erottuu
    ctx.fillStyle = g; ctx.fillRect(p.x - p.r, p.y - p.r, p.r*2, p.r*2);
  }
  polyt = polyt.filter(p => p.ika < p.kesto);
  for (const l of lohkareet) {
    l.ika += dt; l.vy += s*30*dt; l.x += l.vx*dt; l.y += l.vy*dt; l.kierto += dt*4;
    if (l.y > l.maa) { l.y = l.maa; l.vy *= -.25; l.vx *= .5; }
    ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.kierto); ctx.fillStyle = '#e8e2d6'; ctx.fillRect(-l.koko/2, -l.koko/2, l.koko, l.koko); ctx.strokeStyle = 'rgba(60,50,45,.6)'; ctx.lineWidth = 1; ctx.strokeRect(-l.koko/2, -l.koko/2, l.koko, l.koko);
    ctx.fillStyle = '#a69d8c'; ctx.fillRect(-l.koko/2, l.koko*.1, l.koko, l.koko*.4); ctx.restore();
  }
  lohkareet = lohkareet.filter(l => l.ika < 2.5);
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  piirra(dt);
  rafId = requestAnimationFrame(silmukka);
}

window.naytaPurku = function(p){
  if (!(p && p.purku)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); polyt = []; lohkareet = []; ajastimet = [.6, 1.9, 0];
  aktiivinen = true; cv.style.opacity = 1; edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
