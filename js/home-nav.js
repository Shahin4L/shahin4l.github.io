// Anchor navigation stays attached to its section while async content settles.
const menu=document.querySelector('#navLinks'),header=document.querySelector('.site-header');
const links=[...menu.querySelectorAll('a[href^="#"]')];
let pinned=null,expires=0,frame=0;
const offset=()=>header.getBoundingClientRect().height+20;
function select(hash){links.forEach(a=>{const on=a.hash===hash;a.classList.toggle('is-current',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});menu.querySelector('.nav-more')?.classList.toggle('has-current',!!menu.querySelector('.nav-more a.is-current'))}
function position(){if(!pinned||Date.now()>expires){pinned=null;return}const y=Math.max(0,scrollY+pinned.getBoundingClientRect().top-offset());if(Math.abs(scrollY-y)>1)window.scrollTo({top:y,behavior:'instant'})}
function target(hash){try{return document.getElementById(decodeURIComponent(hash.slice(1)))}catch{return null}}
function go(hash,push=false){const section=target(hash);if(!section)return;pinned=section;expires=Date.now()+20000;if(push&&location.hash!==hash)history.pushState(null,'',hash);menu.classList.remove('open');document.querySelector('#menuToggle').setAttribute('aria-expanded','false');menu.querySelectorAll('details[open]').forEach(d=>d.open=false);section.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));select(hash);position();section.setAttribute('tabindex','-1');section.focus({preventScroll:true})}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.hash==='#'||!target(a.hash))return;e.preventDefault();go(a.hash,true)});
function cancel(){pinned=null}
for(const event of ['wheel','touchstart','pointerdown'])window.addEventListener(event,cancel,{passive:true});
window.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Tab'].includes(e.key))cancel()});
function track(){frame=0;if(pinned&&Date.now()<expires)return;const sections=links.map(a=>target(a.hash)).filter(Boolean);const current=sections.filter(e=>e.getBoundingClientRect().top<=offset()+65).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top).at(-1);select(current?'#'+current.id:'')}
window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(track)},{passive:true});
window.addEventListener('hashchange',()=>go(location.hash));window.addEventListener('popstate',()=>go(location.hash||'#home'));
if('ResizeObserver' in window){new ResizeObserver(()=>{document.documentElement.style.setProperty('--header-offset',offset()+'px');position()}).observe(document.body)}
document.fonts?.ready.then(position);window.addEventListener('load',position);document.addEventListener('portfolio-content-ready',position);document.addEventListener('portfolio-language-change',()=>requestAnimationFrame(position));
menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.classList.remove('open');menu.querySelectorAll('details').forEach(d=>d.open=false);document.querySelector('#menuToggle').setAttribute('aria-expanded','false');document.querySelector('#menuToggle').focus()}});
if(location.hash)go(location.hash);else select('');
