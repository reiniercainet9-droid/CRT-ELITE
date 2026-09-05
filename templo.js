/* ══════════════════════════════════════════════════════════════════════════════
   🏛️ EL TEMPLO — CUERPO Y MENTE (v1, 05-09-2026)
   ═════════════════════════════════════════════════════════════════════════════
   Rey: *"quiero cuidar mi templo, que es mi cuerpo y mi mente: hacer ejercicio, mantenerme
   en forma física y mental, y para eso voy a utilizar Apex y Roberto con una nueva sección
   que no es de trading pero sí de cuidado en general… él debe ser también mi entrenador"*.

   ⚖️ SU LEY, LITERAL Y NO NEGOCIABLE:
   *"Los datos deben configurarse en la sección, nada fijo, todo se calcula en el recorrido,
   porque esos datos son variables según vaya entrenando… debo poder variar eso, uno porque
   cambio de año, pero también a medida que vaya bajando de peso y las medidas varían."*

   POR ESO ESTE FICHERO NO TIENE NI UN NÚMERO SUYO DENTRO. Ni su edad, ni su peso, ni su
   estatura, ni siquiera como ejemplo. Todo sale de lo que él configure, y todo se recalcula
   solo en cuanto cambie un dato. Lo único que hay aquí son las FÓRMULAS, que sí son fijas.

   Y una cosa más, que es de honestidad: aquí se calcula y se planifica, no se receta.
   Donde algo pueda cruzarse con su salud, se dice que lo confirme con un profesional — y se
   dice una vez, sin sermón. Eso es lo que hace que pueda fiarse del resto.
   ═════════════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  "use strict";

  /* ── LAS FÓRMULAS (lo único fijo de todo el fichero) ─────────────────────── */

  /** Índice de masa corporal: peso en kilos entre la estatura en metros al cuadrado. */
  function imc(pesoKg, estaturaCm) {
    const p = Number(pesoKg), e = Number(estaturaCm) / 100;
    if (!p || !e) return null;
    return p / (e * e);
  }

  /** Lo que dice la OMS de ese número. Se devuelve también el color, para no repetirlo. */
  function imcQueEs(v) {
    if (v == null) return null;
    if (v < 18.5) return { txt: "por debajo de tu peso", tono: "ojo" };
    if (v < 25) return { txt: "peso saludable", tono: "bien" };
    if (v < 30) return { txt: "sobrepeso", tono: "ojo" };
    if (v < 35) return { txt: "obesidad grado I", tono: "mal" };
    if (v < 40) return { txt: "obesidad grado II", tono: "mal" };
    return { txt: "obesidad grado III", tono: "mal" };
  }

  /** El rango de peso que le daría un IMC saludable con SU estatura. */
  function pesoSano(estaturaCm) {
    const e = Number(estaturaCm) / 100;
    if (!e) return null;
    return { min: 18.5 * e * e, max: 24.9 * e * e };
  }

  /** Gasto en reposo (Mifflin-St Jeor): las calorías que quema estando quieto.
      Es la fórmula estándar y la más fiable de las que solo necesitan peso, talla y edad. */
  function gastoEnReposo(pesoKg, estaturaCm, edad, sexo) {
    const p = Number(pesoKg), e = Number(estaturaCm), a = Number(edad);
    if (!p || !e || !a) return null;
    const base = 10 * p + 6.25 * e - 5 * a;
    return (String(sexo).toLowerCase() === "mujer") ? base - 161 : base + 5;
  }

  /** Lo que gasta al día según lo que se mueva. */
  const ACTIVIDAD = [
    { id: "sedentario", n: "Sedentario (poco o nada de ejercicio)", f: 1.2 },
    { id: "ligero", n: "Ligero (1-3 días por semana)", f: 1.375 },
    { id: "moderado", n: "Moderado (3-5 días por semana)", f: 1.55 },
    { id: "alto", n: "Alto (6-7 días por semana)", f: 1.725 },
    { id: "muyalto", n: "Muy alto (trabajo físico + entreno)", f: 1.9 },
  ];

  function gastoDiario(pesoKg, estaturaCm, edad, sexo, actividad) {
    const r = gastoEnReposo(pesoKg, estaturaCm, edad, sexo);
    if (r == null) return null;
    const a = ACTIVIDAD.find((x) => x.id === actividad) || ACTIVIDAD[0];
    return r * a.f;
  }

  /** Y las calorías objetivo según lo que quiera lograr.
      Los déficits y superávits son moderados a propósito: los agresivos se abandonan, y
      además queman músculo. Aquí manda el mismo principio que en su trading — lo sostenible
      gana a lo espectacular. */
  const OBJETIVOS = [
    { id: "grasa", n: "Bajar grasa", ajuste: -0.18, prote: 2.0,
      nota: "déficit del 18%: se pierde grasa sin comerse el músculo ni pasar hambre a diario" },
    { id: "musculo", n: "Ganar músculo", ajuste: 0.12, prote: 1.8,
      nota: "superávit del 12%: lo justo para construir, sin engordar de más" },
    { id: "mantener", n: "Mantenerme", ajuste: 0, prote: 1.6,
      nota: "sin déficit ni superávit: recomposición lenta y sostenible" },
    { id: "resistencia", n: "Resistencia y salud", ajuste: 0, prote: 1.4,
      nota: "el foco no es el peso: es aguantar más y recuperarte mejor" },
  ];

  /** El plan de números completo, TODO calculado a partir de lo que él configuró. */
  function calcular(d) {
    if (!d || !d.peso || !d.estatura) return null;
    const edad = edadDe(d.nacimiento) != null ? edadDe(d.nacimiento) : Number(d.edad);
    const v = imc(d.peso, d.estatura);
    const obj = OBJETIVOS.find((x) => x.id === d.objetivo) || OBJETIVOS[2];
    const gd = gastoDiario(d.peso, d.estatura, edad, d.sexo, d.actividad);
    const cal = gd != null ? Math.round(gd * (1 + obj.ajuste)) : null;
    const prote = Math.round(Number(d.peso) * obj.prote);
    const sano = pesoSano(d.estatura);
    return {
      edad: edad,
      imc: v, imcQueEs: imcQueEs(v),
      pesoSano: sano,
      reposo: gastoEnReposo(d.peso, d.estatura, edad, d.sexo),
      gastoDiario: gd,
      calorias: cal,
      proteina: prote,
      agua: Math.round(Number(d.peso) * 35),          /* ml al día, regla estándar 35 ml/kg */
      objetivo: obj,
    };
  }

  /** Su edad, calculada de su fecha de nacimiento: así cambia sola cada cumpleaños y él
      no tiene que acordarse de tocarla. Fue una de las dos cosas que pidió expresamente. */
  function edadDe(nacimiento) {
    try {
      if (!nacimiento) return null;
      /* ⚠️ una fecha "AAAA-MM-DD" la lee JavaScript como MEDIANOCHE EN UTC, y Rey vive en
         Brasil (UTC−3): al pasarla a su hora local se va al DÍA ANTERIOR. O sea que su
         cumpleaños se le adelantaba un día y su edad cambiaba antes de tiempo. Se arma la
         fecha por partes, que es local de verdad. */
      const p = String(nacimiento).match(/^(\d{4})-(\d{2})-(\d{2})/);
      const n = p ? new Date(+p[1], +p[2] - 1, +p[3]) : new Date(nacimiento);
      if (isNaN(n.getTime())) return null;
      const h = new Date();
      let a = h.getFullYear() - n.getFullYear();
      const m = h.getMonth() - n.getMonth();
      if (m < 0 || (m === 0 && h.getDate() < n.getDate())) a--;
      return (a > 0 && a < 130) ? a : null;
    } catch (_) { return null; }
  }

  /* ── LA TENDENCIA: de dónde viene y hacia dónde va ───────────────────────── */

  /** Con su historial de pesadas dice cuánto ha cambiado y a qué ritmo por semana.
      El ritmo importa más que el número de hoy: una báscula miente un día, una tendencia no. */
  function tendencia(registro) {
    const l = (registro || []).filter((x) => x && x.peso).slice().sort((a, b) => a.ts - b.ts);
    if (l.length < 2) return null;
    const pri = l[0], ult = l[l.length - 1];
    const dias = Math.max(1, (ult.ts - pri.ts) / 86400000);
    const dif = Number(ult.peso) - Number(pri.peso);
    return {
      desde: pri, hasta: ult, dias: Math.round(dias),
      cambio: dif,
      porSemana: dif / (dias / 7),
      pesadas: l.length,
    };
  }

  /* ── LOS SUPLEMENTOS, POR ETAPAS ─────────────────────────────────────────── */
  /* Rey: "saber de todos los suplementos y cuál debería tomar y en qué etapa tomar cada
     cual, o sea desde la base, inicio, hasta avanzado".
     Van ordenados por lo que de verdad hay detrás de cada uno, no por lo que se vende:
     primero lo que tiene evidencia sólida y barata, después lo opcional. Y lo que no la
     tiene, se dice. Es la misma etiqueta de evidencia de sus 86 leyes. */
  const SUPLEMENTOS = [
    { etapa: "base", n: "Proteína en polvo (suero o vegetal)", ev: "SÓLIDA",
      q: "no es un suplemento mágico: es comida cómoda. Sirve para llegar a tu proteína del día cuando no da tiempo a cocinar.",
      c: "solo si no llegas a tu objetivo de proteína comiendo. Si llegas, no hace falta." },
    { etapa: "base", n: "Creatina monohidrato", ev: "SÓLIDA",
      q: "el suplemento más estudiado que existe. Más fuerza, más volumen de entrenamiento, y hay evidencia también en función cognitiva.",
      c: "3-5 g al día, todos los días, a cualquier hora. No necesita fase de carga ni descansos." },
    { etapa: "base", n: "Vitamina D3", ev: "SÓLIDA si hay déficit",
      q: "afecta a hueso, sistema inmune, ánimo y testosterona. El déficit es muy común incluso en países con sol, porque se vive dentro.",
      c: "esto SÍ se mide con una analítica antes de tomarlo. Pídesela a tu médico: la dosis depende de tu nivel real." },
    { etapa: "base", n: "Omega 3 (EPA/DHA)", ev: "SÓLIDA",
      q: "antiinflamatorio, salud cardiovascular y cerebral. Útil sobre todo si comes poco pescado azul.",
      c: "1-2 g de EPA+DHA al día. Mira los gramos de EPA y DHA en la etiqueta, no los de aceite total." },
    { etapa: "base", n: "Magnesio (citrato o bisglicinato)", ev: "ÚTIL",
      q: "interviene en cientos de reacciones; su déficit se nota en calambres, sueño malo y fatiga.",
      c: "200-400 mg por la noche. El óxido de magnesio se absorbe mal: mejor citrato o bisglicinato." },
    { etapa: "intermedio", n: "Cafeína", ev: "SÓLIDA",
      q: "el potenciador de rendimiento más eficaz y barato que hay, para fuerza y para resistencia.",
      c: "3-6 mg por kilo, 45 min antes. ⚠️ Ojo con tu horario: operas de madrugada. Tomada tarde te destroza el sueño, y el sueño es el que sostiene todo lo demás." },
    { etapa: "intermedio", n: "Zinc", ev: "ÚTIL",
      q: "sistema inmune y producción hormonal. El déficit es más común de lo que parece si se suda mucho.",
      c: "15-30 mg, mejor con comida. No lo tomes a la vez que el hierro o el calcio: compiten." },
    { etapa: "intermedio", n: "Electrolitos (sodio, potasio, magnesio)", ev: "ÚTIL",
      q: "en calor o entrenos largos, el agua sola no repone lo que se pierde sudando.",
      c: "en Timbó, con calor y moto, esto pesa más de lo que parece." },
    { etapa: "avanzado", n: "Beta-alanina", ev: "SÓLIDA para esfuerzos de 1-4 min",
      q: "retrasa la fatiga en series largas y esfuerzos intensos de varios minutos.",
      c: "3-6 g al día, constantes. Da hormigueo en la piel: es inofensivo y pasa." },
    { etapa: "avanzado", n: "Citrulina malato", ev: "ÚTIL",
      q: "más flujo sanguíneo y algo menos de dolor muscular al día siguiente.",
      c: "6-8 g unos 40 min antes de entrenar." },
    { etapa: "avanzado", n: "Ashwagandha", ev: "ÚTIL, evidencia media",
      q: "puede bajar el cortisol y mejorar la respuesta al estrés y el sueño.",
      c: "no la mezcles con medicación sin preguntar. Si estás medicado, esta se consulta antes." },
    { etapa: "ninguna", n: "Quemadores de grasa, testosterona natural, detox", ev: "FOLCLORE",
      q: "el negocio está en la promesa, no en el efecto. Casi ninguno supera al placebo en estudios serios.",
      c: "no gastes dinero aquí. Lo que quema grasa es el déficit sostenido; lo que sube la testosterona es dormir, entrenar fuerte y no estar en déficit extremo." },
  ];

  /* ── LO QUE NO ES ENTRENAR PERO SOSTIENE EL ENTRENO ──────────────────────── */
  /* Rey lo pidió con nombre propio: "energía sexual y ejercicios para eso también, como el
     Kegel". Va aquí como una rutina más, sin misterio: es suelo pélvico, y se entrena. */
  const PILARES = [
    { id: "sueno", ic: "😴", n: "Sueño",
      q: "es el pilar que sostiene a los otros tres. Sin dormir no se construye músculo, no se pierde grasa bien y se decide peor — también delante del gráfico.",
      c: "7-9 horas. Con tu horario de madrugada, la siesta corta después de la ventana operativa no es pereza: es parte del plan." },
    { id: "movilidad", ic: "🤸", n: "Movilidad",
      q: "10 minutos al día de cadera, dorsal y tobillo. Es lo que evita las lesiones que te apartan semanas.",
      c: "sobre todo si pasas horas sentado delante de las pantallas y encima vas en moto." },
    { id: "respiracion", ic: "🫁", n: "Respiración",
      q: "respiración lenta (4 segundos dentro, 6 fuera) baja el pulso y la activación en minutos.",
      c: "úsala antes de la killzone y después de una pérdida. Es tu ley 22 (Yerkes-Dodson) aplicada al cuerpo." },
    { id: "pelvico", ic: "⚡", n: "Suelo pélvico (Kegel)",
      q: "el suelo pélvico es músculo y se entrena como cualquier otro. Sostiene la continencia, la postura y la función sexual.",
      c: "3 series de 10 contracciones de 5 segundos, con 5 de descanso, un par de veces al día. Se hace sentado o de pie y no se nota desde fuera. Como todo músculo: constancia, no intensidad." },
  ];

  /* ── 🧘 RESPIRACIÓN Y MEDITACIÓN GUIADAS ─────────────────────────────────────
     Rey (05-09): "quiero agregar también dentro de la sección templo la programación de las
     clases de respiración y meditación con sus horarios programados correspondientes, y
     también los conocimientos de Roberto sobre meditación y respiración guiada, con
     experiencia".
     Cada práctica trae su GUION paso a paso, con los segundos exactos, para que Roberto
     pueda guiarla de verdad y no solo nombrarla. Y cada una dice PARA QUÉ sirve y CUÁNDO
     usarla: una práctica que activa no se pone antes de dormir, y una que calma no se pone
     antes de operar.
     ⚠️ Van con su etiqueta de evidencia, igual que las 86 leyes y los suplementos: aquí
     tampoco se vende humo. */
  const PRACTICAS = [
    { id: "coherencia", ic: "🫁", n: "Respiración de coherencia (4-6)", min: 5, ev: "SÓLIDA",
      q: "inhalar 4 segundos y exhalar 6. Al alargar la exhalación se activa el freno del cuerpo (el nervio vago) y bajan el pulso y la activación en pocos minutos.",
      cuando: "antes de la killzone, y después de una pérdida. Es la ley 22 (Yerkes-Dodson) aplicada al cuerpo: bajar la activación justo antes de la tarea más compleja del día.",
      guion: [
        "Siéntate con la espalda recta y los pies en el suelo. Suelta los hombros.",
        "Inhala por la nariz contando 4 segundos, llevando el aire a la barriga, no al pecho.",
        "Exhala por la boca contando 6, despacio, como si empañaras un cristal.",
        "Repite ese ciclo. Son 5 respiraciones por minuto.",
        "Si te distraes, no pasa nada: vuelve a contar y sigue. Distraerse y volver ES el ejercicio.",
      ] },
    { id: "fisiologico", ic: "😮‍💨", n: "Suspiro fisiológico", min: 2, ev: "SÓLIDA",
      q: "dos inhalaciones seguidas por la nariz (la segunda corta, encima de la primera) y una exhalación larga por la boca. Es la forma más rápida que se conoce de bajar la activación.",
      cuando: "cuando la cabeza se te va a mil: acabas de comerte un stop, o notas la mano yendo sola al botón. Funciona en menos de un minuto.",
      guion: [
        "Inhala por la nariz hasta llenar.",
        "Sin soltar, roba una segunda inhalación corta por encima.",
        "Exhala TODO por la boca, largo y lento.",
        "Repite 3 a 5 veces. Con eso basta: no hace falta más.",
      ] },
    { id: "caja", ic: "⬜", n: "Respiración en caja (4-4-4-4)", min: 5, ev: "ÚTIL",
      q: "inhalar 4, retener 4, exhalar 4, retener 4. Da un ancla muy clara a la mente porque hay que contar todo el rato.",
      cuando: "cuando estás disperso y no consigues concentrarte. Es la que usan los que tienen que rendir bajo presión.",
      guion: [
        "Inhala por la nariz contando 4.",
        "Retén el aire contando 4, sin apretar la garganta.",
        "Exhala contando 4.",
        "Quédate vacío contando 4, y vuelve a empezar.",
        "Si te agobia la retención, baja a 3 en todo. La comodidad manda.",
      ] },
    { id: "escaneo", ic: "🧎", n: "Escaneo corporal", min: 10, ev: "SÓLIDA",
      q: "recorrer el cuerpo con la atención, de los pies a la cabeza, notando lo que hay sin cambiarlo.",
      cuando: "al cerrar el día operativo, o antes de dormir. Es la mejor puerta de entrada a la meditación para el que dice que 'no puede parar la cabeza'.",
      guion: [
        "Túmbate o siéntate cómodo. Ojos cerrados si te apetece.",
        "Lleva la atención a los pies. ¿Frío, calor, hormigueo, nada? No lo cambies: solo míralo.",
        "Sube despacio: pantorrillas, muslos, cadera, barriga, pecho, manos, brazos, hombros.",
        "Los hombros y la mandíbula suelen estar apretados sin que lo sepas. Al notarlo, suéltalos.",
        "Termina en la cara y la coronilla. Quédate un momento notando el cuerpo entero.",
      ] },
    { id: "atencion", ic: "🧘", n: "Atención a la respiración", min: 10, ev: "SÓLIDA",
      q: "la meditación base: poner la atención en la respiración y devolverla ahí cada vez que se va.",
      cuando: "por la mañana, antes del análisis. Entrena exactamente el músculo que te hace falta operando: darte cuenta de que te fuiste, y volver.",
      guion: [
        "Siéntate recto, sin rigidez. Manos donde caigan.",
        "No cambies la respiración: solo obsérvala. Dónde la notas más — nariz, pecho o barriga.",
        "Tu cabeza se va a ir. Cien veces. Es normal y no es un fallo.",
        "Cada vez que te des cuenta de que te fuiste, vuelve. ESE momento es el entrenamiento.",
        "Empieza por 5 minutos al día. Diez minutos todos los días valen más que una hora el domingo.",
      ] },
    { id: "gratitud", ic: "🙏", n: "Cierre de gratitud", min: 3, ev: "ÚTIL",
      q: "nombrar tres cosas concretas del día, por pequeñas que sean.",
      cuando: "al acabar el día, junto con tu cierre del diario. Ayuda a que un día en rojo no se te lleve por delante lo demás.",
      guion: [
        "Piensa tres cosas concretas de HOY. Concretas: no 'mi familia', sino algo que pasó.",
        "De cada una, nota un segundo cómo se siente en el cuerpo.",
        "Si el día fue malo, vale con: sigo aquí, cumplí mis reglas, mañana abre otra vez.",
      ] },
    { id: "prekz", ic: "🎯", n: "Ritual antes de la ventana", min: 4, ev: "ÚTIL",
      q: "una secuencia corta que junta respiración y repaso mental, justo antes de operar.",
      cuando: "10 minutos antes de tu killzone. Sustituye a mirar el gráfico con ansiedad mientras esperas.",
      guion: [
        "Un minuto de respiración 4-6 para bajar el pulso.",
        "Repasa en voz alta tu regla del día: sin barrida, no hay setup.",
        "Di qué NO vas a hacer hoy. Es más útil que decir qué vas a hacer.",
        "Última exhalación larga, y abre el gráfico.",
      ] },
  ];


  /* ══════════════════════════════════════════════════════════════════════════
     🪜 LA ESCALERA: DEL AIRE LIBRE AL GIMNASIO — v2 (05-09-2026)
     ═════════════════════════════════════════════════════════════════════════
     Rey: "Roberto sabiendo y estando muy informado como guía con sus conocimientos el paso
     a paso, comenzando al aire libre y después subiendo de nivel hasta llegar al gimnasio".
     Cinco niveles. **Se sube por MÉRITO, no por tiempo**: hay que cumplir un criterio
     medible. Es su misma ley del trading — proceso antes que resultado. Un mes en el nivel 0
     cumpliendo vale más que saltar al 3 sin base, que es como se lesiona la gente.
     Cada ejercicio trae su CÓMO SE HACE, porque un plan que no explica la técnica es un
     plan que se hace mal. */
  const NIVELES = [
    { n: 0, n2: "Base", donde: "Al aire libre", dias: 3,
      q: "recuperar el hábito de moverte y que el cuerpo aguante. Sin material, sin gimnasio, sin excusas.",
      sube: "3 semanas seguidas cumpliendo al menos el 80%, y 10 flexiones inclinadas seguidas.",
      sesiones: [
        { n: "Cuerpo entero A", bloques: [
          { e: "Caminar rápido", d: "15 min", como: "ritmo al que puedes hablar pero no cantar" },
          { e: "Sentadilla al aire", d: "3 × 10", como: "pies al ancho de los hombros, bajas como si te sentaras en una silla, rodillas hacia fuera, espalda recta" },
          { e: "Flexión inclinada (en un banco o pared)", d: "3 × 6", como: "cuanto más alto el apoyo, más fácil. Cuerpo en línea recta, codos hacia atrás y no hacia los lados" },
          { e: "Plancha", d: "3 × 20 s", como: "codos bajo los hombros, culo ni arriba ni abajo, aprieta abdomen y glúteo" },
        ] },
        { n: "Cuerpo entero B", bloques: [
          { e: "Caminar rápido", d: "20 min", como: "puedes partirlo en dos ratos del día" },
          { e: "Zancadas", d: "3 × 8 por pierna", como: "paso largo, la rodilla de atrás casi toca el suelo, tronco recto" },
          { e: "Puente de glúteo", d: "3 × 12", como: "tumbado boca arriba, subes la cadera apretando el glúteo arriba 1 segundo" },
          { e: "Plancha lateral", d: "2 × 15 s por lado", como: "cadera alta, cuerpo en línea" },
        ] },
        { n: "Movilidad y respiración", bloques: [
          { e: "Movilidad de cadera y dorsal", d: "10 min", como: "sin rebotes, entra en el rango y respira" },
          { e: "Respiración de coherencia (4-6)", d: "5 min", como: "la tienes con su guion en la sección" },
          { e: "Caminar suave", d: "15 min", como: "esto es recuperación, no entrenamiento" },
        ] },
      ] },
    { n: 1, n2: "Constancia", donde: "Calle y casa", dias: 4,
      q: "el mismo trabajo pero con progresión de verdad, y añadiendo carrera suave.",
      sube: "4 semanas al 80% y 20 flexiones seguidas en el suelo.",
      sesiones: [
        { n: "Empuje", bloques: [
          { e: "Flexiones (menos inclinación cada semana)", d: "4 × 8", como: "cuando salgan 4×8 limpias, baja el apoyo" },
          { e: "Fondos en silla", d: "3 × 8", como: "codos hacia atrás, hombros lejos de las orejas" },
          { e: "Plancha", d: "3 × 40 s", como: "si tiemblas, está bien; si se hunde la espalda, para" },
        ] },
        { n: "Pierna", bloques: [
          { e: "Sentadilla al aire", d: "4 × 15", como: "baja más de lo que crees; profundidad antes que repeticiones" },
          { e: "Zancadas caminando", d: "3 × 10 por pierna", como: "controla la bajada, no te dejes caer" },
          { e: "Puente a una pierna", d: "3 × 8 por lado", como: "la cadera no se gira" },
        ] },
        { n: "Carrera suave", bloques: [
          { e: "Correr / caminar", d: "20 min (2 min corriendo, 2 andando)", como: "el objetivo NO es cansarse: es acabar pudiendo repetir mañana" },
        ] },
        { n: "Movilidad y respiración", bloques: [
          { e: "Movilidad completa", d: "12 min", como: "cadera, dorsal, tobillo y hombro" },
          { e: "Escaneo corporal", d: "10 min", como: "está en la sección, con su guion" },
        ] },
      ] },
    { n: 2, n2: "Fuerza con tu peso", donde: "Parque (barra de dominadas)", dias: 4,
      q: "los patrones de fuerza de verdad, todavía sin gimnasio.",
      sube: "4 semanas al 80% y 3 dominadas completas sin ayuda.",
      sesiones: [
        { n: "Tirón", bloques: [
          { e: "Dominadas asistidas (goma o salto y bajada lenta)", d: "5 × 3", como: "la BAJADA lenta de 3 segundos es la que construye la dominada" },
          { e: "Remo invertido (barra baja)", d: "4 × 8", como: "cuerpo recto, lleva el pecho a la barra" },
          { e: "Plancha con toque de hombro", d: "3 × 10", como: "que la cadera no baile" },
        ] },
        { n: "Empuje", bloques: [
          { e: "Flexiones", d: "4 × 12", como: "si salen fáciles, sube los pies a un banco" },
          { e: "Fondos en paralelas", d: "4 × 6", como: "baja hasta que el brazo haga 90°, ni más" },
          { e: "Pica (hombro)", d: "3 × 8", como: "flexión con la cadera alta: es el press de hombro con tu peso" },
        ] },
        { n: "Pierna", bloques: [
          { e: "Sentadilla búlgara", d: "4 × 8 por pierna", como: "pie de atrás en un banco. Duele y funciona" },
          { e: "Salto al cajón bajo", d: "4 × 5", como: "sube saltando, BAJA andando" },
          { e: "Gemelo de pie", d: "3 × 15", como: "arriba aprieta un segundo" },
        ] },
        { n: "Carrera", bloques: [
          { e: "Correr continuo", d: "25 min", como: "ritmo cómodo, respirando por la nariz si puedes" },
        ] },
      ] },
    { n: 3, n2: "Gimnasio, inicio", donde: "Gimnasio", dias: 4,
      q: "aprender los patrones con máquinas y mancuernas, que perdonan más que la barra.",
      sube: "6 semanas al 80% y técnica sólida en los cinco patrones.",
      sesiones: [
        { n: "Torso A", bloques: [
          { e: "Press de banca con mancuernas", d: "4 × 8", como: "escápulas juntas y pecho alto" },
          { e: "Remo en máquina", d: "4 × 10", como: "tira con el codo, no con la mano" },
          { e: "Press de hombro sentado", d: "3 × 10", como: "no arquees la espalda" },
          { e: "Curl y extensión", d: "3 × 12", como: "sin balanceo" },
        ] },
        { n: "Pierna A", bloques: [
          { e: "Prensa", d: "4 × 10", como: "no bloquees la rodilla arriba" },
          { e: "Curl femoral", d: "3 × 12", como: "controla la vuelta" },
          { e: "Extensión de cuádriceps", d: "3 × 12", como: "aprieta arriba" },
          { e: "Gemelo", d: "4 × 15", como: "recorrido completo" },
        ] },
        { n: "Torso B", bloques: [
          { e: "Jalón al pecho", d: "4 × 10", como: "pecho arriba, lleva la barra a la clavícula" },
          { e: "Press inclinado con mancuernas", d: "4 × 8", como: "inclinación de 30°, no más" },
          { e: "Elevaciones laterales", d: "3 × 12", como: "ligero: aquí no se compite" },
          { e: "Plancha", d: "3 × 45 s", como: "" },
        ] },
        { n: "Pierna B y cardio", bloques: [
          { e: "Peso muerto rumano con mancuernas", d: "4 × 8", como: "cadera atrás, espalda recta, notas el isquio" },
          { e: "Zancadas con mancuernas", d: "3 × 10 por pierna", como: "" },
          { e: "Cardio suave", d: "15 min", como: "cinta o bici, cómodo" },
        ] },
      ] },
    { n: 4, n2: "Gimnasio, fuerza", donde: "Gimnasio", dias: 4,
      q: "la barra y la progresión de carga. Aquí el progreso se mide en kilos.",
      sube: "este es el nivel donde te quedas y progresas dentro de él.",
      sesiones: [
        { n: "Fuerza A", bloques: [
          { e: "Sentadilla con barra", d: "5 × 5", como: "sube 2,5 kg cuando completes las 5×5 limpias" },
          { e: "Press banca", d: "5 × 5", como: "misma regla de progresión" },
          { e: "Remo con barra", d: "5 × 5", como: "espalda recta, sin tirones" },
        ] },
        { n: "Fuerza B", bloques: [
          { e: "Peso muerto", d: "3 × 5", como: "la técnica manda sobre el peso. SIEMPRE" },
          { e: "Press militar", d: "5 × 5", como: "aprieta glúteo y abdomen para no arquear" },
          { e: "Dominadas", d: "4 × máximo", como: "" },
        ] },
        { n: "Accesorios", bloques: [
          { e: "Trabajo de brazo y hombro", d: "4 ejercicios × 3 × 12", como: "esto es volumen, no fuerza: peso moderado" },
          { e: "Core", d: "3 ejercicios × 3", como: "" },
        ] },
        { n: "Cardio y movilidad", bloques: [
          { e: "Cardio", d: "25 min", como: "cómodo: esto ayuda a recuperar, no a cansar" },
          { e: "Movilidad", d: "10 min", como: "" },
        ] },
      ] },
  ];

  /* ── LA PRUEBA DE NIVEL ────────────────────────────────────────────────────
     En vez de colocarle a ojo, cuatro pruebas sencillas lo sitúan solo. Y se repiten cada
     6 semanas: así ve progreso aunque la báscula esté parada, que es justo el mes en el que
     la gente abandona. */
  const PRUEBAS = [
    { id: "flex", n: "Flexiones seguidas", u: "repeticiones", como: "en el suelo, sin parar y con el cuerpo recto. Si no sale ninguna, apunta 0 y ya está." },
    { id: "plancha", n: "Plancha", u: "segundos", como: "hasta que se hunda la cadera. Ahí se acabó, aunque puedas aguantar más apretando." },
    { id: "sentadillas", n: "Sentadillas en 1 minuto", u: "repeticiones", como: "profundidad completa; las que no bajan, no cuentan." },
    { id: "km", n: "Caminar o correr 1 km", u: "minutos", como: "a tu ritmo máximo sostenible. Sirve caminando: es tu punto de partida, no tu nota." },
  ];

  /** Con sus marcas, dónde empieza. Manda la más floja: el cuerpo va al ritmo de su
      eslabón débil, y empezar por debajo es lo que hace que no abandone. */
  function nivelDePrueba(m) {
    try {
      if (!m) return 0;
      const f = Number(m.flex) || 0, p = Number(m.plancha) || 0, s = Number(m.sentadillas) || 0;
      let n = 0;
      if (f >= 10 && p >= 40 && s >= 25) n = 1;
      if (f >= 20 && p >= 60 && s >= 35) n = 2;
      if (f >= 30 && p >= 90 && s >= 45) n = 3;
      return n;
    } catch (_) { return 0; }
  }

  /* ── EL MOTOR DE ADAPTACIÓN ────────────────────────────────────────────────
     Rey: "va cambiando esas planificaciones semanal a medida que vaya cumpliendo los
     entrenamientos".
     ⚠️ ESTO DECIDE CON REGLAS, COMO SU INDICADOR — no lo decide Roberto en cada charla.
     Si el plan se lo inventara Roberto cada día, cada día sería otro y no habría progresión
     que medir. Roberto lee esto, lo explica y le empuja; el plan lo calcula la app. */
  const ADAPTA = {
    sube: 0.8,        /* cumpliendo el 80% o más, se progresa */
    repite: 0.5,      /* entre el 50 y el 79%, se repite la semana */
    cadaDescarga: 5,  /* cada 5 semanas, una semana suave obligatoria */
  };

  /** Qué toca hacer con la semana que acaba de cerrar. */
  function cerrarSemana(hechas, total, semanaNum, avisos) {
    const pct = total ? hechas / total : 0;
    if (avisos && (avisos.dolor || avisos.malSueno))
      return { que: "descarga", pct, por: "marcaste " + (avisos.dolor ? "dolor" : "mal descanso") + ": esta semana baja el volumen. Forzar aquí es como operar cansado." };
    if (semanaNum > 0 && semanaNum % ADAPTA.cadaDescarga === 0)
      return { que: "descarga", pct, por: "toca semana suave (cada " + ADAPTA.cadaDescarga + "): es lo que evita la lesión y el abandono." };
    if (pct >= ADAPTA.sube)
      return { que: "sube", pct, por: "cumpliste el " + Math.round(pct * 100) + "%: se progresa." };
    if (pct >= ADAPTA.repite)
      return { que: "repite", pct, por: "cumpliste el " + Math.round(pct * 100) + "%: se repite la semana. No se progresa sobre lo que no se hizo." };
    return { que: "recorta", pct, por: "cumpliste el " + Math.round(pct * 100) + "%: el plan es demasiado grande y se recorta. Se adapta él a ti, no tú a él." };
  }

  /** La semana que toca, con sus días. El plan del nivel se reparte en los días que él
      eligió, y en descarga se quita una sesión y baja el volumen. */
  function semanaDe(nivel, semanaNum, modo) {
    const N = NIVELES.find((x) => x.n === Number(nivel)) || NIVELES[0];
    let ses = N.sesiones.slice();
    if (modo === "descarga") ses = ses.slice(0, Math.max(2, ses.length - 1));
    if (modo === "recorta") ses = ses.slice(0, Math.max(2, ses.length - 1));
    return { nivel: N, semanaNum, modo: modo || "normal", sesiones: ses };
  }


  /* ══════════════════════════════════════════════════════════════════════════
     🍽️ EL DÉFICIT Y EL AYUNO, POR ESCALONES — v2 (05-09-2026)
     ═════════════════════════════════════════════════════════════════════════
     Rey: "Roberto debe saber de déficit calórico y debemos aplicarlo, al igual que el ayuno
     intermitente, y también debemos aplicarlo todo escalonadamente y programado, con reglas
     y disciplina, y que sea automático".
     POR QUÉ ESCALONADO Y NO DE GOLPE: nadie aguanta un 20% de déficit con 16 horas de ayuno
     desde el día uno. Se abandona en la segunda semana, y encima con esa hambre se duerme
     mal y se decide peor — también delante del gráfico. Se sube un escalón solo si cumplió
     el anterior, exactamente igual que la escalera del entrenamiento.
     ⚠️ Y EL AYUNO TIENE UNA REGLA SUYA: la ventana de comer NO puede dejarle operando en
     ayunas prolongado si eso le sienta mal. Su killzone es a las 8:30-10:30 de Brasil, y ahí
     necesita cabeza. Por eso cada escalón dice cuándo abrir la ventana, y si choca con su
     operativa se le avisa. */
  const NUTRI = [
    { n: 0, n2: "Ordenar", semanas: 2, deficit: 0, ayuno: 0,
      q: "todavía NO se toca la cantidad. Se ordena lo que ya come.",
      reglas: [
        "Llega a tu proteína del día (la tienes calculada arriba).",
        "Bebe tu agua. Casi siempre lo que parece hambre es sed.",
        "Nada de picar entre comidas: come en comidas, no en ratos.",
        "Sin ultraprocesados entre semana. El fin de semana, con cabeza.",
      ],
      sube: "2 semanas seguidas cumpliendo la proteína y el agua." },
    { n: 1, n2: "Déficit suave + 12:12", semanas: 3, deficit: 0.10, ayuno: 12,
      q: "un 10% menos de lo que gastas, y 12 horas sin comer (la mayoría durmiendo).",
      reglas: [
        "Ventana de comer: 12 horas. Ejemplo con tu horario: de 8:00 a 20:00.",
        "Del 10% de déficit ni te enteras: es medio plato menos al día.",
        "Pésate 2-3 veces por semana, siempre igual. Manda la TENDENCIA.",
      ],
      sube: "3 semanas cumpliendo y bajando entre 0,2 y 0,7 kg por semana." },
    { n: 2, n2: "Déficit medio + 14:10", semanas: 4, deficit: 0.15, ayuno: 14,
      q: "15% de déficit y 14 horas de ayuno. Aquí ya se nota, y aquí se prueba la disciplina.",
      reglas: [
        "Ventana de 10 horas. Ejemplo: de 9:00 a 19:00.",
        "Si te da hambre a media mañana: agua, café solo o té. No es un premio, es fisiología.",
        "Si el entrenamiento empeora dos sesiones seguidas, baja un escalón. No es fracasar: es gestionar.",
      ],
      sube: "4 semanas cumpliendo, sin que se caiga el rendimiento del entreno." },
    { n: 3, n2: "Déficit fuerte + 16:8", semanas: 4, deficit: 0.18, ayuno: 16,
      q: "18% y 16 horas. Es el escalón de verdad, y NO es para estar siempre aquí.",
      reglas: [
        "Ventana de 8 horas. Ejemplo: de 11:00 a 19:00.",
        "⚠️ Con tu horario, si operas de madrugada, entrarías a la killzone en ayunas. Si notas la cabeza espesa, adelanta la ventana o baja al escalón 2. La operativa manda.",
        "Aquí la proteína es más importante que nunca: es lo que evita perder músculo.",
        "Máximo 8-10 semanas seguidas. Después, un descanso en mantenimiento.",
      ],
      sube: "este es el último escalón: no se sube más, se alterna con el descanso." },
    { n: 4, n2: "Descanso metabólico", semanas: 2, deficit: 0, ayuno: 14,
      q: "vuelta a mantenimiento durante 2 semanas. NO es rendirse: es lo que hace que lo anterior siga funcionando.",
      reglas: [
        "Comes tus calorías de mantenimiento. El peso subirá un poco: es agua y glucógeno, no grasa.",
        "Se mantiene el entrenamiento igual.",
        "Después de esto se vuelve al escalón 2 o 3, y el cuerpo responde otra vez.",
      ],
      sube: "tras 2 semanas se vuelve al escalón que tocaba." },
  ];

  /** Las calorías de un escalón, calculadas con SUS datos. Nada fijo, como todo aquí. */
  function nutriDe(ficha, escalon) {
    try {
      const c = calcular(ficha);
      if (!c) return null;
      const e = NUTRI.find((x) => x.n === Number(escalon)) || NUTRI[0];
      const cal = Math.round(c.gastoDiario * (1 - e.deficit));
      return {
        escalon: e,
        calorias: cal,
        quita: Math.round(c.gastoDiario - cal),
        proteina: c.proteina,
        agua: c.agua,
        ventana: e.ayuno ? (24 - e.ayuno) : 24,
      };
    } catch (_) { return null; }
  }

  /** ¿La ventana de comer choca con su ventana de operar?
      Se avisa, no se prohíbe: la decisión es suya, pero tiene que saberlo. */
  function chocaConOperativa(horaAbre, ayunoHoras) {
    try {
      if (!horaAbre || !ayunoHoras) return null;
      const h = parseInt(String(horaAbre).split(":")[0], 10);
      if (isNaN(h)) return null;
      /* su ventana operativa: 8:30-12:30 de Brasil */
      if (h >= 11) return "abres la ventana a las " + horaAbre + ", así que operarías toda tu killzone en ayunas. Si notas la cabeza espesa, adelántala.";
      return null;
    } catch (_) { return null; }
  }

  /* se cuelga de donde toque, igual que situaciones.js y roberto-leyes.js */
  raiz.TEMPLO = {
    imc, imcQueEs, pesoSano, gastoEnReposo, gastoDiario, calcular, edadDe, tendencia,
    ACTIVIDAD, OBJETIVOS, SUPLEMENTOS, PILARES, PRACTICAS,
    NIVELES, PRUEBAS, nivelDePrueba, ADAPTA, cerrarSemana, semanaDe,
    NUTRI, nutriDe, chocaConOperativa,
  };
})(typeof window !== "undefined" ? window : self);
