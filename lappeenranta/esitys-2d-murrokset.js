// ============================================================================
// MURROKSET (3.10.2026, x:2040 "Ihminen on joutunut suurten teknologisten
// murrosten aikana miettimään omaa rooliaan yhteiskunnassa.")
//
// Käyttö esitys-data.js:ssä: `murrokset: true` pysähdykseen, jolla on
// kuvat/evolution.png (Raamattu, TV, puhelin; kiintea-kuva hahmot.js:ssä).
//
// TV:n ruutu on kuvassa läpinäkyvä reikä. Kohtaus piirtää siihen: CRT
// syttyy (vaakaviiva) → lumisadetta → lumi hälvenee ja ruudun täyttää
// iso pikselisilmä, joka räpyttää hitaasti ja katselee ympärilleen
// ("TV tekee meistä sokeita" - ruutu katsoo meitä). Välillä lyhyt
// lumihäiriö. Ei ääniä.
//
// Ruudun paikka luetaan joka kehyksellä Phaser-kuvan getBounds():sta, joten
// se pysyy kuvan päällä millä tahansa resoluutiolla ja seuraa sen alfaa.
// Oma kanvaasi tekstin (z 5) alla, kuten esitys-2d-paahdin.js.
//
// 4.11.2026 (Jarno: "ei skaalaudu pienellä näytöllä ja robotti joskus
// katoaa"): yksi leveä evolution.png valui 16:10-ruudulla reunojen yli ja
// robotti putosi ensimmäisenä. Nyt kirja (murros-kirja.png) ja TV
// (murros-tv.png) ovat omia kiintea-kuviaan, jotka sijoitetaan ruudun
// leveyden osuuksina (hahmot.js kohdistusX). Puhelin on koodia: 2000-luvun
// alun Nokia-tyylinen kännykkä, jonka LCD:llä mato pelaa itseään. Puhelin ja
// robotti sijoitetaan samoin leveyden osuuksina ja skaalataan TV:n mukaan.
// ============================================================================
(function(){
'use strict';
const KUVA = 'kuvat/murros-tv.png';
const KW = 760, KH = 899;                         // TV-kuvan koko (rajattu evolution.png:stä 1646,189)
const RUUTU = { x: 126, y: 299, w: 452, h: 347, r: 38 }; // läpinäkyvä reikä (mitattu)
const GW = 48, GH = 37;                            // ruudun pikseliresoluutio
// TEKOÄLY-askel: Jarnon valokuva peltirobotista (kuvat/robottoy.jpg) leikattuna
// ja pikselöitynä 37x64:ään (robottoy-pix.png; täysi leikkaus robottoy-leikattu.png).
// Seisoo puhelimen oikealla puolella, herää TV-silmän jälkeen.
// keskiX = osuus ruudun leveydestä; h ja nosto (pohjan etäisyys TV:n alareunasta) TV-kuvan pikseleinä.
const ROBO = { keskiX: 0.875, nosto: 28, h: 620 };
const PUH = { keskiX: 0.735, nosto: 40, h: 690 };   // Nokia-puhelin
const PUH_PAALLE = 2.0, MATO_ALKAA = 2.6;           // s ruudun syttymisestä
const ROBO_HERAA = 4.0;                             // s ruudun syttymisestä
const RS = { silmat: [[15.6, 9.2], [23.6, 9.2]], antennit: [[9.4, 0.8], [29.7, 0.8]] }; // robotin pikseliruudukossa
const roboKuva = new Image(); roboKuva.src = 'kuvat/robottoy-pix.png';

const cv = document.createElement('canvas');
cv.id = 'murrokset-tv';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;';
const ctx = cv.getContext('2d');
const pix = document.createElement('canvas'); pix.width = GW; pix.height = GH;
const pg = pix.getContext('2d');
const pdata = pg.createImageData(GW, GH);
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', koko); koko();

let kaynnissa = false, t0 = 0, raf = 0;
// silmän tila
let katse = { x: 0, y: 0 }, kohde = { x: 0, y: 0 }, seurKatse = 0, seurRapsy = 0, rapsyAlku = -9, seurHairio = 0, hairioAlku = -9;

function kuvaObj(){
  const sc = window.__paaKohtaus;
  if (!sc || !sc.kiinteatKuvat) return null;
  const k = sc.kiinteatKuvat.find(k => k.h && k.h.kuva === KUVA);
  return k ? k.img : null;
}

function kirjoita(x, y, r, g, b){
  if (x < 0 || y < 0 || x >= GW || y >= GH) return;
  const i = (y*GW + x) * 4;
  pdata.data[i] = r; pdata.data[i+1] = g; pdata.data[i+2] = b; pdata.data[i+3] = 255;
}

// yksi ruutukehys pikselipuskuriin. lumi 0..1 = lumisateen osuus, auki 0..1
function piirraRuutu(t, lumi, silmaNakyy){
  const cx = GW/2 - 0.5, cy = GH/2 - 0.5;
  const rx = 18.5, ryTaysi = 11;
  // räpäytys
  let auki = 1;
  const rt = t - rapsyAlku;
  if (rt >= 0 && rt < 0.32) auki = Math.abs(Math.cos(rt / 0.32 * Math.PI));
  const ry = ryTaysi * auki;
  const ix = cx + katse.x, iy = cy + katse.y;
  const rulla = (t * 9) % (GH + 10) - 5;           // vierivä vaalea vyö
  for (let y = 0; y < GH; y++) {
    const vyo = Math.max(0, 1 - Math.abs(y - rulla) / 3) * 0.18;
    const juova = (y & 1) ? 0.82 : 1;
    for (let x = 0; x < GW; x++) {
      // tausta: tumma, hieman sinivihreä
      let r = 14, g = 22, b = 26;
      if (silmaNakyy) {
        const ex = (x - cx) / rx, ey = ry > 0.3 ? (y - cy) / ry : 99;
        const sisalla = ex*ex + ey*ey <= 1;
        const reuna = !sisalla && ex*ex + ((y - cy) / (ry + 1.2))**2 <= 1.08 && ry > 0.3;
        if (sisalla) {
          r = 226; g = 222; b = 210;                // valkuainen
          const d = Math.hypot(x - ix, y - iy);
          if (d < 7) {                               // iiris
            const vaalea = (x - ix) + (y - iy) < -1;
            r = vaalea ? 96 : 58; g = vaalea ? 150 : 104; b = vaalea ? 176 : 132;
            if (d > 6) { r = 34; g = 56; b = 72; }   // iiriksen reuna
          }
          if (d < 3.2) { r = 8; g = 10; b = 12; }   // pupilli
          if (Math.round(x - ix) === -2 && Math.round(y - iy) === -2) { r = g = b = 250; } // heijastus
          // varjo yläluomen alla
          if (y - cy < -ry + 1.6) { r *= 0.7; g *= 0.7; b *= 0.7; }
        } else if (reuna) {
          r = 40; g = 44; b = 46;
        }
      }
      if (lumi > 0) {
        const n = Math.random() * 235;
        r = r*(1-lumi) + n*lumi; g = g*(1-lumi) + n*lumi; b = b*(1-lumi) + n*lumi;
      }
      const k = juova * (1 + vyo);
      kirjoita(x, y, Math.min(255, r*k), Math.min(255, g*k), Math.min(255, b*k));
    }
  }
  pg.putImageData(pdata, 0, 0);
}

function paivitaSilma(t){
  if (t > seurKatse) {                               // nykäyksenomainen katseen siirto
    const vaihtoehdot = [[0,0],[-7,1],[7,1],[-5,-2],[5,2],[0,2],[-8,0]];
    const v = vaihtoehdot[Math.floor(Math.random()*vaihtoehdot.length)];
    kohde = { x: v[0], y: v[1] };
    seurKatse = t + 1.4 + Math.random()*1.8;
  }
  katse.x += (kohde.x - katse.x) * 0.25;
  katse.y += (kohde.y - katse.y) * 0.25;
  if (t > seurRapsy) { rapsyAlku = t; seurRapsy = t + 3.5 + Math.random()*2.5; }
  if (t > seurHairio) { hairioAlku = t; seurHairio = t + 6 + Math.random()*4; }
}

function kehys(nyt){
  raf = requestAnimationFrame(kehys);
  const t = (nyt - t0) / 1000;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  const img = kuvaObj(), sc = window.__paaKohtaus;
  if (!img || !img.visible || img.alpha <= 0.01 || !sc) return;
  // kuvan rajat pelikoordinaateissa → ruudulle
  const cr = sc.game.canvas.getBoundingClientRect();
  const sk = cr.width / sc.scale.width;
  const b = img.getBounds();
  const kx = b.width / KW, ky = b.height / KH;
  const x = cr.left + (b.x + RUUTU.x*kx) * sk, y = cr.top + (b.y + RUUTU.y*ky) * sk;
  const w = RUUTU.w * kx * sk, h = RUUTU.h * ky * sk, r = RUUTU.r * kx * sk;

  const ALKU = 0.5;                                  // kuvan häivytys ensin
  const tt = t - ALKU;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.globalAlpha = img.alpha;
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip();
  ctx.fillStyle = '#05080a'; ctx.fillRect(x, y, w, h);
  if (tt > 0) {
    if (tt < 0.45) {                                 // CRT syttyy: vaakaviiva avautuu
      const p = tt / 0.45;
      const vh = Math.max(2, h * p*p);
      ctx.fillStyle = '#dff4ff';
      ctx.globalAlpha = img.alpha * (1 - p*0.5);
      ctx.fillRect(x + w*(0.5 - 0.5*Math.min(1, p*3)), y + h/2 - vh/2, w*Math.min(1, p*3), vh);
    } else {
      let lumi, silma;
      if (tt < 2.2) { lumi = 1; silma = false; }
      else if (tt < 3.0) { lumi = 1 - (tt - 2.2) / 0.8; silma = true; }
      else { lumi = 0; silma = true; }
      if (silma) paivitaSilma(tt);
      if (tt - hairioAlku < 0.22 && tt > 3) lumi = Math.max(lumi, 0.85);
      piirraRuutu(tt, lumi, silma);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(pix, x, y, w, h);
      // lasin kaarevuus: reunavarjo + heijastus
      const gr = ctx.createRadialGradient(x+w/2, y+h/2, Math.min(w,h)*0.3, x+w/2, y+h/2, Math.max(w,h)*0.75);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.ellipse(x + w*0.3, y + h*0.22, w*0.28, h*0.1, -0.2, 0, Math.PI*2); ctx.fill();
    }
  }
  ctx.restore();
  const s = ky * sk;                                 // TV-kuvan pikseli ruudulla
  const tvPohja = cr.top + (b.y + b.height) * sk;
  piirraPuhelin(tt, cr.left + cr.width * PUH.keskiX, tvPohja - PUH.nosto * s, PUH.h * s, img.alpha);
  piirraRobotti(tt, cr.left + cr.width * ROBO.keskiX, tvPohja - ROBO.nosto * s, ROBO.h * s, img.alpha);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  // pehmeä hehku ruudun ympärille
  if (tt > 0.45) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = img.alpha * 0.10;
    ctx.fillStyle = '#9fd8ff';
    ctx.filter = `blur(${Math.round(w*0.08)}px)`;
    ctx.fillRect(x - w*0.04, y - h*0.04, w*1.08, h*1.08);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 1;
}

// ---- NOKIA + MATOPELI -------------------------------------------------------
// Runko piirretään kerran 40x74-pikseliruudukkoon ja skaalataan terävänä,
// jotta se on samaa pikselityyliä kuin TV ja robotti. LCD 24x18 pikseliä,
// jokainen pelin ruutu = yksi puhelimen pikseli.
const PW = 40, PH = 74;
const LCD = { x: 8, y: 11, w: 24, h: 18 };
const runko = document.createElement('canvas'); runko.width = PW; runko.height = PH;
(function teeRunko(){
  const g = runko.getContext('2d');
  const laatta = (x, y, w, h, r, vari) => { g.fillStyle = vari; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
  laatta(2, 0, 36, 74, 9, '#141c2c');                // ääriviiva
  laatta(3, 1, 34, 72, 8, '#27344d');                // runko
  laatta(4, 2, 32, 36, 6, '#3b4c70');                // kuoren yläosa
  g.fillStyle = '#566a93'; g.fillRect(5, 6, 1, 28);  // valoheijastus reunassa
  g.fillStyle = '#141c2c'; g.fillRect(16, 5, 8, 1);  // kaiutin
  laatta(6, 9, 28, 22, 3, '#151a1f');                // näytön kehys
  g.fillStyle = '#9aa0a8'; g.fillRect(17, 32, 6, 1); // merkkiviiva
  // navigointinäppäin + kaksi valintanäppäintä
  laatta(13, 36, 14, 6, 3, '#aeb5c0'); g.fillStyle = '#7d8592'; g.fillRect(14, 41, 12, 1);
  laatta(6, 37, 6, 3, 1, '#8d95a2'); laatta(28, 37, 6, 3, 1, '#8d95a2');
  // numeronäppäimet 3x4
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const x = 7 + c * 9, y = 45 + r * 6;
    laatta(x, y, 8, 4, 2, '#c3c9d2');
    g.fillStyle = '#7d8592'; g.fillRect(x + 1, y + 4, 6, 1);
    g.fillStyle = '#5c6470'; g.fillRect(x + 3, y + 1, 2, 2);
  }
})();
const lcd = document.createElement('canvas'); lcd.width = LCD.w; lcd.height = LCD.h;
const lg = lcd.getContext('2d');

// mato: ahne tekoälytön tekoäly - kulkee ruokaa kohti ja väistää itseään
let mato = [], suunta = [1, 0], ruoka = [0, 0], seurAskel = 0, kuoli = -9, haamu = null;
function uusiRuoka(){
  for (let i = 0; i < 200; i++) {
    const r = [1 + Math.floor(Math.random() * (LCD.w - 2)), 1 + Math.floor(Math.random() * (LCD.h - 2))];
    if (!mato.some(m => m[0] === r[0] && m[1] === r[1])) { ruoka = r; return; }
  }
}
function uusiPeli(){
  mato = [[6, 9], [5, 9], [4, 9], [3, 9]]; suunta = [1, 0]; uusiRuoka(); kuoli = -9;
}
function vapaa(x, y){
  return x >= 1 && y >= 1 && x < LCD.w - 1 && y < LCD.h - 1 && !mato.slice(0, -1).some(m => m[0] === x && m[1] === y);
}
function askel(t){
  const [hx, hy] = mato[0];
  const vaihtoehdot = [suunta, [suunta[1], -suunta[0]], [-suunta[1], suunta[0]]]
    .filter(d => vapaa(hx + d[0], hy + d[1]))
    .map(d => {
      const nx = hx + d[0], ny = hy + d[1];
      let vapaita = 0;                               // vältä umpikujaa: laske vapaat naapurit
      for (const e of [[1,0],[-1,0],[0,1],[0,-1]]) if (vapaa(nx + e[0], ny + e[1])) vapaita++;
      return { d, arvo: Math.abs(nx - ruoka[0]) + Math.abs(ny - ruoka[1]) - vapaita * 0.6 + Math.random() * 0.4 };
    })
    .sort((a, b) => a.arvo - b.arvo);
  if (!vaihtoehdot.length || mato.length > 70) { kuoli = t; return; }
  suunta = vaihtoehdot[0].d;
  const uusi = [hx + suunta[0], hy + suunta[1]];
  mato.unshift(uusi);
  if (uusi[0] === ruoka[0] && uusi[1] === ruoka[1]) { mato.push(mato[mato.length - 1].slice()); mato.push(mato[mato.length - 1].slice()); uusiRuoka(); }
  else mato.pop();
}
function piirraLcd(t){
  const tumma = '#26311c';
  lg.fillStyle = '#a3b86c'; lg.fillRect(0, 0, LCD.w, LCD.h);
  lg.fillStyle = tumma;
  lg.fillRect(0, 0, LCD.w, 1); lg.fillRect(0, LCD.h - 1, LCD.w, 1);   // pelialueen reunat
  lg.fillRect(0, 0, 1, LCD.h); lg.fillRect(LCD.w - 1, 0, 1, LCD.h);
  if (t < 0) return;
  if (kuoli > 0) {                                   // törmäys: mato vilkkuu, sitten uusi peli
    if (t - kuoli > 1.6) uusiPeli();
    else if (Math.floor((t - kuoli) * 5) % 2) return;
  } else if (t > seurAskel) { askel(t); seurAskel = t + 0.13; }
  if (haamu) { lg.globalAlpha = 0.25; lg.drawImage(haamu, 0, 0); lg.globalAlpha = 1; } // LCD:n hidas jälkikuva
  lg.fillStyle = tumma;
  for (const [x, y] of mato) lg.fillRect(x, y, 1, 1);
  if (Math.floor(t * 3) % 3) lg.fillRect(ruoka[0], ruoka[1], 1, 1);
  if (!haamu) { haamu = document.createElement('canvas'); haamu.width = LCD.w; haamu.height = LCD.h; }
  const hg = haamu.getContext('2d'); hg.clearRect(0, 0, LCD.w, LCD.h); hg.fillStyle = tumma;
  for (const [x, y] of mato) hg.fillRect(x, y, 1, 1);
}

function piirraPuhelin(tt, keskiX, pohjaY, ph, alfa){
  const px = ph / PH, pw = PW * px;
  const x = keskiX - pw / 2, y = pohjaY - ph;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.globalAlpha = alfa;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(runko, x, y, pw, ph);
  const lx = x + LCD.x * px, ly = y + LCD.y * px, lw = LCD.w * px, lh = LCD.h * px;
  const valo = Math.max(0, Math.min(1, (tt - PUH_PAALLE) / 0.4));
  if (valo <= 0) { ctx.fillStyle = '#4a5536'; ctx.fillRect(lx, ly, lw, lh); }
  else {
    piirraLcd(tt - MATO_ALKAA);
    ctx.drawImage(lcd, lx, ly, lw, lh);
    if (valo < 1) { ctx.globalAlpha = alfa * (1 - valo); ctx.fillStyle = '#4a5536'; ctx.fillRect(lx, ly, lw, lh); }
    // taustavalon vihreä hehku
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alfa * 0.12 * valo;
    ctx.fillStyle = '#b8ff8a';
    ctx.filter = `blur(${Math.max(1, Math.round(lw * 0.12))}px)`;
    ctx.fillRect(lx - lw * 0.06, ly - lh * 0.06, lw * 1.12, lh * 1.12);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 1;
}

function piirraRobotti(tt, keskiX, pohjaY, rh, alfa){
  if (!roboKuva.complete || !roboKuva.naturalWidth) return;
  const rw = rh * roboKuva.naturalWidth / roboKuva.naturalHeight;
  const px = rh / roboKuva.naturalHeight;            // yksi robotin pikseli ruudulla
  const jx = keskiX - rw / 2, jy = pohjaY;           // vasen alakulma
  const t = tt - ROBO_HERAA;
  // herääminen: tärähdys + kirkastuminen
  let kirkkaus = 0.32, hyppy = 0, kulma = 0;
  if (t > 0) {
    kirkkaus = 0.32 + 0.68 * Math.min(1, t / 0.35);
    if (t < 0.5) hyppy = Math.sin(t / 0.5 * Math.PI) * 2.2 * px;
    const vaihe = (t - 1.5) % 5.5;                    // välillä pieni heilahdus
    if (t > 1.5 && vaihe < 1.2) kulma = Math.sin(vaihe / 1.2 * Math.PI * 2) * 0.022;
  }
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.translate(jx + rw/2, jy - hyppy);
  ctx.rotate(kulma);
  ctx.imageSmoothingEnabled = false;
  if (kirkkaus < 1) ctx.filter = `brightness(${kirkkaus}) saturate(${0.4 + 0.6*kirkkaus})`;
  ctx.drawImage(roboKuva, -rw/2, -rh, rw, rh);
  ctx.filter = 'none';
  if (t > 0) {
    const syt = Math.min(1, t / 0.35);
    ctx.globalCompositeOperation = 'lighter';
    // silmät hehkuvat punaisina, hidas syke
    const syke = 0.75 + 0.25 * Math.sin(t * 2.4);
    for (const [sx, sy] of RS.silmat) {
      const ex = -rw/2 + sx*px, ey = -rh + sy*px;
      const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, px*2.6);
      g.addColorStop(0, `rgba(255,90,70,${0.95*syt*syke})`);
      g.addColorStop(0.4, `rgba(255,40,30,${0.45*syt*syke})`);
      g.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(ex - px*3, ey - px*3, px*6, px*6);
    }
    // antennien kärjet vilkkuvat vuorotellen
    RS.antennit.forEach(([ax, ay], i) => {
      if (Math.floor(t * 1.6 + i) % 2) return;
      const x = -rw/2 + ax*px, y = -rh + ay*px;
      const g = ctx.createRadialGradient(x, y, 0, x, y, px*1.8);
      g.addColorStop(0, `rgba(255,230,140,${syt})`); g.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = g; ctx.fillRect(x - px*2, y - px*2, px*4, px*4);
    });
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

function kaynnista(){
  kaynnissa = true; t0 = performance.now();
  katse = { x: 0, y: 0 }; kohde = { x: 0, y: 0 };
  seurKatse = 3.6; seurRapsy = 4.2; rapsyAlku = -9; seurHairio = 8; hairioAlku = -9;
  uusiPeli(); seurAskel = 0; haamu = null;
  cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
}
function pysayta(){
  kaynnissa = false; cancelAnimationFrame(raf);
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0, 0, cv.width, cv.height);
}

window.naytaMurrokset = function(p){
  if (p && p.murrokset) { if (!kaynnissa) kaynnista(); }
  else if (kaynnissa) pysayta();
};
})();
