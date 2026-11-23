// ============================================================================
// OUROBOROS, KOODIVERSIO (2.10.2026, x:6248). Käärme renkaana, puree häntäänsä,
// koko rengas kiertää hitaasti myötäpäivään.
// Käyttö esitys-data.js:ssä: `ouroboros2: true`.
//
// Viesti värissä: niskasta kasvava UUSI osa on kylmän sinistä (tekoälyn
// tekemää), vanha runko kultainen/kuparinen (ihmisen).
// 4.11.2026 (Jarno, Pew Research 8/2026): 90 % oli ennuste, nyt on mittaus.
// Laskuri kahdessa vaiheessa tekstirivien tahdissa: 0 -> 10 % "kaikista
// sivuista", sitten 10 -> yli 30 % "2022 lopun jälkeen".
//
// 4.11.2026 (Jarno: "pystyykö ouroboroksesta luomaan visuaalisesti hienomman?",
// vaihtoehto A = koodiversio hiotaan): low-poly-kolmiot korvattu pyöreällä,
// varjostetulla rungolla (poikittainen sylinterivalo), porrastetut suomut,
// selän salmiakkikuvio, vaalea vatsajuova, muotoiltu pää (kulmaharja, hehkuva
// pystypupilli, sieraimet, torahampaat), tekoälyosan hehku + datakipinät.
// Vanha low-poly-versio: materiaalia/esitys-2d-ouroboros2-lowpoly-2026-11-04.js
// Kaikki tekstikerroksen alla (z 4); rengas otsikon alapuolella.
// ============================================================================
(function(){
'use strict';
const N = 240, KAARI = 349;                // rungon näytteet, kaari asteina niskasta hännänpäähän (4.11.2026: 336 -> 349, häntä syvemmälle suuhun - Jarno "että oikeasti syö sitä")
const KIERTO = 7;                          // astetta / s, koko käärme kiertää myötäpäivään
const FONTTI = 'Georgia,Garamond,"Times New Roman",serif';   // sama kuin esityksen otsikoissa
const VAIHE2_ALKU = 4.6;                   // s; = esitys-data.js x:6248 toisen rivin viive 4500 ms + pieni marginaali

const cv = document.createElement('canvas');
cv.id = 'ouroboros2';
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

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0, kipinat = [];

const rgba = (c, k = 1, a = 1) => `rgba(${Math.round(Math.min(255, c[0]*k))},${Math.round(Math.min(255, c[1]*k))},${Math.round(Math.min(255, c[2]*k))},${a})`;
const sekoita = (a, b, f) => [a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f, a[2]+(b[2]-a[2])*f];
// Väritys kohtauksen hämärään (Jarno 2.10.2026: "more fitting to scene colors"): ihmisen osa
// kultaa -> kuparia, tekoälyn osa petrooli -> syaani; varjot tumman violetinruskeat.
const KULTA = [236, 190, 82], KUPARI = [196, 104, 52], PETROOLI = [32, 132, 156], SYAANI = [120, 226, 240], YO = [34, 22, 40];
const VATSA_I = [250, 228, 170], VATSA_K = [196, 246, 250];   // vatsajuova: ihminen / kone

// rungon väri kohdassa s (0 niska ... 1 hännänpää): pehmeä liukuma tekoälyn sinisestä ihmisen kultaan
function vari(s, t, osuus){
  const m = Math.min(1, Math.max(0, (osuus + .06 - s) / .12)), mm = m*m*(3 - 2*m);
  const vaellus = .5 + .5 * Math.sin(s * 9 - t * 1.3);
  return { perus: sekoita(sekoita(KULTA, KUPARI, vaellus), sekoita(PETROOLI, SYAANI, vaellus*.6), mm),
           vatsa: sekoita(VATSA_I, VATSA_K, mm), kone: mm };
}

function piirra(t){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const cx = W/2, cy = H*.6, R = H*.235, a = Math.min(1, t / .8);
  const liuku = (t0, t1) => { const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0))); return u*u*(3 - 2*u); };
  const vaihe2 = t >= VAIHE2_ALKU;                          // 2. tekstirivi tulee esiin (viive 4500 ms)
  const osuus = .10 * liuku(.8, 3.6) + (.30 - .10) * liuku(VAIHE2_ALKU + .3, VAIHE2_ALKU + 4);
  const paaKulma = -48 + t * KIERTO;                       // niska (pää) - kiertää myötäpäivään
  const rad = d => d * Math.PI/180;
  const piste = (deg, r) => [cx + Math.cos(rad(deg))*r, cy + Math.sin(rad(deg))*r];
  const paksuus = s => R * .125 * (1 - .78 * Math.pow(s, 1.25));   // suippenee häntää kohti
  ctx.save(); ctx.globalAlpha = a;

  // himmeä kehä renkaan takana
  const halo = ctx.createRadialGradient(cx, cy, R*.6, cx, cy, R*1.35);
  halo.addColorStop(0, 'rgba(0,0,0,0)'); halo.addColorStop(.55, 'rgba(255,200,120,.06)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo; ctx.fillRect(cx - R*1.4, cy - R*1.4, R*2.8, R*2.8);

  // 1) runko: kiekot hännänpäästä niskaan, jokaisella poikittainen sylinterivalo (sisäreuna = vatsa)
  for (let i = N; i >= 0; i--) {
    const s = i / N, deg = paaKulma - s * KAARI, w = paksuus(s);
    const [x, y] = piste(deg, R), [ix, iy] = piste(deg, R - w), [ox, oy] = piste(deg, R + w);
    const v = vari(s, t, osuus);
    const g = ctx.createLinearGradient(ix, iy, ox, oy);
    g.addColorStop(0,   rgba(sekoita(v.vatsa, YO, .45)));
    g.addColorStop(.16, rgba(v.vatsa, .95));
    g.addColorStop(.3,  rgba(v.perus, .8));
    g.addColorStop(.58, rgba(sekoita(v.perus, [255,248,225], .35), 1.05));   // valojuova
    g.addColorStop(.8,  rgba(v.perus, .72));
    g.addColorStop(1,   rgba(sekoita(v.perus, YO, .7)));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, w * 1.02, 0, Math.PI*2); ctx.fill();
  }

  // 2) suomut: porrastetut kaaret kolmessa rivissä rungon poikki
  ctx.lineCap = 'round';
  const SUOMUVALI = 3;
  for (let i = N - 2; i >= 2; i -= SUOMUVALI) {
    const s = i / N, w = paksuus(s);
    if (w < R*.025) continue;
    const v = vari(s, t, osuus), porras = (i / SUOMUVALI) % 2 ? .5 : 0;
    for (let r = 0; r < 3; r++) {
      const off = (-.42 + (r + porras*.6) * .38) * w;        // sisältä ulos
      const deg = paaKulma - s * KAARI + (r % 2 ? .6 : 0);
      const [x, y] = piste(deg, R + off);
      const kulma = rad(deg) + Math.PI/2;                     // radan suunta
      ctx.strokeStyle = rgba(sekoita(v.perus, YO, .55), 1, .5);
      ctx.lineWidth = Math.max(.6, w * .07);
      ctx.beginPath(); ctx.arc(x, y, w * .2, kulma - 1.1, kulma + 1.1); ctx.stroke();   // suomun takareuna
      ctx.strokeStyle = rgba(sekoita(v.perus, [255,250,230], .5), 1, .28);
      ctx.lineWidth = Math.max(.4, w * .04);
      ctx.beginPath(); ctx.arc(x, y, w * .14, kulma - .7, kulma + .7); ctx.stroke();    // kiilto
    }
  }

  // 3) selän salmiakkikuvio rungon valojuovan kohdalla
  for (let i = N - 6; i >= 8; i -= 9) {
    const s = i / N, w = paksuus(s), deg = paaKulma - s * KAARI, v = vari(s, t, osuus);
    const [x, y] = piste(deg, R + w*.18), k = rad(deg);
    const ux = Math.cos(k + Math.PI/2), uy = Math.sin(k + Math.PI/2), nx = Math.cos(k), ny = Math.sin(k);
    const L = w * .55, Wd = w * .28;
    ctx.fillStyle = rgba(sekoita(v.perus, YO, .62), 1, .75);
    ctx.beginPath();
    ctx.moveTo(x + ux*L, y + uy*L); ctx.lineTo(x + nx*Wd, y + ny*Wd);
    ctx.lineTo(x - ux*L, y - uy*L); ctx.lineTo(x - nx*Wd, y - ny*Wd); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba(sekoita(v.perus, [255,240,200], .5), 1, .55);
    ctx.beginPath(); ctx.arc(x, y, Wd*.32, 0, Math.PI*2); ctx.fill();
  }

  // 4) tekoälyosan hehku ja datakipinät
  const loppuDeg = paaKulma - osuus * KAARI;
  if (osuus > .01) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(120,226,240,.22)'; ctx.lineWidth = R * .05;
    ctx.shadowColor = 'rgba(120,226,240,.9)'; ctx.shadowBlur = R * .12;
    ctx.beginPath(); ctx.arc(cx, cy, R + R*.02, rad(loppuDeg), rad(paaKulma - 4)); ctx.stroke();
    ctx.restore();
    if (Math.random() < osuus * 1.4) {
      const s = Math.random() * osuus, deg = paaKulma - s * KAARI, w = paksuus(s);
      const [x, y] = piste(deg, R + (Math.random() - .3) * w);
      const k = rad(deg);
      kipinat.push({ x, y, vx: Math.cos(k) * (8 + Math.random()*18), vy: Math.sin(k) * (8 + Math.random()*18) - 6, ika: 0, kesto: .9 + Math.random()*.8, koko: R * (.008 + Math.random()*.012) });
    }
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const k of kipinat) {
    k.ika += 1/60; k.x += k.vx/60; k.y += k.vy/60;
    const e = k.ika / k.kesto;
    ctx.fillStyle = `rgba(150,236,248,${.85*(1 - e)})`;
    ctx.fillRect(k.x - k.koko/2, k.y - k.koko/2, k.koko, k.koko);
  }
  ctx.restore();
  kipinat = kipinat.filter(k => k.ika < k.kesto);

  // 5) pää niskan kohdalla, katsoo myötäpäivään kohti hännänpäätä
  piirraPaa(t, piste(paaKulma, R), rad(paaKulma + 90), paksuus(0), vari(0, t, osuus));

  // laskuri renkaan sisällä
  const p = Math.round(osuus * 100), valmis = p >= 30;
  const ylaTeksti = vaihe2 ? '2022 lopun jälkeen' : 'kaikista sivuista';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `600 ${R*.13}px ${FONTTI}`; ctx.fillStyle = 'rgba(240,236,225,.9)'; ctx.fillText(ylaTeksti, cx, cy - R*.28);
  ctx.font = `800 ${R*(valmis ? .36 : .42)}px ${FONTTI}`; ctx.fillStyle = vaihe2 ? (valmis ? '#FF5562' : '#ffb347') : '#B0CB40';
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 14; ctx.fillText((valmis ? 'yli ' : '') + p + ' %', cx, cy + R*.1); ctx.shadowBlur = 0;
  ctx.restore();
}

// pää paikallisissa koordinaateissa: x eteenpäin (kohti häntää), y < 0 = renkaan ulkopuoli
function piirraPaa(t, [hx, hy], suunta, w, v){
  const S = w * 3.4;                                       // pään pituus
  const jakso = 2.6, f = (t % jakso) / jakso, auki = f < .8 ? f / .8 : 1 - (f - .8) / .2;
  const leuka = .04 + .11 * auki;                          // suu raottuu ja puree häntää (pienempi avautuma: leuat puristavat hännän)
  const tumma = sekoita(v.perus, YO, .65), vaalea = sekoita(v.perus, [255,248,225], .4);
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(suunta);

  // alaleuka (vatsan puoli = renkaan sisäpuoli, +y)
  ctx.save(); ctx.rotate(leuka);
  let g = ctx.createLinearGradient(0, 0, 0, w*1.1);
  g.addColorStop(0, rgba(v.vatsa, .9)); g.addColorStop(1, rgba(sekoita(v.vatsa, YO, .5)));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-S*.15, w*.05);
  ctx.quadraticCurveTo(S*.4, w*1.15, S*.92, w*.25); ctx.lineTo(S*.9, w*.05); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,250,235,.95)';                // alaleuan torahammas
  ctx.beginPath(); ctx.moveTo(S*.72, w*.12); ctx.lineTo(S*.78, w*.12); ctx.lineTo(S*.75, -w*.12); ctx.closePath(); ctx.fill();
  ctx.restore();

  // yläleuka ja kallo
  ctx.save(); ctx.rotate(-leuka);
  g = ctx.createLinearGradient(0, -w*1.25, 0, w*.2);
  g.addColorStop(0, rgba(tumma)); g.addColorStop(.45, rgba(vaalea, 1.05)); g.addColorStop(1, rgba(v.perus, .8));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-S*.2, w*.15);
  ctx.bezierCurveTo(-S*.25, -w*1.0, S*.25, -w*1.3, S*.6, -w*.85);      // kallon kaari
  ctx.quadraticCurveTo(S*1.02, -w*.55, S*1.05, -w*.05);                // kuono
  ctx.lineTo(S*.25, w*.15); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = rgba(YO, 1, .55); ctx.lineWidth = Math.max(1, w*.05); ctx.stroke();
  // kallon suomulaatat
  ctx.strokeStyle = rgba(tumma, 1, .5); ctx.lineWidth = Math.max(.6, w*.04);
  for (const [px, py, r] of [[S*.15, -w*.55, w*.32], [S*.42, -w*.62, w*.28], [S*.66, -w*.5, w*.22]]) {
    ctx.beginPath(); ctx.arc(px, py, r, Math.PI*.9, Math.PI*2.1); ctx.stroke();
  }
  // yläleuan torahammas
  ctx.fillStyle = 'rgba(255,250,235,.95)';
  ctx.beginPath(); ctx.moveTo(S*.8, -w*.02); ctx.lineTo(S*.87, -w*.02); ctx.lineTo(S*.84, w*.3); ctx.closePath(); ctx.fill();
  // sierain
  ctx.fillStyle = rgba(YO, 1, .9);
  ctx.beginPath(); ctx.ellipse(S*.92, -w*.42, w*.06, w*.035, -.4, 0, Math.PI*2); ctx.fill();
  // kulmaharja + silmä (hehkuva, pystypupilli, räpäys)
  const ex = S*.55, ey = -w*.5, er = w*.2;
  ctx.fillStyle = rgba(tumma, 1, .95);
  ctx.beginPath(); ctx.ellipse(ex - er*.2, ey - er*.9, er*1.6, er*.55, -.15, Math.PI, Math.PI*2); ctx.fill();
  const rapsy = (t % 5.3) < .14 ? .15 : 1;
  const silmaV = v.kone > .5 ? [150, 240, 255] : [255, 214, 90];
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const hg = ctx.createRadialGradient(ex, ey, 0, ex, ey, er*2.6);
  hg.addColorStop(0, rgba(silmaV, 1, .45)); hg.addColorStop(1, rgba(silmaV, 1, 0));
  ctx.fillStyle = hg; ctx.fillRect(ex - er*3, ey - er*3, er*6, er*6);
  ctx.restore();
  ctx.fillStyle = rgba(silmaV);
  ctx.beginPath(); ctx.ellipse(ex, ey, er, er*rapsy, 0, 0, Math.PI*2); ctx.fill();
  if (rapsy > .5) {
    ctx.fillStyle = 'rgba(12,8,14,.95)';
    ctx.beginPath(); ctx.ellipse(ex + er*.05, ey, er*.22, er*.85, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.arc(ex - er*.35, ey - er*.35, er*.18, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}

function silmukka(ms){
  if (!aktiivinen) return;
  edellinen = ms;
  const t = (ms - alku) / 1000;
  if (t >= 0) piirra(t);
  rafId = requestAnimationFrame(silmukka);
}

window.naytaOuroboros2 = function(p){
  if (!(p && p.ouroboros2)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
    return;
  }
  koko(); aktiivinen = true; cv.style.opacity = 1; kipinat = [];
  alku = performance.now() + 200; edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
