import test from 'node:test';import assert from 'node:assert/strict';
let handler;globalThis.Deno={serve(fn){handler=fn},env:{get(k){return k==='SUPABASE_SERVICE_ROLE_KEY'?'test-server-only-secret':'https://example.supabase.co'}}};await import('../supabase/functions/journal-engagement/index.ts');
const base={post_id:'11111111-1111-4111-8111-111111111111',kind:'comment',name:'Test visitor',email:'test@example.com',body:'A useful article.',elapsed:4000};
const request=(data,headers={})=>new Request('https://example.test',{method:'POST',headers:{origin:'https://shahin4l.github.io','content-type':'application/json',...headers},body:JSON.stringify(data)});
test('Edge rejects wrong origins, unsupported methods and oversized bodies',async()=>{assert.equal((await handler(request(base,{origin:'https://attacker.test'}))).status,403);assert.equal((await handler(new Request('https://example.test'))).status,405);assert.equal((await handler(request({...base,body:'a'.repeat(17000)}))).status,413)});
test('Edge rejects honeypot, quick forms, invalid emails and unsafe website schemes',async()=>{for(const change of [{company:'robot'},{elapsed:1},{email:'bad'},{website:'javascript:evil'},{body:'a'},{body:'https://a https://b https://c https://d'}])assert.equal((await handler(request({...base,...change}))).status,400)});
test('Guest request uses server-only credential and hashes the client identity',async()=>{const old=globalThis.fetch;let sent;globalThis.fetch=async(url,options)=>{sent={url,options};return new Response(JSON.stringify({ok:true,status:'pending'}),{status:200})};try{const r=await handler(request(base,{'x-forwarded-for':'203.0.113.2'}));assert.equal(r.status,200);const data=JSON.parse(sent.options.body);assert.match(data.identity_hash,/^[a-f0-9]{64}$/);assert(!data.identity_hash.includes('203.0.113.2'));assert.equal(sent.options.headers.Authorization,'Bearer test-server-only-secret');const output=await r.text();assert(!output.includes(base.email));assert(!output.includes('secret'));assert.equal(data.payload.kind,'comment')}finally{globalThis.fetch=old}});
test('Reaction identifiers must be valid v4 UUIDs',async()=>{assert.equal((await handler(request({post_id:base.post_id,kind:'like',visitor:'forged'}))).status,400)});

test('Preflight covers guest headers and successful reactions return authoritative counts',async()=>{
 const pre=await handler(new Request('https://example.test',{method:'OPTIONS',headers:{Origin:'https://shahin4l.github.io','Access-Control-Request-Headers':'apikey,content-type'}}));
 assert.equal(pre.status,204);assert.equal(pre.headers.get('Access-Control-Allow-Origin'),'https://shahin4l.github.io');
 assert(pre.headers.get('Access-Control-Allow-Headers').includes('apikey'));
 const old=globalThis.fetch;
 globalThis.fetch=async url=>new Response(JSON.stringify({ok:true,status:'saved',stats:{likes:7,useful:3}}));
 try{
  const response=await handler(request({post_id:base.post_id,kind:'like',visitor:'22222222-2222-4222-8222-222222222222'}));
  assert.equal(response.status,200);assert.deepEqual((await response.json()).stats,{likes:7,useful:3});
 }finally{globalThis.fetch=old}
});

test('plain-text JSON guest requests need no browser preflight and retain counts and origin checks',async()=>{
 const old=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({ok:true,status:'saved',stats:{likes:1,useful:1}}))};
 try{
 const input={post_id:base.post_id,kind:'useful',visitor:'22222222-2222-4222-8222-222222222222'};
 const response=await handler(request(input,{'content-type':'text/plain;charset=UTF-8'}));
 assert.equal(response.status,200);assert.deepEqual((await response.json()).stats,{likes:1,useful:1});assert.equal(calls,1);
 assert.equal(response.headers.get('Access-Control-Allow-Origin'),'https://shahin4l.github.io');
 assert.equal((await handler(request(input,{'content-type':'text/plain',origin:'https://attacker.test'}))).status,403);
 }finally{globalThis.fetch=old}
});
