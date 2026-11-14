# ATHR Marketing Agency — logo files

**Use `clean/`.** It is the client's approved logo with the tracing artefacts removed: the ragged
stair-step edges are smoothed into curves, the eye is a true circle, and corners (A apex, serifs,
arrow tip, the stepped dots) stay sharp. Shape and proportions are unchanged (≈1% area difference,
all at the edges). `ATHR_Logo_Files.zip` bundles the whole folder.

| Version | Logo (with ATHR / Marketing Agency) | Emblem only |
|---|---|---|
| Gold, transparent | `ATHR_Logo_Gold_Transparent` | `ATHR_Emblem_Gold_Transparent` |
| Gold on royal navy #010427 | `ATHR_Logo_Gold_on_Navy` | `ATHR_Emblem_Gold_on_Navy` |
| Navy, transparent | `ATHR_Logo_Navy_Transparent` | `ATHR_Emblem_Navy_Transparent` |
| Navy on white | `ATHR_Logo_Navy_on_White` | `ATHR_Emblem_Navy_on_White` |
| White, transparent | `ATHR_Logo_White_Transparent` | `ATHR_Emblem_White_Transparent` |
| White on black | `ATHR_Logo_White_on_Black` | `ATHR_Emblem_White_on_Black` |
| Black, transparent (stamps, one-colour, foil plates) | `ATHR_Logo_Black_Transparent` | `ATHR_Emblem_Black_Transparent` |

Each exists as `.svg` (master), `pdf/*.pdf` (vector, opens in Illustrator; save as .ai/.eps from there)
and `png/*.png` (2000 px tall). Gold #C9A45A, gold on navy #D5AA5A, navy #07132F.

Rebuild: `python3 athr/logo/clean_logo.py` (needs numpy, scipy, opencv-python-headless, potracer).
`final/` keeps the files as supplied; `old/` keeps earlier explorations.
