// ============================================================================
// ATLANTIS NOUSEE NÄSINNEULAN ALTA (11.10.2026, Mikkeli x:510 + x:520, Jarno:
// "voidaan rakentaa atlantis nousemaan näsinneulan alta? se kahdelle sivulle").
//
// Käyttö esitys-data.js:ssä: `atlantis: 1` tai `atlantis: 2`.
//   1 = poikkileikkaus: Näsinneula seisoo, maan alla luolassa hehkuu turkoosi
//       Atlantis. Maa tärähtää välillä (Mian koulun saappaat kaatuivat).
//   2 = Atlantis nousee: maa jyrisee, kokkareet lentävät, Atlantis työntyy
//       pintaan ja nostaa Näsinneulan kupolinsa päälle. Jää hehkumaan.
// Pikselitaide: piirretään pieneen 128x128-kanvaasiin ja skaalataan ilman
// pehmennystä, jotta jälki sopii taustojen pikselityyliin. Vasen puoli
// ruutua (teksti on oikealla). Tekstin alla (z 4). Ei ihmisiä.
// ============================================================================
(function(){
'use strict';
const R = 128;                                  // matalaresoluutioinen kangas
const PINTA = 66;                               // maan pinta (R-koordinaatit)
const NOUSU = 40;                               // kuinka paljon Atlantis nousee
const NOUSU_KESTO = 3.2;                        // s
const YLA = 56;                                 // lisätilaa ylös: Näsinneulan huippu ei leikkaudu nousun jälkeen

const cv = document.createElement('canvas');
cv.id = 'atlantis';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
const lc = document.createElement('canvas'); lc.width = R; lc.height = R + YLA;
const g = lc.getContext('2d');

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

// ---------- ääni: matala jyrinä ----------
let ac = null;
function jyrina(kesto, voim){
  try {
    if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)();
    const t = ac.currentTime, b = ac.createBuffer(1, Math.ceil(ac.sampleRate*kesto), ac.sampleRate), d = b.getChannelData(0);
    for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), v = ac.createGain();
    s.buffer = b; f.type = 'lowpass'; f.frequency.value = 110;
    v.gain.setValueAtTime(.0001, t); v.gain.exponentialRampToValueAtTime(voim, t + .4); v.gain.exponentialRampToValueAtTime(.0001, t + kesto);
    s.connect(f).connect(v).connect(ac.destination); s.start(t);
  } catch(e) {}
}

// ---------- apurit ----------
const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
function kohina(i){ const s = Math.sin(i*127.1 + 311.7)*43758.5453; return s - Math.floor(s); }

// Maakerrokset: rosoiset rajat, deterministinen kohina.
const KERROKSET = [
  { y: PINTA + 2, c: '#6e4b2c' }, { y: PINTA + 14, c: '#5c3e24' },
  { y: PINTA + 28, c: '#4b321d' }, { y: PINTA + 44, c: '#3a2717' },
];
function piirraMaa(reika){
  for (let x = 0; x < R; x++) {
    const pohja = R - 2 - Math.round(kohina(x*.7)*5);            // rosoinen alareuna
    for (let k = 0; k < KERROKSET.length; k++) {
      const y0 = KERROKSET[k].y + (k ? Math.round(kohina(x*.31 + k*9)*3) : 0);
      const y1 = k + 1 < KERROKSET.length ? KERROKSET[k+1].y + Math.round(kohina(x*.31 + (k+1)*9)*3) : pohja;
      if (y1 > y0) px(x, y0, 1, Math.max(0, Math.min(y1, pohja) - y0), KERROKSET[k].c);
    }
    px(x, PINTA, 1, 2, x % 3 ? '#5f8f4e' : '#6fa35a');             // nurmi
  }
  // kiviä
  for (let i = 0; i < 26; i++) px(Math.floor(kohina(i*3.3)*R), PINTA + 5 + Math.floor(kohina(i*7.7)*52), 2, 1, '#2c1d11');
  if (reika) {                                                       // luola Atlantiksen ympärillä
    g.fillStyle = '#140d08';
    g.beginPath(); g.ellipse(reika.x, reika.y, reika.rx, reika.ry, 0, 0, Math.PI*2); g.fill();
  }
}

// Näsinneula: varsi kapenee, näköalakiekko, antenni, punainen valo.
function piirraNeula(cx, maaY, t, tarina){
  const runko = '#e3ddcf', varjo = '#b9b2a2', ikkuna = '#ffe9a6';
  const korkeus = 54;
  for (let y = 0; y < korkeus - 6; y++) {                          // varsi
    const w = Math.round(6 - y*3/korkeus);
    px(cx - w/2 + tarina, maaY - y, w, 1, runko);
    px(cx + w/2 - 1 + tarina, maaY - y, 1, 1, varjo);
  }
  const ky = maaY - korkeus + 4;                                      // kiekko
  px(cx - 8 + tarina, ky, 16, 2, varjo);
  px(cx - 9 + tarina, ky - 3, 18, 3, runko);
  px(cx - 7 + tarina, ky - 5, 14, 2, varjo);
  for (let i = 0; i < 6; i++) px(cx - 7 + i*3 + tarina, ky - 2, 1, 1, ikkuna);
  px(cx + tarina, ky - 14, 1, 9, varjo);                              // antenni
  if (Math.floor(t*1.6) % 2 === 0) px(cx + tarina, ky - 15, 1, 1, '#ff3b30');
}

// Atlantis: kolme kupolia, pylväitä, tornit. Keskikupolin laki = Näsinneulan jalusta.
const T1 = '#3fe0d0', T2 = '#1fa7a0', T3 = '#b8fff6', T4 = '#0f6e6a';
function kupoli(cx, by, r, c1, c2){
  for (let y = 0; y <= r; y++) {
    const w = Math.round(Math.sqrt(r*r - y*y))*2 + 1;
    px(cx - (w-1)/2, by - y, w, 1, y < r*.35 ? c2 : c1);
  }
}
function piirraAtlantis(cx, by, t, kirkkaus){
  g.globalAlpha = kirkkaus;
  px(cx - 30, by, 61, 3, T4);                                         // jalusta
  px(cx - 28, by - 1, 57, 1, T2);
  for (let i = -26; i <= 26; i += 6) { px(cx + i, by - 12, 2, 12, T2); px(cx + i, by - 13, 2, 1, T3); }   // pylväät
  px(cx - 28, by - 15, 57, 2, T1);                                    // palkki
  kupoli(cx - 19, by - 15, 6, T2, T1);
  kupoli(cx + 19, by - 15, 6, T2, T1);
  kupoli(cx, by - 15, 11, T1, T3);
  for (const s of [-27, 27]) {                                        // tornit
    px(cx + s - 1, by - 26, 3, 11, T2); px(cx + s, by - 30, 1, 4, T3);
  }
  // ikkunat tuikkivat
  for (let i = 0; i < 9; i++) if (Math.sin(t*3 + i*1.7) > .3) px(cx - 24 + i*6, by - 7, 1, 2, T3);
  g.globalAlpha = 1;
  return by - 15 - 11;                                                // keskikupolin laki
}

// ---------- tila ----------
let vaihe = 0, alku = 0, raf = 0, kokkareet = [], tarahdys = 0, jyrinaSoitettu = false;

function silmukka(ms){
  if (!vaihe) return;
  const t = (ms - alku) / 1000;
  g.setTransform(1,0,0,1,0,0); g.clearRect(0, 0, R, R + YLA); g.setTransform(1,0,0,1,0,YLA);

  // nousun eteneminen
  const e = vaihe === 2 ? Math.min(1, Math.max(0, (t - .6) / NOUSU_KESTO)) : 0;
  const k = 1 - Math.pow(1 - e, 3);
  const atlY = PINTA + 34 - k*NOUSU;                                  // jalustan y
  const ravistus = vaihe === 2 && e > 0 && e < 1 ? Math.round((Math.random()-.5)*2) : 0;

  // vaihe 1: välillä tärähdys
  let tarina = 0;
  if (vaihe === 1) {
    const jakso = (t % 4.5);
    if (jakso > 3.6 && jakso < 4.1) tarina = Math.round(Math.sin(t*60));
  }

  piirraMaa(vaihe === 1 || e < .55 ? { x: 64, y: PINTA + 22 - k*10, rx: 36, ry: 14 + k*4 } : null);

  // hehku (pehmeä) piirretään isolle kanvaasille myöhemmin; tässä pikselit
  const laki = piirraAtlantis(64 + ravistus, atlY, t, vaihe === 1 ? .55 + .2*Math.sin(t*2) : 1);

  // Näsinneula: maan pinnalla, kunnes kupoli tulee alle -> nousee kupolin mukana
  const neulaMaa = Math.min(PINTA, laki);
  piirraNeula(64 + ravistus, neulaMaa, t, tarina);

  // pinta murtuu: kokkareita lentää nousun aikana
  if (vaihe === 2 && e > .1 && e < .95 && Math.random() < .5) {
    kokkareet.push({ x: 34 + Math.random()*60, y: PINTA - 1, vx: (Math.random()-.5)*40, vy: -30 - Math.random()*40, c: Math.random() < .5 ? '#6e4b2c' : '#5f8f4e' });
  }
  const dt = 1/60;
  kokkareet = kokkareet.filter(p => { p.vy += 90*dt; p.x += p.vx*dt; p.y += p.vy*dt; px(p.x, p.y, 2, 2, p.c); return p.y < R; });
  // kipinät valmiin Atlantiksen ympärillä
  if (vaihe === 2 && e >= 1) for (let i = 0; i < 4; i++) {
    const a = t*1.3 + i*1.57, r = 34 + Math.sin(t*2 + i)*3;
    px(64 + Math.cos(a)*r, atlY - 14 + Math.sin(a)*r*.45, 1, 1, T3);
  }
  if (vaihe === 2 && e > 0 && !jyrinaSoitettu) { jyrinaSoitettu = true; jyrina(NOUSU_KESTO + .8, .18); }

  // --- isolle kanvaasille ---
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const S = Math.min(H*.66, W*.42), x0 = W*.05, y0 = H*.955 - S, sk = S / R;
  // turkoosi hehku Atlantiksen takana
  const hx = x0 + 64*sk, hy = y0 + (atlY - 12)*sk;
  const hv = vaihe === 1 ? .22 + .1*Math.sin(t*2) : .25 + .35*k;
  const gr = ctx.createRadialGradient(hx, hy, 0, hx, hy, S*.42);
  gr.addColorStop(0, `rgba(63,224,208,${hv})`); gr.addColorStop(1, 'rgba(63,224,208,0)');
  ctx.fillStyle = gr; ctx.fillRect(hx - S*.5, hy - S*.5, S, S);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lc, x0, y0 - YLA*sk, S, S*(R + YLA)/R);
  // valokeila ylös nousun aikana
  if (vaihe === 2 && e > 0 && e < 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const kl = ctx.createLinearGradient(0, y0 + PINTA*sk, 0, 0);
    kl.addColorStop(0, `rgba(184,255,246,${.35*(1-e)})`); kl.addColorStop(1, 'rgba(184,255,246,0)');
    ctx.fillStyle = kl; ctx.fillRect(x0 + 30*sk, 0, 68*sk, y0 + PINTA*sk);
    ctx.restore();
  }
  raf = requestAnimationFrame(silmukka);
}

window.naytaAtlantis = function(p){
  const uusi = p && p.atlantis ? p.atlantis : 0;
  if (uusi === vaihe) return;
  vaihe = uusi;
  cancelAnimationFrame(raf);
  if (!vaihe) { cv.style.opacity = 0; return; }
  alku = performance.now(); kokkareet = []; jyrinaSoitettu = false;
  cv.style.opacity = 1;
  raf = requestAnimationFrame(silmukka);
};
})();
