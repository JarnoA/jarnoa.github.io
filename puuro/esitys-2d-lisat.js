// ============================================================================
// LISÄANIMAATIOT (TF 15.10.2026, Jarno: "Do all ★★★ and also 4805 Germany,
// court, 4830 Colombia"). Pienet koodilla piirretyt pikselikohtaukset, yksi
// kenttä: `lisaAnim: '…'` esitys-data.js:ssä.
//   kysymys   1600 tytön yllä puhekupla "?"
//   jaakaappi 4300 jääkaappi, punainen CFC-kaasu vaihtuu vihreään, valo palaa koko ajan
//   kartta    4600 kartta, datakeskusnastat ilmestyvät, suurennuslasi kiertää
//   kyltit    4775 mielenosoituskyltit (ei ihmisiä) nousevat iskulauseella
//   nuija     4805 tuomarin nuija lyö, paperi "LAW CHANGED"
//   kirje     4820 kirje taittuu kirjekuoreksi ja lentää kaupungintalolle
//   polaroid  4830 kolme polaroidia: lätäkkö, roskakasa, tekoälyn "puhdas katu"
//   parvi     4950 tulikärpäset kerääntyvät lämpimäksi hehkuksi ketun ja tytön ympärille
//   kiitos    5200 tytön yllä chattikupla "Thank you!"
//   ovi       4900 (16.10) yksi kupla kimpoaa ovesta, monta yhdessä avaa sen
//   setripalvelin 1450 (16.10) setritukit -> datapikselit -> palvelinkaappi
//   sade      4550 (18.10) sade vain oikealla laidalla: "as rain, somewhere else"
//   (kysymys 1600 poistettu käytöstä 16.10, Jarno: "looks bad, maybe not needed")
// Ei ihmishahmoja koodilla (Jarno: näyttävät koomisilta).
// ============================================================================
(function(){
'use strict';
const KELTA = '#f2c94c', PUNA = '#e0453a', VIHREA = '#6fcf6a';
const cv = document.createElement('canvas');
cv.id = 'lisat';
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;opacity:0;transition:opacity .5s ease;';
const ctx = cv.getContext('2d');
function liita(){ document.body.appendChild(cv); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liita); else liita();

let W = 0, H = 0, DPR = 1;
function koko(){ DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); }
addEventListener('resize', koko); koko();

let tyyppi = null, aktiivinen = false, rafId = 0, alkuT = 0, edT = 0, S = {};
const ease = k => k < 0 ? 0 : k > 1 ? 1 : 1 - Math.pow(1 - k, 3);
const pomppu = k => { if (k <= 0) return 0; if (k >= 1) return 1; return 1 + Math.sin(k*Math.PI*2.5) * Math.exp(-k*4) * 0.35 * (k < 0.3 ? k/0.3 : 1) - (1 - ease(k)); };
function teksti(t, x, y, px, vari, kirj){ ctx.font = `${kirj || 800} ${Math.round(px)}px Georgia,serif`; ctx.fillStyle = vari; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); }
function pyorea(x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// pelin oliot ruutukoordinaateiksi (pelikanvaasi = ikkunan kokoinen)
function hahmoRuudulla(etsi){
  const sc = window.__paaKohtaus; if (!sc) return null;
  const o = etsi(sc); if (!o || !o.visible) return null;
  const cam = sc.cameras.main, kx = W / sc.scale.width, ky = H / sc.scale.height;
  const b = o.getBounds();
  return { x: (b.centerX - cam.scrollX*(o.scrollFactorX ?? 1)) * kx, y: (b.top - cam.scrollY*(o.scrollFactorY ?? 1)) * ky, ala: (b.bottom - cam.scrollY) * ky, h: b.height * ky };
}
const tytto = () => hahmoRuudulla(sc => sc.children.list.find(o => o.texture && String(o.texture.key).startsWith('tytto-') && o.visible));
const kettu = () => hahmoRuudulla(sc => sc.hahmo);

// --- puhekupla tytön yllä -------------------------------------------------
function kupla(k, sisalto, chat){
  const t = tytto() || { x: W*0.35, y: H*0.6, h: H*0.25 };
  const s = pomppu(k / 0.35), px = H*0.045;
  ctx.font = `800 ${Math.round(px)}px Georgia,serif`;
  const w = Math.max(px*1.6, ctx.measureText(sisalto).width + px*1.2), h = px*1.7;
  // 16.10 (Jarno: kupla meni tytön päälle): kupla + häntä kokonaan pään yläpuolelle, häntä osoittaa päähän
  const cx = t.x + w*0.28, cy = t.y - h*1.45 - H*0.012;
  ctx.save(); ctx.translate(cx, cy + h/2); ctx.scale(s, s); ctx.translate(-cx, -(cy + h/2));
  ctx.fillStyle = chat ? '#e9e9eb' : '#ffffff'; ctx.strokeStyle = '#1b2233'; ctx.lineWidth = chat ? 0 : 3;
  pyorea(cx - w/2, cy, w, h, h*0.45); ctx.fill(); if (!chat) ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - w*0.15, cy + h - 1); ctx.lineTo(cx - w*0.28, cy + h + h*0.45); ctx.lineTo(cx - w*0.02, cy + h - 1); ctx.closePath(); ctx.fill(); if (!chat) ctx.stroke();
  teksti(sisalto, cx, cy + h/2, px, chat ? '#111' : '#1b2233');
  ctx.restore();
}

// --- jääkaappi + kaasupullot --------------------------------------------------
function pullo(x, y, h, vari, merkki, alpha){
  ctx.globalAlpha = alpha; const w = h*0.42;
  ctx.fillStyle = vari; pyorea(x - w/2, y - h, w, h, w*0.3); ctx.fill();
  ctx.fillStyle = '#c8ccd4'; ctx.fillRect(x - w*0.15, y - h - h*0.12, w*0.3, h*0.14);
  teksti(merkki, x, y - h*0.5, h*0.22, '#fff'); ctx.globalAlpha = 1;
}
function jaakaappi(k, t){
  const h = H*0.36, w = h*0.55, x = W*0.74 - w/2, y = H*0.9 - h;
  const g = ctx.createRadialGradient(x + w*0.55, y + h*0.4, 4, x + w*0.55, y + h*0.4, h*0.6);
  g.addColorStop(0, `rgba(255,236,170,${0.35 + 0.05*Math.sin(t*3)})`); g.addColorStop(1, 'rgba(255,236,170,0)');
  ctx.fillStyle = g; ctx.fillRect(x - h*0.3, y - h*0.2, w + h*0.6, h*1.2);       // valo palaa koko ajan
  ctx.fillStyle = '#e8ecef'; pyorea(x, y, w, h, w*0.08); ctx.fill();
  ctx.fillStyle = '#c9d0d6'; ctx.fillRect(x, y + h*0.34, w, 3);
  ctx.fillStyle = '#fff6cf'; ctx.fillRect(x + w*0.08, y + h*0.4, w*0.84, h*0.52);   // raollaan oleva ovi, sisävalo
  ctx.fillStyle = '#9aa3ab'; ctx.fillRect(x + w*0.82, y + h*0.08, w*0.05, h*0.18); ctx.fillRect(x + w*0.82, y + h*0.42, w*0.05, h*0.22);
  const ph = H*0.12, px0 = x - w*0.45, py = H*0.9;
  const ulos = ease((k - 0.25) / 0.25), sisaan = ease((k - 0.55) / 0.3);
  if (k < 0.55) pullo(px0 + ulos*W*0.15, py, ph, PUNA, 'CFC', 1 - ulos);
  if (k > 0.5) pullo(px0 - (1 - sisaan)*W*0.15, py, ph, VIHREA, 'NEW', sisaan);
}

// --- kartta + nastat + suurennuslasi --------------------------------------------
function kartta(k, t){
  const w = W*0.38, h = H*0.3, x = W*0.58, y = H*0.62;
  ctx.globalAlpha = Math.min(1, k*4)*0.92;
  ctx.fillStyle = '#1e3550'; pyorea(x, y, w, h, 12); ctx.fill();
  ctx.fillStyle = '#3d6b4a';
  [[0.08,0.2,0.35,0.5],[0.5,0.1,0.42,0.38],[0.3,0.6,0.5,0.32]].forEach(([a,b,c,d]) => { pyorea(x + w*a, y + h*b, w*c, h*d, 18); ctx.fill(); });
  ctx.strokeStyle = '#6fb0e0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w*0.05, y + h*0.55); ctx.bezierCurveTo(x + w*0.3, y + h*0.4, x + w*0.5, y + h*0.85, x + w*0.95, y + h*0.6); ctx.stroke();
  const nastat = [[0.2,0.35],[0.62,0.25],[0.45,0.7],[0.8,0.45],[0.32,0.55],[0.7,0.72]];
  nastat.forEach(([a,b], i) => {
    const kk = ease((k - 0.12 - i*0.09) / 0.12); if (kk <= 0) return;
    const nx = x + w*a, ny = y + h*b - (1 - kk)*h*0.25, r = H*0.014;
    ctx.globalAlpha = kk; ctx.fillStyle = PUNA;
    ctx.beginPath(); ctx.arc(nx, ny - r*1.4, r, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(nx - r*0.8, ny - r); ctx.lineTo(nx, ny); ctx.lineTo(nx + r*0.8, ny - r); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(nx, ny - r*1.4, r*0.4, 0, Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  if (k > 0.5) { const a = t*0.8, mx = x + w*(0.5 + 0.3*Math.cos(a)), my = y + h*(0.5 + 0.28*Math.sin(a*1.3)), r = H*0.05;
    ctx.strokeStyle = '#e8e2d0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
    ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(mx + r*0.7, my + r*0.7); ctx.lineTo(mx + r*1.5, my + r*1.5); ctx.stroke(); }
}

// --- mielenosoituskyltit ----------------------------------------------------------
function kyltit(k, t){
  const kylt = [['NO ES', 'SEQUÍA'], ['ES', 'SAQUEO'], ['💧'], ['NO ES', 'SEQUÍA'], ['ES', 'SAQUEO']];
  const xs = [0.1, 0.27, 0.5, 0.73, 0.9];
  kylt.forEach((rivit, i) => {
    const kk = ease((k - i*0.08) / 0.35), w = H*0.2, h = H*0.13;
    const x = W*xs[i], heilu = Math.sin(t*2.2 + i*1.7)*H*0.01, y = H*1.02 - kk*H*0.36 + heilu;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t*1.6 + i)*0.05);
    ctx.fillStyle = '#7a5a3a'; ctx.fillRect(-H*0.006, 0, H*0.012, H*0.3);
    ctx.fillStyle = '#d9c39b'; ctx.fillRect(-w/2, -h, w, h);
    ctx.strokeStyle = '#a88b5e'; ctx.lineWidth = 3; ctx.strokeRect(-w/2, -h, w, h);
    rivit.forEach((r, j) => teksti(r, 0, -h + h*(rivit.length === 1 ? 0.5 : 0.32 + j*0.38), h*(rivit.length === 1 ? 0.5 : 0.27), '#2a2a2a', 900));
    ctx.restore();
  });
}

// --- tuomarin nuija + paperi ---------------------------------------------------------
function nuija(k, t){
  const bx = W*0.76, by = H*0.86, s = H*0.11;
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(bx - s*0.9, by - s*0.25, s*1.8, s*0.3);              // alusta
  const lyonti = k < 0.25 ? -1.1 + ease(k / 0.25)*1.1 : (k < 0.32 ? 0 : -0.25*ease((k - 0.32)/0.2));
  ctx.save(); ctx.translate(bx + s*1.3, by - s*0.1); ctx.rotate(lyonti);
  ctx.fillStyle = '#8a5a32'; ctx.fillRect(-s*1.5, -s*0.07, s*1.4, s*0.14);                     // varsi
  ctx.fillStyle = '#6b4226'; ctx.fillRect(-s*1.75, -s*0.32, s*0.5, s*0.64);                     // pää
  ctx.restore();
  if (k > 0.24 && k < 0.45) { ctx.strokeStyle = KELTA; ctx.lineWidth = 4; const a = (k - 0.24)/0.21;
    for (let i = 0; i < 6; i++) { const an = -Math.PI*0.95 + i*Math.PI*0.18; ctx.globalAlpha = 1 - a;
      ctx.beginPath(); ctx.moveTo(bx + Math.cos(an)*s*(0.6 + a*0.4), by - s*0.2 + Math.sin(an)*s*(0.6 + a*0.4)); ctx.lineTo(bx + Math.cos(an)*s*(1 + a*0.6), by - s*0.2 + Math.sin(an)*s*(1 + a*0.6)); ctx.stroke(); }
    ctx.globalAlpha = 1; }
  const pk = ease((k - 0.4) / 0.3); if (pk <= 0) return;
  const pw = H*0.22, ph = H*0.28, px = W*0.52, py = H*0.9 - ph*pk;
  ctx.fillStyle = '#f4efe2'; ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = '#c9c1ab'; for (let i = 0; i < 6; i++) ctx.fillRect(px + pw*0.12, py + ph*(0.15 + i*0.1), pw*(0.5 + (i % 3)*0.12), 3);
  const sk = ease((k - 0.7) / 0.15); if (sk > 0) { ctx.save(); ctx.translate(px + pw/2, py + ph*0.72); ctx.rotate(-0.18); ctx.scale(1.6 - 0.6*sk, 1.6 - 0.6*sk); ctx.globalAlpha = sk;
    ctx.strokeStyle = PUNA; ctx.lineWidth = 4; ctx.strokeRect(-pw*0.42, -ph*0.1, pw*0.84, ph*0.2); teksti('LAW CHANGED', 0, 0, ph*0.075, PUNA, 900); ctx.restore(); ctx.globalAlpha = 1; }
}

// --- kirje -> kirjekuori -> kaupungintalo ----------------------------------------------
function kaupungintalo(x, y, s, hehku){
  if (hehku > 0) { const g = ctx.createRadialGradient(x, y - s*0.5, 2, x, y - s*0.5, s*1.2); g.addColorStop(0, `rgba(242,201,76,${0.5*hehku})`); g.addColorStop(1, 'rgba(242,201,76,0)'); ctx.fillStyle = g; ctx.fillRect(x - s*1.3, y - s*1.8, s*2.6, s*2.2); }
  ctx.fillStyle = '#cfd5dc'; ctx.fillRect(x - s*0.7, y - s*0.6, s*1.4, s*0.6);
  ctx.beginPath(); ctx.moveTo(x - s*0.8, y - s*0.6); ctx.lineTo(x, y - s*1.0); ctx.lineTo(x + s*0.8, y - s*0.6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8d97a3'; for (let i = 0; i < 5; i++) ctx.fillRect(x - s*0.6 + i*s*0.28, y - s*0.55, s*0.1, s*0.5);
  ctx.fillStyle = '#7a8591'; ctx.fillRect(x - s*0.02, y - s*1.35, s*0.04, s*0.35); ctx.fillStyle = '#3b6fb6'; ctx.fillRect(x + s*0.02, y - s*1.35, s*0.28, s*0.16);
}
function kirje(k){
  const tx = W*0.82, ty = H*0.9, s = H*0.16;
  const sx = W*0.3, sy = H*0.72, pw = H*0.16, ph = H*0.2;
  const taitto = ease((k - 0.15) / 0.25), lento = ease((k - 0.45) / 0.35);
  kaupungintalo(tx, ty, s, ease((k - 0.8) / 0.15));
  const x = sx + (tx - sx)*lento, y = sy + (ty - s*0.7 - sy)*lento - Math.sin(lento*Math.PI)*H*0.25;
  const sk = 1 - 0.55*lento;
  ctx.save(); ctx.translate(x, y); ctx.scale(sk, sk); ctx.rotate(lento*0.4);
  if (taitto < 1) {                                                                // paperi, rivit kirjoitettuina
    const hh = ph*(1 - taitto*0.55);
    ctx.fillStyle = '#f4efe2'; ctx.fillRect(-pw/2, -hh/2, pw, hh);
    ctx.fillStyle = '#7d8aa0'; for (let i = 0; i < 4; i++) ctx.fillRect(-pw*0.38, -hh/2 + hh*(0.2 + i*0.18), pw*(0.5 + (i % 2)*0.2), 2);
    teksti('?', pw*0.3, hh*0.25, ph*0.18, '#3b6fb6');
  } else {                                                                        // kirjekuori
    const ew = pw*1.1, eh = pw*0.7;
    ctx.fillStyle = '#efe6d0'; ctx.fillRect(-ew/2, -eh/2, ew, eh);
    ctx.strokeStyle = '#b9ab88'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-ew/2, -eh/2); ctx.lineTo(0, eh*0.1); ctx.lineTo(ew/2, -eh/2); ctx.stroke(); ctx.strokeRect(-ew/2, -eh/2, ew, eh);
  }
  ctx.restore();
}

// --- polaroidit ------------------------------------------------------------------------
function polaroid(k){
  const kuvat = [
    { x: 0.62, kulma: -0.12, piirra: (x, y, s) => { ctx.fillStyle = '#5b5f66'; ctx.fillRect(x, y, s, s); ctx.fillStyle = '#5fa8e0'; ctx.beginPath(); ctx.ellipse(x + s*0.5, y + s*0.62, s*0.34, s*0.14, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#8fd0ff'; ctx.fillRect(x + s*0.35, y + s*0.58, s*0.12, 2); } },
    { x: 0.76, kulma: 0.08, piirra: (x, y, s) => { ctx.fillStyle = '#6a6e75'; ctx.fillRect(x, y, s, s); ['#c94f3d','#d9b44a','#4f8a5b','#7a6aa8','#b8b8b8'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(x + s*(0.2 + (i % 3)*0.2), y + s*(0.55 + Math.floor(i/3)*0.15), s*0.18, s*0.13); }); } },
    { x: 0.9, kulma: -0.05, piirra: (x, y, s) => { ctx.fillStyle = '#8fa3b5'; ctx.fillRect(x, y, s, s*0.55); ctx.fillStyle = '#9aa0a8'; ctx.fillRect(x, y + s*0.55, s, s*0.45); ctx.fillStyle = '#4f9a5b'; ctx.fillRect(x + s*0.1, y + s*0.35, s*0.18, s*0.25); ctx.fillRect(x + s*0.7, y + s*0.38, s*0.18, s*0.22); ctx.fillStyle = '#3d6fa8'; ctx.fillRect(x + s*0.44, y + s*0.55, s*0.14, s*0.2); teksti('✦ AI', x + s*0.78, y + s*0.12, s*0.11, KELTA, 900); } },
  ];
  kuvat.forEach((p, i) => {
    const kk = ease((k - i*0.18) / 0.3); if (kk <= 0) return;
    const s = H*0.17, x = W*p.x, y = H*0.52 + (1 - kk)*-H*0.6;
    ctx.save(); ctx.translate(x, y); ctx.rotate(p.kulma*(0.4 + kk*0.6));
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-s*0.55 + 5, -s*0.55 + 6, s*1.1, s*1.32);
    ctx.fillStyle = '#f7f5ef'; ctx.fillRect(-s*0.55, -s*0.55, s*1.1, s*1.32);
    p.piirra(-s*0.5, -s*0.5, s);
    ctx.restore();
  });
}

// --- tulikärpäset kerääntyvät -----------------------------------------------------------
function parvi(k, t, dt){
  const ke = kettu(), ty = tytto();
  const cx = ke && ty ? (ke.x + ty.x)/2 : W*0.45, cy = (ke ? ke.y : H*0.75) - H*0.05;
  if (!S.k) S.k = Array.from({ length: 34 }, () => ({ x: Math.random() < 0.5 ? -20 : W + 20, y: H*(0.2 + Math.random()*0.6), a: Math.random()*6.28, r: H*(0.06 + Math.random()*0.12), n: 0.5 + Math.random()*0.8, v: Math.random() }));
  const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, H*0.3);
  const hehku = ease((k - 0.3) / 0.6);
  g.addColorStop(0, `rgba(242,201,76,${0.45*hehku})`); g.addColorStop(1, 'rgba(242,201,76,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - H*0.35, cy - H*0.35, H*0.7, H*0.7);
  S.k.forEach(f => {
    f.a += f.n*dt;
    const tx = cx + Math.cos(f.a)*f.r, ty2 = cy + Math.sin(f.a*1.3)*f.r*0.6;
    const veto = Math.min(1, 0.6*dt + (k > f.v*0.6 ? 0.02 : 0));
    f.x += (tx - f.x)*veto; f.y += (ty2 - f.y)*veto;
    const vilkku = 0.55 + 0.45*Math.sin(t*4 + f.a*3);
    ctx.fillStyle = `rgba(201,232,106,${0.3*vilkku})`; ctx.fillRect(f.x - 7, f.y - 7, 14, 14);
    ctx.fillStyle = `rgba(230,250,170,${vilkku})`; ctx.fillRect(f.x - 3, f.y - 3, 6, 6);
  });
}

// --- ovi + puhekuplat (4900, 16.10 Jarno: "1") ----------------------------------
// Yksi kupla kimpoaa kiinni olevasta ovesta. Sitten monta yhdessä -> ovi aukeaa, valo tulee ulos.
function puhekupla(x, y, r, merkki, alpha){
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1b2233'; ctx.lineWidth = 2;
  pyorea(x - r*1.3, y - r, r*2.6, r*2, r*0.9); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - r*0.6, y + r - 1); ctx.lineTo(x - r*1.0, y + r*1.6); ctx.lineTo(x - r*0.1, y + r - 1); ctx.closePath(); ctx.fill(); ctx.stroke();
  teksti(merkki, x, y + r*0.05, r*1.2, '#1b2233', 900);
  ctx.globalAlpha = 1;
}
function ovi(k, t){
  const dh = H*0.34, dw = dh*0.48, dx = W*0.8 - dw/2, maa = H*0.92, dy = maa - dh;
  const auki = ease((k - 0.62) / 0.18);                       // 0 = kiinni, 1 = auki
  // seinä + karmi
  ctx.fillStyle = '#3a3f52'; ctx.fillRect(dx - dw*0.35, dy - dh*0.12, dw*1.7, dh*1.12);
  ctx.fillStyle = '#2a2e3d'; ctx.fillRect(dx - dw*0.08, dy - dw*0.08, dw*1.16, dh + dw*0.08);
  // valo oviaukosta
  ctx.fillStyle = `rgba(255,226,138,${0.15 + 0.85*auki})`; ctx.fillRect(dx, dy, dw, dh);
  if (auki > 0) {
    const g = ctx.createLinearGradient(dx, 0, dx - W*0.3, 0);
    g.addColorStop(0, `rgba(255,226,138,${0.35*auki})`); g.addColorStop(1, 'rgba(255,226,138,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx, maa); ctx.lineTo(dx - W*0.3, maa + H*0.02); ctx.lineTo(dx - W*0.3, dy + dh*0.55); ctx.closePath(); ctx.fill();
  }
  // ovilevy kääntyy saranoilta (oikea reuna) -> kapenee
  const lw = dw*(1 - auki*0.82), lx = dx + dw - lw;
  const vari = auki > 0 ? '#6b4a2e' : '#7a5636';
  ctx.fillStyle = vari; ctx.fillRect(lx, dy, lw, dh);
  ctx.strokeStyle = '#4a321e'; ctx.lineWidth = 3;
  if (lw > dw*0.3) { ctx.strokeRect(lx + lw*0.14, dy + dh*0.08, lw*0.72, dh*0.36); ctx.strokeRect(lx + lw*0.14, dy + dh*0.52, lw*0.72, dh*0.4); }
  ctx.fillStyle = '#e2c26a'; if (auki < 0.5) ctx.fillRect(lx + lw*0.1, dy + dh*0.5, dw*0.07, dw*0.07);
  // kuplat lähtevät tytön/ketun luota
  const ty = tytto() || kettu() || { x: W*0.4, y: H*0.62 };
  const lx0 = ty.x + H*0.04, ly0 = ty.y - H*0.04, ovX = dx - H*0.03, r = H*0.028;
  // 1) yksi kupla 0..0.3: lentää, kimpoaa, putoaa ja häipyy
  if (k < 0.34) {
    const a = k / 0.3;
    let x, y, al = 1;
    if (a < 0.6) { const q = ease(a/0.6); x = lx0 + (ovX - lx0)*q; y = ly0 + (dy + dh*0.35 - ly0)*q - Math.sin(q*Math.PI)*H*0.06; }
    else { const q = (a - 0.6)/0.4; x = ovX - q*H*0.12; y = dy + dh*0.35 + q*q*H*0.18; al = Math.max(0, 1 - q); }
    puhekupla(x, y, r, '?', al);
  }
  // 2) monta yhdessä 0.36..0.65 -> osuvat oveen, ovi aukeaa; sitten kuplat menevät sisään
  if (k >= 0.34) {
    for (let i = 0; i < 9; i++) {
      const a = ease((k - 0.36 - i*0.02) / 0.24);
      if (a <= 0) continue;
      const rivi = (i % 3) - 1, sar = Math.floor(i/3);
      const kx = ovX - sar*r*2.4, ky = dy + dh*0.45 + rivi*r*2.3;
      let x = lx0 + (kx - lx0)*a, y = ly0 + (ky - ly0)*a - Math.sin(a*Math.PI)*H*0.05;
      if (auki > 0) { x += auki*(dw*0.6 + sar*r*2.4); }          // valuvat sisään
      const al = auki > 0.9 ? Math.max(0, 1 - (k - 0.8)/0.12) : 1;
      puhekupla(x, y + Math.sin(t*3 + i)*2, r, ['?', '!', '?'][i % 3], al);
    }
  }
}

// --- setri -> datapikselit -> palvelinkaappi (1450, 16.10 Jarno: "2") ---------------
function setripalvelin(k, t){
  const maa = H*0.92, tx = W*0.18, kx = W*0.8, kw = H*0.2, kh = H*0.34, ky = maa - kh;
  const N = 8*14;                                               // pikseleitä = kaapin ruudukko 8 x 14
  if (!S.p) S.p = Array.from({ length: N }, (_, i) => ({ i, v: Math.random()*0.25, sx: tx + (Math.random() - 0.5)*H*0.32, sy: maa - H*0.02 - Math.random()*H*0.07, kaari: H*(0.12 + Math.random()*0.18) }));
  // tukit: häipyvät kun pikselit irtoavat
  const tukkiAlpha = 1 - ease((k - 0.15) / 0.45);
  if (tukkiAlpha > 0) {
    ctx.globalAlpha = tukkiAlpha;
    [[0, 0], [-0.06, -0.045], [0.07, -0.045]].forEach(([ox, oy]) => {
      const x = tx + H*ox*2, y = maa - H*0.025 + H*oy, L = H*0.3, R = H*0.025;
      ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x - L/2, y - R, L, R*2);
      ctx.fillStyle = '#c9a26b'; ctx.beginPath(); ctx.ellipse(x + L/2, y, R*0.7, R, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#8a6a42'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x + L/2, y, R*0.35, R*0.5, 0, 0, Math.PI*2); ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }
  // kaapin runko piirtyy kun pikselit saapuvat
  const valmis = ease((k - 0.7) / 0.15);
  ctx.globalAlpha = 0.25 + 0.75*valmis; ctx.strokeStyle = '#8fa3b8'; ctx.lineWidth = 3; ctx.strokeRect(kx - kw/2 - 6, ky - 6, kw + 12, kh + 12); ctx.globalAlpha = 1;
  const pw = kw/8, ph = kh/14;
  S.p.forEach(p => {
    const a = ease((k - 0.12 - p.v) / 0.55);
    const gx = kx - kw/2 + (p.i % 8)*pw, gy = ky + kh - (Math.floor(p.i/8) + 1)*ph;
    const x = p.sx + (gx - p.sx)*a, y = p.sy + (gy - p.sy)*a - Math.sin(a*Math.PI)*p.kaari;
    const vihr = Math.round(120 + 80*(1 - a));
    ctx.fillStyle = a < 0.97 ? `rgb(${Math.round(90 - 40*a)},${vihr},${Math.round(70 + 90*a)})` : '#2b3442';
    ctx.fillRect(x, y, pw - 1, ph - 1);
  });
  // palvelinkaapin yksiköt + vilkkuvat ledit kun valmis
  if (valmis > 0) {
    ctx.globalAlpha = valmis;
    for (let r = 0; r < 7; r++) {
      const y = ky + kh*(0.06 + r*0.135);
      ctx.fillStyle = '#1c232e'; ctx.fillRect(kx - kw*0.42, y, kw*0.84, kh*0.1);
      for (let j = 0; j < 3; j++) { const on = Math.sin(t*(5 + r) + j*2 + r) > 0.2; ctx.fillStyle = on ? (j === 2 ? '#f2c94c' : '#6fcf6a') : '#2e3a2e'; ctx.fillRect(kx + kw*0.2 + j*kw*0.06, y + kh*0.035, kw*0.035, kh*0.03); }
    }
    ctx.globalAlpha = 1;
  }
}

// --- sade "somewhere else" (4550, 18.10 Jarno: "The water comes back. As rain. Somewhere else.") ---
// Pikselisade vain ruudun oikealla laidalla; tyttö ja kettu seisovat kuivina vasemmalla.
function sade(k, t, dt){
  const x0 = W*0.6, maa = H*0.9;
  if (!S.p) S.p = Array.from({ length: 55 }, () => ({ x: x0 + Math.random()*(W - x0), y: H*0.22 + Math.random()*(maa - H*0.22), v: H*(0.28 + Math.random()*0.18) }));   // 18.10: harvempi + hitaampi
  if (!S.r) S.r = [];
  const voima = ease(k);                                            // sade voimistuu alussa
  // pilvi oikeassa yläkulmassa
  // pikselipilvi: piirretään pieneen kanvaasiin ja skaalataan terävästi (18.10: ei enää 4 palloa)
  if (!S.pilvi) {
    const c = document.createElement('canvas'); c.width = 72; c.height = 22; const g = c.getContext('2d');
    const kuhmut = [[10,15,7],[19,10,9],[30,8,11],[42,9,10],[53,11,8],[62,14,7]];
    const muoto = (dy, vari) => { g.fillStyle = vari; kuhmut.forEach(([x,y,r]) => { g.beginPath(); g.arc(x, y + dy, r, 0, Math.PI*2); g.fill(); }); g.fillRect(4, 14 + dy, 64, 6); };
    muoto(0, '#5d6a92');                       // vaalea yläreuna
    muoto(1.5, '#414c72');                     // runko
    g.fillStyle = '#323b5c'; g.fillRect(5, 17, 62, 4);   // tummempi alapinta
    g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 21, 72, 1);  // tasainen pohja
    g.globalCompositeOperation = 'source-over';
    // terävät pikselit: ei puoliläpinäkyviä reunoja, värit kolmeen sävyyn (18.10 Jarno: 'blurred pixels')
    const d = g.getImageData(0, 0, 72, 22), v = d.data, SAVYT = [[0x5d,0x6a,0x92],[0x41,0x4c,0x72],[0x32,0x3b,0x5c]];
    for (let i = 0; i < v.length; i += 4) {
      if (v[i+3] < 128) { v[i+3] = 0; continue; }
      v[i+3] = 255; let paras = SAVYT[0], ero = 1e9;
      SAVYT.forEach(c => { const e = (v[i]-c[0])**2 + (v[i+1]-c[1])**2 + (v[i+2]-c[2])**2; if (e < ero) { ero = e; paras = c; } });
      v[i] = paras[0]; v[i+1] = paras[1]; v[i+2] = paras[2];
    }
    g.putImageData(d, 0, 0);
    S.pilvi = c;
  }
  ctx.globalAlpha = 0.9*voima; ctx.imageSmoothingEnabled = false;
  const pw = W*0.44, ph = pw * 22/72;
  ctx.drawImage(S.pilvi, W*0.58, H*0.03, pw, ph);
  ctx.imageSmoothingEnabled = true; ctx.globalAlpha = 1;
  const n = Math.floor(S.p.length * voima), koko = H*0.016, lev = Math.max(2, H*0.004);
  ctx.fillStyle = 'rgba(170,200,255,0.8)';
  for (let i = 0; i < n; i++) {
    const p = S.p[i];
    p.y += p.v*dt;
    if (p.y > maa) { if (Math.random() < 0.5) S.r.push({ x: p.x, y: maa, a: 1 }); p.y = H*0.2 + Math.random()*H*0.04; p.x = x0 + Math.random()*(W - x0); }
    // pisaran muoto: terävä yläpää, pyöreä alapää
    const dx = p.x, dy = p.y, w = koko*0.42;
    ctx.beginPath(); ctx.moveTo(dx, dy - koko*0.75);
    ctx.quadraticCurveTo(dx + w*1.15, dy + koko*0.05, dx, dy + koko*0.35);
    ctx.quadraticCurveTo(dx - w*1.15, dy + koko*0.05, dx, dy - koko*0.75); ctx.fill();
  }
  // roiskeet maassa
  S.r.forEach(r => { r.a -= dt*3; ctx.fillStyle = `rgba(170,200,255,${Math.max(0, r.a)*0.6})`; ctx.fillRect(r.x - lev*2, r.y, lev*1.5, lev); ctx.fillRect(r.x + lev, r.y, lev*1.5, lev); });
  S.r = S.r.filter(r => r.a > 0);
}

const KESTO = { kysymys: 1, kiitos: 1, jaakaappi: 4, kartta: 6, kyltit: 3, nuija: 4, kirje: 4.5, polaroid: 3, parvi: 8, ovi: 6, setripalvelin: 4.5, sade: 2.5 };
function silmukka(ms){
  if (!aktiivinen) return;
  const t = ms/1000, dt = Math.min(0.05, t - edT || 0); edT = t;
  const k = Math.max(0, Math.min(1, (t - alkuT) / KESTO[tyyppi]));
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H); ctx.globalAlpha = 1;
  switch (tyyppi) {
    case 'kysymys': kupla(k, '?', false); break;
    case 'kiitos': kupla(k, 'Thank you!', true); break;
    case 'jaakaappi': jaakaappi(k, t); break;
    case 'kartta': kartta(k, t); break;
    case 'kyltit': kyltit(k, t); break;
    case 'nuija': nuija(k, t); break;
    case 'kirje': kirje(k); break;
    case 'polaroid': polaroid(k); break;
    case 'parvi': parvi(k, t, dt); break;
    case 'ovi': ovi(k, t); break;
    case 'setripalvelin': setripalvelin(k, t); break;
    case 'sade': sade(k, t, dt); break;
  }
  ctx.globalAlpha = 1;
  rafId = requestAnimationFrame(silmukka);
}

// Kutsutaan esitys-2d.html:n siirry():stä joka pysähdyksellä.
window.naytaLisat = function(p){
  if (p && p.lisaAnim && KESTO[p.lisaAnim]) {
    tyyppi = p.lisaAnim; S = {};
    alkuT = performance.now()/1000 + (tyyppi === 'kysymys' || tyyppi === 'kiitos' ? 1.2 : 0.3);  // kupla odottaa että hahmot ovat paikallaan
    edT = performance.now()/1000; aktiivinen = true; cv.style.opacity = 1;
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(silmukka);
    return;
  }
  if (!aktiivinen) return;
  aktiivinen = false; cancelAnimationFrame(rafId); cv.style.opacity = 0;
};
})();
