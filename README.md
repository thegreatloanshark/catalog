# NoBroker Loans Catalog

Catalog website with NB, FinWizz and Vehicle Loans views and PDF downloads.

## Pages and data

- `index.html`, `script.js`, `styles.css`: NB and FinWizz catalog.
- NB catalog reads from the existing Supabase catalog integration.
- `finwizz-data.json`: FinWizz product data.
- `vehicle-loans.html`, `vehicle-loans.js`, `vehicle-loans.css`: Vehicle Loans catalog.
- `vehicle-data.json` and `vehicle-pdf-terms.json`: vehicle product data and PDF terms.
- `catalog-runtime.js`, `logo-manifest.json`, bank logo sprites and `assets/catalog/`: shared PDF branding and assets.
- `assets/partner-qr.png`: supplied partner QR.

## Deploy

Use the contents of this directory as the repository root. Commit the updated files AND the deletions, then deploy the static site to Vercel. No build step is required.

This is a complete replacement repository. Copying these files on top of an older checkout without deleting obsolete files will leave old routes deployed.

## Status labels

Only Upcoming Banks and PAYOUTS APPLICABLE ONLY FOR 100% FULFILMENT IN METRO CITIES are retained as catalog status labels. Product values, payment modes, filters and functional error messages remain.

## Documentation

See README-UPDATE.md, README-Vehicle-Loans.md and LOGO-COVERAGE.md for the existing PDF, asset and vehicle-catalog details.
