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

## Live setup
- Served from `/var/www/site` on the Contabo VPS by Caddy (`elmat7oon-agency.com`, with `www` redirecting to it). Client dashboards stay at `/agency`, `/kmq`, `/watania`, `/smartsteps` and `/guarobow`.
- Redeploy: run the n8n workflow "Agency Dashboard Setup" with a command that pulls the `website` branch tarball into `/var/www/site`.
- Chat: n8n workflow "Chat AG". It loads the system prompt from the Google Doc and prices from the `SERVICES` tab of `El_Mat7oon_Agency_AI_Data`, keeps a separate memory per visitor, and registers leads through "Agency Register Lead" (platform `website`). Allowed origins: the landing page, `elmat7oon-agency.com` and `www.elmat7oon-agency.com`.
