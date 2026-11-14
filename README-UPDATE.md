# Catalog PDF and logo update - 15 November 2026

## Installation

Copy `script.js`, `vehicle-loans.js`, `vehicle-loans.html`, `bank_logos.png`, `bank_logos_2.png`, and the `assets/catalog/` directory into the existing repository, preserving these relative paths. Keep existing data files, index.html, styles, the partner QR and other assets. The supplied scripts are based on the last version delivered in this conversation; merge any newer independent repository changes before replacing them.

In index.html, change the script cache version to:

```html
<script src="./script.js?v=20261115-assets" defer></script>
```

Commit and redeploy through the existing Vercel flow. This package does not deploy itself. No Supabase or Google Sheet changes are needed.

## Download filenames

- NB: `Master Catalog NOV26.pdf`
- FinWizz: `3P Catalog NOV26.pdf`
- CarDekho: `3P | Vehicle Loans Catalog NOV26.pdf`

Month/year follows the download date in Asia/Kolkata and updates automatically. The Vehicle Loans date placeholder is interpreted consistently as MMMYY. Browsers or operating systems may replace the pipe in the Vehicle Loans filename because Windows filenames cannot contain it.

## Page order - every catalog

1. Monthly cover, with the catalog-specific title and partner.
2. Supplied Page 2.png, unchanged.
3. Supplied Page 3.png, unchanged.
4. Existing product tables, then Annexure.
5. Supplied Last Page.png, unchanged, after all content.

Content page numbering begins at Page 4. Fixed artwork is full-page without additional headers or footers. Existing table/Annexure footers and clickable catalog links remain. A missing cover/page/font asset stops the download with an error instead of silently producing an incomplete book. The supplied Page 2 contains the message 'Download is Down'; it is retained exactly as instructed.

## Cover fidelity

The original Master cover supplies the background and original upper-right branding. Its pixels outside the lower panel are preserved. The flattened image's variable-text area was reconstructed with a blank glass panel, then monthly text is rendered in a bundled Montserrat Black font. This is a close template reconstruction, not a guaranteed pixel-exact editable original. For pixel-exact panel/typography fidelity, replace the reconstructed plate with the original text-free template and supply the original font. No image-generation service is called by the website or during downloads.

## Logo handling

29 retrieved logos are added to bank_logos_2.png. Both main and vehicle scripts use the same explicit institution-name lookup over bank_logos.png and bank_logos_2.png. Case, whitespace and punctuation variants normalize; explicit aliases cover names such as AUF, HDBFS and HDFC DSA. Unknown names are not guessed through substring matching. Existing NB/FinWizz remote fallbacks remain for names without bundled logos. Vehicle Loans leaves unknown logos blank.

The spreadsheet does not contain a usable asset for every missing lender. See LOGO-COVERAGE.md and LOGO-SOURCES.csv for remaining gaps and provenance. DMI's supplied file was an unrelated icon and HDB's supplied file contained only a symbol; both were replaced with the lenders' official wordmarks. Some supplied thumbnails are low resolution; higher-resolution originals can replace them later.

The old vehicle substring matching could incorrectly select Indian Bank for South Indian Bank, Muthoot Finance for Muthoot Capital, and Sundaram Home Finance for Sundaram Finance. Those institutions remain unmapped until their specific logos are supplied.

## Existing behavior retained

Vehicle table conditions retain the 300-word threshold, full-width wrapping, and full text in the Annexure above the threshold. Existing NB/FinWizz conditions rules, exclusions, payout calculations, separate feeds, credentials, and footer links remain unchanged.

## Maintenance

catalog-runtime.js is the shared implementation and includes the mapping snapshot from logo-manifest.json. The runtime is embedded at the top of both entry scripts to avoid introducing another required index.html script tag. Use sync-runtime.py after editing catalog-runtime.js or logo-manifest.json. This is a build step, not something required on the deployed site.

## Validation

JavaScript syntax checks passed. All mapped sprite cells loaded and rasterized. Alias and filename checks passed. The actual jsPDF generators produced representative NB, FinWizz and Vehicle Loans PDFs; covers and table/final-page renders were inspected. Browser launch was blocked by this execution environment, so full browser interaction and deployed-site verification remain after installation.
