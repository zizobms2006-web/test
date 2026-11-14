// Builds print-ready PDFs for the ATHR envelopes (C4 for A4, C5 for A5) and the A4 presentation folder.
// Envelope files: front + back face artwork, 3 mm bleed. Folder: outside sheet, inside sheet and a dieline.
// Run: node athr/print/build2.js
const { chromium, fs, path, OUT, LOCKUP, EMBLEM, NAVY, GOLD, GOLD_ON_NAVY, INK, MUTE, BLEED, CONTACT, svg, ICON, BASE } = require('./common');

const B = BLEED;
const doc = body => `<!doctype html><html lang="ar"><head><meta charset="utf-8">${BASE}</head><body>${body}</body></html>`;
const page = (w, h, bg, inner, extra = '') =>
  `<div class="page" style="width:${w + 2 * B}mm;height:${h + 2 * B}mm;background:${bg};direction:rtl">${extra}<div class="trim">${inner}</div></div>`;

const recipient = (color, line, w) => `
  <div style="display:grid;gap:7mm;width:${w}mm">
    <div style="font-size:10pt;color:${color};font-weight:500">إلى:</div>
    <div style="height:.3mm;background:${line}"></div>
    <div style="height:.3mm;background:${line}"></div>
    <div style="height:.3mm;background:${line}"></div>
  </div>`;

const returnAddr = (color, accent, size) => `
  <div style="display:grid;gap:1.4mm;font-size:${size}pt;line-height:1.5;color:${color}">
    <div style="display:flex;gap:1.6mm;align-items:center">${ICON.pin(accent)}<span>${CONTACT.addrAr[0]}، ${CONTACT.addrAr[1]}</span></div>
    <div style="display:flex;gap:1.6mm;align-items:center">${ICON.phone(accent)}<span class="lat" style="letter-spacing:.04em">${CONTACT.phone}</span></div>
  </div>`;

// ------------------------------------------------------------------ C4 envelope 324 × 229 mm (holds A4 flat)
const C4W = 324, C4H = 229;
const c4Front = () => page(C4W, C4H, NAVY, `
  <div style="position:absolute;top:16mm;right:18mm;width:72mm">${svg(LOCKUP, GOLD_ON_NAVY, 'width:100%;display:block')}</div>
  <div style="position:absolute;top:70mm;right:18mm">${returnAddr('#D9D7E4', GOLD_ON_NAVY, 8.5)}</div>
  <div style="position:absolute;left:30mm;bottom:40mm">${recipient(GOLD_ON_NAVY, 'rgba(213,170,90,.45)', 120)}</div>
  <div style="position:absolute;left:0;right:0;bottom:12mm;height:.4mm;background:${GOLD_ON_NAVY};opacity:.8"></div>`,
  `<div style="position:absolute;right:-40mm;bottom:-30mm;width:220mm;opacity:.06">${svg(EMBLEM, GOLD_ON_NAVY, 'width:100%;display:block')}</div>`);
const c4Back = () => page(C4W, C4H, NAVY, `
  <div style="position:absolute;top:22mm;left:50%;transform:translateX(-50%);width:62mm">${svg(EMBLEM, GOLD_ON_NAVY, 'width:100%;display:block')}</div>`);

// ------------------------------------------------------------------ C5 envelope 229 × 162 mm (holds A5 flat, A4 folded once)
const C5W = 229, C5H = 162;
const c5Front = () => page(C5W, C5H, '#fff', `
  <div style="position:absolute;top:12mm;right:16mm;width:50mm">${svg(LOCKUP, NAVY, 'width:100%;display:block')}</div>
  <div style="position:absolute;top:50mm;right:16mm">${returnAddr(INK, GOLD, 7.5)}</div>
  <div style="position:absolute;left:20mm;bottom:26mm">${recipient(NAVY, '#C9CCD8', 95)}</div>`,
  `<div style="position:absolute;top:0;bottom:0;right:0;width:${B + 5}mm;background:${GOLD}"></div>
   <div style="position:absolute;top:0;bottom:0;right:${B + 5}mm;width:1.2mm;background:${NAVY}"></div>`);
const c5Back = () => page(C5W, C5H, '#fff', `
  <div style="position:absolute;top:15mm;left:50%;transform:translateX(-50%);width:40mm">${svg(EMBLEM, GOLD, 'width:100%;display:block')}</div>`,
  `<div style="position:absolute;top:0;bottom:0;left:0;width:${B + 5}mm;background:${GOLD}"></div>
   <div style="position:absolute;top:0;bottom:0;left:${B + 5}mm;width:1.2mm;background:${NAVY}"></div>`);

// ------------------------------------------------------------------ presentation folder, A4, 220 × 310 mm closed
// Flat sheet, seen from the OUTSIDE (x right, y down, mm):
//   back cover  x 12–232, y 0–310      front cover x 232–452, y 0–310
//   pocket      x 12–232, y 310–410 (hangs under the back cover, folds up inside)
//   glue flaps  x 0–12 and x 232–244, y 312–408
// Seen from the inside the sheet is mirrored: X = 452 − x.
// A point (u, v) on the folded pocket face (u from the pocket's left, v from its top edge) sits at
// x = 232 − u, y = 410 − v on the outside sheet, i.e. the pocket artwork is printed rotated 180°.
const FW = 452, FH = 410;
const PKT = { u0: 0, w: 220, h: 100 };
const SLITS = [[16, 24, 28, 12], [101, 79, 113, 67]];      // card slots, pocket coords (u1,v1,u2,v2)
const card = { u: 22, v: 18, w: 85, h: 55 };

const abs = (x, y, w, h, inner, style = '') =>
  `<div style="position:absolute;left:${x}mm;top:${y}mm;width:${w}mm;height:${h}mm;${style}">${inner}</div>`;

const folderOutside = () => {
  const front = abs(232, 0, 220, 310, `
    <div style="position:absolute;right:-60mm;bottom:-95mm;width:250mm;opacity:.06">${svg(EMBLEM, GOLD_ON_NAVY, 'width:100%;display:block')}</div>
    <div style="position:absolute;top:96mm;left:50%;transform:translateX(-50%);width:130mm">${svg(LOCKUP, GOLD_ON_NAVY, 'width:100%;display:block')}</div>
    <div style="position:absolute;left:0;right:0;bottom:22mm;height:.4mm;background:${GOLD_ON_NAVY};opacity:.7"></div>`);
  const back = abs(12, 0, 220, 310, `
    <div style="position:absolute;top:200mm;left:50%;transform:translateX(-50%);width:38mm">${svg(EMBLEM, GOLD_ON_NAVY, 'width:100%;display:block')}</div>
    <div style="position:absolute;top:240mm;left:0;right:0;display:grid;justify-items:center;direction:rtl">${returnAddr('#D9D7E4', GOLD_ON_NAVY, 8)}</div>
    <div style="position:absolute;left:0;right:0;bottom:22mm;height:.4mm;background:${GOLD_ON_NAVY};opacity:.7"></div>`);
  // pocket face, laid out in folded (u, v) coordinates then turned 180° into place
  const pocket = abs(12, 310, 220, 100, `
    <div style="position:absolute;inset:0;transform:rotate(180deg)">
      <div style="position:absolute;left:0;right:0;top:4mm;height:.5mm;background:${GOLD_ON_NAVY}"></div>
      <div style="position:absolute;right:14mm;bottom:14mm;width:44mm">${svg(LOCKUP, GOLD_ON_NAVY, 'width:100%;display:block')}</div>
    </div>`);
  return `<div class="page" style="width:${FW + 2 * B}mm;height:${FH + 2 * B}mm;background:${NAVY}">
    <div class="trim">${front}${back}${pocket}</div></div>`;
};

const folderInside = () => {
  // inside view: inside-left X 0–220 (behind the front cover), inside-right X 220–440 (behind the back cover)
  const left = abs(0, 0, 220, 310, `
    <div style="position:absolute;inset:0;overflow:hidden">
      <div style="position:absolute;left:-40mm;top:60mm;width:240mm;opacity:.05">${svg(EMBLEM, GOLD_ON_NAVY, 'width:100%;display:block')}</div>
    </div>`);
  return `<div class="page" style="width:${FW + 2 * B}mm;height:${FH + 2 * B}mm;background:${NAVY}">
    <div class="trim">${left}</div></div>`;
};

// dieline, outside view: magenta solid = cut, cyan dashed = fold, magenta short lines = card slits
const dielineSVG = (withArt) => {
  const cut = 'M12 0 H452 V310 H232 V312 L244 318 V402 L232 408 V410 H12 V408 L0 402 V318 L12 312 Z';
  const folds = [[232, 0, 232, 310], [12, 310, 232, 310], [12, 312, 12, 408], [232, 312, 232, 408]];
  const slits = SLITS.map(([u1, v1, u2, v2]) => [232 - u1, 410 - v1, 232 - u2, 410 - v2]);
  const cardRect = { x: 232 - (card.u + card.w), y: 410 - (card.v + card.h) };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-B} ${-B} ${FW + 2 * B} ${FH + 2 * B}" style="position:absolute;inset:0;width:100%;height:100%">
    ${withArt ? '' : `<rect x="${-B}" y="${-B}" width="${FW + 2 * B}" height="${FH + 2 * B}" fill="#fff"/>`}
    <path d="${cut}" fill="none" stroke="#EC008C" stroke-width=".35"/>
    ${folds.map(([a, b, c, d]) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#00AEEF" stroke-width=".35" stroke-dasharray="3 2"/>`).join('')}
    ${slits.map(([a, b, c, d]) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#EC008C" stroke-width=".35"/>`).join('')}
    ${withArt ? '' : `<rect x="${cardRect.x}" y="${cardRect.y}" width="${card.w}" height="${card.h}" fill="none" stroke="#999" stroke-width=".2" stroke-dasharray="1 1"/>
    <g font-family="Josefin Sans, sans-serif" font-size="6" fill="#555">
      <text x="342" y="160" text-anchor="middle">FRONT COVER</text><text x="122" y="160" text-anchor="middle">BACK COVER</text>
      <text x="122" y="395" text-anchor="middle">POCKET (printed 180°, folds up inside)</text>
      <text x="6" y="300" font-size="4">GLUE</text>
      <text x="340" y="390" text-anchor="middle" font-size="5">— cut (magenta) · fold (cyan dashed) · outside view · 3 mm bleed —</text>
    </g>`}
  </svg>`;
};
const folderDieline = () => `<div class="page" style="position:relative;width:${FW + 2 * B}mm;height:${FH + 2 * B}mm">${dielineSVG(false)}</div>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const make = async (file, body, w, h) => {
    await p.setContent(doc(body), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: path.join(OUT, file), width: `${w + 2 * B}mm`, height: `${h + 2 * B}mm`, printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  };
  await make('ATHR_Envelope_C4_324x229_bleed3mm.pdf', c4Front() + c4Back(), C4W, C4H);
  await make('ATHR_Envelope_C5_229x162_bleed3mm.pdf', c5Front() + c5Back(), C5W, C5H);
  await make('ATHR_Folder_A4_Outside_bleed3mm.pdf', folderOutside(), FW, FH);
  await make('ATHR_Folder_A4_Inside_bleed3mm.pdf', folderInside(), FW, FH);
  await make('ATHR_Folder_A4_Dieline.pdf', folderDieline(), FW, FH);

  // previews (trim only) + a folder proof with the dieline over the artwork
  const px = mm => Math.round(mm / 25.4 * 96);
  const shot = async (body, w, h, file, scale = 2, keepBleed = false) => {
    const q = await b.newPage({ deviceScaleFactor: scale });
    const ww = keepBleed ? w + 2 * B : w, hh = keepBleed ? h + 2 * B : h;
    await q.setViewportSize({ width: px(ww), height: px(hh) });
    await q.setContent(doc(keepBleed ? body : `<div style="margin:-${B}mm">${body}</div>`), { waitUntil: 'networkidle' });
    await q.evaluate(() => document.fonts.ready);
    await q.screenshot({ path: path.join(OUT, file) });
    await q.close();
  };
  await shot(c4Front(), C4W, C4H, 'preview_envelope_C4_front.png');
  await shot(c4Back(), C4W, C4H, 'preview_envelope_C4_back.png');
  await shot(c5Front(), C5W, C5H, 'preview_envelope_C5_front.png');
  await shot(c5Back(), C5W, C5H, 'preview_envelope_C5_back.png');
  const outsideProof = folderOutside().replace('<div class="trim">', `${dielineSVG(true)}<div class="trim">`);
  await shot(outsideProof, FW, FH, 'preview_folder_outside_with_dieline.png', 1.5, true);
  await shot(folderDieline(), FW, FH, 'preview_folder_dieline.png', 1.5, true);
  await b.close();
  console.log('done');
})();
