'use strict';
/* ============================================================
   PUSH TO ESCAPE — core game
   Single-file engine: logic + rendering (Canvas) + audio + input.
   All tuning lives in CONFIG below — edit there to rebalance.
   ============================================================ */

// ---------- CONFIG (tune here) ----------
const CONFIG = {
  // Signal timing (seconds)
  GREEN_DURATION: 2.5,      // solid green: pushing allowed
  BLINK_DURATION: 0.8,      // blinking green: warning, release now
  RED_DURATION: 1.2,        // red: pushing forbidden

  // Wall / escape
  WALL_SPEED: 150,          // world units/sec while pushing (green/blink)
  ESCAPE_DISTANCE: 950,     // wall must travel this far to reach escape
  WALL_START_X: 260,
  BRICK_SIZE: 28,
  WALL_BRICKS_X: 6,
  WALL_BRICKS_Y: 4,

  // Water
  WATER_RISE_SPEED: 4.2,    // world units/sec at start
  WATER_RISE_ACCEL: 0.08,   // extra units/sec^2 (gets more threatening)
  WATER_DANGER_HEIGHT: 65,  // water height above ground that catches character
  WATER_WAVE_DETAIL: 8,      // surface sampling step in CSS pixels; raise for low-end devices
  MAX_PARTICLES: 100,        // shared cap for dust, water droplets and confetti
  WATER_SPLASH_INTERVAL: 1.25, // base seconds between wall-contact splashes

  // World / character
  WORLD_H: 540,
  GROUND_Y: 460,            // top of ground in world coords
  CHARACTER_H: 72,
  CHARACTER_W: 34,

  // Feel
  SHAKE_MAG: 3,             // px screen shake while pushing
  MAX_DT: 0.05,             // clamp delta to avoid physics jumps
};
if (typeof globalThis !== 'undefined') globalThis.PUSH_TO_ESCAPE_CONFIG = CONFIG;

// ---------- Pure helpers (also used by tests) ----------
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

// Signal state machine — pure transition function.
// Returns next state given current state. Timing handled by caller.
function nextSignalState(current) {
  if (current === 'green') return 'blink';
  if (current === 'blink') return 'red';
  if (current === 'red') return 'green';
  return 'green';
}
function signalDuration(state) {
  if (state === 'green') return CONFIG.GREEN_DURATION;
  if (state === 'blink') return CONFIG.BLINK_DURATION;
  if (state === 'red') return CONFIG.RED_DURATION;
  return CONFIG.GREEN_DURATION;
}
// Can the player push in this signal state? (blink still allowed, but risky)
function canPushInState(state) { return state === 'green' || state === 'blink'; }
// Should pushing right now cause a loss? (red always; blink only at expiry — handled in update)
function isPushForbidden(state) { return state === 'red'; }

// Water height after t seconds (closed form, matches per-frame integration approx)
function waterHeightAt(t) {
  return CONFIG.WATER_RISE_SPEED * t + 0.5 * CONFIG.WATER_RISE_ACCEL * t * t;
}
// Push time needed to escape (perfect play, ignoring red waits)
function pushTimeNeeded() { return CONFIG.ESCAPE_DISTANCE / CONFIG.WALL_SPEED; }
// Total elapsed time with perfect rhythm (push during all green+blink windows)
function perfectPlayTime() {
  const cycle = CONFIG.GREEN_DURATION + CONFIG.BLINK_DURATION + CONFIG.RED_DURATION;
  const window = CONFIG.GREEN_DURATION + CONFIG.BLINK_DURATION;
  const need = pushTimeNeeded();
  const fullCycles = Math.floor(need / window);
  const rem = need - fullCycles * window;
  return fullCycles * cycle + rem;
}

// ---------- Audio (WebAudio, generated — no assets needed) ----------
const AudioEngine = {
  ctx: null, enabled: true, scrapeNodes: null, waterNodes: null,
  ensure() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    if (typeof window === 'undefined') return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    } catch (e) { this.ctx = null; }
  },
  tone(freq, dur, type, vol, when) {
    if (!this.ctx || !this.enabled) return;
    try {
      const t = this.ctx.currentTime + (when || 0);
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) {}
  },
  noise(dur, vol, freq) {
    if (!this.ctx || !this.enabled) return;
    try {
      const t = this.ctx.currentTime;
      const len = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource(); src.buffer = buf;
      const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 800;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol || 0.1, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(this.ctx.destination);
      src.start(t);
    } catch (e) {}
  },
  green() { this.tone(880, 0.15, 'sine', 0.18); this.tone(1320, 0.12, 'sine', 0.12, 0.06); },
  warn() { this.tone(1250, 0.09, 'square', 0.08); this.tone(1250, 0.09, 'square', 0.08, 0.14); },
  red() { this.tone(180, 0.35, 'sawtooth', 0.16); this.tone(140, 0.35, 'sawtooth', 0.12, 0.05); },
  fail() { this.tone(400, 0.5, 'sawtooth', 0.16); this.tone(200, 0.7, 'sawtooth', 0.14, 0.15); this.noise(0.4, 0.12, 500); },
  win() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.16, i * 0.12)); },
  splash() { this.noise(0.5, 0.14, 900); },
  startScrape() {
    if (!this.ctx || !this.enabled || this.scrapeNodes) return;
    try {
      const len = this.ctx.sampleRate * 1;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 300; f.Q.value = 0.6;
      const g = this.ctx.createGain(); g.gain.value = 0.05;
      src.connect(f); f.connect(g); g.connect(this.ctx.destination); src.start();
      this.scrapeNodes = { src, g };
    } catch (e) {}
  },
  stopScrape() {
    if (this.scrapeNodes) { try { this.scrapeNodes.src.stop(); } catch (e) {} this.scrapeNodes = null; }
  },
  waterImpact(danger) { this.noise(0.14 + danger * 0.13, 0.012 + danger * 0.025, 650 + danger * 400); },
  setWaterIntensity(danger) {
    if (!this.ctx || !this.waterNodes || !this.enabled) return;
    const { g, f } = this.waterNodes;
    // Smoothly blend the same looping water bed instead of spawning audio each frame.
    g.gain.setTargetAtTime(0.012 + danger * 0.045, this.ctx.currentTime, 0.25);
    f.frequency.setTargetAtTime(260 + danger * 650, this.ctx.currentTime, 0.25);
  },
  startWater() {
    if (!this.ctx || !this.enabled || this.waterNodes) return;
    try {
      const len = this.ctx.sampleRate * 2;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400;
      const g = this.ctx.createGain(); g.gain.value = 0.025;
      src.connect(f); f.connect(g); g.connect(this.ctx.destination); src.start();
      this.waterNodes = { src, g, f };
    } catch (e) {}
  },
  stopWater() {
    if (this.waterNodes) { try { this.waterNodes.src.stop(); } catch (e) {} this.waterNodes = null; }
  },
  setEnabled(on) {
    this.enabled = on;
    if (!on) { this.stopScrape(); this.stopWater(); }
  }
};

// ---------- Game state ----------
const Game = {
  mode: 'menu', // menu | playing | paused | gameover | victory
  signal: 'green',
  signalTimer: CONFIG.GREEN_DURATION,
  pushing: false,
  wallX: CONFIG.WALL_START_X,
  waterHeight: 0,
  waterSpeed: CONFIG.WATER_RISE_SPEED,
  waterClock: 0,
  splashTimer: 0.8,
  impact: 0,
  time: 0,
  walkCycle: 0,
  pushHoldTime: 0,
  shakeTime: 0,
  failReason: null,
  failTimer: 0,
  winTimer: 0,
  particles: [],
  camX: 0,
  muted: false,
  started: false,
};

function resetGame() {
  Game.mode = 'playing';
  Game.signal = 'green';
  Game.signalTimer = CONFIG.GREEN_DURATION;
  Game.pushing = false;
  Game.wallX = CONFIG.WALL_START_X;
  Game.waterHeight = 0;
  Game.waterSpeed = CONFIG.WATER_RISE_SPEED;
  Game.waterClock = 0;
  Game.splashTimer = 0.8;
  Game.impact = 0;
  Game.time = 0;
  Game.walkCycle = 0;
  Game.pushHoldTime = 0;
  Game.shakeTime = 0;
  Game.failReason = null;
  Game.failTimer = 0;
  Game.winTimer = 0;
  Game.particles = [];
  Game.camX = 0;
  Game.started = true;
}

function characterX() { return Game.wallX - CONFIG.CHARACTER_W - 6; }
function escapeX() { return CONFIG.WALL_START_X + CONFIG.ESCAPE_DISTANCE; }
function progress() { return clamp((Game.wallX - CONFIG.WALL_START_X) / CONFIG.ESCAPE_DISTANCE, 0, 1); }
function waterDanger() { return clamp(Game.waterHeight / CONFIG.WATER_DANGER_HEIGHT, 0, 1); }

// ---------- Particles ----------
function spawnDust(x, y) {
  for (let i = 0; i < 2 && Game.particles.length < CONFIG.MAX_PARTICLES; i++) {
    Game.particles.push({
      x: x + Math.random() * 20 - 10, y: y - Math.random() * 6,
      vx: -30 - Math.random() * 40, vy: -20 - Math.random() * 30,
      life: 0.5 + Math.random() * 0.4, maxLife: 0.9,
      size: 2 + Math.random() * 3, color: 'rgba(200,180,150,',
    });
  }
}
function spawnSplash(x, y, count = 6) {
  for (let i = 0; i < count && Game.particles.length < CONFIG.MAX_PARTICLES; i++) {
    Game.particles.push({
      x: Math.min(x, Game.wallX - 2), y, vx: -Math.random() * 60, vy: -30 - Math.random() * 70,
      life: 0.5, maxLife: 0.5, size: 1.5 + Math.random() * 2, color: 'rgba(190,245,255,', water: true,
    });
  }
}
function spawnConfetti(x, y) {
  const cols = ['#2ecc71', '#f1c40f', '#3498db', '#e74c3c', '#fff'];
  for (let i = 0; i < 40 && Game.particles.length < CONFIG.MAX_PARTICLES; i++) {
    Game.particles.push({
      x, y, vx: (Math.random() - 0.5) * 220, vy: -80 - Math.random() * 160,
      life: 1.2 + Math.random(), maxLife: 2, size: 3 + Math.random() * 3,
      color: cols[i % cols.length], confetti: true,
    });
  }
}
function updateParticles(dt) {
  for (let i = Game.particles.length - 1; i >= 0; i--) {
    const p = Game.particles[i];
    p.life -= dt;
    if (p.life <= 0) { Game.particles.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    // Droplets bounce off the solid left face; ground absorbs them.
    if (p.water && (p.x >= Game.wallX || p.y >= CONFIG.GROUND_Y)) {
      Game.particles.splice(i, 1); continue;
    }
    p.vy += (p.confetti ? 180 : 120) * dt;
  }
}

// ---------- Core update (logic separated from rendering) ----------
function update(dt) {
  if (Game.mode !== 'playing') {
    // Still animate particles / fail-win timers in end states
    if (Game.mode !== 'paused') { Game.waterClock += dt; updateParticles(dt); }
    if (Game.mode === 'gameover' && Game.failTimer > 0) { Game.failTimer -= dt; if (Game.failTimer <= 0) showGameOver(Game.failReason); }
    if (Game.mode === 'victory' && Game.winTimer > 0) { Game.winTimer -= dt; if (Game.winTimer <= 0) showVictory(); }
    return;
  }

  Game.time += dt;

  // --- Signal machine ---
  Game.signalTimer -= dt;
  if (Game.signalTimer <= 0) {
    const prev = Game.signal;
    const next = nextSignalState(prev);
    // Blink expiry while still pushing = loss (must release during blink)
    if (prev === 'blink' && Game.pushing) {
      triggerFail('blink');
      return;
    }
    Game.signal = next;
    Game.signalTimer = signalDuration(next);
    if (next === 'blink') { AudioEngine.warn(); showToast('RELEASE!'); }
    if (next === 'red') { AudioEngine.red(); showToast('STOP!'); }
    if (next === 'green') { AudioEngine.green(); showToast('PUSH!'); }
  }

  // --- Red rule: any pushing during red = immediate loss ---
  // This also catches holding across green->blink->red without releasing.
  if (isPushForbidden(Game.signal) && Game.pushing) {
    triggerFail('red');
    return;
  }

  // --- Wall movement (only while pushing in green/blink) ---
  const isPushingNow = Game.pushing && canPushInState(Game.signal);
  if (isPushingNow) {
    Game.wallX += CONFIG.WALL_SPEED * dt;
    Game.walkCycle += dt * 10;
    Game.pushHoldTime += dt;
    Game.shakeTime = 0.08;
    spawnDust(Game.wallX, CONFIG.GROUND_Y);
    AudioEngine.startScrape();
    // Win check
    if (Game.wallX >= escapeX()) {
      triggerWin();
      return;
    }
  } else {
    Game.pushHoldTime = 0;
    AudioEngine.stopScrape();
  }

  // --- Water rises continuously (even when waiting) ---
  Game.waterSpeed += CONFIG.WATER_RISE_ACCEL * dt;
  Game.waterHeight += Game.waterSpeed * dt;
  // The flood presses against the wall's solid left face. Visual effects are
  // bounded separately from the authoritative water-height failure rule.
  Game.waterClock += dt;
  Game.impact = Math.max(0, Game.impact - dt * 2.2);
  Game.splashTimer -= dt;
  AudioEngine.setWaterIntensity(waterDanger());
  if (Game.splashTimer <= 0 && Game.waterHeight > 2) {
    const danger = waterDanger();
    spawnSplash(Game.wallX - 3, CONFIG.GROUND_Y - Game.waterHeight, 2 + Math.floor(danger * 5));
    Game.impact = 0.45 + danger * 0.55;
    if (danger > 0.3) AudioEngine.waterImpact(danger);
    Game.splashTimer = CONFIG.WATER_SPLASH_INTERVAL - danger * 0.7 + Math.random() * 0.35;
  }
  if (Game.waterHeight >= CONFIG.WATER_DANGER_HEIGHT) {
    triggerFail('water');
    return;
  }

  if (Game.shakeTime > 0) Game.shakeTime -= dt;
  updateParticles(dt);
}

function triggerFail(reason) {
  Game.mode = 'gameover';
  Game.failReason = reason;
  Game.failTimer = reason === 'water' ? 1.6 : 1.0;
  Game.pushing = false;
  AudioEngine.stopScrape();
  AudioEngine.stopWater();
  AudioEngine.fail();
  if (reason === 'water') { spawnSplash(Game.wallX - 3, CONFIG.GROUND_Y - Game.waterHeight, 24); Game.impact = 1; AudioEngine.splash(); }
  // Let the failure animation play before showing the results.
}

function triggerWin() {
  Game.mode = 'victory';
  Game.winTimer = 1.2;
  Game.pushing = false;
  Game.wallX = escapeX();
  AudioEngine.stopScrape();
  AudioEngine.stopWater();
  AudioEngine.win();
  spawnConfetti(characterX() + 20, CONFIG.GROUND_Y - 120);
  // Let the jump and confetti play before showing the results.
}

// ---------- Rendering ----------
let canvas = null, ctx = null, cssW = 0, cssH = 0, dpr = 1, scaleF = 1;
let backgroundArt = null;

function resize() {
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const r = wrap.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cssW = Math.max(280, r.width);
  cssH = Math.max(200, r.height);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  scaleF = cssH / CONFIG.WORLD_H;
}

function worldToScreenX(wx) { return (wx - Game.camX) * scaleF; }

function drawBackground() {
  ctx.fillStyle = '#14242d'; ctx.fillRect(0, 0, cssW, cssH);
  if (backgroundArt && backgroundArt.complete && backgroundArt.naturalWidth) {
    // Cover the viewport, with a gentle parallax drift that stays inside the image.
    const iw = backgroundArt.naturalWidth, ih = backgroundArt.naturalHeight;
    const zoom = Math.max(cssW / iw, cssH / ih) * 1.12;
    const w = iw * zoom, h = ih * zoom;
    const drift = (0.5 + 0.5 * Math.sin(Game.camX * 0.001)) * Math.max(0, w - cssW);
    ctx.drawImage(backgroundArt, -drift, (cssH - h) * 0.63, w, h);
  }
  // Atmospheric veil separates play objects from background detail.
  const fog = ctx.createLinearGradient(0, 0, 0, cssH);
  fog.addColorStop(0, 'rgba(5,14,23,.22)');
  fog.addColorStop(.65, 'rgba(17,37,45,.14)');
  fog.addColorStop(1, 'rgba(4,13,18,.60)');
  ctx.fillStyle = fog; ctx.fillRect(0, 0, cssW, cssH);
}

function drawGround() {
  const gy = CONFIG.GROUND_Y * scaleF;
  const g = ctx.createLinearGradient(0, gy, 0, cssH);
  g.addColorStop(0, '#4c5b5a'); g.addColorStop(.16, '#263a3d'); g.addColorStop(1, '#0d1b22');
  ctx.fillStyle = g; ctx.fillRect(0, gy, cssW, cssH - gy);
  ctx.fillStyle = '#82918a'; ctx.fillRect(0, gy, cssW, 3 * scaleF);
  ctx.fillStyle = '#172a31'; ctx.fillRect(0, gy + 5 * scaleF, cssW, 5 * scaleF);
  const off = (Game.camX * scaleF) % (65 * scaleF);
  ctx.strokeStyle = 'rgba(153,198,197,.19)'; ctx.lineWidth = 1;
  for (let x = -off; x < cssW + 65 * scaleF; x += 65 * scaleF) {
    ctx.beginPath(); ctx.moveTo(x, gy + 12 * scaleF); ctx.lineTo(x - 13 * scaleF, cssH); ctx.stroke();
    ctx.fillStyle = 'rgba(211,221,200,.35)'; ctx.beginPath(); ctx.arc(x + 9 * scaleF, gy + 8 * scaleF, 1.2 * scaleF, 0, 7); ctx.fill();
  }
}

function drawEscape() {
  const ex = worldToScreenX(escapeX());
  const gy = CONFIG.GROUND_Y * scaleF;
  const pw = 150 * scaleF, ph = 26 * scaleF;
  // Platform
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(ex, gy - ph, pw, ph);
  ctx.fillStyle = '#27ae60';
  ctx.fillRect(ex, gy - ph, pw, 6 * scaleF);
  // Steps
  ctx.fillStyle = '#7a6248';
  for (let i = 0; i < 3; i++) ctx.fillRect(ex + 10 * scaleF + i * 18 * scaleF, gy - ph - (i + 1) * 10 * scaleF, 30 * scaleF, 10 * scaleF);
  // Flag pole + flag
  ctx.strokeStyle = '#eee'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(ex + 30 * scaleF, gy - ph); ctx.lineTo(ex + 30 * scaleF, gy - ph - 90 * scaleF); ctx.stroke();
  ctx.fillStyle = '#2ecc71';
  ctx.beginPath();
  ctx.moveTo(ex + 30 * scaleF, gy - ph - 90 * scaleF);
  ctx.lineTo(ex + 70 * scaleF, gy - ph - 78 * scaleF);
  ctx.lineTo(ex + 30 * scaleF, gy - ph - 66 * scaleF);
  ctx.closePath(); ctx.fill();
  // Sign
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(ex + 55 * scaleF, gy - ph - 52 * scaleF, 80 * scaleF, 26 * scaleF);
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${13 * scaleF}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ESCAPE', ex + 95 * scaleF, gy - ph - 34 * scaleF);
  // Glow when close
  const p = progress();
  if (p > 0.75) {
    ctx.fillStyle = `rgba(46,204,113,${0.12 + 0.08 * Math.sin(Game.time * 6)})`;
    ctx.fillRect(ex - 10 * scaleF, gy - ph - 100 * scaleF, pw + 20 * scaleF, 100 * scaleF);
  }
}

function drawWall() {
  const wx = worldToScreenX(Game.wallX);
  const gy = CONFIG.GROUND_Y * scaleF;
  const bs = CONFIG.BRICK_SIZE * scaleF;
  const wobble = (Game.pushing && canPushInState(Game.signal) && Game.mode === 'playing')
    ? Math.sin(Game.time * 30) * 1.2 : 0;
  const colors = ['#aa5e40', '#bd7651', '#a6533b', '#c47d55', '#9c5740', '#b86a48'];
  ctx.fillStyle = '#243137';
  ctx.fillRect(wx - 3 * scaleF, gy - CONFIG.WALL_BRICKS_Y * bs - 3 * scaleF, CONFIG.WALL_BRICKS_X * bs + 6 * scaleF, CONFIG.WALL_BRICKS_Y * bs + 3 * scaleF);
  for (let row = 0; row < CONFIG.WALL_BRICKS_Y; row++) {
    for (let col = 0; col < CONFIG.WALL_BRICKS_X; col++) {
      const bx = wx + col * bs;
      const by = gy - (row + 1) * bs + wobble * (row === 0 ? 1 : 0.3);
      const c = colors[(row * CONFIG.WALL_BRICKS_X + col) % colors.length];
      ctx.fillStyle = c;
      ctx.fillRect(bx + 1.5, by + 1.5, bs - 3, bs - 3);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(bx + 1, by + 1, bs - 2, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(bx + 1, by + bs - 5, bs - 2, 4);
      ctx.fillStyle = 'rgba(56,29,24,.26)';
      ctx.fillRect(bx + 4 * scaleF, by + (8 + (row + col) % 5) * scaleF, 8 * scaleF, 1 * scaleF);
      ctx.fillRect(bx + 15 * scaleF, by + 17 * scaleF, 5 * scaleF, 1 * scaleF);
    }
  }
  // A riveted steel border makes the masonry read as one heavy structure.
  ctx.fillStyle = '#29393b'; ctx.fillRect(wx - 4 * scaleF, gy - CONFIG.WALL_BRICKS_Y * bs, 4 * scaleF, CONFIG.WALL_BRICKS_Y * bs);
  ctx.fillRect(wx, gy - CONFIG.WALL_BRICKS_Y * bs - 3 * scaleF, CONFIG.WALL_BRICKS_X * bs, 4 * scaleF);
  ctx.fillStyle = '#b5c3b4';
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(wx - 2 * scaleF, gy - (12 + 28 * i) * scaleF, 1.1 * scaleF, 0, 7); ctx.fill(); }
  // Mortar outline
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(wx, gy - CONFIG.WALL_BRICKS_Y * bs, CONFIG.WALL_BRICKS_X * bs, CONFIG.WALL_BRICKS_Y * bs);
  // Push impact lines when pushing
  if (Game.pushing && Game.mode === 'playing') {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const ly = gy - 30 * scaleF - i * 22 * scaleF;
      ctx.beginPath(); ctx.moveTo(wx - 8 * scaleF, ly); ctx.lineTo(wx - 20 * scaleF, ly - 6); ctx.stroke();
    }
  }
}

function drawCharacter() {
  // During victory the character leaps over the wall onto the escape platform.
  const victoryT = Game.mode === 'victory' ? clamp(1 - Game.winTimer / 1.2, 0, 1) : 0;
  const cx = worldToScreenX(Game.mode === 'victory' ? lerp(characterX(), escapeX() + 45, victoryT) : characterX());
  const gy = CONFIG.GROUND_Y * scaleF;
  const s = scaleF;
  // Enlarge the hero around his planted feet without changing world position.
  ctx.save(); ctx.translate(cx, gy); ctx.scale(1.28, 1.28); ctx.translate(-cx, -gy);
  const isPushing = Game.pushing && canPushInState(Game.signal) && Game.mode === 'playing';
  const isWalking = isPushing;
  const isWarning = Game.signal === 'blink' && Game.mode === 'playing';
  const isDrowning = Game.mode === 'gameover' && Game.failReason === 'water';
  const isVictory = Game.mode === 'victory';

  let bob = 0, lean = 0, armMode = 'down', legSwing = 0;
  if (isPushing) { bob = Math.sin(Game.walkCycle * 2) * 2 * s; lean = 0.28; armMode = 'push'; legSwing = Math.sin(Game.walkCycle) * 10 * s; }
  else if (isWarning) { bob = Math.sin(Game.time * 12) * 1.5 * s; lean = -0.08; armMode = 'up'; }
  else if (isDrowning) { bob = (1 - Math.max(0, Game.failTimer) / 1.6) * 24 * s; lean = 0.15; armMode = 'flail'; }
  else if (isVictory) { bob = -Math.sin(victoryT * Math.PI) * 105 * s; lean = -0.05; armMode = 'up'; }
  else { bob = Math.sin(Game.time * 2.2) * 1.2 * s; lean = 0.02; armMode = 'down'; }

  // Struggling shake when holding long
  const struggle = isPushing && (Game.pushHoldTime > 1.4 || waterDanger() > 0.72) ? Math.sin(Game.time * 40) * 1.5 * s : 0;

  const hipY = gy - 30 * s + bob;
  const shoulderY = gy - 52 * s + bob;
  const headY = gy - 64 * s + bob;
  const ox = cx + struggle;

  ctx.save();
  // Rotate around the character's hips, not the canvas origin.
  ctx.translate(ox, hipY);
  ctx.rotate(lean * 0.4);
  ctx.translate(0, -hipY);

  // Legs
  ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 7 * s; ctx.lineCap = 'round';
  const legA = isWalking ? legSwing : 4 * s;
  const legB = isWalking ? -legSwing : -4 * s;
  ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(legA, gy - 2 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(legB, gy - 2 * s); ctx.stroke();
  // Shoes
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(legA, gy - 2 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(legB, gy - 2 * s, 4 * s, 0, Math.PI * 2); ctx.fill();

  // Torso (shirt)
  ctx.fillStyle = '#e5a436';
  ctx.beginPath();
  ctx.roundRect(-9 * s, shoulderY, 18 * s, 24 * s, 6 * s);
  ctx.fill();
  // Safety jacket trim, collar and straps help the hero read against floodwater.
  ctx.fillStyle = '#ffe5a0'; ctx.fillRect(-8 * s, shoulderY + 14 * s, 16 * s, 2 * s);
  ctx.fillStyle = '#734321'; ctx.fillRect(-2 * s, shoulderY + 2 * s, 3 * s, 20 * s);
  ctx.fillStyle = '#edd3ad'; ctx.fillRect(-3 * s, shoulderY - 1 * s, 9 * s, 3 * s);

  // Arms
  ctx.strokeStyle = '#e67e22'; ctx.lineWidth = 6 * s;
  if (armMode === 'push') {
    // Both arms extended forward to wall
    ctx.beginPath(); ctx.moveTo(4 * s, shoulderY + 6 * s); ctx.lineTo(26 * s, shoulderY + 10 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2 * s, shoulderY + 12 * s); ctx.lineTo(24 * s, shoulderY + 16 * s); ctx.stroke();
    // Hands on wall
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath(); ctx.arc(27 * s, shoulderY + 10 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(25 * s, shoulderY + 16 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
  } else if (armMode === 'up') {
    ctx.beginPath(); ctx.moveTo(-4 * s, shoulderY + 4 * s); ctx.lineTo(-10 * s, shoulderY - 14 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4 * s, shoulderY + 4 * s); ctx.lineTo(10 * s, shoulderY - 14 * s); ctx.stroke();
  } else if (armMode === 'flail') {
    const f = Math.sin(Game.failTimer * 14) * 8 * s;
    ctx.beginPath(); ctx.moveTo(-4 * s, shoulderY + 4 * s); ctx.lineTo(-12 * s, shoulderY - 6 * s + f); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4 * s, shoulderY + 4 * s); ctx.lineTo(12 * s, shoulderY - 6 * s - f); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-4 * s, shoulderY + 4 * s); ctx.lineTo(-6 * s, hipY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4 * s, shoulderY + 4 * s); ctx.lineTo(6 * s, hipY); ctx.stroke();
  }

  // Head
  ctx.fillStyle = '#ffdbac';
  ctx.beginPath(); ctx.arc(2 * s, headY, 10 * s, 0, Math.PI * 2); ctx.fill();
  // Cap
  ctx.fillStyle = '#d75831';
  ctx.beginPath(); ctx.arc(2 * s, headY - 2 * s, 10 * s, Math.PI, 0); ctx.fill();
  ctx.fillRect(2 * s, headY - 3 * s, 12 * s, 3 * s);
  // Eye + mouth
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(6 * s, headY, 1.6 * s, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 1.4 * s;
  ctx.beginPath();
  if (isDrowning) ctx.arc(6 * s, headY + 5 * s, 3 * s, 0, Math.PI * 2);
  else if (isVictory) ctx.arc(6 * s, headY + 3 * s, 3.5 * s, 0, Math.PI);
  else ctx.moveTo(4 * s, headY + 5 * s); ctx.lineTo(9 * s, headY + 5 * s);
  ctx.stroke();

  // Sweat when struggling
  if (isPushing && Game.pushHoldTime > 1.4) {
    ctx.fillStyle = 'rgba(140,210,255,0.9)';
    ctx.beginPath(); ctx.arc(-6 * s, headY - 6 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Warning "!" above head during blink
  if (isWarning) {
    ctx.fillStyle = '#f1c40f';
    ctx.font = `900 ${22 * s}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('!', cx, headY - 18 * s + Math.sin(Game.time * 10) * 2);
  }
  ctx.restore();
}

// Water surface is a superposition of independent travelling waves in world
// coordinates. No fluid simulation: water is clipped at ground and wall face.
function waveOffset(worldX, t, danger) {
  const amp = 1 + danger * 2.5;
  return amp * (2.0 * Math.sin(worldX * 0.035 - t * 1.6)
    + 0.85 * Math.sin(worldX * 0.087 + t * 2.8)
    + 0.45 * Math.sin(worldX * 0.16 - t * 4.1));
}
function drawWater() {
  const s = scaleF, gy = CONFIG.GROUND_Y * s;
  const danger = waterDanger(), t = Game.waterClock;
  // Small visible base depth establishes the flood even at the start; only
  // Game.waterHeight governs the actual drowning condition.
  const baseY = gy - (Game.waterHeight + 5) * s;
  const wallX = worldToScreenX(Game.wallX);
  const right = Math.min(cssW, wallX);
  if (right <= 0 || gy <= baseY) return;
  const step = CONFIG.WATER_WAVE_DETAIL;
  const surface = x => Math.min(gy - 1, baseY + waveOffset(x / s + Game.camX, t, danger) * s);
  ctx.save();
  // Clip strictly above the ground and left of the wall face.
  ctx.beginPath(); ctx.rect(0, 0, right, gy); ctx.clip();
  ctx.beginPath(); ctx.moveTo(0, surface(0));
  for (let x = step; x < right; x += step) ctx.lineTo(x, surface(x));
  ctx.lineTo(right, surface(right)); ctx.lineTo(right, gy); ctx.lineTo(0, gy); ctx.closePath();
  const g = ctx.createLinearGradient(0, baseY - 8 * s, 0, gy + 1);
  g.addColorStop(0, 'rgba(170,246,255,.9)');
  g.addColorStop(0.16, 'rgba(60,197,218,.86)');
  g.addColorStop(0.52, 'rgba(15,113,163,.92)');
  g.addColorStop(1, 'rgba(5,48,104,.98)');
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  // Long moving reflection bands, suspended bubbles and a second wave layer.
  ctx.strokeStyle = 'rgba(153,237,247,.22)'; ctx.lineWidth = Math.max(1, 2 * s);
  for (let i = 0; i < 5; i++) {
    const y = baseY + (10 + i * 9) * s;
    ctx.beginPath();
    for (let x = 0; x <= right; x += step * 2) {
      const wy = y + Math.sin(x / s * .025 + t * (0.8 + i * .1) + i) * 2 * s;
      if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(220,255,255,.30)';
  for (let i = 0; i < 14; i++) {
    const x = ((i * 79 + t * (8 + i % 4) * s) % (right + 25)) - 10;
    const y = gy - ((i * 13 + t * (5 + i % 3)) % Math.max(1, (gy - baseY) / s)) * s;
    ctx.beginPath(); ctx.arc(x, y, (i % 3 === 0 ? 1.5 : .8) * s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // Crest line and broken foam strokes, stronger at critical water levels.
  ctx.strokeStyle = 'rgba(211,255,255,.85)'; ctx.lineWidth = Math.max(1, (1.3 + danger) * s);
  ctx.beginPath(); ctx.moveTo(0, surface(0));
  for (let x = step; x < right; x += step) ctx.lineTo(x, surface(x));
  ctx.lineTo(right, surface(right)); ctx.stroke();
  ctx.strokeStyle = 'rgba(245,255,255,.68)'; ctx.lineWidth = Math.max(1, 2 * s);
  for (let i = 0; i < 7; i++) {
    let x = ((i * 73 + t * (13 + danger * 20) * s) % (right + 40)) - 20;
    let len = (9 + danger * 14 + (i % 3) * 4) * s;
    ctx.beginPath(); ctx.moveTo(x, surface(x) + 3 * s); ctx.lineTo(x + len, surface(x + len) + 3 * s); ctx.stroke();
  }
  // Water piling against the masonry face, never inside its geometry.
  if (wallX <= cssW && wallX > 0) {
    const y = surface(right);
    ctx.fillStyle = `rgba(223,255,255,${0.38 + Game.impact * 0.42})`;
    ctx.beginPath(); ctx.ellipse(right - 3 * s, y + 2 * s, 4 * s, (4 + Game.impact * 9) * s, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawParticles() {
  for (const p of Game.particles) {
    const a = clamp(p.life / p.maxLife, 0, 1);
    const x = worldToScreenX(p.x), y = p.y * scaleF;
    if (p.confetti) {
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(x, y, p.size * scaleF, p.size * scaleF * 0.6);
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = p.color + (a * 0.8) + ')';
      ctx.beginPath(); ctx.arc(x, y, p.size * scaleF, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function render() {
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Camera follows character (keep character ~35% from left)
  const viewWorldW = cssW / scaleF;
  const targetCam = clamp(characterX() - viewWorldW * 0.35, -80, Math.max(-80, escapeX() + 200 - viewWorldW));
  Game.camX = lerp(Game.camX, targetCam, 0.12);

  // Screen shake
  let sx = 0, sy = 0;
  if (Game.shakeTime > 0 || (waterDanger() > 0.8 && Game.impact > 0.5)) {
    sx = (Math.random() - 0.5) * CONFIG.SHAKE_MAG;
    sy = (Math.random() - 0.5) * CONFIG.SHAKE_MAG * 0.6;
  }
  ctx.translate(sx, sy);

  drawBackground();
  drawGround();
  drawEscape();
  drawWall();
  drawWater();
  drawCharacter();
  drawParticles();

  // Vignette
  const vg = ctx.createRadialGradient(cssW / 2, cssH / 2, cssH * 0.4, cssW / 2, cssH / 2, cssH * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, cssW, cssH);
}

// ---------- HUD / DOM ----------
let els = {};
function cacheEls() {
  els = {
    signalBox: document.getElementById('signal-box'),
    signalDot: document.getElementById('signal-dot'),
    signalText: document.getElementById('signal-text'),
    signalSub: document.getElementById('signal-sub'),
    progressFill: document.getElementById('progress-fill'),
    progressPct: document.getElementById('progress-pct'),
    waterFill: document.getElementById('water-fill'),
    waterPct: document.getElementById('water-pct'),
    hudTime: document.getElementById('hud-time'),
    hudDist: document.getElementById('hud-dist'),
    pushBtn: document.getElementById('push-btn'),
    pushLabel: document.getElementById('push-btn-label'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlay-title'),
    overlayMsg: document.getElementById('overlay-msg'),
    overlayStats: document.getElementById('overlay-stats'),
    overlayBtn: document.getElementById('overlay-btn'),
    pauseOverlay: document.getElementById('pause-overlay'),
    toast: document.getElementById('toast'),
    muteBtn: document.getElementById('btn-mute'),
    pauseBtn: document.getElementById('btn-pause'),
    restartBtn: document.getElementById('btn-restart'),
    resumeBtn: document.getElementById('resume-btn'),
    pauseRestartBtn: document.getElementById('pause-restart-btn'),
  };
}

let toastTimer = null;
function showToast(msg) {
  if (!els.toast) return;
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 900);
}

function updateHUD() {
  if (!els.signalBox) return;
  // Signal
  els.signalBox.className = '';
  if (Game.signal === 'green') {
    els.signalBox.classList.add('signal-green');
    els.signalDot.textContent = '●';
    els.signalText.textContent = 'PUSH';
    els.signalSub.textContent = 'Hold to push';
    els.pushBtn.classList.remove('danger', 'wait');
    els.pushLabel.textContent = Game.pushing ? 'PUSHING…' : 'HOLD TO PUSH';
  } else if (Game.signal === 'blink') {
    els.signalBox.classList.add('signal-blink');
    els.signalDot.textContent = '●';
    els.signalText.textContent = 'RELEASE!';
    els.signalSub.textContent = 'Let go NOW';
    els.pushBtn.classList.add('wait');
    els.pushBtn.classList.remove('danger');
    els.pushLabel.textContent = 'RELEASE!';
  } else {
    els.signalBox.classList.add('signal-red');
    els.signalDot.textContent = '●';
    els.signalText.textContent = 'STOP';
    els.signalSub.textContent = 'Do not push';
    els.pushBtn.classList.add('danger');
    els.pushBtn.classList.remove('wait');
    els.pushLabel.textContent = 'STOP — WAIT';
  }
  els.pushBtn.classList.toggle('pushing', Game.pushing && Game.mode === 'playing');

  // Meters
  const p = Math.round(progress() * 100);
  els.progressFill.style.width = p + '%';
  els.progressPct.textContent = p + '%';
  const w = Math.round(waterDanger() * 100);
  els.waterFill.style.width = w + '%';
  els.waterPct.textContent = w + '%';
  els.hudTime.textContent = 'TIME ' + Game.time.toFixed(1) + 's';
  els.hudDist.textContent = 'Wall ' + Math.round(Game.wallX - CONFIG.WALL_START_X) + 'm / ' + CONFIG.ESCAPE_DISTANCE + 'm';
}

function showGameOver(reason) {
  if (!els.overlay) return;
  const msgs = {
    red: 'You pushed on RED. The wall locks… and the water takes you.',
    blink: 'You held too long — the blink ended while you were still pushing!',
    water: 'The water caught you. Push faster next time — obey the signal, but keep moving!',
  };
  els.overlayTitle.textContent = reason === 'water' ? 'THE FLOOD WON' : 'CAUGHT!';
  els.overlayMsg.textContent = msgs[reason] || msgs.water;
  document.getElementById('overlay-rules').style.display = 'none';
  els.overlayStats.textContent =
    `Time: ${Game.time.toFixed(1)}s  •  Progress: ${Math.round(progress() * 100)}%  •  Water: ${Math.round(waterDanger() * 100)}%`;
  els.overlayBtn.textContent = '↻ TRY AGAIN';
  els.overlay.classList.remove('hidden');
}

function showVictory() {
  if (!els.overlay) return;
  const score = Math.max(0, Math.round(1000 - Game.time * 20 + (1 - waterDanger()) * 500));
  els.overlayTitle.textContent = 'YOU ESCAPED!';
  els.overlayMsg.textContent = 'You pushed the wall to safety and jumped to freedom. Great rhythm!';
  document.getElementById('overlay-rules').style.display = 'none';
  els.overlayStats.textContent =
    `Time: ${Game.time.toFixed(1)}s  •  Score: ${score}  •  Water margin: ${Math.round((1 - waterDanger()) * 100)}%`;
  els.overlayBtn.textContent = '▶ PLAY AGAIN';
  els.overlay.classList.remove('hidden');
}

function showMenu() {
  if (!els.overlay) return;
  document.getElementById('overlay-rules').style.display = '';
  els.overlayTitle.textContent = 'PUSH TO ESCAPE';
  els.overlayMsg.textContent = 'The water is rising! Push the brick wall to the escape platform.';
  els.overlayStats.textContent = '';
  els.overlayBtn.textContent = 'START RUN →';
  els.overlay.classList.remove('hidden');
}

function hideOverlays() {
  if (els.overlay) els.overlay.classList.add('hidden');
  if (els.pauseOverlay) els.pauseOverlay.classList.add('hidden');
}

// ---------- Input ----------
function setPush(on) {
  if (Game.mode !== 'playing') { Game.pushing = false; return; }
  Game.pushing = !!on;
  if (on) { AudioEngine.ensure(); if (isPushForbidden(Game.signal)) triggerFail('red'); }
}

function pauseGame() {
  if (Game.mode !== 'playing') return;
  Game.mode = 'paused';
  Game.pushing = false;
  AudioEngine.stopScrape();
  AudioEngine.stopWater();
  if (els.pauseOverlay) els.pauseOverlay.classList.remove('hidden');
}
function resumeGame() {
  if (Game.mode !== 'paused') return;
  Game.mode = 'playing';
  hideOverlays();
  AudioEngine.ensure();
  AudioEngine.startWater();
}
function startGame() {
  AudioEngine.ensure();
  resetGame();
  hideOverlays();
  AudioEngine.green();
  AudioEngine.startWater();
  showToast('PUSH!');
}

function bindInput() {
  // Pointer capture ensures lifting outside the button still releases the input.
  for (const target of [els.pushBtn, canvas]) {
    target.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || Game.mode !== 'playing') return;
      e.preventDefault();
      if (target.setPointerCapture) target.setPointerCapture(e.pointerId);
      setPush(true);
    });
    target.addEventListener('pointerup', () => setPush(false));
    target.addEventListener('pointercancel', () => setPush(false));
    target.addEventListener('lostpointercapture', () => setPush(false));
    target.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) {
        if (Game.mode === 'menu' || Game.mode === 'gameover' || Game.mode === 'victory') startGame();
        else setPush(true);
      }
    }
    if (e.code === 'KeyP') { if (Game.mode === 'playing') pauseGame(); else if (Game.mode === 'paused') resumeGame(); }
    if (e.code === 'KeyR') startGame();
    if (e.code === 'KeyM') toggleMute();
    if (e.code === 'Enter' && Game.mode !== 'playing' && Game.mode !== 'paused') startGame();
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') { e.preventDefault(); setPush(false); }
  });

  // Safety: release on blur / hidden
  window.addEventListener('blur', () => { setPush(false); if (Game.mode === 'playing') pauseGame(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { setPush(false); if (Game.mode === 'playing') pauseGame(); }
  });

  // Buttons
  els.overlayBtn.addEventListener('click', startGame);
  els.pauseBtn.addEventListener('click', () => { if (Game.mode === 'playing') pauseGame(); else if (Game.mode === 'paused') resumeGame(); });
  els.restartBtn.addEventListener('click', startGame);
  els.resumeBtn.addEventListener('click', resumeGame);
  els.pauseRestartBtn.addEventListener('click', startGame);
  els.muteBtn.addEventListener('click', toggleMute);
}

function toggleMute() {
  Game.muted = !Game.muted;
  AudioEngine.setEnabled(!Game.muted);
  if (!Game.muted && Game.mode === 'playing') { AudioEngine.ensure(); AudioEngine.startWater(); }
  if (els.muteBtn) els.muteBtn.textContent = Game.muted ? 'MUTED' : 'SOUND';
}

// ---------- Main loop ----------
let lastTs = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  if (!lastTs) lastTs = ts;
  let dt = (ts - lastTs) / 1000;
  lastTs = ts;
  if (dt > CONFIG.MAX_DT) dt = CONFIG.MAX_DT;
  if (dt < 0) dt = 0;
  update(dt);
  render();
  updateHUD();
}

// ---------- Boot (browser only) ----------
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    backgroundArt = new Image(); backgroundArt.src = 'assets/industrial-bg.webp';
    cacheEls();
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 100));
    bindInput();
    showMenu();
    requestAnimationFrame(loop);
  });
}

// Export for Node tests (ignored in browser)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, Game, waveOffset, resetGame, update, setPush, pauseGame, resumeGame, progress, waterDanger, nextSignalState, signalDuration, canPushInState, isPushForbidden, waterHeightAt, pushTimeNeeded, perfectPlayTime, clamp, lerp };
}
