// ============================================================================
// MONTAASIN NOPEAT ANIMAATIOT (TF 15.10.2026, Jarno: "some more fast
// animations to these"). Soivat montaasin rivin TOISELLA klikkauksella (kun
// kone lukee rivin), taustalla, haaleina - punainen otsikko pysyy pääosassa.
// Eiffel-kasa on omassa tiedostossaan (esitys-2d-eiffel.js).
// Käyttö esitys-data.js:ssä: `montaasiAnim: 'suomi'|'lusikat'|'pisarat'|'tulva'|'joki'|'burger'`
//   suomi   - Suomen pikselisiluetti, kaupunkien valot syttyvät kunnes koko maa hehkuu ja välkkyy
//   lusikat - kaksi pikselilusikkaa, vesipisarat täyttävät ne
//   pisarat - pisararuudukko täyttyy kiihtyen (1 pisara = 1 000 ihmistä)
//   tulva   - vesi nousee nopeasti aalto aallolta (Fantasian tulva ilman luutia/Mikkiä)
//   joki    - joki virtaa alhaalla, höyry nousee ja joki madaltuu
//   burger  - kuvat/burger.png putoaa, litistyy ja pomppaa
// ============================================================================
(function(){
'use strict';
const ALPHA = 0.8;
const KELTA = '#f2c94c', VESI = '#5fb0e8', VESI_TUMMA = '#2f6fa8', VAAHTO = '#d8f0ff';

// Suomi 16 x 26 (karkea siluetti: Lapin "käsivarsi" vasemmalla ylhäällä)
const SUOMI = [
  '.....XX.........', '.....XXX........', '.XX..XXX........', '..XXXXXX........', '...XXXXX........',
  '....XXXXX.......', '....XXXXX.......', '....XXXXXX......', '.....XXXXX......', '.....XXXXXX.....',
  '.....XXXXXX.....', '....XXXXXXX.....', '....XXXXXXXX....', '...XXXXXXXXX....', '...XXXXXXXXXX...',
  '...XXXXXXXXXX...', '..XXXXXXXXXXX...', '..XXXXXXXXXXXX..', '..XXXXXXXXXXXX..', '..XXXXXXXXXXXXX.',
  '..XXXXXXXXXXXXX.', '..XXXXXXXXXXXXX.', '...XXXXXXXXXXX..', '...XXXXXXXXXX...', '....XXXXXXXX....', '.....XXXXX......',
];
const BURGER = new Image(); BURGER.src = 'kuvat/burger.png';

const cv = document.createElement('canvas');
cv.id = 'montaasi';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;opacity:0;transition:opacity .4s ease;';
const ctx = cv.getContext('2d');
function liita(){ document.body.appendChild(cv); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

let tyyppi = null, aktiivinen = false, rafId = 0, alkuT = 0, edT = 0, tila = {};
const sat = (a, b) => a + Math.random()*(b - a);

function alusta(t){
  tila = {};
  if (t === 'suomi') {
    const pist = [];
    SUOMI.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'X') pist.push({ x, y, syttyy: Math.random() }); }));
    pist.sort((a, b) => a.syttyy - b.syttyy); tila.pist = pist;
  }
  if (t === 'lusikat') tila.pisarat = [], tila.taytto = [0, 0], tila.seur = 0;
  if (t === 'pisarat') tila.n = 0;
  if (t === 'joki') tila.hoyry = [];
}

function suomi(k){
  const s = Math.round(H*0.017), x0 = W*0.08, y0 = H*0.30, n = tila.pist.length;
  const valot = Math.floor(n * Math.min(1, k / 0.75));
  tila.pist.forEach((p, i) => {
    const pala = i < valot;
    const valk = k > 0.8 ? (Math.sin(k*90 + i) > -0.3 ? 1 : 0.25) : 1;        // ylikuorma: välkkyy
    ctx.fillStyle = pala ? KELTA : 'rgba(120,135,165,0.55)';
    ctx.globalAlpha = ALPHA * (pala ? valk : 0.6);
    ctx.fillRect(x0 + p.x*s, y0 + p.y*s, s - 1, s - 1);
    if (pala) { ctx.globalAlpha = ALPHA * 0.18 * valk; ctx.fillRect(x0 + p.x*s - s, y0 + p.y*s - s, s*3, s*3); }
  });
}

function lusikka(cx, cy, s, taytto){
  ctx.fillStyle = '#c9ced8';
  ctx.fillRect(cx - s*7, cy - s, s*5, s*2);                                   // varsi
  ctx.beginPath(); ctx.ellipse(cx + s*2, cy, s*4, s*2.4, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#8e95a3';
  ctx.beginPath(); ctx.ellipse(cx + s*2, cy, s*3.2, s*1.7, 0, 0, Math.PI*2); ctx.fill();
  if (taytto > 0) { ctx.fillStyle = VESI;
    ctx.beginPath(); ctx.ellipse(cx + s*2, cy + s*1.7*(1 - taytto)*0.6, s*3.2*Math.sqrt(taytto), s*1.7*taytto, 0, 0, Math.PI*2); ctx.fill(); }
}
function lusikat(k, dt){
  const s = Math.max(4, H*0.012), y = H*0.62, xs = [W*0.12, W*0.26];
  if (k < 0.9 && edT >= tila.seur) { const i = Math.random() < 0.5 ? 0 : 1; tila.pisarat.push({ i, x: xs[i] + s*2, y: H*0.35, vy: 0 }); tila.seur = edT + 0.12; }
  tila.pisarat.forEach(p => { p.vy += H*2.5*dt; p.y += p.vy*dt; if (p.y >= y && !p.valmis) { p.valmis = true; tila.taytto[p.i] = Math.min(1, tila.taytto[p.i] + 0.08); } });
  tila.pisarat = tila.pisarat.filter(p => !p.valmis);
  ctx.globalAlpha = ALPHA;
  xs.forEach((x, i) => lusikka(x, y, s, tila.taytto[i]));
  ctx.fillStyle = VESI; tila.pisarat.forEach(p => ctx.fillRect(p.x - s*0.4, p.y - s, s*0.8, s*1.4));
}

function pisarat(k){
  const sar = 50, riv = 10, maara = sar*riv;                                 // 500 pisaraa = 500 000 ihmistä (leveä kaista alhaalla, otsikon alla)
  const n = Math.floor(maara * Math.pow(Math.min(1, k / 0.9), 1.8));          // kiihtyy
  const s = Math.min(H*0.016, W*0.94/(sar*1.25)), x0 = W*0.03, y0 = H*0.62;
  ctx.globalAlpha = ALPHA; ctx.fillStyle = '#9fd4ff';
  for (let i = 0; i < n; i++) {
    const x = x0 + (i % sar)*s*1.25, y = y0 + Math.floor(i / sar)*s*1.6;
    ctx.fillRect(x + s*0.3, y, s*0.4, s*0.3); ctx.fillRect(x + s*0.15, y + s*0.3, s*0.7, s*0.6);
  }
  ctx.globalAlpha = ALPHA*0.9; ctx.fillStyle = '#d6e6ff'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.font = `italic 600 ${Math.round(H*0.022)}px Georgia,serif`;
  ctx.fillText('1 drop = 1,000 people', x0, y0 + riv*s*1.6 + s*0.6);
}

function aalto(y0, amp, pit, nop, t, vaihe){
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, y0 + Math.sin(x/pit + t*nop + vaihe)*amp + Math.sin(x/(pit*0.43) - t*nop*1.3)*amp*0.4);
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
}
function tulva(k, t){
  const nousu = 1 - Math.pow(1 - Math.min(1, k / 0.85), 2);                 // nopea nousu, hidastuu lopussa
  const pinta = H - H*0.38*nousu;
  ctx.globalAlpha = 0.55; ctx.fillStyle = VESI_TUMMA; aalto(pinta + H*0.03, H*0.012, 70, 2.2, t, 0);
  ctx.globalAlpha = 0.6;  ctx.fillStyle = VESI;       aalto(pinta + H*0.012, H*0.016, 95, 2.8, t, 2);
  ctx.globalAlpha = 0.75; ctx.fillStyle = VAAHTO;
  for (let x = 0; x < W; x += 14) { const y = pinta + Math.sin(x/95 + t*2.8 + 2)*H*0.016 + Math.sin(x/(95*0.43) - t*3.64)*H*0.0064; ctx.fillRect(x, y - 2, 8, 3); }
}

function joki(k, t, dt){
  const korkeus = H*0.07*(1 - 0.7*Math.min(1, k / 0.9)), y = H*0.94 - korkeus;
  ctx.globalAlpha = ALPHA; ctx.fillStyle = VESI_TUMMA; ctx.fillRect(0, y, W, korkeus);
  ctx.fillStyle = VESI;
  for (let x = -60; x < W; x += 60) { const xx = ((x + t*120) % (W + 60)) - 30; ctx.fillRect(xx, y + korkeus*0.35, 26, 2); }
  if (Math.random() < 0.6) tila.hoyry.push({ x: sat(0, W), y, r: sat(H*0.008, H*0.016), ika: 0, kesto: sat(1.4, 2.4) });
  tila.hoyry.forEach(h => { h.ika += dt; h.y -= H*0.09*dt; h.x += Math.sin(h.ika*3)*0.4; });
  tila.hoyry = tila.hoyry.filter(h => h.ika < h.kesto);
  ctx.fillStyle = '#ffffff';
  tila.hoyry.forEach(h => { ctx.globalAlpha = 0.45*(1 - h.ika/h.kesto); const r = h.r*(1 + h.ika); ctx.fillRect(h.x - r, h.y - r, r*2, r*2); });
}

function burger(k){
  if (!BURGER.complete) return;
  const s = H*0.22, maa = H*0.9, x = W*0.2;
  const putoaa = Math.min(1, k / 0.25), y = -s + (maa - s/2 + s) * putoaa*putoaa;
  let sx = 1, sy = 1;
  if (k > 0.25) { const b = (k - 0.25) / 0.75, v = Math.exp(-b*5)*Math.cos(b*28); sx = 1 + 0.25*v; sy = 1 - 0.25*v; } // litistys + pomppu
  ctx.globalAlpha = 0.95; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(BURGER, x - s*sx/2, (k > 0.25 ? maa : y + s/2) - s*sy, s*sx, s*sy);
}

const KESTO = { suomi: 3.6, lusikat: 3.4, pisarat: 8.7, tulva: 5.0, joki: 8.0, burger: 4.4 }; // = äänitiedostojen pituudet
function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms/1000, dt = Math.min(0.05, t - edT || 0); edT = t;
  const k = Math.min(1, (t - alkuT) / KESTO[tyyppi]);
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H); ctx.globalAlpha = 1;
  if (tyyppi === 'suomi') suomi(k);
  else if (tyyppi === 'lusikat') lusikat(k, dt);
  else if (tyyppi === 'pisarat') pisarat(k);
  else if (tyyppi === 'tulva') tulva(k, t);
  else if (tyyppi === 'joki') joki(k, t, dt);
  else if (tyyppi === 'burger') burger(k);
  ctx.globalAlpha = 1;
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaMontaasi = function(p){
  if (p && p.montaasiAnim && KESTO[p.montaasiAnim]) {
    tyyppi = p.montaasiAnim; alusta(tyyppi);
    alkuT = performance.now()/1000; edT = alkuT; aktiivinen = true; cv.style.opacity = 1;
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
    return;
  }
  if (!aktiivinen) return;
  aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
};
})();
