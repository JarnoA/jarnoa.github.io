// ============================================================================
// TEKOÄLYCHATTI: "KYSYIN HEIDÄN OMALTA TEKOÄLYLTÄÄN" (TF 15.10.2026, Jarno:
// "make Google Gemini screen with code, like google search, but make this
// look like ai chat. make it click stop so answer 'No,..' comes with click").
// Sanat = Jarnon oikea Gemini-keskustelu 14.10.2026 (kysymys + vastauksen
// ensimmäinen lause sellaisenaan). Pelkistetty chat-ulkoasu, ei yhtiön logoa.
// Käyttö esitys-data.js:ssä:
//   gemini: 'kysymys' - kysymys kirjoitetaan kenttään ja lähetetään kuplaksi
//   gemini: 'vastaus' - kysymys valmiina, vastaus kirjoittuu esiin (seuraava klikkaus)
//   gemini: 'pieni'   - molemmat valmiina, pienempänä (takaisinviittaus x:4850)
// ============================================================================
(function(){
'use strict';
const KYSYMYS = "I'm planning a large data centre in Finland. Can I cut down 330 hectares of forest on the site before the environmental impact assessment is finished?";
const VASTAUS_ALKU = 'No.';
const VASTAUS = ' Clearing 330 hectares of forest for an industrial data center before the Environmental Impact Assessment (EIA, in Finnish: YVA-menettely) is finalized violates Finnish planning and environmental law.';
const NIMI = 'Gemini';

const css = `
#gemini{position:fixed;left:50%;top:4%;transform:translateX(-50%);width:min(80vw,140vh);z-index:6;pointer-events:none;
  font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;opacity:0;transition:opacity .5s ease,top .5s ease,width .5s ease}
#gemini.nakyy{opacity:1}
#gemini.pieni{width:min(60vw,105vh)}
#gemini .ikkuna{background:#fff;border-radius:22px;box-shadow:0 6px 30px rgba(0,0,0,.45);padding:1em 1.2em 1.1em;color:#1f1f1f;
  font-size:clamp(15px,min(1.9vw,3.1vh),64px)}   /* 17.10: skaalautuu ruudun mukaan, ei px-kattoa */
#gemini.pieni .ikkuna{font-size:clamp(12px,min(1.35vw,2.2vh),46px)}
#gemini .yla{display:flex;align-items:center;gap:.45em;font-size:.8em;color:#444746;margin-bottom:.8em}
#gemini .tahti{display:inline-block;width:1.1em;height:1.1em;flex:none;
  background:conic-gradient(from 200deg,#4285f4,#9b72cb,#d96570,#4285f4);
  clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)}
#gemini .kupla{font-size:.9em;color:#1f1f1f;min-width:0;margin-left:auto;max-width:82%;background:#e9eef6;border-radius:1em 1em .25em 1em;padding:.6em .9em;line-height:1.35;   /* 17.10: oma koko - esitys-2d.html:n yleinen .kupla (1rem) kutisti kysymyksen */
  
  opacity:0;transform:translateY(8px);transition:all .45s ease}
#gemini .vastaus{display:flex;gap:.6em;margin-top:.9em;line-height:1.4;opacity:0;transform:translateY(8px);transition:all .45s ease}
#gemini .vastaus .tahti{margin-top:.2em}
#gemini .vastaus b{color:#b3261e}
#gemini .kentta{margin-top:.9em;border:1px solid #c4c7c5;border-radius:28px;padding:.5em .9em;font-size:.85em;color:#1f1f1f;min-height:1.4em;line-height:1.35}
#gemini .kentta .tyhja{color:#80868b}
#gemini .kursori{display:inline-block;width:2px;height:1.05em;background:#1f1f1f;margin-left:2px;vertical-align:-.15em;animation:gemVilkku 1s steps(1) infinite}
@keyframes gemVilkku{50%{opacity:0}}
#gemini .esiin{opacity:1;transform:none}
`;
const tyyli = document.createElement('style'); tyyli.textContent = css;
const el = document.createElement('div'); el.id = 'gemini';
el.innerHTML = '<div class="ikkuna">'
  + '<div class="yla"><span class="tahti"></span>' + NIMI + '</div>'
  + '<div class="kupla"></div>'
  + '<div class="vastaus"><span class="tahti"></span><div class="v"><b></b><span class="loput"></span></div></div>'
  + '<div class="kentta"><span class="kt"></span><span class="kursori"></span></div>'
  + '</div>';
function liita(){ document.head.appendChild(tyyli); document.body.appendChild(el); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let ajastimet = [];
function tyhjaa(){ ajastimet.forEach(clearTimeout); ajastimet = []; }
function myohemmin(ms, f){ ajastimet.push(setTimeout(f, ms)); }
function kirjoita(kohde, teksti, nopeus, valmis){
  let i = 0;
  (function seur(){ kohde.textContent = teksti.slice(0, i); if (i++ < teksti.length) myohemmin(nopeus, seur); else if (valmis) valmis(); })();
}

window.naytaGemini = function(p){
  tyhjaa();
  const kupla = el.querySelector('.kupla'), vas = el.querySelector('.vastaus'),
        b = el.querySelector('.vastaus b'), loput = el.querySelector('.vastaus .loput'),
        kentta = el.querySelector('.kentta'), kt = el.querySelector('.kt');
  const tila = p && p.gemini;
  if (!tila) { el.classList.remove('nakyy'); return; }
  el.classList.toggle('pieni', tila === 'pieni');
  el.classList.add('nakyy');
  kentta.style.display = '';
  if (tila === 'kysymys') {
    kupla.textContent = ''; kupla.classList.remove('esiin'); vas.classList.remove('esiin'); b.textContent = ''; loput.textContent = '';
    kt.innerHTML = '';
    myohemmin(600, () => kirjoita(kt, KYSYMYS, 38, () => myohemmin(500, () => {
      kt.innerHTML = '<span class="tyhja">Ask ' + NIMI + '</span>';
      kupla.textContent = KYSYMYS; kupla.classList.add('esiin');
    })));
    return;
  }
  // vastaus / pieni: kysymys valmiina
  kupla.textContent = KYSYMYS; kupla.classList.add('esiin');
  kt.innerHTML = '<span class="tyhja">Ask ' + NIMI + '</span>';
  if (tila === 'pieni') {
    kentta.style.display = 'none';
    b.textContent = VASTAUS_ALKU; loput.textContent = VASTAUS; vas.classList.add('esiin');
    return;
  }
  b.textContent = ''; loput.textContent = ''; vas.classList.remove('esiin');
  myohemmin(400, () => { vas.classList.add('esiin'); b.textContent = VASTAUS_ALKU;
    myohemmin(900, () => kirjoita(loput, VASTAUS, 22)); });
};
})();
