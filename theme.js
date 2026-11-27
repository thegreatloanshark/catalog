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
  var toolbarRow=$('.toolbar-row'),cluster=$('#filter-cluster');
  if(!toolbarRow||!cluster)return;
  var clusterNext=cluster.nextElementSibling; // where the filters return to on wider screens
  var VEHICLE=document.body.classList.contains('vehicle-page');
  var CFG=VEHICLE?{
    product:'#product',selects:['#product','#bank'],defaults:{'#product':'all','#bank':''},
    search:'#search',download:'#download',
    caption:{all:'All',newCar:'New Car',usedCar:'Used Car'},dot:{all:'All',newCar:'New',usedCar:'Used'}
  }:{
    product:'#product-filter',selects:['#product-filter','#payment-filter','#city-filter'],defaults:{},
    search:'#search-input',download:'#download-fab',
    caption:{'':'All',HL:'Home Loan',LAP:'Property',PL:'Personal',BL:'Business',OTHER:'Other'},dot:{'':'All',OTHER:'+'}
  };
  var dflt=function(sel){return CFG.defaults[sel]||'';};
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
  var selects=function(){return CFG.selects.map(function(s){return $(s);}).filter(Boolean);};
  var active=function(){return CFG.selects.filter(function(s){var el=$(s);return el&&el.value!==dflt(s);}).length;};
  var setSelect=function(sel,val){if(!sel||sel.value===val)return;sel.value=val;sel.dispatchEvent(new Event('change',{bubbles:true}));};
  function openSheet(){lastFocus=document.activeElement;sheet.hidden=false;document.body.classList.add('m-sheet-open');requestAnimationFrame(function(){sheet.classList.add('open');backdrop.classList.add('open');});var f=$('select',sheet);if(f)f.focus();}
  function closeSheet(){sheet.classList.remove('open');backdrop.classList.remove('open');document.body.classList.remove('m-sheet-open');setTimeout(function(){if(!sheet.classList.contains('open'))sheet.hidden=true;},220);if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  backdrop.addEventListener('click',closeSheet);doneBtn.addEventListener('click',closeSheet);
  $('.m-sheet-reset',sheet).addEventListener('click',function(){
    if(VEHICLE){var r=$('#reset');if(r)r.click();sync();return;}
    selects().forEach(function(s){setSelect(s,'');});
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&sheet.classList.contains('open'))closeSheet();});

  /* ---- Product stories rail ---- */
  var rail=document.createElement('div');rail.id='m-stories';rail.setAttribute('role','toolbar');rail.setAttribute('aria-label','Filter by product');
  toolbarRow.insertAdjacentElement('afterend',rail);
  function buildStories(){
    var sel=$(CFG.product);if(!sel){rail.innerHTML='';return;}
    rail.innerHTML=Array.prototype.map.call(sel.options,function(o){
      var v=o.value,short=CFG.dot[v]||v,cap=CFG.caption[v]||o.textContent.replace(/^\S+\s*[–-]\s*/,'');
      return '<button type="button" class="m-story'+(sel.value===v?' active':'')+'" data-v="'+v.replace(/"/g,'&quot;')+'" aria-pressed="'+(sel.value===v)+'"><span class="m-ring"><span class="m-dot">'+short+'</span></span><span class="m-cap">'+cap+'</span></button>';
    }).join('');
  }
  rail.addEventListener('click',function(e){var b=e.target.closest('.m-story');if(!b)return;var sel=$(CFG.product),v=b.dataset.v,d=dflt(CFG.product);setSelect(sel,sel&&sel.value===v&&v!==d?d:v);});

  /* ---- State sync ---- */
  function sync(){
    buildStories();
    var n=active(),badge=$('.m-badge',nav);
    badge.hidden=!n;badge.textContent=n;
    var m=($('#result-count')||{}).textContent||'',r=m.match(/·\s*(\d[\d,]*)/);
    doneBtn.textContent=r?'Show '+r[1]+' results':'Show results';
    var pay=($('#payout-catalog-tab')||{}).classList;
    nav.querySelector('[data-m=codes]').classList.toggle('active',!VEHICLE&&!(pay&&pay.contains('active')));
    nav.querySelector('[data-m=payouts]').classList.toggle('active',!VEHICLE&&!!(pay&&pay.contains('active')));
  }
  new MutationObserver(sync).observe(cluster,{childList:true,subtree:true});
  var rc=$('#result-count');if(rc)new MutationObserver(sync).observe(rc,{childList:true,characterData:true,subtree:true});
  var pt=$('#payout-catalog-tab');if(pt)new MutationObserver(sync).observe(pt,{attributes:true,attributeFilter:['class']});
  document.addEventListener('change',function(e){if(e.target&&e.target.closest&&e.target.closest('#filter-cluster'))sync();});
  if(VEHICLE){var vc=$('#catalog');if(vc)new MutationObserver(sync).observe(vc,{childList:true});}

  nav.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    var a=b.dataset.m;
    if(VEHICLE&&(a==='codes'||a==='payouts')){location.href='./index.html'+(a==='payouts'?'#payouts':'');return;}
    if(a==='codes'){var t=$('#code-catalog-tab');if(t)t.click();window.scrollTo({top:0,behavior:'smooth'});}
    else if(a==='payouts'){var p=$('#payout-catalog-tab');if(p)p.click();window.scrollTo({top:0,behavior:'smooth'});}
    else if(a==='search'){var i=$(CFG.search);window.scrollTo({top:0,behavior:'smooth'});if(i)setTimeout(function(){i.focus();},250);}
    else if(a==='filters'){openSheet();}
    else if(a==='download'){var d=$(CFG.download);if(d)d.click();}
  });

  /* ---- Enter / leave mobile ---- */
  function apply(){
    if(mq.matches){
      if(cluster.parentElement!==sheetBody)sheetBody.appendChild(cluster);
      var lb=$('#list-view-btn');if(lb&&!lb.classList.contains('active'))lb.click();
    }else{
      if(cluster.parentElement!==toolbarRow)toolbarRow.insertBefore(cluster,clusterNext&&clusterNext.parentElement===toolbarRow?clusterNext:null);
      if(sheet.classList.contains('open'))closeSheet();
    }
    sync();
  }
  if(mq.addEventListener)mq.addEventListener('change',apply);else if(mq.addListener)mq.addListener(apply);
  apply();
})();

/* ======================================================================
   Vehicle Loans page: hero counts, result line, search clear, and row labels
   for the phone card layout. Reads the DOM that vehicle-loans.js renders.
   ====================================================================== */
(function(){
  if(!document.body.classList.contains('vehicle-page'))return;
  var cat=document.getElementById('catalog'),count=document.getElementById('result-count');
  var inst=document.getElementById('stat-institutions'),rec=document.getElementById('stat-records');
  var search=document.getElementById('search'),clear=document.getElementById('search-clear');
  if(clear&&search)clear.addEventListener('click',function(){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));search.focus();});
  function update(){
    var lenders=new Set(),rows=0;
    cat.querySelectorAll('section:not(:has(details)) table').forEach(function(t){
      var heads=Array.prototype.map.call(t.querySelectorAll('thead th'),function(th){return th.textContent.trim();});
      t.querySelectorAll('tbody tr').forEach(function(tr){
        rows++;
        Array.prototype.forEach.call(tr.children,function(td,i){td.setAttribute('data-label',heads[i]||'');if(i===0)lenders.add(td.textContent.trim());});
      });
    });
    cat.querySelectorAll('details table').forEach(function(t){
      var heads=Array.prototype.map.call(t.querySelectorAll('thead th'),function(th){return th.textContent.trim();});
      t.querySelectorAll('tbody tr').forEach(function(tr){Array.prototype.forEach.call(tr.children,function(td,i){td.setAttribute('data-label',heads[i]||'');});});
    });
    if(inst)inst.textContent=lenders.size;
    if(rec)rec.textContent=rows;
    if(count)count.textContent=rows?'Showing '+lenders.size+' lenders · '+rows+' payout rows':(cat.textContent.trim()?'No products match these filters':'');
  }
  new MutationObserver(update).observe(cat,{childList:true});
  update();
})();

/* Main catalog: open a view requested by link (#payouts, #third-party), e.g. from the Vehicle Loans page. */
(function(){
  var rc=document.getElementById('result-count');
  if(!rc||!document.getElementById('payout-catalog-tab'))return;
  var pending=null;
  var go=function(){
    if(!pending||!/\d/.test(rc.textContent))return;
    var h=pending;pending=null;
    var el=h==='#payouts'?document.getElementById('payout-catalog-tab'):document.querySelector('[data-catalog-source=finwizz]');
    if(el)el.click();
    if(history.replaceState)history.replaceState(null,'',location.pathname+location.search);
  };
  var read=function(){var h=(location.hash||'').toLowerCase();if(h==='#payouts'||h==='#third-party'){pending=h;go();}};
  new MutationObserver(go).observe(rc,{childList:true,characterData:true,subtree:true});
  window.addEventListener('hashchange',read);
  read();
})();
