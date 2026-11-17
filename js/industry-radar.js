import {esc,t,lang} from './core.js?v=flow-4';
import {normalizeRadar,radarHealth,filterNews,radarTopics,dateValue,httpsURL} from './radar-model.js?v=1';
import {renderHeadline} from './radar-view.js?v=1';
const $=s=>document.querySelector(s);
let snapshot=null,limit=12;
function when(value,withTime=false){
 if(dateValue(value)===null)return t('Not yet available','এখনও পাওয়া যায়নি');
 return new Intl.DateTimeFormat(lang==='bn'?'bn-BD':'en-GB',{timeZone:'Asia/Dhaka',year:'numeric',month:'short',day:'numeric',...(withTime?{hour:'numeric',minute:'2-digit'}:{})}).format(new Date(value));
}
export function initRadar(){
 const form=$('#radar-filters');if(!form)return;
 function options(){
 const selected=$('#radar-source').value||'all',topic=$('#radar-topic').value||'all',period=$('#radar-period').value||'30';
 $('#radar-topic').innerHTML=radarTopics.map(([id,en,bn])=>`<option value="${id}">${esc(t(en,bn))}</option>`).join('');$('#radar-topic').value=topic;
 $('#radar-source').innerHTML=`<option value="all">${t('All publishers','সব প্রকাশক')}</option>`+(snapshot?.sources||[]).map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');$('#radar-source').value=selected;
 $('#radar-period').innerHTML=[['30','Last 30 days','গত ৩০ দিন'],['7','Last 7 days','গত ৭ দিন'],['today','Published today · Bangladesh time','আজ প্রকাশিত · বাংলাদেশ সময়']].map(([id,en,bn])=>`<option value="${id}">${esc(t(en,bn))}</option>`).join('');$('#radar-period').value=period;
 }
 function render(){
 if(!snapshot)return;
 const health=radarHealth(snapshot),status=health.failed?t('Collection failed · showing saved headlines','সংগ্রহ ব্যর্থ · সংরক্ষিত খবর দেখানো হচ্ছে'):health.partial?t('Some sources could not be refreshed','কিছু উৎস থেকে নতুন তথ্য পাওয়া যায়নি'):t('All feeds checked successfully','সব ফিড সফলভাবে পরীক্ষা করা হয়েছে');
 $('#radar-status').innerHTML=`<span class="radar-state ${health.failed||health.partial||health.stale?'is-warning':''}">${esc(status)}</span><div class="radar-timestamps"><p>${t('Last checked: ','সর্বশেষ পরীক্ষা: ')}<time datetime="${esc(snapshot.checked_at)}">${esc(when(snapshot.checked_at,true))}</time></p><p>${t('Latest successful collection: ','সর্বশেষ সফল সংগ্রহ: ')}${esc(when(snapshot.last_success_at,true))}${health.partial?t(' · available sources',' · যেসব উৎস পাওয়া গেছে'):''}</p></div><p class="meta">${t('Bangladesh time · New links in this collection: ','বাংলাদেশ সময় · এই সংগ্রহে নতুন লিংক: ')}${Number(snapshot.new_count)||0}</p>${health.stale?`<p class="radar-warning">${t('The last successful collection is over 36 hours old or unavailable. These are saved headlines; the daily updater may be delayed.','সর্বশেষ সফল সংগ্রহ ৩৬ ঘণ্টার বেশি পুরোনো অথবা পাওয়া যায়নি। এগুলো সংরক্ষিত খবর; দৈনিক আপডেট বিলম্বিত হতে পারে।')}</p>`:''}`;
 $('#radar-source-health').innerHTML=snapshot.sources.map(s=>`<li><a href="${esc(httpsURL(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a><span>${s.status==='success'?t('Feed checked','ফিড পরীক্ষা হয়েছে'):t('Feed unavailable · saved items retained','ফিড পাওয়া যায়নি · সংরক্ষিত খবর রাখা হয়েছে')}</span><small>${t('Last success: ','সর্বশেষ সফল: ')}${esc(when(s.last_success_at,true))}</small></li>`).join('');
 const list=filterNews(snapshot.articles,{query:$('#radar-search').value,topic:$('#radar-topic').value,source:$('#radar-source').value,period:$('#radar-period').value});
 $('#radar-count').textContent=t('Showing ','দেখানো হচ্ছে ')+Math.min(limit,list.length)+' / '+list.length+t(' headlines · newest first','টি সংবাদ · নতুন আগে');
 $('#radar-grid').innerHTML=list.slice(0,limit).map(a=>renderHeadline(a,snapshot.sources.find(s=>s.id===a.source_id),lang)).join('')||`<p class="empty">${t('No dated headlines match these filters in the last 30 days. Try another topic, period or publisher.','গত ৩০ দিনের মধ্যে এই ফিল্টারে মিলে যায় এমন খবর নেই। বিষয়, সময় বা প্রকাশক বদলে দেখুন।')}</p>`;
 $('#radar-more').hidden=list.length<=limit;$('#radar-grid').setAttribute('aria-busy','false');
 }
 form.onsubmit=e=>e.preventDefault();
 form.oninput=()=>{limit=12;render()};
 $('#radar-more').onclick=()=>{limit+=12;render()};
 document.addEventListener('language',()=>{options();render()});
 options();
 (async()=>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{
 const response=await fetch('/blog/industry-news.json',{cache:'no-cache',credentials:'omit',signal:controller.signal});
 if(!response.ok)throw new Error('Snapshot unavailable');
 snapshot=normalizeRadar(await response.json());options();render();
 }catch{
 $('#radar-status').textContent=t('The saved news feed could not be loaded. Open the publisher links below for their current coverage.','সংরক্ষিত সংবাদ লোড করা যায়নি। নিচের প্রকাশকের লিংকে সর্বশেষ খবর পড়ুন।');
 $('#radar-grid').innerHTML='';$('#radar-grid').setAttribute('aria-busy','false');$('#radar-sources').open=true;
 }finally{clearTimeout(timer)}
 })();
}
