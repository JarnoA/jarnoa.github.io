# Tool Fairin metsänauha, puskutraktori ja patsasrivi — käyttöesimerkit

Kopioitu Tool Fairista (`Tool-Fair-2026/esitys/`) Pohjaan 26.10.2026.
**Pohjan esitys ei käytä näitä** — tiedostot ovat valmiina seuraavaa esitystä varten.

## Tiedostot
- `Backrounds/tf-metsa-strip/` — valmis jatkuva nauha: metsä → häivytys → hakattu
  → peilattu häivytys → metsä. Kohdistettu 1920×1080:lle.
- `Backrounds/tf-metsa-strip/rakenna.py` — rakentaa nauhan uudelleen; `X_MENO`,
  `X_PALUU` = missä siirtymät ovat ruudun keskellä. Siirtymien paikat on sovitettu
  Tool Fairin pysähdyksiin (hakkuuaukea x:650 / Muhos), joten uudessa esityksessä
  aja `rakenna.py` uusilla arvoilla.
- `Backrounds/forestfades/`, `Backrounds/forestcutted/` — Jarnon Affinity-tasot
  (Eder Muniz -metsä muokattuna), nauhan raaka-aineet.
- `assets/2d/sprites/Bulldozer/` — Walk/Idle/Attack/Hit/Death/Parry.png (+ .ase).
  Walk.png = 4 kehystä × 112×80.
- `kuvat/gilgamesh-patsas.png`, `kuvat/olig-patsas.png`, `kuvat/samalt-robotti.png`
  (+ Pohjassa jo ollut `jeffmark-rajattu.png`) — patsasrivi. Patsaskuvat on
  pienennetty 1100 px korkeiksi, koska isot kuvat rosoutuivat pienennettäessä.

## Kohtaus (`esitys-2d-kohtaukset.js`)
Korvaa `metsa-eder-muniz`-kohtauksen kentät näillä (tai tee kopio uudella nimellä).
Muut kohtaukset siirretään `xAlue`-kentällä nauhan perään.

```js
xAlue: [0, 3000],
resoluutioKiintea: true,                 // vaatii nauhan, ei toimi tavallisilla kerroksilla
kansio: 'Backrounds/tf-metsa-strip/',
taivas: { ylavari: 0x1c2340, alavari: 0x5a6f9a,
          kuu: { vari: 0xe9e6d8, sade: 46, x: 0.74, y: 0.55, scrollFactor: 0.03 } },
kerrokset: [
  { tiedosto: 'Layer_0008_3.png', scrollFactor: 0.28 },
  { tiedosto: 'Layer_0007_Lights.png', scrollFactor: 0.30, blendMode: 'ADD', alpha: 0.55 },
  { tiedosto: 'Layer_0006_4.png', scrollFactor: 0.38 },
  { tiedosto: 'Layer_0005_5.png', scrollFactor: 0.48 },
  { tiedosto: 'Layer_0004_Lights.png', scrollFactor: 0.50, blendMode: 'ADD', alpha: 0.55 },
  { tiedosto: 'Layer_0003_6.png', scrollFactor: 0.60 },
  { tiedosto: 'Layer_0002_7.png', scrollFactor: 0.72 },
  { tiedosto: 'Layer_0001_8.png', scrollFactor: 0.85 },
  { tiedosto: 'Layer_0000_9.png', scrollFactor: 0.98 },
],
attribuutio: '"Free Pixel Art Forest" by Eder Muniz (edermunizz.itch.io), modified.'
```

## Puskutraktori (`esitys-2d-hahmot.js`, HAHMOKERROKSET)
Lukittu etualan maakerrokseen, ajaa hitaasti vasemmalle vasta pysähdykseltä 450 alkaen.

```js
{ vainKohtaus: 'metsa-eder-muniz', x: 1350, spritesheet: 'assets/2d/sprites/Bulldozer/Walk.png',
  kehysLeveys: 112, kehysKorkeus: 80, kehyksia: 4, fps: 8,
  korkeusProsentti: 0.5, yProsentti: 0.999, ankkuri: { x: 0.5, y: 1 },
  lukitseKerrokseen: 'Layer_0000_9.png', syvyysSuhde: 0.98, omaLiike: -15, omaLiikeAlkaen: 450 },
```
Tarkista kehyskoko ennen käyttöä (väärä koko = välkkyy).

## Patsasrivi (HAHMOKERROKSET)
Samalla x:llä, eri `siirtymaX`. `syvyysSuhde`: 0.95 kaiken edessä, 0.45 kävelytasojen
välissä, 0.10 puiden takana. Moduuli `esitys-2d-kuninkaat.js` (ruudun alareunan
DOM-rivi) on eri asia, se on yhä vain Tool Fairissa.

```js
{ x: 5150, kuva: 'kuvat/gilgamesh-patsas.png', vainPysahdys: [5100, 5150],
  pehmea: true, siirtymaX: -215, scrollFactor: 1.0, syvyysSuhde: 0.8, korkeusProsentti: 0.48, yProsentti: 0.95, ankkuri: { x: 0.5, y: 1 } },
{ x: 5150, kuva: 'kuvat/olig-patsas.png', vainPysahdys: 5150, pehmea: true, siirtymaX: -98,
  scrollFactor: 1.0, syvyysSuhde: 0.8, korkeusProsentti: 0.44, yProsentti: 0.95, ankkuri: { x: 0.5, y: 1 } },
{ x: 5150, kuva: 'kuvat/samalt-robotti.png', vainPysahdys: 5150, pehmea: true, siirtymaX: 20,
  scrollFactor: 1.0, syvyysSuhde: 0.8, korkeusProsentti: 0.44, yProsentti: 0.95, ankkuri: { x: 0.5, y: 1 } },
{ x: 5150, kuva: 'kuvat/jeffmark-rajattu.png', vainPysahdys: 5150, pehmea: true, siirtymaX: 137,
  scrollFactor: 1.0, syvyysSuhde: 0.8, korkeusProsentti: 0.44, yProsentti: 0.95, ankkuri: { x: 0.5, y: 1 } },
```
