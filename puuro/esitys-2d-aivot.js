// ============================================================================
// AIVOT, MIT-TUTKIMUS (6.10.2026, x:9840 "Aivojen loppu vai uusi alku?").
// Korvaa brains3.webm-videon, joka loppui 7,7 sekunnissa. Jarno: "tee aivot
// ihan uudelleen... koodilla", "ilman klikkauksia, ruudulla tapahtuu koko ajan".
//
// Käyttö esitys-data.js:ssä: `aivot: true` pysähdykseen. Seuraava pysähdys
// `aivot: 'kari'` (sama otsikko, x+1) = brain fry: ChatGPT-aivot vilkastuvat,
// viivat muuttuvat punaisiksi ja välkkyvät, aivoista nousee savua. Jarno
// 6.10.2026: "itse huomaan kun aktiivisesti käytän tekoälyä... aivot käristyy".
//
// Kosmyna ym., MIT Media Lab 2025, "Your Brain on ChatGPT" (arXiv 2506.08872,
// ei vertaisarvioitu, 54 osallistujaa, EEG): pelkät aivot = vahvimmat ja
// laajimmat yhteydet, hakukone = keskitaso, ChatGPT = heikoimmat. ChatGPT-
// ryhmän oli vaikea lainata omaa esseetään -> kirjaimia haihtuu ChatGPT-
// aivoista. Ei lukuja ruudulla.
//
// Kolme koodilla piirrettyä aivoa sivuprofiilissa (otsalohko vasemmalla).
// Jokaisessa solmuja, joiden välille syttyy valoviivoja, joita pitkin kulkee
// pulsseja. Viivat syntyvät, elävät ja sammuvat jatkuvasti, joten ruudulla
// tapahtuu koko ajan. Viivojen määrä ja kirkkaus = ryhmän yhteydet.
// Kanvaasi tekstin alla (z 4). Ei ääniä.
// ============================================================================
(function(){
'use strict';
const RYHMAT = [
  { nimi: 'Ilman apuvälineitä', voima: 1.0,  viivoja: 34 },
  { nimi: 'Hakukone',           voima: 0.5,  viivoja: 14 },
  { nimi: 'Tekoäly',            voima: 0.14, viivoja: 3 },
];
// aivojen ääriviiva normalisoituna (leveys 1, korkeus 0.82), otsa vasemmalla
const ISO = [[0.02,0.42],[0.06,0.24],[0.16,0.10],[0.30,0.02],[0.48,0.00],[0.66,0.03],[0.80,0.11],[0.92,0.24],[0.99,0.40],[0.98,0.55],[0.92,0.64],[0.80,0.63],[0.66,0.65],[0.56,0.71],[0.46,0.81],[0.32,0.83],[0.22,0.77],[0.19,0.67],[0.14,0.63],[0.07,0.60],[0.03,0.52]];
const PIKKU = { x: 0.78, y: 0.74, rx: 0.15, ry: 0.12 };          // pikkuaivot
const RUNKO = [[0.56,0.66],[0.66,0.68],[0.64,0.86],[0.63,0.94],[0.55,0.94],[0.55,0.84],[0.52,0.72]];
const UURTEET = [[[0.21,0.64],[0.32,0.55],[0.45,0.50],[0.60,0.46]], [[0.50,0.01],[0.47,0.18],[0.43,0.33],[0.40,0.50]]];  // Sylvian uurre, keskiuurre
const KIRJAIMET = 'ajattelinettämuistankirjoitinesseenitsekuka'.split('');

const cv = document.createElement('canvas'); cv.id = 'aivot';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease;';
const ctx = cv.getContext('2d');
document.addEventListener('DOMContentLoaded', () => document.body.append(cv));

let W = 0, H = 0, DPR = 1;
let kohdeKari = 0, kaynnissa = false, raf = 0, t0 = 0, edT = 0, t = 0, aivot = null;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); aivot = null; }
addEventListener('resize', koko); koko();

const rnd = (a, b) => a + Math.random()*(b - a);
const sstep = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u*u*(3 - 2*u); };


function sileaPolku(p, pisteet, sx, sy, ox, oy){
  const n = pisteet.length, P = i => pisteet[(i + n) % n];
  const m = i => [ox + (P(i)[0] + P(i+1)[0]) / 2 * sx, oy + (P(i)[1] + P(i+1)[1]) / 2 * sy];
  p.moveTo(...m(n - 1));
  for (let i = 0; i < n; i++) { const a = m(i); p.quadraticCurveTo(ox + P(i)[0]*sx, oy + P(i)[1]*sy, a[0], a[1]); }
  p.closePath();
}

function rakennaAivo(ix){
  const r = RYHMAT[ix];
  const w = Math.min(W * 0.24, H * 0.5), h = w * 0.82;
  const cx = W * (0.2 + ix * 0.3), cy = H * 0.56;
  const ox = cx - w/2, oy = cy - h/2;
  const iso = new Path2D(); sileaPolku(iso, ISO, w, h, ox, oy);
  const pikku = new Path2D(); pikku.ellipse(ox + PIKKU.x*w, oy + PIKKU.y*h, PIKKU.rx*w, PIKKU.ry*h, -0.15, 0, Math.PI*2);
  const runko = new Path2D(); sileaPolku(runko, RUNKO, w, h, ox, oy);
  // poimut: mutkittelevia viivoja isoaivojen sisällä (samat joka ryhmällä)
  const poimut = [];
  let siemen = 7; const srnd = () => (siemen = (siemen * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 40; k++) {
    let x = ox + (0.06 + srnd()*0.9)*w, y = oy + (0.05 + srnd()*0.7)*h, kulma = srnd()*Math.PI*2, kaanto = (srnd() - 0.5)*0.4;
    const pist = [[x, y]];
    for (let s = 0; s < 14; s++) { kaanto = Math.max(-0.45, Math.min(0.45, kaanto + (srnd() - 0.5)*0.6)); kulma += kaanto; x += Math.cos(kulma)*w*0.022; y += Math.sin(kulma)*w*0.022; if (!ctx.isPointInPath(iso, x*DPR, y*DPR)) break; pist.push([x, y]); }
    if (pist.length > 4) poimut.push(pist);
  }
  for (const u of UURTEET) poimut.push(u.map(([a, b]) => [ox + a*w, oy + b*h]));
  // solmut isoaivojen sisälle
  const solmut = [];
  while (solmut.length < 26) {
    const x = ox + rnd(0.06, 0.96)*w, y = oy + rnd(0.06, 0.7)*h;
    if (ctx.isPointInPath(iso, x*DPR, y*DPR)) solmut.push({ x, y, vaihe: rnd(0, 6.28) });
  }
  return { r, w, h, cx, cy, ox, oy, iso, pikku, runko, poimut, solmut, viivat: [], kirjaimet: [], seurKirjain: 1.5, k: 0, savu: [], seurSavu: 0 };
}

function uusiViiva(A){
  const s = A.solmut, a = Math.floor(Math.random()*s.length);
  // lähimpien joukosta, ettei viivat ylitä koko aivoja
  const lahi = s.map((n, i) => [i, Math.hypot(n.x - s[a].x, n.y - s[a].y)]).filter(e => e[0] !== a).sort((p, q) => p[1] - q[1]).slice(2, 11);
  const b = lahi[Math.floor(Math.random()*lahi.length)][0];
  A.viivat.push({ a, b, ika: 0, kesto: A.k > 0.5 ? rnd(0.8, 2.2) : rnd(3, 7), kaari: rnd(-0.35, 0.35), pulssi: rnd(0, 1), nopeus: A.k > 0.5 ? rnd(1.2, 2.4) : rnd(0.35, 0.7) });
}

function piirraAivo(A, dt, nakyvyys){
  // brain fry (ChatGPT-aivot, toinen klikkaus): A.k 0→1, sininen → punainen
  if (A.r.voima < 0.2) A.k += (kohdeKari - A.k) * Math.min(1, dt / 1.2);
  const k = A.k, v = A.r.voima + (1 - A.r.voima) * k;
  const sininen = (a) => `rgba(${Math.round(110 + 145*k)},${Math.round(185 - 120*k)},${Math.round(255 - 210*k)},${a})`;
  const ydin = (a) => `rgba(255,${Math.round(238 - 60*k)},${Math.round(255 - 130*k)},${a})`;
  ctx.save(); ctx.globalAlpha = nakyvyys;
  if (k > 0.05) ctx.translate(rnd(-1, 1)*A.w*0.003*k, rnd(-1, 1)*A.w*0.003*k);
  // runko + pikkuaivot + isoaivot
  const g = ctx.createRadialGradient(A.cx - A.w*0.1, A.cy - A.h*0.15, A.w*0.05, A.cx, A.cy, A.w*0.6);
  const sv = A.r.voima;
  g.addColorStop(0, `rgba(${Math.round(28 + 40*sv + 110*k)},${Math.round(30 + 75*sv + 5*k)},${Math.round(38 + 130*sv)},.96)`); g.addColorStop(1, `rgba(${Math.round(16 + 8*sv + 40*k)},${18 + 20*sv},${24 + 45*sv},.96)`);
  ctx.fillStyle = 'rgba(16,20,32,.95)'; ctx.fill(A.runko); ctx.fill(A.pikku);
  ctx.strokeStyle = sininen(0.15 + 0.3*v); ctx.lineWidth = Math.max(1, A.w*0.006);
  ctx.stroke(A.runko); ctx.stroke(A.pikku);
  ctx.save(); ctx.clip(A.pikku);
  ctx.lineWidth = Math.max(1, A.w*0.005); for (let k = -4; k <= 4; k++) { ctx.beginPath(); ctx.ellipse(A.ox + PIKKU.x*A.w, A.oy + (PIKKU.y + k*0.025)*A.h, PIKKU.rx*A.w*1.05, PIKKU.ry*A.h*0.3, -0.15, 0.15, Math.PI - 0.15); ctx.stroke(); }
  ctx.restore();
  if (v > 0.3) { ctx.save(); if (k > 0.05) ctx.globalAlpha = nakyvyys * (0.75 + 0.25*Math.random()); ctx.shadowColor = sininen(0.55*v); ctx.shadowBlur = A.w*0.12*v*(0.8 + 0.2*Math.sin(t*1.1)); ctx.fillStyle = g; ctx.fill(A.iso); ctx.restore(); }
  ctx.fillStyle = g; ctx.fill(A.iso);
  // poimut hehkuvat hitaasti voiman mukaan
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  A.poimut.forEach((pist, i) => {
    const hengitys = 0.5 + 0.5*Math.sin(t*0.9 + i*1.7);
    ctx.strokeStyle = v < 0.2 && k < 0.05 ? `rgba(70,80,100,${0.35 + 0.1*hengitys})` : sininen(0.12 + 0.5*v*hengitys); ctx.lineWidth = Math.max(1.2, A.w*0.008);
    ctx.beginPath(); ctx.moveTo(...pist[0]); for (let k = 1; k < pist.length; k++) ctx.lineTo(...pist[k]); ctx.stroke();
  });
  ctx.strokeStyle = v < 0.2 && k < 0.05 ? 'rgba(80,90,110,.6)' : sininen(0.3 + 0.6*v); ctx.lineWidth = Math.max(1.5, A.w*0.01); ctx.stroke(A.iso);

  // yhteydet: syntyvät, elävät, sammuvat
  while (A.viivat.length < A.r.viivoja + Math.round(40*k)) uusiViiva(A);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = A.viivat.length - 1; i >= 0; i--) {
    const L = A.viivat[i]; L.ika += dt;
    if (L.ika > L.kesto) { A.viivat.splice(i, 1); continue; }
    const kasvu = sstep(0, 0.9, L.ika), sammu = 1 - sstep(L.kesto - 1, L.kesto, L.ika);
    const p = A.solmut[L.a], q = A.solmut[L.b];
    const mx = (p.x + q.x)/2 - (q.y - p.y)*L.kaari, my = (p.y + q.y)/2 + (q.x - p.x)*L.kaari;
    const piste = u => [(1-u)*(1-u)*p.x + 2*(1-u)*u*mx + u*u*q.x, (1-u)*(1-u)*p.y + 2*(1-u)*u*my + u*u*q.y];
    const a = (0.45 + 0.55*v) * sammu * (1 - k*0.45*Math.random());
    ctx.strokeStyle = sininen(a*0.45); ctx.lineWidth = A.w*0.022;
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
    for (let u = 0.1; u <= kasvu + 0.001; u += 0.1) ctx.lineTo(...piste(Math.min(u, kasvu)));
    ctx.stroke();
    ctx.strokeStyle = ydin(a); ctx.lineWidth = Math.max(1.5, A.w*0.007); ctx.stroke();
    if (kasvu >= 1) {
      L.pulssi = (L.pulssi + dt*L.nopeus) % 1;
      const [x, y] = piste(L.pulssi), rr = A.w*0.014;
      const pg = ctx.createRadialGradient(x, y, 0, x, y, rr*2.5);
      pg.addColorStop(0, ydin(0.9*sammu)); pg.addColorStop(1, sininen(0));
      ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(x, y, rr*2.5, 0, Math.PI*2); ctx.fill();
    }
  }
  // solmut tuikkivat
  for (const n of A.solmut) {
    const a = (0.12 + 0.5*v) * (0.6 + 0.4*Math.sin(t*1.4 + n.vaihe));
    ctx.fillStyle = ydin(a); ctx.beginPath(); ctx.arc(n.x, n.y, Math.max(1.2, A.w*0.007), 0, Math.PI*2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  // savu nousee käristyvistä aivoista
  if (k > 0.3 && t > A.seurSavu) {
    const n = A.solmut[Math.floor(Math.random()*A.solmut.length)];
    A.savu.push({ x: n.x, y: n.y, ika: 0, kesto: rnd(2.5, 4), vx: rnd(-0.06, 0.06)*A.w, r0: A.w*rnd(0.02, 0.04), vaihe: rnd(0, 6.28) });
    A.seurSavu = t + rnd(0.07, 0.18) / k;
  }
  for (let i = A.savu.length - 1; i >= 0; i--) {
    const q = A.savu[i]; q.ika += dt; const u = q.ika / q.kesto;
    if (u >= 1) { A.savu.splice(i, 1); continue; }
    const x = q.x + q.vx*u + Math.sin(t*1.5 + q.vaihe)*A.w*0.02*u, y = q.y - u*A.h*0.9, r = q.r0 + u*A.w*0.1;
    const a = 0.5 * Math.sin(Math.min(1, u*5)*Math.PI/2) * (1 - u);
    const sg = ctx.createRadialGradient(x, y, 0, x, y, r);
    sg.addColorStop(0, `rgba(62,58,56,${a})`); sg.addColorStop(1, 'rgba(62,58,56,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  }

  // ChatGPT: kirjaimia haihtuu aivoista ylös
  if (A.r.voima < 0.2) {
    if (t > A.seurKirjain) {
      const n = A.solmut[Math.floor(Math.random()*A.solmut.length)];
      A.kirjaimet.push({ x: n.x, y: n.y, c: KIRJAIMET[Math.floor(Math.random()*KIRJAIMET.length)], ika: 0, kesto: rnd(3, 4.5), vx: rnd(-0.03, 0.03)*A.w, kulma: rnd(-0.4, 0.4) });
      A.seurKirjain = t + rnd(0.35, 0.8);
    }
    ctx.font = `italic ${Math.round(A.w*0.07)}px Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = A.kirjaimet.length - 1; i >= 0; i--) {
      const k = A.kirjaimet[i]; k.ika += dt; const u = k.ika / k.kesto;
      if (u >= 1) { A.kirjaimet.splice(i, 1); continue; }
      ctx.save(); ctx.translate(k.x + k.vx*u, k.y - u*A.h*0.75); ctx.rotate(k.kulma*u);
      ctx.fillStyle = `rgba(235,228,210,${0.75*Math.sin(Math.min(1, u*4)*Math.PI/2)*(1 - u)})`;
      ctx.fillText(k.c, 0, 0); ctx.restore();
    }
  }
  // nimi alle (Jarno 6.10.2026: palautettu, ChatGPT → Tekoäly)
  ctx.font = `${Math.round(Math.max(16, A.w*0.085))}px Georgia, Garamond, "Times New Roman", serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillText(A.r.nimi, A.cx + 2, A.oy + A.h*1.04 + 2);
  ctx.fillStyle = '#f6efe4'; ctx.fillText(A.r.nimi, A.cx, A.oy + A.h*1.04);
  ctx.restore();
}

function kehys(nyt){
  raf = requestAnimationFrame(kehys);
  const dt = Math.min(0.05, (nyt - edT) / 1000); edT = nyt; t = (nyt - t0) / 1000;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  if (!aivot) aivot = RYHMAT.map((_, i) => rakennaAivo(i));
  aivot.forEach((A, i) => piirraAivo(A, dt, sstep(0.3 + i*0.5, 1.3 + i*0.5, t)));
}

function kaynnista(){
  kaynnissa = true; t0 = edT = performance.now(); aivot = null;
  cv.style.opacity = 1;
  cancelAnimationFrame(raf); raf = requestAnimationFrame(kehys);
}
function pysayta(){
  kaynnissa = false; cv.style.opacity = 0;
  setTimeout(() => { if (!kaynnissa) cancelAnimationFrame(raf); }, 650);
}

window.naytaAivot = function(p){
  if (p && p.aivot) { kohdeKari = p.aivot === 'kari' ? 1 : 0; if (!kaynnissa) kaynnista(); }
  else if (kaynnissa) pysayta();
};
})();
