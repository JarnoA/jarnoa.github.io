// ============================================================================
// KERROSRÄJÄYTYS (2.10.2026, x:11380 "Tämä esitys"). Jarno: taustat EIVÄT ole
// tekoälykuvia vaan taiteilijan peligrafiikkaa, erillisiä kerroksia - näytetään
// kerrosrakenne levittämällä kerrokset erilleen.
//
// Käyttö esitys-data.js:ssä: `kerrokset: true`. Ei tekstejä/nimilappuja.
// Historia: 1) CSS 3D -kallistus + keinunta HYLÄTTY ("flickers, looks heavy").
// 2) Phaserin taustakerrosten kopiointi ei toiminut (lähteet ovat moottorin
// esikäsittelemiä kanvaaseja). 3) NYT: Jarnon valinta - esityksen ALKUMETSÄN
// kerrokset suoraan tiedostoista (Free Pixel Art Forest), tuttu kuva yleisölle.
//
// Kulku: (kohtauksen oma tausta näkyy takana) metsä koottuna (kaikki kerrokset päällekkäin) häivyttyy
// esiin, sitten kerrokset liukuvat kerran vinoksi kaskadiksi (pelkkä 2D-
// transform, ei rAF-silmukkaa, ei varjoja) ja pysyvät paikallaan.
// ============================================================================
(function(){
'use strict';
const ALKU = 1.2, LEVITYS = 1.4;      // s: metsä esiin, sitten levitys
const KANSIO = 'Backrounds/Free Pixel Art Forest/PNG/Background layers/';
const KERROKSET = ['Layer_0011_0.png', 'Layer_0010_1.png', 'Layer_0009_2.png', 'Layer_0008_3.png', 'Layer_0006_4.png',
  'Layer_0005_5.png', 'Layer_0003_6.png', 'Layer_0002_7.png', 'Layer_0001_8.png', 'Layer_0000_9.png'];   // takaa eteen
const SUHDE = 928 / 793;

const juuri = document.createElement('div');
juuri.id = 'kerrokset';
juuri.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:3;opacity:0;transition:opacity .8s ease;overflow:hidden;';   // ei omaa taustaa: kaupunkikohtaus näkyy takana (Jarno 2.10.2026)
const levyt = KERROKSET.map(f => {
  const im = document.createElement('img');
  im.src = encodeURI(KANSIO + f); im.alt = '';
  im.style.cssText = 'position:absolute;left:50%;top:50%;image-rendering:pixelated;will-change:transform;' +
    'transition:transform 1.8s cubic-bezier(.45,0,.2,1), outline-color 1s ease;outline:2px solid rgba(255,255,255,0);outline-offset:-2px;';
  return im;
});
document.addEventListener('DOMContentLoaded', () => { juuri.append(...levyt); document.body.appendChild(juuri); });

let aktiivinen = false, ajastimet = [];

function mitoita(){
  const h = innerHeight, w = h * SUHDE;
  levyt.forEach(im => { im.style.width = w + 'px'; im.style.height = h + 'px'; im.style.marginLeft = (-w/2) + 'px'; im.style.marginTop = (-h/2) + 'px'; });
}
function kokoaHeti(){
  levyt.forEach(im => {
    im.style.transition = 'none';
    im.style.transform = 'none'; im.style.outlineColor = 'rgba(255,255,255,0)';
    void im.offsetWidth; im.style.transition = 'transform 1.8s cubic-bezier(.45,0,.2,1), outline-color 1s ease';
  });
}
// vino kaskadi: taivas takana vasemmalla ylhäällä, etumaisin oikealla alhaalla;
// alaosa jätetään otsikkokortille (pysty:'ala')
function levita(){
  const n = levyt.length, S = .5, W = innerWidth, H = innerHeight;
  levyt.forEach((im, i) => {
    const e = i / (n - 1);
    const x = (-.26 + e*.52) * W, y = (-.24 + e*.30) * H;
    im.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px) scale(${S})`;
    im.style.outlineColor = 'rgba(255,255,255,.5)';
  });
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaKerrokset = function(p){
  const paalle = !!(p && p.kerrokset);
  ajastimet.forEach(clearTimeout); ajastimet = [];
  if (!paalle) {
    if (!aktiivinen) return;
    aktiivinen = false; juuri.style.opacity = 0;
    return;
  }
  aktiivinen = true; mitoita(); kokoaHeti(); juuri.style.opacity = 0;
  ajastimet.push(setTimeout(() => { if (aktiivinen) juuri.style.opacity = 1; }, ALKU * 1000));
  ajastimet.push(setTimeout(() => { if (aktiivinen) levita(); }, (ALKU + LEVITYS) * 1000));
};
addEventListener('resize', () => { if (aktiivinen) mitoita(); });
})();
