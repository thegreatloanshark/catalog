/* Theme helpers. Read-only with respect to catalog state: never changes filters, selection or data. */
(function(){
  var $=function(id){return document.getElementById(id);};

  /* Hero stat tiles mirror the result count. */
  var src=$('result-count');
  if(src){
    var inst=$('stat-institutions'),rec=$('stat-records'),cat=$('stat-source');
    var syncStats=function(){
      var m=(src.textContent||'').match(/(\d[\d,]*)\s+institutions\s*·\s*(\d[\d,]*)/i);
      if(m&&inst&&rec){inst.textContent=m[1];rec.textContent=m[2];}
      var active=document.querySelector('#catalog-source-switcher button.active');
      if(cat&&active)cat.textContent=active.dataset.catalogSource==='finwizz'?'3rd Party':'NoBroker';
    };
    new MutationObserver(syncStats).observe(src,{childList:true,characterData:true,subtree:true});
    syncStats();
  }

  /* Uniform card sizes: overflowing cards get a Show more / Show less toggle. */
  var catalog=$('catalog');if(!catalog)return;
  var expanded=new Set();
  var ICON='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var keyOf=function(card){
    var active=document.querySelector('#catalog-source-switcher button.active');
    return (active?active.dataset.catalogSource:'')+'|'+(card.dataset.bank||'')+'|'+Array.prototype.indexOf.call(catalog.children,card);
  };
  var setState=function(card,btn,open){
    card.classList.toggle('is-expanded',open);
    btn.setAttribute('aria-expanded',String(open));
    btn.innerHTML=(open?'Show less ':'Show more ')+ICON;
  };
  var busy=false;
  var clamp=function(){
    if(busy)return;busy=true;
    var cards=catalog.querySelectorAll(':scope > .bank-card');
    for(var i=0;i<cards.length;i++){
      var card=cards[i],old=card.querySelector(':scope > .card-toggle');
      if(old)old.remove();
      card.classList.remove('is-clamped','is-expanded');
      if(card.scrollHeight<=card.clientHeight+4)continue;
      var key=keyOf(card),btn=document.createElement('button');
      btn.type='button';btn.className='card-toggle';
      btn.setAttribute('aria-label','Show more or less for '+(card.dataset.bank||'this lender'));
      btn.addEventListener('click',(function(c,b,k){return function(e){
        e.stopPropagation();
        var open=!c.classList.contains('is-expanded');
        open?expanded.add(k):expanded.delete(k);
        setState(c,b,open);
        if(!open&&c.getBoundingClientRect().top<0)c.scrollIntoView({block:'nearest'});
      };})(card,btn,key));
      card.classList.add('is-clamped');
      card.appendChild(btn);
      setState(card,btn,expanded.has(key));
    }
    busy=false;
  };
  var timer;var schedule=function(){clearTimeout(timer);timer=setTimeout(clamp,30);};
  new MutationObserver(function(muts){
    for(var i=0;i<muts.length;i++){if(muts[i].target===catalog&&muts[i].type==='childList'){schedule();return;}}
    if(muts.some(function(m){return m.target===catalog&&m.attributeName==='class';}))schedule();
  }).observe(catalog,{childList:true,attributes:true,attributeFilter:['class']});
  var lastW=window.innerWidth;
  window.addEventListener('resize',function(){if(window.innerWidth!==lastW){lastW=window.innerWidth;schedule();}});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(schedule);
  window.addEventListener('load',schedule);
  schedule();
})();
