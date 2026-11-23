// ============================================================================
// DOOM SCROLLING (3.10.2026, x:8350 "Doom scrolling") - Jarnon valinta 2:
// "it really needs to be doom".
//
// Oikealla alhaalla iso tumma puhelin. Ruudulla loputon syöte, joka kiihtyy
// hitaasta selaamisesta raivoisaksi vilinäksi: pääkalloja, tulta, vihaisia
// naamoja, varoituskolmioita, särkyneitä sydämiä, romahtavia käyriä, silmiä.
// Ilmoituslaskuri kasvaa 3 → 99+. Punainen hehku valuu maahan ja ympäristö
// tummuu hitaasti. Demoni (heti, n. 1.5 s:ssa) (Jarnon pikselianimaatio, oma puhelin
// leikattu pois: assets/2d/sprites/demon-only.png, 5 x 58x55, valkoiset
// roskapikselit korjattu) kynsii itsensä ulos ruudun yläreunasta.
//
// Korvaa hahmot.js:n x:8350 demon-phone.png-merkinnän (kommentoitu pois).
// Syöte piirretään ruutupikseleissä liukuvalla offsetilla (sulava vieritys),
// ikonit P-kokoisina pikseleinä. Oma kanvaasi tekstin (z 5) alla. Ei ääniä.
// ============================================================================
(function(){
'use strict';
const DEMONI = new Image(); DEMONI.src = 'assets/2d/sprites/demon-only.png';
const DF = 5, DW = 58, DH = 55;

const cv = document.createElement('canvas');
cv.id = 'doom';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
// palava otsikko (Jarno: "could doom scrolling text be on fire?"; teksti pysyy
// keltaisena - liukuväri tummensi sen, poistettu): tekstissä
// <span class="doom-tuli">, liekit omalla kanvaasilla tekstin PÄÄLLÄ (z 6),
// mutta vain kirjainten yläreunasta ylöspäin - luettavuus säilyy.
const fxc = document.createElement('canvas');
fxc.id = 'doom-tuli';
fxc.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:6;opacity:0;transition:opacity .6s ease;';
const fx = fxc.getContext('2d');
document.addEventListener('DOMContentLoaded', () => {
  document.body.append(cv, fxc);
  const tyyli = document.createElement('style');
  tyyli.textContent = `
    .doom-tuli{ animation:doom-lepatus 1.1s infinite alternate ease-in-out; text-shadow:0 0 .14em rgba(255,80,20,.7); }
    @keyframes doom-lepatus{ 0%{text-shadow:0 0 .10em rgba(255,70,20,.55)} 50%{text-shadow:0 0 .2em rgba(255,90,20,.9)} 100%{text-shadow:0 0 .13em rgba(255,60,20,.65)} }`;
  document.head.appendChild(tyyli);
});

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; for (const c of [cv, fxc]) { c.width = Math.round(W*DPR); c.height = Math.round(H*DPR); } }
addEventListener('resize', koko); koko();

// 9x9 pikseli-ikonit: merkki → väri paletista
const IKONIT = [
  { p: { X: '#e8e0d0', '.': null }, m: ['.XXXXXXX.','XXXXXXXXX','XX..X..XX','XX..X..XX','XXXXXXXXX','.XXX.XXX.','..XXXXX..','..X.X.X..','.........'] },           // pääkallo
  { p: { X: '#e2421c', o: '#ffc23a' }, m: ['....X....','...XX....','...XXX.X.','..XXXXXX.','.XXXoXXXX','.XXooXXX.','XXXoooXXX','.XXoooXX.','..XXXXX..'] },               // tuli
  { p: { X: '#d8302c', o: '#1a0606' }, m: ['..XXXXX..','.XXXXXXX.','XoXXXXXoX','XXoXXXoXX','XXXXXXXXX','XXXoooXXX','XXoXXXoXX','.XXXXXXX.','..XXXXX..'] },               // vihainen naama
  { p: { X: '#f0b429', o: '#1a0606' }, m: ['....X....','...XXX...','...XoX...','..XXoXX..','..XXoXX..','.XXXXXXX.','.XXXoXXX.','XXXXXXXXX','.........'] },               // varoitus
  { p: { X: '#c01f3a', '.': null }, m: ['.XX...XX.','XXXX.XXXX','XXX.XXXXX','XXXX.XXXX','.XXX.XXX.','..XXX.X..','...X.X...','....X....','.........'] },               // särkynyt sydän
  { p: { X: '#ff3b30', o: '#5a2a2a' }, m: ['X........','XX.......','oX.X.....','oXXXX....','oooXXo...','ooooXX.X.','oooooXXXX','oooooXXXX','ooooooooo'] },               // romahtava käyrä
  { p: { X: '#b8b0a8', o: '#c0262a', '@': '#0a0202' }, m: ['.........','..XXXXX..','.X.....X.','X..ooo..X','X..o@o..X','X..ooo..X','.X.....X.','..XXXXX..','.........'] }, // silmä
];
function hash(n){ n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); return (n ^ (n >>> 15)) >>> 0; }
const sstep = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u*u*(3 - 2*u); };

let kaynnissa = false, raf = 0, t0 = 0, edT = 0, offset = 0, liekit = [];
const TULI = ['#fff2b0', '#ffc23a', '#ff8a1a', '#e2421c', '#a01a12', '#3a1410'];

// pikseliliekit otsikon kirjainten yläreunasta
function piirraLiekit(dt){
  fx.setTransform(DPR, 0, 0, DPR, 0, 0); fx.clearRect(0, 0, W, H);
  const el = document.querySelector('#teksti .doom-tuli'); if (!el) return;
  const fs = parseFloat(getComputedStyle(el).fontSize) || 40, P = Math.max(2, fs / 11);
  for (const r of el.getClientRects()) {
    const n = r.width / P * 0.9 * dt;                       // syntyviä tällä kehyksellä
    for (let i = 0; i < n + (Math.random() < n % 1 ? 1 : 0); i++)
      liekit.push({ x: r.left + Math.random()*r.width, y: r.top + r.height*0.28, vy: -(0.6 + Math.random()*0.9)*fs, ika: 0, kesto: 0.45 + Math.random()*0.5, k: P*(0.8 + Math.random()*0.6), vaihe: Math.random()*6 });
  }
  for (let i = liekit.length - 1; i >= 0; i--) {
    const l = liekit[i]; l.ika += dt;
    if (l.ika > l.kesto) { liekit.splice(i, 1); continue; }
    const u = l.ika / l.kesto;
    l.y += l.vy*dt; l.x += Math.sin(l.ika*9 + l.vaihe) * P * 2.5 * dt;
    fx.globalAlpha = u < 0.8 ? 1 : (1 - u) / 0.2;
    fx.fillStyle = TULI[Math.min(TULI.length - 1, Math.floor(u * TULI.length))];
    const k = l.k * (1 - u*0.5);
    fx.fillRect(Math.round(l.x - k/2), Math.round(l.y - k/2), Math.ceil(k), Math.ceil(k));
  }
  fx.globalAlpha = 1;
}

function ikoni(i, x, y, P){
  const ik = IKONIT[i];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    const v = ik.p[ik.m[r][c]]; if (!v) continue;
    ctx.fillStyle = v; ctx.fillRect(Math.round(x + c*P), Math.round(y + r*P), Math.ceil(P), Math.ceil(P));
  }
}

function kortti(n, x, y, w, h, P, t){
  const s = hash(n + 7);
  ctx.fillStyle = '#1b0e11'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#3a1a20'; ctx.fillRect(x, y, w, P*0.6); ctx.fillRect(x, y + h - P*0.6, w, P*0.6);
  // avatar + otsikkopalkit
  const av = ['#7a2b2b', '#4b3a5a', '#2f4a4a', '#6a4a20'][s % 4];
  ctx.fillStyle = av; ctx.fillRect(x + P*2, y + P*2, P*4, P*4);
  ctx.fillStyle = '#6e5558'; ctx.fillRect(x + P*7.5, y + P*2.2, w*(0.35 + (s % 30)/100), P*1.2);
  ctx.fillStyle = '#4a3638'; ctx.fillRect(x + P*7.5, y + P*4.4, w*(0.22 + (s % 20)/100), P*1);
  // iso ikoni keskellä
  const ip = Math.min(w, h) / 17;
  ikoni(s % IKONIT.length, x + w/2 - ip*4.5, y + h*0.30, ip);
  // tykkäyspalkki värisee
  const tp = (0.3 + 0.6 * ((s % 100) / 100)) * (0.85 + 0.15*Math.sin(t*9 + n));
  ctx.fillStyle = '#3a1a20'; ctx.fillRect(x + P*2, y + h - P*3.6, w - P*4, P*1.2);
  ctx.fillStyle = '#d8302c'; ctx.fillRect(x + P*2, y + h - P*3.6, (w - P*4) * tp, P*1.2);
}

function kehys(nyt){
  raf = requestAnimationFrame(kehys);
  const t = (nyt - t0) / 1000, dt = Math.min(0.05, (nyt - edT) / 1000); edT = nyt;
  piirraLiekit(dt);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);

  // ympäristö tummuu punertavaksi (tekstin alla)
  const tumma = sstep(0.2, 3, t);
  const vg = ctx.createRadialGradient(W*0.35, H*0.45, H*0.25, W*0.5, H*0.5, W*0.75);
  vg.addColorStop(0, `rgba(8,0,0,${0.10*tumma})`); vg.addColorStop(1, `rgba(14,0,2,${0.55*tumma})`);
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // puhelimen mitat
  const ph = H*0.64, pw = ph*0.52, px = W*0.80 - pw/2, gy = H*0.95, py = gy - ph;
  const P = ph / 120;                                       // puhelimen "pikseli"
  const sx = px + pw*0.07, sy = py + ph*0.075, sw = pw*0.86, sh = ph*0.83;
  const vilkku = 0.85 + 0.15*Math.sin(t*23) * Math.sin(t*7.3);

  // hehku maahan ja ympärille
  ctx.globalCompositeOperation = 'lighter';
  const gl = ctx.createRadialGradient(sx + sw/2, sy + sh*0.5, sw*0.2, sx + sw/2, sy + sh*0.5, ph*0.95);
  gl.addColorStop(0, `rgba(200,30,20,${0.22*vilkku})`); gl.addColorStop(1, 'rgba(120,0,0,0)');
  ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
  const mg = ctx.createRadialGradient(sx + sw/2, gy, 0, sx + sw/2, gy, pw*1.4);
  mg.addColorStop(0, `rgba(230,40,20,${0.28*vilkku})`); mg.addColorStop(1, 'rgba(120,0,0,0)');
  ctx.save(); ctx.translate(0, gy); ctx.scale(1, 0.22); ctx.translate(0, -gy);
  ctx.fillStyle = mg; ctx.fillRect(px - pw*1.5, gy - pw*1.5, pw*4, pw*3); ctx.restore();
  ctx.globalCompositeOperation = 'source-over';

  // runko
  ctx.fillStyle = '#0c0c10'; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, P*7); ctx.fill();
  ctx.strokeStyle = '#2c2c36'; ctx.lineWidth = P*1.2; ctx.beginPath(); ctx.roundRect(px + P*0.6, py + P*0.6, pw - P*1.2, ph - P*1.2, P*6.5); ctx.stroke();
  ctx.fillStyle = '#23232b'; ctx.fillRect(px + pw, py + ph*0.22, P*1.2, ph*0.1);   // sivunappi
  ctx.fillStyle = '#1e1e26'; ctx.beginPath(); ctx.arc(px + pw/2, py + ph*0.04, P*1.4, 0, Math.PI*2); ctx.fill(); // kamera

  // syöte: kiihtyy hitaasta raivoisaan
  const nopeus = sh * (0.16 + 1.5 * sstep(0.5, 7, t));
  offset += nopeus * dt;
  const kh = sw * 0.78, vali = P*2.2, askel = kh + vali;
  ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  ctx.fillStyle = '#0a0506'; ctx.fillRect(sx, sy, sw, sh);
  const eka = Math.floor(offset / askel);
  for (let n = eka; n * askel - offset < sh; n++) kortti(n, sx + P*2, sy + n*askel - offset, sw - P*4, kh, P, t);
  // vauhtiraidat kovassa vauhdissa
  const raita = sstep(4, 7, t);
  if (raita > 0) {
    ctx.fillStyle = `rgba(255,60,40,${0.10*raita})`;
    for (let i = 0; i < 6; i++) ctx.fillRect(sx, sy + ((i*97 + offset*1.7) % sh), sw, P*0.5);
  }
  // ruudun hehku ja juovat
  ctx.fillStyle = `rgba(255,40,30,${0.06 + 0.05*vilkku})`; ctx.fillRect(sx, sy, sw, sh);
  ctx.restore();

  // ilmoituslaskuri 3 → 99+
  const maara = Math.floor(3 + 96 * sstep(0.3, 6, t));
  const bx = px + pw - P*2, by = py + P*2, br = P*5.5;
  ctx.fillStyle = '#e0241f'; ctx.beginPath(); ctx.arc(bx, by, br * (1 + 0.08*Math.sin(t*6)), 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(br*0.95)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(maara >= 99 ? '99+' : String(maara), bx, by + br*0.05);

  // demoni kynsii itsensä ulos ruudun yläreunasta
  if (DEMONI.complete && DEMONI.naturalWidth) {
    const nous = sstep(0.2, 1.8, t);                 // heti (Jarno: lyhyt pysähdys)
    if (nous > 0) {
      const dw = sw*0.96, dh = dw * DH / DW, f = Math.floor(t * 6) % DF;
      const pohja = sy + dh*0.95 - dh*0.62*nous + Math.sin(t*1.8)*dh*0.015;
      ctx.save();
      ctx.beginPath(); ctx.rect(sx, 0, sw, sy + sh); ctx.clip();  // näkyy ruudussa ja sen yläpuolella
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = Math.min(1, nous*4);
      ctx.drawImage(DEMONI, f*DW, 0, DW, DH, sx + sw/2 - dw/2, pohja - dh, dw, dh);
      ctx.restore();
    }
  }
}

function kaynnista(){
  kaynnissa = true; t0 = edT = performance.now(); offset = 0;
  cv.style.opacity = 1; fxc.style.opacity = 1; liekit = [];
  cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
}
function pysayta(){
  kaynnissa = false; cv.style.opacity = 0; fxc.style.opacity = 0;
  setTimeout(() => { if (!kaynnissa) { cancelAnimationFrame(raf); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0, 0, cv.width, cv.height); fx.setTransform(1,0,0,1,0,0); fx.clearRect(0, 0, fxc.width, fxc.height); liekit = []; } }, 650);
}

window.naytaDoom = function(p){
  if (p && p.doom) { if (!kaynnissa) kaynnista(); }
  else if (kaynnissa) pysayta();
};
})();
