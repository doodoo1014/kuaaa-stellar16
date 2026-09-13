// Stellar 16 image exporter: 3:4 cards, full/summary versions, mobile-friendly saving.
function exportWrapLines(ctx,text,maxWidth){
  const words=text.replace(/\*\*/g,'').split(/\s+/);let line='',lines=[];
  for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}
  if(line)lines.push(line);return lines;
}
function exportCentered(ctx,text,x,y,maxWidth,lineHeight){const lines=exportWrapLines(ctx,text,maxWidth);lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));return y+lines.length*lineHeight;}
function exportParagraph(ctx,text,x,y,maxWidth,lineHeight){const lines=exportWrapLines(ctx,text,maxWidth);lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));return y+lines.length*lineHeight;}
function exportFooter(ctx,W,H){
  ctx.textAlign='center';ctx.fillStyle='#91a3bc';ctx.font='700 20px sans-serif';ctx.fillText('고려대학교 아마추어 천문회 KUAAA',W/2,H-108);
  ctx.font='16px sans-serif';ctx.fillStyle='#667892';ctx.fillText('Instagram @koreauniv_aaa  ·  Kakao Channel @kuaaa',W/2,H-74);
  ctx.font='15px sans-serif';ctx.fillStyle='#5f728f';ctx.fillText('Korea University Amateur Astronomical Association · STELLAR 16',W/2,H-44);
}
async function canvasBlob(canvas){return await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));}
function mobilePreview(blob,filename){
  const url=URL.createObjectURL(blob);const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(2,5,13,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;gap:12px';
  const img=document.createElement('img');img.src=url;img.alt='Stellar 16 결과 이미지';img.style.cssText='max-width:100%;max-height:78vh;object-fit:contain;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.45)';
  const note=document.createElement('div');note.textContent='이미지를 길게 눌러 사진에 저장하세요.';note.style.cssText='color:#eef5ff;font:600 13px system-ui,sans-serif;text-align:center';
  const row=document.createElement('div');row.style.cssText='display:flex;gap:10px;width:min(420px,100%)';
  const download=document.createElement('a');download.href=url;download.download=filename;download.textContent='다운로드 시도';download.style.cssText='flex:1;text-align:center;text-decoration:none;padding:12px;border-radius:12px;background:#eef5ff;color:#07111f;font:700 13px system-ui,sans-serif';
  const close=document.createElement('button');close.textContent='닫기';close.style.cssText='flex:1;padding:12px;border-radius:12px;border:1px solid rgba(230,240,255,.28);background:transparent;color:#eef5ff;font:700 13px system-ui,sans-serif';
  close.onclick=()=>{overlay.remove();setTimeout(()=>URL.revokeObjectURL(url),500)};row.append(download,close);overlay.append(img,note,row);document.body.appendChild(overlay);
}
async function deliverExport(blob,filename){
  if(!blob){showToast('이미지를 만들지 못했어요.');return;}
  const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'');
  if(mobile&&navigator.share){
    try{const file=new File([blob],filename,{type:'image/png'});if(!navigator.canShare||navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Stellar 16 결과'});return;}}catch(err){if(err&&err.name==='AbortError')return;}
  }
  if(mobile){mobilePreview(blob,filename);return;}
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);showToast('결과 이미지를 저장했어요.');
}
async function buildFullExport(){
  if(!state.currentResult)return null;const key=state.currentResult,r=RESULTS[key],v=VISUALS[key];
  const W=1500,H=2000,P=110,TW=W-P*2,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');paintStarfield(ctx,W,H);
  const [rr,gg,bb]=hexToRgb(v.color),tg=ctx.createRadialGradient(W*.22,310,20,W*.22,310,320);tg.addColorStop(0,`rgba(${rr},${gg},${bb},.17)`);tg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=tg;ctx.fillRect(0,0,W,620);
  await canvasConstellation(ctx,W/2,275,860,330,key);ctx.textAlign='center';ctx.fillStyle='#f8fafc';ctx.font='700 62px sans-serif';ctx.fillText(r.name,W/2,545);ctx.fillStyle='#cbd6e6';ctx.font='500 31px sans-serif';ctx.fillText(r.tag,W/2,600);
  ctx.textAlign='left';ctx.font='23px sans-serif';ctx.fillStyle='#d7e0ec';let y=690;for(const p of r.paras){y=exportParagraph(ctx,p,P,y,TW,37)+21;}
  y+=5;ctx.strokeStyle=`rgba(${rr},${gg},${bb},.30)`;ctx.beginPath();ctx.moveTo(P+110,y);ctx.lineTo(W-P-110,y);ctx.stroke();y+=45;ctx.textAlign='center';ctx.fillStyle='#f7f9fd';ctx.font='700 27px sans-serif';y=exportCentered(ctx,r.closing,W/2,y,TW-180,41)+24;ctx.strokeStyle=`rgba(${rr},${gg},${bb},.18)`;ctx.beginPath();ctx.moveTo(P+110,y);ctx.lineTo(W-P-110,y);ctx.stroke();y+=40;
  ctx.textAlign='left';ctx.strokeStyle='rgba(220,235,255,.17)';ctx.strokeRect(P,y,TW,145);ctx.fillStyle='#94a8c2';ctx.font='600 20px sans-serif';ctx.fillText('잘 맞는 별',P+26,y+37);ctx.fillText('어색한 별',W/2+26,y+37);ctx.fillStyle='#f2f6fc';ctx.font='700 24px sans-serif';ctx.fillText(r.good,P+26,y+85);ctx.fillText(r.awk,W/2+26,y+85);exportFooter(ctx,W,H);return canvas;
}
async function buildSummaryExport(){
  if(!state.currentResult)return null;const key=state.currentResult,r=RESULTS[key],v=VISUALS[key];const W=1500,H=2000,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');paintStarfield(ctx,W,H);
  const [rr,gg,bb]=hexToRgb(v.color),g=ctx.createRadialGradient(W/2,520,20,W/2,520,520);g.addColorStop(0,`rgba(${rr},${gg},${bb},.20)`);g.addColorStop(.45,`rgba(${rr},${gg},${bb},.07)`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,1100);
  await canvasConstellation(ctx,W/2,520,1080,700,key);ctx.textAlign='center';ctx.fillStyle='#f8fafc';ctx.font='700 78px sans-serif';ctx.fillText(r.name,W/2,1210);ctx.fillStyle='#cbd6e6';ctx.font='600 40px sans-serif';exportCentered(ctx,r.tag,W/2,1295,1040,56);
  ctx.strokeStyle=`rgba(${rr},${gg},${bb},.22)`;ctx.beginPath();ctx.moveTo(250,1510);ctx.lineTo(W-250,1510);ctx.stroke();ctx.fillStyle='#a7b9d1';ctx.font='700 24px sans-serif';ctx.fillText('고려대학교 아마추어 천문회 KUAAA · STELLAR 16',W/2,1608);ctx.fillStyle='#70839f';ctx.font='18px sans-serif';ctx.fillText('Instagram @koreauniv_aaa  ·  Kakao Channel @kuaaa',W/2,1650);return canvas;
}
async function saveFullResultImage(){const c=await buildFullExport();if(!c)return;const r=RESULTS[state.currentResult],blob=await canvasBlob(c);await deliverExport(blob,`Stellar16_${r.name.replace(/\(.+?\)/,'').trim()}_full.png`);}
async function saveSummaryResultImage(){const c=await buildSummaryExport();if(!c)return;const r=RESULTS[state.currentResult],blob=await canvasBlob(c);await deliverExport(blob,`Stellar16_${r.name.replace(/\(.+?\)/,'').trim()}_summary.png`);}
(()=>{
  const full=document.getElementById('saveFullImageButton'),summary=document.getElementById('saveSummaryImageButton');
  if(full)full.addEventListener('click',saveFullResultImage);if(summary)summary.addEventListener('click',saveSummaryResultImage);
})();
