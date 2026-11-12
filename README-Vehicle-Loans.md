# Vehicle Loans — CarDekho catalog

## Install
Copy the six application files from this ZIP into the existing repository root:
script.js, vehicle-loans.html, vehicle-loans.css, vehicle-loans.js, vehicle-data.json, vehicle-pdf-terms.json.

The supplied script.js is based on the last version delivered in this conversation (Supabase main catalog, two-column Annexure, Drive-link replacement, MONYY filenames). It adds a Vehicle Loans link beside the existing catalog source buttons. If your repository has newer unrelated script.js changes, retain that file and append only the addVehicleCatalogLink function and its event binding from the end of this supplied script.js.

In index.html update the existing script tag's cache version:
<script src="./script.js?v=vehicle-20261112" defer></script>

Commit and deploy through your existing Vercel flow. The new page is /vehicle-loans.html. It reuses assets/partner-qr.png and favicon.png from the existing repository. Existing NoBroker and FinWizz catalog paths remain separate.

## Rules
- New Car: 232 payout rows. Only DSA payout/DSA PO% columns are exposed as payout figures, highlighted in the website and PDF. Original payout/PO% columns are excluded. Scheme, CIBIL, tenure, rates and loan bands remain to identify the applicable DSA payout. Conditions references are local to each lender table.
- Used Car: 39 lender rows. NB columns are omitted entirely. The five displayed columns use the supplied payout values and exact source boundaries: 0–15, 15.01–30, 30.01–50, 50.01–100 and Above 100 lakh. These represent vehicle-value bands per your instruction. No boundary interpolation or recalculation is applied.
- ROI/PF/Subvention: 108 data rows plus all source footnotes are in a separate PDF-only Terms & Conditions section. The browser fetches this file only when a used-car PDF is requested; it is not rendered on the website. This is presentation separation, not a private-file access restriction.
- The used-car payout tab is labelled Oct'26 in the supplied workbook. The source label is retained. Download filenames use the current month/year.
- New Car includes 171 vehicle-model classification rows as an expandable reference and a PDF appendix, because schemes refer to these categories.
- Only the three specified tabs are imported. Page 1–7 export tabs are not separately imported, avoiding duplicate/unapproved payout grids.
- Existing download ID/code protection is retained for the new PDF. Vehicle payouts are supplied values; no additional payout calculator or multiplier is applied.
- Product, bank and search filters determine payout rows downloaded. Used-car downloads include the complete terms section to retain cross-lender footnotes. New-car downloads include the model classifications.
- Values come from the supplied Excel snapshot. Vehicle Loans is not automatically synced to Supabase or Google Sheets.

## Validation
JavaScript syntax checks passed. Workbook mapping checked for DSA-only/ non-NB payout columns, merged cell inheritance and row/header alignment. Actual jsPDF generation succeeded; representative new-car, used-car and terms pages were rendered and inspected. Browser interaction and deployed-site testing remain after installation.
