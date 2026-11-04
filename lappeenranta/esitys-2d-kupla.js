// ============================================================================
// ELIAKSEN SYÖTE (2.10.2026, x:8509 - Elias, 14 v. ja TikTokin manosfääri).
// Käyttö esitys-data.js:ssä: `kaikukammio: true` (EI `kupla` - se on moottorin
// vanha saippuakupla-ominaisuus).
//
// Jarnon idea: Elias (kuvat/eliaspixel.png + eliaspixel2.png = sormi ylhäällä)
// istuu maassa ja selaa; jokaisella pyyhkäisyllä yksi Jarnon oikeista
// puhelinruuduista (kuvat/mano.png, neljä ruutua rivissä) nousee hänen
// puhelimestaan ja asettuu paikalleen riviin - lopuksi koko mano.png on koossa
// samalla paikalla kuin ennen (keskellä, korkeus 0.5 * min(W,H)).
// Ruutujen rajat mitattu kuvasta (alfa-sarakkeet) 2.10.2026.
// ============================================================================
(function(){
'use strict';
const RUUDUT = [[.0135, .245], [.269, .483], [.507, .721], [.744, .9685]];
const LAHDOT = [1.2, 2.6, 4.0, 5.4], LENTO = 1.0;       // s: pyyhkäisyn hetket, lennon kesto

function lataa(src, putsaa){ const im = new Image(); const c = document.createElement('canvas');
  im.onload = () => { c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    if (putsaa) { const d = g.getImageData(0, 0, c.width, c.height); for (let i=3;i<d.data.length;i+=4) if (d.data[i] < 70) d.data[i] = 0; g.putImageData(d, 0, 0); }
    c.valmis = true; };
  im.src = src; return c; }
const kuvaA = lataa('kuvat/eliaspixel.png', true), kuvaB = lataa('kuvat/eliaspixel2.png', true), mano = lataa('kuvat/mano.png', false);

const cv = document.createElement('canvas');
cv.id = 'kaikukammio';
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

let aktiivinen = false, rafId = 0, alku = 0;

function piirra(t){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  if (!kuvaA.valmis || !kuvaB.valmis || !mano.valmis) return;
  const a = Math.min(1, t / .6);
  // Elias vasemmalla maassa
  const eh = H*.34, ew = eh * kuvaA.width / kuvaA.height, ex = W*.15, ey = H*.95;
  const puhelin = { x: ex + ew*.17, y: ey - eh*.38 };
  const pyyhkii = LAHDOT.some(l => t > l - .35 && t < l + .1) || (t > 7 && (t % 2.4) < .3);
  ctx.save(); ctx.globalAlpha = a; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(pyyhkii ? kuvaB : kuvaA, ex - ew/2, ey - eh, ew, eh); ctx.restore();
  const pg = ctx.createRadialGradient(puhelin.x, puhelin.y, 0, puhelin.x, puhelin.y, eh*.25);
  pg.addColorStop(0, `rgba(130,200,255,${.35*a})`); pg.addColorStop(1, 'rgba(130,200,255,0)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = pg; ctx.fillRect(puhelin.x - eh*.25, puhelin.y - eh*.25, eh*.5, eh*.5); ctx.restore();

  // ruudut nousevat puhelimesta ja asettuvat riviin (mano.png:n alkuperäinen paikka)
  const mh = Math.min(W, H) * .5, mw = mh * mano.width / mano.height, mx = W/2 - mw/2, my = H/2 - mh/2;
  ctx.imageSmoothingEnabled = true;
  RUUDUT.forEach(([x0, x1], i) => {
    const e = Math.min(1, Math.max(0, (t - LAHDOT[i]) / LENTO)); if (e <= 0) return;
    const ee = 1 - Math.pow(1 - e, 3);
    const tw = mw * (x1 - x0), tx = mx + mw*x0 + tw/2, ty = my + mh/2;
    const sk = .12 + .88*ee, x = puhelin.x + (tx - puhelin.x)*ee, y = puhelin.y + (ty - puhelin.y)*ee - Math.sin(Math.PI*e)*H*.12;
    ctx.save(); ctx.translate(x, y); ctx.rotate((1 - ee) * -.4);
    if (e < 1) { ctx.shadowColor = 'rgba(130,200,255,.8)'; ctx.shadowBlur = 20*(1 - ee); }
    ctx.drawImage(mano, mano.width*x0, 0, mano.width*(x1 - x0), mano.height, -tw*sk/2, -mh*sk/2, tw*sk, mh*sk);
    ctx.restore();
  });
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t);
  rafId = requestAnimationFrame(silmukka);
}

window.naytaKaikukammio = function(p){
  if (!(p && p.kaikukammio)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); aktiivinen = true; cv.style.opacity = 1; alku = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
