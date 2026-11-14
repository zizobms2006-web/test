# ATHR print files

All PDFs are vector, with **3 mm bleed** on every side. Keep text and logos inside the trim; the navy and gold bands run into the bleed on purpose.

| File | Trim size | Notes |
|---|---|---|
| `out/ATHR_BusinessCard_DrKhadija_85x55_bleed3mm.pdf` | 85 × 55 mm (file 91 × 61) | Page 1 front (navy, gold emblem), page 2 back (Dr. Khadija). The website row shows a dotted placeholder until `CONTACT.website` is set in `common.js` |
| `out/ATHR_BusinessCard_Front_FOIL.pdf` | 85 × 55 mm (file 91 × 61) | Foil plate for the front emblem: black = gold hot-foil |
| `out/ATHR_Letterhead_A4_bleed3mm.pdf` | 210 × 297 mm (file 216 × 303) | For the printer |
| `out/ATHR_Letterhead_A4_Word.docx` | A4 | Typing template: the design sits behind the text |

Colours: navy #010427, gold #C9A45A (on navy #D5AA5A). Rebuild: `node athr/print/build.js` then `python3 athr/print/make_docx.py`.

## Envelopes and folder (`node athr/print/build2.js`)

| File | Trim size | Notes |
|---|---|---|
| `out/ATHR_Envelope_C4_324x229_bleed3mm.pdf` | 324 × 229 mm | For A4 flat. Page 1 front (address side), page 2 back (flap side). Navy all over: needs custom-made envelopes printed flat, or navy stock envelopes with gold foil only |
| `out/ATHR_Envelope_C5_229x162_bleed3mm.pdf` | 229 × 162 mm | For A5 flat or A4 folded once. White with a gold edge stripe |
| `out/ATHR_Folder_A4_Outside_bleed3mm.pdf` | flat 452 × 410 mm, closed 220 × 310 mm | Outside sheet: back cover, front cover, pocket face (printed 180°) |
| `out/ATHR_Folder_A4_Inside_bleed3mm.pdf` | same | Inside sheet, mirrored to the outside |
| `out/ATHR_Folder_A4_Dieline.pdf` | same | Cut (magenta), folds (cyan dashed), card slits; outside view |

Folder: single pocket 100 mm deep on the inside right, two glue flaps, slits for an 85 × 55 mm card. Opens left-to-right (front cover on the right of the outside sheet).
