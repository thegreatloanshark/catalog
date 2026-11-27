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

/* ======================================================================
   Mobile layout (≤640px). Adds a bottom tab bar, product "stories" rail and a
   filter bottom sheet. Drives the existing controls only (clicks / change events);
   catalog logic stays in script.js.
   ====================================================================== */
(function(){
  var mq=window.matchMedia('(max-width: 640px)');
  var $=function(s,r){return (r||document).querySelector(s);};
  var toolbarRow=$('.toolbar-row'),cluster=$('#filter-cluster'),viewToggle=$('.view-toggle');
  if(!toolbarRow||!cluster)return;
  var svg=function(d){return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';};
  var ICONS={
    codes:svg('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 13h6"/>'),
    payouts:svg('<circle cx="12" cy="12" r="9"/><path d="M9 9h.01M15 15h.01M15.5 8.5l-7 7"/>'),
    search:svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    filters:svg('<path d="M4 6h16M7 12h10M10 18h4"/>'),
    download:svg('<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>')
  };

  /* ---- Bottom tab bar ---- */
  var nav=document.createElement('nav');
  nav.id='m-nav';nav.setAttribute('aria-label','Catalog navigation');
  nav.innerHTML=[['codes','Codes'],['payouts','Payouts'],['search','Search'],['filters','Filters'],['download','Download']]
    .map(function(x){return '<button type="button" data-m="'+x[0]+'">'+ICONS[x[0]]+'<span>'+x[1]+'</span>'+(x[0]==='filters'?'<b class="m-badge" hidden></b>':'')+'</button>';}).join('');
  document.body.appendChild(nav);

  /* ---- Filter sheet ---- */
  var backdrop=document.createElement('div');backdrop.id='m-sheet-backdrop';
  var sheet=document.createElement('section');
  sheet.id='m-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','m-sheet-title');sheet.hidden=true;
  sheet.innerHTML='<div class="m-sheet-grip" aria-hidden="true"></div><header><h2 id="m-sheet-title">Filters</h2><button type="button" class="m-sheet-reset">Reset</button></header><div class="m-sheet-body"></div><footer><button type="button" class="m-sheet-done">Show results</button></footer>';
  document.body.appendChild(backdrop);document.body.appendChild(sheet);
  var sheetBody=$('.m-sheet-body',sheet),doneBtn=$('.m-sheet-done',sheet),lastFocus=null;
  var selects=function(){return ['#product-filter','#payment-filter','#city-filter'].map(function(s){return $(s);}).filter(Boolean);};
  var setSelect=function(sel,val){if(!sel||sel.value===val)return;sel.value=val;sel.dispatchEvent(new Event('change',{bubbles:true}));};
  function openSheet(){lastFocus=document.activeElement;sheet.hidden=false;document.body.classList.add('m-sheet-open');requestAnimationFrame(function(){sheet.classList.add('open');backdrop.classList.add('open');});var f=$('select',sheet);if(f)f.focus();}
  function closeSheet(){sheet.classList.remove('open');backdrop.classList.remove('open');document.body.classList.remove('m-sheet-open');setTimeout(function(){if(!sheet.classList.contains('open'))sheet.hidden=true;},220);if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  backdrop.addEventListener('click',closeSheet);doneBtn.addEventListener('click',closeSheet);
  $('.m-sheet-reset',sheet).addEventListener('click',function(){selects().forEach(function(s){setSelect(s,'');});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&sheet.classList.contains('open'))closeSheet();});

  /* ---- Product stories rail ---- */
  var rail=document.createElement('div');rail.id='m-stories';rail.setAttribute('role','toolbar');rail.setAttribute('aria-label','Filter by product');
  toolbarRow.insertAdjacentElement('afterend',rail);
  var CAPTION={'':'All',HL:'Home Loan',LAP:'Property',PL:'Personal',BL:'Business',OTHER:'Other'};
  function buildStories(){
    var sel=$('#product-filter');if(!sel){rail.innerHTML='';return;}
    rail.innerHTML=Array.prototype.map.call(sel.options,function(o){
      var v=o.value,short=v?(v==='OTHER'?'+':v):'All',cap=CAPTION[v]||o.textContent.replace(/^\S+\s*[–-]\s*/,'');
      return '<button type="button" class="m-story'+(sel.value===v?' active':'')+'" data-v="'+v.replace(/"/g,'&quot;')+'" aria-pressed="'+(sel.value===v)+'"><span class="m-ring"><span class="m-dot">'+short+'</span></span><span class="m-cap">'+cap+'</span></button>';
    }).join('');
  }
  rail.addEventListener('click',function(e){var b=e.target.closest('.m-story');if(!b)return;var sel=$('#product-filter');var v=b.dataset.v;setSelect(sel,sel&&sel.value===v&&v?'':v);});

  /* ---- State sync ---- */
  function sync(){
    buildStories();
    var n=selects().filter(function(s){return s.value;}).length,badge=$('.m-badge',nav);
    badge.hidden=!n;badge.textContent=n;
    var m=($('#result-count')||{}).textContent||'',r=m.match(/·\s*(\d[\d,]*)/);
    doneBtn.textContent=r?'Show '+r[1]+' results':'Show results';
    var pay=($('#payout-catalog-tab')||{}).classList;
    nav.querySelector('[data-m=codes]').classList.toggle('active',!(pay&&pay.contains('active')));
    nav.querySelector('[data-m=payouts]').classList.toggle('active',!!(pay&&pay.contains('active')));
  }
  new MutationObserver(sync).observe(cluster,{childList:true,subtree:true});
  var rc=$('#result-count');if(rc)new MutationObserver(sync).observe(rc,{childList:true,characterData:true,subtree:true});
  var pt=$('#payout-catalog-tab');if(pt)new MutationObserver(sync).observe(pt,{attributes:true,attributeFilter:['class']});
  document.addEventListener('change',function(e){if(e.target&&e.target.closest&&e.target.closest('#filter-cluster'))sync();});

  nav.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    var a=b.dataset.m;
    if(a==='codes'){var t=$('#code-catalog-tab');if(t)t.click();window.scrollTo({top:0,behavior:'smooth'});}
    else if(a==='payouts'){var p=$('#payout-catalog-tab');if(p)p.click();window.scrollTo({top:0,behavior:'smooth'});}
    else if(a==='search'){var i=$('#search-input');window.scrollTo({top:0,behavior:'smooth'});if(i)setTimeout(function(){i.focus();},250);}
    else if(a==='filters'){openSheet();}
    else if(a==='download'){var d=$('#download-fab');if(d)d.click();}
  });

  /* ---- Enter / leave mobile ---- */
  function apply(){
    if(mq.matches){
      if(cluster.parentElement!==sheetBody)sheetBody.appendChild(cluster);
      var lb=$('#list-view-btn');if(lb&&!lb.classList.contains('active'))lb.click();
    }else{
      if(cluster.parentElement!==toolbarRow)toolbarRow.insertBefore(cluster,viewToggle||null);
      if(sheet.classList.contains('open'))closeSheet();
    }
    sync();
  }
  if(mq.addEventListener)mq.addEventListener('change',apply);else if(mq.addListener)mq.addListener(apply);
  apply();
})();
