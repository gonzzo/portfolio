# Portfolio

Static portfolio and Logic Passage, a logic-gate puzzle game. No build step or application dependencies.

## Local development

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `index.html` through the server for the portfolio, or `game.html` for the game. The game uses JavaScript modules and needs HTTP serving rather than opening its file directly.

## Logic Passage

Select a gate, then select a circuit slot to place it. Toggle the inputs to explore the circuit. **Probar circuito** checks every truth-table row; all must match the target before the explorer can cross. Eight chambers introduce AND, OR, XOR, NAND and single-input NOT/BUF stages. Multiple valid solutions are accepted.

Progress is saved locally in the browser. The game works without storage, supports keyboard controls, and respects reduced-motion preferences. On small screens, the circuit scrolls horizontally and a second set of slot buttons keeps placement accessible.

Run the logic tests with Node.js 22 or newer:

```sh
node --test tests/logic-engine.test.mjs
```

GitHub Pages serves the repository root from `main`.
