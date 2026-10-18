// ============================================================================
// KUNINKAAT (TF 15.10.2026, Jarno: "Don't let the kings decide alone" - Jämsän/
// Mikkelin patsaskuvat Gilgameshin rinnalle). Rivi patsaita ruudun alaosassa,
// ilmestyvät yksi kerrallaan vasemmalta: Gilgamesh ensin, sitten tämän päivän
// kuninkaat. Kaikki Jarnon omia (Gemini-)kuvia, patsastyyli.
// Käyttö esitys-data.js:ssä: `kuninkaat: true`.
// ============================================================================
(function(){
'use strict';
const KUVAT = [
  { src: 'kuvat/gilgamesh.png',       korkeus: 0.50 },
  { src: 'kuvat/olig.png',            korkeus: 0.50 },
  { src: 'kuvat/samalt-robotti.png',  korkeus: 0.50 },
  { src: 'kuvat/jeffmark-rajattu.png',korkeus: 0.50 },
];
const VALI_MS = 650, ALKU_MS = 300;

const el = document.createElement('div');
el.id = 'kuninkaat';
el.style.cssText = 'position:fixed;left:0;right:0;bottom:6%;height:52vh;display:flex;align-items:flex-end;justify-content:center;gap:1.5vw;padding:0 3vw;box-sizing:border-box;z-index:3;pointer-events:none;opacity:0;transition:opacity .6s ease;';
const imgs = KUVAT.map(k => {
  const i = new Image(); i.src = k.src;
  i.style.cssText = `max-height:${k.korkeus*100}vh;max-width:22vw;height:auto;width:auto;min-width:0;flex:0 1 auto;opacity:0;transform:translateY(30px);transition:opacity .7s ease,transform .7s ease;filter:drop-shadow(0 8px 18px rgba(0,0,0,.6));`;
  el.appendChild(i); return i;
});
function liita(){ document.body.appendChild(el); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let ajastimet = [];
window.naytaKuninkaat = function(p){
  ajastimet.forEach(clearTimeout); ajastimet = [];
  if (p && p.kuninkaat) {
    el.style.opacity = 1;
    imgs.forEach((i, n) => { i.style.opacity = 0; i.style.transform = 'translateY(30px)';
      ajastimet.push(setTimeout(() => { i.style.opacity = 1; i.style.transform = 'none'; }, ALKU_MS + n*VALI_MS)); });
    return;
  }
  el.style.opacity = 0;
};
})();
