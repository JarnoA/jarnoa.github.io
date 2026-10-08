// ============================================================================
// ITSEAJAVA AUTO SKANNAA (2.10.2026, uusi pysähdys x:10620 chihuahua-
// muffinssi-dian jälkeen). Jarno: opettaja kertoi pienille oppilaille
// chihuahua/muffinssi-tutkimuksesta, ja he oivalsivat heti: jos kone ei erota
// koiraa muffinssista, miten itseajava auto erottaa ihmisen puusta?
//
// Käyttö esitys-data.js:ssä: `kitt: true`.
// Kulku (toistuu n. 5 s välein): Cybertruck (Jarnon GLB tesla_cybertruck_low_
// poly.glb, sivurenderi → yösävy cyber-yo.png, katsoo VASEMMALLE) ajaa
// oikealta vasemmalle. Etuvalopalkissa KITT-skanneri (Knight Rider) liukuu
// edestakaisin; kun auto on ruudulla, palkista lähtee punainen skannauskeila
// oppaaseen, Terminator-tyyliset kulmakehykset ja hyppivät arvaukset
// ("PUU? 38 %"...). Viime hetkellä opas hyppää (__paaKohtaus.hahmo.y, kuten
// manipulointi.js; palautetaan poistuttaessa) ja auto ajaa alta.
// Auto piirretään Phaserin SISÄÄN oppaan alle (syvyys hahmo - 0.01), keila ja
// tekstit omalle kanvaasille tekstin alle (z 4).
// ============================================================================
(function(){
'use strict';
const JAKSO = 5.0, ALKU = 1.2;            // s: auton kierto, ensimmäinen ajo
const AUTO_H = 0.17;                      // auton korkeus ruudun korkeudesta
const AUTO_SUHDE = 976 / 314;             // cyber-yo.png
const PALKKI = { x: 0.012, y: 0.45 };     // etuvalopalkki auton kuvassa (mitattu)
const ARVAUKSET = ['PUU? 38 %', 'IHMINEN? 41 %', 'ROSKA? 52 %', 'KOIRA? 47 %', 'POSTILAATIKKO? 29 %', 'MUFFINSSI? 33 %', 'VARJO? 44 %'];

const autoKuva = new Image(); autoKuva.src = 'assets/2d/sprites/cyber-yo.png';
const cv = document.createElement('canvas');
cv.id = 'kitt';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .4s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

// ---------- äänet ----------
let ac = null, aaniPaalla = true;
function A(){ if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)(); return ac; }
function suhina(kesto, f0, f1, voim){
  if (!aaniPaalla) return; const a = A(), t = a.currentTime;
  const b = a.createBuffer(1, Math.ceil(a.sampleRate*kesto), a.sampleRate), d = b.getChannelData(0);
  for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
  const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  s.buffer = b; fl.type = 'bandpass'; fl.Q.value = 2; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + kesto);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(voim, t + kesto*.5); g.gain.exponentialRampToValueAtTime(.0001, t + kesto);
  s.connect(fl).connect(g).connect(a.destination); s.start(t);
}
function piip(f, kesto, voim){
  if (!aaniPaalla) return; const a = A(), t = a.currentTime, o = a.createOscillator(), g = a.createGain();
  o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(voim, t); g.gain.exponentialRampToValueAtTime(.0001, t + kesto);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + kesto + .02);
}

// ---------- tila ----------
let aktiivinen = false, rafId = 0, alku = 0, sc = null, auto = null, opas = null, tila = null;

function valmista(){
  sc = window.__paaKohtaus; if (!sc || !sc.hahmo || !autoKuva.complete || !autoKuva.naturalWidth) return false;
  if (!sc.textures.exists('kitt-auto')) sc.textures.addImage('kitt-auto', autoKuva);
  if (auto) auto.destroy();
  auto = sc.add.image(-9999, 0, 'kitt-auto').setOrigin(0, 1).setScrollFactor(0).setDepth(sc.hahmo.depth - 0.01);
  opas = { hahmo: sc.hahmo, perusY: sc.hahmo.y };
  return true;
}
function palautaOpas(){ if (opas && opas.hahmo) opas.hahmo.y = opas.perusY; }

function kulmat(x, y, w, h, l, vari){
  ctx.strokeStyle = vari; ctx.lineWidth = Math.max(2, H*.003);
  for (const [cx, cy, dx, dy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]) {
    ctx.beginPath(); ctx.moveTo(cx + dx*l, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy*l); ctx.stroke();
  }
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku) / 1000;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  // opas vaihdettu kesken pysähdyksen (näppäimet 1-4 / G luovat UUDEN spriten) -> seurataan uutta
  if (sc.hahmo && sc.hahmo !== opas.hahmo) { palautaOpas(); opas = { hahmo: sc.hahmo, perusY: sc.hahmo.y }; auto.setDepth(sc.hahmo.depth - 0.01); }
  const sk = W / sc.scale.width, h = opas.hahmo;
  const ah = H * AUTO_H, aw = ah * AUTO_SUHDE, gy = H * .905;
  const ox = (h.x - sc.cameras.main.scrollX * h.scrollFactorX) * sk;       // oppaan keskikohta ruudulla
  const oKork = h.displayHeight * sk * .55;                                 // näkyvä hahmo (kehyksessä tyhjää)
  const oy = opas.perusY * sk;

  const e = t - ALKU, kierros = e >= 0 ? Math.floor(e / JAKSO) : -1, k = e - kierros*JAKSO;
  const nopeus = W * .42;                                                    // px/s (Jarno: vähän hitaammin)
  const ax = W + aw*.1 - k*nopeus;                                           // auton etupää (vasen reuna)
  const ajossa = e >= 0 && ax > -aw - 20;
  if (kierros !== tila.kierros) { tila.kierros = kierros; tila.hyppy = null; tila.skannattu = false; if (kierros >= 0) suhina(2.2, 300, 1400, .05); }

  // auto Phaserissa (oppaan alla), pieni jousto
  if (ajossa) auto.setPosition(ax / sk, (gy + Math.sin(t*20)*H*.0012) / sk).setDisplaySize(aw / sk, ah / sk).setVisible(true);
  else auto.setVisible(false);

  // hyppy: kun etupää on oppaan kohdalla + väli
  const etaisyys = ax - ox;
  if (ajossa && !tila.hyppy && etaisyys < W*.05 && etaisyys > -aw) { tila.hyppy = t; piip(880, .08, .05); }
  let nousu = 0;
  if (tila.hyppy) { const j = (t - tila.hyppy) / 1.0; if (j < 1) nousu = Math.sin(j*Math.PI) * (ah*1.15); }   // 1.0 s: ilmassa koko ajan kun auto ajaa alta
  h.y = opas.perusY - nousu / sk;

  // KITT-skanneri etuvalopalkissa
  if (ajossa) {
    const px = ax + aw*PALKKI.x, py = gy - ah + ah*PALKKI.y, pl = ah*.5;
    const pos = (Math.sin(t*5.5) + 1) / 2;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i=0;i<6;i++) {                                                // valo + häntä
      const p = (Math.sin(t*5.5 - i*.18) + 1) / 2, a = .9 * (1 - i/6);
      const g = ctx.createRadialGradient(px, py - pl/2 + p*pl, 0, px, py - pl/2 + p*pl, ah*.12);
      g.addColorStop(0, `rgba(255,40,30,${a})`); g.addColorStop(1, 'rgba(255,40,30,0)');
      ctx.fillStyle = g; ctx.fillRect(px - ah*.12, py - pl/2 + p*pl - ah*.12, ah*.24, ah*.24);
    }
    ctx.restore();
    // skannauskeila oppaaseen kun auto on ruudulla ja opas vielä edessä
    const keila = ax < W*.98 && etaisyys > W*.02 && !tila.hyppy;
    if (keila) {
      if (!tila.skannattu) { tila.skannattu = true; piip(1320, .06, .04); }
      const kx = ox, ky1 = oy - oKork, ky2 = oy, sy = py - pl/2 + pos*pl;
      const g = ctx.createLinearGradient(px, 0, kx, 0);
      g.addColorStop(0, 'rgba(255,40,30,.55)'); g.addColorStop(1, 'rgba(255,40,30,.08)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(px, sy); ctx.lineTo(kx, ky1); ctx.lineTo(kx, ky2); ctx.closePath(); ctx.fill();
      // Terminator-HUD oppaan ympärille
      const bw = oKork*1.4, bh = oKork*1.1, bx = ox - bw/2 + (Math.random()-.5)*2, by = oy - bh + (Math.random()-.5)*2;
      kulmat(bx, by, bw, bh, bw*.18, 'rgba(255,60,50,.95)');
      const arv = ARVAUKSET[Math.floor(t*7) % ARVAUKSET.length];
      ctx.font = `bold ${Math.round(H*.026)}px "Courier New", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillStyle = 'rgba(0,0,0,.55)'; const tw = ctx.measureText(arv).width;
      ctx.fillRect(ox - tw/2 - 6, by - H*.04, tw + 12, H*.034);
      ctx.fillStyle = '#ff4a3a'; ctx.fillText(arv, ox, by - H*.01);
    }
  }
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaKitt = function(p){
  const paalle = !!(p && p.kitt);
  if (!paalle) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    palautaOpas(); if (auto) { auto.destroy(); auto = null; }
    return;
  }
  aaniPaalla = false;   // Jarno 2.10.2026: ei ääniä tähän kohtaukseen
  koko();
  if (aktiivinen) palautaOpas();
  if (!valmista()) return;
  tila = { kierros: -2, hyppy: null, skannattu: false };
  aktiivinen = true; alku = performance.now(); cv.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
