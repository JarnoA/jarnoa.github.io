// ============================================================================
// ELÄVÄ JÄÄVUORI (4.11.2026, x:840 "Tekoäly, jolle juttelet / joka valitsee,
// mitä näet / jota et näe"). Jarno: "kaipaisin ehkä siihen elämää" + "nostetaan
// jokin objekti kustakin tasosta? Chatbotti, mainos, liikennevalot?"
//
// Käyttö esitys-data.js:ssä: `jaavuori2: true` samalle pysähdykselle kuin
// `jaavuori: {...}`. Moottorin jäävuorikortit (#jaavuori, z 5) pysyvät; tämä
// piirtää niiden alle (z 4):
//  - vedenpinnan, joka nousee 2. tason myötä 1. ja 2. tason väliin ja aaltoilee
//    (moottorin oma #aalto-vesi piilotetaan tällä sivulla)
//  - jäävuoren: pieni huippu pinnan yllä, valtaosa pinnan alla, keinuu hitaasti
//  - kuplat syvyydestä
//  - kunkin tason vieressä pikseliesineen: chattikupla kirjoittaa (pinnalla),
//    puhelimen mainos vilkkuu (pinnan alla), liikennevalot vaihtuvat (syvällä,
//    valo hehkuu veden läpi)
// Sijainnit luetaan korttien getBoundingClientRect():sta joka kehyksellä,
// esineiden näkyvyys seuraa korttien opacityä -> sama tahti kuin teksteillä.
// ============================================================================
(function(){
'use strict';
const cv = document.createElement('canvas');
cv.id = 'jaavuori2';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(cv);
  const st = document.createElement('style');
  st.textContent = `
#jaavuori.jv2 .jaavuori-taso:nth-child(2).nakyy{ animation: jv2-kellu 5.5s ease-in-out infinite; }
#jaavuori.jv2 .jaavuori-taso:nth-child(3){ transition: opacity 2.2s ease, transform 2.2s ease; }
#jaavuori.jv2 .jaavuori-taso:nth-child(3).nakyy{ animation: jv2-kellu 7s ease-in-out infinite reverse; }
@keyframes jv2-kellu{ 0%,100%{ transform:translate(0,0); } 50%{ transform:translate(3px,4px); } }`;
  document.head.appendChild(st);
});

let W = 0, H = 0, DPR = 1;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', koko); koko();

let aktiivinen = false, rafId = 0, t0 = 0, edellinen = 0, pinta = 0, kuplat = [];

// ---------- pikseliesineet (pieni kanvaasi, skaalataan terävänä) ----------
function pikseli(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const BITMAP = {
  prosentti: ['11...1', '11..1.', '...1..', '..1...', '.1..11', '1...11'],
  sydan:     ['.11.11.', '1111111', '1111111', '.11111.', '..111..', '...1...'],
  huuto:     ['11', '11', '11', '11', '..', '11'],
};
function bitmap(g, b, x, y, vari){ g.fillStyle = vari; b.forEach((r, j) => [...r].forEach((c, i) => { if (c === '1') g.fillRect(x + i, y + j, 1, 1); })); }

// 1) chattikupla 26x20: kolme pistettä kirjoittaa, sitten vastausrivit
const KUPLA = pikseli(26, 20), kg = KUPLA.getContext('2d');
function piirraKupla(t){
  kg.clearRect(0, 0, 26, 20);
  kg.fillStyle = '#161922'; kg.fillRect(1, 0, 24, 1); kg.fillRect(0, 1, 26, 14); kg.fillRect(1, 15, 24, 1); kg.fillRect(3, 16, 4, 2); kg.fillRect(3, 18, 2, 1);
  kg.fillStyle = '#f4f6fa'; kg.fillRect(1, 1, 24, 14); kg.fillRect(4, 15, 2, 2);
  kg.fillStyle = '#c3cad6'; kg.fillRect(1, 13, 24, 2);
  const f = t % 4;
  if (f < 2) {                                        // "kirjoittaa…"
    for (let i = 0; i < 3; i++) { const hyppy = Math.floor((t*4 + i*.7) % 3) === 0 ? 1 : 0;
      kg.fillStyle = '#566074'; kg.fillRect(7 + i*5, 6 - hyppy, 3, 3); }
  } else {                                            // vastaus ilmestyy rivi kerrallaan
    const n = Math.min(3, Math.floor((f - 2) * 3) + 1);
    kg.fillStyle = '#566074';
    [[3, 19], [3, 15], [3, 9]].slice(0, n).forEach(([x, w], j) => kg.fillRect(x, 3 + j*4, w, 2));
  }
}
// 2) puhelin 16x28: ruudun mainos vaihtuu ja vilkkuu
const PUH = pikseli(16, 28), pg = PUH.getContext('2d');
const MAINOKSET = [
  { tausta: '#e0455a', merkki: 'prosentti', vari: '#fff', w: 6 },
  { tausta: '#f2c94c', merkki: 'huuto', vari: '#161922', w: 2 },
  { tausta: '#ff8fb1', merkki: 'sydan', vari: '#b0123c', w: 7 },
];
function piirraPuhelin(t){
  pg.clearRect(0, 0, 16, 28);
  pg.fillStyle = '#0c0f16'; pg.fillRect(1, 0, 14, 28); pg.fillRect(0, 1, 16, 26);
  pg.fillStyle = '#272d3c'; pg.fillRect(1, 1, 14, 26);
  pg.fillStyle = '#0c0f16'; pg.fillRect(6, 2, 4, 1);          // kaiutin
  const m = MAINOKSET[Math.floor(t / .8) % MAINOKSET.length], vilkku = (t % .8) < .08;
  pg.fillStyle = vilkku ? '#ffffff' : m.tausta; pg.fillRect(2, 4, 12, 19);
  pg.fillStyle = 'rgba(255,255,255,.35)'; pg.fillRect(2, 4, 12, 3);   // "MAINOS"-palkki
  bitmap(pg, BITMAP[m.merkki], 8 - Math.ceil(m.w/2), 11, m.vari);
  pg.fillStyle = m.vari; pg.fillRect(4, 19, 8, 2);                    // "OSTA"-nappi
  pg.fillStyle = '#566074'; pg.fillRect(6, 25, 4, 1);
}
// 3) liikennevalot 10x34: punainen -> keltainen -> vihreä
const VALO = pikseli(10, 34), vg = VALO.getContext('2d');
const VALOT = [['#ff3b30', '#4a1512'], ['#ffcc00', '#4a3a08'], ['#34e06a', '#0f3a1c']];
function valoVaihe(t){ const f = t % 5.6; return f < 2.4 ? 0 : (f < 3.2 ? 1 : 2); }
function piirraValo(t){
  vg.clearRect(0, 0, 10, 34);
  vg.fillStyle = '#0c0f16'; vg.fillRect(0, 0, 10, 24);
  vg.fillStyle = '#2b303b'; vg.fillRect(1, 1, 8, 22);
  vg.fillStyle = '#3a404d'; vg.fillRect(4, 24, 2, 10);               // tolppa
  const v = valoVaihe(t);
  VALOT.forEach(([paalla, pois], i) => { vg.fillStyle = i === v ? paalla : pois;
    vg.fillRect(3, 3 + i*7, 4, 5); vg.fillRect(2, 4 + i*7, 6, 3); });
}
const TINT = pikseli(1, 1);
function sävy(src, vari){                             // pinnan alla: sininen sävy päälle (source-atop)
  if (TINT.width !== src.width || TINT.height !== src.height) { TINT.width = src.width; TINT.height = src.height; }
  const g = TINT.getContext('2d'); g.clearRect(0, 0, TINT.width, TINT.height);
  g.globalCompositeOperation = 'source-over'; g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = vari; g.fillRect(0, 0, TINT.width, TINT.height);
  g.globalCompositeOperation = 'source-over'; return TINT;
}


function hehku(x, y, r, rgb, a){
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2*r, 2*r); ctx.restore();
}

function kehys(nyt){
  rafId = requestAnimationFrame(kehys);
  const t = (nyt - t0) / 1000, dt = Math.min(.05, (nyt - edellinen) / 1000 || 0); edellinen = nyt;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0, 0, W, H); ctx.imageSmoothingEnabled = false;
  const kortit = [...document.querySelectorAll('#jaavuori .jaavuori-taso')];
  if (kortit.length < 3) return;
  const r = kortit.map(k => k.getBoundingClientRect());
  const nak = kortit.map(k => +getComputedStyle(k).opacity || 0);

  // vedenpinta: alhaalla kunnes 2. taso tulee, sitten 1. ja 2. tason väliin
  const tavoite = nak[1] > .2 ? (r[0].bottom + r[1].top) / 2 : H + 20;
  if (!pinta) pinta = H + 20;
  pinta += (tavoite - pinta) * Math.min(1, dt * 1.6);
  const keinu = Math.sin(t * .7) * H * .004;

  // jäävuori (hiottu 4.11.2026): rosoinen huippu, valo- ja varjofasetti, lumi, halkeamat;
  // pinnan alla leveä runko, joka tummuu ja kapenee syvyyteen
  if (nak[1] > .01) {
    const cx = W / 2, vy = pinta + keinu, A = Math.min(W*.5, r[0].width * .78), Ht = Math.max(10, vy - (r[0].top - H*.06));
    const Wd = Math.min(W*.9, r[2].width * 1.2), D = Math.max(10, (H - vy) * 1.08);
    const P = (x, y) => [cx + x*A, vy - y*Ht];                       // pinnan yllä: x leveyden, y korkeuden osuuksina
    const Q = (x, y) => [cx + x*Wd, vy + y*D];                       // pinnan alla
    const polku = pts => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
    ctx.save(); ctx.globalAlpha = nak[1];
    // pinnan alla oleva runko
    const ala = [[cx + A/2, vy], Q(.42,.14), Q(.5,.36), Q(.45,.6), Q(.31,.83), Q(.12,1), Q(-.07,1.02), Q(-.27,.86), Q(-.45,.62), Q(-.5,.36), Q(-.41,.15), [cx - A/2, vy]];
    let g = ctx.createLinearGradient(0, vy, 0, vy + D);
    g.addColorStop(0, 'rgba(175,222,242,.42)'); g.addColorStop(.45, 'rgba(110,170,205,.22)'); g.addColorStop(1, 'rgba(30,70,110,.03)');
    polku(ala); ctx.fillStyle = g; ctx.fill();
    polku([[cx + A*.08, vy], Q(.42,.14), Q(.5,.36), Q(.45,.6), Q(.31,.83), Q(.12,1), Q(.02,.6)]);   // varjopuoli
    g = ctx.createLinearGradient(0, vy, 0, vy + D); g.addColorStop(0, 'rgba(20,50,90,.22)'); g.addColorStop(1, 'rgba(10,25,50,0)');
    ctx.fillStyle = g; ctx.fill();
    // huippu
    const yla = [P(-.5,0), P(-.43,.16), P(-.35,.27), P(-.27,.5), P(-.17,.58), P(-.08,.84), P(.01,1), P(.09,.79), P(.15,.86), P(.25,.6), P(.33,.47), P(.42,.21), P(.5,0)];
    polku(yla);
    g = ctx.createLinearGradient(cx - A/2, 0, cx + A/2, 0);
    g.addColorStop(0, 'rgba(236,248,255,.95)'); g.addColorStop(.5, 'rgba(214,238,250,.95)'); g.addColorStop(1, 'rgba(160,205,230,.95)');
    ctx.fillStyle = g; ctx.fill();
    polku([P(.01,1), P(.09,.79), P(.15,.86), P(.25,.6), P(.33,.47), P(.42,.21), P(.5,0), P(.06,0), P(.04,.45)]);   // varjofasetti oikealla
    ctx.fillStyle = 'rgba(95,150,190,.45)'; ctx.fill();
    polku([P(-.27,.5), P(-.17,.58), P(-.08,.84), P(.01,1), P(-.02,.78), P(-.12,.52), P(-.22,.44)]);   // lumi/valo huipulla
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill();
    ctx.strokeStyle = 'rgba(110,160,195,.6)'; ctx.lineWidth = Math.max(1, A*.006); ctx.lineCap = 'round';
    for (const viiva of [[P(-.08,.84), P(-.1,.55), P(-.18,.3)], [P(.15,.86), P(.13,.6), P(.18,.35), P(.15,.12)], [P(-.35,.27), P(-.3,.1)]]) {
      ctx.beginPath(); viiva.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
    ctx.restore();
  }

  // vesi pinnan alla
  if (pinta < H) {
    const vg2 = ctx.createLinearGradient(0, pinta, 0, H);
    vg2.addColorStop(0, 'rgba(60,140,190,.30)'); vg2.addColorStop(.5, 'rgba(20,70,120,.45)'); vg2.addColorStop(1, 'rgba(6,22,48,.70)');
    ctx.fillStyle = vg2;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 16) ctx.lineTo(x, pinta + Math.sin(x * .012 + t * 1.6) * 5 + Math.sin(x * .031 - t * 2.3) * 2.5);
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(220,245,255,.55)'; ctx.lineWidth = 2;   // pinnan välke
    ctx.beginPath();
    for (let x = 0; x <= W; x += 16) { const y = pinta + Math.sin(x * .012 + t * 1.6) * 5 + Math.sin(x * .031 - t * 2.3) * 2.5; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    // kuplat
    if (Math.random() < dt * 6) kuplat.push({ x: Math.random() * W, y: H + 6, r: 2 + Math.random() * 4, v: 30 + Math.random() * 40, f: Math.random() * 6 });
  }
  for (const k of kuplat) { k.y -= k.v * dt; k.x += Math.sin(t * 2 + k.f) * 12 * dt; }
  kuplat = kuplat.filter(k => k.y > pinta + 4);
  ctx.strokeStyle = 'rgba(210,240,255,.55)'; ctx.lineWidth = 1.5;
  for (const k of kuplat) { ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, Math.PI*2); ctx.stroke(); }

  // esineet korttien vierellä
  const vali = W * .015;
  const esine = (src, korkeus, kortti, puoli, nakyvyys, alla, kellu) => {
    const h = korkeus, w = h * src.width / src.height;
    let x = puoli < 0 ? kortti.left - vali - w : kortti.right + vali;
    x = Math.max(W*.01, Math.min(W*.99 - w, x));
    const y = kortti.top + kortti.height/2 - h/2 + (kellu ? Math.sin(t * 1.5 + puoli) * h * .03 : -Math.abs(Math.sin(t * 2.2)) * h * .04);
    ctx.globalAlpha = nakyvyys;
    ctx.drawImage(alla ? sävy(src, alla) : src, x, y, w, h);
    ctx.globalAlpha = 1;
    return { x, y, w, h };
  };
  piirraKupla(t); piirraPuhelin(t); piirraValo(t);
  esine(KUPLA, Math.min(H*.13, r[0].height * 1.15), r[0], -1, nak[0], null, false);
  const pa = esine(PUH, Math.min(H*.17, r[1].height * 1.35), r[1], 1, nak[1], 'rgba(40,110,170,.28)', true);
  if (nak[1] > .05) { const m = MAINOKSET[Math.floor(t / .8) % MAINOKSET.length];
    hehku(pa.x + pa.w/2, pa.y + pa.h*.48, pa.h*.55, m.tausta === '#f2c94c' ? '242,201,76' : (m.tausta === '#e0455a' ? '224,69,90' : '255,143,177'), .22 * nak[1]); }
  const va = esine(VALO, Math.min(H*.22, r[2].height * 1.6), r[2], -1, nak[2], 'rgba(10,40,80,.55)', true);
  if (nak[2] > .05) { const v = valoVaihe(t), rgb = ['255,59,48', '255,204,0', '52,224,106'][v];
    hehku(va.x + va.w/2, va.y + va.h * (5.5 + v*7) / 34, va.h * .35, rgb, .55 * nak[2]); }
}

function kaynnista(){
  aktiivinen = true; t0 = performance.now(); edellinen = t0; pinta = 0; kuplat = [];
  koko(); cv.style.opacity = 1;
  const j = document.getElementById('jaavuori'); if (j) j.classList.add('jv2');
  const a = document.getElementById('aalto'); if (a) a.style.visibility = 'hidden';
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(kehys);
}
function pysayta(){
  aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
  const j = document.getElementById('jaavuori'); if (j) j.classList.remove('jv2');
  const a = document.getElementById('aalto'); if (a) a.style.visibility = '';
}

// Kutsutaan esitys-2d.html:n siirry():stä naytaJaavuori():n JÄLKEEN.
window.naytaJaavuori2 = function(p){
  if (p && p.jaavuori2 && p.jaavuori) { if (!aktiivinen) kaynnista(); else { const j = document.getElementById('jaavuori'); if (j) j.classList.add('jv2'); } }
  else if (aktiivinen) pysayta();
};
})();
