# موقع المسوق المطحون

Static site: no build step. Upload the contents of this folder to the web root of the domain.

## Pages
Home (`index.html`), About (`about.html`), Services (`services.html`), Projects (`projects.html`),
Project detail (`project.html?id=<project id>`), Clients (`clients.html`), Contact (`contact.html`).

## Editing
- **Content** (services, clients, projects, FAQ, in Arabic and English): `data.js`. A new project only needs an entry in `projects` with a unique `id`, and its images in `assets/work/`; it then appears on the Projects page and gets its own page at `project.html?id=<id>`.
- **Page text / layout**: edit `_src/pages/<page>.html` (or the shared `_src/layout.html`, `_src/partials/`), then run `python3 _src/build.py` to regenerate the `.html` files. Do not edit the generated `.html` files directly.
- **English text** for anything marked `data-i18n`: `i18n.js`.
- Styles: `style.css` · behaviour and animations: `main.js` (page-aware) · 3D hero: `three-scene.js` (home only).

## Languages
Arabic is the default. `?lang=en` opens the English version, and the EN/ع button in the nav switches between them. The visitor's choice is remembered.

## Adding a client
1. Put the logo at `assets/clients/<name>.webp`.
2. Add `{ n: "Name", f: "<name>", s: ["القطاع", "Sector"] }` to `clients` in `data.js`.

## Live setup
- Served from `/var/www/site` on the Contabo VPS by Caddy (`elmat7oon-agency.com`, with `www` redirecting to it). Client dashboards stay at `/agency`, `/kmq`, `/watania`, `/smartsteps` and `/guarobow`.
- Redeploy: run the n8n workflow "Agency Dashboard Setup" with a command that pulls the `website` branch tarball into `/var/www/site`, removes `_src/` and `README.md`, and replaces `?v=dev` in the HTML files with a fresh version number (cache-busting). The home page and HTML are served with `Cache-Control: no-cache`.
- Chat: n8n workflow "Chat AG". It loads the system prompt from the Google Doc and prices from the `SERVICES` tab of `El_Mat7oon_Agency_AI_Data`, keeps a separate memory per visitor, and registers leads through "Agency Register Lead" (platform `website`). Allowed origins: the landing page, `elmat7oon-agency.com` and `www.elmat7oon-agency.com`.
