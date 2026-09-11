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

## Academy practice

- Six original lessons span structured and deductive tracks, each with three levels, knowledge checks, notebook prompts and recall cards. Legacy courses remain under Library.
- Daily deduction uses 26 hypothetical benchmark profiles. Structure appears first; learners commit an origin/climate hypothesis before seeing candidates or buying fruit. A provisional candidate is required before the non-fruit reveal. The final call locks before the discriminator MCQ.
- Provisional reveal ceilings are 100 / 80 / 60 points. The candidate contributes 75% and the discriminator 25% of that ceiling. Initial geography/climate hypotheses are retained but unscored: structure does not establish an origin. Each attempt stores its reference and drill snapshots, reveal round and decisions.
- Grid memory practice reconstructs supplied notes. It teaches vocabulary and is explicitly excluded from calibration.
- Bottle practice starts with a blank observation grid, locks it, then asks for a conclusion. It requires a saved cellar bottle and an authored measured reference for the exact LWIN/vintage. Built-in profiles are hypothetical authoring templates, not measurements of commercial bottles. No measured commercial references ship by default.
- Only full bottle-observation grids contribute to calibration, after ten valid calls per field. Linked journal slider comparisons remain partial and excluded. Conclusion scores and text drills never enter palate calibration.
- Structured scoring uses 23 possible marks for reds and 22 for non-reds. Adjacent five-position calls receive half marks; three-position calls require an exact answer. Deduction conclusions use grape 35, region 25, country 15, vintage 15, quality 10. These are Decant practice rules, not official exam rubrics.
- Recall uses a local-date queue capped at 25 reviews per day. Saved cellar metadata can create cards; no grapes, ratings or sensory references are inferred from LWIN.
- Attempts append with idempotent IDs. Notebook exports include Academy history, recall schedules, custom lessons and references. Existing notebooks without Academy data migrate on read. Everything remains browser-local.
- Open `?studio=1&view=academy`, then Author, to create lessons or measured references. This is local authoring, not access control. Publishing course content still requires updating the site source.

## Bottle entry and notebook navigation

Vintage is a searchable picker with NV first, then the current year back to 1980. A full earlier year is accepted as a custom vintage. Drinking-window pickers offer the current year through 2060 and past years back to 1980, with typed four-digit years supported. Reversed windows and incomplete vintages are rejected.

The account currency defaults to USD and applies only to new bottles. Every bottle can override it; existing unlabelled prices retain their previous USD meaning. Purchase values are grouped by currency, never converted or added across currencies, and shown only in the cellar. Home no longer shows total bottle counts. Exports preserve the preference and bottle currency.

Home opens Overview; Your notebook opens tasting and lesson notes, with category filters and a simpler lesson-note form. Both Academy lesson flows tag new reflections as lesson notes; older reflection titles and lesson IDs are also recognised.

Label photos are read locally using [Tesseract.js](https://github.com/naptha/tesseract.js), pinned to 6.0.1 and loaded from jsDelivr only on demand. Initial reader/model downloads and LWIN search require a connection. The image is neither stored in the notebook nor uploaded; the user reviews extracted search words before sending them to the catalog and confirms a result before autofill. OCR is best-effort and requires checking the vintage against the label. A clear synthetic label was tested; real-world camera accuracy varies with typography, glare, angle and language.
