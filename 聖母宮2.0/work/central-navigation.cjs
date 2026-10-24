const fs=require('fs'),assert=require('assert');const file='outputs/尖山坑聖母宮-完整整合版.html';let h=fs.readFileSync(file,'utf8');
h=h.replace(/<section class="section" id="blessing">[\s\S]*?<\/section>/,'');
h=h.replace(/<script>window\.addEventListener\("message",[\s\S]*?<\/script>/,'');
h=h.replace(/<a([^>]*?)href="#blessing"([^>]*)>[\s\S]*?<\/a>/g,'<a$1href="媽祖籤互動網站/index.html" target="_blank" rel="noopener"$2>另開分頁抽籤 ↗</a>');
h=h.replace('<div class="hero-wrap">','<div class="hero-wrap" id="home">');
h=h.replace('<h2>◆ 宮廟導覽</h2>','<h2>◆ 宮廟導覽</h2><a href="#home">宮廟首頁</a>');
// Keep a single entry within the service navigation.
h=h.replace(/(<a class="featured"[^>]*>[\s\S]*?<\/a>)<a href="媽祖籤互動網站\/index.html"[^>]*>另開分頁抽籤 ↗<\/a>/,'$1');
h=h.replace('</head>',`<style>
html.portal-routing .portal-main>.section[hidden],html.portal-routing #home[hidden]{display:none!important}
.side-group a[aria-current="page"]{background:#a04742;color:#ffe39a;box-shadow:inset 5px 0 #ffd465;font-weight:bold}
.portal-main{min-height:560px}.portal-main>.section{padding-top:10px}.portal-main h2:focus,.portal-main h1:focus{outline:none}
</style></head>`);
const script=`
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
})();`;
h=h.replace('</body>','<script>'+script+'</script></body>');
assert(!h.includes('<iframe'));assert(!h.includes('fortuneFrame'));assert(!h.includes('href="#blessing"'));assert(h.includes('id="home"'));assert(fs.existsSync('outputs/媽祖籤互動網站/index.html'));
fs.writeFileSync(file,h);fs.writeFileSync('work/central-router.js',script);console.log('Removed embedded fortune app; central section navigation installed; new-tab fortune retained.');
