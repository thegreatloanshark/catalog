# Vertical Head verification - implementation and SMTP setup

## Scope
- Verified phone lookup for Aditya, Asad, Shiv.
- Sends email OTP to **the registered VH email** (not to the sender marketing mailbox).
- After OTP: name, DSA code, email and registered phone shown **read-only**; designation editable.
- Photo upload and PNG generator remain disabled until their backend is wired.
- No public API reveals the master records to someone supplying only a phone number.

## Supabase setup
1. Create/select Supabase project. Run `supabase/referral_vh_schema.sql` in SQL Editor. The table has RLS enabled, no public select policy, and no anon/authenticated grants.
2. In your local shell **only**, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Run `node scripts/seed-vh.mjs`. This creates/links Auth users and upserts the three supplied VH records. Do not expose this key in frontend code or git.
3. In Vercel project settings -> Environment Variables, add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` for server deployment. Do not use `NEXT_PUBLIC_` for secrets.
4. Deploy. Test `/api/vh/request-otp` and `/api/vh/verify-otp`, then `/api/vh/profile` with the returned access token.

## Custom SMTP in Supabase
The intended **From** sender is `Marketing @NB Loans <nbloans.marketing@nobroker.in>`.
1. Confirm you have a legitimate SMTP provider authorized to send email from `nobroker.in`. Having access to the mailbox alone does not create an SMTP server. For a domain email on Google Workspace, you may use its configured Google SMTP credentials/app password if permitted by your organization; otherwise use an authorized transactional email provider and configure SPF/DKIM/DMARC.
2. In Supabase Dashboard -> Project -> Authentication -> SMTP Settings, enable custom SMTP.
3. Set Sender email `nbloans.marketing@nobroker.in`, Sender name `Marketing @NB Loans`, and enter SMTP host, port, username and app password/API password from the authorized provider. Typical Google Workspace settings, when allowed: `smtp.gmail.com`, port 587 (STARTTLS) or 465 (TLS), authorized account, and a Google App Password (requires eligible account and 2-step verification).
4. In Authentication -> Email Templates -> Magic Link, replace link-centric content with an OTP code such as `<p>Your NoBroker Loans verification code is <strong>{{ .Token }}</strong>.</p>`; otherwise the system may email a magic link rather than a numeric code.
5. In Authentication -> Providers -> Email, keep email authentication enabled. Set OTP expiry and throttling appropriate to your organization. Configure the site's allowed URLs, and CAPTCHA / rate limiting before opening publicly.
6. Test with one known VH phone number and check the inbox associated with that VH, e.g. `ad.patra@nobroker.in`, not `nbloans.marketing@nobroker.in`. The marketing address is the **sender**; the VH address is the **recipient**.

## Privacy and rollout requirements
- Do not expose live `referral_vertical_heads` records through anon API policies or static JavaScript.
- Configure rate limiting (per IP and phone) plus CAPTCHA before production; Supabase Auth alone has email limits but is not a complete application-level abuse defense.
- Do not log OTP tokens, bearer tokens, service keys or personal details.
- The verification access token is held in browser memory only and expires; refreshing the page requires signing in again.
- Revoke/deactivate staff access when a VH leaves, and set `is_active=false` as needed.
- For cross-VH referral dashboard access, add ownership-based RLS policies and stronger session lifecycle management.
- The backend has not been deployed to Supabase or Vercel; you must provide/connect project access and SMTP credentials privately through provider settings.
