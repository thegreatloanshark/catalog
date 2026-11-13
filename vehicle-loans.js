'use strict';
const vehicleState={data:null,authorized:false,busy:false};
const ve=id=>document.getElementById(id);
const vh=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function vehicleJSON(path){const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw new Error(`Unable to load catalog (${response.status}).`);return response.json();}
function vehicleSelection(){const d=vehicleState.data;if(!d)return [];const product=ve('product').value,bank=ve('bank').value,query=ve('search').value.trim().toLowerCase();return ['newCar','usedCar'].filter(k=>product==='all'||product===k).flatMap(k=>d[k].map(t=>({...t,kind:k,rows:t.rows.filter(row=>(!bank||row[0]===bank)&&(!query||row.join(' ').toLowerCase().includes(query)))})).filter(t=>t.rows.length));}
function vehicleTable(t){return `<div class="table-scroll"><table><thead><tr>${t.headers.map((h,i)=>`<th class="${t.payoutColumns.includes(i)?'payout':''}">${vh(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr>${r.map((v,i)=>`<td class="${t.payoutColumns.includes(i)?'payout':''}">${vh(v||'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${(t.notes||[]).map(n=>`<div class="notes">${vh(n)}</div>`).join('')}`;}
function vehicleRender(){const sections=vehicleSelection(),count=sections.reduce((n,t)=>n+t.rows.length,0);ve('status').textContent=`${count} payout rows · Values as supplied by CarDekho`;ve('download').disabled=!count||vehicleState.busy;ve('catalog').innerHTML=sections.length?['newCar','usedCar'].map(k=>{const ts=sections.filter(t=>t.kind===k);if(!ts.length)return '';return `<h2>${k==='newCar'?'New Car':'Used Car'}</h2>${k==='usedCar'?`<p class="band-note">Payout bands refer to vehicle value in lakh. ${vh(vehicleState.data.usedCarPeriod)}</p>`:''}${ts.map(t=>`<section><h3>${vh(t.title)}</h3>${vehicleTable(t)}</section>`).join('')}${k==='usedCar'?vehicleState.data.usedCarNotes.map(n=>`<p class="notes">${vh(n)}</p>`).join(''):''}`;}).join(''):'<p>No products match these filters.</p>';if(sections.some(t=>t.kind==='newCar'))ve('catalog').insertAdjacentHTML('beforeend',`<section><details><summary>Vehicle model classifications</summary>${vehicleTable(vehicleState.data.models)}</details></section>`);}
function vehicleLoadScript(url){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>{s.remove();reject(new Error('PDF library could not load. Please retry.'));};document.head.appendChild(s);});}
function vehicleSafe(t){return String(t??'').replace(/₹/g,'Rs. ').replace(/[–—]/g,'-').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/•/g,'-');}
function vehicleConditionText(value){return String(value??'').trim().replace(/\[([^\]]*)\]\(https?:\/\/(?:drive|docs)\.google\.com\/[^\s)]*\)/gi,'NA').replace(/(?:https?:\/\/)?(?:drive|docs)\.google\.com\/[^\s<>]*/gi,'NA');}
// Reflow spreadsheet line wraps across the PDF cell, retaining paragraphs and list items.
function vehiclePdfConditionFlow(value){return String(value??'').replace(/\r\n?/g,'\n').replace(/([^\n])\n(?!\s*\n|\s*(?:\d+[.)]|[-*•])\s)/g,'$1 ').trim();}
const VEHICLE_PDF_CONDITION_WORD_LIMIT=300;
function vehiclePdfRecords(sections){return sections.flatMap(t=>t.rows.map(row=>{
 const noteIndex=t.headers.findIndex(h=>/conditions reference/i.test(h));
 const refs=noteIndex<0?[]:String(row[noteIndex]).split(',').map(x=>x.trim());
 const usedRefs=new Set(noteIndex<0?[]:t.rows.flatMap(r=>String(r[noteIndex]).split(',').map(v=>v.trim())));
 const notes=(t.notes||[]).filter(n=>refs.some(ref=>n.startsWith(ref+':'))||!usedRefs.has((n.match(/^C\d+/)||[''])[0])).map(n=>n.replace(/^C\d+:\s*/,''));
 const criteria=t.headers.flatMap((h,i)=>i===0||i===noteIndex||t.payoutColumns.includes(i)||!row[i]?[]:[`${h}: ${row[i]}`]);
 let full=notes.join('\n');
 // This workbook has full conditions, not a separate distilled (W) field.
 if(t.kind==='usedCar')full=[...vehicleState.data.usedCarNotes,'Refer to Used Car Terms & Conditions in the Annexure for ROI, PF and subvention requirements.'].join('\n');
 full=vehicleConditionText(full);
 return {eligibility:t.kind==='newCar'?criteria.join('\n'):'',bank:row[0],type:'NA',product:t.kind==='newCar'?'New Car':'Used Car',payout:t.payoutColumns.map(i=>`${/^DSA Payout$/i.test(t.headers[i])?'':t.headers[i]+': '}${row[i]||'NA'}`).join('\n'),dates:'NA',city:'NA',full,annexure:full.split(/\s+/).filter(Boolean).length>VEHICLE_PDF_CONDITION_WORD_LIMIT?full:null};
}));}
async function vehicleMakePDF(sections,terms){
 if(!window.jspdf)await vehicleLoadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');
 const doc=new window.jspdf.jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
 const rows=vehiclePdfRecords(sections),annexure=[],refs=new Map(),conditionKeys=new Map();
 for(const r of rows){if(r.annexure===null)continue;const key=JSON.stringify([r.bank,r.product,r.annexure]);if(!conditionKeys.has(key)){annexure.push(r);conditionKeys.set(key,annexure.length);}refs.set(r,conditionKeys.get(key));}
 const widths=[17,33,30,38,163],headers=['Logo','bank','Product Type','Payout %','conditions'];
 const margin=8,bottom=171,lh=3.1,font=7;let page=0,y=38,title='';
 let qr=null;try{const res=await fetch('assets/partner-qr.png');if(res.ok)qr=await new Promise(async(resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(await res.blob());});}catch(e){}
 const wrap=(value,w,size)=>{doc.setFontSize(size);return doc.splitTextToSize(vehicleSafe(value||'NA'),w);};
 function newPage(table=false){
  if(page++)doc.addPage('a4','landscape');
  doc.setTextColor(0);doc.setFont('helvetica','bold');doc.setFontSize(17);doc.text('VEHICLE LOANS',148.5,13,{align:'center'});
  doc.setFontSize(9);doc.text(new Intl.DateTimeFormat('en-US',{month:'short',year:'2-digit'}).format(new Date()).replace(' ','-'),281,13,{align:'right'});
  doc.setFont('helvetica','normal');doc.setFontSize(7);doc.text('CarDekho | Payouts as supplied',8,19);
  doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(title,148.5,23,{align:'center'});
  if(table){doc.setFillColor(0);doc.rect(8,29,281,9,'F');doc.setTextColor(255);doc.setFontSize(8);let x=8;headers.forEach((h,i)=>{doc.text(h,x+2,34.5);x+=widths[i];});}
  doc.setFont('helvetica','normal');doc.setTextColor(0);doc.setFontSize(7.5);
  doc.text(doc.splitTextToSize('For loan application login assistance, please contact the designated point of contact for your region or area.',249),8,184,{lineHeightFactor:1.15});
  doc.setTextColor(216,0,0);doc.textWithLink('For complete Vehicle Loans details, please visit the online catalog.',8,191,{url:'https://nbloans-catalog.vercel.app/vehicle-loans.html'});doc.setTextColor(0);
  if(qr)doc.addImage(qr,'PNG',263,178,26,26);
  doc.setFontSize(6);doc.text(`Page ${page}`,8,207);doc.setTextColor(216,0,0);doc.textWithLink('Visit the catalog: nbloans-catalog.vercel.app',26,207,{url:'https://nbloans-catalog.vercel.app'});doc.setTextColor(0);y=38;
 }
 const logos=new Map();
 for(const product of ['New Car','Used Car']){
  const group=rows.filter(r=>r.product===product);if(!group.length)continue;title=product;newPage(true);
  for(const r of group){
   const condition=refs.has(r)?`* Read detailed payout conditions in the Annexure\nReference A${refs.get(r)}`:vehiclePdfConditionFlow(r.full);
   const values=['',r.bank,r.product,r.payout,[r.eligibility,condition].filter(Boolean).join('\n\n')];
   doc.setFont('helvetica','normal');const lines=values.map((v,i)=>wrap(v,widths[i]-4,font));const total=Math.max(...lines.map(l=>l.length));let offset=0;
   if(!logos.has(r.bank))logos.set(r.bank,await vehicleBankLogo(r.bank));
   while(offset<total){
    if(y+14>bottom)newPage(true);
    const capacity=Math.max(1,Math.floor((bottom-y-4)/lh));
    if(offset===0&&total>capacity&&total<=Math.floor((bottom-38-4)/lh)){newPage(true);continue;}
    const count=Math.min(total-offset,capacity),height=Math.max(14,count*lh+4);let x=8;
    doc.setFont('helvetica','normal');doc.setFontSize(font);doc.setDrawColor(140);doc.setLineWidth(.15);
    lines.forEach((l,i)=>{doc.setFillColor(...(i===3?[255,239,242]:[255,255,255]));doc.rect(x,y,widths[i],height,'FD');doc.setTextColor(0);if(i>0)doc.text(l.slice(offset,offset+count),x+2,y+1.6,{baseline:'top',lineHeightFactor:lh/(font*.3528)});x+=widths[i];});
    const logo=logos.get(r.bank);if(logo&&offset===0)doc.addImage(logo,'PNG',9.5,y+(height-7)/2,14,7);y+=height;offset+=count;
   }
  }
 }
 const entries=annexure.map(r=>({heading:`A${refs.get(r)} | ${r.bank} | ${r.product}`,text:r.annexure}));
 if(terms){entries.push({heading:'Used Car Terms & Conditions',text:vehicleState.data.usedCarNotes.join('\n')});
  terms.rows.forEach(row=>entries.push({heading:`Used Car | ${row[0]}`,text:terms.headers.slice(1).map((h,i)=>`${h}: ${row[i+1]||'NA'}`).join('\n')}));
  entries.push({heading:'Used Car | Subvention and general conditions',text:terms.notes.join('\n\n')});
 }
 if(sections.some(t=>t.kind==='newCar'))entries.push({heading:'New Car | Vehicle model classifications',text:vehicleState.data.models.rows.map(r=>r.join(' | ')).join('\n')});
 if(entries.length){title='Annexure';newPage();let column=0;const cw=137,tw=133;const advance=()=>{if(column===0){column=1;y=38;}else{column=0;newPage();}};
  for(const entry of entries){doc.setFont('helvetica','bold');const heading=wrap(entry.heading,tw,9);doc.setFont('helvetica','normal');const body=wrap(vehicleConditionText(entry.text),tw,8);let offset=0;
   while(offset<body.length){const hh=heading.length*4+5,cont=offset?5:0;if(y+hh+cont+8>bottom)advance();const x=8+column*144;
    doc.setFillColor(242,242,242);doc.rect(x,y,cw,hh,'F');doc.setTextColor(0);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(heading,x+2,y+4,{lineHeightFactor:4/(9*.3528)});y+=hh;
    if(offset){doc.setFontSize(7);doc.text('(continued)',x+2,y+3);y+=5;}
    const take=Math.min(body.length-offset,Math.max(1,Math.floor((bottom-y-3)/3.7)));doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text(body.slice(offset,offset+take),x+2,y+1,{baseline:'top',lineHeightFactor:3.7/(8*.3528)});y+=take*3.7+7;offset+=take;if(offset<body.length)advance();
   }
  }
 }
 return doc;
}

async function vehicleDownload(){if(vehicleState.busy)return;if(!vehicleState.authorized){ve('auth').showModal();return;}const sections=vehicleSelection();if(!sections.length)return;vehicleState.busy=true;vehicleRender();ve('error').textContent='';ve('download').textContent='Preparing PDF…';try{const terms=sections.some(t=>t.kind==='usedCar')?await vehicleJSON('./vehicle-pdf-terms.json'):null;const doc=await vehicleMakePDF(sections,terms);const stamp=new Intl.DateTimeFormat('en-US',{month:'short',year:'2-digit'}).format(new Date()).replace(/[^a-z0-9]/gi,'').toUpperCase();doc.save(`Vehicle Loans ${stamp}.pdf`);}catch(e){ve('error').textContent=e.message;}finally{vehicleState.busy=false;ve('download').textContent='Download Vehicle Loans PDF';vehicleRender();}}
async function vehicleInit(){try{vehicleState.data=await vehicleJSON('./vehicle-data.json');const banks=[...new Set([...vehicleState.data.newCar,...vehicleState.data.usedCar].flatMap(t=>t.rows.map(r=>r[0])))].sort();ve('bank').innerHTML='<option value="">All banks</option>'+banks.map(b=>`<option value="${vh(b)}">${vh(b)}</option>`).join('');vehicleRender();}catch(e){ve('error').textContent=e.message;ve('status').textContent='Catalog unavailable. Refresh to retry.';}}
if(typeof document!=='undefined'){
 ve('product').onchange=vehicleRender;ve('bank').onchange=vehicleRender;ve('search').oninput=vehicleRender;ve('reset').onclick=()=>{ve('product').value='all';ve('bank').value='';ve('search').value='';vehicleRender();};ve('download').onclick=vehicleDownload;ve('cancel').onclick=()=>ve('auth').close();ve('auth-form').onsubmit=async e=>{e.preventDefault();try{const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ve('auth-id').value.trim()+':'+ve('auth-code').value));if(Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')!=='a171e6d2b5d512266084a4042927a5b19ef57f81441861731a071c27686c5028'){ve('auth-error').textContent='Incorrect ID or code.';return;}vehicleState.authorized=true;ve('auth-code').value='';ve('auth').close();await vehicleDownload();}catch(e){ve('auth-error').textContent='Unable to verify. Use HTTPS and retry.';}};vehicleInit();}
let vehicleLogoSprite;
async function vehicleBankLogo(name){
 const n=String(name).toLowerCase();
 const cells=[[/^bob$/,[4,0]],[/^boi$/,[0,1]],[/canara/,[2,1]],[/axis/,[2,0]],[/bajaj/,[3,0]],[/hdfc/,[0,3]],[/icici/,[2,3]],[/idfc/,[4,3]],[/indian bank/,[1,4]],[/indusind/,[2,4]],[/kotak/,[2,5]],[/mahindra/,[4,5]],[/muthoot/,[2,6]],[/piramal/,[3,6]],[/sundaram/,[2,7]],[/tata capital/,[3,7]],[/cholamandalam/,[4,1]],[/federal/,[2,2]]];
 const match=cells.find(([pattern])=>pattern.test(n));if(!match||typeof Image==='undefined')return null;
 try{if(!vehicleLogoSprite)vehicleLogoSprite=new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src='./bank-logos.png';});const image=await vehicleLogoSprite;const canvas=document.createElement('canvas');canvas.width=300;canvas.height=150;canvas.getContext('2d').drawImage(image,match[1][0]*300,match[1][1]*150,300,150,0,0,300,150);return canvas.toDataURL('image/png');}catch(e){return null;}
}
