# موقع المسوق المطحون

Static site: no build step. Upload the contents of this folder to the web root of the domain.

## Files
- `index.html`: page structure, Meta Pixel, n8n chat
- `data.js`: **edit content here** (services, clients, portfolio, FAQ), in Arabic and English
- `i18n.js`: English text for the rest of the page (Arabic is the default text in `index.html`)
- `style.css`: identity colors and layout
- `main.js`: animations (GSAP + Lenis), tilt, counters, lightbox
- `three-scene.js`: 3D hero and CTA wave (Three.js)
- `assets/clients/`: client logos (360×360 webp)
- `assets/work/`: portfolio images (800px webp)

## Languages
Arabic is the default. `?lang=en` opens the English version, and the EN/ع button in the nav switches between them. The visitor's choice is remembered.

## Adding a client
1. Put the logo at `assets/clients/<name>.webp`.
2. Add `{ n: "Name", f: "<name>", s: ["القطاع", "Sector"] }` to `clients` in `data.js`.

## Before going live
The n8n Chat Trigger only accepts requests from `https://el-mat7oon-landing.duckdns.org`.
In n8n, open the Chat Trigger node, go to **Allowed Origins (CORS)**, add the new domain, then save and activate the workflow.
Until you do this, the chat will not work on the new site.

## Deploy (VPS / nginx example)
```bash
rsync -avz --delete website/ user@SERVER:/var/www/<domain>/
```
