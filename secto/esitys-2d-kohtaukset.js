// ============================================================================
// 21 KOHTAUSTA POISTETTU 1.9.2026 (Jarno kävi läpi kaikkien kohtausten
// kuvakaappausgallerian ja valitsi mitkä eivät sopineet yhteen tyyliin -
// suurin osa oli litteää vektori-/gradienttitaidetta pikselitaide-
// pakkojen (Eder Muniz, craftpix ym.) seassa, tai liian tummia luettavaksi
// (dark-lakes-sarja). TÄYDET alkuperäiset kohtausmääritykset (kansio/
// kerrokset/taivas/attribuutio) talteen files/poistetut-kohtaukset-
// 1.9.2026.txt:ssä - tämä projekti EI ole git-versioitu, joten tämä
// tiedosto on ainoa tapa palauttaa ne jos joku niistä halutaan takaisin.
// Poistetut: teollisuus-ansimuz-inside, vuoret-ansimuz-mountain,
// futuristic-city-pixelfranek, luonto-craftpix-823949, kalliot-craftpix-
// 402033-bg2, metsa-craftpix-154389-6, kenney-color-desert, kenney-color-
// forest, kaupunki-dark-parallax-blue, kaupunki-dark-parallax-red,
// autiokaupunki-ephemeral, yotaivas-evalynn-venus, yotaivas-evalynn-tahdet,
// varasto-1, varasto-2, jarvi-inside-2..8 (7 kpl). xAlue-aukot suljettu
// aina laajentamalla EDELTÄVÄÄ jäljelle jäänyttä kohtausta - ei mikään
// muu x-sijainti (pysähdykset/hahmot) siirtynyt mihinkään.
// ============================================================================
//
// ============================================================================
// VALMIS POHJA - KOPIOI JA LIITÄ KOHTAUKSET-TAULUKKOON, MUUTA ARVOT
// (Jarnon pyyntö 1.9.2026). `taivas`/`taustaKorkeusSuhde` valinnaisia -
// jätä pois jos et tarvitse (kerrokset/kansio/nimi/xAlue riittävät).
// ============================================================================
//   {
//     nimi: 'oma-kohtaus-nimi',
//     xAlue: [1350, 2250],                          // mistä mihin x-arvoon tämä tausta näkyy
//     kansio: 'Backrounds/OMA-PAKKA/kerrokset/',    // kansio jossa kerrostiedostot ovat
//     taustaKorkeusSuhde: 1.0,                      // VALINNAINEN: <1.0 jos pakan kuvat pieniä (ei täytä koko ruudun korkeutta)
//     taivas: {                                     // VALINNAINEN: proseduraalinen (koodilla piirretty) taivas
//       ylavari: 0x1c2340, alavari: 0x5a6f9a,
//       kuu: { vari: 0xe9e6d8, sade: 46, x: 0.74, y: 0.55, scrollFactor: 0.03 }  // VALINNAINEN, jätä koko kuu-kenttä pois jos ei kuuta
//     },
//     kerrokset: [
//       { tiedosto: 'kerros1.png', scrollFactor: 0.28 },                          // 0=taaimmainen kerros
//       { tiedosto: 'kerros2.png', scrollFactor: 0.50, blendMode: 'ADD', alpha: 0.55, sykeNopeus: 0.5, sykeAmplitudi: 0.3 },  // blendMode/alpha VALINNAISIA (esim. valokerrokset). sykeNopeus (VALINNAINEN, sykettä/s) = alpha sykkii siniaallolla (esim. liikennevalot/ikkunavalot), sykeAmplitudi (oletus 0.3) = kuinka paljon alpha vaihtelee perusarvon ympärillä
//       { tiedosto: 'kerros3.png', scrollFactor: 0.98, ajelehdintaNopeus: 45 },   // viimeinen=etummaisin kerros. ajelehdintaNopeus (px/s, VALINNAINEN)
//                                                                                 // = kerros liikkuu TÄTÄ VAUHTIA AINA riippumatta kameran liikkeestä
//                                                                                 // (Jarnon pyyntö 1.9.2026 "cars move even when not scrolling") -
//                                                                                 // käytä autoille/liikennekaistoille tms. jatkuvasti liikkuvalle asialle,
//                                                                                 // EI rakennuksille/maastolle (ne PYSYVÄT paikallaan luonnostaan).
//     ],
//     attribuutio: '"Pakan nimi" by Tekijä (lähde), used under its license.'  // VALINNAINEN, näkyy ruudulla jos lisenssi vaatii
//     ambienssit: [                                 // VALINNAINEN: pienet liikkuvat/vilkkuvat elementit (ks. esitys-2d.html:n piirraAmbienssit())
//       { tyyppi: 'tahti', maara: 35, vari: 0xffffff, kokoAlue: [1, 2.5], alueY: [0, 0.35], scrollFactor: 0.04, syvyys: -998 },     // vain vilkkuu, kaukana taivaalla
//       { tyyppi: 'tulikarpanen', maara: 12, vari: 0xc9e86a, kokoAlue: [2, 3.5], alueY: [0.6, 0.85], scrollFactor: 0.5, syvyys: 6, ajelehdintaSade: 25 }, // vilkkuu + ajelehtii + hehkuu (ADD-blend)
//     ],
//   },
// ============================================================================
//
// Taustakohtaukset 2D-esitykselle. Jokainen kohtaus on kansio kuvia
// (kauimmaisesta lähimpään) + valinnainen credit-teksti. Ei oleteta mitään
// tiettyä kerrosmäärää - toimii yhtä hyvin yhdellä kuvalla kuin 12:lla.
//
// xAlue kertoo millä x-välillä tämä tausta on voimassa (esitys-data.js:n
// PYSAHDYKSET käyttää samaa x-akselia kuin 3D-versio).
const KOHTAUKSET = [
// ============================================================================
// TOINEN, PALJON ISOMPI KARSINTA 1.9.2026 (Jarno: "we can remove all others
// not than what we have Pixel 00 forest and 09, remeber those, i would keep
// moon also for later") - KOKO taustakohtausvalikoima pudotettu KOLMEEN:
// metsa-eder-muniz (forest), kukkulat-eder-muniz-hill (hill), assetpack-moon
// (säilytetty myöhempää käyttöä varten, ei aktiivisesti käytössä juuri nyt).
// KAIKKI muu - myös ensimmäisen karsinnan jälkeen jääneet + väliaikainen
// futuristic-city-eder-muniz (korvattu paljon paremmalla, ostetulla Pixel
// Art Futuristic City - Pack -kohtausryhmällä alempana) - poistettu.
// TÄYSI alkuperäinen tiedosto (kaikki ~40 kohtausta, ennen tätä karsintaa)
// talteen files/poistetut-kohtaukset-2-1.9.2026-koko-tiedosto.js:ssä - tämä
// projekti EI ole git-versioitu, se on AINOA tapa palauttaa mikä tahansa
// näistä jos halutaan takaisin joskus.
// xAlue-ketju uudelleenjärjestetty näille kolmelle jäljelle jääneelle
// (forest[0,4950] ennallaan, moon[4950,5182], hill[5182,6112] - sama
// leveys kummallakin kuin ennen, vain siirretty peräkkäin ilman aukkoja).
// Uudet Pixel Art Futuristic City - Pack -kohtaukset alkavat x:6112.
// ============================================================================
//
  {
    nimi: 'metsa-eder-muniz',
    // xAlue oli aiemmin pelkkää dokumentaatiota (PaaKohtaus käytti aina
    // KOHTAUKSET[0]:aa riippumatta x:stä) - nyt AIDOSTI toiminnallinen,
    // ks. esitys-2d.html:n vaihdaKohtaus()/valitseKohtaus(). Raja 1360
    // sovittu glitch-heights-savanna-kohtauksen kanssa (ks. alla).
    // LYHENNETTY 4950:stä 3600:aan 1.9.2026 (Jarno: "keep the current
    // forest at the beginnig, but you can choose when it ends") - antaa
    // uusille kaupunkikohtauksille tilaa alkaa aiemmin, metsä ei enää
    // veny keinotekoisesti pitkäksi (4950 oli vain aiemman kohtaus-
    // poiston aukontäyttöä, ei metsän oma luonnollinen pituus).
    // 3.9.2026: pidennetty 2340:sta 3090:aan (Jarno: "notice that linna-eder-1
    // is not goof on this, so remove it continue forest to linna-eder-2") -
    // linna-eder-1 poistettu käytöstä, ks. KOHTAUKSET_VARALLA tiedoston lopussa.
    xAlue: [0, 3090],
    kansio: 'Backrounds/Free Pixel Art Forest/PNG/Background layers/',
    // proseduraalinen taivas (koodilla piirretty, EI kuvatiedosto) korvaa
    // pakkauksen taivaskerrokset KOKONAAN - Jarnon suora ohje: Layer_0011_0,
    // Layer_0010_1 JA Layer_0009_2 ovat kaikki yksivärisiä täytekuvia eikä
    // niitä käytetä lainkaan, taivas on 100% koodia (liuku + kuu). Nämä kolme
    // olivat joka tapauksessa täysin läpinäkymättömiä koko kanvaalla
    // (tarkistettu Pillow'lla, alpha=255 joka pikselissä), joten mitään
    // aitoa kuvataidetta ei jää pois. Ensimmäinen mukana oleva kuvakerros on
    // nyt Layer_0008_3.png. Layer_0002_7.png EI ole taivaskerros vaikka sen
    // siluetti nousee korkealle - se on lähikerros (M=7, kolmanneksi eniten
    // edessä, ks. tiedostonimien M-arvo-selitys yllä), siis "maa"-puolen
    // objekti (läheinen iso puu) joka näyttää isolta koska se on lähellä -
    // jätetty ennalleen, ei poisteta.
    taivas: {
      ylavari: 0x1c2340, alavari: 0x5a6f9a,
      kuu: { vari: 0xe9e6d8, sade: 46, x: 0.74, y: 0.55, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: 'Layer_0008_3.png', scrollFactor: 0.28 },
      { tiedosto: 'Layer_0007_Lights.png', scrollFactor: 0.30, blendMode: 'ADD', alpha: 0.55 },
      { tiedosto: 'Layer_0006_4.png', scrollFactor: 0.38 },
      { tiedosto: 'Layer_0005_5.png', scrollFactor: 0.48 },
      { tiedosto: 'Layer_0004_Lights.png', scrollFactor: 0.50, blendMode: 'ADD', alpha: 0.55 },
      { tiedosto: 'Layer_0003_6.png', scrollFactor: 0.60 },
      { tiedosto: 'Layer_0002_7.png', scrollFactor: 0.72 },
      { tiedosto: 'Layer_0001_8.png', scrollFactor: 0.85 },
      { tiedosto: 'Layer_0000_9.png', scrollFactor: 0.98 },               // etuala, puiden rungot + nurmi
    ],
    // ambienssit: uusi geneerinen pieni-liikkuvien-elementtien järjestelmä
    // (Jarnon idea 1.9.2026, ks. esitys-2d.html:n piirraAmbienssit()) -
    // testattu tässä kohtauksessa ensimmäisenä. Tähdet ylhäällä taivaalla
    // (hitain scrollFactor, kauimpana), tulikärpäset alhaalla ruohikossa
    // (nopeampi scrollFactor + hehkuva ADD-blend + hidas ajelehdinta).
    ambienssit: [
      { tyyppi: 'tahti', maara: 35, vari: 0xffffff, kokoAlue: [1, 2.5], alueY: [0, 0.35], scrollFactor: 0.04, syvyys: -998 },
      { tyyppi: 'tulikarpanen', maara: 12, vari: 0xc9e86a, kokoAlue: [2, 3.5], alueY: [0.6, 0.85], scrollFactor: 0.5, syvyys: 6, ajelehdintaSade: 25 },
    ],
    attribuutio: '"Free Pixel Art Forest" by Eder Muniz (edermunizz.itch.io), modified.'
  },
  {
    nimi: 'linna-eder-2',
    zoom: 1.0, // ks. sovitaTaustatRuutuun():n zoom-kommentti - ei leikkaa kerrosten yläreunaa
    // Background 2: linna leijuu pilvisaarella - EI kosketa maata lainkaan,
    // ks. esitys-2d-hahmot.js:n kolmen "castle-cloud"-tiedoston kommentti
    // (näiden y-sijainti EI ole "pohjaan ankkuroitu ground contact" kuten
    // muilla, vaan suoraan niiden OMA kehys-fraktio, koska ne leijuvat
    // keskitaivaalla alkuperäisessäkin kompositiossa).
    // yläraja 3765 (EI 3840) - 3.9.2026, Jarno halusi x:3840-pysähdyksen
    // ("Tekoäly on ajattelun GPS") näyttävän linna-eder-3:n, ei tätä.
    // TÄRKEÄÄ: raja on PUOLIVÄLISSÄ kahden pysähdyksen (3690/3840) väliä,
    // EI suoraan 3840:ssä ilman rakoa - Jarnon oma yritys (3839/3840,
    // molemmat AINOASTAAN 1 erillään) jätti reaaliarvoille 3839-3840
    // väliin AIDON AUKON (esim. x=3839.4 ei osunut KUMPAANKAAN kohtaukseen,
    // ks. valitseKohtaus() - "totally wrong now" -bugi, kamera jäi jumiin/
    // kaatui kesken kävelyn). Ketun OMA x-sijainti on JATKUVA (ei vain
    // pysähdysten arvoja), joten rajan on oltava aukoton KAIKILLE
    // reaaliarvoille, ei vain pysähdys-x:ille - sama periaate kuin kaikilla
    // muillakin KOHTAUKSET-rajoilla tässä tiedostossa (koskettavat aina
    // TÄSMÄLLEEN, ei koskaan 1 yksikön rakoa).
    xAlue: [3090, 3765],
    kansio: 'Backrounds/Pixel Art Castle background/PNG/Background 2/',
    taustaKorkeusSuhde: 1.0,
    taivas: { ylavari: 0x9eb6bb, alavari: 0xc8d3d3 },
    kerrokset: [
      { tiedosto: '2.png', scrollFactor: 0.145 },
      { tiedosto: '3-fog-2.png', scrollFactor: 0.209, alpha: 0.5 },
      { tiedosto: '3-fog1.png', scrollFactor: 0.209, alpha: 0.5 },
      { tiedosto: '4.png', scrollFactor: 0.274 },
      { tiedosto: '5.png', scrollFactor: 0.338 },
      { tiedosto: '6.png', scrollFactor: 0.403 },
      { tiedosto: '7.png', scrollFactor: 0.468 },
      { tiedosto: '8.png', scrollFactor: 0.532 },
      { tiedosto: '9.png', scrollFactor: 0.597 },
      { tiedosto: '10.png', scrollFactor: 0.662 },
      { tiedosto: '11.png', scrollFactor: 0.726 },
      { tiedosto: '12.png', scrollFactor: 0.791 },
      { tiedosto: '13.png', scrollFactor: 0.855 },
      { tiedosto: '14.png', scrollFactor: 0.92 },
    ],
    attribuutio: '"Pixel Art Castle background" by Eder Muniz (edermunizz.itch.io).'
  },
  {
    nimi: 'linna-eder-3',
    zoom: 1.0, // ks. sovitaTaustatRuutuun():n zoom-kommentti - ei leikkaa kerrosten yläreunaa
    // Background 3: järven rannalla, oma peilikuva vedessä + valonsäteet -
    // rauhallisin/valoisin näistä kuudesta.
    xAlue: [3765, 4139], // ks. linna-eder-2:n xAlue-kommentti - sama raja, aukoton
    kansio: 'Backrounds/Pixel Art Castle background/PNG/Background 3/',
    taustaKorkeusSuhde: 1.0,
    taivas: { ylavari: 0xcccec0, alavari: 0xcccec0 },
    kerrokset: [
      { tiedosto: '2-mist.png', scrollFactor: 0.117, alpha: 0.5 },
      { tiedosto: '3.png', scrollFactor: 0.153 },
      { tiedosto: '4-mist.png', scrollFactor: 0.19, alpha: 0.5 },
      { tiedosto: '5.png', scrollFactor: 0.226 },
      { tiedosto: '6-mist.png', scrollFactor: 0.263, alpha: 0.5 },
      { tiedosto: '7-water.png', scrollFactor: 0.299, alpha: 0.8 },
      { tiedosto: '8-reflection.png', scrollFactor: 0.336, alpha: 0.6 },
      { tiedosto: '8.png', scrollFactor: 0.336 },
      { tiedosto: '10-light-rays.png', scrollFactor: 0.409, alpha: 0.35, blendMode: 'ADD' },
      { tiedosto: '11-reflection.png', scrollFactor: 0.445, alpha: 0.6 },
      { tiedosto: '11.png', scrollFactor: 0.445 },
      { tiedosto: '12-reflection.png', scrollFactor: 0.482, alpha: 0.6 },
      { tiedosto: '12.png', scrollFactor: 0.482 },
      { tiedosto: '13-reflection.png', scrollFactor: 0.518, alpha: 0.6 },
      { tiedosto: '13.png', scrollFactor: 0.518 },
      { tiedosto: '14-reflection.png', scrollFactor: 0.555, alpha: 0.6 },
      { tiedosto: '14.png', scrollFactor: 0.555 },
      { tiedosto: '15-reflection.png', scrollFactor: 0.591, alpha: 0.6 },
      { tiedosto: '15-water.png', scrollFactor: 0.591, alpha: 0.8 },
      { tiedosto: '15.png', scrollFactor: 0.591 },
      { tiedosto: '16-water.png', scrollFactor: 0.628, alpha: 0.8 },
      { tiedosto: '17-light-rays.png', scrollFactor: 0.664, alpha: 0.35, blendMode: 'ADD' },
      { tiedosto: '17-water.png', scrollFactor: 0.664, alpha: 0.8 },
      { tiedosto: '18-light-rays.png', scrollFactor: 0.701, alpha: 0.35, blendMode: 'ADD' },
      { tiedosto: '18-water.png', scrollFactor: 0.701, alpha: 0.8 },
      { tiedosto: '19-water.png', scrollFactor: 0.737, alpha: 0.8 },
      { tiedosto: '20-fog.png', scrollFactor: 0.774, alpha: 0.5 },
      { tiedosto: '21-fog.png', scrollFactor: 0.81, alpha: 0.5 },
      { tiedosto: '22.png', scrollFactor: 0.847 },
      { tiedosto: '23.png', scrollFactor: 0.883 },
      { tiedosto: '24.png', scrollFactor: 0.92 },
    ],
    attribuutio: '"Pixel Art Castle background" by Eder Muniz (edermunizz.itch.io).'
  },
  {
    nimi: 'linna-eder-day',
    zoom: 1.0, // ks. sovitaTaustatRuutuun():n zoom-kommentti - ei leikkaa kerrosten yläreunaa
    // xAlue KORJATTU 1.9.2026: alkuperäinen [6915,7265] menikin PÄÄLLEKKÄIN
    // kaupunki-eder-cars-kohtauksen [7215,7515] kanssa (unohdin että 'cars'
    // istuu JUURI towers-yo:n ja towers:n VÄLISSÄ alkuperäisessä ketjussa,
    // enkä koskenut siihen - Jarnon "Digitaaliset oligargit" (x:7290) pysyy
    // TARKOITUKSELLA cars-kohtauksessa, ei linnassa, ks. lohkon alun iso
    // kommentti). day täyttää TASAN towers-yo:n vanhan tilan [6915,7215],
    // sunset+night jakavat towers:n vanhan tilan [7515,7965] kahtia
    // (epätasainen 300/225/225 mutta EI päällekkäisyyttä/aukkoa).
    xAlue: [4139, 4590],
    kansio: 'Backrounds/Pixel Art Castle background/PNG/Background 4/',
    taustaKorkeusSuhde: 1.0,
    taivas: { ylavari: 0x7fadd9, alavari: 0x8ab1d8,
      kuu: { vari: 0xfff6d8, sade: 44, x: 0.76, y: 0.20, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '1.png', scrollFactor: 0.11 },
      { tiedosto: '2-fog.png', scrollFactor: 0.15, alpha: 0.5 },
      { tiedosto: '2.png', scrollFactor: 0.18 },
      { tiedosto: '3.png', scrollFactor: 0.22 },
      { tiedosto: '4.png', scrollFactor: 0.26 },
      { tiedosto: '5-fog.png', scrollFactor: 0.29, alpha: 0.5 },
      { tiedosto: '6.png', scrollFactor: 0.33 },
      { tiedosto: '7.png', scrollFactor: 0.36 },
      { tiedosto: '8.png', scrollFactor: 0.40 },
      { tiedosto: '9.png', scrollFactor: 0.43 },
      { tiedosto: '10.png', scrollFactor: 0.46 },
      { tiedosto: '11.png', scrollFactor: 0.50 },
      { tiedosto: '12-houses.png', scrollFactor: 0.53 },
      { tiedosto: '14-houses.png', scrollFactor: 0.57 },
      { tiedosto: '15.png', scrollFactor: 0.60 },
      { tiedosto: '16.png', scrollFactor: 0.64 },
      { tiedosto: '17.png', scrollFactor: 0.67 },
      { tiedosto: '18.png', scrollFactor: 0.71 },
      { tiedosto: '19.png', scrollFactor: 0.74 },
      { tiedosto: '20.png', scrollFactor: 0.78 },
      { tiedosto: '21.png', scrollFactor: 0.81 },
      { tiedosto: '22.png', scrollFactor: 0.85 },
      { tiedosto: '23.png', scrollFactor: 0.89 },
      { tiedosto: '24.png', scrollFactor: 0.92 },
    ],
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 8, vari: 0xffe8b0, kokoAlue: [1.5, 2.5], alueY: [0.3, 0.55], scrollFactor: 0.35, syvyys: 4, ajelehdintaSade: 18 },
    ],
    // Pakollinen tavaramerkki-ilmoitus (4.9.2026, ks. esitys-2d-hahmot.js:n
    // x:4141-alkion iso kommentti) - paketin oma ohje latauksen yhteydessä:
    // "Legal tip: When creating art and projects using the Steamboat
    // Willie mouse, make sure to add a disclaimer that you are not
    // associated with Disney." Steamboat Willie -ulkoasu on julkista
    // omaisuutta USA:ssa (1.1.2024 alkaen), mutta Disney-tavaramerkki elää
    // edelleen - siksi disclaimer, ei tekijänoikeusmaininta.
    attribuutio: '"Pixel Art Castle background" by Eder Muniz (edermunizz.itch.io). Steamboat Willie Mickey (public domain, not Disney-affiliated).'
  },
  {
    nimi: 'linna-eder-sunset',
    zoom: 1.0, // ks. sovitaTaustatRuutuun():n zoom-kommentti - ei leikkaa kerrosten yläreunaa
    xAlue: [4590, 5190],
    kansio: 'Backrounds/Pixel Art Castle background/PNG/Background 4 - sunset/',
    taustaKorkeusSuhde: 1.0,
    taivas: { ylavari: 0xd89468, alavari: 0xe49b69,
      kuu: { vari: 0xffcf8a, sade: 48, x: 0.72, y: 0.30, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '1.png', scrollFactor: 0.11 },
      { tiedosto: '2-fog.png', scrollFactor: 0.15, alpha: 0.5 },
      { tiedosto: '2.png', scrollFactor: 0.18 },
      { tiedosto: '3.png', scrollFactor: 0.22 },
      { tiedosto: '4.png', scrollFactor: 0.26 },
      { tiedosto: '5-fog.png', scrollFactor: 0.29, alpha: 0.5 },
      { tiedosto: '6.png', scrollFactor: 0.33 },
      { tiedosto: '7.png', scrollFactor: 0.36 },
      { tiedosto: '8.png', scrollFactor: 0.40 },
      { tiedosto: '9.png', scrollFactor: 0.43 },
      { tiedosto: '10.png', scrollFactor: 0.46 },
      { tiedosto: '11.png', scrollFactor: 0.50 },
      { tiedosto: '12-houses.png', scrollFactor: 0.53 },
      { tiedosto: '14-houses.png', scrollFactor: 0.57 },
      { tiedosto: '15.png', scrollFactor: 0.60 },
      { tiedosto: '16.png', scrollFactor: 0.64 },
      { tiedosto: '17.png', scrollFactor: 0.67 },
      { tiedosto: '18.png', scrollFactor: 0.71 },
      { tiedosto: '19.png', scrollFactor: 0.74 },
      { tiedosto: '20.png', scrollFactor: 0.78 },
      { tiedosto: '21.png', scrollFactor: 0.81 },
      { tiedosto: '22.png', scrollFactor: 0.85 },
      { tiedosto: '23.png', scrollFactor: 0.89 },
      { tiedosto: '24.png', scrollFactor: 0.92 },
    ],
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 10, vari: 0xff9a5a, kokoAlue: [1.5, 2.8], alueY: [0.3, 0.6], scrollFactor: 0.35, syvyys: 4, ajelehdintaSade: 20 },
    ],
    attribuutio: '"Pixel Art Castle background" by Eder Muniz (edermunizz.itch.io).'
  },
  {
    nimi: 'linna-eder-night',
    zoom: 1.0, // ks. sovitaTaustatRuutuun():n zoom-kommentti - ei leikkaa kerrosten yläreunaa
    xAlue: [5190, 6090],
    kansio: 'Backrounds/Pixel Art Castle background/PNG/Background 4 - night/',
    taustaKorkeusSuhde: 1.0,
    taivas: { ylavari: 0x03317f, alavari: 0x043e8f,
      kuu: { vari: 0xdce6f5, sade: 40, x: 0.74, y: 0.16, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '1.png', scrollFactor: 0.11 },
      { tiedosto: '2-fog.png', scrollFactor: 0.15, alpha: 0.5 },
      { tiedosto: '2.png', scrollFactor: 0.18 },
      { tiedosto: '3.png', scrollFactor: 0.22 },
      { tiedosto: '4.png', scrollFactor: 0.26 },
      { tiedosto: '5-fog.png', scrollFactor: 0.29, alpha: 0.5 },
      { tiedosto: '6.png', scrollFactor: 0.33 },
      { tiedosto: '7.png', scrollFactor: 0.36 },
      { tiedosto: '8.png', scrollFactor: 0.40 },
      { tiedosto: '9.png', scrollFactor: 0.43 },
      { tiedosto: '10.png', scrollFactor: 0.46 },
      { tiedosto: '11.png', scrollFactor: 0.50 },
      { tiedosto: '12-houses.png', scrollFactor: 0.53 },
      { tiedosto: '14-houses.png', scrollFactor: 0.57 },
      { tiedosto: '15.png', scrollFactor: 0.60 },
      { tiedosto: '16.png', scrollFactor: 0.64 },
      { tiedosto: '17.png', scrollFactor: 0.67 },
      { tiedosto: '18.png', scrollFactor: 0.71 },
      { tiedosto: '19.png', scrollFactor: 0.74 },
      { tiedosto: '20.png', scrollFactor: 0.78 },
      { tiedosto: '21.png', scrollFactor: 0.81 },
      { tiedosto: '22.png', scrollFactor: 0.85 },
      { tiedosto: '23.png', scrollFactor: 0.89 },
      { tiedosto: '24.png', scrollFactor: 0.92 },
    ],
    ambienssit: [
      { tyyppi: 'tahti', maara: 26, vari: 0xffffff, kokoAlue: [1, 2], alueY: [0, 0.3], scrollFactor: 0.05, syvyys: -998 },
    ],
    attribuutio: '"Pixel Art Castle background" by Eder Muniz (edermunizz.itch.io).'
  },
  {
    nimi: 'kaupunki-eder-tower-distance-sumu',
    xAlue: [6090, 7290],
    kansio: 'Backrounds/Pixel Art Futuristic City - Pack/PNG/tower at distance - fog/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0x907554, alavari: 0x6b5844,
      kuu: { vari: 0xcdbfa0, sade: 40, x: 0.70, y: 0.22, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '2-background.png', scrollFactor: 0.15 },
      { tiedosto: '3-background.png', scrollFactor: 0.23 },
      { tiedosto: '4-background.png', scrollFactor: 0.31 },
      { tiedosto: '5-background.png', scrollFactor: 0.39 },
      { tiedosto: '7-background.png', scrollFactor: 0.47 },
      { tiedosto: '8-background.png', scrollFactor: 0.56 },
      { tiedosto: '9-background.png', scrollFactor: 0.64 },
      { tiedosto: '10-middleground.png', scrollFactor: 0.72 },
      { tiedosto: '11-middleground.png', scrollFactor: 0.8 },
      { tiedosto: '13-middleground.png', scrollFactor: 0.88 },
    ],
    // ambienssit: hitaasti ajelehtivat, vaimeat sumuhiukkaset - sopii tämän
    // kohtauksen tunnelmaan (musta laatikko / piilotetut algoritmit, ks.
    // thematic remapping) - EI kirkas/hehkuva kuten muualla, tarkoituksella
    // himmeä ja vaimea samaan tapaan kuin taivas.kuu tässä kohtauksessa.
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 10, vari: 0xb8a888, kokoAlue: [1.5, 3], alueY: [0.2, 0.6], scrollFactor: 0.25, syvyys: -300, ajelehdintaSade: 12 },
    ],
    // Nera-hahmon (ks. esitys-2d-hahmot.js:n x:6990-alkiot, HAHMOKERROKSET
    // + YLITYSHAHMOT-virta) lisenssi vaatii maininnan tekijästä ("poohcom1")
    // ellei lahjoita - liitetty tähän SAMAAN attribuutio-merkkijonoon koska
    // Nera näkyy VAIN tämän kohtauksen aikana (x:6990 osuu tämän scenen
    // xAlueeseen), sama "yhdistetty näytön credit-teksti" -periaate kuin
    // muuallakin tässä tiedostossa kun useampi lähde näkyy samalla kohtauksella.
    attribuutio: '"Pixel Art Futuristic City - Pack" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0. "Nera Sprite Pack" by poohcom1 (itch.io), credit required unless donated.'
  },
  {
    nimi: 'kaupunki-eder-tower-distance',
    xAlue: [7290, 8040],
    kansio: 'Backrounds/Pixel Art Futuristic City - Pack/PNG/tower at distance/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0xe0bfab, alavari: 0xe7e3a2,
      kuu: { vari: 0xfff8e0, sade: 44, x: 0.74, y: 0.16, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '2-background.png', scrollFactor: 0.15 },
      { tiedosto: '3-background.png', scrollFactor: 0.23 },
      { tiedosto: '4-background.png', scrollFactor: 0.31 },
      { tiedosto: '5-background.png', scrollFactor: 0.39 },
      { tiedosto: '7-background.png', scrollFactor: 0.47 },
      { tiedosto: '8-background.png', scrollFactor: 0.56 },
      { tiedosto: '9-background.png', scrollFactor: 0.64 },
      { tiedosto: '10-middleground.png', scrollFactor: 0.72 },
      { tiedosto: '11-middleground.png', scrollFactor: 0.8 },
      { tiedosto: '13-middleground.png', scrollFactor: 0.88 },
    ],
    // ambienssit: kaukainen, harva utu/pöly - kuten distance-kohtauksessa.
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 8, vari: 0xf0dfc0, kokoAlue: [1, 2], alueY: [0.15, 0.4], scrollFactor: 0.2, syvyys: -500, ajelehdintaSade: 15 },
    ],
    // Frodo (ks. esitys-2d-hahmot.js:n x:7890) näkyy VAIN tässä kohtauksessa
    // (vainKohtaus) - lisenssi ei varmistettu (ks. sen kommentti), merkitty
    // tähän samaan tapaan kuin Nera/ship-fly.png muualla.
    attribuutio: '"Pixel Art Futuristic City - Pack" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0. "The Fellowship of The Ring LPC" sprite pack - license not verified, check before public use.'
  },
  {
    nimi: 'kaupunki-eder-oil-plant',
    xAlue: [8040, 9650],
    kansio: 'Backrounds/Pixel Art Futuristic City - Pack/PNG/oil plant/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0xe0c2a8, alavari: 0xe7e4a0,
      kuu: { vari: 0xffe9c2, sade: 44, x: 0.76, y: 0.22, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '1-background.png', scrollFactor: 0.15 },
      { tiedosto: '2-background-towers.png', scrollFactor: 0.24 },
      { tiedosto: '3-background.png', scrollFactor: 0.33 },
      { tiedosto: '4-background.png', scrollFactor: 0.42 },
      { tiedosto: '5-background.png', scrollFactor: 0.52 },
      { tiedosto: '6-background-cópia.png', scrollFactor: 0.61 },
      { tiedosto: '7-middleground.png', scrollFactor: 0.7 },
      { tiedosto: '8-middleground.png', scrollFactor: 0.79 },
      { tiedosto: '10-middleground.png', scrollFactor: 0.88 },
    ],
    // ambienssit: nousevat kipinät/hehkuvat hiukkaset laitoksen ympärillä -
    // dramaattisempi kuin muualla, sopii "oligarkit"/dystooppinen-teema
    // (Jarnon sisältökuvaus tälle kohtaukselle, ks. thematic remapping).
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 14, vari: 0xff7a3c, kokoAlue: [1, 2.5], alueY: [0.35, 0.75], scrollFactor: 0.4, syvyys: 6, ajelehdintaSade: 25 },
    ],
    attribuutio: '"Pixel Art Futuristic City - Pack" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0.'
  },
  {
    nimi: 'kaupunki-eder-towers',
    xAlue: [9650, 9915],
    kansio: 'Backrounds/Pixel Art Futuristic City - Pack/PNG/towers/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0xafa887, alavari: 0xf0c17d,
      kuu: { vari: 0xffe9b0, sade: 44, x: 0.76, y: 0.20, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '2-backround.png', scrollFactor: 0.15 },
      { tiedosto: '3-backround.png', scrollFactor: 0.3 },
      { tiedosto: '4b-backround--traffic-lights.png', scrollFactor: 0.44, blendMode: 'ADD', alpha: 0.8, sykeNopeus: 0.5, sykeAmplitudi: 0.3 },
      { tiedosto: '5-backround.png', scrollFactor: 0.59 },
      { tiedosto: '7-backround.png', scrollFactor: 0.73 },
      { tiedosto: '8-backround.png', scrollFactor: 0.88 },
    ],
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 8, vari: 0xffe0a0, kokoAlue: [1.5, 2.5], alueY: [0.3, 0.6], scrollFactor: 0.35, syvyys: 4, ajelehdintaSade: 18 },
    ],
    attribuutio: '"Pixel Art Futuristic City - Pack" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0.'
  },
  {
    nimi: 'kaupunki-eder-distance',
    xAlue: [9915, 10590],
    kansio: 'Backrounds/Pixel Art Futuristic City - Pack/PNG/Distance/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0xdac89a, alavari: 0xe0d89f,
      kuu: { vari: 0xfff6dd, sade: 42, x: 0.72, y: 0.22, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '2-background.png', scrollFactor: 0.15 },
      { tiedosto: '3-background-towers.png', scrollFactor: 0.24 },
      { tiedosto: '4-background.png', scrollFactor: 0.33 },
      { tiedosto: '5b-background-traffic-lights.png', scrollFactor: 0.42, blendMode: 'ADD', alpha: 0.8, sykeNopeus: 0.5, sykeAmplitudi: 0.3 },
      { tiedosto: '6-background.png', scrollFactor: 0.52 },
      { tiedosto: '7-background.png', scrollFactor: 0.61 },
      { tiedosto: '9-background.png', scrollFactor: 0.7 },
      { tiedosto: '10-background.png', scrollFactor: 0.79 },
      { tiedosto: '11-middleground.png', scrollFactor: 0.88 },
    ],
    // ambienssit: harva, kaukainen lämmin sumu/pöly-kerros - kaupunki näkyy
    // etäältä, joten pisteet pieniä ja hitaita, ylhäällä taivaan rajassa.
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 8, vari: 0xd9c9a0, kokoAlue: [1, 2], alueY: [0.15, 0.45], scrollFactor: 0.2, syvyys: -500, ajelehdintaSade: 15 },
    ],
    attribuutio: '"Pixel Art Futuristic City - Pack" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0.'
  },
  {
    nimi: 'kaupunki-eder-towers-yo',
    xAlue: [10590, 10990],
    kansio: 'Backrounds/Pixel Art Futuristic City - Pack/PNG/towers - night/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0x1c505e, alavari: 0x2a3d52,
      kuu: { vari: 0xcfe0e8, sade: 38, x: 0.74, y: 0.16, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '2-backround.png', scrollFactor: 0.15 },
      { tiedosto: '3-backround.png', scrollFactor: 0.3 },
      { tiedosto: '4b-backround--traffic-lights.png', scrollFactor: 0.44, blendMode: 'ADD', alpha: 0.8, sykeNopeus: 0.5, sykeAmplitudi: 0.3 },
      { tiedosto: '5-backround.png', scrollFactor: 0.59 },
      { tiedosto: '7-backround.png', scrollFactor: 0.73 },
      { tiedosto: '8-backround.png', scrollFactor: 0.88 },
    ],
    ambienssit: [
      { tyyppi: 'tahti', maara: 22, vari: 0xffffff, kokoAlue: [1, 2], alueY: [0, 0.28], scrollFactor: 0.05, syvyys: -998 },
    ],
    attribuutio: '"Pixel Art Futuristic City - Pack" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0.'
  },
  {
    nimi: 'kaupunki-eder-close-yo',
    xAlue: [10990, 11190],
    kansio: 'Backrounds/Pixel Art Futuristic City - Pack/PNG/close - night/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0x202f4a, alavari: 0x1c3847,
      kuu: { vari: 0xdbe4f0, sade: 38, x: 0.72, y: 0.18, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '2-background.png', scrollFactor: 0.15 },
      { tiedosto: '3-background.png', scrollFactor: 0.22 },
      { tiedosto: '4-middleground.png', scrollFactor: 0.28 },
      { tiedosto: '5-middleground.png', scrollFactor: 0.35 },
      { tiedosto: '6-middleground-buildings.png', scrollFactor: 0.42 },
      { tiedosto: '7---lights.png', scrollFactor: 0.48, blendMode: 'ADD', alpha: 0.8, sykeNopeus: 0.5, sykeAmplitudi: 0.3 },
      { tiedosto: '7-foreground-lane.png', scrollFactor: 0.55 },
      { tiedosto: '8b-foreground-cars.png', scrollFactor: 1.2, ajelehdintaNopeus: -45 },
      { tiedosto: '9-foreground.png', scrollFactor: 0.68 },
      { tiedosto: '9-lights.png', scrollFactor: 0.75, blendMode: 'ADD', alpha: 0.8, sykeNopeus: 0.5, sykeAmplitudi: 0.3 },
      { tiedosto: '10-foreground-buildings.png', scrollFactor: 0.81 },
      { tiedosto: '11-foreground.png', scrollFactor: 0.88 },
    ],
    // ambienssit: YÖ-kohtaus ("night"-kansio, ks. taivas.kuu-kommentti) -
    // tähdet ylhäällä taivaalla + muutama lämmin kelluva valopiste katua
    // matalalla (jatkaa jo olemassa olevien vilkkuvien valokerrosten tunnelmaa).
    ambienssit: [
      { tyyppi: 'tahti', maara: 24, vari: 0xffffff, kokoAlue: [1, 2], alueY: [0, 0.28], scrollFactor: 0.05, syvyys: -998 },
      { tyyppi: 'tulikarpanen', maara: 6, vari: 0xffcf80, kokoAlue: [1.2, 2], alueY: [0.55, 0.78], scrollFactor: 0.55, syvyys: 4, ajelehdintaSade: 16 },
    ],
    attribuutio: '"Pixel Art Futuristic City - Pack" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0.'
  },
  {
    nimi: 'kaupunki-eder-cars',
    xAlue: [11190, 11790],
    kansio: 'Backrounds/Pixel Art Futuristic City - Pack/PNG/cars/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0xe7b076, alavari: 0xf0d579,
      kuu: { vari: 0xffe3a8, sade: 48, x: 0.70, y: 0.28, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '2-background.png', scrollFactor: 0.15 },
      { tiedosto: '3-middleground.png', scrollFactor: 0.27 },
      { tiedosto: '4-middleground.png', scrollFactor: 0.39 },
      { tiedosto: '5-middleground-buildings.png', scrollFactor: 0.52 },
      { tiedosto: '7-foreground-lane.png', scrollFactor: 0.64 },
      // 6b-foreground-cars.png: PIENEMMÄT autot, kauempi kaista (Jarno
      // huomasi 1.9.2026 "did you notice, there is different cars on
      // back... Smaller? 6-foreground-cars.png / 6b" - jätetty pois
      // ensimmäisellä kierroksella, lisätty nyt oikealle syvyydelle 9-
      // foreground-lanen JA 10b:n väliin, hitaammalla ajelehdinnalla
      // (näyttää kauempana/hitaammalta, sama parallaksiperiaate).
      { tiedosto: '6b-foreground-cars.png', scrollFactor: 0.70, ajelehdintaNopeus: -28 },
      { tiedosto: '9-foreground-lane.png', scrollFactor: 0.76 },
      // Suunta KÄÄNNETTY (Jarno: "cars are moving wrong direction,
      // headliest are on right" - positiivinen ajelehdintaNopeus siirsi
      // tilePositionX:ää suuntaan joka näytti autot peruuttamassa,
      // koska niiden etuosa/valot osoittavat oikealle spritessä).
      { tiedosto: '10b-foreground-cars.png', scrollFactor: 1.2, ajelehdintaNopeus: -45 },
    ],
    // ambienssit: pakokaasu/pöly autokaistojen yllä, lämpimän auringonlaskun sävyinen.
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 8, vari: 0xffdca0, kokoAlue: [1.5, 2.5], alueY: [0.55, 0.8], scrollFactor: 0.7, syvyys: 5, ajelehdintaSade: 20 },
    ],
    attribuutio: '"Pixel Art Futuristic City - Pack" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0.'
  },
  {
    nimi: 'kaupunki-eder-close',
    xAlue: [11790, 12240],
    kansio: 'Backrounds/Pixel Art Futuristic City - Pack/PNG/close/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0xd5ccbb, alavari: 0xdfe8b3,
      kuu: { vari: 0xfff4d6, sade: 42, x: 0.75, y: 0.20, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '2-background.png', scrollFactor: 0.15 },
      { tiedosto: '3-background.png', scrollFactor: 0.23 },
      { tiedosto: '4-middleground.png', scrollFactor: 0.31 },
      { tiedosto: '5-middleground.png', scrollFactor: 0.39 },
      { tiedosto: '6-middleground-buildings.png', scrollFactor: 0.47 },
      { tiedosto: '7-foreground-lane.png', scrollFactor: 0.56 },
      { tiedosto: '8b-foreground-cars.png', scrollFactor: 1.2, ajelehdintaNopeus: -45 },
      { tiedosto: '9-foreground.png', scrollFactor: 0.72 },
      { tiedosto: '10-foreground-buildings.png', scrollFactor: 0.8 },
      { tiedosto: '11-foreground.png', scrollFactor: 0.88 },
    ],
    // ambienssit: lämmin katutason pöly/valohuuru autokaistan yläpuolella.
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 8, vari: 0xffe0b0, kokoAlue: [1.5, 2.5], alueY: [0.5, 0.8], scrollFactor: 0.6, syvyys: 4, ajelehdintaSade: 18 },
    ],
    attribuutio: '"Pixel Art Futuristic City - Pack" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0.'
  },
  {
    nimi: 'kukkulat-eder-muniz-hill',
    // xAlue venytetty [12990,13440] -> [12240,13440] (6.9.2026, Jarno: "take
    // off kaupunki-eder-distance-2, save it later use. stretch kukkulat-
    // eder-muniz-hill to fill the cap") - peittää nyt myös entisen
    // kaupunki-eder-distance-2:n alueen, ks. sen täydet asetukset
    // KOHTAUKSET_VARALLA:sta tiedoston lopussa (linna-eder-1:n rinnalla).
    xAlue: [12240, 13440],
    kansio: 'Backrounds/Free Pixel Art Hill/PNG/',
    // Sama tekijä kuin päämetsäkohtaus (Eder Muniz) - eri pakka ("Free
    // Pixel Art Hill" / "Pixel Art Infinite Runner Pack"). Lähdekuvat
    // 512x256 (paljon pienempiä kuin metsäpakan 793px) -> taustaKorkeus-
    // Suhde ehkäisee ylisuurennuksen. "Hills Layer 01" EI kerroksena,
    // taivas proseduraalinen sen väreistä (lämmin ilta-liuku).
    taustaKorkeusSuhde: 0.82,
    taivas: { ylavari: 0xf1f2d7, alavari: 0xff957a,
      kuu: { vari: 0xfff2c9, sade: 50, x: 0.78, y: 0.40, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: 'Hills Layer 02.png', scrollFactor: 0.20 },
      { tiedosto: 'Hills Layer 03.png', scrollFactor: 0.35 },
      { tiedosto: 'Hills Layer 04.png', scrollFactor: 0.50 },
      { tiedosto: 'Hills Layer 05.png', scrollFactor: 0.68 },
      { tiedosto: 'Hills Layer 06.png', scrollFactor: 0.88 },
    ],
    // ambienssit: item 3, "fireflies in beginning... plan and execute" (Jarnon
    // pyyntö 1.9.2026) laajennettu metsäkohtauksesta tänne asti - lämmin
    // ilta-taivas sopii kelluville siitepöly-/pölyhiukkasille (sama
    // tulikarpanen-mekaniikka kuin metsässä, vain lämpimämpi väri, ei vihreä).
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 10, vari: 0xffd9a0, kokoAlue: [1.5, 3], alueY: [0.35, 0.7], scrollFactor: 0.4, syvyys: 5, ajelehdintaSade: 20 },
    ],
    attribuutio: '"Free Pixel Art Hill" by Eder Muniz (edermunizz.itch.io).'
  },
  {
    nimi: 'metsa-eder-muniz-loppu',
    // xAlue oli aiemmin pelkkää dokumentaatiota (PaaKohtaus käytti aina
    // KOHTAUKSET[0]:aa riippumatta x:stä) - nyt AIDOSTI toiminnallinen,
    // ks. esitys-2d.html:n vaihdaKohtaus()/valitseKohtaus(). Raja 1360
    // sovittu glitch-heights-savanna-kohtauksen kanssa (ks. alla).
    // LYHENNETTY 4950:stä 3600:aan 1.9.2026 (Jarno: "keep the current
    // forest at the beginnig, but you can choose when it ends") - antaa
    // uusille kaupunkikohtauksille tilaa alkaa aiemmin, metsä ei enää
    // veny keinotekoisesti pitkäksi (4950 oli vain aiemman kohtaus-
    // poiston aukontäyttöä, ei metsän oma luonnollinen pituus).
    xAlue: [13440, 14940],
    kansio: 'Backrounds/Free Pixel Art Forest/PNG/Background layers/',
    // proseduraalinen taivas (koodilla piirretty, EI kuvatiedosto) korvaa
    // pakkauksen taivaskerrokset KOKONAAN - Jarnon suora ohje: Layer_0011_0,
    // Layer_0010_1 JA Layer_0009_2 ovat kaikki yksivärisiä täytekuvia eikä
    // niitä käytetä lainkaan, taivas on 100% koodia (liuku + kuu). Nämä kolme
    // olivat joka tapauksessa täysin läpinäkymättömiä koko kanvaalla
    // (tarkistettu Pillow'lla, alpha=255 joka pikselissä), joten mitään
    // aitoa kuvataidetta ei jää pois. Ensimmäinen mukana oleva kuvakerros on
    // nyt Layer_0008_3.png. Layer_0002_7.png EI ole taivaskerros vaikka sen
    // siluetti nousee korkealle - se on lähikerros (M=7, kolmanneksi eniten
    // edessä, ks. tiedostonimien M-arvo-selitys yllä), siis "maa"-puolen
    // objekti (läheinen iso puu) joka näyttää isolta koska se on lähellä -
    // jätetty ennalleen, ei poisteta.
    taivas: {
      ylavari: 0x1c2340, alavari: 0x5a6f9a,
      kuu: { vari: 0xe9e6d8, sade: 46, x: 0.74, y: 0.55, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: 'Layer_0008_3.png', scrollFactor: 0.28 },
      { tiedosto: 'Layer_0007_Lights.png', scrollFactor: 0.30, blendMode: 'ADD', alpha: 0.55 },
      { tiedosto: 'Layer_0006_4.png', scrollFactor: 0.38 },
      { tiedosto: 'Layer_0005_5.png', scrollFactor: 0.48 },
      { tiedosto: 'Layer_0004_Lights.png', scrollFactor: 0.50, blendMode: 'ADD', alpha: 0.55 },
      { tiedosto: 'Layer_0003_6.png', scrollFactor: 0.60 },
      { tiedosto: 'Layer_0002_7.png', scrollFactor: 0.72 },
      { tiedosto: 'Layer_0001_8.png', scrollFactor: 0.85 },
      { tiedosto: 'Layer_0000_9.png', scrollFactor: 0.98 },               // etuala, puiden rungot + nurmi
    ],
    // ambienssit: uusi geneerinen pieni-liikkuvien-elementtien järjestelmä
    // (Jarnon idea 1.9.2026, ks. esitys-2d.html:n piirraAmbienssit()) -
    // testattu tässä kohtauksessa ensimmäisenä. Tähdet ylhäällä taivaalla
    // (hitain scrollFactor, kauimpana), tulikärpäset alhaalla ruohikossa
    // (nopeampi scrollFactor + hehkuva ADD-blend + hidas ajelehdinta).
    ambienssit: [
      { tyyppi: 'tahti', maara: 35, vari: 0xffffff, kokoAlue: [1, 2.5], alueY: [0, 0.35], scrollFactor: 0.04, syvyys: -998 },
      { tyyppi: 'tulikarpanen', maara: 12, vari: 0xc9e86a, kokoAlue: [2, 3.5], alueY: [0.6, 0.85], scrollFactor: 0.5, syvyys: 6, ajelehdintaSade: 25 },
    ],
    attribuutio: '"Free Pixel Art Forest" by Eder Muniz (edermunizz.itch.io), modified.'
  },

];

// ===========================================================================
// VARALLA 90 MIN -ESITYSTÄ VARTEN (3.9.2026, Jarno merkitsi //SCENE:
// -kommentein esitys-data.js:ään mitkä kohtaukset ovat OIKEASTI käytössä
// 45 min -versiossa - loput 6 EIVÄT ole poistettu, vain siirretty tähän
// ERILLISEEN, moottorin käyttämättömään taulukkoon niin että ne löytyvät
// helposti ja voi kopioida takaisin KOHTAUKSET-taulukkoon kun pidempi
// versio rakennetaan). Täydet määritykset ennallaan, EI xAlue-arvoja
// päivitetty (merkityksettömiä, koska taulukkoa ei käytetä ajossa).
// ===========================================================================
const KOHTAUKSET_VARALLA = [
  {
    nimi: 'kaupunki-eder-distance-2',
    // 6.9.2026: siirretty tänne KOHTAUKSET:sta - Jarno: "take off kaupunki-
    // eder-distance-2, save it later use. stretch kukkulat-eder-muniz-hill
    // to fill the cap". kukkulat-eder-muniz-hill venytettiin peittämään
    // tämän vanha xAlue [12240,12990] - ei jätetty aukkoa.
    xAlue: [12240, 12990],
    kansio: 'Backrounds/Pixel Art Futuristic City - Pack/PNG/Distance/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0xdac89a, alavari: 0xe0d89f,
      kuu: { vari: 0xfff6dd, sade: 42, x: 0.72, y: 0.22, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '2-background.png', scrollFactor: 0.15 },
      { tiedosto: '3-background-towers.png', scrollFactor: 0.24 },
      { tiedosto: '4-background.png', scrollFactor: 0.33 },
      { tiedosto: '5b-background-traffic-lights.png', scrollFactor: 0.42, blendMode: 'ADD', alpha: 0.8, sykeNopeus: 0.5, sykeAmplitudi: 0.3 },
      { tiedosto: '6-background.png', scrollFactor: 0.52 },
      { tiedosto: '7-background.png', scrollFactor: 0.61 },
      { tiedosto: '9-background.png', scrollFactor: 0.7 },
      { tiedosto: '10-background.png', scrollFactor: 0.79 },
      { tiedosto: '11-middleground.png', scrollFactor: 0.88 },
    ],
    // ambienssit: harva, kaukainen lämmin sumu/pöly-kerros - kaupunki näkyy
    // etäältä, joten pisteet pieniä ja hitaita, ylhäällä taivaan rajassa.
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 8, vari: 0xd9c9a0, kokoAlue: [1, 2], alueY: [0.15, 0.45], scrollFactor: 0.2, syvyys: -500, ajelehdintaSade: 15 },
    ],
    attribuutio: '"Pixel Art Futuristic City - Pack" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0.'
  },
  {
    nimi: 'linna-eder-1',
    // 3.9.2026: siirretty tänne KOHTAUKSET:sta - Jarno: "linna-eder-1 is not
    // goof on this, so remove it continue forest to linna-eder-2". metsä
    // (metsa-eder-muniz) pidennettiin peittämään tämän vanha xAlue [2340,3090].
    zoom: 1.0, // ks. sovitaTaustatRuutuun():n zoom-kommentti - ei leikkaa kerrosten yläreunaa
    // Background 1: scifi-tyylinen punainen torni/linna mustan piikki-
    // metsän ja violettien vuorten keskellä - dramaattisin/synkin näistä
    // kuudesta, sopii hyvin heti metsän jälkeen tulevaksi käänteeksi.
    xAlue: [2340, 3090],
    kansio: 'Backrounds/Pixel Art Castle background/PNG/Background 1/',
    taustaKorkeusSuhde: 1.0,
    taivas: { ylavari: 0x81abdd, alavari: 0xc4d4ef },
    kerrokset: [
      { tiedosto: '2.png', scrollFactor: 0.122 },
      { tiedosto: '3.png', scrollFactor: 0.164 },
      { tiedosto: '4.png', scrollFactor: 0.206 },
      { tiedosto: '5-mist.png', scrollFactor: 0.248, alpha: 0.5 },
      { tiedosto: '6-castle.png', scrollFactor: 0.29 },
      { tiedosto: '7.png', scrollFactor: 0.332 },
      { tiedosto: '8.png', scrollFactor: 0.374 },
      { tiedosto: '9-mist.png', scrollFactor: 0.416, alpha: 0.5 },
      { tiedosto: '10.png', scrollFactor: 0.458 },
      { tiedosto: '11-mist.png', scrollFactor: 0.5, alpha: 0.5 },
      { tiedosto: '12.png', scrollFactor: 0.542 },
      { tiedosto: '13.png', scrollFactor: 0.584 },
      { tiedosto: '14.png', scrollFactor: 0.626 },
      { tiedosto: '15.png', scrollFactor: 0.668 },
      { tiedosto: '16.png', scrollFactor: 0.71 },
      { tiedosto: '17.png', scrollFactor: 0.752 },
      { tiedosto: '18.png', scrollFactor: 0.794 },
      { tiedosto: '19.png', scrollFactor: 0.836 },
      { tiedosto: '20.png', scrollFactor: 0.878 },
      { tiedosto: '21.png', scrollFactor: 0.92 },
    ],
    attribuutio: '"Pixel Art Castle background" by Eder Muniz (edermunizz.itch.io).'
  },
  {
    nimi: 'assetpack-moon',
    xAlue: [14640, 15240],
    kansio: 'Backrounds/assetpack/parallax/moon/',
    taivas: { ylavari: 0x160f09, alavari: 0x160f09 },
    kerrokset: [
      { tiedosto: 'moon_back.png', scrollFactor: 0.15 },
      { tiedosto: 'moon_earth.png', scrollFactor: 0.1 },
      { tiedosto: 'moon_mid.png', scrollFactor: 0.4 },
      { tiedosto: 'moon_front.png', scrollFactor: 0.65 },
      { tiedosto: 'moon_floor.png', scrollFactor: 0.9 },
    ],
    attribuutio: '"assetpack" parallax layers - lähde: itch.io free-parallax-tagi, EI lisenssitiedostoa löytynyt latauksesta, tekijää ei varmistettu. Tarkistettava ennen julkista käyttöä.'
  },
  {
    nimi: 'kaupunki-eder-dense',
    xAlue: [9240, 9840],
    kansio: 'Backrounds/Pixel Art Futuristic City - Pack/PNG/Dense/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0xaedeb8, alavari: 0xd0efb3,
      kuu: { vari: 0xffffe0, sade: 40, x: 0.78, y: 0.18, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '2-background-city.png', scrollFactor: 0.15 },
      { tiedosto: '3-background.png', scrollFactor: 0.24 },
      { tiedosto: '4-background.png', scrollFactor: 0.33 },
      { tiedosto: '5-background.png', scrollFactor: 0.42 },
      { tiedosto: '6-middleground.png', scrollFactor: 0.52 },
      { tiedosto: '7-middleground.png', scrollFactor: 0.61 },
      { tiedosto: '9-middleground.png', scrollFactor: 0.7 },
      { tiedosto: '10-middleground.png', scrollFactor: 0.79 },
      { tiedosto: '11-foreground-building.png', scrollFactor: 0.88 },
    ],
    // ambienssit: kevyt savu/pöly kaupungin yllä, vihertävän-keltaisen
    // taivaan sävyinen - tiheä kaupunki, hieman enemmän hiukkasia kuin distance.
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 10, vari: 0xd8e8a0, kokoAlue: [1, 2.2], alueY: [0.2, 0.55], scrollFactor: 0.3, syvyys: -400, ajelehdintaSade: 16 },
    ],
    attribuutio: '"Pixel Art Futuristic City - Pack" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0.'
  },
  {
    nimi: 'kaupunki-eder-free',
    // x:9912-11190 sisältö: lukutaito/kirjoitustaito, "viekö tekoäly
    // työpaikat", "tekoäly poistaa esteitä" - pysyy kaupunki-teemassa
    // (looginen jatko edelliselle tower-distance-kohtaukselle) mutta TUO
    // UUDEN visuaalin (juna-/siltarakenteita, ei nähty aiemmissa 10
    // kaupunkikohtauksessa) ettei koko kaupunkiosuus näytä samalta.
    // LYHENNETTY 1000->500 1.9.2026 (Jarno: "why did not use them on other
    // scenes?" - kysyi miksi kaupunki-eder-towers/towers-yo VAIN arkistoitiin
    // eikä käytetty uudelleen jossain muualla kun linna korvasi ne alkuperäi-
    // seltä paikaltaan) - loppuosa tästä samasta "lukutaito/työpaikat"-
    // pätkästä annettu niille takaisin, ks. alla. Kumpikaan MAKSETTU pakka
    // (tämä Free-versio, EI maksettu, JA Pixel Art Futuristic City - Pack,
    // MAKSETTU) ei jää enää käyttämättömäksi.
    xAlue: [8040, 8640],
    kansio: 'Backrounds/Free Pixel Art Futuristic City/PNG/',
    taustaKorkeusSuhde: 0.62,
    taivas: { ylavari: 0xafa887, alavari: 0xf0c17d,
      kuu: { vari: 0xffe6b8, sade: 44, x: 0.74, y: 0.20, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '2-backround.png', scrollFactor: 0.15 },
      { tiedosto: '3-backround.png', scrollFactor: 0.24 },
      { tiedosto: '5-backround.png', scrollFactor: 0.33 },
      { tiedosto: '4b-backround--traffic-lights.png', scrollFactor: 0.38, blendMode: 'ADD', alpha: 0.8, sykeNopeus: 0.5, sykeAmplitudi: 0.3 },
      { tiedosto: '8-backround.png', scrollFactor: 0.47 },
      { tiedosto: '9-middleground-tower.png', scrollFactor: 0.58 },
      { tiedosto: '10-middleground-lights-tower.png', scrollFactor: 0.6, blendMode: 'ADD', alpha: 0.8, sykeNopeus: 0.5, sykeAmplitudi: 0.3 },
      { tiedosto: '11-middleground.png', scrollFactor: 0.72 },
      { tiedosto: '12-middleground.png', scrollFactor: 0.85 },
    ],
    ambienssit: [
      { tyyppi: 'tulikarpanen', maara: 8, vari: 0xffe0a0, kokoAlue: [1.5, 2.5], alueY: [0.3, 0.6], scrollFactor: 0.35, syvyys: 4, ajelehdintaSade: 18 },
    ],
    attribuutio: '"Free Pixel Art Futuristic City" by Eder Muniz (edermunizz.itch.io), CC-BY-4.0.'
  },
  {
    nimi: 'linna-eder-5',
    zoom: 1.0, // ks. sovitaTaustatRuutuun():n zoom-kommentti - ei leikkaa kerrosten yläreunaa
    // Background 5: hehkuva satulinna, kuu + vaaleanpunaiset pilvet -
    // unenomainen/taianomainen tunnelma.
    xAlue: [5640, 6240],
    kansio: 'Backrounds/Pixel Art Castle background/PNG/Background 5/',
    taustaKorkeusSuhde: 1.0,
    taivas: { ylavari: 0x277778, alavari: 0x277778,
      kuu: { vari: 0xe8f0ea, sade: 40, x: 0.5, y: 0.15, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '1.png', scrollFactor: 0.122 },
      { tiedosto: '2.png', scrollFactor: 0.164 },
      { tiedosto: '3.png', scrollFactor: 0.206 },
      { tiedosto: '4.png', scrollFactor: 0.248 },
      { tiedosto: '5.png', scrollFactor: 0.29 },
      { tiedosto: '6.png', scrollFactor: 0.332 },
      { tiedosto: '7.png', scrollFactor: 0.374 },
      { tiedosto: '8.png', scrollFactor: 0.416 },
      { tiedosto: '9.png', scrollFactor: 0.458 },
      { tiedosto: '10.png', scrollFactor: 0.5 },
      { tiedosto: '11.png', scrollFactor: 0.542 },
      { tiedosto: '12.png', scrollFactor: 0.584 },
      { tiedosto: '13.png', scrollFactor: 0.626 },
      { tiedosto: '14.png', scrollFactor: 0.668 },
      { tiedosto: '15.png', scrollFactor: 0.71 },
      { tiedosto: '16.png', scrollFactor: 0.752 },
      { tiedosto: '17.png', scrollFactor: 0.794 },
      { tiedosto: '18.png', scrollFactor: 0.836 },
      { tiedosto: '19.png', scrollFactor: 0.878 },
      { tiedosto: '20.png', scrollFactor: 0.92 },
    ],
    attribuutio: '"Pixel Art Castle background" by Eder Muniz (edermunizz.itch.io).'
  },
  {
    nimi: 'linna-eder-6',
    zoom: 1.0, // ks. sovitaTaustatRuutuun():n zoom-kommentti - ei leikkaa kerrosten yläreunaa
    // Background 6: kaukainen linnan siluetti hyvin pimeällä, tähtitaivas -
    // hiljaisin/mystisin näistä kuudesta.
    xAlue: [6240, 6840],
    kansio: 'Backrounds/Pixel Art Castle background/PNG/Background 6/',
    taustaKorkeusSuhde: 1.0,
    taivas: { ylavari: 0x111025, alavari: 0x111025,
      kuu: { vari: 0xf5efd0, sade: 34, x: 0.5, y: 0.12, scrollFactor: 0.03 }
    },
    kerrokset: [
      { tiedosto: '1.png', scrollFactor: 0.129 },
      { tiedosto: '2.png', scrollFactor: 0.179 },
      { tiedosto: '3.png', scrollFactor: 0.228 },
      { tiedosto: '4.png', scrollFactor: 0.278 },
      { tiedosto: '5.png', scrollFactor: 0.327 },
      { tiedosto: '6.png', scrollFactor: 0.376 },
      { tiedosto: '7.png', scrollFactor: 0.426 },
      { tiedosto: '8.png', scrollFactor: 0.475 },
      { tiedosto: '9.png', scrollFactor: 0.525 },
      { tiedosto: '10.png', scrollFactor: 0.574 },
      { tiedosto: '11.png', scrollFactor: 0.624 },
      { tiedosto: '12.png', scrollFactor: 0.673 },
      { tiedosto: '13.png', scrollFactor: 0.722 },
      { tiedosto: '14.png', scrollFactor: 0.772 },
      { tiedosto: '15.png', scrollFactor: 0.821 },
      { tiedosto: '16.png', scrollFactor: 0.871 },
      { tiedosto: '17.png', scrollFactor: 0.92 },
    ],
    attribuutio: '"Pixel Art Castle background" by Eder Muniz (edermunizz.itch.io).'
  },
  {
    nimi: 'linna-eder-7',
    zoom: 1.0, // ks. sovitaTaustatRuutuun():n zoom-kommentti - ei leikkaa kerrosten yläreunaa
    // Background 7: vihreä sumuinen metsälinna kukkulalla - vanha/ikiaikainen
    // tunnelma, kaikki sävyt lähes yksivärisiä.
    xAlue: [6840, 7440],
    kansio: 'Backrounds/Pixel Art Castle background/PNG/Background 7/',
    taustaKorkeusSuhde: 1.0,
    taivas: { ylavari: 0xd3dad2, alavari: 0xd3dad2 },
    kerrokset: [
      { tiedosto: '2.png', scrollFactor: 0.136 },
      { tiedosto: '3.png', scrollFactor: 0.192 },
      { tiedosto: '4.png', scrollFactor: 0.248 },
      { tiedosto: '5.png', scrollFactor: 0.304 },
      { tiedosto: '6.png', scrollFactor: 0.36 },
      { tiedosto: '7.png', scrollFactor: 0.416 },
      { tiedosto: '8.png', scrollFactor: 0.472 },
      { tiedosto: '9.png', scrollFactor: 0.528 },
      { tiedosto: '10.png', scrollFactor: 0.584 },
      { tiedosto: '11.png', scrollFactor: 0.64 },
      { tiedosto: '12.png', scrollFactor: 0.696 },
      { tiedosto: '13.png', scrollFactor: 0.752 },
      { tiedosto: '14.png', scrollFactor: 0.808 },
      { tiedosto: '15.png', scrollFactor: 0.864 },
      { tiedosto: '16.png', scrollFactor: 0.92 },
    ],
    attribuutio: '"Pixel Art Castle background" by Eder Muniz (edermunizz.itch.io).'
  },
];
