# PUSH TO ESCAPE

A mobile-first 2D side-view arcade survival game. You are trapped as water rises behind you. Push a large connected brick wall sideways to reach the escape platform — but only while the signal is green.

**Play it:** open `index.html` in a browser, or use the GitHub Pages URL (see below).

## How to play

- **🟢 GREEN — PUSH:** touch & hold the big **HOLD TO PUSH** button (or hold **SPACE** / mouse) to push the wall. The character walks and pushes; the wall slides forward; escape progress increases.
- **🟢 BLINKING GREEN — RELEASE!:** warning. Let go immediately. You may still push for a split second, but if you are still holding when blink ends, you lose.
- **🔴 RED — STOP:** do not push. Pressing or continuing to hold during red = instant loss. The wall stays still. Wait for green.
- **Water rises continuously**, even while you wait. If it reaches your chest, you drown. Keep moving, obey the signal, find the rhythm.

Win by pushing the wall all the way to the **ESCAPE** platform. Lose by pushing on red, holding through blink, or letting the water catch you.

Controls: touch hold / mouse hold / SPACE to push. **P** pause, **R** restart, **M** mute. Releasing input on blur/pause is handled automatically — holding across a signal change does **not** bypass the red rule.

## Run locally

No build step, no server required for gameplay (ES modules not used; plain script). Options:

```bash
# Option A: just open the file
open index.html   # macOS / double-click on Windows/Android

# Option B: simple static server (recommended for phone testing on same Wi-Fi)
python3 -m http.server 8000
# then open http://<your-computer-ip>:8000 on your phone
```

## Publish to GitHub Pages

This folder is self-contained (`index.html`, `style.css`, `game.js`). To publish:

1. Push this folder to a GitHub repo (root, or as a subfolder like `push-to-escape/`).
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from branch**, branch `main`, folder `/ (root)` (GitHub Pages does not allow arbitrary subdirectories as the publishing source). The game can still live in the `push-to-escape/` subdirectory.
3. Open the Pages URL on Android Chrome. Add to Home Screen for an app-like icon.

All asset paths are relative, so the game works from a Pages subdirectory (e.g. `https://<user>.github.io/<repo>/push-to-escape/`).

## Tuning (one place)

Open `game.js` → `CONFIG` at the top:

| Key | Default | Meaning |
|---|---|---|
| `GREEN_DURATION` | 2.5s | Solid green window |
| `BLINK_DURATION` | 0.8s | Blinking warning window |
| `RED_DURATION` | 1.2s | Red wait window |
| `WALL_SPEED` | 150 u/s | Wall speed while pushing |
| `ESCAPE_DISTANCE` | 950 u | Distance to escape |
| `WATER_RISE_SPEED` | 4.2 u/s | Initial water rise |
| `WATER_RISE_ACCEL` | 0.08 u/s² | Water speeds up over time |
| `WATER_DANGER_HEIGHT` | 65 u | Water height that catches you |

Balance check: a simulated player who releases immediately at each warning escapes in about 10.3 seconds, with water at roughly 73% of the danger threshold. Waiting too long still causes drowning.

## Tech

- HTML5 Canvas + vanilla JS, `requestAnimationFrame` with delta-time (frame-rate independent).
- Logic (`update`) separated from rendering (`render`); signal machine is a pure function (`nextSignalState`) for testability.
- Original procedural art (Canvas shapes/gradients) and WebAudio-generated SFX — no copyrighted assets, no external dependencies.
- Responsive portrait-first layout; works on Android Chrome, iPhone Safari, desktop Chrome.
- Mute button; game fully playable with sound off/unavailable.

## Tests

```bash
node --check game.js
node tests/test_logic.cjs
```

The logic test verifies config, signal transitions, red/blink loss rules, water-vs-escape balance (perfect play wins, idle loses), and required input/rendering hooks. Browser E2E (real touch on a phone) is manual — use the live preview / Pages URL.

## Project structure

```
push-to-escape/
  index.html
  style.css
  game.js
  tests/test_logic.cjs
  README.md
```

## Version 2 flood presentation

The original gameplay height, drowning threshold and signal timing are unchanged. A world-space, multi-frequency surface, independent reflection bands, bubbles and foam render over the ground up to the moving brick wall's left face. Impact droplets are bounded by the wall and ground. These are lightweight visual approximations, not a full fluid simulation: the displayed water has a small starting depth and its body is limited to the side of the wall facing the character. Danger drives turbulence, wall splashes, audio intensity and character feedback; the actual failure condition remains the original water-height threshold. A short drowning animation precedes the failure screen.

Performance knobs in `CONFIG`: increase `WATER_WAVE_DETAIL` for fewer surface samples, lower `MAX_PARTICLES` to limit particle load, and adjust `WATER_SPLASH_INTERVAL` for impact frequency. Effects are generated locally; no new assets or network calls are required. Audio still requires a browser user gesture and can be muted.

## Visual refresh

The industrial tunnel background is original AI-generated artwork, compressed as a local WebP asset. Canvas provides a solid-color fallback while it loads or if it is unavailable. The HUD, platform, bricks and animated character use locally rendered HTML/CSS/Canvas; gameplay rules and timing are unchanged. The game remains usable without sound and without network access after the files are downloaded together.
