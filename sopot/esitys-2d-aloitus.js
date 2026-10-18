// ============================================================================
// ALOITUSSIVU (TF 18.10.2026, Jarno: "empty screen at beginning with full screen
// button, in English - if someone else operates the computer"; tarkennus: "always
// there, I can go back; when full screen, I go next page").
// Esitys-data.js:n ensimmäinen pysähdys { x: 100, aloitussivu: true }. Tumma ruutu
// peittää maiseman niin kauan kuin ollaan sillä sivulla. Nappi: koko näyttö +
// esittäjänäkymän kello nollaan, EI siirrä eteenpäin. Klikkeri/nuolet toimivat
// normaalisti (seuraava = otsikkosivu, takaisin = tämä sivu). G:tä EI mainita: se on
// Pohjassa ja muissa esityksissä virallisesti oppaan valinta (Jarno 18.10).
// ============================================================================
(function(){
'use strict';
if (typeof ESIKATSELU !== 'undefined' && ESIKATSELU) return;

const tyyli = document.createElement('style');
tyyli.textContent = `
#aloitus{position:fixed;inset:0;z-index:200;background:radial-gradient(ellipse at center,#18213d 0%,#0b1020 75%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3.2vh;font-family:Georgia,serif;color:#f6efe4;transition:opacity .5s ease}
#aloitus.pois{opacity:0;pointer-events:none}
#aloitus button{font:700 clamp(18px,3vh,40px)/1 Georgia,serif;color:#0b1020;background:#f2c94c;border:0;border-radius:999px;padding:2.2vh 4.4vh;cursor:pointer;box-shadow:0 1vh 3vh rgba(0,0,0,.5)}
#aloitus button:hover,#aloitus button:focus-visible{background:#ffd95e;outline:3px solid #fff3;outline-offset:4px}
#aloitus button.valmis{background:#3f8f6b;color:#fff}
#aloitus .ohje{font:400 clamp(13px,1.8vh,22px)/1.6 -apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#aeb6d2;text-align:center;max-width:80vw}
#aloitus .ohje b{color:#f6efe4;font-weight:600}
`;
const el = document.createElement('div');
el.id = 'aloitus';
el.innerHTML = '<button type="button" id="aloitusNappi">⛶&nbsp; Full screen</button>'
  + '<div class="ohje"><b>Then: next</b> (clicker or → arrow) starts the presentation.<br>'
  + '<b>Back / next:</b> clicker or arrow keys &nbsp;·&nbsp; <b>F</b> = full screen on/off</div>';
function liita(){ document.head.appendChild(tyyli); document.body.appendChild(el); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

const nappi = () => el.querySelector('#aloitusNappi');
function paivitaNappi(){
  const fs = !!document.fullscreenElement;
  nappi().classList.toggle('valmis', fs);
  nappi().innerHTML = fs ? '✓&nbsp; Full screen on — press next to start' : '⛶&nbsp; Full screen';
}
document.addEventListener('fullscreenchange', paivitaNappi);

el.addEventListener('click', e => {
  if (!e.target.closest('#aloitusNappi')) return;
  try { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); } catch (err) {}
  try {
    alkuaika = Date.now();   // esittäjänäkymän kello alkaa tästä
    if (typeof esitysKanava !== 'undefined' && esitysKanava) esitysKanava.postMessage({ tyyppi: 'siirry', indeksi: globaaliIndeksi(), alkuaika });
  } catch (err) {}
  nappi().blur();            // ettei välilyönti/enter "klikkaa" nappia uudelleen
});

// Näkyy aina kun ollaan aloitussivulla.
setInterval(() => {
  if (typeof PYSAHDYKSET_2D === 'undefined' || typeof indeksi === 'undefined') return;
  const p = PYSAHDYKSET_2D[indeksi];
  el.classList.toggle('pois', !(p && p.aloitussivu));
}, 150);
})();
