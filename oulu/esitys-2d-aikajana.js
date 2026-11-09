// ============================================================================
// AIKAJANA: DA VINCI -> 1956 (4.11.2026, x:2790 "Artificial Intelligence").
// Jarno: "Da vinci voi olla pysyvä taustassa ... sen rinnalle robottiritari tai
// mallinnus, ja muut ilmestyy kun on sivulla" + haarniska-GLB läpivalaisulla.
//
// Käyttö esitys-data.js:ssä: `aikajana: true`. Da Vinci on kiintea-kuva
// (kuvat/davinci-glb.png, hahmot.js). Tämä moduuli piirtää tekstin alle (z 4):
//  - ritarin (kuvat/ritari-glb.png): hetken päästä haarniska muuttuu
//    läpikuultavaksi ja sisältä paljastuu da Vincin messinkimekanismi
//    (väkipyörät, vaijerit, hammasratas, jouset) - käsivarret nousevat
//  - rivien tahdissa pienet kuvat alaoikealle: 1837 Babbagen rattaat +
//    reikäkortti, 1950 Turingin kaukokirjoitin näppäilee "Voivatko koneet
//    ajatella?", 1956 liitutaululle kirjoittuu ARTIFICIAL INTELLIGENCE
//  - alareunan aikajanan 1495 · 1837 · 1950 · 1956, valopiste liukuu
// Mallit: da Vinci Rivvor Arts, ritari by__Rx (Sketchfab, CC-BY-4.0), seepiaksi
// paistettu test-glb-render.html:llä. Tekstirivien viive 2200 ms -> RIVIT alla.
// ============================================================================
(function(){
'use strict';
const RIVIT = [.3, 2.5, 4.7, 6.9];                  // s: milloin kukin tekstirivi tulee esiin
const RITARI = new Image(); RITARI.src = 'kuvat/ritari-glb.png';
const MESSINKI = '#d4a94e', MESSINKI_T = '#8a6a2a', MESSINKI_V = '#f4dc98';
const FONTTI = 'Georgia,Garamond,"Times New Roman",serif';

const cv = document.createElement('canvas');
cv.id = 'aikajana';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1, aktiivinen = false, rafId = 0, t0 = 0;
function koko(){ DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

const liuku = (t, a, b) => { const u = Math.min(1, Math.max(0, (t - a) / (b - a))); return u*u*(3 - 2*u); };

function ratas(x, y, r, hampaat, kulma, vari, reika = true){
  ctx.save(); ctx.translate(x, y); ctx.rotate(kulma);
  ctx.fillStyle = vari; ctx.beginPath();
  for (let i = 0; i < hampaat * 2; i++) {
    const a = i / (hampaat * 2) * Math.PI * 2, rr = i % 2 ? r : r * 1.22;
    const a2 = a + Math.PI / hampaat;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); ctx.lineTo(Math.cos(a2) * rr, Math.sin(a2) * rr);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,25,5,.6)'; ctx.lineWidth = Math.max(1, r*.06); ctx.stroke();
  if (reika) { ctx.fillStyle = 'rgba(30,20,10,.85)'; ctx.beginPath(); ctx.arc(0, 0, r*.28, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = MESSINKI_V; ctx.lineWidth = Math.max(1, r*.05); ctx.beginPath(); ctx.arc(0, 0, r*.62, -2.4, -1.2); ctx.stroke(); }
  ctx.restore();
}
function vaikipyora(x, y, r, kulma){
  ctx.save(); ctx.translate(x, y); ctx.rotate(kulma);
  const g = ctx.createRadialGradient(-r*.3, -r*.3, r*.1, 0, 0, r);
  g.addColorStop(0, MESSINKI_V); g.addColorStop(1, MESSINKI_T);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(40,25,5,.7)'; ctx.lineWidth = Math.max(1, r*.12); ctx.beginPath(); ctx.arc(0, 0, r*.7, 0, Math.PI*2); ctx.stroke();
  ctx.fillStyle = '#3a2a10'; ctx.fillRect(-r*.08, -r*.85, r*.16, r*.5);   // pyörimisen merkki
  ctx.restore();
}
function vaijeri(pts, w){ ctx.strokeStyle = 'rgba(225,215,190,.85)'; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
function jousi(x, y, w, h){ ctx.strokeStyle = MESSINKI; ctx.lineWidth = Math.max(1, w*.18); ctx.beginPath();
  for (let i = 0; i <= 12; i++) { const yy = y - h/2 + h * i/12; ctx.lineTo(x + (i % 2 ? w/2 : -w/2), yy); } ctx.stroke(); }

// ---------------- da Vinci (4.11.2026, Jarno: "ei leijumista, vaan että kääntyy kohti robottia") ----------------
// kuvat/davinci-kaanto.png: 16 kehystä (423x632) samasta GLB:stä paistettuna, kamera 90° -> 10°
// (peilattu): katsoo ensin yleisöön, kääntyy sivuprofiiliin ritaria kohti läpivalaisun alkaessa.
// Yhteinen rajaus kaikille kehyksille -> jalat pysyvät paikallaan.
const DAVINCI = new Image(); DAVINCI.src = 'kuvat/davinci-kaanto.png';
const DV_N = 16, DV_W = 423, DV_H = 632;
function piirraDaVinci(t){
  if (!DAVINCI.complete || !DAVINCI.naturalWidth) return;
  const h = H * .6, w = h * DV_W / DV_H;
  const f = Math.round((DV_N - 1) * liuku(t, 1.3, 3.0));
  ctx.drawImage(DAVINCI, f * DV_W, 0, DV_W, DV_H, W * .14 - w/2, H * .93 - h, w, h);
}

// ---------------- Ada Lovelace siirtyy edelliseltä sivulta (4.11.2026, Jarno: "ada voisi siirtyä pienenä
// seuraavalle sivulle, kohtaan 1837") ----------------
// Alkaa samasta paikasta ja koosta kuin x:2640:n kiintea-kuva (kohdistusX .63, pohja .93, korkeus .55 H),
// pienenee ja liukuu aikajanan 1837-pisteen yläpuolelle; hehkuu, kun 1837-rivi tulee esiin.
const ADA = new Image(); ADA.src = 'kuvat/ada-glb.png';
function piirraAda(t){
  if (!ADA.complete || !ADA.naturalWidth) return;
  const u = liuku(t, .2, 1.7);
  const h = H * (.55 + (.14 - .55) * u), w = h * ADA.naturalWidth / ADA.naturalHeight;
  const cx = W * (.63 + (.64 - .63) * u), pohja = H * (.93 + (.915 - .93) * u);
  const hehkuu = liuku(t, RIVIT[1], RIVIT[1] + .5) * (1 - liuku(t, RIVIT[1] + 1.2, RIVIT[1] + 2.4));
  if (hehkuu > 0) {
    const g = ctx.createRadialGradient(cx, pohja - h*.5, 0, cx, pohja - h*.5, h*.9);
    g.addColorStop(0, `rgba(176,203,64,${.45*hehkuu})`); g.addColorStop(1, 'rgba(176,203,64,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - h, pohja - h*1.4, h*2, h*1.8);
  }
  ctx.drawImage(ADA, cx - w/2, pohja - h, w, h);
}

// ---------------- ritari + mekanismi (koordinaatit ritarikuvan osuuksina) ----------------
function piirraRitari(t){
  if (!RITARI.complete || !RITARI.naturalWidth) return;
  const h = H * .62, w = h * RITARI.naturalWidth / RITARI.naturalHeight;
  const x = W * .34 - w/2, y = H * .93 - h;
  const lapi = liuku(t, 1.6, 3.4);                    // haarniska haalistuu, mekanismi esiin
  ctx.globalAlpha = 1 - .45 * lapi; ctx.drawImage(RITARI, x, y, w, h); ctx.globalAlpha = 1;   // 4.11.2026 (Jarno): haarniska vähemmän läpinäkyvä (oli .72)
  if (lapi <= 0) return;
  const P = (u, v) => [x + w * u, y + h * v], s = h / 100;
  ctx.save(); ctx.globalAlpha = lapi;
  // hehku rintakehän takana (röntgenvaikutelma)
  const gl = ctx.createRadialGradient(...P(.5, .32), 0, ...P(.5, .32), h*.28);
  gl.addColorStop(0, 'rgba(255,210,120,.28)'); gl.addColorStop(1, 'rgba(255,210,120,0)');
  ctx.fillStyle = gl; ctx.fillRect(x, y, w, h*.7);
  const kulma = t * 1.3, nosto = Math.sin(t * 1.3) * .03;   // kädet nousevat ja laskevat rattaan tahdissa
  // 4.11.2026 korjaus (Jarno: "robotin osat menevät pieleen"): kohdat mitattu ritari-glb.png:n
  // siluetista - olkalinja v .2-.3, kyynärpäät (.11/.85, .4), kädet (.06/.93, .53), vartalo u .3-.68, jalkojen väli u ~.55
  const CU = .48;
  ctx.strokeStyle = MESSINKI; ctx.lineWidth = s * .9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(...P(CU - .1, .2)); ctx.lineTo(...P(CU + .1, .2)); ctx.stroke();   // ylätanko olkalinjassa
  const rat = P(CU, .37);
  vaijeri([P(CU - .06, .2), P(CU + .03, .29), rat], s*.35); vaijeri([P(CU + .06, .2), P(CU - .03, .29), rat], s*.35);
  const PUOLET = [
    { o1: [CU - .14, .25], o2: [CU - .3, .27], kyy: [.11, .4], kasi: [.06, .53], sx: -1 },
    { o1: [CU + .14, .25], o2: [CU + .3, .27], kyy: [.85, .4], kasi: [.93, .53], sx: 1 },
  ];
  for (const q of PUOLET) {
    const o1 = P(...q.o1), o2 = P(...q.o2), kyy = P(q.kyy[0], q.kyy[1] - nosto), kasi = P(q.kasi[0], q.kasi[1] - nosto*2.2);
    vaijeri([rat, o1, o2, kyy, kasi], s*.35);
    vaikipyora(...o1, s*1.5, kulma * q.sx); vaikipyora(...o2, s*1.8, -kulma * q.sx); vaikipyora(...kyy, s*1.3, kulma);
    ctx.fillStyle = MESSINKI; ctx.beginPath(); ctx.arc(...kasi, s*.9, 0, Math.PI*2); ctx.fill();
  }
  // runkokehikko vartalon sisällä: kolme akselia, jouset, keskiratas, alaratas
  ctx.strokeStyle = MESSINKI_T; ctx.lineWidth = s*.8;
  for (const v of [.43, .49, .55]) { ctx.beginPath(); ctx.moveTo(...P(CU - .1, v)); ctx.lineTo(...P(CU + .1, v)); ctx.stroke(); }
  for (const u of [CU - .1, CU + .1]) { ctx.beginPath(); ctx.moveTo(...P(u, .41)); ctx.lineTo(...P(u, .57)); ctx.stroke(); }
  jousi(...P(CU - .07, .46), s*1.6, s*4); jousi(...P(CU + .07, .46), s*1.6, s*4);
  ratas(...rat, s*3.2, 14, kulma, MESSINKI);
  ratas(...P(CU, .57), s*2.2, 10, -kulma * 1.4, MESSINKI_T);
  ctx.fillStyle = MESSINKI; ctx.beginPath(); ctx.ellipse(...P(CU, .49), s*1.6, s*1, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = MESSINKI_T; ctx.lineWidth = s*.7; ctx.beginPath(); ctx.moveTo(...P(CU, .59)); ctx.lineTo(...P(.55, .72)); ctx.lineTo(...P(.55, .98)); ctx.stroke();  // tanko jalkojen välistä maahan
  ctx.restore();
}

// ---------------- pienet kuvat rivien tahdissa ----------------
function kehys(x, y, w, h, a){ ctx.fillStyle = `rgba(20,18,26,${.55*a})`; ctx.beginPath(); ctx.roundRect(x, y, w, h, h*.08); ctx.fill(); }

function babbage(t, x, y, w, h, a){
  kehys(x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
  const r = h * .085;
  for (let k = 0; k < 3; k++) {                       // rataspinot pyörivät eri tahdissa
    const cx = x + w * (.3 + k * .2), kr = k % 2 ? -1 : 1;
    for (let j = 0; j < 3; j++) ratas(cx, y + h * (.2 + j * .24), r * (1 - j*.06), 12, kr * t * (.8 + k*.3) + j*.3, j % 2 ? MESSINKI_T : MESSINKI, true);
  }
  const kx = x + w * (.02 + .08 * ((t * .25) % 1)), ky = y + h * .8;   // reikäkortti liukuu sisään
  ctx.fillStyle = '#e9dcbc'; ctx.fillRect(kx, ky, w*.42, h*.12);
  ctx.fillStyle = '#3a2a10';
  for (let i = 0; i < 9; i++) for (let j = 0; j < 2; j++) if ((i*3 + j*5) % 4) ctx.fillRect(kx + w*(.03 + i*.042), ky + h*(.025 + j*.05), w*.016, h*.03);
  ctx.restore();
}
const TURING = 'Voivatko koneet ajatella?';
function turing(t, x, y, w, h, a){
  kehys(x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = '#3b3f48'; ctx.beginPath(); ctx.roundRect(x + w*.08, y + h*.5, w*.84, h*.38, h*.05); ctx.fill();   // kaukokirjoitin
  ctx.fillStyle = '#23262d';
  for (let i = 0; i < 10; i++) for (let j = 0; j < 2; j++) ctx.fillRect(x + w*(.14 + i*.072), y + h*(.62 + j*.1), w*.05, h*.06);
  const n = Math.min(TURING.length, Math.floor(t * 9)), naky = TURING.slice(0, n);
  ctx.fillStyle = '#f2ead6'; ctx.fillRect(x + w*.12, y + h*.06, w*.76, h*.42);   // paperiarkki nousee koneesta
  ctx.fillStyle = '#1b1b1f'; ctx.font = `${h*.12}px "Courier New",monospace`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const [r1, r2] = ['Voivatko koneet', 'ajatella?'];
  const kursori = Math.floor(t*3) % 2 ? '_' : '';
  ctx.fillText(naky.slice(0, r1.length) + (n <= r1.length ? kursori : ''), x + w*.16, y + h*.17);
  if (n > r1.length + 1) ctx.fillText(naky.slice(r1.length + 1) + kursori, x + w*.16, y + h*.35);
  ctx.restore();
}
const TAULU = 'ARTIFICIAL INTELLIGENCE';
function mccarthy(t, x, y, w, h, a){
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x, y, w, h);                     // puukehys
  ctx.fillStyle = '#25392f'; ctx.fillRect(x + w*.04, y + h*.07, w*.92, h*.86); // taulu
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(x + w*.1, y + h*.2, w*.5, h*.1);
  const fk = h * .2; ctx.font = `700 ${fk}px ${FONTTI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const n = Math.min(TAULU.length, Math.floor(t * 8)), s = TAULU.slice(0, n);
  const hehkuu = n >= TAULU.length ? liuku(t, TAULU.length/8, TAULU.length/8 + .6) * (1 - liuku(t, TAULU.length/8 + 1.6, TAULU.length/8 + 3)) : 0;
  ctx.shadowColor = 'rgba(255,240,180,.9)'; ctx.shadowBlur = fk * 1.2 * hehkuu;
  ctx.fillStyle = `rgba(240,240,230,${.85 + .15*hehkuu})`;
  const [r1, r2] = ['ARTIFICIAL', 'INTELLIGENCE'];
  ctx.fillText(s.slice(0, r1.length), x + w/2, y + h*.36);
  if (s.length > r1.length + 1) ctx.fillText(s.slice(r1.length + 1), x + w/2, y + h*.64);
  ctx.restore();
}

function aikajana(t){
  const y = H * .965, x0 = W * .2, x1 = W * .93;
  const pisteet = [[W*.25, '1495'], [W*.64, '1837'], [W*.77, '1950'], [W*.9, '1956']];
  ctx.strokeStyle = 'rgba(240,230,200,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  let mx = pisteet[0][0];
  for (let i = 1; i < 4; i++) mx += (pisteet[i][0] - pisteet[i-1][0]) * liuku(t, RIVIT[i] - .2, RIVIT[i] + .9);
  ctx.font = `600 ${H*.022}px ${FONTTI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  pisteet.forEach(([px, v], i) => {
    const on = t >= RIVIT[i];
    ctx.fillStyle = on ? (i === 3 ? '#FF5562' : '#f2c94c') : 'rgba(240,230,200,.35)';
    ctx.beginPath(); ctx.arc(px, y, on ? 5 : 3.5, 0, Math.PI*2); ctx.fill();
    ctx.fillText(v, px, y - 8);
  });
  const g = ctx.createRadialGradient(mx, y, 0, mx, y, 22); g.addColorStop(0, 'rgba(255,230,150,.9)'); g.addColorStop(1, 'rgba(255,230,150,0)');
  ctx.fillStyle = g; ctx.fillRect(mx - 22, y - 22, 44, 44);
}

function kehysSilmukka(nyt){
  rafId = requestAnimationFrame(kehysSilmukka);
  const t = (nyt - t0) / 1000;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0, 0, W, H);
  piirraRitari(t);
  const kw = W * .11, kh = H * .15, ky = H * .925 - kh;
  const a2 = liuku(t, RIVIT[1], RIVIT[1] + .6), a3 = liuku(t, RIVIT[2], RIVIT[2] + .6), a4 = liuku(t, RIVIT[3], RIVIT[3] + .6);
  // 4.11.2026 POIS (Jarno: "ala osan jutut ovat liikaa nyt, ehkä sitten puretaan ne?") - funktiot jäävät talteen:
  // if (a2 > 0) babbage(t, W*.64 - kw/2, ky, kw, kh, a2);
  // if (a3 > 0) turing(t - RIVIT[2], W*.77 - kw/2, ky, kw, kh, a3);
  // if (a4 > 0) mccarthy(t - RIVIT[3] - .3, W*.9 - kw/2, ky, kw, kh, a4);
  piirraDaVinci(t);
  piirraAda(t);
  aikajana(t);
}

window.naytaAikajana = function(p){
  if (p && p.aikajana) {
    if (aktiivinen) return;
    aktiivinen = true; t0 = performance.now(); koko(); cv.style.opacity = 1;
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(kehysSilmukka);
  } else if (aktiivinen) {
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
  }
};
})();
