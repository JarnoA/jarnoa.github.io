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
// Oulu 10.11.2026 (Jarno: "ok"): vaaleat ruudut (aineisto: vastapuhetta ja
// empatiaa 16 %). Kaksi kertaa puhelimesta nousee vaalea ruutu (❤️ / 💬),
// joka ehtii hetken rivin tyhjään kohtaan, mutta seuraava tumma ruutu
// työntää sen pois: se kallistuu, putoaa ja häipyy. Ei tekstiä.
// 10.11.2026 myöh. (Jarno: "menevät liian nopeasti pois… voisivat jäädä taustalle"):
// työnnetty ruutu ei putoa vaan siirtyy rivin taakse pienempänä ja himmeänä ja jää sinne.
// ============================================================================
(function(){
'use strict';
const RUUDUT = [[.0135, .245], [.269, .483], [.507, .721], [.744, .9685]];
const LAHDOT = [1.2, 2.6, 4.0, 5.4], LENTO = 1.0;       // s: pyyhkäisyn hetket, lennon kesto
// vaaleat ruudut: [lähtöhetki, rivipaikka, emoji]; työntyvät pois kun saman paikan tumma ruutu saapuu
const VAALEAT = [[1.6, 1, '❤️'], [4.4, 3, '💬']];

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
  // vaaleat ruudut: nousevat, ehtivät hetken riviin, tumma ruutu työntää pois
  VAALEAT.forEach(([lahto, paikka, emoji]) => {
    const e = Math.min(1, Math.max(0, (t - lahto) / LENTO)); if (e <= 0) return;
    const [x0, x1] = RUUDUT[paikka], tw = mw * (x1 - x0), tx = mx + mw*x0 + tw/2, ty = my + mh/2;
    const tyonto = LAHDOT[paikka] + LENTO * .85;              // tumma ruutu on melkein perillä
    const u = Math.min(1, Math.max(0, (t - tyonto) / 1.4)), uu = u*u*(3 - 2*u);
    const ee = 1 - Math.pow(1 - e, 3), sk = .12 + .88*ee;
    let x = puhelin.x + (tx - puhelin.x)*ee, y = puhelin.y + (ty - puhelin.y)*ee - Math.sin(Math.PI*e)*H*.12, kulma = (1 - ee) * -.4;
    // työnnetään rivin taakse: ylös, puoliväliin seuraavaan rakoon, pienemmäksi ja himmeäksi, ja jää sinne
    let koko = 1;
    if (u > 0) { x += uu * tw * (paikka === 3 ? -.5 : .5); y -= uu * mh * .42; kulma += uu * (paikka === 1 ? -.18 : .14); koko = 1 - uu * .3; }
    ctx.save(); ctx.globalAlpha = 1 - uu * .4; ctx.translate(x, y); ctx.rotate(kulma); ctx.scale(koko, koko);
    const w = tw*sk*.94, h = mh*sk*.96, rr = w*.08;
    ctx.shadowColor = 'rgba(255,255,255,.7)'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.roundRect(-w/2, -h/2, w, h, rr); ctx.fillStyle = '#fbf6ee'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.roundRect(-w*.42, -h*.4, w*.84, h*.55, rr*.6); ctx.fillStyle = paikka === 1 ? '#f7d6d9' : '#d6e8f7'; ctx.fill();
    ctx.font = `${Math.round(w*.42)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(emoji, 0, -h*.12);
    ctx.fillStyle = '#d9d2c6'; ctx.fillRect(-w*.38, h*.24, w*.6, h*.035); ctx.fillRect(-w*.38, h*.31, w*.4, h*.035);
    ctx.restore();
  });
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
