(() => {
  const fetchText=async url=>{const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error(`載入失敗：${url} (${r.status})`);return r.text();};
  const gunzipBase64=async b64=>{const bin=atob(b64.trim());const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);if(!("DecompressionStream" in window))throw new Error("此瀏覽器不支援 gzip 解壓縮，請使用最新版 Chrome / Edge / Safari。");const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));return new Response(stream).text();};
  const loadEncrypted=async manifest=>{
    if(manifest?.mode==="parts"&&Number(manifest.data)>0){
      const urls=Array.from({length:Number(manifest.data)},(_,i)=>`./parts/data/${String(i).padStart(2,"0")}.txt?ts=${Date.now()}`);
      const parts=await Promise.all(urls.map(fetchText));
      const joined=parts.join("");JSON.parse(joined);return joined;
    }
    const r=await fetch(`./data/dashboard.enc.json?ts=${Date.now()}`,{cache:"no-store"});
    if(!r.ok)throw new Error("尚未上傳初始加密快照 data/dashboard.enc.json");
    const txt=await r.text();JSON.parse(txt);return txt;
  };
  const boot=async()=>{try{
    const [styleB64,appB64,manifest]=await Promise.all([
      fetchText("./style.css.gz.b64?ts="+Date.now()),
      fetchText("./app.js.gz.b64?ts="+Date.now()),
      fetch("./parts/manifest.json?ts="+Date.now(),{cache:"no-store"}).then(async r=>r.ok?r.json():({mode:"base"}))
    ]);
    const [css,appCode,encryptedJson]=await Promise.all([gunzipBase64(styleB64),gunzipBase64(appB64),loadEncrypted(manifest)]);
    const style=document.createElement("style");style.textContent=css;document.head.appendChild(style);
    const nativeFetch=window.fetch.bind(window);
    window.fetch=async(input,init)=>{const url=typeof input==="string"?input:input?.url||"";if(url.includes("data/dashboard.enc.json"))return new Response(encryptedJson,{status:200,headers:{"Content-Type":"application/json"}});return nativeFetch(input,init);};
    new Function(`${appCode}\n//# sourceURL=credit-control-room-app.js`)();
  }catch(err){console.error(err);document.body.innerHTML=`<div style="max-width:720px;margin:80px auto;padding:24px;font-family:system-ui;color:#fff;background:#0c1322;border:1px solid #334155;border-radius:18px"><h2>Dashboard 尚未完成初始化</h2><p style="color:#cbd5e1;line-height:1.7">${String(err.message||err)}</p><p style="color:#94a3b8;font-size:13px">網站程式已部署；初始加密快照上傳後會自動可用。</p></div>`;}};
  boot();
})();
