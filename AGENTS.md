# Repository Guidelines

## Project Structure & Module Organization
The root directory serves the marketing landing page (`index.html`, `latest.js`, `common.css`, `noscript.gif`) and DNS config (`CNAME`). The investigative explorer lives under `osint/`: HTML entry `osint/index.html`, data catalog `osint/arf.json`, styles in `osint/css/` and D3 logic in `osint/js/`. Assets stay flat; add vendor files to `osint/js` and keep generated artifacts out of version control.

## Build, Test, and Development Commands
Run `npm install --prefix osint` after cloning to fetch `d3` and the `copyfiles` helper. Serve the root site with `python3 -m http.server 8000 --directory .` for quick smoke checks. Serve the OSINT tree locally via `python3 -m http.server 8000 --directory osint` and visit `http://localhost:8000`; this mirrors what `npm start` would do once the legacy `public` folder is restored.

## Coding Style & Naming Conventions
HTML favors semantic tags and lowercase attribute names. Keep CSS rules in `common.css` or `osint/css/arf.css` using two-space indentation and dash-case selectors. JavaScript (`latest.js`, `osint/js/arf.js`) uses ES5 syntax, semicolons, and camelCase identifiers; wrap feature additions in IIFEs and prefer `const`/`let` only when targeting evergreen browsers. JSON data (`arf.json`) must stay pretty-printed with two spaces and alphabetical node ordering for predictable diffs.

## Testing Guidelines
There is no automated test suite; rely on manual verification. After serving locally, expand several nodes in the D3 tree, confirm the tooltips render, and ensure external links open in a new tab without console errors. When editing `arf.json`, validate with `python -m json.tool osint/arf.json` before committing to avoid runtime parse failures.

## Commit & Pull Request Guidelines
Follow the existing log: short, imperative subjects without trailing punctuation (e.g., `Add United States state entries to arf data`). Group related file changes in a single commit, referencing issue numbers in the body when applicable. Pull requests should include a summary, reproduction/testing notes, before/after screenshots for UI tweaks, and mention any data sources added.

## Data & Security Notes
Scrub sensitive intel before updating `arf.json` and prefer HTTPS endpoints. Canvass new links with a HEAD request to confirm availability, and document rate limits or authentication quirks in the PR description for future agents.
