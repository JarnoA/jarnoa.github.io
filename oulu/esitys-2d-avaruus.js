// ============================================================================
// AVARUUS: ASTRONAUTIT JA METEORIITIT (Oulu 10.11.2026, Jarno: "Kasvattajat =
// sosiaalisia insinöörejä" -sivulle zoom out, "useampi astronautti, käytä kaikki
// variantit… meteoriitit taivaalla ja astronautit väistävät niitä ja välillä
// osuu, mutta meteoriitti kimpoaa astronautista").
// Kuvat: assets/2d/space/ (space-man.png = 3 versiota x 5 kehystä: edestä
// suihkurepulla, takaa, sivulta; meteor-big.png, meteor-small.png).
// Oma kangas tekstin alla (z-index 4), piirretään vain ruudun yläosaan (taivas).
// Käyttö esitys-data.js:ssä: `astronautit: true`.
// ============================================================================
(function(){
'use strict';
const KANSIO = 'assets/2d/space/';
const RIVIT = 3, SARAKKEET = 5;          // space-man.png: 3 versiota, 5 kehystä
const ASTRONAUTTEJA = 7;
const ALUE_Y = [0.05, 0.42];             // taivaskaista, osuus ruudun korkeudesta
const VAISTO_TODENNAKOISYYS = 0.7;       // muuten osuu ja meteoriitti kimpoaa
const METEORI_VALI = [1.4, 3.2];         // s, uuden meteoriitin väli
const ALKUVIIVE = 1.2;                    // s, zoom ehtii aueta ennen kuin hahmot tulevat

const cv = document.createElement('canvas');
cv.id = 'avaruus';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity 1.2s ease;';
const ctx = cv.getContext('2d');
function liita(){ document.body.appendChild(cv); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

// ---------- kuvat: astronautin kehykset rajataan läpinäkyvyyden mukaan ----------
const kuvat = {}; let ladattu = false;
function lataa(){
  let jaljella = 3;
  const valmis = () => { if (--jaljella === 0) { rajaa(); ladattu = true; } };
  [['mies', 'space-man.png'], ['iso', 'meteor-big.png'], ['pieni', 'meteor-small.png']].forEach(([k, f]) => {
    const im = new Image(); im.onload = valmis; im.onerror = valmis; im.src = KANSIO + f; kuvat[k] = im;
  });
}
let kehykset = [];   // [rivi][kehys] = {x,y,w,h}
function rajaa(){
  const im = kuvat.mies; if (!im.naturalWidth) return;
  const cw = im.naturalWidth / SARAKKEET, ch = im.naturalHeight / RIVIT;
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
  const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  kehykset = [];
  for (let r = 0; r < RIVIT; r++) {
    // yhteinen rajaus koko riville, ettei hahmo hyppelehdi kehysten välillä
    let x0 = cw, y0 = ch, x1 = 0, y1 = 0;
    for (let s = 0; s < SARAKKEET; s++) for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const px = Math.floor(s*cw + x), py = Math.floor(r*ch + y);
      if (d[(py*c.width + px)*4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    kehykset.push([...Array(SARAKKEET)].map((_, s) => ({ x: s*cw + x0, y: r*ch + y0, w: x1 - x0 + 1, h: y1 - y0 + 1 })));
  }
}
lataa();

// ---------- tila ----------
let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0, seuraavaMeteori = 0;
let astronautit = [], meteorit = [];
const sat = (a, b) => a + Math.random() * (b - a);

function luoAstronautit(){
  astronautit = [];
  for (let i = 0; i < ASTRONAUTTEJA; i++) {
    const syvyys = sat(0.55, 1.15);                 // pienempi = kauempana
    astronautit.push({
      rivi: i % RIVIT,                              // kaikki versiot käyttöön
      x: (i + 0.5) / ASTRONAUTTEJA * W + sat(-W*0.04, W*0.04),
      y: sat(ALUE_Y[0], ALUE_Y[1]) * H,
      vx: sat(-14, 14) * syvyys, vy: sat(-6, 6) * syvyys,
      koko: H * 0.075 * syvyys * (i % 2 === 0 ? 1.5 : 1), syvyys,   // Jarno 10.11.: osa 1,5x isompia
      vaihe: Math.random() * 10, kehysAika: Math.random(), fps: sat(5, 8),
      kulma: sat(-0.15, 0.15), kulmaNopeus: 0, osumaHehku: 0,
      peilaa: Math.random() < 0.5, ilmestyy: ALKUVIIVE + i * 0.35,
    });
  }
}
function luoMeteori(){
  const iso = Math.random() < 0.35;
  const vasemmalta = Math.random() < 0.5;
  const koko = H * (iso ? sat(0.07, 0.1) : sat(0.035, 0.055));
  const nopeus = W * sat(0.12, 0.2) * (iso ? 0.8 : 1);
  const y = sat(ALUE_Y[0] - 0.05, ALUE_Y[1]) * H;
  const kulma = sat(-0.25, 0.35);
  meteorit.push({
    kuva: iso ? 'iso' : 'pieni', koko, r: koko * 0.45,
    x: vasemmalta ? -koko : W + koko, y,
    vx: (vasemmalta ? 1 : -1) * nopeus * Math.cos(kulma), vy: nopeus * Math.sin(kulma),
    kierto: Math.random() * 6, kiertoNopeus: sat(-1.5, 1.5), kimmonnut: false,
  });
}

// ---------- päivitys ----------
function paivita(dt, t){
  if (t > ALKUVIIVE && t >= seuraavaMeteori) { luoMeteori(); seuraavaMeteori = t + sat(METEORI_VALI[0], METEORI_VALI[1]); }
  for (const m of meteorit) { m.x += m.vx*dt; m.y += m.vy*dt; m.kierto += m.kiertoNopeus*dt; }
  meteorit = meteorit.filter(m => m.x > -W*0.2 && m.x < W*1.2 && m.y > -H*0.3 && m.y < H*0.75);

  for (const a of astronautit) {
    if (t < a.ilmestyy) continue;
    const ah = a.koko, ar = ah * 0.38, acx = a.x, acy = a.y - ah*0.5;
    for (const m of meteorit) {
      const dx = acx - m.x, dy = acy - m.y, et = Math.hypot(dx, dy) || 1;
      // väistö: meteoriitti tulossa kohti ja lähellä -> työntö sivuun (päätetään kerran per meteoriitti)
      if (m.paatos == null) m.paatos = new Map();
      if (!m.paatos.has(a)) m.paatos.set(a, Math.random() < VAISTO_TODENNAKOISYYS);
      const tulee = (m.vx*dx + m.vy*dy) > 0;
      if (tulee && et < ah*3.2 && m.paatos.get(a)) {
        const voima = (1 - et/(ah*3.2)) * 260 * a.syvyys;
        // sivuttain meteoriitin suuntaan nähden
        const ml = Math.hypot(m.vx, m.vy) || 1, nx = -m.vy/ml, ny = m.vx/ml;
        const puoli = (dx*nx + dy*ny) >= 0 ? 1 : -1;
        a.vx += nx*puoli*voima*dt; a.vy += ny*puoli*voima*dt;
      }
      // osuma: meteoriitti kimpoaa, astronautti horjahtaa
      if (et < ar + m.r) {
        const ux = dx/et, uy = dy/et;
        const vn = m.vx*(-ux) + m.vy*(-uy);
        if (vn < 0) { m.vx += 2*vn*ux*0.9; m.vy += 2*vn*uy*0.9; }
        m.x = acx - ux*(ar + m.r + 1); m.y = acy - uy*(ar + m.r + 1);
        m.kiertoNopeus *= -1.6;
        a.vx += ux*40*a.syvyys; a.vy += uy*40*a.syvyys;
        a.kulmaNopeus += (Math.random() < 0.5 ? -1 : 1) * 3;
        a.osumaHehku = 1;
      }
    }
    // leijunta, vaimennus, kaistalla pysyminen
    a.vx *= Math.exp(-0.6*dt); a.vy *= Math.exp(-0.6*dt);
    a.vx += Math.sin(t*0.4 + a.vaihe) * 4 * dt; a.vy += Math.cos(t*0.33 + a.vaihe) * 3 * dt;
    a.x += a.vx*dt; a.y += a.vy*dt;
    const yMin = ALUE_Y[0]*H + a.koko, yMax = ALUE_Y[1]*H + a.koko;
    if (a.y < yMin) a.vy += (yMin - a.y) * 2 * dt; if (a.y > yMax) a.vy -= (a.y - yMax) * 2 * dt;
    if (a.x < W*0.03) a.vx += 20*dt; if (a.x > W*0.97) a.vx -= 20*dt;
    a.kulmaNopeus *= Math.exp(-1.2*dt); a.kulma += a.kulmaNopeus*dt; a.kulma *= Math.exp(-0.5*dt);
    a.osumaHehku = Math.max(0, a.osumaHehku - dt*2);
    a.kehysAika += dt * a.fps;
  }
}

// ---------- piirto ----------
function piirra(t){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H); ctx.imageSmoothingEnabled = false;
  const kaikki = [...astronautit.filter(a => t >= a.ilmestyy).map(a => ({ s: a.syvyys, a })), ...meteorit.map(m => ({ s: m.koko > H*0.065 ? 1.2 : 0.9, m }))]
    .sort((p, q) => p.s - q.s);
  for (const o of kaikki) {
    if (o.a) {
      const a = o.a, k = (kehykset[a.rivi] || [])[Math.floor(a.kehysAika) % SARAKKEET]; if (!k) continue;
      const sk = a.koko / k.h, w = k.w*sk, h = k.h*sk;
      const ilm = Math.min(1, (t - a.ilmestyy) / 0.8);
      ctx.save(); ctx.globalAlpha = ilm; ctx.translate(a.x, a.y - h/2 + Math.sin(t*1.3 + a.vaihe)*h*0.04); ctx.rotate(a.kulma);
      if (a.peilaa) ctx.scale(-1, 1);
      ctx.drawImage(kuvat.mies, k.x, k.y, k.w, k.h, -w/2, -h/2, w, h);
      if (a.osumaHehku > 0) { ctx.globalAlpha = a.osumaHehku*0.6; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(kuvat.mies, k.x, k.y, k.w, k.h, -w/2, -h/2, w, h); }
      ctx.restore();
    } else {
      const m = o.m, im = kuvat[m.kuva]; if (!im || !im.naturalWidth) continue;
      const sk = m.koko / im.naturalHeight, w = im.naturalWidth*sk;
      ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.kierto); ctx.drawImage(im, -w/2, -m.koko/2, w, m.koko); ctx.restore();
    }
  }
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku) / 1000, dt = Math.min(0.05, (ms - edellinen) / 1000); edellinen = ms;
  if (ladattu) { paivita(dt, t); piirra(t); }
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaAvaruus = function(p){
  const paalle = !!(p && p.astronautit);
  if (paalle && !aktiivinen) {
    aktiivinen = true; koko(); luoAstronautit(); meteorit = []; seuraavaMeteori = ALKUVIIVE + 0.8;
    alku = edellinen = performance.now(); cv.style.opacity = 1;
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
  } else if (!paalle && aktiivinen) {
    aktiivinen = false; cv.style.opacity = 0;
    setTimeout(() => { if (!aktiivinen) { cancelAnimationFrame(rafId); ctx.clearRect(0,0,cv.width,cv.height); } }, 1300);
  }
};
})();
