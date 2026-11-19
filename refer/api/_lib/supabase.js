"use strict";
const {byEmail} = require('./vh-allowlist');
const SUPABASE_URL=process.env.SUPABASE_URL;
const PUBLISHABLE_KEY=process.env.SUPABASE_ANON_KEY;
function settings(){
 if(!SUPABASE_URL||!PUBLISHABLE_KEY)throw Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
 return {url:SUPABASE_URL.replace(/\/$/,''),key:PUBLISHABLE_KEY};
}
async function request(endpoint,{method='GET',body,bearer}={}){
 const s=settings();
 const response=await fetch(s.url+endpoint,{method,headers:{'apikey':s.key,'Content-Type':'application/json',...(bearer?{Authorization:`Bearer ${bearer}`}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const raw=await response.text();let data;
 try{data=raw?JSON.parse(raw):null;}catch{data={error:'Invalid upstream response'};}
 if(!response.ok){const err=new Error(data?.msg||data?.message||data?.error_description||data?.error||'Supabase request failed');err.status=response.status;throw err;}
 return data;
}
async function authenticatedVH(req){
 const match=/^Bearer ([-\w.]+)$/.exec(req.headers?.authorization||'');
 if(!match)return null;
 let user;try{user=await request('/auth/v1/user',{bearer:match[1]});}catch{return null;}
 if(!user?.id||!user?.email||!user?.email_confirmed_at)return null;
 return byEmail(user.email);
}
function reply(res,status,data){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');return res.status(status).json(data);}
function postOnly(req,res){if(req.method!=='POST'){res.setHeader('Allow','POST');reply(res,405,{error:'Method not allowed'});return false;}return true;}
module.exports={request,authenticatedVH,reply,postOnly};
