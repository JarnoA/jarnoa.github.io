// ============================================================================
// KARSIN VALOMIEKKA (11.10.2026, Mikkeli x:1450 "Jediritari varoittaa", Jarno:
// "kun terminator tulee kohdalle, Karsin lasermiekka säkenöisi").
// Käyttö esitys-data.js:ssä: `jedimiekka: true` (yhdessä hahmot.js:n
// jedikars.png-kiintea-kuvan kanssa samalla x:llä).
// Miekan terä (mitattu jedikars.png:stä) hehkuu hiljaa koko ajan. Kun T-800
// (YLITYSHAHMOT, sama x) kävelee lähelle, terä leimahtaa kirkkaaksi, väreilee
// ja siitä sinkoaa kipinöitä. Paikat luetaan Phaserista joka kehys.
// Ei ääniä. Tekstin alla (z 4).
// ============================================================================
(function(){
'use strict';
const KUVA = 'kuvat/jedikars.png';
const TERA = { kx: .696, ky: .079, tx: .654, ty: .50 };      // kärki ja kahvan pää, kuvan osuuksina
const cv = document.createElement('canvas');
cv.id = 'jedimiekka';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();
const rnd = (a, b) => a + Math.random()*(b - a);

let aktiivinen = false, xNyt = null, raf = 0, edT = 0, kipinat = [], leimahdus = 0;

function paikat(){
  const sc = window.__scene || window.__paaKohtaus; if (!sc) return null;
  const r = sc.game.canvas.getBoundingClientRect(), sk = r.width / sc.scale.width;
  const kk = (sc.kiinteatKuvat || []).find(k => k.h.kuva === KUVA && k.h.x === xNyt); if (!kk) return null;
  const img = kk.img, w = img.displayWidth*sk, h = img.displayHeight*sk;
  const vasen = r.left + img.x*sk - img.originX*w, yla = r.top + img.y*sk - img.originY*h;
  const kp = { x: vasen + TERA.kx*w, y: yla + TERA.ky*h }, tp = { x: vasen + TERA.tx*w, y: yla + TERA.ty*h };
  let robo = null;
  const yl = (sc.ylitykset || []).find(y => y.h.x === xNyt && /t800/.test(y.h.spritesheet || ''));
  if (yl && yl.img && yl.img.visible) robo = r.left + (yl.img.x - sc.cameras.main.scrollX*(yl.img.scrollFactorX ?? 1))*sk;
  return { kp, tp, robo, alpha: img.alpha, leveys: w };
}

function silmukka(nyt){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (nyt - edT)/1000); edT = nyt;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const P = paikat();
  if (P && P.alpha > .05) {
    const lahella = P.robo != null ? Math.max(0, 1 - Math.abs(P.robo - P.tp.x) / (W*.28)) : 0;
    leimahdus += ((lahella > 0 ? .3 + .7*lahella : 0) - leimahdus) * Math.min(1, dt*6);
    const vari = 1 + .15*Math.sin(nyt/40), voima = (.25 + leimahdus*.75) * vari * P.alpha;
    // hehku terän ympärillä (kerroksittain, additiivinen)
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const [lev, a, c] of [[P.leveys*.16, .10, '120,180,255'], [P.leveys*.08, .22, '170,210,255'], [P.leveys*.03, .55, '235,245,255']]) {
      ctx.strokeStyle = `rgba(${c},${a*voima})`; ctx.lineWidth = lev*(.7 + leimahdus*.6);
      ctx.beginPath(); ctx.moveTo(P.tp.x, P.tp.y); ctx.lineTo(P.kp.x, P.kp.y); ctx.stroke();
    }
    ctx.restore();
    // kipinät kun robotti on lähellä
    if (leimahdus > .35 && Math.random() < leimahdus*.9) {
      const u = Math.random();
      kipinat.push({ x: P.tp.x + (P.kp.x - P.tp.x)*u, y: P.tp.y + (P.kp.y - P.tp.y)*u, vx: rnd(-220, 220), vy: rnd(-260, 60), ika: 0, kesto: rnd(.25, .6) });
    }
  } else leimahdus = 0;
  for (let i = kipinat.length - 1; i >= 0; i--) {
    const k = kipinat[i]; k.ika += dt; if (k.ika > k.kesto) { kipinat.splice(i, 1); continue; }
    k.vy += 600*dt; k.x += k.vx*dt; k.y += k.vy*dt;
    const u = k.ika/k.kesto, s = Math.max(2, H*.004)*(1 - u*.6);
    ctx.fillStyle = u < .4 ? '#ffffff' : u < .7 ? '#bfe0ff' : '#7fb0ff';
    ctx.fillRect(k.x - s/2, k.y - s/2, s, s);
  }
  raf = requestAnimationFrame(silmukka);
}

window.naytaJedimiekka = function(p){
  const paalle = !!(p && p.jedimiekka);
  xNyt = paalle ? p.x : null;
  if (paalle === aktiivinen) return;
  aktiivinen = paalle; cancelAnimationFrame(raf);
  if (!paalle) { cv.style.opacity = 0; kipinat = []; return; }
  edT = performance.now(); leimahdus = 0;
  cv.style.opacity = 1;
  raf = requestAnimationFrame(silmukka);
};
})();
