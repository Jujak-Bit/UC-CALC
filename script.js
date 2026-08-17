const PRICE_DATA={
ios:[
 {uc:60,bonus:0,price:1100},{uc:325,bonus:25,price:5500},{uc:660,bonus:60,price:11000},
 {uc:1800,bonus:180,price:27500},{uc:3850,bonus:385,price:55000},{uc:8100,bonus:810,price:110000},{uc:16200,bonus:1620,price:220000}
],
android:[
 {uc:60,bonus:0,price:1100},{uc:325,bonus:25,price:5500},{uc:660,bonus:60,price:11000},
 {uc:1800,bonus:180,price:27500},{uc:3850,bonus:385,price:55000},{uc:8100,bonus:810,price:110000},{uc:16200,bonus:1620,price:220000}
],
midas:[
 {uc:60,bonus:0,price:1000},{uc:300,bonus:30,price:5000},{uc:660,bonus:60,price:10000},
 {uc:1800,bonus:180,price:25000},{uc:3850,bonus:385,price:50000},{uc:8100,bonus:810,price:100000},{uc:16200,bonus:1620,price:200000}
]};

let platform="ios";
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const fmt=n=>Math.round(n).toLocaleString("ko-KR");
const won=n=>"₩"+Math.round(n).toLocaleString("ko-KR");
const nameOf=p=>p==="midas"?"MidasBuy":p==="android"?"Android":"iOS";

function packages(){
 const useBonus=$("#bonus").checked;
 return PRICE_DATA[platform].map((p,i)=>({...p,total:p.uc+(useBonus?p.bonus:0),index:i}));
}

function solve(target){
 const ps=packages();
 const max=target+Math.max(...ps.map(p=>p.total));
 const dp=Array(max+1).fill(Infinity), prev=Array(max+1);
 dp[0]=0;
 for(let i=0;i<=max;i++){
   if(!Number.isFinite(dp[i])) continue;
   for(const p of ps){
     const n=i+p.total;
     if(n<=max && dp[n]>dp[i]+p.price){
       dp[n]=dp[i]+p.price;
       prev[n]={from:i,index:p.index};
     }
   }
 }
 let best=target;
 for(let i=target;i<=max;i++){
   if(!Number.isFinite(dp[i])) continue;
   const better=$("#tight").checked
     ? dp[i]<dp[best] || (dp[i]===dp[best] && i<best)
     : dp[i]<dp[best];
   if(better) best=i;
 }
 const count=Array(ps.length).fill(0);
 let x=best;
 while(x>0 && prev[x]){
   count[prev[x].index]++;
   x=prev[x].from;
 }
 return {best,cost:dp[best],count,ps};
}

function renderTable(){
 const ps=packages();
 $("#packageRows").innerHTML=ps.map(p=>`
 <tr><td><b>${fmt(p.uc)} UC</b></td><td>${fmt(p.uc)}</td><td>+${fmt(p.bonus)}</td>
 <td>${fmt(p.total)}</td><td class="money">${won(p.price)}</td><td>${won(p.price/p.total*100)}</td></tr>`).join("");
 $("#packagePlatform").textContent=nameOf(platform);
 $("#resultPlatform").textContent=nameOf(platform);
}

function calculate(){
 const target=Math.floor(Number($("#target").value));
 $("#error").textContent="";
 if(!target || target<1){$("#error").textContent="UC를 1 이상 입력해주세요.";return}
 if(target>1000000){$("#error").textContent="최대 1,000,000 UC까지 계산할 수 있습니다.";return}
 const r=solve(target);
 $("#empty").classList.add("hidden");
 $("#result").classList.remove("hidden");
 $("#status").textContent="CALCULATED";
 $("#resultSub").textContent="선택한 플랫폼의 데이터로 계산했습니다.";
 $("#targetText").textContent=fmt(target)+" UC";
 $("#totalPrice").textContent=won(r.cost);
 $("#actual").textContent=fmt(r.best)+" UC";
 $("#bonusAmount").textContent="+"+fmt(r.best-r.count.reduce((s,c,i)=>s+c*r.ps[i].uc,0));
 $("#leftover").textContent="+"+fmt(r.best-target)+" UC";
 $("#resultNote").textContent=r.best===target?"목표량과 정확히 일치하는 조합입니다.":`목표량보다 ${fmt(r.best-target)} UC 더 확보하는 조합입니다.`;
 const items=r.ps.map((p,i)=>r.count[i]?`<div class="pack"><span><b class="dot">●</b> ${fmt(p.uc)} UC × ${r.count[i]} <small>(총 ${fmt(p.total*r.count[i])} UC)</small></span><b>${won(p.price*r.count[i])}</b></div>`:"").join("");
 $("#packList").innerHTML=items;
 $("#packCount").textContent=r.count.reduce((a,b)=>a+b,0)+" PACK";
}

$$(".platform").forEach(btn=>btn.addEventListener("click",()=>{
 $$(".platform").forEach(x=>x.classList.remove("active"));
 btn.classList.add("active");
 platform=btn.dataset.platform;
 renderTable();
 if(!$("#result").classList.contains("hidden")) calculate();
}));

$$("[data-target]").forEach(btn=>btn.addEventListener("click",()=>{
 $("#target").value=btn.dataset.target;
 calculate();
}));

$("#calculate").addEventListener("click",calculate);
$("#target").addEventListener("keydown",e=>{if(e.key==="Enter")calculate()});
$("#bonus").addEventListener("change",()=>{renderTable();if(!$("#result").classList.contains("hidden"))calculate()});
$("#tight").addEventListener("change",()=>{if(!$("#result").classList.contains("hidden"))calculate()});

$("#reset").addEventListener("click",()=>{
 $("#target").value="";
 $("#result").classList.add("hidden");
 $("#empty").classList.remove("hidden");
 $("#status").textContent="READY";
 $("#resultSub").textContent="목표 UC를 입력하면 결과가 표시됩니다.";
});

$("#copy").addEventListener("click",async()=>{
 const text=`UC CALC 결과\n플랫폼: ${nameOf(platform)}\n목표: ${$("#targetText").textContent}\n가격: ${$("#totalPrice").textContent}\n실제 확보: ${$("#actual").textContent}\n남는 UC: ${$("#leftover").textContent}`;
 try{await navigator.clipboard.writeText(text);$("#copy").textContent="복사 완료 ✓";setTimeout(()=>$("#copy").textContent="결과 복사",1300)}
 catch(e){alert(text)}
});

$("#themeBtn").addEventListener("click",()=>{
 document.body.classList.toggle("light");
 $("#themeBtn").textContent=document.body.classList.contains("light")?"☀":"☾";
});

renderTable();