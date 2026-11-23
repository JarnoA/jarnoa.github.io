// ============================================================================
// PEILI-KOHTAUS (2.10.2026, x:5115 "Tekoäly on peili" - ihmiskunnan tuottaman
// tiedon heijastuma ja kaiku). Korvaa vanhan kuvat/mirror2.png:n.
// Käyttö esitys-data.js:ssä: pysähdykseen kenttä `peili: true`.
//
// Kulku: soikea peili aukeaa oikealle (teksti on vasemmalla) -> kirjat ja
// keskustelupalstojen puhekuplat kieppuvat pyörteenä peilin sisään -> imetystä
// aineksesta lentää värisirpaleita, jotka asettuvat mosaiikiksi Jarnon
// pikselihahmoksi -> mosaiikki muuttuu oikeaksi hahmoksi, joka vilkuttaa
// (sama jarno-wave.png kuin kiitossivulla) -> välillä heijastus häiriintyy ja
// jättää viiveellä kulkevan "kaiun" haamukuvan.
//
// Pikseli-ilme: pyörre, kirjat ja kehys piirretään matalaresoluutioiseen
// puskuriin (taustojen pikselikoko, H/256) ja skaalataan terävästi ylös.
// Kaikki tekstikerroksen alla (z 4).
// ============================================================================
(function(){
'use strict';
const SPRITE = 'assets/2d/sprites/jarno/jarno-wave.png', KEHYKSIA = 5, KEHYS_W = 356, KEHYS_H = 555;
const KIRJAVARIT = ['#8a3b2e', '#2e5a8a', '#3d7a45', '#7a5a2e', '#5a3d7a', '#a8862e', '#2e6f6f', '#8a2e5a'];

const cv = document.createElement('canvas');
cv.id = 'peili';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
const lo = document.createElement('canvas'), lctx = lo.getContext('2d');   // matalaresoluutiopuskuri
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

const sprite = new Image(); sprite.src = SPRITE;
let mosaiikkiData = null;     // kehyksen 0 värit karkeana ruudukkona
function teeMosaiikki(){
  const c = document.createElement('canvas'), SX = 22, SY = 34; c.width = SX; c.height = SY;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = true;
  g.drawImage(sprite, 0, 0, KEHYS_W, KEHYS_H, 0, 0, SX, SY);
  const d = g.getImageData(0, 0, SX, SY).data, solut = [];
  for (let y=0;y<SY;y++) for (let x=0;x<SX;x++) { const i = (y*SX + x)*4;
    if (d[i+3] > 120) solut.push({ gx: x, gy: y, vari: `rgb(${d[i]},${d[i+1]},${d[i+2]})` }); }
  mosaiikkiData = { SX, SY, solut };
}
sprite.onload = teeMosaiikki;

let W = 0, H = 0, DPR = 1, PX = 4, LW = 0, LH = 0;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
  PX = H / 256; LW = Math.ceil(W / PX); LH = 256;
  lo.width = LW; lo.height = LH;
}
addEventListener('resize', koko); koko();

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;
let kirjat = [], sirpaleet = [], vaareet = [], kaiku = null, syntyAjastin = 0, imettyja = 0;

// peilin paikka matalaresoluutiokoordinaateissa - väistää tekstilaatikon:
// jos teksti ulottuu peilin kohdalle, peili siirtyy tekstin alle/oikealle ja
// pienenee tarvittaessa (luettavuus ensin, Jarnon sääntö).
let teksti = null;   // { oikea, ala } lo-yksiköissä
// Jarno 2.10.2026: tällä pysähdyksellä saa olla osin tekstin takana -> iso peili alkuperäisellä paikallaan
const VAISTA_TEKSTIA = false;
const VILKUTUKSIA = 5;   // vilkutus pysähtyy viiden kierroksen jälkeen
function mittaaTeksti(){
  const e = document.getElementById('teksti'), r = e && e.getBoundingClientRect();
  teksti = r && r.height > 0 ? { oikea: r.right / PX, ala: r.bottom / PX } : null;
}
function peili(){
  let cx = LW * .76, cy = LH * .50, ry = LH * .27;
  if (VAISTA_TEKSTIA && teksti && teksti.oikea > cx - ry * .65 - 6) {
    const tila = LH * .95 - teksti.ala - 6;               // vapaa korkeus tekstin alla
    ry = Math.max(LH * .17, Math.min(ry, tila / 2));
    cy = teksti.ala + 6 + ry;
    cx = Math.min(LW - ry * .65 - 8, Math.max(cx, LW * .80));
  }
  return { cx, cy, rx: ry * .63, ry };
}
function hahmoLaatikko(){ const p = peili(), h = p.ry * 1.55, w = h * KEHYS_W / KEHYS_H; return { x: p.cx - w/2, y: p.cy - h*.52, w, h }; }

function alusta(){
  kirjat = []; sirpaleet = []; vaareet = []; kaiku = null; syntyAjastin = 0; imettyja = 0;
}
function uusiKirja(){
  const p = peili(), a = Math.random() * Math.PI * 2, r = Math.max(LW, LH) * (.55 + Math.random()*.25);
  kirjat.push({ a, r, w: .9 + Math.random()*.9, rot: Math.random()*6, vr: (Math.random()-.5)*6,
    vari: KIRJAVARIT[(Math.random()*KIRJAVARIT.length)|0], kupla: Math.random() < .22, koko: 5 + Math.random()*4 });
}

function piirraKirja(k, x, y, sk){
  lctx.save(); lctx.translate(Math.round(x), Math.round(y)); lctx.rotate(k.rot); lctx.scale(sk, sk);
  const s = k.koko;
  if (k.kupla) {            // keskustelupalstan puhekupla (ei logoja)
    lctx.fillStyle = '#e9edf3'; lctx.fillRect(-s, -s*.6, s*2, s*1.2); lctx.fillRect(-s*.6, s*.6, s*.5, s*.4);
    lctx.fillStyle = '#7b8494'; lctx.fillRect(-s*.7, -s*.3, s*1.4, 1); lctx.fillRect(-s*.7, s*.1, s*.9, 1);
  } else {                  // avoin kirja: kansi + sivut
    lctx.fillStyle = k.vari; lctx.fillRect(-s, -s*.7, s*2, s*1.4);
    lctx.fillStyle = '#efe6cf'; lctx.fillRect(-s*.85, -s*.6, s*.8, s*1.15); lctx.fillRect(s*.05, -s*.6, s*.8, s*1.15);
    lctx.fillStyle = '#9b927c'; for (let i=0;i<3;i++){ lctx.fillRect(-s*.75, -s*.4 + i*s*.35, s*.6, 1); lctx.fillRect(s*.15, -s*.4 + i*s*.35, s*.6, 1); }
  }
  lctx.restore();
}

function piirra(t, dt){
  const p = peili();
  lctx.setTransform(1,0,0,1,0,0); lctx.clearRect(0, 0, LW, LH); lctx.imageSmoothingEnabled = false;
  const auki = Math.min(1, t / .9), sk = 1 - Math.pow(1 - auki, 3);
  const pyorre = t < 1 ? 0 : Math.min(1, (t - 1) / 2) * (t > 9 ? Math.max(.25, 1 - (t - 9)*.4) : 1);

  // lasi: tumma syvyys + kiertyvä spiraali
  lctx.save(); lctx.beginPath(); lctx.ellipse(p.cx, p.cy, p.rx*sk, p.ry*sk, 0, 0, Math.PI*2); lctx.clip();
  const g = lctx.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, p.ry);
  g.addColorStop(0, `rgba(${120 + 80*pyorre},${170 + 60*pyorre},255,.95)`); g.addColorStop(.6, 'rgba(40,60,110,.95)'); g.addColorStop(1, 'rgba(15,20,45,.95)');
  lctx.fillStyle = g; lctx.fillRect(p.cx - p.rx, p.cy - p.ry, p.rx*2, p.ry*2);
  lctx.fillStyle = `rgba(200,225,255,${.35 * (.4 + pyorre)})`;
  for (let k=0;k<3;k++) for (let i=0;i<90;i++){ const a = i*.12 + t*(1.2 + 3*pyorre) + k*2.09, r = i*.0105*p.ry;
    lctx.fillRect(Math.round(p.cx + Math.cos(a)*r*.65), Math.round(p.cy + Math.sin(a)*r), 1, 1); }
  // väreet imeytyneistä kirjoista
  for (const v of vaareet){ v.ika += dt; const r = v.ika * p.ry * 1.4;
    lctx.strokeStyle = `rgba(220,240,255,${.6*(1 - v.ika)})`; lctx.lineWidth = 1;
    lctx.beginPath(); lctx.ellipse(p.cx, p.cy, r*.65, r, 0, 0, Math.PI*2); lctx.stroke(); }
  vaareet = vaareet.filter(v => v.ika < 1);
  lctx.restore();

  // mosaiikkisirpaleet asettuvat hahmoksi
  const hl = hahmoLaatikko();
  if (mosaiikkiData && t > 4 && !sirpaleet.length) {
    const { SX, SY, solut } = mosaiikkiData;
    sirpaleet = solut.map(s => ({ ...s, tx: hl.x + (s.gx + .5) * hl.w / SX, ty: hl.y + (s.gy + .5) * hl.h / SY,
      x: p.cx, y: p.cy, alkaa: 4 + Math.random()*3.2, a: Math.random()*6 }));
  }
  const valmis = t > 7.8;
  const kok = Math.ceil(hl.w / (mosaiikkiData ? mosaiikkiData.SX : 22)) + 1;
  if (!valmis || t < 8.6) {
    for (const s of sirpaleet){ const e = t - s.alkaa; if (e < 0) continue;
      const f = Math.min(1, e / .7), ff = 1 - Math.pow(1 - f, 3);
      const x = p.cx + (s.tx - p.cx)*ff + Math.sin(s.a + f*6)*(1 - f)*p.rx*.8, y = p.cy + (s.ty - p.cy)*ff + Math.cos(s.a + f*6)*(1 - f)*p.ry*.4;
      lctx.globalAlpha = valmis ? Math.max(0, 1 - (t - 7.8)/.8) : 1; lctx.fillStyle = s.vari;
      lctx.fillRect(Math.round(x - kok/2), Math.round(y - kok/2), kok, kok); }
    lctx.globalAlpha = 1;
  }

  // kirjojen pyörre: spiraali sisään, kutistuu ja katoaa peilin keskelle
  if (pyorre > 0 && t < 9.5) { syntyAjastin -= dt; if (syntyAjastin <= 0) { syntyAjastin = .07 / Math.max(.3, pyorre); uusiKirja(); } }
  for (const k of kirjat){
    k.a += dt * (1.1 + 3.2 * (1 - k.r / Math.max(LW, LH))) * k.w;
    k.r -= dt * Math.max(LW, LH) * (.10 + .22 * pyorre) * (k.r < p.ry ? 2 : 1);
    k.rot += k.vr * dt;
    if (k.r <= p.ry * .12) { k.pois = true; imettyja++; if (imettyja % 3 === 0) vaareet.push({ ika: 0 }); continue; }
    const sk2 = Math.min(1, k.r / (p.ry * 1.2));
    piirraKirja(k, p.cx + Math.cos(k.a) * k.r * 1.25, p.cy + Math.sin(k.a) * k.r * .8, sk2);
  }
  kirjat = kirjat.filter(k => !k.pois);

  // kehys: kultainen pikselisoikio
  lctx.save(); lctx.lineWidth = 3; lctx.strokeStyle = '#6a4a1c'; lctx.beginPath(); lctx.ellipse(p.cx, p.cy, p.rx*sk + 2, p.ry*sk + 2, 0, 0, Math.PI*2); lctx.stroke();
  lctx.lineWidth = 2; lctx.strokeStyle = '#d9a843'; lctx.beginPath(); lctx.ellipse(p.cx, p.cy, p.rx*sk + 1, p.ry*sk + 1, 0, 0, Math.PI*2); lctx.stroke();
  lctx.fillStyle = '#ffe08a'; for (let i=0;i<8;i++){ const a = i*Math.PI/4 + .2; lctx.fillRect(Math.round(p.cx + Math.cos(a)*(p.rx*sk + 2)) - 1, Math.round(p.cy + Math.sin(a)*(p.ry*sk + 2)) - 1, 2, 2); }
  lctx.restore();

  // ylös skaalaus terävänä
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lo, 0, 0, LW * PX * DPR, LH * PX * DPR);

  // valmis heijastus: oikea pikselihahmo vilkuttaa peilin sisällä (+ ajoittainen kaiku)
  if (valmis && sprite.complete) {
    const a = Math.min(1, (t - 7.8) / .8);
    const ruutu = Math.floor((t - 7.8) * 5), kehys = ruutu < VILKUTUKSIA * KEHYKSIA ? ruutu % KEHYKSIA : 0;
    const X = hl.x * PX * DPR, Y = hl.y * PX * DPR, Wd = hl.w * PX * DPR, Hd = hl.h * PX * DPR;
    ctx.save(); ctx.beginPath(); ctx.ellipse(p.cx * PX * DPR, p.cy * PX * DPR, p.rx * PX * DPR, p.ry * PX * DPR, 0, 0, Math.PI*2); ctx.clip();
    if (!kaiku && t > 10 && ruutu < VILKUTUKSIA * KEHYKSIA && Math.random() < dt * .5) kaiku = { ika: 0, kehys };   // kaikukin vain vilkutuksen ajan
    if (kaiku) {           // kaiku: haamukuva jää jälkeen ja liukuu sivuun, hahmo häiriintyy viipaleina
      kaiku.ika += dt; const k = kaiku.ika;
      ctx.globalAlpha = .45 * a * Math.max(0, 1 - k/1.2);
      ctx.drawImage(sprite, kaiku.kehys * KEHYS_W, 0, KEHYS_W, KEHYS_H, X + k * Wd * .25, Y, Wd, Hd);
      if (k > 1.2) kaiku = null;
    }
    ctx.globalAlpha = a;
    if (kaiku && kaiku.ika < .35) {
      for (let i=0;i<6;i++){ const sy = i/6, dx = (Math.random() - .5) * Wd * .08;
        ctx.drawImage(sprite, kehys * KEHYS_W, sy * KEHYS_H, KEHYS_W, KEHYS_H/6, X + dx, Y + sy * Hd, Wd, Hd/6); }
    } else ctx.drawImage(sprite, kehys * KEHYS_W, 0, KEHYS_W, KEHYS_H, X, Y, Wd, Hd);
    if (t < 8.6) { ctx.globalAlpha = Math.max(0, 1 - (t - 7.8)/.8) * .8; ctx.fillStyle = '#dff1ff';
      ctx.fillRect(p.cx*PX*DPR - p.rx*PX*DPR, p.cy*PX*DPR - p.ry*PX*DPR, p.rx*2*PX*DPR, p.ry*2*PX*DPR); }
    ctx.restore();
  }
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t, dt);
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaPeili = function(p){
  if (!(p && p.peili)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); alusta(); if (sprite.complete && !mosaiikkiData) teeMosaiikki();
  mittaaTeksti(); setTimeout(() => { mittaaTeksti(); sirpaleet = []; }, 450);   // teksti rakentuu viiveellä
  aktiivinen = true; cv.style.opacity = 1;
  alku = performance.now() + 600; edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
