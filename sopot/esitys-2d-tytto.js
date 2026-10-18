// ============================================================================
// TYTTÖ - TOINEN OPAS (TF 13.10.2026, Jarno: "When girl appears first time, we
// create a second guide, that girl to walk with us"). Jämsän kuudesluokkalainen
// ilmestyy pysähdyksellä TYTTO_ALKAA_X ja kulkee oppaan (ketun) rinnalla loppuun
// asti: jolkottaa kun opas kävelee, seisoo kun opas pysähtyy.
// Spritet: assets/2d/sprites/girl-*.png (ks. girl-SPRITET.md), kuvattu
// kasvot oikealle -> peilataan kun kuljetaan vasemmalle.
// Säädöt alla: KOKO (suhteessa ketun korkeuteen), ERO (paikka ketun takana).
// ============================================================================
(function(){
'use strict';
const TYTTO_ALKAA_X = 1600;   // pysähdys 5 "How much water does AI use?"
const KOKO = 1.0;             // tytön korkeus = ketun näkyvä korkeus x KOKO
const TASO = 0.0;             // jalkojen taso: 0 = ketun tassujen linja, + = alemmas (osuus ketun korkeudesta)
const SAAPUMISNOPEUS = 260;   // px/s, kävelee sisään vasemmalta
const ERO = 0.10;             // etäisyys ketun takana, osuus ruudun leveydestä
// Reaktiot pysähdyksittäin: esitys-data.js:ssä esim. { x: ..., tyttoAnimaatio: 'confused' }
// (soi kun opas seisoo). Vaihtoehdot: idle, angry, confused, chop, dance, jump, backflip, run.
// mitta = 2 niillä, jotka paistettiin isommalla kehyksellä (hyppy ei leikkaa päätä).
const KLIPIT = {
  jog:      { tiedosto: 'girl-jog.png',      w: 219, h: 423, n: 10, fps: 9 },
  idle:     { tiedosto: 'girl-idle.png',     w: 167, h: 401, n: 12, fps: 4 },   // kuvattu edestä (katsoo yleisöön)
  run:      { tiedosto: 'girl-run.png',      w: 211, h: 417, n: 10, fps: 12 },
  angry:    { tiedosto: 'girl-angry.png',    w: 258, h: 398, n: 8,  fps: 10 },
  confused: { tiedosto: 'girl-confused.png', w: 200, h: 393, n: 12, fps: 4 },
  chop:     { tiedosto: 'girl-chop.png',     w: 233, h: 360, n: 10, fps: 10, mitta: 1.3/1.4 },
  dance:    { tiedosto: 'girl-dance.png',    w: 279, h: 339, n: 14, fps: 6,  mitta: 1.3/1.5 },
  jump:     { tiedosto: 'girl-jump.png',     w: 110, h: 336, n: 14, fps: 9,  mitta: 0.5, kerran: true },
  backflip: { tiedosto: 'girl-backflip.png', w: 224, h: 322, n: 16, fps: 6,  mitta: 0.5, kerran: true },
};

let sc = null, tytto = null, valmis = false, edX = null, saapuu = false;

function odota(){
  sc = window.__paaKohtaus;
  if (!sc || !sc.hahmo) { setTimeout(odota, 300); return; }
  Object.entries(KLIPIT).forEach(([k, c]) => sc.load.spritesheet('tytto-' + k, 'assets/2d/sprites/' + c.tiedosto, { frameWidth: c.w, frameHeight: c.h }));
  sc.load.once('complete', luo);
  sc.load.start();
}

function luo(){
  Object.entries(KLIPIT).forEach(([k, c]) => {
    if (!sc.anims.exists('tytto:' + k)) sc.anims.create({ key: 'tytto:' + k, frames: sc.anims.generateFrameNumbers('tytto-' + k, { start: 0, end: c.n - 1 }), frameRate: c.fps, repeat: c.kerran ? 0 : -1 });
  });
  tytto = sc.add.sprite(0, 0, 'tytto-idle').setOrigin(0.5, 1).setDepth(99).setVisible(false);
  tytto.play('tytto:idle');
  valmis = true;
  sc.events.on('update', paivita);
}

function paivita(aika, dt){
  if (!valmis || !sc.hahmo) return;
  const kettu = sc.hahmo, W = sc.scale.width, cam = sc.cameras.main;
  const kameraX = (cam.scrollX + W / 2) / 2.2;   // SKAALA
  const nakyy = kameraX >= TYTTO_ALKAA_X - 40;
  if (!nakyy) { tytto.setVisible(false); edX = null; saapuu = false; return; }
  if (!tytto.visible) {                           // ensimmäinen ilmestyminen: kävelee sisään vasemmalta
    tytto.setVisible(true); saapuu = true;
    tytto.x = cam.scrollX - W * 0.08;
  }
  tytto.y = kettu.y + kettu.displayHeight * TASO;
  const perus = (kettu.displayHeight * KOKO) / KLIPIT.idle.h;
  tytto.setScale(perus);
  const liike = edX == null ? 0 : kettu.x - edX;
  edX = kettu.x;
  if (saapuu) {
    const kohde = kettu.x - W * ERO;
    tytto.flipX = false;
    tytto.x += SAAPUMISNOPEUS * (dt / 1000);
    if (tytto.anims.currentAnim?.key !== 'tytto:jog') tytto.play('tytto:jog');
    if (tytto.x >= kohde) { tytto.x = kohde; saapuu = false; }
    return;
  }
  const suunta = liike > 0.5 ? 1 : liike < -0.5 ? -1 : 0;
  if (suunta !== 0) tytto.flipX = suunta < 0;
  const taakse = tytto.flipX ? 1 : -1;                  // aina ketun takana kulkusuunnassa
  tytto.x = kettu.x + taakse * W * ERO;
  let klippi = 'jog';
  if (suunta === 0) {
    const p = (typeof PYSAHDYKSET_2D !== 'undefined' && typeof indeksi !== 'undefined') ? PYSAHDYKSET_2D[indeksi] : null;
    klippi = (p && KLIPIT[p.tyttoAnimaatio]) ? p.tyttoAnimaatio : 'idle';
  }
  tytto.setScale(perus / (KLIPIT[klippi].mitta || 1));
  const avain = 'tytto:' + klippi;
  if (tytto.anims.currentAnim?.key !== avain) tytto.play(avain);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', odota); else odota();
})();
