'use strict';
const {reply,postOnly,enabled}=require('../_lib/demo');
module.exports=async(req,res)=>{
 if(!postOnly(req,res)||!enabled(res))return;
 const phone=String(req.body?.phone||'').trim();
 if(!/^[6-9][0-9]{9}$/.test(phone))return reply(res,400,{error:'Enter a valid 10-digit Indian mobile number.'});
 // Do not reveal which numbers are registered from this endpoint.
 return reply(res,200,{message:'Demo mode: no email is sent. Enter test code 123456 to continue.',demo:true});
};
