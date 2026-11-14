# Athr (أثر) logo files

All SVGs are outlined vectors (no live text), safe to send to print.

| File | Use |
|---|---|
| `athr-logo-vertical-*` | The logo: mark with ATHR / A3R.ORG underneath (the only lockup) |
| `athr-mark-*` | Mark alone: card fronts, folder, favicon, social avatars |

Colours: `gold` #C6A15B (screens), `gold-foil` gradient (screens only, print uses real foil), `black` #0D0C0B, `white`.
PNG versions (transparent, 2000 px tall) are in `png/`.

The mark is traced from `source/approved-mockup.png` exactly as it sits on the paper; strokes are measured and rebuilt as smooth outlines, the dots and hairline are set on one line, and the lettering is level and centred underneath. Rebuild: `python3 build_logo.py JosefinSans-Regular.ttf` (needs `opencv-python-headless potracer numpy scipy fonttools`). Add `--overlay out.svg` to check the trace against the photo.
