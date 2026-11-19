# VH demo OTP - isolated patch

This patch replaces the VH OTP workflow **only**, not the Catalog or actual referral form. No Supabase tables, users, SMTP, or email delivery are needed.

## Apply
Copy `api/_lib/demo.js`, `api/_lib/vh-allowlist.js`, `api/vh/request-otp.js`, `api/vh/verify-otp.js`, `api/vh/profile.js`, `refer/index.html`, and `refer/referral.js` into the identically named paths of your existing Catalog repo. Do not copy/delete unrelated files.

Configure `VH_DEMO_MODE=true` and `VH_DEMO_SIGNING_KEY` (a private cryptographically random value >=32 chars) in Vercel Environment Variables on a **nonpublic preview deployment**, then redeploy. Do not check the secret into Git. There are NO Supabase credentials required by these three demo endpoints. Use the sample `.env.demo.example` as a field list only.

## Try it
Open `/refer/` -> VH Download -> enter a seeded mobile number -> Continue with demo code -> enter **123456** -> Unlock demo profile. Read-only fields: name, DSA code, email, phone. Editable field: designation. The photo upload, PNG export, and referral lead submission remain disabled by design.

## WARNING - NOT REAL AUTHENTICATION
A fixed OTP is **public knowledge**. Anyone who knows or guesses a seeded phone number can retrieve the corresponding test record. Only use this demo with fake/non-sensitive test data, on a restricted preview environment. **Do not turn `VH_DEMO_MODE` on in a public production deployment.** A signed short-lived demo session token prevents arbitrary mutation but does not establish user identity. Do not use this token to authorize access to referral leads, payouts, dashboards, or personal information. Disable `VH_DEMO_MODE` entirely when switching to actual authentication.
