const CACHE = "crt-elite-v5-8";
const FILES = ["./","./index.html","./data.js","./app.js","./manifest.json","./icon-192.png","./icon-512.png"];
const WORKER = "https://elitepro-worker.reiniercainet9.workers.dev";
/* Web Push: al llegar un aviso (con la app CERRADA), muestra la notificación.
   El push viaja sin datos; el texto real lo pide al puente (/push/latest). */
self.addEventListener("push", e => {
  e.waitUntil((async () => {
    let msg = { title: "Apex · Roberto", body: "Tienes un aviso." };
    try{ if(e.data){ const d=e.data.json(); if(d && d.body) msg={title:d.title||msg.title, body:d.body, tag:d.tag}; } }catch(_){}
    if(msg.body==="Tienes un aviso."){
      try{
        const r=await fetch(WORKER+"/push/latest",{cache:"no-store"});
        if(r.ok){ const d=await r.json(); if(d && d.body) msg={title:d.title||msg.title, body:d.body, tag:d.tag}; }
      }catch(_){}
    }
    await self.registration.showNotification(msg.title, {
      body: msg.body, tag: msg.tag || "apex", renotify: true,
      icon: "./icon-192.png", badge: "./icon-192.png",
      vibrate: [120,60,120,60,220], data: { url: "./index.html" }
    });
  })());
});
/* Al tocar una notificación de Roberto, abre/enfoca la app */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs => {
    for(const c of cs){ if("focus" in c) return c.focus(); }
    if(clients.openWindow) return clients.openWindow("./index.html");
  }));
});
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if(e.request.method!=="GET") return;
  e.respondWith(
    fetch(e.request).then(r=>{
      const cp=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html")))
  );
});
