# NoBroker Loans Catalog + Referral Page (deployment package)

## Included
- Entire original `catalog-main(1).zip` application, preserving its existing payout, FinWizz and vehicle loan files.
- Referral landing page at `/refer/`.
- Custom standalone QR and UTM tools at `/refer/tools/`.
- Catalog navigation link to referral page.
- Dismissible referral pop-up approximately 3 seconds after the Catalog homepage opens (once per browser tab session).

## Deploy
Upload the **contents of this folder** as the root of the Vercel project, with the Framework Preset set to **Other** (static website). Existing production routing/configuration should be reviewed before replacing a live deployment.

## Important: Not yet operational
- The `/refer/` submission button is intentionally **disabled**. It cannot store leads until the backend validates genuine VH tokens and securely accepts submissions.
- VH code lookup, identity verification/OTP, photo upload, custom creative PNG download, per-VH dashboard, Supabase persistence, Google Sheets synchronization, and real referral link issuance remain **unimplemented**.
- The QR and UTM studio is a **local preview utility**, and does not issue legitimate referral codes. Its route is publicly accessible unless access control is separately introduced. Do not enter sensitive company data or live private tokens there.
- Campaign rates/eligibility must receive business approval.
- The image used on the referral page is a Catalog-derived logo treatment; replace with the approved canonical full logo asset if necessary.

## Suggested smoke tests
`python -m http.server 8000` from the repository root. Open `/`, `/refer/`, `/refer/tools/` and `/vehicle-loans.html` locally. Use `node --test` for the original utilities' isolated test suite only (not included in the deploy root).

## Existing Catalog file changes
The ONLY modified original Catalog file is `index.html`. It adds the stylesheet, navigation link and popup script for the referral campaign. All other original Catalog files have identical bytes to the uploaded ZIP.
