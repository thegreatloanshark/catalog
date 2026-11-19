"use strict";
const {request,reply,postOnly}=require('../_lib/supabase');
const {byPhone}=require('../_lib/vh-allowlist');
module.exports=async function handler(req,res){
 if(!postOnly(req,res))return;
 const phone=String(req.body?.phone||'').trim(),otp=String(req.body?.otp||'').trim();
 if(!/^[6-9]\d{9}$/.test(phone)||!/^[0-9]{6,8}$/.test(otp))return reply(res,400,{error:'Invalid verification details.'});
 const vh=byPhone(phone);
 if(!vh)return reply(res,401,{error:'Invalid or expired verification code.'});
 try {
   const verified=await request('/auth/v1/verify',{method:'POST',body:{email:vh.email,token:otp,type:'email'}});
   if(!verified?.access_token||verified.user?.email?.toLowerCase()!==vh.email.toLowerCase())return reply(res,401,{error:'Unable to verify this account.'});
   return reply(res,200,{accessToken:verified.access_token,expiresIn:verified.expires_in||3600});
 }catch(e){return reply(res,401,{error:'Invalid or expired verification code.'});}
};
