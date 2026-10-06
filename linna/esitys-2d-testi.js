// ============================================================================
// TESTISIVU (6.10.2026). Ä = avaa/sulje. Jarno: "alussa voin testata äänen
// ennen esitystä", samalla ajatuksella kuin G (paluu oppaan valintaan).
//
// Koko ruudun päälle tulee teksti "Testi", iso lohikäärme lentää edestakaisin
// (sama dragon-fly.png kuin taivaan lohikäärmeellä) ja Neil Lawrencen
// huomio-sitaatti (Sounds/huomio.mp3) soi silmukkana, jotta äänenvoimakkuuden
// ehtii säätää salin laitteista. Ääni HTML5 <audio>:lla, ei Phaserin Sound
// Managerilla (sama syy kuin aaniraita-korjauksessa 8.9.2026).
// Kun sivu on auki, muut näppäimet ja klikkaukset eivät liikuta esitystä
// (F eli koko näyttö toimii). Sulkiessa ääni pysähtyy ja palaa alkuun.
// ============================================================================
(function(){
'use strict';
if (new URLSearchParams(location.search).get('esikatselu') === '1') return;
const KW = 325, KH = 363, LYONTI = [6,7,8,9,10,11,12,13];
const kuva = new Image(); kuva.src = 'assets/2d/sprites/dragon-fly.png';
const aani = new Audio('Sounds/huomio.mp3'); aani.loop = true; aani.preload = 'auto';

const el = document.createElement('div'); el.id = 'testisivu';
el.style.cssText = 'position:fixed;inset:0;z-index:100;display:none;background:radial-gradient(ellipse at 50% 40%, #1d3a4a 0%, #0a0e14 75%);font-family:Georgia,Garamond,"Times New Roman",serif;color:#f6efe4;';
el.innerHTML = '<canvas style="position:absolute;inset:0;width:100%;height:100%"></canvas>'
  + '<div style="position:absolute;left:0;right:0;top:9vh;text-align:center;pointer-events:none;text-shadow:0 3px 18px rgba(0,0,0,.85)">'
  + '<div style="font-size:12vh;color:#f2c14e;font-weight:bold;letter-spacing:.04em">Testi</div>'
  + '<div class="testi-tila" style="font-size:3vh;margin-top:1.5vh;opacity:.85">Ääni: Neil Lawrence</div></div>'
  + '<div style="position:absolute;left:0;right:0;bottom:4vh;text-align:center;font-size:2.2vh;opacity:.5">Ä = sulje</div>';
const cv = el.querySelector('canvas'), ctx = cv.getContext('2d'), tilaEl = el.querySelector('.testi-tila');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(el));

let auki = false, raf = 0, t0 = 0, W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

function kehys(nyt){
  raf = requestAnimationFrame(kehys);
  const t = (nyt - t0) / 1000;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  if (!kuva.complete || !kuva.naturalWidth) return;
  // edestakainen lento: 7 s vasemmalle, käännös, 7 s oikealle
  const kierros = 14, u = (t % kierros) / kierros, vasemmalle = u < 0.5;
  const v = vasemmalle ? u * 2 : (u - 0.5) * 2;
  const k = H * 0.9, l = k * KW / KH;
  const x = vasemmalle ? W + l*0.6 - v*(W + l*1.2) : -l*0.6 + v*(W + l*1.2);
  const y = H * 0.56 + Math.sin(t * 0.9) * H * 0.06;
  const f = LYONTI[Math.floor(t * 10) % LYONTI.length];
  ctx.save(); ctx.translate(x, y); if (!vasemmalle) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(kuva, f*KW, 0, KW, KH, -l/2, -k/2, l, k);
  ctx.restore();
}

function avaa(){
  auki = true; el.style.display = 'block'; t0 = performance.now();
  cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
  aani.currentTime = 0;
  aani.play().then(() => { tilaEl.textContent = 'Ääni: Neil Lawrence'; })
    .catch(() => { tilaEl.textContent = 'Ääni ei käynnistynyt - klikkaa ruutua'; });
}
function sulje(){
  auki = false; el.style.display = 'none'; cancelAnimationFrame(raf);
  aani.pause(); aani.currentTime = 0;
}

// capture-vaihe: ehditään ennen esityksen omaa näppäinkäsittelyä
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey) return;
  if (e.key === 'ä' || e.key === 'Ä') { e.preventDefault(); e.stopImmediatePropagation(); auki ? sulje() : avaa(); return; }
  if (auki && e.key !== 'f' && e.key !== 'F') { e.preventDefault(); e.stopImmediatePropagation(); }
}, true);
addEventListener('click', e => {
  if (!auki) return;
  e.stopImmediatePropagation();
  if (aani.paused) aani.play().then(() => { tilaEl.textContent = 'Ääni: Neil Lawrence'; }).catch(() => {});
}, true);
})();
