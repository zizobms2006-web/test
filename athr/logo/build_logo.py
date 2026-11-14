"""Builds the Athr (أثر) logo as outlined SVG files.

The geometry is traced from the approved foil mockup photo (where the paper is
tilted ~30.5°) and then rotated upright, so the lettering sits level.

Run:  python3 build_logo.py <JosefinSans-Regular.ttf> [--overlay out.svg]
All shapes are outlines (no live text, no strokes), so files print and scale cleanly.
"""
import math, sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

OUT = os.path.dirname(os.path.abspath(__file__))
FONT = sys.argv[1]
TILT = 30.5                      # paper tilt in the reference photo, degrees

# ------------------------------------------------------------------ helpers
def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return (u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
            u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1])

def blade(segs, wfn, n=120, round_head=False):
    """Reed-pen stroke: centreline (cubic segments) + width profile -> outline points."""
    pts = []
    for i, s in enumerate(segs):
        for k in range(n + 1):
            if i and not k:
                continue
            pts.append(bez(*s, k / n))
    L = [0.0]
    for a, b in zip(pts, pts[1:]):
        L.append(L[-1] + math.dist(a, b))
    left, right = [], []
    for i, p in enumerate(pts):
        a, b = pts[max(i - 1, 0)], pts[min(i + 1, len(pts) - 1)]
        d = math.dist(a, b) or 1
        nx, ny = -(b[1] - a[1]) / d, (b[0] - a[0]) / d
        w = wfn(L[i] / L[-1]) / 2
        left.append((p[0] + nx * w, p[1] + ny * w))
        right.append((p[0] - nx * w, p[1] - ny * w))
    poly = left + right[::-1]
    if round_head:                       # semicircular cap at the start
        p0, w0 = pts[0], wfn(0) / 2
        a0 = math.atan2(left[0][1] - p0[1], left[0][0] - p0[0])
        cap = [(p0[0] + w0 * math.cos(a0 + math.pi * k / 16), p0[1] + w0 * math.sin(a0 + math.pi * k / 16))
               for k in range(1, 16)]
        poly = poly + cap
    return poly

def profile(W, peak, head=0.0, **_):
    """Smooth belly: sin(pi * u^k), u offset so the head can start blunt; max at t = peak."""
    off = head
    k = math.log(.5) / math.log(off + (1 - off) * peak)
    return lambda t: W * math.sin(math.pi * (off + (1 - off) * t) ** k)

def square(cx, cy, s):
    h = s / 2
    return [(cx - h, cy - h), (cx + h, cy - h), (cx + h, cy + h), (cx - h, cy + h)]

# ------------------------------------------------------------------ the mark, in photo coordinates
def mark_polys():
    P = []
    # 1 — upper blade: hairline point at the left, full belly, fine tip
    P.append(blade([((42, 104), (180, 150), (390, 217), (472, 304))], profile(42, .56)))
    # 2 — middle blade, blunt rounded head
    P.append(blade([((254, 247), (330, 263), (452, 307), (518, 390))], profile(38, .26, head=.08)))
    # 3 — lower blade, the longest sweep
    P.append(blade([((294, 324), (392, 344), (562, 400), (642, 528))], profile(38, .26, head=.08)))
    # hairline: the pen's fine exit stroke running past the dots
    P.append(blade([((96, 150), (150, 212), (205, 276), (262, 334))], lambda t: 0.6 + 2.2 * math.sin(math.pi * t) ** .5, n=60))
    # hamza, lifted clear of the upper blade
    up = -30
    hz = [((186, 44 + up), (165, 40 + up), (140, 60 + up), (160, 78 + up)),
          ((160, 78 + up), (176, 90 + up), (214, 88 + up), (200, 108 + up)),
          ((200, 108 + up), (192, 118 + up), (178, 120 + up), (162, 118 + up))]
    P.append(blade(hz, lambda t: 3.2 + 16 * math.sin(math.pi * min(1, t * 1.05)) ** .75, n=50))
    return P

def dots():
    """Three dots of ث, set upright: equal squares stepping down corner to corner."""
    s = 27
    cx, cy = rot((160, 241))
    return [square(cx + (i - 1) * s, cy + (i - 1) * s, s) for i in range(3)]

# ------------------------------------------------------------------ lettering
font = TTFont(FONT)
gs = font.getGlyphSet(); cmap = font.getBestCmap(); hmtx = font["hmtx"]
CAP = font["OS/2"].sCapHeight

def word(text, cap_h, track):
    """Returns (list of (glyph, x-offset in font units scaled)), width, scale."""
    s = cap_h / CAP
    x, items = 0.0, []
    for ch in text:
        g = cmap[ord(ch)]
        items.append((g, x))
        x += hmtx[g][0] * s + track
    return items, x - track, s

def word_svg(text, cap_h, track, bx, by):
    items, width, s = word(text, cap_h, track)
    out, bp = [], BoundsPen(gs)
    for g, x in items:
        pen = SVGPathPen(gs)
        t = (s, 0, 0, -s, bx + x, by)
        gs[g].draw(TransformPen(pen, t)); gs[g].draw(TransformPen(bp, t))
        out.append(pen.getCommands())
    return out, bp.bounds, width

# ------------------------------------------------------------------ rotate upright
th = math.radians(TILT)
def rot(p):
    x, y = p
    return (x * math.cos(th) - y * math.sin(th), x * math.sin(th) + y * math.cos(th))

def poly_d(poly):
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in poly) + " Z"

polys_photo = mark_polys()
polys = [[rot(p) for p in poly] for poly in polys_photo] + dots()

# Lettering: baselines traced in the photo, then rotated
ATHR_START, A3R_START = rot((140, 700)), rot((198, 763))
t1, b1, w1 = word_svg("ATHR", 76, 22, *ATHR_START)
t2, b2, w2 = word_svg("A3R.ORG", 48, 12.5, *A3R_START)

def bounds(polys, extra=()):
    xs = [p[0] for poly in polys for p in poly]; ys = [p[1] for poly in polys for p in poly]
    for b in extra:
        xs += [b[0], b[2]]; ys += [b[1], b[3]]
    return min(xs), min(ys), max(xs), max(ys)

# ------------------------------------------------------------------ output
GRAD = ('<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#8A6A30"/><stop offset=".3" stop-color="#D3AF68"/>'
        '<stop offset=".5" stop-color="#F0DBA2"/><stop offset=".72" stop-color="#B8904A"/>'
        '<stop offset="1" stop-color="#8A6A30"/></linearGradient></defs>')
COLORS = {"gold": "#C6A15B", "gold-foil": "url(#g)", "black": "#0D0C0B", "white": "#FFFFFF"}

def svg(box, body, pad=8, px=4):
    x0, y0, x1, y1 = box
    x0 -= pad; y0 -= pad; w = x1 - x0 + pad; h = y1 - y0 + pad
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.1f} {y0:.1f} {w:.1f} {h:.1f}" '
            f'width="{w*px/4:.0f}" height="{h*px/4:.0f}">\n{body}\n</svg>\n')

def g(paths, fill, tr=""):
    tr = f' transform="{tr}"' if tr else ""
    return f'<g fill="{fill}"{tr}>' + "".join(f'<path d="{d}"/>' for d in paths) + "</g>"

def write(name, s):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(s)

MARK_D = [poly_d(p) for p in polys]
VBOX = bounds(polys, (b1, b2))
MBOX = bounds(polys)



for cname, fill in COLORS.items():
    d = GRAD if fill.startswith("url") else ""
    write(f"athr-logo-vertical-{cname}.svg", svg(VBOX, d + g(MARK_D + t1 + t2, fill), pad=14))
    write(f"athr-mark-{cname}.svg", svg(MBOX, d + g(MARK_D, fill), pad=10))

if "--overlay" in sys.argv:   # unrotated, for checking against the photo
    inv = f"rotate({-TILT})"
    body = g([poly_d(p) for p in polys_photo], "#ff2d55") + g(t1 + t2, "#ff2d55", inv)
    write(sys.argv[sys.argv.index("--overlay") + 1],
          f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 820" width="700" height="820">{body}</svg>')
print("ATHR", w1, "A3R", w2)
