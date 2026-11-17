import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {buildShare} from '../js/article-sharing.js';
import {submitEngagement,readReactionStats} from '../js/engagement.js';
const url='https://shahin4l.github.io/blog/reverse-logistics-traceability/';
test('share copy and WhatsApp contain title, short body, author and deep article URL',()=>{
 const s=buildShare({title:'Reverse logistics',excerpt:'Keep custody connected.',url});
 assert(s.body.includes('Reverse logistics'));assert(s.body.includes('Keep custody connected.'));assert(s.body.includes('Md Shahin Alam'));assert(s.body.includes('Read the full article: '+url));
 assert.equal(new URL(s.links.WhatsApp).searchParams.get('text'),s.body);
 assert.equal(new URL(s.links.Facebook).searchParams.get('u'),url);assert.equal(new URL(s.links.LinkedIn).searchParams.get('url'),url);
 assert.equal(s.native.url,url);assert(s.native.text.includes('Keep custody connected.'));
});
test('Bangla sharing and unsafe URL validation',()=>{
 const s=buildShare({title:'রিভার্স লজিস্টিকস',excerpt:'হস্তান্তরের তথ্য রাখুন।',url,bn:true});assert(s.body.includes('বিস্তারিত পড়ুন:'));assert(s.body.includes('হস্তান্তরের তথ্য'));
 assert.throws(()=>buildShare({title:'unsafe',url:'javascript:alert(1)'}),/HTTPS/);
});
test('guest POST uses CORS safelisted content type, no API key/auth/cache directives or timeout-only browser API',async()=>{
 let sent;const data={kind:'like',post_id:'fixture',visitor:'fixture'};
 const result=await submitEngagement(data,{fetchImpl:async(u,o)=>{sent=o;return new Response(JSON.stringify({ok:true,stats:{likes:2,useful:1}}))}});
 assert.equal(result.stats.likes,2);assert.deepEqual(Object.keys(sent.headers),['Content-Type']);assert.match(sent.headers['Content-Type'],/^text\/plain/);assert.equal(sent.method,'POST');assert.equal(sent.mode,'cors');assert.equal(sent.credentials,'omit');assert(!('cache' in sent));assert.deepEqual(JSON.parse(sent.body),data);assert(sent.signal instanceof AbortSignal);
});
test('count read uses public read-only API without an admin session',async()=>{
 let sent;const stats=await readReactionStats('fixture',{fetchImpl:async(u,o)=>{sent={u,o};return new Response(JSON.stringify([{likes:5,useful:3}]))}});
 assert.deepEqual(stats,{likes:5,useful:3});assert(sent.u.includes('/rest/v1/article_stats?'));assert(!sent.o.headers.Authorization);
});
test('article UI uses server counts, rich share fields, copy-and-open social flow and guards refresh races',()=>{
 const source=readFileSync(new URL('../js/article.js',import.meta.url),'utf8');
 for(const marker of ['result.stats','navigator.share(shareData.native)','shareData.body','data-share-platform','countRevision','refreshReactionCounts'])assert(source.includes(marker));
 assert(!source.includes('stats.likes++'));assert(!source.includes('stats.useful++'));
});
