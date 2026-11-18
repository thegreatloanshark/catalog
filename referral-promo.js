(() => {
  'use strict';
  // Campaign prompt appears once per tab session; no popup on the referral route itself.
  if (location.pathname.includes('/refer/')) return;
  let dismissed = false;
  try { dismissed = sessionStorage.getItem('nbl_referral_promo_seen') === '1'; } catch (_) {}
  if (dismissed) return;
  const show = () => {
    if (document.hidden || document.getElementById('nbl-referral-promo-backdrop')) return;
    const backdrop = document.createElement('div');
    backdrop.id='nbl-referral-promo-backdrop';
    backdrop.innerHTML = '<section id="nbl-referral-promo" role="dialog" aria-modal="true" aria-labelledby="nbl-promo-heading"><button class="promo-close" type="button" aria-label="Close referral promotion">×</button><div class="promo-eyebrow">NOBROKER LOANS · REFER &amp; EARN</div><h2 id="nbl-promo-heading">Your network.<br><em>Your rewards.</em></h2><p>Know a Loan Partner who should join NoBroker Loans? Explore our referral program and how to participate.</p><a class="promo-cta" href="./refer/">Explore Refer &amp; Earn</a></section>';
    const prior = document.activeElement;
    const close = () => { backdrop.remove(); try { sessionStorage.setItem('nbl_referral_promo_seen','1'); } catch (_) {} document.removeEventListener('keydown',escape); if(prior && prior.focus) prior.focus(); };
    const escape = e => { if(e.key==='Escape') close(); if(e.key==='Tab'){ const a=[...backdrop.querySelectorAll('button,a')];const first=a[0],last=a[a.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()} } };
    backdrop.querySelector('button').addEventListener('click',close);
    backdrop.addEventListener('click',e=>{ if(e.target===backdrop) close(); });
    document.addEventListener('keydown',escape);
    document.body.appendChild(backdrop);
    backdrop.querySelector('button').focus();
    try { sessionStorage.setItem('nbl_referral_promo_seen','1'); } catch (_) {}
  };
  const start=()=>{window.setTimeout(show,3000)};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
