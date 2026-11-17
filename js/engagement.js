import {config} from './config.js';
// Public guest endpoint has verify_jwt=false. All validation, moderation and
// abuse limits remain server-side. No admin token or API key is required here.
// text/plain is CORS-safelisted: JSON bytes reach the existing JSON parser
// without an OPTIONS preflight that can be blocked by the browser/gateway.
export async function submitEngagement(payload,{fetchImpl=fetch}={}){
 const attempts=payload.kind==='comment'?1:2;
 for(let attempt=0;attempt<attempts;attempt++){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  let response;
  try{
   response=await fetchImpl(config.url+'/functions/v1/journal-engagement',{
    method:'POST',mode:'cors',credentials:'omit',signal:controller.signal,
    headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload)
   });
  }catch(cause){
   if(attempt+1<attempts)continue;
   const error=new Error('Could not reach the reaction service. Please try again.');
   error.message_bn='রিঅ্যাকশন সার্ভারে পৌঁছানো যায়নি। আবার চেষ্টা করুন।';error.code='network';throw error;
  }finally{clearTimeout(timer)}
  let result;try{result=await response.json()}catch{}
  if(!response.ok||!result?.ok){
   const error=new Error(result?.error||'Could not save. Please try again later.');
   error.message_bn=response.status===429||result?.error?.includes('Too many')?'অনেকবার অনুরোধ হয়েছে। দশ মিনিট পর চেষ্টা করুন।':'সংরক্ষণ করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।';
   error.code='service';throw error;
  }
  return result;
 }
}

export async function readReactionStats(postId,{fetchImpl=fetch}={}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetchImpl(config.url+'/rest/v1/article_stats?select=likes,useful&post_id=eq.'+encodeURIComponent(postId)+'&limit=1',{headers:{apikey:config.key},credentials:'omit',signal:controller.signal});
  if(!response.ok)throw new Error('Counts unavailable');
  const rows=await response.json();return {likes:Number(rows[0]?.likes||0),useful:Number(rows[0]?.useful||0)};
 }finally{clearTimeout(timer)}
}
