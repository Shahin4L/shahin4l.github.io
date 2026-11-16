import {config} from './config.js';
const key='editor-session';let pending;
function changed(){if(typeof document!=='undefined')document.dispatchEvent(new Event('editor-session-change'))}
export function readSession(){try{const s=JSON.parse(sessionStorage.getItem(key)||'null');return s?.access_token&&s?.refresh_token?s:null}catch{return null}}
export function storeSession(s){const value={...s,expires_at:s.expires_at||Date.now()+Number(s.expires_in||3600)*1000};sessionStorage.setItem(key,JSON.stringify(value));changed();return value}
export function clearSession(){sessionStorage.removeItem(key);sessionStorage.removeItem('editor-admin-verified');changed()}
export function markAdmin(){sessionStorage.setItem('editor-admin-verified','true');changed()}
export function adminState(){return !!readSession()&&sessionStorage.getItem('editor-admin-verified')==='true'}
export async function refreshSession(force=false){
 const s=readSession();if(!s)return null;
 if(!force&&Number(s.expires_at)>Date.now()+60000)return s;
 if(pending)return pending;
 pending=(async()=>{
  const r=await fetch(config.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',signal:AbortSignal.timeout(15000),headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});
  const data=await r.json();
  if(!r.ok){const e=new Error('Your session could not be renewed. Please sign in again.');e.status=r.status;if([400,401,403].includes(r.status))clearSession();throw e}
  // Signing out during an in-flight refresh must never restore a session.
  if(readSession()?.refresh_token!==s.refresh_token)return null;
  return storeSession(data);
 })();try{return await pending}finally{pending=null}
}
