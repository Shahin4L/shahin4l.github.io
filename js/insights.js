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

// Images are the publisher's own article artwork, linked with the original source.
const originalImages = {
  'supply-chain': {url:'https://ctl.mit.edu/sites/default/files/styles/teaser/public/generic-images/mit-global-scale-network-logo-square.png?itok=Wb6bMl8Y',logo:true,alt:'MIT Global SCALE Network logo'},
  logistics: {url:'https://ctl.mit.edu/sites/default/files/styles/inline_image/public/generic-images/76de74eb-7c8a-4a88-bc06-40489bdd1c78.jpeg?itok=gvxqFG7E',alt:'Original image from the MIT FreightLab page'},
  operations: {url:'https://www.lean.org/wp-content/uploads/2026/02/leanshoring-1-Lean-Post.png',alt:'Aerial view of GE Appliances Appliance Park, from the Lean Enterprise Institute article'},
  procurement: {url:'https://www.worldbank.org/ext/en/what-we-do/project-procurement/media_1304c6bec936a70f886ff51d27f5f05e1d971a5cc.avif?format=avif&optimize=medium&width=750',alt:'Original artwork from the World Bank procurement page'},
  engineering: {url:'https://spectrum.ieee.org/media-library/photo-collage-of-a-woman-speaking-on-stage-with-electric-toothbrushes-and-refrigerators-layered-in-the-background.jpg?height=750&id=68653834&width=1200',alt:'Original IEEE Spectrum article collage about human-centred AI products'}
};
const iconPaths = {
 logistics:'<path d="M3 6h11v11H3zM14 10h4l3 4v3h-7M6 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4M18 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>',
 procurement:'<path d="M6 7h12l2 14H4L6 7zM9 7V5a3 3 0 0 1 6 0v2M9 13l2 2 4-4"/>',
 'supply-chain':'<path d="M9 3h6v6H9zM2 15h6v6H2zM16 15h6v6h-6zM12 9v3M5 15v-3h14v3"/>',
 engineering:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v5M15 1v5M9 18v5M15 18v5M1 9h5M1 15h5M18 9h5M18 15h5M10 10h4v4h-4z"/>',
 quality:'<path d="M12 2l8 3v6c0 5-8 11-8 11S4 16 4 11V5l8-3zM8 11l3 3 5-6"/>',
 operations:'<path d="M3 21V8l6 3V5l6 3V3h6v18H3zM7 15h2M12 15h2M17 15h2"/>'
};
function icon(topic){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[topic]||iconPaths['supply-chain']}</svg>`}
function sourceVisual(r){
 const image=originalImages[r.topic];
 return `<div class="resource-visual ${image?.logo?'is-logo':''}"><div class="resource-image-fallback" ${image?'hidden':''}>${icon(r.topic)}<span>${esc(r.mark)}</span><small>${t('Source resource','মূল রিসোর্স')}</small></div>${image?`<a class="original-image-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><img class="reading-image" src="${esc(image.url)}" alt="${esc(image.alt)}" loading="lazy" referrerpolicy="no-referrer" width="1200" height="675"></a><span class="image-provenance">${image.logo?t('Publisher logo','প্রকাশকের লোগো'):t('Original publisher image','মূল প্রকাশকের ছবি')}</span>`:''}</div>`;
}

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
    const deskTopics=['logistics','procurement','supply-chain','engineering'];
    $('#news-desks').innerHTML=newsDesks.map((n,i)=>`<a class="news-desk radar-card" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer"><div class="radar-top"><span class="radar-icon">${icon(deskTopics[i])}</span><span class="radar-label">${t('NEWS DESK','সংবাদ উৎস')} <span aria-hidden="true">↗</span></span></div><div class="radar-copy"><span class="desk-topic">${esc(local(n.topic))}</span><h3>${esc(n.source)}</h3><p>${esc(local(n.description))}</p><span class="desk-link">${t('Latest at source','মূল সাইটে সর্বশেষ খবর')} <span aria-hidden="true">↗</span></span></div></a>`).join('');
    $('#resource-topics').innerHTML=topics.map(([key,en,bn])=>`<button type="button" class="topic-chip" data-topic="${key}" aria-pressed="${key===selected}">${esc(t(en,bn))}</button>`).join('');
    const list=matchingResources(selected,$('#resource-search').value);
    $('#reading-grid').innerHTML=list.map((r,i)=>`<article class="reading-card" data-topic="${r.topic}">${sourceVisual(r)}<div class="reading-top"><span class="source-mark" aria-hidden="true">${esc(r.mark)}</span><span class="resource-type">${esc(local(r.type))}</span></div><div class="reading-copy"><span class="eyebrow">${esc(local(topics.find(v=>v[0]===r.topic).slice(1)))}</span><h3><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(local(r.title))}</a></h3><p>${esc(local(r.description))}</p></div><div class="reading-footer"><span>${esc(r.source)}</span><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(t('Read at ','মূল সাইটে পড়ুন: ')+r.source)}">${t('Read original','মূল লেখা পড়ুন')} <span aria-hidden="true">↗</span></a></div></article>`).join('')||`<p class="empty">${t('No resources match. Try another topic or search.','মিলে যায় এমন রিসোর্স পাওয়া যায়নি। অন্য বিষয় বা শব্দ দিয়ে খুঁজুন।')}</p>`;
    $('#reading-grid').querySelectorAll('.reading-image').forEach(img=>img.addEventListener('error',()=>{const visual=img.closest('.resource-visual');visual.querySelector('.original-image-link').hidden=true;visual.querySelector('.resource-image-fallback').hidden=false;visual.querySelector('.image-provenance').hidden=true;},{once:true}));
    $('#resource-count').textContent=list.length+' '+t(list.length===1?'resource':'resources','টি রিসোর্স');
    $('#resource-topics').querySelectorAll('button').forEach(b=>b.onclick=()=>{selected=b.dataset.topic;render()});
  }
  $('#resource-search').oninput=render;
  document.addEventListener('language',render);
  render();
}
