// ============================================================================
// HIDAS OTSIKKO (2.10.2026, x:12690 "HITAUS!"). Jarno valitsi: kirjaimet
// eivät ponnahda esiin, vaan valuvat laiskasti yksi kerrallaan kuin
// haukotellen, ja "!" tulee viimeisenä vähän myöhässä. Sana itse näyttää
// hitauden. Ei ääniä.
//
// Käyttö esitys-data.js:ssä: `hidasOtsikko: true`. Moottori rakentaa tekstin
// n. 300 ms viiveellä (naytaTeksti), joten .otsikko haetaan kunnes se löytyy.
// Seuraava pysähdys rakentaa tekstin uudelleen, joten mitään ei palauteta.
// ============================================================================
(function(){
'use strict';
const VALI = 420, HUUTO_VIIVE = 1100, KESTO = 1.6;      // ms kirjainten väli, "!":n lisäviive, s yhden kirjaimen valuminen

document.addEventListener('DOMContentLoaded', () => {
  const tyyli = document.createElement('style');
  tyyli.textContent = `.hidas-kirjain{display:inline-block;opacity:0;transform:translateY(-.35em) rotate(-8deg) scale(.9);
    transition:opacity ${KESTO}s ease, transform ${KESTO}s cubic-bezier(.3,.6,.25,1.15);}
    .hidas-kirjain.nakyy{opacity:1;transform:none;}`;
  document.head.appendChild(tyyli);
});

let ajastimet = [], vuoro = 0;

window.naytaHidasOtsikko = function(p){
  ajastimet.forEach(clearTimeout); ajastimet = []; vuoro++;
  if (!(p && p.hidasOtsikko)) return;
  const oma = vuoro, alku = performance.now();
  const etsi = () => {
    if (oma !== vuoro) return;
    const el = document.querySelector('#teksti .otsikko');
    // vain TÄMÄN pysähdyksen otsikko (edellisen pysähdyksen teksti on vielä DOMissa ~300 ms)
    if (!el || el.dataset.hidas || el.textContent.trim() !== String(p.otsikko).replace(/<[^>]*>/g, '').trim()) { if (performance.now() - alku < 3000) ajastimet.push(setTimeout(etsi, 50)); return; }
    el.dataset.hidas = '1';
    const merkit = [...el.textContent];
    el.textContent = '';
    const spanit = merkit.map(m => { const s = document.createElement('span'); s.className = 'hidas-kirjain'; s.textContent = m; el.appendChild(s); return s; });
    let viive = 250;
    spanit.forEach((s, i) => {
      if (merkit[i] === '!') viive += HUUTO_VIIVE;
      ajastimet.push(setTimeout(() => s.classList.add('nakyy'), viive));
      viive += VALI;
    });
  };
  etsi();
};
})();
