// ============================================================================
// ROBOTIN EMPATIA (3.10.2026, x:9240 "Tekoäly ei voi aidosti ymmärtää
// tunteita, mutta se osaa käyttäytyä kuin ymmärtäisi. Joskus sekin voi
// riittää." - 17-vuotias). Jarno: "sounds good, just not too long" (~6 s).
//
// Käyttö esitys-data.js:ssä: `empatia: true` (opas istuu: hahmoAnimaatio 'Sit').
//
// Kulku: istuvan oppaan päällä pieni harmaa pikselipilvi, sataa. Robotti
// (Jarnon robot.glb, värillinen bake robotti-walk-raw.png - siluetti ei erottunut)
// kävelee oikealta oppaan viereen ja pysähtyy. Sen pään yllä siniset
// datapikselit kokoontuvat pikselisydämeksi, joka lämpenee punaiseksi ja
// sykkii. Sade lakkaa, pilvi haihtuu, oppaan päälle tulee lämmin valo.
// Kerran sydän glitchaa hetkeksi takaisin sinisiksi pikseleiksi ja palaa -
// laskettua, ei aitoa, mutta riittää.
//
// Oppaan paikka luetaan Phaser-spritestä (__paaKohtaus.hahmo, luetaan joka
// kehys - vaihdaHahmo luo uuden spriten). Oma kanvaasi tekstin alla (z 4).
// Ei ääniä.
// ============================================================================
(function(){
'use strict';
const ROBO = new Image(); ROBO.src = 'assets/2d/sprites/robotti-walk-raw.png';   // värillinen (Jarno: siluetti ei näkynyt)
const RW = 282, RH = 402, RN = 20, SEISOO = 14;       // kehys 14 = jalat yhdessä
const SYDAN = ['.XXX...XXX.', 'XXXXX.XXXXX', 'XXXXXXXXXXX', 'XXXXXXXXXXX', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..XXXXXXX..', '...XXXXX...', '....XXX....', '.....X.....'];
const SOLUT = []; SYDAN.forEach((r, y) => [...r].forEach((m, x) => { if (m === 'X') SOLUT.push([x, y]); }));

const cv = document.createElement('canvas'); cv.id = 'empatia';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

const sstep = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u*u*(3 - 2*u); };
const rnd = (a, b) => a + Math.random()*(b - a);
const lerp = (a, b, u) => a + (b - a)*u;

let kaynnissa = false, raf = 0, t0 = 0, edT = 0, t = 0, pisarat = [], lahto = null, kohde = null, glitch = null;

function opas(){
  const sc = window.__paaKohtaus; if (!sc || !sc.hahmo) return null;
  const h = sc.hahmo, cam = sc.cameras.main, cr = sc.game.canvas.getBoundingClientRect(), sk = cr.width / sc.scale.width;
  const b = h.getBounds();
  const x = cr.left + (b.x - cam.scrollX*h.scrollFactorX)*sk, y = cr.top + (b.y - cam.scrollY*h.scrollFactorY)*sk;
  return { x, y, w: b.width*sk, h: b.height*sk };
}

function pilvi(cx, cy, s, alfa){
  ctx.globalAlpha = alfa;
  const p = s / 10;
  const muoto = [[2,2,4,2],[1,3,8,2],[0,4,10,2],[4,1,3,2],[6,2,3,2]];
  ctx.fillStyle = '#5d6470';
  for (const [x, y, w, h] of muoto) ctx.fillRect(cx - s/2 + x*p, cy - s*0.3 + y*p, w*p, h*p);
  ctx.fillStyle = '#7a8290';
  ctx.fillRect(cx - s/2 + 4*p, cy - s*0.3 + 1*p, 3*p, p); ctx.fillRect(cx - s/2 + 1*p, cy - s*0.3 + 3*p, 3*p, p);
  ctx.globalAlpha = 1;
}

function kehys(nyt){
  raf = requestAnimationFrame(kehys);
  const dt = Math.min(0.05, (nyt - edT) / 1000); edT = nyt; t = (nyt - t0) / 1000;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  const O = opas(); if (!O) return;
  const maa = O.y + O.h;

  // lämmin valo sateen jälkeen
  const valo = sstep(4.9, 6.1, t);
  if (valo > 0) {
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(O.x + O.w/2, O.y + O.h*0.4, 0, O.x + O.w/2, O.y + O.h*0.4, O.h*1.3);
    g.addColorStop(0, `rgba(255,190,110,${0.22*valo})`); g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g; ctx.fillRect(O.x - O.h*1.5, O.y - O.h*1.5, O.w + O.h*3, O.h*3);
    ctx.globalCompositeOperation = 'source-over';
  }

  // sadepilvi
  const sade = 1 - sstep(4.3, 5.5, t);
  const ps = H*0.13, px = O.x + O.w/2, py = O.y - ps*0.35 - sstep(4.5, 6.4, t)*H*0.05;
  const pilviA = sstep(0, 0.4, t) * (1 - sstep(4.7, 6.4, t));
  if (sade > 0 && Math.random() < sade * 0.9) pisarat.push({ x: px + rnd(-0.4, 0.4)*ps, y: py + ps*0.12, v: H*rnd(0.55, 0.75) });
  ctx.fillStyle = 'rgba(150,180,215,.75)';
  for (let i = pisarat.length - 1; i >= 0; i--) {
    const d = pisarat[i]; d.y += d.v*dt;
    if (d.y > maa) { pisarat.splice(i, 1); continue; }
    ctx.fillRect(d.x, d.y, Math.max(1.5, H*0.0025), H*0.014);
  }
  if (pilviA > 0) pilvi(px, py, ps, pilviA);

  // robotti kävelee viereen
  if (ROBO.complete && ROBO.naturalWidth) {
    const rh = H * 0.30, rw = rh * RW / RH;
    if (!kohde) kohde = O.x + O.w + rw*0.35;
    kohde = lerp(kohde, O.x + O.w + rw*0.35, 0.1);
    const kav = Math.min(1, Math.max(0, (t - 0.2) / 3.0));   // tasainen kävely 3 s
    const x = lerp(W + rw*0.6, kohde, kav);
    const f = kav < 1 ? Math.floor(t*9) % RN : SEISOO;
    ctx.save(); ctx.translate(x, maa);                 // kuva katsoo valmiiksi vasemmalle - ei peilausta
    ctx.drawImage(ROBO, f*RW, 0, RW, RH, -rw/2, -rh, rw, rh);
    ctx.restore();

    // datapikselit → sydän pään yllä
    const p = rh*0.028, sx = x - p*5.5, sy = maa - rh*1.08 - p*10;
    if (!lahto && t > 3.2) lahto = SOLUT.map(() => [x + rnd(-0.12, 0.12)*rw, maa - rh*rnd(0.45, 0.7), rnd(0, 0.5)]);
    if (lahto) {
      if (!glitch && t > 6.9) glitch = SOLUT.map(() => [rnd(-1, 1)*p*4, rnd(-1, 1)*p*4]);
      const g = glitch ? Math.sin(Math.min(1, (t - 6.9) / 0.45) * Math.PI) : 0;
      const syke = 1 + 0.07*Math.max(0, Math.sin(t*5.5))*sstep(4.3, 4.7, t);
      const lampo = sstep(3.9, 4.5, t) * (1 - g);
      SOLUT.forEach(([cx, cy], i) => {
        const [lx, ly, viive] = lahto[i];
        const u = sstep(3.3 + viive, 4.2 + viive*0.4, t);
        const hx = sx + (cx + 0.5 - 5.5)*p*syke + p*5.5, hy = sy + (cy + 0.5 - 5)*p*syke + p*5;
        let xx = lerp(lx, hx, u), yy = lerp(ly, hy, u) - Math.sin(u*Math.PI)*rh*0.06;
        if (glitch) { xx += glitch[i][0]*g; yy += glitch[i][1]*g; }
        ctx.fillStyle = `rgb(${Math.round(lerp(80, 236, lampo))},${Math.round(lerp(170, 72, lampo))},${Math.round(lerp(255, 104, lampo))})`;
        ctx.fillRect(Math.round(xx - p/2), Math.round(yy - p/2), Math.ceil(p), Math.ceil(p));
      });
      if (lampo > 0.5) {
        ctx.globalCompositeOperation = 'lighter';
        const hg = ctx.createRadialGradient(sx + p*5.5, sy + p*5, 0, sx + p*5.5, sy + p*5, p*12);
        hg.addColorStop(0, `rgba(255,90,110,${0.25*lampo*syke})`); hg.addColorStop(1, 'rgba(255,60,90,0)');
        ctx.fillStyle = hg; ctx.fillRect(sx - p*8, sy - p*8, p*28, p*26);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }
}

function kaynnista(){
  kaynnissa = true; t0 = edT = performance.now(); pisarat = []; lahto = null; kohde = null; glitch = null;
  cv.style.opacity = 1;
  cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
}
function pysayta(){
  kaynnissa = false; cv.style.opacity = 0;
  setTimeout(() => { if (!kaynnissa) cancelAnimationFrame(raf); }, 550);
}

window.naytaEmpatia = function(p){
  if (p && p.empatia) { if (!kaynnissa) kaynnista(); }
  else if (kaynnissa) pysayta();
};
})();
