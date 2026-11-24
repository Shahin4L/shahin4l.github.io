import {api,rows} from './core.js?v=flow-4';
const PREFIX='portfolio_collection_v1_';
const GROUPS={projects:['Projects','#projectGrid','project-card'],experience:['Experience','#experience .timeline','timeline-item'],skills:['Skills','#skills .skills-grid','skill-card'],education:['Education','#education .education-grid','education-card'],'profile-details':['Profile details','#profile-details .education-grid','education-card'],teams:['Teams','#teamGrid','team-card'],growth:['Professional development','#growth .growth-grid','growth-card'],services:['Services','#services .marketplace-grid','marketplace-card'],improvement:['Improvement framework','#improvement .framework-grid','framework-card'],roadmap:['Roadmap','#roadmap .roadmap','roadmap-card'],faq:['FAQ','#faq .faq-list','faq-item'],results:['Results','#results .res-wrap','res-card'],custom:['Additional sections','','']};
const $=id=>document.getElementById(id);
const lines=s=>String(s||'').split('\n').map(x=>x.trim()).filter(Boolean);
const localized=(r,k,lang)=>String(lang==='bn'&&r[k+'Bn']?r[k+'Bn']:r[k]||'');
const fields=['title','titleBn','subtitle','subtitleBn','category','categoryBn','body','bodyBn','features','featuresBn','tools','toolsBn','role','roleBn','impact','impactBn','link','image','icon','preview','demo','demoLogin'];
const labels=['Title / company / question','বাংলা শিরোনাম','Subtitle / job role','বাংলা উপশিরোনাম','Period / category / metric','বাংলা সময়কাল / বিভাগ','Description / details','বাংলা বিবরণ','Bullet points (one per line)','বাংলা পয়েন্ট','Tools / tags (one per line)','বাংলা টুল / ট্যাগ','Project role','বাংলা প্রজেক্ট ভূমিকা','Project impact','বাংলা প্রভাব','Company or project link','Project image URL','Project icon','Preview path (same website)','Demo URL','Public demo login instructions'];
const arrays=new Set(['features','featuresBn','tools','toolsBn']),projectOnly=new Set(['role','roleBn','impact','impactBn','image','icon','preview','demo','demoLogin']);
function safeLink(value,preview=false){
 if(typeof value!=='string'||!value.trim())return '';
 try{const base=new URL('https://shahin4l.github.io/'),u=new URL(value,base);if(u.protocol!=='https:'||u.username||u.password||(preview&&u.origin!==base.origin))return '';return u.origin===base.origin?u.pathname+u.search+u.hash:u.href;}catch{return '';}
}
function normalize(records){
 if(!Array.isArray(records)||records.length>100)throw Error('Collection limit is 100 items.');
 return records.filter(r=>r&&typeof r.title==='string').map(r=>{
 const o={};for(const f of fields)o[f]=arrays.has(f)?(Array.isArray(r[f])?r[f]:lines(r[f])).map(v=>String(v).slice(0,2000)).slice(0,80):String(r[f]||'').slice(0,15000);
 for(const f of ['link','image','preview','demo'])o[f]=safeLink(o[f],f==='preview');
 o.original=Number.isInteger(r.original)?r.original:null;o.preserved=r.preserved===true&&o.original!==null;return o;
 });
}
function decode(data){const out={};for(const row of data){const g=row.key.slice(PREFIX.length);if(!Object.hasOwn(GROUPS,g)||!row.value_en)continue;try{out[g]=normalize(JSON.parse(row.value_en));}catch(e){console.warn('Invalid collection',g);}}return out;}
async function read(){return decode(await rows('site_content','select=key,value_en&key=like.portfolio_collection_v1_*'));}
const text=(e,s)=>e.querySelector(s)?.textContent.trim()||'';
function defaults(html,doc){
 const out={custom:[]};
 const match=html.match(/(?:let|const) PROJECTS\s*=\s*(\[[\s\S]*?\])\s*;/);
 out.projects=match?JSON.parse(match[1]).map((p,i)=>({...p,body:p.summary||'',original:i,preserved:true,demoLogin:p.demo?(p.demo.includes('/attendance/')?'Employee ID DEMO-001 · Manager demo@example.invalid · Code 123456':'demo@example.invalid · Code 123456'):''})):[];
 for(const [id,[,selector]] of Object.entries(GROUPS)){
 if(id==='projects'||id==='custom')continue;const root=doc.querySelector(selector);
 out[id]=root?[...root.children].map((n,i)=>({title:text(n,'h3,summary,b'),subtitle:text(n,'.role'),category:text(n,'.timeline-date,.roadmap-period,.framework-index,.res-num'),body:[...n.querySelectorAll('p')].map(x=>x.textContent.trim()).join('\n')||(id==='results'?n.lastElementChild?.textContent||'':text(n,'small')),features:[...n.querySelectorAll('li')].map(x=>x.textContent.trim()),tools:[...n.querySelectorAll('.mini-tag,.marketplace-tag')].map(x=>x.textContent.trim()),link:n.querySelector('h3 a')?.getAttribute('href')||'',original:i,preserved:true})):[];}
 return out;
}
function el(tag,value,cl){const e=document.createElement(tag);if(value!==undefined)e.textContent=value;if(cl)e.className=cl;return e;}
function add(root,tag,value,cl){if(value)root.append(el(tag,value,cl));}
function details(root,r,lang){
 for(const p of lines(localized(r,'body',lang)))add(root,'p',p);
 const bullets=lang==='bn'&&r.featuresBn.length?r.featuresBn:r.features;
 if(bullets.length){const ul=el('ul');bullets.forEach(p=>ul.append(el('li',p)));root.append(ul);}
 const tags=lang==='bn'&&r.toolsBn.length?r.toolsBn:r.tools;
 if(tags.length){const box=el('div',undefined,'team-meta');tags.forEach(t=>box.append(el('span',t,'mini-tag')));root.append(box);}
 if(r.link){const a=el('a','Learn more ↗','company-link');a.href=r.link;a.target='_blank';a.rel='noopener noreferrer';root.append(a);}
}
function buildCard(id,r,lang){
 const cl=GROUPS[id][2],t=localized(r,'title',lang),s=localized(r,'subtitle',lang),c=localized(r,'category',lang);
 const box=el(id==='faq'?'details':id==='results'?'div':'article',undefined,cl);
 if(id==='faq'){box.append(el('summary',t));details(box,r,lang);return box;}
 if(id==='experience'){add(box,'div',c,'timeline-date');const b=el('div',undefined,'timeline-content');add(b,'h3',t);add(b,'div',s,'role');details(b,r,lang);box.append(b);return box;}
 if(id==='results'){add(box,'div',c,'res-num');add(box,'b',t);add(box,'span',localized(r,'body',lang));return box;}
 add(box,'small',c,id==='roadmap'?'roadmap-period':id==='improvement'?'framework-index':'');add(box,'h3',t);add(box,'p',s);details(box,r,lang);
 if(id==='teams')box.dataset.search=[t,s,r.body,...r.tools].join(' ');return box;
}
export async function mountCollectionsPublic(){
 const originals={};for(const [id,[,selector]] of Object.entries(GROUPS)){if(selector&&id!=='projects'){const root=document.querySelector(selector);if(root)originals[id]=[...root.children];}}
 try{const data=await read();
 function render(){
 const lang=document.documentElement.lang;
 for(const [id,list] of Object.entries(data)){
 if(id==='projects'){
 window.renderPortfolioProjects?.(list.map(r=>({...r,title:localized(r,'title',lang),category:localized(r,'category',lang),summary:localized(r,'body',lang),role:localized(r,'role',lang),impact:localized(r,'impact',lang),features:lang==='bn'&&r.featuresBn.length?r.featuresBn:r.features,tools:lang==='bn'&&r.toolsBn.length?r.toolsBn:r.tools})));
 const count=document.querySelector('#projects .proj-overview strong');if(count)count.textContent=String(list.length);continue;}
 if(id==='custom'){
 document.querySelectorAll('[data-managed-section]').forEach(n=>n.remove());const contact=$('contact');if(!contact)continue;
 list.forEach((r,i)=>{const section=el('section',undefined,i%2?'section-soft':'section');section.dataset.managedSection='true';const b=el('div',undefined,'container');add(b,'h2',localized(r,'title',lang));add(b,'p',localized(r,'subtitle',lang),'section-intro');details(b,r,lang);section.append(b);contact.before(section);});continue;}
 const root=document.querySelector(GROUPS[id][1]);if(!root)continue;
 root.replaceChildren(...list.map(r=>r.preserved&&originals[id]?.[r.original]?originals[id][r.original]:buildCard(id,r,lang)));
 if(id==='teams')$('teamSearch')?.dispatchEvent(new Event('input'));
 }
 document.dispatchEvent(new Event('portfolio-collections-change'));
 }
 render();document.addEventListener('portfolio-language-change',render);
 }catch(e){console.warn('Portfolio collections unavailable',e.message);}
}
export function mountCollectionEditor({authorize,notify}){
 let base={},drafts={},active='projects',selected=-1,loaded=false;
 fields.forEach((f,i)=>{const label=el('label',labels[i]),input=el(arrays.has(f)||f.startsWith('body')?'textarea':'input');input.id='collection-'+f;input.maxLength=15000;if(input.tagName==='TEXTAREA')input.rows=4;label.append(input);$('collection-fields').append(label);});
 const current=()=>drafts[active],status=s=>$('collection-status').textContent=s;
 function show(){const r=current()[selected];if(!r)return;$('collection-edit').hidden=false;fields.forEach(f=>{const input=$('collection-'+f);input.parentElement.hidden=active!=='projects'&&projectOnly.has(f);input.value=Array.isArray(r[f])?r[f].join('\n'):r[f]||'';});}
 function list(){const box=$('collection-items');box.replaceChildren(...current().map((r,i)=>new Option((i+1)+'. '+(r.title||'Untitled'),String(i))));if(current().length){selected=Math.min(Math.max(selected,0),current().length-1);box.value=String(selected);show();}else{selected=-1;$('collection-edit').hidden=true;}}
 function apply(){if(selected<0)return true;const previous=current()[selected],next={...previous};for(const f of fields){if(active!=='projects'&&projectOnly.has(f))continue;const v=$('collection-'+f).value.trim();next[f]=arrays.has(f)?lines(v):v;}
 if(!next.title){notify('Title is required.');return false;}
 if(fields.some(f=>JSON.stringify(next[f]||(arrays.has(f)?[]:''))!==JSON.stringify(previous[f]||(arrays.has(f)?[]:''))))next.preserved=false;
 for(const f of ['link','image','preview','demo'])if(next[f]&&!safeLink(next[f],f==='preview')){notify('Use valid HTTPS links and same-site preview URLs.');return false;}current()[selected]=next;return true;}
 async function refresh(){if(loaded)return;await authorize();const response=await fetch('/index.html',{cache:'no-store'});if(!response.ok)throw Error('Portfolio source unavailable.');const html=await response.text();base=defaults(html,new DOMParser().parseFromString(html,'text/html'));drafts=JSON.parse(JSON.stringify({...base,...await read()}));$('collection-type').replaceChildren(...Object.entries(GROUPS).map(([id,g])=>new Option(g[0],id)));$('collection-type').value=active;loaded=true;selected=0;list();status('Choose a collection to add, edit or reorder items.');}
 $('collection-type').onchange=()=>{const next=$('collection-type').value;if(!apply()){$('collection-type').value=active;return;}active=next;selected=0;list();};
 $('collection-items').onchange=()=>{const i=Number($('collection-items').value);if(!apply()){$('collection-items').value=String(selected);return;}selected=i;show();};
 $('collection-new').onclick=()=>{if(!loaded||!apply())return;current().push({title:'New item',original:null,preserved:false});selected=current().length-1;list();$('collection-title').focus();$('collection-title').select();};
 $('collection-apply').onclick=()=>{if(loaded&&apply()){list();status('Draft updated. Save collection to publish.');}};
 $('collection-remove').onclick=()=>{if(loaded&&selected>=0&&confirm('Remove this item from the draft? Save collection to publish.')){current().splice(selected,1);list();}};
 function move(step){if(!loaded||!apply()||selected<0)return;const to=selected+step;if(to<0||to>=current().length)return;const [r]=current().splice(selected,1);current().splice(to,0,r);selected=to;list();}
 $('collection-up').onclick=()=>move(-1);$('collection-down').onclick=()=>move(1);
 $('collection-publish').onclick=async()=>{if(!loaded||!apply())return;const name=active,b=$('collection-publish');b.disabled=true;try{await authorize();const records=normalize(drafts[name]);const result=await api('/rest/v1/site_content?on_conflict=key',{method:'POST',headers:{Prefer:'return=representation,resolution=merge-duplicates'},body:{key:PREFIX+name,value_en:JSON.stringify(records),value_bn:'',updated_at:new Date().toISOString()}});if(!Array.isArray(result)||!result.length)throw Error('Save was not confirmed.');drafts[name]=records;if(name===active)list();status('Published. Open or reload the public portfolio.');}catch(e){notify(e.message);}finally{b.disabled=false;}};
 $('collection-restore').onclick=()=>{if(loaded&&confirm('Restore the original collection in the draft? Save to publish.')){drafts[active]=JSON.parse(JSON.stringify(base[active]));selected=0;list();status('Original list restored in draft.');}};
 return {refresh:()=>refresh().catch(e=>notify(e.message)),clear:()=>{loaded=false;base={};drafts={};selected=-1;$('collection-items').replaceChildren();$('collection-edit').hidden=true;fields.forEach(f=>$('collection-'+f).value='');status('');}};
}
