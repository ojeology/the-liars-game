/**
 * The Liar's Game — Level 1: The Night Nanny
 * Engine: data-driven cinematic visual novel.
 * All story content comes from story.js (LEVELS). To add Level 2, add data there.
 */
(() => {
  'use strict';

  // ============================
  // CONFIG
  // ============================
  const LEVEL_ID = 'level1';
  const SAVE_KEY = 'liars_game_save_v1';
  const SETTINGS_KEY = 'liars_game_settings_v1';
  const DECISION_TIME = 5; // seconds (can be overridden per scene)
  const TYPE_SPEED_MS = 18; // ms per char for typewriter
  const RULES_DURATION_MS = 8000;

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
  };

  const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // r=52

  // ============================
  // STATE
  // ============================
  const level = LEVELS[LEVEL_ID];
  let state = freshState();
  let currentSceneId = null;
  let currentScene = null;
  let lineIndex = 0;
  let typing = false;
  let typeTimer = null;
  let fullText = '';
  let waitingTap = false;
  let tapResolver = null;
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
      levelId: LEVEL_ID,
      sceneId: level.startScene,
      checkpointSceneId: level.startScene,
      decisions: {}, // id -> {correct: bool, timeLeft: number}
      failed: false,
      failTag: null,
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
        levelId: state.levelId,
        sceneId: currentSceneId || state.sceneId,
        checkpointSceneId: state.checkpointSceneId,
        decisions: state.decisions,
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
      if (!data || data.levelId !== LEVEL_ID) return null;
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
  }

  function updateMuteBtn() {
    dom.muteBtn.textContent = state.muted ? '🔇' : '🔊';
    dom.muteBtn.setAttribute('aria-label', state.muted ? 'Unmute sound' : 'Mute sound');
  }

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
    const sc = level.scenes[sceneId];
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
    ['screenTitle','screenStory','screenRules','screenDecision','screenGameover','screenWin'].forEach(k => {
      dom[k].classList.add('hidden');
    });
    const map = {
      title: dom.screenTitle,
      story: dom.screenStory,
      rules: dom.screenRules,
      decision: dom.screenDecision,
      gameover: dom.screenGameover,
      win: dom.screenWin,
    };
    if (map[name]) map[name].classList.remove('hidden');
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
    currentSceneId = sceneId;
    state.sceneId = sceneId;
    currentScene = level.scenes[sceneId];
    if (!currentScene) {
      console.error('Missing scene', sceneId);
      return;
    }
    // If this scene leads into a decision, mark it as checkpoint (retry point)
    if (currentScene.next && level.scenes[currentScene.next] && level.scenes[currentScene.next].type === 'decision') {
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
    if (sc.image) setBg(sc.image);

    const lines = sc.lines || [];
    for (let i = 0; i < lines.length; i++) {
      lineIndex = i;
      const line = lines[i];
      await showLine(line);
    }

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
    const urgent = decisionRemaining <= 2.1;
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

      if (decisionRemaining <= 2.1 && !heartbeatStarted) {
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
    setDangerPulse(false);
    lockChoices();

    const correct = !!choice.correct;
    recordDecision(sc, correct, decisionRemaining, choice.failTag);

    if (correct) {
      // Set checkpoint to the scene after the correct-dialogue scene
      const correctScene = level.scenes[sc.nextCorrect];
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
    setDangerPulse(false);
    lockChoices();
    recordDecision(sc, false, 0, 'timeout');
    triggerFailure(sc, 'timeout');
  }

  function triggerFailure(sc, failTag) {
    state.failed = true;
    state.failTag = failTag;
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
    const totalDecisions = 7; // Level 1 has 7 decisions
    let correctCount = 0;
    let scoreSum = 0;
    decisions.forEach(d => {
      if (d.correct) {
        correctCount++;
        const t = d.total || 5;
        const ratio = Math.max(0, Math.min(1, d.timeLeft / t));
        // 70 base + up to 30 for speed
        scoreSum += 70 + Math.round(ratio * 30);
      }
    });
    // Normalize over 7 decisions
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
    flashRed(500);
    shakeScreen();

    const { score, correctCount, totalDecisions } = calcTruthScore();
    dom.scoreValue.textContent = String(score);
    dom.scoreDetail.textContent = `${correctCount}/${totalDecisions} correct • ${score >= 70 ? 'So close.' : score >= 40 ? 'The house got you.' : 'The night swallowed you whole.'}`;
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
    dom.winScoreDetail.textContent = `${correctCount}/${totalDecisions} correct • ${score === 100 ? 'Perfect liar. Mrs. Okonkwo would be proud.' : score >= 80 ? 'Sharp memory. Steady nerves.' : 'You survived... barely.'}`;
    animateScoreRing(dom.winScoreRingFg, score);
  }

  // ============================
  // SHARE
  // ============================
  function getShareText() {
    const { score, correctCount, totalDecisions } = calcTruthScore();
    const survived = state.completed && !state.failed;
    if (survived) {
      return `I survived The Night Nanny in The Liar's Game! Truth Score: ${score}/100 (${correctCount}/${totalDecisions} correct). Can you survive 7 hours in a Lagos mansion?`;
    }
    return `I got a Truth Score of ${score}/100 (${correctCount}/${totalDecisions} correct) in The Liar's Game: The Night Nanny. I wasn't good enough to be a liar... yet. Can you do better?`;
  }

  async function shareScore(btn) {
    const text = getShareText();
    const shareData = {
      title: "The Liar's Game — The Night Nanny",
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
    // Remove the last failed decision record (the one that caused failure)
    // Keep correct ones; failed decisions are fine to clear so score reflects retry path.
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
    goToScene(level.startScene);
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
      state.checkpointSceneId = saved.checkpointSceneId || level.startScene;
      state.decisions = saved.decisions || {};
      state.completed = !!saved.completed;
      state.sceneId = saved.sceneId || state.checkpointSceneId;
      // If they were mid-failure/gameover, resume at checkpoint
      const resumeTarget = (saved.sceneId === 'game_over' || level.scenes[saved.sceneId]?.type === 'failure_sequence')
        ? state.checkpointSceneId
        : (saved.sceneId || state.checkpointSceneId);
      preloadScene(resumeTarget, 2);
      goToScene(resumeTarget);
    } else if (saved && saved.completed) {
      // Let them replay from title, but keep it simple
      preloadScene(level.startScene, 2);
      goToScene(level.startScene);
    } else {
      preloadScene(level.startScene, 2);
      goToScene(level.startScene);
    }
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
