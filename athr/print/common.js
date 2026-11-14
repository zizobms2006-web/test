// Shared brand assets and helpers for the ATHR print scripts.
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
  phone: '+218 94 521 1112',
  phoneLocal: '094 521 1112',
  website: '',            // fill in when the domain is confirmed; the card keeps a line for it
  addrAr: ['الدقادوستا، خلف مصحة بنغازي التخصصي', 'بنغازي – ليبيا'],
  addrEn: 'Al-Daqadosta, behind Benghazi Specialized Clinic, Benghazi – Libya',
};

const svg = (logo, fill, style = '') =>
  `<svg viewBox="${logo.vb}" style="${style}" xmlns="http://www.w3.org/2000/svg"><path fill="${fill}" fill-rule="evenodd" d="${logo.d}"/></svg>`;

const ICON = {
  phone: c => `<svg viewBox="0 0 24 24" class="ic"><path fill="${c}" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>`,
  web: c => `<svg viewBox="0 0 24 24" class="ic"><path fill="${c}" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-3a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4.04c.8 1.2 1.5 2.5 1.9 3.96h-3.8c.4-1.4 1.1-2.8 1.9-3.96zM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4zm.8 2h3a15.7 15.7 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16zm3-8h-3a8 8 0 0 1 4.3-3.6C8.6 5.5 8.1 6.7 8.1 8zM12 19.96c-.8-1.2-1.5-2.5-1.9-3.96h3.8c-.4 1.4-1.1 2.8-1.9 3.96zM14.3 14H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.3 5.6c.6-1.1 1.1-2.3 1.4-3.6h3a8 8 0 0 1-4.4 3.6zm1.7-5.6a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4z"/></svg>`,
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
module.exports = { chromium, fs, path, OUT, LOCKUP, EMBLEM, NAVY, GOLD, GOLD_ON_NAVY, INK, MUTE, BLEED, CONTACT, svg, ICON, BASE };
