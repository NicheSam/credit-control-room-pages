(() => {
  const PIN_HASH = "47601cb1d76d1fd147affa48a4ae450bc9934e7e5a5aa485bab69bd3d0bc40b9";
  const fetchText = async (url, optional=false) => {
    const r = await fetch(url, {cache:"no-store"});
    if (!r.ok) {
      if (optional && r.status === 404) return null;
      throw new Error(`載入失敗：${url} (${r.status})`);
    }
    return r.text();
  };
  const gunzipBase64Text = async b64 => {
    const bin=atob(String(b64||"").replace(/\s+/g,""));
    const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    if (!("DecompressionStream" in window)) throw new Error("此瀏覽器不支援 gzip 解壓縮，請使用最新版 Chrome / Edge / Safari。");
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  };
  const decodeJson = async b64 => JSON.parse(await gunzipBase64Text(b64));

  async function loadPublicPayload(){
    const baseText=await fetchText("./data/base_snapshot.b64?ts="+Date.now(),true);
    if(!baseText) throw new Error("Dashboard 尚未完成第一次資料初始化。請先上傳 data/base_snapshot.b64。");
    const payload=await decodeJson(baseText);
    const updateIndexText=await fetchText("./data/updates/index.json?ts="+Date.now(),true);
    if(!updateIndexText) return payload;
    const ui=JSON.parse(updateIndexText);
    if(ui.meta){
      const metaText=await fetchText(`./data/updates/${ui.meta}?ts=${Date.now()}`,true);
      if(metaText){const meta=await decodeJson(metaText);payload.generated_at=meta.generated_at||payload.generated_at;payload.monthly_summary=meta.monthly_summary||payload.monthly_summary;payload.ai_monthly_summary=meta.ai_monthly_summary||payload.ai_monthly_summary;}
    }
    for(const m of (ui.months||[])){
      const mt=await fetchText(`./data/updates/months/${m}.b64?ts=${Date.now()}`,true);
      if(!mt) continue;
      const rows=await decodeJson(mt);
      payload.dashboard_fact=(payload.dashboard_fact||[]).filter(r=>String(r["分析月份"]||r["消費年月"]||r["帳單年月"]||"")!==m).concat(rows);
    }
    return payload;
  }

  function patchApp(appCode){
    appCode=appCode.replace('const STORAGE_KEY = "credit_card_control_room_secure_pages";','const STORAGE_KEY = "credit_card_control_room_pages_pin";');
    const replacement=`const PIN_HASH = "${PIN_HASH}";
function hexFromBuffer(buf){return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");}
async function sha256Hex(text){return hexFromBuffer(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text)));}
async function unlockDashboard(){
  const pin=$("unlockPassphrase").value.trim();
  if(!/^\\d{6}$/.test(pin)){ $("unlockStatus").textContent="請輸入 6 位數 PIN。";$("unlockStatus").className="lockStatus error";return; }
  $("unlockBtn").disabled=true;$("unlockStatus").textContent="正在載入 Dashboard…";$("unlockStatus").className="lockStatus";
  try{
    if(await sha256Hex(pin)!==PIN_HASH)throw new Error("PIN_ERROR");
    const payload=await window.__CCR_LOAD_PUBLIC_PAYLOAD__();validateRaw(payload.dashboard_fact);
    state.monthly=(payload.monthly_summary||[]).map(normalizeMonthly).filter(r=>r.billMonth);
    state.aiSummaries=(payload.ai_monthly_summary||[]).map(normalizeAISummary).filter(r=>r.month);
    document.body.classList.remove("locked");$("lockScreen").classList.add("hidden");
    loadRows(payload.dashboard_fact.map(normalizeRow),\`去識別化快照｜\${payload.generated_at||"已載入"}\`);
    $("dataPanelStatus").textContent="已載入";$("unlockPassphrase").value="";
  }catch(e){console.error(e);$("unlockStatus").textContent=e.message==="PIN_ERROR"?"PIN 不正確。":String(e.message||"Dashboard 資料載入失敗");$("unlockStatus").className="lockStatus error";}
  finally{$("unlockBtn").disabled=false;}
}
function lockDashboard(){location.reload();}
async function loadInitial(){document.body.classList.add("locked");$("unlockStatus").textContent="請輸入 6 位數 PIN。";}
function buildOptions(){`;
    const patched=appCode.replace(/function b64ToBytes\(s\)\{[\s\S]*?function buildOptions\(\)\{/m,replacement);
    if(patched===appCode) throw new Error("Dashboard 程式版本不相容：PIN patch 未套用。");
    return patched.replaceAll("加密資料","Dashboard 資料").replaceAll("已解鎖","已載入");
  }

  function applySimpleCopy(){
    document.title="Credit Control Room";
    const q=s=>document.querySelector(s);
    if(q(".lockBrand small"))q(".lockBrand small").textContent="Personal Dashboard";
    if(q("#lockTitle"))q("#lockTitle").textContent="輸入 6 位數 PIN";
    const p=q(".lockCard > p");if(p)p.textContent="這是個人帳務 Dashboard。公開資料已移除信件 ID、附件、原始交易識別碼等資訊；PIN 只用來避免誤開頁面。";
    const lab=q('label[for="unlockPassphrase"]');if(lab)lab.textContent="6 位數 PIN";
    const input=q("#unlockPassphrase");if(input){input.placeholder="••••••";input.maxLength=6;input.inputMode="numeric";input.autocomplete="off";}
    if(q("#unlockBtn"))q("#unlockBtn").textContent="進入 Dashboard";
    if(q("#unlockStatus"))q("#unlockStatus").textContent="請輸入 6 位數 PIN。";
    if(q(".lockSecurity"))q(".lockSecurity").textContent="PIN 是簡易門檻；公開 Dashboard 使用的資料已先去識別化。";
    if(q(".brand small"))q(".brand small").textContent="信用卡帳務控制台";
    if(q("#noticeBox"))q("#noticeBox").textContent="Dashboard 正在載入去識別化資料。";
  }
  const boot=async()=>{applySimpleCopy();try{
    window.__CCR_LOAD_PUBLIC_PAYLOAD__=loadPublicPayload;
    const ts=Date.now();
    const [styleB64,...appParts]=await Promise.all([
      fetchText("./style.css.gz.b64?ts="+ts),
      ...[0,1,2,3,4,5].map(i=>fetchText(`./app-${i}.b64?ts=${ts}`))
    ]);
    const [css,appCodeRaw]=await Promise.all([gunzipBase64Text(styleB64),gunzipBase64Text(appParts.join(""))]);
    const style=document.createElement("style");style.textContent=css;document.head.appendChild(style);
    new Function(`${patchApp(appCodeRaw)}\n//# sourceURL=credit-control-room-app.js`)();
  }catch(err){console.error(err);document.body.innerHTML=`<div style="max-width:720px;margin:80px auto;padding:24px;font-family:system-ui;color:#fff;background:#0c1322;border:1px solid #334155;border-radius:18px"><h2>Dashboard 載入失敗</h2><p style="color:#cbd5e1;line-height:1.7">${String(err.message||err)}</p></div>`;}};
  boot();
})();
