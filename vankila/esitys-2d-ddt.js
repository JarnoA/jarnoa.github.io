// ============================================================================
// DDT-SIVUT (11.10.2026, Mikkeli, Jarno: "rakenna kaikki").
// Käyttö esitys-data.js:ssä: `ddt: 'posti'` (x:570) tai `ddt: 'intro'` (x:592).
//
//  posti  600 pelilevyä viikossa kirjeissä: kirjekuoren postimerkkiin paukahtaa
//         leima, pyyhekumi hankaa sen pois, autolakka kiiltää ja merkki on taas
//         kuin uusi. Vieressä laskuri "600 / viikko". Toistuu n. 5 s välein.
//  intro  Legendat elävät: 90-luvun crack-intro CRT-ruudussa - copper-palkit,
//         tähtikenttä, ACCESSION-logo ja siniaaltoscrolleri.
// Oikea puoli ruutua (teksti vasemmalla). Tekstin alla (z 4). Ei ihmisiä.
// ============================================================================
(function(){
'use strict';
const cv = document.createElement('canvas');
cv.id = 'ddt';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .4s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
const R = 64;
const lc = document.createElement('canvas'); lc.width = R; lc.height = R;
const g = lc.getContext('2d');

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

let ac = null;
function aani(f, kesto, voim, tyyppi, viive){
  try { if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)();
    const t = ac.currentTime + (viive || 0), o = ac.createOscillator(), v = ac.createGain();
    o.type = tyyppi || 'square'; o.frequency.value = f; v.gain.setValueAtTime(voim, t); v.gain.exponentialRampToValueAtTime(.0001, t + kesto);
    o.connect(v).connect(ac.destination); o.start(t); o.stop(t + kesto + .02); } catch(e) {}
}
const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

// ---------------------------------------------------------------- POSTI
const JAKSO = 5;
let viimeJakso = -1;
function posti(t){
  g.clearRect(0, 0, R, R);
  const k = t % JAKSO, jakso = Math.floor(t / JAKSO);
  // kirjekuori
  px(4, 18, 56, 34, '#efe6cf'); px(4, 18, 56, 1, '#fff8e6'); px(59, 18, 1, 34, '#c9bd9c'); px(4, 51, 56, 1, '#c9bd9c');
  for (let i = 0; i < 28; i++) { px(4 + i, 18 + Math.floor(i*.55), 1, 1, '#d8ccaa'); px(59 - i, 18 + Math.floor(i*.55), 1, 1, '#d8ccaa'); }
  px(10, 36, 22, 1, '#9a917a'); px(10, 40, 18, 1, '#9a917a'); px(10, 44, 20, 1, '#9a917a');   // osoite
  // postimerkki (sahalaita)
  const mx = 42, my = 21;
  px(mx, my, 14, 16, '#ffffff');
  for (let i = 0; i < 14; i += 2) { px(mx + i, my - 1, 1, 1, '#ffffff'); px(mx + i, my + 16, 1, 1, '#ffffff'); }
  for (let i = 0; i < 16; i += 2) { px(mx - 1, my + i, 1, 1, '#ffffff'); px(mx + 14, my + i, 1, 1, '#ffffff'); }
  px(mx + 2, my + 2, 10, 12, '#3f7fc4'); px(mx + 2, my + 9, 10, 5, '#5f9f4e');                 // maisema
  px(mx + 7, my + 4, 3, 3, '#f2c94c');                                                           // aurinko
  // leima: paukahtaa 0.4 s, pyyhitään 1.4-2.8 s
  const leimaA = k < .4 ? 0 : k < 1.4 ? 1 : Math.max(0, 1 - (k - 1.4)/1.4);
  if (leimaA > 0) {
    g.globalAlpha = leimaA * .85;
    const lx = mx + 3, ly = my + 3;
    for (let a = 0; a < 24; a++) { const r = 6; px(lx + 4 + Math.cos(a/24*6.283)*r, ly + 5 + Math.sin(a/24*6.283)*r, 1, 1, '#1b1b1f'); }
    for (let i = 0; i < 4; i++) for (let x = -8; x < 10; x++) px(lx + 4 + x, ly + 1 + i*3 + Math.round(Math.sin((x + i)*.9)), 1, 1, '#1b1b1f');
    g.globalAlpha = 1;
  }
  // kumileimasin tulee ylhäältä
  if (k < .6) { const y = k < .3 ? -14 + k/.3*22 : 8 - (k - .3)/.3*22; px(mx + 2, y, 10, 4, '#2b2b30'); px(mx + 5, y - 8, 4, 8, '#8a5a2b'); }
  // pyyhekumi hankaa
  if (k > 1.4 && k < 2.8) { const x = mx + 3 + Math.sin(k*28)*3; px(x, my + 4, 9, 6, '#f29bb0'); px(x, my + 4, 9, 2, '#3f6fb8'); }
  // autolakan kiilto pyyhkäisee
  if (k > 2.9 && k < 3.6) { const s = (k - 2.9)/.7 * 22; for (let i = 0; i < 16; i++) { const x = mx - 4 + s - i*.5; if (x > mx && x < mx + 14) px(x, my + i, 2, 1, 'rgba(255,255,255,.75)'); } }
  if (jakso !== viimeJakso) { viimeJakso = jakso; aani(140, .18, .12, 'triangle', .3); }
  if (k > 1.4 && k < 2.8 && Math.random() < .08) aani(2400 + Math.random()*600, .03, .012, 'sawtooth');

  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const S = Math.min(H*.6, W*.38), x0 = W*.94 - S, y0 = H*.80 - S;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lc, x0, y0, S, S);
  // laskuri
  const n = Math.min(600, Math.round(t / 2.6 * 600));
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f2c94c'; ctx.font = `700 ${Math.round(S*.16)}px Georgia, serif`;
  ctx.fillText(String(n), x0 + S*.5, y0 + S*.2);
  ctx.fillStyle = '#f6efe4'; ctx.font = `${Math.round(S*.055)}px Georgia, serif`;
  ctx.fillText('pelilevyä / viikko', x0 + S*.5, y0 + S*.27);
}

// ---------------------------------------------------------------- INTRO
const SCROLL = '   CRACKED BY ACCESSION ...  DDT WAS HERE ...  1 + 3 RULE: UPLOAD ONE, GET THREE ...  GREETINGS TO MIKKELI ...  LEGENDS NEVER DIE ...      ';
let tahdet = null, jingle = false;
function intro(t){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const w = Math.min(W*.46, H*.78), h = w*.75, x0 = W*.95 - w, y0 = H*.12;
  // CRT-kehys
  ctx.fillStyle = '#2a2a30'; ctx.fillRect(x0 - w*.04, y0 - w*.04, w*1.08, h + w*.08);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
  ctx.fillStyle = '#000'; ctx.fillRect(x0, y0, w, h);
  // tähtikenttä
  if (!tahdet) tahdet = Array.from({length: 70}, () => ({ x: Math.random(), y: Math.random(), v: .05 + Math.random()*.3 }));
  for (const s of tahdet) { const x = x0 + ((s.x - t*s.v) % 1 + 1) % 1 * w; ctx.fillStyle = s.v > .2 ? '#fff' : '#777'; ctx.fillRect(x, y0 + s.y*h, s.v > .2 ? 2 : 1, s.v > .2 ? 2 : 1); }
  // copper-palkit
  const varit = ['#ff2d55', '#ffcc00', '#34c759', '#00c7ff', '#af52de'];
  for (let i = 0; i < 5; i++) {
    const cy = y0 + h*.18 + Math.sin(t*1.8 + i*.55)*h*.1, bh = h*.035;
    const gr = ctx.createLinearGradient(0, cy - bh, 0, cy + bh);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.5, varit[i]); gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(x0, cy - bh, w, bh*2);
  }
  // logo
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(h*.13)}px "Courier New", monospace`;
  const logo = 'ACCESSION';
  for (let i = 0; i < logo.length; i++) {
    const lx = x0 + w/2 + (i - (logo.length-1)/2) * h*.085, ly = y0 + h*.45 + Math.sin(t*3 + i*.5)*h*.025;
    ctx.fillStyle = `hsl(${(t*120 + i*30) % 360},90%,60%)`; ctx.fillText(logo[i], lx, ly);
  }
  ctx.font = `700 ${Math.round(h*.05)}px "Courier New", monospace`; ctx.fillStyle = '#bbb';
  ctx.fillText('PRESENTS', x0 + w/2, y0 + h*.58);
  // siniaaltoscrolleri
  ctx.font = `900 ${Math.round(h*.075)}px "Courier New", monospace`;
  const cw = h*.05, siirto = (t*h*.32) % (SCROLL.length*cw);
  for (let i = 0; i < SCROLL.length; i++) {
    const x = x0 + w + i*cw - siirto; if (x < x0 - cw || x > x0 + w + cw) continue;
    ctx.fillStyle = `hsl(${(i*12 + t*80) % 360},100%,70%)`;
    ctx.fillText(SCROLL[i], x, y0 + h*.8 + Math.sin(t*4 + x*.02)*h*.05);
  }
  // CRT-juovat
  ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < h; y += 3) ctx.fillRect(x0, y0 + y, w, 1);
  ctx.restore();
  if (!jingle) { jingle = true; [523, 659, 784, 1046, 784, 1046].forEach((f, i) => aani(f, .12, .035, 'square', i*.13)); }
}

// ---------------------------------------------------------------- ohjaus
let tila = null, alku = 0, raf = 0;
function silmukka(ms){
  if (!tila) return;
  const t = (ms - alku) / 1000;
  if (tila === 'posti') posti(t); else if (tila === 'intro') intro(t);
  raf = requestAnimationFrame(silmukka);
}
window.naytaDdt = function(p){
  const uusi = p && p.ddt ? p.ddt : null;
  if (uusi === tila) return;
  tila = uusi; cancelAnimationFrame(raf);
  if (!tila) { cv.style.opacity = 0; return; }
  alku = performance.now(); viimeJakso = -1; jingle = false;
  cv.style.opacity = 1;
  raf = requestAnimationFrame(silmukka);
};
})();
