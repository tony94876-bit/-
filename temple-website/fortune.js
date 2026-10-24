'use strict';
const $ = id => document.getElementById(id);
const originalData = window.TEMPLE_LOTS;
let data = originalData, step = 0, mode = 'random', selected = null, outcome = '', busy = false, timer = null;
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validateData(value) {
  if (!value || value.schemaVersion !== 1 || typeof value.source !== 'string' || !value.source.trim() || !Array.isArray(value.lots) || !value.lots.length || value.lots.length > 1000) throw Error('需包含 schemaVersion: 1、source 與 1–1000 筆 lots。');
  const seen = new Set();
  for (const item of value.lots) {
    if (!item || !Number.isInteger(item.number) || item.number < 1 || seen.has(item.number)) throw Error('籤號須為不重複的正整數。');
    seen.add(item.number);
    for (const key of ['rank','title','explanation']) if (typeof item[key] !== 'string' || !item[key].trim() || item[key].length > 30000) throw Error(`第 ${item.number} 籤的 ${key} 須為非空文字，最多 30000 字。`);
    if (!Array.isArray(item.poem) || !item.poem.length || item.poem.length > 200 || item.poem.some(line => typeof line !== 'string' || !line.trim() || line.length > 3000)) throw Error(`第 ${item.number} 籤的 poem 須為非空文字陣列，每行最多 3000 字。`);
    if (typeof item.isExample !== 'boolean') throw Error(`第 ${item.number} 籤需指定 isExample: true 或 false。`);
  }
  return value;
}
function button(text, action, secondary=false) { const b=document.createElement('button');b.textContent=text;if(secondary)b.className='secondary';b.onclick=()=>{if(!busy)action();};$('actions').append(b); }
function go(next) {step=next;render();$('title').focus({preventScroll:true});}
function animate(kind, finish) {busy=true;$('art').classList.add(kind);document.querySelectorAll('#actions button').forEach(b=>b.disabled=true);$('status').textContent=kind==='shake'?'抽籤中，請稍候…':'擲筊模擬中，請稍候…';timer=setTimeout(()=>{busy=false;timer=null;$('art').className='';finish();},matchMedia('(prefers-reduced-motion: reduce)').matches?50:1100);}
function reset(){clearTimeout(timer);timer=null;busy=false;selected=null;outcome='';$('art').className='';go(0);}
function cup(){return '<div class="cup" aria-hidden="true">'+Array.from({length:9},(_,i)=>`<i class="stick" style="left:${i*10-3}px;transform:rotate(${(i-4)*5}deg);height:${95+i%3*12}px"></i>`).join('')+'</div>';}
function blocks(result){return `<div class="blocks" aria-hidden="true"><i class="block ${result==='笑筊'?'flat':''}"></i><i class="block ${result!=='陰筊'?'flat':''}"></i></div>`;}
function render(){
  $('actions').replaceChildren();$('content').replaceChildren();$('status').textContent='';$('restart').hidden=step===0;
  document.querySelectorAll('.steps li').forEach((el,i)=>{el.className=i===step?'active':i<step?'done':'';if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  $('stepLabel').textContent=`STEP 0${step+1} / 05 · ${mode==='guided'?'引導展示':'隨機模擬'}`;
  $('caption').textContent='互動流程展示・非實際宗教儀式';
  if(step===0){
    $('title').textContent='先靜心，再啟程';$('art').innerHTML='<img src="deity.svg" alt="聖母像素意象插畫，非本宮實際神像">';$('caption').textContent='聖母像素意象・非本宮實際神像';
    $('content').innerHTML='<p>讓心慢下來，默念想詢問的事。準備好後，開始求籤體驗。</p><label><input type="radio" name="mode" value="guided">引導展示 · 第 38 籤優先、固定聖筊</label><label><input type="radio" name="mode" value="random">隨機模擬 · 隨機籤號與筊象</label><small>已載入你提供的 100 首籤詩；線上擲筊不作為神明回應。</small>';
    document.querySelectorAll('input[name=mode]').forEach(el=>{el.checked=el.value===mode;el.onchange=()=>{mode=el.value;$('stepLabel').textContent=`STEP 01 / 05 · ${mode==='guided'?'引導展示':'隨機模擬'}`;};});button('開始求籤 →',()=>go(1));
  }else if(step===1){
    $('title').textContent='請抽出一支籤';$('art').innerHTML=cup();$('content').innerHTML='<p>心中所念，無須輸入。按下「抽籤」，等待籤筒搖動、籤支抽出。</p><p>目前可抽取 '+data.lots.length+' 筆資料。'+(mode==='guided'?'引導展示優先選擇第 38 籤，若無則使用第一筆。':'所有已載入的籤資料等機率抽取。')+'</p>';
    button('抽籤',()=>animate('shake',()=>{selected=mode==='guided'?(data.lots.find(x=>x.number===38)||data.lots[0]):data.lots[Math.floor(Math.random()*data.lots.length)];go(2);}));
  }else if(step===2){
    $('title').textContent='您抽到的籤號';$('art').innerHTML=`<div class="drawn">第 ${selected.number} 籤</div>`;$('content').innerHTML=`<span class="badge">${selected.isExample?'範例資料':'使用者提供的籤詩資料'}</span><p class="result-number">第 ${selected.number} 籤</p><p>${esc(selected.rank)}</p><p>接著擲筊，體驗確認籤號的步驟。</p>`;
    button('擲筊詢問 →',()=>{ $('art').innerHTML=blocks('聖筊');animate('toss',()=>{const n=Math.random();outcome=mode==='guided'?'聖筊':n<.5?'聖筊':n<.75?'笑筊':'陰筊';go(3);});});
  }else if(step===3){
    $('title').textContent=outcome+'（模擬結果）';$('art').innerHTML=blocks(outcome);
    const info=outcome==='聖筊'?'一平一凸。示範流程已完成，可閱讀本次籤詩資料。':outcome==='笑筊'?'兩面皆平。此示範提供再次擲筊，保留同一籤號。':'兩面皆凸。此示範提供重新抽籤。';
    $('content').innerHTML=`<p>本次籤號：第 ${selected.number} 籤</p><p>${info}</p><p>${mode==='guided'?'引導展示固定顯示聖筊。':'模擬機率：聖筊 50%、笑筊 25%、陰筊 25%；不代表實物機率。'}實際儀式依本宮指引。</p>`;
    if(outcome==='聖筊')button('查看籤詩 →',()=>go(4));else if(outcome==='笑筊')button('再次擲筊',()=>go(2));else button('重新抽籤',()=>{selected=null;go(1);});
  }else{
    $('title').textContent=`第 ${selected.number} 籤 · ${selected.rank}`;$('art').innerHTML=`<div class="drawn">第 ${selected.number} 籤</div>`;
    $('content').innerHTML=`<span class="badge">${selected.isExample?'範例佔位・非本宮正式典籍':'使用者提供的籤詩資料'}</span><p>${esc(selected.title)}</p><h3>完整籤詩${selected.isExample?'（佔位）':''}</h3><div class="poem">${selected.poem.map(esc).join('\n')}</div><h3>白話解釋${selected.isExample?'（佔位）':''}</h3><div style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(selected.explanation)}</div><p><small>資料來源：${esc(data.source)}<br>本次為電腦展示模擬，不代表神明旨意。</small></p>`;
    if(selected.translations){for(const [key,label] of [['en','English · 英語解析'],['ja','日本語 · 日語解析']]){const detail=document.createElement('details');const summary=document.createElement('summary');summary.textContent=label;const p=document.createElement('p');p.textContent=selected.translations[key]||'原文件未提供';p.lang=key;detail.append(summary,p);$('content').append(detail);}}
    button('重新體驗',reset);button('列印籤詩',()=>window.print(),true);
  }
}
$('restart').onclick=reset;
$('importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error('檔案需小於 2 MB。');const next=validateData(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));data=next;reset();$('importStatus').textContent=`已載入 ${data.lots.length} 筆資料。僅於本次頁面有效，重新整理將恢復預設。`;}catch(err){$('importStatus').textContent='匯入失敗，原資料保持不變：'+err.message;}finally{e.target.value='';}};
$('resetData').onclick=()=>{data=originalData;reset();$('importStatus').textContent='已恢復使用者提供的原始 100 籤。';};
try{validateData(data);render();}catch(err){$('title').textContent='資料格式有誤';$('content').textContent=err.message+' 請使用下方 JSON 匯入有效資料。';}

$('browseLot').onclick=()=>{const n=Number($('lotNumber').value);const lot=data.lots.find(x=>x.number===n);if(!lot){$('browseStatus').textContent='找不到此籤號。';return;}clearTimeout(timer);busy=false;$('art').className='';selected=lot;go(4);$('status').textContent='籤詩查閱模式：未進行抽籤或擲筊。';$('title').scrollIntoView({block:'start'});};
