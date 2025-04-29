const board = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const boardSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = randomPosition();
let direction = { x: 0, y: 0 };
let score = 0;
let gameInterval = null;

function draw() {
  board.innerHTML = '';
  snake.forEach(segment => {
    const snakeElement = document.createElement('div');
    snakeElement.style.gridRowStart = segment.y;
    snakeElement.style.gridColumnStart = segment.x;
    snakeElement.classList.add('snake');
    board.appendChild(snakeElement);
  });

  const foodElement = document.createElement('div');
  foodElement.style.gridRowStart = food.y;
  foodElement.style.gridColumnStart = food.x;
  foodElement.classList.add('food');
  board.appendChild(foodElement);
}

function move() {
  const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (hitWall(newHead) || hitSelf(newHead)) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    scoreElement.textContent = `分數: ${score}`;
    food = randomPosition();
  } else {
    snake.pop();
  }
}

function randomPosition() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * boardSize) + 1,
      y: Math.floor(Math.random() * boardSize) + 1
    };
  } while (snake.some(segment => segment.x === pos.x && segment.y === pos.y));
  return pos;
}

function hitWall(pos) {
  return pos.x < 1 || pos.x > boardSize || pos.y < 1 || pos.y > boardSize;
}

function hitSelf(pos) {
  return snake.some(segment => segment.x === pos.x && segment.y === pos.y);
}

function gameLoop() {
  move();
  draw();
}

document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
});

startBtn.addEventListener('click', () => {
  if (!gameInterval) {
    direction = { x: 1, y: 0 };
    gameInterval = setInterval(gameLoop, 150);
  }
});

restartBtn.addEventListener('click', () => {
  clearInterval(gameInterval);
  snake = [{ x: 10, y: 10 }];
  food = randomPosition();
  direction = { x: 0, y: 0 };
  score = 0;
  scoreElement.textContent = `分數: ${score}`;
  gameInterval = null;
  draw();
});

function endGame() {
  clearInterval(gameInterval);
  alert('遊戲結束！你的分數是：' + score);
  gameInterval = null;
}
