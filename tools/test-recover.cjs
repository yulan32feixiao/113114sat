#!/usr/bin/env node
/* 账号找回测试：确认忘记密码后能凭「找回」进入且一条记录都不丢。 */
const fs=require("fs"),path=require("path"),{JSDOM}=require("jsdom");
const SITE=process.env.SITE_DIR||path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(SITE,"index.html"),"utf8");
const bank=fs.readFileSync(path.join(SITE,"bank.bin"));
const errs=[];
const dom=new JSDOM(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`,{
  runScripts:"dangerously",pretendToBeVisual:true,url:"https://x.github.io/s/",
  beforeParse(w){w.fetch=async()=>({ok:true,status:200,arrayBuffer:async()=>bank.buffer.slice(bank.byteOffset,bank.byteOffset+bank.byteLength)});
    w.DecompressionStream=DecompressionStream;w.Blob=Blob;w.Response=Response;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
    Object.defineProperty(w,"crypto",{value:require("crypto").webcrypto,configurable:true});
    w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});
    w.JSZip=function(){};w.pdfjsLib={};w.requestAnimationFrame=cb=>setTimeout(cb,0);
    w.confirm=()=>true;w.URL.createObjectURL=()=>"blob:";w.URL.revokeObjectURL=()=>{};}});
const w=dom.window,D=w.document,ev=s=>w.eval(s);
const step=(n,f)=>{try{const r=f();console.log(`  ok  ${n}${r?" — "+r:""}`);}
                   catch(e){console.log(`  FAIL ${n}: ${e.message}`);errs.push(n);}};
(async()=>{
  await new Promise(r=>setTimeout(r,3000));
  // 造一个有数据的账户，然后"忘记"密码
  await ev(`(async()=>{await registerUser("sandrone","oldpw1");CURRENT="sandrone";
    lsSet("b7_session","sandrone");document.querySelector("#gate").remove();enterApp("")})()`);
  await new Promise(r=>setTimeout(r,300));
  ev(`attempts=[{aid:"a1",qid:BANK[0].id,sec:1,dom:BANK[0].dom,sk:BANK[0].sk,df:"M",bd:4,
        picked:"A",correct:"B",ok:false,ms:1000,ts:Date.now(),session:"旧练习",sid:"s1"}];
      saveLocal();
      sessions=[{sid:"s1",label:"旧练习",mode:"drill",startTs:Date.now()-60000,endTs:Date.now(),
        activeMs:60000,n:1,ok:0,qids:[BANK[0].id]}]; lsSet(K("sessions"),sessions);
      marks={}; toggleMark(BANK[1].id);
      reviewQ={}; collect(BANK[0].id,null); flushReview();`);
  const before = ev(`[attempts.length, sessions.length, Object.keys(marks).length, Object.keys(reviewQ).length]`);
  step("账户已有数据", ()=>`作答 ${before[0]} · 场次 ${before[1]} · 标记 ${before[2]} · 错题 ${before[3]}`);

  // 退出，模拟忘记密码
  ev(`localStorage.removeItem("b7_session"); CURRENT=null;`);
  ev(`showAuth()`);
  await new Promise(r=>setTimeout(r,200));
  step("登录门出现且有「找回」页签",()=>{
    const t=[...D.querySelectorAll("#gate .gtabs button")].map(x=>x.textContent);
    if(!t.includes("找回")) throw new Error(t.join(","));
    return t.join(" / ");});
  step("错密码登录被拒",async()=>{});
  let rejected=false;
  try{ await ev(`loginUser("sandrone","wrongpw")`); }catch(e){ rejected=true; }
  step("错密码确实进不去",()=>{ if(!rejected) throw new Error("居然放进去了"); return "已拒绝"; });

  step("找回页列出账户和记录数",()=>{
    const btns=[...D.querySelectorAll("#gate .gtabs button")];
    btns.find(b=>b.textContent==="找回").click();
    const items=[...D.querySelectorAll(".recoveritem")];
    if(!items.length) throw new Error("没列出账户");
    const txt=items[0].textContent;
    if(!txt.includes("sandrone")) throw new Error(txt);
    if(!txt.includes("1 条作答")) throw new Error("没显示记录数: "+txt);
    return txt.replace(/\s+/g," ").trim();});

  await ev(`resetPwLocal("sandrone","newpw2")`);
  step("新密码可登录",async()=>{});
  let okLogin=false;
  try{ await ev(`loginUser("sandrone","newpw2")`); okLogin=true; }catch(e){}
  step("重设后新密码能进",()=>{ if(!okLogin) throw new Error("进不去"); return "可以"; });
  let oldStill=false;
  try{ await ev(`loginUser("sandrone","oldpw1")`); oldStill=true; }catch(e){}
  step("旧密码已失效",()=>{ if(oldStill) throw new Error("旧密码还能用"); return "已失效"; });

  ev(`CURRENT="sandrone"; loadAll();`);
  const after = ev(`[attempts.length, sessions.length, Object.keys(marks).length, Object.keys(reviewQ).length]`);
  step("重设密码后数据一条不丢",()=>{
    if(JSON.stringify(before)!==JSON.stringify(after))
      throw new Error(`前 ${JSON.stringify(before)} 后 ${JSON.stringify(after)}`);
    return `作答 ${after[0]} · 场次 ${after[1]} · 标记 ${after[2]} · 错题 ${after[3]}（与重设前一致）`;});

  // 登录页三种状态的提示
  console.log("\n=== 登录页自检提示 ===");
  step("重复调用不叠加登录层",()=>{ ev(`showAuth(); showAuth()`);
    const n=D.querySelectorAll("#gate").length;
    if(n!==1) throw new Error(n+" 层");
    return "只有 1 层";});
  step("有账户时报告数量",()=>{ ev(`showAuth()`);
    const f=D.querySelector("#gate .gfound");
    if(!f) throw new Error("没有自检块");
    if(!f.textContent.includes("1 个账户")) throw new Error(f.textContent.slice(0,60));
    if(!f.textContent.includes("sandrone")) throw new Error("没列出账户名");
    return f.textContent.replace(/\s+/g," ").trim().slice(0,72);});
  step("无账户但有旧数据时引导注册",()=>{
    ev(`localStorage.setItem("b7_users","{}");
        localStorage.setItem("b7_attempts", JSON.stringify([{aid:"x"},{aid:"y"},{aid:"z"}]));
        showAuth()`);
    const f=D.querySelector("#gate .gfound");
    if(!f.textContent.includes("3 条还没归属账户")) throw new Error(f.textContent.slice(0,80));
    if(!f.textContent.includes("点「注册」")) throw new Error("没引导注册");
    return "提示 3 条待认领并引导注册";});
  step("什么都没有时说清在哪找",()=>{
    ev(`localStorage.removeItem("b7_attempts"); localStorage.setItem("b7_users","{}"); showAuth()`);
    const f=D.querySelector("#gate .gfound");
    if(!f.textContent.includes("没有任何账户")) throw new Error(f.textContent.slice(0,60));
    if(!f.textContent.includes("浏览器")) throw new Error("没解释原因");
    return "明确告知换回原浏览器或导入进度";});

  console.log(errs.length?`\n失败 ${errs.length} 项`:"\n全部通过 ✓");
  process.exit(errs.length?1:0);
})();
