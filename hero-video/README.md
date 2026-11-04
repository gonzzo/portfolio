# Embedded systems hero background

A 12-second, 1600 × 900, 30 fps seamless loop. PCB traces carry data through a
microcontroller, a sensor waveform and a wireless connection. The palette matches
the portfolio. There is no audio, stock footage, or external asset dependency.

From this directory:

```sh
npm ci
npm run dev -- --no-open
```

Open the `EmbeddedSystems` composition in Studio. Edit `src/Composition.tsx` to
adjust the artwork and motion. Every animation completes an integer number of
cycles over the composition's duration to keep the loop seamless.

Regenerate the assets served by the portfolio:

```sh
npm run typecheck
npm run poster
npm run render
```

The MP4 and JPEG are written to `../assets/video/`. Keep both generated assets
with the website. Remotion and React run only during authoring and rendering;
the public site uses a native background video and remains buildless.
