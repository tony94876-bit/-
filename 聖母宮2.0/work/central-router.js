
(() => {
 const main=document.querySelector('.portal-main');
 const pages=[document.getElementById('home'),...main.querySelectorAll(':scope > section.section')];
 const ids=new Set(pages.map(page=>page.id));
 document.documentElement.classList.add('portal-routing');
 function showPage(focus=false){
   let id=location.hash.slice(1)||'home';
   if(!ids.has(id)){id='home';history.replaceState(null,'','#home');}
   pages.forEach(page=>{page.hidden=page.id!==id;});
   document.querySelectorAll('a[href^="#"]').forEach(link=>{if(link.getAttribute('href')==='#'+id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
   const page=pages.find(page=>page.id===id);
   const title=page.querySelector('h1,h2');
   document.title=(id==='home'?'尖山坑聖母宮':title.textContent+'｜尖山坑聖母宮');
   if(focus){title.setAttribute('tabindex','-1');title.focus({preventScroll:true});main.scrollIntoView({block:'start',behavior:'auto'});}
 }
 document.addEventListener('click',event=>{
   const link=event.target.closest('a[href^="#"]');
   if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
   const hash=link.getAttribute('href');if(!ids.has(hash.slice(1)))return;
   event.preventDefault();
   if(location.hash!==hash)history.pushState(null,'',hash);
   showPage(true);
 });
 window.addEventListener('hashchange',()=>showPage(true));
 window.addEventListener('popstate',()=>showPage(true));
 showPage();
})();