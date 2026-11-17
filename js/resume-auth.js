import {config} from './config.js';
export function createResumeClient({storage,fetchImpl=fetch}={}){
 storage=storage||globalThis.sessionStorage;const key='resume-builder-session-v1';let memory=null,pending=null,serial=0;
 const read=()=>{try{const s=JSON.parse(storage.getItem(key)||'null');return s?.access_token&&s?.refresh_token?s:memory}catch{return memory}};
 const keep=s=>{memory={access_token:s.access_token,refresh_token:s.refresh_token,expires_at:Date.now()+Number(s.expires_in||3600)*1000};try{storage.setItem(key,JSON.stringify(memory))}catch{}return memory};
 const clear=()=>{serial++;memory=null;try{storage.removeItem(key)}catch{}};
 async function raw(path,{method='GET',body,token,headers={}}={}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetchImpl(config.url+path,{method,credentials:'omit',signal:controller.signal,headers:{apikey:config.key,...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
 const text=await response.text();let data;try{data=text?JSON.parse(text):null}catch{throw Error('Unexpected service response')}
 if(!response.ok){const e=Error(data?.msg||data?.error_description||data?.message||data?.error||'Request failed');e.status=response.status;throw e}return data;
 }finally{clearTimeout(timer)}}
 async function session(){const s=read();if(!s)return null;if(s.expires_at>Date.now()+60000)return s;if(pending)return pending;const run=serial;
 pending=(async()=>{try{const next=await raw('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:s.refresh_token}});return run===serial&&read()?.refresh_token===s.refresh_token?keep(next):null}catch(e){if([400,401,403].includes(e.status))clear();throw e}})();try{return await pending}finally{pending=null}}
 async function request(path,options={}){const s=await session();if(!s)throw Error('Sign in to use private cloud storage.');return raw(path,{...options,token:s.access_token})}
 return {read,keep,clear,request,raw,session,
 async login(email,password){keep(await raw('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}}));return request('/auth/v1/user')},
 signup:(email,password)=>raw('/auth/v1/signup?redirect_to='+encodeURIComponent(config.site+'/resume-builder/'),{method:'POST',body:{email,password,data:{module:'resume-builder'}}}),
 recover:email=>raw('/auth/v1/recover?redirect_to='+encodeURIComponent(config.site+'/resume-builder/'),{method:'POST',body:{email}}),
 async logout(){try{await request('/auth/v1/logout?scope=local',{method:'POST'})}finally{clear()}}
 };
}
