// ============================================================================
// LUOVUUS-KOHTAUS (2.10.2026, x:3540 Wallenberg: "Ihminen on joutunut jatkuvasti
// perääntymään ja etsimään uusia tapoja ilmaista luovuutta, johon koneet eivät
// kykene. Meidän täytyy pyrkiä tukemaan tätä ihmisyyden ydintä.")
//
// Käyttö esitys-data.js:ssä: pysähdykseen kenttä `luovuus: true`.
//
// Kulku: lämmin käsin piirretty viiva piirtää kuvan (kukka, melodia, tanssija),
// kylmät siniset pikselit kopioivat sen päälle, ihmisen viiva irtoaa kipinänä ja
// siirtyy uuteen paikkaan piirtämään uutta - "perääntyy ja etsii uusia tapoja".
// Lopuksi kipinä laskeutuu ketun luo ja piirtää sydämen, jota pikselit yrittävät
// kopioida mutta eivät pysty: ne hajoavat sen hehkuun. Sydän jää hehkumaan
// ("ihmisyyden ydin").
//
// Tekstin luettavuus: kaikki piirretään tekstikerroksen (z 5) ALLE, ja
// piirtoalue alkaa vasta #teksti-laatikon alareunan alapuolelta (lasketaan
// joka kerta, toimii millä tahansa ruutusuhteella). Ketun kohta (keskellä
// alhaalla) jätetään vapaaksi sydäntä lukuun ottamatta.
// ============================================================================
(function(){
'use strict';
const ALKUVIIVE = 1000;                 // ms tekstin ilmestymisestä ensimmäiseen viivaan
const PIIRTO = 1.3, PITO = .35, KOPIO = .9, LENTO = .7;   // s, yhden kierroksen vaiheet
const LAMMIN = ['#ffb347', '#ff7a59', '#f2c94c'], KYLMA = '120,210,255';

const cv = document.createElement('canvas');
cv.id = 'luovuus';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', koko); koko();

// ---------- kuviot: viivat yksikkölaatikossa (-0.5..0.5), y alaspäin ----------
function kaari(cx, cy, r, a0, a1, n=40){ const p=[]; for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; p.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r]); } return p; }
const KUVIOT = {
  kukka: (() => {
    const terat = []; for (let i=0;i<=120;i++){ const th=Math.PI*i/120, r=.27*Math.cos(5*th); terat.push([Math.cos(th)*r, -.14+Math.sin(th)*r]); }
    return [ terat, kaari(0,-.14,.06,0,Math.PI*2,20),
      [[0,-.08],[.02,.05],[-.01,.2],[.03,.35],[.02,.48]],
      [[.01,.25],[.12,.18],[.19,.22],[.1,.29],[.01,.25]] ];
  })(),
  melodia: (() => {
    const aalto = []; for (let i=0;i<=60;i++){ const x=-.5+i/60; aalto.push([x, .18+Math.sin(x*11)*.06]); }
    const nuotti = (x, y) => [ kaari(x, y, .045, 0, Math.PI*2, 16), [[x+.045, y], [x+.045, y-.24], [x+.12, y-.18]] ];
    return [ aalto, ...nuotti(-.3, .02), ...nuotti(-.02, -.08), ...nuotti(.26, .04) ];
  })(),
  tanssija: [ kaari(0,-.34,.09,0,Math.PI*2,24), [[0,-.25],[.02,.08]], [[-.3,-.42],[-.15,-.2],[.01,-.15],[.18,-.3],[.28,-.48]],
              [[.02,.08],[-.18,.28],[-.3,.46]], [[.02,.08],[.16,.24],[.1,.46],[.24,.48]] ],
  sydan: (() => { const p=[]; for(let i=0;i<=80;i++){ const t=Math.PI*2*i/80; p.push([.032*16*Math.pow(Math.sin(t),3), -.032*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))]); } return [p]; })(),
};
// käsin piirretty tuntu: pieni pysyvä huojunta jokaiseen pisteeseen
function kasin(viivat, siemen){
  let s = siemen; const r = () => (s = (s*9301+49297) % 233280) / 233280 - .5;
  return viivat.map(v => v.map(([x,y]) => [x + r()*.012, y + r()*.012]));
}
function pituus(v){ let L=0; for(let i=1;i<v.length;i++) L+=Math.hypot(v[i][0]-v[i-1][0], v[i][1]-v[i-1][1]); return L; }

// ---------- tila ----------
let aktiivinen = false, rafId = 0, alku = 0, ajastin = 0, edellinen = 0;
let kierrokset = [], kipinat = [], sydan = null, hyokkaajat = [];

function suunnittele(){
  // vapaa kaista tekstin alapuolella, ketun yläpuolella
  const t = document.getElementById('teksti');
  const ala = t && t.getBoundingClientRect().height > 0 ? t.getBoundingClientRect().bottom : H*.42;
  const y0 = Math.max(H*.48, ala + H*.05), y1 = H*.80;
  const koko = Math.min(H*.2, (y1 - y0) * .9, W*.16);
  const ym = (y0 + y1) / 2;
  const paikat = [[W*.17, ym], [W*.80, ym - koko*.15], [W*.33, ym + koko*.12]];
  kierrokset = ['kukka', 'melodia', 'tanssija'].map((n, i) => ({
    viivat: kasin(KUVIOT[n], 17 + i*31), x: paikat[i][0], y: paikat[i][1], koko, vari: LAMMIN[i], pikselit: null, alkaa: i * (PIIRTO+PITO+KOPIO+LENTO),
  }));
  const loppu = kierrokset.length * (PIIRTO+PITO+KOPIO+LENTO);
  sydan = { viivat: kasin(KUVIOT.sydan, 7), x: W*.5, y: H*.70, koko: koko*.75, vari: '#ff6b6b', alkaa: loppu, valmis: false };
  hyokkaajat = [];
}
// kopion pikselit: viivat näytteistetään ruudukkoon
function pikselit(k){
  const ruutu = Math.max(4, k.koko * .045), set = new Map();
  for (const v of k.viivat) for (let i=1;i<v.length;i++) {
    const [ax,ay] = v[i-1], [bx,by] = v[i], n = Math.ceil(Math.hypot(bx-ax,by-ay)*k.koko/ruutu*1.5)+1;
    for (let j=0;j<=n;j++){ const x = k.x + (ax+(bx-ax)*j/n)*k.koko, y = k.y + (ay+(by-ay)*j/n)*k.koko;
      const gx = Math.round(x/ruutu), gy = Math.round(y/ruutu); set.set(gx+','+gy, [gx*ruutu, gy*ruutu]); }
  }
  const lista = [...set.values()].map(p => ({ x:p[0], y:p[1], hetki: Math.random() }));
  return { ruutu, lista };
}

function piirraViivat(k, osuus, alpha, hehku){
  const kaikki = k.viivat.reduce((s,v) => s + pituus(v), 0); let jaljella = kaikki * osuus;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = k.vari; ctx.lineCap = ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2.5, k.koko * .035); ctx.shadowColor = k.vari; ctx.shadowBlur = hehku;
  let karki = null;
  for (const v of k.viivat) {
    if (jaljella <= 0) break;
    ctx.beginPath(); ctx.moveTo(k.x + v[0][0]*k.koko, k.y + v[0][1]*k.koko);
    for (let i=1;i<v.length;i++) {
      const d = Math.hypot(v[i][0]-v[i-1][0], v[i][1]-v[i-1][1]);
      if (d > jaljella) { const f = jaljella/d, x = v[i-1][0]+(v[i][0]-v[i-1][0])*f, y = v[i-1][1]+(v[i][1]-v[i-1][1])*f;
        ctx.lineTo(k.x + x*k.koko, k.y + y*k.koko); karki = [k.x + x*k.koko, k.y + y*k.koko]; jaljella = 0; break; }
      jaljella -= d; ctx.lineTo(k.x + v[i][0]*k.koko, k.y + v[i][1]*k.koko);
    }
    ctx.stroke();
  }
  ctx.restore();
  return karki;
}
function hehku(x, y, r, rgb, a){
  if (a <= .003) return;
  const g = ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(${rgb},${a})`); g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x-r,y-r,2*r,2*r); ctx.restore();
}
function kynanKarki(x, y){ hehku(x, y, H*.03, '255,200,120', .9); ctx.fillStyle = '#fff3d6'; ctx.beginPath(); ctx.arc(x, y, Math.max(2, H*.004), 0, 7); ctx.fill(); }

function piirra(t, dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const KIERROS = PIIRTO+PITO+KOPIO+LENTO;
  for (let i=0;i<kierrokset.length;i++) {
    const k = kierrokset[i], e = t - k.alkaa;
    if (e < 0) continue;
    // 1) ihmisen viiva piirtyy
    const piirto = Math.min(1, e / PIIRTO);
    const kopioE = (e - PIIRTO - PITO) / KOPIO;               // 0..1 kopioinnin aikana
    const irtoaa = Math.max(0, Math.min(1, (e - PIIRTO - PITO - KOPIO*.6) / (KOPIO*.4)));
    const karki = piirraViivat(k, piirto, 1 - irtoaa, 14);
    if (karki && piirto < 1) kynanKarki(karki[0], karki[1]);
    // 2) kylmät pikselit kopioivat päälle; kopio himmenee hiljalleen myöhemmin
    if (kopioE > 0) {
      if (!k.pikselit) k.pikselit = pikselit(k);
      const himmeys = Math.max(.25, 1 - Math.max(0, e - KIERROS) * .12);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const p of k.pikselit.lista) {
        if (p.hetki > kopioE) continue;
        const syt = Math.min(1, (kopioE - p.hetki) * 6);
        ctx.fillStyle = `rgba(${KYLMA},${.85*syt*himmeys})`;
        const s = k.pikselit.ruutu * .82;
        ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
      }
      ctx.restore();
    }
    // 3) ihminen irtoaa kipinänä ja lentää seuraavaan paikkaan
    const lentoE = (e - PIIRTO - PITO - KOPIO) / LENTO;
    if (lentoE > 0 && lentoE < 1) {
      const kohde = kierrokset[i+1] || sydan;
      const a = [k.x, k.y - k.koko*.1], b = [kohde.x + kohde.viivat[0][0][0]*kohde.koko, kohde.y + kohde.viivat[0][0][1]*kohde.koko];
      const f = lentoE*lentoE*(3-2*lentoE), x = a[0]+(b[0]-a[0])*f, y = a[1]+(b[1]-a[1])*f - Math.sin(Math.PI*f)*H*.12;
      kynanKarki(x, y);
      if (Math.random() < dt*40) kipinat.push({ x, y, vx:(Math.random()-.5)*30, vy:-10-Math.random()*20, ika:0, kesto:.6+Math.random()*.4 });
    }
  }
  // 4) sydän: piirtyy, pikselit hyökkäävät mutta hajoavat sen hehkuun
  const e = t - sydan.alkaa;
  if (e >= 0) {
    const piirto = Math.min(1, e / (PIIRTO*1.2));
    const syke = 1 + Math.sin(t*3.2) * .06 * Math.min(1, Math.max(0, e - PIIRTO*1.2));
    const voima = Math.min(1, Math.max(0, (e - PIIRTO*1.2) / 1.2));
    hehku(sydan.x, sydan.y, sydan.koko*1.6*syke, '255,140,90', .35*voima);
    hehku(sydan.x, H*.9, W*.2, '255,150,100', .18*voima);                   // lämmin valo maahan ja kettuun
    ctx.save(); ctx.translate(sydan.x, sydan.y); ctx.scale(syke, syke); ctx.translate(-sydan.x, -sydan.y);
    const karki = piirraViivat(sydan, piirto, 1, 10 + 18*voima);
    ctx.restore();
    if (karki && piirto < 1) kynanKarki(karki[0], karki[1]);
    if (piirto >= 1 && e < PIIRTO*1.2 + 4.5 && Math.random() < dt*14) {
      const a = Math.random()*Math.PI*2, r = sydan.koko*(1.6 + Math.random()*.8);
      hyokkaajat.push({ x: sydan.x + Math.cos(a)*r*1.4, y: sydan.y + Math.sin(a)*r, ika: 0 });
    }
  }
  // hyökkäävät pikselit: lähestyvät, pysähtyvät hehkun reunaan ja hajoavat
  const s = Math.max(4, sydan.koko * .06);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const h of hyokkaajat) {
    h.ika += dt;
    const dx = sydan.x - h.x, dy = sydan.y - h.y, d = Math.hypot(dx, dy), raja = sydan.koko*.9;
    if (!h.hajoaa && d > raja) { h.x += dx/d * H*.12*dt; h.y += dy/d * H*.12*dt; }
    else if (!h.hajoaa) { h.hajoaa = 0; for (let i=0;i<4;i++) kipinat.push({ x:h.x, y:h.y, vx:-dx/d*40+(Math.random()-.5)*50, vy:-dy/d*40+(Math.random()-.5)*50, ika:0, kesto:.5, kylma:true }); }
    if (h.hajoaa != null) h.hajoaa += dt;
    const a = h.hajoaa != null ? Math.max(0, 1 - h.hajoaa*4) : Math.min(1, h.ika*3);
    ctx.fillStyle = `rgba(${KYLMA},${.8*a})`; ctx.fillRect(h.x - s/2, h.y - s/2, s, s);
  }
  hyokkaajat = hyokkaajat.filter(h => h.hajoaa == null || h.hajoaa < .3);
  for (const k of kipinat) {
    k.ika += dt; k.x += k.vx*dt; k.y += k.vy*dt; const a = 1 - k.ika/k.kesto;
    ctx.fillStyle = k.kylma ? `rgba(${KYLMA},${a})` : `rgba(255,190,110,${a})`;
    ctx.fillRect(k.x - 1.5, k.y - 1.5, 3, 3);
  }
  ctx.restore();
  kipinat = kipinat.filter(k => k.ika < k.kesto);
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t, dt); else { ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height); }
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä (naytaTeksti():n JÄLKEEN).
window.naytaLuovuus = function(p){
  if (!(p && p.luovuus)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); clearTimeout(ajastin); cv.style.opacity = 0;
    return;
  }
  koko(); kipinat = [];
  aktiivinen = true; cv.style.opacity = 1;
  alku = performance.now() + ALKUVIIVE; edellinen = performance.now();
  // teksti rakentuu pienellä viiveellä -> paikat lasketaan vasta kun sen koko tiedetään
  clearTimeout(ajastin); ajastin = setTimeout(suunnittele, 400); suunnittele();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
