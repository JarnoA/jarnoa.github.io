// ============================================================================
// PIMEYS (TF 15.10.2026): montaasin jälkeinen hiljaisuus x:2000 - koko ruutu
// mustaksi, kaikki (opas, tyttö, tekstit) peittyy. "BLACK. Silence. Count to four."
// Käyttö esitys-data.js:ssä: `pimea: true`. Seuraava klikkaus häivyttää pois.
// ============================================================================
(function(){
'use strict';
const el = document.createElement('div');
el.id = 'pimea';
el.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9000;pointer-events:none;opacity:0;transition:opacity 1.2s ease;';
function liita(){ document.body.appendChild(el); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();
window.naytaPimea = function(p){
  el.style.transitionDuration = (p && p.pimea) ? '1.2s' : '0.8s';
  el.style.opacity = (p && p.pimea) ? 1 : 0;
};
})();
