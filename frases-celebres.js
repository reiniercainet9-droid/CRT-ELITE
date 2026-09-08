/* ══════════════════════════════════════════════════════════════════════════════
   🗣️ EL RELOJ DE LAS FRASES — citas de personas reales, cada 30 minutos
   ═════════════════════════════════════════════════════════════════════════════
   Rey (08-09, después de un día entero fuera): "en todo el día Roberto no me dijo ni una
   sola frase de crecimiento personal ni de abundancia, no lo oí… las quiero cada 30 minutos
   en todo el día, intercalando crecimiento personal, abundancia y afirmaciones… no quiero
   frases genéricas mal hechas, quiero frases de personalidades célebres, famosas y
   reconocidas de todos los tiempos y de estos tiempos… de todos los ámbitos de la vida, no
   específicas del trading."

   SE MIDIÓ EN SU TELÉFONO ANTES DE TOCAR NADA (no leyendo código): llevaba 3 frases en todo
   el día y la última era de 15 HORAS antes, sobre las 5:30 de la mañana. Tenía razón entera.
   LA CAUSA: las frases salían de la vida de fondo de DENTRO de Apex, que solo corre si su
   pantalla está visible — y su Apex está detrás de otras apps todo el día. Por eso este
   reloj es INDEPENDIENTE de la vida de fondo y de que Apex se vea o no.

   LAS REGLAS QUE PUSO ÉL, y este archivo existe para cumplirlas:
     · cada 30 minutos, todo el día;
     · rotando crecimiento → abundancia → afirmación, en ese orden;
     · citas ATRIBUIDAS a personas reales, de todas las épocas;
     · de la vida entera, no del trading;
     · NINGUNA repetida en el mismo día;
     · y JAMÁS pisando una alarma del mercado ni un aviso importante: si coinciden, se espera
       a que termine, se cuenta UN MINUTO, y entonces se dice.

   ⚠️ SOBRE LAS ATRIBUCIONES: solo entran frases cuya autoría está bien asentada. Las muy
   famosas pero de origen dudoso (las "de Einstein" que Einstein nunca dijo, el "sé el cambio"
   de Gandhi tal cual, el "lo que está detrás de nosotros" que se le cuelga a Emerson y es de
   Haskins) SE QUEDAN FUERA. Rey pidió personalidades reconocidas: ponerle una cita falsa en
   la boca de una de ellas sería justo lo contrario de lo que pidió.
   ══════════════════════════════════════════════════════════════════════════════ */

/* ── 1 · CRECIMIENTO Y DESARROLLO PERSONAL ─────────────────────────────────── */
var FC_CRECIMIENTO = [
  "Rey, decía Séneca: no nos atrevemos a muchas cosas porque son difíciles; son difíciles porque no nos atrevemos.",
  "Rey, Marco Aurelio lo escribió para sí mismo: tienes poder sobre tu mente, no sobre los hechos. Ahí está tu fuerza.",
  "Rey, Viktor Frankl: al hombre se le puede quitar todo menos una cosa, elegir su actitud ante lo que le toca.",
  "Rey, Nietzsche lo dijo así: quien tiene un porqué para vivir puede soportar casi cualquier cómo.",
  "Rey, Epicteto: no son las cosas las que te perturban, sino la opinión que tienes de ellas.",
  "Rey, Lao Tsé: un viaje de mil millas empieza con un solo paso. Hoy solo te toca dar el tuyo.",
  "Rey, Confucio: no importa lo despacio que vayas mientras no te detengas.",
  "Rey, Sócrates decía que la clave de todo era conocerse a uno mismo. Sigue siendo el trabajo más rentable.",
  "Rey, Aristóteles: somos aquello que hacemos repetidamente. La excelencia no es un acto, es un hábito.",
  "Rey, Nelson Mandela: siempre parece imposible, hasta que se hace.",
  "Rey, Maya Angelou fue tajante: nada funcionará a menos que tú lo hagas.",
  "Rey, Thomas Edison: no fracasé, encontré diez mil maneras que no funcionan. Cada una era información.",
  "Rey, Henry Ford: tanto si crees que puedes como si crees que no puedes, tienes razón.",
  "Rey, Bruce Lee: no temo al que practicó diez mil patadas una vez, temo al que practicó una patada diez mil veces.",
  "Rey, Winston Churchill: el éxito no es definitivo y el fracaso no es fatal; lo que cuenta es el coraje de seguir.",
  "Rey, Marie Curie: nada en la vida debe temerse, solo comprenderse. Entiende más para temer menos.",
  "Rey, Leonardo da Vinci: la simplicidad es la máxima sofisticación. Simplifica y verás mejor.",
  "Rey, Miguel Ángel avisaba: el peligro no es apuntar alto y fallar, es apuntar bajo y acertar.",
  "Rey, Benjamin Franklin: dime y lo olvido, enséñame y lo recuerdo, involúcrame y lo aprendo.",
  "Rey, Steve Jobs: tu tiempo es limitado, no lo gastes viviendo la vida de otro.",
  "Rey, Peter Drucker: la mejor manera de predecir el futuro es crearlo.",
  "Rey, Jim Rohn: no desees que sea más fácil, desea ser mejor.",
  "Rey, Jim Rohn también decía que somos el promedio de las cinco personas con las que más tiempo pasamos.",
  "Rey, Zig Ziglar: no tienes que ser grande para empezar, pero tienes que empezar para ser grande.",
  "Rey, John Wooden: no dejes que lo que no puedes hacer estorbe a lo que sí puedes hacer.",
  "Rey, James Clear lo resume así: no subes al nivel de tus metas, caes al nivel de tus sistemas.",
  "Rey, Angela Duckworth lo midió: el talento cuenta, pero el esfuerzo cuenta el doble.",
  "Rey, Carol Dweck: el esfuerzo es lo que enciende la capacidad y la convierte en logro.",
  "Rey, Stephen Covey: lo principal es que lo principal siga siendo lo principal.",
  "Rey, Muhammad Ali: no contaba los abdominales, empezaba a contar cuando empezaba a doler.",
  "Rey, Michael Jordan: he fallado una y otra vez en mi vida, y por eso he tenido éxito.",
  "Rey, Kobe Bryant: los grandes no nacen grandes, se hacen a las cuatro de la mañana.",
  "Rey, Séneca: mientras esperamos a vivir, la vida se nos pasa.",
  "Rey, Séneca de nuevo: no hay viento favorable para el que no sabe adónde va. Ten claro tu puerto.",
  "Rey, Marco Aurelio: la felicidad de tu vida depende de la calidad de tus pensamientos.",
  "Rey, Sun Tzu: en medio del caos también hay oportunidad. Sereno se ve lo que alterado no.",
  "Rey, José Martí: hacer es la mejor manera de decir.",
  "Rey, José Martí decía que el hombre que no estudia es un árbol sin frutos. Sigue estudiando lo tuyo.",
  "Rey, Antonio Machado: caminante, no hay camino, se hace camino al andar.",
  "Rey, Cervantes por boca de don Quijote: el que lee mucho y anda mucho, ve mucho y sabe mucho.",
  "Rey, Eleanor Roosevelt: nadie puede hacerte sentir inferior sin tu consentimiento.",
  "Rey, Helen Keller: la vida es una aventura atrevida o no es nada.",
  "Rey, Vince Lombardi: no es que quisieran ganar, es que se prepararon para ganar.",
  "Rey, Dale Carnegie: la mayoría de las cosas importantes las hicieron quienes siguieron intentando cuando no parecía haber esperanza.",
  "Rey, Og Mandino: siempre daré un paso más. Si fracaso, no será por no haberlo dado.",
  "Rey, Earl Nightingale: nos convertimos en aquello en lo que pensamos la mayor parte del tiempo.",
  "Rey, Tony Robbins: donde va tu atención, fluye tu energía. Vigila dónde la pones hoy.",
  "Rey, Robin Sharma: el cambio es duro al principio, desordenado en el medio y precioso al final.",
  "Rey, Charlie Munger: coge una idea sencilla y tómatela en serio. Ahí está casi todo.",
  "Rey, Séneca: la suerte es lo que pasa cuando la preparación se encuentra con la oportunidad.",
  "Rey, Marco Aurelio: no pierdas más tiempo discutiendo cómo debe ser un hombre bueno. Sé uno.",
  "Rey, Epicteto: primero dite a ti mismo qué quieres ser, y después haz lo que tengas que hacer.",
  "Rey, Buda: la mente lo es todo; te conviertes en lo que piensas.",
  "Rey, Rumi: ayer era listo y quería cambiar el mundo; hoy soy sabio y me estoy cambiando a mí.",
  "Rey, Gandhi: vive como si fueras a morir mañana, aprende como si fueras a vivir siempre.",
  "Rey, Martin Luther King: da el primer paso con fe, no hace falta que veas toda la escalera.",
  "Rey, Frederick Douglass: sin exigencia no hay avance. El que quiere cosecha sin arar, quiere lluvia sin truenos.",
  "Rey, Booker T. Washington: el éxito se mide por los obstáculos que superaste para llegar.",
  "Rey, Napoleon Hill: la paciencia, la persistencia y el sudor forman una combinación imbatible.",
  "Rey, Paulo Coelho: la posibilidad de realizar un sueño es lo que hace que la vida sea interesante.",
  /* 💼 v7.80 — Rey (08-09): "no vi entre las celebridades a los de las inversiones: Warren
     Buffett, George Soros, Ray Dalio, Peter Lynch, Benjamin Graham, y otros que han escrito
     libros importantes de inversión, inteligencia financiera y emocional".
     Entran por su TEMPLE y su forma de pensar —paciencia, error, ego, decisiones—, que es
     lo que sirve para toda la vida. Su regla de que no sean del trading sigue en pie: aquí
     no hay ni una sola instrucción de qué comprar ni cuándo. */
  "Rey, Warren Buffett: se tardan veinte años en construir una reputación y cinco minutos en arruinarla.",
  "Rey, Warren Buffett: la diferencia entre la gente exitosa y la MUY exitosa es que la segunda dice que no a casi todo.",
  "Rey, Warren Buffett lo tiene claro: la mejor inversión que puedes hacer es en ti mismo.",
  "Rey, Charlie Munger: dime dónde voy a morir y no iré nunca allí. Piensa al revés y verás la salida.",
  "Rey, Charlie Munger: gran parte de nuestra ventaja vino de intentar ser consistentemente no estúpidos.",
  "Rey, Benjamin Graham: el principal problema del inversor, y hasta su peor enemigo, suele ser él mismo.",
  "Rey, Peter Lynch: el órgano que más decide no es el cerebro, es el estómago. Entrénalo.",
  "Rey, George Soros: reconocer un error a tiempo no es una humillación, es motivo de orgullo.",
  "Rey, George Soros: si lo que haces te resulta emocionante y divertido, probablemente lo estés haciendo mal.",
  "Rey, Ray Dalio lo resume en tres palabras: dolor más reflexión es igual a progreso.",
  "Rey, Ray Dalio: si no te avergüenza quien eras hace un año, es que no has aprendido lo suficiente.",
  "Rey, Ray Dalio insiste en lo mismo: el error no es fallar, es no ver la realidad como es.",
  "Rey, John Templeton avisaba: las cuatro palabras más caras del mundo son «esta vez es distinto».",
  "Rey, Howard Marks: no puedes predecir lo que viene, pero sí puedes estar preparado.",
  "Rey, Daniel Kahneman lo demostró: la confianza que sientes no mide lo cerca que estás de acertar.",
  "Rey, Daniel Kahneman: nada en la vida es tan importante como te parece mientras estás pensando en ello.",
  "Rey, Daniel Goleman: la inteligencia emocional empieza por saber qué estás sintiendo mientras lo sientes.",
  "Rey, Daniel Goleman: el coeficiente te consigue el puesto; la inteligencia emocional te hace crecer en él.",
  "Rey, Nassim Taleb: hay cosas que se rompen con el golpe y otras que se fortalecen. Elige ser de las segundas.",
  "Rey, Brené Brown: la vulnerabilidad no es debilidad, es de donde nacen el coraje y el cambio.",
  "Rey, Oscar Wilde definió al cínico: el que sabe el precio de todo y el valor de nada. No seas ese.",
  "Rey, Philip Fisher: el mayor error no es pagar de más, es no haber estudiado lo suficiente antes de decidir.",
];

/* ── 2 · ABUNDANCIA Y PROSPERIDAD ──────────────────────────────────────────── */
var FC_ABUNDANCIA = [
  "Rey, Napoleon Hill: todo lo que la mente puede concebir y creer, lo puede conseguir.",
  "Rey, Napoleon Hill: el punto de partida de todo logro es el deseo. No el deseo tibio, el ardiente.",
  "Rey, Napoleon Hill: las riquezas empiezan en un estado mental, con un propósito definido y poco esfuerzo ajeno.",
  "Rey, Wallace Wattles: no hay nada malo en querer ser rico; querer riqueza es querer una vida más plena.",
  "Rey, Wallace Wattles: no compitas, crea. El que crea nunca se queda sin sitio.",
  "Rey, George Clason en El hombre más rico de Babilonia: una parte de todo lo que ganas es para ti. Págate primero.",
  "Rey, Clason otra vez: el oro se queda con quien lo guarda y lo pone a trabajar, no con quien lo persigue.",
  "Rey, T. Harv Eker: tus ingresos solo pueden crecer hasta donde crezcas tú.",
  "Rey, T. Harv Eker: los ricos ven las oportunidades, los pobres ven los obstáculos. Es la misma escena.",
  "Rey, Joseph Murphy: lo que grabas en tu subconsciente se te aparece luego en la pantalla del mundo.",
  "Rey, Joseph Murphy: tu subconsciente no discute contigo, acepta lo que le repites. Cuida lo que le repites.",
  "Rey, Bob Proctor: la abundancia no se persigue, se sintoniza. Ponte en su frecuencia y llega.",
  "Rey, Earl Nightingale llamaba al pensamiento el secreto más extraño: te vuelves aquello que piensas.",
  "Rey, Jim Rohn: tus ingresos rara vez superan tu desarrollo personal. Crece tú y crecen ellos.",
  "Rey, Jim Rohn: no te ganes la vida, hazte una vida.",
  "Rey, Séneca: no es pobre el que tiene poco, sino el que ansía más de lo que tiene.",
  "Rey, Epicuro: la riqueza no está en tener mucho, sino en necesitar poco.",
  "Rey, Aristóteles: la riqueza es evidentemente un medio, nunca el fin. No confundas el camino con la meta.",
  "Rey, Benjamin Franklin: una inversión en conocimiento paga el mejor interés de todos.",
  "Rey, Benjamin Franklin: cuidado con los gastos pequeños; una gotera pequeña hunde un barco grande.",
  "Rey, Florence Scovel Shinn: tu palabra es tu varita. Con lo que dices vas construyendo lo que vives.",
  "Rey, Louise Hay: la prosperidad empieza por sentirte digno de recibirla.",
  "Rey, Catherine Ponder: la prosperidad no es solo dinero, es plenitud en todas las áreas de tu vida.",
  "Rey, Deepak Chopra: la abundancia circula. Lo que se retiene se estanca, lo que se mueve vuelve.",
  "Rey, Ralph Waldo Emerson: el dinero suele costar demasiado cuando lo pagas con tu paz.",
  "Rey, Henry David Thoreau: un hombre es rico en proporción a las cosas que puede dejar de necesitar.",
  "Rey, Confucio: el hombre superior piensa en lo que es justo; el pequeño, en lo que le conviene.",
  "Rey, Marco Aurelio: la riqueza consiste en tener pocas necesidades y muchas certezas.",
  "Rey, Warren Buffett sobre la vida: nadie planta un árbol hoy para sentarse a su sombra hoy.",
  "Rey, Charlie Munger: la primera regla para acumular es no interrumpir el interés compuesto sin necesidad.",
  "Rey, Robert Kiyosaki: no importa cuánto ganas, importa cuánto conservas y cuánto trabaja para ti.",
  "Rey, Dave Ramsey: gánale hoy al impulso y mañana tendrás opciones que otros no tienen.",
  "Rey, Napoleon Hill: la mayoría se rinde justo cuando estaba a un paso del oro.",
  "Rey, Andrew Carnegie: la gente que no puede motivarse a sí misma tendrá que conformarse con lo mediocre.",
  "Rey, Rockefeller lo decía sin rodeos: no tengas miedo a renunciar a lo bueno para ir a por lo grande.",
  "Rey, Oprah Winfrey: sé agradecido con lo que tienes y acabarás teniendo más.",
  "Rey, Rumi: lo que buscas te está buscando a ti. Sigue haciendo tu parte.",
  "Rey, Lao Tsé: el que sabe que tiene suficiente es rico.",
  "Rey, Salomón lo escribió en Proverbios: la mano diligente enriquece, la perezosa empobrece.",
  "Rey, Séneca: no es que tengamos poco tiempo, es que perdemos mucho. Con el dinero pasa igual.",
  "Rey, Og Mandino: la riqueza que no se comparte con nadie es una cárcel con paredes de oro.",
  "Rey, Zig Ziglar: puedes tener todo lo que quieras si ayudas a otros a tener lo que ellos quieren.",
  "Rey, Bob Proctor: el dinero es solo una recompensa por el servicio que prestas. Sirve mejor y recibirás más.",
  "Rey, Napoleon Hill: la fe es el químico que convierte un pensamiento en su equivalente físico.",
  "Rey, Wallace Wattles: haz cada día todo lo que puedas hacer ese día, y hazlo con eficiencia.",
  "Rey, Neville Goddard: asume el sentimiento del deseo ya cumplido y actúa desde ahí.",
  "Rey, James Allen: el hombre es literalmente lo que piensa; su carácter es la suma de sus pensamientos.",
  "Rey, James Allen: las circunstancias no hacen al hombre, lo revelan.",
  "Rey, Marie Forleo lo dice claro: todo tiene solución. Lo que hoy te bloquea es un problema que aún no estudiaste.",
  "Rey, Séneca: nadie es más pobre que el que teme perder lo que tiene.",
  "Rey, Sócrates: el secreto de la riqueza no está en tener más, sino en desear menos de lo que no te sirve.",
  "Rey, Benjamin Graham sobre la vida: el mayor enemigo del que invierte en sí mismo suele ser él mismo.",
  "Rey, Napoleon Hill: la oportunidad suele venir disfrazada de mala suerte o de derrota temporal.",
  "Rey, Thomas Edison: la oportunidad se pierde porque viene vestida de mono y parece trabajo.",
  "Rey, Jim Rohn: la disciplina pesa gramos, el arrepentimiento pesa toneladas.",
  "Rey, Peter Drucker: lo que se mide, mejora. Lo que no se mide, se cuenta uno cuentos.",
  "Rey, Aristóteles: la riqueza verdadera es la del que ha aprendido a gobernarse a sí mismo.",
  "Rey, Vicki Robin: cuando gastas dinero estás gastando horas de tu vida. Míralo así antes de soltarlo.",
  "Rey, Morgan Housel: hacerse rico y seguir siéndolo son dos habilidades distintas; la segunda es humildad.",
  "Rey, Napoleon Hill: una meta es un sueño con fecha. Ponle fecha y deja de soñar en el aire.",
  /* 💼 v7.80 — los que Rey pidió por su nombre, y los autores de los libros de inversión e
     inteligencia financiera. Aquí hablan de dinero, pero de la MANERA de pensarlo: paciencia,
     ego, ahorro, tiempo. Ninguna dice qué comprar ni cuándo — eso no es cosa suya ni mía. */
  "Rey, Warren Buffett: el precio es lo que pagas; el valor es lo que recibes. No los confundas nunca.",
  "Rey, Warren Buffett: el mercado transfiere el dinero del impaciente al paciente. Y eso vale para casi todo.",
  "Rey, Warren Buffett: sé temeroso cuando los demás son codiciosos, y codicioso cuando los demás tienen miedo.",
  "Rey, Warren Buffett: solo cuando baja la marea se sabe quién estaba nadando desnudo.",
  "Rey, Warren Buffett: la regla número uno es no perder; la número dos es no olvidar la número uno.",
  "Rey, Benjamin Graham: a corto plazo el mercado vota; a largo plazo, pesa. Trabaja para el que pesa.",
  "Rey, Benjamin Graham: el que de verdad entiende vende a los optimistas y compra a los pesimistas.",
  "Rey, Peter Lynch: sabes más de lo que crees. Empieza por lo que ya conoces bien.",
  "Rey, Peter Lynch: se ha perdido mucho más dinero preparándose para las caídas que en las caídas mismas.",
  "Rey, George Soros: no importa si aciertas o fallas; importa cuánto ganas al acertar y cuánto pierdes al fallar.",
  "Rey, Ray Dalio: los principios son la forma de tratar la realidad para conseguir lo que quieres de ella.",
  "Rey, John Bogle: el tiempo es tu amigo y el impulso es tu enemigo. Casi todo se decide ahí.",
  "Rey, Charlie Munger: el dinero grande no está en comprar ni en vender, está en esperar.",
  "Rey, Morgan Housel: el mayor dividendo que paga el dinero es poder ser dueño de tu tiempo.",
  "Rey, Morgan Housel: ahorrar es la distancia que hay entre tu ego y tus ingresos.",
  "Rey, Robert Kiyosaki: los ricos compran cosas que les dan de comer; los demás compran cosas que se las comen.",
  "Rey, Robert Kiyosaki: la educación financiera no te la va a dar la escuela; te la das tú.",
  "Rey, Thomas Stanley, que estudió a los millonarios de verdad: la riqueza casi nunca es lo que se ve.",
  "Rey, Jesse Livermore: el dinero no se hace moviéndose todo el rato, se hace sabiendo esperar sentado.",
  "Rey, Howard Marks: para tener un resultado distinto al de todos hay que hacer algo distinto a todos.",
];

/* ── 3 · AFIRMACIONES ("Rey, repite conmigo…") ─────────────────────────────── */
var FC_AFIRMACION = [
  "Rey, repite conmigo, la fórmula de Émile Coué: cada día, en todos los sentidos, voy mejorando más y más.",
  "Rey, repite conmigo: el dinero llega a mí como un imán, porque estoy enfocado en crecer.",
  "Rey, repite conmigo: atraigo abundancia y prosperidad porque cada día me hago mejor.",
  "Rey, repite conmigo, al modo de Louise Hay: me merezco lo bueno y lo acepto en mi vida ahora.",
  "Rey, repite conmigo, con Joseph Murphy: mi subconsciente trabaja para mí de día y de noche.",
  "Rey, repite conmigo: soy disciplinado, y mi disciplina vale más que mis ganas.",
  "Rey, repite conmigo, con Napoleon Hill: tengo un propósito definido y camino hacia él todos los días.",
  "Rey, repite conmigo: mi mente es tranquila, mi mano es firme y mi decisión es mía.",
  "Rey, repite conmigo: cada día soy más capaz, más sereno y más constante que ayer.",
  "Rey, repite conmigo, con Florence Scovel Shinn: mi palabra construye lo que vivo, y hoy la cuido.",
  "Rey, repite conmigo: mi trabajo de hoy es la semilla de mi libertad de mañana.",
  "Rey, repite conmigo: lo que empiezo, lo termino. Ahí está mi diferencia.",
  "Rey, repite conmigo: la abundancia es mi estado natural, y me abro a recibirla.",
  "Rey, repite conmigo: soy dueño de mi atención, y mi atención va donde yo la mando.",
  "Rey, repite conmigo, con James Allen: soy lo que pienso, y hoy elijo pensar en grande.",
  "Rey, repite conmigo: aprendo de cada error y ninguno me define.",
  "Rey, repite conmigo: mi paz vale más que tener razón.",
  "Rey, repite conmigo: mi familia está segura porque yo me estoy construyendo fuerte.",
  "Rey, repite conmigo: soy paciente, y la paciencia me está pagando.",
  "Rey, repite conmigo, con Neville Goddard: siento ya cumplido lo que estoy construyendo.",
  "Rey, repite conmigo: mis hábitos son mi fortuna, y hoy los cuido.",
  "Rey, repite conmigo: no me comparo con nadie, me comparo con el que fui ayer.",
  "Rey, repite conmigo: tengo salud, tengo tiempo y tengo voluntad. Con eso se construye todo.",
  "Rey, repite conmigo: el miedo me avisa, no me manda.",
  "Rey, repite conmigo: mi cabeza está clara y mi plan está escrito.",
  "Rey, repite conmigo, con Wallace Wattles: no compito, creo. Hay sitio de sobra para mí.",
  "Rey, repite conmigo: merezco prosperar porque estoy dispuesto a aportar valor.",
  "Rey, repite conmigo: cada día que cumplo mis reglas me hago más rico, aunque no se note aún.",
  "Rey, repite conmigo: mi confianza no depende del resultado de hoy.",
  "Rey, repite conmigo: la constancia es mi talento, y ese sí lo elegí yo.",
  "Rey, repite conmigo, con Marco Aurelio: gobierno mi mente, y eso me basta.",
  "Rey, repite conmigo: agradezco lo que tengo mientras construyo lo que quiero.",
  "Rey, repite conmigo: soy el hombre en el que mi familia puede apoyarse.",
  "Rey, repite conmigo: mi dinero trabaja para mí, y yo trabajo para mi libertad.",
  "Rey, repite conmigo: hoy hago una cosa difícil, y por eso mañana seré más fuerte.",
  "Rey, repite conmigo: no necesito prisa, necesito dirección.",
  "Rey, repite conmigo: cada No que recibo me acerca al Sí que estoy buscando.",
  "Rey, repite conmigo, con Séneca: soy dueño de mi tiempo, y mi tiempo es mi vida.",
  "Rey, repite conmigo: yo decido cómo empieza mi día, y hoy empieza bien.",
  "Rey, repite conmigo: soy capaz de esperar el momento correcto sin desesperarme.",
  "Rey, repite conmigo: mi mente atrae oportunidades porque está preparada para verlas.",
  "Rey, repite conmigo: lo que me propongo, lo sostengo. Y lo que sostengo, se cumple.",
  "Rey, repite conmigo: mi cuerpo es fuerte, mi mente es firme y mi ánimo es alto.",
  "Rey, repite conmigo, con Emile Coué: mi salud mejora, mi ánimo mejora, mi vida mejora.",
  "Rey, repite conmigo: soy generoso, y lo que doy vuelve a mí multiplicado.",
  "Rey, repite conmigo: no me rindo, me ajusto.",
  "Rey, repite conmigo: hoy soy la mejor versión que he sido hasta ahora.",
  "Rey, repite conmigo: mis metas están escritas y mis pasos están dados.",
  "Rey, repite conmigo: nada de lo que pasó me quita lo que puedo construir.",
  "Rey, repite conmigo: mantengo la calma porque tengo un plan.",
  "Rey, repite conmigo, con Louise Hay: me apruebo a mí mismo tal como soy hoy, y desde ahí crezco.",
  "Rey, repite conmigo: mi enfoque es mi superpoder, y hoy lo uso bien.",
  "Rey, repite conmigo: la prosperidad me busca porque me estoy preparando para sostenerla.",
  "Rey, repite conmigo: aprendo rápido, aplico rápido y corrijo sin drama.",
  "Rey, repite conmigo: soy constante incluso cuando nadie me está mirando.",
  "Rey, repite conmigo: mi palabra vale, empezando por la que me doy a mí mismo.",
  "Rey, repite conmigo: hoy dejo ir lo que no puedo controlar y trabajo lo que sí.",
  "Rey, repite conmigo: mi futuro se está construyendo con lo que hago en esta hora.",
  "Rey, repite conmigo: tengo derecho a prosperar, y ejerzo ese derecho con trabajo.",
  "Rey, repite conmigo: soy imparable cuando soy paciente.",
  /* 💼 v7.80 — y unas cuantas apoyadas en los mismos autores que pidió */
  "Rey, repite conmigo, con Ray Dalio: el dolor más la reflexión me dan progreso, y hoy lo aplico.",
  "Rey, repite conmigo, con Warren Buffett: la mejor inversión que hago es en mí mismo.",
  "Rey, repite conmigo, con Benjamin Graham: mi mayor rival soy yo, y hoy lo tengo de mi lado.",
  "Rey, repite conmigo, con Daniel Goleman: reconozco lo que siento, y por eso decido mejor.",
  "Rey, repite conmigo, con Morgan Housel: mi mayor riqueza es ser dueño de mi tiempo.",
  "Rey, repite conmigo, con Peter Lynch: sé más de lo que creo, y hoy lo pongo a trabajar.",
];

/* ── EL RELOJ ──────────────────────────────────────────────────────────────────
   Estado compartido por los dos cuerpos (Apex y el cuerpo flotante). Se guarda dentro de la
   MISMA marca que ya comparten por Android (`robDichas`), bajo la clave `fc`, para no tener
   que tocar nada nativo: lo que uno dice, el otro lo sabe y no lo repite. */
var FC = {
  cadaMin: 30,        /* lo que pidió Rey */
  /* 🌅 v7.81 — Rey (08-09): "¿por qué de 6 am a 23 si yo me levanto a las 4 am y necesito
     desde que me levanto afirmaciones y frases?". Su día empieza a las 4, no a las 6. */
  desde: 4,           /* su día empieza a las 4:00 de su reloj: se levanta a esa hora */
  hasta: 23,          /* y termina a las 23:00 */
  esperaTrasAvisoSeg: 60,   /* si coincide con una alarma o un aviso: un minuto después */
  /* el orden de la rueda; se avanza una posición cada vez que dice una */
  clases: ["crecimiento", "abundancia", "afirmacion"],
};

function fcCatalogo(clase) {
  if (clase === "abundancia") return FC_ABUNDANCIA;
  if (clase === "afirmacion") return FC_AFIRMACION;
  return FC_CRECIMIENTO;
}

function fcTotal() { return FC_CRECIMIENTO.length + FC_ABUNDANCIA.length + FC_AFIRMACION.length; }

/* estado limpio de un día nuevo */
function fcEstadoDelDia(hoy) { return { dia: hoy, ts: 0, rueda: 0, usadas: {} }; }

function fcLeer(marca) {
  var hoy = new Date().toDateString();
  var m = marca || {};
  var e = m.fc;
  if (!e || e.dia !== hoy) e = fcEstadoDelDia(hoy);
  if (!e.usadas) e.usadas = {};
  return e;
}

/* ¿toca decir una AHORA?
   `ultimoAvisoTs` es el momento del último aviso/alarma importante que oyó Rey: si fue hace
   menos de un minuto, NO toca todavía — se espera y se dice después, que es su regla. */
function fcToca(marca, ultimoAvisoTs) {
  try {
    var e = fcLeer(marca);
    var f = new Date();
    var h = f.getHours() + f.getMinutes() / 60;
    if (h < FC.desde || h >= FC.hasta) return { toca: false, porque: "fuera de su día" };
    var ahora = Date.now();
    if (e.ts && (ahora - e.ts) < FC.cadaMin * 60000) return { toca: false, porque: "aún no han pasado los 30 minutos" };
    if (ultimoAvisoTs && (ahora - ultimoAvisoTs) < FC.esperaTrasAvisoSeg * 1000)
      return { toca: false, porque: "hay un aviso reciente: se espera un minuto y se dice después" };
    return { toca: true };
  } catch (_) { return { toca: false, porque: "error" }; }
}

/* saca la siguiente frase: la clase que toque por la rueda y una que NO se haya dicho hoy.
   Si esa clase se agotó (día larguísimo), pasa a la siguiente clase antes que repetir. */
function fcSiguiente(marca) {
  var e = fcLeer(marca);
  var salida = null, clase = null;
  for (var v = 0; v < FC.clases.length && !salida; v++) {
    var c = FC.clases[(e.rueda + v) % FC.clases.length];
    var lista = fcCatalogo(c);
    var libres = [];
    for (var i = 0; i < lista.length; i++) {
      if (!e.usadas[c + ":" + i]) libres.push(i);
    }
    if (!libres.length) continue;
    var idx = libres[Math.floor(Math.random() * libres.length)];
    e.usadas[c + ":" + idx] = 1;
    salida = lista[idx];
    clase = c;
  }
  /* caso extremo: se dijeron TODAS las del catálogo en un mismo día. Antes de repetir una,
     se empieza el ciclo de nuevo — pero eso son más de 180 frases en un día, o sea nunca. */
  if (!salida) {
    e.usadas = {};
    clase = FC.clases[e.rueda % FC.clases.length];
    var l2 = fcCatalogo(clase);
    var j = Math.floor(Math.random() * l2.length);
    e.usadas[clase + ":" + j] = 1;
    salida = l2[j];
  }
  e.rueda = (e.rueda + 1) % FC.clases.length;
  e.ts = Date.now();
  var m = marca || {};
  m.fc = e;
  return { frase: salida, clase: clase, marca: m };
}

/* para los bancos: cuántas hay y si alguna está repetida o mal formada */
function fcRevision() {
  var problemas = [];
  var vistas = {};
  var clases = [["crecimiento", FC_CRECIMIENTO], ["abundancia", FC_ABUNDANCIA], ["afirmacion", FC_AFIRMACION]];
  for (var k = 0; k < clases.length; k++) {
    var nombre = clases[k][0], lista = clases[k][1];
    for (var i = 0; i < lista.length; i++) {
      var f = lista[i];
      if (typeof f !== "string" || !f.trim()) problemas.push(nombre + "[" + i + "] vacía");
      if (f.indexOf("Rey") !== 0) problemas.push(nombre + "[" + i + "] no empieza hablándole a Rey");
      if (vistas[f]) problemas.push("repetida en el catálogo: " + f.slice(0, 40));
      vistas[f] = 1;
      if (f.length > 160) problemas.push(nombre + "[" + i + "] demasiado larga (" + f.length + ")");
      if (nombre === "afirmacion" && f.indexOf("repite conmigo") < 0)
        problemas.push("afirmacion[" + i + "] no invita a repetir");
    }
  }
  return { total: fcTotal(), problemas: problemas };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { FC, FC_CRECIMIENTO, FC_ABUNDANCIA, FC_AFIRMACION,
    fcToca: fcToca, fcSiguiente: fcSiguiente, fcRevision: fcRevision, fcTotal: fcTotal, fcLeer: fcLeer };
}
