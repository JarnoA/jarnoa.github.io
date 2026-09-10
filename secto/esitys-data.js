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
//SCENE: metsa-eder-muniz 
  { x: 90, otsikko:'', muistiinpanot:'Opening beat, no text yet. Just breathe, let the room settle before your name appears.', puoli:'vasen', savy:'kelta', koko: 10, pysty:'keski', puoli:'keski', hahmoAnimaatio:'Sit' },
  { x: 91, otsikko:'', muistiinpanot:'Opening beat, no text yet. Just breathe, let the room settle before your name appears.', puoli:'vasen', savy:'kelta', koko: 10, pysty:'keski', puoli:'keski', hahmoAnimaatio:'Sit' },
    { x: 92, otsikko:'Jarno Alastalo', muistiinpanot:'Just your name - let it sit a moment before moving to the title.', puoli:'vasen', savy:'kelta', koko: 5, pysty:'keski', puoli:'vasen', hahmoAnimaatio:'Sit' },
    { x: 93, otsikko:'The Last Human Thing', muistiinpanot:'Start by naming who you are speaking to: Secto Design - Sales, Customer Service, Marketing, Finance, IT, IPR. At The Torby, Fiskars - 1.5h talk + open discussion at the end. "Ask anything."', puoli:'vasen', savy:'kelta', koko: 10, pysty:'keski', puoli:'keski', hahmoAnimaatio:'Sit' },

    { x: 240, otsikko:'What are the traits a machine cannot replicate?', koko: 7, muistiinpanot:'The last core, Democritus. Democritus argued matter breaks down into indivisible atoms - when we break humanity down, we find an indivisible human core that algorithms cannot reach: presence, empathy, judgment.', puoli:'oikea', savy:'kelta', hahmoAnimaatio:'Jump' },
    //tähän atomi animaatio
    
    { x: 390, otsikko:'<span style="color:#B0CB40">AI-mindlessness</span>, (tekoälyttömyys)', koko: 9, savy:'valko', teksti: '1. <span style="color:#FF5562">[often negative]</span> a state in which excessive use of AI weakens human learning and thinking ability.', muistiinpanot:'What does AI-mindlessness mean? "AI-mindlessness begins when people stop using their own brains."', koko: 6, puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
    
    { x: 405, otsikko:'<span style="color:#B0CB40">AI-mindlessness</span>, (tekoälyttömyys)', koko: 9, savy:'valko', teksti: '1. <span style="color:#FF5562">[often negative]</span> a state in which excessive use of AI weakens human learning and thinking ability. <br> <br> 2. <span style="color:#B0CB40">[positive]</span> the ability to use AI wisely while preserving human judgment and independent thinking.', muistiinpanot:'This is the second, positive half of the definition - the one this whole talk actually argues for. Not avoiding AI, using it without losing your own judgment.', koko: 6, puoli:'vasen', savy:'kelta', },
    
    { x: 540, otsikko:'Every one of us is already part of a new era', koko: 7, teksti:'A "new" kind of human, living and thinking alongside AI.', muistiinpanot:'This is not just a new tool, it is a new kind of human being who thinks alongside AI.', puoli:'oikea', savy:'valko', },
    { x: 690, otsikko:'', muistiinpanot:'Generative AI is everywhere right now.\n\nWho here has used AI today?', puoli:'vasen', savy:'kelta' },
    // jäävuori: kolme tasoa paljastuvat peräkkäin + läpinäkyvä aalto nousee
    // (Jarnon idea 2.9.2026: "under surface is lot, we often see only
    // generative AI" - jäävuorivertaus, näkyvä huippu vs. piilossa oleva
    // massa). Muokkaa/lisää kohteita vapaasti - tämä on ehdotus.
    { x: 840, savy:'kelta', hahmoAnimaatio:'Idle_Alert', muistiinpanot:'What most people picture when they hear "AI" - ChatGPT and friends - is just the visible tip. Underneath: the social media feed deciding what you see, and deeper still, the systems already running healthcare, traffic lights, weather forecasts, energy grids. AI has been in daily life far longer than ChatGPT has existed.',
      jaavuori: { viive: 1500, tasot: [
        { otsikko: 'Generative AI', kohteet: ['ChatGPT','Claude','DeepSeek','Midjourney','Copilot','Gemini'] },
        { otsikko: 'Social media, other media', kohteet: ['TikTok','Instagram','YouTube','Netflix','news','ads'] },
        { otsikko: 'Systems', kohteet: ['healthcare','traffic lights','weather forecasts','energy use'] },
      ]}
    },
    { x: 855, muistiinpanot:'Washing machine, dirty clothes.', },
  //pesukone

    { x: 990, otsikko:'What is left for humans?', koko: 8, puoli:'keski', muistiinpanot:'The dawn of the age of AI-mindlessness. When AI does the thinking for us, we skip past the moments of learning and insight.', savy:'kelta', hahmoZ: -60, hahmoAnimaatio:'Bark' },
    { x: 1140, otsikko:'Myths & Reality', muistiinpanot:'lets bust a few common myths about what AI actually is.', koko: 6, puoli:'keski', pysty: 'yla', savy:'valko', },
    { x: 1290, otsikko:'Is AI a god?', muistiinpanot:' Instead of worshipping the sun or ancient deities, modern society has built a "hype temple" around generative AI, where shiny marketing covers up underlying commercial interests', koko: 7,  puoli:'oikea', savy:'kelta', },
    { x: 1300, teksti:'"There are surprisingly many similarities between artificial intelligence and religion. Both deal with a different kind of intelligence that has different powers than we humans."', lahde:'Neil Lawrence, AI professor, University of Cambridge', lahdeKoko: 4, muistiinpanot:'Religion helps people explain the unknown and dodge responsibility for their own actions. It is easier to blame a god than to consider the consequences of our own deeds. Humans naturally explain the inexplicable with something familiar - now AI is being dressed in the same human-like form.', puoli:'oikea', savy:'kelta', koko: 7, hahmoZ: 44, hahmoAnimaatio:'Bark' },
{ x: 1350, otsikko:'Religion helps people explain the unknown and dodge responsibility for their own actions', teksti:'Now AI is being dressed in that same human-like form',muistiinpanot:'That is why gods so often resemble humans or animals. It is easier to blame something else than to weigh the consequences of your own deeds. People naturally explain the inexplicable with something familiar.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Idle_Alert' },
  
    // Musta laatikko cover, ei tekstiä — pelkkä hetki katsoa kantta (Jarnon pyyntö 26.8.2026)
    { x: 1365, muistiinpanot:'if AI resembles any deity, it isnt a benevolent father figure, but Loki — the Norse trickster god. It shapes our choices and emotions by subtly pulling invisible algorithmic threads behind the scenes.' },
    // Mech-ylitys, ei tekstiä — Jarnon pyyntö 2.9.2026 "i want robot walk
    // when there is no text on screen" - oma tyhjä pysähdys, EI jaettu
    // seuraavan tekstin kanssa (ks. esitys-2d-hahmot.js:n YLITYSHAHMOT).
    { x: 1400, muistiinpanot:'Pop culture movies like Terminator and Westworld train us to expect artificial intelligence as rebel, and initiate nuclear war – or taking our all jobs', hahmoAnimaatio:'Bark' },
    // Loki, ei tekstiä — pelkkä hetki katsoa hahmoa (Jarnon pyyntö 26.8.2026)
    
    
    { x: 1760, otsikko:'<span style="color:#FF5562">Roko\'s Basilisk</span>', teksti:'"In the future there might exist a powerful AI that destroys everyone who was not part of building it."', lahde:'Crumble Snoop, age 16', muistiinpanot:'A real internet myth. Some people even thank their chatbot politely "just in case" a future AI judges them by how they treated it. Shows how little understanding breeds superstition.', puoli:'keski', savy:'valko', koko: 7, lahdeKoko: 4, },
    
    { x: 1890, otsikko:'Humans have given <span style="color:#B0CB40">"life"</span> to a machine that challenges the idea that we are the center of everything', muistiinpanot:'Same shift as Copernicus moving Earth out of the center of the universe - AI forces us to ask whether human intelligence is really the center of everything.', puoli:'keski', savy:'kelta', koko: 4, hahmoAnimaatio:'Idle_Alert', },
    { x: 2040, otsikko:'Through every major technological shift, humans have had to reconsider their own role in society.', muistiinpanot:'Printing press gutenberg = common people could reach knowledfe, radio, television was bad, internet, social media = Im addicted to the phone. - every new technology triggered the same fear cycle. Now it is AI\'s turn.', puoli:'vasen', savy:'kelta', hahmoZ: -120, hahmoAnimaatio:'Sneak' },
    { x: 2190, teksti:'Socrates warned that writing would weaken people\'s memory and understanding.', lahde:'Socrates, c. 470-399 BCE', muistiinpanot:'Socrates was actually against writing - he thought it would ruin memory. The irony: everything we know about Socrates survives only because someone wrote it down.', puoli:'keski', savy:'kelta', koko: 9, lahdeKoko: 4, hahmoAnimaatio:'Sit', },
    
  
    
    { x: 2340, otsikko:'The term artificial <span style="color:#B0CB40">intelligence</span> creates the illusion that the machine is intelligent', koko: 8, muistiinpanot:'Intelligence is like beauty - it means something to everyone, but it is subjective, not something you can simply measure. Researchers approach it through mathematical models and talk about the singularity. In the end, it is really just a very advanced autocorrect.', puoli:'keski', savy:'kelta', hahmoAnimaatio:'Sneak', },
    { x: 2490, teksti:'"The intelligence of today\'s AI is about the level of a toaster."', lahde:'Pekka Abrahamsson, AI professor', muistiinpanot:'Current AI has no true understanding, self-awareness, or feelings. It is simply a series of mathematical calculations and algorithms predicting the next word or pixel to mimic human responses', puoli:'oikea', savy:'kelta', koko: 7, lahdeKoko: 4, },
    { x: 2630, teksti:'"The Analytical Engine has no intention of creating anything new. It can do anything we can tell it to do. Its job is to help us make use of what we already know."', koko: 7, lahdeKoko: 4, muistiinpanot:'I see this is a core AI principle', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
    { x: 2640, teksti:'"The Analytical Engine has no intention of creating anything new. It can do anything we can tell it to do. Its job is to help us make use of what we already know."', lahde:'Ada Lovelace, 1815-1852', koko: 7, lahdeKoko: 4, muistiinpanot:'Except Ada Lovelace said this 1842.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
    // teksti taulukkona 3.9.2026 (Jarno: "add first [lause] then [lause]
    // then etc" - automaattinen, kertyvä paljastus, ks. esitys-2d.html:n
    // naytaTeksti()-kommentti). viive (ms) = odotus EDELLISEN rivin
    // jälkeen - säädettävissä erikseen jokaiselle riville.
    { x: 2790, otsikko:'Artificial Intelligence', koko: 7, teksti:[
        { rivi:'As early as 1495, Leonardo da Vinci sketched robotic knights.' },
        { rivi:'In 1837 Charles Babbage designed the Analytical Engine. <span style="color:#B0CB40">Ada Lovelace wrote the first computer algorithm</span>', viive:2200 },
        { rivi:'Alan Turing proposed the thought experiment: can machines think.', viive:2200 },
        { rivi:'<span style="color:#FF5562">1956</span> John McCarthy introduced the term Artificial Intelligence.', viive:2200 },
      ], koko: 5, muistiinpanot:'The idea of intelligent machines is an old one. Alan Turing code breaker of World War Two', puoli:'oikea', savy:'kelta', },
   
  { x: 2940, otsikko:'Intelligence is more than computation', koko: 7, teksti:[
        { rivi: 'conscious thought' }, 
        { rivi: 'cultural intelligence' },
        { rivi: 'social intelligence' }, 
      ], koko: 5, muistiinpanot:'The real fascination of these new technologies is how differently they work compared to human intelligence. Cultural, embodied and social intelligence are exactly what sales and customer work is built on: negotiation, reading a room, trust, situational sense - not just computation.',  puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit' },
    
    //SCENE linna-eder-2    
    
       { x: 3090, otsikko:'What is special about this moment?', muistiinpanot:'What is different to previous huge tech innovations', puoli:'keski', savy:'kelta', },
    
 
    // chatti: iPhone/iMessage-tyyliset kuplat (Jarnon pyyntö 2.9.2026,
    // "you are ai, you can make this discussion") - havainnollistaa
    // otsikon väitettä konkreettisesti: keskustelu ON nyt rajapinta.
    // Jätetty tarkoituksella kesken/avoimeksi ("Yritä silti.") - AI ei
    // vastaa isoon kysymykseen, mikä kaikuu koko esityksen omaa teemaa
    // (ihminen ei voi ulkoistaa ajattelua koneelle). Muokkaa/kirjoita
    // uudelleen vapaasti - tämä on vain ehdotus.
    { x: 3240, otsikko:'AI is the new interface between machine and human.', muistiinpanot:'What is new, is a computer interface that acts as a human-like — it allows us to interact with complex software using natural human conversation, like in WhatsApp', puoli:'keski', savy:'valko',  kortti: true ,       chattiKuvakeAi: 'kuvat/robot.png', chattiKuvakeSina: 'kuvat/jarno-avatar.png', chattiKoko: 2,
      chatti: [
        { kuka: 'ai', viesti: 'Hi Jarno, how can I help?' },
        { kuka: 'sina', viesti: 'What is the meaning of life?' },
        { kuka: 'ai', viesti: 'Quite a big question for one chat.' },
        { kuka: 'sina', viesti: 'Try anyway.' },
        { kuka: 'ai', viesti: '42.' },
      ]
    },
 
    { x: 3390, otsikko:'The medium is not just a medium - it is the message', kortti:true, lahde:'Marshall McLuhan', muistiinpanot:'We tend to focus on the specific text, code, or images AI generates (the content), but the medium itself — an instant, conversational, algorithmic interface—is what fundamentally transforms how humans think, learn, and process information', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Sit', },
    { x: 3410, otsikko:'A lamp is not just a lamp', teksti:'No one buys a lamp for the light. They buy it for what it says about their home - and about the person who chose it.', muistiinpanot:'', puoli:'oikea', savy:'valko', koko: 6, kortti:true, hahmoAnimaatio:'Idle_Alert', },
    { x: 3540, teksti:'"Humans have been forced to constantly step back and find new ways to express creativity that machines cannot. We must strive to support this core of humanity."', lahde:'Anna-Mari Wallenberg, University Lecturer in Cognitive Science, Adjunct Professor', koko: 7, lahdeKoko: 4, muistiinpanot:'Much easier to accept if you see the machine as just a tool. I asked Googles AI Gemini how it sees the interaction itself with us', puoli:'oikea', savy:'kelta', kortti: true, hahmoAnimaatio:'Sit', },
    { x: 3690, otsikko:'Hey Gemini, what is it like to be a language model?', kortti:true, muistiinpanot:'LLM means Large Language Model. Why did the AI make a video like this?\nIt wanted to show what actually happens "inside" it - because that is very different from how it looks from outside.\nFrom outside it answers neatly and sensibly. Inside, text breaks into thousands of small pieces, processing is limited, and the whole "memory" wipes clean after every conversation.\nThe video was AI honestly showing its own reality - a fragmented, chaotic process hiding behind that smooth fluency.', puoli:'keski', savy:'kelta', },
 
  
   //SCENE: linna-eder-3 
    
    { x: 3840, otsikko:'AI is the GPS of thinking', muistiinpanot:'Strong evidence that how we solve intellectual problems traces back to how we navigate the physical world.\n We get lost sometimes, we learn. Mistakes and insights come from active exploration.', puoli:'keski', koko: 8, savy:'kelta', },
 // Claude, voiko tähän tuoda animoidut autot? 
    { x: 3990, teksti:'"I let AI do my homework sometimes, even though I know I don\'t learn as well that way."', lahde:'Mykola, age 24', muistiinpanot:'This is trade-off most people have made at least once - easiness versus actually learning something.', puoli:'vasen', savy:'kelta', koko: 7, lahdeKoko: 4, kortti:true, hahmoAnimaatio:'Sit', },


 //SCENE: linna-eder-day

    { x: 4140, otsikko:'AI is not just technology - it is a cultural and moral phenomenon.', muistiinpanot:'AI also shapes emotions, communities, and our idea of a good life.', puoli:'keski', savy:'kelta', koko: 8, kortti: true ,hahmoAnimaatio:'Sit', },


     { x: 4141, otsikko:'We are all Mickeys with a magic wand', teksti:'Technology resembles magic: it changes reality in ways that are hard to grasp. Like Mickey Mouse in The Sorcerer\'s Apprentice, we hastily pick up powers we don\'t fully control. You don\'t need to know everything about AI to benefit from it - just as you use Excel or painkillers without understanding every bit or molecule of them.', muistiinpanot:'Disney\'s Fantasia. AI is like magic. Mickey tries to ease his workload with magic but ends up in chaos - the brooms multiply out of control and Mickey can no longer stop them. We are all a bit like Mickey, picking up powers whose workings we don\'t fully understand. Our creations start behaving in ways we don\'t fully control. You can\'t know everything about AI - just as you can\'t know everything about medicine or law.', puoli:'vasen', savy:'kelta', vesi: 50, kortti:true, hahmoAnimaatio:'Idle_Alert', },
 //TÄMÄ SOPII EHKÄ MYÖS
     //Neil Lawrence vertaa tekoälyä magiaan viitaten Disneyn Fantasiaan. Mikki yrittää taikuudella helpottaa työtään, mutta päätyy kaaokseen - luudat monistuvat hallitsemattomasti, eikä Mikki enää pysty pysäyttämään niitä. Olemme tavallaan Mikkejä kaikki, jotka ottavat käyttöön voimia, joiden toimintaa emme täysin ymmärrä. Luomuksemme alkavat toimia tavoilla, joita emme täysin hallitse.
// Et voi tietää kaikkea tekoälystä – aivan kuten et voi tietää kaikkea lääketieteestä tai lainsäädännöstä. Silti voit ymmärtää miten särky- lääke auttaa tai että liikennerikkomuksesta seuraa sakko. Tekoälyn nopea kehitys ja monimutkaisuus tekevät siitä vaikeamman hah- mottaa kokonaisuutena. Viisaampaa on keskittyä perusperiaatteiden ymmärtämiseen ja seurata niitä kehityssuuntia, jotka vaikuttavat suoraan omaan elämääsi. Se on viisautta, ei tiedon välttelyä: hyväk- syt tietämättömyytesi laajuuden, mutta et anna estää sen toimimasta.

    

    { x: 4290, teksti:'AI = a remover of decision-making bottlenecks. <br><span style="color:#B0CB40"> Speeds up decisions, does not make them wiser. </span><br> AI = calculations and algorithms.', muistiinpanot:'One way to describe what AI truly is', puoli:'oikea', savy:'kelta', kortti:true, koko:6, },
    { x: 4440, otsikko:'By constantly asking: "How does this work, and why?" we keep learning and independent thinking alive.', teksti:'', muistiinpanot:'When fear and mysticism are replaced with open conversation, AI stops being a threat and becomes a tool.', puoli:'vasen', savy:'kelta', kortti:true,  },
 

      //SCENE: linna-eder-sunset
 
    { x: 4590, otsikko:'AI and society', muistiinpanot:'Our language matters a lot - the way we talk about AI gives it more power than it actually has.', puoli:'keski', savy:'valko', koko: 8, },
//SIIRTO?    { x: 4740, otsikko:'Ihminen määrittelee usein itsensä työnsä kautta. Jos tekoäly tekee raportin, koemmeko siitä onnistumista', puoli:'oikea', savy:'kelta' },
//SIIRTO=    { x: 4890, otsikko:'Jos työ voidaan pilkkoa toistettaviksi osatehtäviksi, se voidaan automatisoida.', puoli:'vasen', savy:'kelta' },
    { x: 5040, teksti:'"When we talk about how \'AI did something\', we forget that in reality, AI is always created by humans."', lahde:'Laura Ruotsalainen, Professor', kortti:true,  koko: 7, lahdeKoko: 4, muistiinpanot:'Our language matters a lot - the way we talk about AI gives it more power than it actually has.', puoli:'oikea', savy:'kelta', hahmoAnimaatio:'Sit', },
    { x: 5115, otsikko:'AI is a mirror', teksti:'It never creates anything out of thin air - it only reflects and echoes knowledge and action humanity has already produced<span style="color:#B0CB40"> (texts, images, Suomi24, Reddit..)</span>', muistiinpanot:'It repeats what already exists, borrowing what has already been said once and reshaping it into new versions. Current AI models are built on imitating how the human mind works, especially through language and text analysis.', puoli:'vasen', savy:'kelta', koko: 6, kortti:true,  },

   //SCENE: Linna-eder-night

 //   { x: 5190, otsikko:'How AI generates an image', teksti:'<span style="color:#f6efe4; font-size:1.3em;">AI learns mathematically what concepts like "brushstroke", "depth of field", "Renaissance" or "cat" mean.<br><br>A model can imitate a given artist\'s style because it has analyzed the statistical patterns typical of that style.</span>', muistiinpanot:'1. Start: the model creates a fully random field of noise on screen. 2. Guidance: the text prompt "cat" guides the neural network to spot early shapes in the random noise. 3. Iterative cleanup: the model removes noise step by step (often 20-50 steps, 10 here) - broad composition first, fine details/light/texture last. 4. Decoding: computation happens in a compressed Latent Space, then a decoder (VAE) turns it into the final pixel image.', puoli:'vasen', savy:'kelta', kortti:true, diffuusio: { kohinaAika: 5000, syklit: 5 }, hahmoAnimaatio:'Idle_Alert', },
 
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
 
    { x: 5340, otsikko:'Who are you in the eyes of the algorithm?', muistiinpanot:'What does an algorithm actually see when it looks at you?', puoli:'vasen', savy:'kelta', },
    { x: 5490, otsikko:'Our digital footprint tells the story of our choices, hopes and fears, forming a digital soul.', muistiinpanot:'Not a full picture of you - a shadow made of clicks, timestamps, locations. But it is what companies actually use to predict what you will do next.', puoli:'oikea', savy:'puna', kortti:true, datakupla:true, hahmoAnimaatio:'Bark', },
    { x: 5640, otsikko:'I accept the terms', teksti:'', muistiinpanot:'Nobody reads these.', puoli:'keski', savy:'kelta', koko: 6, paperipino: { korkeusProsentti: 0.2,  pinot: [ { maara: 18000, yksikko: 'Microsoft' }, { maara: 31000, yksikko: 'TikTok' } ] }, hahmoAnimaatio:'Rest_Pose', },
//    { x: 5790, otsikko:'Miten algoritmi näkee sinut, tekijänä?', teksti:'aika ja paikka · laitetiedot · kenen profiilissa olemme käyneet · sosiaalinen analyysi · mitä katsomme, LISÄ Se ei näe ihmistä, vaan rivejä dataa: kuvatiedostoja, tyylipiirteitä ja metatietoja.', puoli:'oikea', savy:'puna', },
 //   { x: 5940, otsikko:'Moni hyväksyy datankeruun väistämättömyytenä – "näin tämä nyt vain menee".', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Rest_Pose', },

//SCENE: kaupunki-eder-tower-distance-sumu


    { x: 6090, otsikko:'AI depends on human knowledge and rules.', teksti:'It does not know the right answer - it guesses the most likely one.', muistiinpanot:'Language models are trained on enormous amounts of text. When you give the AI a prompt, it works out which word is statistically most likely to come next, and it builds the answer one token at a time. It spots patterns in the text it was trained on and produces output by imitating those patterns. It has no grasp of what the words actually mean, and no sense of whether they are true. When the model doesnt have the right information, it cant simply say "I dont know." So it guesses. It gives you the answer that sounds most plausible, based purely on probability.', puoli:'vasen', savy:'kelta', ennustus: { syote:'water', tulos:'wet' }, koko: 5, hahmoAnimaatio:'Idle_Alert', },


    { x: 6240, teksti:'"We have built computers that make mistakes, but we have not built machines that understand the consequences of mistakes."', lahde:'Neil Lawrence', koko: 7, lahdeKoko: 4, kortti:true, muistiinpanot:'AI loses context easily. When reality gets simplified, information is lost and errors happen.', puoli:'oikea', savy:'kelta', kortti:true,  hahmoAnimaatio:'Sit', },
 
    { x: 6246, otsikko:'2025: <span style="color:#B0CB40">50%</span><br> 2026: <span style="color:#FF5562">90%</span>', teksti:'', muistiinpanot:'Projection for how much of the internet could be AI-generated content within a couple of years. Ties to the risk that AI ends up training on its own synthetic output - quality degrades with each generation, like a photocopy of a photocopy.', puoli:'keski', savy:'kelta', kortti:true,  },

    { x: 6390, otsikko:'Data is the fuel of AI biases', muistiinpanot:'(biases = "BY-uh-siz") The data used to train AI is never neutral. It carries our society\'s prejudices, historical distortions and prevailing stereotypes. When AI learns from this data, it doesn\'t just repeat these biases, it amplifies them.', puoli:'keski', savy:'valko', koko: 6,   hahmoAnimaatio:'Howl', },
    { x: 6540, otsikko:'AI works exactly as it was programmed. It reflects our society\'s distorted reality.', muistiinpanot:'Not malfunctioning - working exactly as designed. The bias (say: "BY-us") was already in the data before the algorithm ever touched it.', puoli:'oikea', savy:'kelta', },
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
  
{ x: 6843, otsikko:'Ask AI a "dumb" question, get a dumb answer. Talk it through, spell it out.', teksti:'', muistiinpanot:'Practical takeaway: AI mirrors the quality of the question. Vague in, vague out - so push back, ask it to clarify, treat it like a conversation, not a vending machine.', puoli:'oikea', savy:'kelta', kortti:true, },

//{ 
//      x: 6844, 
//      otsikko: 'Tunne tietosi', 
//      teksti: 'Jos tekoäly automatisoi ja ulkoistaa prosessi niin tehokkaasti, ettei ei enää ymmärrä, mistä sen oma data tulee...', 
//      muistiinpanot: 'Tämä on todellinen riski myös teidän alallanne. Kun algoritmi tai ulkopuolinen kumppani tekee kaikki päätökset, organisaation oma ymmärrys surkastuu. Mitä tapahtuu, kun järjestelmä kysyy jotain, eikä kukaan talossa enää tiedä, mitä yritys on alun perin linjannut? Vastuu ja ydinosaaminen (eli se organisaation oma lihas) on säilytettävä itsellä.', 
//      puoli: 'vasen', 
//      savy: 'puna',
 //     koko: 7 
//    },


    { x: 6990, teksti:'In 2024, the Russian-backed Pravda network published over 3.6 million propaganda articles, aiming to poison Western AI models with disinformation.', kortti:true, muistiinpanot:'In 2024, the Russian-backed Pravda network published over 3.6 million propaganda articles, aiming to poison Western AI models with disinformation.', puoli:'keski', savy:'kelta', koko: 6, hahmoAnimaatio:'Sneak', },
    { x: 7140, otsikko:'Understanding the basics of AI and algorithms is now a civic skill', teksti:'The ability to critically judge what AI offers you, and spot its illusions.', muistiinpanot:'Not about coding - about knowing enough to question what you are shown, the same way media literacy means questioning a headline.', puoli:'oikea', savy:'kelta', kortti:true, },
   
//SCENE: kaupunki-eder-tower-distance

    { x: 7290, otsikko:'Digital Oligarchs', muistiinpanot:'', puoli:'keski', savy:'valko', koko: 9, hahmoAnimaatio:'Sneak', },
    { x: 7440, teksti:'"It is ironic that while people are talking about the future threat of artificial intelligence, manipulation is already a reality. This is reflected in the growing division in society."', lahde:'Neil Lawrence', muistiinpanot:'The point: people worry about sci-fi AI threats while today\'s actual manipulation - polarization, engagement-driven feeds - is already happening.', puoli:'oikea', savy:'kelta', koko: 7, lahdeKoko: 4, kortti:true, },
    { x: 7590, otsikko:'KNOWLEDGE = <span style="color:#B0CB40">DATA</span> = POWER', muistiinpanot:'Knowledge has always been power - now knowledge comes from data. Todays digital trading companies control and monetize data, the worlds most valuable commodity. Tech giants optimize for maximum screen time, data collection, and advertising revenue—not for your companys operational well-being or customer satisfaction', puoli:'keski', savy:'puna', kortti:true, koko: 6,  },
 
    { x: 7740, otsikko:'Understanding the economics of AI platforms is a core part of critical AI literacy', muistiinpanot:'', puoli:'oikea', savy:'kelta', kortti:true, },

    { x: 7760, otsikko:'', muistiinpanot:'', puoli:'keski', savy:'puna', kortti:true,  },

    { x: 7890, teksti:[
        { rivi: 'Palantir' }, 
        { rivi: 'Mithril' },
        { rivi: 'Lembas' },
        { rivi: 'Anduril' }, 
        { rivi: 'Valar' },
        { rivi: '<span style="color:#FF5562">Peter Thiel</span>' },

      ],   muistiinpanot:'Peter Thiel names his companies after Tolkien - a small elite controlling vast digital infrastructure. Thiel explicitly argues that "freedom and democracy may not be compatible" and views democratic decision-making as too slow and populist compared to technocratic hierarchy', puoli:'oikea', savy:'vihrea', kortti: true, hahmoAnimaatio:'Bark', },



    
 //SCENE: kaupunki-eder-oil-plant 
    
    { x: 8040, otsikko:'AI and emotions', muistiinpanot:'Because emotional content is what drives engagement on social media.', puoli:'keski', savy:'valko', koko: 9, kortti: true, },
    { x: 8190, otsikko:'Hidden algorithms in the black box', muistiinpanot:'Transition into the emotions/social-media section - recommendation engines optimize for time-on-platform, not for your wellbeing.', puoli:'keski', savy:'kelta', kortti:true, hahmoAnimaatio:'Sneak', },
  
  
  
    { x: 8340, otsikko:'Content that stirs emotion keeps us scrolling and staying on the platform longer.', muistiinpanot:'Anger and outrage keep people on the platform longer than calm content does - the algorithm learns that fast.', puoli:'vasen', savy:'kelta', kortti:true, hahmoAnimaatio:'Rest_Pose', },

    { x: 8350, otsikko:'Doomscrolling', muistiinpanot:'in the night in bed.', puoli:'vasen', savy:'kelta', kortti:true, hahmoAnimaatio:'Idle_Alert', },


    { x: 8490, otsikko:'Machine-made sugar', muistiinpanot:'This resembles processed food: the food industry found that adding corn syrup or salt makes people eat more of it. Same principle, digital version. - Professor Neil Lawrence, University of Cambridge.', puoli:'keski', savy:'kelta', koko: 6, hahmoAnimaatio:'Bark', },

    { x: 8499, otsikko:'Elias, age 14', muistiinpanot:'A fictional case study from the book, built for the research, not a real teenager - a boy\'s TikTok account tracked from a completely blank profile. Within the first hour, a majority of what he was shown was already about "correct" masculinity and how women "really" behave.', puoli:'vasen', savy:'kelta', kortti:true, hahmoAnimaatio:'Sit', },
    { x: 8509, otsikko:'', muistiinpanot:'Continuation of the Elias case - shows how fast the feed narrows into one lane once the algorithm has a hook.', puoli:'vasen', savy:'kelta' },

    { x: 8640, otsikko:'But...', muistiinpanot:'Can feel distant, this - handing our thinking routines over to a machine.', puoli:'keski', savy:'valko', koko: 10, },
    { x: 8790, teksti:'"It\'s easy to think that social media is bad and the world would be better without smartphones. But smartphones are just devices. It would be a surrender to think that all problems would disappear without the internet."', lahde:'Niina Junttila, Professor, loneliness researcher', muistiinpanot:'the device is not the villain, how it is used is.', puoli:'oikea', savy:'kelta', koko: 7, lahdeKoko: 4, kortti:true, hahmoAnimaatio:'Sit', },
    { x: 8940, otsikko:'Algorithms can create safety too', muistiinpanot:'The bubbles algorithms create can act as safe peer-support spaces and help people build identity.', koko: 6, puoli:'keski', savy:'kelta', kupla: true, kortti: true, hahmoAnimaatio:'Jump', },

 //SCENE: kaupunki-eder-towers 

    { x: 9090, otsikko:'The core problem with platforms is not the devices or the data collection itself - it is how they are used.', muistiinpanot:'Algorithms can produce benefit or harm, depending entirely on how they are used.', puoli:'oikea', savy:'kelta', kortti:true, },
    { x: 9240, teksti:'"AI cannot genuinely understand feelings, but it knows how to act as if it does. Sometimes that is enough."', lahde:'17-year-old', muistiinpanot:'A teenager\'s own words - not dismissive, genuinely balanced. AI-as-companion is not pure good or bad, it depends on what it replaces.', puoli:'vasen', savy:'kelta', koko: 7, lahdeKoko: 4, kortti:true, hahmoAnimaatio:'Sit', },
//    { x: 9390, otsikko:'Miten kouluttaa omaa algoritmiaan somessa', teksti:'Katso pitkään positiivista sisältöä · Ohita negatiivinen sisältö · Seuraa tietynlaisia tekijöitä · Toista tarpeeksi', puoli:'oikea', savy:'kelta' },



// TEKOÄLY JA YMPÄRISTÖ

    { x: 9350, otsikko:'The environmental cost of AI', muistiinpanot:'Gilgamesh, the world\'s oldest recorded story. Just as King Gilgamesh felled a sacred forest to build city gates without anticipating the ecological toll, modern AI consumes vast real-world energy and water to expand digital infrastructure. The 4,000-year-old myth serves as a warning that technological expansion always rests on finite planetary limits, demanding human foresight rather than unbridled growth.', puoli:'keski', savy:'valko', koko: 7, kortti:true, },
// Tekoälyn ympäristöhinta, Gilgamesh, maailman vanhin tallennettu tarina


    { x: 9450, teksti:[
        { rivi: 'One ChatGPT prompt = <span style="color:#FF5562"> approx. 5 min. of a 5W LED light</span>' }, 
        { rivi: 'One AI image = <span style="color:#FF5562">approx. 34 min. of a 5W LED light</span>' },
        { rivi: 'One short video (5 s.) = <span style="color:#FF5562">approx. 1h of a microwave oven</span>' },

       
      ],   lahde:'UN University (UNU-INWEH), Environmental Cost of AI\'s Energy Use, 2026 · AIMultiple, AI Energy Consumption Statistics, 2026', lahdeKoko: 2, muistiinpanot:'.', puoli:'vasen', savy:'kelta', koko: 5, kortti: true, },


    { x: 9460, otsikko:'Simply dropping "please" and "thank you" from prompts would cut ChatGPT\'s power use by nearly 100 gigawatt-hours a year.', muistiinpanot:'Playful but real - every extra word in a prompt costs real server energy at that scale. Not telling anyone to stop being polite, just showing the cost is real and adds up.', koko: 2, puoli:'keski', savy:'valko',  kortti: true ,       chattiKuvakeAi: 'kuvat/robot.png', chattiKuvakeSina: 'kuvat/jarno-avatar.png', chattiKoko: 2,
      chatti: [
        { kuka: 'ai', viesti: 'Here is a great summary for you, Jarno!' },
        { kuka: 'sina', viesti: 'Thanks!' },
        { kuka: 'ai', viesti: 'Can I help with anything else?' },
        { kuka: 'sina', viesti: 'That is all' },
        { kuka: 'ai', viesti: 'You\'re welcome!' },
      ]
    },

      // Tekoälyn energiankulutus kasvaa nopeasti Yksi ChatGPT-kehote= n 4 min -> 5w led valo, kuva n. 1h 20min 5w led valo, lyhytvideo = saman verran kuin mikroaaltouunia tunnin.


    { x: 9550, otsikko:'AI can support close to 80 percent of the UN sustainable development targets (134/169)', teksti:'', muistiinpanot:'AI\'s positive side: it can support up to 134 of the 169 sustainable development sub-targets (about 79%). It acts as an accelerator especially on environmental goals - clean water access, sustainable agriculture, and Goal 13 (climate action).', puoli:'vasen', savy:'kelta', kortti:true, agenda2030:true, hahmoAnimaatio:'Jump' },


    // Tekoälyllä on kuitenkin merkittävä rooli ympäristöongelmien ratkaisemisessa. Ja myös verrata sitä miten energian vievää jokin asia on.


 //   { x: 9540, otsikko:'Viisas tekoälyttömyys – Miten säilyttää oma ajattelu', puoli:'keski', savy:'valko' },
 
 
 
 { x: 9690, otsikko:'What is left for humans?', muistiinpanot:'This exact question opened the talk too (x:990) - the callback is deliberate, we are circling back to it now with more grounding.', puoli:'keski', pysty: 'keski', koko: 8, savy:'valko', },
    { x: 9840, otsikko:'The end of the brain, or a new beginning?', muistiinpanot:'If we outsource thinking to a machine, the muscle starts to waste away (cognitive debt). MIT study, three groups: 1) ChatGPT, 2) a regular search engine, 3) no tools at all. Result: the AI group showed markedly more passive brain activity. Communication between brain regions dropped, and memory formation was weaker.', puoli:'vasen', savy:'kelta', hahmoAnimaatio:'Howl', },

//SCENE: kaupunki-eder-distance





    { x: 9990, otsikko:'AI itself is not the threat to literacy - it is that we now spend less and less of our free time reading.', muistiinpanot:'Reframe: the villain is not AI, it is the shrinking amount of free time we choose to spend on deep reading versus short-form scrolling.', puoli:'keski', savy:'valko', kortti:true, },
    { x: 10140, otsikko:'The core of literacy is the ability to structure thoughts and express them', teksti:'Those exact skills are the foundation of using AI well', muistiinpanot:'The people who write clear prompts are the same people who write clearly in general - AI rewards good writing and thinking skills, it does not replace the need for them.', puoli:'oikea', savy:'kelta', koko:7, kortti:true, hahmoAnimaatio:'Sit', },
    { x: 10290, otsikko:'"A reader lives a thousand lives before he dies. The man who never reads lives only one."', lahde:'George R. R. Martin, A Dance with Dragons', muistiinpanot:'Let this one breathe - it is the emotional pivot before the next, harder line about AI summaries.', puoli:'keski', pysty: 'keski', savy:'vihrea', kortti:true, koko: 6, lahdeKoko: 4, hahmoAnimaatio:'Idle_Alert', }, 
    { x: 10399, otsikko:'"He who never reads a full text, and lets AI summarize and shortcut it, lives only a filtered life."', teksti: '', lahde:'', muistiinpanot:'Your own line, riffing on the GRRM quote before it - an AI summary strips out the nuance and the surprise, you only get what the model decided mattered.', puoli:'keski', pysty: 'keski', savy:'kelta', kortti:true, koko: 4, lahdeKoko: 4, hahmoAnimaatio:'Sit', }, 

    { x: 10470, teksti:'"AI removes barriers and brings me to the same level as everyone else."', lahde:'Kaneli, who lives with dyslexia', koko: 8, lahdeKoko: 4, kortti:true, muistiinpanot:'AI-assisted tools can support different kinds of learners and create a safe space to practice expressing yourself and communicating.', puoli:'oikea', savy:'kelta', hahmoAnimaatio:'Idle_Alert', },


    // { x: 10440, otsikko:'Tietoinen suhde teknologiaan', teksti:'tekninen (miten järjestelmät toimivat) · eettinen (kuka hyötyy, kuka kärsii) · emotionaalinen (tunnetaidot)', muistiinpanot:'Tekninen, eettinen, tunnetaidot', puoli:'oikea', savy:'kelta' },
    
  
  //SCENE: kaupunki-eder-towers-yo
  
//    { x: 10590, otsikko:'Jokainen tarvitsee perusymmärrystä', muistiinpanot:'Jokainen on tekoälyasiantuntija', puoli:'vasen', savy:'kelta' },

//    { x: 10591, otsikko:'Chihuahua vai mustikkamuffinssi?', muistiinpanot:'Jokainen on tekoälyasiantuntija', puoli:'vasen', savy:'kelta' },
{ 
      x: 10591, 
      otsikko: 'Chihuahua or blueberry muffin?', 
      teksti: 'AI literacy belongs to everyone. You do not need to code to understand what AI can and cannot do. A curious mind is enough.', 
      muistiinpanot: 'AI often gets talked about so technically that people outsource understanding it to IT. But AI literacy is a new civic skill. See a picture of a chihuahua next to a blueberry muffin and you instantly get AI\'s core limitation, no coding background needed. You do not need to know how the algorithm is coded - just what it can and cannot do. Everyone in this room is already the AI expert of their own field.', 
      puoli: 'vasen', 
      savy: 'kelta',
      koko: 4, hahmoAnimaatio:'Jump'
    },

    { x: 10740, otsikko:'Will AI take our jobs?', muistiinpanot:'or the next question over.', puoli:'keski', savy:'valko', koko: 8, },
    { x: 10890, otsikko:'Work has been the foundation of human identity - what is left when a machine does it?', muistiinpanot:'When asked how they are, people usually answer with what they have been doing at work. What happens when AI takes over the tasks at the very core of that identity?', puoli:'oikea', savy:'kelta', koko: 6, hahmoAnimaatio:'Sit', },

//SCENE: kaupunki-eder-close-yo


{ 
      x: 10990, 
      otsikko: 'Would you hand your tamagotchi over to AI?', 
      teksti: [
        { rivi: 'If AI takes care of your pet or plays for you,' },
        { rivi: 'the whole point of doing it disappears.' },
        { rivi: 'AI is brilliant at what we want to get rid of,' },
        { rivi: 'and bad at what gives life its meaning.' }
      ], 
      muistiinpanot: 'If AI plays for you or feeds your pet, the whole point disappears. Same with work. AI is an excellent tool for the tasks we want to get rid of. But it is bad at the things that give life and work their meaning. AI\'s promise is saving time - but people don\'t want empty free time, we want meaningful work and real connection.', 
      puoli: 'oikea', 
      savy: 'kelta', 
      koko: 5,
      kortti: true,
      tamagotchi: true,
      hahmoAnimaatio: 'Jump'
    },

    //  ], koko: 5, muistiinpanot:'Jos tekoäly pelaa videopelejä puolestasi tai hoitaa lemmikkiäsi, koko tekemisen pointti katoaa. Luovuutta on monessa työssä, ei pelkästään taiteessa. Se on koettuja kokemuksia, yksityiskohtia ja tunteita Tekoäly on erinomainen työkalu niihin tehtäviin, joista haluamme päästä eroon. Mutta se on huono niissä asioissa, jotka antavat elämällemme tarkoituksen Tekoälyn suuri lupaus on ajan säästäminen. Mutta jos se tuo meille vain vapaa-aikaa ilman tarkoitusta tai merkityksellisiä kohtaamisia, se johtaa eksistentiaaliseen tylsyyteen. Ihmiset eivät halua pelkkää tyhjää vapaa-aikaa – me haluamme merkityksellistä tekemistä sen täytteeksi.', puoli:'oikea', savy:'kelta', kortti: true },
    // tamagotchi-animaatio lisätty yllä olevaan pysähdykseen (tamagotchi: true)
   

 //   { x: 11040, otsikko:'Tekoäly ei vie kaikkia ammatteja, mutta muuttaa lähes kaikki työt.', puoli:'keski', savy:'kelta' },
    
    //tähän stanford tutkimus
    { x: 11345, otsikko:'AI replaces what is written down <span style="color:#B0CB40">(formal knowledge)</span>, and struggles with what is only learned by doing <span style="color:#B0CB40">(tacit knowledge)</span>.', teksti: '<span style="color:#B0CB40">"People are not laid off en masse - companies just stop filling the entry-level roles AI can do."</span>', lahde: 'Brynjolfsson et al., 2026, Stanford University, based on ADP payroll data', kortti:true, muistiinpanot:'Stanford study, ADP payroll data. The age/experience gap: workers aged 22-25, early in their careers, take the hit, while for experienced workers AI mostly makes them more productive without replacing them. So companies leave junior openings unfilled, while for senior experts AI becomes an assistant that sharpens their work.', puoli:'oikea', savy:'valko', koko: 3, lahdeKoko: 3, tikapuut: true, hahmoAnimaatio:'Idle_Alert', },
 //   { x: 11046, otsikko:'Tekoäly hoitaa oppikirjatietoon perustuvat nuorten rutiinityöt, mutta se ei kykene korvaamaan kokeneiden työntekijöiden käytännön kokemusta ja tilanneajattelua.', puoli:'vasen', savy:'kelta' },

    
//{ 
//      x: 11415, 
 //     otsikko: 'Kone havaitsee, ihminen ymmärtää', 
 //     teksti: 'Tekoäly huomaa sadasosasekunnissa: "Tämä palkkarivi poikkeaa työntekijän historiasta."<br><br>Mutta tekoäly ei tiedä, onko kyseessä virhe vai ansaittu ylennys.', 
  //    muistiinpanot: 'Tässä tiivistyy teidän supervoimanne ja viisas tekoälyttömyys. Älykäs kone on loistava perkaamaan valtavia datamassoja ja nostamaan esiin poikkeamat. Mutta koneelta puuttuu konteksti. Se ei tiedä organisaation kulttuuria, käytyjä kehityskeskusteluja tai inhimillisiä poikkeustilanteita. Algoritmi antaa teille signaalin, mutta tulkinta ja vastuu jäävät aina teille.', 
//      puoli: 'oikea', 
//      savy: 'kelta',
//      koko: 5, kortti:true,
//      hahmoAnimaatio: 'Idle_Alert'
//    },

  

//    { x: 11416, otsikko:'Tehostamisesta puhutaan paljon tekoälyn kohdalla, mutta ei pitäisi pitää kiirettä ja korvata asioita tekoälyllä tekoälyttömästi. Olennaista on se, miten oikeasti voimme ottaa tekoälyn organisoimaan tekemistämme, jotta meille jää aikaa luovuudelle.', puoli:'vasen', savy:'kelta', kortti:true, },

//{ x: 11417, otsikko:'The electric motor paradox', teksti:'When factories switched from steam to electricity, productivity did not rise at all at first.', kortti:true, muistiinpanot:'Why? Because the new electric motors were just dropped into the old steam engines\' old spots. Only once the whole factory floor plan and workflow were redesigned did output actually rise. Same with AI: swap out one person or one routine for a chatbot and nothing improves. The whole process has to be rethought.', puoli:'keski', savy:'valko', koko: 8, hahmoAnimaatio:'Idle_Alert', },

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




    // TEEMA1: omat esimerkit (Diat 1-6, dokumentin ENSIMMÄINEN osio)
    //      { x: 11355, otsikko:'Omat', koko: 6, puoli:'keski', savy:'valko', kortti:true, },
     // { x: 11360, otsikko:'Teosten valmistus', koko: 6, teksti:'Kirsi-Marja Moberg, Purkutaide-näyttely “Tämän haluan sanoa”',  puoli:'vasen', savy:'valko', kortti:true, },
      //{ x: 11370, otsikko:'Runovideo: Loitsu', teksti:'Mitä tekijyys tarkoittaa, mitä itselle jää<br>(Loitsu / Spell, 2024. Kirsi-Marja Moberg & Jarno Alastalo // Ouro Video Poetry Collective)', koko: 3, puoli:'oikea', savy:'kelta', kortti:true, youtube:'omTKuYbJAq4', },
      //{ x: 11380, otsikko:'Tämä esitys', koko: 6, puoli:'keski', savy:'valko', kortti:true, },


    // Zhou & Lee, PNAS Nexus 2024 ("Generative artificial intelligence, human
    // creativity, and art", DOI 10.1093/pnasnexus/pgae052) - vertaisarvioitu,
    // todennettu 8.9.2026 (paperi + PNAS Nexuksen oma peer-review -asema
    // haettu haulla, ei vain luotettu lähdedokumentin viitteeseen sokeasti).
    // Kaksi diaa: 1) tutkimusasetelma ensin (Jarno: "avaa mistä tutkimuksessa
    // oli kysymys" - EI pelkkää tilastoa otsikkona), 2) sitten löydös.
      //{ x: 11405, otsikko:'Tutkimus: yli 4 miljoonaa teosta, 50 000 taiteilijaa', teksti:'Tutkijat vertasivat samojen tekijöiden töitä ennen ja jälkeen tekoälyn käyttöönoton, yhdellä maailman suurimmista taidealustoista.', muistiinpanot:'Miksi tämä on luotettava: tämä EI ole laboratoriokoe muutamalla koehenkilöllä, vaan oikeaa käyttöä yli 50 000 taiteilijalta vuosien ajalta. Tutkijat vertasivat SAMOJA tekijöitä ennen/jälkeen - muutos ei siis selity sillä että eri ihmiset alkoivat käyttää palvelua, vaan nähdään mitä samalle tekijälle oikeasti tapahtuu. Vertaisarvioitu, julkaistu PNAS Nexuksessa (Yhdysvaltain Kansallisen tiedeakatemian ja Oxfordin yliopiston kustantajan yhteisjulkaisu) - tarkistettu 8.9.2026, oikea tutkimus (Zhou & Lee 2024, DOI 10.1093/pnasnexus/pgae052).', lahde:'Zhou & Lee, PNAS Nexus 2024', koko: 6, puoli:'keski', savy:'valko', kortti:true, },
      //{ x: 11410, otsikko:'Enemmän töitä, enemmän suosiota - vähemmän omaa jälkeä', teksti:'Sama tekijä teki keskimäärin 25 % enemmän ja sai 50 % enemmän suosikkimerkintöjä. Mutta juuri se, mikä teki teoksista hänen näköisiään - siveltimenjälki, väriharmonia, valaistus - alkoi tasaisesti kadota.', muistiinpanot:'ehotteiden suunnittelu (prompt engineering) muuttuu kaavamaiseksi ja käyttäjät tukeutuvat usein samoihin valmiiksi hienosäädettyihin malleihin ja tyyleihin tasaisen laadun varmistamiseksi. Lisäksi paperi varoittaa, että vanhentuneella tiedolla opetetut tekoälyt synnyttävät helposti itseään vahvistavan kehän, jossa luodaan vain geneeristä massasisältöä', lahde:'Zhou & Lee, PNAS Nexus 2024', koko: 6, puoli:'oikea', savy:'kelta', kortti:true, },

    // PÄÄTEEMA: Viisas tekoälyttömyys

        { x: 11420, otsikko:'Wise AI-mindlessness', teksti:[
        { rivi: 'What annoys you, and eats time away from what you actually want to do?' },
        { rivi: 'Sorting out spreadsheets' },
        { rivi: 'Reports' },
        { rivi: 'The boring parts of communication' },
      ], muistiinpanot:'Can be genuinely interactive - ask the room what they would add to this list before revealing it.', koko: 7, puoli:'keski', savy:'valko', kortti:true, },


        { x: 11425, otsikko:'A social-media agent - LinkedIn', koko: 6, puoli:'vasen', savy:'kelta', kortti:true, },
  { x: 11430, otsikko:'A whole book, written with AI - Claude Fable', koko: 6, puoli:'oikea', savy:'kelta', kortti:true, },

     // { x: 11430, otsikko:'Apurahahakemukset', teksti:[
     //     { rivi: 'Tekoäly on hyödyllinen työkalu yhteenvedon muotoilussa, ydinviestien kirkastamisessa ja ns. "hissipuheen" tiivistämisessä.' },
     //     { rivi: 'Rahoittajan kulmasta olennaista on, että idea on sinun' },
     //     { rivi: 'Se sopii erittäin hyvin kielenhuoltoon ja hakemuksen kääntämiseen muille kielille.' },
    //      { rivi: 'Voit hyödyntää sitä apuna esimerkiksi projektin viestintäsuunnitelman tai aikataulun hahmottelussa.' },
  //      ], koko: 6, puoli:'vasen', savy:'kelta', kortti:true, },
 //     { x: 11433, otsikko:'Why do we map out our workflows?', teksti:'Not so a machine can replace you. So it can take over the routines that eat the time you should be spending where you are at your best.', muistiinpanot:'It is completely natural to fear that opening up your own workflow makes you replaceable. The fear is logical: AI replaces formal, documented knowledge well, and tacit, experience-based knowledge badly (see the previous Stanford/ADP slide, x:11345). The role does not disappear, it changes: from doer to reviewer, quality-checker and interpreter (human in the loop) - you check instead of writing, approve and own the outcome instead of reasoning it out yourself. Electric motor paradox (previous slide): just swapping a person out for AI produces no benefit, the benefit comes from redesigning the workflow. A machine never learns context, situational judgment, or genuine attention (Neil Lawrence, later at x:12240).', puoli:'keski', savy:'kelta', koko: 6, kortti:true, hahmoAnimaatio:'Idle_Alert', },
      { x: 11440, otsikko:'The Hamburger Model', teksti:[
          { rivi: '🍞 Human: goal, context, constraints - "what are we trying to achieve?"' },
         { rivi: '🥩 AI: draft, summary, list, brainstorm - "the raw work"' },
         { rivi: '🍞 Human: judgment, emotional intelligence, decision - "is this true? is this wise?"' },
      ], muistiinpanot:'The idea: you never hand the whole thing to AI - a human holds the package together start to finish. NEEDS A HAMBURGER ANIMATION - not built yet, text only.', koko: 6, puoli:'keski', savy:'kelta', kortti:true, },
  //
    // Stable Diffusion + ControlNet & LoRA (7.9.2026, Jarnon oma teksti - käytetty
    // lähes sanasta sanaan). Jarno: "4 stops? Just one" - yhdistetty yhdeksi
    // kortti:true-pysähdykseksi, 4 riviä paljastuu peräkkäin. "Ei ole aivan
    // yksinkertaista" -kohta oli Jarnolla kesken - täydennetty lähdedokumentin
    // omalla, todennetulla faktalla (näytönohjainvaatimus), ei keksitty.
    // koko:6->5 (8.9.2026) - pitkä otsikko (3 riviä) + 4 täyttä lausetta
    // ylitti yhdessä ruudun alareunan koon:6:lla, kun kaikki 4 riviä ovat
    // auenneet samaan aikaan (vrt. x:11430, joka mahtuu juuri ja juuri
    // koko:6:lla lyhyemmällä otsikolla) - ei tekstiä lyhennetty, vain koko.

     //     { x: 11441, otsikko:'Kuvien luominen', muistiinpanot:'teossuoja', puoli:'keski', savy:'valko', kortti:true, },

   //   { x: 11443, otsikko:'Stable Diffusion + ControlNet & LoRA', teksti:[
     //     { rivi: 'Täysi hallinta: sommittelu ja tyyli pysyvät sinun käsissäsi, ei tekoälyn arvauksen varassa.' },
     //     { rivi: 'ControlNet: oma käsin piirretty viivaluonnos tai asento "blueprinttina" - tekoäly renderöi pinnan sen päälle.' },
      //    { rivi: 'LoRA: 15-50 omaa teostasi riittää - malli oppii simuloimaan sinun sivellintekniikkaasi, ei internetin geneeristä kuvamassaa.' },
      //    { rivi: 'Ei ole aivan yksinkertaista: vaatii tehokkaan näytönohjaimen (vähintään 12-24 GB VRAM) ja opettelua.' },
     //   ], koko: 5, puoli:'keski', savy:'kelta', kortti:true, },

    // PÄÄTEEMA: Oman taiteen suojaaminen (Dia 1-4, dokumentin oma järjestys)
     // { x: 11450, otsikko:'Alustakohtainen suojaus', teksti:[
      //    { rivi: 'Tarkista asetuksista NoAI-suojausasetus (esim DeviantArt, ArtStation, Cara)' },
    //      { rivi: 'Esim. Meta (Instagram & Facebook): Tekoälykoulutuksen kieltävä opt-out-lomake' },
    //    ], koko: 6, puoli:'vasen', savy:'kelta', kortti:true, },
   //   { x: 11460, otsikko:'Omien verkkosivujen suojaus', teksti:[
    //      { rivi: 'Robots.txt: pyytää botteja jättämään teokset rauhaan. Se ei kuitenkaan poista jo kerättyä dataa.' },
    //      { rivi: 'TDMRep-protokolla: verkkosivuille asennettava pieni tiedosto (tdmrep.json), joka tekee oikeuksien pidättämisestä EU:ssa juridisesti sitovaa EU:n tekoälyasetuksen (AI Act) nojalla.' },
    //    ], koko: 6, puoli:'oikea', savy:'valko', kortti:true, },
   //   { x: 11470, otsikko:'Tekninen suojaus', teksti:[
    //      { rivi: 'Glaze (Puolustava): Lisää kuvaan näkymätöntä pikselikohinaa, joka estää tekoälyä matkimasta uniikkia tyyliäsi (estää LoRA-hienosäädön).' },
     //     { rivi: 'Nightshade (Hyökkäävä): "Myrkyttää" luvatonta opetusdataa siten, että se sotkee tekoälyn käsitteet (esim. koira alkaa näyttää koneelle kissalta).' },
    //    ], koko: 6, puoli:'vasen', savy:'kelta', kortti:true, },
    //  { x: 11480, otsikko:'Mikä ei toimi', teksti:[
    //      { rivi: 'Matalan resoluution julkaisut: Eivät suojaa tekoälyltä, sillä mallit oppivat tyylit ja sommittelut myös pienistä kuvista.' },
   //       { rivi: 'Kuvatekstien kiellot: Tavalliset tekstit (kuten ”© älä käytä tekoälyyn”) eivät täytä lain vaatimaa koneluettavaa muotoa.' },
     //   ], koko: 6, puoli:'oikea', savy:'puna', kortti:true, },

    // TEEMA SEKALAISET (dokumentin oma järjestys)
    //  { x: 11482, otsikko:'Energiatehokas tekoälyvuorovaikutus (Promptaus)', teksti:'Vältä "promptirulettia": Muotoile heti alussa yksi kattava ja täsmällinen kehote (tavoitteet, tyyli ja tarkat rajaukset).', koko: 6, puoli:'keski', savy:'kelta', kortti:true, },
     // { x: 11484, otsikko:'Lokaalit kielimallit (Offline-tekoäly omalla koneella)', teksti:[
      //    { rivi: 'Esim. Ollama: Pieniä ja tehokkaita tekoälymalleja voi ladata ja ajaa kokonaan paikallisesti omalla tietokoneella.' },
   //       { rivi: 'Mutta paikallinen laskenta käyttää oman laitteesi sähköä.' },
   //       { rivi: 'Tietoturva: Data ei karkaa opetusmateriaaliksi tai ulkopuolisille palvelimille' },
   //     ], koko: 6, puoli:'vasen', savy:'kelta', kortti:true, },
   //   { x: 11486, otsikko:'Pilvikielimallit & oman aineiston hallinta', teksti:[
    //      { rivi: 'NotebookLM ja oman rajatun aineiston käyttö: RAG (Retrieval-Augmented Generation) eli sitoo kielimallin käyttäjän omiin dokumentteihin.' },
    //      { rivi: 'Muista Opt-out-asetukset myös muissa käyttämässäsi tekoälysovelluksissa' },
    //    ], koko: 6, puoli:'oikea', savy:'kelta', kortti:true, },

   //   { x: 11487, otsikko:'NotebookLM', teksti:'', koko: 6, puoli:'keski', savy:'kelta', kortti:true, },

   //   { x: 11488, otsikko:'"95-malli" & Ketjun hallinta', teksti:[
    //      { rivi: 'Pidä ketjut lyhyinä: Pitkissä keskusteluketjuissa malli lukee koko aiemman historian uudelleen jokaisella viestillä, mikä moninkertaistaa sähkönkulutuksen. Aloita tarvittaessa uusi keskustelu.' },
   //       { rivi: '"<span style="color:#B0CB40">Jos et ole 95 % varma asiasta, kysy ja varmista minulta ennen kuin teet mitään.</span>"' },
   //     ], koko: 6, puoli:'keski', savy:'valko', kortti:true, },



//  { 
//      x: 11485, 
//      otsikko: 'Tekoäly HR:n sivuaivoina', 
//      teksti: [
//        { rivi: 'Poikkeamien ja anomalioiden tunnistaminen' }, 
//        { rivi: 'Datan eheyden automaattitarkistus' },
//        { rivi: 'TES-tulkintojen ja sääntöjen sparraus' }
//      ], 
//      muistiinpanot: 'Kone hoitaa datan perkaamisen valonnopeudella. Teille jää tulkinta, kontekstin ymmärtäminen ja päätöksenteko.', 
//      puoli: 'oikea', 
//      savy: 'kelta', 
//      koko: 5,
//      kortti: true
//    },


    { x: 11490, otsikko:'If AI frees up an hour from paperwork, that is one more hour for a human.', teksti:'A machine cannot feel compassion - but it can free a human to feel it.', muistiinpanot:'"You are not here to become good report writers. You are here to become good at meeting people."', puoli:'oikea', savy:'kelta', kortti:true, hahmoAnimaatio:'Sit', },





 //   { x: 11640, otsikko:'Kone kumppanina', teksti:'Tekoäly ja automaatio vievät rutiinit, mutta samalla ne luovat uuden, asiantuntijan roolin. Työmäärä vähenee, mutta samalla saadaan enemmän aikaan.', puoli:'vasen', savy:'kelta' },



  //SCENE:    kaupunki-eder-close
 //   { x: 11790, otsikko:'Tulevaisuus edellyttää digitaalisia taitoja ja kykyä työskennellä koneen kanssa.', puoli:'oikea', savy:'kelta', kortti:true, },
    { x: 11940, otsikko:'A machine does not think', teksti:'...and thinking is where all creativity starts', muistiinpanot:'Creativity is not only about making art - it is also about what you all do every day.', puoli:'vasen', savy:'kelta', koko: 6, kortti:true, hahmoAnimaatio:'Sit', },
    { x: 12090, otsikko:'Through every major historical shift, certain human core functions survive - their form and meaning just change.', muistiinpanot:'You know this well.', puoli:'keski', savy:'kelta', koko: 5, kortti:true, hahmoAnimaatio:'Sit', },


    //SCENE:  kaupunki-eder-distance


    { x: 12240, teksti:'"Human attention will be a scarce resource. The feeling that human attention creates will be as important to young people in the future as it is today."', lahde:'Neil Lawrence, in Musta laatikko (Black Box)', koko: 7, lahdeKoko: 4, muistiinpanot:'You know this well.', puoli:'vasen', savy:'kelta', kortti:true, hahmoAnimaatio:'Sit', },
 //   { x: 12390, otsikko:'', teksti:'Katri Saarikivi', pysty:'ala', puoli:'oikea', savy:'kelta', kortti:true, },
    
    { x: 12540, otsikko:'Human superpower vs. AI?', muistiinpanot:'How do you avoid cognitive debt while using AI?', puoli:'keski', savy:'kelta', kortti:true, },
    { x: 12690, otsikko:'SLOWNESS!', teksti:'', muistiinpanot:'The machine thinks a million times faster. Slowness is human thought pushing back.', puoli:'keski', savy:'kelta', koko: 10, hahmoAnimaatio:'Sit', },
    { x: 12840, vertailu: { otsikot:['Slow human','Fast machine'], rivit:[
        { vasen:'<span style="color:#FBFCE2">Slow, deliberate, reflective</span>', oikea:'<span style="color:#FBFCE2">Fast, automatic, effortless</span>' },
        { vasen:'<span style="color:#E3C1A6">Questions, doubts, understands</span>', oikea:'<span style="color:#E3C1A6">Processes data at light speed</span>' },
        { vasen:'<span style="color:#B0CB40">Makes room for wisdom, not just efficiency</span>', oikea:'<span style="color:#B0CB40">Produces answers, but no understanding</span>' },
    ] }, muistiinpanot:'Kahneman\'s System 1 (fast, automatic) versus System 2 (slow, deliberate) - System 1 handles about 95% of decisions on its own. AI operates like a supercharged System 2, but without the self-doubt that makes real System 2 thinking valuable.', puoli:'keski', savy:'kelta', koko: 6, kortti:true, hahmoAnimaatio:'Sit', },
    { x: 12850, otsikko:'"Timeless design, renewable birch - the products of your superpower"', teksti:'The human core of Secto\'s lamps: craftsmanship and a unique design an algorithm cannot simulate.', muistiinpanot:'Ties back to the Adilo/McLuhan beat earlier - the craft is the visible proof of the same human core everyone in this room brings to their own work.', puoli:'oikea', savy:'kelta', koko: 6, kortti:true, hahmoAnimaatio:'Sit', },


//SCENE:  kukkulat-eder-muniz-hill

    { x: 12990, otsikko:'Our job is not to compete with the machine\'s speed - it is to slow down enough to still be human.', muistiinpanot:'We learn from mistakes. The machine does not.', puoli:'oikea', savy:'kelta', koko:6, hahmoZ: 44, hahmoAnimaatio:'Sit', kortti:true, },
 //   { x: 13140, teksti:'Ihmisäly: empatiaa, tilannetajua, hiljaista tietoa, jaettua kokemusta ja ympäristön ymmärrystä — kykyä istua toisen ihmisen kanssa hiljaa.<br>:)<br>Tekoäly: työkalu, navigaattori joka auttaa löytämään perille, mutta ei korvaa matkan kokemusta.', koko: 4, puoli:'vasen', savy:'valko', kortti:true, hahmoAnimaatio:'Sit', },
 //   { x: 13290, otsikko:'Viisas tekoälyttömyys on kykyä valita – <span style="color:#FBFCE2">milloin tekoäly tukee ihmisyyttä ja milloin se heikentää sitä.</span>', puoli:'keski', savy:'kelta', kortti:true, hahmoAnimaatio:'Sit', },

//SCENE:  metsa-eder-muniz 

  //  { x: 13440, otsikko:'Kirjastotyöntekijät = sosiaalisia insinöörejä', muistiinpanot:'Koska tekoälyn myötä kuka tahansa voi tuottaa massoittain uskottavan kuuloista (mutta mahdollisesti täysin virheellistä tai synteettistä) sisältöä, tarvitsemme entistä enemmän luotettavia portinvartijoita – kuten kirjastoja, kustantamoita ja faktantarkistajia – jotka valikoivat ja kuratoivat luotettavaa tietoa\n.', puoli:'vasen', savy:'kelta' },
  //  { x: 13590, otsikko:'Algoritminen lukutaito on uusi kansalaistaito', teksti:'Lukutaidoton on muiden tulkintojen varassa myös digitaalisessa koodin maailmassa. Tekoälyaikana tarvitsemme entistä enemmän luotettavia portinvartijoita – kirjastoja, kustantamoita ja faktantarkistajia.', muistiinpanot:'Koska tekoälyn myötä kuka tahansa voi tuottaa massoittain uskottavan kuuloista (mutta mahdollisesti täysin virheellistä tai synteettistä) sisältöä, tarvitsemme entistä enemmän luotettavia portinvartijoita – kuten kirjastoja, kustantamoita ja faktantarkistajia – jotka valikoivat ja kuratoivat luotettavaa tietoa\n.', puoli:'oikea', savy:'kelta' },
    { x: 13740, otsikko:'Homo Ludens', lahde:'Johan Huizinga', muistiinpanot:'Huizinga\'s idea: play is not a break from being human, it is central to it - games, art, curiosity for their own sake, not for output. Leads straight into the closing minigame.', puoli:'vasen', savy:'valko', hahmoAnimaatio:'Jump', },
    // linkki isommaksi (8.9.2026, Jarno: "on presentation Kiitos page, can
    // link be there bigger?") - oma rivi + font-size:1.7em erottaa sen
    // nimi/sähköposti-rivistä, jotta yleisö ehtii huomata/kirjoittaa sen
    // muistiin dian näkyessä.
    { x: 13890, otsikko:'Thank you!', teksti:'Jarno Alastalo · jarno@csy.fi', muistiinpanot:'Closing slide - open the floor for questions here.', puoli:'vasen', savy:'valko', hahmoZ: 46, hahmoAnimaatio:'Sit' },
    // FINAALI (6.9.2026, Jarno: "what will be great touch to end
    // presentation... game like screen, Valitse polkusi") - ks. polkupeli-
    // kentän dokumentaatio yllä. Ei otsikko/teksti-kenttiä lainkaan (koko
    // ruutu peittävä oma overlay hoitaa kaiken sisällön, sama käytäntö
    // kuin esim. x:855/x:1365 tyhjillä pysähdyksillä).
    { x: 14040, muistiinpanot:'The finale minigame - let the audience watch/play, this closes the talk visually rather than verbally.', puoli:'keski', savy:'kelta', polkupeli: true },
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
