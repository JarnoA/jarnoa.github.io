// ============================================================================
// ALOITUSSIVU (TF 18.10.2026, Jarno: "empty screen at beginning with full screen
// button, in English - if someone else operates the computer"; tarkennus: "always
// there, I can go back; when full screen, I go next page").
// Esitys-data.js:n ensimmäinen pysähdys { x: 100, aloitussivu: true }. Tumma ruutu
// peittää maiseman niin kauan kuin ollaan sillä sivulla. Nappi: koko näyttö +
// esittäjänäkymän kello nollaan, EI siirrä eteenpäin. Klikkeri/nuolet toimivat
// normaalisti (seuraava = otsikkosivu, takaisin = tämä sivu). G:tä EI mainita: se on
// Pohjassa ja muissa esityksissä virallisesti oppaan valinta (Jarno 18.10).
// Oulu 9.11.2026: kopioitu Tool Fairista, tekstit suomeksi. Sivu x:16100.
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
#aloitus .iso{font:700 clamp(26px,5.2vh,68px)/1.15 Georgia,serif;color:#fff;text-align:center;max-width:90vw}
#aloitus .mittari{width:min(70vw,900px);display:flex;flex-direction:column;align-items:center;gap:1.2vh}
#aloitus .palkki{width:100%;height:clamp(12px,1.8vh,22px);background:#ffffff1f;border-radius:999px;overflow:hidden}
#aloitus .palkki i{display:block;height:100%;width:0;background:#f2c94c;border-radius:999px;transition:width .3s ease}
#aloitus.ladattu .palkki i{background:#3f8f6b}
#aloitus .tila{font:600 clamp(15px,2.3vh,30px)/1.4 -apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#f6efe4;text-align:center}
#aloitus.ladattu .tila{color:#8fe0b8}
#aloitus .tila b{color:#fff}
#aloitus .otsikko{font:700 clamp(22px,4vh,52px)/1.2 Georgia,serif;color:#f2c94c;text-align:center}
#aloitus .ohje b{color:#f6efe4;font-weight:600}
`;
const el = document.createElement('div');
el.id = 'aloitus';
el.innerHTML = '<div class="otsikko">Nuoruus tekoälypuurossa · Jarno Alastalo</div>'
  + '<div class="iso">Anna esityksen latautua hetki.</div>'
  + '<div class="ohje">Taustat latautuvat alussa, ja se voi kestää noin minuutin. <b>Avaa esitys siksi ajoissa</b> ennen alkua.</div>'
  + '<div class="mittari"><div class="palkki"><i></i></div><div class="tila">Ladataan… 0 %</div></div>'
  + '<div class="ohje"><b>1.</b> Klikkaa alla olevaa nappia <b>tai paina F</b>, niin esitys menee koko ruudun kokoiseksi.<br>'
  + 'Selaimen palkkeja ei saa näkyä.</div>'
  + '<button type="button" id="aloitusNappi">⛶&nbsp; Koko näyttö</button>'
  + '<div class="ohje"><b>2.</b> Älä klikkaa hiirellä tämän jälkeen muualle, muuten klikkeri ei toimi.<br>'
  + '<b>3.</b> Seuraavaksi tulee oppaan valinta: klikkaa yhtä hahmoa (tai paina 1–4).<br>'
  + '<b>Testiversio:</b> sivuilla on ääntä ja animaatiota. Tarkista, että ääni kuuluu salin kaiuttimista.</div>';

// PUURO 23.11.2026 (Jarno): latausmittari. Lukee esitys-2d.html:n preload()-vaiheen
// window.__lataus-arvon (Phaserin taustat, hahmot, kuvat) ja odottaa lisäksi sivun
// load-tapahtuman. Valmis = kaikki alussa ladattava on selaimen muistissa.
function paivitaMittari(){
  const l = window.__lataus || { osuus: 0, valmis: false };
  const valmis = l.valmis && document.readyState === 'complete';
  const pros = Math.round((valmis ? 1 : Math.min(l.osuus, 0.99)) * 100);
  const palkki = el.querySelector('.palkki i'), tila = el.querySelector('.tila');
  if (!palkki) return;
  palkki.style.width = pros + '%';
  el.classList.toggle('ladattu', valmis);
  tila.innerHTML = valmis
    ? '✓ Kaikki ladattu. Esitys toimii nyt, vaikka verkko pätkisi. <b>Älä lataa sivua uudelleen.</b>'
    : 'Ladataan… ' + pros + ' %';
}
setInterval(paivitaMittari, 200);

function liita(){ document.head.appendChild(tyyli); document.body.appendChild(el); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

const nappi = () => el.querySelector('#aloitusNappi');
function paivitaNappi(){
  const fs = !!document.fullscreenElement;
  nappi().classList.toggle('valmis', fs);
  nappi().innerHTML = fs ? '✓&nbsp; Koko näyttö päällä – paina seuraava' : '⛶&nbsp; Koko näyttö';
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
