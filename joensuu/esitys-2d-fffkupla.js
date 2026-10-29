// ============================================================================
// FRIDAYS FOR FUTURE -KUPLA (Joensuu 26.10.2026, x:8940 "Algoritmit luovat myös
// turvaa"). Jarno: "another bubble on right ... cropped as round video of
// demonstration_fff.mp4" - algoritmit voivat myös tuoda ihmiset yhteen ja
// mahdollistaa Fridays for Future -mielenosoitukset.
//
// Käyttö esitys-data.js:ssä: `fffKupla: true` (kissakupla `kupla: true` ja
// avaruusalus `kilpi: true` pysyvät ennallaan keskellä/vasemmalla).
// Video: assets/2d/video/demonstration_fff_pyorea.mp4 = Pohjan
// demonstration_fff.mp4 rajattuna neliöksi 720x720, ilman ääntä.
// Lasipinta samaa tyyliä kuin moottorin #kupla.
// ============================================================================
(function(){
'use strict';
const VIDEO = 'assets/2d/video/demonstration_fff_pyorea.mp4';
const VIIVE_MS = 1200;   // ilmestyy hetken kissakuplan jälkeen

const tyyli = document.createElement('style');
tyyli.textContent = `
#fffkupla{position:fixed;left:79%;top:46%;transform:translate(-50%,-50%) scale(.85);z-index:5;width:min(30vw,280px);aspect-ratio:1/1;opacity:0;pointer-events:none;
  transition:opacity .7s ease,transform .7s cubic-bezier(.3,1.4,.5,1);animation:kupla-kellu 5.2s ease-in-out infinite;animation-delay:-1.7s}
#fffkupla.nakyy{opacity:1;transform:translate(-50%,-50%) scale(1)}
#fffkupla .sisus{position:absolute;inset:0;border-radius:50%;overflow:hidden;background:#1b2a3a}
#fffkupla video{width:100%;height:100%;object-fit:cover;display:block}
#fffkupla .pinta{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 32% 26%, rgba(255,255,255,.45), rgba(255,255,255,.04) 32%, rgba(140,200,255,.06) 60%, rgba(100,170,240,.24) 100%);
  box-shadow:inset 0 0 22px rgba(255,255,255,.35), inset 0 0 55px rgba(120,190,255,.2), 0 8px 30px rgba(0,20,45,.4);border:2px solid rgba(255,255,255,.6)}
#fffkupla .kiilto{position:absolute;left:15%;top:12%;width:32%;height:20%;border-radius:50%;background:radial-gradient(ellipse, rgba(255,255,255,.8), rgba(255,255,255,0) 72%)}
`;
const el = document.createElement('div');
el.id = 'fffkupla';
el.innerHTML = '<div class="sisus"><video muted loop playsinline preload="auto" src="' + VIDEO + '"></video></div><div class="pinta"></div><div class="kiilto"></div>';
const video = () => el.querySelector('video');
function liita(){ document.head.appendChild(tyyli); document.body.appendChild(el); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let ajastin = 0;
window.naytaFffKupla = function(p){
  clearTimeout(ajastin);
  if (!(p && p.fffKupla)) { el.classList.remove('nakyy'); video().pause(); return; }
  ajastin = setTimeout(() => {
    try { video().currentTime = 0; } catch (e) {}
    video().play().catch(() => {});
    el.classList.add('nakyy');
  }, VIIVE_MS);
};
})();
