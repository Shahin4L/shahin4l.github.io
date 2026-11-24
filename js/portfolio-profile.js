import {api,rows} from './core.js?v=flow-4';
import {config} from './config.js';
const KEY='portfolio_profile_links_v1';
const $=id=>document.getElementById(id);
const pictureIds=new Set(['portrait','hero']);
function targets(doc){
 const result=[],hero=doc.querySelector('.profile-photo'),brand=doc.getElementById('brandPhoto');
 if(hero){const original=hero.getAttribute('src')||'';result.push({id:'hero',label:'Hero photo',selector:'.profile-photo',attribute:'src',original});if(brand)result.push({id:'portrait',label:'Profile avatar',selector:'#brandPhoto',attribute:'src',original:brand.getAttribute('src')||original});}
 function push(id,label,selector,attribute){
 const node=doc.querySelector(selector);if(node)result.push({id,label,selector,attribute,original:node.getAttribute(attribute)||''});}
 push('resume','Download resume URL','a[download][href*="CV"]','href');
 const direct=doc.querySelectorAll('#contact .contact-links a').length;
 Array.from(doc.querySelectorAll('#contact .contact-links a, #contact .social-grid a')).forEach((a,i)=>{
 const selector=i<direct?'#contact .contact-links a:nth-child('+(i+1)+')':'#contact .social-grid a:nth-child('+(i-direct+1)+')';
 push('contact_'+i,a.textContent.trim().replace(/\s+/g,' ').slice(0,80),selector,'href');});
 return result;
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
function valueFor(data,f){
 // Earlier versions used portrait for both pictures. Preserve that setting until edited separately.
 if(f.id==='hero'&&!Object.hasOwn(data,'hero'))return data.portrait||f.original;
 return data[f.id]||f.original;
}
async function get(){const r=await rows('site_content','select=value_en&key=eq.'+KEY);if(!r.length||!r[0].value_en)return {};try{return JSON.parse(r[0].value_en)||{};}catch{return {};}}
export async function mountProfilePublic(){
 try{const data=await get();for(const f of targets(document)){
 if(f.id==='portrait'&&!data.portrait)continue;
 if(f.id==='hero'&&!data.hero&&!data.portrait)continue;
 const v=url(valueFor(data,f),f);if(!v)continue;
 const n=document.querySelector(f.selector);n.setAttribute(f.attribute,v);
 if(f.id==='portrait'){$('brandMark')?.classList.add('has-photo');}
 if(f.id==='resume'&&v.startsWith('/'))n.setAttribute('download',v.split('/').at(-1));
 }}catch(e){console.warn('Profile settings unavailable',e.message);}
}
const formats={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
async function validateImage(file){
 if(!file||!formats[file.type]||file.size>2097152||file.size===0)throw Error('Choose a JPEG, PNG or WebP image under 2 MB.');
 const b=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const png=[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v);
 const jpg=b[0]===255&&b[1]===216&&b[2]===255;
 const webp=String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';
 if(!({'image/png':png,'image/jpeg':jpg,'image/webp':webp}[file.type]))throw Error('Image content does not match its selected file type.');
 return formats[file.type];
}
function previewFile(file){
 return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('Could not read image.'));reader.readAsDataURL(file);});
}
async function upload(file,id){
 const ext=await validateImage(file),path='profile-'+id+'-'+crypto.randomUUID()+'.'+ext;
 await api('/storage/v1/object/article-images/'+path,{method:'POST',body:file,headers:{'Content-Type':file.type}});
 return config.url+'/storage/v1/object/public/article-images/'+path;
}
export function mountProfileEditor({authorize,notify}){
 let list=[],active=false,epoch=0,saving=false;
 const pending=new Map(),validating=new Set();
 function updatePreview(f,image,input){const v=url(input.value.trim(),f);image.src=v||url(f.original,f)||'';}
 async function refresh(){
 if(active)return;const generation=++epoch;await authorize();const response=await fetch('/index.html',{cache:'no-store'});if(!response.ok)throw Error('Portfolio source unavailable.');
 const doc=new DOMParser().parseFromString(await response.text(),'text/html'),data=await get();
 if(generation!==epoch)return;list=targets(doc);
 const box=$('profile-link-fields'),pictures=$('profile-image-fields');box.replaceChildren();pictures.replaceChildren();pending.clear();
 for(const f of list){
 const input=document.createElement('input');input.id='profile-link-'+f.id;input.value=valueFor(data,f);input.maxLength=2000;
 if(!pictureIds.has(f.id)){const label=document.createElement('label');label.textContent=f.label;label.append(input);box.append(label);continue;}
 const card=document.createElement('article');card.className='profile-image-card';
 const heading=document.createElement('h3');heading.textContent=f.label;
 const image=document.createElement('img');image.className='profile-image-preview '+f.id;image.alt=f.label+' preview';updatePreview(f,image,input);
 const helper=document.createElement('p');helper.textContent=f.id==='hero'?'Main portrait displayed in the home page hero.':'Small profile image in the website navigation.';
 const file=document.createElement('input');file.type='file';file.accept='image/jpeg,image/png,image/webp';file.id='profile-file-'+f.id;
 const fileLabel=document.createElement('label');fileLabel.textContent='Upload picture';fileLabel.append(file);
 const urlLabel=document.createElement('label');urlLabel.textContent='Image URL (optional)';urlLabel.append(input);
 const status=document.createElement('p');status.className='profile-image-status';status.setAttribute('role','status');
 const reset=document.createElement('button');reset.type='button';reset.className='secondary';reset.textContent='Use original photo';
 let selection=0;
 file.onchange=async()=>{const n=++selection,chosen=file.files[0];pending.delete(f.id);validating.delete(f.id);if(!chosen){updatePreview(f,image,input);status.textContent='';return;}
 validating.add(f.id);status.textContent='Checking image…';
 try{await validateImage(chosen);const dataUrl=await previewFile(chosen);const test=new Image();test.src=dataUrl;await test.decode();if(generation!==epoch||n!==selection)return;pending.set(f.id,chosen);image.src=dataUrl;status.textContent='Picture selected. Save & publish to upload.';}
 catch(e){if(n===selection){file.value='';updatePreview(f,image,input);status.textContent=e.message;notify(e.message);}}finally{if(n===selection)validating.delete(f.id);}};
 input.oninput=()=>{selection++;pending.delete(f.id);validating.delete(f.id);file.value='';updatePreview(f,image,input);status.textContent='URL changed. Save & publish when ready.';};
 reset.onclick=()=>{selection++;pending.delete(f.id);file.value='';input.value=f.original;updatePreview(f,image,input);status.textContent='Original picture selected. Save & publish to apply.';};
 card.append(heading,helper,image,fileLabel,urlLabel,reset,status);pictures.append(card);
 }
 active=true;
 }
 $('profile-link-save').onclick=async()=>{
 if(!active||saving)return;if(validating.size){notify('Wait for the picture preview to finish loading.');return;}saving=true;const generation=epoch,b=$('profile-link-save');b.disabled=true;
 const controls=[...$('profile-image-fields').querySelectorAll('input,button'),...$('profile-link-fields').querySelectorAll('input')];controls.forEach(c=>c.disabled=true);
 try{await authorize();const values={};
 for(const f of list){const value=$('profile-link-'+f.id).value.trim();if(value&&!url(value,f))throw Error('Invalid URL for '+f.label);values[f.id]=value;}
 for(const [id,file] of [...pending]){const uploaded=await upload(file,id);if(generation!==epoch)throw Error('Session changed. Sign in again.');values[id]=uploaded;$('profile-link-'+id).value=uploaded;$('profile-file-'+id).value='';pending.delete(id);}
 const result=await api('/rest/v1/site_content?on_conflict=key',{method:'POST',headers:{Prefer:'return=representation,resolution=merge-duplicates'},body:{key:KEY,value_en:JSON.stringify(values),value_bn:'',updated_at:new Date().toISOString()}});
 if(!Array.isArray(result)||!result.length)throw Error('Save not confirmed.');
 for(const s of $('profile-image-fields').querySelectorAll('.profile-image-status'))s.textContent='';
 notify('Profile pictures and links saved. Reload the public portfolio.');
 }catch(e){notify(e.message);}finally{saving=false;b.disabled=false;controls.forEach(c=>c.disabled=false);}
 };
 return {refresh:()=>refresh().catch(e=>notify(e.message)),clear:()=>{epoch++;active=false;list=[];pending.clear();validating.clear();$('profile-link-fields').replaceChildren();$('profile-image-fields').replaceChildren();}};
}
