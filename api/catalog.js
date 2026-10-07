const fs=require('fs'); const path=require('path');
const {authFromReq}=require('./_lib/auth');
const DATA=JSON.parse(fs.readFileSync(path.join(__dirname,'_data','catalog-data.json'),'utf8'));
const CLASSIFICATION=JSON.parse(fs.readFileSync(path.join(__dirname,'_data','institution-classification.json'),'utf8'));

function meaningful(v){return v!==null&&v!==undefined&&String(v).trim()!==''&&String(v).trim()!=='-';}
function floorRule(value){
  let n=Math.floor((Number(value)+1e-10)*100)/100;
  const hundredths=Math.floor((n+1e-10)*100)%10;
  if(hundredths===1) n=Math.floor((n-0.01+1e-10)*100)/100;
  return n;
}
function fmtRate(n){return `${floorRule(n).toFixed(2)}%`;}
function fmtShare(n){const x=Math.round((n+Number.EPSILON)*100)/100;return `${String(x.toFixed(2)).replace(/\.00$/,'').replace(/(\.\d*[1-9])0+$/,'$1')}%`;}
function transformPayout(source,factor){
  let text=String(source||'').trim(); if(!meaningful(text)) return '';
  const protectedShares=[];
  // Existing share of PF/processing fee: the calculator applies to that share as well.
  text=text.replace(/(\d+(?:\.\d+)?)\s*%\s+of\s+(the\s+)?(PF|processing\s+fee)(\s+collected)?/gi,(m,n,the,basis,collected)=>{
    const value=parseFloat(n)*factor/100; const token=`__SHARE_${protectedShares.length}__`;
    protectedShares.push(`${fmtShare(value)} of ${the||''}${basis}${collected||''}`); return token;
  });
  // Numeric slab percentages.
  text=text.replace(/(\d+(?:\.\d+)?)\s*%/g,(m,n)=>fmtRate(parseFloat(n)*factor/100));
  // Bare PF/processing fee payout statements use 100% as the base.
  text=text.replace(/Payout\s*=\s*PF\s*Collected/gi,`Payout = ${factor}% of PF Collected`);
  text=text.replace(/DSA\s+Payout\s*=\s*PF\s*collected/gi,`DSA Payout = ${factor}% of PF collected`);
  text=text.replace(/Processing\s+Fee\s*=\s*Payout/gi,`Payout = ${factor}% of Processing Fee`);
  text=text.replace(/\bor\s+PF\s+collected\b/gi,`or ${factor}% of PF collected`);
  text=text.replace(/\bOR\s+PF\s+collected\b/g,`OR ${factor}% of PF collected`);
  protectedShares.forEach((v,i)=>{text=text.replace(`__SHARE_${i}__`,v);});
  return text;
}
function providerFlag(rec){const t=[rec.institutionName,rec.code,rec.variant,rec.conditions].join(' ').toLowerCase().replace(/\s+/g,'');return t.includes('finwizz')?'FinWizz':'';}
function publicRecord(r){
  return {id:r.id,institutionName:r.institutionName,code:r.code,grossNet:r.grossNet,productType:r.productType,productGroup:r.productGroup,variant:r.variant,payoutTimeline:r.payoutTimeline,applicableCities:r.applicableCities,conditions:r.conditions,loginProcess:r.loginProcess,paymentType:r.paymentType,topSlabLoanVal:r.topSlabLoanVal,payoutCapping:r.payoutCapping,clawback:r.clawback,thirdPartyProvider:providerFlag(r)};
}
module.exports=function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const user=authFromReq(req);
  let view=String(req.query?.view||'public').toLowerCase();
  let city=String(req.query?.city||'');
  if(view==='city') view=/^vijaywada$/i.test(city)?'t2':'t1';
  if(!['public','t1','t2','raw'].includes(view)) return res.status(400).json({ok:false,error:'Unknown view'});
  if(view!=='public'&&!user) return res.status(401).json({ok:false,error:'Login required'});
  if(view==='raw'&&user?.role!=='shiv') return res.status(403).json({ok:false,error:'Shiv access required'});
  const cap=view==='t2'?85:90;
  let factor=Number(req.query?.factor||cap); if(!Number.isFinite(factor)) factor=cap;
  factor=Math.max(0,Math.min(cap,factor));
  const records=DATA.records.map(r=>{
    const base=publicRecord(r);
    if(view==='public') return base;
    base.institutionClass=CLASSIFICATION[r.institutionName]||'NBFC';
    base.tier=view==='raw'?'RAW':view.toUpperCase();
    base.factor=view==='raw'?null:factor;
    base.payoutDisplay=view==='raw'?r.maxBankSlab:transformPayout(r.maxBankSlab,factor);
    if(view==='raw') base.maxBankSlab=r.maxBankSlab;
    return base;
  });
  return res.status(200).json({ok:true,schemaVersion:DATA.schemaVersion,view,city:city||null,factor:view==='raw'?null:factor,cap:view==='raw'?null:cap,user:user?{id:user.id,role:user.role,label:user.label}:null,records});
};
