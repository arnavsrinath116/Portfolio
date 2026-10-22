"""
Paints every texture for the Music room (tools/room/build_room.py uses them).
All original: a sunset sky with trees and a neighbour's house, wood, plaster, record and book
spines, album covers, posters. Run: python3 tools/room/make_textures.py
"""
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(__file__).parent / 'textures'
OUT.mkdir(exist_ok=True)
rng = random.Random(7)
np_rng = np.random.default_rng(7)


def hexc(h):
    h = h.lstrip('#')
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def font(size, bold=False):
    for p in [
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
    ]:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            pass
    return ImageFont.load_default()


def noise(w, h, scale, octaves=4, seed=0):
    """Smooth value noise, 0..1."""
    g = np.random.default_rng(seed)
    out = np.zeros((h, w))
    amp, total = 1.0, 0.0
    for o in range(octaves):
        s = max(2, int(scale * 2**o))
        small = g.random((s, s))
        img = Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += np.asarray(img, dtype=float) / 255 * amp
        total += amp
        amp *= 0.5
    return out / total


# ---------------------------------------------------------------- the view out of the window
def sky():
    W, H = 2048, 1024
    stops = [(0.0, '#2c2d5a'), (0.32, '#6b4f86'), (0.55, '#d9787a'), (0.72, '#f6a25e'), (0.82, '#ffc978'), (1.0, '#ffd99a')]
    arr = np.zeros((H, W, 3))
    for y in range(H):
        t = y / (H - 1)
        for (a, ca), (b, cb) in zip(stops, stops[1:]):
            if a <= t <= b:
                arr[y, :] = lerp(hexc(ca), hexc(cb), (t - a) / (b - a))
                break
    # the low sun, a soft glow on the right
    yy, xx = np.mgrid[0:H, 0:W]
    sx, sy = W * 0.6, H * 0.6
    d = np.sqrt((xx - sx) ** 2 + ((yy - sy) * 1.3) ** 2)
    glow = np.exp(-d / 260)[..., None]
    arr = arr * (1 - glow * 0.6) + np.array(hexc('#fff0c8')) * glow * 0.6
    disc = np.clip(1 - (d - 34) / 6, 0, 1)[..., None]
    arr = arr * (1 - disc) + np.array(hexc('#fff6dc')) * disc
    # thin cloud streaks lit from below
    streak = noise(W, H, 3, 4, 3)
    band = np.exp(-((yy / H - 0.42) ** 2) / 0.01)
    c = np.clip((streak - 0.55) * 4, 0, 1) * band
    arr = arr * (1 - c[..., None] * 0.35) + np.array(hexc('#ff9f7a')) * c[..., None] * 0.35
    img = Image.fromarray(arr.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    # a neighbour's house: roof and wall in shadow, one lit window
    house = '#3a3240'
    d.polygon([(1310, 700), (1560, 560), (1830, 700)], fill=house)
    d.rectangle([1340, 700, 1800, 900], fill='#463c4a')
    d.rectangle([1480, 760, 1540, 820], fill='#ffcf8a')
    d.rectangle([1600, 760, 1660, 820], fill='#5a4a55')
    # trees: dark, leafy silhouettes along the lower edge, taller on the left
    for i in range(26):
        x = rng.uniform(-80, W + 80)
        if abs(x - W * 0.6) < 260:
            continue  # a gap where the sun goes down
        base = rng.uniform(900, 1024)
        hgt = rng.uniform(140, 320) * (1.2 if x < W * 0.35 else 0.75)
        col = lerp(hexc('#1f1a22'), hexc('#3b2f35'), rng.random())
        for k in range(30):
            r = rng.uniform(22, 54)
            px = x + rng.gauss(0, hgt * 0.22)
            py = base - rng.uniform(0, hgt)
            d.ellipse([px - r, py - r, px + r, py + r], fill=col)
    # bushes and a hedge
    for i in range(80):
        x = rng.uniform(0, W)
        r = rng.uniform(30, 70)
        d.ellipse([x - r, 960 - r, x + r, 960 + r], fill=lerp(hexc('#221c22'), hexc('#3a2e30'), rng.random()))
    d.rectangle([0, 990, W, H], fill='#1d181c')
    # the outside is out of focus, as through a real window
    img = img.filter(ImageFilter.GaussianBlur(5))
    img.save(OUT / 'sky.jpg', quality=90)


# ---------------------------------------------------------------- wood, plaster
def wood(name, base, dark, size=1024, planks=0, seed=1, stretch=24):
    n = noise(size, size // stretch, 6, 4, seed)
    n = np.asarray(Image.fromarray((n * 255).astype(np.uint8)).resize((size, size), Image.BICUBIC), dtype=float) / 255
    grain = (np.sin(np.linspace(0, 120, size)[None, :] + n * 18) + 1) / 2
    t = (grain * 0.55 + n * 0.45)[..., None]
    arr = np.array(hexc(base)) * (1 - t * 0.45) + np.array(hexc(dark)) * t * 0.45
    if planks:
        w = size // planks
        rr = np.random.default_rng(seed)
        for i in range(planks):
            arr[:, i * w : (i + 1) * w] *= rr.uniform(0.86, 1.08)
            arr[:, i * w : i * w + 2] *= 0.55
        # board ends, staggered
        for i in range(planks):
            for y in rr.integers(0, size, 2):
                arr[y : y + 2, i * w : (i + 1) * w] *= 0.6
    Image.fromarray(arr.clip(0, 255).astype(np.uint8)).save(OUT / f'{name}.jpg', quality=90)


def plaster():
    n = noise(512, 512, 16, 5, 9)
    arr = np.array(hexc('#efe6d6')) * (0.96 + n[..., None] * 0.06)
    Image.fromarray(arr.clip(0, 255).astype(np.uint8)).save(OUT / 'plaster.jpg', quality=92)


# ---------------------------------------------------------------- record spines, books
SPINE_COLS = ['#c9663f', '#e6dcc8', '#1b2025', '#94c4d9', '#4f8aa3', '#d8b25a', '#7a3b2e', '#efe7d6', '#2d3a2e', '#b44a3a', '#5d6b7a', '#e3c9a0', '#8c5a3c', '#22262b']


def spines():
    W, H = 2048, 512
    img = Image.new('RGB', (W, H), '#1a1614')
    d = ImageDraw.Draw(img)
    x = 0
    while x < W:
        w = rng.choice([5, 6, 7, 8, 9, 11, 14])
        c = hexc(rng.choice(SPINE_COLS))
        c = tuple(min(255, int(v * rng.uniform(0.75, 1.1))) for v in c)
        top = rng.randint(0, 26)
        d.rectangle([x, top, x + w - 1, H], fill=c)
        if rng.random() < 0.6:
            ty = rng.randint(80, 300)
            d.rectangle([x + 1, ty, x + w - 2, ty + rng.randint(20, 120)], fill=lerp(c, (240, 235, 225), 0.55))
        d.line([x + w - 1, top, x + w - 1, H], fill=(20, 16, 14))
        x += w
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    img.save(OUT / 'spines.jpg', quality=88)


def books():
    W, H = 512, 256
    img = Image.new('RGB', (W, H), '#2a2420')
    d = ImageDraw.Draw(img)
    cols = ['#f1e9da', '#c9663f', '#2f4f5f', '#e7d7b8', '#7a3b2e', '#d8cfbf']
    y = 0
    for c in cols:
        h = H // len(cols)
        d.rectangle([0, y, W, y + h - 2], fill=c)
        d.rectangle([40, y + h // 3, 200, y + h // 3 + 6], fill=lerp(hexc(c), (30, 30, 30), 0.5))
        y += h
    img.save(OUT / 'books.jpg', quality=90)


# ---------------------------------------------------------------- album covers, label, posters
COVERS = [
    # title, artist, ground, ink: an original cover for each record (the real album art is the label's)
    ('SAILOR SONG', 'GIGI PEREZ', '#4f8aa3', '#f4f0e8'),
    ('EXPERIENCE', 'LUDOVICO EINAUDI · REIMAGINED', '#1b2025', '#94c4d9'),
    ('THE WINNER IS', 'DEVOTCHKA & MYCHAEL DANNA', '#e8b84a', '#14171a'),
    ('PURPOSE IS GLORIOUS', 'NATALIE HOLT · LOKI', '#2d3a2e', '#d8b25a'),
]


def covers():
    for i, (title, artist, bg, ink) in enumerate(COVERS):
        S = 512
        img = Image.new('RGB', (S, S), bg)
        d = ImageDraw.Draw(img)
        inkc = hexc(ink)
        if i == 0:  # the sea: rolling swells
            for k in range(9):
                y = 90 + k * 30
                pts = [(x, y + 14 * math.sin(x / 38 + k * 0.7)) for x in range(30, 482, 6)]
                d.line(pts, fill=inkc, width=3)
        if i == 1:  # a piano's strings in time: rings spreading
            for r in range(24, 220, 20):
                d.ellipse([256 - r, 210 - r, 256 + r, 210 + r], outline=inkc, width=2)
            for k in range(14):
                x = 70 + k * 27
                d.line([x, 360, x, 390], fill=inkc, width=6 if k % 7 in (1, 2, 4, 5, 6) else 3)
        if i == 2:  # sunshine: a low sun and its rays over a road
            d.ellipse([186, 110, 326, 250], outline=inkc, width=4)
            for a in range(0, 360, 20):
                r0, r1 = 88, 130
                ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
                d.line([256 + ca * r0, 180 + sa * r0, 256 + ca * r1, 180 + sa * r1], fill=inkc, width=3)
            d.line([60, 380, 452, 380], fill=inkc, width=3)
            d.polygon([(230, 380), (282, 380), (330, 330), (182, 330)], outline=inkc, width=3)
        if i == 3:  # the branching tree of time
            def branch(x, y, ang, ln, depth):
                if depth == 0:
                    return
                x2, y2 = x + math.cos(ang) * ln, y - math.sin(ang) * ln
                d.line([x, y, x2, y2], fill=inkc, width=max(1, depth))
                branch(x2, y2, ang + 0.42, ln * 0.72, depth - 1)
                branch(x2, y2, ang - 0.42, ln * 0.72, depth - 1)
            branch(256, 380, math.pi / 2, 92, 7)
        d.text((36, 418), title, fill=inkc, font=font(36 if len(title) < 14 else 28, True))
        d.text((38, 466), artist, fill=inkc, font=font(17))
        img.save(OUT / f'cover{i}.jpg', quality=90)
    # the plain covers of the stacks and the shelf
    for i in range(4):
        S = 512
        bg = ['#d9c6a3', '#efe7d6', '#3a3330', '#b9a27e'][i]
        img = Image.new('RGB', (S, S), bg)
        d = ImageDraw.Draw(img)
        d.rectangle([150, 150, 362, 330], fill=['#2b2b2b', '#6f7a70', '#c9a06a', '#3b4652'][i])
        img = img.filter(ImageFilter.GaussianBlur(1))
        img.save(OUT / f'sleeve{i}.jpg', quality=88)


def label():
    S = 256
    img = Image.new('RGB', (S, S), '#e9dcc0')
    d = ImageDraw.Draw(img)
    d.ellipse([110, 110, 146, 146], fill='#cdbb98')
    d.text((80, 70), 'SIDE A', fill='#7a3b2e', font=font(22, True))
    d.text((94, 170), '33⅓', fill='#7a3b2e', font=font(18))
    img.save(OUT / 'label.jpg', quality=90)


def posters():
    # a drawing-sheet poster in the site's own language
    W, H = 600, 840
    img = Image.new('RGB', (W, H), '#efe8da')
    d = ImageDraw.Draw(img)
    for x in range(0, W, 30):
        d.line([x, 0, x, H], fill='#e2d9c6')
    for y in range(0, H, 30):
        d.line([0, y, W, y], fill='#e2d9c6')
    for r in (220, 150, 40):
        d.ellipse([300 - r, 330 - r, 300 + r, 330 + r], outline='#2f6f8a', width=4)
    d.line([300, 330, 520, 330], fill='#2f6f8a', width=4)
    d.text((50, 640), 'SIDE A', fill='#14171a', font=font(64, True))
    d.text((52, 720), 'A-000  ·  33⅓ RPM  ·  ARNAV SRINATH', fill='#5a5248', font=font(22))
    img.save(OUT / 'poster.jpg', quality=90)
    # two framed photographs: a dusk road and a hillside, painted loosely
    for i in range(2):
        W, H = 600, 450
        top, bot = [('#6d7fa0', '#e6a07a'), ('#9fb3b8', '#e8d6b8')][i]
        arr = np.zeros((H, W, 3))
        for y in range(H):
            arr[y, :] = lerp(hexc(top), hexc(bot), y / H)
        img = Image.fromarray(arr.astype(np.uint8))
        d = ImageDraw.Draw(img)
        if i == 0:
            d.polygon([(0, 300), (180, 230), (360, 280), (600, 220), (600, 450), (0, 450)], fill='#3c3a46')
            d.polygon([(260, 450), (300, 300), (330, 300), (420, 450)], fill='#55525c')
        else:
            d.polygon([(0, 260), (220, 180), (420, 250), (600, 200), (600, 450), (0, 450)], fill='#7d8a6a')
            d.polygon([(0, 340), (300, 290), (600, 330), (600, 450), (0, 450)], fill='#5e6b4f')
        img = img.filter(ImageFilter.GaussianBlur(1.2))
        img.save(OUT / f'photo{i}.jpg', quality=88)


if __name__ == '__main__':
    if '--covers' in __import__('sys').argv:
        covers()
        raise SystemExit
    sky()
    wood('floor', '#a8774a', '#6e4a2c', planks=8, seed=2, stretch=48)
    wood('oak', '#8f5f3a', '#5b3a22', seed=3)
    wood('walnut', '#5a3a26', '#2e1d13', seed=4)
    plaster()
    spines()
    books()
    covers()
    label()
    posters()
    print('textures:', sorted(p.name for p in OUT.iterdir()))
