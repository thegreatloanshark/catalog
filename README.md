# NoBroker Loans Catalog

Catalog website with NB, FinWizz and Vehicle Loans views and PDF downloads.

## Pages and data

- `index.html`, `script.js`, `styles.css`: NB and FinWizz catalog.
- NB catalog: browsers load `/api/catalog` (`api/catalog.js`, a Vercel function). Only that function reads Supabase, server-side, with a secret key. Browsers never contact Supabase. See "Catalog data path" below.
- `catalog-data.json`: legacy snapshot of the Core Sheet from before 3 Nov 2026. Not used by the site.
- `finwizz-data.json`: FinWizz product data.
- `vehicle-loans.html`, `vehicle-loans.js`, `vehicle-loans.css`: Vehicle Loans catalog.
- `vehicle-data.json` and `vehicle-pdf-terms.json`: vehicle product data and PDF terms.
- `catalog-runtime.js`, `logo-manifest.json`, bank logo sprites and `assets/catalog/`: shared PDF branding and assets.
- `assets/partner-qr.png`: supplied partner QR.

## Deploy

Use the contents of this directory as the repository root. Commit the updated files AND the deletions, then deploy the static site to Vercel. No build step is required.

This is a complete replacement repository. Copying these files on top of an older checkout without deleting obsolete files will leave old routes deployed.

## Catalog data path

Google Sheet *Catalogue Feed - BA Team Sheet* → tab **Core Sheet** → Apps Script `syncCatalog` (kept in the sheet, not in this repo) → Supabase `catalog_products` + `catalog_metadata` → `api/catalog.js` → browser.

`api/catalog.js` is read-only. It returns the columns the site renders, drops rows marked "Not to include in catalog", and is cached at the edge for 30 s.

### Setup (in this order)

1. In Vercel → Project → Settings → Environment Variables, add for Production (and Preview if used):
   - `CATALOG_SUPABASE_URL` = `https://lbyqsdhzbhumxapibxzg.supabase.co`
   - `CATALOG_SUPABASE_SECRET_KEY` = a backend `sb_secret_…` key for that project (Supabase → Project Settings → API Keys). Never commit it or prefix it with `NEXT_PUBLIC_`.
2. Deploy, then open `https://<site>/api/catalog`. It should return JSON with `records`. Check that the catalog page loads.
3. Only after step 2 works, stop anonymous reads in Supabase (SQL editor):

```sql
-- See which policies let visitors read the catalog tables
select tablename, policyname, roles, cmd from pg_policies
where schemaname = 'public' and tablename in ('catalog_products', 'catalog_metadata');

-- Drop each read policy listed above, one statement per policy, e.g.:
-- drop policy "<policy name>" on public.catalog_products;

alter table public.catalog_products enable row level security;
alter table public.catalog_metadata enable row level security;
revoke all on public.catalog_products, public.catalog_metadata from anon, authenticated;

-- Stop broadcasting catalog changes over Realtime (skip if a table is not in the publication)
alter publication supabase_realtime drop table public.catalog_products, public.catalog_metadata;
```

The Apps Script sync uses a secret key, which is not affected by these changes. After step 3, the old public key returns no catalog data, and `/api/catalog` keeps working.

## Status labels

Only Upcoming Banks and PAYOUTS APPLICABLE ONLY FOR 100% FULFILMENT IN METRO CITIES are retained as catalog status labels. Product values, payment modes, filters and functional error messages remain.

## Documentation

See README-UPDATE.md, README-Vehicle-Loans.md and LOGO-COVERAGE.md for the existing PDF, asset and vehicle-catalog details.
