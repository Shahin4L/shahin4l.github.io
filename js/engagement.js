import {config} from './config.js';
// Guest actions never depend on an editor's access token or session refresh.
export async function submitEngagement(payload,{fetchImpl=fetch}={}){
 const attempts=payload.kind==='comment'?1:2;
 for(let attempt=0;attempt<attempts;attempt++){
  let response;
  try{
   response=await fetchImpl(config.url+'/functions/v1/journal-engagement',{
    method:'POST',mode:'cors',credentials:'omit',cache:'no-store',
    signal:AbortSignal.timeout(30000),
    headers:{apikey:config.key,'Content-Type':'application/json'},
    body:JSON.stringify(payload)
   });
  }catch(cause){
   if(attempt+1<attempts)continue; // Like/useful are idempotent for the same visitor.
   const error=new Error('Could not connect. Please check your connection and try again.');
   error.message_bn='সংযোগ করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।';error.code='network';throw error;
  }
  let result;try{result=await response.json()}catch{}
  if(!response.ok||!result?.ok){
   const error=new Error(result?.error||'Could not save. Please try again later.');
   error.message_bn=response.status===429||result?.error?.includes('Too many')?'অনেকবার অনুরোধ হয়েছে। দশ মিনিট পর চেষ্টা করুন।':'সংরক্ষণ করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।';
   error.code='service';throw error;
  }
  return result;
 }
}
