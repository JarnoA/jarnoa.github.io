// ============================================================================
// HAKU VASTAA TEKOÄLYLLÄ (TF 13.10.2026, Jarno: "animation that mimics search,
// search box, text appears, then results, first AI answer, something funny,
// then normal links"). Mikael välttää tekoälyä ja hakee - mutta haku vastaa
// ensin tekoälyllä. Yleinen hakukone, EI minkään yhtiön logoa/ulkoasua.
// Käyttö esitys-data.js:ssä: `haku: true`. Tekstit muokattavissa alla.
// ============================================================================
(function(){
'use strict';
const HAKU = 'how much water does AI use';
const AI_OTSIKKO = '✦ AI answer';
const AI_TEKSTI = 'Great question! Answering it just used some water. How much? Sorry, I can’t tell you that.';
const LINKIT = [
  { url: 'reddit.com › r/askscience', otsikko: 'How much water do computers use? : r/askscience', aika: '10 years ago' },
  { url: 'forum.example.org › thread', otsikko: 'Do servers drink water?? (serious question)', aika: '9 years ago' },
  { url: 'reddit.com › r/NoStupidQuestions', otsikko: 'Is it bad to google too much?', aika: '11 years ago' },
];

const css = `
#haku{position:fixed;left:50%;top:4%;transform:translateX(-50%);width:min(80vw,140vh);z-index:6;pointer-events:none;
  font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;opacity:0;transition:opacity .5s ease}
#haku.nakyy{opacity:1}
/* pidetään ruudun yläosassa: opas ja tyttö (canvas) eivät jää DOM-kerroksen alle */
#haku{max-height:46vh;overflow:hidden}   /* 17.10: skaalautuu ruudun mukaan; loppuu ~50 % korkeudelle, T-800 (alkaa 52 %), kettu ja tyttö näkyvät */
#haku .laatikko{background:#fff;border-radius:40px;padding:.7em 1.2em;font-size:clamp(16px,min(2.1vw,3.5vh),72px);color:#202124;
  box-shadow:0 6px 30px rgba(0,0,0,.45);display:flex;align-items:center;gap:.7em}
#haku .laatikko .lasi{width:1em;height:1em;border:3px solid #9aa0a6;border-radius:50%;position:relative;flex:none}
#haku .laatikko .lasi:after{content:"";position:absolute;width:.45em;height:3px;background:#9aa0a6;right:-.38em;bottom:-.12em;transform:rotate(45deg)}
#haku .kursori{display:inline-block;width:2px;height:1.1em;background:#202124;margin-left:2px;vertical-align:-.15em;animation:hakuVilkku 1s steps(1) infinite}
@keyframes hakuVilkku{50%{opacity:0}}
#haku .tulokset{margin-top:.8em;background:#fff;border-radius:18px;padding:.9em 1.2em;box-shadow:0 6px 30px rgba(0,0,0,.45);
  font-size:clamp(12px,min(1.45vw,2.4vh),48px);color:#202124}
#haku .ai{font-size:1.2em;line-height:1.4;background:#eef3fd;border-radius:14px;padding:.9em 1.1em;margin-bottom:1em;opacity:0;transform:translateY(10px);transition:all .6s ease}
#haku .ai b{display:block;color:#1a56d6;margin-bottom:.35em;font-size:.95em}
#haku .ai .rivi{min-height:1.4em}
#haku .linkki{margin:.55em 0 0;opacity:0;transform:translateY(10px);transition:all .5s ease}
#haku .linkki .u{font-size:.8em;color:#4d5156}
#haku .linkki .o{color:#1a0dab;font-size:1.1em}
#haku .linkki .a{font-size:.8em;color:#70757a}
#haku .esiin{opacity:1;transform:none}
`;
const tyyli = document.createElement('style'); tyyli.textContent = css;
const el = document.createElement('div'); el.id = 'haku';
el.innerHTML = '<div class="laatikko"><span class="lasi"></span><span class="teksti"></span><span class="kursori"></span></div>'
  + '<div class="tulokset" style="display:none"><div class="ai"><b>' + AI_OTSIKKO + '</b><div class="rivi"></div></div>'
  + LINKIT.map(l => '<div class="linkki"><div class="u">' + l.url + '</div><div class="o">' + l.otsikko + '</div><div class="a">' + l.aika + '</div></div>').join('')
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

window.naytaHaku = function(p){
  tyhjaa();
  const t = el.querySelector('.teksti'), tul = el.querySelector('.tulokset'), ai = el.querySelector('.ai'), rivi = el.querySelector('.ai .rivi');
  if (!p || !p.haku) { el.classList.remove('nakyy'); return; }
  t.textContent = ''; rivi.textContent = ''; tul.style.display = 'none';
  ai.classList.remove('esiin'); el.querySelectorAll('.linkki').forEach(l => l.classList.remove('esiin'));
  el.classList.add('nakyy');
  myohemmin(700, () => kirjoita(t, HAKU, 75, () => myohemmin(600, () => {
    tul.style.display = '';
    myohemmin(50, () => ai.classList.add('esiin'));
    myohemmin(500, () => kirjoita(rivi, AI_TEKSTI, 32, () => {
      el.querySelectorAll('.linkki').forEach((l, i) => myohemmin(700 + i * 450, () => l.classList.add('esiin')));
    }));
  })));
};
})();
