// ============================================================================
// MIKAEL (TF 16.10.2026, Jarno: "Mikael could walk also to that scene, follow
// next and walk away then, when clicked away? try to use all animation models").
// Spritet paistettu assets/2d/mikael-exported-model.glb:stä (test-glb-render.html,
// pad 1.3 kaikissa = sama mittakaava). Walk/Sprint kuvattu sivulta kasvot
// VASEMMALLE, Idle/Interact edestä.
//   x:2300 (sitaatti 1)  kävelee sisään oikealta (Walk) -> kuuntelee (Idle_Listening)
//   x:2350 (sitaatti 2)  kävelee kameran mukana paikalleen -> elehtii (Interact)
//   muu pysähdys         juoksee pois oikealle (Sprint) ja katoaa
// Säädöt: PAIKKA (osuus ruudun leveydestä), KOKO (suhteessa ketun korkeuteen).
// ============================================================================
(function(){
'use strict';
const PYSAHDYKSET_MIKAEL = { 2300: 'idle', 2350: 'interact' };
const PAIKKA = 0.76;          // seisomapaikka, osuus ruudun leveydestä
const KOKO = 1.15;            // Mikaelin korkeus = ketun näkyvä korkeus x KOKO
const KAVELY = 0.28;          // kävelynopeus, ruudun leveyksiä sekunnissa
const JUOKSU = 0.9;           // juoksunopeus pois
const KLIPIT = {
  walk:     { tiedosto: 'mikael-walk.png',     w: 287, h: 648, n: 12, fps: 9 },
  sprint:   { tiedosto: 'mikael-sprint.png',   w: 420, h: 583, n: 8,  fps: 12 },
  idle:     { tiedosto: 'mikael-idle.png',     w: 177, h: 594, n: 12, fps: 7 },
  interact: { tiedosto: 'mikael-interact.png', w: 207, h: 599, n: 16, fps: 6 },
};
const VIITE_H = 594;          // idle-kehyksen korkeus = mittakaavan perusta (sama paistomittakaava kaikissa)

let sc = null, m = null, valmis = false, tila = 'poissa';   // poissa | paikalla | poistuu

function odota(){
  sc = window.__paaKohtaus;
  if (!sc || !sc.hahmo) { setTimeout(odota, 300); return; }
  Object.entries(KLIPIT).forEach(([k, c]) => sc.load.spritesheet('mikael-' + k, 'assets/2d/sprites/' + c.tiedosto, { frameWidth: c.w, frameHeight: c.h }));
  sc.load.once('complete', luo);
  sc.load.start();
}

function luo(){
  Object.entries(KLIPIT).forEach(([k, c]) => {
    if (!sc.anims.exists('mikael:' + k)) sc.anims.create({ key: 'mikael:' + k, frames: sc.anims.generateFrameNumbers('mikael-' + k, { start: 0, end: c.n - 1 }), frameRate: c.fps, repeat: -1 });
  });
  m = sc.add.sprite(0, 0, 'mikael-idle').setOrigin(0.5, 1).setDepth(98).setVisible(false);
  valmis = true;
  sc.events.on('update', paivita);
}

function soita(k){ if (m.anims.currentAnim?.key !== 'mikael:' + k) m.play('mikael:' + k); }

function paivita(aika, dt){
  if (!valmis || !sc.hahmo) return;
  const W = sc.scale.width, cam = sc.cameras.main, kettu = sc.hahmo;
  const p = (typeof PYSAHDYKSET_2D !== 'undefined' && typeof indeksi !== 'undefined') ? PYSAHDYKSET_2D[indeksi] : null;
  const klippi = p ? PYSAHDYKSET_MIKAEL[p.x] : null;
  const esikatselu = (typeof ESIKATSELU !== 'undefined' && ESIKATSELU);
  m.y = kettu.y;
  m.setScale((kettu.displayHeight * KOKO) / VIITE_H);
  const kohde = cam.scrollX + W * PAIKKA;
  const s = dt / 1000;

  if (klippi) {
    if (tila !== 'paikalla') {                        // tulee sisään oikean reunan takaa
      if (tila === 'poissa') m.x = esikatselu ? kohde : cam.scrollX + W + m.displayWidth;
      tila = 'paikalla'; m.setVisible(true);
    }
    const ero = kohde - m.x;
    if (Math.abs(ero) > 3 && !esikatselu) {          // kävelee paikalleen (myös kun kamera siirtyy seuraavaan)
      const askel = Math.sign(ero) * Math.min(Math.abs(ero), W * KAVELY * s);
      m.x += askel;
      m.flipX = ero > 0;                              // walk-sprite katsoo vasemmalle
      soita('walk');
    } else {
      m.x = kohde; m.flipX = false;
      soita(klippi);
    }
    return;
  }

  if (tila === 'paikalla') tila = 'poistuu';
  if (tila === 'poistuu') {                           // juoksee pois oikealle
    m.flipX = true;
    soita('sprint');
    m.x += W * JUOKSU * s;
    if (esikatselu || m.x > cam.scrollX + W + m.displayWidth) { tila = 'poissa'; m.setVisible(false); m.stop(); }
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', odota); else odota();
})();
