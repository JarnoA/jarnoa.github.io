// ============================================================================
// LOHIKÄÄRMEEN SYÖKSY (2.10.2026, x:10290 "Lukija elää tuhat elämää ennen
// kuolemaansa..." - George R. R. Martin, Lohikäärmetanssi).
//
// Käyttö esitys-data.js:ssä: `lohikaarme: true`. Moottorin oma taivaan
// lohikäärme (esitys-2d-hahmot.js, assets/2d/sprites/dragon-fly.png, katsoo
// VASEMMALLE) pysyy paikallaan ensin; 2 s päästä se kääntyy ja nousee pois
// oikeasta yläkulmasta, sitten ISO lohikäärme syöksyy oikealta vasemmalle
// ruudun alakolmanneksessa (tekstikortin ALLA, z 4) siivet lyöden. Varjo
// pyyhkäisee maata, opas painuu kyykkyyn, ja siipien tuuli nostaa maasta
// kirjan sivuja, jotka leijailevat hitaasti alas ("tuhat elämää"). Lopuksi
// taivaan pieni lohikäärme häivyttyy takaisin paikalleen.
// Yksi syöksy per pysähdys (Jarno 15.9.2026: jatkuva iso liike häiritsee).
// ============================================================================
(function(){
'use strict';
const KW = 325, KH = 363, LYONTI = [6,7,8,9,10,11,12,13], LIITO = [0,1,2,3,4,5];
const T_KAANTO = 2.0, T_POIS = .7, T_SYOKSY = 2.9, SYOKSY = 2.3, T_PALUU = 8.5;

const kuva = new Image(); kuva.src = 'assets/2d/sprites/dragon-fly.png';

const cv = document.createElement('canvas');
cv.id = 'lohikaarme';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .4s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1, gy = 0;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight; gy = H * .905;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', koko); koko();

// ---------- äänet ----------
let ac = null, aaniPaalla = true;
function A(){ if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)(); return ac; }
function suhahdus(kesto, f0, f1, voim, viive=0){
  if (!aaniPaalla) return; const a = A(), t = a.currentTime + viive;
  const b = a.createBuffer(1, Math.ceil(a.sampleRate*kesto), a.sampleRate), d = b.getChannelData(0);
  for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
  const src = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  src.buffer = b; fl.type = 'bandpass'; fl.Q.value = 1.2;
  fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + kesto);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(voim, t + kesto*.45); g.gain.exponentialRampToValueAtTime(.0001, t + kesto);
  src.connect(fl).connect(g).connect(a.destination); src.start(t);
}
function jysahdys(viive){
  if (!aaniPaalla) return; const a = A(), t = a.currentTime + viive;
  const o = a.createOscillator(), g = a.createGain();
  o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(40, t + .25);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .3);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + .35);
}

// ---------- moottorin taivaslohikäärme ----------
let taivas = null, taivasAlpha = 1;
function etsiTaivas(){
  const sc = window.__paaKohtaus; if (!sc) return null;
  // esitys-2d.html lataa sen avaimella 'hahmo-sheet:assets/2d/sprites/dragon-fly.png'
  return sc.children.list.find(o => o.texture && String(o.texture.key).includes('dragon-fly')) || null;
}
function ruutuPaikka(o){
  const sc = window.__paaKohtaus, sk = W / sc.scale.width, b = o.getBounds();
  return { x: b.centerX * sk, y: b.centerY * sk, h: b.height * sk };
}

// ---------- tila ----------
let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;
let tila, sivut;

function alusta(){
  tila = { kaanto: null, sivuX: [], kyykky: false, aanet: false };
  sivut = [];
  for (let i=0;i<9;i++) tila.sivuX.push(W*(.92 - i*.1) + (Math.random()-.5)*W*.04);
}

function piirraKehys(i, x, y, h, peilaa, alpha){
  if (!kuva.complete || !kuva.naturalWidth) return;
  const w = h * KW / KH;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); if (peilaa) ctx.scale(-1, 1);
  ctx.drawImage(kuva, i*KW, 0, KW, KH, -w/2, -h/2, w, h); ctx.restore();
}

function uusiSivu(x){
  sivut.push({ x, y: gy - H*.01, vx: -W*(.05 + Math.random()*.12), vy: -H*(.55 + Math.random()*.45),
    kulma: Math.random()*6, vk: (Math.random()-.5)*6, vaihe: Math.random()*6, ika: 0,
    k: H*(.022 + Math.random()*.014), varitys: Math.random() < .5 ? '#f4ecd8' : '#ebe0c4' });
}
function piirraSivu(p){
  const flip = Math.cos(p.ika*3.2 + p.vaihe);
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.kulma); ctx.scale(Math.max(.12, Math.abs(flip)), 1);
  const w = p.k, h = p.k*1.35, a = Math.min(1, (p.loppu || 99) );
  ctx.globalAlpha = Math.min(1, a);
  ctx.fillStyle = flip > 0 ? p.varitys : '#d8cbb0'; ctx.fillRect(-w/2, -h/2, w, h);
  ctx.fillStyle = 'rgba(90,80,70,.55)';
  for (let r=0;r<5;r++) ctx.fillRect(-w*.35, -h*.32 + r*h*.14, w*(r === 4 ? .4 : .7), Math.max(1, h*.03));
  ctx.restore(); ctx.globalAlpha = 1;
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku)/1000, dt = Math.min(.05, t - edellinen || 0); edellinen = t;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H); ctx.imageSmoothingEnabled = true;
  if (!taivas || !taivas.scene) taivas = etsiTaivas();

  // 1) taivaan lohikäärme kääntyy ja nousee pois oikealle ylös
  if (t >= T_KAANTO && !tila.kaanto && taivas) {
    tila.kaanto = ruutuPaikka(taivas); taivasAlpha = taivas.alpha; taivas.setAlpha(0);
    suhahdus(.8, 600, 1500, .05);
  }
  if (tila.kaanto && t < T_KAANTO + T_POIS) {
    const e = (t - T_KAANTO) / T_POIS, ee = e*e, k = tila.kaanto;
    piirraKehys(LYONTI[Math.floor(t*16) % 8], k.x + ee*W*.6, k.y - ee*H*.3, k.h*(1 - e*.3), true, 1);
  }

  // 2) iso syöksy oikealta vasemmalle alakolmanneksessa
  const e2 = (t - T_SYOKSY) / SYOKSY;
  if (e2 >= 0 && !tila.aanet) {
    tila.aanet = true; suhahdus(SYOKSY*.95, 250, 900, .22);
    for (let i=0;i<5;i++) jysahdys(i*.42 + .15);
  }
  if (e2 >= 0 && e2 <= 1) {
    const x = W*1.35 - e2*W*1.85;
    const y = H*.80 - Math.sin(e2*Math.PI)*H*.06;
    const h = H*(.48 + Math.sin(e2*Math.PI)*.14);                 // lähestyy ja loittonee
    // varjo maassa
    const vg = ctx.createRadialGradient(x, gy, 0, x, gy, h*.6);
    vg.addColorStop(0, 'rgba(10,8,14,.38)'); vg.addColorStop(1, 'rgba(10,8,14,0)');
    ctx.save(); ctx.translate(0, gy); ctx.scale(1, .16); ctx.translate(0, -gy); ctx.fillStyle = vg; ctx.fillRect(x - h*.6, gy - h*.6, h*1.2, h*1.2); ctx.restore();
    piirraKehys(LYONTI[Math.floor(t*12) % 8], x, y, h, false, 1);
    // sivut nousevat siipien tuulesta kun lohikäärme ohittaa kohdan
    while (tila.sivuX.length && x < tila.sivuX[0]) { const sx = tila.sivuX.shift(); uusiSivu(sx); if (Math.random() < .6) uusiSivu(sx + W*.02); }
    // opas painuu kyykkyyn kun lohikäärme on sen kohdalla
    const sc = window.__paaKohtaus, opas = sc && sc.hahmo;
    if (opas) {
      const ox = (opas.x - sc.cameras.main.scrollX) * (W / sc.scale.width);
      const lahella = Math.abs(x - ox) < W*.18;
      if (lahella && !tila.kyykky) { tila.kyykky = { sy: opas.scaleY, y: opas.y, dh: opas.displayHeight, oy: opas.originY };
        opas.setScale(opas.scaleX, tila.kyykky.sy*.72); opas.y = tila.kyykky.y + tila.kyykky.dh*.28*(1 - tila.kyykky.oy); }
      else if (!lahella && tila.kyykky && tila.kyykky !== 'ohi') palautaOpas();
    }
  }

  // 3) sivut leijailevat alas
  for (const p of sivut) {
    p.ika += dt;
    p.vy += H*.9*dt; p.vy *= Math.exp(-3.2*dt); p.vx *= Math.exp(-1.2*dt);
    if (p.vy > 0) p.vy = Math.min(p.vy, H*.05);                    // putoaa hitaasti kuin paperi
    p.x += (p.vx + Math.sin(p.ika*2.1 + p.vaihe)*W*.025)*dt; p.y += p.vy*dt;
    p.kulma += p.vk*dt*(p.vy > 0 ? .3 : 1);
    if (p.y > gy) { p.y = gy; p.vy = 0; p.vx = 0; p.vk = 0; p.maassa = (p.maassa || 0) + dt; p.loppu = 1 - p.maassa/1.5; }
    piirraSivu(p);
  }
  sivut = sivut.filter(p => !(p.maassa > 1.5));

  // 4) taivaan lohikäärme palaa
  if (taivas && t >= T_PALUU && taivas.alpha < taivasAlpha) taivas.setAlpha(Math.min(taivasAlpha, (t - T_PALUU)/1.2 * taivasAlpha));

  rafId = requestAnimationFrame(silmukka);
}

function palautaOpas(){
  const sc = window.__paaKohtaus, opas = sc && sc.hahmo, k = tila && tila.kyykky;
  if (opas && k && k !== 'ohi') { opas.setScale(opas.scaleX, k.sy); opas.y = k.y; }
  if (tila) tila.kyykky = 'ohi';
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaLohikaarme = function(p){
  const paalle = !!(p && p.lohikaarme);
  if (!paalle) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    palautaOpas();
    if (taivas && taivas.scene) taivas.setAlpha(taivasAlpha);
    return;
  }
  const esikatselu = (typeof ESIKATSELU !== 'undefined') && ESIKATSELU;
  aaniPaalla = !esikatselu;
  koko(); alusta();
  taivas = etsiTaivas(); taivasAlpha = taivas ? (taivas.alpha || 1) : 1;
  aktiivinen = true; alku = performance.now(); edellinen = 0; cv.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
