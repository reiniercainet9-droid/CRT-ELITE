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
  { id:"limite",   gesto:"serio",
    re:/límite|limite|drawdown|\bdd\b|peligro/,
    di:()=>"cuenta cerca del límite — protégela" },

  { id:"roto",     gesto:"apenado",
    re:/no puedo arrancar|no responde|no arranca|ca[íi]d[oa]|se cayó|sin conexión|desconect/,
    di:(d)=>(/ejecutor/.test(d.b) ? "el Ejecutor no arranca — míralo"
           : /puente/.test(d.b)   ? "el Puente se cayó — míralo"
           : "algo se cayó: revísalo") },

  { id:"perdida",  gesto:"apenado",
    re:/señal perdida|⚰️|sin recoger|no la recogió/,
    di:()=>"una señal se quedó sin recoger" },

  { id:"veto",     gesto:"frena",
    re:/no entres|no entrar|veto|vetó|rechaz|abstén/,
    di:(d)=>"no entres" + (d.par ? " en " + d.par : "") },

  { id:"cierre_mal", gesto:"preocupa",
    re:/\bsl\b|stop|pérdida|perdida|perdi[óo]/,
    di:(d)=>"saltó el stop" + (d.par ? " en " + d.par : "") },

  { id:"cierre_ok",  gesto:"celebra",
    re:/\btp\b|ganad|ganancia|cazad|\+\d+(\.\d+)?r/,
    di:(d)=>"cerrada en ganancia" + (d.par ? ": " + d.par : "") },

  { id:"confirmada", gesto:"alerta",
    re:/entrada confirmada|confirmad/,
    di:(d)=>"zona confirmada" + (d.tf ? " — baja a " + d.tf : "") },

  { id:"liquidez",   gesto:"alerta",
    re:/liquidez|sweep|barrid/,
    di:(d)=>"ya hay toma de liquidez" + (d.tf ? " en " + d.tf : "") },

  { id:"reaccion",   gesto:"tiempo",
    re:/zona de reacci[óo]n|reacci[óo]n/,
    di:(d)=>"espera la zona de reacción" + (d.tf ? " en " + d.tf : "") },

  { id:"estructura", gesto:"vigila",
    re:/\bmss\b|estructura/,
    di:(d)=>"estructura rota" + (d.tf ? " en " + d.tf : "") + " — vigila" },

  { id:"ventana",    gesto:"tiempo",
    re:/killzone|kill zone|ventana operativa|pre-ny|londres|ny apertura/,
    di:()=>"ventana abierta — atento" },

  { id:"noticia",    gesto:"analiza",
    re:/noticia|calendario|📰/,
    di:()=>"noticia cerca: no operes ahora" },

  { id:"posicion",   gesto:"vigila",
    re:/posici[óo]n|vigil|👁/,
    di:(d)=>"te vigilo la posición" + (d.par ? " de " + d.par : "") },

  { id:"dossier",    gesto:"idea",
    re:/dossier|te propongo|pensadero|💡|idea/,
    di:()=>"tu dossier del día está listo" },

  { id:"saludo",     gesto:"saluda",
    re:/buenos días|buen día|🌅|amanecer/,
    di:()=>"buenos días, Rey" },

  { id:"ejecutor",   gesto:"audita",
    re:/auditor[íi]a|expediente|🤖|entré en/,
    di:(d)=>"el Ejecutor entró" + (d.par ? " en " + d.par : "") },

  { id:"felicita",   gesto:"felicita",
    re:/felicidades|bien hecho|bien jugado|👏|así se opera/,
    di:()=>"bien jugado, Rey" },

  { id:"vialibre",   gesto:"aprueba",
    re:/vía libre|puedes operar|👍/,
    di:()=>"vía libre" },

  { id:"descanso",   gesto:"siesta",
    re:/siesta|suspend|😴|hasta mañana/,
    di:()=>"hasta luego, Rey" },

  { id:"alarma",     gesto:"alerta",
    re:/🔔|alarma|se[ñn]al/,
    di:(d)=>"señal" + (d.par ? " en " + d.par : "") + (d.tf ? " · " + d.tf : "") + " — míralo" },
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
const CARAS_HAY = ["alerta","analiza","apenado","aprueba","audita","carino","celebra",
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
    return { id:"rutina", gesto:g, frase: tit.slice(0,64) || "tienes un aviso" };
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
  raiz.ROB_SITUA = ROB_SITUA; raiz.ROB_RUTINA = ROB_RUTINA; raiz.CARAS_HAY = CARAS_HAY;
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
             "Revísate el diario, que ahí está el oro.",
             "Yo descansando, pero con un ojo abierto. 😉"],
  },
  madrugada: {
    gestos: ["ojala", "espera", "animo", "tiempo", "carino", "orgulloso", "idea", "aprueba"],
    frases: ["De madrugada y aquí estás. Eso es oficio.",
             "Londres se acerca. Café y cabeza fría.",
             "Yo no me duermo, tranquilo.", "A esta hora el spread muerde. Ojo."],
  },
};
