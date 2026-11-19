# NoBroker Loans - Seed-only VH OTP patch

Replaces the referral-table-dependent VH OTP implementation **without changing the Catalog**.

## Apply
Copy `api/_lib/` and `api/vh/` folders from this patch over the corresponding existing folders in the Vercel Catalog repository. Do not modify the root catalog files. The existing `/refer/` frontend remains unchanged.

1. In Supabase **Authentication > Users**, verify that the three VH emails exist. To provision missing accounts, run `scripts/provision-vh-auth.mjs` locally using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service key in frontend assets or paste it into chat. You may also create the users manually through the Supabase dashboard; use the correct email and confirm it.
2. Under Supabase **Authentication > SMTP**, set the sender and SMTP credentials; under **Email Templates > Magic Link**, use `{{ .Token }}` in the body for numeric OTP.
3. In **Vercel > Project > Settings > Environment Variables**, ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` exist and are correct. The OTP endpoints in this patch do not require a service-role key at runtime.
4. Redeploy the Catalog repository. Test a registered VH number and the corresponding email inbox.
5. Run locally: `node test-seed-only.cjs`.

## Important
- The three VH records exist only in server-side allowlist code. Updating an email requires updating this mapping and the matching Supabase Auth user account.
- Unknown phone numbers produce a generic response and no email.
- There is **no referral table**, referral submissions, lead dashboard, sheet synchronization, or personalized referral-link backend in this patch.
- Add rate limiting per IP/phone and CAPTCHA before publishing the endpoint widely. OTP delivery limits in Supabase are not sufficient to protect against abuse.
- This patch must NOT be used as a public directory lookup or a full production authorization system without strengthening access and session controls.
