/* NoBroker Loans referral frontend. Backend endpoints are specified in BACKEND-DESIGN.md. */
(() => {
'use strict';
const form = document.getElementById('referral');
const status = document.getElementById('link-status');
const submit = document.getElementById('submit');
const output = document.getElementById('submit-status');
const params = new URLSearchParams(location.search);
const vh = params.get('vh');
const allowedCampaignKeys = ['utm_source','utm_medium','utm_campaign','utm_content'];
const campaign = Object.fromEntries(allowedCampaignKeys.map(key => [key,(params.get(key)||'').slice(0,120)]));
let validCode = null;
function setMessage(message, type = '') {status.textContent = message;status.className = 'status-message ' + type;}
async function verifyLink() {
  if (!vh || !/^[a-zA-Z0-9_-]{3,48}$/.test(vh)) {
    setMessage('This preview needs a valid Vertical Head referral link before submissions can be accepted.','error'); return;
  }
  try {
    const response = await fetch('/api/referral-config?vh=' + encodeURIComponent(vh), {headers:{'Accept':'application/json'},cache:'no-store'});
    if (!response.ok) throw new Error('not configured');
    const data = await response.json();
    if (data.active === true && data.vh_code === vh) {
      validCode = vh; submit.disabled = false;
      setMessage('Referral link verified. Your submission will be attributed automatically.','ok');
      output.textContent = 'Your referral details will be sent securely to NoBroker Loans.';
    } else {setMessage('This Vertical Head referral link is not active. Please request a valid link.','error');}
  } catch (_) {setMessage('Referral submission is not live yet. The backend connection is pending; your details will not be collected on this preview.','error');}
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!validCode) {setMessage('A verified Vertical Head link is required.','error');return;}
  if (!form.reportValidity()) return;
  const fields = Object.fromEntries(new FormData(form));
  if (fields.referrer_phone === fields.referred_phone) {output.textContent = 'Your mobile number and the referred Loan Partner’s number must be different.';return;}
  submit.disabled = true;output.textContent='Submitting your referral…';
  try {
    const response = await fetch('/api/referrals', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,vh_code:validCode,consent:document.getElementById('consent').checked,utm:campaign})});
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.error || 'Unable to submit. Please try again.');
    output.textContent = 'Referral submitted. Reference: ' + String(data.reference || 'received');
    form.reset();
  } catch(error) {output.textContent = 'Not submitted: ' + error.message;}
  finally {submit.disabled = false;}
});
verifyLink();
})();