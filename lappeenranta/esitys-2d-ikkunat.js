// ============================================================================
// IKKUNAT SAMMUVAT (6.10.2026, x:10815 "Mitkä työt voi olettaa säilyvän?").
// Taustan OMAT ikkunat sammuvat (kaupunki-eder-towers-yo): ei päälle
// liimattuja rakennuksia - Jarno hylkäsi ensimmäisen version, jossa tornit
// oli piirretty koodilla taustan päälle ("päälleliimatut, ei hyvä").
//
// Toteutus: jokaisen rakennuskerroksen tekstuurista tehdään kopio
// (CanvasTexture), ja TileSprite vaihdetaan käyttämään sitä. Ikkunat
// tunnistetaan pikseleistä (selvästi julkisivua kirkkaampi pikseli), ja
// sammutus maalaa ne julkisivun värillä. Parallaksi, kerrosjärjestys ja
// toisto toimivat siksi itsestään. Pysähdyksestä poistuttaessa alkuperäiset
// tekstuurit palautetaan.
//
// Kulku: etummaisista kerroksista sammuu yksi ikkuna kerrallaan (~2,6 s
// välein), ja sen kohdalla häivähtää Gatesin listan ammatti (gatesnotes.com
// 26.8.2026). Taaemmat kerrokset pimenevät hiljalleen taustalla. Kun dian
// rivi ilmestyy, yksi etukerroksen ikkuna vaihtuu lämpimäksi ja jää palamaan.
//
// Käyttö esitys-data.js:ssä: `ikkunat: true` pysähdykseen, jonka teksti on
// rivit-taulukko (ensimmäinen rivi = johdanto, ei omaa valoa).
// ============================================================================
(function(){
'use strict';
const AMMATIT = ['myynti', 'asiakaspalvelu', 'ohjelmointi', 'juristin avustaja', 'data-analyysi', 'lainahakemukset'];
const LAMMIN = [255, 196, 96];
const TAUSTASAMMUTUS = 70;        // s: tässä ajassa taaemmat kerrokset ovat pimeinä

// nimiteksti + lämpimien hehku: DOM-kanvaasi tekstin alla
const cv = document.createElement('canvas'); cv.id = 'ikkunat';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.append(cv));
let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

const rnd = (a, b) => a + Math.random()*(b - a);
let kaynnissa = false, raf = 0, t0 = 0, edT = 0, t = 0;
let tila = null;                  // { kerrokset: [...], etu: [...], lampimat: [...] }
let seuraava = 0, ammattiIx = 0, nimi = null, taustaKertyma = 0;

// --- ikkunoiden tunnistus yhdestä kerroksesta ---
function tunnistaIkkunat(c, g){
  const w = c.width, h = c.height, d = g.getImageData(0, 0, w, h).data;
  const kirkkaus = i => d[i] + d[i+1] + d[i+2];
  const ikkunat = [];
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = (y*w + x)*4;
    if (d[i+3] < 200) continue;
    // julkisivu = tummin läpinäkymätön naapuri
    let fi = -1, fk = 1e9;
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]]) {
      const j = ((y+dy)*w + x + dx)*4; if (d[j+3] < 200) continue;
      const k = kirkkaus(j); if (k < fk) { fk = k; fi = j; }
    }
    if (fi < 0 || kirkkaus(i) - fk < 90) continue;
    ikkunat.push({ x, y, julkisivu: [d[fi], d[fi+1], d[fi+2]], vari: [d[i], d[i+1], d[i+2]], sammunut: false, lammin: -1 });
  }
  return ikkunat;
}

function valmistele(sc){
  const kerrokset = [];
  if (!sc.kohtaus || sc.kohtaus.nimi !== 'kaupunki-eder-towers-yo') return null;
  (sc.taustakerrokset || []).forEach((t, i) => {
    const tiedosto = (sc.kohtaus.kerrokset[i] || {}).tiedosto || '', avain = sc.kohtaus.nimi + ':' + i + ':' + tiedosto;  // sama avain kuin rakennaTausta()
    if (/traffic|sky/.test(tiedosto)) return;
    if (!sc.textures.exists(avain)) return;
    const src = sc.textures.get(avain).getSourceImage();
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(src, 0, 0);
    const ikkunat = tunnistaIkkunat(c, g);
    if (!ikkunat.length) return;
    const uusi = '__ikkunat_' + i;
    if (sc.textures.exists(uusi)) sc.textures.remove(uusi);
    const tex = sc.textures.addCanvas(uusi, c);
    t.obj.setTexture(uusi);
    kerrokset.push({ t, alkup: avain, uusi, tex, g, ikkunat, ix: i, muuttui: false });
  });
  if (!kerrokset.length) return null;
  kerrokset.sort((a, b) => a.ix - b.ix);
  const etu = kerrokset.slice(-2);            // kaksi etummaista: nimetyt sammutukset + lämpimät
  return { sc, kerrokset, etu, lampimat: [] };
}

function palauta(){
  if (!tila) return;
  for (const k of tila.kerrokset) {
    if (k.t.obj && k.t.obj.scene) k.t.obj.setTexture(k.alkup);
    if (tila.sc.textures.exists(k.uusi)) tila.sc.textures.remove(k.uusi);
  }
  tila = null;
}

// tekstuurin pikseli → ruudun (CSS px) piste, lähin näkyvä toisto
function ruutuun(k, ik){
  const sc = tila.sc, o = k.t.obj, cr = sc.game.canvas.getBoundingClientRect(), sk = cr.width / sc.scale.width;
  const tw = k.tex.source[0].width, s = o.tileScaleX;
  let gx = ((ik.x + 0.5 - o.tilePositionX) % tw + tw) % tw * s;
  const gy = o.y + (ik.y + 0.5 - o.tilePositionY) * o.tileScaleY;
  return { x: cr.left + gx*sk, y: cr.top + gy*sk, s: s*sk, toistoLeveys: tw*s*sk };
}
function naytolla(k, ik, marginaali){
  const p = ruutuun(k, ik), r = document.querySelector('#teksti')?.getBoundingClientRect();
  if (p.x < 20 || p.x > W - 20 || p.y < 40 || p.y > H - 20) return false;
  if (r && p.x > r.left - marginaali && p.x < r.right + marginaali && p.y > r.top - marginaali && p.y < r.bottom + marginaali) return false;
  return true;
}

function maalaa(k, ik, rgb){
  k.g.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`; k.g.fillRect(ik.x, ik.y, 1, 1); k.muuttui = true;
}

function valitseLampimat(){
  // kolme ikkunaa mistä tahansa kerroksesta: ruudun vasemmalla puoliskolla,
  // ketun yläpuolella (ei alareunassa), levitettynä vaakasuunnassa
  const ehdokkaat = [];
  for (const k of tila.kerrokset) for (const ik of k.ikkunat) {
    if (!naytolla(k, ik, 60)) continue;
    const p = ruutuun(k, ik);
    if (p.x < W*0.06 || p.x > W*0.42 || p.y < H*0.42 || p.y > H*0.74) continue;
    ehdokkaat.push({ k, ik, x: p.x });
  }
  ehdokkaat.sort((a, b) => a.x - b.x);
  if (!ehdokkaat.length) return;
  for (let i = 0; i < 3; i++) {
    const e = ehdokkaat[Math.min(ehdokkaat.length - 1, Math.floor((i + 0.5) / 3 * ehdokkaat.length))];
    if (tila.lampimat.some(l => l.ik === e.ik)) continue;
    e.ik.lammin = i; tila.lampimat.push({ k: e.k, ik: e.ik, lampo: 0 });
    maalaa(e.k, e.ik, e.ik.julkisivu);       // pimeä kunnes rivi ilmestyy
  }
}

function kehys(nyt){
  raf = requestAnimationFrame(kehys);
  const dt = Math.min(0.05, (nyt - edT) / 1000); edT = nyt; t = (nyt - t0) / 1000;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  if (!tila) {
    const sc = window.__paaKohtaus;
    if (!sc || !sc.taustakerrokset || t < 0.3) return;
    tila = valmistele(sc); if (!tila) return;
    valitseLampimat();
  }
  if (tila.kerrokset.some(k => !k.t.obj.scene)) { tila = null; return; }   // kohtaus vaihtui alta

  // nimetty sammutus etukerroksista
  if (t > seuraava) {
    const ehd = [];
    for (const k of tila.etu) for (const ik of k.ikkunat) if (!ik.sammunut && ik.lammin < 0 && naytolla(k, ik, 30)) ehd.push({ k, ik });
    if (ehd.length) {
      const e = ehd[Math.floor(Math.random()*ehd.length)], p = ruutuun(e.k, e.ik);
      e.ik.sammunut = true; e.ik.vilkku = t;
      nimi = { teksti: AMMATIT[ammattiIx++ % AMMATIT.length], k: e.k, ik: e.ik, alku: t };
    }
    seuraava = t + rnd(2.4, 3.0);
  }
  // vilkahdus ennen sammumista
  for (const k of tila.etu) for (const ik of k.ikkunat) if (ik.vilkku != null) {
    const u = t - ik.vilkku;
    if (u > 0.45) { maalaa(k, ik, ik.julkisivu); ik.vilkku = null; }
    else maalaa(k, ik, (Math.floor(u * 14) % 2) ? ik.julkisivu : ik.vari);
  }
  // taaemmat kerrokset pimenevät hiljalleen
  const taka = tila.kerrokset.filter(k => !tila.etu.includes(k));
  const kaikki = taka.reduce((n, k) => n + k.ikkunat.length, 0);
  taustaKertyma += dt * kaikki / TAUSTASAMMUTUS;
  while (taustaKertyma >= 1) {
    taustaKertyma -= 1;
    const k = taka[Math.floor(Math.random()*taka.length)]; if (!k) break;
    const palavat = k.ikkunat.filter(ik => !ik.sammunut && ik.lammin < 0); if (!palavat.length) continue;
    const ik = palavat[Math.floor(Math.random()*palavat.length)]; ik.sammunut = true; maalaa(k, ik, ik.julkisivu);
  }

  // lämpimät seuraavat näkyviä rivejä
  const naky = document.querySelectorAll('#teksti .leipa-rivi.nakyy').length - 1;
  for (const L of tila.lampimat) {
    const kohde = naky > L.ik.lammin ? 1 : 0, ennen = L.lampo;
    L.lampo += (kohde - L.lampo) * Math.min(1, dt / 0.8);
    if (Math.abs(L.lampo - ennen) > 0.004 || (kohde && !L.maalattu) || (!kohde && L.maalattu)) {
      const j = L.ik.julkisivu, m = L.lampo;
      maalaa(L.k, L.ik, [0, 1, 2].map(c => Math.round(j[c] + (LAMMIN[c] - j[c])*m)));
      L.maalattu = m > 0.5;
    }
    if (L.lampo > 0.02) {
      const p = ruutuun(L.k, L.ik), r = Math.max(10, p.s*7), heng = 0.85 + 0.15*Math.sin(t*0.8 + L.ik.lammin*2);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, `rgba(255,190,90,${0.5*L.lampo*heng})`); g.addColorStop(1, 'rgba(255,190,90,0)');
      ctx.fillStyle = g; ctx.fillRect(p.x - r, p.y - r, r*2, r*2);
    }
  }
  for (const k of tila.kerrokset) if (k.muuttui) { k.tex.refresh(); k.muuttui = false; }

  // ammatin nimi häivähtää sammuneen ikkunan yllä
  if (nimi) {
    const u = (t - nimi.alku) / 2.6;
    if (u >= 1) nimi = null;
    else {
      const p = ruutuun(nimi.k, nimi.ik), a = u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85;
      ctx.font = `italic ${Math.max(16, Math.round(H*0.032))}px Georgia, Garamond, "Times New Roman", serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      const y = p.y - Math.max(6, p.s*2);
      ctx.fillStyle = `rgba(0,0,0,${0.7*a})`; ctx.fillText(nimi.teksti, p.x + 2, y + 2);
      ctx.fillStyle = `rgba(232,236,240,${a})`; ctx.fillText(nimi.teksti, p.x, y);
    }
  }
}

function kaynnista(){
  kaynnissa = true; t0 = edT = performance.now(); seuraava = 2; ammattiIx = 0; nimi = null; taustaKertyma = 0;
  palauta();
  cv.style.opacity = 1;
  cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
}
function pysayta(){
  kaynnissa = false; cv.style.opacity = 0;
  palauta();
  setTimeout(() => { if (!kaynnissa) cancelAnimationFrame(raf); }, 650);
}

window.naytaIkkunat = function(p){
  if (p && p.ikkunat) { if (!kaynnissa) kaynnista(); }
  else if (kaynnissa) pysayta();
};
})();
