'use strict';
const assert=require('node:assert/strict');
process.env.VH_DEMO_MODE='true';process.env.VH_DEMO_SIGNING_KEY='test-only-super-secret-string-for-hmac-use-not-live';
const request=require('./api/vh/request-otp');const verify=require('./api/vh/verify-otp');const profile=require('./api/vh/profile');
async function call(handler,method,body={},headers={}){const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(s){this.statusCode=s;return this;},json(d){this.body=d;return this;}};await handler({method,body,headers},res);return res;}
(async()=>{
 const phone='9945048798';const a=await call(request,'POST',{phone});assert.equal(a.statusCode,200);assert.equal(a.body.demo,true);
 const bad=await call(verify,'POST',{phone,otp:'123455'});assert.equal(bad.statusCode,401);
 const ok=await call(verify,'POST',{phone,otp:'123456'});assert.equal(ok.statusCode,200);assert(ok.body.accessToken);
 const p=await call(profile,'GET',{}, {authorization:`Bearer ${ok.body.accessToken}`});assert.equal(p.statusCode,200);assert.equal(p.body.email,'shivankur.ghosh@nobroker.in');assert.equal(p.body.name,'Shivankur');
 const forged=await call(profile,'GET',{}, {authorization:`Bearer ${ok.body.accessToken}a`});assert.equal(forged.statusCode,401);
 const noPhone=await call(verify,'POST',{phone:'9000000000',otp:'123456'});assert.equal(noPhone.statusCode,401);
 process.env.VH_DEMO_MODE='false';const disabled=await call(request,'POST',{phone});assert.equal(disabled.statusCode,503);
 console.log('PASS: 7 demo API assertions');
})().catch(e=>{console.error(e);process.exit(1)});
