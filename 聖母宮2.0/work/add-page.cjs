const fs=require('fs'),path=require('path'),assert=require('assert');
const source='C:/Users/李/Documents/Codex/2026-10-23/referenced-chatgpt-conversation-this-is-an-3/outputs/媽祖籤互動網站';
const destination='outputs/媽祖籤互動網站';
fs.cpSync(source,destination,{recursive:true});
const href='媽祖籤互動網站/index.html';
const link=`<a class="pixel-btn" href="${href}" target="_blank" rel="noopener">媽祖籤互動網站 ↗ 新分頁</a>`;
for(const filename of ['尖山坑聖母宮-完整整合版.html','尖山坑聖母宮-直接開啟.html']){
 const file=path.join('outputs',filename);let html=fs.readFileSync(file,'utf8');
 if(!html.includes(`href="${href}"`)){
 html=html.replace('<a href="#blessing">抽籤祈福</a>',`<a href="#blessing">抽籤祈福</a><a href="${href}" target="_blank" rel="noopener">媽祖籤互動網站 ↗</a>`);
 html=html.replace('<div class="hero-buttons">','<div class="hero-buttons">'+link);
 html=html.replace('<h2 class="section-title">互動求籤與完整籤詩</h2>','<h2 class="section-title">互動求籤與完整籤詩</h2><div class="pixel-box" style="padding:22px;margin:16px 0 28px"><h3>媽祖籤互動網站</h3><p>開啟你指定的獨立求籤頁，使用完整 100 籤與中英日解析。</p>'+link+'</div>');
 fs.writeFileSync(file,html);
 }
 assert(html.includes(`href="${href}" target="_blank" rel="noopener"`));
}
const sub=path.join(destination,'index.html');let html=fs.readFileSync(sub,'utf8');
html=html.replace('<main>','<main><nav aria-label="返回主網站" style="margin-bottom:18px"><a href="../尖山坑聖母宮-完整整合版.html">← 返回尖山坑聖母宮首頁</a></nav>');fs.writeFileSync(sub,html);
const data=JSON.parse(html.match(/<script id="fortune-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);assert.equal(data.records.length,100);
const deps=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(x=>x[1]).filter(x=>!x.startsWith('#')&&!/^(https?:|data:|mailto:)/.test(x));for(const dep of deps)assert(fs.existsSync(path.resolve(destination,dep)),'Missing '+dep);
fs.writeFileSync('outputs/分頁版使用說明.txt','開啟「尖山坑聖母宮-完整整合版.html」，點「媽祖籤互動網站 ↗ 新分頁」。\n請保留主網頁與「媽祖籤互動網站」資料夾在同一個資料夾，整包解壓縮後再開啟，不要直接從 ZIP 內開啟。\n新增頁面可點「返回尖山坑聖母宮首頁」，或直接關閉該分頁回原頁。\n');
console.log('Verified: homepage new-tab links, child return link, all local dependencies, 100 records.');
