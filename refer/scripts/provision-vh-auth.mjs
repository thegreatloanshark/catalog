// One-time administration task. Do not run this script in browser or deploy as an API route.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set privately in your local shell.
const endpoint=process.env.SUPABASE_URL?.replace(/\/$/,'');
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!endpoint||!key)throw Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
const emails=['ad.patra@nobroker.in','asad@nobroker.in','shivankur.ghosh@nobroker.in'];
async function api(path,opts={}){
 const r=await fetch(endpoint+path,{method:opts.method||'GET',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:opts.body?JSON.stringify(opts.body):undefined});
 const payload=await r.json();if(!r.ok)throw Error(`${r.status}: ${payload.msg||payload.message||payload.error||'error'}`);return payload;
}
const users=[];
for(let page=1;page<=100;page++){
 const result=await api(`/auth/v1/admin/users?page=${page}&per_page=100`);
 users.push(...(result.users||[]));
 if((result.users||[]).length<100)break;
}
for(const email of emails){
 const existing=users.find(u=>u.email?.toLowerCase()===email);
 if(existing){console.log('Already exists:',email);continue;}
 await api('/auth/v1/admin/users',{method:'POST',body:{email,email_confirm:true}});
 console.log('Provisioned:',email);
}
console.log('Finished. No referral table is required.');
