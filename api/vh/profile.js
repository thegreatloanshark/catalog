'use strict';
const {reply,enabled,resolve}=require('../_lib/demo');
module.exports=async(req,res)=>{
 if(req.method!=='GET'){res.setHeader('Allow','GET');return reply(res,405,{error:'Method not allowed'});}
 if(!enabled(res))return;
 const match=/^Bearer ([A-Za-z0-9_.-]+)$/.exec(req.headers?.authorization||'');
 let vh=null;try{vh=match?resolve(match[1]):null;}catch(e){console.error('VH demo misconfigured');return reply(res,503,{error:'Demo service is not configured.'});}
 if(!vh)return reply(res,401,{error:'Demo session expired or invalid.'});
 return reply(res,200,{name:vh.name,dsaCode:vh.dsa_code,email:vh.email,phone:vh.phone,designation:vh.designation,demo:true});
};
