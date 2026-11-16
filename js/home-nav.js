// Keep navigation visibly selected for keyboard, click and scroll navigation.
const links = [...document.querySelectorAll('#navLinks a[href^="#"]')];
function select(hash){
  links.forEach(link=>{
    const active=link.getAttribute('href')===hash;
    link.classList.toggle('is-current',active);
    if(active)link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
}
links.forEach(link=>link.addEventListener('click',()=>select(link.getAttribute('href'))));
window.addEventListener('hashchange',()=>select(location.hash));
select(location.hash);
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    const current=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(current)select('#'+current.target.id);
  },{rootMargin:'-12% 0px -55% 0px',threshold:[0,.15,.4]});
  links.forEach(link=>{const section=document.querySelector(link.getAttribute('href'));if(section)observer.observe(section)});
}
