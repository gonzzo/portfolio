// The runner's rules and clock are independent of the browser and renderer.
export const GATES = {
  AND: { rule: 'La salida es 1 solo cuando A y B son 1.', run: (a, b) => a && b },
  OR: { rule: 'La salida es 1 cuando al menos una entrada es 1.', run: (a, b) => a || b },
  XOR: { rule: 'La salida es 1 cuando las dos entradas son diferentes.', run: (a, b) => a !== b },
  NAND: { rule: 'La salida es 0 solo cuando A y B son 1.', run: (a, b) => !(a && b) },
  NOR: { rule: 'La salida es 1 solo cuando A y B son 0.', run: (a, b) => !(a || b) },
  XNOR: { rule: 'La salida es 1 cuando las dos entradas son iguales.', run: (a, b) => a === b },
};
const NAMES = Object.keys(GATES);
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function difficulty(round) {
  const level = Math.min(5, 1 + Math.floor(round / 4));
  const travelTime = Math.max(3.2, 6.2 - round * .16);
  return { level, travelTime, readingTime: 1.3 + level * .25, speed: 6.2 / travelTime };
}
export function evaluateGate(name, input, mode = 0, fixed = 'XOR') {
  const gate = GATES[name];
  if (!gate) throw new Error(`Unknown gate: ${name}`);
  const { A, B, C, D } = input;
  if (mode === 1) return !gate.run(A, B);
  if (mode === 2) return Boolean(gate.run(Boolean(GATES[fixed].run(A, B)), C));
  if (mode === 3) return !(Boolean(gate.run(A, B)) !== C);
  if (mode === 4) return !gate.run(A !== B, C || D);
  return Boolean(gate.run(A, B));
}
export function generateChallenge(round, random = Math.random) {
  const { level } = difficulty(round);
  const mode = level - 1;
  const inputNames = mode < 2 ? ['A', 'B'] : mode < 4 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
  const input = Object.fromEntries(inputNames.map((name) => [name, random() >= .5]));
  const target = NAMES[Math.floor(random() * NAMES.length)];
  const fixed = ['AND', 'OR', 'XOR'][Math.floor(random() * 3)];
  const output = evaluateGate(target, input, mode, fixed);
  // All three choices are judged on the SAME visible input values and target.
  // Choose distractors with the opposite output, so there is exactly one answer.
  const distractors = NAMES.filter((name) => evaluateGate(name, input, mode, fixed) !== output);
  const choices = shuffle([target, ...shuffle(distractors, random).slice(0, 2)], random);
  return { target, choices, mode, level, inputNames, input, output, fixed,
    title: '¿Qué puerta completa el circuito?',
    label: `${inputNames.length} entradas · 1 incógnita` };
}
export function createRun(best = 0) {
  return { status: 'ready', phase: 'reading', phaseTime: 0, elapsed: 0, distance: 0,
    lane: 1, lives: 3, score: 0, best, round: 0, correct: 0, streak: 0,
    challenge: null, outcome: null, gateProgress: 0 };
}
export function startRun(state, random = Math.random) {
  Object.assign(state, createRun(state.best));
  state.status = 'running';
  state.challenge = generateChallenge(0, random);
}
export function selectLane(state, lane) {
  if (state.status !== 'running' || !Number.isInteger(lane) || lane < 0 || lane > 2) return false;
  state.lane = lane;
  return true;
}
export function togglePause(state) {
  if (state.status === 'running') state.status = 'paused';
  else if (state.status === 'paused') state.status = 'running';
}
export function advance(state, seconds, random = Math.random) {
  if (state.status !== 'running' || !Number.isFinite(seconds) || seconds <= 0) return;
  // No catch-up collisions after a stalled frame or a suspended browser tab.
  const dt = Math.min(seconds, .1);
  const settings = difficulty(state.round);
  state.elapsed += dt;
  state.distance += dt * 100 * settings.speed;
  state.phaseTime += dt;
  if (state.phase === 'reading') {
    if (state.phaseTime >= settings.readingTime) { state.phase = 'approach'; state.phaseTime = 0; }
  } else if (state.phase === 'approach') {
    state.gateProgress = Math.min(1, state.phaseTime / settings.travelTime);
    if (state.gateProgress >= 1) {
      const chosen = state.challenge.choices[state.lane];
      const correct = chosen === state.challenge.target;
      let points = 0;
      if (correct) {
        state.streak += 1;
        state.correct += 1;
        points = 100 + Math.min(state.streak - 1, 4) * 25;
        state.score += points;
        state.best = Math.max(state.best, state.score);
      } else { state.lives -= 1; state.streak = 0; }
      state.outcome = { correct, points, chosen, target: state.challenge.target, lane: state.lane };
      state.round += 1;
      state.phase = 'feedback';
      state.phaseTime = 0;
      if (state.lives === 0) state.status = 'over';
    }
  } else if (state.phase === 'feedback') {
    state.gateProgress = 1 + state.phaseTime / 1.25 * .4;
    if (state.phaseTime >= 1.25) {
      state.challenge = generateChallenge(state.round, random);
      state.phase = 'reading';
      state.phaseTime = 0;
      state.gateProgress = 0;
      state.outcome = null;
    }
  }
}
