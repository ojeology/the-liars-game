# The Liar's Game — Episode 1: ROOM 412

A cinematic, mobile-first psychological deception game set in Victoria Island, Lagos. Static site (HTML/CSS/JS), no framework, no build step, no backend.

## Live / Deploy

- **Repo:** https://github.com/ojeology/the-liars-game
- **GitHub Pages:** deploy from `main` branch, `/ (root)` (already configured).
- **Live URL:** https://ojeology.github.io/the-liars-game/

### Run locally
```bash
cd liars-game
python3 -m http.server 8080
# open http://localhost:8080
```

## Project Structure

```
.
├── index.html            # Game shell/screens
├── style.css             # Cinematic mobile-first styles, Ken Burns, FX
├── game.js               # Data-driven engine (scene runner, audio, voice, save)
├── story.js              # ALL episode content (EPISODES.room412)
├── assets/
│   ├── images/           # WebP scene images (max ~1080px wide, <150KB target)
│   └── audio/            # SFX placeholders (.wav)
├── tests/
│   └── test_logic.mjs     # Automated logic/graph tests (node)
├── IMAGE_PROMPTS.md      # Character sheet + every required image prompt/filename
├── VOICE_SCRIPT.md       # Every spoken line, speaker, filename, delivery direction
├── README.md
└── .nojekyll
```

## How the Game Engine Works

- `game.js` is a data-driven scene runner. It reads `EPISODES.room412` from `story.js`.
- Supported scene types: `title`, `dialogue`, `inspection`, `rules_card`, `decision`, `failure_sequence`, `ending`, `game_over`, `win`.
- **Dialogue:** typewriter text, tap to advance, skip button, speech bubbles with speaker tags/tails, narration caption box, per-line SFX, browser TTS voice.
- **Inspection:** Act 1 clue hub; player must inspect all clues before continuing. Inspected clues are tracked in state.
- **Decisions:** 3 choices, shuffled visual order, 8-second countdown, low-time tension (last 3s: red pulse, shake, heartbeat), timeout = contextual failure. Correctness is attached to choice objects, not visual order.
- **Failure system:** wrong/timeout does not instantly end; engine routes to `failure_sequence` with `failTagScenes` (including `timeout`), plays 2-4 scenes, then `game_over`.
- **Win:** only the full correct 6-choice sequence reaches the ending/win screen.

## How to Add Episode 2

1. In `story.js`, add `EPISODES.room413 = { id, title, subtitle, startScene, scenes: {...} }` following the same schema.
2. Add new images to `assets/images/` and prompts to `IMAGE_PROMPTS.md`.
3. Add/extend voice lines in `VOICE_SCRIPT.md`.
4. Update `GAME_ID` in `game.js` (or add a level-select screen) to load the new episode.
5. Keep scene IDs stable and ensure every decision has exactly 1 correct choice and contextual failure branches (including timeout).
6. Run `node tests/test_logic.mjs` (adapt test to target episode) and verify exactly one winning path.

## How to Add Scenes and Decisions

- **Scene:** add an object under `EPISODES.<id>.scenes` with a unique key. Reference it via `next`, `nextCorrect`, or `nextWrong`.
- **Decision:** `type: "decision"`, `id`, `prompt`, `image`, `timerSeconds`, `choices: [{text, correct, failTag}]`, `nextCorrect`, `nextWrong`.
- **Failure sequence:** `type: "failure_sequence"`, `failTagScenes: { <failTag>: [line,...], timeout: [line,...] }`, `next: "game_over"`. Each branch should have 2-4 scenes and end with the narrative reveal/caught moment.
- Validate all refs: `node tests/test_logic.mjs`.

## How to Replace Images

- Replace files in `assets/images/` (keep filenames or update story refs).
- Use WebP, portrait 9:16, max ~1080px wide, target <150KB.
- Follow prompts in `IMAGE_PROMPTS.md`. Do not bake text into images.
- Current build uses development placeholders; replace with final art for production polish.

## How to Replace Character Voices

- Browser TTS is used by default (`speechSynthesis`) with character profiles in `game.js` (`Voice.profileFor`).
- For pre-generated voices, create audio files per `VOICE_SCRIPT.md` naming and extend the engine to play clip files by line/filename (map in a `VOICE_MAP` similar to `AUDIO_MAP`).
- Keep voice style consistent: Tunde warm/nervous, Amara controlled/restrained, Kemi lively, Mr. Bassey hesitant, Security stern.

## How to Replace Sound Effects

- Replace files in `assets/audio/` or update `AUDIO_MAP` in `game.js`.
- Current SFX: `knock.wav` (door knock), `door_handle.wav`, `phone_buzz.wav`, `keycard_beep.wav`, `heartbeat.wav`, plus legacy placeholders.

## How Checkpoints Work

- Progress saved in `localStorage` key `liars_game_room412_v1`.
- State stores: current scene, checkpoint scene, decisions, inspected clues, failed decision, completion.
- On correct decision, checkpoint advances to the next setup scene.
- On failure, **Retry from last checkpoint** clears failed decision state and resumes at checkpoint.
- Refreshing preserves valid progress.

## Where a Future Rewarded-Ad SDK Would Connect

- `game.js`, function `watchAdToContinue()`.
- Look for `AD SDK INTEGRATION POINT` comment.
- Current behavior: placeholder delay, then `resumeFromCheckpoint()`. Replace with rewarded ad SDK callback; on reward call `resumeFromCheckpoint()`.

## Testing

Run logic/graph tests:
```bash
node tests/test_logic.mjs
```

The test validates: scene refs, 6 decisions, 3 choices each, exactly 1 correct, timeout/failTag branches, 2-4 failure scenes, all 12 wrong choices lead to game over, all 6 timeouts lead to game over, and exactly one winning path across all choice combinations (including timeout combinations).

## GitHub Pages Deployment

- Static files at repo root. `.nojekyll` included.
- GitHub Pages configured: **Deploy from branch**, `main`, `/ (root)`.
- After pushing to `main`, Pages rebuilds automatically. Verify the live URL loads Episode 1.

## Notes / Limitations

- Images are development placeholders (WebP). Replace using `IMAGE_PROMPTS.md` for final cinematic art.
- Voices use browser/device TTS; quality varies by device. `VOICE_SCRIPT.md` is provided for pre-generated voice production.
- No real ads, accounts, payments, analytics, or backend services.
