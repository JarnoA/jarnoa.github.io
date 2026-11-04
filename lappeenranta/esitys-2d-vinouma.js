// ============================================================================
// VINOUMAN VAHVISTIN (3.10.2026, x:6390 "Data on tekoälyvinoumien polttoaine").
// Jarnon valinta: putki kuljettaa maata pitkin kirjavia datapikseleitä tornille
// (n. 70 % yhtä väriä, loput muita), ne nousevat tornin kylkeä ylös, ja
// liekissä vähemmistövärit palavat kipinöiksi ja tuhkaksi. Piipusta nousee
// lähes pelkkää valtaväriä - ja enemmän kuin sisään meni (osa monistuu).
// Sanoitta: mikä menee sisään vinona, tulee ulos vinompana.
//
// Käyttö esitys-data.js:ssä: `vinouma: true` pysähdykseen.
// Piirretään Phaser-Graphicsiin tornin (kuvat/towerfire.png) SAMALLA
// scrollFactorilla ja syvyydellä liekin yllä, joten putki pysyy kiinni
// taustakerroksessa ja jää oppaan/etualan taakse. Tornin paikka luetaan joka
// kehys. Ei ääniä. Poistuttaessa häivytys 0.8 s.
// ============================================================================
(function(){
'use strict';
const TORNI = 'towerfire.png', LIEKKI = 'fire asset blue';
// 3.10.2026 Jarno: "pipe bulky, same color as buildings, pops up too much, data
// does not need to go so fast" → ohut putki tornin omassa värissä, himmeät
// murretut värit, pienet pikselit, n. 2.5x hitaampi, matalampi savu.
const VALTA = 0xd9b25a;                                        // valtaväri (murrettu meripihka)
const MUUT = [0x7fb8ae, 0xc2788a, 0x9a90c8, 0x9cbc84, 0xd8d4c8]; // vähemmistövärit, murretut
const PUTKI = 0x8c8971, PUTKI_TUMMA = 0x5f5d4d, PUTKI_LAIPPA = 0x7a7763; // towerfire.png:n valtaväri
const OSUUS = 0.7, TAHTI = 2.4, MONISTUS = 0.45, LIPSAHDUS = 0.05, MATKA_S = 22;
// reitti tornin kuvan osuuksina (towerfire.png 252x202)
const R = { maaY: 0.76, nousuX: 0.37, ylaY: 0.10, piippuX: 0.464 };

let sc = null, g = null, torni = null, liekki = null, kaynnissa = false, haivytys = 0;
let t = 0, seurSyntyma = 0, sis = [], ulos = [], kipinat = [];

function etsi(avain){ return sc.children.list.find(o => o.texture && String(o.texture.key).includes(avain)) || null; }

function geometria(){
  const dw = torni.displayWidth, dh = torni.displayHeight;
  const vasen = torni.x - dw * torni.originX, yla = torni.y - dh * torni.originY;
  const k = Math.max(1.5, dh * 0.011);                           // datapikselin koko
  const maaY = yla + dh*R.maaY, nousuX = vasen + dw*R.nousuX, ylaY = yla + dh*R.ylaY;
  const alkuX = nousuX - sc.scale.width * 1.3;                 // putki tulee kaukaa vasemmalta
  const piippuX = vasen + dw*R.piippuX, liekkiY = yla - sc.scale.height*0.07;
  const l1 = nousuX - alkuX, l2 = maaY - ylaY, l3 = Math.abs(piippuX - nousuX);
  return { k, maaY, nousuX, ylaY, alkuX, piippuX, liekkiY, yla, l1, l2, l3, L: l1 + l2 + l3 };
}
// paikka putkireitillä matkan s mukaan
function paikka(G, s){
  if (s < G.l1) return [G.alkuX + s, G.maaY];
  s -= G.l1;
  if (s < G.l2) return [G.nousuX, G.maaY - s];
  s -= G.l2;
  return [G.nousuX + Math.sign(G.piippuX - G.nousuX) * Math.min(s, G.l3), G.ylaY];
}

function paivita(aika, dtMs){
  if (!torni || !torni.scene) { torni = etsi(TORNI); if (!torni) return; }
  const dt = Math.min(0.05, dtMs / 1000);
  t += dt;
  if (!kaynnissa) { haivytys -= dt / 0.8; if (haivytys <= 0) { lopeta(); return; } }
  else haivytys = Math.min(1, haivytys + dt / 1.2);
  g.setScrollFactor(torni.scrollFactorX, torni.scrollFactorY);
  g.setDepth((liekki ? liekki.depth : torni.depth) + 0.001);
  g.setAlpha(haivytys * torni.alpha);
  const G = geometria(), nopeus = G.L / MATKA_S;

  // uudet pikselit putken alkuun
  if (kaynnissa && t > seurSyntyma) {
    sis.push({ s: 0, valta: Math.random() < OSUUS, vari: 0 });
    const p = sis[sis.length - 1]; p.vari = p.valta ? VALTA : MUUT[Math.floor(Math.random()*MUUT.length)];
    seurSyntyma = t + 1 / TAHTI * (0.6 + Math.random()*0.8);
  }
  // putkessa liikkuvat → piippuun
  for (let i = sis.length - 1; i >= 0; i--) {
    const p = sis[i]; p.s += nopeus * dt;
    if (p.s < G.L) continue;
    sis.splice(i, 1);
    if (p.valta || Math.random() < LIPSAHDUS) {
      const n = p.valta && Math.random() < MONISTUS ? 2 : 1;   // vahvistuminen: osa monistuu
      for (let j = 0; j < n; j++) ulos.push({ x: G.piippuX + (Math.random()-.5)*G.k*2, y: G.liekkiY, vx: (Math.random()-.3)*G.k*1.2, vy: -(1 + Math.random()*.6)*G.k*4, ika: 0, kesto: 2.6 + Math.random()*1.2, vari: p.vari, vaihe: Math.random()*6 });
    } else {
      for (let j = 0; j < 3; j++) kipinat.push({ x: G.piippuX, y: G.liekkiY + G.k, vx: (Math.random()-.5)*G.k*8, vy: -(Math.random()*.8 + .3)*G.k*6, ika: 0, kesto: 0.5 + Math.random()*0.4, vari: p.vari, tuhka: false });
      kipinat.push({ x: G.piippuX, y: G.liekkiY + G.k, vx: (Math.random()-.5)*G.k*3, vy: -G.k*3, ika: 0, kesto: 2.4, vari: 0x6b6b6b, tuhka: true });
    }
  }

  g.clear();
  // putki: ohut, tornin värinen, keskellä tumma ura jossa data kulkee
  const pk = G.k * 1.7, pv = G.k * 0.3;
  g.fillStyle(PUTKI, 1);
  g.fillRect(G.alkuX, G.maaY - pk/2, G.nousuX - G.alkuX + pk/2, pk);
  g.fillRect(G.nousuX - pk/2, G.ylaY - pk/2, pk, G.maaY - G.ylaY + pk/2);
  g.fillRect(Math.min(G.nousuX, G.piippuX) - pk/2, G.ylaY - pk/2, G.l3 + pk, pk);
  g.fillStyle(PUTKI_TUMMA, 1);
  g.fillRect(G.alkuX, G.maaY - pk/2 + pv, G.nousuX - G.alkuX + pk/2 - pv, pk - 2*pv);
  g.fillRect(G.nousuX - pk/2 + pv, G.ylaY - pk/2 + pv, pk - 2*pv, G.maaY - G.ylaY + pk/2 - 2*pv);
  g.fillRect(Math.min(G.nousuX, G.piippuX) - pk/2 + pv, G.ylaY - pk/2 + pv, G.l3 + pk - 2*pv, pk - 2*pv);
  g.fillStyle(PUTKI_LAIPPA, 1);
  for (let x = G.nousuX - pk*4; x > G.alkuX; x -= pk*12) g.fillRect(x - pv, G.maaY - pk/2 - pv*0.6, pv*2, pk + pv*1.2);
  // pikselit putkessa
  for (const p of sis) {
    const [x, y] = paikka(G, p.s);
    g.fillStyle(p.vari, 0.85); g.fillRect(x - G.k*0.4, y - G.k*0.4, G.k*0.8, G.k*0.8);
  }
  // kipinät ja tuhka
  for (let i = kipinat.length - 1; i >= 0; i--) {
    const q = kipinat[i]; q.ika += dt;
    if (q.ika > q.kesto) { kipinat.splice(i, 1); continue; }
    q.x += q.vx*dt; q.y += q.vy*dt;
    q.vy += (q.tuhka ? G.k*4 : G.k*18) * dt;
    const a = 1 - q.ika / q.kesto;
    const vari = q.tuhka ? q.vari : (q.ika < q.kesto*0.3 ? 0xf0dcb0 : q.vari);
    g.fillStyle(vari, a); const kk = q.tuhka ? G.k*0.7 : G.k*0.6;
    g.fillRect(q.x - kk/2, q.y - kk/2, kk, kk);
  }
  // piipusta nousevat
  for (let i = ulos.length - 1; i >= 0; i--) {
    const u = ulos[i]; u.ika += dt;
    if (u.ika > u.kesto) { ulos.splice(i, 1); continue; }
    u.x += (u.vx + Math.sin(t*1.3 + u.vaihe)*G.k*1.2)*dt; u.y += u.vy*dt; u.vy *= (1 - 0.35*dt);
    const a = Math.min(1, u.ika*4) * (1 - Math.pow(u.ika / u.kesto, 2)) * 0.6;
    g.fillStyle(u.vari, a); g.fillRect(u.x - G.k/2, u.y - G.k/2, G.k, G.k);
  }
}

function aloita(){
  sc = window.__paaKohtaus; if (!sc) return;
  torni = etsi(TORNI); liekki = etsi(LIEKKI);
  if (!g || !g.scene) { g = sc.add.graphics(); sc.events.on('postupdate', paivita); }
  kaynnissa = true; t = 0; seurSyntyma = 0.8; sis = []; ulos = []; kipinat = [];
  // esitäyttö: putkessa on jo virtaa saavuttaessa
  if (torni) { const G = geometria(); for (let s = G.l1*0.55; s < G.l1 + G.l2; s += G.L/MATKA_S/TAHTI) { const valta = Math.random() < OSUUS; sis.push({ s, valta, vari: valta ? VALTA : MUUT[Math.floor(Math.random()*MUUT.length)] }); } }
}
function lopeta(){
  if (sc) sc.events.off('postupdate', paivita);
  if (g) g.destroy();
  g = null; sis = []; ulos = []; kipinat = []; haivytys = 0;
}

window.naytaVinouma = function(p){
  if (p && p.vinouma) { if (!kaynnissa) aloita(); }
  else kaynnissa = false;                                      // paivita() häivyttää ja siivoaa
};
})();
