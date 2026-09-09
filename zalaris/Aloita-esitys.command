#!/bin/bash
# ============================================================================
# Kaksoisklikattava käynnistin esitykselle - kopioitu Presentation/Aloita-
# esitys.command:sta 2.9.2026 kun Zalaris eriytettiin omaksi kansiokseen
# (Jarno: "3 presentations next week... what I have done earlier just to
# create different Keynote files" - sama periaate, mutta jokainen esitys nyt
# oma itsenäinen kansio jaetun moottorin/tekniikan päällä, EI jaettu data).
# Tämä on TÄSMÄLLEEN sama skripti kuin Presentation/:ssä, vain PRESENTATION_DIR
# ja PORT eri (8744, jotta Zalaris ja Presentation voivat pyöriä SAMAAN
# AIKAAN jos tarve, eri portit eivät riitele).
#
# TOIMII TÄYSIN OFFLINE - ei internetyhteyttä tarvita (sama tarkistus kuin
# alkuperäisessä, tämä kansio sisältää VAIN sen mitä esitys oikeasti käyttää,
# ks. muistio "miksi tämä kansio on 71M eikä 22G").
#
# KÄYTTÖ ENNEN ESITYSTÄ: kaksoisklikkaa tätä tiedostoa Finderissä.
# HARJOITTELE TÄMÄ ETUKÄTEEN samalla koneella jolla oikeasti esiinnyt.
# ============================================================================

PRESENTATION_DIR="/Users/jarnoalastalo/Claude/Projects/Zalaris"
PROJECTS_DIR="/Users/jarnoalastalo/Claude/Projects"
PORT=8744

echo "=========================================="
echo " Zalaris-esityksen käynnistys"
echo "=========================================="
echo ""

# --- 1. Etsi python3 luotettavasti ---
PYTHON=""
for candidate in python3 /opt/homebrew/bin/python3 /usr/bin/python3 /usr/local/bin/python3; do
  if command -v "$candidate" >/dev/null 2>&1; then
    PYTHON="$candidate"
    break
  fi
done

if [ -z "$PYTHON" ]; then
  echo "VIRHE: python3:a ei löytynyt koneelta."
  osascript -e 'display alert "Esityksen käynnistys epäonnistui" message "Python3:a ei löytynyt koneelta. Tarkista tämä ENNEN esitystä, ei sen aikana." as critical' 2>/dev/null
  echo "Paina Enter sulkeaksesi..."
  read -r
  exit 1
fi
echo "Käytetään: $PYTHON ($($PYTHON --version 2>&1))"

# --- 2. Käynnistä palvelin jos ei jo käynnissä ---
# dev-server.py (EI plain "python3 -m http.server") 2.9.2026 - Jarno löysi
# oikean bugin: kuvien selainvälimuisti oli SITKEÄ (evolution.png pysyi
# vanhana selaimessa vaikka tiedosto vaihdettiin levylle) - plain
# http.server ei lähetä MITÄÄN cache-ohjausta kuville/skripteille (VAIN
# esitys-2d.html:n oma <meta>-tagi suojaa itse HTML-tiedostoa, ei mitään
# muuta). dev-server.py lähettää no-cache-otsakkeet JOKAiSELLE tiedostolle.
if lsof -i ":$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Palvelin on jo käynnissä portissa $PORT - ei käynnistetä uudelleen."
else
  echo "Käynnistetään paikallinen palvelin (portti $PORT)..."
  cd "$PROJECTS_DIR" || exit 1
  nohup "$PYTHON" "$PROJECTS_DIR/dev-server.py" "$PORT" --directory Zalaris \
    > /tmp/esitys-palvelin-zalaris.log 2>&1 &
  disown
fi

# --- 3. Odota että palvelin OIKEASTI vastaa (max 5s) ---
READY=0
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -s -o /dev/null "http://localhost:$PORT/esitys-2d.html"; then
    READY=1
    break
  fi
  sleep 0.5
done

if [ "$READY" -ne 1 ]; then
  echo "VIRHE: palvelin ei vastannut $PORT:ssa 5 sekunnin kuluttua."
  echo "Loki: /tmp/esitys-palvelin-zalaris.log"
  osascript -e 'display alert "Esityksen käynnistys epäonnistui" message "Palvelin ei vastannut. Tarkista Terminaali (loki: /tmp/esitys-palvelin-zalaris.log) ENNEN esitystä." as critical' 2>/dev/null
  echo "Paina Enter sulkeaksesi..."
  read -r
  exit 1
fi

echo "Palvelin vastaa OK."
echo ""
echo "Avataan pääikkuna ja puhujan näkymä..."
open "http://localhost:$PORT/esitys-2d.html"
sleep 0.6
open "http://localhost:$PORT/esittajanakyma.html"

echo ""
echo "=========================================="
echo " VALMIS. Tämän ikkunan voi sulkea -"
echo " palvelin jää käyntiin taustalla."
echo "=========================================="
echo ""
echo "(Jos haluat pysäyttää palvelimen myöhemmin: kill \$(lsof -ti:$PORT))"
sleep 4
