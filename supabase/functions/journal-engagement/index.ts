// Public guest endpoint: guests deliberately need no account. Database service
// credential stays inside Supabase's managed Edge environment, never in GitHub.
const allowed = new Set(['https://shahin4l.github.io']);
Deno.serve(async req => {
 const origin=req.headers.get('origin')||'';
 const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':allowed.has(origin)?origin:'https://shahin4l.github.io','Vary':'Origin','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 if(origin&&!allowed.has(origin))return reply({error:'Origin not allowed'},403);
 if(Number(req.headers.get('content-length')||0)>16000)return reply({error:'Request too large'},413);
 try{
  // Stream cap prevents oversized requests without a Content-Length header.
  const reader=req.body?.getReader();let bytes=0;const chunks=[];if(!reader)return reply({error:'Empty request'},400);
  while(true){const r=await reader.read();if(r.done)break;bytes+=r.value.byteLength;if(bytes>16000){await reader.cancel();return reply({error:'Request too large'},413)}chunks.push(r.value)}
  const raw=new Uint8Array(bytes);let pos=0;for(const c of chunks){raw.set(c,pos);pos+=c.length}const p=JSON.parse(new TextDecoder().decode(raw));
  if(!/^[0-9a-f-]{36}$/i.test(p.post_id||'')||!['comment','like','useful'].includes(p.kind))return reply({error:'Invalid request'},400);
  if(p.kind==='comment'){
   if(p.company||!Number.isFinite(Number(p.elapsed))||Number(p.elapsed)<3000)return reply({error:'Please wait a few seconds and try again.'},400);
   if(typeof p.name!=='string'||p.name.trim().length<1||p.name.length>80||typeof p.body!=='string'||p.body.trim().length<3||p.body.length>3000||typeof p.email!=='string'||p.email.length>254||!/^\S+@\S+\.\S+$/.test(p.email))return reply({error:'Check your name, email and comment.'},400);
   if((p.body.match(/https?:\/\//g)||[]).length>3)return reply({error:'Too many links in comment.'},400);
   if(p.website){let u;try{u=new URL(p.website)}catch{return reply({error:'Invalid website URL'},400)}if(u.protocol!=='https:'||p.website.length>300)return reply({error:'Use an HTTPS website URL'},400)}
  }else if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(p.visitor||''))return reply({error:'Invalid browser identifier'},400);
  // Managed gateway supplies x-forwarded-for. No raw address is retained.
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
  const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret+':'+ip)))).map(v=>v.toString(16).padStart(2,'0')).join('');
  const r=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/submit_engagement',{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({payload:p,identity_hash:hash})});
  if(!r.ok){const e=await r.json();return reply({error:e.message?.includes('Too many')?'Too many requests. Try again in ten minutes.':'Unable to save. Please check the article and try later.'},400)}
  return reply(await r.json());
 }catch{return reply({error:'Invalid request or service temporarily unavailable.'},400)}
});
