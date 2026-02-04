const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const roundEl = document.getElementById('round');
const statusEl = document.getElementById('status');
const actionButton = document.getElementById('action');
const resetButton = document.getElementById('reset');
const yearEl = document.getElementById('y');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const cube = {
  size: 120,
  rotationX: 0.6,
  rotationY: 0.6,
  speed: 0.012,
};

const state = {
  score: 0,
  best: 0,
  round: 1,
  running: true,
};

const vertices = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

const edges = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

const project = ([x, y, z]) => {
  const scale = cube.size;
  const distance = 3.2;
  const perspective = distance / (distance - z);
  return {
    x: canvas.width / 2 + x * scale * perspective,
    y: canvas.height / 2 + y * scale * perspective,
  };
};

const rotate = ([x, y, z]) => {
  const cosY = Math.cos(cube.rotationY);
  const sinY = Math.sin(cube.rotationY);
  const cosX = Math.cos(cube.rotationX);
  const sinX = Math.sin(cube.rotationX);

  let dx = x * cosY - z * sinY;
  let dz = x * sinY + z * cosY;
  let dy = y * cosX - dz * sinX;
  dz = y * sinX + dz * cosX;

  return [dx, dy, dz];
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.9)';
  ctx.lineWidth = 2;

  const points = vertices.map((vertex) => project(rotate(vertex)));

  edges.forEach(([start, end]) => {
    ctx.beginPath();
    ctx.moveTo(points[start].x, points[start].y);
    ctx.lineTo(points[end].x, points[end].y);
    ctx.stroke();
  });

  ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
};

const update = () => {
  if (state.running) {
    cube.rotationY += cube.speed;
    cube.rotationX += cube.speed * 0.7;
  }
  draw();
  requestAnimationFrame(update);
};

const scoreRound = () => {
  const twoPi = Math.PI * 2;
  const angle = ((cube.rotationY % twoPi) + twoPi) % twoPi;
  const distance = Math.min(angle, twoPi - angle);
  const degrees = (distance * 180) / Math.PI;

  let points = 10;
  if (degrees <= 5) {
    points = 100;
  } else if (degrees <= 10) {
    points = 70;
  } else if (degrees <= 18) {
    points = 40;
  }

  state.score += points;
  state.best = Math.max(state.best, state.score);
  state.round += 1;
  cube.speed += 0.004;

  scoreEl.textContent = state.score;
  bestEl.textContent = state.best;
  roundEl.textContent = state.round;

  statusEl.textContent = `Ángulo ${degrees.toFixed(1)}°. +${points} pts`;
};

const capture = () => {
  if (!state.running) {
    return;
  }
  state.running = false;
  scoreRound();
  setTimeout(() => {
    state.running = true;
  }, 400);
};

const resetGame = () => {
  state.score = 0;
  state.round = 1;
  cube.speed = 0.012;
  scoreEl.textContent = '0';
  bestEl.textContent = state.best;
  roundEl.textContent = state.round;
  statusEl.textContent = 'Pulsa “Capturar” cuando el cubo esté alineado.';
};

actionButton.addEventListener('click', capture);
resetButton.addEventListener('click', resetGame);
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    capture();
  }
});

update();
