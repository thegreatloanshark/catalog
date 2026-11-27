'use strict';
const { catalogSettings, catalogGet, sendJSON } = require('./_lib/catalog-supabase');
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

function excluded(row) {
  return Object.values(row).some(v => typeof v === 'string' && EXCLUDED.test(v));
}

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return sendJSON(res, 405, { error: 'Method not allowed' });
  }
  const s = catalogSettings();
  if (!s) {
    console.error('api/catalog: CATALOG_SUPABASE_URL / CATALOG_SUPABASE_SECRET_KEY not configured');
    return sendJSON(res, 503, { error: 'Catalog service is not configured.' });
  }
  try {
    const rows = [];
    for (let page = 0; ; page++) {
      if (page >= MAX_PAGES) throw new Error('Catalog exceeds page limit');
      const batch = await catalogGet(s, `catalog_products?select=${COLUMNS.join(',')}` +
        `&order=sourceRow.asc,id.asc&limit=${PAGE}&offset=${rows.length}`);
      if (!Array.isArray(batch)) throw new Error('Invalid products response');
      rows.push(...batch);
      if (batch.length < PAGE) break;
    }
    const meta = await catalogGet(s, 'catalog_metadata?select=metadata&catalog_key=eq.main&limit=1');
    const metadata = (Array.isArray(meta) && meta[0] && meta[0].metadata) || {};
    const records = rows.filter(r => !excluded(r));
    if (!records.length) return sendJSON(res, 502, { error: 'Catalog has no products yet.' });
    // Short shared cache: visitors poll every minute; Supabase sees at most ~2 reads a minute per region.
    return sendJSON(res, 200, {
      schemaVersion: metadata.schemaVersion || '',
      syncedAt: metadata.syncedAt || '',
      source: metadata.source || {},
      records
    }, 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
  } catch (e) {
    console.error('api/catalog failed:', e && e.message);
    return sendJSON(res, 502, { error: 'Catalog is temporarily unavailable.' });
  }
};
