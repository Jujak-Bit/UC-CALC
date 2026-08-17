const DATA={
 iphone:[
  {base:60,bonus:0,price:1100,img:"assets/ios_1.jpg"},
  {base:180,bonus:10,price:4400,img:"assets/ios_2.jpg"},
  {base:600,bonus:60,price:14000,img:"assets/ios_3.jpg"},
  {base:1500,bonus:300,price:33000,img:"assets/ios_4.jpg"},
  {base:2950,bonus:900,price:66000,img:"assets/ios_5.jpg"},
  {base:5900,bonus:2200,price:149000,img:"assets/ios_6.jpg"}
 ],
 samsung:[
  {base:60,bonus:0,price:1100,img:"assets/android_1.jpg"},
  {base:180,bonus:10,price:3300,img:"assets/android_2.jpg"},
  {base:600,bonus:60,price:11000,img:"assets/android_3.jpg"},
  {base:1500,bonus:300,price:27500,img:"assets/android_4.jpg"},
  {base:2950,bonus:900,price:55000,img:"assets/android_5.jpg"},
  {base:5900,bonus:2200,price:110000,img:"assets/android_6.jpg"}
 ],
 midas:[
  {base:60,bonus:60,price:1100,img:"assets/midas_buy_reference.jpg"},
  {base:180,bonus:180,price:3300,img:"assets/midas_buy_reference.jpg"},
  {base:600,bonus:600,price:11000,img:"assets/midas_buy_reference.jpg"},
  {base:1500,bonus:350,price:27500,img:"assets/midas_buy_reference.jpg"},
  {base:2950,bonus:1000,price:55000,img:"assets/midas_buy_reference.jpg"},
  {base:5900,bonus:2400,price:110000,img:"assets/midas_buy_reference.jpg"}
 ]
};
let platform="iphone";
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const fmt=n=>Math.round(n).toLocaleString("ko-KR");
const won=n=>"₩"+Math.round(n).toLocaleString("ko-KR");
const label=p=>p==="iphone"?"iPhone":p==="samsung"?"Samsung":"MIDAS BUY";

function packs(){
 return DATA[platform].map((p,index)=>({...p,total:p.base+p.bonus,index}));
}

/* Dynamic programming with a bounded target window. This is fast for normal UC amounts
   and always finds a package combination that reaches the requested amount. */
function solve(target){
 const ps=packs();
 const max=target+Math.max(...ps.map(p=>p.total));
 const dp=new Array(max+1).fill(Infinity);
 const prev=new Array(max+1);
 dp[0]=0;
 for(let x=0;x<=max;x++){
   if(!Number.isFinite(dp[x])) continue;
   for(const p of ps){
     const nx=x+p.total;
     if(nx<=max && dp[nx]>dp[x]+p.price){
       dp[nx]=dp[x]+p.price;
       prev[nx]={from:x,index:p.index};
     }
   }
 }
 let best=-1;
 for(let x=target;x<=max;x++){
   if(!Number.isFinite(dp[x])) continue;
   if(best===-1){best=x;continue}
   const a=dp[x], b=dp[best];
   const exact=$("#exact")?.checked;
   if(exact){
     const al=x-target, bl=best-target;
     if(al<bl || (al===bl && a<b)) best=x;
   }else if(a<b || (a===b && x<best)) best=x;
 }
 if(best<0) return null;
 const counts=new Array(ps.length).fill(0);
 let x=best;
 while(x>0 && prev[x]){
   counts[prev[x].index]++;
   x=prev[x].from;
 }
 return {best,cost:dp[best],counts,ps};
}

function renderPackages(){
 const ps=packs();
 $("#tablePlatform").textContent=label(platform);
 $("#packageGrid").innerHTML=ps.map(p=>`
  <article class="package-card">
   <div class="package-visual">
    <img class="package-img" src="${p.img}" alt="${fmt(p.total)} UC 패키지">
    ${platform==="midas"?'<span class="midas-chip">MIDAS</span>':""}
   </div>
   <div class="package-info">
    <div class="uc">${fmt(p.base)} UC</div>
    <div class="bonus">+${fmt(p.bonus)} BONUS · 총 ${fmt(p.total)} UC</div>
    <div class="package-price">${won(p.price)}</div>
   </div>
  </article>`).join("");
 renderCompare();
}

function renderCompare(){
 $("#compareRows").innerHTML=DATA.iphone.map((p,i)=>{
   const s=DATA.samsung[i], total=p.base+p.bonus, diff=p.price-s.price;
   return `<div class="compare-row"><span>${fmt(total)} UC</span><b>${won(p.price)}</b><b>${won(s.price)}</b><b class="${diff>0?"diff":"good"}">${diff>0?"-":""}${won(Math.abs(diff))}</b></div>`;
 }).join("");
}

function calculate(){
 const target=Math.floor(Number($("#target").value));
 $("#error").textContent="";
 if(!target || target<1){$("#error").textContent="1 UC 이상 입력해주세요.";return;}
 if(target>1000000){$("#error").textContent="최대 1,000,000 UC까지 입력할 수 있습니다.";return;}
 const r=solve(target);
 if(!r){$("#error").textContent="계산할 수 있는 조합을 찾지 못했습니다.";return;}
 $("#empty").classList.add("hidden");
 $("#result").classList.remove("hidden");
 $("#badge").textContent="DONE";
 $("#resultCaption").textContent=`${label(platform)} 패키지 기준 계산 결과입니다.`;
 $("#targetOut").textContent=fmt(target)+" UC";
 $("#platformOut").textContent=label(platform);
 $("#priceOut").textContent=won(r.cost);
 $("#actualOut").textContent=fmt(r.best)+" UC";
 $("#leftOut").textContent="+"+fmt(r.best-target)+" UC";
 $("#unitOut").textContent=won(r.cost/r.best*100);
 $("#combo").innerHTML=r.ps.map((p,i)=>r.counts[i]?`
  <div class="combo-item"><span>● ${fmt(p.total)} UC × ${r.counts[i]}</span><b>${won(p.price*r.counts[i])}</b></div>`:"").join("");
 $("#packCount").textContent=r.counts.reduce((a,b)=>a+b,0)+" PACK";
}

$$(".platform").forEach(btn=>{
 btn.addEventListener("click",()=>{
  $$(".platform").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  platform=btn.dataset.platform;
  renderPackages();
  if(!$("#result").classList.contains("hidden")) calculate();
 });
});

$$("[data-target]").forEach(btn=>btn.addEventListener("click",()=>{
 $("#target").value=btn.dataset.target;
 calculate();
}));
$("#calc").addEventListener("click",calculate);
$("#target").addEventListener("keydown",e=>{if(e.key==="Enter")calculate();});

$("#reset").addEventListener("click",()=>{
 $("#target").value="";
 $("#result").classList.add("hidden");
 $("#empty").classList.remove("hidden");
 $("#badge").textContent="READY";
 $("#resultCaption").textContent="목표 UC를 입력하면 결과가 표시됩니다.";
 $("#error").textContent="";
});

$("#copy").addEventListener("click",async()=>{
 const text=`UC CALC\n플랫폼: ${label(platform)}\n목표: ${$("#targetOut").textContent}\n가격: ${$("#priceOut").textContent}\n확보: ${$("#actualOut").textContent}\n남는 UC: ${$("#leftOut").textContent}`;
 try{
  await navigator.clipboard.writeText(text);
  $("#copy").textContent="복사 완료 ✓";
  setTimeout(()=>$("#copy").textContent="결과 복사",1200);
 }catch(e){alert(text);}
});

$("#helpBtn").addEventListener("click",()=>$("#help").classList.remove("hidden"));
$("#closeHelp").addEventListener("click",()=>$("#help").classList.add("hidden"));
$("#help").addEventListener("click",e=>{if(e.target.id==="help")$("#help").classList.add("hidden")});
$("#themeBtn").addEventListener("click",()=>document.body.classList.toggle("light"));

renderPackages();
