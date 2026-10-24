const fs=require('fs'),vm=require('vm'),assert=require('assert');
const els=new Map();class Element{constructor(){this.children=[];this.classList={add(){}};}replaceChildren(){this.children=[];this.innerHTML='';}append(b){this.children.push(b);}setAttribute(){}removeAttribute(){}focus(){}}
const get=id=>{if(!els.has(id))els.set(id,new Element());return els.get(id);};const steps=Array.from({length:5},()=>new Element());const radios=[{value:'guided'},{value:'random'}];let timers=[];
const ctx=vm.createContext({window:{print(){}},document:{getElementById:get,createElement:()=>new Element(),querySelectorAll:s=>s==='.steps li'?steps:s==='input[name=mode]'?radios:get('actions').children},setTimeout:f=>{timers.push(f);return timers.length;},clearTimeout:()=>{timers=[];},matchMedia:()=>({matches:true}),console});
vm.runInContext(fs.readFileSync('outputs/temple-website/lots.js','utf8'),ctx);vm.runInContext(fs.readFileSync('outputs/temple-website/fortune.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),click=()=>get('actions').children[0].onclick(),flush=()=>timers.splice(0).forEach(f=>f());
run("mode='guided';render()");
click();click();assert.equal(run('step'),1);assert.equal(run('busy'),true);click();assert.equal(timers.length,1);flush();assert.equal(run('selected.number'),38);click();flush();assert.equal(run('outcome'),'聖筊');click();assert.equal(run('step'),4);assert.ok(get('content').innerHTML.includes('莫道神明事渺茫'));
for(const [n,result] of [[.1,'聖筊'],[.6,'笑筊'],[.9,'陰筊']]){run(`reset();mode='random';Math.random=()=>${n};go(1)`);click();flush();click();flush();assert.equal(run('outcome'),result);click();assert.equal(run('step'),result==='聖筊'?4:result==='笑筊'?2:1);}
run('reset();go(1)');click();run('reset()');flush();assert.equal(run('step'),0);
assert.throws(()=>run('validateData({schemaVersion:1,source:"x",lots:[]})'));
assert.throws(()=>run('validateData({...originalData,lots:[originalData.lots[0],originalData.lots[0]]})'));
assert.equal(run('esc("<script>")'),'&lt;script&gt;');
run('data={...originalData,lots:[originalData.lots[0]]};mode="guided";go(1)');click();flush();assert.equal(run('selected.number'),1);
console.log('PASS: guided flow, random outcomes, repeated-click lock, reset cancellation, duplicate/empty data rejection, text escaping, missing-38 fallback.');
