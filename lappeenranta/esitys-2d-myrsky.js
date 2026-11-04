// ============================================================================
// TUNNEMYRSKY (3.10.2026, x:8340 "Tunteita herättävä sisältö saa meidät
// skrollaamaan ja viipymään alustalla pidempään.") - Jarnon valinta C:
//  B) naisen hiukset (kuvat/storm.png) aaltoilevat hitaasti myrskyssä - keho
//     pysyy paikallaan. Tekniikka: kuva pilkotaan pieniin ruutuihin, joita
//     siirretään pehmeän siirtymäkentän mukaan (paino kasvaa pään keskipisteestä
//     ulospäin ja häviää vartalon kohdalla), CanvasTexture ~30 fps.
//  A) 7 pientä ihmistä (kuvat/stormp.png, leikattu erikseen) liukuvat
//     alkupaikoiltaan myrskyyn ja heiluvat hitaasti laajoissa kaarissa pään
//     yli siluetin ulkopuolella, kieppuen. Välillä yksi irtoaa ulospäin - ja vetäytyy takaisin.
//     ("viipymään alustalla pidempään")
//
// Käyttö esitys-data.js:ssä: `myrsky: true`. Alkuperäiset kuvat piilotetaan
// (alpha 0) ja korvataan omilla Phaser-objekteilla samalla scrollFactorilla ja
// syvyydellä. Poistuttaessa ihmiset liukuvat takaisin alkupaikoilleen (1.2 s),
// sitten alkuperäiset palautetaan. Ei ääniä.
// ============================================================================
(function(){
'use strict';
const NAINEN = 'kuvat/storm.png', IHMISET = 'kuvat/stormp.png';
// pienten ihmisten rajat stormp.png:ssä (2000x438), mitattu 3.10.2026
const LAATIKOT = [[0,0,72,87],[1331,134,74,70],[1397,183,78,83],[604,221,79,72],[1927,226,73,96],[990,245,75,82],[1146,326,82,112]];
// Alkuperäinen väri säilytetään (Jarno 3.10.2026: "way they were was good") - näkyvyys
// hoidetaan pitämällä ihmiset naisen siluetin ulkopuolella (laajat kaaret).
const PAA = { x: 0.57, y: 0.33 };   // pään keskipiste storm.png:n osuuksina
const RUUTU = 12, AALTO = 0.012;    // ruutukoko tekstuuripikseleinä, aallon amplitudi (osuus korkeudesta)

let sc = null, nainen = null, ihmiset = null, oma = null, tex = null, tctx = null, lahde = null;
let hahmot = [], tila = 'pois', t = 0, paluu = 0, edPiirto = 0, tyhjat = null;
let tw = 0, th = 0;
const kuvaN = new Image(); kuvaN.src = NAINEN;
const kuvaI = new Image(); kuvaI.src = IHMISET;

function etsi(polku){ return sc.children.list.find(o => o.texture && String(o.texture.key).endsWith(polku)) || null; }
const sstep = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u*u*(3 - 2*u); };

function valmistaTekstuuri(){
  th = Math.min(kuvaN.naturalHeight, Math.round(sc.scale.height * 0.7));
  tw = Math.round(th * kuvaN.naturalWidth / kuvaN.naturalHeight);
  lahde = document.createElement('canvas'); lahde.width = tw; lahde.height = th;
  const lc = lahde.getContext('2d'); lc.imageSmoothingEnabled = true; lc.drawImage(kuvaN, 0, 0, tw, th);
  // tyhjät ruudut ohitetaan joka kehys
  const d = lc.getImageData(0, 0, tw, th).data, nx = Math.ceil(tw / RUUTU), ny = Math.ceil(th / RUUTU);
  tyhjat = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    let tyhja = 1;
    for (let y = j*RUUTU; y < Math.min(th, (j+1)*RUUTU) && tyhja; y += 2)
      for (let x = i*RUUTU; x < Math.min(tw, (i+1)*RUUTU); x += 2) if (d[(y*tw + x)*4 + 3] > 10) { tyhja = 0; break; }
    tyhjat[j*nx + i] = tyhja;
  }
  const avain = 'myrsky-nainen';
  if (sc.textures.exists(avain)) sc.textures.remove(avain);
  tex = sc.textures.createCanvas(avain, tw, th); tctx = tex.getContext();
  tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
}

function piirraHiukset(){
  tctx.clearRect(0, 0, tw, th);
  const nx = Math.ceil(tw / RUUTU), ny = Math.ceil(th / RUUTU), A = AALTO * th, v = 1;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    if (tyhjat[j*nx + i]) continue;
    const x = i*RUUTU, y = j*RUUTU, ux = (x + RUUTU/2) / tw, uy = (y + RUUTU/2) / th;
    const r = Math.hypot((ux - PAA.x) * tw / th, uy - PAA.y);
    const w = sstep(0.10, 0.38, r) * (1 - sstep(0.42, 0.62, uy));
    let dx = 0, dy = 0;
    if (w > 0.001) {
      dx = Math.round(A * w * Math.sin(t*0.55 + uy*6 + ux*2));
      dy = Math.round(A * 0.5 * w * Math.cos(t*0.42 + ux*5 - uy*2));
    }
    // 1 px limitys estää saumat
    tctx.drawImage(lahde, x - v, y - v, RUUTU + 2*v, RUUTU + 2*v, x - v + dx, y - v + dy, RUUTU + 2*v, RUUTU + 2*v);
  }
  tex.refresh();
}

function teeIhmistekstuurit(){
  LAATIKOT.forEach((b, i) => {
    const avain = 'myrsky-ih-' + i;
    if (sc.textures.exists(avain)) return;
    const c = document.createElement('canvas'); c.width = b[2]; c.height = b[3];
    const g = c.getContext('2d'); g.drawImage(kuvaI, b[0], b[1], b[2], b[3], 0, 0, b[2], b[3]);
    sc.textures.addCanvas(avain, c).setFilter(Phaser.Textures.FilterMode.LINEAR);
  });
}

// ihmisen alkuperäinen paikka (stormp:n scrollFactorilla) muunnettuna naisen
// scrollFactorin maailmaan - lasketaan joka kehys, koska kuvat liikkuvat eri tahtiin
function alkuPaikka(b){
  const cam = sc.cameras.main, sk = ihmiset.displayHeight / 438;
  const iv = ihmiset.x - ihmiset.originX * ihmiset.displayWidth, iy = ihmiset.y - ihmiset.originY * ihmiset.displayHeight;
  const ruutuX = iv + (b[0] + b[2]/2) * sk - cam.scrollX * ihmiset.scrollFactorX;
  const ruutuY = iy + (b[1] + b[3]/2) * sk - cam.scrollY * ihmiset.scrollFactorY;
  return [ruutuX + cam.scrollX * nainen.scrollFactorX, ruutuY + cam.scrollY * nainen.scrollFactorY];
}

// pään keskipiste maailmakoordinaateissa (naisen scrollFactorilla)
function paanKeskus(){
  return { x: nainen.x + (PAA.x - nainen.originX) * nainen.displayWidth, y: nainen.y + (PAA.y - nainen.originY) * nainen.displayHeight };
}

function aloita(){
  sc = window.__paaKohtaus; if (!sc || !kuvaN.complete || !kuvaI.complete) return false;
  nainen = etsi(NAINEN); ihmiset = etsi(IHMISET); if (!nainen || !ihmiset) return false;
  if (!tex || !sc.textures.exists('myrsky-nainen')) valmistaTekstuuri();
  teeIhmistekstuurit();
  if (oma) oma.destroy(); hahmot.forEach(h => h.img.destroy()); hahmot = [];
  oma = sc.add.image(nainen.x, nainen.y, 'myrsky-nainen').setOrigin(nainen.originX, nainen.originY)
    .setScrollFactor(nainen.scrollFactorX, nainen.scrollFactorY).setDepth(nainen.depth);
  oma.setDisplaySize(nainen.displayWidth, nainen.displayHeight);
  const sk = ihmiset.displayHeight / 438;
  const K = paanKeskus();
  hahmot = LAATIKOT.map((b, i) => {
    const [x0, y0] = alkuPaikka(b);
    const img = sc.add.image(x0, y0, 'myrsky-ih-' + i).setScale(sk)
      .setScrollFactor(nainen.scrollFactorX, nainen.scrollFactorY).setDepth(nainen.depth + 0.001);
    return { img, b,
      // kaaret pään yli siluetin ulkopuolella: keskus hieman pään yläpuolella
      rx: (0.62 + 0.05*i) * nainen.displayWidth, ry: (0.50 + 0.035*i) * nainen.displayHeight,
      laaja: (0.55 + 0.03*i) * Math.PI, nopeus: (2*Math.PI) / (22 + i*3.5), pyor: (Math.random() < .5 ? -1 : 1) * (0.25 + Math.random()*0.3),
      vaihe: Math.random()*6 };
  });
  nainen.setAlpha(0); ihmiset.setAlpha(0);
  tila = 'paalla'; t = 0; edPiirto = -1;
  sc.events.on('postupdate', paivita);
  return true;
}

let seurIrti = 9, irtoaja = -1, irtiAlku = 0;
function paivita(aika, dtMs){
  if (!oma || !oma.scene) return;
  const dt = Math.min(0.05, dtMs / 1000); t += dt;
  oma.setPosition(nainen.x, nainen.y);
  if (t - edPiirto > 1/30) { piirraHiukset(); edPiirto = t; }
  // irtautuja: yksi kerrallaan ulos ja takaisin
  if (tila === 'paalla' && t > seurIrti) { irtoaja = Math.floor(Math.random()*hahmot.length); irtiAlku = t; seurIrti = t + 10 + Math.random()*4; }
  const K = paanKeskus();
  const sisaan = sstep(0, 4, t);                        // alkupaikoilta pyörteeseen 4 s
  if (tila === 'paluu') paluu = Math.min(1, paluu + dt / 1.2);
  hahmot.forEach((h, i) => {
    let irti = 0;
    if (i === irtoaja) { const u = (t - irtiAlku); irti = u < 3 ? sstep(0, 3, u) : 1 - sstep(3, 7.5, u); }
    // heiluu kaarena pään yli puolelta toiselle (-PI/2 = suoraan ylhäällä), ei
    // kierrä vartalon editse
    const k = -Math.PI/2 + h.laaja * Math.sin(h.nopeus * t + h.vaihe);
    const kerroin = 1 + irti * 0.4;
    const px = K.x + Math.cos(k) * h.rx * kerroin;
    const py = K.y - 0.05 * nainen.displayHeight + Math.sin(k) * h.ry * kerroin + Math.sin(t*0.7 + h.vaihe) * h.ry * 0.05;
    const m = sisaan * (1 - sstep(0, 1, paluu));
    const [x0, y0] = alkuPaikka(h.b);
    h.img.setPosition(x0 + (px - x0) * m, y0 + (py - y0) * m);
    h.img.setRotation(h.pyor * t * m + Math.sin(t*0.5 + h.vaihe) * 0.2 * m);
  });
  if (tila === 'paluu' && paluu >= 1) lopeta();
}

function lopeta(){
  if (sc) sc.events.off('postupdate', paivita);
  if (oma) oma.destroy(); oma = null;
  hahmot.forEach(h => h.img.destroy()); hahmot = [];
  if (nainen) nainen.setAlpha(1); if (ihmiset) ihmiset.setAlpha(1);
  tila = 'pois'; paluu = 0; irtoaja = -1; seurIrti = 9;
}

window.naytaMyrsky = function(p){
  if (p && p.myrsky) {
    if (tila === 'pois') { if (!aloita()) setTimeout(() => { if (tila === 'pois') aloita(); }, 500); }
    else if (tila === 'paluu') { tila = 'paalla'; paluu = 0; }
  } else if (tila === 'paalla') { tila = 'paluu'; paluu = 0; }
};
})();
