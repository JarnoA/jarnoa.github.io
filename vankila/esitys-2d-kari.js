// ============================================================================
// KARIN SIVUT (11.10.2026, Mikkeli, Jarno: "ei klikkauksia, muuten nuo").
// Käyttö esitys-data.js:ssä: `kari: 'tv'` (x:600) tai `kari: 'sanky'` (x:640).
//
//  tv     Vanha CRT-televisio, kuvassa lumisadetta. Välillä lumen keskellä
//         väreilee vääristynyt kohta (Kari vertaa henkiä häiriökuvaan ja kuuman
//         ilman väreilyyn) ja katoaa. Kulmassa vilkkuu "1 uusi viesti".
//  sanky  Sänky, peiton alla joku hengittää - tyynyllä ei päätä. Nuotteja,
//         peitto lehahtaa, kolme lakanahaamua lipuu ovesta ulos; viimeinen
//         kääntyy ovella ja painaa korvansa kiinni. Toistuu (ajastettu, ei klikkauksia).
// Pikselitaide 64x64, vasen puoli ruutua (teksti oikealla), tekstin alla (z 4).
// Ei ihmisiä: haamut ovat lakanoita.
// ============================================================================
(function(){
'use strict';
const R = 64;
const cv = document.createElement('canvas');
cv.id = 'kari';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .4s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
const lc = document.createElement('canvas'); lc.width = R; lc.height = R;
const g = lc.getContext('2d');

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();
const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

let ac = null;
function aani(f, kesto, voim, tyyppi, viive){
  try { if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)();
    const t = ac.currentTime + (viive || 0), o = ac.createOscillator(), v = ac.createGain();
    o.type = tyyppi || 'sine'; o.frequency.value = f; v.gain.setValueAtTime(voim, t); v.gain.exponentialRampToValueAtTime(.0001, t + kesto);
    o.connect(v).connect(ac.destination); o.start(t); o.stop(t + kesto + .02); } catch(e) {}
}

function piirraIsolle(x0f, yAla, kokoH){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const S = Math.min(H*kokoH, W*.42), x0 = W*x0f, y0 = H*yAla - S;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lc, x0, y0, S, S);
  return { x0, y0, S };
}

// ---------------------------------------------------------------- TV
function tv(t){
  g.clearRect(0, 0, R, R);
  // antenni
  px(26, 6, 1, 10, '#8a8a90'); px(25, 5, 1, 1, '#8a8a90'); px(37, 6, 1, 10, '#8a8a90'); px(38, 5, 1, 1, '#8a8a90');
  for (let i = 0; i < 6; i++) { px(26 + i, 16 - i, 1, 1, '#8a8a90'); px(37 - i, 16 - i, 1, 1, '#8a8a90'); }
  // kotelo
  px(6, 16, 52, 40, '#6b4a2b'); px(6, 16, 52, 2, '#8a6239'); px(56, 16, 2, 40, '#4a3220');
  px(10, 20, 36, 30, '#1a1a1e');                                             // kehys
  px(49, 22, 5, 5, '#c9c9cf'); px(49, 30, 5, 5, '#c9c9cf');                  // nupit
  px(48, 40, 7, 1, '#3a2717'); px(48, 43, 7, 1, '#3a2717'); px(48, 46, 7, 1, '#3a2717');
  px(12, 56, 6, 4, '#3a2717'); px(46, 56, 6, 4, '#3a2717');                  // jalat
  // lumisade + väreily
  const jakso = t % 4, vaareily = jakso > 2.2 && jakso < 3.4 ? Math.sin((jakso - 2.2) / 1.2 * Math.PI) : 0;
  for (let y = 0; y < 26; y++) for (let x = 0; x < 32; x++) {
    let v = Math.random();
    const dx = x - 16, dy = y - 13, sisalla = (dx*dx)/36 + (dy*dy)/90 < 1;   // pystysuora soikio
    if (sisalla && vaareily > 0) v = .35 + .3*Math.sin(y*.9 + t*14) * vaareily + (Math.random()-.5)*.15;
    const c = Math.round(60 + v*170);
    px(12 + x, 22 + y, 1, 1, `rgb(${c},${c},${c + 8})`);
  }
  // kirjekuori-ikoni vilkkuu
  if (Math.floor(t*2) % 2 === 0) { px(37, 23, 7, 5, '#f2c94c'); px(37, 23, 7, 1, '#b88a14'); px(38, 24, 1, 1, '#b88a14'); px(42, 24, 1, 1, '#b88a14'); px(39, 25, 3, 1, '#b88a14'); }
  const b = piirraIsolle(.04, .93, .62);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f2c94c';
  ctx.font = `700 ${Math.round(b.S*.045)}px Georgia, serif`;
  ctx.fillText('1 uusi viesti netin pimennoista', b.x0 + b.S*.5, b.y0 + b.S*.03);
}

// ---------------------------------------------------------------- SÄNKY
const JAKSO = 11;
function haamu(x, y, korvat, kaanto){
  const c = '#f2f2f7', v = '#c9c9d6';
  px(x + 2, y, 6, 1, c); px(x + 1, y + 1, 8, 2, c); px(x, y + 3, 10, 7, c);
  for (let i = 0; i < 10; i += 2) px(x + i, y + 10, 1, 1 + ((i/2) % 2), c);   // aaltoileva helma
  px(x + 9, y + 3, 1, 7, v);
  const ex = kaanto ? 2 : 4;                                                   // silmät (kääntyy katsomaan taakse)
  px(x + ex, y + 4, 1, 2, '#1b1b1f'); px(x + ex + 3, y + 4, 1, 2, '#1b1b1f');
  if (korvat) { px(x - 1, y + 2, 2, 3, c); px(x + 9, y + 2, 2, 3, c); }        // "kädet" korvilla
}
let viimeJakso = -1;
function sanky(t){
  g.clearRect(0, 0, R, R);
  const k = t % JAKSO, jakso = Math.floor(t / JAKSO);
  // ovi oikealla
  px(54, 18, 9, 34, '#3a2717'); px(55, 19, 7, 33, '#5c3e24'); px(60, 34, 1, 2, '#d9a62e');
  // lattia
  px(0, 52, R, 12, '#2a2230');
  // sänky
  px(4, 24, 4, 28, '#6b4a2b'); px(4, 24, 4, 2, '#8a6239');                    // pääty
  px(44, 36, 3, 16, '#6b4a2b');                                                // jalkopää
  px(6, 40, 40, 6, '#d8d3c4');                                                 // patja
  px(8, 36, 9, 4, '#f4f1e6'); px(8, 36, 9, 1, '#ffffff');                     // tyyny (tyhjä!)
  // peitto: kohouma hengittää, lehahtaa, lopuksi litteä
  const tyhja = k > 3.6;
  let kohouma = tyhja ? 0 : 4 + Math.sin(k*2.2)*1.2;
  if (k > 3.4 && k < 4.0) kohouma = 4 + (k - 3.4)/.6 * 10;                    // lehahdus
  const pY = 38 - Math.round(kohouma);
  for (let x = 16; x < 46; x++) {
    const u = (x - 16) / 30, h = Math.round(Math.sin(u*Math.PI) * kohouma);
    px(x, 39 - h, 1, 3 + h, x % 4 === 0 ? '#5a74b8' : '#4a64a8');
  }
  // nuotit
  if (k > 2.6 && k < 6) for (let i = 0; i < 3; i++) {
    const nk = k - 2.6 - i*.4; if (nk < 0) continue;
    const nx = 50 - i*6 + Math.sin(nk*3)*2, ny = 30 - nk*6;
    px(nx, ny, 2, 2, '#f2c94c'); px(nx + 1, ny - 4, 1, 4, '#f2c94c'); px(nx + 1, ny - 4, 2, 1, '#f2c94c');
  }
  // haamut
  if (k > 3.6) for (let i = 0; i < 3; i++) {
    const hk = k - 3.6 - i*.5; if (hk < 0) continue;
    const viimeinen = i === 2;
    let x = 24 + i*4 + hk*9, y = pY - 8 - Math.min(1, hk)*6 + Math.sin(hk*4)*1.5;
    let korvat = false, kaanto = false;
    if (viimeinen) {                                                           // pysähtyy ovelle, korvat kiinni
      const ovi = 46;
      if (x >= ovi && hk < 5.2) { x = ovi; kaanto = true; korvat = hk > 3.2; }
      else if (x >= ovi) x = ovi + (hk - 5.2)*14;
    }
    if (x < 58) haamu(x, y, korvat, kaanto);
  }
  if (jakso !== viimeJakso) { viimeJakso = jakso; aani(220, .5, .02, 'sine', 3.6); aani(330, .5, .02, 'sine', 3.75); }
  piirraIsolle(.04, .95, .62);
}

// ---------------------------------------------------------------- ohjaus
let tila = null, alku = 0, raf = 0;
function silmukka(ms){
  if (!tila) return;
  const t = (ms - alku) / 1000;
  if (tila === 'tv') tv(t); else if (tila === 'sanky') sanky(t);
  raf = requestAnimationFrame(silmukka);
}
window.naytaKari = function(p){
  const uusi = p && p.kari ? p.kari : null;
  if (uusi === tila) return;
  tila = uusi; cancelAnimationFrame(raf);
  if (!tila) { cv.style.opacity = 0; return; }
  alku = performance.now(); viimeJakso = -1;
  cv.style.opacity = 1;
  raf = requestAnimationFrame(silmukka);
};
})();
