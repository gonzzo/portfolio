(() => {
  'use strict';

  const messages = {
    en: {
      'common.language': 'Language',
      'home.title': 'Gonzalo Combarros — Firmware & Embedded Systems',
      'home.description': 'Firmware and embedded systems engineer. Architecture, connected products, and the work that takes hardware from prototype to production.',
      'home.ogDescription': 'Architecture, connected products, and firmware built for the real world.',
      'home.skip': 'Skip to content',
      'home.topLabel': 'Gonzalo Combarros, back to top',
      'home.navigation': 'Main navigation',
      'home.work': 'Work',
      'home.about': 'About',
      'home.contact': 'Contact',
      'home.cvLabel': 'CV in English, PDF, opens in a new tab',
      'home.headline': 'Engineering the<br />things you<br /><span class="last-line">don’t see<span class="accent">.</span></span>',
      'home.workTitle': '01 / Selected work',
      'home.practice': 'Areas of practice',
      'home.projectOneNumber': '01.1 / Connected systems',
      'home.projectOneTitle': 'Connected<br />products.',
      'home.projectOneDiscipline': 'Firmware architecture & lifecycle',
      'home.projectOneDescription': 'The work between a prototype and a product people use. Modular firmware, device connectivity, and OTA lifecycles designed with long-term maintenance in mind.',
      'home.projectOneAlt': 'Concept illustration of a connected device with sensors, a microcontroller and network connections',
      'home.projectTwoNumber': '01.2 / Production engineering',
      'home.projectTwoTitle': 'From the bench<br />to the field.',
      'home.projectTwoDiscipline': 'Validation & production support',
      'home.projectTwoDescription': 'Testing, debugging, and understanding how hardware behaves outside the lab. From algorithm integration and data logging to manufacturing support and field issue analysis.',
      'home.projectTwoAlt': 'Concept illustration of an embedded circuit board connected to test probes and a signal waveform',
      'home.aboutTitle': '02 / About',
      'home.statement': 'Good firmware starts with understanding the whole system.',
      'home.aboutOne': 'My background spans embedded software, electronics, and production engineering. I work in C and C++, bringing system-level thinking to the details of device behaviour.',
      'home.aboutTwo': 'I stay close to implementation: defining architectures, integrating algorithms, and working through validation and field issues with the teams building the product.',
      'home.experienceTitle': '03 / Experience',
      'home.present': '2021 — Present',
      'home.roleOne': 'Senior Firmware / Embedded Systems Engineer',
      'home.experienceOne': 'Production firmware, connected devices, and lifecycle ownership.',
      'home.spain': 'Spain',
      'home.roleTwo': 'Embedded / Electronic Engineer',
      'home.experienceTwo': 'Production engineering, electronic validation, and hardware troubleshooting.',
      'home.roleThree': 'R&D Embedded / Electronic Engineer',
      'home.experienceThree': 'Embedded systems and electronics for industrial R&D.',
      'home.contactTitle': '04 / Get in touch',
      'home.talk': 'let’s talk',
      'home.contactCopy': 'Have a product in mind, or a technical challenge to work through?',
      'game.title': 'Logic Passage — Run. Think. Choose.',
      'game.description': 'A three-lane logic runner. Solve the circuit, choose a gate and keep moving. Three lives. Ever faster.',
      'game.playground': '/ Playground',
      'game.back': 'Back to portfolio',
      'game.eyebrow': 'A runner for quick thinkers',
      'game.intro': 'Three paths. One answer.<br />Keep moving.',
      'game.noScript': 'Enable JavaScript to play.',
      'game.arenaLabel': 'Logic Passage, a three-lane logic game',
      'game.score': 'Score',
      'game.best': 'Best',
      'game.speed': 'Speed',
      'game.difficulty': 'Difficulty',
      'game.lives': 'Lives',
      'game.livesOne': '{count} life out of 3',
      'game.livesMany': '{count} lives out of 3',
      'game.pauseAction': 'Pause game',
      'game.resumeAction': 'Resume game',
      'game.question': 'Puzzle {number}',
      'game.kind': '{count} inputs · 1 unknown',
      'game.puzzleTitle': 'Which gate completes the circuit?',
      'game.puzzleNote': 'Fixed inputs and output. Choose the gate that replaces “?”.',
      'game.timerReady': 'Ready to start',
      'game.canvasLabel': 'Explorer moving along three lanes towards logic gates. Use the controls below the scene.',
      'game.lab': 'LP / ENDLESS LAB',
      'game.startEyebrow': 'A run of decisions',
      'game.startTitle': 'Run.<br /> Think. Choose<span>.</span>',
      'game.startCopy': 'The scene keeps moving. Read the circuit above and change lanes to pass through the correct gate.',
      'game.moveRule': 'Change lanes',
      'game.chooseRule': 'Choose directly',
      'game.threeLives': '3 lives',
      'game.lifeRule': 'One mistake, one less',
      'game.start': 'Start running',
      'game.touchNote': 'You can also tap the three controls below.',
      'game.pauseEyebrow': 'A moment to breathe',
      'game.pauseTitle': 'Paused<span>.</span>',
      'game.pauseCopy': 'The clock and the gates will wait.',
      'game.resume': 'Keep running →',
      'game.resumeNote': 'P or Space to continue.',
      'game.endEyebrow': 'End of the road',
      'game.endTitle': 'That’s a run<span>.</span>',
      'game.yourScore': 'Your score',
      'game.record': 'A new personal best.',
      'game.restart': 'Play again',
      'game.laneGroup': 'Choose your lane',
      'game.top': 'Top',
      'game.middle': 'Middle',
      'game.bottom': 'Bottom',
      'game.laneLabel': '{lane}: {gate} gate. Key {key}',
      'game.ready': 'Ready to run',
      'game.shortcuts': 'P to pause',
      'game.guideEyebrow': 'Pocket guide',
      'game.guideTitle': 'Every gate,<br /> a decision.',
      'game.guideCopy': 'A correct answer earns 100 points. Build a streak to earn up to 200 per gate. A mistake costs one life; the run ends when you lose all three. Preplaced NOT gates invert 0 and 1.',
      'game.footer': 'Made of logic. Driven by curiosity.',
      'game.gate.AND': 'The output is 1 only when A and B are both 1.',
      'game.gate.OR': 'The output is 1 when at least one input is 1.',
      'game.gate.XOR': 'The output is 1 when the two inputs are different.',
      'game.gate.NAND': 'The output is 0 only when A and B are both 1.',
      'game.gate.NOR': 'The output is 1 only when A and B are both 0.',
      'game.gate.XNOR': 'The output is 1 when the two inputs are equal.',
      'game.inputValue': '{name} equals {value}',
      'game.diagram': 'Inputs: {inputs}. Output Y equals {output}. {circuit}',
      'game.diagram.0': 'A and B enter the unknown gate.',
      'game.diagram.1': 'A and B enter the unknown gate, then NOT.',
      'game.diagram.2': 'A and B pass through {gate}; that result and C enter the unknown gate.',
      'game.diagram.3': 'A and B enter the unknown gate. That result and C pass through XOR, then NOT.',
      'game.diagram.4': 'A and B pass through XOR; C and D pass through OR. Both results enter the unknown gate, then NOT.',
      'game.next': 'Next challenge',
      'game.gatesIn': 'Gates in',
      'game.chooseIn': 'Choose in',
      'game.correctOne': 'correct answer',
      'game.correctMany': 'correct answers',
      'game.running': 'Running · {correct} {answers} · Difficulty {level}/5',
      'game.feedbackCorrect': '+{points} · {gate} · Keep it up!',
      'game.feedbackWrong': '−1 life · The gate was {gate}',
      'game.summary': '{correct} {answers} across {round} gates · {distance} m travelled.',
      'game.finished': 'Run finished · 0 lives',
      'game.gameOver': 'Game over',
      'game.paused': 'Paused',
    },
    es: {
      'common.language': 'Idioma',
      'home.title': 'Gonzalo Combarros — Firmware y sistemas embebidos',
      'home.description': 'Ingeniero de firmware y sistemas embebidos. Arquitectura, productos conectados y el trabajo que lleva el hardware del prototipo a la producción.',
      'home.ogDescription': 'Arquitectura, productos conectados y firmware para el mundo real.',
      'home.skip': 'Saltar al contenido',
      'home.topLabel': 'Gonzalo Combarros, volver al inicio',
      'home.navigation': 'Navegación principal',
      'home.work': 'Proyectos',
      'home.about': 'Sobre mí',
      'home.contact': 'Contacto',
      'home.cvLabel': 'CV en inglés, PDF, se abre en una pestaña nueva',
      'home.headline': 'Ingeniería<br />para lo que<br /><span class="last-line">no ves<span class="accent">.</span></span>',
      'home.workTitle': '01 / Proyectos seleccionados',
      'home.practice': 'Áreas de trabajo',
      'home.projectOneNumber': '01.1 / Sistemas conectados',
      'home.projectOneTitle': 'Productos<br />conectados.',
      'home.projectOneDiscipline': 'Arquitectura y ciclo de vida del firmware',
      'home.projectOneDescription': 'El trabajo que convierte un prototipo en un producto que la gente utiliza. Firmware modular, conectividad y actualizaciones OTA pensadas para el mantenimiento a largo plazo.',
      'home.projectOneAlt': 'Ilustración conceptual de un dispositivo conectado con sensores, un microcontrolador y conexiones de red',
      'home.projectTwoNumber': '01.2 / Ingeniería de producción',
      'home.projectTwoTitle': 'Del laboratorio<br />al mundo real.',
      'home.projectTwoDiscipline': 'Validación y soporte a producción',
      'home.projectTwoDescription': 'Probar, depurar y entender cómo se comporta el hardware fuera del laboratorio. Desde la integración de algoritmos y el registro de datos hasta el soporte a fabricación y el análisis de incidencias en campo.',
      'home.projectTwoAlt': 'Ilustración conceptual de una placa de circuito embebido conectada a sondas de prueba y una forma de onda',
      'home.aboutTitle': '02 / Sobre mí',
      'home.statement': 'Un buen firmware empieza por entender todo el sistema.',
      'home.aboutOne': 'Mi experiencia abarca software embebido, electrónica e ingeniería de producción. Trabajo en C y C++, aplicando una visión de conjunto a los detalles del comportamiento de cada dispositivo.',
      'home.aboutTwo': 'Trabajo cerca de la implementación: defino arquitecturas, integro algoritmos y resuelvo cuestiones de validación e incidencias en campo junto a los equipos que desarrollan el producto.',
      'home.experienceTitle': '03 / Experiencia',
      'home.present': '2021 — Actualidad',
      'home.roleOne': 'Ingeniero sénior de firmware y sistemas embebidos',
      'home.experienceOne': 'Firmware de producción, dispositivos conectados y gestión de todo su ciclo de vida.',
      'home.spain': 'España',
      'home.roleTwo': 'Ingeniero de sistemas embebidos y electrónica',
      'home.experienceTwo': 'Ingeniería de producción, validación electrónica y diagnóstico de hardware.',
      'home.roleThree': 'Ingeniero de I+D en sistemas embebidos y electrónica',
      'home.experienceThree': 'Sistemas embebidos y electrónica para I+D industrial.',
      'home.contactTitle': '04 / Contacto',
      'home.talk': 'hablemos',
      'home.contactCopy': '¿Tienes un producto en mente o un reto técnico que resolver?',
      'game.title': 'Logic Passage — Corre. Piensa. Elige.',
      'game.description': 'Un runner de lógica de tres carriles. Resuelve el circuito, elige una puerta y sigue avanzando. Tres vidas. Cada vez más rápido.',
      'game.playground': '/ Zona de juego',
      'game.back': 'Volver al portfolio',
      'game.eyebrow': 'Un runner para pensar deprisa',
      'game.intro': 'Tres caminos. Una respuesta.<br />No dejes de avanzar.',
      'game.noScript': 'Activa JavaScript para jugar.',
      'game.arenaLabel': 'Logic Passage, juego de lógica de tres carriles',
      'game.score': 'Puntuación',
      'game.best': 'Récord',
      'game.speed': 'Velocidad',
      'game.difficulty': 'Dificultad',
      'game.lives': 'Vidas',
      'game.livesOne': '{count} vida de 3',
      'game.livesMany': '{count} vidas de 3',
      'game.pauseAction': 'Pausar partida',
      'game.resumeAction': 'Continuar partida',
      'game.question': 'Acertijo {number}',
      'game.kind': '{count} entradas · 1 incógnita',
      'game.puzzleTitle': '¿Qué puerta completa el circuito?',
      'game.puzzleNote': 'Entradas y salida fijas. Elige la puerta que sustituye a «?».',
      'game.timerReady': 'Listo para empezar',
      'game.canvasLabel': 'Explorador avanzando por tres carriles hacia las puertas lógicas. Usa los controles debajo del escenario.',
      'game.lab': 'LP / LABORATORIO SIN FIN',
      'game.startEyebrow': 'Una carrera de decisiones',
      'game.startTitle': 'Corre.<br /> Piensa. Elige<span>.</span>',
      'game.startCopy': 'El escenario no se detiene. Lee el circuito de arriba y cambia de carril para cruzar la puerta correcta.',
      'game.moveRule': 'Cambiar de carril',
      'game.chooseRule': 'Elegir directamente',
      'game.threeLives': '3 vidas',
      'game.lifeRule': 'Un fallo, una menos',
      'game.start': 'Empezar a correr',
      'game.touchNote': 'También puedes tocar los tres controles de abajo.',
      'game.pauseEyebrow': 'Un momento para respirar',
      'game.pauseTitle': 'En pausa<span>.</span>',
      'game.pauseCopy': 'El reloj y las puertas te esperan.',
      'game.resume': 'Seguir corriendo →',
      'game.resumeNote': 'P o espacio para continuar.',
      'game.endEyebrow': 'Fin del recorrido',
      'game.endTitle': 'Hasta aquí<span>.</span>',
      'game.yourScore': 'Tu puntuación',
      'game.record': 'Un nuevo récord personal.',
      'game.restart': 'Volver a jugar',
      'game.laneGroup': 'Elige tu carril',
      'game.top': 'Arriba',
      'game.middle': 'Centro',
      'game.bottom': 'Abajo',
      'game.laneLabel': '{lane}: puerta {gate}. Tecla {key}',
      'game.ready': 'Preparado para correr',
      'game.shortcuts': 'P para pausar',
      'game.guideEyebrow': 'Manual de bolsillo',
      'game.guideTitle': 'Cada puerta,<br /> una decisión.',
      'game.guideCopy': 'Acierta para sumar 100 puntos. Encadena aciertos para ganar hasta 200 por puerta. Un error cuesta una vida; el recorrido termina al perder las tres. Las puertas NOT ya colocadas invierten 0 y 1.',
      'game.footer': 'Hecho de lógica. Movido por curiosidad.',
      'game.gate.AND': 'La salida es 1 solo cuando A y B son 1.',
      'game.gate.OR': 'La salida es 1 cuando al menos una entrada es 1.',
      'game.gate.XOR': 'La salida es 1 cuando las dos entradas son diferentes.',
      'game.gate.NAND': 'La salida es 0 solo cuando A y B son 1.',
      'game.gate.NOR': 'La salida es 1 solo cuando A y B son 0.',
      'game.gate.XNOR': 'La salida es 1 cuando las dos entradas son iguales.',
      'game.inputValue': '{name} igual a {value}',
      'game.diagram': 'Entradas: {inputs}. Salida Y igual a {output}. {circuit}',
      'game.diagram.0': 'A y B entran en la puerta desconocida.',
      'game.diagram.1': 'A y B entran en la puerta desconocida y después en NOT.',
      'game.diagram.2': 'A y B pasan por {gate}; su resultado y C entran en la puerta desconocida.',
      'game.diagram.3': 'A y B entran en la puerta desconocida. Su resultado y C pasan por XOR y después por NOT.',
      'game.diagram.4': 'A y B pasan por XOR; C y D pasan por OR. Ambos resultados entran en la puerta desconocida y después en NOT.',
      'game.next': 'Siguiente reto',
      'game.gatesIn': 'Puertas en',
      'game.chooseIn': 'Elige en',
      'game.correctOne': 'acierto',
      'game.correctMany': 'aciertos',
      'game.running': 'En marcha · {correct} {answers} · Dificultad {level}/5',
      'game.feedbackCorrect': '+{points} · {gate} · ¡Sigue así!',
      'game.feedbackWrong': '−1 vida · La puerta era {gate}',
      'game.summary': '{correct} {answers} en {round} puertas · {distance} m recorridos.',
      'game.finished': 'Recorrido terminado · 0 vidas',
      'game.gameOver': 'Fin de partida',
      'game.paused': 'En pausa',
    },
  };

  const storageKey = 'portfolio-language';
  const supported = (value) => value === 'es' || value === 'en';
  let savedLanguage;
  try { savedLanguage = localStorage.getItem(storageKey); } catch { /* Storage is optional. */ }
  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
  const browserLanguage = navigator.languages?.[0] || navigator.language || 'en';
  let language = supported(requestedLanguage) ? requestedLanguage : supported(savedLanguage) ? savedLanguage : /^es(?:-|$)/i.test(browserLanguage) ? 'es' : 'en';
  if (supported(requestedLanguage)) {
    try { localStorage.setItem(storageKey, language); } catch { /* The URL also carries the choice. */ }
  }
  document.documentElement.lang = language;

  function t(key, values = {}) {
    const message = messages[language][key] ?? messages.en[key] ?? key;
    return message.replace(/\{(\w+)\}/g, (placeholder, name) => String(values[name] ?? placeholder));
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    // Rich markup comes only from the authored dictionary, never user input.
    document.querySelectorAll('[data-i18n-html]').forEach((element) => {
      element.innerHTML = t(element.dataset.i18nHtml);
    });
    for (const attribute of ['aria-label', 'alt', 'content']) {
      document.querySelectorAll(`[data-i18n-${attribute}]`).forEach((element) => {
        element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`)));
      });
    }
    document.querySelectorAll('[data-set-lang]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.setLang === language));
    });
    document.querySelectorAll('.language-switch').forEach((selector) => { selector.hidden = false; });
    document.querySelectorAll('[data-language-link]').forEach((link) => {
      const target = new URL(link.getAttribute('href'), window.location.href);
      target.searchParams.set('lang', language);
      link.setAttribute('href', `${target.pathname}${target.search}${target.hash}`);
    });
    window.dispatchEvent(new CustomEvent('site:languagechange', { detail: { language } }));
  }

  function setLanguage(value, { persist = true } = {}) {
    if (!supported(value)) return;
    language = value;
    if (persist) {
      try { localStorage.setItem(storageKey, language); } catch { /* Keep switching without persistence. */ }
    }
    // Keep the explicit URL choice consistent on reload, including without storage.
    const currentURL = new URL(window.location.href);
    currentURL.searchParams.set('lang', language);
    try { window.history.replaceState(window.history.state, '', currentURL); } catch { /* Updating the page still works. */ }
    applyLanguage();
  }

  window.siteI18n = { t, setLanguage, getLanguage: () => language };
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey && supported(event.newValue) && event.newValue !== language) {
      setLanguage(event.newValue, { persist: false });
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-set-lang]').forEach((button) => {
      button.addEventListener('click', () => setLanguage(button.dataset.setLang));
    });
    applyLanguage();
  });
})();
