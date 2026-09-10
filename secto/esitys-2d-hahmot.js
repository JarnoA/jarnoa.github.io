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
  // "jarnocat" x:690 (esitys-data.js: "TÄHÄN VIDEO GENERATIVE" -paikkamerkki,
  // 4.9.2026 Jarno: "add one video..." sitten korjaus "video should be only
  // that one x" - siis EI maisemaosaa (näkyy jo kaukaa, jää viimeiseen
  // frameen näkyviin ohitettuaankin, ks. patsas alla) vaan SAMA kiintea:true
  // + video -mekanismi kuin Gemini-klipillä x:3690 (ks. sen kommentti) -
  // näkyy VAIN tällä yhdellä pysähdyksellä, ei ennen eikä jälkeen. EI siis
  // ekaFrame/viimeinenFrame/ankkuri/scrollFactor/syvyysSuhde - kiintea-video
  // ei käytä niitä (aina joko piilossa tai soi, ei koskaan "näkyvissä muttei
  // soi" -väliaikaa jota ne varten olisivat). puoli:'oikea' - vastakkainen
  // puoli kuin tämän pysähdyksen oma teksti (puoli:'vasen' esitys-data.js:ssä).
  // Jarnon oma ProRes4444-alpha-vienti (jarnocat.mov, 1920x1080,
  // yuva444p12le - todistettu aito alfakanava Pillow'lla), muunnettu
  // `ffmpeg -c:v libvpx-vp9 -pix_fmt yuva420p -c:a libopus`:lla (webm-kontin
  // `alpha_mode:1`-tagi vahvistettu).
  // jarnocat -> jarnocat2 (4.9.2026, Jarno: "just now realized that this
  // does not work to all audiences, so changed and made new video") - sama
  // pipeline/muunnos, uusi lähde (jarnocat2.mov, myös ProRes4444-alpha,
  // 6.16s - "alpha_mode:1" vahvistettu tälläkin).
  { x: 690, video: 'assets/2d/video/jarnocat2.webm', kiintea: true, puoli: 'oikea', pysty: 'ala', korkeusProsentti: 0.5, loop: false, aani: true },
  // Patsas "Onko tekoäly Jumala?" -kohdassa (x:860) - läpinäkyvä video,
  // Jarnon oma ProRes4444-alpha-FCPX-vienti, muunnettu WebM/VP9-alphaksi.
  // scrollFactor 0.6: selvästi hitaampi kuin kettu (1.0) - "kelluu"
  // maailmassa, tulee näkyviin oikealta AJOISSA ennen saapumista, mutta
  // silti täsmälleen keskellä juuri kun kettu on paikalla.
  {
    // siirtymaX:-55 (2.9.2026, Jarno: "video, 1290, now it is behind
    // trees, so can i move it litte bit there") - EI KOSKE x:ää (pysyy
    // 1290:ssä, TÄSMÄÄ esitys-data.js:n pysähdykseen "Tekoäly on jumala?").
    // BUGI löydetty ja korjattu SAMANA päivänä: ensimmäinen yritys muutti
    // suoraan x:n 1290->1235 - näytti oikealta visuaalisesti MUTTA hiljaa
    // rikkoi videon käynnistyksen (paivitaVideot() vertaa AINA suoraan
    // uusiPysahdys.x===h.x, ei enää täsmännyt, video ei käynnistynyt
    // ollenkaan). `siirtymaX` on UUSI, tähän tarkoitukseen rakennettu
    // kenttä (ks. esitys-2d.html:n worldX-laskennan kommentti) - pelkkä
    // visuaalinen sivuttaissiirto, EI vaikuta mihinkään laukaisuun. Arvo
    // -55 testattu/valittu selaimessa kokeilemalla useampi (-40, -55, +60)
    // ennen tätä - patsaan kasvot/vartalo väistävät puunrunkosiluetin.
    x: 1290,
    siirtymaX: -75,
    video: 'assets/2d/video/god-transparent-eng.webm',
    ekaFrame: 'assets/2d/video/god-transparent-eka-eng.png',
    viimeinenFrame: 'assets/2d/video/god-transparent-viimeinen-eng.png',
    korkeusProsentti: 0.55, scrollFactor: 0.6, yProsentti: 0.9, syvyysSuhde: 0.45, loop: false, aani: true
  },

  // Logokollaasi Jarnon nimen vieressä (x:61 = "Jarno Alastalo",
  // puoli:'vasen'/pysty:'keski' esitys-data.js:ssä) - KIINTEA, ei
  // maisemaosa: pitää näkyä VAIN tällä yhdellä pysähdyksellä, samaan tapaan
  // kuin nimiteksti itse, ei kelluen sisään Terminatorin tapaan. Sijoitettu
  // vastakkaiselle puolelle (oikea) samalle korkeudelle (keski) kuin nimi.
  { x: 92, kuva: 'kuvat/suomi24etc.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.70 },
  // syvyysSuhde:0.85 - metsäkohtauksessa (x:1365 osuu metsa-eder-muniz-
  // kohtaukseen, 9 kerrosta) tämä asettaa kuvan JUURI etummaisimman
  // kerroksen (Layer_0000_9.png, "puiden rungot + nurmi", indeksi 8/depth 8)
  // TAAKSE - 0.85*9=7.65 < 8. Testi Jarnon pyynnöstä 2.9.2026 ("how i
  // position it behind of scene elements, like ground?").
  { x: 1365, kuva: 'kuvat/mustalaatikkocover.png', kiintea: true, puoli: 'oikea', pysty: 'keski', korkeusProsentti: 1.0, pehmea: true, syvyysSuhde: 0.85 },
  { x: 2640, kuva: 'kuvat/ada.png', kiintea: true, puoli: 'oikea', pysty: 'ala', korkeusProsentti: 0.70, syvyysSuhde: 0.85  },
  { x: 2040, kuva: 'kuvat/evolution.png', kiintea: true, puoli: 'keski', pysty: 'ala', korkeusProsentti: 0.50 },
  { x: 855, kuva: 'kuvat/pesukone2.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.3 },
  { x: 5040, kuva: 'kuvat/otsikot.png', kiintea: true, puoli: 'vasen', pysty: 'keski', korkeusProsentti: 0.5 },
  { x: 6246, kuva: 'kuvat/ouro.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.5 },
  { x: 6540, kuva: 'kuvat/nursedoc.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.5 },
  // x:6541/6542 (payroll.png/amazon.png) KOMMENTOITU POIS 7.9.2026 - niiden
  // pariteksti (HR-esimerkki, Amazonin rekrytointialgoritmi) on kommentoitu
  // pois esitys-data.js:ssä tälle yleisölle, joten kuvat olivat orvoiksi
  // jääneitä, eivät koskaan voineet näkyä (audit löysi tämän). KORJATTU
  // 8.9.2026 (Jarno: "removed... not delete") - alun perin poistettu
  // kokonaan, palautettu kommentoituna samalla periaatteella kuin
  // tampella.png tällä samalla rivillä alempana; kuvatiedostot itsessään
  // eivät koskaan hävinneet kuvat/-kansiosta. Sama pari ON yhä aktiivinen
  // Zalariksessa ja SectoDesignissa - ei poistettu sieltä.
  // { x: 6541, kuva: 'kuvat/payroll.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.5 },
  // { x: 6542, kuva: 'kuvat/amazon.png', kiintea: true, puoli: 'keski', pysty: 'ala', korkeusProsentti: 0.5, syvyysSuhde: 0.55  },
  { x: 6843, kuva: 'kuvat/nursediv.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.5 },
  { x: 8490, kuva: 'kuvat/burger.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.5 },
  { x: 8499, kuva: 'kuvat/elias.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.5 },
    { x: 7740, kuva: 'kuvat/trump.png', kiintea: true, puoli: 'keski', pysty: 'ala', korkeusProsentti: 0.5, syvyysSuhde: 0.45  },

  // TAITEILIJAJÄRJESTÖT-lisäys 7.9.2026 - kuvat Jarnon itse pudottamiin
  // kuvat/-kansion tiedostoihin, vastaparina esitys-data.js:n CLAUDE HUOM
  // -merkittyyn kohtaan (x:11481-11489, ks. sen oma kommentti - kaikki
  // Google Docsin sisältö samassa kohdassa dokumentin omassa järjestyksessä).
  // puoli vastakkainen tekstin puolelle, sama käytäntö kuin muuallakin.
  { x: 11470, kuva: 'kuvat/glaze.png', kiintea: true, puoli: 'oikea', pysty: 'keski', korkeusProsentti: 0.4 },
  { x: 11484, kuva: 'kuvat/ollama.png', kiintea: true, puoli: 'oikea', pysty: 'keski', korkeusProsentti: 0.4 },
  { x: 11486, kuva: 'kuvat/notebook.png', kiintea: true, puoli: 'vasen', pysty: 'keski', korkeusProsentti: 0.4 },

  // "Omat esimerkit" -osio (Google Docs "TEEMA1: omat esimerkit"), x:110/180/210
  // - ks. vastaava esitys-data.js-lisäys samoihin x-arvoihin. purkutaide.mp4
  // on jo H.264+AAC (Jarnon oma vienti) - ei tarvitse webm-muunnosta kuten
  // ProRes-lähteet muualla projektissa, kelpaa suoraan <video>-elementille.
  { x: 11360, video: 'assets/2d/video/purkutaide.mp4', kiintea: true, puoli: 'oikea', pysty: 'keski', korkeusProsentti: 0.65, loop: false, aani: true },
  { x: 11425, kuva: 'kuvat/linkedin.png', kiintea: true, puoli: 'keski', pysty: 'ala', korkeusProsentti: 0.65 },
  { x: 11430, kuva: 'kuvat/aikirjakansi.png', kiintea: true, puoli: 'vasen', pysty: 'keski', korkeusProsentti: 0.7 },
  { x: 8509, kuva: 'kuvat/mano.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.5 },
  { x: 10591, kuva: 'kuvat/muffins.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.5 },
  // aaniraita (6.9.2026) - Neil Lawrence, "ihmisen antama huomio tulee
  // olemaan niukka resurssi..." ääneen luettuna, pptx-dia 119. Pelkkä
  // ääniraita, ei omaa kuvaa/videota.
  { x: 12240, aaniraita: 'Sounds/huomio_eng.wav' },
  // aaniraita (6.9.2026) - "HITAUS!" ääneen luettuna, pptx-dia 122 - liitetty
  // JO OLEMASSA OLEVAAN slow.png-kiintea-kuvaan, ei uutta erillistä alkiota.
    { x: 12690, kuva: 'kuvat/slow.png', kiintea: true, puoli: 'keski', pysty: 'ala', korkeusProsentti: 0.5, syvyysSuhde: 0.35, aaniraita: 'Sounds/hitaus_eng.wav'  },
    { x: 9460, kuva: 'kuvat/africa.png', kiintea: true, puoli: 'vasen', pysty: 'yla', korkeusProsentti: 0.82, syvyysSuhde: 0.01, },
    

        { x: 7760, kuva: 'kuvat/trumpsome.png', kiintea: true, puoli: 'vasen', pysty: 'yla', korkeusProsentti: 0.82, syvyysSuhde: 0.81, },


                { x: 11487, kuva: 'kuvat/notebook2.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.8, syvyysSuhde: 0.81, },


 { x: 11441, kuva: 'kuvat/kansirakenne.png', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.8, syvyysSuhde: 0.81, },


  //{ x: 5190, kuva: 'kuvat/books2.png', kiintea: true, puoli: 'vasen', pysty: 'ala', korkeusProsentti: 0.3, syvyysSuhde: 0.85 },

  // Ada Lovelace -sitaatti (x:1760 esitys-data.js:ssä, "Analyyttisellä
  // koneella ei ole..." - lahde:'Ada Lovelace, 1815-1852') - ääneen luettu
  // versio sitaatista. EI VIELÄ MUOTOKUVAA - Jarno lisää sen itse kun on
  // valmis, esim. `kuva:'kuvat/ada-lovelace.png', kiintea:true, puoli:...,
  // pysty:..., korkeusProsentti:...` (ks. yllä oleva kiintea-kuvan ohje) -
  // `aaniraita` toimii sellaisenaan riippumatta lisätäänkö kuvaa vai ei.
  { x: 1300, aaniraita: 'Sounds/neillawrence_eng.wav' },
  { x: 2630, aaniraita: 'Sounds/ada_eng.wav' },
  // aaniraita (9.9.2026) - Anna-Mari Wallenberg -sitaatti ("Humans have been
  // forced to constantly step back...") ääneen luettuna.
  { x: 3540, aaniraita: 'Sounds/3540humanshave.wav' },


  // Loki - tekstitön "vain katso hahmoa" -pysähdys (x:910 alkuperäisessä
  // skaalassa, x:1365 nyt 1.5x-levennyksen jälkeen, ei otsikkoa/tekstiä -
  // alkuperäinen suunnitelma jo ensimmäisestä 2D-pivotista asti, ks.
  // muistio "Prototyypin kattama alue: x:760-1360"). Terminator EI enää
  // tähän samaan "maisemaan kelluva jättihahmo" -kaavaan (liikaa yhdellä
  // ruudulla Jumala-patsaan kanssa, Jarnon pyyntö 1.9.2026) - ks. sen sijaan
  // YLITYSHAHMOT alempana.

  // "CREATION OF ADAM" -HOMMAGE (2.9.2026, Jarnon idea) - x:1890 osuu
  // pysähdykseen "Ihminen on antanut 'elämän' tietokoneelle, joka haastaa
  // ajatuksen, että olemme kaiken keskiössä" - suora Michelangelo-viittaus.
  // KIINTEÄ (EI maisemaosa) koska Jarno halusi "appear right when entering
  // to this, then disapper when clicked elsewhere" - sama käytös kuin
  // tekstillä, ei mitään maailmaan jäävää/kelluvaa. Kaksi ERI kuvaa (ei
  // yhtä yhdistelmäkuvaa) - adam.png (robotti, käsi ojennettu OIKEALLE
  // kuvan reunaa kohti) + god.png (jumala, käsi ojennettu VASEMMALLE) -
  // molemmat rakennettu niin että kädet osuvat lähelle toisiaan kun
  // molemmat asetetaan vastakkaisille reunoille. puoli:'vasen'/'oikea'
  // (EI 'keski') juuri tästä syystä - origin osuu kuvan omaan reunaan,
  // jolloin kuva "kasvaa" ruudun KESKELLE PÄIN sieltä, ei karkaa keskeltä
  // poispäin. pehmea:true (hieno viivapiirros, sama syy kuin musta
  // laatikko -kansi).
  // korkeusProsentti:0.42 testattu/valittu selaimessa (0.6 aiheutti liikaa
  // päällekkäisyyttä, hahmot ajautuivat toistensa päälle eikä kädet
  // erottuneet selvästi - 0.42 antaa puhtaan "sormet melkein koskettavat"
  // -asettelun kummankin ollessa täysin näkyvissä).
  // LIUKU + KIPINÄ lisätty 2.9.2026 (Jarno: "adam flies from left to right
  // and god from right to left and their hand touchec, spark") - adam
  // liukuu sisään VASEMMALTA (siis liikkuu vasemmalta oikealle kohti
  // lopullista paikkaansa), god OIKEALTA (liikkuu oikealta vasemmalle).
  // Sama liukuKesto (1200ms) MOLEMMILLE -> saapuvat maaliin TÄSMÄLLEEN
  // samaan aikaan vaikka matka on eri pituinen (Phaser-tween interpoloi
  // AJASSA, ei nopeudessa). kipina VAIN adam-rivillä (ei molemmilla, ettei
  // laukea kahdesti).
  //
  // KORJATTU 2.9.2026 (Jarno: "can you see that adm png right part would
  // touc god png left side? to imbosislbe?" + näytti kuvakaappauksen
  // OIKEASTA, leveästä ruudusta jossa kädet eivät edes lähelle osuneet) -
  // puoli:'vasen'/'oikea' EI KELVANNUT tähän: se käyttää kiinteää 6%
  // marginaalia ruudun LEVEYDESTÄ, mutta kuva skaalautuu korkeudesta -
  // leveällä esitysruudulla marginaalien väli kasvaa paljon nopeammin kuin
  // kuvien koko, kädet jäivät kauas toisistaan (toimi vain kapeassa
  // testi-ikkunassa sattumalta). KÄYTETÄÄN SEN SIJAAN kohdistusX/Y +
  // paikallinenX/Y (ks. esitys-2d.html:n laskeKiinteaSijainti()) - AIDOSTI
  // ruutusuhteesta riippumaton: paikallinenX/Y = MITATTU käden kärjen
  // paikka KUVAN OMASSA 0-1-skaalassa (Pillow'lla, alpha-kanavasta: adam
  // 1269/1273=0.997, 455.6/1321=0.345; god 7/1684=0.004, 532.3/1205=0.442),
  // kohdistusX/Y = SAMA ruudun kohta (0.5, 0.44) MOLEMMILLE - kädet
  // kohtaavat AINA täsmälleen siinä, millä tahansa ruutukoolla/-suhteella.
  { x: 1890, kuva: 'kuvat/adam.png', kiintea: true, kohdistusX: 0.5, kohdistusY: 0.44, paikallinenX: 0.997, paikallinenY: 0.345, korkeusProsentti: 0.42, pehmea: true, liukuSuunta: 'vasen', liukuKesto: 1200, kipina: { x: 0.5, y: 0.44 } },
  { x: 1890, kuva: 'kuvat/god.png', kiintea: true, kohdistusX: 0.5, kohdistusY: 0.44, paikallinenX: 0.004, paikallinenY: 0.442, korkeusProsentti: 0.42, pehmea: true, liukuSuunta: 'oikea', liukuKesto: 1200 },

  // mittakaava -> korkeusProsentti 3.9.2026 (Jarno: näytti kaksi kuvakaappausta
  // SAMASTA pysähdyksestä (MacBook vs. ulkoinen näyttö) - Da Vinci ja
  // robottisiluetti sekä ERI KOKOISIA ETTÄ ERI PAIKASSA, robotti EI näy
  // ollenkaan toisella näytöllä. SAMA juurisyy kuin linnan "too small" -bugi
  // aiemmin: mittakaava on AINA sama pikselimäärä RIIPPUMATTA ruudun koosta
  // (ks. esitys-2d.html:n kuva-haaran iso kommentti), JA koska worldX
  // (laskeParallaksiX) riippuu MYÖS ruudun leveydestä, väärä koko + väärä
  // sijainti yhdistyvät - täsmälleen se mitä kuvissa näkyi. Arvot mitattu
  // suoraan 1920x1080-näytöltä (nykyinen todellinen näytettu korkeus/
  // ruudun korkeus), jotta koko pysyy SAMANA kuin ennen sillä näytöllä,
  // mutta on nyt VAKIO millä tahansa näytöllä.
  // aaniraita (6.9.2026) - "Sokrates varoitti..." ääneen luettuna, poimittu
  // alkuperäisestä Zalaris_esitys.pptx:stä (dia 28), ks. Sounds/-kansion
  // AANIRAITA-dokumentaation esimerkki tämän tiedoston alussa.
  { x: 2190, kuva: 'kuvat/sokrates.png', korkeusProsentti: 0.74, scrollFactor: 2.1, syvyysSuhde: 0.45, yProsentti: 0.5, ankkuri: { x: 0.5, y: 0.0 }, aaniraita: 'Sounds/sokrates_en.wav' },
  { x: 2190, kuva: 'kuvat/robotsihlouette2.png', korkeusProsentti: 0.73, scrollFactor: 1.1, syvyysSuhde: 0.44, yProsentti: 0.5, ankkuri: { x: 0.0, y: 0.2 } },
  { x: 2790, kuva: 'kuvat/davinci.png', korkeusProsentti: 0.4, scrollFactor: 2.1, syvyysSuhde: 0.85, yProsentti: 0.4, ankkuri: { x: 0.0, y: -0.3 } },
  { x: 3840, kuva: 'kuvat/gpscar2.png', korkeusProsentti: 0.23, scrollFactor: 0.55, syvyysSuhde: 0.65, yProsentti: 0.6, ankkuri: { x: 0.0, y: -0.3 }, vainKohtaus: 'linna-eder-3' },
  { x: 4140, kuva: 'kuvat/robots.png', korkeusProsentti: 0.53, scrollFactor: 1.0, syvyysSuhde: 0.15, yProsentti: 0.1, ankkuri: { x: 0.0, y: -0.3 } },
  { x: 5190, kuva: 'kuvat/mirror2.png', korkeusProsentti: 0.7, scrollFactor: 3.2, syvyysSuhde: 0.65, yProsentti: 0.2, ankkuri: { x: 0.6, y: -0.1 } },
  // aaniraita (6.9.2026) - "Digitaaliset oligargit" ääneen luettuna, pptx-dia 70.
  { x: 7290, kuva: 'kuvat/olig.png', korkeusProsentti: 0.72, scrollFactor: 1.5, syvyysSuhde: 0.45, yProsentti: 0.30, ankkuri: { x: 0.5, y: 0.0 }, aaniraita: 'Sounds/oligarkit.mp3' },
  // aaniraita (6.9.2026) - Neil Lawrence, "manipulointi on jo todellisuutta"
  // ääneen luettuna, pptx-dia 71. Pelkkä ääniraita, ei omaa kuvaa/videota.
  { x: 7440, aaniraita: 'Sounds/manipulointi_eng.wav' },
  { x: 7890, kuva: 'Backrounds/Pixel Art Castle background/PNG/Background 3/9-castle.png', korkeusProsentti: 0.92, scrollFactor: 1.8, syvyysSuhde: 0.45, yProsentti: 0.20, ankkuri: { x: 0.3, y: -0.0 } },
  { x: 8340, kuva: 'kuvat/storm.png', korkeusProsentti: 0.62, scrollFactor: 1.0, syvyysSuhde: 0.15, yProsentti: 0.30, ankkuri: { x: 0.5, y: 0.0 } },
   { x: 8340, kuva: 'kuvat/stormp.png', korkeusProsentti: 0.32, scrollFactor: 1.1, syvyysSuhde: 0.14, yProsentti: 0.0, ankkuri: { x: 0.5, y: 0.0 } },
  // aaniraita (6.9.2026) - Niina Junttila, sosiaalinen media -sitaatti
  // ääneen luettuna, pptx-dia 83. Pelkkä ääniraita, ei omaa kuvaa/videota.
  { x: 8790, aaniraita: 'Sounds/niinajunttila_eng.wav' },

    { x: 9350, kuva: 'kuvat/gilgamesh.png', korkeusProsentti: 0.7, scrollFactor: 3.2, syvyysSuhde: 0.35, yProsentti: 0.2, ankkuri: { x: 0.6, y: -0.1 } },

    { x: 7740, kuva: 'kuvat/whouse.png', korkeusProsentti: 0.7, scrollFactor: 3.2, syvyysSuhde: 0.35, yProsentti: 0.2, ankkuri: { x: 0.6, y: -0.1 } },




  // Gemini-video (3.9.2026, Jarno: "lets ad video ... to { x: 3690,
  // otsikko:'Hei Gemini, minkälaista on olla kielimalli?'" - sitten
  // korjaus "this shoudl be one time, not paraller"). EI siis maisemaan
  // sulautuva parallaksi-hahmo (kuten patsas x:860) vaan kiintea:true -
  // sama "näkyy VAIN tällä yhdellä pysähdyksellä, ruutuun sidottu"
  // -mekanismi kuin kiintea-kuvilla (ks. tiedoston alun kohta 3 ja
  // esitys-2d.html:n uusi kiintea+video-haara). EI ekaFrame/viimeinenFrame -
  // niitä ei tässä haarassa tarvita (video on aina joko piilossa tai soi,
  // ei koskaan "näkyvissä muttei vielä soi" -väliaikaa).
  { x: 3690, video: 'assets/2d/video/media3.mp4-0.0000-20.9590.mp4', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.45, loop: false, aani: true },

  // LINNA - KOKO LOHKO UUSIKSI 2.9.2026 (ks. esitys-2d-kohtaukset.js:n ison
  // "KOKO RAKENNE UUSIKSI" -kommentin yhteenveto - Jarno jakoi koko pakan
  // 7 eri linnaan yhdeksi yhtenäiseksi pätkäksi, ks. sen kommentti). x tähän
  // kunkin linna-osion KESKIKOHTA (ei täsmälleen sama kuin PYSAHDYKSET-
  // pysähdys, ei tarvitse olla - hahmo asettuu ruudun keskelle JUURI kun
  // kettu saapuu tähän x:ään). vainKohtaus PAKOLLINEN kaikille - monta
  // linnaa lähekkäin, ilman tätä ne näkyisivät päällekkäin.
  //
  // OIKEA KAAVA LÖYDETTY 2.9.2026 (Jarno: "it is flying, not in ground",
  // sitten kun tämäkin osoittautui vielä vääräksi lähestymistavaksi:
  // "are you able to compare preview provided byt artists and this" - ks.
  // esitys-2d-kohtaukset.js:n iso kommentti TÄYDELLE johdolle). LYHYESTI:
  // koska jokainen linna-PNG on AINA sama 512x256-kehys kuin muutkin tämän
  // pakan kerrokset, ja KAIKKI kerrokset (scrollFactorista riippumatta)
  // ankkuroituvat identtisellä kaavalla ruutuun (rakennaTausta()/
  // sovitaTaustatRuutuun(), ks. esitys-2d.html), MIKÄ TAHANSA piste kehyksen
  // sisällä (f, mitattu Pillow'lla alfabbox:sta, 0=kehyksen yläreuna,
  // 1=alareuna) osuu AINA oikeaan ruudun kohtaan kaavalla:
  //   yProsentti(f) = 1 - taustaKorkeusSuhde*1.45*(1-f)
  // Tälle pakalle taustaKorkeusSuhde=0.62 -> kerroin 0.62*1.45=0.899 KIINTEÄ
  // VAKIO - EI arvattu (vrt. VANHAT arvailut mittakaava:1.2 ->
  // korkeusProsentti 0.38 -> 0.55, jotka KAIKKI olivat väärässä
  // koordinaatistossa, siksi Jarnon toistuvat "too small"/"floating"-
  // huomiot - oikea 0.899 on lähes 2x isompi kuin viimeisinkin arvailu).
  // SAMA korkeusProsentti:0.899 pätee JOKAISELLE tämän pakan hahmolle alla
  // (kaikki jakavat saman 512x256-kehyksen/taustaKorkeusSuhteen), vain
  // ankkuri.y (= mitattu f) ja yProsentti (=yProsentti(f)) vaihtelevat per
  // kuva sen mukaan MISSÄ KOHTAA kehystä sen oma sisältö sijaitsee.
  //
  // Kolmella (1/2/3) on kehyksen sisällä ISOLOITU "hero"-linnaelementti
  // (irrotettu KOHTAUKSET-kerroksista, ks. sen kommentti) - loput 4
  // (day/sunset/night/muut) käyttävät kaikki normikerroksia, paitsi
  // day/sunset/night joilla on OMA erillinen 13-castle.png-hahmo (sama
  // "isoloitu hero" -tunnistus, alun perin löydetty 1.9.2026).
  // scrollFactor -> lukitseKerrokseen 3.9.2026 (Jarno: "still catle moves in
  // different phase!!!!!" - PALJASTI ISOMMAN BUGIN: sama scrollFactor-LUKU
  // (0.60==0.60) EI tarkoita samaa ruutunopeutta TileSpritelle ja Imagelle,
  // ks. laskeLukittuScrollFactor():n iso kommentti esitys-2d.html:ssä -
  // mitattu suoraan pelissä 3.2x ero. `lukitseKerrokseen:'15.png'` laskee
  // OIKEAN, ruutukorkeuden-tietoisen kertoimen ajonaikaisesti sen sijaan
  // että kirjoittaisi (väärän) kiinteän luvun dataan.
  //
  // syvyysSuhde 0.5625 -> 0.5208 3.9.2026 (Jarno: "castle on most cases
  // should be one layer back, it is now over the village gottages"). 0.5625
  // (depth 13.5/24) oli VIELÄ 14-houses.png:n (idx 13) EDESSÄ - vain 15.png:
  // n (idx 14) takana, ei riittänyt. OIVALLUS: linna OLI alunperin nimeltään
  // "13-castle.png", eli sen oma alkuperäinen paikka oli TARKALLEEN 12-
  // houses.png:n (12) ja 14-houses.png:n (14) VÄLISSÄ - palautettu tähän
  // omaan alkuperäiseen syvyyteensä (depth 12.5/24 = 0.5208) sen sijaan että
  // yritettäisiin arvata jokin muu väli. HUOM: syvyys (piirtojärjestys,
  // MIKÄ peittää minkäkin) ja scrollFactor (ruutunopeus, "mihin se on
  // lukittu") ovat KAKSI ERI ASIAA - linna voi olla lukittu 15.png:n
  // nopeuteen mutta silti piirtyä eri kohdassa pinoa kuin 15.png.
  { x: 4365, kuva: 'Backrounds/Pixel Art Castle background/PNG/Background 4/13-castle.png', korkeusProsentti: 1.0, lukitseKerrokseen: '15.png', syvyysSuhde: 0.5208, yProsentti: 0.8047, ankkuri: { x: 0.5, y: 0.8047 }, vainKohtaus: 'linna-eder-day' },
  { x: 4890, kuva: 'Backrounds/Pixel Art Castle background/PNG/Background 4 - sunset/13-castle.png', korkeusProsentti: 1.0, lukitseKerrokseen: '15.png', syvyysSuhde: 0.5208, yProsentti: 0.8047, ankkuri: { x: 0.5, y: 0.8047 }, vainKohtaus: 'linna-eder-sunset' },
  { x: 5640, kuva: 'Backrounds/Pixel Art Castle background/PNG/Background 4 - night/13-castle.png', korkeusProsentti: 1.0, lukitseKerrokseen: '15.png', syvyysSuhde: 0.5208, yProsentti: 0.8047, ankkuri: { x: 0.5, y: 0.8047 }, vainKohtaus: 'linna-eder-night' },

  // linna-eder-2 (Background 2, x:2940): linna LEIJUU pilvisaarella - EI
  // "ground contact" -tapaus kuten muut, koska alkuperäisessäkin taide-
  // teoksessa linna ei kosketa mitään pohjaa - siksi yProsentti tulee
  // SUORAAN samasta yProsentti(f)-kaavasta mutta f on tässä vain "missä se
  // sattuu kehyksessä olemaan", ei minkään "jalustan" mittaus. 3 tiedostoa
  // = 1 klusteri (itse linna + 2 pilvikerrosta sen ympärillä/alla), sama
  // scrollFactor kaikilla jottei klusteri "revi" erilleen vieritettäessä -
  // syvyysSuhde erottaa piirtojärjestyksen (pilvet taakse, linna eteen).
  { x: 3465, kuva: 'Backrounds/Pixel Art Castle background/PNG/Background 2/3-castle-cloud-2.png', korkeusProsentti: 1.0, scrollFactor: 0.209, syvyysSuhde: 0.20, yProsentti: 0.543, ankkuri: { x: 0.5, y: 0.543 }, vainKohtaus: 'linna-eder-2' },
  { x: 3465, kuva: 'Backrounds/Pixel Art Castle background/PNG/Background 2/3-castle-cloud.png', korkeusProsentti: 1.0, scrollFactor: 0.209, syvyysSuhde: 0.21, yProsentti: 0.5547, ankkuri: { x: 0.5, y: 0.5547 }, vainKohtaus: 'linna-eder-2' },
  { x: 3465, kuva: 'Backrounds/Pixel Art Castle background/PNG/Background 2/3-castle.png', korkeusProsentti: 1.0, scrollFactor: 0.209, syvyysSuhde: 0.22, yProsentti: 0.5273, ankkuri: { x: 0.5, y: 0.5273 }, vainKohtaus: 'linna-eder-2' },

  // linna-eder-3 (Background 3, x:3540): linna + oma peilikuva vedessä
  // (9-castle-reflection.png) - reflection hieman himmeämpänä (alpha 0.7,
  // vettä rikkovan pinnan tuntu) ja SYVYYDESSÄ linnan takana/alla.
  // scrollFactor 0.372 -> 0.445 3.9.2026 (Jarno: "Castle is on landscpae,
  // but it moves faster that ground layer it is fitterd"). 0.372 oli
  // linnan OMAN alkuperäisen numerojärjestyksen (idx 9/24) interpoloitu
  // arvo - EI minkään NÄKYVÄN maastokerroksen arvo. Katsottu jokainen
  // naapurikerros kuvana: "11.png" (scrollFactor 0.445) on YKSI selkeä
  // niemekekuvio joka TÄSMÄLLEEN vastaa linnan omaa jalustaa esikatselu-
  // kuvassa (ei mikä tahansa maastokaista - juuri SE niemi jolla linna
  // seisoo) - linna lukittu nyt TÄSMÄLLEEN samaan scrollFactoriin ettei
  // eroa synny vieritettäessä.
  // syvyysSuhde 0.45/0.46 -> 0.30/0.31 3.9.2026 (Jarno: "castle is on wrong
  // layer, it should be behind if 11.png and locked to that"). syvyys =
  // syvyysSuhde * kerrokset.length (ks. esitys-2d.html) - linna-eder-3:n
  // kerrokset.length on 31, ja "11.png" itse istuu TAULUKKOINDEKSISSÄ 10
  // (laskettu suoraan, EI tiedostonimen numerosta - "1.png" poistettu
  // taivaskokeilussa, ks. sen kommentti, joten kaikki indeksit siirtyivät
  // yhdellä alaspäin). VANHA 0.45/0.46 * 31 = ~14/14.3 - SELVÄSTI 11.png:n
  // (10) EDESSÄ, väärä suunta. Uusi 0.30/0.31 * 31 = ~9.3/9.6 - juuri
  // 11.png:n (10) TAKANA, "11-reflection.png":n (9) edessä.
  // scrollFactor -> lukitseKerrokseen 3.9.2026 (sama 3.2x-bugi kuin day/
  // sunset/night, ks. niiden kommentti ja laskeLukittuScrollFactor()).
  { x: 3990, kuva: 'Backrounds/Pixel Art Castle background/PNG/Background 3/9-castle-reflection.png', korkeusProsentti: 1.0, lukitseKerrokseen: '11.png', syvyysSuhde: 0.30, yProsentti: 0.918, ankkuri: { x: 0.5, y: 0.918 }, alpha: 0.7, vainKohtaus: 'linna-eder-3' },
  { x: 3990, kuva: 'Backrounds/Pixel Art Castle background/PNG/Background 3/9-castle.png', korkeusProsentti: 1.0, lukitseKerrokseen: '11.png', syvyysSuhde: 0.31, yProsentti: 0.7109, ankkuri: { x: 0.5, y: 0.7109 }, vainKohtaus: 'linna-eder-3' },

  // NERA-ARMEIJA - TESTI 1/N (3.9.2026, Jarno x:6990 Pravda-propaganda-
  // pysähdys: "there could be running many small Neras same level as fox,
  // like army, some can be other distance on scene, smaller" - "make test
  // one and then we see how it works"). nera-run.png = koottu 8-ruutuinen
  // juoksusykli, ks. assets/2d/sprites/nera-run.png:n kommentti sen omassa
  // kansiossa/README:ssä miten se syntyi (leg_run+torso_run -kehykset
  // yhdistetty Pillow'lla, alkuperäinen "Nera Sprite Pack" - poohcom1,
  // kaikki taistelu-/vaihtoehto-osat jätetty käyttämättä, ei tarvita tähän).
  // YKSI testikappale ensin - ei vielä "armeija", Jarno tarkistaa ulkonäön
  // ennen kuin kopioidaan useaksi eri etäisyydelle/kooltaan.
  {
    x: 6990,
    spritesheet: 'assets/2d/sprites/nera-run.png',
    kehysLeveys: 50, kehysKorkeus: 50, kehyksia: 8, fps: 10,
    korkeusProsentti: 0.15, // "same level as fox" - karkea arvio, Jarno säätää
    yProsentti: 0.92,
    ankkuri: { x: 0.5, y: 1 }, // mitattu Pillow'lla: jalat AIVAN kehyksen alareunassa
    scrollFactor: 1.0,
    syvyysSuhde: 0.65,
  },

  // LOHIKÄÄRME (4.9.2026, Jarno x:10290 "Lukija elää tuhat elämää..." -
  // sitaatti, George R. R. Martin - Lohikäärmetanssi): "dragon on sky...
  // it can be part of scene also after far on sky. dragon is same format
  // as fox was at the beginning... there is flying and iddle, combine
  // those". dragon.glb:ssä oli vain KAKSI klippiä (EI erillistä "Idle"-
  // nimistä), Fly_Glide (2s, siivet kasaan vedettynä, rauhallinen liito -
  // tätä käytetty "idle"-osana) ja Fly_Flap (0.75s, selvä siipien-isku-
  // sykli) - "combine" tehty YHDEKSI 14-ruutuiseksi liuskaksi: ruudut 0-5
  // Fly_Glide (6 näytettä), ruudut 6-13 Fly_Flap (8 näytettä), samaan
  // tapaan kuin ketun kävelysykli aikoinaan (test-dragon-render.html,
  // Three.js + GLTFLoader + AnimationMixer, sivuprofiili-ortokamera,
  // toisin kuin kettu EI silhuetti vaan sama oikeasti valaistu render).
  // EI kiintea:true - Jarnon "part of scene also after" tarkoittaa että
  // lohikäärme pysyy taivaalla NÄKYVISSÄ PITKÄN matkan (ei vain yhdellä
  // pysähdyksellä) - siis maailmaan ankkuroitu spritesheet-kerros (sama
  // "savu, mainostaulu, ..." -mekanismi kuin Nera-armeijalla yllä), MATALA
  // scrollFactor (0.15, sama luokka kuin taivaan pilvikerroksilla muualla
  // tässä tiedostossa) saa sen "kellumaan" ruudulla hitaasti pitkän
  // pysähdysvälin ajan ketun kävellessä ohi, EI vain yhdellä x:llä.
  {
    x: 10290,
    spritesheet: 'assets/2d/sprites/dragon-fly.png',
    kehysLeveys: 325, kehysKorkeus: 363, kehyksia: 14, fps: 10,
    korkeusProsentti: 0.18,
    yProsentti: 0.07, // AIVAN taivaan ylälaidassa - x:10290:n sitaattiteksti on
    // keskitetty ja LEVEÄ (puoli:'keski'), joten mikään vaakasijainti ei
    // väisty sen alta - siksi väistö tehty PYSTYSSÄ, mahdollisimman ylös
    // otsikkorivin yläpuolelle sen sijaan.
    ankkuri: { x: 0.5, y: 0.5 },
    scrollFactor: 0.55, // "far on sky" - liikkuu ruudulla HITAASTI, pysyy näkyvissä pitkään
    syvyysSuhde: 0.18, // kaukana takana, samaa luokkaa kuin pilvikerrokset
  },

  // TAMPELLAN TEHDAS (6.9.2026, x:11417 "Sähkömoottori-paradoksi" -pysähdys,
  // ks. esitys-data.js: "Kun tehtaat siirtyivät höyrystä sähköön, tuottavuus
  // ei aluksi noussut lainkaan..."). Jarno: "make silhoutte of Tampere
  // Tampella factory..., like some windows and light goes of, it should be
  // part of backround on there". Jarno toimitti Geminillä tehdyn tehdaskuvan
  // (Downloads/Gemini_Generated_Image_3q4bfb....jpeg, sahalaitakattoinen
  // tiilitehdas + savupiippu, 7 riviikkunaa) - muunnettu SILUETIKSI Python/
  // PIL:llä: koko rakennus yhtenä tummana muotona, PAITSI 7 ikkunan
  // lasiruudut (tunnistettu väripohjaisesti alkuperäisestä kuvasta) jotka
  // pysyvät omana, vaihdettavana kerroksenaan - 8 kehystä, joissa eri osajoukko
  // ikkunoista palaa (lämmin keltainen) ja loput ovat sammuksissa (kylmä
  // tummansininen lasi) - "windows and light goes of" -pyyntö toteutettu
  // valmiiksi leivottuna kehyssarjana, EI per-ikkuna-spritejä (ei
  // moottorikoodimuutosta - sama kiintea:true-TYYPPINEN spritesheet-
  // silmukka kuin Mikillä/lohikäärmeellä, mutta EI kiintea - Jarnon "part of
  // backround" tarkoittaa maailmaan ankkuroitu, ei ruutuun sidottu).
  // fps erittäin hidas (0.2 = 5s/kehys, koko 8 kehyksen sykli ~40s) -
  // rauhallinen ajoittainen välke, ei nopea animaatio. scrollFactor/
  // syvyysSuhde asetettu samaan luokkaan kuin tämän kohtauksen
  // "5-middleground-buildings.png"-kerros (ks. esitys-2d-kohtaukset.js,
  // kaupunki-eder-cars) - liikkuu ruudulla samaa tahtia kuin muutkin
  // taustarakennukset, piirtyy niiden edessä mutta katukerroksen/autojen
  // TAKANA. Pysähdyksellä on kortti:true (ks. esitys-data.js) eli teksti saa
  // oman laatikkotaustansa - tehdas voi siis olla vapaasti sen takana/
  // ympärillä ilman luettavuusongelmaa.
  // vainPysahdys (6.9.2026, Jarno: "this will be shown only one one slide
  // 'Sähkömoottori paradoksi'") - näkyy VAIN täsmälleen tällä pysähdyksellä
  // (x:11417), ei koko kaupunki-eder-cars-kohtauksen muilla pysähdyksillä,
  // MUTTA säilyttää täyden maailma-/parallaksisijainnin (EI kiintea:true,
  // joka olisi ruutuun sidottu) - ks. esitys-2d.html:n paivitaVainPysahdys-
  // Kuvat()-kommentti, sama mekanismi kuin torninilla (x:6390) oli jo.
  // KOMMENTOITU POIS 7.9.2026 - pariteksti (x:11417 "Sähkömoottori-paradoksi")
  // ei kuulu taiteilijayleisölle (Jarno: "it is not part of artist"), audit
  // löysi tämän orpona jääneenä. Sama kuva ON yhä aktiivinen Zalariksessa ja
  // SectoDesignissa - EI poistettu sieltä.
  // {
  //   x: 11417,
  //   spritesheet: 'assets/2d/sprites/tampella.png',
  //   kehysLeveys: 772, kehysKorkeus: 433, kehyksia: 8, fps: 0.2,
  //   korkeusProsentti: 0.38,
  //   yProsentti: 0.96,
  //   scrollFactor: 0.50,
  //   syvyysSuhde: 0.45,
  //   vainPysahdys: 11417,
  // },

  // FELLOWSHIP-KÄVELY (3.9.2026, Jarno x:7890 "Palantir · Mithril · Lembas
  // · Anduril" / muistiinpanot "Peter Thiel.": "What they can do? Walk in
  // backround forest? Slowly from right to left. like fellowship." - KORVAA
  // aiemman yksittäisen seisovan Frodo-testin, ks. YLITYSHAHMOT-taulukon
  // lopun 5 uutta alkiota (frodo/sam/merry/pippin/legolas-walk-left.png).
  // Nämä ovat RUUTU-tason YLITYSHAHMOT-hahmoja (ei HAHMOKERROKSET-tyyppisiä
  // kuten alla), ei siis mitään tähän itse pysähdykseen enää tässä
  // kohdassa - ks. tiedoston loppu.

  // "MIKKI" TAIKOMASSA (4.9.2026, Jarno x:4141 "Olemme kaikki Mikkejä"
  // -pysähdys, Fantasia/"Tirlittan oppipoika" -viittaus) - KORVAA aiemman
  // väliaikaisen Gandalf-sijaiskuvan, ks. sen vanha kommentti historian
  // vuoksi poistettu. Jarno löysi "Steamboat Willie Mouse File Pack Full"
  // -paketin (assets/2d/sprites/Steamboat Willie Mouse File Pack Full/magic/,
  // 12 kehystä 00.png-11.png, 511x491/kehys) - TÄRKEÄÄ: tämä on nimenomaan
  // 1928 "Steamboat Willie" -ULKOASU, joka on USA:ssa TEKIJÄNOIKEUDELLISESTI
  // JULKISTA OMAISUUTTA (vanhentui 1.1.2024) - ERI ASIA kuin nykyinen/
  // moderni Disney-Mikki-hahmo, jota EI olisi voinut käyttää. Jarno sai
  // paketin latauksen yhteydessä tämän ohjeen: "Legal tip: When creating
  // art and projects using the Steamboat Willie mouse, make sure to add a
  // disclaimer that you are not associated with Disney." - lisätty NÄKYVÄNÄ
  // credit-tekstinä linna-eder-day-kohtauksen attribuutioon (ks. esitys-2d-
  // kohtaukset.js), ei vain koodikommenttina - tämä on tavaramerkki-
  // ilmoitus, ei pelkkä nice-to-have.
  // mickey-magic.png = 12 kehystä yhdistetty YHDEKSI vaakariviksi Pillow'lla
  // (sama "yksi läpinäkyvä spritesheet-liuska" -tekniikka kuin nera-
  // run.png:llä), EI still-kuva - tässä ENSIMMÄISTÄ KERTAA kiintea:true +
  // ANIMOITU spritesheet (aiemmin kiintea tuki vain still-kuvaa TAI videota,
  // ks. esitys-2d.html:n create()-kommentti - laajennus samaan tapaan kuin
  // muillakin kentillä tässä projektissa). puoli:'oikea' (4.9.2026, Jarno
  // "place it little bit on right, so fox is not over it") - ruutuun
  // sidottu sijainti, kettu EI koskaan osu päälle riippumatta maailman-
  // sijainnista.
  { x: 4141, spritesheet: 'assets/2d/sprites/mickey-magic.png', kiintea: true, kehysLeveys: 511, kehysKorkeus: 491, kehyksia: 12, fps: 12, puoli: 'oikea', pysty: 'ala', korkeusProsentti: 0.5 },

  // "DOOM SCROLLING" -DEMONI (7.9.2026, x:8350 "Doom scrolling" - sanaleikki:
  // Doom-peli/demoni + doom scrolling. Jarno toimitti valmiin 5-kehyksisen
  // pikselitaide-animaation (assets/2d/sprites/demon/demon1-5.png, puhelin
  // josta demoni kiemurtelee esiin) - 5 erillistä samankokoista (128x55)
  // PNG:tä yhdistetty YHDEKSI vaakariviksi Pillow'lla (sama "yksi liuska"
  // -tekniikka kuin dragon-fly.png/mickey-magic.png:llä), demon-phone.png.
  // Sama kiintea:true + spritesheet -mekanismi kuin Mikillä yllä - EI uutta
  // moottorikoodia. puoli:'oikea', pysty:'ala' (Jarno: "right bottom") -
  // tämän pysähdyksen teksti on puoli:'vasen', joten demoni vastakkaisella
  // puolella, ei osu tekstin päälle. fps hidas (6) - levoton mutta ei
  // hälyttävän nopea kiemurtelu, sopii "pysähdy vieressä"-tunnelmaan.
  { x: 8350, spritesheet: 'assets/2d/sprites/demon-phone.png', kiintea: true, kehysLeveys: 128, kehysKorkeus: 55, kehyksia: 5, fps: 6, puoli: 'oikea', pysty: 'ala', korkeusProsentti: 0.22 },

  // "LUKUPOIKA" (6.9.2026, x:10470, Kanelin lukivaikeus-sitaatti "Tekoäly
  // poistaa esteitä ja tuo minut samalle tasolle muiden kanssa." - ks.
  // esitys-data.js). Jarno: "I would need reading boy, that shows Kaneli
  // case, dyxelxia can be beaten with help of AI". Ensin kokeiltu koodilla
  // piirrettyä placeholderia, mutta Jarno toimitti paremman, Geminillä
  // tehdyn valmiin 8-kehyksisen "poika lukee, kääntää sivua" -animaation
  // (assets/2d/sprites/boyexample.jpeg) - KÄYTETÄÄN TÄTÄ oikeaa assettia
  // koodilla-piirretyn sijaan (ks. muisti: "prefer real assets over
  // procedural placeholders"). lukupoika.png = 8 kehystä leikattu irti
  // boyexample.jpeg:n ruudukosta, tausta läpinäkyväksi, yhdistetty yhdeksi
  // vaakariviksi (260x363/kehys) - sama tekniikka kuin mickey-magic.png:llä
  // yllä. Sama kiintea:true + spritesheet -mekanismi, EI uutta moottori-
  // koodia. puoli:'vasen' koska tämän pysähdyksen teksti on puoli:'oikea'
  // (ks. esitys-data.js) - kuvitus vastakkaisella puolella tekstiä, sama
  // käytäntö kuin muuallakin. fps:4 (hidas, rauhallinen "lukee, kääntää
  // silloin tällöin sivua" -silmukka, ei nopea animaatio).
  { x: 10470, spritesheet: 'assets/2d/sprites/lukupoika.png', kiintea: true, kehysLeveys: 260, kehysKorkeus: 363, kehyksia: 8, fps: 4, puoli: 'vasen', pysty: 'ala', korkeusProsentti: 0.42 },

  // TURTLE + BUNNY vertailu-kuvitus (4.9.2026, x:12840 "Hidas ihminen / Nopea
  // kone" -vertailu, ks. esitys-data.js:n vertailu-kentän kommentti). Jarno:
  // "turtle: left, same level as fox, bunny on right. Only on this z" - siis
  // kiintea:true (näkyy VAIN tällä yhdellä pysähdyksellä, ruutuun sidottuna,
  // EI maailmankoordinaatissa) samaan tapaan kuin Mikki yllä, mutta
  // korkeusProsentti PALJON pienempi (0.15, sama "fox-mittakaava" -arvio kuin
  // Nera-armeijalla x:6990, ks. sen kommentti) koska nämä ovat pieniä
  // pikselihahmoja, ei jättiläisiä.
  // turtle-walk.png = 4 kehystä (32x32/kehys) leikattu tiedostosta
  // assets/2d/sprites/Turtle.png (alkuperäinen 1024x96, 32 saraketta x 3
  // riviä = 96 kehystä, 8 suuntaa x 4 kävelyvaihetta x 3 eri animaatiota) -
  // poimittu rivi 0, sarakkeet 24-27 (selkeä sivukävely) Pillow'lla.
  // Bunny käyttää pakan OMAA BunnyRun-Sheet.png:ää suoraan (5 kehystä,
  // 32x32/kehys), ei vaadi leikkausta - "32PixelBunny"-paketti, EI license/
  // README-tiedostoa kansiossa, lähdettä/lisenssiä ei voitu vahvistaa (sama
  // tilanne kuin Fellowship-paketilla, ks. sen attribuutio-kommentti).
  { x: 12840, spritesheet: 'assets/2d/sprites/turtle-walk.png', kiintea: true, kehysLeveys: 32, kehysKorkeus: 32, kehyksia: 4, fps: 4, puoli: 'vasen', pysty: 'ala', korkeusProsentti: 0.15 },
  { x: 12840, spritesheet: 'assets/2d/sprites/32PixelBunny/PNG/BunnyRun-Sheet.png', kiintea: true, kehysLeveys: 32, kehysKorkeus: 32, kehyksia: 5, fps: 8, puoli: 'oikea', pysty: 'ala', korkeusProsentti: 0.15 },

  // JARNO SAAPUU LOPPUKIITOKSEEN (4.9.2026, x:13890 "Kiitos!" -pysähdys).
  // Jarno teki itse 9 kehystä omasta pikselihahmostaan (assets/2d/sprites/
  // jarno/walk1-4.png sivuprofiili vasemmalle + wave0-4.png edestä kuvattu,
  // 356x555/kehys) - koottu kahdeksi liuskaksi Pillow'lla (jarno-walk.png,
  // jarno-wave.png). Pyyntö: "could first walk to next to fox, then wave
  // and continue waving" - UUSI kaksivaiheinen `saapuu`-kenttä (ks. sen
  // toteutus esitys-2d.html:n paivitaSaapujat()/create()-kommentti):
  // 1) kävelee ruudun oikealta reunalta kohdeX-sijaintiin (kavelyAika
  //    sekunnissa, sama tween-periaate kuin kiintea-kuvan liukuSuunta),
  // 2) saapuessaan VAIHTAA spritesheetin heiluttamis-silmukkaan ja jää
  //    heiluttamaan LOPUTTOMIIN (repeat:-1), kunnes pysähdykseltä poistutaan.
  // "next to fox": kohdeX 0.58 (hieman ruudun keskikohdan OIKEALLA puolella,
  // ketun HAHMON_Y_SUHDE=0.94 sama pysty käytetty myös tässä - "same level
  // as fox"). Kävelysykli on jo valmiiksi VASEMMALLE kääntynyt (kävelee siis
  // oikealta kohti keskustaa/kettua, ei tarvitse peilausta).
  {
    x: 13890,
    saapuu: {
      kavely: 'assets/2d/sprites/jarno/jarno-walk.png', kavelyKehyksia: 4,
      heilutus: 'assets/2d/sprites/jarno/jarno-wave.png', heilutusKehyksia: 5,
      kehysLeveys: 356, kehysKorkeus: 555,
      fps: 5, // hitaampi askelrytmi (4.9.2026, Jarno: "slower walk")
      kavelyAika: 5, // 3 -> 5s, hitaampi kävely paikalleen (sama pyyntö)
      korkeusProsentti: 0.32, // pienempi (4.9.2026, Jarno: "make it smaller little bit")
      kohdeX: 0.58,
      heiluttaaKertaa: 2, // "make wave just couple time and then 00" - ks. paivitaSaapujat()
    },
  },

  // aaniraita (6.9.2026) - Neil Lawrence, "olemme rakentaneet tietokoneita,
  // jotka tekevät virheitä..." ääneen luettuna, pptx-dia 60. Pelkkä
  // ääniraita, ei omaa kuvaa/videota.
  { x: 6240, aaniraita: 'Sounds/neillawrence_mistakes.wav' },

  // SININEN TULI TORNIN HUIPULLA - KOLMAS VERSIO 6.9.2026. Kaksi aiempaa
  // yritystä hylätty: (1) maisemaan ankkuroitu liekki + lukitseKerrokseen
  // OIKEALLE, TOISTUVALLE taustakerrokselle "5-background.png" - ei
  // toiminut luotettavasti (Jarno: "location is not right... never will be
  // because of scalable", `siirtymaX` on kiinteä pikselimäärä joka ei
  // skaalaudu). (2) kiintea:true + towerfire.png "backroundina" ruutuun
  // sidottuna - toimi resoluutioriippumattomasti mutta Jarno halusi sen
  // TAKAISIN osaksi maailmaa/parallaksia: "it should be part of scenes...
  // can be earlier, like part of background. and it should be back of
  // 5-background.png or same level".
  // NYKYINEN RATKAISU: towerfire.png (kuvat/towerfire.png, 252x202, torni+
  // maasto yhtenä leikekuvana - EI Jarnon kuvitelma "tower.png":stä, sama
  // vanha tiedosto, Jarno korjasi nimen) TAVALLISENA maisemaan ankkuroituna
  // kuvana (EI kiintea, EI lukitseKerrokseen - oma itsenäinen kuva, ei
  // toistuvaan taustaan sidottu, joten ei kärsi samasta tiili-synkronointi-
  // ongelmasta kuin versio 1). scrollFactor/syvyysSuhde asetettu SAMAKSI
  // kuin "5-background.png":llä (scrollFactor 0.39, syvyysSuhde 0.3 = index
  // 3/10 kerrosta) - "back of 5-background.png or same level".
  // Liekki+savu SAMALLA x:llä JA SAMALLA scrollFactorilla kuin torni -
  // koska worldX-kaavassa scrollX*scrollFactor-termi KUMOUTUU identtisenä
  // kahden SAMAN scrollFactorin elementin erotuksessa, niiden KESKINÄINEN
  // sijainti pysyy TÄYSIN kiinteänä toisiinsa nähden kameran liikkuessa -
  // liekki ei koskaan "irtoa" tornista. Pystysuunta (yProsentti) on
  // resoluutioriippumaton (ruudun KORKEUDEN murto-osa, ei pikseliä) -
  // laskettu suoraan tornin oman yProsentti+korkeusProsentti-asettelusta.
  // Vaakasuunta (siirtymaX) on PIENI, EMPIIRISESTI SÄÄDETTY arvo (antennin
  // mitattu paikka 0.464/0.0 on lähes kuvan keskellä, poikkeama pieni) -
  // ei täydellisen resoluutioriippumaton (sama rajoitus kuin ykkösversiolla
  // oli, mutta nyt paljon PIENEMPI virhe koska poikkeama on pieni eikä
  // sidottu toistuvaan tiiliin - hyväksyttävä kompromissi).
  // KORJAUS 6.9.2026 (Jarno: "it is not now part of scenery bakckround,
  // moves too fast, should stick more with 5-background.png") - `scrollFactor:
  // 0.39` oli SUORAAN kopioitu "5-background.png":n OMASTA scrollFactor-
  // luvusta, mutta se EI ole sama asia kuin sen TODELLINEN ruudulla
  // näkyvä nopeus (sama "castle-scrollFactor-phase" -bugi joka löydettiin
  // 3.9.2026 - ks. laskeLukittuScrollFactor():n iso kommentti: taustakerroksen
  // todellinen nopeus on scrollFactor × sen OMA tileScaleX, ei paljas luku).
  // Mitattu suoraan selaimessa: "5-background.png":n OIKEA lukittu arvo on
  // ~1.11, EI 0.39 (lähes 3x suurempi) - siksi torni "irtosi" taustasta.
  // `lukitseKerrokseen: '5-background.png'` KORVAA scrollFactor:in kokonaan
  // OIKEALLA, ajonaikaisesti lasketulla arvolla - sama tekniikka kuin
  // mirror2.png:llä aiemmin. siirtymaX skaalattu UUDELLEEN suhteessa
  // (0.39/1.11) koska vaakaoffsetin pikselimäärä riippuu scrollFactorista
  // (ks. laskeParallaksiX():n kaava).
  {
    x: 6390,
    kuva: 'kuvat/towerfire.png',
    ankkuri: { x: 0.5, y: 1 }, // pohja (maasto) osuu "maanpintaan"
    yProsentti: 0.97,
    korkeusProsentti: 0.55,
    lukitseKerrokseen: '5-background.png',
    syvyysSuhde: 0.3,   // sama kerrostaso kuin "5-background.png" (index 3/10)
  },
  // Liekki - yProsentti = tornin yProsentti(0.97) - korkeusProsentti(0.55) =
  // 0.42 (tornin OMA yläreuna). siirtymaX pieni empiirinen säätö (ks. iso
  // kommentti yllä) antennin mitattua paikkaa (0.464 vs. kuvan keskikohta
  // 0.5) vastaavaksi.
  {
    x: 6390,
    spritesheet: 'assets/2d/sprites/Pixel fire asset pack v1.2/Pixel Fire Asset Pack Colored/fire asset blue/Group 6 - 4/Group 6 - 4.png',
    kehysLeveys: 32, kehysKorkeus: 48, kehyksia: 8, fps: 10,
    ankkuri: { x: 0.5, y: 1 }, // liekin OMA jalka osuu antennin kärkeen
    yProsentti: 0.42,
    siirtymaX: -8, // SÄÄDETTY selaimessa (uudelleenskaalattu lukitseKerrokseen:n mukana)
    korkeusProsentti: 0.10,
    lukitseKerrokseen: '5-background.png', // SAMA kuin tornilla - pysyy kiinni tornissa
    syvyysSuhde: 0.32,  // hieman tornin (0.3) EDESSÄ
  },
  // Savu liekin PÄÄLLÄ (Jarno: "would like to add fire top of that" + antoi
  // kansion 'fire asset smoke/Smoke Light - 1', JO VALMIS 8-ruutuinen
  // savupatsas-sykli, 512x128, 64x128/kehys). Sama x/siirtymaX/
  // lukitseKerrokseen kuin liekillä (liikkuu ja näkyy identtisesti sen
  // kanssa) - vain yProsentti eri (korkeammalla, "liekin päällä").
  {
    x: 6390,
    spritesheet: 'assets/2d/sprites/Pixel fire asset pack v1.2/Pixel Fire Asset Pack Colored/fire asset smoke/Smoke Light - 1/Smoke Light - 1.png',
    kehysLeveys: 64, kehysKorkeus: 128, kehyksia: 8, fps: 8,
    ankkuri: { x: 0.5, y: 1 },
    yProsentti: 0.335, // 0.42 - 0.10*0.85 (pieni limitys liekin tyveen)
    siirtymaX: -8,
    korkeusProsentti: 0.13,
    lukitseKerrokseen: '5-background.png',
    syvyysSuhde: 0.32,
  },

  // AIVOT-VIDEO (6.9.2026, x:9840 "Aivojen loppu vai uusi alku?") - Jarno:
  // "let's use video... center, center". ENSIMMÄINEN versio (brains.mov,
  // HEVC, täysin läpinäkymätön) muunnettiin H.264 MP4:ään - Jarno huomasi
  // itse pian ("oh, that was not transparent") ja teki UUDEN version
  // (brains2.mov) OIKEALLA alfakanavalla: ProRes 4444 (pix_fmt=
  // yuva444p12le, vahvistettu ffprobe'lla ennen muuntamista). Muunnettu
  // OIKEALLA alfaputkella (`ffmpeg -c:v libvpx-vp9 -pix_fmt yuva420p
  // -c:a libopus`, sama tekniikka kuin muillakin läpinäkyvillä videoilla
  // tässä projektissa) - alfa vahvistettu SÄILYNEEKSI lopputuloksessa
  // container-tagista (`alpha_mode=1`), EI pix_fmt-kentästä (se näyttää
  // VP9-alfavideolla vain pohjavärivirran, ei alfaa - tunnettu ffprobe-
  // sudenkuoppa). brains2.mov:ssa oli TÄLLÄ KERTAA myös ääniraita (PCM,
  // ensimmäisessä versiossa ei ollut) - siksi aani:true. Jarno huomasi
  // vielä brains2:ssa "some frames that came on edit" (leikkausvirhe -
  // ylimääräisiä kehyksiä leikkauksesta) ja teki KOLMANNEN version
  // (brains3.mov, sama ProRes 4444/yuva444p12le/7.68s), muunnettu
  // TÄSMÄLLEEN samalla putkella, alfa vahvistettu säilyneeksi samoin.
  // EI tarvinnut ekaFrame/viimeinenFrame-PNG-kavereita (tarvitaan vain
  // maisemaan ankkuroidulle videolle, EI kiintea:true-videolle - ks.
  // tiedoston VALMIIT POHJAT -kommentti #2 vs. #3 alussa). kiintea:true +
  // puoli/pysty:'keski' = "center, center", näkyy VAIN tällä yhdellä
  // pysähdyksellä.
  { x: 9840, video: 'assets/2d/video/brains3.webm', kiintea: true, puoli: 'keski', pysty: 'keski', korkeusProsentti: 0.5, loop: false, aani: true },

  // Katri Saarikivi (x:12390) - Jarnon oma ProRes4444-alpha-vienti (katri.mov,
  // 720x1280 muotokuva, yuva444p12le - todistettu aito alfakanava Pillow'lla
  // suoraan LÄHTEESTÄ), muunnettu `ffmpeg -c:v libvpx-vp9 -pix_fmt yuva420p
  // -auto-alt-ref 0`:lla katri.webm:ksi (webm-kontin alpha_mode:1-tagi
  // vahvistettu). HUOM: ffmpegin oma -pix_fmt rgba -PNG-purku EI luotettavasti
  // näytä VP9-alfakanavaa jälkikäteen (testattu myös jo toimivaksi tiedetyllä
  // god-transparent.webm:llä - sekin "näytti" opaakilta samalla tarkistus-
  // tavalla) - todellinen tarkistus tehtävä silmämääräisesti selaimessa, ei
  // ffprobe/Pillow-CLI:llä. kiintea:true (näkyy VAIN tällä pysähdyksellä,
  // "shows only on this place") - EI ekaFrame/viimeinenFrame, niitä käyttää
  // vain maailmaan-ankkuroitu ei-kiintea-video (ks. god-transparent yllä).
  // puoli:'vasen' - vastakkainen puoli kuin tekstin oma puoli:'oikea'.
  { x: 12390, video: 'assets/2d/video/katri.webm', kiintea: true, puoli: 'oikea', pysty: 'keski', korkeusProsentti: 0.75, loop: false, aani: true },
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
const YLITYSHAHMOT = [
  // Kävelee ruudun poikki heti Loki-pysähdyksen (x:1365) jälkeen, OMALLA
  // tyhjällä pysähdyksellään (x:1400, esitys-data.js) - Jarnon pyyntö
  // 2.9.2026 "i want robot walk when there is no text on screen": EI
  // jaettu minkään tekstipysähdyksen kanssa, jotta ylitys näkyy puhtaana,
  // ilman tekstiä päällä. (Aiempi versio yritti jakaa x:1440-tekstipysäh-
  // dyksen kanssa - toimi teknisesti mutta ei antanut Jarnon haluamaa
  // "vain robotti, ei tekstiä" -hetkeä, joten vaihdettu omaan pysähdykseen.)
  // Trigger vaatii TÄSMÄLLEEN olemassa olevan pysähdyksen x:n (ks.
  // paivitaYlitykset()) - x:1400 ON lisätty esitys-data.js:ään juuri
  // tätä varten, ei jätetty puuttumaan kuten alkuperäinen x:1366-yritys.
  { x: 1400, spritesheet: 'assets/2d/sprites/Mech-walk-200×150px-sprites.png', kehysLeveys: 200, kehysKorkeus: 150, kehyksia: 8, ankkuriX: 0.505, ankkuriY: 0.953, kasvotSuuntaan: 1, fps: 10, kesto: 6, korkeusProsentti: 0.35, yProsentti: 0.94, suunta: -1, virtaa: true },

  // NERA-VIRTA (3.9.2026, Jarno x:6990 Pravda-propaganda-pysähdys: "there
  // would be running from left ro right several endles stream of she,
  // unstil clickecd to next" - "Neat would be only now on this scene").
  // Sama nera-run.png kuin HAHMOKERROKSET:in yksittäinen testikappale
  // (ks. sen kommentti - SÄILYTETTY sellaisenaan, Jarno: "keep this singe
  // Nera also just for case ... I would like to have nera single on
  // couple next windows too"), mutta TÄSSÄ YLITYSHAHMOT-mekanismilla, joka
  // JO VALMIIKSI ratkaisee "vain tällä pysähdyksellä" (RUUTU-sidottu,
  // katoaa HETI pysähdyksestä poistuttaessa - ei mitään bleed-through-
  // riskiä KOHTAUKSET-taustaan kuten maisemaosa-mekanismilla olisi ollut,
  // ks. gpscar2.png:n vainKohtaus-oppitunti yllä). ankkuriX/Y ei annettu ->
  // oletus 0.5/1.0 (keskellä alhaalla) toimii, sama kuin mitattu Pillow-
  // tulos HAHMOKERROKSET-testikappaleessa.
  // KORJATTU 3.9.2026 (Jarno: "Nera's are now running backwards. And too
  // fast"): (1) lähdekuva katsoo LUONNOSTAAN OIKEALLE (mitattu Pillow'lla,
  // ase/nenä osoittaa oikealle frame0:ssa) - EI vasemmalle kuten muilla
  // tämän tiedoston hahmoilla (fox/terminator), joten oletusarvo
  // kasvotSuuntaan:-1 peilasi hänet VÄÄRÄÄN suuntaan liikkuessa oikealle.
  // Lisätty kasvotSuuntaan:1 (sama kuin Mechillä, joka oli myös nenä-
  // oikealle). (2) kesto 5->9s (hitaampi ylitys koko ruudun poikki) ja
  // fps 10->8 (hitaampi kävelysykli, sopii paremmin hitaampaan etenemään -
  // muuten juoksisi paikallaan nopeasti mutta etenisi silti hitaasti).
  // syvyys 8.5 (3.9.2026, Jarno "can you adjust dept of Nara?") - kaupunki-
  // eder-tower-distance-sumu:n kerrokset ovat depth 0-9 (10 kerrosta), ja
  // uusi per-alkio `syvyys`-kenttä (ks. esitys-2d.html:n YLITYSHAHMOT-
  // luonti, aiemmin kiinteä 50 kaikille) laittaa Neran juuri viimeisimmän
  // etualan kerroksen (depth 9, '13-middleground.png' - lähipuut) TAAKSE,
  // toiseksi-etummaisimman (depth 8) EDESTÄ - näkyy nyt osittain puiden
  // takaa juostessaan, ei enää "liimattuna" kaiken päälle kuten oletus-50.
  // maara 6->3 (3.9.2026, Jarno "there is maybe too many of them, can you
  // half of them? Too much action in screen").
  { x: 6990, spritesheet: 'assets/2d/sprites/nera-run.png', kehysLeveys: 50, kehysKorkeus: 50, kehyksia: 8, fps: 8, maara: 3, virtaa: true, kesto: 9, korkeusProsentti: 0.15, yProsentti: 0.94, suunta: 1, kasvotSuuntaan: 1, syvyys: 8.5 },

  // LENTÄVÄ ALUS - TESTI (3.9.2026, Jarno "I would like to add also some
  // flying elements, maybe moon backage rockets on sky"). ship-fly.png =
  // sprite_player_spaceship_up_down.png, "Bonus (player ship)" -kansiosta
  // (Presentation/Backrounds/assetpack/) - 7 kehystä, 350x150/kehys, kevyt
  // ylös-alas-keinunta-animaatio, nenä LUONNOSTAAN oikealle (mitattu
  // Pillow'lla, sama kuin Mech). EI LISENSSITIEDOSTOA latauksessa, tekijää
  // ei varmistettu - sama tilanne kuin `assetpack-moon`-kohtauksen credit-
  // kommentissa, TARKISTETTAVA ennen julkista käyttöä. Sama virtaa+maara-
  // mekanismi kuin Nera-armeijalla, mutta HARVEMPI (3, ei 6 - taivas ei saa
  // olla yhtä täynnä kuin maa) ja HITAAMPI (kesto 14s) + YLEMPÄNÄ (yProsentti
  // 0.2, suunnilleen kuun korkeudella tässä kohtauksessa) + VASTAKKAINEN
  // suunta (-1, oikealta vasemmalle) kuin Nera-virralla - erottuu selvästi
  // maan tason virrasta, ei näytä samalta kopioidulta efektiltä.
  // maara 3->1, korkeusProsentti 0.09->0.045 (3.9.2026, Jarno "Just one
  // rocket at time, maybe smaller, like far distance") - yksi kerrallaan,
  // puolet aiemmasta koosta, lukee kauempana taivaalla.
  { x: 6990, spritesheet: 'assets/2d/sprites/ship-fly.png', kehysLeveys: 350, kehysKorkeus: 150, kehyksia: 7, fps: 6, maara: 1, virtaa: true, kesto: 14, korkeusProsentti: 0.045, yProsentti: 0.2, suunta: -1, kasvotSuuntaan: 1 },

  // FELLOWSHIP-KÄVELY (3.9.2026, Jarno x:7890, ks. HAHMOKERROKSET-taulukon
  // yläpuolen kommentti tässä tiedostossa) - "What they can do? Walk in
  // backround forest? Slowly from right to left. like fellowship." + "Movemen
  // can be slow, not fast, no flickering." VIISI ERI hahmoa (Frodo/Sam/Merry/
  // Pippin/Legolas - loput neljä isompaa/eri-layoutista sheettiä, Aragorn/
  // Boromir/kumpikin Gandalf, EI vielä käytössä, niiden rivijärjestys on eri
  // kuin näillä viidellä eikä sitä vielä selvitetty, ks. jatko-osa jos
  // tarvitaan). *-walk-left.png = Universal-LPC-spritesheetin rivi 9 (0-
  // indeksoituna, "walk left" - 9 kehystä, 64x64/kehys) - hahmo katsoo
  // LUONNOSTAAN vasemmalle tällä rivillä, joten kasvotSuuntaan:-1 (EI
  // peilausta suunta:-1:llä, "oikealta vasemmalle" - juuri se mitä Jarno
  // pyysi). ankkuriX/Y mitattu Pillow'lla KAIKILLE VIIDELLE ERIKSEEN
  // (identtiset: 0.5/0.969 - sama LPC-mallipohja).
  //
  // EI maara-kenttää (jokainen on OMA erillinen hahmo, ei saman tekstuurin
  // kloonI kuten Nera-armeija) - kaikki VIISI silti käynnistyvät SAMALLA
  // hetkellä samasta reunasta (paivitaYlitykset()'in vaiheviive-laskenta
  // koskee vain SAMAN alkion sisäisiä maara-kloone, ei erillisiä alkioita),
  // joten ne kävelevät LUONNOSTAAN yhtenä ryhmänä vierekkäin - juuri "like
  // fellowship". Pieni ero yProsentti/kesto-arvoissa per hahmo (ei
  // identtiset) hajottaa rivin hieman epätasaiseksi ajan myötä, ei jää
  // täysin jäykäksi riviksi.
  //
  // "no flickering" -pyyntöön: fps VAIN 5 (ei 8-10 kuten Neralla/Mechillä) -
  // hidas kesto (~24s ruudun poikki) + nopea jalkasykli olisi näyttänyt
  // "juoksemiselta paikallaan" (jalat vilkkuvat nopeasti vaikka eteneminen
  // on hidasta) - Nera-korjauksen sama oppitunti (ks. sen kesto/fps-
  // kommentti) vietynä vielä pidemmälle koska tämä on VIELÄKIN hitaampi.
  // KESTO ~2.2x hitaammaksi + fps 5->4 (3.9.2026, Jarno "THey can walk half
  // slower, or even slower" - myös jalkasykli hidastettu VASTAAVASTI ettei
  // askel näytä "sipsuttelulta" kun eteneminen on paljon hitaampaa mutta
  // jalat liikkuisivat yhtä tiheään).
  { x: 7890, spritesheet: 'assets/2d/sprites/frodo-walk-left.png', kehysLeveys: 64, kehysKorkeus: 64, kehyksia: 9, fps: 4, virtaa: true, kesto: 53, korkeusProsentti: 0.14, yProsentti: 0.90, ankkuriX: 0.5, ankkuriY: 0.969, suunta: -1, kasvotSuuntaan: -1, syvyys: 7.5, aloitusViive: 0 },
  { x: 7890, spritesheet: 'assets/2d/sprites/sam-walk-left.png', kehysLeveys: 64, kehysKorkeus: 64, kehyksia: 9, fps: 4, virtaa: true, kesto: 55, korkeusProsentti: 0.145, yProsentti: 0.915, ankkuriX: 0.5, ankkuriY: 0.969, suunta: -1, kasvotSuuntaan: -1, syvyys: 7.5, aloitusViive: 3 },
  { x: 7890, spritesheet: 'assets/2d/sprites/merry-walk-left.png', kehysLeveys: 64, kehysKorkeus: 64, kehyksia: 9, fps: 4, virtaa: true, kesto: 51, korkeusProsentti: 0.13, yProsentti: 0.94, ankkuriX: 0.5, ankkuriY: 0.969, suunta: -1, kasvotSuuntaan: -1, syvyys: 7.5, aloitusViive: 6 },
  { x: 7890, spritesheet: 'assets/2d/sprites/pippin-walk-left.png', kehysLeveys: 64, kehysKorkeus: 64, kehyksia: 9, fps: 4, virtaa: true, kesto: 54, korkeusProsentti: 0.13, yProsentti: 0.925, ankkuriX: 0.5, ankkuriY: 0.969, suunta: -1, kasvotSuuntaan: -1, syvyys: 7.5, aloitusViive: 9 },
  { x: 7890, spritesheet: 'assets/2d/sprites/legolas-walk-left.png', kehysLeveys: 64, kehysKorkeus: 64, kehyksia: 9, fps: 4, virtaa: true, kesto: 50, korkeusProsentti: 0.15, yProsentti: 0.905, ankkuriX: 0.5, ankkuriY: 0.969, suunta: -1, kasvotSuuntaan: -1, syvyys: 7.5, aloitusViive: 12 },

  // ARAGORN/BOROMIR/GANDALF (3.9.2026, Jarno "add, others too, they are
  // bigger in LOTR also because hobbits are smaller") - isompi sheet-koko
  // (1536x2112, EI 832x1344 kuten hobiteilla/Legolasilla) mutta SAMA 64px-
  // ruudukko ja SAMA rivijärjestys (kehysmäärä/rivi tarkistettu ohjelmalli-
  // sesti: rivit 8-11 = walk up/left/down/right kaikilla, täsmää Frodon
  // vakiolayoutiin). Aragorn/Boromir kantavat asetta paljaana kävellessään
  // (näiden hahmojen oma "varustettu"-ulkoasu, ei erillinen hyökkäys-
  // animaatio - sopii itse asiassa teemaan). korkeusProsentti isompi kuin
  // hobiteilla (0.19-0.20 vs. 0.13-0.15) - aikuiset ihmiset/velhot ovat
  // selvästi pidempiä kuin hobitit kirjassa/elokuvissa.
  { x: 7890, spritesheet: 'assets/2d/sprites/aragorn-walk-left.png', kehysLeveys: 64, kehysKorkeus: 64, kehyksia: 9, fps: 4, virtaa: true, kesto: 52, korkeusProsentti: 0.20, yProsentti: 0.895, ankkuriX: 0.5, ankkuriY: 0.969, suunta: -1, kasvotSuuntaan: -1, syvyys: 7.5, aloitusViive: 15 },
  { x: 7890, spritesheet: 'assets/2d/sprites/boromir-walk-left.png', kehysLeveys: 64, kehysKorkeus: 64, kehyksia: 9, fps: 4, virtaa: true, kesto: 56, korkeusProsentti: 0.195, yProsentti: 0.91, ankkuriX: 0.5, ankkuriY: 0.969, suunta: -1, kasvotSuuntaan: -1, syvyys: 7.5, aloitusViive: 18 },
  { x: 7890, spritesheet: 'assets/2d/sprites/gandalf-the-grey-walk-left.png', kehysLeveys: 64, kehysKorkeus: 64, kehyksia: 9, fps: 4, virtaa: true, kesto: 49, korkeusProsentti: 0.19, yProsentti: 0.93, ankkuriX: 0.5, ankkuriY: 0.969, suunta: -1, kasvotSuuntaan: -1, syvyys: 7.5, aloitusViive: 21 },
  { x: 7890, spritesheet: 'assets/2d/sprites/gandalf-the-white-walk-left.png', kehysLeveys: 64, kehysKorkeus: 64, kehyksia: 9, fps: 4, virtaa: true, kesto: 57.5, korkeusProsentti: 0.19, yProsentti: 0.945, ankkuriX: 0.5, ankkuriY: 0.969, suunta: -1, kasvotSuuntaan: -1, syvyys: 7.5, aloitusViive: 24 },

  // RAKETTI LENTÄÄ KUPLAN OHI (4.9.2026, Jarno x:8940 "Algoritmit luovat
  // myös turvaa": ensin "rocket... comes to shoot the bubble, and pass by",
  // sitten korjaus "save this poppit effect later. Bubbles mean was to
  // protect kittens :) So maybe space ship just pass bubble behind. But we
  // can use that destroy bubbles also later" - siis KUPLA EI SAA TUHOUTUA,
  // se on TURVAPAIKKA (ks. pysähdyksen oma teksti "Algoritmit luovat myös
  // turvaa") - raketti vain lentää OHI/TAAKSE, ei koske kuplaan. EI `osuma`-
  // kenttää tässä (poistettu, EI poistettu koodista - ks. esitys-2d.html:n
  // piilotaKuplaPoksahtaen() ja tämän tiedoston osuma-kentän dokumentaatio,
  // molemmat jätetty ENNALLEEN Jarnon pyynnöstä myöhempää "tuhoa kupla"
  // -hetkeä varten jossain toisessa kohtaa). "pass bubble BEHIND" toimii jo
  // ITSESTÄÄN ilman koodimuutosta: #kupla on DOM-kerros (z-index:5) KOKO
  // Phaser-canvasin YLÄPUOLELLA sivun pino-järjestyksessä, joten raketti
  // (canvas-sisäinen) näkyy AINA kuplan TAKANA/läpi riippumatta Phaser-
  // depth-arvosta - tarkalleen se "suojaava lasipinta" -vaikutelma jota
  // Jarno kuvasi. SAMA ship-fly.png kuin x:6990:n taivas-virrassa, EI
  // virtaa:true (kertaluontoinen ohilento, ei jatkuva virta).
  { x: 8940, spritesheet: 'assets/2d/sprites/ship-fly.png', kehysLeveys: 350, kehysKorkeus: 150, kehyksia: 7, fps: 6, kesto: 6, korkeusProsentti: 0.07, yProsentti: 0.46, suunta: 1, kasvotSuuntaan: 1, aloitusViive: 2 },
];
