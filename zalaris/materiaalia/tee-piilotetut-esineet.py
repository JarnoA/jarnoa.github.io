#!/usr/bin/env python3
# ============================================================================
# tee-piilotetut-esineet.py  (8.9.2026)
#
# Generoi kymmenen PIENTÄ PIKSELITAIDE-esinettä Zalariksen asiakasyritysten
# "piilotetuiksi esineiksi" (ks. PLAN-piilotetut-esineet.md). Nämä EIVÄT ole
# UI-ikoneita vaan maisemaan kuuluvia rekvisiittaesineitä: piirretään
# NATIIVISTI pienessä resoluutiossa (natiivikorkeus 14-46 px), kovilla
# pikselireunoilla, rajoitetulla paletilla joka on POIMITTU KUNKIN OMAN
# KOHTAUKSEN taustakuvista (ks. materiaalia/paletit.txt).
#
# MIKSI natiivi pikselikoko on pieni: esitys-2d.html ajaa Phaseria
# pixelArt:true -asetuksella (NEAREST-suodatus), joten korkeusProsentti
# suurentaa nämä ruudulla 3-6-kertaisiksi ILMAN pehmennystä - pikselit
# jäävät näkyviin, mikä on koko pointti. Jos nämä piirrettäisiin isoina ja
# skaalattaisiin alas, tulos olisi puuroa (ks. suunnitelman asset-vaatimus).
#
# Aja:  python3 materiaalia/tee-piilotetut-esineet.py
# Tulos: kuvat/piilotetut/*.png  + materiaalia/piilotetut-kontaktiarkki.png
# ============================================================================
import os
from PIL import Image, ImageDraw

JUURI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ULOS = os.path.join(JUURI, 'kuvat', 'piilotetut')
os.makedirs(ULOS, exist_ok=True)


def hex2rgba(h):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


def piirra(rivit, paletti, nimi):
    """ASCII-ruudukko -> PNG. '.' = läpinäkyvä. Jokaisen rivin on oltava
    yhtä pitkä - tarkistetaan, koska väärä rivinpituus siirtäisi koko
    kuvan loppuosan vinoon ilman että sitä huomaisi."""
    leveys = len(rivit[0])
    for i, r in enumerate(rivit):
        assert len(r) == leveys, f'{nimi}: rivi {i} on {len(r)} merkkiä, pitäisi olla {leveys}'
    im = Image.new('RGBA', (leveys, len(rivit)), (0, 0, 0, 0))
    px = im.load()
    for y, r in enumerate(rivit):
        for x, c in enumerate(r):
            if c != '.':
                px[x, y] = hex2rgba(paletti[c])
    return im


def tallenna(im, tiedosto):
    polku = os.path.join(ULOS, tiedosto)
    im.save(polku)
    print(f'  {tiedosto:32s} {im.width:4d}x{im.height:<4d}')
    return im


tehdyt = []

# ---------------------------------------------------------------------------
# 1. FINNAIR - matkustajakoneen siluetti (x:540, metsa-eder-muniz, taivas)
#    Sivuprofiili, nokka OIKEALLE (kamera kulkee vasemmalta oikealle, kone
#    "menee edellä"). Paletti: metsäkohtauksen tumma sinivihreä taivas ->
#    kone on vaalea mutta EI valkoinen, jotta se ei revi katsetta.
# ---------------------------------------------------------------------------
finnair_pal = {'o': '#2b3340', 'b': '#7e8b9e', 'l': '#b9c4d2', 'w': '#c9b184'}
finnair = [
    "......ooo.........................",
    ".....obbo.........................",
    "....obbbo.........................",
    "...obbbbo.........................",
    "..obbbbbo.........................",
    "..obbbbbbo........................",
    ".ollbbbbbbbbbbbbbbbbbbbbbbbbbllo..",
    ".obbwbbwbbwbbwbbwbbwbbbbbbbbbbbo..",
    ".oobbbbbbbbbbbbbbbbbbbbbbbbbboo...",
    "..........oobbbbbbbboo............",
    "........oobbbbbbbboo..............",
    "......oobbbbbboo..................",
    ".....oobbbboo.....................",
    "......oooooo......................",
]
tehdyt.append(('finnair-lentokone.png', tallenna(piirra(finnair, finnair_pal, 'finnair'), 'finnair-lentokone.png')))

# ---------------------------------------------------------------------------
# 2. SIEMENS - sykemonitori, jossa PULSSOIVA EKG-viiva (x:2940, metsä)
#    SPRITESHEET: 8 kehystä 26x22, EKG-piikki juoksee vasemmalta oikealle.
#    Siemens Healthineers, ei teollisuus (Jarno: "gear is boring, maybe
#    healthcare some monitor, heart").
# ---------------------------------------------------------------------------
siemens_pal = {'o': '#1d241f', 'c': '#4a5348', 'l': '#6e7a68',
               's': '#10251c', 't': '#7fe0a8', 'd': '#3f8f66'}
# EKG-käyrän muoto: (dx, y-taso ruudun sisällä). Perustaso y=13.
# Piikki: pieni kuoppa, iso piikki ylös, kuoppa alas, takaisin tasoon.
EKG = [13, 13, 13, 12, 13, 13, 14, 9, 6, 11, 15, 13, 13, 13, 13, 13]
KEHYKSIA = 8
KEHYS_L, KEHYS_K = 26, 22
sheet = Image.new('RGBA', (KEHYS_L * KEHYKSIA, KEHYS_K), (0, 0, 0, 0))
for f in range(KEHYKSIA):
    runko = [
        "..oooooooooooooooooooooo..",
        "..occcccccccccccccccccco..",
        "..ocoooooooooooooooooolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocossssssssssssssssolo..",
        "..ocoooooooooooooooooolo..",
        "..oclllllllllllllllllllo..",
        "..oooooooooooooooooooooo..",
        "............oo............",
        "..........oooooo..........",
        "........oooooooooo........",
    ]
    im = piirra(runko, siemens_pal, 'siemens')
    px = im.load()
    # EKG-viiva ruudun sisään (ruutualue x 4..19, y 3..15). Piirretään
    # jälkihäntä himmeämmällä sävyllä ('d') ja kärki kirkkaalla ('t') -
    # sama "juokseva piste jättää jäljen" -idea kuin oikeassa monitorissa.
    sisa_x0, sisa_x1 = 4, 19
    leveys = sisa_x1 - sisa_x0 + 1
    karki = f * leveys // KEHYKSIA
    for i in range(leveys):
        # i:n etäisyys kärjestä taaksepäin (kiertäen)
        etaisyys = (karki - i) % leveys
        if etaisyys > 9:
            continue  # tämän kohdan jälki on jo haihtunut
        y = EKG[(i + f) % len(EKG)]
        if not (3 <= y <= 15):
            continue
        vari = hex2rgba(siemens_pal['t'] if etaisyys <= 1 else siemens_pal['d'])
        px[sisa_x0 + i, y] = vari
        # yhdistä pystysuoraan edelliseen pisteeseen, ettei käyrä katkeile
        if i > 0:
            ed = EKG[(i - 1 + f) % len(EKG)]
            if 3 <= ed <= 15:
                for yy in range(min(y, ed), max(y, ed) + 1):
                    if px[sisa_x0 + i, yy][3] == 0 or yy != y:
                        px[sisa_x0 + i, yy] = vari
    sheet.paste(im, (f * KEHYS_L, 0))
tehdyt.append(('siemens-monitori.png', tallenna(sheet, 'siemens-monitori.png')))

# ---------------------------------------------------------------------------
# 3. STORA ENSO - pahvilaatikko (x:8940, kaupunki-eder-oil-plant)
#    Huom: tällä pysähdyksellä on keskitetty kupla-efekti -> esine sijoitetaan
#    matalalle ja sivuun (ks. HAHMOKERROKSET-merkintä).
# ---------------------------------------------------------------------------
laatikko_pal = {'o': '#33251a', 'b': '#7d6549', 'l': '#94795a', 'd': '#5f4d38', 't': '#a08a68'}
laatikko = [
    "....oooooooooooooooo..",
    "...ollllllllllllllldo.",
    "..ollllllllllllllllddo",
    ".oooooooootooooooooddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".obbbbbbbbtbbbbbbbbddo",
    ".oddddddddddddddddddo.",
    "..oooooooooooooooooo..",
]
tehdyt.append(('storaenso-laatikko.png', tallenna(piirra(laatikko, laatikko_pal, 'storaenso'), 'storaenso-laatikko.png')))

# ---------------------------------------------------------------------------
# 4. DNA - puhelin (x:10470, kaupunki-eder-distance)
# ---------------------------------------------------------------------------
puhelin_pal = {'o': '#171d20', 'b': '#2f3a3f', 's': '#6f8f8a', 'l': '#4a585e', 'h': '#9fbdb6'}
puhelin = [
    "..oooooooooo..",
    "..obbbbbbbbo..",
    "..obboooobbo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obosshsobo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obossssobo..",
    "..obboooobbo..",
    "..obbbllbbbo..",
    "..obbbbbbbbo..",
    "..oooooooooo..",
]
tehdyt.append(('dna-puhelin.png', tallenna(piirra(puhelin, puhelin_pal, 'dna'), 'dna-puhelin.png')))

# ---------------------------------------------------------------------------
# 5. UPM - tukkipino (x:11415, kaupunki-eder-cars)
#    TOINEN versio. Ensimmäinen oli arkkipino ("paperipino"), ja se
#    epäonnistui: Jarno testasi ja kysyi suoraan "What is UPM paper ream?
#    What it represents?" - eli esine ei kertonut mitään. Pino arkkeja
#    lukee toimiston tulostinpaperina, ei UPM:nä, ja oli lisäksi liian
#    lähellä Metsä Groupin paperirullaa kahden pysähdyksen päässä.
#    Tukkipino (Jarnon valinta) on metsäteollisuutta, jolla on selvä
#    siluetti pienessäkin koossa. Erottuu Metsän rullasta sekä muodolla
#    (pyöreitä päitä pinossa vs. yksi pysty sylinteri) että värillä
#    (raaka ruskea puu vs. vaalea pehmopaperi).
#    Kootaan yhdestä tukinpää-ruudukosta, joka liitetään pinoksi 3-2-1 -
#    näin kaikki pään yksityiskohdat pysyvät varmasti identtisinä.
# ---------------------------------------------------------------------------
tukki_pal = {'o': '#33261a', 'k': '#6b5236', 'c': '#a88c5f', 'r': '#8a6f47'}
tukinpaa = [
    ".ooooo.",
    "okcccko",
    "okcrcko",
    "okcrcko",
    "okcccko",
    ".ooooo.",
]
paa = piirra(tukinpaa, tukki_pal, 'upm-tukinpaa')
pino = Image.new('RGBA', (21, 18), (0, 0, 0, 0))
for y, xs in ((12, (0, 7, 14)), (6, (3, 10)), (0, (7,))):
    for x in xs:
        pino.paste(paa, (x, y), paa)
tehdyt.append(('upm-tukkipino.png', tallenna(pino, 'upm-tukkipino.png')))

# ---------------------------------------------------------------------------
# 6. ERICSSON - linkkimasto (x:11485, kaupunki-eder-cars)
#    KOLMAS versio. Kaksi ensimmäistä yritystä piirsivät ristikon
#    proseduraalisesti (jalat + vinositeet laskukaavasta) ja MOLEMMAT
#    epäonnistuivat samalla tavalla: pienessä koossa vinositeet ja
#    antennipuomit sekoittuivat toisiinsa ja lopputulos luki "kuolleena
#    kuusena", ei mastona (todettu kontaktiarkista 8.9.2026). Syy ei ollut
#    kaavan bugi vaan se, että avoin ristikko EI YKSINKERTAISESTI lue tässä
#    mittakaavassa - jokainen side on 1 px ja ne sulautuvat toisiinsa.
#    Ratkaisu: piirretään KÄSIN levenevänä siluettina (Eiffel-profiili),
#    jossa muoto - leveä splitattu jalusta, tasainen kavennus, kolme
#    vaakatasoa, ohut huippumasto - kantaa tunnistuksen, ei yksityiskohta.
# ---------------------------------------------------------------------------
masto_pal = {'o': '#262c2a', 'm': '#59635f', 'l': '#7c8781'}
masto_rivit = [
    "..........m..........",
    "..........m..........",
    "..........m..........",
    ".........omo.........",
    ".........omo.........",
    ".........omo.........",
    ".........omo.........",
    ".........omo.........",
    ".........omo.........",
    "........o.m.o........",
    "........o.m.o........",
    "........o.m.o........",
    ".....ooooomooooo.....",
    "........o.m.o........",
    ".......o..m..o.......",
    ".......o..m..o.......",
    ".......o.m.m.o.......",
    ".......om...mo.......",
    "......o..m.m..o......",
    "......o.m...m.o......",
    "....ooooooooooooo....",
    "......o.m...m.o......",
    "......om.....mo......",
    ".....o..m...m..o.....",
    ".....o.m.....m.o.....",
    ".....om.......mo.....",
    "....o..m.....m..o....",
    "....o.m.......m.o....",
    "...ooooooooooooooo...",
    "....o.m.......m.o....",
    "....om.........mo....",
    "...o..m.......m..o...",
    "...o.m.........m.o...",
    "...om...........mo...",
    "..o..m.........m..o..",
    "..o.m...........m.o..",
    "..om.............mo..",
    ".o..m...........m..o.",
    ".o.m.............m.o.",
    ".om...............mo.",
    "o..m.............m..o",
    "o.m...............m.o",
    "om.................mo",
    "ooooooooooooooooooooo",
]
masto = piirra(masto_rivit, masto_pal, 'ericsson')
tehdyt.append(('ericsson-masto.png', tallenna(masto, 'ericsson-masto.png')))

# ---------------------------------------------------------------------------
# 7. METSÄ GROUP - pehmopaperirulla (x:11490, kaupunki-eder-cars)
# ---------------------------------------------------------------------------
# Pystyssä seisova rulla SIVUSTA (ei päädystä) - päätyprojektio luki
# aiemmassa versiossa "ikkunanpielenä", ks. kontaktiarkki 8.9.2026.
rulla_pal = {'o': '#4f4b41', 'p': '#d8d2c4', 's': '#b0a99a', 'k': '#6b6152', 'l': '#efeade'}
rulla = [
    "...oooooooo...",
    "..ollllllllo..",
    ".ollokkkkollo.",
    ".olokkkkkkolo.",
    ".ollokkkkollo.",
    ".ollllllllllo.",
    ".opppppppppso.",
    ".opppppppppso.",
    ".opppppppppso.",
    ".opppppppppso.",
    ".opppppppppso.",
    ".opppppppppso.",
    ".opppppppppso.",
    ".opppppppppso.",
    ".opppppppppso.",
    ".osssssssssso.",
    "..osssssssso..",
    "...oooooooo...",
]
tehdyt.append(('metsa-paperirulla.png', tallenna(piirra(rulla, rulla_pal, 'metsa'), 'metsa-paperirulla.png')))

# ---------------------------------------------------------------------------
# 8. GIGANTTI - televisio (x:12990, kukkulat-eder-muniz-hill)
# ---------------------------------------------------------------------------
tv_pal = {'o': '#191d18', 'c': '#3a3f36', 's': '#7d9a86', 'l': '#565c4e', 'h': '#a9c3ad', 'j': '#2a2f26'}
tv = [
    "..........................",
    ".oooooooooooooooooooooooo.",
    ".occcccccccccccccccccccco.",
    ".ocoooooooooooooooooooolo.",
    ".ocosssssssssssssssssholo.",
    ".ocossssssssssssssssshhlo.",
    ".ocosssssssssssssssssholo.",
    ".ocossssssssssssssssssolo.",
    ".ocossssssssssssssssssolo.",
    ".ocossssssssssssssssssolo.",
    ".ocossssssssssssssssssolo.",
    ".ocossssssssssssssssssolo.",
    ".ocossssssssssssssssssolo.",
    ".ocoooooooooooooooooooolo.",
    ".ocjjjjjjjjjjjjjjjjjjjjlo.",
    ".oooooooooooooooooooooooo.",
    ".....oo............oo.....",
    "....oooo..........oooo....",
    "...oooooo........oooooo...",
    "..........................",
]
tehdyt.append(('gigantti-tv.png', tallenna(piirra(tv, tv_pal, 'gigantti'), 'gigantti-tv.png')))

# ---------------------------------------------------------------------------
# 9. SANTANDER - pankkikortti (x:13290, kukkulat-eder-muniz-hill)
#    Vaimennettu tiilenpunainen - tunnistettava sävy, mutta EI kirkas
#    "brändipunainen" joka rikkoisi kohtauksen paletin.
# ---------------------------------------------------------------------------
kortti_pal = {'o': '#3a1a16', 'k': '#9c4038', 'v': '#6d2b25', 's': '#c9a45c',
              'l': '#b85e50', 'r': '#e3ded2'}
kortti = [
    "......................",
    ".oooooooooooooooooooo.",
    ".ollllllllllllllllllo.",
    ".okkkkkkkkkkkkkkkkkko.",
    ".okossokkkkkkkkkkkkko.",
    ".okoss okkkkkkkkkkkko.",
    ".okossokkkkkkkkkkkkko.",
    ".okkkkkkkkkkkkkkkkkko.",
    ".ovvvvvvvvvvvvvvvvvvo.",
    ".okkkkkkkkkkkkkkkkkko.",
    ".okrrrkkrrrkkrrrkkkkko",
    ".okkkkkkkkkkkkkkkkkko.",
    ".ovvvvvvvvvvvvvvvvvvo.",
    ".oooooooooooooooooooo.",
    "......................",
]
kortti = [r.replace(' ', 's') for r in kortti]
# rivi 10 oli yhden liian pitkä -> korjataan tarkistus tekee tästä näkyvän
kortti[10] = ".okrrrkkrrrkkrrrkkkko."
tehdyt.append(('santander-kortti.png', tallenna(piirra(kortti, kortti_pal, 'santander'), 'santander-kortti.png')))

# ---------------------------------------------------------------------------
# 10. DANSKE BANK - pankkirakennus (x:12390, kukkulat-eder-muniz-hill)
#     Klassinen pankkijulkisivu: pylväikkö + päätykolmio. Luetaan
#     kukkulamaiseman siluettina, ei ikonina.
# ---------------------------------------------------------------------------
pankki_pal = {'o': '#2b2f28', 'k': '#7a7f74', 'l': '#99a091', 'i': '#3c4239',
              'v': '#646a5e', 'p': '#8b9282'}
pankki = [
    "..................o.....................",
    "................oolloo..................",
    "..............ooollllooo................",
    "............ooolllllllooo...............",
    "..........ooolllllllllllooo.............",
    "........ooolllllllkkklllllooo...........",
    "......ooollllllkkkkkkkkkllllooo.........",
    "....ooolllllkkkkkkkkkkkkkkklllooo.......",
    "..ooolllllkkkkkkkkkkkkkkkkkkklllooo.....",
    "..ollllkkkkkkkkkkkkkkkkkkkkkkkkkllo.....",
    "..ooooooooooooooooooooooooooooooooo.....",
    "..olllllllllllllllllllllllllllllllo.....",
    "..ooooooooooooooooooooooooooooooooo.....",
    "..okvkovkokvkovkokvkovkokvkovkokvko.....",
    "..okvkovkokvkovkokvkovkokvkovkokvko.....",
    "..okvkovkokvkovkokvkovkokvkovkokvko.....",
    "..okvkovkokvkovkokvkovkokvkovkokvko.....",
    "..okvkovkokvkovkokvkovkokvkovkokvko.....",
    "..okvkovkokvkovkokvkovkokvkovkokvko.....",
    "..okvkovkokvkoiiiiokvkovkokvkovkoko.....",
    "..okvkovkokvkoiiiiokvkovkokvkovkoko.....",
    "..okvkovkokvkoiiiiokvkovkokvkovkoko.....",
    "..okvkovkokvkoiiiiokvkovkokvkovkoko.....",
    "..ooooooooooooiiiiooooooooooooooooo.....",
    ".olllllllllllliiiillllllllllllllllo.....",
    ".okkkkkkkkkkkkiiiikkkkkkkkkkkkkkkko.....",
    "ollllllllllllllllllllllllllllllllllo....",
    "okkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkko....",
    "ooooooooooooooooooooooooooooooooooooo...",
    "........................................",
]
tehdyt.append(('danske-pankki.png', tallenna(piirra(pankki, pankki_pal, 'danske'), 'danske-pankki.png')))

# ---------------------------------------------------------------------------
# NÄYTEIKKUNA (x:13800, 8.9.2026, Jarno: "add all of those to as showcase...
# I will tell the audience that 'did you notice these easter eggs'").
# Kaikki kymmenen esinettä YHDESSÄ kuvassa paljastusdiaa varten. Dia on
# tyhjä (ei otsikkoa eikä tekstiä, ks. esitys-data.js x:13800), joten koko
# ruutu on vapaana ja kuva keskitetään.
#
# MIKSI yksi koostekuva eikä kymmenen erillistä HAHMOKERROKSET-alkiota:
# rivivälit, keskitys ja keskinäinen koko pysyvät varmasti kohdallaan
# kaikilla ruutukooilla, kun asettelu on leivottu kuvaan - kymmenen
# erikseen sijoitettua alkiota pitäisi virittää käsin kohdilleen ja ne
# eläisivät toistensa suhteen eri ruuduilla.
#
# MIKSI ruutuun sidottu (kiintea:true) vaikka piilotetut esineet ovat
# nimenomaan maailmaan ankkuroituja: tarkoitus on tässä PÄINVASTAINEN.
# Piiloversiot kuuluvat maisemaan, tämä on tietoinen "tässä ne olivat"
# -esittely, jonka kuuluukin olla selkeästi esillä ruudun keskellä.
#
# MIKSI spritesheet: Siemensin monitori jatkaa sykkimistään myös
# näyteikkunassa - koostekuva rakennetaan 8 kertaa, kerran monitorin
# kutakin EKG-kehystä kohti.
#
# Esineet on jaettu kahdelle riville KORKEUDEN mukaan (matalat ylös,
# korkeat alas) jotta rivit ovat siistit, ja kummankin rivin sisällä
# esitysjärjestyksessä vasemmalta oikealle - niin Jarno voi käydä ne läpi
# samassa järjestyksessä kuin ne esityksessä tulivat vastaan.
#
# Kaikki 1:1-mittakaavassa: EI esinekohtaista suurennusta, jotta
# pikseliruudukko pysyy samana koko kuvassa. Eri kokoiset esineet siis
# näkyvät eri kokoisina - se on rehellistä (masto ON iso, kortti pieni).
# ---------------------------------------------------------------------------
kuvat = {n.replace('.png', ''): im for n, im in tehdyt}
# Siemensin kehykset erikseen koostetta varten
siemens_kehykset = [kuvat['siemens-monitori'].crop((f * KEHYS_L, 0, (f + 1) * KEHYS_L, KEHYS_K))
                    for f in range(KEHYKSIA)]
RIVIT = [
    ['finnair-lentokone', 'storaenso-laatikko', 'upm-tukkipino', 'metsa-paperirulla', 'santander-kortti'],
    ['siemens-monitori', 'dna-puhelin', 'ericsson-masto', 'danske-pankki', 'gigantti-tv'],
]
VALI_X, VALI_Y, REUNUS = 10, 16, 10


def rivin_koko(rivi):
    lev = sum((KEHYS_L if n == 'siemens-monitori' else kuvat[n].width) for n in rivi) + VALI_X * (len(rivi) - 1)
    kork = max((KEHYS_K if n == 'siemens-monitori' else kuvat[n].height) for n in rivi)
    return lev, kork


mitat = [rivin_koko(r) for r in RIVIT]
NAYTE_L = max(l for l, _ in mitat) + REUNUS * 2
NAYTE_K = sum(k for _, k in mitat) + VALI_Y * (len(RIVIT) - 1) + REUNUS * 2
# TAUSTAPANEELI: POIS PÄÄLTÄ (Jarno 8.9.2026: "you can bring it to front,
# all of them"). Paneelia harkittiin koska paljastusdia on tummassa
# metsa-eder-muniz-loppu -kohtauksessa ja tummat esineet (masto, puhelin,
# television kehys) voivat upota taustaan. Jarno valitsi yksinkertaisemman
# ratkaisun: esineet piirretään kaikkien taustakerrosten ETEEN, jolloin
# paneelia ei tarvita. Koodi jätetty tähän - jos näyteikkuna osoittautuu
# tummaa metsää vasten epäselväksi, tästä saa taulun takaisin yhdellä
# sanalla (PANEELI = True).
PANEELI = False
PANEELI_TAYTTO = (20, 28, 38, 232)
PANEELI_REUNA_ULKO = (9, 13, 18, 255)
PANEELI_REUNA_SISA = (86, 99, 122, 255)
nayte = Image.new('RGBA', (NAYTE_L * KEHYKSIA, NAYTE_K), (0, 0, 0, 0))
for f in range(KEHYKSIA):
    kehys = Image.new('RGBA', (NAYTE_L, NAYTE_K), (0, 0, 0, 0))
    if PANEELI:
        d = ImageDraw.Draw(kehys)
        d.rectangle([0, 0, NAYTE_L - 1, NAYTE_K - 1], fill=PANEELI_TAYTTO, outline=PANEELI_REUNA_ULKO)
        d.rectangle([2, 2, NAYTE_L - 3, NAYTE_K - 3], outline=PANEELI_REUNA_SISA)
    y = REUNUS
    for rivi, (rlev, rkork) in zip(RIVIT, mitat):
        x = (NAYTE_L - rlev) // 2          # rivi keskitetään
        for nimi in rivi:
            im = siemens_kehykset[f] if nimi == 'siemens-monitori' else kuvat[nimi]
            kehys.paste(im, (x, y + rkork - im.height), im)  # rivin alareunaan tasattuna
            x += im.width + VALI_X
        y += rkork + VALI_Y
    nayte.paste(kehys, (f * NAYTE_L, 0))
tehdyt.append(('nayteikkuna.png', tallenna(nayte, 'nayteikkuna.png')))
print(f'    -> nayteikkunan kehys {NAYTE_L}x{NAYTE_K}, {KEHYKSIA} kehysta')

# ---------------------------------------------------------------------------
# Kontaktiarkki tarkistusta varten: kaikki esineet 6x suurennettuna
# NEAREST-suodatuksella - eli TÄSMÄLLEEN siten kuin Phaser ne piirtää.
# Näin pikselöityneisyyden voi todeta silmällä ennen kuin mitään kytketään.
# ---------------------------------------------------------------------------
ZOOM = 6
VALI = 10
korkein = max(im.height for _, im in tehdyt)
kokonais_l = sum(im.width for _, im in tehdyt) * ZOOM + VALI * (len(tehdyt) + 1)
arkki = Image.new('RGBA', (kokonais_l, korkein * ZOOM + VALI * 2), (38, 44, 40, 255))
x = VALI
for _, im in tehdyt:
    iso = im.resize((im.width * ZOOM, im.height * ZOOM), Image.NEAREST)
    arkki.paste(iso, (x, VALI + (korkein - im.height) * ZOOM), iso)
    x += im.width * ZOOM + VALI
arkki_polku = os.path.join(JUURI, 'materiaalia', 'piilotetut-kontaktiarkki.png')
arkki.save(arkki_polku)
print(f'\nKontaktiarkki: {arkki_polku}  ({arkki.width}x{arkki.height})')
