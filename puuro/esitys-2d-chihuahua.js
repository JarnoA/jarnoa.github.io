// ============================================================================
// CHIHUAHUA VAI MUSTIKKAMUFFINSSI? (2.10.2026, x:10591). Jarnon kuva
// kuvat/muffins.png (3x3 ruudukko, läpinäkyvä tausta) elävöitetty:
//  1. ruudut kääntyvät esiin satunnaisessa järjestyksessä
//  2. sekoittuvat kahdesti kuin kuppipelissä (yleisökin hukkaa kirjanpidon)
//  3. sininen tekoälykehys hyppii ruudusta toiseen ja leimaa tunnisteen
//     varmuusprosentilla - osa itsevarmasti väärin (punaisella)
//  4. jää epäröimään yhteen ruutuun vilkkuvalla "?"
// Käyttö esitys-data.js:ssä: `chihuahua: true` (korvaa esitys-2d-hahmot.js:n
// kiintean muffins.png-kuvan tällä pysähdyksellä). Piirto tekstin alle (z 4).
// ============================================================================
(function(){
'use strict';
const KUVA = new Image(); KUVA.src = 'kuvat/muffins.png';
// ruudukon sisältö kuvassa rivi kerrallaan: K = koira, M = muffinssi
const SISALTO = ['M','M','K', 'K','M','K', 'M','K','K'];
// tekoälyn "tulkinnat" leimausjärjestyksessä: [ruutu, oikein?, prosentti]
const LEIMAT = [[0,1,91],[2,1,88],[4,0,54],[3,1,79],[7,0,61],[1,1,83],[5,1,72],[6,0,57]];
const EPAROI = 8;                                    // viimeinen ruutu: "?"
const T_KAANTO = .5, T_SEKOITUS = 2.6, T_SKANNI = 5.2, SKANNI_VALI = .55;

const cv = document.createElement('canvas');
cv.id = 'chihuahua';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .4s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

let ac = null, aaniPaalla = true;
function A(){ if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)(); return ac; }
function savel(f, kesto, voim, tyyppi='triangle'){
  if (!aaniPaalla) return; const a = A(), t = a.currentTime, o = a.createOscillator(), g = a.createGain();
  o.type = tyyppi; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(voim, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + kesto);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + kesto + .02);
}

let aktiivinen = false, rafId = 0, alku = 0, tila = null;
const pehmea = e => e <= 0 ? 0 : e >= 1 ? 1 : e*e*(3 - 2*e);

function alusta(){
  // paikka[i] = ruudukon solu, jossa kuvaruutu i on; sekoitukset vaihtavat pareja
  const jarj = [...Array(9).keys()].sort(() => Math.random() - .5);
  tila = { kaanto: jarj, paikka: [...Array(9).keys()], vaihdot: [], seuraava: 0, leimat: [], aanet: new Set() };
  const vaihdot = [[0,8],[2,6],[1,7],[3,5],[4,0],[6,2]];
  tila.vaihdot = [vaihdot.slice(0,3), vaihdot.slice(3)];
}

function solu(i, koko, x0, y0){ return { x: x0 + (i % 3) * koko, y: y0 + Math.floor(i / 3) * koko }; }

function silmukka(ms){
  if (!aktiivinen) return;
  const t = (ms - alku) / 1000;
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  if (!KUVA.complete || !KUVA.naturalWidth) { rafId = requestAnimationFrame(silmukka); return; }
  const G = H * .56, S = G / 3, x0 = W/2 - G/2 + W*.08, y0 = H/2 - G/2 + H*.04, L = KUVA.naturalWidth / 3;

  // sekoitukset: kaksi kierrosta, kumpikin 3 paria vaihtaa paikkaa kaarella
  const kierrokset = [T_SEKOITUS, T_SEKOITUS + 1.1];
  const paikat = tila.paikka.map(p => solu(p, S, x0, y0));
  kierrokset.forEach((tk, r) => {
    const e = (t - tk) / .8;
    if (e >= 1 && !tila.aanet.has('sek' + r)) {           // kiinnitä vaihto
      tila.aanet.add('sek' + r);
      for (const [a, b] of tila.vaihdot[r]) { const ia = tila.paikka.indexOf(a), ib = tila.paikka.indexOf(b); tila.paikka[ia] = b; tila.paikka[ib] = a; }
    } else if (e > 0 && e < 1) {
      if (!tila.aanet.has('sekA' + r)) { tila.aanet.add('sekA' + r); savel(330, .25, .04); }
      const ee = pehmea(e);
      for (const [a, b] of tila.vaihdot[r]) {
        const ia = tila.paikka.indexOf(a), ib = tila.paikka.indexOf(b), pa = solu(a, S, x0, y0), pb = solu(b, S, x0, y0), kaari = Math.sin(e*Math.PI) * S * .35;
        paikat[ia] = { x: pa.x + (pb.x - pa.x)*ee, y: pa.y + (pb.y - pa.y)*ee - kaari };
        paikat[ib] = { x: pb.x + (pa.x - pb.x)*ee, y: pb.y + (pa.y - pb.y)*ee + kaari };
      }
    }
  });

  // ruudut: kääntyvät esiin satunnaisjärjestyksessä
  ctx.imageSmoothingEnabled = true;
  for (let i=0;i<9;i++) {
    const n = tila.kaanto.indexOf(i), e = pehmea((t - T_KAANTO - n*.17) / .35);
    if (e <= 0) continue;
    if (e > .5 && !tila.aanet.has('k' + i)) { tila.aanet.add('k' + i); savel(500 + n*40, .08, .03); }
    const p = paikat[i], sx = Math.abs(Math.cos((1 - e) * Math.PI / 2));
    ctx.save(); ctx.translate(p.x + S/2, p.y + S/2); ctx.scale(sx, 1);
    ctx.drawImage(KUVA, (i % 3)*L, Math.floor(i / 3)*L, L, L, -S/2, -S/2, S, S);
    ctx.restore();
  }

  // tekoälyskanneri: kehys hyppii ruutuihin ja leimaa
  const ts = t - T_SKANNI;
  if (ts >= 0) {
    const n = Math.min(LEIMAT.length, Math.floor(ts / SKANNI_VALI));
    while (tila.leimat.length < n) {
      const [ruutu, oikein, pros] = LEIMAT[tila.leimat.length];
      const nimi = (SISALTO[ruutu] === 'K') === !!oikein ? 'KOIRA' : 'MUFFINSSI';
      tila.leimat.push({ ruutu, teksti: `${nimi} ${pros} %`, oikein: !!oikein });
      savel(oikein ? 1100 : 300, .09, .05, 'square');
    }
    const nyt = n < LEIMAT.length ? LEIMAT[n][0] : EPAROI;
    const sijainti = r => paikat[r];
    // leimat
    ctx.font = `bold ${Math.round(H*.022)}px "Courier New", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const l of tila.leimat) {
      const p = sijainti(l.ruutu), tw = ctx.measureText(l.teksti).width;
      ctx.fillStyle = l.oikein ? 'rgba(20,40,70,.85)' : 'rgba(110,14,14,.9)';
      ctx.fillRect(p.x + S/2 - tw/2 - 6, p.y + S - H*.04, tw + 12, H*.032);
      ctx.fillStyle = l.oikein ? '#9fd8ff' : '#ff6a5a'; ctx.fillText(l.teksti, p.x + S/2, p.y + S - H*.024);
    }
    // kehys
    const p = sijainti(nyt), vari = '#4bb3ff', blink = n >= LEIMAT.length;
    ctx.strokeStyle = vari; ctx.lineWidth = Math.max(2, H*.004);
    const l = S*.2, m = S*.05;
    for (const [cx, cy, dx, dy] of [[p.x+m,p.y+m,1,1],[p.x+S-m,p.y+m,-1,1],[p.x+m,p.y+S-m,1,-1],[p.x+S-m,p.y+S-m,-1,-1]]) {
      ctx.beginPath(); ctx.moveTo(cx + dx*l, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy*l); ctx.stroke();
    }
    // pyyhkäisyviiva
    const sy = p.y + m + ((ts % SKANNI_VALI) / SKANNI_VALI) * (S - 2*m);
    ctx.fillStyle = 'rgba(75,179,255,.35)'; ctx.fillRect(p.x + m, sy, S - 2*m, Math.max(2, H*.003));
    if (blink && Math.sin(t*6) > 0) {
      ctx.font = `bold ${Math.round(S*.5)}px Georgia, serif`; ctx.fillStyle = '#4bb3ff';
      ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 12; ctx.fillText('?', p.x + S/2, p.y + S/2); ctx.shadowBlur = 0;
    }
  }
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaChihuahua = function(p){
  const paalle = !!(p && p.chihuahua);
  if (!paalle) { if (!aktiivinen) return; aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0; return; }
  aaniPaalla = false;   // Jarno 2.10.2026: ei ääniä tähän kohtaukseen
  koko(); alusta();
  aktiivinen = true; alku = performance.now(); cv.style.opacity = 1;
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
