# Referral-only change set

This package contains **only new referral-page files** plus the one-line Catalog navigation change. No other Catalog functionality is replaced.

## Copy these new files into the existing repository

- `refer/index.html`
- `refer/referral.css`
- `refer/referral.js`
- `assets/catalog-brand-icon.png`

## One modification to existing code

In root `index.html`, inside `<nav class="top-nav" id="top-nav">`, add this one line after the existing Code Catalog/Payouts buttons:

```html
<a class="nav-pill" href="./refer/" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:center">Refer &amp; Earn</a>
```

No edits to `script.js`, `styles.css`, catalog data, payout logic, vehicles, or runtime files.

## Current limitations

- `/refer/?vh=VH001` is the proposed URL shape, not an active referral code.
- The form deliberately requires `/api/referral-config` to validate the VH and `/api/referrals` to accept a submission. Those backend endpoints **are not included** and the submit button remains disabled until they exist.
- The ₹5,000 wording is subject to campaign approval.
- Deployment assumes the Catalog site serves directory routes such as `/refer/` as `refer/index.html`.

To remove the feature, delete the 4 added files and remove the one navigation line.
