# Athr (أثر) logo files

Source: `source/athr-logo-final.webp` (the approved logo, supplied by the client).
All SVGs are outlined vectors traced from it, safe to send to print.

| File | Use |
|---|---|
| `athr-logo-*` | The logo: mark with ATHR / A3R.ORG underneath |
| `athr-mark-*` | Mark alone: card fronts, folder, social avatars, favicon |

Colours: `gold` #E2B24E (single flat colour), `gold-gradient` (screens only; print uses gold foil), `black` #0D0C0B, `white`.
`png/` holds PNGs with transparent backgrounds, including `athr-logo-original-gold.png` (the supplied artwork with its gradient, trimmed).

Rebuild: `python3 vectorize.py` (needs `pillow numpy opencv-python-headless potracer`).
`old/` keeps the earlier trace script for reference.
