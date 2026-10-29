// Valittavat opashahmot 2D-esitykselle (Jarnon idea 31.8.2026: "in the
// beginning i could ask audience what character they would like be our
// guide, then there would be fox and couple others" + "maybe i want to
// change character on other scene"). Tallennettu alunperin muistiin
// project_2d_guide_character_idea.md, toteutus aloitettu samana päivänä
// Jarnon pyynnöstä ("start implement and make new chatacters, plan to
// choos character").
//
// Jokainen hahmo on täysin oma pieni "paketti": spritesheetit (260x260/
// kehys, sama konventio kuin kettu), mitattu origin (0.5, y - Pillow'lla
// alimman läpinäkymättömän rivin osuus kehyksen korkeudesta, EI arvattu -
// sama menetelmä kuin ketun origin.y:lle §27 kohdassa 8), oma mittakaava-
// suhde (tähän asti VAIN silmämääräisesti alustava - ei vielä hiottu
// selaimessa niin tarkasti kuin ketun, ks. muistio), ja animaatiokartta
// joka yhdistää esitys-data.js:n hahmoAnimaatio-kentän arvot ('Idle',
// 'Bark', jne) TÄMÄN hahmon omiin ladattuihin klippeihin - jos jotain ei
// löydy (esim. pyy-tavoin ei ole 'Bark'-klippiä), update() palaa aina
// 'idle'-animaatioon oletuksena (ks. esitys-2d.html:n update()).
//
// LÄHDEMALLIT: Presentation/Characters/*.glb (Jarnon itse hankkimat),
// kaapattu test-hahmo-render.html:llä samalla tavalla kuin kettu -
// katseluAkseli:'x' antoi suoraan oikean sivuprofiilin KAIKILLE kolmelle
// (ei tarvinnut arvailla eri akselia per malli, kuten ketun kanssa piti
// aikanaan tehdä). Walk-klippi 8 kehystä, yksi lepo/idle-tyyppinen klippi
// 1 kehys, molemmat SAMALLA laskeGlobaaliBbox([walk,idle])-laatikolla
// jotta idle ei näytä eri kokoiselta kuin walk (sama periaate kuin ketun
// "grounded"-klippiryhmällä, ks. muistio §27 kohta 8).
//
// HUOM pupu (rabbit-exported-model.glb): visuaalinen tyyli EDELLEEN eri
// kuin kettu/dino/hevonen - kaksijalkainen "maskotti"-hahmo, väritön
// harmaa/valkoinen materiaali (sama huomio tehty jo aiemmin, uusi lataus
// 7.9.2026 ei muuttanut tätä) - MUTTA Jarno katsoi sen pelissä ja
// hyväksyi: "rabbit is ok now, it looks good, just wanted to give more
// movements to it". Ei siis enää avoin kysymys - pupu pysyy mukana.
// 7.9.2026: laajennettu 2 klipistä (walk+idle) 9:ään - tämä malli oli
// alunperinkin selvästi rikkain (10 klippiä ladattavissa, enemmän kuin
// kettu/trex/hevonen), joten "anna sille lisää liikkeitä" -pyyntö oli
// helppo täyttää. Sama laskeGlobaaliBbox(kaikki9,24)-periaate kuin
// muillakin - HUOM tässä tuli vastaan uusi bugi: liian aggressiivinen
// zoomKerroin (0.6) leikkasi TOSIASIALLISESTI joka ikisen kehyksen
// (varsinkin Victory-klipin kohotetut kädet ja kaikkien kehysten jalat)
// koska pupun pystysuora ulottuvuus (y=5.02) on paljon suurempi kuin
// vaaka (x/z=3.4/3.6) - neliönmuotoinen kehys pallonmuotoiselle/matalalle
// eläimelle (kettu/trex/hevonen) sietää tiukemman zoomin kuin PITKÄLLE
// kaksijalkaiselle hahmolle. Tarkistettu ohjelmallisesti (Pillow/numpy,
// reunapikselit) ETTÄ oikea zoomKerroin (0.78) ei leikkaa mitään
// yhdestäkään 9 klipistä, ei vain silmämääräisesti.
const HAHMOVAIHTOEHDOT = [
  {
    avain: 'kettu',
    nimi: 'Kettu',
    origin: { x: 0.5, y: 0.696 },
    // Ainoa jolla on oma historiallinen mittakaavakaava (ks. esitys-2d.html:n
    // vanha KETTU_SKAALA_SUHDE-kommentti) - laskettu tähän suoraan luvuksi
    // (1.1 / ((1296/793)*1.45)) * 1.1553 ≈ 0.5361, jotta koko pysyy TÄSMÄLLEEN
    // ennallaan yleistetyn kaavan kanssa. ÄLÄ muuta tätä lukua irrallaan -
    // jos ketun spritet joskus kaapataan uudelleen eri rajauksella, tämä
    // pitää laskea uudestaan (ks. muistio §27 kohta 8).
    mittakaavaSuhde: 0.5361,
    spritet: {
      walk: 'assets/2d/sprites/fox-walk.png?v=3',
      idle: 'assets/2d/sprites/fox-idle.png?v=3',
      sit: 'assets/2d/sprites/fox-sit.png?v=3',
      idle_alert: 'assets/2d/sprites/fox-idle-alert.png?v=3',
      sneak: 'assets/2d/sprites/fox-sneak.png?v=3',
      bark: 'assets/2d/sprites/fox-bark.png?v=3',
      bite: 'assets/2d/sprites/fox-bite.png?v=3',
      fetch: 'assets/2d/sprites/fox-fetch.png?v=3',
      howl: 'assets/2d/sprites/fox-howl.png?v=3',
      jump: 'assets/2d/sprites/fox-jump.png?v=3',
      run: 'assets/2d/sprites/fox-run.png?v=3',
    },
    animaatioKartta: {
      Idle: 'idle', Idle_Alert: 'idle_alert', Sit: 'sit', Sneak: 'sneak',
      Bark: 'bark', Bite: 'bite', Fetch: 'fetch', Howl: 'howl', Jump: 'jump', Run: 'run'
    }
  },
  {
    avain: 'trex',
    nimi: 'T-Rex',
    // UUDELLEENKAAPATTU 7.9.2026 (Jarno: "make sure that they are not that
    // small and grabby look as they are now, no smooth!... make sure they
    // are not gutted off when doing some movements") uudesta mallista
    // (assets/hahmot/trex-exported-model.glb, enemmän klippejä kuin
    // vanhassa). Sama test-hahmo-render.html-putki kuin ketulla, MUTTA
    // aiempi versio kaappasi hahmon aivan liian PIENENÄ kehyksen sisällä
    // (mitattu: vanha trex-idle.png täytti vain 47.7% 260px-kehyksen
    // korkeudesta) - kiristetty tällä kertaa OMALLA laskeGlobaaliBbox([
    // Idle,Rest_Pose,Roar,Tail_Attack,Walk], 24) + zoomKerroin:0.62 (EI
    // Walk_RM mukana - se on Walkin ROOT MOTION -versio, todennettu
    // mittaamalla klipin oman bbox-koon leviäminen ajan yli: Walk_RM:n z-
    // koko 4.75 vs Walkin 3.54, siis oikeasti kääntyy paikaltaan, meidän
    // moottori liikuttaa hahmoa itse joten haluttiin paikallaan pysyvä
    // versio). KAIKKI tarvitut klipit (myös Tail_Attack, jonka hännän-
    // heilautus on selvästi leveämpi kuin muut) samassa jaetussa
    // laatikossa - EI tarvinnut erillistä kaappaaSeuraten()-seurantaa
    // kuten ketun Jumpilla, koska mikään näistä klipeistä ei sisällä
    // pystysuoraa root-motionia (vain Tail_Attackin sivuttainen hännän-
    // heilautus, joka mahtuu jaettuun laatikkoon). Tarkistettu ohjelmal-
    // lisesti (Pillow/numpy, jokaisen kehyksen reunarivi/-sarake) että
    // MIKÄÄN kehys ei leikkaudu millään näistä 5 klipistä 0.62-zoomilla.
    // origin.y mitattu trex-walk.png:n KAIKKIEN 8 kehyksen yli (alin
    // läpinäkymätön rivi mistä tahansa kehyksestä / kehyksen korkeus) -
    // sama menetelmä kuin ketulla, EI arvattu.
    origin: { x: 0.5, y: 0.8077 },
    // Kiristetyn rajauksen jälkeen hahmo vie ISOMMAN osan samasta 260px-
    // kehyksestä kuin ennen - mittakaavaSuhde säädetty SAMAAN aikaan
    // alaspäin karkealla arviolla, VARMISTA lopullinen koko livenä
    // selaimessa (ks. muistio) ja säädä Jarnon suoran palautteen mukaan,
    // sama käytäntö kuin ketun mittakaavaSuhteen viimeistelyssä.
    mittakaavaSuhde: 0.85,
    spritet: {
      walk: 'assets/2d/sprites/trex-walk.png',
      idle: 'assets/2d/sprites/trex-idle.png',
      roar: 'assets/2d/sprites/trex-roar.png',
      tail_attack: 'assets/2d/sprites/trex-tail-attack.png',
      rest: 'assets/2d/sprites/trex-rest.png',
    },
    // UNIVERSAALI kartta (7.9.2026, Jarno: "make sure that hahmoAnimaatio:
    // are universal, that I do not need change them with character. If
    // something does not fit, like sit, it can be with dino rest pose.")
    // - KAIKKI esitys-data.js:ssä käytössä olevat hahmoAnimaatio-arvot
    // (Bark/Idle_Alert/Jump/Rest_Pose/Sit/Sneak, plus ketun loput
    // Bite/Fetch/Howl/Run täydellisyyden vuoksi) kartoitettu LÄHIMPÄÄN
    // oikeasti kaapattuun klippiin - EI jätetty mitään oletus-idleen
    // paitsi silloin kun idle on jo se paras vastine. T-Rexillä ei ole
    // istumista -> Jarnon oma esimerkki, Rest_Pose. Ei erillistä hymähdys-
    // tai haukku-klippiä -> Roar toimii kaikelle äänekkäälle. Ei erillistä
    // hyppyä -> Tail_Attackin dynaaminen kyykistys+heilautus on lähin
    // energinen vastine.
    animaatioKartta: {
      Idle: 'idle', Idle_Alert: 'roar', Sit: 'rest', Sneak: 'walk',
      Bark: 'roar', Bite: 'tail_attack', Fetch: 'walk', Howl: 'roar',
      Jump: 'tail_attack', Run: 'walk', Rest_Pose: 'rest',
    }
  },
  {
    avain: 'hevonen',
    nimi: 'Hevonen',
    // UUDELLEENKAAPATTU 7.9.2026, sama peruste/putki kuin T-Rexillä yllä
    // (assets/hahmot/horse-exported-model.glb, laskeGlobaaliBbox([Eating,
    // Rear,Rest_Pose,Run,Sleep,Walk], 24) + zoomKerroin:0.65 - EI root-
    // motion-klippejä tässä mallissa lainkaan, tarkistettu mittaamalla
    // jokaisen klipin oma bbox-koko ajan yli, ei poikkeavia arvoja kuten
    // T-Rexin Walk_RM:llä oli). Tarkistettu ohjelmallisesti, ei yhtään
    // reunaan leikkautuvaa kehystä (myös dramaattisin klippi, Rear, jossa
    // hevonen nousee pystyyn etujaloilleen).
    origin: { x: 0.5, y: 0.9154 },
    mittakaavaSuhde: 0.78,
    spritet: {
      walk: 'assets/2d/sprites/horse-walk.png',
      idle: 'assets/2d/sprites/horse-idle.png', // "Eating" - hevosella ei ole erillistä Idle-klippiä
      rear: 'assets/2d/sprites/horse-rear.png',
      rest: 'assets/2d/sprites/horse-rest.png',
      sleep: 'assets/2d/sprites/horse-sleep.png',
      run: 'assets/2d/sprites/horse-run.png',
    },
    // Universaali kartta, sama periaate kuin T-Rexillä. Ei istumista ->
    // Sleep (makaava asento) on lähin vastine, ei Rest_Pose (joka on vain
    // lyhyt neutraali seisoma-asento tälle mallille, mitattu 0.17s -
    // liian lyhyt/vähäeleinen erottuakseen Idlestä). Rear (pystyyn
    // nouseminen) kattaa kaiken dramaattisen/äänekkään/hyppäävän, koska
    // mallissa ei ole erillisiä klippejä niille.
    animaatioKartta: {
      Idle: 'idle', Idle_Alert: 'rear', Sit: 'sleep', Sneak: 'walk',
      Bark: 'rear', Bite: 'idle', Fetch: 'run', Howl: 'rear',
      Jump: 'rear', Run: 'run', Rest_Pose: 'rest',
    }
  },
  {
    avain: 'pupu',
    nimi: 'Pupu',
    // origin.y mitattu rabbit-walk.png:n KAIKKIEN 8 kehyksen yli, sama
    // menetelmä kuin muilla hahmoilla - EI enää se vanha 0.85-arvaus.
    origin: { x: 0.5, y: 0.90 },
    // Pienempi kuin kettu (pupu on pieni eläin). Uuden kaappauksen
    // täyttöaste (71.5% kehyksestä) oli jo lähellä vanhaa (68.8%), joten
    // mittakaavaSuhde säilytetty lähes ennallaan (0.85->0.82) - sama
    // suhteellinen näyttökoko kuin ennen, ei tarvinnut yhtä isoa
    // korjausta kuin trex/hevonen (jotka olivat aiemmin PALJON löysemmin
    // rajattuja).
    mittakaavaSuhde: 0.82,
    spritet: {
      walk: 'assets/2d/sprites/rabbit-walk.png',
      idle: 'assets/2d/sprites/rabbit-idle.png',
      confused: 'assets/2d/sprites/rabbit-confused.png',
      walk_stealth: 'assets/2d/sprites/rabbit-walk-stealth.png',
      greeting: 'assets/2d/sprites/rabbit-greeting.png',
      jog: 'assets/2d/sprites/rabbit-jog.png',
      victory: 'assets/2d/sprites/rabbit-victory.png',
      jump: 'assets/2d/sprites/rabbit-jump.png',
      run: 'assets/2d/sprites/rabbit-run.png',
    },
    // Universaali kartta, sama periaate kuin T-Rexillä/Hevosella. Ei
    // istumista/purua tälle mallille -> idle kelpaa molemmille (ei
    // parempaa vastinetta 10 klipin joukossa). Sneak -> Walk_Stealth on
    // TÄYDELLINEN suora osuma (klipin oma nimi kirjaimellisesti
    // "hiiviskely"). Jump -> Jump_2 (kirjaimellinen). Run -> Run_Female
    // (kirjaimellinen).
    animaatioKartta: {
      Idle: 'idle', Idle_Alert: 'confused', Sit: 'idle', Sneak: 'walk_stealth',
      Bark: 'greeting', Bite: 'confused', Fetch: 'jog', Howl: 'victory',
      Jump: 'jump', Run: 'run', Rest_Pose: 'idle',
    }
  },
];
