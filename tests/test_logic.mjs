import fs from 'fs';
import vm from 'vm';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const storyCode = fs.readFileSync(path.join(root,'story.js'),'utf8');
const sandbox = { console, globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(storyCode + '\n;globalThis.__EP=EPISODES;', sandbox);
const ep = sandbox.globalThis.__EP.room412;
const scenes = ep.scenes;

let passed = 0;
let failed = 0;
const results = [];
function assert(cond, name, detail='') {
  const r = { name, ok: !!cond, detail };
  results.push(r);
  if (cond) { passed++; console.log('PASS', name); }
  else { failed++; console.log('FAIL', name, detail); }
}

// Basic integrity
for (const [id, sc] of Object.entries(scenes)) {
  for (const n of [sc.next, sc.nextCorrect, sc.nextWrong].filter(Boolean)) {
    assert(!!scenes[n], `scene ref ${id} -> ${n}`);
  }
}

const decisions = Object.entries(scenes).filter(([_,s])=>s.type==='decision').map(([id,s])=>({id,...s}));
assert(decisions.length === 6, 'exactly 6 decisions', `found ${decisions.length}`);

for (const d of decisions) {
  assert(Array.isArray(d.choices) && d.choices.length === 3, `${d.id} has 3 choices`, d.choices?.length);
  const correct = d.choices.filter(c=>c.correct===true);
  assert(correct.length === 1, `${d.id} has exactly 1 correct`, correct.length);
  for (const c of d.choices) {
    if (!c.correct) assert(!!c.failTag, `${d.id} wrong choice has failTag`, c.text);
  }
  // timeout variant exists
  const ws = scenes[d.nextWrong];
  assert(!!ws && ws.type==='failure_sequence', `${d.id} nextWrong is failure_sequence`);
  if (ws) {
    assert(!!ws.failTagScenes?.timeout, `${d.id} has timeout failure`);
    for (const c of d.choices.filter(x=>!x.correct)) {
      assert(!!ws.failTagScenes?.[c.failTag], `${d.id} has failTag scene ${c.failTag}`);
    }
    // each branch 2-4 scenes
    for (const [tag,arr] of Object.entries(ws.failTagScenes||{})) {
      assert(arr.length>=2 && arr.length<=4, `${d.id} ${tag} has 2-4 scenes`, arr.length);
      // last scene should be caught/reveal image or narration indicating reveal; we check it reaches game_over
    }
    assert(ws.next === 'game_over' || ws.next === 'game_over_caught', `${d.id} failure leads to game_over`, ws.next);
  }
}

// Simulate path: array of choice indices per decision in order d1-d6
function simulate(choiceFns) {
  // choiceFns: map decisionId -> 'correct' | 'wrong:<failTag>' | 'timeout'
  let sceneId = ep.startScene;
  const visited = [];
  for (let step=0; step<200; step++) {
    const sc = scenes[sceneId];
    if (!sc) return { outcome:'missing', sceneId, visited };
    visited.push(sceneId);
    if (sc.type === 'game_over') return { outcome:'game_over', visited };
    if (sc.type === 'win' || sc.type === 'ending') {
      // ending leads to win_screen in data; follow
      if (sc.next === 'win_screen' || sc.type==='win') return { outcome:'win', visited };
      sceneId = sc.next; continue;
    }
    if (sc.type === 'decision') {
      const action = choiceFns[sc.id] || 'correct';
      if (action === 'correct') {
        sceneId = sc.nextCorrect;
      } else if (action === 'timeout') {
        sceneId = sc.nextWrong;
      } else if (action.startsWith('wrong:')) {
        // we still go to nextWrong; failTag is recorded
        sceneId = sc.nextWrong;
      } else {
        sceneId = sc.nextWrong;
      }
      continue;
    }
    if (sc.type === 'failure_sequence') { sceneId = sc.next; continue; }
    sceneId = sc.next;
    if (!sceneId) return { outcome:'dead', visited };
  }
  return { outcome:'loop', visited };
}

// 1. All correct = win
const allCorrect = {};
decisions.forEach(d=>allCorrect[d.id]='correct');
const winRes = simulate(allCorrect);
assert(winRes.outcome === 'win', 'all-correct path wins', winRes.outcome);

// 2. Every wrong choice individually (others correct)
for (const d of decisions) {
  for (const c of d.choices.filter(x=>!x.correct)) {
    const map = {};
    decisions.forEach(dd=>map[dd.id]='correct');
    map[d.id] = `wrong:${c.failTag}`;
    const r = simulate(map);
    assert(r.outcome === 'game_over', `wrong choice ${d.id}/${c.failTag} leads to game_over`, r.outcome);
  }
}

// 3. Every timeout individually
for (const d of decisions) {
  const map = {};
  decisions.forEach(dd=>map[dd.id]='correct');
  map[d.id] = 'timeout';
  const r = simulate(map);
  assert(r.outcome === 'game_over', `timeout ${d.id} leads to game_over`, r.outcome);
}

// 4. Exhaustive: try all combinations of correct/wrong for all decisions (3^6 = 729) - small
// For each decision, 3 options: correct, wrong1, wrong2, timeout? brief says 3 choices and timeout
// We test all choice combinations: each decision 3 choices -> 729 paths. Only 1 should win.
let winCount = 0;
const choiceOptionsPerDecision = decisions.map(d => {
  const opts = [];
  d.choices.forEach(c => { opts.push(c.correct ? 'correct' : `wrong:${c.failTag}`); });
  return opts;
});
function combos(idx, cur) {
  if (idx === decisions.length) {
    const map = {};
    decisions.forEach((d,i)=>map[d.id]=cur[i]);
    const r = simulate(map);
    if (r.outcome === 'win') winCount++;
    else if (r.outcome !== 'game_over') {
      assert(false, `unexpected outcome ${r.outcome}`, JSON.stringify(map));
    }
    return;
  }
  for (const opt of choiceOptionsPerDecision[idx]) {
    cur.push(opt); combos(idx+1, cur); cur.pop();
  }
}
combos(0,[]);
assert(winCount === 1, 'exactly one winning path across all choice combinations', `wins=${winCount}`);

// 5. Timeout combinations also included as separate? timeouts are auto-fail; test all timeout-as-fail combos
let winCount2 = 0;
function combosWithTimeout(idx, cur) {
  if (idx === decisions.length) {
    const map = {};
    decisions.forEach((d,i)=>map[d.id]=cur[i]);
    const r = simulate(map);
    if (r.outcome === 'win') winCount2++;
    return;
  }
  for (const opt of [...choiceOptionsPerDecision[idx], 'timeout']) {
    cur.push(opt); combosWithTimeout(idx+1, cur); cur.pop();
  }
}
combosWithTimeout(0,[]);
assert(winCount2 === 1, 'exactly one winning path including timeouts', `wins=${winCount2}`);

console.log(`\nRESULTS: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
