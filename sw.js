const CACHE = "crt-elite-v7-34";
const FILES = ["./","./index.html","./data.js","./app.js","./roberto.js","./situaciones.js","./manifest.json","./icon-192.png","./icon-512.png"];
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
/* 🔕 v6.22 DETECTOR DE DESCARTE (Rey: "lo descarto y sigue sonando"): en muchos Android,
   descartar desde la pantalla de bloqueo NO entrega el evento de descarte al sistema
   (batería restringida se lo traga) y el "ya la vi" jamás sale del teléfono. El PUSH sí
   llega SIEMPRE — así que lo usamos de detector: si mostramos una repetición 🔁 y al llegar
   la siguiente YA NO está en la bandeja, es que Rey la quitó → mandamos "ya la vi" y NO
   volvemos a sonar. A lo sumo suena UNA repetición de más, nunca seis. */
async function repeViva(){ try{ const c=await caches.open(META_CACHE); const r=await c.match("./__repeviva"); return r ? await r.json() : null; }catch(_){ return null; } }
async function marcarRepeViva(v){ try{ const c=await caches.open(META_CACHE); await c.put("./__repeviva", new Response(JSON.stringify(v))); }catch(_){} }
/* ventana de silencio: {hasta, firma} — 15 min sin sonar las repes de ESA insistencia
   (por su firma de texto); una alarma NUEVA con texto distinto insiste normal. */
async function silencioLeer(){ try{ const c=await caches.open(META_CACHE); const r=await c.match("./__silencio"); return r ? await r.json() : null; }catch(_){ return null; } }
async function silencioPoner(firma){ try{ const c=await caches.open(META_CACHE); await c.put("./__silencio", new Response(JSON.stringify({ hasta: Date.now() + 15*60000, firma: String(firma||"").slice(0,40) }))); }catch(_){} }
function firmaDe(body){ return String(body||"").slice(0,40); }
/* ✏️ LA CARA DE ROBERTO EN CADA AVISO (Rey: "que él salga en los avisos que envía, solo su
   cara con el gesto y la señal correspondiente al aviso"). Las caritas son PNG generadas
   del MISMO personaje de roberto.js y viven en ./caras/.
   🧩 v6.82 — EL GESTO YA NO SE DECIDE AQUÍ. Este archivo tenía su propia lista y se había
   quedado atrás: una operación PERDIDA ("CERRÉ · GBPUSD ❌ SL") salía en el teléfono con la
   cara de CELEBRAR, y el "Reset de disciplina" de Rey con cara de preocupado. Ahora se lee
   la MISMA tabla que usa su cuerpo en pantalla, así que el aviso del teléfono y Roberto
   dicen siempre lo mismo. Si el archivo no cargara, cae al icono de siempre: un aviso
   jamás se pierde por una imagen. */
importScripts("./situaciones.js");
function caraDe(msg){
  try{ return "./" + robCaraDe((msg&&msg.title)||"", (msg&&msg.body)||"", (msg&&msg.kind)||""); }
  catch(_){ return "./icon-192.png"; }
}

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
    icon: caraDe(msg), badge: "./icon-192.png",   /* ✏️ v6.46: su carita con el gesto del aviso */
    vibrate: vibra, silent: false,
    requireInteraction: true,
    timestamp: msg.ts || Date.now(), data: { url: "./index.html", jobId: msg.jobId || "", kind: msg.kind || "", sym: msg.sym || "", tvint: msg.tvint || "", seed: msg.seed || "", ir: msg.ir || "", texto: (msg.texto || "").slice(0, 4000) }
  });
  /* ✏️ v6.47 — y si Apex está ABIERTA, que el CUERPO de Roberto lo exprese al instante:
     cambia de gesto y lo cuenta en su nubecita, sin que Rey tenga que entrar al chat. */
  try {
    const cs = await clients.matchAll({ type: "window", includeUncontrolled: true });
    cs.forEach(c => { try { c.postMessage({ type: "apex-roberto", title: msg.title || "", body: msg.body || "", ir: msg.ir || "", strong: !!msg.strong, kind: msg.kind || "" }); } catch (_) {} });
  } catch (_) {}
}
self.addEventListener("push", e => {
  e.waitUntil((async () => {
    const vistos = await idsMostrados();
    /* 🔕 v6.22: ¿mostramos una repetición 🔁 y ya no está en la bandeja? Rey la descartó
       (aunque su teléfono nunca nos avisara) → "ya la vi" al worker + 15 min de silencio
       para las repes de ESA insistencia (por su firma de texto). */
    try{
      const rv = await repeViva();
      if(rv && rv.viva){
        const enBandeja = await self.registration.getNotifications({ tag: "apex-insist" });
        if(!enBandeja.length){ await silencioPoner(rv.firma); await marcarRepeViva(null); insistVisto(); }
      }
    }catch(_){}
    let silencio = null;
    try{ silencio = await silencioLeer(); if(silencio && Date.now() > (silencio.hasta||0)) silencio = null; }catch(_){}
    let porMostrar = [], mandaApk = false;
    try{
      const r = await fetch(WORKER+"/push/pending",{cache:"no-store"});
      if(r.ok){
        const d = await r.json();
        /* 📱 v6.91 — ¿MANDA LA APK? Rey eligió que sí. Si su vigía dio señales de vida hace
           menos de 12 minutos, ya está él avisando y esta web NO pinta nada (los avisos se
           dan por vistos para que no se amontonen y salgan de golpe más tarde).
           El dato viene en esta misma respuesta: ni una consulta de más. */
        try{
          const v = d && d.apkViva;
          mandaApk = !!(v && v.vivo && typeof v.haceSeg === "number" && v.haceSeg >= 0 && v.haceSeg < 720);
        }catch(_){ mandaApk = false; }   /* ante la duda, avisa la web: mejor doble que ninguno */
        porMostrar = ((d && d.avisos) || []).filter(m => m && m.id && m.body && !vistos.includes(m.id));
        /* repes bajo ventana de silencio (misma firma que la descartada): vistas y mudas */
        if(silencio){
          porMostrar.filter(m => m.repe && firmaDe(m.body) === silencio.firma).forEach(m => vistos.push(m.id));
          porMostrar = porMostrar.filter(m => !(m.repe && firmaDe(m.body) === silencio.firma));
        }
        /* de las repeticiones 🔁 pendientes solo SUENA la última (las viejas se dan por vistas) */
        const repes = porMostrar.filter(m => m.repe);
        if(repes.length > 1){
          const ult = repes[repes.length-1];
          porMostrar.filter(m => m.repe && m !== ult).forEach(m => vistos.push(m.id));
          porMostrar = porMostrar.filter(m => !m.repe || m === ult);
        }
      }
    }catch(_){}
    /* 💬 v6.23 (Rey): si Apex está ABIERTA EN PANTALLA, las respuestas del chat NO suenan
       como notificación — van DIRECTO a la app (al chat si está abierto, o al banner 🛡️ de
       Roberto si está en otra sección). La notificación clásica queda para app cerrada o
       de fondo — y esa, al tocarla, abre EL MISMO chat de esa conversación (jobId). */
    let entregadoEnApp = 0;
    try{
      const cs = await clients.matchAll({ type: "window", includeUncontrolled: true });
      const visible = cs.find(c => c.visibilityState === "visible") || null;
      if(visible){
        const chats = porMostrar.filter(m => m.kind === "chat");
        chats.forEach(m => {
          /* 📦 v6.24: el aviso lleva la RESPUESTA COMPLETA (texto) — la app la pinta al
             instante sin depender del almacén de la nube (clave en 4G/otro colo). */
          try{ visible.postMessage({ type: "apex-chat-live", jobId: m.jobId || "", title: m.title || "", body: m.body || "", seed: m.seed || "", texto: m.texto || "", toolUse: !!m.toolUse }); entregadoEnApp++; }catch(_){}
          if(m.id) vistos.push(m.id);
        });
        if(chats.length) porMostrar = porMostrar.filter(m => m.kind !== "chat");
      }
    }catch(_){}
    /* 📱 v6.91 — MANDA LA APK: aquí se calla. Lo que va DENTRO de la app (las respuestas
       del chat, arriba) ya se entregó y eso sigue igual — lo que no se hace es sacar la
       notificación al teléfono, que es lo que llegaría por duplicado. */
    if(mandaApk && porMostrar.length){
      porMostrar.forEach(m => { if(m.id) vistos.push(m.id); });
      await guardarMostrados(vistos);
      return;
    }
    if(!porMostrar.length){
      if(entregadoEnApp){ await guardarMostrados(vistos); return; }   /* ya entregado dentro de la app */
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
      if(msg.repe) await marcarRepeViva({ viva: true, firma: firmaDe(msg.body) });   /* 🔕 v6.22 */
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
self.addEventListener("notificationclose", e => { e.waitUntil((async()=>{ try{ if((e.notification&&e.notification.tag)==="apex-insist") await silencioPoner(firmaDe(e.notification.body)); }catch(_){} await marcarRepeViva(null); await insistVisto(); })()); });
/* Al tocar una notificación de Roberto, abre/enfoca la app */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil((async()=>{ try{ if((e.notification&&e.notification.tag)==="apex-insist") await silencioPoner(firmaDe(e.notification.body)); }catch(_){} await marcarRepeViva(null); await insistVisto(); })());
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
    for(const c of cs){ if("focus" in c){ if(esChat && c.postMessage) c.postMessage({type:"apex-open-chat", jobId, seed, texto: data.texto || ""}); return c.focus(); } }
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
