export function buildShare({title,excerpt,url,author='Md Shahin Alam',bn=false}){
 const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
 title=clean(title).slice(0,200);excerpt=clean(excerpt).slice(0,280);
 const u=new URL(url);if(u.protocol!=='https:')throw new Error('HTTPS sharing URL required');
 const byline=bn?'লেখক: '+author:'By '+author;
 const body=[title,excerpt,byline,(bn?'বিস্তারিত পড়ুন: ':'Read the full article: ')+u.href].filter(Boolean).join('\n\n');
 return {title,body,native:{title,text:[excerpt,byline].filter(Boolean).join('\n\n'),url:u.href},links:{
 Facebook:'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(u.href),
 LinkedIn:'https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(u.href),
 WhatsApp:'https://wa.me/?text='+encodeURIComponent(body)
 }};
}
