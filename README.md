## Friends and collection sharing

Run `supabase/migrations/202609120002_social.sql` once. In the signed-in account bar, open Friends & sharing to choose a unique username, send/accept requests, block/remove friends, and set Private (default), Friends only, or Public visibility. Public links use `?profile=username` and support signed-out visitors. Individual private-entry overrides take precedence. Only allowlisted bottle fields and tasting-note text/ratings are returned; prices, locations, host records and learning notes stay private. Usernames and display names remain discoverable by exact username even when a collection is private. Free-text tasting notes can contain personal information; the save form explains what will be shared.

Sharing reads the current notebook through an access-checked database function; notebook table permissions stay owner-only. Privacy/friendship changes apply on the next server request; already viewed information cannot be recalled. Blocking prevents authenticated interaction, but public profiles remain accessible when signed out. SQL integration tests in an isolated PostgreSQL-compatible database passed for private/friends/public access, recipient-only acceptance, pending requests, private overrides, sensitive-field exclusion, direct table isolation, remove/block/unblock and privacy revocation. Live unauthenticated RPC checks also passed. Browser visual testing remains unverified in this environment.

# Decant accounts update

GitHub Pages hosts the interface; Supabase provides email/password authentication and private cloud notebooks. Pricing and subscription UI are on hold.

## Enable the backend

1. Run `supabase/migrations/202609120001_accounts.sql` once in the Supabase SQL Editor.
2. In Authentication URL Configuration, use `https://sk8a6122.github.io/decant/` for Site URL and allowed redirect URL. Keep email confirmation enabled. Configure a production email sender in Supabase before inviting general users; default email delivery may restrict recipients or rate-limit messages.
3. The browser-safe Project URL and publishable key are in `supabase-config.js`. Never put a secret or service-role key there.
4. Build from `frontend` with `pnpm install --frozen-lockfile` then `pnpm build`. Publish the root `index.html`, `assets/`, `sw.js`, `catalog-config.js`, and `supabase-config.js` together.
5. Test a real signup, email confirmation, sign-in, password reset, sign-out, and two different users before launch. Check cross-user reads/writes are denied. No live user credentials were used during implementation.

## Saving and migration

Signed-out use keeps the original browser notebook. Signed-in requests read/write only the user's Supabase row; no cloud notebook is copied into guest local storage. An explicit account control copies browser records and Academy progress into the account, preserving IDs and skipping duplicates, while leaving the original browser notebook intact. Legacy JSON import and export remain available.

Account saves require a connection and report failures. Cloud refresh retrieves other-device changes. Atomic revision checks reject simultaneous conflicting writes rather than silently overwriting a notebook. Signed-in offline editing and automatic background synchronization are not implemented. Sign-out retains the separate guest notebook; Supabase session tokens are removed from this browser. Custom education editing is personal notebook content, never global administrator access.

## Validation

`pnpm typecheck`, the existing `pnpm test`, and `node work/accounts.test.mjs` in `frontend`. The browser smoke script `work/accounts-browser.cjs` uses mocked Supabase responses and requires Playwright and a runnable browser. Browser execution was blocked by this desktop environment, so no browser pass is claimed. Actual backend checks confirmed email signup enabled and anonymous notebook reads denied. Email delivery, recovery redirects, and authenticated cross-user isolation still need live acceptance testing.

---

## Previous feature notes

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

Photo reading now starts with an adjustable label crop (drag or keyboard sliders). Suggestions require word-level confidence and plausible name lines; low-confidence text leaves the search blank. Dates in prose are excluded, and no year is selected automatically. Users must confirm a vintage or NV before catalog search. These are safeguards, not a guarantee of correct identification; the supplied original Tignanello photo was tested with a full-label crop: OCR reads ANTINORI and offers 2021, excluding the historical 1971, but does not reliably read the stylized Tignanello name. Search uses the strongest readable line rather than appending smaller prose. This remains a producer lookup requiring manual catalog selection.

## Follow-up review fixes
Journal sliders use 0 for unset and 1-5 for structure, with 3 explicitly medium. Finished bottles appear in Bottle history, and empty stock cannot be consumed by a new note. Existing consumption can still be reversed when editing its original note. Bottle practice links directly to local reference authoring; no sign-in is required in the portable edition. Catalog input accepts a leading LWIN token. Radio values are explicit; the discriminator mounts only after locking. Banner export has a 44px tap target.
Storage schema 4 moves legacy lesson completions into academy.legacyProgress. Previous top-level progress is migrated and old backups remain importable. Records and scored attempts retain their separate meanings. The export keeps a compatibility progress field for older readers.
Validation: 35 data tests, TypeScript, and browser checks for medium save/reload, zero-stock guard, history, local authoring, radio values and discriminator reveal. No measured commercial references were invented.
