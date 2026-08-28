const CACHE = "crt-elite-v6-20";
const FILES = ["./","./index.html","./data.js","./app.js","./manifest.json","./icon-192.png","./icon-512.png"];
const WORKER = "https://elitepro-worker.reiniercainet9.workers.dev";
/* Web Push: al llegar un aviso (con la app CERRADA), muestra la notificación.
   El push viaja sin datos; el texto real se pide a la nube.
   📬 v6.19 (Rey, 28-08: el "🤖 ENTRÉ" del Ejecutor nunca se mostró): antes el texto salía
   de UNA casilla única (/push/latest) — con 3 avisos en 26 segundos, la casilla ya tenía
   otro y el aviso del medio se PERDÍA. Ahora el SW pide la COLA (/push/pending) y muestra
   TODO lo que aún no enseñó (recuerda los ids ya mostrados en el almacén del SW); si un
   despertar llega con la cola atrasada, el siguiente recoge lo pendiente. Ningún aviso se
   pierde. /push/latest queda como paracaídas. */
const META_CACHE = "apex-push-meta";
async function idsMostrados(){ try{ const c=await caches.open(META_CACHE); const r=await c.match("./__mostrados"); return r ? await r.json() : []; }catch(_){ return []; } }
async function guardarMostrados(ids){ try{ const c=await caches.open(META_CACHE); await c.put("./__mostrados", new Response(JSON.stringify(ids.slice(-40)))); }catch(_){} }
async function pintarAviso(msg){
  const esRutina = msg.kind==="rem";
  const fuerte = !!msg.strong;
  /* Vibración distinta para los avisos de rutina (⏰) vs las alarmas de trading */
  const vibra = esRutina ? (fuerte ? [500,150,500,150,500,150,500] : [400,140,400]) : [220,90,220,90,320];
  await self.registration.showNotification(msg.title || "Apex", {
    /* PERMANENCIA (Rey): cada aviso con tag ÚNICO (su id de la cola) -> se APILAN y quedan
       en la bandeja hasta que TÚ los descartes; si el mismo id llegara dos veces, se
       REEMPLAZA a sí mismo (cero duplicados). Las repeticiones 🔁 de una insistente usan
       el tag FIJO "apex-insist" (cada una reemplaza a la anterior con sonido nuevo). */
    body: msg.body, tag: msg.repe ? "apex-insist" : (msg.id ? "apex-" + msg.id : (msg.tag || "apex") + "-" + Date.now()), renotify: true,
    icon: "./icon-192.png", badge: "./icon-192.png",
    vibrate: vibra, silent: false,
    requireInteraction: true,
    timestamp: msg.ts || Date.now(), data: { url: "./index.html", jobId: msg.jobId || "", kind: msg.kind || "", sym: msg.sym || "", tvint: msg.tvint || "", seed: msg.seed || "", ir: msg.ir || "" }
  });
}
self.addEventListener("push", e => {
  e.waitUntil((async () => {
    const vistos = await idsMostrados();
    let porMostrar = [];
    try{
      const r = await fetch(WORKER+"/push/pending",{cache:"no-store"});
      if(r.ok){
        const d = await r.json();
        porMostrar = ((d && d.avisos) || []).filter(m => m && m.id && m.body && !vistos.includes(m.id));
        /* de las repeticiones 🔁 pendientes solo SUENA la última (las viejas se dan por vistas) */
        const repes = porMostrar.filter(m => m.repe);
        if(repes.length > 1){
          const ult = repes[repes.length-1];
          porMostrar.filter(m => m.repe && m !== ult).forEach(m => vistos.push(m.id));
          porMostrar = porMostrar.filter(m => !m.repe || m === ult);
        }
      }
    }catch(_){}
    if(!porMostrar.length){
      /* paracaídas: worker viejo o cola atrasada — el camino de siempre */
      let msg = { title: "Apex · Roberto", body: "Tienes un aviso." };
      try{ if(e.data){ const d=e.data.json(); if(d && d.body) msg=d; } }catch(_){}
      if(msg.body==="Tienes un aviso."){
        try{ const r=await fetch(WORKER+"/push/latest",{cache:"no-store"}); if(r.ok){ const d=await r.json(); if(d && d.body) msg=d; } }catch(_){}
      }
      if(msg.id && vistos.includes(msg.id)){ await guardarMostrados(vistos); return; }   /* ya mostrado: no resucitar */
      porMostrar = [msg];
    }
    for(const msg of porMostrar){
      await pintarAviso(msg);
      if(msg.id) vistos.push(msg.id);
    }
    await guardarMostrados(vistos);
  })());
});
/* 🔁 v6.03: cualquier toque o descarte de una notificación = "Rey ya está mirando el
   teléfono" -> se apaga la alarma insistente en el worker (inofensivo si no hay ninguna).
   🔇 v6.18 (Rey: "cuando lo toco o descarto, que NO suene más"): antes el aviso al worker
   viajaba UNA sola vez — si esa petición fallaba (red del móvil, llamada en curso), el
   "ya la vi" se perdía y la alarma seguía insistiendo. Ahora reintenta hasta 3 veces. */
function insistVisto(){
  const post=()=>fetch(WORKER+"/insist/visto",{method:"POST"});
  return post()
    .catch(()=>new Promise(r=>setTimeout(r,1500)).then(post))
    .catch(()=>new Promise(r=>setTimeout(r,4000)).then(post))
    .catch(()=>{});
}
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
  /* 📬 v6.19: META_CACHE (los ids de avisos ya mostrados) SOBREVIVE a las actualizaciones —
     si se borrara, tras cada versión nueva el teléfono podría re-mostrar avisos viejos. */
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k=>k!==CACHE && k!==META_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
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
