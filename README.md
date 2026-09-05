[README_VERSION_HISTORY_UPDATED.md](https://github.com/user-attachments/files/31863294/README_VERSION_HISTORY_UPDATED.md)
# NoBroker Loans Banking Catalog — Version History & Change Log

This README documents the evolution of the NoBroker Loans Banking Catalog from the first prototype through the current production-oriented build.

> **Current state:** Internal Master Catalog + Data Admin build  
> **Current data:** 119 institutions / 378 product records  
> **Current file structure:** `index.html`, `styles.css`, `script.js`, `catalog-data.json`

---

# 1. Version Timeline

## Version 1 — Initial Banking Codes & Payout Catalog

### Objective
Create a searchable bank catalog displaying lending institution data in a clean NoBroker Loans-branded interface.

### Core features
- Catalog landing page
- Search by:
  - institution
  - DSA code
  - city
- Bank cards/grid
- Bank detail modal
- Product-level data for:
  - Home Loan (HL)
  - LAP
- Institution metadata
- Conditions
- Timelines
- City applicability
- DSA codes
- Initial payout catalog structure
- NoBroker Loans branding
- Print-only hidden sheet architecture

### Initial access model
Three views existed:

- Catalog
- T1 Admin
- T2 Admin

Catalog hid payout percentages.

T1 and T2 were originally separate password-protected tabs.

---

## Version 2 — Access-Based Print Logic

### Change
Updated printing so the printed catalog respected the current access mode.

### Rules
- Catalog:
  - payout percentage hidden
- T1:
  - original payout percentage visible
- T2:
  - payout percentage adjusted by `-0.05 percentage points`

Example:

```text
T1: 0.90%
T2: 0.85%
```

### Print improvements
- Printed only filtered/selected institutions
- Access-sensitive payout visibility
- Print table included:
  - bank
  - loan type
  - category
  - DSA code
  - payout basis
  - payout %
  - timeline
  - conditions
  - city

---

## Version 3 — Explicit Bank Selection for Printing

### Change
Printing was separated from normal search/filter state.

### Added
- Print checkbox on every bank card
- Select All Visible
- Clear Selection
- Explicit selected-bank print logic

### Reason
The user needed to control exactly which banks appeared in the printed output.

---

## Version 4 — Authentication Consolidation

### Change
The visible T1/T2 tabs were replaced by a Login flow.

### Login roles introduced
- T1
- T2
- Internal

### Original prototype credentials
Role-based credential pairs were initially used.

### Internal payout rule introduced
Internal represented the gross / 100% receivable value.

Example:

```text
T1: 0.90%
Internal: 1.00%
```

Calculation:

```text
Internal = T1 / 0.90
```

---

## Version 5 — Individual Partner Credentials

### Change
Moved from shared role credentials toward individual partner/user credentials.

### Partner metadata introduced
Each credential could carry:

- name
- designation/title
- city/region
- tier
- mobile number
- role

### Persistent login requirement
Authenticated users stayed logged in until explicit Logout.

---

## Version 6 — Authentication Architecture Planning

### Target authentication model established
The long-term design was changed from passwords to:

```text
Registered ID / Mobile
→ WhatsApp OTP
→ Role Lookup
→ Persistent Session
→ Role-Based Catalog
```

### Important architectural decision
Authentication was separated conceptually from catalog rendering.

Production backend should determine:

- who the user is
- what role they have
- what data they are allowed to receive

---

## Version 7 — Development Roadmap / Mind Map

A site development roadmap was defined.

### Included roadmap areas
- Catalog
- General institutions
- Co-Op institutions
- Finwizz code panel
- Corp Partner / Co-Op code terminology
- PL / BL support
- Internal:
  - slab
  - max %
- Bank-wise:
  - code
  - payout
  - conditions
  - type
- Tier-based catalog logic
- authentication-driven frontend

### Explicitly excluded
FastPay / UniVu was removed from the active scope because it is proprietary software.

---

## Version 8 — Partner CRM Workbook Becomes Data Source

### Source of truth changed
The workbook:

```text
Partner CRM - Backend.xlsx
```

became the primary source of banking/catalog data.

### Data source
`Data` tab used for institution/product records.

### Partner source
`Partners` tab used for credential/user records.

### Expansion
Catalog grew to include:

- HL
- LAP
- PL
- BL
- codes
- General / Co-Op classification
- conditions
- timelines
- city
- payment type
- MIS information
- invoicing
- login process
- additional banking master fields

---

## Version 9 — Co-Op Institution Panel + Grid/List View

### Added
- General Institutions panel
- Co-Op Institutions panel
- Grid view
- List view

### List hover functionality
Hovering over a bank in list view exposed:

- code(s)
- General / Co-Op category

### Record-level filtering
Banks with both General and Co-Op products could appear in both panels while showing only relevant records.

---

## Version 10 — Multi-Filter Stack + Sorting

### Filter Set 1
Institution type:

- General
- Co-Op

### Filter Set 2
Payout processing:

- Spot
- MIS Based

### Filter behavior
Filters became combinable.

Example:

```text
General + Spot
Co-Op + MIS Based
General + Co-Op + Spot
```

### Sorting
Public catalog:
- Name A–Z
- Name Z–A

Authenticated views:
- Name A–Z
- Name Z–A
- Payout High–Low
- Payout Low–High

---

## Version 11 — Credential Role Rules + Payout Transformation Engine

Credential role mapping was formalized.

### Tier 1
Original payout retained.

```text
0.90% → 0.90%
```

### Tier 2 / T2C
Normal percentages:

```text
0.90% → 0.85%
```

NB Receivables expressions:

```text
90% of NB receivables
→ 85% of NB Receivables
```

### Internal
Normal percentage:

```text
0.90%
→ 1.00%
```

Other example:

```text
1.08%
→ 1.20%
```

NB Receivables expression:

```text
90% of NB receivables
→ Define 100% of NB receivables
```

---

## Version 12 — Print Cover Page (“Page 0”)

### Added
Every print command gained exactly one cover page before the catalog.

### Cover content
- NoBroker Loans logo
- Dynamic:
  - Month
  - Year
  - Catalog

Example:

```text
August 2026 Catalog
```

### Authenticated user cover
Printed:

- Name
- Designation
- City / Region

### Public cover
Printed:

```text
NoBroker Loans Team
PAN-INDIA CATALOG
```

### Page behavior
Bank details always started on the next physical page.

---

## Version 13 — White Site + Crimson Print Theme

### Website
Background changed to:

```text
#ffffff
```

### Print
Black print text/elements changed to NoBroker crimson:

```text
#d80000
```

---

## Version 14 — Credential / Print Identity Updates

Partner credentials and names were repeatedly refreshed from updated Partner CRM exports.

### Notable change
Designations standardized to:

- Business Director
- Business Head
- Internal
- T2C

### Full-name updates
User print identities were updated to full partner names.

---

## Version 15 — Authentication Removed Temporarily

### Change
Authentication was temporarily removed.

### Replaced with
A single always-visible User View dropdown.

Available selections:

- General Catalog
- T1 users
- T2 users
- Internal

Selecting a user immediately changed:

- payout logic
- sorting
- print identity
- catalog view

---

## Version 16 — Browser Inspection Deterrent

### Added
Client-side deterrents for casual source inspection:

- right-click disabled
- F12 blocked
- common DevTools shortcuts blocked
- View Source shortcuts blocked
- Save Page shortcuts blocked

### Important limitation
This was explicitly treated as a deterrent only, not real security.

---

## Version 17 — Authentication Restored + Internal “All User Views”

### Authentication restored
Normal login/password flow came back.

### Internal-only feature added
**All User Views**

Internal users could select any configured user and reproduce that user's:

- payout mode
- catalog view
- sorting
- print output
- Page 0 identity

No logout/re-login was required.

---

## Version 18 — Sticky Site Shell + Floating Print CTA

### Desktop shell
Hero, filters and controls became fixed/sticky.

### Scrolling
Only the bank result area scrolled.

### Print CTA
Print button became:

- larger
- fixed/sticky
- red:
  - `#d80000`
- bold white text:
  - `#ffffff`

### Print cover logo
Print Page 0 logo increased to 3× its earlier size.

---

## Version 19 — Hero Logo Experiments

### First iteration
Hero logo increased to 5× its size.

### Next iteration
Large hero logo removed.

### Final direction
Logo moved to top-right/top-left shell during successive layout refinements.

Shell height was reduced to expose more bank grid rows.

---

## Version 20 — Internal Max Slab View

### Internal terminology changed
Internal:

```text
Received %
```

became:

```text
Max Slab %
```

T1/T2 continued to show:

```text
Payout %
```

### Updated source workbook
New General-institution Max Slab data was incorporated.

### Internal-only fields added
Where available:

- Slab
- Top Slab Loan Value
- Highest Payout %
- Payout Capping
- Institution Type
- Additional Payout %
  - takeover
  - high CIBIL score

### Data expansion
Catalog expanded to:

```text
118 institutions
375 product records
```

---

## Version 21 — Repeating QR + Compliance Footer on Print

### Added to every printed page
- QR code
- banker confirmation mandate
- login confirmation instructions

### Mandatory contact emails
Included in print footer:

```text
nbloans.bankconfirmation@nobroker.in
nbloansadmin@nobroker.in
```

### Print footer behavior
Footer repeated across all physical PDF pages.

---

## Version 22 — Full-Width Desktop Shell + Bottom Navigation

### Desktop improvements
- full browser width
- reduced negative space
- tighter shell
- dynamic viewport sizing
- more bank cards per row

### Bottom navigation added
- Catalog
- Call Directory
- Contact Us
- social links

### Contact details
Included:

```text
CRM & Key Accounts Team
+91 95355 01173

Brand Support Team
+91 99450 48798
```

### Social destinations
- LinkedIn
- YouTube
- Substack
- Reddit

---

## Version 23 — Timed Onboarding Advertisement

### Desktop
Popup displayed after:

```text
10 seconds
```

### Mobile
Popup displayed after:

```text
5 seconds
```

### CTA
Redirected to:

```text
https://nobroker.in/dsa-loan
```

### Added
- close button
- outside-click dismissal
- NoBroker Loans campaign creative

---

## Version 24 — Top-Left Logo Redirect

### Added
Top-left NoBroker Loans logo linked to:

```text
https://nobroker.in/dsa-loan
```

### Logo size iterations
The logo was initially made very large, then reduced to approximately 40% of that enlarged state for a more balanced shell.

---

## Version 25 — Internal Catalog History

### Internal-only tab added
**Catalog History**

### Purpose
Retain historical month-end catalog snapshots.

### Historical definition
For month `M`:

```text
M-1 = latest catalog available on the final day of the previous month
```

### Added
- month-wise archive cards
- downloadable historical PDFs
- monthly Highlights section

### Highlights compare
- institution additions
- institution removals
- product additions/removals
- payout changes
- Max Slab changes
- code changes
- conditions changes
- Additional Payout changes
- other master-data changes

### Seeded history
August 2026 month-end archive was created.

---

## Version 26 — Progressive Bank Loading

### Objective
Reduce initial DOM rendering cost.

### Desktop grid
Initial load:

```text
3 grid rows
```

When scrolling to the bottom:

```text
next 3 rows
```

### Mobile
Initial load:

```text
5 banks
```

Each subsequent bottom-scroll:

```text
+5 banks
```

### Added
- buffering/loading indicator
- progressive result count
- progressive selection behavior

---

## Version 27 — External Catalog Data

### Major performance architecture change
The full bank dataset was removed from the HTML.

### New structure

```text
HTML shell
    ↓
fetch("catalog-data.json")
    ↓
render catalog
```

### Result
The HTML no longer had to parse all product data during initial page load.

---

## Version 28 — Four-File Production Structure

The application was separated into:

```text
index.html
styles.css
script.js
catalog-data.json
```

### Responsibilities

#### `index.html`
- static page structure
- DOM containers

#### `styles.css`
- visual design
- responsive layout
- print styling

#### `script.js`
- application behavior
- authentication
- filters
- sorting
- payout transforms
- printing
- progressive loading

#### `catalog-data.json`
- banking/product data only

### Data-update rule established

If bank data changes:

```text
catalog-data.json only
```

Examples:
- payout
- code
- condition
- slab
- city
- product
- timeline

---

## Version 29 — Super Admin Prototype

### Added
A Super Admin prototype was created for:

```text
ID: Shiv
```

### Added features
- editable full catalog table
- inline editing
- add/delete rows
- audit trail
- browser persistence
- Download Updated JSON
- Download Audit CSV

### Status
This Super Admin-specific access was later removed.

---

## Version 30 — Super Admin Removed

### Removed
- Shiv Super Admin access
- Data Admin tab
- editable table
- audit trail
- Super Admin local-storage code

### Also removed
Two UI announcements:
- Partner CRM institution/product status line
- filter explanation text

---

## Version 31 — Latest Workbook Data Refresh

A newer Partner CRM workbook was imported.

### Updated data

```text
119 institutions
378 product records
```

Only:

```text
catalog-data.json
```

needed to change.

---

## Version 32 — Mobile Shell + Print Normalization

### Mobile problem
The sticky shell consumed too much vertical space.

### Fixed using
- `100dvh`
- compact mobile navigation
- compact hero
- compact search
- horizontal filter strip
- reduced bottom navigation height
- more viewport space for banks

### Mobile grid
- 2 columns on normal phones
- 1 column on narrow phones

### Print normalization
Chrome and Safari printing were brought closer together using:

- explicit A4 landscape dimensions
- physical `mm` sizing
- cross-browser page breaks
- `print-color-adjust`
- Safari-friendly layout rules
- deterministic footer dimensions
- deterministic cover sizing
- print delayed until:
  - fonts
  - logo
  - QR
  were fully loaded

---

## Version 33 — Internal Master Catalogs

### Added
Internal-only **Master Catalog** section.

### Dynamic naming

```text
<<MONTH>> <<YEAR>> MASTER CATALOG
```

Example:

```text
September 2026 Master Catalog
```

### Two variants
- T1 Master Catalog
- T2 Master Catalog

### T1 Master
Uses T1 payout rules.

### T2 Master
Uses existing T2 payout rules.

### Master Catalog print identity
No individual user information is printed.

Instead:

```text
NoBroker Loans Team
PAN-INDIA MASTER CATALOG
```

---

## Version 34 — Data Admin Restored for Internal Users

### Current model
Data Admin was brought back, but **not as a separate Super Admin account**.

It is now available to authenticated **Internal users**.

### Features restored
- full editable data table
- inline editing
- add row
- delete row
- search
- browser persistence
- live catalog updates
- audit trail
- timestamp
- user
- institution
- product
- field changed
- old value
- new value
- Download Updated JSON
- Download Audit CSV
- Reset Local Edits

---

# 2. Current Access Structure

## Public Catalog
Available without authentication.

### Can see
- institutions
- codes
- conditions
- timelines
- products
- public metadata

### Cannot see
- payout %
- Max Slab %
- internal-only payout fields

---

## T1 User

### Can see
- Catalog
- T1 payout %

### Payout rule

```text
source payout → unchanged
```

---

## T2 / T2C User

### Can see
- Catalog
- T2 payout %

### Payout rule

Normal percentage:

```text
0.90% → 0.85%
```

NB Receivables:

```text
90% of NB receivables
→ 85% of NB Receivables
```

---

## Internal User

### Can access
- Catalog
- Internal View
- All User Views
- Catalog History
- Master Catalog
- Data Admin

### Internal payout label

```text
Max Slab %
```

### Internal-only data may include
- highest payout %
- slabs
- top slab loan value
- payout capping
- institution type
- additional payout %

---

# 3. Current Internal Navigation

Authenticated Internal users currently have access to:

```text
Catalog
Internal View
All User Views
Catalog History
Master Catalog
Data Admin
Logout
```

---

# 4. Current Print System

Every print command includes:

## Page 0
- NoBroker Loans logo
- Month + Year + Catalog title
- user identity where appropriate

## Individual user print
Shows:

```text
Name
Designation
City/Region
```

## Public print
Shows:

```text
NoBroker Loans Team
PAN-INDIA CATALOG
```

## Master Catalog print
Shows:

```text
NoBroker Loans Team
PAN-INDIA MASTER CATALOG
```

No individual name or contact number appears.

## Every printed page
Contains:
- QR code
- banker confirmation mandate
- login confirmation instructions
- NoBroker Loans compliance/contact text

---

# 5. Current Filters

## Institution Type

```text
General Institutions
Co-Op Institutions
```

## Payout Processing

```text
Spot
MIS Based
```

Filters are combinable.

---

# 6. Current Sorting

## Public

```text
Name A → Z
Name Z → A
```

## T1 / T2 / Internal

```text
Name A → Z
Name Z → A
Payout / Max Slab High → Low
Payout / Max Slab Low → High
```

---

# 7. Current Performance Architecture

## Initial rendering

Desktop:
```text
3 bank rows
```

Mobile:
```text
5 banks
```

Additional records load when the bank scroller reaches the bottom.

## Data architecture

```text
index.html
styles.css
script.js
catalog-data.json
```

`catalog-data.json` is loaded asynchronously.

---

# 8. Current File Responsibilities

## `index.html`

Change when:
- page structure changes
- new navigation tabs are introduced
- new static UI sections are added

---

## `styles.css`

Change when:
- colors change
- spacing/layout changes
- responsive behavior changes
- print styling changes
- mobile/desktop sizing changes

---

## `script.js`

Change when:
- business logic changes
- payout transformation changes
- authentication changes
- filters/sorting changes
- print behavior changes
- Data Admin logic changes
- Catalog History logic changes
- Master Catalog behavior changes

---

## `catalog-data.json`

Change when:
- institution changes
- payout changes
- conditions change
- code changes
- slab changes
- product changes
- city changes
- payout timeline changes
- MIS/invoicing metadata changes
- institutions are added or removed

For normal catalog-data updates, **only this file should need replacement**.

---

# 9. Current Data Snapshot

Current production dataset:

```text
119 institutions
378 product records
```

Current supported products include:

```text
HL
LAP
PL
BL
```

---

# 10. Current Design System

## Primary background

```text
#ffffff
```

## NoBroker crimson

```text
#d80000
```

## Print
Crimson replaces black for major print typography/elements.

## Print button
- red background
- bold white text
- sticky/floating position

---

# 11. Current Bottom Navigation

Includes:

- Catalog
- Call Directory
- Contact Us
- social links

### Contact directory

```text
CRM & Key Accounts Team
+91 95355 01173

Brand Support Team
+91 99450 48798
```

### Social platforms
- LinkedIn
- YouTube
- Substack
- Reddit

---

# 12. Current Onboarding Advertisement

Landing page:

```text
https://nobroker.in/dsa-loan
```

### Desktop
Appears after approximately:

```text
10 seconds
```

### Mobile
Appears after approximately:

```text
5 seconds
```

### Top-left logo
Also redirects to the same NoBroker Loans onboarding page.

---

# 13. Historical / Superseded Features

The following existed in prior versions but are no longer the current design:

- direct T1/T2 visible admin tabs
- shared role passwords
- temporary password-free user dropdown
- separate Shiv Super Admin account
- embedded full catalog dataset inside HTML
- large hero logo
- full-page scrolling
- print preparation on every catalog interaction
- original Received % naming for Internal

---

# 14. Current Production Principle

The current design follows this separation:

```text
index.html
→ structure

styles.css
→ presentation

script.js
→ behavior

catalog-data.json
→ banking data
```

Routine bank/payout changes should therefore not require rebuilding the application.

---

# 15. Recommended Next Production Step

The current static architecture works well for controlled deployment, but the natural next step for a fully secure multi-user production application would be:

```text
Frontend
    ↓
Backend API
    ↓
Authentication / Sessions
    ↓
Role Permissions
    ↓
Banking Database
    ↓
Audit Database
```

This would allow:

- centralized Data Admin edits
- true server-side audit trails
- user-level sessions
- secure Internal/T1/T2 data delivery
- automatic month-end snapshots
- centralized Catalog History
- simultaneous updates across all users
- no manual replacement of `catalog-data.json`

---

# 16. Current Version Summary

**Current version: Internal Master Catalog + Internal Data Admin**

Key capabilities:

```text
✓ Public catalog
✓ T1 catalog
✓ T2 catalog
✓ Internal Max Slab view
✓ Internal All User Views
✓ Internal Catalog History
✓ Internal T1 Master Catalog
✓ Internal T2 Master Catalog
✓ Internal Data Admin
✓ Audit trail
✓ General / Co-Op filters
✓ Spot / MIS filters
✓ Grid / List views
✓ Progressive rendering
✓ Desktop full-width shell
✓ Compact mobile shell
✓ Chrome/Safari normalized printing
✓ Page 0 print cover
✓ QR/compliance footer
✓ Historical PDF archive
✓ Social/contact navigation
✓ Timed onboarding ad
✓ Four-file production architecture
✓ External JSON data source
✓ 119 institutions
✓ 378 product records
```

---

---

## Version 35 — Device-Specific A4 Print Pagination

### Objective
Standardize printed output across Chrome, Safari, desktop, and mobile while preventing the repeating footer from overlapping catalog headers/content.

### Desktop print
Requests:

```text
A4 Landscape
```

### Mobile print
Requests:

```text
A4 Portrait
```

### Print engine changes
The print system moved away from a browser-dependent fixed footer and now builds explicit physical page sheets before the print dialog opens.

### Added / changed
- explicit A4 physical dimensions
- device-specific orientation
- footer placed in normal page flow
- reserved footer space on every page
- QR/footer cannot float over the page header
- selection-count-independent pagination
- bank sections split across pages when necessary
- continuation pages repeat the relevant bank heading
- same pagination logic applies to:
  - public catalog
  - T1
  - T2
  - Internal
  - Internal Master Catalogs

### Result
Printing 1 bank or the full catalog follows the same page-generation rules.

> Browser print dialogs can still allow the end user to manually override paper size or orientation.

---

## Version 36 — Direct PDF Download

### Objective
Allow users to save the selected catalog directly as a PDF instead of relying only on the browser Print dialog.

### Added
A separate:

```text
Download PDF
```

action alongside Print.

### Download behavior
The direct PDF uses the same:

- selected institutions
- filters
- access view
- payout / Max Slab logic
- Page 0
- QR/compliance footer
- desktop/mobile A4 orientation
- pagination rules

as the Print action.

### File naming convention

```text
<<user>>_<<city>>_<<mmm-yy>>_catalog.pdf
```

Example:

```text
Sriram_Pavan_Bengaluru_sep-26_catalog.pdf
```

A hyphen is used instead of `/` because `/` cannot be used safely inside filenames.

### Performance
PDF-generation libraries are loaded only when **Download PDF** is triggered, so they do not add to the normal initial catalog load.

---

## Version 37 — Internal Data Admin Permission Model

### Objective
Retain Data Admin for the Internal team while restricting actual data mutation to one authorized editor.

### Visibility

#### Public / T1 / T2

```text
Data Admin = unavailable
```

#### Internal users

```text
Data Admin = available
Master table = read-only
Audit Trail = viewable
```

#### Shiv

```text
Data Admin = available
Master table = editable
```

### Shiv editor credential

```text
ID: Shiv
Password: 1399
```

### Shiv-only editing capabilities
- inline field editing
- add records
- delete records
- reset browser edits
- generate/update audit entries

### Internal read-only capabilities
All authenticated Internal users can inspect:

- complete master-data table
- audit trail
- current catalog state

but cannot mutate catalog data unless the signed-in user is Shiv.

### Audit Trail
Changes continue to record:

- timestamp
- editor
- institution
- product
- field changed
- old value
- new value

### Existing Internal tools retained
This permission change does not remove:

- Internal Max Slab view
- All User Views
- Catalog History
- T1 Master Catalog
- T2 Master Catalog
- Print
- Download PDF

---

# 17. Updated Current Internal Navigation

Authenticated Internal users currently have access to:

```text
Catalog
Internal View
All User Views
Catalog History
Master Catalog
Data Admin
Logout
```

### Data Admin permissions

```text
Internal user (non-Shiv)
→ read-only master table
→ read-only audit trail visibility

Shiv
→ full editable master table
→ add/delete/edit
→ audit-generating changes
```

---

# 18. Updated Current Print & Download System

## Print

### Desktop

```text
A4 Landscape
```

### Mobile

```text
A4 Portrait
```

The catalog is pre-paginated before the browser print dialog opens.

### Footer
Each generated page reserves space for:

- QR code
- banker confirmation mandate
- login confirmation instructions
- NoBroker Loans compliance text

The footer is part of page flow and should not overlap page headers or bank content.

## Direct PDF Download

Users can also generate the same catalog directly as PDF.

Filename format:

```text
<<user>>_<<city>>_<<mmm-yy>>_catalog.pdf
```

Both Print and Download PDF use the same catalog-selection and access rules.

---

# 19. Updated Current Version Summary

**Current version: Internal Master Catalog + Device-Specific Print + Direct PDF + Restricted Internal Data Admin**

Key capabilities:

```text
✓ Public catalog
✓ T1 catalog
✓ T2 catalog
✓ Internal Max Slab view
✓ Internal All User Views
✓ Internal Catalog History
✓ Internal T1 Master Catalog
✓ Internal T2 Master Catalog
✓ Internal Data Admin
✓ Internal read-only Data Admin for non-Shiv users
✓ Shiv-only editable Data Admin
✓ Audit trail
✓ General / Co-Op filters
✓ Spot / MIS filters
✓ Grid / List views
✓ Progressive rendering
✓ Desktop full-width shell
✓ Compact mobile shell
✓ Desktop A4 Landscape print
✓ Mobile A4 Portrait print
✓ Pre-paginated footer-safe printing
✓ Direct PDF download
✓ Dynamic PDF filename
✓ Page 0 print cover
✓ QR/compliance footer
✓ Historical PDF archive
✓ Social/contact navigation
✓ Timed onboarding ad
✓ Four-file production architecture
✓ External JSON data source
✓ 119 institutions
✓ 378 product records
```

---

_Last documented: September 2026_
