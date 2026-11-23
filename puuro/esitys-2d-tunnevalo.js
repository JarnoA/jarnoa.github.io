// ============================================================================
// TUNNE-PERHONEN (28.10.2026, x:8190 "Tunne tavoittaa meidät ennen kuin
// ymmärrys."). Ensin tehty "kaksi valoa kilpaa" oli Jarnon mukaan vaikeaselkoinen
// -> Jarno: "otsikosta lähtee punainen perhonen, 'tunne'-keijukainen, leijailee
// guideen, joka säpsähtää".
//
// Kulku: otsikon kohdalta irtoaa punainen, hehkuva pikseliperhonen (sama 5x3-muoto
// kuin perhosparvessa, isompana) ja kipinävana perässä. Se leijailee kaarella
// oppaan luo, opas säpsähtää (pieni hyppy), perhonen jää lepattamaan oppaan pään
// ylle. Ei tekstiä.
//
// Käyttö esitys-data.js:ssä: `tunnevalo: true`.
// ============================================================================
(function(){
'use strict';
const PUNA = '#ff3b4a', HEHKU = 'rgba(255,70,80,.9)';
const AUKI = ['XX.XX', 'XXXXX', '.X.X.'], KIINNI = ['X...X', '.X.X.', '..X..'];   // 28.10: kiinni = V, ei pystyviivaa
const T_IRTOAA = .5, LENTO = 2.6;                 // s

const cv = document.createElement('canvas');
cv.id = 'tunnevalo';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:6;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

function opas(){
  const sc = window.__paaKohtaus; if (!sc || !sc.hahmo || !sc.hahmo.visible) return null;
  const o = sc.hahmo, cam = sc.cameras.main, kx = W / sc.scale.width, ky = H / sc.scale.height, b = o.getBounds();
  return { x: (b.centerX - cam.scrollX*(o.scrollFactorX ?? 1)) * kx, ala: (b.bottom - cam.scrollY*(o.scrollFactorY ?? 1)) * ky };
}
function otsikko(){
  const el = document.querySelector('#teksti .otsikko'); if (!el) return null;
  const r = el.getBoundingClientRect(); return r.width ? { x: r.left + r.width*.5, y: r.top + r.height*.55 } : null;
}

const sstep = u => u <= 0 ? 0 : u >= 1 ? 1 : u*u*(3 - 2*u);
let aktiivinen = false, raf = 0, t0 = 0, alku = null, sapsahti = false, kipinat = [], edT = 0;

function perhonen(x, y, k, auki, alpha){
  const m = auki ? AUKI : KIINNI;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.shadowColor = HEHKU; ctx.shadowBlur = k*3;
  ctx.fillStyle = PUNA;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++)
    if (m[r][c] === 'X') ctx.fillRect(Math.round(x + (c - 2)*k - k/2), Math.round(y + (r - 1)*k - k/2), k, k);
  ctx.restore();
}

// opas säpsähtää: nopea pieni hyppy ylös ja takaisin (ei riipu oppaan animaationimistä)
function sapsahda(){
  const sc = window.__paaKohtaus; if (!sc || !sc.hahmo || !sc.tweens) return;
  const o = sc.hahmo, y0 = o.y;
  sc.tweens.add({ targets: o, y: y0 - o.displayHeight*.18, duration: 110, ease: 'Quad.easeOut', yoyo: true, onComplete: () => { o.y = y0; } });
}

function kehys(nyt){
  if (!aktiivinen) return;
  raf = requestAnimationFrame(kehys);
  const t = (nyt - t0) / 1000, dt = Math.min(.05, t - edT); edT = t;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  const o = opas() || { x: W*.42, ala: H*.9 };
  if (!alku) alku = otsikko() || { x: W*.5, y: H*.3 };
  // 28.10 Jarno: perhonen alemmas, koskettaa opasta. Mitataan jaloista ylöspäin, koska spritekehyksen
  // yläosassa on tyhjää (getBounds().top on paljon hahmon yläpuolella).
  const loppu = { x: o.x + H*.02, y: o.ala - H*.13 };
  const k = Math.max(4, Math.round(H*.011));
  if (t < T_IRTOAA) return;

  const u = sstep((t - T_IRTOAA) / LENTO);
  // leijaileva kaari: sivuttaiskeinunta ja pieni nousu ennen laskeutumista
  let x = alku.x + (loppu.x - alku.x)*u + Math.sin(u*Math.PI*3)*W*.05*(1 - u);
  let y = alku.y + (loppu.y - alku.y)*u - Math.sin(u*Math.PI)*H*.08;
  if (u >= 1) { x += Math.sin(t*2.1)*H*.012; y += Math.sin(t*3.3)*H*.008; }   // lepattaa paikallaan
  if (u >= 1 && !sapsahti) { sapsahti = true; sapsahda(); }

  if (u < 1 && Math.random() < .7) kipinat.push({ x, y, ika: 0, vx: (Math.random() - .5)*H*.03, vy: (Math.random() - .2)*H*.03 });
  kipinat = kipinat.filter(s => (s.ika += dt) < .9);
  for (const s of kipinat) {
    s.x += s.vx*dt; s.y += s.vy*dt;
    ctx.fillStyle = `rgba(255,${120 + Math.round(100*(1 - s.ika))},120,${.8*(1 - s.ika/.9)})`;
    ctx.fillRect(s.x, s.y, Math.max(2, k*.4), Math.max(2, k*.4));
  }
  const ilmesty = Math.min(1, (t - T_IRTOAA)*3);
  perhonen(x, y, Math.round(k*(.6 + .4*ilmesty)), Math.sin(t*(u < 1 ? 14 : 9)) > -.2, ilmesty);
}

window.naytaTunnevalo = function(p){
  if (p && p.tunnevalo) {
    if (aktiivinen) return;
    koko(); aktiivinen = true; t0 = performance.now(); edT = 0; alku = null; sapsahti = false; kipinat = [];
    cv.style.opacity = 1; cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
  } else if (aktiivinen) {
    aktiivinen = false; cv.style.opacity = 0;
    setTimeout(() => { if (!aktiivinen) { cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); } }, 550);
  }
};
})();
