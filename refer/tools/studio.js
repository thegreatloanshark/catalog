import {createUTM,createReferralUTM} from './utm.js';
import {encodeQR,qrToSvg} from './qr.js';
const $=id=>document.getElementById(id);
let currentUrl='',currentQR=null,bulkCSV='';
function switchTab(to){for(const t of ['utm','qr']){$('tab-'+t).setAttribute('aria-selected',String(t===to));$('panel-'+t).hidden=t!==to;} }
$('tab-utm').addEventListener('click',()=>switchTab('utm'));
$('tab-qr').addEventListener('click',()=>switchTab('qr'));
function formTags(){return {url:$('base-url').value,source:$('utm-source').value,medium:$('utm-medium').value,campaign:$('utm-campaign').value,content:$('utm-content').value,term:$('utm-term').value};}
$('utm-form').addEventListener('submit',event=>{event.preventDefault();try{currentUrl=createUTM(formTags());$('utm-result').textContent=currentUrl;$('utm-error').hidden=true;$('utm-copy').disabled=false;$('utm-to-qr').disabled=false;}catch(e){$('utm-error').textContent=e.message;$('utm-error').hidden=false;$('utm-copy').disabled=true;$('utm-to-qr').disabled=true;}});
$('utm-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(currentUrl);$('utm-copy').textContent='Copied!';}catch{$('utm-error').textContent='Clipboard unavailable. Select and copy the URL manually.';$('utm-error').hidden=false;}});
$('utm-to-qr').addEventListener('click',()=>{$('qr-text').value=currentUrl;switchTab('qr');$('qr-form').requestSubmit();});
function saveBlob(blob,name){const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function escapeCSV(s){return '"'+String(s).replaceAll('"','""')+'"';}
$('bulk-build').addEventListener('click',()=>{
 try{
  const tokens=$('vh-tokens').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  if(tokens.length<1||tokens.length>200)throw new Error('Enter 1–200 backend-issued referral tokens, one per line.');
  if(new Set(tokens).size!==tokens.length)throw new Error('Duplicate tokens found; remove duplicates before export.');
  const params=formTags(),rows=[['issued_token','preview_url']];
  for(const token of tokens)rows.push([token,createReferralUTM({baseUrl:params.url,issuedToken:token,source:params.source,medium:params.medium,campaign:params.campaign,content:params.content,term:params.term})]);
  bulkCSV=rows.map(r=>r.map(escapeCSV).join(',')).join('\r\n');$('bulk-download').disabled=false;$('bulk-status').textContent=`${tokens.length} preview links prepared. Not registered in Supabase.`;$('bulk-error').hidden=true;
 }catch(e){$('bulk-error').textContent=e.message;$('bulk-error').hidden=false;$('bulk-download').disabled=true;}
});
$('bulk-download').addEventListener('click',()=>saveBlob(new Blob([bulkCSV],{type:'text/csv;charset=utf-8'}),'nbl-referral-link-previews.csv'));
function luminance(hex){const vals=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return vals[0]*.2126+vals[1]*.7152+vals[2]*.0722;}
function qrOptions(){const dark=$('qr-dark').value,light=$('qr-light').value,a=luminance(dark),b=luminance(light),contrast=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);if(a>=b||contrast<4.5)throw new Error('Choose a darker foreground and lighter background with at least 4.5:1 contrast.');return {dark,light};}
$('qr-form').addEventListener('submit',event=>{
 event.preventDefault();try{const text=$('qr-text').value.trim();const colors=qrOptions();currentQR={...encodeQR(text),colors};$('qr-preview').innerHTML=qrToSvg(currentQR.modules,{scale:8,...colors});$('qr-info').textContent=`Version ${currentQR.version} · ECC M · ${currentQR.size} × ${currentQR.size} modules · 4-module quiet zone`;$('qr-error').hidden=true;$('qr-png').disabled=false;$('qr-svg').disabled=false;}catch(e){currentQR=null;$('qr-error').textContent=e.message;$('qr-error').hidden=false;$('qr-png').disabled=true;$('qr-svg').disabled=true;}
});
$('qr-svg').addEventListener('click',()=>{if(!currentQR)return;saveBlob(new Blob([qrToSvg(currentQR.modules,{scale:16,...currentQR.colors})],{type:'image/svg+xml'}),'nbl-referral-qr.svg');});
$('qr-png').addEventListener('click',()=>{if(!currentQR)return;const size=Number($('qr-size').value),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.width=canvas.height=size;const {modules,colors}=currentQR,n=modules.length,total=n+8,unit=size/total;ctx.fillStyle=colors.light;ctx.fillRect(0,0,size,size);ctx.fillStyle=colors.dark;for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(modules[y][x]){const x1=Math.round((x+4)*unit),x2=Math.round((x+5)*unit),y1=Math.round((y+4)*unit),y2=Math.round((y+5)*unit);ctx.fillRect(x1,y1,x2-x1,y2-y1);}canvas.toBlob(blob=>{if(blob)saveBlob(blob,'nbl-referral-qr.png');},'image/png');});
