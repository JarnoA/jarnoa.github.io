// ============================================================================
// QR-KOODI (TF 17.10.2026, Jarno: "build QR to thank you and last page to stay").
// csy.fi/toolfair -sivulle (kuvat/qr-toolfair.png, tehty segnolla). Näkyy
// pysähdyksillä QR_PYSAHDYKSET ja pysyy paikallaan niiden välillä (ei välähdä).
// Oikea alakulma, alatunnisteen yläpuolella.
// ============================================================================
(function(){
'use strict';
const QR_PYSAHDYKSET = [5200, 5300];   // "Thank you." + loppukuva (valas)
const OSOITE = 'csy.fi/toolfair';

const el = document.createElement('div');
el.id = 'qr-toolfair';
el.style.cssText = 'position:fixed;right:2.2vw;bottom:7vh;z-index:6;pointer-events:none;opacity:0;transform:translateY(12px);transition:opacity .8s ease,transform .8s ease;' +
  'background:#fff;border-radius:1.2vh;padding:1.2vh 1.2vh .8vh;box-shadow:0 1vh 3vh rgba(0,0,0,.45);text-align:center;';
el.innerHTML = '<img src="kuvat/qr-toolfair.png" alt="" style="display:block;width:20vh;height:20vh;image-rendering:pixelated;">' +
  '<div style="font:700 2.1vh Georgia,serif;color:#111;margin-top:.6vh;letter-spacing:.02em;">' + OSOITE + '</div>';
function liita(){ document.body.appendChild(el); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let nakyy = false;
setInterval(() => {
  if (typeof PYSAHDYKSET_2D === 'undefined' || typeof indeksi === 'undefined') return;
  const p = PYSAHDYKSET_2D[indeksi];
  const pitaa = !!p && QR_PYSAHDYKSET.includes(p.x);
  if (pitaa === nakyy) return;
  nakyy = pitaa;
  el.style.opacity = pitaa ? 1 : 0;
  el.style.transform = pitaa ? 'none' : 'translateY(12px)';
}, 200);
})();
