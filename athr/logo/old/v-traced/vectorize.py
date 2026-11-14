"""Vectorises the supplied Athr logo (source/athr-logo-final.webp, transparent) into outlined SVGs.

Run: python3 vectorize.py   (needs pillow, numpy, opencv-python-headless, potracer)
"""
import os, numpy as np, cv2, potrace
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
src = Image.open(os.path.join(HERE, "source", "athr-logo-final.webp")).convert("RGBA")
a = np.asarray(src)
al = a[..., 3]
ys, xs = np.nonzero(al > 20)
x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

# 1) gold PNG exactly as supplied, trimmed with a small margin
pad = 24
crop = src.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))
ca = np.asarray(crop).copy()
ca[..., 3] = np.where(ca[..., 3] < 60, 0, ca[..., 3])       # drop the faint haze around the strokes
crop = Image.fromarray(ca)
os.makedirs(os.path.join(HERE, "png"), exist_ok=True)
crop.save(os.path.join(HERE, "png", "athr-logo-original-gold.png"))

# 2) outline trace of the shape (alpha), upscaled for smooth curves
S = 4
m = np.asarray(crop)[..., 3].astype(np.float32) / 255
m = cv2.resize(m, None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC)
m = cv2.GaussianBlur(m, (0, 0), 1.2)
bm = m > .5
def trace(bm):
  paths = []
  for curve in potrace.Bitmap(bm).trace(turdsize=20, alphamax=1.0, opticurve=True, opttolerance=.2):
    d = f"M{curve.start_point.x/S:.2f} {curve.start_point.y/S:.2f}"
    for sg in curve.segments:
        if sg.is_corner:
            d += f"L{sg.c.x/S:.2f} {sg.c.y/S:.2f}L{sg.end_point.x/S:.2f} {sg.end_point.y/S:.2f}"
        else:
            d += f"C{sg.c1.x/S:.2f} {sg.c1.y/S:.2f} {sg.c2.x/S:.2f} {sg.c2.y/S:.2f} {sg.end_point.x/S:.2f} {sg.end_point.y/S:.2f}"
    import re as _re
    nums = list(map(float, _re.findall(r"-?\d+\.?\d*", d)))
    if max(nums[0::2]) - min(nums[0::2]) > bm.shape[1] / S - 2 and max(nums[1::2]) - min(nums[1::2]) > bm.shape[0] / S - 2:
        continue                                 # potrace's frame around the image
    paths.append(d + "Z")
  return paths

# mark only: drop the lettering (components that start below the mark)
n, lab, st, _ = cv2.connectedComponentsWithStats(bm.astype(np.uint8))
TEXT_TOP = 600 * S                       # crop px: lettering starts lower than this
mark_bm = np.isin(lab, [i for i in range(1, n) if st[i][1] < TEXT_TOP])
mys, mxs = np.nonzero(mark_bm)
MB = (mxs.min() / S - 12, mys.min() / S - 12, mxs.max() / S + 12, mys.max() / S + 12)
mark_paths = trace(mark_bm)
paths = trace(bm)
W, H = crop.size
body = '<path fill-rule="evenodd" d="' + "".join(paths) + '"/>'
GRAD = ('<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#C9962F"/><stop offset=".35" stop-color="#F6D27A"/>'
        '<stop offset=".55" stop-color="#E0AE4A"/><stop offset=".8" stop-color="#FBE08F"/>'
        '<stop offset="1" stop-color="#C9962F"/></linearGradient></defs>')
for name, fill in {"gold": "#E2B24E", "gold-gradient": "url(#g)", "black": "#0D0C0B", "white": "#FFFFFF"}.items():
    defs = GRAD if fill.startswith("url") else ""
    with open(os.path.join(HERE, f"athr-logo-{name}.svg"), "w") as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{defs}'
                f'<g fill="{fill}">{body}</g></svg>\n')
    mw, mh = MB[2] - MB[0], MB[3] - MB[1]
    with open(os.path.join(HERE, f"athr-mark-{name}.svg"), "w") as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{MB[0]:.1f} {MB[1]:.1f} {mw:.1f} {mh:.1f}" '
                f'width="{mw:.0f}" height="{mh:.0f}">{defs}<g fill="{fill}"><path fill-rule="evenodd" d="'
                + "".join(mark_paths) + '"/></g></svg>\n')
print(W, H, len(paths), "paths; crop origin", x0 - pad, y0 - pad)
