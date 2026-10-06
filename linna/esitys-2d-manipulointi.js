// ============================================================================
// MANIPULOINTI / JAKAUTUMINEN (2.10.2026, x:7440, Neil Lawrence: "manipulointi on
// jo todellisuutta. Tämä näkyy yhteiskunnan kasvavana jakautumisena.")
// Käyttö esitys-data.js:ssä: `manipulointi: true`.
//
// Jatkaa x:7290:n satelliittiparvea + marionettilangat maisemaan. Jakautuminen
// köydenvetona (Jarnon idea 2.10.2026, railo hylätty "näyttää kannolta"):
// kaksi isompaa satelliittia laskeutuu oppaan ylle - sininen vasemmalle, punainen
// oikealle - ja kumpikin säteilee oppaan itseensä. Opas (kettu/T-rex/hevonen/pupu,
// Phaserin oikea sprite) nousee ilmaan ja heiluu puolelta toiselle, säteet
// törmäävät kipinöinä, katkeavat ja opas putoaa maahan pomppaisten. Toistuu.
// Oppaan y/kulma palautetaan aina pysähdykseltä lähdettäessä.
// ============================================================================
(function(){
'use strict';
const VARI = '127,216,255', SININEN = '90,160,255', PUNAINEN = '255,90,80';
const JAKSO = 7;                            // s, yksi köydenveto

const cv = document.createElement('canvas');
cv.id = 'manipulointi';
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

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0, kipinat = [];
let opas = null;                            // { hahmo, perusY, perusKulma }
const N = 30;

function satelliitti(i, t){
  const tr = i % 3, tk = i/N*Math.PI*2 + t*(.06 + tr*.015) + 1.2;
  return { x: W*.5 + Math.cos(tk)*W*(.55 + tr*.06), y: H*(.16 + tr*.035) + Math.sin(tk)*H*(.08 + tr*.02), z: Math.sin(tk) };
}
function piirraSat(x, y, k, paneeli){
  ctx.fillStyle = '#1a2233'; ctx.fillRect(x - k*.45, y - k*.45, k*.9, k*.9);
  ctx.fillStyle = paneeli; ctx.fillRect(x - k*1.9, y - k*.25, k*1.3, k*.5); ctx.fillRect(x + k*.6, y - k*.25, k*1.3, k*.5);
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x - k*1.9, y - k*.25, k*1.3, k*.1); ctx.fillRect(x + k*.6, y - k*.25, k*1.3, k*.1);
}
function hehku(x, y, r, rgb, a){ const g = ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(${rgb},${a})`); g.addColorStop(1,`rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(x-r,y-r,2*r,2*r); }

function piirra(t, dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const a = Math.min(1, t / .6), sc = window.__paaKohtaus, h = sc && sc.hahmo;

  // satelliittiparvi + marionettilangat maisemaan
  const langat = Math.min(1, Math.max(0, (t - .5) / 1.5));
  for (let i=0;i<N;i++){
    const s = satelliitti(i, t), k = Math.max(3, H*.009) * (s.z < 0 ? .75 : 1);
    if (i % 3 === 0 && langat > 0) {
      const ax = (i * .137 % 1) * W, ay = H * (.72 + (i % 4) * .05);
      const lx = s.x + (ax - s.x) * langat, ly = s.y + (ay - s.y) * langat;
      ctx.strokeStyle = `rgba(${VARI},.45)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.quadraticCurveTo((s.x + lx)/2, (s.y + ly)/2 + H*.04, lx, ly); ctx.stroke();
    }
    ctx.globalAlpha = a; hehku(s.x, s.y, k*2.2, VARI, .4); piirraSat(s.x, s.y, k, '#3d8fe0'); ctx.globalAlpha = 1;
  }
  if (!h || !opas) return;

  // köydenveto: kaksi isoa satelliittia oppaan yllä
  const cam = sc.cameras.main, sk = W / sc.scale.width;
  const ox = (h.x - cam.scrollX) * sk, maaY = opas.perusY * sk;
  const e = t - 1.2, sykli = e > 0 ? e % JAKSO : -1;
  const laskeutuu = Math.min(1, Math.max(0, (t - .3) / 1.2)), K = Math.max(5, H*.02);
  const satY = H*.06 + (H*.36 - H*.06) * (1 - Math.pow(1 - laskeutuu, 3)) + Math.sin(t*1.7)*H*.008;
  const vasen = { x: ox - W*.17, y: satY, rgb: SININEN, paneeli: '#3d7fe0' }, oikea = { x: ox + W*.17, y: satY + Math.sin(t*1.3)*H*.008, rgb: PUNAINEN, paneeli: '#e0503d' };

  // vaiheet: 0-.6 säteet syttyvät, .6-3.6 nousu + heilunta, 3.6-4.2 törmäys, 4.2- putoaminen
  let nousu = 0, heilu = 0, sateet = 0, tormays = 0;
  if (sykli >= 0) {
    sateet = sykli < .6 ? sykli/.6 : (sykli < 4.2 ? 1 : 0);
    if (sykli > .6 && sykli < 4.2) nousu = Math.min(1, (sykli - .6) / 1.6);
    if (sykli > .9 && sykli < 4.2) heilu = Math.sin((sykli - .9) * 3.4) * Math.min(1, (sykli - .9));
    if (sykli > 3.6 && sykli < 4.2) tormays = Math.sin(Math.PI * (sykli - 3.6) / .6);
  }
  // putoaminen + pieni pomppu
  let pudotus = 0;
  if (sykli >= 4.2) { const p = sykli - 4.2; pudotus = p < .45 ? 1 - (p/.45)*(p/.45) : (p < .8 ? Math.sin(Math.PI*(p - .45)/.35) * .12 : 0); }
  if (sykli >= 4.2 && !opas.putosi) { opas.putosi = true; }
  if (sykli >= 0 && sykli < .1) opas.putosi = false;
  if (opas.putosi && sykli >= 4.65 && !opas.tomahti) { opas.tomahti = true; sc.cameras.main.shake(200, .004);
    for (let i=0;i<14;i++) kipinat.push({ x: ox + (Math.random()-.5)*W*.05, y: maaY, vx: (Math.random()-.5)*H*.2, vy: -H*(.05 + Math.random()*.1), ika: 0, kesto: .6, rgb: '200,190,170' }); }
  if (sykli >= 0 && sykli < .1) opas.tomahti = false;

  const nostoKork = H*.2;
  const korkeus = sykli >= 4.2 ? nostoKork * pudotus * (sykli - 4.2 < .45 ? 1 : 1) : nostoKork * (nousu*nousu*(3 - 2*nousu));
  const kohdeY = maaY - (sykli >= 4.2 && sykli - 4.2 >= .45 ? nostoKork * pudotus : korkeus);
  h.y = kohdeY / sk;
  h.angle = opas.perusKulma + heilu * 14 + tormays * (Math.random() - .5) * 10;
  const hy = kohdeY - (h.displayHeight * sk) * .45;              // säteiden kohde oppaan keskellä

  // säteet: kartio satelliitista oppaaseen, vahvempi puoli heilunnan mukaan
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [s, puoli] of [[vasen, -1], [oikea, 1]]) {
    const voima = sateet * (.55 + .45 * Math.max(0, -puoli * heilu)) * (1 - .5*tormays + .5*tormays*Math.random());
    if (voima <= .01) continue;
    const lev = W*.045, g = ctx.createLinearGradient(s.x, s.y, ox, hy);
    g.addColorStop(0, `rgba(${s.rgb},${.55*voima})`); g.addColorStop(1, `rgba(${s.rgb},${.25*voima})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(s.x - K*.4, s.y + K*.3); ctx.lineTo(s.x + K*.4, s.y + K*.3);
    ctx.lineTo(ox - puoli*lev*.2 + lev*.5, hy + lev*.6); ctx.lineTo(ox - puoli*lev*.2 - lev*.5, hy + lev*.6); ctx.closePath(); ctx.fill();
    hehku(ox, hy, lev*1.4, s.rgb, .3*voima);
  }
  if (tormays > .2 && Math.random() < .7) for (let i=0;i<3;i++) { const kk = Math.random()*Math.PI*2;
    kipinat.push({ x: ox, y: hy, vx: Math.cos(kk)*H*.35, vy: Math.sin(kk)*H*.35, ika: 0, kesto: .45, rgb: Math.random() < .5 ? SININEN : PUNAINEN }); }
  for (const p of kipinat){ p.ika += dt; p.vy += H*.6*dt; p.x += p.vx*dt; p.y += p.vy*dt;
    ctx.fillStyle = `rgba(${p.rgb},${1 - p.ika/p.kesto})`; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); }
  kipinat = kipinat.filter(p => p.ika < p.kesto);
  hehku(vasen.x, vasen.y, K*3, SININEN, .5*a); hehku(oikea.x, oikea.y, K*3, PUNAINEN, .5*a);
  ctx.restore();
  piirraSat(vasen.x, vasen.y, K, vasen.paneeli); piirraSat(oikea.x, oikea.y, K, oikea.paneeli);
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t, dt);
  rafId = requestAnimationFrame(silmukka);
}

function palautaOpas(){
  if (opas && opas.hahmo) { opas.hahmo.y = opas.perusY; opas.hahmo.angle = opas.perusKulma; }
  opas = null;
}

window.naytaManipulointi = function(p){
  if (!(p && p.manipulointi)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0; palautaOpas();
    return;
  }
  koko(); kipinat = [];
  const sc = window.__paaKohtaus;
  palautaOpas();
  if (sc && sc.hahmo) opas = { hahmo: sc.hahmo, perusY: sc.hahmo.y, perusKulma: sc.hahmo.angle || 0 };
  aktiivinen = true; cv.style.opacity = 1;
  alku = performance.now(); edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
