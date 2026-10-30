# Portfolio

Static portfolio and Logic Passage, a logic-gate puzzle game. No build step or application dependencies.

## Local development

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `index.html` through the server for the portfolio, or `game.html` for the game. The game uses JavaScript modules and needs HTTP serving rather than opening its file directly.

## Logic Passage

An endless three-lane logic runner. The explorer moves continuously while three gate choices approach. Read the circuit above the scene, then choose the lane whose gate replaces the single `?` and produces the displayed output from the numbered inputs.

- **↑ / ↓** or **W / S**: move one lane. **1 / 2 / 3**: choose top, middle, or bottom directly.
- Touch or click the three lane buttons on mobile or desktop.
- **P**: pause/resume. Leaving the browser also pauses the run.
- A correct answer earns 100 points, with streak bonuses up to 200 per gate. A mistake removes one life. Losing all three lives ends the run and shows the score and replay button.
- Speed increases as doors are passed. Five difficulty stages add preplaced gates and increase from two to four numbered inputs. Every generated circuit has exactly one valid answer among its three choices.

The record is stored locally; the game also works when storage is unavailable. Reduced-motion mode removes decorative scrolling and bobbing while preserving the approaching doors needed for play. There is no backend or account requirement.

Run the logic tests with Node.js 22 or newer:

```sh
node --test tests/logic-engine.test.mjs
```

GitHub Pages serves the repository root from `main`.
