// ============================================================================
// KONEELLISTA SOKERIA (3.10.2026, x:8490). Neil Lawrence: alustat ja tekoäly
// ovat kehittäneet fruktoosisiirapin kognitiivisen vastineen - tykkäykset,
// aina myötäilevät vastaukset, vaivaton sisältö.
//
// Käyttö esitys-data.js:ssä: `sokeri: true` pysähdykseen, jolla on
// kuvat/burger.png (kiintea, keskellä).
//
// Kulku: otsikon tumman laatikon alareunaan kertyy kultaista siirappia, josta
// venyy hitaita tahmeita pisaroita. Ne putoavat burgerin sämpylälle - siirappi
// kuorruttaa sämpylää pikseli pikseliltä ja valuu reunoilta. Joka osumasta
// ponnahtaa "koneellista sokeria": pikselisydän, peukku tai mielistelevä
// tekoälykupla ("Loistava kysymys!"), joka kaartaa burgerin viereen kasaan.
// Kasa kasvaa, kukaan ei sulje hanaa. Otsikon kirjaimissa välkkyy sokerikiteitä.
//
// Burgerin paikka luetaan Phaser-kuvasta joka kehys (kuten esitys-2d-murrokset.js),
// otsikon laatikko DOMista. Kasa + sämpylän kuorrutus kanvaasilla tekstin alla
// (z 4), otsikon siirappi ja kiteet tekstin päällä (z 6, vain laatikon
// alareunassa - kirjaimet jäävät näkyviin). Ei ääniä.
// ============================================================================
(function(){
'use strict';
const KUVA = 'kuvat/burger.png';
// burger.png 32x32: sämpylän yläreunan rivi sarakkeittain (mitattu), -1 = tyhjä
const YLA = [-1,-1,16,11,9,8,7,7,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,7,7,9,9,11,-1,-1];
const VALUMAT = { 5: 6, 8: 4, 12: 7, 17: 5, 21: 8, 25: 4, 28: 5 };  // sarake → valuman maksimipituus (soluja)
const LAUSEET = ['Loistava kysymys!', 'Olet aivan oikeassa', 'Mahtava idea!', 'Juuri näin!', 'Täysin samaa mieltä', 'Upea ajatus!', 'Hienoa työtä!', 'Erinomainen huomio!'];
const SIIRAPPI = '#f0a92a', SIIRAPPI_VAL = '#ffe08a', SIIRAPPI_TUM = '#c27a12';
const SYDAN = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
const PEUKKU = ['...X...', '..XX...', '..XX...', 'XXXXXXX', 'X.XXXXX', 'X.XXXXX', 'X.XXXX.', 'X.XXXX.'];

function teeKanvaasi(id, z){
  const c = document.createElement('canvas'); c.id = id;
  c.style.cssText = `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:${z};opacity:0;transition:opacity .6s ease;`;
  return c;
}
const cv = teeKanvaasi('sokeri', 4), fxc = teeKanvaasi('sokeri-fx', 6);
const ctx = cv.getContext('2d'), fx = fxc.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.append(cv, fxc));

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; for (const c of [cv, fxc]) { c.width = Math.round(W*DPR); c.height = Math.round(H*DPR); } }
addEventListener('resize', koko); koko();

const sstep = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u*u*(3 - 2*u); };
const rnd = (a, b) => a + Math.random()*(b - a);

let kaynnissa = false, raf = 0, t0 = 0, edT = 0, t = 0;
let tipat = [], putoavat = [], roiskeet = [], lentavat = [], kasa = [], kiteet = [], pinta = null;
let kuorrutus = 0, seurTippa = 0, seurKide = 0, lauseIx = 0;

function burger(){
  const sc = window.__paaKohtaus; if (!sc || !sc.kiinteatKuvat) return null;
  const k = sc.kiinteatKuvat.find(k => k.h && k.h.kuva === KUVA); if (!k || !k.img.visible || k.img.alpha < 0.02) return null;
  const cr = sc.game.canvas.getBoundingClientRect(), sk = cr.width / sc.scale.width, b = k.img.getBounds();
  const x = cr.left + b.x*sk, y = cr.top + b.y*sk, w = b.width*sk;
  return { x, y, w, c: w/32, alfa: k.img.alpha };
}
function otsikko(){
  const el = document.querySelector('#teksti .otsikko .hl') || document.querySelector('#teksti .otsikko');
  if (!el) return null; const r = el.getClientRects(); return r.length ? r[r.length - 1] : null;
}

// kasan pinta: lokerot burgerin molemmin puolin, arvo = pinnan y ruudulla
function alustaPinta(B){
  const n = 12, lev = B.c * 1.6, maa = B.y + 26.6*B.c;
  pinta = { lev, maa, katto: B.y + 13*B.c,
    vas: Array.from({length: n}, (_, i) => ({ x: B.x + 3*B.c - (i + 1)*lev, y: maa })),
    oik: Array.from({length: n}, (_, i) => ({ x: B.x + 29*B.c + i*lev, y: maa })) };
}

function uusiPala(x, y, B){
  const tyyppi = Math.random() < 0.38 ? 'kupla' : (Math.random() < 0.55 ? 'sydan' : 'peukku');
  const fs = Math.max(13, B.c * 1.05);
  let w, h, teksti = '';
  if (tyyppi === 'kupla') { teksti = LAUSEET[lauseIx++ % LAUSEET.length]; ctx.font = `600 ${fs}px system-ui, sans-serif`; w = ctx.measureText(teksti).width + fs*1.1; h = fs*1.9; }
  else { const p = B.c * 0.42; w = 7*p; h = (tyyppi === 'sydan' ? 6 : 8)*p; }
  // kohde: matalin kohta satunnaiselta puolelta, burgerin viereen painottuen
  const puoli = x < B.x + 16*B.c ? pinta.vas : pinta.oik;
  const leveys = Math.max(1, Math.ceil(w / pinta.lev));
  let paras = -1, pisteet = Infinity;
  for (let i = 0; i + leveys <= puoli.length; i++) {
    let yla = Infinity; for (let j = i; j < i + leveys; j++) yla = Math.min(yla, puoli[j].y);
    const s = -yla + i*B.c*0.55 + rnd(0, h*1.4);
    if (yla - h > pinta.katto && s < pisteet) { pisteet = s; paras = i; }
  }
  if (paras < 0) { for (let k = 0; k < 6; k++) roiskeet.push({ x, y, vx: rnd(-1, 1)*B.c*4, vy: -rnd(1, 3)*B.c*3, ika: 0, kesto: 0.6, kide: true }); return; }
  let yla = Infinity; for (let j = paras; j < paras + leveys; j++) yla = Math.min(yla, puoli[j].y);
  const vasX = puoli === pinta.vas ? Math.min(...puoli.slice(paras, paras + leveys).map(l => l.x)) : puoli[paras].x;
  const kx = vasX + (leveys*pinta.lev - w)/2 + w/2, ky = yla - h/2;
  for (let j = paras; j < paras + leveys; j++) puoli[j].y = yla - h*0.82;
  lentavat.push({ tyyppi, teksti, w, h, fs, x0: x, y0: y, x1: kx, y1: ky, ika: 0, kesto: 0.9, kulma: rnd(-0.12, 0.12) });
}

function pikselikuva(g, kartta, vari, x, y, p){
  g.fillStyle = vari;
  for (let r = 0; r < kartta.length; r++) for (let c = 0; c < kartta[r].length; c++) if (kartta[r][c] === 'X') g.fillRect(Math.round(x + c*p), Math.round(y + r*p), Math.ceil(p), Math.ceil(p));
}
function piirraPala(g, o, x, y, sk, kulma){
  g.save(); g.translate(x, y); g.rotate(kulma); g.scale(sk, sk);
  if (o.tyyppi === 'kupla') {
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.roundRect(-o.w/2 + 2, -o.h/2 + 3, o.w, o.h*0.8, o.h*0.3); g.fill();
    g.fillStyle = '#fbf6ec'; g.beginPath(); g.roundRect(-o.w/2, -o.h/2, o.w, o.h*0.8, o.h*0.3); g.fill();
    g.beginPath(); g.moveTo(-o.w*0.25, o.h*0.28); g.lineTo(-o.w*0.32, o.h*0.5); g.lineTo(-o.w*0.12, o.h*0.28); g.fill();
    g.fillStyle = '#3a2a1a'; g.font = `600 ${o.fs}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(o.teksti, 0, -o.h*0.1);
  } else {
    const kartta = o.tyyppi === 'sydan' ? SYDAN : PEUKKU, p = o.w / 7;
    pikselikuva(g, kartta, 'rgba(0,0,0,.3)', -o.w/2 + p*0.5, -o.h/2 + p*0.6, p);
    pikselikuva(g, kartta, o.tyyppi === 'sydan' ? '#e8245e' : '#3b82f6', -o.w/2, -o.h/2, p);
  }
  g.restore();
}

function piirraKuorrutus(B){
  const c = B.c, maara = Math.min(1, kuorrutus / 14);
  if (maara <= 0) return;
  const paksuus = 1 + Math.floor(maara * 2.2);
  for (let s = 3; s <= 29; s++) {
    if (YLA[s] < 0) continue;
    let pit = paksuus + (VALUMAT[s] ? Math.floor(VALUMAT[s] * sstep(0.25, 1, maara)) : 0);
    if (s === 3 || s === 29) pit = Math.min(pit, 2);
    for (let r = 0; r < pit; r++) {
      const rivi = YLA[s] + r; if (rivi > 22) break;
      ctx.fillStyle = r === 0 ? SIIRAPPI_VAL : (r === pit - 1 ? SIIRAPPI_TUM : SIIRAPPI);
      ctx.fillRect(Math.floor(B.x + s*c), Math.floor(B.y + rivi*c), Math.ceil(c), Math.ceil(c));
    }
  }
  // kiiltoviiva
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  for (let s = 10; s < 15; s++) ctx.fillRect(Math.floor(B.x + s*c), Math.floor(B.y + (YLA[s] + 0.15)*c), Math.ceil(c), Math.ceil(c*0.3));
}

function kehys(nyt){
  raf = requestAnimationFrame(kehys);
  const dt = Math.min(0.05, (nyt - edT) / 1000); edT = nyt; t = (nyt - t0) / 1000;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  fx.setTransform(DPR, 0, 0, DPR, 0, 0); fx.clearRect(0, 0, W, H);
  const B = burger(), O = otsikko();
  if (!B || !O) return;
  if (!pinta) alustaPinta(B);
  const reunaY = O.bottom, c = B.c;

  // otsikon siirappireuna (z 6, laatikon alareuna)
  const reunaPaksu = Math.max(4, c*0.38) * sstep(0, 1.2, t);
  fx.fillStyle = SIIRAPPI;
  fx.beginPath(); fx.moveTo(O.left + 4, reunaY - reunaPaksu*0.6);
  for (let x = O.left + 4; x <= O.right - 4; x += 6) fx.lineTo(x, reunaY + reunaPaksu*(0.35 + 0.25*Math.sin(x*0.07) + 0.15*Math.sin(x*0.19 + 1)));
  fx.lineTo(O.right - 4, reunaY - reunaPaksu*0.6); fx.closePath(); fx.fill();
  fx.fillStyle = SIIRAPPI_VAL; fx.fillRect(O.left + 8, reunaY - reunaPaksu*0.6, O.right - O.left - 16, Math.max(1.5, reunaPaksu*0.18));

  // uudet tipat sämpylän kohdalle
  const minX = Math.max(O.left + 12, B.x + 6*c), maxX = Math.min(O.right - 12, B.x + 26*c);
  if (t > 0.8 && t > seurTippa && tipat.length < 3 && maxX > minX) {
    tipat.push({ x: rnd(minX, maxX), pit: 0, max: rnd(1.4, 2.6)*c, kesto: rnd(1.4, 2.4), ika: 0 });
    seurTippa = t + rnd(0.9, 1.6);
  }
  for (let i = tipat.length - 1; i >= 0; i--) {
    const d = tipat[i]; d.ika += dt;
    const u = Math.min(1, d.ika / d.kesto), pit = d.max * (u < 1 ? u*u : 1), r = c*(0.25 + 0.3*u);
    fx.fillStyle = SIIRAPPI;
    fx.beginPath(); fx.moveTo(d.x - r*0.9, reunaY); fx.quadraticCurveTo(d.x - r*0.35, reunaY + pit*0.6, d.x - r*0.8, reunaY + pit);
    fx.arc(d.x, reunaY + pit, r*0.8, Math.PI, 0, true); fx.quadraticCurveTo(d.x + r*0.35, reunaY + pit*0.6, d.x + r*0.9, reunaY); fx.fill();
    fx.fillStyle = 'rgba(255,240,190,.7)'; fx.fillRect(d.x - r*0.35, reunaY + pit - r*0.4, r*0.25, r*0.25);
    if (u >= 1) { tipat.splice(i, 1); putoavat.push({ x: d.x, y: reunaY + pit, vy: 0, r: r*0.8 }); }
  }
  // putoavat pisarat → sämpylä
  for (let i = putoavat.length - 1; i >= 0; i--) {
    const p = putoavat[i]; p.vy += H*1.4*dt; p.y += p.vy*dt;
    const s = Math.max(3, Math.min(29, Math.floor((p.x - B.x)/c))), osuY = B.y + YLA[s]*c;
    fx.fillStyle = SIIRAPPI; fx.beginPath(); fx.ellipse(p.x, p.y, p.r*0.8, p.r*1.15, 0, 0, Math.PI*2); fx.fill();
    if (p.y >= osuY) {
      putoavat.splice(i, 1); kuorrutus++;
      for (let k = 0; k < 7; k++) roiskeet.push({ x: p.x, y: osuY, vx: rnd(-1, 1)*c*5, vy: -rnd(1, 2.5)*c*4, ika: 0, kesto: rnd(0.35, 0.6) });
      uusiPala(p.x, osuY - c, B);
    }
  }

  // sämpylän kuorrutus + kasa (z 4)
  ctx.globalAlpha = B.alfa;
  piirraKuorrutus(B);
  for (const o of kasa) piirraPala(ctx, o, o.x, o.y, 1, o.kulma);
  for (let i = lentavat.length - 1; i >= 0; i--) {
    const o = lentavat[i]; o.ika += dt;
    const u = Math.min(1, o.ika / o.kesto), e = 1 - Math.pow(1 - u, 2);
    const x = o.x0 + (o.x1 - o.x0)*e, y = o.y0 + (o.y1 - o.y0)*u - Math.sin(u*Math.PI)*c*5;
    const sk = u < 0.25 ? 0.3 + 0.7*(u/0.25)*1.15 : 1 + 0.15*Math.max(0, 1 - (u - 0.25)/0.3);
    piirraPala(ctx, o, x, y, sk, o.kulma * u + (1 - u)*0.6);
    if (u >= 1) { lentavat.splice(i, 1); kasa.push({ ...o, x: o.x1, y: o.y1 }); }
  }
  ctx.globalAlpha = 1;
  // roiskeet ja tuikkeet
  for (let i = roiskeet.length - 1; i >= 0; i--) {
    const q = roiskeet[i]; q.ika += dt; if (q.ika > q.kesto) { roiskeet.splice(i, 1); continue; }
    q.vy += H*1.2*dt; q.x += q.vx*dt; q.y += q.vy*dt;
    fx.globalAlpha = 1 - q.ika / q.kesto; fx.fillStyle = q.kide ? '#fffbe8' : SIIRAPPI;
    const k = c*0.32; fx.fillRect(q.x - k/2, q.y - k/2, k, k);
  }
  fx.globalAlpha = 1;

  // sokerikiteet välkkyvät otsikossa
  if (t > seurKide) { kiteet.push({ x: rnd(O.left + 10, O.right - 10), y: rnd(O.top + O.height*0.2, O.bottom - O.height*0.2), ika: 0 }); seurKide = t + rnd(0.15, 0.45); }
  for (let i = kiteet.length - 1; i >= 0; i--) {
    const k = kiteet[i]; k.ika += dt; if (k.ika > 0.7) { kiteet.splice(i, 1); continue; }
    const a = Math.sin(k.ika / 0.7 * Math.PI), s = c*0.55*a;
    fx.fillStyle = `rgba(255,252,235,${0.9*a})`;
    fx.fillRect(k.x - s, k.y - s*0.12, s*2, s*0.24); fx.fillRect(k.x - s*0.12, k.y - s, s*0.24, s*2);
  }
}

function kaynnista(){
  kaynnissa = true; t0 = edT = performance.now();
  tipat = []; putoavat = []; roiskeet = []; lentavat = []; kasa = []; kiteet = []; pinta = null;
  kuorrutus = 0; seurTippa = 0; seurKide = 0.4; lauseIx = Math.floor(Math.random()*LAUSEET.length);
  cv.style.opacity = 1; fxc.style.opacity = 1;
  cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
}
function pysayta(){
  kaynnissa = false; cv.style.opacity = 0; fxc.style.opacity = 0;
  setTimeout(() => { if (!kaynnissa) cancelAnimationFrame(raf); }, 650);
}

window.naytaSokeri = function(p){
  if (p && p.sokeri) { if (!kaynnissa) kaynnista(); }
  else if (kaynnissa) pysayta();
};
})();
