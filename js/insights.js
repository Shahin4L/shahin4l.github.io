import {$, esc, lang, t} from './core.js';

// Editorial links point to original publishers; their articles are not republished.
export const readingResources = [
  {topic:'supply-chain', source:'MIT Center for Transportation & Logistics', mark:'MIT', type:['Research insight','গবেষণাভিত্তিক লেখা'], title:['AI in supply chain planning: promise and practical limits','সাপ্লাই চেইন পরিকল্পনায় AI: সম্ভাবনা ও বাস্তব সীমা'], description:['A research-led look at planning, data quality and the role of human judgment.','পরিকল্পনা, ডেটার মান ও মানুষের সিদ্ধান্তের ভূমিকা নিয়ে গবেষণাভিত্তিক আলোচনা।'], url:'https://ctl.mit.edu/news/can-ai-transform-supply-chain-planning-global-researchers-weigh-opportunities-and-limitations'},
  {topic:'logistics', source:'MIT FreightLab', mark:'MIT', type:['Research & reports','গবেষণা ও প্রতিবেদন'], title:['A better way to think about freight','পরিবহন পরিকল্পনাকে নতুনভাবে দেখা'], description:['Explore freight procurement, carrier relationships and transportation network research.','পরিবহন সংগ্রহ, ক্যারিয়ার সম্পর্ক ও পরিবহন নেটওয়ার্ক নিয়ে গবেষণা পড়ুন।'], url:'https://ctl.mit.edu/research/freightlab'},
  {topic:'operations', source:'Lean Enterprise Institute', mark:'LEI', type:['Article','প্রবন্ধ'], title:['Bring operations closer to the customer','গ্রাহকের আরও কাছে অপারেশনস'], description:['A discussion of lean thinking, manufacturing location and customer value.','লিন চিন্তা, উৎপাদনের অবস্থান ও গ্রাহকের জন্য মূল্য তৈরির আলোচনা।'], url:'https://www.lean.org/the-lean-post/articles/leanshoring-winning-with-customers-by-bringing-the-business-closer/'},
  {topic:'procurement', source:'World Bank', mark:'WB', type:['Official guide & resources','অফিশিয়াল গাইড ও রিসোর্স'], title:['Procurement, from planning to contract management','পরিকল্পনা থেকে চুক্তি ব্যবস্থাপনা: প্রকিউরমেন্ট'], description:['Find official guidance, standard documents and beginner resources in one place.','অফিশিয়াল নির্দেশিকা, স্ট্যান্ডার্ড ডকুমেন্ট ও শিক্ষানবিশদের রিসোর্স এক জায়গায়।'], url:'https://www.worldbank.org/ext/en/what-we-do/project-procurement/framework'},
  {topic:'engineering', source:'IEEE Spectrum', mark:'IEEE', type:['Engineering article','ইঞ্জিনিয়ারিং প্রবন্ধ'], title:['Engineering AI around real human needs','মানুষের বাস্তব প্রয়োজনকে ঘিরে AI ডিজাইন'], description:['An engineering and design perspective on choosing when AI belongs in a product.','কোন পণ্যে কখন AI প্রয়োজন—ইঞ্জিনিয়ারিং ও ডিজাইনের দৃষ্টিভঙ্গি।'], url:'https://spectrum.ieee.org/human-centered-ai-product-design'},
  {topic:'quality', source:'ASQ', mark:'ASQ', type:['Practical reference','ব্যবহারিক রেফারেন্স'], title:['Understand Lean Six Sigma and process improvement','লিন সিক্স সিগমা ও প্রক্রিয়ার উন্নয়ন বুঝুন'], description:['A foundation for understanding variation, DMAIC and continuous improvement.','প্রক্রিয়ার তারতম্য, DMAIC ও ধারাবাহিক উন্নয়ন বোঝার ভিত্তি।'], url:'https://asq.org/quality-resources/six-sigma'}
];

export const newsDesks = [
  {source:'Supply Chain Dive', mark:'SC', topic:['Logistics','লজিস্টিকস'], description:['Freight, delivery and distribution updates','পরিবহন, ডেলিভারি ও বিতরণের খবর'], url:'https://www.supplychaindive.com/topic/logistics/'},
  {source:'Supply Chain Dive', mark:'PR', topic:['Procurement','প্রকিউরমেন্ট'], description:['Sourcing, suppliers and global trade','সোর্সিং, সাপ্লায়ার ও বিশ্ববাণিজ্য'], url:'https://www.supplychaindive.com/topic/procurement/'},
  {source:'MIT CTL', mark:'MIT', topic:['Supply chain research','সাপ্লাই চেইন গবেষণা'], description:['Research, ideas and industry perspectives','গবেষণা, নতুন ভাবনা ও শিল্পখাতের দৃষ্টিভঙ্গি'], url:'https://ctl.mit.edu/news'},
  {source:'IEEE Spectrum', mark:'IEEE', topic:['Engineering & technology','ইঞ্জিনিয়ারিং ও প্রযুক্তি'], description:['Engineering, automation and technology news','ইঞ্জিনিয়ারিং, অটোমেশন ও প্রযুক্তির খবর'], url:'https://spectrum.ieee.org/type/news/'}
];

const topics = [['all','All topics','সব বিষয়'],['supply-chain','Supply chain','সাপ্লাই চেইন'],['logistics','Logistics','লজিস্টিকস'],['operations','Operations','অপারেশনস'],['procurement','Procurement','প্রকিউরমেন্ট'],['engineering','Engineering','ইঞ্জিনিয়ারিং'],['quality','Quality & Lean','কোয়ালিটি ও লিন']];
let selected='all';
const local = pair => pair[lang==='bn'?1:0];

export function matchingResources(topic='all',query='') {
  const q=query.trim().toLocaleLowerCase();
  return readingResources.filter(r=>(topic==='all'||r.topic===topic)&&(!q||[r.source,r.topic,...r.title,...r.description].join(' ').toLocaleLowerCase().includes(q)));
}

export function initInsights() {
  function render(){
    $('#news-desks').innerHTML=newsDesks.map(n=>`<a class="news-desk" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer"><span class="desk-mark" aria-hidden="true">${esc(n.mark)}</span><div><span class="desk-topic">${esc(local(n.topic))}</span><h3>${esc(n.source)}</h3><p>${esc(local(n.description))}</p><span class="desk-link">${t('Latest at source','মূল সাইটে সর্বশেষ খবর')} <span aria-hidden="true">↗</span></span></div></a>`).join('');
    $('#resource-topics').innerHTML=topics.map(([key,en,bn])=>`<button type="button" class="topic-chip" data-topic="${key}" aria-pressed="${key===selected}">${esc(t(en,bn))}</button>`).join('');
    const list=matchingResources(selected,$('#resource-search').value);
    $('#reading-grid').innerHTML=list.map((r,i)=>`<article class="reading-card" data-topic="${r.topic}"><div class="reading-top"><span class="source-mark" aria-hidden="true">${esc(r.mark)}</span><span class="resource-type">${esc(local(r.type))}</span></div><div class="reading-copy"><span class="eyebrow">${esc(local(topics.find(v=>v[0]===r.topic).slice(1)))}</span><h3><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(local(r.title))}</a></h3><p>${esc(local(r.description))}</p></div><div class="reading-footer"><span>${esc(r.source)}</span><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(t('Read at ','মূল সাইটে পড়ুন: ')+r.source)}">${t('Read original','মূল লেখা পড়ুন')} <span aria-hidden="true">↗</span></a></div></article>`).join('')||`<p class="empty">${t('No resources match. Try another topic or search.','মিলে যায় এমন রিসোর্স পাওয়া যায়নি। অন্য বিষয় বা শব্দ দিয়ে খুঁজুন।')}</p>`;
    $('#resource-count').textContent=list.length+' '+t(list.length===1?'resource':'resources','টি রিসোর্স');
    $('#resource-topics').querySelectorAll('button').forEach(b=>b.onclick=()=>{selected=b.dataset.topic;render()});
  }
  $('#resource-search').oninput=render;
  document.addEventListener('language',render);
  render();
}
