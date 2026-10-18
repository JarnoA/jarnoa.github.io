// ============================================================================
// POHJA - mediakerrosten MASTER (15.9.2026). Ks. esitys-data.js:n alku ja
// POHJA-README.md. Yleisökohtaiset media-alkiot on jätetty tähän KOMMENTOITUNA
// ja merkitty // ZALARIS-MODUULI / TAITEILIJA-MODUULI - avaa ne samalla kun
// avaat vastaavan pysähdyksen esitys-data.js:ssä. Englanninkieliset äänet
// (_eng.wav) ja god_eng-video ovat SectoDesign/Sounds ja SectoDesign/assets.
// ============================================================================
// ============================================================================
// VALMIIT POHJAT - KOPIOI JA LIITÄ HAHMOKERROKSET-TAULUKKOON, MUUTA ARVOT
// (Jarnon pyyntö 1.9.2026 - kaikki komennot tiedoston alkuun copy-pastea
// varten). Kenttien selitykset alempana tässä tiedostossa.
// ============================================================================
//
// 1) MAISEMAAN KELLUVA KUVA (esim. Terminator, Loki - näkyy jo matkan
//    varrella, pysyy paikallaan maisemassa):
//   { x: 1350, kuva: 'kuvat/OMA.png', mittakaava: 1.0, yProsentti: 0.82, scrollFactor: 0.6, syvyysSuhde: 0.95, ankkuri: { x: 0.5, y: 1 } },
//
// 2) LÄPINÄKYVÄ VIDEO (patsaan tapainen - tarvitsee myös kaksi PNG-
//    kaveria, ks. VIDEO-kentät alempana miksi):
//   { x: 1350, video: 'assets/2d/video/OMA.webm', ekaFrame: 'assets/2d/video/OMA-eka.png', viimeinenFrame: 'assets/2d/video/OMA-viimeinen.png', korkeusProsentti: 0.55, yProsentti: 0.82, scrollFactor: 0.6, syvyysSuhde: 0.95, loop: false, aani: true },
//
// 3) KIINTEA KUVA (näkyy VAIN yhdellä pysähdyksellä, kuten teksti -
//    logokollaasi, kertakuva):
//   { x: 1350, kuva: 'kuvat/OMA.png', kiintea: true, puoli: 'oikea', pysty: 'keski', korkeusProsentti: 0.18 },
//
// 4) PELKKÄ ÄÄNIRAITA (ei kuvaa/videota - esim. ääneen luettu sitaatti):
//   { x: 1350, aaniraita: 'Sounds/OMA.mp3' },
//
// 5) KIINTEA KUVA + ÄÄNIRAITA YHDESSÄ (muotokuva + ääneen luettu sitaatti,
//    molemmat samaan aikaan samalla pysähdyksellä):
//   { x: 1350, kuva: 'kuvat/OMA.png', kiintea: true, puoli: 'vasen', pysty: 'keski', korkeusProsentti: 0.25, aaniraita: 'Sounds/OMA.mp3' },
// ============================================================================
//
// Maisemaan sulautuvat jättihahmot + kohtaus-teksti samalla mekanismilla.
// Oma kuva/video, oma parallaksikerros, skaalattu/syvyys säädetty niin että
// hahmo näyttää osalta maisemaa eikä päälleliimatulta.
//
// KENTÄT (yhteiset):
//   x            - MIHIN KOHTAAN TARINAA hahmo kuuluu (sama akseli kuin
//                  PYSAHDYKSET.x) - EI suoraan maailmakoordinaatti, vaikka
//                  niin oli aiemmin. `esitys-2d.html`:n `laskeParallaksiX()`
//                  laskee TODELLISEN sijainnin tästä JA scrollFactorista
//                  yhdessä, niin että hahmo on AINA täsmälleen ruudun
//                  keskellä juuri kun kettu saapuu tähän x:ään - vapaasti
//                  valittavasta scrollFactorista riippumatta (ks. alla).
//   scrollFactor - parallaksinopeus (1=liikkuu täsmälleen ketun/kameran
//                  mukana, <1=kelluu hitaammin - näkyy maailmassa jo
//                  matkan varrella eikä vain "poksahda" näkyviin). Voi
//                  vapaasti valita minkä tahansa arvon - ei enää riskiä
//                  että hahmo katoaa ruudulta, ks. historia alempana.
//   siirtymaX    - VALINNAINEN, story-x-yksikköä, oletus 0. PELKKÄ
//                  visuaalinen sivuttaissiirto keskityskohtaan (esim.
//                  väistämään tausta-arttiin osuva puunrunko) - EI KOSKAAN
//                  muuta x:ää itseään. TÄRKEÄÄ: älä koskaan muuta x:ää
//                  suoraan pelkän visuaalisen siirron takia - x on MYÖS
//                  laukaisuavain video/kiintea-kuva/aaniraita-mekanismeille
//                  (paivitaVideot()/paivitaKiinteatKuvat()/paivitaAanet()
//                  vertaavat AINA suoraan uusiPysahdys.x===h.x) - x:n
//                  muuttaminen rikkoo hiljaa näiden käynnistyksen (löydetty
//                  bugi 2.9.2026: video ei enää käynnistynyt kun x muutettiin
//                  suoraan). Käytä AINA siirtymaX:ää pelkkään sijainnin
//                  hienosäätöön: negatiivinen = siirtyy näytöllä vasemmalle,
//                  positiivinen = oikealle, sillä hetkellä kun kettu on x:ssä.
//                  Pikselimäärä = siirtymaX * scrollFactor * 2.2 (SKAALA).
//   syvyysSuhde  - VALINNAINEN, 0.0-1.0. Kerroin SEN kohtauksen (KOHTAUKSET-
//                  merkinnän, jonka xAlue sisältää tämän x:n) omaa
//                  kerrosmäärää vasten - sama suhdeluku antaa aina saman
//                  VISUAALISEN sijoittelun riippumatta onko taustassa 4 vai
//                  12 kerrosta (testattu ja todistettu test-video-alpha.
//                  html:ssä 1.9.2026, ks. muistio §38 jatko 6). Esimerkkejä:
//                    0.95 = kaiken edessä (oletus jos kenttä puuttuu -
//                           vastaa vanhaa käytöstä ennen tätä kenttää)
//                    0.45 = kävelytasojen välissä
//                    0.10 = metsän/elementtien takana
//   vainKohtaus  - VALINNAINEN, KOHTAUKSET-kohtauksen `nimi`-merkkijono.
//                  Jos asetettu, hahmo on näkyvissä VAIN kun kamera on
//                  juuri sillä kohtauksella - muuten piilossa (setVisible).
//                  Oletuksena (kenttä puuttuu) hahmo on AINA näkyvissä
//                  laskettuun maailmasijaintiinsa perustuen, riippumatta
//                  mikä KOHTAUKSET-tausta on juuri aktiivinen (oikea
//                  käytös useimmille - näkyy jo kaukaa lähestyessä, kuten
//                  patsas/Loki/Sokrates). Käytä tätä kun useampi SAMAN-
//                  TYYPPINEN maisemaelementti (esim. saman linnan
//                  päivä/ilta/yö-versiot) sijaitsee LÄHELLÄ toisiaan -
//                  ilman tätä kaikki versiot näkyisivät päällekkäin (ks.
//                  linna-eder-day/sunset/night, 1.9.2026). Toimii `kuva`:lla,
//                  `spritesheet`:lla JA `video`:lla (3.9.2026, mekanismi
//                  laajennettu videolle - ei vielä käytössä yhdessäkään
//                  video-hahmossa, ks. esitys-2d.html:n update()-kommentti).
//   yProsentti   - PYSTYSIJAINTI: mihin kohtaan RUUDUN KORKEUDESTA hahmon
//                  ankkuripiste asettuu, 0=aivan yläreuna, 1=aivan alareuna.
//                  VALINNAINEN, oletus 0.82 (lähellä maata, kuten kettu).
//                  Koskee SEKÄ kuvaa ETTÄ videota (maisemaosa-tyyppiä, ei
//                  kiintea:true-kuvaa - se käyttää puoli/pysty:tä, ks. alla).
//                  1.9.2026: tämä kenttä oli jo videolla koodissa mutta EI
//                  DOKUMENTOITUNA (Jarno: "I cannot adjust on what height
//                  video is vertically" - kenttä oli olemassa, vain
//                  löytymätön) - ja PUUTTUI kuvalta kokonaan (koodi käytti
//                  kiinteää `height*0.82`:ta, ei mitään säätömahdollisuutta).
//                  Molemmat korjattu: kenttä toimii nyt yhtä lailla
//                  kuvalla ja videolla, ja on dokumentoitu tähän.
//
// KUVA-kohtaiset kentät (kun `kuva` annettu, ei `video`):
//   kuva, mittakaava (kiinteä kerroin, EI ruudun-suhteellinen), ankkuri
//
// KIINTEA: true (VALINNAINEN, vain kuvalle) - KAKSI ERI TAPAA näyttää kuva,
// Jarnon oma erottelu 1.9.2026 ("some images should appear same way as
// text... some images are part of parallax, like Terminator"):
//   - OLETUS (kiintea puuttuu/false) = MAISEMAOSA. Maailmakoordinaatti +
//     scrollFactor, kelluu näkyviin parallaksissa matkan varrella, pysyy
//     "paikallaan maisemassa" (esim. Terminator, Loki, patsasvideo).
//   - kiintea:true = SAMA MEKANISMI KUIN TEKSTI. EI mitään tekemistä
//     maailmakoordinaatin/parallaksin kanssa - kiinnitetty RUUTUUN (kuten
//     #teksti), näkyy VAIN sillä yhdellä pysähdyksellä johon `x` osuu, ja
//     häviää (haalistuu, sama .5s-ajoitus kuin tekstillä) heti kun siirrytään
//     mihin tahansa toiseen pysähdykseen - ei jää maailmaan eikä "kellu"
//     mistään suunnasta. Esimerkki: `suomi24etc.png` (logokollaasi introssa,
//     Jarnon oma esimerkki - "next to my name", ei saa liikkua ketun mukana).
//   Kiintea-kuvan sijainti KÄYTTÄÄ TEKSTIN OMIA KENTTIÄ maailmakoordinaatin
//   sijaan - sama "vasen"/"keski"/"oikea" + "yla"/"keski"/"ala" -kieli kuin
//   esitys-data.js:n puoli/pysty, samat reunamarginaalit (6vw/6vh) kuin
//   #tekstikerroksella, jotta kuva ja teksti asettuvat yhdenmukaisesti:
//     puoli            - 'vasen'|'keski'|'oikea', oletus 'vasen'
//     pysty            - 'yla'|'keski'|'ala', oletus 'yla'
//     korkeusProsentti - koko suhteessa min(ruudun leveys, ruudun korkeus)
//                        -arvoon (sama periaate kuin videolla, ks. alla
//                        miksi ei pelkkä korkeus), oletus 0.18 - EI
//                        mittakaava-kenttä, koska kiintea kuva on aina
//                        ruutuun sidottu eikä maailman skaalassa.
//   scrollFactor/ankkuri EIVÄT vaikuta mitään kiintea:true-kuvalle - jätä
//   pois tai jätä huomiotta.
//   kohdistusX/kohdistusY + paikallinenX/paikallinenY (VALINNAINEN, 2.9.2026)
//   - OHITTAA puoli/pysty kokonaan kun annettu. Käytä kun kuvan jonkin
//   TIETYN kohdan (ei koko kuvan) pitää osua tarkalleen tiettyyn ruudun
//   kohtaan RIIPPUMATTA ruutukoosta/-suhteesta - esim. kahden kuvan kädet
//   kohtaamaan samassa pisteessä ("Creation of Adam" -idea). puoli/pysty:n
//   6%-marginaalit EIVÄT toimi tähän (löydetty bugi 2.9.2026: marginaalien
//   väli kasvaa leveällä ruudulla paljon nopeammin kuin korkeusProsentti-
//   skaalattu kuva, kädet eivät osu lähelle toisiaan paitsi sattumalta
//   yhdessä tietyssä ruutusuhteessa).
//     kohdistusX/Y   - RUUDUN suhteellinen (0-1) kohta johon osutaan.
//     paikallinenX/Y - KUVAN OMA suhteellinen (0-1) kohta joka osuu sinne
//                      (esim. käden kärki - mittaa Pillow'lla/numpy:lla
//                      alpha-kanavasta, sama menetelmä kuin ketun origin.y).
//                      Oletus 0.5/0.5 (kuvan keskikohta) jos jätetään pois.
//   syvyysSuhde TOIMII kiintea:true-kuvalla 2.9.2026 alkaen (Jarno: "how i
//   position it behind of scene elements, like ground?") - SAMA suhdeluku-
//   mekanismi kuin maisemaosa-kuvilla (ks. yllä), asettaa kuvan draw-
//   järjestyksen (EI sijaintia - puoli/pysty päättävät edelleen MISSÄ se
//   näkyy ruudulla) SEN kohtauksen kerrosten (jonka xAlue sisältää tämän
//   kuvan x:n) SEKAAN - esim. 0.85 = juuri etummaisimman taustakerroksen
//   (usein maa/nurmi) TAKANA, jolloin se voi näyttää OSITTAIN metsän/maan
//   PEITTÄMÄLTÄ. Jätä pois = ennallaan, AINA kaiken (myös taustan JA
//   muiden hahmojen) päällimmäisenä, kuten ennen tätä kenttää.
//
//   liukuSuunta (VALINNAINEN, 'vasen'|'oikea', vain kiintea:true-kuvalle,
//   2.9.2026 - "Creation of Adam" -idea, "adam flies from left to right
//   and god from right to left") - kuva EI ilmesty suoraan paikalleen
//   vaan LIUKUU sisään ruudun ('vasen'=vasemmalta, 'oikea'=oikealta)
//   reunalta omaan (puoli/pysty:n asettamaan) lopulliseen paikkaansa.
//   liukuKesto: millisekuntia, oletus 1200. Sama kesto molemmilla kahdella
//   toisiaan kohti liikkuvalla kuvalla = saapuvat maaliin TÄSMÄLLEEN
//   samaan aikaan riippumatta matkan pituudesta (tween interpoloi ajassa).
//   kipina (VALINNAINEN, {x,y,vari,kesto}, vain kiintea+liukuSuunta) - pieni
//   itsestään siivoutuva kipinäpurskaus RUUDUN suhteellisessa (0-1) kohdassa
//   TÄSMÄLLEEN kun liu'utus valmistuu (ks. piirraKipina() esitys-2d.html:ssä).
//   Aseta VAIN toiselle kahdesta toisiaan kohtaavasta kuvasta - muuten
//   kipinä laukeaa kahdesti samaan aikaan samaan kohtaan.
//
// AANIRAITA (VALINNAINEN, MINKÄ TAHANSA hahmon kanssa - kiintea/kuva/video/
// EI MITÄÄN VISUAALISTA): polku .mp3-tiedostoon, esim. 'Sounds/media3-91.
// mp3'. KÄYNNISTYY AUTOMAATTISESTI kun kävelijä saapuu pysähdykseen jonka
// x TÄSMÄÄ tämän hahmon x:ään - sama periaate kuin videolla ja kiintealla
// kuvalla, mutta EI suuntariippuvainen (ei ole mitään "viimeiseen frameen
// jää" -tarvetta, ei visuaalista tilaa säilytettävänä) - pysähtyy ja
// kelautuu alkuun heti kun siirrytään pois, kumpaan suuntaan tahansa.
// HUOM: EI SAMA KENTTÄ kuin videon oma `aani:true/false` (sen SISÄÄN
// LEIVOTUN äänen mykistys) - `aaniraita` on ERILLINEN, itsenäinen
// ääniklippi, ei liity videoon mitenkään. Esimerkki - Ada Lovelace
// -sitaatti (x:1760 `esitys-data.js`:ssä, oma ääneen luettu sitaatti):
//   { x: 2640, aaniraita: 'Sounds/media3-91.mp3' }
// Jarno voi lisätä kuvan (esim. kiintea:true muotokuva) samaan
// merkintään kun sellainen on olemassa - `aaniraita` toimii identtisesti
// riippumatta siitä onko hahmolla kuvaa/videota vai ei.
//
// VIDEO-kohtaiset kentät (kun `video` annettu `kuva`:n sijaan):
//   video            - polku .webm-tiedostoon (läpinäkyvä VP9/alpha)
//   ekaFrame         - polku PNG:hen joka on videon ENSIMMÄINEN frame
//                       (ffmpeg-vienti, sama alfakanava) - näytetään AINA
//                       kun video ei ole soimassa eikä ole vielä soinut/
//                       on palattu takaisin ekaan tilaan.
//   viimeinenFrame   - polku PNG:hen joka on videon VIIMEINEN frame -
//                       näytetään kun jatketaan eteenpäin videon ohi.
//                       VALINNAINEN - jos puuttuu, käytetään ekaFramea
//                       myös tähän tarkoitukseen.
//   korkeusProsentti - koko suhteessa min(ruudun leveys, ruudun korkeus)
//                      -arvoon (ei kiinteä kerroin kuten mittakaava, EI
//                      MYÖSKÄÄN pelkkä korkeus - 1.9.2026, Jarno huomasi
//                      esityksen näyttävän eri kokoiselta projektorilla
//                      vs. isolla TV:llä: pelkkä korkeusperustainen koko
//                      vie eri OSUUDEN ruudun leveydestä eri kuvasuhteilla,
//                      min(leveys,korkeus) vaimentaa tämän molempiin
//                      suuntiin) - koskee sekä videota että sen kahta
//                      kuvakaveria, kaikki kolme pysyvät aina
//                      samankokoisina/-paikkaisina (ks. alla miksi).
//   loop             - true/false, oletus false
//   aani             - true/false, oletus true
//
// MIKSI KAKSI PNG:tä VIDEON LISÄKSI (1.9.2026, Jarnon idea): aiempi versio
// yritti näyttää videota PYSÄYTETTYNÄ ensimmäisessä/viimeisessä framessa
// koko sen ajan kun se ei soi ("pakotaEkaFrame" - näennäinen play()+pause()-
// temppu, koska pysäytetty <video> ei aina piirrä mitään ennen kuin sitä on
// edes hetken toistettu). Tämä osoittautui epäluotettavaksi - toimi tässä
// testiympäristössä muttei Jarnon omalla koneella (video "ilmestyi
// tyhjästä" siitä huolimatta). KORJAUS: video-elementtiä ei enää KOSKAAN
// pyydetä näyttämään mitään paitsi kun se OIKEASTI soi. Sen sijaan kaksi
// tavallista, aina 100%-luotettavasti piirtyvää PNG:tä (ei mitään video-
// spesifistä epävarmuutta) korvaavat sen visuaalisesti: `ekaFrame` näkyy
// oletuksena (ja aina kun palataan taaksepäin), `viimeinenFrame` näkyy kun
// jatketaan eteenpäin. Koska video on JO KOKONAAN esiladattu
// ('canplaythrough', ks. esitys-2d.html) SIIHEN MENNESSÄ kun pysähdys
// voidaan edes saavuttaa, itse soittokäynnistys on välitön - ekaFrame-
// PNG ja videon oma eka frame ovat pikselintarkasti sama kuva, joten
// vaihto PNG:stä videoon näyttää siltä että "kuva alkoi vain animoitua",
// ei että jokin uusi ilmestyi tyhjästä.
// Koko mekanismi (mukaan lukien _playCalled-nollausbugin korjaus, selaimen
// play()/pause()-lupauskilpa-varmuustarkistus) on suoraan testattu ja
// todistettu toimivaksi test-video-alpha.html:ssä 1.9.2026, ks. muistio
// §38 kokonaisuudessaan ennen kuin muokkaat tätä.
// SCROLLFACTOR-HISTORIA, LUE ENNEN MUOKKAAMISTA (1.9.2026):
// v1 (alkuperäinen kommentoitu esimerkki): scrollFactor 0.5/0.55, EI
//    koskaan visuaalisesti testattu - osoittautui täysin rikkinäiseksi
//    (hahmo satoja pikseleitä ruudun ulkopuolella juuri saapumishetkellä).
// v2 (ensimmäinen korjaus): scrollFactor:1 kaikilla - korjasi näkyvyyden,
//    mutta teki hahmoista "liimattuja kameraan", ei enää tuntunut osalta
//    liikkuvaa maailmaa (Jarno: "not parallax part of scene floating from
//    right to left").
// v3 (TÄMÄ, oikea korjaus): scrollFactor voi taas olla mikä tahansa arvo,
//    koska `esitys-2d.html`:n `laskeParallaksiX()` laskee nyt maailma-
//    koordinaatin OTTAEN HUOMIOON valitun scrollFactorin niin että hahmo on
//    silti TÄSMÄLLEEN ruudun keskellä juuri saapumishetkellä, riippumatta
//    parallaksinopeudesta. Näkyvyys JA parallaksitunne eivät siis olleet
//    koskaan oikeasti ristiriidassa - v1:n bugi oli laskukaavassa
//    (`h.x * SKAALA` sellaisenaan), ei scrollFactor-konseptissa itsessään.
const HAHMOKERROKSET = [
  // TF 13.10.2026: Pohjan koristeet poistettu (alkuperäiset Pohja/esitys-2d-hahmot.js:ssä).
  // TF: puskutraktori Muhoksen hakkuuaukealla (Walk.png = 4 x 112x80). Kuten
  // Pohjan avaruusalukset: lukittu maakerrokseen + oma hidas liike.
  { vainKohtaus: 'metsa-eder-muniz', x: 1350, spritesheet: 'assets/2d/sprites/Bulldozer/Walk.png',
    kehysLeveys: 112, kehysKorkeus: 80, kehyksia: 4, fps: 8,
    korkeusProsentti: 0.5, yProsentti: 0.999, ankkuri: { x: 0.5, y: 1 },
    lukitseKerrokseen: 'Layer_0000_9.png', syvyysSuhde: 0.98, omaLiike: -15, omaLiikeAlkaen: 450 },   // 17.10: liikkuu vasta kun klikataan pysähdykselle 2
  // TF 15.10.2026 MONTAASI: jokainen rivi kahdella klikkauksella - x = teksti, x+5 = sama teksti + ääni
  { x: 1915, aaniraita: 'Sounds/montaasi-1.wav' },   // montaasi: kone lukee rivin
  { x: 1925, aaniraita: 'Sounds/montaasi-2.wav' },   // montaasi: kone lukee rivin
  { x: 1935, aaniraita: 'Sounds/montaasi-3.wav' },   // montaasi: kone lukee rivin
  { x: 1945, aaniraita: 'Sounds/montaasi-4.wav' },   // montaasi: kone lukee rivin
  { x: 1955, aaniraita: 'Sounds/montaasi-5.wav' },   // montaasi: kone lukee rivin
  { x: 1965, aaniraita: 'Sounds/montaasi-6.wav' },   // montaasi: kone lukee rivin
  { x: 1975, aaniraita: 'Sounds/montaasi-7.wav' },   // montaasi: kone lukee rivin
  // TF v3 15.10.2026: Mikaelin sitaatti tekoälyäänenä (Jarno: "this could be AI audio")
  // 16.10.2026: jaettu kahdelle sivulle (Jarno: mikael1 + mikael2)
  { x: 2300, aaniraita: 'Sounds/mikael1.mp3' },
  { x: 2350, aaniraita: 'Sounds/mikael2.mp3' },
  // 17.10: gilgamesh/olig pienennetty 1100 px korkeiksi (-patsas.png) - WebGL ilman mipmappeja rosoutti 2000 px kuvan pienennettäessä.
  // TF 15.10.2026 KUNINKAAT x:5150 "Don't let the kings decide alone." - patsaat maisemassa.
  // Säädä: syvyysSuhde (0.95 kaiken edessä, 0.45 kävelytasojen välissä, 0.10 puiden takana),
  // siirtymaX (sivuttain, negatiivinen = vasemmalle), korkeusProsentti (koko), yProsentti (pystypaikka).
  { x: 5150, kuva: 'kuvat/gilgamesh-patsas.png', vainPysahdys: [5100, 5150],   // 17.10 Jarno: Gilgamesh jo "you remember him?" -sivulla, jää kuninkaiden riviin
     pehmea: true, siirtymaX: -215, scrollFactor: 1.0, syvyysSuhde: 0.8, korkeusProsentti: 0.48, yProsentti: 0.95, ankkuri: { x: 0.5, y: 1 } },
  { x: 5150, kuva: 'kuvat/olig-patsas.png', vainPysahdys: 5150, pehmea: true, siirtymaX: -98,  scrollFactor: 1.0, syvyysSuhde: 0.8, korkeusProsentti: 0.44, yProsentti: 0.95, ankkuri: { x: 0.5, y: 1 } },
  { x: 5150, kuva: 'kuvat/samalt-robotti.png', vainPysahdys: 5150, pehmea: true, siirtymaX: 20,   scrollFactor: 1.0, syvyysSuhde: 0.8, korkeusProsentti: 0.44, yProsentti: 0.95, ankkuri: { x: 0.5, y: 1 } },
  { x: 5150, kuva: 'kuvat/jeffmark-rajattu.png', vainPysahdys: 5150, pehmea: true, siirtymaX: 137,  scrollFactor: 1.0, syvyysSuhde: 0.8, korkeusProsentti: 0.44, yProsentti: 0.95, ankkuri: { x: 0.5, y: 1 } },
  // TF 15.10.2026 x:4840 "Same machine. New mission.": T-800 kävelee vasemmalta tytön taakse ja jää seisomaan
  // hänen rinnalleen (saapuu-mekanismi; "heilutus" = 1 kävelykehys = seisoo). Säädä kohdeX (paikka), kavelyAika, korkeusProsentti.
  { x: 4840, saapuu: { kavely: 'assets/2d/sprites/t800-walk.png', heilutus: 'assets/2d/sprites/t800-walk.png', kehysLeveys: 283, kehysKorkeus: 504,
    kavelyKehyksia: 16, heilutusKehyksia: 1, heiluttaaKertaa: 1, aloitusX: -0.15, kohdeX: 0.38, kavelyAika: 4, korkeusProsentti: 0.42, pysty: 0.94, kasvotVasemmalle: true, syvyys: 99 } },
  // Gilgamesh kirveineen palautettu Pohjasta (x:9350 -> 450), setri-kohtaus tarvitsee hänet.
  { x: 450, spritesheet: 'assets/2d/sprites/gilgamesh-kirves.png', kehysLeveys: 742, kehysKorkeus: 1090, kehyksia: 2, fps: 0.9, korkeusProsentti: 0.61, scrollFactor: 2.5, syvyysSuhde: 0.85, yProsentti: 0.27, ankkuri: { x: 0.6, y: -0.1 } },   // TF: eteen (metsän latvus peitti) + alemmas
];

// SAVU POISTETTU 1.9.2026 (Jarno: "SMOKE is bad, remove it and let's make it
// later some other way") - oli 3 instanssia kaupunki-eder-oil-plant-
// kohtauksessa, tiivis spritesheet (smoke-sheet-tight.png) jää levylle
// talteen jos savu rakennetaan joskus uudelleen eri lähestymistavalla,
// mutta EI enää aktiivisessa käytössä. spritesheet-kerros-mekanismi itse
// (esitys-2d.html:n HAHMOKERROKSET-spritesheet-tuki) jää koodiin - toimii
// silti, ei mitään moottorimuutosta perutttu, vain nämä 3 dataoliota.

// ============================================================================
// YLITYSHAHMOT - ruudun poikki kävelevä hahmo (Jarnon pyyntö 1.9.2026: liikaa
// jättihahmoja tungettu samaan väliin Jumala+Loki+sitaatti -kohdassa, ja
// "terminator might be animated thing walking across the screen" oli hänen
// oma ehdotuksensa ratkaisuksi). ERI ASIA kuin HAHMOKERROKSET: näillä EI ole
// kiinteää maailmansijaintia/parallaksia eikä omaa "vain katso hahmoa"
// -pysähdystä - ne kävelevät RUUDUN (ei maailman) poikki kiinteällä
// ruutunopeudella kun täsmäävä pysähdys saavutetaan, ja katoavat kun ylitys
// on valmis (tai heti jos pysähdyksestä poistutaan kesken). Jarno: "No,
// text there" - eli x TÄYTYY osua TEKSTILLISEEN pysähdykseen, ei tyhjään.
//
// Kentät:
//   x:                 pysähdys jolla ylitys käynnistyy (sama täsmäysperiaate
//                       kuin HAHMOKERROKSET/aaniraita, ks. paivitaYlitykset())
//   kuva:               polku YHTEEN still-kuvaan (jos ei tarvita kävelyä -
//                       vaihtoehto spritesheet-kentälle alla, ei molempia)
//   spritesheet:        polku kävelysykli-spritesheetiin (RUUTU ruudun
//                       vierellä, sama muoto kuin ketun kettu-walk.png).
//                       GLB-pohjainen (test-hahmo-render.html) terminator-
//                       t800-siluetti hylättiin 1.9.2026 (Jarno: "it is still
//                       bad, let's use differemt robot") - tilalle valmis
//                       piirretty pikselitaide-spritesheet, Mech-walk-200×
//                       150px-sprites.png (Jarno toimitti tiedoston itse,
//                       assets/2d/sprites/-kansiossa jo valmiiksi). 8 kehystä
//                       x 2 riviä (200x150/kehys) - KÄYTETÄÄN VAIN
//                       YLÄRIVIÄ (kehykset 0-7, Phaserin spritesheet-indeksi
//                       on rivi kerrallaan vasemmalta oikealle) - alarivi
//                       (kehykset 8-15) jää käyttämättä, ei tarvittu.
//   kehysLeveys/         yhden kehyksen leveys/korkeus pikseleinä (pakollinen
//   kehysKorkeus:        jos spritesheet annettu - EI tarvitse olla neliö,
//                       toisin kuin vanha kehysKoko-kenttä)
//   kehyksia:           kehysten määrä JOTKA KÄYTETÄÄN (alkaen kehyksestä 0,
//                       vasemmalta oikealle, YLÄRIVI ensin) - pakollinen jos
//                       spritesheet annettu
//   ankkuriX/ankkuriY:  hahmon "jalkapiste" osuutena kehyksen koosta (0-1) -
//                       MITATTU Pillow/numpy:lla (sama menetelmä kuin ketun
//                       origin, ks. esitys-2d-hahmovaihtoehdot.js:n kommentti)
//                       - Mech-spritelle mitattu 0.505/0.953. Oletus 0.5/1.0
//                       (keskellä alhaalla) jos ei annettu.
//   fps:                animaationopeus (oletus 10)
//   kesto:              sekuntia reunasta reunaan (oletus 6)
//   korkeusProsentti:   hahmon korkeus osuutena min(ruudun leveys,korkeus)
//                       (oletus 0.3) - Jarnon pyyntö 1.9.2026 "can i be
//                       bigger?" - Mech 0.35 (isompi kuin kettu, n. 1.4x)
//   yProsentti:         pystysijainti ruudulla, 0=ylä, 1=ala (oletus 0.85) -
//                       Jarnon pyyntö 1.9.2026 "should walk on same level as
//                       fox" - 0.94 on SAMA arvo kuin esitys-2d.html:n
//                       HAHMON_Y_SUHDE (ketun oma maanpinta-Y), jotta
//                       ankkuriY:n (jalkapisteen) kautta Mechin jalat osuvat
//                       täsmälleen samalle maanpinnan tasolle kuin ketun.
//   suunta:             1 = vasemmalta oikealle, -1 = oikealta vasemmalle
//                       (oletus 1, kuva peilataan JOS suunta ei täsmää
//                       kasvotSuuntaan-kenttään, ks. alla)
//   kasvotSuuntaan:     mihin suuntaan kuva on PIIRRETTY katsomaan
//                       peilaamatta (1=oikealle, -1=vasemmalle, oletus -1).
//                       Jarnon pyyntö 1.9.2026 "face is backwards" - Mech-
//                       spritesheet on kasvot-OIKEALLE (eri kuin ketun/
//                       terminatorin nenä-vasemmalle-konventio), joten se
//                       PITÄÄ merkitä täällä erikseen tai kääntösuunta menee
//                       väärin päin.
//   maara:              VALINNAINEN, 3.9.2026 (Jarno "several endless stream
//                       of she, like army") - montako RINNAKKAISTA ylitystä
//                       tästä samasta rivistä luodaan (kaikki jakavat saman
//                       tekstuurin/animaation, liikkuvat toisistaan riippu-
//                       matta, tasavälein levitettynä heti alusta lähtien -
//                       ei "kaikki samasta reunasta samaan aikaan" -pörähdystä).
//                       Oletus 1 = vanha käytös (yksi hahmo), koskematon jos
//                       kenttää ei anneta.
//   virtaa:             VALINNAINEN, true/false (oletus false). true = EI
//                       pysähdy/katoa reunaan päästyään kuten tavallinen
//                       kertaylitys - aloittaa HETI uudelleen alusta,
//                       loputtomasti niin kauan kuin tämä pysähdys on
//                       aktiivinen ("until clicked to next" - Jarno). Katoaa
//                       silti HETI kun pysähdyksestä oikeasti poistutaan,
//                       ihan kuten kertaylityskin.
//   syvyys:             VALINNAINEN, Phaser-depth-luku (3.9.2026, Jarno
//                       "can you adjust dept of Nara?") - oletus 50 (kaikkien
//                       KOHTAUKSET-taustakerrosten, tyypillisesti depth
//                       0-~12, YLÄPUOLELLA, mutta ketun (100) ALAPUOLELLA).
//                       Pienempi luku = KAUEMPANA (esim. juuri sen kohtauksen
//                       OMAN kerroslistan pituutta pienempi arvo asettaa
//                       hahmon jonkin taustakerroksen TAAKSE, ks. Nera-
//                       esimerkki alla). Aiemmin kiinteä 50 kaikille,
//                       koskematon jos kenttää ei anneta.
//   aloitusViive:       VALINNAINEN, sekunteina (3.9.2026, Jarno "they could
//                       be more apart in beginning already" - sitten korjaus
//                       "They could still start appearing from right" kun
//                       ensimmäinen versio hyppäsi hahmon suoraan keskelle
//                       matkaa, ei ollut mitä Jarno halusi). Hahmo pysyy
//                       KOKONAAN piilossa `aloitusViive` sekuntia pysähdyksen
//                       aktivoitumisesta, ja aloittaa VASTA SITTEN normaalisti
//                       reunasta (EI hypy keskelle rataa) - eri alkiot siis
//                       ilmestyvät eri AIKOINA reunalta, eivät eri KOHDISTA
//                       radalla heti alussa. Eri kuin `maara`:n automaattinen
//                       vaiheistus (joka SIIRTÄÄ position taaksepäin - toimii
//                       hyvin jatkuvalle virralle kuten Nera-armeijalle, koska
//                       vain SAMAN alkion klooneja) - tällä voi antaa
//                       USEALLE ERI alkiolle (esim. eri hahmot) omat
//                       porrastetut ILMESTYMISAJAT.
//   osuma:              VALINNAINEN, { hetki, kipina, piilotaKupla } -
//                       4.9.2026, Jarno x:8940 "rocket... comes to shoot
//                       the bubble". `hetki` (PAKOLLINEN jos osuma annettu,
//                       0-1) on kohta LENNOSTA (ei millisekunteja - lennon
//                       pituus riippuu kesto:sta/ruudun koosta, joten
//                       suhteellinen kohta on ainoa joka pysyy oikeana
//                       kaikilla ruuduilla) jolloin efekti laukeaa kerran.
//                       `kipina` (VALINNAINEN) - kipinäpurskaus-konfiguraatio
//                       (ks. piirraKipina(), sama x/y/vari/kesto-muoto,
//                       x/y ovat RUUDUN suhteellisia 0-1-koordinaatteja).
//                       `piilotaKupla` (VALINNAINEN, true/false) - jos true,
//                       kutsuu piilotaKuplaPoksahtaen():ia (ks. #kupla:n
//                       kommentti) SAMALLA hetkellä - tarkoitettu KÄYTETTÄ-
//                       VÄKSI YHDESSÄ kipina-kentän kanssa (räjähdys +
//                       poksahdus samaan aikaan), mutta toimii itsenäisenä-
//                       kin. Laukeaa VAIN KERRAN per kierros (nollautuu
//                       automaattisesti jos `virtaa:true` ja ylitys alkaa
//                       uudelleen alusta).
// TAUSTAMUSIIKKI (8.10.2026): mobygratis "From Myself (inst mix)", lisenssi
// myönnetty 8.10.2026 (Jarnon sähköposti). Soi x:12990 "Meidän tehtävämme ei ole
// kilpailla..." -kohdasta Homo Ludensiin (x:13740) asti, hiljaa, fade in/out.
// Lähde näkyy Homo Ludensin lahde-rivillä ("mobygratis", EI Mobyn nimeä).
const TAUSTAMUSIIKIT = [
  // TF 16.10.2026: musiikki pois (Jarno: tallenne voi päätyä YouTubeen).
  // { alku: 4800, loppu: 5500, aani: 'Sounds/mobygratis-from-myself.mp3', voimakkuus: 0.25, fade: 2.5 },
];

const YLITYSHAHMOT = [
  // TF 15.10.2026 T-800 (Pohja x:1400, t800-walk.png, CatBYTE Studio / Sketchfab, CC BY 4.0):
  // x:2400 jahtaa kettua ja tyttöä (istutus: tumma siluetti, punainen silmä) ->
  // x:4840 "Same machine. New mission." sama kone kävelee hitaasti rinnalla, oikeissa väreissä, ei jahtaa.
  { x: 2400, spritesheet: 'assets/2d/sprites/t800-walk.png', kehysLeveys: 283, kehysKorkeus: 504, kehyksia: 16, ankkuriX: 0.495, ankkuriY: 0.988, pehmea: true, fps: 10, kesto: 9, korkeusProsentti: 0.42, yProsentti: 0.94, suunta: 1, aloitusViive: 1.5, virtaa: true, jahtaa: { etaisyys: 0.25, nopeus: 340 },
    siluetti: { vari: 0x2a3048 },
    silma: { vari: 0xff2a1a, koko: 0.07, pisteet: [[0.452,0.048],[0.411,0.060],[0.372,0.075],[0.345,0.087],[0.355,0.079],[0.394,0.067],[0.450,0.056],[0.503,0.048],[0.563,0.048],[0.602,0.048],[0.615,0.048],[0.612,0.048],[0.598,0.048],[0.545,0.048],[0.483,0.052],[0.448,0.052]] },
    askeleet: { ruudut: [0, 8], tarina: 0.004, vainEka: true, voimakkuus: 0.12 } },   // 18.10: hiljaisemmat askeleet (oli 0.35)
  { x: 4800, spritesheet: 'assets/2d/sprites/whale-swim.png', kehysLeveys: 489, kehysKorkeus: 179, kehyksia: 16, fps: 6, maara: 1, virtaa: true, kesto: 18, korkeusProsentti: 0.22, yProsentti: 0.5, suunta: 1, kasvotSuuntaan: 1 },   // TF: hiljainen hetki
  { x: 5300, spritesheet: 'assets/2d/sprites/whale-swim.png', kehysLeveys: 489, kehysKorkeus: 179, kehyksia: 16, fps: 6, maara: 1, virtaa: true, kesto: 18, korkeusProsentti: 0.22, yProsentti: 0.5, suunta: 1, kasvotSuuntaan: 1 },   // TF 15.10: loppukuva, valas silmukassa
];
