const {checkCredentials,authFromReq}=require('./_lib/auth');
module.exports=function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET'){
    const user=authFromReq(req); return res.status(user?200:401).json(user?{ok:true,user}:{ok:false});
  }
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'});
  const body=typeof req.body==='string'?(()=>{try{return JSON.parse(req.body)}catch(e){return {}}})():req.body||{};
  const result=checkCredentials(body.id,body.password);
  if(!result) return res.status(401).json({ok:false,error:'Invalid credentials'});
  return res.status(200).json({ok:true,user:{id:result.id,role:result.role,label:result.label},token:result.token});
};
