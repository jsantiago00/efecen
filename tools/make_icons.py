"""Genera los íconos PNG de la PWA dibujando a Nabla (la mascota) con Pillow.

Uso:  python tools/make_icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "icons"
BG, GOLD, INK, CHEEK = (91, 75, 219), (255, 194, 61), (42, 36, 72), (255, 143, 163)
SS = 4  # supersampling


def nabla(d, ox, oy, s):
    """Dibuja la mascota en un cuadro de 120x120 unidades escalado por s, con origen (ox, oy)."""
    P = lambda x, y: (ox + x * s, oy + y * s)
    tri = [P(18, 22), P(102, 22), P(60, 98)]
    d.polygon(tri, fill=GOLD)
    w = int(18 * s)
    d.line(tri + [tri[0]], fill=GOLD, width=w, joint="curve")
    for (x, y) in [(18, 22), (102, 22), (60, 98)]:  # esquinas redondeadas
        cx, cy = P(x, y)
        d.ellipse([cx - w / 2, cy - w / 2, cx + w / 2, cy + w / 2], fill=GOLD)
    # ojos felices
    for ex in (46, 74):
        d.arc([*P(ex - 7, 38), *P(ex + 7, 54)], 200, 340, fill=INK, width=int(4.5 * s))
    for cx in (38, 82):
        d.ellipse([*P(cx - 5, 53), *P(cx + 5, 59)], fill=CHEEK)
    # boca abierta
    d.chord([*P(49, 50), *P(71, 70)], 0, 180, fill=INK)


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
    nabla(d, big * pad, big * pad + inner * 0.04, s)
    img.resize((size, size), Image.LANCZOS).save(path)
    print("ok", path.relative_to(ROOT))


icon(192, 0.10, True, OUT / "icon-192.png")
icon(512, 0.10, True, OUT / "icon-512.png")
icon(512, 0.20, False, OUT / "icon-maskable-512.png")  # zona segura del 80 %
icon(180, 0.12, False, OUT / "icon-180.png")           # apple-touch-icon (iOS redondea solo)
