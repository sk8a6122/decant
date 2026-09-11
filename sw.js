// Only Decant's static files are cached; catalog requests stay online.
const CACHE='decant-shell-7ab7deae5251';
const FILES=["./index.html","./catalog-config.js","./assets/app-7e1f53682cc2.js","./assets/app-dccdae337d78.css","./assets/wine-editorial-800.webp","./assets/wine-editorial-1600.webp"];
const urls=FILES.map(file=>new URL(file,self.registration.scope).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(urls))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('decant-shell-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(event.request.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===scope.pathname+'index.html')){
  event.respondWith((async()=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),2000);try{const response=await fetch(event.request,{signal:controller.signal});if(response.ok)return response;}catch{}finally{clearTimeout(timer)}return (await caches.open(CACHE)).match(urls[0]);})());return;
 }
 if(urls.includes(url.href))event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))||fetch(event.request)));
});
