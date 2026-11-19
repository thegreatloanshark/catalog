'use strict';
const {reply,postOnly,enabled,issue}=require('../_lib/demo');
const {byPhone}=require('../_lib/vh-allowlist');
module.exports=async(req,res)=>{
 if(!postOnly(req,res)||!enabled(res))return;
 const phone=String(req.body?.phone||'').trim(), otp=String(req.body?.otp||'').trim();
 if(!/^[6-9][0-9]{9}$/.test(phone)||!/^[0-9]{6}$/.test(otp))return reply(res,400,{error:'Invalid demo verification details.'});
 if(otp!=='123456'||!byPhone(phone))return reply(res,401,{error:'Invalid phone or demo code.'});
 try{return reply(res,200,{accessToken:issue(phone),expiresIn:900,demo:true});}
 catch(e){console.error('VH demo misconfigured');return reply(res,503,{error:'Demo service is not configured.'});}
};
