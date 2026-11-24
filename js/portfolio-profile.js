import {api,rows} from './core.js?v=flow-4';
const KEY='portfolio_profile_links_v1';
const $=id=>document.getElementById(id);
function targets(doc){
 const result=[];
 function push(id,label,selector,attribute){
 const node=doc.querySelector(selector);if(node)result.push({id,label,selector,attribute,original:node.getAttribute(attribute)||''});}
 push('portrait','Profile photo URL','.profile-photo','src');
 push('resume','Download resume URL','a[download][href*="CV"]','href');
 Array.from(doc.querySelectorAll('#contact .contact-links a, #contact .social-grid a')).forEach((a,i)=>{
  const selector=i<doc.querySelectorAll('#contact .contact-links a').length?'#contact .contact-links a:nth-child('+(i+1)+')':'#contact .social-grid a:nth-child('+(i-doc.querySelectorAll('#contact .contact-links a').length+1)+')';
  push('contact_'+i,a.textContent.trim().replace(/\s+/g,' ').slice(0,80),selector,'href');
 });return result;
}
function url(value,field){
 if(!value)return '';try{
 const u=new URL(value,'https://shahin4l.github.io/');
 if(u.username||u.password)return '';
 if(u.protocol==='https:')return u.origin==='https://shahin4l.github.io'?u.pathname+u.search+u.hash:u.href;
 if(field.id.startsWith('contact_')&&(u.protocol==='mailto:'||u.protocol==='tel:'))return u.href;
 return '';
 }catch{return '';}
}
async function get(){const r=await rows('site_content','select=value_en&key=eq.'+KEY);if(!r.length||!r[0].value_en)return {};try{return JSON.parse(r[0].value_en);}catch{return {};}}
export async function mountProfilePublic(){
 try{const data=await get();for(const f of targets(document)){const v=url(data[f.id],f);if(!v)continue;const n=document.querySelector(f.selector);n.setAttribute(f.attribute,v);if(f.id==='portrait'){const logo=$('brandPhoto');if(logo)logo.src=v;}if(f.id==='resume'&&v.startsWith('/'))n.setAttribute('download',v.split('/').at(-1));}}
 catch(e){console.warn('Profile settings unavailable',e.message);}
}
export function mountProfileEditor({authorize,notify}){
 let list=[],active=false;
 async function refresh(){if(active)return;await authorize();const response=await fetch('/index.html',{cache:'no-store'});if(!response.ok)throw Error('Portfolio source unavailable.');const doc=new DOMParser().parseFromString(await response.text(),'text/html');list=targets(doc);const data=await get();const box=$('profile-link-fields');box.replaceChildren();for(const f of list){const label=document.createElement('label');label.textContent=f.label;const input=document.createElement('input');input.id='profile-link-'+f.id;input.value=data[f.id]||f.original;input.maxLength=2000;label.append(input);box.append(label);}active=true;}
 $('profile-link-save').onclick=async()=>{if(!active)return;const b=$('profile-link-save');b.disabled=true;try{await authorize();const values={};for(const f of list){const value=$('profile-link-'+f.id).value.trim();if(value&&!url(value,f))throw Error('Invalid URL for '+f.label);values[f.id]=value;}const result=await api('/rest/v1/site_content?on_conflict=key',{method:'POST',headers:{Prefer:'return=representation,resolution=merge-duplicates'},body:{key:KEY,value_en:JSON.stringify(values),value_bn:'',updated_at:new Date().toISOString()}});if(!Array.isArray(result)||!result.length)throw Error('Save not confirmed.');notify('Profile links saved. Reload the public portfolio.');}catch(e){notify(e.message);}finally{b.disabled=false;}};
 return {refresh:()=>refresh().catch(e=>notify(e.message)),clear:()=>{active=false;list=[];$('profile-link-fields').replaceChildren();}};
}
