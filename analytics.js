/* NoBroker Loans catalog · analytics
   - Google Analytics 4: traffic (page views, sources, devices) and click events for CTRs.
   - Microsoft Clarity: heatmaps and session recordings.
   Both stay off until their IDs below are filled in. Both IDs are public by design (they ship in the
   page source of every site that uses them), so they belong here, not in a secret store.
   This file only observes clicks and changes; it never changes catalog behaviour. */
(function () {
  'use strict';
  var GA4_MEASUREMENT_ID = '';   // e.g. 'G-XXXXXXXXXX'  (GA4 → Admin → Data streams → Web)
  var CLARITY_PROJECT_ID = '';   // e.g. 'abcd1234ef'    (clarity.microsoft.com → Settings → Overview)

  var debug = /[?&]analytics_debug=1\b/.test(location.search);
  var page = document.body && document.body.classList.contains('vehicle-page') ? 'vehicle_loans' : 'catalog';

  /* ---------- Loaders ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (/^G-[A-Z0-9]+$/.test(GA4_MEASUREMENT_ID)) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID, { page_type: page, debug_mode: debug || undefined });
  }
  if (/^[a-z0-9]+$/i.test(CLARITY_PROJECT_ID)) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);
    window.clarity('set', 'page_type', page);
  }
  var gaOn = /^G-/.test(GA4_MEASUREMENT_ID), clarityOn = typeof window.clarity === 'function';

  /* One call sends to both tools: GA4 event (for counts and CTRs) and a Clarity event (to filter
     recordings and heatmaps by what people did). */
  function track(name, params) {
    params = params || {};
    params.page_type = page;
    if (gaOn) gtag('event', name, params);
    if (clarityOn) window.clarity('event', name);
    if (debug) console.log('[analytics]', name, params);
  }
  window.nbTrack = track;

  /* ---------- Context helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function catalogName() {
    if (page === 'vehicle_loans') return 'vehicle';
    var a = $('#catalog-source-switcher [data-catalog-source].active');
    return a ? (a.dataset.catalogSource === 'finwizz' ? 'third_party' : 'nobroker') : 'nobroker';
  }
  function viewName() {
    var p = $('#payout-catalog-tab');
    return p && p.classList.contains('active') ? 'payouts' : 'codes';
  }
  function layoutName() {
    var g = $('#grid-view-btn');
    return g && g.classList.contains('active') ? 'grid' : 'list';
  }
  function device() { return window.matchMedia('(max-width: 640px)').matches ? 'phone' : 'desktop'; }
  function ctx(extra) {
    var o = { catalog: catalogName(), view: page === 'vehicle_loans' ? 'payouts' : viewName(), device_layout: device() };
    if ($('#grid-view-btn')) o.layout = layoutName();
    for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) o[k] = extra[k];
    return o;
  }
  function bankOf(el) {
    var card = el.closest && el.closest('.bank-card');
    return card ? (card.dataset.bank || '') : '';
  }
  function text(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60); }

  /* ---------- Clicks (CTR numerators) ---------- */
  /* Only real taps and clicks count. Controls that drive other controls (dock, shortcuts, bottom bar)
     do it with synthetic events, which are ignored so nothing is counted twice. */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!e.isTrusted || !t || !t.closest) return;
    var el;
    if ((el = t.closest('[data-catalog-source]'))) return track('catalog_switch', ctx({ to: el.dataset.catalogSource === 'finwizz' ? 'third_party' : 'nobroker', control: 'tab' }));
    if ((el = t.closest('#catalog-source-switcher a, #vehicle-catalog-link'))) return track('catalog_switch', ctx({ to: /vehicle/i.test(el.getAttribute('href') || '') ? 'vehicle' : (/third-party/.test(el.getAttribute('href') || '') ? 'third_party' : 'nobroker'), control: 'tab' }));
    if ((el = t.closest('#code-catalog-tab, #payout-catalog-tab'))) return track('view_switch', ctx({ to: el.id === 'payout-catalog-tab' ? 'payouts' : 'codes', control: 'header' }));
    if ((el = t.closest('.top-nav a.nav-pill'))) return track('view_switch', ctx({ to: /payouts/.test(el.getAttribute('href') || '') ? 'payouts' : 'codes', control: 'header' }));
    if ((el = t.closest('#list-view-btn, #grid-view-btn'))) return track('layout_switch', ctx({ to: el.id === 'grid-view-btn' ? 'grid' : 'list', control: 'toolbar' }));
    if ((el = t.closest('#m-dock .m-dock-toggle button'))) return track('layout_switch', ctx({ to: el.dataset.v, control: 'dock' }));
    if ((el = t.closest('.m-story'))) return track('product_shortcut', ctx({ product: el.dataset.v || 'all' }));
    if ((el = t.closest('#m-nav button'))) return track('bottom_nav', ctx({ item: el.dataset.m }));
    if ((el = t.closest('#m-dock .m-dock-band'))) return track('back_to_top', ctx({ control: 'dock_band' }));
    if ((el = t.closest('.card-toggle'))) return track('card_expand', ctx({ bank: bankOf(el), action: el.getAttribute('aria-expanded') === 'true' ? 'collapse' : 'expand' }));
    if ((el = t.closest('[data-details], .details-btn'))) return track('payout_conditions_open', ctx({ bank: bankOf(el) || el.dataset.details || '' }));
    if ((el = t.closest('#download-fab, #download'))) return track('download_click', ctx({ control: 'button' }));
    if ((el = t.closest('#final-download'))) return track('download_pdf', ctx({}));
    if ((el = t.closest('#reset, .m-sheet-reset'))) return track('filters_reset', ctx({}));
    if ((el = t.closest('#select-visible, #clear-selection'))) return track('selection', ctx({ action: el.id === 'select-visible' ? 'select_visible' : 'clear' }));
    if ((el = t.closest('a[href^="http"]'))) {
      try { if (new URL(el.href).host !== location.host) track('outbound_click', ctx({ link_url: el.href, link_text: text(el) })); } catch (_) {}
    }
  }, true);

  /* ---------- Filters ---------- */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!e.isTrusted || !t || !t.id) return;
    var map = { 'product-filter': 'product', 'payment-filter': 'payment_basis', 'city-filter': 'city', product: 'product', bank: 'bank' };
    if (map[t.id]) track('filter_change', ctx({ filter: map[t.id], value: t.value || 'all' }));
  }, true);

  /* ---------- Search (GA4 recommended "search" event, sent once typing pauses) ---------- */
  var searchTimer = null, lastTerm = '';
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!e.isTrusted || !t || !(t.id === 'search-input' || t.id === 'search' || (t.closest && t.closest('#m-dock')))) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      var term = (t.value || '').trim().toLowerCase().slice(0, 100);
      if (!term || term === lastTerm) return;
      lastTerm = term;
      var m = (($('#result-count') || {}).textContent || '').match(/(\d[\d,]*)/);
      track('search', ctx({ search_term: term, terms: term.split(',').filter(function (x) { return x.trim(); }).length, results: m ? Number(m[1].replace(/,/g, '')) : null, box: t.closest('#m-dock') ? 'dock' : 'page' }));
    }, 1200);
  }, true);

  /* ---------- Download unlock outcome (watches the response; does not change it) ---------- */
  if (window.fetch) {
    var realFetch = window.fetch;
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var p = realFetch.apply(this, arguments);
      if (/\/api\/download-auth\b/.test(url)) {
        p.then(function (r) { track('download_unlock', ctx({ result: r.ok ? 'success' : (r.status === 401 || r.status === 400 ? 'wrong_code' : 'error') })); })
         .catch(function () { track('download_unlock', ctx({ result: 'network_error' })); });
      }
      return p;
    };
  }

  /* ---------- Keep the unlock form out of recordings ---------- */
  ['#download-auth-overlay', '#auth'].forEach(function (s) { var el = $(s); if (el) el.setAttribute('data-clarity-mask', 'true'); });
})();
