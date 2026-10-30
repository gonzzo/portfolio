import { GATES, createRun, startRun, selectLane, togglePause, advance, difficulty, generateChallenge } from './logic-engine.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const BEST_KEY = 'logic-passage-runner-best-v1';
let savedBest = 0;
try { const value = Number(localStorage.getItem(BEST_KEY)); if (Number.isSafeInteger(value) && value > 0) savedBest = value; } catch { /* Storage is optional. */ }
const state = createRun(savedBest);
state.challenge = generateChallenge(0);
let runStartingBest = savedBest;
let displayedChallenge = null;
let previousStatus = '';
let previousRound = -1;
let previousScore = -1;
let lastTime = 0;
let playerY = .5;
let width = 1100;
let height = 390;
let pixelRatio = 1;
const canvas = $('runner-canvas');
const ctx = canvas.getContext('2d');
const laneButtons = [...document.querySelectorAll('[data-lane]')];

function gateSymbol(name) {
  const or = ['OR', 'XOR', 'NOR', 'XNOR'].includes(name);
  const inverted = ['NAND', 'NOR', 'XNOR'].includes(name);
  const xor = ['XOR', 'XNOR'].includes(name);
  const body = or ? '<path d="M-29-20Q0-22 25 0Q0 22-29 20Q-12 0-29-20Z"/>' : '<path d="M-26-20H-3A20 20 0 0 1-3 20H-26Z"/>';
  return `<svg viewBox="-47 -30 94 60" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${body}<path d="M-42-10H-24M-42 10H-24M${or ? 25 : 17} 0H42"/>${xor ? '<path d="M-36-21Q-19 0-36 21"/>' : ''}${inverted ? '<circle cx="29" cy="0" r="4" fill="var(--symbol-bg, var(--paper))"/>' : ''}</svg>`;
}

function puzzleDiagram(challenge) {
  const { input, mode, fixed, output } = challenge;
  let nodes;
  let positions;
  let edges;
  if (mode === 0) {
    positions = { A:[45,65], B:[45,145], Q:[310,105], Y:[590,105] };
    nodes = [['Q','?']]; edges = [['A','Q',-12],['B','Q',12],['Q','Y',0]];
  } else if (mode === 1) {
    positions = { A:[45,65], B:[45,145], Q:[245,105], N:[430,105], Y:[600,105] };
    nodes = [['Q','?'],['N','NOT']]; edges = [['A','Q',-12],['B','Q',12],['Q','N',0],['N','Y',0]];
  } else if (mode === 2) {
    positions = { A:[45,40], B:[45,100], C:[45,175], F:[230,70], Q:[430,115], Y:[600,115] };
    nodes = [['F',fixed],['Q','?']]; edges = [['A','F',-12],['B','F',12],['F','Q',-12],['C','Q',12],['Q','Y',0]];
  } else if (mode === 3) {
    positions = { A:[35,40], B:[35,100], C:[35,175], Q:[200,70], F:[370,115], N:[490,115], Y:[610,115] };
    nodes = [['Q','?'],['F','XOR'],['N','NOT']]; edges = [['A','Q',-12],['B','Q',12],['Q','F',-12],['C','F',12],['F','N',0],['N','Y',0]];
  } else {
    positions = { A:[35,30], B:[35,80], C:[35,135], D:[35,185], F:[200,55], G:[200,160], Q:[370,105], N:[490,105], Y:[610,105] };
    nodes = [['F','XOR'],['G','OR'],['Q','?'],['N','NOT']]; edges = [['A','F',-12],['B','F',12],['C','G',-12],['D','G',12],['F','Q',-12],['G','Q',12],['Q','N',0],['N','Y',0]];
  }
  const wiring = edges.map(([from,to,offset]) => {
    const [sx,sy] = positions[from]; const [tx,ty] = positions[to];
    const x1 = sx + (from in input ? 35 : 36); const x2 = tx - (to === 'Y' ? 34 : 36);
    const mid = (x1+x2)/2;
    return `<path d="M${x1} ${sy}H${mid}V${ty+offset}H${x2}"/>`;
  }).join('');
  const terminals = challenge.inputNames.map((name) => {
    const [x,y] = positions[name];
    return `<g class="puzzle-terminal ${input[name] ? 'active' : ''}"><rect x="${x-32}" y="${y-17}" width="67" height="34" rx="2"/><text x="${x+1}" y="${y+7}" text-anchor="middle">${name}=${Number(input[name])}</text></g>`;
  }).join('');
  const gates = nodes.map(([id,label]) => {
    const [x,y] = positions[id];
    return `<g class="puzzle-gate ${label === '?' ? 'unknown' : ''}"><rect x="${x-36}" y="${y-26}" width="72" height="52" rx="2"/><text x="${x}" y="${y+(label === '?' ? 11 : 7)}" text-anchor="middle">${label}</text></g>`;
  }).join('');
  const [x,y] = positions.Y;
  const description = `Entradas: ${challenge.inputNames.map((name) => `${name} igual a ${Number(input[name])}`).join(', ')}. Salida Y igual a ${Number(output)}. ${['A y B entran en la puerta desconocida.', 'A y B entran en la puerta desconocida y después en NOT.', `A y B pasan por ${fixed}; su resultado y C entran en la puerta desconocida.`, 'A y B entran en la puerta desconocida. Su resultado y C pasan por XOR y después por NOT.', 'A y B pasan por XOR; C y D pasan por OR. Ambos resultados entran en la puerta desconocida y después en NOT.'][mode]}`;
  $('circuit-puzzle').innerHTML = `<svg viewBox="0 0 660 210" role="img" aria-label="${description}"><g class="puzzle-wires">${wiring}</g>${terminals}${gates}<g class="puzzle-terminal output ${output ? 'active' : ''}"><rect x="${x-34}" y="${y-22}" width="78" height="44" rx="2"/><text x="${x+5}" y="${y+8}" text-anchor="middle">Y=${Number(output)}</text></g></svg>`;
}

function updateChallenge() {
  if (displayedChallenge === state.challenge || !state.challenge) return;
  displayedChallenge = state.challenge;
  $('question-number').textContent = `Acertijo ${String(state.round + 1).padStart(2, '0')}`;
  $('riddle-kind').textContent = state.challenge.label;
  $('riddle-title').textContent = state.challenge.title;
  puzzleDiagram(state.challenge);
  laneButtons.forEach((button, i) => {
    const gate = state.challenge.choices[i];
    button.querySelector('strong').textContent = gate;
    button.querySelector('.gate-icon').innerHTML = gateSymbol(gate);
    button.setAttribute('aria-label', `${['Arriba','Centro','Abajo'][i]}: puerta ${gate}. Tecla ${i+1}`);
  });
}
function saveBest() {
  if (state.best <= savedBest) return;
  savedBest = state.best;
  try { localStorage.setItem(BEST_KEY, String(savedBest)); } catch { /* Keep playing without persistence. */ }
}
function updateUI() {
  updateChallenge();
  const settings = difficulty(state.round);
  if (state.score !== previousScore) {
    $('score').textContent = String(state.score).padStart(5,'0');
    $('best').textContent = String(state.best).padStart(5,'0');
    previousScore = state.score;
    saveBest();
  }
  $('speed').textContent = `${settings.speed.toFixed(2)}×`;
  $('difficulty').textContent = `${String(settings.level).padStart(2,'0')} / 05`;
  $('lives').setAttribute('aria-label', `${state.lives} ${state.lives === 1 ? 'vida' : 'vidas'} de 3`);
  [...$('lives').children].forEach((life,i) => life.classList.toggle('lost', i >= state.lives));
  laneButtons.forEach((button,i) => { button.setAttribute('aria-pressed', String(i === state.lane)); button.disabled = state.status !== 'running'; });
  $('pause-button').disabled = state.status === 'ready' || state.status === 'over';
  $('pause-button').innerHTML = state.status === 'paused' ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 3 10 7-10 7Z"/></svg>' : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4v12M13 4v12"/></svg>';
  $('pause-button').setAttribute('aria-label', state.status === 'paused' ? 'Continuar partida' : 'Pausar partida');
  $('distance').textContent = `${String(Math.floor(state.distance)).padStart(4,'0')} m`;
  if (state.status === 'running') {
    const feedbackPhase = state.phase === 'feedback';
    const seconds = state.phase === 'reading' ? settings.readingTime - state.phaseTime : state.phase === 'approach' ? settings.travelTime - state.phaseTime : 0;
    $('timer-label').textContent = feedbackPhase ? 'Siguiente reto' : state.phase === 'reading' ? 'Puertas en' : 'Elige en';
    $('timer').textContent = feedbackPhase ? '→' : `${Math.max(0,seconds).toFixed(1)}s`;
    document.querySelector('.countdown').classList.toggle('urgent', state.phase === 'approach' && seconds < 1.5);
    $('run-status').textContent = `En marcha · ${state.correct} ${state.correct === 1 ? 'acierto' : 'aciertos'} · Dificultad ${settings.level}/5`;
  }
  if (state.round !== previousRound) {
    previousRound = state.round;
    if (state.outcome) {
      $('feedback').textContent = state.outcome.correct ? `+${state.outcome.points} · ${state.outcome.target} · ¡Sigue así!` : `−1 vida · La puerta era ${state.outcome.target}`;
      $('feedback').classList.toggle('error', !state.outcome.correct);
    }
  }
  if (!state.outcome) $('feedback').textContent = '';
  if (previousStatus !== state.status) {
    previousStatus = state.status;
    const over = state.status === 'over';
    $('overlay').hidden = state.status === 'running';
    $('start-screen').hidden = state.status !== 'ready';
    $('pause-screen').hidden = state.status !== 'paused';
    $('end-screen').hidden = !over;
    if (over) {
      $('final-score').textContent = state.score;
      $('final-summary').textContent = `${state.correct} ${state.correct === 1 ? 'acierto' : 'aciertos'} en ${state.round} puertas · ${Math.floor(state.distance)} m recorridos.`;
      $('record-note').hidden = state.score <= runStartingBest;
      $('run-status').textContent = 'Recorrido terminado · 0 vidas';
      $('timer-label').textContent = 'Fin de partida'; $('timer').textContent = '—';
      $('restart-button').focus({preventScroll:true});
    } else if (state.status === 'paused') {
      $('run-status').textContent = 'En pausa';
      $('resume-button').focus({preventScroll:true});
    }
  }
}

function start() {
  runStartingBest = state.best;
  startRun(state);
  playerY = .5;
  previousRound = -1;
  lastTime = 0;
  updateUI();
  // Keep Space from activating the hidden start/restart button again.
  document.activeElement?.blur();
  document.querySelector('.game').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
}
function choose(lane) { if (selectLane(state,lane)) updateUI(); }
function pause() { togglePause(state); updateUI(); }
$('start-button').addEventListener('click', start);
$('restart-button').addEventListener('click', start);
$('resume-button').addEventListener('click', pause);
$('pause-button').addEventListener('click', pause);
laneButtons.forEach((button) => button.addEventListener('click', () => choose(Number(button.dataset.lane))));
window.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('a,input,textarea,select')) return;
  const key = event.key.toLowerCase();
  if (['arrowup','arrowdown','w','s','1','2','3'].includes(key) && state.status === 'running') {
    event.preventDefault();
    if (['1','2','3'].includes(key)) choose(Number(key)-1);
    else choose(Math.max(0,Math.min(2,state.lane + (['arrowup','w'].includes(key) ? -1 : 1))));
  } else if (key === 'p' || event.code === 'Space') {
    if (event.target.closest('button') && event.code === 'Space') return;
    event.preventDefault();
    if (event.repeat) return;
    if (state.status === 'ready' || state.status === 'over') start(); else pause();
  } else if (key === 'enter' && (state.status === 'ready' || state.status === 'over') && !event.target.closest('button')) { event.preventDefault(); start(); }
});
function pauseForBackground() { if (state.status === 'running') { togglePause(state); updateUI(); } }
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseForBackground(); });
window.addEventListener('blur', pauseForBackground);

function resize() {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  pixelRatio = Math.min(devicePixelRatio || 1,2);
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
}
new ResizeObserver(resize).observe(canvas);
function line(x1,y1,x2,y2,color,lineWidth=1) {
  ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}
function roundedRect(x,y,w,h,r,fill,stroke) {
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
}
function drawGateSymbol(name,x,y,scale,color) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.strokeStyle=color;ctx.lineWidth=1.6;
  const or=['OR','XOR','NOR','XNOR'].includes(name);
  ctx.beginPath();
  if(or){ctx.moveTo(-20,-15);ctx.quadraticCurveTo(4,-17,22,0);ctx.quadraticCurveTo(4,17,-20,15);ctx.quadraticCurveTo(-7,0,-20,-15);}
  else {ctx.moveTo(-19,-15);ctx.lineTo(0,-15);ctx.arc(0,0,15,-Math.PI/2,Math.PI/2);ctx.lineTo(-19,15);ctx.closePath();}
  ctx.stroke();
  line(-31,-7,-18,-7,color,1.6);line(-31,7,-18,7,color,1.6);line(or?22:15,0,33,0,color,1.6);
  if(name==='XOR'||name==='XNOR'){ctx.beginPath();ctx.moveTo(-26,-16);ctx.quadraticCurveTo(-12,0,-26,16);ctx.stroke();}
  if(['NAND','NOR','XNOR'].includes(name)){ctx.beginPath();ctx.arc(26,0,3.5,0,Math.PI*2);ctx.fillStyle='#1c343a';ctx.fill();ctx.stroke();}
  ctx.restore();
}
function drawBackground() {
  ctx.fillStyle='#101e25';ctx.fillRect(0,0,width,height);
  const motion = reducedMotion.matches ? 0 : state.distance;
  const tile=80;
  // Quiet structural layers move at different speeds to give the run depth.
  for(let i=-1;i<Math.ceil(width/130)+1;i++){
    const x=i*130-(motion*.13%130);const h=45+((i+20)%3)*22;
    ctx.fillStyle='#152830';ctx.fillRect(x,41,52,h);
    line(x+8,46,x+8,41+h,'#29414a');
    line(x+17,41+h-8,x+43,41+h-8,'#253c44');
  }
  for(let i=0;i<50;i++){
    const x=((i*193.7-motion*.05)%width+width)%width;
    const y=35+(i*71.3)%(height-60);
    ctx.fillStyle=i%3===0?'#476465':'#2b454f';ctx.fillRect(x,y,1.2,1.2);
  }
  const lanes=[.24,.5,.76];
  lanes.forEach((fraction,i)=>{
    const y=height*fraction;
    if(i===state.lane){ctx.fillStyle='#29463b15';ctx.fillRect(0,y-41,width,83);}
    ctx.fillStyle='#172d34';ctx.beginPath();ctx.moveTo(0,y+26);ctx.lineTo(width,y+26);ctx.lineTo(width,y+37);ctx.lineTo(0,y+37);ctx.fill();
    line(0,y+26,width,y+26,i===state.lane?'#6b9781':'#36515b');
    line(0,y+38,width,y+38,'#0b181e',3);
    for(let x=-(motion%tile);x<width;x+=tile){line(x,y+31,x+22,y+31,'#47645e',1);}
    for(let x=-(motion*.6%210);x<width;x+=210){line(x,y+39,x+12,y+52,'#263e46');line(x+12,y+52,x+120,y+52,'#263e46');}
  });
}
function drawDoors() {
  if(!state.challenge || state.phase==='reading') return;
  const playerX=width*.18;
  const spawnX=width+55;
  const x=spawnX-(spawnX-playerX)*state.gateProgress;
  const gateWidth=Math.max(55,Math.min(88,width*.15));
  const gateHeight=Math.min(87,height*.22);
  state.challenge.choices.forEach((gate,lane)=>{
    const y=height*[.24,.5,.76][lane];
    const resolved=state.phase==='feedback'||state.status==='over';
    const isAnswer=resolved && gate===state.challenge.target;
    const isWrong=resolved && lane===state.outcome?.lane && !state.outcome.correct;
    const color=isAnswer?'#b4e5cc':isWrong?'#e2a07e':'#8eafa5';
    ctx.save();
    if(isAnswer){ctx.shadowColor='#b4e5cc';ctx.shadowBlur=reducedMotion.matches?0:15;}
    // A physical doorway, with a sill and illuminated posts.
    roundedRect(x-gateWidth/2,y-gateHeight/2-8,gateWidth,gateHeight,3,'#1c343a',color);
    line(x-gateWidth/2-5,y+gateHeight/2-8,x+gateWidth/2+5,y+gateHeight/2-8,color,2);
    ctx.shadowBlur=0;
    line(x-gateWidth/2+5,y-gateHeight/2-2,x-gateWidth/2+5,y+gateHeight/2-14,'#4c7569',2);
    drawGateSymbol(gate,x,y-18,width<500?.63:.8,color);
    ctx.textAlign='center';ctx.fillStyle=color;ctx.font=`${width<500?12:14}px 'Courier New',monospace`;ctx.fillText(gate,x,y+14);
    ctx.font="8px 'Courier New',monospace";ctx.fillStyle='#91ada8';ctx.fillText(`0${lane+1}`,x,y-gateHeight/2-17);
    ctx.restore();
  });
}
function drawPlayer(now,dt) {
  const target=[.24,.5,.76][state.lane];
  if(reducedMotion.matches || state.status==='ready') playerY=target;
  else if(state.status==='running') playerY+=(target-playerY)*Math.min(1,dt*18);
  const moving=state.status==='running';
  const bob=reducedMotion.matches||!moving?0:Math.sin(state.elapsed*18)*1.5;
  const x=width*.18,y=height*playerY+bob;
  const hit=state.outcome && !state.outcome.correct && state.phaseTime<.65;
  const shell=hit?'#e2a07e':'#d5e6d5';
  ctx.save();ctx.translate(x,y);
  if(moving&&!reducedMotion.matches){
    for(let i=1;i<6;i++){ctx.globalAlpha=(1-i/6)*.35;roundedRect(-22-i*7,-6,3,3,1,shell);}
  }
  ctx.globalAlpha=1;
  ctx.fillStyle='#050f1488';ctx.beginPath();ctx.ellipse(0,26,15,3,0,0,Math.PI*2);ctx.fill();
  const step=reducedMotion.matches||!moving?0:Math.sin(state.elapsed*22)*4;
  line(-7,14,-10+step,24,'#accab7',3);line(7,14,10-step,24,'#accab7',3);
  roundedRect(-13,-14,26,34,7,shell,'#c6dfc4');
  roundedRect(-9,-5,18,11,4,'#18343a');
  ctx.fillStyle='#b4e5cc';ctx.fillRect(-5,-1,3,3);ctx.fillRect(3,-1,3,3);
  line(0,-14,0,-22,shell,1.7);ctx.fillStyle='#b4e5cc';ctx.beginPath();ctx.arc(0,-23,2.5,0,Math.PI*2);ctx.fill();
  line(-15,-2,-18,8,shell,2);line(15,-2,18,8,shell,2);
  ctx.restore();
}
let lastUI=0;
function frame(now) {
  const dt=lastTime?Math.min((now-lastTime)/1000,.1):0;
  lastTime=now;
  advance(state,dt);
  drawBackground();drawDoors();drawPlayer(now,dt);
  if(now-lastUI>50 || state.status!==previousStatus || state.challenge!==displayedChallenge || state.round!==previousRound){updateUI();lastUI=now;}
  requestAnimationFrame(frame);
}
$('gate-guide').innerHTML=Object.entries(GATES).map(([name,gate])=>`<article class="guide-gate"><h3>${gateSymbol(name)}${name}</h3><p>${gate.rule}</p></article>`).join('');
$('y').textContent=new Date().getFullYear();
$('best').textContent=String(savedBest).padStart(5,'0');
resize();updateUI();requestAnimationFrame(frame);
