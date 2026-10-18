// ============================================================================
// POHJA - ESITYSTEN SUOMENKIELINEN MASTER (15.9.2026, Jarno: "Finnish as master")
// ============================================================================
// Tämä kansio on kaikkien tulevien esitysten LÄHTÖKOHTA: kopioi koko Pohja/
// uudeksi kansioksi (esim. cp -R Pohja/ Yritys/), karsi pois mitä et tarvitse,
// lisää yleisökohtaiset pysähdykset. Valmiit esitykset (Taiteilijajarjestot/,
// Zalaris/, SectoDesign/) EIVÄT ole enää muokattavia - ne ovat arkisto.
//
// Sisältö: kaikki KOLMEN syyskuun 2026 esityksen yhteinen runko (TJ 8.9 =
// pohja, Zalaris 9.9 ja Secto 10.9 = yleiset korjaukset porttattu tähän) +
// yleisökohtaiset MODUULIT kommentoituna paikoillaan:
//   // ZALARIS-MODUULI  = HR-/palkkahallintoyleisö (x:5790, 6541-6543, 6844,
//                        11040, 11046, 11415, 11485, 11790, 12395, 13800)
//   // TAITEILIJA-MODUULI = kuvataiteilijat (x:11355-11370, 11405-11410,
//                        11430, 11441-11480)
//   // SECTO-MODUULI    = design-/myyntiyleisö (x:3410, 12850)
// Englanninkielinen versio (tekstit, muistiinpanot, _eng-äänet, god_eng-
// video) on SectoDesign/-kansiossa - älä käännä uudelleen, kopioi sieltä.
// Ks. POHJA-README.md.
// ============================================================================
//
// ============================================================================
// VALMIS POHJA - KOPIOI JA LIITÄ PYSAHDYKSET-TAULUKKOON, MUUTA ARVOT
// (Jarnon pyyntö 1.9.2026). Kaikki kentät valinnaisia paitsi x - jätä pois
// mitä et tarvitse.
// ============================================================================
//   { x: 2050, otsikko:'Otsikko tähän', teksti:'Leipäteksti tähän - <span style="color:#FF5562">osa</span> voi olla eriväristä.', lahde:'Sitaatin lähde', muistiinpanot:'Puhujan omat muistiinpanot (näkyy vain esittajanakyma.html:ssä)', puoli:'vasen', pysty:'yla', savy:'kelta', koko: 5 },
//
// puoli: 'vasen'|'keski'|'oikea' (tekstin sijainti vaakasuunnassa)
// pysty: 'yla'|'keski'|'ala' (tekstin sijainti pystysuunnassa, oletus 'yla')
// savy:  'valko'|'kelta'|'puna'|'koralli'|'vihrea' (koko tekstin väri)
// koko:  1-10 (tekstin koko, oletus 3)
// hahmoAnimaatio: 'Idle'|'Idle_Alert'|'Sit'|'Sneak'|'Bark'|'Bite'|'Fetch'|'Howl'|'Jump'|'Run'|'Rest_Pose' (mitä opashahmo tekee tällä pysähdyksellä)
// hahmoZ: luku (kettu lähempänä/kauempana kamerasta, ks. esitys-3d.html)
// luku: 'Luku 2: Tekoäly ja yhteiskunta' (Jarnon "chapter window" -pyyntö 1.9.2026, VAIN esitys-2d.html:ssä).
//   Näyttää ison, itsestään ~2.6s kuluttua häipyvän lukukortin heti kun tähän pysähdykseen saavutaan
//   (kummasta suunnasta tahansa). Lisää tämä MIHIN TAHANSA pysähdykseen jonka haluat merkitä uuden
//   luvun alkuun - ei omaa erillistä taulukkoa, ei vaadi mitään muuta kenttää samalla rivillä (voi
//   yhdistää otsikko/teksti-kenttien kanssa samaan pysähdykseen, tai käyttää yksinään: { x: 5290, luku:'Luku 2: Tekoäly ja yhteiskunta' }).
//   Ei tuki klikkeriä - voi jatkaa eteenpäin heti vaikka kortti olisi vielä näkyvissä.
// Ei otsikkoa/tekstiä -pysähdys (esim. "vain katso hahmoa"): { x: 1350 }
// vesi: luku (vh-korkeusprosentti) TAI { korkeus, viive } (3.9.2026, Fantasia/
//   "Olemme kaikki Mikkejä" x:4141) - nostaa läpinäkyvän #aalto-veden ruudun
//   alareunasta tälle pysähdykselle, esim. { x: 4841, vesi: 50 }. Sama elementti
//   kuin jaavuori-kentän aalto, mutta EI tasoja/tekstiä - pelkkä nouseva vesi.
//   Katoaa/laskee automaattisesti kun siirrytään pois (ei omaa erillistä nollausta).
// kupla: true TAI { kissat: ['gray','ginger','white'] } (4.9.2026, x:8940
//   "Algoritmit luovat myös turvaa") - läpinäkyvä lasikupla jonka sisällä
//   nukkuvat kissanpennut kelluvat. Katoaa normaalisti pysähdykseltä
//   poistuttaessa KUTEN MUUTKIN, MUTTA voi myös "poksahtaa" kesken kaiken -
//   ks. esitys-2d-hahmot.js:n YLITYSHAHMOT-taulukon "RAKETTI AMPUU KUPLAN"
//   -alkio (osuma-kenttä) samalla x:llä.
// tikapuut: true TAI { askelmat, poistuu, viive, poistoVali } (4.9.2026,
//   x:11045 Stanford-sitaatti) - uraportaat, joiden ALIMMAT `poistuu`
//   askelmaa (oletus 3/9) haalistuvat pois lyhyen viiveen jälkeen - kuvaa
//   aloitustason työpaikkojen katoamista, ylemmät (kokeneemmat) tasot
//   pysyvät koskemattomina.
// vertailu: { otsikot: ['Vasen otsikko','Oikea otsikko'], rivit: [ { vasen:'...', oikea:'...', viive: 1800 }, ... ] }
//   (4.9.2026, x:12840 "kilpikonna vs. jänis" -kuva) - KAKSIPALSTAINEN vertailu
//   otsikko/teksti-kentän SIJAAN (ei niiden kanssa yhdessä). otsikot on
//   VALINNAINEN ylin rivi (näkyy heti); jokainen rivit-taulukon alkio on YKSI
//   pari, vasen ja oikea tekstirivi näkyvät VIERETYSTEN samalla korkeudella.
//   Paljastuu vaiheittain samaan tapaan kuin teksti-taulukko (ensimmäinen
//   rivi/otsikkorivi heti, loput viive-kentän mukaan, oletus 1800ms parien
//   välillä). Esim:
//   { x: 13540, vertailu: { otsikot:['Hidas ihminen','Nopea kone'], rivit:[
//       { vasen:'Hidas, harkitseva, reflektiivinen', oikea:'Nopea, automaattinen, vaivaton' },
//       { vasen:'Kysyy, epäilee, ymmärtää', oikea:'Käsittelee dataa valonnopeudella' },
//       { vasen:'Tekee tilaa viisaudelle, ei vain tehokkuudelle', oikea:'Tuottaa vastauksia, mutta ei ymmärrystä' },
//   ] }, puoli:'keski', savy:'kelta' }
//   Kenttä lisätään esitys-data.js:ään, toteutus esitys-2d.html:ssä (naytaTeksti()).
// diffuusio: true TAI { askeleet, kesto, kohinaAika, syklit } (4.9.2026,
//   x:5190 "Miten tekoäly tekee kuvan") - KOKONAAN koodilla piirretty pieni
//   <canvas>-kuvake (oma käsin tehty "kissa"-pikselikuva, ei kuva-assettia)
//   joka selkiytyy satunnaisesta kohinasta askel askeleelta kohti terävää
//   kuvaa - karkeat muodot ensin, tarkat yksityiskohdat viimeisenä, sama
//   järjestys kuin oikeassa diffuusiomallissa. askeleet (oletus 10), kesto
//   (ms, MUIDEN askelten yhteiskesto, oletus 4500), kohinaAika (ms, oletus 0,
//   6.9.2026 "make the first statich kohina lobger") - pidentää VAIN
//   ensimmäisen täysin-kohina-askeleen kestoa ennen puhdistuksen alkua,
//   koskematta muiden askelten tahtiin. syklit (oletus 1, 6.9.2026 "maybe
//   loop it back and forward x 5 times") - toistaa koko liikkeen PALATEN
//   takaisin kohinaan välissä (viimeinen kierros päättyy AINA eteenpäin,
//   terävään kuvaan, ei jää roikkumaan kohinaan). Näkyy oikeassa laidassa, riippumatta
//   puoli-kentästä. Kenttä lisätään esitys-data.js:ään, toteutus
//   esitys-2d.html:ssä (naytaDiffuusio()).
// ennustus: { syote, tulos, pohdintaAika } (6.9.2026, x:6090 "Tekoäly ennustaa
//   seuraavan sanan") - näyttää syote-sanan, lyhyen sykkivän "pohtii..."
//   -hetken (pohdintaAika ms, oletus 1600), sitten tulos-sanan joka ilmestyy
//   paikalle. Tarkoituksella VAIN kaksi sanaa, ei prosenttilukua/sanalistaa
//   (Jarno: "just simple 'vesi' 'märkä'") - "pohtii"-hetki itsessään
//   visualisoi "ennustaa, mutta ei varmuudella". Esim: { x: 6790,
//   ennustus: { syote:'vesi', tulos:'märkä' } }. Näkyy oikeassa laidassa.
//   Kenttä lisätään esitys-data.js:ään, toteutus esitys-2d.html:ssä (naytaEnnustus()).
// youtube: 'VIDEO_ID' (7.9.2026, x:11370 "Runovideo" - Jarno: "maybe youtube
//   embed with loitsu") - näyttää koko ruudun keskellä ison YouTube-upotuksen
//   (youtube-nocookie.com/embed/VIDEO_ID, autoplay). AINOA online-riippuvainen
//   pysähdys koko esityksessä - kaikki muu pysyy täysin offline (Jarnolla on
//   nettiyhteys juuri tässä tilaisuudessa, mutta ei oteta riskiä muualla).
//   Kenttä lisätään esitys-data.js:ään, toteutus esitys-2d.html:ssä (naytaYoutube()).
// tamagotchi: true (6.9.2026, x:10990 "Antaisitko tamagotchisi tekoälylle?")
//   - KOKONAAN koodilla piirretty 90-luvun tamagotchi-lelu (ei kuva-
//   assettia): pyöreä runko+ruutu+3 nappia (CSS) + käsin piirretty 16x16-
//   pikeliolento joka räpsäyttää silmiään tasaisin väliajoin, kelluu
//   hitaasti ylös-alas. Näkyy VASEMMASSA laidassa (vastapäätä tekstiä).
//   Kenttä lisätään esitys-data.js:ään, toteutus esitys-2d.html:ssä (naytaTamagotchi()).
// polkupeli: true (6.9.2026, x:14040, esityksen FINAALI Kiitos!-dian
//   jälkeen, Jarno: "what will be great touch to end presentation... game
//   like screen, Valitse polkusi") - koko ruudun peittävä "valitse polkusi"
//   -minipeli, sama runko kuin alun opas-valinta-ruudulla mutta OMA
//   elementti/kenttä. Kaksi korttia (POLKUVAIHTOEHDOT-taulukko esitys-2d.
//   html:ssä), kumpikin johtaa hauskaan/huonoon lopputulokseen, minkä
//   jälkeen paljastuu KOLMAS, piilotettu "oikea" polku (POLKU_KOLMAS) -
//   vitsin rakenne, ei pelkkä valikko. Kenttä lisätään esitys-data.js:ään,
//   toteutus esitys-2d.html:ssä (naytaPolkupeli()).
// datakupla: true (7.9.2026, x:5490 "Digitaalinen jalanjälkemme..." - Jarno
//   näytti kaksi kuvakaappausta ulkopuolisesta Meta-datavisualisoinnista ja
//   pyysi: "i have video that shows my Facebook data... make this in code
//   ... show in bubbles all site names, then animation shows one by one
//   some of names highlighted"). Koko ruudun täyttävä, KOODILLA piirretty
//   "Meta"-keskisolmu + ~200 kupla ympärillä (yksi per sovellus/sivusto
//   Jarnon OMASTA Meta-tietopyynnön JSON-viennistä, ks. esitys-2d-
//   metaverkosto.js), pakattu tiiviiksi ympyräklusteriksi (oma, ei-
//   ulkoinen pakkausalgoritmi). Kuplat ilmestyvät satunnaisjärjestyksessä
//   yksi kerrallaan, sitten kymmenen eniten "tapahtumia" kerännyttä nimeä
//   kiertää vuorollaan kultaisena korostettuna (nimi + tapahtumamäärä).
//   Kenttä lisätään esitys-data.js:ään, data esitys-2d-metaverkosto.js:ssä,
//   toteutus esitys-2d.html:ssä (naytaDatakupla()). Ks. myös test-
//   datakupla.html - alkuperäinen eristetty prototyyppi, josta tämä
//   porttattiin, jätetty projektiin uudelleenkäytettäväksi työkaluksi.
// atomi: true (29.9.2026, x:240 "Mitkä ovat piirteet, joita kone ei voi
//   jäljitellä?" - Demokritos; samassa pysähdyksessä kuin otsikko). Koodilla piirretty
//   atomi keskellä ruutua: materia kokoontuu, yksi leikkaus, puolikkaat
//   liukuvat erilleen, keskeltä paljastuu ydin ja radat. Toteutus
//   esitys-2d.html:ssä (naytaAtomi()), eristetty prototyyppi test-atomi.html.
// agenda2030: true (7.9.2026, x:9550 "Tekoälyllä on kuitenkin merkittävä
//   rooli ympäristöongelmien ratkaisemisessa" - Jarno: "I have icons of
//   Agenda 2030, they could horisontally flip each one time, then these
//   could get little bit bigger", kuvat kuvat/agenda2030/-kansiosta
//   SELLAISENAAN, "just use them as they are" - EI muokattu/uudelleen-
//   väritetty). Näyttää 5 YK:n kestävän kehityksen tavoite -kuvaketta
//   (13 Ilmastotekoja, 6 Puhdas vesi ja sanitaatio, 15 Maanpäällinen
//   elämä, 14 Vedenalainen elämä, 12 Vastuullista kuluttamista - Jarnon
//   itse valitsema, ympäristöön liittyvä osajoukko kaikista 17:sta), jotka
//   kääntyvät näkyviin YKSI KERRALLAAN vaakasuoralla "korttikääntö"-
//   animaatiolla (CSS 3D rotateY, sama "korostettu tulo" -periaate kuin
//   muillakin tämän session koodilla-piirretyillä efekteillä), asettuen
//   lopuksi hieman suurempaan kokoonsa. Kenttä lisätään esitys-data.js:ään,
//   toteutus esitys-2d.html:ssä (naytaAgenda2030()).
// ============================================================================
//
// Esityksen pysähdykset (tekstit + puhujan muistiinpanot alkuperäisestä pptx:stä).
// Jaettu tiedosto: sekä esitys-3d.html (päänäkymä) että esittajanakyma.html
// (puhujan oma näyttö) lukevat tätä samaa listaa, jotta data pysyy yhdessä
// paikassa eikä pääse eriytymään kahden kopion välillä.
// ZOOMIREITTI (2.10.2026): kameran hidas ajelehdinta usean pysähdyksen yli,
// LIMBO-tunnelma - maailma tulee huomaamatta lähemmäs. { x, zoom } nousevassa
// järjestyksessä, välit liukuvat pehmeästi kameran mukana (ei koskaan
// paikallaan seistessä). 1.0 = koko kuva (latvat + taivas), 1.45 = Pohjan
// tavallinen tiivis rajaus, null = kohtauksen oma zoom. Ensimmäistä merkkiä
// ennen ja viimeisen jälkeen kaikki on kuten ennenkin. Ks. esitys-2d.html:n
// reittiZoom(). Tyhjä lista [] = ei ajelehdintaa ollenkaan.
//   EI METSÄÄN (x:0-3090): kokeiltu 2.10.2026 (1.0 -> 1.45 x:60-1760), Jarno:
//   "idea is good, but like god scene, it does not work". Metsän latvusto on
//   yhtenäinen tumma katto - heti kun kamera vetäytyy, se peittää korkealle
//   sijoitetut kuvat (x:1290 patsas katkesi latvuston alle). Metsä pysyy 1.45:ssä;
//   ajelehdintaa kokeillaan kohtauksissa, joissa ei ole kattoa (linnat, kaupungit).
// TF 15.10.2026 (Jarno: "when zoom out page comes, smooth zoom out for some pages, then back zoom in"):
// kassi 2 "Zoom out." - kamera vetäytyy kävellessä x:4490 -> 4500, pysyy kaukana koko kassin 2 ajan,
// palaa normaaliin kävellessä x:4600 -> 4750 (kassi 3).
const ZOOMIREITTI = [];   // TF: kassi 2:n zoom on nyt pysähdyskohtainen (zoom/zoomKesto, x:4500-4600)

const PYSAHDYKSET = [
    // TOOL FAIR 2026 (13.10.2026) - "What does a prompt cost?" Sopot.
    // TED-pass 13.10: ruudulla vain kuva / luku / kysymys. Sanottava lause
    // muistiinpanojen ylimpänä (►), sen alla vihjeet. Numerointi = SISALTO.md.
    // Vyöhykkeet: metsä 0-2300, öljykenttä 2300-3300, metsä-loppu 3300->.

    // ---------------- FOREST ----------------
    // 1 Title
    // 18.10.2026 ALOITUSSIVU: tyhjä tumma sivu + "Start presentation (full screen)" -nappi (esitys-2d-aloitus.js).
    // Aina ensimmäinen sivu, palattavissa. Nappi = koko näyttö + kello nollaan; seuraava = otsikkosivu.
    { x: 100, aloitussivu: true,
      muistiinpanot:"► (start page - click the button for full screen, then next)" },

    { x: 150, otsikko:'What does a prompt cost?', teksti:'Jarno Alastalo', puoli:'keski', pysty:'keski', savy:'kelta', koko: 8, 
      muistiinpanot:"► (silence - walk on)" },

    // 2 Gilgamesh - EI tekstiä, pelkkä kohtaus (setri)
    { x: 450, setri: true,
      muistiinpanot:"► The oldest written story in the world begins with a forest and man cutting it down. King Gilgamesh, about 4,000 years ago. He wants his name to last, and he goes and cuts the trees in the secret forest to get fame." },


         // 3 Muhos (TODO: siirtymä + hakattu metsä)
    { x: 1100,
      muistiinpanot:"► This autumn in Finland, where I live, Google cut down forest for its new data centres.\n► Hundreds of hectares.\n► Before the environmental assessment was finished." },

    // 3 Muhos (TODO: siirtymä + hakattu metsä)
    { x: 1357, otsikko:'<span style="color:#B0CB40;font-weight:700">Over 500 hectares</span>', lahde:'', lahdeKoko: 2, puoli:'keski', pysty:'yla', savy:'valko', koko: 7,   // 17.10: otsikko ylös, alla satelliittikuva (esitys-2d-satelliitti.js)
      muistiinpanot:"► Over five hundred hectares. (pause)" },

    // 4 (tyhjä) - tarina jatkuu, sanotaan ääneen
    { x: 1450, lisaAnim: 'setripalvelin', otsikko:'Four thousand years later, the story has not changed', puoli:'keski', pysty:'keski', savy:'valko', koko: 6, 
      muistiinpanot:"► Four thousand years later, the story is the same. Forests are still cut down for something we want, what humans want. Now for the machines." },

    // 5 The girl
    { x: 1600, otsikko:'"How much water does AI use?"', puoli:'keski', pysty:'keski', savy:'kelta', koko: 8,
      muistiinpanot:"► THIS STORY IS ABOUT THIS GIRL\n► 6th grader from Jämsä, a small town in Finland. Two weeks ago I gave a talk at a school. \n► She asked me: how much water does AI use?" },

   { x: 1625, pullo: true, otsikko:'My answer:', puoli:'keski', pysty:'yla', savy:'kelta', koko: 8,
      muistiinpanot:"► I said: about half a litre for fifty prompts in AI chat. And I said: I don't know if that's right. Nobody knows.\n► She said thank you." },



  // 5 The girl
    { x: 1650, otsikko:'And I have been thinking ever since: <span style="color:#B0CB40;font-weight:700">what should I have told her?</span>', puoli:'keski', pysty:'yla', savy:'kelta', koko: 6,  tyttoAnimaatio: 'confused', 
      muistiinpanot:"► I thought it was great that she asked. That question wasn't in my presentation.\n► And I have been thinking ever since: what should I have told her?" },


      // 6 Montevideo
    { x: 1700, ylarivi:'I could have told her:', ylariviPaikka:'yla', otsikko:'Google planned a data centre that would cool itself with <span style="color:#FF5562;font-weight:700">7.6 million litres a day</span>', lahde:'Montevideo, Uruguay, 2023 · DW · Mongabay', lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 8,  tyttoAnimaatio: 'confused',  
      muistiinpanot:"► I could have told her: In 2023, Montevideo in Uruguay almost ran out of fresh water. The tap water turned salty.\n► At the same time, Google planned a data centre there.\n► It would cool itself with almost 8 million litres of drinking water. Every day.\n► That's the household water of 55,000 people." },

    // 8 Thank you (kiitos: chatti + maapallo + laskuri 760 000)
    { x: 1900, ylarivi:'I could have told her:', ylariviPaikka:'yla', otsikko:'Stop saying “thank you”', koko: 4, puoli:'keski', pysty:'yla', savy:'valko', kortti: true, lahde:'UN University (UNU-INWEH), 2026', lahdeKoko: 2,
      chattiKuvakeAi: 'kuvat/robot.png', chattiKuvakeSina: 'kuvat/jarno-avatar.png', chattiKoko: 1.15, chattiX: '27%', chattiY: '64%', chattiViive: 1100,
      kiitos: { alue: 'afrikka', luku: 760000, rivit: ['people\'s home electricity for a year', 'in sub-Saharan Africa'] },
      chatti: [
        { kuka: 'ai', viesti: 'Here is your presentation, Jarno!' },
        { kuka: 'sina', viesti: 'Thank you!' },
        { kuka: 'ai', viesti: 'Anything else I can help with?' },
        { kuka: 'sina', viesti: 'That\'s all' },
        { kuka: 'ai', viesti: 'You\'re welcome!' },
      ],
      muistiinpanot:"► Or I could have said: stop saying thank you to ChatGPT.\n► That's the same amount of electricity that almost 800,000 people use at home.\n► In sub-Saharan Africa. A year." },

    // MONTAASI v3 15.10: nopeat klikkaukset, ylikuormitus on tarkoitus
    { x: 1910, ylarivi:'Or I could have told her', ylariviPaikka:'yla', puoli:'keski', pysty:'keski', savy:'valko', koko: 10, tyttoAnimaatio: 'confused',
      muistiinpanot:"► I could have told her:" },
    { x: 1915, montaasiAnim: 'suomi', ylarivi:'I could have told her:', ylariviPaikka:'yla', otsikko:'<span style="color:#FF5562;font-weight:700">AI used more electricity last year than all of Finland.</span>', lahde:'UN University (UNU-INWEH), 2026 · 93 vs 83 TWh', lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 7,
      muistiinpanot:"► (Voice) AI used more electricity last year than all of Finland." },
 //   { x: 1920, ylarivi:'I could have told her:', ylariviPaikka:'yla', puoli:'keski', pysty:'keski', savy:'valko', koko: 7, tyttoAnimaatio: 'confused',
 //     muistiinpanot:"► I could have told her:" },
    { x: 1925, montaasiAnim: 'lusikat', ylarivi:'I could have told her:', ylariviPaikka:'yla', otsikko:'<span style="color:#FF5562;font-weight:700">One AI picture: two spoons of water.</span>', lahde:'UN University (UNU-INWEH), 2026', lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 7,
      muistiinpanot:"► (Voice) One AI picture: two spoons of water." },
//    { x: 1930, ylarivi:'I could have told her:', ylariviPaikka:'yla', puoli:'keski', pysty:'keski', savy:'valko', koko: 7, tyttoAnimaatio: 'confused',
//      muistiinpanot:"► I could have told her:" },
    { x: 1935, montaasiAnim: 'pisarat', ylarivi:'I could have told her:', ylariviPaikka:'yla', otsikko:'<span style="color:#FF5562;font-weight:700">One year of ChatGPT uses as much water as 500,000 people need at home in sub-Saharan Africa.</span>', lahde:'UN University (UNU-INWEH), 2026', lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 7,
      muistiinpanot:"► (Voice) One year of ChatGPT uses as much water as 500,000 people need at home in sub-Saharan Africa." },
//    { x: 1940, ylarivi:'I could have told her:', ylariviPaikka:'yla', puoli:'keski', pysty:'keski', savy:'valko', koko: 7, tyttoAnimaatio: 'confused',
 //     muistiinpanot:"► I could have told her:" },
    { x: 1945, montaasiAnim: 'tulva', ylarivi:'I could have told her:', ylariviPaikka:'yla', otsikko:'<span style="color:#FF5562;font-weight:700">Training GPT-4: 237 Olympic pools of water.</span>', lahde:'UN University (UNU-INWEH), 2026', lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 7,
      muistiinpanot:"► (Voice) Training GPT-4: 237 Olympic pools of water." },
//    { x: 1950, ylarivi:'I could have told her:', ylariviPaikka:'yla', puoli:'keski', pysty:'keski', savy:'valko', koko: 7, tyttoAnimaatio: 'confused',
 //     muistiinpanot:"► I could have told her:" },
    { x: 1955, montaasiAnim: 'joki', ylarivi:'I could have told her:', ylariviPaikka:'yla', otsikko:'<span style="color:#FF5562;font-weight:700">Muhos: Google’s data centre may take 20 billion litres of river water a year. 70 % goes up as steam.</span>', lahde:'Kaleva, 15.10.2025', lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 7,
      muistiinpanot:"► (Voice) Muhos: Google’s data centre may take 20 billion litres of river water a year. 70 % goes up as steam." },
 //   { x: 1960, ylarivi:'I could have told her:', ylariviPaikka:'yla', puoli:'keski', pysty:'keski', savy:'valko', koko: 7, tyttoAnimaatio: 'confused',
 //     muistiinpanot:"► I could have told her:" },
    { x: 1965, eiffel: true, ylarivi:'I could have told her:', ylariviPaikka:'yla', otsikko:'<span style="color:#FF5562;font-weight:700">By 2030, AI’s thrown-away machines could weigh 250 Eiffel Towers. Every year.</span>', lahde:'UN University (UNU-INWEH), 2026 · e-waste by 2030', lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 7,
      muistiinpanot:"► (Voice) By 2030, AI’s thrown-away machines could weigh 250 Eiffel Towers. Every year." },
 //   { x: 1970, ylarivi:'I could have told her:', ylariviPaikka:'yla', puoli:'keski', pysty:'keski', savy:'valko', koko: 7, tyttoAnimaatio: 'angry',
 //     muistiinpanot:"► I could have told her:" },
    { x: 1975, montaasiAnim: 'burger', ylarivi:'I could have told her:', ylariviPaikka:'yla', otsikko:'<span style="color:#FF5562;font-weight:700">Don’t worry about AI, also one hamburger takes 2,000 litres of water.</span>', lahde:'luonnonystava.fi, 2026', lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 7,
      muistiinpanot:"► (Voice) Don’t worry about AI, also one hamburger takes 2,000 litres of water." },

    // 9 Rytmikatko (TODO: pimennys + hiljaisuus)
    { x: 2000, pimea: true, puoli:'keski', pysty:'keski', savy:'valko', koko: 6, 
      muistiinpanot:"► (BLACK. Silence. Count to four.)" },

    // 12 Mitä annamme nuorille (energia: kodinkonehylly kuvana, EI lukuja - 15.10)
    { x: 2200, otsikko:'We give them a calculator.', teksti:[ { rivi:'<span style="color:#B0CB40;font-weight:700">And we ask: don\'t use AI for nonsense.</span>', viive: 2500 } ], puoli:'vasen', savy:'kelta', koko: 7, energia: true,
      muistiinpanot:"► So this is what we usually give young people. A calculator: count your prompts, here is what it costs. And ask them: don't use AI for nonsense, use a search engine instead.\n► And some take it seriously." },

    // 13 Mikael
    { x: 2300, otsikko:'"Because of the energy use, I try to do my schoolwork without AI. One person\'s choice still matters."', lahde:'Mikael (AI voice)', lahdeKoko: 3, puoli:'keski', pysty:'yla', savy:'kelta', koko: 5,
      muistiinpanot:"► (Voice plays the quote - don't read it)\n► Mikael, a young person I interviewed for my book: \"Because of the energy use, I try to do my schoolwork without AI. Even if everyone else uses it, I think one person's choice still matters.\"" },


    // 13 Mikael
    { x: 2350, otsikko:'"That\'s why I end up doing really stupid Google searches that take me to ten-year-old Reddit forums."', lahde:'Mikael', lahdeKoko: 3, puoli:'keski', pysty:'yla', savy:'kelta', koko: 5,
      muistiinpanot:"► (Voice plays the quote - don't read it)\n► \"That's why I end up doing really stupid Google searches that take me to ten-year-old Reddit forums. But they work.\"" },


      // 14 Mikael ja Googlen tekoälyvastaus (Jarno 13.10: näkyy Suomessa ja muualla)
    { x: 2400, haku: true,   // hakuanimaatio (esitys-2d-haku.js) - oli otsikko "Today, even the search answers with AI."
      muistiinpanot:"► We cannot escape AI anymore, it is everywhere. Mikael avoids AI and searches instead. But today, when you search on Google, the first thing you get is an AI answer." },

    // 15 BP (Musta laatikko s. 120)
    { x: 2500, ylarivi:'I could have told her: it\'s not your fault.', ylariviPaikka:'yla', tyttoAnimaatio: 'dance', otsikko:'Carbon footprint', lahde:"Launched by the oil company BP in the early 2000s", lahdeKoko: 5, puoli:'keski', pysty:'yla', savy:'kelta', koko: 8,
      muistiinpanot:"► Or I could have told her: it's not your fault.\n► Early 2000s -> the oil company British Petroleum -> the term carbon footprint in its marketing campaign -> attention would shift to individuals, not the big corporations.\n► A young person writing an essay with AI doesn't decide to train new, energy-hungry models.\n► But the blame is put on her." },

    // KÄÄNNE: annoin hänelle luvun = tein BP:n työn (EI tekstiä, sanotaan)
    { x: 2600, lisaAnim: 'kiitos', otsikko:'Did you thank AI?', teksti:[ { rivi:'<span style="color:#B0CB40;font-weight:700">Did you feel a little guilty?</span>', viive: 2500 } ], puoli:'keski', pysty:'yla', savy:'kelta', koko: 6,
      muistiinpanot:"► Did you thank AI in your last conversation?\n► Remember what I said about thank you and electricity?\n► Did you feel a little guilty? I did. So would she.\n► A twelve-year-old who says thank you to a machine, and walks home feeling bad." },

    // KÄÄNNE: lyöntilause omalla klikkauksella (15.10)
    { x: 2650, otsikko:"I would have done the oil company's work for them.", puoli:'keski', pysty:'keski', savy:'kelta', koko: 8, tyttoAnimaatio: 'confused',
      muistiinpanot:"► If I had given her those numbers, I would have done the oil company's work for them.\n► (Pause. Let it land.)" },

    // ---------------- OIL FIELD ----------------
    // v3 15.10.2026: "Nobody knows" (SISALTO.md N1-N7)
    { x: 3200, ylarivi:'I told her:', mustaLaatikko: true, hahmoAnimaatio:'Idle_Alert', otsikko:'Nobody knows.', puoli:'keski', pysty:'yla', savy:'kelta', koko: 8,
      muistiinpanot:"► I told her: nobody knows. Google says something similar." },

    { x: 3300, bisnes: 'juoksu', otsikko:'"All decisions were made with the best understanding we had of the law at the time."', lahde:"Google's country director in Finland · Yle, 13.10.2026", lahdeKoko: 2, puoli:'keski', pysty:'yla', savy:'valko', koko: 4, kortti: true,
      muistiinpanot:"► Last week Google's country director in Finland was sorry about the forests. He said: (read the quote from the screen)." },

    { x: 3400, bisnes: 'hakkuu', otsikko:'<span style="color:#FF5562;font-weight:700">Muhos 330 ha · Kajaani ~200 ha</span>', lahde:'Yle, 13.10.2026', lahdeKoko: 3, puoli:'keski', pysty:'yla', savy:'valko', koko: 8,  tyttoAnimaatio: 'chop',
      muistiinpanot:"► 330 hectares in Muhos. Almost 200 in Kajaani.\n► The world's biggest search engine. With \"the best understanding we had of the law.\" They could have asked their own AI." },

    // Gemini-chatti (esitys-2d-gemini.js): kysymys -> klikkaus -> "No."
    { x: 3450, gemini: 'kysymys', lahde:'Gemini, 14.10.2026', lahdeKoko: 2, puoli:'keski', pysty:'ala', savy:'valko', koko: 2,
      muistiinpanot:"► So I did. (the question types itself)" },
    { x: 3455, gemini: 'vastaus', lahde:'Gemini, 14.10.2026', lahdeKoko: 2, puoli:'keski', pysty:'ala', savy:'valko', koko: 2,
      muistiinpanot:"► And it answered: no, you cannot do that." },

    { x: 3500, bisnes: 'kaatuu', otsikko:"They didn't even ask.", puoli:'keski', pysty:'yla', savy:'kelta', koko: 8,
      muistiinpanot:"► They said nobody knew. But they didn't even ask their own AI. They cut the forest first." },

    { x: 3700, otsikko:'My "I don\'t know" wasn\'t the mistake.', teksti:[ { rivi:'<span style="color:#B0CB40;font-weight:700">The mistake was what I didn\'t do next.</span>', viive: 2200 } ], puoli:'keski', pysty:'yla', kortti:true, savy:'kelta', koko: 7, tyttoAnimaatio: 'idle',
      muistiinpanot:"► So my \"I don't know\" wasn't the mistake. The mistake was what I didn't do next." },

    // ---------------- FOREST (END) ----------------
    // v3: lahja - kolme kassia (TODO: kassikohtaus, nyt tekstinä)
    { x: 4300, ylarivi:'We can change',lisaAnim: 'jaakaappi', otsikko:'Same fridge. Different gas.', lahde:'Montreal Protocol, 1987', lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 8,
      muistiinpanot:"► What could I have done next? Look at how we fixed the ozone hole.\n► When the ozone hole was found, the world agreed to change the gas in the hair sprays and fridges. The fridges kept working. The ozone layer is slowly healing." },

    { x: 4350, otsikko:'"Use less AI"', teksti:[ { rivi:'<span style="color:#B0CB40;font-weight:700">gives her nothing to carry.</span>', viive: 1800 } ], puoli:'keski', pysty:'keski', savy:'valko', koko: 8,
      muistiinpanot:"► \"Use less AI\" tells her what to stop. It gives her nothing to carry." },

    { x: 4400, kassit: 0, otsikko:'Three bags.', puoli:'keski', pysty:'keski', savy:'kelta', koko: 7,  tyttoAnimaatio: 'backflip',
      muistiinpanot:"► So here are three bags. For you, to carry with her.\n► (Plastic bags appear - \"No. Not plastic.\" - they turn into fabric bags after ~3.5 s.)" },

    { x: 4450, kassit: 1, otsikko:'Ask why.', puoli:'keski', pysty:'keski', savy:'kelta', koko: 7, tyttoAnimaatio: 'confused',
      muistiinpanot:"► Don't answer with a number. Ask back: why do you ask?\n► I don't know why she asked. I never asked her." },

    { x: 4475, otsikko:'Worry = caring.', lahde:'', lahdeKoko: 3, puoli:'keski', pysty:'yla', savy:'valko', koko: 8, tyttoAnimaatio: 'jump',
      muistiinpanot:"► Her question was not really about water. It was about caring.\n► Worry is not the problem. Worry is caring.\n► And \"nobody knows\" is not the end of the conversation. It's the start: let's find out together." },

    // Kassi 1: selvitetään yhdessä - Gemini-takaisinviittaus siirretty tänne (15.10)
    { x: 4480, gemini: 'pieni', otsikko:'Let her ask. Then check it together.', puoli:'keski', pysty:'ala', savy:'kelta', koko: 7,
      muistiinpanot:"► How do we find out together? Let her ask, like I asked AI.\n► Any young person can ask the same. It took me ten seconds to find out what Google didn't know.\n► AI can help her find answers. ►Then you check them together. ►And take them to someone who decides." },

    { x: 4500, zoom: 1.0, zoomKesto: 6, kassit: 2, otsikko:'Zoom out.', teksti:[ { rivi:'What for? Who pays? Who decides?', viive: 1200 } ], puoli:'keski', pysty:'keski', savy:'kelta', koko: 7,
      muistiinpanot:"► Zoom out. One question is small. The building behind it is not.\n► What is this data centre for? Who pays? Who decides?" },

    { x: 4525, zoom: 1.0, otsikko:'Whose river?', teksti:'Muhos · Montevideo', puoli:'keski', pysty:'keski', savy:'valko', koko: 8,
      muistiinpanot:"► And where: whose river? Muhos. Montevideo." },

    { x: 4550, lisaAnim: 'sade', zoom: 1.0, otsikko:'The water comes back. As rain. Somewhere else.', lahde:'Based on: United Nations University (UNU-INWEH), 2026', lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 5, kortti: true,
      muistiinpanot:"► Someone will say: it's a closed loop, the water comes back.\n► Some of it does. As rain. Somewhere else.\n► Not to Montevideo's taps. Most of it steams away." },

    // Zoom out: tekoäly ~1/5 datakeskusten sähköstä (TODO: animaatio - ehdotetaan ensin Jarnolle)
    { x: 4570, zoom: 1.0, datakeskus: true, otsikko:'AI uses about 1/5 of the electricity in data centres.', teksti:[ { rivi:'The rest: videos, photos, games, the cloud.', viive: 1500 } ], lahde:'United Nations University (UNU-INWEH), 2026 · AI ≈ 20 % of data-centre electricity, 2025', lahdeKoko: 2, puoli:'keski', pysty:'yla', savy:'valko', koko: 7, tyttoAnimaatio: 'dance',
      muistiinpanot:"► Zoom out once more. AI uses about a fifth of the electricity in data centres. The rest is everything else we do online: videos, photos, games, the cloud." },

    { x: 4585, zoom: 1.0, otsikko:"So the question isn't only how much water or electricity AI uses.", teksti:[ { rivi:'<span style="color:#B0CB40;font-weight:700">It\'s what we build, for what, and who decides.</span>', viive: 2000 } ], puoli:'keski', pysty:'keski', savy:'kelta', koko: 7,
      muistiinpanot:"► So the question isn't only how much water or electricity AI uses. It's what we build, for what, and who decides." },

    { x: 4600, lisaAnim: 'kartta', zoom: 1.0, otsikko:'Try it with them: find the nearest data centre.', teksti:[ { rivi:'What is it for? Who pays? Who decides? <span style="color:#B0CB40;font-weight:700">Whose river?</span>', viive: 1500 } ], puoli:'keski', pysty:'keski', savy:'valko', koko: 7,
      muistiinpanot:"► Try it with them: find the nearest data centre on a map. Ask: what is it for? Who pays? Who decides? Whose river?" },

    { x: 4750, kassit: 3, otsikko:'Ask for another way.', teksti:[ { rivi:'Same data centre. A different choice.', viive: 1500 } ], puoli:'keski', pysty:'keski', savy:'kelta', koko: 7,
      muistiinpanot:"► Remember the ozone? We didn't stop cooling. We changed the gas.\n► Data centres don't have to cool themselves with drinking water. There are other ways. None of them is free. But it's a choice.\n► So help them ask the people who make the choice: could you do it another way?" },

    { x: 4775, lisaAnim: 'kyltit', otsikko:'"No es sequía, es saqueo."', teksti:[ { rivi:"It's not drought, it's plunder.", viive: 1500 } ], lahde:'Uruguay, 2023', lahdeKoko: 2, puoli:'keski', pysty:'yla', savy:'kelta', koko: 7, tyttoAnimaatio: 'angry',
      muistiinpanot:"► In Montevideo, people rallied to the streets. Their slogan: (point to the screen)\n► And Google redesigned its data centre so it would not cool itself with drinking water." },

    // valas + From Myself alkaa x:4800 (esitys-2d-hahmot.js)
    { x: 4800, otsikko:'Finland, this month:', teksti:[ { rivi:'"<span style="color:#B0CB40;font-weight:700">Stop the work."</span>', viive: 1500 } ], lahde:'Permit and Supervision Agency, Muhos and Kajaani · Yle, 8.10.2026', lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 7,
      muistiinpanot:"► And here in Finland, this month: the authority asked Google to stop the work.\n► Will they continue? Probably. Billions are at stake.\n► But now they have to wait and answer the questions. That's what asking does.\n► Not one person using less. People together, asking for another way." },

    // Neubauer: nuoret toimivat (palautettu 15.10, Jarno: toimijuus)
    { x: 4805, lisaAnim: 'nuija', otsikko:'Germany, 2021: young people went to court.', teksti:[ { rivi:'<span style="color:#B0CB40;font-weight:700">They won. The law changed.</span>', viive: 1800 } ], lahde:'Neubauer et al. v Germany, Federal Constitutional Court', lahdeKoko: 2, puoli:'keski', pysty:'yla', savy:'valko', koko: 6,
      muistiinpanot:"► In Germany, young people took the climate law to court. And they won." },

    // Kassi 3: yksi pieni askel (15.10)
    { x: 4820, lisaAnim: 'kirje', otsikko:'Help her write one question', teksti:[ { rivi:'<span style="color:#B0CB40;font-weight:700">to someone who decides.</span>', viive: 1500 } ], puoli:'keski', pysty:'yla', savy:'valko', koko: 7,
      muistiinpanot:"► Start small. Help her write one question. To the town council. The company. A politician." },

    // Kolumbia: tutkittu menetelmä nuorten kanssa (JMIR AI 2026) - TARKISTA ikä/tulos ennen kuin sanotaan enempää
    { x: 4830, lisaAnim: 'polaroid', otsikko:'Colombia: photos of their own street.', teksti:[ { rivi:'AI: 3 strengths · 3 weaknesses · 5 questions', viive: 1500 }, { rivi:'<span style="color:#B0CB40;font-weight:700">→ to the people who decide</span>', viive: 3000 } ], lahde:'De la Vega-Taboada et al., JMIR AI, 2026 · El Pozón, Colombia', lahdeKoko: 2, puoli:'keski', pysty:'yla', savy:'valko', koko: 6, tyttoAnimaatio: 'confused',
      muistiinpanot:"► Researchers tested this with young people in Colombia. They photographed the problems in their own streets: trash, standing water.\n► Then they asked AI for three strengths, three weaknesses and five questions about their idea.\n► And they took it to the people who decide." },

    // T2-käänne: sama kone, uusi tehtävä (15.10; animaatio myöhemmin: T-800 kävelee tytön rinnalla)
    { x: 4840, otsikko:'Same machine. New mission.', lahde:'', lahdeKoko: 2, puoli:'keski', pysty:'yla', savy:'kelta', koko: 8,
      muistiinpanot:"► In the first Terminator, the machine comes to destroy. ► In the second movie, the same machine comes back to protect the kid. Someone reprogrammed it.\n► AI can be the same. The machine that drinks the river can help her ask why it drinks the river. The same machine can help with big climate problems too.\n► It still costs water. So let's use it for this." },

    // 17.10.2026 UNICEF & ETF 2024 (tarkistettu raportista): 47,7 % 'Not enough' - ennen Lundya
    { x: 4870, otsikko:'Almost 50 %', teksti:[ { rivi:"of young people: not enough opportunities to be heard on climate action.", viive: 1200 } ], lahde:'UNICEF, 2024', lahdeKoko: 2, puoli:'keski', pysty:'yla', savy:'kelta', koko: 10,
      muistiinpanot:"► Almost 50% of young people say they don't have enough opportunities to be heard on climate action." },

    { x: 4900, lisaAnim: 'ovi', otsikko:'Voice is not enough.', lahde:"Laura Lundy, 'Voice' is not enough, 2007", lahdeKoko: 2, puoli:'keski', pysty:'keski', savy:'valko', koko: 8,
      muistiinpanot:"► Voice is not enough. Someone has to listen, and it has to change something.\n► They don't always listen. Google didn't. ► That's why we ask together, and in public.\n► Our job is not to give the answer.\n► It's to help them see the system, decide what matters, and act." },

    { x: 4950, lisaAnim: 'parvi', otsikko:'Hope comes from acting together,', teksti:[ { rivi:'<span style="color:#B0CB40;font-weight:700">not from being told everything will be fine.</span>', viive: 1800 } ], lahde:'Maria Ojala, Hope and climate-change engagement, 2023', lahdeKoko: 2, puoli:'keski', pysty:'yla', savy:'kelta', koko: 7,
      muistiinpanot:"► And when young people act together, they feel they are not alone.\n► Hope comes from acting together, not from being told everything will be fine." },

    { x: 5000, ylarivi:'I told her: half a litre. And also:', ylariviPaikka:'yla', otsikko:"I don't know.", puoli:'keski', pysty:'yla', savy:'kelta', koko: 9,
      muistiinpanot:"► That day in Jämsä I answered like a machine. Fast.\n► Except for three words. I don't know.\n► I made this talk with AI too: the code, some pictures, the voices.\n► I don't know what it cost the planet.\n► But the stories, the choices and the slowness were mine." },

    { x: 5020, hidasOtsikko: true, otsikko:'Slowness and curious wonder.', puoli:'keski', pysty:'keski', savy:'kelta', koko: 7,
      muistiinpanot:"► All three bags are slow. Asking why takes time. Zooming out takes time. Asking for another way takes time.\n► The most valuable thing in us is not speed, but slowness and curious wonder." },

    { x: 5100, kassit: 'kaikki', puoli:'keski', pysty:'keski', savy:'kelta', koko: 7,
      muistiinpanot:"► Gilgamesh, you remember him? He didn't ask why. He didn't zoom out. He didn't look for another way. He decided alone, for his own name." },

    { x: 5150, otsikko:"Don't let the kings decide alone.", puoli:'keski', pysty:'yla', savy:'kelta', koko: 8,  tyttoAnimaatio: 'jump',
      muistiinpanot:"► Today's kings build data centres.\n► Don't let them decide alone what it's for, and what it does to our forests and rivers." },

    // Tyttö saa toimia (15.10)
    { x: 5180, otsikko:"Let's find out. Together.", puoli:'keski', pysty:'keski', savy:'kelta', koko: 8, tyttoAnimaatio: 'backflip',
      muistiinpanot:"► Next time she asks, I'll say the same three words. I don't know. And then: let's find out. Together." },

    { x: 5200, lisaAnim: 'kiitos', otsikko:'Thank you.', puoli:'keski', pysty:'keski', savy:'kelta', koko: 10,
      muistiinpanot:"► She asked me about the cost. And then she said thank you.\n► (stand still) And here, live, it's OK to say it: Thank you." },

    // Loppukuva (15.10): ei tekstiä, valas uiskentelee silmukassa (musiikki poistettu 16.10)
    { x: 5300, perhosparvi: true,
      muistiinpanot:"► (no text - the whale swims. Stay, smile, let them clap.)" },
  ];
