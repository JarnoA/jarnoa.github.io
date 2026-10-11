// ============================================================================
// KÄVELY HALKI AIKOJEN (2.10.2026, x:12090 "Suurissa historiallisissa
// murroksissa tietyt inhimilliset ydintoiminnot säilyvät, mutta niiden muoto
// ja merkitys muuttuvat.").
//
// Käyttö esitys-data.js:ssä: `murros: true`.
// Historia: 1) pikselikäsi + välineet HYLÄTTY ("comical"). 2) koodilla piirretty
// ihmissiluetti HYLÄTTY ("human looks awful"). 3) NYT: oikeat spritet -
// Jarnon GLB (woman2-exported-model.glb, hiukset - 1. malli ilman hiuksia näytti androidilta; klippi Walk_Formal) paistettu
// test-glb-render.html:llä -> nainen-walk-raw.png -> tee-horisonttihahmo.py
// -> nainen-walk-usva.png (16 x 207x447, pad 1.2, katsoo vasemmalle -> peilataan), ja
// Jarnon robot.glb (klippi 2.25-4.35 s) -> robotti-walk-usva.png (20 x 282x402).
// T-800 kokeiltu ja hylätty: "too scary". Siluetit litteitä ja puhtaita
// (1. usvaversio "dirty, odd"), väri #A68D73 = kaukokukkulat (Jarno).
// Jättiläisnainen kävelee horisontissa, aikakaudet virtaavat ohi (tuulimylly →
// höyryveturi → tehtaanpiiput), robotti tulee takaa isona,
// saavuttaa, hidastaa naisen tahtiin, silmä lämpenee ja ne kävelevät rinnakkain.
// Viesti: pelko → historia → ydin säilyy, muoto muuttuu.
//
// Piirto Phaserin SISÄÄN (reitti.js:n tapa): puolikkaan resoluution
// CanvasTexture syvyydelle 0.5 = kaukaisimman (Hills Layer 02) ja seuraavan
// kukkulan väliin, joten lähempi harjanne peittää jalat ja jättiläiset ovat
// "kaukana usvassa". Teksti siirretty ylös (pysty:'yla', koko 4).
// ============================================================================
(function(){
'use strict';
const ALKU = 1.0;
const VARI = '166,141,115';               // #A68D73 (Jarno 2.10.2026), sama kuin kaukokukkulat
// tiivistetty 2.10.2026 (Jarno: ehtiikö robotti näkyä?) - robotti rinnalla n. 10 s kohdalla
const T = { mylly: [1, 4.2], juna: [2.4, 6], tehdas: [3.8, 7.5], robo: 3.6, kohtaa: 6.8 };   // 8.10.2026 nopeutettu (Jarno: robotin tuloa joutuu odottamaan)

function lataa(src){ const im = new Image(); im.src = src; return im; }
const NAINEN = lataa('assets/2d/sprites/nainen-walk-usva.png'), NW = 207, NH = 447, NN = 16;
const ROBO = lataa('assets/2d/sprites/robotti-walk-usva.png'), RW = 282, RH = 402, RN = 20;   // Jarnon robot.glb, klippi 2.25-4.35 s = yksi askelpari
function kehys(kuva, w, h, i, x, gy, korkeus, alpha){   // peilattu (kävelee oikealle), jalat gy:ssä
  const kw = korkeus * w / h;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, gy); ctx.scale(-1, 1);
  ctx.drawImage(kuva, i*w, 0, w, h, -kw/2, -korkeus, kw, korkeus); ctx.restore();
  return kw;
}

let sc = null, tex = null, img = null, ctx = null, W = 0, H = 0;
let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0, tila = null;

function rakenna(){
  sc = window.__paaKohtaus; if (!sc || !sc.textures) return false;
  W = Math.round(sc.scale.width / 2); H = Math.round(sc.scale.height / 2);
  if (img) img.destroy(); if (sc.textures.exists('murros-tx')) sc.textures.remove('murros-tx');
  tex = sc.textures.createCanvas('murros-tx', W, H);
  img = sc.add.image(0, 0, 'murros-tx').setOrigin(0, 0).setScrollFactor(0).setScale(2).setDepth(0.5).setAlpha(0);
  ctx = tex.getContext();
  return true;
}

// ---------- äänet ----------
let ac = null, aaniPaalla = true;
function A(){ if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)(); return ac; }
function savel(f0, kesto, {tyyppi='sine', voim=.1, f1=null, viive=0}={}){
  if (!aaniPaalla) return; const a = A(), t = a.currentTime + viive;
  const o = a.createOscillator(), g = a.createGain();
  o.type = tyyppi; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + kesto);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(voim, t + Math.min(.3, kesto*.3)); g.gain.exponentialRampToValueAtTime(.0001, t + kesto);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + kesto + .05);
}
const jysahdys = (v) => savel(70, .45, { f1: 38, voim: v });

// ---------- apu ----------
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pehmea = e => e <= 0 ? 0 : e >= 1 ? 1 : e*e*(3 - 2*e);
function viiva(x1, y1, x2, y2, w){ ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function raaja(x, y, kulma1, kulma2, l1, l2, w1, w2){
  const kx = x + Math.sin(kulma1)*l1, ky = y + Math.cos(kulma1)*l1;
  const px = kx + Math.sin(kulma2)*l2, py = ky + Math.cos(kulma2)*l2;
  viiva(x, y, kx, ky, w1); viiva(kx, ky, px, py, w2);
  return { x: px, y: py };
}

// ---------- aikakausien siluetit ----------
function mylly(x, gy, k, t){
  ctx.beginPath(); ctx.moveTo(x - .14*k, gy); ctx.lineTo(x - .07*k, gy - .75*k); ctx.lineTo(x + .07*k, gy - .75*k); ctx.lineTo(x + .14*k, gy); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - .1*k, gy - .75*k); ctx.lineTo(x, gy - .86*k); ctx.lineTo(x + .1*k, gy - .75*k); ctx.fill();
  const cx = x + .02*k, cy = gy - .76*k;
  for (let i=0;i<4;i++) { const a = t*.8 + i*Math.PI/2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.fillRect(-.012*k, 0, .024*k, .42*k); ctx.fillRect(.012*k, .08*k, .07*k, .32*k); ctx.restore(); }
}
function juna(x, gy, k, t, savut){
  const y = gy - .1*k;
  ctx.fillRect(x - .5*k, y - .2*k, .62*k, .2*k);                 // kattila
  ctx.fillRect(x + .1*k, y - .34*k, .24*k, .34*k);               // ohjaamo
  ctx.fillRect(x + .06*k, y - .38*k, .32*k, .05*k);
  ctx.fillRect(x - .4*k, y - .34*k, .07*k, .15*k);               // piippu
  ctx.beginPath(); ctx.moveTo(x - .5*k, y); ctx.lineTo(x - .62*k, y + .06*k); ctx.lineTo(x - .5*k, y + .06*k); ctx.fill();
  for (const wx of [-.36, -.18, 0, .22]) { ctx.beginPath(); ctx.arc(x + wx*k, y + .02*k, .075*k, 0, 7); ctx.fill(); }
  ctx.fillRect(x + .38*k, y - .1*k, .5*k, .14*k);                // tenderi
  if (Math.random() < .5) savut.push({ x: x - .37*k, y: y - .36*k, r: .04*k, ika: 0 });
}
function tehdas(x, gy, k, t, savut){
  ctx.fillRect(x - .5*k, gy - .28*k, 1.0*k, .28*k);
  for (let i=0;i<4;i++) { ctx.beginPath(); ctx.moveTo(x - .5*k + i*.25*k, gy - .28*k); ctx.lineTo(x - .25*k + i*.25*k, gy - .4*k); ctx.lineTo(x - .25*k + i*.25*k, gy - .28*k); ctx.fill(); }
  for (const [px, h] of [[-.35, .85], [-.05, 1.0], [.3, .75]]) {
    ctx.fillRect(x + px*k, gy - h*k, .07*k, h*k);
    if (Math.random() < .35) savut.push({ x: x + (px + .035)*k, y: gy - h*k, r: .05*k, ika: 0 });
  }
}

// ---------- pääsilmukka ----------
function alusta(){ tila = { savut: [], askel: 0, sointu: false, edAskel: 0 }; seuraa = false; viite = null; }

// JATKUU SEURAAVALLE PYSÄHDYKSELLE (`murrosJatkuu: true`, x:12240): pari kävelee
// edelleen, ja kun kamera liikkuu, siluetit siirtyvät TÄSMÄLLEEN kaukaisimman
// kukkulakerroksen (taustakerrokset[0]) mukana - kuin jättiläiset kaukana.
// Viite otetaan joka ruutu niin kauan kuin ollaan murros-pysähdyksellä.
let seuraa = false, viite = null;
function siirto(){
  const L = sc && sc.taustakerrokset && sc.taustakerrokset[0]; if (!L) return 0;
  const tp = L.obj.tilePositionX, ts = L.obj.tileScaleX;
  if (!seuraa || viite === null) { viite = tp; return 0; }
  return -(tp - viite) * ts / 2;                      // /2: puolikkaan resoluution tekstuuri
}

function piirra(t, dt){
  ctx.clearRect(0, 0, W, H);
  ctx.save(); ctx.translate(siirto(), 0);
  const k = H * .5;                                    // jättiläisen korkeus (pää n. 0.3H, tekstin alla)
  const gy = H * .80;                                  // jalat lähemmän harjanteen takana
  const hx = W * .74, nopeus = W * .045;               // maisema virtaa vasemmalle tällä nopeudella
  const tt = t - ALKU;
  ctx.fillStyle = `rgb(${VARI})`; ctx.strokeStyle = `rgb(${VARI})`;
  const nakyvyys = (a, b) => pehmea((tt - a)/1.2) * (1 - pehmea((tt - b + 1.2)/1.2));
  const ohi = (a, alkuX) => alkuX - nopeus*(tt - a);

  // taustalla ohitse virtaavat aikakaudet (kauempana = pienempi, haaleampi)
  ctx.globalAlpha = .55 * nakyvyys(T.mylly[0], T.mylly[1]);
  if (ctx.globalAlpha > .01) mylly(ohi(T.mylly[0], W*.95), gy, k*.75, t);
  ctx.globalAlpha = .6 * nakyvyys(T.tehdas[0], T.tehdas[1]);
  if (ctx.globalAlpha > .01) tehdas(ohi(T.tehdas[0], W*1.05), gy, k*.6, t, tila.savut);
  ctx.globalAlpha = .6 * nakyvyys(T.juna[0], T.juna[1]);
  if (ctx.globalAlpha > .01) juna(W*(-.3) + W*.22*(tt - T.juna[0]), gy, k*.55, t, tila.savut);   // juna ohittaa ihmisen
  // savut
  for (const s of tila.savut) { s.ika += dt; s.x -= nopeus*.6*dt + 4*dt; s.y -= 9*dt; s.r += 6*dt; }
  tila.savut = tila.savut.filter(s => s.ika < 3.5);
  for (const s of tila.savut) { ctx.globalAlpha = .18*(1 - s.ika/3.5); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); }

  // robotti: nousee naisen takaa isompana, nopeammin askeltaen; saavuttaa,
  // pienenee lähes samaan mittakaavaan ja tahdistuu naisen kävelyyn
  const fN = Math.floor(tt * 9.6) % NN;
  if (tt >= T.robo && ROBO.complete && ROBO.naturalWidth) {
    const e = pehmea((tt - T.robo) / (T.kohtaa - T.robo));
    const rx = W*.46 + (hx - .24*k - W*.46) * e;                  // nousee usvasta naisen takaa vasemmalta
    const rk = k * (1.45 - .35*e);                                 // aluksi iso, lopuksi vähän naista isompi
    if (e < 1) { tila.askel += dt * 14; const a = Math.floor(tila.askel / 10); if (a !== tila.edAskel) { tila.edAskel = a; jysahdys(.06*(1 - e*.7)); } }
    const fR = e < 1 ? Math.floor(tila.askel) % RN : Math.floor(tt * 9.5) % RN;
    kehys(ROBO, RW, RH, fR, rx, gy, rk, .9 * pehmea((tt - T.robo)/1.5));
    if (e >= 1 && !tila.sointu) { tila.sointu = true; savel(262, 3, { voim:.04 }); savel(330, 3, { voim:.035, viive:.15 }); savel(392, 3.2, { voim:.03, viive:.3 }); }
  }
  // nainen (aina sama, kävelee koko ajan)
  kehys(NAINEN, NW, NH, fN, hx, gy, k, pehmea(tt / 1.5));
  ctx.globalAlpha = 1;
  ctx.restore();
  // usva: alaosa haalistuu kohti harjannetta
  ctx.save(); ctx.globalCompositeOperation = 'destination-out';
  const u = ctx.createLinearGradient(0, gy - .32*k, 0, gy);
  u.addColorStop(0, 'rgba(0,0,0,0)'); u.addColorStop(1, 'rgba(0,0,0,.75)');
  ctx.fillStyle = u; ctx.fillRect(0, gy - .32*k, W, .32*k + 2); ctx.restore();
  tex.refresh();
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku)/1000, dt = Math.min(.05, t - edellinen || 0); edellinen = t;
  if (img) img.setAlpha(Math.min(1, t / 1.0));
  piirra(t, dt);
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaMurros = function(p){
  const paalle = !!(p && p.murros);
  if (p && p.murrosJatkuu && aktiivinen) { seuraa = true; return; }   // pari kävelee eteenpäin, ei uutta alkua
  if (!paalle) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId);
    if (img && img.scene) { const i = img; i.scene.tweens.add({ targets: i, alpha: 0, duration: 500, onComplete: () => { i.destroy(); } }); }
    img = null;
    return;
  }
  aaniPaalla = !((typeof ESIKATSELU !== 'undefined') && ESIKATSELU);
  if (!rakenna()) return;
  alusta();
  aktiivinen = true; alku = performance.now(); edellinen = 0;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
