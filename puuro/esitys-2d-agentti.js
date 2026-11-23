// ============================================================================
// AGENTTI TEKEE RAHAA (8.10.2026, x:10760 "Tee niin paljon rahaa kuin pystyt."
// - Julius Danek, Stripe: agentti käytti 7 000 $ ja tienasi 1,54 $).
// Käyttö esitys-data.js:ssä: `agentti: true`. Varastorobotti animated_robot_sdc
// (robotti-sdc-walk-left.png / -front.png, ks. POHJA-README "Varastossa").
//  rivi 1 : robotti kävelee oikealta keskelle, kääntyy eteen, pään yllä vilkkuu $
//  rivi 2 : juoksee edestakaisin yhä nopeammin, perästä lentää seteleitä tuuleen
//  rivi 3 : pysähtyy eteen päin, yksi pieni kolikko putoaa sen eteen ja välähtää
// ============================================================================
(function(){
'use strict';
const kuva = src => { const i = new Image(); i.src = src; return i; };
const SIVU = { img: kuva('assets/2d/sprites/robotti-sdc-walk-left.png'), w: 313, h: 501, n: 16 };
const ETU = { img: kuva('assets/2d/sprites/robotti-sdc-walk-front.png'), w: 250, h: 501, n: 16 };

const cv = document.createElement('canvas');
cv.id = 'agentti';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
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
let tila;
function alusta(){ tila = { vaihe: 0, juoksuAlku: 0, x: 0, suunta: -1, vaihe3: 0, setelit: [], ajastin: 0, askel: 0, kolikko: null }; }

function rivi(i){
  const r = document.querySelectorAll('#teksti .leipa-rivi');
  return r.length ? !!(r[i] && r[i].classList.contains('nakyy')) : null;
}
function piirraSprite(sp, f, x, maa, korkeus, peilaa){
  const sk = korkeus / sp.h, w = sp.w * sk;
  ctx.save(); ctx.translate(x, maa); if (peilaa) ctx.scale(-1, 1);
  ctx.drawImage(sp.img, (f % sp.n)*sp.w, 0, sp.w, sp.h, -w/2, -korkeus, w, korkeus);
  ctx.restore();
}
function seteli(s){
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.r); ctx.scale(1, Math.abs(Math.cos(s.flip)) * .8 + .2);
  const w = s.k*2.2, h = s.k;
  ctx.fillStyle = '#3f8a4a'; ctx.fillRect(-w/2, -h/2, w, h);
  ctx.fillStyle = '#a9dc8c'; ctx.fillRect(-w*.18, -h*.3, w*.36, h*.6);
  ctx.fillStyle = '#2d6b37'; ctx.fillRect(-w/2, -h/2, w, Math.max(1, h*.1)); ctx.fillRect(-w/2, h*.4, w, Math.max(1, h*.1));
  ctx.restore();
}

function piirra(t, dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  ctx.imageSmoothingEnabled = true;
  const maa = H*.96, kor = H*.30, keski = W*.5;
  const r1 = rivi(1), r2 = rivi(2);

  // 1) kävelee oikealta keskelle (2.2 s), kääntyy eteen
  if (tila.vaihe === 0) {
    const e = Math.min(1, t / 2.2);
    tila.x = W*1.1 + (keski - W*1.1) * (1 - Math.pow(1 - e, 2));
    if (e < 1) piirraSprite(SIVU, Math.floor(t*12), tila.x, maa, kor, false);
    else {
      piirraSprite(ETU, 0, tila.x, maa, kor, false);
      // dollarimerkki vilkkuu pään yllä (pikseleinä)
      if (Math.floor(t*3) % 2 === 0) {
        const u = kor*.035, dx = tila.x - u*2.5, dy = maa - kor*1.18;
        const D = ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'];
        ctx.fillStyle = '#ffd36b';
        D.forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '#') ctx.fillRect(dx + i*u, dy + j*u, u + .5, u + .5); });
      }
    }
    if (r1 === null ? t > 4 : (r1 && t > 2.4)) { tila.vaihe = 1; tila.juoksuAlku = t; }
  }
  // 2) juoksee edestakaisin, nopeutuu, setelit lentävät
  else if (tila.vaihe === 1) {
    const k = t - tila.juoksuAlku, nopeus = W * (.25 + Math.min(.55, k*.12));
    tila.x += tila.suunta * nopeus * dt;
    if (tila.x < W*.22) { tila.x = W*.22; tila.suunta = 1; }
    if (tila.x > W*.78) { tila.x = W*.78; tila.suunta = -1; }
    tila.askel += dt * (12 + k*4);
    piirraSprite(SIVU, Math.floor(tila.askel), tila.x, maa, kor, tila.suunta > 0);
    tila.ajastin -= dt;
    if (tila.ajastin <= 0) {
      tila.ajastin = Math.max(.03, .16 - k*.025);
      tila.setelit.push({ x: tila.x - tila.suunta*kor*.2, y: maa - kor*(.4 + Math.random()*.4), vx: -tila.suunta*W*(.05 + Math.random()*.08), vy: -H*(.08 + Math.random()*.12),
        r: Math.random()*6, vr: (Math.random() - .5)*5, flip: 0, vf: 3 + Math.random()*5, k: H*.022 });
    }
    if (r2 === null ? k > 5 : (r2 && k > 2.5)) { tila.vaihe = 2; tila.vaihe3 = t; }
  }
  // 3) pysähtyy, kolikko
  else {
    const k = t - tila.vaihe3;
    tila.x += (keski - tila.x) * Math.min(1, dt*3);
    piirraSprite(ETU, 0, tila.x, maa, kor, false);
    const kx = tila.x + kor*.02, kohdeY = maa - kor*.06, r = H*.011;
    if (!tila.kolikko) tila.kolikko = { y: maa - kor*1.4, vy: 0, pomppu: 0 };
    const c = tila.kolikko;
    if (k > .6) {
      c.vy += H*2.2*dt; c.y += c.vy*dt;
      if (c.y > kohdeY) { c.y = kohdeY; c.vy = -c.vy*.35; if (Math.abs(c.vy) < H*.05) c.vy = 0; c.pomppu++; }
      ctx.fillStyle = '#b8862a'; ctx.beginPath(); ctx.ellipse(kx, c.y - r, r, r, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.ellipse(kx, c.y - r, r*.75, r*.75, 0, 0, 7); ctx.fill();
      if (c.pomppu > 0) {                                 // välähdys kun kolikko osuu maahan
        const v = Math.max(0, Math.sin(Math.min(1, (k - .9) / 1.2) * Math.PI));
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = v;
        ctx.fillStyle = '#fff6c8';
        ctx.fillRect(kx - r*3, c.y - r - 1, r*6, 2); ctx.fillRect(kx - 1, c.y - r*4, 2, r*6);
        ctx.restore();
      }
    }
  }
  // setelit leijuvat pois
  for (const s of tila.setelit) {
    s.vy += H*.03*dt; s.vx *= .995; s.x += s.vx*dt; s.y += s.vy*dt; s.r += s.vr*dt; s.flip += s.vf*dt;
    if (s.y > maa) { s.y = maa; s.vx *= .9; s.vy = 0; s.vr = 0; }
    seteli(s);
  }
  tila.setelit = tila.setelit.filter(s => s.x > -W*.1 && s.x < W*1.1);
  if (tila.setelit.length > 260) tila.setelit.splice(0, tila.setelit.length - 260);
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku)/1000; if (t >= 0) piirra(t, dt);
  rafId = requestAnimationFrame(silmukka);
}

window.naytaAgentti = function(p){
  if (!(p && p.agentti)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); alusta();
  aktiivinen = true; alku = performance.now() + 300; edellinen = performance.now(); cv.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
