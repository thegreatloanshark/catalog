"use strict";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLISHABLE_KEY = process.env.SUPABASE_ANON_KEY;
function settings() {
  if (!SUPABASE_URL || !SERVICE_KEY || !PUBLISHABLE_KEY) throw new Error('Supabase environment variables missing');
  return {url: SUPABASE_URL.replace(/\/$/,''),service: SERVICE_KEY,pub: PUBLISHABLE_KEY};
}
async function request(endpoint, { method='GET', body, admin=false, bearer }={}) {
  const s=settings();
  const key=admin?s.service:s.pub;
  const headers={'apikey': key,'Content-Type':'application/json'};
  if (bearer) headers.Authorization=`Bearer ${bearer}`;
  else if (admin) headers.Authorization=`Bearer ${key}`;
  const resp=await fetch(s.url+endpoint,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  const raw=await resp.text();
  let data; try {data=raw?JSON.parse(raw):null;}catch{data={error:'Unparseable upstream response'};}
  if(!resp.ok) { const err=new Error(data?.msg||data?.message||data?.error_description||data?.error||'Supabase request failed'); err.status=resp.status; throw err; }
  return data;
}
async function findByPhone(phone) {
  const query=new URLSearchParams({select:'id,name,dsa_code,phone,email,designation,auth_user_id,is_active',phone:`eq.${phone}`,is_active:'eq.true',limit:'1'});
  const rows=await request('/rest/v1/referral_vertical_heads?'+query,{admin:true});
  return rows[0]||null;
}
async function findByUser(uid) {
  const query=new URLSearchParams({select:'id,name,dsa_code,phone,email,designation,auth_user_id,is_active',auth_user_id:`eq.${uid}`,is_active:'eq.true',limit:'1'});
  const rows=await request('/rest/v1/referral_vertical_heads?'+query,{admin:true});
  return rows[0]||null;
}
async function authenticatedVH(req) {
  const header=req.headers.authorization||'';
  const match=/^Bearer ([-\w.]+)$/.exec(header);
  if (!match) return null;
  let user;
  try {user=await request('/auth/v1/user',{bearer:match[1]});}catch{return null;}
  if (!user?.id || !user.email) return null;
  const vh=await findByUser(user.id);
  if (!vh || vh.email.toLowerCase()!==user.email.toLowerCase()) return null;
  return vh;
}
function reply(res,status,data){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');return res.status(status).json(data);}
function postOnly(req,res){if(req.method!=='POST'){res.setHeader('Allow','POST');reply(res,405,{error:'Method not allowed'});return false;}return true;}
module.exports={request,findByPhone,authenticatedVH,reply,postOnly};
