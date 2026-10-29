# Rakentaa TF-metsänauhat: metsä -> häivytys -> hakattu -> peilattu häivytys -> metsä.
# Aja: python3 Backrounds/tf-metsa-strip/rakenna.py   (esitys-kansiosta)
# Kohdistus 1920x1080:lle; esitys-2d.html:n resoluutioKiintea korjaa muut ruudut.
# Muuta X_MENO / X_PALUU jos pysähdykset siirtyvät.
from PIL import Image, ImageOps
import math, os

X_MENO = 9250  # Joensuu 26.10.2026 (TF: 900)
X_ALKU, X_LOPPU = 9300, 9650   # Joensuu: kohtauksen xAlue (TF: 0, 3000)
#X_MENO = 900     # häivytys ohitetaan kävellessä Gilgamesh (450) -> Muhos (1350, täysin hakattu)
X_PALUU = 9850  # Joensuu (TF: 2100)
#X_PALUU = 2100   # "Me too": peilattu häivytys ruudun keskellä

B = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
T, H = 928, 793
ORIG = os.path.join(B, 'Free Pixel Art Forest/PNG/Background layers/')
FADE = os.path.join(B, 'forestfades/')
CUT = os.path.join(B, 'forestcutted/')
OUT = os.path.join(B, 'tf-metsa-strip/')

# (alkuperäinen taso, scrollFactor, Jarnon häivytystaso, Jarnon hakattu taso)
LAYERS = [('Layer_0008_3.png', 0.28, '6', None), ('Layer_0007_Lights.png', 0.30, None, None),
          ('Layer_0006_4.png', 0.38, '5', None), ('Layer_0005_5.png', 0.48, '4', None),
          ('Layer_0004_Lights.png', 0.50, None, None), ('Layer_0003_6.png', 0.60, '3', None),
          ('Layer_0002_7.png', 0.72, '2', '2'), ('Layer_0001_8.png', 0.85, '1', '1'),
          ('Layer_0000_9.png', 0.98, '0', '0')]

W = 1920
TS = 1080 / H * 1.45
HALF = W / 2 / TS
N = 9
L = N * T
EMPTY = Image.new('RGBA', (T, H), (0, 0, 0, 0))


def u_keski(x, sf):
    return (x * 2.2 - W / 2) * sf + HALF


def paste_wrap(strip, im, u):
    p = u % L
    w = im.width
    if p + w <= L:
        strip.alpha_composite(im, (p, 0))
    else:
        strip.alpha_composite(im.crop((0, 0, L - p, H)), (p, 0))
        strip.alpha_composite(im.crop((L - p, 0, w, H)), (0, 0))


for f, sf, fade, cut in LAYERS:
    forest = Image.open(ORIG + f).convert('RGBA')
    fadeim = Image.open(FADE + fade + '.png').convert('RGBA') if fade else EMPTY
    mirror = ImageOps.mirror(fadeim)
    cutim = Image.open(CUT + cut + '.png').convert('RGBA') if cut else EMPTY

    F1 = round(u_keski(X_MENO, sf) - T / 2)
    F2 = max(F1 + T, round(u_keski(X_PALUU, sf) - T / 2))
    S = math.floor((X_ALKU * 2.2 - W / 2) * sf) - 50
    umax = (X_LOPPU * 2.2 - W / 2) * sf + 2 * HALF
    assert umax < S + L, (f, umax, S + L)

    strip = Image.new('RGBA', (L, H), (0, 0, 0, 0))
    u = F1 - T
    while u + T > S:                      # metsä ennen (rajattu S:ään, ei päällekkäisyyttä)
        c = max(0, S - u)
        paste_wrap(strip, forest.crop((c, 0, T, H)), u + c); u -= T
    paste_wrap(strip, fadeim, F1)         # häivytys
    u = F1 + T
    while u < F2:                         # hakattu (viimeinen rajattu)
        paste_wrap(strip, cutim.crop((0, 0, min(T, F2 - u), H)), u); u += T
    paste_wrap(strip, mirror, F2)         # peilattu häivytys
    u = F2 + T
    while u < S + L:                      # metsä jälkeen (rajattu S+L:ään)
        paste_wrap(strip, forest.crop((0, 0, min(T, S + L - u), H)), u); u += T
    strip.save(OUT + f)
    print(f, sf, 'F1', F1, 'F2', F2)
