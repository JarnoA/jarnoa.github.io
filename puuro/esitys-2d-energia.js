// ============================================================================
// KODINKONEHYLLY (2.10.2026, x:9450 "Yksi ChatGPT-kehote = n. 5 min 5 W
// LED-valoa / kuva = 34 min / lyhytvideo = 1 h mikroaaltouunia").
//
// Käyttö esitys-data.js:ssä: `energia: true` pysähdykseen, jonka teksti on
// kolmen rivin taulukko (kehote, kuva, video). Kohtaus EI käytä omia
// ajastimia rivien tahdistukseen: jokainen vaihe alkaa, kun moottori näyttää
// vastaavan .leipa-rivi-rivin (rivien `viive` esitys-data.js:ssä on mitoitettu
// niin, että edellinen vaihe ehtii loppuun).
//
// Kulku: oikealla metsän reunassa puuhylly, jolla 5 W LED-lamppu, kello ja
// nukkuva mikroaaltouuni (paahtimen serkku: samat silmät, punainen nuppi-nenä).
//  1. rivi: chat-kupla lentää rivin punaisesta tekstistä lamppuun, lamppu
//     syttyy, kellon sektori pyyhkäisee 5 min, lamppu himmenee.
//  2. rivi: pieni kuva lentää lamppuun, sama juttu mutta 34 min.
//  3. rivi: filminpätkä lentää uuniin, uuni herää, lautanen pyörii, luukku
//     hehkuu, kello kiertää täyden tunnin, DING - ja uuni näyttää syylliseltä.
//
// Oma kanvaasi tekstin alla (z 4), lentävät esineet erillisellä kanvaasilla
// tekstin päällä (z 6), kuten esitys-2d-paahdin.js. Mitat samalla kaavalla kuin
// paahtimessa (H/793 * 1.45). Äänet WebAudiolla, esikatselussa pois.
// ============================================================================
(function(){
'use strict';
const KUVA_H = 793, ZOOM = 1.45;
const ALOITUS = 0.8;                 // s ensimmäisen rivin näkymisestä 1. vaiheeseen

const cv = document.createElement('canvas'), fxc = document.createElement('canvas');
cv.id = 'energia-maailma'; fxc.id = 'energia-fx';
for (const [c, z] of [[cv, 4], [fxc, 6]]) {
  c.style.cssText = `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:${z};opacity:0;transition:opacity .5s ease;`;
}
const ctx = cv.getContext('2d'), fx = fxc.getContext('2d');
document.addEventListener('DOMContentLoaded', () => {
  document.body.append(cv, fxc);
  const tyyli = document.createElement('style');
  tyyli.textContent = '.energia-pomppu{display:inline-block;animation:energia-pomppu .5s cubic-bezier(.3,1.6,.5,1)}@keyframes energia-pomppu{0%{transform:scale(1)}35%{transform:scale(1.12)}100%{transform:scale(1)}}';
  document.head.appendChild(tyyli);
});

let W = 0, H = 0, DPR = 1, s = 1, P = 3, bx = 0, gy = 0;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  for (const c of [cv, fxc]) { c.width = Math.round(W*DPR); c.height = Math.round(H*DPR); }
  s = H / KUVA_H * ZOOM; P = 3.6*s;
  bx = W * 0.72;
  gy = H * 0.905;                    // oppaan jalkojen taso tässä kohtauksessa (mitattu 2.10.2026)
}
addEventListener('resize', koko); koko();

// ---------- pikselisprite-apu (sama kuin paahtimessa) ----------
function sprite(w, h, maalaa){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const rect = (x,y,ww,hh,col) => { g.fillStyle = col; g.fillRect(x,y,ww,hh); };
  maalaa(rect, g); return c;
}

const K='#161922', VA='#f4f6fa', L='#c3cad6', M='#8a94a6', D='#566074';
const PUU='#7a5232', PUU_V='#a77c4a', PUU_T='#4a2e1c';

const HYLLY = sprite(90, 24, (rect) => {
  rect(0,0,90,1,PUU_V); rect(0,1,90,3,PUU); rect(0,4,90,1,PUU_T);         // kansi
  for (const x of [9,27,52,71]) rect(x,2,1,1,PUU_T);
  for (const x of [4,82]) { rect(x,5,4,19,PUU); rect(x,5,1,19,PUU_V); rect(x+3,5,1,19,PUU_T); }   // jalat
  rect(8,14,74,2,PUU); rect(8,14,74,1,PUU_V); rect(8,16,74,1,PUU_T);       // alatuki
});
const LAMPPU_ALUS = sprite(10, 6, (rect) => {
  rect(3,0,4,2,'#a3acbd'); rect(3,2,4,1,'#6b7385');
  rect(1,3,8,3,'#3a3f4c'); rect(1,3,8,1,'#5a6070');
});
function lamppuSprite(paalla){
  return sprite(9, 12, (rect) => {
    const c = paalla ? ['#fffbe0','#fff1a8','#ffe98a','#ffe07a','#f5cf5a'] : ['#7a8094','#6b7183','#5e6476','#535969','#4a4f5e'];
    rect(3,0,3,1,c[0]); rect(1,1,7,1,c[1]); rect(0,2,9,4,c[2]); rect(1,6,7,1,c[3]); rect(2,7,5,1,c[4]);
    rect(2,2,1,2, paalla ? '#ffffff' : '#9aa1b2');
    rect(3,3,3,2, paalla ? '#ffffff' : '#666c7e');                         // LED-siru
    rect(2,8,5,1,'#c3cad6'); rect(2,9,5,1,'#8a94a6'); rect(2,10,5,1,'#c3cad6'); rect(3,11,3,1,'#566074');
  });
}
const LAMPPU_ON = lamppuSprite(true), LAMPPU_OFF = lamppuSprite(false);

const UUNI = sprite(36, 22, (rect, g) => {
  rect(0,0,36,22,K); rect(1,1,34,20,L);
  for (const [x,y] of [[0,0],[35,0],[0,21],[35,21]]) g.clearRect(x,y,1,1);
  rect(1,1,34,1,VA); rect(1,20,34,1,D);
  rect(2,2,20,17,M); rect(3,3,18,15,'#2a2f3a');                           // luukun kehys + lasi
  rect(22,2,1,17,D);                                                       // sauma
  rect(25,3,9,3,'#0d1a12');                                                // näyttö
  rect(2,21,4,1,'#24262c'); rect(30,21,4,1,'#24262c');
});
const KELLO_RUNKO = sprite(19, 21, (rect) => {
  const cx = 9, cy = 9, r = 9.3;
  for (let y=0;y<19;y++) for (let x=0;x<19;x++) {
    const d = Math.hypot(x-cx, y-cy);
    if (d <= r) rect(x,y,1,1, d > r-1.3 ? K : (d > r-2.3 ? '#c8402f' : '#f4f1e6'));
  }
  rect(8,0,3,1,'#c8402f');                                                 // nuppi
  rect(3,18,3,3,K); rect(13,18,3,3,K);                                     // jalat
  for (let i=0;i<12;i++) { const a = i/12*Math.PI*2; rect(Math.round(cx+Math.sin(a)*6), Math.round(cy-Math.cos(a)*6), 1, 1, i%3 ? '#a3acbd' : K); }
});
const KUPLA = sprite(12, 9, (rect, g) => {
  rect(1,0,10,1,K); rect(0,1,12,6,K); rect(1,7,10,1,K); rect(2,8,2,1,K);
  rect(1,1,10,6,VA); rect(2,7,1,1,VA);
  rect(3,3,2,2,'#4b8bd6'); rect(6,3,2,2,'#4b8bd6'); rect(9,3,1,2,'#4b8bd6');
});
const KUVA = sprite(12, 10, (rect) => {
  rect(0,0,12,10,'#6b4a2a'); rect(1,1,10,8,'#9ad0ee');
  rect(7,2,2,2,'#ffe07a');
  rect(1,6,10,3,'#4f8a3a'); rect(3,5,3,1,'#4f8a3a'); rect(4,4,1,1,'#4f8a3a'); rect(6,6,3,1,'#5d9a44');
});
const FILMI = sprite(15, 8, (rect) => {
  rect(0,0,15,8,'#1d1f25');
  for (let x=1;x<15;x+=3) { rect(x,1,1,1,'#c3cad6'); rect(x,6,1,1,'#c3cad6'); }
  rect(1,2,4,4,'#e89a5a'); rect(6,2,3,4,'#5aa0e8'); rect(10,2,4,4,'#e8d25a');
});

// kellon sektori omalle pikselikanvaasille joka ruudussa → sama pikselityyli
const kellonKasvo = document.createElement('canvas'); kellonKasvo.width = 19; kellonKasvo.height = 19;
const kg = kellonKasvo.getContext('2d');
function piirraKellonKasvo(min, vari){
  kg.clearRect(0,0,19,19);
  const cx = 9, cy = 9, kulma = min/60*Math.PI*2;
  kg.fillStyle = vari;
  if (min > 0) for (let y=0;y<19;y++) for (let x=0;x<19;x++) {
    const dx = x-cx, dy = y-cy, d = Math.hypot(dx, dy); if (d > 6.6 || d < .5) continue;
    let a = Math.atan2(dx, -dy); if (a < 0) a += Math.PI*2;
    if (a <= kulma + .02) kg.fillRect(x,y,1,1);
  }
  kg.fillStyle = K;
  for (let i=0;i<=6;i++) kg.fillRect(Math.round(cx + Math.sin(kulma)*i), Math.round(cy - Math.cos(kulma)*i), 1, 1);   // minuuttiviisari
  for (let i=0;i<=3;i++) kg.fillRect(cx, Math.round(cy - i), 1, 1);                                                  // tuntiviisari 12:ssa
  kg.fillRect(cx,cy,1,1);
}

// paikat hyllyn koordinaateissa (origo = hyllyn keskikohta maassa, ylös negatiivinen)
const HYLLY_Y = -24;                       // hyllyn kannen yläpinta
const LAMPPU = { x: -34, y: HYLLY_Y - 6 - 12 };   // lampun vasen yläkulma
const LAMPPU_KESKI = { x: -29.5, y: HYLLY_Y - 6 - 8 };
const KELLO = { x: -18, y: HYLLY_Y - 21 };
const KELLO_KESKI = { x: -8.5, y: HYLLY_Y - 21 + 9.5 };
const UUNI_P = { x: 5, y: HYLLY_Y - 22 };
const IKKUNA_KESKI = { x: 5 + 12, y: HYLLY_Y - 22 + 10.5 };

// ---------- äänet ----------
let ac = null, aaniPaalla = true;
function A(){ if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)(); return ac; }
function savel(f0, kesto, {tyyppi='sine', voim=.15, f1=null, viive=0}={}){
  if (!aaniPaalla) return; const a = A(), t = a.currentTime + viive;
  const o = a.createOscillator(), g = a.createGain();
  o.type = tyyppi; o.frequency.setValueAtTime(f0, t);
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + kesto);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(voim, t + .008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + kesto);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + kesto + .05);
}
function kohina(kesto, {voim=.15, suodin='lowpass', f=1000}={}){
  if (!aaniPaalla) return; const a = A(), t = a.currentTime;
  const b = a.createBuffer(1, Math.ceil(a.sampleRate*kesto), a.sampleRate), d = b.getChannelData(0);
  for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
  const src = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  src.buffer = b; fl.type = suodin; fl.frequency.value = f; g.gain.value = voim;
  src.connect(fl).connect(g).connect(a.destination); src.start(t);
}
const AANI = {
  hus:    () => kohina(.35, {suodin:'bandpass', f:1800, voim:.08}),
  plop:   () => savel(260, .12, {f1:520, voim:.12, tyyppi:'triangle'}),
  valo:   () => savel(700, .25, {f1:1400, voim:.08, tyyppi:'triangle'}),
  sammuu: () => savel(900, .3, {f1:300, voim:.05, tyyppi:'triangle'}),
  tik:    () => kohina(.025, {suodin:'highpass', f:3500, voim:.12}),
  herays: () => savel(330, .18, {f1:660, voim:.08, tyyppi:'square'}),
  hurina: (k) => { if (!aaniPaalla) return; const a=A(), t=a.currentTime; const o=a.createOscillator(), fl=a.createBiquadFilter(), g=a.createGain();
            o.type='sawtooth'; o.frequency.value=62; fl.type='lowpass'; fl.frequency.value=300;
            g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.04,t+.3); g.gain.setValueAtTime(.04,t+k-.15); g.gain.exponentialRampToValueAtTime(.0001,t+k);
            o.connect(fl).connect(g).connect(a.destination); o.start(t); o.stop(t+k+.05); },
  ding:   () => { for (const [r,v] of [[1,.22],[2.76,.07],[5.4,.03]]) savel(1760*r, 2.2/r, {voim:v}); },
  nolo:   () => { savel(520, .14, {f1:440, voim:.06, tyyppi:'triangle'}); savel(440, .3, {f1:330, voim:.06, tyyppi:'triangle', viive:.15}); },
};

// ---------- vaiheet ----------
// lento: s, pyyhkaisy: kellon kierto s, min: minuutit kellossa
// 8.10.2026 Jarno: "34 min ja 1 h aikademo liian pitkä" -> pyyhkäisyt 1.4/3.2/4.0 -> 1.0/1.6/2.0 s
const VAIHEET = [
  { esine: KUPLA, kohde: 'lamppu', min: 5,  lento: .9, pyyhkaisy: 1.0, vari: '#ffd84a', teksti: '5 min' },
  { esine: KUVA,  kohde: 'lamppu', min: 34, lento: .9, pyyhkaisy: 1.6, vari: '#ffd84a', teksti: '34 min' },
  { esine: FILMI, kohde: 'uuni',   min: 60, lento: 1.0, pyyhkaisy: 2.0, vari: '#ff8a3c', teksti: '1 h' },
];

let aktiivinen = false, rafId = 0, edellinen = 0, nyt = 0, alku = 0;
let tila, hiukkaset;

function alusta(){
  tila = { ekaRivi: -1, vaihe: -1, vaiheAlku: 0, lentaja: null, lamppu: 0, kelloMin: 0, kelloVari: '#ffd84a', kelloTeksti: '',
           edTikki: 0, uuni: 'nukkuu', uuniT: 0, kulma: 0, hehku: 0, dingT: -9, heraysT: -9, zAjastin: 0, rapsays: 2, filmiSisalla: false,
           kaynnistetyt: [false, false, false], lamppuPaalle: false, vaiheValmis: 0 };
  hiukkaset = [];
}

const maailma = (ux, uy) => ({ x: bx + ux*P, y: gy + uy*P });

function rivit(){ return document.querySelectorAll('#teksti .leipa-rivi'); }

function aloitaVaihe(i){
  const v = VAIHEET[i], r = rivit()[i];
  tila.vaihe = i; tila.vaiheAlku = nyt; tila.vaiheValmis = 0; tila.kelloMin = 0; tila.kelloVari = v.vari; tila.kelloTeksti = '';
  // lähtöpiste: rivin punainen osa (span), muuten rivin oikea reuna
  let lx = W*.3, ly = H*.15, kork = H*.04;
  if (r) {
    const sp = r.querySelector('span') || r, rr = sp.getBoundingClientRect();
    lx = rr.left + rr.width*.5; ly = rr.top + rr.height*.5; kork = rr.height;
    sp.classList.remove('energia-pomppu'); void sp.offsetWidth; sp.classList.add('energia-pomppu');
  }
  const kohde = v.kohde === 'lamppu' ? maailma(LAMPPU_KESKI.x, LAMPPU_KESKI.y) : maailma(IKKUNA_KESKI.x, IKKUNA_KESKI.y);
  tila.lentaja = { x0: lx, y0: ly, x1: kohde.x, y1: kohde.y, t0: nyt, kesto: v.lento, sprite: v.esine, koko0: kork*1.3/v.esine.height };
  AANI.hus();
}

function paivita(dt){
  // rivien seuranta: vaihe i alkaa kun rivi i on näkyvissä (1. rivi ALOITUS s viiveellä)
  const rr = rivit();
  for (let i=0;i<VAIHEET.length;i++) {
    if (tila.kaynnistetyt[i] || !rr[i] || !rr[i].classList.contains('nakyy')) continue;
    if (i > 0 && !tila.kaynnistetyt[i-1]) continue;
    if (i === 0) { if (tila.ekaRivi < 0) tila.ekaRivi = nyt; if (nyt - tila.ekaRivi < ALOITUS) continue; }
    if (i > 0 && nyt - tila.vaiheAlku < 1.2) continue;      // ei päällekkäin liian nopeasti
    tila.kaynnistetyt[i] = true; aloitaVaihe(i);
  }

  if (tila.vaihe >= 0) {
    const v = VAIHEET[tila.vaihe], e = nyt - tila.vaiheAlku;
    const laskeutuu = v.lento, pyyhkAlku = v.kohde === 'lamppu' ? laskeutuu + .2 : laskeutuu + .7;
    if (tila.lentaja && e >= laskeutuu) {
      tila.lentaja = null; AANI.plop();
      const p = v.kohde === 'lamppu' ? LAMPPU_KESKI : IKKUNA_KESKI;
      for (let i=0;i<10;i++) { const a = Math.random()*Math.PI*2;
        hiukkaset.push({ x:p.x, y:p.y, vx:Math.cos(a)*30, vy:Math.sin(a)*30, g:0, ika:0, kesto:.4, koko:1, vari: v.kohde === 'lamppu' ? '255,233,138' : '255,170,90', a:1, kasvu:0, vastus:3 }); }
      if (v.kohde === 'lamppu') { tila.lamppuPaalle = true; AANI.valo(); }
      else { tila.uuni = 'herää'; tila.heraysT = nyt; tila.filmiSisalla = true; AANI.herays(); }
    }
    // kello
    if (e >= pyyhkAlku) {
      const k = Math.min(1, (e - pyyhkAlku) / v.pyyhkaisy);
      const ee = k < 1 ? k : 1;
      const min = v.min * ee;
      if (v.kohde === 'uuni' && tila.uuni === 'herää') { tila.uuni = 'kypsyy'; AANI.hurina(v.pyyhkaisy + .1); }
      if (Math.floor(min/5) > Math.floor(tila.kelloMin/5)) AANI.tik();
      tila.kelloMin = min;
      tila.kelloTeksti = (v.min === 60 && k >= 1) ? '1 h' : Math.round(min) + ' min';
      if (k >= 1 && !tila.vaiheValmis) {
        tila.vaiheValmis = tila.vaihe + 1;
        if (v.kohde === 'lamppu') setTimeout(() => { if (aktiivinen && tila.vaihe === VAIHEET.indexOf(v)) { tila.lamppuPaalle = false; AANI.sammuu(); } }, 500);
        else { tila.uuni = 'ding'; tila.dingT = nyt; AANI.ding(); setTimeout(() => { if (aktiivinen && tila.uuni === 'ding') { tila.uuni = 'nolo'; AANI.nolo(); } }, 900); }
      }
    }
  }

  // lampun kirkkaus pehmeästi
  tila.lamppu += ((tila.lamppuPaalle ? 1 : 0) - tila.lamppu) * Math.min(1, dt*(tila.lamppuPaalle ? 14 : 3));
  // uuni
  const hehkuKohde = tila.uuni === 'kypsyy' ? 1 : (tila.uuni === 'ding' ? .8 : (tila.uuni === 'nolo' ? .22 : 0));
  tila.hehku += (hehkuKohde - tila.hehku) * Math.min(1, dt*2.5);
  if (tila.uuni === 'kypsyy') tila.kulma += dt*2.4;
  if (tila.uuni === 'nukkuu' && aktiivinen) {
    tila.zAjastin -= dt;
    if (tila.zAjastin <= 0) { tila.zAjastin = 1.6;
      hiukkaset.push({ z:true, x:UUNI_P.x+33, y:UUNI_P.y-1, vx:6, vy:-9, g:0, ika:0, kesto:2.2, koko:1, vari:'230,230,240', a:.8, kasvu:.6, vastus:0 }); }
  }
  if (tila.uuni === 'kypsyy' && Math.random() < dt*6)
    hiukkaset.push({ x:UUNI_P.x+4+Math.random()*20, y:UUNI_P.y, vx:(Math.random()-.5)*4, vy:-10-Math.random()*6, g:-2, ika:0, kesto:1.5, koko:1.4, vari:'210,205,200', a:.18, kasvu:2, vastus:.3 });
  if (tila.uuni === 'nolo' && Math.random() < dt*.7)
    hiukkaset.push({ hiki:true, x:UUNI_P.x+36, y:UUNI_P.y+3, vx:0, vy:4, g:10, ika:0, kesto:1.6, koko:1, vari:'140,200,255', a:.9, kasvu:0, vastus:0 });

  for (const h of hiukkaset) {
    h.ika += dt; h.vy += h.g*dt; h.vx *= Math.exp(-h.vastus*dt); h.vy *= Math.exp(-h.vastus*.3*dt);
    h.x += h.vx*dt; h.y += h.vy*dt;
  }
  hiukkaset = hiukkaset.filter(h => h.ika < h.kesto);
}

function hehkupallo(g, x, y, r, rgb, a, litteys=1){
  if (a <= 0.003) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  g.translate(x, y); g.scale(1, litteys);
  const gr = g.createRadialGradient(0,0,0, 0,0,r);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(.4, `rgba(${rgb},${a*.35})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(-r,-r,2*r,2*r); g.restore();
}
function spr(c, ux, uy, w, h){ ctx.drawImage(c, bx + ux*P, gy + uy*P, (w||c.width)*P, (h||c.height)*P); }

// uunin kasvot paneelissa: silmät + punainen nuppi-nenä + suu (paahtimen serkku)
function piirraUuninKasvot(){
  const ox = UUNI_P.x, oy = UUNI_P.y;
  const px = (x,y,w,h,c) => { ctx.fillStyle = c; ctx.fillRect(bx + (ox+x)*P, gy + (oy+y)*P, w*P, h*P); };
  let w = 2, h = 3, dx = 0, dy = 0, suu = 'viiva';
  const sinceHerays = nyt - tila.heraysT, sinceDing = nyt - tila.dingT;
  if (tila.uuni === 'nukkuu') { h = 1; dy = 1; suu = 'viiva'; }
  else if (tila.uuni === 'herää' || sinceHerays < .5) { w = 2; h = 3; suu = 'o'; dx = -1; }
  else if (tila.uuni === 'kypsyy') { dx = -1; dy = Math.sin(nyt*3) > 0 ? 0 : 1; h = 2; }  // tuijottaa luukkuaan
  if (tila.uuni === 'ding' && sinceDing < .9) { h = 3; dy = -1; suu = 'o'; }
  if (tila.uuni === 'nolo') { h = 2; dx = Math.sin(nyt*1.2) > .3 ? 1 : -1; dy = 1; suu = 'nolo'; }
  if (h > 1 && tila.uuni !== 'nukkuu') { tila.rapsays -= 1/60; if (tila.rapsays < 0) { if (tila.rapsays < -.12) tila.rapsays = 2.5 + Math.random()*2.5; else h = 1; } }
  for (const cx of [25, 31]) px(cx + dx, 9 - Math.floor(h/2) + dy, w, h, K);
  if (h >= 3) for (const cx of [25, 31]) px(cx + dx + (dx < 0 ? 0 : 1), 9 - Math.floor(h/2) + dy, 1, 1, '#ffffff');
  px(27, 11, 3, 3, '#c8402f'); px(27, 11, 1, 1, '#ff9078'); px(29, 13, 1, 1, '#7a1f16');   // nuppi = nenä
  if (suu === 'o') { px(27, 16, 3, 2, K); px(28, 17, 1, 1, '#7a1f16'); }
  else if (suu === 'nolo') { px(25, 17, 1, 1, D); px(26, 16, 1, 1, D); px(27, 17, 1, 1, D); px(28, 16, 1, 1, D); px(29, 17, 1, 1, D); px(30, 16, 1, 1, D); px(31, 17, 1, 1, D); }
  else px(26, 16, 5, 1, D);
  // poskipuna kun nolottaa
  if (tila.uuni === 'nolo') { ctx.globalAlpha = .5; px(23.5, 12, 2, 1, '#ff7a8a'); px(32.5, 12, 2, 1, '#ff7a8a'); ctx.globalAlpha = 1; }
}

function piirraIkkuna(t){
  const ox = UUNI_P.x, oy = UUNI_P.y;
  const x0 = bx + (ox+3)*P, y0 = gy + (oy+3)*P, w = 18*P, h = 15*P;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
  const hk = tila.hehku * (.9 + .1*Math.sin(t*17));
  if (hk > .01) { ctx.fillStyle = `rgba(255,${Math.round(150+50*hk)},70,${.75*hk})`; ctx.fillRect(x0, y0, w, h); }
  // lautanen
  const lx = x0 + w/2, ly = y0 + h - 3*P;
  ctx.fillStyle = hk > .2 ? '#e8c890' : '#8a94a6'; ctx.fillRect(lx - 7*P, ly, 14*P, 1.5*P);
  // filmi pyörii lautasella (sivukuva: leveys = |cos|)
  if (tila.filmiSisalla) {
    const c = Math.cos(tila.kulma), fw = Math.max(.15, Math.abs(c)) * FILMI.width*.8;
    ctx.drawImage(FILMI, lx - fw/2*P + Math.sin(tila.kulma)*2*P, ly - FILMI.height*.8*P, fw*P, FILMI.height*.8*P);
  }
  ctx.restore();
  // lasin heijastus
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x0 + 2*P, y0 + P, 6*P, P);
  // näyttö: vihreät pikselit vilkkuvat kypsyessä
  const nx = bx + (ox+25)*P, ny = gy + (oy+3)*P;
  if (tila.uuni === 'kypsyy') { ctx.fillStyle = '#5aff8a'; for (let i=0;i<3;i++) if (Math.sin(t*6 + i*1.7) > -.2) ctx.fillRect(nx + (1+i*3)*P, ny + P, 2*P, P); }
  else if (tila.uuni === 'ding' || tila.uuni === 'nolo') { ctx.fillStyle = Math.sin(t*5) > 0 ? '#5aff8a' : '#1d4a2a'; ctx.fillRect(nx + P, ny + P, 7*P, P); }
}

function piirra(t){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H); ctx.imageSmoothingEnabled = false;
  const lv = tila.lamppu * (.94 + .06*Math.sin(t*31)*Math.sin(t*7));
  const lk = maailma(LAMPPU_KESKI.x, LAMPPU_KESKI.y), ik = maailma(IKKUNA_KESKI.x, IKKUNA_KESKI.y);
  hehkupallo(ctx, lk.x, lk.y, 70*P, '255,230,140', .35*lv);
  hehkupallo(ctx, bx, gy - 24*P, 70*P, '255,230,140', .18*lv, .3);
  hehkupallo(ctx, ik.x, ik.y, 80*P, '255,140,60', .3*tila.hehku);
  hehkupallo(ctx, bx, gy - 2*P, 60*P, '255,140,60', .2*tila.hehku, .25);

  spr(HYLLY, -45, HYLLY_Y);
  // lamppu
  spr(LAMPPU_ALUS, LAMPPU.x - .5, HYLLY_Y - 6);
  spr(lv > .5 ? LAMPPU_ON : LAMPPU_OFF, LAMPPU.x, LAMPPU.y);
  if (lv > .05) {
    ctx.save(); ctx.translate(lk.x, lk.y - 1*P); ctx.fillStyle = `rgba(255,233,138,${lv})`;
    for (let i=0;i<8;i++) { ctx.rotate(Math.PI/4); ctx.fillRect(-.5*P, -10*P, 1*P, 2.5*P); }
    ctx.restore();
  }
  // kello
  spr(KELLO_RUNKO, KELLO.x, KELLO.y);
  piirraKellonKasvo(tila.kelloMin, tila.kelloVari);
  spr(kellonKasvo, KELLO.x, KELLO.y);
  if (tila.kelloTeksti) {
    const kp = maailma(KELLO_KESKI.x, KELLO.y - 4);
    ctx.font = `bold ${Math.round(6*P)}px Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.lineWidth = 1.2*P; ctx.strokeStyle = 'rgba(22,25,34,.9)'; ctx.strokeText(tila.kelloTeksti, kp.x, kp.y);
    ctx.fillStyle = tila.kelloVari === '#ff8a3c' ? '#ffb070' : '#ffe98a'; ctx.fillText(tila.kelloTeksti, kp.x, kp.y);
  }
  // uuni (pieni hyppy herätessä ja DINGissä)
  const hyppy = Math.max(0, 1 - (nyt - tila.heraysT)/.35) * 2 + Math.max(0, 1 - (nyt - tila.dingT)/.3) * 1.5;
  const varina = tila.uuni === 'kypsyy' ? Math.sin(t*55)*.25 : 0;
  ctx.save(); ctx.translate(varina*P, -hyppy*P);
  spr(UUNI, UUNI_P.x, UUNI_P.y);
  piirraIkkuna(t);
  piirraUuninKasvot();
  ctx.restore();

  for (const h of hiukkaset) {
    const e = h.ika / h.kesto, kk = h.koko*(1 + h.kasvu*e)*P, x = bx + h.x*P, y = gy + h.y*P;
    ctx.globalAlpha = h.a * (1 - e);
    if (h.z) { ctx.font = `bold ${Math.round(4*P*(1+e*.6))}px Georgia, serif`; ctx.fillStyle = `rgb(${h.vari})`; ctx.fillText('z', x, y); }
    else if (h.hiki) { ctx.fillStyle = `rgb(${h.vari})`; ctx.fillRect(x, y, P, 1.5*P); }
    else { ctx.fillStyle = `rgb(${h.vari})`; ctx.fillRect(x - kk/2, y - kk/2, kk, kk); }
  }
  ctx.globalAlpha = 1;

  // lentävä esine tekstin päällä
  fx.setTransform(DPR,0,0,DPR,0,0); fx.clearRect(0,0,W,H); fx.imageSmoothingEnabled = false;
  const L1 = tila.lentaja;
  if (L1) {
    const e = Math.min(1, (nyt - L1.t0) / L1.kesto), ee = e < .5 ? 2*e*e : 1 - Math.pow(-2*e + 2, 2)/2;
    const x = L1.x0 + (L1.x1 - L1.x0)*ee, y = L1.y0 + (L1.y1 - L1.y0)*ee - Math.sin(Math.PI*e) * H*.12;
    const kokoAlku = L1.koko0, kokoLoppu = P*.9, kk = kokoAlku + (kokoLoppu - kokoAlku)*ee;
    const w = L1.sprite.width*kk, h = L1.sprite.height*kk;
    fx.save(); fx.translate(x, y); fx.rotate(Math.sin(e*Math.PI*2)*.25);
    fx.shadowColor = 'rgba(0,0,0,.5)'; fx.shadowBlur = 8;
    fx.drawImage(L1.sprite, -w/2, -h/2, w, h); fx.restore();
  }
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms/1000, dt = Math.min(.05, t - edellinen || 0); edellinen = t; nyt = t;
  paivita(dt); piirra(t);
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaEnergia = function(p){
  const paalle = !!(p && p.energia);
  if (!paalle) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId);
    cv.style.opacity = 0; fxc.style.opacity = 0;
    return;
  }
  const esikatselu = (typeof ESIKATSELU !== 'undefined') && ESIKATSELU;
  aaniPaalla = !esikatselu && !(typeof p.energia === 'object' && p.energia.aani === false);
  koko(); alusta();
  aktiivinen = true; edellinen = 0; nyt = performance.now()/1000;
  cv.style.opacity = 1; fxc.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
