// ============================================================================
// PEUKALOSELAUS (Oulu 10.11.2026, x:8190 "Tunne tavoittaa meidät ennen kuin
// ymmärrys."). Jarno: "skrollaukseen liittyvä voisi olla myös mukana? ei
// samanlainen kuin doom scrolling" -> valinta B: peukalo ja kortit.
//
// Kulku: oikealla vaalea, rauhallinen syöte (pastellikortit, ei doom-tummuutta).
// Peukalo (👆-emoji, ei koodilla piirrettyä kättä) pyyhkäisee kortteja ylös
// muutaman kerran. Viidennen kortin kohdalla peukalo pysähtyy kesken liikkeen,
// kortti hehkuu ja siitä nousee kolme tunnetta tekstin mukaan:
// 😠 ärsyttää, 😊 ilahduttaa, 💬 puhuttelee. Kerran per pysähdys.
// Toimii yhdessä tunnevalo-perhosen kanssa (eri kangas, z 4 = tekstin alla).
// Käyttö esitys-data.js:ssä: `peukaloselaus: true`.
// ============================================================================
(function(){
'use strict';
const T_ALKU = 0.8;          // s, ensimmäinen pyyhkäisy
const PYYHKAISY = 1.15;      // s / pyyhkäisy
const N_PYYHK = 4;           // täyttä pyyhkäisyä ennen pysähdystä
const TUNTEET = ['😠', '😊', '💬'];
const VARIT = ['#f6c6c6', '#c9e4f6', '#f8e3a8', '#cdeccf', '#e2d2f4', '#f9d3b4', '#c6ece8'];

const cv = document.createElement('canvas');
cv.id = 'peukaloselaus';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
function liita(){ document.body.appendChild(cv); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

const sstep = u => u <= 0 ? 0 : u >= 1 ? 1 : u*u*(3 - 2*u);
const ulos = u => 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 3);

function pyorea(x, y, w, h, r){
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

let aktiivinen = false, raf = 0, t0 = 0;

// Syötteen sijainti 16:9-kehyksen mukaan: kehys on ruudun alaosassa (KH = min(H, W*9/16)).
function asettelu(){
  const KH = Math.min(H, W*9/16), KY = H - KH;
  const h = KH*0.56, w = Math.min(h*0.56, W*0.2);
  const x = W*0.93 - w, y = KY + KH*0.30;
  return { x, y, w, h, kortti: h*0.42, vali: h*0.04 };
}

function kehys(nyt){
  if (!aktiivinen) return;
  raf = requestAnimationFrame(kehys);
  const t = (nyt - t0)/1000;
  const L = asettelu(), askel = L.kortti + L.vali;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);

  // vaihe: montako pyyhkäisyä tehty ja missä kohtaa nykyistä
  const tt = t - T_ALKU;
  const i = Math.max(0, Math.floor(tt / PYYHKAISY)), u = tt < 0 ? 0 : (tt % PYYHKAISY) / PYYHKAISY;
  const pysahtynyt = i >= N_PYYHK;
  let siirto, peukaloU;                     // siirto korttiaskelina, peukalon liike 0..1
  if (!pysahtynyt) { siirto = i + ulos((u - 0.15)/0.55); peukaloU = u; }
  else { siirto = N_PYYHK + 0.32; peukaloU = 0.42; }   // jähmettyy kesken pyyhkäisyn

  // ruutu
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = L.w*0.08;
  pyorea(L.x - L.w*0.05, L.y - L.w*0.05, L.w*1.1, L.h + L.w*0.1, L.w*0.12);
  ctx.fillStyle = '#2b2b33'; ctx.fill(); ctx.restore();
  pyorea(L.x, L.y, L.w, L.h, L.w*0.08); ctx.fillStyle = '#fbf8f1'; ctx.fill();
  ctx.save(); pyorea(L.x, L.y, L.w, L.h, L.w*0.08); ctx.clip();

  const kohdeIdx = N_PYYHK + 1;           // kortti, johon pysähdytään
  for (let k = 0; k < kohdeIdx + 3; k++) {
    const ky = L.y + L.vali + (k - siirto)*askel;
    if (ky > L.y + L.h || ky + L.kortti < L.y) continue;
    const kx = L.x + L.w*0.07, kw = L.w*0.86;
    const kohde = k === kohdeIdx && pysahtynyt;
    const hehku = kohde ? Math.min(1, (tt - N_PYYHK*PYYHKAISY)*2) : 0;
    ctx.save();
    if (hehku > 0) { ctx.shadowColor = `rgba(255,70,80,${0.9*hehku})`; ctx.shadowBlur = L.w*0.12*hehku; }
    pyorea(kx, ky, kw, L.kortti, L.w*0.05); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.restore();
    if (hehku > 0) { ctx.save(); ctx.strokeStyle = `rgba(255,59,74,${hehku})`; ctx.lineWidth = Math.max(2, L.w*0.018); pyorea(kx, ky, kw, L.kortti, L.w*0.05); ctx.stroke(); ctx.restore(); }
    // "video": värilaatta + toistokolmio, alla kaksi tekstiriviä
    const vh = L.kortti*0.66;
    pyorea(kx + kw*0.05, ky + L.kortti*0.06, kw*0.9, vh, L.w*0.03); ctx.fillStyle = VARIT[k % VARIT.length]; ctx.fill();
    const cx = kx + kw*0.5, cy = ky + L.kortti*0.06 + vh*0.5, s = vh*0.16;
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.moveTo(cx - s*0.6, cy - s); ctx.lineTo(cx + s, cy); ctx.lineTo(cx - s*0.6, cy + s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d9d4ca';
    ctx.fillRect(kx + kw*0.05, ky + L.kortti*0.78, kw*0.7, L.kortti*0.06);
    ctx.fillRect(kx + kw*0.05, ky + L.kortti*0.88, kw*0.45, L.kortti*0.06);
  }
  ctx.restore();

  // tunteet nousevat pysähtyneestä kortista
  if (pysahtynyt) {
    const ts = tt - N_PYYHK*PYYHKAISY - 0.5;
    const ky = L.y + L.vali + (kohdeIdx - siirto)*askel;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    TUNTEET.forEach((e, n) => {
      const a = ts - n*0.7; if (a < 0) return;
      const nousu = ulos(a/1.6);
      const x = L.x + L.w*(0.25 + n*0.25) + Math.sin(a*2.4 + n)*L.w*0.04;
      const y = ky + L.kortti*0.3 - nousu*L.h*0.55;
      const koko = L.w*(0.2 + 0.08*Math.min(1, a*3));
      ctx.globalAlpha = Math.min(1, a*3);
      ctx.font = `${Math.round(koko)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.fillText(e, x, y);
    });
    ctx.restore();
  }

  // peukalo: alhaalta ylös ruudun päällä, häipyy palatessa
  if (tt > -0.3) {
    const nakyvyys = pysahtynyt ? 1 : (u < 0.8 ? Math.min(1, (tt + 0.3)*3) : 1 - (u - 0.8)/0.2);
    const py = L.y + L.h*(0.9 - 0.55*sstep(Math.min(1, peukaloU/0.75)));
    ctx.save(); ctx.globalAlpha = Math.max(0, nakyvyys);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.font = `${Math.round(L.w*0.42)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = L.w*0.05;
    ctx.fillText('👆', L.x + L.w*0.62, py);
    ctx.restore();
  }
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaPeukaloselaus = function(p){
  if (p && p.peukaloselaus) {
    if (aktiivinen) return;
    koko(); aktiivinen = true; t0 = performance.now();
    cv.style.opacity = 1; cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
  } else if (aktiivinen) {
    aktiivinen = false; cv.style.opacity = 0;
    setTimeout(() => { if (!aktiivinen) { cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); } }, 650);
  }
};
})();
