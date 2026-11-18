"use strict";
const {authenticatedVH,reply}=require('../_lib/supabase');
module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return reply(res,405,{error:'Method not allowed'});}
  try{
    const vh=await authenticatedVH(req);
    if(!vh)return reply(res,401,{error:'Sign in with your registered phone number and email OTP.'});
    return reply(res,200,{name:vh.name,dsaCode:vh.dsa_code,email:vh.email,phone:vh.phone,designation:vh.designation||'Vertical Head'});
  }catch(e){console.error('VH profile request failed',e.status||'unknown');return reply(res,503,{error:'Profile temporarily unavailable'});}
};
