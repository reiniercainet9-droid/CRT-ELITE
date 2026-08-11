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
  estr   : "crtelite_estrategias_v3"
};
const load = (k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } };
const save = (k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){ toast("No se pudo guardar"); } };

let TRADES = load(K.trades, []);
let CHK    = load(K.chk, {});
let CONF   = load(K.conf, {});
let RLEIDAS= load(K.reglas, {});
let BAL    = load(K.bal, {bal:6000, pct:0.5, pips:10});

/* Lista de estrategias registradas (nombres). Siempre existe "CRT Elite". */
let ESTRATEGIAS = load(K.estr, ["CRT Elite"]);
if(!ESTRATEGIAS.length) ESTRATEGIAS = ["CRT Elite"];

/* Contexto activo: modo (real/backtest) + estrategia seleccionada */
let CTX = load(K.ctx, { modo:"real", estrategia:"CRT Elite" });
if(!ESTRATEGIAS.includes(CTX.estrategia)) CTX.estrategia = ESTRATEGIAS[0];

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
  const h=+p.hour, m=+p.minute;
  return { h, m, dec:h+m/60, txt:String(h).padStart(2,"0")+":"+String(m).padStart(2,"0"),
           dia:p.weekday.charAt(0).toUpperCase()+p.weekday.slice(1) };
}
function tickRelojes(){
  const ny=horaNY();
  $("#cNY").textContent=ny.txt;
  $("#dNY").textContent=ny.dia;
  const br=new Date();
  $("#cBR").textContent=String(br.getHours()).padStart(2,"0")+":"+String(br.getMinutes()).padStart(2,"0");

  const box=$("#vent"), t=$("#ventT"), s=$("#ventS");
  let activa=null;
  for(const v of VENTANAS){ if(v.s!=null && !v.bad && ny.dec>=v.s && ny.dec<v.e){ activa=v; break; } }
  box.className="vent "+(activa ? (activa.cls==="hl"?"best":"on") : "off");
  if(activa){
    t.textContent=activa.n+" · ACTIVA";
    s.textContent = activa.cls==="hl" ? "Tu mejor ventana. Checklist antes de tocar nada." : "Ventana válida ("+activa.h+" NY)";
  }else{
    t.textContent="Fuera de ventana";
    let prox=null;
    for(const v of VENTANAS){ if(v.s!=null && !v.bad && v.s>ny.dec){ prox=v; break; } }
    s.textContent = prox ? "Próxima: "+prox.n+" a las "+prox.h.split("−")[0]+" NY" : "Espera la próxima killzone";
  }
}

/* ---------- NAVEGACIÓN ---------- */
const TABS=[
  {id:"checklist", ic:"✅", n:"Checklist"},
  {id:"conf",      ic:"🎯", n:"Confluencias"},
  {id:"rutina",    ic:"🗺️", n:"Rutina"},
  {id:"reglas",    ic:"⛔", n:"Reglas"},
  {id:"riesgo",    ic:"💰", n:"Riesgo"},
  {id:"gatillo",   ic:"⚡", n:"Gatillo"},
  {id:"diario",    ic:"📒", n:"Diario"},
  {id:"almanaque", ic:"📅", n:"Almanaque"},
  {id:"analisis",  ic:"📈", n:"Análisis"},
  {id:"mentor",    ic:"🧠", n:"Mentor"},
  {id:"plan",      ic:"📋", n:"Plan"}
];
let TAB="checklist";

function irA(id){
  TAB=id;
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("on",v.id==="v-"+id));
  document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.t===id));
  window.scrollTo({top:0,behavior:"instant"});
  if(id==="analisis") renderAnalisis();
  if(id==="diario")   renderDiario();
  if(id==="gatillo")  renderGatillo();
  if(id==="mentor")   renderMentor();
  if(id==="almanaque")renderAlmanaque();
}
function buildNav(){
  const n=$("#nav"); n.innerHTML="";
  TABS.forEach(t=>{
    const b=el("button",t.id===TAB?"on":"",`<span class="i">${t.ic}</span>${t.n}`);
    b.dataset.t=t.id; b.onclick=()=>irA(t.id); n.appendChild(b);
  });
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

function menuEstrategias(){
  const acc=prompt(
    "GESTIÓN DE ESTRATEGIAS\n\nEstrategias actuales:\n· "+ESTRATEGIAS.join("\n· ")+
    "\n\nEscribe:\n  N = nueva estrategia\n  R = renombrar la actual ("+CTX.estrategia+")\n  X = borrar la actual (y sus trades)\n\nDeja vacío para cancelar."
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
    }
  }else if(a==="R"){
    const nom=prompt("Nuevo nombre para \""+CTX.estrategia+"\":", CTX.estrategia);
    if(nom && nom.trim() && nom.trim()!==CTX.estrategia){
      const nn=nom.trim(), viejo=CTX.estrategia;
      if(ESTRATEGIAS.includes(nn)){ toast("Ya existe ese nombre"); return; }
      ESTRATEGIAS=ESTRATEGIAS.map(e=>e===viejo?nn:e); guardarEstrategias();
      TRADES.forEach(t=>{ if(t.estrategia===viejo) t.estrategia=nn; }); save(K.trades,TRADES);
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
    plan:FORM.plan, emo:FORM.emo, nota:$("#fNota").value.trim()
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
    nuevoTrade=t;
    limpiarForm();
    if(bt) toast("Trade de backtest guardado ✓"); else toast("Trade guardado ✓");
  }
  refrescarDiarioCtx();
  if(nuevoTrade) mostrarCriterio(nuevoTrade);
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
          <div><span class="pill ${pc}">${t.setup}</span>
            ${t.plan==="No"?'<span class="pill br">PLAN ROTO</span>':""}
            ${t.fueraLimite?'<span class="pill br">R6</span>':""}
            <span class="trade-p">${esc(t.par)} · ${esc(t.dir)}</span></div>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="trade-r ${col}">${t.r>0?"+":""}${r1(t.r)}R</span></div></div>
          <div class="trade-m">${fechaCorta(t.fecha)} ${esc(t.dia||"")}${t.hora?" · "+esc(t.hora):""} · ${esc(t.ventana)}<br>
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
  `;
  abrirModal(cuerpo, [
    {t:"Editar", cls:"gold", fn:()=>{ cerrarModal(); editarTrade(id); }},
    {t:"Exportar este", cls:"", fn:()=>exportarUno(id)},
    {t:"Cerrar", cls:"", fn:cerrarModal}
  ]);
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
      await navigator.share({files:[file], title:"Respaldo CRT Elite", text:"Respaldo de tu app CRT Elite"});
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
    <div style="width:74px;height:74px;margin:0 auto 16px;border-radius:18px;background:linear-gradient(145deg,#1E2E52,#16233E);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:25px;color:var(--gold)">CRT</div>
    <div style="font-size:29px;font-weight:800;line-height:1.15">PLAN DE TRADING</div>
    <div style="font-size:26px;font-weight:800;color:var(--gold);margin-bottom:10px">CRT ELITE</div>
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
   ARRANQUE
   ============================================================ */
function init(){
  const c=$("#views");
  c.append(viewChecklist(),viewConf(),viewRutina(),viewReglas(),viewRiesgo(),viewGatillo(),viewDiario(),viewAlmanaque(),viewAnalisis(),viewMentor(),viewPlan());
  buildNav();
  fillPlanDinamico();
  initDiarioControles();

  ["cBal","cPct","cPips","cPrice"].forEach(i=>{ const e=$("#"+i); if(e) e.addEventListener("input",calcLotaje); });
  const cpar=$("#cPar"); if(cpar) cpar.addEventListener("change",onParCalc);
  const cpv=$("#cPv"); if(cpv) cpv.addEventListener("input",()=>{ cpv.dataset.manual="1"; calcLotaje(); });
  onParCalc();

  refreshChecklist(); refreshConf(); refreshReglas(); renderDiario();
  irA("checklist");
  tickRelojes(); setInterval(tickRelojes,10000);

  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }
}
document.addEventListener("DOMContentLoaded",init);
