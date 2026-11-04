// ============================================================================
// KANINKOLO (5.10.2026, Jarno: "voiko se olla guide? valittu guide säilyy,
// mutta sitten pupu-hahmo juoksee ruudun ulkopuolelta, hyppää koloon").
// Algoritmin kaninkolo: oppaan Pupu-hahmo (rabbit-run.png, sama kuin opas-
// valinnan Pupu, EI pikseliversio) juoksee ruudun oikeasta reunasta, maahan
// aukeaa musta kolo oppaan oikealle puolelle, Pupu hyppää siihen ja katoaa.
// Kolosta kajastaa hetken puhelimen sininen valo, sitten kolo sulkeutuu.
// Valittu opas pysyy paikallaan koko ajan.
//
// Käyttö esitys-data.js:ssä: `kaninkolo: true` tai `kaninkolo: { viive: 4700 }`
// (ms pysähdykseen saapumisesta; Humak2:ssa kolmannen rivin kohdalla,
// Pohjassa Elias-kohdassa). Kaikki Phaserissa, scrollFactor 0, oppaan tasossa.
// ============================================================================
(function(){
'use strict';
const KUVA = 'assets/2d/sprites/rabbit-run.png', KEHYS = 260, KEHYKSIA = 8, ORIGIN_Y = 0.90;
const JUOKSU = 1.7, AUKEAA = 0.45, HYPPY = 0.75, HEHKU = 1.6, SULKEUTUU = 0.5;   // s

const kuva = new Image(); kuva.src = KUVA;
let sc = null, kani = null, koloTaka = null, koloEtu = null, hehku = null, rafId = 0, ajastin = 0, alku = 0, tila = null;

function siivoa(){
  cancelAnimationFrame(rafId); rafId = 0; clearTimeout(ajastin); ajastin = 0; tila = null;
  [kani, koloTaka, koloEtu, hehku].forEach(o => { if (o) o.destroy(); });
  kani = koloTaka = koloEtu = hehku = null;
}

function valmista(){
  sc = window.__paaKohtaus;
  if (!sc || !sc.hahmo || !kuva.complete || !kuva.naturalWidth) return false;
  if (!sc.textures.exists('kaninkolo-juoksu')) sc.textures.addSpriteSheet('kaninkolo-juoksu', kuva, { frameWidth: KEHYS, frameHeight: KEHYS });
  const h = sc.hahmo, d = h.depth;
  koloTaka = sc.add.graphics().setScrollFactor(0).setDepth(d + 0.01);
  hehku = sc.add.graphics().setScrollFactor(0).setDepth(d + 0.02).setBlendMode(Phaser.BlendModes.ADD);
  kani = sc.add.image(-9999, 0, 'kaninkolo-juoksu', 0).setOrigin(0.5, ORIGIN_Y).setScrollFactor(0).setDepth(d + 0.03);
  koloEtu = sc.add.graphics().setScrollFactor(0).setDepth(d + 0.04);
  const GW = sc.scale.width, ox = h.x - sc.cameras.main.scrollX * h.scrollFactorX;
  const kaniKork = h.displayHeight * 0.8;
  tila = {
    gy: h.y, kaniKork, s: kaniKork / KEHYS,
    kx: Math.min(GW * 0.86, Math.max(ox + GW * 0.24, GW * 0.55)),   // kolon keskikohta: oppaan oikealla puolella
    kl: kaniKork * 0.62, kk: kaniKork * 0.16,                        // kolon leveys ja korkeus
    alkuX: GW + kaniKork * 0.6,
  };
  return true;
}

function piirraKolo(auki, valo){
  const { kx, gy, kl, kk } = tila, w = kl * auki, hh = kk * auki;
  koloTaka.clear(); koloEtu.clear(); hehku.clear();
  if (auki <= 0.01) return;
  koloTaka.fillStyle(0x07090d, 0.95).fillEllipse(kx, gy, w, hh);
  koloTaka.fillStyle(0x000000, 1).fillEllipse(kx, gy + hh * 0.08, w * 0.82, hh * 0.7);
  if (valo > 0) {
    hehku.fillStyle(0x3d7bff, 0.35 * valo).fillEllipse(kx, gy - hh * 0.1, w * 0.9, hh * 1.1);
    hehku.fillStyle(0x9cc2ff, 0.25 * valo).fillEllipse(kx, gy - hh * 0.6, w * 0.45, hh * 2.2);
  }
}

function asetaKani(x, y, kehys, piiloRaja){
  const { s, kaniKork } = tila;
  kani.setFrame(kehys).setScale(s).setPosition(x, y).setVisible(true);
  if (piiloRaja == null) { kani.setCrop(); return; }
  const ylin = y - ORIGIN_Y * kaniKork, nakyy = Math.max(0, Math.min(KEHYS, (piiloRaja - ylin) / s));
  if (nakyy <= 0) kani.setVisible(false); else kani.setCrop(0, 0, KEHYS, nakyy);
}

function silmukka(ms){
  if (!tila) return;
  const t = (ms - alku) / 1000, { kx, gy, kaniKork, alkuX } = tila;
  // opas vaihdettu kesken (1-4 / G luo uuden spriten) -> syvyydet sen mukaan
  if (sc.hahmo && kani.depth < sc.hahmo.depth) [koloTaka, hehku, kani, koloEtu].forEach((o, i) => o.setDepth(sc.hahmo.depth + 0.01 * (i + 1)));
  const kehys = Math.floor(t * 14) % KEHYKSIA;
  const auki = Math.min(1, t / AUKEAA);
  const t1 = JUOKSU, t2 = t1 + HYPPY, t3 = t2 + HEHKU, t4 = t3 + SULKEUTUU;
  if (t < t1) {                                   // juoksu oikealta kolon reunalle
    const e = t / t1, x = alkuX + (kx + kaniKork * 0.35 - alkuX) * (1 - Math.pow(1 - e, 1.4));
    piirraKolo(auki, 0); asetaKani(x, gy, kehys, null);
  } else if (t < t2) {                            // hyppy kaarena koloon
    const e = (t - t1) / HYPPY, x = kx + kaniKork * 0.35 * (1 - e);
    const y = gy - Math.sin(e * Math.PI) * kaniKork * 0.32 + Math.max(0, e - 0.5) / 0.5 * kaniKork * 1.2;
    piirraKolo(1, 0); asetaKani(x, y, kehys, e > 0.45 ? gy : null);
  } else if (t < t3) {                            // sininen kajo kolosta
    const e = (t - t2) / HEHKU, valo = Math.sin(e * Math.PI) * (0.75 + 0.25 * Math.sin(t * 23));
    kani.setVisible(false); piirraKolo(1, valo);
  } else if (t < t4) {                            // kolo sulkeutuu
    piirraKolo(1 - (t - t3) / SULKEUTUU, 0);
  } else { siivoa(); return; }
  rafId = requestAnimationFrame(silmukka);
}

window.naytaKaninkolo = function(p){
  siivoa();
  if (!(p && p.kaninkolo)) return;
  if (typeof ESIKATSELU !== 'undefined' && ESIKATSELU) return;
  const viive = (typeof p.kaninkolo === 'object' && p.kaninkolo.viive != null) ? p.kaninkolo.viive : 1200;
  ajastin = setTimeout(() => {
    let yritys = 0;
    const kaynnista = () => {
      if (valmista()) { alku = performance.now(); rafId = requestAnimationFrame(silmukka); }
      else if (++yritys < 40) ajastin = setTimeout(kaynnista, 100);
    };
    kaynnista();
  }, viive);
};
})();
