"""Builds the Athr (أثر) logo as outlined SVG files.

Run:  python3 build_logo.py <path-to-JosefinSans-Light.ttf>
All shapes are outlines (no live text, no strokes), so files print and scale cleanly.
"""
import math, sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

OUT = os.path.dirname(os.path.abspath(__file__))
FONT = sys.argv[1]

# ---------------------------------------------------------------- geometry
def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return (u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
            u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1])

def sample(segs, n=90):
    pts = []
    for i, s in enumerate(segs):
        for k in range(n + 1):
            if i and k == 0:
                continue
            pts.append(bez(*s, k / n))
    return pts

def stroke(segs, width_fn, n=90, cap_round=True):
    """Calligraphic (qalam) stroke: centreline + width profile -> closed outline."""
    pts = sample(segs, n)
    # arc-length param
    L = [0.0]
    for a, b in zip(pts, pts[1:]):
        L.append(L[-1] + math.dist(a, b))
    tot = L[-1]
    left, right = [], []
    for i, p in enumerate(pts):
        a = pts[max(i - 1, 0)]; b = pts[min(i + 1, len(pts) - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        d = math.hypot(dx, dy) or 1
        nx, ny = -dy / d, dx / d
        w = width_fn(L[i] / tot) / 2
        left.append((p[0] + nx * w, p[1] + ny * w))
        right.append((p[0] - nx * w, p[1] - ny * w))
    poly = left + right[::-1]
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in poly) + " Z"

def swash(W, head=0.18, start=0.28, tip=0.0):
    """Width rises fast from a blunt head and tapers long to a fine tip."""
    def f(t):
        rise = start + (1 - start) * math.sin(min(1, t / head) * math.pi / 2)
        fall = 1 if t <= head else ((1 - t) / (1 - head)) ** 1.3
        return max(W * rise * fall, tip)
    return f

def diamond(cx, cy, s, ang):
    r = s / math.sqrt(2)
    pts = [(cx + r * math.cos(math.radians(ang + k * 90)), cy + r * math.sin(math.radians(ang + k * 90))) for k in range(4)]
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in pts) + " Z"

def mark_paths():
    P = []
    # 1 — alef: the long upper swash
    P.append(stroke([((70, 3), (112, 30), (156, 76), (180, 140))], swash(19, head=.2, start=.4)))
    # 2 — the middle swash (body of ث)
    P.append(stroke([((114, 80), (140, 100), (168, 130), (180, 178))], swash(16.5, head=.22, start=.5)))
    # 3 — the long lower swash (ر) sweeping to the base
    P.append(stroke([((114, 113), (148, 140), (184, 186), (198, 250))], swash(19.5, head=.2, start=.5)))
    # hamza (ء) above the alef
    hz = [((133, 9), (124, 1), (106, 4), (110, 13)),
          ((110, 13), (114, 20), (134, 17), (131, 26)),
          ((131, 26), (129, 31), (116, 31), (106, 28))]
    P.append(stroke(hz, lambda t: 1.6 + 4.4 * math.sin(min(t * 1.15, 1) * math.pi) ** .7, n=40))
    # three dots of ث, set as stacked rhombi like reed-pen dots
    for cx, cy in ((80.5, 52), (86.5, 69), (92, 86)):
        P.append(diamond(cx, cy, 11.2, 32 + 45))
    return P

# ---------------------------------------------------------------- lettering
font = TTFont(FONT)
gs = font.getGlyphSet(); cmap = font.getBestCmap(); hmtx = font["hmtx"]
CAP = font["OS/2"].sCapHeight

def word(text, x, baseline, cap_h, track):
    """Outlines `text`; 'A' is drawn as a bar-less Λ (V rotated 180°) to echo the mark's open forms."""
    s = cap_h / CAP
    out = []
    for ch in text:
        g = cmap[ord("V") if ch == "A" else ord(ch)]
        adv = hmtx[g][0]
        pen = SVGPathPen(gs)
        if ch == "A":   # flip V both ways -> Λ, keeping the same advance
            t = (-s, 0, 0, s, x + adv * s, baseline - CAP * s)
        else:
            t = (s, 0, 0, -s, x, baseline)
        gs[g].draw(TransformPen(pen, t))
        out.append(pen.getCommands())
        x += adv * s + track
    return out, x - track

# ---------------------------------------------------------------- compositions
MARK = mark_paths()

def svg(w, h, body, vb=None):
    vb = vb or f"0 0 {w} {h}"
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w*4:.0f}" height="{h*4:.0f}">\n{body}\n</svg>\n'

def group(paths, fill, dx=0, dy=0, sc=1):
    tr = f' transform="translate({dx} {dy}) scale({sc})"' if (dx or dy or sc != 1) else ""
    return f'<g fill="{fill}"{tr}>' + "".join(f'<path d="{d}"/>' for d in paths) + "</g>"

GRAD = ('<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">'
        '<stop offset="0" stop-color="#8A6A30"/><stop offset=".3" stop-color="#D3AF68"/>'
        '<stop offset=".5" stop-color="#F0DBA2"/><stop offset=".72" stop-color="#B8904A"/>'
        '<stop offset="1" stop-color="#8A6A30"/></linearGradient></defs>')

COLORS = {"gold": "#C6A15B", "gold-foil": "url(#g)", "black": "#0D0C0B", "white": "#FFFFFF"}

# vertical lockup (as the original sketch: lettering under-left, mark sweeping right)
t1, e1 = word("ATHR", 3, 219, 25, 8.5)
t2, e2 = word("A3R.ORG", 5, 249, 14.5, 5.2)
VERT = (MARK, t1 + t2)

# horizontal lockup: mark left, lettering right
h1, he1 = word("ATHR", 0, 0, 30, 12)
h2, he2 = word("A3R.ORG", 1, 0, 15.5, 7.4)

def write(name, content):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content)

for cname, fill in COLORS.items():
    defs = GRAD if fill.startswith("url") else ""
    write(f"athr-logo-vertical-{cname}.svg",
          svg(212, 258, defs + group(MARK, fill) + group(t1 + t2, fill), "0 0 212 258"))
    write(f"athr-mark-{cname}.svg",
          svg(140, 256, defs + group(MARK, fill), "64 0 140 256"))
    # horizontal: mark 0..140 scaled .62 -> ~87 wide, 158 tall; text block centred vertically
    sc = .62
    mw = 140 * sc; mh = 256 * sc
    tx = mw + 26
    body = (group(MARK, fill, dx=-64 * sc, dy=0, sc=sc) +
            group(h1, fill, dx=tx, dy=mh / 2 + 4) + group(h2, fill, dx=tx + 1, dy=mh / 2 + 34))
    write(f"athr-logo-horizontal-{cname}.svg",
          svg(round(tx + max(he1, he2) + 4), round(mh), defs + body))

print("ok", e1, e2, he1, he2)
