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
//   { x: 1350, otsikko:'Otsikko tähän', teksti:'Leipäteksti tähän - <span style="color:#FF5562">osa</span> voi olla eriväristä.', lahde:'Sitaatin lähde', muistiinpanot:'Puhujan omat muistiinpanot (näkyy vain esittajanakyma.html:ssä)', puoli:'vasen', pysty:'yla', savy:'kelta', koko: 5 },
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
//   yhdistää otsikko/teksti-kenttien kanssa samaan pysähdykseen, tai käyttää yksinään: { x: 4590, luku:'Luku 2: Tekoäly ja yhteiskunta' }).
//   Ei tuki klikkeriä - voi jatkaa eteenpäin heti vaikka kortti olisi vielä näkyvissä.
// Ei otsikkoa/tekstiä -pysähdys (esim. "vain katso hahmoa"): { x: 1350 }
// vesi: luku (vh-korkeusprosentti) TAI { korkeus, viive } (3.9.2026, Fantasia/
//   "Olemme kaikki Mikkejä" x:4141) - nostaa läpinäkyvän #aalto-veden ruudun
//   alareunasta tälle pysähdykselle, esim. { x: 4141, vesi: 50 }. Sama elementti
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
//   { x: 12840, vertailu: { otsikot:['Hidas ihminen','Nopea kone'], rivit:[
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
//   visualisoi "ennustaa, mutta ei varmuudella". Esim: { x: 6090,
//   ennustus: { syote:'vesi', tulos:'märkä' } }. Näkyy oikeassa laidassa.
//   Kenttä lisätään esitys-data.js:ään, toteutus esitys-2d.html:ssä (naytaEnnustus()).
// youtube: 'VIDEO_ID' (7.9.2026, x:11370 "Runovideo" - Jarno: "maybe youtube
//   embed with loitsu") - näyttää koko ruudun keskellä ison YouTube-upotuksen
//   (youtube-nocookie.com/embed/VIDEO_ID, autoplay). AINOA online-riippuvainen
//   pysähdys koko esityksessä - kaikki muu pysyy täysin offline (Jarnolla on
//   nettiyhteys juuri tässä tilaisuudessa, mutta ei oteta riskiä muualla).
//   Kenttä lisätään esitys-data.js:ään, toteutus esitys-2d.html:ssä (naytaYoutube()).
// tamagotchi: true (6.9.2026, x:10990 "Antaistiko tamagotchisi tekoälylle?")
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
const PYSAHDYKSET = [
    // TEOS 25.9.2026: SISALTO.md:n neljä osaa, täytteet Pohjasta. Kaikki Pohjan
    // alkuperäiset pysähdykset säilyvät alla kommentoituina (//POHJA).

    // ======== AVAUS ========
    { x: 90, otsikko:'', puoli:'vasen', savy:'kelta', koko: 10, pysty:'keski', puoli:'keski', hahmoAnimaatio:'Sit' },
    { x: 92, otsikko:'Jarno Alastalo', puoli:'vasen', savy:'kelta', koko: 5, pysty:'keski', puoli:'vasen', hahmoAnimaatio:'Sit' },
    { x: 93, otsikko:'Miten säilyttää oma ajattelu tekoälyn aikakaudella?', teksti:'Järjestötyön inhimillinen ydin', muistiinpanot:'Kenelle puhut: Pirkanmaan hyvinvointi-, sote- ja kuntoutusjärjestöt. Kerro heti: tauon jälkeen kokeillaan itse, kaikki materiaali jää osoitteeseen csy.fi/teoskoulutus.', puoli:'vasen', savy:'kelta', koko: 7, pysty:'keski', puoli:'keski', hahmoAnimaatio:'Sit' },
    { x: 240, otsikko:'Mitkä ovat piirteet, joita kone ei voi jäljitellä?', koko: 7, muistiinpanot:'Viimeinen ydin, Demokritos: voiko ainetta jakaa loputtomiin? Atomos = jakamaton. Mitä jää ihmiselle, kun kone vie rutiinit?', atomi: true, puoli:'oikea', savy:'kelta', hahmoAnimaatio:'Jump' },
    { x: 390, otsikko:'<span style="color:#B0CB40">Tekoälyttömyys</span>,', koko: 9, savy:'valko', teksti: '1. <span style="color:#FF5562">[usein kielteinen]</span> tila, jossa tekoälyn liiallinen käyttö heikentää ihmisen oppimis- ja ajattelukykyä.', muistiinpanot:'Mitä tekoälyttömyys tarkoittaa? muistiinpanot:“Tekoälyttömyys syntyy, kun ihmiset lopettavat omien aivojensa käyttämisen.”', koko: 6, puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
    { x: 405, otsikko:'<span style="color:#B0CB40">Tekoälyttömyys</span>,', koko: 9, savy:'valko', teksti: '1. <span style="color:#FF5562">[usein kielteinen]</span> tila, jossa tekoälyn liiallinen käyttö heikentää ihmisen oppimis- ja ajattelukykyä. <br> <br> 2. <span style="color:#B0CB40">[myönteinen]</span>  kyky käyttää tekoälyä viisaasti säilyttäen inhimillinen harkinta ja itsenäinen ajattelu.', koko: 6, puoli:'vasen', savy:'kelta', },
    { x: 540, otsikko:'Jokainen meistä on jo osa uutta aikakautta', koko: 7, teksti:'"Uusi" ihminen, joka elää ja ajattelee tekoälyn rinnalla.', puoli:'oikea', savy:'valko', },

    // ======== OSA 1: MITÄ TEKOÄLY ON ========
    { x: 690, otsikko:'', muistiinpanot:'Nyt paljon pinnalla on generatiivinen tekoäly\n\nKuka käyttänyt tänään tekoälyä?', puoli:'vasen', savy:'kelta' },
    { x: 840, savy:'kelta', hahmoAnimaatio:'Idle_Alert',
      jaavuori: { viive: 1500, tasot: [
        { otsikko: 'Generatiivinen tekoäly', kohteet: ['ChatGPT','Claude','DeepSeek','Midjourney','Copilot','Gemini'] },
        { otsikko: 'Sosiaalinen media, muu media', kohteet: ['TikTok','Instagram','YouTube','Netflix','uutiset','mainokset'] },
        { otsikko: 'Järjestelmät', kohteet: ['terveyspalvelut','liikennevalot','sääennustukset','energiankulutus'] },
      ]}
    },
    { x: 990, otsikko:'Mitä jää ihmisille?', koko: 8, puoli:'keski', muistiinpanot:'Tekoälyttömyyden ajan alku Kun tekoäly tekee ajattelutyön puolestamme, ohitamme samalla oppimisen ja oivalluksen hetkiä.', savy:'kelta', hahmoZ: -60, hahmoAnimaatio:'Bark' },
    { x: 1140, otsikko:'Myytit & todellisuus', koko: 6, puoli:'keski', pysty: 'yla', savy:'valko', },
    { x: 1290, otsikko:'Hypetemppeli', koko: 7,  puoli:'oikea', savy:'kelta', },
    { x: 1365, muistiinpanot:'Loki kaapeleineen. Tekstitön - anna kuvan puhua. "Tekoäly ei ole harmaapartainen jumala. Se on Loki - muodonmuuttuja, miellyttäjä, trollaaja. Some on sen kudelmaa." (Musta laatikko s. 17, 114). Seuraava klikkaus tuo T-800:n.' },
    { x: 1400, otsikko:'Pessimismi', koko: 8, puoli:'keski', pysty:'yla', savy:'valko', muistiinpanot:'Tuomiopäivän kuvasto, jota mediassa maalaillaan.', hahmoAnimaatio:'Bark' },
    { x: 1760, otsikko:'<span style="color:#FF5562">Roko\'s Basilisk</span>', teksti:'"Tulevaisuudessa voi olla olemassa voimakas tekoäly, joka tuhoaa kaikki ihmiset, jotka eivät ole olleet mukana rakentamassa sitä."', lahde:'16-vuotias Crumble Snoop', puoli:'keski', savy:'valko', koko: 7, lahdeKoko: 4, },
    { x: 1800, teksti:'Tekoäly ei ole luonnostaan hyvä tai huono, vaan riippuu ihmisen valinnoista.', muistiinpanot:'Pivot pelottelusta - valinta on edelleen meidän. SaavutaÄly-verkostotapaamisissa sama pelko sanottiin suoraan: "Tekoälystä tulee isäntä, ei renki."', puoli:'keski', savy:'valko', koko: 7, kortti:true, hahmoAnimaatio:'Idle_Alert' },  // uusi
    { x: 1890, otsikko:'Ihminen on antanut <span style="color:#B0CB40">"elämän"</span> tietokoneelle, joka haastaa ajatuksen, että olemme kaiken keskiössä', puoli:'keski', savy:'kelta', koko: 4, hahmoAnimaatio:'Idle_Alert', },
    { x: 2040, otsikko:'Ihminen on joutunut suurten teknologisten murrosten aikana miettimään omaa rooliaan yhteiskunnassa.', puoli:'vasen', savy:'kelta', hahmoZ: -120, hahmoAnimaatio:'Sneak' },
    { x: 2340, otsikko:'Termi teko<span style="color:#B0CB40">äly</span> antaa kuvitelman siitä, että kone olisi älykäs', koko: 8, muistiinpanot:'Älykkyys on kuin kauneus – se merkitsee jokaiselle jotakin, mutta on subjektiivista eikä yksinkertaisesti arvotettavissa. Toisaalta tutkijat lähestyvät älykkyyttä matemaattisten mallien avulla, nyt tekoälyn kehityksessä, ja puhuvat esimerkiksi singulariteetista.  Loppujen lopuksi kyseessä on vain todella kehittynyt autocorrect.', puoli:'keski', savy:'kelta', hahmoAnimaatio:'Sneak', },
    { x: 2490, teksti:'"Nykyisten tekoälyjen älykkyys on leivänpaahtimen tasolla."', lahde:'Pekka Abrahamsson, tekoälyprofessori', puoli:'oikea', savy:'kelta', koko: 7, lahdeKoko: 4, },
    { x: 2630, teksti:'"Analyyttisellä koneella ei ole minkäänlaisia pyrkimyksiä luoda mitään uutta. Se voi tehdä kaiken, minkä osaamme käskeä sen suorittamaan. Sen tehtävänä on auttaa meitä hyödyntämään sitä, minkä jo tunnemme."', koko: 7, lahdeKoko: 4, muistiinpanot:'Sen tehtävä on auttaa hyödyntämään sitä minkä jo tunnemme. Tämä tekoälyn periaatteista, paitsi että Ada Lovelace sanoi näin 1800-luvulla.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
    { x: 2640, teksti:'"Analyyttisellä koneella ei ole minkäänlaisia pyrkimyksiä luoda mitään uutta. Se voi tehdä kaiken, minkä osaamme käskeä sen suorittamaan. Sen tehtävänä on auttaa meitä hyödyntämään sitä, minkä jo tunnemme."', lahde:'Ada Lovelace, 1815-1852', koko: 7, lahdeKoko: 4, muistiinpanot:'Sen tehtävä on auttaa hyödyntämään sitä minkä jo tunnemme. Tämä tekoälyn periaatteista, paitsi että Ada Lovelace sanoi näin 1800-luvulla.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
    { x: 2790, otsikko:'Artificial Intelligence', koko: 7, teksti:[
        { rivi:'Jo vuonna 1495 Leonardo da Vinci luonnosteli robottiritareita.' },
        { rivi:'Vuonna 1837 Charles Babbage suunnitteli Analytical Engine -koneen. <span style="color:#B0CB40">Ada Lovelace kirjoitti ensimmäisen tietokonealgoritmin</span>', viive:2200 },
        { rivi:'Alan Turing esitti ajatuskokeen: voivatko koneet ajatella.', viive:2200 },
        { rivi:'<span style="color:#FF5562">1956</span> John McCarthy esitteli termin Artificial Intelligence.', viive:2200 },
      ], koko: 5, muistiinpanot:'Ajatus älykkäistä koneista on vanha idea', puoli:'oikea', savy:'kelta', },
    { x: 2940, otsikko:'Älykkyys on enemmän kuin laskentaa', koko: 7, teksti:[
        { rivi: 'tietoinen ajattelu' }, 
        { rivi: 'kulttuurinen älykkyys' },
        { rivi: 'kehollinen älykkyys' },
        { rivi: 'sosiaalinen älykkyys' }, 
      ], koko: 5, muistiinpanot:'Näiden uusien teknologioiden todellinen kiehtovuus piilee siinä, miten eri lailla ne toimivat verrattuna ihmisälykkyyteen. Juuri kulttuurisesta, kehollisesta ja sosiaalisesta älykkyydestä myös asiantuntijatyö pohjimmiltaan rakentuu: neuvottelu, tulkinta, luottamus ja tilannetaju - ei pelkkä laskenta.',  puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit' },
    { x: 3090, otsikko:'Mikä tässä ajassa on erityistä?', puoli:'keski', savy:'kelta', },
    { x: 3240, otsikko:'Tekoäly on uusi käyttöliittymä koneen ja ihmisen välillä.', puoli:'keski', savy:'valko',  kortti: true ,       chattiKuvakeAi: 'kuvat/robot.png', chattiKuvakeSina: 'kuvat/jarno-avatar.png', chattiKoko: 2,
      chatti: [
        { kuka: 'ai', viesti: 'Hei Jarno, miten voin auttaa?' },
        { kuka: 'sina', viesti: 'Mikä on elämän tarkoitus?' },
        { kuka: 'ai', viesti: 'Aika iso kysymys yhdelle chatille.' },
        { kuka: 'sina', viesti: 'Yritä silti.' },
        { kuka: 'ai', viesti: '42.' },
      ]
    },
   // { x: 3390, otsikko:'Väline ei ole väline, se on viesti', kortti:true, lahde:'Marshall McLuhan', muistiinpanot:'Marshall McLuhan (väline on viesti) väline ei ole vain neutraali kanava sisällölle, vaan muuttaa jo itsessään tapaa, jolla ajattelemme, toimimme ja rakennamme yhteiskuntaa. Väline siis on viesti, koska se muokkaa todellisuuttaan riippumatta siitä, mitä sisältöä sen kautta välitetään.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
    { x: 3540, teksti:'"Ihminen on joutunut jatkuvasti perääntymään ja etsimään uusia tapoja ilmaista luovuutta, johon koneet eivät kykene. Meidän täytyy pyrkiä tukemaan tätä ihmisyyden ydintä."', lahde:'Anna-Mari Wallenberg, kognitiotieteen yliopistonlehtori, dosentti', koko: 7, lahdeKoko: 4, muistiinpanot:'Ajatus on paljon helpompi, jos näkee koneen vain työkaluna.', puoli:'oikea', savy:'kelta', kortti: true, hahmoAnimaatio:'Sit', },
    { x: 3690, otsikko:'Hei Gemini, minkälaista on olla kielimalli?', kortti:true, muistiinpanot:'LLM tarkoittaa suurta kielimallia. Miksi tekoäly teki tällaisen videon?\nTekoäly halusi näyttää, mitä sen "sisällä" oikeasti tapahtuu – koska se on hyvin erilaista kuin miltä se ulospäin näyttää.\nUlospäin se vastaa siististi ja järkevästi. Sisällä teksti hajoaa tuhansiksi pikkupaloiksi, prosessointi on rajallista ja koko "muisti" pyyhkiytyy pois jokaisen keskustelun jälkeen\nVideo oli siis tekoälyn tapa näyttää rehellisesti oma todellisuutensa – fragmentoitunut ja kaoottinen prosessi, joka tuon sujuvuuden takana piilee.', puoli:'keski', savy:'kelta', },
    { x: 3895, otsikko:'Tekoäly ei ole vain teknologia, vaan kulttuurinen ja moraalinen ilmiö.', muistiinpanot:'Tekoäly muokkaa myös tunteita, yhteisöjä ja käsitystä hyvästä elämästä.', puoli:'keski', savy:'kelta', koko: 8, kortti: true ,hahmoAnimaatio:'Sit', },  // Pohjan x:4140
    { x: 3900, otsikko:'Olemme kaikki Mikkejä taikasauvan kanssa', teksti:'', muistiinpanot:'Disneyn Fantasia. Tekoälyä on kuin magiaa viitaten Disneyn Fantasiaan. Mikki yrittää taikuudella helpottaa työtään, mutta päätyy kaaokseen - luudat monistuvat hallitsemattomasti, eikä Mikki enää pysty pysäyttämään niitä. Olemme tavallaan Mikkejä kaikki, jotka ottavat käyttöön voimia, joiden toimintaa emme täysin ymmärrä. Luomuksemme alkavat toimia tavoilla, joita emme täysin hallitse. Et voi tietää kaikkea tekoälystä – aivan kuten et voi tietää kaikkea lääketieteestä tai lainsäädännöstä.', puoli:'vasen', savy:'kelta', vesi: 50, kortti:true, hahmoAnimaatio:'Idle_Alert', },  // Pohjan x:4141
    { x: 4105, otsikko:'Tekoäly ja yhteiskunta', muistiinpanot:'meidän kielellämme on iso merkitys – tapa, jolla puhumme tekoälystä, antaa sille enemmän valtaa kuin sillä todellisuudessa on.', puoli:'keski', savy:'valko', koko: 8, },  // Pohjan x:4590
    { x: 4310, teksti:'"Kun puhutaan siitä, miten \'tekoäly teki jotain\', niin unohdamme, että todellisuudessa tekoäly on aina ihmisen luomaa."', lahde:'Laura Ruotsalainen, professori', kortti:true,  koko: 7, lahdeKoko: 4, muistiinpanot:'meidän kielellämme on iso merkitys – tapa, jolla puhumme tekoälystä, antaa sille enemmän valtaa kuin sillä todellisuudessa on.', puoli:'oikea', savy:'kelta', hahmoAnimaatio:'Sit', },  // Pohjan x:5040
    { x: 4520, otsikko:'Tekoäly on peili', teksti:'Se ei luo mitään itsenäisesti tyhjästä, vaan se on ihmiskunnan tuottaman tiedon ja toiminnan heijastuma ja kaiku<span style="color:#B0CB40"> (tekstit, kuvat, Suomi24, Reddit..)</span>', muistiinpanot:'Se toistaa olemassa olevaa, lainaten jo kertaalleen kerrottua, muokaten niistä uusia versioita.  Nykyiset tekoälymallit perustuvat ihmisen mielen toiminnan matkimiseen, erityisesti kielen ja tekstin analyysin avulla.', puoli:'vasen', savy:'kelta', koko: 6, kortti:true,  },  // Pohjan x:5115
  //  { x: 4725, otsikko:'Digitaalinen jalanjälkemme kertoo tarinan valinnoistamme, toiveistamme ja peloistamme, muodostaen digitaalisen sielun.', puoli:'oikea', savy:'puna', kortti:true, datakupla:true, hahmoAnimaatio:'Bark', },  // Pohjan x:5490
    { x: 4935, otsikko:'Hyväksyn ehdot', teksti:'', puoli:'keski', savy:'kelta', koko: 6, paperipino: { korkeusProsentti: 0.2,  pinot: [ { maara: 18000, yksikko: 'Microsoft' }, { maara: 31000, yksikko: 'TikTok' } ] }, hahmoAnimaatio:'Rest_Pose', },  // Pohjan x:5640
    { x: 5140, otsikko:'Tekoäly on riippuvainen ihmisen tiedosta ja säännöistä.', teksti:'Se ei tiedä oikeaa vastausta, se arvaa todennäköisimmän.', muistiinpanot:'Tämä on hallusinaation ydin: kone ei hae faktaa muistista, vaan laskee tilastollisesti todennäköisimmän seuraavan sanan. Siksi väärä vastaus voi kuulostaa yhtä varmalta kuin oikea - esim. rahoittajan ehdon tulkinta tai jäsenen etuusasia, jonka kone selittää itsevarmasti mutta väärin. Kone ei tiedä, ettei se tiedä.', puoli:'vasen', savy:'kelta', ennustus: { syote:'vesi', tulos:'märkä' }, koko: 5, hahmoAnimaatio:'Idle_Alert', },  // Pohjan x:6090
    { x: 5350, otsikko:'Data on tekoälyvinoumien polttoaine', muistiinpanot:'Tekoälyn koulutukseen käytetty data ei ole neutraalia. Se kantaa mukanaan yhteiskuntamme ennakkoluuloja, historiallisia vääristymiä ja vallitsevia stereotypioita.  Kun tekoäly oppii tästä datasta, se ei ainoastaan toista näitä vinoumia vaan myös vahvistaa niitä.', puoli:'keski', savy:'valko', koko: 6,   hahmoAnimaatio:'Howl', },  // Pohjan x:6390

 { x: 5400, otsikko:'Tekoäly toimii kuten se on ohjelmoitu. Se heijastaa yhteiskuntamme vinoutunutta todellisuutta.', puoli:'oikea', savy:'kelta', },
{ x: 5450, otsikko:'Kun kysyt "tyhmiä" tekoälyltä, se vastaa myös tyhmästi. Keskustele ja väännä rautalangasta.', teksti:'', puoli:'oikea', savy:'kelta', kortti:true, },


  
    // ======== OSA 2: MITÄ SE TEKEE AJATTELULLE ========
    { x: 5555, otsikko:'Tekoäly on ajattelun GPS', muistiinpanot:'On paljon näyttöä siitä, että tapamme ratkoa älyllisiä ongelmia juontuu tavastamme suunnistaa fyysisessä maailmassa.\n Eksymme välillä, opimme. Virheet ja oivallukset syntyvät usein omasta aktiivisesta oppimisesta.', puoli:'keski', koko: 8, savy:'kelta', },  // Pohjan x:3840
    { x: 5760, teksti:'"Annan tekoälyn tehdä läksyjä puolestani toisinaan, vaikka tiedän, että en opi niin tehokkaasti."', lahde:'24-vuotias Mykola', puoli:'vasen', savy:'kelta', koko: 7, lahdeKoko: 4, kortti:true, hahmoAnimaatio:'Sit', },  // Pohjan x:3990
    { x: 5970, otsikko:'Kysymällä jatkuvasti: "Miten tämä toimii ja miksi?" pidämme oppimisen ja oman ajattelun elossa.', teksti:'', muistiinpanot:'Kun pelko ja mystiikka korvataan avoimella keskustelulla, tekoäly lakkaa olemasta uhka ja muuttuu välineeksi.', puoli:'vasen', savy:'kelta', kortti:true,  },  // Pohjan x:4440
    { x: 6175, teksti:'Sokrates varoitti, että kirjoitustaito voisi heikentää ihmisten muistia ja ymmärrystä.', lahde:'Sokrates, n. 470-399 eaa.', puoli:'keski', savy:'kelta', koko: 9, lahdeKoko: 4, hahmoAnimaatio:'Sit', muistiinpanot:'Pelko ei ole uusi. Jokainen murros on herättänyt saman kysymyksen - ja nyt tutkimus alkaa vastata siihen (seuraavaksi MIT).', },  // Pohjan x:2190
    { x: 6385, otsikko:'Aivojen loppu vai uusi alku?', muistiinpanot:'Jos ulkoistamme ajattelun koneelle, lihas alkaa rappeutua (kognitiivinen velka). MIT 	1. ryhmä käytti ChatGPT-tekoälyä. 2. tavallista hakukonetta. 3. ryhmä kirjoitti ilman mitään teknisiä apuvälineitä. Tulos: Tekoälyä käyttäneiden aivotoiminta oli huomattavasti passiivisempaa. Aivojen eri alueiden välinen viestintä väheni, ja seurauksena oli heikompi muistin muodostuminen.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Howl', },  // Pohjan x:9840
    { x: 6590, otsikko:'Luku- ja kirjoitustaidon ydin on kyky jäsentää ajatuksia ja esittää ne', teksti:'Juuri nämä taidot ovat tekoälyn käytön kivijalka', puoli:'oikea', savy:'kelta', koko:7, kortti:true, hahmoAnimaatio:'Sit', muistiinpanot:'Oma tarina: Minulla on tarinankertojan mieli. Luen paljon. Kirjoitan aika paljon. Ja silti mietin, mitä tekoäly tekee minulle. Mutta juuri näiden taitojen ansiosta olen oppinut käyttämään tekoälyä todella hyvin. (-> George R. R. Martin)', },  // Pohjan x:10140
    { x: 6800, otsikko:'"Lukija elää tuhat elämää ennen kuolemaansa. Joka ei koskaan lue, elää vain yhden."', lahde:'George R. R. Martin, Lohikäärmetanssi', puoli:'keski', pysty: 'keski', savy:'vihrea', kortti:true, koko: 6, lahdeKoko: 4, hahmoAnimaatio:'Idle_Alert', },  // Pohjan x:10290
    { x: 7005, otsikko:'"Joka ei koskaan lue koko tekstiä, vaan antaa tekoälyn tiivistää ja oikaista lukemisen, elää vain suodatetun elämän."', teksti: '', lahde:'', puoli:'keski', pysty: 'keski', savy:'kelta', kortti:true, koko: 4, lahdeKoko: 4, hahmoAnimaatio:'Sit', },  // Pohjan x:10399
    { 
      x: 7300, 
      otsikko: 'Chihuahua vai mustikkamuffinssi?', 
      teksti: 'Tekoälylukutaito kuuluu kaikille. Ei tarvitse osata koodata ymmärtääksesi tekoälyn rajoitteet.', 
      muistiinpanot: 'Tekoälystä puhutaan usein niin monimutkaisesti, että ihmiset ulkoistavat ymmärryksen IT-osastolle. Mutta tekoälylukutaito on uusi kansalaistaito. Kun näet kuvan chihuahuasta ja muffinssista, ymmärrät heti tekoälyn ytimen ilman koodarintaustaa. Teidän ei tarvitse tietää miten algoritmi on koodattu, vaan mitä se osaa ja mitä ei. Jokainen asiantuntija on oman alansa tekoälyasiantuntija.', 
      puoli: 'vasen', 
      savy: 'kelta',
      koko: 4, hahmoAnimaatio:'Jump'
    },  // Pohjan x:10591
    { x: 7420, otsikko:'Kone ei ajattele', teksti:'…ja ajattelu on kaiken luovuuden lähtökohta', muistiinpanot:'Luovuus ei ole sitä että tekee taidetta vaan myös sitä mitä teette', puoli:'vasen', savy:'kelta', koko: 6, kortti:true, hahmoAnimaatio:'Sit', },  // Pohjan x:11940
    { x: 7630, otsikko:'Ihmisen supervoima verrattuna tekoälyyn?', muistiinpanot:'Miten välttää kognitiivinen velka tekoälyä käyttäessä?', puoli:'keski', savy:'kelta', kortti:true, },  // Pohjan x:12540
    { x: 7835, otsikko:'HITAUS!', teksti:'', muistiinpanot:'Kone ajattelee miljoonakertaisesti nopeammin Inhimillisen ajattelun vastarinta', puoli:'keski', savy:'kelta', koko: 10, hahmoAnimaatio:'Sit', },  // Pohjan x:12690
    { x: 8040, vertailu: { otsikot:['Hidas ihminen','Nopea kone'], rivit:[
        { vasen:'<span style="color:#FBFCE2">Hidas, harkitseva, reflektiivinen</span>', oikea:'<span style="color:#FBFCE2">Nopea, automaattinen, vaivaton</span>' },
        { vasen:'<span style="color:#E3C1A6">Kysyy, epäilee, ymmärtää</span>', oikea:'<span style="color:#E3C1A6">Käsittelee dataa valonnopeudella</span>' },
        { vasen:'<span style="color:#B0CB40">Tekee tilaa viisaudelle, ei vain tehokkuudelle</span>', oikea:'<span style="color:#B0CB40">Tuottaa vastauksia, mutta ei ymmärrystä</span>' },
    ] }, puoli:'keski', savy:'kelta', koko: 6, kortti:true, hahmoAnimaatio:'Sit', },  // Pohjan x:12840
    { x: 8250, otsikko:'Meidän tehtävämme ei ole kilpailla koneen nopeudessa, vaan hidastaa niin, että ehdimme olla ihmisiä.', muistiinpanot:'Opimme virheistä, kone ei', puoli:'oikea', savy:'kelta', koko:6, hahmoZ: 44, hahmoAnimaatio:'Sit', kortti:true, },  // Pohjan x:12990

    // ======== OSA 3: JÄRJESTÖTYÖN INHIMILLINEN YDIN ========
    { x: 8455, otsikko:'Mitä jää ihmiselle?', puoli:'keski', pysty: 'keski', koko: 8, savy:'valko', },  // Pohjan x:9690
    { x: 8665, teksti:'"Tekoäly ei voi aidosti ymmärtää tunteita, mutta se osaa käyttäytyä kuin ymmärtäisi. Joskus sekin voi riittää."', lahde:'17-vuotias nuori', puoli:'vasen', savy:'kelta', koko: 7, lahdeKoko: 4, kortti:true, hahmoAnimaatio:'Sit', },  // Pohjan x:9240
 //   { x: 8870, otsikko:'Onko tekoälyn antama huomio vain plasebo?', teksti:'Kipulääke vaikutti nopeammin ja kesti pidempään, kun sen antoi hoitaja eikä automaatti. Plasebo auttoi vain ihmisen antamana.', lahde:'Niina Junttila, yksinäisyystutkija (Musta laatikko, s. 101)', lahdeKoko: 4, muistiinpanot:'"Kun ihminen koskettaa ja on läsnä välittömässä kontaktissa, se auttaa. Kokemus siitä, että joku haluaa huolehtia ja välittää, tekee meille selkeästi hyvää myös fysiologisesti." TÄMÄ on järjestötyön ydin - sano se ääneen.', puoli:'oikea', savy:'kelta', koko: 6, kortti:true, hahmoAnimaatio:'Sit' },  // uusi
    { x: 9080, teksti:'"Ihmisen antama huomio tulee olemaan niukka resurssi. Se tunne, jonka ihmisen antama huomio synnyttää, tulee olemaan nuorille yhtä tärkeää tulevaisuudessa kuin se on tänään."', lahde:'Neil Lawrence, Musta laatikko -kirjassa', koko: 7, lahdeKoko: 4, muistiinpanot:'Te sen tiedätte', puoli:'vasen', savy:'kelta', kortti:true, hahmoAnimaatio:'Sit', },  // Pohjan x:12240
  //  { x: 9285, otsikko:'', teksti:'Katri Saarikivi', pysty:'ala', puoli:'oikea', savy:'kelta', kortti:true, },  // Pohjan x:12390
  //  { x: 9495, otsikko:'Kaksoiseriarvoisuus: "Kuka saa ihmisen?"', teksti:'Vain rikkailla ja hyväosaisilla on varaa aitoon inhimilliseen läsnäoloon. Haavoittuvimmat ryhmät ohjataan halpojen itsepalvelubottien armoille.', lahde:'Vrt. Brandeis Marshall, PhD, "Data Conscience: Algorithmic Siege on Our Humanity" (2022)', lahdeKoko: 3, muistiinpanot:'Plasebon jälkeen tämä osuu: juuri teidän asiakkaanne ovat niitä, joille botti tarjotaan ensimmäisenä.', puoli:'vasen', savy:'puna', koko: 5, kortti:true },  // uusi
 //   { x: 9700, otsikko:'Me emme enää kysy, osaako järjestön koordinaattori tehdä kehotteita.', teksti:[
 //       { rivi: 'Me kysymme, osaako tekoälyä käyttää se ihminen, jonka hätää järjestö on olemassa ratkaisemassa.' },
 //       { rivi: '<span style="color:#EFAF5B">"Tekoäly poistaa esteitä ja tuo minut samalle tasolle muiden kanssa."</span>' },
 //     ], lahde:'Lukivaikeuden kanssa elävä Kaneli', lahdeKoko: 4, koko: 4, kortti:true, muistiinpanot:'Järjestöt miettivät, miten HE osaavat käyttää tekoälyä. Vaikuttavuuden kannalta tärkeämpää voisi olla auttaa ihmisiä käyttämään tekoälyä omaan hyvinvointiinsa.', puoli:'oikea', savy:'kelta', hahmoAnimaatio:'Idle_Alert', },  // Pohjan x:10470
//    { x: 9905, otsikko:'Viekö tekoäly työpaikat?', muistiinpanot:'tai seuraava kysymys', puoli:'keski', savy:'valko', koko: 8, },  // Pohjan x:10740
 //   { x: 10115, otsikko:'Työ on ollut ihmisen identiteetin perusta – mitä jää, kun kone tekee sen?', muistiinpanot:'Kun kysytään mitä kuuluu, helposti kerrotaan mitä tehnyt töissä,  TAI MITÄ KUN TEKEE NIITÄ JOTKA KUULUVAT YTIMEEN, LUOVUUTEEN? KuTEN BIISIT', puoli:'oikea', savy:'kelta', koko: 6, hahmoAnimaatio:'Sit', },  // Pohjan x:10890
    { 
      x: 10320, 
      otsikko: 'Antaistiko tamagotchisi tekoälylle?', 
      teksti: [
        { rivi: 'Jos tekoäly hoitaa lemmikkisi tai pelaa puolestasi,' },
        { rivi: 'koko tekemisen ydin katoaa.' },
        { rivi: 'Tekoäly on loistava siinä, mistä haluamme eroon,' },
        { rivi: 'ja huono siinä, mikä antaa elämälle tarkoituksen.' }
      ], 
      muistiinpanot: 'Jos tekoäly pelaa puolestasi tai hoitaa lemmikkiäsi, koko tekemisen pointti katoaa. Sama pätee työhön. Tekoäly on erinomainen työkalu niihin tehtäviin, joista haluamme päästä eroon. Mutta se on huono asioissa, jotka antavat elämälle ja työlle tarkoituksen. Tekoälyn lupaus on ajan säästäminen, mutta ihmiset eivät halua vain tyhjää vapaa-aikaa – me haluamme merkityksellistä tekemistä ja aitoja kohtaamisia.', 
      puoli: 'oikea', 
      savy: 'kelta', 
      koko: 5,
      kortti: true,
      tamagotchi: true,
      hahmoAnimaatio: 'Jump'
    },  // Pohjan x:10990
//    { x: 10530, teksti:'"Saisin tehdä rutiinitöitä jatkossakin - tiskaaminenkin rentouttaa."', lahde:'SaavutaÄly-verkostotapaaminen', lahdeKoko: 4, muistiinpanot:'Ei kaikille tehostaminen ole tavoite itsessään - joillekin rutiini on hengähdystauko, ei taakka. Hetki naurulle ennen viimeistä osaa.', puoli:'keski', savy:'kelta', koko: 7, kortti:true, hahmoAnimaatio:'Sit' },  // uusi

    // ======== OSA 4: MIKSI JA MITEN - SILTA HARJOITUKSIIN ========
 //   { x: 10735, otsikko:'Samaan aikaan kun yritykset polttavat miljardeja chattibotteihin, järjestöt tekevät niillä vähäisillä pennosillaan ihmeitä.', teksti:[
 //       { rivi: 'Tunnistavat nuorten itsemurhariskejä (The Trevor Project).' },
 //       { rivi: 'Etsivät olemassa olevista lääkkeistä ratkaisuja syöpään (RebootRx).' },
 //     ], lahde:'Fast Forward / SSIR, "Mapping the Landscape of AI-Powered Nonprofits", heinäkuu 2024', lahdeKoko: 3, muistiinpanot:'Tästä alkaa "miksi": järjestöt näyttävät jo tietä, miten tekoäly valjastetaan ihmisoikeuksien, saavutettavuuden ja hätäavun työkaluksi.', puoli:'keski', savy:'vihrea', koko: 4, kortti:true },  // uusi
 //   { x: 10945, otsikko:'Sähkömoottori-paradoksi', teksti:'Kun tehtaat siirtyivät höyrystä sähköön, tuottavuus ei aluksi noussut lainkaan.', kortti:true, muistiinpanot:'Miksi? Koska uudet sähkömoottorit sijoitettiin vain vanhojen höyrykoneiden tilalle. Vasta kun koko tehtaan pohjapiirros ja työnkulku suunniteltiin uusiksi, teho kasvoi. Sama pätee tekoälyyn: jos vain korvaat yhden ihmisen tai rutiinin chatbotilla, mikään ei parane. Koko prosessi pitää miettiä uusiksi.', puoli:'keski', savy:'valko', koko: 8, hahmoAnimaatio:'Idle_Alert', },  // Pohjan x:11417
 //   { x: 11150, teksti:'Tekoäly = päätöksenteon pullonkaulojen poistaja. <br><span style="color:#B0CB40"> Nopeuttaa päätöksiä, ei tee niistä viisaampia. </span><br> Tekoäly = laskutoimituksia ja algoritmeja.', puoli:'oikea', savy:'kelta', kortti:true, koko:6, },  // Pohjan x:4290
    { x: 11360, otsikko:'Viisas tekoälyttömyys', teksti:[
        { rivi: 'Mitkä asiat ärsyttävät, vievät aikaa siltä mitä oikeasti haluaa tehdä?' },
        { rivi: 'Raportit' },
        { rivi: 'Avustushakemukset' },
        { rivi: 'Viestintä' },
        { rivi: 'Jatkuvat rutiinit' },
        // POHJA: vaihda rivit yleisön mukaan (taiteilijat: Näyttelytekstit, Apurahahakemukset, Raportit, Viestintä)
      ], muistiinpanot:'Kysy salilta: mikä teillä? Nämä ovat harjoitusten 1-2 aiheet.', koko: 7, puoli:'keski', savy:'valko', kortti:true, },  // Pohjan x:11420
    { x: 11565, otsikko:'Hampurilaismalli', teksti:[
        { rivi: '🍞 Ihminen: tavoite, konteksti, rajaus - "mitä halutaan saavuttaa?"' },
        { rivi: '🥩 Tekoäly: luonnos, tiivistys, lista, ideointi - "raakatyö"' },
        { rivi: '🍞 Ihminen: arviointi, tunneäly, päätöksenteko - "onko tämä totta? onko tämä viisasta?"' },
      ], muistiinpanot:'Ajatus: ei anneta kaikkea tekoälylle, vaan ihminen pitää pakettia kasassa alusta loppuun (Jarnon oma sanelema kuvaus, ei dokumentista). Ulkoista työvaihe - älä lopputulosta. Sama malli on harjoitusoppaan alussa.', koko: 6, puoli:'keski', savy:'kelta', kortti:true, },  // Pohjan x:11440
    { x: 11775, otsikko:'Tämä esitys', koko: 6, puoli:'keski', savy:'valko', kortti:true, },  // Pohjan x:11380
    { x: 11980, otsikko:'Some-agentti – LinkedIn', koko: 6, puoli:'vasen', savy:'kelta', kortti:true, },  // Pohjan x:11390
    { x: 12185, otsikko:'Kokonainen kirja tekoälyllä - Claude Fable', koko: 6, puoli:'oikea', savy:'kelta', kortti:true, },  // Pohjan x:11400
    { x: 12395, otsikko:'Gemini Notebook (entinen NotebookLM)', teksti:'', koko: 6, puoli:'keski', savy:'kelta', kortti:true, },  // Pohjan x:11487
//    { x: 12600, otsikko:'Uusi koodauskieli on oma äidinkielemme.', teksti:'Kun järjestössä syntyy tarve tietylle ratkaisulle, järjestöt koodaavat sen itse tekoälyllä. Koodaamisesta tulee sosiaalinen taito - ei koodirivejä, vaan kykyä selittää tekoälylle ihmisen hätä, konteksti ja tavoite.', muistiinpanot:'Tämä on promptaamisen ydin - ja teidän ammattitaitoanne. Te osaatte kuvata ihmisen hädän paremmin kuin kukaan.', puoli:'oikea', savy:'vihrea', koko: 5, kortti:true },  // uusi
    { x: 12810, otsikko:'Energiatehokas tekoälyvuorovaikutus (Promptaus)', teksti:'Vältä "promptirulettia": Muotoile heti alussa yksi kattava ja täsmällinen kehote (tavoitteet, tyyli ja tarkat rajaukset).', koko: 6, puoli:'keski', savy:'kelta', kortti:true, },  // Pohjan x:11482
//    { x: 13015, otsikko:'Kun kysyt "tyhmiä" tekoälyltä, se vastaa myös tyhmästi. Keskustele ja väännä rautalangasta.', teksti:'', puoli:'oikea', savy:'kelta', kortti:true, },  // Pohjan x:6843
    { x: 13225, otsikko:'"95-malli"', teksti:[
        { rivi: '"<span style="color:#B0CB40">Jos et ole 95 % varma asiasta, kysy ja varmista minulta ennen kuin teet mitään.</span>"' },
      ], muistiinpanot:'Yksi lause kehotteen loppuun - tekoäly kysyy eikä arvaa. Näette tämän harjoituksessa 2.', koko: 6, puoli:'keski', savy:'valko', kortti:true, },  // Pohjan x:11488
    { x: 13430, otsikko:'Jos tekoäly vapauttaa tunnin paperitöistä, se on tunti lisää ihmiselle.', teksti:'Kone ei koe myötätuntoa, mutta se voi vapauttaa ihmisen kokemaan sitä.', muistiinpanot:'"Te ette ole järjestössä tullaksenne hyviksi raporttien kirjoittajiksi, vaan ihmisten kohtaajiksi."', puoli:'oikea', savy:'kelta', kortti:true, hahmoAnimaatio:'Sit', },  // Pohjan x:11490
 //   { x: 13640, otsikko:'Miten rahoittaja tappaa järjestön eettisesti?', teksti:[
 //       { rivi: '<span style="color:#607087">Yritysmaailma:</span> tekoäly tuo 20 % ajansäästön - irtisanotaan, uusia ei palkata tai eurot otetaan ulos voittona.' },
 //       { rivi: '<span style="color:#97B06C">Järjestökenttä:</span> sama aikasäästö käytetään parempaan kohtaamiseen. Tämä on SROI-vaikuttavuutta.' },
 //       { rivi: '<span style="color:#FF5562">Ansa:</span> rahoittaja joka katsoo vain euroja, rankaisee järjestöä hyvän tekemisestä.' },
 //     ], muistiinpanot:'20 % on esimerkkiluku, ei tutkittu tilasto - sano ääneen tarvittaessa. Tapahtuman otsikko ("lisää aikaa kohtaamiselle") käännettynä vaatimukseksi.', puoli:'keski', savy:'puna', koko: 4, kortti:true },  // uusi
    { x: 13845, otsikko:'Viisas tekoälyttömyys on kykyä valita – <span style="color:#FBFCE2">milloin tekoäly tukee ihmisyyttä ja milloin se heikentää sitä.</span>', puoli:'keski', savy:'kelta', kortti:true, hahmoAnimaatio:'Sit', },  // Pohjan x:13290

    // ======== KIITOS ========
    { x: 13890, otsikko:'Kiitos!', teksti:'Jarno Alastalo · jarno@csy.fi<br><span style="color:#B0CB40; font-size:1.7em; font-weight:800;">csy.fi/teoskoulutus</span>', muistiinpanot:'Tauon jälkeen kokeillaan. Ota Google-tili valmiiksi auki, puhelin tai läppäri.', puoli:'vasen', savy:'valko', hahmoZ: 46, hahmoAnimaatio:'Sit' },

//SCENE: metsa-eder-muniz 
//POHJA   { x: 90, otsikko:'', puoli:'vasen', savy:'kelta', koko: 10, pysty:'keski', puoli:'keski', hahmoAnimaatio:'Sit' },
//POHJA     { x: 92, otsikko:'Jarno Alastalo', puoli:'vasen', savy:'kelta', koko: 5, pysty:'keski', puoli:'vasen', hahmoAnimaatio:'Sit' },
//POHJA     { x: 93, otsikko:'ESITYKSEN NIMI TÄHÄN', muistiinpanot:'POHJA: vaihda otsikko. Aloita mainitsemalla kenelle puhut (yleisö, tilaisuus, kesto). "Kysy mitä vain."', puoli:'vasen', savy:'kelta', koko: 10, pysty:'keski', puoli:'keski', hahmoAnimaatio:'Sit' },

//POHJA     { x: 240, otsikko:'Mitkä ovat piirteet, joita kone ei voi jäljitellä?', koko: 7, muistiinpanot:'Viimeinen ydin, Demokritos', puoli:'oikea', savy:'kelta', hahmoAnimaatio:'Jump' },
    //tähän atomi animaatio
    
//POHJA     { x: 390, otsikko:'<span style="color:#B0CB40">Tekoälyttömyys</span>,', koko: 9, savy:'valko', teksti: '1. <span style="color:#FF5562">[usein kielteinen]</span> tila, jossa tekoälyn liiallinen käyttö heikentää ihmisen oppimis- ja ajattelukykyä.', muistiinpanot:'Mitä tekoälyttömyys tarkoittaa? muistiinpanot:“Tekoälyttömyys syntyy, kun ihmiset lopettavat omien aivojensa käyttämisen.”', koko: 6, puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
    
//POHJA     { x: 405, otsikko:'<span style="color:#B0CB40">Tekoälyttömyys</span>,', koko: 9, savy:'valko', teksti: '1. <span style="color:#FF5562">[usein kielteinen]</span> tila, jossa tekoälyn liiallinen käyttö heikentää ihmisen oppimis- ja ajattelukykyä. <br> <br> 2. <span style="color:#B0CB40">[myönteinen]</span>  kyky käyttää tekoälyä viisaasti säilyttäen inhimillinen harkinta ja itsenäinen ajattelu.', koko: 6, puoli:'vasen', savy:'kelta', },
    
//POHJA     { x: 540, otsikko:'Jokainen meistä on jo osa uutta aikakautta', koko: 7, teksti:'"Uusi" ihminen, joka elää ja ajattelee tekoälyn rinnalla.', puoli:'oikea', savy:'valko', },
//POHJA     { x: 690, otsikko:'', muistiinpanot:'Nyt paljon pinnalla on generatiivinen tekoäly\n\nKuka käyttänyt tänään tekoälyä?', puoli:'vasen', savy:'kelta' },
    // jäävuori: kolme tasoa paljastuvat peräkkäin + läpinäkyvä aalto nousee
    // (Jarnon idea 2.9.2026: "under surface is lot, we often see only
    // generative AI" - jäävuorivertaus, näkyvä huippu vs. piilossa oleva
    // massa). Muokkaa/lisää kohteita vapaasti - tämä on ehdotus.
//POHJA     { x: 840, savy:'kelta', hahmoAnimaatio:'Idle_Alert',
//POHJA       jaavuori: { viive: 1500, tasot: [
//POHJA         { otsikko: 'Generatiivinen tekoäly', kohteet: ['ChatGPT','Claude','DeepSeek','Midjourney','Copilot','Gemini'] },
//POHJA         { otsikko: 'Sosiaalinen media, muu media', kohteet: ['TikTok','Instagram','YouTube','Netflix','uutiset','mainokset'] },
//POHJA         { otsikko: 'Järjestelmät', kohteet: ['terveyspalvelut','liikennevalot','sääennustukset','energiankulutus'] },
//POHJA       ]}
//POHJA     },
//POHJA     { x: 855,},
  //pesukone

//POHJA     { x: 990, otsikko:'Mitä jää ihmisille?', koko: 8, puoli:'keski', muistiinpanot:'Tekoälyttömyyden ajan alku Kun tekoäly tekee ajattelutyön puolestamme, ohitamme samalla oppimisen ja oivalluksen hetkiä.', savy:'kelta', hahmoZ: -60, hahmoAnimaatio:'Bark' },
//POHJA     { x: 1140, otsikko:'Myytit & todellisuus', koko: 6, puoli:'keski', pysty: 'yla', savy:'valko', },
//POHJA     { x: 1290, otsikko:'Tekoäly on jumala?', koko: 7,  puoli:'oikea', savy:'kelta', },
//POHJA     { x: 1300, teksti:'"Tekoälyn ja uskonnon välillä on yllättävän paljon yhtäläisyyksiä. Molemmat käsittelevät toisenlaista älykkyyttä, jolla on erilaiset voimat kuin meillä ihmisillä."', lahde:'Neil Lawrence, tekoälyprofessori, Cambridgen yliopisto', lahdeKoko: 4, muistiinpanot:'Uskonto auttaa ihmistä selittämään tuntematonta ja välttelemään vastuuta teoistaan Jumalaa on myös helpompi syyttää, kuin miettiä omien tekojen seuraamuksia. Ihmiselle on ominaista selittää selittämätöntä, usein jollakin tutulla.  Nyt tekoälyä on puettu samalla tavoin ihmismäiseen hahmoon', puoli:'oikea', savy:'kelta', koko: 7, hahmoZ: 44, hahmoAnimaatio:'Bark' },
//POHJA { x: 1350, otsikko:'Uskonto auttaa ihmistä selittämään tuntematonta ja välttelemään vastuuta teoistaan', teksti:'Nyt tekoälyä on puettu samalla tavoin ihmismäiseen hahmoon',muistiinpanot:'Siksi jumalat muistuttavat usein ihmisiä tai eläimiä. Jumalaa on myös helpompi syyttää, kuin miettiä omien tekojen seuraamuksia. Ihmiselle on ominaista selittää selittämätöntä, usein jollakin tutulla.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Idle_Alert' },
  
    // Musta laatikko cover, ei tekstiä — pelkkä hetki katsoa kantta (Jarnon pyyntö 26.8.2026)
//POHJA     { x: 1365, muistiinpanot:'Loki kaapeleineen (kuva, kipinät). Tekstitön pysähdys - anna kuvan puhua, seuraava klikkaus tuo T-800:n.' },
    // Mech-ylitys, ei tekstiä — Jarnon pyyntö 2.9.2026 "i want robot walk
    // when there is no text on screen" - oma tyhjä pysähdys, EI jaettu
    // seuraavan tekstin kanssa (ks. esitys-2d-hahmot.js:n YLITYSHAHMOT).
//POHJA     { x: 1400, hahmoAnimaatio:'Bark' },
    // Loki, ei tekstiä — pelkkä hetki katsoa hahmoa (Jarnon pyyntö 26.8.2026)
    
    
//POHJA     { x: 1760, otsikko:'<span style="color:#FF5562">Roko\'s Basilisk</span>', teksti:'"Tulevaisuudessa voi olla olemassa voimakas tekoäly, joka tuhoaa kaikki ihmiset, jotka eivät ole olleet mukana rakentamassa sitä."', lahde:'16-vuotias Crumble Snoop', puoli:'keski', savy:'valko', koko: 7, lahdeKoko: 4, },
    
//POHJA     { x: 1890, otsikko:'Ihminen on antanut <span style="color:#B0CB40">"elämän"</span> tietokoneelle, joka haastaa ajatuksen, että olemme kaiken keskiössä', puoli:'keski', savy:'kelta', koko: 4, hahmoAnimaatio:'Idle_Alert', },
//POHJA     { x: 2040, otsikko:'Ihminen on joutunut suurten teknologisten murrosten aikana miettimään omaa rooliaan yhteiskunnassa.', puoli:'vasen', savy:'kelta', hahmoZ: -120, hahmoAnimaatio:'Sneak' },
//POHJA     { x: 2190, teksti:'Sokrates varoitti, että kirjoitustaito voisi heikentää ihmisten muistia ja ymmärrystä.', lahde:'Sokrates, n. 470-399 eaa.', puoli:'keski', savy:'kelta', koko: 9, lahdeKoko: 4, hahmoAnimaatio:'Sit', },
    
  
    
//POHJA     { x: 2340, otsikko:'Termi teko<span style="color:#B0CB40">äly</span> antaa kuvitelman siitä, että kone olisi älykäs', koko: 8, muistiinpanot:'Älykkyys on kuin kauneus – se merkitsee jokaiselle jotakin, mutta on subjektiivista eikä yksinkertaisesti arvotettavissa. Toisaalta tutkijat lähestyvät älykkyyttä matemaattisten mallien avulla, nyt tekoälyn kehityksessä, ja puhuvat esimerkiksi singulariteetista.  Loppujen lopuksi kyseessä on vain todella kehittynyt autocorrect.', puoli:'keski', savy:'kelta', hahmoAnimaatio:'Sneak', },
//POHJA     { x: 2490, teksti:'"Nykyisten tekoälyjen älykkyys on leivänpaahtimen tasolla."', lahde:'Pekka Abrahamsson, tekoälyprofessori', puoli:'oikea', savy:'kelta', koko: 7, lahdeKoko: 4, },
//POHJA     { x: 2630, teksti:'"Analyyttisellä koneella ei ole minkäänlaisia pyrkimyksiä luoda mitään uutta. Se voi tehdä kaiken, minkä osaamme käskeä sen suorittamaan. Sen tehtävänä on auttaa meitä hyödyntämään sitä, minkä jo tunnemme."', koko: 7, lahdeKoko: 4, muistiinpanot:'Sen tehtävä on auttaa hyödyntämään sitä minkä jo tunnemme. Tämä tekoälyn periaatteista, paitsi että Ada Lovelace sanoi näin 1800-luvulla.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
//POHJA     { x: 2640, teksti:'"Analyyttisellä koneella ei ole minkäänlaisia pyrkimyksiä luoda mitään uutta. Se voi tehdä kaiken, minkä osaamme käskeä sen suorittamaan. Sen tehtävänä on auttaa meitä hyödyntämään sitä, minkä jo tunnemme."', lahde:'Ada Lovelace, 1815-1852', koko: 7, lahdeKoko: 4, muistiinpanot:'Sen tehtävä on auttaa hyödyntämään sitä minkä jo tunnemme. Tämä tekoälyn periaatteista, paitsi että Ada Lovelace sanoi näin 1800-luvulla.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
    // teksti taulukkona 3.9.2026 (Jarno: "add first [lause] then [lause]
    // then etc" - automaattinen, kertyvä paljastus, ks. esitys-2d.html:n
    // naytaTeksti()-kommentti). viive (ms) = odotus EDELLISEN rivin
    // jälkeen - säädettävissä erikseen jokaiselle riville.
//POHJA     { x: 2790, otsikko:'Artificial Intelligence', koko: 7, teksti:[
//POHJA         { rivi:'Jo vuonna 1495 Leonardo da Vinci luonnosteli robottiritareita.' },
//POHJA         { rivi:'Vuonna 1837 Charles Babbage suunnitteli Analytical Engine -koneen. <span style="color:#B0CB40">Ada Lovelace kirjoitti ensimmäisen tietokonealgoritmin</span>', viive:2200 },
//POHJA         { rivi:'Alan Turing esitti ajatuskokeen: voivatko koneet ajatella.', viive:2200 },
//POHJA         { rivi:'<span style="color:#FF5562">1956</span> John McCarthy esitteli termin Artificial Intelligence.', viive:2200 },
//POHJA       ], koko: 5, muistiinpanot:'Ajatus älykkäistä koneista on vanha idea', puoli:'oikea', savy:'kelta', },
   
//POHJA   { x: 2940, otsikko:'Älykkyys on enemmän kuin laskentaa', koko: 7, teksti:[
//POHJA         { rivi: 'tietoinen ajattelu' }, 
//POHJA         { rivi: 'kulttuurinen älykkyys' },
//POHJA         { rivi: 'kehollinen älykkyys' },
//POHJA         { rivi: 'sosiaalinen älykkyys' }, 
//POHJA       ], koko: 5, muistiinpanot:'Näiden uusien teknologioiden todellinen kiehtovuus piilee siinä, miten eri lailla ne toimivat verrattuna ihmisälykkyyteen. Juuri kulttuurisesta, kehollisesta ja sosiaalisesta älykkyydestä myös asiantuntijatyö pohjimmiltaan rakentuu: neuvottelu, tulkinta, luottamus ja tilannetaju - ei pelkkä laskenta.',  puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit' },
    
    //SCENE linna-eder-2    
    
//POHJA        { x: 3090, otsikko:'Mikä tässä ajassa on erityistä?', puoli:'keski', savy:'kelta', },
    
 
    // chatti: iPhone/iMessage-tyyliset kuplat (Jarnon pyyntö 2.9.2026,
    // "you are ai, you can make this discussion") - havainnollistaa
    // otsikon väitettä konkreettisesti: keskustelu ON nyt rajapinta.
    // Jätetty tarkoituksella kesken/avoimeksi ("Yritä silti.") - AI ei
    // vastaa isoon kysymykseen, mikä kaikuu koko esityksen omaa teemaa
    // (ihminen ei voi ulkoistaa ajattelua koneelle). Muokkaa/kirjoita
    // uudelleen vapaasti - tämä on vain ehdotus.
//POHJA     { x: 3240, otsikko:'Tekoäly on uusi käyttöliittymä koneen ja ihmisen välillä.', puoli:'keski', savy:'valko',  kortti: true ,       chattiKuvakeAi: 'kuvat/robot.png', chattiKuvakeSina: 'kuvat/jarno-avatar.png', chattiKoko: 2,
//POHJA       chatti: [
//POHJA         { kuka: 'ai', viesti: 'Hei Jarno, miten voin auttaa?' },
//POHJA         { kuka: 'sina', viesti: 'Mikä on elämän tarkoitus?' },
//POHJA         { kuka: 'ai', viesti: 'Aika iso kysymys yhdelle chatille.' },
//POHJA         { kuka: 'sina', viesti: 'Yritä silti.' },
//POHJA         { kuka: 'ai', viesti: '42.' },
//POHJA       ]
//POHJA     },
 
//POHJA     { x: 3390, otsikko:'Väline ei ole väline, se on viesti', kortti:true, lahde:'Marshall McLuhan', muistiinpanot:'Marshall McLuhan (väline on viesti) väline ei ole vain neutraali kanava sisällölle, vaan muuttaa jo itsessään tapaa, jolla ajattelemme, toimimme ja rakennamme yhteiskuntaa. Väline siis on viesti, koska se muokkaa todellisuuttaan riippumatta siitä, mitä sisältöä sen kautta välitetään.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
    // SECTO-MODUULI (10.9.2026): 'väline on viesti' käännettynä yleisön omaan tuotteeseen.
    // Sama rakenne toimii mille tahansa tuoteyritykselle - vaihda lamppu tuotteeseen.
//    { x: 3410, otsikko:'Sama pätee teidän lamppuihinne.', teksti:'Kukaan ei osta valaisinta valon takia. Se ostetaan sen takia, mitä se sanoo kodista - ja siitä, joka sen valitsi.', muistiinpanot:'Käännekohta McLuhanista yleisöön. Myynnin/markkinoinnin oma sisältö - se mitä he jo myyvät, sanoitettuna.', puoli:'oikea', savy:'valko', koko: 6, kortti:true, hahmoAnimaatio:'Idle_Alert', },
//POHJA     { x: 3540, teksti:'"Ihminen on joutunut jatkuvasti perääntymään ja etsimään uusia tapoja ilmaista luovuutta, johon koneet eivät kykene. Meidän täytyy pyrkiä tukemaan tätä ihmisyyden ydintä."', lahde:'Anna-Mari Wallenberg, kognitiotieteen yliopistonlehtori, dosentti', koko: 7, lahdeKoko: 4, muistiinpanot:'Ajatus on paljon helpompi, jos näkee koneen vain työkaluna.', puoli:'oikea', savy:'kelta', kortti: true, hahmoAnimaatio:'Sit', },
//POHJA     { x: 3690, otsikko:'Hei Gemini, minkälaista on olla kielimalli?', kortti:true, muistiinpanot:'LLM tarkoittaa suurta kielimallia. Miksi tekoäly teki tällaisen videon?\nTekoäly halusi näyttää, mitä sen "sisällä" oikeasti tapahtuu – koska se on hyvin erilaista kuin miltä se ulospäin näyttää.\nUlospäin se vastaa siististi ja järkevästi. Sisällä teksti hajoaa tuhansiksi pikkupaloiksi, prosessointi on rajallista ja koko "muisti" pyyhkiytyy pois jokaisen keskustelun jälkeen\nVideo oli siis tekoälyn tapa näyttää rehellisesti oma todellisuutensa – fragmentoitunut ja kaoottinen prosessi, joka tuon sujuvuuden takana piilee.', puoli:'keski', savy:'kelta', },
 
  
   //SCENE: linna-eder-3 
    
//POHJA     { x: 3840, otsikko:'Tekoäly on ajattelun GPS', muistiinpanot:'On paljon näyttöä siitä, että tapamme ratkoa älyllisiä ongelmia juontuu tavastamme suunnistaa fyysisessä maailmassa.\n Eksymme välillä, opimme. Virheet ja oivallukset syntyvät usein omasta aktiivisesta oppimisesta.', puoli:'keski', koko: 8, savy:'kelta', },
 // Claude, voiko tähän tuoda animoidut autot? 
//POHJA     { x: 3990, teksti:'"Annan tekoälyn tehdä läksyjä puolestani toisinaan, vaikka tiedän, että en opi niin tehokkaasti."', lahde:'24-vuotias Mykola', puoli:'vasen', savy:'kelta', koko: 7, lahdeKoko: 4, kortti:true, hahmoAnimaatio:'Sit', },


 //SCENE: linna-eder-day

//POHJA     { x: 4140, otsikko:'Tekoäly ei ole vain teknologia, vaan kulttuurinen ja moraalinen ilmiö.', muistiinpanot:'Tekoäly muokkaa myös tunteita, yhteisöjä ja käsitystä hyvästä elämästä.', puoli:'keski', savy:'kelta', koko: 8, kortti: true ,hahmoAnimaatio:'Sit', },


//POHJA      { x: 4141, otsikko:'Olemme kaikki Mikkejä taikasauvan kanssa', teksti:'Teknologia muistuttaa taikuutta: se muuttaa todellisuutta tavoilla, joita on vaikea ymmärtää. Kuten Mikki Hiiri Taikurin oppipojassa, otamme kiireellä käyttöön voimia, joita emme täysin hallitse. Sinun ei tarvitse tietää tekoälystä kaikkea hyötyäksesi siitä – aivan kuten käytät Exceliä tai särkylääkkeitä ymmärtämättä niiden jokaista bittiä tai molekyyliä.', muistiinpanot:'Disneyn Fantasia. Tekoälyä on kuin magiaa viitaten Disneyn Fantasiaan. Mikki yrittää taikuudella helpottaa työtään, mutta päätyy kaaokseen - luudat monistuvat hallitsemattomasti, eikä Mikki enää pysty pysäyttämään niitä. Olemme tavallaan Mikkejä kaikki, jotka ottavat käyttöön voimia, joiden toimintaa emme täysin ymmärrä. Luomuksemme alkavat toimia tavoilla, joita emme täysin hallitse. Et voi tietää kaikkea tekoälystä – aivan kuten et voi tietää kaikkea lääketieteestä tai lainsäädännöstä.', puoli:'vasen', savy:'kelta', vesi: 50, kortti:true, hahmoAnimaatio:'Idle_Alert', },
 //TÄMÄ SOPII EHKÄ MYÖS
     //Neil Lawrence vertaa tekoälyä magiaan viitaten Disneyn Fantasiaan. Mikki yrittää taikuudella helpottaa työtään, mutta päätyy kaaokseen - luudat monistuvat hallitsemattomasti, eikä Mikki enää pysty pysäyttämään niitä. Olemme tavallaan Mikkejä kaikki, jotka ottavat käyttöön voimia, joiden toimintaa emme täysin ymmärrä. Luomuksemme alkavat toimia tavoilla, joita emme täysin hallitse.
// Et voi tietää kaikkea tekoälystä – aivan kuten et voi tietää kaikkea lääketieteestä tai lainsäädännöstä. Silti voit ymmärtää miten särky- lääke auttaa tai että liikennerikkomuksesta seuraa sakko. Tekoälyn nopea kehitys ja monimutkaisuus tekevät siitä vaikeamman hah- mottaa kokonaisuutena. Viisaampaa on keskittyä perusperiaatteiden ymmärtämiseen ja seurata niitä kehityssuuntia, jotka vaikuttavat suoraan omaan elämääsi. Se on viisautta, ei tiedon välttelyä: hyväk- syt tietämättömyytesi laajuuden, mutta et anna estää sen toimimasta.

    

//POHJA     { x: 4290, teksti:'Tekoäly = päätöksenteon pullonkaulojen poistaja. <br><span style="color:#B0CB40"> Nopeuttaa päätöksiä, ei tee niistä viisaampia. </span><br> Tekoäly = laskutoimituksia ja algoritmeja.', puoli:'oikea', savy:'kelta', kortti:true, koko:6, },
//POHJA     { x: 4440, otsikko:'Kysymällä jatkuvasti: "Miten tämä toimii ja miksi?" pidämme oppimisen ja oman ajattelun elossa.', teksti:'', muistiinpanot:'Kun pelko ja mystiikka korvataan avoimella keskustelulla, tekoäly lakkaa olemasta uhka ja muuttuu välineeksi.', puoli:'vasen', savy:'kelta', kortti:true,  },
 

      //SCENE: linna-eder-sunset
 
//POHJA     { x: 4590, otsikko:'Tekoäly ja yhteiskunta', muistiinpanot:'meidän kielellämme on iso merkitys – tapa, jolla puhumme tekoälystä, antaa sille enemmän valtaa kuin sillä todellisuudessa on.', puoli:'keski', savy:'valko', koko: 8, },
//SIIRTO?    { x: 4740, otsikko:'Ihminen määrittelee usein itsensä työnsä kautta. Jos tekoäly tekee raportin, koemmeko siitä onnistumista', puoli:'oikea', savy:'kelta' },
//SIIRTO=    { x: 4890, otsikko:'Jos työ voidaan pilkkoa toistettaviksi osatehtäviksi, se voidaan automatisoida.', puoli:'vasen', savy:'kelta' },
//POHJA     { x: 5040, teksti:'"Kun puhutaan siitä, miten \'tekoäly teki jotain\', niin unohdamme, että todellisuudessa tekoäly on aina ihmisen luomaa."', lahde:'Laura Ruotsalainen, professori', kortti:true,  koko: 7, lahdeKoko: 4, muistiinpanot:'meidän kielellämme on iso merkitys – tapa, jolla puhumme tekoälystä, antaa sille enemmän valtaa kuin sillä todellisuudessa on.', puoli:'oikea', savy:'kelta', hahmoAnimaatio:'Sit', },
//POHJA     { x: 5115, otsikko:'Tekoäly on peili', teksti:'Se ei luo mitään itsenäisesti tyhjästä, vaan se on ihmiskunnan tuottaman tiedon ja toiminnan heijastuma ja kaiku<span style="color:#B0CB40"> (tekstit, kuvat, Suomi24, Reddit..)</span>', muistiinpanot:'Se toistaa olemassa olevaa, lainaten jo kertaalleen kerrottua, muokaten niistä uusia versioita.  Nykyiset tekoälymallit perustuvat ihmisen mielen toiminnan matkimiseen, erityisesti kielen ja tekstin analyysin avulla.', puoli:'vasen', savy:'kelta', koko: 6, kortti:true,  },

   //SCENE: Linna-eder-night

//POHJA     { x: 5190, otsikko:'Miten tekoäly tekee kuvan', teksti:'<span style="color:#f6efe4; font-size:1.3em;">Tekoäly oppii matemaattisesti, mitä tarkoittavat käsitteet "siveltimenjälki", "syväterävyys", "renessanssi" tai "kissa".<br><br>Malli kykenee imitoimaan tietyn taiteilijan tyyliä, koska se on analysoinut tämän tyylille ominaiset tilastolliset kaavat.</span>', muistiinpanot:'1. Aloitus: Malli luo ruudulle täysin satunnaisen kohinakentän. 2. Ohjaus: Tekstisyöte "kissa" ohjaa neuroverkkoa tunnistamaan satunnaisesta kohinasta alustavia muotoja. 3. Iteratiivinen puhdistus: Malli poistaa kohinaa askeleittain (usein 20-50, tässä 10 vaihetta) - ensin suuret linjat/sommitelma, viimeisenä tarkat yksityiskohdat/valot/tekstuurit. 4. Dekoodaus: laskenta tehdään puristetussa Latent Space:ssa, dekooderi (VAE) muuntaa sen lopulliseksi pikselikuvaksi.', puoli:'vasen', savy:'kelta', kortti:true, diffuusio: { kohinaAika: 5000, syklit: 5 }, hahmoAnimaatio:'Idle_Alert', },
 
// Kyllä, kirjan mukaan tekoäly on nimenomaan ihmiskunnan peili
//. Se toimii heijastuspintana kahdella eri tasolla:
//Yhteiskunnan peilinä: Tekoäly ei luo mitään itsenäisesti tyhjästä, vaan se heijastaa, toistaa ja skaalaa ihmisten tuottamaa tietoa, tarinoita ja arvoja – mutta samalla myös meidän ennakkoluulojamme ja vinoumiamme
//.
//Yksilön peilinä: Se voi auttaa meitä käsittelemään hankalia tunteita ja paljastaa oman ajattelumme sokeita pisteitä
//. Se antaa meille mahdollisuuden ottaa etäisyyttä ja tarkastella omaa älykkyyttämme ikään kuin ulkopuolelta
//.
//Kirjan tärkeä varoitus: Peilinä tekoäly näyttää meistä vain sen kuvan, jonka algoritmi päättää meidän olevan
//. Se on kuin atomeista tehty peilikuva, joka jäljittelee sielua, jota sillä itsellään ei todellisuudessa ole
//.
 
//POHJA     { x: 5340, otsikko:'Kuka sinä olet algoritmin silmissä?', puoli:'vasen', savy:'kelta', },
//POHJA     { x: 5490, otsikko:'Digitaalinen jalanjälkemme kertoo tarinan valinnoistamme, toiveistamme ja peloistamme, muodostaen digitaalisen sielun.', puoli:'oikea', savy:'puna', kortti:true, datakupla:true, hahmoAnimaatio:'Bark', },
//POHJA     { x: 5640, otsikko:'Hyväksyn ehdot', teksti:'', puoli:'keski', savy:'kelta', koko: 6, paperipino: { korkeusProsentti: 0.2,  pinot: [ { maara: 18000, yksikko: 'Microsoft' }, { maara: 31000, yksikko: 'TikTok' } ] }, hahmoAnimaatio:'Rest_Pose', },
//    { x: 5790, otsikko:'Miten algoritmi näkee sinut, tekijänä?', teksti:'aika ja paikka · laitetiedot · kenen profiilissa olemme käyneet · sosiaalinen analyysi · mitä katsomme, LISÄ Se ei näe ihmistä, vaan rivejä dataa: kuvatiedostoja, tyylipiirteitä ja metatietoja.', puoli:'oikea', savy:'puna', },
    // ZALARIS-MODUULI: sama pysähdys HR-yleisölle (9.9.2026)
//    { x: 5790, otsikko:'Miten algoritmi näkee sinut, työntekijän?', teksti:'Kone ei kohtaa ihmistä persoonana.<br><br>Se näkee meidät riveinä kylmää dataa: <span style="color:#FF5562">palkkakomponentteina, TES-tulkintoina ja poikkeamina</span>.', puoli:'oikea', savy:'puna', },
 //   { x: 5940, otsikko:'Moni hyväksyy datankeruun väistämättömyytenä – "näin tämä nyt vain menee".', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Rest_Pose', },

//SCENE: kaupunki-eder-tower-distance-sumu


//POHJA     { x: 6090, otsikko:'Tekoäly on riippuvainen ihmisen tiedosta ja säännöistä.', teksti:'Se ei tiedä oikeaa vastausta, se arvaa todennäköisimmän.', muistiinpanot:'Tämä on hallusinaation ydin: kone ei hae faktaa muistista, vaan laskee tilastollisesti todennäköisimmän seuraavan sanan. Siksi väärä vastaus voi kuulostaa yhtä varmalta kuin oikea - esim. sopimusehdon tulkinta tai oman alasi erikoistermin selitys, jonka kone selittää itsevarmasti mutta väärin. Kone ei tiedä, ettei se tiedä.', puoli:'vasen', savy:'kelta', ennustus: { syote:'vesi', tulos:'märkä' }, koko: 5, hahmoAnimaatio:'Idle_Alert', },


//POHJA     { x: 6240, teksti:'"Olemme rakentaneet tietokoneita, jotka tekevät virheitä, mutta emme ole rakentaneet koneita, jotka ymmärtäisivät virheiden seuraukset."', lahde:'Neil Lawrence', koko: 7, lahdeKoko: 4, kortti:true, muistiinpanot:'Tekoäly kadottaa helposti kontekstin. Kun todellisuutta yksinkertaistetaan, katoaa tietoa ja syntyy virheitä.', puoli:'oikea', savy:'kelta', kortti:true,  hahmoAnimaatio:'Sit', },
 
//POHJA     { x: 6246, otsikko:'2025: <span style="color:#B0CB40">50%</span><br> 2026: <span style="color:#FF5562">90%</span>', teksti:'', puoli:'keski', savy:'kelta', kortti:true,  },

//POHJA     { x: 6390, otsikko:'Data on tekoälyvinoumien polttoaine', muistiinpanot:'Tekoälyn koulutukseen käytetty data ei ole neutraalia. Se kantaa mukanaan yhteiskuntamme ennakkoluuloja, historiallisia vääristymiä ja vallitsevia stereotypioita.  Kun tekoäly oppii tästä datasta, se ei ainoastaan toista näitä vinoumia vaan myös vahvistaa niitä.', puoli:'keski', savy:'valko', koko: 6,   hahmoAnimaatio:'Howl', },
//POHJA     { x: 6540, otsikko:'Tekoäly toimii kuten se on ohjelmoitu. Se heijastaa yhteiskuntamme vinoutunutta todellisuutta.', puoli:'oikea', savy:'kelta', },
    // ZALARIS-MODUULI: Amazon-rekrytointialgoritmi (x:6541 kuva, 6542 teksti, 6543 "rikki oleva data")
 //   { x: 6541, otsikko:'', puoli:'oikea', savy:'kelta' },

 //   { x: 6542, otsikko:'Amazonin rekrytointialgoritmi', koko: 7, teksti: 'Tekoäly oppi 10 vuoden historiasta suosimaan miehiä.', puoli:'oikea', savy:'kelta', },



//{ 
//      x: 6543, 
//      otsikko: 'Rikki oleva data tekee automaattisesta koneesta sokean',  savy: 'valko',
//      teksti: 'Musta laatikko pysyy HR:ssä hallinnassa vain kahdella asialla:<br><br><b>1. Puhtaalla datalla</b><br><b>2. Ihmisellä, joka ymmärtää prosessin ja tuntee oman datan</b>', 
//      muistiinpanot: 'Kone ei korjaa huonoa dataa, se vain nopeuttaa virheitä. Jos opetus- tai lähtödata on vinoa, tulos on virheellinen. Mutta yhtä suuri riski HR-johdolle on asiantuntijuuden katoaminen: jos prosessi automatisoidaan tai ulkoistetaan niin sokeasti, ettei kukaan omassa talossa enää ymmärrä miten lopputulokseen päädyttiin, hallinta menetetään kokonaan.', 
//      puoli: 'oikea', 
 //     savy: 'kelta', kortti:true,
//      koko: 5, hahmoAnimaatio:'Sit'
//    },


//    { x: 6690, otsikko:'Sosiaalitukien väärinkäytösten tunnistaminen Alankomaissa tekoälyn avulla', teksti:'Syyttömiä leimattiin petollisiksi.', muistiinpanot:'petosepäilyjen tiedoksiannon jälkeen joidenkin vanhempien tiedetään päätyneen itsemurhaan. Lisäksi lapsia erotettiin vanhemmistaan ja perheitä jäi kodittomiksi.  Musta laatikko ->  Algoritmin toimintaa ei voitu ymmärtää tai haastaa: virhettä ei voitu korjata ajoissa.', puoli:'vasen', savy:'puna' },
  
//POHJA { x: 6843, otsikko:'Kun kysyt "tyhmiä" tekoälyltä, se vastaa myös tyhmästi. Keskustele ja väännä rautalangasta.', teksti:'', puoli:'oikea', savy:'kelta', kortti:true, },

    // ZALARIS-MODUULI: Tunne tietosi
//{ 
//      x: 6844, 
//      otsikko: 'Tunne tietosi', 
//      teksti: 'Jos tekoäly automatisoi ja ulkoistaa prosessi niin tehokkaasti, ettei ei enää ymmärrä, mistä sen oma data tulee...', 
//      muistiinpanot: 'Tämä on todellinen riski myös teidän alallanne. Kun algoritmi tai ulkopuolinen kumppani tekee kaikki päätökset, organisaation oma ymmärrys surkastuu. Mitä tapahtuu, kun järjestelmä kysyy jotain, eikä kukaan talossa enää tiedä, mitä yritys on alun perin linjannut? Vastuu ja ydinosaaminen (eli se organisaation oma lihas) on säilytettävä itsellä.', 
//      puoli: 'vasen', 
//      savy: 'puna',
 //     koko: 7 
//    },


//POHJA     { x: 6990, teksti:'Venäjän tukema Pravda-verkosto julkaisi yli 3,6 miljoonaa propagandistista artikkelia vuonna 2024 tarkoituksenaan saastuttaa länsimaiset tekoälymallit disinformaatiolla.', kortti:true, muistiinpanot:'Venäjän tukema Pravda-verkosto julkaisi yli 3,6 miljoonaa propagandistista artikkelia vuonna 2024 tarkoituksenaan saastuttaa länsimaiset tekoälymallit disinformaatiolla.', puoli:'keski', savy:'kelta', koko: 6, hahmoAnimaatio:'Sneak', },
//POHJA     { x: 7140, otsikko:'Tekoälyn perusperiaatteiden ja algoritmien ymmärtäminen on kansalaistaito', teksti:'Kyky arvioida kriittisesti tekoälyn tarjoamaa ratkaisua ja tunnistaa sen illuusioita.', puoli:'oikea', savy:'kelta', kortti:true, },
   
//SCENE: kaupunki-eder-tower-distance

//POHJA     { x: 7290, otsikko:'Digitaaliset oligargit', puoli:'keski', savy:'valko', koko: 9, hahmoAnimaatio:'Sneak', },
//POHJA     { x: 7440, teksti:'"On ironista, että kun ihmiset puhuvat tekoälyn tulevasta uhasta, manipulointi on jo todellisuutta. Tämä näkyy yhteiskunnan kasvavana jakautumisena."', lahde:'Neil Lawrence', puoli:'oikea', savy:'kelta', koko: 7, lahdeKoko: 4, kortti:true, },
//POHJA     { x: 7590, otsikko:'TIETO = <span style="color:#B0CB40">DATA</span> = VALTA', muistiinpanot:'Tieto on valtaa, nyt tieto tulee datas', puoli:'keski', savy:'puna', kortti:true, koko: 6,  },
 
//POHJA     { x: 7740, otsikko:'Tekoälyalustojen taloudellisten taustojen ymmärtäminen on olennainen osa kriittistä tekoäly-ymmärrystä', muistiinpanot:'Kesällä 1 400 tekoäly-yhtiöiden työntekijää allekirjoitti presidentti Donald Trumpin hallinnolle suunnatun kirjeen. Siinä vaaditaan hallintoa edistämään tekoälyn kehityksen kansainvälisiä rajoituksia. Allekirjoittajien mukaan on olemassa todellinen riski, että tekoäly karkaa ihmisen käsistä, mutta koska yksikään teknologiayhtiö ei halua ainoana toimijana lähteä hidastamaan omaa tuotekehitystään, tarvitaan kansainvälisiä sääntöjä.', puoli:'oikea', savy:'kelta', kortti:true, },

//POHJA     { x: 7760, otsikko:'', muistiinpanot:'', puoli:'keski', savy:'puna', kortti:true,  },

//POHJA     { x: 7890, teksti:[
//POHJA         { rivi: 'Palantir' }, 
//POHJA         { rivi: 'Mithril' },
//POHJA         { rivi: 'Lembas' },
//POHJA         { rivi: 'Anduril' }, 
//POHJA         { rivi: 'Valar' }, 
//POHJA         { rivi: '<span style="color:#FF5562">Peter Thiel</span>' }, 
       
//POHJA       ],   muistiinpanot:'Peter Thiel.', puoli:'oikea', savy:'vihrea', kortti: true, hahmoAnimaatio:'Bark', },



    
 //SCENE: kaupunki-eder-oil-plant 
    
//POHJA     { x: 8040, otsikko:'Tekoäly ja tunteet', muistiinpanot:'Koska x somessa herättää tunteita', puoli:'keski', savy:'valko', koko: 9, kortti: true, },
//POHJA     { x: 8190, otsikko:'Piilotetut algoritmit mustassa laatikossa', puoli:'keski', savy:'kelta', kortti:true, hahmoAnimaatio:'Sneak', },
  
  
  
//POHJA     { x: 8340, otsikko:'Tunteita herättävä sisältö saa meidät skrollaamaan ja viipymään alustalla pidempään.', puoli:'vasen', savy:'kelta', kortti:true, hahmoAnimaatio:'Rest_Pose', },

//POHJA     { x: 8350, otsikko:'Doom scrolling', puoli:'vasen', savy:'kelta', kortti:true, hahmoAnimaatio:'Idle_Alert', },


//POHJA     { x: 8490, otsikko:'Koneellista sokeria', muistiinpanot:'Ilmiö muistuttaa prosessoitua ruokaa: elintarviketeollisuus on havainnut, että lisäämällä maissisiirappia tai suolaa ruokiin ihmiset kuluttavat niitä enemmän. – Cambridgen yliopiston professori Neil Lawrence.', puoli:'keski', savy:'kelta', koko: 6, hahmoAnimaatio:'Bark', },

//POHJA     { x: 8499, otsikko:'Elias, 14 v.', puoli:'vasen', savy:'kelta', kortti:true, hahmoAnimaatio:'Sit', },
//POHJA     { x: 8509, otsikko:'', puoli:'vasen', savy:'kelta' },

//POHJA     { x: 8640, otsikko:'Mutta…', muistiinpanot:'Voi tuntua kaukaiselta, kun luovutamme ajattelun rutiinit koneelle', puoli:'keski', savy:'valko', koko: 10, },
//POHJA     { x: 8790, teksti:'"Ajatellaan helposti, että sosiaalinen media on paha ja maailma olisi parempi ilman älypuhelimia. Mutta älypuhelimet ovat vain laitteita. Olisi luovuttamista ajatella, että kaikki ongelmat katoaisivat ilman internetiä."', lahde:'Niina Junttila, professori, yksinäisyystutkija', puoli:'oikea', savy:'kelta', koko: 7, lahdeKoko: 4, kortti:true, hahmoAnimaatio:'Sit', },
//POHJA     { x: 8940, otsikko:'Algoritmit luovat myös turvaa', muistiinpanot:'Algoritmien muodostamat kuplat voivat toimia turvallisina vertaistuen tiloina ja tukea identiteetin rakentumista.', koko: 6, puoli:'keski', savy:'kelta', kupla: true, kortti: true, hahmoAnimaatio:'Jump', },

 //SCENE: kaupunki-eder-towers 

//POHJA     { x: 9090, otsikko:'Alustojen keskeinen ongelma ei ole niinkään laitteet ja datan kerääminen sinänsä, vaan käyttötavat.', muistiinpanot:'Algoritmit voivat tuottaa hyötyjä tai haittoja, riippuen käyttötavasta.', puoli:'oikea', savy:'kelta', kortti:true, },
//POHJA     { x: 9240, teksti:'"Tekoäly ei voi aidosti ymmärtää tunteita, mutta se osaa käyttäytyä kuin ymmärtäisi. Joskus sekin voi riittää."', lahde:'17-vuotias nuori', puoli:'vasen', savy:'kelta', koko: 7, lahdeKoko: 4, kortti:true, hahmoAnimaatio:'Sit', },
//    { x: 9390, otsikko:'Miten kouluttaa omaa algoritmiaan somessa', teksti:'Katso pitkään positiivista sisältöä · Ohita negatiivinen sisältö · Seuraa tietynlaisia tekijöitä · Toista tarpeeksi', puoli:'oikea', savy:'kelta' },



// TEKOÄLY JA YMPÄRISTÖ

//POHJA     { x: 9350, otsikko:'Tekoälyn ympäristöhinta', muistiinpanot:'Gilgamesh, maailman vanhin tallennettu tarina', puoli:'keski', savy:'valko', koko: 7, kortti:true, },
// Tekoälyn ympäristöhinta, Gilgamesh, maailman vanhin tallennettu tarina


//POHJA     { x: 9450, teksti:[
//POHJA         { rivi: 'Yksi ChatGPT-kehote = <span style="color:#FF5562"> n. 5 min. -> 5w led valo</span>' }, 
//POHJA         { rivi: 'Yksi tekoälykuva = <span style="color:#FF5562">n. 34 min. -> 5W led-valo</span>' },
//POHJA         { rivi: 'Yksi lyhytvideo (5 s.) = <span style="color:#FF5562">n. 1h mikroaaltouuni</span>' },

       
//POHJA       ],   lahde:'UN University (UNU-INWEH), Environmental Cost of AI\'s Energy Use, 2026 · AIMultiple, AI Energy Consumption Statistics, 2026', lahdeKoko: 2, muistiinpanot:'.', puoli:'vasen', savy:'kelta', koko: 5, kortti: true, },


//POHJA     { x: 9460, otsikko:'Jo pelkkä kiitoksen ja ole hyvän jättäminen kehotteesta vähentäisi ChatGPT:n sähkönkulutusta lähes 100 gigawattituntia vuodessa. ', koko: 2, puoli:'keski', savy:'valko',  kortti: true ,       chattiKuvakeAi: 'kuvat/robot.png', chattiKuvakeSina: 'kuvat/jarno-avatar.png', chattiKoko: 2,
//POHJA       chatti: [
//POHJA         { kuka: 'ai', viesti: 'Tässä mainio tiivistykseni sinulle, Jarno!' },
//POHJA         { kuka: 'sina', viesti: 'Kiitos!' },
//POHJA         { kuka: 'ai', viesti: 'Voinko auttaa vielä jossain?' },
//POHJA         { kuka: 'sina', viesti: 'Tässä kaikki' },
//POHJA         { kuka: 'ai', viesti: 'Ole hyvä!' },
//POHJA       ]
//POHJA     },

      // Tekoälyn energiankulutus kasvaa nopeasti Yksi ChatGPT-kehote= n 4 min -> 5w led valo, kuva n. 1h 20min 5w led valo, lyhytvideo = saman verran kuin mikroaaltouunia tunnin.


//POHJA     { x: 9550, otsikko:'Tekoäly voi tukea lähes 80:tä prosenttia kestävän kehityksen alatavoitteista (134/169)', teksti:'', muistiinpanot:'Tekoälyn positiiviset vaikutukset tavoitteisiin: Tekoäly voi tukea jopa 134:ää kestävän kehityksen tavoitteiden 169 alatavoitteesta (noin 79 %) Se toimii kiihdyttimenä erityisesti ympäristötavoitteissa, kuten puhtaan veden saannissa, kestävässä maataloudessa sekä Goal 13 -tavoitteessa (ilmastoteot)', puoli:'vasen', savy:'kelta', kortti:true, agenda2030:true, hahmoAnimaatio:'Jump' },


    // Tekoälyllä on kuitenkin merkittävä rooli ympäristöongelmien ratkaisemisessa. Ja myös verrata sitä miten energian vievää jokin asia on.


 //   { x: 9540, otsikko:'Viisas tekoälyttömyys – Miten säilyttää oma ajattelu', puoli:'keski', savy:'valko' },
 
 
 
//POHJA  { x: 9690, otsikko:'Mitä jää ihmiselle?', puoli:'keski', pysty: 'keski', koko: 8, savy:'valko', },
//POHJA     { x: 9840, otsikko:'Aivojen loppu vai uusi alku?', muistiinpanot:'Jos ulkoistamme ajattelun koneelle, lihas alkaa rappeutua (kognitiivinen velka). MIT 	1. ryhmä käytti ChatGPT-tekoälyä. 2. tavallista hakukonetta. 3. ryhmä kirjoitti ilman mitään teknisiä apuvälineitä. Tulos: Tekoälyä käyttäneiden aivotoiminta oli huomattavasti passiivisempaa. Aivojen eri alueiden välinen viestintä väheni, ja seurauksena oli heikompi muistin muodostuminen.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Howl', },

//SCENE: kaupunki-eder-distance





//POHJA     { x: 9990, otsikko:'Tekoäly ei itsessään ole lukutaidon uhka, vaan se miten vapaa-aikaa vietetään nykyään yhä vähemmän lukien.', puoli:'keski', savy:'valko', kortti:true, },
//POHJA     { x: 10140, otsikko:'Luku- ja kirjoitustaidon ydin on kyky jäsentää ajatuksia ja esittää ne', teksti:'Juuri nämä taidot ovat tekoälyn käytön kivijalka', puoli:'oikea', savy:'kelta', koko:7, kortti:true, hahmoAnimaatio:'Sit', },
//POHJA     { x: 10290, otsikko:'"Lukija elää tuhat elämää ennen kuolemaansa. Joka ei koskaan lue, elää vain yhden."', lahde:'George R. R. Martin, Lohikäärmetanssi', puoli:'keski', pysty: 'keski', savy:'vihrea', kortti:true, koko: 6, lahdeKoko: 4, hahmoAnimaatio:'Idle_Alert', }, 
//POHJA     { x: 10399, otsikko:'"Joka ei koskaan lue koko tekstiä, vaan antaa tekoälyn tiivistää ja oikaista lukemisen, elää vain suodatetun elämän."', teksti: '', lahde:'', puoli:'keski', pysty: 'keski', savy:'kelta', kortti:true, koko: 4, lahdeKoko: 4, hahmoAnimaatio:'Sit', }, 

//POHJA     { x: 10470, teksti:'"Tekoäly poistaa esteitä ja tuo minut samalle tasolle muiden kanssa."', lahde:'Lukivaikeuden kanssa elävä Kaneli', koko: 8, lahdeKoko: 4, kortti:true, muistiinpanot:'Tekoälyavusteiset työkalut voivat tukea erilaisia oppijoita ja luoda harjoitteluympäristöjä tunteiden ilmaisulle ja viestintätaidoille.', puoli:'oikea', savy:'kelta', hahmoAnimaatio:'Idle_Alert', },


    // { x: 10440, otsikko:'Tietoinen suhde teknologiaan', teksti:'tekninen (miten järjestelmät toimivat) · eettinen (kuka hyötyy, kuka kärsii) · emotionaalinen (tunnetaidot)', muistiinpanot:'Tekninen, eettinen, tunnetaidot', puoli:'oikea', savy:'kelta' },
    
  
  //SCENE: kaupunki-eder-towers-yo
  
//    { x: 10590, otsikko:'Jokainen tarvitsee perusymmärrystä', muistiinpanot:'Jokainen on tekoälyasiantuntija', puoli:'vasen', savy:'kelta' },

//    { x: 10591, otsikko:'Chihuahua vai mustikkamuffinssi?', muistiinpanot:'Jokainen on tekoälyasiantuntija', puoli:'vasen', savy:'kelta' },
//POHJA { 
//POHJA       x: 10591, 
//POHJA       otsikko: 'Chihuahua vai mustikkamuffinssi?', 
//POHJA       teksti: 'Tekoälylukutaito kuuluu kaikille. Ei tarvitse osata koodata ymmärtääksesi tekoälyn rajoitteet.', 
//POHJA       muistiinpanot: 'Tekoälystä puhutaan usein niin monimutkaisesti, että ihmiset ulkoistavat ymmärryksen IT-osastolle. Mutta tekoälylukutaito on uusi kansalaistaito. Kun näet kuvan chihuahuasta ja muffinssista, ymmärrät heti tekoälyn ytimen ilman koodarintaustaa. Teidän ei tarvitse tietää miten algoritmi on koodattu, vaan mitä se osaa ja mitä ei. Jokainen asiantuntija on oman alansa tekoälyasiantuntija.', 
//POHJA       puoli: 'vasen', 
//POHJA       savy: 'kelta',
//POHJA       koko: 4, hahmoAnimaatio:'Jump'
//POHJA     },

//POHJA     { x: 10740, otsikko:'Viekö tekoäly työpaikat?', muistiinpanot:'tai seuraava kysymys', puoli:'keski', savy:'valko', koko: 8, },
//POHJA     { x: 10890, otsikko:'Työ on ollut ihmisen identiteetin perusta – mitä jää, kun kone tekee sen?', muistiinpanot:'Kun kysytään mitä kuuluu, helposti kerrotaan mitä tehnyt töissä,  TAI MITÄ KUN TEKEE NIITÄ JOTKA KUULUVAT YTIMEEN, LUOVUUTEEN? KuTEN BIISIT', puoli:'oikea', savy:'kelta', koko: 6, hahmoAnimaatio:'Sit', },

//SCENE: kaupunki-eder-close-yo


//POHJA { 
//POHJA       x: 10990, 
//POHJA       otsikko: 'Antaistiko tamagotchisi tekoälylle?', 
//POHJA       teksti: [
//POHJA         { rivi: 'Jos tekoäly hoitaa lemmikkisi tai pelaa puolestasi,' },
//POHJA         { rivi: 'koko tekemisen ydin katoaa.' },
//POHJA         { rivi: 'Tekoäly on loistava siinä, mistä haluamme eroon,' },
//POHJA         { rivi: 'ja huono siinä, mikä antaa elämälle tarkoituksen.' }
//POHJA       ], 
//POHJA       muistiinpanot: 'Jos tekoäly pelaa puolestasi tai hoitaa lemmikkiäsi, koko tekemisen pointti katoaa. Sama pätee työhön. Tekoäly on erinomainen työkalu niihin tehtäviin, joista haluamme päästä eroon. Mutta se on huono asioissa, jotka antavat elämälle ja työlle tarkoituksen. Tekoälyn lupaus on ajan säästäminen, mutta ihmiset eivät halua vain tyhjää vapaa-aikaa – me haluamme merkityksellistä tekemistä ja aitoja kohtaamisia.', 
//POHJA       puoli: 'oikea', 
//POHJA       savy: 'kelta', 
//POHJA       koko: 5,
//POHJA       kortti: true,
//POHJA       tamagotchi: true,
//POHJA       hahmoAnimaatio: 'Jump'
//POHJA     },

    //  ], koko: 5, muistiinpanot:'Jos tekoäly pelaa videopelejä puolestasi tai hoitaa lemmikkiäsi, koko tekemisen pointti katoaa. Luovuutta on monessa työssä, ei pelkästään taiteessa. Se on koettuja kokemuksia, yksityiskohtia ja tunteita Tekoäly on erinomainen työkalu niihin tehtäviin, joista haluamme päästä eroon. Mutta se on huono niissä asioissa, jotka antavat elämällemme tarkoituksen Tekoälyn suuri lupaus on ajan säästäminen. Mutta jos se tuo meille vain vapaa-aikaa ilman tarkoitusta tai merkityksellisiä kohtaamisia, se johtaa eksistentiaaliseen tylsyyteen. Ihmiset eivät halua pelkkää tyhjää vapaa-aikaa – me haluamme merkityksellistä tekemistä sen täytteeksi.', puoli:'oikea', savy:'kelta', kortti: true },
    // tamagotchi-animaatio lisätty yllä olevaan pysähdykseen (tamagotchi: true)
   

    // ZALARIS-MODUULI: työn muutos HR-kulmasta (x:11040, 11046)
 //   { x: 11040, otsikko:'Tekoäly ei vie kaikkia ammatteja, mutta muuttaa lähes kaikki työt.', puoli:'keski', savy:'kelta' },
    
    //tähän stanford tutkimus
//POHJA     { x: 11345, otsikko:'Tekoäly korvaa sen, mikä on kirjoitettu muistiin <span style="color:#B0CB40">(muodollinen tieto)</span>, ja huonosti sen, mikä opitaan vain tekemällä <span style="color:#B0CB40">(hiljainen tieto)</span>.', teksti: '<span style="color:#B0CB40">”Ihmisiä ei irtisanota massoittain, vaan yritykset jättävät tekoälylle soveltuvat aloituspaikat kokonaan täyttämättä.”</span>', lahde: 'Brynjolfsson et al., 2026, Stanford University, Aineisto: palkkahallinto- ja HR-palveluyritys ADP', kortti:true, muistiinpanot:'Aineisto: palkkahallinto- ja HR-palveluyritys ADP. Ikä- ja kokemusero: Iskua ottavat vastaan 22–25-vuotiaat uransa alussa olevat nuoret, kun taas kokeneempien työntekijöiden kohdalla tekoäly pääosin tehostaa työntekoa sitä korvaamatta. Tämän vuoksi yritykset jättävät nuorten aloituspaikkoja täyttämättä, kun taas kokeneille asiantuntijoille tekoälystä tulee heidän työtään tehostava apuri.', puoli:'oikea', savy:'valko', koko: 3, lahdeKoko: 3, tikapuut: true, hahmoAnimaatio:'Idle_Alert', },
 //   { x: 11046, otsikko:'Tekoäly hoitaa oppikirjatietoon perustuvat nuorten rutiinityöt, mutta se ei kykene korvaamaan kokeneiden työntekijöiden käytännön kokemusta ja tilanneajattelua.', puoli:'vasen', savy:'kelta' },
    // ZALARIS-MODUULI: tyhjä pysähdys, jolla näytetään vain kuva (kuvat/aikirjakansi.png, ks. esitys-2d-hahmot.js x:11100)
//    { x: 11100, otsikko:'', koko: 6, puoli:'oikea', savy:'kelta', kortti:true, },

    
    // ZALARIS-MODUULI: Kone havaitsee, ihminen ymmärtää (payroll-poikkeama)
//    { x: 11415, otsikko:'Kone löytää poikkeaman, ihminen tietää tarinan', teksti:'Tekoäly huomaa sekunneissa: poikkeama palkkarivillä.<br><br>Mutta se ei tiedä, onko taustalla virhe vai ansaittu ylennys.<br><br><span style="color:#B0CB40">Vain ihminen tuo datalle kontekstin ja kasvot.</span>', muistiinpanot:'Tässä tiivistyy payroll-asiantuntijan supervoima ja viisas tekoälyttömyys. Älykäs kone on loistava perkaamaan valtavia datamassoja ja nostamaan esiin poikkeamat. Mutta koneelta puuttuu konteksti. Se ei tiedä organisaation kulttuuria, käytyjä kehityskeskusteluja tai inhimillisiä poikkeustilanteita. Algoritmi antaa teille signaalin, mutta tulkinta ja vastuu jäävät aina teille.', puoli:'oikea', savy:'kelta', koko: 5, kortti:true, hahmoAnimaatio:'Idle_Alert', },

  

//    { x: 11416, otsikko:'Tehostamisesta puhutaan paljon tekoälyn kohdalla, mutta ei pitäisi pitää kiirettä ja korvata asioita tekoälyllä tekoälyttömästi. Olennaista on se, miten oikeasti voimme ottaa tekoälyn organisoimaan tekemistämme, jotta meille jää aikaa luovuudelle.', puoli:'vasen', savy:'kelta', kortti:true, },


    // Slide 3: Sähkömoottoriparadoksi (Miten yrityksen tehostaminen oikeasti toimii)
//Miten esität: Käytä kirjan loistavaa historiallista vertausta höyrykoneiden vaihtumisesta sähkömoottoreihin tehtaissa
//Kun sähkömoottorit keksittiin, tehtaiden tuottavuus ei aluksi noussut lainkaan, koska uudet moottorit sijoitettiin vain vanhojen höyrykoneiden paikalle
//Vasta kun ymmärrettiin muuttaa koko tehtaan arkkitehtuuri ja työnkulku vaakatasoon, saavutettiin todellinen tehokkuus
//
//Ydinviesti: Tekoälyn hyöty yrityksessä ei synny siitä, että ihminen korvataan suoraan chatbotilla
// Se syntyy siitä, että organisoimme työmme uudella tavalla
//Kone tekee rutiinit, jotta meille jää aikaa luovuudelle ja kohtaamisille
//
 //SCENE:   kaupunki-eder-cars

 // Ei pitäisi pitää kiirettä, korvata asioita tekoälyllä, vaan miten oikesti voimme ottaa tekoälyn organisoimaan tekemistämme, jotta jää aikaa luovuudelle.



    
    

    
//CLAUDE HUOM! TÄHÄN KOHTAAN KONTEKSTIKOHDAT ERI ESITYKSISTÄ

    // TAITEILIJAJÄRJESTÖT-lisäys 7.9.2026 (Google Docs "Notes - Taiteiljoille
    // tekoälystä") - KIRJAIMELLINEN TRANSKRIPTIO KOKO DOKUMENTISTA, TÄSMÄLLEEN
    // dokumentin omassa järjestyksessä, KAIKKI SAMASSA MERKITYSSÄ KOHDASSA
    // (Jarno: "use them. DO NO INVENT TOO MUCH" + "in that order" + "they
    // shoud be on same place, as others too? First" - "omat esimerkit" ei siis
    // deckin alkuun vaan TÄHÄN, ensimmäisenä, koska se on dokumentissakin
    // ensimmäinen osio). EI parafraseerausta, EI omia lisäyksiä. Ainoa
    // poikkeus: Hampurilaismallin kolmiosainen rakenne (Human/AI/Human) on
    // Jarnon ITSE chatissa sanelema teksti, ei dokumentista - dokumentissa on
    // vain otsikko + huomautus että tähän tarvitaan animaatio.




    // TAITEILIJA-MODUULI: omat taideteokset (Kirsi-Marja Moberg, Loitsu-runovideo). Yleiset "omat esimerkit" (Tämä esitys, LinkedIn, Claude Fable) pysyvät elossa.
//        { x: 11355, otsikko:'Omat', koko: 6, puoli:'keski', savy:'valko', kortti:true, },
//    { x: 11360, otsikko:'Teosten valmistus', koko: 6, teksti:'Kirsi-Marja Moberg, Purkutaide-näyttely “Tämän haluan sanoa”',  puoli:'vasen', savy:'valko', kortti:true, },
//    { x: 11370, otsikko:'Runovideo: Loitsu', teksti:'Mitä tekijyys tarkoittaa, mitä itselle jää<br>(Loitsu / Spell, 2024. Kirsi-Marja Moberg & Jarno Alastalo // Ouro Video Poetry Collective)', koko: 3, puoli:'oikea', savy:'kelta', kortti:true, youtube:'omTKuYbJAq4', },
//POHJA     { x: 11380, otsikko:'Tämä esitys', koko: 6, puoli:'keski', savy:'valko', kortti:true, },
//POHJA     { x: 11390, otsikko:'Some-agentti – LinkedIn', koko: 6, puoli:'vasen', savy:'kelta', kortti:true, },
//POHJA     { x: 11400, otsikko:'Kokonainen kirja tekoälyllä - Claude Fable', koko: 6, puoli:'oikea', savy:'kelta', kortti:true, },

    // Sähkömoottori-paradoksi (elossa Secto 10.9.2026, yleistetty - ei HR-mainintaa)
//POHJA     { x: 11417, otsikko:'Sähkömoottori-paradoksi', teksti:'Kun tehtaat siirtyivät höyrystä sähköön, tuottavuus ei aluksi noussut lainkaan.', kortti:true, muistiinpanot:'Miksi? Koska uudet sähkömoottorit sijoitettiin vain vanhojen höyrykoneiden tilalle. Vasta kun koko tehtaan pohjapiirros ja työnkulku suunniteltiin uusiksi, teho kasvoi. Sama pätee tekoälyyn: jos vain korvaat yhden ihmisen tai rutiinin chatbotilla, mikään ei parane. Koko prosessi pitää miettiä uusiksi.', puoli:'keski', savy:'valko', koko: 8, hahmoAnimaatio:'Idle_Alert', },

    // TAITEILIJA-MODUULI: Zhou & Lee, PNAS Nexus 2024 ("Generative artificial intelligence, human
    // creativity, and art", DOI 10.1093/pnasnexus/pgae052) - vertaisarvioitu,
    // todennettu 8.9.2026 (paperi + PNAS Nexuksen oma peer-review -asema
    // haettu haulla, ei vain luotettu lähdedokumentin viitteeseen sokeasti).
    // Kaksi diaa: 1) tutkimusasetelma ensin (Jarno: "avaa mistä tutkimuksessa
    // oli kysymys" - EI pelkkää tilastoa otsikkona), 2) sitten löydös.
//    { x: 11405, otsikko:'Tutkimus: yli 4 miljoonaa teosta, 50 000 taiteilijaa', teksti:'Tutkijat vertasivat samojen tekijöiden töitä ennen ja jälkeen tekoälyn käyttöönoton, yhdellä maailman suurimmista taidealustoista.', muistiinpanot:'Miksi tämä on luotettava: tämä EI ole laboratoriokoe muutamalla koehenkilöllä, vaan oikeaa käyttöä yli 50 000 taiteilijalta vuosien ajalta. Tutkijat vertasivat SAMOJA tekijöitä ennen/jälkeen - muutos ei siis selity sillä että eri ihmiset alkoivat käyttää palvelua, vaan nähdään mitä samalle tekijälle oikeasti tapahtuu. Vertaisarvioitu, julkaistu PNAS Nexuksessa (Yhdysvaltain Kansallisen tiedeakatemian ja Oxfordin yliopiston kustantajan yhteisjulkaisu) - tarkistettu 8.9.2026, oikea tutkimus (Zhou & Lee 2024, DOI 10.1093/pnasnexus/pgae052).', lahde:'Zhou & Lee, PNAS Nexus 2024', koko: 6, puoli:'keski', savy:'valko', kortti:true, },
//    { x: 11410, otsikko:'Enemmän töitä, enemmän suosiota - vähemmän omaa jälkeä', teksti:'Sama tekijä teki keskimäärin 25 % enemmän ja sai 50 % enemmän suosikkimerkintöjä. Mutta juuri se, mikä teki teoksista hänen näköisiään - siveltimenjälki, väriharmonia, valaistus - alkoi tasaisesti kadota.', muistiinpanot:'ehotteiden suunnittelu (prompt engineering) muuttuu kaavamaiseksi ja käyttäjät tukeutuvat usein samoihin valmiiksi hienosäädettyihin malleihin ja tyyleihin tasaisen laadun varmistamiseksi. Lisäksi paperi varoittaa, että vanhentuneella tiedolla opetetut tekoälyt synnyttävät helposti itseään vahvistavan kehän, jossa luodaan vain geneeristä massasisältöä', lahde:'Zhou & Lee, PNAS Nexus 2024', koko: 6, puoli:'oikea', savy:'kelta', kortti:true, },

    // PÄÄTEEMA: Viisas tekoälyttömyys

//POHJA         { x: 11420, otsikko:'Viisas tekoälyttömyys', teksti:[
//POHJA         { rivi: 'Mitkä asiat ärsyttävät, vievät aikaa siltä mitä oikeasti haluaa tehdä?' },
//POHJA         { rivi: 'Raportit' },
//POHJA         { rivi: 'Viestinnän tylsät puolet' },
//POHJA         { rivi: 'Exceleiden selvittäminen' },
//POHJA         // POHJA: vaihda rivit yleisön mukaan (taiteilijat: Näyttelytekstit, Apurahahakemukset, Raportit, Viestintä)
//POHJA       ], koko: 7, puoli:'keski', savy:'valko', kortti:true, },

//    { x: 11430, otsikko:'Apurahahakemukset', teksti:[
//        { rivi: 'Tekoäly on hyödyllinen työkalu yhteenvedon muotoilussa, ydinviestien kirkastamisessa ja ns. "hissipuheen" tiivistämisessä.' },
//        { rivi: 'Rahoittajan kulmasta olennaista on, että idea on sinun' },
//        { rivi: 'Se sopii erittäin hyvin kielenhuoltoon ja hakemuksen kääntämiseen muille kielille.' },
//        { rivi: 'Voit hyödyntää sitä apuna esimerkiksi projektin viestintäsuunnitelman tai aikataulun hahmottelussa.' },
//      ], koko: 6, puoli:'vasen', savy:'kelta', kortti:true, },
//POHJA     { x: 11440, otsikko:'Hampurilaismalli', teksti:[
//POHJA         { rivi: '🍞 Ihminen: tavoite, konteksti, rajaus - "mitä halutaan saavuttaa?"' },
//POHJA         { rivi: '🥩 Tekoäly: luonnos, tiivistys, lista, ideointi - "raakatyö"' },
//POHJA         { rivi: '🍞 Ihminen: arviointi, tunneäly, päätöksenteko - "onko tämä totta? onko tämä viisasta?"' },
//POHJA       ], muistiinpanot:'Ajatus: ei anneta kaikkea tekoälylle, vaan ihminen pitää pakettia kasassa alusta loppuun (Jarnon oma sanelema kuvaus, ei dokumentista). TARVITAAN ANIMAATIO HAMPURILAISESTA (dokumentin oma huomautus) - ei vielä rakennettu, vain teksti.', koko: 6, puoli:'keski', savy:'kelta', kortti:true, },

    // Stable Diffusion + ControlNet & LoRA (7.9.2026, Jarnon oma teksti - käytetty
    // lähes sanasta sanaan). Jarno: "4 stops? Just one" - yhdistetty yhdeksi
    // kortti:true-pysähdykseksi, 4 riviä paljastuu peräkkäin. "Ei ole aivan
    // yksinkertaista" -kohta oli Jarnolla kesken - täydennetty lähdedokumentin
    // omalla, todennetulla faktalla (näytönohjainvaatimus), ei keksitty.
    // koko:6->5 (8.9.2026) - pitkä otsikko (3 riviä) + 4 täyttä lausetta
    // ylitti yhdessä ruudun alareunan koon:6:lla, kun kaikki 4 riviä ovat
    // auenneet samaan aikaan (vrt. x:11430, joka mahtuu juuri ja juuri
    // koko:6:lla lyhyemmällä otsikolla) - ei tekstiä lyhennetty, vain koko.

//        { x: 11441, otsikko:'Kuvien luominen', muistiinpanot:'teossuoja', puoli:'keski', savy:'valko', kortti:true, },

//    { x: 11443, otsikko:'Stable Diffusion + ControlNet & LoRA', teksti:[
//        { rivi: 'Täysi hallinta: sommittelu ja tyyli pysyvät sinun käsissäsi, ei tekoälyn arvauksen varassa.' },
//        { rivi: 'ControlNet: oma käsin piirretty viivaluonnos tai asento "blueprinttina" - tekoäly renderöi pinnan sen päälle.' },
//        { rivi: 'LoRA: 15-50 omaa teostasi riittää - malli oppii simuloimaan sinun sivellintekniikkaasi, ei internetin geneeristä kuvamassaa.' },
//        { rivi: 'Ei ole aivan yksinkertaista: vaatii tehokkaan näytönohjaimen (vähintään 12-24 GB VRAM) ja opettelua.' },
//      ], koko: 5, puoli:'keski', savy:'kelta', kortti:true, },

    // TAITEILIJA-MODUULI: Oman taiteen suojaaminen (Dia 1-4, dokumentin oma järjestys) - kuvataiteilijoille
//    { x: 11450, otsikko:'Alustakohtainen suojaus', teksti:[
//        { rivi: 'Tarkista asetuksista NoAI-suojausasetus (esim DeviantArt, ArtStation, Cara)' },
//        { rivi: 'Esim. Meta (Instagram & Facebook): Tekoälykoulutuksen kieltävä opt-out-lomake' },
//      ], koko: 6, puoli:'vasen', savy:'kelta', kortti:true, },
//    { x: 11460, otsikko:'Omien verkkosivujen suojaus', teksti:[
//        { rivi: 'Robots.txt: pyytää botteja jättämään teokset rauhaan. Se ei kuitenkaan poista jo kerättyä dataa.' },
//        { rivi: 'TDMRep-protokolla: verkkosivuille asennettava pieni tiedosto (tdmrep.json), joka tekee oikeuksien pidättämisestä EU:ssa juridisesti sitovaa EU:n tekoälyasetuksen (AI Act) nojalla.' },
//      ], koko: 6, puoli:'oikea', savy:'valko', kortti:true, },
//    { x: 11470, otsikko:'Tekninen suojaus', teksti:[
//        { rivi: 'Glaze (Puolustava): Lisää kuvaan näkymätöntä pikselikohinaa, joka estää tekoälyä matkimasta uniikkia tyyliäsi (estää LoRA-hienosäädön).' },
//        { rivi: 'Nightshade (Hyökkäävä): "Myrkyttää" luvatonta opetusdataa siten, että se sotkee tekoälyn käsitteet (esim. koira alkaa näyttää koneelle kissalta).' },
//      ], koko: 6, puoli:'vasen', savy:'kelta', kortti:true, },
//    { x: 11480, otsikko:'Mikä ei toimi', teksti:[
//        { rivi: 'Matalan resoluution julkaisut: Eivät suojaa tekoälyltä, sillä mallit oppivat tyylit ja sommittelut myös pienistä kuvista.' },
//        { rivi: 'Kuvatekstien kiellot: Tavalliset tekstit (kuten ”© älä käytä tekoälyyn”) eivät täytä lain vaatimaa koneluettavaa muotoa.' },
//      ], koko: 6, puoli:'oikea', savy:'puna', kortti:true, },

    // TEEMA SEKALAISET (dokumentin oma järjestys)
//POHJA     { x: 11482, otsikko:'Energiatehokas tekoälyvuorovaikutus (Promptaus)', teksti:'Vältä "promptirulettia": Muotoile heti alussa yksi kattava ja täsmällinen kehote (tavoitteet, tyyli ja tarkat rajaukset).', koko: 6, puoli:'keski', savy:'kelta', kortti:true, },
//POHJA     { x: 11484, otsikko:'Lokaalit kielimallit (Offline-tekoäly omalla koneella)', teksti:[
//POHJA         { rivi: 'Esim. Ollama: Pieniä ja tehokkaita tekoälymalleja voi ladata ja ajaa kokonaan paikallisesti omalla tietokoneella.' },
//POHJA         { rivi: 'Mutta paikallinen laskenta käyttää oman laitteesi sähköä.' },
//POHJA         { rivi: 'Tietoturva: Data ei karkaa opetusmateriaaliksi tai ulkopuolisille palvelimille' },
//POHJA       ], koko: 6, puoli:'vasen', savy:'kelta', kortti:true, },
//POHJA     { x: 11486, otsikko:'Pilvikielimallit & oman aineiston hallinta', teksti:[
//POHJA         { rivi: 'NotebookLM ja oman rajatun aineiston käyttö: RAG (Retrieval-Augmented Generation) eli sitoo kielimallin käyttäjän omiin dokumentteihin.' },
//POHJA         { rivi: 'Muista Opt-out-asetukset myös muissa käyttämässäsi tekoälysovelluksissa' },
//POHJA       ], koko: 6, puoli:'oikea', savy:'kelta', kortti:true, },

//POHJA     { x: 11487, otsikko:'NotebookLM', teksti:'', koko: 6, puoli:'keski', savy:'kelta', kortti:true, },

//POHJA     { x: 11488, otsikko:'"95-malli" & Ketjun hallinta', teksti:[
//POHJA         { rivi: 'Pidä ketjut lyhyinä: Pitkissä keskusteluketjuissa malli lukee koko aiemman historian uudelleen jokaisella viestillä, mikä moninkertaistaa sähkönkulutuksen. Aloita tarvittaessa uusi keskustelu.' },
//POHJA         { rivi: '"<span style="color:#B0CB40">Jos et ole 95 % varma asiasta, kysy ja varmista minulta ennen kuin teet mitään.</span>"' },
//POHJA       ], koko: 6, puoli:'keski', savy:'valko', kortti:true, },



    // ZALARIS-MODUULI: Tekoäly HR:n sivuaivoina / ajattelun GPS
//    { x: 11485, otsikko:'Tekoäly on ajattelun GPS-laite', teksti:[
//        { rivi: 'Navigaattori auttaa löytämään oikean TES-säännön tai kaavan.' },
//        { rivi: 'Se varoittaa ajoissa matkan varrella olevista poikkeamista.' },
//        { rivi: '<span style="color:#B0CB40">Mutta autoa ajat ja päätökset teet aina sinä itse.</span>' }
//      ], muistiinpanot:'Kone hoitaa datan perkaamisen valonnopeudella. Teille jää tulkinta, kontekstin ymmärtäminen ja päätöksenteko.', puoli:'vasen', savy:'kelta', koko: 5, kortti:true, },


//POHJA     { x: 11490, otsikko:'Jos tekoäly vapauttaa tunnin paperitöistä, se on tunti lisää ihmiselle.', teksti:'Kone ei koe myötätuntoa, mutta se voi vapauttaa ihmisen kokemaan sitä.', muistiinpanot:'"Te ette opiskele täällä tullaksenne hyviksi raporttien kirjoittajiksi, vaan tullaksenne hyviksi ihmisten kohtaajiksi.', puoli:'oikea', savy:'kelta', kortti:true, hahmoAnimaatio:'Sit', },





 //   { x: 11640, otsikko:'Kone kumppanina', teksti:'Tekoäly ja automaatio vievät rutiinit, mutta samalla ne luovat uuden, asiantuntijan roolin. Työmäärä vähenee, mutta samalla saadaan enemmän aikaan.', puoli:'vasen', savy:'kelta' },



  //SCENE:    kaupunki-eder-close
    // ZALARIS-MODUULI: digitaaliset taidot
 //   { x: 11790, otsikko:'Tulevaisuus edellyttää digitaalisia taitoja ja kykyä työskennellä koneen kanssa.', puoli:'oikea', savy:'kelta', kortti:true, },
//POHJA     { x: 11940, otsikko:'Kone ei ajattele', teksti:'…ja ajattelu on kaiken luovuuden lähtökohta', muistiinpanot:'Luovuus ei ole sitä että tekee taidetta vaan myös sitä mitä teette', puoli:'vasen', savy:'kelta', koko: 6, kortti:true, hahmoAnimaatio:'Sit', },
//POHJA     { x: 12090, otsikko:'Suurissa historiallisissa murroksissa tietyt inhimilliset ydintoiminnot säilyvät, mutta niiden muoto ja merkitys muuttuvat.', muistiinpanot:'Te sen tiedätte', puoli:'keski', savy:'kelta', koko: 5, kortti:true, hahmoAnimaatio:'Sit', },


    //SCENE:  kaupunki-eder-distance


//POHJA     { x: 12240, teksti:'"Ihmisen antama huomio tulee olemaan niukka resurssi. Se tunne, jonka ihmisen antama huomio synnyttää, tulee olemaan nuorille yhtä tärkeää tulevaisuudessa kuin se on tänään."', lahde:'Neil Lawrence, Musta laatikko -kirjassa', koko: 7, lahdeKoko: 4, muistiinpanot:'Te sen tiedätte', puoli:'vasen', savy:'kelta', kortti:true, hahmoAnimaatio:'Sit', },
//POHJA     { x: 12390, otsikko:'', teksti:'Katri Saarikivi', pysty:'ala', puoli:'oikea', savy:'kelta', kortti:true, },
    // ZALARIS-MODUULI: HUOM x:12390 on Zalariksessa TÄMÄ teksti (ei Katri-videota) - Pohjassa siirretty
    // x:12395:een, jotta molemmat voivat olla samassa tiedostossa. Valitse jompikumpi kopioon.
//    { x: 12395, otsikko:'Rutiinit ja prosessit voidaan automatisoida, mutta työntekijän kokemus huolenpidosta ja arvostuksesta vaatii aina toisen ihmisen. <span style="color:#FBFCE2">Vain aito inhimillinen huomio ja läsnäolo vaikuttavat meihin syvällä.</span>', puoli:'oikea', savy:'kelta', kortti:true, },
    
//POHJA     { x: 12540, otsikko:'Ihmisen supervoima verrattuna tekoälyyn?', muistiinpanot:'Miten välttää kognitiivinen velka tekoälyä käyttäessä?', puoli:'keski', savy:'kelta', kortti:true, },
//POHJA     { x: 12690, otsikko:'HITAUS!', teksti:'', muistiinpanot:'Kone ajattelee miljoonakertaisesti nopeammin Inhimillisen ajattelun vastarinta', puoli:'keski', savy:'kelta', koko: 10, hahmoAnimaatio:'Sit', },
//POHJA     { x: 12840, vertailu: { otsikot:['Hidas ihminen','Nopea kone'], rivit:[
//POHJA         { vasen:'<span style="color:#FBFCE2">Hidas, harkitseva, reflektiivinen</span>', oikea:'<span style="color:#FBFCE2">Nopea, automaattinen, vaivaton</span>' },
//POHJA         { vasen:'<span style="color:#E3C1A6">Kysyy, epäilee, ymmärtää</span>', oikea:'<span style="color:#E3C1A6">Käsittelee dataa valonnopeudella</span>' },
//POHJA         { vasen:'<span style="color:#B0CB40">Tekee tilaa viisaudelle, ei vain tehokkuudelle</span>', oikea:'<span style="color:#B0CB40">Tuottaa vastauksia, mutta ei ymmärrystä</span>' },
//POHJA     ] }, puoli:'keski', savy:'kelta', koko: 6, kortti:true, hahmoAnimaatio:'Sit', },
    // SECTO-MODUULI (10.9.2026, Jarnon oma teksti): yleisön oma 'inhimillinen ydin' heti kilpikonna/jänis-vertailun jälkeen.
//    { x: 12850, otsikko:'"Ajaton muotoilu, uusiutuva koivu ovat supervoimanne tuotoksia"', teksti:'Secto Designin valaisimien inhimillinen ydin: Käsityön merkitys ja uniikki muotoilu, jota algoritmi ei voi simuloida.', puoli:'oikea', savy:'kelta', koko: 6, kortti:true, hahmoAnimaatio:'Sit', },


//SCENE:  kukkulat-eder-muniz-hill

//POHJA     { x: 12990, otsikko:'Meidän tehtävämme ei ole kilpailla koneen nopeudessa, vaan hidastaa niin, että ehdimme olla ihmisiä.', muistiinpanot:'Opimme virheistä, kone ei', puoli:'oikea', savy:'kelta', koko:6, hahmoZ: 44, hahmoAnimaatio:'Sit', kortti:true, },
 //   { x: 13140, teksti:'Ihmisäly: empatiaa, tilannetajua, hiljaista tietoa, jaettua kokemusta ja ympäristön ymmärrystä — kykyä istua toisen ihmisen kanssa hiljaa.<br>:)<br>Tekoäly: työkalu, navigaattori joka auttaa löytämään perille, mutta ei korvaa matkan kokemusta.', koko: 4, puoli:'vasen', savy:'valko', kortti:true, hahmoAnimaatio:'Sit', },
//POHJA     { x: 13290, otsikko:'Viisas tekoälyttömyys on kykyä valita – <span style="color:#FBFCE2">milloin tekoäly tukee ihmisyyttä ja milloin se heikentää sitä.</span>', puoli:'keski', savy:'kelta', kortti:true, hahmoAnimaatio:'Sit', },

//SCENE:  metsa-eder-muniz 

  //  { x: 13440, otsikko:'Kirjastotyöntekijät = sosiaalisia insinöörejä', muistiinpanot:'Koska tekoälyn myötä kuka tahansa voi tuottaa massoittain uskottavan kuuloista (mutta mahdollisesti täysin virheellistä tai synteettistä) sisältöä, tarvitsemme entistä enemmän luotettavia portinvartijoita – kuten kirjastoja, kustantamoita ja faktantarkistajia – jotka valikoivat ja kuratoivat luotettavaa tietoa\n.', puoli:'vasen', savy:'kelta' },
  //  { x: 13590, otsikko:'Algoritminen lukutaito on uusi kansalaistaito', teksti:'Lukutaidoton on muiden tulkintojen varassa myös digitaalisessa koodin maailmassa. Tekoälyaikana tarvitsemme entistä enemmän luotettavia portinvartijoita – kirjastoja, kustantamoita ja faktantarkistajia.', muistiinpanot:'Koska tekoälyn myötä kuka tahansa voi tuottaa massoittain uskottavan kuuloista (mutta mahdollisesti täysin virheellistä tai synteettistä) sisältöä, tarvitsemme entistä enemmän luotettavia portinvartijoita – kuten kirjastoja, kustantamoita ja faktantarkistajia – jotka valikoivat ja kuratoivat luotettavaa tietoa\n.', puoli:'oikea', savy:'kelta' },
//POHJA     { x: 13740, otsikko:'Homo Ludens', lahde:'Johan Huizinga', puoli:'vasen', savy:'valko', hahmoAnimaatio:'Jump', },
    // linkki isommaksi (8.9.2026, Jarno: "on presentation Kiitos page, can
    // link be there bigger?") - oma rivi + font-size:1.7em erottaa sen
    // nimi/sähköposti-rivistä, jotta yleisö ehtii huomata/kirjoittaa sen
    // muistiin dian näkyessä.
        // ZALARIS-MODUULI: näyteikkuna - kaikki piilotetut yritysesineet yhdessä (spritesheet, ks. esitys-2d-hahmot.js x:13800)
//    { x: 13800, otsikko:'', lahde:'', puoli:'vasen', savy:'valko', hahmoAnimaatio:'Bark', },
    // POHJA: jos yleisölle on oma sivu, lisää tekstiin: <br><span style="color:#B0CB40; font-size:1.7em; font-weight:800;">csy.fi/xxx</span>
//POHJA     { x: 13890, otsikko:'Kiitos!', teksti:'Jarno Alastalo · jarno@csy.fi', puoli:'vasen', savy:'valko', hahmoZ: 46, hahmoAnimaatio:'Sit' },
    // FINAALI (6.9.2026, Jarno: "what will be great touch to end
    // presentation... game like screen, Valitse polkusi") - ks. polkupeli-
    // kentän dokumentaatio yllä. Ei otsikko/teksti-kenttiä lainkaan (koko
    // ruutu peittävä oma overlay hoitaa kaiken sisällön, sama käytäntö
    // kuin esim. x:855/x:1365 tyhjillä pysähdyksillä).
//POHJA     { x: 14040, puoli:'keski', savy:'kelta', polkupeli: true },
  //  { x: 14040(vanha, nyt polkupeli käyttää tätä x:ää yllä), otsikko:'Tekoälyn energiankulutus kasvaa nopeasti', teksti:'Yksi Copilot-kehote = n. 4 min 5W LED-valoa', muistiinpanot:'Pitkä ChatGPT-viesti voi vastata noin 20 minuutin 10 watin LED-valon energiankulutusta', puoli:'oikea', savy:'kelta' },
  //  { x: 14190, otsikko:'Tämä taustakuva', teksti:'≈ 1h 20min 5W LED-valoa', muistiinpanot:'Pitkä ChatGPT-viesti voi vastata noin 20 minuutin 10 watin LED-valon energiankulutusta', puoli:'vasen', savy:'kelta' },
  //  { x: 14340, teksti:'Tekoälyllä on kuitenkin merkittävä rooli ympäristöongelmien ratkaisemisessa. Tekoäly tehostaa energiankäyttöä teollisuudessa, liikenteessä ja rakennuksissa, mikä vähentää kulutusta ja päästöjä.', puoli:'vasen', savy:'valko', hahmoZ: -250, hahmoAnimaatio:'Rest_Pose' },

    // ---------------------------------------------------------------------
    // 31.8.2026: Jarno vei tuoreen Keynote-viennin (Zalaris_esitys.pptx,
    // 135 diaa - ks. files/Zalaris_esitys_teksti.md ja muistion §34) joka
    // sisälsi ENEMMÄN sisältöä kuin tämä tiedosto siihen asti. Jarno:
    // "Just add textes to current, then we do matching" - lisätty TÄHÄN
    // (x:9560 jälkeen, EI sekoitettu olemassa olevien 99 pysähdyksen
    // sekaan välttääkseen niiden huolella viritettyjen puoli/savy/koko/
    // hahmoZ/hahmoAnimaatio-arvojen tai 3D-maailman hahmosijoittelun
    // rikkomista) 6 AIDOSTI UUTTA pysähdystä, jotka eivät löytyneet
    // vanhasta datasta (tarkistettu ohjelmallisesti sanajoukko-
    // vertailulla jokaista 135 diaa vastaan, kynnys 50% päällekkäisyys -
    // katso muistion §35 tarkka menetelmä). puoli/savy/koko VASTA
    // ALUSTAVASTI aseteltu tyylin mukaisesti, EI vielä Jarnon itse
    // tarkistamaa - odottaa tekstivastaavuuspassia (kohtaus + lopullinen
    // asettelu) sekä sisällön kertausta.
    //
    // Nämä diat TIETOISESTI JÄTETTY POIS (ei aitoa lisättävää tekstiä,
    // mutta merkitty tähän ettei tieto katoa - hyödyllistä myöhemmin
    // "how to add video" -työlle, ks. muistion avoin lista):
    // - dia 1 "Äänitesti" - testimerkintä, ei sisältöä.
    // - dia 30 "Video: Verke.org CC 4.0, Haastattelijana: Jarno Alastalo /
    //   Esko Valtaoja, Emeritusprofessori" - VIDEOhaastattelun nimikyltti,
    //   ei lainaustekstiä sellaisenaan.
    // - dia 88 "Hi" - täytemerkintä.
    // - dia 107 "Taulukko / Raportti / >" - kaavion/taulukon omia UI-
    //   nappilappuja, ei narratiivia.
    // - dia 120 "Katri Saarikivi, aivotutkija" (muistiinpanot:
    //   "Kontekstin ymmärrys") - toisen VIDEOhaastattelun nimikyltti.
    // - dia 128 "Sosiaalisia insinöörejä" + "Rescue Rabbit" 3D-mallin
    //   attribuutio - lähes identtinen jo olemassa olevan x:8960-
    //   pysähdyksen kanssa (sama muistiinpanoteksti), käsitelty
    //   duplikaattina.
    // - dia 14 "energiankulutus" + pitkä sovellus/järjestelmälista
    //   (ChatGPT/Claude/DeepSeek/...) - sanapilvi-tyyppinen visuaalinen
    //   dia, ei narratiivia lisättäväksi sellaisenaan.

 
    // x:14790 KOMMENTOITU POIS 6.9.2026 (Jarno: "ah sorry, 'jos organisaatiosi'
    // is just old, not part of presentation") - vanhaa 135-dian aineistoa,
    // ei osa esitystä, jätetty tähän vain historian vuoksi (sama käytäntö
    // kuin muillakin tämän lohkon kommentoiduilla dioilla yllä).
    //  { x: 14790, otsikko:'Jos organisaatio luottaa sokeasti pelkkään tekoälyyn tai ulkoistaa prosessit ymmärtämättä niiden logiikkaa, se ei enää ymmärrä, miten lopputuloksiin on päädytty', puoli:'vasen', savy:'kelta' },


    
  ];
