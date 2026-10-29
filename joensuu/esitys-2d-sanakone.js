// ============================================================================
// SANAKONE (2.10.2026, x:6090 "Tekoäly on riippuvainen ihmisen tiedosta ja
// säännöistä. Se ei tiedä oikeaa vastausta, se arvaa todennäköisimmän.")
// Korvaa tällä pysähdyksellä ennustus-widgetin.
// Käyttö esitys-data.js:ssä: `sanakone: true`.
//
// Pieni pikselirobotti, jolla on suppilo päässä:
//  1. kirjaimet ja kirjat sataa suppiloon (opetusdata)
//  2. puhekupla: "Vesi on …"
//  3. paneeli: seuraavan sanan todennäköisyydet palkkeina
//  4. korostus hyppii vaihtoehdoissa kuin peliautomaatti, pysähtyy -> "märkää"
//  5. heitetään uudelleen -> pysähtyy "kuivaa" (2 %), robotti sanoo sen
//     YHTÄ varmana ja tyytyväisenä: kone ei tiedä, ettei se tiedä.
//  Vesi (Jarno 2.10.2026): koko ajan sataa, robotti kastuu ja seisoo lätäkössä -
//  ja juuri kun se sanoo "Vesi on kuivaa.", iso pisara läiskähtää sen päähän.
//  Pysähdys jaettu kahdeksi (x:6090 vain otsikko, x:6091 klikkaus käynnistää).
// Prosentit ovat havainnollistus, eivät mitattuja arvoja (Jarno selittää).
// Paneeli väistää tekstilaatikkoa; kaikki tekstikerroksen alla (z 4).
// ============================================================================
(function(){
'use strict';
const KEHOTE = 'Vesi on';
const SANAT = [['märkää', 61], ['kylmää', 17], ['kirkasta', 11], ['elämää', 6], ['kuivaa', 2]];
const HEITOT = [0, 4];                     // 1. heitto osuu "märkää", 2. heitto "kuivaa"
const FONTTI = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';

const cv = document.createElement('canvas');
cv.id = 'sanakone';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1, P = 4;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
  P = H / 256 * 2.1;                       // robotin pikselikoko (taustan pikselikoon luokkaa)
}
addEventListener('resize', koko); koko();

// ---------- robotti-sprite (koodilla, 24 x 30 pikseliä) ----------
function sprite(w, h, maalaa){ const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  maalaa((x,y,ww,hh,col) => { g.fillStyle = col; g.fillRect(x,y,ww,hh); }); return c; }
const ROBO = sprite(24, 30, r => {
  const K = '#161922';
  // suppilo
  r(4,0,16,1,K); r(4,1,16,1,'#c9d0dc'); r(5,2,14,1,'#aab3c3'); r(6,3,12,1,'#97a1b3'); r(8,4,8,1,'#8a94a6'); r(10,5,4,1,'#7a8496');
  r(3,0,1,2,K); r(20,0,1,2,K);
  // pää + näyttökasvot
  r(3,6,18,11,K); r(4,7,16,9,'#c3cad6'); r(4,7,16,1,'#eef1f6'); r(19,8,1,8,'#97a1b3');
  r(6,8,12,7,'#0f1d2b');
  r(1,10,2,3,'#8a94a6'); r(21,10,2,3,'#8a94a6');           // korvat
  // kaula + vartalo
  r(10,17,4,1,'#5a6275');
  r(5,18,14,9,K); r(6,19,12,7,'#8a94a6'); r(6,19,12,1,'#aab3c3'); r(9,21,6,3,'#5a6275');
  // telat
  r(4,27,16,3,K); r(5,28,14,1,'#3a3f4c');
  for (let x=6;x<19;x+=3) r(x,28,1,1,'#7a8496');
});

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;
let putoavat = [], kierros = null, teksti = null, sade = [], renkaat = [], roiskeet = [], isoPisara = null;
function mittaaTeksti(){ const e = document.getElementById('teksti'), r = e && e.getBoundingClientRect(); teksti = r && r.height > 0 ? r : null; }

// sijainnit: robotti oikealla maassa, paneeli tekstin oikealla puolella / alla
function asettelu(){
  const rw = 24*P, rh = 30*P, rx = W*.80 - rw/2, ry = H*.90 - rh;
  // kupla robotin yllä oikeaa reunaa vasten, paneeli sen vasemmalla puolella (ei päällekkäin)
  const fs = Math.max(14, H*.028); ctx.font = `700 ${fs*1.15}px ${FONTTI}`;
  const tw = ctx.measureText(KEHOTE + ' kirkasta.').width + fs*1.6, th = fs*2.3;
  const bx = W - tw - W*.03, by = ry - th - H*.06;
  let px = Math.max(W*.50, teksti ? teksti.right + W*.03 : 0), py = H*.16;
  let pw = Math.min(W*.34, W - px - W*.04);
  if (pw < W*.24 || py + fs*12 > by) { px = W*.40; py = teksti ? Math.max(H*.40, teksti.bottom + H*.04) : H*.45; pw = Math.min(W*.30, bx - px - W*.02); }
  return { rx, ry, rw, rh, px, py, pw, bx, by, tw, th };
}

function uusiKierros(t, kohde){
  // hyppyjen sarja: hidastuu loppua kohti, viimeinen = kohde
  const askeleet = [], n = 16 + kohde;
  let hetki = t, vali = .06;
  for (let i=0;i<n;i++){ askeleet.push({ hetki, rivi: ((kohde - (n - 1 - i)) % SANAT.length + SANAT.length) % SANAT.length }); hetki += vali; vali *= 1.16; }
  askeleet[askeleet.length-1].rivi = kohde;
  return { alku: t, askeleet, kohde, loppu: hetki + .1 };
}

function pyorea(x, y, w, h, r){ ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

function piirra(t, dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const L = asettelu(), fs = Math.max(14, H*.028);
  const nousu = Math.min(1, t / .6);

  // 1) opetusdata sataa suppiloon (0-2.6 s)
  if (t < 2.6 && Math.random() < dt * 26) {
    const merkki = Math.random() < .2 ? '▮' : 'abcdefghijklmnopqrstuvwxyzäö'[(Math.random()*28)|0];
    putoavat.push({ x: L.rx + L.rw/2 + (Math.random()-.5)*W*.25, y: -20, m: merkki, v: Math.random()*6 });
  }
  ctx.font = `700 ${fs*.8}px "Courier New",monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const suppiloX = L.rx + L.rw/2, suppiloY = L.ry + P*2;
  for (const p of putoavat){
    p.y += H*.55*dt; p.x += (suppiloX - p.x) * Math.min(1, dt*2.2 * Math.max(0, (p.y)/(suppiloY)));
    ctx.fillStyle = p.m === '▮' ? 'rgba(200,140,90,.9)' : 'rgba(200,235,255,.85)'; ctx.fillText(p.m, p.x, p.y);
  }
  putoavat = putoavat.filter(p => p.y < suppiloY);

  // sade + lätäkkö (robotin alle)
  const maa = H*.905, latX = L.rx + L.rw/2, latW = W*.11;
  const voima = Math.min(1, t / 2);
  let n = dt * 140 * voima; while (n > 0) { if (Math.random() < n) sade.push({ x: Math.random()*W*1.1, y: -20, v: H*(1.1 + Math.random()*.5), p: H*(.02 + Math.random()*.02) }); n--; }
  ctx.strokeStyle = 'rgba(175,205,235,.38)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (const s of sade) { s.y += s.v*dt; s.x -= s.v*dt*.08; ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.p*.08, s.y - s.p); }
  ctx.stroke();
  for (const s of sade) if (s.y > maa) { s.pois = true;
    if (Math.abs(s.x - latX) < latW) renkaat.push({ x: s.x, ika: 0 });
    else if (Math.random() < .3) roiskeet.push({ x: s.x, y: maa, vx: (Math.random()-.5)*H*.05, vy: -H*.06, ika: 0 }); }
  sade = sade.filter(s => !s.pois);
  const latA = Math.min(1, t / 3);
  ctx.fillStyle = `rgba(110,160,210,${.35*latA})`; ctx.beginPath(); ctx.ellipse(latX, maa + H*.004, latW*latA, H*.012*latA, 0, 0, 7); ctx.fill();
  ctx.fillStyle = `rgba(210,230,250,${.25*latA})`; ctx.beginPath(); ctx.ellipse(latX - latW*.3, maa + H*.001, latW*.25*latA, H*.003, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(220,235,250,1)'; ctx.lineWidth = 1;
  for (const r of renkaat) { r.ika += dt; ctx.globalAlpha = .6*(1 - r.ika/.6); ctx.beginPath(); ctx.ellipse(r.x, maa + H*.004, H*.03*r.ika, H*.006*r.ika, 0, 0, 7); ctx.stroke(); }
  ctx.globalAlpha = 1; renkaat = renkaat.filter(r => r.ika < .6);
  ctx.fillStyle = 'rgba(200,225,250,.7)';
  for (const r of roiskeet) { r.ika += dt; r.vy += H*.4*dt; r.x += r.vx*dt; r.y += r.vy*dt; ctx.fillRect(r.x, r.y, 2, 2); }
  roiskeet = roiskeet.filter(r => r.ika < .35);

  // robotti
  const pomppu = Math.abs(Math.sin(t*2.4)) * P * .6;
  ctx.save(); ctx.globalAlpha = nousu; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(ROBO, L.rx, L.ry - pomppu, L.rw, L.rh);
  // kasvot (näyttö): silmät skannaavat / tyytyväinen
  const sx = L.rx + 6*P, sy = L.ry + 8*P - pomppu, tyyt = kierros && t > kierros.loppu;
  ctx.fillStyle = '#7fe0ff';
  if (tyyt) { for (const ex of [2, 8]) { ctx.fillRect(sx + ex*P, sy + 3*P, P, P); ctx.fillRect(sx + (ex+1)*P, sy + 2*P, P, P); ctx.fillRect(sx + (ex+2)*P, sy + 3*P, P, P); }
              ctx.fillRect(sx + 4*P, sy + 5*P, 4*P, P); }
  else { const sk = kierros ? Math.round(Math.sin(t*14)) : Math.round(Math.sin(t*2)); for (const ex of [3, 8]) ctx.fillRect(sx + (ex+sk)*P, sy + 2*P, P, 2*P);
         ctx.fillRect(sx + 5*P, sy + 5*P, 2*P, P); }
  // rintavalo vilkkuu laskiessa
  ctx.fillStyle = kierros && !tyyt ? (Math.sin(t*30) > 0 ? '#ffcc4d' : '#5a6275') : '#6fe08a';
  ctx.fillRect(L.rx + 11*P, L.ry + 22*P - pomppu, 2*P, P);
  // vesi valuu robotin kylkiä pitkin
  ctx.fillStyle = 'rgba(170,210,245,.8)';
  for (let i=0;i<4;i++){ const f = ((t*.45 + i*.27) % 1), x = L.rx + [3.5, 20.5, 6.5, 17.5][i]*P, y = L.ry + (7 + f*20)*P - pomppu;
    ctx.fillRect(x, y, P*.6, P*1.2); }
  ctx.restore();
  // iso pisara: putoaa niin, että osuu päähän juuri kun "kuivaa" ilmestyy
  if (kierros && kierros.kohde === HEITOT[1]) {
    const osuu = kierros.loppu, kesto = .7, e = t - (osuu - kesto), paaY = L.ry - pomppu + P;
    if (e > 0 && e < kesto) { const y = -H*.05 + (paaY + H*.05) * (e/kesto)**2, r = P*2.2;
      ctx.fillStyle = 'rgba(150,200,245,.95)'; ctx.beginPath(); ctx.moveTo(L.rx + L.rw/2, y - r*2.2);
      ctx.quadraticCurveTo(L.rx + L.rw/2 + r*1.2, y, L.rx + L.rw/2, y + r); ctx.quadraticCurveTo(L.rx + L.rw/2 - r*1.2, y, L.rx + L.rw/2, y - r*2.2); ctx.fill(); }
    if (e >= kesto && !isoPisara) { isoPisara = t;
      for (let i=0;i<22;i++){ const a = -Math.PI*Math.random(); roiskeet.push({ x: L.rx + L.rw/2, y: paaY, vx: Math.cos(a)*H*.18, vy: Math.sin(a)*H*.22, ika: -.2 }); } }
  }

  // 2) puhekupla
  const kuplaA = Math.min(1, Math.max(0, (t - 2.6) / .4));
  if (kuplaA > 0) {
    const valmis = kierros && t > kierros.loppu;
    const sana = valmis ? SANAT[kierros.kohde][0] : '…';
    const kirj = Math.min(KEHOTE.length, Math.floor((t - 2.6) * 18));
    const lause = KEHOTE.slice(0, kirj) + (kirj >= KEHOTE.length ? ' ' + sana + (valmis ? '.' : '') : '');
    ctx.font = `700 ${fs*1.15}px ${FONTTI}`;
    const { tw, th, bx, by } = L;
    ctx.save(); ctx.globalAlpha = kuplaA; ctx.fillStyle = '#fbfaf5'; ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 12;
    pyorea(bx, by, tw, th, th*.4); ctx.fill(); ctx.shadowBlur = 0;
    const hx = Math.min(bx + tw - th, Math.max(bx + th, L.rx + L.rw/2)); ctx.beginPath(); ctx.moveTo(hx - fs*.6, by + th - 1); ctx.lineTo(hx, by + th + H*.045); ctx.lineTo(hx + fs*.6, by + th - 1); ctx.fill();
    ctx.fillStyle = '#1d2230'; ctx.textAlign = 'left'; ctx.fillText(lause, bx + fs*.8, by + th/2 + 1);
    if (valmis) { const w0 = ctx.measureText(KEHOTE + ' ').width; ctx.fillStyle = kierros.kohde === 0 ? '#1f7a4a' : '#b8432f';
      ctx.fillText(sana, bx + fs*.8 + w0, by + th/2 + 1); }
    ctx.restore();
  }

  // 3) todennäköisyyspaneeli
  const pa = Math.min(1, Math.max(0, (t - 3.6) / .5));
  if (pa > 0) {
    const rivi = fs*1.9, ph = rivi * SANAT.length + fs*2.6;
    ctx.save(); ctx.globalAlpha = pa;
    ctx.fillStyle = 'rgba(10,14,26,.82)'; pyorea(L.px, L.py, L.pw, ph, fs*.6); ctx.fill();
    ctx.strokeStyle = 'rgba(127,224,255,.6)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = `600 ${fs*.8}px ${FONTTI}`; ctx.fillStyle = 'rgba(200,235,255,.85)'; ctx.textAlign = 'left';
    ctx.fillText('Seuraava sana?', L.px + fs*.8, L.py + fs*1.2);
    const valittu = kierros ? (() => { let r = -1; for (const a of kierros.askeleet) if (t >= a.hetki) r = a.rivi; return r; })() : -1;
    SANAT.forEach(([s, p], i) => {
      const y = L.py + fs*2.2 + i*rivi, kasvu = Math.min(1, Math.max(0, (t - 3.8 - i*.12) / .6));
      const palkkiX = L.px + L.pw*.42, palkkiW = (L.pw*.58 - fs*3.2) * (p/61) * kasvu;
      const on = i === valittu;
      if (on) { ctx.fillStyle = 'rgba(255,204,77,.18)'; pyorea(L.px + fs*.4, y - fs*.2, L.pw - fs*.8, rivi*.85, fs*.4); ctx.fill();
                ctx.strokeStyle = '#ffcc4d'; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.font = `700 ${fs}px ${FONTTI}`; ctx.fillStyle = on ? '#ffe39a' : '#eef3fa'; ctx.textAlign = 'left';
      ctx.fillText(s, L.px + fs*.9, y + rivi*.33);
      ctx.fillStyle = on ? '#ffcc4d' : `rgba(127,224,255,${.55 + .4*(p/61)})`; ctx.fillRect(palkkiX, y + rivi*.16, Math.max(2, palkkiW), rivi*.36);
      ctx.font = `600 ${fs*.8}px ${FONTTI}`; ctx.fillStyle = '#c9d6e6'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(p*kasvu) + ' %', L.px + L.pw - fs*.7, y + rivi*.33);
    });
    ctx.restore();
  }

  // 4-5) heitot
  if (!kierros && t > 5.2) kierros = uusiKierros(t, HEITOT[0]);
  if (kierros && kierros.kohde === HEITOT[0] && t > kierros.loppu + 3.2) kierros = uusiKierros(t, HEITOT[1]);
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t, dt);
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaSanakone = function(p){
  if (!(p && p.sanakone)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); putoavat = []; kierros = null; sade = []; renkaat = []; roiskeet = []; isoPisara = null;
  mittaaTeksti(); setTimeout(mittaaTeksti, 450);
  aktiivinen = true; cv.style.opacity = 1;
  alku = performance.now() + 400; edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
