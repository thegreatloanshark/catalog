/* Run locally: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-vh.mjs
   Creates confirmed auth users when missing and upserts the specified VH master records.
   Do not deploy this script to a public URL. Never commit credentials. */
const base=process.env.SUPABASE_URL?.replace(/\/$/,'');
const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!base||!secret)throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
const records=[
 {name:'Aditya',dsa_code:'DSA012345',phone:'9990009999',email:'ad.patra@nobroker.in',designation:'Vertical Head'},
 {name:'Asad',dsa_code:'DSA012346',phone:'9999900000',email:'asad@nobroker.in',designation:'Vertical Head'},
 {name:'Shiv',dsa_code:'DSA012347',phone:'9945048798',email:'shiv@nobroker.in',designation:'Vertical Head'}
];
async function api(path,{method='GET',body,prefer}={}){
 const r=await fetch(base+path,{method,headers:{apikey:secret,Authorization:`Bearer ${secret}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const raw=await r.text(); const payload=raw?JSON.parse(raw):null;
 if(!r.ok)throw new Error(`${path}: ${r.status} ${JSON.stringify(payload)}`);return payload;
}
for(const rec of records){
 let userId;
 // Resolve existing user via paginated admin listing before attempting account creation.
 for(let page=1;page<=50&&!userId;page++){
  const users=await api(`/auth/v1/admin/users?page=${page}&per_page=100`);
  const matched=users.users?.find(u=>u.email?.toLowerCase()===rec.email.toLowerCase());
  if(matched)userId=matched.id;
  if(!users.users?.length || users.users.length<100)break;
 }
 if(!userId){const u=await api('/auth/v1/admin/users',{method:'POST',body:{email:rec.email,email_confirm:true}});userId=u.id;}
 await api('/rest/v1/referral_vertical_heads?on_conflict=dsa_code',{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:[{...rec,auth_user_id:userId,is_active:true}]});
 console.log(`Seeded ${rec.name} (${rec.dsa_code})`);
}
