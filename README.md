# The Liar's Game — Level 1: The Night Nanny

A cinematic, mobile-first visual novel web game set in Lagos. Static site (HTML/CSS/JS), no framework, no build step, no backend.

## Play / Deploy

### Run locally
```bash
# from the repo root
python3 -m http.server 8080
# open http://localhost:8080
```

### Deploy to GitHub Pages
1. Push this repo to GitHub.
2. In **Settings → Pages**, set **Source** to "Deploy from a branch".
3. Select branch: `main`, folder: `/ (root)`.
4. Save. GitHub Pages will publish at `https://<username>.github.io/<repo>/`.

The game is fully static and works from the repo root. A `.nojekyll` file is included.

## Project Structure

```
.
├── index.html          # Game shell / screens
├── style.css           # Cinematic mobile-first styling, Ken Burns, FX
├── game.js             # Game engine (data-driven scene runner)
├── story.js            # ALL story content & scene data (Level 1)
├── assets/
│   ├── images/         # WebP scene images (max 1080px wide, <150KB target)
│   └── audio/          # SFX placeholders (.wav)
├── IMAGE_PROMPTS.md    # Prompt for every image filename (regenerate/replace)
├── README.md
└── .nojekyll
```

## How to Add Level 2 (or any new level)

The engine is data-driven. **Adding a level should only require new data, not new engine code.**

1. **Add story data** in `story.js`:
   - Create a new level object under `LEVELS`, e.g. `LEVELS.level2 = { id: 'level2', title: '...', subtitle: '...', startScene: '...', scenes: { ... } }`.
   - Follow the existing scene schema:
     - `title`, `dialogue`, `narration`, `rules_card`, `decision`, `failure_sequence`, `ending`, `game_over`, `win`.
   - Dialogue lines use `{ type: 'speech'|'narration', speaker, side, text, image, pov?, sfx? }`.
   - Decisions use `{ type:'decision', id, prompt, image, timerSeconds, choices:[{text, correct, failTag}], nextCorrect, nextWrong }`.
   - Failure sequences include `failTagScenes` with a variant for each failTag and `timeout`, each with 2-3 short scenes.

2. **Add images** to `assets/images/` (WebP, max 1080px wide, ideally <150KB). List prompts in `IMAGE_PROMPTS.md`.

3. **Add audio** (optional) to `assets/audio/` and map names in `game.js` `AUDIO_MAP`.

4. **Wire level selection** (when ready): update `game.js` to pick which level to load (currently hardcoded to `LEVEL_ID = 'level1'`). A simple level-select screen can set `LEVEL_ID`/load the level object.

5. **Test** the full path: intro, all decisions (correct/incorrect/timeout), failure flow, and win.

## Where to Replace Placeholder Audio and Images

### Images
- Files live in `assets/images/*.webp`.
- See `IMAGE_PROMPTS.md` for every filename, its scene purpose, and the exact generation prompt.
- Images marked **Placeholder** in that file are the ones to replace first.
- Keep format WebP, max 1080px wide, ideally under 150 KB. Use the same cinematic style and character consistency notes.

### Audio
- Files live in `assets/audio/`:
  - `knock.wav` — door knock
  - `ring.wav` — phone ring
  - `baby_cry.wav` — baby cry
  - `heartbeat.wav` — heartbeat (timer low / tension)
  - `lights_out.wav` — lights-out thud
  - `call_end.wav` — call end beep
  - `car_drive.wav` — car leaving
- Replace with short royalty-free production SFX (keep names, or update `AUDIO_MAP` in `game.js`).
- In `story.js`, scenes/lines reference SFX by name via `sfx: "door_knock"` etc.
- In `game.js`, see `AUDIO_MAP` and the `// FINAL AUDIO:` comment.

## Where to Connect a Real Ad SDK Later

- **File:** `game.js`
- **Function:** `watchAdToContinue()`
- Look for the comment block: `AD SDK INTEGRATION POINT`.
- Current behavior: stub that shows a placeholder message, waits 1.5s, then calls `resumeFromCheckpoint()`.
- To integrate a rewarded ad:
  1. Include your ad SDK script (or load it dynamically).
  2. Replace the stub body with your SDK's rewarded-ad call.
  3. On reward/ad completion, call `resumeFromCheckpoint()`.
  4. On ad failure/cancel, re-enable the button and show an appropriate message.

The "Watch ad to continue from here" button is on the Game Over screen (`index.html`, `#btn-ad`).

## Game Notes

- **Voice:** browser Web Speech API (`speechSynthesis`) speaks narration/dialogue. Quality varies by device/browser. Mute button silences both SFX and voice. For higher-quality pre-rendered voice clips, replace with generated audio and wire into `game.js`.
- **Save/progress:** stored in `localStorage` (`liars_game_save_v1`). Settings (mute) stored separately.
- **Checkpoint retry:** on failure, "Retry from last checkpoint" resumes from the last safe setup before the failed decision.
- **Truth Score:** based on correct answers and speed across 7 decisions (70 base + up to 30 speed per correct decision, normalized to 0-100).
- **Timer:** each decision has 5 seconds. Timeout counts as failure. Buttons shuffle each time.
- **Rules card:** shown once for 8 seconds with countdown; never shown again.

## Content / Tone
Playful, tense, a little funny, Lagos setting. "What if this happened to me?"
