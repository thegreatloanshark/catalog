"use strict";
const {request,findByPhone,reply,postOnly}=require('../_lib/supabase');
const generic='If this number belongs to an active Vertical Head, a verification code has been sent to the registered email.';
module.exports=async function handler(req,res){
  if(!postOnly(req,res))return;
  const phone=String(req.body?.phone||'').trim();
  if(!/^[6-9]\d{9}$/.test(phone))return reply(res,400,{error:'Enter a valid 10-digit Indian mobile number.'});
  try {
    const vh=await findByPhone(phone);
    if(vh?.auth_user_id){
      // Never return the matched email or any profile data at this stage.
      await request('/auth/v1/otp',{method:'POST',body:{email:vh.email,create_user:false}});
    }
    return reply(res,200,{message:generic});
  }catch(e){console.error('VH OTP request failed',e.status||'unknown');return reply(res,503,{error:'Unable to send verification code right now. Try again later.'});}
};
