"""Genera los íconos PNG de la PWA dibujando a Schrödi (la mascota) con Pillow.

Usa las mismas coordenadas que el SVG de la mascota (caja de 120x120 unidades).
Uso:  python tools/make_icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "icons"
BG = (91, 75, 219)
FUR, MUZZLE, PINK, INK = (173, 165, 234), (220, 216, 248), (255, 143, 168), (42, 36, 72)
BOX, BAND, FLAP, INSIDE, PSI = (255, 194, 61), (240, 174, 36), (233, 165, 32), (154, 101, 18), (201, 134, 15)
SS = 4  # supersampling


def psi_font(size):
    for name in ("timesbi.ttf", "georgiaz.ttf", "timesi.ttf", "DejaVuSerif-BoldItalic.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def schrodi(d, ox, oy, s):
    P = lambda x, y: (ox + x * s, oy + y * s)
    E = lambda cx, cy, rx, ry: [*P(cx - rx, cy - ry), *P(cx + rx, cy + ry)]
    poly = lambda pts, fill: d.polygon([P(x, y) for x, y in pts], fill=fill)
    # caja: interior y solapas
    poly([(26, 72), (31, 62), (89, 62), (94, 72)], INSIDE)
    poly([(18, 72), (3, 62), (27, 57), (40, 72)], FLAP)
    poly([(102, 72), (117, 62), (93, 57), (80, 72)], FLAP)
    # gato (asomado, feliz): desplazado 2 unidades hacia abajo
    dy = 2
    poly([(40, 38 + dy), (41, 17 + dy), (56, 30 + dy)], FUR)
    poly([(80, 38 + dy), (79, 17 + dy), (64, 30 + dy)], FUR)
    poly([(43.5, 33 + dy), (44, 22.5 + dy), (51.5, 29.5 + dy)], PINK)
    poly([(76.5, 33 + dy), (76, 22.5 + dy), (68.5, 29.5 + dy)], PINK)
    d.ellipse(E(60, 48 + dy, 23, 20), fill=FUR)
    d.ellipse(E(60, 56.5 + dy, 10, 6.5), fill=MUZZLE)
    for cx in (45, 75):
        d.ellipse(E(cx, 55 + dy, 3.6, 2.3), fill=(230, 160, 200))
    for ex in (51, 69):  # ojos felices ^ ^
        d.arc(E(ex, 51 + dy, 4.2, 4.2), 200, 340, fill=INK, width=max(1, int(3 * s)))
    poly([(57.6, 53.4 + dy), (62.4, 53.4 + dy), (60, 56.2 + dy)], PINK)
    d.chord(E(60, 57.5 + dy, 5, 4.6), 0, 180, fill=INK)
    # frente de la caja, patitas y ψ
    d.rounded_rectangle([*P(18, 72), *P(102, 112)], radius=5 * s, fill=BOX)
    d.rounded_rectangle([*P(18, 72), *P(102, 78)], radius=2 * s, fill=BAND)
    for cx in (47, 73):
        d.ellipse(E(cx, 72.5, 6.5, 4.5), fill=FUR)
    d.text(P(60, 94), "ψ", font=psi_font(int(26 * s)), fill=PSI, anchor="mm")


def icon(size, pad, rounded, path):
    big = size * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, big - 1, big - 1], radius=int(big * 0.22), fill=BG)
    else:
        d.rectangle([0, 0, big, big], fill=BG)
    inner = big * (1 - 2 * pad)
    s = inner / 120
    # el dibujo ocupa y = 14..116; lo centro verticalmente
    schrodi(d, big * pad, big * pad - 9 * s, s)
    img.resize((size, size), Image.LANCZOS).save(path)
    print("ok", path.relative_to(ROOT))


icon(192, 0.08, True, OUT / "icon-192.png")
icon(512, 0.08, True, OUT / "icon-512.png")
icon(512, 0.18, False, OUT / "icon-maskable-512.png")  # zona segura del 80 %
icon(180, 0.10, False, OUT / "icon-180.png")           # apple-touch-icon (iOS redondea solo)
