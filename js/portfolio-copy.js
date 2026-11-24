import {api,rows} from './core.js?v=flow-4';
const groupSelector='main section[id], header.site-header, footer.footer';
const skip='script,style,noscript,textarea,select,option,input,canvas,svg,iframe,[aria-hidden="true"],#pvModal,#journal,#announcement';
const normalize=s=>String(s||'').replace(/\s+/g,' ').trim();
function key(group,original){
 let a=2166136261,b=5381;
 for(const c of original){const n=c.codePointAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b,33)^n;}
 return 'portfolio_copy_'+group+'_'+(a>>>0).toString(16)+(b>>>0).toString(16);
}
function groupOf(el){const g=el.closest(groupSelector);return g?(g.id||g.tagName.toLowerCase()):null;}
function fields(doc){
 const list=new Map(),walker=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  const node=walker.currentNode,el=node.parentElement;
  if(!el||el.closest(skip))continue;
  const group=groupOf(el),original=normalize(node.__originalText||node.nodeValue);
  if(!group||original.length<2||original.length>2000)continue;
  const id=key(group,original);
  if(!list.has(id))list.set(id,{id,group,original});
 }
 return list;
}
const overrides=new Map();
function override(group,original,lang){
 const item=overrides.get(key(group,normalize(original)));
 return item?.[lang==='bn'?'value_bn':'value_en']||null;
}
export async function mountPublic(){
 try{
 const data=await rows('site_content','select=key,value_en,value_bn&key=like.portfolio_copy_*');
 for(const item of data)overrides.set(item.key,item);
 window.portfolioCopyOverride=(node,original,lang)=>{
  const el=node.parentElement;if(!el||el.closest(skip))return null;
  const group=groupOf(el);return group?override(group,original,lang):null;
 };
 const apply=()=>{
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),lang=document.documentElement.lang;
  while(walker.nextNode()){
   const node=walker.currentNode,el=node.parentElement;
   if(!el||el.closest(skip))continue;const group=groupOf(el);
   if(!group)continue;
   const original=node.__originalText||node.nodeValue;
   const value=override(group,original,lang);
   if(value!==null){if(!node.__originalText)node.__originalText=original;if(node.nodeValue!==value)node.nodeValue=value;}
  }
 };
 apply();document.addEventListener('portfolio-language-change',apply);document.addEventListener('portfolio-collections-change',apply);
 }catch(e){console.warn('Portfolio copy unavailable',e.message);}
}
function label(tag,text){const elem=document.createElement(tag);elem.textContent=text;return elem;}
export function mountEditor({authorize,notify}){
 const $=id=>document.getElementById(id);
 let all=[],saved=new Map(),drafts=new Map(),selected=null,loaded=false;
 function capture(){if(selected)drafts.set(selected.id,{value_en:$('copy-en').value,value_bn:$('copy-bn').value});}
 async function refresh(){
  await authorize();
  const source=await fetch('/index.html',{cache:'no-store'});if(!source.ok)throw Error('Could not load portfolio source.');
  const html=await source.text(),doc=new DOMParser().parseFromString(html,'text/html');
  const entries=fields(doc);
  const match=html.match(/(?:const|let) PROJECTS\s*=\s*(\[[\s\S]*?\])\s*;/);
  if(match){for(const project of JSON.parse(match[1]))for(const value of [project.title,project.category,project.summary,project.role,project.impact,...(project.features||[]),...(project.tools||[])]){
    const original=normalize(value);if(original){const id=key('projects',original);entries.set(id,{id,group:'projects',original});}
  }}
  all=[...entries.values()];
  saved=new Map((await rows('site_content','select=key,value_en,value_bn&key=like.portfolio_copy_*')).map(x=>[x.key,x]));
  const groups=[...new Set(all.map(x=>x.group))];
  $('copy-group').replaceChildren(new Option('All sections',''),...groups.map(g=>new Option(g.replaceAll('-',' '),g)));
  loaded=true;selected=null;showList();$('copy-status').textContent=all.length+' editable text fields.';
 }
 function showList(){
  const group=$('copy-group').value,q=normalize($('copy-search').value).toLowerCase();
  const subset=all.filter(x=>(!group||x.group===group)&&(!q||(x.original+' '+(saved.get(x.id)?.value_en||'')+' '+(saved.get(x.id)?.value_bn||'')).toLowerCase().includes(q)));
  $('copy-list').replaceChildren(...subset.map(x=>new Option(x.group+' · '+x.original.slice(0,90)+(saved.has(x.id)?' [edited]':''),x.id)));
  if(subset.length)choose(subset.find(x=>x.id===selected?.id)||subset[0]);else{selected=null;$('copy-form').hidden=true;}
 }
 function choose(x){
  selected=x;$('copy-live').href='/#'+encodeURIComponent(x.group);$('copy-list').value=x.id;$('copy-form').hidden=false;
  $('copy-original').textContent=x.original;
  $('copy-en').value=drafts.get(x.id)?.value_en??saved.get(x.id)?.value_en??'';$('copy-en').placeholder=x.original;
  $('copy-bn').value=drafts.get(x.id)?.value_bn??saved.get(x.id)?.value_bn??'';
 }
 $('copy-group').onchange=()=>{capture();showList();};$('copy-search').oninput=()=>{capture();showList();};
 $('copy-list').onchange=()=>{const x=all.find(x=>x.id===$('copy-list').value);if(x){capture();choose(x)}};
 $('copy-refresh').onclick=()=>{capture();return refresh().catch(e=>notify(e.message));};
 $('copy-form').onsubmit=async event=>{
  event.preventDefault();if(!selected)return;const item=selected;
  const button=$('copy-save');button.disabled=true;
  try{
   await authorize();
   const payload={key:item.id,value_en:$('copy-en').value.trim(),value_bn:$('copy-bn').value.trim(),updated_at:new Date().toISOString()};
   const written=await api('/rest/v1/site_content?on_conflict=key',{method:'POST',headers:{Prefer:'return=representation,resolution=merge-duplicates'},body:payload});
   if(!Array.isArray(written)||!written.length)throw Error('Save was not confirmed.');
   saved.set(item.id,payload);drafts.delete(item.id);$('copy-status').textContent='Published. Open the live section to verify.';showList();
  }catch(e){notify(e.message)}finally{button.disabled=false;}
 };
 $('copy-reset').onclick=()=>{$('copy-en').value='';$('copy-bn').value='';$('copy-form').requestSubmit();};
 return {open:async group=>{capture();if(!loaded)await refresh();$('copy-group').value=[...$('copy-group').options].some(x=>x.value===group)?group:'';$('copy-search').value='';showList();},refresh:()=>{if(!loaded)return refresh().catch(e=>notify(e.message));},clear:()=>{loaded=false;all=[];saved.clear();drafts.clear();selected=null;$('copy-list').replaceChildren();$('copy-original').textContent='';$('copy-en').value='';$('copy-bn').value='';$('copy-form').hidden=true;}};
}
