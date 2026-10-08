// ============================================================================
// VASTUUN KETJU (8.10.2026, x:5040-5047, Jarno: "Elon Muskin robotti riisuu" ->
// "Botti ei riisu. Ihminen pyytää botilta. Koodari on tehnyt botin. Botin
// taustalla on päällikkö. Ja päällikön taustalla on lopulta Elon." Vaiheittain
// klikkauksilla, EI emojeita, EI koodilla piirrettyjä ihmisiä -> pikseliesineet
// kodinkonehyllyn tyyliin + esityksen omat kuvat (robottoy-pix, olig.png).
// Riisumista EI näytetä. 8.10 ilta: kupla "tee hänestä valekuva", kuva häiriintyy ja kasvot vaihtuvat -> VÄÄRENNÖS.
//
// Käyttö esitys-data.js:ssä: `vastuu: n` (0 = ei vielä ketjua, 1..6 = montako
// lenkkiä näkyy). Uusin lenkki ilmestyy animoiden, aiemmat ovat jo paikallaan.
//   1 kuva  2 pyytäjä  3 botti (kuva -> VÄÄRENNÖS)  4 koodari  5 päällikkö
//   6 omistaja (silinteri + rahasäkki, sitten Muskin patsas + nimi)
// ============================================================================
(function(){
'use strict';
const NIMET = ['Kuva', 'Pyytäjä', 'Botti', 'Koodari', 'Päällikkö', 'Omistaja'];
const robo = new Image(); robo.src = 'kuvat/robottoy-pix.png';
const patsas = new Image(); patsas.src = 'kuvat/olig.png';

const cv = document.createElement('canvas');
cv.id = 'vastuu';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1, P = 3, slotY = 0;
function koko(){
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
  P = Math.max(2, Math.round(H * .0062));
  slotY = H * .58;
}
addEventListener('resize', koko); koko();
const slotX = i => W * (.1 + i * .16);

// ---------- pikselispritet ----------
function sprite(w, h, maalaa){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); const r = (x,y,ww,hh,col) => { g.fillStyle = col; g.fillRect(x,y,ww,hh); };
  maalaa(r, g); return c;
}
// Kuva: karkea pikseli-ihminen vaatteissa. Väärennöksessä sama siluetti
// tasaisen vaaleanpunaisena (ei mitään yksityiskohtia) + leima päällä.
// (Jarno 8.10.2026: "todella karkea pikseli ihminen ... vaaleanpunainen,
// sen päällä voi olla väärennös")
function kuvaSprite(iho, paita, housut, kengat){
  return sprite(24, 30, r => {
    r(0,0,24,30,'#6b4a2b'); r(1,1,22,28,'#8a6239'); r(2,2,20,26,'#f1ead8');
    r(3,3,18,24,'#9cc3dd'); r(3,22,18,5,'#7aa36a');            // taivas + nurmi
    r(10,5,4,4,iho);                                           // pää
    r(8,9,8,7,paita); r(6,10,2,5,paita); r(16,10,2,5,paita);   // vartalo + kädet
    r(6,15,2,1,iho); r(16,15,2,1,iho);                         // kämmenet
    r(9,16,6,6,housut); r(9,22,2,3,housut); r(13,22,2,3,housut);
    r(9,25,2,1,kengat); r(13,25,2,1,kengat);
  });
}
const KUVA = kuvaSprite('#e8b48a', '#3d7bd9', '#2f3b5c', '#161922');
// 8.10.2026 (Jarno, 6.-luokkalaiset): ei enää pinkkiä siluettia. Kuva häiriintyy, kasvot vaihtuvat
// toisen ihmisen kasvoiksi ja kuva nykii -> lopuksi sekoitus kahdesta ihmisestä + VÄÄRENNÖS.
const KUVA_TOINEN = kuvaSprite('#8d5a3b', '#c43c3c', '#3a2f22', '#d9a62e');
const PUHELIN = sprite(16, 28, r => {
  r(0,0,16,28,'#161922'); r(1,1,14,26,'#2a2e3a'); r(2,3,12,21,'#0f1218'); r(6,25,4,1,'#566074');
  r(3,5,9,3,'#3d7bd9'); r(5,10,8,3,'#4a4f5c'); r(3,15,10,3,'#3d7bd9');
});
const LAPPARI = sprite(34, 22, r => {
  r(3,0,28,17,'#c3cad6'); r(4,1,26,15,'#0d1117');
  r(0,17,34,4,'#8a94a6'); r(0,21,34,1,'#566074'); r(14,18,6,1,'#566074');
});
const KUPPI = sprite(8, 9, r => { r(0,1,6,8,'#f4f6fa'); r(1,2,4,6,'#e9ecf2'); r(6,3,2,1,'#f4f6fa'); r(7,3,1,3,'#f4f6fa'); r(6,5,2,1,'#f4f6fa'); r(1,1,4,1,'#6b3f22'); });
const TUOLI = sprite(26, 34, r => {
  r(3,0,20,22,'#3b2216'); r(4,1,18,20,'#5a321f');
  for (let y=3;y<20;y+=5) for (let x=6;x<21;x+=5) r(x,y,1,1,'#2a170e');   // nahan napitus
  r(0,10,4,10,'#3b2216'); r(22,10,4,10,'#3b2216');                     // käsinojat
  r(2,22,22,4,'#2a170e'); r(12,26,2,5,'#566074');
  r(5,31,16,1,'#566074'); r(5,32,2,2,'#161922'); r(19,32,2,2,'#161922'); r(12,32,2,2,'#161922');
});
const HATTU = sprite(22, 18, r => {
  r(4,0,14,13,'#161922'); r(5,1,12,11,'#22252f'); r(4,10,14,2,'#7a1e2a');  // nauha
  r(0,13,22,3,'#161922'); r(1,13,20,1,'#2a2e3a');
});
const SAKKI = sprite(20, 20, r => {
  r(7,0,6,3,'#a07a3c'); r(6,3,8,2,'#7a5a2a');
  r(3,5,14,14,'#c49a4c'); r(2,8,16,10,'#c49a4c'); r(4,6,12,12,'#d4aa5a');
  r(9,8,2,9,'#2f5c3b'); r(7,9,6,2,'#2f5c3b'); r(7,12,6,2,'#2f5c3b'); r(7,15,6,2,'#2f5c3b');   // $
});

let aktiivinen = false, rafId = 0, nyt = 0, vaihe = 0, edVaihe = 0, vaiheAlku = 0, koodi = [];

function piirraSprite(c, cx, pohjaY, skaala){
  const s = (skaala || 1) * P, w = c.width*s, h = c.height*s;
  ctx.drawImage(c, cx - w/2, pohjaY - h, w, h);
  return { x: cx - w/2, y: pohjaY - h, w, h };
}
function nakyvyys(i){            // lenkki i (1..6)
  if (i > vaihe) return 0;
  if (i < vaihe || edVaihe >= i) return 1;
  return Math.min(1, (nyt - vaiheAlku) / .5);
}
function teksti(t, x, y, koko, vari, paino){
  ctx.font = `${paino||600} ${Math.round(koko)}px Georgia,Garamond,"Times New Roman",serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = koko*.22; ctx.strokeStyle = 'rgba(10,12,18,.85)'; ctx.strokeText(t, x, y);
  ctx.fillStyle = vari; ctx.fillText(t, x, y);
}

function piirra(){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H); ctx.imageSmoothingEnabled = false;
  const pohja = slotY + H*.06;
  for (let i = 1; i <= 6; i++) {
    const a = nakyvyys(i); if (a <= 0) continue;
    const x = slotX(i-1), nousu = (1 - a) * H*.04;
    ctx.globalAlpha = a;
    // nuoli edellisestä tähän
    if (i > 1) {
      const x0 = slotX(i-2) + W*.055, x1 = x - W*.055, y = slotY - H*.05;
      ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = Math.max(3, P*.8);
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0)*a, y); ctx.stroke();
      if (a >= 1) { ctx.fillStyle = '#f2c94c'; ctx.beginPath(); ctx.moveTo(x1 + P*2, y); ctx.lineTo(x1 - P*2, y - P*2); ctx.lineTo(x1 - P*2, y + P*2); ctx.fill(); }
    }
    if (i === 1) {
      const b = piirraSprite(KUVA, x, pohja - nousu, 1.15);
      if (vaihe >= 3) {   // väärennös: kuva häiriintyy, kasvot vaihtuvat, kuva nykii + leima
        const valmis = vaihe > 3 || edVaihe >= 3, k = valmis ? 9 : nyt - vaiheAlku;
        const hairio = valmis ? 0 : Math.max(0, Math.min(1, (k - .2) / .3)) * (1 - Math.max(0, Math.min(1, (k - 1.6) / .4)));
        const e = Math.min(1, valmis ? 1 : (k - 1.6) / .5);
        if (k > .2) {          // viipaleet: osa alkuperäistä, osa toista ihmistä, nykien sivuttain
          const n = 8, vh = b.h / n, sh = KUVA.height / n, sw = KUVA.width;
          for (let j = 0; j < n; j++) {
            const toinen = valmis || k > 1.6 ? (j < 3) : Math.random() < .5;   // lopuksi ylhäällä (kasvot) toisen ihmisen
            const siirto = hairio > 0 && Math.random() < .5 ? (Math.random() - .5) * b.w * .35 * hairio : (valmis || k > 1.6) && j % 3 === 1 ? b.w*.06 : 0;
            ctx.drawImage(toinen ? KUVA_TOINEN : KUVA, 0, j*sh, sw, sh, b.x + siirto, b.y + j*vh, b.w, vh + .5);
          }
          if (hairio > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .35*hairio;
            ctx.drawImage(KUVA, b.x - P*1.5, b.y, b.w, b.h); ctx.restore(); }
        }
        if (e > 0) {
          ctx.save(); ctx.globalAlpha = a * e;
          ctx.translate(b.x + b.w/2, b.y + b.h*.52); ctx.rotate(-.35);
          ctx.strokeStyle = '#e0283c'; ctx.lineWidth = P*.9; const lw = b.w*1.15, lh = b.h*.24;
          ctx.fillStyle = 'rgba(241,234,216,.9)'; ctx.fillRect(-lw/2, -lh/2, lw, lh);
          ctx.strokeRect(-lw/2, -lh/2, lw, lh);
          ctx.fillStyle = '#e0283c'; ctx.font = `800 ${Math.round(lh*.6)}px Georgia,Garamond,"Times New Roman",serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('VÄÄRENNÖS', 0, 1);
          ctx.restore(); ctx.globalAlpha = a;
        }
      }
    } else if (i === 2) {
      const b = piirraSprite(PUHELIN, x, pohja - nousu, 1.3);
      // chat-kupla
      const kx = b.x + b.w*.5, ky = b.y - H*.05, koko = H*.028;
      ctx.font = `700 ${Math.round(koko)}px Georgia,Garamond,"Times New Roman",serif`;
      const tw = ctx.measureText('"tee hänestä valekuva"').width + koko;
      ctx.fillStyle = '#f4f6fa'; ctx.fillRect(kx - tw/2, ky - koko*.9, tw, koko*1.8);
      ctx.beginPath(); ctx.moveTo(kx - koko*.3, ky + koko*.9); ctx.lineTo(kx + koko*.3, ky + koko*.9); ctx.lineTo(kx, ky + koko*1.5); ctx.fill();
      ctx.fillStyle = '#161922'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('"tee hänestä valekuva"', kx, ky);
    } else if (i === 3) {
      if (robo.complete && robo.naturalWidth) {
        const s = P*.55, w = robo.naturalWidth*s, h = robo.naturalHeight*s;   // 8.10: pienennetty muiden esineiden kokoon (kuva 64 px korkea)
        ctx.drawImage(robo, x - w/2, pohja - nousu - h, w, h);
        if (Math.sin(nyt*6) > .2) { ctx.fillStyle = 'rgba(120,220,255,.85)'; ctx.fillRect(x - w*.18, pohja - nousu - h*.78, P, P); ctx.fillRect(x + w*.1, pohja - nousu - h*.78, P, P); }
      }
    } else if (i === 4) {
      const b = piirraSprite(LAPPARI, x - P*3, pohja - nousu, 1.15);
      piirraSprite(KUPPI, x + b.w/2 + P*2, pohja - nousu, 1.15);
      // rullaava koodi
      const rivit = 7, rh = (b.h*.68) / rivit;
      for (let k = 0; k < rivit; k++) {
        const rivi = koodi[(Math.floor(nyt*3) + k) % koodi.length];
        let xx = b.x + b.w*.16;
        rivi.forEach(([w, vari]) => { ctx.fillStyle = vari; ctx.fillRect(xx, b.y + P*1.8 + k*rh, w*P*.9, rh*.55); xx += (w+1)*P*.9; });
      }
    } else if (i === 5) {
      piirraSprite(TUOLI, x, pohja - nousu, 1.15);
    } else if (i === 6) {
      // patsas tulee esiin silinterin ja säkin taakse
      const pe = Math.max(0, Math.min(1, (vaihe > 6 || edVaihe >= 6 ? 1 : (nyt - vaiheAlku - .9) / 1.2)));
      if (pe > 0 && patsas.complete && patsas.naturalWidth) {
        ctx.save(); ctx.globalAlpha = a * pe; ctx.imageSmoothingEnabled = true;
        const h = H*.52, w = h * patsas.naturalWidth / patsas.naturalHeight;
        ctx.drawImage(patsas, x - w*.55, pohja - h*1.02, w, h);
        ctx.restore(); ctx.globalAlpha = a; ctx.imageSmoothingEnabled = false;
      }
      piirraSprite(HATTU, x - P*10, pohja - nousu, 1.2);
      piirraSprite(SAKKI, x + P*10, pohja - nousu, 1.2);
      if (pe > .6) teksti('Elon Musk', x, pohja + H*.11, H*.04, '#f2c94c', 800);
    }
    // nimilappu
    teksti(NIMET[i-1], x, pohja + H*.045, H*.03, '#f4f6fa', 700);
    ctx.globalAlpha = 1;
  }
}

function silmukka(ms){
  if (!aktiivinen) return;
  nyt = ms/1000; piirra();
  rafId = requestAnimationFrame(silmukka);
}

function teeKoodi(){
  const varit = ['#7ee787','#79c0ff','#d2a8ff','#ffa657','#8b949e'];
  koodi = [];
  for (let k = 0; k < 24; k++) {
    const rivi = []; let n = 1 + Math.floor(Math.random()*4), sisennys = Math.floor(Math.random()*3);
    if (sisennys) rivi.push([sisennys*2, 'rgba(0,0,0,0)']);
    for (let j = 0; j < n; j++) rivi.push([2 + Math.floor(Math.random()*5), varit[Math.floor(Math.random()*varit.length)]]);
    koodi.push(rivi);
  }
}
teeKoodi();

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaVastuu = function(p){
  const onko = !!(p && p.vastuu != null);
  if (!onko) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0; edVaihe = 0; vaihe = 0;
    return;
  }
  const uusi = Number(p.vastuu) || 0;
  edVaihe = aktiivinen ? vaihe : 0;
  if (!aktiivinen && uusi > 0) edVaihe = uusi - 1;   // hypättiin suoraan keskelle: aiemmat valmiina
  vaihe = uusi; vaiheAlku = performance.now()/1000;
  if (!aktiivinen) { koko(); aktiivinen = true; cv.style.opacity = 1; cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka); }
};
})();
