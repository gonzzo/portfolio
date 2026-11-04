# Portfolio

Static portfolio and Logic Passage, a logic-gate puzzle game. No build step or application dependencies for the website.

## Local development

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `index.html` through the server for the portfolio, or `game.html` for the game. The game uses JavaScript modules and needs HTTP serving rather than opening its file directly.

## Languages and identity

Both pages offer Spanish and English through the ES / EN selector. On the first
visit, a Spanish browser language selects Spanish; other browser languages use
English. A manual choice is stored in `portfolio-language` and shared between the
portfolio and game. Language switching also works when browser storage is blocked.
Links between the two pages explicitly carry `?lang=es` or `?lang=en`, so the
selection survives navigation and reloads even without local storage. A supported
URL language takes precedence over the saved choice and browser language. Open
pages also follow selector changes made in another tab through the storage event.

`i18n.js` contains both dictionaries and updates copy, page metadata, image alt
text and accessibility labels. The game refreshes the current puzzle, feedback,
guide and overlays without resetting the run or moving keyboard focus. Gate
names such as AND and XOR keep their standard notation in both languages.

The shared Encastre mark is `assets/images/ensamble-asa.svg`, styled with the
language selector in `identity.css`. Its negative-space cuts subtly suggest
A on the left, S at the top and A on the right; the geometry stays vector-based
and transparent at 32 px on desktop and 28 px on mobile. The downloadable CV remains the existing English PDF
and is labelled accordingly.

## Homepage background

The hero uses a silent, 12-second looping background video authored in Remotion.
It starts automatically, muted and inline behind the content, without playback
controls. Playback pauses when the hero leaves the viewport or the tab is hidden.
The background video plays independently of the system animation preference;
other page animations still respect reduced motion. If the browser blocks
autoplay, normal pointer or keyboard interaction retries playback. The static
poster covers disabled JavaScript, media errors and blocked autoplay.

The website serves the checked-in files from `assets/video/` without React or a
video player library. The editable composition and regeneration commands live in
[`hero-video/`](hero-video/README.md); dependencies there are only needed to edit
or render a new background.

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
