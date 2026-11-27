'use strict';
const assert = require('node:assert/strict');
const {CONFIG:C, Game:g, resetGame, update, setPush, pauseGame, resumeGame, progress, waterDanger, nextSignalState} = require('../game.js');
let n = 0; function test(name, fn) { try { fn(); console.log('PASS',name); n++; } catch(e) { console.error('FAIL',name,e); process.exitCode=1; } }
function run(seconds, step=0.01) { while (seconds > 1e-8 && g.mode === 'playing') { const d=Math.min(step,seconds); update(d); seconds-=d; } }
test('starts and resets',()=>{resetGame(); assert.equal(g.mode,'playing'); assert.equal(progress(),0); assert.equal(g.signal,'green');});
test('pushes continuously on green and stops on release',()=>{resetGame();setPush(true);run(1);assert.ok(Math.abs(g.wallX-C.WALL_START_X-C.WALL_SPEED)<0.01);setPush(false);const x=g.wallX;run(.5);assert.equal(g.wallX,x);});
test('green to warning to red to green',()=>{resetGame();run(C.GREEN_DURATION+.01);assert.equal(g.signal,'blink');run(C.BLINK_DURATION+.01);assert.equal(g.signal,'red');run(C.RED_DURATION+.01);assert.equal(g.signal,'green');});
test('pressing red immediately fails and wall does not move',()=>{resetGame();run(C.GREEN_DURATION+C.BLINK_DURATION+.02);const x=g.wallX;setPush(true);assert.equal(g.mode,'gameover');assert.equal(g.failReason,'red');assert.equal(g.wallX,x);});
test('continuous hold across warning fails',()=>{resetGame();setPush(true);run(C.GREEN_DURATION+C.BLINK_DURATION+.1);assert.equal(g.mode,'gameover');assert.equal(g.failReason,'blink');});
test('water rises while waiting and drowns player',()=>{resetGame();run(1);assert.ok(g.waterHeight>0);run(20);assert.equal(g.failReason,'water');assert.equal(waterDanger(),1);});
test('skilled player can win releasing as soon as blinking begins',()=>{resetGame();let elapsed=0;while(g.mode==='playing' && elapsed<30){setPush(g.signal==='green');update(.01);elapsed+=.01;}assert.equal(g.mode,'victory');assert.equal(progress(),1);assert.ok(waterDanger()<1);console.log('  time:',g.time.toFixed(2),'water:',(100*waterDanger()).toFixed(1)+'%');});
test('pause releases push and freezes game; restart resets',()=>{resetGame();setPush(true);pauseGame();assert.equal(g.pushing,false);const t=g.time;update(1);assert.equal(g.time,t);resumeGame();assert.equal(g.mode,'playing');resetGame();assert.equal(g.wallX,C.WALL_START_X);});
test('signal state order',()=>{assert.equal(nextSignalState('green'),'blink');assert.equal(nextSignalState('blink'),'red');assert.equal(nextSignalState('red'),'green');});
test('water rises during red without wall movement',()=>{resetGame();run(C.GREEN_DURATION+C.BLINK_DURATION+.03);assert.equal(g.signal,'red');const w=g.waterHeight,x=g.wallX;run(.5);assert.ok(g.waterHeight>w);assert.equal(g.wallX,x);});
test('wave is spatial, time varying and stronger at danger',()=>{const {waveOffset}=require('../game.js');assert.notEqual(waveOffset(0,0,0),waveOffset(25,0,0));assert.notEqual(waveOffset(25,0,0),waveOffset(25,1,0));assert.ok(Math.abs(waveOffset(25,1,1))>Math.abs(waveOffset(25,1,0)));});
test('splash particles remain bounded and never cross wall or ground',()=>{resetGame();run(12);assert.ok(g.particles.length<=C.MAX_PARTICLES);assert.ok(g.particles.filter(p=>p.water).every(p=>p.x<g.wallX && p.y<C.GROUND_Y));});
test('restart clears flood state',()=>{resetGame();run(5);resetGame();assert.equal(g.waterHeight,0);assert.equal(g.waterClock,0);assert.equal(g.particles.length,0);});

console.log(`${n} tests passed`);
