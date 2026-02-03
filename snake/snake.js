(() => {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const statusEl = document.getElementById("status");
  const restartBtn = document.getElementById("restart");
  const pauseBtn = document.getElementById("pause");
  const pad = document.querySelector(".pad");

  const GRID_SIZE = 20;
  const CELL = canvas.width / GRID_SIZE;
  const TICK_MS = 120;

  const DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const KEY_DIR = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    a: "left",
    s: "down",
    d: "right",
    W: "up",
    A: "left",
    S: "down",
    D: "right",
  };

  const createRng = (seed) => {
    let state = seed >>> 0;
    return () => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 2 ** 32;
    };
  };

  const initialState = () => {
    const rng = createRng(Date.now() % 2 ** 32);
    const snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    return {
      snake,
      dir: "right",
      nextDir: "right",
      food: placeFood(snake, rng),
      score: 0,
      alive: true,
      paused: false,
      rng,
    };
  };

  const placeFood = (snake, rng) => {
    const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
    const free = [];
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const key = `${x},${y}`;
        if (!occupied.has(key)) free.push({ x, y });
      }
    }
    if (free.length === 0) return null;
    const idx = Math.floor(rng() * free.length);
    return free[idx];
  };

  const step = (state) => {
    if (!state.alive || state.paused) return state;

    const dir = DIRS[state.nextDir] || DIRS[state.dir];
    const head = state.snake[0];
    const next = { x: head.x + dir.x, y: head.y + dir.y };

    // wall collision
    if (next.x < 0 || next.y < 0 || next.x >= GRID_SIZE || next.y >= GRID_SIZE) {
      return { ...state, alive: false };
    }

    // self collision
    for (let i = 0; i < state.snake.length; i += 1) {
      const segment = state.snake[i];
      if (segment.x === next.x && segment.y === next.y) {
        return { ...state, alive: false };
      }
    }

    const ate = state.food && next.x === state.food.x && next.y === state.food.y;
    const nextSnake = [next, ...state.snake];
    if (!ate) nextSnake.pop();

    const nextScore = ate ? state.score + 1 : state.score;
    const nextFood = ate ? placeFood(nextSnake, state.rng) : state.food;

    return {
      ...state,
      snake: nextSnake,
      dir: state.nextDir,
      food: nextFood,
      score: nextScore,
    };
  };

  const isOpposite = (a, b) => {
    return (a === "up" && b === "down") ||
      (a === "down" && b === "up") ||
      (a === "left" && b === "right") ||
      (a === "right" && b === "left");
  };

  const setDirection = (state, nextDir) => {
    if (!DIRS[nextDir]) return state;
    if (isOpposite(state.dir, nextDir)) return state;
    return { ...state, nextDir };
  };

  const draw = (state) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // grid background
    ctx.fillStyle = "#fbfaf7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // food
    if (state.food) {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--food");
      ctx.fillRect(state.food.x * CELL, state.food.y * CELL, CELL, CELL);
    }

    // snake
    state.snake.forEach((segment, i) => {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
        i === 0 ? "--snake-head" : "--snake"
      );
      ctx.fillRect(segment.x * CELL, segment.y * CELL, CELL, CELL);
    });
  };

  const renderHud = (state) => {
    scoreEl.textContent = state.score;
    if (!state.alive) statusEl.textContent = "Game Over";
    else statusEl.textContent = state.paused ? "Paused" : "Running";
  };

  let game = initialState();
  let loopId = null;

  const tick = () => {
    game = step(game);
    draw(game);
    renderHud(game);
  };

  const startLoop = () => {
    if (loopId) return;
    loopId = setInterval(tick, TICK_MS);
  };

  const stopLoop = () => {
    if (!loopId) return;
    clearInterval(loopId);
    loopId = null;
  };

  const restart = () => {
    game = initialState();
    draw(game);
    renderHud(game);
  };

  const togglePause = () => {
    game = { ...game, paused: !game.paused };
    renderHud(game);
  };

  document.addEventListener("keydown", (event) => {
    const dir = KEY_DIR[event.key];
    if (dir) {
      event.preventDefault();
      game = setDirection(game, dir);
    } else if (event.key === " ") {
      togglePause();
    }
  });

  pad?.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-dir]");
    if (!btn) return;
    game = setDirection(game, btn.dataset.dir);
  });

  restartBtn.addEventListener("click", () => {
    restart();
  });

  pauseBtn.addEventListener("click", () => {
    togglePause();
  });

  restart();
  startLoop();
})();
