// ============================================================================
// SORMUS (27.10.2026, x:7895, toinen klikkaus Palantirin jälkeen). Jarno:
// "animate somway the gollum and the ring" -> valittu A: yleisön valitsema opas
// on "Klonkku". Ei Klonkku-kuvaa (ei GLB:tä, ei Geminiä) - opas hiipii
// (hahmoAnimaatio 'Sneak') ja tuijottaa sormusta.
//
// Kulku: ruutu tummuu, maassa hehkuu kultainen sormus oppaan edessä, jae palaa
// esiin tulikirjaimin rivi kerrallaan, lopuksi sormuksen hehku muuttuu
// puhelimen valoksi, joka valaisee oppaan kasvot; sormus jää hehkumaan puhelimen
// ruudulle (27.10). Sormus = algoritmi, opas = me.
// Sormus piirretään koodilla (esine, ei hahmo).
//
// Käyttö esitys-data.js:ssä: `sormus: true` (+ hahmoAnimaatio:'Sneak').
// Jae = Jarnon sanat 27.10.2026, ei muuteta.
// ============================================================================
(function(){
'use strict';
const JAE = ['Yksi algoritmi heitä kuuntelee, Yksi heitä hallitsee',
             'Yksi algoritmi heidät yhteen sitoo ja pimeyteen kahlitsee'];
const T_SORMUS = .2, T_RIVI = [.8, 2.9], KIRJAIN = .028, T_PUHELIN = 5.2;   // 27.10 Jarno: nopeampi

const cv = document.createElement('canvas');
cv.id = 'sormus';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

// oppaan paikka ruudulla (sama tapa kuin esitys-2d-lisat.js:ssä)
function opas(){
  const sc = window.__paaKohtaus; if (!sc || !sc.hahmo || !sc.hahmo.visible) return null;
  const o = sc.hahmo, cam = sc.cameras.main, kx = W / sc.scale.width, ky = H / sc.scale.height, b = o.getBounds();
  return { x: (b.centerX - cam.scrollX*(o.scrollFactorX ?? 1)) * kx, y: (b.top - cam.scrollY*(o.scrollFactorY ?? 1)) * ky,
           ala: (b.bottom - cam.scrollY) * ky, w: b.width * kx, h: b.height * ky };
}

const sstep = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u*u*(3 - 2*u); };
let aktiivinen = false, raf = 0, t0 = 0;

function piirraSormus(x, y, r, kulta, hehku){
  ctx.save();
  ctx.shadowColor = `rgba(255,190,80,${.9*hehku})`; ctx.shadowBlur = r*1.6*hehku;
  const g = ctx.createLinearGradient(x - r, y - r*.4, x + r, y + r*.4);
  g.addColorStop(0, '#7a5413'); g.addColorStop(.35, '#f6d36b'); g.addColorStop(.55, '#fff3c0'); g.addColorStop(.8, '#c9921f'); g.addColorStop(1, '#6b470e');
  ctx.globalAlpha = kulta;
  ctx.strokeStyle = g; ctx.lineWidth = r*.32;
  ctx.beginPath(); ctx.ellipse(x, y, r, r*.36, 0, 0, Math.PI*2); ctx.stroke();
  ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,250,220,.55)'; ctx.lineWidth = r*.06;
  ctx.beginPath(); ctx.ellipse(x, y - r*.05, r*.92, r*.3, 0, Math.PI*1.05, Math.PI*1.7); ctx.stroke();
  ctx.restore();
}

function piirraJae(t){
  const koko0 = H*.05;
  JAE.forEach((rivi, i) => {
    const alku = T_RIVI[i]; if (t < alku) return;
    const n = Math.min(rivi.length, Math.floor((t - alku) / KIRJAIN));
    ctx.save();
    let px = koko0; ctx.font = `italic 600 ${Math.round(px)}px Georgia,Garamond,"Times New Roman",serif`;
    const tw = ctx.measureText(rivi).width; if (tw > W*.92) { px *= W*.92 / tw; ctx.font = `italic 600 ${Math.round(px)}px Georgia,Garamond,"Times New Roman",serif`; }
    const leveys = ctx.measureText(rivi).width, x0 = W/2 - leveys/2, y = H*.16 + i*px*1.55;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    let x = x0;
    for (let k = 0; k < n; k++) {
      const c = rivi[k], ika = (t - alku) - k*KIRJAIN, w = ctx.measureText(c).width;
      const kuuma = Math.max(0, 1 - ika/1.2);                                // juuri syttynyt kirjain hehkuu valkoisena
      const valo = .82 + .18*Math.sin(t*9 + k*1.7);                           // tulen värinä
      ctx.shadowColor = 'rgba(255,110,20,.95)'; ctx.shadowBlur = px*(.35 + .4*kuuma);
      ctx.fillStyle = kuuma > .05 ? `rgb(255,${Math.round(170 + 85*kuuma)},${Math.round(70 + 170*kuuma)})` : `rgba(255,${Math.round(120 + 40*valo)},40,${valo})`;
      ctx.fillText(c, x, y);
      x += w;
    }
    ctx.restore();
  });
}

function kehys(nyt){
  if (!aktiivinen) return;
  raf = requestAnimationFrame(kehys);
  const t = (nyt - t0) / 1000;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  const o = opas() || { x: W*.42, y: H*.72, ala: H*.9, w: H*.16, h: H*.14 };
  const sx = o.x + o.w*.95, sy = o.ala - H*.012, r = Math.max(H*.035, o.h*.28);
  const puhelin = sstep(T_PUHELIN, T_PUHELIN + 1.0, t);

  // pimennys, valoaukko sormuksen ympärillä
  const tumma = sstep(0, .6, t);
  const vg = ctx.createRadialGradient(sx, sy, r*.5, sx, sy, Math.max(W, H)*.75);
  vg.addColorStop(0, 'rgba(5,6,12,0)'); vg.addColorStop(.25, `rgba(5,6,12,${.45*tumma})`); vg.addColorStop(1, `rgba(5,6,12,${.78*tumma})`);
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // sormus
  const ilmesty = sstep(T_SORMUS, T_SORMUS + .6, t), syke = .75 + .25*Math.sin(t*2.4);
  if (ilmesty > 0 && puhelin <= 0) piirraSormus(sx, sy, r, ilmesty, ilmesty*syke);

  // puhelin nousee sormuksen paikalle, valo oppaan kasvoille
  if (puhelin > 0) {
    const pw = r*1.2, ph = r*2.1, px = sx - pw/2, py = sy - ph*puhelin - r*.2;
    ctx.save();
    ctx.globalAlpha = puhelin*.5;
    const kx = o.x + o.w*.15, ky = o.y + o.h*.3;
    const valo = ctx.createLinearGradient(sx, py + ph*.4, kx, ky);
    valo.addColorStop(0, 'rgba(170,215,255,.85)'); valo.addColorStop(1, 'rgba(170,215,255,0)');
    ctx.fillStyle = valo; ctx.beginPath(); ctx.moveTo(px, py + ph*.15); ctx.lineTo(px + pw*.2, py + ph*.85);
    ctx.lineTo(kx, ky + o.h*.35); ctx.lineTo(kx, ky - o.h*.25); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = puhelin;
    ctx.shadowColor = 'rgba(150,205,255,.9)'; ctx.shadowBlur = r*1.4;
    ctx.fillStyle = '#0c0d12'; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, pw*.16); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = `rgba(28,40,70,${.9 + .1*Math.sin(t*3)})`;
    ctx.beginPath(); ctx.roundRect(px + pw*.1, py + pw*.14, pw*.8, ph - pw*.28, pw*.08); ctx.fill();
    ctx.restore();
    // 27.10 Jarno: sormus näkyy puhelimen sisällä - liukuu maasta ruudulle ja kutistuu
    const rx = sx + ((px + pw/2) - sx)*puhelin, ry = sy + ((py + ph*.5) - sy)*puhelin, rr = r*(1 - .62*puhelin);
    piirraSormus(rx, ry, rr, 1, syke);
  }

  piirraJae(t);
}

window.naytaSormus = function(p){
  if (p && p.sormus) {
    if (aktiivinen) return;
    koko(); aktiivinen = true; t0 = performance.now(); cv.style.opacity = 1;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
  } else if (aktiivinen) {
    aktiivinen = false; cv.style.opacity = 0;
    setTimeout(() => { if (!aktiivinen) { cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); } }, 650);
  }
};
})();
