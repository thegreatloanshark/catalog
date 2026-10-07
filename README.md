# NoBroker Loans Catalog — Sheet1 Centralized Build

## Runtime source
The only lender/product source is `api/_data/catalog-data.json`, generated from **Sheet1 / columns A:O** of `Catalogue Feed - BA Team Sheet.xlsx`.

- Column M is intentionally ignored.
- Columns P:S are excluded from catalog data and UI.
- Rows with blank Code, Product Type, or Sub-Product / Variant are suppressed.
- No General/Co-Op mode data is carried forward.
- Record key: Institution Name + Code + Product Type + Sub-Product / Variant.
- Language corrections are written into generated JSON; the source workbook remains untouched.

## Access
Only two authenticated users exist at runtime: **Team Internal** and **Shiv**. Authentication is handled server-side by `api/auth.js`; the client never contains the credential list.

Recommended Vercel environment variables:
- `CATALOG_AUTH_SECRET`
- `TEAM_PASSWORD`
- `SHIV_PASSWORD`

The server contains the agreed current passwords as deployment fallbacks, but production should override them through environment variables.

### Team Internal
- T1
- T2
- City-wise views

### Shiv
- Raw Max Slab view (view-only)
- T1
- T2
- City-wise views
- Shiv-only Simple / Rich PDF design choice
- Per-download cover Name + Designation fields

All city-wise views show the full catalog. Vijaywada uses T2 logic; every other configured city uses T1 logic.

## Payout transformation
- T1 default/cap: 90%
- T2 default/cap: 85%
- Calculator basis can be lowered but never exceed the tier cap.
- Numeric Max Slabs are multiplied by the selected basis, floored to 2 decimals, then any hundredths digit of `1` is reduced to `0` (e.g. 0.81% -> 0.80%).
- PF/Processing-Fee statements are transformed proportionally as well.
- Raw Max Bank Slab is returned only to Shiv Raw view.

## Product navigation
UI groups source Product Type into:
- HL – Home Loan
- LAP – Loan Against Property
- PL – Personal Loan
- BL – Business Loan
- Other Products

The original Product Type and Variant remain on every published record.

## Payment type
A record is Spot only when Sheet1 clearly states Spot (Payment Type or Payout Timeline). Every other published record is treated as MIS.

## Sequencer
Download ordering uses a separate internal institution classification map:
- Public / Private / NBFC
- crossed with Spot / MIS

Default order:
1. Public · Spot
2. Public · MIS
3. Private · Spot
4. Private · MIS
5. NBFC · Spot
6. NBFC · MIS

Users can drag categories inside Download Studio.

## Downloads
All output filenames are exactly:
- `Master Catalog <mmm-yy>.pdf`
- `Master Catalog <mmm-yy>.xlsx`

The Download Studio combines format, calculator, applicable-city filter, sequencer, print design, preview and verification consent on one screen.

Every download calls `/api/network-stamp` to capture the public-facing IP and timestamp. PDF outputs stamp IP/date/time on page 2; Excel carries the same metadata above the first catalog table.

### Simple PDF
Compact bank-wise catalog with adjustable margins, font size, line height, field spacing, block spacing, header/footer reserve, QR/footer spacing, card padding, section spacing and orientation.

### Rich PDF — Shiv only
- Page 1: branded cover on the 40%-opacity home-loan background.
- Page 2: fixed Partner Benefits page with the download verification stamp overlaid.
- Page 3 onward: branded bank table inspired by the supplied reference.
- Target density: 5 bank entries/page landscape, 6 bank entries/page portrait.
- Rich assets are lazy-loaded only after Shiv chooses Rich PDF.
- Long conditions are summarized inside Rich table rows; Simple PDF / Excel preserve full terms.

## Bank logos
Rich PDF looks for official logo files only when Rich PDF is generated. Put optimized logos in `assets/bank-logos/` using the canonical slugs in `assets/bank-logo-manifest.json`.

Supported: SVG, PNG, WebP, JPG. If an official logo has not yet been supplied, the Rich PDF uses bank initials as a temporary fallback rather than downloading a third-party image.

## FinWizz
FinWizz detection is isolated from the normal catalog and displayed in a separate 3rd Party Provider panel outside the Hero/catalog area. Current Sheet1 has no FinWizz-tagged records. The panel is provisionally Shiv-only until access is finalized.

## Data reports
- `language-corrections-report.csv` — every source-to-generated-text correction.
- `suppressed-records-report.csv` — rows omitted because a required key field is blank.

## Deployment
Deploy the folder as-is to Vercel. The build uses serverless functions under `/api` and static front-end assets. Heavy PDF/Excel libraries are loaded from CDN only when a download is requested, and Rich PDF image/logo assets are loaded only when Rich PDF is selected.
