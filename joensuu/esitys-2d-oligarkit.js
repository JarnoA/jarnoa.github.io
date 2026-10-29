// ============================================================================
// DIGITAALISET OLIGARKIT, osion avaus (2.10.2026, x:7290). Kuva kuvat/olig.png
// (Musk-patsas) on maailmassa. Valta = koko maailma hänen sormenpäässään:
// pikselimaapallo (oikeat mantereet karkeina ääriviivoina) pyörii osoittavan
// sormen kärjessä, kosketuskohta hehkuu, satelliitit kiertävät palloa kahdella
// kallistetulla radalla. Jarno 2.10.2026: "too much, maybe nothing on ground",
// "Earth should look more like earth", "finger points it ... Elon is touching it".
// Patsaan paikka luetaan Phaserista joka ruudussa. Käyttö: `oligarkit: true`.
// ============================================================================
(function(){
'use strict';
const KUVA = 'kuvat/olig.png';
const SORMI = { x: .063, y: .24 };          // osoittavan sormen kärki kuvan osuuksina (mitattu)

const cv = document.createElement('canvas');
cv.id = 'oligarkit';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', koko); koko();

// ---------- mantereet: karkeat ääriviivat [pituus, leveys] ----------
const MANTEREET = [
  [[-168,66],[-140,70],[-95,72],[-80,63],[-60,55],[-53,47],[-70,43],[-76,35],[-81,25],[-97,26],[-97,19],[-87,15],[-83,9],[-79,8],[-92,15],[-105,20],[-112,30],[-117,33],[-124,40],[-125,49],[-135,58],[-152,58],[-165,60]],
  [[-80,8],[-60,10],[-50,0],[-35,-7],[-40,-22],[-48,-28],[-58,-38],[-65,-55],[-72,-50],[-73,-35],[-71,-18],[-81,-5]],
  [[-50,60],[-42,60],[-20,70],[-20,82],[-60,82],[-55,70]],
  [[-10,36],[-9,43],[-2,44],[-5,48],[5,53],[8,57],[5,61],[15,69],[28,71],[40,67],[45,45],[30,41],[25,36],[15,38],[12,44],[3,42]],
  [[-6,50],[2,51],[0,58],[-6,58]],
  [[-17,15],[-17,21],[-10,30],[-6,36],[10,37],[20,32],[32,31],[35,28],[43,12],[51,12],[42,-2],[40,-15],[33,-25],[20,-35],[18,-30],[12,-15],[9,-1],[5,5],[-8,5]],
  [[26,40],[40,42],[48,30],[56,25],[60,25],[67,24],[73,20],[78,8],[80,15],[88,22],[92,22],[98,16],[100,3],[104,1],[106,10],[109,20],[121,30],[122,40],[130,43],[140,50],[143,60],[160,62],[180,67],[180,72],[140,73],[110,77],[80,73],[60,69],[45,68],[40,66]],
  [[95,5],[118,-8],[140,-8],[120,2]],
  [[114,-22],[122,-18],[131,-12],[137,-12],[142,-11],[146,-19],[153,-27],[150,-37],[141,-38],[131,-31],[115,-34]],
  [[130,31],[141,35],[145,44],[140,41]],
];
function sisalla(lon, lat, poly){ let s = false; for (let i=0, j=poly.length-1; i<poly.length; j=i++){ const [xi, yi] = poly[i], [xj, yj] = poly[j];
  if ((yi > lat) !== (yj > lat) && lon < (xj - xi)*(lat - yi)/(yj - yi) + xi) s = !s; } return s; }
// pistepallo: maa / meri / aavikko / jää luokiteltu kerran
const PISTEET = [];
for (let lat = -88; lat <= 88; lat += 3.2) { const n = Math.max(6, Math.round(112 * Math.cos(lat * Math.PI/180)));
  for (let i=0;i<n;i++){ const lon = -180 + i / n * 360;
    let tyyppi = MANTEREET.some(p => sisalla(lon, lat, p)) ? 'maa' : 'meri';
    if (Math.abs(lat) > 68 && (tyyppi === 'maa' || lat < -68)) tyyppi = 'jaa';
    else if (tyyppi === 'maa' && ((lat > 14 && lat < 34 && lon > -15 && lon < 60) || (lat < -18 && lat > -32 && lon > 118 && lon < 145) || (lat > 25 && lat < 42 && lon > -118 && lon < -102))) tyyppi = 'aavikko';
    PISTEET.push({ lat: lat * Math.PI/180, lon: lon * Math.PI/180, tyyppi }); } }
const VARIT = { meri: [34, 96, 170], maa: [78, 150, 66], aavikko: [196, 170, 100], jaa: [235, 242, 248] };

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;

function patsas(kuva){
  const sc = window.__paaKohtaus; if (!sc || !sc.kuvahahmot) return null;
  const kh = sc.kuvahahmot.find(k => k.h.kuva === (kuva || KUVA)); if (!kh || !kh.img.visible) return null;
  const cam = sc.cameras.main, b = kh.img.getBounds(), sk = W / sc.scale.width;
  return { x: (b.x - cam.scrollX * kh.img.scrollFactorX) * sk, y: (b.y - cam.scrollY * kh.img.scrollFactorY) * sk, w: b.width * sk, h: b.height * sk };
}


// x:7365 (8.10.2026, Jarno: "molemmat"): Bezosin pilveen 28 % ja Zuckerbergin puhelimen
// ylle pikselikuvakkeet (Instagram, Facebook, WhatsApp) - ponnahtavat kun patsaat ovat nousseet.
const JEFFMARK = 'kuvat/jeffmark-rajattu.png', SAM = 'kuvat/samalt-robotti.png';
const SAM_KUPLA = ['Pahojakin asioita pitää', 'hyväksyä teknologian', 'hyötyjen vuoksi.'];   // Jarnon sanamuoto 8.10.2026 (Altman, Politico 4.10.2026)
const PILVI = { x: .23, y: .37 }, PUHELIN = { x: .96, y: .2 };   // kuvan osuuksina (mitattu jeffmark.png:stä)
const IKONIT = {
  insta: ['.oooooooooo.','oo........oo','o.wwwwwwww.o','o.w......w.o','o.w..ww.ww.o','o.w.w..w.w.o','o.w.w..w.w.o','o.w..ww..w.o','o.w......w.o','o.wwwwwwww.o','oo........oo','.oooooooooo.'],
  fb:    ['bbbbbbbbbbbb','bbbbbbbbbbbb','bbbbbbbwwwbb','bbbbbbwwbbbb','bbbbbbwbbbbb','bbbbwwwwwbbb','bbbbbbwbbbbb','bbbbbbwbbbbb','bbbbbbwbbbbb','bbbbbbwbbbbb','bbbbbbwbbbbb','bbbbbbwbbbbb'],
  wa:    ['...gggggg...','..gggggggg..','.gggwwwwggg.','gggwwggwwggg','ggwwggggwwgg','ggwgwgggggwg','ggwggwwggwgg','ggwgggwwwwgg','ggwwggggwwgg','gwwwwwwwwggg','gwgggggggg..','gg..gggg....'],
};
const IKONIVARIT = { o: null, w: '#ffffff', b: '#1877f2', g: '#25d366' };
function ikoni(nimi, x, y, s){
  const rivit = IKONIT[nimi], u = s / 12;
  rivit.forEach((r, j) => { for (let i = 0; i < 12; i++) {
    const c = r[i]; if (c === '.') continue;
    if (c === 'o') { const v = (i + 11 - j) / 22; ctx.fillStyle = `rgb(${(131 + v*122)|0},${(58 + v*110)|0},${(180 - v*140)|0})`; }  // Instagramin violetti->oranssi
    else ctx.fillStyle = IKONIVARIT[c];
    ctx.fillRect(Math.floor(x + i*u), Math.floor(y + j*u), Math.ceil(u), Math.ceil(u));
  } });
}
let tiedotAlku = 0;
const pomppu = e => e <= 0 ? 0 : e >= 1 ? 1 : 1 + 2.2*Math.pow(e - 1, 3) + 1.2*Math.pow(e - 1, 2);   // back-out
function piirraTiedot(){
  const p = patsas(JEFFMARK); if (!p) return;
  const t = (performance.now() - tiedotAlku) / 1000;
  // 28 % pilven päälle
  const e1 = pomppu(Math.min(1, (t - 2.6) / .5));
  if (e1 > 0) {
    const cx = p.x + p.w*PILVI.x, cy = p.y + p.h*PILVI.y, f = p.h * .11 * e1;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `bold ${f}px Georgia, 'EB Garamond', serif`;
    const f2 = f * .3, lev = Math.max(ctx.measureText('28 %').width, f2 * 9.5) + f*.5;
    ctx.fillStyle = 'rgba(20,24,30,.78)'; ctx.beginPath(); ctx.roundRect(cx - lev/2, cy - f*.62, lev, f*1.55, f*.18); ctx.fill();
    ctx.fillStyle = '#ffd36b'; ctx.fillText('28 %', cx, cy);
    ctx.font = `${f2}px Georgia, 'EB Garamond', serif`; ctx.fillStyle = '#f4efe4';
    ctx.fillText('netin pilvipalveluista', cx, cy + f*.68);
    ctx.restore();
  }
  // Sam Altmanin puhekupla (8.10.2026) - TEKSTI TARKISTETTAVA (Daily Mail / Politico 4.10.2026)
  const S = patsas(SAM);
  const e3 = pomppu(Math.min(1, (t - 4.6) / .5));
  if (S && e3 > 0) {
    const hx = S.x + S.w*.6, hy = S.y + S.h*.05, f = Math.max(14, S.h*.045);
    ctx.save(); ctx.font = `bold ${f}px Georgia, 'EB Garamond', serif`;
    const rivit = SAM_KUPLA, lev = Math.max(...rivit.map(r => ctx.measureText(r).width)) + f*1.2, kor = rivit.length*f*1.25 + f*.8;
    const bx = Math.min(W - lev - 8, hx + f*.6), by = Math.max(8, hy - kor - f*.4);
    ctx.translate(hx, hy); ctx.scale(e3, e3); ctx.translate(-hx, -hy);
    ctx.fillStyle = 'rgba(250,247,238,.96)'; ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(bx, by, lev, kor, f*.5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + f*.8, by + kor - 2); ctx.lineTo(hx, hy); ctx.lineTo(bx + f*2, by + kor - 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(bx + f*.8, by + kor); ctx.lineTo(hx, hy); ctx.lineTo(bx + f*2, by + kor); ctx.stroke();
    ctx.fillStyle = '#1d1d1d'; ctx.textBaseline = 'top';
    rivit.forEach((r, i) => ctx.fillText(r, bx + f*.6, by + f*.4 + i*f*1.25));
    ctx.restore();
  }
  // kuvakkeet puhelimen yllä kaarena, yksi kerrallaan
  const s = p.h * .075, px = p.x + p.w*PUHELIN.x, py = p.y + p.h*PUHELIN.y;
  let siirto = Math.min(0, W - 8 - (px + s*1.9));   // ei yli ruudun oikean reunan
  [['insta', -1.6, -1.15], ['fb', -.5, -1.75], ['wa', .65, -1.15]].forEach(([n, dx, dy], i) => {
    const e = pomppu(Math.min(1, (t - 3.2 - i*.45) / .45)); if (e <= 0) return;
    const k = s * e, x = px + siirto + dx*s + (s - k)/2, y = py + dy*s + (s - k)/2;
    ikoni(n, x, y, k);
  });
}
let pelkkaTaivas = false;
function piirra(t){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  if (pelkkaTaivas) {   // x:7365: satelliitit jäävät taivaalle, ei patsasta/palloa
    const N = 30, k = Math.max(3, H*.009);
    ctx.save(); ctx.globalAlpha = Math.min(1, t / .8);
    for (let i=0;i<N;i++){
      const tr = i % 3, tk = i/N*Math.PI*2 + t*(.06 + tr*.015);
      const x = W*.5 + Math.cos(tk)*W*(.55 + tr*.06), y = H*(.16 + tr*.035) + Math.sin(tk)*H*(.08 + tr*.02), kk = k * (Math.sin(tk) < 0 ? .75 : 1);
      const g = ctx.createRadialGradient(x, y, 0, x, y, kk*2.2); g.addColorStop(0, 'rgba(127,216,255,.4)'); g.addColorStop(1, 'rgba(127,216,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - kk*2.2, y - kk*2.2, kk*4.4, kk*4.4);
      ctx.fillStyle = '#1a2233'; ctx.fillRect(x - kk*.45, y - kk*.45, kk*.9, kk*.9);
      ctx.fillStyle = '#3d8fe0'; ctx.fillRect(x - kk*1.9, y - kk*.25, kk*1.3, kk*.5); ctx.fillRect(x + kk*.6, y - kk*.25, kk*1.3, kk*.5);
      ctx.fillStyle = '#9fd8ff'; ctx.fillRect(x - kk*1.9, y - kk*.25, kk*1.3, kk*.1); ctx.fillRect(x + kk*.6, y - kk*.25, kk*1.3, kk*.1);
    }
    ctx.restore();
    piirraTiedot();
    return;
  }
  const p = patsas() || { x: W*.2, y: H*.3, w: W*.57, h: H*.72 };
  const sx = p.x + p.w*SORMI.x, sy = p.y + p.h*SORMI.y;
  const ilm = Math.min(1, t / 1.2), r = p.h * .085 * (.6 + .4*ilm);
  const kx = sx - r*.98, ky = sy + Math.sin(t*1.2) * r*.03;      // pallo koskettaa sormenpäätä
  ctx.save(); ctx.globalAlpha = ilm;

  // satelliitit radan takaosalla (pallon takana) piirretään ensin
  // Satelliitit (Jarno: "around globe but from there fly to sky, bigger as they were"):
  // ensin kiertävät palloa, sitten lähtevät yksi kerrallaan kaarena taivaalle ja jäävät
  // leijumaan isompina kiertävään parveen (myös tekstin taakse).
  const satelliitit = [], N = 30;
  for (let i=0;i<N;i++){
    const rata = i % 2, kulma = i/N*Math.PI*4 + t*(.5 + rata*.18) + rata, kall = rata ? .55 : -.4, R = r*(1.45 + rata*.18);
    const ox = Math.cos(kulma)*R, oy = Math.sin(kulma)*R*.32;
    const px = kx + ox*Math.cos(kall) - oy*Math.sin(kall), py = ky + ox*Math.sin(kall) + oy*Math.cos(kall), pz = Math.sin(kulma);
    // taivaan rata
    const tr = i % 3, tk = i/N*Math.PI*2 + t*(.06 + tr*.015);
    const tx = W*.5 + Math.cos(tk)*W*(.55 + tr*.06), ty = H*(.16 + tr*.035) + Math.sin(tk)*H*(.08 + tr*.02), tz = Math.sin(tk);
    const e = Math.min(1, Math.max(0, (t - 2.6 - i*.16) / 1.6)), ee = e*e*(3 - 2*e);
    satelliitit.push({ x: px + (tx - px)*ee, y: py + (ty - py)*ee - Math.sin(Math.PI*e)*H*.12, z: e > .5 ? tz : pz,
      k: (Math.max(2.5, r*.07) + (Math.max(3, H*.009) - Math.max(2.5, r*.07))*ee), taivaalla: ee });
  }
  const sat = s => { const k = s.k * (s.z < 0 ? .75 : 1);
    if (s.taivaalla > .3) { const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, k*2.2); g.addColorStop(0, `rgba(127,216,255,${.4*s.taivaalla})`); g.addColorStop(1, 'rgba(127,216,255,0)'); ctx.fillStyle = g; ctx.fillRect(s.x - k*2.2, s.y - k*2.2, k*4.4, k*4.4); }
    ctx.fillStyle = '#1a2233'; ctx.fillRect(s.x - k*.45, s.y - k*.45, k*.9, k*.9);
    ctx.fillStyle = '#3d8fe0'; ctx.fillRect(s.x - k*1.9, s.y - k*.25, k*1.3, k*.5); ctx.fillRect(s.x + k*.6, s.y - k*.25, k*1.3, k*.5);
    ctx.fillStyle = '#9fd8ff'; ctx.fillRect(s.x - k*1.9, s.y - k*.25, k*1.3, k*.1); ctx.fillRect(s.x + k*.6, s.y - k*.25, k*1.3, k*.1); };
  satelliitit.filter(s => s.z < 0 && s.taivaalla < .5).forEach(sat);

  // ilmakehän hehku
  const ag = ctx.createRadialGradient(kx, ky, r*.9, kx, ky, r*1.35); ag.addColorStop(0, 'rgba(120,190,255,.45)'); ag.addColorStop(1, 'rgba(120,190,255,0)');
  ctx.fillStyle = ag; ctx.fillRect(kx - r*1.4, ky - r*1.4, r*2.8, r*2.8);
  // pallon pohja (yöpuoli) + pikselipisteet
  ctx.fillStyle = '#0d2244'; ctx.beginPath(); ctx.arc(kx, ky, r, 0, 7); ctx.fill();
  const kierto = t * .35, kallistus = .4, koko2 = Math.max(1.5, r * .062);
  for (const q of PISTEET) {
    const l = q.lon + kierto, x3 = Math.cos(q.lat)*Math.sin(l), y3 = Math.sin(q.lat), z3 = Math.cos(q.lat)*Math.cos(l);
    const y2 = y3*Math.cos(kallistus) - z3*Math.sin(kallistus), z2 = y3*Math.sin(kallistus) + z3*Math.cos(kallistus);
    if (z2 < 0) continue;
    const valo = .45 + .55 * Math.max(0, x3*-.5 + y2*.35 + z2*.8);              // valo vasemmalta ylhäältä (aurinko)
    const c = VARIT[q.tyyppi];
    ctx.fillStyle = `rgb(${c[0]*valo|0},${c[1]*valo|0},${c[2]*valo|0})`;
    ctx.fillRect(kx + x3*r - koko2/2, ky - y2*r - koko2/2, koko2, koko2);
  }
  // reunan kiilto
  ctx.strokeStyle = 'rgba(170,215,255,.6)'; ctx.lineWidth = Math.max(1.5, r*.03); ctx.beginPath(); ctx.arc(kx, ky, r, 0, 7); ctx.stroke();

  satelliitit.filter(s => !(s.z < 0 && s.taivaalla < .5)).forEach(sat);

  // kosketuskohta sormenpäässä hehkuu ja sykkii
  const syke = .5 + .5*Math.sin(t*3);
  const tg = ctx.createRadialGradient(sx, sy, 0, sx, sy, r*.45); tg.addColorStop(0, `rgba(255,240,200,${.55 + .3*syke})`); tg.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = tg; ctx.fillRect(sx - r*.5, sy - r*.5, r, r);
  ctx.restore();
}

function silmukka(ms){
  if (!aktiivinen) return;
  edellinen = ms;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t);
  rafId = requestAnimationFrame(silmukka);
}

window.naytaOligarkit = function(p){
  if (!(p && p.oligarkit)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  const jatkuu = aktiivinen;
  pelkkaTaivas = p.oligarkit === 'taivas';
  if (pelkkaTaivas) tiedotAlku = performance.now();
  koko(); aktiivinen = true; cv.style.opacity = 1;
  if (!(jatkuu && pelkkaTaivas)) alku = performance.now() + (pelkkaTaivas ? 0 : 300);
  edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
