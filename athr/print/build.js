// Builds print-ready PDFs for the ATHR business card and A4 letterhead.
// Every PDF carries 3 mm bleed on all sides; the trim size is noted per file.
// Run: node athr/print/build.js   (needs Playwright + network for Google Fonts)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const OUT = path.join(HERE, 'out');
fs.mkdirSync(OUT, { recursive: true });
const LOGO = path.join(HERE, '..', 'logo', 'final');

const pathOf = f => {
  const t = fs.readFileSync(path.join(LOGO, f), 'utf8');
  return { d: t.match(/<path d="([^"]+)"/)[1], vb: t.match(/viewBox="([^"]+)"/)[1] };
};
const LOCKUP = pathOf('ATHR_Flat_Gold_Transparent.svg');
const EMBLEM = pathOf('ATHR_Emblem_Icon_Gold.svg');
// trim the lockup's empty margin (its artwork spans x 20–1219, y 20–785)
LOCKUP.vb = '14 14 1212 778';

const NAVY = '#010427', GOLD = '#C9A45A', GOLD_ON_NAVY = '#D5AA5A', INK = '#1B1F3A', MUTE = '#6B6F86';
const BLEED = 3;

const CONTACT = {
  phone: '094 521 1112',
  phoneIntl: '+218 94 521 1112',
  addrAr: ['الدقادوستا، خلف مصحة بنغازي التخصصي', 'بنغازي – ليبيا'],
  addrEn: 'Al-Daqadosta, behind Benghazi Specialized Clinic, Benghazi – Libya',
};

const svg = (logo, fill, style = '') =>
  `<svg viewBox="${logo.vb}" style="${style}" xmlns="http://www.w3.org/2000/svg"><path fill="${fill}" fill-rule="evenodd" d="${logo.d}"/></svg>`;

const ICON = {
  phone: c => `<svg viewBox="0 0 24 24" class="ic"><path fill="${c}" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>`,
  pin: c => `<svg viewBox="0 0 24 24" class="ic"><path fill="${c}" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>`,
};

const BASE = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Cinzel:wght@500&family=Josefin+Sans:wght@400;600&display=swap">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:"IBM Plex Sans Arabic",Tahoma,sans-serif;color:${INK}}
.page{position:relative;overflow:hidden;break-after:page}
.page:last-child{break-after:auto}
.trim{position:absolute;inset:${BLEED}mm}
.ic{width:1em;height:1em;flex:none}
.lat{font-family:"Josefin Sans",sans-serif;direction:ltr;unicode-bidi:isolate}
</style>`;

// ------------------------------------------------------------------ business card 85 × 55 mm
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
    <div style="position:absolute;top:0;bottom:4mm;right:5.5mm;width:40mm;display:flex;flex-direction:column;justify-content:center;gap:3.2mm;font-size:6.6pt;line-height:1.45">
      <div style="display:flex;gap:1.8mm;align-items:center">${ICON.phone(GOLD)}<span class="lat" style="font-size:7.6pt;letter-spacing:.04em;color:${NAVY}">${CONTACT.phone}</span></div>
      <div style="display:flex;gap:1.8mm;align-items:flex-start">${ICON.pin(GOLD)}<span style="white-space:nowrap">الدقادوستا<br>خلف مصحة بنغازي التخصصي<br>بنغازي – ليبيا</span></div>
    </div>
    <div style="position:absolute;top:11mm;bottom:15mm;left:43.5mm;width:.25mm;background:${GOLD};opacity:.7"></div>
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
  await make('ATHR_BusinessCard_85x55_bleed3mm.pdf', cardFront() + cardBack(), CW + 6, CH + 6);
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
