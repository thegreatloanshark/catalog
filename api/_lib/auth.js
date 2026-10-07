const crypto = require('crypto');

const USERS = {
  Team: { password: process.env.TEAM_PASSWORD || 'Team@123', role: 'team', label: 'Team Internal' },
  Shiv: { password: process.env.SHIV_PASSWORD || '1399', role: 'shiv', label: 'Shiv' }
};
const SECRET = process.env.CATALOG_AUTH_SECRET || 'replace-this-secret-in-vercel-environment';

function b64url(input){ return Buffer.from(input).toString('base64url'); }
function sign(payload){ return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url'); }
function issueToken(id){
  const u=USERS[id]; if(!u) return null;
  const body=b64url(JSON.stringify({id,role:u.role,label:u.label,exp:Date.now()+12*60*60*1000}));
  return `${body}.${sign(body)}`;
}
function verifyToken(token){
  if(!token || typeof token!=='string' || !token.includes('.')) return null;
  const [body,sig]=token.split('.',2); const expected=sign(body);
  const a=Buffer.from(sig), b=Buffer.from(expected);
  if(a.length!==b.length || !crypto.timingSafeEqual(a,b)) return null;
  try{ const p=JSON.parse(Buffer.from(body,'base64url').toString('utf8')); if(!p.exp || p.exp<Date.now()) return null; return p; }catch(e){ return null; }
}
function authFromReq(req){
  const h=req.headers.authorization || req.headers.Authorization || '';
  return verifyToken(String(h).replace(/^Bearer\s+/i,''));
}
function checkCredentials(id,password){
  const u=USERS[String(id||'').trim()];
  if(!u) return null;
  const a=Buffer.from(String(password||'')), b=Buffer.from(String(u.password));
  if(a.length!==b.length || !crypto.timingSafeEqual(a,b)) return null;
  return {id:String(id).trim(),role:u.role,label:u.label,token:issueToken(String(id).trim())};
}
module.exports={USERS,issueToken,verifyToken,authFromReq,checkCredentials};
