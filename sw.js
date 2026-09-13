const CACHE='stellar16-v7.0';
const LOCAL=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./data/western-stellar16.json','./data/stars-stellar16.csv'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(LOCAL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return resp;}).catch(()=>{if(e.request.mode==='navigate')return caches.match('./index.html');throw new Error('offline');})));});
