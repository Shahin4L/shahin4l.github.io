import {shell,t,lang,esc} from './core.js?v=flow-4';
import {scenarios,calculate,validateRows,matchesAnswer,datasetTSV,varyRows,calculationLines} from './practice-model.js?v=1';
shell();
const $=s=>document.querySelector(s),E=esc;
let index=0,taskIndex=0,rows,shown=false,feedback='',answer='';
let progress={};try{progress=JSON.parse(localStorage.getItem('formula-practice-progress-v1')||'{}');if(!progress||Array.isArray(progress)||typeof progress!=='object')progress={}}catch{progress={}}
const S=()=>scenarios[index],T=()=>S().tasks[taskIndex],label=(o,k)=>lang==='bn'?o[k+'_bn']:o[k];
function save(){try{localStorage.setItem('formula-practice-progress-v1',JSON.stringify(progress))}catch{}}
function resetFeedback(){shown=false;feedback='';answer=''}
function invalidate(){for(const task of S().tasks)delete progress[task.id];save();resetFeedback()}
function format(n,unit){return (unit==='percent'?n*100:n).toLocaleString(lang==='bn'?'bn-BD':'en-GB',{maximumFractionDigits:2})+(unit==='percent'?'%':'')}
function loadScenario(n){index=n;taskIndex=0;rows=structuredClone(S().rows);resetFeedback();render()}
function options(type,value){
 const values=type==='hub'?['Dhaka','CTG']:['Delivered','Pending','Returned'];
 return values.map(v=>'<option '+(v===value?'selected':'')+'>'+v+'</option>').join('');
}
function render(){
 const s=S(),task=T();
 document.title=t('Practice Studio | Formula Lab','প্র্যাকটিস স্টুডিও | ফর্মুলা ল্যাব');
 $('#practice-workspace').innerHTML=`<div class="studio-top"><label for="scenario-select">${t('1 · Choose a workplace challenge','১ · কাজের ধরন বাছুন')}<select id="scenario-select">${scenarios.map((x,i)=>`<option value="${i}" ${i===index?'selected':''}>${i+1}. ${E(label(x,'title'))}</option>`).join('')}</select></label><div class="studio-progress"><strong>${Object.keys(progress).filter(id=>scenarios.some(s=>s.tasks.some(x=>x.id===id))).length} / 16</strong><span>${t(' challenges solved on this browser','টি চ্যালেঞ্জ এই ব্রাউজারে সমাধান')}</span></div></div>
 <div class="studio-layout"><section class="studio-data" aria-labelledby="dataset-title"><p class="eyebrow">${t('2 · EXPLORE & CHANGE THE DATA','২ · ডেটা দেখুন ও বদলান')}</p><h2 id="dataset-title">${E(label(s,'title'))}</h2><p>${t('Edit cells to test a different situation. Six sample records, no real employee or customer data.','ঘরের মান বদলে ভিন্ন পরিস্থিতি পরীক্ষা করুন। ছয়টি কাল্পনিক রেকর্ড; বাস্তব কর্মী বা গ্রাহকের তথ্য নয়।')}</p>
 <div class="actions"><button id="new-dataset" type="button" class="secondary">${t('New numbers','নতুন সংখ্যা')}</button><button id="reset-dataset" type="button" class="secondary">${t('Reset table','টেবিল রিসেট')}</button><button id="copy-dataset" type="button" class="secondary">${t('Copy table','টেবিল কপি')}</button><button id="download-dataset" type="button" class="secondary">${t('Download TSV','TSV নামান')}</button></div>
 <div class="lab-table-wrap"><table class="lab-table studio-table"><caption>${t('Paste copied data into A1 on an empty spreadsheet.','কপি করা ডেটা একটি ফাঁকা শিটের A1-এ পেস্ট করুন।')}</caption><thead><tr><th scope="col">#</th>${s.headers.map((h,i)=>`<th scope="col">${String.fromCharCode(65+i)} · ${E(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r,ri)=>`<tr><th scope="row">${ri+2}</th>${r.map((v,ci)=>`<td>${['hub','status'].includes(s.types[ci])?`<select data-row="${ri}" data-col="${ci}" aria-label="${E(s.headers[ci])}, ${ri+2}">${options(s.types[ci],v)}</select>`:`<input data-row="${ri}" data-col="${ci}" aria-label="${E(s.headers[ci])}, ${ri+2}" type="${s.types[ci]==='number'?'number':'text'}" ${s.types[ci]==='number'?'min="0" max="1000000" step="any"':'maxlength="50"'} value="${E(v)}">`}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
 <p id="data-error" class="studio-feedback" role="status"></p><p class="meta">${t('Data changes clear completion for this scenario, so you can solve it again.','ডেটা বদলালে এই দৃশ্যের সমাধানের চিহ্ন মুছে যাবে, আবার অনুশীলন করতে পারবেন।')}</p></section>
 <section class="studio-challenge" aria-labelledby="challenge-title"><p class="eyebrow">${t('3 · SOLVE THE PROBLEM','৩ · সমস্যাটি সমাধান করুন')}</p><div class="studio-tabs">${s.tasks.map((x,i)=>`<button type="button" data-task="${i}" aria-pressed="${i===taskIndex}">${t('Challenge ','চ্যালেঞ্জ ')}${i+1}${progress[x.id]?' ✓':''}</button>`).join('')}</div><h2 id="challenge-title">${E(label(task,'title'))}</h2>
 <p>${t('Try in Excel/Sheets or calculate it yourself. Enter the result below; this checks your answer, not the formula syntax.','Excel/Sheets-এ চেষ্টা করুন অথবা নিজে হিসাব করুন। নিচে ফল লিখুন; এখানে উত্তরের ফল যাচাই হয়, ফর্মুলার বানান নয়।')}</p>
 <form id="answer-form"><label for="answer-input">${task.unit==='percent'?t('Your answer in percent (example: 5.25%)','আপনার উত্তর শতাংশে (যেমন: 5.25%)'):t('Your numeric answer (up to 2 decimal places)','আপনার সংখ্যায় উত্তর (দশমিকের পর ২ ঘর পর্যন্ত)')}</label><input id="answer-input" type="text" inputmode="decimal" maxlength="40" autocomplete="off" value="${E(answer)}" required><button type="submit">${t('Check my answer','উত্তর যাচাই')}</button></form>
 <p id="answer-feedback" class="studio-feedback" role="status" aria-live="polite">${E(feedback)}</p>
 <details class="studio-hint"><summary>${t('Need a hint?','ইঙ্গিত দরকার?')}</summary><p>${E(label(task,'hint'))}</p></details>
 <button type="button" id="show-solution" class="secondary">${t('Show worked solution','সমাধান ও ধাপ দেখুন')}</button>
 <div id="worked-solution" ${shown?'':'hidden'}></div>
 <div class="actions"><button id="next-challenge" type="button" class="secondary">${t('Next challenge →','পরের চ্যালেঞ্জ →')}</button><a href="/formula-lab/#recipe-library">${t('Browse all 71 recipes','৭১টি ফর্মুলা দেখুন')}</a></div>
 </section></div><p id="studio-notice" role="status" aria-live="polite"></p><textarea id="studio-copy" aria-label="${t('Text to copy','কপি করার লেখা')}" readonly hidden></textarea>`;
 bind();if(shown)solution();
}
function dataOK(){const valid=validateRows(S(),rows);$('#data-error').textContent=valid?'':t('Use nonempty text and numbers from 0 to 1,000,000. Defects cannot exceed Inspected. In duplicate exercises, IDs use uppercase A–Z, 0–9, _ or -.','লেখার ঘর ফাঁকা রাখবেন না; সংখ্যা ০–১০,০০,০০০ দিন। Defects কখনো Inspected-এর বেশি হবে না। ডুপ্লিকেটের ID-তে বড় হাতের A–Z, 0–9, _ বা - ব্যবহার করুন।');return valid}
function solution(){
 if(!dataOK())return;
 shown=true;const task=T(),result=calculate(task.id,rows);
 $('#worked-solution').hidden=false;
 $('#worked-solution').innerHTML=`<p class="eyebrow">${t('WITH YOUR CURRENT DATA','আপনার বর্তমান ডেটা অনুযায়ী')}</p><strong class="studio-result">${E(format(result,task.unit))}</strong><p>${E(label(task,'steps'))}</p><ul class="calculation-lines">${calculationLines(task.id,rows).map(line=>`<li>${E(line).replace(/^Row /,t("Row ","সারি ")).replace(/^Rows: /,t("Rows: ","সারি: "))}</li>`).join("")}</ul><pre><code>${E(task.formula)}</code></pre><button type="button" id="copy-solution" class="secondary">${t('Copy formula','ফর্মুলা কপি')}</button><p class="meta">${t('Excel/Sheets: paste the table at A1, then this formula at F2. Use semicolons instead of commas if required by your locale. A zero denominator returns 0 in the two rate exercises.','Excel/Sheets: A1-এ টেবিল, F2-এ এই ফর্মুলা বসান। লোকেল অনুযায়ী কমার বদলে সেমিকোলন লাগতে পারে। হার বের করার দুটি অনুশীলনে ভাগের নিচে শূন্য হলে ফল ০ আসবে।')}</p>`;
 $('#copy-solution').onclick=()=>copy(task.formula);
}
async function copy(value){try{await navigator.clipboard.writeText(value);$('#studio-notice').textContent=t('Copied.','কপি হয়েছে।')}catch{const e=$('#studio-copy');e.hidden=false;e.value=value;e.focus();e.select();$('#studio-notice').textContent=t('Copy the selected text manually.','নির্বাচিত লেখা নিজে কপি করুন।')}}
function next(){resetFeedback();if(taskIndex===0){taskIndex=1;render()}else loadScenario((index+1)%scenarios.length);$('#challenge-title').setAttribute('tabindex','-1');$('#challenge-title').focus()}
function bind(){
 $('#scenario-select').onchange=e=>loadScenario(Number(e.target.value));
 document.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>{answer=$('#answer-input').value;taskIndex=Number(b.dataset.task);resetFeedback();render()});
 document.querySelectorAll('[data-row]').forEach(el=>el.addEventListener('input',()=>{
 rows[Number(el.dataset.row)][Number(el.dataset.col)]=el.type==='number'?(el.value.trim()===''?NaN:Number(el.value)):el.value;
 invalidate();$('#worked-solution').hidden=true;$('#answer-feedback').textContent='';$('#answer-input').value='';
 document.querySelectorAll('[data-task]').forEach((b,i)=>b.textContent=t('Challenge ','চ্যালেঞ্জ ')+(i+1));
 $('.studio-progress strong').textContent=Object.keys(progress).filter(id=>scenarios.some(s=>s.tasks.some(x=>x.id===id))).length+' / 16';dataOK();
 }));
 $('#new-dataset').onclick=()=>{rows=varyRows(S());invalidate();render()};
 $('#reset-dataset').onclick=()=>{rows=structuredClone(S().rows);invalidate();render()};
 $('#copy-dataset').onclick=()=>{if(dataOK())copy(datasetTSV(S(),rows))};
 $('#download-dataset').onclick=()=>{if(!dataOK())return;const url=URL.createObjectURL(new Blob([datasetTSV(S(),rows)],{type:'text/tab-separated-values;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=S().id+'-practice.tsv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 $('#show-solution').onclick=solution;$('#next-challenge').onclick=next;
 $('#answer-form').onsubmit=e=>{e.preventDefault();if(!dataOK())return;answer=$('#answer-input').value;const expected=calculate(T().id,rows);const ok=matchesAnswer(answer,expected,T().unit);
 feedback=ok?t('Correct. You solved this challenge. Change the data or try the next one.','সঠিক! এই চ্যালেঞ্জ সমাধান করেছেন। ডেটা বদলান অথবা পরেরটি চেষ্টা করুন।'):t('Not quite. Check the relevant rows, units and conditions. Use the hint, then try again.','এখনও মেলেনি। প্রাসঙ্গিক সারি, একক ও শর্ত মিলিয়ে দেখুন। ইঙ্গিত দেখে আবার চেষ্টা করুন।');
 if(ok&&!shown){progress[T().id]=true;save()}
 if(ok&&shown)feedback=t('Correct. You have already viewed the solution; try new numbers to solve it independently and earn completion.','সঠিক। সমাধান দেখেছেন বলে নতুন সংখ্যা নিয়ে নিজে সমাধান করলে চ্যালেঞ্জ সম্পন্ন হবে।');
 $('#answer-feedback').textContent=feedback;$('.studio-progress strong').textContent=Object.keys(progress).filter(id=>scenarios.some(s=>s.tasks.some(x=>x.id===id))).length+' / 16';
 };
}
document.addEventListener('language',()=>{answer=$('#answer-input')?.value||'';feedback='';render()});
loadScenario(0);
