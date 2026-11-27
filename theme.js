/* Mirrors the result count into the hero stat tiles. Read-only: never changes catalog state. */
(function(){
  var src=document.getElementById('result-count');if(!src)return;
  var inst=document.getElementById('stat-institutions'),rec=document.getElementById('stat-records'),cat=document.getElementById('stat-source');
  function sync(){
    var m=(src.textContent||'').match(/(\d[\d,]*)\s+institutions\s*·\s*(\d[\d,]*)/i);
    if(m){inst.textContent=m[1];rec.textContent=m[2];}
    var active=document.querySelector('#catalog-source-switcher button.active');
    if(cat&&active)cat.textContent=active.dataset.catalogSource==='finwizz'?'3rd Party':'NoBroker';
  }
  new MutationObserver(sync).observe(src,{childList:true,characterData:true,subtree:true});
  sync();
})();
