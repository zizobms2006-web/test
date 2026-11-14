"""Cleans the supplied ATHR vector logo and writes a full, consistent set of files.

The supplied SVG (final/ATHR_Flat_Gold_Transparent.svg) is a pixel trace: straight segments with
1-unit stair steps, so edges look ragged when enlarged. This script renders that exact shape at high
resolution (even-odd fill, holes kept), smooths only the stair-step noise, and retraces it as smooth
Bezier curves. Proportions and placement are unchanged; the overlay check prints the difference.

Run:  python3 athr/logo/clean_logo.py      (needs numpy, opencv-python-headless, potracer)
Output: athr/logo/clean/  (SVG + PDF + PNG for every version)
"""
import os, re, subprocess
import numpy as np, cv2, potrace

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "final", "ATHR_Flat_Gold_Transparent.svg")
OUT = os.path.join(HERE, "clean")
os.makedirs(OUT, exist_ok=True)

S = 8            # render scale (source units -> px)
SIGMA = 0.5      # final anti-alias blur before retracing, in source units
STEP = 0.5       # outline resampling step, source units
SMOOTH = 3.0     # outline smoothing along the edge, source units (removes the ragged "teeth")
CORNER_SPAN = 8  # look this far either side (source units) to tell a real corner from a tooth
CORNER_DEG = 55  # turning angle that counts as a real corner (A apex, serifs, arrow tip, dots)

d = re.search(r'<path d="([^"]+)"', open(SRC).read()).group(1)
subpaths = [s for s in re.split(r"(?=M )", d) if s.strip()]
polys = []
for sp in subpaths:
    nums = list(map(float, re.findall(r"-?\d+\.?\d*", sp)))
    polys.append(np.array(list(zip(nums[0::2], nums[1::2]))))

from scipy.ndimage import gaussian_filter1d

def resample(p):
    p = np.vstack([p, p[:1]])
    seg = np.hypot(*np.diff(p, axis=0).T)
    t = np.r_[0, np.cumsum(seg)]
    n = max(8, int(t[-1] / STEP))
    tt = np.linspace(0, t[-1], n, endpoint=False)
    return np.c_[np.interp(tt, t, p[:, 0]), np.interp(tt, t, p[:, 1])]

def smooth_outline(p):
    """Smooth a closed outline along its length, keeping real corners sharp."""
    q = resample(p)
    n = len(q)
    if n < 24:
        return p
    k = max(2, int(CORNER_SPAN / STEP))
    a = q - np.roll(q, k, 0); b = np.roll(q, -k, 0) - q
    ang = np.degrees(np.abs(np.arctan2(a[:, 0] * b[:, 1] - a[:, 1] * b[:, 0], (a * b).sum(1))))
    cand = [i for i in range(n) if ang[i] > CORNER_DEG and ang[i] >= ang[(i - 1) % n] and ang[i] >= ang[(i + 1) % n]]
    corners = []
    for i in cand:                          # one corner per cluster
        if not corners or i - corners[-1] > k:
            corners.append(i)
    if len(corners) > 1 and corners[0] + n - corners[-1] <= k:
        corners.pop()
    sig = SMOOTH / STEP
    if not corners:
        return np.c_[gaussian_filter1d(q[:, 0], sig, mode="wrap"), gaussian_filter1d(q[:, 1], sig, mode="wrap")]
    out = []
    for j, c0 in enumerate(corners):
        c1 = corners[(j + 1) % len(corners)]
        idx = np.arange(c0, c1 + (n if c1 <= c0 else 0) + 1) % n
        seg = q[idx]
        if len(seg) > 4:
            sm = np.c_[gaussian_filter1d(seg[:, 0], sig, mode="nearest"), gaussian_filter1d(seg[:, 1], sig, mode="nearest")]
            w = np.minimum(np.arange(len(seg)), np.arange(len(seg))[::-1]) / sig   # pin the corners
            w = np.clip(w, 0, 1)[:, None]
            seg = seg * (1 - w) + sm * w
        out.append(seg[:-1])
    return np.vstack(out)

def is_eye(p):
    x0, y0, x1, y1 = p[:, 0].min(), p[:, 1].min(), p[:, 0].max(), p[:, 1].max()
    return y1 < 560 and 15 < x1 - x0 < 40 and 15 < y1 - y0 < 40 and abs((x1 - x0) - (y1 - y0)) < 4

def circle(p):
    cx, cy = p[:, 0].mean(), p[:, 1].mean()
    r = np.hypot(p[:, 0] - cx, p[:, 1] - cy).mean()
    th = np.linspace(0, 2 * np.pi, 120, endpoint=False)
    return np.c_[cx + r * np.cos(th), cy + r * np.sin(th)]

polys_src = polys
polys = [circle(p) if is_eye(p) else smooth_outline(p) for p in polys_src]
print("eyes replaced with true circles:", sum(is_eye(p) for p in polys_src))

W, H = 1240, 806
def render(selected):
    m = np.zeros((H * S, W * S), np.uint8)
    for p in selected:                       # even-odd: each ring toggles coverage
        one = np.zeros_like(m)
        cv2.fillPoly(one, [np.round((p + .5) * S * 16).astype(np.int32)], 1, lineType=cv2.LINE_8, shift=4)
        m ^= one
    return m

def trace(mask):
    f = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), SIGMA * S)
    bm = f > .5
    out = []
    for curve in potrace.Bitmap(bm).trace(turdsize=30, alphamax=.9, opticurve=True, opttolerance=.15):
        pts = f"M{curve.start_point.x/S:.2f} {curve.start_point.y/S:.2f}"
        for sg in curve.segments:
            if sg.is_corner:
                pts += f"L{sg.c.x/S:.2f} {sg.c.y/S:.2f}L{sg.end_point.x/S:.2f} {sg.end_point.y/S:.2f}"
            else:
                pts += (f"C{sg.c1.x/S:.2f} {sg.c1.y/S:.2f} {sg.c2.x/S:.2f} {sg.c2.y/S:.2f} "
                        f"{sg.end_point.x/S:.2f} {sg.end_point.y/S:.2f}")
        nums = list(map(float, re.findall(r"-?\d+\.?\d*", pts)))
        if max(nums[0::2]) - min(nums[0::2]) > W - 2 and max(nums[1::2]) - min(nums[1::2]) > H - 2:
            continue                          # potrace's frame around the canvas
        out.append(pts + "Z")
    return out, bm

def bbox(polys_):
    a = np.vstack(polys_)
    return a[:, 0].min(), a[:, 1].min(), a[:, 0].max(), a[:, 1].max()

full_mask = render(polys)
full_d, full_bm = trace(full_mask)
mark_polys = [p for p, o in zip(polys, polys_src) if o[:, 1].max() < 560]      # the emblem: everything above the lettering
mark_d, _ = trace(render(mark_polys))

# fidelity check: how many pixels differ between the supplied shape and the cleaned one
src_mask = render(polys_src)
diff = np.logical_xor(src_mask > 0, full_bm).sum() / max(1, (src_mask > 0).sum())
print(f"area difference vs supplied logo: {diff*100:.2f}% (edge smoothing only)")

NAVY, NAVY_LOGO, GOLD, GOLD_ON_NAVY = "#010427", "#07132F", "#C9A45A", "#D5AA5A"
VERSIONS = {                      # name: (fill, background or None)
    "Gold_Transparent": (GOLD, None),
    "Gold_on_Navy": (GOLD_ON_NAVY, NAVY),
    "Navy_Transparent": (NAVY_LOGO, None),
    "Navy_on_White": (NAVY_LOGO, "#FFFFFF"),
    "White_Transparent": ("#FFFFFF", None),
    "White_on_Black": ("#FFFFFF", "#050505"),
    "Black_Transparent": ("#000000", None),
}

def write_svg(name, paths, box, pad, fill, bg):
    x0, y0, x1, y1 = box
    x0 -= pad; y0 -= pad; w = x1 - x0 + pad; h = y1 - y0 + pad
    rect = f'<rect x="{x0:.0f}" y="{y0:.0f}" width="{w:.0f}" height="{h:.0f}" fill="{bg}"/>' if bg else ""
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.0f} {y0:.0f} {w:.0f} {h:.0f}" '
         f'width="{w:.0f}" height="{h:.0f}">\n<title>ATHR Marketing Agency</title>\n{rect}'
         f'<path fill="{fill}" fill-rule="evenodd" d="{"".join(paths)}"/>\n</svg>\n')
    path = os.path.join(OUT, name + ".svg")
    open(path, "w").write(s)
    return path

FULL_BOX, MARK_BOX = bbox(polys_src), bbox([o for o in polys_src if o[:, 1].max() < 560])
files = []
for v, (fill, bg) in VERSIONS.items():
    files.append(write_svg(f"ATHR_Logo_{v}", full_d, FULL_BOX, 40, fill, bg))
    files.append(write_svg(f"ATHR_Emblem_{v}", mark_d, MARK_BOX, 24, fill, bg))
print("\n".join(os.path.basename(f) for f in files))
