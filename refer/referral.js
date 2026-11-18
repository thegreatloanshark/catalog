(() => {
  'use strict';
  const status = document.getElementById('attribution-message');
  const form = document.getElementById('referral-form');
  const submit = document.getElementById('submit-referral');
  const token = new URLSearchParams(location.search).get('ref');
  if (!token) { status.textContent = 'To submit a referral, open the unique link shared by your Vertical Head. This preview does not accept submissions.'; return; }
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(token)) { status.textContent = 'This referral link is invalid. Please request a new link from your Vertical Head.'; return; }
  status.textContent = 'Referral link provided. Verification and secure submission are not connected yet; please do not enter personal details for submission.';
  // SECURITY: Do not activate submission merely because a token is present.
  // Integrate an authenticated backend GET /api/referral-config?ref=<token>
  // and enable only upon a verified active campaign result.
  form.addEventListener('submit', (event) => event.preventDefault());
  submit.disabled = true;
})();
