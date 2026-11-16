import {readSession,adminState} from './editor-session.js';
function update(){
 const signed=adminState(),continuing=!!readSession();const en=signed?'Dashboard':continuing?'Continue to admin':'Admin Login',bn=signed?'ড্যাশবোর্ড':continuing?'অ্যাডমিনে ফিরুন':'অ্যাডমিন লগইন';
 document.querySelectorAll('a.nav-admin,footer a[href="/admin/"],a[data-admin-entry]').forEach(a=>{a.dataset.en=en;a.dataset.bn=bn;a.textContent=document.documentElement.lang==='bn'?bn:en;a.classList.toggle('is-signed-in',signed);a.setAttribute('aria-label',document.documentElement.lang==='bn'?bn:en)});
}
if(typeof document!=='undefined'){document.addEventListener('editor-session-change',update);document.addEventListener('language',update);document.addEventListener('portfolio-language-change',update);window.addEventListener('pageshow',update);update();
}
