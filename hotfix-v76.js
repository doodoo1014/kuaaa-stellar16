(()=>{
  'use strict';
  const $=id=>document.getElementById(id);

  function toast(msg){try{showToast(msg);}catch(_){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}}
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

  function drawRenderedConstellation(ctx,cx,cy,w,h,key){
    const host=$('resultStar');const svg=host?.querySelector('svg.constellation-svg');const v=VISUALS[key];
    if(!svg){canvasSparkle(ctx,cx,cy,34,v.color);return;}
    const vb=svg.viewBox?.baseVal;const VW=vb?.width||120,VH=vb?.height||70;
    const scale=Math.min(w/VW,h/VH),ox=cx-(VW*scale)/2,oy=cy-(VH*scale)/2,sx=x=>ox+x*scale,sy=y=>oy+y*scale;
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    svg.querySelectorAll('polyline.const-line').forEach(line=>{
      const raw=(line.getAttribute('points')||'').trim();if(!raw)return;const pts=raw.split(/\s+/).map(p=>p.split(',').map(Number)).filter(p=>p.length===2&&p.every(Number.isFinite));if(pts.length<2)return;
      const thin=line.classList.contains('thin');ctx.strokeStyle=thin?'rgba(190,211,239,.18)':'rgba(190,211,239,.31)';ctx.lineWidth=thin?1.7:2.6;ctx.beginPath();ctx.moveTo(sx(pts[0][0]),sy(pts[0][1]));for(let i=1;i<pts.length;i++)ctx.lineTo(sx(pts[i][0]),sy(pts[i][1]));ctx.stroke();
    });
    svg.querySelectorAll('circle.const-star').forEach(star=>{const x=+star.getAttribute('cx'),y=+star.getAttribute('cy'),r=+star.getAttribute('r');if(![x,y,r].every(Number.isFinite))return;ctx.fillStyle='rgba(235,243,255,.86)';ctx.shadowColor='rgba(220,235,255,.5)';ctx.shadowBlur=3;ctx.beginPath();ctx.arc(sx(x),sy(y),Math.max(2.2,r*scale*.52),0,Math.PI*2);ctx.fill();});
    const halo=svg.querySelector('circle.target-halo');
    if(halo){const x=+halo.getAttribute('cx'),y=+halo.getAttribute('cy');if(Number.isFinite(x)&&Number.isFinite(y)){const tx=sx(x),ty=sy(y);const rgb=hexToRgb(v.color);const g=ctx.createRadialGradient(tx,ty,0,tx,ty,72);g.addColorStop(0,`rgba(${rgb.join(',')},.46)`);g.addColorStop(.36,`rgba(${rgb.join(',')},.17)`);g.addColorStop(1,`rgba(${rgb.join(',')},0)`);ctx.fillStyle=g;ctx.fillRect(tx-80,ty-80,160,160);canvasSparkle(ctx,tx,ty,34,v.color);}}
    else canvasSparkle(ctx,cx,cy,34,v.color);
    ctx.restore();
  }

  function buildSummarySync(key){
    const r=RESULTS[key],v=VISUALS[key],W=1500,H=2000,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
    paintStarfield(ctx,W,H);
    const [rr,gg,bb]=hexToRgb(v.color);const glow=ctx.createRadialGradient(W*.5,455,20,W*.5,455,560);glow.addColorStop(0,`rgba(${rr},${gg},${bb},.21)`);glow.addColorStop(.48,`rgba(${rr},${gg},${bb},.06)`);glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,1130);
    drawRenderedConstellation(ctx,W/2,465,1260,760,key);
    ctx.textAlign='center';ctx.fillStyle='#f8fafc';ctx.font='700 88px sans-serif';ctx.fillText(r.name,W/2,1220);
    ctx.fillStyle='#cbd6e6';ctx.font='600 43px sans-serif';drawCentered(ctx,r.tag,W/2,1310,1110,60);
    ctx.strokeStyle=`rgba(${rr},${gg},${bb},.24)`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(235,1492);ctx.lineTo(W-235,1492);ctx.stroke();
    ctx.fillStyle='#b7c6d9';ctx.font='700 35px sans-serif';ctx.fillText('고려대학교 아마추어 천문회 KUAAA · STELLAR 16',W/2,1615);
    ctx.fillStyle='#93a6bf';ctx.font='25px sans-serif';ctx.fillText('Korea University Amateur Astronomical Association',W/2,1670);
    ctx.fillStyle='#8298b4';ctx.font='23px sans-serif';ctx.fillText('Instagram @koreauniv_aaa  ·  Kakao Channel @kuaaa',W/2,1722);
    return canvas;
  }

  function nativeSaveClick(event){
    let key=null;try{key=state.currentResult;}catch(_){}
    if(!key){event.preventDefault();toast('결과를 먼저 확인해 주세요.');return;}
    try{
      const link=event.currentTarget;link.textContent='이미지 만드는 중…';
      const canvas=buildSummarySync(key);let dataUrl=canvas.toDataURL('image/png');
      const r=RESULTS[key];const filename=`Stellar16_${r.name.replace(/\(.+?\)/,'').trim()}.png`;
      if(/SamsungBrowser/i.test(navigator.userAgent||'')) dataUrl=dataUrl.replace(/^data:image\/png/,'data:application/octet-stream');
      link.href=dataUrl;link.download=filename;link.setAttribute('download',filename);
      setTimeout(()=>{link.textContent='이미지로 저장하기';link.href='#';},800);
    }catch(err){event.preventDefault();console.error(err);event.currentTarget.textContent='이미지로 저장하기';toast('이미지를 만들지 못했어요. 페이지를 새로고침해 주세요.');}
  }

  const old=$('saveSummaryImageButton');
  if(old){const link=old.cloneNode(true);old.replaceWith(link);link.removeAttribute('disabled');link.setAttribute('aria-disabled','false');link.textContent='이미지로 저장하기';link.href='#';link.addEventListener('click',nativeSaveClick);}

  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js?v=7.6',{updateViaCache:'none'}).catch(()=>{});}
})();
