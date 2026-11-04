// ============================================================================
// KIITOS JA OLE HYVÄ (3.10.2026, x:9460 "Jo pelkkä kiitoksen ja ole hyvän
// jättäminen kehotteesta vähentäisi ChatGPT:n sähkönkulutusta lähes 100
// gigawattituntia vuodessa.") - Jarno: "I would like to think this newly".
//
// Asettelu: otsikko ylhäällä (kova fakta), moottorin chatti vasemmalla alla
// (chattiX/chattiY), oikealla taivaalla pikselimaapallo (sama tyyli kuin
// esitys-2d-oligarkit.js). Jokainen kohtelias viesti (Kiitos / Ole hyvä)
// irrottaa keltaisen sähkökipinän, joka kaartaa pallolle - vertailualueelle
// syttyy pieniä valoja ja laskuri nousee. Jarnon ajatus: sama sähkö riittäisi
// 800 000 ihmiselle Saharan eteläpuolisessa Afrikassa koko vuodeksi.
//
// Käyttö esitys-data.js:ssä:
//   kiitos: { alue: 'afrikka', luku: 800000, rivit: ['…', '…'] }
// alue: 'afrikka' | 'suomi' (pallo kääntyy alueelle; suomessa valot ovat
// lämpimän oransseja kiukaita). Vertailun voi vaihtaa puhekohtaisesti
// pelkällä datamuutoksella. Ei ääniä.
// ============================================================================
(function(){
'use strict';
const KOHTELIAS = /kiitos|ole hyvä/i;

const cv = document.createElement('canvas'); cv.id = 'kiitos';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

// ---------- mantereet (samat karkeat ääriviivat kuin esitys-2d-oligarkit.js) ----------
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
const SUOMI = [[21,60],[23,60],[27,60.5],[30,61.5],[31.5,63],[30,64.5],[30,66],[29,67.5],[29,69],[28,70],[26,69.8],[24,68.7],[21,69],[23,67.5],[24,65.8],[22,64.5],[21.3,63],[21,61.5]];
function sisalla(lon, lat, poly){ let s = false; for (let i=0, j=poly.length-1; i<poly.length; j=i++){ const [xi, yi] = poly[i], [xj, yj] = poly[j];
  if ((yi > lat) !== (yj > lat) && lon < (xj - xi)*(lat - yi)/(yj - yi) + xi) s = !s; } return s; }
const PISTEET = [];
for (let lat = -88; lat <= 88; lat += 3.2) { const n = Math.max(6, Math.round(112 * Math.cos(lat * Math.PI/180)));
  for (let i=0;i<n;i++){ const lon = -180 + i / n * 360;
    let tyyppi = MANTEREET.some(p => sisalla(lon, lat, p)) ? 'maa' : 'meri';
    if (Math.abs(lat) > 68 && (tyyppi === 'maa' || lat < -68)) tyyppi = 'jaa';
    else if (tyyppi === 'maa' && ((lat > 14 && lat < 34 && lon > -15 && lon < 60) || (lat < -18 && lat > -32 && lon > 118 && lon < 145) || (lat > 25 && lat < 42 && lon > -118 && lon < -102))) tyyppi = 'aavikko';
    PISTEET.push({ lat: lat * Math.PI/180, lon: lon * Math.PI/180, tyyppi }); } }
const VARIT = { meri: [34, 96, 170], maa: [78, 150, 66], aavikko: [196, 170, 100], jaa: [235, 242, 248] };

const ALUEET = {
  afrikka: { lon: 20, lat: -6, sisalla: (lon, lat) => lat < 13 && sisalla(lon, lat, MANTEREET[5]), laatikko: [-17, 51, -35, 13], vari: [255, 214, 110] },
  suomi:   { lon: 26, lat: 63, sisalla: (lon, lat) => sisalla(lon, lat, SUOMI), laatikko: [21, 32, 60, 70], vari: [255, 140, 60] },
};
function teeValot(A, n){
  const v = [];
  for (let yritys = 0; v.length < n && yritys < n*80; yritys++) {
    const lon = A.laatikko[0] + Math.random()*(A.laatikko[1] - A.laatikko[0]), lat = A.laatikko[2] + Math.random()*(A.laatikko[3] - A.laatikko[2]);
    if (A.sisalla(lon, lat)) v.push({ lat: lat*Math.PI/180, lon: lon*Math.PI/180, vaihe: Math.random()*6 });
  }
  return v.sort(() => Math.random() - 0.5);
}

const sstep = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u*u*(3 - 2*u); };
const muotoile = n => Math.round(n).toLocaleString('fi-FI').replace(/ /g, ' ');

let kaynnissa = false, raf = 0, t0 = 0, edT = 0, t = 0;
let asetus = null, alue = null, valot = [], kipinat = [], kasitellyt = new WeakSet(), kohteliaita = 1, osumat = 0, edistys = 0;

function projisoi(lat, lon, kierto, kall){
  const l = lon + kierto, x3 = Math.cos(lat)*Math.sin(l), y3 = Math.sin(lat), z3 = Math.cos(lat)*Math.cos(l);
  return { x: x3, y: y3*Math.cos(kall) - z3*Math.sin(kall), z: y3*Math.sin(kall) + z3*Math.cos(kall) };
}

function kehys(nyt){
  raf = requestAnimationFrame(kehys);
  const dt = Math.min(0.05, (nyt - edT) / 1000); edT = nyt; t = (nyt - t0) / 1000;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);

  // pallo oikealla taivaalla: pyörähtää ja asettuu vertailualueelle
  const r = H*0.19, kx = W*0.76, ky = H*0.44 + Math.sin(t*0.8)*H*0.006;
  const ilm = sstep(0, 1, t);
  const asettuu = sstep(0, 3.2, t);
  const kierto = -alue.lon*Math.PI/180 - (1 - asettuu)*Math.PI*1.4;
  const kall = 0.4 + (alue.lat*Math.PI/180 - 0.4)*asettuu;
  ctx.globalAlpha = ilm;
  const ag = ctx.createRadialGradient(kx, ky, r*0.9, kx, ky, r*1.35); ag.addColorStop(0, 'rgba(120,190,255,.4)'); ag.addColorStop(1, 'rgba(120,190,255,0)');
  ctx.fillStyle = ag; ctx.fillRect(kx - r*1.4, ky - r*1.4, r*2.8, r*2.8);
  ctx.fillStyle = '#0d2244'; ctx.beginPath(); ctx.arc(kx, ky, r, 0, 7); ctx.fill();
  const pk = Math.max(1.5, r*0.062);
  for (const q of PISTEET) {
    const p = projisoi(q.lat, q.lon, kierto, kall); if (p.z < 0) continue;
    const valo = 0.45 + 0.55*Math.max(0, p.x*-0.5 + p.y*0.35 + p.z*0.8), c = VARIT[q.tyyppi];
    ctx.fillStyle = `rgb(${c[0]*valo|0},${c[1]*valo|0},${c[2]*valo|0})`;
    ctx.fillRect(kx + p.x*r - pk/2, ky - p.y*r - pk/2, pk, pk);
  }
  // valot syttyvät edistyksen mukaan
  const syttyneet = Math.floor(valot.length * edistys), [vr, vg, vb] = alue.vari, lk = Math.max(1.5, r*0.028);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < syttyneet; i++) {
    const v = valot[i], p = projisoi(v.lat, v.lon, kierto, kall); if (p.z < 0.05) continue;
    const x = kx + p.x*r, y = ky - p.y*r, a = 0.75 + 0.25*Math.sin(t*3 + v.vaihe);
    const g = ctx.createRadialGradient(x, y, 0, x, y, lk*3); g.addColorStop(0, `rgba(${vr},${vg},${vb},${0.5*a})`); g.addColorStop(1, `rgba(${vr},${vg},${vb},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - lk*3, y - lk*3, lk*6, lk*6);
    ctx.fillStyle = `rgba(255,250,220,${a})`; ctx.fillRect(x - lk/2, y - lk/2, lk, lk);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(170,215,255,.55)'; ctx.lineWidth = Math.max(1.5, r*0.03); ctx.beginPath(); ctx.arc(kx, ky, r, 0, 7); ctx.stroke();

  // laskuri + selite pallon alla
  const luku = asetus.luku * edistys;
  if (edistys > 0) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.font = `700 ${H*0.065}px Georgia, serif`;
    ctx.fillText(muotoile(luku), kx + 2, ky + r*1.22 + 3);
    ctx.fillStyle = `rgb(${vr},${vg},${vb})`; ctx.fillText(muotoile(luku), kx, ky + r*1.22);
    ctx.font = `600 ${H*0.026}px system-ui, sans-serif`; ctx.fillStyle = `rgba(245,240,225,${sstep(0.4, 1, edistys)})`;
    (asetus.rivit || []).forEach((rivi, i) => ctx.fillText(rivi, kx, ky + r*1.22 + H*0.078 + i*H*0.034));
  }
  ctx.globalAlpha = 1;

  // kohteliaat viestit → kipinät
  const rivit = document.querySelectorAll('#chattikupla .kupla-rivi');
  kohteliaita = Math.max(1, [...rivit].filter(e => KOHTELIAS.test(e.textContent)).length);
  rivit.forEach(e => {
    if (kasitellyt.has(e) || !e.classList.contains('nakyy') || !KOHTELIAS.test(e.textContent)) return;
    kasitellyt.add(e);
    const k = (e.querySelector('.kupla') || e).getBoundingClientRect();
    for (let i = 0; i < 9; i++) kipinat.push({ x0: k.right - k.width*0.2, y0: k.top + k.height/2, ika: -i*0.06, kesto: 1.5, paa: i === 0, sx: (Math.random()-0.5)*H*0.04, sy: (Math.random()-0.5)*H*0.04 });
  });
  for (let i = kipinat.length - 1; i >= 0; i--) {
    const s = kipinat[i]; s.ika += dt; if (s.ika < 0) continue;
    const u = Math.min(1, s.ika / s.kesto), e = u*u*(3 - 2*u);
    const tx = kx - r*0.1 + s.sx, ty = ky + s.sy;
    const x = s.x0 + (tx - s.x0)*e, y = s.y0 + (ty - s.y0)*e - Math.sin(u*Math.PI)*H*0.18;
    const k = s.paa ? H*0.012 : H*0.006;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, k*3); g.addColorStop(0, 'rgba(255,220,90,.8)'); g.addColorStop(1, 'rgba(255,200,60,0)');
    ctx.fillStyle = g; ctx.fillRect(x - k*3, y - k*3, k*6, k*6);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#fff6c8'; ctx.fillRect(x - k/2, y - k/2, k, k);
    if (u >= 1) { kipinat.splice(i, 1); if (s.paa) osumat++; }
  }
  const tavoite = Math.min(1, osumat / kohteliaita);
  edistys += (tavoite - edistys) * Math.min(1, dt*2.2);
}

function kaynnista(p){
  asetus = p.kiitos === true ? {} : p.kiitos;
  asetus.luku = asetus.luku || 800000;
  alue = ALUEET[asetus.alue] || ALUEET.afrikka;
  valot = teeValot(alue, alue === ALUEET.suomi ? 70 : 220);
  kaynnissa = true; t0 = edT = performance.now();
  kipinat = []; kasitellyt = new WeakSet(); osumat = 0; edistys = 0;
  cv.style.opacity = 1;
  cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
}
function pysayta(){
  kaynnissa = false; cv.style.opacity = 0;
  setTimeout(() => { if (!kaynnissa) cancelAnimationFrame(raf); }, 650);
}

window.naytaKiitos = function(p){
  if (p && p.kiitos) { if (!kaynnissa) kaynnista(p); }
  else if (kaynnissa) pysayta();
};
})();
