// Export-card renderer override: keeps the closing one-line review centered and unboxed.
async function saveResultImageV2(){
  if(!state.currentResult)return;
  const key=state.currentResult,r=RESULTS[key],v=VISUALS[key];
  const W=1400,P=100,TW=W-P*2;
  const measure=document.createElement('canvas').getContext('2d');
  measure.font='28px sans-serif';
  const countLines=t=>{const words=t.replace(/\*\*/g,'').split(/\s+/);let line='',n=1;for(const word of words){const test=line?line+' '+word:word;if(measure.measureText(test).width>TW&&line){n++;line=word}else line=test;}return n;};
  const bodyLines=r.paras.reduce((s,p)=>s+countLines(p),0)+countLines(r.closing);
  const H=Math.max(2300,780+bodyLines*47+530);
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');paintStarfield(ctx,W,H);
  const [rr,gg,bb]=hexToRgb(v.color);
  const tg=ctx.createRadialGradient(W*.22,330,20,W*.22,330,300);tg.addColorStop(0,`rgba(${rr},${gg},${bb},.17)`);tg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=tg;ctx.fillRect(0,0,W,680);
  await canvasConstellation(ctx,W/2,300,760,360,key);
  ctx.textAlign='center';ctx.fillStyle='#f8fafc';ctx.font='700 58px sans-serif';ctx.fillText(r.name,W/2,610);
  ctx.fillStyle='#cbd6e6';ctx.font='500 31px sans-serif';ctx.fillText(r.tag,W/2,666);

  ctx.textAlign='left';let y=770;ctx.font='28px sans-serif';ctx.fillStyle='#d7e0ec';
  for(const p of r.paras){y=drawWrappedText(ctx,p,P,y,TW,47)+30;}

  y+=14;
  ctx.strokeStyle=`rgba(${rr},${gg},${bb},.30)`;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(P+105,y);ctx.lineTo(W-P-105,y);ctx.stroke();
  y+=46;
  ctx.textAlign='center';ctx.fillStyle='#f7f9fd';ctx.font='700 30px sans-serif';
  const closingWords=r.closing.replace(/\*\*/g,'').split(/\s+/);let line='',lines=[];
  for(const word of closingWords){const test=line?line+' '+word:word;if(ctx.measureText(test).width>TW-180&&line){lines.push(line);line=word;}else line=test;}
  if(line)lines.push(line);
  lines.forEach((text,i)=>ctx.fillText(text,W/2,y+i*49));
  y+=lines.length*49+31;
  ctx.strokeStyle=`rgba(${rr},${gg},${bb},.18)`;ctx.beginPath();ctx.moveTo(P+105,y);ctx.lineTo(W-P-105,y);ctx.stroke();
  y+=46;

  ctx.textAlign='left';ctx.strokeStyle='rgba(220,235,255,.17)';ctx.strokeRect(P,y,TW,150);
  ctx.fillStyle='#94a8c2';ctx.font='600 21px sans-serif';ctx.fillText('잘 맞는 별',P+26,y+38);ctx.fillText('어색한 별',W/2+26,y+38);
  ctx.fillStyle='#f2f6fc';ctx.font='700 25px sans-serif';ctx.fillText(r.good,P+26,y+86);ctx.fillText(r.awk,W/2+26,y+86);

  ctx.fillStyle='#91a3bc';ctx.font='700 20px sans-serif';ctx.textAlign='center';ctx.fillText('고려대학교 아마추어 천문회 KUAAA',W/2,H-105);
  ctx.font='16px sans-serif';ctx.fillStyle='#667892';ctx.fillText('Instagram @koreauniv_aaa  ·  Kakao Channel @kuaaa',W/2,H-72);
  ctx.font='15px sans-serif';ctx.fillStyle='#5f728f';ctx.fillText('Korea University Amateur Astronomical Association · STELLAR 16',W/2,H-43);

  canvas.toBlob(blob=>{
    if(!blob)return;
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`Stellar16_${r.name.replace(/\(.+?\)/,'').trim()}.png`;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);showToast('결과 이미지를 만들었어요.');
  },'image/png');
}

(()=>{
  const oldButton=document.getElementById('saveImageButton');
  if(!oldButton)return;
  const newButton=oldButton.cloneNode(true);
  oldButton.replaceWith(newButton);
  newButton.addEventListener('click',saveResultImageV2);
})();
