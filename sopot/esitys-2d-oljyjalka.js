// ============================================================================
// ÖLJYISET JALANJÄLJET (TF 13.10.2026). BP-pysähdyksellä (JALKA_X) tyttö
// tanssii, ja jokainen askel jättää maahan mustan öljyisen jalanjäljen:
// hiilijalanjälki pannaan lapsen kannettavaksi. Käänteessä (HAIVYTYS_X, "I
// would have done BP's work") jäljet haalistuvat pois. Jäljet ovat maailmassa
// (pysyvät maassa), syvyys tytön ja ketun alla. Tanssi tulee esitys-data.js:n
// kentästä tyttoAnimaatio: 'dance' (ks. esitys-2d-tytto.js).
// ============================================================================
(function(){
'use strict';
const JALKA_X = 2500;       // BP-pysähdys: jäljet syntyvät
const HAIVYTYS_X = 2600;    // käänne: jäljet haalistuvat
const MAX_JALJET = 34;
const ASKELKEHYKSET = [1, 4, 8, 11];   // tanssin kehykset, joilla jalka osuu maahan

let sc = null, tytto = null, g = null, jaljet = [], edKehys = -1, puoli = 1, haivytys = null;

function odota(){
  sc = window.__paaKohtaus;
  tytto = sc && sc.children.list.find(o => o.texture && String(o.texture.key).startsWith('tytto'));
  if (!tytto) { setTimeout(odota, 400); return; }
  g = sc.add.graphics().setDepth(98);
  sc.events.on('update', paivita);
}

function piirra(){
  g.clear();
  jaljet.forEach(j => {
    const a = j.alpha * (haivytys ? haivytys.a : 1);
    if (a <= 0) return;
    const L = j.koko, Wd = L * 0.42;
    g.fillStyle(0x3b2a5c, 0.9 * a);                               // öljy tummalla maalla: violetti pohja
    g.fillEllipse(j.x, j.y, Wd, L * 0.55);                       // kantapää + päkiä (litteä, maan tasossa)
    g.fillEllipse(j.x + j.suunta * L * 0.42, j.y - L * 0.03, Wd * 1.15, L * 0.6);
    g.fillStyle(0x2a8f86, 0.55 * a);                              // turkoosi kalvo
    g.fillEllipse(j.x + j.suunta * L * 0.36, j.y - L * 0.06, Wd * 0.75, L * 0.3);
    g.fillStyle(0xe0b84a, 0.6 * a);                               // kultainen kiilto
    g.fillEllipse(j.x + j.suunta * L * 0.46, j.y - L * 0.1, Wd * 0.3, L * 0.1);
  });
}

function paivita(aika, dt){
  const p = (typeof PYSAHDYKSET_2D !== 'undefined' && typeof indeksi !== 'undefined') ? PYSAHDYKSET_2D[indeksi] : null;
  const x = p ? p.x : 0;
  if (x < JALKA_X) { if (jaljet.length) { jaljet = []; haivytys = null; g.clear(); } return; }
  if (x === JALKA_X) {
    haivytys = null;
    const anim = tytto.anims.currentAnim, kehys = tytto.anims.currentFrame ? tytto.anims.currentFrame.index - 1 : -1;
    if (tytto.visible && anim && anim.key === 'tytto:dance' && kehys !== edKehys) {
      edKehys = kehys;
      if (ASKELKEHYKSET.includes(kehys) && jaljet.length < MAX_JALJET) {
        const h = tytto.displayHeight;
        puoli = -puoli;
        jaljet.push({ x: tytto.x + puoli * h * 0.07 + (Math.random() - 0.5) * h * 0.35,
                      y: tytto.y - h * 0.03 + Math.random() * h * 0.025,   // ruohorajalla, ei mustassa maassa
                      koko: h * 0.13, suunta: Math.random() < 0.5 ? -1 : 1, alpha: 0.85 + Math.random() * 0.15 });
      }
    }
  } else if (jaljet.length) {
    if (!haivytys) haivytys = { a: 1 };
    haivytys.a = Math.max(0, haivytys.a - dt / 2600);              // ~2,6 s häivytys
    if (haivytys.a === 0) { jaljet = []; g.clear(); return; }
  }
  piirra();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', odota); else odota();
})();
