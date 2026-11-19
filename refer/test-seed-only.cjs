const assert=require('node:assert/strict');
process.env.SUPABASE_URL='https://demo.supabase.co';process.env.SUPABASE_ANON_KEY='test-key';
const {byPhone,byEmail}=require('./api/_lib/vh-allowlist');
assert.equal(byPhone('9945048798').email,'shivankur.ghosh@nobroker.in');
assert.equal(byEmail('ad.patra@nobroker.in').dsa_code,'DSA012345');
const calls=[];
global.fetch=async(url,opts={})=>{
 const path=new URL(url).pathname;calls.push({path,opts});
 let data=path==='/auth/v1/otp'?{}:path==='/auth/v1/verify'?{access_token:'x.y.z',user:{email:'shivankur.ghosh@nobroker.in'},expires_in:3600}:path==='/auth/v1/user'?{id:'user1',email:'shivankur.ghosh@nobroker.in',email_confirmed_at:'2026-11-18T00:00:00Z'}:null;
 assert.ok(data);return {ok:true,status:200,text:async()=>JSON.stringify(data)};
};
function mkRes(){return {setHeader(){},status(n){this.statusCode=n;return this},json(v){this.data=v;return this}}}
(async()=>{
 let r=mkRes();await require('./api/vh/request-otp')({method:'POST',body:{phone:'9945048798'}},r);assert.equal(r.statusCode,200);assert.equal(calls[0].path,'/auth/v1/otp');assert.equal(JSON.parse(calls[0].opts.body).email,'shivankur.ghosh@nobroker.in');
 r=mkRes();await require('./api/vh/verify-otp')({method:'POST',body:{phone:'9945048798',otp:'123456'}},r);assert.equal(r.statusCode,200);
 r=mkRes();await require('./api/vh/profile')({method:'GET',headers:{authorization:'Bearer x.y.z'}},r);assert.equal(r.data.dsaCode,'DSA012347');
 const count=calls.length;r=mkRes();await require('./api/vh/request-otp')({method:'POST',body:{phone:'9000000000'}},r);assert.equal(r.statusCode,200);assert.equal(calls.length,count);
 console.log('PASS: phone mapping, OTP send, verify, locked VH profile, unknown number');
})().catch(e=>{console.error(e);process.exit(1)});
