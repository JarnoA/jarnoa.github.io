// ============================================================================
// TAIDEPIKSELIT (29.10.2026 Joensuu, x:11000 (oli 11410) "Taiteilijat: enemmän töitä,
// enemmän suosiota – vähemmän omaa jälkeä", Zhou & Lee 2024)
//
// Käyttö esitys-data.js:ssä: pysähdykseen kenttä `taidepikselit: true`.
//
// Kulku (tyyli esitys-2d-luovuus.js:stä, Wallenberg x:3540): kolme taiteilijaa
// piirtää kolme eri teosta omalla värillään ja kädenjäljellään (kukka,
// muotokuva, maisema). Kylmät siniset pikselit kopioivat ne, käsin piirretty
// viiva sammuu, ja pikselit valuvat kaikissa kolmessa samaan kuvaan. Lopuksi
// kolme identtistä kuvaa - "vähemmän omaa jälkeä".
//
// Kortti on oikealla (puoli:'oikea'), joten teokset piirretään #teksti-
// laatikon vasemmalle puolelle, ketun (keskellä alhaalla) yläpuolelle.
// ============================================================================
(function(){
'use strict';
const ALKUVIIVE = 400;                   // ms tekstin ilmestymisestä
const PIIRTO = 2.0, KOPIO_ALKU = 2.4, KOPIO = 1.0, VALUU_ALKU = 3.8, VALUU = 1.8;   // s
const KYLMA = '120,210,255';
const TAITEILIJAT = [                    // väri, viivan paksuus, käden huojunta = oma jälki
  { kuvio: 'kukka',      vari: '#ff7a59', paksuus: .045, huojunta: .02 },
  { kuvio: 'muotokuva',  vari: '#f2c94c', paksuus: .025, huojunta: .008 },
  { kuvio: 'maisema',    vari: '#ff9ecf', paksuus: .035, huojunta: .03 },
];

const cv = document.createElement('canvas');
cv.id = 'taidepikselit';
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
    const terat = []; for (let i=0;i<=120;i++){ const th=Math.PI*i/120, r=.3*Math.cos(5*th); terat.push([Math.cos(th)*r, -.12+Math.sin(th)*r]); }
    return [ terat, kaari(0,-.12,.06,0,Math.PI*2,20), [[0,-.06],[.02,.1],[-.01,.25],[.02,.42]], [[.01,.26],[.13,.18],[.2,.23],[.1,.3],[.01,.26]] ];
  })(),
  muotokuva: [ kaari(0,-.08,.26,0,Math.PI*2,48), kaari(-.09,-.13,.035,0,Math.PI*2,12), kaari(.09,-.13,.035,0,Math.PI*2,12),
               [[0,-.08],[-.03,.02],[.02,.03]], kaari(0,.02,.11,.35,Math.PI-.35,16),
               [[-.26,-.12],[-.2,-.32],[-.05,-.4],[.12,-.38],[.24,-.28],[.27,-.1]], [[-.18,.17],[-.3,.42]], [[.18,.17],[.3,.42]] ],
  maisema: [ [[-.45,.3],[-.25,-.05],[-.12,.12],[.05,-.25],[.22,.05],[.32,-.06],[.45,.3]],
             kaari(-.28,-.3,.08,0,Math.PI*2,20), [[-.45,.3],[.45,.3]],
             [[-.35,.4],[-.15,.36],[.05,.41],[.25,.37],[.4,.4]] ],
  // yhteinen lopputulos: siisti, symmetrinen, persoonaton
  sama: [ kaari(0,-.05,.22,0,Math.PI*2,60), [[-.4,.32],[.4,.32]], kaari(0,-.05,.1,0,Math.PI*2,30) ],
};
function kasin(viivat, siemen, huojunta){
  let s = siemen; const r = () => (s = (s*9301+49297) % 233280) / 233280 - .5;
  return viivat.map(v => v.map(([x,y]) => [x + r()*huojunta, y + r()*huojunta]));
}
function pituus(v){ let L=0; for(let i=1;i<v.length;i++) L+=Math.hypot(v[i][0]-v[i-1][0], v[i][1]-v[i-1][1]); return L; }

// viivat -> ruudukon pikselit (suhteessa teoksen keskipisteeseen)
function pikselit(viivat, koko, ruutu){
  const set = new Map();
  for (const v of viivat) for (let i=1;i<v.length;i++) {
    const [ax,ay] = v[i-1], [bx,by] = v[i], n = Math.ceil(Math.hypot(bx-ax,by-ay)*koko/ruutu*1.5)+1;
    for (let j=0;j<=n;j++){ const gx = Math.round((ax+(bx-ax)*j/n)*koko/ruutu), gy = Math.round((ay+(by-ay)*j/n)*koko/ruutu); set.set(gx+','+gy, [gx*ruutu, gy*ruutu]); }
  }
  // kulman mukaan järjestys -> valuminen näyttää liikkeeltä eikä sekamelskalta
  return [...set.values()].sort((a,b) => Math.atan2(a[1],a[0]) - Math.atan2(b[1],b[0]));
}

// ---------- tila ----------
let aktiivinen = false, rafId = 0, alku = 0, ajastin = 0;
let teokset = [], ruutu = 6;

function suunnittele(){
  const t = document.getElementById('teksti');
  const r = t && t.getBoundingClientRect().width > 0 ? t.getBoundingClientRect() : { left: W*.55, top: H*.2, bottom: H*.6 };
  const x0 = W*.04, x1 = Math.max(W*.4, r.left - W*.03);
  const vali = (x1 - x0) / 3;
  const koko = Math.min(vali * .82, H*.26);
  const y = Math.min(H*.5, H*.68 - koko*.5);
  ruutu = Math.max(4, koko * .04);
  const sama = pikselit(KUVIOT.sama, koko, ruutu);
  teokset = TAITEILIJAT.map((ta, i) => {
    const viivat = kasin(KUVIOT[ta.kuvio], 13 + i*29, ta.huojunta);
    const omat = pikselit(viivat, koko, ruutu);
    // jokaiselle omalle pikselille kohde yhteisestä kuvasta (indeksi skaalataan)
    const lista = omat.map((p, j) => ({ x: p[0], y: p[1], kx: sama[Math.floor(j * sama.length / omat.length)][0], ky: sama[Math.floor(j * sama.length / omat.length)][1], hetki: Math.random(), viive: Math.random()*.35 }));
    return { ...ta, viivat, cx: x0 + vali*(i+.5), cy: y, koko, lista };
  });
}

function piirraViivat(k, osuus, alpha){
  const kaikki = k.viivat.reduce((s,v) => s + pituus(v), 0); let jaljella = kaikki * osuus, karki = null;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = k.vari; ctx.lineCap = ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, k.koko * k.paksuus); ctx.shadowColor = k.vari; ctx.shadowBlur = 12;
  for (const v of k.viivat) {
    if (jaljella <= 0) break;
    ctx.beginPath(); ctx.moveTo(k.cx + v[0][0]*k.koko, k.cy + v[0][1]*k.koko);
    for (let i=1;i<v.length;i++) {
      const d = Math.hypot(v[i][0]-v[i-1][0], v[i][1]-v[i-1][1]);
      if (d > jaljella) { const f = jaljella/d, x = v[i-1][0]+(v[i][0]-v[i-1][0])*f, y = v[i-1][1]+(v[i][1]-v[i-1][1])*f;
        ctx.lineTo(k.cx + x*k.koko, k.cy + y*k.koko); karki = [k.cx + x*k.koko, k.cy + y*k.koko]; jaljella = 0; break; }
      jaljella -= d; ctx.lineTo(k.cx + v[i][0]*k.koko, k.cy + v[i][1]*k.koko);
    }
    ctx.stroke();
  }
  ctx.restore();
  return karki;
}
function kehys(k, vari, alpha){
  const s = k.koko * .62;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = vari; ctx.lineWidth = Math.max(1.5, k.koko*.012);
  ctx.strokeRect(k.cx - s, k.cy - s, 2*s, 2*s); ctx.restore();
}
function kynanKarki(x, y){
  const r = H*.025, g = ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,'rgba(255,200,120,.9)'); g.addColorStop(1,'rgba(255,200,120,0)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x-r,y-r,2*r,2*r); ctx.restore();
  ctx.fillStyle = '#fff3d6'; ctx.beginPath(); ctx.arc(x, y, Math.max(2, H*.004), 0, 7); ctx.fill();
}
const pehmea = f => f*f*(3-2*f);

function piirra(t){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const kopioE = Math.max(0, Math.min(1, (t - KOPIO_ALKU) / KOPIO));
  const sammuu = Math.max(0, Math.min(1, (t - VALUU_ALKU + .4) / .8));
  for (const k of teokset) {
    // 1) taiteilijan oma viiva ja kehys omalla värillä
    kehys(k, k.vari, .5 * (1 - sammuu));
    const karki = piirraViivat(k, Math.min(1, t / PIIRTO), 1 - sammuu);
    if (karki && t < PIIRTO) kynanKarki(karki[0], karki[1]);
    // 2) pikselit kopioivat ja 3) valuvat samaan kuvaan
    if (kopioE <= 0) continue;
    kehys(k, `rgb(${KYLMA})`, .45 * sammuu);
    const s = ruutu * .82;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const p of k.lista) {
      if (p.hetki > kopioE) continue;
      const syt = Math.min(1, (kopioE - p.hetki) * 6);
      const f = pehmea(Math.max(0, Math.min(1, (t - VALUU_ALKU - p.viive) / VALUU)));
      ctx.fillStyle = `rgba(${KYLMA},${.85*syt})`;
      ctx.fillRect(k.cx + p.x + (p.kx - p.x)*f - s/2, k.cy + p.y + (p.ky - p.y)*f - s/2, s, s);
    }
    ctx.restore();
  }
}

function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t); else { ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height); }
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä (naytaTeksti():n JÄLKEEN).
window.naytaTaidepikselit = function(p){
  if (!(p && p.taidepikselit)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); clearTimeout(ajastin); cv.style.opacity = 0;
    return;
  }
  koko();
  aktiivinen = true; cv.style.opacity = 1;
  alku = performance.now() + ALKUVIIVE;
  // kortti rakentuu pienellä viiveellä -> paikat lasketaan uudelleen kun sen koko tiedetään
  clearTimeout(ajastin); ajastin = setTimeout(suunnittele, 400); suunnittele();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
