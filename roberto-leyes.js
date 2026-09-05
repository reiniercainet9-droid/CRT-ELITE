/* ══════════════════════════════════════════════════════════════════════════════
   📜 LAS LEYES DE ROBERTO — instalado el 05-09-2026
   ═════════════════════════════════════════════════════════════════════════════
   Catálogo de 86 leyes y principios (Pareto, drawdown, Kelly, Parkinson, Goodhart,
   hábitos, negocio…) que Rey preparó para que Roberto los APLIQUE solo, al contexto real,
   sin tener que pedírselos — y para que además se los ENSEÑE a él.

   ⚠️ DOS COSAS QUE NO SE PUEDEN CAMBIAR, Y EL PORQUÉ:
   1. NUNCA se inyectan las 86 de golpe. En cada consulta se eligen 2-6. Con las 86 delante,
      un modelo cita muchas y aplica ninguna: el valor está en la selección, no en el volumen.
   2. El bloque elegido va en el CONTEXTO del mensaje, NUNCA en el system prompt de Apex.
      El system de Roberto viaja con caché de 1 hora (su cerebro + el sistema); si se le pega
      algo que cambia en cada mensaje, la caché no pega NUNCA y Rey lo paga entero cada vez.
      Ya pasó: 5,44 dólares en un solo día, y por eso el contexto vivo va detrás de la marca.

   Este fichero es el del documento de Rey, con el motor y las leyes INTACTOS: solo se le
   quitaron los import/export, tal como indica el propio documento en su pie, porque Apex
   carga sus ficheros con <script src> y su vigilante con importScripts.
   ═════════════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  "use strict";

  // ============================================================================
  //  leyes-engine.js — Motor de leyes para Roberto (APEX Trading Desk)
  // ----------------------------------------------------------------------------
  //  Qué hace:
  //   1. Selecciona las 2-6 leyes relevantes al mensaje del usuario.
  //   2. Fuerza las leyes de supervivencia cuando detecta señales de riesgo
  //      (revancha, subir lote, recuperar pérdidas, saltarse reglas...).
  //   3. Devuelve un bloque de texto listo para inyectar en el system prompt.
  //
  //  Por qué no se inyectan las 86 leyes en cada llamada:
  //   - coste de tokens en cada mensaje;
  //   - y sobre todo: un modelo con 86 leyes delante cita muchas y aplica ninguna.
  //     El valor está en la selección, no en el volumen.
  //
  //  Sin dependencias. ES module. Para CommonJS ver el pie del archivo.
  // ============================================================================

  // ---------------------------------------------------------------------------
  // DATOS — 86 leyes. Para añadir una, copia el formato de una línea existente.
  // ---------------------------------------------------------------------------

  const LEYES = [
    {"id": 1, "n": "Principio de Pareto (Ley 80/20)", "b": "A", "e": "SÓLIDA como observación estadística", "q": "en la mayoría de sistemas, ~80% de los resultados provienen de ~20% de las causas. La distribución del esfuerzo y la del resultado no coinciden.", "p": "identificar lo poco que importa mucho, y matar lo mucho que importa poco.", "a": "filtrar la bitácora del CRT Elite PWA por setup, día de la semana y hora. Quedarse con el 20% de configuraciones que producen el 80% de R positivos. En REY Mobilidade: identificar los 2-3 clientes o rutas que generan el grueso de la facturación y protegerlos antes de buscar clientes nuevos.", "t": ["concentracion", "prioridad", "asimetria", "trading", "negocio"]},
    {"id": 2, "n": "Pareto al cuadrado (Ley 64/4)", "b": "A", "e": "ÚTIL", "q": "si aplicas 80/20 sobre sí mismo, el 4% de las causas produce el 64% de los resultados.", "p": "cuando el 20% sigue siendo demasiado ancho, cortar otra vez.", "a": "dentro del 20% de setups ganadores, encontrar el único patrón que genera la mayoría del beneficio y convertirlo en el setup A+ del día. Un solo setto ejecutado con perfección supera a cinco ejecutados a medias.", "t": ["concentracion", "prioridad", "asimetria"]},
    {"id": 3, "n": "Ley de Price (raíz cuadrada)", "b": "A", "e": "SÓLIDA en producción científica", "q": "la raíz cuadrada del total de participantes produce la mitad de la producción. De 100 personas, 10 hacen el 50%.", "p": "dimensionar cuán extrema es la concentración en cualquier grupo.", "a": "de 100 operaciones al trimestre, ~10 cargarán con la mitad del resultado. Por eso jamás recortar una ganadora que corre: podría ser una de esas 10.", "t": ["concentracion", "prioridad", "asimetria"]},
    {"id": 4, "n": "Ley de potencias (Power Law)", "b": "A", "e": "SÓLIDA", "q": "en sistemas de resultados abiertos, los extremos dominan el promedio. No hay \"resultado típico\".", "p": "entender por qué el promedio engaña y por qué la exposición al lado bueno importa más que la tasa de acierto.", "a": "una racha de 60% de acierto con R 1:1 pierde frente a 35% de acierto con R 1:4. Roberto debe evaluar el sistema por expectativa, nunca por winrate.", "t": ["concentracion", "prioridad", "asimetria"]},
    {"id": 5, "n": "Ley de Zipf", "b": "A", "e": "SÓLIDA", "q": "en muchos rankings naturales, el elemento nº2 vale la mitad del nº1, el nº3 un tercio, etc.", "p": "anticipar que ser el primero en algo vale desproporcionadamente más que ser el tercero.", "a": "en Timbó, ser \"el motoboy que todos recuerdan primero\" vale más que ser uno de los cinco disponibles. Invertir en recordación de marca, no solo en precio.", "t": ["concentracion", "prioridad", "asimetria"]},
    {"id": 6, "n": "Cola larga (Long Tail)", "b": "A", "e": "ÚTIL", "q": "la suma de muchos elementos pequeños puede rivalizar con la de los pocos grandes cuando el costo de servirlos es bajo.", "p": "contrapeso al 80/20; evita descartar lo pequeño cuando escalarlo es barato.", "a": "30 clientes pequeños de entregas puntuales pueden estabilizar el ingreso mejor que 2 contratos grandes que pueden irse de golpe.", "t": ["concentracion", "prioridad", "asimetria"]},
    {"id": 7, "n": "Ley de rendimientos decrecientes", "b": "A", "e": "SÓLIDA", "q": "pasado cierto punto, cada unidad extra de esfuerzo produce menos resultado.", "p": "saber cuándo parar en lugar de insistir.", "a": "la operación nº4 del día casi siempre rinde menos que la nº1. La sesión Pre-NY tiene su punto óptimo; después, cada hora frente a la pantalla resta.", "t": ["concentracion", "prioridad", "asimetria", "trading", "fatiga"]},
    {"id": 8, "n": "Ley de Illich (contraproductividad)", "b": "A", "e": "ÚTIL", "q": "más allá de cierto umbral, el esfuerzo adicional no solo rinde menos: rinde negativo.", "p": "detectar el punto donde seguir trabajando destruye lo hecho.", "a": "operar después del límite diario no reduce la ganancia, la revierte. Regla dura: cerrar plataforma al alcanzar el máximo de operaciones configurado en APEX.", "t": ["concentracion", "prioridad", "asimetria", "trading", "fatiga", "sobreoperacion"]},
    {"id": 9, "n": "Efecto Mateo (acumulación de ventaja)", "b": "A", "e": "SÓLIDA", "q": "quien ya tiene, recibe más. Las ventajas iniciales se componen.", "p": "justificar la paciencia en las fases iniciales y la reinversión temprana.", "a": "las primeras cuentas fondeadas valen más por el historial que construyen que por el dinero que dan. Cada mes de consistencia documentada abre cuentas mayores.", "t": ["concentracion", "prioridad", "asimetria"]},
    {"id": 10, "n": "Ley de Lindy", "b": "A", "e": "ÚTIL", "q": "en cosas no perecederas (ideas, tecnologías, métodos), la esperanza de vida futura es proporcional a la edad actual. Lo que lleva 30 años funcionando probablemente dure otros 30.", "p": "filtrar modas de fundamentos.", "a": "gestión de riesgo, liquidez y estructura de mercado son Lindy. El indicador nuevo de moda en YouTube no lo es. Roberto debe pesar así cualquier propuesta de cambio al sistema.", "t": ["concentracion", "prioridad", "asimetria"]},
    {"id": 11, "n": "Ley de Parkinson", "b": "B", "e": "ÚTIL", "q": "el trabajo se expande hasta llenar el tiempo disponible.", "p": "obtener resultado poniendo plazos artificialmente cortos.", "a": "el análisis top-down (Daily → H4 → M15 → M5) se hace en 25 minutos con cronómetro. Sin límite, se convierte en 2 horas de justificación de una entrada que no existe.", "t": ["tiempo", "ejecucion", "productividad", "analisis", "trading"]},
    {"id": 12, "n": "Segunda Ley de Parkinson (finanzas)", "b": "B", "e": "ÚTIL", "q": "los gastos aumentan hasta consumir los ingresos, sin importar cuánto crezcan estos.", "p": "blindar el crecimiento patrimonial contra el estilo de vida.", "a": "definir de antemano qué % de cada retiro de FundedNext y de la facturación del delivery se aparta antes de gastar. Si el ingreso sube y el % no está fijado, el patrimonio no sube.", "t": ["tiempo", "ejecucion", "productividad", "dinero", "gasto"]},
    {"id": 13, "n": "Ley de Hofstadter", "b": "B", "e": "ÚTIL", "q": "todo tarda más de lo esperado, incluso contando con esta ley.", "p": "planificar con colchón y no frustrarse.", "a": "multiplicar por 1.5 los plazos autoimpuestos para pasar desafíos, terminar PWAs o conseguir clientes. La frustración por plazos irreales es una causa mayor de sobreoperación.", "t": ["tiempo", "ejecucion", "productividad"]},
    {"id": 14, "n": "Ley de Carlson (trabajo interrumpido)", "b": "B", "e": "ÚTIL", "q": "una tarea hecha de forma continua cuesta menos tiempo y energía que la misma tarea fragmentada.", "p": "proteger bloques de concentración.", "a": "durante la killzone, celular en silencio y sin pedidos de delivery aceptados. Una sola interrupción durante el barrido de liquidez es suficiente para provocar la entrada prematura.", "t": ["tiempo", "ejecucion", "productividad", "trading", "concentracion", "killzone"]},
    {"id": 15, "n": "Ley de Laborit (del menor esfuerzo)", "b": "B", "e": "ÚTIL", "q": "el cerebro tiende naturalmente a hacer primero lo agradable y fácil, y a posponer lo difícil.", "p": "explicar la procrastinación estructural y ordenar el día al revés.", "a": "revisar los trades perdedores del día anterior antes de mirar gráficos nuevos. Lo que da placer (buscar entradas) siempre gana a lo que da resultado (auditar errores) si no se fuerza el orden.", "t": ["tiempo", "ejecucion", "productividad", "procrastinacion", "journal"]},
    {"id": 16, "n": "Ley de Fraisse (tiempo subjetivo)", "b": "B", "e": "ÚTIL", "q": "el tiempo se percibe según el interés: una hora placentera pasa volando, una desagradable se eterniza.", "p": "desconfiar de la sensación de \"llevo poco tiempo operando\".", "a": "medir la sesión con reloj real, no con sensación. El contador de tiempo en pantalla del APEX Desk es lo que decide, no la percepción.", "t": ["tiempo", "ejecucion", "productividad"]},
    {"id": 17, "n": "Matriz de Eisenhower", "b": "B", "e": "ÚTIL", "q": "clasificar tareas en urgente/no urgente × importante/no importante. Lo importante-no urgente es lo que construye el futuro y es lo primero que se sacrifica.", "p": "dejar de vivir apagando incendios.", "a": "backtesting, formación y sistematización del negocio son importantes-no urgentes. Deben tener hora fija en la agenda, o nunca ocurren.", "t": ["tiempo", "ejecucion", "productividad", "prioridad", "agenda"]},
    {"id": 18, "n": "Regla de los 2 minutos (GTD)", "b": "B", "e": "ÚTIL", "q": "si una tarea toma menos de 2 minutos, hazla ya en vez de anotarla.", "p": "evitar la acumulación de fricción mental.", "a": "registrar el trade en la bitácora inmediatamente al cerrarlo. Un journal completado a posteriori es un journal falsificado por la memoria.", "t": ["tiempo", "ejecucion", "productividad"]},
    {"id": 19, "n": "Regla 1-3-5", "b": "B", "e": "ÚTIL", "q": "planifica el día como 1 tarea grande, 3 medianas y 5 pequeñas. Nada más.", "p": "listas de tareas realistas.", "a": "1 grande (sesión de trading o captación de clientes), 3 medianas (entrenamiento, backtest, administración), 5 chicas. Todo lo demás pasa a mañana.", "t": ["tiempo", "ejecucion", "productividad"]},
    {"id": 20, "n": "Bloques de trabajo (Pomodoro y variantes)", "b": "B", "e": "ÚTIL", "q": "trabajo en bloques cronometrados con descanso obligatorio sostiene mejor la atención que el esfuerzo continuo.", "p": "mantener calidad de decisión durante horas.", "a": "en sesiones largas de backtest, 45/10. La fatiga de decisión es la que rompe las reglas al final del día, no la ignorancia.", "t": ["tiempo", "ejecucion", "productividad"]},
    {"id": 21, "n": "Efecto Zeigarnik", "b": "B", "e": "SÓLIDA, con matices", "q": "las tareas incompletas ocupan la memoria y generan tensión hasta cerrarse.", "p": "explicar por qué un trade abierto sin plan consume toda tu cabeza.", "a": "definir SL, TP y criterio de salida antes de entrar. Una posición sin plan de salida secuestra la atención y provoca decisiones emocionales.", "t": ["tiempo", "ejecucion", "productividad", "trading", "emocion"]},
    {"id": 22, "n": "Ley de Yerkes-Dodson", "b": "B", "e": "SÓLIDA", "q": "el rendimiento mejora con la activación hasta un punto óptimo; pasado ese punto, cae. La curva es una U invertida, y para tareas complejas el óptimo es bajo.", "p": "regular la intensidad emocional antes de operar.", "a": "operar con demasiada activación (después de una pérdida, con prisa por pasar el desafío) degrada la ejecución justo en la tarea más compleja. Chequeo previo: pulso y estado, no solo gráfico.", "t": ["tiempo", "ejecucion", "productividad", "trading", "emocion", "fatiga"]},
    {"id": 23, "n": "Interés compuesto", "b": "C", "e": "SÓLIDA — matemática", "q": "el crecimiento sobre el crecimiento es exponencial; el tiempo pesa más que la tasa.", "p": "entender que la consistencia mediocre sostenida vence al desempeño brillante intermitente.", "a": "3% mensual compuesto sobre cuentas cada vez mayores construye más que un 30% seguido de una quema de cuenta. El objetivo no es el mes, es la curva.", "t": ["dinero", "riesgo", "capital", "crecimiento", "paciencia"]},
    {"id": 24, "n": "Regla del 72", "b": "C", "e": "SÓLIDA — matemática", "q": "72 dividido por la tasa de rendimiento anual (%) da los años que tarda el capital en duplicarse.", "p": "calcular duplicaciones de cabeza, sin calculadora.", "a": "al 12% anual, duplicas en 6 años. Sirve para juzgar rápido si una \"oportunidad de negocio\" ofrecida vale su riesgo.", "t": ["dinero", "riesgo", "capital"]},
    {"id": 25, "n": "Regla 50/30/20 (presupuesto)", "b": "C", "e": "ÚTIL", "q": "50% necesidades, 30% deseos, 20% ahorro/inversión.", "p": "estructura de partida para ordenar el flujo personal.", "a": "en fase de construcción de capital, invertir el orden hacia 50/20/30 y tratar el ahorro como una factura no negociable.", "t": ["dinero", "riesgo", "capital"]},
    {"id": 26, "n": "Regla del 4% (tasa de retiro)", "b": "C", "e": "ÚTIL — debatida", "q": "retirar ~4% anual de una cartera diversificada tiene alta probabilidad de no agotarla en 30 años. Implica necesitar ~25× el gasto anual para vivir del capital.", "p": "poner número al objetivo de libertad financiera.", "a": "convierte \"quiero manejar grandes capitales\" en una cifra concreta y verificable en vez de una aspiración difusa.", "t": ["dinero", "riesgo", "capital"]},
    {"id": 27, "n": "Págate primero", "b": "C", "e": "ÚTIL", "q": "aparta el ahorro/inversión al recibir el ingreso, no con lo que sobre.", "p": "neutralizar la segunda ley de Parkinson.", "a": "transferencia automática el día del retiro de FundedNext y el día del cierre de caja del delivery.", "t": ["dinero", "riesgo", "capital"]},
    {"id": 28, "n": "Costo de oportunidad", "b": "C", "e": "SÓLIDA", "q": "el costo real de algo es lo mejor que dejas de hacer por hacerlo.", "p": "evaluar decisiones contra alternativas, no contra cero.", "a": "una hora extra frente al gráfico buscando setups mediocres cuesta una hora de captación de clientes o de backtest. Roberto debe plantear siempre \"¿contra qué?\".", "t": ["dinero", "riesgo", "capital", "decision", "tiempo"]},
    {"id": 29, "n": "Falacia del costo hundido", "b": "C", "e": "SÓLIDA", "q": "lo ya gastado (dinero, tiempo, esfuerzo) es irrecuperable y no debe influir en la decisión siguiente.", "p": "salir a tiempo.", "a": "\"ya llevo 3 horas esperando este setup, tengo que operar algo\" es la falacia en estado puro. Las horas ya se fueron operes o no.", "t": ["dinero", "riesgo", "capital", "trading", "decision", "salir"]},
    {"id": 30, "n": "Aversión a la pérdida", "b": "C", "e": "SÓLIDA", "q": "el dolor de perder pesa psicológicamente alrededor del doble que el placer de ganar lo mismo.", "p": "explicar por qué cortas ganadoras y dejas correr perdedoras.", "a": "el patrón exacto que destruye la expectativa del sistema. Antídoto mecánico: salidas predefinidas y parciales por regla, no por sensación.", "t": ["dinero", "riesgo", "capital", "trading", "emocion", "sesgos"]},
    {"id": 31, "n": "Matemática del drawdown (asimetría de recuperación)", "b": "C", "e": "SÓLIDA — matemática", "q": "perder 10% exige ganar 11% para volver; perder 25% exige 33%; perder 50% exige 100%; perder 90% exige 900%.", "p": "demostrar que defender el capital rinde más que atacarlo.", "a": "la ley más importante del catálogo para él. Toda regla de riesgo de FundedNext existe por esta matemática. Roberto debe recitarla cada vez que Rey proponga subir tamaño o recuperar pérdidas.", "t": ["dinero", "riesgo", "capital", "trading", "drawdown", "supervivencia"]},
    {"id": 32, "n": "Ruina del jugador", "b": "C", "e": "SÓLIDA — matemática", "q": "con capital finito y apuestas repetidas, incluso con ventaja positiva, un tamaño de apuesta demasiado grande lleva a la quiebra con probabilidad alta.", "p": "entender que tener un sistema ganador no basta si el sizing es agresivo.", "a": "un sistema con expectativa positiva y 10% de riesgo por trade quiebra igual. El límite de riesgo configurado en APEX no es prudencia, es supervivencia matemática.", "t": ["dinero", "riesgo", "capital", "trading", "sizing", "supervivencia"]},
    {"id": 33, "n": "Ley de los grandes números", "b": "C", "e": "SÓLIDA", "q": "la frecuencia observada converge a la probabilidad real solo con muestras grandes. En muestras pequeñas, todo es ruido.", "p": "no juzgar el sistema por 10 operaciones.", "a": "mínimo 100 operaciones bajo reglas idénticas antes de concluir nada. Roberto debe rechazar cualquier cambio de sistema basado en una semana mala.", "t": ["dinero", "riesgo", "capital", "trading", "muestra", "estadistica"]},
    {"id": 34, "n": "Criterio de Kelly (y Kelly fraccional)", "b": "C", "e": "SÓLIDA — matemática", "q": "existe un tamaño de posición matemáticamente óptimo en función de la ventaja y la razón riesgo/beneficio. Pasarse de ese tamaño reduce el crecimiento a largo plazo aunque la ventaja sea real. En la práctica se usa 1/4 o 1/2 de Kelly por incertidumbre en los parámetros.", "p": "poner el sizing en el terreno del cálculo, no de la confianza.", "a": "el impulso de \"duplicar tamaño porque estoy en racha\" es exactamente lo que Kelly prohíbe. La ventaja no cambió; la muestra sí es pequeña.", "t": ["dinero", "riesgo", "capital", "trading", "sizing", "racha"]},
    {"id": 35, "n": "Margen de seguridad (Graham)", "b": "C", "e": "ÚTIL", "q": "actúa siempre con un colchón entre tu estimación y el punto de fallo, porque tu estimación estará equivocada.", "p": "diseñar con tolerancia al error.", "a": "operar con un límite de pérdida diaria más estricto que el de FundedNext. Si la firma permite X, Rey opera a 0.6X. El margen es la diferencia entre un mal día y una cuenta perdida.", "t": ["dinero", "riesgo", "capital", "trading", "propfirm", "supervivencia"]},
    {"id": 36, "n": "Reglas de Buffett", "b": "C", "e": "ÚTIL", "q": "regla 1, no perder dinero; regla 2, no olvidar la regla 1.", "p": "jerarquía mental: preservación antes que rendimiento.", "a": "en fase de cuentas fondeadas, el objetivo primario no es ganar, es no ser descalificado. Sobrevivir es lo que abre cuentas mayores.", "t": ["dinero", "riesgo", "capital", "trading", "supervivencia"]},
    {"id": 37, "n": "Ley de Gresham", "b": "C", "e": "SÓLIDA — histórica", "q": "el dinero malo desplaza al bueno; la gente gasta la moneda débil y atesora la fuerte.", "p": "entender comportamiento monetario en economías con inflación o dos monedas.", "a": "aplica a la decisión de en qué moneda o activo mantener el capital de reserva del negocio.", "t": ["dinero", "riesgo", "capital"]},
    {"id": 38, "n": "Esperanza matemática (expectancy)", "b": "D", "e": "SÓLIDA", "q": "Expectativa = (%acierto × ganancia media) − (%fallo × pérdida media). Es el único número que dice si un sistema gana.", "p": "juzgar el sistema con evidencia, no con sensaciones.", "a": "métrica central del CRT Elite PWA. Toda decisión de mantener, ajustar o descartar un setup se toma contra este número, medido en R.", "t": ["trading", "riesgo", "disciplina", "metricas", "sistema"]},
    {"id": 39, "n": "Riesgo fijo por operación (regla del 1%)", "b": "D", "e": "ÚTIL, derivada de 31 y 32", "q": "arriesgar un porcentaje fijo y pequeño del capital por operación.", "p": "hacer imposible que una operación o una racha destruyan la cuenta.", "a": "ya configurado en APEX. La regla no es el número: es que no se toca nunca, ni en el setup más obvio de la vida.", "t": ["trading", "riesgo", "disciplina", "sizing", "supervivencia"]},
    {"id": 40, "n": "Límite de pérdida diaria (circuit breaker)", "b": "D", "e": "ÚTIL", "q": "un tope de pérdida diaria que corta la sesión automáticamente.", "p": "cortar la espiral de revancha, que es donde se pierden las cuentas.", "a": "al tocar el límite, plataforma cerrada. Sin excepción, sin \"una última\". El límite existe precisamente para el día en que lo quieras romper.", "t": ["trading", "riesgo", "disciplina", "revancha", "emocion"]},
    {"id": 41, "n": "Regla del error único", "b": "D", "e": "ÚTIL", "q": "una violación de proceso termina el día de operativa, gane o pierda dinero.", "p": "penalizar el proceso incorrecto, no solo el resultado negativo.", "a": "ataca directo su debilidad. Si entra antes de que la liquidez se barra por completo, el día se acaba aunque el trade gane. Ganar con mal proceso es el refuerzo más destructivo que existe.", "t": ["trading", "riesgo", "disciplina", "proceso", "entrada prematura"]},
    {"id": 42, "n": "Refuerzo aleatorio (random reinforcement)", "b": "D", "e": "SÓLIDA — psicología", "q": "cuando la recompensa aparece de forma impredecible, el cerebro aprende y consolida conductas equivocadas con enorme fuerza. Es el mecanismo de la máquina tragamonedas.", "p": "explicar por qué un trade impulsivo ganador te vuelve peor trader.", "a": "Roberto debe marcar explícitamente todo trade ganador ejecutado fuera de reglas como fallo, no como acierto. Esta es la ley que protege la disciplina a largo plazo.", "t": ["trading", "riesgo", "disciplina", "proceso", "emocion"]},
    {"id": 43, "n": "Ley de Goodhart", "b": "D", "e": "SÓLIDA", "q": "cuando una medida se convierte en objetivo, deja de ser una buena medida.", "p": "evitar que las métricas corrompan el comportamiento.", "a": "si el objetivo es \"ganar X% este mes para pasar el desafío\", empezará a forzar entradas para llegar al número. El objetivo debe ser el cumplimiento de proceso; el % es una consecuencia.", "t": ["trading", "riesgo", "disciplina", "metricas", "propfirm", "objetivos"]},
    {"id": 44, "n": "Ley de Campbell", "b": "D", "e": "SÓLIDA", "q": "cuanto más se usa un indicador para tomar decisiones, más presión hay para distorsionarlo.", "p": "proteger la honestidad de la propia bitácora.", "a": "cuidado con maquillar el journal (\"ese no lo cuento\"). Una bitácora corrompida vale menos que ninguna.", "t": ["trading", "riesgo", "disciplina", "journal", "metricas", "honestidad"]},
    {"id": 45, "n": "Tamaño mínimo de muestra", "b": "D", "e": "SÓLIDA", "q": "las conclusiones sobre un sistema requieren decenas o cientos de operaciones bajo reglas idénticas.", "p": "frenar los cambios de sistema por emoción.", "a": "ningún cambio a CRT-ELITE se aprueba con menos de 100 trades de evidencia. Roberto debe pedir la muestra antes de opinar.", "t": ["trading", "riesgo", "disciplina", "muestra", "estadistica", "cambios"]},
    {"id": 46, "n": "\"Sin barrida, no hay setup\" (regla propia de Rey)", "b": "D", "e": "ÚTIL — regla de sistema", "q": "sin liquidación previa de liquidez, no existe la configuración.", "p": "es su filtro de mayor valor y su punto débil simultáneo.", "a": "debe verificarse en checklist explícito antes de armar la orden, no mientras el precio se mueve. Roberto debe preguntarlo literalmente en cada consulta de entrada.", "t": ["trading", "riesgo", "disciplina", "entrada prematura", "liquidez", "checklist"]},
    {"id": 47, "n": "Estrategia barbell y antifragilidad (Taleb)", "b": "D", "e": "ÚTIL", "q": "combinar una parte muy conservadora con una parte de riesgo pequeño y alto potencial, evitando el medio ambiguo. Antifrágil es lo que mejora con el desorden, no solo lo que lo resiste.", "p": "estructurar exposición a lo impredecible.", "a": "capital estable del delivery en un extremo, riesgo acotado del trading en el otro. Nunca comprometer el ingreso base para financiar el especulativo.", "t": ["trading", "riesgo", "disciplina", "negocio", "capital"]},
    {"id": 48, "n": "Cisne negro", "b": "D", "e": "SÓLIDA", "q": "los eventos raros, imprevisibles y de impacto enorme dominan la historia y se racionalizan solo después.", "p": "no diseñar suponiendo que mañana se parece a ayer.", "a": "gaps de fin de semana, noticias imprevistas, cierre de la prop firm. Nunca posiciones abiertas sin stop, nunca todo el capital en una sola firma.", "t": ["trading", "riesgo", "disciplina", "imprevisto"]},
    {"id": 49, "n": "Ley de Metcalfe", "b": "E", "e": "ÚTIL", "q": "el valor de una red crece aproximadamente con el cuadrado de sus nodos.", "p": "priorizar conexiones sobre transacciones.", "a": "cada comercio de Timbó que entra a REY Mobilidade no suma uno: multiplica por referencias cruzadas. Enfocar la captación en nodos conectados (asociaciones comerciales, grupos de comerciantes).", "t": ["negocio", "sistemas", "escala", "marketing", "clientes", "delivery"]},
    {"id": 50, "n": "Ley de Moore", "b": "E", "e": "SÓLIDA — histórica", "q": "la capacidad de cómputo se duplicó cada ~2 años a costo constante durante décadas.", "p": "entender por qué construir herramientas propias es cada vez más barato.", "a": "lo que hoy cuesta programar (PWAs, indicadores) costará menos mañana. Su hábito de construir herramientas propias es una ventaja creciente.", "t": ["negocio", "sistemas", "escala"]},
    {"id": 51, "n": "Ley de Amara", "b": "E", "e": "ÚTIL", "q": "sobreestimamos el efecto de una tecnología a corto plazo y lo subestimamos a largo plazo.", "p": "calibrar expectativas y no abandonar temprano.", "a": "aplica a su aprendizaje de programación y a la automatización de APEX. Meses 1-3 decepcionan; años 1-3 transforman.", "t": ["negocio", "sistemas", "escala", "programacion", "paciencia"]},
    {"id": 52, "n": "Teoría de restricciones (Goldratt)", "b": "E", "e": "SÓLIDA", "q": "todo sistema tiene un cuello de botella; mejorar cualquier otra parte no aumenta el rendimiento global.", "p": "dirigir el esfuerzo al punto que sí mueve la aguja.", "a": "si su cuello de botella es la ejecución emocional, aprender tres indicadores nuevos no cambia nada. Roberto debe identificar y nombrar el cuello de botella actual en cada revisión mensual.", "t": ["negocio", "sistemas", "escala", "diagnostico", "prioridad"]},
    {"id": 53, "n": "Ley de Little", "b": "E", "e": "SÓLIDA — matemática", "q": "en un sistema estable, trabajo en curso = tasa de llegada × tiempo de permanencia.", "p": "dimensionar capacidad real de entregas o proyectos.", "a": "cuántos pedidos simultáneos puede aceptar sin degradar el tiempo de entrega. Aceptar más pedidos de los que el sistema soporta destruye la reputación, que es el activo real.", "t": ["negocio", "sistemas", "escala", "delivery", "capacidad"]},
    {"id": 54, "n": "Ley de Gall", "b": "E", "e": "ÚTIL", "q": "todo sistema complejo que funciona evolucionó desde un sistema simple que funcionaba. Los complejos diseñados desde cero fracasan.", "p": "construir por iteración.", "a": "APEX y CARGA deben crecer módulo a módulo desde algo que ya funciona. Nada de reescrituras totales.", "t": ["negocio", "sistemas", "escala", "programacion", "pwa", "producto"]},
    {"id": 55, "n": "Ley de Brooks", "b": "E", "e": "ÚTIL", "q": "añadir gente a un proyecto retrasado lo retrasa más.", "p": "resistir la tentación de \"meter más recursos\".", "a": "aplica al contratar el primer motoboy: la coordinación cuesta tiempo antes de ahorrarlo. Prepara el proceso antes de sumar personas.", "t": ["negocio", "sistemas", "escala", "contratar", "equipo"]},
    {"id": 56, "n": "Ley de Conway", "b": "E", "e": "SÓLIDA", "q": "los sistemas reflejan la estructura de comunicación de quien los diseña.", "p": "entender que tu sistema hereda tu desorden mental.", "a": "si su proceso de trading está mentalmente difuso, el PWA saldrá difuso. Primero claridad en la regla, después el código.", "t": ["negocio", "sistemas", "escala", "programacion", "claridad"]},
    {"id": 57, "n": "Ley de Dunbar", "b": "E", "e": "ÚTIL — debatida", "q": "existe un límite cognitivo de relaciones estables que una persona puede sostener (~150).", "p": "dimensionar redes reales de negocio.", "a": "150 comercios con relación real en Timbó es más que suficiente para saturar la operación. Profundidad antes que alcance.", "t": ["negocio", "sistemas", "escala", "clientes", "red"]},
    {"id": 58, "n": "Ley de Sturgeon", "b": "E", "e": "ÚTIL", "q": "el 90% de todo es mediocre.", "p": "filtrar agresivamente contenido, cursos, señales y consejos.", "a": "aplica al material de trading que consume. Y explica por qué ser el 10% bueno del delivery local es una ventaja alcanzable.", "t": ["negocio", "sistemas", "escala", "filtro", "contenido"]},
    {"id": 59, "n": "Principios de influencia (Cialdini)", "b": "E", "e": "SÓLIDA", "q": "seis palancas de persuasión: reciprocidad, compromiso/coherencia, prueba social, autoridad, simpatía y escasez.", "p": "diseñar captación de clientes con base psicológica en vez de intuición.", "a": "para REY Mobilidade — primer envío de cortesía (reciprocidad), testimonios visibles de comercios locales (prueba social), disponibilidad limitada en horas pico (escasez).", "t": ["negocio", "sistemas", "escala", "marketing", "clientes", "delivery", "persuasion"]},
    {"id": 60, "n": "Regla del pico-final (peak-end rule)", "b": "E", "e": "SÓLIDA", "q": "la gente recuerda una experiencia por su momento más intenso y por su final, no por el promedio.", "p": "diseñar el servicio donde importa.", "a": "la entrega final y el trato al cerrar definen el recuerdo del cliente. Invertir ahí, no en el promedio del recorrido.", "t": ["negocio", "sistemas", "escala", "clientes", "servicio", "delivery"]},
    {"id": 61, "n": "Las cuatro leyes del cambio de hábitos (Clear)", "b": "F", "e": "ÚTIL", "q": "para crear un hábito: hazlo obvio, atractivo, sencillo y satisfactorio. Para romperlo, invierte las cuatro.", "p": "diseñar la conducta por entorno en vez de por fuerza de voluntad.", "a": "checklist visible al abrir la plataforma (obvio), ejecutarla en 60 segundos (sencilla), racha registrada en la app (satisfactoria).", "t": ["habitos", "cuerpo", "crecimiento", "disciplina", "checklist", "rutina"]},
    {"id": 62, "n": "Ley del efecto (Thorndike)", "b": "F", "e": "SÓLIDA", "q": "las conductas seguidas de consecuencias satisfactorias se repiten; las seguidas de consecuencias negativas se extinguen.", "p": "base de todo condicionamiento, incluido el propio.", "a": "conecta directo con el refuerzo aleatorio (42). Si celebra las ganancias sin distinguir el proceso, entrena la indisciplina.", "t": ["habitos", "cuerpo", "crecimiento", "disciplina", "refuerzo"]},
    {"id": 63, "n": "Regla de los dos días", "b": "F", "e": "ÚTIL", "q": "nunca fallar dos veces seguidas. Un fallo es un accidente; dos es el inicio de un nuevo hábito.", "p": "proteger rachas sin exigir perfección.", "a": "aplica al plan de 12 semanas de CARGA y al journal diario. Falló un día, el siguiente es innegociable.", "t": ["habitos", "cuerpo", "crecimiento", "racha", "rutina", "gimnasio"]},
    {"id": 64, "n": "Formación de hábitos: 21 días vs. ~66", "b": "F", "e": "FOLCLORE lo primero / SÓLIDA lo segundo", "q": "los \"21 días\" son un mito derivado de una observación clínica malinterpretada. La investigación de Lally encontró una mediana de ~66 días, con rango muy amplio (18 a 254) según la complejidad del hábito.", "p": "expectativas realistas para no abandonar en la semana 4.", "a": "Roberto debe corregirlo si Rey planifica con la cifra de 21 días.", "t": ["habitos", "cuerpo", "crecimiento", "rutina", "expectativas"]},
    {"id": 65, "n": "Kaizen / regla del 1%", "b": "F", "e": "ÚTIL como marco, la aritmética es ilustrativa", "q": "mejorar 1% diario compuesto da ~37× en un año (1.01^365). Es una metáfora del compuesto, no una promesa literal.", "p": "valorar el avance pequeño y sostenido.", "a": "una regla mejorada por semana en CRT-ELITE supera cualquier intento de rediseño total del sistema.", "t": ["habitos", "cuerpo", "crecimiento", "mejora", "iteracion"]},
    {"id": 66, "n": "Práctica deliberada (y el mito de las 10.000 horas)", "b": "F", "e": "SÓLIDA la primera / FOLCLORE la cifra", "q": "lo que produce maestría es la práctica deliberada — con retroalimentación inmediata, en el límite de la capacidad y sobre errores específicos — no la acumulación de horas. La cifra de 10.000 horas es una popularización distorsionada del trabajo de Ericsson.", "p": "convertir horas de pantalla en aprendizaje real.", "a": "200 backtests con revisión de errores enseñan más que 2.000 horas mirando gráficos en vivo. Roberto debe orientar hacia práctica con feedback.", "t": ["habitos", "cuerpo", "crecimiento", "aprendizaje", "backtest", "practica"]},
    {"id": 67, "n": "Sobrecarga progresiva", "b": "F", "e": "SÓLIDA", "q": "la adaptación física requiere aumento gradual y sistemático del estímulo.", "p": "progresar sin lesionarse.", "a": "núcleo del plan de 12 semanas. Es también la metáfora exacta del crecimiento de cuentas: subir capital solo cuando el nivel anterior está dominado.", "t": ["habitos", "cuerpo", "crecimiento", "gimnasio", "progresion", "escalar"]},
    {"id": 68, "n": "Principio SAID (adaptación específica)", "b": "F", "e": "SÓLIDA", "q": "el cuerpo se adapta específicamente a la demanda impuesta. Entrenas lo que practicas.", "p": "alinear entrenamiento con objetivo.", "a": "si opera la killzone Pre-NY, debe entrenar y backtestear esa ventana, no otras. La especificidad es lo que crea la competencia.", "t": ["habitos", "cuerpo", "crecimiento", "gimnasio", "especificidad", "backtest"]},
    {"id": 69, "n": "Supercompensación y recuperación", "b": "F", "e": "SÓLIDA", "q": "la mejora ocurre en el descanso posterior al estímulo, no durante el estímulo.", "p": "legitimar el descanso como parte del rendimiento.", "a": "días sin operar y sin gimnasio son productivos. Igual que el músculo, la disciplina se degrada con fatiga acumulada.", "t": ["habitos", "cuerpo", "crecimiento", "descanso", "fatiga", "gimnasio"]},
    {"id": 70, "n": "Regla del 10% (progresión de carga)", "b": "F", "e": "ÚTIL — evidencia mixta", "q": "no aumentar el volumen semanal más de ~10%.", "p": "heurística contra lesiones por progresión rápida.", "a": "aplicable al entrenamiento y, por analogía, al aumento de tamaño de posición o de carga de trabajo del negocio.", "t": ["habitos", "cuerpo", "crecimiento", "gimnasio", "progresion"]},
    {"id": 71, "n": "Regla del 40% (Goggins)", "b": "F", "e": "FOLCLORE", "q": "cuando la mente dice que estás acabado, has usado solo el 40% de tu capacidad.", "p": "motivación en momentos de rendición; no tiene base fisiológica medida.", "a": "útil como frase de empuje. Peligrosa si se usa para justificar operar fatigado o entrenar lesionado. Roberto debe presentarla siempre con esa advertencia.", "t": ["habitos", "cuerpo", "crecimiento", "motivacion", "fatiga"]},
    {"id": 72, "n": "Navaja de Ockham", "b": "G", "e": "ÚTIL", "q": "entre explicaciones que encajan igual con los hechos, prefiere la más simple.", "p": "", "a": "si perdió, la explicación más probable no es \"manipulación del broker\", es \"entrada prematura otra vez\".", "t": ["decision", "pensamiento", "sesgos"]},
    {"id": 73, "n": "Navaja de Hanlon", "b": "G", "e": "ÚTIL", "q": "no atribuyas a malicia lo que se explica por descuido o incompetencia.", "p": "", "a": "evita la narrativa paranoica sobre el mercado o las prop firms, que impide corregir el error propio.", "t": ["decision", "pensamiento", "sesgos"]},
    {"id": 74, "n": "Valla de Chesterton", "b": "G", "e": "ÚTIL", "q": "no elimines una regla hasta entender por qué se puso.", "p": "", "a": "antes de quitar cualquier filtro de APEX, revisar en la bitácora qué pérdida lo originó.", "t": ["decision", "pensamiento", "sesgos", "reglas", "sistema", "cambios"]},
    {"id": 75, "n": "Inversión (Jacobi: \"invierte, siempre invierte\")", "b": "G", "e": "ÚTIL", "q": "en vez de preguntar cómo lograr algo, pregunta qué lo garantizaría el fracaso, y evita eso.", "p": "", "a": "\"¿Cómo destruyo esta cuenta en 30 días?\" es más productivo que \"¿cómo la duplico?\". La lista resultante es su manual de reglas.", "t": ["decision", "pensamiento", "sesgos", "riesgo", "blindaje", "diagnostico"]},
    {"id": 76, "n": "Círculo de competencia", "b": "G", "e": "ÚTIL", "q": "opera solo donde tu conocimiento es real; el borde importa más que el tamaño.", "p": "", "a": "EUR/USD y GBP/USD en su ventana. Cada par o sesión nueva sale del círculo y baja la expectativa.", "t": ["decision", "pensamiento", "sesgos", "trading", "pares", "alcance"]},
    {"id": 77, "n": "Regla 10/10/10", "b": "G", "e": "ÚTIL", "q": "ante una decisión, pregunta cómo la verás en 10 minutos, 10 meses y 10 años.", "p": "", "a": "desactiva decisiones impulsivas de revancha. En 10 minutos alivia; en 10 meses arruina la curva.", "t": ["decision", "pensamiento", "sesgos", "emocion", "revancha", "impulso"]},
    {"id": 78, "n": "Puertas de una vía y de dos vías (Bezos)", "b": "G", "e": "ÚTIL", "q": "las decisiones reversibles se toman rápido; las irreversibles, despacio y con datos.", "p": "", "a": "probar un formato de anuncio es de dos vías (rápido). Retirar capital para financiar otra cuenta es de una vía (lento).", "t": ["decision", "pensamiento", "sesgos", "negocio", "capital"]},
    {"id": 79, "n": "Minimización del arrepentimiento", "b": "G", "e": "ÚTIL", "q": "decide proyectándote a los 80 años y minimizando lo que lamentarás no haber intentado.", "p": "", "a": "marco para decisiones grandes de vida y negocio, no para decisiones operativas del día.", "t": ["decision", "pensamiento", "sesgos"]},
    {"id": 80, "n": "Efecto Dunning-Kruger", "b": "G", "e": "ÚTIL — el estudio original está muy discutido", "q": "los menos competentes tienden a sobreestimar su nivel porque les falta el criterio para evaluarse.", "p": "", "a": "la sensación de \"ya domino el sistema\" tras un mes bueno es la señal de alarma, no la de graduación.", "t": ["decision", "pensamiento", "sesgos", "ego", "aprendizaje"]},
    {"id": 81, "n": "Sesgo de supervivencia", "b": "G", "e": "SÓLIDA", "q": "solo ves a los que llegaron; los que fracasaron con la misma estrategia son invisibles.", "p": "", "a": "crítico para redes sociales de trading. Por cada cuenta fondeada que se muestra, hay cientos quemadas que no se publican.", "t": ["decision", "pensamiento", "sesgos", "redes sociales", "trading", "expectativas"]},
    {"id": 82, "n": "Sesgo de confirmación", "b": "G", "e": "SÓLIDA", "q": "buscamos e interpretamos información que confirma lo que ya creemos.", "p": "", "a": "buscar temporalidades hasta encontrar una que valide el sesgo alcista ya decidido. Antídoto: definir la tesis contraria antes de entrar.", "t": ["decision", "pensamiento", "sesgos", "trading", "analisis"]},
    {"id": 83, "n": "Ley de Segal", "b": "G", "e": "ÚTIL", "q": "un hombre con un reloj sabe la hora; con dos, nunca está seguro.", "p": "", "a": "demasiados indicadores producen parálisis, no precisión. Un juego de reglas, una jerarquía.", "t": ["decision", "pensamiento", "sesgos", "indicadores", "simplicidad"]},
    {"id": 84, "n": "Ley de Murphy", "b": "G", "e": "FOLCLORE, pero útil como diseño", "q": "lo que puede salir mal, saldrá mal.", "p": "", "a": "no es fatalismo, es ingeniería: internet caído, plataforma congelada, orden no ejecutada. Protocolo de contingencia escrito para cada uno.", "t": ["decision", "pensamiento", "sesgos", "contingencia", "operativa"]},
    {"id": 85, "n": "Ley de Hick", "b": "G", "e": "SÓLIDA", "q": "el tiempo de decisión aumenta con el número de opciones.", "p": "", "a": "menos setups en el checklist = decisión más rápida en la killzone, donde los segundos importan.", "t": ["decision", "pensamiento", "sesgos", "checklist", "velocidad", "killzone"]},
    {"id": 86, "n": "Ley de Miller (7±2)", "b": "G", "e": "SÓLIDA con matices; hoy se estima 4±1 para memoria de trabajo", "q": "la memoria de trabajo maneja pocos elementos simultáneos.", "p": "", "a": "ninguna checklist operativa de más de 5 puntos se ejecuta bien bajo presión. Comprimir o automatizar.", "t": ["decision", "pensamiento", "sesgos", "checklist", "memoria", "simplicidad"]}
  ].map(l => ({
    id: l.id, nombre: l.n, bloque: l.b, evidencia: l.e,
    que_dice: l.q, para_que: l.p, aplicacion: l.a, tags: l.t,
  }));


  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------

  const norm = (s = "") =>
    s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const VACIAS = new Set([
    "que", "con", "para", "por", "los", "las", "una", "uno", "del", "the", "and",
    "esto", "esta", "este", "como", "mas", "muy", "pero", "porque", "cuando",
    "hoy", "ayer", "sobre", "tengo", "estoy", "hice", "voy", "puedo", "debo",
    "sin", "con", "vez", "veces", "igual", "mismo", "misma", "cada", "otra",
    "otro", "solo", "sola", "todo", "toda", "todos", "todas", "nada", "algo",
    "nunca", "siempre", "aunque", "entre", "hasta", "desde", "tras", "ante",
    "sino", "tanto", "tambien", "ademas", "luego", "antes", "despues", "hacer",
    "hace", "quiero", "quiere", "seria", "sera", "estar", "tener", "poner",
    "ahora", "aqui", "alli", "bien", "mejor", "peor", "cosa", "cosas", "parte",
  ]);

  const tokens = (s = "") =>
    norm(s).split(/[^a-z0-9%/]+/).filter((t) => t.length > 2 && !VACIAS.has(t));

  // Vocabulario real de Rey → términos del catálogo. Solo se aplica a la
  // consulta, nunca al catálogo. Añadir aquí cualquier jerga nueva.
  const SINONIMOS = {
    cansado: ["fatiga", "descanso"], cansancio: ["fatiga", "descanso"],
    agotado: ["fatiga"], quemado: ["fatiga"], sueno: ["descanso", "fatiga"],
    lote: ["sizing", "riesgo"], lotaje: ["sizing", "riesgo"],
    volumen: ["sizing"], apalancamiento: ["sizing", "riesgo"],
    perdida: ["drawdown", "riesgo"], perdidas: ["drawdown", "riesgo"],
    racha: ["racha", "sizing"], rachas: ["racha"],
    desafio: ["propfirm", "objetivos"], challenge: ["propfirm"],
    fondeada: ["propfirm"], fondeo: ["propfirm"], fundednext: ["propfirm"],
    killzone: ["killzone", "trading"], sesion: ["trading"],
    setup: ["trading", "sistema"], setups: ["trading", "sistema"],
    bitacora: ["journal", "metricas"], journal: ["journal", "metricas"],
    backtest: ["backtest", "aprendizaje"], backtesting: ["backtest"],
    cliente: ["clientes", "marketing"], clientes: ["clientes", "marketing"],
    pedido: ["delivery", "capacidad"], pedidos: ["delivery", "capacidad"],
    moto: ["delivery"], entrega: ["delivery"], entregas: ["delivery"],
    gimnasio: ["gimnasio", "cuerpo"], entrenar: ["gimnasio", "progresion"],
    entrenamiento: ["gimnasio", "progresion"],
    ansiedad: ["emocion"], nervioso: ["emocion"], enojado: ["emocion"],
    procrastin: ["procrastinacion"], distraido: ["concentracion"],
    app: ["pwa", "programacion"], codigo: ["programacion"], apex: ["pwa"],

    // --- vida personal y negocio (no trading) ---
    gaste: ["gasto", "dinero"], gastar: ["gasto", "dinero"],
    gasto: ["gasto", "dinero"], gastos: ["gasto", "dinero"],
    ahorrar: ["dinero", "gasto"], ahorro: ["dinero", "gasto"],
    ahorre: ["dinero", "gasto"], sueldo: ["dinero"], ingreso: ["dinero"],
    ingresos: ["dinero"], gane: ["dinero"], facturacion: ["dinero", "negocio"],
    deuda: ["dinero", "riesgo"], deudas: ["dinero", "riesgo"],
    invertir: ["dinero", "capital"], inversion: ["dinero", "capital"],
    jubilacion: ["dinero", "capital"], libertad: ["dinero", "capital"],

    concentrarme: ["concentracion", "tiempo"], concentrar: ["concentracion"],
    concentracion: ["concentracion"], distraigo: ["concentracion", "tiempo"],
    distraido: ["concentracion"], distraccion: ["concentracion"],
    celular: ["concentracion"], notificaciones: ["concentracion"],
    foco: ["concentracion", "prioridad"], enfocar: ["concentracion"],
    postergo: ["procrastinacion"], postergar: ["procrastinacion"],
    procrastino: ["procrastinacion"], procrastinar: ["procrastinacion"],
    ocupado: ["tiempo", "prioridad"], saturado: ["tiempo", "prioridad"],
    agenda: ["tiempo", "agenda", "prioridad"], tarea: ["tiempo", "prioridad"],
    tareas: ["tiempo", "prioridad"], pendientes: ["tiempo", "prioridad"],

    aprender: ["aprendizaje", "practica"], aprendiendo: ["aprendizaje", "practica"],
    estudiar: ["aprendizaje", "practica"], curso: ["aprendizaje", "filtro"],
    programar: ["programacion", "aprendizaje"], programando: ["programacion"],
    avanzo: ["paciencia", "mejora"], avanzar: ["paciencia", "mejora"],
    estancado: ["paciencia", "mejora"], atascado: ["paciencia", "diagnostico"],
    mejorar: ["mejora", "iteracion"], progreso: ["mejora", "progresion"],

    habito: ["habitos", "rutina"], habitos: ["habitos", "rutina"],
    rutina: ["rutina", "habitos"], constancia: ["rutina", "racha"],
    disciplina: ["disciplina", "rutina"], motivacion: ["motivacion", "rutina"],
    abandone: ["rutina", "racha"], abandonar: ["rutina", "racha"],
    falle: ["rutina", "racha"], rendirme: ["motivacion", "fatiga"],
    meta: ["objetivos"], metas: ["objetivos"], objetivo: ["objetivos"],

    discuti: ["malicia", "decision"], discusion: ["malicia", "decision"],
    pelea: ["malicia"], conflicto: ["malicia", "decision"],
    proposito: ["malicia", "descuido"], intencion: ["malicia"],
    culpa: ["malicia", "descuido"], sospecho: ["malicia"],
    aproposito: ["malicia"], jodio: ["malicia"], enganar: ["malicia"],

    contratar: ["contratar", "equipo"], empleado: ["contratar", "equipo"],
    socio: ["equipo", "negocio"], equipo: ["equipo"],
    precio: ["negocio", "clientes"], cobrar: ["negocio", "clientes"],
    tarifa: ["negocio", "clientes"], competencia: ["negocio"],
    publicidad: ["marketing"], anuncio: ["marketing"], marca: ["marketing"],
    tarjetas: ["marketing", "clientes"], referencia: ["marketing", "red"],
    decidir: ["decision"], decision: ["decision"], elegir: ["decision"],
    duda: ["decision"], opciones: ["decision", "simplicidad"],
  };

  /** Tokens de la consulta, con sinónimos expandidos. */
  const tokensConsulta = (s = "") => {
    const base = tokens(s);
    const extra = base.flatMap((t) => SINONIMOS[t] || []);
    return [...new Set([...base, ...extra])];
  };

  /** Nivel de evidencia normalizado: "SOLIDA" | "UTIL" | "FOLCLORE" */
  function nivelEvidencia(ley) {
    const e = norm(ley.evidencia);
    if (e.startsWith("folclore")) return "FOLCLORE";
    if (e.startsWith("solida")) return "SOLIDA";
    return "UTIL";
  }

  const PESO_EVIDENCIA = { SOLIDA: 2, UTIL: 1, FOLCLORE: 0 };

  // ---------------------------------------------------------------------------
  // Leyes de supervivencia y disparadores de riesgo
  // ---------------------------------------------------------------------------

  /** Leyes que Roberto debe traer SIEMPRE que haya señal de riesgo de cuenta. */
  const LEYES_SUPERVIVENCIA = [31, 32, 34, 39, 40, 42];

  /** Patrones que indican que Rey está a punto de romper la gestión de riesgo. */
  const SENALES_RIESGO = [
    /recuperar (lo )?(perdid|la perdida)/i,
    /revancha|desquit|vengan/i,
    /subir (el )?(lote|tamano|tamaño|riesgo|volumen)/i,
    /doblar|duplicar (el )?(lote|riesgo|tamano|tamaño)/i,
    /martingala|promediar|averaging/i,
    /una (mas|ultima|última)|un(a)? trade mas/i,
    /sin stop|quitar el stop|mover el stop/i,
    /voy (en )?racha|llevo \d+ ganad/i,
    /me falta poco para (pasar|el objetivo)/i,
    /saltarme? (la|una) regla|romper la regla/i,
    /todo el capital|all in/i,
  ];

  /** Patrones que indican entrada prematura — debilidad conocida de Rey. */
  const SENALES_ENTRADA_PREMATURA = [
    /entr(e|é|ar) antes/i,
    /no (espere|esperé|espero) (la |el )?(barrid|sweep|liquidacion|liquidación)/i,
    /me adelant/i,
    /se me fue el (precio|tren)/i,
    /fomo/i,
  ];

  const hayRiesgo = (t = "") => SENALES_RIESGO.some((r) => r.test(t));
  const hayEntradaPrematura = (t = "") =>
    SENALES_ENTRADA_PREMATURA.some((r) => r.test(t));

  // ---------------------------------------------------------------------------
  // Acceso directo
  // ---------------------------------------------------------------------------

  const leyPorId = (id) => LEYES.find((l) => l.id === Number(id)) || null;
  const leyesPorBloque = (b) =>
    LEYES.filter((l) => l.bloque === String(b).toUpperCase());
  const leyesPorTag = (tag) =>
    LEYES.filter((l) => l.tags.includes(norm(tag)));

  // ---------------------------------------------------------------------------
  // Búsqueda por relevancia
  // ---------------------------------------------------------------------------

  /**
   * Puntúa cada ley contra un texto libre.
   * Pesos: nombre 4 · tag 3 · "qué dice" 2 · aplicación 1 · evidencia (desempate).
   */
  // Índice precalculado: un Set de tokens por campo y por ley.
  const INDICE = LEYES.map((ley) => ({
    ley,
    nombre: new Set(tokens(ley.nombre)),
    tags: new Set(ley.tags.flatMap((t) => tokens(t))),
    dice: new Set(tokens(ley.que_dice + " " + ley.para_que)),
    apl: new Set(tokens(ley.aplicacion)),
  }));

  // Tokens demasiado comunes en el catálogo (aparecen en >20% de las leyes) no
  // aportan señal: "igual", "capital", "reglas"... Se descartan automáticamente,
  // así la lista se mantiene sola aunque se añadan leyes nuevas.
  const FRECUENCIA = (() => {
    const c = new Map();
    for (const e of INDICE)
      for (const t of new Set([...e.nombre, ...e.dice, ...e.apl]))
        c.set(t, (c.get(t) || 0) + 1);
    return c;
  })();
  const UMBRAL_COMUN = LEYES.length * 0.2;
  const informativo = (t) => (FRECUENCIA.get(t) || 0) <= UMBRAL_COMUN;

  function puntuarLeyes(texto) {
    const ts = tokensConsulta(texto).filter(informativo);
    if (!ts.length) return [];
    return INDICE.map((e) => {
      let score = 0;
      for (const t of ts) {
        if (e.nombre.has(t)) score += 4;
        if (e.tags.has(t)) score += 3;
        if (e.dice.has(t)) score += 2;
        if (e.apl.has(t)) score += 1;
      }
      if (score > 0) score += PESO_EVIDENCIA[nivelEvidencia(e.ley)] * 0.1;
      return { ley: e.ley, score };
    })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.ley.id - b.ley.id);
  }

  /**
   * Devuelve las leyes relevantes a un mensaje.
   * @param {string} texto  mensaje de Rey (o contexto de la operación)
   * @param {object} opts
   *   max            {number}  máximo de leyes devueltas (def. 4)
   *   excluirFolclore{boolean} deja fuera las etiquetadas FOLCLORE (def. false)
   *   forzar         {number[]} ids que deben aparecer sí o sí
   */
  function buscarLeyes(texto, opts = {}) {
    const { max = 4, excluirFolclore = false, forzar = [] } = opts;

    const forzadas = [];
    const push = (id) => {
      const l = leyPorId(id);
      if (l && !forzadas.some((x) => x.id === l.id)) forzadas.push(l);
    };

    // Prioridad absoluta: supervivencia del capital.
    if (hayRiesgo(texto)) LEYES_SUPERVIVENCIA.forEach(push);
    // Debilidad conocida: entrada prematura.
    if (hayEntradaPrematura(texto)) [46, 41, 42].forEach(push);
    forzar.forEach(push);

    const resto = puntuarLeyes(texto)
      .map((x) => x.ley)
      .filter((l) => !forzadas.some((f) => f.id === l.id))
      .filter((l) => !(excluirFolclore && nivelEvidencia(l) === "FOLCLORE"));

    return [...forzadas, ...resto].slice(0, Math.max(max, forzadas.length ? 2 : 1));
  }

  // ---------------------------------------------------------------------------
  // Render para el prompt
  // ---------------------------------------------------------------------------

  /** Formatea una ley en el formato compacto que consume el modelo. */
  function formatearLey(ley) {
    const p = ley.para_que ? `\n  Sirve para: ${ley.para_que}` : "";
    return (
      `[${ley.id}] ${ley.nombre} · evidencia: ${ley.evidencia}\n` +
      `  Dice: ${ley.que_dice}${p}\n` +
      `  Aplicación a Rey: ${ley.aplicacion}`
    );
  }

  /**
   * Bloque listo para concatenar al system prompt de Roberto.
   * Si no hay leyes relevantes devuelve "" (no ensuciar el prompt).
   */
  function bloqueLeyesParaPrompt(texto, opts = {}) {
    const leyes = buscarLeyes(texto, opts);
    if (!leyes.length) return "";

    const aviso = hayRiesgo(texto)
      ? "\n\n⚠ SEÑAL DE RIESGO DE CUENTA DETECTADA. Antepón las leyes de " +
        "supervivencia. Contradice a Rey de forma directa si su plan viola la " +
        "gestión de riesgo, aunque le moleste.\n"
      : "";

    const avisoEP = hayEntradaPrematura(texto)
      ? "\n\n⚠ POSIBLE ENTRADA PREMATURA (debilidad conocida de Rey). Verifica " +
        "explícitamente si hubo barrida completa de liquidez antes de opinar " +
        "sobre el trade.\n"
      : "";

    return (
      "\n\n### LEYES APLICABLES A ESTA CONSULTA" +
      aviso +
      avisoEP +
      "\nUsa como máximo 2 de las siguientes. Nunca las cites sin traducirlas a " +
      "una acción medible con número, plazo y criterio de verificación. " +
      "Respeta la etiqueta de evidencia: no presentes FOLCLORE como ciencia.\n\n" +
      leyes.map(formatearLey).join("\n\n")
    );
  }

  // ---------------------------------------------------------------------------
  // Protocolos periódicos
  // ---------------------------------------------------------------------------

  const PROTOCOLOS = {
    presesion: {
      titulo: "Antes de operar (3 min)",
      pasos: [
        { texto: "¿Estado emocional dentro de rango operativo?", leyes: [22] },
        { texto: "¿Par y sesión dentro del sistema?", leyes: [76] },
        { texto: "¿Hubo barrida completa? Si no, no hay setup.", leyes: [46] },
        { texto: "Riesgo por operación y límite diario verificados.", leyes: [39, 40] },
      ],
    },
    cierre: {
      titulo: "Al cerrar el día (5 min)",
      pasos: [
        { texto: "Journal completado ya, no después.", leyes: [18, 44] },
        { texto: "¿Hubo violación de proceso? Marcar como fallo aunque haya ganado.", leyes: [41, 42] },
        { texto: "Revisar primero lo incómodo: los perdedores y los errores.", leyes: [15] },
      ],
    },
    semanal: {
      titulo: "Revisión semanal (30 min)",
      pasos: [
        { texto: "¿Qué 20% produjo el resultado? ¿Qué se elimina?", leyes: [1, 2] },
        { texto: "¿Cuál es el cuello de botella de esta semana?", leyes: [52] },
        { texto: "¿Alguna métrica se volvió objetivo y está distorsionando la conducta?", leyes: [43, 44] },
      ],
    },
    mensual: {
      titulo: "Revisión mensual (60 min)",
      pasos: [
        { texto: "Expectativa y drawdown: números fríos, sin narrativa.", leyes: [38, 31] },
        { texto: "¿Hay muestra suficiente para concluir algo?", leyes: [33, 45] },
        { texto: "Ninguna regla se elimina sin entender su origen.", leyes: [74] },
        { texto: "«¿Cómo destruiría esto en 30 días?» y blindar.", leyes: [75] },
      ],
    },
  };

  /** Devuelve el protocolo con las leyes ya expandidas, listo para el prompt. */
  function protocolo(nombre) {
    const p = PROTOCOLOS[norm(nombre)];
    if (!p) return "";
    const cuerpo = p.pasos
      .map((s, i) => {
        const refs = s.leyes.map((id) => leyPorId(id)).filter(Boolean);
        return (
          `${i + 1}. ${s.texto}\n` +
          refs.map((l) => `   → [${l.id}] ${l.nombre}: ${l.que_dice}`).join("\n")
        );
      })
      .join("\n");
    return `### PROTOCOLO — ${p.titulo}\n${cuerpo}`;
  }

  // ---------------------------------------------------------------------------
  // Frases gatillo
  // ---------------------------------------------------------------------------

  const GATILLOS = [
    { re: /pareto (esto|esta|este)|aplica(me)? pareto|80\/20/i, ids: [1, 2, 3, 7] },
    { re: /invierte esto|jacobi|como (lo )?destru/i, ids: [75, 48, 35] },
    { re: /cuello de botella|restriccion|restricción/i, ids: [52, 53, 55] },
    { re: /revision de leyes|revisión de leyes|auditoria|auditoría/i, ids: [1, 38, 41, 43] },
    { re: /es folclore|esto es ciencia|nivel de evidencia/i, ids: [] },
  ];

  /** Detecta una frase gatillo y devuelve los ids a forzar (o null). */
  function detectarGatillo(texto = "") {
    const g = GATILLOS.find((x) => x.re.test(texto));
    return g ? g.ids : null;
  }

  // ---------------------------------------------------------------------------
  // API de alto nivel — lo único que necesita llamar la app
  // ---------------------------------------------------------------------------

  /**
   * Punto de entrada. Dado el mensaje de Rey, devuelve el texto a añadir al
   * system prompt de Roberto (puede ser cadena vacía).
   *
   *   const extra = contextoLeyes(mensajeDeRey);
   *   const system = ROBERTO_CORE + extra;
   */
  function contextoLeyes(texto, opts = {}) {
    const forzar = detectarGatillo(texto);
    return bloqueLeyesParaPrompt(texto, {
      max: 4,
      ...opts,
      forzar: [...(forzar || []), ...(opts.forzar || [])],
    });
  }



  /* se cuelga de donde toque: la página (window) o el vigilante (self) — igual que
     situaciones.js, para que los DOS lados de Roberto usen exactamente las mismas leyes. */
  raiz.LEYES = LEYES;
  raiz.buscarLeyes = buscarLeyes;
  raiz.contextoLeyes = contextoLeyes;
  raiz.bloqueLeyesParaPrompt = bloqueLeyesParaPrompt;
  raiz.protocolo = protocolo;
  raiz.PROTOCOLOS = PROTOCOLOS;
  raiz.leyPorId = leyPorId;
  raiz.leyesPorBloque = leyesPorBloque;
  raiz.leyesPorTag = leyesPorTag;
  raiz.nivelEvidencia = nivelEvidencia;
  raiz.hayRiesgo = hayRiesgo;
  raiz.hayEntradaPrematura = hayEntradaPrematura;
})(typeof window !== "undefined" ? window : self);
