(()=>{
  'use strict';
  const $=id=>document.getElementById(id);

  function goHome(){
    try{if(typeof state!=='undefined')state.lastView='intro';}catch(_){}
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    const intro=$('introView');if(intro)intro.classList.add('active');
    document.title='Stellar 16 — 당신을 닮은 별';
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function replaceButton(id,handler){const old=$(id);if(!old)return null;const fresh=old.cloneNode(true);old.replaceWith(fresh);fresh.addEventListener('click',handler);return fresh;}

  // All-types page back arrow always returns to the first page.
  replaceButton('typesBackButton',goHome);

  // Brand also always returns to the first page from archive/detail views.
  const brand=$('brandButton');
  if(brand){const fresh=brand.cloneNode(true);brand.replaceWith(fresh);fresh.addEventListener('click',goHome);}

  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js?v=7.7',{updateViaCache:'none'}).catch(()=>{});}
})();
