# OrbitalNet — Satellite Internet Website

A modern, animated, multi-page marketing website for a satellite internet service with a built-in speed test (latency, download, upload) using Cloudflare speed endpoints.

## Run locally

- Use any static server. For example:

```bash
npx serve -l 5173 .
```

Open `http://localhost:5173`.

## Pages
- `index.html`: Home
- `plans.html`: Plans & Pricing
- `coverage.html`: Coverage map
- `speedtest.html`: Real-time speed test
- `about.html`: About & technology
- `support.html`: FAQ & contact
- `gov-services.html`: Government services portal for rural communities
- `login.html`: Login UI with simulated auth (localStorage)

## Notes
- Speed test uses `speed.cloudflare.com` public endpoints and `1.1.1.1` trace for IP. Results vary by device/network.
- All styling and scripts are under `assets/`.
- Login is client-side only for demo purposes.