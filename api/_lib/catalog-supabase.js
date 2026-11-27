'use strict';
// Server-side access to the catalog's Supabase project. Never imported by browser code.
//   CATALOG_SUPABASE_URL        https://<project>.supabase.co
//   CATALOG_SUPABASE_SECRET_KEY backend key (sb_secret_…); keep it out of the repo and the browser
function catalogSettings() {
  const url = String(process.env.CATALOG_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(process.env.CATALOG_SUPABASE_SECRET_KEY || '').trim();
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url) || !key) return null;
  return { url, key };
}

async function catalogGet(s, path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const resp = await fetch(`${s.url}/rest/v1/${path}`, {
      headers: { apikey: s.key, Authorization: `Bearer ${s.key}` },
      signal: controller.signal
    });
    if (!resp.ok) throw new Error(`Supabase responded ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timer);
  }
}

function sendJSON(res, status, body, cache) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache || 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}

module.exports = { catalogSettings, catalogGet, sendJSON };
