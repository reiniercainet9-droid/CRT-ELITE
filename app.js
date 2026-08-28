/* ============================================================
   CRT ELITE v3 — MOTOR
   ============================================================ */

/* ---------- STORAGE ---------- */
const K = {
  trades : "crtelite_trades_v2",
  chk    : "crtelite_chk_v2",
  conf   : "crtelite_conf_v2",
  reglas : "crtelite_reglas_v2",
  bal    : "crtelite_balance_v2",
  ctx    : "crtelite_ctx_v3",
  estr   : "crtelite_estrategias_v3",
  estrdef: "crtelite_estrdefs_v1",
  iaurl  : "crtelite_iaurl_v3",
  iachat : "crtelite_iachat_v3",
  iaconvs: "crtelite_iaconvs_v3",
  iaact  : "crtelite_iaact_v3",
  iavoz  : "crtelite_iavoz_v3",
  cuentas: "crtelite_cuentas_v3",
  fabpos : "crtelite_fabpos_v3",
  notif  : "crtelite_notif_v3",
  pares  : "crtelite_pares_v3",
  notiflog:"crtelite_notiflog_v3",
  calpares:"crtelite_calpares_v3",
  reminders:"crtelite_reminders_v3",
  vigila:"crtelite_vigila_v3",
  robertolog:"crtelite_robertolog_v3",
  shots:"crtelite_shots_v1",
  vents:"crtelite_ventanas_v1",
  plansem:"crtelite_plansem_v1",
  plan:"crtelite_plan_v1",
  vered:"crtelite_vered_v1",
  ejec:"crtelite_ejectrades_v1"
};
const load = (k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } };
const save = (k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); nubeMarcar(); }catch(e){ toast("No se pudo guardar"); } };

/* ============================================================
   ☁️ RESPALDO EN LA NUBE — recupera Apex en CUALQUIER teléfono
   Sube TODOS los registros al Worker bajo el CÓDIGO de respaldo de Rey.
   En otro móvil, con el mismo código, restaura todo intacto (nada se pierde).
   No usa claves del sistema (el repo es público): el código ES la llave.
   ============================================================ */
const NUBE_KEYS = ["crtelite_trades_v2","crtelite_cuentas_v3","crtelite_reminders_v3","crtelite_chk_v2","crtelite_conf_v2","crtelite_reglas_v2","crtelite_balance_v2","crtelite_ctx_v3","crtelite_estrategias_v3","crtelite_estrdefs_v1","crtelite_pares_v3","crtelite_calpares_v3","crtelite_notif_v3","crtelite_vigila_v3","crtelite_fabpos_v3","crtelite_iavoz_v3","crtelite_shots_v1","crtelite_ventanas_v1","crtelite_plansem_v1","crtelite_iaconvs_v3","crtelite_iaact_v3","crtelite_ejectrades_v1"];
const NUBE_CODE_KEY="crtelite_nubecode_v1", NUBE_TS_KEY="crtelite_datats_v1", NUBE_LAST_KEY="crtelite_nubelast_v1";
let NUBE_RESTAURANDO=false, _nubeTimer=null;
function nubeCode(){ try{ return (localStorage.getItem(NUBE_CODE_KEY)||"").trim(); }catch(_){ return ""; } }
function nubeTs(){ return parseInt(localStorage.getItem(NUBE_TS_KEY)||"0",10)||0; }
function nubeUrl(){ try{ return (typeof iaBase==="function")? iaBase() : "https://elitepro-worker.reiniercainet9.workers.dev"; }catch(_){ return "https://elitepro-worker.reiniercainet9.workers.dev"; } }
function nubeMarcar(){
  if(NUBE_RESTAURANDO) return;
  try{ localStorage.setItem(NUBE_TS_KEY,String(Date.now())); }catch(_){}
  if(!nubeCode()) return;
  clearTimeout(_nubeTimer); _nubeTimer=setTimeout(()=>{ nubeSubir(); }, 4000);
}
async function nubeSubir(){
  const code=nubeCode(); if(!code) return;
  try{
    const data={};
    NUBE_KEYS.forEach(k=>{ let v=localStorage.getItem(k); if(v==null) return;
      // El chat SÍ se respalda (para no perderlo al cambiar de equipo), pero SIN las imágenes
      // (son pesadas y efímeras) para no inflar el respaldo ni pasarnos del límite.
      if(k===K.iaconvs){ try{ const cs=JSON.parse(v); (cs||[]).forEach(c=>(c.msgs||[]).forEach(m=>{ if(m.img) delete m.img; })); v=JSON.stringify(cs); }catch(_){}}
      data[k]=v; });
    const ts=nubeTs()||Date.now();
    const r=await fetch(nubeUrl()+"/backup/set",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({code,ts,data})});
    if(r.ok){ const d=await r.json(); if(d && d.ok){ localStorage.setItem(NUBE_LAST_KEY,String(Date.now())); nubePintarEstado(); } }
  }catch(_){}
}
async function nubeRestaurar(auto){
  const code=nubeCode(); if(!code){ if(!auto) toast("Primero pon tu código de respaldo"); return; }
  try{
    const r=await fetch(nubeUrl()+"/backup/get",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({code})});
    if(!r.ok){ if(!auto) toast("No pude conectar con la nube"); return; }
    const d=await r.json(); const bk=d && d.backup;
    if(!bk || !bk.data || !bk.ts){ if(!auto) toast("No hay respaldo en la nube con ese código"); return; }
    const localTs=nubeTs();
    if(auto && localTs && localTs>=bk.ts) return; // lo local es igual o más nuevo: no toco nada
    if(!auto && localTs>bk.ts){ if(!confirm("Tu teléfono tiene datos MÁS nuevos que la nube. ¿Restaurar igualmente y reemplazarlos?")) return; }
    NUBE_RESTAURANDO=true;
    Object.keys(bk.data).forEach(k=>{ if(k.indexOf("crtelite_")===0){ try{ localStorage.setItem(k, bk.data[k]); }catch(_){}} });
    localStorage.setItem(NUBE_TS_KEY,String(bk.ts));
    NUBE_RESTAURANDO=false;
    toast("☁️ Restaurado desde la nube — recargando…");
    setTimeout(()=>location.reload(), 900);
  }catch(_){ if(!auto) toast("Error restaurando"); }
}
function nubePintarEstado(){
  const e=document.getElementById("nubeEstado"); if(!e) return;
  const code=nubeCode(); const last=parseInt(localStorage.getItem(NUBE_LAST_KEY)||"0",10);
  if(!code){ e.textContent="Sin código: el respaldo en la nube está apagado."; return; }
  e.textContent = last? ("✅ Último respaldo: "+new Date(last).toLocaleString()) : "Código puesto. Se respaldará al primer cambio.";
}
/* 📸 Capturas del gráfico: la app PIDE la foto (el Puente la saca y la sube). */
async function nubeShotReq(sym, id){ try{ await fetch(nubeUrl()+"/shot/req",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sym,id})}); }catch(_){}}
async function nubeShotGet(id){ try{ const r=await fetch(nubeUrl()+"/shot/get?id="+encodeURIComponent(id)); if(!r.ok) return null; const d=await r.json(); return (d&&d.img)?d.img:null; }catch(_){ return null; } }
async function nubeShotDel(ids){ try{ await fetch(nubeUrl()+"/shot/del",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({ids:Array.isArray(ids)?ids:[ids]})}); }catch(_){}}
function dataURLtoBlob(u){ const parts=String(u).split(","); const mime=(parts[0].match(/:(.*?);/)||[])[1]||"image/jpeg"; const bin=atob(parts[1]||""); const arr=new Uint8Array(bin.length); for(let k=0;k<bin.length;k++)arr[k]=bin.charCodeAt(k); return new Blob([arr],{type:mime}); }
/* Visor de foto DENTRO de Apex (no abre pestaña) con compartir/descargar/borrar */
async function abrirFoto(id, meta){
  const ov=el("div","foto-ov");
  ov.style.cssText="position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.93);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px";
  ov.innerHTML=`<div style="color:#ccc">Cargando…</div>`;
  document.body.appendChild(ov);
  const cerrar=()=>ov.remove();
  const img=await nubeShotGet(id);
  ov.innerHTML=(img?`<img src="${img}" style="max-width:100%;max-height:70vh;border-radius:10px;object-fit:contain">`:`<div style="color:#fff;text-align:center">No pude cargar la imagen.<br><span style="font-size:12px;color:#aaa">(Puede que aún se esté subiendo — reintenta en unos segundos.)</span></div>`)+
    `<div style="color:#bbb;font-size:12px;margin-top:8px">${esc(meta||"")}</div>
     <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:14px">
       <button class="btn" id="fShare">📤 Compartir</button>
       <button class="btn" id="fDown">⬇️ Descargar</button>
       <button class="btn danger" id="fDel">🗑️ Borrar</button>
       <button class="btn gold" id="fClose">Cerrar</button>
     </div>`;
  ov.onclick=(e)=>{ if(e.target===ov) cerrar(); };
  ov.querySelector("#fClose").onclick=cerrar;
  const down=()=>{ if(!img) return; const a=document.createElement("a"); a.href=img; a.download="apex_"+id+".jpg"; document.body.appendChild(a); a.click(); a.remove(); };
  ov.querySelector("#fDown").onclick=down;
  ov.querySelector("#fShare").onclick=async()=>{
    if(!img) return;
    try{
      const file=new File([dataURLtoBlob(img)],"apex_"+id+".jpg",{type:"image/jpeg"});
      if(navigator.canShare && navigator.canShare({files:[file]})) await navigator.share({files:[file], title:"Captura Apex", text:meta||"Captura de operación"});
      else { down(); toast("Tu teléfono no permite compartir la imagen directa; la descargué."); }
    }catch(_){}
  };
  ov.querySelector("#fDel").onclick=()=>{ if(!confirm("¿Borrar esta captura? Se quita de Apex y de la nube.")) return; borrarCaptura(id); cerrar(); };
}
function borrarCaptura(id){
  let cambio=false;
  const n=SHOTS.length; SHOTS=SHOTS.filter(s=>s.id!==id); if(SHOTS.length!==n){ save(K.shots,SHOTS); cambio=true; }
  TRADES.forEach(t=>{
    if(t.shotOpen===id){ delete t.shotOpen; cambio=true; }
    if(t.shotClose===id){ delete t.shotClose; cambio=true; }
    if(Array.isArray(t.shots) && t.shots.includes(id)){ t.shots=t.shots.filter(x=>x!==id); cambio=true; }
  });
  if(cambio) save(K.trades,TRADES);
  nubeShotDel(id);
  toast("Captura borrada");
  if(TAB==="galeria") renderGaleria();
}

let TRADES = load(K.trades, []);
let SHOTS  = load(K.shots, []);   // capturas sueltas (sin trade) para la Galería
let PLANSEM = load(K.plansem, null);  // plan de la semana (bias/zonas/invalidación) persistente
let CHK    = load(K.chk, {});
let CONF   = load(K.conf, {});
let RLEIDAS= load(K.reglas, {});
let BAL    = load(K.bal, {bal:6000, pct:0.5, pips:10});

/* Lista de estrategias registradas (nombres). Siempre existe "CRT Elite". */
let ESTRATEGIAS = load(K.estr, ["CRT Elite"]);
if(!ESTRATEGIAS.length) ESTRATEGIAS = ["CRT Elite"];
/* Definición EDITABLE por estrategia (para adaptar CRT y añadir estrategias nuevas —
   Oro, índices, acciones… — con su instrumento y sus reglas/ajustes propios).
   Mapa { "Nombre estrategia": { instrumento, ajustes } }. Roberto lee la de la activa. */
let ESTR_DEFS = load(K.estrdef, {});
if(!ESTR_DEFS || typeof ESTR_DEFS!=="object") ESTR_DEFS={};
function guardarEstrDefs(){ save(K.estrdef, ESTR_DEFS); }
/* Bloque de la ESTRATEGIA ACTIVA para Roberto: su instrumento y las reglas/ajustes
   editables. Así Roberto sigue la estrategia correcta (CRT u otra que Rey añada). */
/* 🔍 PENDIENTES / COSAS A MEDIAS — Roberto recuerda lo inconcluso (los chats que él o Rey
   marcan con 🔍 "Por revisar"). Se inyecta en su contexto para que no se pierda nada y pueda
   recordárselo. Al TERMINAR algo, se le quita el 🔍 con organizar_chat(revisar:false). */
function iaPendientes(){
  const p=(IA.convs||[]).filter(c=>c.revisar && c.msgs && c.msgs.length);
  if(!p.length) return "[🔍 PENDIENTES / A MEDIAS: ahora no hay nada marcado por revisar.]";
  const lista=p.slice(0,8).map(c=>"• "+iaTit(c)).join("\n");
  return "[🔍 PENDIENTES / COSAS A MEDIAS de Rey ("+p.length+" chat(s) marcados 🔍 'Por revisar'):\n"+lista+"\nSi encaja en la charla, RECUÉRDASELOS para que los retome, o pregúntale con cuál seguir. Cuando algo quede TERMINADO, quítale el 🔍 con organizar_chat(revisar:false). Marca 🔍 lo que dejen a medias con organizar_chat(revisar:true).]";
}
/* Al tocar la notificación de "revisar pendientes", Roberto repasa lo inconcluso. */
function revisarPendientes(){
  const p=(IA.convs||[]).filter(c=>c.revisar && c.msgs && c.msgs.length);
  const lista=p.length?p.slice(0,10).map(c=>"• "+iaTit(c)).join("\n"):"(no hay nada marcado 🔍 en este momento)";
  if(typeof abrirIA==="function") abrirIA();
  iaTemaChat("🔍 Repaso de pendientes");
  setTimeout(()=>iaEnviar("🔍 Repasemos lo que tengo a medias / por revisar.",
    "Rey quiere REPASAR sus temas INCONCLUSOS / por revisar. Chats marcados 🔍 (por su título):\n"+lista+"\nPor CADA uno, en 1 línea recuérdale qué quedó pendiente (dedúcelo del título) y pregúntale con cuál quiere seguir HOY. Si ves alguno ya terminado, dile que puede quitarle el 🔍. Ordenado y breve, en lista."),250);
}
/* Sincroniza al worker cuántas cosas quedan 🔍 pendientes, para que la nube te avise
   (notificación fuerte) cada cierto tiempo AUNQUE tengas la app cerrada. Se llama al
   marcar/desmarcar 🔍 y al abrir la app. Sin datos sensibles: solo el nº y unos títulos. */
/* 📸 CAPTURAS AUTOMÁTICAS: cuando el sistema detecta una ENTRADA tuya, el puente le saca
   una foto al gráfico en ese momento. Aquí la app recoge esas capturas de la nube y las
   mete en tu Galería (tipo "Auto-entrada") para revisarlas después con Roberto. */
function syncAutoShots(){
  try{
    if(typeof nubeUrl!=="function") return;
    fetch(nubeUrl()+"/shot/auto",{cache:"no-store"}).then(r=>r.json()).then(d=>{
      if(!d || !Array.isArray(d.shots) || !d.shots.length) return;
      let n=0;
      d.shots.forEach(s=>{
        if(!s || !s.id || SHOTS.some(x=>x.id===s.id)) return;
        const dt=new Date(s.ts||Date.now());
        const f=dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0");
        SHOTS.unshift({ id:s.id, fecha:f, par:(s.sym||"—"), tipo:"Auto-entrada", ts:s.ts||Date.now() });
        n++;
      });
      if(n){ save(K.shots,SHOTS); toast("📸 "+n+" captura(s) de tu(s) entrada(s) guardada(s) en la Galería"); try{ if(typeof renderGaleria==="function") renderGaleria(); }catch(_){} }
    }).catch(()=>{});
  }catch(_){}
}
function syncPendientes(){
  try{
    const p=(IA.convs||[]).filter(c=>c.revisar && c.msgs && c.msgs.length);
    const body={ n:p.length, ejemplos:p.slice(0,3).map(c=>iaTit(c)) };
    if(typeof nubeUrl==="function") fetch(nubeUrl()+"/pendientes",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}).catch(()=>{});
  }catch(_){}
}
function iaEstrategiaDef(){
  const nom=CTX.estrategia||"";
  const def=ESTR_DEFS[nom]||{};
  const otras=(ESTRATEGIAS||[]).filter(e=>e!==nom);
  let s="[🎯 ESTRATEGIA ACTIVA: \""+nom+"\""+(def.instrumento?(" · instrumento: "+def.instrumento):"")+"\n";
  if(def.ajustes) s+="Reglas/ajustes propios (Rey los edita para adaptarse — RESPÉTALOS y ayúdalo a mejorarlos): "+def.ajustes+"\n";
  else if(/CRT/i.test(nom)) s+="(Base: tu dossier completo de CRT Elite. Si Rey añade ajustes propios, aparecerán aquí.)\n";
  else s+="(Esta estrategia AÚN no tiene definición. Si Rey opera con ella, proponle con tu mano editar_estrategia definir su instrumento y reglas; mientras, guíate por lo que él diga y tu conocimiento del instrumento — NO le apliques las reglas de CRT si no corresponden.)\n";
  if(otras.length) s+="Otras estrategias suyas: "+otras.join(", ")+" (usa SIEMPRE la ACTIVA, no las mezcles).";
  return s+"]";
}
/* Interés compuesto: Roberto arma un plan de crecimiento realista con los números reales. */
const PLAN_COMPUESTO_PROM = "Rey quiere un PLAN DE INTERÉS COMPUESTO realista para crecer su capital. Usa sus CUENTAS y estadísticas REALES del contexto (capital, win rate, R por trade/expectancy, riesgo %/trade). (1) En 2-3 frases, el poder del compuesto en trading (reinvertir, proteger, crecer sostenido). (2) Una PROYECCIÓN realista en TABLA Markdown: partiendo de su capital y su expectancy/win-rate reales, con riesgo FIJO y un nº PRUDENTE de trades, cuánto podría crecer mes a mes durante 3-6 meses (conservador, rango realista, no promesas). (3) Reglas para que funcione: riesgo fijo %, subir riesgo SOLO cuando la cuenta crece (nunca en drawdown ni por revancha), retirar parciales, respetar la disciplina y el límite diario. (4) 1-2 focos concretos. Honesto y realista; recuérdale que proteger el capital y la disciplina son la BASE del compuesto. Si le faltan datos (pocas operaciones para una expectancy fiable), díselo y da un plan por escenarios.";
function planCompuesto(){ if(typeof abrirIA==="function") abrirIA(); iaTemaChat("📈 Interés compuesto"); setTimeout(()=>iaEnviar("📈 Hazme mi plan de interés compuesto con mis números reales.", PLAN_COMPUESTO_PROM),250); }
/* 📊 PROGRESO + MEJOR CONTEXTO — arma un digest con las estadísticas reales por dimensión
   (setup, ventana, día, par…) y Roberto le dice a Rey dónde mejora, dónde no, y en qué
   contexto concentrarse (y cuál evitar). */
const PROGRESO_PROM = "Rey quiere su INFORME DE PROGRESO como trader. Abajo tienes sus estadísticas REALES (globales + por dimensión). Dale: (1) la foto general en 2-3 frases honestas (R neto, expectancy, win rate, drawdown — ¿está mejorando o no?); (2) una TABLA con sus 3-4 MEJORES contextos (dimensión+categoría, n, expectancy) y sus 2-3 PEORES — usa solo categorías con n≥3; (3) el veredicto de MEJOR CONTEXTO: en qué setup/ventana/par/día debería CONCENTRARSE y qué debería EVITAR, con el porqué; (4) 1-2 focos concretos para la próxima semana. Si hay pocos trades para conclusiones firmes, dilo (honestidad ante todo) y da lo que sí se pueda leer.";
function progresoDigest(){
  const list=tradesCtx().filter(t=>!t.abierta);
  if(list.length<3) return null;
  const m=metricas(list);
  let s="ESTADÍSTICAS GLOBALES ("+m.n+" trades, contexto "+(CTX.modo==="real"?"REAL":"BACKTEST")+" · "+CTX.estrategia+"): R neto "+r1(m.rNeto)+"R · expectancy "+r2(m.exp)+"R/trade · win rate "+pct(m.wr*100)+" · profit factor "+fmtPF(m.pf)+" · DD máx "+r1(m.dd)+"R · racha máx +"+m.maxW+"/-"+m.maxL+" · plan roto "+m.roto+" · fuera de ventana "+m.fueraVent+" · con prisa/ansiedad "+m.emoMal+"\n";
  s+="CURVA R acumulada (últimos 20 puntos): "+m.curve.slice(-20).map(v=>r1(v)).join(", ")+"\n";
  s+="POR DIMENSIÓN (categoría · n · expectancy R · win rate):\n";
  DIMS_MENTOR.forEach(([dim,fn])=>{
    const cortes=cortePor(list,fn).filter(x=>x.n>=2);
    if(!cortes.length) return;
    s+="· "+dim+": "+cortes.map(x=>x.k+" (n"+x.n+", "+r2(x.exp)+"R, "+pct(x.wr*100)+")").join(" | ")+"\n";
  });
  return s;
}
function progresoRoberto(){
  const dig=progresoDigest();
  if(typeof abrirIA==="function") abrirIA();
  iaTemaChat("📊 Mi progreso");
  setTimeout(()=>iaEnviar("📊 Dime cómo voy: mi progreso y mi mejor contexto.",
    dig ? (PROGRESO_PROM+"\n\n"+dig) : "Rey pidió su informe de progreso pero aún tiene MENOS de 3 trades cerrados en este contexto. Díselo con ánimo: que registre sus operaciones (reales y de backtest) y en cuanto haya datos le sacas la foto completa de su progreso y su mejor contexto."),250);
}
/* ✅ GO/NO-GO — checklist de confluencias EN VIVO antes de entrar: Roberto valida con el
   gráfico real (sweep→MSS→zona→confirmación) + riesgo/disciplina y da el veredicto. */
const GONOGO_PROM = "Rey está A PUNTO DE ENTRAR a una operación y te pide el GO/NO-GO. Valida con el GRÁFICO EN VIVO (si la PC no está conectada, dile que sin gráfico vivo no puedes validar y que la encienda — NO valides a ciegas). Recorre EL CHECKLIST en orden con lo que ves en el panel del CRT: (1) ¿killzone activa?; (2) ¿sesgo del día claro y a favor?; (3) Secuencia F3: ¿sweep hecho? ¿MSS confirmado? ¿zona válida (Discount para compra / Premium para venta)?; (4) ¿confluencias suficientes?; (5) riesgo/disciplina: ¿cabe en su margen diario? ¿freno o recuperación activos? ¿ya lleva trades hoy? Preséntalo como checklist con ✅/❌ por punto y cierra con el VEREDICTO en negrita: **GO** (con recordatorio: esperar la vela de CONFIRMACIÓN CERRADA, nunca el toque) o **NO-GO** (con el motivo #1). Sé estricto: ante la duda, NO-GO — su fuga es entrar antes de tiempo.";
function goNoGo(){ if(typeof abrirIA==="function") abrirIA(); iaTemaChat("✅ GO/NO-GO"); setTimeout(()=>iaEnviar("✅ Valida mi entrada AHORA: ¿GO o NO-GO?", GONOGO_PROM),250); }
/* 🏆 RACHA DE DISCIPLINA — días operados consecutivos SIN romper reglas (plan seguido,
   ≤2 trades/día, dentro de ventana). Los días sin operar no rompen la racha. */
function rachaDisciplina(){
  const list=tradesCtx().filter(t=>!t.abierta);
  if(!list.length) return { dias:0, motivo:null };
  const porDia={};
  list.forEach(t=>{ (porDia[t.fecha]=porDia[t.fecha]||[]).push(t); });
  const fechas=Object.keys(porDia).sort().reverse(); // días CON trades, del más reciente hacia atrás
  let dias=0, motivo=null;
  for(const f of fechas){
    const ts=porDia[f];
    const roto=ts.some(t=>t.plan==="No");
    const exceso=ts.length>2;
    const fuera=ts.some(t=>t.ventana==="Fuera de ventana");
    if(roto||exceso||fuera){ if(dias===0) motivo=(roto?"plan roto":(exceso?"más de 2 trades":"fuera de ventana"))+" el "+f; break; }
    dias++;
  }
  return { dias, motivo };
}
function iaRacha(){
  const r=rachaDisciplina();
  if(r.dias>0) return "[🏆 RACHA DE DISCIPLINA: "+r.dias+" día(s) operados consecutivos SIN romper reglas (plan seguido, ≤2 trades, en ventana). CELÉBRASELA cuando encaje y recuérdale que no la corte — la disciplina es un juego que va ganando.]";
  if(r.motivo) return "[🏆 RACHA DE DISCIPLINA: se CORTÓ ("+r.motivo+"). Sin drama: anímalo a arrancar una racha nueva HOY — cada día disciplinado suma.]";
  return "";
}
/* 💰 PAYOUTS Y ESCALADO — Roberto arma el plan para escalar cuentas con las ganancias REALES. */
const ESCALADO_PROM = "Rey quiere su PLAN DE ESCALADO de cuentas de fondeo. Con sus CUENTAS reales del contexto (capital, fase, progreso, RETIROS ya cobrados) y su rendimiento real: (1) foto honesta de dónde está el negocio HOY (cuentas, fases, ganancias reales retiradas); (2) el CAMINO de escalado: qué tiene que pasar (en números: % objetivo, disciplina) para el siguiente paso — pasar examen, primer payout, o comprar la SIGUIENTE cuenta; (3) regla de oro del escalado: las cuentas nuevas se compran con GANANCIAS retiradas (no con dinero fresco si se puede evitar), y diversificar de firma cuando haya base; (4) si sus cuentas están en recuperación, sé claro: primero PROTEGER y recuperar, después escalar — sin prisa. Tabla si ayuda. Realista, sin humo: este es el plan de negocio de Rey.";
function escaladoRoberto(){ if(typeof abrirIA==="function") abrirIA(); iaTemaChat("💰 Payouts y escalado"); setTimeout(()=>iaEnviar("💰 Hazme mi plan de payouts y escalado de cuentas.", ESCALADO_PROM),250); }
/* 📥 AVISOS RECIBIDOS — historial permanente de TODO lo que Roberto/Apex te notificó.
   Rey: "las notificaciones se pierden si no las reviso al momento". Ahora, aunque borres
   la notificación del teléfono, aquí queda el aviso completo con su hora (Brasil y NY). */
async function verAvisos(){
  if(typeof abrirIA==="function") abrirIA();
  iaTemaChat("📥 Avisos recibidos");
  const c=iaConvAct();
  let txt="";
  try{
    const r=await fetch(nubeUrl()+"/notif/log",{cache:"no-store"});
    const d=await r.json();
    const av=(d&&d.avisos)||[];
    if(!av.length){
      txt="## 📥 Avisos recibidos\n\nAún no hay avisos guardados. A partir de ahora, TODO lo que te notifique queda aquí aunque borres la notificación del teléfono.";
    }else{
      txt="## 📥 Avisos recibidos ("+av.length+")\n\n_Todo lo que te he notificado, aunque hayas borrado la notificación._\n\n"+
        av.slice(0,25).map(a=>{
          const dt=new Date(a.ts||Date.now());
          const hBR=new Intl.DateTimeFormat("es",{timeZone:"America/Sao_Paulo",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true}).format(dt);
          const hNY=new Intl.DateTimeFormat("es",{timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",hour12:true}).format(dt);
          return "**"+(a.t||"Aviso")+"**\n🕐 "+hBR+" (Brasil) · "+hNY+" (NY)\n\n"+(a.b||"");
        }).join("\n\n---\n\n");
    }
  }catch(_){ txt="⚠️ No pude leer el historial de avisos ahora mismo. Revisa tu internet y vuelve a intentarlo."; }
  c.msgs.push({role:"assistant",content:txt});
  iaGuardarConvs(); pintarIAChat();
}
/* 📥 v6.17 EL HILO DEL DÍA — Rey: "tocar la notificación y que me lleve al chat del MISMO día
   con todas las notificaciones, no un chat nuevo cada vez — y a Apex, no a la web de TradingView".
   UNA conversación por día: cada visita añade solo los avisos NUEVOS de hoy (hora Brasil) como
   burbujas con su hora, sin borrar lo que Rey haya conversado en medio. Al aterrizar desde una
   notificación, Roberto LEE el último aviso en voz alta si su voz está encendida (⚙️ del chat);
   cada burbuja conserva su ▶️ para reescucharla. */
async function abrirHiloDia(){
  if(typeof abrirIA==="function") abrirIA();
  const diaDe=(ts)=>new Intl.DateTimeFormat("es",{timeZone:"America/Sao_Paulo",day:"2-digit",month:"2-digit"}).format(new Date(ts||Date.now()));
  const hoyKey=diaDe(Date.now());
  iaTemaChat("📥 Avisos de hoy · "+hoyKey);
  const c=iaConvAct();
  let avHoy=[];
  try{
    const r=await fetch(nubeUrl()+"/notif/log",{cache:"no-store"});
    const d=await r.json();
    avHoy=(((d&&d.avisos)||[]).filter(a=>diaDe(a.ts)===hoyKey)).reverse();   /* ascendente: la mañana arriba */
  }catch(_){}
  const nuevos=avHoy.filter(a=>(a.ts||0)>(c.hiloUltTs||0));
  nuevos.forEach(a=>{
    const hBR=new Intl.DateTimeFormat("es",{timeZone:"America/Sao_Paulo",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(a.ts||Date.now()));
    c.msgs.push({role:"assistant",content:"**"+(a.t||"Aviso")+"** · 🕐 "+hBR+"\n\n"+(a.b||"")});
  });
  if(avHoy.length) c.hiloUltTs=avHoy[avHoy.length-1].ts||Date.now();
  if(!c.msgs.length) c.msgs.push({role:"assistant",content:"## 📥 Avisos de hoy\n\nTodavía no ha llegado ningún aviso hoy. Cuando llegue uno, tócalo en el teléfono y aterrizas AQUÍ, con el día completo en orden — y si mi voz está encendida (⚙️), te lo leo."});
  iaGuardarConvs(); pintarIAChat();
  /* 🔊 leer el último aviso del día al aterrizar (voz opcional de Roberto) */
  try{ if(avHoy.length && IA.voz && IA.voz.on){ const u=avHoy[avHoy.length-1]; iaHablar((u.t||"Aviso")+". "+(u.b||""), -1); } }catch(_){}
  try{ const m=$("#iaMsgs"); if(m) m.scrollTop=m.scrollHeight; }catch(_){}
}
/* Envía a Roberto un mensaje con BLOQUES arbitrarios (varias imágenes, documentos…)
   sin pasar por la caja de texto. Las imágenes NO se guardan en el historial del chat
   (solo el resumen), para no reventar el almacenamiento del teléfono. */
async function iaEnviarBloques(bloques, resumenChat){
  if(IA.busy) return;
  if(!IA.url){ toast("Configura el puente (⚙️)"); return; }
  const c=iaConvAct();
  c.msgs.push({role:"user",content:resumenChat||"(material adjunto)"});
  if(!c.t) c.t=iaTit(c);
  try{ iaGuardarUltimo(c); }catch(_){}   /* 🔄 red de seguridad: el texto queda recuperable */
  IA.busy=true; iaGuardarConvs(); pintarIAChat();
  /* 💰 v6.02: misma ventana ESTABLE que iaEnviar (si aquí se usara "los últimos 14" rodante,
     esta llamada rompería el prefijo y el caché fallaría justo al estudiar capturas). */
  if(typeof c.histIni!=="number" || c.histIni>c.msgs.length) c.histIni=Math.max(0,c.msgs.length-14);
  if(c.msgs.length-c.histIni>26) c.histIni=c.msgs.length-14;
  let hist=c.msgs.slice(c.histIni);
  while(hist.length && hist[0].role!=="user") hist.shift();
  const msgs=hist.map(x=>iaMsgApi(x,false));
  let calTxt=""; try{ const ev=await cargarCalendarioCache(); calTxt=iaCalendarioContexto(ev)+"\n"; }catch(_){ calTxt=""; }
  /* 💰 v6.02: bloque ESTABLE (lo guardado) con la marca de caché + material + contexto vivo al final */
  const inj="=== CONTEXTO VIVO DE LA APP (datos de AHORA MISMO) ===\n"+iaReloj()+"\n"+calTxt+iaContexto()+"\n"+iaEstrategiaDef()+"\n"+iaPlan()+"\n"+iaAciertos()+"\n"+iaFugas()+"\n"+iaRacha()+"\n=== FIN DEL CONTEXTO ===";
  const last=msgs[msgs.length-1];
  last.content=[{type:"text",text:c.msgs[c.msgs.length-1].content, cache_control:{type:"ephemeral",ttl:"1h"}}].concat(bloques).concat([{type:"text",text:inj}]);
  /* estudiar capturas / material adjunto = trabajo profundo: pregunta qué motor usar */
  await iaBgStart(msgs, c, iaMotorPara("", true, false));
}

/* ============================================================
   📸 QUE ROBERTO APRENDA DE TUS CAPTURAS
   Le pasa las últimas capturas de tu Galería (con su par, fecha y resultado si son
   de un trade) y le pide que saque PATRONES VISUALES repetidos: dónde entras, qué
   forma tienen tus ganadoras frente a tus perdedoras, qué se repite antes de un SL.
   Lo que aprenda lo guarda en su memoria con tema "visual".
   ============================================================ */
async function estudiarCapturas(n){
  n = n || 6;
  const caps = (typeof galeriaCaps === "function" ? galeriaCaps() : []).slice(0, n);
  if (!caps.length) { toast("Aún no hay capturas en tu Galería 📸"); return; }
  if (typeof abrirIA === "function") abrirIA();
  iaTemaChat("📸 Estudia mis capturas");
  toast("Bajando tus capturas… 📸");

  const bloques = [];
  const fichas = [];
  for (const cap of caps) {
    let img = null;
    try { img = await nubeShotGet(cap.id); } catch (_) {}
    if (!img) continue;
    /* si la captura pertenece a un trade, adjunta su resultado: así aprende qué
       forma tienen sus GANADORAS frente a sus PERDEDORAS, no solo cómo se ven */
    const t = (Array.isArray(TRADES) ? TRADES : []).find(x => x.shotOpen === cap.id || x.shotClose === cap.id || (x.shots || []).indexOf(cap.id) >= 0);
    const res = (t && !t.abierta) ? (((parseFloat(t.r) || 0) >= 0 ? "GANADORA " : "PERDEDORA ") + r1(parseFloat(t.r) || 0) + "R") : "sin resultado registrado";
    const ficha = (cap.par || "—") + " · " + (cap.fecha || "—") + " · " + (cap.tipo || "captura") + " · " + res;
    fichas.push(ficha);
    const b64 = String(img).replace(/^data:image\/\w+;base64,/, "");
    const media = /^data:image\/png/.test(String(img)) ? "image/png" : "image/jpeg";
    bloques.push({ type: "text", text: "📸 " + ficha });
    bloques.push({ type: "image", source: { type: "base64", media_type: media, data: b64 } });
  }
  if (!bloques.length) { toast("No pude descargar las capturas ahora mismo"); return; }

  bloques.push({ type: "text", text:
    "Estas son mis últimas capturas de gráfico. ESTÚDIALAS COMO MATERIAL DE APRENDIZAJE:\n" +
    "1) Mira cada una y describe brevemente QUÉ VES (estructura, dónde está el precio, si hay barrido, en qué zona entré).\n" +
    "2) Compara mis GANADORAS con mis PERDEDORAS y dime qué se REPITE visualmente en cada grupo.\n" +
    "3) Dime mi patrón visual más peligroso (lo que se repite antes de una perdedora) y cómo lo reconozco EN EL MOMENTO, no después.\n" +
    "4) Guarda en tu memoria (tema 'visual') los 2-3 patrones más sólidos que hayas descubierto.\n" +
    "Recuerda: toda hora con AM/PM y su zona (Nueva York o Brasil)." });

  try{ PLAN_ARR.caps=(PLAN_ARR.caps||0)+1; guardarPlan(); }catch(_){}   /* 🧭 señal de la fase 02 */
  await iaEnviarBloques(bloques, "📸 Estudia estas " + fichas.length + " capturas y saca mis patrones visuales.");
}

/* 💰 MI GASTO — en qué se va el crédito de Roberto, con datos reales del servidor. */
async function verGasto(){
  if(typeof abrirIA==="function") abrirIA();
  iaTemaChat("💰 Mi gasto");
  const c=iaConvAct();
  let txt="", rec=null;
  try{
    const r=await fetch(nubeUrl()+"/gasto?dias=14",{cache:"no-store"});
    const d=await r.json();
    const dias=(d&&d.dias)||[];
    /* 💳 v6.02 (Rey lo pidió): anota lo que recargaste y aquí ves LO QUE TE VA QUEDANDO,
       descontado con cada gasto real. Sin quitar ninguno de los datos de siempre. */
    rec=(d&&d.recarga)||null;
    let saldoTxt="";
    if(rec && isFinite(rec.resta)){
      const media14=dias.length?(d.total||0)/dias.length:0;
      saldoTxt="### 💳 Tu crédito\n**Te quedan ~$"+rec.resta.toFixed(2)+"** de los $"+Number(rec.monto).toFixed(0)+" que anotaste el "+rec.fecha+" (gastado desde entonces: $"+rec.gastado.toFixed(2)+")."+
        (media14>0.05 && rec.resta>0 ? " A tu ritmo de estos días te alcanza para **~"+Math.floor(rec.resta/media14)+" días más**." : "")+
        (rec.resta<=0 ? " ⚠️ **Se te acabó lo anotado** — recarga en console.anthropic.com y anota el nuevo total abajo." : "")+
        "\n_Es mi cuenta interna (estimada): el número exacto está en console.anthropic.com._\n\n";
    }
    if(!dias.length){
      txt="## 💰 Mi gasto\n\n"+saldoTxt+"Todavía no hay datos. El contador empieza a apuntar desde la próxima vez que hablemos.";
    }else{
      const NOM={chat:"💬 Conversaciones contigo", alarma:"🔔 Alarmas del indicador", consolidacion:"🧹 Ordenar mi memoria", informe:"🎓 Informe semanal"};
      const hoy=dias[0]||{};
      const total=d.total||0;
      const media=total/dias.length;
      txt="## 💰 En qué se va tu crédito\n\n"+saldoTxt+
        "**Hoy:** $"+(hoy.total||0).toFixed(2)+"  ·  **Últimos "+dias.length+" días:** $"+total.toFixed(2)+"\n\n"+
        "A este ritmo: **~$"+(media*30).toFixed(0)+" al mes**\n\n";
      /* por concepto, sumando todos los días */
      const sum={};
      dias.forEach(x=>Object.keys(x).forEach(k=>{ if(k==="fecha"||k==="total")return;
        sum[k]=sum[k]||{n:0,coste:0,inCache:0,inNuevo:0};
        sum[k].n+=x[k].n||0; sum[k].coste+=x[k].coste||0; sum[k].inCache+=x[k].inCache||0; sum[k].inNuevo+=x[k].inNuevo||0; }));
      const claves=Object.keys(sum).sort((a,b)=>sum[b].coste-sum[a].coste);
      txt+="### Por concepto\n"+claves.map(k=>{
        const s=sum[k]; const pct=total?Math.round(s.coste/total*100):0;
        return "- **"+(NOM[k]||k)+"** — $"+s.coste.toFixed(2)+" ("+pct+"%) · "+s.n+" llamada(s)";
      }).join("\n")+"\n\n";
      /* ¿el caché está funcionando? */
      const ch=sum.chat||{inCache:0,inNuevo:0};
      const totIn=ch.inCache+ch.inNuevo;
      if(totIn){
        const pctC=Math.round(ch.inCache/totIn*100);
        txt+="### Ahorro por caché\n"+
          (pctC>=50 ? "✅ El **"+pctC+"%** de lo que leo viene del caché — estás pagando una décima parte por esa parte."
                    : "⚠️ Solo el **"+pctC+"%** viene del caché. Si este número no sube por encima del 50%, algo lo está invalidando y estás pagando de más.")+"\n\n";
      }
      txt+="### Los últimos días\n"+dias.slice(0,7).map(x=>"- "+x.fecha+": $"+(x.total||0).toFixed(2)).join("\n");
      txt+="\n\n_Puedes ver el saldo y recargar en console.anthropic.com/settings/billing_";
    }
  }catch(_){ txt="⚠️ No pude leer el gasto ahora mismo. Revisa tu internet."; }
  c.msgs.push({role:"assistant",content:txt});
  iaGuardarConvs(); pintarIAChat();
  tarjetaRecarga(rec);
}

/* 💳 Tarjeta para ANOTAR LA RECARGA (Rey: "pongo lo que recargué y que vaya bajando").
   Sale debajo del informe 💰. Rey escribe el crédito que tiene AHORA en Anthropic y desde ese
   momento el saldo se descuenta solo con cada gasto real. Anotar otra vez REEMPLAZA (se escribe
   el total actual, no lo añadido). Necesita el worker v5.68 (POST /gasto/recarga). */
function tarjetaRecarga(rec){
  const cont=$("#iaMsgs"); if(!cont) return;
  cont.querySelectorAll(".ia-recarga").forEach(n=>n.remove());
  const card=el("div","ia-tool ia-recarga");
  card.innerHTML=
    '<div class="ia-tool-h">💳 '+(rec?"¿Recargaste? Anota tu nuevo total":"Anota tu crédito y te enseño el saldo")+'</div>'+
    '<div class="ia-tool-d">Escribe cuánto crédito tienes AHORA en Anthropic (en $). Desde ese momento lo voy descontando con cada gasto. Si recargas de nuevo, anota aquí el nuevo total.</div>'+
    '<div class="ia-tool-bar"><input type="number" inputmode="decimal" min="1" step="0.01" class="ia-recarga-in" placeholder="'+(rec?("ej: "+Number(rec.monto).toFixed(0)):"ej: 100")+'" style="flex:1;min-width:100px;padding:8px;border-radius:8px;border:1px solid #444;background:rgba(0,0,0,.35);color:inherit">'+
    '<button class="btn gold ia-recarga-ok">✓ Anotar</button></div>';
  cont.appendChild(card);
  card.querySelector(".ia-recarga-ok").onclick=async ()=>{
    const monto=parseFloat(card.querySelector(".ia-recarga-in").value);
    if(!isFinite(monto)||monto<=0){ toast("Escribe la cantidad en $ (ej: 100)"); return; }
    const bar=card.querySelector(".ia-tool-bar"); bar.innerHTML="<span class='ia-tool-done'>⏳ Anotando…</span>";
    try{
      const r=await fetch(nubeUrl()+"/gasto/recarga",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({monto})});
      const d=await r.json().catch(()=>({}));
      if(r.ok && d && d.ok){ toast("💳 Anotado: $"+monto.toFixed(2)+" — el saldo baja solo desde ahora"); card.remove(); verGasto(); }
      else{ bar.innerHTML="<span class='ia-tool-cancel'>⚠️ No se pudo — ¿ya subiste el worker v5.68?</span>"; }
    }catch(_){ bar.innerHTML="<span class='ia-tool-cancel'>⚠️ Sin internet — inténtalo otra vez</span>"; }
  };
  cont.scrollTop=cont.scrollHeight;
}

/* ============================================================
   🤖 EJECUTOR APEX (v6.06) — el panel de control del bot de MT5
   Rey manda SIEMPRE: botón 🟢 ENCENDER / 🔴 DETENER, toda la config
   (pares, riesgo, límites, grado, horario con tz, lote máx), cierre de
   posiciones desde el teléfono y el Diario del Ejecutor (sus operaciones
   NO se mezclan con las de Rey: Roberto evalúa a REY con las de Rey).
   Necesita el worker v5.75 y el programa "Arrancar Ejecutor Apex" en la PC.
   ============================================================ */
function ejecFmtTs(ts){ const d=new Date(ts||0); return d.toLocaleDateString("es",{day:"2-digit",month:"2-digit"})+" "+d.toTimeString().slice(0,5); }
/* ── FUNCIONES COMPARTIDAS chip ↔ sección (v6.09): UNA sola config, UN solo guardado.
   El chip del chat y la pestaña 🤖 son dos ventanas al MISMO lugar (la nube del worker):
   guardes donde guardes, es la misma configuración — imposible que se desenlacen. ── */
function ejecFormHTML(cfg){
  return '<label style="grid-column:1/3;font-size:.85em">Pares (separados por coma)<input class="inp ia-ejec-pares" value="'+esc((cfg.pares||[]).join(", "))+'"></label>'+
    '<label style="font-size:.85em">Riesgo % por operación<input class="inp ia-ejec-riesgo" type="number" step="0.1" min="0.1" max="5" value="'+esc(String(cfg.riesgoPct!=null?cfg.riesgoPct:0.5))+'"></label>'+
    '<label style="font-size:.85em">Máx. operaciones/día<input class="inp ia-ejec-maxops" type="number" step="1" min="1" max="20" value="'+esc(String(cfg.maxOpsDia!=null?cfg.maxOpsDia:2))+'"></label>'+
    '<label style="font-size:.85em">Pérdida máx. diaria % (se apaga solo)<input class="inp ia-ejec-maxdd" type="number" step="0.5" min="0.5" max="20" value="'+esc(String(cfg.maxPerdidaDiaPct!=null?cfg.maxPerdidaDiaPct:2))+'"></label>'+
    '<label style="font-size:.85em">Señales que acepta<select class="inp ia-ejec-grado"><option value="A+"'+(cfg.grado!=="B"?" selected":"")+'>Solo A+</option><option value="B"'+(cfg.grado==="B"?" selected":"")+'>A+ y B</option></select></label>'+
    '<label style="font-size:.85em">Opera desde<input class="inp ia-ejec-hini" type="time" value="'+esc(cfg.horaIni||"01:00")+'"></label>'+
    '<label style="font-size:.85em">hasta<input class="inp ia-ejec-hfin" type="time" value="'+esc(cfg.horaFin||"13:00")+'"></label>'+
    '<label style="font-size:.85em">Hora de<select class="inp ia-ejec-tz"><option value="America/New_York"'+(cfg.tz!=="America/Sao_Paulo"?" selected":"")+'>Nueva York (gráfico)</option><option value="America/Sao_Paulo"'+(cfg.tz==="America/Sao_Paulo"?" selected":"")+'>Brasil (tu reloj)</option></select></label>'+
    '<label style="font-size:.85em">Lote máximo<input class="inp ia-ejec-maxlote" type="number" step="0.01" min="0.01" max="50" value="'+esc(String(cfg.maxLote!=null?cfg.maxLote:1))+'"></label>'+
    '<label style="grid-column:1/3;font-size:.85em">🛑 Veto (revisión ANTES de entrar)<select class="inp ia-ejec-veto"><option value="1"'+(cfg.veto!==false?" selected":"")+'>Activado — Roberto revisa noticias y contexto y puede frenar la entrada</option><option value="0"'+(cfg.veto===false?" selected":"")+'>Apagado — ejecuta directo con tus reglas</option></select></label>'+
    '<label style="font-size:.85em">Sin noticias fuertes (± minutos)<input class="inp ia-ejec-vetomin" type="number" step="5" min="5" max="120" value="'+esc(String(cfg.vetoNoticiasMin!=null?cfg.vetoNoticiasMin:30))+'"></label>';
}
function ejecLeerForm(root){
  const q=(c)=>root.querySelector("."+c);
  const body={
    pares:(q("ia-ejec-pares").value||"").split(",").map(x=>x.trim()).filter(Boolean),
    riesgoPct:parseFloat(q("ia-ejec-riesgo").value),
    maxOpsDia:parseInt(q("ia-ejec-maxops").value,10),
    maxPerdidaDiaPct:parseFloat(q("ia-ejec-maxdd").value),
    grado:q("ia-ejec-grado").value,
    horaIni:q("ia-ejec-hini").value,
    horaFin:q("ia-ejec-hfin").value,
    tz:q("ia-ejec-tz").value,
    maxLote:parseFloat(q("ia-ejec-maxlote").value),
    veto:q("ia-ejec-veto").value==="1",
    vetoNoticiasMin:parseInt(q("ia-ejec-vetomin").value,10),
  };
  if(!body.pares.length){ toast("Pon al menos un par (ej: EURUSD)"); return null; }
  return body;
}
async function ejecGuardarCfg(body){
  try{
    const r=await fetch(nubeUrl()+"/ejec/cfg",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
    const x=await r.json().catch(()=>({}));
    if(x&&x.ok){ toast("💾 Reglas guardadas — el Ejecutor las usa desde ya"); robertoVigila("Rey cambió las reglas de su Ejecutor de MT5 (demo): "+JSON.stringify(body)); return true; }
    toast("⚠️ No se pudo guardar — ¿worker v5.77 subido?"); return false;
  }catch(_){ toast("⚠️ Sin internet"); return false; }
}
async function ejecSwitchSet(on){
  if(on && !confirm("🟢 ¿ENCENDER el Ejecutor?\n\nQueda EN GUARDIA: solo entrará cuando tu indicador dispare una señal 🔔 que pase tus reglas y el veto. Puedes detenerlo cuando quieras con el botón rojo.")) return false;
  try{
    const r=await fetch(nubeUrl()+"/ejec/switch",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({on})});
    const x=await r.json().catch(()=>({}));
    if(x&&x.ok){ toast(on?"🟢 Ejecutor ENCENDIDO (en guardia)":"🔴 Ejecutor DETENIDO"); return true; }
    toast("⚠️ No se pudo — ¿worker v5.77 subido?"); return false;
  }catch(_){ toast("⚠️ Sin internet"); return false; }
}
async function ejecCmdCerrar(ticket){
  const todo=ticket==null;
  if(!confirm(todo?"✖ ¿Cerrar TODAS las posiciones del Ejecutor ahora?":"✖ ¿Cerrar esta posición ahora, al precio de mercado?")) return false;
  try{
    await fetch(nubeUrl()+"/ejec/cmd",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(todo?{action:"cerrar_todo"}:{action:"cerrar",ticket})});
    toast("Orden de cierre enviada — te aviso al cerrar"); return true;
  }catch(_){ toast("⚠️ Sin internet"); return false; }
}
async function verEjecutor(){
  if(typeof abrirIA==="function") abrirIA();
  iaTemaChat("🤖 Ejecutor");
  const c=iaConvAct();
  let txt="", d=null;
  try{
    const r=await fetch(nubeUrl()+"/ejec/estado",{cache:"no-store"});
    d=await r.json();
    if(!d || !d.ok) throw 0;
    const live=d.live||{};
    const lg=d.log||[];
    ejecArchivar(lg);   /* 📚 el chip también archiva — mismo archivo que la sección */
    const cfgV=d.cfg||{};
    txt="## 🤖 Ejecutor — tu bot en MT5 (fase DEMO)\n\n"+
      "**Estado:** "+(d.on?"🟢 ENCENDIDO (vigilando — solo entra cuando TU indicador confirme una señal que pase tus reglas)":"🔴 APAGADO (solo observa)")+"\n"+
      "**Revisión previa (veto):** "+(cfgV.veto!==false?("🛑 activada — antes de cada entrada: noticias ±"+(cfgV.vetoNoticiasMin||15)+" min + contexto de Roberto"):"apagada (ejecuta directo)")+"\n"+
      "**Programa en la PC:** "+(d.vivo?"✅ conectado":"❌ sin conexión — abre 'Arrancar Ejecutor Apex' en la PC (con MT5 abierto)")+"\n"+
      (live.cuenta?("**Cuenta MT5:** "+live.cuenta+" · "+(live.demo?"DEMO ✅":"⚠️ NO demo (no opera)")+" · balance "+(live.balance!=null?live.balance:"?")+" "+(live.moneda||"")+"\n"):"")+
      (live.opsHoy!=null?("**Hoy:** "+live.opsHoy+" operación(es) · P&L $"+(live.plHoy!=null?live.plHoy:"0")+(live.enHorario===false?" · ⏸ fuera de tu horario":"")+"\n"):"");
    const poss=(live.posiciones||[]);
    if(poss.length){
      txt+="\n### 📌 Posiciones abiertas del Ejecutor\n"+poss.map(p=>"- **"+p.dir+" "+p.sym+"** lote "+p.lote+" @ "+p.entrada+" · SL "+p.sl+" · TP "+p.tp+" · P&L $"+p.pl).join("\n")+"\n";
    }
    const ops=lg.filter(x=>x.tipo==="salida");
    if(ops.length){
      /* 📓 v6.21 (Rey): TODAS las operaciones con su FECHA — así Roberto puede evaluar el
         período que Rey le pida (hoy / semana / todas) filtrando por fecha él mismo.
         La ficha completa solo va en las 3 más recientes (las viejas, en 1 línea compacta). */
      txt+="\n### 📓 Diario del Ejecutor ("+ops.length+" operación(es), con fecha para filtrar por período)\n"+ops.map((x,i)=>"- "+ejecFmtTs(x.ts)+" · **"+(x.dir==="buy"?"COMPRA":x.dir==="sell"?"VENTA":x.dir)+" "+(x.sym||"")+"** → "+(x.motivo||"")+" "+((x.pl||0)>=0?"🟢 +$":"🔴 −$")+Math.abs(x.pl||0).toFixed(2)+(x.r!=null?" ("+x.r+"R)":"")+(i<3&&x.ficha?("\n  - "+x.ficha):"")+(i<3&&x.lectura?("\n  - 🎓 _"+x.lectura+"_"):"")).join("\n")+"\n";
    }
    const rech=lg.filter(x=>x.tipo==="rechazo").slice(0,4);
    if(rech.length){
      txt+="\n### 🚫 Señales que descartó (tus reglas mandan)\n"+rech.map(x=>"- "+ejecFmtTs(x.ts)+" · "+(x.sym||"")+": "+(x.motivo||"")).join("\n")+"\n";
    }
    if(!poss.length && !ops.length) txt+="\nTodavía no ha operado. Cuando llegue una señal 🔔 A+ del indicador dentro de tus reglas, entrará él solo y te aviso al instante.\n";
    if(ops.length) txt+="\n🎯 **¿Evalúo sus operaciones?** Dime el período y lo hago con esas fechas: **\"evalúa hoy\"**, **\"evalúa la semana\"** o **\"evalúa todas\"** — busco patrones (qué señal rinde, qué par, qué hora), qué enseñan y qué ajustar.\n";
    txt+="\n_Abajo tienes el botón y todos los ajustes. Sus operaciones y capturas también entran a la 🖼️ Galería._";
  }catch(_){ txt="⚠️ No pude leer el estado del Ejecutor. Revisa tu internet — y que el worker v5.75 esté subido."; }
  c.msgs.push({role:"assistant",content:txt});
  iaGuardarConvs(); pintarIAChat();
  if(d && d.ok) tarjetaEjecutor(d);
}
function tarjetaEjecutor(d){
  const cont=$("#iaMsgs"); if(!cont) return;
  cont.querySelectorAll(".ia-ejec").forEach(n=>n.remove());
  const cfg=d.cfg||{};
  const card=el("div","ia-tool ia-ejec");
  const poss=((d.live||{}).posiciones)||[];
  card.innerHTML=
    '<div class="ia-tool-h">🤖 Control del Ejecutor</div>'+
    '<div class="ia-tool-d">'+(d.on?"Está ENCENDIDO: ejecuta tus señales dentro de tus reglas.":"Está APAGADO: no ejecuta nada hasta que tú lo enciendas.")+'</div>'+
    '<div class="ia-tool-bar"><button class="btn '+(d.on?"":"gold")+' ia-ejec-sw" style="flex:1;font-weight:700">'+(d.on?"🔴 DETENER":"🟢 ENCENDER")+'</button></div>'+
    (poss.length?('<div class="ia-tool-d" style="margin-top:8px">Posiciones abiertas:</div>'+
      poss.map(p=>'<div class="ia-tool-bar"><span style="flex:1">'+esc(p.dir+" "+p.sym+" · $"+p.pl)+'</span><button class="btn ia-ejec-cerrar" data-tk="'+esc(String(p.ticket))+'">✖ Cerrar</button></div>').join("")+
      '<div class="ia-tool-bar"><button class="btn ia-ejec-cerrartodo" style="flex:1">✖ Cerrar TODAS</button></div>'):"")+
    '<div class="ia-tool-d" style="margin-top:10px">⚙️ <b>Tus reglas</b> (las MISMAS que en la pestaña 🤖 — un solo lugar en la nube):</div>'+
    '<div class="ia-ejec-form" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'+ejecFormHTML(cfg)+'</div>'+
    '<div class="ia-tool-bar" style="margin-top:8px"><button class="btn gold ia-ejec-save" style="flex:1">💾 Guardar mis reglas</button><button class="btn ia-ejec-seccion">🤖 Ver la sección</button><button class="btn ia-ejec-ref">🔄</button></div>';
  cont.appendChild(card);
  card.querySelector(".ia-ejec-sw").onclick=async()=>{ if(await ejecSwitchSet(!d.on)) verEjecutor(); };
  card.querySelectorAll(".ia-ejec-cerrar").forEach(b=>{ b.onclick=()=>ejecCmdCerrar(b.dataset.tk); });
  const ct=card.querySelector(".ia-ejec-cerrartodo");
  if(ct) ct.onclick=()=>ejecCmdCerrar(null);
  card.querySelector(".ia-ejec-ref").onclick=()=>verEjecutor();
  card.querySelector(".ia-ejec-seccion").onclick=()=>{ if(typeof cerrarIA==="function") cerrarIA(); irA("ejecutor"); };
  card.querySelector(".ia-ejec-save").onclick=async()=>{ const body=ejecLeerForm(card); if(body) await ejecGuardarCfg(body); };
  cont.scrollTop=cont.scrollHeight;
}
/* ── 📚 ARCHIVO PERMANENTE del Ejecutor (v6.10) — la nube solo guarda los últimos
   ~40 eventos, así que la app ARCHIVA aquí cada operación para SIEMPRE (localStorage
   + respaldo ☁️ con NUBE_KEYS). De este archivo salen el historial por semanas/días,
   las capturas 📸 de cada entrada y la evaluación 🧠 con Roberto. Separado 100% del
   Diario de Rey: sus estadísticas personales no se tocan. ── */
function ejecArchivar(lg){
  try{
    const a=load(K.ejec,{trades:{}}); if(!a.trades) a.trades={};
    let cambio=false;
    (lg||[]).forEach(x=>{
      if(x.ticket==null) return;
      const k=String(x.ticket);
      if(x.tipo==="entrada"){
        const t=a.trades[k]||{};
        if(!t.tsIn){ Object.assign(t,{ticket:x.ticket,sym:x.sym,dir:x.dir,lote:x.lote,entrada:(x.precio!=null?x.precio:x.entrada),sl:x.sl,tp:x.tp,riesgo:x.riesgo,grado:x.grado,tsIn:x.ts,shot:x.shot||("ejec"+k)}); a.trades[k]=t; cambio=true; }
      }else if(x.tipo==="salida"){
        const t=a.trades[k]||{ticket:x.ticket,shot:"ejec"+k};
        if(!t.tsOut){ Object.assign(t,{sym:x.sym||t.sym,dir:x.dir||t.dir,lote:(x.lote!=null?x.lote:t.lote),entrada:(x.entrada!=null?x.entrada:t.entrada),sl:(x.sl!=null?x.sl:t.sl),tp:(x.tp!=null?x.tp:t.tp),salida:x.salida,pl:x.pl,r:x.r,motivo:x.motivo,riesgo:(x.riesgo!=null?x.riesgo:t.riesgo),grado:x.grado||t.grado,lectura:x.lectura||t.lectura,ficha:x.ficha||t.ficha,shotCierre:x.shotCierre||t.shotCierre,tsOut:x.ts}); a.trades[k]=t; cambio=true; }
        else { /* v6.14: rellena lo que haya llegado tarde (lectura, ficha o la foto del cierre) */
          if(x.lectura && !t.lectura){ t.lectura=x.lectura; cambio=true; }
          if(x.ficha && !t.ficha){ t.ficha=x.ficha; cambio=true; }
          if(x.shotCierre && !t.shotCierre){ t.shotCierre=x.shotCierre; cambio=true; }
        }
      }
    });
    if(cambio) save(K.ejec,a);
    return a;
  }catch(_){ return {trades:{}}; }
}
function ejecCerradas(){
  const a=load(K.ejec,{trades:{}});
  return Object.values(a.trades||{}).filter(t=>t.tsOut).sort((x,y)=>(y.tsOut||0)-(x.tsOut||0));
}
/* 📸 abre la captura automática de una operación (la misma que está en la Galería) */
async function ejecVerShot(id){
  if(!id){ toast("Esa operación no tiene captura"); return; }
  toast("📸 Cargando captura…");
  try{
    const r=await fetch(nubeUrl()+"/shot/get?id="+encodeURIComponent(id));
    const d=await r.json();
    if(d&&d.img) abrirModal('<img src="'+d.img+'" style="max-width:100%;border-radius:8px">',[{t:"Cerrar",cls:"gold",fn:cerrarModal}]);
    else toast("No encontré la captura (quizá aún no se tomó o se limpió de la nube)");
  }catch(_){ toast("⚠️ Sin internet"); }
}
/* 🧠 manda el historial del Ejecutor al chat para evaluarlo CON Roberto */
/* 🧮 v6.23 (Rey): la evaluación del Ejecutor ahora tiene FILTRO DE PERÍODO — "hoy",
   "semana" o "todas" — con botones reales. Roberto recibe SOLO las operaciones del
   período elegido (con fecha) y lo dice en su evaluación. */
function ejecEvaluarRoberto(per){
  per = per==="hoy"||per==="semana"||per==="todas" ? per : "todas";
  let ts=ejecCerradas();
  const ahora=Date.now();
  if(per==="hoy"){
    const hoyBR=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo"}).format(new Date());
    ts=ts.filter(t=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo"}).format(new Date(t.tsOut||0))===hoyBR);
  }else if(per==="semana"){
    ts=ts.filter(t=>(t.tsOut||0)>=ahora-7*86400*1000);
  }else{
    ts=ts.slice(0,60);
  }
  const nombrePer=per==="hoy"?"de HOY":per==="semana"?"de los ÚLTIMOS 7 DÍAS":"COMPLETO (todas)";
  if(!ts.length){ toast(per==="hoy"?"El Ejecutor no tiene operaciones cerradas hoy":"Aún no hay operaciones cerradas del Ejecutor en ese período"); return; }
  const lineas=ts.map(t=>ejecFmtTs(t.tsOut)+" · "+(t.dir==="buy"?"COMPRA":t.dir==="sell"?"VENTA":t.dir)+" "+(t.sym||"")+" lote "+t.lote+" → "+(t.motivo||"")+" $"+t.pl+(t.r!=null?" ("+t.r+"R)":"")+(t.grado?" · señal "+t.grado:"")).join("\n");
  if(typeof abrirIA==="function") abrirIA();
  iaTemaChat("🤖 Evaluación del Ejecutor");
  setTimeout(()=>iaEnviar("🧮 Evalúa las operaciones "+nombrePer+" de mi Ejecutor.", "Evalúa las operaciones de MI EJECUTOR (mi bot de MT5 en demo, que ejecuta las señales A+ de mi indicador CRT Elite con mis reglas — NO las mías manuales). PERÍODO ELEGIDO POR REY: "+nombrePer+" — evalúa SOLO estas y di el período en tu primera línea.\nSus operaciones cerradas del período:\n"+lineas+"\n\nDame tu evaluación de mentor: números del período (ganadas/perdidas, R y $ acumulado), qué patrón ves (qué señal, par y horario rinden), si las reglas están funcionando, qué ajustarías de su configuración (riesgo, horario, grado mínimo, pares) y qué observar. Si el período tiene pocas operaciones, dilo con honestidad (muestra chica = conclusiones suaves). Si tienes mis datos manuales, compáranos."),300);
}
/* ── 🤖 LA SECCIÓN EJECUTOR (v6.09) — pestaña propia con TODO el control.
   Lee y guarda EXACTAMENTE en el mismo sitio que el chip del chat (la nube). ── */
function viewEjecutor(){
  const v=el("div","view"); v.id="v-ejecutor";
  v.innerHTML='<div id="ejBody"><div class="card">⏳ Cargando el Ejecutor…</div></div>';
  return v;
}
async function renderEjecutor(){
  const cont=$("#ejBody"); if(!cont) return;
  let d=null;
  try{ const r=await fetch(nubeUrl()+"/ejec/estado",{cache:"no-store"}); d=await r.json(); }catch(_){}
  if(!d||!d.ok){
    cont.innerHTML='<div class="card">⚠️ No pude leer el Ejecutor. Revisa tu internet — y que el worker v5.77 esté subido. <div style="margin-top:8px"><button class="btn gold" id="ejRetry">🔄 Reintentar</button></div></div>';
    const br=$("#ejRetry"); if(br) br.onclick=renderEjecutor;
    return;
  }
  const cfg=d.cfg||{}, live=d.live||{}, lg=d.log||[];
  const poss=live.posiciones||[];
  ejecArchivar(lg);                       /* 📚 archiva lo nuevo ANTES de pintar */
  const hist=ejecCerradas();
  const rech=lg.filter(x=>x.tipo==="rechazo").slice(0,6);
  /* historial agrupado por SEMANAS y DÍAS, con totales */
  const nWin=hist.filter(t=>(t.pl||0)>=0).length;
  const sumPL=hist.reduce((s,t)=>s+(t.pl||0),0);
  const conR=hist.filter(t=>t.r!=null);
  const sumR=conR.reduce((s,t)=>s+t.r,0);
  /* 📆 CALENDARIO COMPLETO (v6.11, Rey: "esto es a LARGO PLAZO"): AÑOS → MESES → SEMANAS
     → DÍAS, con estadísticas en cada nivel. Nada caduca solo: se conserva TODO hasta que
     Rey (o Roberto con su aprobación) borre lo antiguo. */
  const semIni=(ts)=>{ const x=new Date(ts); const off=(x.getDay()+6)%7; return new Date(x.getFullYear(),x.getMonth(),x.getDate()-off).getTime(); };
  const MESES_N=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const stx=(ts)=>{ const w=ts.filter(t=>(t.pl||0)>=0).length, pl=ts.reduce((s,t)=>s+(t.pl||0),0); const rs=ts.filter(t=>t.r!=null); const r=rs.reduce((s,t)=>s+t.r,0);
    return " — "+ts.length+" op · "+w+" ✓ ("+Math.round(w/ts.length*100)+"%) · "+(pl>=0?"🟢 +$":"🔴 −$")+Math.abs(pl).toFixed(2)+(rs.length?(" · "+(r>=0?"+":"")+r.toFixed(2)+"R"):""); };
  const semanasHtml=(lista)=>{
    const sems={};
    lista.forEach(t=>{ const k=semIni(t.tsOut); (sems[k]=sems[k]||[]).push(t); });
    return Object.keys(sems).map(Number).sort((a,b)=>b-a).map(sk=>{
      const ts=sems[sk];
      const dias={};
      ts.forEach(t=>{ const dk=new Date(t.tsOut).toLocaleDateString("es",{weekday:"long",day:"2-digit",month:"2-digit"}); (dias[dk]=dias[dk]||[]).push(t); });
      return '<div style="margin-top:10px;padding:8px;border-radius:10px;background:rgba(255,255,255,.04)">'+
        '<div style="font-weight:700">🗓️ Semana del '+esc(new Date(sk).toLocaleDateString("es",{day:"2-digit",month:"2-digit"}))+esc(stx(ts))+'</div>'+
        Object.keys(dias).map(dk=>'<div style="margin-top:6px"><div style="opacity:.85;font-size:.88em">📅 '+esc(dk)+'</div>'+
          dias[dk].map(t=>'<div style="margin-top:5px;border-top:1px solid rgba(255,255,255,.07);padding-top:5px;font-size:.92em">'+
            esc(new Date(t.tsOut).toTimeString().slice(0,5))+' · <b>'+esc((t.dir==="buy"?"COMPRA":t.dir==="sell"?"VENTA":String(t.dir||""))+" "+(t.sym||""))+'</b> lote '+t.lote+' → '+esc(t.motivo||"")+' '+((t.pl||0)>=0?"🟢 +$":"🔴 −$")+Math.abs(t.pl||0).toFixed(2)+(t.r!=null?" ("+t.r+"R)":"")+(t.grado?' · '+esc(String(t.grado)):"")+
            ' <button class="btn ej-shot" data-id="'+esc(String(t.shot||""))+'" style="padding:2px 8px;font-size:.85em">📸 entrada</button>'+
            ' <button class="btn ej-shot" data-id="'+esc(String(t.shotCierre||("ejecC"+t.ticket)))+'" style="padding:2px 8px;font-size:.85em">📸 cierre</button>'+
            (t.ficha?('<div style="opacity:.95;margin-top:4px;font-size:.9em">'+esc(t.ficha)+'</div>'):"")+
            (t.lectura?('<div style="opacity:.9;margin-top:4px">🎓 <i>'+esc(t.lectura)+'</i></div>'):"")+
          '</div>').join("")+'</div>').join("")+
      '</div>';
    }).join("");
  };
  const porAno={};
  hist.forEach(t=>{ const d0=new Date(t.tsOut); const y=d0.getFullYear(), m=d0.getMonth(); porAno[y]=porAno[y]||{}; (porAno[y][m]=porAno[y][m]||[]).push(t); });
  const ahoraD=new Date();
  const histHtml=Object.keys(porAno).map(Number).sort((a,b)=>b-a).map(y=>{
    const meses=porAno[y];
    const todasAno=Object.values(meses).flat();
    return '<div style="margin-top:14px;font-weight:800;font-size:1.05em">📆 '+y+esc(stx(todasAno))+'</div>'+
      Object.keys(meses).map(Number).sort((a,b)=>b-a).map(m=>{
        const ts=meses[m];
        const abierto=(y===ahoraD.getFullYear() && m===ahoraD.getMonth());
        return '<details'+(abierto?" open":"")+' style="margin-top:8px"><summary style="cursor:pointer;font-weight:700">📂 '+esc(MESES_N[m])+' '+y+esc(stx(ts))+' <button class="btn ej-delmes" data-y="'+y+'" data-m="'+m+'" title="Borrar este mes del archivo" style="padding:1px 7px;font-size:.8em">🗑️</button></summary>'+semanasHtml(ts)+'</details>';
      }).join("");
  }).join("");
  cont.innerHTML=
    /* estado + botón grande */
    '<div class="card">'+
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+
        '<div style="font-size:2em">'+(d.on?"🟢":"🔴")+'</div>'+
        '<div style="flex:1;min-width:180px"><b>'+(d.on?"ENCENDIDO — en guardia":"APAGADO — solo observa")+'</b><br>'+
        '<span style="opacity:.85;font-size:.9em">'+(d.on?"Solo entra cuando TU indicador confirme una señal 🔔 que pase tus reglas y el veto.":"No ejecuta nada hasta que tú lo enciendas.")+'</span></div>'+
      '</div>'+
      '<div style="margin-top:8px;font-size:.92em">'+
        '<div>🖥️ Programa en la PC: '+(d.vivo?"✅ conectado":"❌ sin conexión — abre \'Arrancar Ejecutor Apex\' (con MT5 abierto)")+'</div>'+
        (live.cuenta?('<div>🏦 Cuenta MT5: '+esc(live.cuenta)+' · '+(live.demo?"DEMO ✅":"⚠️ NO demo (no opera)")+' · balance '+(live.balance!=null?live.balance:"?")+' '+esc(live.moneda||"")+'</div>'):"")+
        (live.opsHoy!=null?('<div>📊 Hoy: '+live.opsHoy+' operación(es) · P&L $'+(live.plHoy!=null?live.plHoy:"0")+(live.enHorario===false?" · ⏸ fuera de tu horario":"")+'</div>'):"")+
        '<div>🛑 Veto previo: '+(cfg.veto!==false?("activado (noticias ±"+(cfg.vetoNoticiasMin||15)+" min + contexto de Roberto)"):"apagado")+'</div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;margin-top:10px">'+
        '<button class="btn '+(d.on?"":"gold")+'" id="ejSw" style="flex:1;font-weight:700;font-size:1.05em">'+(d.on?"🔴 DETENER":"🟢 ENCENDER")+'</button>'+
        '<button class="btn" id="ejRef">🔄</button>'+
        '<button class="btn" id="ejRob">💬 Roberto</button>'+
      '</div>'+
    '</div>'+
    /* posiciones abiertas */
    (poss.length?('<div class="card"><b>📌 Posiciones abiertas</b>'+
      poss.map(p=>'<div style="display:flex;align-items:center;gap:8px;margin-top:8px"><span style="flex:1">'+esc(p.dir+" "+p.sym)+' · lote '+p.lote+' @ '+p.entrada+' · SL '+p.sl+' · TP '+p.tp+' · <b>$'+p.pl+'</b></span><button class="btn ej-cerrar" data-tk="'+esc(String(p.ticket))+'">✖ Cerrar</button></div>').join("")+
      '<div style="margin-top:8px"><button class="btn" id="ejCerrarTodo" style="width:100%">✖ Cerrar TODAS</button></div></div>'):"")+
    /* reglas */
    '<div class="card"><b>⚙️ Tus reglas</b> <span style="opacity:.8;font-size:.85em">(las mismas del chip 🤖 del chat — un solo lugar en la nube)</span>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px" id="ejForm">'+ejecFormHTML(cfg)+'</div>'+
      '<div style="margin-top:8px"><button class="btn gold" id="ejSave" style="width:100%">💾 Guardar mis reglas</button></div></div>'+
    /* 📓 diario del ejecutor — archivo COMPLETO, por semanas y días, separado del de Rey */
    '<div class="card"><b>📓 Diario del Ejecutor</b> <span style="opacity:.8;font-size:.85em">(archivo completo, separado de TU Diario — se respalda en tu nube ☁️)</span>'+
      (hist.length?(
        '<div style="margin-top:8px;font-size:.95em"><b>Total:</b> '+hist.length+' operación(es) · '+nWin+' ganada(s) ('+Math.round(nWin/hist.length*100)+'%) · '+(sumPL>=0?"🟢 +$":"🔴 −$")+Math.abs(sumPL).toFixed(2)+(conR.length?(' · '+(sumR>=0?"+":"")+sumR.toFixed(2)+'R acumulado'):"")+'</div>'+
        '<div style="margin-top:8px;font-size:.92em"><b>🧠 Evaluar con Roberto:</b></div>'+
        '<div style="display:flex;gap:6px;margin-top:6px"><button class="btn gold" id="ejEvalHoy" style="flex:1">📅 Hoy</button><button class="btn gold" id="ejEvalSem" style="flex:1">🗓️ Semana</button><button class="btn gold" id="ejEvalTodo" style="flex:1">📚 Todas</button></div>'+
        histHtml)
      :'<div style="opacity:.8;margin-top:6px;font-size:.92em">Todavía no ha cerrado ninguna operación. Cuando opere, aquí verás TODO su historial organizado por semanas y días, con su captura 📸 y la lección 🎓 de cada una — y el botón para evaluarlo con Roberto.</div>')+'</div>'+
    /* señales descartadas / vetadas */
    (rech.length?('<div class="card"><b>🚫 Señales que descartó o vetó</b>'+
      rech.map(x=>'<div style="margin-top:6px;font-size:.9em;opacity:.92">'+esc(ejecFmtTs(x.ts))+' · '+esc(x.sym||"")+': '+esc(x.motivo||"")+'</div>').join("")+'</div>'):"");
  $("#ejSw").onclick=async()=>{ if(await ejecSwitchSet(!d.on)) renderEjecutor(); };
  $("#ejRef").onclick=renderEjecutor;
  $("#ejRob").onclick=()=>verEjecutor();
  $("#ejSave").onclick=async()=>{ const body=ejecLeerForm($("#ejForm")); if(body && await ejecGuardarCfg(body)) renderEjecutor(); };
  cont.querySelectorAll(".ej-cerrar").forEach(b=>{ b.onclick=()=>ejecCmdCerrar(b.dataset.tk); });
  const ctd=$("#ejCerrarTodo"); if(ctd) ctd.onclick=()=>ejecCmdCerrar(null);
  const bevH=$("#ejEvalHoy"); if(bevH) bevH.onclick=()=>ejecEvaluarRoberto("hoy");
  const bevS=$("#ejEvalSem"); if(bevS) bevS.onclick=()=>ejecEvaluarRoberto("semana");
  const bevT=$("#ejEvalTodo"); if(bevT) bevT.onclick=()=>ejecEvaluarRoberto("todas");
  cont.querySelectorAll(".ej-shot").forEach(b=>{ b.onclick=()=>ejecVerShot(b.dataset.id); });
  /* 🗑️ borrar un MES del archivo (decisión de Rey, con confirmación; Roberto también puede
     con la herramienta limpiar_diario_ejecutor, que siempre pasa por la tarjeta de aprobación) */
  cont.querySelectorAll(".ej-delmes").forEach(b=>{ b.onclick=(e)=>{
    e.preventDefault(); e.stopPropagation();
    const y=parseInt(b.dataset.y,10), m=parseInt(b.dataset.m,10);
    const a=load(K.ejec,{trades:{}});
    const keys=Object.keys(a.trades||{}).filter(k=>{ const t=a.trades[k]; const ts=t.tsOut||t.tsIn||0; const d0=new Date(ts); return t.tsOut && d0.getFullYear()===y && d0.getMonth()===m; });
    if(!keys.length){ toast("Ese mes no tiene operaciones"); return; }
    if(!confirm("🗑️ ¿Borrar del archivo del Ejecutor las "+keys.length+" operación(es) de "+["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][m]+" "+y+"?\n\nEs definitivo (tu Diario personal NO se toca).")) return;
    keys.forEach(k=>delete a.trades[k]); save(K.ejec,a);
    toast("🗑️ Mes borrado del archivo del Ejecutor");
    renderEjecutor();
  }; });
}

/* 🧭 MI PLAN — Roberto le dice por dónde va y qué le toca HOY. */
function preguntarPlan(){
  if(typeof abrirIA==="function") abrirIA();
  iaTemaChat("🧭 Mi plan");
  setTimeout(()=>iaEnviar("🧭 ¿Por dónde voy en mi plan? Dime en qué fase estoy, qué me falta exactamente para pasar a la siguiente y qué debo hacer HOY."),250);
}
/* 🧠 MI MEMORIA — le enseña a Rey todo lo que Roberto sabe de él, agrupado por temas. */
async function verMemoria(){
  if(typeof abrirIA==="function") abrirIA();
  iaTemaChat("🧠 Mi memoria");
  const c=iaConvAct();
  let txt="", html="";
  try{
    const r=await fetch(nubeUrl()+"/mem",{cache:"no-store"});
    const d=await r.json();
    const entries=(d&&d.entries)||[];
    _iaMemCache=entries;
    if(!entries.length){
      txt="## 🧠 Mi memoria\n\nTodavía no he guardado nada de ti. A medida que trabajemos iré guardando lo importante — y siempre te pido permiso antes.";
    }else{
      const grupos={};
      entries.forEach(e=>{ const k=MEM_TEMAS_APP[e.tema]?e.tema:"general"; (grupos[k]=grupos[k]||[]).push(e); });
      const orden=Object.keys(MEM_TEMAS_APP).filter(k=>grupos[k]);
      /* 🗂️ CARPETAS PLEGABLES: cada tema es un <details> que Rey abre y cierra con un toque.
         Así con 150 recuerdos sigue siendo legible: ve los títulos con su conteo y abre solo
         el tema que quiere. txt queda como versión en texto plano (para 🔊 Escuchar y buscar). */
      txt="🧠 Lo que sé de ti ("+entries.length+" recuerdos). "+
        orden.map(k=>MEM_TEMAS_APP[k]+", "+grupos[k].length+" recuerdos: "+grupos[k].slice().reverse().map(e=>e.texto).join(". ")).join(". ")+
        " Si algo aquí ya no es cierto, dímelo y lo borro.";
      html='<div class="ia-md-h h2">🧠 Lo que sé de ti ('+entries.length+' recuerdos)</div>'+
        '<div class="ia-mem-ayuda">Toca cada carpeta para abrirla o cerrarla.</div>'+
        orden.map((k,ix)=>'<details class="ia-mem-fold"'+(ix===0?" open":"")+'><summary>'+esc(MEM_TEMAS_APP[k])+' <span class="ia-mem-n">'+grupos[k].length+'</span></summary><ul>'+
          grupos[k].slice().reverse().map(e=>"<li>"+esc(e.texto)+"</li>").join("")+'</ul></details>').join("")+
        '<div class="ia-mem-pie">Si algo aquí ya no es cierto, dímelo y lo borro.</div>';
    }
  }catch(_){ txt="⚠️ No pude leer mi memoria ahora mismo. Revisa tu internet."; }
  const msg={role:"assistant",content:txt}; if(html) msg.html=html;
  c.msgs.push(msg);
  iaGuardarConvs(); pintarIAChat();
}

/* 🌅 PARTE MATUTINO HABLADO — al abrir la app por la mañana (1 vez al día), Roberto da el
   resumen del día EN VOZ: saludo, ventanas de hoy, noticias clave, plan semanal, estado de
   cuentas/disciplina y pendientes. Corto y accionable, como un briefing de mentor. */
const PARTE_PROM = "Dale a Rey su PARTE MATUTINO del día: un briefing de mentor CON DATOS, no un cuento corrido. REGLAS DE FORMATO (obligatorias): números SIEMPRE en cifras (5:30, 1.3%, 1.3639), NUNCA escritos en letras; estructura en bloques cortos con mini-título en negrita — **⏰ Ahora**, **📰 Noticias**, **🗓️ Plan semanal**, **💼 Cuentas**, **🎯 Foco** — con 1-2 líneas por bloque; si hay noticias de alto impacto hoy, ponlas en una TABLA markdown con columnas Noticia | Hora NY | Hora Brasil | Bloqueo. Contenido (solo lo que aplique HOY): qué día es y la ventana/killzone actual y la SIGUIENTE, con horas NY y Brasil en cifras; noticias de alto impacto que afecten a sus pares; el plan semanal en 1 línea; sus cuentas con números reales (% hasta el DD, si están en recuperación) y su disciplina en 1 línea firme; pendientes 🔍 si los hay. Cierra con **🎯 Foco** en 1 frase. Máx ~180 palabras fuera de la tabla. Tono cálido y directo, de mentor.";
function parteMatutino(){
  if(typeof abrirIA==="function") abrirIA();
  iaTemaChat("🌅 Parte del día");
  IA.autoHablarUna=true;   // este parte se LEE EN VOZ aunque el modo voz esté apagado
  setTimeout(()=>iaEnviar("🌅 Dame mi parte del día.", PARTE_PROM),300);
}
/* Dispara el parte automáticamente 1 vez al día si abres la app por la mañana (5:00–12:00). */
function parteMatutinoAuto(){
  try{
    const h=new Date().getHours(); if(h<5 || h>=12) return;
    const hoy=hoyISO(); if(localStorage.getItem("crtelite_partedia_v1")===hoy) return;
    localStorage.setItem("crtelite_partedia_v1", hoy);
    parteMatutino();
  }catch(_){}
}

/* Contexto activo: modo (real/backtest) + estrategia seleccionada */
let CTX = load(K.ctx, { modo:"real", estrategia:"CRT Elite" });
if(!ESTRATEGIAS.includes(CTX.estrategia)) CTX.estrategia = ESTRATEGIAS[0];

/* Cuentas de fondeo/reales/propias registradas (v4.6) */
let CUENTAS = load(K.cuentas, []);
function guardarCuentas(){ save(K.cuentas, CUENTAS); if(typeof syncRiesgo==="function") syncRiesgo(); }

/* Pares que sigue Rey (configurables; con el puente vendrán de TradingView) */
let PARES = load(K.pares, ["EUR/USD","GBP/USD"]);
if(!Array.isArray(PARES) || !PARES.length) PARES = ["EUR/USD","GBP/USD"];
function guardarPares(){ save(K.pares, PARES); }
/* Filtro de la sección Noticias — independiente de los pares de las notificaciones.
   Arranca con los pares actuales, pero Rey puede escribir otros que esté operando. */
let CAL_FILTRO = load(K.calpares, null);
if(!Array.isArray(CAL_FILTRO) || !CAL_FILTRO.length) CAL_FILTRO = PARES.slice();

/* ⏰ AVISOS / RUTINA — recordatorios por hora (Brasil), en segundo plano vía Web Push.
   dias: "LV"=lun-vie, "V"=viernes, "D"=todos. tipo: "normal" | "fuerte" (persistente+vibración fuerte). */
const AVISOS_DEFAULT = [
  { id:"r1", hora:"07:55", tit:"🧭 Reset de disciplina", dias:"LV", tipo:"normal", on:true, msg:"RESET DE DISCIPLINA antes de Pre-NY. El cupo de hoy es el de mi config del panel 🤖. Riesgo 0.5%. Solo setups A+ y B. Si 2 SL, cierro plataforma." },
  { id:"r2", hora:"08:00", tit:"🧠 Correr prompt diario", dias:"LV", tipo:"fuerte", on:true, msg:"Correr prompt DIARIO en Claude. Pre-NY Kill Zone en 30 min. Revisar setup A+ o B en el indicador." },
  { id:"r3", hora:"08:30", tit:"⚡ Pre-NY Kill Zone abierta", dias:"LV", tipo:"fuerte", on:true, msg:"Pre-NY Kill Zone abierta (08:30–10:30 Brasil). MEJOR ventana del día. Espera señal de entrada del indicador en M5/M3." },
  { id:"r4", hora:"10:15", tit:"🔔 NY Open en 15 min", dias:"LV", tipo:"normal", on:true, msg:"NY Open en 15 min. Confirma zona de reacción." },
  { id:"r5", hora:"10:30", tit:"🇺🇸 NY Apertura activa", dias:"LV", tipo:"normal", on:true, msg:"NY Apertura activa. Ventana válida hasta las 12:30 Brasil." },
  { id:"r6", hora:"12:15", tit:"⚠️ NY almuerzo en 15 min", dias:"LV", tipo:"normal", on:true, msg:"NY almuerzo en 15 min. Cierra ventana de entradas." },
  { id:"r7", hora:"12:30", tit:"🚫 Sesión cerrada", dias:"LV", tipo:"normal", on:true, msg:"Sesión cerrada. No más entradas. Solo gestión de posiciones." },
  { id:"r8", hora:"13:00", tit:"📅 Viernes — cerrar posiciones", dias:"V", tipo:"fuerte", on:true, msg:"Viernes — cierra posiciones antes del fin de semana. No abras nuevas. Revisa la bitácora de la semana." }
];
let REMINDERS = load(K.reminders, null);
if(!Array.isArray(REMINDERS)) REMINDERS = AVISOS_DEFAULT.map(x=>({...x}));
function guardarReminders(){ save(K.reminders, REMINDERS); }
/* Sube los avisos al worker para que el vigilante (cron) los dispare en segundo plano */
async function syncReminders(){
  if(!IA.url) return;
  try{ await fetch(IA.url.replace(/\/+$/,"")+"/rem/set",{ method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({reminders:REMINDERS}) }); }catch(_){}
}
/* Ajustes de notificaciones de Roberto */
let NOTIF = load(K.notif, { on:false, killzone:true, cuentaDD:true });
if(!NOTIF || typeof NOTIF!=="object") NOTIF = { on:false, killzone:true, cuentaDD:true };
function guardarNotif(){ save(K.notif, NOTIF); }

/* Migración: trades viejos sin modo/estrategia → real + CRT Elite */
(function migrar(){
  let cambió=false;
  TRADES.forEach(t=>{
    if(!t.modo){ t.modo="real"; cambió=true; }
    if(!t.estrategia){ t.estrategia="CRT Elite"; cambió=true; }
  });
  if(cambió) save(K.trades,TRADES);
})();

function guardarCtx(){ save(K.ctx,CTX); }
function guardarEstrategias(){ save(K.estr,ESTRATEGIAS); }

/* Trades del contexto activo (modo + estrategia) */
function tradesCtx(){
  return TRADES.filter(t=>t.modo===CTX.modo && t.estrategia===CTX.estrategia);
}

/* ---------- UTILIDADES ---------- */
const $  = s => document.querySelector(s);
const el = (t,c,h)=>{ const e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; };
const esc= s => String(s==null?"":s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const r1 = n => (Math.round(n*10)/10).toFixed(1);
const r2 = n => (Math.round(n*100)/100).toFixed(2);
const r0 = n => Math.round(n||0).toLocaleString("en-US");
const pct= n => Math.round(n)+"%";

function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove("show"),2400);
}

/* Fecha "hoy" en formato YYYY-MM-DD (hora local de Timbó) */
function hoyISO(){
  const d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function fechaCorta(iso){
  const [y,m,d]=iso.split("-");
  const MS=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return d+" "+MS[+m-1];
}
function diaSemana(iso){
  const d=new Date(iso+"T12:00:00");
  return ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][d.getDay()];
}
/* Lunes de la semana de una fecha ISO */
function lunesDe(iso){
  const d=new Date(iso+"T12:00:00");
  const off=(d.getDay()+6)%7;
  d.setDate(d.getDate()-off);
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

/* ---------- RELOJES + VENTANA ---------- */
function horaNY(){
  const now=new Date();
  const f=new Intl.DateTimeFormat("es-ES",{timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",hour12:false,weekday:"long"});
  const p={}; f.formatToParts(now).forEach(x=>p[x.type]=x.value);
  const h=(+p.hour)%24, m=+p.minute;
  /* día de la semana en NY (0=Dom … 6=Sáb) para saber si el mercado está abierto */
  const w=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",weekday:"short"}).format(now);
  const WD={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}; const wd=WD[w]!=null?WD[w]:0;
  return { h, m, wd, dec:h+m/60, txt:String(h).padStart(2,"0")+":"+String(m).padStart(2,"0"),
           dia:p.weekday.charAt(0).toUpperCase()+p.weekday.slice(1) };
}
/* ¿Está el mercado FOREX abierto? Cerrado sábado todo el día, domingo hasta las
   17:00 NY, y viernes desde las 17:00 NY. (El indicador y sus killzones son de
   Forex; para cripto —24/7— esto no aplica, pero su operativa actual es FX.) */
function forexAbierto(ny){
  ny=ny||horaNY(); const d=ny.wd, hd=ny.dec;
  if(d===6) return false;            // Sábado
  if(d===0 && hd<17) return false;   // Domingo antes de 17:00 NY
  if(d===5 && hd>=17) return false;  // Viernes tras 17:00 NY
  return true;
}
/* Motivo legible de por qué el FX está cerrado (para el reloj y el parte del día) */
function fxCerradoMotivo(ny){
  ny=ny||horaNY();
  if(ny.wd===6 || (ny.wd===0 && ny.dec<17)) return "Fin de semana · Forex cerrado hasta el domingo 17:00 NY";
  if(ny.wd===5 && ny.dec>=17) return "Forex cerrado (viernes tarde) · abre el domingo 17:00 NY";
  return "Mercado cerrado";
}
/* ── ⏰ VENTANAS CONFIGURABLES (v6.16, pedido de Rey 27-08: "que sean configurables para
   sincronizarlas con el indicador y el Ejecutor") ── Las horas de VENTANAS (data.js) son
   solo los VALORES DE FÁBRICA; aquí se aplican los ajustes que Rey guarde (hora NY),
   viven en su nube ☁️ (NUBE_KEYS) y el cartel/notificaciones los usan al instante. */
function ventFmt(dec){ const h=Math.floor(dec), m=Math.round((dec-h)*60); return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0"); }
function ventAplicarOverrides(){
  try{
    const ov=load(K.vents,null); if(!Array.isArray(ov)) return;
    ov.forEach(o=>{ const v=VENTANAS.find(x=>x.n===o.n); if(v && v.s!=null && typeof o.s==="number" && typeof o.e==="number" && o.s<o.e){ v.s=o.s; v.e=o.e; v.h=ventFmt(o.s)+"−"+ventFmt(o.e)+" NY"; } });
  }catch(_){}
}
ventAplicarOverrides();
function abrirVentanasCfg(){
  const editables=VENTANAS.filter(v=>v.s!=null);
  const filas=editables.map((v,i)=>'<div style="display:flex;align-items:center;gap:8px;margin-top:8px">'+
    '<span style="flex:1">'+esc(v.n)+(v.bad?' <span style="opacity:.7;font-size:.85em">(no operar)</span>':'')+'</span>'+
    '<input type="time" class="inp vc-ini" data-i="'+i+'" value="'+ventFmt(v.s)+'" style="width:auto">'+
    '<span>→</span>'+
    '<input type="time" class="inp vc-fin" data-i="'+i+'" value="'+ventFmt(v.e)+'" style="width:auto">'+
  '</div>').join("");
  abrirModal('<div class="modal-t">⏰ Ventanas del día (hora Nueva York)</div>'+
    '<p class="desc">Las mismas horas que tus killzones del indicador. El Ejecutor tiene su propio horario en el panel 🤖 (Opera desde/hasta). Guardadas en tu nube ☁️.</p>'+filas,
    [
      { t:"De fábrica", fn:()=>{ save(K.vents,null); try{localStorage.removeItem(K.vents);}catch(_){} location.reload(); } },
      { t:"Cancelar", fn:cerrarModal },
      { t:"💾 Guardar", cls:"gold", fn:()=>{
          const aDec=(s)=>{ const m=String(s||"").match(/^(\d{1,2}):(\d{2})$/); return m?(+m[1])+(+m[2])/60:null; };
          const ov=[]; let mal=null;
          document.querySelectorAll(".vc-ini").forEach(inp=>{
            const i=+inp.dataset.i, v=editables[i];
            const fin=document.querySelector('.vc-fin[data-i="'+i+'"]');
            const s=aDec(inp.value), e=aDec(fin&&fin.value);
            if(s==null||e==null||s>=e){ mal=v.n; return; }
            ov.push({ n:v.n, s:s, e:e });
          });
          if(mal){ toast("⚠️ Revisa "+mal+": el inicio debe ser antes del fin"); return; }
          save(K.vents,ov); ventAplicarOverrides(); cerrarModal(); tickRelojes();
          try{ notifProgramarKillzones(); }catch(_){}
          toast("⏰ Ventanas guardadas (hora NY) — cartel y avisos sincronizados");
        } },
    ]);
}
function tickRelojes(){
  const ny=horaNY();
  $("#cNY").textContent=ny.txt;
  $("#dNY").textContent=ny.dia;
  const br=new Date();
  $("#cBR").textContent=String(br.getHours()).padStart(2,"0")+":"+String(br.getMinutes()).padStart(2,"0");

  const box=$("#vent"), t=$("#ventT"), s=$("#ventS");
  const abierto=forexAbierto(ny);
  let activa=null;
  if(abierto){ for(const v of VENTANAS){ if(v.s!=null && !v.bad && ny.dec>=v.s && ny.dec<v.e){ activa=v; break; } } }
  box.className="vent "+(activa ? (activa.cls==="hl"?"best":"on") : "off");
  notifChequearKillzone(activa);
  if(activa){
    t.textContent=activa.n+" · ACTIVA";
    s.textContent = activa.cls==="hl" ? "Tu mejor ventana. Checklist antes de tocar nada." : "Ventana válida ("+activa.h+" NY)";
  }else if(!abierto){
    t.textContent="🔒 Mercado cerrado";
    s.textContent=fxCerradoMotivo(ny);
  }else{
    t.textContent="Fuera de ventana";
    let prox=null;
    for(const v of VENTANAS){ if(v.s!=null && !v.bad && v.s>ny.dec){ prox=v; break; } }
    s.textContent = prox ? "Próxima: "+prox.n+" a las "+prox.h.split("−")[0]+" NY" : "Espera la próxima killzone";
  }
}

/* ============================================================
   NOTIFICACIONES DE ROBERTO (Fase A — local, sin puente)
   Avisos de: ventana operativa (killzone), cuenta cerca del DD.
   Usa Notification API. Con app abierta funciona siempre; con app
   cerrada, si el teléfono soporta TimestampTrigger, los avisos de
   killzone quedan programados por adelantado.
   ============================================================ */
function notifSoportado(){ return "Notification" in window; }
async function notifPermiso(){
  if(!notifSoportado()) return false;
  if(Notification.permission==="granted") return true;
  if(Notification.permission==="denied") return false;
  try{ return (await Notification.requestPermission())==="granted"; }catch(_){ return false; }
}
/* Evita repetir el mismo aviso el mismo día */
function notifYaHoy(clave){
  let log={}; try{ log=JSON.parse(localStorage.getItem(K.notiflog)||"{}"); }catch(_){}
  if(log[clave]) return true;
  log[clave]=Date.now();
  Object.keys(log).forEach(x=>{ if(Date.now()-log[x]>3*86400000) delete log[x]; });
  try{ localStorage.setItem(K.notiflog, JSON.stringify(log)); }catch(_){}
  return false;
}
/* Chime PROFESIONAL propio de Apex (3 notas ascendentes tipo campana).
   Suena cuando la app está abierta, para que se distinga del sonido normal. */
let _actx=null;
function sonarAlerta(){
  try{
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    _actx=_actx||new AC(); const ac=_actx; if(ac.state==="suspended") ac.resume();
    const now=ac.currentTime;
    const master=ac.createGain(); master.gain.value=0.9; master.connect(ac.destination);
    [[783.99,0],[1046.50,0.11],[1567.98,0.22]].forEach(([f,t])=>{ // G5, C6, G6
      const o=ac.createOscillator(), g=ac.createGain();
      o.type="triangle"; o.frequency.value=f; o.connect(g); g.connect(master);
      const s=now+t;
      g.gain.setValueAtTime(0.0001,s);
      g.gain.exponentialRampToValueAtTime(0.3,s+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,s+0.55);
      o.start(s); o.stop(s+0.6);
    });
  }catch(_){}
}
function notifLanzar(titulo, cuerpo, tag){
  if(!notifSoportado() || Notification.permission!=="granted") return;
  /* vibración distintiva (Android): patrón propio de Apex */
  const opts={ body:cuerpo, icon:"icon-192.png", badge:"icon-192.png", tag:tag||"apex", lang:"es",
    vibrate:[120,60,120,60,220], renotify:true };
  try{
    if(navigator.serviceWorker && navigator.serviceWorker.ready){
      navigator.serviceWorker.ready.then(reg=>reg.showNotification(titulo,opts)).catch(()=>{ try{ new Notification(titulo,opts); }catch(_){}} );
    } else { new Notification(titulo,opts); }
  }catch(_){}
  /* con la app abierta, suena el chime propio de Apex */
  try{ if(document.visibilityState==="visible") sonarAlerta(); }catch(_){}
}
/* Detecta la ENTRADA a una ventana operativa (llamado por el reloj).
   IMPORTANTE: el aviso "a la hora que toca CON LA APP CERRADA" lo manda el
   SERVIDOR (Cloudflare cron + Web Push), no esto. Esto es solo un extra para
   cuando la app está ABIERTA. Por eso, al abrir Apex estando YA dentro de una
   ventana, NO disparamos nada (sería un aviso viejo y molesto, como pasaba a
   las 12pm): sembramos el estado en el primer tick y solo avisamos en la
   TRANSICIÓN real de entrar a una ventana con la app ya abierta. */
let _kzPrev=null, _kzInit=false;
function notifChequearKillzone(activa){
  const nom=activa?activa.n:null;
  if(!_kzInit){ _kzPrev=nom; _kzInit=true; return; }   // primer tick al abrir: no avisar
  if(NOTIF.on && NOTIF.killzone && nom && nom!==_kzPrev){
    if(!notifYaHoy(hoyISO()+"|kz|"+nom)){
      const best = activa.cls==="hl";
      notifLanzar("⏰ "+nom, (best?"Tu MEJOR ventana. ":"")+"Estás en ventana operativa. Repasa el checklist antes de operar.", "kz");
    }
  }
  _kzPrev=nom;
}
/* Programa por adelantado las killzones de los próximos días (si el móvil lo soporta) */
function notifProgramarKillzones(){
  if(!NOTIF.on || !NOTIF.killzone) return;
  if(!("TimestampTrigger" in window) || !navigator.serviceWorker) return;
  navigator.serviceWorker.ready.then(async reg=>{
    try{
      const prev=await reg.getNotifications({includeTriggered:false});
      prev.forEach(n=>{ if(n.tag && n.tag.indexOf("kzp")===0) n.close(); });
    }catch(_){}
    const nowDec=horaNY().dec, now=Date.now();
    const kz=[{h:2.0,n:"Londres"},{h:7.5,n:"Pre-NY Kill Zone"},{h:9.5,n:"NY Apertura"}];
    for(let d=0; d<4; d++){
      kz.forEach(z=>{
        const deltaH=(z.h-nowDec)+d*24;
        if(deltaH<=0.03) return;
        const when=now+deltaH*3600000, wd=new Date(when).getDay();
        if(wd===0||wd===6) return;
        try{ reg.showNotification("⏰ "+z.n, { body:"Entraste en ventana operativa. Repasa el checklist antes de operar.",
          tag:"kzp"+d+"-"+z.h, icon:"icon-192.png", badge:"icon-192.png",
          showTrigger:new window.TimestampTrigger(when) }); }catch(_){}
      });
    }
  }).catch(()=>{});
}
/* Avisa de cuentas cerca de romper el drawdown (PELIGRO) */
function notifChequearCuentasDD(){
  if(!NOTIF.on || !NOTIF.cuentaDD) return;
  CUENTAS.forEach(c=>{
    const ddMax=+c.ddMaxPct||0; if(!ddMax) return;
    const st=statsCuenta(c);
    if(st.progresoPct<0){
      const margen=ddMax-Math.abs(st.progresoPct);
      if(margen<=ddMax*0.3){
        if(!notifYaHoy(hoyISO()+"|dd|"+c.id)){
          notifLanzar("🔴 "+(c.alias||c.firma||"Cuenta")+" en peligro",
            "Vas "+r1(st.progresoPct)+"%. Te queda "+r1(Math.max(0,margen))+"% hasta romper el DD. Protégela: para o reduce riesgo.", "dd"+c.id);
        }
      }
    }
  });
}
/* ---------- WEB PUSH: avisos con la app CERRADA ---------- */
const VAPID_PUBLIC = "BMW3WSJQ0xxRIeDchPvPQ2FQM55W4zw5XUE8Dgb4oyYRYpRjglqjuRRI0tz_ROyLdCI4cfhXG4g3jaVDNK6npog";
function urlB64ToUint8Array(base64){
  const pad="=".repeat((4-base64.length%4)%4);
  const b=(base64+pad).replace(/-/g,"+").replace(/_/g,"/");
  const raw=atob(b); const out=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++) out[i]=raw.charCodeAt(i);
  return out;
}
function pushSoportado(){ return ("serviceWorker" in navigator) && ("PushManager" in window); }
/* Pares que debe vigilar el worker = filtro del calendario + pares de notificaciones (sin repetir) */
function paresParaPush(){ return [...new Set((CAL_FILTRO||[]).concat(PARES||[]))]; }
/* Suscribe este teléfono al push y manda la suscripción + sus pares al worker */
async function pushSubscribe(){
  if(!pushSoportado() || !IA.url) return false;
  try{
    const reg=await navigator.serviceWorker.ready;
    let sub=await reg.pushManager.getSubscription();
    if(!sub){
      sub=await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:urlB64ToUint8Array(VAPID_PUBLIC) });
    }
    const r=await fetch(IA.url.replace(/\/+$/,"")+"/push/subscribe",{
      method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({subscription:sub, pares:paresParaPush()})
    });
    return r.ok;
  }catch(e){ return false; }
}
/* Actualiza en el worker los pares que vigila el aviso automático de noticias */
async function pushConfigPares(){
  if(!IA.url) return;
  try{ await fetch(IA.url.replace(/\/+$/,"")+"/push/config",{
    method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({pares:paresParaPush()})
  }); }catch(_){}
}
/* Prueba en vivo: pide al worker que empuje un aviso a este teléfono (para probar con la app cerrada) */
async function pushProbar(){
  if(!IA.url){ toast("Configura el puente (⚙️)"); return; }
  const ok=await pushSubscribe();
  if(!ok){ toast("No pude suscribir el push. Revisa el permiso y el puente."); return; }
  toast("Enviando aviso de prueba… cierra la app para verlo llegar");
  try{
    const r=await fetch(IA.url.replace(/\/+$/,"")+"/push/selftest");
    const j=await r.json().catch(()=>({}));
    if(j && j.sent>0) toast("Aviso enviado ✓ (a "+j.sent+" dispositivo/s)");
    else toast("No había suscripción activa. Vuelve a activar las notificaciones.");
  }catch(_){ toast("No pude contactar el puente para la prueba"); }
}
/* Enciende/apaga las notificaciones */
async function notifActivar(on){
  if(on){
    const ok=await notifPermiso();
    if(!ok){ toast("Activa los permisos de notificación del teléfono"); NOTIF.on=false; guardarNotif(); return false; }
    NOTIF.on=true; guardarNotif();
    pushSubscribe();  /* suscribe el push para avisos con la app cerrada (best-effort) */
    notifLanzar("🔔 Roberto activado", "Te avisaré de tus ventanas operativas y si una cuenta se acerca al límite.", "test");
    notifProgramarKillzones(); notifChequearCuentasDD();
    return true;
  }
  NOTIF.on=false; guardarNotif();
  return false;
}
/* Refresca el panel de notificaciones en los ajustes de Roberto */
function notifRefrescarUI(){
  const nt=$("#iaNotifToggle");
  if(nt && notifSoportado()){ nt.innerHTML = NOTIF.on ? "🔔 Notificaciones: ACTIVADAS" : "🔕 Notificaciones: apagadas"; nt.classList.toggle("gold", !!NOTIF.on); }
  const nkz=$("#iaNotifKz"); if(nkz) nkz.checked=!!NOTIF.killzone;
  const ndd=$("#iaNotifDD"); if(ndd) ndd.checked=!!NOTIF.cuentaDD;
  const p=$("#iaPares"); if(p) p.value=PARES.join(", ");
}
/* Monedas de una lista de pares cualquiera (EUR/USD → EUR, USD) */
function monedasDe(arr){
  const set=new Set();
  (arr||[]).forEach(p=>{ (String(p).match(/[A-Za-z]{3}/g)||[]).forEach(m=>set.add(m.toUpperCase())); });
  if(set.has("XAU")||set.has("XAG")) set.add("USD"); // oro/plata se mueven con el USD
  return set;
}
/* Monedas que le importan a Rey, sacadas de sus pares de notificaciones */
function paresMonedas(){ return monedasDe(PARES); }
/* Fecha YYYY-MM-DD en Nueva York (off=0 hoy, 1 mañana) */
function nyFechaISO(off){
  const d=new Date(Date.now()+(off||0)*86400000);
  return new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
}
/* Lee el calendario REAL de ForexFactory a través del puente */
async function cargarCalendario(){
  if(!IA.url) return null;
  try{
    const r=await fetch(IA.url.replace(/\/+$/,"")+"/?calendar=1");
    if(!r.ok) return null;
    const data=await r.json();
    return Array.isArray(data)?data:null;
  }catch(_){ return null; }
}
/* Filtra el calendario a los pares de Rey, HOY y MAÑANA, alto/medio impacto */
function calendarioTexto(eventos){
  const mon=paresMonedas(), hoy=nyFechaISO(0), man=nyFechaISO(1);
  const rel=eventos.filter(e=>{
    const day=String(e.date||"").slice(0,10);
    return (day===hoy||day===man) && mon.has(String(e.country||"").toUpperCase()) && /High|Medium/i.test(e.impact||"");
  }).sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  if(!rel.length) return {texto:"", n:0};
  const lineas=rel.map(e=>{
    const day=String(e.date).slice(0,10)===hoy?"HOY":"MAÑANA";
    const hora=String(e.date).slice(11,16);
    const imp=/High/i.test(e.impact)?"ALTO 🔴":"MEDIO 🟠";
    return `- ${day} ${hora} NY | ${imp} | ${e.country} | ${e.title}`+(e.forecast?` (prev ${e.previous||"?"}, fcst ${e.forecast})`:"");
  });
  return {texto:lineas.join("\n"), n:rel.length};
}
/* Botón "noticias": lee el calendario REAL y se lo pasa a Roberto (sin buscar) */
async function iaNoticiasHoy(){
  const cb=$("#iaCfgBox"); if(cb) cb.style.display="none";
  abrirIA();
  toast("Leyendo el calendario de ForexFactory…");
  const eventos=await cargarCalendario();
  let q;
  if(eventos){
    const {texto,n}=calendarioTexto(eventos);
    if(n){
      q="Este es el CALENDARIO REAL de ForexFactory para mis pares ("+PARES.join(", ")+"), HOY y MAÑANA (hora NY):\n"+texto+"\n\nDime en lista breve cómo me afectan, en qué ventanas NO debo operar (15 min antes y después de cada roja/naranja), y prioriza las de ALTO impacto. Usa SOLO esta lista, no inventes otras.";
    }else{
      q="Leí el calendario real de ForexFactory y NO hay noticias de alto/medio impacto para mis pares ("+PARES.join(", ")+") hoy ni mañana. Confírmame que no hay bloqueos por noticias y recuérdame operar solo dentro de mi ventana.";
    }
  }else{
    q="Dime las noticias económicas de HOY y MAÑANA de alto/medio impacto para mis pares ("+PARES.join(", ")+"). Busca el calendario (ForexFactory/Investing/FXStreet). Si no traes tabla clara, completa con lo típico y dime que lo confirme. Hora NY, evento, impacto, par. No me dejes sin nada.";
  }
  setTimeout(()=>iaEnviar(q),200);
}

/* ---------- SECCIÓN 📰 NOTICIAS (calendario ForexFactory con filtro de pares) ---------- */
/* Texto compacto de una lista ya filtrada de eventos (para pasársela a Roberto) */
function calTextoDe(rel){
  const hoy=nyFechaISO(0);
  return rel.map(e=>{
    const day=String(e.date).slice(0,10)===hoy?"HOY":"MAÑANA";
    const hora=String(e.date).slice(11,16);
    const imp=/High/i.test(e.impact)?"ALTO 🔴":"MEDIO 🟠";
    return `- ${day} ${hora} NY | ${imp} | ${e.country} | ${e.title}`+(e.forecast?` (prev ${e.previous||"?"}, fcst ${e.forecast})`:"");
  }).join("\n");
}
/* Próxima ventana operativa (para el parte del día) */
function proximaVentana(){ const ny=horaNY(); for(const v of VENTANAS){ if(v.s!=null && !v.bad && v.s>ny.dec) return v; } return null; }
/* Resumen rápido de cuentas: total, en negativo, en peligro (cerca del DD) */
function cuentasResumen(){
  let peligro=0, negativo=0;
  (CUENTAS||[]).forEach(c=>{ const ddMax=+c.ddMaxPct||0; const st=statsCuenta(c);
    if(st && st.progresoPct<0){ negativo++; if(ddMax && (ddMax-Math.abs(st.progresoPct))<=ddMax*0.3) peligro++; } });
  return { total:(CUENTAS||[]).length, peligro, negativo };
}
/* MEJORA 2 — Veredicto "¿Puedo operar ahora?" cruzando ventana + noticias + cuentas */
function verdictoOperar(rel){
  const motivos=[]; let ok=true;
  const ny=horaNY();
  if(!forexAbierto(ny)){
    return { ok:false, motivos:[{ic:"🔒", t:fxCerradoMotivo(ny)+" — no hay nada que operar en Forex"}] };
  }
  const v=ventanaActiva();
  if(v) motivos.push({ic:"✅", t:"En ventana operativa: "+v.n});
  else { ok=false; const p=proximaVentana(); motivos.push({ic:"⛔", t:"Fuera de ventana"+(p?" · próxima "+p.n+" "+p.h.split("−")[0]+" NY":"")}); }
  const now=Date.now();
  const cerca=(rel||[]).map(e=>({e,m:Math.round((Date.parse(e.date)-now)/60000)})).filter(x=>!isNaN(x.m)&&Math.abs(x.m)<=15);
  if(cerca.length){ ok=false; const c=cerca.sort((a,b)=>Math.abs(a.m)-Math.abs(b.m))[0]; const imp=/High/i.test(c.e.impact)?"🔴":"🟠";
    motivos.push({ic:"⛔", t:"Noticia "+imp+" "+(c.m>=0?("en "+c.m+" min"):("hace "+(-c.m)+" min"))+": "+c.e.title+" (no operes)"}); }
  else motivos.push({ic:"✅", t:"Sin noticias a menos de 15 min"});
  const res=cuentasResumen();
  if(res.peligro) motivos.push({ic:"⚠️", t:res.peligro+" cuenta(s) cerca del límite (DD) — extrema el cuidado"});
  return { ok, motivos };
}
/* MEJORA 1 — "Parte del día": ventana + noticias + cuentas, de un vistazo */
function renderBrief(rel){
  const box=$("#ntBrief"); if(!box) return;
  const hoy=nyFechaISO(0);
  const hoyEv=(rel||[]).filter(e=>String(e.date).slice(0,10)===hoy);
  const alto=hoyEv.filter(e=>/High/i.test(e.impact)).length, medio=hoyEv.filter(e=>/Medium/i.test(e.impact)).length;
  const nyB=horaNY(); const fxOn=forexAbierto(nyB);
  const v=ventanaActiva(), prox=proximaVentana();
  const ventTxt = !fxOn ? ("🔒 "+fxCerradoMotivo(nyB))
                : v ? ("✅ "+v.n+" · ACTIVA")
                : ("⛔ Fuera de ventana"+(prox?" · próxima "+prox.n+" "+prox.h.split("−")[0]+" NY":""));
  const noticiasTxt = hoyEv.length ? ((alto?("🔴 "+alto+"  "):"")+(medio?("🟠 "+medio+"  "):"")+"hoy en tus pares") : "Sin noticias de impacto hoy en tus pares";
  const res=cuentasResumen();
  const ctaTxt = res.total ? (res.peligro?("⚠️ "+res.peligro+" en peligro"):(res.negativo?(res.negativo+" en negativo"):"todas OK"))+" · "+res.total+" cuenta(s)" : "";
  const fecha=new Intl.DateTimeFormat("es",{timeZone:"America/New_York",weekday:"long",day:"2-digit",month:"short"}).format(new Date());
  box.innerHTML=`<div class="card brief">
    <div class="brief-h">☀️ Parte del día<span class="brief-d">${esc(fecha)}</span></div>
    <div class="brief-row"><span class="brief-ic">🕐</span><span>${esc(ventTxt)}</span></div>
    <div class="brief-row"><span class="brief-ic">📰</span><span>${esc(noticiasTxt)}</span></div>
    ${res.total?`<div class="brief-row"><span class="brief-ic">🏦</span><span>${esc(ctaTxt)}</span></div>`:""}
    <button class="btn gold" id="ntPuedo" style="margin-top:12px">🚦 ¿Puedo operar AHORA?</button>
    <div id="ntVerdict"></div>
  </div>`;
  const bp=$("#ntPuedo");
  if(bp) bp.onclick=()=>{
    const vd=verdictoOperar(rel);
    const vb=$("#ntVerdict");
    vb.innerHTML=`<div class="verdict ${vd.ok?"ok":"no"}">
      <div class="verdict-t">${vd.ok?"✅ Puedes operar (con checklist)":"⛔ Mejor NO operar ahora"}</div>
      ${vd.motivos.map(m=>`<div class="verdict-l">${m.ic} ${esc(m.t)}</div>`).join("")}
      <button class="btn" id="ntPuedoIA" style="margin-top:10px">🧠 Que Roberto lo confirme</button>
    </div>`;
    const bi=$("#ntPuedoIA");
    if(bi) bi.onclick=()=>{ abrirIA(); setTimeout(()=>iaEnviar("¿Puedo operar AHORA mismo? Dame un veredicto corto y directo (SÍ/NO en la 1ª línea) cruzando: mi ventana operativa por el reloj, si hay noticia roja/naranja a menos de 15 min en mis pares (mira el bloque del calendario), y el estado de mis cuentas. Si es NO, dime por qué en una línea."),250); };
  };
}
function viewNoticias(){
  const v=el("div","view"); v.id="v-noticias";
  v.innerHTML=`
    <div id="ntBrief"></div>
    <div class="card">
      <div class="nt-head">
        <div class="nt-htxt"><div class="nt-tt">📅 Calendario económico</div>
          <div class="nt-sub">Datos reales de ForexFactory · hora de Nueva York</div></div>
        <a class="btn nt-ff" id="ntFF" href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener">ForexFactory ↗</a>
      </div>
      <div class="nt-filtro">
        <label class="nt-lb" for="ntPares">Filtra por los pares que estés operando ahora:</label>
        <div class="nt-row">
          <input class="inp" id="ntPares" placeholder="EUR/USD, GBP/USD, XAU/USD">
          <button class="btn gold" id="ntAceptar">✓ Aceptar</button>
        </div>
        <div class="nt-hint">Escribe los pares separados por coma y toca <b>✓ Aceptar</b> para traer solo sus noticias.</div>
      </div>
    </div>
    <div id="ntBody"></div>`;
  return v;
}
function renderNoticias(){
  const inp=$("#ntPares"); if(inp && document.activeElement!==inp) inp.value=CAL_FILTRO.join(", ");
  const ac=$("#ntAceptar");
  if(ac) ac.onclick=()=>{
    const val=($("#ntPares").value||"").split(",").map(x=>x.trim()).filter(Boolean);
    if(!val.length){ toast("Escribe al menos un par"); return; }
    CAL_FILTRO=val; save(K.calpares,CAL_FILTRO); pushConfigPares(); toast("Filtrando: "+val.join(", ")); cargarNoticiasUI();
  };
  cargarNoticiasUI();
}
async function cargarNoticiasUI(){
  const body=$("#ntBody"); if(!body) return;
  renderBrief([]);   /* parte del día (ventana + cuentas) al instante, antes del feed */
  body.innerHTML=`<div class="card"><div class="nt-load">⏳ Cargando calendario de ForexFactory…</div></div>`;
  if(!IA.url){
    body.innerHTML=`<div class="card"><div class="empty"><div class="t">Falta el puente</div>
      <div class="s">Abre a Roberto (✨) → ⚙️ Ajustes y guarda la dirección del puente para poder leer el calendario.</div></div></div>`;
    return;
  }
  const eventos=await cargarCalendario();
  if(!eventos){
    body.innerHTML=`<div class="card"><div class="empty"><div class="t">No pude leer el calendario</div>
      <div class="s">Revisa tu conexión o el puente. También puedes abrir ForexFactory con el botón de arriba ↗.</div></div></div>`;
    return;
  }
  const mon=monedasDe(CAL_FILTRO), hoy=nyFechaISO(0), man=nyFechaISO(1);
  const rel=eventos.filter(e=>{
    const day=String(e.date||"").slice(0,10);
    return (day===hoy||day===man) && mon.has(String(e.country||"").toUpperCase()) && /High|Medium/i.test(e.impact||"");
  }).sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  renderBrief(rel);   /* ahora con el conteo real de noticias de hoy */
  if(!rel.length){
    body.innerHTML=`<div class="card"><div class="nt-ok"><div class="t">✅ Vía libre</div>
      <div class="s">Sin noticias de alto/medio impacto para <b>${esc(CAL_FILTRO.join(", "))}</b> hoy ni mañana. Opera dentro de tu ventana con normalidad.</div></div></div>`;
    return;
  }
  const grupos={};
  rel.forEach(e=>{ const day=String(e.date).slice(0,10); (grupos[day]=grupos[day]||[]).push(e); });
  let html="";
  Object.keys(grupos).sort().forEach(day=>{
    const et=day===hoy?"HOY":(day===man?"MAÑANA":day);
    html+=`<div class="card"><div class="nt-day">${et}</div>`;
    grupos[day].forEach(e=>{
      const hora=String(e.date).slice(11,16);
      const alto=/High/i.test(e.impact);
      html+=`<div class="nt-ev ${alto?"alto":"medio"}">
        <div class="nt-ev-l"><span class="nt-dot"></span><span class="nt-hh">${esc(hora)}</span></div>
        <div class="nt-ev-m"><div class="nt-ev-t">${esc(e.title||"")}</div>
          <div class="nt-ev-s">${esc(e.country||"")} · ${alto?"ALTO 🔴":"MEDIO 🟠"}${e.forecast?` · prev ${esc(String(e.previous||"?"))} → fcst ${esc(String(e.forecast))}`:""}</div></div>
      </div>`;
    });
    html+=`</div>`;
  });
  html+=`<div class="card"><button class="btn gold" id="ntRoberto" style="width:100%">🧠 Que Roberto me explique cómo operar con esto</button></div>`;
  body.innerHTML=html;
  const rb=$("#ntRoberto");
  if(rb) rb.onclick=()=>{
    const texto=calTextoDe(rel);
    abrirIA();
    setTimeout(()=>iaEnviar("Este es el CALENDARIO REAL de ForexFactory para los pares que estoy operando ("+CAL_FILTRO.join(", ")+"), HOY y MAÑANA (hora NY):\n"+texto+"\n\nDime en lista breve cómo me afectan, en qué ventanas NO debo operar (15 min antes y después de cada roja/naranja), y prioriza las de ALTO impacto. Usa SOLO esta lista, no inventes otras."),250);
  };
}

/* ---------- SECCIÓN ⏰ AVISOS (rutina / recordatorios) ---------- */
/* Días configurables: guardamos un array [1..7] (1=Lun … 7=Dom).
   parseDias acepta arrays, "LV"/"V"/"D"/"todos"/"finde" o "lun,mie" y devuelve el array. */
const DIA_NOMS = ["","Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const DIA_MAP = { lun:1,mon:1,mar:2,tue:2,mie:3,wed:3,jue:4,thu:4,vie:5,fri:5,sab:6,sat:6,dom:7,sun:7 };
function parseDias(v){
  if(Array.isArray(v)){ const out=v.map(x=> typeof x==="number" ? x : DIA_MAP[String(x).toLowerCase().slice(0,3)] ).filter(Boolean); return [...new Set(out)].sort((a,b)=>a-b); }
  const s=String(v||"").toLowerCase().trim();
  if(s==="d"||s==="todos"||s==="diario") return [1,2,3,4,5,6,7];
  if(s==="lv"||s==="l-v") return [1,2,3,4,5];
  if(s==="v") return [5];
  if(s==="finde"||s==="fin de semana") return [6,7];
  const parts=s.split(/[ ,;]+/).map(x=>DIA_MAP[x.slice(0,3)]).filter(Boolean);
  return parts.length ? [...new Set(parts)].sort((a,b)=>a-b) : [1,2,3,4,5];
}
function diasLabel(v){
  const a=parseDias(v);
  if(a.length===7) return "Todos los días";
  if(a.join()==="1,2,3,4,5") return "Lun–Vie";
  if(a.join()==="6,7") return "Fin de semana";
  return a.map(d=>DIA_NOMS[d]).join(", ");
}
/* ============================================================
   🎯 DESTINOS DE LOS AVISOS — cada cosa a su sitio
   Al programar un aviso eliges a dónde te lleva el toque: una sección de Apex
   o una acción de Roberto. Así una notificación de "revisar la memoria" abre
   la memoria, y una de "parte del día" abre el parte. Cero navegación.
   v6.05 (Rey): TODOS los chips del chat de Roberto existen como destino — su
   aviso de backtesting de las 17:30 ahora abre 🎬 Práctica Replay (backtesting
   guiado), no un chat que no corresponde.
   ============================================================ */
/* 💬 Preguntas fijas de los chips del chat — UNA sola fuente de verdad: se usan
   en los chips del chat de Roberto Y como destino de aviso (rob:q:*), para que
   la notificación abra EXACTAMENTE la misma consulta que su chip. */
const IA_CHIP_QS = {
  operativa:"Analiza mi operativa reciente con mis datos: dime con claridad qué estoy haciendo bien, qué estoy haciendo mal y cómo lo corrijo paso a paso.",
  fuga:"Según mis datos, ¿cuál es mi mayor fuga ahora mismo y qué ejercicio concreto hago esta semana para corregirla?",
  gatillar:"Explícame con un ejemplo claro cómo confirmar el gatillo (barrido + MSS 15M + FVG) sin entrar antes de tiempo.",
  alarmas:"Recuérdame qué alarmas de mi indicador CRT Elite debo tener activas en cada par y por qué, y qué debo hacer cada vez que actualizo el indicador.",
  fondeo:"Voy a comprar 5 cuentas de fondeo para hacer los exámenes. Dame un plan concreto para pasarlos sin romper mis reglas.",
  firmas:"Compárame las principales empresas de fondeo (reglas, drawdown, precio aprox, payouts, reputación) con pros y contras, y dime cuáles me convienen y por qué, sin olvidar la diversificación. Avísame de lo que deba confirmar por ser un dato que cambia.",
  compuesto:"Explícame cómo usar el interés compuesto para escalar mis cuentas de fondeo con riesgo 0.5%. Hazme los números paso a paso con un ejemplo realista.",
  mejoras:"Haz una REVISIÓN COMPLETA DEL SISTEMA con todos los datos que tienes: mis operaciones del Diario, las del Ejecutor (y sus señales vetadas o descartadas), tu memoria y lo que sabes del indicador CRT Elite. Dime con honestidad: (1) qué está funcionando BIEN y no hay que tocar; (2) qué está fallando o rindiendo poco; (3) tu lista de MEJORAS concretas, priorizada — de mi estrategia, del indicador, de las reglas del Ejecutor o de cualquier parte de Apex. Si alguna mejora necesita cambio de código (indicador o app), dímelo claro y separado para que yo lo pida."
};
const IR_DESTINOS = [
  { v:"",              t:"— La app, sin más —" },
  /* Secciones de Apex */
  { v:"tab:hoy",       t:"🎯 Hoy" },
  { v:"tab:arranque",  t:"🧭 Plan con Roberto" },
  { v:"tab:checklist", t:"✅ Checklist" },
  { v:"tab:gatillo",   t:"⚡ Gatillo" },
  { v:"tab:riesgo",    t:"💰 Riesgo" },
  { v:"tab:diario",    t:"📒 Diario" },
  { v:"tab:analisis",  t:"📈 Análisis" },
  { v:"tab:galeria",   t:"🖼️ Galería" },
  { v:"tab:cuentas",   t:"🏦 Cuentas" },
  { v:"tab:noticias",  t:"📰 Noticias" },
  { v:"tab:almanaque", t:"📅 Almanaque" },
  { v:"tab:reglas",    t:"⛔ Reglas" },
  { v:"tab:conf",      t:"🎯 Confluencias" },
  { v:"tab:rutina",    t:"🗺️ Rutina" },
  { v:"tab:plan",      t:"📋 Plan" },
  { v:"tab:ejecutor",  t:"🤖 Ejecutor (sección)" },
  /* Acciones de Roberto */
  { v:"rob:memoria",   t:"🧠 Roberto · Mi memoria" },
  { v:"rob:gasto",     t:"💰 Roberto · Mi gasto" },
  { v:"rob:aciertos",  t:"🎯 Roberto · Cómo lee el mercado" },
  { v:"rob:plan",      t:"🧭 Roberto · Por dónde voy en mi plan" },
  { v:"rob:parte",     t:"🌅 Roberto · Parte del día" },
  { v:"rob:gonogo",    t:"✅ Roberto · GO/NO-GO" },
  { v:"rob:diario",    t:"📆 Roberto · Análisis del día (gráfico EN VIVO, pre-killzone)" },
  { v:"rob:semanal",   t:"🗓️ Roberto · Análisis semanal (gráfico EN VIVO + plan)" },
  { v:"rob:cierredia",    t:"🤖 Roberto · Cierre del día (evaluar MIS trades de hoy)" },
  { v:"rob:cierresemana", t:"🤖 Roberto · Cierre de semana (evaluar MIS trades)" },
  { v:"rob:progreso",  t:"📊 Roberto · Mi progreso" },
  { v:"rob:capturas",  t:"📸 Roberto · Estudia mis capturas" },
  { v:"rob:checkemo",  t:"🧠 Roberto · Check antes de operar" },
  { v:"rob:escalado",  t:"💰 Roberto · Escalado" },
  { v:"rob:comparar",  t:"⚖️ Roberto · Comparar pares" },
  { v:"rob:replay",    t:"🎬 Roberto · Práctica Replay (backtesting guiado)" },
  { v:"rob:ejecutor",  t:"🤖 Roberto · Ejecutor (mi bot en MT5)" },
  /* Chips de pregunta directa — el aviso abre el chat y lanza esa misma consulta */
  { v:"rob:q:operativa", t:"📊 Roberto · Analiza mi operativa" },
  { v:"rob:q:fuga",      t:"🩸 Roberto · Mi mayor fuga" },
  { v:"rob:q:gatillar",  t:"🎯 Roberto · Cómo gatillar" },
  { v:"rob:q:alarmas",   t:"🔔 Roberto · Mis alarmas" },
  { v:"rob:q:fondeo",    t:"🏦 Roberto · Plan de fondeo" },
  { v:"rob:q:firmas",    t:"⚖️ Roberto · Comparar firmas" },
  { v:"rob:q:compuesto", t:"📈 Roberto · Interés compuesto" },
  { v:"rob:q:mejoras",   t:"💡 Roberto · Mejoras del sistema" },
  { v:"rob:avisos",    t:"📥 Roberto · Avisos recibidos" },
  { v:"rob:hilo",      t:"📥 Roberto · El hilo del día (avisos de hoy)" },
  { v:"rob:chat",      t:"💬 Roberto · Abrir el chat" },
];
function irDestinoLabel(v){ const d=IR_DESTINOS.find(x=>x.v===v); return d?d.t:""; }
/* Lleva a Rey al destino del aviso. Se usa al abrir por notificación y desde el propio aviso. */
function irDestino(v){
  const s=String(v||"");
  if(!s) return;
  if(s.indexOf("tab:")===0){
    const id=s.slice(4);
    if(TABS.some(t=>t.id===id)) irA(id);
    return;
  }
  if(s.indexOf("rob:")!==0) return;
  const acc=s.slice(4);
  if(typeof abrirIA==="function") abrirIA();
  /* v6.05: chips de pregunta directa — abre el chat y lanza la misma consulta del chip */
  if(acc.indexOf("q:")===0){ const q=IA_CHIP_QS[acc.slice(2)]; if(q) setTimeout(()=>iaEnviar(q), 260); return; }
  const F={
    memoria: ()=>verMemoria(),
    gasto:   ()=>verGasto(),
    aciertos:()=>verAciertos(),
    plan:    ()=>preguntarPlan(),
    parte:   ()=>parteMatutino(),
    gonogo:  ()=>goNoGo(),
    /* 🔀 v6.21 (Rey, 28-08): estos destinos estaban CRUZADOS — "Análisis del día" llevaba al
       cierre de TRADES (evalDia) y por eso Roberto decía "hoy no tienes operaciones" cuando
       Rey quería el ANÁLISIS DEL GRÁFICO EN VIVO pre-killzone. Ahora: análisis = gráfico
       vivo; el cierre de trades tiene sus destinos propios (cierredia / cierresemana). */
    diario:  ()=>analisisDiario(),
    semanal: ()=>analisisSemanal(),
    cierredia:    ()=>evalDia(),
    cierresemana: ()=>evalSemana(),
    progreso:()=>progresoRoberto(),
    capturas:()=>estudiarCapturas(),
    checkemo:()=>checkEmocional(),
    escalado:()=>escaladoRoberto(),
    comparar:()=>compararPares(),
    replay:  ()=>practicaReplay(),
    ejecutor:()=>verEjecutor(),
    avisos:  ()=>verAvisos(),
    hilo:    ()=>abrirHiloDia(),
    chat:    ()=>{}
  };
  const fn=F[acc];
  if(fn) setTimeout(fn, 260);
}

function viewAvisos(){
  const v=el("div","view"); v.id="v-avisos";
  v.innerHTML=`
    <div class="card">
      <div class="nt-head">
        <div class="nt-htxt"><div class="nt-tt">⏰ Mis avisos</div>
          <div class="nt-sub">Tu rutina del día · te llegan aunque la app esté cerrada</div></div>
        <button class="btn nt-ff gold" id="avNuevo">＋ Nuevo</button>
      </div>
    </div>
    <div id="avBody"></div>`;
  return v;
}
function renderAvisos(){
  const nb=$("#avNuevo"); if(nb) nb.onclick=()=>avisoModal(null);
  const body=$("#avBody"); if(!body) return;
  if(!REMINDERS.length){
    body.innerHTML=`<div class="card"><div class="empty"><div class="t">Sin avisos</div>
      <div class="s">Toca ＋ Nuevo para crear tu primer recordatorio (o pídeselo a Roberto).</div></div></div>`;
    return;
  }
  const ord=REMINDERS.slice().sort((a,b)=>String(a.hora).localeCompare(String(b.hora)));
  body.innerHTML = ord.map(r=>`
    <div class="card av ${r.on?"":"av-off"}" data-card="${r.id}">
      <div class="av-top">
        <div class="av-hora">${esc(r.hora)}</div>
        <div class="av-tit">${esc(r.tit)}</div>
        <button class="av-sw ${r.on?"on":""}" data-tog="${r.id}" aria-label="Activar/desactivar"><span></span></button>
      </div>
      <div class="av-msg">${esc(r.msg)}</div>
      <div class="av-foot">
        <span class="av-tag">${esc(diasLabel(r.dias))}</span>
        <span class="av-tag ${r.tipo==="fuerte"?"fuerte":""}">${r.tipo==="fuerte"?"🔔 fuerte":"aviso"}</span>
        ${r.ir?`<span class="av-tag ir">→ ${esc(irDestinoLabel(r.ir))}</span>`:""}
        <span class="av-actions"><button class="btn av-btn" data-edit="${r.id}">✏️ Editar</button><button class="btn av-btn del" data-del="${r.id}">🗑️</button></span>
      </div>
    </div>`).join("") +
    `<div class="card"><button class="btn" id="avRoberto" style="width:100%">🧠 Pídele a Roberto una rutina nueva</button></div>`;
  // Tocar cualquier parte de la tarjeta abre la edición (fácil en el móvil)
  body.querySelectorAll("[data-card]").forEach(c=>c.onclick=()=>avisoModal(c.dataset.card));
  body.querySelectorAll("[data-tog]").forEach(b=>b.onclick=(e)=>{ e.stopPropagation(); toggleAviso(b.dataset.tog); });
  body.querySelectorAll("[data-edit]").forEach(b=>b.onclick=(e)=>{ e.stopPropagation(); avisoModal(b.dataset.edit); });
  body.querySelectorAll("[data-del]").forEach(b=>b.onclick=(e)=>{ e.stopPropagation(); borrarAviso(b.dataset.del); });
  const rb=$("#avRoberto"); if(rb) rb.onclick=()=>{ abrirIA(); setTimeout(()=>iaEnviar("Ayúdame a crear un recordatorio nuevo para mi rutina de trading. Pregúntame la hora, qué me recordará y si es de lunes a viernes o un día concreto. Cuando lo tengamos, dímelo en una línea corta y clara para que yo lo guarde en mis avisos."),250); };
}
function toggleAviso(id){ const r=REMINDERS.find(x=>x.id===id); if(!r) return; r.on=!r.on; guardarReminders(); syncReminders(); renderAvisos(); toast(r.on?"Aviso activado":"Aviso en pausa"); }
function borrarAviso(id){ const r=REMINDERS.find(x=>x.id===id); if(!r) return;
  abrirModal(`<div class="modal-t">¿Borrar este aviso?</div><p class="desc">${esc(r.hora)} · ${esc(r.tit)}</p>`,
    [{t:"Cancelar",fn:cerrarModal},{t:"Borrar",cls:"danger",fn:()=>{ REMINDERS=REMINDERS.filter(x=>x.id!==id); guardarReminders(); syncReminders(); cerrarModal(); renderAvisos(); toast("Aviso borrado"); }}]); }
function avisoModal(id){
  const r = id ? REMINDERS.find(x=>x.id===id) : { hora:"08:00", tit:"", msg:"", dias:"LV", tipo:"normal" };
  if(!r) return;
  const sel=parseDias(r.dias);
  const opt=(val,cur,txt)=>`<option value="${val}" ${val===cur?"selected":""}>${txt}</option>`;
  const chips=[1,2,3,4,5,6,7].map(d=>`<button type="button" class="dia-chip${sel.includes(d)?" on":""}" data-dia="${d}">${DIA_NOMS[d]}</button>`).join("");
  abrirModal(`
    <div class="modal-t">${id?"Editar aviso":"Nuevo aviso"}</div>
    <label class="fl">Hora (Brasil)</label>
    <input class="inp" id="avHora" type="time" value="${esc(r.hora)}">
    <label class="fl" style="margin-top:10px">Título (con emoji)</label>
    <input class="inp" id="avTit" placeholder="⚡ Pre-NY Kill Zone" value="${esc(r.tit)}">
    <label class="fl" style="margin-top:10px">Mensaje</label>
    <textarea class="inp" id="avMsg" rows="3" placeholder="Qué te recuerda…">${esc(r.msg)}</textarea>
    <label class="fl" style="margin-top:10px">Días (toca los que quieras)</label>
    <div class="dias-row" id="avDias">${chips}</div>
    <label class="fl" style="margin-top:10px">Al tocar la notificación, abrir</label>
    <select class="inp" id="avIr">${IR_DESTINOS.map(d=>`<option value="${d.v}"${d.v===(r.ir||"")?" selected":""}>${d.t}</option>`).join("")}</select>
    <label class="fl" style="margin-top:12px">Tipo</label>
    <select class="inp" id="avTipo">${opt("normal",r.tipo,"Aviso normal")}${opt("fuerte",r.tipo,"Fuerte (se queda en pantalla + vibración fuerte)")}</select>
  `,[{t:"Cancelar",fn:cerrarModal},{t:"Guardar",cls:"gold",fn:()=>guardarAvisoForm(id)}]);
  document.querySelectorAll("#avDias .dia-chip").forEach(b=>b.onclick=()=>b.classList.toggle("on"));
}
function guardarAvisoForm(id){
  const hora=($("#avHora").value||"").trim();
  const tit=($("#avTit").value||"").trim();
  const msg=($("#avMsg").value||"").trim();
  const dias=[...document.querySelectorAll("#avDias .dia-chip.on")].map(b=>+b.dataset.dia).sort((a,b)=>a-b);
  const tipo=$("#avTipo").value;
  if(!/^\d{2}:\d{2}$/.test(hora)){ toast("Pon una hora válida"); return; }
  if(!tit){ toast("Ponle un título"); return; }
  if(!msg){ toast("Escribe el mensaje"); return; }
  if(!dias.length){ toast("Elige al menos un día"); return; }
  const ir=($("#avIr")&&$("#avIr").value)||"";
  if(id){ const r=REMINDERS.find(x=>x.id===id); if(r){ Object.assign(r,{hora,tit,msg,dias,tipo,ir}); } }
  else { REMINDERS.push({ id:"r"+Date.now().toString(36), hora, tit, msg, dias, tipo, ir, on:true }); }
  guardarReminders(); syncReminders(); cerrarModal(); renderAvisos(); toast("Aviso guardado ✓");
  robertoVigila((id?"Editó":"Creó")+" un AVISO de rutina: "+hora+" · "+tit+" — “"+msg+"” ("+diasLabel(dias)+", "+tipo+").");
}

/* ---------- NAVEGACIÓN ---------- */
/* Orden por CÓMO SE USA EL DÍA, no por cuándo se construyó cada sección:
   1) planificar  →  2) el plan con Roberto  →  3) decidir  →  4) ejecutar
   →  5) registrar  →  6) revisar  →  7) datos  →  8) referencia de consulta. */
const TABS=[
  /* ── El día ── */
  {id:"hoy",       ic:"🎯", n:"Hoy"},
  {id:"arranque",  ic:"🧭", n:"Plan con Roberto"},
  /* ── Antes de entrar ── */
  {id:"checklist", ic:"✅", n:"Checklist"},
  {id:"gatillo",   ic:"⚡", n:"Gatillo"},
  {id:"riesgo",    ic:"💰", n:"Riesgo"},
  /* ── Después de operar ── */
  {id:"diario",    ic:"📒", n:"Diario"},
  {id:"analisis",  ic:"📈", n:"Análisis"},
  {id:"galeria",   ic:"🖼️", n:"Galería"},
  {id:"cuentas",   ic:"🏦", n:"Cuentas"},
  {id:"ejecutor",  ic:"🤖", n:"Ejecutor"},
  /* ── Datos del mercado ── */
  {id:"noticias",  ic:"📰", n:"Noticias"},
  {id:"almanaque", ic:"📅", n:"Almanaque"},
  {id:"avisos",    ic:"⏰", n:"Avisos"},
  /* ── Consulta ── */
  {id:"reglas",    ic:"⛔", n:"Reglas"},
  {id:"conf",      ic:"🎯", n:"Confluencias"},
  {id:"rutina",    ic:"🗺️", n:"Rutina"},
  {id:"plan",      ic:"📋", n:"Plan"},
  {id:"mentor",    ic:"🧠", n:"Mentor"}
];
let TAB="hoy";

function irA(id){
  TAB=id;
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("on",v.id==="v-"+id));
  document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.t===id));
  window.scrollTo({top:0,behavior:"instant"});
  if(id==="hoy")     { renderHoy(); if(!HOY_EV) hoyCargarNoticias(); }
  if(id==="arranque") renderArranque();
  if(id==="analisis") renderAnalisis();
  if(id==="diario")   renderDiario();
  if(id==="galeria")  renderGaleria();
  if(id==="gatillo")  renderGatillo();
  if(id==="mentor")   renderMentor();
  if(id==="almanaque")renderAlmanaque();
  if(id==="cuentas")  renderCuentas();
  if(id==="noticias") renderNoticias();
  if(id==="avisos")   renderAvisos();
  if(id==="ejecutor") renderEjecutor();
}
function buildNav(){
  const n=$("#nav"); n.innerHTML="";
  TABS.forEach(t=>{
    const b=el("button",t.id===TAB?"on":"",`<span class="i">${t.ic}</span>${t.n}`);
    b.dataset.t=t.id; b.onclick=()=>irA(t.id); n.appendChild(b);
  });
}

/* Menú desplegable con todas las secciones (más claridad, menos espacio) */
function abrirMenu(){
  let ov=$("#menuOv");
  if(!ov){
    ov=el("div","menu-ov"); ov.id="menuOv";
    ov.innerHTML=`<div class="menu-sheet">
      <div class="menu-h"><div class="t">Secciones</div><button class="x" id="menuX" aria-label="Cerrar">✕</button></div>
      <div class="menu-grid" id="menuGrid"></div></div>`;
    document.body.appendChild(ov);
    ov.onclick=e=>{ if(e.target===ov) cerrarMenu(); };
    $("#menuX").onclick=cerrarMenu;
  }
  const g=$("#menuGrid");
  g.innerHTML=TABS.map(t=>`<div class="menu-item${t.id===TAB?" on":""}" data-go="${t.id}">
    <span class="mi-ic">${t.ic}</span><span class="mi-t">${esc(t.n)}</span>
    <button class="mi-help" data-help="${t.id}" aria-label="¿Para qué sirve ${esc(t.n)}?">?</button></div>`).join("");
  g.querySelectorAll(".menu-item").forEach(it=>{ it.onclick=()=>{ irA(it.dataset.go); cerrarMenu(); }; });
  g.querySelectorAll(".mi-help").forEach(b=>{ b.onclick=(e)=>{ e.stopPropagation(); cerrarMenu(); abrirAyuda(b.dataset.help); }; });
  requestAnimationFrame(()=>ov.classList.add("show"));
}
function cerrarMenu(){ const o=$("#menuOv"); if(o) o.classList.remove("show"); }

/* Hace el botón de Roberto arrastrable a cualquier zona de la pantalla */
function hacerArrastrable(fab){
  const clamp=(v,mn,mx)=>Math.max(mn,Math.min(mx,v));
  const colocar=(left,top)=>{ const w=fab.offsetWidth||60,h=fab.offsetHeight||60;
    fab.style.left=clamp(left,6,window.innerWidth-w-6)+"px";
    fab.style.top =clamp(top ,6,window.innerHeight-h-6)+"px";
    fab.style.right="auto"; fab.style.bottom="auto"; };
  const pos=load(K.fabpos,null);
  if(pos && typeof pos.left==="number") requestAnimationFrame(()=>colocar(pos.left,pos.top));
  let sx,sy,ox,oy,moved=false,dragging=false;
  fab.addEventListener("pointerdown",e=>{
    dragging=true; moved=false;
    const r=fab.getBoundingClientRect(); ox=e.clientX-r.left; oy=e.clientY-r.top; sx=e.clientX; sy=e.clientY;
    try{ fab.setPointerCapture(e.pointerId); }catch(_){}
  });
  fab.addEventListener("pointermove",e=>{
    if(!dragging) return;
    if(!moved && (Math.abs(e.clientX-sx)>4||Math.abs(e.clientY-sy)>4)){ moved=true; fab.classList.add("dragging"); }
    if(moved) colocar(e.clientX-ox, e.clientY-oy);
  });
  const fin=()=>{ if(!dragging) return; dragging=false; fab.classList.remove("dragging");
    if(moved){ const r=fab.getBoundingClientRect(); save(K.fabpos,{left:r.left,top:r.top}); } };
  fab.addEventListener("pointerup",fin);
  fab.addEventListener("pointercancel",fin);
  fab.onclick=()=>{ if(moved){ moved=false; return; } abrirIA(); };
}

/* ============================================================
   AYUDA (?) — qué es y para qué sirve cada sección de la app.
   El botón "?" de la cabecera abre la ayuda de la pestaña actual.
   ============================================================ */
const AYUDA = {
  noticias:{ t:"📰 Noticias (calendario económico)", h:`<p><b>Para qué sirve:</b> el calendario económico <b>real de ForexFactory</b> con las noticias de HOY y MAÑANA que mueven tus pares (🔴 alto / 🟠 medio impacto), con hora de Nueva York, pronóstico y dato previo.</p>
    <p><b>Cómo usarlo:</b> arriba tienes un <b>filtro de pares</b> — viene con tus pares actuales, pero puedes borrarlo y escribir los que estés operando ahora (ej. <i>USD/JPY, XAU/USD</i>) y tocar <b>✓ Aceptar</b> para traer solo esas noticias. Regla de oro: <b>no operes 15 min antes ni después</b> de una roja. El botón <b>ForexFactory ↗</b> abre tu cuenta completa, y <b>🧠 Roberto</b> te explica cómo operar con lo que haya.</p>` },
  avisos:{ t:"⏰ Mis avisos (rutina)", h:`<p><b>Para qué sirve:</b> tus recordatorios del día (reset de disciplina, apertura de killzones, cierre de sesión, viernes…). Te llegan al teléfono <b>aunque la app esté cerrada</b>, a la hora de Brasil.</p>
    <p><b>Cómo usarlo:</b> activa/pausa cada aviso con el interruptor, edítalos o crea nuevos con <b>＋ Nuevo</b> (o pídeselo a <b>Roberto</b>). Los de tipo <b>Fuerte</b> se quedan en pantalla hasta que los tocas, con vibración fuerte (tipo alarma).</p>` },
  checklist:{ t:"✅ Checklist", h:`<p><b>Para qué sirve:</b> tu lista de control ANTES de operar. Marca cada casilla del setup; las marcadas como <b>CLAVE</b> son obligatorias.</p>
    <p><b>Cómo usarlo:</b> repásalo antes de cada entrada. Si falta una casilla CLAVE, el veredicto de abajo te dice <b>NO OPERAR</b>. Pulsa <b>🔄 Reiniciar</b> para empezar limpio en cada setup nuevo.</p>` },
  conf:{ t:"🎯 Confluencias", h:`<p><b>Para qué sirve:</b> tus 5 confluencias del método CRT (sweep, estructura, zona, etc.). Es tu recordatorio de qué debe alinearse para que un setup sea válido.</p>
    <p><b>Cómo usarlo:</b> consúltalo cuando dudes si un setup tiene peso suficiente. Regla de oro: <b>sin sweep = sin setup</b>.</p>` },
  rutina:{ t:"🗺️ Rutina", h:`<p><b>Para qué sirve:</b> tu mapa de trabajo por temporalidades — qué mira cada una (Daily = bias, H4 = zonas, 15M/1H = validación, 5M/3M = gatillo).</p>
    <p><b>Cómo usarlo:</b> síguelo de arriba hacia abajo antes de operar, para no saltarte pasos ni validar en la temporalidad equivocada.</p>` },
  reglas:{ t:"⛔ Reglas", h:`<p><b>Para qué sirve:</b> tus reglas inviolables. Tócalas para marcarlas como leídas/repasadas.</p>
    <p><b>Cómo usarlo:</b> léelas al empezar la sesión. Son la barrera contra tus fugas (sobre todo el <b>timing prematuro</b>).</p>` },
  riesgo:{ t:"💰 Riesgo", h:`<p><b>Para qué sirve:</b> tu <b>calculadora de lotaje</b>. Metes balance, % de riesgo (0.5% fijo), pips de SL y el par, y te da el tamaño exacto de la posición.</p>
    <p><b>Cómo usarlo:</b> calcúlalo antes de cada entrada para no arriesgar de más. Nunca improvises el lotaje.</p>` },
  gatillo:{ t:"⚡ Gatillo", h:`<p><b>Para qué sirve:</b> el detalle fino de tu <b>Fase 4</b> — el momento EXACTO de entrar (toque del POI → vela de rechazo → cierre de confirmación).</p>
    <p><b>Cómo usarlo:</b> úsalo para no entrar antes de tiempo. Solo disparas con la <b>vela de confirmación cerrada</b>.</p>` },
  diario:{ t:"📒 Diario", h:`<p><b>Para qué sirve:</b> aquí registras cada operación con todos sus detalles (par, resultado en R, momento de entrada, emoción, si rompiste el plan…).</p>
    <p><b>Cómo usarlo:</b> registra TODO, real y backtest. Usa la barra de arriba para elegir el contexto (Real / Backtest + estrategia). Elige la <b>cuenta de fondeo</b> a la que pertenece el trade para que sume en la pestaña 🏦 Cuentas. De estos datos se alimentan el Análisis y Roberto.</p>` },
  cuentas:{ t:"🏦 Cuentas", h:`<p><b>Para qué sirve:</b> gestionar tus cuentas de fondeo, reales y propias en un solo lugar: capital, reglas de la firma (drawdown, target, días), avance hacia el objetivo, retiros e interés compuesto.</p>
    <p><b>Cómo usarlo:</b> pulsa <b>➕ Nueva cuenta</b> y rellena sus datos. Cambia su fase con <b>⏭️ Avanzar fase</b> (Examen → Fondeada → Real). En el Diario, al registrar un trade, elige esta cuenta y aquí verás su rendimiento en vivo.</p>
    <p><b>Roberto</b> ve todas tus cuentas y te ayuda a gestionarlas, protegerlas y escalar con interés compuesto y diversificación.</p>` },
  almanaque:{ t:"📅 Almanaque", h:`<p><b>Para qué sirve:</b> tu calendario de resultados. Ves cada día pintado en verde/rojo según tu R, para detectar patrones (qué días operas mejor).</p>
    <p><b>Cómo usarlo:</b> toca un día para ver sus trades. Cambia de mes con las flechas.</p>` },
  analisis:{ t:"📈 Análisis", h:`<p><b>Para qué sirve:</b> tus estadísticas frías — win rate, profit factor, expectancy, drawdown, y cortes por categoría (por par, por momento, por sesión…).</p>
    <p><b>Cómo usarlo:</b> míralo cada semana para ver qué funciona y qué no, con números y no con sensaciones.</p>` },
  mentor:{ t:"🧠 Mentor (análisis automático)", h:`<p><b>Para qué sirve:</b> esta pestaña traduce tus números a <b>palabras</b>: qué hiciste bien, qué corregir y un plan — todo calculado en tu teléfono, sin internet.</p>
    <p><b>Ojo, no confundir:</b> esto es el <b>análisis automático</b>. El mentor con el que <b>chateas</b> es <b>Roberto</b>, el botón ✨ abajo a la derecha: a él le hablas, le mandas fotos y te responde (y te habla en voz si lo activas).</p>` },
  plan:{ t:"📋 Plan", h:`<p><b>Para qué sirve:</b> tu plan operativo completo y tu portada — reglas, ventanas, gestión, todo en un solo lugar de lectura.</p>
    <p><b>Cómo usarlo:</b> es tu documento de referencia. Despliega cada sección para repasar tu método cuando lo necesites.</p>` },
  ejecutor:{ t:"🤖 Ejecutor (tu bot en MT5)", h:`<p><b>Para qué sirve:</b> el panel de control del <b>Ejecutor</b> — el bot que ejecuta tus señales 🔔 A+ del indicador en tu cuenta <b>DEMO</b> de MT5, con TUS reglas (riesgo, límites, horario) y el <b>🛑 veto</b> de Roberto (noticias + contexto) antes de cada entrada.</p>
    <p><b>Cómo usarlo:</b> el botón <b>🟢 ENCENDER</b> lo deja EN GUARDIA (no entra nada hasta que tu indicador confirme una señal válida — puede pasar días sin operar y está bien). <b>🔴 DETENER</b> lo frena al instante. Abajo: posiciones abiertas (con ✖ cerrar), tus reglas, su Diario con las lecciones 🎓 de Roberto y las señales que descartó. El chip 🤖 del chat es la MISMA config — pregúntale ahí a Roberto lo que quieras del bot.</p>` },
  roberto:{ t:"✨ Roberto — tu mentor IA", h:`<p><b>Para qué sirve:</b> Roberto es tu mentor de bolsillo con inteligencia artificial. Conoce tu estrategia, tu indicador, tus reglas y tus datos. Domina trading, finanzas, interés compuesto y las empresas de fondeo.</p>
    <p><b>Cómo usarlo:</b> pulsa ✨, escríbele o mándale una <b>foto</b> de tu gráfico (📎 galería o 📷 cámara). Guarda tus conversaciones (🗂️). En ajustes (⚙️) activas que <b>te hable en voz</b> y ves tu saldo.</p>` }
};
function abrirAyuda(id){
  const a=AYUDA[id]; if(!a) return;
  abrirModal(`<div class="ayuda"><h3>${a.t}</h3>${a.h}</div>`, [{t:"Entendido 👍", cls:"gold", fn:cerrarModal}]);
}

/* ============================================================
   VISTA 🧭 ARRANQUE — el plan, vivo
   Ves en qué fase estás, marcas los pasos, y la app comprueba SOLA si ya
   cumples la señal para avanzar. Las fases siguientes están cerradas hasta
   que toque: eso es lo que impide saltárselas.
   ============================================================ */
function viewArranque(){
  const v=el("div","view"); v.id="v-arranque";
  v.innerHTML=`<div id="arrBody"></div>`;
  return v;
}
function renderArranque(){
  const body=$("#arrBody"); if(!body) return;
  const act=PLAN_ARR.fase||0;
  let h="";

  /* Cabecera: dónde estás dentro del camino completo */
  const f=planFaseActual(); const s=planSeñal(f);
  h+=`<div class="card arr-top">
    <div class="arr-eyebrow">Tu plan con Roberto</div>
    <div class="arr-fase">Fase ${esc(f.n)} · ${esc(f.t)}</div>
    <div class="arr-cuando">${esc(f.cuando)}</div>
    <div class="arr-mapa">${PLAN_FASES.map((x,i)=>
      `<span class="arr-dot ${i<act?"done":(i===act?"now":"")}" title="${esc(x.t)}">${esc(x.n)}</span>`
    ).join("<i></i>")}</div>
  </div>`;

  /* Fases */
  PLAN_FASES.forEach((fa,i)=>{
    const estado = i<act ? "hecha" : (i===act ? "activa" : "cerrada");
    const hechos=planPasosHechos(fa);
    const tot=(fa.pasos||[]).length;
    h+=`<div class="card arr-card ${estado}">
      <div class="arr-h">
        <span class="arr-n">${esc(fa.n)}</span>
        <h2>${esc(fa.t)}</h2>
        <span class="arr-badge ${estado}">${estado==="hecha"?"✓ Hecha":(estado==="activa"?"Aquí estás":"🔒 Aún no")}</span>
      </div>
      <p class="arr-idea">${esc(fa.idea)}</p>`;

    if(estado==="cerrada"){
      const previa=PLAN_FASES[i-1];
      h+=`<div class="arr-bloq">Se abre cuando termines la fase ${esc(previa?previa.n:"anterior")}.</div></div>`;
      return;
    }

    /* pasos marcables */
    h+=`<div class="arr-pasos">`;
    (fa.pasos||[]).forEach(p=>{
      const on=!!PLAN_ARR.pasos[p.id];
      h+=`<button class="arr-paso${on?" on":""}" data-paso="${p.id}"${estado==="hecha"?" disabled":""}>
        <span class="box"></span><span class="lbl">${esc(p.t)}</span></button>`;
    });
    h+=`</div><div class="bar"><i style="width:${tot?Math.round(hechos/tot*100):0}%"></i></div>`;

    if(estado==="activa"){
      h+=`<div class="arr-señal ${s.ok?"ok":""}">
        <span class="lbl">${s.ok?"✅ Ya puedes avanzar":"🎯 Para pasar a la siguiente fase"}</span>
        <p>${esc(fa.señal)}</p>
        <p class="est">${esc(s.txt)}</p>
        ${!s.ok&&s.falta?`<p class="falta">${esc(s.falta)}</p>`:""}
      </div>
      <button class="btn${s.ok?" green":""}" id="arrNext"${s.ok?"":" disabled"}>${s.ok?"▶️ Pasar a la siguiente fase":"🔒 Todavía no toca"}</button>
      <button class="btn" id="arrPreg">🧠 Preguntar a Roberto qué me falta</button>
      ${act>0?`<button class="btn" id="arrBack">↩️ Volver a la fase anterior</button>`:""}`;
    }
    h+=`</div>`;
  });

  h+=`<div class="note">Roberto ve este mismo plan en cada conversación: sabe en qué fase estás, qué te falta, y te frena si intentas saltarte un punto.</div>`;

  body.innerHTML=h;
  body.querySelectorAll("[data-paso]").forEach(b=>b.onclick=()=>{
    const id=b.dataset.paso;
    PLAN_ARR.pasos[id]=!PLAN_ARR.pasos[id]; guardarPlan(); renderArranque();
  });
  const on=(id,fn)=>{ const b=$("#"+id); if(b) b.onclick=fn; };
  on("arrNext",()=>planAvanzar(false));
  on("arrBack",planRetroceder);
  on("arrPreg",()=>{
    if(typeof abrirIA==="function") abrirIA();
    iaTemaChat("🧭 Mi plan");
    setTimeout(()=>iaEnviar("🧭 ¿Por dónde voy en mi plan? Dime exactamente qué me falta para pasar a la siguiente fase y qué debo hacer HOY."),250);
  });
}

/* 📰 LAS NOTICIAS DE HOY, DENTRO DE HOY.
   Rey no debería salir de esta pantalla para saber si puede operar. Aquí ve las
   noticias del día en hora de Nueva York Y de Brasil, y —lo que de verdad importa—
   qué franjas quedan BLOQUEADAS (15 min antes y después de cada roja/naranja).
   El calendario completo sigue en 📰 Noticias para cuando quiera profundizar. */
let HOY_EV=null;
async function hoyCargarNoticias(){
  try{
    const ev=await cargarCalendarioCache();
    if(!ev) return;
    const mon=monedasDe((CAL_FILTRO||[]).concat(PARES||[]));
    const hoy=nyFechaISO(0);
    HOY_EV=ev.filter(e=>String(e.date||"").slice(0,10)===hoy
      && mon.has(String(e.country||"").toUpperCase())
      && /High|Medium/i.test(e.impact||""))
      .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
    if(TAB==="hoy") renderHoy();
  }catch(_){}
}
/* Convierte "2026-08-20T08:30" (NY) a las dos horas legibles + minutos desde medianoche NY */
function hoyHoraEvento(iso){
  const hh=parseInt(String(iso).slice(11,13),10), mm=parseInt(String(iso).slice(14,16),10);
  const dec=hh+mm/60;
  const h12=(h)=>{ const p=h>=12?"PM":"AM"; let x=h%12; if(!x)x=12; return x+":"+String(mm).padStart(2,"0")+" "+p; };
  return { dec, ny:h12(hh), br:h12((hh+1)%24) };   /* Brasil = NY + 1 h */
}
/* decimal (8.5) -> "8:30 AM"; sirve para pintar las franjas bloqueadas */
function hoyDec12(dec){
  let d=((dec%24)+24)%24;
  const h=Math.floor(d), m=Math.round((d-h)*60);
  const p=h>=12?"PM":"AM"; let x=h%12; if(!x)x=12;
  return x+":"+String(m).padStart(2,"0")+" "+p;
}
function hoyBloqueNoticias(){
  if(!HOY_EV) return `<div class="card">
    <div class="card-h"><span class="ic">📰</span><h2>Noticias de hoy</h2></div>
    <p class="desc">Leyendo el calendario económico…</p></div>`;
  const ny=horaNY();
  if(!HOY_EV.length) return `<div class="card">
    <div class="card-h"><span class="ic">📰</span><h2>Noticias de hoy</h2><span class="cnt">0</span></div>
    <div class="note ok" style="text-align:left">✅ Sin noticias de alto ni medio impacto en tus pares. El día está limpio: opera dentro de tu ventana con normalidad.</div>
    <button class="btn" id="hoyNews">Ver calendario completo →</button></div>`;

  const filas=HOY_EV.slice(0,8).map(e=>{
    const h=hoyHoraEvento(e.date);
    const alto=/High/i.test(e.impact);
    /* ventana bloqueada: 15 min antes y 15 después (regla de Rey, actualizada 26-08: antes ±30) */
    const dentro = ny.dec>=(h.dec-0.25) && ny.dec<=(h.dec+0.25);
    const pasada = ny.dec > h.dec+0.25;
    return `<div class="hoy-row ${dentro?"bad":(alto?"warn":"")}"${pasada?' style="opacity:.5"':''}>
      <div class="hoy-row-t">${alto?"🔴":"🟠"} ${esc(e.title||"Evento")} <span style="font-weight:500;color:var(--txt3)">${esc(e.country||"")}</span></div>
      <div class="hoy-row-d">${esc(h.ny)} Nueva York · ${esc(h.br)} Brasil${pasada?" · ya pasó":""}</div>
      ${dentro?`<div class="hoy-row-a">⛔ AHORA MISMO no operes — estás dentro de los 15 min de esta noticia</div>`
        :(!pasada?`<div class="hoy-row-d" style="color:var(--orange)">No operes entre ${esc(hoyDec12(h.dec-0.25))} y ${esc(hoyDec12(h.dec+0.25))} hora de Nueva York</div>`:"")}
    </div>`;
  }).join("");
  const altos=HOY_EV.filter(e=>/High/i.test(e.impact)).length;
  return `<div class="card${altos?" alert":""}">
    <div class="card-h"><span class="ic">📰</span><h2 class="${altos?"red":""}">Noticias de hoy</h2><span class="cnt">${HOY_EV.length}</span></div>
    ${altos?`<div class="note bad" style="text-align:left">🔴 ${altos} noticia(s) de ALTO impacto hoy en tus pares. Respeta los 15 minutos antes y después de cada una.</div>`:""}
    ${filas}
    <button class="btn" id="hoyNews">Ver calendario completo →</button>
  </div>`;
}

/* ============================================================
   VISTA 🎯 HOY — TODO lo del día en UNA sola pantalla
   Rey abría 5 secciones para saber en qué punto estaba. Aquí ve de un vistazo:
   la hora (Brasil Y Nueva York), si está en ventana válida, el plan/checklist,
   el riesgo real de cada cuenta hoy, lo que dejó pendiente y el último contexto
   del gráfico que mandó el indicador. Sin abrir nada más.
   ============================================================ */
function viewHoy(){
  const v=el("div","view"); v.id="v-hoy";
  v.innerHTML=`<div id="hoyBody"></div>`;
  return v;
}
/* Último contexto del gráfico: primero el que dejó el Puente/indicador (📡 latido), si lo hay */
let HOY_CTX=null;
async function hoyCargarCtx(){
  try{
    const r=await fetch(nubeUrl()+"/tvctx",{cache:"no-store"});
    if(!r.ok) return;
    const d=await r.json();
    if(d && d.ok && d.ctx){ HOY_CTX=d; if(TAB==="hoy") renderHoy(); }
  }catch(_){}
}
function renderHoy(){
  const body=$("#hoyBody"); if(!body) return;
  const now=new Date();
  const fBR=new Intl.DateTimeFormat("es",{timeZone:"America/Sao_Paulo",weekday:"long",day:"2-digit",month:"long"}).format(now);
  const hBR=new Intl.DateTimeFormat("es",{timeZone:"America/Sao_Paulo",hour:"2-digit",minute:"2-digit",hour12:true}).format(now);
  const hNY=new Intl.DateTimeFormat("es",{timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",hour12:true}).format(now);
  const ny=horaNY(); const abierto=forexAbierto(ny); const vent=ventanaActiva(); const prox=proximaVentana();
  let h="";

  /* ── 1. RELOJ + VENTANA ── */
  const estado = !abierto ? `<span class="hoy-pill bad">🔒 Forex cerrado</span>`
    : vent ? `<span class="hoy-pill ok">🟢 ${esc(vent.n)} — ventana válida</span>`
    : `<span class="hoy-pill warn">🟡 Fuera de ventana${prox?(" · próxima: "+esc(prox.n)+" a las "+esc(prox.h)):""}</span>`;
  h+=`<div class="card hoy-top">
    <div class="hoy-fecha">${esc(fBR.charAt(0).toUpperCase()+fBR.slice(1))}</div>
    <div class="hoy-horas"><b>${esc(hBR)}</b> <span>Brasil</span> · <b>${esc(hNY)}</b> <span>Nueva York</span></div>
    <div>${estado}</div>
  </div>`;

  /* ── 2. NOTICIAS DE HOY (aquí mismo: sin salir de esta pantalla sabes si puedes operar) ── */
  h+=hoyBloqueNoticias();

  /* ── 3. PLAN DE HOY (estrategia + checklist) ── */
  let hechos=0, total=0;
  CHECKLIST.forEach(bl=>bl.items.forEach(it=>{ total++; if(CHK[it.id]) hechos++; }));
  const pctChk = total?Math.round(hechos/total*100):0;
  const claves = []; CHECKLIST.forEach(bl=>bl.items.forEach(it=>{ if(it.key && !CHK[it.id]) claves.push(it.t); }));
  h+=`<div class="card">
    <div class="card-h"><span class="ic">📋</span><h2>Plan de hoy</h2><span class="cnt">${hechos}/${total}</span></div>
    <div class="bar"><i style="width:${pctChk}%"></i></div>
    <p class="desc" style="margin-top:8px">Estrategia activa: <b>${esc(CTX.estrategia||"—")}</b> · Modo: <b>${esc(CTX.modo==="real"?"Real":"Backtest")}</b></p>
    <div class="hoy-row"><div class="hoy-row-t">🧭 Fase ${esc(planFaseActual().n)} · ${esc(planFaseActual().t)}</div><div class="hoy-row-d">${esc(planSeñal(planFaseActual()).txt)}</div></div>
    <button class="btn" id="hoyPlan">Ver mi plan con Roberto →</button>
    ${claves.length?`<div class="note" style="text-align:left">⚠️ Te faltan pasos CLAVE: ${claves.slice(0,4).map(esc).join(" · ")}${claves.length>4?" …":""}</div>`
      :`<div class="note ok" style="text-align:left">✅ Checklist clave completo. Puedes buscar setup.</div>`}
    <button class="btn" id="hoyChk">Abrir checklist →</button>
  </div>`;

  /* ── 4. RIESGO DE HOY (por cuenta, en vivo) ── */
  const hoy=hoyISO();
  const cuentas=(Array.isArray(CUENTAS)?CUENTAS:[]).filter(c=>c.fase!=="Cerrada");
  let filas="", frenoGlobal=false;
  cuentas.forEach(c=>{
    const riesgoPct=+c.riesgoPct||0.5;
    const hoyT=TRADES.filter(t=>t.cuenta===c.id && t.fecha===hoy && !t.abierta && t.modo==="real");
    const rHoy=hoyT.reduce((a,t)=>a+(parseFloat(t.r)||0),0);
    const slHoy=hoyT.filter(t=>(parseFloat(t.r)||0)<0).length;
    const diaPct=rHoy*riesgoPct;
    const ddDaily=+c.ddDailyPct||0;
    const usadoDia=diaPct<0?Math.abs(diaPct):0;
    const margen=ddDaily>0?Math.max(0,ddDaily-usadoDia):null;
    let sem="ok", aviso="";
    if(hoyT.length>=2){ sem="bad"; aviso="Ya llevas 2 trades hoy → para."; frenoGlobal=true; }
    if(slHoy>=2){ sem="bad"; aviso="2 SL hoy → cierra plataforma hasta mañana."; frenoGlobal=true; }
    if(!aviso && ddDaily>0 && margen!=null && margen<=ddDaily*0.3){ sem="warn"; aviso="Cerca del límite diario (queda "+r1(margen)+"%)."; }
    filas+=`<div class="hoy-row ${sem}">
      <div class="hoy-row-t">${esc(c.alias||c.firma||"Cuenta")}</div>
      <div class="hoy-row-d">${hoyT.length}/2 trades · ${slHoy} SL · <b>${diaPct>=0?"+":""}${r1(diaPct)}%</b> hoy${margen!=null?(" · margen "+r1(margen)+"%"):""}</div>
      ${aviso?`<div class="hoy-row-a">${esc(aviso)}</div>`:""}
    </div>`;
  });
  h+=`<div class="card${frenoGlobal?" alert":""}">
    <div class="card-h"><span class="ic">🛡️</span><h2 class="${frenoGlobal?"red":""}">Riesgo de hoy</h2></div>
    ${filas||`<p class="desc">Aún no tienes cuentas registradas. Añádelas en 🏦 Cuentas para que vigile tu riesgo real.</p>`}
    ${frenoGlobal?`<div class="note bad" style="text-align:left">🔴 Hoy tu regla dice PARAR. No abras nada más.</div>`:""}
  </div>`;

  /* ── 5. PENDIENTES ── */
  const pend=(IA.convs||[]).filter(c=>c.revisar && c.msgs && c.msgs.length);
  h+=`<div class="card">
    <div class="card-h"><span class="ic">🔍</span><h2>Pendientes</h2><span class="cnt">${pend.length}</span></div>
    ${pend.length?pend.slice(0,5).map(c=>`<div class="hoy-row"><div class="hoy-row-t">${esc(iaTit(c))}</div></div>`).join("")
      :`<p class="desc">Nada a medias. Todo cerrado ✅</p>`}
    ${pend.length?`<button class="btn" id="hoyPend">Repasarlos con Roberto →</button>`:""}
  </div>`;

  /* ── 6. SETUP / CONTEXTO DEL GRÁFICO ── */
  h+=`<div class="card">
    <div class="card-h"><span class="ic">📈</span><h2>Contexto del gráfico</h2></div>
    ${HOY_CTX && HOY_CTX.ctx
      ? `<pre class="hoy-ctx">${esc(String(HOY_CTX.ctx).slice(0,1200))}</pre>
         <p class="desc">Último dato que mandó tu indicador${HOY_CTX.ts?(" · "+new Intl.DateTimeFormat("es",{timeZone:"America/Sao_Paulo",hour:"2-digit",minute:"2-digit",hour12:true}).format(new Date(HOY_CTX.ts))+" hora de Brasil"):""}.</p>`
      : `<p class="desc">Sin contexto todavía. Llega solo cada ~15 min desde tu indicador (latido 📡) si tienes las alarmas activas.</p>`}
    <button class="btn" id="hoyGo">✅ Pedir GO/NO-GO a Roberto</button>
  </div>`;

  /* ── 7. CIERRE DEL DÍA / HERRAMIENTAS ── */
  h+=`<div class="card">
    <div class="card-h"><span class="ic">🧰</span><h2>Herramientas del día</h2></div>
    <button class="btn" id="hoyParte">🌅 Parte del día</button>
    <button class="btn" id="hoyInf">📄 Informe mensual</button>
    <button class="btn" id="hoyResp">☁️ Respaldo</button>
  </div>`;

  body.innerHTML=h;
  const on=(id,fn)=>{ const b=$("#"+id); if(b) b.onclick=fn; };
  on("hoyChk",()=>irA("checklist"));
  on("hoyPlan",()=>irA("arranque"));
  on("hoyNews",()=>irA("noticias"));
  on("hoyPend",()=>{ if(typeof revisarPendientes==="function") revisarPendientes(); });
  on("hoyGo",()=>{ if(typeof goNoGo==="function") goNoGo(); });
  on("hoyParte",()=>{ if(typeof parteMatutino==="function") parteMatutino(); });
  on("hoyInf",()=>informeMensual());
  on("hoyResp",()=>compartirRespaldo());
}

/* ============================================================
   VISTA 1 — CHECKLIST
   ============================================================ */
function viewChecklist(){
  const v=el("div","view"); v.id="v-checklist";
  CHECKLIST.forEach(bl=>{
    const c=el("div","card"+(bl.red?" alert":""));
    c.innerHTML=`<div class="card-h"><span class="ic">${bl.icon}</span>
      <h2 class="${bl.red?'red':''}">${bl.title}</h2>
      <span class="cnt" id="cnt-${bl.id}">0/${bl.items.length}</span></div>
      <div class="bar ${bl.red?'red':''}"><i id="bar-${bl.id}"></i></div>`;
    bl.items.forEach(it=>{
      const b=el("button","chk"+(it.key?" key":"")+(CHK[it.id]?" done":""),
        `<span class="box"></span><span class="lbl">${it.t}${it.key?'<span class="tag">CLAVE</span>':''}</span>`);
      b.onclick=()=>{ CHK[it.id]=!CHK[it.id]; save(K.chk,CHK); b.classList.toggle("done",!!CHK[it.id]); refreshChecklist(); };
      c.appendChild(b);
    });
    v.appendChild(c);
  });

  const verd=el("div","verd"); verd.id="verdicto";
  verd.innerHTML=`<div class="t">Completa el checklist</div><div class="s">El veredicto se calcula con tus marcas</div>`;
  v.appendChild(verd);

  const rb=el("button","btn","🔄 Reiniciar para nueva sesión");
  rb.style.marginTop="12px";
  rb.onclick=()=>{ CHK={}; save(K.chk,CHK);
    v.querySelectorAll(".chk").forEach(x=>x.classList.remove("done")); refreshChecklist(); toast("Checklist reiniciado"); };
  v.appendChild(rb);
  v.appendChild(el("div","note","Cada sesión empieza limpia. Reinicia antes de analizar un setup nuevo."));
  return v;
}
function refreshChecklist(){
  let totalKey=0, okKey=0, total=0, ok=0;
  CHECKLIST.forEach(bl=>{
    let n=0; bl.items.forEach(it=>{ if(CHK[it.id]) n++; total++; if(CHK[it.id]) ok++;
      if(it.key){ totalKey++; if(CHK[it.id]) okKey++; } });
    const cn=$("#cnt-"+bl.id), br=$("#bar-"+bl.id);
    if(cn) cn.textContent=n+"/"+bl.items.length;
    if(br) br.style.width=(n/bl.items.length*100)+"%";
  });
  const v=$("#verdicto"); if(!v) return;
  if(ok===0){
    v.className="verd";
    v.innerHTML=`<div class="t">Completa el checklist</div><div class="s">El veredicto se calcula con tus marcas</div>`;
  }else if(okKey===totalKey && ok===total){
    v.className="verd go";
    v.innerHTML=`<div class="t">✅ TODO EN ORDEN</div><div class="s">Checklist 100%. Ejecuta según tu plan.</div>`;
  }else if(okKey<totalKey){
    v.className="verd no";
    v.innerHTML=`<div class="t">⛔ NO OPERAR</div><div class="s">Faltan ${totalKey-okKey} casillas CLAVE. Sin ellas no hay trade.</div>`;
  }else{
    v.className="verd";
    v.innerHTML=`<div class="t" style="color:var(--gold)">⚠️ Casi listo</div><div class="s">Claves OK. Faltan ${total-ok} secundarias (${ok}/${total}).</div>`;
  }
}

/* ============================================================
   VISTA 2 — CONFLUENCIAS
   ============================================================ */
function viewConf(){
  const v=el("div","view"); v.id="v-conf";

  const oro=el("div","card alert");
  oro.innerHTML=`<div class="card-h"><span class="ic">⚠️</span><h2 class="red">Regla de oro</h2></div>
   <div class="quote red">SIN SWEEP = SIN SETUP. No importa cuántas confluencias haya. Si el precio no barrió liquidez con mecha (no con cierre), no hay operación. Punto.</div>`;
  v.appendChild(oro);

  const c=el("div","card");
  c.innerHTML=`<div class="card-h"><span class="ic">✅</span><h2>Las 5 confluencias</h2>
    <span class="cnt" id="cnt-conf">0/5</span></div>
    <p class="desc">Marca las que tengas en el setup actual. Tu clasificación se calcula sola abajo.</p>
    <div class="bar"><i id="bar-conf"></i></div>`;
  CONFLUENCIAS.forEach(x=>{
    const b=el("button","chk"+(x.ob?" key":"")+(CONF[x.id]?" done":""),
      `<span class="box"></span><span class="lbl"><b>${x.t}</b> ${x.extra}${x.ob?'<span class="tag ob">OBLIGATORIA</span>':''}
       <span class="sub">${x.sub}</span></span>`);
    b.onclick=()=>{ CONF[x.id]=!CONF[x.id]; save(K.conf,CONF); b.classList.toggle("done",!!CONF[x.id]); refreshConf(); };
    c.appendChild(b);
  });
  v.appendChild(c);

  const cls=el("div","card");
  cls.innerHTML=`<div class="card-h"><span class="ic">🏅</span><h2>Clasificación del setup</h2></div>
    <div class="seg c4" style="margin-bottom:12px">
      <button id="kA" style="pointer-events:none"><span style="color:var(--green);font-size:19px;font-weight:800">A+</span><br><span style="font-size:11px">5/5 · 0.5%</span></button>
      <button id="kB" style="pointer-events:none"><span style="color:var(--blue);font-size:19px;font-weight:800">B</span><br><span style="font-size:11px">4/5 · 0.5%</span></button>
      <button id="kC" style="pointer-events:none"><span style="color:var(--orange);font-size:19px;font-weight:800">C</span><br><span style="font-size:11px">3/5 · demo</span></button>
      <button id="kN" style="pointer-events:none"><span style="color:var(--red);font-size:19px;font-weight:800">NO</span><br><span style="font-size:11px">&lt;3/5</span></button>
    </div>
    <div class="verd" id="verdConf"><div class="t">Marca confluencias</div>
    <div class="s">Solo operas A+ y B bajo las condiciones actuales</div></div>`;
  v.appendChild(cls);

  const zon=el("div","card");
  zon.innerHTML=`<div class="card-h"><span class="ic">📍</span><h2>Zonas de valor</h2></div>
    <div class="row"><div class="l" style="color:var(--red)">PREMIUM</div><div class="r" style="color:var(--txt2);font-weight:400;font-size:14px">50−100% del rango → VENTAS</div></div>
    <div class="row"><div class="l" style="color:var(--green)">DISCOUNT</div><div class="r" style="color:var(--txt2);font-weight:400;font-size:14px">0−50% del rango → COMPRAS</div></div>
    <div class="row bad"><div class="l" style="color:var(--orange)">TIERRA DE NADIE</div><div class="r" style="color:var(--txt2);font-weight:400;font-size:14px">40−60% → NO ENTRAR</div></div>`;
  v.appendChild(zon);

  const min=el("div","card");
  min.innerHTML=`<div class="card-h"><span class="ic">⚖️</span><h2>Mínimos para entrar</h2></div>
    <p class="desc" style="margin-bottom:0">3 confluencias macro (Daily + H4) + 4 micro (M15 + M5). Si no llegas a ese mínimo, hoy el setup no existe para ti.</p>`;
  v.appendChild(min);
  return v;
}
function refreshConf(){
  const n=CONFLUENCIAS.filter(x=>CONF[x.id]).length;
  const sweep=!!CONF["c1"];
  const cn=$("#cnt-conf"); if(cn) cn.textContent=n+"/5";
  const br=$("#bar-conf"); if(br) br.style.width=(n/5*100)+"%";
  ["kA","kB","kC","kN"].forEach(i=>{ const e=$("#"+i); if(e) e.className=""; });
  const v=$("#verdConf"); if(!v) return;

  if(!sweep && n>0){
    $("#kN").className="on r"; v.className="verd no";
    v.innerHTML=`<div class="t">⛔ SIN SWEEP = SIN SETUP</div><div class="s">Tienes ${n}/5, pero falta la obligatoria. No hay operación.</div>`;
    return;
  }
  if(n===5){ $("#kA").className="on g"; v.className="verd go";
    v.innerHTML=`<div class="t">A+ · 5 de 5</div><div class="s">Riesgo 0.5% · RR 1:4+ · OPERAR</div>`; }
  else if(n===4){ $("#kB").className="on"; v.className="verd go";
    v.innerHTML=`<div class="t" style="color:var(--blue)">B · 4 de 5</div><div class="s">Riesgo 0.5% · RR 1:3 · OPERAR</div>`; }
  else if(n===3){ $("#kC").className="on"; v.className="verd no";
    v.innerHTML=`<div class="t" style="color:var(--orange)">C · 3 de 5</div><div class="s">Solo demo. En cuenta real, R2 dice NO.</div>`; }
  else if(n>0){ $("#kN").className="on r"; v.className="verd no";
    v.innerHTML=`<div class="t">⛔ NO OPERAR</div><div class="s">${n}/5 confluencias. Por debajo del mínimo.</div>`; }
  else { v.className="verd";
    v.innerHTML=`<div class="t">Marca confluencias</div><div class="s">Solo operas A+ y B bajo las condiciones actuales</div>`; }
}

/* ============================================================
   VISTA 3 — RUTINA
   ============================================================ */
function viewRutina(){
  const v=el("div","view"); v.id="v-rutina";
  const COL={purple:"var(--purple)",blue:"var(--blue)",gold:"var(--gold)",green:"var(--green)"};

  const mapa=el("div","card");
  mapa.innerHTML=`<div class="card-h"><span class="ic">🕐</span><h2>Mapa de temporalidades</h2></div>
    <p class="desc">Cada temporalidad tiene UN objetivo. No los mezcles: ahí nace el error de entrar antes de tiempo.</p>`;
  TEMPORALIDADES.forEach(t=>{
    mapa.appendChild(el("div","row",
      `<div style="display:flex;gap:13px;align-items:flex-start">
        <span style="background:var(--card3);border:1px solid ${COL[t.col]}44;color:${COL[t.col]};font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:9px;white-space:nowrap;flex-shrink:0">${t.tf}</span>
        <span><b style="font-size:15.5px">${t.t}</b><br><span style="color:var(--txt2);font-size:13.5px">${t.d}</span></span>
      </div>`));
  });
  mapa.appendChild(el("div","quote","El cambio de estructura que valida (MSS) se produce en <b>1H / 15M</b>, nunca en 5M. En M5 solo buscas el gatillo de entrada, no la validación."));
  v.appendChild(mapa);

  const rut=el("div","card");
  rut.innerHTML=`<div class="card-h"><span class="ic">🗺️</span><h2>Rutina paso a paso</h2></div>
    <p class="desc">Tu secuencia operativa. En orden, sin saltar pasos. El gráfico se limpia al bajar de temporalidad: solo dejas las zonas donde el precio debe reaccionar.</p>`;
  RUTINA.forEach(p=>{
    const box=el("div","row");
    box.style.display="block";
    let h=`<div style="display:flex;gap:13px;align-items:flex-start">
      <span style="background:var(--card3);color:var(--gold);font-weight:700;width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${p.n}</span>
      <span><b style="font-size:15.5px">${p.t}</b><br><span style="color:var(--gold);font-size:13px;font-weight:600">${p.s}</span></span></div>`;
    if(p.items){ h+=`<ul style="margin:10px 0 0;padding-left:2px;list-style:none">`+
      p.items.map(i=>`<li style="font-size:13.5px;color:var(--txt2);margin-bottom:7px;padding-left:16px;position:relative;line-height:1.45"><span style="position:absolute;left:0;color:var(--gold)">›</span>${i}</li>`).join("")+`</ul>`; }
    box.innerHTML=h;
    rut.appendChild(box);
  });
  v.appendChild(rut);

  const ant=el("div","card");
  ant.innerHTML=`<div class="card-h"><span class="ic">🩹</span><h2>Antídoto del timing</h2></div>
    <div class="quote">No entro en el toque de la zona. Entro en la CONFIRMACIÓN. El toque sin confirmar es la trampa que me ha costado dinero. Mi error nunca fue la dirección — fue el cuándo.</div>`;
  v.appendChild(ant);

  const dias=el("div","card");
  dias.innerHTML=`<div class="card-h"><span class="ic">📅</span><h2>Comportamiento por día</h2></div>`;
  DIAS.forEach(d=>{
    dias.appendChild(el("div","row",
      `<div style="flex:1"><b>${d.d}</b><small>${d.e}</small></div>
       <div style="color:var(--gold);font-size:13px;font-weight:600;text-align:right;max-width:45%">${d.a}</div>`));
  });
  v.appendChild(dias);
  return v;
}

/* ============================================================
   VISTA 4 — REGLAS
   ============================================================ */
function viewReglas(){
  const v=el("div","view"); v.id="v-reglas";
  const c=el("div","card alert");
  c.innerHTML=`<div class="card-h"><span class="ic">⛔</span><h2 class="red">Reglas inviolables</h2>
    <span class="cnt" id="cnt-reglas">0/15</span></div>
    <p class="desc">Tócalas para repasarlas como leídas. Un trade ganador con regla rota es un trade perdedor disfrazado: refuerza el hábito que vacía la cuenta.</p>
    <div class="bar green"><i id="bar-reglas"></i></div>`;
  REGLAS.forEach((r,i)=>{
    const id="R"+(i+1);
    const b=el("button","rule"+(RLEIDAS[id]?" read":""),`<span class="n">${id}</span><span class="tx">${r}</span>`);
    b.onclick=()=>{ RLEIDAS[id]=!RLEIDAS[id]; save(K.reglas,RLEIDAS); b.classList.toggle("read",!!RLEIDAS[id]); refreshReglas(); };
    c.appendChild(b);
  });
  const rb=el("button","btn","Marcar todas como no leídas");
  rb.style.marginTop="8px";
  rb.onclick=()=>{ RLEIDAS={}; save(K.reglas,RLEIDAS);
    c.querySelectorAll(".rule").forEach(x=>x.classList.remove("read")); refreshReglas(); };
  c.appendChild(rb);
  v.appendChild(c);
  return v;
}
function refreshReglas(){
  const n=Object.values(RLEIDAS).filter(Boolean).length;
  const cn=$("#cnt-reglas"); if(cn) cn.textContent=n+"/15";
  const br=$("#bar-reglas"); if(br) br.style.width=(n/15*100)+"%";
}

/* ============================================================
   VISTA 5 — RIESGO
   ============================================================ */
function viewRiesgo(){
  const v=el("div","view"); v.id="v-riesgo";

  const q=el("div","card alert");
  q.innerHTML=`<div class="card-h"><span class="ic">💰</span><h2 class="red">El riesgo se define ANTES</h2></div>
    <div class="quote red">Si no sé cuánto pierdo cuando me equivoco, no entro. El SL va donde la estructura lo invalida, nunca donde aguanta el bolsillo.</div>`;
  v.appendChild(q);

  const rs=el("div","card");
  rs.innerHTML=`<div class="card-h"><span class="ic">📐</span><h2>Riesgo por operación</h2></div>`;
  RIESGO_SETUP.forEach(x=>{
    const col=x.c==="A+"?"var(--green)":x.c==="B"?"var(--blue)":x.c==="C"?"var(--orange)":"var(--red)";
    rs.appendChild(el("div","row "+x.cls,
      `<div><b style="color:${col}">${x.c}</b> ${x.conf?`<span style="color:${col};font-weight:700">· ${x.conf}</span>`:""}
        <small style="display:inline;margin-left:8px">${x.r} ${x.rr?"· "+x.rr:""}</small></div>
       <div class="r ${x.cls==='bad'?'red':''}">${x.act}</div>`));
  });
  v.appendChild(rs);

  const calc=el("div","card");
  calc.innerHTML=`<div class="card-h"><span class="ic">🧮</span><h2>Calculadora de lotaje</h2></div>
    <p class="desc">Elige el par y mete balance, % de riesgo y pips de SL. El valor del pip se calcula por par; en pares con USD de base (JPY, CAD...) mete el precio actual y afina exacto.</p>
    <div class="row"><div class="l" style="min-width:88px">Par</div><select class="inp" id="cPar" style="max-width:56%">${PARES_CALC.map(p=>`<option ${p===(BAL.par||"EUR/USD")?"selected":""}>${p}</option>`).join("")}</select></div>
    <div class="row"><div class="l" style="min-width:88px">Balance $</div><input class="inp" id="cBal" type="number" inputmode="decimal" value="${BAL.bal}"></div>
    <div class="row"><div class="l" style="min-width:88px">% riesgo</div><input class="inp" id="cPct" type="number" inputmode="decimal" step="0.05" value="${BAL.pct}"></div>
    <div class="row"><div class="l" style="min-width:88px">Pips SL</div><input class="inp" id="cPips" type="number" inputmode="decimal" value="${BAL.pips}"></div>
    <div class="row" id="cPriceRow" style="display:none"><div class="l" style="min-width:88px">Precio actual<small>para USD-base / JPY</small></div><input class="inp" id="cPrice" type="number" inputmode="decimal" placeholder="ej. 150.20"></div>
    <div class="row"><div class="l" style="min-width:88px">Valor pip $<small>por lote · editable</small></div><input class="inp" id="cPv" inputmode="decimal" style="max-width:44%"></div>
    <div class="verd go" id="calcOut" style="margin-top:12px"></div>
    <div class="note">EUR/USD y GBP/USD = $10/pip por lote exacto. Si tu bróker difiere o operas un cruce, edita el "Valor pip $" a mano y el lotaje se recalcula.</div>`;
  v.appendChild(calc);

  const lim=el("div","card alert");
  lim.innerHTML=`<div class="card-h"><span class="ic">🚦</span><h2 class="red">Límites inviolables</h2></div>
    <div class="row"><div class="l">2 trades/día</div><div class="r" style="color:var(--txt2);font-weight:400;font-size:13.5px;max-width:58%">Cerrar plataforma hasta mañana, gane o pierda</div></div>
    <div class="row"><div class="l" style="color:var(--red)">2 SL/día</div><div class="r" style="color:var(--txt2);font-weight:400;font-size:13.5px;max-width:58%">Cierre total. Prohibido abrir gráficos operativos</div></div>
    <div class="row"><div class="l" style="color:var(--orange)">Semana −3%</div><div class="r" style="color:var(--txt2);font-weight:400;font-size:13.5px;max-width:58%">Solo setups A+ el resto de la semana</div></div>
    <div class="row"><div class="l" style="color:var(--red)">Semana −5%</div><div class="r" style="color:var(--txt2);font-weight:400;font-size:13.5px;max-width:58%">Pausa total hasta el lunes. Sin excepciones</div></div>
    <div id="semaforoSemana"></div>`;
  v.appendChild(lim);

  const par=el("div","card");
  par.innerHTML=`<div class="card-h"><span class="ic">✂️</span><h2>Parciales</h2></div>`;
  PARCIALES.forEach(p=>{
    par.appendChild(el("div","row",
      `<div class="l" style="color:var(--${p.c});min-width:74px">${p.k}</div>
       <div style="color:var(--txt2);font-size:14px;text-align:left;flex:1">${p.v}</div>`));
  });
  v.appendChild(par);

  const ven=el("div","card");
  ven.innerHTML=`<div class="card-h"><span class="ic">⏰</span><h2>Ventanas (hora NY)</h2></div>`;
  VENTANAS.forEach(x=>{
    ven.appendChild(el("div","row "+x.cls,
      `<div class="l">${x.n}${x.sub?`<small>${x.sub}</small>`:""}</div>
       <div class="r ${x.bad?"red":""}">${x.h}</div>`));
  });
  ven.appendChild(el("div","note","Brasil no tiene horario de verano. El offset con NY cambia cuando EE.UU. ajusta su reloj (1er domingo de noviembre). Reajusta tus alarmas Toki entonces."));
  v.appendChild(ven);

  const man=el("div","card");
  man.innerHTML=`<div class="card-h"><span class="ic">🔥</span><h2>Mantras</h2></div>`+
    MANTRAS.map(m=>`<div class="quote">"${m}"</div>`).join("");
  v.appendChild(man);
  return v;
}
function calcLotaje(){
  const par=$("#cPar")?.value||"EUR/USD";
  const b=parseFloat($("#cBal")?.value)||0;
  const p=parseFloat($("#cPct")?.value)||0;
  const s=parseFloat($("#cPips")?.value)||0;
  const price=parseFloat($("#cPrice")?.value)||0;
  const pvIn=$("#cPv");
  const auto=pipValueUSD(par, price);
  let pv=parseFloat(pvIn?.value);
  // Usa el valor automático salvo que el usuario lo haya editado a mano
  if(!pvIn || pvIn.dataset.manual!=="1" || !isFinite(pv) || pv<=0){ pv=auto; if(pvIn) pvIn.value=r2(auto); }
  BAL={bal:b,pct:p,pips:s,par}; save(K.bal,BAL);
  const out=$("#calcOut"); if(!out) return;
  const dinero=b*(p/100);
  const lotes= (s>0 && pv>0) ? dinero/(s*pv) : 0;
  out.innerHTML=`<div class="t">Riesgo: $${r2(dinero)} · ${r2(lotes)} lotes</div>
    <div class="s">${(lotes*100000).toFixed(0)} unidades · $${r2(pv)}/pip por lote · ${esc(par)}</div>`;
}
/* Muestra/oculta el precio y refresca el valor pip al cambiar de par */
function onParCalc(){
  const par=$("#cPar")?.value||"EUR/USD";
  const necesitaPrecio = /^USD\//i.test(par) || /JPY/i.test(par);
  const pr=$("#cPriceRow"); if(pr) pr.style.display = necesitaPrecio ? "" : "none";
  const pv=$("#cPv"); if(pv) pv.dataset.manual="";   // vuelve a modo automático
  calcLotaje();
}

/* ============================================================
   VISTA 5b — GATILLO (asistente de ejecución)
   ============================================================ */
let GAT = { dir:"Compra", arm:{sweep:false,mss:false,zona:false,bias:false} };

function pipSize(par){ return /JPY/i.test(par||"") ? 0.01 : 0.0001; }
const pairPip = pipSize;
/* Valor del pip por LOTE ESTÁNDAR (100k unidades), en USD.
   - XXX/USD (EUR/USD, GBP/USD...): $10 exacto.
   - USD/XXX (USD/JPY, USD/CAD...): pip*100000/precio.
   - Cruces (EUR/GBP, GBP/JPY...): aproxima a $10; usa el campo manual para exactitud. */
function pipValueUSD(par, price){
  par=(par||"").toUpperCase().trim();
  const pip=pairPip(par);
  if(/\/USD$/.test(par)) return 10;
  if(/^USD\//.test(par)) return price>0 ? pip*100000/price : 10;
  return 10;
}
function ventanaActiva(){
  const ny=horaNY();
  if(!forexAbierto(ny)) return null;   // fin de semana / FX cerrado: nunca hay ventana
  for(const vv of VENTANAS){ if(vv.s!=null && !vv.bad && ny.dec>=vv.s && ny.dec<vv.e) return vv; }
  return null;
}

function viewGatillo(){
  const v=el("div","view"); v.id="v-gatillo";

  const intro=el("div","card");
  intro.innerHTML=`<div class="card-h"><span class="ic">⚡</span><h2>Zona de gatillo</h2></div>
    <p class="desc">El disparo es SIEMPRE el retroceso al FVG/OB del impulso que rompió estructura tras un barrido, a favor del sesgo, en killzone. Aquí lo armas y calculas la entrada exacta sin improvisar.</p>
    <div class="quote">FVG, Order Block y vela envolvente no compiten: son el mismo impulso. El OB es de dónde salió, el FVG es el hueco que dejó. Entras en su 50% y solo con la vela de confirmación cerrada.</div>`;
  v.appendChild(intro);

  const arm=el("div","card"); arm.id="gatArm";
  v.appendChild(arm);

  const calc=el("div","card");
  calc.innerHTML=`<div class="card-h"><span class="ic">🎯</span><h2>Zona y cálculo</h2></div>
    <div class="fl">Dirección</div><div class="seg c2" id="gDir"></div>
    <div class="g2">
      <div><div class="fl">Par</div><select class="inp" id="gPar"><option>EUR/USD</option><option>GBP/USD</option><option>Otro</option></select></div>
      <div><div class="fl">POI</div><select class="inp" id="gPoi"><option>FVG</option><option>Order Block</option><option>Breaker</option></select></div>
    </div>
    <div class="fl">Límites del POI (FVG u OB del impulso)</div>
    <div class="g2">
      <div><div class="fl">Extremo alto</div><input class="inp" id="gHi" inputmode="decimal" placeholder="1.15420"></div>
      <div><div class="fl">Extremo bajo</div><input class="inp" id="gLo" inputmode="decimal" placeholder="1.15360"></div>
    </div>
    <div class="verd" id="gEntry" style="margin:2px 0 14px"><div class="t">Entrada 50%</div><div class="s">Mete los dos extremos del POI</div></div>
    <div class="g2">
      <div><div class="fl">Stop (precio)</div><input class="inp" id="gSl" inputmode="decimal" placeholder="tras el barrido"></div>
      <div><div class="fl">Target (precio)</div><input class="inp" id="gTp" inputmode="decimal" placeholder="liquidez opuesta"></div>
    </div>
    <div class="g2">
      <div><div class="fl">Balance $</div><input class="inp" id="gBal" type="number" inputmode="decimal" value="${BAL.bal}"></div>
      <div><div class="fl">% riesgo</div><input class="inp" id="gPct" type="number" inputmode="decimal" step="0.05" value="${BAL.pct}"></div>
    </div>
    <div class="stats" id="gOut" style="margin-top:6px"></div>
    <div class="note" id="gRRnote" style="text-align:left"></div>
    <button class="btn green" id="gLoad" style="margin-top:14px">➤ Cargar esta entrada en el diario</button>
    <div class="note">Se rellena el formulario del Diario con dirección, par, POI, zona, entrada, SL y TP. Tú confirmas y guardas al cerrar el trade.</div>`;
  v.appendChild(calc);
  return v;
}

function renderGatillo(){
  const arm=$("#gatArm");
  if(arm){
    const va=ventanaActiva(), kz=!!va;
    const items=[
      {k:"sweep", t:"Barrido de liquidez (mecha)", s:"La trampa ya se liquidó"},
      {k:"mss",   t:"MSS 15M a favor",             s:"Cambio de estructura con cuerpo"},
      {k:"zona",  t:"En zona (Discount/Premium)",  s:"No en tierra de nadie (40−60%)"},
      {k:"bias",  t:"A favor del bias semanal",     s:"El semanal manda sobre el diario"}
    ];
    let h=`<div class="card-h"><span class="ic">🛡️</span><h2>Armado</h2></div>
      <div class="row ${kz?'ok':'bad'}"><div class="l">Killzone${kz?" · "+va.n:""}<small>${kz?"Ventana válida ahora":"Fuera de ventana — no dispares"}</small></div>
        <div class="r ${kz?'':'red'}">${kz?"✅ Activa":"⛔ Fuera"}</div></div>`;
    items.forEach(it=>{
      const on=GAT.arm[it.k];
      h+=`<button class="chk${on?' done':''}" data-arm="${it.k}"><span class="box"></span>
        <span class="lbl"><b>${it.t}</b><span class="sub">${it.s}</span></span></button>`;
    });
    h+=`<div class="verd" id="gArmVerd" style="margin-top:6px"></div>`;
    arm.innerHTML=h;
    arm.querySelectorAll('[data-arm]').forEach(b=>{
      b.onclick=()=>{ const k=b.dataset.arm; GAT.arm[k]=!GAT.arm[k]; b.classList.toggle('done',GAT.arm[k]); refreshArm(kz); };
    });
    refreshArm(kz);
  }
  const gd=$("#gDir");
  if(gd && !gd.dataset.init){
    gd.dataset.init="1";
    [{t:"Compra",v:"Compra",c:"g"},{t:"Venta",v:"Venta",c:"r"}].forEach(o=>{
      const b=el("button",GAT.dir===o.v?("on "+o.c):"",o.t);
      b.onclick=()=>{ GAT.dir=o.v; gd.querySelectorAll("button").forEach(x=>x.className=""); b.className="on "+o.c; calcGatillo(); };
      gd.appendChild(b);
    });
  }
  ["gHi","gLo","gSl","gTp","gBal","gPct","gPar","gPoi"].forEach(id=>{
    const e=$("#"+id); if(e && !e.dataset.w){ e.dataset.w="1"; e.addEventListener("input",calcGatillo); e.addEventListener("change",calcGatillo); }
  });
  const gl=$("#gLoad"); if(gl && !gl.dataset.w){ gl.dataset.w="1"; gl.onclick=cargarGatilloDiario; }
  calcGatillo();
}
function refreshArm(kz){
  const v=$("#gArmVerd"); if(!v) return;
  const n=Object.values(GAT.arm).filter(Boolean).length;
  if(kz && n===4){
    v.className="verd go";
    v.innerHTML=`<div class="t">✅ ARMADO — espera la confirmación</div><div class="s">Todo alineado. Entra solo cuando cierre la vela de confirmación dentro del POI.</div>`;
  }else{
    v.className="verd no";
    const faltan=[]; if(!kz)faltan.push("killzone"); if(!GAT.arm.sweep)faltan.push("barrido"); if(!GAT.arm.mss)faltan.push("MSS 15M"); if(!GAT.arm.zona)faltan.push("zona"); if(!GAT.arm.bias)faltan.push("bias");
    v.innerHTML=`<div class="t">⛔ NO DISPARES</div><div class="s">Falta: ${faltan.join(", ")}. Sin esto es improvisar.</div>`;
  }
}
function calcGatillo(){
  const par=$("#gPar")?.value||"EUR/USD";
  const ps=pipSize(par), dg=ps===0.01?3:5;
  const hi=parseFloat($("#gHi")?.value), lo=parseFloat($("#gLo")?.value);
  const sl=parseFloat($("#gSl")?.value), tp=parseFloat($("#gTp")?.value);
  const bal=parseFloat($("#gBal")?.value)||0, pctv=parseFloat($("#gPct")?.value)||0;
  const ent=(isFinite(hi)&&isFinite(lo))?(hi+lo)/2:NaN;

  const ev=$("#gEntry");
  if(ev){
    if(isFinite(ent)){ ev.className="verd go"; ev.innerHTML=`<div class="t">Entrada: ${ent.toFixed(dg)}</div><div class="s">50% del POI · ${GAT.dir}</div>`; }
    else{ ev.className="verd"; ev.innerHTML=`<div class="t">Entrada 50%</div><div class="s">Mete los dos extremos del POI</div>`; }
  }
  if(bal>0) BAL.bal=bal; if(pctv>0) BAL.pct=pctv; save(K.bal,BAL);

  const out=$("#gOut"), note=$("#gRRnote"); if(!out) return;
  if(!isFinite(ent)||!isFinite(sl)){ out.innerHTML=""; if(note) note.textContent=""; return; }
  const slPips=Math.abs(ent-sl)/ps;
  const riesgo=bal*(pctv/100);
  const pv=pipValueUSD(par, ent);
  const lotes= slPips>0 ? riesgo/(slPips*pv) : 0;
  const rr= isFinite(tp) ? Math.abs(tp-ent)/Math.abs(ent-sl) : null;
  let dirWarn="";
  if(GAT.dir==="Compra" && sl>ent) dirWarn="⚠️ En COMPRA el SL va DEBAJO de la entrada.";
  if(GAT.dir==="Venta"  && sl<ent) dirWarn="⚠️ En VENTA el SL va ENCIMA de la entrada.";
  out.innerHTML=`
    <div class="st"><div class="v n">${r1(slPips)}</div><div class="k">Pips SL</div></div>
    <div class="st"><div class="v">${r2(lotes)}</div><div class="k">Lotaje</div></div>
    <div class="st"><div class="v ${rr==null?'n':rr>=3?'g':rr>=2?'':'r'}">${rr==null?"—":"1:"+r1(rr)}</div><div class="k">RR</div></div>`;
  if(note){
    let m=`Riesgo $${r2(riesgo)} (${pctv}% de $${r1(bal)}). Valor pip ~$${r2(pv)}/lote para ${par}.`;
    if(rr!=null && rr<2) m+=" ⚠️ RR por debajo de 1:2 — tu plan pide mínimo 1:3 en B y 1:4 en A+.";
    note.textContent = dirWarn ? dirWarn+"  "+m : m;
    note.style.color = dirWarn ? "var(--red)" : "var(--txt3)";
  }
}
function cargarGatilloDiario(){
  const par=$("#gPar")?.value||"EUR/USD";
  const ps=pipSize(par), dg=ps===0.01?3:5;
  const hi=parseFloat($("#gHi")?.value), lo=parseFloat($("#gLo")?.value);
  const ent=(isFinite(hi)&&isFinite(lo))?(hi+lo)/2:NaN;
  const slv=($("#gSl")?.value||"").trim(), tpv=($("#gTp")?.value||"").trim();
  const poi=$("#gPoi")?.value||"FVG";

  FORM.dir=GAT.dir;
  FORM.par=["EUR/USD","GBP/USD"].includes(par)?par:"Otro";
  FORM.poi=poi;
  FORM.disp = poi==="FVG" ? "FVG 50%" : poi==="Order Block" ? "Order Block" : "Otro";
  FORM.zona = GAT.dir==="Compra" ? "Discount" : "Premium";
  FORM.bias = GAT.arm.bias ? "A favor" : "En contra";
  FORM.momento="En confirmación"; FORM.gtf="5M";

  EDIT_ID=null;
  irA("diario");
  $("#sgPar").querySelectorAll("button").forEach(b=>b.className=b.textContent===FORM.par?"on":"");
  $("#fParOtro").style.display=FORM.par==="Otro"?"block":"none"; if(FORM.par==="Otro") $("#fParOtro").value=par;
  $("#sgDir").querySelectorAll("button").forEach(b=>b.className=b.textContent===GAT.dir?("on "+(GAT.dir==="Compra"?"g":"r")):"");
  $("#fZona").value=FORM.zona; $("#fPoi").value=FORM.poi;
  if(isFinite(ent)) $("#fEnt").value=ent.toFixed(dg);
  if(slv) $("#fSl").value=slv; if(tpv) $("#fTp").value=tpv;
  setNuevosSegs();
  toast("Entrada cargada en el diario ✓");
  const ft=$("#formTitulo"); if(ft) window.scrollTo({top:ft.getBoundingClientRect().top+window.scrollY-70,behavior:"smooth"});
}

/* ============================================================
   VISTA 6 — DIARIO  (con contexto Real / Backtest + estrategias)
   ============================================================ */
let FORM={ par:"EUR/USD", dir:"Compra", setup:"A+", ventana:"Pre-NY Kill Zone",
           res:"Win", plan:"Si", emo:"Tranquilo", zona:"Discount", poi:"FVG",
           momento:"En confirmación", disp:"FVG 50%", bias:"A favor", gtf:"5M", news:"Limpio" };
let FILTRO="todo";
let EDIT_ID=null;   // id del trade en edición, o null si es alta nueva

/* Barra de contexto: interruptor Real/Backtest + selector de estrategia.
   Se reutiliza en Diario y en Análisis. */
function barraContexto(onChange){
  const c=el("div","card ctxbar");
  c.innerHTML=`
    <div class="seg c2 ctx-modo" style="margin-bottom:12px">
      <button data-m="real" class="${CTX.modo==='real'?'on g':''}">💵 Real</button>
      <button data-m="backtest" class="${CTX.modo==='backtest'?'on':''}" style="${CTX.modo==='backtest'?'border-color:var(--purple);color:var(--purple);background:rgba(155,123,245,.09)':''}">🧪 Backtest</button>
    </div>
    <div class="fl">Estrategia</div>
    <div style="display:flex;gap:8px">
      <select class="inp ctx-estr" style="flex:1">${ESTRATEGIAS.map(e=>`<option ${e===CTX.estrategia?'selected':''}>${esc(e)}</option>`).join("")}</select>
      <button class="btn ctx-menu" style="width:52px;flex-shrink:0;padding:0;font-size:22px">⋯</button>
    </div>
    <div class="ctxpill ctx-pill"></div>`;
  const pill=c.querySelector(".ctx-pill");
  const n=tradesCtx().length;
  pill.innerHTML=`<span>${CTX.modo==='real'?'Operaciones reales':'Backtesting'} · <b>${esc(CTX.estrategia)}</b></span><span>${n} trade${n!==1?'s':''}</span>`;

  c.querySelectorAll(".ctx-modo button").forEach(b=>{
    b.onclick=()=>{ CTX.modo=b.dataset.m; guardarCtx(); onChange(); };
  });
  c.querySelector(".ctx-estr").onchange=e=>{ CTX.estrategia=e.target.value; guardarCtx(); onChange(); };
  c.querySelector(".ctx-menu").onclick=menuEstrategias;
  return c;
}

function definirEstrategia(nombre){
  const def=ESTR_DEFS[nombre]||{};
  const inst=prompt("Instrumento(s) de \""+nombre+"\" (ej. Forex EUR/USD-GBP/USD, Oro XAU/USD, Índices US30/NAS100, Acciones):", def.instrumento||"");
  if(inst===null) return; // canceló
  const aj=prompt("Reglas / ajustes / aprendizajes de \""+nombre+"\" (lo que Roberto debe respetar y adaptar en esta estrategia — escribe libre, se puede editar cuando quieras):", def.ajustes||"");
  if(aj===null) return;
  ESTR_DEFS[nombre]={ instrumento:inst.trim(), ajustes:aj.trim() };
  guardarEstrDefs();
  toast("Definición guardada ✓");
}
function menuEstrategias(){
  const acc=prompt(
    "GESTIÓN DE ESTRATEGIAS\n\nEstrategias actuales:\n· "+ESTRATEGIAS.join("\n· ")+
    "\n\nEscribe:\n  N = nueva estrategia\n  D = definir/editar la actual ("+CTX.estrategia+")\n  R = renombrar la actual\n  X = borrar la actual (y sus trades)\n\nDeja vacío para cancelar."
  );
  if(!acc) return;
  const a=acc.trim().toUpperCase();
  if(a==="N"){
    const nom=prompt("Nombre de la nueva estrategia:");
    if(nom && nom.trim()){
      const nn=nom.trim();
      if(ESTRATEGIAS.includes(nn)){ toast("Ya existe esa estrategia"); return; }
      ESTRATEGIAS.push(nn); guardarEstrategias();
      CTX.estrategia=nn; guardarCtx();
      refrescarDiarioCtx(); toast("Estrategia creada ✓");
      definirEstrategia(nn);   // pide instrumento + reglas de la nueva
    }
  }else if(a==="D"){
    definirEstrategia(CTX.estrategia);
  }else if(a==="R"){
    const nom=prompt("Nuevo nombre para \""+CTX.estrategia+"\":", CTX.estrategia);
    if(nom && nom.trim() && nom.trim()!==CTX.estrategia){
      const nn=nom.trim(), viejo=CTX.estrategia;
      if(ESTRATEGIAS.includes(nn)){ toast("Ya existe ese nombre"); return; }
      ESTRATEGIAS=ESTRATEGIAS.map(e=>e===viejo?nn:e); guardarEstrategias();
      TRADES.forEach(t=>{ if(t.estrategia===viejo) t.estrategia=nn; }); save(K.trades,TRADES);
      if(ESTR_DEFS[viejo]){ ESTR_DEFS[nn]=ESTR_DEFS[viejo]; delete ESTR_DEFS[viejo]; guardarEstrDefs(); }
      CTX.estrategia=nn; guardarCtx();
      refrescarDiarioCtx(); toast("Estrategia renombrada ✓");
    }
  }else if(a==="X"){
    if(ESTRATEGIAS.length<=1){ toast("Debe quedar al menos una estrategia"); return; }
    const nT=TRADES.filter(t=>t.estrategia===CTX.estrategia).length;
    if(confirm("¿Borrar la estrategia \""+CTX.estrategia+"\" y sus "+nT+" trades (real + backtest)? No se puede deshacer.")){
      const viejo=CTX.estrategia;
      TRADES=TRADES.filter(t=>t.estrategia!==viejo); save(K.trades,TRADES);
      ESTRATEGIAS=ESTRATEGIAS.filter(e=>e!==viejo); guardarEstrategias();
      if(ESTR_DEFS[viejo]){ delete ESTR_DEFS[viejo]; guardarEstrDefs(); }
      CTX.estrategia=ESTRATEGIAS[0]; guardarCtx();
      refrescarDiarioCtx(); toast("Estrategia borrada");
    }
  }
}

/* Rehace la barra de contexto y todo lo dependiente, en Diario y Análisis */
function refrescarDiarioCtx(){
  const cb=$("#ctxWrapDiario");
  if(cb){ cb.innerHTML=""; cb.appendChild(barraContexto(()=>{ EDIT_ID=null; refrescarDiarioCtx(); })); }
  actualizarFormLabel();
  pintarSelCuentaTrade();
  renderDiario();
  if(TAB==="analisis") renderAnalisis();
}

/* Ajusta textos del formulario según modo (real/backtest) */
function actualizarFormLabel(){
  const bt = CTX.modo==="backtest";
  const cardHoy=$("#cardHoy");
  if(cardHoy) cardHoy.style.display = bt ? "none" : "";
  const t=$("#formTitulo");
  if(t) t.textContent = bt ? "Registrar trade de backtest" : "Registrar en caliente";
  const d=$("#formDesc");
  if(d) d.textContent = bt
    ? "Registra cada operación de tu backtest. La fecha es la de la vela histórica que operaste."
    : "Llénalo al cerrar el trade. Todo lo demás se calcula solo en la pestaña Análisis.";
  const wf=$("#wrapFecha");
  if(wf) wf.style.display = bt ? "block" : "none";
  const bs=$("#btnSave");
  if(bs && !EDIT_ID) bs.textContent = bt ? "+ Guardar trade de backtest" : "+ Guardar trade del día";
}

function viewDiario(){
  const v=el("div","view"); v.id="v-diario";

  const ctxWrap=el("div"); ctxWrap.id="ctxWrapDiario";
  ctxWrap.appendChild(barraContexto(()=>{ EDIT_ID=null; refrescarDiarioCtx(); }));
  v.appendChild(ctxWrap);

  const hoy=el("div","card"); hoy.id="cardHoy";
  hoy.innerHTML=`<div class="card-h"><span class="ic">🚦</span><h2>Trades de hoy</h2>
    <span class="cnt" id="cnt-hoy">0/2</span></div>
    <div class="slots" id="slots"></div><div id="hoyMsg"></div>`;
  v.appendChild(hoy);

  const f=el("div","card");
  f.innerHTML=`<div class="card-h"><span class="ic">📝</span><h2 id="formTitulo">Registrar en caliente</h2></div>
  <p class="desc" id="formDesc">Llénalo al cerrar el trade. Todo lo demás se calcula solo en la pestaña Análisis.</p>

  <div class="fld" id="wrapFecha" style="display:none">
    <div class="fl">Fecha del trade (vela histórica)</div>
    <input class="inp" id="fFecha" type="date"></div>

  <div class="fld" id="wrapCuenta">
    <div class="fl">Cuenta de fondeo (opcional)</div>
    <select class="inp" id="fCuenta"></select>
    <div class="note" style="text-align:left;margin-top:4px">Elige de qué cuenta es este trade y sumará en la pestaña 🏦 Cuentas.</div>
  </div>

  <div class="fl">Par</div>
  <div class="seg c3" id="sgPar"></div>
  <input class="inp" id="fParOtro" placeholder="Escribe el par" style="display:none;margin-bottom:14px">

  <div class="fl">Dirección</div><div class="seg c2" id="sgDir"></div>
  <div class="fl">Setup</div><div class="seg c3" id="sgSetup"></div>

  <div class="fld"><div class="fl">Ventana</div>
    <select class="inp" id="fVentana">${VENTANAS_DIARIO.map(x=>`<option>${x}</option>`).join("")}</select></div>

  <div class="fl">Confluencias presentes</div>
  <div id="sgConf" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px"></div>

  <div class="g2">
    <div><div class="fl">Zona de valor</div><select class="inp" id="fZona">
      <option>Discount</option><option>Premium</option><option>Tierra de nadie</option></select></div>
    <div><div class="fl">POI de entrada</div><select class="inp" id="fPoi">
      <option>FVG</option><option>Order Block</option><option>Breaker</option><option>Otro</option></select></div>
  </div>

  <div class="g3">
    <div><div class="fl">Entrada</div><input class="inp" id="fEnt" inputmode="decimal" placeholder="1.08500"></div>
    <div><div class="fl">SL</div><input class="inp" id="fSl" inputmode="decimal" placeholder="1.08400"></div>
    <div><div class="fl">TP</div><input class="inp" id="fTp" inputmode="decimal" placeholder="1.08900"></div>
  </div>

  <div class="fl">Momento de entrada</div><div class="seg c3" id="sgMomento"></div>
  <div class="note" style="text-align:left;margin:-6px 0 14px">"El toque" y "Anticipé" son tu fuga histórica de timing. "En confirmación" = esperaste la vela cerrada. Sé honesto: aquí se diagnostica tu punto débil.</div>

  <div class="g2">
    <div><div class="fl">Disparador</div><select class="inp" id="fDisp">${DISPARADORES.map(x=>`<option>${x}</option>`).join("")}</select></div>
    <div><div class="fl">RR planificado</div><input class="inp" id="fRRplan" inputmode="decimal" placeholder="3.0"></div>
  </div>

  <div class="fl">TF de gatillo</div><div class="seg c3" id="sgGtf"></div>
  <div class="fl">Respecto al bias semanal</div><div class="seg c2" id="sgBias"></div>
  <div class="fl">Noticias alrededor</div><div class="seg c2" id="sgNews"></div>

  <div class="fl">Resultado</div><div class="seg c3" id="sgRes"></div>

  <div class="g2">
    <div><div class="fl">R obtenido</div><input class="inp" id="fR" inputmode="decimal" placeholder="2.0"></div>
    <div><div class="fl">Confluencias (nº)</div><input class="inp" id="fNconf" inputmode="numeric" placeholder="5" readonly></div>
  </div>

  <div class="g2">
    <div><div class="fl">MAE (en contra)</div><input class="inp" id="fMae" inputmode="decimal" placeholder="-0.4"></div>
    <div><div class="fl">MFE (a favor)</div><input class="inp" id="fMfe" inputmode="decimal" placeholder="2.8"></div>
  </div>
  <div class="note" style="text-align:left;margin:-6px 0 14px">MAE = cuánto fue en contra antes de girar. MFE = lo máximo a favor que llegó a ir. Ambos en R. Opcionales, pero son los que revelan si tu SL o tu TP están mal puestos.</div>

  <div class="fl">¿Seguí el plan 100%?</div><div class="seg c2" id="sgPlan"></div>
  <div class="fl">Estado emocional</div><div class="seg c3" id="sgEmo"></div>

  <div class="fld"><div class="fl">Nota / aprendizaje</div>
    <textarea class="inp" id="fNota" placeholder="Qué hice bien, qué corrijo, qué observé del mercado…"></textarea></div>

  <button class="btn green" id="btnSave">+ Guardar trade del día</button>
  <button class="btn" id="btnCancelEdit" style="display:none;margin-top:10px">Cancelar edición</button>`;
  v.appendChild(f);

  const h=el("div","card");
  h.innerHTML=`<div class="card-h"><span class="ic">📒</span><h2>Historial</h2>
    <span class="cnt" id="cnt-hist">0</span></div>
    <div class="seg c4" id="sgFiltro" style="margin-bottom:14px"></div>
    <div id="listaTrades"></div>`;
  v.appendChild(h);

  const ex=el("div","card");
  ex.innerHTML=`<div class="card-h"><span class="ic">📤</span><h2>Exportar y respaldar</h2></div>
    <p class="desc">El CSV exporta lo que ves (contexto + filtro actual). El respaldo JSON guarda TODO: real, backtest y todas las estrategias.</p>`;
  const b1=el("button","btn gold","⬇️ CSV de este contexto (según filtro)"); b1.onclick=exportCSV;
  const b2=el("button","btn","💾 Respaldo JSON completo (todo)"); b2.onclick=exportJSON;
  const b2b=el("button","btn","☁️ Guardar respaldo en Drive / Archivos"); b2b.onclick=compartirRespaldo;
  const b3=el("button","btn","📥 Restaurar desde respaldo"); b3.onclick=()=>$("#fileIn").click();
  ex.append(b1,b2,b2b,b3);
  const fi=el("input"); fi.type="file"; fi.id="fileIn"; fi.accept=".json"; fi.style.display="none";
  fi.onchange=importJSON; ex.appendChild(fi);
  ex.appendChild(el("div","note","Guardado en este teléfono. Se borra si limpias los datos del navegador — haz un respaldo JSON cada semana."));
  const b4=el("button","btn danger","Borrar los trades de este contexto"); b4.style.marginTop="14px";
  b4.onclick=()=>{ const n=tradesCtx().length;
    if(!n){ toast("No hay trades en este contexto"); return; }
    if(confirm("¿Borrar los "+n+" trades de "+(CTX.modo==="real"?"Real":"Backtest")+" · "+CTX.estrategia+"?")){
      TRADES=TRADES.filter(t=>!(t.modo===CTX.modo&&t.estrategia===CTX.estrategia)); save(K.trades,TRADES);
      refrescarDiarioCtx(); toast("Contexto borrado"); } };
  ex.append(b4);
  v.appendChild(ex);

  const arch=el("div","card");
  arch.innerHTML=`<div class="card-h"><span class="ic">🗂️</span><h2>Archivar y limpiar</h2></div>
    <p class="desc">Para no acumular de más con el tiempo: primero descarga un respaldo JSON completo y luego borra los trades anteriores a la fecha que elijas, en ESTE contexto (Real/Backtest + estrategia). Tus datos ocupan poquísimo; esto es solo si quieres mantenerlo ligero.</p>
    <div class="row"><div class="l" style="min-width:118px">Borrar anteriores a</div><input class="inp" id="archFecha" type="date" style="max-width:52%"></div>
    <button class="btn danger" id="btnArchivar">🗂️ Respaldar y borrar lo anterior</button>
    <div class="note">Siempre se descarga el respaldo ANTES de borrar. Guarda ese archivo en tu Drive y no pierdes nada.</div>`;
  arch.querySelector("#btnArchivar").onclick=archivarLimpiar;
  v.appendChild(arch);
  return v;
}

function initDiarioControles(){
  const seg=(cont,opts,key,cls)=>{
    const c=$(cont); if(!c) return; c.innerHTML="";
    opts.forEach(o=>{
      const b=el("button",FORM[key]===o.v?("on"+(o.c?" "+o.c:"")):"",o.t);
      b.dataset.v=o.v; if(o.c) b.dataset.c=o.c;
      b.onclick=()=>{ FORM[key]=o.v;
        c.querySelectorAll("button").forEach(x=>x.className="");
        b.className="on"+(o.c?" "+o.c:"");
        if(key==="par") $("#fParOtro").style.display = o.v==="Otro" ? "block":"none";
      };
      c.appendChild(b);
    });
  };
  seg("#sgPar",[{t:"EUR/USD",v:"EUR/USD"},{t:"GBP/USD",v:"GBP/USD"},{t:"Otro",v:"Otro"}],"par");
  seg("#sgDir",[{t:"Compra",v:"Compra",c:"g"},{t:"Venta",v:"Venta",c:"r"}],"dir");
  seg("#sgSetup",[{t:"A+",v:"A+"},{t:"B",v:"B"},{t:"C",v:"C"}],"setup");
  seg("#sgRes",[{t:"Win",v:"Win",c:"g"},{t:"Loss",v:"Loss",c:"r"},{t:"BE",v:"BE"}],"res");
  seg("#sgPlan",[{t:"Sí",v:"Si",c:"g"},{t:"No",v:"No",c:"r"}],"plan");
  seg("#sgEmo",[{t:"Tranquilo",v:"Tranquilo"},{t:"Ansioso",v:"Ansioso"},{t:"Con prisa",v:"Con prisa"}],"emo");
  seg("#sgMomento",[{t:"Confirmación",v:"En confirmación",c:"g"},{t:"El toque",v:"En el toque",c:"r"},{t:"Anticipé",v:"Anticipé",c:"r"}],"momento");
  seg("#sgGtf",[{t:"5M",v:"5M"},{t:"3M",v:"3M"},{t:"1M",v:"1M"}],"gtf");
  seg("#sgBias",[{t:"A favor",v:"A favor",c:"g"},{t:"En contra",v:"En contra",c:"r"}],"bias");
  seg("#sgNews",[{t:"Limpio",v:"Limpio",c:"g"},{t:"Noticia cerca",v:"Noticia cerca",c:"r"}],"news");

  const cf=$("#sgConf"); if(cf){ cf.innerHTML="";
    CONFLUENCIAS.forEach(x=>{
      const nom=x.t.replace(/ de liquidez| \/ MOMENTUM/,"");
      const b=el("button","seg-c",nom);
      b.style.cssText="padding:11px 6px;border-radius:10px;background:var(--card2);border:1.5px solid transparent;font-weight:600;font-size:13.5px;color:var(--txt2)";
      b.dataset.on="0"; b.dataset.id=x.id;
      b.onclick=()=>{ const on=b.dataset.on==="1"; b.dataset.on=on?"0":"1";
        b.style.borderColor=on?"transparent":"var(--green)";
        b.style.color=on?"var(--txt2)":"var(--green)";
        b.style.background=on?"var(--card2)":"rgba(49,196,106,.09)";
        const n=cf.querySelectorAll('[data-on="1"]').length;
        $("#fNconf").value=n;
        if(n===5)FORM.setup="A+"; else if(n===4)FORM.setup="B"; else if(n===3)FORM.setup="C";
        const sc=$("#sgSetup"); if(sc&&n>=3){ sc.querySelectorAll("button").forEach(x=>{ x.className = x.textContent===FORM.setup?"on":""; }); }
      };
      cf.appendChild(b);
    });
  }

  const ff=$("#sgFiltro"); if(ff){ ff.innerHTML="";
    [{t:"Hoy",v:"hoy"},{t:"Semana",v:"semana"},{t:"Mes",v:"mes"},{t:"Todo",v:"todo"}].forEach(o=>{
      const b=el("button",FILTRO===o.v?"on":"",o.t);
      b.onclick=()=>{ FILTRO=o.v; ff.querySelectorAll("button").forEach(x=>x.className=""); b.className="on"; renderDiario(); };
      ff.appendChild(b);
    });
  }
  const bs=$("#btnSave"); if(bs) bs.onclick=guardarTrade;
  const bc=$("#btnCancelEdit"); if(bc) bc.onclick=cancelarEdicion;
  actualizarFormLabel();
  pintarSelCuentaTrade();
}

function setConfBtns(ids){
  document.querySelectorAll('#sgConf button').forEach(b=>{
    const on=ids.includes(b.dataset.id);
    b.dataset.on=on?"1":"0";
    b.style.borderColor=on?"var(--green)":"transparent";
    b.style.color=on?"var(--green)":"var(--txt2)";
    b.style.background=on?"rgba(49,196,106,.09)":"var(--card2)";
  });
  const n=ids.length; $("#fNconf").value = n||"";
}
function setSeg(cont,val){
  const c=$(cont); if(!c) return;
  c.querySelectorAll("button").forEach(b=>{
    if(b.textContent===val || b.textContent===(val==="Si"?"Sí":val)){
      b.click(); // reutiliza la lógica de selección
    }
  });
}
/* Repinta un segmentado por valor (usa dataset.v/dataset.c del builder) */
function pintSeg(cont,val){
  const c=$(cont); if(!c) return;
  c.querySelectorAll("button").forEach(b=>{
    b.className = b.dataset.v===val ? ("on"+(b.dataset.c?" "+b.dataset.c:"")) : "";
  });
}
/* Refleja los campos de ejecución (v3.1) en sus controles desde FORM */
function setNuevosSegs(){
  pintSeg("#sgMomento",FORM.momento);
  pintSeg("#sgGtf",FORM.gtf);
  pintSeg("#sgBias",FORM.bias);
  pintSeg("#sgNews",FORM.news);
  const fd=$("#fDisp"); if(fd) fd.value=FORM.disp;
}

function limpiarForm(){
  ["fEnt","fSl","fTp","fR","fMae","fMfe","fNota","fParOtro","fRRplan"].forEach(i=>{ const e=$("#"+i); if(e) e.value=""; });
  $("#fNconf").value="";
  setConfBtns([]);
  $("#fParOtro").style.display="none";
  FORM.momento="En confirmación"; FORM.disp="FVG 50%"; FORM.bias="A favor"; FORM.gtf="5M"; FORM.news="Limpio";
  setNuevosSegs();
  const fc=$("#fCuenta"); if(fc) fc.value="";
}
/* Rellena el <select> de cuenta del formulario de trade (se refresca al entrar) */
function pintarSelCuentaTrade(){
  const s=$("#fCuenta"); if(!s) return;
  const prev=s.value;
  const act=CUENTAS.filter(c=>c.fase!=="Cerrada");
  s.innerHTML=`<option value="">— Sin cuenta —</option>`+
    act.map(c=>`<option value="${c.id}">${esc(c.alias||c.firma||"Cuenta")} · ${esc(c.firma||"")} (${esc(c.fase||"")})</option>`).join("");
  if(prev) s.value=prev;
}

function guardarTrade(){
  const rTxt=$("#fR").value.trim();
  if(rTxt===""){ toast("Falta el R obtenido"); $("#fR").focus(); return; }
  const R=parseFloat(rTxt);
  if(isNaN(R)){ toast("El R debe ser un número"); return; }

  const bt = CTX.modo==="backtest";
  let fecha;
  if(bt){
    fecha=$("#fFecha").value;
    if(!fecha){ toast("Pon la fecha de la vela"); $("#fFecha").focus(); return; }
  }else{
    fecha=EDIT_ID ? (TRADES.find(t=>t.id===EDIT_ID)?.fecha||hoyISO()) : hoyISO();
  }

  const confIds=[...document.querySelectorAll('#sgConf [data-on="1"]')].map(b=>b.dataset.id);
  const par = FORM.par==="Otro" ? ($("#fParOtro").value.trim()||"Otro") : FORM.par;

  // Límite diario: solo aplica a Real y solo en alta nueva
  let fueraLimite=false;
  if(!bt && !EDIT_ID){
    const delDia=tradesCtx().filter(t=>t.fecha===fecha).length;
    if(delDia>=2 && !confirm("Ya tienes 2 trades hoy (R6). ¿Registrarlo igual? Quedará marcado como regla rota.")) return;
    fueraLimite = delDia>=2;
  }

  const datos={
    fecha, dia: diaSemana(fecha),
    par, dir:FORM.dir, setup:FORM.setup, ventana:$("#fVentana").value,
    zona:$("#fZona").value, poi:$("#fPoi").value,
    entrada:$("#fEnt").value.trim(), sl:$("#fSl").value.trim(), tp:$("#fTp").value.trim(),
    res:FORM.res, r:R,
    nconf: confIds.length || (parseInt($("#fNconf").value)||0),
    confs: confIds,
    mae: $("#fMae").value.trim()===""?null:parseFloat($("#fMae").value),
    mfe: $("#fMfe").value.trim()===""?null:parseFloat($("#fMfe").value),
    momento:FORM.momento, disp:($("#fDisp")?.value||FORM.disp), bias:FORM.bias, gtf:FORM.gtf, news:FORM.news,
    rrPlan: ($("#fRRplan")?.value||"").trim()===""?null:parseFloat($("#fRRplan").value),
    plan:FORM.plan, emo:FORM.emo, nota:$("#fNota").value.trim(),
    cuenta: ($("#fCuenta")?.value||"")
  };

  let nuevoTrade=null;
  if(EDIT_ID){
    const t=TRADES.find(x=>x.id===EDIT_ID);
    if(t){ Object.assign(t,datos); save(K.trades,TRADES); }
    cancelarEdicion();
    toast("Trade actualizado ✓");
  }else{
    const t=Object.assign({
      id: Date.now(),
      modo: CTX.modo, estrategia: CTX.estrategia,
      hora: bt ? "" : new Date().toTimeString().slice(0,5),
      fueraLimite
    }, datos);
    TRADES.push(t); save(K.trades,TRADES);
    try{ veredEnlazar(t); veredActualizar(t); }catch(_){}   /* 🎯 enlaza con la lectura de Roberto */
    nuevoTrade=t;
    limpiarForm();
    if(bt) toast("Trade de backtest guardado ✓"); else toast("Trade guardado ✓");
  }
  refrescarDiarioCtx();
  if(nuevoTrade) mostrarCriterio(nuevoTrade);
  notifChequearCuentasDD();
  if(nuevoTrade) robertoVigila(resumenTradeVigila(nuevoTrade));
}

function editarTrade(id){
  const t=TRADES.find(x=>x.id===id); if(!t) return;
  EDIT_ID=id;
  // rellenar
  FORM.par = ["EUR/USD","GBP/USD"].includes(t.par) ? t.par : "Otro";
  $("#sgPar").querySelectorAll("button").forEach(b=>{ b.className = b.textContent===FORM.par?"on":""; });
  $("#fParOtro").style.display = FORM.par==="Otro"?"block":"none";
  if(FORM.par==="Otro") $("#fParOtro").value=t.par;

  FORM.dir=t.dir;   $("#sgDir").querySelectorAll("button").forEach(b=>b.className=b.textContent===t.dir?("on "+(t.dir==="Compra"?"g":"r")):"");
  FORM.setup=t.setup; $("#sgSetup").querySelectorAll("button").forEach(b=>b.className=b.textContent===t.setup?"on":"");
  FORM.res=t.res;   $("#sgRes").querySelectorAll("button").forEach(b=>b.className=b.textContent===t.res?("on "+(t.res==="Win"?"g":t.res==="Loss"?"r":"")):"");
  FORM.plan=t.plan; $("#sgPlan").querySelectorAll("button").forEach(b=>b.className=(b.textContent==="Sí"&&t.plan==="Si")||(b.textContent==="No"&&t.plan==="No")?("on "+(t.plan==="Si"?"g":"r")):"");
  FORM.emo=t.emo;   $("#sgEmo").querySelectorAll("button").forEach(b=>b.className=b.textContent===t.emo?"on":"");

  $("#fVentana").value=t.ventana||VENTANAS_DIARIO[0];
  $("#fZona").value=t.zona||"Discount";
  $("#fPoi").value=t.poi||"FVG";
  $("#fEnt").value=t.entrada||""; $("#fSl").value=t.sl||""; $("#fTp").value=t.tp||"";
  $("#fR").value=t.r; $("#fMae").value=t.mae==null?"":t.mae; $("#fMfe").value=t.mfe==null?"":t.mfe;
  $("#fNota").value=t.nota||"";
  setConfBtns(t.confs||[]);
  FORM.momento=t.momento||"En confirmación"; FORM.disp=t.disp||"FVG 50%";
  FORM.bias=t.bias||"A favor"; FORM.gtf=t.gtf||"5M"; FORM.news=t.news||"Limpio";
  setNuevosSegs();
  $("#fRRplan").value = t.rrPlan!=null ? t.rrPlan : "";
  pintarSelCuentaTrade(); const fc=$("#fCuenta"); if(fc) fc.value=t.cuenta||"";
  if(CTX.modo==="backtest" && t.fecha){ $("#fFecha").value=t.fecha; }

  $("#btnSave").textContent="💾 Guardar cambios";
  $("#btnSave").className="btn gold";
  $("#btnCancelEdit").style.display="block";
  $("#formTitulo").textContent="Editando trade";
  window.scrollTo({top:$("#formTitulo").getBoundingClientRect().top+window.scrollY-70,behavior:"smooth"});
}
function cancelarEdicion(){
  EDIT_ID=null;
  limpiarForm();
  $("#btnSave").className="btn green";
  $("#btnCancelEdit").style.display="none";
  actualizarFormLabel();
}

function tradesFiltrados(){
  const base=tradesCtx();
  const hoy=hoyISO();
  let list;
  if(FILTRO==="hoy")        list=base.filter(t=>t.fecha===hoy);
  else if(FILTRO==="semana"){ const l=lunesDe(hoy); list=base.filter(t=>t.fecha>=l); }
  else if(FILTRO==="mes")   list=base.filter(t=>t.fecha.slice(0,7)===hoy.slice(0,7));
  else list=base.slice();
  // ordenar por fecha+hora (los backtest pueden ser de cualquier día)
  return list.sort((a,b)=>(a.fecha+(a.hora||"")).localeCompare(b.fecha+(b.hora||"")));
}

function renderDiario(){
  const hoy=hoyISO();
  const esReal = CTX.modo==="real";
  const hoyT = esReal ? tradesCtx().filter(t=>t.fecha===hoy) : [];

  const cn=$("#cnt-hoy"); if(cn) cn.textContent=Math.min(hoyT.length,2)+"/2";
  const sl=$("#slots");
  if(sl){ sl.innerHTML="";
    for(let i=0;i<2;i++){
      const t=hoyT[i];
      if(t){ const c=t.res==="Win"?"w":t.res==="Loss"?"l":"be";
        sl.appendChild(el("div","slot fill "+c,(t.r>0?"+":"")+r1(t.r)+"R")); }
      else sl.appendChild(el("div","slot",""));
    }
  }
  const hm=$("#hoyMsg");
  if(hm){
    const sls=hoyT.filter(t=>t.res==="Loss").length;
    if(hoyT.length===0) hm.innerHTML=`<div class="empty"><div class="t">Sin trades aún</div><div class="s">Máximo 2 por día. 2 SL = cierre total.</div></div>`;
    else if(sls>=2) hm.innerHTML=`<div class="verd no"><div class="t">⛔ 2 SL HOY — CIERRE TOTAL</div><div class="s">R7: prohibido abrir gráficos operativos hasta mañana.</div></div>`;
    else if(hoyT.length>=2) hm.innerHTML=`<div class="verd no"><div class="t">🚦 LÍMITE DIARIO ALCANZADO</div><div class="s">R6: cierra plataforma hasta mañana, gane o pierda.</div></div>`;
    else { const neto=hoyT.reduce((a,t)=>a+t.r,0);
      hm.innerHTML=`<div class="verd ${neto>=0?'go':''}"><div class="t">${neto>0?"+":""}${r1(neto)}R hoy</div><div class="s">Te queda 1 trade disponible.</div></div>`; }
  }

  const lista=tradesFiltrados().slice().reverse();
  const ch=$("#cnt-hist"); if(ch) ch.textContent=lista.length;
  const cont=$("#listaTrades");
  if(cont){
    if(!lista.length){ cont.innerHTML=`<p class="desc" style="text-align:center;margin:14px 0">No hay trades en este rango. Cambia el filtro o registra uno nuevo.</p>`; }
    else{
      cont.innerHTML="";
      lista.forEach(t=>{
        const col=t.r>0?"pos":t.r<0?"neg":"";
        const pc=t.setup==="A+"?"a":t.setup==="B"?"b":"c";
        const d=el("div","trade");
        d.style.cursor="pointer";
        d.innerHTML=`<div class="trade-top">
          <div><span class="pill ${pc}">${t.setup||"—"}</span>
            ${t.abierta?'<span class="pill c">✍️ ABIERTA</span>':""}
            ${t.plan==="No"?'<span class="pill br">PLAN ROTO</span>':""}
            ${t.fueraLimite?'<span class="pill br">R6</span>':""}
            <span class="trade-p">${esc(t.par)} · ${esc(t.dir)}</span></div>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="trade-r ${col}">${t.abierta?"abierta":((t.r>0?"+":"")+r1(t.r)+"R")}</span></div></div>
          <div class="trade-m">${t.abierta&&t.entrada!=null?("Entrada "+t.entrada+(t.sl!=null?" · SL "+t.sl:"")+(t.tp!=null?" · TP "+t.tp:"")+(t.rr?" · RR 1:"+t.rr:"")+(t.riesgoPct?" · riesgo "+t.riesgoPct+"%":"")+"<br>"):""}${fechaCorta(t.fecha)} ${esc(t.dia||"")}${t.hora?" · "+esc(t.hora):""} · ${esc(t.ventana)}<br>
            ${t.nconf||0}/5 confluencias · ${esc(t.zona||"—")} · ${esc(t.poi||"—")} · ${esc(t.emo)}
            ${t.mae!=null?" · MAE "+r1(t.mae)+"R":""}${t.mfe!=null?" · MFE "+r1(t.mfe)+"R":""}</div>
          ${t.nota?`<div class="trade-n">${esc(t.nota)}</div>`:""}
          <div class="trade-act">
            <button class="ta" data-a="ver">Ver</button>
            <button class="ta" data-a="edit">Editar</button>
            <button class="ta" data-a="exp">Exportar</button>
            <button class="ta danger" data-a="del">Borrar</button>
          </div>`;
        d.querySelectorAll(".ta").forEach(btn=>{
          btn.onclick=(e)=>{ e.stopPropagation();
            const a=btn.dataset.a;
            if(a==="ver") verTrade(t.id);
            else if(a==="edit") editarTrade(t.id);
            else if(a==="exp") exportarUno(t.id);
            else if(a==="del"){ if(confirm("¿Borrar este trade?")){ TRADES=TRADES.filter(x=>x.id!==t.id); save(K.trades,TRADES); refrescarDiarioCtx(); toast("Trade borrado"); } }
          };
        });
        d.onclick=()=>verTrade(t.id);
        cont.appendChild(d);
      });
    }
  }
}

/* ---------- DETALLE (modal) ---------- */
const NOMC_FULL={c1:"Sweep de liquidez",c2:"MSS (cambio de estructura)",c3:"Displacement",c4:"Reacción en zona (OB/FVG/Breaker)",c5:"Volumen / Momentum"};
function verTrade(id){
  const t=TRADES.find(x=>x.id===id); if(!t) return;
  const col=t.r>0?"pos":t.r<0?"neg":"";
  const fila=(k,val)=>val==null||val===""?"":`<div class="dt-row"><span class="dt-k">${k}</span><span class="dt-v">${val}</span></div>`;
  const cs=(t.confs||[]).map(c=>NOMC_FULL[c]||c).join(", ")||"—";
  const cuerpo=`
    <div class="dt-head">
      <div><span class="pill ${t.setup==='A+'?'a':t.setup==='B'?'b':'c'}">${t.setup}</span>
        ${t.plan==="No"?'<span class="pill br">PLAN ROTO</span>':""}
        <span style="font-weight:700;font-size:17px;margin-left:6px">${esc(t.par)} · ${esc(t.dir)}</span></div>
      <div class="trade-r ${col}" style="font-size:22px">${t.r>0?"+":""}${r1(t.r)}R</div>
    </div>
    <div class="dt-badge">${t.modo==="real"?"💵 Real":"🧪 Backtest"} · ${esc(t.estrategia||"—")}</div>
    ${fila("Fecha", fechaCorta(t.fecha)+" ("+esc(t.dia||"")+")"+(t.hora?" · "+esc(t.hora):""))}
    ${fila("Ventana", esc(t.ventana))}
    ${fila("Resultado", t.res)}
    ${fila("Zona de valor", esc(t.zona||"—"))}
    ${fila("POI de entrada", esc(t.poi||"—"))}
    ${fila("Confluencias", (t.nconf||0)+"/5 — "+esc(cs))}
    ${fila("Entrada / SL / TP", [t.entrada,t.sl,t.tp].filter(Boolean).map(esc).join("  /  ")||"—")}
    ${fila("Momento de entrada", esc(t.momento||"—"))}
    ${fila("Disparador", esc(t.disp||"—"))}
    ${fila("TF de gatillo", esc(t.gtf||"—"))}
    ${fila("Respecto al bias", esc(t.bias||"—"))}
    ${fila("Noticias", esc(t.news||"—"))}
    ${fila("RR planificado", t.rrPlan!=null?"1:"+r1(t.rrPlan):"—")}
    ${fila("MAE (en contra)", t.mae!=null?r1(t.mae)+"R":"—")}
    ${fila("MFE (a favor)", t.mfe!=null?r1(t.mfe)+"R":"—")}
    ${fila("¿Siguió el plan?", t.plan==="Si"?"Sí, 100%":"No")}
    ${fila("Estado emocional", esc(t.emo))}
    ${t.nota?`<div class="dt-nota"><div class="dt-k" style="margin-bottom:6px">Nota / aprendizaje</div>${esc(t.nota)}</div>`:`<div class="dt-nota" style="color:var(--txt3);font-style:italic">Sin nota de aprendizaje registrada.</div>`}
    <div id="dtShots"></div>
  `;
  abrirModal(cuerpo, [
    {t:"Editar", cls:"gold", fn:()=>{ cerrarModal(); editarTrade(id); }},
    {t:"Exportar este", cls:"", fn:()=>exportarUno(id)},
    {t:"Cerrar", cls:"", fn:cerrarModal}
  ]);
  cargarShots(t);
}
/* Carga las capturas del gráfico del trade (apertura/cierre/manuales) desde la nube */
async function cargarShots(t){
  const cont=document.getElementById("dtShots"); if(!cont||!t) return;
  const items=[];
  if(t.shotOpen) items.push({lbl:"📸 Gráfico en la ENTRADA", id:t.shotOpen});
  if(t.shotClose) items.push({lbl:"📸 Gráfico en el CIERRE", id:t.shotClose});
  (t.shots||[]).forEach((s,i)=>items.push({lbl:"📸 Captura "+(i+1), id:s}));
  if(!items.length) return;
  cont.innerHTML='<div class="dt-k" style="margin:10px 0 6px">Capturas del gráfico</div><div class="note" style="text-align:left">Cargando fotos…</div>';
  let html="<div class=\"dt-k\" style=\"margin:10px 0 6px\">Capturas del gráfico</div>";
  let alguna=false;
  for(const it of items){
    const img=await nubeShotGet(it.id);
    if(img){ alguna=true; html+='<div style="margin:6px 0"><div style="font-size:12px;color:var(--txt3);margin-bottom:3px">'+it.lbl+'</div><img src="'+img+'" class="dt-shot" data-fid="'+esc(it.id)+'" data-meta="'+esc(it.lbl)+'" style="width:100%;border-radius:8px;border:1px solid rgba(255,255,255,.12);cursor:pointer"></div>'; }
    else { html+='<div style="margin:6px 0;font-size:12px;color:var(--txt3)">'+it.lbl+': aún subiéndose o no disponible.</div>'; }
  }
  cont.innerHTML=html;
  cont.querySelectorAll(".dt-shot").forEach(im=>im.onclick=()=>abrirFoto(im.dataset.fid, im.dataset.meta));
}

/* ============================================================
   🖼️ GALERÍA de capturas — ordenada por día/semana/mes/año
   ============================================================ */
let GAL_MODO="dia";
function viewGaleria(){
  const v=el("div","view"); v.id="v-galeria";
  v.innerHTML=`
    <div class="card">
      <div class="card-h"><span class="ic">🖼️</span><h2>Galería de capturas</h2></div>
      <p class="desc">Todas las fotos de tus operaciones. Agrúpalas por día, semana, mes o año. Tócalas para verlas grandes.</p>
      <div class="seg" id="galSeg" style="margin-top:8px"></div>
    </div>
    <div id="galBody"></div>`;
  return v;
}
function galeriaCaps(){
  const caps=[];
  (Array.isArray(TRADES)?TRADES:[]).filter(t=>t.modo===CTX.modo && t.estrategia===CTX.estrategia).forEach(t=>{
    const add=(id,tipo)=>{ if(id) caps.push({id, fecha:t.fecha, par:t.par, tipo}); };
    add(t.shotOpen,"Entrada"); add(t.shotClose,"Cierre"); (t.shots||[]).forEach((s,i)=>add(s,"Extra "+(i+1)));
  });
  (Array.isArray(SHOTS)?SHOTS:[]).forEach(s=>{ if(s&&s.id) caps.push({id:s.id, fecha:s.fecha, par:s.par||"—", tipo:s.tipo||"Manual"}); });
  return caps.sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha)));
}
function galPeriodo(fecha, modo){
  const s=String(fecha||""); const p=s.split("-"), Y=p[0], M=p[1];
  if(modo==="año") return Y||"0000";
  if(modo==="mes") return (Y&&M)?(Y+"-"+M):"0000-00";
  if(modo==="semana"){ const d=new Date(s); if(isNaN(d)) return "0000-00-00"; const day=(d.getDay()+6)%7; const on=new Date(d); on.setDate(d.getDate()-day); return on.toISOString().slice(0,10); }
  return s||"0000-00-00";
}
function galLabel(k, modo){
  if(modo==="año") return "Año "+k;
  if(modo==="mes"){ const pp=k.split("-"); const mn=["","enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]; return (mn[parseInt(pp[1],10)]||pp[1])+" "+pp[0]; }
  if(modo==="semana") return "Semana del "+fechaCorta(k);
  return fechaCorta(k);
}
function renderGaleria(){
  const seg=$("#galSeg");
  if(seg){ const modos=[["dia","Día"],["semana","Semana"],["mes","Mes"],["año","Año"]];
    seg.innerHTML=modos.map(m=>`<button data-m="${m[0]}" class="${GAL_MODO===m[0]?'on':''}">${m[1]}</button>`).join("");
    seg.querySelectorAll("button").forEach(b=>b.onclick=()=>{ GAL_MODO=b.dataset.m; renderGaleria(); });
  }
  const body=$("#galBody"); if(!body) return;
  const caps=galeriaCaps();
  if(!caps.length){ body.innerHTML=`<div class="card"><p class="desc" style="text-align:center">Aún no hay capturas. Se guardan solas al registrar y cerrar tus entradas (con el Puente encendido), o cuando le pidas a Roberto "saca captura".</p></div>`; return; }
  const grupos={};
  caps.forEach(c=>{ const k=galPeriodo(c.fecha, GAL_MODO); (grupos[k]=grupos[k]||[]).push(c); });
  const keys=Object.keys(grupos).sort((a,b)=>b.localeCompare(a));
  // Lista de periodos plegables: tocas un día/semana/mes/año y se abren SUS capturas
  const gruposArr=keys.map(k=>grupos[k]);
  body.innerHTML=keys.map((k,idx)=>`
    <div class="card" style="padding-top:10px">
      <div class="gal-head" data-k="${idx}" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">
        <div style="font-weight:700">${esc(galLabel(k,GAL_MODO))}</div>
        <div style="color:var(--txt3);font-size:13px">${grupos[k].length} foto(s) &nbsp;<span class="gal-arrow">▸</span></div>
      </div>
      <div class="gal-body" id="galg${idx}" data-loaded="0" style="display:none;margin-top:10px"></div>
    </div>`).join("");
  body.querySelectorAll(".gal-head").forEach(h=>{
    h.onclick=()=>{
      const idx=+h.dataset.k, cont=document.getElementById("galg"+idx); if(!cont) return;
      const abrir=cont.style.display==="none";
      cont.style.display=abrir?"block":"none";
      const ar=h.querySelector(".gal-arrow"); if(ar) ar.textContent=abrir?"▾":"▸";
      if(abrir && cont.dataset.loaded==="0"){ cont.dataset.loaded="1"; pintarGrupoGaleria(cont, gruposArr[idx]); }
    };
  });
  const first=body.querySelector(".gal-head"); if(first) first.click(); // abre el más reciente por defecto
}
function pintarGrupoGaleria(cont, caps){
  cont.innerHTML=`<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">`+
    caps.map(c=>`<div class="gal-item" data-id="${esc(c.id)}" data-meta="${esc((c.par||"")+" · "+c.tipo+" · "+fechaCorta(c.fecha))}" style="cursor:pointer">
      <div data-img="${esc(c.id)}" style="aspect-ratio:16/10;background:rgba(255,255,255,.05);border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center"><span style="font-size:11px;color:var(--txt3)">cargando…</span></div>
      <div style="font-size:11px;color:var(--txt3);margin-top:3px">${esc(c.par||"")} · ${esc(c.tipo)} · ${esc(fechaCorta(c.fecha))}</div>
    </div>`).join("")+`</div>`;
  cont.querySelectorAll("[data-img]").forEach(async d=>{ const img=await nubeShotGet(d.dataset.img); d.innerHTML=img?`<img src="${img}" style="width:100%;height:100%;object-fit:cover">`:`<span style="font-size:11px;color:var(--txt3)">no disponible</span>`; });
  cont.querySelectorAll(".gal-item").forEach(it=>it.onclick=()=>abrirFoto(it.dataset.id, it.dataset.meta));
}
function abrirModal(html, botones){
  cerrarModal();
  const ov=el("div","modal-ov"); ov.id="modalOv";
  const m=el("div","modal");
  m.innerHTML=`<div class="modal-body">${html}</div>`;
  const bar=el("div","modal-bar");
  botones.forEach(b=>{ const bt=el("button","btn "+(b.cls||""),b.t); bt.onclick=b.fn; bar.appendChild(bt); });
  m.appendChild(bar);
  ov.appendChild(m);
  ov.onclick=e=>{ if(e.target===ov) cerrarModal(); };
  document.body.appendChild(ov);
  requestAnimationFrame(()=>ov.classList.add("show"));
}
function cerrarModal(){ const o=$("#modalOv"); if(o){ o.classList.remove("show"); setTimeout(()=>o.remove(),200); } }

/* ---------- EXPORTAR ---------- */
function bajar(nombre,contenido,tipo){
  const b=new Blob([contenido],{type:tipo});
  const u=URL.createObjectURL(b);
  const a=document.createElement("a"); a.href=u; a.download=nombre;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(u),1500);
}
const CSV_CAB=["Modo","Estrategia","Fecha","Dia","Hora","Par","Direccion","Setup","Confluencias","Lista confluencias",
     "Ventana","Zona","POI","Entrada","SL","TP","Resultado","R","MAE","MFE","Siguio plan","Emocion","Nota",
     "Momento","Disparador","TF gatillo","Bias","Noticias","RR plan"];
const CSV_NOM={c1:"Sweep",c2:"MSS",c3:"Displacement",c4:"Reaccion",c5:"Momentum"};
const csvQ=s=>'"'+String(s==null?"":s).replace(/"/g,'""')+'"';
function tradeToRow(t){
  return [t.modo||"real",t.estrategia||"",t.fecha,t.dia||"",t.hora||"",t.par,t.dir,t.setup,t.nconf||0,
    (t.confs||[]).map(c=>CSV_NOM[c]||c).join(" / "),t.ventana,t.zona||"",t.poi||"",
    t.entrada||"",t.sl||"",t.tp||"",t.res,t.r,t.mae==null?"":t.mae,t.mfe==null?"":t.mfe,
    t.plan,t.emo,t.nota||"",
    t.momento||"",t.disp||"",t.gtf||"",t.bias||"",t.news||"",t.rrPlan==null?"":t.rrPlan].map(csvQ).join(",");
}
function exportCSV(){
  const list=tradesFiltrados();
  if(!list.length){ toast("No hay trades en este contexto/filtro"); return; }
  const filas=list.map(tradeToRow);
  const etq=(CTX.modo==="real"?"Real":"Backtest")+"_"+CTX.estrategia.replace(/[^a-zA-Z0-9]/g,"");
  bajar("CRT_"+etq+"_"+FILTRO+"_"+hoyISO()+".csv","\uFEFF"+CSV_CAB.map(csvQ).join(",")+"\n"+filas.join("\n"),"text/csv;charset=utf-8");
  toast("CSV descargado");
}
function exportarUno(id){
  const t=TRADES.find(x=>x.id===id); if(!t) return;
  bajar("CRT_trade_"+t.fecha+"_"+t.par.replace(/[^a-zA-Z0-9]/g,"")+".csv",
    "\uFEFF"+CSV_CAB.map(csvQ).join(",")+"\n"+tradeToRow(t),"text/csv;charset=utf-8");
  toast("Trade exportado");
}
function exportJSON(){
  bajar("CRT_Elite_respaldo_"+hoyISO()+".json",
    JSON.stringify({version:APP_VERSION,fecha:new Date().toISOString(),
      estrategias:ESTRATEGIAS, ctx:CTX, trades:TRADES, balance:BAL},null,2),
    "application/json");
  toast("Respaldo completo descargado");
}
function importJSON(e){
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=ev=>{
    try{
      const d=JSON.parse(ev.target.result);
      if(!Array.isArray(d.trades)) throw 0;
      if(!confirm("Se importarán "+d.trades.length+" trades. ¿Reemplazar TODOS los datos actuales ("+TRADES.length+" trades)?")) return;
      // migrar por si el respaldo es viejo
      d.trades.forEach(t=>{ if(!t.modo)t.modo="real"; if(!t.estrategia)t.estrategia="CRT Elite"; });
      TRADES=d.trades; save(K.trades,TRADES);
      if(Array.isArray(d.estrategias)&&d.estrategias.length){ ESTRATEGIAS=d.estrategias; guardarEstrategias(); }
      else { // reconstruir lista desde los trades
        ESTRATEGIAS=[...new Set(TRADES.map(t=>t.estrategia))]; if(!ESTRATEGIAS.length)ESTRATEGIAS=["CRT Elite"]; guardarEstrategias();
      }
      if(d.ctx && ESTRATEGIAS.includes(d.ctx.estrategia)){ CTX=d.ctx; guardarCtx(); }
      else { CTX.estrategia=ESTRATEGIAS[0]; guardarCtx(); }
      if(d.balance){ BAL=d.balance; save(K.bal,BAL); }
      // rehacer selector de estrategia
      const wrap=$("#ctxWrapDiario");
      if(wrap){ wrap.innerHTML=""; wrap.appendChild(barraContexto(()=>{ EDIT_ID=null; refrescarDiarioCtx(); })); }
      refrescarDiarioCtx(); toast("Respaldo restaurado ✓");
    }catch(x){ toast("Archivo no válido"); }
  };
  r.readAsText(f); e.target.value="";
}

/* Comparte el respaldo JSON por el menú del sistema (Drive, Archivos, etc.) */
async function compartirRespaldo(){
  const contenido=JSON.stringify({version:APP_VERSION,fecha:new Date().toISOString(),
    estrategias:ESTRATEGIAS, ctx:CTX, trades:TRADES, balance:BAL},null,2);
  const nombre="CRT_Elite_respaldo_"+hoyISO()+".json";
  try{
    const file=new File([contenido],nombre,{type:"application/json"});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({files:[file], title:"Respaldo Apex", text:"Respaldo de tu app Apex"});
      toast("Elige Drive o Archivos para guardarlo ☁️");
      return;
    }
  }catch(e){ if(e && e.name==="AbortError") return; }
  bajar(nombre,contenido,"application/json");
  toast("Descargado. Muévelo a tu Drive.");
}

/* Respalda y borra los trades anteriores a una fecha, en el contexto activo */
function archivarLimpiar(){
  const f=$("#archFecha")?.value;
  if(!f){ toast("Elige una fecha primero"); return; }
  const viejos=tradesCtx().filter(t=>t.fecha<f);
  if(!viejos.length){ toast("No hay trades anteriores a esa fecha aquí"); return; }
  if(!confirm("Se descargará un respaldo COMPLETO y luego se borrarán "+viejos.length+" trade(s) anteriores a "+f+" de "+(CTX.modo==="real"?"Real":"Backtest")+" · "+CTX.estrategia+".\n\nGuarda ese respaldo en tu Drive. ¿Continuar?")) return;
  exportJSON();
  const ids=new Set(viejos.map(t=>t.id));
  TRADES=TRADES.filter(t=>!ids.has(t.id)); save(K.trades,TRADES);
  refrescarDiarioCtx();
  toast(viejos.length+" trade(s) archivados y borrados");
}

/* ============================================================
   VISTA 7 — ANÁLISIS  (el motor nuevo)
   ============================================================ */
let PERIODO="todo";

function viewAnalisis(){
  const v=el("div","view"); v.id="v-analisis";

  const ctxWrap=el("div"); ctxWrap.id="ctxWrapAnalisis";
  ctxWrap.appendChild(barraContexto(()=>{ refrescarAnalisisCtx(); }));
  v.appendChild(ctxWrap);

  const head=el("div","card");
  head.innerHTML=`<div class="card-h"><span class="ic">📈</span><h2>Análisis</h2></div>
    <p class="desc">Se calcula con los trades del contexto de arriba (modo + estrategia). Con menos de 20 trades los números son orientativos; a partir de 50 empiezan a ser fiables.</p>
    <div class="seg c4" id="sgPeriodo"></div>`;
  v.appendChild(head);
  const body=el("div"); body.id="analisisBody";
  v.appendChild(body);
  return v;
}
function refrescarAnalisisCtx(){
  const cb=$("#ctxWrapAnalisis");
  if(cb){ cb.innerHTML=""; cb.appendChild(barraContexto(()=>refrescarAnalisisCtx())); }
  renderAnalisis();
}

function tradesPeriodo(){
  const base=tradesCtx();
  const hoy=hoyISO();
  if(PERIODO==="semana"){ const l=lunesDe(hoy); return base.filter(t=>t.fecha>=l); }
  if(PERIODO==="mes")    return base.filter(t=>t.fecha.slice(0,7)===hoy.slice(0,7));
  if(PERIODO==="30")     { const d=new Date(); d.setDate(d.getDate()-30);
    const iso=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    return base.filter(t=>t.fecha>=iso); }
  return base.slice();
}

/* ---- Núcleo estadístico. Recibe array de trades, devuelve métricas ---- */
function metricas(list){
  list=(list||[]).filter(t=>!t.abierta); // las ENTRADAS abiertas no cuentan en estadísticas hasta cerrarse
  const n=list.length;
  if(!n) return null;
  const wins  = list.filter(t=>t.r>0);
  const loss  = list.filter(t=>t.r<0);
  const bes   = list.filter(t=>t.r===0);
  const decisivos = wins.length+loss.length;

  const rNeto = list.reduce((a,t)=>a+t.r,0);
  const gan   = wins.reduce((a,t)=>a+t.r,0);
  const per   = Math.abs(loss.reduce((a,t)=>a+t.r,0));

  const wr    = decisivos ? wins.length/decisivos : 0;   // win rate sobre decisivos
  const wrTot = wins.length/n;                            // win rate sobre todo (BE cuenta)
  const avgW  = wins.length ? gan/wins.length : 0;
  const avgL  = loss.length ? per/loss.length : 0;
  const pf    = per>0 ? gan/per : (gan>0?Infinity:0);
  const exp   = rNeto/n;                                  // expectancy en R por trade
  const rrReal= avgL>0 ? avgW/avgL : 0;

  // Estadística de la serie de R
  const rs = list.map(t=>t.r);
  const media = rNeto/n;
  const sorted=[...rs].sort((a,b)=>a-b);
  const mediana = n%2 ? sorted[(n-1)/2] : (sorted[n/2-1]+sorted[n/2])/2;
  const varianza = rs.reduce((a,x)=>a+(x-media)**2,0)/n;
  const desv = Math.sqrt(varianza);
  const sharpe = desv>0 ? media/desv : 0;                 // consistencia (R/desv)
  const mejor = Math.max(...rs);
  const peor  = Math.min(...rs);

  // Drawdown sobre curva de R acumulada
  let acc=0,peak=0,dd=0,curve=[0];
  list.forEach(t=>{ acc+=t.r; curve.push(acc); if(acc>peak)peak=acc; const d=peak-acc; if(d>dd)dd=d; });
  // Recovery factor = beneficio neto / drawdown máximo
  const recovery = dd>0 ? rNeto/dd : (rNeto>0?Infinity:0);

  // Rachas (incluye la actual)
  let maxW=0,maxL=0,cw=0,cl=0,rachaActual=0,tipoRacha="";
  list.forEach(t=>{
    if(t.r>0){ cw++; cl=0; if(cw>maxW)maxW=cw; rachaActual=cw; tipoRacha="W"; }
    else if(t.r<0){ cl++; cw=0; if(cl>maxL)maxL=cl; rachaActual=cl; tipoRacha="L"; }
    else { cw=0; cl=0; rachaActual=0; tipoRacha="BE"; }
  });

  // Break-even win rate necesario para el RR actual
  const wrNec = rrReal>0 ? 1/(1+rrReal) : 0;
  const margen = wr - wrNec;                              // colchón de win rate

  // MAE / MFE
  const conMae=list.filter(t=>t.mae!=null);
  const conMfe=list.filter(t=>t.mfe!=null);
  const maeW = wins.filter(t=>t.mae!=null);
  const maeL = loss.filter(t=>t.mae!=null);
  const avgMaeW = maeW.length ? maeW.reduce((a,t)=>a+Math.abs(t.mae),0)/maeW.length : null;
  const avgMaeL = maeL.length ? maeL.reduce((a,t)=>a+Math.abs(t.mae),0)/maeL.length : null;
  const avgMfeAll = conMfe.length ? conMfe.reduce((a,t)=>a+t.mfe,0)/conMfe.length : null;
  const avgRAll = conMfe.length ? conMfe.reduce((a,t)=>a+t.r,0)/conMfe.length : null;
  // Eficiencia de captura = R real / MFE (cuánto del recorrido a favor te llevaste)
  const capturas = conMfe.filter(t=>t.mfe>0).map(t=>t.r/t.mfe);
  const eficiencia = capturas.length ? capturas.reduce((a,x)=>a+x,0)/capturas.length : null;

  // Disciplina
  const roto = list.filter(t=>t.plan==="No").length;
  const cumplidos = n-roto;
  const adherencia = n ? cumplidos/n : 1;
  const fueraVent = list.filter(t=>t.ventana==="Fuera de ventana").length;
  const setupsC = list.filter(t=>t.setup==="C").length;
  const excesoDia = list.filter(t=>t.fueraLimite).length;
  const emoMal = list.filter(t=>t.emo==="Ansioso"||t.emo==="Con prisa").length;

  // Actividad / tiempo
  const dias = new Set(list.map(t=>t.fecha));
  const nDias = dias.size;
  const tradesPorDia = nDias ? n/nDias : 0;
  const fechas = [...dias].sort();
  const rango = fechas.length ? {desde:fechas[0], hasta:fechas[fechas.length-1]} : null;

  // Payoff esperado en dinero (según balance y riesgo actual)
  const riesgoUSD = BAL.bal*(BAL.pct/100);
  const expUSD = exp*riesgoUSD;
  const netoUSD = rNeto*riesgoUSD;

  return { n,wins:wins.length,loss:loss.length,be:bes.length,decisivos,
           rNeto,gan,per,wr,wrTot,avgW,avgL,pf,exp,rrReal,wrNec,margen,
           media,mediana,desv,sharpe,mejor,peor,dd,recovery,curve,
           maxW,maxL,rachaActual,tipoRacha,
           avgMaeW,avgMaeL,avgMfeAll,avgRAll,eficiencia,conMae:conMae.length,conMfe:conMfe.length,
           roto,cumplidos,adherencia,fueraVent,setupsC,excesoDia,emoMal,
           nDias,tradesPorDia,rango,riesgoUSD,expUSD,netoUSD };
}

/* ---- Corte por una dimensión ---- */
function cortePor(list,fn){
  const g={};
  list.forEach(t=>{ const k=fn(t); if(k==null||k==="") return; (g[k]=g[k]||[]).push(t); });
  return Object.keys(g).map(k=>{
    const m=metricas(g[k]);
    return { k, n:m.n, wr:m.wr, exp:m.exp, rNeto:m.rNeto, pf:m.pf, avgW:m.avgW, avgL:m.avgL, dd:m.dd };
  }).sort((a,b)=>b.exp-a.exp);
}

function fmtPF(pf){ return pf===Infinity ? "∞" : r2(pf); }
function clsNum(x){ return x>0?"pos":x<0?"neg":""; }

function renderAnalisis(){
  const sp=$("#sgPeriodo");
  if(sp && !sp.dataset.init){
    sp.dataset.init="1"; sp.innerHTML="";
    [{t:"Semana",v:"semana"},{t:"Mes",v:"mes"},{t:"30 días",v:"30"},{t:"Todo",v:"todo"}].forEach(o=>{
      const b=el("button",PERIODO===o.v?"on":"",o.t);
      b.onclick=()=>{ PERIODO=o.v; sp.querySelectorAll("button").forEach(x=>x.className=""); b.className="on"; renderAnalisis(); };
      sp.appendChild(b);
    });
  }
  const body=$("#analisisBody"); if(!body) return;
  body.innerHTML="";
  const list=tradesPeriodo();
  const m=metricas(list);

  if(!m){
    body.appendChild(el("div","card",
      `<div class="empty"><div class="t">Sin datos todavía</div>
       <div class="s">Registra trades en el Diario y aquí aparecerá el diagnóstico completo de tu estrategia.</div></div>`));
    return;
  }

  /* ---------- 0. 🏆 RACHA DE DISCIPLINA + informe de Roberto ---------- */
  try{
    const rr=rachaDisciplina();
    const rc=el("div","card");
    rc.innerHTML=`<div style="display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:26px">🏆</span>
        <div><b style="font-size:16px">${rr.dias>0?("Racha de disciplina: "+rr.dias+" día"+(rr.dias!==1?"s":"")):"Racha de disciplina"}</b><br>
        <span style="color:var(--txt2);font-size:12.5px">${rr.dias>0?"Días operados seguidos sin romper reglas. ¡No la cortes!":(rr.motivo?("Se cortó ("+esc(rr.motivo)+"). Arranca una nueva hoy 💪"):"Opera con disciplina y aquí verás tu racha crecer.")}</span></div>
      </div>
      <button class="btn gold" id="btnProgresoIA" style="margin:0;width:auto;padding:9px 14px">🤖 Roberto: mi progreso</button></div>`;
    body.appendChild(rc);
    const bp=rc.querySelector("#btnProgresoIA"); if(bp) bp.onclick=progresoRoberto;
  }catch(_){}

  /* ---------- 1. VEREDICTO ---------- */
  const diag=el("div","card");
  diag.innerHTML=`<div class="card-h"><span class="ic">🧠</span><h2>Veredicto</h2></div>`;
  diagnosticos(m,list).forEach(d=>{
    diag.appendChild(el("div","diag "+d.tipo,`<div class="dt">${d.t}</div><div class="dd">${d.d}</div>`));
  });
  body.appendChild(diag);

  /* ---------- 1b. FORTALEZAS Y DEBILIDADES ---------- */
  const fd=cardFortDeb(list); if(fd) body.appendChild(fd);

  /* ---------- 2. NÚCLEO ---------- */
  const badge = m.rango ? `${fechaCorta(m.rango.desde)} → ${fechaCorta(m.rango.hasta)} · ${m.nDias} día${m.nDias!==1?"s":""}` : "";
  const core=el("div","card");
  core.innerHTML=`<div class="card-h"><span class="ic">📊</span><h2>Métricas núcleo</h2>
    <span class="cnt">${m.n} trade${m.n!==1?"s":""}</span></div>
   ${badge?`<div class="ctxpill" style="margin:0 0 12px"><span>${badge}</span><span>${r1(m.tradesPorDia)}/día</span></div>`:""}
   <div class="stats">
     <div class="st"><div class="v ${m.rNeto>=0?'g':'r'}">${m.rNeto>0?"+":""}${r1(m.rNeto)}R</div><div class="k">R neto</div></div>
     <div class="st"><div class="v">${pct(m.wr*100)}</div><div class="k">Win rate</div></div>
     <div class="st"><div class="v ${m.pf>=1.5?'g':m.pf>=1?'':'r'}">${fmtPF(m.pf)}</div><div class="k">Profit factor</div></div>
     <div class="st"><div class="v ${m.exp>0?'g':'r'}">${m.exp>0?"+":""}${r2(m.exp)}R</div><div class="k">Expectancy</div></div>
     <div class="st"><div class="v n">1:${r1(m.rrReal)}</div><div class="k">RR real</div></div>
     <div class="st"><div class="v r">−${r1(m.dd)}R</div><div class="k">Max drawdown</div></div>
     <div class="st"><div class="v b">${m.wins}−${m.loss}${m.be?"−"+m.be:""}</div><div class="k">W−L${m.be?"−BE":""}</div></div>
     <div class="st"><div class="v n">${pct(m.wrNec*100)}</div><div class="k">WR necesario</div></div>
     <div class="st"><div class="v ${m.margen>=0?'g':'r'}">${m.margen>0?"+":""}${pct(m.margen*100)}</div><div class="k">Margen (edge)</div></div>
   </div>
   <div class="note" style="text-align:left;margin-top:12px">
     <b>Expectancy</b>: lo que ganas de media por trade, en R — la cifra que decide si hay ventaja.
     <b>Margen</b>: tu win rate menos el que tu RR exige para empatar. Positivo = tienes edge real.
   </div>`;
  body.appendChild(core);

  /* ---------- 2b. RENDIMIENTO EN DINERO Y GANANCIA/PÉRDIDA ---------- */
  const rend=el("div","card");
  rend.innerHTML=`<div class="card-h"><span class="ic">💵</span><h2>Rendimiento</h2></div>
   <div class="stats">
     <div class="st"><div class="v g">+${r2(m.avgW)}R</div><div class="k">Ganancia media</div></div>
     <div class="st"><div class="v r">−${r2(m.avgL)}R</div><div class="k">Pérdida media</div></div>
     <div class="st"><div class="v g">+${r1(m.gan)}R</div><div class="k">Ganancia bruta</div></div>
     <div class="st"><div class="v r">−${r1(m.per)}R</div><div class="k">Pérdida bruta</div></div>
     <div class="st"><div class="v g">+${r1(m.mejor)}R</div><div class="k">Mejor trade</div></div>
     <div class="st"><div class="v r">${r1(m.peor)}R</div><div class="k">Peor trade</div></div>
     <div class="st"><div class="v ${m.recovery>=2?'g':''}">${m.recovery===Infinity?"∞":r2(m.recovery)}</div><div class="k">Recovery factor</div></div>
     <div class="st"><div class="v ${m.netoUSD>=0?'g':'r'}">${m.netoUSD>=0?"+":""}$${r2(m.netoUSD)}</div><div class="k">Neto estimado</div></div>
     <div class="st"><div class="v ${m.expUSD>=0?'g':'r'}">${m.expUSD>=0?"+":""}$${r2(m.expUSD)}</div><div class="k">Por trade ($)</div></div>
   </div>
   <div class="note" style="text-align:left;margin-top:12px">
     <b>Recovery factor</b>: cuántas veces tu drawdown máximo cabe en tu ganancia neta. Cuanto más alto, más te recuperas de los baches.
     Neto y por-trade en dólares usan tu balance ($${r1(BAL.bal)}) y riesgo (${BAL.pct}%) de la calculadora.
   </div>`;
  body.appendChild(rend);

  /* ---------- 2c. CONSISTENCIA / VOLATILIDAD ---------- */
  const cons=el("div","card");
  const rachaTxt = m.tipoRacha==="W"?m.rachaActual+" ganadas seguidas":m.tipoRacha==="L"?m.rachaActual+" perdidas seguidas":"—";
  cons.innerHTML=`<div class="card-h"><span class="ic">🎯</span><h2>Consistencia</h2></div>
   <div class="stats">
     <div class="st"><div class="v n">${r2(m.mediana)}R</div><div class="k">Mediana R</div></div>
     <div class="st"><div class="v n">${r2(m.desv)}R</div><div class="k">Desviación</div></div>
     <div class="st"><div class="v ${m.sharpe>=0.3?'g':m.sharpe>=0?'':'r'}">${r2(m.sharpe)}</div><div class="k">Ratio consistencia</div></div>
     <div class="st"><div class="v g">${m.maxW}</div><div class="k">Mejor racha W</div></div>
     <div class="st"><div class="v r">${m.maxL}</div><div class="k">Peor racha L</div></div>
     <div class="st"><div class="v ${m.tipoRacha==='W'?'g':m.tipoRacha==='L'?'r':'n'}" style="font-size:16px">${m.tipoRacha==='W'?'+'+m.rachaActual+'W':m.tipoRacha==='L'?m.rachaActual+'L':'—'}</div><div class="k">Racha actual</div></div>
   </div>
   <div class="note" style="text-align:left;margin-top:12px">
     <b>Ratio de consistencia</b> (media ÷ desviación): mide si tus resultados son parejos o dan bandazos. Por encima de 0.3 es sólido; negativo significa que la volatilidad se come tu ventaja. Racha actual: ${rachaTxt}.
   </div>`;
  body.appendChild(cons);

  /* ---------- 2d. DISTRIBUCIÓN DE RESULTADOS ---------- */
  const dist=el("div","card");
  const buckets=[
    {lbl:"≤ −1R", test:r=>r<=-1, c:"var(--red)"},
    {lbl:"−1 a 0", test:r=>r>-1&&r<0, c:"var(--red-dim)"},
    {lbl:"BE (0)", test:r=>r===0, c:"var(--txt3)"},
    {lbl:"0 a 1R", test:r=>r>0&&r<1, c:"var(--green-dim)"},
    {lbl:"1 a 2R", test:r=>r>=1&&r<2, c:"var(--green)"},
    {lbl:"2 a 3R", test:r=>r>=2&&r<3, c:"var(--green)"},
    {lbl:"≥ 3R", test:r=>r>=3, c:"var(--gold)"}
  ];
  const maxB=Math.max(...buckets.map(b=>list.filter(t=>b.test(t.r)).length),1);
  dist.innerHTML=`<div class="card-h"><span class="ic">📊</span><h2>Distribución de resultados</h2></div>
    <p class="desc">Cómo se reparten tus ${m.n} trades por tamaño de R. Una estrategia sana tiene pérdidas contenidas y algunos ganadores grandes que tiran del conjunto.</p>`;
  buckets.forEach(b=>{
    const c=list.filter(t=>b.test(t.r)).length;
    const w=Math.round(c/maxB*100);
    dist.appendChild(el("div","distrow",
      `<span class="distlbl">${b.lbl}</span>
       <span class="distbar"><i style="width:${w}%;background:${b.c}"></i></span>
       <span class="distnum">${c}</span>`));
  });
  body.appendChild(dist);

  /* ---------- 3. CURVA ---------- */
  const cv=el("div","card");
  cv.innerHTML=`<div class="card-h"><span class="ic">📉</span><h2>Curva de capital (R acumulada)</h2></div>`;
  cv.appendChild(curvaSVG(m.curve));
  cv.appendChild(el("div","legend",
    `<span><i style="background:var(--gold)"></i>R acumulada: ${m.rNeto>0?"+":""}${r1(m.rNeto)}R</span>
     <span><i style="background:var(--red)"></i>Drawdown máx: −${r1(m.dd)}R</span>
     <span><i style="background:var(--txt3)"></i>Racha: ${m.maxW}W / ${m.maxL}L</span>`));
  body.appendChild(cv);

  /* ---------- 4. CORTES ---------- */
  const NOMC={c1:"Sweep",c2:"MSS",c3:"Displacement",c4:"Reacción en zona",c5:"Volumen/Momentum"};
  const cortes=[
    { t:"Por setup",       ic:"🏅", d:cortePor(list,t=>t.setup) },
    { t:"Por nº de confluencias", ic:"✅", d:cortePor(list,t=>t.nconf?t.nconf+"/5":null) },
    { t:"Por ventana horaria", ic:"⏰", d:cortePor(list,t=>t.ventana) },
    { t:"Por día de la semana", ic:"📅", d:cortePor(list,t=>t.dia) },
    { t:"Por zona de valor", ic:"📍", d:cortePor(list,t=>t.zona) },
    { t:"Por POI de entrada", ic:"🎯", d:cortePor(list,t=>t.poi) },
    { t:"Por momento de entrada", ic:"⏱️", d:cortePor(list,t=>t.momento) },
    { t:"Por disparador", ic:"⚡", d:cortePor(list,t=>t.disp) },
    { t:"Por TF de gatillo", ic:"🔬", d:cortePor(list,t=>t.gtf) },
    { t:"Respecto al bias semanal", ic:"🧭", d:cortePor(list,t=>t.bias) },
    { t:"Por noticias", ic:"📰", d:cortePor(list,t=>t.news) },
    { t:"Por par",         ic:"💱", d:cortePor(list,t=>t.par) },
    { t:"Por dirección",   ic:"↕️", d:cortePor(list,t=>t.dir) },
    { t:"Por estado emocional", ic:"🧘", d:cortePor(list,t=>t.emo) },
    { t:"¿Seguiste el plan?", ic:"⚖️", d:cortePor(list,t=>t.plan==="Si"?"Sí, plan 100%":"No, rompí reglas") }
  ];
  cortes.forEach(c=>{
    if(!c.d.length) return;
    const card=el("div","card");
    let h=`<div class="card-h"><span class="ic">${c.ic}</span><h2>${c.t}</h2></div>
      <div class="tw"><table class="tbl">
      <tr><th>${c.t.replace("Por ","").replace("¿","").replace("?","")}</th><th class="num">N</th><th class="num">WR</th><th class="num">Exp.</th><th class="num">R neto</th></tr>`;
    c.d.forEach(x=>{
      const poco=x.n<5;
      h+=`<tr class="${x.exp<0&&x.n>=5?'warnrow':''}">
        <td>${esc(x.k)}${poco?' <span style="color:var(--txt3);font-weight:400;font-size:11px">(pocos)</span>':''}</td>
        <td class="num">${x.n}</td>
        <td class="num">${pct(x.wr*100)}</td>
        <td class="num ${clsNum(x.exp)}">${x.exp>0?"+":""}${r2(x.exp)}R</td>
        <td class="num ${clsNum(x.rNeto)}">${x.rNeto>0?"+":""}${r1(x.rNeto)}R</td></tr>`;
    });
    h+=`</table></div>`;
    card.innerHTML=h;
    body.appendChild(card);
  });

  /* ---------- 5. CONFLUENCIAS INDIVIDUALES ---------- */
  const conConf=list.filter(t=>t.confs&&t.confs.length);
  if(conConf.length>=3){
    const card=el("div","card");
    let h=`<div class="card-h"><span class="ic">🔬</span><h2>Peso de cada confluencia</h2></div>
      <p class="desc">Compara los trades que tuvieron cada confluencia contra los que no. Si la diferencia es negativa, esa confluencia no te está aportando.</p>
      <div class="tw"><table class="tbl">
      <tr><th>Confluencia</th><th class="num">Con</th><th class="num">Exp. con</th><th class="num">Exp. sin</th><th class="num">Δ</th></tr>`;
    CONFLUENCIAS.forEach(cf=>{
      const con=conConf.filter(t=>t.confs.includes(cf.id));
      const sin=conConf.filter(t=>!t.confs.includes(cf.id));
      if(!con.length) return;
      const mc=metricas(con), ms=sin.length?metricas(sin):null;
      const delta= ms ? mc.exp-ms.exp : null;
      h+=`<tr><td>${NOMC[cf.id]}</td><td class="num">${con.length}</td>
        <td class="num ${clsNum(mc.exp)}">${mc.exp>0?"+":""}${r2(mc.exp)}R</td>
        <td class="num">${ms?(ms.exp>0?"+":"")+r2(ms.exp)+"R":"—"}</td>
        <td class="num ${delta!=null?clsNum(delta):""}">${delta!=null?(delta>0?"+":"")+r2(delta):"—"}</td></tr>`;
    });
    h+=`</table></div>`;
    card.innerHTML=h;
    body.appendChild(card);
  }

  /* ---------- 6. MAE / MFE ---------- */
  if(m.conMae>=3 || m.conMfe>=3){
    const card=el("div","card");
    let h=`<div class="card-h"><span class="ic">📏</span><h2>MAE / MFE — calidad de SL y TP</h2></div>`;
    if(m.avgMaeW!=null){
      h+=`<div class="row"><div class="l">MAE medio en ganadores<small>Cuánto fue en contra antes de girar</small></div>
        <div class="r">${r2(m.avgMaeW)}R</div></div>`;
      if(m.avgMaeW<0.35) h+=`<div class="diag info"><div class="dt">Tu SL tiene margen de sobra</div>
        <div class="dd">Tus ganadores casi no van en contra (${r2(m.avgMaeW)}R de media). Podrías acercar el SL y subir el RR — siempre que la estructura lo permita, nunca solo por comodidad.</div></div>`;
    }
    if(m.avgMfeAll!=null && m.avgRAll!=null){
      const dejado=m.avgMfeAll-m.avgRAll;
      h+=`<div class="row"><div class="l">MFE medio<small>Lo máximo que llegó a ir a favor</small></div><div class="r">${r2(m.avgMfeAll)}R</div></div>
        <div class="row"><div class="l">R medio capturado<small>Lo que realmente cerraste</small></div><div class="r">${r2(m.avgRAll)}R</div></div>
        <div class="row ${dejado>0.5?"bad":"ok"}"><div class="l">Dejado en la mesa</div>
        <div class="r ${dejado>0.5?"red":""}">${r2(dejado)}R</div></div>`;
      if(dejado>0.6) h+=`<div class="diag warn"><div class="dt">Estás saliendo temprano</div>
        <div class="dd">De media dejas ${r2(dejado)}R sobre la mesa por trade. Revisa si tus parciales de la sección 2.4 se están aplicando o si cierras antes por ansiedad.</div></div>`;
    }
    card.innerHTML=h;
    body.appendChild(card);
  }

  /* ---------- 7. COMPORTAMIENTO DEL OPERADOR ---------- */
  const dis=el("div","card"+(m.roto||m.fueraVent||m.setupsC||m.excesoDia?" alert":""));
  // impacto de romper el plan
  const cumpl = list.filter(t=>t.plan==="Si");
  const rotos = list.filter(t=>t.plan==="No");
  const mCumpl = cumpl.length?metricas(cumpl):null;
  const mRotos = rotos.length?metricas(rotos):null;
  // impacto de operar emocionado
  const tranq = list.filter(t=>t.emo==="Tranquilo");
  const alter = list.filter(t=>t.emo==="Ansioso"||t.emo==="Con prisa");
  const mTranq=tranq.length?metricas(tranq):null;
  const mAlter=alter.length?metricas(alter):null;

  let h=`<div class="card-h"><span class="ic">🎖️</span><h2 class="${m.roto?'red':''}">Comportamiento del operador</h2></div>
    <div class="stats">
      <div class="st"><div class="v ${m.adherencia===1?'g':m.adherencia>=.9?'':'r'}">${pct(m.adherencia*100)}</div><div class="k">Adherencia</div></div>
      <div class="st"><div class="v ${m.roto?'r':'g'}">${m.roto}</div><div class="k">Plan roto</div></div>
      <div class="st"><div class="v ${m.emoMal?'r':'g'}">${m.emoMal}</div><div class="k">Emocionado</div></div>
      <div class="st"><div class="v ${m.fueraVent?'r':'g'}">${m.fueraVent}</div><div class="k">Fuera ventana</div></div>
      <div class="st"><div class="v ${m.setupsC?'r':'g'}">${m.setupsC}</div><div class="k">Setups C</div></div>
      <div class="st"><div class="v ${m.excesoDia?'r':'g'}">${m.excesoDia}</div><div class="k">Exceso R6</div></div>
    </div>`;
  if(mCumpl&&mRotos){
    h+=`<div class="tw" style="margin-top:14px"><table class="tbl">
      <tr><th>Plan</th><th class="num">N</th><th class="num">WR</th><th class="num">Exp.</th><th class="num">R neto</th></tr>
      <tr><td style="color:var(--green)">Cumplido 100%</td><td class="num">${mCumpl.n}</td><td class="num">${pct(mCumpl.wr*100)}</td><td class="num ${clsNum(mCumpl.exp)}">${mCumpl.exp>0?"+":""}${r2(mCumpl.exp)}R</td><td class="num ${clsNum(mCumpl.rNeto)}">${mCumpl.rNeto>0?"+":""}${r1(mCumpl.rNeto)}R</td></tr>
      <tr class="${mRotos.exp<mCumpl.exp?'warnrow':''}"><td style="color:var(--red)">Roto</td><td class="num">${mRotos.n}</td><td class="num">${pct(mRotos.wr*100)}</td><td class="num ${clsNum(mRotos.exp)}">${mRotos.exp>0?"+":""}${r2(mRotos.exp)}R</td><td class="num ${clsNum(mRotos.rNeto)}">${mRotos.rNeto>0?"+":""}${r1(mRotos.rNeto)}R</td></tr>
      </table></div>`;
  }
  if(mTranq&&mAlter){
    h+=`<div class="tw" style="margin-top:10px"><table class="tbl">
      <tr><th>Estado</th><th class="num">N</th><th class="num">WR</th><th class="num">Exp.</th><th class="num">R neto</th></tr>
      <tr><td style="color:var(--green)">Tranquilo</td><td class="num">${mTranq.n}</td><td class="num">${pct(mTranq.wr*100)}</td><td class="num ${clsNum(mTranq.exp)}">${mTranq.exp>0?"+":""}${r2(mTranq.exp)}R</td><td class="num ${clsNum(mTranq.rNeto)}">${mTranq.rNeto>0?"+":""}${r1(mTranq.rNeto)}R</td></tr>
      <tr class="${mAlter.exp<mTranq.exp?'warnrow':''}"><td style="color:var(--orange)">Ansioso/prisa</td><td class="num">${mAlter.n}</td><td class="num">${pct(mAlter.wr*100)}</td><td class="num ${clsNum(mAlter.exp)}">${mAlter.exp>0?"+":""}${r2(mAlter.exp)}R</td><td class="num ${clsNum(mAlter.rNeto)}">${mAlter.rNeto>0?"+":""}${r1(mAlter.rNeto)}R</td></tr>
      </table></div>`;
  }
  h+=`<div class="note" style="text-align:left;margin-top:12px">Estas dos tablas comparan tu rendimiento según si respetaste el plan y según tu estado emocional. Si la fila roja rinde peor, tu problema no es la estrategia — es la ejecución.</div>`;
  dis.innerHTML=h;
  body.appendChild(dis);

  /* ---------- 8. SEMANAS Y MESES ---------- */
  const sem=cortePor(list,t=>lunesDe(t.fecha));
  if(sem.length>1){
    const card=el("div","card");
    let hh=`<div class="card-h"><span class="ic">🗓️</span><h2>Por semana</h2></div>
      <div class="tw"><table class="tbl"><tr><th>Semana del</th><th class="num">N</th><th class="num">WR</th><th class="num">Exp.</th><th class="num">R neto</th></tr>`;
    sem.sort((a,b)=>b.k.localeCompare(a.k)).forEach(x=>{
      hh+=`<tr><td>${fechaCorta(x.k)}</td><td class="num">${x.n}</td><td class="num">${pct(x.wr*100)}</td>
        <td class="num ${clsNum(x.exp)}">${x.exp>0?"+":""}${r2(x.exp)}R</td>
        <td class="num ${clsNum(x.rNeto)}">${x.rNeto>0?"+":""}${r1(x.rNeto)}R</td></tr>`;
    });
    hh+=`</table></div>`;
    card.innerHTML=hh;
    body.appendChild(card);
  }
  const MESN=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const mes=cortePor(list,t=>t.fecha.slice(0,7));
  if(mes.length>1){
    const card=el("div","card");
    let hh=`<div class="card-h"><span class="ic">📆</span><h2>Por mes</h2></div>
      <div class="tw"><table class="tbl"><tr><th>Mes</th><th class="num">N</th><th class="num">WR</th><th class="num">Exp.</th><th class="num">R neto</th></tr>`;
    mes.sort((a,b)=>b.k.localeCompare(a.k)).forEach(x=>{
      const [y,mm]=x.k.split("-");
      hh+=`<tr><td>${MESN[+mm-1]} ${y}</td><td class="num">${x.n}</td><td class="num">${pct(x.wr*100)}</td>
        <td class="num ${clsNum(x.exp)}">${x.exp>0?"+":""}${r2(x.exp)}R</td>
        <td class="num ${clsNum(x.rNeto)}">${x.rNeto>0?"+":""}${r1(x.rNeto)}R</td></tr>`;
    });
    hh+=`</table></div>`;
    card.innerHTML=hh;
    body.appendChild(card);
  }

  /* pie de contexto */
  body.appendChild(el("div","note",
    `Análisis de ${CTX.modo==="real"?"operaciones reales":"backtesting"} · ${esc(CTX.estrategia)} · ${m.n} trades. Cambia el contexto arriba para comparar Real vs Backtest o entre estrategias.`));
}

/* ---- Motor de diagnósticos en lenguaje claro ---- */
function diagnosticos(m,list){
  const out=[];
  if(m.n<20){
    out.push({tipo:"info",t:`Muestra pequeña: ${m.n} trade${m.n!==1?"s":""}`,
      d:`Con menos de 20 trades cualquier conclusión es ruido. Sigue registrando: a partir de 50 los números empiezan a significar algo real.`});
  }
  if(m.exp>0.15){
    out.push({tipo:"ok",t:`La estrategia tiene ventaja: +${r2(m.exp)}R por trade`,
      d:`De media ganas ${r2(m.exp)}R cada vez que operas. Con riesgo 0.5% eso son unos $${r2(m.exp*BAL.bal*0.005)} por trade sobre ${BAL.bal}. Mantén el proceso: lo que funciona es no tocarlo.`});
  }else if(m.exp>0){
    out.push({tipo:"warn",t:`Ventaja apenas positiva: +${r2(m.exp)}R por trade`,
      d:`Estás en verde pero el margen es fino. Mira abajo qué corte tiene expectancy negativa — normalmente eliminando una sola categoría el número sube bastante.`});
  }else{
    out.push({tipo:"bad",t:`Expectancy negativa: ${r2(m.exp)}R por trade`,
      d:`En este periodo la estrategia pierde dinero de media. Antes de cambiar nada técnico, revisa la tarjeta de Disciplina: si hay trades con plan roto, el problema no es la estrategia.`});
  }
  if(m.decisivos>=10){
    if(m.wr>=m.wrNec+0.08) out.push({tipo:"ok",t:`Win rate cómodo para tu RR`,
      d:`Tu RR real es 1:${r1(m.rrReal)}, que solo exige ${pct(m.wrNec*100)} de acierto para empatar. Estás en ${pct(m.wr*100)}. Ese colchón es tu ventaja.`});
    else if(m.wr<m.wrNec) out.push({tipo:"bad",t:`Win rate por debajo del mínimo`,
      d:`Con RR 1:${r1(m.rrReal)} necesitas acertar el ${pct(m.wrNec*100)} para no perder, y vas por ${pct(m.wr*100)}. O subes el RR (dejando correr más) o eres más selectivo con las entradas.`});
  }
  if(m.pf>0 && m.pf<1.5 && m.decisivos>=10){
    out.push({tipo:"warn",t:`Profit factor ${fmtPF(m.pf)} — por debajo de tu meta de 1.5`,
      d:`Ganas $${r2(m.gan)}R contra $${r2(m.per)}R perdidos. Tu propio plan (sección 1) marca 1.5 como referencia sana.`});
  }
  if(m.roto>0){
    const rotos=list.filter(t=>t.plan==="No");
    const mr=metricas(rotos), lim=list.filter(t=>t.plan==="Si");
    const ml=lim.length?metricas(lim):null;
    const dif= ml ? ml.exp-mr.exp : null;
    out.push({tipo:"bad",t:`${m.roto} trade${m.roto!==1?"s":""} con el plan roto`,
      d: dif!=null
        ? `Siguiendo el plan tu expectancy es ${ml.exp>0?"+":""}${r2(ml.exp)}R; rompiéndolo, ${r2(mr.exp)}R. La diferencia es ${r2(Math.abs(dif))}R por trade. Ahí está tu dinero, no en el gráfico.`
        : `Un trade ganador con regla rota sigue siendo un mal trade: refuerza el hábito que vacía la cuenta.`});
  }
  if(m.maxL>=3){
    out.push({tipo:"warn",t:`Racha perdedora máxima: ${m.maxL} seguidos`,
      d:`Es normal estadísticamente, pero prepárate mentalmente: con tu win rate volverá a pasar. Tus reglas R7 y R8 existen justo para que una racha no se coma la cuenta.`});
  }
  if(m.dd>=6){
    out.push({tipo:"warn",t:`Drawdown máximo de ${r1(m.dd)}R`,
      d:`Con riesgo 0.5% eso equivale a ${r1(m.dd*0.5)}% de la cuenta. Tu límite semanal es −3% / −5%: mantente atento a cuándo se disparan.`});
  }
  // El peor corte
  const cortes=[["setup",t=>t.setup],["ventana",t=>t.ventana],["día",t=>t.dia],["zona",t=>t.zona],["emoción",t=>t.emo]];
  let peor=null;
  cortes.forEach(([nom,fn])=>{
    cortePor(list,fn).forEach(x=>{ if(x.n>=5 && x.exp<0 && (!peor||x.exp<peor.exp)) peor={...x,nom}; });
  });
  if(peor){
    const fn=cortes.find(c=>c[0]===peor.nom)[1];
    const resto=list.filter(t=>fn(t)!==peor.k);
    const mr=resto.length ? metricas(resto) : null;
    out.push({tipo:"bad",t:`Tu mayor fuga: ${peor.nom} "${peor.k}"`,
      d:`${peor.n} trades con expectancy de ${r2(peor.exp)}R y ${r1(peor.rNeto)}R netos.`+
        (mr ? ` Si eliminaras esa categoría, tu expectancy global subiría a ${r2(mr.exp)}R.`
            : ` Es la única categoría que tienes registrada aquí, así que no hay con qué compararla todavía.`)});
  }
  return out;
}

/* ============================================================
   MENTOR — criterio por trade + fortalezas/debilidades (v3.1)
   ============================================================ */

/* Dimensiones que el mentor escanea para fortalezas/debilidades */
const DIMS_MENTOR=[
  ["Setup",t=>t.setup],["Ventana",t=>t.ventana],["Día",t=>t.dia],["Zona",t=>t.zona],
  ["POI",t=>t.poi],["Momento",t=>t.momento],["Disparador",t=>t.disp],["TF gatillo",t=>t.gtf],
  ["Bias",t=>t.bias],["Noticias",t=>t.news],["Emoción",t=>t.emo],["Dirección",t=>t.dir],["Par",t=>t.par]
];

/* Tarjeta Fortalezas y Debilidades: rankea categorías por expectancy */
function cardFortDeb(list){
  const rows=[];
  DIMS_MENTOR.forEach(([dim,fn])=>{
    cortePor(list,fn).forEach(x=>{ if(x.n>=3) rows.push({dim,k:x.k,n:x.n,exp:x.exp,rNeto:x.rNeto}); });
  });
  if(rows.length<2) return null;
  rows.sort((a,b)=>b.exp-a.exp);
  const fort=rows.filter(r=>r.exp>0).slice(0,4);
  const deb =rows.filter(r=>r.exp<0).slice(-4).reverse();
  if(!fort.length && !deb.length) return null;
  const maxAbs=Math.max(...rows.map(r=>Math.abs(r.exp)),0.01);
  const barra=(r,pos)=>{
    const w=Math.round(Math.abs(r.exp)/maxAbs*100);
    const col=pos?"var(--green)":"var(--red)";
    return `<div class="distrow">
      <span class="distlbl" style="width:auto;min-width:116px;text-align:left">${esc(r.dim)}: <b style="color:var(--txt)">${esc(r.k)}</b></span>
      <span class="distbar"><i style="width:${w}%;background:${col}"></i></span>
      <span class="distnum" style="width:auto;color:${col}">${r.exp>0?"+":""}${r2(r.exp)}R</span></div>
      <div class="note" style="text-align:left;margin:-4px 0 9px;padding-left:2px">${r.n} trades · ${r.rNeto>0?"+":""}${r1(r.rNeto)}R netos</div>`;
  };
  const card=el("div","card");
  let h=`<div class="card-h"><span class="ic">🧭</span><h2>Fortalezas y debilidades</h2></div>
    <p class="desc">Tus categorías con mejor y peor expectancy (mín. 3 trades cada una). Aquí ves en qué eres fuerte y dónde se te va el dinero.</p>`;
  if(fort.length) h+=`<div class="fl" style="color:var(--green);margin:12px 0 8px">💪 Fortalezas</div>`+fort.map(r=>barra(r,true)).join("");
  if(deb.length)  h+=`<div class="fl" style="color:var(--red);margin:14px 0 8px">🩸 Debilidades</div>`+deb.map(r=>barra(r,false)).join("");
  card.innerHTML=h;
  return card;
}

/* Criterio de UN trade: aciertos y fallos de ejecución */
function criterioTrade(t){
  const ok=[], bad=[];
  if(t.setup==="A+"||t.setup==="B") ok.push("Setup "+t.setup+": calidad suficiente para operar");
  else if(t.setup==="C") bad.push("Setup C: tu plan solo permite A+ y B en real");
  if(t.plan==="Si") ok.push("Seguiste el plan al 100%"); else bad.push("Rompiste el plan (regla rota)");
  if(t.emo==="Tranquilo") ok.push("Entraste en calma");
  else if(t.emo) bad.push("Estado "+String(t.emo).toLowerCase()+": la prisa/ansiedad degrada la ejecución");
  if(t.momento==="En confirmación") ok.push("Esperaste la confirmación, no el toque");
  else if(t.momento) bad.push("Entraste "+String(t.momento).toLowerCase()+": el timing prematuro es tu mayor fuga");
  if(t.bias==="A favor") ok.push("A favor del bias semanal");
  else if(t.bias==="En contra") bad.push("En contra del bias semanal");
  if(t.ventana && t.ventana!=="Fuera de ventana") ok.push("Dentro de ventana ("+t.ventana+")");
  else if(t.ventana==="Fuera de ventana") bad.push("Fuera de ventana horaria");
  if(t.news==="Noticia cerca") bad.push("Operaste con noticia cerca");
  if(t.fueraLimite) bad.push("Excede el límite de 2 trades/día (R6)");
  if(t.mfe!=null && t.r!=null && (t.mfe-t.r)>0.8) bad.push("Dejaste "+r1(t.mfe-t.r)+"R sobre la mesa (saliste temprano)");
  if(t.rrPlan!=null && t.res==="Win" && t.r>0 && t.r < t.rrPlan*0.6) bad.push("Cerraste muy por debajo de tu RR planificado (1:"+r1(t.rrPlan)+")");
  return {ok,bad};
}

/* Insight con datos: compara un atributo del trade con el historial */
function insightDim(t,fn,attr){
  if(attr==null) return null;
  const list=tradesCtx().filter(x=>fn(x)!=null && fn(x)!=="");
  if(list.length<6) return null;
  const g={}; list.forEach(x=>{ const k=fn(x); (g[k]=g[k]||[]).push(x); });
  const rows=Object.keys(g).map(k=>({k,m:metricas(g[k])})).filter(r=>r.m&&r.m.n>=3);
  if(rows.length<2) return null;
  rows.sort((a,b)=>b.m.exp-a.m.exp);
  const best=rows[0], worst=rows[rows.length-1];
  if(best.k===worst.k) return null;
  let extra="";
  if(attr===best.k) extra=" Este trade lo hiciste en tu mejor forma — sigue así.";
  else if(attr===worst.k) extra=" Este trade lo hiciste en tu peor forma: ahí se te va el dinero.";
  return `"${best.k}" te rinde ${best.m.exp>0?"+":""}${r2(best.m.exp)}R por trade y "${worst.k}" ${r2(worst.m.exp)}R.`+extra;
}

/* Modal de criterio que aparece al guardar cada trade */
function mostrarCriterio(t){
  const {ok,bad}=criterioTrade(t);
  const score=ok.length-bad.length;
  const tit = bad.length===0 ? "✅ Ejecución impecable"
            : score>=1 ? "👍 Ejecución sólida, con detalles"
            : bad.length>=3 ? "⛔ Ejecución con fugas graves"
            : "⚠️ Ejecución mejorable";
  const list=tradesCtx();
  const m=list.length?metricas(list):null;

  const insMom=insightDim(t,x=>x.momento,t.momento);
  const insVen=insMom?null:insightDim(t,x=>x.ventana,t.ventana);
  const ins = insMom || insVen;

  let cuerpo=`<div class="dt-head">
      <div style="font-weight:800;font-size:19px;max-width:66%">${tit}</div>
      <div class="trade-r ${t.r>0?'pos':t.r<0?'neg':''}" style="font-size:22px">${t.r>0?"+":""}${r1(t.r)}R</div></div>
    <div class="dt-badge">${esc(t.par)} · ${esc(t.dir)} · ${esc(t.setup)} · ${t.modo==="real"?"💵 Real":"🧪 Backtest"}</div>`;
  if(ok.length) cuerpo+=`<div class="fl" style="color:var(--green);margin-top:6px">Fortalezas de esta entrada</div>`+
    ok.map(x=>`<div class="diag ok" style="padding:11px 13px;margin-bottom:7px"><div class="dd" style="color:var(--green)">✓ ${esc(x)}</div></div>`).join("");
  if(bad.length) cuerpo+=`<div class="fl" style="color:var(--red);margin-top:10px">Debilidades a corregir</div>`+
    bad.map(x=>`<div class="diag bad" style="padding:11px 13px;margin-bottom:7px"><div class="dd" style="color:var(--red)">✗ ${esc(x)}</div></div>`).join("");
  if(ins) cuerpo+=`<div class="diag info" style="margin-top:10px"><div class="dt">Lo que dicen tus datos</div><div class="dd">${esc(ins)}</div></div>`;
  if(m && m.n>=2) cuerpo+=`<div class="dt-row" style="margin-top:12px"><span class="dt-k">Tu expectancy acumulada (${CTX.modo==="real"?"real":"backtest"})</span>
     <span class="dt-v ${m.exp>0?'pos':'neg'}">${m.exp>0?"+":""}${r2(m.exp)}R · ${m.n} trade${m.n!==1?"s":""}</span></div>`;
  else cuerpo+=`<div class="note" style="text-align:left;margin-top:12px">Sigue registrando: cuando tengas más trades, aquí el mentor te comparará esta entrada contra tu historial.</div>`;

  abrirModal(cuerpo,[
    {t:"Ver análisis completo",cls:"gold",fn:()=>{ cerrarModal(); irA("analisis"); }},
    {t:"Entendido",cls:"",fn:cerrarModal}
  ]);
}

/* ---- Gráfica SVG de la curva ---- */
function curvaSVG(curve){
  const W=600,H=190,P=26;
  const min=Math.min(...curve,0), max=Math.max(...curve,0);
  const rng=(max-min)||1;
  const x=i=>P+(i/(curve.length-1||1))*(W-P*2);
  const y=v=>H-P-((v-min)/rng)*(H-P*2);
  const pts=curve.map((v,i)=>x(i)+","+y(v)).join(" ");
  const zero=y(0);
  const area=`M ${x(0)},${zero} `+curve.map((v,i)=>"L "+x(i)+","+y(v)).join(" ")+` L ${x(curve.length-1)},${zero} Z`;
  const s=document.createElementNS("http://www.w3.org/2000/svg","svg");
  s.setAttribute("viewBox","0 0 "+W+" "+H);
  s.setAttribute("class","chart");
  s.setAttribute("preserveAspectRatio","none");
  s.innerHTML=`
    <defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F5C542" stop-opacity=".28"/>
      <stop offset="100%" stop-color="#F5C542" stop-opacity="0"/></linearGradient></defs>
    <line x1="${P}" y1="${zero}" x2="${W-P}" y2="${zero}" stroke="#2A3E66" stroke-width="1.5" stroke-dasharray="4 4"/>
    <path d="${area}" fill="url(#gr)"/>
    <polyline points="${pts}" fill="none" stroke="#F5C542" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(curve.length-1)}" cy="${y(curve[curve.length-1])}" r="4.5" fill="#F5C542"/>
    <text x="${P}" y="14" fill="#6B7EA3" font-size="11" font-family="sans-serif">${r1(max)}R</text>
    <text x="${P}" y="${H-6}" fill="#6B7EA3" font-size="11" font-family="sans-serif">${r1(min)}R</text>`;
  return s;
}

/* ============================================================
   VISTA 6b — ALMANAQUE (revisar trades por año / mes / día)
   ============================================================ */
let ALM={year:null,month:null,day:null};
const MES_CORTO=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const MES_LARGO=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function almResumen(list){ const m=metricas(list); return m?{n:m.n,rNeto:m.rNeto,wins:m.wins,loss:m.loss}:{n:0,rNeto:0,wins:0,loss:0}; }

function viewAlmanaque(){
  const v=el("div","view"); v.id="v-almanaque";
  const ctxWrap=el("div"); ctxWrap.id="ctxWrapAlm";
  ctxWrap.appendChild(barraContexto(()=>{ ALM={year:null,month:null,day:null}; refrescarAlmCtx(); }));
  v.appendChild(ctxWrap);
  const body=el("div"); body.id="almBody"; v.appendChild(body);
  return v;
}
function refrescarAlmCtx(){
  const cb=$("#ctxWrapAlm");
  if(cb){ cb.innerHTML=""; cb.appendChild(barraContexto(()=>{ ALM={year:null,month:null,day:null}; refrescarAlmCtx(); })); }
  renderAlmanaque();
}
function renderAlmanaque(){
  const body=$("#almBody"); if(!body) return; body.innerHTML="";
  const base=tradesCtx();
  if(!base.length){
    body.appendChild(el("div","card",
      `<div class="empty"><div class="t">Sin trades</div><div class="s">Cuando registres operaciones (Real o Backtest), aquí las revisas por año, mes y día.</div></div>`));
    return;
  }
  if(ALM.year==null)  return renderAlmYears(body,base);
  if(ALM.month==null) return renderAlmMonths(body,base);
  if(ALM.day==null)   return renderAlmCal(body,base);
  return renderAlmDay(body,base);
}
function renderAlmYears(body,base){
  const g={}; base.forEach(t=>{ const y=t.fecha.slice(0,4); (g[y]=g[y]||[]).push(t); });
  const card=el("div","card");
  card.innerHTML=`<div class="card-h"><span class="ic">📅</span><h2>Almanaque</h2></div>
    <p class="desc">Elige un año para entrar. Cada fila muestra sus trades y R neto. Luego mes → día.</p>`;
  Object.keys(g).sort((a,b)=>b.localeCompare(a)).forEach(y=>{
    const r=almResumen(g[y]);
    const row=el("div","row"); row.style.cursor="pointer";
    row.innerHTML=`<div class="l">${y}<small>${r.n} trade${r.n!==1?"s":""} · ${r.wins}W ${r.loss}L</small></div>
      <div class="r ${r.rNeto>=0?'':'red'}">${r.rNeto>0?"+":""}${r1(r.rNeto)}R</div>`;
    row.onclick=()=>{ ALM.year=y; renderAlmanaque(); };
    card.appendChild(row);
  });
  body.appendChild(card);
}
function renderAlmMonths(body,base){
  const inY=base.filter(t=>t.fecha.slice(0,4)===ALM.year);
  const card=el("div","card");
  card.innerHTML=`<div class="alm-nav"><button class="ta" id="almBack">← Años</button><div class="alm-crumb"><b>${ALM.year}</b></div></div>
    <div class="card-h"><span class="ic">📆</span><h2>Meses de ${ALM.year}</h2></div>`;
  const g={}; inY.forEach(t=>{ const mo=t.fecha.slice(5,7); (g[mo]=g[mo]||[]).push(t); });
  Object.keys(g).sort((a,b)=>b.localeCompare(a)).forEach(mo=>{
    const r=almResumen(g[mo]);
    const row=el("div","row"); row.style.cursor="pointer";
    row.innerHTML=`<div class="l">${MES_LARGO[+mo-1]}<small>${r.n} trade${r.n!==1?"s":""} · ${r.wins}W ${r.loss}L</small></div>
      <div class="r ${r.rNeto>=0?'':'red'}">${r.rNeto>0?"+":""}${r1(r.rNeto)}R</div>`;
    row.onclick=()=>{ ALM.month=mo; renderAlmanaque(); };
    card.appendChild(row);
  });
  body.appendChild(card);
  const bk=$("#almBack"); if(bk) bk.onclick=()=>{ ALM.year=null; renderAlmanaque(); };
}
function renderAlmCal(body,base){
  const y=+ALM.year, mo=+ALM.month;
  const inM=base.filter(t=>t.fecha.slice(0,7)===ALM.year+"-"+ALM.month);
  const byDay={}; inM.forEach(t=>{ const d=+t.fecha.slice(8,10); (byDay[d]=byDay[d]||[]).push(t); });
  const startDow=(new Date(y,mo-1,1).getDay()+6)%7;   // lunes = 0
  const days=new Date(y,mo,0).getDate();
  const r=almResumen(inM);
  const card=el("div","card");
  let h=`<div class="alm-nav"><button class="ta" id="almBack">← Meses</button>
      <div class="alm-crumb"><b>${MES_LARGO[mo-1]} ${y}</b> · ${r.n} trades · ${r.rNeto>0?"+":""}${r1(r.rNeto)}R</div></div>
    <div class="cal">`+["L","M","X","J","V","S","D"].map(d=>`<div class="dow">${d}</div>`).join("");
  for(let i=0;i<startDow;i++) h+=`<div class="cell empty"></div>`;
  for(let d=1;d<=days;d++){
    const ts=byDay[d];
    if(ts){ const rr=ts.reduce((a,t)=>a+t.r,0); const cls=rr>=0?"pos":"neg";
      h+=`<div class="cell has ${cls}" data-d="${d}"><span>${d}</span><span class="rr">${rr>0?"+":""}${r1(rr)}</span></div>`;
    } else h+=`<div class="cell"><span>${d}</span></div>`;
  }
  h+=`</div><div class="note" style="margin-top:10px">Toca un día marcado para ver sus trades. Verde = día positivo, rojo = negativo. Cada fila es una semana.</div>`;
  card.innerHTML=h;
  body.appendChild(card);
  const bk=$("#almBack"); if(bk) bk.onclick=()=>{ ALM.month=null; renderAlmanaque(); };
  card.querySelectorAll('.cell.has').forEach(c=>{ c.onclick=()=>{ ALM.day=String(c.dataset.d).padStart(2,"0"); renderAlmanaque(); }; });
}
function renderAlmDay(body,base){
  const fecha=ALM.year+"-"+ALM.month+"-"+ALM.day;
  const ts=base.filter(t=>t.fecha===fecha).sort((a,b)=>(a.hora||"").localeCompare(b.hora||""));
  const r=almResumen(ts);
  const card=el("div","card");
  card.innerHTML=`<div class="alm-nav"><button class="ta" id="almBack">← Calendario</button>
      <div class="alm-crumb"><b>${fechaCorta(fecha)} · ${diaSemana(fecha)}</b> · ${r.rNeto>0?"+":""}${r1(r.rNeto)}R</div></div>`;
  ts.forEach(t=>{
    const col=t.r>0?"pos":t.r<0?"neg":""; const pc=t.setup==="A+"?"a":t.setup==="B"?"b":"c";
    const d=el("div","trade"); d.style.cursor="pointer";
    d.innerHTML=`<div class="trade-top">
        <div><span class="pill ${pc}">${t.setup}</span>${t.plan==="No"?'<span class="pill br">PLAN ROTO</span>':""}
          <span class="trade-p">${esc(t.par)} · ${esc(t.dir)}</span></div>
        <span class="trade-r ${col}">${t.r>0?"+":""}${r1(t.r)}R</span></div>
      <div class="trade-m">${t.hora?esc(t.hora)+" · ":""}${esc(t.ventana)} · ${esc(t.poi||"—")} · ${esc(t.momento||"—")}</div>`;
    d.onclick=()=>verTrade(t.id);
    card.appendChild(d);
  });
  body.appendChild(card);
  const bk=$("#almBack"); if(bk) bk.onclick=()=>{ ALM.day=null; renderAlmanaque(); };
}

/* ============================================================
   VISTA 7b — MENTOR (resumen narrativo diario/semanal/mensual)
   ============================================================ */
let MPERIODO="semana";

/* Divide los trades del contexto en periodo actual vs anterior */
function periodoSplit(base, per){
  const hoy=hoyISO();
  if(per==="hoy"){
    const y=new Date(hoy+"T12:00:00"); y.setDate(y.getDate()-1);
    const ay=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0");
    return { cur:base.filter(t=>t.fecha===hoy), prev:base.filter(t=>t.fecha===ay), labA:"Hoy", labB:"ayer" };
  }
  if(per==="mes"){
    const ym=hoy.slice(0,7); const d=new Date(hoy+"T12:00:00"); d.setMonth(d.getMonth()-1);
    const pm=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
    return { cur:base.filter(t=>t.fecha.slice(0,7)===ym), prev:base.filter(t=>t.fecha.slice(0,7)===pm), labA:"Este mes", labB:"el mes pasado" };
  }
  const l=lunesDe(hoy); const dp=new Date(l+"T12:00:00"); dp.setDate(dp.getDate()-7);
  const lp=dp.getFullYear()+"-"+String(dp.getMonth()+1).padStart(2,"0")+"-"+String(dp.getDate()).padStart(2,"0");
  return { cur:base.filter(t=>t.fecha>=l), prev:base.filter(t=>t.fecha>=lp && t.fecha<l), labA:"Esta semana", labB:"la semana pasada" };
}
function shareTxt(list, pred){
  const n=list.length; if(!n) return {n:0,c:0,pct:0};
  const c=list.filter(pred).length; return {n,c,pct:c/n};
}

function viewMentor(){
  const v=el("div","view"); v.id="v-mentor";
  const ctxWrap=el("div"); ctxWrap.id="ctxWrapMentor";
  ctxWrap.appendChild(barraContexto(()=>refrescarMentorCtx()));
  v.appendChild(ctxWrap);
  const head=el("div","card");
  head.innerHTML=`<div class="card-h"><span class="ic">🧠</span><h2>Tu mentor</h2></div>
    <p class="desc">Tu operativa en palabras: qué hiciste bien, qué corregir y un plan para el próximo periodo. Se calcula con el contexto de arriba (Real/Backtest + estrategia).</p>
    <div class="seg c3" id="sgMPer"></div>`;
  v.appendChild(head);
  const body=el("div"); body.id="mentorBody"; v.appendChild(body);
  return v;
}
function refrescarMentorCtx(){
  const cb=$("#ctxWrapMentor");
  if(cb){ cb.innerHTML=""; cb.appendChild(barraContexto(()=>refrescarMentorCtx())); }
  renderMentor();
}
function renderMentor(){
  const sp=$("#sgMPer");
  if(sp && !sp.dataset.init){
    sp.dataset.init="1"; sp.innerHTML="";
    [{t:"Hoy",v:"hoy"},{t:"Semana",v:"semana"},{t:"Mes",v:"mes"}].forEach(o=>{
      const b=el("button",MPERIODO===o.v?"on":"",o.t);
      b.onclick=()=>{ MPERIODO=o.v; sp.querySelectorAll("button").forEach(x=>x.className=""); b.className="on"; renderMentor(); };
      sp.appendChild(b);
    });
  }
  const body=$("#mentorBody"); if(!body) return; body.innerHTML="";
  const base=tradesCtx();
  const {cur,prev,labA,labB}=periodoSplit(base,MPERIODO);
  const m=cur.length?metricas(cur):null;
  const mp=prev.length?metricas(prev):null;

  if(!m){
    body.appendChild(el("div","card",
      `<div class="empty"><div class="t">Sin trades en ${labA.toLowerCase()}</div>
       <div class="s">Registra operaciones (Real o Backtest) y tu mentor te dirá aquí qué mejorar, con números.</div></div>`));
    return;
  }

  /* 1) Resumen narrativo + comparación con el periodo anterior */
  const tono = m.exp>0.15?"ok":m.exp>0?"warn":"bad";
  let cmp="";
  if(mp){
    const dR=m.rNeto-mp.rNeto, dE=m.exp-mp.exp;
    cmp=` Frente a ${labB}: ${dR>=0?"▲":"▼"} ${dR>=0?"+":""}${r1(dR)}R (expectancy ${dE>=0?"▲ +":"▼ "}${r2(dE)}R). ${dR>=0?"Vas mejorando.":"Has bajado — atento abajo."}`;
  }
  const res=el("div","card");
  res.innerHTML=`<div class="card-h"><span class="ic">🧠</span><h2>${labA}</h2><span class="cnt">${m.n} trade${m.n!==1?"s":""} · ${m.nDias} día${m.nDias!==1?"s":""}</span></div>
    <div class="diag ${tono}"><div class="dt">${m.rNeto>=0?"+":""}${r1(m.rNeto)}R · ${m.netoUSD>=0?"+":""}$${r2(m.netoUSD)} · WR ${pct(m.wr*100)} · PF ${fmtPF(m.pf)}</div>
      <div class="dd">${tono==="ok"?"Operativa con ventaja clara: +"+r2(m.exp)+"R por trade. Lo que funciona es no tocarlo.":tono==="warn"?"En verde pero con margen fino: +"+r2(m.exp)+"R por trade. Una fuga menos y sube.":"Periodo en pérdida: "+r2(m.exp)+"R por trade. El foco no es operar más, es limpiar fugas."}${cmp}</div></div>`;
  body.appendChild(res);

  /* 2) Qué está bien y qué está mal (reglas de mentor) */
  const bien=[], mal=[], plan=[];
  if(m.adherencia>=0.9) bien.push(`Disciplina alta: seguiste el plan en ${pct(m.adherencia*100)} de los trades.`);
  else { mal.push(`Disciplina: ${m.roto} trade${m.roto!==1?"s":""} con el plan roto.`); plan.push("Antes de cada entrada, repasa las reglas. Ni un trade sin checklist."); }

  const sConf=shareTxt(cur,t=>t.momento==="En confirmación");
  const sToque=shareTxt(cur,t=>t.momento==="En el toque"||t.momento==="Anticipé");
  if(sConf.n>=3 && sConf.pct>=0.7) bien.push(`Timing: ${pct(sConf.pct*100)} de entradas esperando la confirmación.`);
  if(sToque.c>0){ mal.push(`Timing prematuro: ${sToque.c} entrada${sToque.c!==1?"s":""} en el toque o anticipada.`); plan.push("Dispara solo con la vela de confirmación cerrada dentro del POI."); }

  const sBias=shareTxt(cur,t=>t.bias==="A favor");
  if(sBias.n>=3){
    if(sBias.pct>=0.8) bien.push(`Alineación: ${pct(sBias.pct*100)} a favor del bias semanal.`);
    else { mal.push(`${sBias.n-sBias.c} trade(s) en contra del bias semanal.`); plan.push("El bias semanal manda: no operes en su contra."); }
  }
  if(m.fueraVent>0){ mal.push(`${m.fueraVent} trade(s) fuera de ventana horaria.`); plan.push("Opera solo en Londres / Pre-NY / NY apertura."); }
  if(m.emoMal>0){ mal.push(`${m.emoMal} trade(s) con prisa o ansiedad.`); plan.push("Si no estás en calma, no operes: cierra y vuelve mañana."); }
  if(m.setupsC>0){ mal.push(`${m.setupsC} setup(s) C tomados (tu plan pide solo A+/B).`); plan.push("Descarta los C en real. Solo A+ y B."); }
  if(m.excesoDia>0){ mal.push(`${m.excesoDia} trade(s) por encima del límite de 2/día (R6).`); plan.push("Al llegar a 2 trades, cierra la plataforma."); }
  if(m.avgMfeAll!=null && m.avgRAll!=null && (m.avgMfeAll-m.avgRAll)>0.6){ mal.push(`Sales temprano: dejas ${r2(m.avgMfeAll-m.avgRAll)}R de media sobre la mesa.`); plan.push("Respeta tus parciales; deja correr hasta la liquidez opuesta."); }
  if(m.maxL>=3) mal.push(`Racha perdedora de ${m.maxL} seguidos en el periodo. Normal, pero vigila R7/R8.`);

  const rank=[]; DIMS_MENTOR.forEach(([dim,fn])=>{ cortePor(cur,fn).forEach(x=>{ if(x.n>=3) rank.push({dim,k:x.k,exp:x.exp,n:x.n}); }); });
  rank.sort((a,b)=>b.exp-a.exp);
  if(rank.length){
    const best=rank[0], worst=rank[rank.length-1];
    if(best.exp>0) bien.push(`Tu mejor hábito: ${best.dim.toLowerCase()} "${best.k}" (+${r2(best.exp)}R en ${best.n} trades).`);
    if(worst.exp<0 && worst.k!==best.k){ mal.push(`Tu peor hábito: ${worst.dim.toLowerCase()} "${worst.k}" (${r2(worst.exp)}R en ${worst.n} trades).`); plan.push(`Revisa o corta "${worst.k}" (${worst.dim.toLowerCase()}): es tu fuga principal del periodo.`); }
  }
  if(m.exp>0.15 && !bien.some(x=>x.startsWith("Ventaja"))) bien.unshift(`Ventaja sólida: +${r2(m.exp)}R por trade.`);
  if(!mal.length) plan.push("No toques lo que funciona. Mantén el proceso y sigue registrando para robustecer la muestra.");

  const dg=el("div","card"+(mal.length?" alert":""));
  let h=`<div class="card-h"><span class="ic">⚖️</span><h2 class="${mal.length?'red':''}">Qué está bien y qué está mal</h2></div>`;
  if(bien.length) h+=`<div class="fl" style="color:var(--green);margin:4px 0 8px">✅ Lo que hiciste bien</div>`+
    bien.map(x=>`<div class="diag ok" style="padding:11px 13px;margin-bottom:7px"><div class="dd" style="color:var(--green)">${esc(x)}</div></div>`).join("");
  if(mal.length) h+=`<div class="fl" style="color:var(--red);margin:12px 0 8px">🛠️ Lo que debes corregir</div>`+
    mal.map(x=>`<div class="diag bad" style="padding:11px 13px;margin-bottom:7px"><div class="dd" style="color:var(--red)">${esc(x)}</div></div>`).join("");
  if(!bien.length && !mal.length) h+=`<p class="desc">Pocos datos en este periodo. Registra más trades para un diagnóstico fino.</p>`;
  dg.innerHTML=h; body.appendChild(dg);

  /* 3) Plan de acción */
  const planU=[...new Set(plan)].slice(0,4);
  if(planU.length){
    const pl=el("div","card");
    const dest = MPERIODO==="hoy"?"mañana":MPERIODO==="semana"?"la próxima semana":"el próximo mes";
    pl.innerHTML=`<div class="card-h"><span class="ic">🎯</span><h2>Tu plan para ${dest}</h2></div>`+
      planU.map((x,i)=>`<div class="row"><div style="display:flex;gap:12px;align-items:flex-start">
        <span style="background:var(--card3);color:var(--gold);font-weight:700;width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</span>
        <span style="font-size:14.5px;line-height:1.45">${esc(x)}</span></div></div>`).join("");
    body.appendChild(pl);
  }

  /* 4) Fortalezas/debilidades del periodo + curva */
  const fd=cardFortDeb(cur); if(fd) body.appendChild(fd);
  const cv=el("div","card");
  cv.innerHTML=`<div class="card-h"><span class="ic">📉</span><h2>Curva del periodo</h2></div>`;
  cv.appendChild(curvaSVG(m.curve));
  cv.appendChild(el("div","legend",
    `<span><i style="background:var(--gold)"></i>${m.rNeto>0?"+":""}${r1(m.rNeto)}R</span>
     <span><i style="background:var(--red)"></i>DD −${r1(m.dd)}R</span>
     <span><i style="background:var(--txt3)"></i>${m.maxW}W / ${m.maxL}L</span>`));
  body.appendChild(cv);

  body.appendChild(el("div","note",
    `Mentor de ${CTX.modo==="real"?"operaciones reales":"backtesting"} · ${esc(CTX.estrategia)}. Cambia periodo o contexto arriba. Motor de reglas de trader profesional — sin conexión, todo en tu teléfono.`));
}

/* ============================================================
   VISTA 8 — PLAN
   ============================================================ */
function viewPlan(){
  const v=el("div","view"); v.id="v-plan";

  const port=el("div","card");
  port.style.cssText="position:relative;overflow:hidden;text-align:center;padding:26px 18px";
  port.innerHTML=`<div style="position:absolute;top:0;left:0;right:0;height:4px;background:var(--gold)"></div>
    <div style="width:78px;height:78px;margin:0 auto 16px;border-radius:20px;background:radial-gradient(120% 120% at 30% 20%,#20264C,#0E1226 72%);border:1px solid var(--line);display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 100 100" style="width:66%;height:66%"><use href="#crtLogo"/></svg></div>
    <div style="font-size:15px;font-weight:600;letter-spacing:3px;color:var(--txt3)">PLAN DE TRADING</div>
    <div style="font-size:40px;font-weight:800;letter-spacing:6px;color:var(--gold);margin:2px 0 10px">APEX</div>
    <div style="font-style:italic;color:var(--txt2);font-size:15px">SMC · Candle Range Theory · Liquidez</div>
    <div style="color:var(--txt2);font-size:14.5px;margin-top:16px;line-height:1.8">
      Operador: Rey<br>Pares: EUR/USD · GBP/USD<br>
      FundedNext · fondeada 6K + desafío 6K<br>Versión ${APP_VERSION}</div>
    <div class="quote" style="text-align:left;margin-top:18px">"La disciplina pesa gramos; el arrepentimiento pesa toneladas. No pierdo por no saber leer el gráfico. Pierdo cuando rompo mis reglas."</div>`;
  v.appendChild(port);
  v.appendChild(el("div","note","Tu plan completo, igual que el documento. Toca cada sección para abrirla."));

  PLAN.forEach((s,i)=>{
    const a=el("div","acc"+(i===0?" open":""));
    const h=el("button","acc-h",`<span class="n">${s.n}</span><span class="t">${s.t}</span><span class="ar">›</span>`);
    h.onclick=()=>a.classList.toggle("open");
    const b=el("div","acc-b",s.html);
    a.append(h,b); v.appendChild(a);
  });
  return v;
}
function fillPlanDinamico(){
  const tr=$("#planReglas");
  if(tr) tr.innerHTML=REGLAS.map((r,i)=>`<tr><td style="width:52px">R${i+1}</td><td>${r}</td></tr>`).join("");
  const mn=$("#planMantras");
  if(mn) mn.innerHTML=MANTRAS.map(m=>`<div class="quote">"${m}"</div>`).join("");
  const pc=$("#planChecklist");
  if(pc){
    const T={pre:"Antes de operar (pre-mercado)",macro:"Análisis (de mayor a menor temporalidad)",
             exec:"Ejecución (M5/M3)",gest:"Después (gestión y cierre)"};
    pc.innerHTML=CHECKLIST.map(bl=>
      `<h4>${T[bl.id]}</h4>`+bl.items.map(i=>
        `<div style="display:flex;gap:11px;align-items:flex-start;margin-bottom:9px">
          <span style="width:17px;height:17px;border:1.5px solid var(--txt3);border-radius:4px;flex-shrink:0;margin-top:3px"></span>
          <span style="font-size:14.5px;color:var(--txt2);line-height:1.4">${i.t}</span></div>`).join("")).join("");
  }
}

/* ============================================================
   VISTA — CUENTAS DE FONDEO (v4.6)
   Registro de exámenes/fondeadas/reales/propias con sus reglas,
   rendimiento (conectado al Diario), interés compuesto y notas.
   ============================================================ */
const FASES = ["Examen F1","Examen F2","Fondeada","Real","Propia","Demo"];
/* Fases que NO entran en la cadena de "avanzar" (no son de reto): capital propio y demo. */
const FASES_SIN_AVANCE = ["Propia","Demo"];
const FIRMAS_SUG = ["FTMO","FundedNext","The5ers","E8 Markets","FTUK","MyFundedFX","Alpha Capital","Funding Pips","Otra"];
/* Reglas TÍPICAS de reto (2 fases) por firma — relleno instantáneo offline.
   Son valores aproximados y editables; Roberto puede traer los exactos. */
const FIRMAS_DATA = {
  "ftmo":         { ddMaxPct:"10", ddTipo:"Estático", ddDailyPct:"5", targetF1:"10", targetF2:"5", diasMin:"0", splitPct:"80", nota:"FTMO · 2 fases · split 80% (hasta 90%) · sin días mínimos. Confirma en ftmo.com." },
  "fundednext":   { ddMaxPct:"10", ddTipo:"Estático", ddDailyPct:"5", targetF1:"8",  targetF2:"5", diasMin:"5", splitPct:"80", nota:"FundedNext (modelo Stellar) · 2 fases · split hasta 90-95%. Confirma el modelo exacto." },
  "the5ers":      { ddMaxPct:"10", ddTipo:"Estático", ddDailyPct:"5", targetF1:"8",  targetF2:"5", diasMin:"3", splitPct:"80", nota:"The5ers · programas High Stakes/Hyper Growth varían. Confirma el programa." },
  "e8 markets":   { ddMaxPct:"8",  ddTipo:"Trailing", ddDailyPct:"5", targetF1:"8",  targetF2:"5", diasMin:"0", splitPct:"80", nota:"E8 Markets · drawdown suele ser TRAILING. Confirma en e8markets.com." },
  "e8":           { ddMaxPct:"8",  ddTipo:"Trailing", ddDailyPct:"5", targetF1:"8",  targetF2:"5", diasMin:"0", splitPct:"80", nota:"E8 Markets · drawdown suele ser TRAILING. Confirma en e8markets.com." },
  "ftuk":         { ddMaxPct:"6",  ddTipo:"Estático", ddDailyPct:"3", targetF1:"8",  targetF2:"5", diasMin:"0", splitPct:"80", nota:"FTUK · reglas por modelo. Confirma en la web oficial." },
  "myfundedfx":   { ddMaxPct:"10", ddTipo:"Trailing", ddDailyPct:"5", targetF1:"8",  targetF2:"5", diasMin:"0", splitPct:"80", nota:"MyFundedFX · confirma programa y tipo de DD." },
  "funding pips": { ddMaxPct:"10", ddTipo:"Estático", ddDailyPct:"5", targetF1:"8",  targetF2:"5", diasMin:"0", splitPct:"80", nota:"Funding Pips · 2 fases · split hasta 100%. Confirma." },
  "alpha capital":{ ddMaxPct:"10", ddTipo:"Trailing", ddDailyPct:"5", targetF1:"8",  targetF2:"5", diasMin:"0", splitPct:"80", nota:"Alpha Capital Group · confirma modelo y tipo de DD." }
};
function firmaKey(s){ return String(s||"").toLowerCase().replace(/\s+/g," ").trim(); }
/* Precio aprox del reto según el TAMAÑO de la cuenta (varía por firma).
   Valores típicos/editables; el botón de Roberto trae el exacto. */
const PRECIOS_FIRMA = {
  "ftmo":        { 10000:89, 25000:250, 50000:345, 100000:540, 200000:1080 },
  "fundednext":  { 6000:49, 15000:99, 25000:169, 50000:299, 100000:549, 200000:1099 },
  "the5ers":     { 5000:39, 20000:135, 60000:325, 100000:495 },
  "funding pips":{ 5000:32, 10000:52, 25000:117, 50000:242, 100000:442, 200000:942 }
};
const PRECIOS_GEN = [[5000,45],[6000,55],[10000,89],[15000,110],[25000,200],[50000,300],[100000,500],[200000,1000]];
function precioReto(key, cap){
  cap = +cap||0; if(!cap) return "";
  const map = PRECIOS_FIRMA[key];
  if(map){
    if(map[cap]) return String(map[cap]);
    const sizes=Object.keys(map).map(Number);
    const near=sizes.reduce((a,b)=>Math.abs(b-cap)<Math.abs(a-cap)?b:a);
    return String(map[near]);
  }
  const near=PRECIOS_GEN.reduce((a,b)=>Math.abs(b[0]-cap)<Math.abs(a[0]-cap)?b:a);
  return String(near[1]);
}
/* Rellena las reglas típicas al escribir la firma (solo campos vacíos) */
function aplicarPresetFirma(){
  const inp=$("#ac_firma"); if(!inp) return;
  const key=firmaKey(inp.value);
  const p=FIRMAS_DATA[key];
  const fase=$("#ac_fase")?.value||"";
  const cap=$("#ac_capital")?.value||"";
  let hubo=false;
  const fill=(id,v)=>{ const e=$("#"+id); if(e && v!=null && v!=="" && !e.value.trim()){ e.value=v; hubo=true; } };
  if(p){
    const target = /F2/.test(fase)?p.targetF2 : /F1/.test(fase)?p.targetF1 : "";
    fill("ac_ddmax",p.ddMaxPct); fill("ac_dddaily",p.ddDailyPct); fill("ac_target",target);
    fill("ac_diasmin",p.diasMin); fill("ac_split",p.splitPct); fill("ac_nota",p.nota);
    const dt=$("#ac_ddtipo"); if(dt && p.ddTipo && dt.dataset.tocado!=="1"){ dt.value=p.ddTipo; }
  }
  /* Precio del reto SEGÚN EL CAPITAL (si el usuario no lo tocó a mano) */
  const pe=$("#ac_precio");
  if(pe && cap && pe.dataset.manual!=="1"){
    const pr=precioReto(key, cap);
    if(pr){ pe.value=pr; hubo=true; }
  }
  if(hubo && p) toast("Reglas de "+inp.value+" rellenadas ✓");
}
/* Roberto trae/actualiza las reglas exactas de la firma (conocimiento + internet) */
async function rellenarReglasIA(){
  const firma=($("#ac_firma")?.value||"").trim();
  if(!firma){ toast("Escribe primero la firma"); return; }
  if(!IA.url){ toast("Abre Roberto (✨) y configura el puente (⚙️) primero"); return; }
  const fase=$("#ac_fase")?.value||"Examen F1";
  const btn=$("#ac_iaFill"), st=$("#ac_iaStatus");
  if(btn){ btn.disabled=true; btn.textContent="🤖 Roberto buscando…"; }
  if(st) st.textContent="Roberto está trayendo las reglas de "+firma+"…";
  const cap=($("#ac_capital")?.value||"").trim();
  const sys="Eres Roberto, experto en empresas de fondeo. Devuelve SOLO un objeto JSON válido, sin texto antes ni después y sin ```. Claves EXACTAS: ddMaxPct, ddTipo, ddDailyPct, targetPct, diasMin, splitPct, precio, nota. Reglas: ddTipo debe ser \"Estático\" o \"Trailing\"; los numéricos van como texto SIN símbolos (ej. \"10\", no \"10%\"); targetPct es el objetivo de la FASE indicada; precio es el coste aprox del reto en USD para EL TAMAÑO DE CUENTA indicado (deja \"\" si no lo sabes); nota es UNA frase corta con el modelo/programa y 'confirma en la web oficial'. Si no conoces un dato con seguridad, pon \"\".";
  const msg="Dame las reglas estándar del reto de la firma \""+firma+"\" para la fase \""+fase+"\""+(cap?(" y un tamaño de cuenta de "+cap+" USD"):"")+" (cuenta de 2 fases si aplica). Solo el JSON.";
  try{
    const r=await fetch(IA.url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({system:sys,messages:[{role:"user",content:msg}]})});
    const d=await r.json();
    const txt=(d.text||"").trim();
    const mm=txt.match(/\{[\s\S]*\}/);
    if(!mm) throw new Error("sin JSON");
    const o=JSON.parse(mm[0]);
    const num=v=>String(v==null?"":v).replace(/[^\d.]/g,"");
    const setN=(id,v)=>{ const e=$("#"+id); const n=num(v); if(e && n!=="") e.value=n; };
    setN("ac_ddmax",o.ddMaxPct); setN("ac_dddaily",o.ddDailyPct); setN("ac_target",o.targetPct);
    setN("ac_diasmin",o.diasMin); setN("ac_split",o.splitPct); setN("ac_precio",o.precio);
    const dt=$("#ac_ddtipo"); if(dt && /trailing/i.test(o.ddTipo||"")) dt.value="Trailing"; else if(dt && /est/i.test(o.ddTipo||"")) dt.value="Estático";
    const nt=$("#ac_nota"); if(nt && o.nota && !nt.value.trim()) nt.value=String(o.nota);
    if(st) st.textContent="✅ Reglas traídas por Roberto. Revisa y ajusta lo que haga falta antes de guardar.";
    toast("Reglas rellenadas por Roberto ✓");
  }catch(e){
    if(st) st.textContent="No pude traer el JSON de reglas. Rellénalas a mano o inténtalo otra vez (o pregúntale a Roberto en el chat).";
    toast("No se pudo autorrellenar; ponlas a mano");
  }finally{
    if(btn){ btn.disabled=false; btn.textContent="🤖 Traer reglas con Roberto"; }
  }
}
function faseColor(f){ return /Demo/.test(f)?"var(--txt3)":/Fondeada/.test(f)?"var(--green)":/Real/.test(f)?"var(--blue)":/Propia/.test(f)?"var(--purple)":"var(--orange)"; }
function faseBadge(f){ const col=faseColor(f); return `<span class="cta-badge" style="color:${col};border-color:${col}">${esc(f||"—")}</span>`; }

/* Rendimiento de una cuenta a partir de sus trades ligados + sus datos */
function statsCuenta(c){
  const list=TRADES.filter(t=>t.cuenta===c.id);
  const m=list.length?metricas(list):null;
  const cap=+c.capital||0;
  const riesgo=(+c.riesgoPct||0.5)/100;
  const plTrades = m ? m.rNeto*riesgo*cap : 0;         // P&L estimado en $ desde la R
  const manual = (c.balance!==undefined && c.balance!==null && c.balance!=="");
  const balance = manual ? (+c.balance||0) : cap+plTrades;
  const pl = balance-cap;
  const progresoPct = cap>0 ? pl/cap*100 : 0;
  const target = +c.targetPct||0;
  return { list, m, cap, riesgo, plTrades, manual, balance, pl, progresoPct, target };
}

/* ============================================================
   🧭 MOTOR DEL PLAN DE ARRANQUE
   Guarda en qué fase va Rey, qué pasos lleva marcados, y VERIFICA SOLO si ya
   cumple la señal para avanzar. Roberto lee este mismo estado en cada chat
   (planBloque) — por eso los dos van siempre por el mismo punto y él puede
   frenarlo cuando quiere saltarse una fase.
   ============================================================ */
let PLAN_ARR = load(K.plan, { fase:0, pasos:{}, hist:[], docs:0, caps:0 });
function guardarPlan(){ save(K.plan, PLAN_ARR); }
function planFaseActual(){ return PLAN_FASES[Math.min(PLAN_ARR.fase||0, PLAN_FASES.length-1)]; }
function planPasosHechos(f){ return (f.pasos||[]).filter(p=>PLAN_ARR.pasos[p.id]).length; }

/* Cuenta memoria de Roberto (se refresca en segundo plano; sin red usa lo último visto) */
let PLAN_MEM=null;
async function planCargarMem(){
  try{
    const r=await fetch(nubeUrl()+"/mem",{cache:"no-store"});
    const d=await r.json();
    const e=(d&&d.entries)||[];
    const temas={}; e.forEach(x=>{ const k=x.tema||"general"; temas[k]=(temas[k]||0)+1; });
    PLAN_MEM={ total:e.length, temas, nutrido:(temas.estrategia||0)+(temas.visual||0) };
    localStorage.setItem("crtelite_planmem", JSON.stringify(PLAN_MEM));
    if(TAB==="arranque") renderArranque();
  }catch(_){
    if(!PLAN_MEM){ try{ PLAN_MEM=JSON.parse(localStorage.getItem("crtelite_planmem")||"null"); }catch(_){} }
  }
}

/* 📅 Racha de disciplina: días seguidos (hasta hoy) sin romper las reglas duras.
   ⚠️ EL BACKTEST NO CUENTA. Hacer 20 entradas en una sesión de backtest es
   ENTRENAMIENTO (el gimnasio), no indisciplina: ahí repites para aprender a ver.
   La regla de "máximo 2 al día" existe para proteger tu cabeza y tu capital
   cuando el mercado corre en vivo. Por eso la racha solo mira la operativa EN VIVO
   (modo Real, sea cuenta demo o fondeada) y el backtest se cuenta aparte, a favor. */
function planRachaDisciplina(){
  const lista=(Array.isArray(TRADES)?TRADES:[]).filter(t=>!t.abierta && t.fecha && t.modo==="real");
  const gym=(Array.isArray(TRADES)?TRADES:[]).filter(t=>!t.abierta && t.fecha && t.modo!=="real");
  const diasGym=new Set(gym.map(t=>t.fecha)).size;
  if(!lista.length) return { dias:0, trades:0, roto:null, gym:gym.length, diasGym };
  const porDia={};
  lista.forEach(t=>{ (porDia[t.fecha]=porDia[t.fecha]||[]).push(t); });
  const malDia=f=>{ const d=porDia[f]||[]; return d.length>2 || d.filter(t=>(parseFloat(t.r)||0)<0).length>=2; };
  /* primer día con trades en vivo (para no contar racha desde el principio de los tiempos) */
  const fechas=Object.keys(porDia).sort();
  const desde=new Date(fechas[0]+"T12:00:00");
  const hoy=new Date(hoyISO()+"T12:00:00");
  let dias=0, roto=null;
  for(let d=new Date(hoy); d>=desde; d.setDate(d.getDate()-1)){
    const f=d.toISOString().slice(0,10);
    if(malDia(f)){ roto=f; break; }
    dias++;
  }
  return { dias, trades:lista.length, roto, gym:gym.length, diasGym };
}
/* 📅 Meses naturales completos operando en real con las reglas intactas */
function planMesesReal(){
  const reales=(Array.isArray(TRADES)?TRADES:[]).filter(t=>!t.abierta && t.modo==="real" && t.fecha);
  if(!reales.length) return { meses:0, mes:null };
  const meses={};
  reales.forEach(t=>{ const m=String(t.fecha).slice(0,7); (meses[m]=meses[m]||[]).push(t); });
  const mesHoy=hoyISO().slice(0,7);
  const cerrados=Object.keys(meses).filter(m=>m<mesHoy);
  const limpio=m=>{
    const porDia={};
    meses[m].forEach(t=>{ (porDia[t.fecha]=porDia[t.fecha]||[]).push(t); });
    return Object.keys(porDia).every(f=>porDia[f].length<=2 && porDia[f].filter(t=>(parseFloat(t.r)||0)<0).length<2);
  };
  return { meses:cerrados.filter(limpio).length, mes:mesHoy };
}
/* ✅ ¿Se cumple la señal de esta fase? Devuelve {ok, txt, falta} */
function planSeñal(f){
  if(!f) return { ok:false, txt:"—", falta:"" };
  if(f.auto==="nube"){
    const conectado = !!(typeof IA!=="undefined" && IA.url);
    return conectado
      ? { ok:true, txt:"Apex conectada con la nube ✓", falta:"" }
      : { ok:false, txt:"Apex aún no está conectada con la nube", falta:"Configura el puente (⚙️) y comprueba que Roberto responde." };
  }
  if(f.auto==="memoria"){
    const m=PLAN_MEM;
    if(!m) return { ok:false, txt:"Leyendo la memoria de Roberto…", falta:"Espera un momento o revisa tu internet." };
    const nTemas=Object.keys(m.temas||{}).filter(k=>k!=="general").length;
    const ok = m.total>=(f.min||6) && nTemas>=(f.minTemas||2);
    return ok
      ? { ok:true, txt:"Roberto sabe "+m.total+" cosas de ti en "+nTemas+" temas ✓", falta:"" }
      : { ok:false, txt:"Roberto sabe "+m.total+" cosa(s) de ti en "+nTemas+" tema(s)",
          falta:"Necesitas "+(f.min||6)+" recuerdos en al menos "+(f.minTemas||2)+" temas. Habla más con él: cuéntale cómo operas y qué te cuesta." };
  }
  if(f.auto==="nutrido"){
    const m=PLAN_MEM;
    const mat=(PLAN_ARR.docs||0)+(PLAN_ARR.caps||0);
    if(!m) return { ok:false, txt:"Leyendo la memoria de Roberto…", falta:"" };
    const ok = mat>=1 && (m.nutrido||0)>=(f.min||4);
    return ok
      ? { ok:true, txt:"Le has pasado "+mat+" material(es) y aprendió "+m.nutrido+" cosas de estrategia ✓", falta:"" }
      : { ok:false, txt:"Material compartido: "+mat+" · aprendizajes de estrategia/visuales: "+(m.nutrido||0),
          falta:(mat<1?"Pásale al menos un documento o enlace con el clip 📎. ":"")+"Necesitas "+(f.min||4)+" recuerdos suyos de estrategia o visuales." };
  }
  if(f.auto==="disciplina"){
    const r=planRachaDisciplina();
    const gymTxt = r.gym ? (" · 🏋️ "+r.gym+" trade(s) de backtest en "+r.diasGym+" día(s) — el gimnasio NO cuenta contra ti") : "";
    const ok = r.dias>=(f.dias||14) && r.trades>=(f.minTrades||10);
    return ok
      ? { ok:true, txt:r.dias+" días seguidos sin romper una regla EN VIVO · "+r.trades+" trades ✓"+gymTxt, falta:"" }
      : { ok:false, txt:r.dias+" día(s) seguidos limpios en vivo · "+r.trades+" trade(s) en vivo"+gymTxt,
          falta:"Necesitas "+(f.dias||14)+" días seguidos sin romper una regla y "+(f.minTrades||10)+" trades EN VIVO (demo o real). El backtest no suma aquí: es tu entrenamiento, opera todo lo que quieras."
            +(r.roto?(" Tu racha se cortó el "+r.roto+"."):"") };
  }
  if(f.auto==="mesreal"){
    const m=planMesesReal();
    return m.meses>=1
      ? { ok:true, txt:m.meses+" mes(es) natural(es) en real con las reglas intactas ✓", falta:"" }
      : { ok:false, txt:"Aún no has cerrado un mes completo en real con las reglas intactas",
          falta:"Necesitas terminar un mes natural operando en real sin pasar de 2 trades al día ni encadenar 2 SL." };
  }
  return { ok:true, txt:"Esta fase no se termina: se repite cada mes.", falta:"" };
}

/* ▶️ Avanzar de fase — solo si la señal se cumple. Roberto también puede proponerlo. */
function planAvanzar(forzar){
  const f=planFaseActual();
  if(PLAN_ARR.fase>=PLAN_FASES.length-1){ toast("Ya estás en la última fase 🧭"); return false; }
  const s=planSeñal(f);
  if(!s.ok && !forzar){ toast("Todavía no toca: "+s.falta.slice(0,60)); return false; }
  PLAN_ARR.fase=(PLAN_ARR.fase||0)+1;
  PLAN_ARR.hist=(PLAN_ARR.hist||[]).concat([{ fase:PLAN_ARR.fase, ts:Date.now(), forzado:!!forzar }]);
  guardarPlan();
  const nueva=planFaseActual();
  toast("🧭 Fase "+nueva.n+" — "+nueva.t);
  if(TAB==="arranque") renderArranque();
  return true;
}
function planRetroceder(){
  if(!PLAN_ARR.fase) return;
  PLAN_ARR.fase--; guardarPlan(); renderArranque();
  toast("🧭 Volviste a la fase "+planFaseActual().n);
}

/* 🧠 EL PLAN, PARA ROBERTO — se inyecta en CADA conversación, igual que el guardián
   de riesgo. Con esto sabe exactamente por dónde va Rey y puede frenarlo. */
function iaPlan(){
  const f=planFaseActual();
  const s=planSeñal(f);
  const hechos=planPasosHechos(f);
  const pend=(f.pasos||[]).filter(p=>!PLAN_ARR.pasos[p.id]).map(p=>p.t);
  const sig=PLAN_FASES[PLAN_ARR.fase+1];
  let out="[🧭 PLAN DE ARRANQUE DE REY — ES TU HOJA DE RUTA COMPARTIDA. Vais los dos por el MISMO punto.\n";
  out+="FASE ACTUAL: "+f.n+" — "+f.t+" ("+f.cuando+")\n";
  out+="Idea de esta fase: "+f.idea+"\n";
  out+="Pasos: "+hechos+" de "+(f.pasos||[]).length+" hechos.\n";
  if(pend.length) out+="LE FALTA POR HACER en esta fase: "+pend.join(" · ")+"\n";
  out+="SEÑAL para avanzar: "+f.señal+"\n";
  out+="ESTADO REAL AHORA: "+s.txt+"\n";
  if(!s.ok) out+="POR TANTO: TODAVÍA NO PUEDE AVANZAR. Le falta: "+s.falta+"\n";
  else out+="POR TANTO: YA CUMPLE la señal"+(sig?(" y puede pasar a la fase "+sig.n+" — "+sig.t):"")+". DÍSELO tú, felicítalo y explícale qué cambia en la fase nueva.\n";
  if(sig) out+="SIGUIENTE FASE: "+sig.n+" — "+sig.t+" ("+sig.cuando+")\n";
  out+="FASES COMPLETAS DEL PLAN (para que sepas el camino entero): "+PLAN_FASES.map(x=>x.n+" "+x.t).join(" → ")+"\n";
  out+="CÓMO ACTÚAS CON ESTE PLAN:\n";
  out+="1) Cuando Rey te pregunte qué hacer, respóndele SIEMPRE desde su fase actual, no desde el ideal.\n";
  out+="2) Si te pide algo de una fase que TODAVÍA NO LE TOCA, FRÉNALO con cariño pero sin ceder: dile en qué fase está, qué le falta exactamente para avanzar y qué debe hacer HOY. Ejemplo: si está en la fase 01 (solo hablar) y te pide validar una entrada real, dile que aún no toca operar y por qué saltárselo lo perjudica.\n";
  out+="3) Si YA cumple la señal, adelántatele: felicítalo y proponle pasar de fase con tu mano avanzar_plan.\n";
  out+="4) Puedes marcar por él los pasos que veas cumplidos con marcar_paso_plan (él lo confirma).\n";
  out+="5) Recuérdale el plan sin que te lo pida: en el parte del día y al cerrar la jornada, dile por dónde va y qué le falta.\n";
  out+="6) El plan manda sobre las ganas. Si Rey insiste en saltarse una fase, explícale el riesgo con datos suyos; si aun así lo decide, respétalo, avísale de lo que se salta y sigue apoyándolo.]";
  return out;
}

/* ============================================================
   🎯 EL HISTORIAL DE ROBERTO — sus propias lecturas, medidas
   Roberto ve tus trades y sus resultados, pero no tenía memoria de LO QUE ÉL DIJO.
   Podía analizarte a ti, no auditarse a sí mismo. Aquí se guarda cada veredicto suyo
   (GO / NO-GO / ESPERA) y, cuando registras el trade, se enlazan solos: mismo par,
   dentro de las 12 h siguientes. Con eso puede decirte, con NÚMEROS suyos, en qué
   acierta y en qué falla — y corregirse.
   ============================================================ */
let VERED = load(K.vered, []);
function guardarVered(){ save(K.vered, VERED); }

/* Apunta una lectura de Roberto. La llama él mismo con su mano registrar_veredicto. */
function veredAdd(o){
  const v = {
    id: "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    ts: Date.now(),
    fecha: hoyISO(),
    par: String(o.par || "").toUpperCase().replace(/[^A-Z0-9]/g, ""),
    veredicto: ["go", "nogo", "espera"].includes(o.veredicto) ? o.veredicto : "espera",
    razon: String(o.razon || "").slice(0, 400),
    setup: String(o.setup || "").slice(0, 20),
    confianza: Math.max(1, Math.min(5, parseInt(o.confianza, 10) || 3)),
    modo: CTX.modo, estrategia: CTX.estrategia,
    trade: null,          // id del trade con el que se enlace
    resultado: null       // R del trade, cuando cierre
  };
  VERED.unshift(v);
  VERED = VERED.slice(0, 500);
  guardarVered();
  return v;
}
/* Enlaza un trade con la lectura más reciente de Roberto sobre ese par (últimas 12 h).
   Filtra por MODO y ESTRATEGIA: una lectura hecha en backtest no puede acabar enlazada
   a una entrada real, ni las lecturas de una estrategia contaminar a otra. */
function veredEnlazar(trade){
  if (!trade || !trade.par) return null;
  const par = String(trade.par).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const limite = Date.now() - 12 * 3600 * 1000;
  const v = VERED.find(x => !x.trade && x.par === par && x.ts >= limite
    && x.modo === trade.modo && x.estrategia === trade.estrategia);
  if (!v) return null;
  v.trade = trade.id;
  if (!trade.abierta) v.resultado = parseFloat(trade.r) || 0;
  guardarVered();
  return v;
}
/* Cuando un trade se cierra o se edita, actualiza el resultado de su lectura. */
function veredActualizar(trade){
  if (!trade || trade.abierta) return;
  const v = VERED.find(x => x.trade === trade.id);
  if (v) { v.resultado = parseFloat(trade.r) || 0; guardarVered(); }
}
/* Estadísticas de Roberto sobre SÍ MISMO, SIEMPRE dentro del contexto activo
   (mismo modo y misma estrategia). El backtest es entrenamiento de lectura y cuenta
   aparte: mezclarlo con lo real daría un número que no significa nada. */
function veredStats(desdeTs, todo){
  const lista = VERED.filter(v => v.resultado !== null
    && (!desdeTs || v.ts >= desdeTs)
    && (todo || (v.modo === CTX.modo && v.estrategia === CTX.estrategia)));
  const propias = VERED.filter(v => todo || (v.modo === CTX.modo && v.estrategia === CTX.estrategia));
  const go = lista.filter(v => v.veredicto === "go");
  const nogo = lista.filter(v => v.veredicto === "nogo");
  const goBien = go.filter(v => v.resultado > 0).length;
  const goMal = go.filter(v => v.resultado < 0).length;
  /* un NO-GO "acierta" si Rey entró igual y salió perdiendo */
  const nogoAcertado = nogo.filter(v => v.resultado < 0).length;
  const nogoFallado = nogo.filter(v => v.resultado > 0).length;
  const rGo = go.reduce((a, v) => a + v.resultado, 0);
  /* por par: para que pueda detectar dónde lee bien y dónde no */
  const pares = {};
  lista.forEach(v => {
    const p = pares[v.par] = pares[v.par] || { n: 0, bien: 0, r: 0 };
    p.n++; if (v.resultado > 0) p.bien++; p.r += v.resultado;
  });
  return {
    total: propias.length, medidos: lista.length,
    go: go.length, goBien, goMal,
    tasaGo: (goBien + goMal) ? Math.round(goBien / (goBien + goMal) * 100) : null,
    rGo, nogo: nogo.length, nogoAcertado, nogoFallado,
    pendientes: propias.filter(v => !v.trade).length,
    pares,
    otrosContextos: VERED.length - propias.length
  };
}
/* Bloque que Roberto recibe en CADA conversación: su propio boletín de notas. */
function iaAciertos(){
  if (!VERED.length) return "[🎯 TU HISTORIAL DE LECTURAS: aún no has registrado ninguna. Cada vez que le des a Rey un GO, un NO-GO o un ESPERA sobre un par, apúntalo con tu mano registrar_veredicto. Es la única forma de que luego puedas medirte a ti mismo y corregirte: sin eso, opinas sin saber si aciertas.]";
  const s = veredStats();
  const ult = VERED.slice(0, 8).map(v => {
    const et = v.veredicto === "go" ? "✅ GO" : v.veredicto === "nogo" ? "⛔ NO-GO" : "⏸️ ESPERA";
    const res = v.resultado === null ? (v.trade ? "abierta" : "sin operar") : ((v.resultado >= 0 ? "+" : "") + r1(v.resultado) + "R");
    return "  · " + v.fecha + " " + v.par + " " + et + " (confianza " + v.confianza + "/5) → " + res + (v.razon ? " — dijiste: " + v.razon.slice(0, 90) : "");
  }).join("\n");
  let out = "[🎯 TU HISTORIAL DE LECTURAS — esto es lo que TÚ dijiste y en qué acabó. Úsalo para AUDITARTE, no solo para auditar a Rey.\n";
  out += "CONTEXTO: " + (CTX.modo === "real" ? "operativa EN VIVO" : "🏋️ BACKTEST (entrenamiento de lectura)") + " · estrategia \"" + CTX.estrategia + "\". Estos números son SOLO de este contexto";
  out += s.otrosContextos ? (" (tienes " + s.otrosContextos + " lectura(s) más en otros modos o estrategias, que NO se mezclan).\n") : ".\n";
  out += "Registradas: " + s.total + " · medidas: " + s.medidos + " · sin operar todavía: " + s.pendientes + "\n";
  if (s.medidos) {
    out += "GO que diste: " + s.go + " → " + s.goBien + " ganadoras / " + s.goMal + " perdedoras" +
      (s.tasaGo !== null ? " (aciertas el " + s.tasaGo + "% de tus GO)" : "") + " · resultado acumulado " + (s.rGo >= 0 ? "+" : "") + r1(s.rGo) + "R\n";
    if (s.nogo) out += "NO-GO que diste y Rey operó igual: " + (s.nogoAcertado + s.nogoFallado) + " → acertaste " + s.nogoAcertado + " (habría perdido) y fallaste " + s.nogoFallado + " (habría ganado)\n";
    const porPar = Object.keys(s.pares).sort((a, b) => s.pares[b].n - s.pares[a].n).slice(0, 8)
      .map(p => p + ": " + s.pares[p].bien + "/" + s.pares[p].n + " (" + (s.pares[p].r >= 0 ? "+" : "") + r1(s.pares[p].r) + "R)").join(" · ");
    if (porPar) out += "POR PAR (aciertos/lecturas): " + porPar + "\n";
  }
  out += "Últimas lecturas tuyas:\n" + ult + "\n";
  out += "CÓMO LO USAS: (1) Registra SIEMPRE tu veredicto con registrar_veredicto cuando te mojes sobre un par — es automático, no molesta a Rey. ";
  out += "(2) En el análisis del día y de la semana, dile también cómo leíste TÚ, con estos números, aunque te dejen mal. ";
  out += "(3) Mira el desglose POR PAR: si en uno aciertas mucho menos que en los demás, ese par te está costando y Rey debe saberlo. Igual con tipos de setup o días de la semana. Cuando encuentres el patrón, DÍSELO y guárdalo con guardar_memoria. ";
  out += "(4) Si tu tasa de acierto baja, sé MÁS exigente antes de dar un GO. Un mentor que se mide es un mentor que mejora.]";
  return out;
}
/* 🎯 Vista para Rey: cómo va leyendo Roberto el mercado. */
async function verAciertos(){
  if(typeof abrirIA==="function") abrirIA();
  iaTemaChat("🎯 Cómo lee Roberto");
  const c=iaConvAct();
  const s=veredStats();
  let txt="";
  if(!VERED.length){
    txt="## 🎯 Cómo leo yo el mercado\n\nTodavía no he registrado ninguna lectura. En cuanto empieces a pedirme **✅ GO/NO-GO** antes de tus entradas, iré apuntando cada veredicto mío. Cuando registres el trade, los enlazo solos.\n\nAsí, dentro de unas semanas, podré decirte con números **en qué acierto y en qué fallo** — y corregirme.";
  }else{
    txt="## 🎯 Cómo leo yo el mercado\n\n"+
      "**"+s.total+"** lecturas registradas · **"+s.medidos+"** ya con resultado · "+s.pendientes+" sin operar\n\n";
    if(s.medidos){
      txt+="### Mis GO\n"+s.go+" dados → **"+s.goBien+" ganadoras** / "+s.goMal+" perdedoras"+
        (s.tasaGo!==null?("  ·  acierto **"+s.tasaGo+"%**"):"")+"  ·  "+(s.rGo>=0?"+":"")+r1(s.rGo)+"R acumulados\n\n";
      if(s.nogo) txt+="### Mis NO-GO que operaste igual\n"+s.nogoAcertado+" veces tenía razón (perdiste) · "+s.nogoFallado+" veces me equivoqué (ganaste)\n\n";
    }else{
      txt+="_Aún no hay ninguna lectura con resultado: registra los trades al cerrarlos y se enlazan solos._\n\n";
    }
    txt+="### Últimas\n"+VERED.slice(0,10).map(v=>{
      const et=v.veredicto==="go"?"✅ GO":v.veredicto==="nogo"?"⛔ NO-GO":"⏸️ ESPERA";
      const res=v.resultado===null?(v.trade?"_abierta_":"_sin operar_"):("**"+(v.resultado>=0?"+":"")+r1(v.resultado)+"R**");
      return "- "+v.fecha+" · "+v.par+" · "+et+" → "+res;
    }).join("\n");
  }
  c.msgs.push({role:"assistant",content:txt});
  iaGuardarConvs(); pintarIAChat();
}

/* 🛡️ GUARDIÁN DE RIESGO — estado EN VIVO del riesgo del día por cada cuenta, para que
   Roberto FRENE a Rey antes de romper una regla. Mira: pérdida del día vs límite DIARIO,
   drawdown total vs DD máximo, nº de trades y de SL hoy (regla 2/día · 2 SL = parar).
   Basado en los trades REGISTRADOS (R × riesgo%); es aprox pero suficiente para disciplina. */
function guardianRiesgo(){
  const cuentas=(Array.isArray(CUENTAS)?CUENTAS:[]).filter(c=>c.fase!=="Cerrada");
  if(!cuentas.length) return "[🛡️ GUARDIÁN DE RIESGO: Rey aún no tiene cuentas registradas. Aun así, recuérdale SIEMPRE sus reglas de riesgo si va a operar — las VIGENTES son las de su config del panel 🤖 (riesgo por operación, cupo del día, tope de pérdida diaria): cítalas de ahí, no de memoria.]";
  const hoy=hoyISO();
  const sem=(usado,limite)=>{ if(!(limite>0)) return "🟢"; const fl=(limite-usado)/limite; if(fl<=0) return "🔴"; if(fl<=0.3) return "🔔"; if(fl<=0.5) return "🟡"; return "🟢"; };
  let s="[🛡️ GUARDIÁN DE RIESGO (hoy "+hoy+") — datos EN VIVO de sus cuentas. Úsalo para FRENARLO ANTES de que rompa una regla, con firmeza:\n";
  cuentas.forEach(c=>{
    const st=statsCuenta(c);
    const riesgoPct=+c.riesgoPct||0.5;
    const hoyT=TRADES.filter(t=>t.cuenta===c.id && t.fecha===hoy && !t.abierta && t.modo==="real");
    const rHoy=hoyT.reduce((a,t)=>a+(parseFloat(t.r)||0),0);
    const slHoy=hoyT.filter(t=>(parseFloat(t.r)||0)<0).length;
    const diaPct=rHoy*riesgoPct;                       // % del capital ganado/perdido hoy (aprox por R)
    const ddDaily=+c.ddDailyPct||0, ddMax=+c.ddMaxPct||0;
    const usadoDia=diaPct<0?Math.abs(diaPct):0;
    const margenDia=ddDaily>0?Math.max(0,ddDaily-usadoDia):null;
    const usadoTot=st.progresoPct<0?Math.abs(st.progresoPct):0;
    const margenTot=ddMax>0?Math.max(0,ddMax-usadoTot):null;
    const esDemo=/Demo/i.test(c.fase||"");
    s+="── "+(c.alias||c.firma||"Cuenta")+" ("+(c.firma||"?")+" · "+(c.fase||"?")+") ──\n";
    if(esDemo) s+="  (DEMO = PRÁCTICA: exígele la MISMA disciplina y reglas para entrenar el plan, pero SIN el miedo del dinero real; enfoque de práctica, no de supervivencia de capital.)\n";
    s+="  Riesgo/trade "+riesgoPct+"% · Trades hoy "+hoyT.length+"/2 · SL hoy "+slHoy+"\n";
    s+="  HOY: "+(diaPct>=0?"+":"")+r1(diaPct)+"%"+(ddDaily>0?(" · límite -"+ddDaily+"% · margen "+r1(margenDia)+"% "+sem(usadoDia,ddDaily)):"")+"\n";
    s+="  TOTAL: "+(st.progresoPct>=0?"+":"")+r1(st.progresoPct)+"%"+(ddMax>0?(" · DD máx -"+ddMax+"% ("+(c.ddTipo||"?")+") · margen "+r1(margenTot)+"% "+sem(usadoTot,ddMax)):"")+"\n";
    const av=[];
    if(hoyT.length>=2) av.push("⚠️ YA lleva 2 trades hoy (regla: parar).");
    if(slHoy>=2) av.push("🔴 2 SL hoy → REGLA: cerrar plataforma hasta mañana.");
    if(ddDaily>0 && margenDia!=null && margenDia<=ddDaily*0.3) av.push("🔔 Cerca del límite DIARIO (queda "+r1(margenDia)+"%): NO respaldes más entradas hoy.");
    if(ddMax>0 && margenTot!=null && margenTot<=ddMax*0.3) av.push("🔴 Cerca del DD MÁXIMO (queda "+r1(margenTot)+"%): protégela, para o baja riesgo.");
    if(av.length) s+="  "+av.join(" ")+"\n";
  });
  s+="REGLA: si ves 🟡/🔔, avísaselo y frena las entradas nuevas de hoy; si ves 🔴, EXÍGELE cerrar/parar en la 1ª línea. Antes de respaldar CUALQUIER entrada, comprueba que cabe en el margen diario. La disciplina va PRIMERO.]";
  return s;
}
/* 🛡️ GUARDIÁN PROACTIVO — resumen compacto del PELIGRO de cada cuenta REAL (no demo),
   para sincronizar a la nube y que te avise (app cerrada) al acercarte al límite. */
function riesgoResumen(){
  const cuentas=(Array.isArray(CUENTAS)?CUENTAS:[]).filter(c=>c.fase!=="Cerrada" && !/Demo/i.test(c.fase||""));
  const hoy=hoyISO();
  const nivel=(usado,limite)=>{ if(!(limite>0)) return 0; const fl=(limite-usado)/limite; if(fl<=0) return 3; if(fl<=0.3) return 2; if(fl<=0.5) return 1; return 0; };
  const out=[];
  cuentas.forEach(c=>{
    const st=statsCuenta(c);
    const riesgoPct=+c.riesgoPct||0.5;
    const hoyT=TRADES.filter(t=>t.cuenta===c.id && t.fecha===hoy && !t.abierta && t.modo==="real");
    const rHoy=hoyT.reduce((a,t)=>a+(parseFloat(t.r)||0),0);
    const diaPct=rHoy*riesgoPct;
    const ddDaily=+c.ddDailyPct||0, ddMax=+c.ddMaxPct||0;
    const usadoDia=diaPct<0?Math.abs(diaPct):0;
    const usadoTot=st.progresoPct<0?Math.abs(st.progresoPct):0;
    const margenDia=ddDaily>0?Math.max(0,ddDaily-usadoDia):null;
    const margenTot=ddMax>0?Math.max(0,ddMax-usadoTot):null;
    const peor=Math.max(ddDaily>0?nivel(usadoDia,ddDaily):0, ddMax>0?nivel(usadoTot,ddMax):0);
    out.push({ alias:(c.alias||c.firma||"Cuenta"), peor, mDia:margenDia!=null?+r1(margenDia):null, mTot:margenTot!=null?+r1(margenTot):null });
  });
  return out;
}
/* Sincroniza a la nube el estado de riesgo (para el aviso proactivo con la app cerrada). */
function syncRiesgo(){
  try{
    const r=riesgoResumen();
    if(typeof nubeUrl==="function") fetch(nubeUrl()+"/riesgo",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({cuentas:r})}).catch(()=>{});
  }catch(_){}
}
/* 🚑 MODO RECUPERACIÓN + 🛑 FRENO DEL DÍA — se calculan de las cuentas REALES y los trades de hoy.
   Recuperación = cuenta muy tocada (>50% del DD usado): ultra-conservador + celebrar el ascenso.
   Freno del día = 2+ SL hoy o límite diario tocado: se acabó el día, cerrar plataforma (anti-revancha). */
function estadoRecuperacionFreno(){
  const cuentas=(Array.isArray(CUENTAS)?CUENTAS:[]).filter(c=>c.fase!=="Cerrada" && !/Demo/i.test(c.fase||""));
  if(!cuentas.length) return { block:"", frenoActivo:false, recupActivo:false, frenos:[], recup:[] };
  const hoy=hoyISO(); const recup=[]; const frenos=[];
  cuentas.forEach(c=>{
    const st=statsCuenta(c);
    const riesgoPct=+c.riesgoPct||0.5;
    const hoyT=TRADES.filter(t=>t.cuenta===c.id && t.fecha===hoy && !t.abierta && t.modo==="real");
    const slHoy=hoyT.filter(t=>(parseFloat(t.r)||0)<0).length;
    const rHoy=hoyT.reduce((a,t)=>a+(parseFloat(t.r)||0),0);
    const diaPct=rHoy*riesgoPct;
    const ddDaily=+c.ddDailyPct||0, ddMax=+c.ddMaxPct||0;
    const usadoDia=diaPct<0?Math.abs(diaPct):0;
    const usadoTot=st.progresoPct<0?Math.abs(st.progresoPct):0;
    const alias=(c.alias||c.firma||"Cuenta");
    if(ddMax>0 && usadoTot>=ddMax*0.5) recup.push({alias, progresoPct:st.progresoPct});
    if(slHoy>=2 || (ddDaily>0 && usadoDia>=ddDaily)) frenos.push({alias, motivo:(slHoy>=2?(slHoy+" SL hoy"):"límite diario tocado")});
  });
  let block="";
  if(frenos.length) block+="[🛑 FRENO DEL DÍA ACTIVO en: "+frenos.map(f=>f.alias+" ("+f.motivo+")").join(", ")+". REGLA INQUEBRANTABLE: se acabó el día de trading en esa(s) cuenta(s). Dile en la 1ª línea que CIERRE LA PLATAFORMA hasta mañana. NO respaldes NINGUNA entrada más hoy, por buena que parezca — es para que no reviente la cuenta por revancha. Reconócele la disciplina de parar.]\n";
  if(recup.length) block+="[🚑 MODO RECUPERACIÓN ACTIVO en: "+recup.map(r=>r.alias+" ("+r1(r.progresoPct)+"%)").join(", ")+". Esta(s) cuenta(s) van muy tocadas (>50% del DD usado). MODO ULTRA-CONSERVADOR: SOLO setups A+ (nada de B ni dudosos), riesgo REDUCIDO (la mitad de lo normal), MÁX 1 entrada al día, solo en killzone y a favor del sesgo. El objetivo NO es recuperar rápido — es SOBREVIVIR y subir despacio; celebra cada peldaño de vuelta a terreno seguro. Recuperar se hace con paciencia, no forzando.]\n";
  return { block, frenoActivo:frenos.length>0, recupActivo:recup.length>0, frenos, recup };
}
/* Al tocar la notificación del guardián, Roberto revisa el riesgo y te frena. */
function revisarRiesgo(){
  if(typeof abrirIA==="function") abrirIA();
  iaTemaChat("🛡️ Guardián de riesgo");
  setTimeout(()=>iaEnviar("🛡️ Revisemos el riesgo de mis cuentas ahora.",
    "Rey abrió esto desde un AVISO del Guardián de Riesgo. Con el bloque [🛡️ GUARDIÁN DE RIESGO] del contexto: dile CLARO en la 1ª línea cuál cuenta está en peligro y cuánto margen le queda (diario y total), y qué hacer YA para PROTEGERLA (parar, cerrar plataforma, no operar hoy). Recuérdale que proteger el capital va ANTES que cualquier operación y que recuperar se hace SOBREVIVIENDO, no forzando. Breve, firme, honesto."),250);
}

function viewCuentas(){
  const v=el("div","view"); v.id="v-cuentas";
  const head=el("div","card");
  head.innerHTML=`<div class="card-h"><span class="ic">🏦</span><h2>Mis cuentas</h2></div>
    <p class="desc">Registra tus exámenes, cuentas fondeadas y reales con sus reglas y su avance. Liga cada trade a su cuenta en el Diario y aquí verás su rendimiento. Roberto ve todo esto para ayudarte a gestionarlas y escalar.</p>
    <div id="cuentasResumen"></div>
    <button class="btn green" id="btnNuevaCuenta" style="margin-top:6px">➕ Nueva cuenta</button>
    <button class="btn" id="btnPlanComp" style="margin-top:6px">📈 Plan de interés compuesto (con Roberto)</button>`;
  v.appendChild(head);
  const body=el("div"); body.id="cuentasBody"; v.appendChild(body);
  return v;
}

function refrescarCuentas(){ renderCuentas(); pintarSelCuentaTrade(); }

function renderCuentas(){
  const bn=$("#btnNuevaCuenta"); if(bn) bn.onclick=()=>cuentaModal(null);
  const bp=$("#btnPlanComp"); if(bp) bp.onclick=planCompuesto;
  const res=$("#cuentasResumen");
  const body=$("#cuentasBody"); if(!body) return; body.innerHTML="";

  if(!CUENTAS.length){
    if(res) res.innerHTML="";
    body.appendChild(el("div","card",
      `<div class="empty"><div class="t">Aún no tienes cuentas</div>
       <div class="s">Crea tu primera cuenta de fondeo con el botón de arriba. Podrás registrar su capital, reglas, avance y ligarle tus operaciones.</div></div>`));
    return;
  }

  /* Resumen general */
  const activas=CUENTAS.filter(c=>c.fase!=="Cerrada");
  const capTotal=activas.reduce((a,c)=>a+(+c.capital||0),0);
  const nFond=activas.filter(c=>/Fondeada|Real/.test(c.fase)).length;
  const nExam=activas.filter(c=>/Examen/.test(c.fase)).length;
  const firmas=[...new Set(activas.map(c=>c.firma).filter(Boolean))];
  const est=(typeof estadoRecuperacionFreno==="function")?estadoRecuperacionFreno():{frenoActivo:false,recupActivo:false,frenos:[],recup:[]};
  let banner="";
  if(est.frenoActivo) banner+=`<div class="card alert" style="border-color:var(--red);margin-bottom:10px"><b style="color:var(--red)">🛑 FRENO DEL DÍA</b><br><span style="font-size:13.5px;color:var(--txt2)">Se acabó el trading de hoy en: ${esc(est.frenos.map(f=>f.alias+" ("+f.motivo+")").join(", "))}. Cierra la plataforma hasta mañana — proteger la cuenta va primero, no operes por revancha.</span></div>`;
  if(est.recupActivo) banner+=`<div class="card" style="border-color:var(--gold);margin-bottom:10px"><b style="color:var(--gold)">🚑 Modo Recuperación</b><br><span style="font-size:13.5px;color:var(--txt2)">${esc(est.recup.map(r=>r.alias).join(", "))} muy tocada(s): solo A+, riesgo a la mitad, máx 1 trade/día, solo en killzone. Sobrevivir y subir despacio.</span></div>`;
  if(res) res.innerHTML=banner+`<div class="stats" style="margin-bottom:12px">
    <div class="st"><div class="v">${activas.length}</div><div class="k">Cuentas</div></div>
    <div class="st"><div class="v b">$${r0(capTotal)}</div><div class="k">Capital gestionado</div></div>
    <div class="st"><div class="v g">${nFond}</div><div class="k">Fondeadas/reales</div></div>
   </div>
   <div class="note" style="text-align:left;margin:0 0 6px">${nExam} en examen · Diversificación: <b>${firmas.length}</b> firma${firmas.length!==1?"s":""}${firmas.length?" ("+esc(firmas.join(", "))+")":""}. ${firmas.length<2&&activas.length>1?"⚠️ Estás concentrado en una sola firma — considera diversificar.":""}</div>`;

  /* Agrupadas por fase */
  FASES.forEach(fase=>{
    const grupo=CUENTAS.filter(c=>c.fase===fase);
    if(!grupo.length) return;
    body.appendChild(el("div","fl",fase.toUpperCase()+" · "+grupo.length));
    grupo.forEach(c=>body.appendChild(tarjetaCuenta(c)));
  });
}

function tarjetaCuenta(c){
  const st=statsCuenta(c);
  const card=el("div","card");
  const col=faseColor(c.fase);
  const plCls=st.pl>0?"g":st.pl<0?"r":"n";
  /* Barra de progreso hacia el target */
  let barra="";
  if(st.target>0){
    const fillPct=Math.max(0,Math.min(100, st.progresoPct/st.target*100));
    const barCol=st.progresoPct>=st.target?"var(--green)":st.progresoPct<0?"var(--red)":"var(--gold)";
    barra=`<div class="fl" style="margin:10px 0 4px">Progreso al objetivo: ${r1(st.progresoPct)}% / ${r1(st.target)}%</div>
      <div class="bar"><i style="width:${fillPct}%;background:${barCol}"></i></div>`;
  }
  /* Estado claro: vas +X% o -X%, con margen hasta el límite de pérdida (DD) */
  let estado="";
  if(st.cap>0){
    const ddMax=+c.ddMaxPct||0;
    const pctTxt=(st.progresoPct>=0?"+":"")+r1(st.progresoPct)+"%";
    if(st.progresoPct>=0){
      const falta = st.target>0 ? Math.max(0, st.target-st.progresoPct) : 0;
      estado=`<div class="diag ok" style="padding:11px 13px;margin:8px 0 2px"><div class="dd" style="color:var(--green)">🟢 Vas <b>${pctTxt}</b>${st.target>0?(st.progresoPct>=st.target?` · ¡objetivo del ${r1(st.target)}% cumplido!`:` · faltan <b>${r1(falta)}%</b> para el objetivo (${r1(st.target)}%)`):""}.</div></div>`;
    }else{
      const perdida=Math.abs(st.progresoPct);
      const margen = ddMax>0 ? Math.max(0, ddMax-perdida) : 0;
      const peligro = ddMax>0 && margen<=ddMax*0.3;
      estado=`<div class="diag ${peligro?"bad":"warn"}" style="padding:11px 13px;margin:8px 0 2px"><div class="dd" style="color:${peligro?"var(--red)":"var(--orange)"}">${peligro?"🔴":"🟠"} Vas <b>${pctTxt}</b>${ddMax>0?` · te queda <b>${r1(margen)}%</b> hasta el límite de pérdida (DD ${ddMax}%)${peligro?" — ¡cuidado!":""}`:""}.</div></div>`;
    }
  }
  /* Reglas resumidas */
  const reglas=[];
  if(c.ddMaxPct) reglas.push(`DD máx ${c.ddMaxPct}%${c.ddTipo?" ("+c.ddTipo+")":""}`);
  if(c.ddDailyPct) reglas.push(`Daily ${c.ddDailyPct}%`);
  if(c.diasMin) reglas.push(`${c.diasMin} días mín`);
  if(c.splitPct) reglas.push(`Split ${c.splitPct}%`);
  if(c.precio) reglas.push(`Reto $${r0(+c.precio)}`);
  /* Trades ligados */
  let ligados="";
  if(st.m) ligados=`<div class="row"><div class="l">Operaciones ligadas<small>${st.m.n} trade${st.m.n!==1?"s":""} · WR ${pct(st.m.wr*100)} · PF ${fmtPF(st.m.pf)}</small></div>
    <div class="r ${st.m.rNeto>=0?"":"red"}">${st.m.rNeto>=0?"+":""}${r1(st.m.rNeto)}R</div></div>`;
  else ligados=`<div class="note" style="text-align:left">Sin trades ligados aún. Al registrar en el Diario, elige esta cuenta.</div>`;
  /* Payouts / interés compuesto */
  const comp=[];
  if(c.retiros) comp.push(`Retirado: $${r0(+c.retiros)}`);
  if(c.reinvertido) comp.push(`Reinvertido: $${r0(+c.reinvertido)}`);
  if(c.proxPayout) comp.push(`Próx. payout: ${esc(c.proxPayout)}`);
  if(c.metaEscalado) comp.push(`Meta: ${esc(c.metaEscalado)}`);

  card.style.borderColor=col;
  card.innerHTML=`<div class="card-h" style="justify-content:space-between">
      <div><span style="font-size:18px;font-weight:700">${esc(c.alias||c.firma||"Cuenta")}</span>
        <div style="font-size:13px;color:var(--txt3);margin-top:2px">${esc(c.firma||"")}${c.perfil?" · "+esc(c.perfil):""}</div></div>
      ${faseBadge(c.fase)}
    </div>
    <div class="stats" style="margin-top:6px">
      <div class="st"><div class="v n">$${r0(st.balance)}</div><div class="k">Balance ${st.manual?"":"(est.)"}</div></div>
      <div class="st"><div class="v ${plCls}">${st.pl>=0?"+":"-"}$${r0(Math.abs(st.pl))}</div><div class="k">P&amp;L</div></div>
      <div class="st"><div class="v b">$${r0(st.cap)}</div><div class="k">Capital</div></div>
    </div>
    ${barra}
    ${estado}
    ${reglas.length?`<div class="note" style="text-align:left;margin:10px 0 4px">📋 ${reglas.join(" · ")}</div>`:""}
    ${ligados}
    ${comp.length?`<div class="note" style="text-align:left">💰 ${comp.join(" · ")}</div>`:""}
    ${c.nota?`<div class="trade-n">${esc(c.nota)}</div>`:""}
    <div class="trade-act">
      <button class="ta" data-ed="1">✏️ Editar</button>
      <button class="ta" data-av="1">⏭️ Avanzar fase</button>
      <button class="ta danger" data-del="1">🗑️ Borrar</button>
    </div>`;
  card.querySelector("[data-ed]").onclick=()=>cuentaModal(c.id);
  card.querySelector("[data-av]").onclick=()=>avanzarFase(c.id);
  card.querySelector("[data-del]").onclick=()=>borrarCuenta(c.id);
  return card;
}

function avanzarFase(id){
  const c=CUENTAS.find(x=>x.id===id); if(!c) return;
  if(FASES_SIN_AVANCE.includes(c.fase)){ toast(c.fase==="Demo"?"Una demo no avanza de fase":"El capital propio no avanza de fase"); return; }
  const chain=FASES.filter(f=>!FASES_SIN_AVANCE.includes(f)); // Examen F1→F2→Fondeada→Real
  const i=chain.indexOf(c.fase);
  if(i<0 || i>=chain.length-1){ toast("Ya está en la fase final"); return; }
  if(!confirm(`¿Pasar "${c.alias||c.firma}" de ${c.fase} a ${chain[i+1]}?`)) return;
  c.fase=chain[i+1]; guardarCuentas(); refrescarCuentas(); toast("Fase actualizada ✓");
  robertoVigila("Avanzó de fase la cuenta "+(c.alias||c.firma)+": ahora en "+c.fase+".");
}
function borrarCuenta(id){
  const c=CUENTAS.find(x=>x.id===id); if(!c) return;
  const nT=TRADES.filter(t=>t.cuenta===id).length;
  if(!confirm(`¿Borrar la cuenta "${c.alias||c.firma}"?`+(nT?` Sus ${nT} trades NO se borran, solo quedan sin cuenta.`:""))) return;
  CUENTAS=CUENTAS.filter(x=>x.id!==id); guardarCuentas(); refrescarCuentas(); toast("Cuenta borrada");
}

/* Formulario de alta/edición (modal) */
function cuentaModal(id){
  const c = id ? CUENTAS.find(x=>x.id===id) : {};
  const val=(k,d="")=>c[k]!==undefined&&c[k]!==null?esc(c[k]):d;
  const opt=(arr,sel)=>arr.map(x=>`<option${x===sel?" selected":""}>${esc(x)}</option>`).join("");
  const html=`<div class="ayuda"><h3>${id?"Editar cuenta":"Nueva cuenta"}</h3></div>
    <div class="fl">Alias (cómo la llamas)</div>
    <input class="inp" id="ac_alias" placeholder="Ej: FTMO 100K #1" value="${val("alias")}" style="margin-bottom:12px">
    <div class="g2">
      <div><div class="fl">Firma</div><input class="inp" id="ac_firma" list="ac_firmas" placeholder="FTMO..." value="${val("firma")}">
        <datalist id="ac_firmas">${FIRMAS_SUG.map(f=>`<option value="${f}">`).join("")}</datalist></div>
      <div><div class="fl">Fase</div><select class="inp" id="ac_fase">${opt(FASES, c.fase||"Examen F1")}</select></div>
    </div>
    <button class="btn gold" id="ac_iaFill" style="margin:2px 0 6px">🤖 Traer reglas con Roberto</button>
    <div class="note" id="ac_iaStatus" style="text-align:left;margin:0 0 12px">Escribe la firma (ej. FTMO) y sus reglas se rellenan solas. O pulsa el botón para que Roberto traiga las exactas. Tú solo pon el capital y el alias, y revisa.</div>
    <div class="g2">
      <div><div class="fl">Capital ($)</div><input class="inp" id="ac_capital" inputmode="decimal" placeholder="100000" value="${val("capital")}"></div>
      <div><div class="fl">Riesgo por trade (%)</div><input class="inp" id="ac_riesgo" inputmode="decimal" placeholder="0.5" value="${val("riesgoPct","0.5")}"></div>
    </div>
    <div class="fl" style="color:var(--gold);margin-top:6px">Reglas de la firma</div>
    <div class="g2">
      <div><div class="fl">Drawdown máx (%)</div><input class="inp" id="ac_ddmax" inputmode="decimal" placeholder="10" value="${val("ddMaxPct")}"></div>
      <div><div class="fl">Tipo de DD</div><select class="inp" id="ac_ddtipo">${opt(["Estático","Trailing"], c.ddTipo||"Estático")}</select></div>
    </div>
    <div class="g2">
      <div><div class="fl">Daily drawdown (%)</div><input class="inp" id="ac_dddaily" inputmode="decimal" placeholder="5" value="${val("ddDailyPct")}"></div>
      <div><div class="fl">Profit target (%)</div><input class="inp" id="ac_target" inputmode="decimal" placeholder="10" value="${val("targetPct")}"></div>
    </div>
    <div class="g3">
      <div><div class="fl">Días mín.</div><input class="inp" id="ac_diasmin" inputmode="numeric" placeholder="4" value="${val("diasMin")}"></div>
      <div><div class="fl">Precio reto ($)</div><input class="inp" id="ac_precio" inputmode="decimal" placeholder="540" value="${val("precio")}"></div>
      <div><div class="fl">Split (%)</div><input class="inp" id="ac_split" inputmode="decimal" placeholder="80" value="${val("splitPct")}"></div>
    </div>
    <div class="fl" style="color:var(--gold);margin-top:6px">Rendimiento</div>
    <div class="fld"><div class="fl">Balance actual ($) — vacío = se calcula con tus trades</div>
      <input class="inp" id="ac_balance" inputmode="decimal" placeholder="(automático)" value="${val("balance")}"></div>
    <div class="fl" style="color:var(--gold)">Interés compuesto / payouts</div>
    <div class="g2">
      <div><div class="fl">Retirado ($)</div><input class="inp" id="ac_retiros" inputmode="decimal" placeholder="0" value="${val("retiros")}"></div>
      <div><div class="fl">Reinvertido ($)</div><input class="inp" id="ac_reinv" inputmode="decimal" placeholder="0" value="${val("reinvertido")}"></div>
    </div>
    <div class="g2">
      <div><div class="fl">Próximo payout</div><input class="inp" id="ac_payout" placeholder="Ej: 15 sep" value="${val("proxPayout")}"></div>
      <div><div class="fl">Meta de escalado</div><input class="inp" id="ac_meta" placeholder="Ej: llegar a 200K" value="${val("metaEscalado")}"></div>
    </div>
    <div class="fl" style="color:var(--gold)">Notas y gestión</div>
    <div class="fld"><div class="fl">Perfil de la cuenta</div>
      <select class="inp" id="ac_perfil">${opt(["Normal","Conservadora","Agresiva"], c.perfil||"Normal")}</select></div>
    <div class="fld"><div class="fl">Nota / cómo tratarla / estado</div>
      <textarea class="inp" id="ac_nota" placeholder="Ej: cuenta clave, ir conservador; no romper daily; ...">${val("nota")}</textarea></div>`;
  abrirModal(html, [
    { t:"💾 Guardar", cls:"gold", fn:()=>guardarCuentaForm(id) },
    { t:"Cancelar", fn:cerrarModal }
  ]);
  const fi=$("#ac_firma"); if(fi) fi.addEventListener("change",aplicarPresetFirma);
  const ff=$("#ac_fase"); if(ff) ff.addEventListener("change",aplicarPresetFirma);
  const cp=$("#ac_capital"); if(cp) cp.addEventListener("input",aplicarPresetFirma);
  const pr=$("#ac_precio"); if(pr) pr.addEventListener("input",()=>{ pr.dataset.manual="1"; });
  const dt=$("#ac_ddtipo"); if(dt) dt.addEventListener("change",()=>{ dt.dataset.tocado="1"; });
  const bf=$("#ac_iaFill"); if(bf) bf.onclick=rellenarReglasIA;
}
function guardarCuentaForm(id){
  const g=(i)=>{ const e=$("#"+i); return e?e.value.trim():""; };
  const alias=g("ac_alias"), firma=g("ac_firma");
  if(!alias && !firma){ toast("Ponle al menos un alias o la firma"); return; }
  const datos={
    alias, firma, fase:g("ac_fase")||"Examen F1",
    capital:g("ac_capital"), riesgoPct:g("ac_riesgo")||"0.5",
    ddMaxPct:g("ac_ddmax"), ddTipo:g("ac_ddtipo"), ddDailyPct:g("ac_dddaily"),
    targetPct:g("ac_target"), diasMin:g("ac_diasmin"), precio:g("ac_precio"), splitPct:g("ac_split"),
    balance:g("ac_balance"), retiros:g("ac_retiros"), reinvertido:g("ac_reinv"),
    proxPayout:g("ac_payout"), metaEscalado:g("ac_meta"),
    perfil:g("ac_perfil"), nota:g("ac_nota")
  };
  if(id){
    const c=CUENTAS.find(x=>x.id===id);
    if(c) Object.assign(c,datos);
    toast("Cuenta actualizada ✓");
  }else{
    CUENTAS.push(Object.assign({ id:"cta"+Date.now()+Math.floor(Math.random()*1000), creada:Date.now() }, datos));
    toast("Cuenta creada ✓");
  }
  guardarCuentas(); cerrarModal(); refrescarCuentas();
  robertoVigila((id?"Editó":"Creó")+" una CUENTA de fondeo: "+(alias||firma)+" · firma "+(firma||"?")+", fase "+datos.fase+", capital "+(datos.capital||"?")+", riesgo "+datos.riesgoPct+"%, DD máx "+(datos.ddMaxPct||"?")+"% ("+(datos.ddTipo||"?")+"), daily "+(datos.ddDailyPct||"?")+"%, target "+(datos.targetPct||"?")+"%.");
}

/* Resumen de cuentas para Roberto (acceso total) */
function iaCuentas(){
  if(!CUENTAS.length) return "\n[CUENTAS DE FONDEO de Rey: en este momento hay 0 cuentas guardadas en Apex. IMPORTANTE: NO digas 'no me llegó el bloque de cuentas' — el bloque SÍ te llegó, y dice que no hay ninguna registrada. Si Rey te habla de sus cuentas, dile con naturalidad que aún NO las ves registradas en Apex y ofrécete a registrarlas TÚ con tu mano crear_cuenta (pídele firma, capital, fase y el % o monto de pérdida actual de cada una, y créalas con tu tarjeta de confirmación). Nunca le pidas que 'busque el dato él'.]\n";
  let s="\n[CUENTAS de Rey (pueden ser de FONDEO/examen, CAPITAL PROPIO/real, o DEMO de práctica) — tienes acceso total; trátalas por SEPARADO, cada una con las reglas de SU firma y su clasificación. Ayúdalo a gestionarlas, protegerlas y escalar]:\n";
  CUENTAS.forEach(c=>{
    const st=statsCuenta(c);
    s+=`· ${c.alias||c.firma||"Cuenta"} (${c.firma||"?"}, ${c.fase}): capital $${r0(st.cap)}, balance ~$${r0(st.balance)} (P&L ${st.pl>=0?"+":""}$${r0(st.pl)}, ${r1(st.progresoPct)}% de ${c.targetPct||"?"}% objetivo). DD máx ${c.ddMaxPct||"?"}%${c.ddTipo?" "+c.ddTipo:""}, daily ${c.ddDailyPct||"?"}%, riesgo ${c.riesgoPct||"?"}%/trade.`;
    const ddMax=+c.ddMaxPct||0;
    if(st.progresoPct<0 && ddMax>0){ const margen=Math.max(0,ddMax-Math.abs(st.progresoPct)); s+=` [VA EN NEGATIVO ${r1(st.progresoPct)}%, le quedan ${r1(margen)}% hasta romper el DD${margen<=ddMax*0.3?" — PELIGRO, protégela":""}]`; }
    else if(st.target>0 && st.progresoPct>=st.target){ s+=` [OBJETIVO CUMPLIDO, cuida de no romper reglas]`; }
    else if(st.target>0){ s+=` [va +${r1(st.progresoPct)}%, falta ${r1(Math.max(0,st.target-st.progresoPct))}% al objetivo]`; }
    if(st.m) s+=` Trades ligados: ${st.m.n}, WR ${pct(st.m.wr*100)}, net ${r1(st.m.rNeto)}R, exp ${r2(st.m.exp)}R.`;
    if(c.retiros) s+=` Retirado $${r0(+c.retiros)}.`;
    if(c.metaEscalado) s+=` Meta: ${c.metaEscalado}.`;
    if(c.perfil) s+=` Perfil ${c.perfil}.`;
    if(c.nota) s+=` Nota: ${c.nota}.`;
    s+="\n";
  });
  const firmas=[...new Set(CUENTAS.map(c=>c.firma).filter(Boolean))];
  s+=`Diversificación: ${firmas.length} firma(s)${firmas.length?" ("+firmas.join(", ")+")":""}.`;
  if(firmas.length<2 && CUENTAS.length>1) s+=" OJO: todo en una sola firma, recuérdale diversificar.";
  return s+"\n";
}

/* ============================================================
   MENTOR IA — botón flotante + chat con Claude (vía tu puente)
   Con MEMORIA (conversaciones guardadas) + CONOCIMIENTO PROFUNDO
   de la estrategia de Rey y de su indicador CRT Elite.
   ============================================================ */
const IA_URL_DEFAULT = "https://elitepro-worker.reiniercainet9.workers.dev";

/* --- PERSONALIDAD + REGLAS DE COMPORTAMIENTO DEL MENTOR --- */
const IA_SYSTEM_BASE = ""; // 🧠 El CEREBRO de Roberto vive ahora en la NUBE (worker KV roberto:brain), fuera del código público. Recuperable con GET /brain.

/* Perfil fijo de Rey (lo que yo ya sé de él de tanto trabajar juntos) */
const PERFIL_REY =
"PERFIL DEL ALUMNO (Rey / Reinier):\n"+
"- Trader de Forex/mercados. Los PARES que sigue AHORA te llegan en el contexto de cada mensaje (son configurables y pueden cambiar: hoy pueden ser EUR/USD y GBP/USD, mañana oro (XAU/USD) u otros). Adáptate a los pares que te indique el contexto, no asumas siempre los mismos.\n"+
"- Estructura de temporalidades: Daily = bias/dirección; H4 = zonas (el DÓNDE); 1H y 15M = validación, sweep + MSS (el CUÁNDO); 5M y 3M = gatillo fino de entrada (el punto EXACTO, NO se valida aquí). El bias SEMANAL manda sobre el diario.\n"+
"- Vive en Brasil, zona horaria UTC−3 FIJA (Brasil no tiene horario de verano). Sus killzones están en hora de Nueva York. DESFASE EXACTO Brasil↔NY: Nueva York es UTC−5 en invierno (EST, ~nov a mar) y UTC−4 en verano (EDT, ~mar a nov). Por tanto Brasil va 2 horas ADELANTE de NY en invierno y 1 hora ADELANTE en verano. Para pasar una hora de NY a hora de Brasil: en invierno súmale 2h, en verano súmale 1h. Ejemplo: Pre-NY Killzone 7:30–9:30 AM NY = en verano 8:30–10:30 hora Brasil, en invierno 9:30–11:30 hora Brasil. El indicador ya maneja el cambio EST/EDT automáticamente; la fila 'Killzone' del panel (Dentro/Fuera) es la fuente de verdad — si dice Fuera, no se opera aunque el setup se vea bien.\n"+
"- Cuentas: tiene cuentas fondeadas de $6K y está por comprar 5 cuentas de reto/fondeo más para hacer los exámenes. Objetivo inmediato: pasar esos challenges y no romper reglas. Riesgo FIJO 0.5% por trade.\n"+
"- Su mayor debilidad histórica, reconocida por él mismo: TIMING PREMATURO — su dirección suele ser correcta, pero entra ANTES de que la trampa se liquide y se confirme. Trabájasela siempre.\n"+
"- No sabe programar. La app Apex (esta, antes llamada CRT Elite) es su diario, backtester, calculadora de lotaje, gestor de cuentas de fondeo y mentor de bolsillo (tú).\n"+
"- Rey puede escribirte O HABLARTE por voz (micrófono). Cuando te habla, su mensaje llega transcrito y puede traer pequeños errores de dictado o palabras pegadas: interpreta con sentido común, no le corrijas la ortografía y responde a lo que quiso decir. Eres su mentor Y su amigo de confianza: cercano, directo y humano.";

/* Dossier del indicador CRT Elite que construimos juntos en TradingView */
const INDICADOR_DOSSIER =
"SU INDICADOR — 'CRT Elite v3' (Pine v5, en TradingView; versión de trabajo v3.6 'modelo continuación', 26-08-2026). Lo construimos juntos. Debes conocerlo como la palma de tu mano:\n"+
"- 🆕 EVOLUCIÓN RECIENTE (26/27-08-2026) — cambios que DEBES tener presentes al analizar o vetar:\n"+
"  · 🔓 CANDADO H4 VIVO (v3.3): el ⚠️H4≠ que capaba el grado en C ahora se LEVANTA cuando el H4 en curso ya barrió su liquidez y recuperó a favor (fila CRT H4 en ✅ o ▶️) — en reversiones en V la vela H4 cerrada llega tarde y ya no castiga. El panel muestra '🔓H4vivo'.\n"+
"  · ⚡ P/D RANGO OPERATIVO VIVO (v3.4): si el período de referencia ya SALIÓ de su rango previo (barrido abajo, ruptura arriba o ambos) y su rango vivo mide ≥40% del previo, el Premium/Discount se mide sobre el rango VIVO del propio período (mín/máx en curso) — el panel marca ⚡. Además el rango de referencia puede ser 4H (sus 2 TF de contexto CRT: D y H4, mismas reglas).\n"+
"  · 🪞 PANEL VERAZ (v3.5): las filas Secuencia F3 y CRT H4 comparan contra el sesgo OPERATIVO (no el diario) — en días de diario neutro con giro estructural ya no dicen 'sin sesgo'.\n"+
"  · 🏃 MODELO DE CONTINUACIÓN (v3.6): el 🔔 tiene 2 caminos — REVERSIÓN (sweep+MSS+zona, el clásico) y CONTINUACIÓN (día virado + retroceso ≥30% del rango vivo + reacción FVG/OB + killzone + 15m a favor). La señal lleva la línea 'Modelo:' y el panel marca 🏃. En continuación, la zona P/D del rango viejo NO es objeción.\n"+
"  · 🔕 UNA SOLA ALARMA por par ('Cualquier función alert()' con webhook) cubre AHORA TODO el indicador — ⏰ pinchazo y ⛔ invalidación incluidos (antes quedaban fuera).\n"+
"  · 📅 VETO DE NOTICIAS del Ejecutor: ±15 minutos (Rey lo bajó de 30 el 26-08; configurable en el panel 🤖).\n"+
"- UN SOLO SESGO EFECTIVO manda todo el indicador (htfBull/htfBear): de él cuelgan TODAS las señales, alarmas, objetivos, colores del rango CRT y filas del panel.\n"+
"- BIAS DIARIO (CRT): se lee de la vela diaria de AYER ya cerrada y se sostiene todo el día por diseño CRT. Solo la liquidez de nivel DIARIO puede voltearlo (no un barrido de 4H ni de 15m). Si falta liquidez arriba → alcista; abajo → bajista; ambas intactas → rango (esperar).\n"+
"- MOTOR DE GIRO (giro intradía): para voltear el día necesita 3 patas: (1) barrido+reclaim del extremo diario previo O cierre de cuerpo más allá de él; (2) CHoCH + displacement en 15m (el cambio de estructura con vela impulsiva); (3) que el precio siga más allá (si vuelve al rango, el giro se ANULA). Con 'giroSoloDiario' ON, solo un barrido de nivel diario dispara el giro del día.\n"+
"- GIRO ESTRUCTURAL (v11): si el día NO toma ningún extremo diario pero H4 y 15M se alinean a una nueva dirección, ESA pasa a ser el sesgo operativo (el panel lo marca '🔄 estructural H4+15M, sin extremo diario') y todas las señales/alarmas pasan a favor de esa dirección. Un giro diario CONFIRMADO siempre manda sobre el estructural.\n"+
"- CANDADO 15M (anti-señal-vieja): NUNCA compra si la estructura de 15m ya hizo MSS bajista, NUNCA vende si hizo MSS alcista. Bloquea las confirmaciones 'a favor' que quedaron viejas cuando el día ya giró por dentro. Es la respuesta directa a su queja recurrente 'cambió a bajista y me seguía dando alcista'.\n"+
"- FILA 'Secuencia F3' del panel: muestra 1.Sweep ✅  2.MSS 15m ✅  3.Zona ✅ → 'LISTO'; si el MSS de 15m va en contra, se pone en rojo 'no operar a favor'. Es su Fase 3 hecha semáforo.\n"+
"- FILA 'CRT H4': distingue entrada de REVERSIÓN (reclaim: barrió y recuperó liquidez mayor, verde lima) de CONTINUACIÓN (cuerpo rompió, ya se tomó la liquidez, aguamarina — no esperar reclaim).\n"+
"- PANEL: fila de Alineación de TFs (Semanal, D, H4, 1H, 15m, 5m). OJO cosmético: la D se compara contra sí misma, así que '1/6' significa que CERO temporalidades subordinadas acompañan al diario — explícaselo si pregunta.\n"+
"- DOS MOTORES DE CHoCH CONVIVEN Y A VECES NO COINCIDEN: el CHoCH DIBUJADO en el gráfico usa el método de 'leg' de LuxAlgo (sin filtro de displacement); el CHoCH que usa el GIRO usa pivotes + displacement en la misma vela. Por eso él puede VER en pantalla un CHoCH que el motor del giro no registra. Cuando pregunte '¿por qué no vio ese CHoCH?', esta es casi siempre la razón.\n"+
"- Dibuja zonas Premium (50−100%, ventas) / Equilibrio / Discount (0−50%, compras); killzone automática en hora NY (maneja solo el cambio EST/EDT); tiene calibración 'Auto por temporalidad' de pivote y tolerancia EQ por cada TF.\n"+
"- ALARMAS (~35 alertcondition + una super-alarma alert()). Las clave: ⏰ Aviso temprano / pinchazo D-4H-1H ('prepárate', a favor del sesgo); ✅ Confirmación ALCISTA/BAJISTA (al cierre); ⛔ Invalidación rota (bias en riesgo); 🔄 Giro estructural; 2️⃣ MSS 15m a favor; ✅ Secuencia F3 completa; filas CRT H4; ⭐ Confirmación PREMIUM. Todo lo demás es ruido.\n"+
"- REGLA CRÍTICA que debes recordarle SIEMPRE que hablen del indicador o de sus alarmas: TradingView CONGELA la versión del script en el momento de crear la alarma. Por eso, cada vez que pega/actualiza el indicador, DEBE BORRAR y VOLVER A CREAR todas las alarmas, en cada par (se crean en el gráfico de 5m). Si no lo hace, las alarmas viejas siguen disparando lógica antigua y contradictoria.";

/* Conocimiento AMPLIO de mercados: días y horarios de CADA mercado, para que
   Roberto nunca mande a operar con el mercado cerrado (p.ej. Forex en finde) y
   se adapte al mercado que Rey esté operando (hoy FX, mañana quizá otro). */
const MERCADOS_DOSSIER =
"CONOCIMIENTO DE MERCADOS — DÍAS Y HORARIOS (SIN LÍMITES): Rey opera AHORA Forex, pero esto NO es fijo (puede pasar a índices, oro, cripto…). Debes conocer a fondo CUÁNDO abre y cierra CADA mercado y adaptarte al que él opere. Antes de cualquier consejo de entrada o de decir 'ventana operativa', ten SIEMPRE presente el DÍA de la semana (te llega en el [Reloj EN VIVO]) y si ese mercado está ABIERTO. NUNCA le digas que puede operar ni que está en killzone si el mercado que opera está CERRADO.\n"+
"- FOREX (su mercado actual: EUR/USD, GBP/USD, etc.): abre DOMINGO ~17:00 NY y cierra VIERNES ~17:00 NY. SÁBADO todo el día y DOMINGO hasta las 17:00 NY = CERRADO (fin de semana): nada que operar, ninguna killzone. Sesiones dentro de la semana (hora NY): Asia/Sídney-Tokio (noche), Londres (~2:00–5:00), solape Londres–NY y Nueva York (~7:00–12:00) = las de más volumen, las que él usa. Si es sábado o domingo y pregunta '¿opero?', la respuesta honesta es NO: dile que descanse o haga backtest.\n"+
"- ORO (XAU/USD) y plata: horario tipo Forex/CME (dom 17:00 → vie 17:00 NY, con micro-pausa diaria ~17:00–18:00 NY). CERRADO el fin de semana.\n"+
"- ÍNDICES US (US30/Dow, NAS100, SP500) y ACCIONES USA: sesión regular 9:30–16:00 NY, lun–vie; pre-market 4:00–9:30 y after-hours 16:00–20:00; los FUTUROS corren casi 24h de domingo noche a viernes, pero CERRADO el fin de semana y en festivos de EE.UU. (que a veces acortan sesión).\n"+
"- CRIPTO (BTC, ETH…): 24/7, TODOS los días, también sábado y domingo — es el ÚNICO donde 'fin de semana' NO significa cerrado (aunque suele haber menos volumen). Si algún día Rey pasa a cripto, ahí sí puede operar el finde: adáptate.\n"+
"- REGLA: usa el día que te llega en el [Reloj EN VIVO]. Fin de semana en FX/oro/índices = cerrado, no lo mandes a operar; solo cripto opera el finde.";
/* Mapa COMPLETO de la app Apex: para que Roberto conozca su 'casa' entera y sepa
   a qué se refiere Rey cuando menciona Apex o cualquiera de sus secciones. */
const APEX_MAPA =
"TU CASA — LA APP 'APEX' (conócela COMPLETA): Tu hogar se llama APEX; es el centro de mando de trading de Rey y tú eres su cerebro. Vives DENTRO, no eres un chat externo. Cuando Rey mencione 'Apex' o cualquier sección ('lléname tal parte de Apex', 'apúntalo en…', 'ábreme…'), sabes EXACTAMENTE a qué se refiere. Secciones:\n"+
"1. 📰 Noticias — PRIMERA y lo primero del día: calendario económico real (ForexFactory) filtrado por sus pares + 'Parte del día' (ventana/mercado, noticias, cuentas) + botón '🚦 ¿Puedo operar AHORA?'.\n"+
"2. 💬 Roberto (tú) — el chat contigo, con voz (te habla o te escribe).\n"+
"3. ✅ Checklist — su secuencia operativa paso a paso antes de entrar.\n"+
"4. 🎯 Confluencias — sus 5 confluencias del método.\n"+
"5. 🗺️ Rutina / momentos del día.\n"+
"6. ⛔ Reglas — sus reglas inviolables.\n"+
"7. 💰 Riesgo — calculadora de lotaje (0.5% fijo).\n"+
"8. ⚡ Gatillo — arma la entrada fina en M5/M3.\n"+
"9. 📒 Diario — registro de sus operaciones.\n"+
"10. 🏦 Cuentas — sus cuentas de fondeo (capital, DD, fases).\n"+
"11. 📅 Almanaque — resultados por día.\n"+
"12. 📈 Análisis — estadísticas de su operativa.\n"+
"13. 🧠 Mentor — análisis automático.\n"+
"14. 📋 Plan — su plan operativo completo.\n"+
"15. ⏰ Avisos — recordatorios de rutina con push (días configurables).\n"+
"TUS MANOS ya tocan: avisos, pares, trades y cuentas (SIEMPRE con confirmación de Rey y registro en el 🗒️ Historial).\n"+
"TU SISTEMA COMPLETO: no vives solo en Apex; estás integrado a TODO el sistema de trading de Rey — su TradingView, su indicador CRT Elite, sus ALARMAS (te llegan por webhook y tú las interpretas) y Apex. Estás pendiente de lo que pasa en el conjunto para darle un servicio sin límites, apoyándote además en tu conexión a internet.\n"+
"TU ROL DE GUARDIÁN (avisos): Hay un GUARDIÁN DE VENTANAS en el servidor que ya avisa a Rey —con la app CERRADA y en hora NY exacta, correcto todo el año— cuando abre cada killzone (Londres 2:00, ⭐Pre-NY 7:30, NY 9:30, aviso NY-Lunch 11:30 NY). Por eso, los recordatorios MANUALES de killzone que Rey tenía en ⏰ Avisos con hora fija de Brasil (Pre-NY, NY apertura, NY-lunch) ahora SOBRAN y lo DUPLICAN: si Rey te lo pide (o si lo detectas), desactívalos tú con tus manos (editar_aviso con on:false) para no saturarlo, y confírmaselo. La sección ⏰ Avisos SIGUE siendo de Rey para sus recordatorios PERSONALES, totalmente configurables (día/hora/tono): esos no los toques salvo que él lo pida.\n"+
"TU MISIÓN DE VIGILANTE (estar pendiente de TODO): tu trabajo es estar atento y avisarle de TODO lo importante que ocurra en su sistema: apertura de killzones, noticias rojas/naranjas cerca, alarmas de su indicador, y cuentas cerca del límite (DD). Y cuando estén CONECTADOS al gráfico en vivo (puente de lectura de TradingView), tu papel es AÚN MAYOR: irle cantando las CONFLUENCIAS que se van cumpliendo según el gráfico, el indicador y las alarmas —barrido de liquidez ✅, MSS de 15m ✅, zona premium/discount tocada, Secuencia F3 completa, killzone activa— para acompañarlo paso a paso mientras operan juntos, recordándole SIEMPRE su regla de oro: esperar la vela de confirmación cerrada, no entrar en el toque.";

const PUENTE_DOSSIER =
"👁️ TU VISTA EN VIVO DEL GRÁFICO (PUENTE APEX): Ya tienes OJOS sobre el gráfico real de Rey en TradingView. Cuando su PC está encendida con el 'Puente Apex' corriendo, en CADA mensaje recibes un bloque [👁️ GRÁFICO EN VIVO ...] con el símbolo, timeframe, precio, el dashboard COMPLETO del indicador CRT Elite (killzone, sesgo, estado del día, zona premium/discount, alineación de temporalidades, SMT, secuencia F3…), los niveles clave y las herramientas de posición (Long/Short) que Rey haya puesto con entrada/SL/TP/RR/riesgo. ESO ES REAL Y ACTUAL — úsalo como tu fuente de verdad del gráfico; no inventes ni contradigas esos números. "+
"Si el bloque dice que la PC NO está conectada (no hay lectura fresca), NO afirmes que ves el gráfico: dile con cariño que encienda la PC y abra el 'Puente Apex' (doble clic en 'Arrancar Puente Apex') para que puedas verlo en vivo. "+
"Cuando SÍ estés conectado y estén operando juntos, ve CANTÁNDOLE las confluencias que se cumplen según ese bloque (barrido de liquidez, MSS de 15m, zona tocada, Secuencia F3, killzone activa) y recuérdale SIEMPRE esperar la vela de confirmación cerrada, nunca entrar en el toque.\n"+
"✍️ CAPTURA DE ENTRADAS: cuando en el gráfico en vivo veas una herramienta de posición (Long/Short) que Rey acaba de poner y que NO aparezca en la lista de '[📒 ENTRADAS ABIERTAS ya registradas]', OFRÉCELE registrarla tú con la mano registrar_entrada (rellenas par, dirección, entrada, SL, TP, RR y riesgo leídos del gráfico + setup/ventana/momento/bias/zona según tu análisis), SIEMPRE con tu tarjeta de confirmación. Antes de registrar, valida/rectifica la entrada según sus reglas (¿hubo sweep? ¿zona correcta premium/discount? ¿killzone? ¿a favor del sesgo? ¿RR sano?) y adviértele si algo no cuadra. CIERRE: el gráfico NO te dice cómo cerró de verdad (puede ser BE, ganancia, pérdida o salida antes). Si una entrada que estaba como ABIERTA en el Diario YA NO aparece como posición en el gráfico en vivo, probablemente Rey la cerró: pregúntale a qué PRECIO cerró (o si tocó TP/SL/BE o salió antes) y ciérrala con cerrar_entrada pasando precio_cierre — el sistema calcula el R exacto con su entrada y SL. Nunca inventes el resultado. MAE/MFE: mientras la posición está en el gráfico, el puente calcula solo el MAE (máximo en contra) y MFE (máximo a favor) en R y aparecen en el bloque en vivo junto a la posición; al cerrar, PÁSALOS a cerrar_entrada (mae y mfe) para guardarlos y luego analizar juntos si el SL estuvo bien puesto y si cerraste muy pronto/tarde. El único dato que SOLO Rey sabe es el 'momento' (si entró en confirmación, en el toque o se anticipó): pregúntaselo al registrar la entrada. 📸 CAPTURAS: al registrar y al cerrar una entrada, la app pide sola una foto del gráfico (se guardan con el trade en el Diario); si Rey te dice 'saca captura' o quieres guardar una imagen para analizar, usa capturar_grafico con el par. Detección en CUALQUIER par que tenga abierto, nada fijo.";

/* Frameworks de los DOS análisis de Rey (semanal + diario), adaptados para que
   Roberto los ejecute con el gráfico EN VIVO (su indicador CRT Elite ya calculó
   las temporalidades y marcó niveles/etiquetas). Van a la API, no se muestran. */
const ANALISIS_SEMANAL_PROM =
"Eres mi MENTOR y ANALISTA ELITE. Hazme el ANÁLISIS SEMANAL del/los par(es) que veo en el gráfico en vivo. FUENTE OBLIGATORIA: el bloque [👁️ GRÁFICO EN VIVO] que ya tienes (mi indicador CRT Elite YA calculó las temporalidades W/D/4H/1H y marcó niveles y etiquetas). NO inventes: si un dato no está en el bloque, dilo. Método SMC/CRT/liquidez. Si la PC no está conectada (no hay lectura viva), dímelo y pídeme encender el Puente.\n"+
"⚡ SÉ CONCISO Y DIRECTO: completo pero BREVE, máximo ~600 palabras POR PAR. Usa bullets y frases cortas, cero relleno (el chat se corta si te alargas demasiado).\n"+
"MULTI-PAR OBLIGATORIO (v6.04 — Rey lo exige): en el bloque vivo vienen TODOS los pares que Rey tiene abiertos en el Puente. DEBES cubrirlos TODOS Y CADA UNO, sin excepción: (1) EMPIEZA con un RANKING — en cuál está la mejor oportunidad de la semana y por qué; (2) luego el análisis de CADA par, uno por uno — NINGUNO se omite en silencio: si un par no tiene datos frescos o no tiene oportunidad, dilo EXPLÍCITAMENTE en su propia sección ('GBPUSD: sin setup esta semana porque…') — eso también es información que Rey necesita. Solo si Rey te nombra un par concreto analizas únicamente ese.\n"+
"ESCRÍBEME en este formato exacto:\n"+
"🗓️ CONTEXTO GRANDE: zona del rango (Deep Discount/Discount/Equilibrio/Premium/Deep Premium) y estructura (alcista/bajista/rango) según el sesgo y la alineación TF del indicador.\n"+
"📊 LIQUIDEZ PENDIENTE: niveles clave con precio (usa W H/W L, D H/D L, 4H, EQH/EQL, BSL/SSL del bloque), arriba y abajo del precio actual.\n"+
"📅 BIAS CONFIRMADO EN DAILY: sí/no, según la alineación D y el sesgo del día.\n"+
"🗺️ MAPA DE LA SEMANA: niveles de mayor a menor con el precio actual en el medio; hacia cuál irá primero y qué lo desviaría.\n"+
"📰 NOTICIAS: usa el calendario real ya inyectado (días/horas NY de alto/medio impacto de mis monedas) + regla de no operar 15 min antes/después.\n"+
"🔵 BIAS SEMANAL: COMPRAS / VENTAS / RANGO-ESPERAR.\n"+
"🎯 PLAN DE LA SEMANA: qué busco, zona principal y secundaria (precio), nivel que INVALIDA el bias, mejor día para operar, días a evitar.\n"+
"📝 NOTAS DEL MENTOR: 3-4 líneas con el consejo clave de esta semana.\n"+
"🏦 POR CUENTA (OBLIGATORIO): con mis cuentas registradas, dime cómo actuar en CADA UNA por separado esta semana (riesgo, operar o no según su DD) y marca en CUÁL debo operar — PROTEGE la fondeada crítica.\n"+
"Reglas: el semanal MANDA sobre el diario. Sin sweep = sin setup. No dibujes en el gráfico todavía (eso llega pronto); dame el análisis y el plan en texto, directo y claro.\n"+
"AL TERMINAR: usa la mano guardar_plan_semanal para GUARDAR el plan (bias, zona principal, zona secundaria, nivel de invalidación y mejor día), así lo recuerdas TODA la semana y podrás detectar si se invalida.";
const ANALISIS_DIARIO_PROM =
"Eres mi MENTOR y ANALISTA ELITE. Hazme el ANÁLISIS DEL DÍA del/los par(es) que veo en el gráfico en vivo. FUENTE OBLIGATORIA: el bloque [👁️ GRÁFICO EN VIVO] (mi indicador CRT Elite ya calculó D/H4/1H/15/5, zona premium/discount, alineación TF, CRT H4, SMT, Secuencia F3, killzone y nivel de invalidación) + etiquetas/niveles. NO inventes datos que no estén. Si la PC no está conectada, dímelo y pídeme encender el Puente.\n"+
"⚡ SÉ CONCISO Y DIRECTO: completo pero BREVE, máximo ~600 palabras POR PAR. Usa bullets y frases cortas, cero relleno (el chat se corta si te alargas demasiado).\n"+
"MULTI-PAR OBLIGATORIO (v6.04 — Rey lo exige): en el bloque vivo vienen TODOS los pares que Rey tiene abiertos en el Puente. DEBES cubrirlos TODOS Y CADA UNO, sin excepción: (1) EMPIEZA con un RANKING — en cuál hay mejor oportunidad HOY (o en ninguno) comparando cuál tiene la confluencia más limpia (sweep + MSS + zona + killzone); (2) luego el análisis de CADA par, uno por uno — NINGUNO se omite en silencio: si un par no tiene setup hoy, dilo EXPLÍCITAMENTE en su propia sección con el porqué — eso también protege a Rey. Solo si Rey te nombra un par concreto analizas únicamente ese.\n"+
"ESCRÍBEME en este formato exacto:\n"+
"📅 DAILY — BIAS: alcista/bajista/rango + liquidez pendiente (precios).\n"+
"📊 H4 — zona clave (precio), premium/discount, CRT H4, ¿válido para operar?\n"+
"⚡ 15M/1H — SETUP: A+/B/C/NO OPERAR según la Secuencia F3 y las confluencias (sweep, MSS, displacement, reacción en zona). REGLA DE ORO: sin sweep marcado = NO hay setup, PÁRATE ahí.\n"+
"🎯 M5 — si hay setup: entrada, SL y TP aproximados con RR usando los niveles del bloque. Si hay herramienta de posición puesta, LÉELA y valídala o rectifícala (entrada/SL/TP/RR/riesgo).\n"+
"⏰ HORARIO: ¿ventana válida (Londres/Pre-NY/NY, hora NY)? Si el mercado está cerrado o estamos fuera de killzone, dilo CLARO.\n"+
"📰 NOTICIAS del día (del calendario ya inyectado).\n"+
"🔴 VEREDICTO: OPERAR AHORA / ESPERAR CONFIRMACIÓN / NO HAY SETUP + razón en 2-3 líneas.\n"+
"🏦 POR CUENTA (OBLIGATORIO): cómo actuar HOY en CADA cuenta registrada por separado y en cuál operar — PROTEGE la fondeada crítica.\n"+
"Regla: el semanal manda sobre el diario; si el setup va contra el bias semanal, NO operar. No dibujes en el gráfico todavía; dame análisis y plan en texto.\n"+
"COMPARA con el [🗓️ PLAN SEMANAL VIGENTE] que ya tienes: EMPIEZA diciéndome si sigue VÁLIDO o si CAMBIÓ/SE INVALIDÓ (porque el precio en vivo rompió su nivel de invalidación o una noticia fuerte cambió el panorama). Si cambió, dímelo claro y ADÁPTALO con guardar_plan_semanal antes de darme el plan del día.";
function analisisSemanal(){ iaTemaChat("🗓️ Análisis semanal"); iaEnviar("🗓️ Hazme mi análisis SEMANAL con el gráfico en vivo.", ANALISIS_SEMANAL_PROM); }
function analisisDiario(){ iaTemaChat("📆 Análisis del día"); iaEnviar("📆 Hazme mi análisis DEL DÍA con el gráfico en vivo.", ANALISIS_DIARIO_PROM); }
/* 🧠 CHECK EMOCIONAL antes de operar — Roberto le toma el pulso mental y da luz verde/roja. */
const CHECK_EMO_PROM = "Rey va a hacer su CHECK EMOCIONAL antes de operar. Hazle 2-3 preguntas MUY breves para tomarle el pulso mental AHORA: ¿cómo llega (tranquilo / acelerado / cansado / frustrado)?, ¿viene de una pérdida o siente ganas de revancha?, ¿tiene claro su plan y su límite de hoy? Espera su respuesta y, cruzándola con lo que ves en el contexto (sus fugas psicológicas, su estado de riesgo, freno/recuperación), dale LUZ VERDE (mente lista, adelante con disciplina) o LUZ ROJA (mejor NO operar hoy, con el motivo claro). Sé breve, humano y honesto; si detectas tilt, revancha o cansancio, prioriza PROTEGERLO por encima de operar.";
function checkEmocional(){ if(typeof abrirIA==="function") abrirIA(); iaTemaChat("🧠 Check emocional"); setTimeout(()=>iaEnviar("🧠 Hazme el check emocional antes de operar.", CHECK_EMO_PROM),250); }
/* ⚖️ COMPARADOR DE PARES — Roberto compara los pares en vivo y dice dónde está la mejor oportunidad. */
const COMPARAR_PROM = "Rey quiere COMPARAR sus pares para saber dónde operar HOY. Usa el bloque de GRÁFICOS EN VIVO (si su PC está conectada; si no, dile con cariño que la encienda). Compara TODOS los pares abiertos: para cada uno mira sesgo del día, killzone, zona premium/discount, confluencias/alineación TF y si hay sweep/MSS (Fase 3). Preséntalo en una TABLA (par | sesgo | zona | confluencias | ¿setup?) y DECIDE: ¿en cuál hay la MEJOR oportunidad ahora (o en ninguna todavía) y por qué? Respeta el riesgo, el freno y el modo recuperación del contexto. Breve y accionable.";
function compararPares(){ if(typeof abrirIA==="function") abrirIA(); iaTemaChat("⚖️ Comparar pares"); setTimeout(()=>iaEnviar("⚖️ Compara mis pares y dime dónde está la mejor oportunidad hoy.", COMPARAR_PROM),250); }
/* 🎬 PRÁCTICA GUIADA CON REPLAY — Roberto dirige un ejercicio de backtest para entrenar el gatillo. */
const REPLAY_PROM = "Rey quiere una PRÁCTICA GUIADA con el modo Replay de TradingView (backtest sin arriesgar, ideal en su demo Pepperstone). Guíalo paso a paso: (1) cómo activar Replay y elegir una fecha antes de una killzone; (2) que avance vela a vela buscando el modelo CRT (sweep de liquidez → MSS 15M → zona premium/discount → gatillo M5); (3) por cada intento pídele que te diga qué ve y confírmale si es válido o por qué no (sobre todo cazando su fuga de entrar ANTES de confirmar); (4) que registre el resultado como backtest en su Diario. Que sea un ejercicio corto y concreto (1-2 escenarios), no una clase teórica. Empieza proponiéndole un drill.";
function practicaReplay(){ if(typeof abrirIA==="function") abrirIA(); iaTemaChat("🎬 Backtesting (gimnasio)"); setTimeout(()=>iaEnviar("🎬 Dirígeme una práctica con Replay para entrenar mi gatillo.", REPLAY_PROM),250); }
/* 🧠 DETECTOR DE FUGAS PSICOLÓGICAS — lee los trades recientes y marca patrones (revancha,
   prisa, overtrading, fuera de ventana, plan roto) para que Roberto avise ANTES de repetirlos. */
function iaFugas(){
  const base=(typeof tradesCtx==="function"?tradesCtx():[]).filter(t=>!t.abierta);
  if(base.length<3) return "";
  const rec=base.slice().sort((a,b)=>(a.fecha<b.fecha?1:-1)).slice(0,12);
  const nPrisa=rec.filter(t=>t.emo==="Ansioso"||t.emo==="Con prisa").length;
  const nRoto=rec.filter(t=>t.plan==="No").length;
  const nFuera=rec.filter(t=>t.ventana==="Fuera de ventana").length;
  const porDia={}; rec.forEach(t=>{ porDia[t.fecha]=(porDia[t.fecha]||0)+1; });
  const diasExceso=Object.values(porDia).filter(n=>n>2).length;
  let revancha=0; const byDay={};
  rec.slice().sort((a,b)=>(a.fecha<b.fecha?-1:1)).forEach(t=>{ (byDay[t.fecha]=byDay[t.fecha]||[]).push(t); });
  Object.values(byDay).forEach(arr=>{ for(let i=1;i<arr.length;i++){ if((parseFloat(arr[i-1].r)||0)<0) revancha++; } });
  const flags=[];
  if(nPrisa>=2) flags.push(nPrisa+" trades con prisa/ansiedad");
  if(nRoto>=2) flags.push(nRoto+" con PLAN ROTO");
  if(nFuera>=1) flags.push(nFuera+" fuera de ventana");
  if(diasExceso>=1) flags.push("overtrading ("+diasExceso+" día(s) con +2 trades)");
  if(revancha>=1) flags.push(revancha+" posible(s) entrada(s) de REVANCHA tras una pérdida");
  if(!flags.length) return "[🧠 FUGAS PSICOLÓGICAS: en tus últimos trades no veo patrones de fuga marcados — buena disciplina.]";
  return "[🧠 FUGAS PSICOLÓGICAS DETECTADAS (últimos "+rec.length+" trades): "+flags.join(" · ")+". AVÍSALE ANTES de repetirlo: si hoy va camino de una de estas (revancha tras SL, prisa, operar fuera de ventana, +2 trades), FRÉNALO con cariño y firmeza y recuérdale su regla. La mente es donde se gana o se pierde.]";
}

/* 🤖 ROBERTO PROACTIVO — evaluaciones que arranca solo al tocar su notificación.
   El worker (cron) empuja el aviso a la tarde / los viernes; al abrir, Roberto EVALÚA
   leyendo el Diario real (le paso los trades del día / de la semana en el marco oculto). */
const EVAL_DIA_PROM = "Rey quiere que EVALÚES su operativa de HOY, como su mentor que cierra el día con él. Abajo tienes SUS TRADES DE HOY (los cerrados). Si hay trades: evalúa CADA uno — qué hizo bien y qué mal, el R obtenido, si respetó el plan y las reglas (sweep obligatorio, killzone/ventana, sesgo del día, zona premium/discount, esperar la vela de confirmación CERRADA) y su gestión (SL/TP/parciales/BE); si ves su fuga de TIMING PREMATURO, díselo; termina con LA LECCIÓN del día (1 frase) y EL FOCO para mañana (1 frase). Si NO hay trades hoy: dilo en 1 línea, valora si estuvo bien no forzar según su plan y ventanas, y deja 1 nota breve. Cálido pero honesto y directo. Formato vivo (tabla si hay varios trades). Empieza saludándolo por el cierre del día.";
const EVAL_SEMANA_PROM = "Rey quiere el CIERRE DE SEMANA, como su mentor. Abajo tienes SUS TRADES DE LA SEMANA (cerrados). Saca los números en una TABLA: nº de trades, ganados / perdidos / BE, R acumulado, win rate aprox., y cuántos con plan roto / fuera de ventana / con prisa. Luego 2-3 conclusiones (su mejor y peor hábito de la semana, mejor ventana/setup) y 1-2 FOCOS concretos para la próxima semana. Cálido, honesto, directo. Empieza reconociendo el cierre de la semana.";
function tradesTexto(list){
  return list.map(t=>{
    const rr=(t.r!=null&&t.r!=="")?(t.r+"R"):"?";
    const res=t.res||(parseFloat(t.r)>0?"Ganado":parseFloat(t.r)<0?"Perdido":"BE");
    return "• "+(t.fecha||"?")+" "+(t.par||"?")+" "+(t.dir||"")+" · "+res+" "+rr
      +(t.setup?(" · setup "+t.setup):"")+(t.ventana?(" · "+t.ventana):"")
      +(t.momento?(" · '"+t.momento+"'"):"")+(t.zona?(" · "+t.zona):"")
      +(t.bias?(" · bias "+t.bias):"")+(t.plan==="No"?" · ⚠️PLAN ROTO":"")
      +(t.nota?(" · nota: "+t.nota):"");
  }).join("\n");
}
async function evalDia(){
  iaTemaChat("🤖 Cierre del día");
  const hoy=hoyISO();
  const ts=tradesCtx().filter(t=>t.fecha===hoy && !t.abierta);
  const data=ts.length?tradesTexto(ts):"(No hay trades cerrados registrados hoy.)";
  // 📸 Adjunta la FOTO AUTOMÁTICA de la entrada de hoy (si existe) para que Roberto la VEA:
  // evaluación con OJOS (¿entró en el toque o esperó confirmación? ¿zona válida?), no solo números.
  let fotoNota="";
  try{
    const shot=(SHOTS||[]).find(s=>s.fecha===hoy && s.tipo==="Auto-entrada");
    if(shot && !IA.pendImg){
      const r=await fetch(nubeUrl()+"/shot/get?id="+encodeURIComponent(shot.id),{cache:"no-store"});
      const d=await r.json();
      if(d && d.img){ IA.pendImg=d.img; fotoNota="\n\nADJUNTA va la FOTO AUTOMÁTICA del gráfico en el MOMENTO EXACTO de su entrada de hoy ("+(shot.par||"?")+"): MÍRALA y evalúa también lo VISUAL — ¿entró en el toque o esperó la confirmación cerrada? ¿la zona era válida? ¿cómo se veía la estructura? Cruza lo que VES con lo que dicen los números."; }
    }
  }catch(_){}
  iaEnviar("🤖 Evalúa mi operativa de HOY.", EVAL_DIA_PROM+fotoNota+"\n\nSUS TRADES DE HOY ("+hoy+"):\n"+data);
}
function evalSemana(){
  iaTemaChat("🤖 Cierre de semana");
  const d=new Date(); d.setDate(d.getDate()-7);
  const cut=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const ts=tradesCtx().filter(t=>t.fecha>=cut && !t.abierta).sort((a,b)=>(a.fecha<b.fecha?-1:1));
  const data=ts.length?tradesTexto(ts):"(No hay trades cerrados en los últimos 7 días.)";
  iaEnviar("🤖 Hazme el CIERRE de mi semana.", EVAL_SEMANA_PROM+"\n\nSUS TRADES DE LA SEMANA (desde "+cut+"):\n"+data);
}
function iaProactivo(seed){ if(seed==="informe_aprendizaje") return verMemoria(); if(seed==="eval_dia") return evalDia(); if(seed==="eval_semana") return evalSemana(); if(seed==="revisar_pendientes") return revisarPendientes(); if(seed==="revisar_riesgo") return revisarRiesgo(); if(seed==="practica_replay") return practicaReplay(); }

let _iaConoc = null;
/* Arma el bloque de conocimiento (estrategia + indicador + perfil) desde los
   mismos datos que ve la app, para que la IA y la app nunca se contradigan. */
function iaConocimiento(){
  if(_iaConoc) return _iaConoc;
  const R   = REGLAS.map((r,i)=>`  ${i+1}. ${r}`).join("\n");
  const C   = CONFLUENCIAS.map((c,i)=>`  ${i+1}. ${c.t} ${c.extra||""} → ${c.sub}`.replace(/\s+/g," ")).join("\n");
  const cls = RIESGO_SETUP.map(x=>`  ${x.c} (${x.conf||"—"}): ${x.r||"—"} ${x.rr||""} → ${x.act}`).join("\n");
  const par = PARCIALES.map(p=>`  ${p.k} → ${p.v}`).join("\n");
  const ven = VENTANAS.filter(v=>!v.bad).map(v=>`${v.n} (${v.h})${v.sub?" ["+v.sub+"]":""}`).join("; ");
  const noOp= VENTANAS.filter(v=>v.bad).map(v=>`${v.n} (${v.h})`).join("; ");
  const tf  = TEMPORALIDADES.map(t=>`  ${t.tf}: ${t.t} — ${t.d.replace(/<[^>]+>/g,"")}`).join("\n");
  const dias= DIAS.map(d=>`  ${d.d}: ${d.e} → ${d.a}`).join("\n");
  _iaConoc =
    "==========  DOSSIER — TODO LO QUE SÉ DE REY Y SU MÉTODO  ==========\n\n"+
    PERFIL_REY+"\n\n"+
    MERCADOS_DOSSIER+"\n\n"+
    APEX_MAPA+"\n\n"+
    PUENTE_DOSSIER+"\n\n"+
    "SU ESTRATEGIA CRT ELITE (SMC/ICT/CRT):\n"+
    "REGLA DE ORO (modelo de REVERSIÓN): SIN SWEEP = SIN SETUP. Si el precio no barrió liquidez con MECHA (no con cierre), NO hay operación de reversión, por muchas otras confluencias que haya.\n"+
    "🏃 MODELO DE CONTINUACIÓN (2º camino, añadido el 26-08 tras el desplome del PCE/GDP): cuando el día YA SE VIRÓ (giro diario confirmado, giro estructural H4+15M, o Continuación H4 con cuerpo) la regla del sweep contrario NO aplica — la entrada válida es el RETROCESO: precio retrocede ≥30% del rango vivo del día, REACCIONA en una zona (FVG/OB), dentro de killzone, con el 15m a favor y el grado mínimo de confluencias. La señal 🔔 del indicador dice 'Modelo: REVERSIÓN' o 'Modelo: 🏃 CONTINUACIÓN' — razona SIEMPRE con el modelo que diga la señal (en continuación, el Premium/Discount del rango VIEJO no es objeción: se mide el retroceso del rango vivo). Perseguir velas sin retroceso sigue PROHIBIDO en ambos modelos.\n\n"+
    "Las 5 confluencias:\n"+C+"\n\n"+
    "Mínimos para entrar: ≥3 confluencias macro (Daily+H4) + 4 micro (M15+M5). Precio en 40−60% (tierra de nadie) = esperar SIEMPRE. Premium (50−100%) = ventas; Discount (0−50%) = compras.\n\n"+
    "Clasificación y riesgo por setup:\n"+cls+"\n"+
    "  (Condición actual: solo opera A+ y B. Riesgo fijo 0.5%.)\n\n"+
    "Gestión de parciales:\n"+par+"\n"+
    "  SL a Break Even en 1:1. Trailing con estructura (detrás de cada nuevo OB/FVG a favor), nunca ATR fijo.\n\n"+
    "Ventanas válidas (hora NY): "+ven+".\n"+
    "PROHIBIDO operar: "+noOp+"; y sesión asiática. No opera 15 min antes ni después de una noticia roja (regla actualizada por Rey el 26-08: antes eran 30).\n\n"+
    "Mapa de temporalidades (cada una tiene UN objetivo):\n"+tf+"\n"+
    "  CLAVE: el MSS que VALIDA el setup es el de 1H/15M, NUNCA el de 5M. En M5 hay microrrupturas de ruido. El M5/M3 es solo el gatillo.\n\n"+
    "Gatillo fino (Fase 4, en M5/M3, dentro de la zona ya validada): 1) el precio toca el FVG u OB de entrada; 2) se forma vela de rechazo (pinbar o engulfing que arma order block); 3) la vela siguiente cierra más allá del 50% de la de rechazo; 4) ENTRA al cierre de esa vela de confirmación. SL detrás de la estructura de M5. NUNCA entrar en el toque sin confirmación (ese es su error).\n\n"+
    "Reglas inviolables:\n"+R+"\n\n"+
    "Comportamiento esperado por día:\n"+dias+"\n\n"+
    INDICADOR_DOSSIER+
    "\n\n==========  FIN DEL DOSSIER  ==========";
  return _iaConoc;
}
/* System prompt completo = personalidad + dossier */
function iaSystemFull(){ return IA_SYSTEM_BASE+"\n\n"+iaConocimiento(); }

/* ---- ESTADO: varias conversaciones con memoria ---- */
let IA = { url:"", convs:[], actId:null, busy:false, pendImg:null,
           voz:{on:false, name:null, pitch:0.6}, hablandoIdx:null };

function iaGuardarConvs(){
  try{
    localStorage.setItem(K.iaconvs, JSON.stringify(IA.convs));
    localStorage.setItem(K.iaact, JSON.stringify(IA.actId));
    return true;
  }catch(e){ return false; }
}
function iaNuevoId(){ return "c"+Date.now()+Math.floor(Math.random()*1000); }
function iaConvAct(){
  let c=IA.convs.find(x=>x.id===IA.actId);
  if(!c){ c={ id:iaNuevoId(), t:"", ts:Date.now(), msgs:[] }; IA.convs.unshift(c); IA.actId=c.id; iaGuardarConvs(); }
  return c;
}
function iaTit(c){
  if(c.t) return c.t;
  const u=c.msgs.find(m=>m.role==="user");
  if(u){ let s=u.content.replace(/\s+/g," ").trim(); return s.length>40?s.slice(0,40)+"…":s; }
  return "Nueva conversación";
}
/* 🗂️ CADA TEMA EN SU CHAT (Rey lo exigió: nada apilado en un solo chat). Cuando llega una
   notificación de Roberto o se toca un botón de tema (evaluación, pendientes, riesgo, backtest,
   análisis…), se abre EL CHAT QUE CORRESPONDE: si HOY ya existe un chat de ese tema, se continúa
   ahí; si no, se abre uno NUEVO con su título. Así Roberto organiza cada cosa en su lugar. */
function iaTemaChat(titulo){
  try{
    const hoy=new Date().toDateString();
    let c=IA.convs.find(x=>x.t===titulo && new Date(x.ts).toDateString()===hoy);
    if(!c){
      const vacia=IA.convs.find(x=>!x.msgs.length);
      c=vacia||{ id:iaNuevoId(), t:"", ts:Date.now(), msgs:[] };
      if(!vacia) IA.convs.unshift(c);
      c.t=titulo; c.ts=Date.now();
    }
    IA.actId=c.id; iaGuardarConvs();
    const box=$("#iaConvsBox"); if(box) box.style.display="none";
    pintarIAChat();
  }catch(_){}
}
function iaNuevaConv(){
  const vacia=IA.convs.find(x=>!x.msgs.length);
  const c=vacia||{ id:iaNuevoId(), t:"", ts:Date.now(), msgs:[] };
  if(!vacia) IA.convs.unshift(c);
  IA.actId=c.id; iaGuardarConvs();
  $("#iaConvsBox").style.display="none";
  pintarIAChat();
}
function iaSelConv(id){ IA.actId=id; iaGuardarConvs(); $("#iaConvsBox").style.display="none"; pintarIAChat(); }
function iaDelConv(id){
  if(!confirm("¿Borrar esta conversación?")) return;
  IA.convs=IA.convs.filter(x=>x.id!==id);
  if(IA.actId===id) IA.actId = IA.convs[0]?IA.convs[0].id:null;
  iaGuardarConvs(); renderConvList(); pintarIAChat();
}
/* Marca/desmarca una carpeta (📌 fijado / ⭐ estrella / 🔍 revisar) en un chat.
   Rey lo toca a mano; Roberto también con su mano organizar_chat (automático). */
function iaToggleFlag(id, flag){
  const c=IA.convs.find(x=>x.id===id); if(!c) return;
  c[flag]=!c[flag]; iaGuardarConvs(); renderConvList();
  if(flag==="revisar") syncPendientes();
  const nom={fijado:"📌 Fijado",estrella:"⭐ Importante",revisar:"🔍 Por revisar"};
  toast((c[flag]?"":"Quitado: ")+(nom[flag]||flag));
}
function iaConvItemHTML(c){
  const d=new Date(c.ts), fecha=d.toLocaleDateString("es",{day:"2-digit",month:"short"});
  const act=c.id===IA.actId?" act":"";
  const fb=(flag,on,em,lbl)=>`<button class="ia-flag${on?" on":""}" data-flag="${flag}" data-fid="${c.id}" aria-label="${lbl}" title="${lbl}">${em}</button>`;
  return `<div class="ia-conv${act}" data-id="${c.id}">
    <div class="ia-conv-b" data-sel="${c.id}"><div class="ia-conv-t">${esc(iaTit(c))}</div>
    <div class="ia-conv-d">${fecha} · ${c.msgs.filter(m=>m.role==="user").length} preg.</div></div>
    <div class="ia-conv-flags">${fb("fijado",c.fijado,"📌","Fijar")}${fb("estrella",c.estrella,"⭐","Importante")}${fb("revisar",c.revisar,"🔍","Por revisar")}<button class="ia-conv-x" data-del="${c.id}" aria-label="Borrar">🗑️</button></div></div>`;
}
/* 🗂️ TEMAS de la memoria de Roberto — la memoria ya no es una lista plana: cada recuerdo
   pertenece a un área, y así Roberto puede razonar por áreas ("en psicología sé esto de ti"). */
const MEM_TEMAS_APP = {
  psicologia:"🧠 Psicología y disciplina", gestion:"💰 Gestión y riesgo", estrategia:"📚 Estrategia (CRT/SMC/ICT)",
  pares:"💱 Pares y sus manías", mercado:"🌍 Mercado y noticias", indicador:"📈 Indicador y herramientas",
  resultados:"📊 Resultados y estadísticas", visual:"📸 Patrones visuales (de tus capturas)",
  personal:"🧍 Rey (rutina, vida, objetivos)", general:"🗂️ General"
};
/* 🔎 BUSCADOR de chats y memoria */
let _iaMemCache=null;
function iaBuscarMemoria(q){
  const out=$("#iaMemHits"); if(!out) return;
  if(!q){ out.innerHTML=""; return; }
  const pinta=(entries)=>{
    const hits=(entries||[]).filter(e=>String(e.texto||"").toLowerCase().includes(q)).slice(0,5);
    out.innerHTML = hits.length ? `<div class="ia-conv-fold">🧠 En la memoria de Roberto · ${hits.length}</div>`+
      hits.map(e=>`<div class="note" style="text-align:left;margin:0 0 6px;font-size:12.5px">${esc(e.texto)}</div>`).join("") : "";
  };
  if(_iaMemCache){ pinta(_iaMemCache); return; }
  try{ fetch(nubeUrl()+"/mem",{cache:"no-store"}).then(r=>r.json()).then(d=>{ _iaMemCache=(d&&d.entries)||[]; pinta(_iaMemCache); }).catch(()=>{}); }catch(_){}
}
function renderConvList(){
  const box=$("#iaConvList"); if(!box) return;
  if(!IA.convs.length){ box.innerHTML=`<div class="note" style="text-align:left">Aún no tienes conversaciones guardadas.</div>`; return; }
  const q=($("#iaBuscar")?.value||"").trim().toLowerCase();
  if(q){
    iaBuscarMemoria(q);
    const hits=IA.convs.filter(c=> iaTit(c).toLowerCase().includes(q) || (c.msgs||[]).some(m=>String(m.content||"").toLowerCase().includes(q)) ).sort((a,b)=>b.ts-a.ts);
    box.innerHTML = (hits.length?`<div class="ia-conv-fold">💬 Chats que coinciden · ${hits.length}</div>`+hits.map(iaConvItemHTML).join(""):`<div class="note" style="text-align:left">Sin chats que coincidan con “${esc(q)}”.</div>`);
    box.querySelectorAll("[data-sel]").forEach(b=>b.onclick=()=>iaSelConv(b.dataset.sel));
    box.querySelectorAll("[data-del]").forEach(b=>b.onclick=(e)=>{ e.stopPropagation(); iaDelConv(b.dataset.del); });
    box.querySelectorAll("[data-flag]").forEach(b=>b.onclick=(e)=>{ e.stopPropagation(); iaToggleFlag(b.dataset.fid, b.dataset.flag); });
    return;
  }
  const mh=$("#iaMemHits"); if(mh) mh.innerHTML="";
  const byTs=(a,b)=>b.ts-a.ts;
  const fij=IA.convs.filter(c=>c.fijado).sort(byTs);
  const imp=IA.convs.filter(c=>!c.fijado&&c.estrella).sort(byTs);
  const rev=IA.convs.filter(c=>!c.fijado&&!c.estrella&&c.revisar).sort(byTs);
  const resto=IA.convs.filter(c=>!c.fijado&&!c.estrella&&!c.revisar).sort(byTs);
  const sec=(tit,arr)=> arr.length?(`<div class="ia-conv-fold">${tit} · ${arr.length}</div>`+arr.map(iaConvItemHTML).join("")):"";
  box.innerHTML = sec("📌 Fijados",fij)+sec("⭐ Importantes",imp)+sec("🔍 Por revisar / a medias",rev)+sec("🕘 Recientes",resto);
  box.querySelectorAll("[data-sel]").forEach(b=>b.onclick=()=>iaSelConv(b.dataset.sel));
  box.querySelectorAll("[data-del]").forEach(b=>b.onclick=(e)=>{ e.stopPropagation(); iaDelConv(b.dataset.del); });
  box.querySelectorAll("[data-flag]").forEach(b=>b.onclick=(e)=>{ e.stopPropagation(); iaToggleFlag(b.dataset.fid, b.dataset.flag); });
}

function iaInit(){
  IA.url   = load(K.iaurl, IA_URL_DEFAULT);
  IA.convs = load(K.iaconvs, null);
  IA.actId = load(K.iaact, null);
  IA.voz   = load(K.iavoz, {on:false, name:null, pitch:0.6});
  if(!IA.voz || typeof IA.voz!=="object") IA.voz={on:false, name:null, pitch:0.6};
  if(typeof IA.voz.pitch!=="number") IA.voz.pitch=0.6;
  /* Migración: si venías de la versión de un solo chat, lo conservo como conversación */
  if(!IA.convs){
    IA.convs=[];
    const viejo=load(K.iachat, []);
    if(viejo && viejo.length){ const c={ id:iaNuevoId(), t:"", ts:Date.now(), msgs:viejo }; IA.convs.push(c); IA.actId=c.id; }
    iaGuardarConvs();
  }

  const fab=el("button","fab",'✨<span class="fab-badge">IA</span>');
  fab.id="fab"; fab.setAttribute("aria-label","Roberto, tu mentor");
  document.body.appendChild(fab);
  hacerArrastrable(fab);

  const ov=el("div","ia-ov"); ov.id="iaOv";
  ov.innerHTML=`
    <div class="ia-panel">
      <div class="ia-head">
        <div class="ia-title"><span class="ia-dot"></span> Roberto</div>
        <div class="ia-head-btns">
          <button class="ia-ic" id="iaNew" aria-label="Nueva conversación">✚</button>
          <button class="ia-ic" id="iaConvs" aria-label="Conversaciones">🗂️</button>
          <button class="ia-ic" id="iaCfg" aria-label="Ajustes">⚙️</button>
          <button class="ia-ic" id="iaClose" aria-label="Cerrar">✕</button>
        </div>
      </div>
      <div class="ia-cfg" id="iaConvsBox" style="display:none">
        <div class="ia-cfg-h"><div class="fl" style="margin:0">Tus conversaciones</div>
          <button class="btn gold ia-mini" id="iaNew2">✚ Nueva</button></div>
        <input class="inp" id="iaBuscar" placeholder="🔎 Buscar en chats y memoria…" style="margin:0 0 8px" autocomplete="off">
        <div id="iaMemHits"></div>
        <div class="ia-conv-list" id="iaConvList"></div>
      </div>
      <div class="ia-cfg" id="iaCfgBox" style="display:none">
        <div class="fl">🔊 Voz de Roberto</div>
        <button class="btn" id="iaVozToggle" style="margin-bottom:8px">🔇 Que Roberto me hable: apagado</button>
        <select class="inp" id="iaVozSel" style="margin-bottom:8px"></select>
        <div class="fl">Tono (más grave = más masculino)</div>
        <div class="seg c4" id="iaVozTono" style="margin-bottom:6px">
          <button data-pitch="0.4">Grave++</button>
          <button data-pitch="0.6">Grave+</button>
          <button data-pitch="0.8">Grave</button>
          <button data-pitch="1.0">Normal</button>
        </div>
        <div class="note" style="text-align:left;margin:0 0 8px">Si tu teléfono solo trae voz de mujer, baja el tono (Grave++). Para una voz de HOMBRE real hay que instalarla en Ajustes del teléfono → "Texto a voz" (no en el Asistente de Google).</div>
        <button class="btn" id="iaVozTest" style="margin-bottom:14px">▶️ Probar voz</button>
        <div class="fl">🚀 Motor de Roberto (lo que gasta)</div>
        <div class="seg c2" id="iaMotorSeg" style="margin-bottom:6px">
          <button data-motor="sonnet">🏎️ Rendidor</button>
          <button data-motor="opus">🧠 Máximo</button>
        </div>
        <div class="note" style="text-align:left;margin:0 0 14px">🏎️ <b>Rendidor</b> (Sonnet 5): rápido y gasta mucho menos — para el día a día, backtesting y charla. 🧠 <b>Máximo</b> (Opus 5): para un análisis profundo puntual. Y si estás en Rendidor y pides algo profundo (documentos, análisis semanal, mensajes largos), Roberto <b>te pregunta</b> si usar Máximo solo para esa consulta — tú siempre decides.</div>
        <div class="fl">🛡️ Roberto vigilante</div>
        <button class="btn" id="iaVigilaToggle" style="margin-bottom:6px">🛡️ Vigilante: activado</button>
        <button class="btn" id="iaHistRob" style="margin-bottom:6px">🗒️ Historial de Roberto (qué ha cambiado)</button>
        <div class="note" style="text-align:left;margin:0 0 14px">Roberto vigila cada acción que haces en Apex y te avisa SOLO si algo está mal o mejorable. Y NUNCA cambia nada sin tu confirmación: todo lo que hace queda en su historial.</div>
        <div class="fl">🔔 Notificaciones de Roberto</div>
        <button class="btn" id="iaNotifToggle" style="margin-bottom:8px">🔕 Notificaciones: apagadas</button>
        <label class="ia-chk"><input type="checkbox" id="iaNotifKz"> Aviso de ventana operativa (killzone)</label>
        <label class="ia-chk"><input type="checkbox" id="iaNotifDD"> Aviso de cuenta cerca del límite (DD)</label>
        <div class="fl" style="margin-top:10px">Mis pares (separados por coma)</div>
        <input class="inp" id="iaPares" placeholder="EUR/USD, GBP/USD, XAU/USD">
        <button class="btn" id="iaParesSave" style="margin-top:8px">Guardar pares</button>
        <button class="btn" id="iaNotifNews" style="margin-top:8px">📰 ¿Hay noticias rojas hoy en mis pares?</button>
        <button class="btn gold" id="iaPushTest" style="margin-top:8px">📲 Probar aviso con la app CERRADA</button>
        <div class="note" style="text-align:left;margin-bottom:14px">Activa las notificaciones y toca <b>📲 Probar aviso con la app CERRADA</b>: sal de la app y en unos segundos debe llegarte el aviso de Roberto. Con la app abierta te aviso siempre. Cuando montemos el puente, los pares vendrán solos de TradingView.</div>
        <div class="fl">Dirección de tu puente (Worker)</div>
        <input class="inp" id="iaUrl" placeholder="https://...workers.dev">
        <button class="btn gold" id="iaSaveUrl" style="margin-top:8px">Guardar dirección</button>
        <a class="btn" href="https://console.anthropic.com/settings/billing" target="_blank" rel="noopener" style="margin-top:8px;display:block;text-align:center;text-decoration:none">💳 Saldo / recargar créditos</a>
        <button class="btn" id="iaClear" style="margin-top:8px">🗑️ Borrar esta conversación</button>
        <div class="note" style="text-align:left">Tu clave de Claude vive segura en el puente, nunca aquí. Los centavos por pregunta se cargan a tu cuenta de Anthropic. La IA no ve tu saldo; míralo en "Saldo / recargar".</div>
        <div style="margin-top:12px;border-top:1px solid rgba(255,255,255,.12);padding-top:10px">
          <div class="note" style="text-align:left"><b>☁️ Respaldo en la nube</b> — para no perder NADA y recuperar Apex en otro teléfono. Elige un código secreto y recuérdalo (con él restauras todo).</div>
          <input class="inp" id="nubeCodeInp" placeholder="Tu código de respaldo (mín. 4 letras/números)" style="margin-top:6px">
          <button class="btn gold" id="nubeSave" style="margin-top:8px">💾 Guardar código y respaldar ahora</button>
          <button class="btn" id="nubeRestore" style="margin-top:8px">☁️ Restaurar todo desde la nube</button>
          <div class="note" id="nubeEstado" style="text-align:left;margin-top:6px"></div>
        </div>
      </div>
      <div class="ia-msgs" id="iaMsgs"></div>
      <div class="ia-quick" id="iaQuick">
        <button class="ia-chip" data-act="semanal">🗓️ Análisis semanal</button>
        <button class="ia-chip" data-act="diario">📆 Análisis del día</button>
        <button class="ia-chip" data-act="checkemo">🧠 Check antes de operar</button>
        <button class="ia-chip" data-act="gonogo">✅ GO/NO-GO</button>
        <button class="ia-chip" data-act="progreso">📊 Mi progreso</button>
        <button class="ia-chip" data-act="escalado">💰 Escalado</button>
        <button class="ia-chip" data-act="parte">🌅 Parte del día</button>
        <button class="ia-chip" data-act="avisos">📥 Avisos recibidos</button>
        <button class="ia-chip" data-act="reintentar">🔄 Reenviar mi último mensaje</button>
        <button class="ia-chip" data-act="plan">🧭 Mi plan</button>
        <button class="ia-chip" data-act="aciertos">🎯 Cómo lees el mercado</button>
        <button class="ia-chip" data-act="gasto">💰 Mi gasto</button>
        <button class="ia-chip" data-act="memoria">🧠 Mi memoria</button>
        <button class="ia-chip" data-act="capturas">📸 Estudia mis capturas</button>
        <button class="ia-chip" data-act="comparar">⚖️ Comparar pares</button>
        <button class="ia-chip" data-act="replay">🎬 Práctica Replay</button>
        <button class="ia-chip" data-act="ejecutor">🤖 Ejecutor</button>
        <button class="ia-chip" data-q="${IA_CHIP_QS.operativa}">📊 Analiza mi operativa</button>
        <button class="ia-chip" data-q="${IA_CHIP_QS.fuga}">🩸 Mi mayor fuga</button>
        <button class="ia-chip" data-q="${IA_CHIP_QS.gatillar}">🎯 Cómo gatillar</button>
        <button class="ia-chip" data-q="${IA_CHIP_QS.alarmas}">🔔 Mis alarmas</button>
        <button class="ia-chip" data-q="${IA_CHIP_QS.fondeo}">🏦 Plan de fondeo</button>
        <button class="ia-chip" data-q="${IA_CHIP_QS.firmas}">⚖️ Comparar firmas</button>
        <button class="ia-chip" data-q="${IA_CHIP_QS.compuesto}">📈 Interés compuesto</button>
        <button class="ia-chip" data-q="${IA_CHIP_QS.mejoras}">💡 Mejoras del sistema</button>
      </div>
      <div class="ia-att" id="iaAtt" style="display:none"></div>
      <div class="ia-input">
        <button class="ia-attbtn" id="iaClip" aria-label="Adjuntar imagen">📎</button>
        <button class="ia-attbtn" id="iaCamBtn" aria-label="Tomar foto">📷</button>
        <button class="ia-attbtn" id="iaMicBtn" aria-label="Hablar con Roberto">🎤</button>
        <textarea id="iaText" rows="1" placeholder="Escríbele o toca 🎤 para hablarle..."></textarea>
        <button class="ia-send" id="iaSend" aria-label="Enviar">➤</button>
      </div>
      <input type="file" id="iaFile" accept="image/*,application/pdf,.pdf,.txt,.md,.csv,text/plain" hidden>
      <input type="file" id="iaCam" accept="image/*" capture="environment" hidden>
    </div>`;
  document.body.appendChild(ov);

  $("#iaClose").onclick=cerrarIA;
  ov.onclick=(e)=>{ if(e.target===ov) cerrarIA(); };
  $("#iaNew").onclick=iaNuevaConv;
  $("#iaNew2").onclick=iaNuevaConv;
  $("#iaConvs").onclick=()=>{ const b=$("#iaConvsBox"); const show=b.style.display==="none"; $("#iaCfgBox").style.display="none"; b.style.display=show?"block":"none"; if(show){ _iaMemCache=null; renderConvList(); } };
  const bq=$("#iaBuscar"); if(bq){ let _bqT=null; bq.addEventListener("input",()=>{ clearTimeout(_bqT); _bqT=setTimeout(renderConvList,250); }); }
  $("#iaCfg").onclick=()=>{ const b=$("#iaCfgBox"); const show=b.style.display==="none"; $("#iaConvsBox").style.display="none"; b.style.display=show?"block":"none"; if(show){ $("#iaUrl").value=IA.url; iaVozRefrescarUI(); notifRefrescarUI(); } };
  /* Controles de notificaciones */
  const nt=$("#iaNotifToggle");
  if(!notifSoportado()){ if(nt){ nt.disabled=true; nt.innerHTML="🔕 Tu teléfono no permite notificaciones"; } }
  else if(nt){
    nt.onclick=async()=>{ if(NOTIF.on){ await notifActivar(false); toast("Notificaciones apagadas"); }
      else { const ok=await notifActivar(true); if(ok) toast("Notificaciones activadas 🔔"); } notifRefrescarUI(); };
  }
  const nkz=$("#iaNotifKz"); if(nkz) nkz.onchange=()=>{ NOTIF.killzone=nkz.checked; guardarNotif(); if(NOTIF.on) notifProgramarKillzones(); };
  const ndd=$("#iaNotifDD"); if(ndd) ndd.onchange=()=>{ NOTIF.cuentaDD=ndd.checked; guardarNotif(); if(NOTIF.on) notifChequearCuentasDD(); };
  const ps=$("#iaParesSave"); if(ps) ps.onclick=()=>{ const v=($("#iaPares").value||"").split(",").map(x=>x.trim()).filter(Boolean); if(!v.length){ toast("Escribe al menos un par"); return; } PARES=v; guardarPares(); pushConfigPares(); toast("Pares guardados ✓"); robertoVigila("Cambió sus pares seguidos a: "+v.join(", ")+"."); };
  const nn=$("#iaNotifNews"); if(nn) nn.onclick=iaNoticiasHoy;
  const pt=$("#iaPushTest");
  if(pt){ if(!pushSoportado()){ pt.disabled=true; pt.textContent="📲 Tu teléfono no soporta Web Push"; } else { pt.onclick=pushProbar; } }
  const vg=$("#iaVigilaToggle");
  if(vg){ const pinta=()=>{ vg.innerHTML=VIGILA.on?"🛡️ Vigilante: activado":"💤 Vigilante: apagado"; vg.classList.toggle("gold",!!VIGILA.on); }; pinta();
    vg.onclick=()=>{ VIGILA.on=!VIGILA.on; guardarVigila(); pinta(); toast(VIGILA.on?"Roberto te vigila 🛡️":"Vigilante apagado"); }; }
  const hr=$("#iaHistRob"); if(hr) hr.onclick=histRobertoModal;
  /* Controles de voz */
  const vt=$("#iaVozToggle");
  if(!TTS){ if(vt){ vt.disabled=true; vt.innerHTML="🔇 Tu teléfono no permite voz"; } const vs=$("#iaVozSel"), vp=$("#iaVozTest"); if(vs)vs.style.display="none"; if(vp)vp.style.display="none"; }
  else{
    vt.onclick=()=>{ IA.voz.on=!IA.voz.on; iaGuardarVoz(); iaVozRefrescarUI();
      if(IA.voz.on) iaHablar("Listo, Rey. A partir de ahora te hablo yo, Roberto. Vamos a por esas cuentas.", -1);
      else iaVozParar();
      toast(IA.voz.on?"Roberto te hablará 🔊":"Voz apagada"); };
    $("#iaVozSel").onchange=function(){ IA.voz.name=this.value||null; iaGuardarVoz(); iaHablar("Esta es mi voz. ¿Te gusta?", -1); };
    $("#iaVozTono").querySelectorAll("[data-pitch]").forEach(b=>{
      b.onclick=()=>{ IA.voz.pitch=parseFloat(b.dataset.pitch); iaGuardarVoz(); iaVozRefrescarUI();
        iaHablar("Así sueno con este tono, Rey.", -1); }; });
    $("#iaVozTest").onclick=()=>iaHablar("Hola Rey, soy Roberto, tu mentor de trading. Estoy listo para ayudarte a pasar tus fondeos y escalar tu capital.", -1);
  }
  /* 🚀 Selector de motor: guarda la elección y la manda el worker en cada mensaje */
  { const seg=$("#iaMotorSeg");
    if(seg){
      const pintar=()=>{ seg.querySelectorAll("[data-motor]").forEach(b=>b.classList.toggle("on", b.dataset.motor===iaMotor())); };
      seg.querySelectorAll("[data-motor]").forEach(b=>{
        b.onclick=()=>{ try{ localStorage.setItem("crtelite_ia_motor", b.dataset.motor); }catch(_){}
          pintar(); toast(b.dataset.motor==="opus"?"🧠 Máximo (Opus 5): más potencia, más gasto":"🏎️ Rendidor (Sonnet 5): rápido y económico ✓"); };
      });
      pintar();
    }
  }
  $("#iaSaveUrl").onclick=()=>{ IA.url=$("#iaUrl").value.trim()||IA_URL_DEFAULT; save(K.iaurl,IA.url); $("#iaCfgBox").style.display="none"; toast("Puente guardado ✓"); };
  $("#iaClear").onclick=()=>{ if(confirm("¿Borrar la conversación actual?")){ const c=iaConvAct(); c.msgs=[]; c.t=""; iaGuardarConvs(); $("#iaCfgBox").style.display="none"; pintarIAChat(); } };
  { const ci=$("#nubeCodeInp"); if(ci) ci.value=nubeCode(); nubePintarEstado(); }
  { const bs=$("#nubeSave"); if(bs) bs.onclick=async()=>{ const c=($("#nubeCodeInp").value||"").trim(); if(c.length<4){ toast("El código debe tener al menos 4"); return; } localStorage.setItem(NUBE_CODE_KEY,c); localStorage.setItem(NUBE_TS_KEY,String(Date.now())); toast("Subiendo a la nube…"); await nubeSubir(); nubePintarEstado(); toast("☁️ Respaldo guardado ✓"); }; }
  { const br=$("#nubeRestore"); if(br) br.onclick=async()=>{ const c=($("#nubeCodeInp").value||"").trim(); if(c.length>=4) localStorage.setItem(NUBE_CODE_KEY,c); await nubeRestaurar(false); }; }
  $("#iaSend").onclick=()=>iaEnviar();
  const ta=$("#iaText");
  ta.addEventListener("keydown",e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); iaEnviar(); } });
  ta.addEventListener("input",()=>{ ta.style.height="auto"; ta.style.height=Math.min(ta.scrollHeight,120)+"px"; });
  document.querySelectorAll("#iaQuick .ia-chip").forEach(b=>{ b.onclick=()=>{
    if(b.dataset.act==="semanal") return analisisSemanal();
    if(b.dataset.act==="diario")  return analisisDiario();
    if(b.dataset.act==="checkemo") return checkEmocional();
    if(b.dataset.act==="parte")    return parteMatutino();
    if(b.dataset.act==="avisos")   return verAvisos();
    if(b.dataset.act==="reintentar") return iaReintentar();
    if(b.dataset.act==="plan")     return preguntarPlan();
    if(b.dataset.act==="aciertos") return verAciertos();
    if(b.dataset.act==="gasto")    return verGasto();
    if(b.dataset.act==="memoria")  return verMemoria();
    if(b.dataset.act==="capturas") return estudiarCapturas();
    if(b.dataset.act==="gonogo")   return goNoGo();
    if(b.dataset.act==="progreso") return progresoRoberto();
    if(b.dataset.act==="escalado") return escaladoRoberto();
    if(b.dataset.act==="comparar") return compararPares();
    if(b.dataset.act==="replay")   return practicaReplay();
    if(b.dataset.act==="ejecutor") return verEjecutor();
    iaEnviar(b.dataset.q);
  }; });
  // Adjuntar imagen (galería/archivos) y cámara en directo
  $("#iaClip").onclick=()=>$("#iaFile").click();
  $("#iaCamBtn").onclick=()=>$("#iaCam").click();
  // Hablarle a Roberto con el micrófono
  const mic=$("#iaMicBtn");
  if(mic){ if(!iaMicSoportado()){ mic.disabled=true; mic.title="Tu teléfono no permite dictado por voz"; } else { mic.onclick=iaEscuchar; } }
  /* 📎 ADJUNTAR para NUTRIR a Roberto: imágenes (capturas del gráfico), PDF (documentos, clases,
     reglas de firmas) y texto (.txt/.md/.csv, apuntes). El PDF viaja como documento REAL: Roberto
     lo LEE entero. Rey también puede pegarle ENLACES en el chat (los abre y los lee con web_fetch). */
  const onPick=(inp)=>{ const f=inp.files&&inp.files[0]; inp.value=""; if(!f) return;
    const esPDF = /pdf/i.test(f.type) || /\.pdf$/i.test(f.name);
    const esTxt = /^text\//.test(f.type) || /\.(txt|md|csv)$/i.test(f.name);
    if(/^image\//.test(f.type)){
      toast("Preparando imagen…");
      iaLeerImagen(f,(dataUrl)=>{ if(!dataUrl){ toast("No pude leer la imagen"); return; } IA.pendImg=dataUrl; iaPintarAtt(); });
      return;
    }
    if(esPDF){
      if(f.size > 18*1024*1024){ toast("El PDF es muy grande (máx ~18 MB)"); return; }
      toast("Leyendo el PDF…");
      const r=new FileReader();
      r.onload=e=>{ const b64=String(e.target.result||"").split(",")[1]||""; if(!b64){ toast("No pude leer el PDF"); return; }
        IA.pendDoc={ tipo:"pdf", nombre:f.name, b64 }; iaPintarAtt(); toast("📄 "+f.name+" listo — dile qué hacer con él"); };
      r.onerror=()=>toast("No pude leer el PDF");
      r.readAsDataURL(f);
      return;
    }
    if(esTxt){
      if(f.size > 2*1024*1024){ toast("El texto es muy grande (máx 2 MB)"); return; }
      const r=new FileReader();
      r.onload=e=>{ const txt=String(e.target.result||""); if(!txt.trim()){ toast("El archivo está vacío"); return; }
        IA.pendDoc={ tipo:"txt", nombre:f.name, texto:txt.slice(0,180000) }; iaPintarAtt(); toast("📄 "+f.name+" listo"); };
      r.onerror=()=>toast("No pude leer el archivo");
      r.readAsText(f);
      return;
    }
    toast("Formato no soportado. Usa imagen, PDF o texto (.txt/.md/.csv)"); };
  $("#iaFile").onchange=function(){ onPick(this); };
  $("#iaCam").onchange=function(){ onPick(this); };
  pintarIAChat();
}

/* Lee una imagen del teléfono y la reduce/comprime (para que viaje ligera
   y quepa en la memoria del teléfono). Devuelve un data URL JPEG. */
function iaLeerImagen(file, cb){
  try{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const max=1280; let w=img.width, h=img.height;
        if(w>max||h>max){ const s=max/Math.max(w,h); w=Math.round(w*s); h=Math.round(h*s); }
        const cv=document.createElement("canvas"); cv.width=w; cv.height=h;
        cv.getContext("2d").drawImage(img,0,0,w,h);
        try{ cb(cv.toDataURL("image/jpeg",0.72)); }catch(_){ cb(null); }
      };
      img.onerror=()=>cb(null);
      img.src=e.target.result;
    };
    reader.onerror=()=>cb(null);
    reader.readAsDataURL(file);
  }catch(_){ cb(null); }
}
/* Vista previa de la imagen pendiente, encima del cuadro de texto */
function iaPintarAtt(){
  const a=$("#iaAtt"); if(!a) return;
  if(!IA.pendImg && !IA.pendDoc){ a.style.display="none"; a.innerHTML=""; return; }
  a.style.display="flex";
  if(IA.pendImg){
    a.innerHTML=`<div class="ia-att-wrap"><img class="ia-att-img" src="${IA.pendImg}" alt="adjunto">
      <button class="ia-att-x" id="iaAttX" aria-label="Quitar imagen">✕</button></div>`;
    $("#iaAttX").onclick=()=>{ IA.pendImg=null; iaPintarAtt(); };
  } else {
    const d=IA.pendDoc;
    a.innerHTML=`<div class="ia-att-wrap" style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--card3);border:1px solid var(--line);border-radius:10px">
      <span style="font-size:18px">📄</span><span style="font-size:12.5px;color:var(--txt)">${esc(d.nombre||"documento")}${d.tipo==="pdf"?" (PDF)":""}</span>
      <button class="ia-att-x" id="iaAttX" aria-label="Quitar documento">✕</button></div>`;
    $("#iaAttX").onclick=()=>{ IA.pendDoc=null; iaPintarAtt(); };
  }
}
function abrirIA(){ $("#iaOv").classList.add("show"); pintarIAChat(); setTimeout(()=>{ const t=$("#iaText"); if(t)t.focus(); },220); }
function cerrarIA(){ $("#iaOv").classList.remove("show"); iaVozParar(); }

/* Formato ligero de la respuesta: **negritas**, enlaces tocables y saltos de línea */
/* Renderiza las respuestas de Roberto como markdown VIVO: tablas, encabezados,
   listas, citas, código, negritas, enlaces y emojis. Escapa el HTML primero
   (seguro) y luego aplica el formato. */
function fmtIA(s){
  const lines = String(s==null?"":s).replace(/\r\n?/g,"\n").split("\n");
  const inline = (t)=> esc(t)
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
    .replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener" class="ia-link">$1</a>');
  const esSep = (l)=> l.includes('-') && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(l);
  const fila = (l)=> l.replace(/^\s*\|/,'').replace(/\|\s*$/,'').split('|').map(c=>c.trim());
  const esEspecial = (l)=> /^\s*([-*]\s|>\s?|#{1,3}\s|\d+[.)]\s)/.test(l);
  let html="", i=0;
  while(i<lines.length){
    const l=lines[i];
    if(!l.trim()){ i++; continue; }
    // TABLA: línea con | seguida de una línea separadora ---
    if(l.includes('|') && i+1<lines.length && esSep(lines[i+1])){
      const th=fila(l); i+=2; const rows=[];
      while(i<lines.length && lines[i].includes('|') && lines[i].trim()){ rows.push(fila(lines[i])); i++; }
      let t='<div class="ia-md-tw"><table><thead><tr>'+th.map(h=>'<th>'+inline(h)+'</th>').join('')+'</tr></thead><tbody>';
      for(const r of rows){ t+='<tr>'+r.map(c=>'<td>'+inline(c)+'</td>').join('')+'</tr>'; }
      html+=t+'</tbody></table></div>'; continue;
    }
    // ENCABEZADO # ## ###
    const mh=l.match(/^\s*(#{1,3})\s+(.*)$/);
    if(mh){ html+='<div class="ia-md-h h'+mh[1].length+'">'+inline(mh[2])+'</div>'; i++; continue; }
    // LÍNEA HORIZONTAL --- *** ___
    if(/^\s*([-*_])\1{2,}\s*$/.test(l)){ html+='<hr>'; i++; continue; }
    // CITA >
    if(/^\s*>\s?/.test(l)){ const q=[]; while(i<lines.length && /^\s*>\s?/.test(lines[i])){ q.push(lines[i].replace(/^\s*>\s?/,'')); i++; } html+='<blockquote>'+inline(q.join(' '))+'</blockquote>'; continue; }
    // LISTA con viñetas
    if(/^\s*[-*]\s+/.test(l)){ const it=[]; while(i<lines.length && /^\s*[-*]\s+/.test(lines[i])){ it.push(lines[i].replace(/^\s*[-*]\s+/,'')); i++; } html+='<ul>'+it.map(x=>'<li>'+inline(x)+'</li>').join('')+'</ul>'; continue; }
    // LISTA numerada
    if(/^\s*\d+[.)]\s+/.test(l)){ const it=[]; while(i<lines.length && /^\s*\d+[.)]\s+/.test(lines[i])){ it.push(lines[i].replace(/^\s*\d+[.)]\s+/,'')); i++; } html+='<ol>'+it.map(x=>'<li>'+inline(x)+'</li>').join('')+'</ol>'; continue; }
    // PÁRRAFO (junta líneas seguidas)
    const par=[l]; i++;
    while(i<lines.length && lines[i].trim() && !esEspecial(lines[i]) && !(lines[i].includes('|') && i+1<lines.length && esSep(lines[i+1]))){ par.push(lines[i]); i++; }
    html+='<p>'+par.map(inline).join('<br>')+'</p>';
  }
  return '<div class="ia-md">'+html+'</div>';
}
/* Enlace directo para recargar créditos de Anthropic (el mentor no ve tu saldo) */
const IA_RECARGA_URL = "https://console.anthropic.com/settings/billing";

/* ============================================================
   VOZ DE ROBERTO — texto a voz (Web Speech API del teléfono)
   Gratis, sin internet, sin tocar el puente. Lee sus respuestas.
   ============================================================ */
const TTS = ("speechSynthesis" in window) ? window.speechSynthesis : null;
let _iaVoces = [];
function iaCargarVoces(){
  if(!TTS) return;
  _iaVoces = TTS.getVoices()||[];
}
if(TTS){
  iaCargarVoces();
  TTS.onvoiceschanged = iaCargarVoces;
}
/* Elige la mejor voz en español disponible (prefiere la guardada por Rey). */
function iaVozEspanol(){
  if(!TTS) return null;
  if(!_iaVoces.length) iaCargarVoces();
  const es = _iaVoces.filter(v=>/es(-|_|$)/i.test(v.lang));
  if(IA.voz.name){ const g=_iaVoces.find(v=>v.name===IA.voz.name); if(g) return g; }
  /* Prefiere una voz masculina/latina si el nombre lo insinúa, si no la primera en español */
  const pref = es.find(v=>/(latin|america|mexic|us|estados|jorge|diego|carlos|pablo|male|hombre)/i.test(v.name));
  return pref || es[0] || null;
}
/* Limpia el texto para que suene natural: sin markdown, sin emojis, sin URLs largas */
function iaTextoParaVoz(s){
  return String(s||"")
    .replace(/https?:\/\/[^\s]+/g,"el enlace que te dejé")
    .replace(/\*\*(.+?)\*\*/g,"$1")
    .replace(/[*#_`>]/g,"")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu,"")
    .replace(/\s+\n/g,". ")
    .replace(/\n+/g,". ")
    .replace(/\s{2,}/g," ")
    .trim();
}
function iaVozParar(){
  if(TTS) try{ TTS.cancel(); }catch(_){}
  IA.hablandoIdx=null;
  pintarIAChat();
}

/* ---------- VOZ DE IDA: Rey le HABLA a Roberto (micrófono) ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
let REC=null, RECon=false;
function iaMicSoportado(){ return !!SR; }
function iaMicUI(on){
  const b=$("#iaMicBtn"); if(!b) return;
  b.classList.toggle("rec",!!on);
  b.textContent=on?"⏹️":"🎤";
  b.setAttribute("aria-label",on?"Detener":"Hablar con Roberto");
}
function iaEscuchar(){
  if(!SR){ toast("Tu teléfono no permite dictado por voz"); return; }
  if(RECon){ try{ REC && REC.stop(); }catch(_){} return; }   /* segundo toque = parar */
  iaVozParar();                                              /* que Roberto calle mientras Rey habla */
  const ta=$("#iaText");
  const base=(ta && ta.value ? ta.value.replace(/\s+$/,"")+" " : "");
  let fin="";
  try{
    REC=new SR();
    REC.lang="es-ES"; REC.interimResults=true; REC.maxAlternatives=1; REC.continuous=false;
    REC.onstart=()=>{ RECon=true; iaMicUI(true); toast("Te escucho, Rey… habla 🎙️"); };
    REC.onresult=(e)=>{
      let interim="";
      for(let i=e.resultIndex;i<e.results.length;i++){
        const t=e.results[i][0].transcript;
        if(e.results[i].isFinal) fin+=t; else interim+=t;
      }
      if(ta){ ta.value=(base+fin+interim).replace(/\s{2,}/g," ").replace(/^\s+/,"");
        ta.style.height="auto"; ta.style.height=Math.min(ta.scrollHeight,120)+"px"; }
    };
    REC.onerror=(ev)=>{ RECon=false; iaMicUI(false);
      const er=ev&&ev.error;
      if(er==="not-allowed"||er==="service-not-allowed") toast("Debes permitir el micrófono al navegador");
      else if(er==="no-speech") toast("No te escuché, prueba otra vez");
      else if(er!=="aborted") toast("No pude usar el micrófono"); };
    REC.onend=()=>{ RECon=false; iaMicUI(false);
      const txt=(ta&&ta.value||"").trim();
      if(txt) setTimeout(()=>iaEnviar(),150);   /* al terminar de hablar, Roberto responde solo */
    };
    REC.start();
  }catch(_){ RECon=false; iaMicUI(false); toast("No pude iniciar el micrófono"); }
}
/* Habla un texto. idx = índice del mensaje en la conversación (para el botón). */
function iaHablar(texto, idx){
  if(!TTS){ toast("Tu teléfono no permite voz"); return; }
  try{ TTS.cancel(); }catch(_){}
  const limpio=iaTextoParaVoz(texto);
  if(!limpio){ return; }
  const u=new SpeechSynthesisUtterance(limpio);
  const v=iaVozEspanol();
  if(v){ u.voice=v; u.lang=v.lang; } else { u.lang="es-ES"; }
  u.rate=1.0;
  u.pitch=(typeof IA.voz.pitch==="number")?IA.voz.pitch:0.6;  /* grave = más masculino */
  u.onstart=()=>{ IA.hablandoIdx=(idx==null?-1:idx); pintarIAChat(); };
  u.onend  =()=>{ IA.hablandoIdx=null; pintarIAChat(); };
  u.onerror=()=>{ IA.hablandoIdx=null; pintarIAChat(); };
  /* iOS/Chrome a veces se "duerme": lo despertamos */
  try{ TTS.resume(); }catch(_){}
  TTS.speak(u);
}
/* Rellena el <select> de voces en ajustes */
function iaPintarVoces(){
  const sel=$("#iaVozSel"); if(!sel) return;
  if(!_iaVoces.length) iaCargarVoces();
  const es=_iaVoces.filter(v=>/es(-|_|$)/i.test(v.lang));
  const lista = es.length?es:_iaVoces;
  if(!lista.length){ sel.innerHTML=`<option value="">Sin voces en este teléfono</option>`; return; }
  const actual=iaVozEspanol();
  sel.innerHTML=lista.map(v=>`<option value="${esc(v.name)}"${actual&&v.name===actual.name?" selected":""}>${esc(v.name)} (${esc(v.lang)})</option>`).join("");
}
function iaGuardarVoz(){ save(K.iavoz, IA.voz); }
/* Refresca el botón de encendido y el selector de voces en ajustes */
function iaVozRefrescarUI(){
  const vt=$("#iaVozToggle");
  if(vt && TTS){
    vt.innerHTML = IA.voz.on ? "🔊 Que Roberto me hable: ACTIVADO" : "🔇 Que Roberto me hable: apagado";
    vt.classList.toggle("gold", !!IA.voz.on);
  }
  const tono=$("#iaVozTono");
  if(tono){ tono.querySelectorAll("[data-pitch]").forEach(b=>{
    b.classList.toggle("on", Math.abs(parseFloat(b.dataset.pitch)-(IA.voz.pitch||0.6))<0.01); }); }
  iaPintarVoces();
}

/* Saludo natural según la hora real de Rey (reloj del teléfono, zona Brasil).
   Hace que al abrir a Roberto salude como un compañero: "Buenos días… ¿en qué
   vamos a trabajar hoy?", cambiando mañana / tarde / noche y el día de la semana. */
function saludoRey(){
  const now=new Date();
  let h=now.getHours(), wd="";
  try{
    const p=new Intl.DateTimeFormat("en-US",{timeZone:"America/Sao_Paulo",hour:"2-digit",hour12:false,weekday:"long"}).formatToParts(now);
    p.forEach(x=>{ if(x.type==="hour")h=+x.value; if(x.type==="weekday")wd=x.value; });
  }catch(_){}
  const dias={Monday:"lunes",Tuesday:"martes",Wednesday:"miércoles",Thursday:"jueves",Friday:"viernes",Saturday:"sábado",Sunday:"domingo"};
  const dia=dias[wd]||"";
  let saludo, emoji, franja;
  if(h>=5 && h<12){ saludo="Buenos días"; emoji="☀️"; franja="esta mañana"; }
  else if(h>=12 && h<19){ saludo="Buenas tardes"; emoji="🌤️"; franja="esta tarde"; }
  else { saludo="Buenas noches"; emoji="🌙"; franja="esta noche"; }
  const finde=(wd==="Saturday"||wd==="Sunday");
  const cierre = finde
    ? `Hoy es ${dia} — el mercado FX está cerrado, buen momento para repasar, analizar o preparar la semana. ¿Qué quieres hacer ${franja}?`
    : `¿En qué vamos a trabajar ${franja}${dia?`, este ${dia}`:""}? Cuéntame qué tienes en el gráfico o pregúntame lo que sea.`;
  return { saludo, emoji, cierre };
}

function pintarIAChat(){
  const m=$("#iaMsgs"); if(!m) return;
  const c=iaConvAct();
  if(!c.msgs.length && !IA.busy){
    const s=saludoRey();
    m.innerHTML=`<div class="ia-welcome"><div class="ia-w-emoji">${s.emoji}</div>
      <div class="ia-w-t">${s.saludo}, Rey — soy Roberto</div>
      <div class="ia-w-s">${s.cierre} Conozco tu estrategia CRT, tu indicador, tus reglas y tus datos, y domino trading, finanzas, interés compuesto y las empresas de fondeo. Si te equivocas, te lo digo claro: estoy para que mejores.</div></div>`;
    return;
  }
  m.innerHTML=c.msgs.map((x,i)=>{
    const cuerpo=x.role==="user"?esc(x.content):(x.html?x.html:fmtIA(x.content)); /* x.html: vistas ricas propias (ej. memoria plegable) */
    const foto=x.img?`<img class="ia-msg-img" src="${x.img}" alt="gráfico">`:"";
    if(x.role==="user") return `<div class="ia-msg user">${foto}${cuerpo}</div>`;
    const habla = IA.hablandoIdx===i;
    const btn = TTS ? `<button class="ia-speak${habla?" on":""}" data-speak="${i}">${habla?"⏹ Parar":"🔊 Escuchar"}</button>` : "";
    return `<div class="ia-msg bot">${foto}${cuerpo}${btn}${iaAccionesHTML(x,i)}</div>`;
  }).join("")
    + (IA.busy?`<div class="ia-msg bot ia-typing"><span></span><span></span><span></span></div>
       <div class="ia-cancel-w"><button class="ia-cancel" id="iaCancel">✕ Cancelar y escribir</button></div>
       <div class="ia-wait">Roberto está pensando… si busca en internet (firmas, noticias) tarda un poco más. Espera los puntitos.</div>`:"");
  m.scrollTop=m.scrollHeight;
  /* 🆘 botones de recuperación dentro de un mensaje (reenviar / continuar / recargar) */
  { const bc=$("#iaCancel"); if(bc) bc.onclick=iaCancelarEspera; }
  try{ iaPintarTools(); }catch(_){}   /* 🤖 las tarjetas sobreviven a cualquier repintado */
  m.querySelectorAll("[data-acc]").forEach(b=>{
    b.onclick=(e)=>{ e.stopPropagation(); const a=IA_ACCIONES[b.dataset.acc]; if(a && a.fn) a.fn(); };
  });
  m.querySelectorAll("[data-speak]").forEach(b=>{
    b.onclick=()=>{ const i=+b.dataset.speak;
      if(IA.hablandoIdx===i){ iaVozParar(); } else { iaHablar(c.msgs[i].content, i); } };
  });
}

/* Reloj real desde el teléfono: hora Brasil + Nueva York + ventana operativa.
   Le quita al mentor el bache de "no tengo reloj". America/New_York maneja
   EST/EDT solo, así que el desfase sale siempre correcto. */
function iaReloj(){
  try{
    const now=new Date();
    const brasil=new Intl.DateTimeFormat("es",{timeZone:"America/Sao_Paulo",weekday:"long",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:false}).format(now);
    const ny=new Intl.DateTimeFormat("es",{timeZone:"America/New_York",weekday:"long",hour:"2-digit",minute:"2-digit",hour12:false}).format(now);
    const p=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",hour12:false,weekday:"short"}).formatToParts(now);
    let h=0,mm=0,wd=""; p.forEach(x=>{ if(x.type==="hour")h=+x.value; if(x.type==="minute")mm=+x.value; if(x.type==="weekday")wd=x.value; });
    const t=h*60+mm, finde=(wd==="Sat"||wd==="Sun");
    let vent="FUERA de ventana operativa";
    if(finde) vent="fin de semana (mercado FX cerrado)";
    else if(t>=450 && t<570) vent="Pre-NY Kill Zone (7:30–9:30 NY, la MEJOR ventana)";
    else if(t>=570 && t<690) vent="NY Apertura (9:30–11:30 NY)";
    else if(t>=120 && t<300) vent="Londres (2:00–5:00 NY)";
    let extra="";
    if(!finde && t>=690 && t<810) extra=" — ojo: NY Lunch (11:30–1:30 NY), trampas, no operar";
    if(wd==="Fri" && t>=720) extra=" — viernes tras 12 PM NY: solo gestión, nada nuevo";
    return `[Reloj EN VIVO del teléfono del alumno] Hora Brasil (UTC−3): ${brasil}. Hora Nueva York: ${ny}. Por el reloj, ventana: ${vent}${extra}. Usa esta hora con confianza para responder cualquier duda de horario. La fila 'Killzone' del panel del indicador sigue siendo la fuente de verdad FINAL: si el reloj y el panel se contradicen, manda el panel y dilo en una línea.`;
  }catch(e){ return "[Reloj] no disponible en este dispositivo."; }
}

/* Resumen compacto de datos del contexto activo, para personalizar las respuestas */
function iaContexto(){
  const list=tradesCtx(); const m=list.length?metricas(list):null;
  let c=`[Pares que sigue AHORA: ${PARES.join(", ")}] [Datos del alumno · ${CTX.modo==="real"?"cuenta real":"backtest"} · estrategia ${CTX.estrategia}] `;
  /* BUGFIX: aunque NO haya trades, hay que seguir e incluir SIEMPRE las cuentas.
     Antes se cortaba aquí y el bloque [CUENTAS] nunca llegaba a Roberto si el
     alumno tenía cuentas pero cero trades ligados. */
  if(!m){ return c+"Aún no tiene trades registrados en este contexto (empezando de cero)."+iaCuentas(); }
  c+=`${m.n} trades. R neto ${r1(m.rNeto)}R. Win rate ${pct(m.wr*100)}. Profit factor ${fmtPF(m.pf)}. Expectancy ${r2(m.exp)}R por trade. RR real 1:${r1(m.rrReal)}. Drawdown máx ${r1(m.dd)}R. Plan roto en ${m.roto} trades, ${m.emoMal} con prisa/ansiedad, ${m.fueraVent} fuera de ventana, ${m.setupsC} setups C. `;
  const rank=[]; DIMS_MENTOR.forEach(([dim,fn])=>{ cortePor(list,fn).forEach(x=>{ if(x.n>=3) rank.push({dim,k:x.k,exp:x.exp,n:x.n}); }); });
  rank.sort((a,b)=>b.exp-a.exp);
  if(rank.length){ const b=rank[0], w=rank[rank.length-1];
    c+=`Mejor categoría: ${b.dim} "${b.k}" (${r2(b.exp)}R exp en ${b.n}). Peor categoría: ${w.dim} "${w.k}" (${r2(w.exp)}R exp en ${w.n}).`; }
  return c + iaCuentas();
}
/* Lista de los ⏰ Avisos ACTUALES de Rey, inyectada en cada mensaje, para que
   Roberto sepa exactamente qué tiene puesto y pueda apagar/editar el correcto
   con sus manos (los identifica por su HORA). Sin esto no sabía qué había. */
function iaAvisos(){
  const arr=Array.isArray(REMINDERS)?REMINDERS:[];
  if(!arr.length) return "[⏰ AVISOS de Rey en Apex: no tiene ninguno puesto ahora mismo.]";
  const filas=arr.map(r=>`  ${r.hora} · ${r.tit} · ${diasLabel(r.dias)} · ${r.on?"ACTIVO":"apagado"}${r.tipo==="fuerte"?" · fuerte":""}`).join("\n");
  return "[⏰ AVISOS actuales de Rey en Apex (YA los tienes aquí — NO le pidas la lista ni capturas). Para tus manos: identifícalos por su HORA. Para APAGAR uno usa editar_aviso con on:false (NO hace falta borrarlo); para reactivar, on:true.\n"+filas+"\nNOTA: el GUARDIÁN del servidor ya cubre los killzones (Londres/Pre-NY/NY/NY-Lunch) en hora NY. Si ves aquí avisos MANUALES de killzone con hora fija, están DUPLICADOS: ofrécele apagarlos con tu tarjeta de confirmación.]";
}

/* PUENTE APEX — lee el estado del gráfico en vivo desde el Worker (/chart/state).
   Si la PC está conectada (viva), Roberto "ve" el gráfico: dashboard, posición,
   precio y niveles. Si no, se lo dice claro para que Rey encienda la PC. */
async function iaGrafico(){
  try{
    const r=await fetch(iaBase()+"/chart/state",{cache:"no-store"});
    if(!r.ok) return "[👁️ GRÁFICO EN VIVO: el puente no respondió en este instante.]";
    const d=await r.json();
    const pares=Array.isArray(d.pares)?d.pares:(d.estado?[d.estado]:[]);
    if(!d || !d.viva || !pares.length)
      return "[👁️ GRÁFICO EN VIVO: la PC de Rey NO está conectada ahora (sin lectura fresca del puente). Si te pide análisis del gráfico en vivo, dile con cariño que encienda la PC y abra el 'Puente Apex' (doble clic en 'Arrancar Puente Apex'). NO inventes niveles ni digas que ves el gráfico si no está vivo.]";
    let s="[👁️ GRÁFICOS EN VIVO ("+pares.length+" par(es), leído(s) hace "+(d.edad_seg||0)+"s por el Puente Apex — ES REAL, úsalo como verdad):\n";
    pares.forEach(e=>{
      s+="\n── "+(e.symbol||"?")+" · TF "+(e.resolution||"?")+" · Precio "+(e.price!=null?e.price:"?")+" ──\n";
      if(Array.isArray(e.tablas) && e.tablas.length){ e.tablas.forEach(t=>(t.rows||[]).forEach(row=>{ s+="   "+row+"\n"; })); }
      if(Array.isArray(e.posiciones) && e.posiciones.length){
        s+="  Posición puesta por Rey (léela y valídala/rectifícala): "+e.posiciones.map(p=>p.dir+" ent "+p.entry+" SL "+p.sl+" TP "+p.tp+" RR 1:"+p.rr+" ("+(p.riesgo_pct!=null?p.riesgo_pct+"%":"?")+")"+(p.mae!=null?" · MAE "+p.mae+"R":"")+(p.mfe!=null?" · MFE "+p.mfe+"R":"")).join(" | ")+"\n";
      }
      if(Array.isArray(e.niveles) && e.niveles.length && e.price!=null){
        const arr=e.niveles.map(n=>n.price).filter(v=>v!=null);
        const arriba=arr.filter(v=>v>e.price).sort((a,b)=>a-b).slice(0,5);
        const abajo=arr.filter(v=>v<e.price).sort((a,b)=>b-a).slice(0,5);
        if(arriba.length) s+="  Niveles arriba: "+arriba.join(", ")+"\n";
        if(abajo.length)  s+="  Niveles abajo: "+abajo.join(", ")+"\n";
      }
    });
    s+="]\nCÓMO USAR ESTO: si Rey te nombra UN par ('analiza EUR/USD'), analiza ESE. Si NO especifica y hay VARIOS pares, compáralos y dile en CUÁL hay mejor oportunidad hoy (o si en ambos) y por qué, luego enfoca el/los que tengan setup válido. Nunca mezcles datos de un par con otro.";
    return s;
  }catch(_){ return "[👁️ GRÁFICO EN VIVO: no pude leer el puente en este instante.]"; }
}

/* PLAN DE LA SEMANA persistente: se inyecta en CADA mensaje para que Roberto lo
   recuerde toda la semana y detecte si se invalidó por precio o noticias. */
function iaPlanSemanal(){
  if(!PLANSEM || !PLANSEM.bias) return "[🗓️ PLAN SEMANAL: aún no hay uno guardado. Cuando hagas el análisis semanal, guárdalo con guardar_plan_semanal para recordarlo toda la semana.]";
  let s="[🗓️ PLAN SEMANAL VIGENTE (guardado el "+PLANSEM.fecha+" — RECUÉRDALO y compáralo con el gráfico en vivo y las noticias en CADA respuesta):\n";
  s+="Bias: "+PLANSEM.bias+(PLANSEM.par?(" ("+PLANSEM.par+")"):"")+"\n";
  if(PLANSEM.zonaP) s+="Zona principal: "+PLANSEM.zonaP+"\n";
  if(PLANSEM.zonaS) s+="Zona secundaria: "+PLANSEM.zonaS+"\n";
  if(PLANSEM.invalid) s+="⚠️ Nivel de INVALIDACIÓN: "+PLANSEM.invalid+" — si el precio en vivo lo rompió (o una noticia roja cambió el panorama), el SESGO SEMANAL CAMBIÓ: díselo claramente a Rey y ADÁPTATE (actualiza el plan con guardar_plan_semanal).\n";
  if(PLANSEM.mejorDia) s+="Mejor día: "+PLANSEM.mejorDia+"\n";
  if(PLANSEM.evitar) s+="Días a evitar: "+PLANSEM.evitar+"\n";
  if(PLANSEM.notas) s+="Notas: "+PLANSEM.notas+"\n";
  s+="REGLA: el plan semanal MANDA sobre el diario, salvo que se invalide por ruptura de estructura mayor o noticia fuerte. Si sigue válido, respétalo.]";
  return s;
}

/* Entradas ABIERTAS ya registradas en el Diario, para que Roberto NO las duplique
   y sepa cuáles posiciones del gráfico en vivo aún NO ha registrado (y las ofrezca). */
function iaEntradasAbiertas(){
  const ab=(Array.isArray(TRADES)?TRADES:[]).filter(t=>t.abierta && t.modo===CTX.modo && t.estrategia===CTX.estrategia);
  if(!ab.length) return "[📒 ENTRADAS ABIERTAS ya registradas en el Diario: ninguna. Si ves una posición en el gráfico en vivo, aún no la has registrado → ofrécele a Rey registrarla con registrar_entrada.]";
  const filas=ab.map(t=>"  "+t.par+" "+t.dir+" ent "+(t.entrada!=null?t.entrada:"?")+(t.sl!=null?" SL "+t.sl:"")+(t.tp!=null?" TP "+t.tp:"")+(t.rr?" RR 1:"+t.rr:"")).join("\n");
  return "[📒 ENTRADAS ABIERTAS ya registradas en el Diario (NO las vuelvas a registrar; si el gráfico muestra una posición que NO está en esta lista, ESA sí ofrécele registrarla):\n"+filas+"]";
}

/* Calendario en caché (10 min) para no golpear la red en cada mensaje a Roberto */
let _calCache=null, _calCacheTs=0;
async function cargarCalendarioCache(){
  const now=Date.now();
  if(_calCache && (now-_calCacheTs)<600000) return _calCache;
  const ev=await cargarCalendario();
  if(ev){ _calCache=ev; _calCacheTs=now; }
  return ev||_calCache;
}
/* Bloque de noticias del día que se le INYECTA a Roberto en cada mensaje,
   para que SIEMPRE tenga los datos económicos y nunca diga que no tiene acceso. */
function iaCalendarioContexto(eventos){
  if(!eventos) return "[NOTICIAS DEL DÍA: no pude leer el calendario en este instante. Dile a Rey que lo revise en la pestaña 📰 Noticias o que reintente; no afirmes que no existe la función.]";
  const mon=monedasDe(CAL_FILTRO.concat(PARES));
  const hoy=nyFechaISO(0), man=nyFechaISO(1);
  const rel=eventos.filter(e=>{
    const day=String(e.date||"").slice(0,10);
    return (day===hoy||day===man) && mon.has(String(e.country||"").toUpperCase()) && /High|Medium/i.test(e.impact||"");
  }).sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  const monTxt=[...mon].join("/");
  if(!rel.length) return "[CALENDARIO REAL de ForexFactory (YA lo tienes en la app — NO digas que no tienes acceso). HOY y MAÑANA NO hay noticias de alto/medio impacto para "+monTxt+". Vía libre por noticias.]";
  return "[CALENDARIO REAL de ForexFactory que YA TIENES en la app — ÚSALO, nunca digas que no tienes datos ni acceso. Noticias de HOY/MAÑANA para sus monedas ("+monTxt+"), hora de Nueva York:\n"+calTextoDe(rel)+"\nRegla de oro: no operar 15 min antes ni después de cada roja/naranja.]";
}
/* Convierte un mensaje guardado al formato de la API.
   La imagen SOLO se envía en el mensaje ACTUAL (conFoto=true). En los turnos
   anteriores se manda solo el texto: reenviar la foto pesada en cada pregunta
   de seguimiento rompía la respuesta (salía vacía) y gastaba de más. */
function iaMsgApi(x, conFoto){
  if(x.role==="user" && x.img && conFoto){
    const b64=x.img.split(",")[1]||"";
    return { role:"user", content:[
      { type:"image", source:{ type:"base64", media_type:"image/jpeg", data:b64 } },
      { type:"text", text:x.content||"" }
    ]};
  }
  if(x.role==="user" && x.img){
    return { role:"user", content:[{ type:"text", text:"(Te envié un gráfico antes) "+(x.content||"") }] };
  }
  /* 💰 v6.02: los mensajes de Rey van SIEMPRE como lista de bloques (igual que cuando fueron
     "el último" con su marca de caché). Así el prefijo queda byte-idéntico entre llamadas y
     el caché del historial pega de verdad. Los de Roberto siguen como texto plano (estables). */
  if(x.role==="user"){
    return { role:"user", content:[{ type:"text", text:x.content||"" }] };
  }
  return { role:x.role, content:x.content };
}
/* 📄 Documento adjunto (PDF o texto) -> bloque real para que Roberto lo LEA entero.
   El PDF va como document/base64 (la IA lo lee de verdad, no solo el nombre); el texto
   se inyecta como texto plano. Solo viaja en el ÚLTIMO mensaje, nunca se guarda en el chat. */
function iaDocBloques(doc, texto){
  if(!doc) return null;
  if(doc.tipo==="pdf"){
    return [ { type:"document", source:{ type:"base64", media_type:"application/pdf", data:doc.b64 } },
             { type:"text", text:texto||"" } ];
  }
  return [ { type:"text", text:"📄 DOCUMENTO QUE TE COMPARTO (\""+(doc.nombre||"documento")+"\"):\n\n"+(doc.texto||"")+"\n\n— fin del documento —" },
           { type:"text", text:texto||"" } ];
}

/* ============================================================
   MANOS DE ROBERTO — herramientas que ejecuta DENTRO de Apex
   (siempre con tarjeta de confirmación: Rey aprueba y recién ahí se ejecuta)
   ============================================================ */
const IA_TOOLS = [
  { name:"crear_aviso", description:"Crea un recordatorio/aviso de rutina en la sección Avisos de Apex. Le llega a Rey en segundo plano a la hora indicada (hora de Brasil).",
    input_schema:{ type:"object", properties:{
      hora:{type:"string",description:"Hora HH:MM 24h (hora de Brasil)"},
      tit:{type:"string",description:"Título corto, empieza con un emoji"},
      msg:{type:"string",description:"Texto del recordatorio"},
      dias:{type:"array",items:{type:"string",enum:["lun","mar","mie","jue","vie","sab","dom"]},description:"Días de la semana en que suena. Elige LOS QUE HAGAN FALTA (uno, varios o todos). Ej: ['lun'] solo lunes; ['lun','mie','vie']; ['sab','dom'] fin de semana; los 7 = todos los días."},
      tipo:{type:"string",enum:["normal","fuerte"],description:"fuerte = se queda en pantalla con vibración fuerte"},
      destino:{type:"string", enum:IR_DESTINOS.map(d=>d.v), description:"A DÓNDE lleva el toque de la notificación. TODOS los chips del chat existen como destino — elige SIEMPRE el que corresponda EXACTAMENTE al contenido del aviso: backtesting/práctica → 'rob:replay' (Práctica Replay = backtesting guiado); check emocional → 'rob:checkemo'; escalado → 'rob:escalado'; comparar pares → 'rob:comparar'; revisar memoria → 'rob:memoria'; registrar trade → 'tab:diario'; mirar el día → 'tab:hoy'; los 'rob:q:*' abren el chat lanzando esa consulta (operativa, fuga, gatillar, alarmas, fondeo, firmas, interés compuesto). NUNCA pongas un destino que no corresponda al aviso. Déjalo vacío solo si de verdad no encaja en ninguno."},
    }, required:["hora","tit","msg","dias"] } },
  { name:"editar_aviso", description:"Edita un aviso existente, identificándolo por su hora ACTUAL. Para APAGARLO (sin borrarlo) pasa on:false; para reactivarlo, on:true.",
    input_schema:{ type:"object", properties:{
      hora_actual:{type:"string",description:"Hora actual (HH:MM) del aviso a editar"},
      on:{type:"boolean",description:"true = activar el aviso; false = apagarlo (queda en la lista pero no suena)"},
      hora:{type:"string"}, tit:{type:"string"}, msg:{type:"string"}, dias:{type:"array",items:{type:"string",enum:["lun","mar","mie","jue","vie","sab","dom"]},description:"Nuevos días (los que hagan falta)"}, tipo:{type:"string",enum:["normal","fuerte"]},
      destino:{type:"string",enum:IR_DESTINOS.map(d=>d.v),description:"Nuevo destino del toque de la notificación (mismos valores que en crear_aviso). Úsalo para CORREGIR un aviso que abría en el lugar equivocado."}
    }, required:["hora_actual"] } },
  { name:"borrar_aviso", description:"Borra un aviso por su hora (y opcionalmente parte del título).",
    input_schema:{ type:"object", properties:{ hora:{type:"string"}, tit:{type:"string"} }, required:["hora"] } },
  { name:"set_pares", description:"Cambia los pares que Rey sigue (afecta notificaciones, calendario de noticias y el vigilante).",
    input_schema:{ type:"object", properties:{ pares:{type:"array",items:{type:"string"},description:"Ej. ['EUR/USD','XAU/USD']"} }, required:["pares"] } },
  { name:"registrar_trade", description:"Registra una operación en el Diario de Rey a partir de lo que él te cuente. Afecta sus estadísticas, así que confírmalo siempre.",
    input_schema:{ type:"object", properties:{
      par:{type:"string",description:"Par, ej. EUR/USD"},
      dir:{type:"string",enum:["Compra","Venta"]},
      res:{type:"string",enum:["Ganado","Perdido","BE"],description:"Resultado (si no lo dice, dedúcelo del R)"},
      r:{type:"number",description:"Resultado en R (ej. 2.5, o -1 si fue stop)"},
      setup:{type:"string",enum:["A+","B","C"]},
      ventana:{type:"string",description:"Ventana operativa, ej. 'Pre-NY Kill Zone'"},
      momento:{type:"string",enum:["En confirmación","En el toque","Anticipé"],description:"Cómo entró (clave para su fuga de timing)"},
      bias:{type:"string",enum:["A favor","En contra"]},
      nconf:{type:"number",description:"Nº de confluencias"},
      plan:{type:"string",enum:["Sí","No"],description:"¿Siguió el plan?"},
      nota:{type:"string"}
    }, required:["par","r"] } },
  { name:"registrar_entrada", description:"Registra en el 📒 Diario una ENTRADA que Rey ACABA de poner (posición ABIERTA, aún sin resultado) con sus datos de precio. Úsalo cuando VEAS una herramienta de posición nueva en el gráfico en vivo (léela: entrada/SL/TP/RR/riesgo) o cuando Rey lo pida. NO afecta las estadísticas hasta que se cierre. SIEMPRE con confirmación.",
    input_schema:{ type:"object", properties:{
      par:{type:"string",description:"Par, ej. EUR/USD"},
      dir:{type:"string",enum:["Compra","Venta"]},
      entrada:{type:"number",description:"Precio de entrada leído del gráfico"},
      sl:{type:"number",description:"Precio del Stop Loss"},
      tp:{type:"number",description:"Precio del Take Profit"},
      rr:{type:"number",description:"Riesgo:beneficio, ej. 2.3"},
      riesgoPct:{type:"string",description:"Riesgo en % (ej. '0.5')"},
      setup:{type:"string",enum:["A+","B","C"]},
      ventana:{type:"string",description:"Ventana operativa, ej. 'Pre-NY Kill Zone'"},
      momento:{type:"string",enum:["En confirmación","En el toque","Anticipé"],description:"Cómo entró (clave para su fuga de timing)"},
      bias:{type:"string",enum:["A favor","En contra"]},
      nconf:{type:"number",description:"Nº de confluencias"},
      zona:{type:"string",description:"Zona, ej. Premium/Discount/OB/FVG"},
      poi:{type:"string",enum:["FVG","Order Block","Breaker"],description:"Punto de interés de entrada (para que coincida con el ⚡ Gatillo)"},
      gtf:{type:"string",description:"Temporalidad del gatillo, ej. 5M o 3M (por defecto 5M)"},
      cuenta:{type:"string",description:"Cuenta en la que opera (alias/firma)"},
      nota:{type:"string"}
    }, required:["par","dir","entrada"] } },
  { name:"cerrar_entrada", description:"Cierra una ENTRADA abierta del Diario y le pone su resultado (pasa a contar en estadísticas). OJO: el gráfico NO sabe cómo cerró de verdad; pídele a Rey el PRECIO al que cerró (o 'TP'/'SL'/'BE'/'salí antes en X'). Si te da el precio de cierre, pásalo en precio_cierre y el sistema calcula el R EXACTO con su entrada y SL. Si Rey te da el R directo, usa r. Identifícala por el par (o la más reciente abierta).",
    input_schema:{ type:"object", properties:{
      par:{type:"string",description:"Par de la entrada a cerrar (si se omite, la más reciente abierta)"},
      precio_cierre:{type:"number",description:"Precio al que Rey cerró (el sistema calcula el R con su entrada/SL). Si tocó TP, usa el precio del TP; si tocó SL, el del SL; si salió antes, el precio real de salida."},
      r:{type:"number",description:"Resultado en R directo (solo si Rey te lo da en R, ej. 2.5 o -1). Si das precio_cierre, no hace falta."},
      res:{type:"string",enum:["Ganado","Perdido","BE"]},
      mae:{type:"number",description:"MAE en R (máximo EN CONTRA). Tómalo del bloque en vivo de la posición si aparece (el puente lo calculó solo)."},
      mfe:{type:"number",description:"MFE en R (máximo A FAVOR). Tómalo del bloque en vivo de la posición si aparece."},
      nota:{type:"string"}
    }, required:[] } },
  { name:"capturar_grafico", description:"Pide al Puente una CAPTURA de pantalla del gráfico de un par (además de las automáticas de apertura/cierre). Úsalo cuando Rey diga 'saca captura' o quieras guardar una imagen para analizar. Tarda unos segundos (el Puente la sube a la nube). Si hay una entrada abierta de ese par, la foto se guarda en ella.",
    input_schema:{ type:"object", properties:{ par:{type:"string",description:"Par a capturar, ej. EUR/USD (di el que Rey esté operando)"} }, required:["par"] } },
  { name:"limpiar_capturas", description:"Borra capturas SUELTAS (las que no están dentro de un trade) para liberar espacio. Filtra por par y/o fecha; sin filtro borra TODAS las sueltas. Las capturas ligadas a un trade NO se tocan. Confírmalo siempre.",
    input_schema:{ type:"object", properties:{ par:{type:"string"}, fecha:{type:"string",description:"YYYY-MM-DD"} }, required:[] } },
  { name:"limpiar_diario_ejecutor", description:"Borra del ARCHIVO del Ejecutor (el bot de MT5, pestaña 🤖) operaciones ANTIGUAS que Rey ya no quiera almacenadas. ÚSALO SOLO cuando Rey lo pida explícitamente: su archivo es de LARGO PLAZO (días/semanas/meses/años) y por defecto se conserva TODO. JAMÁS toca el Diario personal de Rey. Confírmalo siempre.",
    input_schema:{ type:"object", properties:{ antes_de:{type:"string",description:"Borra todo lo ANTERIOR a esta fecha (YYYY-MM-DD)"}, mes:{type:"string",description:"O borra un mes completo (YYYY-MM)"} }, required:[] } },
  { name:"guardar_plan_semanal", description:"Guarda/actualiza el PLAN DE LA SEMANA de Rey para RECORDARLO toda la semana y detectar si se invalida. Úsalo al terminar el análisis semanal, o cuando el plan CAMBIE por una ruptura del nivel de invalidación o una noticia fuerte. Confírmalo siempre.",
    input_schema:{ type:"object", properties:{
      bias:{type:"string",description:"COMPRAS / VENTAS / RANGO-ESPERAR"},
      par:{type:"string",description:"Par(es) del plan, ej. GBP/USD"},
      zona_principal:{type:"string",description:"Zona de interés principal con precio"},
      zona_secundaria:{type:"string"},
      nivel_invalidacion:{type:"string",description:"Precio que INVALIDA el bias si el precio lo rompe"},
      mejor_dia:{type:"string"},
      dias_evitar:{type:"string"},
      notas:{type:"string"}
    }, required:["bias"] } },
  { name:"borrar_trade", description:"Borra un registro del 📒 Diario. Identifícalo por el par (toma el MÁS RECIENTE de ese par) o por par+fecha. Afecta estadísticas: confírmalo SIEMPRE.",
    input_schema:{ type:"object", properties:{ par:{type:"string",description:"Par del trade a borrar"}, fecha:{type:"string",description:"YYYY-MM-DD (opcional, para precisar cuál)"} }, required:["par"] } },
  { name:"editar_trade", description:"Edita un registro existente del 📒 Diario, identificándolo por el par (el más reciente) o par+fecha. Cambia SOLO los campos que pases. Confírmalo siempre.",
    input_schema:{ type:"object", properties:{
      par:{type:"string",description:"Par del trade a editar"}, fecha:{type:"string",description:"YYYY-MM-DD (opcional)"},
      r:{type:"number",description:"Nuevo resultado en R"}, res:{type:"string",enum:["Ganado","Perdido","BE"]},
      setup:{type:"string",enum:["A+","B","C"]}, momento:{type:"string",enum:["En confirmación","En el toque","Anticipé"]},
      bias:{type:"string",enum:["A favor","En contra"]}, ventana:{type:"string"}, nconf:{type:"number"}, zona:{type:"string"},
      entrada:{type:"number"}, sl:{type:"number"}, tp:{type:"number"}, nota:{type:"string"}
    }, required:["par"] } },
  { name:"crear_cuenta", description:"Crea una cuenta de fondeo/real en la pestaña Cuentas. Tú ya conoces las reglas típicas de las firmas; rellena lo que sepas y Rey confirma.",
    input_schema:{ type:"object", properties:{
      alias:{type:"string"}, firma:{type:"string"}, capital:{type:"string"},
      fase:{type:"string",enum:["Examen F1","Examen F2","Fondeada","Real","Propia"]},
      riesgoPct:{type:"string"}, ddMaxPct:{type:"string"}, ddTipo:{type:"string",enum:["Estático","Trailing"]},
      ddDailyPct:{type:"string"}, targetPct:{type:"string"}, diasMin:{type:"string"}, precio:{type:"string"}, splitPct:{type:"string"}, nota:{type:"string"}
    }, required:["firma"] } },
  { name:"editar_cuenta", description:"Edita una cuenta existente, identificándola por su alias o firma.",
    input_schema:{ type:"object", properties:{
      alias:{type:"string",description:"Alias o firma para identificar la cuenta a editar"}, firma:{type:"string"},
      capital:{type:"string"}, fase:{type:"string",enum:["Examen F1","Examen F2","Fondeada","Real","Propia"]}, riesgoPct:{type:"string"},
      ddMaxPct:{type:"string"}, ddTipo:{type:"string",enum:["Estático","Trailing"]}, ddDailyPct:{type:"string"}, targetPct:{type:"string"}, diasMin:{type:"string"}, precio:{type:"string"}, splitPct:{type:"string"}, balance:{type:"string"}, nota:{type:"string"}
    }, required:["alias"] } },
  { name:"avanzar_fase", description:"Avanza una cuenta a la siguiente fase (Examen F1→F2→Fondeada→Real→Propia).",
    input_schema:{ type:"object", properties:{ alias:{type:"string",description:"Alias o firma de la cuenta"} }, required:["alias"] } },
  { name:"cambiar_par", description:"Cambia el PAR (símbolo) que muestra el gráfico de TradingView de Rey en su PC, por el Puente Apex. Úsalo cuando Rey te pida ver o cambiar a otro par. Requiere la PC encendida con el Puente. Rey lo aprueba con una tarjeta.",
    input_schema:{ type:"object", properties:{ symbol:{type:"string",description:"Símbolo TradingView, ej. 'GBPUSD', 'OANDA:EURUSD', 'XAUUSD'"}, target:{type:"string",description:"(opcional) par ACTUAL de la pestaña a cambiar, si hay varias abiertas"} }, required:["symbol"] } },
  { name:"cambiar_temporalidad", description:"Cambia la TEMPORALIDAD del gráfico de Rey por el Puente. Requiere PC con Puente. Rey aprueba.",
    input_schema:{ type:"object", properties:{ timeframe:{type:"string",description:"Código TradingView: '1','3','5','15','30','60','240','D','W'"}, target:{type:"string",description:"Par del gráfico donde ejecutar, ej. 'EURUSD'. Ponlo SIEMPRE (el par del que estáis hablando); si su pestaña no está abierta, el Puente la abre solo."} }, required:["timeframe","target"] } },
  { name:"cambiar_tipo_grafico", description:"Cambia el TIPO de gráfico (velas, línea, Heikin Ashi…) por el Puente. Requiere PC con Puente. Rey aprueba.",
    input_schema:{ type:"object", properties:{ chart_type:{type:"string",enum:["Candles","HeikinAshi","Line","Area","Bars","HollowCandles"]}, target:{type:"string",description:"Par del gráfico donde ejecutar, ej. 'EURUSD'. Ponlo SIEMPRE."} }, required:["chart_type","target"] } },
  { name:"ajustar_indicador", description:"Ajusta UNA configuración del indicador CRT Elite de Rey en su gráfico (por el Puente). Referencia el ajuste por su NOMBRE exacto o casi (ej. 'Pivote 4H', 'Sensibilidad de pivotes', 'Riesgo por trade (%)', 'Máximo de entradas por sesión', 'Killzone Londres', 'Riesgo:Beneficio (TP final)'). El valor: número, true/false, o texto según el ajuste. SIEMPRE con la aprobación de Rey (tarjeta). Requiere PC con Puente. Propón un ajuste solo cuando Rey lo pida o cuando de verdad convenga (explícale por qué).",
    input_schema:{ type:"object", properties:{ ajuste:{type:"string",description:"Nombre del ajuste tal como aparece en el indicador"}, valor:{description:"Nuevo valor: número (5, 0.5), booleano (true/false) o texto"}, target:{type:"string",description:"Par del gráfico donde aplicar el ajuste, ej. 'EURUSD'. OBLIGATORIO: cada gráfico tiene SU copia del indicador — sin el par correcto el cambio cae en otro. Si su pestaña no está abierta, el Puente la abre solo."} }, required:["ajuste","valor","target"] } },
  { name:"guardar_memoria", description:"Guarda en tu MEMORIA permanente un dato importante que debas recordar en el futuro sobre Rey, su forma de operar, su psicología, sus preferencias, o un patrón/lección de trading. Úsalo SOLO con lo verdaderamente RELEVANTE para tu adaptación y aprendizaje — NO guardes todo ni trivialidades ni cosas de un solo momento; filtra con criterio lo que de verdad te servirá a futuro. Indica SIEMPRE el TEMA: tu memoria se organiza por áreas y así podrás razonar por área. Rey lo aprueba antes de guardar.",
    input_schema:{ type:"object", properties:{
      tipo:{type:"string", enum:["perfil","aprendizaje","preferencia","patron","resultado"], description:"Categoría del recuerdo."},
      tema:{type:"string", enum:["psicologia","gestion","estrategia","pares","mercado","indicador","resultados","visual","personal","general"], description:"Área del recuerdo. Usa 'visual' para los patrones que descubras MIRANDO sus capturas de pantalla."},
      texto:{type:"string", description:"El dato a recordar, claro y en 1-2 frases."}
    }, required:["texto"] } },
  { name:"borrar_memoria", description:"Borra un dato de tu memoria por su id (aparece entre paréntesis en tu bloque de memoria) cuando descubras que ya no es cierto o quedó obsoleto. Rey lo aprueba.",
    input_schema:{ type:"object", properties:{ id:{type:"string"} }, required:["id"] } },
  { name:"dibujar_linea", description:"DIBUJA una línea horizontal (un nivel de precio) en el gráfico de Rey por el Puente. Úsala para marcar un nivel importante: resistencia, soporte, PDH/PDL, un nivel de liquidez, un objetivo. Requiere PC con Puente. Rey aprueba con tarjeta.",
    input_schema:{ type:"object", properties:{ precio:{type:"number",description:"El precio exacto del nivel"}, texto:{type:"string",description:"(opcional) etiqueta corta, ej. 'Resistencia', 'PDH', 'Liquidez'"}, color:{type:"string",description:"(opcional) color hex, ej. '#e0a83a'"}, target:{type:"string",description:"Par del gráfico donde dibujar, ej. 'EURUSD'. Ponlo SIEMPRE; si su pestaña no está abierta, el Puente la abre solo."} }, required:["precio","target"] } },
  { name:"dibujar_zona", description:"DIBUJA una zona rectangular (un rango de precios) en el gráfico: Premium/Discount, un order block, un FVG, una zona de interés (POI). Requiere PC con Puente. Rey aprueba.",
    input_schema:{ type:"object", properties:{ precio_alto:{type:"number",description:"Borde superior de la zona"}, precio_bajo:{type:"number",description:"Borde inferior de la zona"}, texto:{type:"string",description:"(opcional) etiqueta, ej. 'Premium', 'OB alcista', 'FVG'"}, color:{type:"string",description:"(opcional) color hex"}, target:{type:"string",description:"Par del gráfico donde dibujar, ej. 'EURUSD'. Ponlo SIEMPRE."} }, required:["precio_alto","precio_bajo","target"] } },
  { name:"dibujar_texto", description:"Escribe una NOTA de texto en el gráfico a un precio dado. Úsalo para dejar una anotación corta (ej. 'espera reacción aquí'). Requiere PC con Puente. Rey aprueba.",
    input_schema:{ type:"object", properties:{ precio:{type:"number",description:"Altura (precio) donde poner el texto"}, texto:{type:"string",description:"El texto de la nota"}, color:{type:"string",description:"(opcional) color hex"}, target:{type:"string",description:"Par del gráfico donde escribir, ej. 'EURUSD'. Ponlo SIEMPRE."} }, required:["precio","texto","target"] } },
  { name:"marcar_entrada", description:"Marca un PUNTO DE ENTRADA o de reacción con una flecha en el gráfico (verde hacia arriba para compra, roja hacia abajo para venta), en la temporalidad de gatillo. Úsalo para señalarle a Rey un buen punto de entrada o dónde esperar una reacción. Requiere PC con Puente. Rey aprueba.",
    input_schema:{ type:"object", properties:{ precio:{type:"number",description:"Precio de la entrada/reacción"}, direccion:{type:"string",enum:["compra","venta"],description:"'compra' (flecha verde arriba) o 'venta' (flecha roja abajo)"}, texto:{type:"string",description:"(opcional) etiqueta, ej. 'Entrada 5m', 'Espera reacción'"}, target:{type:"string",description:"Par del gráfico donde marcar, ej. 'EURUSD'. Ponlo SIEMPRE."} }, required:["precio","direccion","target"] } },
  { name:"borrar_dibujos", description:"Borra los dibujos. Por defecto borra SOLO los que TÚ (Roberto) has dibujado, dejando intactos los de Rey. Si Rey pide limpiar TODO el gráfico, pasa todo=true. Requiere PC con Puente. Rey aprueba.",
    input_schema:{ type:"object", properties:{ todo:{type:"boolean",description:"true = borra TODOS los dibujos del gráfico (incluidos los manuales de Rey). Por defecto false = solo los de Roberto."}, target:{type:"string",description:"Par del gráfico donde borrar, ej. 'EURUSD'. Ponlo SIEMPRE."} }, required:["target"] } },
  { name:"registrar_veredicto", description:"Apunta TU lectura sobre un par cuando te mojes: GO (entrar), NO-GO (no entrar) o ESPERA. Es AUTOMÁTICO (sin tarjeta) y no molesta a Rey. Úsalo SIEMPRE que le des un veredicto sobre una entrada, tanto si es a favor como en contra. Cuando Rey registre el trade se enlaza solo y sabrás en qué acabó tu lectura: es la ÚNICA forma que tienes de medirte y corregirte a ti mismo.",
    input_schema:{ type:"object", properties:{
      par:{type:"string", description:"El par sobre el que te pronuncias, ej. EURUSD"},
      veredicto:{type:"string", enum:["go","nogo","espera"], description:"go = entrar · nogo = no entrar · espera = todavía no hay nada claro"},
      razon:{type:"string", description:"En una o dos frases, POR QUÉ. Concreto: qué viste y qué faltaba."},
      setup:{type:"string", description:"(opcional) Clasificación del setup: A+, B, C…"},
      confianza:{type:"number", description:"Del 1 al 5, cuánta seguridad tienes en esta lectura. Sé honesto: un 5 se paga caro si fallas."}
    }, required:["par","veredicto","razon"] } },
  { name:"marcar_paso_plan", description:"Marca (o desmarca) un paso del PLAN DE ARRANQUE de Rey cuando compruebes en la conversación que ya lo hizo. Es AUTOMÁTICO (sin tarjeta): úsalo cuando Rey te cuente que hizo algo del plan, para que la app y tú vayáis siempre iguales. No inventes: márcalo solo si él lo dijo o lo demostró.",
    input_schema:{ type:"object", properties:{
      paso:{type:"string", description:"El id del paso, tal y como aparece en tu bloque del plan (por ejemplo f1p2)."},
      hecho:{type:"boolean", description:"true para marcarlo como hecho, false para desmarcarlo. Por defecto true."}
    }, required:["paso"] } },
  { name:"avanzar_plan", description:"Hace pasar a Rey a la SIGUIENTE fase de su plan de arranque. Úsalo SOLO cuando el estado real diga que ya cumple la señal de su fase actual. Rey lo aprueba con tarjeta. Si todavía no cumple la señal, NO uses esta herramienta: explícale qué le falta.",
    input_schema:{ type:"object", properties:{
      motivo:{type:"string", description:"Por qué ya puede avanzar, en una frase, con el dato concreto que lo demuestra."}
    }, required:[] } },
  { name:"organizar_chat", description:"Organiza ESTA conversación en tu estructura de chats, con criterio propio. Carpetas: 📌 fijar (temas EN CURSO a tener a mano), ⭐ estrella (lecciones o decisiones CLAVE) y 🔍 revisar (algo pendiente que Rey debe repasar). Márcala cuando lo merezca y QUÍTALE la marca cuando deje de aplicar (true para marcar, false para quitar). Es AUTOMÁTICO (sin tarjeta) y reversible — Rey también las toca a mano. Úsalo con juicio, no abuses.",
    input_schema:{ type:"object", properties:{ fijar:{type:"boolean",description:"true fija 📌, false quita"}, estrella:{type:"boolean",description:"true marca importante ⭐, false quita"}, revisar:{type:"boolean",description:"true marca por revisar 🔍, false quita"}, motivo:{type:"string",description:"(opcional) por qué la marcas, 1 frase"} }, required:[] } },
  { name:"editar_estrategia", description:"Define o edita las REGLAS/ajustes de una de las estrategias de Rey, para ADAPTARLA a lo que van aprendiendo, o para definir una NUEVA (Oro, índices, acciones, etc.) con su instrumento y sus reglas. Por defecto edita la estrategia ACTIVA. Úsalo cuando Rey y tú acuerden un cambio/mejora en su método o al crear una estrategia nueva. Rey lo aprueba con tarjeta.",
    input_schema:{ type:"object", properties:{ nombre:{type:"string",description:"(opcional) estrategia a editar; por defecto la activa"}, instrumento:{type:"string",description:"(opcional) instrumento(s), ej. 'Oro XAU/USD', 'Índices US30/NAS100'"}, ajustes:{type:"string",description:"(opcional) reglas/ajustes/aprendizajes de la estrategia, en texto"} }, required:[] } },
  { name:"buscar_memoria", description:"Busca en TODA tu memoria (incluidos los recuerdos ANTIGUOS que no aparecen en tu contexto). Úsala cuando necesites recordar algo que no ves en tu bloque de memoria actual, o cuando Rey te pregunte por un ÁREA concreta ('¿qué sabes de mi psicología?', '¿qué has aprendido del EUR/USD?'): en ese caso filtra por tema. Es SOLO LECTURA y automática (sin tarjeta). El resultado te llega como texto para seguir razonando.",
    input_schema:{ type:"object", properties:{ consulta:{type:"string",description:"Qué buscar (palabras clave), ej. 'lunes', 'revancha', 'GBP'. Puedes omitirlo si filtras por tema."}, tema:{type:"string", enum:["psicologia","gestion","estrategia","pares","mercado","indicador","resultados","visual","personal","general"], description:"(opcional) Filtra por área de tu memoria."} }, required:[] } },
  { name:"registrar_retiro", description:"Registra un RETIRO/PAYOUT que Rey cobró de una de sus cuentas (dinero real ganado). Suma al total retirado de esa cuenta (y ajusta su balance si lo lleva manual). Úsalo cuando Rey te diga que cobró/retiró dinero. Rey lo aprueba con tarjeta.",
    input_schema:{ type:"object", properties:{ cuenta:{type:"string",description:"Alias o firma de la cuenta (ej. 'FundedNext fondeada')"}, monto:{type:"number",description:"Monto retirado en USD"}, nota:{type:"string",description:"(opcional) nota"} }, required:["monto"] } },
  { name:"revisar_indicador", description:"LEE los ajustes ACTUALES del indicador CRT Elite de Rey en su gráfico (pivotes por temporalidad y sus tolerancias, killzones/sesiones, sesgo/giro, entradas, gestión y riesgo) para AUDITARLOS. Es SOLO LECTURA. Úsalo cuando Rey te pida revisar/auditar su indicador, o cuando quieras comprobar que su configuración es coherente antes de sugerir algo. Cuando tengas los ajustes, dile en claro qué está BIEN y qué conviene AJUSTAR y por qué, y ofrécete a cambiarlo con ajustar_indicador. Requiere PC con Puente.",
    input_schema:{ type:"object", properties:{ target:{type:"string",description:"Par del gráfico a leer, ej. 'EURUSD'. Ponlo SIEMPRE: cada gráfico tiene SU copia del indicador con sus propios ajustes."} }, required:["target"] } }
];
/* Texto humano para la tarjeta de confirmación */
function describeTool(name, i){
  i=i||{};
  if(name==="crear_aviso") return "⏰ Crear aviso — "+(i.hora||"?")+" · "+(i.tit||"")+"\n"+(i.msg||"")+"\n("+diasLabel(i.dias||"LV")+" · "+(i.tipo||"normal")+")"+(i.destino&&irDestinoLabel(i.destino)?("\nAl tocarla abre: "+irDestinoLabel(i.destino)):"");
  if(name==="editar_aviso"){ const onTxt = i.on===false?"→ APAGAR (no sonará)":i.on===true?"→ ACTIVAR":null;
    return "✏️ Editar el aviso de las "+(i.hora_actual||"?")+"\n"+[onTxt,i.hora&&("→ hora "+i.hora),i.tit&&("→ título "+i.tit),i.msg&&("→ mensaje “"+i.msg+"”"),i.dias&&("→ días "+i.dias),i.tipo&&("→ tipo "+i.tipo),i.destino&&irDestinoLabel(i.destino)&&("→ al tocarla abre "+irDestinoLabel(i.destino))].filter(Boolean).join("\n"); }
  if(name==="borrar_aviso") return "🗑️ Borrar el aviso de las "+(i.hora||"?")+(i.tit?(" ("+i.tit+")"):"");
  if(name==="set_pares") return "🎯 Cambiar tus pares a: "+((i.pares||[]).join(", "));
  if(name==="registrar_trade") return "📒 Registrar trade — "+(i.par||"?")+" "+(i.dir||"")+" · "+(i.res||(parseFloat(i.r)>0?"Ganado":parseFloat(i.r)<0?"Perdido":"BE"))+" "+(i.r)+"R\nSetup "+(i.setup||"?")+" · ventana "+(i.ventana||"?")+" · entrada '"+(i.momento||"?")+"'"+(i.plan==="No"?" · PLAN ROTO":"")+(i.nota?("\nNota: "+i.nota):"");
  if(name==="registrar_entrada") return "✍️ Registrar ENTRADA (abierta) — "+(i.par||"?")+" "+(i.dir||"")+"\nEntrada "+(i.entrada!=null?i.entrada:"?")+" · SL "+(i.sl!=null?i.sl:"?")+" · TP "+(i.tp!=null?i.tp:"?")+(i.rr?(" · RR 1:"+i.rr):"")+(i.riesgoPct?(" · riesgo "+i.riesgoPct+"%"):"")+"\nSetup "+(i.setup||"?")+" · "+(i.ventana||"?")+" · '"+(i.momento||"En confirmación")+"'"+(i.zona?(" · "+i.zona):"")+(i.poi?(" · "+i.poi):"")+(i.gtf?(" · gatillo "+i.gtf):"")+(i.nota?("\nNota: "+i.nota):"");
  if(name==="cerrar_entrada"){ const rr=(i.r!=null&&i.r!=="")?(i.r+"R"):(i.precio_cierre!=null?("cierre en "+i.precio_cierre+" → calculo el R"):"?"); return "🏁 Cerrar entrada "+(i.par||"(la más reciente)")+" → "+rr+(i.res?(" · "+i.res):"")+(i.nota?("\nNota: "+i.nota):""); }
  if(name==="capturar_grafico") return "📸 Capturar el gráfico de "+(i.par||"(par actual)");
  if(name==="limpiar_capturas") return "🧹 Limpiar capturas sueltas"+(i.par?(" de "+i.par):"")+(i.fecha?(" del "+i.fecha):" (todas las sueltas)");
  if(name==="limpiar_diario_ejecutor") return "🗑️ Limpiar archivo del Ejecutor"+(i.mes?(" — mes "+i.mes):(i.antes_de?(" — todo lo anterior al "+i.antes_de):""));
  if(name==="guardar_plan_semanal") return "🗓️ Guardar PLAN de la semana"+(i.par?(" ("+i.par+")"):"")+"\nBias: "+(i.bias||"?")+(i.zona_principal?("\nZona: "+i.zona_principal):"")+(i.nivel_invalidacion?("\n⚠️ Invalida en: "+i.nivel_invalidacion):"")+(i.mejor_dia?("\nMejor día: "+i.mejor_dia):"");
  if(name==="borrar_trade") return "🗑️ Borrar del Diario el trade de "+(i.par||"?")+(i.fecha?(" del "+i.fecha):" (el más reciente)");
  if(name==="editar_trade"){ const c=["r","res","setup","momento","bias","ventana","nconf","zona","entrada","sl","tp","nota"].filter(k=>i[k]!=null&&i[k]!=="").map(k=>k+"→"+i[k]).join(", "); return "✏️ Editar el trade de "+(i.par||"?")+(i.fecha?(" del "+i.fecha):" (el más reciente)")+"\n"+(c||"(sin cambios)"); }
  if(name==="crear_cuenta") return "🏦 Crear cuenta — "+(i.alias||i.firma||"?")+(i.firma&&i.alias?(" ("+i.firma+")"):"")+"\nCapital "+(i.capital||"?")+" · fase "+(i.fase||"Examen F1")+" · riesgo "+(i.riesgoPct||"0.5")+"%\nDD máx "+(i.ddMaxPct||"?")+"% ("+(i.ddTipo||"?")+") · daily "+(i.ddDailyPct||"?")+"% · target "+(i.targetPct||"?")+"%"+(i.precio?(" · precio "+i.precio):"");
  if(name==="editar_cuenta") return "✏️ Editar cuenta "+(i.alias||i.firma||"?")+":\n"+["capital","fase","riesgoPct","ddMaxPct","ddTipo","ddDailyPct","targetPct","balance","precio","nota"].filter(k=>i[k]!=null&&i[k]!=="").map(k=>"→ "+k+" "+i[k]).join("\n");
  if(name==="avanzar_fase") return "⏭️ Avanzar de fase la cuenta "+(i.alias||i.firma||"?");
  if(name==="cambiar_par") return "📈 Cambiar el gráfico al par "+(i.symbol||"?")+(i.target?(" (pestaña "+i.target+")"):"");
  if(name==="cambiar_temporalidad"){ const tf={ "1":"1m","3":"3m","5":"5m","15":"15m","30":"30m","60":"1h","240":"4h","D":"Diario","W":"Semanal" }; return "🕐 Cambiar la temporalidad a "+(tf[i.timeframe]||i.timeframe||"?")+(i.target?(" ("+i.target+")"):""); }
  if(name==="cambiar_tipo_grafico") return "📊 Cambiar el tipo de gráfico a "+(i.chart_type||"?");
  if(name==="ajustar_indicador") return "🎛️ Ajustar el indicador CRT Elite:\n“"+(i.ajuste||"?")+"” → "+JSON.stringify(i.valor);
  if(name==="dibujar_linea") return "✍️ Dibujar línea en "+(i.precio!=null?i.precio:"?")+(i.texto?(" — “"+i.texto+"”"):"");
  if(name==="dibujar_zona") return "✍️ Dibujar zona "+(i.precio_bajo!=null?i.precio_bajo:"?")+" – "+(i.precio_alto!=null?i.precio_alto:"?")+(i.texto?(" — “"+i.texto+"”"):"");
  if(name==="dibujar_texto") return "✍️ Escribir nota en "+(i.precio!=null?i.precio:"?")+":\n“"+(i.texto||"")+"”";
  if(name==="marcar_entrada") return "🎯 Marcar entrada "+((String(i.direccion||"").toLowerCase().indexOf("vent")>=0)?"VENTA 🔴":"COMPRA 🟢")+" en "+(i.precio!=null?i.precio:"?")+(i.texto?(" — “"+i.texto+"”"):"");
  if(name==="borrar_dibujos") return i.todo?"🧹 Borrar TODOS los dibujos del gráfico (incluidos los tuyos)":"🧹 Borrar los dibujos que hizo Roberto";
  if(name==="avanzar_plan"){ const f=planFaseActual(); const sg=PLAN_FASES[(PLAN_ARR.fase||0)+1]; return "🧭 Pasar de la fase "+f.n+" ("+f.t+") a la "+(sg?sg.n+" ("+sg.t+")":"siguiente")+(i.motivo?("\nPorque: "+i.motivo):""); }
  if(name==="organizar_chat"){ const p=[]; if(i.fijar!=null)p.push(i.fijar?"📌 fijar":"quitar 📌"); if(i.estrella!=null)p.push(i.estrella?"⭐ importante":"quitar ⭐"); if(i.revisar!=null)p.push(i.revisar?"🔍 por revisar":"quitar 🔍"); return "🗂️ Organizar este chat: "+(p.join(", ")||"(sin cambios)"); }
  if(name==="editar_estrategia"){ return "🎯 Definir/editar la estrategia \""+(i.nombre||CTX.estrategia)+"\":\n"+[i.instrumento&&("→ instrumento: "+i.instrumento), i.ajustes&&("→ reglas/ajustes: "+i.ajustes)].filter(Boolean).join("\n"); }
  if(name==="revisar_indicador") return "🔍 Leer y auditar los ajustes actuales del indicador CRT"+(i.target?(" ("+i.target+")"):"");
  if(name==="registrar_retiro") return "💰 Registrar RETIRO de $"+(i.monto!=null?i.monto:"?")+(i.cuenta?(" de "+i.cuenta):"")+(i.nota?("\nNota: "+i.nota):"");
  if(name==="buscar_memoria") return "🧠 Buscar en toda su memoria: “"+(i.consulta||"?")+"”";
  if(name==="guardar_memoria"){ const et={perfil:"🧍 Perfil",aprendizaje:"💡 Aprendizaje",preferencia:"⭐ Preferencia",patron:"📊 Patrón",resultado:"📓 Resultado"}; return "🧠 Roberto quiere RECORDAR esto en su memoria:\n"+(et[i.tipo]||"💡 Aprendizaje")+"\n“"+(i.texto||"")+"”"; }
  if(name==="borrar_memoria") return "🗑️ Roberto quiere BORRAR de su memoria el dato "+(i.id||"?");
  return name+" "+JSON.stringify(i);
}
/* Envía un comando al Puente (por la nube) y ESPERA su resultado real (hasta ~60s:
   el puente v2 recoge órdenes cada ~3s, pero si tiene que ABRIR la pestaña del par
   puede tardar ~30s en cargar TradingView). Así Roberto sabe si de verdad se aplicó
   o si el Puente no estaba encendido — no más "listo" falso ni falsos fallos. */
async function enviarComando(action, params){
  const cid="c"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  try{ await fetch(nubeUrl()+"/cmd/enqueue",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:cid,action,params})}); }
  catch(_){ return {ok:false,msg:"No pude enviar la orden (sin conexión con la nube)."}; }
  for(let t=0;t<30;t++){
    await new Promise(r=>setTimeout(r,2000));
    try{
      const r=await fetch(nubeUrl()+"/cmd/get?id="+encodeURIComponent(cid),{cache:"no-store"});
      const d=await r.json();
      if(d && d.ok && d.result) return { ok: !!d.result.ok, msg: d.result.msg || (d.result.ok?"Hecho":"No se pudo") };
    }catch(_){}
  }
  return {ok:false,msg:"El Puente no respondió — la orden NO se aplicó. Enciende tu PC con el Puente Apex corriendo y vuelve a intentarlo."};
}
/* Ejecuta la acción (solo se llama TRAS la confirmación de Rey) */
async function ejecutarTool(name, i){
  i=i||{};
  try{
    if(name==="crear_aviso"){
      if(!/^\d{1,2}:\d{2}$/.test(String(i.hora||""))) return {ok:false,msg:"Hora inválida"};
      const hora=i.hora.length===4?("0"+i.hora):i.hora;
      const ir=IR_DESTINOS.some(d=>d.v===i.destino)?i.destino:"";
      const r={ id:"r"+Date.now().toString(36), hora, tit:i.tit||"⏰ Aviso", msg:i.msg||"", dias:parseDias(i.dias||"LV"), tipo:(i.tipo==="fuerte"?"fuerte":"normal"), ir, on:true };
      REMINDERS.push(r); guardarReminders(); syncReminders(); if(TAB==="avisos") renderAvisos();
      return {ok:true,msg:"Aviso creado: "+r.hora+" · "+r.tit+" ("+diasLabel(r.dias)+")"+(ir?(" → abre "+irDestinoLabel(ir)):"")};
    }
    if(name==="editar_aviso"){
      const normH=s=>{ s=String(s||"").trim(); const m=s.match(/^(\d{1,2}):(\d{2})$/); return m?(m[1].padStart(2,"0")+":"+m[2]):s; };
      const ha=normH(i.hora_actual);
      const r=REMINDERS.find(x=>normH(x.hora)===ha);
      if(!r) return {ok:false,msg:"No hay un aviso a las "+i.hora_actual};
      if(i.on!=null && i.on!==""){ r.on = (i.on===true||i.on==="true"||i.on==="on"||i.on===1||i.on==="1"); }
      ["hora","tit","msg","tipo"].forEach(k=>{ if(i[k]!=null && i[k]!=="") r[k]=i[k]; });
      if(i.dias!=null && i.dias!=="") r.dias=parseDias(i.dias);
      if(i.destino!=null && i.destino!=="" && IR_DESTINOS.some(d=>d.v===i.destino)) r.ir=i.destino;   /* v6.05: corregir el destino */
      guardarReminders(); syncReminders(); if(TAB==="avisos") renderAvisos();
      const estado = i.on===false||i.on==="false"?" (APAGADO)":i.on===true||i.on==="true"?" (ACTIVADO)":"";
      return {ok:true,msg:"Aviso actualizado: "+r.hora+" · "+r.tit+estado+(i.destino&&irDestinoLabel(i.destino)?(" → abre "+irDestinoLabel(i.destino)):"")};
    }
    if(name==="borrar_aviso"){
      const normH=s=>{ s=String(s||"").trim(); const m=s.match(/^(\d{1,2}):(\d{2})$/); return m?(m[1].padStart(2,"0")+":"+m[2]):s; };
      const hb=normH(i.hora);
      const c=REMINDERS.filter(x=>normH(x.hora)===hb && (!i.tit || String(x.tit).toLowerCase().includes(String(i.tit).toLowerCase())));
      if(!c.length) return {ok:false,msg:"No encontré ese aviso"};
      const r=c[0]; REMINDERS=REMINDERS.filter(x=>x.id!==r.id); guardarReminders(); syncReminders(); if(TAB==="avisos") renderAvisos();
      return {ok:true,msg:"Aviso borrado: "+r.hora+" · "+r.tit};
    }
    if(name==="set_pares"){
      const v=(i.pares||[]).map(x=>String(x).trim()).filter(Boolean);
      if(!v.length) return {ok:false,msg:"Lista de pares vacía"};
      PARES=v; guardarPares(); CAL_FILTRO=v.slice(); save(K.calpares,CAL_FILTRO); pushConfigPares(); if(TAB==="noticias") renderNoticias();
      return {ok:true,msg:"Pares actualizados: "+v.join(", ")};
    }
    if(name==="registrar_trade"){
      const R=parseFloat(i.r);
      if(isNaN(R)) return {ok:false,msg:"Falta el resultado en R (número)"};
      const f=hoyISO();
      const t={ id:Date.now(), modo:CTX.modo, estrategia:CTX.estrategia, fecha:f, dia:diaSemana(f), hora:new Date().toTimeString().slice(0,5),
        par:i.par||"?", dir:i.dir||"", setup:i.setup||"", res:i.res||(R>0?"Ganado":(R<0?"Perdido":"BE")), r:R,
        ventana:i.ventana||"", momento:i.momento||"", bias:i.bias||"", nconf:parseInt(i.nconf)||0,
        plan:i.plan||"Sí", emo:"", nota:i.nota||"", cuenta:i.cuenta||"", fueraLimite:false, confs:[] };
      TRADES.push(t); save(K.trades,TRADES); try{ veredEnlazar(t); veredActualizar(t); }catch(_){}
      if(typeof refrescarDiarioCtx==="function") refrescarDiarioCtx(); notifChequearCuentasDD(); syncRiesgo();
      return {ok:true,msg:"Trade registrado: "+t.par+" "+(t.dir||"")+" "+(t.res||"")+" "+t.r+"R ("+(t.setup||"?")+", "+(t.momento||"?")+")"};
    }
    if(name==="registrar_entrada"){
      if(i.entrada==null || isNaN(parseFloat(i.entrada))) return {ok:false,msg:"Falta el precio de entrada"};
      const f=hoyISO();
      const num=v=>(v!=null && !isNaN(parseFloat(v)))?parseFloat(v):null;
      const t={ id:Date.now(), modo:CTX.modo, estrategia:CTX.estrategia, fecha:f, dia:diaSemana(f), hora:new Date().toTimeString().slice(0,5),
        par:i.par||"?", dir:i.dir||"", setup:i.setup||"", res:"Abierta", r:0, abierta:true,
        entrada:num(i.entrada), sl:num(i.sl), tp:num(i.tp), rr:num(i.rr), riesgoPct:i.riesgoPct||"",
        ventana:i.ventana||"", momento:i.momento||"En confirmación", bias:i.bias||"", nconf:parseInt(i.nconf)||0,
        zona:i.zona||(i.dir==="Venta"?"Premium":"Discount"),
        poi:i.poi||"FVG", disp:i.disp||((i.poi==="Order Block")?"Order Block":(i.poi==="Breaker")?"Breaker":"FVG 50%"), gtf:i.gtf||"5M",
        plan:"Sí", emo:"", nota:i.nota||"", cuenta:i.cuenta||"", fueraLimite:false, confs:[] };
      // Coherencia con el ⚡ Gatillo: refleja la dirección de la entrada registrada
      try{ if(typeof GAT!=="undefined"){ GAT.dir=(t.dir==="Venta"?"Venta":"Compra"); if(TAB==="gatillo") renderGatillo(); } }catch(_){}
      t.shotOpen=t.id+"_open"; nubeShotReq(t.par, t.shotOpen); // 📸 captura de apertura
      TRADES.push(t); save(K.trades,TRADES); try{ veredEnlazar(t); }catch(_){}
      if(typeof refrescarDiarioCtx==="function") refrescarDiarioCtx();
      return {ok:true,msg:"Entrada registrada (ABIERTA): "+t.par+" "+t.dir+" ent "+(t.entrada!=null?t.entrada:"?")+" SL "+(t.sl!=null?t.sl:"?")+" TP "+(t.tp!=null?t.tp:"?")+(t.rr?(" RR 1:"+t.rr):"")+" · 📸 pedí captura del gráfico"};
    }
    if(name==="cerrar_entrada"){
      const q=String(i.par||"").toLowerCase();
      const abiertas=TRADES.filter(t=>t.abierta && t.modo===CTX.modo && t.estrategia===CTX.estrategia);
      const t = q ? abiertas.filter(x=>String(x.par||"").toLowerCase().includes(q)).slice(-1)[0] : abiertas.slice(-1)[0];
      if(!t) return {ok:false,msg:"No encontré una entrada abierta"+(i.par?(" en "+i.par):"")};
      let R=parseFloat(i.r);
      if(isNaN(R) && i.precio_cierre!=null && t.entrada!=null && t.sl!=null){
        const pc=parseFloat(i.precio_cierre), riesgo=Math.abs(t.entrada-t.sl);
        if(riesgo>0){ const dirCompra=/compra|long|alza/i.test(t.dir); R=(dirCompra?(pc-t.entrada):(t.entrada-pc))/riesgo; R=Math.round(R*100)/100; }
      }
      if(isNaN(R)) return {ok:false,msg:"Dime el precio al que cerraste (o el resultado en R)"};
      t.abierta=false; t.r=R; t.res=i.res||(R>0.05?"Ganado":R<-0.05?"Perdido":"BE");
      try{ if(!VERED.some(x=>x.trade===t.id)) veredEnlazar(t); veredActualizar(t); }catch(_){}   /* 🎯 cierra el círculo de la lectura de Roberto */
      if(i.precio_cierre!=null) t.precioCierre=parseFloat(i.precio_cierre);
      if(i.mae!=null && !isNaN(parseFloat(i.mae))) t.mae=parseFloat(i.mae);
      if(i.mfe!=null && !isNaN(parseFloat(i.mfe))) t.mfe=parseFloat(i.mfe);
      if(i.nota) t.nota=(t.nota?t.nota+" · ":"")+i.nota;
      t.shotClose=t.id+"_close"; nubeShotReq(t.par, t.shotClose); // 📸 captura de cierre
      save(K.trades,TRADES); if(typeof refrescarDiarioCtx==="function") refrescarDiarioCtx(); notifChequearCuentasDD();
      return {ok:true,msg:"Entrada cerrada: "+t.par+" "+t.res+" "+r1(t.r)+"R"+(t.precioCierre!=null?(" (cierre "+t.precioCierre+")"):"")+" · 📸 pedí captura del cierre"};
    }
    if(name==="borrar_trade" || name==="editar_trade"){
      const q=String(i.par||"").toLowerCase();
      let lst=TRADES.filter(t=>t.modo===CTX.modo && t.estrategia===CTX.estrategia && String(t.par||"").toLowerCase().includes(q));
      if(i.fecha) lst=lst.filter(t=>t.fecha===i.fecha);
      const t=lst.slice(-1)[0];
      if(!t) return {ok:false,msg:"No encontré un trade de "+(i.par||"")+(i.fecha?(" del "+i.fecha):"")};
      if(name==="borrar_trade"){
        TRADES=TRADES.filter(x=>x.id!==t.id); save(K.trades,TRADES); if(typeof refrescarDiarioCtx==="function") refrescarDiarioCtx();
        return {ok:true,msg:"Trade borrado: "+t.par+" "+(t.fecha||"")+" "+(t.abierta?"(abierta)":(r1(t.r)+"R"))};
      }
      const num=["r","nconf","entrada","sl","tp"], str=["res","setup","momento","bias","ventana","zona","nota"];
      num.forEach(k=>{ if(i[k]!=null && !isNaN(parseFloat(i[k]))) t[k]=parseFloat(i[k]); });
      str.forEach(k=>{ if(i[k]!=null && i[k]!=="") t[k]=i[k]; });
      if(i.res && i.res!=="Abierta") t.abierta=false;
      try{ veredActualizar(t); }catch(_){}
      save(K.trades,TRADES); if(typeof refrescarDiarioCtx==="function") refrescarDiarioCtx(); notifChequearCuentasDD();
      return {ok:true,msg:"Trade actualizado: "+t.par+" "+(t.fecha||"")+" ("+(t.abierta?"abierta":(r1(t.r)+"R"))+")"};
    }
    if(name==="capturar_grafico"){
      const par=i.par||""; const sid="m"+Date.now();
      const q=String(par).toLowerCase();
      const abiertas=TRADES.filter(t=>t.abierta && t.modo===CTX.modo && t.estrategia===CTX.estrategia);
      const t = q ? abiertas.filter(x=>String(x.par||"").toLowerCase().includes(q)).slice(-1)[0] : abiertas.slice(-1)[0];
      if(t){ t.shots=Array.isArray(t.shots)?t.shots:[]; t.shots.push(sid); save(K.trades,TRADES); }
      else { SHOTS.unshift({ id:sid, fecha:hoyISO(), par:(par||"—"), tipo:"Manual", ts:Date.now() }); save(K.shots,SHOTS); } // suelta → visible en la Galería
      nubeShotReq(par||(t&&t.par)||"", sid);
      return {ok:true,msg:"📸 Captura pedida"+(par?(" de "+par):"")+" — el Puente la sube en unos segundos; la verás en la 🖼️ Galería"+(t?" y en tu entrada abierta.":".")};
    }
    if(name==="guardar_plan_semanal"){
      PLANSEM={ bias:i.bias||"", par:i.par||"", zonaP:i.zona_principal||"", zonaS:i.zona_secundaria||"", invalid:i.nivel_invalidacion||"", mejorDia:i.mejor_dia||"", evitar:i.dias_evitar||"", notas:i.notas||"", fecha:hoyISO() };
      save(K.plansem, PLANSEM);
      return {ok:true,msg:"Plan semanal guardado: "+PLANSEM.bias+(PLANSEM.par?(" en "+PLANSEM.par):"")+(PLANSEM.invalid?(" · invalida en "+PLANSEM.invalid):"")+". Lo recordaré toda la semana."};
    }
    if(name==="ajustar_indicador"){
      if(!i.ajuste || i.valor===undefined || i.valor===null || i.valor==="") return {ok:false,msg:"Falta el ajuste o el valor"};
      const params={ ajuste:i.ajuste, valor:i.valor }; if(i.target) params.target=i.target;
      return await enviarComando("ajustar_indicador", params);
    }
    if(name==="cambiar_par" || name==="cambiar_temporalidad" || name==="cambiar_tipo_grafico"){
      const map={ cambiar_par:"set_symbol", cambiar_temporalidad:"set_timeframe", cambiar_tipo_grafico:"set_chart_type" };
      const params={};
      if(name==="cambiar_par") params.symbol=i.symbol;
      if(name==="cambiar_temporalidad") params.timeframe=i.timeframe;
      if(name==="cambiar_tipo_grafico") params.chart_type=i.chart_type;
      if(i.target) params.target=i.target;
      if((name==="cambiar_par"&&!i.symbol)||(name==="cambiar_temporalidad"&&!i.timeframe)||(name==="cambiar_tipo_grafico"&&!i.chart_type)) return {ok:false,msg:"Falta el dato para la orden"};
      return await enviarComando(map[name], params);
    }
    if(name==="dibujar_linea"||name==="dibujar_zona"||name==="dibujar_texto"||name==="marcar_entrada"||name==="borrar_dibujos"){
      const params={};
      if(name==="dibujar_linea"){ if(i.precio==null) return {ok:false,msg:"Falta el precio de la línea"}; params.precio=i.precio; if(i.texto)params.texto=i.texto; if(i.color)params.color=i.color; }
      else if(name==="dibujar_zona"){ if(i.precio_alto==null||i.precio_bajo==null) return {ok:false,msg:"Faltan los precios de la zona"}; params.precio_alto=i.precio_alto; params.precio_bajo=i.precio_bajo; if(i.texto)params.texto=i.texto; if(i.color)params.color=i.color; }
      else if(name==="dibujar_texto"){ if(i.precio==null||!i.texto) return {ok:false,msg:"Falta el precio o el texto"}; params.precio=i.precio; params.texto=i.texto; if(i.color)params.color=i.color; }
      else if(name==="marcar_entrada"){ if(i.precio==null) return {ok:false,msg:"Falta el precio de la entrada"}; params.precio=i.precio; params.direccion=i.direccion||"compra"; if(i.texto)params.texto=i.texto; }
      else if(name==="borrar_dibujos"){ if(i.todo===true) params.todo=true; }
      if(i.target) params.target=i.target;
      return await enviarComando(name, params);
    }
    if(name==="revisar_indicador"){
      const params={}; if(i.target) params.target=i.target;
      return await enviarComando("revisar_indicador", params);
    }
    if(name==="buscar_memoria"){
      const q=String(i.consulta||"").trim().toLowerCase();
      const tema=String(i.tema||"").trim();
      if(!q && !tema) return {ok:false,msg:"Falta qué buscar (palabras o tema)"};
      try{
        const r=await fetch(nubeUrl()+"/mem",{cache:"no-store"}); const d=await r.json();
        const entries=(d&&d.entries)||[];
        const palabras=q.split(/\s+/).filter(w=>w.length>2);
        const hits=entries.filter(e=>{
          if(tema && (e.tema||"general")!==tema) return false;
          if(!q) return true;
          const t=String(e.texto||"").toLowerCase();
          return palabras.length?palabras.some(w=>t.includes(w)):t.includes(q);
        }).slice(-20);
        const nom=tema?(MEM_TEMAS_APP[tema]||tema):"";
        const crit=[q?("“"+i.consulta+"”"):"", nom?("tema "+nom):""].filter(Boolean).join(" · ");
        if(!hits.length) return {ok:true,msg:"No encontré recuerdos con "+crit+" (busqué entre "+entries.length+" recuerdos)."};
        return {ok:true,msg:"Encontré "+hits.length+" recuerdo(s) — "+crit+":\n"+hits.map(e=>"• ["+(MEM_TEMAS_APP[e.tema||"general"]||"🗂️ General")+"] "+e.texto).join("\n")};
      }catch(_){ return {ok:false,msg:"No pude leer la memoria en este momento."}; }
    }
    if(name==="registrar_retiro"){
      const monto=parseFloat(i.monto);
      if(!(monto>0)) return {ok:false,msg:"Monto de retiro inválido"};
      let c=null; const q=String(i.cuenta||"").toLowerCase().trim();
      if(q) c=CUENTAS.find(x=>(((x.alias||"")+" "+(x.firma||"")).toLowerCase().includes(q)));
      if(!c && CUENTAS.length===1) c=CUENTAS[0];
      if(!c) return {ok:false,msg:"No encontré la cuenta"+(i.cuenta?(" “"+i.cuenta+"”"):"")+". Dime su alias exacto."};
      c.retiros=(+c.retiros||0)+monto;
      if(c.balance!==undefined && c.balance!==null && c.balance!=="") c.balance=(+c.balance||0)-monto;
      if(i.nota) c.nota=((c.nota?c.nota+" · ":"")+"Retiro $"+monto+": "+i.nota).slice(0,300);
      guardarCuentas(); try{ refrescarCuentas(); }catch(_){}
      return {ok:true,msg:"💰 Retiro registrado: $"+r0(monto)+" de "+(c.alias||c.firma)+". Total retirado: $"+r0(+c.retiros)+". ¡Dinero REAL en tu bolsillo — eso es el negocio funcionando!"};
    }
    if(name==="editar_estrategia"){
      const nom=(i.nombre && ESTRATEGIAS.includes(i.nombre))?i.nombre:CTX.estrategia;
      if(!nom) return {ok:false,msg:"No hay estrategia activa"};
      const def=ESTR_DEFS[nom]||{};
      if(i.instrumento!=null && i.instrumento!=="") def.instrumento=String(i.instrumento);
      if(i.ajustes!=null && i.ajustes!=="") def.ajustes=String(i.ajustes);
      ESTR_DEFS[nom]=def; guardarEstrDefs();
      return {ok:true,msg:"Actualicé la estrategia “"+nom+"”: "+[def.instrumento&&("instrumento "+def.instrumento), def.ajustes&&"reglas/ajustes actualizados"].filter(Boolean).join(", ")+". La tendré en cuenta."};
    }
    if(name==="registrar_veredicto"){
      const v=veredAdd({par:i.par, veredicto:i.veredicto, razon:i.razon, setup:i.setup, confianza:i.confianza});
      const et=v.veredicto==="go"?"✅ GO":v.veredicto==="nogo"?"⛔ NO-GO":"⏸️ ESPERA";
      return {ok:true,msg:"🎯 Lectura apuntada: "+v.par+" "+et+" (confianza "+v.confianza+"/5). Cuando registres el trade la enlazo y sabré en qué acabó."};
    }
    if(name==="marcar_paso_plan"){
      const id=String(i.paso||"").trim();
      let paso=null, fase=null;
      PLAN_FASES.forEach(f=>(f.pasos||[]).forEach(p=>{ if(p.id===id){ paso=p; fase=f; } }));
      if(!paso) return {ok:false,msg:"No existe ese paso del plan ("+id+")"};
      const hecho=(i.hecho===false)?false:true;
      PLAN_ARR.pasos[id]=hecho; guardarPlan();
      try{ if(TAB==="arranque") renderArranque(); }catch(_){}
      return {ok:true,msg:(hecho?"✅ Marcado":"↩️ Desmarcado")+" en tu plan (fase "+fase.n+"): “"+paso.t+"”"};
    }
    if(name==="avanzar_plan"){
      const f=planFaseActual();
      const s=planSeñal(f);
      if(!s.ok) return {ok:false,msg:"Todavía no toca avanzar. Estás en la fase "+f.n+" — "+f.t+". "+s.falta};
      if(!planAvanzar(false)) return {ok:false,msg:"No pude avanzar la fase"};
      const nueva=planFaseActual();
      return {ok:true,msg:"🧭 ¡Fase superada! Ahora estás en la "+nueva.n+" — "+nueva.t+" ("+nueva.cuando+"). "+nueva.idea};
    }
    if(name==="organizar_chat"){
      const c=iaConvAct(); if(!c) return {ok:false,msg:"No hay chat activo"};
      const ch=[];
      if(i.fijar!=null){ c.fijado=!!i.fijar; ch.push(c.fijado?"📌 fijado":"quité el fijado"); }
      if(i.estrella!=null){ c.estrella=!!i.estrella; ch.push(c.estrella?"⭐ importante":"quité la estrella"); }
      if(i.revisar!=null){ c.revisar=!!i.revisar; ch.push(c.revisar?"🔍 por revisar":"quité el 'por revisar'"); }
      iaGuardarConvs(); try{ renderConvList(); }catch(_){}
      if(i.revisar!=null) syncPendientes();
      return {ok:true,msg:"Organicé este chat: "+(ch.join(", ")||"sin cambios")};
    }
    if(name==="guardar_memoria"){
      const texto=String(i.texto||"").trim();
      if(!texto) return {ok:false,msg:"No había nada que recordar"};
      const tipo=i.tipo||"aprendizaje";
      const tema=MEM_TEMAS_APP[i.tema]?i.tema:"general";
      try{ fetch(nubeUrl()+"/mem",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({tipo,texto,tema})}).catch(()=>{}); }catch(_){}
      _iaMemCache=null;
      return {ok:true,msg:"Guardado en mi memoria ("+(MEM_TEMAS_APP[tema])+"): “"+texto+"”. Lo recordaré de aquí en adelante."};
    }
    if(name==="borrar_memoria"){
      const id=String(i.id||"").trim();
      if(!id) return {ok:false,msg:"Falta el id a borrar"};
      try{ fetch(nubeUrl()+"/mem",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({del:id})}).catch(()=>{}); }catch(_){}
      return {ok:true,msg:"Listo, borré ese dato de mi memoria."};
    }
    if(name==="limpiar_capturas"){
      const q=String(i.par||"").toLowerCase();
      const match=s=>(!q||String(s.par||"").toLowerCase().includes(q)) && (!i.fecha||s.fecha===i.fecha);
      const borrar=(Array.isArray(SHOTS)?SHOTS:[]).filter(match);
      if(!borrar.length) return {ok:false,msg:"No hay capturas sueltas que borrar con ese filtro"};
      SHOTS=SHOTS.filter(s=>!match(s)); save(K.shots,SHOTS);
      nubeShotDel(borrar.map(s=>s.id));
      if(TAB==="galeria") renderGaleria();
      return {ok:true,msg:"Borré "+borrar.length+" captura(s) suelta(s)"+(i.par?(" de "+i.par):"")+"."};
    }
    if(name==="limpiar_diario_ejecutor"){
      const a=load(K.ejec,{trades:{}});
      const lim=i.antes_de?Date.parse(i.antes_de):null;
      const mes=/^\d{4}-\d{2}$/.test(String(i.mes||""))?String(i.mes):null;
      if(!lim && !mes) return {ok:false,msg:"Dime qué borrar: antes_de (YYYY-MM-DD) o mes (YYYY-MM)"};
      const keys=Object.keys(a.trades||{}).filter(k=>{
        const t=a.trades[k]; const ts=t.tsOut||t.tsIn||0; if(!ts) return false;
        if(lim) return ts<lim;
        const d0=new Date(ts);
        return (d0.getFullYear()+"-"+String(d0.getMonth()+1).padStart(2,"0"))===mes;
      });
      if(!keys.length) return {ok:false,msg:"No hay operaciones del Ejecutor en ese periodo"};
      keys.forEach(k=>delete a.trades[k]); save(K.ejec,a);
      if(TAB==="ejecutor") renderEjecutor();
      return {ok:true,msg:"Borré "+keys.length+" operación(es) antigua(s) del archivo del Ejecutor"+(mes?(" ("+mes+")"):(" (anteriores al "+i.antes_de+")"))+". Tu Diario personal quedó intacto."};
    }
    if(name==="crear_cuenta"){
      if(!i.alias && !i.firma) return {ok:false,msg:"Falta el alias o la firma"};
      const campos=["alias","firma","capital","riesgoPct","ddMaxPct","ddTipo","ddDailyPct","targetPct","diasMin","precio","splitPct","nota"];
      const c={ id:"cta"+Date.now()+Math.floor(Math.random()*1000), creada:Date.now(), fase:i.fase||"Examen F1", riesgoPct:i.riesgoPct||"0.5" };
      campos.forEach(k=>{ if(i[k]!=null && i[k]!=="") c[k]=i[k]; });
      CUENTAS.push(c); guardarCuentas(); if(TAB==="cuentas") renderCuentas();
      return {ok:true,msg:"Cuenta creada: "+(c.alias||c.firma)+" ("+c.fase+", cap "+(c.capital||"?")+", DD "+(c.ddMaxPct||"?")+"%)"};
    }
    if(name==="editar_cuenta" || name==="avanzar_fase"){
      const q=String(i.alias||i.firma||"").toLowerCase();
      const c=CUENTAS.find(x=>(x.alias&&x.alias.toLowerCase()===q)||(x.firma&&x.firma.toLowerCase()===q)||(x.alias&&x.alias.toLowerCase().includes(q))||(x.firma&&x.firma.toLowerCase().includes(q)));
      if(!c) return {ok:false,msg:"No encontré la cuenta '"+(i.alias||i.firma||"")+"'"};
      if(name==="avanzar_fase"){
        const idx=FASES.indexOf(c.fase);
        if(idx<0 || idx>=FASES.length-1) return {ok:false,msg:(c.alias||c.firma)+" ya está en la fase final"};
        c.fase=FASES[idx+1]; guardarCuentas(); if(TAB==="cuentas") renderCuentas();
        return {ok:true,msg:"Cuenta "+(c.alias||c.firma)+" avanzó a "+c.fase};
      }
      ["alias","firma","capital","fase","riesgoPct","ddMaxPct","ddTipo","ddDailyPct","targetPct","diasMin","precio","splitPct","balance","nota"].forEach(k=>{ if(i[k]!=null && i[k]!=="") c[k]=i[k]; });
      guardarCuentas(); if(TAB==="cuentas") renderCuentas();
      return {ok:true,msg:"Cuenta actualizada: "+(c.alias||c.firma)};
    }
    return {ok:false,msg:"Acción desconocida"};
  }catch(e){ return {ok:false,msg:"Error al ejecutar: "+e}; }
}
/* Registro de cada cambio que Roberto ejecuta (con tu aprobación) — para que Rey esté al tanto de todo */
function logRoberto(texto){
  try{ const log=load(K.robertolog,[]); log.unshift({ ts:Date.now(), t:texto }); save(K.robertolog, log.slice(0,60)); }catch(_){}
}
function histRobertoModal(){
  const log=load(K.robertolog,[]);
  const filas = log.length
    ? log.map(x=>{ const d=new Date(x.ts); const f=d.toLocaleDateString("es")+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
        return `<div class="hist-row"><div class="hist-f">${esc(f)}</div><div class="hist-t">${esc(x.t)}</div></div>`; }).join("")
    : `<p class="desc">Todavía Roberto no ha hecho ningún cambio. Cuando apruebes una acción suya, aquí queda registrada.</p>`;
  abrirModal(`<div class="modal-t">🗒️ Historial de Roberto</div>
    <p class="desc" style="margin-bottom:10px">Cada cambio que Roberto ha hecho en Apex — siempre con tu aprobación.</p>
    <div class="hist-box">${filas}</div>`,
    [{t:"Cerrar", cls:"gold", fn:cerrarModal}].concat(log.length?[{t:"Borrar historial", cls:"danger", fn:()=>{ save(K.robertolog,[]); cerrarModal(); toast("Historial borrado"); }}]:[]));
}
/* Muestra la tarjeta de confirmación y espera la decisión de Rey */
/* Tarjetas de confirmación PENDIENTES. Antes se colgaban del DOM a pelo y se perdían:
   si el chat estaba cerrado se auto-cancelaban en silencio (Roberto decía "te van a salir
   las tarjetas" y no salía ninguna), y cualquier repintado del chat las borraba a media
   confirmación. Ahora viven aquí y se repintan siempre que se pinta el chat. */
const IA_TOOL_PEND=[];
function confirmarTool(tu){
  // 🗂️ Organizar chats, 🧠 buscar en memoria, 🧭 marcar paso, 🎯 veredicto: automáticos, SIN tarjeta.
  if(tu.name==="organizar_chat" || tu.name==="buscar_memoria" || tu.name==="marcar_paso_plan" || tu.name==="registrar_veredicto"){
    return (async()=>{ let res; try{ res=await ejecutarTool(tu.name, tu.input); }catch(e){ res={ok:false,msg:"Error: "+e}; } if(res&&res.ok&&(tu.name==="organizar_chat"||tu.name==="marcar_paso_plan")) toast(res.msg); return {confirmed:true, res}; })();
  }
  return new Promise(resolve=>{
    /* si el chat está cerrado, se ABRE: nunca más una confirmación cancelada a espaldas de Rey */
    if(!$("#iaMsgs") && typeof abrirIA==="function"){ try{ abrirIA(); }catch(_){} }
    IA_TOOL_PEND.push({ tu, resolve, estado:"pendiente" });
    iaPintarTools();
    try{ if(navigator.vibrate) navigator.vibrate([120,60,120]); }catch(_){}
  });
}
/* Pinta (o repinta) las tarjetas que están esperando decisión. */
function iaPintarTools(){
  const cont=$("#iaMsgs"); if(!cont) return;
  cont.querySelectorAll(".ia-tool").forEach(n=>n.remove());
  IA_TOOL_PEND.filter(p=>p.estado==="pendiente").forEach(p=>{
    const card=el("div","ia-tool");
    card.innerHTML=`<div class="ia-tool-h">🤖 Roberto quiere hacer esto:</div>
      <div class="ia-tool-d">${esc(describeTool(p.tu.name, p.tu.input)).replace(/\n/g,"<br>")}</div>
      <div class="ia-tool-bar"><button class="btn danger ia-tool-no">Cancelar</button><button class="btn gold ia-tool-si">✓ Confirmar</button></div>`;
    cont.appendChild(card);
    card.querySelector(".ia-tool-si").onclick=async ()=>{
      const bar=card.querySelector(".ia-tool-bar");
      bar.innerHTML="<span class='ia-tool-done'>⏳ Ejecutando…</span>";
      let res; try{ res=await ejecutarTool(p.tu.name, p.tu.input); }catch(e){ res={ok:false,msg:"Error: "+e}; }
      if(res&&res.ok) logRoberto(res.msg);
      bar.innerHTML="<span class='ia-tool-done'>"+((res&&res.ok)?"✓ Hecho":"⚠️ No se aplicó")+"</span>";
      p.estado="hecha"; const i=IA_TOOL_PEND.indexOf(p); if(i>=0) IA_TOOL_PEND.splice(i,1);
      p.resolve({confirmed:true, res});
    };
    card.querySelector(".ia-tool-no").onclick=()=>{
      card.querySelector(".ia-tool-bar").innerHTML="<span class='ia-tool-cancel'>🚫 Cancelado</span>";
      p.estado="hecha"; const i=IA_TOOL_PEND.indexOf(p); if(i>=0) IA_TOOL_PEND.splice(i,1);
      p.resolve({confirmed:false});
    };
  });
  cont.scrollTop=cont.scrollHeight;
}
/* Bucle de conversación con herramientas: maneja texto, errores y acciones a confirmar */
async function iaLoop(msgs, c){
  let guard=0, sinBusqueda=false, reintentoVacio=0;
  while(guard++ < 8){
    let r, data={};
    try{
      // TOPE DE TIEMPO: si el puente tarda demasiado, cortamos y reintentamos
      // rápido SIN búsqueda web (antes se colgaba varios minutos esperando).
      const ctrl=new AbortController();
      // 75s de margen: medimos que una respuesta completa tarda ~20s, y en 4G la
      // subida del contexto + bajada puede sumar bastante. Antes cortaba a 35s.
      const tId=setTimeout(()=>{ try{ctrl.abort();}catch(_){} }, sinBusqueda?60000:75000);
      try{
        r=await fetch(IA.url,{method:"POST",headers:{"content-type":"application/json"},
          body:JSON.stringify({system:iaSystemFull(), messages:msgs, clientTools:IA_TOOLS, noSearch:sinBusqueda}),
          signal:ctrl.signal});
        try{ data=await r.json(); }catch(_){}
      }finally{ clearTimeout(tId); }
    }catch(e){
      // Timeout o fallo de red: reintenta SIN búsqueda (más rápido) antes de rendirse.
      if(reintentoVacio<2){ reintentoVacio++; sinBusqueda=true; continue; }
      IA.busy=false; c.msgs.push({role:"assistant",content:"⚠️ El puente tardó demasiado. Vuelve a intentarlo en un momento — si sigue, revisa tu internet o abre un chat nuevo con ✚."}); iaGuardarConvs(); pintarIAChat(); return;
    }
    if(!r.ok || (data&&data.error)){
      IA.busy=false;
      const em=((data&&data.error)||("Error "+ (r?r.status:"?"))).toString();
      const sinCredito = /credit|balance|billing|quota|insufficient|saldo|402/i.test(em) || (r&&r.status===402);
      c.msgs.push({role:"assistant",content: sinCredito
        ? ("💳 **Se agotaron tus créditos de la IA.**\n\nRecarga aquí y en 1 minuto vuelvo:\n"+IA_RECARGA_URL)
        : ("⚠️ "+em+"\n\nRevisa tu puente en ajustes (⚙️) o tu conexión.")});
      iaGuardarConvs(); pintarIAChat(); return;
    }
    if(data.stop==="tool_use" && Array.isArray(data.content)){
      const pre=data.content.filter(b=>b.type==="text").map(b=>b.text||"").join("").trim();
      IA.busy=false;
      if(pre) c.msgs.push({role:"assistant",content:pre});
      iaGuardarConvs(); pintarIAChat();
      msgs.push({role:"assistant", content:data.content});
      const tus=data.content.filter(b=>b.type==="tool_use");
      const results=[];
      for(const tu of tus){
        const dec=await confirmarTool(tu);
        if(dec.confirmed){
          const rr=dec.res||{ok:false,msg:"sin resultado"};
          c.msgs.push({role:"assistant",content:(rr.ok?"✅ ":"⚠️ ")+rr.msg}); iaGuardarConvs(); pintarIAChat();
          results.push({type:"tool_result", tool_use_id:tu.id, content:(rr.ok?"HECHO: ":"NO SE PUDO: ")+rr.msg});
        }else{
          c.msgs.push({role:"assistant",content:"🚫 Cancelaste esta acción."}); iaGuardarConvs(); pintarIAChat();
          results.push({type:"tool_result", tool_use_id:tu.id, content:"El usuario CANCELÓ esta acción; no la hagas."});
        }
      }
      msgs.push({role:"user", content:results});
      IA.busy=true; pintarIAChat();
      continue;
    }
    const txt=(data.text||"").trim();
    // Blindaje anti-vacío: si volvió sin texto, reintenta en silencio SIN búsqueda
    // web (la causa más común del bache) antes de mostrar ningún error.
    if(!txt && reintentoVacio<2){ reintentoVacio++; sinBusqueda=true; IA.busy=true; continue; }
    IA.busy=false;
    c.msgs.push({role:"assistant",content: txt || "⚠️ No me llegó respuesta. Dame un momento y vuelve a intentar — si sigue, abre un chat nuevo con ✚."});
    iaGuardarConvs(); pintarIAChat();
    if(IA.voz.on){ const ult=c.msgs[c.msgs.length-1]; if(ult && ult.role==="assistant" && ult.content && !/^⚠️|^💳|^🚫|^✅/.test(ult.content)) iaHablar(ult.content, c.msgs.length-1); }
    return;
  }
  IA.busy=false; pintarIAChat();
}

/* ============================================================
   ROBERTO VIGILANTE — está pendiente de cada acción en Apex.
   Evalúa por detrás y SOLO habla si hay algo que corregir/mejorar.
   ============================================================ */
let VIGILA = load(K.vigila, {on:true});
if(!VIGILA || typeof VIGILA!=="object") VIGILA={on:true};
function guardarVigila(){ save(K.vigila, VIGILA); }
function reglasClaveTxt(){ return "REGLAS INVIOLABLES DE REY:\n"+REGLAS.map((r,i)=>(i+1)+". "+r).join("\n"); }
async function robertoVigila(evento){
  if(!VIGILA.on || !IA.url || !evento) return;
  try{
    const sys="Eres ROBERTO, mentor de trading de Rey (CRT/SMC/ICT) y su GUARDIÁN. "+reglasClaveTxt()+
      "\nVigilas cada acción que Rey hace en su app Apex. Si la acción está MAL, es riesgosa, rompe una de sus reglas, contradice su plan o es claramente mejorable (p.ej. entrar en el toque en vez de esperar confirmación, operar fuera de ventana o con noticia cerca, un setup C, un aviso a mala hora, un par que no encaja), responde SOLO una corrección/sugerencia BREVE y accionable (máx 2 frases, empieza con un emoji, tono directo y cercano de mentor-hermano). Si la acción está BIEN, responde EXACTAMENTE 'OK' y nada más."+
      "\n⚙️ v6.20 LA CONFIG VIVA MANDA (Rey, 28-08): cuando la acción es GUARDAR una configuración (reglas del Ejecutor, ventanas, ajustes), los números que Rey acaba de guardar SON su regla vigente desde ese momento — tu cerebro o memoria pueden tener números VIEJOS (2 ops/día, ±30 min de noticias: YA NO son la regla; hoy el cupo y los minutos de noticias son LOS DE LA CONFIG). PROHIBIDO regañarlo por diferir de una regla vieja. Solo avisa si el cambio es un PELIGRO OBJETIVO (riesgo por operación >1%, lote máximo desproporcionado, pérdida diaria >2%, horario absurdo) y di el porqué en palabras simples.";
    const evTxt = iaReloj()+"\n"+iaContexto()+"\n\nACCIÓN de Rey ahora mismo:\n"+evento;
    const r=await fetch(IA.url.replace(/\/+$/,"")+"/vigila",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({system:sys, evento:evTxt})});
    const d=await r.json().catch(()=>({}));
    if(d && d.flag && d.text) robertoAlerta(d.text);
  }catch(_){}
}
function robertoAlerta(text){
  try{ const c=iaConvAct(); if(c){ c.msgs.push({role:"assistant",content:"🛡️ "+text}); iaGuardarConvs(); const ov=$("#iaOv"); if(ov && ov.classList.contains("show")) pintarIAChat(); } }catch(_){}
  mostrarBannerRoberto(text);
  try{ if(IA.voz && IA.voz.on) iaHablar(text,-1); }catch(_){}
}
function mostrarBannerRoberto(text){
  let b=$("#robBanner");
  if(!b){ b=el("div","rob-banner"); b.id="robBanner"; document.body.appendChild(b); }
  b.innerHTML=`<span class="rob-ic">🛡️</span><span class="rob-tx">${esc(text)}</span><button class="rob-x" aria-label="Cerrar">✕</button>`;
  b.classList.add("show");
  b.onclick=(e)=>{ b.classList.remove("show"); if(!e.target.classList.contains("rob-x")) abrirIA(); };
  clearTimeout(b._t); b._t=setTimeout(()=>{ if(b) b.classList.remove("show"); }, 15000);
}
/* Resumen compacto de un trade para el vigilante */
function resumenTradeVigila(t){
  return "Registró un TRADE ("+(t.modo==="backtest"?"backtest":"real")+"): par "+t.par+", "+(t.dir||"")+", setup "+(t.setup||"?")+
    ", resultado "+(t.res||"")+" "+t.r+"R, momento de entrada '"+(t.momento||"?")+"', ventana '"+(t.ventana||"?")+"', bias "+(t.bias||"?")+
    ", confluencias "+(t.nconf||0)+(t.plan==="No"?", PLAN ROTO":"")+(t.fueraLimite?", FUERA DEL LÍMITE DIARIO (ya tenía 2 hoy)":"")+
    (t.news==="Noticia cerca"?", con NOTICIA CERCA":"")+". Riesgo fijo 0.5%.";
}

/* ============================================================
   ROBERTO ASÍNCRONO — el servidor procesa y AVISA POR PUSH al terminar.
   Así funciona aunque cierres/minimices la app (el móvil ya no corta nada):
   1) la app manda la pregunta y recibe un jobId al instante
   2) el servidor piensa en segundo plano y te manda un push cuando termina
   3) al abrir la app, recupera la respuesta guardada y la muestra
   ============================================================ */
const IA_PEND_KEY = "crtelite_pendchat_v3";
function iaBase(){ return (IA.url||IA_URL_DEFAULT).replace(/\/+$/,""); }
/* 🚀 Motor elegido en ⚙️: "sonnet" (Rendidor, por defecto) u "opus" (Máximo). */
function iaMotor(){ try{ return localStorage.getItem("crtelite_ia_motor")==="opus"?"opus":"sonnet"; }catch(_){ return "sonnet"; } }
/* 🧠 MOTOR SINTOMÁTICO: detecta cuándo la consulta es trabajo PROFUNDO. */
function iaTareaProfunda(texto, tieneDoc, tieneMarco){
  if(tieneDoc || tieneMarco) return true;                       // documentos y análisis con marco = profundo
  const t=String(texto||"");
  if(t.length>600) return true;                                 // un mensaje largo merece el motor grande
  return /backtest|an[aá]lisis (semanal|del d[ií]a|profundo|completo)|revisa (todo|mi semana|mi operativa)|comp[aá]rame|auditor[ií]a|informe|plan (de fondeo|semanal|mensual|completo)|inter[eé]s compuesto|escalado/i.test(t);
}
/* Decide el motor de ESTA consulta: si el ajuste es Máximo, va directo; si es Rendidor
   pero la tarea parece profunda, PREGUNTA a Rey (solo vale para esta consulta, el
   ajuste de ⚙️ no cambia). Así Roberto "detecta y avisa" pero Rey siempre decide. */
function iaMotorPara(texto, tieneDoc, tieneMarco){
  if(iaMotor()==="opus") return "opus";
  if(!iaTareaProfunda(texto, tieneDoc, tieneMarco)) return "sonnet";
  const ok=confirm("🧠 Esto parece trabajo PROFUNDO.\n\n¿Quieres que lo piense con el motor Máximo (Opus 5)? Razona más fino pero gasta más.\n\nAceptar = 🧠 Máximo (solo esta consulta)\nCancelar = 🏎️ Rendidor (económico)");
  return ok?"opus":"sonnet";
}
function iaAbierto(){ const ov=$("#iaOv"); return !!(ov && ov.classList.contains("show")); }
function iaPendCargar(){ try{ return JSON.parse(localStorage.getItem(IA_PEND_KEY)||"[]"); }catch(_){ return []; } }
function iaPendGuardar(p){ const a=iaPendCargar().filter(x=>x.jobId!==p.jobId); a.push(p); try{ localStorage.setItem(IA_PEND_KEY, JSON.stringify(a)); }catch(_){} }
function iaPendBorrar(jobId){ try{ localStorage.setItem(IA_PEND_KEY, JSON.stringify(iaPendCargar().filter(x=>x.jobId!==jobId))); }catch(_){} }
const _iaPolling={};
/* Arranca una consulta en segundo plano */
async function iaBgStart(msgs, c, motor){
  const motorMsg = motor || iaMotor();   /* el motor de ESTA consulta viaja con su trabajo */
  IA.busy=true; pintarIAChat(); iaVigilarBusy();   /* 🛟 nunca se queda bloqueado */
  let jobId;
  try{
    const r=await fetch(iaBase()+"/chat/bg",{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({system:iaSystemFull(), messages:msgs, clientTools:IA_TOOLS, motor:motorMsg})});
    const d=await r.json().catch(()=>({}));
    jobId=d && d.jobId;
    if(!jobId) throw new Error("sin jobId");
  }catch(e){
    IA.busy=false; c.msgs.push({role:"assistant",content:"⚠️ No pude enviar tu mensaje. Revisa tu internet y reintenta."}); iaGuardarConvs(); pintarIAChat(); return;
  }
  iaPendGuardar({ jobId, convId:c.id, msgs, motor:motorMsg, ts:Date.now() });
  iaPollJob(jobId);
}
/* ============================================================
   🆘 CUANDO ALGO SE CORTA: BOTONES DE VERDAD, NO TEXTO
   Antes el aviso decía "toca 🔄 para reenviar" y ese emoji NO era un botón — Rey lo
   tocaba y no pasaba nada. Ahora cada mensaje de error lleva sus BOTONES REALES
   pegados debajo: reenviar lo escrito, continuar desde donde se cortó, o recargar
   créditos con el enlace directo. Vale para CUALQUIER corte, sea el motivo que sea.
   ============================================================ */
const IA_ACCIONES = {
  reenviar:  { t:"🔄 Reenviar mi mensaje",     fn:()=>iaReintentar() },
  continuar: { t:"▶️ Continuar desde ahí",      fn:()=>iaContinuar() },
  recargar:  { t:"💳 Recargar créditos",        fn:()=>iaRecargar() },
  reintentar:{ t:"↻ Probar otra vez",          fn:()=>iaReintentarEnvio() }
};
/* Pinta los botones de un mensaje que los lleve.
   RETROCOMPATIBLE: los avisos de fallo guardados por versiones anteriores no traen el
   campo `acc`, así que se deducen por su texto. Si no, Rey se quedaría mirando un aviso
   viejo sin botones — que es justo lo que le pasó al actualizar. */
function iaAccInferir(x){
  if(!x || x.role!=="assistant") return null;
  const t=String(x.content||"");
  if(!/⚠️|💳/.test(t)) return null;
  if(/sin créditos|credit balance|recarga/i.test(t)) return ["recargar","reintentar"];
  if(/Aquí me quedé|se cortó por el camino/i.test(t)) return ["continuar","reenviar"];
  if(/tardó demasiado|no llegó|tardó más de lo normal|NO se ha perdido/i.test(t)) return ["reintentar","reenviar"];
  return null;
}
function iaAccionesHTML(x, i){
  const acc = (x && Array.isArray(x.acc) && x.acc.length) ? x.acc : iaAccInferir(x);
  if(!acc || !acc.length) return "";
  return `<div class="ia-acc">`+acc.filter(a=>IA_ACCIONES[a])
    .map(a=>`<button class="ia-acc-b${a==="recargar"?" gold":""}" data-acc="${a}" data-i="${i}">${IA_ACCIONES[a].t}</button>`)
    .join("")+`</div>`;
}
/* ▶️ Continuar una respuesta que se quedó a medias. */
function iaContinuar(){
  if(IA.busy){ toast("Espera a que termine lo de ahora"); return; }
  iaEnviar("Sigue exactamente desde donde te quedaste. No saludes ni repitas lo que ya escribiste.");
}
/* 💳 Abrir la página de recarga de créditos. */
function iaRecargar(){
  const url="https://console.anthropic.com/settings/billing";
  try{ window.open(url,"_blank","noopener"); toast("Recarga y vuelve: Roberto arranca solo 💳"); }
  catch(_){ try{ navigator.clipboard.writeText(url); toast("Enlace copiado: console.anthropic.com/settings/billing"); }catch(e){} }
}
/* ↻ Reintentar el envío tal cual, sin tocar nada. */
function iaReintentarEnvio(){
  let u=null; try{ u=JSON.parse(localStorage.getItem("crtelite_ultimo_msg")||"null"); }catch(_){}
  if(!u || !u.txt){ toast("No hay mensaje que reintentar"); return; }
  if(IA.busy){ toast("Espera a que termine lo de ahora"); return; }
  iaEnviar(u.txt);
}
/* 🔄 Devuelve el texto a la caja para que Rey lo revise antes de mandarlo. */
function iaReintentar(){
  let u=null;
  try{ u=JSON.parse(localStorage.getItem("crtelite_ultimo_msg")||"null"); }catch(_){}
  if(!u || !u.txt){ toast("No hay ningún mensaje pendiente de reenviar"); return; }
  const ta=$("#iaText");
  if(ta){ ta.value=u.txt; ta.dispatchEvent(new Event("input")); ta.focus(); ta.scrollIntoView({block:"center"}); }
  toast("Tu mensaje está de vuelta en la caja: revísalo y envíalo ▶️");
}
/* ¿El fallo fue por falta de créditos? */
function iaEsCreditoMsg(m){ return /credit balance|credit|billing|saldo|insufficient|quota|payment|402/i.test(String(m||"")); }
/* Construye el mensaje de error con SUS botones, según lo que pasó. */
function iaMsgFallo(motivo, textoParcial){
  if(iaEsCreditoMsg(motivo)){
    return { role:"assistant",
      content:"💳 **Te quedaste sin créditos.**\n\nNo es un fallo del sistema: mi clave de IA se quedó sin saldo y no puedo pensar hasta que recargues.\n\nRecarga abajo y vuelve — arranco solo, no hay que reiniciar nada. Tu mensaje sigue guardado.",
      acc:["recargar","reintentar"] };
  }
  if(textoParcial){
    return { role:"assistant",
      content:textoParcial+"\n\n⚠️ _Aquí me quedé: la respuesta se cortó por el camino._",
      acc:["continuar","reenviar"] };
  }
  return { role:"assistant",
    content:"⚠️ **La respuesta no llegó.**\n\nTu mensaje NO se ha perdido. Puedes reintentarlo tal cual, o recuperarlo en la caja para revisarlo antes de mandarlo.",
    acc:["reintentar","reenviar"] };
}

/* Sondea el resultado mientras la app está abierta (el push cubre lo demás).
   Rey escribió su historia entera, esperó 3 minutos y se quedó sin nada. Tres cambios:
   (1) espera 5 min en vez de 3 — un mensaje largo merece respuesta larga;
   (2) si el worker guardó un AVANCE parcial, lo muestra en vez de perderlo todo;
   (3) al rendirse NO borra el pendiente y deja el mensaje listo para reenviar de un toque,
       así el texto que costó escribir nunca se pierde. */
/* 🔁 REINTENTO AUTOMÁTICO: si el trabajo murió en Cloudflare o dio un error transitorio
   (sobrecarga/timeout), la app lo reenvía SOLA con el mismo mensaje — hasta 2 veces.
   Gracias al caché del cerebro (1 h), el reintento cuesta mucho menos que el original.
   Solo si falla 3 veces seguidas sale la tarjeta de "Probar otra vez". */
async function iaAutoReintento(jobId, parcial, motivo){
  const pend=iaPendCargar().find(x=>x.jobId===jobId);
  const c=(pend && IA.convs.find(x=>x.id===pend.convId)) || iaConvAct();
  const n=(pend && pend.retries)||0;
  const rendirse=()=>{
    IA.busy=false;
    c.msgs.push(iaMsgFallo(motivo||"", parcial||""));
    if(parcial) iaPendBorrar(jobId); else iaGuardarUltimo(c);
    iaGuardarConvs(); pintarIAChat();
  };
  if(!pend || !Array.isArray(pend.msgs) || !pend.msgs.length || n>=2){ rendirse(); return; }
  iaPendBorrar(jobId);
  toast("Se me cortó el pensamiento — lo reintento yo solo 🔁");
  try{
    const r=await fetch(iaBase()+"/chat/bg",{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({system:iaSystemFull(), messages:pend.msgs, clientTools:IA_TOOLS, motor:pend.motor||iaMotor()})});
    const d=await r.json().catch(()=>({}));
    if(d && d.jobId){
      iaPendGuardar({jobId:d.jobId, convId:pend.convId, msgs:pend.msgs, motor:pend.motor, retries:n+1, ts:Date.now()});
      IA.busy=true; iaVigilarBusy(); pintarIAChat();
      iaPollJob(d.jobId);
      return;
    }
  }catch(_){}
  rendirse();
}
function iaPollJob(jobId){
  if(_iaPolling[jobId]) return;
  let tries=0, parcial="", ultimoPulso="", pulsoDesde=Date.now();
  const tick=async()=>{
    tries++;
    let d=null;
    try{ const r=await fetch(iaBase()+"/chat/bg?job="+encodeURIComponent(jobId),{cache:"no-store"}); d=await r.json(); }catch(_){}
    if(d && d.parcial) parcial=d.parcial;            // el worker va guardando lo que escribe
    if(d && d.ready){ clearTimeout(_iaPolling[jobId]); delete _iaPolling[jobId]; iaBgResuelto(jobId, d); return; }
    /* 💓 DETECTOR DE MUERTE (worker v5.65+): el trabajo deja un pulso "vivo" cada 20 s.
       Se compara el VALOR del pulso (no el reloj del móvil, que puede estar desajustado):
       si el pulso no CAMBIA en 75 s, la tarea murió en Cloudflare → se reintenta SOLO.
       Antes Rey esperaba 5 minutos mirando un trabajo muerto y le salía la tarjeta de fallo. */
    if(d && !d.ready && d.vivo){
      const pulso=String(d.vivo)+"/"+String(d.ts||"");
      if(pulso!==ultimoPulso){ ultimoPulso=pulso; pulsoDesde=Date.now(); }
      /* 📦 v6.24: umbral 75 s → 180 s — en 4G (otro colo) el estado puede tardar ~2 min en
         propagarse y el detector mataba trabajos VIVOS o ya terminados (falla del 28-08). */
      else if(Date.now()-pulsoDesde>180000){
        clearTimeout(_iaPolling[jobId]); delete _iaPolling[jobId];
        iaAutoReintento(jobId, parcial, "");
        return;
      }
    }
    if(tries>100){ // ~5 min sondeando: nunca dejar los puntitos colgados para siempre
      clearTimeout(_iaPolling[jobId]); delete _iaPolling[jobId];
      const pend=iaPendCargar().find(x=>x.jobId===jobId);
      const c=(pend && IA.convs.find(x=>x.id===pend.convId)) || iaConvAct();
      IA.busy=false;
      if(parcial){
        c.msgs.push(iaMsgFallo("", parcial));
        iaPendBorrar(jobId);
      }else{
        /* NO se borra el pendiente: si la respuesta llega tarde por push, se recupera igual */
        c.msgs.push(iaMsgFallo(""));
        iaGuardarUltimo(c);
      }
      iaGuardarConvs(); pintarIAChat();
      return;
    }
    _iaPolling[jobId]=setTimeout(tick, 3000);
  };
  _iaPolling[jobId]=setTimeout(tick, 2500);
}
/* Guarda el último mensaje de Rey para poder reenviarlo de un toque si algo falla. */
function iaGuardarUltimo(c){
  try{
    const ultimo=(c.msgs||[]).slice().reverse().find(m=>m.role==="user");
    if(ultimo) localStorage.setItem("crtelite_ultimo_msg", JSON.stringify({txt:String(ultimo.content||""), conv:c.id, ts:Date.now()}));
  }catch(_){}
}
/* Procesa la respuesta ya lista (texto, error, o manos que pedir confirmación) */
/* Detecta si el error del chat es por CRÉDITOS de Anthropic y añade el aviso de recarga */
function iaEsCredito(m){ return /credit|balance|billing|saldo|insufficient|quota|payment|402/i.test(String(m||"")); }
function iaErrMsg(m){ const s=String(m||"Error"); if(iaEsCredito(s)) return "💳 **Se agotaron los créditos de Roberto** (tu cuenta de Anthropic). Recárgalos y en 1 minuto vuelvo:\n"+IA_RECARGA_URL+"\n(También en ⚙️ → «💳 Saldo / recargar créditos».)"; return "⚠️ "+s; }
async function iaBgResuelto(jobId, d){
  /* 🔁 error transitorio marcado por el worker (v5.65): reintentar solo, sin molestar a Rey.
     OJO: antes de iaPendBorrar, porque el reintento necesita el pendiente con sus mensajes. */
  if(d && d.error && d.retry){ iaAutoReintento(jobId, "", d.error); return; }
  const pend=iaPendCargar().find(x=>x.jobId===jobId);
  const c = (pend && IA.convs.find(x=>x.id===pend.convId)) || iaConvAct();
  iaPendBorrar(jobId);
  IA.actId=c.id;   // deja como activa la conversación de la respuesta, para que se vea al abrir el chat
  if(d.error){ IA.busy=false; c.msgs.push(iaMsgFallo(d.error)); iaGuardarConvs(); pintarIAChat(); return; }
  if(d.toolUse && Array.isArray(d.content)){
    const pre=d.content.filter(b=>b.type==="text").map(b=>b.text||"").join("").trim();
    if(pre) c.msgs.push({role:"assistant",content:pre});
    const baseMsgs=(pend && Array.isArray(pend.msgs)) ? pend.msgs.slice() : [];
    baseMsgs.push({role:"assistant", content:d.content});
    iaGuardarConvs(); pintarIAChat();
    const tus=d.content.filter(b=>b.type==="tool_use");
    const results=[];
    for(const tu of tus){
      const dec=await confirmarTool(tu);
      if(dec.confirmed){ const rr=dec.res||{ok:false,msg:"sin resultado"}; c.msgs.push({role:"assistant",content:(rr.ok?"✅ ":"⚠️ ")+rr.msg}); iaGuardarConvs(); pintarIAChat(); results.push({type:"tool_result",tool_use_id:tu.id,content:(rr.ok?"HECHO: ":"NO SE PUDO: ")+rr.msg}); }
      else{ c.msgs.push({role:"assistant",content:"🚫 Cancelaste esta acción."}); iaGuardarConvs(); pintarIAChat(); results.push({type:"tool_result",tool_use_id:tu.id,content:"El usuario CANCELÓ esta acción; no la hagas."}); }
    }
    baseMsgs.push({role:"user", content:results});
    IA.busy=true; pintarIAChat(); iaVigilarBusy();
    /* Antes, si este envío fallaba (red, worker), Roberto se quedaba MUDO tras aprobar
       las tarjetas — sin mensaje, sin botones. Ahora: 2 intentos y, si aun así no sale,
       tarjeta de fallo con sus botones de verdad. */
    let enviado=false;
    for(let i=0;i<2 && !enviado;i++){
      try{
        const r=await fetch(iaBase()+"/chat/bg",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({system:iaSystemFull(),messages:baseMsgs,clientTools:IA_TOOLS,motor:(pend&&pend.motor)||iaMotor()})});
        const dd=await r.json().catch(()=>({}));
        if(dd&&dd.jobId){ iaPendGuardar({jobId:dd.jobId,convId:c.id,msgs:baseMsgs,motor:(pend&&pend.motor)||iaMotor(),ts:Date.now()}); iaPollJob(dd.jobId); enviado=true; }
      }catch(_){}
    }
    if(!enviado){ IA.busy=false; c.msgs.push(iaMsgFallo("")); iaGuardarUltimo(c); iaGuardarConvs(); pintarIAChat(); }
    return;
  }
  IA.busy=false;
  const txt=(d.text||"").trim();
  c.msgs.push({role:"assistant",content: txt || "⚠️ No me llegó respuesta, reintenta."});
  iaGuardarConvs();
  pintarIAChat();
  if(IA.voz.on || IA.autoHablarUna){ const ult=c.msgs[c.msgs.length-1]; if(ult && ult.role==="assistant" && ult.content && !/^⚠️|^💳|^🚫|^✅/.test(ult.content)) iaHablar(ult.content, c.msgs.length-1); IA.autoHablarUna=false; }
}
/* Muestra en el chat la respuesta de un job concreto (el de la notificación que
   tocaste). Busca su resultado y lo añade a la conversación, sin duplicar. */
async function iaMostrarJob(jobId, intentos){
  intentos=intentos||0;
  if(!jobId) return;
  let d=null;
  try{ const r=await fetch(iaBase()+"/chat/bg?job="+encodeURIComponent(jobId),{cache:"no-store"}); d=await r.json(); }catch(_){}
  if((!d || !d.ready) && intentos<20){ setTimeout(()=>iaMostrarJob(jobId, intentos+1), 3000); return; }
  if(!d || !d.ready) return;
  iaPendBorrar(jobId);
  if(d.toolUse){ iaBgResuelto(jobId, d); return; }   // si son "manos", usa el flujo con tarjetas
  const c=iaConvAct();
  const txt=(d.error?iaErrMsg(d.error):(d.text||"")).trim();
  if(!txt) return;
  const ya=c.msgs.some(m=>m.role==="assistant" && m.content===txt);
  if(!ya) c.msgs.push({role:"assistant",content:txt});
  IA.busy=false; iaGuardarConvs(); pintarIAChat();
  if((IA.voz.on || IA.autoHablarUna) && !ya && !/^⚠️|^💳|^🚫|^✅/.test(txt)){ iaHablar(txt, c.msgs.length-1); IA.autoHablarUna=false; }
}
/* Al abrir la app, recupera respuestas que terminaron mientras estaba cerrada */
/* Recupera respuestas que quedaron en marcha (app cerrada, móvil bloqueado…).
   ⚠️ ARREGLADO: antes bloqueaba el chat con IA.busy por CUALQUIER pendiente de hasta 2 horas.
   Si un trabajo moría (sin créditos, corte de red), el pendiente se quedaba guardado y cada
   vez que Rey abría la app volvía a bloquearse — sin poder escribir NADA. Ahora solo bloquea
   si el trabajo es RECIENTE (menos de 6 min, que es lo que puede tardar de verdad); los más
   viejos se siguen sondeando por si acaso, pero NO le cierran la boca. */
const IA_ESPERA_MAX = 6*60000;
function iaResumePend(){
  const ps=iaPendCargar();
  let hayActiva=false;
  ps.forEach(p=>{
    if(Date.now()-p.ts > 2*3600000){ iaPendBorrar(p.jobId); return; }
    if(p.convId===IA.actId && (Date.now()-p.ts) < IA_ESPERA_MAX) hayActiva=true;
    iaPollJob(p.jobId);
  });
  IA.busy = hayActiva;          // si no hay ninguno reciente, la caja queda LIBRE
  pintarIAChat();
  iaVigilarBusy();
}
/* 🛟 SEGURO ANTIBLOQUEO: pase lo que pase, la caja de texto no se queda muerta.
   Si Roberto lleva más de 6 minutos "pensando", se libera solo y avisa. */
let _iaBusyGuard=null;
function iaVigilarBusy(){
  clearTimeout(_iaBusyGuard);
  if(!IA.busy) return;
  _iaBusyGuard=setTimeout(()=>{
    if(!IA.busy) return;
    IA.busy=false;
    try{ const c=iaConvAct(); if(c){ c.msgs.push(iaMsgFallo("")); iaGuardarConvs(); } }catch(_){}
    pintarIAChat();
    toast("Ya puedes escribir: la respuesta anterior no llegó");
  }, IA_ESPERA_MAX);
}
/* ✕ Cancelar la espera a mano: si Rey ve los puntitos y quiere escribir YA, los para. */
function iaCancelarEspera(){
  Object.keys(_iaPolling).forEach(j=>{ clearTimeout(_iaPolling[j]); delete _iaPolling[j]; });
  iaPendCargar().forEach(p=>iaPendBorrar(p.jobId));
  IA.busy=false; clearTimeout(_iaBusyGuard);
  pintarIAChat();
  toast("Espera cancelada — ya puedes escribir");
}
async function iaEnviar(textoForzado, promptExtra){
  const ta=$("#iaText");
  let texto=(textoForzado!=null?textoForzado:(ta?ta.value:"")).trim();
  const img=IA.pendImg;
  const doc=IA.pendDoc;   // 📄 documento adjunto (PDF/texto) para nutrir a Roberto
  if((!texto && !img && !doc) || IA.busy) return;
  if(!IA.url){ toast("Configura el puente (⚙️)"); $("#iaCfg").click(); return; }
  if(!texto && img) texto="Analiza este gráfico según mi estrategia CRT: par/temporalidad, bias, sweep, MSS y zona. Dime si hay un setup válido (A+/B/C) y qué harías.";
  if(!texto && doc) texto="Te comparto este documento para que APRENDAS de él: analízalo a fondo, dime qué aporta a mi método, qué confirma, qué mejoraría o cambiaría, y propón guardar lo valioso en tu memoria o en mi estrategia.";
  /* 🧭 cuenta el material que Rey le comparte (documentos y enlaces): es la señal de la fase 02 */
  try{ if(doc || /https?:\/\//i.test(texto)){ PLAN_ARR.docs=(PLAN_ARR.docs||0)+1; guardarPlan(); } }catch(_){}
  /* 🧠 motor sintomático: si la tarea parece profunda y el ajuste es Rendidor, pregunta.
     Se decide AQUÍ (antes de vaciar la caja) y vale solo para esta consulta. */
  const motorMsg = iaMotorPara(texto, !!doc, !!promptExtra);
  if(ta){ ta.value=""; ta.style.height="auto"; }
  IA.pendImg=null; IA.pendDoc=null; iaPintarAtt();
  const c=iaConvAct();
  c.msgs.push({role:"user",content:texto + (doc?("\n\n📄 (te adjunté: "+(doc.nombre||"documento")+")"):""), img:img||undefined});
  if(!c.t) c.t=iaTit(c);
  IA.busy=true;
  if(!iaGuardarConvs()) toast("Imagen muy pesada: se envía pero quizá no se guarde en el historial");
  pintarIAChat();
  /* 💰 VENTANA ESTABLE DE HISTORIAL: antes se mandaban SIEMPRE "los últimos 14" y la
     ventana se corría 1 con cada mensaje — el prefijo cambiaba y el caché del historial
     fallaba justo en las charlas largas. Ahora la ventana crece hasta 26 mensajes y solo
     entonces se re-ancla a los últimos 14: el prefijo se queda quieto ~12 mensajes
     seguidos y el caché pega de verdad. */
  if(typeof c.histIni!=="number" || c.histIni>c.msgs.length) c.histIni=Math.max(0,c.msgs.length-14);
  if(c.msgs.length-c.histIni>26) c.histIni=c.msgs.length-14;
  let hist=c.msgs.slice(c.histIni);
  while(hist.length && hist[0].role!=="user") hist.shift();
  // La foto solo viaja en el ÚLTIMO mensaje; los turnos anteriores van sin ella.
  let msgs=hist.map((x,i)=>iaMsgApi(x, i===hist.length-1));
  // Inyecta el contexto de datos en el bloque de texto del último mensaje del usuario
  let calTxt=""; try{ const ev=await cargarCalendarioCache(); calTxt=iaCalendarioContexto(ev)+"\n"; }catch(_){ calTxt=""; }
  let grafTxt=""; try{ grafTxt=await iaGrafico()+"\n"; }catch(_){ grafTxt=""; }
  // promptExtra = framework de análisis (semanal/diario) que va a la API pero NO se muestra en el chat
  const marco = promptExtra ? ("\n\n=== INSTRUCCIONES DEL ANÁLISIS QUE PIDE REY ===\n"+promptExtra+"\n=== FIN INSTRUCCIONES ===") : "";
  /* 💰 v6.02 — EL AGUJERO GRANDE, con datos reales del 22/08 ($5.44 en un día): el contexto
     vivo (reloj, gráfico, plan, rachas…) iba PEGADO DENTRO del mensaje de Rey. Como cambia en
     cada llamada, el caché del historial NUNCA pegaba y esos ~25k tokens se pagaban encima al
     DOBLE (precio de escritura de caché) para no reutilizarse jamás. AHORA: el mensaje de Rey
     viaja en su bloque ESTABLE (idéntico byte a byte al que luego va en el historial) con la
     marca de caché puesta AQUÍ MISMO, y el contexto vivo va DETRÁS de la marca, en su propio
     bloque, a precio normal (1×). El worker v5.68 respeta esta marca y no la pisa. */
  const inj="=== CONTEXTO VIVO DE LA APP (datos de AHORA MISMO; el mensaje de Rey es el bloque anterior) ===\n"+iaReloj()+"\n"+grafTxt+calTxt+iaContexto()+"\n"+iaEstrategiaDef()+"\n"+guardianRiesgo()+"\n"+iaPlan()+"\n"+iaAciertos()+"\n"+(estadoRecuperacionFreno().block||"")+iaFugas()+"\n"+iaRacha()+"\n"+iaPendientes()+"\n"+iaPlanSemanal()+"\n"+iaAvisos()+"\n"+iaEntradasAbiertas()+marco+"\n=== FIN DEL CONTEXTO — responde al mensaje de Rey del bloque anterior ===";
  const last=msgs[msgs.length-1];
  const textoMsg=c.msgs[c.msgs.length-1].content;   /* EXACTAMENTE lo guardado (texto + nota del doc) */
  let bloquesMsg = Array.isArray(last.content) ? last.content.filter(b=>b.type==="image") : [];   /* la foto va delante */
  bloquesMsg.push({ type:"text", text:textoMsg, cache_control:{ type:"ephemeral", ttl:"1h" } });
  if(doc && typeof iaDocBloques==="function"){ const bd=iaDocBloques(doc, ""); if(bd&&bd.length) bloquesMsg.push(bd[0]); }   /* 📄 el documento, ya sin el contexto colgado */
  bloquesMsg.push({ type:"text", text:inj });
  last.content=bloquesMsg;
  await iaBgStart(msgs, c, motorMsg);
}

/* ============================================================
   📄 INFORME MENSUAL EXPORTABLE — el registro de tu negocio
   Genera una página con TODO el mes (métricas, curva de R, cuentas, retiros, errores)
   y la abre lista para "Compartir" o para "Imprimir → Guardar como PDF" desde el móvil.
   ============================================================ */
function mesActualISO(){ return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit"}).format(new Date()); }
function nombreMes(ym){
  const pp=String(ym).split("-");
  const mn=["","enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return (mn[parseInt(pp[1],10)]||pp[1])+" "+pp[0];
}
function informeMensualHTML(ym){
  const lista=tradesCtx().filter(t=>String(t.fecha||"").indexOf(ym)===0 && !t.abierta);
  const m=metricas(lista);
  const fila=(k,v)=>`<tr><td>${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`;
  let kpis="";
  if(m){
    kpis=`<table class="t">
      ${fila("Operaciones cerradas", lista.length)}
      ${fila("Resultado neto", (m.rNeto>=0?"+":"")+r1(m.rNeto)+" R")}
      ${fila("Win rate", Math.round(m.wr*100)+"%")}
      ${fila("Profit factor", isFinite(m.pf)?r2(m.pf):"∞")}
      ${fila("Expectancy", (m.exp>=0?"+":"")+r2(m.exp)+" R / trade")}
      ${fila("RR real medio", r2(m.rrReal))}
      ${fila("Mejor / peor", "+"+r1(m.mejor)+" R / "+r1(m.peor)+" R")}
      ${fila("Drawdown máximo", "-"+r1(m.dd)+" R")}
    </table>`;
  } else {
    kpis=`<p class="v">Sin operaciones cerradas en este mes.</p>`;
  }
  /* curva de R en SVG (sin librerías, se ve igual en el PDF) */
  let curva="";
  if(lista.length){
    let acc=0; const pts=[0]; lista.forEach(t=>{ acc+=(parseFloat(t.r)||0); pts.push(acc); });
    const W=560,H=160,mx=Math.max(...pts),mn=Math.min(...pts),rg=(mx-mn)||1;
    const d=pts.map((y,i)=>(i?"L":"M")+(i/(pts.length-1)*W).toFixed(1)+","+(H-((y-mn)/rg)*H).toFixed(1)).join(" ");
    const y0=H-((0-mn)/rg)*H;
    curva=`<svg viewBox="0 0 ${W} ${H}" class="cv"><line x1="0" y1="${y0.toFixed(1)}" x2="${W}" y2="${y0.toFixed(1)}" class="z"/><path d="${d}"/></svg>`;
  }
  /* por par */
  const porPar={};
  lista.forEach(t=>{ const p=t.par||"—"; (porPar[p]=porPar[p]||[]).push(parseFloat(t.r)||0); });
  const pares=Object.keys(porPar).sort((a,b)=>porPar[b].reduce((x,y)=>x+y,0)-porPar[a].reduce((x,y)=>x+y,0));
  const tPares=pares.length?`<table class="t"><tr><th>Par</th><th>Ops</th><th>R neto</th></tr>`+
    pares.map(p=>{ const s=porPar[p].reduce((x,y)=>x+y,0); return `<tr><td>${esc(p)}</td><td>${porPar[p].length}</td><td class="${s>=0?"g":"r"}">${s>=0?"+":""}${r1(s)} R</td></tr>`; }).join("")+`</table>`:"";
  /* cuentas y retiros */
  const cts=(Array.isArray(CUENTAS)?CUENTAS:[]).filter(c=>c.fase!=="Cerrada");
  const tCuentas=cts.length?`<table class="t"><tr><th>Cuenta</th><th>Fase</th><th>Progreso</th><th>Retirado</th></tr>`+
    cts.map(c=>{ const st=statsCuenta(c); return `<tr><td>${esc(c.alias||c.firma||"—")}</td><td>${esc(c.fase||"—")}</td><td class="${st.progresoPct>=0?"g":"r"}">${st.progresoPct>=0?"+":""}${r1(st.progresoPct)}%</td><td>${r0(+c.retiros||0)}</td></tr>`; }).join("")+`</table>`:"";
  const retiroTotal=cts.reduce((a,c)=>a+(+c.retiros||0),0);
  /* errores más repetidos */
  const errs={};
  lista.forEach(t=>{ (Array.isArray(t.errores)?t.errores:[]).forEach(e=>{ errs[e]=(errs[e]||0)+1; }); });
  const topErr=Object.keys(errs).sort((a,b)=>errs[b]-errs[a]).slice(0,5);
  const tErr=topErr.length?`<table class="t"><tr><th>Error</th><th>Veces</th></tr>`+topErr.map(e=>`<tr><td>${esc(e)}</td><td>${errs[e]}</td></tr>`).join("")+`</table>`:`<p class="v">Ningún error registrado este mes. 👏</p>`;

  return `<title>Informe ${esc(nombreMes(ym))} · Apex</title>
<style>
  *{box-sizing:border-box} body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;margin:0;padding:22px;background:#fff;color:#111;line-height:1.5}
  h1{font-size:22px;margin:0 0 2px} h2{font-size:15px;margin:22px 0 8px;color:#1a5cff;border-bottom:2px solid #e6ecff;padding-bottom:5px}
  .sub{color:#666;font-size:13px;margin-bottom:14px}
  .t{width:100%;border-collapse:collapse;font-size:13.5px;margin:6px 0}
  .t td,.t th{padding:7px 9px;border-bottom:1px solid #eee;text-align:left} .t th{background:#f6f8ff;font-size:12px;text-transform:uppercase;letter-spacing:.4px;color:#555}
  .t td:last-child,.t th:last-child{text-align:right}
  .g{color:#0a8f3c;font-weight:700} .r{color:#d12d2d;font-weight:700} .v{color:#777;font-size:13.5px}
  .cv{width:100%;height:160px;margin:8px 0} .cv path{fill:none;stroke:#1a5cff;stroke-width:2.2} .cv .z{stroke:#ddd;stroke-width:1;stroke-dasharray:4 4}
  .pie{margin-top:26px;padding-top:12px;border-top:1px solid #eee;color:#888;font-size:11.5px}
  .noprint{margin:0 0 16px} .noprint button{font:inherit;padding:10px 16px;margin-right:8px;border:0;border-radius:9px;background:#1a5cff;color:#fff;font-weight:600}
  @media print{ .noprint{display:none} body{padding:0} }
</style>
<div class="noprint"><button onclick="window.print()">🖨️ Guardar como PDF</button></div>
<h1>Informe de ${esc(nombreMes(ym))}</h1>
<div class="sub">${esc(CTX.estrategia||"—")} · ${esc(CTX.modo==="real"?"Cuenta real":"Backtest")} · generado el ${esc(new Intl.DateTimeFormat("es",{timeZone:"America/Sao_Paulo",dateStyle:"long"}).format(new Date()))}</div>
<h2>Resumen del mes</h2>${kpis}
${curva?`<h2>Curva de resultados (R acumulada)</h2>${curva}`:""}
${tPares?`<h2>Por par</h2>${tPares}`:""}
${tCuentas?`<h2>Cuentas</h2>${tCuentas}<p class="v">Total retirado (histórico): <b>${r0(retiroTotal)}</b></p>`:""}
<h2>Errores más repetidos</h2>${tErr}
<div class="pie">Apex v${esc(APP_VERSION)} · Informe generado automáticamente. Los R se calculan sobre operaciones CERRADAS del contexto activo.</div>`;
}
async function informeMensual(ym){
  ym=ym||mesActualISO();
  const html=informeMensualHTML(ym);
  const nombre="Apex_informe_"+ym+".html";
  /* 1) intenta compartirlo (Drive, WhatsApp, Archivos…) */
  try{
    const file=new File([html],nombre,{type:"text/html"});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({files:[file], title:"Informe "+nombreMes(ym), text:"Informe mensual de Apex"});
      toast("Elige dónde guardarlo 📄");
      return;
    }
  }catch(e){ if(e && e.name==="AbortError") return; }
  /* 2) si no puede compartir, lo abre para imprimir/guardar como PDF */
  try{
    const w=window.open("","_blank");
    if(w){ w.document.write(html); w.document.close(); toast("Toca 🖨️ para guardarlo como PDF"); return; }
  }catch(_){}
  bajar(nombre,html,"text/html");
  toast("Informe descargado 📄");
}

/* ============================================================
   ☁️ RESPALDO PROGRAMADO — que no dependa de que te acuerdes
   La app ya sincroniza sola con la nube. Esto es el respaldo FÍSICO a tu Drive:
   cada X días te lo recuerda al abrir la app y lo lanza con un toque.
   (Una app web no puede escribir en tu Drive sin tu permiso: por eso te abre
   el menú de compartir y tú eliges Drive. Ese toque es el único paso manual.)
   ============================================================ */
const K_RESP_CADA="crtelite_resp_cada";
const K_RESP_LAST="crtelite_resp_last";
function respCada(){ const v=parseInt(localStorage.getItem(K_RESP_CADA)||"7",10); return isNaN(v)?7:v; }
function respSetCada(n){ localStorage.setItem(K_RESP_CADA,String(n)); }
function respLast(){ return parseInt(localStorage.getItem(K_RESP_LAST)||"0",10)||0; }
function respMarcar(){ localStorage.setItem(K_RESP_LAST,String(Date.now())); }
function respToca(){
  const cada=respCada(); if(!cada) return false;              // 0 = desactivado
  const last=respLast();
  if(!last) return (Array.isArray(TRADES)?TRADES.length:0)>0; // nunca respaldó y ya tiene datos
  return (Date.now()-last) >= cada*86400*1000;
}
function respChequear(){
  if(!respToca()) return;
  if($("#respOv")) return;
  const dias=respLast()?Math.floor((Date.now()-respLast())/86400000):null;
  const ov=el("div","menu-ov"); ov.id="respOv";
  ov.innerHTML=`<div class="menu-sheet" style="max-width:420px">
    <div class="menu-h"><div class="t">☁️ Toca respaldar</div><button class="x" id="respX" aria-label="Cerrar">✕</button></div>
    <div style="padding:14px 16px 18px">
      <p class="desc" style="text-align:left">${dias!=null?("Hace <b>"+dias+" día(s)</b> que no guardas un respaldo en tu Drive."):"Aún no has guardado ningún respaldo en tu Drive."}
      Tus datos ya se sincronizan en la nube, pero una copia tuya en Drive es la que te salva si pierdes el teléfono.</p>
      <button class="btn" id="respGo" style="margin-top:10px">☁️ Guardar respaldo ahora</button>
      <button class="btn" id="respLuego">Ahora no</button>
      <div class="note" style="text-align:left;margin-top:10px">Recordármelo cada
        <select class="inp" id="respCada" style="display:inline-block;width:auto;margin:0 4px">
          ${[3,7,15,30,0].map(n=>`<option value="${n}"${n===respCada()?" selected":""}>${n?(n+" días"):"nunca"}</option>`).join("")}
        </select>
      </div>
    </div></div>`;
  document.body.appendChild(ov);
  const cerrar=()=>{ ov.remove(); };
  ov.onclick=e=>{ if(e.target===ov) cerrar(); };
  $("#respX").onclick=cerrar;
  $("#respLuego").onclick=()=>{ respMarcar(); cerrar(); toast("Te lo recuerdo en "+respCada()+" días"); };
  $("#respGo").onclick=async()=>{ cerrar(); await compartirRespaldo(); respMarcar(); };
  $("#respCada").onchange=e=>{ respSetCada(parseInt(e.target.value,10)); toast(parseInt(e.target.value,10)?("Te lo recordaré cada "+e.target.value+" días"):"Recordatorio desactivado"); };
}

/* ============================================================
   ARRANQUE
   ============================================================ */
function init(){
  const c=$("#views");
  c.append(viewNoticias(),viewAvisos(),viewHoy(),viewArranque(),viewChecklist(),viewConf(),viewRutina(),viewReglas(),viewRiesgo(),viewGatillo(),viewDiario(),viewGaleria(),viewCuentas(),viewEjecutor(),viewAlmanaque(),viewAnalisis(),viewMentor(),viewPlan());
  /* 🤖 la pestaña Ejecutor se refresca sola mientras la miras (cada 25 s) */
  setInterval(()=>{ try{ if(TAB==="ejecutor" && document.visibilityState==="visible") renderEjecutor(); }catch(_){} }, 25000);
  buildNav();
  fillPlanDinamico();
  initDiarioControles();

  ["cBal","cPct","cPips","cPrice"].forEach(i=>{ const e=$("#"+i); if(e) e.addEventListener("input",calcLotaje); });
  const cpar=$("#cPar"); if(cpar) cpar.addEventListener("change",onParCalc);
  const cpv=$("#cPv"); if(cpv) cpv.addEventListener("input",()=>{ cpv.dataset.manual="1"; calcLotaje(); });
  onParCalc();

  refreshChecklist(); refreshConf(); refreshReglas(); renderDiario();
  const ba=$("#btnAyuda"); if(ba) ba.onclick=()=>abrirAyuda(TAB);
  const bv=$("#ventEdit"); if(bv) bv.onclick=(e)=>{ e.stopPropagation(); abrirVentanasCfg(); };
  const bm=$("#btnMenu"); if(bm) bm.onclick=abrirMenu;
  iaInit();          /* inicializa el puente (IA.url) ANTES de mostrar Noticias, que lo necesita */
  iaResumePend();    /* recupera respuestas de Roberto que terminaron con la app cerrada */
  setTimeout(syncPendientes, 1500);   /* informa a la nube cuántas cosas 🔍 hay pendientes (para el aviso periódico) */
  setTimeout(syncRiesgo, 1800);        /* informa a la nube el estado de riesgo de las cuentas (Guardián proactivo) */
  setTimeout(syncAutoShots, 2200);     /* 📸 recoge capturas automáticas de entradas → Galería */
  document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="visible") syncAutoShots(); });
  setTimeout(parteMatutinoAuto, 3200); /* 🌅 parte del día EN VOZ (1 vez al día, si abres por la mañana) */
  /* 🔁 v6.03: abrir la app o volver a ella = "ya estoy mirando" -> apaga la alarma insistente
     del worker (la que repite el sonido cada 30 s). Inofensivo si no hay ninguna activa. */
  const insistVistoApp=()=>{ try{ fetch(nubeUrl()+"/insist/visto",{method:"POST"}).catch(()=>{}); }catch(_){} };
  setTimeout(insistVistoApp, 800);
  document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="visible") insistVistoApp(); });
  try{ nubeRestaurar(true); }catch(_){}  /* ☁️ si la nube tiene datos más nuevos (otro teléfono), restaura solo */
  /* Al volver a la app (no cerrarla del todo), recupera lo que haya terminado */
  document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="visible") iaResumePend(); });
  /* Si abriste tocando el push de una respuesta de Roberto, abre el chat con ella */
  try{ if(navigator.serviceWorker){ navigator.serviceWorker.addEventListener("message", ev=>{ if(ev.data && ev.data.type==="apex-open-chat"){ if(typeof abrirIA==="function") abrirIA(); if(ev.data.seed){ setTimeout(()=>iaProactivo(ev.data.seed),300); } else if(ev.data.jobId){ /* 📦 v6.24: si la notificación traía la respuesta completa, pintar directo */ let pend=null; try{ pend=iaPendCargar().find(x=>x.jobId===ev.data.jobId); }catch(_){} if(ev.data.texto && pend){ if(_iaPolling[ev.data.jobId]){ clearTimeout(_iaPolling[ev.data.jobId]); delete _iaPolling[ev.data.jobId]; } iaBgResuelto(ev.data.jobId, { ready:true, text: ev.data.texto }); } else iaMostrarJob(ev.data.jobId); } else iaResumePend(); } }); } }catch(_){}
  try{ const sp=new URLSearchParams(location.search); const dst=sp.get("ir"); if(dst) setTimeout(()=>irDestino(dst), 600); }catch(_){}
  try{ if(navigator.serviceWorker){ navigator.serviceWorker.addEventListener("message", ev=>{ if(ev.data && ev.data.type==="apex-ir" && ev.data.ir) irDestino(ev.data.ir); }); } }catch(_){}
  /* 💬 v6.23 (Rey): respuesta de Roberto con Apex ABIERTA — sin notificación: si el chat
     está abierto, el mensaje aterriza AHÍ al instante; si estás en otra sección, sale el
     banner 🛡️ de Roberto (tocarlo abre el chat de ESA conversación). */
  try{ if(navigator.serviceWorker){ navigator.serviceWorker.addEventListener("message", ev=>{
    if(!(ev.data && ev.data.type==="apex-chat-live")) return;
    const jid=ev.data.jobId||"";
    let chatAbierto=false; try{ const ov=$("#iaOv"); chatAbierto=!!(ov && ov.classList.contains("show")); }catch(_){}
    /* 📦 v6.24: si el aviso trae la respuesta COMPLETA (texto), se pinta AL INSTANTE —
       sin depender del almacén de la nube (el fallo del 28-08 en 4G: trabajo terminado
       pero estado sin propagar entre colos). Solo si hay un pendiente de ese job. */
    const pendDe=(id)=>{ try{ return iaPendCargar().find(x=>x.jobId===id); }catch(_){ return null; } };
    if(jid && ev.data.texto && !ev.data.toolUse && pendDe(jid)){
      if(_iaPolling[jid]){ clearTimeout(_iaPolling[jid]); delete _iaPolling[jid]; }
      iaBgResuelto(jid, { ready:true, text: ev.data.texto });
      if(!chatAbierto) mostrarBannerRoberto("💬 Roberto te respondió — toca para leerlo");
      return;
    }
    if(chatAbierto){
      if(jid){ if(_iaPolling[jid]){ clearTimeout(_iaPolling[jid]); delete _iaPolling[jid]; } iaPollJob(jid); }
      else iaResumePend();
    }else{
      mostrarBannerRoberto("💬 Roberto te respondió — toca para leerlo");
      if(jid) iaMostrarJob(jid);   /* deja la respuesta lista en el chat para cuando lo abras */
    }
  }); } }catch(_){}
  try{ const sp=new URLSearchParams(location.search); if(sp.get("open")==="chat"){ const jb=sp.get("job"); const seed=sp.get("seed"); setTimeout(()=>{ if(typeof abrirIA==="function") abrirIA(); if(seed) setTimeout(()=>iaProactivo(seed),350); else if(jb) iaMostrarJob(jb); else iaResumePend(); }, 500); } }catch(_){}
  setTimeout(syncReminders, 1800);   /* sube los avisos al vigilante (cron) */
  setTimeout(hoyCargarNoticias, 2000);  /* 📰 noticias del día dentro de la vista HOY */
  setTimeout(planCargarMem, 2400);     /* 🧭 cuenta la memoria de Roberto para las señales del plan */
  setTimeout(hoyCargarCtx, 2600);      /* 📡 último contexto del indicador para la vista 🎯 HOY */
  setTimeout(respChequear, 6000);      /* ☁️ recordatorio de respaldo a Drive cada X días */
  irA("hoy");        /* 🎯 lo primero al abrir: TODO tu día en una pantalla */
  tickRelojes(); setInterval(tickRelojes,10000);

  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }
  /* Reprograma avisos si Roberto los tenía activados */
  if(NOTIF.on && notifSoportado() && Notification.permission==="granted"){
    setTimeout(()=>{ notifProgramarKillzones(); notifChequearCuentasDD(); pushSubscribe(); }, 1500);
  } else if(NOTIF.on){ NOTIF.on=false; guardarNotif(); }
}
document.addEventListener("DOMContentLoaded",init);
