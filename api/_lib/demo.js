'use strict';
const crypto = require('node:crypto');
const {byPhone} = require('./vh-allowlist');
function isEnabled(){return process.env.VH_DEMO_MODE === 'true';}
function reply(res,status,json){res.setHeader('Cache-Control','no-store, private');res.setHeader('Content-Type','application/json; charset=utf-8');return res.status(status).json(json);}
function postOnly(req,res){if(req.method==='POST')return true;res.setHeader('Allow','POST');reply(res,405,{error:'Method not allowed'});return false;}
function secret(){const key=process.env.VH_DEMO_SIGNING_KEY;if(!key||key.length<32)throw new Error('VH_DEMO_SIGNING_KEY must contain at least 32 characters');return key;}
function sign(data){return crypto.createHmac('sha256',secret()).update(data).digest('base64url');}
function issue(phone){const payload=Buffer.from(JSON.stringify({phone,expires:Date.now()+15*60*1000,scope:'vh-demo-profile'})).toString('base64url');return payload+'.'+sign(payload);}
function resolve(token){if(!isEnabled()||typeof token!=='string'||token.length>1000)return null;const parts=token.split('.');if(parts.length!==2||!/^[A-Za-z0-9_-]+$/.test(parts[0]))return null;const expected=sign(parts[0]);const actual=parts[1];if(actual.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return null;let data;try{data=JSON.parse(Buffer.from(parts[0],'base64url').toString());}catch{return null;}if(data.scope!=='vh-demo-profile'||!Number.isFinite(data.expires)||data.expires<Date.now())return null;return byPhone(data.phone);}
function enabled(res){if(isEnabled())return true;reply(res,503,{error:'Demo mode is disabled. Real verification is not configured.'});return false;}
module.exports={reply,postOnly,issue,resolve,enabled};
