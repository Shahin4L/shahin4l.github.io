import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {normalizeRadar,radarHealth,filterNews,dayInDhaka,httpsURL} from '../js/radar-model.js';
const now=Date.parse('2026-11-17T04:00:00Z'),date='2026-11-17T03:00:00Z';
const base={version:1,checked_at:date,last_success_at:date,status:'complete',sources:[{id:'s',name:'Source',url:'https://example.com',status:'success'}],articles:[{title:'Procurement report',url:'https://example.com/a',source_id:'s',source:'Source',topic:'procurement',published_at:date,first_seen_at:date}]};
test('valid dated snapshot is sorted, deduplicated and restricted to safe HTTPS links',()=>{
 const data=normalizeRadar({...base,articles:[...base.articles,...base.articles,{...base.articles[0],url:'javascript:alert(1)'},{...base.articles[0],url:'https://example.com/old',published_at:'2020-01-01T00:00:00Z'}]},now);
 assert.equal(data.articles.length,1);assert.equal(httpsURL('javascript:alert(1)'),'');assert.throws(()=>normalizeRadar({},now));
});
test('status distinguishes partial, failed and stale rather than labelling old news current',()=>{
 assert.equal(radarHealth(base,now).stale,false);
 assert.equal(radarHealth({...base,last_success_at:'2026-11-01T00:00:00Z'},now).stale,true);
 assert.equal(radarHealth({...base,status:'partial'},now).partial,true);
 assert.equal(radarHealth({...base,status:'failed'},now).failed,true);
 assert.equal(radarHealth({...base,last_success_at:null},now).stale,true);
});
test('search, topics, publishers and Bangladesh today work independently',()=>{
 assert.equal(filterNews(base.articles,{query:'PROCURE',topic:'procurement',source:'s',period:'today'},now).length,1);
 assert.equal(filterNews(base.articles,{topic:'engineering'},now).length,0);
 assert.equal(filterNews(base.articles,{source:'unknown'},now).length,0);
 assert.equal(dayInDhaka('2026-11-16T20:00:00Z'),dayInDhaka('2026-11-17T04:00:00Z'));
});
test('news rendering escapes feed text and preserves publisher dates separately from collection dates',()=>{
 const app=readFileSync(new URL('../js/industry-radar.js',import.meta.url),'utf8');
 for(const marker of ['esc(a.title)','a.published_at','a.first_seen_at','snapshot.checked_at','snapshot.last_success_at','radarHealth','httpsURL(a.url)'])assert(app.includes(marker),marker);
 assert(!app.includes('innerHTML=a.title'));
 const page=readFileSync(new URL('../blog/index.html',import.meta.url),'utf8');
 for(const id of ['radar-grid','radar-status','radar-filters','radar-search','radar-topic','radar-source','radar-period','radar-more','radar-source-health','radar-sources','news-desks'])assert(page.includes('id="'+id+'"'),id);
});
