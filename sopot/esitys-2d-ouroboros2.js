// ============================================================================
// OUROBOROS, KOODIVERSIO (2.10.2026, x:6248). Jarnon esimerkkikuvan tyyliin:
// low-poly käärme kolmiopiikeistä, fasetoitu pää, leuat aukeavat ja
// napsahtavat kiinni häntään. Koko käärme kiertää hitaasti.
// Käyttö esitys-data.js:ssä: `ouroboros2: true`.
//
// Viesti värissä: niskasta kasvava UUSI osa on kylmän sinistä (tekoälyn
// tekemää), vanha runko vihreä/kultainen (ihmisen). Laskuri 2025 · 50 % ->
// 2026 · 90 % ja sininen leviää rungossa samassa tahdissa.
// Kaikki tekstikerroksen alla (z 4); rengas otsikon alapuolella.
// ============================================================================
(function(){
'use strict';
const N = 72, KAARI = 336;                 // piikkien määrä, rungon kaari asteina niskasta hännänpäähän
const KIERTO = 7;                          // astetta / s, koko käärme kiertää myötäpäivään
const FONTTI = 'Georgia,Garamond,"Times New Roman",serif';   // sama kuin esityksen otsikoissa

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

let aktiivinen = false, rafId = 0, alku = 0, edellinen = 0;

const rgb = (c, k) => `rgb(${Math.round(c[0]*k)},${Math.round(c[1]*k)},${Math.round(c[2]*k)})`;
const sekoita = (a, b, f) => [a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f, a[2]+(b[2]-a[2])*f];
// Väritys kohtauksen hämärään (Jarno 2.10.2026: "more fitting to scene colors"): ihmisen osa
// kultaa -> kuparia, tekoälyn osa petrooli -> syaani; varjofasetit tumman violetinruskeat.
const KULTA = [242, 201, 76], KUPARI = [214, 112, 58], PETROOLI = [38, 150, 170], SYAANI = [130, 228, 240], YO = [42, 30, 48];
const VIHREA = PETROOLI, KELTA = SYAANI;   // pää käyttää näitä (niska on tekoälyn tekemää)

function kolmio(a, b, c, vari, reuna){ ctx.fillStyle = vari; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill();
  if (reuna) { ctx.strokeStyle = reuna; ctx.lineWidth = 1; ctx.stroke(); } }
const REUNA = 'rgba(25,15,30,.55)';   // ohut tumma ääriviiva erottaa käärmeen sumuisesta taustasta

function piirra(t){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const cx = W/2, cy = H*.6, R = H*.235, a = Math.min(1, t / .8);
  const e = Math.min(1, Math.max(0, (t - 1) / 13)), osuus = .5 + .4 * e*e*(3 - 2*e);   // 0.5 -> 0.9
  const paaKulma = -48 + t * KIERTO;                       // niska (pää) - kiertää myötäpäivään
  const rad = d => d * Math.PI/180;
  const piste = (deg, r) => [cx + Math.cos(rad(deg))*r, cy + Math.sin(rad(deg))*r];
  ctx.save(); ctx.globalAlpha = a;

  // runko: piikit hännänpäästä niskaan (niska päällimmäisenä); s = 0 niska, 1 hännänpää
  for (let i = N - 1; i >= 0; i--) {
    const s = i / N, deg = paaKulma - s * KAARI, ohut = 1 - .72 * s;
    const leveys = R * .11 * ohut, korkeus = R * .2 * ohut;
    const d2 = deg - (KAARI / N) * 1.25;                     // piikin kärki taaksepäin (sahalaita)
    const sisa = piste(deg, R - leveys), ulko = piste(deg, R + leveys * .4);
    const karki = piste(d2, R + korkeus), sisaKarki = piste(d2, R - leveys - korkeus * .55);
    const tyvi = piste(d2 + (KAARI/N)*.2, R);
    // väri: niskasta kasvava uusi osa (s < osuus) on tekoälyn sinistä, vanha vihreä/kultainen
    // pehmeä liukuma ihmisestä tekoälyyn (ei kovaa rajaa) + värin hidas vaellus rungon mukana kuten esimerkissä
    const m = Math.min(1, Math.max(0, (osuus + .12 - s) / .24)), mm = m*m*(3 - 2*m);
    const vaellus = .5 + .5 * Math.sin(s * 9 - t * 1.3);
    const ihminen = sekoita(KULTA, KUPARI, vaellus), kone = sekoita(PETROOLI, SYAANI, vaellus);
    const valo = .78 + .22 * Math.cos(rad(deg) * 3 - t * 2.2);   // 3D-vaikutelma: valo kiertää fasettien yli
    const perus = sekoita(ihminen, kone, mm);
    kolmio(ulko, karki, tyvi, rgb(sekoita(perus, [255,245,220], .18 * valo), valo * 1.05), REUNA);   // ulkopiikki, valoisa fasetti
    kolmio(sisa, ulko, tyvi, rgb(perus, valo * .72), REUNA);                                         // tyven fasetti
    kolmio(sisa, sisaKarki, tyvi, rgb(sekoita(perus, YO, .6), valo * .95), REUNA);                   // sisäpiikki, varjopuoli
  }

  // pää: niskan kohdalla, katsoo myötäpäivään kohti hännänpäätä (joka on ~24° edellä)
  const [hx, hy] = piste(paaKulma, R), suunta = rad(paaKulma + 90);            // tangentti myötäpäivään
  const S = R * .6;                                                           // pään koko
  // leuat: aukeavat hitaasti, napsahtavat kiinni ~2.2 s välein
  const jakso = 2.2, f = (t % jakso) / jakso, auki = f < .82 ? f / .82 : 1 - (f - .82) / .18;
  const leuka = .12 + .42 * auki;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(suunta);
  // (paikallinen x = eteenpäin kohti häntää, y = ulospäin renkaasta on -y)
  const PAA_V = VIHREA, PAA_T = [24, 92, 108];
  const kaanna = (pts, kulma) => pts.map(([x, y]) => [x*Math.cos(kulma) - y*Math.sin(kulma), x*Math.sin(kulma) + y*Math.cos(kulma)]);
  // (punainen suun sisus poistettu - Jarno 2.10.2026: "mouth red is not needed")
  // alaleuka + hampaat
  const ala = kaanna([[-S*.1, S*.05], [S*1.0, S*.05], [S*.85, S*.28], [-S*.05, S*.32]], leuka * .8);
  kolmio(ala[0], ala[1], ala[2], rgb(PAA_T, 1)); kolmio(ala[0], ala[2], ala[3], rgb(PAA_T, .8));
  for (let k = 0; k < 4; k++) { const hp = kaanna([[S*(.25 + k*.2), S*.06], [S*(.33 + k*.2), S*.06], [S*(.29 + k*.2), -S*.08]], leuka * .8); kolmio(...hp, 'rgb(255,226,120)'); }
  // yläleuka/kallo (fasetit) + hampaat
  const yla = kaanna([[-S*.25, -S*.05], [S*1.1, -S*.03], [S*.75, -S*.32], [S*.2, -S*.5], [-S*.35, -S*.38]], -leuka);
  for (let k = 0; k < 4; k++) { const hp = kaanna([[S*(.3 + k*.2), -S*.04], [S*(.38 + k*.2), -S*.04], [S*(.34 + k*.2), S*.1]], -leuka); kolmio(...hp, 'rgb(255,236,140)'); }
  kolmio(yla[0], yla[1], yla[2], rgb(KELTA, .95));
  kolmio(yla[0], yla[2], yla[3], rgb(PAA_V, 1.05));
  kolmio(yla[0], yla[3], yla[4], rgb(PAA_V, .8));
  const sarvi = kaanna([[S*.15, -S*.45], [-S*.45, -S*.75], [-S*.05, -S*.38]], -leuka); kolmio(...sarvi, rgb(KELTA, .85));
  const silma = kaanna([[S*.42, -S*.28], [S*.6, -S*.3], [S*.5, -S*.2]], -leuka); kolmio(...silma, 'rgb(255,240,90)');
  ctx.restore();

  // laskuri renkaan sisällä
  const p = Math.round(osuus * 100), vuosi = p >= 90 ? '2026' : '2025';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `600 ${R*.17}px ${FONTTI}`; ctx.fillStyle = 'rgba(240,236,225,.9)'; ctx.fillText(vuosi, cx, cy - R*.26);
  ctx.font = `800 ${R*.42}px ${FONTTI}`; ctx.fillStyle = p >= 90 ? '#FF5562' : (p > 70 ? '#ffb347' : '#B0CB40');
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 14; ctx.fillText(p + ' %', cx, cy + R*.1); ctx.shadowBlur = 0;
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
  koko(); aktiivinen = true; cv.style.opacity = 1;
  alku = performance.now() + 200; edellinen = performance.now();
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
