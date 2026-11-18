(() => {
  'use strict';
  const status = document.getElementById('attribution-message');
  const form = document.getElementById('referral-form');
  const submit = document.getElementById('submit-referral');
  const token = new URLSearchParams(location.search).get('ref');
  if (!token) { status.textContent = 'To submit a referral, open the unique link shared by your Vertical Head. This preview does not accept submissions.'; return; }
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(token)) { status.textContent = 'This referral link is invalid. Please request a new link from your Vertical Head.'; return; }
  status.textContent = 'Referral link provided. Verification and secure submission are not connected yet; please do not enter personal details for submission.';
  // SECURITY: Do not activate submission merely because a token is present.
  // Integrate an authenticated backend GET /api/referral-config?ref=<token>
  // and enable only upon a verified active campaign result.
  form.addEventListener('submit', (event) => event.preventDefault());
  submit.disabled = true;
})();


// Vertical Head phone lookup with Supabase email OTP. Tokens are memory-only.
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const phone=$('vh-mobile'), send=$('vh-send-otp'), verify=$('vh-check-otp'), otp=$('vh-otp');
  const message=$('vh-auth-status'), verifyBox=$('vh-verify'), profile=$('vh-profile');
  let accessToken=null, verifiedPhone=null;
  async function request(path,options={}){
    const response=await fetch(path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})},cache:'no-store'});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||'Request failed.');
    return data;
  }
  send.addEventListener('click',async()=>{
    const number=phone.value.trim();
    if(!/^[6-9][0-9]{9}$/.test(number)){message.textContent='Enter a valid 10-digit mobile number.';return;}
    send.disabled=true;message.textContent='Requesting verification email…';profile.hidden=true;accessToken=null;
    try {const data=await request('/api/vh/request-otp',{method:'POST',body:JSON.stringify({phone:number})});verifiedPhone=number;verifyBox.hidden=false;message.textContent=data.message;}
    catch(e){message.textContent=e.message;}finally{send.disabled=false;}
  });
  verify.addEventListener('click',async()=>{
    if(phone.value.trim()!==verifiedPhone){message.textContent='Your phone number changed. Request a new OTP.';return;}
    verify.disabled=true;message.textContent='Verifying…';
    try{
      const result=await request('/api/vh/verify-otp',{method:'POST',body:JSON.stringify({phone:verifiedPhone,otp:otp.value.trim()})});
      accessToken=result.accessToken;
      const vh=await request('/api/vh/profile',{headers:{Authorization:`Bearer ${accessToken}`}});
      $('vh-name').value=vh.name; $('vh-dsa').value=vh.dsaCode; $('vh-email').value=vh.email; $('vh-contact').value=vh.phone;
      $('vh-designation').value=vh.designation; $('vh-designation').disabled=false;
      profile.hidden=false;verifyBox.hidden=true;phone.readOnly=true;send.disabled=true;
      message.textContent='Verified. Your registered details are locked; you may edit your designation.';
      // Deliberately do not enable photo upload or PNG generation before those APIs exist.
    }catch(e){accessToken=null;message.textContent=e.message;}finally{verify.disabled=false;}
  });
})();
