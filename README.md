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

`analytics.js` runs on every page: catalog, Vehicle Loans, Refer & Earn and the referral tools. It loads the **Google Tag Manager** container `GTM-W3NJTTWH`, **only after the visitor accepts the consent banner**. Declining, or never answering, loads nothing and sets no analytics cookies. The choice is stored in the browser (`nb_analytics_consent`), and "Cookie settings" in the footer reopens the banner (on phones, at the end of the page). Advertising consent is always denied. Add `?analytics_debug=1` to a URL to log events in the console.

Set up inside GTM (no code change needed):
1. **GA4:** add a Google tag with your GA4 Measurement ID, firing on All Pages. Then add one GA4 Event tag with event name `{{Event}}`, firing on a Custom Event trigger matching the event names below. Add the parameters you want as Data Layer Variables (`catalog`, `view`, `layout`, `to`, `control`, `filter`, `value`, `product`, `item`, `bank`, `result`, `search_term`, `page_type`, `device_layout`).
2. **Heatmaps (Hotjar):** add a *Hotjar Tracking Code* tag with your Hotjar Site ID, firing on All Pages. Alternatively, set `HOTJAR_SITE_ID` in `analytics.js` instead of using GTM, but not both. `analytics.js` forwards every event below to Hotjar (`hj('event', …)`), so heatmaps and recordings can be filtered by them. If you switch to another tool, update `TOOLS_LABEL`, which the consent banner shows.
3. In GA4 → Admin → Custom definitions, register the same parameters as event-scoped dimensions.
5. **Separate pages for catalog views.** NoBroker / 3rd Party and Codes / Payouts share one URL. `analytics.js` reports each combination as its own page: `/nobroker/codes`, `/nobroker/payouts`, `/third-party/codes` and `/third-party/payouts`.
   - Contentsquare: `setPath` / `trackPageview`.
   - Hotjar: `hj('stateChange')`.
   - GA4: a `virtual_page_view` data-layer event (`page_path`, `page_location`, `page_title`). In GTM, add a GA4 Event tag named `page_view` with those three parameters, firing on Custom Event `virtual_page_view`.
   The first view of the catalog is the normal page view of `/`, which shows NoBroker / Codes. List/Grid changes are not new pages. Vehicle Loans and the Refer pages already have their own URLs.
4. **Contentsquare** loads directly from `analytics.js` (`CONTENTSQUARE_TAG_ID = '51165f6ae3411'`, script `t.contentsquare.net/uxa/51165f6ae3411.js`), also only after consent. Do not add it in GTM as well. Every event is sent as a Contentsquare page event (`trackPageEvent`). Forms, search boxes and the unlock dialog carry `data-cs-mask`.

Leave `GA4_MEASUREMENT_ID` empty while GTM is used, or GA4 would count everything twice.

Events (pushed to the data layer as `{event: name, ...details}`):

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
| `download_click`, `download_unlock` (`result`), `download_pdf` | PDF download steps |
| `bottom_nav` (`item`), `back_to_top`, `filters_reset`, `selection` | Phone bar and other controls |
| `referral_submit`, `vh_otp_request`, `vh_otp_request_result`, `vh_otp_verify`, `vh_otp_verify_result`, `vh_creative_download`, `refer_nav` | Refer & Earn |
| `tools_tab`, `utm_build`, `utm_copy`, `utm_to_qr`, `utm_bulk_preview`, `utm_bulk_download`, `qr_generate`, `qr_download` (`format`) | Referral tools |
| `outbound_click`, `refer_link_click`, `back_to_catalog`, `consent` | As named |

Only real taps and clicks are counted. Controls that drive other controls do not double-count. Typed values are never sent, apart from catalog search terms. Forms, search boxes and the unlock dialog carry `data-hj-suppress`, `data-cs-mask` and `data-clarity-mask`, so their contents never appear in recordings.

CTRs: in GA4 → Explore, divide an event's count by `page_view` for the same page and period. For example, `download_click` ÷ page views is the download CTR. Clarity's click heatmaps show where people click.

## Status labels

Only Upcoming Banks and PAYOUTS APPLICABLE ONLY FOR 100% FULFILMENT IN METRO CITIES are retained as catalog status labels. Product values, payment modes, filters and functional error messages remain.

## Documentation

See README-UPDATE.md, README-Vehicle-Loans.md and LOGO-COVERAGE.md for the existing PDF, asset and vehicle-catalog details.
