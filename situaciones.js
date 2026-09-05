/* 🧩 LAS SITUACIONES DE ROBERTO — LA ÚNICA FUENTE DE VERDAD
   Rey: "Roberto, su cuerpo, las alertas del indicador y los avisos programados son uno
   solo engranado". Este archivo es ese "uno solo".
   Lo cargan LOS DOS lados, y por eso no pueden contradecirse nunca:
     · la página  → <script src="situaciones.js"> antes de app.js
     · el vigilante que pinta los avisos con la app cerrada → importScripts en sw.js
   Antes había CUATRO listas sueltas (una en app.js, otra en roberto.js, otra dentro del
   resumidor y otra en sw.js) y se contradecían: una operación PERDIDA salía en el teléfono
   con la cara de CELEBRAR, y el "Reset de disciplina" de las 7:55 salía con cara de
   preocupado porque su texto acaba en "Si 2 SL, cierro plataforma".
   ⚠️ SI TOCAS ALGO AQUÍ, LO TOCAS PARA TODO EL SISTEMA A LA VEZ. Eso es lo que se quería. */
/* 🧩 EL ENGRANAJE — UNA SOLA TABLA PARA TODO LO QUE LE PASA AL SISTEMA (v6.81)
   Rey: "Roberto, su cuerpo, las alertas del indicador y los avisos programados son uno
   solo engranado". Antes cada cosa se decidía por su lado y podían contradecirse: una
   operación perdida sacaba cara de CELEBRAR en el teléfono mientras el cuerpo se
   preocupaba. Aquí cada situación tiene UN gesto y UNA frase, y de aquí beben los tres:
     · la cara del aviso del teléfono  (caraAviso)
     · el gesto de su cuerpo           (robEvento)
     · lo que dice su nubecita         (robFraseCorta)
   ORDEN: de lo más grave a lo más rutinario, porque un aviso puede encajar en varias y
   manda la primera. Lo primero es la CUENTA (puede costarle la cuenta entera), luego lo
   que está roto, luego lo que le frena, y al final lo que le pide acción.
   ⚠️ Y NO SE CLASIFICA POR EL COLOR DEL EMOJI: Rey usa el 🔴 para todo lo rojo, así que
   tomarlo por "pérdida" disfrazaba el aviso más grave del más común. Mandan las PALABRAS. */
const ROB_SITUA = [
  /* 🗣️ v7.17 — QUE LE HABLE A ÉL, NO QUE LE PONGA UNA ETIQUETA.
     Rey (03-09): "debe referirse a mí, como: Rey no entres en Londres todavía no hay setup,
     o Rey ya puedes bajar a 5m a esperar la confirmación, o Rey el día se viró, o Rey hubo
     MSS en 15m mira el gráfico… esos mensajes son los que quiero, no esos genéricos como el
     que me puso: (no entres en GBP/USD), solo eso, ni sé a quién se refiere ni por qué".
     TENÍA RAZÓN: esto eran ETIQUETAS, no mensajes. Servían para leerlas de un vistazo en
     una nubecita, pero desde que Roberto las DICE EN VOZ ALTA —y Rey las oye haciendo
     ejercicio, con el teléfono en el bolsillo— tienen que sostenerse solas: a quién le
     habla, qué pasó, y qué hacer ahora.
     LAS TRES REGLAS: (1) empiezan por su NOMBRE, que es lo que hace que levante la cabeza;
     (2) dicen QUÉ pasó con su par y su temporalidad, no una categoría; (3) acaban en algo
     que PUEDE HACER ("ve para el gráfico", "baja a 5m", "todavía no entres").
     Siguen siendo cortas: se oyen en tres segundos y caben en la nubecita. */
  { id:"limite",   gesto:"serio",
    re:/límite|limite|drawdown|\bdd\b|peligro/,
    di:()=>"Rey, tu cuenta está cerca del límite. Para hoy y protégela." },

  { id:"roto",     gesto:"apenado",
    re:/no puedo arrancar|no responde|no arranca|ca[íi]d[oa]|se cayó|sin conexión|desconect/,
    di:(d)=>(/ejecutor/.test(d.b) ? "Rey, el Ejecutor no arranca. No va a tomar ninguna entrada hasta que lo mires."
           : /puente/.test(d.b)   ? "Rey, se cayó el Puente. Me quedé sin ver tu gráfico."
           : "Rey, algo del sistema se cayó. Échale un ojo cuando puedas.") },

  { id:"perdida",  gesto:"apenado",
    re:/señal perdida|⚰️|sin recoger|no la recogió/,
    di:(d)=>"Rey, hubo una señal" + (d.par ? " en " + d.par : "") + " y el Ejecutor no llegó a recogerla." },

  { id:"veto",     gesto:"frena",
    re:/no entres|no entrar|veto|vetó|rechaz|abstén/,
    di:(d)=>"Rey, no entres" + (d.par ? " en " + d.par : "") + " todavía: aún no hay setup." },

  { id:"cierre_mal", gesto:"preocupa",
    re:/\bsl\b|stop|pérdida|perdida|perdi[óo]/,
    di:(d)=>"Rey, saltó el stop" + (d.par ? " en " + d.par : "") + ". Respira y sigue tu plan." },

  { id:"cierre_ok",  gesto:"celebra",
    re:/\btp\b|ganad|ganancia|cazad|\+\d+(\.\d+)?r/,
    di:(d)=>"Rey, cerramos en ganancia" + (d.par ? " en " + d.par : "") + ". Bien jugado." },

  { id:"confirmada", gesto:"alerta",
    re:/entrada confirmada|confirmad/,
    di:(d)=>"Rey, ya llegó a la zona de confirmación" + (d.par ? " en " + d.par : "") +
            (d.tf ? ". Baja a " + d.tf + " y espera la vela" : ". Ve para el gráfico") + "." },

  { id:"liquidez",   gesto:"alerta",
    re:/liquidez|sweep|barrid/,
    di:(d)=>"Rey, ya barrió la liquidez" + (d.par ? " en " + d.par : "") +
            (d.tf ? " en " + d.tf : "") + ". Mira el gráfico." },

  { id:"reaccion",   gesto:"tiempo",
    re:/zona de reacci[óo]n|reacci[óo]n/,
    di:(d)=>"Rey, el precio va hacia tu zona" + (d.par ? " de " + d.par : "") +
            ". Todavía no entres: espera la reacción" + (d.tf ? " en " + d.tf : "") + "." },

  { id:"estructura", gesto:"vigila",
    re:/\bmss\b|estructura/,
    di:(d)=>"Rey, hubo MSS" + (d.tf ? " en " + d.tf : "") + (d.par ? " en " + d.par : "") +
            ". Mira el gráfico, ya tienes permiso." },

  { id:"ventana",    gesto:"tiempo",
    re:/killzone|kill zone|ventana operativa|pre-ny|londres|ny apertura/,
    di:(d)=>"Rey, se abre tu ventana" + (/londres/.test(d.b) ? " de Londres" : /pre-ny|ny/.test(d.b) ? " de Nueva York" : "") +
            ". Ponte delante del gráfico." },

  { id:"noticia",    gesto:"analiza",
    re:/noticia|calendario|📰/,
    di:()=>"Rey, viene una noticia fuerte. No entres hasta que pase." },

  { id:"posicion",   gesto:"vigila",
    re:/posici[óo]n|vigil|👁/,
    di:(d)=>"Rey, te estoy cuidando la posición" + (d.par ? " de " + d.par : "") + ". Tú tranquilo." },

  { id:"dossier",    gesto:"idea",
    re:/dossier|te propongo|pensadero|💡|idea/,
    di:()=>"Rey, ya tienes tu análisis del día listo. Ábrelo cuando puedas." },

  { id:"saludo",     gesto:"saluda",
    re:/buenos días|buen día|🌅|amanecer/,
    di:()=>"Buenos días, Rey. Vamos a por el día." },

  { id:"ejecutor",   gesto:"audita",
    /* v7.22: el 🤖 suelto ya NO vale — "🤖 No pude leerte esta alarma" hacía decir "el
       Ejecutor acaba de entrar" (el "entró GBP/USD" fantasma del 03-09). Tiene que DECIRLO. */
    re:/auditor[íi]a|expediente|🤖 entré|entré en|acabo de entrar/,
    di:(d)=>"Rey, el Ejecutor acaba de entrar" + (d.par ? " en " + d.par : "") + ". Yo te la vigilo." },

  { id:"felicita",   gesto:"felicita",
    re:/felicidades|bien hecho|bien jugado|👏|así se opera/,
    di:()=>"Así se opera, Rey. Bien jugado." },

  { id:"vialibre",   gesto:"aprueba",
    re:/vía libre|puedes operar|👍/,
    di:(d)=>"Rey, tienes vía libre" + (d.par ? " en " + d.par : "") + ". Cumple tu plan." },

  { id:"descanso",   gesto:"siesta",
    re:/siesta|suspend|😴|hasta mañana/,
    di:()=>"Hasta luego, Rey. Yo sigo de guardia." },

  { id:"giro",       gesto:"sorprende",
    re:/giro|se vir[óo]|cambio de sesgo|invalidad|invalidación/,
    di:(d)=>"Rey, el día se viró" + (d.par ? " en " + d.par : "") + ". Olvídate del sesgo de antes." },

  { id:"alarma",     gesto:"alerta",
    re:/🔔|alarma|se[ñn]al/,
    di:(d)=>"Rey, tienes señal" + (d.par ? " en " + d.par : "") + (d.tf ? " en " + d.tf : "") +
            ". Ve para el gráfico." },
];

/* ══════════════════════════════════════════════════════════════════════════════
   🔔 LAS ALARMAS DEL INDICADOR SE LEEN POR SU SEÑAL, NO POR LA LECTURA — v7.22
   ═════════════════════════════════════════════════════════════════════════════
   Lo que destapó el registro real del 03-09 al pasar los 60 últimos avisos por esta tabla:
   · 12:31 y 15:03 — la alarma era "🟥 GBPUSD | CRT 4H EN CONTRA formándose", pero Roberto
     no llegó a leerla a tiempo y el cuerpo traía "🤖 No pude leerte esta alarma ahora…".
     Ese 🤖 caía en la regla del Ejecutor y el cuerpo le dijo a Rey "el Ejecutor acaba de
     entrar en GBPUSD". NUNCA HUBO ENTRADA. Es el "entró GBP/USD" que Rey vio esa mañana y
     no encontró en MT5: no fue el Ejecutor, fue esta tabla leyendo un emoji suelto.
   · 12:54 — la alarma era "🔄 ¡EL DÍA SE VIRÓ!" y la lectura de Roberto empezaba con
     "🔴 NO ENTRES": el cuerpo dijo "no entres, no hay setup" y el HECHO (el giro) se perdió.
   LA REGLA: el cuerpo de una alarma trae DOS cosas — la lectura de Roberto (su opinión) y la
   señal cruda del indicador (el hecho). La situación la decide EL HECHO, con el texto exacto
   que escribe el indicador v3.8 para cada alarma esencial; la opinión va detrás, en cuatro
   palabras, porque también importa (Rey la lee entera en la notificación).
   ⚠️ NO es "clasificar por el color del emoji": el emoji de cabecera de cada alarma es el
   CÓDIGO del propio indicador (único por tipo, el mismo que usa la nube para decidir cuáles
   notifican) y se confirma con la palabra clave de cada una. */
const ROB_ALARMAS = [
  { id:"entrada",   gesto:"alerta",   re:/^🔔 .*\bENTRADA\b/,
    di:(d)=>"Rey, señal de entrada" + (d.dir ? " " + d.dir : "") + (d.grado ? " " + d.grado : "") + (d.par ? " en " + d.par : "") + (d.tf ? " " + d.tf : "") + ". Ve para el gráfico." },
  { id:"largo",     gesto:"alerta",   re:/^🟢 CRT Elite LARGO/,
    di:(d)=>"Rey, señal en largo" + (d.par ? " en " + d.par : "") + (d.tf ? " " + d.tf : "") + ", con entrada, stop y objetivo. Mira el gráfico." },
  { id:"corto",     gesto:"alerta",   re:/^🔴 CRT Elite CORTO/,
    di:(d)=>"Rey, señal en corto" + (d.par ? " en " + d.par : "") + (d.tf ? " " + d.tf : "") + ", con entrada, stop y objetivo. Mira el gráfico." },
  { id:"premium",   gesto:"alerta",   re:/^⭐ .*PREMIUM/,
    di:(d)=>"Rey, oportunidad premium" + (d.par ? " en " + d.par : "") + ": se liquidó una trampa y reacciona a favor. Revisa la entrada." },
  { id:"giro",      gesto:"sorprende", re:/^🔄 .*VIR[ÓO]/,
    di:(d)=>"Rey, el día se viró" + (d.par ? " en " + d.par : "") + (d.sesgo ? ": nuevo sesgo " + d.sesgo : "") + ". Olvídate del de antes." },
  { id:"estructura", gesto:"vigila",  re:/^2️⃣ .*\bMSS\b/,
    di:(d)=>"Rey, hubo MSS en 15m" + (d.par ? " en " + d.par : "") + ": permiso de Fase 3. Baja a 5m a buscar el gatillo." },
  { id:"fase3",     gesto:"alerta",   re:/^✅ .*FASE 3 COMPLETA/,
    di:(d)=>"Rey, Fase 3 completa" + (d.par ? " en " + d.par : "") + ": sweep, MSS y zona. Ejecuta el gatillo en 5m." },
  { id:"crt_favor", gesto:"vigila",   re:/^🟩 .*CRT 4H/,
    di:(d)=>"Rey, se forma un CRT de 4 horas a favor" + (d.par ? " en " + d.par : "") + ". Baja a 15m o 5m al gatillo." },
  { id:"crt_contra", gesto:"preocupa", re:/^🟥 .*CRT 4H/,
    di:(d)=>"Rey, se forma un CRT de 4 horas EN CONTRA" + (d.par ? " en " + d.par : "") + ". Cuidado con entrar a favor del sesgo." },
  { id:"invalidacion", gesto:"frena", re:/^⛔ .*INVALIDACI[ÓO]N/,
    di:(d)=>"Rey, invalidación rota" + (d.par ? " en " + d.par : "") + (d.tf ? " " + d.tf : "") + ": ese lado del plan está muerto. No lo operes." },
];
/* la opinión de Roberto, en cuatro palabras: es la 1ª línea de su lectura */
const ROB_VEREDICTO = [
  { re:/^🔴 NO ENTRES/, di:" Yo digo: no entres." },
  { re:/^🟡 ESPERA/,    di:" Yo digo: espera." },
  { re:/^🟢 A FAVOR/,   di:" Yo digo: a favor." },
];
/** ¿Es una alarma del indicador? Por su título, que lo pone la nube: "🔔 PAR · TF · Alarma". */
function robEsAlarma(titulo){ return /^🔔 .*· Alarma\s*$/.test(String(titulo||"").trim()); }
/** Separa el cuerpo de una alarma en {senal, veredicto}: la señal cruda del indicador y la
    1ª línea de la lectura de Roberto (si la hubo). El cuerpo es "lectura\n\nseñal", o
    "señal\n\n🤖 No pude leerte…" cuando Roberto no llegó a tiempo. */
function robPartesAlarma(cuerpo){
  const partes = String(cuerpo||"").split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  const esSenal = (p)=>/^(🔔|⭐|🔄|2️⃣|✅|🟩|🟥|⛔|▶️|⏰|📡)/.test(p) || /^(🟢|🔴) CRT Elite/.test(p);
  let senal = partes.find(esSenal) || "";
  if(!senal){ senal = (partes.length && /^🤖/.test(partes[partes.length-1])) ? partes[0] : (partes[partes.length-1] || ""); }
  const primera = (partes[0] || "").split("\n")[0].trim();
  let veredicto = "";
  for(const v of ROB_VEREDICTO){ if(v.re.test(primera)){ veredicto = v.di; break; } }
  return { senal, veredicto };
}
function robAlarma(titulo, cuerpo){
  const { senal, veredicto } = robPartesAlarma(cuerpo);
  const linea = senal.split("\n")[0].trim();
  const par = (String(titulo||"").match(/^🔔 ([A-Z]{6})\b/) || linea.match(/\b([A-Z]{6})\b/) || [])[1] || "";
  const tf  = ((linea.match(/\b(\d+m|\d+h)\b/i) || [])[1] || "").toLowerCase();
  const dirM = senal.match(/ENTRADA (COMPRA|VENTA)/);
  const d = { par, tf,
    dir: dirM ? dirM[1].toLowerCase() : "",
    grado: (senal.match(/ENTRADA (?:COMPRA|VENTA) (A\+|B|C)(?![A-Za-z0-9])/) || [])[1] || "",
    sesgo: /ALCISTA/.test(senal) ? "alcista" : /BAJISTA/.test(senal) ? "bajista" : "" };
  for(const a of ROB_ALARMAS){
    if(a.re.test(linea)) return { id:a.id, gesto:a.gesto, frase: a.di(d) + veredicto };
  }
  return null;   /* una alarma que no está en la tabla: se lee por sus palabras, como antes */
}

/* ══════════════════════════════════════════════════════════════════════════════
   📅 LOS AVISOS DEL SISTEMA SE RECONOCEN POR SU TÍTULO — v7.22
   ═════════════════════════════════════════════════════════════════════════════
   Rey (03-09), con la captura en la mano: el teléfono decía "📅 Noticia cerca · En 40 min:
   ISM Services PMI (USD, 🟠 MEDIO)" y Roberto le dijo "no entres, no hay setup". "El gesto
   estaba bien, pero es una noticia: son cosas diferentes. Debe distinguir las alarmas y los
   avisos con claridad, no mezclarlos ni confundirlos."
   POR QUÉ PASÓ: el cuerpo del aviso dice "…el veto del Ejecutor solo frena las de ALTO…",
   y la palabra "veto" caía en la regla del VETO de la tabla del mercado (que va antes que
   la de noticia). Roberto le puso a una noticia la frase de un setup que no existe.
   LA REGLA: una ALARMA del indicador se entiende por LO QUE PASÓ (sus palabras); un AVISO
   del sistema tiene un TÍTULO FIJO que ya dice qué es, y se reconoce por él ANTES de mirar
   ninguna palabra del cuerpo. El cuerpo solo sirve para sacar los datos (cuántos minutos,
   qué noticia, qué impacto). Y la frase lo dice sin rodeos: "aviso de noticia, no es señal",
   para que Rey sepa de qué clase de cosa le está hablando.
   Aquí van SOLO los avisos del sistema que no traen tipo "rem" (los que sí lo traen ya se
   leen como rutina más abajo, con su propio título). */
const ROB_AVISOS = [
  { id:"noticia_cerca", gesto:"frena",
    re:/^\s*📅|noticia cerca/i,
    lee:(b)=>{
      const m = String(b||"").match(/En (\d+) min: (.+?) \(([A-Z]{3}), (🔴 ALTO|🟠 MEDIO)\)/);
      const min = m ? m[1] : "", que = m ? m[2].trim() : "";
      const alto = m ? /ALTO/.test(m[4]) : /ALTO/.test(String(b||""));
      return { frase: "Rey, aviso de noticia, no es señal: " + (min ? "en " + min + " minutos" : "pronto")
             + " sale " + (que || "una noticia") + ", impacto " + (alto ? "alto. Sin operar hasta que pase." : "medio. Si entras a mano, ojo.") };
    } },
  /* los demás avisos fijos de la nube que el registro real del 03-09 enseñó leídos con
     reglas del mercado ("🤖 Cierre del día" → "el Ejecutor acaba de entrar"; el 🌅 →
     "tu análisis está listo"). Cada uno dice lo que ES. */
  { id:"buenos_dias",  gesto:"saluda",  re:/^🌅/,
    lee:()=>({ frase:"Buenos días, Rey. Tu día ya está preparado: ábreme cuando quieras." }) },
  { id:"analisis_dia", gesto:"tiempo",  re:/^📆 Análisis del día/,
    lee:(b)=>({ frase:"Rey, aviso: se acerca " + (/Pre-NY/i.test(b) ? "tu ventana Pre-NY" : "Londres") + ". Enciende la PC y toca el aviso, y te hago el análisis del día." }) },
  { id:"analisis_sem", gesto:"tiempo",  re:/^🗓️ Análisis semanal/,
    lee:()=>({ frase:"Rey, aviso: el mercado abre pronto. Enciende la PC y toca el aviso, y te hago el análisis semanal." }) },
  { id:"noche",        gesto:"carino",  re:/^🌙/,
    lee:()=>({ frase:"Rey, cierra el día conmigo cuando puedas: cómo te fue y el foco de mañana." }) },
  { id:"cierre_ejec",  gesto:"audita",  re:/^🤖 Cierre (del día|de semana)/,
    lee:(b)=>({ frase:"Rey, el Ejecutor cerró su " + (/semana/i.test(b) ? "semana" : "día") + ". Ábreme y te lo cuento." }) },
  /* 🤖 lo que el Ejecutor hace de verdad, por su título (v7.22): su "ENTRÉ" lleva "SL" y
     "TP" en el cuerpo y las reglas del mercado decían "saltó el stop" a una ENTRADA. Y el
     "CERRÉ" ya trae en el título CÓMO cerró — ✅ TP, ❌ SL o ✋ a mano — que son palabras,
     no colores. */
  /* 💬 su propia respuesta del chat (v7.22): el registro real del 03-09 la enseñó leída con
     reglas del mercado — "Quedó grabado, sábado 5:30 PM…" salía como "cerramos en ganancia"
     y una auditoría como "se abre tu ventana de Londres". Lo que dijo Roberto se enseña
     TAL CUAL (sus primeras palabras), nunca se reinterpreta. */
  { id:"cambio",       gesto:"idea",    re:/^💬 Roberto te respondió/,
    lee:(b)=>/^Roberto quiere hacer un cambio/.test(String(b||"").trim()) ? { frase:"Rey, quiero hacer un cambio: ábreme y me lo confirmas." } : null },
  { id:"respuesta",    gesto:"presenta", re:/^💬 Roberto te respondió/,
    lee:(b)=>{
      const txt = String(b||"").replace(/\*\*|__|^#+\s*/gm, "").replace(/\s+/g, " ").trim();
      if (!txt) return null;
      const cab = "Rey, te respondí: ";
      const cabe = 140 - cab.length;
      return { frase: cab + (txt.length > cabe ? txt.slice(0, cabe - 1).replace(/\s+\S*$/, "") + "…" : txt) };
    } },
  /* 💼 sus cuentas en peligro (v7.22): el aviso que la nube manda al abrir cada ventana si
     una cuenta suya va justa de margen. Por título dice de QUÉ cuenta habla y cuánto le
     queda; la regla del mercado decía "para hoy" cuando el aviso solo pedía tenerlo presente. */
  { id:"cuenta_peligro", gesto:"vigila", re:/^🔔 .+ en peligro$/,
    lee:(b,t)=>{
      const alias = (String(t||"").match(/^🔔 (.+) en peligro$/) || [])[1] || "tu cuenta";
      const margen = (String(b||"").match(/margen (.+?)\.(?:\s|$)/) || [])[1] || "";
      return { frase:"Rey, aviso de tu cuenta " + alias + ": va justa de margen" + (margen ? " (" + margen + ")" : "") + ". Tenlo presente si operas hoy." };
    } },
  { id:"cuenta_limite", gesto:"frena", re:/^🔴 .+ AL LÍMITE$/,
    lee:(b,t)=>{
      const alias = (String(t||"").match(/^🔴 (.+) AL LÍMITE$/) || [])[1] || "tu cuenta";
      return { frase:"Rey, tu cuenta " + alias + " está al límite: hoy no se opera en ella. Protégela." };
    } },
  { id:"ejec_entro",   gesto:"audita",  re:/^🤖 ENTRÉ/,
    lee:(b,t)=>{
      const m = String(t||"").match(/^🤖 ENTRÉ · (COMPRA|VENTA) ([A-Z]{6})/);
      const lote = (String(b||"").match(/Lote ([\d.]+)/) || [])[1];
      return { frase:"Rey, el Ejecutor entró" + (m ? " en " + m[1].toLowerCase() + " en " + m[2] : "") + (lote ? ", lote " + lote : "") + ". Yo te la vigilo." };
    } },
  { id:"ejec_cerro",   gesto:"audita",
    re:/^🤖 CERRÉ/,
    lee:(b,t)=>{
      const tit = String(t||""), cuerpo = String(b||"");
      const par = (tit.match(/^🤖 CERRÉ · ([A-Z]{6})/) || [])[1] || "";
      /* primero las PALABRAS del título (TP / SL); si cerró a mano, el signo o la palabra del cuerpo */
      const gano = /\bTP\b/.test(tit) ? true : /\bSL\b/.test(tit) ? false
                 : (/\+\$|gan[óo]|ganancia/i.test(cuerpo) && !/[−-]\$|perd/i.test(cuerpo));
      let pl = (cuerpo.match(/^[^\n]*?([+−-]?\$[\d.]+)/) || [])[1] || "";
      if (pl && !/^[+−-]/.test(pl)) pl = (gano ? "+" : "−") + pl;
      const como = /\bTP\b/.test(tit) ? "en objetivo" : /\bSL\b/.test(tit) ? "en stop" : "a mano";
      return { gesto: gano ? "celebra" : "preocupa",
               frase:"Rey, el Ejecutor cerró" + (par ? " " + par : "") + " " + como + (pl ? ": " + pl : "") + (gano ? ". Bien jugado." : ". Respira y sigue tu plan.") };
    } },

  /* 🎓 v7.32 — LOS AVISOS DE LO QUE ROBERTO APRENDE. Rey (04-09, con la captura de las
     8:01 en la mano): "en una de estas alarmas Roberto me dijo NO ENTRES TODAVÍA, AÚN NO
     HAY SETUP; eso está fuera de hora, fuera de lugar y fuera de todo".
     TENÍA RAZÓN Y SE REPRODUJO EJECUTANDO SU CÓDIGO: el aviso "🎓 Aprendí solo de hoy" dice
     en su texto "mi VETO de mañana ya las lleva dentro" — y esa palabra suelta lo mandaba
     derecho a la regla del veto del mercado. O sea que un aviso que hablaba de APRENDIZAJE
     le contestaba con una orden de trading a las 8 de la mañana, sin gráfico y sin señal.
     ES EXACTAMENTE EL MISMO FALLO DEL 03-09 (la "noticia cerca" que caía en el veto por
     decir "veto") en otro aviso que se quedó fuera de la tabla. Se cierra por donde se
     cerró aquel: cada aviso del sistema se reconoce por SU TÍTULO y dice lo que ES. */
  { id:"aprendi_hoy",  gesto:"idea", re:/aprend[íi] solo/i,
    lee:(b)=>{ const m = String(b||"").match(/(\d+) lecci/);
      return { frase:"Rey, aprendí " + (m ? m[1] + (m[1] === "1" ? " lección" : " lecciones") : "algo")
             + " de las operaciones de hoy. Tócame y te las cuento." }; } },
  { id:"aprendi_sem",  gesto:"idea", re:/esto aprend[íi] de ti/i,
    lee:()=>({ frase:"Rey, esto es lo que aprendí de ti esta semana. Ábreme y lo repasamos." }) },
  { id:"repaso_lecc",  gesto:"presenta", re:/repaso de tus lecciones/i,
    lee:()=>({ frase:"Rey, te traigo una lección tuya de hace días, para que no se te olvide." }) },
  { id:"gimnasio",     gesto:"tetoca", re:/gimnasio/i,
    lee:()=>({ frase:"Rey, es fin de semana: toca entrenar. Ábreme y hacemos backtesting." }) },
  { id:"revision_sis", gesto:"audita", re:/revisi[óo]n del sistema/i,
    lee:()=>({ frase:"Rey, revisemos juntos cómo va todo: tu operativa, el Ejecutor y Apex." }) },
  { id:"pendientes",   gesto:"tetoca", re:/cosas pendientes/i,
    lee:()=>({ frase:"Rey, tienes cosas pendientes esperándote. Ábreme y las vemos." }) },
  { id:"entrada_det",  gesto:"analiza", re:/entrada detectada/i,
    lee:(b)=>{ const par = (String(b||"").match(/\b([A-Z]{6})\b/) || [])[1] || "";
      return { frase:"Rey, detecté tu entrada" + (par ? " en " + par : "") + ". Ábreme y la registro en tu diario." }; } },
  { id:"mercado_abre", gesto:"tiempo", re:/mercado abierto/i,
    lee:()=>({ frase:"Rey, abrió el mercado. Arranca la semana: si no hiciste el análisis semanal, ahora." }) },
];

/* ⏰ LOS AVISOS QUE REY SE PROGRAMA A SÍ MISMO (v6.82)
   Un aviso suyo NO es un hecho del mercado: es su rutina. Leerlo con las reglas del
   mercado hacía cosas feas — su "🧭 Reset de disciplina" de las 7:55 acababa en
   "Si 2 SL, cierro plataforma", y ese "SL" hacía que Roberto se preocupara y le dijera
   "SALTÓ EL STOP" sin que hubiera pasado nada. Un susto a primera hora, de la nada.
   Aquí solo se elige el GESTO. Lo que dice la nubecita es SU PROPIO TÍTULO, que él ya
   escribió corto y claro; así Roberto nunca le pone en la boca algo que él no puso.
   Se mira su TÍTULO primero (es la etiqueta que él eligió) y el mensaje después. */
const ROB_RUTINA = [
  /* algo se cayó o se desconectó (el "🤖 Ejecutor CAÍDO" llega con tipo rem): preocupado, no con el reloj */
  { re:/ca[íi]do|desconect|no s[ée] nada/, gesto:"preocupa" },
  /* algo se cierra o se acaba: se pone serio */
  { re:/cerrada|se acab|almuerzo|no m[áa]s entradas|fin de (la )?sesi|descanso/, gesto:"serio" },
  /* le manda hacer algo A ÉL: se lo señala con el dedo */
  { re:/reset|corre[rn]?|revisa|repasa|anota|cierra|cerrar|prepar|calcul|actualiza|no abras|h[aá]zlo/, gesto:"tetoca" },
  /* algo se abre o falta poco: saca el reloj */
  { re:/abierta|abre|activa|apertura|open|en \d+ ?min|empieza|arranca/, gesto:"tiempo" },
];

/* Las caras que EXISTEN como foto en caras/. El aviso del teléfono solo puede enseñar
   estas; si la situación pide un gesto que aún no tiene foto, sale la de presentarse.
   (El banco compara esta lista con la carpeta de verdad: si algún día se dibuja una cara
   nueva y no se apunta aquí, el banco lo canta.) */
/* 🖼️ v7.17 — entra "sorprende", que la pide la situación nueva del GIRO DEL DIA.
   Sin su foto, ese aviso saldría en el teléfono con la cara de otro — y el banco lo cazó
   antes de que Rey lo viera. La foto se dibuja del MISMO roberto.js con hacer-caras.cjs. */
const CARAS_HAY = ["alerta","analiza","apenado","aprueba","audita","carino","celebra","sorprende",
  "felicita","frena","idea","preocupa","presenta","saluda","serio","siesta","tetoca","tiempo","vigila"];

/* La lectura del aviso: qué situación es, con su gesto y su frase. UNA sola vez, y de
   aquí salen los tres (cara, cuerpo y nubecita) — por eso no pueden contradecirse. */
function robSitua(titulo, cuerpo, tipo){
  /* ⏰ v6.82 — SI ES UN AVISO DE SU RUTINA, se lee como lo que es. Antes entraba por las
     reglas del mercado y su "Reset de disciplina" salía como "saltó el stop". */
  if(String(tipo||"")==="rem"){
    const tit = String(titulo||"").replace(/^[^\wÁÉÍÓÚÑáéíóúñ]+/,"").trim();
    const bt = tit.toLowerCase(), bc = String(cuerpo||"").toLowerCase();
    let g = "tiempo";                                  /* por defecto: es un aviso a su hora */
    for(const r of ROB_RUTINA){ if(r.re.test(bt)){ g = r.gesto; break; } }
    if(g === "tiempo") for(const r of ROB_RUTINA){ if(r.re.test(bc)){ g = r.gesto; break; } }
    /* en la nubecita, SU título: él ya lo escribió corto y para leerlo de un vistazo */
    /* 🗣️ v7.25 — QUIEN SE LO DICE ES ROBERTO (Rey: "recuerda que es Roberto diciéndome,
       no otra IA"), pero la nubecita lleva SU TÍTULO TAL CUAL: eso ya lo decidió Rey en la
       v6.82 y lo guarda el banco test-rutina682 — él lo escribió corto para leerlo de un
       vistazo, y ponerle nada delante solo le roba sitio. Lo que hace que sea Roberto y no
       "otra IA" es que lo dice con SU voz, SU cara y SU gesto, no un cartel del sistema. */
    return { id:"rutina", gesto:g, frase: tit.slice(0,64) || "tienes un aviso" };
  }
  /* 📅 v7.22 — un AVISO del sistema se reconoce por su título, antes de leer ninguna
     palabra del cuerpo (la "noticia cerca" caía en la regla del veto por decir "veto") */
  const tit0 = String(titulo||"");
  for(const a of ROB_AVISOS){
    if(a.re.test(tit0)){ const r = a.lee(cuerpo, tit0); if(r && r.frase) return { id:a.id, gesto:r.gesto||a.gesto, frase:r.frase }; }
  }
  /* 🔔 v7.22 — una ALARMA del indicador se lee por su SEÑAL (el hecho), no por la lectura */
  if(robEsAlarma(titulo)){ const r = robAlarma(titulo, cuerpo); if(r) return r; }
  /* 🚧 v7.32 — EL CORTAFUEGOS. Las reglas de abajo son las del MERCADO: dicen "no entres",
     "saltó el stop", "tienes señal". Solo pueden hablar de algo que venga del gráfico o del
     Ejecutor. Un aviso de CHARLA (kind "chat": lo que Roberto aprendió, una lección suya, su
     repaso) NO es un hecho del mercado, y si no está en la tabla de arriba no puede acabar
     contestado con una orden de trading — que es justo lo que Rey vio a las 8:01 de la
     mañana con el "🎓 Aprendí solo de hoy".
     Van dos fallos iguales por la misma puerta (el 03-09 con la noticia, hoy con el 🎓), así
     que aquí se cierra la puerta y no solo se tapa el agujero: si mañana la nube manda un
     aviso de charla nuevo que nadie metió en la tabla, lo peor que puede pasar es que
     Roberto diga su título — nunca que se invente una orden de entrar o de no entrar. */
  if(String(tipo||"") === "chat"){
    const tc = String(titulo||"").replace(/^[^\wÁÉÍÓÚÑáéíóúñ]+/,"").trim();
    if(tc) return { id:"charla", gesto:"presenta", frase: tc.slice(0,64) };
  }
  const t = (String(titulo||"") + " " + String(cuerpo||"")).replace(/\s+/g," ").trim();
  const d = { b: t.toLowerCase(),
    par: (t.match(/\b(EURUSD|GBPUSD|XAUUSD|USDJPY|[A-Z]{6})\b/) || [])[1] || "",
    tf : ((t.match(/\b(1m|5m|15m|30m|1h|4h|d1|w1|diario|semanal)\b/i) || [])[1] || "").toLowerCase() };
  for(const s of ROB_SITUA) if(s.re.test(d.b)) return { id:s.id, gesto:s.gesto, frase:s.di(d) };
  /* situación que aún no está en la tabla: se le pone la primera frase del aviso, corta,
     y el gesto lo adivina él por el texto (nunca se queda sin reaccionar) */
  const primera = String(cuerpo||titulo||"").split(/[.\n]/).find(x=>x.trim().length>3) || String(titulo||"");
  let g = "presenta";
  try{ if(typeof Roberto!=="undefined") g = Roberto.gestoDe(t); }catch(_){}
  return { id:"", gesto:g, frase: primera.trim().replace(/^[^\wÁÉÍÓÚÑáéíóúñ]+/,"").slice(0,64) };
}

/* La cara del aviso: el nombre del png ES el nombre del gesto, así que la notificación del
   teléfono enseña exactamente lo que hace su cuerpo en pantalla. */
function robCaraDe(titulo, cuerpo, tipo){
  const g = robSitua(titulo, cuerpo, tipo).gesto;
  return "caras/rob-" + (CARAS_HAY.indexOf(g) >= 0 ? g : "presenta") + ".png";
}
/* se cuelga de donde toque: la página (window) o el vigilante (self) */
(function(raiz){
  raiz.ROB_SITUA = ROB_SITUA; raiz.ROB_AVISOS = ROB_AVISOS; raiz.ROB_ALARMAS = ROB_ALARMAS; raiz.robAlarma = robAlarma; raiz.robEsAlarma = robEsAlarma; raiz.ROB_RUTINA = ROB_RUTINA; raiz.CARAS_HAY = CARAS_HAY;
  raiz.robSitua = robSitua;   raiz.robCaraDe = robCaraDe;
})(typeof self !== "undefined" ? self : this);

/* ══════════════════════════════════════════════════════════════════════════════
   🎭 SU VIDA DE FONDO — los gestos y frases de entre tarea y tarea
   ═════════════════════════════════════════════════════════════════════════════
   Esto vivía SOLO en app.js, y por eso el Roberto que flota encima de las otras
   aplicaciones se quedaba quieto: tenía el mismo cuerpo y los mismos 36 gestos,
   pero no tenía de dónde sacar QUÉ hacer cuando no pasa nada.
   Rey lo dejó por ley (02-09): "las funciones de él con su cuerpo deben ser las
   mismas esté donde esté… así, esté donde esté, no me pierdo ninguna señal ni
   gesto, ni su nubecita diciéndome las frases cortas".
   Se muda aquí, que es la fuente que YA comparten la app, el vigilante y ahora
   la burbuja. No se copia: se MUEVE. Copiarla sería repetir la enfermedad de las
   cuatro tablas de caras del 01-09.
   ═════════════════════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════════════════════
   🕐 LA FRANJA DEL DÍA — v7.27: UNA SOLA, PARA LA APP Y PARA SU CUERPO FLOTANTE
   ═════════════════════════════════════════════════════════════════════════════
   Rey (04-09, con foto): "el tiene que saber los horarios y decirme las cosas según
   correspondan, no a las 4pm que me pone de madrugada… y a esta hora ese mensaje de que
   Londres se acerca". TENÍA RAZÓN Y ERA UN FALLO GORDO: la franja se decidía así —
       if (h >= 60 && h < 780) return "espera";   // 1:00–13:00 NY
       return "madrugada";                        // ← TODO LO DEMÁS
   O sea que las 4 de la tarde, las 6 y las 9 de la noche eran "madrugada" y le salían
   frases de Londres y del spread nocturno a plena luz del día.
   Y había OTRO problema debajo: la app y la burbuja calculaban la franja cada una por su
   lado (la app con la hora local y el día UTC, la burbuja con Nueva York), así que podían
   contradecirse. Ahora la franja se decide AQUÍ y beben las dos.

   LAS FRANJAS, con la hora de Nueva York (que es la que manda en su operativa):
     finde      · sábado y domingo
     madrugada  · 0:00–2:00  (1:00–3:00 en su hora) — si está levantado, se le acompaña
     londres    · 2:00–7:00  — abre Londres, el spread se abre, café
     cerca      · 7:00–7:30  — media hora antes de su killzone
     killzone   · 7:30–9:30  — SU ventana, la buena
     nyactiva   · 9:30–11:30 — Nueva York abierta
     cierre     · 11:30–13:00 — se acaba su ventana operativa (13:00 NY)
     tarde      · 13:00–18:00 — MERCADO CERRADO PARA ÉL: aquí manda el crecimiento
     noche      · 18:00–24:00 — descanso, balance del día, abundancia
   Rey (04-09): "después que cierra el horario operativo, solo los mensajes programados y
   las alertas; prefiero consejos, mensajes de abundancia, riquezas, crecimiento personal".
   Por eso de 13:00 NY en adelante NO se habla del mercado en su vida de fondo. */
function robFranja(opts) {
  try {
    var o = opts || {};
    if (o.posicion) return "posicion";          /* dinero corriendo: manda sobre la hora */
    var f = new Date();
    var ny = new Date(f.toLocaleString("en-US", { timeZone: "America/New_York" }));
    var d = ny.getDay(), h = ny.getHours() * 60 + ny.getMinutes();
    if (d === 0 || d === 6) return "finde";
    if (o.killzone) return "killzone";          /* lo que sepa la app manda sobre el reloj */
    if (o.faltanKz != null && o.faltanKz <= 30) return "cerca";
    if (h < 120) return "madrugada";            /* 0:00–2:00 */
    if (h < 420) return "londres";              /* 2:00–7:00 */
    if (h < 450) return "cerca";                /* 7:00–7:30 */
    if (h < 570) return "killzone";             /* 7:30–9:30 */
    if (h < 690) return "nyactiva";             /* 9:30–11:30 */
    if (h < 780) return "cierre";               /* 11:30–13:00 */
    if (h < 1080) return "tarde";               /* 13:00–18:00 */
    return "noche";                             /* 18:00–24:00 */
  } catch (_) { return "espera"; }
}

/* 🎲 LA BOLSA DE FRASES — para que no repita.
   Rey (04-09): "son los únicos mensajes y repetidos todo el tiempo, no me gusta eso, cada
   1 minuto repite los mismos". Antes se elegía al azar puro: con 6 frases en el paquete,
   la misma salía cada tres o cuatro veces. Ahora funciona como una baraja: se van sacando
   sin repetir hasta que se acaban, y entonces se baraja de nuevo. */
var _bolsas = {};
function robFraseDe(franja, lista) {
  try {
    if (!lista || !lista.length) return "";
    var b = _bolsas[franja];
    if (!b || !b.length) { b = lista.slice(); _bolsas[franja] = b; }
    var i = Math.floor(Math.random() * b.length);
    var frase = b[i];
    b.splice(i, 1);
    return frase;
  } catch (_) { return lista && lista[0] || ""; }
}

const ROB_VIDA = {
  killzone: {
    gestos: ["shhh", "vigila", "apunta", "tiempo", "animo", "serio", "analiza", "ensena", "tetoca", "aprueba", "idea", "olfatea"],
    frases: ["Ventana abierta. Ojo al gráfico.", "Aquí es donde se gana. Paciencia.",
             "Nada de forzar: que venga ella.", "Estoy mirando contigo.",
             "Sweep, MSS, zona. En ese orden.", "Si dudas, no entras. Así de simple."],
  },
  cerca: {
    gestos: ["tiempo", "animo", "apunta", "presumido", "ensena", "idea", "saluda", "aprueba", "analiza", "tetoca"],
    frases: ["Ya casi. Prepara el checklist.", "Se acerca la buena.",
             "Repasa tu riesgo antes de que abra.", "Calienta motores.",
             "Mira tus niveles ahora, no después.", "Yo ya estoy listo. ¿Y tú?"],
  },
  posicion: {
    gestos: ["vigila", "serio", "tiempo", "ojala", "shhh", "animo", "aprueba"],
    frases: ["No la toques. Déjala trabajar.", "La estoy vigilando yo.", "Respira. Va sola.",
             "Ni la mires cada minuto, que se te hace larga."],
  },
  espera: {
    gestos: ["espera", "confundido", "guino", "orgulloso", "carino", "ojala", "burla", "presumido",
             "animo", "sorprende", "idea", "analiza", "presenta", "tetoca", "ensena", "lengua", "aprueba", "huele", "olfatea"],
    frases: ["Aquí sigo, sin señales todavía.", "Aburrido pero despierto. 😌",
             "Con ganas de que abra la próxima.", "Ni una señal… así se ganan las cuentas.",
             "Descansa tú, que yo vigilo.", "Esto está más quieto que un lunes de agosto.",
             "¿Hacemos backtesting mientras esperamos?", "Si aparece algo, te aviso yo. Tranquilo.",
             "Llevo un rato sin trabajo. Me aburro. 🙄", "Paciencia hoy, dinero mañana.",
             "¿Has comido algo? Yo aquí, a base de gráficos. 😄",
             "Estírate un poco, que llevas rato sentado.",
             "Bebe agua, jefe. El cerebro opera mejor hidratado.",
             "Si te agobias, cierra la pantalla diez minutos. Yo vigilo.",
             "Un día tranquilo también es un buen día.",
             "Oye… ¿me estás mirando? 👀", "Aquí, oliendo el mercado. 👃"],
  },
  finde: {
    gestos: ["carino", "guino", "orgulloso", "carcajada", "lengua", "presumido", "chocalas",
             "saluda", "presenta", "felicita", "animo", "idea", "huele"],
    frases: ["Fin de semana: el mercado descansa, tú también.",
             "Buen momento para backtesting… o para no hacer nada. 😄",
             "Aquí estaré el lunes, fresquito.",
             "Revisa tu diario de la semana: se aprende más ahí que en el gráfico.",
             "Yo descansando, pero con un ojo abierto. 😉",
             "El descanso también es parte del oficio, Rey.",
             "Los lunes se ganan los domingos, preparando.",
             "Hoy no hay gráfico. Hoy hay vida."],
    /* 🗣️ las que DICE en voz alta (ver ROB_DICHAS) */
    dichas: ["Rey, la cuenta crece cuando el que la maneja crece. Y tú estás creciendo.",
             "El dinero llega donde hay orden. Tú ya tienes el orden.",
             "Descansa sin culpa: el que descansa decide mejor, y el que decide mejor gana más.",
             "Lo que estás construyendo no se mide en un mes. Se mide en años, y vas bien.",
             "La abundancia no es tener más, es no tener miedo. Y cada día tienes menos."],
  },
  madrugada: {
    gestos: ["ojala", "espera", "animo", "tiempo", "carino", "orgulloso", "idea", "aprueba", "shhh"],
    frases: ["De madrugada y aquí estás. Eso es oficio.",
             "Yo no me duermo, tranquilo.",
             "A esta hora hay poca gente y mucho ruido. Ojo.",
             "Si vas a estar, que sea con cabeza. Si no, a dormir.",
             "El mercado no se va a acabar esta noche, Rey.",
             "Duerme tú, que yo vigilo."],
    dichas: ["Rey, el descanso es parte del plan. Mañana decides mejor.",
             "Nadie se hizo rico quitándose el sueño una noche. Se hace con constancia."],
  },
  londres: {
    gestos: ["tiempo", "animo", "apunta", "ensena", "idea", "saluda", "analiza", "vigila", "aprueba", "olfatea"],
    frases: ["Londres abre. El día empieza de verdad.",
             "Café y cabeza fría: entra la sesión europea.",
             "A esta hora el spread se abre. Ojo con entrar a lo loco.",
             "Sesión de Londres: hay movimiento, no todo es señal.",
             "Repasa tus niveles antes de que esto coja velocidad.",
             "El primer impulso engaña. Espera la confirmación.",
             "Aquí estoy, leyendo el arranque contigo."],
  },
  cerca: {
    gestos: ["tiempo", "animo", "apunta", "presumido", "ensena", "idea", "saluda", "aprueba", "analiza", "tetoca"],
    frases: ["Ya casi. Prepara el checklist.", "Se acerca la buena.",
             "Repasa tu riesgo antes de que abra.", "Calienta motores.",
             "Mira tus niveles ahora, no después.", "Yo ya estoy listo. ¿Y tú?",
             "Media hora para tu ventana. Respira y enfócate."],
  },
  killzone: {
    gestos: ["shhh", "vigila", "apunta", "tiempo", "animo", "serio", "analiza", "ensena", "tetoca", "aprueba", "idea", "olfatea"],
    frases: ["Ventana abierta. Ojo al gráfico.", "Aquí es donde se gana. Paciencia.",
             "Nada de forzar: que venga ella.", "Estoy mirando contigo.",
             "Sweep, MSS, zona. En ese orden.", "Si dudas, no entras. Así de simple.",
             "Tu mejor ventana del día. No la gastes en una señal fea.",
             "Una buena vale más que tres regulares."],
  },
  nyactiva: {
    gestos: ["vigila", "analiza", "tiempo", "serio", "apunta", "ensena", "animo", "shhh", "aprueba"],
    frases: ["Nueva York abierta: aquí se mueve el dinero grande.",
             "Con NY dentro, los barridos son más limpios… y más caros.",
             "Ya estamos en la segunda parte del día. Cabeza.",
             "Si ya operaste tu A+, hoy cumpliste. No busques más.",
             "Esta hora premia al que espera, no al que persigue."],
  },
  cierre: {
    gestos: ["tiempo", "serio", "apunta", "aprueba", "analiza", "carino", "orgulloso"],
    frases: ["Se acaba tu ventana operativa. Vamos cerrando.",
             "Última media hora: gestión, no entradas nuevas.",
             "Lo que no entró hoy, entra mañana. Hay más días.",
             "Apunta lo que viste hoy, aunque no operaras.",
             "Cerramos con orden, que es como se gana a largo."],
  },
  tarde: {
    gestos: ["carino", "orgulloso", "idea", "animo", "presenta", "guino", "ensena", "aprueba",
             "felicita", "presumido", "chocalas", "huele", "sorprende", "analiza"],
    frases: ["Mercado cerrado para ti. Ahora toca vivir.",
             "El día operativo terminó. Lo demás es tuyo.",
             "¿Y si dedicas media hora a estudiar algo que te haga mejor?",
             "Repasa tu diario de operaciones: ahí está lo que de verdad te hace ganar.",
             "Ya no hay gráfico que valga. Hoy cumpliste."],
    dichas: ["Rey, el dinero es consecuencia. Ocúpate de la causa y él viene solo.",
             "La riqueza empieza cuando dejas de perseguirla y empiezas a construirla.",
             "Cada día que respetas tus reglas te haces más rico, aunque el día cierre en cero.",
             "Tu mayor activo no es la cuenta: eres tú. Inviértete.",
             "Los que ganan de verdad no operan más: operan mejor y esperan más.",
             "El que aguanta sin romper sus reglas ya está por delante del 90%.",
             "No te compares con quien lleva veinte años. Compárate con el Rey de hace un año.",
             "Abundancia es tener opciones. Cada regla que cumples te da una más.",
             "Lo que haces cuando el mercado está cerrado decide lo que ganas cuando abre.",
             "Rey, tu disciplina de hoy es el dinero de dentro de un año.",
             "El talento sin proceso se gasta. El proceso sin talento llega igual.",
             "No necesitas un día perfecto. Necesitas muchos días iguales.",
             "El que se hace rico rápido casi siempre se hace pobre rápido. Tú vas por el camino largo, que es el que llega."],
  },
  noche: {
    /* ⚠️ NADA de "siesta" aquí: ley sellada de Rey (31-08) — "él NO puede estar durmiendo
       en mi pantalla". De noche está despierto y cómodo, nunca dormido. Lo cacé con el
       banco test-vida675 al añadir esta franja. */
    gestos: ["carino", "orgulloso", "serio", "aprueba", "animo", "idea", "presenta", "guino", "felicita", "tiempo"],
    frases: ["Se acabó el día. Balance y a descansar.",
             "¿Anotaste lo de hoy? Mañana lo agradeces.",
             "Mañana hay otra ventana. Hoy ya está.",
             "Cierra la pantalla, Rey. El gráfico seguirá ahí.",
             "Yo me quedo de guardia. Tú descansa."],
    dichas: ["Rey, hoy hiciste tu parte. Mañana se sigue.",
             "El sueño también es gestión de riesgo: sin descanso se opera peor.",
             "Lo que sembraste hoy no se ve hoy. Se ve dentro de un año.",
             "Cierra el día en paz: la cuenta se construye con calma, no con prisa.",
             "Un día menos para llegar. Eso es todo lo que hace falta hoy.",
             "La abundancia no llega de golpe: se acumula en días como este."],
  },
  posicion: {
    gestos: ["vigila", "serio", "tiempo", "ojala", "shhh", "animo", "aprueba"],
    frases: ["No la toques. Déjala trabajar.", "La estoy vigilando yo.", "Respira. Va sola.",
             "Ni la mires cada minuto, que se te hace larga.",
             "Ya hiciste lo difícil: entrar bien. Ahora, quieto."],
  },
  espera: {
    gestos: ["espera", "confundido", "guino", "orgulloso", "carino", "ojala", "burla", "presumido",
             "animo", "sorprende", "idea", "analiza", "presenta", "tetoca", "ensena", "lengua", "aprueba", "huele", "olfatea"],
    frases: ["Aquí sigo, sin señales todavía.", "Aburrido pero despierto. 😌",
             "Con ganas de que abra la próxima.", "Ni una señal… así se ganan las cuentas.",
             "Descansa tú, que yo vigilo.", "Esto está más quieto que un lunes de agosto.",
             "¿Hacemos backtesting mientras esperamos?", "Si aparece algo, te aviso yo. Tranquilo.",
             "Llevo un rato sin trabajo. Me aburro. 🙄", "Paciencia hoy, dinero mañana.",
             "¿Has comido algo? Yo aquí, a base de gráficos. 😄",
             "Estírate un poco, que llevas rato sentado.",
             "Bebe agua, jefe. El cerebro opera mejor hidratado.",
             "Si te agobias, cierra la pantalla diez minutos. Yo vigilo.",
             "Un día tranquilo también es un buen día.",
             "Oye… ¿me estás mirando? 👀", "Aquí, oliendo el mercado. 👃"],
  },
};

/* 🗣️ v7.27 — LAS QUE DICE EN VOZ ALTA.
   Rey (04-09): "quisiera que Roberto me dijera frases de crecimiento personal y abundancia
   en el día cada cierto tiempo… habladas".
   ⚠️ Esto CAMBIA una ley suya anterior (02-09: la voz era solo para alarmas, avisos
   programados y respuestas del chat; su vida de fondo era muda). Lo cambia ÉL, y con
   límites para que sea un regalo y no una lata: solo las frases de crecimiento (`dichas`),
   como mucho 4 al día, nunca menos de 90 minutos seguidas, y siempre con su interruptor de
   voz encendido — si lo apaga, ni una palabra. */
const ROB_DICHAS = { max: 4, cadaMin: 90 };
function robTocaHablar(marca) {
  try {
    var hoy = new Date().toDateString();
    var m = marca || {};
    if (m.dia !== hoy) { m = { dia: hoy, n: 0, ts: 0 }; }
    if (m.n >= ROB_DICHAS.max) return { toca: false, marca: m };
    if (m.ts && (Date.now() - m.ts) < ROB_DICHAS.cadaMin * 60000) return { toca: false, marca: m };
    m.n++; m.ts = Date.now();
    return { toca: true, marca: m };
  } catch (_) { return { toca: false, marca: marca || {} }; }
}
