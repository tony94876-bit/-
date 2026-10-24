(function(){
const card=document.getElementById('weatherCard'),temp=document.getElementById('weatherTemp'),desc=document.getElementById('weatherDescription'),status=document.getElementById('weatherStatus'),retry=document.getElementById('weatherRetry');
const names={0:'晴天',1:'晴天',2:'多雲',3:'陰天',45:'霧',48:'霧',51:'小雨',53:'小雨',55:'小雨',56:'凍雨',57:'凍雨',61:'小雨',63:'雨',65:'強降雨',66:'凍雨',67:'凍雨',71:'雪',73:'雪',75:'雪',77:'雪粒',80:'陣雨',81:'陣雨',82:'陣雨',85:'陣雪',86:'陣雪',95:'雷雨',96:'雷雨伴冰雹',99:'雷雨伴冰雹'};

function rainLevel(hourly,now){
 if(!hourly||!Array.isArray(hourly.time)||!Array.isArray(hourly.precipitation))return null;
 const end=Math.floor(now/3600)*3600;
 function total(hours){let sum=0;for(let i=0;i<hours;i++){const index=hourly.time.indexOf(end-i*3600),value=hourly.precipitation[index];if(index<0||!Number.isFinite(value)||value<0)return null;sum+=value;}return Math.round(sum*1000000)/1000000;}
 const one=total(1),three=total(3),day=total(24);if(one===null||three===null||day===null)return null;
 if(day>=500)return '超大豪雨';if(day>=350||three>=200)return '大豪雨';if(day>=200||three>=100)return '豪雨';if(day>=80||one>=40)return '大雨';return '';
}
function describeWeather(code,hourly,now){const base=names[code]||'天氣資料不足';const liquid=[51,53,55,61,63,65,80,81,82,95,96,99].includes(code);const level=rainLevel(hourly,now);return {label:liquid&&level?(code>=95?base+'・'+level:level):base,note:level?'近時段累積雨量達'+level+'門檻（模式估算，非官方警報）。':level===null&&liquid?'累積雨量資料不足，依目前天氣型態顯示。':''};}
function weatherKind(code,day){if(code>=95)return 'storm';if([71,73,75,77,85,86].includes(code))return 'snow';if(code>=51&&code<=82)return 'rain';if(code===45||code===48)return 'fog';if(code===3)return 'cloudy';if(code===2)return day?'partly':'night-cloudy';if(code===0||code===1)return day?'sunny':'night';return 'unknown';}
let busy=false,lastSuccess=0,celsius=null,unit='C';
const humidity=document.getElementById('weatherHumidity'),unitC=document.getElementById('weatherUnitC'),unitF=document.getElementById('weatherUnitF');
function renderTemperature(){temp.textContent=celsius===null?'— °'+unit:Math.round(unit==='C'?celsius:celsius*9/5+32)+'°'+unit;unitC.setAttribute('aria-pressed',String(unit==='C'));unitF.setAttribute('aria-pressed',String(unit==='F'));}
unitC.onclick=()=>{unit='C';renderTemperature();};unitF.onclick=()=>{unit='F';renderTemperature();};
renderTemperature();
async function update(){if(busy)return;busy=true;retry.disabled=true;status.textContent='正在更新天氣…';const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);try{
// Regional reference near Gukeng, not the exact temple or a temple weather station.
const response=await fetch('https://api.open-meteo.com/v1/forecast?latitude=23.65&longitude=120.56&current=temperature_2m,relative_humidity_2m,weather_code,is_day&hourly=precipitation&past_days=2&forecast_days=1&timeformat=unixtime&temperature_unit=celsius&timezone=Asia%2FTaipei',{signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status);const json=await response.json(),c=json.current;if(!c||!Number.isFinite(c.temperature_2m)||!Number.isInteger(c.weather_code)||![0,1].includes(c.is_day)||!Number.isFinite(c.time))throw Error('Invalid current weather');
celsius=c.temperature_2m;renderTemperature();humidity.textContent=Number.isFinite(c.relative_humidity_2m)&&c.relative_humidity_2m>=0&&c.relative_humidity_2m<=100?Math.round(c.relative_humidity_2m)+'%':'暫無資料';const wording=describeWeather(c.weather_code,json.hourly,c.time);document.getElementById('weatherDetail').textContent=wording.note;desc.textContent=wording.label;card.dataset.weather=weatherKind(c.weather_code,c.is_day===1);card.dataset.day=String(c.is_day);lastSuccess=Date.now();status.textContent='資料時間 '+new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(c.time*1000))+'（臺灣）';card.classList.remove('weather-stale');
}catch(error){card.classList.add('weather-stale');if(lastSuccess){status.textContent='更新失敗，顯示上次資料；請稍後重試。';}else{celsius=null;renderTemperature();humidity.textContent='—';document.getElementById('weatherDetail').textContent='';desc.textContent='暫時無法取得天氣';status.textContent='請確認網路連線後重試。';card.dataset.weather='unknown';}}finally{clearTimeout(timeout);busy=false;retry.disabled=false;}}
retry.addEventListener('click',update);setInterval(()=>{if(!document.hidden)update();},300000);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastSuccess>=300000)update();});update();
})();
