# Copilot / AI Agent Instructions for SpectroModel ✅

Short context
- This is a small Vite + React 18 single-page app scaffolded by Base44. The app is intended to communicate with the Base44 API (see `README.md`).

Key things to know (big picture) 🔍
- Entry: `src/main.jsx` — wraps the app with `HelmetProvider` and mounts `App`.
- Routing: `src/AutoRoutes.jsx` automatically discovers page components using Vite's `import.meta.glob` and mounts them as `<Route>`s. Pages are discovered if their file path or name suggests a page (folders like `pages`, `views`, `routes` or filenames containing `page`, `home`, `dashboard`).
- SEO: `src/components/SEO.jsx` uses `react-helmet-async`. `main.jsx` already wraps the app with `HelmetProvider`, so use `SEO` in pages for metadata.
- Deployment: `vite.config.js` sets `base: '/gh-pages/'`. There's a `deploy.sh` script that builds and force-pushes the `dist` output to the `gh-pages` branch and writes a `CNAME` (spectromodel.com).

Routing conventions & examples (AutoRoutes) 🔧
- AutoRoutes picks modules where `mod.default` exists and `isPagePath(file)` returns true.
- Path transformation rules (from `toRoutePath`):
  - Leading `./` and `.jsx` are stripped.
  - Common folders are removed (`src/`, `components/`, `views/`, `pages/`, `routes/`) so final routes are cleaner.
  - `Home` (case-insensitive) becomes `/`.
  - File / folder segments are converted to kebab-case.

Examples:
  - `src/pages/Home.jsx` -> `/`
  - `src/views/UserProfile.jsx` -> `/user-profile`
  - `src/routes/admin/Dashboard.jsx` -> `/admin/dashboard`

Notes for making changes to routes:
- Files must `export default` a React component to be picked up.
- If you need complex or dynamic routes (e.g., nested params or custom match logic), add a manual route instead of relying on AutoRoutes.

Build, run, and deploy (developer workflows) ⚙️
- Install & run dev: `npm install` then `npm run dev` (starts Vite dev server).
- Build: `npm run build` (outputs `dist/`).
- Preview production build: `npm run preview`.
- Deploy to GitHub Pages: inspect and run `./deploy.sh` (builds, checks out `gh-pages`, copies `dist` files, sets `CNAME`, commits & force-pushes). Note: `deploy.sh` expects to run from the repository root and use the `dist` directory located alongside the repo.

Files & patterns to reference 📁
- `src/AutoRoutes.jsx` — automatic routing logic (primary pattern to follow).
- `src/components/SEO.jsx` — canonical place for page SEO usage.
- `src/components/YourComponent.jsx` — example asset import (`@/assets/...`) used in this repo.
- `vite.config.js` — includes `base: '/gh-pages/'` which affects static asset URLs; update carefully with deploy changes.
- `deploy.sh` and `public/CNAME` — gh-pages deployment and custom domain behavior.

Known gaps (explicitly discoverable) ⚠️
- No tests or CI workflows detected (no test script in `package.json`, no `.github/workflows` present). Do not assume automated tests exist.
- No explicit path alias config (`jsconfig.json` / `tsconfig.json`) found despite imports using `@/` — if you see alias resolution errors, check for project-specific alias configuration or add an alias in `vite.config.js` and/or a config file.

Behavioral & change guidance for agents 🧭
- Small, incremental PRs are preferred. If you change routing conventions (AutoRoutes), update this file and add an example page so the change is easily reviewed.
- Preserve `base` in `vite.config.js` or update `deploy.sh` if you change hosting strategy.
- When adding pages, include `SEO` usage where appropriate and export a default React component.

Contact & context
- The scaffold references Base44; for product/behavior questions contact: `app@base44.com` (from `README.md`).

If anything here is unclear or you'd like examples updated, tell me which part to expand and I'll iterate. 🙋‍♂️