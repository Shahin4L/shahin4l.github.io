import {shell,lang,t,esc} from './core.js?v=flow-4';
import {sample,recipes} from './formula-data.js';
import {renderCards} from './formula-view.js';
import {filterRecipes,summarize,summaryFormula,sampleTSV} from './formula-model.js';
shell();
const $=s=>document.querySelector(s);let limit=24;
const byId=new Map(recipes.map(r=>[r.id,r]));
function render(){
 const list=filterRecipes(recipes,{query:$('#formula-search').value,category:$('#formula-category').value,platform:$('#formula-platform').value});
 $('#formula-results').innerHTML=renderCards(list.slice(0,limit),lang)||'<p class="empty">'+t('No matches. Try a shorter phrase or another platform.','কিছু পাওয়া যায়নি। অন্য শব্দ বা প্ল্যাটফর্ম দিয়ে খুঁজুন।')+'</p>';
 $('#formula-count').textContent=t('Showing ','দেখানো হচ্ছে ')+Math.min(limit,list.length)+' / '+list.length+t(' recipes',' টি ফর্মুলা');
 $('#formula-more').hidden=list.length<=limit;
 document.title=t('Formula Lab — Excel & Google Sheets | Shahin Alam','ফর্মুলা ল্যাব — Excel ও Google Sheets | শাহীন আলম');
 $('#formula-status').textContent='';
}
function practice(){
 const hub=$('#practice-hub').value,status=$('#practice-status').value;
 const result=summarize(sample,hub,status);
 for(const key of ['rows','quantity','amount'])$('#practice-'+key).textContent=result[key].toLocaleString(lang==='bn'?'bn-BD':'en-GB');
 $('#practice-formula').textContent=summaryFormula(hub,status);
}
async function copy(value){
 try{await navigator.clipboard.writeText(value);$('#formula-status').textContent=t('Copied. Paste into your spreadsheet.','কপি হয়েছে। আপনার শিটে পেস্ট করুন।')}
 catch{const box=$('#manual-copy');box.hidden=false;box.value=value;box.focus();box.select();$('#formula-status').textContent=t('Select the text below and copy it manually.','নিচের নির্বাচিত লেখা কপি করুন।')}
}
$('#formula-controls').onsubmit=e=>e.preventDefault();
for(const id of ['formula-search','formula-category','formula-platform'])$( '#'+id).addEventListener('input',()=>{limit=24;render()});
$('#formula-more').onclick=()=>{limit+=24;render()};
$('#formula-results').addEventListener('click',e=>{const b=e.target.closest('[data-copy]');if(b){const r=byId.get(b.dataset.copy);if(r&&r[b.dataset.platform])copy(r[b.dataset.platform])}});
document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{$('#formula-search').value=b.dataset.quick;limit=24;render();$('#recipe-library').scrollIntoView({block:'start'})});
$('#copy-sample').onclick=()=>copy(sampleTSV(sample));$('#copy-practice').onclick=()=>copy($('#practice-formula').textContent);
for(const id of ['practice-hub','practice-status'])$('#'+id).onchange=practice;
document.addEventListener('language',()=>{render();practice()});
function revealHash(){if(!/^#r\d{2}$/.test(location.hash))return;limit=recipes.length;$('#formula-search').value='';$('#formula-category').value='all';$('#formula-platform').value='all';render();const el=document.getElementById(location.hash.slice(1));if(el){el.open=true;el.scrollIntoView({block:'start'})}}
window.addEventListener('hashchange',revealHash);
render();practice();revealHash();
