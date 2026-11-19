"use strict";
// Server-side only. NEVER import into browser assets.
const records = Object.freeze([
  Object.freeze({ name:'Aditya', dsa_code:'DSA012345', phone:'9990009999', email:'ad.patra@nobroker.in', designation:'Vertical Head' }),
  Object.freeze({ name:'Asad', dsa_code:'DSA012346', phone:'9999900000', email:'asad@nobroker.in', designation:'Vertical Head' }),
  Object.freeze({ name:'Shivankur', dsa_code:'DSA012347', phone:'9945048798', email:'shivankur.ghosh@nobroker.in', designation:'Vertical Head' })
]);
function byPhone(phone){ return records.find(row => row.phone===phone) || null; }
function byEmail(email){ return records.find(row => row.email.toLowerCase()===String(email||'').toLowerCase()) || null; }
module.exports={records,byPhone,byEmail};
