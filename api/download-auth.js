'use strict';
// POST /api/download-auth  { id, code }  ->  200 { ok: true } | 401 | 400 | 503
// Checks the PDF download ID/code against Supabase, server-side. The credential is stored in
// public.catalog_download_access as SHA-256 of "<id>:<code>" (the ID trimmed, the code as typed).
// Nothing about the credential ships to the browser. Read-only: never writes to Supabase.
const crypto = require('crypto');
const { catalogSettings, catalogGet, sendJSON } = require('./_lib/catalog-supabase');

const MAX_FIELD = 200;
const FAIL_DELAY_MS = 700; // slows guessing; the endpoint has no other rate limit

const wait = ms => new Promise(r => setTimeout(r, ms));
const sha256 = text => crypto.createHash('sha256').update(text, 'utf8').digest();

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 4096) throw new Error('Body too large');
  }
  return raw ? JSON.parse(raw) : {};
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJSON(res, 405, { error: 'Method not allowed' });
  }
  let id, code;
  try {
    const body = await readBody(req);
    id = typeof body.id === 'string' ? body.id.trim() : '';
    code = typeof body.code === 'string' ? body.code : '';
  } catch {
    return sendJSON(res, 400, { error: 'Invalid request.' });
  }
  if (!id || !code || id.length > MAX_FIELD || code.length > MAX_FIELD) {
    return sendJSON(res, 400, { error: 'Enter both ID and code.' });
  }
  const s = catalogSettings();
  if (!s) {
    console.error('api/download-auth: CATALOG_SUPABASE_URL / CATALOG_SUPABASE_SECRET_KEY not configured');
    return sendJSON(res, 503, { error: 'Download access is not configured.' });
  }
  let rows;
  try {
    rows = await catalogGet(s, 'catalog_download_access?select=credential_sha256&active=is.true');
    if (!Array.isArray(rows)) throw new Error('Invalid response');
  } catch (e) {
    console.error('api/download-auth lookup failed:', e && e.message);
    return sendJSON(res, 503, { error: 'Unable to verify right now. Try again.' });
  }
  const given = sha256(`${id}:${code}`);
  let match = false;
  for (const row of rows) {
    const hex = String((row && row.credential_sha256) || '').trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(hex)) continue;
    if (crypto.timingSafeEqual(given, Buffer.from(hex, 'hex'))) match = true;
  }
  if (!match) {
    await wait(FAIL_DELAY_MS);
    return sendJSON(res, 401, { error: 'Incorrect ID or code.' });
  }
  return sendJSON(res, 200, { ok: true });
};
