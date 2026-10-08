// ============================================================================
// REITTI-KOHTAUS (2.10.2026, x:3840 "Tekoäly on ajattelun Google Maps").
// Käyttö esitys-data.js:ssä: pysähdykseen kenttä `reitti: true`.
//
// Kaksi reittiä järven yli:
//  1. Kylmä sininen navigaattorireitti piirtyy varmana ja suorana - ja päättyy
//     täsmälleen uponneeseen autoon. Kohdeneula putoaa auton päälle, vesi
//     väreilee, "Reitti lasketaan uudelleen…" pyörii.
//  2. Lämmin, huojuva käsin piirretty pisteviiva lähtee ketusta ja harhailee:
//     kiepsahtaa, poikkeaa sivuun - ja matkan varrelta löytyy asioita (kala
//     hyppää, tähti, lamppu syttyy). Se perillä linnalla.
// Muistiinpanojen ajatus: "Eksymme välillä, opimme. Virheet ja oivallukset
// syntyvät usein omasta harhailusta." Sama lämmin ihminen / kylmä kone
// -kuvakieli kuin luovuus-kohtauksessa (esitys-2d-luovuus.js).
//
// Kerros: piirretään Phaserin canvas-tekstuuriin, jonka syvyys on juuri
// auton (kuvat/gpscar2.png) ALAPUOLELLA -> auto ja sen päällä seisovat ihmiset
// peittävät reitin. Varalla (jos sceneä ei löydy) oma DOM-kanvaasi kuten ennen.
// Lopussa kaikki häivytetään pois (Jarno 2.10.2026).
//
// Paikat: auto ja linna on ankkuroitu ruudun keskeltä KORKEUDEN mukaan (sama
// kuin moottorissa: kuvan koko ~ min(W,H), taustan skaala ~ H), joten ne osuvat
// kohdalleen eri ruutusuhteilla. Kaikki piirretään tekstikerroksen alle ja
// otsikon alareunan alapuolelle.
// ============================================================================
(function(){
'use strict';
const ALKUVIIVE = 800, HAIVYTYS_ALKAA = 11.3, HAIVYTYS = 1.5;   // s
const AUTON_KUVA = 'gpscar2';
const SININEN = '#4285f4', SININEN_TUMMA = '#1a5fd1', LAMMIN = '#ffb347';

const cv = document.createElement('canvas');
cv.id = 'reitti';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const domCtx = cv.getContext('2d');   // "lasketaan uudelleen" -siru aina kaiken päällä (ei jää tolppien taakse)
let ctx = domCtx, DDPR = 1;
let phaser = null;   // { sc, tex, img } kun piirretään maailman sisään
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));

let W = 0, H = 0, DPR = 1;
function koko(){
  W = innerWidth; H = innerHeight;
  DDPR = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(innerWidth*DDPR); cv.height = Math.round(innerHeight*DDPR);
  const sc = window.__paaKohtaus;
  if (sc && sc.textures) {
    // Phaser-tila: tekstuuri pelin omalla resoluutiolla, kerros auton alle
    DPR = 1; W = sc.scale.width; H = sc.scale.height;
    if (phaser) { phaser.img.destroy(); sc.textures.remove('reitti-tx'); }
    const tex = sc.textures.createCanvas('reitti-tx', W, H);
    const img = sc.add.image(0, 0, 'reitti-tx').setOrigin(0, 0).setScrollFactor(0).setAlpha(0);
    const auto = (sc.kuvahahmot || []).find(kh => kh.h.kuva && kh.h.kuva.includes(AUTON_KUVA));
    img.setDepth(auto ? auto.img.depth - 0.01 : 4);
    phaser = { sc, tex, img }; ctx = tex.getContext();
  } else { DPR = DDPR; ctx = domCtx; }
}
function nayta(a){ if (phaser) phaser.img.setAlpha(a); cv.style.opacity = a; }
addEventListener('resize', () => { if (aktiivinen) { koko(); suunnittele(); } });

// ---------- polku-apu ----------
function catmull(pts, n=14){
  const out = [];
  for (let i=0;i<pts.length-1;i++) {
    const p0 = pts[Math.max(0,i-1)], p1 = pts[i], p2 = pts[i+1], p3 = pts[Math.min(pts.length-1,i+2)];
    for (let j=0;j<n;j++) { const t=j/n, t2=t*t, t3=t2*t;
      out.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
                .5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]); }
  }
  out.push(pts[pts.length-1]); return out;
}
function mittaa(p){ const L=[0]; for(let i=1;i<p.length;i++) L.push(L[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1])); return L; }
function pisteOsuudella(p, L, f){
  const d = L[L.length-1]*f; let i = 1; while (i < L.length-1 && L[i] < d) i++;
  const k = (d - L[i-1]) / Math.max(1e-6, L[i]-L[i-1]);
  return [p[i-1][0]+(p[i][0]-p[i-1][0])*k, p[i-1][1]+(p[i][1]-p[i-1][1])*k];
}
function vedaOsa(p, L, f){
  const d = L[L.length-1]*f; ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
  for (let i=1;i<p.length;i++){ if (L[i] > d) { const q = pisteOsuudella(p, L, f); ctx.lineTo(q[0], q[1]); break; } ctx.lineTo(p[i][0], p[i][1]); }
  ctx.stroke();
}
function hehku(x, y, r, rgb, a){
  if (a <= .003) return;
  const g = ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(${rgb},${a})`); g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x-r,y-r,2*r,2*r); ctx.restore();
}

// ---------- suunnitelma ----------
let aktiivinen = false, rafId = 0, alku = 0, ajastin = 0, edellinen = 0;
let S = null, kipinat = [];
function suunnittele(){
  const t = document.getElementById('teksti');
  const ala = t && t.getBoundingClientRect().height > 0 ? t.getBoundingClientRect().bottom : H*.32;
  const ylin = Math.max(H*.5, ala + H*.06);
  const auto = [W/2 + H*.20, H*.745];
  const linna = [Math.min(W*.93, W/2 + H*.47), Math.max(ylin + H*.06, H*.60)];
  const kettu = [W/2, H*.86];
  // sininen: varma ja suora, yksi kulma, päättyy autoon
  const alkuSin = [Math.max(W*.06, auto[0] - H*.95), H*.70];
  const sininen = [alkuSin, [auto[0] - H*.12, H*.70], [auto[0], auto[1] - H*.015]];
  // lämmin: ketusta harhaillen linnalle, yksi kiepsahdus matkalla
  const lp = [kettu, [W/2 - H*.18, H*.82], [W/2 - H*.26, H*.72], [W/2 - H*.12, Math.max(ylin, H*.64)]];
  const silmukka = []; const sc = [W/2 - H*.02, Math.max(ylin + H*.05, H*.66)], sr = H*.05;
  for (let i=0;i<=10;i++){ const a = Math.PI*1.1 + i/10*Math.PI*2; silmukka.push([sc[0]+Math.cos(a)*sr*1.3, sc[1]+Math.sin(a)*sr]); }
  const loppu = [[W/2 + H*.10, H*.79], [W/2 + H*.28, H*.83], [linna[0] - H*.10, H*.72], linna];
  const lampin = catmull([...lp, ...silmukka, ...loppu], 10);
  S = { auto, linna, kettu, ylin,
        sininen: catmull(sininen, 3), lampin };
  S.sinL = mittaa(S.sininen); S.lamL = mittaa(S.lampin);
  S.loydot = [ { f:.17, tyyppi:'kala' }, { f:.52, tyyppi:'tahti' }, { f:.80, tyyppi:'lamppu' } ];
  S.loydot.forEach(l => l.p = pisteOsuudella(S.lampin, S.lamL, l.f));
}

// ---------- piirto-osat ----------
function neula(x, y, sk){
  ctx.save(); ctx.translate(x, y); ctx.scale(sk, sk);
  const r = H*.022;
  ctx.fillStyle = '#ea4335'; ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-r*.3, -r*.9, -r, -r*1.3, -r, -r*2); ctx.arc(0, -r*2, r, Math.PI, 0); ctx.bezierCurveTo(r, -r*1.3, r*.3, -r*.9, 0, 0); ctx.fill();
  ctx.fillStyle = '#7a1c14'; ctx.beginPath(); ctx.arc(0, -r*2, r*.38, 0, 7); ctx.fill();
  ctx.restore();
}
function sijaintipiste(x, y, t){
  const r = H*.012;
  ctx.fillStyle = `rgba(66,133,244,${.25 * (1 - (t*1.2 % 1))})`; ctx.beginPath(); ctx.arc(x, y, r*(1 + 2.2*(t*1.2 % 1)), 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r*1.25, 0, 7); ctx.fill();
  ctx.fillStyle = SININEN; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}
function laskeeUudelleen(x, y, t, a){
  if (a <= 0) return;
  const c0 = ctx; ctx = domCtx;
  try { siru(x, y, t, a); } finally { ctx = c0; }
}
function siru(x, y, t, a){
  const fs = Math.max(13, H*.022), teksti = 'Reitti lasketaan uudelleen…';
  ctx.save(); ctx.globalAlpha = a; ctx.font = `600 ${fs}px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`;
  const tw = ctx.measureText(teksti).width, pw = tw + fs*2.6, ph = fs*2;
  const lx = Math.min(W - pw - 10, Math.max(10, x - pw/2)), ly = y - ph;
  ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.roundRect(lx, ly, pw, ph, ph/2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = SININEN; ctx.lineWidth = fs*.18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(lx + fs*1.05, ly + ph/2, fs*.42, t*6, t*6 + Math.PI*1.4); ctx.stroke();
  ctx.fillStyle = '#3c4043'; ctx.textBaseline = 'middle'; ctx.fillText(teksti, lx + fs*1.85, ly + ph/2 + 1);
  ctx.restore();
}
function vari(x, y, e, maks){             // vesirenkaat
  ctx.save(); ctx.strokeStyle = 'rgba(200,225,255,1)'; ctx.lineWidth = Math.max(1.5, H*.0025);
  for (let i=0;i<3;i++){ const k = (e - i*.25); if (k < 0 || k > 1.4) continue;
    ctx.globalAlpha = .6*(1 - k/1.4); ctx.beginPath(); ctx.ellipse(x, y, maks*k, maks*k*.28, 0, 0, 7); ctx.stroke(); }
  ctx.restore();
}
function loyto(l, e, t){
  const [x, y] = l.p, s = H*.03;
  if (l.tyyppi === 'kala') {
    if (e < 1.1) { const k = e/1.1, fx = x - s*1.2 + s*2.4*k, fy = y - Math.sin(Math.PI*k)*s*2.2, kulma = Math.cos(Math.PI*k)*-.9;
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(kulma); ctx.fillStyle = '#ff9a4a';
      ctx.beginPath(); ctx.ellipse(0, 0, s*.55, s*.24, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-s*.45, 0); ctx.lineTo(-s*.85, -s*.25); ctx.lineTo(-s*.85, s*.25); ctx.fill(); ctx.restore(); }
    vari(x - s*1.2, y, e*1.4, s*1.2); vari(x + s*1.2, y, Math.max(0, e - .9)*1.4, s*1.2);
  } else if (l.tyyppi === 'tahti') {
    const a = Math.min(1, e*2), r = s*(.55 + .12*Math.sin(t*4));
    hehku(x, y - s*.6, s*1.6, '255,230,150', .5*a);
    ctx.save(); ctx.translate(x, y - s*.6); ctx.fillStyle = `rgba(255,240,190,${a})`; ctx.beginPath();
    for (let i=0;i<8;i++){ const rr = i%2 ? r*.3 : r, an = i*Math.PI/4 - Math.PI/2; ctx.lineTo(Math.cos(an)*rr, Math.sin(an)*rr); }
    ctx.fill(); ctx.restore();
  } else {
    const a = Math.min(1, e*2), pal = e > .25 ? 1 : (Math.sin(e*120) > 0 ? 1 : .2);
    hehku(x, y - s*.8, s*2, '255,210,120', .55*a*pal);
    ctx.save(); ctx.translate(x, y - s*.8); ctx.globalAlpha = a;
    ctx.fillStyle = pal > .5 ? '#ffe98a' : '#8a8f9e'; ctx.beginPath(); ctx.arc(0, 0, s*.38, 0, 7); ctx.fill();
    ctx.fillStyle = '#b8bfcc'; ctx.fillRect(-s*.18, s*.3, s*.36, s*.24); ctx.restore();
  }
}

function piirra(t, dt){
  if (ctx !== domCtx) { domCtx.setTransform(DDPR,0,0,DDPR,0,0); domCtx.clearRect(0,0,W,H); }
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
  const { auto } = S;
  // 1) sininen reitti
  const sinF = Math.min(1, t / 1.4), sinHaalenee = t > 4 ? Math.max(.35, 1 - (t-4)*.4) : 1;
  if (t > 0) {
    ctx.save(); ctx.globalAlpha = sinHaalenee; ctx.lineCap = ctx.lineJoin = 'round';
    ctx.strokeStyle = '#fff'; ctx.lineWidth = H*.016; vedaOsa(S.sininen, S.sinL, sinF);
    ctx.strokeStyle = SININEN_TUMMA; ctx.lineWidth = H*.012; vedaOsa(S.sininen, S.sinL, sinF);
    ctx.strokeStyle = SININEN; ctx.lineWidth = H*.008; vedaOsa(S.sininen, S.sinL, sinF);
    ctx.restore();
    sijaintipiste(S.sininen[0][0], S.sininen[0][1], t);
  }
  // 2) neula putoaa autoon, vesi väreilee, lasketaan uudelleen
  const ne = t - 1.4;
  if (ne > 0) {
    const pud = Math.min(1, ne / .35), y = auto[1] - H*.03 - (1 - pud*pud) * H*.25;
    const pomppu = ne > .35 ? 1 + Math.sin((ne-.35)*18) * Math.exp(-(ne-.35)*6) * .15 : 1;
    vari(auto[0], auto[1] + H*.01, Math.max(0, ne - .35), H*.09);
    neula(auto[0], y, pomppu);
    const chip = ne - .8, a = chip < 0 ? 0 : Math.min(1, chip*3) * (t > 8.8 ? Math.max(0, 1 - (t-8.8)*1.5) : 1);
    laskeeUudelleen(auto[0], auto[1] - H*.11, t, a);
  }
  // 3) lämmin harhaileva pisteviiva ketusta linnalle + löydöt
  const le = t - 3.6, KESTO = 5.2;
  if (le > 0) {
    const f = Math.min(1, le / KESTO), fs = f*f*(3-2*f)*.15 + f*.85;   // pieni pehmennys alkuun ja loppuun
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = LAMMIN; ctx.lineWidth = Math.max(3, H*.007);
    ctx.setLineDash([H*.004, H*.02]); ctx.shadowColor = LAMMIN; ctx.shadowBlur = 10;
    vedaOsa(S.lampin, S.lamL, fs); ctx.restore();
    if (f < 1) { const k = pisteOsuudella(S.lampin, S.lamL, fs); hehku(k[0], k[1], H*.03, '255,200,120', .9);
      ctx.fillStyle = '#fff3d6'; ctx.beginPath(); ctx.arc(k[0], k[1], Math.max(2, H*.005), 0, 7); ctx.fill(); }
    for (const l of S.loydot) if (fs >= l.f) { if (l.hetki == null) l.hetki = t; loyto(l, t - l.hetki, t); }
    // perillä: lämmin purske linnalla
    if (f >= 1) {
      if (S.perilla == null) { S.perilla = t;
        for (let i=0;i<26;i++){ const a = Math.random()*Math.PI*2, v = H*(.05 + Math.random()*.12);
          kipinat.push({ x:S.linna[0], y:S.linna[1], vx:Math.cos(a)*v, vy:Math.sin(a)*v - H*.05, ika:0, kesto:.8 + Math.random()*.6 }); } }
      hehku(S.linna[0], S.linna[1], H*.09, '255,190,110', .45 + .1*Math.sin(t*3));
    }
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const k of kipinat){ k.ika += dt; k.vy += H*.15*dt; k.x += k.vx*dt; k.y += k.vy*dt;
    ctx.fillStyle = `rgba(255,190,110,${1 - k.ika/k.kesto})`; ctx.fillRect(k.x-2, k.y-2, 4, 4); }
  ctx.restore();
  kipinat = kipinat.filter(k => k.ika < k.kesto);
}

function silmukka(ms){
  if (!aktiivinen) return;
  const dt = Math.min(.05, (ms - edellinen)/1000 || 0); edellinen = ms;
  const t = (ms - alku) / 1000;
  const loppu = Math.max(0, Math.min(1, (t - HAIVYTYS_ALKAA) / HAIVYTYS));
  if (loppu >= 1) { nayta(0); return; }                      // häivytetty pois -> piirto loppuu
  if (t >= 0 && S) piirra(t, dt); else { ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,W*DPR,H*DPR); }
  nayta(1 - loppu);
  if (phaser) phaser.tex.refresh();
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä (naytaTeksti():n JÄLKEEN).
window.naytaReitti = function(p){
  if (!(p && p.reitti)) {
    if (!aktiivinen) return;
    aktiivinen = false; cancelAnimationFrame(rafId); clearTimeout(ajastin); nayta(0);
    return;
  }
  koko(); kipinat = [];
  aktiivinen = true; nayta(1);
  alku = performance.now() + ALKUVIIVE; edellinen = performance.now();
  suunnittele(); clearTimeout(ajastin); ajastin = setTimeout(suunnittele, 400);   // teksti rakentuu viiveellä
  cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
};
})();
