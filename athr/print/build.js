// Builds print-ready PDFs for the ATHR business card and A4 letterhead.
// Every PDF carries 3 mm bleed on all sides; the trim size is noted per file.
// Run: node athr/print/build.js   (needs Playwright + network for Google Fonts)
const { chromium, fs, path, OUT, LOCKUP, EMBLEM, NAVY, GOLD, GOLD_ON_NAVY, INK, MUTE, BLEED, CONTACT, svg, ICON, BASE } = require('./common');
const CW = 85, CH = 55;
const cardFront = (foilOnly = false) => `
<div class="page" style="width:${CW + 2 * BLEED}mm;height:${CH + 2 * BLEED}mm;background:${foilOnly ? '#fff' : NAVY}">
  <div class="trim" style="display:grid;place-items:center">
    ${svg(EMBLEM, foilOnly ? '#000' : GOLD_ON_NAVY, 'width:44mm;margin-top:-1mm')}
  </div>
</div>`;

const cardBack = () => `
<div class="page" style="width:${CW + 2 * BLEED}mm;height:${CH + 2 * BLEED}mm;background:#fff;direction:rtl">
  <div style="position:absolute;inset:auto 0 0 0;height:${BLEED + 4}mm;background:${NAVY}"></div>
  <div style="position:absolute;inset:auto 0 ${BLEED + 4}mm 0;height:.35mm;background:${GOLD}"></div>
  <div class="trim">
    <div style="position:absolute;top:0;bottom:4mm;right:5.5mm;width:41mm;display:flex;flex-direction:column;justify-content:center;gap:2.1mm;font-size:6.4pt;line-height:1.4">
      <div class="lat" style="text-align:right;font-weight:600;font-size:11pt;letter-spacing:.03em;color:${NAVY};line-height:1.1">Dr. Khadija</div>
      <div style="width:10mm;height:.3mm;background:${GOLD};margin:.6mm 0 1mm"></div>
      <div style="display:flex;gap:1.8mm;align-items:center">${ICON.phone(GOLD)}<span class="lat" style="font-size:7.2pt;letter-spacing:.03em;color:${NAVY}">${CONTACT.phone}</span></div>
      <div style="display:flex;gap:1.8mm;align-items:center">${ICON.web(GOLD)}${CONTACT.website
        ? `<span class="lat" style="font-size:7pt;color:${NAVY}">${CONTACT.website}</span>`
        : `<span style="width:28mm;height:.2mm;border-bottom:.25mm dotted #B9BCCB;align-self:center"></span>`}</div>
      <div style="display:flex;gap:1.8mm;align-items:flex-start">${ICON.pin(GOLD)}<span style="white-space:nowrap">الدقادوستا<br>خلف مصحة بنغازي التخصصي<br>بنغازي – ليبيا</span></div>
    </div>
    <div style="position:absolute;top:9mm;bottom:13mm;left:43.5mm;width:.25mm;background:${GOLD};opacity:.7"></div>
    <div style="position:absolute;top:0;bottom:4mm;left:5mm;width:34mm;display:grid;place-items:center">${svg(LOCKUP, NAVY, 'width:100%;display:block')}</div>
  </div>
</div>`;

// ------------------------------------------------------------------ letterhead A4 210 × 297 mm
const AW = 210, AH = 297;
const letterhead = () => `
<div class="page" style="width:${AW + 2 * BLEED}mm;height:${AH + 2 * BLEED}mm;background:#fff;direction:rtl">
  <!-- watermark -->
  <div style="position:absolute;left:-18mm;bottom:28mm;width:140mm;opacity:.03">${svg(EMBLEM, NAVY, 'width:100%;display:block')}</div>
  <!-- footer band, bleeds off three edges -->
  <div style="position:absolute;inset:auto 0 0 0;height:${BLEED + 17}mm;background:${NAVY}"></div>
  <div style="position:absolute;inset:auto 0 ${BLEED + 17}mm 0;height:.5mm;background:${GOLD}"></div>
  <div class="trim">
    <!-- header -->
    <div style="position:absolute;top:14mm;right:18mm;left:18mm;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="width:52mm">${svg(LOCKUP, NAVY, 'width:100%;display:block')}</div>
      <div style="display:grid;gap:3mm;font-size:8.5pt;color:${MUTE};min-width:52mm">
        <div style="display:flex;gap:2mm;align-items:baseline"><span>الرقم:</span><span style="flex:1;border-bottom:.25mm solid #C9CCD8"></span></div>
        <div style="display:flex;gap:2mm;align-items:baseline"><span>التاريخ:</span><span style="flex:1;border-bottom:.25mm solid #C9CCD8"></span></div>
      </div>
    </div>
    <div style="position:absolute;top:50mm;right:18mm;left:18mm;height:.35mm;background:linear-gradient(to left,${GOLD},${GOLD} 30%,rgba(201,164,90,.15))"></div>
    <!-- footer content, sits on the navy band -->
    <div style="position:absolute;bottom:0;right:18mm;left:18mm;height:17mm;display:flex;align-items:center;justify-content:space-between;color:#E8E6EF;font-size:8pt">
      <div style="display:flex;gap:2mm;align-items:center">${ICON.pin(GOLD_ON_NAVY)}<span>${CONTACT.addrAr[0]}، ${CONTACT.addrAr[1]}</span></div>
      <div style="display:flex;gap:2mm;align-items:center">${ICON.phone(GOLD_ON_NAVY)}<span class="lat" style="font-size:9pt;letter-spacing:.05em">${CONTACT.phone}</span></div>
    </div>
  </div>
</div>`;

const doc = body => `<!doctype html><html lang="ar"><head><meta charset="utf-8">${BASE}</head><body>${body}</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const make = async (file, body, wmm, hmm) => {
    await p.setContent(doc(body), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: path.join(OUT, file), width: `${wmm}mm`, height: `${hmm}mm`, printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  };
  await make('ATHR_BusinessCard_DrKhadija_85x55_bleed3mm.pdf', cardFront() + cardBack(), CW + 6, CH + 6);
  await make('ATHR_BusinessCard_Front_FOIL.pdf', cardFront(true), CW + 6, CH + 6);
  await make('ATHR_Letterhead_A4_bleed3mm.pdf', letterhead(), AW + 6, AH + 6);

  // previews (trim only, no bleed) for checking and for the client
  const shot = async (body, wmm, hmm, file) => {
    const px = mm => Math.round(mm / 25.4 * 96);
    await p.setViewportSize({ width: px(wmm), height: px(hmm) });
    await p.setContent(doc(`<div style="margin:-${BLEED}mm">${body}</div>`), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(OUT, file), clip: { x: 0, y: 0, width: px(wmm), height: px(hmm) }, scale: 'device' });
  };
  const p2 = await b.newPage({ deviceScaleFactor: 4 });
  const shoot = async (body, wmm, hmm, file) => {
    const px = mm => Math.round(mm / 25.4 * 96);
    await p2.setViewportSize({ width: px(wmm), height: px(hmm) });
    await p2.setContent(doc(`<div style="margin:-${BLEED}mm">${body}</div>`), { waitUntil: 'networkidle' });
    await p2.evaluate(() => document.fonts.ready);
    await p2.screenshot({ path: path.join(OUT, file) });
  };
  await shoot(cardFront(), CW, CH, 'preview_card_front.png');
  await shoot(cardBack(), CW, CH, 'preview_card_back.png');
  const p3 = await b.newPage({ deviceScaleFactor: 3 });
  {
    const px = mm => Math.round(mm / 25.4 * 96);
    await p3.setViewportSize({ width: px(AW), height: px(AH) });
    await p3.setContent(doc(`<div style="margin:-${BLEED}mm">${letterhead()}</div>`), { waitUntil: 'networkidle' });
    await p3.evaluate(() => document.fonts.ready);
    await p3.screenshot({ path: path.join(OUT, 'preview_letterhead.png') });
  }
  await b.close();
  console.log('done');
})();
