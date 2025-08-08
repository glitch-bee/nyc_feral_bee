# NYC Feral Bee Survey

Version: 1.0.0 · Status: Production Ready · Last Updated: August 8, 2025

A practical, mobile‑first web app to log and verify feral bee sightings across NYC. Built for field use by researchers, beekeepers, and citizen scientists.

- Live site: https://glitch-bee.github.io/nyc_feral_bee/
- Stack: Vite + Vanilla JS + MapLibre GL + Supabase + PWA

## Features

- Interactive map with NYC bounds
- Auth, profiles, and ownership controls
- GPS location + manual pin drop
- Comments and photo uploads
- Sighting status lifecycle: Unverified → Active → Checked → Gone → Removed
- Real‑time updates across clients
- Mobile‑first UX with hamburger navigation

## Tech Stack

- Frontend: Vite + Vanilla JavaScript + MapLibre GL JS
- Map: MapTiler Streets v2 (vector tiles)
- Backend: Supabase (PostgreSQL + Realtime + Storage + Auth)
- Styling: Modern CSS with system font stack (Apple/Segoe/Roboto)
- PWA: Service worker, install prompt, offline basics
- Deployment: GitHub Pages (gh-pages) via npm script

## Quick Start

If you just want to run it locally with placeholders:

```bash
git clone https://github.com/glitch-bee/nyc_feral_bee.git
cd nyc_feral_bee
npm install
npm run dev
```

Use your own API keys (recommended):

```bash
git clone https://github.com/glitch-bee/nyc_feral_bee.git
cd nyc_feral_bee
npm install

# Copy example env and fill in your keys
cp .env.example .env

# Edit .env
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_MAPTILER_KEY=your_maptiler_api_key

npm run dev
```

Notes:
- All env vars must be prefixed with VITE_ (Vite requirement).
- Missing keys degrade gracefully, but maps and auth need real keys.

## Scripts

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build (dist/)
npm run preview   # Preview production build
npm run deploy    # Build and push dist/ to gh-pages branch
```

## Deployment

- GitHub Pages serves from the gh-pages branch.
- The deploy script builds from your current branch (main) and publishes dist/.

Manual steps (optional):
```bash
npm run build
npm run deploy
```

## Setting Up Your Own Instance

1) Supabase
- Create a project at https://supabase.com
- Run SQL scripts in `docs/database/` in this order:
  - database_setup_user_management.sql
  - database_setup_status.sql
  - database_setup_photos.sql
  - database_setup_comments.sql
  - database_fix_uuid.sql (if needed)
- Enable Auth and grab URL + anon key (Settings → API)

2) MapTiler
- Get a free API key at https://maptiler.com (100k loads/mo on free tier)
- Put the key in your .env as VITE_MAPTILER_KEY

3) Environment
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPTILER_KEY=your_maptiler_api_key
```

## Mobile Experience

- Standardized data collection forms
- Accurate GPS capture + manual adjustments
- Photo documentation to cloud storage
- Real‑time collaboration for teams
- Fast, touch‑friendly UI

## Marker Types

- Hive, Swarm, Structure, Tree

## Status Tracking

- Unverified, Active, Checked, Gone, Removed

## Project Structure

```
src/
├── main.js               # App entry & global state
├── supabase.js           # DB, auth, storage helpers
├── map.js                # Map + markers + popups
├── markerform.js         # Form handling & uploads
├── auth.js               # Auth modal + user flows
├── navigation.js         # Hamburger nav (mobile-first)
├── map-controls.js       # Layer controls via nav
├── crosshair.js          # Precise location selection
├── form-enhancements.js  # UX helpers for forms
├── pwa-installer.js      # PWA install + SW registration
├── toast.js              # Toast notifications
├── style.css             # Main styles
├── map.css               # Map-specific styles
├── auth.css              # Auth styles
├── pages.css             # Static page styles
├── pwa.css               # PWA-specific styles
└── javascript.svg        # Asset

docs/
├── README.md
├── PWA_IMPLEMENTATION.md
└── database/
    ├── database_setup_user_management.sql
    ├── database_setup_status.sql
    ├── database_setup_photos.sql
    ├── database_setup_comments.sql
    └── database_fix_uuid.sql

public/
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker
├── cityhive-logo.svg     # Logo
├── vite.svg              # Vite icon
└── *.png                 # Images (NYBeeClub_main, cityhive, skyline, ...)

Root
├── .env.example          # Env template
├── vite.config.js        # Vite config (GitHub Pages base)
├── package.json          # Scripts & deps
├── index.html            # App entry page
├── about.html            # About page
├── resources.html        # Resources page
├── CHANGELOG.md
├── CONTRIBUTING.md
└── AGENTS.md
```

## Contributing

- Fork, branch, PR. Keep commits small and descriptive.
- Open a discussion for larger changes.

## License

MIT — see LICENSE.

## Contact

Open an issue for questions or bugs.




