// ============================================================================
// KOLME KASSIA (TF 15.10.2026, Jarno: "First they are plastic, but change to
// fabric? I can shortly say, no i wont give plastic..."). Lahja-osion muisti-
// vihje: kolme kassia ruudun alaosassa oikealla.
//   kassit: 0       - x:4400 kolme muovipussia -> ~3,5 s päästä muuttuvat kangaskasseiksi
//   kassit: 1/2/3   - kassit 1..n täynnä, n:s nousee ja hehkuu (nimi alla)
//   kassit: 'kaikki'- x:5100 kaikki kolme täynnä rinnakkain
// Pikselityyli: jokainen kassi piirretään pieneen ruudukkoon ja skaalataan.
// ============================================================================
(function(){
'use strict';
const NIMET = [['Ask why'], ['Zoom out'], ['Ask for', 'another way']];
const KW = 20, KH = 26;                 // yhden kassin pikseliruudukko
const KORKEUS = 0.22;                   // kassin korkeus / ruudun korkeus
const RIVI_X = [0.52, 0.69, 0.86];      // kassien keskikohdat
const MAA = 0.86;                       // kassien pohjan taso
const MUOVI_S = 3.5;                    // muovi -> kangas viive (s)
const KELTA = '#f2c94c';

const cv = document.createElement('canvas');
cv.id = 'kassit';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
const kcv = document.createElement('canvas'); kcv.width = KW; kcv.height = KH;
const kctx = kcv.getContext('2d');
function liita(){ document.body.appendChild(cv); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

// kassin kuva pikseliruudukkoon. muovi = ohut läpikuultava pussi; kangas = beige kassi, täysi = pullottaa + sisältöä
function piirraKassi(muovi, taysi, hehku){
  kctx.clearRect(0, 0, KW, KH);
  if (muovi) {
    kctx.fillStyle = 'rgba(235,240,245,0.55)';
    kctx.fillRect(3, 9, 14, 16);                                    // pussi
    kctx.fillRect(4, 3, 3, 7); kctx.fillRect(13, 3, 3, 7);          // kahvat (silmukat)
    kctx.clearRect(5, 4, 1, 5); kctx.clearRect(14, 4, 1, 5);
    kctx.fillStyle = 'rgba(255,255,255,0.8)';
    [[5,12],[9,15],[13,11],[7,20],[12,19]].forEach(([x,y]) => kctx.fillRect(x, y, 2, 1)); // rypyt
    return;
  }
  const runko = hehku ? '#f5e3b8' : '#d9c79c', varjo = '#b8a57a', kahva = '#8a7550';
  kctx.fillStyle = kahva;                                           // kahvat
  kctx.fillRect(5, 2, 2, 9); kctx.fillRect(13, 2, 2, 9); kctx.fillRect(5, 2, 10, 2);
  kctx.fillStyle = runko; kctx.fillRect(2, 9, 16, 16);
  if (taysi) { kctx.fillRect(1, 12, 18, 12); kctx.fillStyle = '#7fbf5f'; kctx.fillRect(4, 7, 4, 3); kctx.fillStyle = '#e9d36a'; kctx.fillRect(10, 6, 5, 4); }
  kctx.fillStyle = varjo; kctx.fillRect(2, 24, 16, 1); kctx.fillRect(17, 9, 1, 15);
  kctx.fillStyle = 'rgba(0,0,0,0.12)'; kctx.fillRect(3, 14, 14, 1);   // sauma
}

let tila = null, aktiivinen = false, rafId = 0, alkuT = 0;

function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms/1000, ta = t - alkuT;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  ctx.imageSmoothingEnabled = false;
  const h = H*KORKEUS, s = h / KH, w = KW * s;
  const muovi = tila === 0 && ta < MUOVI_S;
  const muutos = tila === 0 ? Math.max(0, Math.min(1, (ta - MUOVI_S) / 0.6)) : 1; // pieni "pomppu" vaihdossa
  for (let i = 0; i < 3; i++) {
    const nro = i + 1;
    const taysi = tila === 'kaikki' || (typeof tila === 'number' && nro <= tila);
    const nykyinen = typeof tila === 'number' && nro === tila;
    const nousu = nykyinen ? Math.min(1, ta / 0.6) * h * 0.18 + Math.sin(t*2.2) * h * 0.02 : 0;
    const pomppu = tila === 0 && muutos > 0 && muutos < 1 ? Math.sin(muutos*Math.PI) * h * 0.12 : 0;
    piirraKassi(muovi, taysi, nykyinen);
    const cx = W*RIVI_X[i], y = H*MAA - h - nousu - pomppu;
    if (nykyinen) {                                                  // hehku
      const g = ctx.createRadialGradient(cx, y + h*0.55, h*0.1, cx, y + h*0.55, h*0.9);
      g.addColorStop(0, 'rgba(242,201,76,0.35)'); g.addColorStop(1, 'rgba(242,201,76,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - h, y - h*0.4, h*2, h*2);
    }
    ctx.globalAlpha = (typeof tila === 'number' && tila > 0 && !taysi) ? 0.55 : 1;
    ctx.drawImage(kcv, cx - w/2, y, w, h);
    ctx.globalAlpha = 1;
    if (!muovi && (taysi || tila === 0)) {                          // nimi alle
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.font = `700 ${Math.round(H*0.026)}px Georgia,serif`;
      ctx.fillStyle = (nykyinen || tila === 'kaikki') ? KELTA : 'rgba(255,255,255,0.85)';
      ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 6;
      NIMET[i].forEach((r, j) => ctx.fillText(r, cx, H*MAA + H*0.012 + j*H*0.03));
      ctx.shadowBlur = 0;
    }
  }
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaKassit = function(p){
  const uusi = p && p.kassit !== undefined ? p.kassit : null;
  if (uusi === null) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0; tila = null; return;
  }
  tila = uusi; alkuT = performance.now()/1000;
  aktiivinen = true; cv.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
