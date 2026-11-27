'use strict';
// GET /api/catalog — the only path by which the NoBroker catalog leaves Supabase.
// Browsers never talk to Supabase: this function reads it server-side with a secret key
// and returns only the columns the site renders, without "Not to include in catalog" rows.
// Read-only: this file never writes to Supabase.
//
// Vercel environment variables (server-side only; never prefix with NEXT_PUBLIC_):
//   CATALOG_SUPABASE_URL        e.g. https://<project>.supabase.co
//   CATALOG_SUPABASE_SECRET_KEY a backend key (sb_secret_…) for the catalog project

const COLUMNS = [
  'id', 'sourceRow', 'institutionName', 'code', 'grossNet', 'productType', 'variant',
  'productGroup', 'payoutTimeline', 'applicableCities', 'conditions', 'distilledConditions',
  'loginProcess', 'paymentType', 'topSlabLoanVal', 'payoutT1', 'payoutCapping', 'clawback',
  'catalogDirective'
];
const PAGE = 500;
const MAX_PAGES = 40; // 20,000 rows: a guard against a runaway loop, far above the catalog size.
const EXCLUDED = /(?:not\s+to|do\s+not)\s+include\s+in\s+catalog/i;

function settings() {
  const url = String(process.env.CATALOG_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(process.env.CATALOG_SUPABASE_SECRET_KEY || '').trim();
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url) || !key) return null;
  return { url, key };
}

async function get(s, path) {
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

function excluded(row) {
  return Object.values(row).some(v => typeof v === 'string' && EXCLUDED.test(v));
}

function send(res, status, body, cache) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache || 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return send(res, 405, { error: 'Method not allowed' });
  }
  const s = settings();
  if (!s) {
    console.error('api/catalog: CATALOG_SUPABASE_URL / CATALOG_SUPABASE_SECRET_KEY not configured');
    return send(res, 503, { error: 'Catalog service is not configured.' });
  }
  try {
    const rows = [];
    for (let page = 0; ; page++) {
      if (page >= MAX_PAGES) throw new Error('Catalog exceeds page limit');
      const batch = await get(s, `catalog_products?select=${COLUMNS.join(',')}` +
        `&order=sourceRow.asc,id.asc&limit=${PAGE}&offset=${rows.length}`);
      if (!Array.isArray(batch)) throw new Error('Invalid products response');
      rows.push(...batch);
      if (batch.length < PAGE) break;
    }
    const meta = await get(s, 'catalog_metadata?select=metadata&catalog_key=eq.main&limit=1');
    const metadata = (Array.isArray(meta) && meta[0] && meta[0].metadata) || {};
    const records = rows.filter(r => !excluded(r));
    if (!records.length) return send(res, 502, { error: 'Catalog has no products yet.' });
    // Short shared cache: visitors poll every minute; Supabase sees at most ~2 reads a minute per region.
    return send(res, 200, {
      schemaVersion: metadata.schemaVersion || '',
      syncedAt: metadata.syncedAt || '',
      source: metadata.source || {},
      records
    }, 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
  } catch (e) {
    console.error('api/catalog failed:', e && e.message);
    return send(res, 502, { error: 'Catalog is temporarily unavailable.' });
  }
};
