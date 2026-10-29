// ============================================================================
// DIGITAALINEN SIELU (2.10.2026, x:5490 "Digitaalinen jalanjälkemme kertoo
// tarinan valinnoistamme, toiveistamme ja peloistamme, muodostaen digitaalisen
// sielun"). Korvaa tällä pysähdyksellä datakupla-visualisoinnin.
// Käyttö esitys-data.js:ssä: pysähdykseen kenttä `jalanjalki: true`.
//
// Data: METAVERKOSTO_DATA (esitys-2d-metaverkosto.js) = Jarnon oma Meta-
// tietopyyntö, ~200 kolmannen osapuolen sivustoa/sovellusta, joista Meta keräsi
// tietoa vuoden aikana - ilman että Facebookia/Instagramia käytettiin.
//
// Kulku: hehkuvat tassunjäljet tulevat maata pitkin kettua kohti, jokaisen
// yllä syttyy sivuston nimi -> taivaalle aukeaa tumma linssi, jäljistä nousee
// valolankoja ja nimet kulkevat niitä pitkin linssiin -> linssi vapauttaa
// satoja pieniä nimiä, jotka kokoontuvat ketun yläpuolelle oppaan isoksi
// haamukuvaksi (muoto otetaan oppaan nykyisestä animaatioruudusta, joten
// T-rex/hevonen/pupu saavat oman sielunsa) -> sielu leijuu, top-10-nimiä
// välähtää kultaisena tapahtumamäärineen. Teksti on oikealla ylhäällä,
// linssi ja sielu vasemmalla/keskellä; kaikki tekstikerroksen alla (z 4).
// ============================================================================
(function(){
'use strict';
const SYAANI = '120,220,255', VIOLETTI = '190,150,255';
// Korostettavat nimet (Jarno: "some are boring, they should be fun") - valittu
// datasta tarinallisiksi; terveyteen liittyvät (mieli.fi, syoviikot.fi) jätetty pois.
const HAUSKAT = ['Clash Royale', 'TikTok - Videos, Shop & LIVE', 'Auctionet MAIN', '深圳拓普斯塔工贸有限公司', 'Musikhaus Thomann',
  'craftpix.net', 'venepukki.fi', 'Disney Streaming', 'AliExpress Shopping App', 'Anthropic', 'barkibu.com', 'Windy.com - Weather Forecast', 'wetanz.com', 'elevenlabs.io'];
// Otsikon sanat syttyvät tarinan tahdissa (span-luokat esitys-data.js:ssä)
const SANAT = [['.jj-1', 1.2], ['.jj-2', 2.2], ['.jj-3', 3.2], ['.jj-sielu', 9]];

const cv = document.createElement('canvas');
cv.id = 'jalanjalki';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(cv);
  const st = document.createElement('style');
  st.textContent = `.jj-sana,.jj-sielu{transition:color .7s ease,text-shadow .7s ease}
  .jj-1.on{color:#78dcff;text-shadow:0 0 .45em rgba(120,220,255,.75),0 2px 5px rgba(0,0,0,.55)}
  .jj-2.on{color:#ffd166;text-shadow:0 0 .3em rgba(255,200,90,.45),0 2px 5px rgba(0,0,0,.55)}
  .jj-3.on{color:#ff7b7b;text-shadow:0 0 .45em rgba(255,110,110,.75),0 2px 5px rgba(0,0,0,.55)}
  .jj-sielu.on{color:#cdb0ff;text-shadow:0 0 .6em rgba(190,150,255,.95),0 2px 5px rgba(0,0,0,.55);animation:jj-hengitys 3.2s ease-in-out infinite}
  @keyframes jj-hengitys{50%{text-shadow:0 0 1.1em rgba(190,150,255,1),0 2px 5px rgba(0,0,0,.55)}}`;
  document.head.appendChild(st);
});

let W = 0, H = 0, DPR = 1;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', koko); koko();

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;
let askeleet = [], matkalla = [], sielu = [], korostus = null, sieluMaski = null, sieluValmis = null, sieluLoppuu = 0;

const data = () => (typeof METAVERKOSTO_DATA !== 'undefined' ? METAVERKOSTO_DATA : []);
const lyhenna = (n, max=16) => { n = n.split(' - ')[0].split(':')[0]; return n.length > max ? n.slice(0, max-1) + '…' : n; };
const linssi = () => ({ x: W * .2, y: H * .17, r: H * .065 });
const sieluPaikka = () => ({ x: W * .34, y: H * .56, w: Math.min(W * .42, H * .62) });

function suunnittele(){
  // 8 jälkeä, nimet kahdessa porrastetussa rivissä (eivät mene päällekkäin)
  const d = data(), top = d.slice(0, 8);
  const maa = H * .905, alkuX = W * .09, kettuX = W * .45, n = top.length;
  askeleet = top.map((s, i) => ({ nimi: lyhenna(s.n), e: s.e, x: alkuX + (kettuX - alkuX) * (i + .5) / n,
    y: maa + (i % 2 ? H*.012 : -H*.006), rivi: i % 2, hetki: .4 + i * .42, lahti: null }));
  matkalla = []; sielu = []; korostus = null; sieluMaski = null; sieluValmis = null; sieluLoppuu = 0;
}

// oppaan nykyinen animaatioruutu -> läpinäkymättömät pisteet sielun muodoksi
function otaMaski(){
  const sc = window.__paaKohtaus, h = sc && sc.hahmo;
  const c = document.createElement('canvas'), SX = 90, SY = 90; c.width = SX; c.height = SY;
  const g = c.getContext('2d');
  try {
    const f = h.frame, img = f.source.image, ar = f.cutWidth / f.cutHeight;
    const w = ar >= 1 ? SX : SY * ar, hh = ar >= 1 ? SX / ar : SY;
    g.save(); if (h.flipX) { g.translate(SX, 0); g.scale(-1, 1); }
    g.drawImage(img, f.cutX, f.cutY, f.cutWidth, f.cutHeight, (SX - w)/2, SY - hh, w, hh); g.restore();
    const dd = g.getImageData(0, 0, SX, SY).data, raw = [];
    for (let y=0;y<SY;y++) for (let x=0;x<SX;x++) if (dd[(y*SX + x)*4 + 3] > 100) raw.push([x, y]);
    if (raw.length > 30) {
      // rajataan muodon omaan laatikkoon, mittasuhteet säilyvät (leveys = 1, korkeus = kuvasuhde)
      const x0 = Math.min(...raw.map(p => p[0])), x1 = Math.max(...raw.map(p => p[0])) + 1;
      const y0 = Math.min(...raw.map(p => p[1])), y1 = Math.max(...raw.map(p => p[1])) + 1, lw = x1 - x0;
      const pts = raw.map(([x, y]) => [(x - x0 + Math.random()) / lw, (y - y0 + Math.random()) / lw]);
      pts.suhde = (y1 - y0) / lw;
      // hehkuva siluetti: rajattu muoto violetiksi sävytettynä (piirretään nimien alle)
      const sil = document.createElement('canvas'); sil.width = lw; sil.height = y1 - y0;
      const sg = sil.getContext('2d'); sg.drawImage(c, x0, y0, lw, y1 - y0, 0, 0, lw, y1 - y0);
      sg.globalCompositeOperation = 'source-in'; sg.fillStyle = 'rgb(170,130,255)'; sg.fillRect(0, 0, lw, y1 - y0);
      pts.siluetti = sil; return pts;
    }
  } catch (e) {}
  // varalla: soikio
  const pts = []; for (let i=0;i<500;i++){ const a = Math.random()*6.28, r = Math.sqrt(Math.random()); pts.push([.5 + Math.cos(a)*r*.5, .3 + Math.sin(a)*r*.3]); }
  pts.suhde = .6; return pts;
}

// jäljen muoto oppaan mukaan: kettu/pupu tassu, hevonen kavio, T-rex kolmivarvas
function tassu(x, y, a, s){
  const opas = (window.__paaKohtaus && window.__paaKohtaus.hahmoAvain) || 'kettu';
  ctx.save(); ctx.translate(x, y); ctx.scale(1, .45);
  hehku(0, 0, s*2.2, SYAANI, .35*a);
  ctx.fillStyle = ctx.strokeStyle = `rgba(${SYAANI},${.9*a})`;
  if (opas === 'trex') {
    ctx.lineWidth = s*.28; ctx.lineCap = 'round';
    for (const k of [-.55, 0, .55]) { ctx.beginPath(); ctx.moveTo(0, s*.4); ctx.lineTo(Math.sin(k)*s*1.3, s*.4 - Math.cos(k)*s*1.3); ctx.stroke(); }
  } else if (opas === 'hevonen') {
    ctx.lineWidth = s*.3; ctx.beginPath(); ctx.arc(0, 0, s*.7, Math.PI*.15, Math.PI*.85, true); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.ellipse(0, s*.25, s*.55, s*.45, 0, 0, 7); ctx.fill();
    for (const [dx, dy] of [[-.55,-.45],[-.2,-.75],[.2,-.75],[.55,-.45]]) { ctx.beginPath(); ctx.arc(dx*s, dy*s, s*.2, 0, 7); ctx.fill(); }
  }
  ctx.restore();
}
function hehku(x, y, r, rgb, a){
  if (a <= .003) return;
  const g = ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(${rgb},${a})`); g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x-r,y-r,2*r,2*r); ctx.restore();
}
function nimi(t, x, y, koko, a, vari='235,245,255'){
  ctx.font = `600 ${koko}px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`;
  ctx.fillStyle = `rgba(${vari},${a})`; ctx.fillText(t, x, y);
}

function piirra(t, dt){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const L = linssi(), fs = Math.max(11, H * .016);

  // 2) linssi aukeaa taivaalle (ei logoja - nimetön kerääjä)
  const la = Math.max(0, Math.min(1, (t - 3.6) / 1)) * (t > 13 ? Math.max(.35, 1 - (t - 13)*.3) : 1);
  if (la > 0) {
    const r = L.r * (.4 + .6*la);
    hehku(L.x, L.y, r*3, VIOLETTI, .35*la);
    ctx.fillStyle = `rgba(8,6,18,${.95*la})`; ctx.beginPath(); ctx.arc(L.x, L.y, r, 0, 7); ctx.fill();
    ctx.strokeStyle = `rgba(${VIOLETTI},${.9*la})`; ctx.lineWidth = Math.max(2, H*.004); ctx.beginPath(); ctx.arc(L.x, L.y, r, 0, 7); ctx.stroke();
    ctx.strokeStyle = `rgba(${SYAANI},${.6*la})`; ctx.lineWidth = Math.max(1, H*.002);
    ctx.beginPath(); ctx.arc(L.x, L.y, r*.55, t*1.4, t*1.4 + 4.5); ctx.stroke();
    ctx.fillStyle = `rgba(${SYAANI},${la})`; ctx.beginPath(); ctx.arc(L.x, L.y, r*.18, 0, 7); ctx.fill();
  }

  // 1) tassunjäljet + nimet; 2) valolangat ja nimet nousevat linssiin
  for (const a of askeleet) {
    const e = t - a.hetki; if (e < 0) continue;
    const al = Math.min(1, e * 3), haalea = t > 9 ? Math.max(.25, 1 - (t - 9)*.25) : 1;
    tassu(a.x, a.y, al * haalea, H*.014);
    const nouseeE = t - (4.6 + askeleet.indexOf(a) * .18);
    if (nouseeE < 0) {
      const iso = fs * (1 + Math.min(.45, a.e / 200));
      const ny = a.y - H*(a.rivi ? .05 : .11);
      ctx.strokeStyle = `rgba(${SYAANI},${.3*al})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y - H*.01); ctx.lineTo(a.x, ny + iso*.6); ctx.stroke();
      nimi(a.nimi, a.x, ny, iso, al);
      if (a.e >= 15) nimi(a.e + ' tapahtumaa', a.x, ny + iso, fs*.75, al*.7, SYAANI);
    } else {
      // valolanka jäljestä linssiin, nimi liukuu sitä pitkin
      ctx.strokeStyle = `rgba(${SYAANI},${.35 * haalea})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(a.x, L.y + (a.y - L.y)*.4, L.x, L.y); ctx.stroke();
      const f = Math.min(1, nouseeE / 1.4), ff = f*f;
      if (f < 1) { const u = 1 - ff, x = u*u*a.x + 2*u*ff*a.x + ff*ff*L.x, y = u*u*(a.y - H*.045) + 2*u*ff*(L.y + (a.y - L.y)*.4) + ff*ff*L.y;
        nimi(a.nimi, x, y - (1-ff)*H*(a.rivi ? .05 : .11), fs * (1 - .6*ff), 1 - ff*.5); }
    }
  }

  // 3) sielu: linssi vapauttaa kaikki nimet, ne asettuvat oppaan muotoon
  const S = sieluPaikka();
  if (t > 7.6 && !sielu.length) {
    sieluMaski = otaMaski();
    const d = data(), maara = Math.min(d.length, 200), pts = sieluMaski;
    const sw = Math.min(S.w, H * .5 / pts.suhde), sh = sw * pts.suhde;      // ei liian korkea
    sieluMaski.mitat = { x: S.x - sw/2, y: S.y - sh/2, w: sw, h: sh };
    const kx = p => S.x + (p[0] - .5) * sw, ky = p => S.y - sh/2 + p[1] * sw;
    for (let i=0;i<maara;i++){ const p = pts[(Math.random()*pts.length)|0];
      sielu.push({ nimi: lyhenna(d[i].n), orig: d[i].n, e: d[i].e, i, tx: kx(p), ty: ky(p), alkaa: 7.6 + Math.random() * 3, v: Math.random()*6 }); }
    // täyte: tiheä pisteverho muodon sisään, jotta siluetti erottuu selvästi
    for (let i=0;i<Math.min(pts.length, 900);i++){ const p = pts[i]; sielu.push({ piste: true, tx: kx(p), ty: ky(p), alkaa: 8 + Math.random()*3, v: Math.random()*6 }); }
  }
  if (sielu.length) {
    const hengitys = Math.sin(t * 1.2) * H * .006;
    hehku(S.x, S.y, S.w * .6, VIOLETTI, .18 * Math.min(1, Math.max(0, (t - 9) / 2)));
    const m = sieluMaski.mitat, sa = Math.min(1, Math.max(0, (t - 8.5) / 2.5));
    if (sieluMaski.siluetti && m && sa > 0) {
      // SUORITUSKYKY: sumennettu hehku lasketaan KERRAN valmiiksi kuvaksi (shadowBlur joka ruudussa oli raskas)
      if (!sieluMaski.hehkuKuva) {
        const pad = H * .06, c = document.createElement('canvas');
        c.width = Math.ceil((m.w + pad*2) * DPR); c.height = Math.ceil((m.h + pad*2) * DPR);
        const g = c.getContext('2d'); g.scale(DPR, DPR); g.imageSmoothingEnabled = true;
        g.shadowColor = 'rgb(170,130,255)'; g.shadowBlur = H * .03 * DPR;
        g.drawImage(sieluMaski.siluetti, pad, pad, m.w, m.h);
        sieluMaski.hehkuKuva = c; sieluMaski.pad = pad;
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .38 * sa * (.85 + .15 * Math.sin(t * 1.5));
      ctx.drawImage(sieluMaski.hehkuKuva, m.x - sieluMaski.pad, m.y - sieluMaski.pad + hengitys, m.w + sieluMaski.pad*2, m.h + sieluMaski.pad*2);
      ctx.restore();
    }
    sieluLoppuu = sieluLoppuu || Math.max(...sielu.map(s => s.alkaa)) + 1.3;
    if (sieluValmis) {
      // SUORITUSKYKY (2.10.2026): koottu sielu piirretään valmiista kuvasta, vain hengitys ja hohde elävät
      ctx.save(); ctx.globalAlpha = .88 + .12 * Math.sin(t * 2);
      const al = sieluValmis.alue; ctx.drawImage(sieluValmis, al.x, al.y + hengitys, al.w, al.h); ctx.restore();
    } else for (const s of sielu) {
      const e = t - s.alkaa; if (e < 0) continue;
      const f = Math.min(1, e / 1.2), ff = 1 - Math.pow(1 - f, 3);
      const x = L.x + (s.tx - L.x)*ff + Math.sin(t*.8 + s.v) * H*.003, y = L.y + (s.ty - L.y)*ff + hengitys + Math.cos(t*.9 + s.v) * H*.003;
      if (s.piste) { ctx.fillStyle = `rgba(${VIOLETTI},${.55*ff})`; ctx.fillRect(x - 1.2, y - 1.2, 2.6, 2.6); }
      else nimi(s.nimi, x, y, fs * .5, (.5 + .3*Math.sin(t*2 + s.v)) * ff, s.i % 3 ? '215,225,255' : SYAANI);
    }
    if (!sieluValmis && t > sieluLoppuu) {
      // vain sielun oma alue (ei koko ruutua) -> pieni kuva, kevyt piirtää joka ruudussa
      const mx = H * .08, x0 = Math.min(...sielu.map(s => s.tx)) - mx, x1 = Math.max(...sielu.map(s => s.tx)) + mx;
      const y0 = Math.min(...sielu.map(s => s.ty)) - mx/2, y1 = Math.max(...sielu.map(s => s.ty)) + mx/2;
      const c = document.createElement('canvas'); c.width = Math.ceil((x1 - x0) * DPR); c.height = Math.ceil((y1 - y0) * DPR);
      const g = c.getContext('2d'); g.setTransform(DPR,0,0,DPR,-x0*DPR,-y0*DPR); g.textAlign = 'center'; g.textBaseline = 'middle';
      c.alue = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      g.font = `600 ${fs*.5}px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`;
      for (const s of sielu) {
        if (s.piste) { g.fillStyle = `rgba(${VIOLETTI},.55)`; g.fillRect(s.tx - 1.2, s.ty - 1.2, 2.6, 2.6); }
        else { g.fillStyle = `rgba(${s.i % 3 ? '215,225,255' : SYAANI},${.55 + .3*Math.sin(s.v)})`; g.fillText(s.nimi, s.tx, s.ty); }
      }
      sieluValmis = c;
    }
    // 4) top-10 välähtää kultaisena tapahtumamäärineen
    if (t > 11) {
      const JAKSO = 2.4, k = Math.floor((t - 11) / JAKSO) % HAUSKAT.length, e = ((t - 11) % JAKSO) / JAKSO;
      const s = sielu.find(q => q.orig === HAUSKAT[k]);
      if (s) korttiNimi(s, Math.min(1, e*5, (1 - e)*5));
    }
  }
}

// selkeä nimikortti sielun kohdan yläpuolella: tumma pohja, kultainen reuna, iso nimi + määrä
function korttiNimi(s, a){
  const fs = Math.max(13, H * .028), nimiT = lyhenna(s.orig, 26), maaraT = s.e + ' tapahtumaa';
  hehku(s.tx, s.ty, H*.05, '255,200,90', .7*a);
  ctx.fillStyle = `rgba(255,220,130,${a})`; ctx.beginPath(); ctx.arc(s.tx, s.ty, Math.max(3, H*.005), 0, 7); ctx.fill();
  ctx.font = `700 ${fs}px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`;
  const w = Math.max(ctx.measureText(nimiT).width, fs*4) + fs*1.4, h = fs*2.5;
  const x = Math.min(W - w/2 - 10, Math.max(w/2 + 10, s.tx));
  // kortti EI saa mennä tekstin taakse (Jarno 2.10.2026): jos yläpuolella osuisi otsikkoon, kortti pisteen alle
  let y = s.ty - H*.07 - h/2;
  const te = document.getElementById('teksti'), r = te && te.getBoundingClientRect();
  if (r && r.height > 0 && x + w/2 > r.left - 8 && x - w/2 < r.right + 8 && y - h/2 < r.bottom + 8) y = s.ty + H*.07 + h/2;
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = 'rgba(255,215,120,.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(s.tx, s.ty); ctx.lineTo(x, y + h/2); ctx.stroke();
  ctx.fillStyle = 'rgba(12,8,28,.88)'; ctx.beginPath(); ctx.roundRect(x - w/2, y - h/2, w, h, fs*.5); ctx.fill();
  ctx.strokeStyle = 'rgba(255,215,120,.95)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#ffd98a'; ctx.fillText(nimiT, x, y - fs*.35);
  ctx.font = `600 ${fs*.62}px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`; ctx.fillStyle = 'rgba(255,240,210,.9)';
  ctx.fillText(maaraT, x, y + fs*.62);
  ctx.restore();
}

// otsikon sanat syttyvät tarinan tahdissa
function paivitaSanat(t){
  for (const [sel, hetki] of SANAT) { const e = document.querySelector('#teksti ' + sel); if (e) e.classList.toggle('on', t >= hetki); }
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku) / 1000;
  if (t >= 0) { piirra(t, dt); paivitaSanat(t); }
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaJalanjalki = function(p){
  if (!(p && p.jalanjalki)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); suunnittele();
  aktiivinen = true; cv.style.opacity = 1;
  alku = performance.now() + 500; edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
