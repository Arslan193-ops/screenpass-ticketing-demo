# ScreenPass — Partner Ticketing Demo

A standalone demo site showing how an external ticketing platform can integrate
with a Cinema's Partner API: browse movies, pick a seat, book a ticket, and
order food — all through the same endpoints an external partner would use.

**Live demo (GitHub Pages, Demo Mode only):**
https://arslan193-ops.github.io/screenpass-ticketing-demo/

**Full app, including working Live API mode (Vercel, free, no card needed):**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Arslan193-ops/screenpass-ticketing-demo)

Click the button above and sign in with GitHub. Vercel serves `public/` as
the site and runs `api/proxy/[...path].js` as a serverless function standing
in for `server.js`'s proxy — same `/api/proxy/*` calls the frontend already
makes, no frontend changes needed. You'll get a
`https://screenpass-ticketing-demo.vercel.app`-style URL where both Demo
Mode and Live API mode work.

(A Render blueprint — `render.yaml` — is also in this repo if you'd rather
use Render, but Render now requires a card on file even for its free tier.)

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
