// ============================================================================
// MUSTA LAATIKKO (2.10.2026, x:4590 "Mustan laatikon valta" - osion avaus).
// Esitys perustuu Jarnon kirjaan Musta laatikko: tekoälyn piilossa olevat asiat
// (algoritmit ym.). Käyttö esitys-data.js:ssä: pysähdykseen `mustaLaatikko: true`.
//
// Kulku: maa jyrisee, iso musta kuutio nousee niityltä (pöly, tärähdys).
// Reunoilla sykkii valo. Kansi raottuu: valo ja symbolit (0/1, {}, </>, ∑, ?)
// purkautuvat ulos - ja imeytyvät takaisin, kun kansi paukahtaa kiinni.
// Vilkaisu sisään, ei enempää.
//
// MAAILMASSA, ei ruudulla: Phaser-kuva lukittuna niittykerrokseen '18.png'
// (laskeLukittuScrollFactor - liikkuu täsmälleen niityn nopeudella), syvyys
// 18.5 -> edempänä olevat ruohokerrokset peittävät juuren. Laatikko jää
// maisemaan ja liukuu parallaksina ohi, kun esitys jatkuu; humisee ja vuotaa
// välillä pari symbolia. Palattaessa pysähdykselle myöhemmästä kohdasta kansi
// vain raottuu uudelleen; mentäessä osion alkua TAAKSEPÄIN laatikko vajoaa pois.
// ============================================================================
(function(){
'use strict';
const LUKITUS = '18.png', SYVYYS = 18.5;
const SIIRTYMA_X = 0.20;      // ruudun leveyden osuus keskeltä oikealle saapumishetkellä
const MAA_Y = 0.80;           // laatikon pohja (osuus ruudun korkeudesta)
const SYMBOLIT = ['0', '1', '0', '1', '{ }', '</>', '∑', '?', '01', 'if', '→'];

let sc = null, tex = null, img = null, ctx = null, TW = 0, TH = 0, s = 0, PX = 1;
let tila = null, rafId = 0, edellinen = 0, ac = null;

function aani(){
  if (typeof ESIKATSELU !== 'undefined' && ESIKATSELU) return null;
  try { return ac || (ac = new (window.AudioContext || window.webkitAudioContext)()); } catch (e) { return null; }
}
function jyrina(kesto){
  const a = aani(); if (!a) return; const t = a.currentTime;
  const b = a.createBuffer(1, Math.ceil(a.sampleRate*kesto), a.sampleRate), d = b.getChannelData(0);
  for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * Math.sin(Math.PI*i/d.length);
  const src = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  src.buffer = b; fl.type = 'lowpass'; fl.frequency.value = 120; g.gain.value = .9;
  src.connect(fl).connect(g).connect(a.destination); src.start(t);
}
function kalahdus(){
  const a = aani(); if (!a) return; const t = a.currentTime, o = a.createOscillator(), g = a.createGain();
  o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(35, t + .35);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.5, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .4);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + .45);
}

function laatikonX(){ return PYSAHDYKSET_2D.find(q => q.mustaLaatikko).x; }
function luo(){
  sc = window.__paaKohtaus; if (!sc) return false;
  const W = sc.scale.width, H = sc.scale.height;
  // Piirretään taustan OMALLA pikselikoolla (linnapakka 256 px korkea, zoom 1)
  // ja skaalataan terävästi ylös -> sama pikselitaide-ilme kuin maisemalla.
  PX = H / 256;
  s = Math.round(H * .26 / PX); TW = Math.ceil(s * 2.2); TH = Math.ceil(s * 2.9);
  if (img) { img.destroy(); sc.textures.remove('musta-laatikko'); }
  tex = sc.textures.createCanvas('musta-laatikko', TW, TH); ctx = tex.getContext();
  tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  const kohtaus = sc.valitseKohtaus(laatikonX());
  const sf = sc.laskeLukittuScrollFactor(kohtaus, LUKITUS, H) || 1;
  img = sc.add.image(sc.laskeParallaksiX(laatikonX(), sf, W) + W * SIIRTYMA_X, H * MAA_Y, 'musta-laatikko')
    .setOrigin(.5, 1).setScale(PX).setScrollFactor(sf).setDepth(SYVYYS);
  return true;
}
addEventListener('resize', () => { if (img && tila) setTimeout(() => { luo(); }, 50); });

// ---------- piirto ----------
// Suora sivukuva kuten maisemassa (ei yläpintaa, ei perspektiiviä - Jarno:
// "perspective is not same as landscape"). Tekstuurikoordinaatit = taustan
// pikseleitä. Valo: auringonlasku vasemmalta ylhäältä -> lämmin vasen reuna.
function piirra(t, dt){
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0, 0, TW, TH); ctx.imageSmoothingEnabled = false;
  const lev = Math.round(s * 1.05), bx = Math.round((TW - lev) / 2);
  const nousu = tila.nousu, y0 = Math.round(TH - 3 + (1 - nousu) * (s + 4));   // pohja (3 px maan sisään)
  const ft = y0 - s;
  const kansi = tila.kansi, kh = Math.max(3, Math.round(s * .12));
  const ra = Math.round(kansi * s * .22);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, TW, TH - 2); ctx.clip();
  // varjo maahan (oikealle, aurinko vasemmalla)
  ctx.fillStyle = `rgba(30,15,20,${.35*nousu})`; ctx.fillRect(bx + 2, TH - 4, lev + Math.round(s*.25), 2);
  // valokeila raosta suoraan ylös
  if (kansi > .02) {
    const g = ctx.createLinearGradient(0, ft, 0, ft - s*1.5);
    g.addColorStop(0, `rgba(200,235,255,${.6*kansi})`); g.addColorStop(1, 'rgba(200,235,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx + 2, ft); ctx.lineTo(bx + lev - 2, ft); ctx.lineTo(bx + lev + s*.25, ft - s*1.5); ctx.lineTo(bx - s*.25, ft - s*1.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(235,250,255,${kansi})`; ctx.fillRect(bx + 1, ft - ra, lev - 2, ra);           // hehkuva rako
  }
  // runko: tasainen musta, lämmin reunavalo vasemmalla, varjopuoli oikealla
  ctx.fillStyle = '#0c0b10'; ctx.fillRect(bx, ft + kh, lev, s - kh);
  ctx.fillStyle = '#17141c'; ctx.fillRect(bx, ft + kh, Math.round(lev*.12), s - kh);
  ctx.fillStyle = 'rgba(255,150,90,.55)'; ctx.fillRect(bx, ft + kh, 1, s - kh);
  ctx.fillStyle = '#060509'; ctx.fillRect(bx + lev - Math.round(lev*.1), ft + kh, Math.round(lev*.1), s - kh);
  // piirilevyviivat (1 px, pikselinä), aalto kulkee ylös
  const viivat = [[.15,.95,.15,.6,.35,.6],[.5,.95,.5,.45,.75,.45],[.85,.95,.85,.7,.65,.7],[.3,.95,.3,.8]];
  viivat.forEach((v, i) => {
    const a = .18 + .35 * Math.max(0, Math.sin(t*2.2 - i*1.3));
    ctx.fillStyle = `rgba(110,200,255,${a})`;
    for (let k=0;k<v.length-2;k+=2){ const x1 = Math.round(bx + v[k]*lev), y1 = Math.round(ft + v[k+1]*s), x2 = Math.round(bx + v[k+2]*lev), y2 = Math.round(ft + v[k+3]*s);
      ctx.fillRect(Math.min(x1,x2), Math.min(y1,y2), Math.abs(x2-x1) || 1, Math.abs(y2-y1) || 1); }
    ctx.fillStyle = `rgba(170,230,255,${Math.min(1, a*1.6)})`; ctx.fillRect(Math.round(bx + v[v.length-2]*lev) - 1, Math.round(ft + v[v.length-1]*s) - 1, 2, 2);
  });
  // kansi nousee suoraan ylös
  const ky = ft - ra;
  ctx.fillStyle = '#121017'; ctx.fillRect(bx - 1, ky, lev + 2, kh);
  ctx.fillStyle = 'rgba(255,170,110,.6)'; ctx.fillRect(bx - 1, ky, lev + 2, 1);           // auringonvalo kannen yläreunassa
  ctx.fillStyle = 'rgba(255,150,90,.55)'; ctx.fillRect(bx - 1, ky, 1, kh);
  // reunojen sykkivä valo (pikseliviivat)
  const syke = .25 + .3 * Math.sin(t * 1.8);
  ctx.fillStyle = `rgba(120,210,255,${syke})`;
  ctx.fillRect(bx, ft + kh, lev, 1); ctx.fillRect(bx + lev - 1, ft + kh, 1, s - kh);
  // ilmaperspektiivi: kevyt auringonlaskun usva samaan sävyyn kuin keskietäisyyden kerrokset
  ctx.fillStyle = 'rgba(190,110,90,.10)'; ctx.fillRect(bx - 1, ky, lev + 2, y0 - ky);
  // symbolit
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const m of tila.symbolit) {
    m.ika += dt;
    if (m.imu) { m.x += (m.kx - m.x) * Math.min(1, dt*7); m.y += (m.ky - m.y) * Math.min(1, dt*7); m.a = Math.max(0, m.a - dt*1.5); }
    else { m.x += m.vx*dt; m.y += m.vy*dt; m.vy *= Math.exp(-dt*.8); m.vx += Math.sin(m.ika*3 + m.v)*s*.05*dt; m.a = Math.min(1, m.ika*3) * (m.kesto ? Math.max(0, 1 - m.ika/m.kesto) : 1); }
    ctx.font = `700 ${m.koko}px "Courier New",monospace`; ctx.fillStyle = `rgba(200,240,255,${m.a})`;
    ctx.fillText(m.merkki, Math.round(m.x), Math.round(m.y));
  }
  ctx.restore();
  tila.symbolit = tila.symbolit.filter(m => m.a > .01 || m.ika < .4);
  // pöly juurella noustessa
  for (const p of tila.poly) { p.ika += dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += s*.3*dt;
    ctx.fillStyle = `rgba(150,140,120,${.5*(1 - p.ika/p.kesto)})`; ctx.fillRect(p.x, p.y, p.k, p.k); }
  tila.poly = tila.poly.filter(p => p.ika < p.kesto);
  ctx.restore();
  tila.rako = { x: bx + lev/2, y: ft };
}

function purkaus(n){
  const r = tila.rako; if (!r) return;
  for (let i=0;i<n;i++) tila.symbolit.push({ merkki: SYMBOLIT[(Math.random()*SYMBOLIT.length)|0], x: r.x + (Math.random()-.5)*s*.8, y: r.y,
    vx: (Math.random()-.5)*s*.5, vy: -s*(.4 + Math.random()*.7), ika: 0, v: Math.random()*6, koko: Math.max(7, Math.round(s*(.08 + Math.random()*.05))), a: 0 });
}
function imu(){ const r = tila.rako; tila.symbolit.forEach(m => { m.imu = true; m.kx = r.x + (Math.random()-.5)*s*.5; m.ky = r.y; }); }

// tapahtumat ajassa: nousu -> raotus -> purkaus -> imu + paukahdus; sen jälkeen hiljainen hurina
function ajoita(t, dt){
  const e = tila.e += dt;
  if (tila.vaihe === 'nousu') {
    if (!tila.jyrisi && e > .3) { tila.jyrisi = true; jyrina(2.2); sc.cameras.main.shake(2000, .0025); }
    tila.nousu = Math.min(1, Math.max(0, (e - .4) / 2)); tila.nousu = 1 - Math.pow(1 - tila.nousu, 3);
    if (e > .4 && e < 2.4 && Math.random() < dt*30) tila.poly.push({ x: TW/2 + (Math.random()-.5)*s*1.6, y: TH - 4, vx: (Math.random()-.5)*s*.6, vy: -s*(.2+Math.random()*.4), ika: 0, kesto: .9, k: 2 });
    if (e > 3) { tila.vaihe = 'vilkaisu'; tila.e = 0; }
  } else if (tila.vaihe === 'vilkaisu') {
    tila.kansi = e < .5 ? 0 : Math.min(1, (e - .5) / .5);
    if (e > .7 && !tila.purettu) { tila.purettu = true; purkaus(26); }
    if (e > .7 && e < 2.2 && Math.random() < dt*10) purkaus(1);
    if (e > 2.6 && !tila.imetty) { tila.imetty = true; imu(); }
    if (e > 3.1) tila.kansi = Math.max(0, 1 - (e - 3.1) / .12);
    if (e > 3.22 && !tila.suljettu) { tila.suljettu = true; kalahdus(); sc.cameras.main.shake(180, .006); }
    if (e > 3.6) { tila.vaihe = 'hurina'; tila.e = 0; }
  } else if (tila.vaihe === 'hurina') {
    // välillä kansi nytkähtää ja pari symbolia livahtaa ulos
    tila.kansi = Math.max(0, Math.sin(e * 1.1) > .97 ? .15 : tila.kansi - dt);
    if (Math.sin(e * 1.1) > .97 && Math.random() < dt*6) { const n = tila.symbolit.length; purkaus(1); if (tila.symbolit.length > n) tila.symbolit[n].kesto = 1.6; }
  }
}

function silmukka(ms){
  if (!tila) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  ajoita(ms/1000, dt);
  // piirretään vain kun laatikko on ruudulla (säästää tekstuurin päivitykset)
  const cam = sc.cameras.main, ruutuX = img.x - cam.scrollX * img.scrollFactorX;
  if (ruutuX > -TW && ruutuX < sc.scale.width + TW) { piirra(ms/1000, dt); tex.refresh(); }
  rafId = requestAnimationFrame(silmukka);
}

function aloita(vaihe){
  tila = { vaihe, e: 0, nousu: vaihe === 'nousu' ? 0 : 1, kansi: 0, symbolit: [], poly: [], rako: null };
  img.setVisible(true);
  cancelAnimationFrame(rafId); edellinen = performance.now(); rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaMustaLaatikko = function(p){
  if (!p || !PYSAHDYKSET_2D.some(q => q.mustaLaatikko)) return;
  const lx = laatikonX();
  if (p.mustaLaatikko) {
    if (!img && !luo()) return;
    aloita(tila ? 'vilkaisu' : 'nousu');          // eka kerta nousee, myöhemmin vain raottaa kantta
  } else if (p.x < lx && tila) {
    cancelAnimationFrame(rafId); tila = null; if (img) img.setVisible(false);   // osion alkua taaksepäin: pois
  }
};
})();
