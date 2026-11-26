/**
 * The Liar's Game — Episode 1: ROOM 412
 * Engine: data-driven cinematic psychological deception game.
 * All episode content comes from story.js (EPISODES). Add Episode 2 as new data.
 */
(() => {
  'use strict';

  // ============================
  // CONFIG
  // ============================
  const GAME_ID = 'room412';
  const SAVE_KEY = 'liars_game_room412_v1';
  const SETTINGS_KEY = 'liars_game_settings_v1';
  const DECISION_TIME = 8; // seconds (can be overridden per scene)
  const TYPE_SPEED_MS = 18; // ms per char for typewriter
  const RULES_DURATION_MS = 8000;
  const LOW_TIME_THRESHOLD = 3.1; // seconds - tension FX trigger

  // ============================
  // DOM
  // ============================
  const $ = (id) => document.getElementById(id);
  const dom = {
    app: $('app'),
    bgA: $('bgA'),
    bgB: $('bgB'),
    fxRed: $('fx-red'),
    fxShake: $('fx-shake'),
    chapterLabel: $('chapter-label'),
    muteBtn: $('mute-btn'),
    screenTitle: $('screen-title'),
    screenStory: $('screen-story'),
    screenRules: $('screen-rules'),
    screenDecision: $('screen-decision'),
    screenGameover: $('screen-gameover'),
    screenWin: $('screen-win'),
    titleHeading: $('title-heading'),
    titleSub: $('title-sub'),
    titlePrompt: $('title-prompt'),
    speakerTag: $('speaker-tag'),
    narrationBox: $('narration-box'),
    narrationText: $('narration-text'),
    bubble: $('bubble'),
    bubbleText: $('bubble-text'),
    tapHint: $('tap-hint'),
    rulesHeading: $('rules-heading'),
    rulesList: $('rules-list'),
    rulesTimerFill: $('rules-timer-fill'),
    rulesTimerText: $('rules-timer-text'),
    decisionPrompt: $('decision-prompt'),
    choices: $('choices'),
    timerText: $('timer-text'),
    timerRingFg: $('timer-ring-fg'),
    scoreValue: $('score-value'),
    scoreDetail: $('score-detail'),
    scoreRingFg: $('score-ring-fg'),
    winScoreValue: $('win-score-value'),
    winScoreDetail: $('win-score-detail'),
    winScoreRingFg: $('win-score-ring-fg'),
    btnRetry: $('btn-retry'),
    btnAd: $('btn-ad'),
    btnShare: $('btn-share'),
    btnWinShare: $('btn-win-share'),
    btnWinReplay: $('btn-win-replay'),
    adNote: $('ad-note'),
    gameoverTitle: $('gameover-title'),
    gameoverSub: $('gameover-sub'),
    screenInspect: $('screen-inspect'),
    inspectTitle: $('inspect-title'),
    inspectGrid: $('inspect-grid'),
    inspectContinue: $('inspect-continue'),
    inspectOverlay: $('inspect-overlay'),
    inspectOverlayImg: $('inspect-overlay-img'),
    inspectOverlayTitle: $('inspect-overlay-title'),
    inspectOverlayDesc: $('inspect-overlay-desc'),
    inspectOverlayClose: $('inspect-overlay-close'),
    skipBtn: $('skip-btn'),
  };

  const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // r=52

  // ============================
  // STATE
  // ============================
  const episode = (typeof EPISODES !== 'undefined' && EPISODES[GAME_ID]) ? EPISODES[GAME_ID] : (typeof LEVELS !== 'undefined' ? LEVELS.level1 : null);
  let state = freshState();
  let currentSceneId = null;
  let currentScene = null;
  let lineIndex = 0;
  let typing = false;
  let typeTimer = null;
  let fullText = '';
  let waitingTap = false;
  let tapResolver = null;
  let skipSceneRequested = false;
  let decisionTimer = null;
  let decisionRemaining = 0;
  let decisionTotal = 5;
  let decisionResolved = false;
  let rulesTimer = null;
  let activeBg = 'A';
  let kbClasses = ['kb-zoom-in','kb-zoom-out','kb-pan-left','kb-pan-right'];
  let kbIndex = 0;
  let audioUnlocked = false;

  function freshState() {
    return {
      episodeId: GAME_ID,
      sceneId: episode.startScene,
      checkpointSceneId: episode.startScene,
      decisions: {}, // id -> {correct: bool, timeLeft: number, failTag}
      inspectedClues: {}, // clueId -> true
      failed: false,
      failTag: null,
      failedDecisionId: null,
      completed: false,
      muted: loadSettings().muted || false,
    };
  }

  // ============================
  // SETTINGS / SAVE
  // ============================
  function loadSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; }
  }
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ muted: state.muted })); } catch {}
  }
  function saveGame() {
    try {
      const data = {
        episodeId: state.episodeId,
        sceneId: currentSceneId || state.sceneId,
        checkpointSceneId: state.checkpointSceneId,
        decisions: state.decisions,
        inspectedClues: state.inspectedClues,
        failedDecisionId: state.failedDecisionId,
        completed: state.completed,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {}
  }
  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.episodeId !== GAME_ID) return null;
      return data;
    } catch { return null; }
  }
  function clearRun() {
    try { localStorage.removeItem(SAVE_KEY); } catch {}
  }

  // ============================
  // AUDIO
  // ============================
  // FINAL AUDIO: Replace files in assets/audio/ with production SFX/music.
  // Keep filenames or update the map below. Recommended: short .mp3/.wav, <50KB each.
  const AUDIO_MAP = {
    door_knock: 'assets/audio/knock.wav',
    phone_ring: 'assets/audio/ring.wav',
    baby_cry: 'assets/audio/baby_cry.wav',
    heartbeat: 'assets/audio/heartbeat.wav',
    lights_out: 'assets/audio/lights_out.wav',
    call_end: 'assets/audio/call_end.wav',
    car_drive: 'assets/audio/car_drive.wav',
    door_handle: 'assets/audio/door_handle.wav',
    phone_buzz: 'assets/audio/phone_buzz.wav',
    keycard_beep: 'assets/audio/keycard_beep.wav',
  };

  const audioCache = {};
  function getAudio(name) {
    const src = AUDIO_MAP[name];
    if (!src) return null;
    if (!audioCache[name]) {
      const a = new Audio(src);
      a.preload = 'auto';
      a.volume = 0.55;
      audioCache[name] = a;
    }
    return audioCache[name];
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    // Try to play/pause a silent-ish cue to unlock on iOS/mobile
    const a = getAudio('door_knock');
    if (a) {
      const prevVol = a.volume;
      a.volume = 0.001;
      const p = a.play();
      if (p && p.then) {
        p.then(() => { a.pause(); a.currentTime = 0; a.volume = prevVol; }).catch(() => { a.volume = prevVol; });
      } else {
        a.pause(); a.currentTime = 0; a.volume = prevVol;
      }
    }
    // Warm up speech synthesis voices on user gesture
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
    } catch {}
  }

  function playSfx(name, { loop = false, volume = 0.55 } = {}) {
    if (state.muted) return null;
    const a = getAudio(name);
    if (!a) return null;
    try {
      a.loop = loop;
      a.volume = volume;
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } catch {}
    return a;
  }

  function stopSfx(name) {
    const a = audioCache[name];
    if (!a) return;
    try { a.pause(); a.currentTime = 0; a.loop = false; } catch {}
  }

  function stopAllSfx() {
    Object.keys(audioCache).forEach(stopSfx);
    Voice.stop();
  }

  function updateMuteBtn() {
    dom.muteBtn.textContent = state.muted ? '🔇' : '🔊';
    dom.muteBtn.setAttribute('aria-label', state.muted ? 'Unmute sound' : 'Mute sound');
  }

  // ============================
  // VOICE (Browser SpeechSynthesis)
  // ============================
  // Uses the device/browser Web Speech API for spoken dialogue and narration.
  // Quality/available voices vary by device. For higher-quality pre-rendered
  // audio, replace with generated clips and map them in AUDIO_MAP or a VOICE_MAP.
  const Voice = (() => {
    const synth = window.speechSynthesis;
    let voices = [];
    let enabled = true;
    let currentUtterance = null;

    function loadVoices() {
      if (!synth) return;
      voices = synth.getVoices() || [];
    }
    if (synth) {
      loadVoices();
      synth.onvoiceschanged = loadVoices;
    }

    function voiceGender(v) {
      const n = ((v.name||'') + ' ' + (v.voiceURI||'')).toLowerCase();
      if (/female|woman|samantha|victoria|karen|moira|tessa|fiona|serena|zira|eva|jenny|aria|sara|susan|hazel|linda|heera|google uk english female/.test(n)) return 'female';
      if (/male|man|daniel|david|mark|james|george|oliver|thomas|guy|arthur|ryan|christopher|eric|liam|google uk english male/.test(n)) return 'male';
      return 'unknown';
    }

    function pickVoice(preferredLangs = ['en-NG','en-GB','en-US','en'], gender = 'any') {
      if (!voices.length) loadVoices();
      const langMatches = [];
      for (const lang of preferredLangs) {
        for (const v of voices) {
          if ((v.lang || '').toLowerCase().startsWith(lang.toLowerCase())) langMatches.push(v);
        }
      }
      const pool = langMatches.length ? langMatches : voices.slice();
      if (gender === 'male' || gender === 'female') {
        const g = pool.find(v => voiceGender(v) === gender);
        if (g) return g;
        // try any lang with desired gender
        const g2 = voices.find(v => voiceGender(v) === gender);
        if (g2) return g2;
      }
      return pool[0] || voices[0] || null;
    }

    function profileFor(line) {
      const speaker = (line.speaker || '').toLowerCase();
      const type = line.type;
      // Room 412 characters
      if (speaker.includes('tunde')) return { rate: 0.98, pitch: 0.88, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'male' };
      if (speaker.includes('amara')) return { rate: 0.95, pitch: 1.08, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'female' };
      if (speaker.includes('kemi')) return { rate: 1.03, pitch: 1.18, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'female' };
      if (speaker.includes('bassey') || speaker.includes('receptionist')) return { rate: 0.94, pitch: 0.82, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'male' };
      if (speaker.includes('security')) return { rate: 0.92, pitch: 0.75, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'male' };
      // Legacy / general
      if (type === 'narration') return { rate: 0.98, pitch: 0.92, volume: 0.95, langs: ['en-NG','en-GB','en-US','en'], gender: 'any' };
      if (speaker.includes('mrs. okonkwo') || speaker.includes('mrs okonkwo')) return { rate: 0.95, pitch: 1.05, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'female' };
      if (speaker.includes('chika')) return { rate: 1.02, pitch: 1.15, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'female' };
      if (speaker.includes('guard')) return { rate: 0.95, pitch: 0.8, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'male' };
      if (speaker.includes('baby')) return { rate: 1.05, pitch: 1.35, volume: 0.95, langs: ['en-NG','en-GB','en-US','en'], gender: 'female' };
      if (speaker.includes('neighbour')) return { rate: 0.98, pitch: 0.9, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'male' };
      if (speaker.includes('man at gate')) return { rate: 1.0, pitch: 0.85, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'male' };
      if (speaker.includes('voice on phone') || speaker.includes('phone')) return { rate: 0.97, pitch: 0.95, volume: 0.95, langs: ['en-NG','en-GB','en-US','en'], gender: 'any' };
      if (speaker === 'you') return { rate: 1.0, pitch: 0.95, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'male' };
      return { rate: 1.0, pitch: 1.0, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'any' };
    }

    function stop() {
      if (!synth) return;
      try { synth.cancel(); } catch {}
      currentUtterance = null;
    }

    function speak(lineOrText, opts = {}) {
      if (!synth || !enabled || state.muted) return;
      const text = typeof lineOrText === 'string' ? lineOrText : (lineOrText.text || '');
      if (!text.trim()) return;
      stop();
      const profile = typeof lineOrText === 'object' ? profileFor(lineOrText) : { rate: 1, pitch: 1, volume: 1, langs: ['en-NG','en-GB','en-US','en'], gender: 'any' };
      const u = new SpeechSynthesisUtterance(text);
      const voice = pickVoice(profile.langs, profile.gender || 'any');
      if (voice) u.voice = voice;
      u.rate = opts.rate ?? profile.rate;
      u.pitch = opts.pitch ?? profile.pitch;
      u.volume = opts.volume ?? profile.volume;
      currentUtterance = u;
      u.onend = () => { if (currentUtterance === u) currentUtterance = null; };
      u.onerror = () => { if (currentUtterance === u) currentUtterance = null; };
      try { synth.speak(u); } catch {}
    }

    function setEnabled(v) { enabled = !!v; if (!enabled) stop(); }
    function isEnabled() { return enabled; }

    return { speak, stop, setEnabled, isEnabled, supported: !!synth };
  })();

  // ============================
  // IMAGE PRELOADING
  // ============================
  const preloaded = new Set();
  function preloadImage(src) {
    if (!src || preloaded.has(src)) return;
    preloaded.add(src);
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  }

  function collectSceneImages(sceneId, depth = 1) {
    const sc = episode.scenes[sceneId];
    if (!sc) return [];
    const imgs = [];
    if (sc.image) imgs.push(sc.image);
    if (sc.lines) sc.lines.forEach(l => { if (l.image) imgs.push(l.image); });
    if (sc.failTagScenes) {
      Object.values(sc.failTagScenes).forEach(arr => arr.forEach(l => { if (l.image) imgs.push(l.image); }));
    }
    if (depth > 0) {
      const nexts = [sc.next, sc.nextCorrect, sc.nextWrong].filter(Boolean);
      nexts.forEach(n => imgs.push(...collectSceneImages(n, depth - 1)));
    }
    return imgs;
  }

  function preloadScene(sceneId, depth = 1) {
    collectSceneImages(sceneId, depth).forEach(preloadImage);
  }

  // ============================
  // UI HELPERS
  // ============================
  function showScreen(name) {
    ['screenTitle','screenStory','screenRules','screenDecision','screenGameover','screenWin','screenInspect'].forEach(k => {
      if (dom[k]) dom[k].classList.add('hidden');
    });
    const map = {
      title: dom.screenTitle,
      story: dom.screenStory,
      rules: dom.screenRules,
      decision: dom.screenDecision,
      gameover: dom.screenGameover,
      win: dom.screenWin,
      inspect: dom.screenInspect,
    };
    if (map[name]) map[name].classList.remove('hidden');
    // Skip button only during story
    if (dom.skipBtn) dom.skipBtn.classList.toggle('hidden', name !== 'story');
  }

  function setChapter(text) {
    dom.chapterLabel.textContent = text || '';
  }

  function setBg(src) {
    if (!src) return;
    const next = activeBg === 'A' ? dom.bgB : dom.bgA;
    const prev = activeBg === 'A' ? dom.bgA : dom.bgB;
    // remove old kb classes
    kbClasses.forEach(c => next.classList.remove(c));
    next.style.backgroundImage = `url("${src}")`;
    // force reflow then apply ken burns
    void next.offsetWidth; // eslint-disable-line no-unused-expressions
    const kb = kbClasses[kbIndex % kbClasses.length];
    kbIndex++;
    next.classList.add(kb);
    next.classList.add('active');
    prev.classList.remove('active');
    // clean up prev kb after transition
    setTimeout(() => { kbClasses.forEach(c => prev.classList.remove(c)); }, 800);
    activeBg = activeBg === 'A' ? 'B' : 'A';
  }

  function flashRed(duration = 450) {
    dom.fxRed.classList.add('flash');
    setTimeout(() => dom.fxRed.classList.remove('flash'), duration);
  }

  function shakeScreen() {
    dom.fxShake.classList.remove('shake');
    void dom.fxShake.offsetWidth;
    dom.fxShake.classList.add('shake');
    setTimeout(() => dom.fxShake.classList.remove('shake'), 550);
  }

  function setDangerPulse(on) {
    dom.fxRed.classList.toggle('danger-pulse', !!on);
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  function waitForTap() {
    if (skipSceneRequested) return Promise.resolve();
    waitingTap = true;
    dom.tapHint.style.visibility = 'visible';
    return new Promise(resolve => { tapResolver = resolve; });
  }

  function resolveTap() {
    if (!waitingTap) return false;
    waitingTap = false;
    dom.tapHint.style.visibility = 'hidden';
    const r = tapResolver;
    tapResolver = null;
    if (r) r();
    return true;
  }

  // Typewriter: returns promise that resolves when done (or skipped)
  function typeText(el, text, speed = TYPE_SPEED_MS) {
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
    typing = true;
    fullText = text;
    el.textContent = '';
    let i = 0;
    return new Promise(resolve => {
      const done = () => {
        if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
        typing = false;
        el.textContent = fullText;
        resolve();
      };
      typeTimer = setInterval(() => {
        i++;
        el.textContent = fullText.slice(0, i);
        if (i >= fullText.length) done();
      }, speed);
      // store resolver so tap can skip
      typeText._done = done;
      typeText._resolve = resolve;
    });
  }

  function skipType() {
    if (typing && typeText._done) {
      typeText._done();
      return true;
    }
    return false;
  }

  // ============================
  // SCENE RUNNER
  // ============================
  async function goToScene(sceneId) {
    if (!sceneId) return;
    Voice.stop();
    currentSceneId = sceneId;
    state.sceneId = sceneId;
    currentScene = episode.scenes[sceneId];
    if (!currentScene) {
      console.error('Missing scene', sceneId);
      return;
    }
    // If this scene leads into a decision, mark it as checkpoint (retry point)
    if (currentScene.next && episode.scenes[currentScene.next] && episode.scenes[currentScene.next].type === 'decision') {
      state.checkpointSceneId = sceneId;
    }
    saveGame();
    // Preload upcoming
    preloadScene(sceneId, 2);

    switch (currentScene.type) {
      case 'title': return runTitle(currentScene);
      case 'dialogue': return runDialogue(currentScene);
      case 'narration': return runNarrationScene(currentScene);
      case 'rules_card': return runRules(currentScene);
      case 'decision': return runDecision(currentScene);
      case 'failure_sequence': return runFailureSequence(currentScene);
      case 'ending': return runDialogue(currentScene, { ending: true });
      case 'inspection': return runInspection(currentScene);
      case 'game_over': return runGameOver(currentScene);
      case 'win': return showWin();
      default:
        console.warn('Unknown scene type', currentScene.type);
    }
  }

  // ============================
  // TITLE
  // ============================
  async function runTitle(sc) {
    showScreen('title');
    setChapter('');
    setDangerPulse(false);
    if (sc.image) setBg(sc.image);
    dom.titleHeading.textContent = sc.heading || 'THE LIAR\'S GAME';
    dom.titleSub.textContent = sc.subheading || '';
    dom.titlePrompt.textContent = sc.prompt || 'Tap to begin';

    // Wait for tap anywhere on title
    await new Promise(resolve => {
      const handler = () => {
        dom.screenTitle.removeEventListener('click', handler);
        resolve();
      };
      dom.screenTitle.addEventListener('click', handler);
    });
    unlockAudio();
    goToScene(sc.next);
  }

  // ============================
  // DIALOGUE / NARRATION LINES
  // ============================
  async function runDialogue(sc, opts = {}) {
    showScreen('story');
    setDangerPulse(false);
    skipSceneRequested = false;
    if (sc.image) setBg(sc.image);

    const lines = sc.lines || [];
    for (let i = 0; i < lines.length; i++) {
      if (skipSceneRequested) break;
      lineIndex = i;
      const line = lines[i];
      await showLine(line);
    }
    skipSceneRequested = false;

    if (opts.ending || sc.next === 'win_screen') {
      return showWin();
    }
    if (sc.next) goToScene(sc.next);
  }

  async function runNarrationScene(sc) {
    // A narration scene type with single text - convert to lines style
    showScreen('story');
    if (sc.image) setBg(sc.image);
    const lines = sc.lines || [{ type: 'narration', text: sc.text, image: sc.image }];
    for (const line of lines) await showLine(line);
    if (sc.next) goToScene(sc.next);
  }

  async function showLine(line) {
    // SFX
    if (line.sfx) playSfx(line.sfx);

    // Image cut
    if (line.image) setBg(line.image);

    const isNarration = line.type === 'narration';
    dom.narrationBox.classList.toggle('hidden', !isNarration);
    dom.bubble.classList.toggle('hidden', isNarration);
    dom.speakerTag.classList.toggle('hidden', isNarration || !line.speaker);

    // Voice starts with the line
    Voice.speak(line);

    if (isNarration) {
      dom.narrationText.textContent = '';
      await typeText(dom.narrationText, line.text || '');
    } else {
      // Speech
      dom.speakerTag.textContent = line.speaker || '';
      const right = line.side === 'right';
      dom.speakerTag.classList.toggle('right', right);
      dom.bubble.classList.toggle('right', right);
      dom.bubble.classList.toggle('pov', !!line.pov);
      dom.bubbleText.textContent = '';
      // restart bubble animation
      dom.bubble.style.animation = 'none';
      void dom.bubble.offsetWidth;
      dom.bubble.style.animation = '';
      await typeText(dom.bubbleText, line.text || '');
    }

    await waitForTap();
    Voice.stop();
  }

  // ============================
  // INSPECTION (Act 1 clues)
  // ============================
  async function runInspection(sc) {
    showScreen('inspect');
    setDangerPulse(false);
    Voice.stop();
    if (sc.image) setBg(sc.image);
    if (dom.inspectTitle) dom.inspectTitle.textContent = sc.heading || 'Inspect the Room';
    const clues = sc.clues || [];
    const grid = dom.inspectGrid;
    grid.innerHTML = '';

    function renderClues() {
      grid.innerHTML = '';
      let allDone = true;
      clues.forEach(clue => {
        const inspected = !!state.inspectedClues[clue.id];
        if (!inspected) allDone = false;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'inspect-clue' + (inspected ? ' inspected' : '');
        btn.innerHTML = `
          <img class="inspect-clue-img" src="${clue.image}" alt="${escapeHtml(clue.title)}" loading="lazy" />
          <div class="inspect-clue-name">${escapeHtml(clue.title)}</div>
          <div class="inspect-clue-status">${inspected ? 'Inspected' : 'Tap to inspect'}</div>
        `;
        btn.addEventListener('click', () => openClue(clue));
        grid.appendChild(btn);
      });
      if (dom.inspectContinue) {
        dom.inspectContinue.disabled = !allDone;
        dom.inspectContinue.textContent = allDone ? 'Continue' : `Inspect all clues (${Object.keys(state.inspectedClues).filter(id => clues.find(c=>c.id===id)).length}/${clues.length})`;
      }
    }

    function openClue(clue) {
      if (!dom.inspectOverlay) return;
      dom.inspectOverlayImg.src = clue.image;
      dom.inspectOverlayImg.alt = clue.title || 'Clue';
      dom.inspectOverlayTitle.textContent = clue.title || '';
      dom.inspectOverlayDesc.textContent = clue.description || '';
      dom.inspectOverlay.classList.remove('hidden');
      Voice.speak({ type: 'narration', text: clue.description || clue.title || '' });
    }

    function closeClue() {
      if (!dom.inspectOverlay) return;
      // mark currently open clue as inspected by matching title
      const title = dom.inspectOverlayTitle.textContent;
      const clue = clues.find(c => c.title === title);
      if (clue) state.inspectedClues[clue.id] = true;
      dom.inspectOverlay.classList.add('hidden');
      Voice.stop();
      saveGame();
      renderClues();
    }

    dom.inspectOverlayClose.onclick = closeClue;
    dom.inspectOverlay.onclick = (e) => { if (e.target === dom.inspectOverlay) closeClue(); };

    renderClues();
    // if already all inspected (resume), enable continue
    renderClues();

    await new Promise(resolve => {
      dom.inspectContinue.onclick = () => {
        if (dom.inspectContinue.disabled) return;
        dom.inspectOverlay.classList.add('hidden');
        resolve();
      };
    });
    goToScene(sc.next);
  }

  // ============================
  // RULES CARD
  // ============================
  async function runRules(sc) {
    showScreen('rules');
    setDangerPulse(false);
    if (sc.image) setBg(sc.image);
    dom.rulesHeading.textContent = sc.heading || 'REMEMBER THE RULES';
    dom.rulesList.innerHTML = '';
    (sc.rules || []).forEach(rule => {
      const li = document.createElement('li');
      li.textContent = rule;
      dom.rulesList.appendChild(li);
    });

    const duration = sc.durationMs || RULES_DURATION_MS;
    let remaining = duration;
    dom.rulesTimerFill.style.width = '100%';
    dom.rulesTimerFill.classList.remove('urgent');
    dom.rulesTimerText.classList.remove('urgent');
    dom.rulesTimerText.textContent = Math.ceil(remaining / 1000);

    const start = Date.now();
    await new Promise(resolve => {
      rulesTimer = setInterval(() => {
        const elapsed = Date.now() - start;
        remaining = Math.max(0, duration - elapsed);
        const pct = (remaining / duration) * 100;
        dom.rulesTimerFill.style.width = pct + '%';
        const secs = Math.ceil(remaining / 1000);
        dom.rulesTimerText.textContent = secs;
        if (remaining <= 3000) {
          dom.rulesTimerFill.classList.add('urgent');
          dom.rulesTimerText.classList.add('urgent');
        }
        if (remaining <= 0) {
          clearInterval(rulesTimer);
          rulesTimer = null;
          resolve();
        }
      }, 100);
    });

    // Rules never shown again - just proceed
    goToScene(sc.next);
  }

  // ============================
  // DECISION
  // ============================
  async function runDecision(sc) {
    showScreen('decision');
    setDangerPulse(false);
    stopSfx('heartbeat');
    if (sc.image) setBg(sc.image);

    decisionResolved = false;
    decisionTotal = sc.timerSeconds || DECISION_TIME;
    decisionRemaining = decisionTotal;
    dom.decisionPrompt.textContent = sc.prompt || 'What do you do?';
    dom.choices.innerHTML = '';
    Voice.speak({ type: 'narration', text: sc.prompt || 'What do you do?' });

    // Shuffle choices
    const shuffled = sc.choices.map((c, i) => ({ ...c, _orig: i }));
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    shuffled.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.type = 'button';
      btn.innerHTML = `<span class="choice-num">${idx + 1}</span> ${escapeHtml(choice.text)}`;
      btn.addEventListener('click', () => onDecisionChoice(sc, choice));
      dom.choices.appendChild(btn);
    });

    updateDecisionTimerUI();
    startDecisionTimer(sc);
  }

  function updateDecisionTimerUI() {
    const pct = Math.max(0, decisionRemaining / decisionTotal);
    const offset = RING_CIRCUMFERENCE * (1 - pct);
    dom.timerRingFg.style.strokeDasharray = String(RING_CIRCUMFERENCE);
    dom.timerRingFg.style.strokeDashoffset = String(offset);
    dom.timerText.textContent = Math.ceil(Math.max(0, decisionRemaining));
    const urgent = decisionRemaining <= LOW_TIME_THRESHOLD;
    dom.timerRingFg.classList.toggle('urgent', urgent);
    dom.timerText.classList.toggle('urgent', urgent);
  }

  function startDecisionTimer(sc) {
    const start = Date.now();
    let heartbeatStarted = false;
    clearInterval(decisionTimer);
    decisionTimer = setInterval(() => {
      if (decisionResolved) { clearInterval(decisionTimer); decisionTimer = null; return; }
      const elapsed = (Date.now() - start) / 1000;
      decisionRemaining = Math.max(0, decisionTotal - elapsed);
      updateDecisionTimerUI();

      if (decisionRemaining <= LOW_TIME_THRESHOLD && !heartbeatStarted) {
        heartbeatStarted = true;
        setDangerPulse(true);
        playSfx('heartbeat', { loop: true, volume: 0.45 });
      }

      if (decisionRemaining <= 0) {
        clearInterval(decisionTimer);
        decisionTimer = null;
        onDecisionTimeout(sc);
      }
    }, 100);
  }

  function lockChoices() {
    dom.choices.querySelectorAll('button').forEach(b => b.disabled = true);
  }

  function recordDecision(sc, correct, timeLeft, failTag) {
    state.decisions[sc.id] = {
      correct: !!correct,
      timeLeft: Math.max(0, timeLeft),
      total: sc.timerSeconds || DECISION_TIME,
      failTag: failTag || null,
    };
  }

  function onDecisionChoice(sc, choice) {
    if (decisionResolved) return;
    decisionResolved = true;
    clearInterval(decisionTimer);
    decisionTimer = null;
    stopSfx('heartbeat');
    Voice.stop();
    setDangerPulse(false);
    lockChoices();

    const correct = !!choice.correct;
    recordDecision(sc, correct, decisionRemaining, choice.failTag);

    if (correct) {
      // Set checkpoint to the scene after the correct-dialogue scene
      const correctScene = episode.scenes[sc.nextCorrect];
      if (correctScene && correctScene.next) {
        state.checkpointSceneId = correctScene.next;
      } else {
        state.checkpointSceneId = sc.nextCorrect;
      }
      saveGame();
      // Small pause for feel
      setTimeout(() => goToScene(sc.nextCorrect), 350);
    } else {
      triggerFailure(sc, choice.failTag || 'wrong');
    }
  }

  function onDecisionTimeout(sc) {
    if (decisionResolved) return;
    decisionResolved = true;
    stopSfx('heartbeat');
    Voice.stop();
    setDangerPulse(false);
    lockChoices();
    recordDecision(sc, false, 0, 'timeout');
    triggerFailure(sc, 'timeout');
  }

  function triggerFailure(sc, failTag) {
    state.failed = true;
    state.failTag = failTag;
    state.failedDecisionId = sc.id;
    saveGame();
    // Red flash + shake
    flashRed(600);
    shakeScreen();
    playSfx('heartbeat', { loop: false, volume: 0.5 });
    // Go to failure sequence - pass failTag via state
    setTimeout(() => {
      // Use the decision's nextWrong scene
      const failSceneId = sc.nextWrong;
      goToScene(failSceneId);
    }, 700);
  }

  // ============================
  // FAILURE SEQUENCE
  // ============================
  async function runFailureSequence(sc) {
    showScreen('story');
    setDangerPulse(true);
    const tag = state.failTag || sc.failTag || 'timeout';
    const scenes = (sc.failTagScenes && (sc.failTagScenes[tag] || sc.failTagScenes.timeout || sc.failTagScenes[Object.keys(sc.failTagScenes)[0]])) || [];
    // Show 2-3 short scenes as tension rises
    for (let i = 0; i < scenes.length; i++) {
      const line = scenes[i];
      if (i === scenes.length - 1) {
        flashRed(350);
        shakeScreen();
      }
      await showLine(line);
    }
    // Brief pause, then game over
    await wait(400);
    setDangerPulse(false);
    goToScene(sc.next || 'game_over');
  }

  // ============================
  // GAME OVER
  // ============================
  function calcTruthScore() {
    const decisions = Object.values(state.decisions);
    const totalDecisions = 6; // Room 412 has 6 decisions
    let correctCount = 0;
    let scoreSum = 0;
    decisions.forEach(d => {
      if (d.correct) {
        correctCount++;
        const t = d.total || 8;
        const ratio = Math.max(0, Math.min(1, d.timeLeft / t));
        // 70 base + up to 30 for speed
        scoreSum += 70 + Math.round(ratio * 30);
      }
    });
    const normalized = Math.round(scoreSum / totalDecisions);
    return { score: Math.max(0, Math.min(100, normalized)), correctCount, totalDecisions };
  }

  function animateScoreRing(ringEl, score) {
    const offset = RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(100, score)) / 100);
    ringEl.style.strokeDasharray = String(RING_CIRCUMFERENCE);
    ringEl.style.strokeDashoffset = String(RING_CIRCUMFERENCE);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { ringEl.style.strokeDashoffset = String(offset); });
    });
  }

  async function runGameOver(sc) {
    showScreen('gameover');
    setDangerPulse(false);
    stopAllSfx();
    if (sc && sc.image) setBg(sc.image);
    if (dom.gameoverTitle) dom.gameoverTitle.textContent = (sc && sc.title) || 'YOU GOT CAUGHT.';
    if (dom.gameoverSub) dom.gameoverSub.textContent = (sc && sc.message) || "You're not good enough to be a liar.";
    flashRed(500);
    shakeScreen();

    const { score, correctCount, totalDecisions } = calcTruthScore();
    dom.scoreValue.textContent = String(score);
    dom.scoreDetail.textContent = `Truth Score: ${correctCount} / ${totalDecisions}`;
    animateScoreRing(dom.scoreRingFg, score);
    dom.adNote.classList.add('hidden');
    dom.adNote.textContent = '';

    saveGame();
  }

  // ============================
  // WIN
  // ============================
  async function showWin() {
    showScreen('win');
    setDangerPulse(false);
    stopAllSfx();
    state.completed = true;
    saveGame();

    const { score, correctCount, totalDecisions } = calcTruthScore();
    dom.winScoreValue.textContent = String(score);
    dom.winScoreDetail.textContent = `Truth Score: ${correctCount} / ${totalDecisions}`;
    animateScoreRing(dom.winScoreRingFg, score);
  }

  // ============================
  // SHARE
  // ============================
  function getShareText() {
    const { score, correctCount, totalDecisions } = calcTruthScore();
    const survived = state.completed && !state.failed;
    if (survived) {
      return `I survived Room 412 in The Liar's Game! Truth Score: ${correctCount}/${totalDecisions}. I lied my way out of Victoria Island. Can you?`;
    }
    return `I got caught in Room 412 (The Liar's Game). Truth Score: ${correctCount}/${totalDecisions}. I wasn't good enough to be a liar... yet. Can you survive?`;
  }

  async function shareScore(btn) {
    const text = getShareText();
    const shareData = {
      title: "The Liar's Game — Room 412",
      text,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        // user cancelled or share failed - fall through to clipboard
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      const orig = btn.textContent;
      btn.textContent = 'Copied to clipboard!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    } catch {
      // Last resort
      prompt('Copy your score:', `${text} ${window.location.href}`);
    }
  }

  // ============================
  // AD STUB
  // ============================
  function watchAdToContinue() {
    // ============================================================
    // AD SDK INTEGRATION POINT
    // Replace this stub with your real ad SDK call.
    // Example (Google AdSense/AdMob H5, etc.):
    //   adSdk.showRewardedAd().then(() => resumeFromCheckpoint());
    // For now, we simulate a short "ad" delay and then continue.
    // ============================================================
    dom.adNote.classList.remove('hidden');
    dom.adNote.textContent = 'Ad placeholder: in production, a rewarded ad plays here. Continuing...';
    dom.btnAd.disabled = true;
    setTimeout(() => {
      dom.btnAd.disabled = false;
      dom.adNote.classList.add('hidden');
      resumeFromCheckpoint();
    }, 1500);
  }

  // ============================
  // RETRY / CHECKPOINT
  // ============================
  function resumeFromCheckpoint() {
    // Clear the failed flag but keep progress/checkpoint and correct decisions
    state.failed = false;
    state.failTag = null;
    state.failedDecisionId = null;
    for (const [id, d] of Object.entries(state.decisions)) {
      if (!d.correct) delete state.decisions[id];
    }
    setDangerPulse(false);
    stopAllSfx();
    saveGame();
    const target = state.checkpointSceneId || 'act2_d1_setup';
    goToScene(target);
  }

  function restartGame() {
    stopAllSfx();
    setDangerPulse(false);
    clearRun();
    state = freshState();
    state.muted = loadSettings().muted || false;
    updateMuteBtn();
    goToScene(episode.startScene);
  }

  // ============================
  // INPUT / TAP HANDLING
  // ============================
  function handleStoryTap(e) {
    // Only handle taps on story screen
    if (dom.screenStory.classList.contains('hidden')) return;
    // Ignore if tapping HUD buttons (they're above)
    if (e.target.closest('#mute-btn')) return;

    unlockAudio();
    if (typing) {
      skipType();
      return;
    }
    resolveTap();
  }

  // ============================
  // UTIL
  // ============================
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ============================
  // INIT
  // ============================
  function init() {
    // Restore mute setting
    const settings = loadSettings();
    state.muted = !!settings.muted;
    updateMuteBtn();

    // Wire events
    dom.screenStory.addEventListener('click', handleStoryTap);
    // Also allow tapping narration/bubble area on mobile reliably
    dom.screenStory.addEventListener('touchend', (e) => {
      // let click handle it; prevent double fire on some devices by ignoring touchend if click will fire
      // But on iOS safari both may fire; our resolveTap is guarded.
    }, { passive: true });

    dom.muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.muted = !state.muted;
      if (state.muted) stopAllSfx();
      updateMuteBtn();
      saveSettings();
    });

    if (dom.skipBtn) {
      dom.skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        skipSceneRequested = true;
        Voice.stop();
        if (typing) skipType();
        resolveTap();
      });
    }

    dom.btnRetry.addEventListener('click', () => { unlockAudio(); resumeFromCheckpoint(); });
    dom.btnAd.addEventListener('click', () => { unlockAudio(); watchAdToContinue(); });
    dom.btnShare.addEventListener('click', () => shareScore(dom.btnShare));
    dom.btnWinShare.addEventListener('click', () => shareScore(dom.btnWinShare));
    dom.btnWinReplay.addEventListener('click', () => { unlockAudio(); restartGame(); });

    // Prevent double-tap zoom on buttons
    document.addEventListener('dblclick', (e) => { e.preventDefault(); }, { passive: false });

    // Resume from save?
    const saved = loadGame();
    if (saved && !saved.completed) {
      // Restore state
      state.checkpointSceneId = saved.checkpointSceneId || episode.startScene;
      state.decisions = saved.decisions || {};
      state.inspectedClues = saved.inspectedClues || {};
      state.failedDecisionId = saved.failedDecisionId || null;
      state.completed = !!saved.completed;
      state.sceneId = saved.sceneId || state.checkpointSceneId;
      // If they were mid-failure/gameover, resume at checkpoint
      const resumeTarget = (saved.sceneId === 'game_over' || episode.scenes[saved.sceneId]?.type === 'failure_sequence')
        ? state.checkpointSceneId
        : (saved.sceneId || state.checkpointSceneId);
      preloadScene(resumeTarget, 2);
      goToScene(resumeTarget);
    } else if (saved && saved.completed) {
      // Let them replay from title, but keep it simple
      preloadScene(episode.startScene, 2);
      goToScene(episode.startScene);
    } else {
      preloadScene(episode.startScene, 2);
      goToScene(episode.startScene);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { Voice.stop(); stopAllSfx(); }
  });

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
