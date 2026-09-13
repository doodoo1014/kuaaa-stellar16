(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  let activeUrl=null,activeFile=null;

  function toast(msg){try{showToast(msg);}catch(_){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}}
  function replaceButton(id,handler){const old=$(id);if(!old)return null;const fresh=old.cloneNode(true);old.replaceWith(fresh);fresh.addEventListener('click',handler);return fresh;}

  function safeOpenTypes(from){
    try{if(typeof state!=='undefined')state.lastView=from;}catch(_){}
    try{if(typeof renderTypes==='function')renderTypes();}catch(err){console.error('renderTypes failed',err);}
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    const target=$('typesView');if(target)target.classList.add('active');
    document.title='전체 유형 — Stellar 16';
    window.scrollTo({top:0,behavior:'smooth'});
  }
  replaceButton('allTypesButton',()=>safeOpenTypes('result'));
  replaceButton('introTypesButton',()=>safeOpenTypes('intro'));

  function wrapLines(ctx,text,maxWidth){const words=text.replace(/\*\*/g,'').split(/\s+/);let line='',lines=[];for(const word of words){const test=line?line+' '+word:word;if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=word}else line=test;}if(line)lines.push(line);return lines;}
  function drawCentered(ctx,text,x,y,maxWidth,lineHeight){const lines=wrapLines(ctx,text,maxWidth);lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));return y+lines.length*lineHeight;}
  function drawParas(ctx,paras,x,y,maxWidth,lineHeight,gap){for(const p of paras){y=drawWrappedText(ctx,p,x,y,maxWidth,lineHeight)+gap;}return y;}
  function footer(ctx,W,H){ctx.textAlign='center';ctx.fillStyle='#91a3bc';ctx.font='700 20px sans-serif';ctx.fillText('고려대학교 아마추어 천문회 KUAAA',W/2,H-105);ctx.font='16px sans-serif';ctx.fillStyle='#667892';ctx.fillText('Instagram @koreauniv_aaa  ·  Kakao Channel @kuaaa',W/2,H-72);ctx.font='15px sans-serif';ctx.fillStyle='#5f728f';ctx.fillText('Korea University Amateur Astronomical Association · STELLAR 16',W/2,H-43);}
  const canvasBlob=canvas=>new Promise(resolve=>canvas.toBlob(resolve,'image/png'));

  async function buildFull(key){
    const r=RESULTS[key],v=VISUALS[key],W=1500,H=2000,P=110,TW=W-P*2,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');paintStarfield(ctx,W,H);const [rr,gg,bb]=hexToRgb(v.color);const glow=ctx.createRadialGradient(W*.5,300,20,W*.5,300,340);glow.addColorStop(0,`rgba(${rr},${gg},${bb},.15)`);glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,620);await canvasConstellation(ctx,W/2,260,850,300,key);ctx.textAlign='center';ctx.fillStyle='#f8fafc';ctx.font='700 62px sans-serif';ctx.fillText(r.name,W/2,525);ctx.fillStyle='#cbd6e6';ctx.font='500 31px sans-serif';ctx.fillText(r.tag,W/2,582);
    ctx.textAlign='left';ctx.fillStyle='#d7e0ec';let font=22,line=35,gap=19;ctx.font=`${font}px sans-serif`;let y=670;y=drawParas(ctx,r.paras,P,y,TW,line,gap);y+=10;ctx.strokeStyle=`rgba(${rr},${gg},${bb},.28)`;ctx.beginPath();ctx.moveTo(P+105,y);ctx.lineTo(W-P-105,y);ctx.stroke();y+=42;ctx.textAlign='center';ctx.fillStyle='#f7f9fd';ctx.font='700 26px sans-serif';y=drawCentered(ctx,r.closing,W/2,y,TW-180,39)+25;ctx.strokeStyle=`rgba(${rr},${gg},${bb},.18)`;ctx.beginPath();ctx.moveTo(P+105,y);ctx.lineTo(W-P-105,y);ctx.stroke();y+=40;ctx.textAlign='left';ctx.strokeStyle='rgba(220,235,255,.17)';ctx.strokeRect(P,y,TW,145);ctx.fillStyle='#94a8c2';ctx.font='600 21px sans-serif';ctx.fillText('잘 맞는 별',P+26,y+38);ctx.fillText('어색한 별',W/2+26,y+38);ctx.fillStyle='#f2f6fc';ctx.font='700 25px sans-serif';ctx.fillText(r.good,P+26,y+86);ctx.fillText(r.awk,W/2+26,y+86);footer(ctx,W,H);return canvas;
  }
  async function buildSummary(key){
    const r=RESULTS[key],v=VISUALS[key],W=1500,H=2000,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');paintStarfield(ctx,W,H);const [rr,gg,bb]=hexToRgb(v.color);const glow=ctx.createRadialGradient(W*.5,470,20,W*.5,470,470);glow.addColorStop(0,`rgba(${rr},${gg},${bb},.18)`);glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,1050);await canvasConstellation(ctx,W/2,455,1040,620,key);ctx.textAlign='center';ctx.fillStyle='#f8fafc';ctx.font='700 82px sans-serif';ctx.fillText(r.name,W/2,1185);ctx.fillStyle='#cbd6e6';ctx.font='600 39px sans-serif';drawCentered(ctx,r.tag,W/2,1270,1050,55);ctx.strokeStyle=`rgba(${rr},${gg},${bb},.20)`;ctx.beginPath();ctx.moveTo(260,1490);ctx.lineTo(W-260,1490);ctx.stroke();ctx.fillStyle='#9fb0c7';ctx.font='700 24px sans-serif';ctx.fillText('고려대학교 아마추어 천문회 KUAAA · STELLAR 16',W/2,1608);ctx.fillStyle='#71849e';ctx.font='18px sans-serif';ctx.fillText('Instagram @koreauniv_aaa  ·  Kakao Channel @kuaaa',W/2,1650);return canvas;
  }

  function closeModal(){const m=$('imageSaveModal');if(m)m.hidden=true;document.body.style.overflow='';if(activeUrl){URL.revokeObjectURL(activeUrl);activeUrl=null;}activeFile=null;const p=$('imageSavePreview');if(p)p.removeAttribute('src');}
  function showModal(blob,name){if(activeUrl)URL.revokeObjectURL(activeUrl);activeUrl=URL.createObjectURL(blob);activeFile=new File([blob],name,{type:'image/png'});const m=$('imageSaveModal'),img=$('imageSavePreview'),link=$('imageDownloadLink'),share=$('imageShareButton');img.src=activeUrl;link.href=activeUrl;link.download=name;const canShare=!!(navigator.share&&navigator.canShare&&navigator.canShare({files:[activeFile]}));share.hidden=!canShare;m.hidden=false;document.body.style.overflow='hidden';}
  async function deliver(canvas,name){const blob=await canvasBlob(canvas);if(!blob){toast('이미지를 만들지 못했어요.');return;}const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'');if(mobile){showModal(blob,name);toast('이미지를 준비했어요. 아래에서 저장해 주세요.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('결과 이미지를 저장했어요.');}
  async function saveFull(){try{if(!state.currentResult)return;const key=state.currentResult,r=RESULTS[key];toast('전체 결과 이미지를 만드는 중이에요.');await deliver(await buildFull(key),`Stellar16_${r.name.replace(/\(.+?\)/,'').trim()}_full.png`);}catch(err){console.error(err);toast('이미지 생성 중 오류가 발생했어요.');}}
  async function saveSummary(){try{if(!state.currentResult)return;const key=state.currentResult,r=RESULTS[key];toast('요약 이미지를 만드는 중이에요.');await deliver(await buildSummary(key),`Stellar16_${r.name.replace(/\(.+?\)/,'').trim()}_summary.png`);}catch(err){console.error(err);toast('이미지 생성 중 오류가 발생했어요.');}}

  replaceButton('saveFullImageButton',saveFull);replaceButton('saveSummaryImageButton',saveSummary);
  $('imageSaveClose')?.addEventListener('click',closeModal);$('imageSaveModal')?.addEventListener('click',e=>{if(e.target===$('imageSaveModal'))closeModal();});$('imageDownloadLink')?.addEventListener('click',()=>toast('다운로드가 시작되지 않으면 미리보기를 길게 눌러 저장해 주세요.'));$('imageShareButton')?.addEventListener('click',async()=>{if(!activeFile||!navigator.share)return;try{await navigator.share({files:[activeFile],title:'Stellar 16 결과 이미지'});}catch(err){if(err?.name!=='AbortError')toast('공유를 열지 못했어요.');}});
  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js?v=7.3',{updateViaCache:'none'}).catch(()=>{});}
})();
