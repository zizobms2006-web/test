# ATHR print files

All PDFs are vector, with **3 mm bleed** on every side. Keep text and logos inside the trim; the navy and gold bands run into the bleed on purpose.

| File | Trim size | Notes |
|---|---|---|
| `out/ATHR_BusinessCard_85x55_bleed3mm.pdf` | 85 × 55 mm (file 91 × 61) | Page 1 front (navy, gold emblem), page 2 back (white) |
| `out/ATHR_BusinessCard_Front_FOIL.pdf` | 85 × 55 mm (file 91 × 61) | Foil plate for the front emblem: black = gold hot-foil |
| `out/ATHR_Letterhead_A4_bleed3mm.pdf` | 210 × 297 mm (file 216 × 303) | For the printer |
| `out/ATHR_Letterhead_A4_Word.docx` | A4 | Typing template: the design sits behind the text |

Colours: navy #010427, gold #C9A45A (on navy #D5AA5A). Rebuild: `node athr/print/build.js` then `python3 athr/print/make_docx.py`.
