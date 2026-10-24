const fs=require('fs'),vm=require('vm'),assert=require('assert');const file='outputs/尖山坑聖母宮-完整整合版.html';let h=fs.readFileSync(file,'utf8');
fs.mkdirSync('outputs/media',{recursive:true});fs.copyFileSync('C:/Users/李/Downloads/聖母宮.mp4','outputs/media/聖母宮.mp4');
const start=h.indexOf('<div class="photo-carousel" id="home-carousel"'),end=h.indexOf('<div class="portal-layout">',start);let banner=h.slice(start,end);assert(banner.includes('carousel-stage'));
banner=banner.replace('<div class="carousel-stage">','<div class="carousel-stage"><figure class="carousel-slide video-slide"><video id="templeVideo" controls muted loop playsinline preload="metadata" aria-label="聖母宮形象動畫"><source src="media/聖母宮.mp4" type="video/mp4">您的瀏覽器無法播放此影片，請<a href="media/聖母宮.mp4">下載影片</a>觀看。</video></figure>');
banner=banner.replace(/<figure class="carousel-slide" >/,'<figure class="carousel-slide" hidden>');
banner=banner.replace(/<div class="carousel-dots">[\s\S]*?<\/div>/,'<div class="carousel-dots"><button aria-label="顯示第 1 張：聖母宮動畫" aria-pressed="true"></button><button aria-label="顯示第 2 張：廟徽" aria-pressed="false"></button><button aria-label="顯示第 3 張：神像" aria-pressed="false"></button></div>').replace('>1 / 2<','>1 / 3<');h=h.slice(0,start)+banner+h.slice(end);
h=h.replace("slides.forEach((s,i)=>s.hidden=i!==index);","slides.forEach((s,i)=>{s.hidden=i!==index;const v=s.querySelector('video');if(v){if(i!==index)v.pause();else if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&v.muted)v.play().catch(()=>{});}});");
const old=fs.readFileSync('work/weather-widget.js','utf8');let js=old;
js=js.replace(/const names=\{[^\n]+/ ,"const names={0:'晴天',1:'晴天',2:'多雲',3:'陰天',45:'霧',48:'霧',51:'小雨',53:'小雨',55:'小雨',56:'凍雨',57:'凍雨',61:'小雨',63:'雨',65:'強降雨',66:'凍雨',67:'凍雨',71:'雪',73:'雪',75:'雪',77:'雪粒',80:'陣雨',81:'陣雨',82:'陣雨',85:'陣雪',86:'陣雪',95:'雷雨',96:'雷雨伴冰雹',99:'雷雨伴冰雹'};");
const classifier=`
function rainLevel(hourly,now){
 if(!hourly||!Array.isArray(hourly.time)||!Array.isArray(hourly.precipitation))return null;
 const end=Math.floor(now/3600)*3600;
 function total(hours){let sum=0;for(let i=0;i<hours;i++){const index=hourly.time.indexOf(end-i*3600),value=hourly.precipitation[index];if(index<0||!Number.isFinite(value)||value<0)return null;sum+=value;}return sum;}
 const one=total(1),three=total(3),day=total(24);if(one===null||three===null||day===null)return null;
 if(day>=500)return '超大豪雨';if(day>=350||three>=200)return '大豪雨';if(day>=200||three>=100)return '豪雨';if(day>=80||one>=40)return '大雨';return '';
}
function describeWeather(code,hourly,now){const base=names[code]||'天氣資料不足';const liquid=[51,53,55,61,63,65,80,81,82,95,96,99].includes(code);const level=rainLevel(hourly,now);return {label:liquid&&level?(code>=95?base+'・'+level:level):base,note:level?'近時段累積雨量達'+level+'門檻（模式估算，非官方警報）。':level===null&&liquid?'累積雨量資料不足，依目前天氣型態顯示。':''};}
`;
js=js.replace('function weatherKind',classifier+'function weatherKind');
js=js.replace('&temperature_unit=celsius&timezone=Asia%2FTaipei','&hourly=precipitation&past_days=2&forecast_days=1&timeformat=unixtime&temperature_unit=celsius&timezone=Asia%2FTaipei');
js=js.replace("typeof c.time!=='string'","!Number.isFinite(c.time)");
js=js.replace("document.getElementById('weatherDetail').textContent=explanations[weatherKind(c.weather_code,c.is_day===1)];desc.textContent=names[c.weather_code]||'未分類天氣';","const wording=describeWeather(c.weather_code,json.hourly,c.time);document.getElementById('weatherDetail').textContent=wording.note;desc.textContent=wording.label;");
js=js.replace("c.time.replace('T',' ')","new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(c.time*1000))");
js=js.replace(/const explanations=\{[^\n]+\n/,'');
assert(h.includes(old));h=h.replace(old,js);fs.writeFileSync('work/weather-widget.js',js);
h=h.replace('<a class="weather-guide-link" href="#weather-guide">天氣分類與說明 ↗</a>','');
h=h.replace('尚未串接官方警報、累積雨量或能見度資料，因此不會自行判定豪雨、颱風、龍捲風、焚風或沙塵暴。','已依最近完整小時的 1、3、24 小時模式累積降水量判斷雨量級別；達門檻時會標示為模式估算，不代表官方警報。未有足夠依據時，不推斷颱風、龍捲風、焚風或沙塵暴。');
h=h.replace('「強降雨」是目前資料來源的強度描述，不等同臺灣「大雨／豪雨」特報。','卡片將毛毛雨簡化顯示為「小雨」，方便閱讀，不表示兩者在氣象學上完全相同。「強降雨」是資料來源的強度描述，不等同官方特報。');
const footer=`<footer class="temple-footer"><div><h2>尖山坑聖母宮</h2><p>聖母慈光・義愛傳承</p></div><div><h3>交通與聯絡</h3><p>雲林縣古坑鄉荷苞村尖山坑 9 號<br>電話：<a href="tel:055265042">05-526-5042</a><br>手機：<a href="tel:0932780953">0932-780-953</a></p></div><div><h3>參拜資訊</h3><p>參拜、問事及活動時間<br>請事先向宮方確認。</p><a href="https://www.facebook.com/p/尖山坑-聖母宮-100077052317568/" target="_blank" rel="noopener">Facebook 宮廟專頁 ↗</a></div><div><p>尖山坑聖母宮・信仰與文化<br>網站更新：2026/10/24</p><small>線上求籤為數位模擬。<br>引用照片之著作權歸原作者所有。</small></div></footer>`;
h=h.replace(/<footer class="footer">[\s\S]*?<\/footer>/,'');h=h.replace('<button class="pixel-btn top-btn"',footer+'<button class="pixel-btn top-btn"');
h=h.replace('</head>','<style>.wide-banner #home-carousel video{display:block;width:100%;height:clamp(360px,34vw,540px);object-fit:contain;background:#211911}.video-slide .carousel-slide{margin:0}.temple-footer{max-width:1440px;margin:15px auto 0;border-top:2px solid #b99b65;padding:35px 30px;display:grid;grid-template-columns:1.1fr 1.4fr 1fr 1fr;gap:28px;background:#fffdf8;font-size:13px;color:#776b5e}.temple-footer>div+div{border-left:1px solid #e6ddce;padding-left:24px}.temple-footer h2{font-size:25px;color:#8e2028;margin:0 0 8px}.temple-footer h3{margin:0 0 8px;font-size:17px}.temple-footer p{margin:0 0 10px}.temple-footer a{color:#8e2028}.temple-footer small{font-size:11px}@media(max-width:800px){.temple-footer{grid-template-columns:1fr 1fr}.temple-footer>div+div{padding-left:0;border:0}}@media(max-width:700px){.wide-banner #home-carousel video{height:300px}}@media(max-width:480px){.temple-footer{grid-template-columns:1fr;padding:24px}}</style></head>');
const videoJs=`const templeMovie=document.getElementById('templeVideo');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)templeMovie.play().catch(()=>{});document.addEventListener('visibilitychange',()=>{if(document.hidden)templeMovie.pause();});new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)templeMovie.pause();});},{threshold:0.1}).observe(templeMovie);`;
h=h.replace('</body>','<script>'+videoJs+'</script></body>');for(const m of h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);fs.writeFileSync(file,h);console.log('Video first slide, concise automatic weather labels, rainfall thresholds, and footer installed.');
