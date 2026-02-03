# Snake by Codex

Classic Snake built with plain HTML, CSS, and JavaScript. No build step, no dependencies.

## Project Structure

- `snake/index.html` - App shell
- `snake/style.css` - Styles
- `snake/snake.js` - Game logic + rendering

## Run Locally

From the repo root:

```sh
python -m http.server 8000
```

Then open:

```
http://localhost:8000/snake/
```

## Controls

- Arrow keys or WASD to move
- Space or **Pause** button to pause
- **Restart** button to restart

## Game Rules

- Eat food to grow and score points
- Avoid walls and your own body
- Game over on collision

## Deploy (Vercel)

1) Push this repo to GitHub.
2) In Vercel: **New Project** → import repo.
3) Set **Framework Preset** to **Other**.
4) Set **Root Directory** to `snake`.
5) Leave **Build Command** empty.
6) Deploy.

