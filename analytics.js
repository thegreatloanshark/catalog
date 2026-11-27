/* NoBroker Loans · analytics (catalog, Vehicle Loans, Refer & Earn, referral tools)
   - Google Analytics 4: traffic and click events (for CTRs).
   - Microsoft Clarity: heatmaps and session recordings.
   Nothing loads until (1) the IDs below are set and (2) the visitor accepts the consent banner.
   Declining, or never answering, loads neither tool and sets no analytics cookies.
   Both IDs are public by design (they ship in the page source of every site that uses them).
   This file only observes clicks and changes; it never changes page behaviour. */
(function () {
  'use strict';
  var GTM_CONTAINER_ID = 'GTM-W3NJTTWH'; // Google Tag Manager: GA4 (and optionally Clarity) are configured inside GTM
  var GA4_MEASUREMENT_ID = '';   // Only if not using GTM: 'G-XXXXXXXXXX' loads GA4 directly. Leave empty with GTM to avoid double counting.
  var CLARITY_PROJECT_ID = '';   // e.g. 'abcd1234ef'    (clarity.microsoft.com → Settings → Overview)

  var CONSENT_KEY = 'nb_analytics_consent'; // 'granted' | 'denied'
  var debug = /[?&]analytics_debug=1\b/.test(location.search);
  var hasGTM = /^GTM-[A-Z0-9]+$/.test(GTM_CONTAINER_ID);
  var hasGA = !hasGTM && /^G-[A-Z0-9]+$/.test(GA4_MEASUREMENT_ID), hasClarity = /^[a-z0-9]+$/i.test(CLARITY_PROJECT_ID);
  if (!hasGTM && !hasGA && !hasClarity && !debug) return; // nothing configured: no banner, no tracking

  var path = location.pathname;
  var page = /\/refer\/tools\//.test(path) ? 'refer_tools'
    : /\/refer\//.test(path) ? 'refer'
    : document.body && document.body.classList.contains('vehicle-page') ? 'vehicle_loans' : 'catalog';
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- Consent ---------- */
  function readConsent() { try { return localStorage.getItem(CONSENT_KEY); } catch (_) { return null; } }
  function saveConsent(v) { try { localStorage.setItem(CONSENT_KEY, v); localStorage.setItem(CONSENT_KEY + '_at', new Date().toISOString()); } catch (_) {} }

  var loaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  function load() {
    if (loaded) return; loaded = true;
    if (hasGTM) {
      // Consent was given before anything loads: analytics granted, advertising never.
      gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      window.dataLayer.push({ page_type: page });
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var g = document.createElement('script');
      g.async = true; g.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_CONTAINER_ID;
      document.head.appendChild(g);
    }
    if (hasGA) {
      gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      var s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
      document.head.appendChild(s);
      gtag('js', new Date());
      gtag('config', GA4_MEASUREMENT_ID, { page_type: page, debug_mode: debug || undefined });
    }
    if (hasClarity) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);
      window.clarity('consent');
      window.clarity('set', 'page_type', page);
    }
  }

  /* Banner and "Cookie settings" link. Styles are inline so they work on every page. */
  var css = '#nb-consent{position:fixed;z-index:90;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;background:#0e0e11;color:#fff;border-radius:18px;padding:16px 18px;box-shadow:0 24px 60px -18px rgba(16,16,24,.55);font:14px/1.5 Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;display:flex;gap:14px;align-items:center;flex-wrap:wrap}' +
    '#nb-consent p{margin:0;flex:1 1 260px;color:rgba(255,255,255,.82);font-size:13px}#nb-consent b{color:#fff}' +
    '#nb-consent .nb-c-actions{display:flex;gap:8px;flex:0 0 auto;margin-left:auto}' +
    '#nb-consent button{height:40px;padding:0 16px;border-radius:12px;font:800 13px Inter,system-ui,sans-serif;cursor:pointer;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff}' +
    '#nb-consent button.nb-c-accept{background:#e00000;border-color:#e00000}' +
    '#nb-consent button:focus-visible{outline:3px solid #ff5a5a;outline-offset:2px}' +
    '.nb-consent-link{background:none;border:0;padding:0;margin-left:12px;font:inherit;color:inherit;text-decoration:underline;cursor:pointer;opacity:.85}' +
    '.nb-consent-link-m{display:none;margin:18px auto 8px;font:600 12px Inter,system-ui,sans-serif;color:#6b6b76;background:none;border:0;text-decoration:underline;cursor:pointer}' +
    '@media (max-width:640px){#nb-consent{left:10px;right:10px;bottom:calc(72px + env(safe-area-inset-bottom))}body:not(:has(#m-nav)) #nb-consent{bottom:10px}#nb-consent .nb-c-actions{width:100%}#nb-consent button{flex:1}.nb-consent-link-m{display:block}}';
  function injectCss() { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }

  function showBanner() {
    if ($('#nb-consent')) return;
    var box = document.createElement('div');
    box.id = 'nb-consent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-live', 'polite'); box.setAttribute('aria-label', 'Analytics cookies');
    box.innerHTML = '<p><b>Analytics cookies.</b> With your permission we use Google Analytics and Microsoft Clarity to see how this catalog is used (visits, clicks, scrolling) so we can improve it. Nothing you type in forms is recorded.</p>' +
      '<div class="nb-c-actions"><button type="button" class="nb-c-decline">Decline</button><button type="button" class="nb-c-accept">Accept</button></div>';
    document.body.appendChild(box);
    box.querySelector('.nb-c-accept').addEventListener('click', function () { saveConsent('granted'); box.remove(); load(); track('consent', { choice: 'granted' }); });
    box.querySelector('.nb-c-decline').addEventListener('click', function () { var was = readConsent(); saveConsent('denied'); box.remove(); if (was === 'granted' && loaded) location.reload(); });
  }
  function addSettingsLinks() {
    var open = function () { showBanner(); };
    var foot = $('.site-footer') || $('body > footer');
    if (foot && !$('.nb-consent-link', foot)) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'nb-consent-link'; b.textContent = 'Cookie settings';
      b.addEventListener('click', open); foot.appendChild(b);
    }
    var main = $('main');
    if ($('#m-nav, .site-shell') && main && !$('.nb-consent-link-m')) { // phones hide the catalog footer
      var m = document.createElement('button'); m.type = 'button'; m.className = 'nb-consent-link-m'; m.textContent = 'Cookie settings';
      m.addEventListener('click', open); main.appendChild(m);
    }
  }

  function start() {
    injectCss(); addSettingsLinks();
    var c = readConsent();
    if (c === 'granted') load(); else if (c !== 'denied') showBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  /* ---------- Events: one call sends to both tools (dropped unless consent was given) ---------- */
  function track(name, params) {
    params = params || {};
    params.page_type = page;
    if (debug) console.log('[analytics]' + (loaded ? '' : ' (not sent: no consent)'), name, params);
    if (!loaded) return;
    if (hasGTM) { var ev = { event: name }; for (var k in params) ev[k] = params[k]; window.dataLayer.push(ev); }
    if (hasGA) gtag('event', name, params);
    if (hasClarity && typeof window.clarity === 'function') window.clarity('event', name);
  }
  window.nbTrack = track;

  /* ---------- Context ---------- */
  var isCatalog = page === 'catalog' || page === 'vehicle_loans';
  function catalogName() {
    if (page === 'vehicle_loans') return 'vehicle';
    var a = $('#catalog-source-switcher [data-catalog-source].active');
    return a ? (a.dataset.catalogSource === 'finwizz' ? 'third_party' : 'nobroker') : 'nobroker';
  }
  function viewName() { var p = $('#payout-catalog-tab'); return p && p.classList.contains('active') ? 'payouts' : 'codes'; }
  function layoutName() { var g = $('#grid-view-btn'); return g && g.classList.contains('active') ? 'grid' : 'list'; }
  function device() { return window.matchMedia('(max-width: 640px)').matches ? 'phone' : 'desktop'; }
  function ctx(extra) {
    var o = { device_layout: device() };
    if (isCatalog) { o.catalog = catalogName(); o.view = page === 'vehicle_loans' ? 'payouts' : viewName(); if ($('#grid-view-btn')) o.layout = layoutName(); }
    for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) o[k] = extra[k];
    return o;
  }
  function bankOf(el) { var card = el.closest && el.closest('.bank-card'); return card ? (card.dataset.bank || '') : ''; }
  function text(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60); }

  /* Only real taps and clicks count. Controls that drive other controls (dock, shortcuts, bottom bar)
     do it with synthetic events, which are ignored so nothing is counted twice. */
  document.addEventListener('click', function (e) {
    var t = e.target, el;
    if (!e.isTrusted || !t || !t.closest || t.closest('#nb-consent')) return;
    if (isCatalog) {
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
    }
    if (page === 'refer') {
      if ((el = t.closest('#vh-send-otp'))) return track('vh_otp_request', ctx({}));
      if ((el = t.closest('#vh-check-otp'))) return track('vh_otp_verify', ctx({}));
      if ((el = t.closest('#vh-tool button.primary'))) return track('vh_creative_download', ctx({}));
      if ((el = t.closest('a.vh-nav'))) return track('refer_nav', ctx({ to: 'vh_tool' }));
    }
    if (page === 'refer_tools') {
      if ((el = t.closest('#tab-utm, #tab-qr'))) return track('tools_tab', ctx({ to: el.id === 'tab-qr' ? 'qr' : 'utm' }));
      if ((el = t.closest('#utm-copy'))) return track('utm_copy', ctx({}));
      if ((el = t.closest('#utm-to-qr'))) return track('utm_to_qr', ctx({}));
      if ((el = t.closest('#bulk-build'))) return track('utm_bulk_preview', ctx({}));
      if ((el = t.closest('#bulk-download'))) return track('utm_bulk_download', ctx({}));
      if ((el = t.closest('#qr-png, #qr-svg'))) return track('qr_download', ctx({ format: el.id === 'qr-svg' ? 'svg' : 'png' }));
    }
    if ((el = t.closest('a[href]'))) {
      var href = el.getAttribute('href') || '';
      try {
        var u = new URL(el.href);
        if (u.host !== location.host) return track('outbound_click', ctx({ link_url: u.origin + u.pathname, link_text: text(el) }));
        if (/\/refer\/?(index\.html)?$/.test(u.pathname) && page !== 'refer') return track('refer_link_click', ctx({ link_text: text(el) }));
        if (href === '../' || /index\.html$/.test(u.pathname) && page.indexOf('refer') === 0) return track('back_to_catalog', ctx({}));
      } catch (_) {}
    }
  }, true);

  /* Form submits (refer pages). Only the fact of submitting is sent, never field values. */
  document.addEventListener('submit', function (e) {
    if (!e.isTrusted || !e.target) return;
    var id = e.target.id;
    if (id === 'referral-form') track('referral_submit', ctx({}));
    else if (id === 'utm-form') track('utm_build', ctx({}));
    else if (id === 'qr-form') track('qr_generate', ctx({}));
  }, true);

  /* Filters (catalog pages) */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!e.isTrusted || !t || !t.id || !isCatalog) return;
    var map = { 'product-filter': 'product', 'payment-filter': 'payment_basis', 'city-filter': 'city', product: 'product', bank: 'bank' };
    if (map[t.id]) track('filter_change', ctx({ filter: map[t.id], value: t.value || 'all' }));
  }, true);

  /* Search (GA4 recommended "search" event, sent once typing pauses; catalog pages only) */
  var searchTimer = null, lastTerm = '';
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!e.isTrusted || !isCatalog || !t || !(t.id === 'search-input' || t.id === 'search' || (t.closest && t.closest('#m-dock')))) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      var term = (t.value || '').trim().toLowerCase().slice(0, 100);
      if (!term || term === lastTerm) return;
      lastTerm = term;
      var m = (($('#result-count') || {}).textContent || '').match(/(\d[\d,]*)/);
      track('search', ctx({ search_term: term, terms: term.split(',').filter(function (x) { return x.trim(); }).length, results: m ? Number(m[1].replace(/,/g, '')) : null, box: t.closest('#m-dock') ? 'dock' : 'page' }));
    }, 1200);
  }, true);

  /* Outcomes of server checks (watches responses; does not change them) */
  if (window.fetch) {
    var realFetch = window.fetch;
    var watched = [[/\/api\/download-auth\b/, 'download_unlock'], [/\/api\/vh\/request-otp\b/, 'vh_otp_request_result'], [/\/api\/vh\/verify-otp\b/, 'vh_otp_verify_result']];
    window.fetch = function (input) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var p = realFetch.apply(this, arguments);
      watched.forEach(function (w) {
        if (!w[0].test(url)) return;
        p.then(function (r) { track(w[1], ctx({ result: r.ok ? 'success' : (r.status === 401 || r.status === 400 ? 'rejected' : 'error') })); })
         .catch(function () { track(w[1], ctx({ result: 'network_error' })); });
      });
      return p;
    };
  }

  /* Keep anything people type out of Clarity recordings */
  function mask() {
    ['#download-auth-overlay', '#auth', '#referral-form', '#vh-tool', '#utm-form', '#qr-form', '#search-input', '#search', '#m-dock']
      .forEach(function (s) { var el = $(s); if (el) el.setAttribute('data-clarity-mask', 'true'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mask); else mask();
  window.addEventListener('load', mask); // the phone dock is built by theme.js, which runs after this file
})();
