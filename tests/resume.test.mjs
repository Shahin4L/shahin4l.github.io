import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
import {blank,normalize,renderCV,plainText,audit,keywords,regions,templates,monthAfter,safeLink} from '../js/resume-model.js';
import {createResumeClient,savedWorkspace} from '../js/resume-auth.js';
function candidate(){return {...blank(),name:'Test Candidate',email:'candidate@example.com',target:'Operations Manager',summary:'Led sorting operations with 12 team members.',skills:'Excel; logistics',job:'operations logistics SQL Excel',experience:[{role:'Lead',company:'Sample Ltd',location:'Dhaka',start:'2023-01',end:'Present',bullets:'Improved handover checks\nCoordinated 12 colleagues'}]}}
function memory(){const map=new Map([['editor-session','editor-token-must-stay']]);return{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),map}}
test('resume rendering uses text in logical order with no tables, photos or decorative graphics',()=>{
 const r=candidate();assert.equal(audit(r).length,0);for(const template of templates){r.template=template;const html=renderCV(r);assert(html.includes('Test Candidate'));assert(html.indexOf('Professional Summary')<html.indexOf('Work Experience'));assert(!/<table|<img|<canvas|<svg/i.test(html));assert(html.includes('Coordinated 12 colleagues'))}
});
test('untrusted resume text and URLs cannot execute HTML or JavaScript',()=>{
 const r=candidate();r.name='<img src=x onerror=alert(1)>';r.website='javascript:alert(1)';r.experience[0].bullets='<script>alert(1)</script>';const html=renderCV(r);assert(!html.includes('<img'));assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));assert(!html.includes('href="javascript:'));assert.equal(safeLink('https://user:pass@example.com'),'');
});
test('imports are allowlisted, bounded and reject unrelated backups',()=>{
 assert.throws(()=>normalize({version:1}),/backup/);const r=normalize({...candidate(),template:'unknown',region:'unknown',experience:Array(30).fill({role:'a',company:'b',bullets:'x'.repeat(8000),secret:'discard'})});assert.equal(r.template,'classic');assert.equal(r.experience.length,20);assert.equal(r.experience[0].bullets.length,6000);assert(!('secret' in r.experience[0]));
});
test('export excludes tailoring notes while keyword comparison is factual and not a scoring claim',()=>{
 const r=candidate(),txt=plainText(r),k=keywords(r);assert(!txt.includes(r.job));assert(txt.includes('Lead | Sample Ltd'));assert(k.found.includes('excel'));assert(k.review.includes('sql'));assert(!('score' in k));assert(regions.some(x=>x[0]==='us'&&x[3]==='Letter'));assert(regions.some(x=>x[0]==='eu'&&x[4].includes('not an official Europass')));
});
test('calendar month expiry clamps correctly at leap-month and month-end boundaries',()=>{
 assert.equal(monthAfter('2024-01-31T12:00:00Z',1).toISOString(),'2024-02-29T12:00:00.000Z');assert.equal(monthAfter('2026-01-31T12:00:00Z',1).toISOString(),'2026-02-28T12:00:00.000Z');
});
test('CV session remains independent of administrator session and stores no passwords',async()=>{
 const storage=memory(),client=createResumeClient({storage,fetchImpl:async url=>new Response(JSON.stringify(url.includes('/token?')?{access_token:'cv-access',refresh_token:'cv-refresh',expires_in:3600}:{id:'u',email:'candidate@example.com'}))});
 await client.login('candidate@example.com','never-store-this-password');assert.equal(storage.getItem('editor-session'),'editor-token-must-stay');assert(!storage.getItem('resume-builder-session-v1').includes('never-store-this-password'));client.clear();assert.equal(storage.getItem('editor-session'),'editor-token-must-stay');
});
test('concurrent CV requests refresh once and logout cannot be undone by late refresh',async()=>{
 const storage=memory();let n=0,resolve;const client=createResumeClient({storage,fetchImpl:async()=>{n++;return new Response(JSON.stringify({access_token:'new',refresh_token:'rotated',expires_in:3600}))}});
 client.keep({access_token:'old',refresh_token:'old-refresh',expires_in:-1});await Promise.all([client.session(),client.session()]);assert.equal(n,1);
 const late=createResumeClient({storage:memory(),fetchImpl:()=>new Promise(r=>{resolve=r})});late.keep({access_token:'old',refresh_token:'late',expires_in:-1});const pending=late.session();late.clear();resolve(new Response(JSON.stringify({access_token:'new',refresh_token:'new',expires_in:3600})));assert.equal(await pending,null);assert.equal(late.read(),null);
});
test('empty or mismatched cloud write responses never become a saved confirmation',()=>{
 assert.throws(()=>savedWorkspace([],'a'),/Nothing was saved/);assert.throws(()=>savedWorkspace([{user_id:'b'}],'a'),/Nothing was saved/);assert.equal(savedWorkspace([{user_id:'a',data:{}}],'a').user_id,'a');
});
test('builder assets are packaged and all required interaction controls exist',()=>{
 const page=readFileSync(new URL('../resume-builder/index.html',import.meta.url),'utf8');
 for(const id of ['cv-preview','cv-fields','cv-steps','cv-print','cv-backup','cv-import','cv-login-form','cv-cloud','cv-ai-consent','cv-ai-apply','cv-recovery-panel'])assert(page.includes('id="'+id+'"'),id);
 for(const m of page.matchAll(/(?:src|href)="(\/(?:js|css)\/[^"?]+)(?:\?[^"]*)?"/g))assert(existsSync(new URL('..'+m[1],import.meta.url)),m[1]);assert(page.includes('data-bn='));
});
