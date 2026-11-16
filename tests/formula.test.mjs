import test from 'node:test';import assert from 'node:assert/strict';
import {sample,recipes} from '../js/formula-data.js';
import {filterRecipes,summarize,summaryFormula,sampleTSV} from '../js/formula-model.js';
import {renderCards} from '../js/formula-view.js';
import {submitEngagement} from '../js/engagement.js';
test('dataset totals, criteria and duplicates agree with teaching examples',()=>{
assert.deepEqual(summarize(sample),{rows:6,quantity:51,amount:5950});
assert.deepEqual(summarize(sample,'Dhaka'),{rows:3,quantity:19,amount:2050});
assert.equal(summarize(sample,'CTG','Delivered').amount,3900);
assert.equal(new Set(sample.map(r=>r[0])).size,5);
assert.equal(summaryFormula('Dhaka','Delivered'),'=SUMIFS(F2:F7,B2:B7,"Dhaka",C2:C7,"Delivered")');
assert.match(sampleTSV(sample),/=DATE\(2026,11,1\)/);
});
test('all recipes have unique IDs, both explanations, outputs and usable formulas',()=>{
assert.equal(recipes.length,71);assert.equal(new Set(recipes.map(r=>r.id)).size,71);
for(const r of recipes){assert(r.description_bn&&r.expected);assert(r.excel||r.sheets);for(const f of [r.excel,r.sheets].filter(Boolean))assert(f.startsWith('='))}
assert(filterRecipes(recipes,{query:'SUMIFS'}).length>0);
assert(filterRecipes(recipes,{platform:'excel2016'}).every(r=>r.tier==='classic'&&r.excel));
assert(filterRecipes(recipes,{platform:'sheets'}).every(r=>r.sheets));
assert.equal(filterRecipes(recipes,{query:'nonexistentzzz'}).length,0);
});
test('recipe renderer escapes data and provides Excel and Sheets variants',()=>{
const r={...recipes[0],name:'<img src=x onerror=alert(1)>'};const html=renderCards([r]);
assert(!html.includes('<img'));assert(html.includes('&lt;img'));assert(html.includes('data-platform="excel"'));assert(html.includes('data-platform="sheets"'));
assert(renderCards(recipes,'bn').includes('ফর্মুলা কপি'));
});
test('guest reaction transport retries only network failures with identical payload and no admin authorization',async()=>{
let calls=[];const payload={kind:'like',visitor:'fixture',post_id:'fixture'};
const result=await submitEngagement(payload,{fetchImpl:async(url,options)=>{calls.push(options);if(calls.length===1)throw new TypeError('Failed to fetch');return new Response(JSON.stringify({ok:true,stats:{likes:7,useful:3}}))}});
assert.equal(calls.length,2);assert.equal(calls[0].body,calls[1].body);assert.equal(calls[0].credentials,'omit');assert(!('Authorization' in calls[0].headers));assert.equal(result.stats.likes,7);
});
test('comments are never automatically retried; validation failures do not retry',async()=>{
let n=0;await assert.rejects(submitEngagement({kind:'comment'},{fetchImpl:async()=>{n++;throw new TypeError('Failed to fetch')}}),e=>e.code==='network'&&!!e.message_bn);assert.equal(n,1);
n=0;await assert.rejects(submitEngagement({kind:'useful'},{fetchImpl:async()=>{n++;return new Response(JSON.stringify({error:'Invalid input'}),{status:400})}}),/Invalid input/);assert.equal(n,1);
});

import {readFileSync,existsSync} from 'node:fs';
test('published Formula Lab has all recipes, required controls, local modules and bilingual metadata',()=>{
const html=readFileSync(new URL('../formula-lab/index.html',import.meta.url),'utf8');
for(const id of ['formula-results','formula-search','formula-category','formula-platform','formula-status','formula-more','formula-controls','manual-copy','practice-hub','practice-status','practice-rows','practice-quantity','practice-amount','practice-formula','copy-practice','copy-sample'])assert(html.includes('id="'+id+'"'),id);
for(const r of recipes)assert(html.includes('id="'+r.id+'"'));
for(const match of html.matchAll(/(?:src|href)="(\/(?:js|css|assets|formula-lab)\/[^"#?]+)(?:\?[^"]*)?"/g)){const path=match[1];if(path.endsWith('/'))continue;assert(existsSync(new URL('..'+path,import.meta.url)),path)}
assert(html.includes('data-bn='));
assert(html.includes('https://shahin4l.github.io/formula-lab/'));
});
