// ============================================================================
// KUPLA ON KILPI (3.10.2026, x:8940 "Algoritmit luovat myös turvaa").
// Jarnon alkuperäinen idea: avaruusalus ampuu, ammukset kimpoavat kilvestä.
// Konteksti: algoritmien kuplat voivat suojata - esim. pienen kylän
// transnuori löytää vertaisensa vain netistä. Vahva kuva, mutta leikillinen.
//
// Käyttö esitys-data.js:ssä: `kilpi: true` (yhdessä moottorin `kupla: true`
// kanssa - lasikupla ja kissanpennut ovat moottorin #kupla-DOMia, tätä ei
// muuteta). Korvaa hahmot.js:n x:8940 ship-fly-ohilennon (kommentoitu pois).
//
// Kulku: alus (ship-fly.png) lentää vasemmalta, pysähtyy leijumaan ja ampuu
// vuorotellen punaisia pikseliammuksia ja vihaisia "#@%&!"-kommenttikuplia.
// Jokainen osuu kilpeen: kuplan pinta välähtää osumakohdasta (rengasaalto +
// reunan hehku), ammus kimpoaa heijastuskulmassa pois, pyörii ja sammuu.
// Kuplan sisällä nousee pieniä sydämiä kissojen luota. Viimeinen ammus
// kimpoaa suoraan takaisin alukseen - alus välähtää, pyörii ja savuaa pois.
//
// Alus + ammukset kanvaasilla kuplan alla (z 4), osumavälähdykset ja sydämet
// kuplan päällä (z 6). Kuplan paikka luetaan DOMista joka kehys (kelluu).
// Ei ääniä.
// ============================================================================
(function(){
'use strict';
const ALUS = new Image(); ALUS.src = 'assets/2d/sprites/ship-fly.png';
const AF = 7, AW = 350, AH = 150;
const LAUKAUKSET = 8, VALI = 0.95, ALOITUS = 2.2;
const SYDAN = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];

function teeKanvaasi(id, z){
  const c = document.createElement('canvas'); c.id = id;
  c.style.cssText = `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:${z};opacity:0;transition:opacity .5s ease;`;
  return c;
}
const cv = teeKanvaasi('kilpi', 4), fxc = teeKanvaasi('kilpi-fx', 6);
const ctx = cv.getContext('2d'), fx = fxc.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.append(cv, fxc));

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; for (const c of [cv, fxc]) { c.width = Math.round(W*DPR); c.height = Math.round(H*DPR); } }
addEventListener('resize', koko); koko();

const sstep = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u*u*(3 - 2*u); };
const rnd = (a, b) => a + Math.random()*(b - a);

let kaynnissa = false, raf = 0, t0 = 0, edT = 0, t = 0;
let ammukset = [], kimmot = [], aallot = [], sydamet = [], savut = [], ammuttu = 0, rekyyli = 0;
let alusOsuma = -1;                       // aika jolloin viimeinen kimmoke osui alukseen

function kupla(){
  const el = document.getElementById('kupla'); if (!el || !el.classList.contains('nakyy')) return null;
  const r = el.getBoundingClientRect(); if (!r.width) return null;
  return { x: r.left + r.width/2, y: r.top + r.height/2, r: r.width/2 * 0.98 };
}

function alusPaikka(){
  const lento = sstep(0, 2, t);
  let x = -W*0.15 + (W*0.15 + W*0.14) * lento, y = H*0.40 + Math.sin(t*1.6)*H*0.012, kulma = 0;
  x -= rekyyli * H*0.02;
  if (alusOsuma >= 0) {                   // osuma: pyörii ja putoaa pois vasemmalle alas
    const u = t - alusOsuma;
    x -= u*u*W*0.06 + u*W*0.05; y += u*u*H*0.09; kulma = -u*2.6;
  }
  return { x, y, kulma };
}

function ammu(K, A, viimeinen){
  const kulma = viimeinen ? Math.atan2(A.y - K.y, A.x - K.x) : Math.PI + rnd(-0.75, 0.75);  // osumakohta kuplan vasemmalla puoliskolla
  const kx = K.x + Math.cos(kulma)*K.r, ky = K.y + Math.sin(kulma)*K.r;
  const sx = A.x + H*0.06, sy = A.y + H*0.005;
  const tyyppi = viimeinen ? 'pallo' : (ammuttu % 2 ? 'kommentti' : 'pallo');
  ammukset.push({ x: sx, y: sy, sx, sy, kx, ky, kulma, ika: 0, kesto: Math.hypot(kx - sx, ky - sy) / (W*0.55), tyyppi, viimeinen });
  rekyyli = 1; ammuttu++;
}

function pikselit(g, kartta, vari, x, y, p){
  g.fillStyle = vari;
  for (let r = 0; r < kartta.length; r++) for (let c = 0; c < kartta[r].length; c++) if (kartta[r][c] === 'X') g.fillRect(Math.round(x + c*p), Math.round(y + r*p), Math.ceil(p), Math.ceil(p));
}

function piirraAmmus(g, a, x, y, kierto){
  const s = H*0.022;
  g.save(); g.translate(x, y); g.rotate(kierto);
  if (a.tyyppi === 'kommentti') {
    g.fillStyle = '#d62a20'; g.beginPath(); g.roundRect(-s*2.1, -s*1.05, s*4.2, s*2.1, s*0.6); g.fill();
    g.beginPath(); g.moveTo(-s*1.2, s*0.9); g.lineTo(-s*1.7, s*1.8); g.lineTo(-s*0.5, s*0.9); g.fill();
    g.fillStyle = '#fff3e8'; g.font = `900 ${s*1.35}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('#@%&!', 0, s*0.05);
  } else {
    const k = s*0.55;                       // punainen pikseliammus + hehku
    g.fillStyle = 'rgba(255,60,40,.35)'; g.fillRect(-k*3, -k*1.5, k*6, k*3);
    g.fillStyle = '#ff3b2a'; g.fillRect(-k*2, -k, k*4, k*2);
    g.fillStyle = '#ffd0b0'; g.fillRect(-k, -k*0.5, k*2, k);
  }
  g.restore();
}

function kehys(nyt){
  raf = requestAnimationFrame(kehys);
  const dt = Math.min(0.05, (nyt - edT) / 1000); edT = nyt; t = (nyt - t0) / 1000;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  fx.setTransform(DPR, 0, 0, DPR, 0, 0); fx.clearRect(0, 0, W, H);
  const K = kupla(), A = alusPaikka();
  rekyyli = Math.max(0, rekyyli - dt*5);

  // laukaukset
  if (K && alusOsuma < 0 && ammuttu < LAUKAUKSET && t > ALOITUS + ammuttu*VALI) ammu(K, A, ammuttu === LAUKAUKSET - 1);

  // alus
  if (ALUS.complete && ALUS.naturalWidth && A.x > -W*0.3 && A.y < H*1.3) {
    const ah = H*0.11, aw = ah * AW / AH, f = Math.floor(t*8) % AF;
    ctx.save(); ctx.translate(A.x, A.y); ctx.rotate(A.kulma);
    if (alusOsuma >= 0 && t - alusOsuma < 0.25) ctx.filter = 'brightness(2.5)';
    ctx.drawImage(ALUS, f*AW, 0, AW, AH, -aw/2, -ah/2, aw, ah);
    ctx.restore(); ctx.filter = 'none';
    if (alusOsuma >= 0 && Math.random() < 0.6) savut.push({ x: A.x + rnd(-1, 1)*ah*0.3, y: A.y, ika: 0, kesto: rnd(0.8, 1.4), r: ah*rnd(0.12, 0.22) });
  }
  // savu
  for (let i = savut.length - 1; i >= 0; i--) {
    const s = savut[i]; s.ika += dt; if (s.ika > s.kesto) { savut.splice(i, 1); continue; }
    const u = s.ika / s.kesto; s.y -= H*0.05*dt;
    ctx.fillStyle = `rgba(${u < 0.15 ? '255,150,60' : '60,58,64'},${0.6*(1 - u)})`;
    const r = s.r*(1 + u*1.5); ctx.fillRect(s.x - r, s.y - r, r*2, r*2);
  }

  // lentävät ammukset → kilpi
  for (let i = ammukset.length - 1; i >= 0; i--) {
    const a = ammukset[i]; a.ika += dt;
    const u = Math.min(1, a.ika / a.kesto);
    // osumakohta seuraa kelluvaa kuplaa
    const kx = K ? K.x + Math.cos(a.kulma)*K.r : a.kx, ky = K ? K.y + Math.sin(a.kulma)*K.r : a.ky;
    const x = a.sx + (kx - a.sx)*u, y = a.sy + (ky - a.sy)*u;
    const suunta = Math.atan2(ky - a.sy, kx - a.sx);
    piirraAmmus(ctx, a, x, y, a.tyyppi === 'kommentti' ? 0 : suunta);
    if (u >= 1) {
      ammukset.splice(i, 1);
      aallot.push({ kulma: a.kulma, ika: 0 });
      for (let k = 0; k < 3; k++) sydamet.push({ ox: rnd(-0.35, 0.35), oy: rnd(0.05, 0.35), ika: -k*0.25, kesto: rnd(1.6, 2.2), vaihe: rnd(0, 6) });
      // heijastus normaalin suhteen
      const nx = Math.cos(a.kulma), ny = Math.sin(a.kulma);
      let vx = Math.cos(suunta), vy = Math.sin(suunta);
      const d = vx*nx + vy*ny; vx -= 2*d*nx; vy -= 2*d*ny;
      const v = a.viimeinen ? W*0.9 : W*rnd(0.35, 0.5);
      kimmot.push({ ...a, x, y, vx: vx*v, vy: vy*v, ika: 0, kesto: a.viimeinen ? 3 : rnd(0.9, 1.3), kierto: suunta, pyor: rnd(-1, 1)*9 });
    }
  }
  // kimmokkeet
  for (let i = kimmot.length - 1; i >= 0; i--) {
    const k = kimmot[i]; k.ika += dt;
    k.x += k.vx*dt; k.y += k.vy*dt;
    if (!k.viimeinen) { k.vy += H*0.9*dt; k.kierto += k.pyor*dt; }
    if (k.viimeinen && alusOsuma < 0 && Math.hypot(k.x - A.x, k.y - A.y) < H*0.09) {
      alusOsuma = t; kimmot.splice(i, 1);
      for (let j = 0; j < 14; j++) savut.push({ x: A.x, y: A.y, ika: 0, kesto: rnd(0.4, 0.9), r: H*rnd(0.01, 0.025) });
      continue;
    }
    if (k.ika > k.kesto) { kimmot.splice(i, 1); continue; }
    ctx.globalAlpha = k.viimeinen ? 1 : Math.max(0, 1 - k.ika / k.kesto);
    piirraAmmus(ctx, k, k.x, k.y, k.tyyppi === 'kommentti' ? k.kierto*0.3 : k.kierto);
    ctx.globalAlpha = 1;
  }

  if (!K) return;
  // kilven välähdykset (z 6)
  for (let i = aallot.length - 1; i >= 0; i--) {
    const w = aallot[i]; w.ika += dt; if (w.ika > 0.7) { aallot.splice(i, 1); continue; }
    const u = w.ika / 0.7, ix = K.x + Math.cos(w.kulma)*K.r, iy = K.y + Math.sin(w.kulma)*K.r;
    fx.save(); fx.beginPath(); fx.arc(K.x, K.y, K.r, 0, Math.PI*2); fx.clip();
    fx.strokeStyle = `rgba(150,230,255,${0.8*(1 - u)})`; fx.lineWidth = K.r*0.05*(1 - u) + 1;
    fx.beginPath(); fx.arc(ix, iy, K.r*0.9*u, 0, Math.PI*2); fx.stroke();
    fx.restore();
    fx.strokeStyle = `rgba(200,245,255,${1 - u})`; fx.lineWidth = K.r*0.06*(1 - u*0.6);
    fx.shadowColor = 'rgba(120,220,255,.9)'; fx.shadowBlur = K.r*0.15;
    fx.beginPath(); fx.arc(K.x, K.y, K.r, w.kulma - 0.6 - u*0.4, w.kulma + 0.6 + u*0.4); fx.stroke();
    fx.shadowBlur = 0;
    fx.fillStyle = `rgba(255,255,255,${(1 - u*3)})`;
    if (u < 0.33) { fx.beginPath(); fx.arc(ix, iy, K.r*0.09*(1 - u*3), 0, Math.PI*2); fx.fill(); }
  }
  // sydämet kuplan sisällä
  for (let i = sydamet.length - 1; i >= 0; i--) {
    const s = sydamet[i]; s.ika += dt; if (s.ika > s.kesto) { sydamet.splice(i, 1); continue; }
    if (s.ika < 0) continue;
    const u = s.ika / s.kesto, p = K.r*0.035;
    const x = K.x + s.ox*K.r + Math.sin(s.ika*3 + s.vaihe)*K.r*0.04, y = K.y + (s.oy - u*0.55)*K.r;
    fx.globalAlpha = Math.sin(u*Math.PI);
    pikselit(fx, SYDAN, '#ff6b9a', x - p*3.5, y - p*3, p);
  }
  fx.globalAlpha = 1;
}

function kaynnista(){
  kaynnissa = true; t0 = edT = performance.now();
  ammukset = []; kimmot = []; aallot = []; sydamet = []; savut = []; ammuttu = 0; rekyyli = 0; alusOsuma = -1;
  cv.style.opacity = 1; fxc.style.opacity = 1;
  cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
}
function pysayta(){
  kaynnissa = false; cv.style.opacity = 0; fxc.style.opacity = 0;
  setTimeout(() => { if (!kaynnissa) cancelAnimationFrame(raf); }, 550);
}

window.naytaKilpi = function(p){
  if (p && p.kilpi) { if (!kaynnissa) kaynnista(); }
  else if (kaynnissa) pysayta();
};
})();
