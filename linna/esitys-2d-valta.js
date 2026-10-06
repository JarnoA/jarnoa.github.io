// ============================================================================
// TIETO = DATA = VALTA (2.10.2026, x:7590). Jarnon valinta: muutosketju.
// Käyttö esitys-data.js:ssä: `valta: true`; otsikon sanat span-luokilla
// tdv-1 (TIETO), tdv-2 (DATA), tdv-3 (VALTA) - ne syttyvät vaiheiden tahdissa.
//
//  TIETO  : maisemasta nousee lämpimiä kirjoja ja sivuja
//  = DATA : sininen skannausviiva pyyhkäisee yli, kirjat hajoavat 0/1-biteiksi
//  = VALTA: bitit virtaavat ilma-alukseen (valtaAlus, entinen zeppeliini) - alus
//           hehkuu, paisuu hieman, sähkö rätisee rungolla ja sen ylle syttyy
//           valokruunu. Aluksen koko ja paikka luetaan Phaserista joka ruudussa;
//           skaala palautetaan pysähdykseltä lähdettäessä.
// Tekstin alla (z 4).
// ============================================================================
(function(){
'use strict';
const VAIHE_DATA = 3.2, VAIHE_VALTA = 5.6;
const LAMMIN = ['#c9783e', '#8a4a2e', '#3d6a8a', '#5a7a3a', '#a8862e'], SYAANI = '127,216,255', KULTA = '255,214,110';

const cv = document.createElement('canvas');
cv.id = 'valta';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(cv);
  const st = document.createElement('style');
  st.textContent = '.tdv{opacity:.3;transition:opacity .6s ease,text-shadow .6s ease}.tdv.on{opacity:1;text-shadow:0 0 .35em currentColor,0 3px 18px rgba(0,0,0,.85)}';
  document.head.appendChild(st);
});

let W = 0, H = 0, DPR = 1;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', koko); koko();

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;
let kirjat = [], bitit = [], kipinat = [], alus = null;

function alusta(){
  kirjat = Array.from({length: 16}, (_, i) => ({ x: W*(.06 + i*.058 + (Math.random()-.5)*.03), y: H*(.95 + Math.random()*.05),
    nopeus: H*(.05 + Math.random()*.035), vari: LAMMIN[i % LAMMIN.length], kierto: (Math.random()-.5)*.6, alkaa: .3 + Math.random()*1.4, hajosi: false }));
  bitit = []; kipinat = [];
}
function haeAlus(){
  const sc = window.__paaKohtaus; if (!sc || !sc.kuvahahmot) return null;
  const kh = sc.kuvahahmot.find(k => k.h.valtaAlus); if (!kh || !kh.img.visible) return null;
  if (!alus || alus.kh !== kh) alus = { kh, perusSkaala: kh.img.scaleX };
  const cam = sc.cameras.main, b = kh.img.getBounds(), sk = W / sc.scale.width;
  return { x: (b.x - cam.scrollX * kh.img.scrollFactorX) * sk, y: (b.y - cam.scrollY * kh.img.scrollFactorY) * sk, w: b.width * sk, h: b.height * sk };
}
function hehku(x, y, r, rgb, a){ const g = ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(${rgb},${a})`); g.addColorStop(1,`rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(x-r,y-r,2*r,2*r); }

function piirra(t, dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const A = haeAlus(), ax = A ? A.x + A.w*.45 : W*.6, ay = A ? A.y + A.h*.5 : H*.5;

  // otsikon sanat syttyvät vaiheittain
  [['.tdv-1', .3], ['.tdv-2', VAIHE_DATA], ['.tdv-3', VAIHE_VALTA]].forEach(([s, h]) => { const e = document.querySelector('#teksti ' + s); if (e) e.classList.toggle('on', t >= h); });

  // 1) TIETO: kirjat nousevat; 2) DATA: skannausviiva hajottaa ne biteiksi
  const skanX = t > VAIHE_DATA ? Math.min(1.1, (t - VAIHE_DATA) / 1.6) * W : -1;
  if (skanX >= 0 && skanX <= W) {
    const g = ctx.createLinearGradient(skanX - W*.04, 0, skanX + 4, 0); g.addColorStop(0, `rgba(${SYAANI},0)`); g.addColorStop(1, `rgba(${SYAANI},.35)`);
    ctx.fillStyle = g; ctx.fillRect(skanX - W*.04, H*.35, W*.04 + 4, H*.65);
    ctx.fillStyle = `rgba(${SYAANI},.9)`; ctx.fillRect(skanX, H*.35, 2, H*.65);
  }
  const s = H * .022;
  for (const k of kirjat) {
    if (t < k.alkaa || k.hajosi) continue;
    k.y -= k.nopeus * dt; k.y = Math.max(k.y, H*.45);
    const x = k.x + Math.sin(t*1.2 + k.alkaa*5) * H*.01;
    if (skanX >= x) {                                   // skannaus osui -> bitit
      k.hajosi = true;
      for (let i=0;i<12;i++) bitit.push({ x: x + (Math.random()-.5)*s*2, y: k.y + (Math.random()-.5)*s*1.4, vx: (Math.random()-.5)*H*.08, vy: (Math.random()-.5)*H*.08,
        merkki: Math.random() < .5 ? '0' : '1', ika: 0, imu: t + .4 + Math.random()*.6 });
      continue;
    }
    ctx.save(); ctx.translate(x, k.y); ctx.rotate(k.kierto + Math.sin(t + k.alkaa)*.08);
    ctx.fillStyle = k.vari; ctx.fillRect(-s, -s*.7, s*2, s*1.4);
    ctx.fillStyle = '#efe6cf'; ctx.fillRect(-s*.85, -s*.6, s*.8, s*1.15); ctx.fillRect(s*.05, -s*.6, s*.8, s*1.15);
    ctx.fillStyle = '#9b927c'; for (let i=0;i<3;i++){ ctx.fillRect(-s*.75, -s*.4 + i*s*.35, s*.6, 1.5); ctx.fillRect(s*.15, -s*.4 + i*s*.35, s*.6, 1.5); }
    ctx.restore();
    hehku(x, k.y, s*2, '255,200,140', .18);
  }

  // 3) VALTA: bitit virtaavat alukseen
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `700 ${Math.max(11, H*.022)}px "Courier New",monospace`;
  for (const b of bitit) {
    b.ika += dt;
    if (t > Math.max(b.imu, VAIHE_VALTA - .4)) { const dx = ax - b.x, dy = ay - b.y, d = Math.hypot(dx, dy) || 1;
      b.vx += dx/d * H*1.6*dt; b.vy += dy/d * H*1.6*dt; b.vx *= .94; b.vy *= .94;
      if (d < (A ? A.w*.25 : H*.05)) { b.pois = true; continue; } }
    else { b.vx *= .96; b.vy *= .96; b.vy -= H*.01*dt; }
    b.x += b.vx*dt; b.y += b.vy*dt;
    ctx.fillStyle = `rgba(${SYAANI},.95)`; ctx.shadowColor = `rgb(${SYAANI})`; ctx.shadowBlur = 8; ctx.fillText(b.merkki, b.x, b.y);
  }
  ctx.restore();
  bitit = bitit.filter(b => !b.pois);

  // alus latautuu: hehku, paisuminen, sähkö ja valokruunu
  const lataus = Math.min(1, Math.max(0, (t - VAIHE_VALTA) / 3));
  if (A && lataus > 0) {
    if (alus) alus.kh.img.setScale(alus.perusSkaala * (1 + .12 * lataus + .015 * Math.sin(t*6) * lataus));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    hehku(ax, ay, A.w*.75, SYAANI, .35 * lataus);
    if (Math.random() < dt * 10 * lataus) {               // sähkö rätisee rungolla
      let x = A.x + Math.random()*A.w, y = A.y + A.h*(.3 + Math.random()*.4); const pts = [[x, y]];
      for (let i=0;i<4;i++){ x += (Math.random()-.4)*A.w*.12; y += (Math.random()-.5)*A.h*.25; pts.push([x, y]); }
      kipinat.push({ pts, ika: 0 });
    }
    for (const k of kipinat){ k.ika += dt; ctx.strokeStyle = `rgba(200,240,255,${1 - k.ika/.18})`; ctx.lineWidth = 2;
      ctx.beginPath(); k.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
    kipinat = kipinat.filter(k => k.ika < .18);
    // valokruunu aluksen yllä
    const ka = Math.min(1, Math.max(0, (t - VAIHE_VALTA - 1.5) / 1.2)), kx = ax, ky = A.y - A.h*.15 + Math.sin(t*1.6)*A.h*.03, kw = A.w*.28, kh = kw*.55;
    if (ka > 0) {
      hehku(kx, ky - kh*.4, kw*1.3, KULTA, .5*ka);
      ctx.fillStyle = `rgba(${KULTA},${.95*ka})`; ctx.beginPath();
      ctx.moveTo(kx - kw/2, ky); ctx.lineTo(kx - kw/2, ky - kh*.7); ctx.lineTo(kx - kw/4, ky - kh*.35); ctx.lineTo(kx, ky - kh);
      ctx.lineTo(kx + kw/4, ky - kh*.35); ctx.lineTo(kx + kw/2, ky - kh*.7); ctx.lineTo(kx + kw/2, ky); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(255,250,220,${ka})`; for (const dx of [-.5, 0, .5]) { ctx.beginPath(); ctx.arc(kx + dx*kw, ky - kh*(dx ? .72 : 1.02), kw*.05, 0, 7); ctx.fill(); }
    }
    ctx.restore();
  }
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t, dt);
  rafId = requestAnimationFrame(silmukka);
}
function palautaAlus(){ if (alus && alus.kh && alus.kh.img) alus.kh.img.setScale(alus.perusSkaala); alus = null; }

window.naytaValta = function(p){
  if (!(p && p.valta)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0; palautaAlus();
    return;
  }
  koko(); palautaAlus(); alusta(); aktiivinen = true; cv.style.opacity = 1;
  alku = performance.now(); edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
