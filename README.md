# AuraSAT – Static Website

AuraSAT is a student project exploring affordable satellite‑assisted internet for rural areas and sharing helpful weather information.

This repository contains a production‑ready static, multi‑page site built with HTML5, CSS, and vanilla JavaScript (Leaflet and Chart.js via CDN). No sensitive/internal details are included.

## Quick Start (Local)

1. Clone or download this project.
2. From the project root, start a local static server:
   - Python 3: `python3 -m http.server 8080` then open `http://localhost:8080/`
   - Node (if installed): `npx http-server -p 8080 .`
3. Optional (Weather API):
   - Copy `assets/js/config.sample.js` to `assets/js/config.js`.
   - Edit `assets/js/config.js` and set your OpenWeatherMap API key.
4. (Optional) Install as a PWA by visiting the site and using your browser's "Install" option.

## Pages

- `index.html` – Home (hero, values, teasers, interest form)
- `about.html` – Mission, high-level how‑it‑works, team, values, roadmap
- `coverage.html` – Interactive coverage map (Leaflet) + availability checker
- `weather.html` – Weather dashboard (requires OpenWeatherMap API key)
- `speedtest.html` – Speed test (attempts an embed; graceful fallback)
- `plans.html` – Mock plans & pricing
- `support.html` – Support, FAQ, and contact form

## API Keys

- Weather data uses OpenWeatherMap One Call API.
- Add your key by copying `assets/js/config.sample.js` → `assets/js/config.js` and editing the value.
- The site reads `window.AuraSAT_CONFIG.OPENWEATHERMAP_API_KEY`.

## Coverage Data

- Demo polygons (Available, Beta, Coming Soon) are illustrative only.
- Availability depends on terrain, line‑of‑sight, and local conditions.

## Build/Deploy

- This is a plain static site. Any static hosting (GitHub Pages, Netlify, etc.) works.
- Ensure all files are uploaded. No server-side processing is needed.

## PWA and Offline

- A minimal service worker caches core assets for offline viewing of previously visited pages.
- `offline.html` displays when a page is not cached and the network is unavailable.

## Accessibility & Performance

- Semantic HTML, ARIA where helpful, accessible colors and focus states.
- Images are SVG or lazily loaded; scripts are deferred. Fonts use `display=swap`.

## Disclaimers

- Prototype content; coverage varies by location and conditions.
- No internal hardware, budget, or implementation specifics are disclosed here.