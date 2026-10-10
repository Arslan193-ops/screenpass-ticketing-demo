# ScreenPass — Partner Ticketing Demo

A standalone demo site showing how an external ticketing platform can integrate
with a Cinema's Partner API: browse movies, pick a seat, book a ticket, and
order food — all through the same endpoints an external partner would use.

**Live demo (GitHub Pages, Demo Mode only):**
https://<github-username>.github.io/<repo-name>/

## Modes

- **Demo Mode** (default) — fully client-side, made-up movies and menu, no
  backend required. This is what's deployed on GitHub Pages.
- **Live API Mode** — click "Connect Live API", enter a Cinema instance's
  Base URL and Partner API key (`pk_test_...` / `pk_live_...`), and bookings
  become real requests against that instance. This mode needs the small Node
  proxy below running, so it only works when you run the app locally.

## Running locally (required for Live Mode)

```bash
node server.js
```

Then open http://localhost:4300. `server.js` is a zero-dependency Node
server that serves the static files and proxies `/api/proxy/*` requests to
the Cinema API with your API key attached server-side (so the key never
touches the browser's network requests directly, and there's no CORS setup
needed on the Cinema API side).
