const CACHE = "crt-elite-v5-18";
const FILES = ["./","./index.html","./data.js","./app.js","./manifest.json","./icon-192.png","./icon-512.png"];
const WORKER = "https://elitepro-worker.reiniercainet9.workers.dev";
/* Web Push: al llegar un aviso (con la app CERRADA), muestra la notificación.
   El push viaja sin datos; el texto real lo pide al puente (/push/latest). */
self.addEventListener("push", e => {
  e.waitUntil((async () => {
    let msg = { title: "Apex · Roberto", body: "Tienes un aviso." };
    try{ if(e.data){ const d=e.data.json(); if(d && d.body) msg=d; } }catch(_){}
    if(msg.body==="Tienes un aviso."){
      try{
        const r=await fetch(WORKER+"/push/latest",{cache:"no-store"});
        if(r.ok){ const d=await r.json(); if(d && d.body) msg=d; }
      }catch(_){}
    }
    const esRutina = msg.kind==="rem";
    const fuerte = !!msg.strong;
    /* Vibración distinta para los avisos de rutina (⏰) vs las alarmas de trading */
    const vibra = esRutina ? (fuerte ? [500,150,500,150,500,150,500] : [400,140,400]) : [220,90,220,90,320];
    await self.registration.showNotification(msg.title || "Apex", {
      body: msg.body, tag: msg.tag || "apex", renotify: true,
      icon: "./icon-192.png", badge: "./icon-192.png",
      vibrate: vibra, silent: false,
      requireInteraction: esRutina ? fuerte : true,
      timestamp: Date.now(), data: { url: "./index.html" }
    });
  })());
});
/* Acceso rápido FIJO de Roberto (notificación persistente con botones) */
const PIN_TITLE = "🧠 Roberto · Apex";
const PIN_OPTS = {
  body: "Toca 💬 para hablar con Roberto, o entra directo a una sección.",
  tag: "apex-pin", renotify: false, silent: true, requireInteraction: true,
  icon: "./icon-192.png", badge: "./icon-192.png",
  actions: [
    { action: "roberto", title: "💬 Roberto" },
    { action: "diario",  title: "📒 Registrar" },
    { action: "cuentas", title: "🏦 Cuentas" }
  ]
};
/* Al tocar una notificación (o un botón), abre/enfoca la app en la sección correcta */
self.addEventListener("notificationclick", e => {
  const isPin = e.notification.tag === "apex-pin";
  const go = e.action || (isPin ? "roberto" : "");
  e.notification.close();
  e.waitUntil((async () => {
    // Si era el acceso fijo, lo volvemos a mostrar para que siga anclado
    if (isPin) { try { await self.registration.showNotification(PIN_TITLE, PIN_OPTS); } catch(_){} }
    const cs = await clients.matchAll({ type:"window", includeUncontrolled:true });
    for (const c of cs) {
      if ("focus" in c) { try{ await c.focus(); }catch(_){}
        if (go) { try{ c.postMessage({ type:"apexGo", go }); }catch(_){} }
        return;
      }
    }
    if (clients.openWindow) return clients.openWindow("./index.html" + (go ? ("?go=" + go) : ""));
  })());
});
/* La app puede pedirle al SW que muestre/oculte el acceso fijo */
self.addEventListener("message", e => {
  const d = e.data || {};
  if (d.type === "pinShow") self.registration.showNotification(PIN_TITLE, PIN_OPTS);
  if (d.type === "pinHide") self.registration.getNotifications({ tag:"apex-pin" }).then(ns => ns.forEach(n => n.close()));
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
