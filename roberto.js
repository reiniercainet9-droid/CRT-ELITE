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
  .rob-svg [data-cuerpo="flota"]   .rob-todo{animation:robFlota 3.6s ease-in-out infinite}
  .rob-todo{transform-origin:180px 300px}
  .rob-svg{--rj:#22305f;--rj2:#16204a;--rmad:#f4ac3c;--rmad2:#d3841c;--roro:#f0c95c;--roro2:#b8933a;
           --rcam:#fbf7ec;--rgu:#fdfcf7;--rgu2:#c9c2ac;--rtz:#3a2a10;--rcor:#ff6f61;--rteal:#4fe0c0}
  [data-cuerpo="flota"]   .rob-todo{animation:robFlota 3.6s ease-in-out infinite}
  [data-cuerpo="lento"]   .rob-todo{animation:robFlota 6s ease-in-out infinite}
  [data-cuerpo="brinca"]  .rob-todo{animation:robBrinca .55s ease-in-out infinite}
  [data-cuerpo="tiembla"] .rob-todo{animation:robTiembla .12s linear infinite}
  [data-cuerpo="inclina"] .rob-todo{animation:robInclina 3.4s ease-in-out infinite}
  [data-cuerpo="rie"]     .rob-todo{animation:robRie .38s ease-in-out infinite}
  [data-cuerpo="chulo"]   .rob-todo{animation:robChulo 2.6s ease-in-out infinite}
  [data-cuerpo="firme"]   .rob-todo{animation:none}
  [data-cuerpo="salto"]   .rob-todo{animation:robSalto .5s ease-out}
  @keyframes robFlota{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
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
  [data-ojos="normales"] .rob-globos,[data-ojos="lado"] .rob-globos{animation:robPest 4.8s infinite}
  @keyframes robPest{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}

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
  /* 🖼️ SOLO LA CARA (avatar del chat y caritas de los avisos): a ese tamaño los brazos
     entran cortados por el borde y ensucian; el gesto se lee en cejas, ojos y boca. */
  .rob-solo-cara .rob-pose{display:none!important}

  /* poses */
  .rob-pose{display:none}
  .rob-agita{transform-box:fill-box; transform-origin:70% 90%; animation:robAgita .62s ease-in-out infinite}
  @keyframes robAgita{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(-26deg)}}
  [data-pose="arriba"] .rob-p-arriba,[data-pose="aplaude"] .rob-p-aplaude{animation:robVibra .3s ease-in-out infinite}
  @keyframes robVibra{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  .rob-lupa{transform-box:fill-box; transform-origin:center; animation:robBusca 2.4s ease-in-out infinite}
  @keyframes robBusca{0%,100%{transform:translate(0,0)}50%{transform:translate(-7px,8px)}}
  .rob-indice{animation:robVibra .8s ease-in-out infinite}
  .rob-escribe{transform-box:fill-box; transform-origin:20% 50%; animation:robApunta .7s ease-in-out infinite}
  @keyframes robApunta{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,3px)}}
  /* 👉 lo que va HACIA REY se acerca y se aleja: vende que sale de la pantalla */
  .rob-empuja{transform-box:fill-box; transform-origin:center; animation:robEmpuja 1.5s ease-in-out infinite}
  @keyframes robEmpuja{0%,100%{transform:scale(1)}50%{transform:scale(1.16) translate(-6px,2px)}}

  /* efectos */
  .rob-fx{position:absolute; inset:0; pointer-events:none; display:none}
  [data-fx="confeti"] .rob-fx-conf{display:block}
  [data-fx="zzz"] .rob-fx-zzz{display:block}
  [data-fx="chispa"] .rob-fx-chi{display:block}
  [data-fx="sudor"] .rob-fx-sud{display:block}
  [data-fx="risa"] .rob-fx-risa{display:block}
  [data-fx="corazones"] .rob-fx-cor{display:block}
  .rob-conf{position:absolute; top:-14px; width:8px; height:13px; border-radius:2px; animation:robCae 1.7s linear infinite}
  @keyframes robCae{0%{transform:translateY(-10px) rotate(0)}100%{transform:translateY(420px) rotate(560deg); opacity:.1}}
  .rob-flota-ico{position:absolute; animation:robSube 2.6s ease-in infinite; opacity:0}
  @keyframes robSube{0%{transform:translateY(0) scale(.8)}22%{opacity:.95}100%{transform:translateY(-70px) scale(1.1); opacity:0}}
  .rob-chispa{position:absolute; animation:robCentella 1.4s ease-in-out infinite}
  @keyframes robCentella{0%,100%{opacity:.15; transform:scale(.7)}50%{opacity:1; transform:scale(1.15)}}
  .rob-sudor{position:absolute; animation:robGotea 1.6s ease-in infinite}
  @keyframes robGotea{0%{transform:translateY(0); opacity:.9}100%{transform:translateY(34px); opacity:0}}
  @media (prefers-reduced-motion:reduce){.rob-svg *,.rob-fx *{animation:none!important}}
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
  };

  /* 🩹 FIX (31-08, lo cazó Rey mirando la demo: "Roberto no tiene brazos ni manos"):
     `.rob-pose{display:none}` los ocultaba TODOS y no había ninguna regla que mostrara el
     del gesto activo — los 33 pares de brazos existían dibujados pero invisibles. La regla
     se GENERA aquí desde POSES, así jamás se puede volver a desincronizar al añadir gestos. */
  ROB_CSS += "\n" + Object.keys(POSES).map(function (k) { return '[data-pose="' + k + '"] .rob-p-' + k; }).join(",") + "{display:block}\n";

  /* ── EL PERSONAJE ── */
  function svgHTML() {
    var poses = "";
    for (var k in POSES) poses += '<g class="rob-pose rob-p-' + k + '">' + POSES[k] + "</g>";
    return '<svg class="rob-svg" viewBox="0 0 360 520" data-ojos="normales" data-cejas="alegres" data-boca="sonrisa"' +
      ' data-pose="saluda" data-cuerpo="flota" data-fx="" role="img" aria-label="Roberto, tu mentor">' +
      "<defs>" + MANOS + "</defs><g class=\"rob-todo\">" +
      /* lápiz */
      '<path d="M144 64 Q180 40 216 64 L216 106 L144 106 Z" fill="var(--rcor)"/>' +
      '<path d="M144 64 Q180 40 216 64 L216 78 Q180 56 144 78 Z" fill="#ff9086"/>' +
      '<rect x="138" y="104" width="84" height="27" rx="8" fill="var(--roro)"/>' +
      '<rect x="138" y="111" width="84" height="3.6" fill="var(--roro2)"/><rect x="138" y="121" width="84" height="3.6" fill="var(--roro2)"/>' +
      '<path d="M142 131 L218 131 L213 394 L147 394 Z" fill="var(--rmad)"/>' +
      '<path d="M197 131 L218 131 L213 394 L194 394 Z" fill="var(--rmad2)" opacity=".5"/>' +
      '<path d="M147 394 L213 394 L180 472 Z" fill="#fae2b4"/><path d="M167 424 L193 424 L180 472 Z" fill="#33302a"/>' +
      /* cejas */
      '<g class="rob-ci"><path d="M130 152 Q150 139 169 149" stroke="var(--rtz)" stroke-width="7.5" fill="none" stroke-linecap="round"/></g>' +
      '<g class="rob-cd"><path d="M191 149 Q210 139 230 152" stroke="var(--rtz)" stroke-width="7.5" fill="none" stroke-linecap="round"/></g>' +
      /* ojos */
      '<g class="rob-oj rob-oj-ab"><g class="rob-globos">' +
        '<ellipse cx="152" cy="190" rx="22" ry="27" fill="#fff" stroke="var(--rtz)" stroke-width="3"/>' +
        '<ellipse cx="208" cy="190" rx="22" ry="27" fill="#fff" stroke="var(--rtz)" stroke-width="3"/>' +
        '<g class="rob-pup"><circle cx="156" cy="194" r="9" fill="#1f1a0c"/><circle cx="212" cy="194" r="9" fill="#1f1a0c"/>' +
        '<circle cx="159.5" cy="190" r="3" fill="#fff"/><circle cx="215.5" cy="190" r="3" fill="#fff"/></g></g></g>' +
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
      '<g class="rob-bo rob-bo-viva"><ellipse class="rob-boca-viva" cx="180" cy="244" rx="17" ry="7" fill="#5e2a1d"/></g>' +
      /* traje de mayordomo */
      '<path d="M140 270 L220 270 L215 376 L145 376 Z" fill="var(--rj)"/>' +
      '<path d="M160 270 L200 270 L192 306 L180 322 L168 306 Z" fill="var(--rcam)"/>' +
      '<path d="M140 270 L166 270 L152 314 L142 306 Z" fill="var(--rj2)"/>' +
      '<path d="M220 270 L194 270 L208 314 L218 306 Z" fill="var(--rj2)"/>' +
      '<path d="M166 270 L180 292 L163 288 Z" fill="#fff"/><path d="M194 270 L180 292 L197 288 Z" fill="#fff"/>' +
      '<path d="M172 286 L188 286 L191 300 L180 306 L169 300 Z" fill="var(--roro)" stroke="var(--rtz)" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M172 286 L180 292 L188 286" fill="none" stroke="var(--roro2)" stroke-width="2"/>' +
      '<path d="M180 306 L193 314 L186 352 L180 360 L174 352 L167 314 Z" fill="var(--roro)" stroke="var(--rtz)" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M172 322 L188 330 M170 336 L186 344" stroke="var(--roro2)" stroke-width="3.4" opacity=".85"/>' +
      '<circle cx="180" cy="368" r="3.4" fill="var(--roro)"/><path d="M198 322 L212 322 L205 311 Z" fill="var(--rcor)"/>' +
      poses + "</g></svg>";
  }

  /* ── LOS 33 ESTADOS (pose ÚNICA cada uno) ── */
  var ROB_EMO = {
    /* guía */
    saluda:   {c:1, chip:"👋🏾 Saluda",       ojos:"normales", cejas:"alegres", boca:"sonrisa",   pose:"saluda",  cuerpo:"flota",  ico:"👋🏾", lbl:"¡Buenos días, Rey!",   frase:"Te saluda apenas abres Apex."},
    presenta: {c:1, chip:"🫡 A tus órdenes",  ojos:"normales", cejas:"altas",   boca:"sonrisa",   pose:"militar", cuerpo:"firme",  ico:"🫡", lbl:"A tus órdenes",         frase:"Su pose de mayordomo: firme y listo."},
    ensena:   {c:1, chip:"📚 Enseñando",      ojos:"normales", cejas:"altas",   boca:"sonrisota", pose:"senala",  cuerpo:"flota",  ico:"📚", lbl:"Mira este nivel",       frase:"Señala el dato del que te habla."},
    analiza:  {c:1, chip:"🤔 Analizando",     ojos:"lado",     cejas:"duda",    boca:"hmm",       pose:"piensa",  cuerpo:"lento",  piensa:1, ico:"🤔", lbl:"Cruzando tus datos…", frase:"Dedo en la barbilla y mirada arriba."},
    audita:   {c:1, chip:"🔍 Auditando",      ojos:"grandes",  cejas:"duda",    boca:"recta",     pose:"lupa",    cuerpo:"lento",  piensa:1, ico:"🔍", lbl:"Revisando al Ejecutor", frase:"Su lupa rebusca sola."},
    idea:     {c:1, chip:"💡 ¡Idea!",         ojos:"brillo",   cejas:"muyaltas",boca:"sonrisota", pose:"indice",  cuerpo:"flota",  fx:"chispa", piensa:1, ico:"💡", lbl:"¡Se me ocurrió algo!", frase:"Lo que pensó de madrugada en su Pensadero."},
    apunta:   {c:1, chip:"✍️ Lo apunto",      ojos:"lado",     cejas:"altas",   boca:"hmm",       pose:"escribe", cuerpo:"lento",  ico:"✍️", lbl:"Lo anoto en tu diario", frase:"Es un lápiz: cuando registra algo, lo escribe de verdad."},
    tiempo:   {c:1, chip:"⏰ Es la hora",     ojos:"grandes",  cejas:"altas",   boca:"o",         pose:"reloj",   cuerpo:"tiembla",ico:"⏰", lbl:"Killzone en 5 min",     frase:"Señalando su reloj cuando se acerca tu ventana."},
    /* mercado */
    tetoca:   {c:1, chip:"👉 TE toca a TI",   ojos:"normales", cejas:"altas",   boca:"sonrisota", pose:"apuntaTi",cuerpo:"firme",  ico:"👉", lbl:"Esto lo haces TÚ", frase:"Te señala a TI, el dedo saliendo de la pantalla: cuando te manda hacer algo, te mira a los ojos y te apunta."},
    aprueba:  {c:2, chip:"👍 GO",             ojos:"felices",  cejas:"alegres", boca:"sonrisota", pose:"pulgar",  cuerpo:"flota",  ico:"👍", lbl:"Vía libre",             frase:"Tu setup pasó todos los filtros."},
    rechaza:  {c:2, chip:"👎 No cuadra",      ojos:"entrecerrados",cejas:"serias",boca:"recta",   pose:"pulgarNo",cuerpo:"firme",  ico:"👎", lbl:"Esa no la tomo",        frase:"El veto en gesto: pulgar abajo y cara de nada."},
    alerta:   {c:2, chip:"🔔 ¡Señal!",        ojos:"grandes",  cejas:"muyaltas",boca:"o",         pose:"alarma",  cuerpo:"tiembla",urgente:1, ico:"🔔", lbl:"¡Señal en GBPUSD!", frase:"Un brazo arriba, el otro al gráfico. Imposible no verlo."},
    frena:    {c:2, chip:"✋ NO ENTRES",      ojos:"grandes",  cejas:"serias",  boca:"recta",     pose:"alto",    cuerpo:"firme",  urgente:1, ico:"✋", lbl:"NO ENTRES",       frase:"Palma enorme al frente. No hay que leer nada más."},
    celebra:  {c:2, chip:"🔥 ¡TP cazado!",    ojos:"felices",  cejas:"muyaltas",boca:"grito",     pose:"arriba",  cuerpo:"brinca", fx:"confeti", ico:"🔥", lbl:"+1.85R ¡CAZADO!", frase:"Brinca con los brazos arriba y te cae confeti."},
    felicita: {c:2, chip:"👏 Bien hecho",     ojos:"felices",  cejas:"alegres", boca:"dientes",   pose:"aplaude", cuerpo:"flota",  ico:"👏", lbl:"¡Bien jugado!",         frase:"Te aplaude cuando respetas tus reglas."},
    preocupa: {c:2, chip:"😬 Cuidado",        ojos:"tristes",  cejas:"tristes", boca:"triste",    pose:"reposo",  cuerpo:"inclina",ico:"😬", lbl:"Esto no me gusta",      frase:"Cejas caídas: algo en tu cuenta le preocupa."},
    serio:    {c:2, chip:"🛡️ Se acabó",      ojos:"entrecerrados",cejas:"serias",boca:"recta",   pose:"jarras",  cuerpo:"firme",  ico:"🛡️", lbl:"Cerramos el día",      frase:"El guardián de riesgo diciendo basta."},
    vigila:   {c:2, chip:"👁️ Vigilando",     ojos:"lado",     cejas:"duda",    boca:"recta",     pose:"visor",   cuerpo:"lento",  piensa:1, ico:"👁️", lbl:"Te cuido la posición", frase:"Mano de visera mientras tienes un trade abierto."},
    shhh:     {c:2, chip:"🤫 Silencio",       ojos:"grandes",  cejas:"altas",   boca:"o",         pose:"shh",     cuerpo:"firme",  ico:"🤫", lbl:"Concéntrate ahora",     frase:"Killzone abierta: dedo en los labios, a operar."},
    espera:   {c:2, chip:"⏳ Paciencia",      ojos:"entrecerrados",cejas:"neutral",boca:"recta",  pose:"cruzados",cuerpo:"lento",  ico:"⏳", lbl:"Todavía no",            frase:"Brazos cruzados: hoy toca esperar, no forzar."},
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
  };

  var CATS = { 1: "Cuando te guía", 2: "Cuando algo pasa en el mercado", 3: "Su carisma y sus bromas", 4: "Descanso" };

  /* ── palabras → gesto (para que reaccione solo a los avisos) ── */
  var PISTAS = [
    [/no entres|no entrar|fren|abst[eé]n/i, "frena"],
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
  var instancias = [], estado = { emo: "saluda", timer: null };
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
    el.innerHTML = svgHTML() +
      '<div class="rob-fx rob-fx-conf"></div>' +
      '<div class="rob-fx rob-fx-zzz"><span class="rob-flota-ico" style="left:64%;top:30%;color:#4fe0c0;font:800 24px system-ui">z</span>' +
        '<span class="rob-flota-ico" style="left:72%;top:22%;color:#4fe0c0;font:800 30px system-ui;animation-delay:1s">Z</span></div>' +
      '<div class="rob-fx rob-fx-chi"><span class="rob-chispa" style="left:70%;top:16%;font-size:20px">✨</span>' +
        '<span class="rob-chispa" style="left:15%;top:24%;font-size:18px;animation-delay:.6s">✨</span></div>' +
      '<div class="rob-fx rob-fx-sud"><span class="rob-sudor" style="left:64%;top:26%;font-size:19px">💧</span></div>' +
      '<div class="rob-fx rob-fx-risa"><span class="rob-flota-ico" style="left:70%;top:24%;font-size:20px">😂</span>' +
        '<span class="rob-flota-ico" style="left:16%;top:28%;font-size:17px;animation-delay:1.1s">🤣</span></div>' +
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
    ponerEn(inst, op.emo || estado.emo || "saluda");
    return inst;
  }
  function ponerEn(inst, k) {
    var e = ROB_EMO[k], s = inst && inst.svg;
    if (!e || !s) return null;
    s.classList.remove("rob-hablando");
    s.dataset.ojos = e.ojos; s.dataset.cejas = e.cejas || "neutral"; s.dataset.boca = e.boca;
    s.dataset.pose = e.pose; s.dataset.fx = e.fx || "";
    s.dataset.cuerpo = ""; void s.offsetWidth; s.dataset.cuerpo = e.cuerpo;   // reinicia la animación
    return e;
  }
  /* Un solo Roberto: el gesto cambia en TODOS sus cuerpos a la vez */
  function poner(k) {
    var e = ROB_EMO[k]; if (!e) return null;
    estado.emo = k;
    vivas().forEach(function (i) { ponerEn(i, k); });
    return e;
  }
  function gestoDe(txt) {
    var t = String(txt || "");
    for (var i = 0; i < PISTAS.length; i++) if (PISTAS[i][0].test(t)) return PISTAS[i][1];
    return "ensena";
  }
  function hablar(texto, op) {
    op = op || {};
    if (!vivas().length) return;
    callar();
    vivas().forEach(function (i) { i.svg.classList.add("rob-hablando"); });
    estado.timer = setInterval(function () {
      var ry = 3 + Math.random() * 12;
      vivas().forEach(function (i) { if (i.boca) i.boca.setAttribute("ry", ry); });
    }, 105);
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
    montar: montar, poner: poner, hablar: hablar, callar: callar, gestoDe: gestoDe,
    emociones: ROB_EMO, cats: CATS, lista: function () { return Object.keys(ROB_EMO); },
    actual: function () { return estado.emo; }, svgHTML: svgHTML, css: ROB_CSS,
  };
})(typeof window !== "undefined" ? window : globalThis);
