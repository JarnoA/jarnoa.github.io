// ============================================================================
// SATELLIITTI (TF 17.10.2026, Jarno: "satellite image of Muhos, compare previous
// and after situation, in narrative way"). x:1357 "Over 500 hectares":
// kehystetty Sentinel-2-kuva Muhoksesta, ensin 3.10.2025 (metsää), sitten keltainen
// pyyhkäisyviiva paljastaa 16.10.2026 (hakkuu). Jarno haki kuvat Copernicus
// Browserista. Lisenssi: "Contains modified Copernicus Sentinel data".
// ============================================================================
(function(){
'use strict';
const X = 1357;
const ENNEN = 'kuvat/muhos-2025-10-03.jpg', JALKEEN = 'kuvat/muhos-2026-10-16.jpg';
const VIIVE_MS = 1800, PYYHKAISY_MS = 2600;   // 17.10 Jarno: 1300/1800 liian nopea, 2500/3500 liian hidas

const tyyli = document.createElement('style');
tyyli.textContent = `
#satelliitti{position:fixed;left:4vw;top:22vh;transform:translateY(14px);height:62vh;aspect-ratio:990/779;max-width:50vw;z-index:5;pointer-events:none;opacity:0;transition:opacity .6s ease,transform .6s ease}
#satelliitti.nakyy{opacity:1;transform:none}
#satelliitti .kehys{position:relative;width:100%;height:100%;border:.55vh solid #f6efe4;border-radius:1vh;overflow:hidden;box-shadow:0 1.6vh 4vh rgba(0,0,0,.6);background:#1b2a1b}
#satelliitti img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
#satelliitti .jalkeen{clip-path:inset(0 100% 0 0)}
#satelliitti .viiva{position:absolute;top:0;bottom:0;left:0;width:.5vh;background:#f2c94c;box-shadow:0 0 1.6vh .4vh rgba(242,201,76,.7);opacity:0}
#satelliitti .pvm{position:absolute;top:1.6vh;left:1.6vh;font:800 3.2vh/1 Georgia,serif;color:#fff;background:rgba(11,16,32,.72);padding:.8vh 1.4vh;border-radius:.8vh;letter-spacing:.02em}
#satelliitti .pvm span{color:#f2c94c}
#satelliitti .ha{position:absolute;left:62%;top:40%;font:900 4.2vh/1 Georgia,serif;color:#0b1020;background:#f2c94c;padding:.7vh 1.4vh;border-radius:.9vh;box-shadow:0 .6vh 2vh rgba(0,0,0,.55);opacity:0;transform:scale(.6);transform-origin:left center;transition:opacity .5s ease,transform .5s cubic-bezier(.3,1.6,.5,1)}
#satelliitti .ha::before{content:"";position:absolute;left:-1.3vh;top:50%;transform:translateY(-50%);border:1vh solid transparent;border-right:1.4vh solid #f2c94c;border-left:0}
#satelliitti .ha.esiin{opacity:1;transform:none}
#satelliitti .kuvateksti{margin-top:.9vh;text-align:center;font:600 1.7vh/1.3 Georgia,serif;color:#f6efe4;text-shadow:0 1px 4px rgba(0,0,0,.8)}
`;
const el = document.createElement('div');
el.id = 'satelliitti';
el.innerHTML = '<div class="kehys"><img class="ennen" src="' + ENNEN + '" alt=""><img class="jalkeen" src="' + JALKEEN + '" alt="">'
  + '<div class="viiva"></div><div class="pvm"></div></div>'
  + '<div class="kuvateksti">Muhos, one of the two sites · Contains modified Copernicus Sentinel data 2025–2026 · Yle, 2026</div>';
// --- 700 jalkapallokenttää oikealla (19.10 Jarno: "on right football fields, equal to 700") ---
// 500 ha / 0,714 ha (105 x 68 m) ≈ 700. Kentät täyttyvät riveittäin pyyhkäisyn jälkeen.
const KENTAT = 700, SARAKKEET = 28, RIVIT = 25, TAYTTO_MS = 2600;
const kentatTyyli = document.createElement('style');
kentatTyyli.textContent = `
#kentat{position:fixed;left:57vw;top:24vh;width:39vw;z-index:5;pointer-events:none;opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s ease;text-align:center}
#kentat.nakyy{opacity:1;transform:none}
#kentat canvas{display:block;width:100%;image-rendering:pixelated}
#kentat .luku{margin-top:2vh;font:900 6.2vh/1 Georgia,serif;color:#f2c94c;text-shadow:0 .4vh 1.6vh rgba(0,0,0,.7)}
#kentat .selite{margin-top:1vh;font:600 2vh/1.3 Georgia,serif;color:#f6efe4;text-shadow:0 1px 4px rgba(0,0,0,.8)}
`;
const kentatEl = document.createElement('div');
kentatEl.id = 'kentat';
kentatEl.innerHTML = '<canvas width="' + (SARAKKEET*15) + '" height="' + (RIVIT*11) + '"></canvas><div class="luku">= 700 football fields</div><div class="selite">1 football field ≈ 0.7 ha</div>';
const kentat = { alku: null, raf: 0 };
function piirraKentat(osuus){
  const c = kentatEl.querySelector('canvas'), g = c.getContext('2d'), n = Math.round(KENTAT * osuus);
  g.clearRect(0, 0, c.width, c.height);
  for (let i = 0; i < n; i++) {
    const x = (i % SARAKKEET) * 15, y = Math.floor(i / SARAKKEET) * 11;
    g.fillStyle = '#3f8f4f'; g.fillRect(x + 1, y + 1, 13, 9);           // nurmi
    g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(x + 7, y + 1, 1, 9); // keskiviiva
    g.fillRect(x + 1, y + 1, 13, 1); g.fillRect(x + 1, y + 9, 13, 1); g.fillRect(x + 1, y + 1, 1, 9); g.fillRect(x + 13, y + 1, 1, 9);
  }
}
function taytaKentat(){
  kentatEl.classList.add('nakyy');
  const alku = performance.now();
  const askel = t => { const k = Math.min(1, (t - alku) / TAYTTO_MS); piirraKentat(k); if (k < 1) kentat.raf = requestAnimationFrame(askel); };
  kentat.raf = requestAnimationFrame(askel);
}
function liita(){ document.head.appendChild(tyyli); document.head.appendChild(kentatTyyli); document.body.appendChild(el); document.body.appendChild(kentatEl); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

const jalkeen = () => el.querySelector('.jalkeen'), viiva = () => el.querySelector('.viiva'), pvm = () => el.querySelector('.pvm');
let raf = 0, ajastin = 0, paalla = false;
function nollaa(){
  cancelAnimationFrame(raf); clearTimeout(ajastin);
  jalkeen().style.clipPath = 'inset(0 100% 0 0)'; viiva().style.opacity = 0; viiva().style.left = '0';
  pvm().innerHTML = 'October <span>2025</span>';
  kentat.alku = null; piirraKentat(0); kentatEl.classList.remove('nakyy');
}
function pyyhi(){
  const alku = performance.now();
  viiva().style.opacity = 1;
  const askel = t => {
    const k = Math.min(1, (t - alku) / PYYHKAISY_MS), e = k < .5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2)/2;
    const pros = (e * 100).toFixed(2);
    jalkeen().style.clipPath = 'inset(0 ' + (100 - pros) + '% 0 0)';
    viiva().style.left = 'calc(' + pros + '% - .25vh)';
    if (k > .5) pvm().innerHTML = 'October <span>2026</span>';
    if (k < 1) raf = requestAnimationFrame(askel); else { viiva().style.opacity = 0; ajastin = setTimeout(taytaKentat, 350); }
  };
  raf = requestAnimationFrame(askel);
}
setInterval(() => {
  if (typeof PYSAHDYKSET_2D === 'undefined' || typeof indeksi === 'undefined') return;
  const p = PYSAHDYKSET_2D[indeksi], pitaa = !!p && p.x === X;
  if (pitaa === paalla) return;
  paalla = pitaa;
  if (pitaa) {
    nollaa(); el.classList.add('nakyy');
    if (typeof ESIKATSELU !== 'undefined' && ESIKATSELU) { jalkeen().style.clipPath = 'none'; pvm().innerHTML = 'October <span>2026</span>'; kentatEl.classList.add('nakyy'); piirraKentat(1); return; }
    ajastin = setTimeout(pyyhi, VIIVE_MS);
  } else { el.classList.remove('nakyy'); kentatEl.classList.remove('nakyy'); clearTimeout(ajastin); cancelAnimationFrame(raf); cancelAnimationFrame(kentat.raf); }
}, 150);
})();
