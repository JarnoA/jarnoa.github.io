// ============================================================================
// PALANTIR-FINAALI (2.10.2026, x:7890 - Palantir, Mithril, Lembas, Anduril,
// Valar ... Peter Thiel). Osion "Digitaaliset oligarkit" huipennus.
// Käyttö esitys-data.js:ssä: `palantir: true`.
//
//  - näkökivi (lasipallo, sisällä tuli ja Sauronin-tyylinen silmä) lepää suoraan
//    linnan korkeimman tornin huipulla, ilman jalustaa (Jarno 2.10.2026)
//  - silmä seuraa ohi kulkevaa Saattuetta (YLITYSHAHMOT-spritet, luetaan Phaserista)
//  - jokaisen yritysnimen ilmestyessä pallo sykähtää (ei tekstiä pallossa - Jarno)
//  - viimeisellä rivillä (Peter Thiel) pallo leimahtaa punaiseksi ja silmä
//    kääntyy suoraan yleisöön
// Rivit paljastuvat moottorissa itsestään 1.8 s välein (.leipa-rivi.nakyy) -
// tämä seuraa niitä DOMista. Teksti on oikealla korttina; pallo vasemmalla.
// ============================================================================
(function(){
'use strict';
// Jarno 2.10.2026: näkökivi linnan korkeimman tornin huipulle, kaukana (pieni); ei tekstiä pallossa.
const LINNA = '9-castle.png', LINNA_X = 7890, TORNI = { x: .433, y: .354 };   // tornin huippu linnakuvan osuuksina (mitattu)

const cv = document.createElement('canvas');
cv.id = 'palantir';
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

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;
let nahdyt = 0, nimi = null, thiel = -1, savu = [], katse = { x: 0, y: 0 };

function hehku(x, y, r, rgb, a){ const g = ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(${rgb},${a})`); g.addColorStop(1,`rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(x-r,y-r,2*r,2*r); }

function saattueenKeskipiste(){
  const sc = window.__paaKohtaus; if (!sc || !sc.ylitykset) return null;
  const nak = sc.ylitykset.filter(yl => yl.aktiivinen && yl.img.visible && yl.img.x > -50 && yl.img.x < sc.scale.width + 50);
  if (!nak.length) return null;
  const sk = W / sc.scale.width;
  return { x: nak.reduce((s, yl) => s + yl.img.x, 0) / nak.length * sk, y: nak.reduce((s, yl) => s + yl.img.y, 0) / nak.length * sk - H*.05 };
}

function piirra(t, dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  // Jarno 2.10.2026: "just eye, top of tower, simpler, x2" - pelkkä tulinen silmä tornin huipulla
  const sc = window.__paaKohtaus, kh = sc && sc.kuvahahmot && sc.kuvahahmot.find(k => k.h.kuva && k.h.kuva.includes(LINNA) && k.h.x === LINNA_X);
  let cx = W*.68, cy = H*.42, R = H*.06;
  if (kh && kh.img.visible) { const cam = sc.cameras.main, b = kh.img.getBounds(), sk = W / sc.scale.width;
    const lx = (b.x - cam.scrollX * kh.img.scrollFactorX) * sk, ly = (b.y - cam.scrollY * kh.img.scrollFactorY) * sk;
    R = b.height * sk * .064; cx = lx + b.width*sk*TORNI.x; cy = ly + b.height*sk*TORNI.y - R*.55; }
  const herää = Math.min(1, Math.max(0, t / 1.6));

  // uudet rivit: sykähdys; viimeinen = Peter Thiel
  const rivit = document.querySelectorAll('#teksti .leipa-rivi');
  const nakyvat = document.querySelectorAll('#teksti .leipa-rivi.nakyy').length;
  if (nakyvat > nahdyt) { nahdyt = nakyvat; nimi = { alku: t }; if (nakyvat === rivit.length) thiel = t; }
  const punainen = thiel >= 0 ? Math.min(1, (t - thiel) / .6) : 0;
  const tuli = punainen > 0 ? `255,${Math.round(110 - 80*punainen)},${Math.round(40 - 20*punainen)}` : '255,140,40';
  const syke = nimi ? Math.max(0, .6 - (t - nimi.alku)) : 0;

  ctx.save(); ctx.globalAlpha = herää;
  // Jarno 2.10.2026: lasipallo takaisin (x2), suoraan tornin päällä ILMAN jalustaa
  const pR = R * .9, py = cy - pR*.15;
  ctx.globalCompositeOperation = 'lighter';
  hehku(cx, py, pR*(2.6 + 1.6*syke), tuli, .28 + .12*Math.sin(t*2) + .35*punainen + syke);
  ctx.globalCompositeOperation = 'source-over';
  const g = ctx.createRadialGradient(cx - pR*.3, py - pR*.35, pR*.1, cx, py, pR);
  g.addColorStop(0, '#3a2f4a'); g.addColorStop(.6, '#140f1c'); g.addColorStop(1, '#07050a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, py, pR, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, py, pR*.97, 0, 7); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  for (let i=0;i<5;i++){ const k = t*(.8 + i*.25) + i*1.3, r = pR*(.25 + i*.13);
    ctx.strokeStyle = `rgba(${tuli},${.28 - i*.035})`; ctx.lineWidth = pR*.09; ctx.beginPath(); ctx.arc(cx, py, r, k, k + 2.2); ctx.stroke(); }
  // silmä pallon sisällä: seuraa Saattuetta, Thielillä suoraan yleisöön
  const kohde = saattueenKeskipiste();
  let tx = 0, ty = 0;
  if (punainen === 0 && kohde) { const dx = kohde.x - cx, dy = kohde.y - py, d = Math.hypot(dx, dy) || 1; tx = dx/d * pR*.28; ty = dy/d * pR*.18; }
  katse.x += (tx - katse.x) * Math.min(1, dt*3); katse.y += (ty - katse.y) * Math.min(1, dt*3);
  const ex = cx + katse.x, ey = py + katse.y, auki = Math.min(1, Math.max(0, (t - .8) / .8));
  const ew = pR*(.55 + .1*punainen), eh = pR*(.22 + .12*punainen) * auki;
  if (auki > 0) {
    hehku(ex, ey, ew*1.4, tuli, .7);
    const ig = ctx.createRadialGradient(ex, ey, 0, ex, ey, ew);
    ig.addColorStop(0, 'rgba(255,240,180,1)'); ig.addColorStop(.35, `rgba(${tuli},.95)`); ig.addColorStop(1, `rgba(${tuli},0)`);
    ctx.fillStyle = ig; ctx.beginPath(); ctx.ellipse(ex, ey, ew, Math.max(1, eh), 0, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0a0406'; ctx.beginPath(); ctx.ellipse(ex, ey, pR*(.045 + .02*punainen), Math.max(1, eh*.95), 0, 0, 7); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(cx - pR*.35, py - pR*.45, pR*.32, pR*.16, -.6, 0, 7); ctx.fill();
  ctx.strokeStyle = `rgba(${tuli},${.35 + .4*punainen})`; ctx.lineWidth = Math.max(1.5, pR*.025); ctx.beginPath(); ctx.arc(cx, py, pR, 0, 7); ctx.stroke();
  ctx.restore();
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t, dt);
  rafId = requestAnimationFrame(silmukka);
}

window.naytaPalantir = function(p){
  if (!(p && p.palantir)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); nahdyt = 0; nimi = null; thiel = -1; savu = []; katse = { x: 0, y: 0 };
  aktiivinen = true; cv.style.opacity = 1;
  alku = performance.now(); edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
