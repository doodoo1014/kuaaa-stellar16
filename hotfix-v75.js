(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  let preparedKey=null, preparedUrl=null, preparedDataUrl=null, preparedName=null;
  let preparing=false;

  function toast(msg){try{showToast(msg);}catch(_){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}}
  function replaceButton(id,handler){const old=$(id);if(!old)return null;const fresh=old.cloneNode(true);old.replaceWith(fresh);fresh.addEventListener('click',handler);return fresh;}

  function safeOpenTypes(from){
    try{if(typeof state!=='undefined')state.lastView=from;}catch(_){}
    try{if(typeof renderTypes==='function')renderTypes();}catch(err){console.error('renderTypes failed',err);}
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    const target=$('typesView');if(target)target.classList.add('active');
    document.title='전체 유형 — Stellar 16';window.scrollTo({top:0,behavior:'smooth'});
  }
  replaceButton('allTypesButton',()=>safeOpenTypes('result'));
  replaceButton('introTypesButton',()=>safeOpenTypes('intro'));

  function wrapLines(ctx,text,maxWidth){const words=text.replace(/\*\*/g,'').split(/\s+/);let line='',lines=[];for(const word of words){const test=line?line+' '+word:word;if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=word}else line=test;}if(line)lines.push(line);return lines;}
  function drawCentered(ctx,text,x,y,maxWidth,lineHeight){const lines=wrapLines(ctx,text,maxWidth);lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));return y+lines.length*lineHeight;}

  async function buildSummary(key){
    const r=RESULTS[key],v=VISUALS[key],W=1500,H=2000,canvas=document.createElement('canvas');
    canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');paintStarfield(ctx,W,H);
    const [rr,gg,bb]=hexToRgb(v.color);
    const glow=ctx.createRadialGradient(W*.5,445,20,W*.5,445,525);glow.addColorStop(0,`rgba(${rr},${gg},${bb},.20)`);glow.addColorStop(.5,`rgba(${rr},${gg},${bb},.055)`);glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,1110);
    await canvasConstellation(ctx,W/2,455,1190,720,key);
    ctx.textAlign='center';ctx.fillStyle='#f8fafc';ctx.font='700 84px sans-serif';ctx.fillText(r.name,W/2,1208);
    ctx.fillStyle='#cbd6e6';ctx.font='600 41px sans-serif';drawCentered(ctx,r.tag,W/2,1292,1080,58);
    ctx.strokeStyle=`rgba(${rr},${gg},${bb},.22)`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(250,1490);ctx.lineTo(W-250,1490);ctx.stroke();
    ctx.fillStyle='#b0c0d5';ctx.font='700 31px sans-serif';ctx.fillText('고려대학교 아마추어 천문회 KUAAA · STELLAR 16',W/2,1605);
    ctx.fillStyle='#879ab4';ctx.font='22px sans-serif';ctx.fillText('Korea University Amateur Astronomical Association',W/2,1654);
    ctx.fillStyle='#7890ad';ctx.font='21px sans-serif';ctx.fillText('Instagram @koreauniv_aaa  ·  Kakao Channel @kuaaa',W/2,1702);
    return canvas;
  }

  function clearPrepared(){
    if(preparedUrl){URL.revokeObjectURL(preparedUrl);preparedUrl=null;}
    preparedDataUrl=null;preparedName=null;preparedKey=null;preparing=false;
  }
  function setSaveReady(ready){const b=$('saveSummaryImageButton');if(!b)return;b.disabled=!ready;b.textContent=ready?'이미지로 저장하기':'이미지 준비 중…';}

  async function prepareCurrentSummary(){
    let key=null;try{key=state.currentResult;}catch(_){return;}
    if(!key||preparing||preparedKey===key)return;
    preparing=true;setSaveReady(false);
    if(preparedUrl){URL.revokeObjectURL(preparedUrl);preparedUrl=null;}
    try{
      const canvas=await buildSummary(key);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      if(!blob)throw new Error('PNG blob generation failed');
      preparedUrl=URL.createObjectURL(blob);
      try{preparedDataUrl=canvas.toDataURL('image/png');}catch(_){preparedDataUrl=null;}
      const r=RESULTS[key];preparedName=`Stellar16_${r.name.replace(/\(.+?\)/,'').trim()}.png`;preparedKey=key;
      setSaveReady(true);
    }catch(err){console.error(err);setSaveReady(false);const b=$('saveSummaryImageButton');if(b)b.textContent='이미지 다시 준비하기';}
    finally{preparing=false;}
  }

  function directDownload(){
    let key=null;try{key=state.currentResult;}catch(_){}
    if(!key)return;
    if(preparedKey!==key||(!preparedUrl&&!preparedDataUrl)){prepareCurrentSummary();toast('이미지를 준비하고 있어요. 잠시 후 다시 눌러 주세요.');return;}
    const ua=navigator.userAgent||'';
    const href=(/SamsungBrowser/i.test(ua)&&preparedDataUrl)?preparedDataUrl:(preparedUrl||preparedDataUrl);
    const a=document.createElement('a');
    a.href=href;a.download=preparedName||'Stellar16.png';a.setAttribute('download',a.download);a.rel='noopener';
    a.style.position='fixed';a.style.left='-10000px';a.style.top='0';a.style.width='1px';a.style.height='1px';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>a.remove(),1000);
    toast('이미지 저장을 시작했어요.');
  }

  replaceButton('saveSummaryImageButton',directDownload);
  const resultView=$('resultView');
  if(resultView){
    const observer=new MutationObserver(()=>{if(resultView.classList.contains('active'))setTimeout(prepareCurrentSummary,0);});
    observer.observe(resultView,{attributes:true,attributeFilter:['class']});
    if(resultView.classList.contains('active'))prepareCurrentSummary();
  }
  $('restartButton')?.addEventListener('click',clearPrepared);
  $('brandButton')?.addEventListener('click',clearPrepared);
  window.addEventListener('pagehide',()=>{if(preparedUrl)URL.revokeObjectURL(preparedUrl);});

  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js?v=7.5',{updateViaCache:'none'}).catch(()=>{});}
})();
