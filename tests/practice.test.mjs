import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
import {scenarios,calculate,validateRows,matchesAnswer,parseAnswer,datasetTSV,varyRows,calculationLines} from '../js/practice-model.js';
test('16 workplace answers match independently calculated fixtures',()=>{
const expected=[18,2,3,7660,95470,982,28400,7200,30800,9900,30/700,3,4,4,3,0.6];
let i=0;for(const s of scenarios){assert(validateRows(s,s.rows));for(const task of s.tasks){assert.equal(calculate(task.id,s.rows),expected[i++],task.id);assert(calculationLines(task.id,s.rows).length);assert(task.hint_bn&&task.steps_bn&&task.formula.startsWith('='))}}
assert.equal(i,16);
});
test('edited cells change results; generated numbers remain valid; duplicate variants differ',()=>{
const s=scenarios[0],r=structuredClone(s.rows);r[0][3]=100;assert.equal(calculate('dispatch-total',r),108);
for(const s of scenarios)for(const value of [0,0.4,0.9])assert(validateRows(s,varyRows(s,()=>value)),s.id);
const d=scenarios.find(s=>s.id==='duplicates');assert.equal(calculate('unique-orders',varyRows(d,()=>0.9)),6);assert.equal(calculate('unique-orders',varyRows(d,()=>0)),4);
});
test('invalid data, blank cells, invalid IDs and impossible quality figures are rejected',()=>{
const s=scenarios[0];for(const bad of [NaN,-1,Infinity,1000001]){const r=structuredClone(s.rows);r[0][3]=bad;assert(!validateRows(s,r))}
const r=structuredClone(s.rows);r[0][0]=' ';assert(!validateRows(s,r));
const q=scenarios.find(s=>s.id==='quality'),qr=structuredClone(q.rows);qr[0][2]=1000;assert(!validateRows(q,qr));
const d=scenarios.find(s=>s.id==='duplicates'),dr=structuredClone(d.rows);dr[0][0]='SO*';assert(!validateRows(d,dr));
});
test('numeric and percentage checking handles rounding, Bangla digits and zero denominators',()=>{
assert(matchesAnswer('4.29%',30/700,'percent'));assert(matchesAnswer('৬০%',0.6,'percent'));assert(matchesAnswer('28,400',28400,'number'));assert(!matchesAnswer('0.6',0.6,'percent'));
assert(!matchesAnswer('answer=18',18,'number'));assert.equal(parseAnswer('','number'),null);assert(!matchesAnswer('18%',18,'number'));
const q=scenarios.find(s=>s.id==='quality').rows.map(r=>[r[0],0,0,r[3]]);assert.equal(calculate('quality-rate',q),0);
const sla=scenarios.find(s=>s.id==='sla').rows.map(r=>[r[0],r[1],r[2],'Pending']);assert.equal(calculate('sla-rate',sla),0);
});
test('editable text exports safely as text instead of spreadsheet commands',()=>{
const s=scenarios[0],rows=structuredClone(s.rows);rows[0][0]='=HYPERLINK("evil")';const text=datasetTSV(s,rows);assert(text.includes("'=HYPERLINK"));assert.equal(text.split('\n').length,7);
});
test('practice entry points and asset links are packaged with the existing site',()=>{
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('formula-lab/practice/index.html');assert(html.includes('id="practice-workspace"'));assert(html.includes('data-bn='));
for(const m of html.matchAll(/(?:src|href)="(\/(?:js|css)\/[^"?]+)(?:\?[^"]*)?"/g))assert(existsSync(new URL('..'+m[1],import.meta.url)),m[1]);
assert(read('formula-lab/index.html').includes('href="/formula-lab/practice/"'));
});
