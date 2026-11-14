# Athr (أثر) logo files

All SVGs are outlined vectors (no live text), safe to send to print.

| File | Use |
|---|---|
| `athr-logo-vertical-*` | The logo: mark with ATHR / A3R.ORG underneath (the only lockup) |
| `athr-mark-*` | Mark alone: card fronts, folder, favicon, social avatars |

Colours: `gold` #C6A15B (screens), `gold-foil` gradient (screens only, print uses real foil), `black` #0D0C0B, `white`.
PNG versions (transparent, 2000 px tall) are in `png/`.

Geometry is traced from the approved foil mockup photo and rotated upright. Rebuild: `python3 build_logo.py JosefinSans-Regular.ttf` (needs `fonttools`). Add `--overlay out.svg` to check the trace against the photo.
