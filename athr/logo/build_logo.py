"""Builds the Athr (أثر) logo as outlined SVG files from the approved mockup photo.

The mark is traced from source/approved-mockup.png exactly as it sits on the
paper (no rotation). Each pen stroke is measured from the photo (its centreline
and width along its length), then rebuilt as one smooth outline so the foil
texture does not leave wobbly edges. The hamza is traced and smoothed. The three
dots and the fine hairline are set geometrically on one line so they sit together
cleanly. The lettering is level and centred under the mark: a vertical lockup.

Run:  python3 build_logo.py <JosefinSans-Regular.ttf> [--overlay out.svg]
Needs: opencv-python-headless, potracer, numpy, scipy, fonttools
"""
import math, sys, os, re
import numpy as np, cv2, potrace
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = sys.argv[1]
PHOTO = os.path.join(HERE, "source", "approved-mockup.png")
CROP = (340, 350, 690, 760)        # logo area in the photo, px
S = 6                              # working upscale

# ------------------------------------------------------------------ gold mask from the photo
im = cv2.imread(PHOTO)
x0, y0, x1, y1 = CROP
c = cv2.resize(im[y0:y1, x0:x1].astype(np.float32), None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC)
b, g_, r = c[..., 0], c[..., 1], c[..., 2]
score = cv2.GaussianBlur(np.clip((r - b - 12) / 40, 0, 1) * np.clip((r - 55) / 70, 0, 1), (0, 0), S * .9)
mask = (score > .32).astype(np.uint8) * 255
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (S * 3, S * 3)))
n, lab, st, _ = cv2.connectedComponentsWithStats(mask)

def comp(pred):
    for i in range(1, n):
        x, y, w, h, a = st[i] / S
        if pred(x, y, w, h):
            return lab == i
    raise SystemExit("component not found")

BLADES = [comp(lambda x, y, w, h: w > 150 and y < 70),                 # upper (alef)
          comp(lambda x, y, w, h: 110 < x < 140 and 100 < y < 130),    # middle
          comp(lambda x, y, w, h: 135 < x < 160 and 140 < y < 170)]    # lower
HAMZA = comp(lambda x, y, w, h: y < 40 and w < 60)

# ------------------------------------------------------------------ strokes: measure, then rebuild smooth
def rebuild_blade(m, pointed=False, n_out=240):
    ys, xs = np.nonzero(m)
    pts = np.c_[xs, ys].astype(float) / S
    mu = pts.mean(0)
    _, _, vt = np.linalg.svd(pts - mu, full_matrices=False)
    ax = vt[0] if vt[0][0] > 0 else -vt[0]
    nr = np.array([-ax[1], ax[0]])
    u = (pts - mu) @ ax; v = (pts - mu) @ nr
    lo, hi = u.min(), u.max()
    bins = np.linspace(lo, hi, 161)
    cu, top, bot = [], [], []
    for a, bb in zip(bins, bins[1:]):
        sel = (u >= a) & (u < bb)
        if sel.sum() < 3:
            continue
        cu.append((a + bb) / 2); top.append(v[sel].max()); bot.append(v[sel].min())
    cu, top, bot = map(np.array, (cu, top, bot))
    ctr, wid = (top + bot) / 2, np.clip(top - bot, 0, None)
    t = (cu - lo) / (hi - lo)
    # centreline: one smooth cubic; width: one smooth reed-pen profile (pointed tail)
    cpoly = np.polyfit(t, ctr, 3)
    from scipy.optimize import curve_fit
    def prof(tt, W, off, k, p):
        z = np.clip(off + (1 - off) * tt, 1e-6, 1)
        return W * np.abs(np.sin(np.pi * z ** k)) ** p
    lo_b = [1, 0, .2, (.85 if pointed else .3)]; hi_b = [80, (1e-3 if pointed else .45), 6, 2.5]
    (W, off, kk, pp), _ = curve_fit(prof, t, wid, p0=[wid.max(), min(.1, hi_b[1] / 2), 1, max(.9, lo_b[3])],
                                    bounds=(lo_b, hi_b), maxfev=20000)
    tt = np.linspace(0, 1, n_out)
    cc = np.polyval(cpoly, tt); ww = prof(tt, W, off, kk, pp) * (lambda z: z * z * (3 - 2 * z))(np.clip((1 - tt) / .14, 0, 1)) ** .5
    uu = lo + tt * (hi - lo)
    up = [mu + ax * a + nr * (cv + w / 2) for a, cv, w in zip(uu, cc, ww)]
    dn = [mu + ax * a + nr * (cv - w / 2) for a, cv, w in zip(uu, cc, ww)]
    if not pointed:                     # rounded reed-pen head
        w0 = ww[0] / 2; c0 = mu + ax * lo + nr * cc[0]
        cap = [c0 + w0 * (np.cos(th) * nr - np.sin(th) * ax * .8) for th in np.linspace(-np.pi / 2, np.pi / 2, 24)[1:-1]]
        return [tuple(p) for p in up + dn[::-1] + cap]
    return [tuple(p) for p in up + dn[::-1]]

def trace_smooth(m, sigma):
    cm = cv2.GaussianBlur(m.astype(np.float32), (0, 0), S * sigma)
    bm = (cm > .5).astype(np.uint8)
    cs, _ = cv2.findContours(bm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    bm = np.zeros_like(bm); cv2.drawContours(bm, cs, -1, 1, -1)
    out = []
    for curve in potrace.Bitmap(bm > 0).trace(turdsize=50, alphamax=1.2, opticurve=True, opttolerance=.5):
        d = f"M{curve.start_point.x/S:.2f} {curve.start_point.y/S:.2f}"
        for sg in curve.segments:
            if sg.is_corner:
                d += f" L{sg.c.x/S:.2f} {sg.c.y/S:.2f} L{sg.end_point.x/S:.2f} {sg.end_point.y/S:.2f}"
            else:
                d += (f" C{sg.c1.x/S:.2f} {sg.c1.y/S:.2f} {sg.c2.x/S:.2f} {sg.c2.y/S:.2f}"
                      f" {sg.end_point.x/S:.2f} {sg.end_point.y/S:.2f}")
        if len(d) > 200:                   # skip potrace's frame curve
            out.append(d + " Z")
    return out

def poly_d(poly):
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in poly) + " Z"

def taper_line(p, q, w, n=80):
    (ax, ay), (bx, by) = p, q
    L = math.dist(p, q); nx, ny = -(by - ay) / L, (bx - ax) / L
    up, dn = [], []
    for k in range(n + 1):
        t = k / n; ww = w * (.25 + .75 * math.sin(math.pi * t) ** .4) / 2
        x, y = ax + (bx - ax) * t, ay + (by - ay) * t
        up.append((x + nx * ww, y + ny * ww)); dn.append((x - nx * ww, y - ny * ww))
    return up + dn[::-1]


def hamza_poly():
    """Hamza (ء) as one reed-pen stroke, centreline measured from the photo (crop px)."""
    segs = [((92, 23.5), (86, 31), (76, 42), (71, 52)),          # upper leaf, down-left
            ((71, 52), (69, 57), (74, 56.5), (80, 52)),            # sharp turn at the lower left
            ((80, 52), (88, 47.5), (100, 40), (107, 38.5)),        # broad band rising right
            ((107, 38.5), (112, 40), (108, 48), (99, 53)),         # turn down
            ((99, 53), (95, 56), (90, 60), (86, 62))]              # fine tail
    # width along each segment (start, end), crop px
    WID = [(1.3, 8.0), (8.0, 8.6), (9.4, 7.2), (7.2, 3.4), (3.4, 0.5)]
    segs = [tuple((x, y - 3) for x, y in sg) for sg in segs]
    pts = []
    for i, sg in enumerate(segs):
        for kq in range(41):
            if i and not kq:
                continue
            tq = kq / 40; u = 1 - tq
            pts.append(tuple(u**3*sg[0][j] + 3*u*u*tq*sg[1][j] + 3*u*tq*tq*sg[2][j] + tq**3*sg[3][j] for j in (0, 1)))
    L = [0.0]
    for p, q in zip(pts, pts[1:]):
        L.append(L[-1] + math.dist(p, q))
    up, dn = [], []
    for i, p in enumerate(pts):
        a, b = pts[max(i - 1, 0)], pts[min(i + 1, len(pts) - 1)]
        d = math.dist(a, b) or 1
        nx, ny = -(b[1] - a[1]) / d, (b[0] - a[0]) / d
        si, f = min(i // 40, 4), (i % 40) / 40 if i < 200 else 1.0
        w0, w1 = WID[si]
        e = math.sin(f * math.pi / 2) if si == 0 else f       # leaf swells fast from its point
        w = (w0 + (w1 - w0) * e) / 2
        up.append((p[0] + nx * w, p[1] + ny * w)); dn.append((p[0] - nx * w, p[1] - ny * w))
    return up + dn[::-1]

HAMZA_POLY = hamza_poly()

mark = [poly_d(rebuild_blade(BLADES[0], pointed=True)),
        poly_d(rebuild_blade(BLADES[1])),
        poly_d(rebuild_blade(BLADES[2]))]
mark += [poly_d(HAMZA_POLY)]

# (hamza is built above from its measured centreline)

# dots of ث: three equal squares stepping down corner to corner, threaded on the hairline
STEP = (15.5, 16.0)                     # measured step between dots in the photo
MID = (85.0, 121.0)                     # centre of the middle dot
SIDE = 16.0
for i in (-1, 0, 1):
    cx, cy = MID[0] + i * STEP[0], MID[1] + i * STEP[1]
    h = SIDE / 2
    mark.append(poly_d([(cx - h, cy - h), (cx + h, cy - h), (cx + h, cy + h), (cx - h, cy + h)]))
k = STEP[0] / STEP[1]                   # hairline runs through the dots' meeting corners
mark.append(poly_d(taper_line((MID[0] + (78 - MID[1]) * k, 78), (MID[0] + (170 - MID[1]) * k, 170), 1.7)))

# ------------------------------------------------------------------ lettering, level and centred
font = TTFont(FONT)
gs = font.getGlyphSet(); cmap = font.getBestCmap(); hmtx = font["hmtx"]
CAP = font["OS/2"].sCapHeight

def word_svg(text, cap_h, track, cx, base):
    s = cap_h / CAP
    adv = [hmtx[cmap[ord(ch)]][0] * s for ch in text]
    x = cx - (sum(adv) + track * (len(text) - 1)) / 2
    out, bp = [], BoundsPen(gs)
    for ch, a in zip(text, adv):
        gname = cmap[ord(ch)]
        tr = (s, 0, 0, -s, x, base)
        pen = SVGPathPen(gs)
        gs[gname].draw(TransformPen(pen, tr)); gs[gname].draw(TransformPen(bp, tr))
        out.append(pen.getCommands())
        x += a + track
    return out, bp.bounds

def path_bounds(ds):
    xs, ys = [], []
    for d in ds:
        nums = list(map(float, re.findall(r"-?\d+\.?\d*", d)))
        xs += nums[0::2]; ys += nums[1::2]
    return min(xs), min(ys), max(xs), max(ys)

MB = path_bounds(mark)
CX = (MB[0] + MB[2]) / 2
CAP1, CAP2 = 40, 24.5                  # cap heights measured in the photo
base1 = MB[3] + 26 + CAP1
t1, b1 = word_svg("ATHR", CAP1, 13, CX, base1)
t2, b2 = word_svg("A3R.ORG", CAP2, 8.6, CX, base1 + 14 + CAP2)

# ------------------------------------------------------------------ output
GRAD = ('<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#8A6A30"/><stop offset=".3" stop-color="#D3AF68"/>'
        '<stop offset=".5" stop-color="#F0DBA2"/><stop offset=".72" stop-color="#B8904A"/>'
        '<stop offset="1" stop-color="#8A6A30"/></linearGradient></defs>')
COLORS = {"gold": "#C6A15B", "gold-foil": "url(#g)", "black": "#0D0C0B", "white": "#FFFFFF"}

def svg(box, body, pad):
    bx0, by0, bx1, by1 = box
    bx0 -= pad; by0 -= pad; w = bx1 - bx0 + pad; h = by1 - by0 + pad
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{bx0:.1f} {by0:.1f} {w:.1f} {h:.1f}" '
            f'width="{w*3:.0f}" height="{h*3:.0f}">\n{body}\n</svg>\n')

def grp(paths, fill):
    return f'<g fill="{fill}">' + "".join(f'<path d="{d}"/>' for d in paths) + "</g>"

def write(name, s):
    with open(os.path.join(HERE, name), "w") as f:
        f.write(s)

VB = (min(MB[0], b1[0], b2[0]), MB[1], max(MB[2], b1[2], b2[2]), max(b1[3], b2[3]))
for cname, fill in COLORS.items():
    d = GRAD if fill.startswith("url") else ""
    write(f"athr-logo-vertical-{cname}.svg", svg(VB, d + grp(mark + t1 + t2, fill), 16))
    write(f"athr-mark-{cname}.svg", svg(MB, d + grp(mark, fill), 10))

if "--overlay" in sys.argv:            # mark over the photo crop, for checking the trace
    out = sys.argv[sys.argv.index("--overlay") + 1]
    w, h = x1 - x0, y1 - y0
    with open(out, "w") as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w*2}" height="{h*2}">'
                + grp(mark, "#ff2d55") + "</svg>")
print("mark bounds", [round(v, 1) for v in MB])
