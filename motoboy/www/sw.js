/* Solo para la versión WEB (en la APK todo va ya dentro del paquete y esto no se usa).
   Guarda la app en el teléfono para que abra sin internet. */
const CACHE='motoboy-v2.0';
const ARCHIVOS=['./','index.html','manifest.json','vendor/html5-qrcode.min.js','icon-192.png','icon-512.png','icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* Red primero (así ves siempre la última versión) y, sin conexión, lo guardado. */
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});return r})
    .catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
});
