# ScreenPass — Partner Ticketing Demo

A standalone demo site showing how an external ticketing platform can integrate
with a Cinema's Partner API: browse movies, pick a seat, book a ticket, and
order food — all through the same endpoints an external partner would use.

**Live demo (GitHub Pages, Demo Mode only):**
https://arslan193-ops.github.io/screenpass-ticketing-demo/

**Full app, including working Live API mode (Render):**
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Arslan193-ops/screenpass-ticketing-demo)

Click the button above, sign in to Render (free, no card required for the
free tier), and it deploys this repo's `render.yaml` automatically. You'll
get a `https://screenpass-ticketing-demo.onrender.com`-style URL where both
Demo Mode and Live API mode work (the free tier spins down after 15 minutes
of inactivity, so the first request after a while takes ~30s to wake up).

## Modes

- **Demo Mode** (default) — fully client-side, made-up movies and menu, no
  backend required. This is what's deployed on GitHub Pages.
- **Live API Mode** — click "Connect Live API", enter a Cinema instance's
  Base URL and Partner API key (`pk_test_...` / `pk_live_...`), and bookings
  become real requests against that instance. This needs the small Node
  proxy (`server.js`) running — either locally, or via the Render deploy
  above. It won't work on the GitHub Pages link (static hosting only).

## Running locally

```bash
node server.js
```

Then open http://localhost:4300. `server.js` is a zero-dependency Node
server that serves the static files and proxies `/api/proxy/*` requests to
the Cinema API with your API key attached server-side (so the key never
touches the browser's network requests directly, and there's no CORS setup
needed on the Cinema API side).
