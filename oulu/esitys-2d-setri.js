// ============================================================================
// SETRI MUUTTUU DATAKSI (2.10.2026, x:9350 "Tekoälyn ympäristöhinta").
// Gilgamesh (gilgamesh-kirves.png, 2 kehystä) hakkaa setriä (Jarnon
// kuvat/talltree.png) - jokaisella iskulla puu värähtää ja latvuksesta irtoaa
// pala, joka EI ole lastuja vaan hehkuvia sinisiä pikseleitä: ne nousevat ja
// ajelehtivat pois kuin data palvelimelle. Latvus harvenee isku iskulta, runko
// jää. (Piirilevyviivat runkoon jätetty pois - Jarnon valinta.)
//
// Käyttö esitys-data.js:ssä: `setri: true` (alkaa alusta) ja `setriJatkuu: true`
// seuraaville pysähdyksille, joilla Gilgamesh vielä näkyy (puu jatkaa samassa
// tilassa). Puu on Phaser-sprite SAMALLA scrollFactorilla ja syvyydellä kuin
// Gilgamesh (asettuu hänen oikealle puolelleen joka ruutu), latvuksen
// kuluminen = CanvasTexture, pikselit omalla kanvaasilla tekstin alla (z 4).
// Isku tunnistetaan Gilgameshin animaatiokehyksen vaihdosta (kehys 1 = isku).
// ============================================================================
(function(){
'use strict';
const PUU = new Image(); PUU.src = 'kuvat/talltree.png';
const GIL = 'gilgamesh-kirves.png';
const TW = 384, TH = 688;                       // puun tekstuurin koko (pienennetty)
const LATVA = 0.38;                             // latvuksen alaraja (osuus puun korkeudesta)
const MAX_ISKUT = 26;                           // tämän jälkeen latvus ei enää kulu

const cv = document.createElement('canvas');
cv.id = 'setri';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

let aktiivinen = false, rafId = 0, sc = null, gil = null, puu = null, tex = null, tctx = null;
let iskut = 0, edKehys = -1, varina = 0, pikselit = [], edT = 0;

function etsiGil(){ return sc.children.list.find(o => o.texture && String(o.texture.key).includes(GIL)) || null; }

function piirraPuuAlusta(){
  tctx.clearRect(0, 0, TW, TH);
  tctx.imageSmoothingEnabled = true;
  tctx.drawImage(PUU, 0, 0, TW, TH);
  tex.refresh();
}
function valmista(){
  sc = window.__paaKohtaus; if (!sc || !PUU.complete || !PUU.naturalWidth) return false;
  gil = etsiGil(); if (!gil) return false;
  if (!sc.textures.exists('setri-tx')) { tex = sc.textures.createCanvas('setri-tx', TW, TH); tctx = tex.getContext(); }
  else { tex = sc.textures.get('setri-tx'); tctx = tex.getContext(); }
  if (!puu || !puu.scene) puu = sc.add.image(0, 0, 'setri-tx').setOrigin(0.5, 1);
  puu.setScrollFactor(gil.scrollFactorX, gil.scrollFactorY).setDepth(gil.depth - 0.001).setVisible(true).setAlpha(1);
  return true;
}

// isku: latvuksesta irtoaa pala pikseleinä
function isku(){
  varina = 1;
  if (iskut >= MAX_ISKUT) return;
  iskut++;
  const data = tctx.getImageData(0, 0, TW, Math.round(TH*LATVA)).data;
  let x = 0, y = 0;
  for (let yritys = 0; yritys < 60; yritys++) {        // satunnainen piste, jossa on vielä latvusta
    x = Math.floor(Math.random()*TW); y = Math.floor(Math.random()*TH*LATVA);
    if (data[(y*TW + x)*4 + 3] > 100) break;
  }
  const b = puu.getBounds(), sk = W / sc.scale.width, cam = sc.cameras.main;
  const sx = (b.x - cam.scrollX*puu.scrollFactorX) * sk, sy = (b.y - cam.scrollY*puu.scrollFactorY) * sk;
  const kerroin = b.width * sk / TW, palat = 7 + Math.floor(Math.random()*5);
  tctx.save(); tctx.globalCompositeOperation = 'destination-out';
  for (let i=0;i<palat;i++) {
    const px = x + (Math.random()-.5)*46, py = y + (Math.random()-.5)*34, k = 6 + Math.random()*8;
    tctx.fillRect(px - k/2, py - k/2, k, k);
    pikselit.push({ x: sx + px*kerroin, y: sy + py*kerroin, vx: (Math.random()*.6 + .2)*H*.03, vy: -(Math.random()*.5 + .5)*H*.05,
      k: Math.max(3, k*kerroin*.8), ika: 0, kesto: 3 + Math.random()*2, vaihe: Math.random()*6 });
  }
  tctx.restore(); tex.refresh();
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms/1000, dt = Math.min(.05, t - edT || 0); edT = t;
  if (!gil || !gil.scene) gil = etsiGil();
  if (gil && puu) {
    // puu Gilgameshin oikealle puolelle, juuret hänen jalkojensa tasolle
    const g = gil.getBounds(), korkeus = g.height * 1.75;
    puu.setDisplaySize(korkeus * TW / TH, korkeus);
    puu.setPosition(g.right + g.width*.02, g.bottom - g.height*.015);
    puu.setVisible(gil.visible);
    // isku = siirtymä kehykseen 1
    const kehys = gil.anims && gil.anims.currentFrame ? gil.anims.currentFrame.index : 1;
    if (kehys !== edKehys) { if (kehys === 2 && edKehys !== -1) isku(); edKehys = kehys; }
    varina = Math.max(0, varina - dt*2.5);
    puu.setAngle(Math.sin(t*28) * 1.1 * varina);
  }
  // datapikselit
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  ctx.globalCompositeOperation = 'lighter';
  for (const p of pikselit) {
    p.ika += dt; p.x += (p.vx + Math.sin(p.ika*1.6 + p.vaihe)*H*.01)*dt; p.y += p.vy*dt; p.vy *= Math.exp(-.25*dt);
    const e = p.ika / p.kesto, a = (1 - e) * (.65 + .35*Math.sin(p.ika*9 + p.vaihe));
    ctx.fillStyle = `rgba(90,190,255,${(a*.35).toFixed(3)})`; ctx.fillRect(p.x - p.k, p.y - p.k, p.k*2, p.k*2);
    ctx.fillStyle = `rgba(170,230,255,${a.toFixed(3)})`; ctx.fillRect(p.x - p.k/2, p.y - p.k/2, p.k, p.k);
  }
  ctx.globalCompositeOperation = 'source-over';
  pikselit = pikselit.filter(p => p.ika < p.kesto);
  rafId = requestAnimationFrame(silmukka);
}

function kaynnista(alusta){
  if (!valmista()) return false;
  if (alusta) { piirraPuuAlusta(); iskut = 0; pikselit = []; }
  edKehys = -1; aktiivinen = true; cv.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
  return true;
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaSetri = function(p){
  if (p && p.setri) { kaynnista(true); return; }
  if (p && p.setriJatkuu) { if (!aktiivinen) kaynnista(true); return; }
  if (!aktiivinen) return;
  aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
  if (puu && puu.scene) puu.setVisible(false);
};
})();
