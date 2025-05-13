import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// ✅ Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyABB9wkt9qagFG6SupGeehKkaZVN2z8qEU",
  authDomain: "game-29ba0.firebaseapp.com",
  databaseURL: "https://game-29ba0-default-rtdb.firebaseio.com",
  projectId: "game-29ba0",
  storageBucket: "game-29ba0.firebasestorage.app",
  messagingSenderId: "692827361012",
  appId: "1:692827361012:web:6222c8613410ef6dc198a1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake, apple, dx, dy, score;
let gameInterval, gameStarted = false;
let startTime, endTime;

function initGame() {
  snake = [{ x: 10, y: 10 }];
  apple = { x: 5, y: 5 };
  dx = 1;
  dy = 0;
  score = 0;
}

window.startGame = function () {
  initGame();
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("leaderboardScreen").style.display = "none";
  gameStarted = true;
  startTime = Date.now();
  gameInterval = setInterval(gameLoop, 100);
};

function gameLoop() {
  if (!gameStarted) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (
    head.x < 0 || head.y < 0 ||
    head.x >= tileCount || head.y >= tileCount ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    clearInterval(gameInterval);
    endTime = Date.now();
    const totalTime = Math.floor((endTime - startTime) / 1000);

    document.getElementById("finalScore").textContent = score;
    document.getElementById("totalTime").textContent = totalTime;
    document.getElementById("leaderboardScreen").style.display = "flex";

    fetchLeaderboard();
    gameStarted = false;
    return;
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score++;
    apple = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize - 2, gridSize - 2);
}

document.addEventListener("keydown", e => {
  if (!gameStarted) return;
  switch (e.key) {
    case "ArrowUp": if (dy === 0) { dx = 0; dy = -1; } break;
    case "ArrowDown": if (dy === 0) { dx = 0; dy = 1; } break;
    case "ArrowLeft": if (dx === 0) { dx = -1; dy = 0; } break;
    case "ArrowRight": if (dx === 0) { dx = 1; dy = 0; } break;
  }
});

window.submitScore = function () {
  const name = document.getElementById("playerName").value.trim();
  if (!name) {
    alert("請輸入名字！");
    return;
  }

  const totalSeconds = Math.floor((endTime - startTime) / 1000);

  const scoreData = {
    name,
    score,
    time: totalSeconds,
    timestamp: new Date().toISOString()
  };

  const scoresRef = ref(db, "scores");
  push(scoresRef, scoreData).then(() => {
    fetchLeaderboard();
  });
};

function fetchLeaderboard() {
  const scoresRef = ref(db, "scores");
  onValue(scoresRef, snapshot => {
    const table = document.querySelector("#leaderboard tbody");
    table.innerHTML = "";
    const scores = [];

    snapshot.forEach(childSnapshot => {
      scores.push(childSnapshot.val());
    });

    scores.sort((a, b) => b.score - a.score);

    scores.slice(0, 10).forEach(s => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${s.name}</td><td>${s.score}</td><td>${s.time}</td><td>${new Date(s.timestamp).toLocaleString()}</td>`;
      table.appendChild(row);
    });
  });
}

window.restartGame = function () {
  startGame();
};
