const CACHE = "crt-elite-v6-17";
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
      /* PERMANENCIA (Rey): antes TODAS las alarmas usaban el mismo tag ("apex-tv"), y en Android
         una notificación con el mismo tag REEMPLAZA a la anterior -> si no la mirabas al momento,
         la siguiente la borraba y perdías los datos. Ahora cada aviso lleva un tag ÚNICO: se
         APILAN y se quedan en la bandeja hasta que TÚ las descartes. requireInteraction siempre
         true para que no se auto-descarten. */
      /* 🔁 v6.03: las REPETICIONES de una alarma insistente (repe) usan un tag FIJO — cada
         repetición REEMPLAZA a la anterior (con sonido nuevo por renotify) en vez de apilar
         20 copias. La alarma original conserva su tag único y se queda en la bandeja. */
      body: msg.body, tag: msg.repe ? "apex-insist" : (msg.tag || "apex") + "-" + Date.now(), renotify: true,
      icon: "./icon-192.png", badge: "./icon-192.png",
      vibrate: vibra, silent: false,
      requireInteraction: true,
      timestamp: Date.now(), data: { url: "./index.html", jobId: msg.jobId || "", kind: msg.kind || "", sym: msg.sym || "", tvint: msg.tvint || "", seed: msg.seed || "", ir: msg.ir || "" }
    });
  })());
});
/* 🔁 v6.03: cualquier toque o descarte de una notificación = "Rey ya está mirando el
   teléfono" -> se apaga la alarma insistente en el worker (inofensivo si no hay ninguna). */
function insistVisto(){ return fetch(WORKER+"/insist/visto",{method:"POST"}).catch(()=>{}); }
self.addEventListener("notificationclose", e => { e.waitUntil(insistVisto()); });
/* Al tocar una notificación de Roberto, abre/enfoca la app */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(insistVisto());
  const tag=(e.notification.tag||"");
  const data=e.notification.data||{};
  /* 🎯 DESTINO DEL AVISO: si el aviso trae un "ir", abre Apex DIRECTAMENTE ahí —
     una sección (hoy, arranque, diario…) o una acción de Roberto (memoria, parte,
     gonogo…). Si la app ya está abierta, le manda el destino sin recargarla. */
  if(data.ir){
    const destino="./index.html?ir="+encodeURIComponent(data.ir);
    e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs => {
      for(const c of cs){ if("focus" in c){ if(c.postMessage) c.postMessage({type:"apex-ir", ir:data.ir}); return c.focus(); } }
      if(clients.openWindow) return clients.openWindow(destino);
    }));
    return;
  }
  /* 🔔 v6.17 (Rey): la alarma de trading abre APEX en el HILO DEL DÍA — ya NO la web de
     TradingView. Abrir el gráfico web desde el teléfono ROBABA la única conexión del layout
     y congelaba el gráfico de la PC ("si está desconectado no se debe leer nada"). Si Rey
     quiere ver el gráfico, abre él mismo la app de TradingView del teléfono. En el hilo
     están todos los avisos de hoy en orden y Roberto lee el último en voz alta (si su voz
     está encendida en ⚙️ del chat). */
  if(data.sym){
    const destino = "./index.html?ir="+encodeURIComponent("rob:hilo");
    e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs => {
      for(const c of cs){ if("focus" in c){ if(c.postMessage) c.postMessage({type:"apex-ir", ir:"rob:hilo"}); return c.focus(); } }
      if(clients.openWindow) return clients.openWindow(destino);
    }));
    return;
  }
  const esChat = tag.indexOf("apex-chat")===0 || data.kind==="chat";   // respuesta de Roberto → abrir el chat
  const jobId = data.jobId || "";
  const seed = data.seed || "";   // eval_dia / eval_semana → Roberto evalúa solo al abrir
  const url = esChat ? ("./index.html?open=chat"+(jobId?("&job="+encodeURIComponent(jobId)):"")+(seed?("&seed="+encodeURIComponent(seed)):"")) : "./index.html";
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs => {
    for(const c of cs){ if("focus" in c){ if(esChat && c.postMessage) c.postMessage({type:"apex-open-chat", jobId, seed}); return c.focus(); } }
    if(clients.openWindow) return clients.openWindow(url);
  }));
});
self.addEventListener("install", e => {
  /* Baja los archivos FRESCOS del servidor (cache:"reload" salta la caché HTTP del
     navegador). Antes se usaba addAll, que reutilizaba la copia vieja del navegador y
     por eso el app.js se quedaba desactualizado aunque cambiara la versión. */
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(FILES.map(f =>
      fetch(f, { cache: "reload" }).then(r => { if (r && r.ok) return c.put(f, r); }).catch(()=>{})
    ));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if(e.request.method!=="GET") return;
  /* Archivos propios (mismo origen: app.js, index.html, data.js…): SIEMPRE revalida
     con el servidor (no-cache) para no volver a servir una versión vieja. El resto
     (imágenes, etc.) va normal. Sin conexión, cae a la caché. */
  const sameOrigin = new URL(e.request.url).origin === self.location.origin;
  const opts = sameOrigin ? { cache: "no-cache" } : undefined;
  e.respondWith(
    fetch(e.request, opts).then(r=>{
      const cp=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html")))
  );
});
