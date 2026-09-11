[README_VERSION_HISTORY_CURRENT.md](https://github.com/user-attachments/files/32090266/README_VERSION_HISTORY_CURRENT.md)
# NoBroker Loans Banking Catalog — Feature Version History

This README tracks **product, UX, access, download, workflow and administration features** added to the NoBroker Loans Banking Catalog.

> **Scope note:** Routine catalog-data changes — bank/product additions or removals, payout corrections, code changes, conditions, city applicability, timelines and similar workbook refreshes — are intentionally excluded from this feature history.
>
> **Current state:** Role-aware download-only banking catalog with PDF/XLSX output, product filters, optional payout calculator, guided tutorial, CRM/Internal tools and post-download partner engagement.

---

# 1. Salient User Features

- **Smart Search & Filters** — Search by institution, code, product or city. Stack filters across Institution Type, Payout Processing and Product: General/Co-Op, Spot/MIS, and HL/LAP/PL/BL.
- **Flexible Sorting & Views** — Sort alphabetically; payout-enabled views can also sort by payout/Max Slab. Switch between Grid and List without losing the active filters.
- **Institution Selection** — Select individual institutions, select all visible results, or clear the current selection before generating output.
- **Role-Aware Catalog Access** — Dedicated Public, T1, T2, CRM T1/T2 and Internal experiences, plus credential-specific views such as Pavan's city switch and Basety's personalized output identity.
- **Optional One-Shot Payout Calculator** — Authenticated payout-enabled users can apply one percentage to all eligible selected payouts in a single step, or skip the calculator and retain their normal payout view. The calculation uses the hidden Internal Max Slab and cannot exceed 90% of that maximum.
- **Single Download Flow** — One fixed **Download** action handles both PDF and Excel; browser Print is no longer exposed as a user-facing option.
- **Custom Output Priority** — Reorder General Spot, General MIS, Co-Op Spot and Co-Op MIS groups before generating output. Each institution appears only once.
- **Professional PDF Output** — Page 0 cover, credential-aware identity, desktop A4 Landscape/mobile A4 Portrait, controlled pagination, QR and compliance footer.
- **Structured Excel Output** — Payout Catalog and Payout Conditions sheets, QR above the first table, matching selected institutions and payout logic.
- **Automatic File Naming** — Month/year, city/region and Master Catalog rules are applied automatically according to the active user/view.
- **CRM Master Catalog Access** — CRM T1 and CRM T2 users can generate the corresponding Master Catalog in PDF or XLSX.
- **Internal Team Tools** — Internal View, All User Views, Master Catalogs, Catalog History, Data Admin, Audit Trail and Internal-only operational/SOP fields according to permissions.
- **Tutorial Button** — An on-demand guided walkthrough highlights search, filters, sorting, layouts, selection, access, calculator, download, output priority and utility tools. It can be replayed at any time.
- **“More files. More miles.” Post-Download Moment** — After successful downloads, users see a partner-growth message connecting higher eligible business activity with the possibility of international travel opportunities in 2027, with illustrative destination cues such as Vietnam, Thailand, Indonesia and Cambodia.
- **Quick Access Tools** — Bottom navigation includes Catalog, Call Directory, Contact Us and social shortcuts.
- **Responsive Experience** — Desktop/mobile optimized shell, progressive institution rendering and `Esc` support for dismissing open pop-ups/dialogs.

---

# 2. Version-by-Version Feature History

## Version 1 — Initial Banking Codes & Payout Catalog
- Introduced the searchable NoBroker Loans banking catalog.
- Added institution cards, product details, codes, timelines, conditions and city applicability.
- Established the first hidden print-sheet architecture.

## Version 2 — Access-Based Print Logic
- Made output respect Catalog, T1 and T2 access modes.
- Introduced access-sensitive payout visibility/transformation.

## Version 3 — Explicit Institution Selection
- Added per-institution output selection.
- Added **Select All Visible** and **Clear Selection**.
- Separated output selection from normal search/filter state.

## Version 4 — Authentication Consolidation
- Replaced visible T1/T2 admin tabs with a Login flow.
- Introduced T1, T2 and Internal roles.
- Established the first Internal payout transformation model.

## Version 5 — Individual User Credentials
- Moved from shared role credentials toward named users.
- Added user metadata such as name, designation, city/region and tier.
- Added persistent signed-in sessions until Logout.

## Version 6 — Authentication Architecture Planning
- Separated authentication conceptually from catalog rendering.
- Defined the longer-term direction for server-side identity, role lookup and sessions.
- This was an architecture plan; the current deployed build still uses client-side credential configuration.

## Version 7 — Product Roadmap / Mind Map
- Documented the intended path from static catalog to role-aware multi-user application.
- Established the roadmap for access control, administration, output and backend evolution.

## Version 8 — Partner CRM as Structured Data Source
- Established the Partner CRM workbook as the structured source for catalog generation.
- Formalized field mapping between source columns and application records.

## Version 9 — Co-Op Institution Panel + Grid/List View
- Added General/Co-Op institution handling.
- Added Grid and List presentation modes.

## Version 10 — Multi-Filter Stack + Sorting
- Added combinable Institution Type and Payout Processing filters.
- Added alphabetical sorting and payout-based sorting where authorized.

## Version 11 — Credential Rules + Payout Transformation Engine
- Centralized user/access rules in credential configuration.
- Added consistent payout transformation logic for T1, T2 and Internal views.

## Version 12 — Page 0 Cover
- Added a dedicated first page to generated output.
- Added dynamic month/year catalog title and credential-aware user identity.
- Added Public and Master Catalog cover variants.

## Version 13 — White Site + Crimson Output Theme
- Refined the interface around the NoBroker Loans white/crimson visual system.
- Standardized major output typography and visual emphasis.

## Version 14 — Credential / Output Identity Updates
- Improved how user name, designation and city/region appear in generated output.
- Made output identity follow the authenticated credential profile.

## Version 15 — Temporary Authentication Removal
- Temporarily removed authentication during an intermediate development stage to simplify testing.

## Version 16 — Browser Inspection Deterrent
- Added lightweight browser-side deterrents against casual source inspection.
- Did not replace the need for true server-side security.

## Version 17 — Authentication Restored + Internal All User Views
- Restored authenticated role access.
- Added **All User Views** for Internal users to inspect configured user experiences.

## Version 18 — Sticky Shell + Floating Output CTA
- Introduced a more persistent app shell.
- Added a floating output action for faster access while navigating the catalog.

## Version 19 — Hero / Logo Layout Refinement
- Iterated logo sizing and hero spacing to expose more usable catalog area.
- Reduced unnecessary vertical space.

## Version 20 — Internal Max Slab View
- Replaced Internal “Received %” terminology with **Max Slab %**.
- Added Internal-only slab metadata such as top slab value, highest payout, additional payout and payout capping where available.

## Version 21 — Repeating QR + Compliance Footer
- Added QR and compliance/login-confirmation guidance to generated pages.
- Reserved footer space so compliance content would not overlap institution content.

## Version 22 — Full-Width Desktop Shell + Bottom Navigation
- Expanded the catalog to use more desktop width.
- Added fixed utility navigation for Catalog, Call Directory, Contact Us and social channels.

## Version 23 — Timed Onboarding Advertisement
- Added closable onboarding promotion on desktop/mobile.
- Linked the promotion to NoBroker Loans partner onboarding.

## Version 24 — Top-Left Logo Redirect
- Made the NoBroker Loans logo an onboarding/navigation link.
- Refined logo scale for the compact shell.

## Version 25 — Internal Catalog History
- Added Internal month-wise Catalog History.
- Added archive cards, historical downloads and month-to-month highlights.

## Version 26 — Progressive Institution Loading
- Reduced initial rendering cost by loading institution cards progressively.
- Added incremental loading and loading-state feedback on desktop/mobile.

## Version 27 — External Catalog Data File
- Removed the live catalog dataset from the HTML shell.
- Added asynchronous loading from `catalog-data.json`.

## Version 28 — Four-File Production Structure
- Separated the application into `index.html`, `styles.css`, `script.js` and `catalog-data.json`.
- Established clear responsibility between structure, styling, application logic and catalog data.

## Version 29 — Super Admin Prototype
- Introduced an editable master-data prototype with inline editing, add/delete controls and an audit trail.
- Added local browser persistence and export utilities for admin changes.

## Version 30 — Super Admin Prototype Removed
- Removed the standalone Super Admin experience during a simplification phase.
- Cleaned up associated admin controls and temporary UI announcements.

## Version 31 — Data-Only Release
- Feature details intentionally omitted because this version contained catalog-data maintenance rather than a user-facing feature change.

## Version 32 — Mobile Shell + Output Normalization
- Improved mobile layout, sizing and safe-area behavior.
- Normalized generated output behavior across Chrome/Safari and desktop/mobile.

## Version 33 — Internal Master Catalogs
- Added Internal T1 Master and T2 Master Catalog generation.
- Added Master-specific cover/identity rules.

## Version 34 — Data Admin Restored for Internal Users
- Restored the Data Admin interface inside Internal access.
- Added editable master table, audit trail and JSON/audit exports.

## Version 35 — Device-Specific A4 Pagination
- Added explicit desktop **A4 Landscape** and mobile **A4 Portrait** output rules.
- Added pre-pagination, flow-safe footer placement and continuation-page handling.

## Version 36 — Direct PDF Download
- Added direct PDF generation rather than relying only on the browser print dialog.
- Reused Page 0, access rules, selected institutions, QR/footer and pagination logic.

## Version 37 — Restricted Data Admin Permissions
- Kept Data Admin visible to Internal users but read-only for non-editor users.
- Restricted edit/add/delete controls to the configured editor account.
- Preserved Internal Audit Trail visibility.

## Version 38 — Pavan Dual-City Access + Output Sequencing
- Consolidated Pavan into one login with Bengaluru and Vijaywada views.
- Added category-based output sequencing across General/Co-Op and Spot/MIS.
- Added drag/up-down priority control and duplicate-safe institution ordering.

## Version 39 — Excel Download + CRM Master Access
- Added Excel (`.xlsx`) as a first-class output option.
- Added Payout Catalog and Payout Conditions worksheets.
- Added CRM T1/T2 access to corresponding Master Catalog output.

## Version 40 — Download-Only Flow + QR in Excel
- Removed browser Print from the exposed UI.
- Consolidated output under one **Download** button with PDF/XLSX choices.
- Added QR placement above the first Excel table.

## Version 41 — PDF Staging Cleanup
- Kept internal PDF-rendering/staging elements hidden from the live interface.
- Removed the visible blank/staging box that could appear above institution cards.
- Preserved the existing PDF generation engine.

## Version 42 — Universal `Esc` Popup Dismissal
- Standardized `Esc` behavior across login, output, detail, directory, contact and onboarding overlays.
- Improved keyboard dismissal consistency throughout the app.

## Version 43 — Internal-Only Operational / Invoicing Details
- Restricted operational fields to the Internal Team catalog experience.
- Kept Document Category, Payout MIS Dates and Invoicing Process out of Public/T1/T2/CRM views.
- Included the operational information only in the authorized Internal output flow.

## Version 44 — Product Filter Stack + Basety Credentialed View
- Added **Product** as a third filter category with HL, LAP, PL and BL.
- Made Product filters combinable with Institution Type and Payout Processing.
- Added the Basety credentialed user view with credential-driven output identity.

## Version 45 — Hidden-Max Payout Calculator
- Added a payout-adjustment step before download for the new calculator workflow.
- Calculations use the hidden Internal Max Slab without displaying that value to the user.
- Added a hard ceiling so adjusted payout cannot exceed 90% of the Internal Max Slab.

## Version 46 — One-Shot Payout Preference
- Replaced per-bank payout entry with one global preference.
- A single percentage automatically recalculates all eligible selected payout lines.
- Records without a calculable Internal Max Slab retain their existing payout.

## Version 47 — Optional Calculator for All Authenticated Payout Views
- Extended the one-shot calculator to every authenticated payout-enabled view.
- Added **Skip calculator** so users can keep their normal payout view.
- Public Catalog continues to keep payouts hidden and bypasses the calculator.
- Credential-aware PDF identity was aligned for Basety and other named users.

## Version 48 — “More files. More miles.” Post-Download Experience
- Added a creative engagement pop-up after successful PDF or Excel generation.
- Reinforced the idea that more eligible business and stronger milestones can improve the possibility of international travel opportunities in 2027.
- Added illustrative destination cues for Vietnam, Thailand, Indonesia and Cambodia.

## Version 49 — Guided Tutorial Walkthrough
- Added a multi-step tutorial mask covering search, filters, sorting, layouts, selection, access, calculator, download, output priority and quick-access tools.
- The first prototype explored automatic first-login/IP-based triggering.

## Version 50 — Manual Tutorial Button
- Simplified the tutorial model by removing automatic IP/fingerprint triggering.
- Added a permanent **Tutorial** button so users can start or replay the walkthrough whenever needed.
- Tutorial adapts its access explanation to the active user type.

## Version 51 — Partner Signup CTA + Fresh-Load Hardening
- Updated the **“More files. More miles.”** CTA to open the Loan Partner signup journey.
- Added cache-bypass/no-store handling for live catalog-data fetches to reduce stale browser data after deployments.
- No catalog-data corrections are documented here; those remain outside this feature history.

---

# 3. Current Access Experience

### Public Catalog
- Search, filters, sorting, layouts and institution selection.
- Payout values remain hidden.
- PDF/XLSX download follows public visibility rules.

### T1 / T2 Users
- Credential-based payout view.
- Payout-aware sorting where applicable.
- Optional one-shot payout calculator before download.
- PDF/XLSX output using the active tier logic.

### CRM T1 / T2
- Corresponding T1/T2 payout view.
- Master Catalog PDF/XLSX output.
- No Internal-only Data Admin tools.

### Named / Credential-Specific Views
- Pavan: Bengaluru/Vijaywada switch under one login.
- Basety: credential-driven identity in output and the same optional calculator workflow available to authenticated payout users.

### Internal Team
- Internal Max Slab view.
- All User Views.
- T1/T2 Master Catalogs.
- Catalog History.
- Data Admin and Audit Trail according to permission.
- Internal-only operational/invoicing fields.

---

# 4. Current Download Journey

```text
Select institutions
        ↓
Authenticated payout view?
        ↓
Optional one-shot payout calculator
        ↓
Keep current order OR set output priority
        ↓
Choose PDF or Excel
        ↓
Download
        ↓
“More files. More miles.” partner-growth message
```

The calculator is optional. If used, the chosen factor applies to all eligible selected payout lines and cannot exceed 90% of each record's hidden Internal Max Slab.

---

# 5. Current Output Formats

## PDF
- Page 0 cover
- credential-aware identity where applicable
- desktop A4 Landscape
- mobile A4 Portrait
- selected institutions only
- active access/payout rules
- output sequencing
- QR/compliance footer
- footer-safe pagination

## Excel
- Payout Catalog sheet
- Payout Conditions sheet
- QR above the first table
- selected institutions only
- active access/payout rules
- same output sequence as PDF
- automatic filename rules

---

# 6. Administration & Persistence Note

The current Data Admin editing model remains browser-local unless/until the separate server-side storage/API architecture is implemented. Client-side credentials and permissions are suitable for the current controlled workflow but do not provide the same security guarantees as server-side authentication/authorization.

---

# 7. Feature-History Policy

This README records **features and behavior**. It intentionally does not log routine catalog-data maintenance such as:

- institution/product additions or removals
- payout corrections
- code changes
- slab/value changes
- city applicability updates
- payout timeline changes
- payout-condition changes
- workbook reconciliation changes

Those belong to the data/audit workflow rather than the product feature version history.

---

_Last documented: September 2026 — Feature Version 51_
