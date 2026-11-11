// ============================================================================
// SIVULAATIKKO (Oulu 11.11.2026, Jarno: "pitäiskö ihmiselle sittenkin tuoda
// ruudulle mitä muistiinpanoissa on = konkretiaa, pienempinä vaikka oikeaan
// laitaan?" -> "ok, tee"). Pieni tumma laatikko oikeaan alakulmaan: yksi
// konkreettinen lause + lähde. Otsikko ja alaotsikko pysyvät ennallaan.
// Ilmestyy hetken viiveellä otsikon jälkeen.
//
// Käyttö esitys-data.js:ssä:
//   sivulaatikko: { teksti: '…', lahde: 'Musta laatikko', viive: 1800 }
// ============================================================================
(function(){
'use strict';
const tyyli = document.createElement('style');
tyyli.textContent = `
#sivulaatikko{position:fixed;right:2.5vw;bottom:15vh;max-width:min(27vw,520px);z-index:6;pointer-events:none;
  background:rgba(20,24,30,.8);border-left:4px solid #B0CB40;border-radius:10px;padding:1.4vh 1.4vw;
  font:400 clamp(14px,1.55vw,30px)/1.35 Georgia,'EB Garamond',serif;color:#f4efe4;
  box-shadow:0 1vh 3vh rgba(0,0,0,.4);opacity:0;transform:translateY(10px);transition:opacity .6s ease,transform .6s ease}
#sivulaatikko.nakyy{opacity:1;transform:none}
#sivulaatikko .lahde{display:block;margin-top:.8vh;font-size:.62em;font-style:italic;color:#c9c2b4}
`;
document.head.appendChild(tyyli);
const el = document.createElement('div');
el.id = 'sivulaatikko';
function liita(){ document.body.appendChild(el); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let ajastin = 0;
window.naytaSivulaatikko = function(p){
  clearTimeout(ajastin);
  const s = p && p.sivulaatikko;
  if (!s) { el.classList.remove('nakyy'); return; }
  el.classList.remove('nakyy');
  ajastin = setTimeout(() => {
    el.innerHTML = s.teksti + (s.lahde ? `<span class="lahde">${s.lahde}</span>` : '');
    el.classList.add('nakyy');
  }, s.viive != null ? s.viive : 1800);
};
})();
