// ============================================================================
// SYÖTE OPPII SINUT (8.10.2026, x:5340 "Kuka sinä olet algoritmin silmissä?").
// Jarno: "miten kuvittaisimme, miten TikTok toimii? Animointi" -> hyväksytty
// ehdotus: oikealla puhelin, jossa syöte rullaa (yksi video = yksi kuvake),
// vieressä PROFIILI = algoritmin muistikirja sinusta.
//
// Käyttö esitys-data.js:ssä: `tiktok: true` tai `tiktok: { tagit: [...] }`.
// Jos pysähdyksellä on teksti-rivit (Jämsä: johdanto + mitä katsot / mitä
// ohitat / kuka olet / mitä copy pastaat), vaihe i alkaa kun rivi i+1 tulee
// näkyviin (rivin 0 = johdanto). Ilman rivejä vaiheet etenevät ajastimella.
//
// Vaiheet:
//  0. katsot:   kissavideo pysähtyy, palkki täyttyy, sydän, 🐱 lentää profiiliin
//  1. ohitat:   jalkapallo pyyhkäistään heti pois, ⚽ profiiliin yliviivattuna
//  2. kuka olet: profiiliin ilmestyy tunnisteita (tagit)
//  3. copy:     kopioitu tekstinpätkä lentää profiiliin
//  4. loppu:    syöte on lähes pelkkää kissaa - algoritmi oppi
// Ei ihmishahmoja (ks. muistio: hahmot GLB:stä, ei koodista).
// ============================================================================
(function(){
'use strict';
const POOLI = ['⚽','🎮','💄','🚗','🍕','🎵','🏀','🐶','📚','😂'];
const VARIT = ['#3b2f5c','#1f4a5c','#5c2f45','#2f5c3b','#5c4a2f','#2f3b5c'];
const AJASTIN = [1.2, 4.6, 7.4, 10.4, 13.6];   // s, vaiheiden alku ilman rivejä

const cv = document.createElement('canvas'), fxc = document.createElement('canvas');
cv.id = 'tiktok-maailma'; fxc.id = 'tiktok-fx';
for (const [c, z] of [[cv, 4], [fxc, 6]]) {
  c.style.cssText = `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:${z};opacity:0;transition:opacity .5s ease;`;
}
const ctx = cv.getContext('2d'), fx = fxc.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.append(cv, fxc));

let W = 0, H = 0, DPR = 1;
let puh, prof;                 // puhelimen ja profiilin laatikot (px)
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  for (const c of [cv, fxc]) { c.width = Math.round(W*DPR); c.height = Math.round(H*DPR); }
  const ph = H*.56, pw = ph*.5;
  const px = Math.min(W*.70, W - pw - H*.46) - pw/2;
  puh = { x: px, y: H*.2, w: pw, h: ph, r: pw*.12 };
  const ruutu = pw*.07;
  puh.s = { x: puh.x + ruutu, y: puh.y + ruutu*1.6, w: pw - 2*ruutu, h: ph - ruutu*3.2 };
  prof = { x: puh.x + pw + H*.05, y: puh.y + ph*.06, w: H*.36, h: ph*.88 };
}
addEventListener('resize', koko); koko();

let aktiivinen = false, rafId = 0, nyt = 0, edellinen = 0, alku = 0, tagit = [];
let tila;

function uusiKortti(ikoni){
  return { ikoni: ikoni || POOLI[Math.floor(Math.random()*POOLI.length)], vari: VARIT[Math.floor(Math.random()*VARIT.length)], edist: 0 };
}

function alusta(){
  tila = {
    kortti: uusiKortti('🎮'), seuraava: null, siirto: 0, siirtyy: false,
    korttiAlku: 0, kortinKesto: 1.3, vaihe: -1, vaiheAlku: 0, vaiheetAlkaneet: [false,false,false,false,false],
    lukittu: false, sydan: -9,
    profiili: [],            // { ikoni, teksti, maara, yli, t }
    lentajat: [],            // { teksti, x0,y0,x1,y1,t0,kesto, kohde:fn }
    kissaTila: false, ekaRivi: -1, valmis: [false,false,false,false,false],
  };
}

// ---------- profiili ----------
function profiiliRivi(avain){ return tila.profiili.find(r => r.avain === avain); }
function lisaaProfiiliin(avain, ikoni, teksti, opts){
  let r = profiiliRivi(avain);
  if (!r) { r = { avain, ikoni, teksti, maara: 0, yli: false, t: nyt }; tila.profiili.push(r); }
  if (opts && opts.yli) r.yli = true;
  if (opts && opts.maara) r.maara = Math.min(5, r.maara + opts.maara);
  r.pomppu = nyt;
}
function profiiliRivinY(i){ return prof.y + prof.h*.19 + i * prof.h*.11; }   // 7 riviä mahtuu (pizza lisätty 8.10.2026)

function lenna(teksti, x0, y0, avainRivi, kun){
  const i = tila.profiili.length;   // arvio kohderivistä (uusi rivi tulee loppuun)
  const olemassa = tila.profiili.findIndex(r => r.avain === avainRivi);
  const ri = olemassa >= 0 ? olemassa : i;
  tila.lentajat.push({ teksti, x0, y0, x1: prof.x + prof.h*.06 + H*.025, y1: profiiliRivinY(ri), t0: nyt, kesto: .8, kun });
}

// ---------- syöte ----------
function swaippaa(seuraavaIkoni, nopea){
  if (tila.siirtyy) { tila.jono = { ikoni: seuraavaIkoni, nopea }; return; }   // toteutetaan kun edellinen siirto on valmis
  tila.seuraava = uusiKortti(seuraavaIkoni);
  tila.siirtyy = true; tila.siirto = 0; tila.siirtoAlku = nyt; tila.siirtoNopeus = nopea ? 5 : 3;
}

function aloitaVaihe(i){
  tila.vaihe = i; tila.vaiheAlku = nyt; tila.vaiheetAlkaneet[i] = true;
  const kx = puh.s.x + puh.s.w/2, ky = puh.s.y + puh.s.h*.42;
  if (i === 0) {            // katsot
    tila.lukittu = true; swaippaa('🐱');
    tila.katsoKissa = true;
  } else if (i === 1) {     // ohitat
    tila.lukittu = true; tila.katsoKissa = false; swaippaa('⚽');
    tila.ohita = true; tila.ohitaAlku = 0;
  } else if (i === 2) {     // kuka olet + pizza pysähtyy (Jarno 8.10.2026: "pizza myös hauska")
    tila.lukittu = true; swaippaa('🍕'); tila.pizzaLennetty = false;
    tagit.forEach((t, k) => setTimeout(() => { if (aktiivinen) lisaaProfiiliin('tag'+k, '🏷️', t); }, 350 + k*650));
  } else if (i === 3) {     // copy
    tila.kopio = { t0: nyt };
    setTimeout(() => {
      if (!aktiivinen) return;
      lenna('📋', kx, puh.s.y + puh.s.h*.78, 'copy', () => { lisaaProfiiliin('copy', '📋', '"kissan ruokinta-ohje"'); tila.valmis[3] = true; });
    }, 900);
  } else if (i === 4) {     // loppu: kissasyöte
    tila.kissaTila = true; tila.lukittu = false;
    lisaaProfiiliin('kissa', '🐱', 'tykkää kissoista', { maara: 2 });
  }
}

function paivita(dt){
  // vaiheiden käynnistys
  const rivit = document.querySelectorAll('#teksti .leipa-rivi');
  if (rivit.length >= 5) {
    for (let i = 0; i < 4; i++) {
      if (tila.vaiheetAlkaneet[i] || !rivit[i+1].classList.contains('nakyy')) continue;
      if (i > 0 && (!tila.vaiheetAlkaneet[i-1] || !tila.valmis[i-1] || nyt - tila.vaiheAlku < 2.2)) continue;   // edellinen vaihe ensin loppuun
      aloitaVaihe(i);
    }
    if (tila.valmis[3] && !tila.vaiheetAlkaneet[4] && nyt - tila.vaiheAlku > 3.2) aloitaVaihe(4);
  } else {
    for (let i = 0; i < 5; i++) if (!tila.vaiheetAlkaneet[i] && nyt - alku >= AJASTIN[i] && (i === 0 || (tila.valmis[i-1] && nyt - tila.vaiheAlku > 1.5))) aloitaVaihe(i);
  }

  // syötteen kulku
  if (tila.siirtyy) {
    tila.siirto = (nyt - tila.siirtoAlku) * tila.siirtoNopeus;
    if (tila.siirto >= 1) {
      tila.kortti = tila.seuraava; tila.seuraava = null; tila.siirtyy = false; tila.siirto = 0; tila.korttiAlku = nyt;
      if (tila.jono) { const j = tila.jono; tila.jono = null; swaippaa(j.ikoni, j.nopea); }
    }
  } else {
    const k = tila.kortti;
    if (tila.vaihe === 0 && tila.katsoKissa && k.ikoni === '🐱') {
      k.edist = Math.min(1, (nyt - tila.korttiAlku)/1.6);   // seinäkelloon sidottu: hidaskaan ruudunpäivitys ei venytä
      if (k.edist >= 1 && !tila.kissaLennetty) {
        tila.kissaLennetty = true; tila.sydan = nyt;
        lenna('🐱', puh.s.x + puh.s.w/2, puh.s.y + puh.s.h*.42, 'kissa', () => { lisaaProfiiliin('kissa', '🐱', 'tykkää kissoista', { maara: 1 }); tila.valmis[0] = true; });
      }
    } else if (tila.vaihe === 2 && k.ikoni === '🍕') {
      k.edist = Math.min(1, (nyt - tila.korttiAlku)/1.2);
      if (k.edist >= 1 && !tila.pizzaLennetty) {
        tila.pizzaLennetty = true; tila.sydan = nyt;
        lenna('🍕', puh.s.x + puh.s.w/2, puh.s.y + puh.s.h*.42, 'pizza', () => { lisaaProfiiliin('pizza', '🍕', 'tykkää pizzasta', { maara: 1 }); tila.valmis[2] = true; });
        setTimeout(() => { if (aktiivinen && tila.vaihe === 2) tila.lukittu = false; }, 900);
      }
    } else if (tila.vaihe === 1 && k.ikoni === '⚽') {
      k.edist = Math.min(.12, (nyt - tila.korttiAlku)/4);
      if (tila.ohita && !tila.ohitaAlku) tila.ohitaAlku = nyt;
      if (tila.ohita && nyt - tila.ohitaAlku >= .6) {
        tila.ohita = 0;
        lenna('⚽', puh.s.x + puh.s.w/2, puh.s.y + puh.s.h*.2, 'pallo', () => { lisaaProfiiliin('pallo', '⚽', 'jalkapallo', { yli: true }); tila.valmis[1] = true; });
        tila.lukittu = false; swaippaa(null, true);
      }
    } else if (!tila.lukittu) {
      k.edist = Math.min(1, (nyt - tila.korttiAlku)/tila.kortinKesto);
      if (nyt - tila.korttiAlku > tila.kortinKesto) {
        const kissa = tila.kissaTila ? Math.random() < .9 : Math.random() < .15;
        swaippaa(kissa ? '🐱' : null);
      }
    }
  }

  // lentäjät
  tila.lentajat = tila.lentajat.filter(l => {
    if (nyt - l.t0 >= l.kesto) { if (l.kun) l.kun(); return false; }
    return true;
  });
}

// ---------- piirto ----------
function pyorea(g, x, y, w, h, r){
  g.beginPath(); g.moveTo(x+r, y); g.arcTo(x+w, y, x+w, y+h, r); g.arcTo(x+w, y+h, x, y+h, r);
  g.arcTo(x, y+h, x, y, r); g.arcTo(x, y, x+w, y, r); g.closePath();
}
function emoji(g, e, x, y, koko){
  g.font = `${Math.round(koko)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, x, y);
}
function piirraKortti(k, oy){
  const s = puh.s;
  ctx.save(); ctx.beginPath(); ctx.rect(s.x, s.y, s.w, s.h); ctx.clip();
  const gr = ctx.createLinearGradient(0, s.y + oy, 0, s.y + oy + s.h);
  gr.addColorStop(0, k.vari); gr.addColorStop(1, '#101218');
  ctx.fillStyle = gr; ctx.fillRect(s.x, s.y + oy, s.w, s.h);
  emoji(ctx, k.ikoni, s.x + s.w/2, s.y + oy + s.h*.42, s.w*.42);
  // oikean reunan ikonit
  ctx.globalAlpha = .75;
  for (let i = 0; i < 3; i++) { ctx.fillStyle = '#e8eaf0'; ctx.beginPath(); ctx.arc(s.x + s.w*.88, s.y + oy + s.h*(.55 + i*.1), s.w*.035, 0, Math.PI*2); ctx.fill(); }
  ctx.globalAlpha = 1;
  // edistymispalkki
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(s.x, s.y + oy + s.h - 4, s.w, 3);
  ctx.fillStyle = '#ff3b5c'; ctx.fillRect(s.x, s.y + oy + s.h - 4, s.w * k.edist, 3);
  ctx.restore();
}
function piirra(){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  // puhelin
  ctx.fillStyle = '#0c0d12'; pyorea(ctx, puh.x, puh.y, puh.w, puh.h, puh.r); ctx.fill();
  ctx.strokeStyle = '#3a3f4c'; ctx.lineWidth = 2; ctx.stroke();
  const s = puh.s;
  if (tila.siirtyy) {
    const e = tila.siirto, ee = 1 - Math.pow(1 - e, 3);
    piirraKortti(tila.kortti, -s.h*ee); piirraKortti(tila.seuraava, s.h*(1 - ee));
  } else piirraKortti(tila.kortti, 0);
  // sydän
  const sd = nyt - tila.sydan;
  if (sd < 1) { ctx.globalAlpha = 1 - sd; emoji(ctx, '❤️', s.x + s.w/2, s.y + s.h*.42 - sd*s.h*.15, s.w*(.2 + .15*Math.sin(Math.min(1, sd*3)*Math.PI))); ctx.globalAlpha = 1; }
  // kopioitava tekstinpätkä
  if (tila.kopio) {
    const e = nyt - tila.kopio.t0;
    if (e < 1.6) {
      const a = Math.min(1, e*4) * (e > 1.2 ? 1 - (e - 1.2)/.4 : 1);
      ctx.globalAlpha = a; ctx.fillStyle = e > .5 ? '#3d7bd9' : 'rgba(255,255,255,.15)';
      ctx.fillRect(s.x + s.w*.08, s.y + s.h*.74, s.w*.84, s.h*.08);
      ctx.fillStyle = '#fff'; ctx.font = `${Math.round(s.w*.06)}px Georgia,Garamond,"Times New Roman",serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(e > .5 ? 'Kopioitu' : 'kissan ruokinta-ohje', s.x + s.w/2, s.y + s.h*.78);
      ctx.globalAlpha = 1;
    }
  }
  // profiili
  ctx.fillStyle = 'rgba(16,18,26,.82)'; pyorea(ctx, prof.x, prof.y, prof.w, prof.h, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(255,209,102,.6)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#ffd166'; ctx.font = `700 ${Math.round(H*.026)}px Georgia,Garamond,"Times New Roman",serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('PROFIILI', prof.x + H*.025, prof.y + prof.h*.08);
  tila.profiili.forEach((r, i) => {
    const y = profiiliRivinY(i), x = prof.x + H*.025, a = Math.min(1, (nyt - r.t)*4);
    const pomppu = r.pomppu ? Math.max(0, 1 - (nyt - r.pomppu)*3) : 0;
    ctx.globalAlpha = a;
    emoji(ctx, r.ikoni, x + H*.02, y, H*.034*(1 + pomppu*.3));
    ctx.fillStyle = r.yli ? '#8b8fa3' : '#eef0f6'; ctx.font = `${Math.round(H*.024)}px Georgia,Garamond,"Times New Roman",serif`; ctx.textAlign = 'left';
    const tx = x + H*.05; ctx.fillText(r.teksti, tx, y);
    if (r.yli) { const w = ctx.measureText(r.teksti).width; ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx + w, y); ctx.stroke(); }
    if (r.maara) { ctx.fillStyle = '#ff3b5c'; for (let k = 0; k < r.maara; k++) ctx.fillRect(prof.x + prof.w - H*.025 - (k+1)*H*.016, y - H*.008, H*.012, H*.016); }
    ctx.globalAlpha = 1;
  });

  // lentäjät tekstin päällä
  fx.setTransform(DPR,0,0,DPR,0,0); fx.clearRect(0,0,W,H);
  for (const l of tila.lentajat) {
    const e = Math.min(1, (nyt - l.t0)/l.kesto), ee = e < .5 ? 2*e*e : 1 - Math.pow(-2*e + 2, 2)/2;
    const x = l.x0 + (l.x1 - l.x0)*ee, y = l.y0 + (l.y1 - l.y0)*ee - Math.sin(Math.PI*e)*H*.1;
    fx.shadowColor = 'rgba(0,0,0,.5)'; fx.shadowBlur = 8;
    emoji(fx, l.teksti, x, y, H*(.07 - .035*ee));
    fx.shadowBlur = 0;
  }
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms/1000, dt = Math.min(.05, t - edellinen || 0); edellinen = t; nyt = t;
  paivita(dt); piirra();
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaTiktok = function(p){
  const paalle = !!(p && p.tiktok);
  if (!paalle) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId);
    cv.style.opacity = 0; fxc.style.opacity = 0;
    return;
  }
  tagit = (typeof p.tiktok === 'object' && Array.isArray(p.tiktok.tagit)) ? p.tiktok.tagit : ['~13 v', 'iltaisin', 'Suomi'];
  koko(); nyt = performance.now()/1000; alku = nyt; alusta(); tila.korttiAlku = nyt;
  aktiivinen = true; edellinen = 0;
  cv.style.opacity = 1; fxc.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
