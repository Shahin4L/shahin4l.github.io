import test from 'node:test';import assert from 'node:assert/strict';
let handler;const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_ANON_KEY:'test-public',CV_AI_KEY:'server-only-test-key',CV_AI_MODEL:'test-model'};
globalThis.Deno={serve(fn){handler=fn},env:{get:k=>env[k]}};
await import('../supabase/functions/resume-assistant/index.ts');
const payload={text:'Led a team of 12 colleagues.',targetRole:'Operations Lead',section:'summary',language:'en',consent:true,email:'must-not-be-sent@example.com'};
const req=(body=payload,headers={})=>new Request('https://example.test',{method:'POST',headers:{origin:'https://shahin4l.github.io',authorization:'Bearer test-user','content-type':'application/json',...headers},body:JSON.stringify(body)});
function mockFetch(text='Coordinated a team of 12 colleagues.'){const calls=[];return{calls,fn:async(url,options)=>{calls.push({url,options});if(url.endsWith('/auth/v1/user'))return new Response(JSON.stringify({id:'user-id',email_confirmed_at:'2026-01-01'}));if(url.endsWith('/rpc/cv_claim_ai'))return new Response('true');return new Response(JSON.stringify({candidates:[{content:{parts:[{text}]}}]}))}}}
test('AI endpoint rejects unauthenticated and cross-origin requests and handles preflight',async()=>{
 assert.equal((await handler(req(payload,{authorization:''}))).status,401);
 assert.equal((await handler(req(payload,{origin:'https://attacker.test'}))).status,403);
 const p=await handler(new Request('https://example.test',{method:'OPTIONS'}));assert.equal(p.status,204);assert.equal(p.headers.get('Access-Control-Allow-Origin'),'https://shahin4l.github.io');
});
test('missing AI setup is explicit and does not consume quota or contact provider',async()=>{
 const old=globalThis.fetch,m=mockFetch(),key=env.CV_AI_KEY;delete env.CV_AI_KEY;globalThis.fetch=m.fn;
 try{const r=await handler(req());assert.equal(r.status,503);assert((await r.json()).error.includes('not activated'));assert.equal(m.calls.length,1)}finally{env.CV_AI_KEY=key;globalThis.fetch=old}
});
test('AI consent and bounded selected text are enforced before quota usage',async()=>{
 const old=globalThis.fetch,m=mockFetch();globalThis.fetch=m.fn;
 try{for(const data of [{...payload,consent:false},{...payload,text:'a'.repeat(6001)},{...payload,language:'invalid'}])assert.equal((await handler(req(data))).status,400);assert(m.calls.every(x=>x.url.endsWith('/auth/v1/user')))}finally{globalThis.fetch=old}
});
test('AI sends only selected text and role, requires review and never exposes the provider key',async()=>{
 const old=globalThis.fetch,m=mockFetch();globalThis.fetch=m.fn;
 try{const r=await handler(req()),value=await r.json();assert.equal(r.status,200);assert.equal(value.review_required,true);assert(value.text.includes('12'));const sent=m.calls.find(c=>c.url.startsWith('https://generativelanguage'));assert(sent);assert(!sent.options.body.includes(payload.email));assert(!JSON.stringify(value).includes(env.CV_AI_KEY))}finally{globalThis.fetch=old}
});
test('AI suggestions adding unsupported numeric achievements are withheld',async()=>{
 const old=globalThis.fetch,m=mockFetch('Led 40 colleagues and improved results by 90%.');globalThis.fetch=m.fn;
 try{assert.equal((await handler(req())).status,422)}finally{globalThis.fetch=old}
});
