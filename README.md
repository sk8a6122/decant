# Decant wine search

GitHub Pages serves `index.html`, `assets/`, `sw.js`, and `catalog-config.js`. A separate Cloudflare Worker searches the D1 catalog. The catalog is not downloaded to visitors' browsers.

## Current status

Search, selection, vintage prefill and saving have been tested against 185,351 live wine and fortified-wine entries from the supplied LWIN workbook. The production catalog runs at `https://decant-wine-search.chase6122.workers.dev` and is connected through `catalog-config.js`.

The notebook still uses browser-local storage. This change does not add member accounts, cloud notebook sync, payments, or drinking-window estimates.

The Pairings page accepts food and dish searches, suggests three useful wine starting points, and ranks matching bottles already saved in the local cellar. Food queries and cellar contents remain in the browser.

## Build

Use Node 24 or newer. In `frontend`, install dependencies with `pnpm install`, then run `pnpm build`. This regenerates the root `index.html`, versioned JS/CSS in `assets/`, responsive WebP images, and `sw.js`. Publish all of them together. The complete source and existing UI styles are included.

## Prepare the catalog

Run `python catalog-worker/scripts/import_lwin.py /path/to/LWINdatabase.xlsx --out /path/to/new-import-directory`. The importer creates SQLite for local checks and ordered SQL files for D1. Use a fresh directory for each import. Generated data is intentionally excluded from Git.

The import preserves all 212,356 catalog identities; only Live Wine and Fortified Wine entries are indexed for bottle search. Spirits, deleted and merged records are excluded from results. First/final vintages are identification metadata, not drinking windows or a complete list of produced vintages.

## Deploy

1. Connect Cloudflare and check the account's D1 write allowance before importing. A full import involves hundreds of thousands of row writes plus search indexes; do not assume it fits a free daily allowance.
2. Create a fresh D1 database and put its ID in `catalog-worker/wrangler.jsonc`.
3. Install the worker dependencies. Import the generated SQL files in filename order using `wrangler d1 execute decant-wines --remote --file <file>`. Stop on any error. Do not replay the full import against an existing populated database.
4. From `catalog-worker`, run `pnpm deploy`. Confirm `/health` returns `ready: true` and `searchableWines: 185351`, then test `/v1/wines?q=Vietti%20Barolo`.
5. Set `window.DECANT_CATALOG_URL` in root `catalog-config.js` to that service's HTTPS URL. Publish the root HTML, assets, service worker and config together to GitHub Pages.

Only `https://sk8a6122.github.io` is enabled as a browser origin. The service exposes public read-only catalog data; CORS is not authentication. No token belongs in the HTML or config file.

## Local checks

Set `CATALOG_DB` to the generated `catalog.sqlite` path and run `node catalog-worker/test/search.test.mjs`. Node must include SQLite FTS5 (tested with Node 24.19).

With the same environment variable, run `node catalog-worker/scripts/preview.mjs` and open `http://127.0.0.1:5174/`. The preview supplies a local-only catalog configuration without changing the production config. Its notebook storage is separate from the GitHub site's storage.

## Attribution

Wine identification data: [LWIN © Liv-ex](https://www.liv-ex.com/lwin/), under its [published licence](https://www.liv-ex.com/lwin-creative-commons-licence/). Records have been normalized and filtered for search. Liv-ex does not endorse Decant. Search results do not include critic ratings or drinking windows.

## Notebook review fixes

- Tasting notes carry `bottleId` plus a snapshot of wine details. Journal titles follow a linked bottle rename; removing the bottle leaves its note readable. Legacy notes link only when wine/producer/vintage (or LWIN/vintage) identify a single saved bottle.
- The explicit “I opened one bottle” checkbox changes stock once. Editing or moving a tasting applies the difference; deleting a note does not restore consumed stock. Use the bottle quantity field to correct stock after a deletion.
- Acidity, tannin, body and finish are optional 1–5 scores. Untouched sliders remain unrecorded. Export version 3 preserves links and scores; imports preserve IDs and do not replay stock changes. Reimporting an existing ID skips that entry.
- Export is in the banner on every screen. Personal data remains in localStorage; export is still needed for backups.
- `?studio=1` enables local authoring (for example `?studio=1&view=studio`). This is a UI switch, not authentication. Content changes affect this browser only.
- Offline use begins after one successful online visit and service-worker installation. Cached pages, lessons, cellar, notes and local pairing rules work offline; LWIN search still requires the network. Service-worker updates activate after existing tabs close.
- Run `npm run typecheck` and `npm test` in `frontend` for portable-app types and data integrity tests. `work/qa-server.py` serves isolated test catalog data on port 8767; it does not modify production configuration.

The Academy Engine PDF is deferred. These changes add personal tasting sliders, not exam scoring or credential assessment.
