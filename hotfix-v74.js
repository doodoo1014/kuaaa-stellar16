(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  let activeUrl=null,activeFile=null,activeDataUrl=null,activeName='stellar16.png';

  function toast(msg){try{showToast(msg);}catch(_){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}}
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

  function wrapLines(ctx,text,maxWidth){
    const words=text.replace(/\*\*/g,'').split(/\s+/);let line='',lines=[];
    for(const word of words){const test=line?line+' '+word:word;if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=word}else line=test;}
    if(line)lines.push(line);return lines;
  }
  function drawCentered(ctx,text,x,y,maxWidth,lineHeight){const lines=wrapLines(ctx,text,maxWidth);lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));return y+lines.length*lineHeight;}
  function drawParas(ctx,paras,x,y,maxWidth,lineHeight,gap){for(const p of paras){y=drawWrappedText(ctx,p,x,y,maxWidth,lineHeight)+gap;}return y;}
  function roundedRectPath(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.lineTo(x+w-rr,y);ctx.quadraticCurveTo(x+w,y,x+w,y+rr);ctx.lineTo(x+w,y+h-rr);ctx.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);ctx.lineTo(x+rr,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-rr);ctx.lineTo(x,y+rr);ctx.quadraticCurveTo(x,y,x+rr,y);ctx.closePath();}
  function footer(ctx,W,H){ctx.textAlign='center';ctx.fillStyle='#91a3bc';ctx.font='700 20px sans-serif';ctx.fillText('고려대학교 아마추어 천문회 KUAAA',W/2,H-105);ctx.font='16px sans-serif';ctx.fillStyle='#667892';ctx.fillText('Instagram @koreauniv_aaa  ·  Kakao Channel @kuaaa',W/2,H-72);ctx.font='15px sans-serif';ctx.fillStyle='#5f728f';ctx.fillText('Korea University Amateur Astronomical Association · STELLAR 16',W/2,H-43);}
  const canvasBlob=canvas=>new Promise(resolve=>canvas.toBlob(resolve,'image/png'));

  function bodyMetrics(ctx,r,maxWidth,available){
    const opts=[{font:22,line:35,gap:19},{font:21,line:33,gap:17},{font:20,line:31,gap:15},{font:19,line:29,gap:14},{font:18,line:27,gap:13}];
    for(const o of opts){ctx.font=`${o.font}px sans-serif`;const lines=r.paras.reduce((n,p)=>n+wrapLines(ctx,p,maxWidth).length,0);const h=lines*o.line+r.paras.length*o.gap;if(h<=available)return o;}
    return opts[opts.length-1];
  }
  function drawQuotePanel(ctx,r,v,W,P,y,h){
    const [rr,gg,bb]=hexToRgb(v.color),w=W-P*2;
    const grad=ctx.createLinearGradient(P,y,P+w,y+h);grad.addColorStop(0,`rgba(${rr},${gg},${bb},.12)`);grad.addColorStop(1,'rgba(255,255,255,.025)');
    roundedRectPath(ctx,P,y,w,h,26);ctx.fillStyle=grad;ctx.fill();ctx.strokeStyle=`rgba(${rr},${gg},${bb},.24)`;ctx.lineWidth=1.4;ctx.stroke();
    ctx.fillStyle=`rgba(${rr},${gg},${bb},.75)`;ctx.font='700 46px serif';ctx.textAlign='left';ctx.fillText('“',P+34,y+56);
    ctx.font='700 28px sans-serif';ctx.textAlign='center';ctx.fillStyle='#f7f9fd';const lines=wrapLines(ctx,r.closing,w-150);const lh=41;const baseline=y+h-34-(lines.length-1)*lh;lines.forEach((line,i)=>ctx.fillText(line,W/2,baseline+i*lh));
  }
  function drawCompatCard(ctx,x,y,w,h,label,value,kind,v){
    const [rr,gg,bb]=kind==='good'?hexToRgb(v.color):[229,168,183];
    const grad=ctx.createLinearGradient(x,y,x+w,y+h);grad.addColorStop(0,`rgba(${rr},${gg},${bb},.105)`);grad.addColorStop(1,'rgba(255,255,255,.022)');
    roundedRectPath(ctx,x,y,w,h,24);ctx.fillStyle=grad;ctx.fill();ctx.strokeStyle=`rgba(${rr},${gg},${bb},.27)`;ctx.lineWidth=1.3;ctx.stroke();
    ctx.textAlign='left';ctx.fillStyle=`rgba(${rr},${gg},${bb},.92)`;ctx.font='700 18px sans-serif';ctx.fillText(kind==='good'?'✦':'◇',x+30,y+42);
    ctx.fillStyle='#8fa3bd';ctx.font='600 19px sans-serif';ctx.fillText(label,x+60,y+42);
    ctx.fillStyle='#f1f5fb';ctx.font='700 27px sans-serif';const lines=wrapLines(ctx,value,w-60);lines.slice(0,2).forEach((line,i)=>ctx.fillText(line,x+30,y+91+i*35));
  }

  async function buildFull(key){
    const r=RESULTS[key],v=VISUALS[key],W=1500,H=2000,P=110,TW=W-P*2,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');paintStarfield(ctx,W,H);
    const [rr,gg,bb]=hexToRgb(v.color);const glow=ctx.createRadialGradient(W*.5,300,20,W*.5,300,340);glow.addColorStop(0,`rgba(${rr},${gg},${bb},.15)`);glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,620);
    await canvasConstellation(ctx,W/2,260,850,300,key);
    ctx.textAlign='center';ctx.fillStyle='#f8fafc';ctx.font='700 62px sans-serif';ctx.fillText(r.name,W/2,525);ctx.fillStyle='#cbd6e6';ctx.font='500 31px sans-serif';ctx.fillText(r.tag,W/2,582);

    const bodyTop=660, quoteY=1295, quoteH=180, compatY=1515, compatH=170, bodyAvail=quoteY-bodyTop-38;
    const m=bodyMetrics(ctx,r,TW,bodyAvail);ctx.textAlign='left';ctx.fillStyle='#d7e0ec';ctx.font=`${m.font}px sans-serif`;drawParas(ctx,r.paras,P,bodyTop,TW,m.line,m.gap);

    drawQuotePanel(ctx,r,v,W,P,quoteY,quoteH);
    const gap=28,cw=(TW-gap)/2;drawCompatCard(ctx,P,compatY,cw,compatH,'잘 맞는 별',r.good,'good',v);drawCompatCard(ctx,P+cw+gap,compatY,cw,compatH,'어색한 별',r.awk,'awkward',v);
    footer(ctx,W,H);return canvas;
  }
  async function buildSummary(key){
    const r=RESULTS[key],v=VISUALS[key],W=1500,H=2000,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');paintStarfield(ctx,W,H);const [rr,gg,bb]=hexToRgb(v.color);const glow=ctx.createRadialGradient(W*.5,470,20,W*.5,470,470);glow.addColorStop(0,`rgba(${rr},${gg},${bb},.18)`);glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,1050);await canvasConstellation(ctx,W/2,455,1040,620,key);ctx.textAlign='center';ctx.fillStyle='#f8fafc';ctx.font='700 82px sans-serif';ctx.fillText(r.name,W/2,1185);ctx.fillStyle='#cbd6e6';ctx.font='600 39px sans-serif';drawCentered(ctx,r.tag,W/2,1270,1050,55);ctx.strokeStyle=`rgba(${rr},${gg},${bb},.20)`;ctx.beginPath();ctx.moveTo(260,1490);ctx.lineTo(W-260,1490);ctx.stroke();ctx.fillStyle='#9fb0c7';ctx.font='700 24px sans-serif';ctx.fillText('고려대학교 아마추어 천문회 KUAAA · STELLAR 16',W/2,1608);ctx.fillStyle='#71849e';ctx.font='18px sans-serif';ctx.fillText('Instagram @koreauniv_aaa  ·  Kakao Channel @kuaaa',W/2,1650);return canvas;
  }

  function closeModal(){const m=$('imageSaveModal');if(m)m.hidden=true;document.body.style.overflow='';if(activeUrl){URL.revokeObjectURL(activeUrl);activeUrl=null;}activeFile=null;activeDataUrl=null;const p=$('imageSavePreview');if(p)p.removeAttribute('src');}
  function showModal(blob,dataUrl,name){
    if(activeUrl)URL.revokeObjectURL(activeUrl);activeUrl=URL.createObjectURL(blob);activeDataUrl=dataUrl;activeName=name;activeFile=new File([blob],name,{type:'image/png'});
    const m=$('imageSaveModal'),img=$('imageSavePreview'),download=$('imageDownloadLink'),share=$('imageShareButton'),open=$('imageOpenButton');
    img.src=dataUrl;download.href=dataUrl;download.download=name;
    if(open)open.hidden=false;
    if(share)share.hidden=!(navigator.share);
    m.hidden=false;document.body.style.overflow='hidden';
  }
  async function deliver(canvas,name){
    const blob=await canvasBlob(canvas);if(!blob){toast('이미지를 만들지 못했어요.');return;}
    const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'');
    if(mobile){let dataUrl='';try{dataUrl=canvas.toDataURL('image/png');}catch(_){dataUrl=URL.createObjectURL(blob);}showModal(blob,dataUrl,name);toast('이미지가 준비됐어요. 아래 저장 버튼을 눌러 주세요.');return;}
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('결과 이미지를 저장했어요.');
  }
  async function saveFull(){try{if(!state.currentResult)return;const key=state.currentResult,r=RESULTS[key];toast('전체 결과 이미지를 만드는 중이에요.');await deliver(await buildFull(key),`Stellar16_${r.name.replace(/\(.+?\)/,'').trim()}_full.png`);}catch(err){console.error(err);toast('이미지 생성 중 오류가 발생했어요.');}}
  async function saveSummary(){try{if(!state.currentResult)return;const key=state.currentResult,r=RESULTS[key];toast('요약 이미지를 만드는 중이에요.');await deliver(await buildSummary(key),`Stellar16_${r.name.replace(/\(.+?\)/,'').trim()}_summary.png`);}catch(err){console.error(err);toast('이미지 생성 중 오류가 발생했어요.');}}

  async function mobileSave(){
    if(!activeFile)return;
    if(window.showSaveFilePicker){
      try{const handle=await showSaveFilePicker({suggestedName:activeName,types:[{description:'PNG 이미지',accept:{'image/png':['.png']}}]});const writable=await handle.createWritable();await writable.write(activeFile);await writable.close();toast('이미지를 저장했어요.');return;}catch(err){if(err?.name==='AbortError')return;}
    }
    if(navigator.share){
      try{await navigator.share({files:[activeFile],title:'Stellar 16 결과 이미지'});return;}catch(err){if(err?.name==='AbortError')return;console.warn('share failed',err);}
    }
    if(activeDataUrl){const tab=window.open(activeDataUrl,'_blank');if(tab){toast('이미지를 새 탭에서 열었어요. 브라우저 메뉴 또는 길게 눌러 저장해 주세요.');return;}}
    toast('미리보기를 길게 눌러 이미지 저장을 선택해 주세요.');
  }
  function openImage(){if(!activeDataUrl)return;const tab=window.open(activeDataUrl,'_blank');if(!tab)location.href=activeDataUrl;}

  replaceButton('saveFullImageButton',saveFull);replaceButton('saveSummaryImageButton',saveSummary);
  $('imageSaveClose')?.addEventListener('click',closeModal);$('imageSaveModal')?.addEventListener('click',e=>{if(e.target===$('imageSaveModal'))closeModal();});
  $('imageDownloadLink')?.addEventListener('click',e=>{if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'')){e.preventDefault();mobileSave();}});
  $('imageShareButton')?.addEventListener('click',mobileSave);$('imageOpenButton')?.addEventListener('click',openImage);
  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js?v=7.4',{updateViaCache:'none'}).catch(()=>{});}
})();
