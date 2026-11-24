import {config} from './config.js';
const key='editor-session';let pending,expiryTimer;const MAX_AGE=86400000;
function arm(deadline){clearTimeout(expiryTimer);expiryTimer=setTimeout(()=>readSession(),Math.max(0,deadline-Date.now()));}
function originalTime(s){try{const iat=Number(JSON.parse(atob(s.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).iat)*1000;return Number.isFinite(iat)&&iat>0?Math.min(iat,Date.now()):Date.now()}catch{return Date.now()}}
function changed(){if(typeof document!=='undefined')document.dispatchEvent(new Event('editor-session-change'))}
export function readSession(){try{const s=JSON.parse(sessionStorage.getItem(key)||'null');if(!s?.access_token||!s?.refresh_token)return null;const deadline=Number(s.session_deadline)||originalTime(s)+MAX_AGE;if(Date.now()>=deadline){clearSession();return null}if(!s.session_deadline){s.session_deadline=deadline;sessionStorage.setItem(key,JSON.stringify(s));}arm(deadline);return s}catch{return null}}
export function storeSession(s){const previous=readSession();const value={...s,session_deadline:previous?.session_deadline||s.session_deadline||Date.now()+MAX_AGE,expires_at:s.expires_at||Date.now()+Number(s.expires_in||3600)*1000};if(value.session_deadline<=Date.now()){clearSession();return null;}sessionStorage.setItem(key,JSON.stringify(value));arm(value.session_deadline);changed();return value}
export function clearSession(){clearTimeout(expiryTimer);sessionStorage.removeItem(key);sessionStorage.removeItem('editor-admin-verified');changed()}
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
  return storeSession({...data,session_deadline:s.session_deadline});
 })();try{return await pending}finally{pending=null}
}

if(typeof window!=='undefined'){window.addEventListener('pageshow',()=>readSession());document.addEventListener('visibilitychange',()=>{if(!document.hidden)readSession()});readSession();}
