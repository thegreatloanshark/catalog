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

## PDF download access

The download ID/code is checked by `api/download-auth.js` on the server, against the table `public.catalog_download_access` in the catalog Supabase project. It uses the same `CATALOG_SUPABASE_URL` / `CATALOG_SUPABASE_SECRET_KEY` as `/api/catalog`. The browser only sends what the user typed. No credential or hash is shipped in the frontend.

The table stores SHA-256 of `<ID>:<code>` (ID trimmed, code exactly as typed). Never commit the value.

```sql
create table if not exists public.catalog_download_access (
  id bigint generated always as identity primary key,
  label text not null,
  credential_sha256 text not null check (credential_sha256 ~ '^[0-9a-f]{64}$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.catalog_download_access enable row level security;
revoke all on public.catalog_download_access from anon, authenticated;

insert into public.catalog_download_access (label, credential_sha256)
values ('PDF download', '<sha256 of ID:code>');
```

To compute a value: `printf '%s' 'ID:code' | sha256sum`. To retire a credential, set `active = false`. Several active rows are allowed.

## Analytics

`analytics.js` (loaded first on `index.html` and `vehicle-loans.html`) sends traffic and click events to **Google Analytics 4** and loads **Microsoft Clarity** for heatmaps and session recordings. Both stay off until their IDs are set at the top of the file. Both IDs are public by design. Add `?analytics_debug=1` to a page URL to log events in the browser console.

Setup:
1. GA4: Admin → Create property → Web data stream for the site URL. Copy the Measurement ID (`G-…`) into `GA4_MEASUREMENT_ID`.
2. Clarity: clarity.microsoft.com → New project for the site URL. Copy the Project ID into `CLARITY_PROJECT_ID`. Optional: Clarity Settings → Setup → Google Analytics integration, to open recordings from GA4.
3. GA4 → Admin → Custom definitions: register event-scoped dimensions for `catalog`, `view`, `layout`, `control`, `to`, `filter`, `value`, `product`, `item`, `bank`, `result`, `page_type`, `device_layout`, so reports can split by them.

Events (each includes `catalog`, `view`, `page_type`, `device_layout` and, where there is a layout switch, `layout`):

| Event | When |
|---|---|
| `catalog_switch` | NoBroker / 3rd Party / Vehicle tab (`to`) |
| `view_switch` | Code Catalog / Payouts in the header (`to`) |
| `layout_switch` | List / Grid (`to`, `control`: toolbar or dock) |
| `filter_change` | Product, payment basis, city or bank dropdown (`filter`, `value`) |
| `product_shortcut` | Round product shortcut on phones (`product`) |
| `search` | Search after typing pauses (`search_term`, `terms`, `results`, `box`) |
| `card_expand` | Show more / Show less (`bank`, `action`) |
| `payout_conditions_open` | Payout Conditions on a card (`bank`) |
| `download_click` | Download button |
| `download_unlock` | Unlock attempt (`result`: success, wrong_code, error) |
| `download_pdf` | Download PDF in the download studio |
| `bottom_nav` | Phone bottom bar (`item`) |
| `filters_reset`, `selection`, `back_to_top`, `outbound_click` | As named |

Only real taps and clicks are counted. Controls that drive other controls do not double-count. The download unlock form is masked in Clarity recordings.

CTRs: in GA4 → Explore, divide an event's count by `page_view` (or by users) for the same page and period. For example, `download_click` ÷ page views is the download CTR. Clarity's click heatmaps show where people click on each page.

## Status labels

Only Upcoming Banks and PAYOUTS APPLICABLE ONLY FOR 100% FULFILMENT IN METRO CITIES are retained as catalog status labels. Product values, payment modes, filters and functional error messages remain.

## Documentation

See README-UPDATE.md, README-Vehicle-Loans.md and LOGO-COVERAGE.md for the existing PDF, asset and vehicle-catalog details.
