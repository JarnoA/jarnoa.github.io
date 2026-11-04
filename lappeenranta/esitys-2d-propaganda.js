// ============================================================================
// PROPAGANDA-ARMEIJA (2.10.2026, x:6990 "Venäjän tukema Pravda-verkosto julkaisi
// yli 3,6 miljoonaa propagandistista artikkelia vuonna 2024 tarkoituksenaan
// saastuttaa länsimaiset tekoälymallit disinformaatiolla.")
// Käyttö esitys-data.js:ssä: `propaganda: true`.
//
// Neuvostojulisteen henkiset robotit (puna/musta/kerma, punatähti, visiirisilmä,
// megafoni) marssivat tahdissa vasemmalta. Olkaputkista ammutaan lentolehtisiä
// ilmaan; ne leijailevat alas ja imeytyvät oikealla olevaan retrotietokoneeseen,
// jonka vihreä terminaaliteksti täyttyy punaisista propagandariveistä ja ruutu
// alkaa häiriintyä. Laskuri juoksee 3 600 000 artikkeliin. Taivaalla punaiset
// valonheittimet pyyhkivät julisteiden vinoon tapaan.
// Robotit pikseligrafiikkaa koodilla (kuten leivänpaahdin). Tekstin alla (z 4).
// ============================================================================
(function(){
'use strict';
const ROBOTTEJA = 6, MARSSI = 34;          // robotteja jonossa, jonon nopeus (px/s suhteessa H/1000)
const LOPPULUKU = 3600000, LASKUAIKA = 12; // artikkelit, sekunnit
const FONTTI = 'Georgia,Garamond,"Times New Roman",serif';

const cv = document.createElement('canvas');
cv.id = 'propaganda';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1, P = 4;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
  P = H / 256 * 1.25;
}
addEventListener('resize', koko); koko();

// ---------- robotti: 2 askelruutua, 20 x 30 pikseliä ----------
const K = '#16121a', PUNA = '#c8322c', TUMMAPUNA = '#8a1f1c', KERMA = '#efe3c8', TERAS = '#5a5560';
function sprite(w, h, maalaa){ const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  maalaa((x,y,ww,hh,col) => { g.fillStyle = col; g.fillRect(x,y,ww,hh); }); return c; }
function robotti(askel){
  return sprite(22, 30, r => {
    // lentolehtiputki olalla
    r(13,1,4,7,K); r(14,2,2,5,TERAS); r(13,0,4,1,PUNA);
    // pää + visiiri
    r(5,3,10,8,K); r(6,4,8,6,PUNA); r(6,6,8,2,K); r(7,6,6,2,'#ffdf6b');
    r(9,1,2,2,K);                                   // antenni
    // vartalo + punatähti
    r(4,12,12,10,K); r(5,13,10,8,KERMA); r(5,13,10,1,'#fff6e0');
    r(9,14,2,1,PUNA); r(7,15,6,1,PUNA); r(8,16,4,1,PUNA); r(8,17,1,1,PUNA); r(11,17,1,1,PUNA);
    r(5,20,10,1,TUMMAPUNA);
    // megafonikäsi ylös eteenpäin
    r(16,12,2,4,K); r(17,9,2,4,K); r(18,6,4,5,PUNA); r(21,5,1,7,K);
    r(2,13,2,6,K);                                  // takakäsi
    // jalat askeleen mukaan
    if (askel) { r(5,22,3,6,K); r(12,22,3,5,K); r(4,28,5,2,K); r(12,27,5,2,K); }
    else       { r(7,22,3,5,K); r(10,22,3,6,K); r(6,27,5,2,K); r(10,28,5,2,K); }
  });
}
const ROBO = [robotti(0), robotti(1)];

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;
let robotit = [], lehtiset = [], savut = [], laikut = [], rivit = [], imetyt = 0;

const uusiRivi = puna => { const palat = [], n = 1 + Math.floor(Math.random()*3); let x = .05; for (let k=0;k<n && x<.85;k++){ const w = .1 + Math.random()*.3; palat.push([x, Math.min(w, .9 - x)]); x += w + .04; } return { puna, palat }; };
function alusta(){
  robotit = Array.from({length: ROBOTTEJA}, (_, i) => ({ i, laukaus: 1.2 + i * .55 + Math.random()*.3, rekyyli: 0 }));
  lehtiset = []; savut = []; laikut = []; imetyt = 0;
  rivit = Array.from({length: 6}, () => uusiRivi(false));   // puhdas vihreä vastaus alussa
}
const kohde = () => ({ x: W * .84, y: H * .52, r: H * .085 });

function piirra(t, dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const a = Math.min(1, t / .8), maa = H * .925;

  // valonheittimet (vinot punaiset keilat)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i=0;i<3;i++){ const kx = W*(.15 + i*.32), kulma = -Math.PI/2 + Math.sin(t*.35 + i*2.1) * .55;
    const g = ctx.createLinearGradient(kx, maa, kx + Math.cos(kulma)*H, maa + Math.sin(kulma)*H);
    g.addColorStop(0, `rgba(220,60,50,${.16*a})`); g.addColorStop(1, 'rgba(220,60,50,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(kx, maa);
    ctx.lineTo(kx + Math.cos(kulma - .06)*H*1.2, maa + Math.sin(kulma - .06)*H*1.2); ctx.lineTo(kx + Math.cos(kulma + .06)*H*1.2, maa + Math.sin(kulma + .06)*H*1.2); ctx.fill(); }
  ctx.restore();

  // retrotietokone oikealla (Jarno 2.10.2026: kupla -> retrokone): vihreä terminaaliteksti
  // täyttyy imetyistä lentolehtisistä punaisiksi propagandariveiksi, ruutu alkaa häiriintyä
  const T = kohde(), saastunut = Math.min(1, imetyt / 140);
  const mw = T.r*2.7, mh = T.r*2.25, sw = mw*.8, sh = mh*.7;
  const hairio = saastunut > .3 && Math.random() < saastunut * .12 ? (Math.random() - .5) * T.r * .12 : 0;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(T.x, T.y);
  // hehku ruudun ympärillä (vihreä -> punainen)
  const hg = ctx.createRadialGradient(0, -mh*.08, sh*.3, 0, -mh*.08, mw*1.1);
  hg.addColorStop(0, `rgba(${80 + 170*saastunut},${230 - 170*saastunut},${120 - 60*saastunut},.28)`); hg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hg; ctx.fillRect(-mw*1.2, -mh*1.2, mw*2.4, mh*2.4);
  // kotelo, jalka, näppäimistö
  ctx.fillStyle = '#16121a'; ctx.fillRect(-mw/2 - 3, -mh/2 - 3, mw + 6, mh + 6);
  ctx.fillStyle = '#d8ccb0'; ctx.fillRect(-mw/2, -mh/2, mw, mh);
  ctx.fillStyle = '#efe6cf'; ctx.fillRect(-mw/2, -mh/2, mw, mh*.06);
  ctx.fillStyle = '#b3a68a'; ctx.fillRect(-mw/2, mh/2 - mh*.12, mw, mh*.12);
  ctx.fillStyle = '#6fd36f'; ctx.fillRect(mw*.32, mh/2 - mh*.08, mw*.05, mh*.04);       // virtavalo
  ctx.fillStyle = '#16121a'; ctx.fillRect(-mw*.15 - 3, mh/2 + 3, mw*.3 + 6, mh*.12);
  ctx.fillStyle = '#c4b799'; ctx.fillRect(-mw*.15, mh/2 + 3, mw*.3, mh*.1);
  ctx.fillStyle = '#16121a'; ctx.fillRect(-mw*.55 - 3, mh/2 + mh*.14, mw*1.1 + 6, mh*.18);
  ctx.fillStyle = '#d8ccb0'; ctx.fillRect(-mw*.55, mh/2 + mh*.14 + 3, mw*1.1, mh*.14);
  ctx.fillStyle = '#8f846c'; for (let r=0;r<2;r++) for (let c=0;c<12;c++) ctx.fillRect(-mw*.5 + c*mw*.085, mh/2 + mh*.17 + r*mh*.055, mw*.07, mh*.04);
  // ruutu
  const sx = -sw/2, sy = -mh/2 + mh*.1;
  ctx.fillStyle = '#071209'; ctx.fillRect(sx, sy, sw, sh);
  ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  const rivi = sh / 10, nakyvat = rivit.slice(-9);
  nakyvat.forEach((r, k) => {
    const y = sy + rivi*(k + .6), siirto = r.puna && saastunut > .4 && Math.random() < .05 ? (Math.random()-.5)*sw*.1 : 0;
    ctx.fillStyle = r.puna ? '#ff4a3d' : '#5cff7a';
    ctx.globalAlpha = a * (r.puna ? .95 : .85);
    for (const [x0, w0] of r.palat) ctx.fillRect(sx + sw*x0 + siirto + hairio, y, sw*w0, rivi*.45);
  });
  ctx.globalAlpha = a;
  if (Math.floor(t*2) % 2) { ctx.fillStyle = saastunut > .5 ? '#ff4a3d' : '#5cff7a'; ctx.fillRect(sx + sw*.05, sy + rivi*(Math.min(9, nakyvat.length) + .6), sw*.04, rivi*.5); }   // kursori
  ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let y=sy; y<sy+sh; y+=3) ctx.fillRect(sx, y, sw, 1);   // juovat
  if (saastunut > .5 && Math.random() < .06) { ctx.fillStyle = 'rgba(255,60,50,.25)'; ctx.fillRect(sx, sy + Math.random()*sh, sw, rivi*.8); }
  ctx.restore(); ctx.restore();

  // laskuri kuplan alla
  const e = Math.min(1, Math.max(0, (t - 1) / LASKUAIKA)), luku = Math.round(LOPPULUKU * (1 - Math.pow(1 - e, 2.2)) / 1000) * 1000;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${H*.045}px ${FONTTI}`; ctx.fillStyle = '#ff6a5a'; ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 10;
  ctx.fillText(luku.toLocaleString('fi-FI'), T.x, T.y + T.r*2.45);
  ctx.font = `600 ${H*.022}px ${FONTTI}`; ctx.fillStyle = '#efe3c8'; ctx.fillText('artikkelia', T.x, T.y + T.r*2.45 + H*.035);
  ctx.restore();

  // marssiva jono: kiertää vasemmalta, jättää oikean reunan kuplalle
  const rw = 22*P, rh = 30*P, vali = W * .115, jono = vali * ROBOTTEJA, siirto = t * MARSSI * H / 1000;
  const askel = Math.floor(t * 3.2) % 2;
  ctx.imageSmoothingEnabled = false;
  for (const r of robotit) {
    const x = ((r.i * vali + siirto) % jono) - rw + W*.02, y = maa - rh - (askel === r.i % 2 ? P*.6 : 0);
    if (x > W*.66) continue;                                   // ei kuplan päälle
    if (t > r.laukaus) {                                      // olkaputki ampuu lentolehtispurskeen
      r.laukaus = t + 2.4 + Math.random()*1.2; r.rekyyli = 1;
      const ux = x + 15*P, uy = y;
      for (let k=0;k<7;k++) lehtiset.push({ x: ux, y: uy, vx: (Math.random()*.9 + .2) * H*.25, vy: -H*(.45 + Math.random()*.35), kierto: Math.random()*6, vk: (Math.random()-.5)*8, ika: 0, imu: false });
      for (let k=0;k<5;k++) savut.push({ x: ux, y: uy, vx: (Math.random()-.5)*H*.05, vy: -H*.06, ika: 0 });
    }
    r.rekyyli = Math.max(0, r.rekyyli - dt*5);
    ctx.globalAlpha = a; ctx.drawImage(ROBO[(askel + r.i) % 2], x, y + r.rekyyli * P, rw, rh);
  }
  ctx.globalAlpha = 1;
  // savupöllähdykset
  for (const s of savut){ s.ika += dt; s.x += s.vx*dt; s.y += s.vy*dt; ctx.fillStyle = `rgba(220,215,205,${.5*(1 - s.ika/.8)})`;
    const k = P*(1.5 + s.ika*4); ctx.fillRect(s.x - k/2, s.y - k/2, k, k); }
  savut = savut.filter(s => s.ika < .8);

  // lentolehtiset: nousevat, leijailevat, osa imeytyy kuplaan
  for (const l of lehtiset){
    l.ika += dt;
    if (!l.imu && l.ika > .9 && Math.random() < dt * .45) l.imu = true;
    if (l.imu) { const dx = T.x - l.x, dy = T.y - l.y, d = Math.hypot(dx, dy); l.vx += dx/d * H*1.2*dt; l.vy += dy/d * H*1.2*dt; l.vx *= .96; l.vy *= .96;
      if (d < T.r) { l.pois = true; imetyt++; if (imetyt % 2 === 0) { rivit.push(uusiRivi(true)); if (rivit.length > 40) rivit.shift(); } continue; } }
    else { l.vy += H*.35*dt; l.vy = Math.min(l.vy, H*.07); l.vx *= .985; l.x += Math.sin(l.ika*3 + l.kierto) * H*.05 * dt; }
    l.x += l.vx*dt; l.y += l.vy*dt; l.kierto += l.vk*dt;
    if (l.y > maa + 10 || l.ika > 9) { l.pois = true; continue; }
    const s = H*.022;
    ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(Math.sin(l.kierto) * .8); ctx.scale(Math.cos(l.kierto*1.3), 1);
    ctx.fillStyle = KERMA; ctx.fillRect(-s/2, -s*.7, s, s*1.4);
    ctx.fillStyle = PUNA; ctx.fillRect(-s*.4, -s*.6, s*.8, s*.28);
    ctx.fillStyle = '#6b5d50'; for (let i=0;i<3;i++) ctx.fillRect(-s*.38, -s*.18 + i*s*.24, s*.76, s*.08);
    ctx.restore();
  }
  lehtiset = lehtiset.filter(l => !l.pois);
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t, dt);
  rafId = requestAnimationFrame(silmukka);
}

window.naytaPropaganda = function(p){
  if (!(p && p.propaganda)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); alusta(); aktiivinen = true; cv.style.opacity = 1;
  alku = performance.now() + 300; edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
