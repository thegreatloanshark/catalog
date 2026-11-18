const assert=require('node:assert/strict');
process.env.SUPABASE_URL='https://fake.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='SERVICE_TEST';process.env.SUPABASE_ANON_KEY='ANON_TEST';
const paths=[];
let active=true;
global.fetch=async (url,opts)=>{const path=new URL(url).pathname;paths.push({path,opts});let data;
 if(path==='/rest/v1/referral_vertical_heads')data=active?[{id:'vh1',name:'Aditya',dsa_code:'DSA012345',phone:'9990009999',email:'ad.patra@nobroker.in',designation:'Vertical Head',auth_user_id:'u1',is_active:true}]:[];
 else if(path==='/auth/v1/otp')data={};
 else if(path==='/auth/v1/verify')data={access_token:'x.y.z',user:{id:'u1'},expires_in:3600};
 else if(path==='/auth/v1/user')data={id:'u1',email:'ad.patra@nobroker.in'};
 else throw Error(path);
 return {ok:true,status:200,text:async()=>JSON.stringify(data)};
};
function mkRes(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(s){this.statusCode=s;return this},json(v){this.data=v;return this}}}
(async()=>{
 let r=mkRes();await require('../api/vh/request-otp.js')({method:'POST',body:{phone:'9990009999'}},r);assert.equal(r.statusCode,200);assert.ok(!JSON.stringify(r.data).includes('ad.patra'));
 r=mkRes();await require('../api/vh/verify-otp.js')({method:'POST',body:{phone:'9990009999',otp:'123456'}},r);assert.equal(r.data.accessToken,'x.y.z');
 r=mkRes();await require('../api/vh/profile.js')({method:'GET',headers:{authorization:'Bearer x.y.z'}},r);assert.equal(r.data.name,'Aditya');assert.equal(r.data.dsaCode,'DSA012345');
 active=false;r=mkRes();await require('../api/vh/request-otp.js')({method:'POST',body:{phone:'9990009999'}},r);assert.equal(r.statusCode,200);assert.ok(!JSON.stringify(r.data).includes('ad.patra'));
 console.log('PASS: OTP request, verification, protected profile, generic unknown response');
})().catch(e=>{console.error(e);process.exit(1)});
