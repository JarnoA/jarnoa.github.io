// ============================================================================
// TEKOÄLYCHAT (11.10.2026, Mikkeli vinkkisivut 11961-11966, Jarno: "mallintaa
// tekoälyn chat ... enemmän samanlainen kuin oikeasti keskustelisi", "tekstien
// pitää olla isot että näkyy").
// Käyttö esitys-data.js:ssä: `chat: [ { k:'sina', t:'...' }, { k:'ai', t:'...' }, ... ]`
// Brändätön chat-ikkuna vasemmalla: käyttäjän viesti kirjoittuu ensin
// kirjoituskenttään ja lähtee kuplaksi oikealle, tekoäly "kirjoittaa…" (kolme
// pistettä) ja vastaus valuu sana kerrallaan vasemmalle ilman kuplaa, kuten
// oikeissa palveluissa. Muotoilu: **lihavointi**, rivit "1." / "•" listana,
// tyhjä rivi = kappale. Ikkuna rullaa itse alas. Ei ääniä, ei klikkauksia.
// ============================================================================
(function(){
'use strict';
const css = `
#tkchat{ position:fixed; left:3vw; top:9vh; width:47vw; height:80vh; z-index:4; opacity:0; transition:opacity .4s ease;
  display:flex; flex-direction:column; background:#ffffff; border-radius:1.2vw; box-shadow:0 1.2vw 3vw rgba(0,0,0,.45);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color:#1f1f24; overflow:hidden; pointer-events:none; }
#tkchat .tk-yla{ flex:0 0 auto; display:flex; align-items:center; gap:.7vw; padding:1vw 1.4vw; border-bottom:1px solid #e6e6ea;
  font-weight:700; font-size:calc(.7rem + .9vw); }
#tkchat .tk-pallo{ width:1.6vw; height:1.6vw; border-radius:50%; background:conic-gradient(#7aa7ff,#b78cff,#ff9ec4,#7aa7ff); }
#tkchat .tk-viestit{ flex:1 1 auto; overflow:hidden; padding:1.2vw 1.6vw; display:flex; flex-direction:column; gap:1.2vw;
  font-size:calc(.75rem + 1.05vw); line-height:1.38; }
#tkchat .tk-sina{ align-self:flex-end; max-width:82%; background:#ececf1; border-radius:1.4vw; padding:.7vw 1.2vw; }
#tkchat .tk-ai{ align-self:flex-start; max-width:96%; }
#tkchat .tk-ai p{ margin:0 0 .55em 0; } #tkchat .tk-ai p:last-child{ margin-bottom:0; }
#tkchat .tk-ai .tk-rivi{ margin:.1em 0 .1em .9em; text-indent:-.9em; }
#tkchat .tk-pisteet span{ display:inline-block; width:.45em; height:.45em; margin-right:.25em; border-radius:50%; background:#9a9aa6; animation:tkp 1s infinite; }
#tkchat .tk-pisteet span:nth-child(2){ animation-delay:.15s } #tkchat .tk-pisteet span:nth-child(3){ animation-delay:.3s }
@keyframes tkp{ 0%,80%,100%{ opacity:.25; transform:translateY(0) } 40%{ opacity:1; transform:translateY(-.2em) } }
#tkchat .tk-ala{ flex:0 0 auto; margin:0 1.2vw 1.2vw; border:1.5px solid #d8d8de; border-radius:1.6vw; padding:.6vw .7vw .6vw 1.2vw;
  display:flex; align-items:center; gap:.8vw; font-size:calc(.7rem + .95vw); min-height:2.2em; }
#tkchat .tk-kentta{ flex:1 1 auto; color:#1f1f24; white-space:pre-wrap; } #tkchat .tk-kentta.tyhja{ color:#9a9aa6; }
#tkchat .tk-laheta{ flex:0 0 auto; width:2.2em; height:2.2em; border-radius:50%; background:#1f1f24; color:#fff; display:flex; align-items:center; justify-content:center; font-size:.8em; }
#tkchat .tk-kursori{ display:inline-block; width:.08em; height:1em; background:#1f1f24; vertical-align:-.12em; animation:tkk 1s steps(1) infinite; }
@keyframes tkk{ 50%{ opacity:0 } }`;
const tyyli = document.createElement('style'); tyyli.textContent = css;
const el = document.createElement('div'); el.id = 'tkchat';
el.innerHTML = '<div class="tk-yla"><span class="tk-pallo"></span>Tekoäly</div><div class="tk-viestit"></div><div class="tk-ala"><span class="tk-kentta tyhja">Kirjoita viesti…</span><span class="tk-laheta">➤</span></div>';
document.addEventListener('DOMContentLoaded', () => { document.head.appendChild(tyyli); document.body.appendChild(el); });
const $ = s => el.querySelector(s);

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function muotoile(teksti){
  return teksti.split(/\n\n+/).map(kpl => {
    const rivit = kpl.split('\n').map(r => esc(r).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'));
    return rivit.map(r => /^(\d+\.|•)\s/.test(r.replace(/<[^>]+>/g,'')) ? `<div class="tk-rivi">${r}</div>` : `<p>${r}</p>`).join('');
  }).join('');
}

let ajo = 0;                                   // kasvaa joka kerta -> vanhat ajastukset lopettavat itsensä
const odota = ms => new Promise(r => setTimeout(r, ms));
// Jarno 11.10: pienellä ruudulla kysymys katosi ylös ennen kuin ehti lukea. Siksi ensin
// pienennetään tekstiä niin, että koko keskustelu mahtuu (enintään 65 %:iin), ja vasta sitten rullataan.
let perusKoko = 0;
function rullaa(){
  const v = $('.tk-viestit');
  if (!perusKoko) perusKoko = parseFloat(getComputedStyle(v).fontSize);
  let fs = parseFloat(v.style.fontSize) || perusKoko;
  while (v.scrollHeight > v.clientHeight + 1 && fs > perusKoko*.65) { fs -= .5; v.style.fontSize = fs + 'px'; }
  v.scrollTop = v.scrollHeight;
}

async function toista(keskustelu, oma){
  const viestit = $('.tk-viestit'), kentta = $('.tk-kentta');
  viestit.innerHTML = ''; viestit.style.fontSize = ''; perusKoko = 0; kentta.textContent = 'Kirjoita viesti…'; kentta.className = 'tk-kentta tyhja';
  await odota(500);
  for (const v of keskustelu) {
    if (oma !== ajo) return;
    if (v.k === 'sina') {
      kentta.className = 'tk-kentta';
      for (let i = 1; i <= v.t.length; i += 3) {             // kirjoitus: ~3 merkkiä / 16 ms
        if (oma !== ajo) return;
        kentta.innerHTML = esc(v.t.slice(0, i)) + '<span class="tk-kursori"></span>';
        await odota(16);
      }
      await odota(350);
      kentta.textContent = 'Kirjoita viesti…'; kentta.className = 'tk-kentta tyhja';
      const d = document.createElement('div'); d.className = 'tk-sina'; d.textContent = v.t;
      viestit.appendChild(d); rullaa();
      await odota(300);
    } else {
      const d = document.createElement('div'); d.className = 'tk-ai';
      d.innerHTML = '<span class="tk-pisteet"><span></span><span></span><span></span></span>';
      viestit.appendChild(d); rullaa();
      await odota(800);
      const sanat = v.t.split(/(\s+)/);
      for (let i = 1; i <= sanat.length; i += 2) {           // vastaus sana kerrallaan
        if (oma !== ajo) return;
        d.innerHTML = muotoile(sanat.slice(0, i).join(''));
        rullaa();
        await odota(45);
      }
      await odota(600);
    }
  }
}

window.naytaChat = function(p){
  if (p && Array.isArray(p.chat)) {
    const oma = ++ajo;
    el.style.opacity = 1;
    toista(p.chat, oma);
  } else if (el.style.opacity !== '0') { ajo++; el.style.opacity = 0; }
};
})();
