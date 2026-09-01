/* ============================================================
   CRT ELITE v2 — DATOS
   Todo el contenido del plan operativo de Rey.
   ============================================================ */

const APP_VERSION = "6.82";

/* --- CHECKLIST OPERATIVO (4 bloques) --- */
const CHECKLIST = [
  { id:"pre", icon:"🛡️", title:"Pre-mercado", red:true, items:[
    { id:"p1", t:"Estado mental OK (sin prisa, sin revancha)", key:true },
    { id:"p2", t:"Bias semanal revisado", key:true },
    { id:"p3", t:"Calendario económico revisado (noticias rojas marcadas)", key:true },
    { id:"p4", t:"Estoy dentro de ventana horaria válida", key:true }
  ]},
  { id:"macro", icon:"🧭", title:"Análisis macro → micro", items:[
    { id:"m1", t:"Daily: bias definido + liquidez pendiente anotada" },
    { id:"m2", t:"H4: zona identificada + mínimo 2/3 confluencias" },
    { id:"m3", t:"Precio NO está en tierra de nadie (40−60%)" },
    { id:"m4", t:"1H/M15: SWEEP confirmado con mecha", key:true },
    { id:"m5", t:"Clasificación: A+ o B (si es C o menor, no opero)", key:true }
  ]},
  { id:"exec", icon:"🎯", title:"Ejecución (M5/M3)", items:[
    { id:"e1", t:"Precio reaccionó en FVG u OB de entrada" },
    { id:"e2", t:"Vela de confirmación cerrada (no entro en el toque)", key:true },
    { id:"e3", t:"SL definido detrás de estructura", key:true },
    { id:"e4", t:"TP1/TP2/TP3 definidos según setup" },
    { id:"e5", t:"Lotaje calculado para riesgo 0.5%", key:true },
    { id:"e6", t:"Va a favor del bias semanal", key:true }
  ]},
  { id:"gest", icon:"📊", title:"Gestión y cierre", items:[
    { id:"g1", t:"SL movido a BE en 1:1" },
    { id:"g2", t:"Parciales aplicados según tabla del setup" },
    { id:"g3", t:"Trade registrado en el diario" },
    { id:"g4", t:"¿Seguí el plan 100%? Marcado honestamente" }
  ]}
];

/* --- LAS 5 CONFLUENCIAS --- */
const CONFLUENCIAS = [
  { id:"c1", t:"SWEEP de liquidez", extra:"(mecha, no cierre)", sub:"La trampa ya se liquidó", ob:true },
  { id:"c2", t:"MSS", extra:"— cambio de estructura interno", sub:"Rompió el último BOS en tu dirección" },
  { id:"c3", t:"DISPLACEMENT", extra:"— vela impulsiva ≥ 20 pips", sub:"Intención institucional, cierre en el extremo" },
  { id:"c4", t:"REACCIÓN", extra:"en zona (OB / FVG / Breaker)", sub:"Entras en zona válida, no en el aire" },
  { id:"c5", t:"VOLUMEN / MOMENTUM", extra:"creciente", sub:"El impulso tiene fuerza detrás" }
];

/* --- REGLAS INVIOLABLES --- */
const REGLAS = [
  "Sin sweep = sin setup. No importan las demás confluencias.",
  "Solo opero A+ y B bajo las condiciones actuales de la cuenta.",
  "Mínimo 3 confluencias macro (Daily+H4) + 4 micro (M15+M5).",
  "Precio en 40−60% (tierra de nadie) = esperar siempre.",
  "Riesgo fijo 0.5% por trade. Nunca lo subo para recuperar.",
  "El cupo de operaciones del día es el de MI CONFIG del panel 🤖 (config viva — ella manda, no un número en piedra). Al llegar al cupo, cierro plataforma.",
  "2 Stop Loss en el día = cierre total hasta mañana.",
  "Semana −3% = solo A+. Semana −5% = pausa hasta el lunes.",
  "Solo opero dentro de las ventanas horarias definidas.",
  "El SL va donde la estructura lo invalida, no donde aguanta el bolsillo.",
  "Entro en la confirmación, jamás en el toque sin confirmar.",
  "No opero en los minutos alrededor de una noticia roja que marca MI CONFIG del panel 🤖 (config viva; hoy ±15).",
  "El bias semanal manda sobre el diario.",
  "Registro cada trade en el diario al cerrarlo, sin excepción.",
  "Si dudo, no entro. La duda ya es una respuesta: NO."
];

/* --- VENTANAS (hora NY) --- */
/* v6.15 (27-08): ventanas ALINEADAS con la killzone REAL del indicador (NY 07:30−12:30,
   la que Rey amplió) — antes el cartel decía "Fuera de ventana" a las 11:49 NY mientras
   el indicador y el Ejecutor seguían activos. Una sola verdad de horarios. */
const VENTANAS = [
  { n:"Londres",         sub:"",              h:"2:00−5:00 AM",   s:2,    e:5,    cls:"ok",  v:"Londres" },
  { n:"Pre-NY Kill Zone",sub:"mejor ventana", h:"7:30−9:30 AM",   s:7.5,  e:9.5,  cls:"hl",  v:"Pre-NY Kill Zone" },
  { n:"NY Apertura",     sub:"",              h:"9:30−12:30 PM",  s:9.5,  e:12.5, cls:"ok",  v:"NY Apertura" },
  { n:"NY Lunch",        sub:"trampas",       h:"12:30−1:30 PM",  s:12.5, e:13.5, cls:"bad", bad:true },
  { n:"Asiática",        sub:"ruido",         h:"no operar",      s:null, e:null, cls:"bad", bad:true },
  { n:"Viernes tarde",   sub:"solo gestión",  h:"tras 12 PM",     s:null, e:null, cls:"bad", bad:true }
];

const VENTANAS_DIARIO = ["Pre-NY Kill Zone","NY Apertura","Londres","Fuera de ventana"];

/* --- PARES PARA LA CALCULADORA DE LOTAJE (v3.2) --- */
const PARES_CALC = ["EUR/USD","GBP/USD","AUD/USD","NZD/USD","USD/JPY","USD/CAD","USD/CHF","EUR/JPY","GBP/JPY","EUR/GBP","Otro"];

/* --- EJECUCIÓN / GATILLO (v3.1) --- */
/* Momento de entrada: mide directamente el punto débil del timing prematuro */
const MOMENTOS     = ["En confirmación","En el toque","Anticipé"];
/* Formación exacta que disparó la entrada (distinta del POI/zona) */
const DISPARADORES = ["FVG 50%","Order Block","Envolvente/BOS","Pinbar/rechazo","CHoCH M1","Otro"];
/* Temporalidad donde se ejecutó el gatillo fino */
const GATILLO_TF   = ["5M","3M","1M"];
/* Filtro de noticias alrededor de la entrada */
const NOTICIA_OPC  = ["Limpio","Noticia cerca"];

/* --- PARCIALES --- */
const PARCIALES = [
  { k:"A+ 1:1", v:"SL a Break Even",                    c:"green" },
  { k:"A+ 1:2", v:"Cerrar 30%",                         c:"green" },
  { k:"A+ 1:3", v:"Cerrar 40% + trail 30% con estructura", c:"green" },
  { k:"B 1:1",  v:"SL a Break Even",                    c:"blue" },
  { k:"B 1:2",  v:"Cerrar 50%",                         c:"blue" },
  { k:"B 1:3",  v:"Cerrar 30% + trail 20% con estructura", c:"blue" }
];

/* --- RIESGO POR SETUP --- */
const RIESGO_SETUP = [
  { c:"A+",    conf:"5/5", r:"Riesgo 0.5%",  rr:"RR 1:4+", act:"operar",    cls:"ok" },
  { c:"B",     conf:"4/5", r:"Riesgo 0.5%",  rr:"RR 1:3",  act:"operar",    cls:"ok" },
  { c:"C",     conf:"3/5", r:"Riesgo 0.25%", rr:"RR 1:2",  act:"solo demo", cls:"bad" },
  { c:"< 3/5", conf:"",    r:"",             rr:"",        act:"No operar", cls:"bad" }
];

/* --- MANTRAS --- */
const MANTRAS = [
  "No opero rupturas… opero liquidez mitigada con estructura confirmada.",
  "Estar fuera del mercado también es una posición ganadora.",
  "Mi problema no es la dirección, es el cuándo. Espero la confirmación.",
  "Un trade saltándome reglas me cuesta más que cualquier pérdida."
];

/* --- MAPA DE TEMPORALIDADES --- */
const TEMPORALIDADES = [
  { tf:"Daily",     col:"purple", t:"Dirección (bias)",  d:"Hacia dónde voy. Sin cambio de estructura aquí." },
  { tf:"H4",        col:"blue",   t:"El DÓNDE",          d:"¿Hay zona válida? Mín. 2/3 confluencias. Portero para bajar." },
  { tf:"1H · 15M",  col:"gold",   t:"El CUÁNDO",         d:"Sweep + <b>MSS aquí</b> + confluencias. Valida el setup (A+/B/C)." },
  { tf:"5M · 3M",   col:"green",  t:"El punto EXACTO",   d:"Solo gatillo: FVG/OB + vela de confirmación. Aquí NO se valida." }
];

/* --- RUTINA PASO A PASO --- */
const RUTINA = [
  { n:"0", t:"Pre-mercado", s:"Sin gráfico aún", items:[
    "<b>Estado mental:</b> ¿dormí bien? ¿alterado, con prisa o con necesidad de recuperar? Si enciende alarma, hoy no opero.",
    "<b>Bias semanal:</b> lo leo. El semanal manda sobre el diario.",
    "<b>Calendario:</b> ¿noticia roja hoy? Marco horas NY.",
    "<b>Ventana:</b> ¿la sesión entra en ventana válida? Si no, cierro y vuelvo cuando toque."
  ]},
  { n:"1", t:"Dirección", s:"Temporalidad: DAILY · Objetivo: definir el BIAS (hacia dónde voy)" },
  { n:"2", t:"Zonas institucionales", s:"Temporalidad: H4 · Objetivo: ¿hay una zona VÁLIDA donde esperar? (el DÓNDE)" },
  { n:"3", t:"Validación + estructura", s:"Temporalidad: 1H y 15M · Objetivo: ¿ya cayó la trampa? (el CUÁNDO)" },
  { n:"4", t:"Ejecución", s:"Temporalidad: 5M y 3M · Objetivo: el punto EXACTO de entrada" },
  { n:"5", t:"Gestión y cierre", s:"Sobre la operación abierta" }
];

/* --- COMPORTAMIENTO POR DÍA --- */
const DIAS = [
  { d:"Lunes",     e:"Sweep falso del finde / rango asiático", a:"No entrar a lo primero" },
  { d:"Martes",    e:"Inicio del movimiento real",             a:"Mejor día de entrada a favor del bias" },
  { d:"Miércoles", e:"Continuación / extensión",               a:"2ª oportunidad si no entraste martes" },
  { d:"Jueves",    e:"Extensión a TP o reversión",             a:"Gestionar; cuidado con agotamiento" },
  { d:"Viernes",   e:"Cierre institucional y trampas",         a:"Solo gestión, nada nuevo tras 12 PM" }
];

/* --- PLAN COMPLETO (acordeón) --- */
const PLAN = [
{ n:"0", t:"Propósito y filosofía", html:`
<p>Este plan existe por una sola razón: convertir tu estrategia CRT Elite en un proceso repetible que ejecutes igual cada día, sin que las emociones decidan por ti. Ya sabes leer el gráfico. El problema que identificaste tú mismo es la disciplina antes del gráfico: entrar antes de tiempo, saltarte filtros, operar fuera de ventana.</p>
<ul>
<li><b>Qué soy:</b> operador de liquidez. Espero que el precio barra liquidez y confirme estructura. No persigo rupturas ni adivino.</li>
<li><b>Qué NO soy:</b> un apostador que necesita estar en el mercado. Estar fuera también es una posición.</li>
<li><b>Mi ventaja:</b> paciencia + selección. Opero pocas veces, pero solo cuando todo se alinea (A+ y B).</li>
<li><b>Mi mayor enemigo:</b> el timing prematuro. Mi dirección suele ser correcta; mi error es entrar ANTES de que la trampa se liquide.</li>
</ul>`},

{ n:"1", t:"Objetivos y métricas", html:`
<h4>Objetivo macro</h4>
<p>Pasar el desafío de 6K y proteger la cuenta fondeada de 6K, construyendo un historial de consistencia que justifique escalar a capital mayor. La meta NO es ganar rápido; es no romper reglas durante un periodo largo.</p>
<h4>Objetivos de proceso (lo que sí controlo)</h4>
<div class="tw"><table class="tbl">
<tr><th>Métrica</th><th>Meta</th><th>Por qué</th></tr>
<tr><td>Adherencia al checklist</td><td>100%</td><td>Un trade fuera de checklist contamina toda la estadística</td></tr>
<tr><td>Trades fuera de ventana</td><td>0</td><td>El error más caro y el más evitable</td></tr>
<tr><td>Límite diario (2 trades)</td><td>100% días</td><td>Evita el revenge trading</td></tr>
<tr><td>Diario actualizado</td><td>Cada trade</td><td>Sin datos no hay diagnóstico</td></tr>
<tr><td>Setups C tomados</td><td>0</td><td>Solo A+ y B mientras la cuenta esté en construcción</td></tr>
</table></div>
<h4>Objetivos de resultado (consecuencia, no foco)</h4>
<div class="tw"><table class="tbl">
<tr><th>KPI</th><th>Referencia</th></tr>
<tr><td>Win rate</td><td>≥ 45% (con RR alto es suficiente)</td></tr>
<tr><td>Profit factor</td><td>≥ 1.5</td></tr>
<tr><td>Expectancy por trade</td><td>Positiva y estable</td></tr>
<tr><td>Riesgo por trade</td><td>0.5% fijo</td></tr>
<tr><td>Drawdown máximo</td><td>Detener en −3% semana / −5% pausa total</td></tr>
</table></div>
<p style="color:var(--gold);font-size:13.5px">La pestaña <b>Análisis</b> calcula todos estos KPIs automáticamente con tus trades registrados.</p>`},

{ n:"2", t:"Gestión de riesgo", html:`
<div class="quote red"><b>El riesgo se define ANTES de entrar, nunca durante.</b> Si no sé cuánto pierdo si me equivoco, no entro.</div>
<h4>2.1 Riesgo por operación</h4>
<div class="tw"><table class="tbl">
<tr><th>Clase</th><th>Conf.</th><th>Riesgo</th><th>RR</th><th>¿Operar?</th></tr>
<tr><td style="color:var(--green)">A+</td><td>5/5</td><td>0.5%</td><td>1:4+</td><td class="pos">SÍ</td></tr>
<tr><td style="color:var(--blue)">B</td><td>4/5</td><td>0.5%</td><td>1:3</td><td style="color:var(--blue);font-weight:700">SÍ</td></tr>
<tr><td style="color:var(--orange)">C</td><td>3/5</td><td>0.25%</td><td>1:2</td><td class="neg">NO (demo)</td></tr>
<tr><td style="color:var(--red)">&lt;3/5</td><td>—</td><td>—</td><td>—</td><td class="neg">NO OPERAR</td></tr>
</table></div>
<p><i>Bajo las condiciones actuales tu regla es solo A+ y B. El setup C queda documentado pero reservado para demo o más adelante.</i></p>
<h4>2.2 Límites diarios y semanales (inviolables)</h4>
<div class="tw"><table class="tbl">
<tr><th>Disparador</th><th>Acción obligatoria</th></tr>
<tr><td>2 operaciones en el día</td><td>Se cierra la plataforma hasta mañana, gane o pierda</td></tr>
<tr><td>2 Stop Loss en el día</td><td>Cierre total inmediato. Prohibido abrir gráficos operativos</td></tr>
<tr><td>Semana en −3%</td><td>Solo setups A+ el resto de la semana</td></tr>
<tr><td>Semana en −5%</td><td>Pausa total hasta el lunes siguiente. Sin excepciones</td></tr>
</table></div>
<h4>2.3 Cálculo de lotaje (sin atajos)</h4>
<ol>
<li>Define el riesgo en dinero: balance × 0.5% (ej. 6.000 × 0.005 = 30 USD).</li>
<li>Mide la distancia del SL en pips (desde la entrada hasta detrás de la estructura).</li>
<li>Lotaje = Riesgo en dinero ÷ (pips de SL × valor del pip por lote).</li>
<li>Si el SL es tan amplio que el lotaje queda ridículo, el setup no vale: NO fuerces la entrada.</li>
</ol>
<div class="quote"><b>Regla de oro del SL:</b> el Stop Loss va donde la estructura lo invalida, NO donde tu bolsillo aguanta. Si no te gusta la distancia, reduce lotaje — nunca acerques el stop.</div>
<h4>2.4 Gestión de parciales por setup</h4>
<div class="tw"><table class="tbl">
<tr><th>Nivel</th><th>A+ (5/5)</th><th>B (4/5)</th></tr>
<tr><td>1:1</td><td>SL a Break Even</td><td>SL a Break Even</td></tr>
<tr><td>1:2</td><td>Cerrar 30%</td><td>Cerrar 50%</td></tr>
<tr><td>1:3</td><td>Cerrar 40% + trail 30%</td><td>Cerrar 30% + trail 20%</td></tr>
<tr><td>Trail</td><td colspan="2">Detrás de cada nuevo OB/FVG a favor</td></tr>
</table></div>
<p><i>Trailing con estructura, nunca ATR fijo. En NY el trail es más agresivo; en Londres más amplio.</i></p>`},

{ n:"3", t:"Definición del setup", html:`
<h4>3.1 La regla de oro absoluta</h4>
<div class="quote red"><b>SIN SWEEP = SIN SETUP.</b> No importa cuántas otras confluencias haya. Si el precio no barrió liquidez con mecha (no con cierre), no hay operación. Punto.</div>
<h4>3.2 Las 5 confluencias</h4>
<div class="tw"><table class="tbl">
<tr><th>#</th><th>Confluencia</th><th>Qué confirma</th></tr>
<tr><td>1</td><td>SWEEP (mecha, no cierre)</td><td>La trampa ya se liquidó — obligatoria</td></tr>
<tr><td>2</td><td>MSS (cambio estructura)</td><td>Rompió el último BOS en tu dirección</td></tr>
<tr><td>3</td><td>DISPLACEMENT (≥20 pips)</td><td>Intención institucional, cierre en el extremo</td></tr>
<tr><td>4</td><td>REACCIÓN en zona</td><td>OB/FVG/Breaker — entras en zona válida</td></tr>
<tr><td>5</td><td>VOLUMEN/MOMENTUM</td><td>El impulso tiene fuerza detrás</td></tr>
</table></div>
<h4>3.3 Zonas de valor</h4>
<ul>
<li><b style="color:var(--red)">PREMIUM</b> (50−100%): zona de VENTAS.</li>
<li><b style="color:var(--green)">DISCOUNT</b> (0−50%): zona de COMPRAS.</li>
<li><b style="color:var(--orange)">TIERRA DE NADIE</b> (40−60%): NO ENTRAR. Aquí se pierde más dinero por impaciencia.</li>
</ul>
<h4>3.4 Mínimos para entrar</h4>
<p>Necesitas mínimo 3 confluencias macro (Daily + H4) + 4 micro (M15 + M5). Si no llegas a ese mínimo, el setup no existe para ti hoy.</p>`},

{ n:"4", t:"Rutina paso a paso", html:`
<p>Tu secuencia operativa. En orden, sin saltar pasos. El gráfico se limpia al bajar de temporalidad: solo dejas las zonas donde el precio debe reaccionar.</p>
<div class="quote"><b>Mapa de temporalidades — cada una tiene UN objetivo:</b></div>
<div class="tw"><table class="tbl">
<tr><th>TF</th><th>Objetivo real</th></tr>
<tr><td>Daily</td><td>Dirección / bias. Hacia dónde voy. Sin cambio de estructura aquí.</td></tr>
<tr><td>H4</td><td>El DÓNDE. ¿Hay zona válida? Mín. 2/3 confluencias. Es el portero para bajar.</td></tr>
<tr><td>1H · 15M</td><td>El CUÁNDO. Sweep + <b>MSS aquí</b> + confluencias. Valida el setup (A+/B/C).</td></tr>
<tr><td>5M · 3M</td><td>El punto EXACTO de entrada. Solo gatillo. Aquí NO se valida el setup.</td></tr>
</table></div>
<div class="quote red"><b>El cambio de estructura (MSS) que valida el setup se produce en 1H/15M, nunca en 5M.</b> En M5 hay ruido y MSS falsos a cada rato. El M5 es solo el gatillo de entrada, no la validación.</div>
<h4>FASE 0 — Pre-mercado (sin gráfico aún)</h4>
<ol>
<li><b>Estado mental:</b> ¿dormí bien? ¿alterado, con prisa o con necesidad de recuperar? Si enciende alarma, hoy no opero.</li>
<li><b>Bias semanal:</b> lo leo. El semanal manda sobre el diario.</li>
<li><b>Calendario económico:</b> ¿noticia roja hoy (NFP, CPI, FOMC, tasas)? Marco horas NY y ajusto.</li>
<li><b>Ventana horaria:</b> ¿la sesión entra en ventana válida? Si no, cierro y vuelvo cuando toque.</li>
</ol>
<h4>FASE 1 — Dirección · Temporalidad: DAILY</h4>
<p><b>Objetivo:</b> definir el bias, hacia dónde voy. El Daily solo da dirección, no gatillo. Aquí NO hay cambio de estructura.</p>
<ul>
<li>Marco PDH/PDL, PWH/PWL, Equal Highs/Lows.</li>
<li><b>Bias:</b> falta liquidez arriba → alcista; abajo → bajista; ambos intactos → rango (esperar).</li>
<li>Anoto bias + liquidez pendiente con precios exactos.</li>
</ul>
<h4>FASE 2 — Zonas institucionales · Temporalidad: H4</h4>
<p><b>Objetivo: el DÓNDE.</b> En H4 no busco entrada todavía. Solo respondo: ¿hay una zona válida donde tenga sentido esperar al precio? Si no la hay, no bajo de temporalidad.</p>
<ul>
<li>Marco máximo 3 elementos: 50% del rango, FVG sin mitigar más cercano, OB institucional, Breaker.</li>
<li><b>Las 3 confluencias H4 (necesito mín. 2 de 3):</b></li>
<li>· <b>FVG sin mitigar:</b> desequilibrio que dejó un movimiento institucional. Sin mitigar, actúa como imán.</li>
<li>· <b>OB institucional alineado:</b> la huella de dónde entraron los grandes. Debe apuntar en mi dirección y estar en zona correcta.</li>
<li>· <b>Breaker (opcional):</b> un OB que falló y ahora actúa al revés. Confirma cambio de manos. No siempre está.</li>
<li>Confirmo zona: <b>Premium</b> (50−100%, ventas) / <b>Discount</b> (0−50%, compras) / <b>Tierra de nadie</b> (40−60%, NO bajar).</li>
<li><b>Filtro portero:</b> sin 2 de 3 confluencias en zona correcta, NO bajo a 1H. Me quedo fuera.</li>
</ul>
<h4>FASE 3 — Validación + estructura · Temporalidad: 1H y 15M</h4>
<p><b>Objetivo: el CUÁNDO.</b> Ya pasé el portero de H4. Aquí confirmo que el precio está haciendo lo que esperaba en esa zona. Es el permiso real para bajar a M5.</p>
<ul>
<li><b>1º el SWEEP (no negociable):</b> el precio barrió liquidez con MECHA, no con cierre. Si el cuerpo de la vela cierra más allá del nivel, es ruptura, no sweep. Sin sweep me detengo aquí (R1).</li>
<li><b>2º el MSS — el cambio de estructura va AQUÍ, en 1H/15M:</b> el precio rompe el último BOS en mi dirección. Esto confirma que el barrido no fue casualidad, sino el inicio del giro. Es el MSS que cuenta para la clasificación.</li>
<li>Marco swings relevantes (máx 3), Equal Highs/Lows, stop hunts recientes.</li>
<li>Recorro las 5 confluencias y clasifico: A+ (5/5) / B (4/5) / C (3/5) / NO OPERAR (&lt;3).</li>
<li><b>Clave:</b> el MSS que valida es el de 15M/1H. NO el de 5M. En el gráfico chico hay microrrupturas constantes que son ruido, no setup.</li>
</ul>
<h4>FASE 4 — Ejecución · Temporalidad: 5M y 3M</h4>
<p><b>Objetivo: el punto EXACTO de entrada.</b> En M5 NO valido el setup (eso ya quedó en Fase 3). Aquí solo busco el gatillo fino dentro de la zona ya validada.</p>
<ol>
<li>Precio toca el FVG o el OB de entrada.</li>
<li>Se forma vela de rechazo (pinbar o engulfing que forme order block).</li>
<li>La vela siguiente cierra más allá del 50% de la vela de rechazo.</li>
<li>ENTRO al cierre de esa vela de confirmación. SL detrás de la estructura M5, TP1/TP2/TP3 según setup.</li>
</ol>
<div class="quote"><b>Antídoto contra el timing prematuro:</b> no entro en el toque de la zona. Entro en la CONFIRMACIÓN. El toque sin confirmación es la trampa que me ha costado dinero. La microestructura de M5 es el gatillo, no la validación.</div>
<h4>FASE 5 — Gestión y cierre</h4>
<ul>
<li>Aplico parciales según la tabla de la sección 2.4. No improviso salidas.</li>
<li>Muevo SL a BE en 1:1. A partir de ahí, el peor caso es no perder.</li>
<li>Registro el trade en el diario INMEDIATAMENTE al cerrar.</li>
</ul>`},

{ n:"5", t:"Ventanas y días", html:`
<h4>5.1 Solo opero en estas ventanas (hora NY)</h4>
<div class="tw"><table class="tbl">
<tr><th>Ventana</th><th>Horario NY</th><th>Notas</th></tr>
<tr><td>Londres</td><td>2:00−5:00 AM</td><td>Válida</td></tr>
<tr><td>Pre-NY Kill Zone</td><td>7:30−9:30 AM</td><td style="color:var(--gold);font-weight:700">MEJOR VENTANA</td></tr>
<tr><td>NY Apertura</td><td>9:30−11:30 AM</td><td>Válida</td></tr>
</table></div>
<h4>5.2 Prohibido operar</h4>
<div class="tw"><table class="tbl">
<tr><th>Periodo</th><th>Por qué</th></tr>
<tr><td>Sesión asiática</td><td>Ruido y falsos sweeps</td></tr>
<tr><td>NY Lunch (11:30−1:30 NY)</td><td>Trampas frecuentes</td></tr>
<tr><td>Viernes tras 12 PM NY</td><td>Cierre institucional, solo gestión</td></tr>
</table></div>
<div class="quote"><b>Huso horario (Timbó, UTC−3):</b> Brasil no tiene horario de verano. El offset con NY cambia cuando EE.UU. ajusta su reloj (1er domingo de noviembre). En verano de NY el offset es +1h. Reajusta tus alarmas Toki entonces.</div>
<h4>5.3 Comportamiento esperado por día</h4>
<div class="tw"><table class="tbl">
<tr><th>Día</th><th>Qué esperar</th><th>Acción</th></tr>
<tr><td>Lunes</td><td>Sweep falso del finde / rango asiático</td><td>No entrar a lo primero</td></tr>
<tr><td>Martes</td><td>Inicio del movimiento real</td><td>Mejor día de entrada a favor del bias</td></tr>
<tr><td>Miércoles</td><td>Continuación / extensión</td><td>2ª oportunidad si no entraste martes</td></tr>
<tr><td>Jueves</td><td>Extensión a TP o reversión</td><td>Gestionar; cuidado con agotamiento</td></tr>
<tr><td>Viernes</td><td>Cierre institucional y trampas</td><td>Solo gestión, nada nuevo tras 12 PM</td></tr>
</table></div>`},

{ n:"6", t:"Diario de trading", html:`
<p>El diario no es opcional. Es la herramienta que diagnostica por qué la cuenta se estanca. Lo llenas en la pestaña <b>Diario</b> inmediatamente al cerrar cada trade, y la pestaña <b>Análisis</b> calcula sola tus métricas.</p>
<h4>6.1 Qué registra cada trade</h4>
<div class="tw"><table class="tbl">
<tr><th>Campo</th><th>Ejemplo</th></tr>
<tr><td>Fecha / hora NY</td><td>Mar 17 jun, 8:10 AM</td></tr>
<tr><td>Par</td><td>EUR/USD</td></tr>
<tr><td>Bias semanal / dirección</td><td>Compras / Alcista</td></tr>
<tr><td>Clasificación setup</td><td>A+ (5/5)</td></tr>
<tr><td>Confluencias presentes</td><td>Sweep, MSS, Displacement, FVG, Momentum</td></tr>
<tr><td>Ventana horaria</td><td>Pre-NY Kill Zone</td></tr>
<tr><td>Entrada / SL / TP</td><td>1.0850 / 1.0840 / 1.0890</td></tr>
<tr><td>Resultado (R)</td><td>+2.0R</td></tr>
<tr><td>MAE / MFE</td><td>−0.4R / +2.8R</td></tr>
<tr><td>¿Seguí el plan 100%?</td><td>SÍ / NO + qué rompí</td></tr>
<tr><td>Estado emocional</td><td>Tranquilo / ansioso / con prisa</td></tr>
</table></div>
<h4>6.2 Ritmo de revisión</h4>
<ul>
<li><b>Cada 10 trades o cada viernes:</b> abres <b>Análisis</b> y lees el diagnóstico completo.</li>
<li><b>Pregunta clave:</b> ¿mis pérdidas vienen de mala lectura o de romper reglas? Casi siempre es lo segundo — la tabla de "Plan roto" te lo confirma.</li>
<li><b>Pregunta de timing:</b> en los trades perdedores, ¿la dirección era correcta pero entré antes de la liquidación de la trampa? El MAE te da la respuesta numérica.</li>
</ul>`},

{ n:"7", t:"Reglas inviolables", html:`
<div class="quote red">Si rompo CUALQUIERA de estas reglas, el trade está mal aunque gane dinero. Un trade ganador con regla rota es un trade perdedor disfrazado: refuerza el mal hábito que me arruina a largo plazo.</div>
<div class="tw"><table class="tbl" id="planReglas"></table></div>`},

{ n:"8", t:"Disciplina y psicología", html:`
<p>Esta sección ataca directamente lo que te golpea: las reglas y la disciplina antes del gráfico. La técnica ya la tienes; aquí blindas la ejecución.</p>
<h4>8.1 Semáforo pre-trade (antes de CADA entrada)</h4>
<div class="tw"><table class="tbl">
<tr><th>Pregunta</th><th>Si es NO / dudosa</th></tr>
<tr><td>¿Estoy dentro de ventana horaria?</td><td class="neg">NO opero</td></tr>
<tr><td>¿Hubo sweep confirmado con mecha?</td><td class="neg">NO opero</td></tr>
<tr><td>¿El setup es A+ o B?</td><td class="neg">NO opero</td></tr>
<tr><td>¿Va a favor del bias semanal?</td><td class="neg">NO opero</td></tr>
<tr><td>¿Tengo SL y TP definidos ANTES?</td><td class="neg">NO opero</td></tr>
<tr><td>¿Estoy tranquilo, sin prisa ni revancha?</td><td class="neg">Cierro y vuelvo mañana</td></tr>
</table></div>
<h4>8.2 Disparadores de parada (STOP)</h4>
<ul>
<li>Sensación de querer recuperar una pérdida → cierro plataforma.</li>
<li>Empiezo a buscar setups en temporalidades raras o pares que no opero → STOP.</li>
<li>Subo el lotaje "solo esta vez" → señal de descontrol, STOP.</li>
<li>Llevo mucho tiempo mirando el gráfico sin setup y siento ansiedad → me alejo.</li>
</ul>
<h4>8.3 Ritual de cierre del día</h4>
<ol>
<li>Anoto el/los trade(s) del día en el diario.</li>
<li>Marco honestamente si seguí el plan al 100%.</li>
<li>Una frase de aprendizaje del día (qué hice bien, qué corrijo).</li>
<li>Cierro la plataforma. El día operativo terminó.</li>
</ol>
<h4>8.4 Mantras anti-error</h4>
<div id="planMantras"></div>`},

{ n:"9", t:"Checklist imprimible", html:`
<p><i>No entras a ningún trade sin marcar todas las casillas.</i></p>
<div id="planChecklist"></div>
<div class="quote" style="text-align:center">La semana se gana el domingo. El que planifica domina; el que improvisa, paga.</div>`}
];

/* ============================================================
   🧭 PLAN DE ARRANQUE — las 6 fases para empezar a trabajar con Roberto.
   No es un texto: es el estado real de Rey. La app comprueba sola las señales
   de avance y Roberto lee este mismo plan en cada conversación, así los tres
   (Rey, Apex y Roberto) van SIEMPRE por el mismo punto.
   Cada fase: pasos que Rey marca + una SEÑAL que la app verifica sola.
   ============================================================ */
const PLAN_FASES = [
  {
    id:"f0", n:"00", t:"Encender el sistema", cuando:"Hoy · unos 20 minutos",
    idea:"Todo lo que sigue depende de que esto quede bien hecho.",
    pasos:[
      {id:"f0p1", t:"Subir el worker a Cloudflare y pulsar Deploy"},
      {id:"f0p2", t:"Subir el contenido del ZIP de la app a GitHub"},
      {id:"f0p3", t:"Cerrar Apex del todo y volver a abrirla (debe decir la versión nueva)"},
      {id:"f0p4", t:"Comprobar que abre en 🎯 HOY con la hora de Brasil y Nueva York"},
      {id:"f0p5", t:"Encender el PC y el Puente"},
      {id:"f0p6", t:"Comprobar que TradingView tiene las alarmas activas en tus pares"}
    ],
    señal:"Apex abre en 🎯 HOY, se conecta con la nube y ves los chips nuevos en el chat.",
    auto:"nube"
  },
  {
    id:"f1", n:"01", t:"Solo hablar", cuando:"Días 1 a 3 · sin operar",
    idea:"Que Roberto te conozca y que tú aprendas a preguntarle. Aquí no se opera.",
    pasos:[
      {id:"f1p1", t:"Abrir 🎯 HOY cada mañana antes que nada"},
      {id:"f1p2", t:"Pedir el 🌅 Parte del día y leerlo entero"},
      {id:"f1p3", t:"Corregir a Roberto en el momento si dice algo mal"},
      {id:"f1p4", t:"Contarle quién eres: qué te cuesta, cuándo te precipitas, qué quieres conseguir"},
      {id:"f1p5", t:"Revisar 🧠 Mi memoria y borrar lo que no sea cierto"}
    ],
    señal:"Roberto tiene al menos 6 recuerdos tuyos repartidos en 2 temas o más.",
    auto:"memoria", min:6, minTemas:2
  },
  {
    id:"f2", n:"02", t:"Alimentarlo", cuando:"Días 4 a 7 · sigues sin operar",
    idea:"Darle la teoría. Esta fase convierte a Roberto en TU mentor y no en un asistente genérico.",
    pasos:[
      {id:"f2p1", t:"Pasarle tus documentos de CRT, SMC e ICT (📎 en el chat)"},
      {id:"f2p2", t:"Pasarle enlaces de clases, artículos o reglas de firmas"},
      {id:"f2p3", t:"Discutir con él lo que te proponga que choque con tu forma de operar"},
      {id:"f2p4", t:"Usar el chip 📸 Estudia mis capturas al menos una vez"}
    ],
    señal:"Le has pasado material y su memoria ya tiene 4 o más recuerdos de estrategia o visuales.",
    auto:"nutrido", min:4
  },
  {
    id:"f3", n:"03", t:"Operar en demo, con él al lado", cuando:"Semanas 2 y 3 · dinero de práctica",
    idea:"Construir el hábito. La misma disciplina que en real, pero sin el miedo.",
    pasos:[
      {id:"f3p1", t:"Cada mañana: 🎯 HOY + checklist + parte del día"},
      {id:"f3p2", t:"Pedir ✅ GO/NO-GO antes de CADA entrada, sin excepción"},
      {id:"f3p3", t:"Registrar cada trade en el Diario al cerrarlo, con su captura"},
      {id:"f3p4", t:"Pedir el 📆 Análisis del día al cerrar la jornada"},
      {id:"f3p5", t:"Los domingos: leer su 🎓 informe y pedir el 🗓️ Análisis semanal"}
    ],
    señal:"14 días seguidos sin romper ni una regla operando EN VIVO (máx. 2 trades/día y nunca 2 SL en el mismo día), con al menos 10 trades en vivo registrados. El BACKTEST no cuenta aquí: es tu gimnasio, practica sin límite.",
    auto:"disciplina", dias:14, minTrades:10
  },
  {
    id:"f4", n:"04", t:"Dinero real, una sola cuenta", cuando:"Semana 4 en adelante",
    idea:"Una cuenta. Nada más. Ahora el Guardián de Riesgo trabaja de verdad.",
    pasos:[
      {id:"f4p1", t:"Registrar la cuenta en 🏦 Cuentas con su drawdown diario y máximo reales"},
      {id:"f4p2", t:"Mirar el bloque de riesgo en 🎯 HOY antes de cada sesión"},
      {id:"f4p3", t:"Si Roberto te frena, pararte y discutirlo después en frío"},
      {id:"f4p4", t:"Avisarle cuando cobres un payout para que lo registre"}
    ],
    señal:"Un mes natural completo operando en real con las reglas intactas.",
    auto:"mesreal"
  },
  {
    id:"f5", n:"05", t:"Escalar", cuando:"Mes 2 en adelante",
    idea:"Ya no es aprender: es hacer crecer un negocio que funciona.",
    pasos:[
      {id:"f5p1", t:"Sacar el 📄 Informe mensual y guardarlo en el Drive"},
      {id:"f5p2", t:"Comentar el informe con Roberto y comparar con el mes anterior"},
      {id:"f5p3", t:"Añadir cuentas de una en una, nunca varias a la vez"},
      {id:"f5p4", t:"Añadir pares de uno en uno, con sus alarmas del indicador"},
      {id:"f5p5", t:"Hacer el respaldo a Drive cada vez que la app te lo recuerde"}
    ],
    señal:"Esta fase no se termina: se repite cada mes.",
    auto:"ninguna"
  }
];
