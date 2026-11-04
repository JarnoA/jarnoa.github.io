// ============================================================================
// TULVA-KOHTAUS (2.10.2026, x:4141 Disneyn Fantasia, "Olemme kaikki Mikkejä").
// Käyttö esitys-data.js:ssä: pysähdykseen kenttä `tulva: true` (korvaa vanhan
// `vesi`-aallon tällä pysähdyksellä).
//
// Ajatus (Jarno): otamme tekoälyn voimia käyttöön emmekä oikeasti tiedä, mitä
// tapahtuu - koko maailma on kokeessa. Kuten velhon oppipoika: luuta kantaa
// vettä, Mikki ei osaa pysäyttää sitä, luuta halkeaa kahdeksi, neljäksi,
// kahdeksaksi - ja vesi nousee aalto aallolta.
//
// Luudat (koodilla piirretty): puuvarsi, leveä olkiviuhka kahdella sidoksella, ämpärit. Vesi on
// kolme aaltokerrosta vaahtoharjoineen, syvyyden sävy, valon väreily ja
// kuplat. Pinnalla kelluvat loitsukirja ja ämpäri. Mikki (kiintea-spritesheet
// oikealla) jää vyötäröään myöten veteen.
// ============================================================================
(function(){
'use strict';
const TAVOITE = [.12, .20, .28, .36];       // 2.10.2026: max rintakorkeus - Mikki pysyy näkyvissä kirkkaassakin salissa       // pinnan korkeus (osuus ruudusta) jokaisen sukupolven kaatojen jälkeen
const SUKUPOLVI = 2.6;                      // s, yksi sukupolvi: marssi/halkeaminen + kaato
// luudat värillisinä (Jarno: "more like brooms") - siluetti ei erottunut päiväkohtauksessa
const VARSI = '#8a5a2e', VARSI_VALO = '#b07a43', OLKI = '#d4ac52', OLKI_TUMMA = '#9c7a32', SIDE = '#6b2e22', AMPARI = '#7d8796';

const cv = document.createElement('canvas');
cv.id = 'tulva';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', koko); koko();

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;
let taso = 0, tasoTavoite = 0, luudat = [], hiukkaset = [], kuplat = [], sukupolvi = -1, kaadot = 0;

function alusta(){
  taso = 0; tasoTavoite = 0; luudat = []; hiukkaset = []; kuplat = []; sukupolvi = -1; kaadot = 0;
}
// sukupolven g luudat tasavälein vasemmalle puoliskolle (Mikki on oikealla)
function paikat(n){ const a = .07, b = .52; return Array.from({length:n}, (_, i) => n === 1 ? .22 : a + (b - a) * i / (n - 1)); }

function uusiSukupolvi(g, t){
  sukupolvi = g;
  const n = 2 ** g, p = paikat(n);
  if (g === 0) {
    luudat = [{ x: -.1, kohde: p[0], rivi: 1, vaihe: Math.random()*6, kaato: -9, syntyi: t }];
  } else {
    // jokainen luuta halkeaa kahdeksi: lapsi syntyy emon kohdalle, kaikki liukuvat uusille paikoille
    const uudet = [];
    luudat.forEach((l, i) => {
      uudet.push({ ...l, kohde: p[2*i] });
      uudet.push({ x: l.x, kohde: p[2*i+1], rivi: (i + g) % 2, vaihe: Math.random()*6, kaato: -9, syntyi: t });
      taika(l.x * W, pinta() - H*.15, 18);
    });
    luudat = uudet;
  }
}
function pinta(){ return H - taso * H; }
function taika(x, y, n){
  for (let i=0;i<n;i++){ const a = Math.random()*Math.PI*2, v = H*(.04 + Math.random()*.12);
    hiukkaset.push({ x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, g: 0, ika: 0, kesto: .6 + Math.random()*.6, tyyppi: 'taika' }); }
}

// ---------- luuta ----------
function luuta(l, t){
  const k = l.rivi ? .27 : .22, h = H * k, x = l.x * W, y = pinta() + H*.015;
  const askel = Math.sin(t*6 + l.vaihe), kulma = askel * .05;
  const kaatoE = t - l.kaato, kallistus = kaatoE >= 0 && kaatoE < .9 ? Math.sin(Math.PI * kaatoE / .9) * 1.25 : 0;
  ctx.save(); ctx.translate(x, y - Math.abs(askel) * h * .03); ctx.rotate(kulma);
  if (!l.rivi) ctx.globalAlpha = .88;
  // olkiviuhka: kapea sidoksen kohdalta, levenee alas, rosoinen alareuna, askeltava keinunta
  const ylä = -h*.36, lev = h*.17, sw = askel*h*.035;
  ctx.fillStyle = OLKI; ctx.beginPath(); ctx.moveTo(-h*.04, ylä); ctx.lineTo(h*.04, ylä);
  ctx.quadraticCurveTo(h*.12, -h*.18, lev + sw, 0);
  for (let i=8;i>=0;i--) ctx.lineTo(-lev + (2*lev)*i/8 + sw, (i%2 ? -h*.02 : h*.012));
  ctx.quadraticCurveTo(-h*.12, -h*.18, -h*.04, ylä); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = OLKI_TUMMA; ctx.lineWidth = Math.max(1, h*.006);
  for (let i=-5;i<=5;i++){ ctx.beginPath(); ctx.moveTo(i*h*.006, ylä + h*.03); ctx.quadraticCurveTo(i*h*.02, -h*.15, i*lev/5.5 + sw, -h*.005); ctx.stroke(); }
  ctx.fillStyle = SIDE; ctx.fillRect(-h*.05, ylä + h*.03, h*.10, h*.025); ctx.fillRect(-h*.065, ylä + h*.09, h*.13, h*.025);
  // puuvarsi
  ctx.fillStyle = VARSI; ctx.fillRect(-h*.016, -h, h*.032, h*.66);
  ctx.fillStyle = VARSI_VALO; ctx.fillRect(-h*.016, -h, h*.01, h*.66);
  // kädet + ämpärit
  ctx.lineWidth = Math.max(1.5, h*.013); ctx.lineCap = 'round'; ctx.strokeStyle = VARSI;
  for (const s of [-1, 1]) {
    const kx = s*h*.2, ky = -h*.55 + askel*s*h*.02;
    ctx.beginPath(); ctx.moveTo(0, -h*.74); ctx.quadraticCurveTo(s*h*.12, -h*.76, kx, ky); ctx.stroke();
    ctx.save(); ctx.translate(kx, ky); ctx.rotate(s * kallistus);
    ctx.fillStyle = AMPARI; ctx.beginPath(); ctx.moveTo(-h*.065, 0); ctx.lineTo(h*.065, 0); ctx.lineTo(h*.05, h*.12); ctx.lineTo(-h*.05, h*.12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-h*.055, h*.01, h*.012, h*.1);
    ctx.fillStyle = '#4a90c8'; ctx.fillRect(-h*.06, 0, h*.12, h*.015);          // vettä ämpärissä
    ctx.strokeStyle = '#3c4350'; ctx.lineWidth = Math.max(1, h*.006); ctx.beginPath(); ctx.arc(0, 0, h*.065, Math.PI, 0); ctx.stroke();
    ctx.restore(); ctx.strokeStyle = VARSI; ctx.lineWidth = Math.max(1.5, h*.013);
    if (kallistus > .7 && Math.random() < .9) hiukkaset.push({ x: x + kx + s*h*.08, y: y + ky - Math.abs(askel)*h*.03, vx: s*H*.04*(Math.random()+.3), vy: H*.02, g: H*1.4, ika: 0, kesto: 1.2, tyyppi: 'vesi' });
  }
  ctx.restore();
}

// ---------- vesi ----------
function aalto(y0, amp, pituus, nopeus, t, vaihe){
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x=0; x<=W+20; x+=16) {
    const y = y0 + Math.sin(x/pituus + t*nopeus + vaihe) * amp + Math.sin(x/(pituus*.37) - t*nopeus*1.7 + vaihe*2) * amp*.35;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H); ctx.closePath();
}
function vaahto(y0, amp, pituus, nopeus, t, vaihe, a){
  ctx.save(); ctx.strokeStyle = `rgba(225,240,255,${a})`; ctx.lineWidth = Math.max(1.5, H*.003); ctx.beginPath();
  for (let x=0; x<=W+20; x+=16) {
    const y = y0 + Math.sin(x/pituus + t*nopeus + vaihe) * amp + Math.sin(x/(pituus*.37) - t*nopeus*1.7 + vaihe*2) * amp*.35;
    x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke(); ctx.restore();
}
function kelluja(t, x0, nimi){
  const x = ((x0 + t*.012) % 1.1) * W, y = pinta() + Math.sin(t*1.6 + x0*9) * H*.008, s = H*.035;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t*1.3 + x0*5) * .25);
  if (nimi === 'kirja') {
    ctx.fillStyle = '#5b2a2a'; ctx.fillRect(-s, -s*.35, s*2, s*.45);
    ctx.fillStyle = '#e8dcc0'; ctx.fillRect(-s*.9, -s*.45, s*.85, s*.15); ctx.fillRect(s*.05, -s*.45, s*.85, s*.15);
    ctx.fillStyle = 'rgba(160,140,255,.9)'; ctx.fillRect(-s*.15, -s*.3, s*.3, s*.12);   // taikamerkki
  } else {
    ctx.fillStyle = '#6d7686'; ctx.beginPath(); ctx.moveTo(-s*.5, -s*.5); ctx.lineTo(s*.5, -s*.5); ctx.lineTo(s*.4, s*.1); ctx.lineTo(-s*.4, s*.1); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function piirra(t, dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  // sukupolvet: marssi/halkeaminen, kaato keskellä, pinta nousee kaadon jälkeen
  const g = Math.min(3, Math.floor(t / SUKUPOLVI));
  if (g !== sukupolvi) uusiSukupolvi(g, t);
  const sisalla = t - g * SUKUPOLVI;
  if (sisalla > 1.5 && kaadot <= g) {
    kaadot = g + 1; luudat.forEach((l, i) => l.kaato = t + i * .05);
    setTimeout(() => { tasoTavoite = TAVOITE[Math.min(g, TAVOITE.length-1)]; }, 450);
  }
  // viimeisen sukupolven jälkeen luudat jatkavat kaatamista hitaammin (taso nousee enää hieman)
  if (g === 3 && t > 4*SUKUPOLVI && Math.floor((t - 4*SUKUPOLVI) / 3.2) + 5 > kaadot) {
    kaadot++; luudat.forEach((l, i) => l.kaato = t + i * .04); tasoTavoite = Math.min(.40, tasoTavoite + .01);
  }
  taso += (tasoTavoite - taso) * Math.min(1, dt * 1.6);
  for (const l of luudat) l.x += (l.kohde - l.x) * Math.min(1, dt * (l.x < 0 ? 1.2 : 2.2));

  const y = pinta();
  if (taso > .005) {
    // takimmainen aalto (läpikuultava, Mikki näkyy läpi)
    
    aalto(y - H*.012, H*.010, W*.09, 1.1, t, 0); ctx.fillStyle = 'rgba(40,100,160,.22)'; ctx.fill();
    vaahto(y - H*.012, H*.010, W*.09, 1.1, t, 0, .25);
  }
  for (const l of luudat) if (!l.rivi) luuta(l, t);           // takarivi aaltojen välissä
  if (taso > .005) {
    aalto(y, H*.014, W*.12, 1.5, t, 2); ctx.fillStyle = 'rgba(60,130,190,.20)'; ctx.fill();
    vaahto(y, H*.014, W*.12, 1.5, t, 2, .35);
  }
  for (const l of luudat) if (l.rivi) luuta(l, t);            // eturivi
  for (const [x0, n] of [[.08, 'kirja'], [.6, 'amparo']]) if (taso > .1) kelluja(t, x0, n);
  if (taso > .005) {
    aalto(y + H*.012, H*.016, W*.15, 2.0, t, 4);
    const eg = ctx.createLinearGradient(0, y, 0, H); eg.addColorStop(0, 'rgba(90,160,215,.28)'); eg.addColorStop(1, 'rgba(30,70,120,.42)');
    ctx.fillStyle = eg; ctx.fill();
    vaahto(y + H*.012, H*.016, W*.15, 2.0, t, 4, .55);
    // valon väreily syvyydessä
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i=0;i<7;i++){ const x = ((i*.17 + t*.02) % 1.1) * W, w = W*.02;
      const gr = ctx.createLinearGradient(0, y, 0, H); gr.addColorStop(0, 'rgba(140,200,255,.10)'); gr.addColorStop(1, 'rgba(140,200,255,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x, y + H*.02); ctx.lineTo(x + w, y + H*.02); ctx.lineTo(x + w*3 + Math.sin(t+i)*w, H); ctx.lineTo(x + w*1.5 + Math.sin(t+i)*w, H); ctx.fill(); }
    ctx.restore();
    // kuplat
    if (Math.random() < dt * 8) kuplat.push({ x: Math.random()*W, y: H, r: H*(.003 + Math.random()*.005), v: H*(.04 + Math.random()*.05) });
    ctx.strokeStyle = 'rgba(210,235,255,.45)'; ctx.lineWidth = 1;
    for (const b of kuplat){ b.y -= b.v*dt; b.x += Math.sin(b.y*.05)*.3; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.stroke(); }
    kuplat = kuplat.filter(b => b.y > y + H*.02);
  }
  // roiskeet ja taika
  for (const h of hiukkaset){
    h.ika += dt; h.vy += h.g*dt; h.x += h.vx*dt; h.y += h.vy*dt; const a = 1 - h.ika/h.kesto;
    if (h.tyyppi === 'vesi') {
      if (h.y > pinta()) { h.ika = h.kesto; for (let i=0;i<2;i++) hiukkaset.push({ x:h.x, y:pinta(), vx:(Math.random()-.5)*H*.08, vy:-H*(.05+Math.random()*.08), g:H*1.2, ika:0, kesto:.4, tyyppi:'roiske' }); }
      ctx.fillStyle = `rgba(150,200,240,${.8*a})`; ctx.fillRect(h.x-2, h.y-3, 3, 6);
    } else if (h.tyyppi === 'roiske') { ctx.fillStyle = `rgba(220,240,255,${a})`; ctx.fillRect(h.x-1.5, h.y-1.5, 3, 3); }
    else { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(170,150,255,${a})`;
      ctx.beginPath(); ctx.arc(h.x, h.y, Math.max(1.5, H*.003)*(1+a), 0, 7); ctx.fill(); ctx.restore(); }
  }
  hiukkaset = hiukkaset.filter(h => h.ika < h.kesto);
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t, dt);
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaTulva = function(p){
  if (!(p && p.tulva)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); alusta();
  aktiivinen = true; cv.style.opacity = 1;
  alku = performance.now() + 300; edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
