const assert=require('node:assert/strict'); const {CONFIG:C,makeGame,step,jump,update}=require('../game.js');let pass=0;
function test(n,f){try{f();console.log('PASS',n);pass++}catch(e){console.error('FAIL',n,e);process.exitCode=1}}
function advance(g,t){for(let i=0;i<Math.ceil(t/.01);i++)update(g,.01)}
test('alternating feet builds speed; repeated foot does not',()=>{let g=makeGame();g.mode='run';assert(step(g,'left'));let v=g.speed;assert(!step(g,'left'));assert.equal(g.speed,v);assert(step(g,'right'));assert(g.speed>v)});
test('run advances, pass line without jump fouls',()=>{let g=makeGame();g.mode='run';g.speed=C.maxSpeed;g.x=C.line-1;advance(g,.1);assert.equal(g.mode,'result');assert.equal(g.scores[0],null)});
test('jump from valid position and timed boost lands',()=>{let g=makeGame();g.mode='run';g.x=C.line-5;g.speed=C.maxSpeed;assert(jump(g));advance(g,.4);assert(jump(g));assert.equal(g.boostResult,'PERFECT BOOST!');assert(!jump(g));advance(g,2);assert.equal(g.scores.length,1);assert(g.scores[0]>0)});
test('early boost is penalized, not rewarded',()=>{let g=makeGame();g.mode='run';g.speed=150;jump(g);const v=g.vy;jump(g);assert.equal(g.vy,v);assert.equal(g.boostResult,'TOO EARLY!')});
test('three attempts complete and pause freezes time',()=>{let g=makeGame();g.mode='run';g.paused=true;advance(g,1);assert.equal(g.time,0);g.paused=false;for(let i=0;i<3;i++){g.x=C.line-.1;g.speed=200;advance(g,.01);assert.equal(g.mode,'result');advance(g,1.9)}assert.equal(g.mode,'complete');assert.equal(g.scores.length,3)});
console.log(`${pass} tests passed`);
