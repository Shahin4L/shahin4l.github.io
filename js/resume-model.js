export const templates=['classic','executive','editorial','compact'];
export const regions=[
['bd','Bangladesh / South Asia','বাংলাদেশ / দক্ষিণ এশিয়া','A4','Use a clear professional CV; omit unnecessary sensitive personal details.','স্পষ্ট পেশাদার CV লিখুন; অপ্রয়োজনীয় সংবেদনশীল তথ্য বাদ দিন।'],
['us','USA / Canada','যুক্তরাষ্ট্র / কানাডা','Letter','Use a focused 1–2 page résumé where appropriate; omit photo, age and family details.','প্রয়োজন অনুযায়ী লক্ষ্যভিত্তিক ১–২ পাতার রেজুমে; ছবি, বয়স ও পারিবারিক তথ্য বাদ দিন।'],
['uk','United Kingdom','যুক্তরাজ্য','A4','Prioritize relevant experience and evidence; avoid unnecessary personal details.','প্রাসঙ্গিক অভিজ্ঞতা ও প্রমাণকে গুরুত্ব দিন; অপ্রয়োজনীয় ব্যক্তিগত তথ্য বাদ দিন।'],
['eu','Europe','ইউরোপ','A4','Country and employer conventions vary. This is not an official Europass document.','দেশ ও নিয়োগদাতার নিয়ম ভিন্ন। এটি অফিশিয়াল Europass ডকুমেন্ট নয়।'],
['gcc','UAE / GCC','সংযুক্ত আরব আমিরাত / GCC','A4','Highlight relevant achievements and location. Never include passport or identity numbers.','প্রাসঙ্গিক অর্জন ও অবস্থান দিন। পাসপোর্ট বা পরিচয়পত্রের নম্বর দেবেন না।']];
export const repeatFields={
experience:[['role','Job title','পদ'],['company','Employer','প্রতিষ্ঠান'],['location','Location','অবস্থান'],['start','Start date','শুরুর তারিখ'],['end','End date / Present','শেষের তারিখ / Present'],['bullets','Work & achievements · one bullet per line','কাজ ও অর্জন · প্রতি লাইনে একটি বুলেট']],
education:[['degree','Degree','ডিগ্রি'],['institution','Institution','প্রতিষ্ঠান'],['start','Start','শুরু'],['end','End','শেষ'],['details','Relevant details','প্রাসঙ্গিক তথ্য']],
certifications:[['name','Certificate','সনদ'],['issuer','Issuer','প্রদানকারী'],['date','Date / expiry','প্রদান / মেয়াদ'],['url','Verification URL','যাচাইয়ের লিংক']],
projects:[['name','Project','প্রকল্প'],['role','Your contribution','আপনার ভূমিকা'],['url','URL','লিংক'],['bullets','Achievements · one per line','অর্জন · প্রতি লাইনে একটি']]}
export function blank(){return {version:1,module:'resume-builder',region:'bd',template:'classic',language:'en',target:'',job:'',name:'',headline:'',email:'',phone:'',location:'',linkedin:'',website:'',summary:'',skills:'',languages:'',achievements:'',experience:[],education:[],certifications:[],projects:[]}}
export function normalize(raw){
 if(!raw||raw.module!=='resume-builder'||raw.version!==1)throw Error('Choose a Resume Builder JSON backup.');
 const r=blank(),clean=(v,max=6000)=>typeof v==='string'?v.replace(/\u0000/g,'').slice(0,max):'';
 for(const k of ['target','job','name','headline','email','phone','location','linkedin','website','summary','skills','languages','achievements'])r[k]=clean(raw[k],k==='job'?10000:['summary','skills','achievements'].includes(k)?6000:400);
 for(const [k,fields]of Object.entries(repeatFields))r[k]=(Array.isArray(raw[k])?raw[k]:[]).slice(0,20).map(x=>Object.fromEntries(fields.map(([f])=>[f,clean(x?.[f],f==='bullets'||f==='details'?6000:600)])));
 r.region=regions.some(x=>x[0]===raw.region)?raw.region:'bd';r.template=templates.includes(raw.template)?raw.template:'classic';r.language=raw.language==='bn'?'bn':'en';return r;
}
export const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeLink(s){try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}}
export const lines=s=>String(s||'').split('\n').map(x=>x.replace(/^\s*[-•]\s*/,'').trim()).filter(Boolean);
export function audit(r){const a=[];if(!r.name.trim())a.push(['Add your full name.','পূর্ণ নাম লিখুন।']);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))a.push(['Add a valid contact email.','সঠিক যোগাযোগের ইমেইল দিন।']);if(!r.summary.trim())a.push(['Add a factual professional summary.','সত্য তথ্যভিত্তিক পেশাগত পরিচিতি দিন।']);if(!r.target.trim())a.push(['Set a target job title.','লক্ষ্য পদ লিখুন।']);if(!r.skills.trim())a.push(['Add skills you can demonstrate.','প্রমাণ দিতে পারবেন এমন দক্ষতা দিন।']);for(const x of r.experience){if(!x.role||!x.company||!lines(x.bullets).length)a.push(['Complete the role, employer and achievements for every experience.','প্রতিটি অভিজ্ঞতায় পদ, প্রতিষ্ঠান ও অর্জন পূরণ করুন।']);if(/^\d{4}-\d{2}$/.test(x.end)&&x.start>x.end)a.push(['Review an end date that precedes its start.','শুরুর আগে থাকা শেষের তারিখ মিলিয়ে নিন।'])}return a}
export function keywords(r){const stop=new Set('and the for with this that your you our from will have has are were of to in on a an is be as by or'.split(' ')),words=[...new Set((r.job.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g)||[]).filter(x=>!stop.has(x)))].slice(0,60),body=[r.summary,r.skills,...r.experience.map(x=>x.bullets),...r.projects.map(x=>x.bullets)].join(' ').toLowerCase();return {found:words.filter(x=>body.includes(x)),review:words.filter(x=>!body.includes(x))}}
export function monthAfter(value,months){const d=new Date(value),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d}
export function renderCV(r){
 const E=escapeHTML,T=(en,bn)=>r.language==='bn'?bn:en;
 const list=s=>'<ul>'+lines(s).map(x=>'<li>'+E(x)+'</li>').join('')+'</ul>';
 const section=(en,bn,content)=>content?'<section><h2>'+T(en,bn)+'</h2>'+content+'</section>':'';
 const link=url=>safeLink(url)?'<a href="'+E(safeLink(url))+'">'+E(url)+'</a>':'';
 const period=x=>[x.start,x.end].filter(Boolean).map(E).join(' – ');
 return '<article class="resume-document template-'+E(r.template)+'" lang="'+r.language+'"><header><h1>'+E(r.name||T('Your name','আপনার নাম'))+'</h1><p class="cv-headline">'+E(r.headline)+'</p><p class="cv-contact">'+[r.email,r.phone,r.location].filter(Boolean).map(E).concat([link(r.linkedin),link(r.website)].filter(Boolean)).join(' · ')+'</p></header>'+
 section('Professional Summary','পেশাগত পরিচিতি',r.summary?'<p>'+E(r.summary).replace(/\n/g,'<br>')+'</p>':'')+
 section('Work Experience','কর্ম অভিজ্ঞতা',r.experience.map(x=>'<div class="cv-entry"><h3>'+E(x.role)+'</h3><p class="cv-meta">'+[E(x.company),E(x.location),period(x)].filter(Boolean).join(' | ')+'</p>'+list(x.bullets)+'</div>').join(''))+
 section('Education','শিক্ষা',r.education.map(x=>'<div class="cv-entry"><h3>'+E(x.degree)+'</h3><p class="cv-meta">'+[E(x.institution),period(x)].filter(Boolean).join(' | ')+'</p><p>'+E(x.details)+'</p></div>').join(''))+
 section('Certifications','সার্টিফিকেশন',r.certifications.map(x=>'<div class="cv-entry"><h3>'+E(x.name)+'</h3><p>'+[E(x.issuer),E(x.date)].filter(Boolean).join(' | ')+'</p>'+link(x.url)+'</div>').join(''))+
 section('Skills','দক্ষতা',r.skills?'<p>'+E(r.skills).replace(/\n/g,'<br>')+'</p>':'')+
 section('Projects','প্রকল্প',r.projects.map(x=>'<div class="cv-entry"><h3>'+E(x.name)+'</h3><p>'+E(x.role)+'</p>'+link(x.url)+list(x.bullets)+'</div>').join(''))+
 section('Languages','ভাষা',r.languages?'<p>'+E(r.languages)+'</p>':'')+
 section('Additional Achievements','অন্যান্য অর্জন',r.achievements?list(r.achievements):'')+'</article>';
}
export function plainText(r){return [r.name,r.headline,[r.email,r.phone,r.location,r.linkedin,r.website].filter(Boolean).join(' | '),'PROFESSIONAL SUMMARY',r.summary,'WORK EXPERIENCE',...r.experience.flatMap(x=>[x.role+' | '+x.company,[x.start,x.end].filter(Boolean).join(' – '),...lines(x.bullets)]),'EDUCATION',...r.education.flatMap(x=>[x.degree+' | '+x.institution,[x.start,x.end].filter(Boolean).join(' – '),x.details]),'CERTIFICATIONS',...r.certifications.map(x=>[x.name,x.issuer,x.date,x.url].filter(Boolean).join(' | ')),'SKILLS',r.skills,'PROJECTS',...r.projects.flatMap(x=>[x.name,x.role,x.url,...lines(x.bullets)]),'LANGUAGES',r.languages,'ADDITIONAL ACHIEVEMENTS',r.achievements].filter(Boolean).join('\n\n')}
