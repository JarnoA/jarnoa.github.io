// ============================================================================
// RAKKAUS (8.10.2026, x:9245 "Joillekin se riittää." - Kiinan tekoälykumppanit,
// BBC). Jarno: "animated_robot_sdc.glb ja woman2, saisiko niistä rakkaustarinan?"
// Käyttö esitys-data.js:ssä: `rakkaus: true`.
//  alku    : nainen kävelee vasemmalta, robotti oikealta; pysähtyvät vastakkain,
//            väliin syttyy sykkivä pikselisydän
//  rivi 2  : ("Kiina rajoitti...") robotti häiriintyy ja hajoaa pikseleiksi,
//            sydän halkeaa kahtia
//  rivi 3  : nainen jää yksin, sydämen puolikkaat putoavat maahan
// Jarno: x:9240:n empatiarobotti kääntyy klikkauksesta ja kävelee tänne -> robotti
// (robotti-walk-raw.png, sama kuin empatiassa, peilattuna oikealle) tulee VASEMMALTA,
// nainen (woman2.glb -> rakkaus-nainen-*.png, katsoo vasemmalle) OIKEALTA.
// ============================================================================
(function(){
'use strict';
const kuva = src => { const i = new Image(); i.src = src; return i; };
const NAINEN_KAVELY = { img: kuva('assets/2d/sprites/rakkaus-nainen-walk.png'), w: 236, h: 505, n: 16, fps: 12 };
const NAINEN_SEISOO = { img: kuva('assets/2d/sprites/rakkaus-nainen-idle.png'), w: 193, h: 491, n: 12, fps: 4 };
const ROBOTTI = { img: kuva('assets/2d/sprites/robotti-walk-raw.png'), w: 282, h: 402, n: 20, fps: 9 };
const ROBOTTI_SEISOO = 14;                // kehys 14 = jalat yhdessä (ks. esitys-2d-empatia.js)
const ROBOTTI_VIIVE = 0.9;                // s, robotti tulee vähän myöhemmin (kävelee empatiasivulta)
const KAVELY = 3.2;                       // s, kävely kohtaamispaikalle
const SYDAN = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];

const cv = document.createElement('canvas');
cv.id = 'rakkaus';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
const apu = document.createElement('canvas'), actx = apu.getContext('2d', { willReadFrequently: true });
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', koko); koko();

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;
let hajoaa = null, hajotettu = false, putoaa = null, hiukkaset = [];

const ease = e => e <= 0 ? 0 : e >= 1 ? 1 : 1 - Math.pow(1 - e, 2);
function piirraSprite(sp, f, x, maa, korkeus, alpha){
  const sk = korkeus / NAINEN_KAVELY.h, w = sp.w * sk, h = sp.h * sk;   // sama mittakaava kaikille naisen spriteille
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.drawImage(sp.img, f*sp.w, 0, sp.w, sp.h, x - w/2, maa - h, w, h);
  ctx.globalAlpha = 1;
  return { x: x - w/2, y: maa - h, w, h };
}
function piirraSydan(cx, cy, u, puoli, dx, dy, kierto){
  ctx.save(); ctx.translate(cx + dx, cy + dy); ctx.rotate(kierto || 0);
  SYDAN.forEach((r, j) => { for (let i = 0; i < 7; i++) {
    if (r[i] !== '#') continue;
    if (puoli < 0 && i > 3) continue; if (puoli > 0 && i < 3) continue;
    if (puoli !== 0 && i === 3 && (j % 2 === 0) === (puoli < 0)) continue;   // sahalaitainen halkeama
    ctx.fillStyle = (i + j) % 5 === 0 ? '#ff8fa3' : '#e8365d';
    ctx.fillRect((i - 3.5)*u, (j - 3)*u, u + .5, u + .5);
  } });
  ctx.restore();
}
function rivi(i){
  const r = document.querySelectorAll('#teksti .leipa-rivi');
  return r.length ? !!(r[i] && r[i].classList.contains('nakyy')) : null;
}

function piirra(t, dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const maa = H*.97, kor = H*.34, rkor = kor*.92;
  const e = ease(t / KAVELY), perilla = t >= KAVELY;
  const nx = W*1.08 + (W*.60 - W*1.08)*e;                          // nainen oikealta
  const re = ease((t - ROBOTTI_VIIVE) / (KAVELY - .2)), rx = -W*.1 + (W*.40 + W*.1)*re, rperilla = re >= 1;   // robotti vasemmalta
  // vaiheet riveistä (ilman rivi-DOMia ajastimella)
  const r1 = rivi(1), r2 = rivi(2);
  if (!hajoaa && rperilla && t > KAVELY + 2.2 && (r1 === null ? t > 7 : r1)) hajoaa = t;   // sydän ehtii sykkiä ainakin 2 s
  if (hajoaa && !putoaa && (r2 === null ? t > hajoaa + 3 : (r2 && t > hajoaa + 1.6))) putoaa = t;

  // nainen
  if (!perilla) piirraSprite(NAINEN_KAVELY, Math.floor(t*NAINEN_KAVELY.fps) % NAINEN_KAVELY.n, nx, maa, kor);
  else piirraSprite(NAINEN_SEISOO, Math.floor(t*NAINEN_SEISOO.fps) % NAINEN_SEISOO.n, nx, maa, kor);

  // robotti: kävelee, seisoo, häiriintyy, hajoaa
  const rsk = rkor / ROBOTTI.h, rw = ROBOTTI.w*rsk, rh = rkor;
  const rf = rperilla ? ROBOTTI_SEISOO : Math.floor(t*ROBOTTI.fps) % ROBOTTI.n;
  ctx.save(); ctx.translate(2*rx, 0); ctx.scale(-1, 1);            // peilaus: kuva katsoo vasemmalle, robotti kävelee oikealle
  if (!hajoaa || t < hajoaa + 1.2) {
    if (hajoaa) {                                     // häiriö: viipaleet nykivät, välkkyy
      const viipaleita = 10, vh = rh / viipaleita, sh = ROBOTTI.h / viipaleita;
      for (let k = 0; k < viipaleita; k++) {
        const siirto = Math.random() < .35 ? (Math.random() - .5) * rw * .25 : 0;
        ctx.globalAlpha = Math.random() < .15 ? .3 : 1;
        ctx.drawImage(ROBOTTI.img, rf*ROBOTTI.w, k*sh, ROBOTTI.w, sh, rx - rw/2 + siirto, maa - rh + k*vh, rw, vh + .5);
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.drawImage(ROBOTTI.img, rf*ROBOTTI.w, 0, ROBOTTI.w, ROBOTTI.h, rx - rw/2, maa - rh, rw, rh);
    }
  } else if (!hajotettu) {
    // pikseleiksi: näytteistetään robotin kehys
    apu.width = Math.round(rw); apu.height = Math.round(rh);
    actx.clearRect(0, 0, apu.width, apu.height);
    actx.drawImage(ROBOTTI.img, rf*ROBOTTI.w, 0, ROBOTTI.w, ROBOTTI.h, 0, 0, apu.width, apu.height);
    const d = actx.getImageData(0, 0, apu.width, apu.height).data, askel = Math.max(4, Math.round(rh / 70));
    for (let y = 0; y < apu.height; y += askel) for (let x = 0; x < apu.width; x += askel) {
      const o = (y*apu.width + x)*4; if (d[o+3] < 120) continue;
      hiukkaset.push({ x: 2*rx - (rx - rw/2 + x) - askel, y: maa - rh + y, vx: (Math.random() - .3) * H*.05, vy: -(Math.random()*.6 + .2) * H*.06,
        k: askel, c: `rgb(${d[o]},${d[o+1]},${d[o+2]})`, ika: 0, elinaika: 1.4 + Math.random()*1.6 });
    }
    hajotettu = true;
  }
  ctx.restore();
  for (const p of hiukkaset) {
    p.ika += dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy -= H*.01*dt;
    const a = 1 - p.ika / p.elinaika; if (a <= 0) continue;
    ctx.globalAlpha = a; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.k, p.k);
  }
  ctx.globalAlpha = 1;
  hiukkaset = hiukkaset.filter(p => p.ika < p.elinaika);

  // sydän: syttyy perillä, halkeaa kun robotti hajoaa, puolikkaat putoavat
  if (perilla && rperilla) {
    const s = Math.min(1, (t - KAVELY - ROBOTTI_VIIVE) / .6), u = H*.013 * s * (hajoaa ? 1 : 1 + .08*Math.sin((t - KAVELY)*5));
    const cx = (rx + nx) / 2, cy = maa - kor*1.05;
    if (!hajoaa || t < hajoaa + .6) piirraSydan(cx, cy, u, 0, 0, 0, 0);
    else {
      const k = t - hajoaa - .6, pois = Math.min(1, k / .5);
      const pud = putoaa ? Math.min(1, (t - putoaa) / 1.2) : 0, py = pud*pud*(maa - cy - u*2);
      piirraSydan(cx, cy, u, -1, -u*1.2*pois, py, -.25*pois - .6*pud);
      piirraSydan(cx, cy, u, 1, u*1.2*pois, py, .25*pois + .6*pud);
    }
  }
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku)/1000; if (t >= 0) piirra(t, dt);
  rafId = requestAnimationFrame(silmukka);
}

window.naytaRakkaus = function(p){
  if (!(p && p.rakkaus)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); hajoaa = null; hajotettu = false; putoaa = null; hiukkaset = [];
  aktiivinen = true; alku = performance.now() + 300; edellinen = performance.now(); cv.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
