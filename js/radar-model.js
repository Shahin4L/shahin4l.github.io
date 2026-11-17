export const radarTopics=[['all','All topics','সব বিষয়'],['supply-chain','Supply chain','সাপ্লাই চেইন'],['logistics','Logistics','লজিস্টিকস'],['operations','Operations','অপারেশনস'],['procurement','Procurement','প্রকিউরমেন্ট'],['engineering','Engineering','ইঞ্জিনিয়ারিং'],['quality','Quality','কোয়ালিটি']];
export function dateValue(value){const n=Date.parse(value);return typeof value==='string'&&Number.isFinite(n)?n:null}
export function httpsURL(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}}
export function normalizeRadar(raw,now=Date.now()){
 if(raw?.version!==1||!Array.isArray(raw.articles)||!Array.isArray(raw.sources)||dateValue(raw.checked_at)===null)throw new Error('Invalid snapshot');
 const sources=raw.sources.slice(0,12).filter(s=>typeof s.id==='string'&&typeof s.name==='string'&&httpsURL(s.url)).map(s=>({...s,name:s.name.slice(0,120),url:httpsURL(s.url)}));
 const ids=new Set(sources.map(s=>s.id)),seen=new Set();
 const articles=raw.articles.slice(0,80).filter(a=>{
 const d=dateValue(a.published_at),url=httpsURL(a.url);
 if(!ids.has(a.source_id)||!url||!a.title||typeof a.title!=='string'||d===null||now-d>30*86400000||d-now>3600000||seen.has(url))return false;
 seen.add(url);return true;
 }).map(a=>({...a,title:a.title.slice(0,240),url:httpsURL(a.url),topic:radarTopics.some(t=>t[0]===a.topic)?a.topic:'supply-chain'})).sort((a,b)=>dateValue(b.published_at)-dateValue(a.published_at));
 return {...raw,articles,sources};
}
export function radarHealth(data,now=Date.now()){
 const last=dateValue(data.last_success_at);
 return {stale:last===null||now-last>36*3600000||last-now>3600000,partial:data.status==='partial',failed:data.status==='failed'};
}
export function dayInDhaka(value){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value))}
export function filterNews(articles,{query='',topic='all',source='all',period='30'}={},now=Date.now()){
 const q=query.trim().toLocaleLowerCase();
 return articles.filter(a=>(topic==='all'||a.topic===topic)&&(source==='all'||a.source_id===source)&&
 (!q||[a.title,a.source].join(' ').toLocaleLowerCase().includes(q))&&
 (period==='today'?dayInDhaka(a.published_at)===dayInDhaka(now):now-Date.parse(a.published_at)<=Number(period)*86400000));
}
