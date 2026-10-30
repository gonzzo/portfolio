import { GATES, LEVELS, combinations, evaluate, checkCircuit } from './logic-engine.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const STORAGE_KEY = 'logic-passage-v1';
let completed = [];
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (Array.isArray(saved)) completed = [...new Set(saved.filter((i) => Number.isInteger(i) && i >= 0 && i < LEVELS.length))];
} catch { /* Progress is optional; the game also works without browser storage. */ }
let levelIndex = LEVELS.findIndex((_, i) => !completed.includes(i));
if (levelIndex < 0) levelIndex = 0;
let placements = {};
let inputs = {};
let selected = 'AND';
let busy = false;
let solved = false;
let results = [];
let explorerPosition = 85;

function symbol(name) {
  const kind = name === 'NAND' ? 'AND' : name;
  let shape = '';
  if (kind === 'AND') shape = '<path d="M-27-21H-3A21 21 0 0 1-3 21H-27Z"/><path d="M-42-11H-27M-42 11H-27M19 0H42"/>';
  if (kind === 'OR' || kind === 'XOR') shape = '<path d="M-30-21Q2-23 27 0Q2 23-30 21Q-12 0-30-21Z"/><path d="M-42-11H-24M-42 11H-24M27 0H42"/>' + (kind === 'XOR' ? '<path d="M-37-22Q-18 0-37 22"/>' : '');
  if (kind === 'NOT' || kind === 'BUF') shape = '<path d="M-24-23 18 0-24 23ZM-42 0H-24M25 0H42"/>' + (kind === 'NOT' ? '<circle cx="22" cy="0" r="4"/>' : '<path d="M18 0H25"/>');
  if (name === 'NAND') shape += '<circle cx="24" cy="0" r="4" fill="var(--paper)"/>';
  return `<svg viewBox="-48 -32 96 64" aria-hidden="true"><g class="gate-symbol">${shape}</g></svg>`;
}

function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(completed)); } catch { /* Storage may be unavailable in private browsing. */ }
}
function status(message, type = '') {
  $('status').textContent = message;
  $('status-panel').className = `status-panel ${type}`;
}
function currentLevel() { return LEVELS[levelIndex]; }
function compatible(name, node) { return GATES[name].inputs === node.sources.length; }
function selectGate(name) {
  if (busy) return;
  selected = name;
  document.querySelectorAll('.gate-card').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.gate === name)));
  $('gate-detail').innerHTML = `<div class="gate-detail-title">${symbol(name)}<strong>${name}</strong></div><p class="gate-description">${GATES[name].description}</p><p class="gate-equation">${GATES[name].inputs === 1 ? '1 entrada → 1 salida' : '2 entradas → 1 salida'}</p>`;
  document.querySelectorAll('.mobile-slots button').forEach((button) => {
    const id = button.id.replace('mobile-', '');
    button.setAttribute('aria-label', `Colocar ${name} en ${id}, ${placements[id] || 'vacío'}`);
  });
  const available = currentLevel().nodes.filter((node) => compatible(name, node));
  $('placement-guide').textContent = `${name} → ${available.map((node) => node.id).join(', ')}`;
  document.querySelectorAll('.slot').forEach((button) => {
    const node = currentLevel().nodes.find((node) => node.id === button.dataset.node);
    button.classList.toggle('incompatible', !compatible(name, node));
    button.setAttribute('aria-label', `${node.id}, ${placements[node.id] || 'vacío'}, ${node.sources.length} ${node.sources.length === 1 ? 'entrada' : 'entradas'}. Colocar ${name}`);
  });
}

function renderNavigation() {
  $('level-nav').replaceChildren(...LEVELS.map((level, i) => {
    const button = document.createElement('button');
    button.textContent = String(i + 1).padStart(2, '0');
    button.setAttribute('aria-label', `Cámara ${i + 1}: ${level.title}${completed.includes(i) ? ', resuelta' : ''}`);
    if (i === levelIndex) button.setAttribute('aria-current', 'step');
    if (completed.includes(i)) button.classList.add('solved');
    // Every chamber can be explored; progress never locks the player out.
    button.disabled = busy;
    button.addEventListener('click', () => loadLevel(i));
    return button;
  }));
  $('completed-count').textContent = completed.length;
}

function loadLevel(index) {
  if (busy) return;
  levelIndex = index;
  placements = {};
  inputs = Object.fromEntries(currentLevel().inputs.map((name) => [name, false]));
  results = [];
  solved = false;
  explorerPosition = 85;
  $('scene').classList.remove('crossing');
  document.querySelector('.scene-scroll').scrollLeft = 0;
  $('level-label').textContent = `Cámara ${String(index + 1).padStart(2, '0')} / 08`;
  $('level-title').textContent = currentLevel().title;
  $('objective').textContent = currentLevel().subtitle;
  $('scene-mode').textContent = 'En espera';
  $('hint').hidden = true;
  $('hint-button').setAttribute('aria-expanded', 'false');
  $('next-button').hidden = true;
  $('test-button').innerHTML = 'Probar circuito <span aria-hidden="true">→</span>';
  $('table-badge').textContent = `${2 ** currentLevel().inputs.length} casos`;
  renderNavigation();
  $('gate-palette').innerHTML = currentLevel().choices.map((name) => `<button class="gate-card" data-gate="${name}" aria-pressed="false" aria-label="Elegir ${name}. ${GATES[name].description}">${symbol(name)}<span>${name}</span></button>`).join('');
  $('gate-palette').querySelectorAll('button').forEach((button) => button.addEventListener('click', () => selectGate(button.dataset.gate)));
  $('input-buttons').replaceChildren(...currentLevel().inputs.map((name) => {
    const button = document.createElement('button');
    button.dataset.input = name;
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = `<span>${name}</span><strong>0</strong>`;
    button.setAttribute('aria-label', `Entrada ${name}, apagada`);
    button.addEventListener('click', () => {
      if (busy) return;
      inputs[name] = !inputs[name];
      renderSignals();
    });
    return button;
  }));
  renderSignals();
  selectGate(currentLevel().choices[0]);
  status('Elige una puerta. Después, pulsa un hueco del circuito para colocarla.');
}

function placeGate(nodeId, source) {
  if (busy) return;
  const node = currentLevel().nodes.find((node) => node.id === nodeId);
  if (!compatible(selected, node)) {
    status(`${node.id} tiene ${node.sources.length} ${node.sources.length === 1 ? 'entrada: usa NOT o BUF' : 'entradas: elige una puerta de dos entradas'}.`, 'error');
    return;
  }
  placements[nodeId] = selected;
  results = [];
  solved = false;
  explorerPosition = 85;
  $('scene').classList.remove('crossing');
  $('next-button').hidden = true;
  $('scene-mode').textContent = 'En edición';
  renderSignals();
  selectGate(selected);
  const missing = currentLevel().nodes.filter((node) => !placements[node.id]);
  status(missing.length ? `${selected} colocada en ${nodeId}. Quedan ${missing.length} ${missing.length === 1 ? 'hueco' : 'huecos'} por completar.` : 'Circuito completo. Prueba si cumple todas las combinaciones.');
  const focusTarget = source === 'mobile' ? $(`mobile-${nodeId}`) : $(`slot-${nodeId}`);
  focusTarget?.focus({ preventScroll: true });
}

function wirePath(x1, y1, x2, y2, bend) {
  const mid = bend || (x1 + x2) / 2;
  return `M${x1} ${y1}H${mid}V${y2}H${x2}`;
}
function drawScene(values) {
  const level = currentLevel();
  const inputY = level.inputs.length === 2 ? [180, 300] : [120, 245, 365];
  const points = Object.fromEntries(level.inputs.map((name, i) => [name, { x: 135, y: inputY[i] }]));
  for (const node of level.nodes) points[node.id] = { x: node.x + 50, y: node.y };
  let lines = '';
  for (const node of level.nodes) {
    node.sources.forEach((source, i) => {
      const start = points[source];
      const endY = node.y + (node.sources.length === 1 ? 0 : (i ? 17 : -17));
      // Route C below the lower branch in the final chamber, keeping the wire clear of G2.
      const d = levelIndex === 7 && source === 'C'
        ? `M${start.x} ${start.y}H180V385H480V${endY}H${node.x - 50}`
        : wirePath(start.x, start.y, node.x - 50, endY, start.x + (node.x - 50 - start.x) * (i ? .64 : .42));
      const on = values[source] === true;
      lines += `<path class="wire ${on ? 'on' : ''}" d="${d}"/><path class="wire-flow ${on ? 'on' : ''}" d="${d}"/>`;
    });
  }
  const last = points[level.nodes.at(-1).id];
  const output = values[level.nodes.at(-1).id];
  const outPath = wirePath(last.x, last.y, 910, 245);
  lines += `<path class="wire ${output ? 'on' : ''}" d="${outPath}"/><path class="wire-flow ${output ? 'on' : ''}" d="${outPath}"/>`;
  const terminals = level.inputs.map((name, i) => `<g><text class="signal-label" x="95" y="${inputY[i] - 35}" text-anchor="middle">${name}</text><rect class="terminal ${inputs[name] ? 'on' : ''}" x="62" y="${inputY[i] - 24}" width="73" height="48" rx="3"/><text class="terminal-number ${inputs[name] ? 'on' : ''}" x="98" y="${inputY[i] + 8}" text-anchor="middle">${Number(inputs[name])}</text></g>`).join('');
  const shutters = [...new Set(level.nodes.map((node) => node.x))].map((x) => `<g transform="translate(${x} 420)"><path d="M-15 26V-29H15V26" fill="none" stroke="#67837d" stroke-width="2"/><rect class="shutter" x="-11" y="-26" width="22" height="49" rx="1"/><path d="M-19 27H19" stroke="#a9d7be" stroke-width="2"/></g>`).join('');
  $('circuit').innerHTML = `<defs><pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#53717c" opacity=".22"/></pattern><linearGradient id="floor-shade" x2="0" y2="1"><stop stop-color="#28434a"/><stop offset="1" stop-color="#12232b"/></linearGradient></defs><rect width="1000" height="510" fill="url(#grid)"/><text class="diagram-label" x="62" y="54">INPUT</text><text class="diagram-label" x="462" y="54">LOGIC</text><text class="diagram-label" x="900" y="54">EXIT</text>${lines}${terminals}<g><circle class="output-ring ${output ? 'on' : ''}" cx="934" cy="245" r="34"/><circle class="terminal ${output ? 'on' : ''}" cx="934" cy="245" r="24"/><text class="terminal-number ${output ? 'on' : ''}" x="934" y="253" text-anchor="middle">${output === null ? '–' : Number(output)}</text><text class="diagram-label" x="934" y="303" text-anchor="middle">SALIDA</text></g><path d="M45 448H954L982 473H18Z" fill="url(#floor-shade)" stroke="#34505a"/><path d="M18 473H982V481H18Z" fill="#0a171d"/><path d="M53 448H950" stroke="#71958e" stroke-width="1"/><path d="M85 460H923" stroke="#779b91" stroke-width="1" stroke-dasharray="2 13" opacity=".5"/><g transform="translate(930 410)"><rect x="-17" y="-30" width="34" height="65" rx="16" fill="#7cb8a3" opacity=".06"/><rect class="portal-glow" x="-11" y="-24" width="22" height="52" rx="11" fill="#b4e5cc"/><path d="M-21 35V-21A21 21 0 0 1 21-21V35" stroke="#a9d7be" stroke-width="2" fill="none"/></g>${shutters}<g id="traveler" transform="translate(${explorerPosition} 420)"><ellipse cy="26" rx="15" ry="3" fill="#050f14" opacity=".6"/><g class="traveler-bob"><path d="M-8 17-10 24M8 17 10 24" stroke="#b4d0bd" stroke-width="3"/><rect class="traveler-shell" x="-12" y="-8" width="24" height="27" rx="7"/><rect class="traveler-eye" x="-8" y="-1" width="16" height="8" rx="3"/><circle cx="-3" cy="3" r="1.4" fill="#a9e6c9"/><circle cx="3" cy="3" r="1.4" fill="#a9e6c9"/><path d="M0-8V-15" stroke="#b4d0bd" stroke-width="2"/><circle cy="-16" r="2.4" fill="#b4e5cc"/></g></g><text class="diagram-label" x="62" y="501">PASSAGE / ${String(levelIndex + 1).padStart(2, '0')}</text><text class="diagram-label" x="946" y="501" text-anchor="end">${solved ? 'ACCESS GRANTED' : 'AWAITING SIGNAL'}</text>`;
  $('node-controls').replaceChildren(...level.nodes.map((node) => {
    const name = placements[node.id];
    const button = document.createElement('button');
    button.id = `slot-${node.id}`;
    button.dataset.node = node.id;
    button.className = `slot ${name ? '' : 'empty'} ${values[node.id] === true ? 'is-on' : ''} ${compatible(selected, node) ? '' : 'incompatible'}`;
    button.style.left = `${node.x / 10}%`;
    button.style.top = `${node.y / 5.1}%`;
    button.disabled = busy;
    button.setAttribute('aria-label', `${node.id}, ${name || 'vacío'}, ${node.sources.length} ${node.sources.length === 1 ? 'entrada' : 'entradas'}. Colocar ${selected}`);
    button.innerHTML = `<span class="slot-id">${node.id}</span>${name ? symbol(name) : '<span class="slot-plus" aria-hidden="true">+</span>'}<span class="slot-name">${name || 'Colocar'}</span><span class="slot-arity">${node.sources.join(' · ')}</span>`;
    button.addEventListener('click', () => placeGate(node.id, 'scene'));
    return button;
  }));
  $('mobile-slots').replaceChildren(...level.nodes.map((node) => {
    const button = document.createElement('button');
    button.id = `mobile-${node.id}`;
    button.textContent = `${node.id} · ${placements[node.id] || '+ colocar'}`;
    button.setAttribute('aria-label', `Colocar ${selected} en ${node.id}, ${placements[node.id] || 'vacío'}`);
    button.className = placements[node.id] ? 'filled' : '';
    button.disabled = busy;
    button.addEventListener('click', () => placeGate(node.id, 'mobile'));
    return button;
  }));
}

function renderTable() {
  const level = currentLevel();
  $('truth-table').querySelector('thead').innerHTML = `<tr>${level.inputs.map((name) => `<th scope="col">${name}</th>`).join('')}<th scope="col">Salida</th><th class="target" scope="col">Meta</th></tr>`;
  const rows = combinations(level.inputs);
  $('truth-table').querySelector('tbody').innerHTML = rows.map((input, i) => {
    const active = level.inputs.every((name) => input[name] === inputs[name]);
    const result = results[i];
    const actual = result ? Number(result.output) : active ? evaluate(level, placements, input).output : null;
    return `<tr class="${active ? 'active' : ''} ${result ? result.pass ? 'pass' : 'fail' : ''}" data-row="${i}">${level.inputs.map((name) => `<td>${Number(input[name])}</td>`).join('')}<td class="actual">${actual === null ? '–' : Number(actual)}</td><td class="target">${Number(level.target(input))}</td></tr>`;
  }).join('');
}
function renderSignals() {
  const { values } = evaluate(currentLevel(), placements, inputs);
  drawScene(values);
  renderTable();
  $('input-buttons').querySelectorAll('button').forEach((button) => {
    const name = button.dataset.input;
    button.setAttribute('aria-pressed', String(inputs[name]));
    button.setAttribute('aria-label', `Entrada ${name}, ${inputs[name] ? 'encendida' : 'apagada'}`);
    button.querySelector('strong').textContent = Number(inputs[name]);
    button.disabled = busy;
  });
}
function setBusy(value) {
  busy = value;
  ['test-button', 'reset-button', 'hint-button'].forEach((id) => { $(id).disabled = value; });
  document.querySelectorAll('.gate-card, .slot, .mobile-slots button, .input-buttons button, .level-nav button').forEach((button) => { button.disabled = value; });
  $('workspace')?.setAttribute('aria-busy', String(value));
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function crossPassage() {
  $('scene').classList.add('crossing');
  await wait(reducedMotion.matches ? 0 : 650);
  const duration = reducedMotion.matches ? 0 : 2200;
  if (duration) await new Promise((resolve) => {
    let start;
    function frame(now) {
      start ??= now;
      const t = Math.min((now - start) / duration, 1);
      const eased = t * t * (3 - 2 * t);
      explorerPosition = 85 + 845 * eased;
      $('traveler').setAttribute('transform', `translate(${explorerPosition} 420)`);
      const viewport = document.querySelector('.scene-scroll');
      viewport.scrollLeft = Math.max(0, explorerPosition / 1000 * $('scene').clientWidth - viewport.clientWidth / 2);
      if (t < 1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
  explorerPosition = 930;
  $('traveler').setAttribute('transform', 'translate(930 420)');
  const viewport = document.querySelector('.scene-scroll');
  viewport.scrollLeft = viewport.scrollWidth;
}
async function testCircuit() {
  if (busy) return;
  const level = currentLevel();
  const missing = level.nodes.filter((node) => !placements[node.id]);
  if (missing.length) {
    status(`Falta una puerta en ${missing.map((node) => node.id).join(', ')}. Completa el circuito antes de probar.`, 'error');
    return;
  }
  setBusy(true);
  solved = false;
  results = [];
  explorerPosition = 85;
  $('next-button').hidden = true;
  $('scene').classList.remove('crossing');
  $('test-button').textContent = 'Comprobando…';
  const checks = checkCircuit(level, placements);
  for (let i = 0; i < checks.length; i++) {
    inputs = { ...checks[i].input };
    results[i] = checks[i];
    renderSignals();
    $('scene-mode').textContent = `Caso ${i + 1} / ${checks.length}`;
    status(`Comprobando ${i + 1} de ${checks.length} combinaciones…`);
    await wait(reducedMotion.matches ? 55 : 480);
  }
  const failed = checks.filter((result) => !result.pass);
  if (failed.length) {
    inputs = { ...failed[0].input };
    renderSignals();
    $('scene-mode').textContent = 'Revisa las conexiones';
    const combo = Object.entries(failed[0].input).map(([name, value]) => `${name}=${Number(value)}`).join(', ');
    status(`${checks.length - failed.length}/${checks.length} casos correctos. Con ${combo}, tu salida es ${Number(failed[0].output)} y necesitamos ${Number(failed[0].target)}. Cambia una puerta y vuelve a probar.`, 'error');
  } else {
    solved = true;
    if (!completed.includes(levelIndex)) completed.push(levelIndex);
    saveProgress();
    inputs = { ...checks.find((result) => result.target).input };
    renderSignals();
    $('scene-mode').textContent = 'Paso abierto';
    status('Todas las señales coinciden. Abriendo el paso…', 'success');
    await crossPassage();
    renderNavigation();
    const last = levelIndex === LEVELS.length - 1;
    status(last && completed.length === LEVELS.length ? 'Ocho cámaras, un camino completo. Has resuelto Logic Passage. Puedes volver a cualquier cámara y buscar otras soluciones.' : `${checks.length}/${checks.length} casos correctos. Tu explorador ha llegado al otro lado.`, 'success');
    $('next-button').textContent = last ? completed.length === LEVELS.length ? 'Volver al inicio →' : 'Ir a una pendiente →' : 'Siguiente cámara →';
    $('next-button').hidden = false;
  }
  setBusy(false);
  $('test-button').innerHTML = 'Volver a probar <span aria-hidden="true">→</span>';
}

$('test-button').addEventListener('click', testCircuit);
$('reset-button').addEventListener('click', () => loadLevel(levelIndex));
$('next-button').addEventListener('click', () => {
  let next = levelIndex + 1;
  if (next >= LEVELS.length) next = LEVELS.findIndex((_, i) => !completed.includes(i));
  loadLevel(next < 0 ? 0 : next);
  $('level-title').setAttribute('tabindex', '-1');
  $('level-title').focus({ preventScroll: true });
});
$('hint-button').addEventListener('click', () => {
  const show = $('hint').hidden;
  $('hint').textContent = currentLevel().hint;
  $('hint').hidden = !show;
  $('hint-button').setAttribute('aria-expanded', String(show));
});
const dialog = $('help-dialog');
$('help-open').addEventListener('click', () => dialog.showModal());
$('help-close').addEventListener('click', () => dialog.close());
$('help-start').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
$('y').textContent = new Date().getFullYear();
loadLevel(levelIndex);
