// ============================================================================
// LEIVÄNPAAHDIN-KOHTAUS (2.10.2026, x:2490 "Nykyisten tekoälyjen älykkyys on
// leivänpaahtimen tasolla"). Prototyyppi: test-leivanpaahdin.html (Jarno: "this
// is that kind of fun that presentation needs").
//
// Käyttö esitys-data.js:ssä: pysähdykseen kenttä `paahdin: true` (tai
// `paahdin: { aani: false }` ilman ääniä) ja tekstissä sana kääritään
// <span class="paahdin-sana">…</span> - se sana paahtuu paahtimen tahdissa.
//
// Kulku pysähdykselle saavuttaessa: teksti → 1.2 s → paahdin putoaa kannolle
// (pöly, tärähdys) → kuumenee (raot hehkuvat, sana ruskistuu ja savuaa) → DING,
// leivät ponnahtavat → 2.2 s → ajatuskupla, lamppu syttyy, lepattaa ja sammuu.
// Paahtimella on kasvot (nuppi = nenä): silmät seuraavat tapahtumia.
//
// Oma kanvaasi Phaserin PÄÄLLÄ mutta tekstin (z 5) alla, savu sanasta erillisellä
// kanvaasilla tekstin päällä. Mitat samalla kaavalla kuin taustakerrokset
// (H/793 * TAUSTAN_ZOOM 1.45, pohja-ankkuri), joten paahdin seisoo metsän
// nurmella millä tahansa resoluutiolla. Pysähdykseltä poistuttaessa kohtaus
// häivytetään ja nollataan; takaisin tullessa se alkaa alusta.
// Ei kamera-zoomia: metsän latvusto peittäisi (ks. ZOOMIREITTI-kommentti).
// Äänet WebAudiolla (ei tiedostoja), esikatselu-iframeissa aina pois.
// ============================================================================
(function(){
'use strict';
const KUVA_H = 793, MAA_Y = 727, ZOOM = 1.45;
const TEKSTISTA_PAAHTIMEEN = 1200, DINGISTA_KUPLAAN = 2200;

const cv = document.createElement('canvas'), fxc = document.createElement('canvas');
cv.id = 'paahdin-maailma'; fxc.id = 'paahdin-fx';
for (const [c, z] of [[cv, 4], [fxc, 6]]) {
  c.style.cssText = `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:${z};opacity:0;transition:opacity .4s ease;`;
}
const ctx = cv.getContext('2d'), fx = fxc.getContext('2d');
document.addEventListener('DOMContentLoaded', () => {
  document.body.append(cv, fxc);
  // kuumuusvärinän SVG-suodin sanalle
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', 0); svg.setAttribute('height', 0); svg.style.position = 'absolute';
  svg.innerHTML = '<filter id="paahdin-kuumuus" x="-10%" y="-40%" width="120%" height="180%"><feTurbulence id="paahdin-turb" type="fractalNoise" baseFrequency="0.015 0.08" numOctaves="1" seed="3"/><feDisplacementMap id="paahdin-disp" in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>';
  document.body.appendChild(svg);
  const tyyli = document.createElement('style');
  tyyli.textContent = '.paahdin-sana{display:inline-block;transform-origin:50% 70%}.paahdin-sana.pomppu{animation:paahdin-pomppu .55s cubic-bezier(.3,1.6,.5,1)}@keyframes paahdin-pomppu{0%{transform:scale(1)}35%{transform:scale(1.16) translateY(-.06em)}100%{transform:scale(1)}}';
  document.head.appendChild(tyyli);
});

let W = 0, H = 0, DPR = 1, s = 1, P = 2, bx = 0, gy = 0;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  for (const c of [cv, fxc]) { c.width = Math.round(W*DPR); c.height = Math.round(H*DPR); }
  s = H / KUVA_H * ZOOM; P = 2.8*s;
  bx = W * 0.64;
  gy = H - (KUVA_H - MAA_Y - 3) * s;      // maan pinta, sama pohja-ankkuri kuin taustakerroksilla
}
addEventListener('resize', koko); koko();

// ---------- pikselisprite-apu ----------
function sprite(w, h, maalaa){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const rect = (x,y,ww,hh,col) => { g.fillStyle = col; g.fillRect(x,y,ww,hh); };
  maalaa(rect, g); return c;
}
function ellipsiSprite(w, h, tayte, reuna){
  return sprite(w, h, (rect) => {
    const cx = (w-1)/2, cy = (h-1)/2, rx = w/2 - .3, ry = h/2 - .3;
    const sisalla = (x,y) => ((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1;
    for (let y=0;y<h;y++) for (let x=0;x<w;x++) if (sisalla(x,y)) {
      const r = !sisalla(x-1,y)||!sisalla(x+1,y)||!sisalla(x,y-1)||!sisalla(x,y+1);
      rect(x,y,1,1, r ? reuna : tayte);
    }
  });
}

const K='#161922', VA='#f4f6fa', L='#c3cad6', M='#8a94a6', D='#566074';
const PAAHDIN = sprite(30, 20, (rect, g) => {
  rect(1,1,26,17,K); rect(2,2,24,15,L);
  for (const [x,y] of [[1,1],[26,1],[1,17],[26,17]]) g.clearRect(x,y,1,1);
  for (const [x,y] of [[2,2],[25,2],[2,16],[25,16]]) rect(x,y,1,1,K);
  rect(3,2,22,1,VA);
  rect(3,4,2,10,VA); rect(5,4,1,10,'#e2e7ef');
  rect(21,3,2,12,M); rect(23,3,2,13,D);
  rect(3,14,18,2,M); rect(3,16,22,1,D);
  rect(5,1,8,2,'#07080c'); rect(15,1,8,2,'#07080c');            // raot
  rect(12,8,3,3,'#c8402f'); rect(12,8,1,1,'#ff9078'); rect(14,10,1,1,'#7a1f16'); // nuppi
  
  rect(27,5,1,10,'#2c313d');                                    // vivun ura
  rect(3,18,4,2,'#24262c'); rect(20,18,4,2,'#24262c');          // jalat
});
const KANTO = sprite(36, 11, (rect) => {
  rect(2,2,32,8,'#4a2e1c'); rect(1,1,34,2,'#8a6238'); rect(3,0,30,1,'#a77c4a');
  rect(8,1,20,1,'#9a7042'); rect(13,1,10,1,'#8a6238');
  for (const x of [6,11,17,23,29]) rect(x,4,1,6,'#35200f');
  rect(0,8,3,3,'#4a2e1c'); rect(33,8,3,3,'#4a2e1c'); rect(2,10,32,1,'#2a190c');
  rect(4,0,6,1,'#4f7a3a'); rect(3,1,3,1,'#4f7a3a'); rect(25,0,5,1,'#5d8a44'); rect(30,2,2,2,'#4f7a3a');
});
const PAAHTOLEIPA = sprite(8, 10, (rect) => {
  rect(1,0,6,1,'#7a4a22'); rect(0,1,8,9,'#7a4a22');
  rect(1,1,6,8,'#dca65e'); rect(2,3,4,4,'#c4823e'); rect(3,4,2,2,'#ad6c2e');
});
const LAMPPU_ON = sprite(7, 10, (rect) => {
  rect(2,0,3,1,'#fff6c4'); rect(1,1,5,1,'#fff1a8'); rect(0,2,7,3,'#ffe98a'); rect(1,5,5,1,'#ffe07a'); rect(2,6,3,1,'#f5cf5a');
  rect(2,1,1,2,'#ffffff'); rect(2,7,3,1,'#a3acbd'); rect(2,8,3,1,'#6b7385'); rect(3,9,1,1,'#4b5263');
});
const LAMPPU_OFF = sprite(7, 10, (rect) => {
  rect(2,0,3,1,'#6b7183'); rect(1,1,5,1,'#5e6476'); rect(0,2,7,3,'#535969'); rect(1,5,5,1,'#4a4f5e'); rect(2,6,3,1,'#424756');
  rect(2,1,1,2,'#8c93a5'); rect(2,7,3,1,'#a3acbd'); rect(2,8,3,1,'#6b7385'); rect(3,9,1,1,'#4b5263');
});
const KUPLA = ellipsiSprite(28, 20, '#f4f1e6', K);
const PISTEET = [ellipsiSprite(3,3,'#f4f1e6',K), ellipsiSprite(5,4,'#f4f1e6',K), ellipsiSprite(7,6,'#f4f1e6',K)];


function spr(c, ux, uy){ ctx.drawImage(c, bx + ux*P, gy + uy*P, c.width*P, c.height*P); }

// ---------- äänet (WebAudio, ei tiedostoja) ----------
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
function kohina(kesto, {voim=.15, suodin='lowpass', f=1000, viive=0}={}){
  if (!aaniPaalla) return; const a = A(), t = a.currentTime + viive;
  const b = a.createBuffer(1, Math.ceil(a.sampleRate*kesto), a.sampleRate), d = b.getChannelData(0);
  for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
  const src = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  src.buffer = b; fl.type = suodin; fl.frequency.value = f; g.gain.value = voim;
  src.connect(fl).connect(g).connect(a.destination); src.start(t);
}
const AANI = {
  vihellys: (k) => savel(1500, k, {f1:420, voim:.05}),
  tomahdys: () => { savel(130, .3, {f1:40, voim:.45}); kohina(.25, {f:500, voim:.35}); },
  naksu:    () => { kohina(.04, {suodin:'highpass', f:2500, voim:.25}); savel(900, .04, {voim:.06, tyyppi:'square'}); },
  hurina:   (k) => { if (!aaniPaalla) return; const a=A(), t=a.currentTime; const o=a.createOscillator(), fl=a.createBiquadFilter(), g=a.createGain();
              o.type='sawtooth'; o.frequency.value=58; fl.type='lowpass'; fl.frequency.value=260;
              g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.035,t+.4); g.gain.setValueAtTime(.035,t+k-.15); g.gain.exponentialRampToValueAtTime(.0001,t+k);
              o.connect(fl).connect(g).connect(a.destination); o.start(t); o.stop(t+k+.05); },
  ding:     () => { for (const [r,v] of [[1,.22],[2.76,.07],[5.4,.03]]) savel(1760*r, 2.2/r, {voim:v}); kohina(.05,{suodin:'bandpass',f:1800,voim:.3}); },
  plop:     () => savel(260, .12, {f1:520, voim:.12, tyyppi:'triangle'}),
  muru:     () => kohina(.08, {suodin:'bandpass', f:3000, voim:.18}),
  valo:     () => savel(700, .25, {f1:1400, voim:.08, tyyppi:'triangle'}),
  surina:   () => kohina(.05, {suodin:'bandpass', f:4200, voim:.12}),
  pihaus:   () => kohina(.6, {suodin:'highpass', f:3500, voim:.14}),
};


// ---------- tila ----------
let aktiivinen = false, rafId = 0, edellinen = 0, nyt = 0;
let tila, hiukkaset, tekstiHiukkaset, leivat, kupla, ajastimet = [];
const ajasta = (fn, ms) => ajastimet.push(setTimeout(fn, ms));
const G = 1150, LEIVA_LEPO_Y = -28;

function alusta(){
  ajastimet.forEach(clearTimeout); ajastimet = [];
  tila = { putoaa:false, laskeutunut:false, y:0, vy:0, litistys:0, litV:0, tarina:0,
           vipu:0, vipuKohde:0, kuumuus:0, hehku:0, kuumenee:false, kuumaAika:0, valmis:false,
           sanaKuumuus:0, sanaHehku:0, savuAjastin:0, laskuT:-9, dingT:-9, rapsays:3 };
  hiukkaset = []; tekstiHiukkaset = []; kupla = null;
  leivat = [
    { x:-6.5, y:-23, vx:0, vy:0, r:0, vr:0, tila:'raossa', palaa:true },
    { x: 3.5, y:-23, vx:0, vy:0, r:0, vr:0, tila:'raossa', palaa:false },
  ];
  paivitaSana(true);
}
function pudota(){
  tila.putoaa = true; tila.y = -(gy/P + 45); tila.vy = 0;
  AANI.vihellys(Math.sqrt(2*-tila.y/(G*1.4)));
}
function laskeudu(){
  tila.putoaa = false; tila.laskeutunut = true; tila.y = 0; tila.laskuT = nyt;
  tila.litistys = -0.32; tila.litV = 0; tila.tarina = 1;
  AANI.tomahdys();
  for (let i=0;i<22;i++) { const p = Math.random()<.5?-1:1;
    hiukkaset.push({ x:p*(14+Math.random()*4), y:-11, vx:p*(30+Math.random()*90), vy:-(10+Math.random()*45),
      g:60, ika:0, kesto:.5+Math.random()*.6, koko:1+Math.random()*1.6, vari:'200,195,185', a:.55, kasvu:1.8, vastus:3 }); }
  ajasta(() => { tila.vipuKohde = 1; AANI.naksu(); tila.kuumenee = true; tila.kuumaAika = 0; AANI.hurina(2.6); }, 380);
}
function ding(){
  tila.kuumenee = false; tila.valmis = true; tila.vipuKohde = 0; tila.hehku = 1.5; tila.dingT = nyt;
  AANI.ding(); setTimeout(AANI.plop, 30); ajasta(ajattele, DINGISTA_KUPLAAN);
  if (sanaEl) { sanaEl.classList.remove('pomppu'); void sanaEl.offsetWidth; sanaEl.classList.add('pomppu'); }
  const [a, b] = leivat;
  a.tila = 'ilmassa'; a.vy = -Math.sqrt(2*G*30);
  b.tila = 'ilmassa'; b.vy = -Math.sqrt(2*G*48); b.vr = -11;
  const nousu = -b.vy/G, lasku = Math.sqrt(2*(48 + 23)/G);
  b.vx = (-46 - b.x) / (nousu + lasku);
  for (let i=0;i<10;i++) hiukkaset.push({ x:-2+Math.random()*6, y:-30, vx:(Math.random()-.5)*60, vy:-60-Math.random()*60,
    g:300, ika:0, kesto:.6, koko:1, vari:'230,180,110', a:1, kasvu:0, vastus:1 });
}
function ajattele(){ kupla = { t:0, vaihe:-1 }; }

function paivita(dt, t){
  // putoaminen + litistys-jousi
  if (tila.putoaa) { tila.vy += G*1.4*dt; tila.y += tila.vy*dt; if (tila.y >= 0) laskeudu(); }
  if (tila.laskeutunut) {
    const voima = -380*tila.litistys - 14*tila.litV;
    tila.litV += voima*dt; tila.litistys += tila.litV*dt;
  }
  tila.tarina = Math.max(0, tila.tarina - dt*3.2);
  tila.vipu += (tila.vipuKohde - tila.vipu) * Math.min(1, dt*(tila.vipuKohde ? 14 : 30));

  if (tila.kuumenee) {
    tila.kuumaAika += dt;
    tila.kuumuus = Math.min(1, tila.kuumaAika / 2.5);
    tila.hehku = tila.kuumuus;
    if (tila.kuumaAika >= 2.6) ding();
  } else if (tila.valmis) {
    tila.hehku += (0.18 - tila.hehku) * Math.min(1, dt*1.6);
  }
  // sana kuumenee paahtimen tahdissa ja jää paahdetuksi
  const sanaKohde = tila.valmis ? 1 : tila.kuumuus;
  tila.sanaKuumuus += (sanaKohde - tila.sanaKuumuus) * Math.min(1, dt*4);
  const hehkuKohde = tila.kuumenee ? tila.kuumuus : (tila.valmis ? 0.15 : 0);
  tila.sanaHehku += (hehkuKohde - tila.sanaHehku) * Math.min(1, dt*(tila.kuumenee ? 4 : 1.2));
  paivitaSana(false, t);

  // savua raoista kuumetessa
  if (tila.laskeutunut && (tila.kuumuus > .45 && tila.kuumenee || tila.hehku > .4)) {
    tila.savuAjastin -= dt;
    if (tila.savuAjastin <= 0) { tila.savuAjastin = .06;
      hiukkaset.push({ x:(Math.random()<.5?-6.5:3.5)+(Math.random()-.5)*6, y:-30, vx:(Math.random()-.5)*6, vy:-14-Math.random()*10,
        g:-4, ika:0, kesto:1.6+Math.random(), koko:1.5, vari:'190,190,200', a:.22, kasvu:2.2, vastus:.4 }); }
  }

  // leivät
  for (const l of leivat) {
    if (l.tila !== 'ilmassa') continue;
    l.vy += G*dt; l.x += l.vx*dt; l.y += l.vy*dt; l.r += l.vr*dt;
    if (l.palaa && l.vy > 0 && l.y >= LEIVA_LEPO_Y) { l.y = LEIVA_LEPO_Y; l.tila = 'levossa'; AANI.naksu(); }
    if (!l.palaa) {
      const ulottuma = Math.abs(Math.cos(l.r))*5 + Math.abs(Math.sin(l.r))*4;
      if (l.y + ulottuma >= 1) {
        l.y = 1 - ulottuma;
        if (Math.abs(l.vy) > 60) {
          if (!l.pomppinut) { AANI.muru(); for (let i=0;i<14;i++) hiukkaset.push({ x:l.x+(Math.random()-.5)*8, y:-1, vx:(Math.random()-.5)*90, vy:-30-Math.random()*70,
            g:420, ika:0, kesto:.7+Math.random()*.4, koko:.8+Math.random()*.6, vari:'214,160,90', a:1, kasvu:0, vastus:1 }); }
          l.pomppinut = true; l.vy *= -.32; l.vx *= .5; l.vr *= .45;
        } else {
          l.vy = 0; l.vx = 0; l.vr = 0; l.tila = 'maassa';
          l.r = Math.PI/2 + Math.round((l.r - Math.PI/2) / Math.PI) * Math.PI; l.y = -3;   // jää lappeelleen
        }
      }
    }
  }

  // ajatuskupla: pisteet → kupla → lamppu syttyy → lepattaa → pihahtaa pimeäksi
  if (kupla) {
    kupla.t += dt; const k = kupla.t;
    const askeleet = [0, .22, .44, .7, 1.25, 2.05, 2.25, 2.4, 2.62, 2.8, 3.9];
    while (kupla.vaihe + 1 < askeleet.length && k >= askeleet[kupla.vaihe + 1]) {
      kupla.vaihe++;
      if (kupla.vaihe <= 3) AANI.plop();
      if (kupla.vaihe === 4) AANI.valo();
      if (kupla.vaihe >= 5 && kupla.vaihe <= 8) AANI.surina();
      if (kupla.vaihe === 9) { AANI.pihaus();
        for (let i=0;i<12;i++) hiukkaset.push({ x:36.5+(Math.random()-.5)*4, y:-80, vx:(Math.random()-.5)*20, vy:-8-Math.random()*16,
          g:-6, ika:0, kesto:1.4+Math.random()*.8, koko:1.6, vari:'170,170,180', a:.5, kasvu:2.5, vastus:.6 }); }
      if (kupla.vaihe === 10) {
        AANI.plop();
        for (let i=0;i<16;i++) { const a = Math.random()*Math.PI*2;
          hiukkaset.push({ x:36+Math.cos(a)*13, y:-75+Math.sin(a)*9, vx:Math.cos(a)*40, vy:Math.sin(a)*30, g:80, ika:0, kesto:.5, koko:1, vari:'244,241,230', a:1, kasvu:0, vastus:2 }); }
        // paahdin röyhtäisee pienen savukiehkuran
        for (let i=0;i<8;i++) hiukkaset.push({ x:-1.5+(Math.random()-.5)*14, y:-30, vx:(Math.random()-.5)*10, vy:-20-Math.random()*8,
          g:-4, ika:0, kesto:1.8, koko:2, vari:'200,200,205', a:.3, kasvu:2.4, vastus:.4 });
      }
    }
    if (k > 4.3) kupla = null;
  }

  // hiukkaset (maailma)
  for (const h of hiukkaset) {
    h.ika += dt; h.vy += h.g*dt; h.vx *= Math.exp(-h.vastus*dt); h.vy *= Math.exp(-h.vastus*.3*dt);
    h.x += h.vx*dt; h.y += h.vy*dt;
    if (h.g > 100 && h.y > 0) { h.y = 0; h.vy *= -.25; h.vx *= .6; }
  }
  hiukkaset = hiukkaset.filter(h => h.ika < h.kesto);

  // savu ja kipinät sanasta (DOM-tekstin päällä, fx-kanvaasi)
  if (sanaEl && tila.sanaKuumuus > .25) {
    const r = sanaEl.getBoundingClientRect();
    const tiheys = tila.kuumenee ? 40*tila.sanaKuumuus : 9*tila.sanaHehku/0.15*.6;
    let n = tiheys*dt; while (n > 0) { if (Math.random() < n)
      tekstiHiukkaset.push({ x:r.left + Math.random()*r.width, y:r.top + r.height*(.2+Math.random()*.25), vx:(Math.random()-.5)*12, vy:-18-Math.random()*22,
        ika:0, kesto:1.6+Math.random()*1.2, koko:r.height*(.06+Math.random()*.06), kipina:false }); n -= 1; }
    if (tila.kuumenee && tila.sanaKuumuus > .6 && Math.random() < dt*14)
      tekstiHiukkaset.push({ x:r.left + Math.random()*r.width, y:r.top + r.height*.45, vx:(Math.random()-.5)*30, vy:-50-Math.random()*60,
        ika:0, kesto:.6+Math.random()*.6, koko:r.height*.025, kipina:true });
  }
  for (const h of tekstiHiukkaset) { h.ika += dt; h.x += h.vx*dt + Math.sin(h.ika*3 + h.koko)*8*dt; h.y += h.vy*dt; }
  tekstiHiukkaset = tekstiHiukkaset.filter(h => h.ika < h.kesto);
}

// sanan väri paahtuu keltaisesta ruskeaksi, hehku + kuumuusvärinä
let sanaEl = null; const turb = () => document.getElementById('paahdin-turb'), disp = () => document.getElementById('paahdin-disp');
function paivitaSana(nollaa, t=0){
  const k = nollaa ? 0 : tila.sanaKuumuus, h = nollaa ? 0 : tila.sanaHehku;
  if (!sanaEl) return;
  if (nollaa || k < .002) { sanaEl.style.color = ''; sanaEl.style.textShadow = ''; sanaEl.style.filter = ''; return; }
  const lerp = (a,b) => Math.round(a + (b-a)*k);
  sanaEl.style.color = `rgb(${lerp(242,184)},${lerp(201,104)},${lerp(76,40)})`;
  sanaEl.style.textShadow = `0 0 ${(.15 + h*.5).toFixed(2)}em rgba(255,${Math.round(150-60*h)},30,${(h*.85).toFixed(2)}), 0 3px 18px rgba(0,0,0,.85)`;
  const varina = tila.kuumenee ? 3.2*k : 0;
  if (varina > .05) {
    sanaEl.style.filter = 'url(#paahdin-kuumuus)';
    disp().setAttribute('scale', varina.toFixed(2));
    turb().setAttribute('baseFrequency', `0.015 ${(0.08 + Math.sin(t*9)*0.02).toFixed(4)}`);
  } else sanaEl.style.filter = '';
}

// ---------- kasvot ----------
// Silmät ja suu piirretään erikseen (ei spriteen), jotta ne elävät:
// räpyttely, katse seuraa lentävää leipää ja kuplaa, siristys kuumuudessa,
// ällistys DINGissä, lannistus kun lamppu sammuu.
// Koordinaatit sprite-pikseleinä paahtimen origosta (pohjakeskipiste, ylös = -20).
function piirraKasvot(t){
  const sinceLasku = nyt - tila.laskuT, sinceDing = nyt - tila.dingT;
  let w = 2, h = 3, dx = 0, dy = 0, suu = 'viiva';
  const b = leivat[1];
  if (tila.putoaa) { w = 3; h = 4; dy = 1; suu = 'o'; }
  else if (sinceLasku < .3) { h = 1; }                                  // isku: silmät kiinni
  else if (tila.kuumenee) { h = tila.kuumuus > .66 ? 1 : 2; dy = 1; }   // siristää kuumuudessa
  if (sinceDing >= 0 && sinceDing < .7) { w = 3; h = 4; dy = -1; suu = 'o'; }
  else if (b.tila === 'ilmassa' && sinceDing >= .7) { dx = b.x < -20 ? -1 : 0; dy = b.y < -35 ? -1 : 1; }
  else if (b.tila === 'maassa' && sinceDing < 3.2) { dx = -1; dy = 1; }
  if (kupla) {
    const v = kupla.vaihe;
    if (v >= 0 && v < 4) { dx = 1; dy = -1; }
    if (v >= 4 && v <= 8) { w = 3; h = 4; dx = 1; dy = -1; suu = 'hymy'; }
    if (v >= 9) { h = 1; dy = 1; suu = 'alas'; }                           // lannistus
  }
  // räpyttely ~3 s välein (ei kun silmät on jo viiruina)
  if (h > 1 && !tila.putoaa) { tila.rapsays -= 1/60; if (tila.rapsays < 0) { if (tila.rapsays < -.12) tila.rapsays = 2.5 + Math.random()*2.5; else h = 1; } }

  const px = (x,y,ww,hh,c) => { ctx.fillStyle = c; ctx.fillRect(x*P, y*P, ww*P, hh*P); };
  const EYE = '#161922';
  for (const cx of [-6, 2]) {               // silmät symmetrisesti nenän (nuppi, keskikohta -2) molemmin puolin
    const x = Math.round(cx - w/2) + dx, y = Math.round(-14 - h/2) + dy;
    px(x, y, w, h, EYE);
    if (h >= 3) px(dx > 0 ? x + w - 1 : x, y, 1, 1, '#ffffff');   // kiilto katseen puolella
  }
  if (suu === 'o') { px(-3, -8, 3, 2, '#161922'); px(-2, -7, 1, 1, '#7a1f16'); }
  else if (suu === 'hymy') { px(-4, -8, 1, 1, D); px(-3, -7, 3, 1, D); px(0, -8, 1, 1, D); }
  else if (suu === 'alas') { px(-4, -7, 1, 1, D); px(-3, -8, 3, 1, D); px(0, -7, 1, 1, D); }
  else px(-4, -8, 5, 1, D);
}


// ---------- piirto ----------
function hehkupallo(x, y, r, rgb, a, litteys=1){
  if (a <= 0.003) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.translate(x, y); ctx.scale(1, litteys);
  const g = ctx.createRadialGradient(0,0,0, 0,0,r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(.4, `rgba(${rgb},${a*.35})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(-r,-r,2*r,2*r); ctx.restore();
}
function piirra(t){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H); ctx.imageSmoothingEnabled = false;
  const tarina = tila.tarina**2 * 9 * s;
  ctx.translate((Math.random()-.5)*tarina, (Math.random()-.5)*tarina);
  const lepatus = .92 + .08*Math.sin(t*23)*Math.sin(t*7.3), hk = tila.hehku * lepatus;
  if (tila.laskeutunut) {
    hehkupallo(bx - 1.5*P, gy - 30*P, 95*P, '255,120,40', .32*Math.min(hk,1.2));
    hehkupallo(bx, gy, 70*P, '255,140,60', .35*Math.min(hk,1.2), .28);
  }
  spr(KANTO, -18, -10);
  for (const l of leivat) if (l.tila !== 'raossa') {
    ctx.save(); ctx.translate(bx + l.x*P, gy + l.y*P); ctx.rotate(l.r);
    ctx.drawImage(PAAHTOLEIPA, -4*P, -5*P, 8*P, 10*P); ctx.restore();
  }
  if (tila.putoaa || tila.laskeutunut) {
    const sy = 1 + tila.litistys, sx = 1 - tila.litistys*.6;
    const vari = tila.kuumenee ? Math.sin(t*60)*.25*tila.kuumuus : 0;
    ctx.save(); ctx.translate(bx + vari*P, gy + (-10 + tila.y)*P); ctx.scale(sx, sy);
    ctx.drawImage(PAAHDIN, -15*P, -20*P, 30*P, 20*P);
    if (hk > 0.01) { ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,${Math.round(90+70*Math.min(hk,1))},20,${Math.min(1,hk)})`;
      ctx.fillRect(-10*P, -19*P, 8*P, 2*P); ctx.fillRect(0*P, -19*P, 8*P, 2*P);
      ctx.globalCompositeOperation = 'source-over'; }
    piirraKasvot(t);
    const vy = -15 + tila.vipu*8;
    ctx.fillStyle = '#1d1f25'; ctx.fillRect(12*P, vy*P, 4*P, 2*P);
    ctx.fillStyle = '#4a4f5c'; ctx.fillRect(12*P, vy*P, 4*P, .5*P);
    ctx.restore();
  }
  if (tila.laskeutunut) hehkupallo(bx - 1.5*P, gy - 19*P, 26*P, '255,170,70', .55*Math.min(hk,1.4));
  for (const h of hiukkaset) {
    const e = h.ika / h.kesto, kk = h.koko*(1 + h.kasvu*e)*P;
    ctx.globalAlpha = h.a * (1 - e); ctx.fillStyle = `rgb(${h.vari})`;
    ctx.fillRect(bx + h.x*P - kk/2, gy + h.y*P - kk/2, kk, kk);
  }
  ctx.globalAlpha = 1;
  if (kupla && kupla.t <= 3.9) {
    const v = kupla.vaihe, k = kupla.t;
    const pist = [[12,-36],[17,-44],[22,-54]];
    for (let i=0;i<3;i++) if (v >= i) { const p = PISTEET[i]; spr(p, pist[i][0]-p.width/2, pist[i][1]-p.height/2); }
    if (v >= 3) {
      const kk = Math.min(1, (k - .7)/.18), ponn = kk < 1 ? kk*1.15 : 1 + Math.sin((k-.88)*20)*Math.exp(-(k-.88)*8)*.08;
      ctx.save(); ctx.translate(bx + 36*P, gy - 75*P); ctx.scale(ponn, ponn);
      ctx.drawImage(KUPLA, -14*P, -10*P, 28*P, 20*P);
      const paalla = v === 4 || v === 6 || v === 8 || (v === 5 && Math.sin(k*90) > 0);
      ctx.drawImage(paalla ? LAMPPU_ON : LAMPPU_OFF, -3.5*P, -6*P, 7*P, 10*P);
      ctx.restore();
      if (paalla) { hehkupallo(bx + 36*P, gy - 77*P, 30*P, '255,235,140', .3);
        ctx.save(); ctx.translate(bx + 36*P, gy - 77*P); ctx.fillStyle = '#ffe98a';
        for (let i=0;i<8;i++) { ctx.rotate(Math.PI/4); ctx.fillRect(-.5*P, -12*P, 1*P, 2.5*P); }
        ctx.restore(); }
    }
  }
  fx.setTransform(DPR,0,0,DPR,0,0); fx.clearRect(0,0,W,H);
  for (const h of tekstiHiukkaset) {
    const e = h.ika / h.kesto;
    if (h.kipina) { fx.globalCompositeOperation = 'lighter'; fx.fillStyle = `rgba(255,${Math.round(180-120*e)},60,${1-e})`;
      fx.beginPath(); fx.arc(h.x, h.y, h.koko*(1-e*.5), 0, 7); fx.fill(); fx.globalCompositeOperation = 'source-over'; }
    else { const r = h.koko*(1 + e*2.6), a = .16*Math.sin(Math.PI*Math.min(1, e*1.4));
      const g = fx.createRadialGradient(h.x,h.y,0,h.x,h.y,r); g.addColorStop(0,`rgba(205,200,195,${a})`); g.addColorStop(1,'rgba(205,200,195,0)');
      fx.fillStyle = g; fx.fillRect(h.x-r, h.y-r, 2*r, 2*r); }
  }
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms/1000, dt = Math.min(.05, t - edellinen || 0); edellinen = t; nyt = t;
  // naytaTeksti() rakentaa tekstin pienellä viiveellä -> haetaan sana uudelleen kunnes se on DOMissa
  if (!sanaEl || !sanaEl.isConnected) sanaEl = document.querySelector('#teksti .paahdin-sana');
  paivita(dt, t); piirra(t);
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä (naytaTeksti():n JÄLKEEN).
window.naytaPaahdin = function(p){
  const paalle = !!(p && p.paahdin);
  if (!paalle) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId);
    ajastimet.forEach(clearTimeout); ajastimet = [];
    cv.style.opacity = 0; fxc.style.opacity = 0;
    if (sanaEl) { paivitaSana(true); sanaEl = null; }
    return;
  }
  const esikatselu = (typeof ESIKATSELU !== 'undefined') && ESIKATSELU;
  aaniPaalla = !esikatselu && !(typeof p.paahdin === 'object' && p.paahdin.aani === false);
  koko(); alusta();
  sanaEl = document.querySelector('#teksti .paahdin-sana');
  aktiivinen = true; edellinen = 0;
  cv.style.opacity = 1; fxc.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
  ajasta(pudota, TEKSTISTA_PAAHTIMEEN);
};
})();
