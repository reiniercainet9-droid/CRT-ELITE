/* ============================================================================
   ✏️ ROBERTO — el rostro y el cuerpo del mentor de Rey  (v1, 2026-08-31)
   ----------------------------------------------------------------------------
   Pedido de Rey: "ponerle cara a Roberto… un lapicito animado con manos, ojos,
   boca y cejas que haga gestos acordes con lo que habla — y que con solo ver
   sus expresiones ya sepa lo que me quiere decir, sin oírlo ni leerlo".
   Segunda vuelta: "todo tipo de expresiones para cada caso SIN REPETIR NINGUNA,
   además del carisma, los chistes y la risa".

   UN SOLO ARCHIVO manda: de aquí sale el Roberto de la demo Y el de Apex.
   · 33 estados, cada uno con su POSE PROPIA (ninguna se repite)
   · piezas independientes (ojos · cejas · boca · brazos+manos · cuerpo · efecto)
     ⇒ añadir un gesto nuevo es una línea en ROB_EMO, no rediseñarlo

   API:
     Roberto.montar(elemento, {tam:"grande"|"mini"})  → lo dibuja dentro
     Roberto.poner("celebra")                          → cambia de gesto
     Roberto.hablar(texto)                             → boca sincronizada
     Roberto.callar()                                  → detiene la boca
     Roberto.gestoDe(textoOAviso)                      → adivina el gesto del texto
     Roberto.lista()                                   → todos los estados
   ============================================================================ */
(function (raiz) {
  "use strict";

  /* ── colores propios (no dependen del tema de Apex: él siempre se ve igual) ── */
  var ROB_CSS = `
  .rob-svg{overflow:visible; display:block; width:100%; height:100%}
  /* 🎬 v7.15 — el instante en el que se reinicia su animación. NO le quita la pose: solo
     congela lo que se mueve durante un fotograma, para que la animación arranque de cero.
     Antes esto se hacía borrándole el cuerpo, y ahí Roberto desaparecía y volvía. */
  .rob-svg.rob-recongela, .rob-svg.rob-recongela *{animation:none!important;transition:none!important}
  .rob-svg [data-cuerpo="flota"]   .rob-todo{animation:robFlota 3.6s ease-in-out infinite}
  .rob-todo{transform-origin:180px 300px}
  .rob-svg{--rj:#22305f;--rj2:#16204a;--rmad:#f4ac3c;--rmad2:#d3841c;--roro:#f0c95c;--roro2:#b8933a;
           --rcam:#fbf7ec;--rgu:#fdfcf7;--rgu2:#c9c2ac;--rtz:#3a2a10;--rcor:#ff6f61;--rteal:#4fe0c0;
           --rsud:#3d6bb5;--rsud2:#2d5292;--rbata:#7a5aa8;--rbata2:#5f4489}
  /* ⚠️ TODAS sus animaciones llevan !important A PROPÓSITO (31-08): Apex tiene una regla
     global *{animation:none!important} para "menos movimiento", y sin esto Roberto se
     quedaba de ESTATUA en cuanto el teléfono pedía reducir animaciones. Sus gestos son
     su IDIOMA, no un adorno decorativo: tienen que moverse. */
  [data-cuerpo="flota"]   .rob-todo{animation:robFlota 3.6s ease-in-out infinite!important}
  [data-cuerpo="lento"]   .rob-todo{animation:robFlota 6s ease-in-out infinite!important}
  [data-cuerpo="brinca"]  .rob-todo{animation:robBrinca .55s ease-in-out infinite!important}
  [data-cuerpo="tiembla"] .rob-todo{animation:robTiembla .12s linear infinite!important}
  [data-cuerpo="inclina"] .rob-todo{animation:robInclina 3.4s ease-in-out infinite!important}
  [data-cuerpo="rie"]     .rob-todo{animation:robRie .38s ease-in-out infinite!important}
  [data-cuerpo="chulo"]   .rob-todo{animation:robChulo 2.6s ease-in-out infinite!important}
  [data-cuerpo="firme"]   .rob-todo{animation:none!important}
  [data-cuerpo="salto"]   .rob-todo{animation:robSalto .5s ease-out!important}
  @keyframes robFlota{0%,100%{transform:translateY(0) rotate(0deg) scaleX(1)}50%{transform:translateY(-9px) rotate(1.1deg) scaleX(.984)}}
  /* 🧊 v7.58 — QUE EL FLOTAR SE VEA EN VOLUMEN, NO EN PLANO.
     ⚠️ Aquí primero probé PARALAJE (que el sombrero flotara a distinta velocidad que la
     cabeza) y está MAL PENSADO: el paralaje funciona cuando se mueve la cámara, no cuando
     se mueve el personaje entero — su sombrero va SOBRE su cabeza, y moverlo a otro ritmo
     se lo despega. Se descartó antes de que llegara a su teléfono.
     Lo que SÍ da volumen sin despegar nada: que al subir se incline un poco y se estreche
     un pelín (menos de un 2%), como se estrecha cualquier cosa que gira levemente hacia un
     lado. Es el mismo cuerpo, la misma animación y los mismos saltitos: solo que ahora el
     movimiento tiene tres dimensiones en vez de dos. */
  @keyframes robBrinca{0%,100%{transform:translateY(0) rotate(-2.5deg)}50%{transform:translateY(-18px) rotate(2.5deg)}}
  @keyframes robTiembla{0%,100%{transform:translate(-2px,0)}50%{transform:translate(2px,-1px)}}
  @keyframes robInclina{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(2deg)}}
  @keyframes robRie{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-8px) rotate(4deg)}}
  @keyframes robChulo{0%,100%{transform:rotate(-4deg) translateY(0)}50%{transform:rotate(-4deg) translateY(-6px)}}
  @keyframes robSalto{0%{transform:translateY(0)}40%{transform:translateY(-26px) scale(1.04)}100%{transform:translateY(0)}}

  /* ojos */
  .rob-oj{display:none}
  [data-ojos="normales"] .rob-oj-ab,[data-ojos="grandes"] .rob-oj-ab,[data-ojos="lado"] .rob-oj-ab,
  [data-ojos="brillo"] .rob-oj-ab,[data-ojos="tristes"] .rob-oj-ab,[data-ojos="entrecerrados"] .rob-oj-ab,
  [data-ojos="arriba"] .rob-oj-ab,[data-ojos="gafas"] .rob-oj-ab{display:block}
  [data-ojos="grandes"] .rob-globos{transform:scale(1.16); transform-origin:180px 190px}
  [data-ojos="brillo"] .rob-oj-star{display:block}
  [data-ojos="lado"] .rob-pup{transform:translate(9px,-8px)}
  [data-ojos="arriba"] .rob-pup{transform:translateY(-11px)}
  [data-ojos="tristes"] .rob-pup{transform:translateY(5px)}
  [data-ojos="entrecerrados"] .rob-oj-parp{display:block}
  [data-ojos="felices"] .rob-oj-fel{display:block}
  [data-ojos="dormidos"] .rob-oj-dor{display:block}
  [data-ojos="corazon"] .rob-oj-cor{display:block}
  [data-ojos="guino"] .rob-oj-gui{display:block}
  [data-ojos="gafas"] .rob-oj-gaf{display:block}
  .rob-pup{transition:transform .3s} .rob-globos{transition:transform .25s}
  /* 👁️ PARPADEO DE VERDAD (arreglado el 31-08 — Rey: "los ojos saltan o desaparecen, no es
     un pestañeo normal"). Dos fallos: (1) en SVG el origen de la escala es la esquina del
     lienzo, no el centro del ojo, así que al encogerlos SALÍAN DISPARADOS hacia arriba —
     ahora el origen está clavado en el centro de los ojos (180,190); (2) el grupo tenía a
     la vez una transición y una animación sobre lo mismo, y peleaban entre sí — por eso el
     parpadeo va ahora en su propio grupo. Ritmo real: cierre y apertura en ~190 ms, y un
     parpadeo cada ~4,5 s (una persona parpadea cada 3-6 s). */
  /* 👃 RESPIRACIÓN — la nariz se ensancha y se encoge sin parar, como el pecho.
     Es el movimiento pequeño y CONSTANTE que hace que Roberto parezca vivo incluso
     cuando no está haciendo ningún gesto. Lleva !important como el resto de sus
     animaciones, para ganarle al 'sin animaciones' del teléfono de Rey. */
  .rob-nariz{transform-origin:180px 218px; animation:robRespira 3.4s ease-in-out infinite!important}
  @keyframes robRespira{0%,100%{transform:scaleX(1) scaleY(1)}50%{transform:scaleX(1.09) scaleY(.97)}}
  /* olfateando: respira más rápido y más marcado */
  [data-fx="olor"] .rob-nariz{animation:robOlfatea .7s ease-in-out infinite!important}
  @keyframes robOlfatea{0%,100%{transform:scaleX(1) translateY(0)}50%{transform:scaleX(1.22) translateY(-1.5px)}}
  .rob-parpadeo{transform-origin:180px 190px}
  [data-ojos="normales"] .rob-parpadeo,[data-ojos="lado"] .rob-parpadeo,
  [data-ojos="grandes"] .rob-parpadeo,[data-ojos="tristes"] .rob-parpadeo{animation:robPest 4.5s infinite!important}
  @keyframes robPest{0%,92%,96%,100%{transform:scaleY(1)}94%{transform:scaleY(.05)}}

  /* cejas */
  .rob-ci,.rob-cd{transform-box:fill-box; transform-origin:center; transition:transform .25s}
  [data-cejas="altas"] .rob-ci,[data-cejas="altas"] .rob-cd{transform:translateY(-9px)}
  [data-cejas="muyaltas"] .rob-ci{transform:translateY(-14px) rotate(-6deg)}
  [data-cejas="muyaltas"] .rob-cd{transform:translateY(-14px) rotate(6deg)}
  [data-cejas="alegres"] .rob-ci{transform:translateY(-6px) rotate(-9deg)}
  [data-cejas="alegres"] .rob-cd{transform:translateY(-6px) rotate(9deg)}
  [data-cejas="serias"] .rob-ci{transform:translateY(5px) rotate(15deg)}
  [data-cejas="serias"] .rob-cd{transform:translateY(5px) rotate(-15deg)}
  [data-cejas="tristes"] .rob-ci{transform:translateY(-3px) rotate(-17deg)}
  [data-cejas="tristes"] .rob-cd{transform:translateY(-3px) rotate(17deg)}
  [data-cejas="duda"] .rob-ci{transform:translateY(-13px) rotate(-8deg)}
  [data-cejas="duda"] .rob-cd{transform:translateY(2px) rotate(4deg)}
  [data-cejas="picara"] .rob-ci{transform:translateY(-12px) rotate(-14deg)}
  [data-cejas="picara"] .rob-cd{transform:translateY(4px) rotate(-6deg)}
  [data-cejas="bajas"] .rob-ci,[data-cejas="bajas"] .rob-cd{transform:translateY(7px)}

  /* bocas */
  .rob-bo{display:none}
  [data-boca="sonrisa"] .rob-bo-son{display:block}
  [data-boca="sonrisota"] .rob-bo-sonta{display:block}
  [data-boca="carcajada"] .rob-bo-carc{display:block}
  [data-boca="grito"] .rob-bo-grito{display:block}
  [data-boca="o"] .rob-bo-o{display:block}
  [data-boca="recta"] .rob-bo-recta{display:block}
  [data-boca="hmm"] .rob-bo-hmm{display:block}
  [data-boca="triste"] .rob-bo-tri{display:block}
  [data-boca="mueca"] .rob-bo-mue{display:block}
  [data-boca="picara"] .rob-bo-pic{display:block}
  [data-boca="lengua"] .rob-bo-len{display:block}
  [data-boca="dientes"] .rob-bo-die{display:block}
  [data-boca="zzz"] .rob-bo-zzz{display:block}
  .rob-hablando .rob-bo{display:none!important}
  .rob-hablando .rob-bo-viva{display:block!important}
  /* 🗣️ BOCA AL HABLAR: antes se le sacudía a saltos aleatorios (parecía un tic, no habla).
     Ahora abre y cierra con ritmo continuo, como una boca de verdad al vocalizar. */
  .rob-hablando .rob-boca-viva{transform-box:fill-box; transform-origin:center;
    animation:robHabla .26s ease-in-out infinite alternate!important}
  @keyframes robHabla{from{transform:scaleY(.28)}to{transform:scaleY(1.35)}}
  /* 🖼️ SOLO LA CARA (avatar del chat y caritas de los avisos): a ese tamaño los brazos
     entran cortados por el borde y ensucian; el gesto se lee en cejas, ojos y boca. */
  .rob-solo-cara .rob-pose{display:none!important}

  /* poses */
  .rob-pose{display:none}
  /* 👋 SALUDO: el brazo pivota en el HOMBRO (antes giraba por el codo y quedaba raro) */
  .rob-agita{transform-box:fill-box; transform-origin:2% 96%; animation:robAgita .62s ease-in-out infinite!important}
  @keyframes robAgita{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(-24deg)}}
  [data-pose="arriba"] .rob-p-arriba{animation:robVibra .3s ease-in-out infinite!important}
  @keyframes robVibra{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  /* 👏 APLAUSO: las manos se JUNTAN y se separan (antes solo subían y bajaban: no era aplaudir) */
  [data-pose="aplaude"] .rob-p-aplaude{transform-box:fill-box; transform-origin:center;
    animation:robAplauso .26s ease-in-out infinite!important}
  @keyframes robAplauso{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.82) translateY(-2px)}}
  .rob-lupa{transform-box:fill-box; transform-origin:center; animation:robBusca 2.4s ease-in-out infinite!important}
  @keyframes robBusca{0%,100%{transform:translate(0,0)}50%{transform:translate(-7px,8px)}}
  .rob-indice{animation:robVibra .8s ease-in-out infinite!important}
  .rob-escribe{transform-box:fill-box; transform-origin:20% 50%; animation:robApunta .7s ease-in-out infinite!important}
  @keyframes robApunta{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,3px)}}
  /* 👉 lo que va HACIA REY se acerca y se aleja: vende que sale de la pantalla */
  .rob-empuja{transform-box:fill-box; transform-origin:center; animation:robEmpuja 1.5s ease-in-out infinite!important}
  @keyframes robEmpuja{0%,100%{transform:scale(1)}50%{transform:scale(1.16) translate(-6px,2px)}}

  /* efectos */
  .rob-fx{position:absolute; inset:0; pointer-events:none; display:none}
  [data-fx="confeti"] .rob-fx-conf{display:block}
  [data-fx="zzz"] .rob-fx-zzz{display:block}
  [data-fx="chispa"] .rob-fx-chi{display:block}
  [data-fx="sudor"] .rob-fx-sud{display:block}
  [data-fx="risa"] .rob-fx-risa{display:block}
  [data-fx="corazones"] .rob-fx-cor{display:block}
  .rob-conf{position:absolute; top:-14px; width:8px; height:13px; border-radius:2px; animation:robCae 1.7s linear infinite!important}
  @keyframes robCae{0%{transform:translateY(-10px) rotate(0)}100%{transform:translateY(420px) rotate(560deg); opacity:.1}}
  .rob-flota-ico{position:absolute; animation:robSube 2.6s ease-in infinite!important; opacity:0}
  @keyframes robSube{0%{transform:translateY(0) scale(.8)}22%{opacity:.95}100%{transform:translateY(-70px) scale(1.1); opacity:0}}
  .rob-chispa{position:absolute; animation:robCentella 1.4s ease-in-out infinite!important}
  @keyframes robCentella{0%,100%{opacity:.15; transform:scale(.7)}50%{opacity:1; transform:scale(1.15)}}
  .rob-sudor{position:absolute; animation:robGotea 1.6s ease-in infinite!important}
  @keyframes robGotea{0%{transform:translateY(0); opacity:.9}100%{transform:translateY(34px); opacity:0}}
  /* 🎬 MENOS MOVIMIENTO (el teléfono lo pide, o Rey lo eligió): Roberto NO se congela —
     sigue respirando, parpadeando y moviendo la boca, porque eso es cómo te habla. Lo que
     se calma son los brincos, las sacudidas y los confetis. Rey puede forzar la animación
     completa (.rob-anim-on) o apagarla del todo (.rob-anim-min) desde los ajustes. */
  @media (prefers-reduced-motion:reduce){
    html:not(.rob-anim-on) [data-cuerpo] .rob-todo{animation:robFlota 4.6s ease-in-out infinite!important}
    html:not(.rob-anim-on) .rob-fx *{animation:none!important}
    html:not(.rob-anim-on) .rob-agita,html:not(.rob-anim-on) .rob-lupa,
    html:not(.rob-anim-on) .rob-indice,html:not(.rob-anim-on) .rob-escribe,
    html:not(.rob-anim-on) .rob-empuja{animation:none!important}
  }
  html.rob-anim-min .rob-svg .rob-todo,html.rob-anim-min .rob-svg *,html.rob-anim-min .rob-fx *{animation:none!important}
  `;

  /* ── una mano = un guante blanco de mayordomo (4 formas) ── */
  var MANOS = `
  <g id="rgMano">
    <path d="M-13,-5 Q-15,-15 -6,-16 Q3,-19 10,-13 Q17,-10 15,1 Q13,13 1,15 Q-11,15 -13,4 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>
    <path d="M-5,-14 L-4,-2 M3,-16 L4,-4" stroke="var(--rgu2)" stroke-width="1.6" stroke-linecap="round" opacity=".75"/></g>
  <g id="rgPulgar">
    <path d="M-6,-12 Q-9,-27 -1,-27 Q6,-27 4,-11 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>
    <path d="M-12,-2 Q-12,-12 -2,-12 L8,-12 Q17,-12 17,-2 L17,7 Q17,15 8,15 L-2,15 Q-12,15 -12,5 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>
    <path d="M-4,-2 L12,-2 M-4,5 L12,5" stroke="var(--rgu2)" stroke-width="1.5" opacity=".7"/></g>
  <g id="rgPalma">
    <path d="M-14,-8 L-14,-24 Q-14,-30 -8,-30 Q-2,-30 -2,-24 L-2,-9 M-2,-10 L-2,-28 Q-2,-34 4,-34 Q10,-34 10,-28 L10,-10 M10,-10 L10,-26 Q10,-32 16,-32 Q21,-32 21,-26 L21,-8" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M-16,-8 Q-24,-18 -18,-22 Q-13,-25 -9,-14 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>
    <path d="M-16,-9 L22,-9 Q26,-9 26,-2 L26,8 Q26,18 14,18 L-6,18 Q-16,18 -16,7 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/></g>
  <g id="rgIndice">
    <path d="M-3,-8 L-3,-30 Q-3,-36 3,-36 Q9,-36 9,-30 L9,-8 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>
    <path d="M-13,-6 Q-13,-14 -4,-14 L10,-14 Q19,-14 19,-5 L19,6 Q19,16 8,16 L-3,16 Q-13,16 -13,5 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>
    <path d="M-5,-2 L13,-2 M-5,6 L13,6" stroke="var(--rgu2)" stroke-width="1.5" opacity=".7"/></g>
  <!-- 👉 HACIA TI (Rey, 31-08: "que me señale a MÍ, el dedo hacia la pantalla, como si me
       hablara de verdad"): mano en escorzo — el puño al fondo (pequeño = lejos) y la YEMA
       del dedo enorme al frente (grande = cerca). Rompe la pantalla y te apunta a ti. -->
  <g id="rgApuntaTi">
    <path d="M20,-46 Q20,-58 34,-58 L52,-58 Q66,-58 66,-44 L66,-16 Q66,-4 52,-4 L34,-4 Q20,-4 20,-18 Z" fill="#e6dfcd" stroke="var(--rgu2)" stroke-width="2.4"/>
    <path d="M28,-42 L58,-42 M28,-30 L58,-30 M28,-18 L58,-18" stroke="var(--rgu2)" stroke-width="1.8" opacity=".5"/>
    <path d="M34,-26 L6,-3" stroke="#f4efe1" stroke-width="24" stroke-linecap="round"/>
    <path d="M34,-26 L6,-3" stroke="var(--rgu2)" stroke-width="24" stroke-linecap="round" fill="none" opacity=".18"/>
    <ellipse cx="3" cy="3" rx="23" ry="22" fill="#2a2415" opacity=".28"/>
    <ellipse cx="0" cy="0" rx="22" ry="21" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="3"/>
    <ellipse cx="-7" cy="-7" rx="8" ry="6" fill="#fff" opacity=".75"/></g>
  <!-- 🤜 PUÑO HACIA TI (chócalas de verdad, contra la pantalla) -->
  <g id="rgPunoTi">
    <ellipse cx="0" cy="0" rx="23" ry="22" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.6"/>
    <path d="M-17,-9 Q0,-15 17,-9 M-17,2 Q0,-4 17,2" stroke="var(--rgu2)" stroke-width="2.2" fill="none"/>
    <circle cx="-10" cy="11" r="7.5" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/></g>`;

  /* ── las 33 poses, cada una con brazos + manos propios (ninguna repetida) ── */
  function brazo(d) { return '<path d="' + d + '" stroke="var(--rj)" stroke-width="16" fill="none" stroke-linecap="round"/>'; }
  function mano(id, t) { return '<use href="#' + id + '" transform="' + t + '"/>'; }
  /* 📱 EL MÓVIL AGARRADO — el teléfono más los cuatro dedos cruzando el canto (con hueco
     entre ellos, que es lo que los hace leerse como dedos) y el pulgar en la pantalla.
     Se dibuja en su propio sistema de coordenadas y se coloca con un transform, así el
     mismo dibujo sirve para cualquier gesto que lo use. */
  function movilEnMano(t) {
    return '<g transform="' + t + '">' +
      '<path d="M232 274 Q226 274 226 281 Q226 288 232 288 L242 288 L242 274 Z" fill="var(--rgu2)" opacity=".35"/>' +
      '<rect x="238" y="264" width="36" height="62" rx="7" fill="#15161c" stroke="var(--rgu2)" stroke-width="2"/>' +
      '<rect x="243" y="272" width="26" height="46" rx="3" fill="var(--rteal)" class="rob-pantalla"/>' +
      '<path d="M246 308 L252 296 L258 302 L266 284" stroke="#0d3a33" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="256" cy="322" r="2.4" fill="var(--rgu2)"/>' +
      '<path d="M231 270 L250 270 Q255 270 255 275.5 Q255 281 250 281 L231 281 Q226 281 226 275.5 Q226 270 231 270 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
      '<path d="M230 284 L251 284 Q256 284 256 289.5 Q256 295 251 295 L230 295 Q225 295 225 289.5 Q225 284 230 284 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
      '<path d="M231 298 L249 298 Q254 298 254 303 Q254 308 249 308 L231 308 Q226 308 226 303 Q226 298 231 298 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
      '<path d="M233 311 L245 311 Q249 311 249 315.5 Q249 320 245 320 L233 320 Q229 320 229 315.5 Q229 311 233 311 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
      '<path d="M240 272.5 L240 278.5 M239 286.5 L239 292.5 M240 300.5 L240 305.5" stroke="var(--rgu2)" stroke-width="1.6" opacity=".65" stroke-linecap="round"/>' +
      '<path d="M247 328 Q243 315 252 311 Q262 307 266 316 Q269 325 261 329 Q253 333 247 328 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
      '<path d="M254 318 Q259 315 262 319" stroke="var(--rgu2)" stroke-width="1.5" fill="none" opacity=".7"/>' +
      '</g>';
  }

  /* ══ 👔 EL ARMARIO (v6.90, pedido de Rey) ═══════════════════════════════════════════
     "que use la corbata mientras está en el horario del mercado, Wall Street, y fuera de
     él se cambie a ropa casual y también de casa".
     Su traje de mayordomo era la ÚNICA ropa que podía tener porque estaba clavada dentro
     del dibujo. Ahora es una prenda más del armario: "wallstreet" es EXACTAMENTE el traje
     de siempre, sacado tal cual, así que por defecto no cambia nada.
     Se enseña la que toque con data-ropa, igual que las poses con data-pose. */
  /* ══ 🎨 CÓMO SE DIBUJA UNA PRENDA (v7.54) ═════════════════════════════════════════
     Rey (06-09) pidió muchísima más ropa y colores. Dibujar veinte prendas a mano habría
     sido veinte sitios donde equivocarse y veinte que retocar cada vez que cambie algo.
     Así que las prendas se CONSTRUYEN: una silueta común y unos pocos moldes (traje,
     sudadera, bata, polo, chándal, camisa, pijama), y cada muda es ese molde con SUS
     colores. Añadir una camisa nueva es una línea, no un dibujo.
     🎨 LA REGLA DEL COLOR, que es suya: Roberto es AMARILLO. Así que la ropa va en tonos
     que contrastan con él —negros, azules, granates, verdes profundos, grises— y los
     detalles claros (camisa, cordones, ribetes) le separan la ropa del cuerpo. Nada de
     amarillos ni naranjas en la ropa: se le fundirían con la madera del lápiz. */
  /* 👕 v7.55 — LA SILUETA DE TODA SU ROPA.
     El lápiz va de 144,6 a 215,4 a la altura del pecho. La ropa lleva un vuelo de 2 px por
     lado (que es lo que hace que parezca ropa y no pintura sobre el cuerpo) y los HOMBROS
     REDONDEADOS, para que abrace su cabeza rectangular en vez de montarse encima como una
     caja. Antes iba de 140 a 220 con esquinas rectas: sobresalía casi 5 px por lado. */
  var _SIL = 'M151 266 H209 Q217 266 217.4 274 L215 376 H145 L142.6 274 Q143 266 151 266 Z';
  function _cuerpo(tela) { return '<path d="' + _SIL + '" fill="' + tela + '"/>'; }

  /* 👔 TRAJE — chaqueta, solapas, camisa y corbata. El molde de su ropa de trabajo. */
  function _traje(o) {
    return _cuerpo(o.tela) +
      '<path d="M160 270 L200 270 L192 306 L180 322 L168 306 Z" fill="' + o.camisa + '"/>' +
      '<path d="M147 269 L166 269 L152 314 L144.5 306 Z" fill="' + o.tela2 + '"/>' +
      '<path d="M213 269 L194 269 L208 314 L215.5 306 Z" fill="' + o.tela2 + '"/>' +
      '<path d="M166 270 L180 292 L163 288 Z" fill="' + o.camisa + '"/>' +
      '<path d="M194 270 L180 292 L197 288 Z" fill="' + o.camisa + '"/>' +
      '<path d="M172 286 L188 286 L191 300 L180 306 L169 300 Z" fill="' + o.corb + '" stroke="var(--rtz)" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M172 286 L180 292 L188 286" fill="none" stroke="' + o.corb2 + '" stroke-width="2"/>' +
      '<path class="rob-corbata" d="M180 306 L193 314 L186 352 L180 360 L174 352 L167 314 Z" fill="' + o.corb + '" stroke="var(--rtz)" stroke-width="2.6" stroke-linejoin="round"/>' +
      (o.raya ? '<path d="M172 322 L188 330 M170 336 L186 344" stroke="' + o.corb2 + '" stroke-width="3.4" opacity=".85"/>' : '') +
      '<circle cx="180" cy="368" r="3.4" fill="' + o.corb + '"/>' +
      (o.panuelo ? '<path d="M199 316 L209 316 L204 308 Z" fill="' + o.panuelo + '" opacity=".92"/>' : '');
  }

  /* 👕 SUDADERA con capucha y cordones. Su ropa de la tarde. */
  function _sudadera(o) {
    return _cuerpo(o.tela) +
      '<path d="M143 274 L217 274 L215 292 L145 292 Z" fill="' + o.tela2 + '"/>' +
      '<path d="M158 266 Q180 298 202 266 Q180 256 158 266 Z" fill="' + o.tela2 + '"/>' +
      '<path class="rob-cordon" d="M172 286 L172 322" stroke="' + o.cordon + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path class="rob-cordon" d="M188 286 L188 318" stroke="' + o.cordon + '" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="172" cy="324" r="3.2" fill="' + o.cordon + '"/><circle cx="188" cy="320" r="3.2" fill="' + o.cordon + '"/>' +
      '<path d="M152 330 Q180 342 208 330 L208 348 Q180 358 152 348 Z" fill="' + o.tela2 + '" opacity=".7"/>' +
      (o.pecho ? '<text x="180" y="318" font-size="26" text-anchor="middle">' + o.pecho + '</text>' : '');
  }

  /* 🥼 BATA de casa con su cinturón. Su ropa de noche. */
  function _bata(o) {
    return _cuerpo(o.tela) +
      '<path d="M162 270 L180 316 L198 270 L212 270 L192 330 L168 330 L148 270 Z" fill="' + o.tela2 + '"/>' +
      '<path d="M180 292 L180 330" stroke="' + o.tela2 + '" stroke-width="2.4" opacity=".6"/>' +
      '<rect x="146" y="330" width="68" height="13" rx="5" fill="' + o.tela2 + '"/>' +
      '<path class="rob-cinto" d="M186 336 Q206 344 200 362" stroke="' + o.tela2 + '" stroke-width="6" fill="none" stroke-linecap="round"/>';
  }

  /* 👟 POLO con su cuello y sus dos botones. */
  function _polo(o) {
    return _cuerpo(o.tela) +
      '<path d="M162 270 L180 292 L198 270 L206 274 L192 300 L168 300 L154 274 Z" fill="' + o.cuello + '"/>' +
      '<path d="M180 292 L180 328" stroke="' + o.cuello + '" stroke-width="2.6" opacity=".8"/>' +
      '<circle cx="180" cy="304" r="2.8" fill="' + o.cuello + '"/><circle cx="180" cy="318" r="2.8" fill="' + o.cuello + '"/>' +
      '<rect x="149" y="360" width="62" height="8" rx="3" fill="' + o.cuello + '" opacity=".5"/>';
  }

  /* 🏃 CHÁNDAL con sus bandas laterales. Fin de semana por la mañana. */
  /* 🏃 CHÁNDAL — v7.55: las bandas van METIDAS HACIA DENTRO, con tela por fuera. Antes
     iban pegadas al canto y Rey las vio como "bordes blancos": una raya en el borde mismo
     no se lee como raya, se lee como contorno. */
  function _chandal(o) {
    return _cuerpo(o.tela) +
      '<path d="M151 282 L156 282 L153.5 368 L148.5 368 Z" fill="' + o.banda + '" opacity=".8"/>' +
      '<path d="M204 282 L209 282 L206.5 368 L201.5 368 Z" fill="' + o.banda + '" opacity=".8"/>' +
      '<path d="M158 268 Q180 288 202 268 L202 282 Q180 300 158 282 Z" fill="' + o.tela2 + '"/>' +
      '<path d="M180 300 L180 336" stroke="' + o.banda + '" stroke-width="4" stroke-linecap="round" opacity=".85"/>' +
      '<path d="M150 330 L210 330" stroke="' + o.banda + '" stroke-width="5" opacity=".55"/>';
  }

  /* 🪵 CAMISA de cuadros — la de leñador, con su bolsillo. */
  function _cuadros(o) {
    return _cuerpo(o.tela) +
      '<path d="M145 286 L216 286 M145 310 L216 310 M145 334 L215 334 M145 358 L215 358" stroke="' + o.linea + '" stroke-width="3.4" opacity=".75"/>' +
      '<path d="M158 272 L157 374 M180 272 L180 374 M202 272 L203 374" stroke="' + o.linea + '" stroke-width="3.4" opacity=".75"/>' +
      '<path d="M162 270 L180 300 L198 270 L208 272 L192 314 L168 314 L152 272 Z" fill="' + o.tela2 + '"/>' +
      '<rect x="192" y="322" width="20" height="18" rx="3" fill="' + o.tela2 + '" opacity=".9"/>';
  }

  /* 🌴 CAMISA HAWAIANA — la del domingo por la tarde. */
  function _hawaiana(o) {
    return _cuerpo(o.tela) +
      '<path d="M162 270 L180 300 L198 270 L208 272 L192 314 L168 314 L152 272 Z" fill="' + o.tela2 + '"/>' +
      '<text x="158" y="336" font-size="19">🌴</text><text x="192" y="330" font-size="16">🌺</text>' +
      '<text x="152" y="368" font-size="15">🌺</text><text x="196" y="366" font-size="17">🌴</text>' +
      '<path d="M180 314 L180 376" stroke="' + o.tela2 + '" stroke-width="2.4" opacity=".7"/>';
  }

  /* 🛏️ PIJAMA de rayas con su bolsillo. La otra ropa de dormir. */
  function _pijama(o) {
    return _cuerpo(o.tela) +
      '<path d="M145 282 L216 282 M145 300 L216 300 M145 318 L216 318 M145 336 L215 336 M145 354 L215 354 M146 372 L214 372" stroke="' + o.raya + '" stroke-width="6" opacity=".85"/>' +
      '<path d="M162 270 L180 302 L198 270 L208 273 L192 316 L168 316 L152 273 Z" fill="' + o.tela2 + '"/>' +
      '<circle cx="180" cy="330" r="3" fill="' + o.tela2 + '"/><circle cx="180" cy="348" r="3" fill="' + o.tela2 + '"/>';
  }

  var ROPAS = {
    /* 👔 la de trabajar: traje, camisa, pajarita y corbata. La de siempre. */
    wallstreet:
      '<path d="M151 266 H209 Q217 266 217.4 274 L215 376 H145 L142.6 274 Q143 266 151 266 Z" fill="var(--rj)"/>' +
      '<path d="M160 270 L200 270 L192 306 L180 322 L168 306 Z" fill="var(--rcam)"/>' +
      '<path d="M147 269 L166 269 L152 314 L144.5 306 Z" fill="var(--rj2)"/>' +
      '<path d="M213 269 L194 269 L208 314 L215.5 306 Z" fill="var(--rj2)"/>' +
      '<path d="M166 270 L180 292 L163 288 Z" fill="#fff"/><path d="M194 270 L180 292 L197 288 Z" fill="#fff"/>' +
      '<path d="M172 286 L188 286 L191 300 L180 306 L169 300 Z" fill="var(--roro)" stroke="var(--rtz)" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M172 286 L180 292 L188 286" fill="none" stroke="var(--roro2)" stroke-width="2"/>' +
      '<path class="rob-corbata" d="M180 306 L193 314 L186 352 L180 360 L174 352 L167 314 Z" fill="var(--roro)" stroke="var(--rtz)" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M172 322 L188 330 M170 336 L186 344" stroke="var(--roro2)" stroke-width="3.4" opacity=".85"/>' +
      '<circle cx="180" cy="368" r="3.4" fill="var(--roro)"/><path d="M198 322 L212 322 L205 311 Z" fill="var(--rcor)"/>',

    /* 👕 la de fuera del mercado: sudadera con capucha y cordones. Sin corbata: cuando el
       mercado cierra, Roberto también se afloja. */
    casual:
      '<path d="M151 266 H209 Q217 266 217.4 274 L215 376 H145 L142.6 274 Q143 266 151 266 Z" fill="var(--rsud)"/>' +
      '<path d="M143 274 L217 274 L215 292 L145 292 Z" fill="var(--rsud2)"/>' +
      '<path d="M158 266 Q180 298 202 266 Q180 256 158 266 Z" fill="var(--rsud2)"/>' +
      '<path d="M172 286 L172 322" stroke="var(--rgu)" stroke-width="4" stroke-linecap="round" class="rob-cordon"/>' +
      '<path d="M188 286 L188 318" stroke="var(--rgu)" stroke-width="4" stroke-linecap="round" class="rob-cordon"/>' +
      '<circle cx="172" cy="324" r="3.2" fill="var(--rgu)"/><circle cx="188" cy="320" r="3.2" fill="var(--rgu)"/>' +
      '<path d="M152 330 Q180 342 208 330 L208 348 Q180 358 152 348 Z" fill="var(--rsud2)" opacity=".7"/>',

    /* 🏠 la de casa: bata de estar por casa con su cinturón. Fines de semana y madrugada. */
    casa:
      '<path d="M151 266 H209 Q217 266 217.4 274 L215 376 H145 L142.6 274 Q143 266 151 266 Z" fill="var(--rbata)"/>' +
      '<path d="M162 270 L180 316 L198 270 L212 270 L192 330 L168 330 L148 270 Z" fill="var(--rbata2)"/>' +
      '<path d="M180 292 L180 330" stroke="var(--rbata2)" stroke-width="2.4" opacity=".6"/>' +
      '<rect x="146" y="330" width="68" height="13" rx="5" fill="var(--rbata2)"/>' +
      '<path d="M186 336 Q206 344 200 362" stroke="var(--rbata2)" stroke-width="6" fill="none" stroke-linecap="round" class="rob-cinto"/>',

    /* 🎄 diciembre: traje rojo con ribete blanco y su cinturón */
    navidad:
      '<path d="M151 266 H209 Q217 266 217.4 274 L215 376 H145 L142.6 274 Q143 266 151 266 Z" fill="#c0392b"/>' +
      '<path d="M143 274 L217 274 L216 288 L144 288 Z" fill="#fbf7ec"/>' +
      '<path d="M160 288 Q180 312 200 288 Q180 280 160 288 Z" fill="#fbf7ec"/>' +
      '<rect x="146" y="326" width="68" height="16" rx="4" fill="#2b2b2b"/>' +
      '<rect x="170" y="326" width="20" height="16" rx="3" fill="var(--roro)"/>' +
      '<circle cx="180" cy="356" r="4" fill="#fbf7ec"/><circle cx="180" cy="368" r="4" fill="#fbf7ec"/>',

    /* 🎉 días de celebrar: esmoquin con pajarita dorada */
    fiesta:
      '<path d="M151 266 H209 Q217 266 217.4 274 L215 376 H145 L142.6 274 Q143 266 151 266 Z" fill="#1b1b28"/>' +
      '<path d="M160 270 L200 270 L192 306 L180 322 L168 306 Z" fill="var(--rcam)"/>' +
      '<path d="M147 269 L166 269 L152 314 L144.5 306 Z" fill="#2a2a3d"/>' +
      '<path d="M213 269 L194 269 L208 314 L215.5 306 Z" fill="#2a2a3d"/>' +
      '<path d="M166 288 L180 300 L166 312 Z" fill="var(--roro)" stroke="var(--rtz)" stroke-width="2.2"/>' +
      '<path d="M194 288 L180 300 L194 312 Z" fill="var(--roro)" stroke="var(--rtz)" stroke-width="2.2"/>' +
      '<circle cx="180" cy="300" r="4.4" fill="var(--roro2)"/>' +
      '<circle cx="180" cy="336" r="3.2" fill="var(--roro)"/><circle cx="180" cy="352" r="3.2" fill="var(--roro)"/>',

    /* ══ 👔 SUS TRAJES DE TRABAJO (v7.54) — el mismo molde, cinco caracteres distintos.
       Rey los pidió por color: "uno negro, otro rojo, otro azul, según el contraste". */
    trajeNegro:   _traje({ tela:"#1c1c24", tela2:"#2b2b38", camisa:"#f4f6fb", corb:"#c0392b", corb2:"#8e2a20", raya:true, panuelo:"#f4f6fb" }),
    trajeAzul:    _traje({ tela:"#1d3461", tela2:"#2a4a86", camisa:"#dfeaff", corb:"#8e2a3f", corb2:"#6a1f2f", panuelo:"#dfeaff" }),
    trajeGranate: _traje({ tela:"#6b1f2b", tela2:"#8a2b39", camisa:"#f7f2ec", corb:"#20303f", corb2:"#16222d", raya:true, panuelo:"#f7f2ec" }),
    trajeGris:    _traje({ tela:"#454a56", tela2:"#5a606f", camisa:"#ffffff", corb:"#2f7d6b", corb2:"#20594d", panuelo:"#cfe4de" }),
    trajeVerde:   _traje({ tela:"#1f4034", tela2:"#2d5a48", camisa:"#f2efe4", corb:"#c9a227", corb2:"#9c7d1c", raya:true }),

    /* ══ 👕 SU ROPA DE TARDE — cuando el mercado cierra, se afloja. */
    sudaderaAzul:    _sudadera({ tela:"#24406b", tela2:"#1a3054", cordon:"#dfe6f2" }),
    sudaderaVerde:   _sudadera({ tela:"#2b5d4a", tela2:"#1f4638", cordon:"#e6f0e9" }),
    sudaderaGranate: _sudadera({ tela:"#7a2b34", tela2:"#5d1f27", cordon:"#f2e3e3" }),
    sudaderaApex:    _sudadera({ tela:"#1b2233", tela2:"#131826", cordon:"#e8b93b", pecho:"📈" }),
    camisaCuadros:   _cuadros({ tela:"#8c3b32", tela2:"#6d2c25", linea:"#2a1a17" }),
    poloBlanco:      _polo({ tela:"#eef1f5", cuello:"#39506e" }),

    /* ══ 🌙 SU ROPA DE NOCHE Y DE CASA. */
    bataVino:    _bata({ tela:"#5c2333", tela2:"#7d3247" }),
    bataVerde:   _bata({ tela:"#25473c", tela2:"#356354" }),
    pijamaRayas: _pijama({ tela:"#2b3a63", raya:"#4a5f96", tela2:"#dfe6f2" }),
    pijamaGris:  _pijama({ tela:"#3b3f4a", raya:"#565c6b", tela2:"#e2e5ea" }),
    chandalGris: _chandal({ tela:"#3a3f47", tela2:"#4a5058", banda:"#b9c0ca" }),

    /* ══ 🌞 SUS FINES DE SEMANA — ropa que NO se pone entre semana, para que se note
       que es sábado. Rey (06-09): "los fines de semana, sábado y domingo, igual: tres
       cambios de ropa distintas". */
    chandalAzul:  _chandal({ tela:"#1f3b73", tela2:"#2a4f95", banda:"#cfdcf5" }),
    chandalVerde: _chandal({ tela:"#204b3b", tela2:"#2c6650", banda:"#e8b93b" }),
    poloVerde:    _polo({ tela:"#2f6f5c", cuello:"#f2efe4" }),
    poloVino:     _polo({ tela:"#7c2f3d", cuello:"#f7f2ec" }),
    hawaiana:     _hawaiana({ tela:"#0f6f7a", tela2:"#e8f4f2" }),
    hawaianaRoja: _hawaiana({ tela:"#a63b2f", tela2:"#f9ece1" }),
  };

  /* ══ 🎩 LOS ACCESORIOS ═══════════════════════════════════════════════════════════════
     Se llevan VARIOS a la vez: data-acc="gorra movil". Van dibujados DESPUÉS de la ropa
     para que queden por encima, y la gorra y el sombrero tapan su goma de borrar. */
  var ACCS = {
    gorra:
      '<path d="M138 86 Q180 34 222 86 Z" fill="var(--rteal)"/>' +
      '<rect x="136" y="82" width="88" height="10" rx="4" fill="#2f9c86"/>' +
      '<path d="M224 84 Q262 88 256 102 L224 96 Z" fill="#2f9c86"/>' +
      '<circle cx="180" cy="46" r="5" fill="var(--roro)"/>',
    sombrero:
      '<ellipse cx="180" cy="92" rx="64" ry="12" fill="#2b2b3a"/>' +
      '<path d="M148 92 Q150 46 180 44 Q210 46 212 92 Z" fill="#38384d"/>' +
      '<rect x="147" y="76" width="66" height="13" fill="var(--rcor)"/>',
    gafasSol:
      '<path d="M124 176 H236 L232 200 Q230 212 216 212 H196 Q184 212 182 200 L180 190 L178 200 Q176 212 164 212 H144 Q130 212 128 200 Z" fill="#15161c" stroke="var(--roro)" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M136 186 L152 182" stroke="#fff" stroke-width="3.5" opacity=".55" stroke-linecap="round"/>',
    auriculares:
      /* la diadema pasa por ENCIMA de su goma y las almohadillas caen a la altura de
         donde tendría las orejas, no sobre los ojos */
      '<path d="M123 174 Q180 34 237 174" stroke="#2b2b3a" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      '<rect x="110" y="166" width="27" height="48" rx="12" fill="#2b2b3a"/>' +
      '<rect x="223" y="166" width="27" height="48" rx="12" fill="#2b2b3a"/>' +
      '<rect x="116" y="175" width="15" height="31" rx="7" fill="var(--rteal)" class="rob-auri"/>' +
      '<rect x="229" y="175" width="15" height="31" rx="7" fill="var(--rteal)" class="rob-auri"/>',
    /* 🧣 v7.65 — LA BUFANDA, REHECHA. Rey (06-09): "no me gustó esa bufanda ni el color, parece
       un paño tirado en el cuello, y la parte del cuello es demasiado ancho".
       Tenía las dos razones medidas: iba de x=138 a x=222 (84 de ancho) cuando SU CUERPO mide
       75 —o sea, le sobresalía por los dos lados como una tabla— y era del mismo coral que su
       goma de borrar, así que no se leía como prenda sino como un trapo del mismo material que
       él. Ahora: 56 de ancho (le entra dentro de los hombros), verde de punto, con su vuelta
       al cuello, su NUDO y el flequillo del extremo — que es lo que la hace bufanda y no paño. */
    bufanda:
      /* la vuelta al cuello, por detrás */
      '<path d="M154 258 Q180 274 206 258 L209 276 Q180 294 151 276 Z" fill="#2e7d6b"/>' +
      /* el punto: las rayas del tejido */
      '<path d="M162 266 L165 284" stroke="#49a08b" stroke-width="3" stroke-linecap="round" opacity=".85"/>' +
      '<path d="M177 271 L177 290" stroke="#49a08b" stroke-width="3" stroke-linecap="round" opacity=".85"/>' +
      '<path d="M192 268 L190 287" stroke="#49a08b" stroke-width="3" stroke-linecap="round" opacity=".85"/>' +
      /* el nudo, que es lo que dice "está anudada y no tirada encima" */
      '<path d="M189 274 Q203 271 206 283 Q208 294 196 294 Q186 293 187 283 Z" fill="#256a5a"/>' +
      /* el extremo que cae: estrecho y largo, que un extremo gordo vuelve a parecer un paño */
      '<path d="M194 292 Q201 316 197 340 L207 342 Q211 316 207 290 Z" fill="#2e7d6b" class="rob-fleco"/>' +
      '<path d="M198 340 L196 352 M202 341 L201 353 M206 342 L207 354" stroke="#256a5a" stroke-width="2.4" stroke-linecap="round" class="rob-fleco"/>',
    taza:
      '<rect x="232" y="306" width="34" height="32" rx="4" fill="var(--rgu)" stroke="var(--rtz)" stroke-width="2.4"/>' +
      '<path d="M266 314 Q280 322 266 330" stroke="var(--rtz)" stroke-width="3.4" fill="none"/>' +
      '<rect x="234" y="312" width="30" height="6" fill="var(--rcor)"/>' +
      '<path d="M242 300 Q238 290 244 282" stroke="var(--rgu2)" stroke-width="3" fill="none" stroke-linecap="round" class="rob-vapor"/>' +
      '<path d="M254 300 Q250 288 256 280" stroke="var(--rgu2)" stroke-width="3" fill="none" stroke-linecap="round" class="rob-vapor" style="animation-delay:.9s"/>',

    /* ══ 🌙 LOS DE LA NOCHE (v7.64) ══════════════════════════════════════════════════════
       Rey (06-09): "en vez de nada en la noche sería bueno agregar nuevos accesorios para cada
       ocasión, si la necesita, para no repetir la misma todo el tiempo".
       Antes, al quitarle la gorra y los auriculares del pijama, la noche se quedaba entre la
       bufanda y no llevar nada — o sea, la bufanda todas las noches. Estos tres son SUYOS de
       esa hora: dicen "se está acabando el día" igual que la taza dice "está en pie temprano". */

    /* 🎩 el gorro de dormir, caído hacia un lado y con su borla */
    gorroDormir:
      '<path d="M141 90 Q176 26 226 62 Q256 84 246 122 L230 116 Q244 88 214 72 Q182 54 154 94 Z" fill="var(--rcor)"/>' +
      '<rect x="133" y="82" width="94" height="14" rx="7" fill="var(--rgu)"/>' +
      '<circle cx="242" cy="126" r="13" fill="var(--rgu)"/>',

    /* 😴 el antifaz, subido a la frente: se lo acaba de quitar, no está dormido
       (⚠️ va en la FRENTE, entre la gorra y los ojos — nunca sobre los ojos: la regla sellada
        de Rey es que en su pantalla Roberto NUNCA aparece durmiendo) */
    antifaz:
      /* ⚠️ EN NEGRO NO SE LEÍA: sobre su cabeza parecía pelo, y las gomas gruesas a los lados
         parecían dos bigotes. Se dibujó, se miró y se cambió — en un azul suave, con la goma
         fina y pegada a la cabeza, ya se entiende que es un antifaz subido a la frente. */
      '<path d="M136 142 Q120 140 118 152" stroke="#454f7a" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M224 142 Q240 140 242 152" stroke="#454f7a" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M136 122 H224 Q236 122 236 134 V150 Q236 162 223 162 H197 Q189 162 185 156 L180 149 L175 156 Q171 162 163 162 H137 Q124 162 124 150 V134 Q124 122 136 122 Z" fill="#6a76ad"/>' +
      '<path d="M136 122 H224 Q236 122 236 134 V139 H124 V134 Q124 122 136 122 Z" fill="#7f8bc0"/>' +
      '<path d="M145 131 L166 128" stroke="#fff" stroke-width="3.6" opacity=".55" stroke-linecap="round"/>',

    /* 🧣 la manta por los hombros, como quien se sienta a terminar el día.
       ⚠️ La primera versión se dibujó y PARECÍA UN BABERO: la tela bajaba en el centro y los
       lados quedaban como dos alas verdes. Se redibujó al revés — la tela sube por detrás del
       cuello y cae por FUERA de los brazos, con sus pliegues — y ya se lee como una manta. */
    manta:
      '<path d="M120 300 Q118 256 180 248 Q242 256 240 300 Q180 274 120 300 Z" fill="#b8735a"/>' +
      '<path d="M120 292 Q112 332 122 362 Q140 356 156 358 Q148 322 150 286 Z" fill="#b8735a"/>' +
      '<path d="M240 292 Q248 332 238 362 Q220 356 204 358 Q212 322 210 286 Z" fill="#b8735a"/>' +
      '<path d="M136 300 Q142 330 138 354" stroke="#8f5340" stroke-width="3.2" fill="none" opacity=".7" stroke-linecap="round"/>' +
      '<path d="M224 300 Q218 330 222 354" stroke="#8f5340" stroke-width="3.2" fill="none" opacity=".7" stroke-linecap="round"/>',

    /* ✏️ y uno de TRABAJO: su lápiz en la oreja. Él es un lápiz, así que llevar el suyo
       encima mientras opera es su manera de decir "estoy anotando". */
    lapizOreja:
      /* ⚠️ 06-09 — REY: "el lápiz lo tiene en los ojos, no en la oreja". Tenía razón y era
         geometría: con el origen en (230,144) y 22° de inclinación, la PUNTA caía en (214,201)
         — o sea, DENTRO de la cabeza y justo a la altura de los ojos (que van de 176 a 212).
         Ahora nace más arriba y más afuera, así que el lápiz entero queda por fuera del
         costado de la cabeza (x≥233, y el borde de la cabeza está en 222) y la punta baja a la
         altura de la oreja, que es donde se lleva un lápiz. */
      '<g transform="translate(243,120) rotate(15)">' +
      '<rect x="0" y="0" width="13" height="44" fill="var(--rmad)"/>' +
      '<rect x="0" y="-11" width="13" height="11" rx="3.5" fill="var(--rcor)"/>' +
      '<rect x="0" y="0" width="13" height="7" fill="var(--roro)"/>' +
      '<path d="M0 44 L6.5 59 L13 44 Z" fill="var(--rmad2)"/>' +
      '<path d="M3.2 54 L6.5 59 L9.8 54 Z" fill="#2b2b3a"/>' +
      "</g>",
  };

  var POSES = {
    /* — te guía — */
    saluda:   brazo("M145 296 Q110 312 100 344") + mano("rgMano", "translate(98,348) rotate(14)") +
              '<g class="rob-agita">' + brazo("M215 296 Q254 276 264 234") + mano("rgPalma", "translate(266,236) rotate(12)") + '</g>',
    militar:  brazo("M145 296 Q126 328 132 356") + mano("rgMano", "translate(133,360)") +
              brazo("M215 296 Q258 274 236 214") + mano("rgPalma", "translate(232,204) rotate(96) scale(.92)"),
    senala:   brazo("M145 296 Q116 320 124 352") + mano("rgMano", "translate(125,356)") +
              brazo("M215 296 Q256 292 282 274") + mano("rgIndice", "translate(288,268) rotate(62)"),
    piensa:   brazo("M145 296 Q112 320 120 352") + mano("rgMano", "translate(121,356)") +
              brazo("M215 296 Q252 292 232 254 Q220 236 206 246") + mano("rgIndice", "translate(203,256) rotate(-24) scale(.92)"),
    lupa:     brazo("M145 296 Q114 318 122 350") + mano("rgMano", "translate(123,354)") +
              '<g class="rob-lupa">' + brazo("M215 296 Q258 282 262 232") + mano("rgMano", "translate(263,228)") +
              '<circle cx="264" cy="192" r="27" fill="rgba(180,220,255,.3)" stroke="var(--roro)" stroke-width="6"/>' +
              '<path d="M258 210 L264 226" stroke="var(--roro2)" stroke-width="8" stroke-linecap="round"/>' +
              '<path d="M250 178 Q256 172 264 172" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/></g>',
    indice:   brazo("M145 296 Q118 322 126 352") + mano("rgMano", "translate(127,356)") +
              '<g class="rob-indice">' + brazo("M215 296 Q256 280 258 226") + mano("rgIndice", "translate(259,220)") + '</g>',
    /* 📱 v7.54 — MIRANDO SU MÓVIL. El brazo sube, la mano lo agarra y con la otra lo señala.
       Antes esto era un accesorio suelto y salía como una tercera mano flotando. */
    movil:    brazo("M215 298 Q256 306 264 274") + movilEnMano("translate(30,-22) scale(.92)") +
              brazo("M145 296 Q120 296 156 280") + mano("rgIndice", "translate(160,278) rotate(46) scale(.88)"),
    escribe:  brazo("M145 296 Q104 300 86 316") + mano("rgMano", "translate(82,320) rotate(-40)") +
              '<rect x="60" y="316" width="62" height="46" rx="6" fill="var(--rcam)" stroke="var(--rgu2)" stroke-width="2.5"/>' +
              '<path d="M70 330 H112 M70 340 H112 M70 350 H98" stroke="var(--rgu2)" stroke-width="3" stroke-linecap="round"/>' +
              '<g class="rob-escribe">' + brazo("M215 296 Q248 306 236 336") + mano("rgIndice", "translate(233,342) rotate(178) scale(.9)") + '</g>',
    reloj:    brazo("M145 296 Q110 306 96 330") + mano("rgMano", "translate(92,334) rotate(-24)") +
              '<circle cx="92" cy="334" r="17" fill="none" stroke="var(--roro)" stroke-width="5"/>' +
              '<path d="M92 334 L92 324 M92 334 L100 338" stroke="var(--roro)" stroke-width="3.4" stroke-linecap="round"/>' +
              brazo("M215 296 Q244 306 226 330") + mano("rgIndice", "translate(214,336) rotate(200) scale(.9)"),
    /* — mercado — */
    pulgar:   brazo("M145 296 Q116 320 124 352") + mano("rgMano", "translate(125,356)") +
              brazo("M215 296 Q254 288 262 252") + mano("rgPulgar", "translate(264,246)"),
    pulgarNo: brazo("M145 296 Q116 320 124 352") + mano("rgMano", "translate(125,356)") +
              brazo("M215 300 Q256 314 264 348") + mano("rgPulgar", "translate(266,352) rotate(180)"),
    /* 👉 hacia Rey: el brazo casi no se ve (viene hacia la cámara) y la mano manda */
    apuntaTi: brazo("M145 296 Q120 322 128 352") + mano("rgMano", "translate(129,356)") +
              brazo("M215 300 Q244 292 264 282") +
              '<g class="rob-empuja">' + mano("rgApuntaTi", "translate(244,318)") + "</g>",
    /* la palma del ALTO va grande y al frente: te frena a TI, no al aire */
    alto:     brazo("M145 296 Q118 322 126 352") + mano("rgMano", "translate(127,356)") +
              brazo("M215 296 Q244 290 252 274") +
              '<g class="rob-empuja">' + mano("rgPalma", "translate(246,254) scale(1.55)") + "</g>",
    arriba:   '<g class="rob-p-arriba">' + brazo("M145 292 Q104 258 100 212") + mano("rgPalma", "translate(98,204) rotate(-16)") +
              brazo("M215 292 Q256 258 260 212") + mano("rgPalma", "translate(262,204) rotate(16)") + '</g>',
    aplaude:  '<g class="rob-p-aplaude">' + brazo("M145 294 Q120 268 152 250") + mano("rgPalma", "translate(156,244) rotate(-100) scale(1.05)") +
              brazo("M215 294 Q240 268 208 250") + mano("rgPalma", "translate(204,244) rotate(100) scale(1.05)") +
              '<text x="150" y="228" font-size="20">💥</text></g>',
    alarma:   brazo("M145 292 Q98 268 92 224") + mano("rgIndice", "translate(90,216) rotate(-12)") +
              brazo("M215 300 Q262 306 288 288") + mano("rgIndice", "translate(294,282) rotate(72)"),
    jarras:   brazo("M145 296 Q106 316 142 346") + mano("rgMano", "translate(146,348) rotate(-30)") +
              brazo("M215 296 Q254 316 218 346") + mano("rgMano", "translate(214,348) rotate(30)"),
    reposo:   brazo("M145 296 Q124 326 136 358") + mano("rgMano", "translate(140,362)") +
              brazo("M215 296 Q236 326 224 358") + mano("rgMano", "translate(220,362)"),
    /* 🧍 v7.15 — SU POSTURA DE GUARDIA, NUEVA Y SOLO SUYA.
       Rey (02-09): "descruzarle los brazos, que no sea su pose principal". `espera` es la
       cara que MÁS tiempo lleva puesta y estaba de brazos cruzados, que a la larga se lee
       como desganado o a la defensiva.
       ⚠️ Se le dibuja una POSTURA PROPIA en vez de reaprovechar `reposo`: ésa ya la usa
       `preocupa`, y compartirla haría que "en guardia" y "esto no me gusta" se vieran
       IGUAL de cuerpo. Cada gesto suyo tiene su postura — es lo que los hace distinguibles,
       y hay un banco que lo exige desde hace versiones.
       Ésta es de mayordomo atento: de pie, los brazos bajando sueltos y las manos juntas
       por delante, a la altura de la cintura. Disponible, no cerrado. */
    atento:   brazo("M145 296 Q132 330 166 356") + mano("rgMano", "translate(170,360)") +
              brazo("M215 296 Q228 330 194 356") + mano("rgMano", "translate(190,360)"),
    /* 🧍 v7.65 — LAS OTRAS CUATRO MANERAS DE ESTAR DE PIE SIN HACER NADA.
       Rey (06-09): "que no quede solo con las manos juntas cuando está sin hacer nada".
       `atento` (las manos juntas por delante) es la postura de su estado «⏳ En guardia», que
       es el que MÁS TIEMPO lleva puesto — o sea que Rey lo veía siempre exactamente igual.
       Ahora la guardia tiene cinco posturas y va rotando, como rota la ropa.
       ⚠️ Ninguna reaprovecha las que ya usan otros gestos (`reposo` es de `preocupa`,
       `jarras` de `presumido`, `cruzados` de `serio`): si dos gestos comparten postura dejan
       de distinguirse de cuerpo, y hay un banco que lo exige desde hace versiones. */
    /* ⚠️ se dibujó primero con las manos pegadas al cuerpo y salía CASI IGUAL que `reposo`
       (las manos caían a 5 píxeles unas de otras). Se separan del tronco y se giran hacia
       fuera: así se lee "relajado, abierto" y no se confunde con "preocupado". */
    sueltos:  brazo("M145 296 Q126 322 132 354") + mano("rgMano", "translate(133,358) rotate(-26)") +
              brazo("M215 296 Q234 322 228 354") + mano("rgMano", "translate(227,358) rotate(26)"),
    unaCadera: brazo("M145 296 Q107 316 143 341") + mano("rgMano", "translate(147,343) rotate(-32)") +
              brazo("M215 296 Q222 330 218 362") + mano("rgMano", "translate(216,366) rotate(12)"),
    bolsillos: brazo("M145 296 Q133 320 153 337") + mano("rgMano", "translate(157,339) rotate(-44) scale(.92)") +
              brazo("M215 296 Q227 320 207 337") + mano("rgMano", "translate(203,339) rotate(44) scale(.92)"),
    codo:     brazo("M215 296 Q198 330 154 331") + mano("rgMano", "translate(150,331) rotate(-72)") +
              brazo("M145 296 Q137 318 143 336") + mano("rgMano", "translate(145,340) rotate(-8)"),
    visor:    brazo("M145 296 Q122 324 132 356") + mano("rgMano", "translate(134,360)") +
              brazo("M215 296 Q264 280 230 158") + mano("rgPalma", "translate(206,150) rotate(176) scale(1.35)"),
    /* — carisma, bromas y sentimiento — */
    abiertos: brazo("M145 296 Q100 288 82 266") + mano("rgPalma", "translate(76,262) rotate(-72)") +
              brazo("M215 296 Q260 288 278 266") + mano("rgPalma", "translate(284,262) rotate(72)"),
    cachetes: brazo("M145 292 Q112 268 124 224") + mano("rgPalma", "translate(126,214) rotate(-150) scale(1.1)") +
              brazo("M215 292 Q248 268 236 224") + mano("rgPalma", "translate(234,214) rotate(150) scale(1.1)"),
    facepalm: brazo("M145 296 Q124 326 136 358") + mano("rgMano", "translate(140,362)") +
              brazo("M215 296 Q262 276 224 206") + mano("rgPalma", "translate(212,196) rotate(150) scale(1.3)"),
    panza:    brazo("M145 296 Q106 320 150 340") + mano("rgMano", "translate(155,342) rotate(-20)") +
              brazo("M215 296 Q254 320 210 340") + mano("rgMano", "translate(205,342) rotate(20)"),
    /* el guiño cómplice también te apunta a TI (más chico que el dedo serio: es guasa) */
    pistola:  brazo("M145 296 Q120 324 130 354") + mano("rgMano", "translate(131,358)") +
              brazo("M215 296 Q234 292 244 288") + mano("rgApuntaTi", "translate(240,286) scale(.78)"),
    cuchichea: brazo("M145 296 Q118 322 126 352") + mano("rgMano", "translate(127,356)") +
              brazo("M215 292 Q248 282 222 248") + mano("rgPalma", "translate(214,244) rotate(128) scale(1.05)"),
    /* 🤜 el puño viene contra la pantalla: chócalas de verdad, no al aire */
    codito:   brazo("M145 296 Q118 322 126 352") + mano("rgMano", "translate(127,356)") +
              brazo("M215 298 Q230 296 238 294") +
              '<g class="rob-empuja">' + mano("rgPunoTi", "translate(234,292)") +
              '<text x="252" y="268" font-size="20">💥</text></g>',
    /* 👃 01-09 — poses propias para oler (Rey pidió la nariz y con ella estos gestos).
       Cada una es ÚNICA: la regla sellada es que ningún gesto repita pose. */
    olisquea: brazo("M145 296 Q120 280 158 238") + mano("rgPalma", "translate(162,234) rotate(-58)") +
              brazo("M215 296 Q246 306 240 344") + mano("rgMano", "translate(241,348) rotate(-10)"),
    tapanariz: brazo("M215 296 Q214 262 192 226") + mano("rgMano", "translate(188,220) rotate(-24) scale(.86)") +
              brazo("M145 296 Q112 306 108 342") + mano("rgMano", "translate(107,346) rotate(12)"),
    corazon:  brazo("M145 294 Q116 288 156 268") + mano("rgMano", "translate(160,266) rotate(-42)") +
              brazo("M215 294 Q244 288 204 268") + mano("rgMano", "translate(200,266) rotate(42)") +
              '<path d="M180 250 Q168 236 158 248 Q150 258 180 280 Q210 258 202 248 Q192 236 180 250 Z" fill="var(--rcor)" opacity=".95"/>',
    encogido: brazo("M145 292 Q104 288 92 306") + mano("rgPalma", "translate(88,312) rotate(-118) scale(1.05)") +
              brazo("M215 292 Q256 288 268 306") + mano("rgPalma", "translate(272,312) rotate(118) scale(1.05)"),
    shh:      brazo("M145 296 Q120 324 130 354") + mano("rgMano", "translate(131,358)") +
              brazo("M215 292 Q252 276 200 244") + mano("rgIndice", "translate(192,246) rotate(112) scale(.95)"),
    gafasP:   brazo("M145 296 Q122 324 132 354") + mano("rgMano", "translate(133,358)") +
              brazo("M215 288 Q250 262 228 196") + mano("rgIndice", "translate(224,190) rotate(166) scale(.85)"),
    musculo:  brazo("M145 296 Q104 286 106 244") + mano("rgPulgar", "translate(108,238) rotate(-6) scale(1.15)") +
              brazo("M215 296 Q256 286 254 244") + mano("rgPulgar", "translate(252,238) rotate(6) scale(1.15)") +
              '<circle cx="118" cy="268" r="13" fill="var(--rj2)"/><circle cx="242" cy="268" r="13" fill="var(--rj2)"/>',
    cruzados: brazo("M145 300 Q170 322 218 312") + mano("rgMano", "translate(222,310) rotate(24)") +
              brazo("M215 306 Q190 328 142 318") + mano("rgMano", "translate(138,316) rotate(-24)"),
    rasca:    brazo("M145 300 Q116 322 128 352") + mano("rgMano", "translate(129,356)") +
              brazo("M215 290 Q262 260 218 172") + mano("rgMano", "translate(212,164) rotate(150)"),
    almohada: brazo("M145 296 Q120 320 128 350") + mano("rgMano", "translate(129,354)") +
              brazo("M215 290 Q256 268 234 208") + mano("rgMano", "translate(228,200) rotate(140) scale(1.2)"),
    reza:     brazo("M145 294 Q124 300 166 274") + mano("rgPalma", "translate(170,268) rotate(-64) scale(.95)") +
              brazo("M215 294 Q236 300 194 274") + mano("rgPalma", "translate(190,268) rotate(64) scale(.95)"),

    /* ══ 🎭 GESTOS NUEVOS (v7.54, pedido de Rey el 06-09) ═══════════════════════════════
       Cada uno con su postura propia, como manda la regla del fichero. */

    /* 👂 te escucha: mano en la oreja, inclinado hacia ti */
    escucha:  brazo("M145 296 Q116 316 122 348") + mano("rgMano", "translate(123,352)") +
              brazo("M215 292 Q246 262 232 224") + mano("rgPalma", "translate(230,214) rotate(128) scale(.9)"),

    /* 🔭 vigilando el mercado: los prismáticos en los ojos */
    vigila:   brazo("M145 292 Q126 258 152 214") + mano("rgMano", "translate(150,206) rotate(-24) scale(.85)") +
              brazo("M215 292 Q234 258 208 214") + mano("rgMano", "translate(210,206) rotate(24) scale(.85)") +
              '<rect x="126" y="176" width="44" height="34" rx="9" fill="#2b3550" stroke="var(--rtz)" stroke-width="2.6"/>' +
              '<rect x="190" y="176" width="44" height="34" rx="9" fill="#2b3550" stroke="var(--rtz)" stroke-width="2.6"/>' +
              '<rect x="168" y="186" width="24" height="12" rx="4" fill="#1c2235"/>' +
              '<circle cx="148" cy="193" r="9" fill="#7fd7c8" opacity=".8"/><circle cx="212" cy="193" r="9" fill="#7fd7c8" opacity=".8"/>',

    /* ✌️ victoria: los dos dedos en alto */
    victoria: brazo("M145 296 Q112 314 106 346") + mano("rgMano", "translate(105,350) rotate(-12)") +
              brazo("M215 294 Q254 268 258 222") + mano("rgIndice", "translate(258,214) rotate(-14) scale(1.02)") +
              '<path d="M268 214 L282 178" stroke="var(--rgu)" stroke-width="13" stroke-linecap="round"/>' +
              '<path d="M268 214 L282 178" stroke="var(--rgu2)" stroke-width="13" stroke-linecap="round" opacity=".18"/>',

    /* 🏆 campeón: levanta el trofeo */
    trofeo:   brazo("M145 296 Q118 310 126 344") + mano("rgMano", "translate(127,348)") +
              brazo("M215 292 Q252 254 240 206") + mano("rgPalma", "translate(238,198) rotate(150) scale(.92)") +
              '<path d="M216 150 L268 150 L262 178 Q242 190 222 178 Z" fill="var(--roro)" stroke="var(--rtz)" stroke-width="2.6" stroke-linejoin="round"/>' +
              '<rect x="236" y="184" width="12" height="14" fill="var(--roro2)"/>' +
              '<rect x="226" y="196" width="32" height="8" rx="3" fill="var(--roro2)"/>' +
              '<path d="M216 156 Q202 162 212 172" stroke="var(--roro2)" stroke-width="5" fill="none"/>' +
              '<path d="M268 156 Q282 162 272 172" stroke="var(--roro2)" stroke-width="5" fill="none"/>',

    /* 💰 contando el dinero: los billetes en la mano */
    dinero:   brazo("M145 296 Q120 302 158 288") + mano("rgPalma", "translate(162,284) rotate(-58) scale(.9)") +
              brazo("M215 296 Q244 300 214 274") + mano("rgIndice", "translate(210,268) rotate(126) scale(.86)") +
              '<rect x="150" y="248" width="56" height="30" rx="4" fill="#5aa06f" stroke="var(--rtz)" stroke-width="2.4"/>' +
              '<rect x="156" y="242" width="56" height="30" rx="4" fill="#6cb682" stroke="var(--rtz)" stroke-width="2.4"/>' +
              '<circle cx="184" cy="257" r="8" fill="#f0e3b0" stroke="var(--rtz)" stroke-width="1.8"/>',

    /* 📈 el mercado sube: señala la flecha hacia arriba */
    sube:     brazo("M145 296 Q116 320 124 350") + mano("rgMano", "translate(125,354)") +
              brazo("M215 292 Q258 276 268 238") + mano("rgIndice", "translate(270,232) rotate(-34) scale(.94)") +
              '<path d="M236 246 L262 208 L286 226 L316 178" stroke="#31c46a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
              '<path d="M300 176 L320 172 L316 192 Z" fill="#31c46a"/>',

    /* 📉 el mercado cae: la flecha hacia abajo y él tenso */
    baja:     brazo("M145 296 Q114 306 108 336") + mano("rgMano", "translate(107,340) rotate(-16)") +
              brazo("M215 296 Q258 306 268 336") + mano("rgIndice", "translate(270,342) rotate(150) scale(.94)") +
              '<path d="M236 300 L262 336 L286 316 L316 366" stroke="#ff6b6b" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
              '<path d="M300 368 L320 372 L316 352 Z" fill="#ff6b6b"/>',

    /* 🛑 alto con las dos manos: cuando te frena de verdad */
    frena:    brazo("M145 292 Q120 268 138 236") + mano("rgPalma", "translate(136,228) rotate(-16) scale(1.02)") +
              brazo("M215 292 Q240 268 222 236") + mano("rgPalma", "translate(224,228) rotate(16) scale(1.02)"),

    /* 🤝 te da la mano: el brazo cruzado hacia ti */
    apreton:  brazo("M145 296 Q118 312 126 344") + mano("rgMano", "translate(127,348)") +
              brazo("M215 300 Q246 314 244 336") + mano("rgPulgar", "translate(246,340) rotate(-28) scale(1.05)"),

    /* 🥱 bostezo: se tapa la boca */
    bosteza:  brazo("M145 296 Q112 306 104 338") + mano("rgMano", "translate(103,342) rotate(-14)") +
              brazo("M215 292 Q238 268 200 244") + mano("rgPalma", "translate(196,238) rotate(96) scale(.88)"),

    /* 🫡 se cuadra ante ti (distinto del militar: este junta los pies y baja la otra) */
    firme:    brazo("M145 298 Q136 330 144 360") + mano("rgMano", "translate(145,364) scale(.94)") +
              brazo("M215 292 Q246 262 214 226") + mano("rgIndice", "translate(210,220) rotate(112) scale(.86)"),

    /* 👌 PERFECTO — el círculo de pulgar e índice. No es "vale": es "impecable".
       Se lo gana la ejecución que sigue el plan al 100%, no cualquier operación ganada. */
    ok:       brazo("M145 296 Q114 312 108 344") + mano("rgMano", "translate(107,348) rotate(-12)") +
              brazo("M215 294 Q250 274 252 236") +
              '<g transform="translate(252,232)">' +
                '<path d="M-4 -22 L-4 -6 Q-4 -2 0 -2 Q4 -2 4 -6 L4 -24 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
                '<path d="M6 -20 L6 -6 Q6 -2 10 -2 Q14 -2 14 -6 L14 -22 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
                '<path d="M16 -17 L16 -6 Q16 -2 20 -2 Q23 -2 23 -6 L23 -18 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
                '<circle cx="-11" cy="4" r="12" fill="none" stroke="var(--rgu)" stroke-width="8"/>' +
                '<circle cx="-11" cy="4" r="12" fill="none" stroke="var(--rgu2)" stroke-width="2.2"/>' +
                '<path d="M-4 -2 L-4 8 Q-4 14 2 14 L18 14 Q24 14 24 8 L24 -2 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
              '</g>',

    /* 🤏 POQUITO — el pellizco. "Te faltó ESTO para el TP", "un pelín más de paciencia".
       Es el gesto que dice una cantidad pequeña sin tener que escribir un número. */
    poquito:  brazo("M145 296 Q118 310 126 344") + mano("rgMano", "translate(127,348)") +
              brazo("M215 294 Q248 276 250 244") +
              '<g transform="translate(250,238) scale(1.5)">' +
                /* el índice, curvado hacia abajo */
                '<path d="M2 -2 Q-12 -14 -4 -22 Q4 -28 8 -12 L9 -2 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="1.9"/>' +
                /* el pulgar, curvado hacia arriba: entre los dos queda EL HUECO, que es el gesto */
                '<path d="M2 8 Q-12 2 -6 -6 Q1 -12 8 0 L9 8 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="1.9"/>' +
                /* la mano */
                '<path d="M4 -2 L18 -2 Q24 -2 24 5 L24 14 Q24 21 17 21 L6 21 Q0 21 0 14 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="1.9"/>' +
                '<path d="M7 4 L20 4 M7 11 L20 11" stroke="var(--rgu2)" stroke-width="1.2" opacity=".6"/>' +
              '</g>',

    /* 🫱 ASÍ ASÍ — la mano plana que se menea. Ni bien ni mal: es lo que le falta a Roberto
       para decir "regular" sin tener que elegir entre aprobar y rechazar. Se MUEVE. */
    asiAsi:   brazo("M145 296 Q116 316 122 348") + mano("rgMano", "translate(123,352)") +
              brazo("M215 296 Q246 292 254 268") +
              '<g class="rob-corbata" style="transform-origin:252px 266px">' +
                /* los cuatro dedos, uno a uno y con hueco entre ellos */
                '<path d="M258 250 L284 250 Q290 250 290 256 Q290 262 284 262 L258 262 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
                '<path d="M258 264 L286 264 Q292 264 292 270 Q292 276 286 276 L258 276 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
                '<path d="M258 278 L282 278 Q288 278 288 284 Q288 290 282 290 L258 290 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
                /* la palma */
                '<path d="M236 248 L262 248 Q268 248 268 256 L268 284 Q268 292 260 292 L238 292 Q230 292 230 284 L230 256 Q230 248 236 248 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.4"/>' +
                /* y el pulgar por debajo, que es lo que dice "es una mano" */
                '<path d="M234 288 Q226 296 232 302 Q238 308 246 298 L248 292 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
              '</g>',

    /* 🤲 ¿Y BIEN? — la palma abierta hacia arriba, pidiéndole explicación.
       Para cuando rompió una regla y él quiere que se lo cuente antes de juzgar. */
    explica:  brazo("M145 296 Q112 300 122 274") + mano("rgPalma", "translate(124,270) rotate(-150) scale(1.15)") +
              brazo("M215 296 Q248 300 238 274") + mano("rgPalma", "translate(236,270) rotate(150) scale(1.15)"),

    /* 👀 TE VIGILO — dos dedos a sus ojos y luego a ti. Cuando tiene una posición abierta
       suya en la mano, o cuando Rey está a punto de saltarse algo. */
    teVigilo: brazo("M145 296 Q112 306 104 338") + mano("rgMano", "translate(103,342) rotate(-14)") +
              brazo("M215 292 Q244 256 208 214") +
              '<g transform="translate(206,212) rotate(104) scale(1.15)">' +
                /* dos dedos en V, con hueco de verdad entre ellos */
                '<path d="M-12 -2 L-16 -30 Q-17 -37 -10 -38 Q-3 -39 -2 -32 L0 -2 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
                '<path d="M8 -2 L14 -29 Q15 -36 22 -34 Q29 -33 27 -26 L20 -2 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
                '<path d="M-14 0 L22 0 Q29 0 29 8 L29 16 Q29 24 20 24 L-6 24 Q-14 24 -14 16 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2.2"/>' +
              '</g>',

    /* 👇 MIRA ABAJO — señala hacia abajo, al nivel de debajo del precio.
       Complementa a "senala" (que apunta al frente): con estos dos ya puede decirle DÓNDE. */
    senalaAbajo: brazo("M145 296 Q118 312 126 344") + mano("rgMano", "translate(127,348)") +
              brazo("M215 298 Q256 306 262 344") +
              '<g transform="translate(262,348) rotate(178) scale(1.25)">' +
                '<path d="M-3 -8 L-3 -36 Q-3 -43 3 -43 Q10 -43 10 -36 L10 -8 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2"/>' +
                '<path d="M-14 -6 Q-14 -15 -4 -15 L11 -15 Q21 -15 21 -5 L21 7 Q21 18 9 18 L-3 18 Q-14 18 -14 6 Z" fill="var(--rgu)" stroke="var(--rgu2)" stroke-width="2"/>' +
                '<path d="M-6 -2 L14 -2 M-6 6 L14 6" stroke="var(--rgu2)" stroke-width="1.4" opacity=".6"/>' +
              '</g>',

    /* 🧮 con la calculadora: cuando te echa las cuentas */
    calcula:  brazo("M145 296 Q118 300 152 292") + mano("rgPalma", "translate(156,288) rotate(-52) scale(.88)") +
              brazo("M215 296 Q240 298 212 282") + mano("rgIndice", "translate(208,276) rotate(120) scale(.84)") +
              '<rect x="146" y="238" width="52" height="58" rx="6" fill="#2b3550" stroke="var(--rtz)" stroke-width="2.4"/>' +
              '<rect x="152" y="244" width="40" height="14" rx="3" fill="#7fd7c8"/>' +
              '<circle cx="158" cy="268" r="3.6" fill="#dfe6f2"/><circle cx="172" cy="268" r="3.6" fill="#dfe6f2"/><circle cx="186" cy="268" r="3.6" fill="#dfe6f2"/>' +
              '<circle cx="158" cy="282" r="3.6" fill="#dfe6f2"/><circle cx="172" cy="282" r="3.6" fill="#dfe6f2"/><circle cx="186" cy="282" r="3.6" fill="var(--roro)"/>',
  };

  /* 🩹 FIX (31-08, lo cazó Rey mirando la demo: "Roberto no tiene brazos ni manos"):
     `.rob-pose{display:none}` los ocultaba TODOS y no había ninguna regla que mostrara el
     del gesto activo — los 33 pares de brazos existían dibujados pero invisibles. La regla
     se GENERA aquí desde POSES, así jamás se puede volver a desincronizar al añadir gestos. */
  /* 👔 v6.90 — la ropa y los accesorios se enseñan igual que las poses, y la regla se GENERA
   desde el armario: así no se puede desincronizar al añadir una prenda nueva.
   Los accesorios usan ~= porque se pueden llevar VARIOS a la vez (data-acc="gorra movil"). */
ROB_CSS += "\n.rob-ropa,.rob-acc{display:none}\n";
ROB_CSS += Object.keys(ROPAS).map(function (k) { return '[data-ropa="' + k + '"] .rob-r-' + k; }).join(",") + "{display:block}\n";

/* 👔 v7.54 — LAS MANGAS SON DE LA PRENDA, NO DEL PERSONAJE.
   Los brazos se pintan con var(--rj) (la función brazo()). Antes era un azul fijo: daba
   igual porque solo había tres mudas y una era azul. Con el armario nuevo, un traje negro
   con mangas azules se ve roto — se descubrió mirando el dibujo, no el código.
   Cada muda dice de qué color son sus mangas y aquí se genera su regla. Lo que no esté en
   esta lista se queda con el azul de siempre, así nada se rompe por olvido. */
var MANGAS = {
  wallstreet: "#22305f", casual: "#3d6bb5", casa: "#7a5aa8", navidad: "#c0392b", fiesta: "#1b1b28",
  trajeNegro: "#1c1c24", trajeAzul: "#1d3461", trajeGranate: "#6b1f2b", trajeGris: "#454a56", trajeVerde: "#1f4034",
  sudaderaAzul: "#24406b", sudaderaVerde: "#2b5d4a", sudaderaGranate: "#7a2b34", sudaderaApex: "#1b2233",
  camisaCuadros: "#8c3b32", poloBlanco: "#dfe3ea",
  bataVino: "#5c2333", bataVerde: "#25473c", pijamaRayas: "#2b3a63", pijamaGris: "#3b3f4a", chandalGris: "#3a3f47",
  chandalAzul: "#1f3b73", chandalVerde: "#204b3b", poloVerde: "#2f6f5c", poloVino: "#7c2f3d",
  hawaiana: "#0f6f7a", hawaianaRoja: "#a63b2f"
};
/* 🔄 v7.54 — EL GIRO. De frente por defecto (data-vista no puesto o "frente"); con
   data-vista="espalda" se ve por detrás. La clase rob-girando lo achata medio segundo:
   ese achatado es lo que hace que el ojo lea "se ha dado la vuelta" en vez de "lo han
   cambiado por otro dibujo". Todo con display, como la ropa y las posturas, así que no
   hay dos verdades que puedan descuadrarse. */
ROB_CSS += `
  .rob-atras,.rob-canto{display:none}
  .rob-svg[data-vista="espalda"] .rob-todo{display:none}
  .rob-svg[data-vista="espalda"] .rob-atras{display:block}
  .rob-svg[data-vista="canto"] .rob-todo{display:none}
  .rob-svg[data-vista="canto"] .rob-canto{display:block}
  /* 🔄 v7.58 — EL GIRO DE TRES FASES. Antes era un solo achatado a nada (un salto). Ahora:
     se estrecha de frente → se ve su CANTO → se abre ya de espaldas. Cada fase tiene su
     animación y su duración, y el JS cambia de vista justo en el paso de una a otra. */
  .rob-svg .rob-todo,.rob-svg .rob-atras,.rob-svg .rob-canto{transform-box:view-box; transform-origin:180px 300px}
  .rob-svg.rob-g1 .rob-todo{animation:robG1 .19s ease-in forwards!important}
  .rob-svg.rob-g2 .rob-canto{animation:robG2 .22s ease-in-out!important}
  .rob-svg.rob-g3 .rob-atras,.rob-svg.rob-g3 .rob-todo{animation:robG3 .19s ease-out!important}
  @keyframes robG1{0%{transform:scaleX(1)}100%{transform:scaleX(.12)}}
  @keyframes robG2{0%{transform:scaleX(.4)}45%{transform:scaleX(1)}100%{transform:scaleX(.4)}}
  @keyframes robG3{0%{transform:scaleX(.12)}100%{transform:scaleX(1)}}
`;
ROB_CSS += Object.keys(MANGAS).map(function (k) {
  return '[data-ropa="' + k + '"]{--rj:' + MANGAS[k] + '}';
}).join("\n") + "\n";
ROB_CSS += Object.keys(ACCS).map(function (k) { return '[data-acc~="' + k + '"] .rob-a-' + k; }).join(",") + "{display:block}\n";
/* que la ropa VIVA: la corbata se mece, los cordones cuelgan, el móvil parpadea, el vapor
   de la taza sube. Con !important, como el resto: la app tiene un "menos movimiento"
   global y su ropa es parte de él, no un adorno. */
ROB_CSS += `
  .rob-corbata{transform-origin:180px 306px; animation:robCorbata 3.6s ease-in-out infinite!important}
  .rob-cordon{transform-origin:180px 286px; animation:robCordon 4.2s ease-in-out infinite!important}
  .rob-cinto{transform-origin:190px 338px; animation:robCordon 5s ease-in-out infinite!important}
  .rob-fleco{transform-origin:200px 288px; animation:robCorbata 4.4s ease-in-out infinite!important}
  .rob-pantalla{animation:robPantalla 2.4s ease-in-out infinite!important}
  .rob-auri{animation:robPantalla 1.8s ease-in-out infinite!important}
  .rob-vapor{transform-origin:248px 300px; animation:robVapor 2.8s ease-in-out infinite!important}
  @keyframes robCorbata{0%,100%{transform:rotate(-3.5deg)}50%{transform:rotate(3.5deg)}}
  @keyframes robCordon{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
  @keyframes robPantalla{0%,100%{opacity:.62}50%{opacity:1}}
  @keyframes robVapor{0%{opacity:0;transform:translateY(4px)}35%{opacity:.85}100%{opacity:0;transform:translateY(-12px)}}
`;
ROB_CSS += "\n" + Object.keys(POSES).map(function (k) { return '[data-pose="' + k + '"] .rob-p-' + k; }).join(",") + "{display:block}\n";

  /* ── 🔄 SU ESPALDA (v7.54) ────────────────────────────────────────────────────────
     El mismo lápiz, sin cara: desde atrás no se le ven los ojos ni la boca. La ropa va con
     var(--rj) (el color de la muda del día) y lleva su costura y su cuello, que es lo que
     hace que se lea "espalda" y no "un lápiz sin cara". Los brazos cuelgan por los lados. */
  function espaldaHTML() {
    return '<g class="rob-atras">' +
      /* goma y virola, iguales */
      '<path d="M144 64 Q180 40 216 64 L216 106 L144 106 Z" fill="var(--rcor)"/>' +
      '<path d="M144 64 Q180 40 216 64 L216 78 Q180 56 144 78 Z" fill="#ff9086"/>' +
      '<rect x="138" y="104" width="84" height="27" rx="8" fill="var(--roro)"/>' +
      '<rect x="138" y="111" width="84" height="3.6" fill="var(--roro2)"/><rect x="138" y="121" width="84" height="3.6" fill="var(--roro2)"/>' +
      /* la madera, un pelín más oscura: es la cara que no le da la luz */
      '<path d="M142 131 L218 131 L213 394 L147 394 Z" fill="var(--rmad2)"/>' +
      '<path d="M142 131 L166 131 L162 394 L147 394 Z" fill="var(--rmad)" opacity=".45"/>' +
      /* 🧊 la luz también por detrás, pero VOLTEADA: desde atrás le da por el otro lado.
         Si fuera igual que de frente, el giro se notaría plano. */
      '<path d="M142 131 L218 131 L213 394 L147 394 Z" fill="url(#robLuz)" transform="translate(360,0) scale(-1,1)"/>' +
      '<path d="M147 394 L213 394 L180 472 Z" fill="#e8cd9e"/><path d="M167 424 L193 424 L180 472 Z" fill="#33302a"/>' +
      /* su nuca: la sombra bajo la virola */
      '<path d="M142 131 L218 131 L216 148 L144 148 Z" fill="#00000022"/>' +
      /* la ropa por detrás, del color de la muda de hoy */
      '<path d="M151 266 H209 Q217 266 217.4 274 L215 376 H145 L142.6 274 Q143 266 151 266 Z" fill="var(--rj)"/>' +
      '<path d="M151 266 H209 Q217 266 217.4 274 L216.8 284 H143.2 L142.6 274 Q143 266 151 266 Z" fill="#00000026"/>' +
      '<path d="M180 284 L180 376" stroke="#00000033" stroke-width="3"/>' +
      /* los brazos, colgando */
      brazo("M145 296 Q126 326 130 358") + mano("rgMano", "translate(131,362) scale(.96)") +
      brazo("M215 296 Q234 326 230 358") + mano("rgMano", "translate(229,362) scale(.96)") +
      '</g>';
  }

  /* ── 🔄 SU CANTO (v7.58) ──────────────────────────────────────────────────────────
     El lápiz visto de LADO, mientras gira. Estrecho (26 px de ancho contra los 76 de
     frente), con su goma, su virola, su madera, su punta y la ropa como una franja del
     color de la muda del día — así que se pone solo, igual que la espalda.
     No lleva cara ni brazos: de canto no se le verían, y fingirlos sería peor.
     Se ve 220 ms en mitad del giro. Es lo que hace que el ojo lea "se está dando la
     vuelta" en vez de "lo han cambiado por otro dibujo". */
  function cantoHTML() {
    return '<g class="rob-canto">' +
      /* goma */
      '<path d="M167 64 Q180 40 193 64 L193 106 L167 106 Z" fill="var(--rcor)"/>' +
      '<path d="M167 64 Q180 40 193 64 L193 78 Q180 56 167 78 Z" fill="#ff9086"/>' +
      /* virola */
      '<rect x="165" y="104" width="30" height="27" rx="5" fill="var(--roro)"/>' +
      '<rect x="165" y="111" width="30" height="3.6" fill="var(--roro2)"/>' +
      '<rect x="165" y="121" width="30" height="3.6" fill="var(--roro2)"/>' +
      /* la madera: dos caras del prisma, una a la luz y otra a la sombra — eso es el volumen */
      '<path d="M166 131 L181 131 L179 394 L168 394 Z" fill="var(--rmad)"/>' +
      '<path d="M181 131 L194 131 L192 394 L179 394 Z" fill="var(--rmad2)"/>' +
      /* punta */
      '<path d="M168 394 L192 394 L180 472 Z" fill="#e8cd9e"/>' +
      '<path d="M175 424 L186 424 L180 472 Z" fill="#33302a"/>' +
      /* la ropa, del color de la muda de hoy */
      '<path d="M164 268 L196 268 L194 376 L166 376 Z" fill="var(--rj)"/>' +
      '<path d="M181 268 L196 268 L194 376 L179 376 Z" fill="#00000030"/>' +
      /* la nariz, que de canto SÍ se nota y es lo que dice hacia dónde mira */
      '<path d="M194 206 Q206 216 194 224 Z" fill="var(--rgu2)" opacity=".9"/>' +
      '</g>';
  }

  /* ── EL PERSONAJE ── */
  function svgHTML() {
    var poses = "";
    for (var k in POSES) poses += '<g class="rob-pose rob-p-' + k + '">' + POSES[k] + "</g>";
    var ropas = "", accs = "";
    for (var r in ROPAS) ropas += '<g class="rob-ropa rob-r-' + r + '">' + ROPAS[r] + "</g>";
    for (var a in ACCS)  accs  += '<g class="rob-acc rob-a-' + a + '">' + ACCS[a] + "</g>";
    return '<svg class="rob-svg" viewBox="0 0 360 520" data-ojos="normales" data-cejas="alegres" data-boca="sonrisa"' +
      ' data-pose="saluda" data-cuerpo="flota" data-fx="" data-ropa="wallstreet" data-acc="" role="img" aria-label="Roberto, tu mentor">' +
      "<defs>" + MANOS +
        /* 🧊 v7.58 — LA LUZ QUE LE DA VOLUMEN. Rey (06-09): "agregarle más realidad… lo más
           parecido a 3D sin rehacer nada". Lo que más 3D aporta en un dibujo plano no es
           girarlo: es la LUZ. Su cuerpo es un cilindro y hasta ahora era un color liso con
           una franja oscura a la derecha. Con la luz entrando por la izquierda, su brillo y
           la sombra cayendo a la derecha, el ojo lo lee REDONDO sin haber cambiado una sola
           forma: ni una postura, ni una prenda, ni una animación. */
        '<linearGradient id="robLuz" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#000" stop-opacity=".22"/>' +
          '<stop offset="14%" stop-color="#000" stop-opacity="0"/>' +
          '<stop offset="34%" stop-color="#fff" stop-opacity=".30"/>' +
          '<stop offset="52%" stop-color="#fff" stop-opacity="0"/>' +
          '<stop offset="78%" stop-color="#000" stop-opacity=".14"/>' +
          '<stop offset="100%" stop-color="#000" stop-opacity=".34"/>' +
        '</linearGradient>' +
        '<linearGradient id="robLuzGoma" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#000" stop-opacity=".18"/>' +
          '<stop offset="32%" stop-color="#fff" stop-opacity=".34"/>' +
          '<stop offset="60%" stop-color="#fff" stop-opacity="0"/>' +
          '<stop offset="100%" stop-color="#000" stop-opacity=".30"/>' +
        '</linearGradient>' +
      "</defs><g class=\"rob-todo\">" +
      /* lápiz */
      '<path d="M144 64 Q180 40 216 64 L216 106 L144 106 Z" fill="var(--rcor)"/>' +
      '<path d="M144 64 Q180 40 216 64 L216 78 Q180 56 144 78 Z" fill="#ff9086"/>' +
      '<path d="M144 64 Q180 40 216 64 L216 106 L144 106 Z" fill="url(#robLuzGoma)"/>' +
      '<rect x="138" y="104" width="84" height="27" rx="8" fill="var(--roro)"/>' +
      '<rect x="138" y="104" width="84" height="27" rx="8" fill="url(#robLuzGoma)"/>' +
      '<rect x="138" y="111" width="84" height="3.6" fill="var(--roro2)"/><rect x="138" y="121" width="84" height="3.6" fill="var(--roro2)"/>' +
      '<path d="M142 131 L218 131 L213 394 L147 394 Z" fill="var(--rmad)"/>' +
      '<path d="M197 131 L218 131 L213 394 L194 394 Z" fill="var(--rmad2)" opacity=".35"/>' +
      /* 🧊 la luz del cilindro sobre su madera: va encima del color y por debajo de la cara,
         la ropa y los brazos, para que le dé volumen sin ensuciar nada de lo de delante */
      '<path d="M142 131 L218 131 L213 394 L147 394 Z" fill="url(#robLuz)"/>' +
      '<path d="M147 394 L213 394 L180 472 Z" fill="#fae2b4"/>' +
      '<path d="M147 394 L213 394 L180 472 Z" fill="url(#robLuz)" opacity=".75"/>' +
      '<path d="M167 424 L193 424 L180 472 Z" fill="#33302a"/>' +
      /* cejas */
      '<g class="rob-ci"><path d="M130 152 Q150 139 169 149" stroke="var(--rtz)" stroke-width="7.5" fill="none" stroke-linecap="round"/></g>' +
      '<g class="rob-cd"><path d="M191 149 Q210 139 230 152" stroke="var(--rtz)" stroke-width="7.5" fill="none" stroke-linecap="round"/></g>' +
      /* ojos */
      /* el PARPADEO va en su propio grupo: si comparte grupo con el tamaño de los ojos,
         la transición del tamaño pelea con la animación y los ojos dan un salto raro */
      '<g class="rob-oj rob-oj-ab"><g class="rob-globos"><g class="rob-parpadeo">' +
        '<ellipse cx="152" cy="190" rx="22" ry="27" fill="#fff" stroke="var(--rtz)" stroke-width="3"/>' +
        '<ellipse cx="208" cy="190" rx="22" ry="27" fill="#fff" stroke="var(--rtz)" stroke-width="3"/>' +
        '<g class="rob-pup"><circle cx="156" cy="194" r="9" fill="#1f1a0c"/><circle cx="212" cy="194" r="9" fill="#1f1a0c"/>' +
        '<circle cx="159.5" cy="190" r="3" fill="#fff"/><circle cx="215.5" cy="190" r="3" fill="#fff"/></g></g></g></g>' +
      '<g class="rob-oj rob-oj-parp">' +
        '<path d="M130 178 Q152 170 174 178 L174 170 L130 170 Z" fill="var(--rmad)"/><path d="M186 178 Q208 170 230 178 L230 170 L186 170 Z" fill="var(--rmad)"/>' +
        '<path d="M130 180 Q152 172 174 180" stroke="var(--rtz)" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<path d="M186 180 Q208 172 230 180" stroke="var(--rtz)" stroke-width="4" fill="none" stroke-linecap="round"/></g>' +
      /* ojos felices: arcos MÁS anchos y gruesos que las cejas, si no se confunden con ellas */
      '<g class="rob-oj rob-oj-fel"><path d="M136 200 Q152 174 168 200" stroke="var(--rtz)" stroke-width="10" fill="none" stroke-linecap="round"/>' +
        '<path d="M192 200 Q208 174 224 200" stroke="var(--rtz)" stroke-width="10" fill="none" stroke-linecap="round"/></g>' +
      '<g class="rob-oj rob-oj-dor"><path d="M134 190 Q152 202 170 190" stroke="var(--rtz)" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path d="M190 190 Q208 202 226 190" stroke="var(--rtz)" stroke-width="7" fill="none" stroke-linecap="round"/></g>' +
      '<g class="rob-oj rob-oj-gui">' +
        '<ellipse cx="152" cy="190" rx="22" ry="27" fill="#fff" stroke="var(--rtz)" stroke-width="3"/>' +
        '<circle cx="156" cy="194" r="9" fill="#1f1a0c"/><circle cx="159.5" cy="190" r="3" fill="#fff"/>' +
        '<path d="M190 192 Q208 176 226 192" stroke="var(--rtz)" stroke-width="8" fill="none" stroke-linecap="round"/></g>' +
      '<g class="rob-oj rob-oj-cor"><text x="130" y="206" font-size="40">💗</text><text x="186" y="206" font-size="40">💗</text></g>' +
      '<g class="rob-oj rob-oj-star"><text x="126" y="172" font-size="22">✨</text><text x="216" y="170" font-size="18">✨</text></g>' +
      '<g class="rob-oj rob-oj-gaf">' +
        '<path d="M124 176 H236 L232 200 Q230 212 216 212 H196 Q184 212 182 200 L180 190 L178 200 Q176 212 164 212 H144 Q130 212 128 200 Z" fill="#15161c" stroke="var(--roro)" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M136 186 L152 182" stroke="#fff" stroke-width="3.5" opacity=".55" stroke-linecap="round"/></g>' +
      /* bocas */
      '<g class="rob-bo rob-bo-son"><path d="M152 234 Q180 258 208 234" stroke="var(--rtz)" stroke-width="7" fill="none" stroke-linecap="round"/></g>' +
      '<g class="rob-bo rob-bo-sonta"><path d="M146 232 Q180 274 214 232 Z" fill="#5e2a1d"/><path d="M156 254 Q180 268 204 254 L204 260 Q180 252 156 260 Z" fill="#ff9086"/></g>' +
      '<g class="rob-bo rob-bo-carc"><path d="M142 228 Q180 292 218 228 Z" fill="#5e2a1d"/>' +
        '<path d="M152 236 Q180 246 208 236 L208 230 L152 230 Z" fill="#fff"/>' +
        '<path d="M158 264 Q180 282 202 264 Q180 256 158 264 Z" fill="#ff9086"/></g>' +
      '<g class="rob-bo rob-bo-grito"><ellipse cx="180" cy="246" rx="23" ry="19" fill="#5e2a1d"/><path d="M161 254 Q180 268 199 254 L199 261 Q180 250 161 261 Z" fill="#ff9086"/></g>' +
      '<g class="rob-bo rob-bo-o"><ellipse cx="180" cy="245" rx="13" ry="16" fill="#5e2a1d"/></g>' +
      '<g class="rob-bo rob-bo-recta"><path d="M156 242 L204 242" stroke="var(--rtz)" stroke-width="7" stroke-linecap="round"/></g>' +
      '<g class="rob-bo rob-bo-hmm"><path d="M159 244 Q177 236 198 246" stroke="var(--rtz)" stroke-width="7" fill="none" stroke-linecap="round"/></g>' +
      '<g class="rob-bo rob-bo-tri"><path d="M154 250 Q180 230 206 250" stroke="var(--rtz)" stroke-width="7" fill="none" stroke-linecap="round"/></g>' +
      '<g class="rob-bo rob-bo-mue"><path d="M156 240 L204 240" stroke="var(--rtz)" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M166 234 L166 246 M180 234 L180 246 M194 234 L194 246" stroke="var(--rtz)" stroke-width="3.4"/></g>' +
      '<g class="rob-bo rob-bo-pic"><path d="M152 244 Q176 250 206 230" stroke="var(--rtz)" stroke-width="7" fill="none" stroke-linecap="round"/></g>' +
      '<g class="rob-bo rob-bo-len"><path d="M152 234 Q180 258 208 234" stroke="var(--rtz)" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path d="M172 248 Q180 274 192 250 Q182 244 172 248 Z" fill="#ff7f8f" stroke="var(--rtz)" stroke-width="2.5"/></g>' +
      '<g class="rob-bo rob-bo-die"><path d="M148 232 Q180 268 212 232 Z" fill="#5e2a1d"/>' +
        '<path d="M152 234 Q180 244 208 234 L208 230 L152 230 Z" fill="#fff"/>' +
        '<path d="M164 231 L164 240 M180 231 L180 242 M196 231 L196 240" stroke="var(--rgu2)" stroke-width="1.6"/></g>' +
      '<g class="rob-bo rob-bo-zzz"><ellipse cx="180" cy="244" rx="11" ry="9" fill="#5e2a1d"/></g>' +
      /* 👃 la nariz (01-09, pedida por Rey): pequeña, entre los ojos y la boca.
         Respira siempre — ese movimiento diminuto y constante es lo que hace que
         un dibujo deje de parecer un dibujo. */
      '<g class="rob-nariz"><path d="M180 202 Q192 218 180 227 Q168 218 180 202 Z" fill="var(--rgu2)"/>' +
        '<ellipse class="rob-fosa" cx="175" cy="224" rx="3.1" ry="2" fill="var(--rtz)" opacity=".75"/>' +
        '<ellipse class="rob-fosa" cx="185" cy="224" rx="3.1" ry="2" fill="var(--rtz)" opacity=".75"/></g>' +
      '<g class="rob-bo rob-bo-viva"><ellipse class="rob-boca-viva" cx="180" cy="244" rx="17" ry="7" fill="#5e2a1d"/></g>' +
      /* 👔 v6.90 — SU ROPA Y SUS ACCESORIOS. Antes el traje estaba clavado aquí; ahora se
         pintan todas las prendas y el CSS enseña la que toca (data-ropa / data-acc), igual
         que con las poses. Van antes de los brazos para que las manos queden por encima. */
      ropas + accs +
      poses + "</g>" + espaldaHTML() + cantoHTML() + "</svg>";
  }

  /* ── LOS 33 ESTADOS (pose ÚNICA cada uno) ── */
  var ROB_EMO = {
    /* guía */
    saluda:   {c:1, chip:"👋🏾 Saluda",       ojos:"normales", cejas:"alegres", boca:"sonrisa",   pose:"saluda",  cuerpo:"flota",  ico:"👋🏾", lbl:"¡Buenos días, Rey!",   frase:"Te saluda apenas abres Apex."},
    presenta: {c:1, chip:"🫡 A tus órdenes",  ojos:"normales", cejas:"altas",   boca:"sonrisa",   pose:"militar", cuerpo:"firme",  ico:"🫡", lbl:"A tus órdenes",         frase:"Su pose de mayordomo: firme y listo."},
    ensena:   {c:1, chip:"📚 Enseñando",      ojos:"normales", cejas:"altas",   boca:"sonrisota", pose:"senala",  cuerpo:"flota",  ico:"📚", lbl:"Mira este nivel",       frase:"Señala el dato del que te habla."},
    analiza:  {c:1, chip:"🤔 Analizando",     ojos:"lado",     cejas:"duda",    boca:"hmm",       pose:"movil",   cuerpo:"lento",  piensa:1, ico:"🤔", lbl:"Cruzando tus datos…", frase:"Dedo en la barbilla y mirada arriba."},
    audita:   {c:1, chip:"🔍 Auditando",      ojos:"grandes",  cejas:"duda",    boca:"recta",     pose:"lupa",    cuerpo:"lento",  piensa:1, ico:"🔍", lbl:"Revisando al Ejecutor", frase:"Su lupa rebusca sola."},
    idea:     {c:1, chip:"💡 ¡Idea!",         ojos:"brillo",   cejas:"muyaltas",boca:"sonrisota", pose:"indice",  cuerpo:"flota",  fx:"chispa", piensa:1, ico:"💡", lbl:"¡Se me ocurrió algo!", frase:"Lo que pensó de madrugada en su Pensadero."},
    apunta:   {c:1, chip:"✍️ Lo apunto",      ojos:"lado",     cejas:"altas",   boca:"hmm",       pose:"escribe", cuerpo:"lento",  ico:"✍️", lbl:"Lo anoto en tu diario", frase:"Es un lápiz: cuando registra algo, lo escribe de verdad."},
    tiempo:   {c:1, chip:"⏰ Es la hora",     ojos:"grandes",  cejas:"altas",   boca:"o",         pose:"reloj",   cuerpo:"tiembla",ico:"⏰", lbl:"Killzone en 5 min",     frase:"Señalando su reloj cuando se acerca tu ventana."},
    /* mercado */
    tetoca:   {c:1, chip:"👉 TE toca a TI",   ojos:"normales", cejas:"altas",   boca:"sonrisota", pose:"apuntaTi",cuerpo:"firme",  ico:"👉", lbl:"Esto lo haces TÚ", frase:"Te señala a TI, el dedo saliendo de la pantalla: cuando te manda hacer algo, te mira a los ojos y te apunta."},
    aprueba:  {c:2, chip:"👍 GO",             ojos:"felices",  cejas:"alegres", boca:"sonrisota", pose:"pulgar",  cuerpo:"flota",  ico:"👍", lbl:"Vía libre",             frase:"Tu setup pasó todos los filtros."},
    rechaza:  {c:2, chip:"👎 No cuadra",      ojos:"entrecerrados",cejas:"serias",boca:"recta",   pose:"pulgarNo",cuerpo:"firme",  ico:"👎", lbl:"Esa no la tomo",        frase:"El veto en gesto: pulgar abajo y cara de nada."},
    alerta:   {c:2, chip:"🔔 ¡Señal!",        ojos:"grandes",  cejas:"muyaltas",boca:"o",         pose:"alarma",  cuerpo:"tiembla",urgente:1, ico:"🔔", lbl:"¡Señal en GBPUSD!", frase:"Un brazo arriba, el otro al gráfico. Imposible no verlo."},
    frena:    {c:2, chip:"✋ NO ENTRES",      ojos:"grandes",  cejas:"serias",  boca:"recta",     pose:"frena",   cuerpo:"firme",  urgente:1, ico:"✋", lbl:"NO ENTRES",       frase:"Palma enorme al frente. No hay que leer nada más."},
    celebra:  {c:2, chip:"🔥 ¡TP cazado!",    ojos:"felices",  cejas:"muyaltas",boca:"grito",     pose:"arriba",  cuerpo:"brinca", fx:"confeti", ico:"🔥", lbl:"+1.85R ¡CAZADO!", frase:"Brinca con los brazos arriba y te cae confeti."},
    felicita: {c:2, chip:"👏 Bien hecho",     ojos:"felices",  cejas:"alegres", boca:"dientes",   pose:"aplaude", cuerpo:"flota",  ico:"👏", lbl:"¡Bien jugado!",         frase:"Te aplaude cuando respetas tus reglas."},
    preocupa: {c:2, chip:"😬 Cuidado",        ojos:"tristes",  cejas:"tristes", boca:"triste",    pose:"reposo",  cuerpo:"inclina",ico:"😬", lbl:"Esto no me gusta",      frase:"Cejas caídas: algo en tu cuenta le preocupa."},
    serio:    {c:2, chip:"🛡️ Se acabó",      ojos:"entrecerrados",cejas:"serias",boca:"recta",   pose:"jarras",  cuerpo:"firme",  ico:"🛡️", lbl:"Cerramos el día",      frase:"El guardián de riesgo diciendo basta."},
    vigila:   {c:2, chip:"👁️ Vigilando",     ojos:"lado",     cejas:"duda",    boca:"recta",     pose:"vigila",  cuerpo:"lento",  piensa:1, ico:"👁️", lbl:"Te cuido la posición", frase:"Mano de visera mientras tienes un trade abierto."},
    shhh:     {c:2, chip:"🤫 Silencio",       ojos:"grandes",  cejas:"altas",   boca:"o",         pose:"shh",     cuerpo:"firme",  ico:"🤫", lbl:"Concéntrate ahora",     frase:"Killzone abierta: dedo en los labios, a operar."},
    /* ⏳ Rey (31-08): "él NO puede estar durmiendo en mi pantalla" — este es su reposo
       de guardia: brazos cruzados pero OJOS ABIERTOS, mirándote, listo. */
    /* 🧍 v7.15 — SIN LOS BRAZOS CRUZADOS. Rey (02-09): "descruzarle los brazos, que no sea
       su pose principal; hay que buscar otro gesto o señal entre tantos".
       `espera` es la cara que MÁS tiempo lleva puesta —es su descanso— y estaba con los
       brazos cruzados, que a la larga se lee como desganado o a la defensiva. Se le pone la
       postura de REPOSO: de pie, brazos sueltos y atento. Sigue siendo "aquí sigo, listo",
       pero con la actitud que Rey quiere ver todo el día en su pantalla. */
    /* ══ 🎭 ESTADOS NUEVOS (v7.54, pedido de Rey el 06-09) ═══════════════════════════
       Cada gesto nuevo con su cara, su postura y CUÁNDO le toca salir. */
    escucha:  {c:1, chip:"👂 Te escucho",     ojos:"grandes",  cejas:"altas",   boca:"son",       pose:"escucha", cuerpo:"lento",  ico:"👂", lbl:"Te escucho",           frase:"Mano en la oreja, inclinado hacia ti: te está oyendo de verdad."},
    trofeo:   {c:2, chip:"🏆 ¡Objetivo!",     ojos:"felices",  cejas:"muyaltas",boca:"carc",      pose:"trofeo",  cuerpo:"brinca", fx:"confeti", ico:"🏆", lbl:"¡Objetivo cumplido!", frase:"Levanta el trofeo: esto no es un trade, es una meta tuya."},
    victoria: {c:2, chip:"✌️ Racha viva",     ojos:"felices",  cejas:"altas",   boca:"sonta",     pose:"victoria",cuerpo:"brinca", ico:"✌️", lbl:"Dos seguidas",         frase:"Los dos dedos en alto: la racha está viva."},
    dinero:   {c:2, chip:"💰 Las cuentas",    ojos:"grandes",  cejas:"altas",   boca:"son",       pose:"dinero",  cuerpo:"flota",  ico:"💰", lbl:"Hablemos de dinero",   frase:"Contando los billetes: aquí se habla de lo que entra y sale."},
    sube:     {c:2, chip:"📈 Va a favor",     ojos:"felices",  cejas:"altas",   boca:"son",       pose:"sube",    cuerpo:"flota",  ico:"📈", lbl:"El precio te acompaña", frase:"Señala la flecha verde: va contigo."},
    baja:     {c:2, chip:"📉 Va en contra",   ojos:"grandes",  cejas:"duda",    boca:"hmm",       pose:"baja",    cuerpo:"lento",  ico:"📉", lbl:"El precio va en contra", frase:"Señala la flecha roja, sin dramatizar."},
    apreton:  {c:1, chip:"🤝 Trato hecho",    ojos:"normales", cejas:"alegres", boca:"son",       pose:"apreton", cuerpo:"flota",  ico:"🤝", lbl:"Trato hecho",          frase:"Te da la mano: lo acordado queda acordado."},
    bosteza:  {c:1, chip:"🥱 Es tarde",       ojos:"dormidos", cejas:"neutral", boca:"o",         pose:"bosteza", cuerpo:"lento",  ico:"🥱", lbl:"Se hace tarde",        frase:"Se tapa el bostezo: te está diciendo que descanses tú también."},
    firme:    {c:2, chip:"🫡 A la orden",     ojos:"normales", cejas:"serias",  boca:"recta",     pose:"firme",   cuerpo:"firme",  ico:"🫡", lbl:"A la orden",           frase:"Se cuadra: recibido y en marcha."},
    calcula:  {c:1, chip:"🧮 Echando cuentas",ojos:"lado",     cejas:"duda",    boca:"hmm",       pose:"calcula", cuerpo:"lento",  piensa:1, ico:"🧮", lbl:"Echando tus cuentas",  frase:"Con la calculadora: números, no impresiones."},
    /* 📱 no hay estado "movil" aparte: el gesto del móvil ES el de analiza (cruzar datos
       mirando su teléfono). Dos estados con la misma postura rompen la regla del fichero. */

    /* ══ 🤟 SEÑAS NUEVAS (v7.56, pedido de Rey el 06-09) ═══════════════════════════ */
    ok:       {c:2, chip:"👌 Impecable",      ojos:"felices",  cejas:"altas",   boca:"sonta",     pose:"ok",         cuerpo:"flota",  ico:"👌", lbl:"Ejecución impecable",  frase:"El círculo de los dedos: esto no es que ganaras, es que lo hiciste BIEN."},
    poquito:  {c:1, chip:"🤏 Por poco",       ojos:"lado",     cejas:"duda",    boca:"hmm",       pose:"poquito",    cuerpo:"lento",  ico:"🤏", lbl:"Te faltó poco",        frase:"El pellizco: dice una cantidad pequeña sin números."},
    asiAsi:   {c:1, chip:"🫱 Ni bien ni mal", ojos:"lado",     cejas:"duda",    boca:"tri",       pose:"asiAsi",     cuerpo:"lento",  ico:"🫱", lbl:"Regular",              frase:"La mano meneándose: ni te aprueba ni te rechaza, y eso también es una respuesta."},
    explica:  {c:1, chip:"🤲 Cuéntame",       ojos:"grandes",  cejas:"altas",   boca:"o",         pose:"explica",    cuerpo:"flota",  ico:"🤲", lbl:"¿Y bien? Explícame",   frase:"Las dos palmas abiertas: quiere entender antes de juzgar."},
    teVigilo: {c:2, chip:"👀 Te vigilo",      ojos:"grandes",  cejas:"serias",  boca:"recta",     pose:"teVigilo",   cuerpo:"firme",  ico:"👀", lbl:"Te estoy mirando",     frase:"Dos dedos a sus ojos y luego a ti: sin regañar, pero mirando."},
    senalaAbajo:{c:2, chip:"👇 Mira abajo",   ojos:"lado",     cejas:"altas",   boca:"son",       pose:"senalaAbajo",cuerpo:"flota",  ico:"👇", lbl:"El nivel de abajo",    frase:"Señala hacia abajo: el nivel está por debajo del precio."},

    espera:   {c:2, chip:"⏳ En guardia",     ojos:"normales", cejas:"neutral", boca:"recta",     pose:"atento",  cuerpo:"lento",  ico:"⏳", lbl:"Aquí sigo, listo",      frase:"De pie, con los brazos sueltos y los ojos bien abiertos: el mercado descansa, él no."},
    animo:    {c:2, chip:"💪🏾 ¡Vamos!",       ojos:"felices",  cejas:"alegres", boca:"dientes",   pose:"musculo", cuerpo:"brinca", ico:"💪🏾", lbl:"¡Tú puedes, Rey!",   frase:"Cuando necesitas que alguien crea en ti."},
    /* carisma, bromas y sentimiento */
    carcajada:{c:3, chip:"😂 Carcajada",      ojos:"felices",  cejas:"alegres", boca:"carcajada", pose:"panza",   cuerpo:"rie",    fx:"risa", ico:"😂", lbl:"¡JAJAJA!",           frase:"Se agarra la panza de la risa cuando le sale un chiste bueno."},
    guino:    {c:3, chip:"😉 Guiño",          ojos:"guino",    cejas:"picara",  boca:"picara",    pose:"pistola", cuerpo:"flota",  ico:"😉", lbl:"Tú y yo sabemos…",      frase:"El guiño cómplice con el dedo apuntándote."},
    burla:    {c:3, chip:"😏 Bromeando",      ojos:"lado",     cejas:"picara",  boca:"picara",    pose:"cuchichea",cuerpo:"flota", ico:"😏", lbl:"Te voy a contar algo…", frase:"Mano en la boca, cuchicheando su broma."},
    lengua:   {c:3, chip:"😜 Guasa",          ojos:"felices",  cejas:"alegres", boca:"lengua",    pose:"encogido",cuerpo:"rie",    ico:"😜", lbl:"¡Era broma!",           frase:"Cuando TÚ le haces la broma a él y te la devuelve."},
    chocalas: {c:3, chip:"🤜 Chócalas",       ojos:"felices",  cejas:"alegres", boca:"dientes",   pose:"codito",  cuerpo:"brinca", ico:"🤜", lbl:"¡Chócalas!",            frase:"El saludo de equipo tras un buen día."},
    carino:   {c:3, chip:"🥰 Cariño",         ojos:"corazon",  cejas:"tristes", boca:"sonrisa",   pose:"corazon", cuerpo:"lento",  fx:"corazones", ico:"🥰", lbl:"Estoy contigo",  frase:"Su lado humano, para los días difíciles."},
    orgulloso:{c:3, chip:"🥹 Orgulloso",      ojos:"felices",  cejas:"tristes", boca:"sonrisa",   pose:"abiertos",cuerpo:"flota",  fx:"chispa", ico:"🥹", lbl:"Así se opera, Rey", frase:"Brazos abiertos cuando cumples tu plan."},
    presumido:{c:3, chip:"😎 Chulería",       ojos:"gafas",    cejas:"neutral", boca:"picara",    pose:"gafasP",  cuerpo:"chulo",  ico:"😎", lbl:"Te lo dije",            frase:"Cuando acertó y no piensa dejarlo pasar 😄"},
    sorprende:{c:3, chip:"😲 Sorpresa",       ojos:"grandes",  cejas:"muyaltas",boca:"grito",     pose:"cachetes",cuerpo:"salto",  ico:"😲", lbl:"¡No me lo esperaba!",   frase:"Manos en la cara del susto."},
    confundido:{c:3,chip:"😕 No entiendo",    ojos:"arriba",   cejas:"duda",    boca:"mueca",     pose:"rasca",   cuerpo:"lento",  piensa:1, ico:"😕", lbl:"A ver, explícame",  frase:"Se rasca la cabeza cuando algo no le cuadra."},
    apenado:  {c:3, chip:"😅 Me equivoqué",   ojos:"felices",  cejas:"tristes", boca:"mueca",     pose:"facepalm",cuerpo:"inclina",fx:"sudor", ico:"😅", lbl:"Me equivoqué…",     frase:"Cuando la fastidia, lo admite con la mano en la cara."},
    ojala:    {c:3, chip:"🙏🏾 Ojalá",         ojos:"dormidos", cejas:"tristes", boca:"hmm",       pose:"reza",    cuerpo:"lento",  ico:"🙏🏾", lbl:"Cruzo los dedos",     frase:"Cuando el trade está en el aire y solo queda esperar."},
    /* descanso */
    siesta:   {c:4, chip:"😴 Siesta",         ojos:"dormidos", cejas:"bajas",   boca:"zzz",       pose:"almohada",cuerpo:"lento",  fx:"zzz", piensa:1, ico:"😴", lbl:"Zzz… vuelvo 8:25", frase:"Cuando la PC se echa la siesta de Londres, él también."},
    /* 👃 01-09 — Rey, medio en broma pero con razón: "que pueda hacer un gesto que
       diga me gusta este olor". Ahora que tiene nariz, puede. */
    huele: { ojos: "felices", cejas: "alegres", boca: "sonrisa", pose: "olisquea", cuerpo: "flota", fx: "olor", lbl: "mmm, qué bien huele esto" },
    olfatea: { ojos: "lado", cejas: "duda", boca: "mueca", pose: "tapanariz", cuerpo: "flota", fx: "olor", lbl: "aquí huele raro" },
  };

  var CATS = { 1: "Cuando te guía", 2: "Cuando algo pasa en el mercado", 3: "Su carisma y sus bromas", 4: "Descanso" };

  /* ── palabras → gesto (para que reaccione solo a los avisos) ── */
  var PISTAS = [
    [/no entres|no entrar|fren|abst[eé]n/i, "frena"],
    /* 🎭 v7.54 — los gestos nuevos. Van ARRIBA de los generales para que ganen ellos
       cuando la frase es concreta (dinero, racha, objetivo…), que si no se los come
       "celebra" o "ensena", que son los cajones de sastre. */
    [/objetivo cumplid|fase superad|cuenta fondead|meta alcanzad|lo lograste|🏆/i, "trofeo"],
    /* 🤟 v7.56 — las señas nuevas, arriba de las generales para que ganen cuando la frase
       es concreta. Un gesto que dice lo mismo que la frase le ahorra a Rey leerla entera. */
    [/impecable|de manual|perfecta ejecuci|clavad|👌/i, "ok"],
    [/por poco|casi lo|te falt[óo] poco|un pel[ií]n|a punto de|🤏/i, "poquito"],
    [/ni bien ni mal|regular|as[ií] as[ií]|a medias|discreto|🫱/i, "asiAsi"],
    [/cu[eé]ntame|expl[ií]came|qu[eé] pas[óo]|por qu[eé] lo hiciste|🤲/i, "explica"],
    [/te vigilo|te estoy mirando|ojo con|no te despistes|👀/i, "teVigilo"],
    [/por debajo|m[aá]s abajo|nivel inferior|soporte en|abajo tienes|👇/i, "senalaAbajo"],
    [/dos seguidas|racha de|van \d+ seguid|✌️/i, "victoria"],
    [/\$\d|d[oó]lar|beneficio|ganancia neta|retirar|capital|balance|lotaje|💰/i, "dinero"],
    [/a favor|acompa[ñn]a|va subiendo|al alza|📈/i, "sube"],
    [/en contra|va bajando|a la baja|retrocede|📉/i, "baja"],
    [/te escucho|cu[eé]ntame|dime|estoy oyendo|👂/i, "escucha"],
    [/trato hecho|de acuerdo|acordado|hecho el pacto|🤝/i, "apreton"],
    [/es tarde|a dormir|desconecta ya|descansa|🥱/i, "bosteza"],
    [/a la orden|recibido|en marcha|entendido, rey|🫡/i, "firme"],
    [/calcul|cuentas|n[uú]meros dicen|expectancy|profit factor|🧮/i, "calcula"],
    [/mirando tus datos|reviso el gr[aá]fico|consultando|📱/i, "analiza"],
    /* 👉 te está mandando hacer algo A TI ⇒ te señala a la cara (Rey, 31-08) */
    [/\bt[uú] (tienes|debes|puedes|vas a)|te toca|h[aá]zlo|hazlo t[uú]|reg[ií]stral|an[oó]tal|s[uú]bel|revisa t[uú]|ahora t[uú]|dep[eé]nde de ti|est[aá] en tus manos/i, "tetoca"],
    [/se[ñn]al|alarma|🔔|entrada confirmada/i, "alerta"],
    [/tp|cazad|ganad|\+\d+(\.\d+)?r|profit|🟢/i, "celebra"],
    [/p[eé]rdida|sl |stop loss|🔴|−\$|perdi/i, "preocupa"],
    [/apag|freno diario|se acab|cierra el d[ií]a|tope/i, "serio"],
    [/siesta|suspend|dormir|😴/i, "siesta"],
    [/auditor[ií]a|revisar el ejecutor|expediente/i, "audita"],
    [/idea|te propongo|pensadero|💡/i, "idea"],
    [/analiz|cruzand|pensand|estudi/i, "analiza"],
    [/killzone|ventana abre|pre-ny|londres abre|⏰/i, "tiempo"],
    [/vigil|posici[oó]n abierta|👁/i, "vigila"],
    [/felicidades|bien hecho|excelente|👏/i, "felicita"],
    [/jaja|jeje|🤣|😂|chiste|broma/i, "carcajada"],
    [/gracias|te quiero|ánimo|contigo/i, "carino"],
    [/error|me equivoqu|perd[oó]n|disculp/i, "apenado"],
    [/vía libre|go |puedes operar|👍/i, "aprueba"],
  ];

  /* ── API ──
     v2 (31-08, Rey: "ese botón flotante debe ser el CUERPO de Roberto, vivo y señalando
     lo que pasa en todo el sistema aunque yo no esté en el chat"): Roberto puede estar
     MONTADO EN VARIOS SITIOS A LA VEZ (su carita en el chat + su cuerpo flotante), y es
     UN SOLO SER: al cambiar de gesto, cambian TODOS sus cuerpos a la vez. */
  var instancias = [], estado = { emo: "saluda", timer: null, ropa: "wallstreet", acc: "" };
  function vivas() { return (instancias = instancias.filter(function (i) { return i.el && i.el.isConnected; })); }

  function css() {
    if (document.getElementById("rob-css")) return;
    var s = document.createElement("style"); s.id = "rob-css"; s.textContent = ROB_CSS;
    document.head.appendChild(s);
  }
  function montar(el, op) {
    if (!el) return null;
    op = op || {};
    css();
    /* 👔 v6.90 — antes de dibujarlo, que se ponga la ropa de la hora que es */
    try { if (!op.ropa) vestirSolo(); else vestir(op.ropa, op.acc); } catch (_) {}
    el.innerHTML = svgHTML() +
      '<div class="rob-fx rob-fx-conf"></div>' +
      '<div class="rob-fx rob-fx-zzz"><span class="rob-flota-ico" style="left:64%;top:30%;color:#4fe0c0;font:800 24px system-ui">z</span>' +
        '<span class="rob-flota-ico" style="left:72%;top:22%;color:#4fe0c0;font:800 30px system-ui;animation-delay:1s">Z</span></div>' +
      '<div class="rob-fx rob-fx-chi"><span class="rob-chispa" style="left:70%;top:16%;font-size:20px">✨</span>' +
        '<span class="rob-chispa" style="left:15%;top:24%;font-size:18px;animation-delay:.6s">✨</span></div>' +
      '<div class="rob-fx rob-fx-sud"><span class="rob-sudor" style="left:64%;top:26%;font-size:19px">💧</span></div>' +
      '<div class="rob-fx rob-fx-risa"><span class="rob-flota-ico" style="left:70%;top:24%;font-size:20px">😂</span>' +
        '<span class="rob-flota-ico" style="left:16%;top:28%;font-size:17px;animation-delay:1.1s">🤣</span></div>' +
      '<div class="rob-fx rob-fx-olor"><span class="rob-flota-ico" style="left:62%;top:20%;font-size:18px">〰️</span><span class="rob-flota-ico" style="left:24%;top:26%;font-size:15px;animation-delay:.9s">〰️</span></div>' +
      '<div class="rob-fx rob-fx-cor"><span class="rob-flota-ico" style="left:68%;top:26%;font-size:20px">💗</span>' +
        '<span class="rob-flota-ico" style="left:18%;top:32%;font-size:16px;animation-delay:1.2s">💗</span></div>';
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    var inst = { el: el, svg: el.querySelector(".rob-svg"), boca: el.querySelector(".rob-boca-viva"), tam: op.tam || "grande" };
    /* recorte CUADRADO de la cara (si no es cuadrado, el círculo del avatar la deforma):
       entra el anillo dorado, cejas, ojos y boca — y las manos que suben hasta la cara */
    if (op.tam === "mini") { inst.svg.setAttribute("viewBox", "90 88 180 180"); inst.svg.classList.add("rob-solo-cara"); }
    /* 🫧 BUSTO: medio cuerpo CON BRAZOS (para cuando haga falta un recorte cuadrado) */
    if (op.tam === "busto") inst.svg.setAttribute("viewBox", "56 54 248 248");
    /* 🧍 CUERPO ENTERO — Rey (31-08): "lo quiero A CUERPO COMPLETO, suelto en la pantalla,
       NO encerrado en un círculo". De la goma a la punta del lápiz, con los brazos más
       abiertos dentro del cuadro. Es el Roberto que flota en Apex y el que flotará sobre
       cualquier aplicación cuando hagamos la APK. */
    if (op.tam === "cuerpo") inst.svg.setAttribute("viewBox", "48 28 264 462");
    vivas().push(inst);
    /* confeti */
    var cf = el.querySelector(".rob-fx-conf"), col = ["#f0c95c", "#ff6f61", "#4fe0c0", "#fbf7ec"];
    for (var i = 0; i < 13; i++) {
      var d = document.createElement("div"); d.className = "rob-conf";
      d.style.left = (5 + i * 7.4) + "%"; d.style.background = col[i % 4]; d.style.animationDelay = (i * 0.14) + "s";
      cf.appendChild(d);
    }
    /* 👔 v6.90 — un cuerpo nuevo nace con la ropa que Roberto lleva puesta ahora mismo:
       es uno solo, no puede estar de traje en el chat y en pijama en la pantalla */
    pintarVestido(inst);
    ponerEn(inst, op.emo || estado.emo || "saluda", poseDe(op.emo || estado.emo || "saluda"));
    return inst;
  }
  /* 🧍 v7.65 — LA GUARDIA VA CAMBIANDO DE POSTURA. Rey (06-09): "que no quede solo con las
     manos juntas cuando está sin hacer nada". La postura se elige UNA VEZ (en poner) y se le
     pasa a todos sus cuerpos, para que el Roberto de dentro de Apex y el que flota estén
     SIEMPRE igual — que son el mismo. */
  var GUARDIA = ["atento", "sueltos", "unaCadera", "bolsillos", "codo"];
  var _guardia = 0;
  function poseDe(k) {
    var e = ROB_EMO[k];
    if (!e) return null;
    if (k !== "espera") return e.pose;
    _guardia = (_guardia + 1) % GUARDIA.length;
    return GUARDIA[_guardia];
  }
  function ponerEn(inst, k, pose) {
    var e = ROB_EMO[k], s = inst && inst.svg;
    if (!e || !s) return null;
    s.classList.remove("rob-hablando");
    s.dataset.ojos = e.ojos; s.dataset.cejas = e.cejas || "neutral"; s.dataset.boca = e.boca;
    s.dataset.pose = pose || e.pose; s.dataset.fx = e.fx || "";
    /* 🎬 v7.15 — REINICIAR LA ANIMACIÓN SIN QUE SE LE BORRE EL CUERPO.
       Rey (02-09): "hace un gesto extraño cuando va a salir la nube, como que aparece y
       desaparece en ese momento; debería salir con naturalidad".
       LA CAUSA ESTABA JUSTO AQUÍ: para que la animación del cuerpo volviera a empezar se
       ponía `data-cuerpo=""`, se forzaba un recálculo y se volvía a poner. Ese hueco dura un
       fotograma — pero en ese fotograma NINGUNA regla de postura casa con él, así que Roberto
       se queda sin brazos ni piernas y vuelve. Es el parpadeo que ve Rey, y salta a la vista
       justo al sacar la nubecita porque es cuando cambia de gesto.
       Ahora se congela un instante lo que se mueve (con una clase; nada se borra) y se
       suelta: la animación arranca de cero igual, pero él no deja de estar ni un fotograma. */
    s.classList.add("rob-recongela"); void s.offsetWidth; s.classList.remove("rob-recongela");
    s.dataset.cuerpo = e.cuerpo;
    /* 📱 v6.90 — el accesorio del momento entra y sale con el gesto */
    try { estado.emo = k; repasarRopa(); pintarVestido(inst); } catch (_) {}
    return e;
  }
  /* 📱 EL ACCESORIO DEL MOMENTO (no del armario): lo coge para un gesto y lo suelta al
     cambiar. Si esto se guardara junto a su ropa, al terminar de analizar se quedaría con
     el móvil en la mano para siempre. */
  var ACC_GESTO = {
    /* 📱 v7.54 — analiza y audita YA NO cogen el móvil como accesorio: ahora el móvil es un
       gesto suyo (pose "movil"), con su brazo sujetándolo. Un accesorio no puede parecer
       agarrado cuando el gesto ya está dibujando sus dos manos. */
    celebra: "gafasSol",  /* +1.85R cazado: se pone las gafas de sol */
    presumido: "gafasSol",
    siesta:  "taza",      /* nunca duerme; si está de guardia a deshora, con su café */
  };
  function accDelMomento() { return ACC_GESTO[estado.emo] || ""; }
  function pintarVestido(inst) {
    var todo = (estado.acc + " " + accDelMomento()).trim().replace(/\s+/g, " ");
    inst.svg.dataset.ropa = estado.ropa;
    inst.svg.dataset.acc = todo;
  }

  /* ══ 👔 VESTIRSE ═══════════════════════════════════════════════════════════════════
     vestir("casual")                → se cambia de ropa
     vestir("wallstreet", "gafasSol")→ ropa + un accesorio
     vestir(null, ["gorra","movil"]) → deja la ropa, se pone dos accesorios
     vestir(null, "")                → se quita todos los accesorios
     Como es UNO SOLO, se cambia en todos sus cuerpos a la vez. */
  function vestir(ropa, acc) {
    if (ropa && ROPAS[ropa]) estado.ropa = ropa;
    if (acc !== undefined && acc !== null) {
      var lista = Array.isArray(acc) ? acc : String(acc).split(/[ ,]+/);
      estado.acc = lista.filter(function (a) { return a && ACCS[a]; }).join(" ");
    }
    vivas().forEach(pintarVestido);
    return { ropa: estado.ropa, acc: estado.acc };
  }

  /* ══ 🕒 Y QUE SE VISTA SOLO, SEGÚN LA HORA DEL MERCADO ═════════════════════════════
     Rey: "la corbata mientras está en el horario del mercado… fuera de él ropa casual y
     también de casa". Se mira la hora de NUEVA YORK, que es la que manda en su operativa
     (y así no se descoloca con los cambios de horario de Brasil).
       · lunes a viernes, de la apertura de Londres al cierre de Nueva York → TRAJE
       · el resto del día laborable → ropa casual (y una taza de madrugada, que no duerme)
       · sábado y domingo → ropa de casa
       · 24, 25 y 26 de diciembre → el traje rojo · 31 de diciembre y 1 de enero → esmoquin
     Es de lo poco que Roberto decide sin preguntar: es su ropa. */
  function ahoraNY() {
    try {
      var p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short",
        hour: "2-digit", minute: "2-digit", hour12: false, month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var h = parseInt(o.hour, 10); if (h === 24) h = 0;
      /* 🕗 v7.63 — TAMBIÉN LA HORA DE REY, y sale de aquí a propósito: cuando la noche pasó a
         medirse con SU reloj, la decisión empezó a depender de DOS relojes, y las pruebas que
         solo fingían el de Nueva York se volvieron impredecibles (dos bancos se pusieron rojos
         según la hora a la que se corrieran). Con las dos horas saliendo del MISMO sitio,
         fingir el momento vuelve a ser una sola cosa. */
      return { dia: o.weekday, h: h, min: parseInt(o.minute, 10),
               mes: parseInt(o.month, 10), num: parseInt(o.day, 10),
               hRey: new Date().getHours() };
    } catch (_) { return null; }
  }
  function ropaDeAhora() {
    var t = ahoraNY();
    if (!t) return { ropa: "wallstreet", acc: "" };
    if (t.mes === 12 && t.num >= 24 && t.num <= 26) return { ropa: "navidad", acc: "" };
    if ((t.mes === 12 && t.num === 31) || (t.mes === 1 && t.num === 1)) return { ropa: "fiesta", acc: "" };
    var finde = (t.dia === "Sat" || t.dia === "Sun");
    /* el accesorio se elige más abajo, cuando ya se sabe QUÉ ROPA lleva puesta (v7.64) */
    var m = momentoDelDia(t);              /* 0 madrugada · 1 mercado · 2 tarde · 3 noche */

    /* ══ 👕 TRES MUDAS AL DÍA, Y OTRAS TRES EL FIN DE SEMANA (v7.54) ═══════════════════
       Rey (06-09): "tiene la misma ropa de ayer, no ha cambiado de ropa; lo único que
       cambió fue el sombrero y continúa con la misma tacita de ayer al lado… quiero tres
       mudas: el traje en horario de trabajo, por la tarde, las de casa y en la noche… y
       los fines de semana, sábado y domingo, igual: tres cambios de ropa distintas".
       Tenía razón dos veces:
         · sus mudas del día a día eran TRES Y SOLO TRES (wallstreet, casual, casa) y
           nunca cambiaban de color: lo único capaz de variar era el accesorio;
         · y el fin de semana era una sola línea —bata de casa MÁS TAZA, todo el sábado y
           todo el domingo— así que veía la misma bata y la misma tacita dos días seguidos.
       AHORA cada momento del día tiene su CAJÓN de mudas y se saca una por FECHA: el mismo
       día lleva lo mismo de la mañana a la noche (no se disfraza delante de él) pero mañana
       le toca otra. Con cajones de 4-6 prendas y saltos distintos por momento, no repite
       conjunto ni de un día para otro ni al pasar de la mañana a la tarde. */
    var CAJONES = finde ? {
      man: ["chandalAzul", "poloVerde", "sudaderaGranate", "chandalVerde", "poloVino"],
      tar: ["hawaiana", "camisaCuadros", "hawaianaRoja", "poloBlanco", "sudaderaVerde"],
      noc: ["pijamaRayas", "bataVino", "pijamaGris", "bataVerde", "casa"]
    } : {
      man: ["wallstreet", "trajeNegro", "trajeAzul", "trajeGranate", "trajeGris", "trajeVerde"],
      tar: ["casual", "sudaderaAzul", "sudaderaVerde", "camisaCuadros", "poloBlanco", "sudaderaApex", "sudaderaGranate"],
      noc: ["casa", "bataVino", "pijamaRayas", "chandalGris", "bataVerde", "pijamaGris"]
    };
    var fecha = (t.num || 1) + (t.mes || 1) * 31;
    function delCajon(lista, salto) { return lista[(fecha + salto) % lista.length]; }

    /* 👕 v7.64 — PRIMERO LA ROPA Y DESPUÉS EL ACCESORIO, y es el orden lo que arregla el
       defecto: antes el accesorio se elegía a ciegas, sin saber qué prenda iba a llevar, y
       por eso podía acabar una gorra sobre un pijama. Ahora se sabe lo que lleva puesto y
       se le pone lo que le pega.
       ☕ LA TAZA, SOLO DE MADRUGADA: ahí cuenta algo de él (está en pie cuando abre Londres);
       a cualquier otra hora Rey acababa viéndole "la misma tacita" de siempre. */
    var ropa = (m === 0 || m === 3) ? delCajon(CAJONES.noc, 0)
             : (m === 2)            ? delCajon(CAJONES.tar, 2)
                                    : delCajon(CAJONES.man, 5);
    var acc = accDelDia(t, ropa);
    if (m === 0) acc = mezcla("taza", acc);
    return { ropa: ropa, acc: acc };
  }

  /* El accesorio del MOMENTO. Cambia con el día Y con el tramo del día.
     🎩 v7.27 — Rey (04-09): "hoy está de traje y con gafa puesta… diversificar la ropa y
     los accesorios para que no sea monótono; nada de él sea aburrido, que me sorprenda para
     presumirlo con cualquiera". Antes el accesorio se elegía SOLO por la fecha: el mismo
     de las 3 de la mañana a las 11 de la noche. Ahora el día tiene TRES momentos (mañana
     de mercado, tarde y noche) y en cada uno se arregla distinto — sin llegar a cambiarse
     cada veinte segundos, que eso parecería un disfraz y no una persona. */
  function accDelDia(t, ropa) {
    try {
      /* 👕 v7.31 — SE ARREGLA SIEMPRE, Y NUNCA IGUAL QUE HACE UN RATO.
         Rey (04-09): "diversificar la ropa y los accesorios… nada de él sea aburrido, debe
         sorprenderme para presumirlo con cualquiera".
         SE PROBÓ SU CÓDIGO REAL UNA SEMANA ENTERA (scratchpad/ver-ropa.cjs) y salieron tres
         cosas feas que él ya había notado a ojo:
           · 4 de los 12 turnos estaban VACÍOS → días enteros sin un solo accesorio.
           · el turno duraba de las 2:00 a las 13:00 NY → la misma gorra toda su jornada.
           · "casa" añade taza y el turno podía traer taza → salía "taza taza" (dos tazas).
         AHORA: doce combinaciones, TODAS con algo puesto; cuatro momentos al día en vez de
         tres (Londres · Nueva York · tarde · noche), y el salto de 7 con 12 turnos hace que
         no se repita ninguno ni al pasar de momento ni al pasar de día.
         ⚠️ SOLO se usan prendas y accesorios QUE YA EXISTEN (ACCS, arriba): aquí no se
         diseña nada nuevo — se combina lo que Rey ya aprobó. */
      /* 📱 v7.54 — el móvil sale de esta rotación: era lo que hacía que apareciera flotando
         al lado del cuerpo a cualquier hora. Ahora solo aparece cuando lo COGE (pose movil). */
      /* 🎩 v7.64 — CADA MOMENTO TIENE SUS ACCESORIOS, Y CADA PRENDA LOS SUYOS.
         Rey (06-09): "las combinaciones son fatales: pijama con audífonos y gorra, o sea esos
         accesorios para un pijama y en horario de sueño y descanso está fuera de lugar… si no
         va a salir en gorra y audífonos con los trajes. Los accesorios de la madrugada son una
         cosa, los del horario de trabajo otra, los de la tarde otra y los de la noche otra.
         Ropas y accesorios en su momento, hora y lugar."
         TENÍA RAZÓN: había UNA SOLA rueda de 12 turnos para todo el día, y solo se descartaban
         dos cosas sueltas (gafas de sol de noche, bufanda de día). Todo lo demás entraba en
         cualquier momento y con cualquier prenda — de ahí el pijama con gorra y auriculares.
         AHORA cada momento tiene SU PROPIA rueda, y encima se filtra por la CLASE de prenda:
         con traje no se lleva gorra; en pijama no se llevan auriculares. */
      var tramo = momentoDelDia(t);
      var RUEDAS = {
        /* 0 · madrugada: en pie cuando abre Londres, en bata o pijama. Su taza y poco más. */
        0: ["taza", "taza bufanda"],
        /* 1 · su ventana de trabajo: lo que pega con un traje (y también con un polo el finde) */
        /* ⚠️ las GAFAS DE SOL salen POCO aquí a propósito: en su manual son para celebrar una
           operación cazada o para ponerse chulo, y si las llevara puestas media jornada
           dejarían de significar eso. Y un traje sin nada encima también es una pinta. */
        /* ⚠️ v7.68 — SIN RANURA VACÍA EN HORARIO DE TRABAJO. Rey (07-09): "desde el comienzo de
           Londres él debería estar con traje, corbata y SUS ACCESORIOS correspondientes". Con
           el traje se le van los auriculares y la gorra (no pegan), así que si además le tocaba
           la ranura vacía se pasaba la jornada entera sin nada encima. */
        1: ["sombrero", "lapizOreja", "sombrero lapizOreja", "gafasSol",
            "lapizOreja auriculares", "auriculares", "gafasSol lapizOreja"],
        /* 2 · la tarde, ya de calle: aquí sí cabe la gorra */
        2: ["gorra", "gafasSol", "gorra gafasSol", "auriculares", "sombrero", "gorra auriculares"],
        /* 3 · la noche: se acaba el día y está en casa. Rey (06-09): "EN VEZ DE NADA en la
           noche sería bueno agregar nuevos accesorios para cada ocasión, para no repetir la
           misma todo el tiempo". Se lo pidió literalmente: en vez de nada, algo — así que la
           noche tiene ahora LO SUYO (gorro de dormir, antifaz en la frente, manta por los
           hombros, bufanda) y SIETE maneras distintas, una por día de la semana, sin repetir
           y sin ninguna noche vacía. */
        /* 🧣 v7.67 — FUERA LA MANTA. Rey se quejó DOS VECES de lo mismo con distinta prenda:
           primero de la bufanda ("parece un paño tirado en el cuello") y luego, ya con la
           bufanda rehecha, de la manta ("el trapo"). Una tela echada por encima no le gusta
           sobre este cuerpo, y no vale la pena insistir: se retira. Le quedan cuatro maneras
           de arreglarse por la noche y ninguna se repite en la semana. */
        3: ["gorroDormir", "bufanda", "antifaz", "gorroDormir bufanda", "antifaz bufanda",
            "gorroDormir", "antifaz"]
      };
      var rueda = RUEDAS[tramo] || RUEDAS[2];
      var n = (t.num || 1) + (t.mes || 1) * 31 + tramo * 7;
      for (var i = 0; i < rueda.length; i++) {
        var cruda = rueda[(n + i) % rueda.length];
        /* ⚠️ IR SIN NADA ES UNA DECISIÓN, NO UN HUECO. En la rueda de la noche hay ranuras
           vacías a propósito, y si se saltaran (como se salta lo que no pega) acabaría con la
           bufanda puesta TODAS las noches — el mismo defecto de "la misma tacita" con otro
           nombre. Así que una ranura vacía se respeta y se devuelve tal cual. */
        if (cruda === "") return "";
        var a = quitaLoQueNoPega(cruda, tramo, ropa);
        if (a) return a;
      }
      /* y si en este momento no le pega NADA de la rueda, va sin nada: forzarle una gorra a
         un pijama es justo el defecto que Rey señaló. */
      return "";
    } catch (_) { return ""; }
  }

  /* 👔 LA CLASE DE CADA PRENDA, para que el accesorio le pegue a lo que lleva puesto.
     No se adivina por el nombre: se dice pieza a pieza, que es lo único que no se rompe
     cuando mañana se añada una muda nueva. */
  var CLASE_ROPA = {
    wallstreet: "formal", trajeNegro: "formal", trajeAzul: "formal", trajeGranate: "formal",
    trajeGris: "formal", trajeVerde: "formal", navidad: "formal", fiesta: "formal",
    casa: "dormir", bataVino: "dormir", bataVerde: "dormir",
    pijamaRayas: "dormir", pijamaGris: "dormir"
    /* todo lo demás (sudaderas, polos, camisas, chándals, hawaianas) es "calle" */
  };
  function claseDe(ropa) { return CLASE_ROPA[ropa] || "calle"; }
  /* qué pieza le pega a qué clase de ropa */
  function pegaConLaRopa(pieza, ropa) {
    var c = claseDe(ropa);
    /* CON TRAJE solo lo que le pega a un traje. Rey (06-09): "vi el traje con audífonos, eso
       está fuera de lugar; que combine con cada cosa, momento, hora y lugar". Los auriculares
       son de calle y de tarde: con traje no. Le quedan el sombrero, su lápiz en la oreja, las
       gafas (poco, que son de celebrar) o el traje limpio, que también es una pinta. */
    if (c === "formal")
      return ["gorra", "taza", "auriculares", "gorroDormir", "antifaz"].indexOf(pieza) < 0;
    /* en bata o pijama: solo lo que pega con estar en casa */
    if (c === "dormir") return ["taza", "bufanda", "gorroDormir", "antifaz", "manta"].indexOf(pieza) >= 0;
    /* de calle: ni la taza ni las cosas de dormir */
    return ["taza", "gorroDormir", "antifaz"].indexOf(pieza) < 0;
  }

  /* Los cuatro momentos de su día: 0 Londres (madrugada) · 1 Nueva York · 2 tarde · 3 noche.
     Todo lo que decide cómo va vestido cuelga de AQUÍ y no del reloj pelado, y esa es la
     diferencia que arregló el defecto: si una regla mira la hora cruda, a las 17:59 lleva
     gafas y a las 18:01 no — o sea, se cambia solo delante de Rey, que es justo lo que él
     llamó "disfrazarse". Colgando de los momentos, se arregla UNA vez y así sigue. */
  /* 🕑 v7.68 — SU JORNADA EMPIEZA CUANDO ABRE LONDRES, NO CUANDO ABRE NUEVA YORK.
     Rey (07-09, en plena sesión de Londres): "Roberto todavía está con pijama y taza, y desde
     el comienzo de Londres él debería estar con traje, corbata y sus accesorios".
     ERA UN FALLO CLARO Y SE VE EN UNA LÍNEA: la madrugada llegaba hasta las 08:00 de Nueva
     York, así que las killzones de Londres (02:00 NY) y de Pre-NY (07:30 NY) —su jornada
     entera de la mañana— caían dentro de "madrugada" y le tocaba pijama.
     Su ventana operativa de verdad es la del Ejecutor: 01:00–13:00 de Nueva York, y Londres
     abre a las 02:00. A partir de ahí es horario de trabajo y va de traje. */
  var TRABAJO_ABRE = 2;    /* 02:00 NY = apertura de Londres (03:00 de Rey) */
  var TRABAJO_CIERRA = 13; /* 13:00 NY = cierre de su ventana (14:00 de Rey) */
  function momentoDelDia(t) {
    var h = t && typeof t.h === "number" ? t.h : 12;   /* la hora de NUEVA YORK */
    if (h >= TRABAJO_ABRE && h < TRABAJO_CIERRA) return 1;   /* de traje: es su jornada */
    if (h < TRABAJO_ABRE) return 0;   /* en pie antes de que abra Londres: cómodo y con su taza */
    /* 🌆 v7.63 — LA TARDE Y LA NOCHE SON DE SU VIDA, NO DEL MERCADO, ASÍ QUE VAN CON SU RELOJ.
       Rey (06-09, 19:31 de Timbó): "¿ya es de noche y Roberto sigue con la misma ropa?".
       Y tenía razón: la frontera estaba puesta a las 20:00 de NUEVA YORK, que son las 21:00
       suyas. Con el sol puesto desde hacía casi dos horas, Roberto seguía en camisa hawaiana
       y auriculares. Que lleve traje en horario de mercado sí depende de Nueva York —esa parte
       se queda—, pero si es de noche o no, lo dice la ventana de Rey, no la de Wall Street. */
    var hl = (t && typeof t.hRey === "number") ? t.hRey : h;
    return (hl >= 19 || hl < 5) ? 3 : 2;
  }

  /* Las dos reglas de sentido común que ya tenía, ahora por momento y pieza a pieza (un
     turno puede llevar dos accesorios y antes se caía entero por culpa de uno). */
  function quitaLoQueNoPega(combo, tramo, ropa) {
    var fuera = [];
    var piezas = String(combo || "").split(" ");
    for (var i = 0; i < piezas.length; i++) {
      var p = piezas[i];
      if (!p) continue;
      /* 👔 v7.64 — y que le pegue a LO QUE LLEVA PUESTO, no solo a la hora: gorra con traje no,
         auriculares con pijama tampoco. Era lo que Rey llamó "combinaciones fatales". */
      if (ropa && !pegaConLaRopa(p, ropa)) continue;
      /* las gafas de sol de noche no, que no es un videoclip: solo con el sol arriba */
      if (p === "gafasSol" && (tramo === 0 || tramo === 3)) continue;
      /* la bufanda solo de madrugada y de noche, que es cuando refresca */
      if (p === "bufanda" && (tramo === 1 || tramo === 2)) continue;
      /* ☕ v7.63 — LA TAZA, SOLO DE MADRUGADA, DE VERDAD. La regla estaba escrita y se cumplía
         en un sitio (el armario la añade a mano a las horas de Londres), pero la rotación de
         accesorios la seguía sacando a media mañana y por la tarde — o sea que Rey volvía a
         verle la tacita a cualquier hora, que es justo de lo que se quejó. De madrugada dice
         algo suyo (está en pie cuando abre Londres); a las tres de la tarde no dice nada. */
      if (p === "taza" && tramo !== 0) continue;
      fuera.push(p);
    }
    return fuera.join(" ");
  }

  /* 🍵 v7.31 — y sin repetir pieza. "casa" ya trae su taza, y si el turno del día también
     traía taza salía con DOS tazas ("taza taza"): se veía en la simulación de la semana. */
  function mezcla(a, b) {
    var vistas = {}, out = [];
    var todo = String(a || "").split(" ").concat(String(b || "").split(" "));
    for (var i = 0; i < todo.length; i++) {
      var p = todo[i];
      if (!p || vistas[p]) continue;
      vistas[p] = 1; out.push(p);
    }
    return out.join(" ");
  }
  function vestirSolo() { var r = ropaDeAhora(); return vestir(r.ropa, r.acc); }
  /* Se repasa la hora AL CAMBIAR DE GESTO (cada 12–28 s en su vida de fondo), como mucho
     una vez cada 5 minutos. Sin temporizadores: uno que se repite cuelga el navegador de
     pruebas —el tiempo virtual no llega nunca al final— y deja procesos vivos en Node. */
  var _ropaVista = 0;
  function repasarRopa() {
    var ahora = Date.now();
    if (ahora - _ropaVista < 5 * 60000) return;
    _ropaVista = ahora;
    var r = ropaDeAhora();
    /* 👕 v7.27 — antes solo se miraba la MUDA: si el traje seguía siendo el traje, el
       accesorio nuevo no llegaba nunca a ponerse. Ahora se mira también lo que lleva
       encima, que es justo lo que Rey nota. */
    if (r.ropa !== estado.ropa || (r.acc || "") !== (estado.acc || "")) vestir(r.ropa, r.acc);
  }

  /* Un solo Roberto: el gesto cambia en TODOS sus cuerpos a la vez */
  function poner(k) {
    deFrenteYa();                 /* 🔒 gesticular = mirar a Rey. Sin excepciones. */
    var e = ROB_EMO[k]; if (!e) return null;
    estado.emo = k;
    var p = poseDe(k);
    vivas().forEach(function (i) { ponerEn(i, k, p); });
    return e;
  }
  /* 🔄 v7.54 — girarse. Ver el comentario de espaldaHTML(): esto no es un 3D de verdad
     (no lo hay ni puede haberlo con cincuenta posturas dibujadas de frente), es el giro
     sobre el eje de los dibujos animados, que es lo que se lee bien en pantalla. */
  var _vista = "frente";
  /* @param yaMismo — de frente EN EL ACTO, sin el achatado. Se usa cuando llega algo
     importante: no se le puede pedir a Rey que espere medio segundo a que su mentor
     termine de girarse para leerle una alarma. */
  function mirar(v, yaMismo) {
    v = (v === "espalda") ? "espalda" : "frente";
    if (v === _vista) return v;
    _vista = v;
    vivas().forEach(function (i) {
      var s = i.svg;
      var limpia = function () { s.classList.remove("rob-g1", "rob-g2", "rob-g3"); };
      if (yaMismo) { limpia(); s.dataset.vista = v; return; }
      /* 🔄 v7.58 — TRES FASES: se estrecha → se ve su canto → se abre del otro lado.
         Los relojes van en cadena para que el cambio de dibujo caiga justo en el paso de
         una fase a la siguiente; si se cambiara antes o después, se vería el salto. */
      limpia(); void s.offsetWidth; s.classList.add("rob-g1");
      setTimeout(function () {                       /* 190 ms: ya está de canto */
        s.classList.remove("rob-g1"); s.dataset.vista = "canto"; void s.offsetWidth; s.classList.add("rob-g2");
      }, 190);
      setTimeout(function () {                       /* 410 ms: sale por el otro lado */
        s.classList.remove("rob-g2"); s.dataset.vista = v; void s.offsetWidth; s.classList.add("rob-g3");
      }, 410);
      setTimeout(limpia, 610);
    });
    return v;
  }
  /* 🔒 LEY DE REY (06-09): "que no interfiera con ninguna alarma ni aviso importante… debe
     mostrarme el gráfico DE FRENTE, hablándome, notificándome las alarmas y respondiéndome".
     Este es el cierre de abajo: pase lo que pase y venga de donde venga, si Roberto va a
     gesticular o a hablar, PRIMERO se pone de frente. No hay forma de que se le quede la
     espalda puesta mientras le dice algo. */
  function deFrenteYa() {
    /* 🔒 y también si está a MITAD de giro: si llega una alarma mientras se da la vuelta,
       se corta el giro en seco y se pone de frente. Su ley no admite "espera a que acabe". */
    var aMedias = false;
    try { aMedias = vivas().some(function (i) { return /rob-g[123]/.test(i.svg.className.baseVal || i.svg.getAttribute("class") || ""); }); } catch (_) {}
    if (_vista !== "frente" || aMedias) { _vista = "espalda"; mirar("frente", true); }
  }
  function gestoDe(txt) {
    var t = String(txt || "");
    for (var i = 0; i < PISTAS.length; i++) if (PISTAS[i][0].test(t)) return PISTAS[i][1];
    return "ensena";
  }
  function hablar(texto, op) {
    deFrenteYa();                 /* 🔒 hablar = mirar a Rey. Sin excepciones. */
    op = op || {};
    if (!vivas().length) return;
    callar();
    /* la boca la mueve la animación robHabla (ritmo continuo de vocalización); antes se
       sacudía con valores al azar cada 105 ms y parecía un tic, no que estuviera hablando */
    vivas().forEach(function (i) { i.svg.classList.add("rob-hablando"); });
    if (op.mudo) return;                       // Apex ya tiene su propia voz: solo la boca
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(texto || ""));
      u.lang = "es-ES"; u.rate = 1.02; u.pitch = 1.08;
      var v = speechSynthesis.getVoices().find(function (x) { return /^es/i.test(x.lang); });
      if (v) u.voice = v;
      u.onend = u.onerror = function () { callar(); };
      speechSynthesis.speak(u);
    } catch (_) { callar(); }
  }
  function callar() {
    if (estado.timer) { clearInterval(estado.timer); estado.timer = null; }
    vivas().forEach(function (i) { i.svg.classList.remove("rob-hablando"); });
  }

  raiz.Roberto = {
    /* 🔄 Roberto.mirar("espalda"|"frente") — se gira sobre su eje. El cambio de vista se
       hace EN MITAD del achatado (a los 240 ms), que es cuando está de canto y no se ve:
       si se cambiara antes o después, se vería el salto. */
    mirar: mirar, deEspaldas: function () { mirar("espalda"); }, deFrente: function () { mirar("frente", true); },
    vista: function () { return _vista; },
    montar: montar, poner: poner, hablar: hablar, callar: callar, gestoDe: gestoDe,
    vestir: vestir, vestirSolo: vestirSolo, ropaDeAhora: ropaDeAhora,
    ropas: function () { return Object.keys(ROPAS); }, accesorios: function () { return Object.keys(ACCS); },
    vestido: function () { return { ropa: estado.ropa, acc: estado.acc }; },
    emociones: ROB_EMO, cats: CATS, lista: function () { return Object.keys(ROB_EMO); },
    actual: function () { return estado.emo; }, svgHTML: svgHTML, css: ROB_CSS,
  };
})(typeof window !== "undefined" ? window : globalThis);
