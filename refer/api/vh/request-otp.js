"use strict";
const {request,reply,postOnly}=require('../_lib/supabase');
const {byPhone}=require('../_lib/vh-allowlist');
const generic='If this number belongs to an approved Vertical Head, a verification code has been sent to the registered email.';
module.exports=async function handler(req,res){
 if(!postOnly(req,res))return;
 const phone=String(req.body?.phone||'').trim();
 if(!/^[6-9]\d{9}$/.test(phone))return reply(res,400,{error:'Enter a valid 10-digit Indian mobile number.'});
 const vh=byPhone(phone);
 if(!vh)return reply(res,200,{message:generic});
 try {
   // The VH must already be provisioned in Supabase Auth (see provision script).
   await request('/auth/v1/otp',{method:'POST',body:{email:vh.email,create_user:false}});
   return reply(res,200,{message:generic});
 }catch(e){console.error('VH OTP provider error:',e.status||'unknown');return reply(res,503,{error:'Unable to send verification code right now. Check SMTP/Auth setup.'});}
};
