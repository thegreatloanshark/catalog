/** Original NoBroker Loans UTM builder; no network calls or dependencies. */
export const CAMPAIGN_DEFAULTS = Object.freeze({source:'vh_share', medium:'qr', campaign:'refer_earn_pilot_2026'});
export function cleanTag(value) {
  return String(value ?? '').normalize('NFKD').trim().toLowerCase()
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_-]+/g, '_')
    .replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 90);
}
export function createUTM(input) {
  let url;
  try { url = new URL(input.url); } catch { throw new Error('Enter a valid full https:// URL.'); }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))) {
    throw new Error('Only secure HTTPS URLs are permitted.');
  }
  if (url.username || url.password) throw new Error('URLs with embedded credentials are not allowed.');
  const required = {utm_source:input.source,utm_medium:input.medium,utm_campaign:input.campaign};
  for (const [k,v] of Object.entries(required)) {
    const normalized=cleanTag(v);
    if (!normalized) throw new Error(`${k.replace('utm_','')} is required.`);
    url.searchParams.set(k,normalized);
  }
  for (const [k,v] of Object.entries({utm_content:input.content,utm_term:input.term})) {
    const normalized=cleanTag(v);
    if (normalized) url.searchParams.set(k,normalized);
    else url.searchParams.delete(k);
  }
  return url.toString();
}
/** Referral tokens must originate on the server. This creates a preview only from a supplied issued token. */
export function createReferralUTM({baseUrl,issuedToken,...tags}) {
  if (!/^[A-Za-z0-9_-]{6,128}$/.test(issuedToken || '')) throw new Error('A valid backend-issued referral token is required.');
  const u=new URL(createUTM({url:baseUrl,...CAMPAIGN_DEFAULTS,...tags}));
  u.searchParams.set('ref',issuedToken);
  return u.toString();
}
