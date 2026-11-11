// ============================================================================
// KOODILOHIKÄÄRME (Oulu 10.11.2026, Jarno: sivulle "Tarvitsemme algoritmista
// lukutaitoa." Matrix-koodi, jonka lohikäärme imee sisälleen).
// Taivaalla jo oleva lohikäärme (esitys-2d-hahmot.js, dragon-fly.png, katsoo
// VASEMMALLE) jää paikalleen. Ruudulle sataa vihreää koodia, ja vähitellen
// merkit irtoavat sateesta ja kiertyvät lohikäärmeen suuhun. Lopuksi sade
// loppuu, kun lohikäärme on imenyt koodin. Kerran per pysähdys.
// Oma kangas tekstin alla (z-index 4). Käyttö esitys-data.js:ssä: `koodilohikaarme: true`.
// ============================================================================
(function(){
'use strict';
const MERKIT = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789<>{}=+*/01';
const VIHREA = '61,255,122';
const T_IMU = 2.0;          // s, imu alkaa
const T_SADE_LOPPUU = 7.5;  // s, uusia pisaroita ei enää tule
const SUU = { x: 0.03, y: 0.54 };   // suun paikka lohikäärmekuvan rajauksessa (kuva katsoo vasemmalle)

const cv = document.createElement('canvas');
cv.id = 'koodilohikaarme';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .8s ease;';
const ctx = cv.getContext('2d');
function liita(){ document.body.appendChild(cv); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let W = 0, H = 0, DPR = 1, F = 16;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; F = Math.max(12, Math.round(H * 0.022)); cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

const merkki = () => MERKIT[Math.floor(Math.random() * MERKIT.length)];
const sat = (a, b) => a + Math.random() * (b - a);

// taivaan lohikäärmeen suu ruudulla (sama haku kuin esitys-2d-lohikaarme.js)
function suu(){
  const sc = window.__paaKohtaus;
  const o = sc && sc.children.list.find(q => q.texture && String(q.texture.key).includes('dragon-fly'));
  if (!o || !o.visible) return { x: W * 0.2, y: H * 0.08, loydetty: false };
  const cam = sc.cameras.main, b = o.getBounds(), sk = W / sc.scale.width;
  const x0 = (b.x - cam.scrollX * o.scrollFactorX) * sk, y0 = (b.y - cam.scrollY * o.scrollFactorY) * sk;
  const w = b.width * sk, h = b.height * sk;
  const sx = o.flipX ? 1 - SUU.x : SUU.x;
  return { x: x0 + w * sx, y: y0 + h * SUU.y, loydetty: true };
}

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;
let sarakkeet = [], hiukkaset = [], syoty = 0;

function alusta(){
  sarakkeet = [];
  const n = Math.ceil(W / F);
  for (let i = 0; i < n; i++) sarakkeet.push({ x: i * F + F/2, y: sat(-H, 0), v: sat(H*0.18, H*0.42), pituus: Math.floor(sat(8, 24)), merkit: [...Array(30)].map(merkki), elossa: true });
  hiukkaset = []; syoty = 0;
}

function paivita(dt, t){
  const s = suu();
  const imu = Math.max(0, Math.min(1, (t - T_IMU) / 3));        // 0 -> 1 kolmessa sekunnissa
  for (const c of sarakkeet) {
    if (!c.elossa) continue;
    c.y += c.v * dt;
    if (Math.random() < dt * 6) c.merkit[Math.floor(Math.random() * c.merkit.length)] = merkki();
    // imu: pään merkki irtoaa sateesta ja lähtee kohti suuta
    if (imu > 0 && c.y > 0 && Math.random() < dt * (0.8 + imu * 5)) {
      hiukkaset.push({ x: c.x, y: c.y, vx: sat(-30, 30), vy: c.v * 0.3, m: merkki(), ika: 0 });
      if (c.pituus > 2) c.pituus--;
    }
    if (c.y - c.pituus * F > H) {
      if (t > T_SADE_LOPPUU) c.elossa = false;
      else { c.y = sat(-H*0.4, 0); c.v = sat(H*0.18, H*0.42); c.pituus = Math.floor(sat(8, 24)); }
    }
  }
  for (const p of hiukkaset) {
    const dx = s.x - p.x, dy = s.y - p.y, et = Math.hypot(dx, dy) || 1;
    const veto = 900 + 2600 * imu;
    p.vx += (dx / et) * veto * dt + (-dy / et) * 320 * dt;   // veto + kierre
    p.vy += (dy / et) * veto * dt + ( dx / et) * 320 * dt;
    p.vx *= Math.exp(-1.6 * dt); p.vy *= Math.exp(-1.6 * dt);
    p.x += p.vx * dt; p.y += p.vy * dt; p.ika += dt;
    if (et < F * 0.9) { p.syoty = true; syoty++; }
  }
  hiukkaset = hiukkaset.filter(p => !p.syoty && p.ika < 8);
  return s;
}

function piirra(t, s){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  ctx.font = `${F}px "MS Gothic", "Hiragino Kaku Gothic Pro", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const c of sarakkeet) {
    if (!c.elossa) continue;
    for (let k = 0; k < c.pituus; k++) {
      const y = c.y - k * F; if (y < -F || y > H + F) continue;
      const a = k === 0 ? 0.95 : 0.55 * (1 - k / c.pituus);
      ctx.fillStyle = k === 0 ? `rgba(210,255,220,${a})` : `rgba(${VIHREA},${a})`;
      ctx.fillText(c.merkit[k % c.merkit.length], c.x, y);
    }
  }
  for (const p of hiukkaset) {
    const dx = s.x - p.x, dy = s.y - p.y, et = Math.hypot(dx, dy);
    const sk = Math.max(0.35, Math.min(1, et / (H * 0.25)));
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(sk, sk);
    ctx.fillStyle = `rgba(${VIHREA},0.9)`; ctx.shadowColor = `rgb(${VIHREA})`; ctx.shadowBlur = 8;
    ctx.fillText(p.m, 0, 0); ctx.restore();
  }
  // suun hehku kasvaa sitä mukaa kun koodia imeytyy
  if (s.loydetty && t > T_IMU) {
    const r = F * (1.2 + Math.min(3, syoty / 120));
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
    g.addColorStop(0, `rgba(${VIHREA},0.55)`); g.addColorStop(1, `rgba(${VIHREA},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI*2); ctx.fill();
  }
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku) / 1000, dt = Math.min(0.05, (ms - edellinen) / 1000); edellinen = ms;
  const s = paivita(dt, t); piirra(t, s);
  if (t > T_SADE_LOPPUU + 4 && !hiukkaset.length && !sarakkeet.some(c => c.elossa)) { cv.style.opacity = 0; return; }   // kaikki imetty
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaKoodilohikaarme = function(p){
  const paalle = !!(p && p.koodilohikaarme);
  if (paalle) {
    aktiivinen = true; koko(); alusta();
    alku = edellinen = performance.now(); cv.style.opacity = 1;
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
  } else if (aktiivinen) {
    aktiivinen = false; cv.style.opacity = 0; cancelAnimationFrame(rafId);
    setTimeout(() => { if (!aktiivinen) ctx.clearRect(0,0,cv.width,cv.height); }, 900);
  }
};
})();
