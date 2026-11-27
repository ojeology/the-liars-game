'use strict';
// Tuning: all distances are world units; 32 units represent one meter.
const CONFIG = Object.freeze({line:260, maxSpeed:220, stepGain:34, drag:32, gravity:580, launch:265, boost:60, peakMin:.30, peakMax:.62, unitsPerMeter:32, attempts:3});
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function makeGame(){return {mode:'ready',x:0,height:0,vy:0,speed:0,air:0,lastFoot:null,boosted:false,boostResult:'',attempt:1,scores:[],time:0,resultTime:0,paused:false,stepPhase:0};}
function step(g,foot){if(g.mode!=='run'||g.paused)return false;if(foot===g.lastFoot)return false;g.lastFoot=foot;g.speed=clamp(g.speed+CONFIG.stepGain,0,CONFIG.maxSpeed);g.stepPhase++;return true;}
function jump(g){if(g.paused)return false;if(g.mode==='run'){if(g.speed<30)return false;if(g.x>CONFIG.line){finish(g,null,'FOUL');return false;}g.mode='air';g.vy=CONFIG.launch;g.height=.1;g.air=0;return true;}if(g.mode==='air'&&!g.boosted){g.boosted=true;if(g.air>=CONFIG.peakMin&&g.air<=CONFIG.peakMax){g.vy+=CONFIG.boost;g.boostResult='PERFECT BOOST!';}else{g.boostResult='TOO '+(g.air<CONFIG.peakMin?'EARLY':'LATE')+'!';}return true;}return false;}
function finish(g,distance,label){g.mode='result';g.speed=0;g.vy=0;g.height=0;g.scores.push(distance);g.resultLabel=label;g.resultTime=1.8;}
function update(g,dt){if(g.paused)return;dt=clamp(dt,0,.05);g.time+=dt;if(g.mode==='run'){g.x+=g.speed*dt;g.speed=Math.max(0,g.speed-CONFIG.drag*dt);if(g.x>CONFIG.line)finish(g,null,'FOUL!');}else if(g.mode==='air'){g.air+=dt;g.x+=g.speed*dt;g.height+=g.vy*dt;g.vy-=CONFIG.gravity*dt;if(g.height<=0){g.height=0;const distance=Math.max(0,(g.x-CONFIG.line)/CONFIG.unitsPerMeter);finish(g,distance,distance<1?'SHORT!':'NICE JUMP!');}}else if(g.mode==='result'){g.resultTime-=dt;if(g.resultTime<=0){if(g.attempt>=CONFIG.attempts)g.mode='complete';else{g.attempt++;g.x=0;g.height=0;g.speed=0;g.lastFoot=null;g.boosted=false;g.boostResult='';g.mode='run';}}}}
if(typeof module!=='undefined')module.exports={CONFIG,makeGame,step,jump,update};
if(typeof document!=='undefined'){
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');let game=makeGame(),muted=false,audio=null,last=0,shownComplete=false,canvasW=0,canvasH=0,dpr=1;const bg=new Image();bg.src='assets/stadium.webp?v=1';let record=0;try{record=Number(localStorage.getItem('streetgames-best')||0)}catch(e){}
function tone(f,d=.09){if(muted)return;try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();let o=audio.createOscillator(),v=audio.createGain(),t=audio.currentTime;o.type='triangle';o.frequency.value=f;v.gain.setValueAtTime(.06,t);v.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(v);v.connect(audio.destination);o.start();o.stop(t+d)}catch(e){}}
function resize(){const r=canvas.getBoundingClientRect();canvasW=r.width;canvasH=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(canvasW*dpr);canvas.height=Math.round(canvasH*dpr)}window.addEventListener('resize',resize);
function start(){game=makeGame();game.mode='run';shownComplete=false;$('pause').textContent='Ⅱ';$('overlay').classList.add('hidden');$('share').hidden=true;tone(520);}
function foot(which){if(step(game,which))tone(which==='left'?260:310,.05)}
function action(){const old=game.mode;if(jump(game)){tone(old==='run'?620:880,.14)}}
function bind(id,fn){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.classList.add('pressed');fn()});for(const type of ['pointerup','pointercancel','pointerleave'])el.addEventListener(type,()=>el.classList.remove('pressed'))}
bind('left',()=>foot('left'));bind('right',()=>foot('right'));bind('jump',action);
window.addEventListener('keydown',e=>{if(['Space','ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='KeyA'||e.code==='ArrowLeft')foot('left');if(e.code==='KeyD'||e.code==='ArrowRight')foot('right');if(e.code==='Space')action();});
$('start').addEventListener('click',start);$('sound').addEventListener('click',()=>{muted=!muted;$('sound').textContent=muted?'SOUND OFF':'SOUND ON';if(audio&&muted)audio.suspend();else if(audio)audio.resume()});
$('pause').addEventListener('click',()=>{if(game.mode==='run'||game.mode==='air'||game.mode==='result'){game.paused=!game.paused;$('pause').textContent=game.paused?'▶':'Ⅱ';}});
window.addEventListener('blur',()=>{if(['run','air','result'].includes(game.mode)){game.paused=true;$('pause').textContent='▶'}});document.addEventListener('visibilitychange',()=>{if(document.hidden&&['run','air','result'].includes(game.mode)){game.paused=true;$('pause').textContent='▶'}});
function bestScore(){return Math.max(0,...game.scores.filter(n=>n!==null));}
function showComplete(){shownComplete=true;let best=bestScore();if(best>record){record=best;try{localStorage.setItem('streetgames-best',String(record))}catch(e){}}$('overlayTitle').innerHTML='MEET <em>COMPLETE!</em>';$('overlayText').textContent=best?'Three jumps. One score to beat.':'Three fouls! Try taking off before the line.';$('rules').hidden=true;$('results').hidden=false;$('results').innerHTML=game.scores.map((n,i)=>`ATTEMPT ${i+1} <b>${n===null?'FOUL':n.toFixed(2)+' m'}</b>`).join('<br>')+`<br>PERSONAL BEST <b>${record?record.toFixed(2)+' m':'—'}</b>`;$('start').innerHTML='PLAY AGAIN <span>→</span>';$('share').hidden=false;$('overlay').classList.remove('hidden');tone(760,.2)}
$('share').addEventListener('click',async()=>{let text=`I jumped ${bestScore().toFixed(2)} m in Street Games! Can you beat me?`;try{if(navigator.share)await navigator.share({title:'Street Games: Long Jump',text,url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(text+' '+location.href);$('share').textContent='COPIED!'}else $('share').textContent='SHARE NOT AVAILABLE';}catch(e){}});
function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);const w=canvasW,h=canvasH;ctx.fillStyle='#7fcfde';ctx.fillRect(0,0,w,h);if(bg.complete&&bg.naturalWidth){const scale=Math.max(w/bg.width,h/bg.height);ctx.drawImage(bg,(w-bg.width*scale)/2,(h-bg.height*scale)/2,bg.width*scale,bg.height*scale)}
// Game geometry uses a camera that follows the athlete while keeping the takeoff board visible.
const scale=Math.min(1.5,Math.max(.75,h/380)),ground=h*.79,camera=Math.max(0,game.x-105),X=x=>(x-camera)*scale+w*.16;
ctx.fillStyle='#8c4534';ctx.fillRect(0,ground,w,h-ground);ctx.fillStyle='#d87950';ctx.fillRect(0,ground,w,9*scale);ctx.strokeStyle='#f7d5a0';ctx.lineWidth=2*scale;ctx.beginPath();ctx.moveTo(0,ground+13*scale);ctx.lineTo(w,ground+13*scale);ctx.stroke();
// Pit and fixed takeoff line; their world coordinates never move with the athlete.
const line=X(CONFIG.line);ctx.fillStyle='#edcb82';ctx.fillRect(line,ground,Math.max(0,w-line),h-ground);ctx.fillStyle='#fff7d4';ctx.fillRect(line-4*scale,ground-4*scale,5*scale,18*scale);ctx.fillStyle='#df6342';ctx.fillRect(line+1*scale,ground-4*scale,3*scale,18*scale);ctx.fillStyle='#cfaa6a';for(let i=0;i<12;i++){let px=line+(i*47+20)*scale;if(px>w)break;ctx.fillRect(px,ground+(20+i%3*10)*scale,12*scale,1*scale)}
// Character animation remains purely cosmetic: world position and jump physics are unchanged.
const athleteX=X(game.x); drawAthlete(athleteX,ground,game.height,scale);

if(game.paused){ctx.fillStyle='#0a143cb0';ctx.fillRect(0,0,w,h);ctx.fillStyle='white';ctx.font='900 25px system-ui';ctx.textAlign='center';ctx.fillText('PAUSED',w/2,h/2)} }
// Layered, articulated athlete. All proportions are in local canvas units; the
// feet remain anchored to the physics position and the shadow stays on the track.
function drawAthlete(x,ground,height,scale){
 const s=scale*1.22, airborne=game.mode==='air', running=game.mode==='run'&&game.speed>4;
 const cycle=running?Math.sin(game.time*(11+game.speed/35)):0;
 const bob=running?Math.abs(cycle)*2:0;
 ctx.save();ctx.fillStyle='rgba(13,24,37,.24)';ctx.beginPath();ctx.ellipse(x,ground,Math.max(7,18*s-height*.08),4*s,0,0,Math.PI*2);ctx.fill();ctx.restore();
 ctx.save();ctx.translate(x,ground-height*scale-bob*s);ctx.scale(s,s);ctx.lineCap='round';ctx.lineJoin='round';
 const limb=(color,width,pts)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.stroke()};
 // Rear leg and arm, shaded to separate them from the foreground limbs.
 const stride=cycle*12, frontFoot=airborne?14:stride, rearFoot=airborne?-14:-stride;
 limb('#493b46',8,[-3,-28,-8+rearFoot*.38,-16,rearFoot,-5]);
 limb('#a76542',7,[-6,-54,-16-cycle*4,-43,-12-cycle*7,-34]);
 // Sleeveless jersey and shorts with fabric highlights.
 ctx.fillStyle='#1d3154';ctx.beginPath();ctx.roundRect(-12,-34,24,12,3);ctx.fill();
 ctx.fillStyle='#142642';ctx.fillRect(-2,-29,3,5);
 ctx.fillStyle='#db692f';ctx.beginPath();ctx.moveTo(-12,-56);ctx.quadraticCurveTo(-13,-60,-6,-61);ctx.lineTo(7,-61);ctx.quadraticCurveTo(13,-59,13,-53);ctx.lineTo(11,-33);ctx.lineTo(-10,-33);ctx.closePath();ctx.fill();
 ctx.fillStyle='#ffb74c';ctx.beginPath();ctx.moveTo(-10,-53);ctx.lineTo(-4,-57);ctx.lineTo(5,-57);ctx.lineTo(10,-52);ctx.lineTo(9,-35);ctx.lineTo(-9,-35);ctx.closePath();ctx.fill();
 ctx.fillStyle='#fff4d7';ctx.fillRect(-9,-43,18,3);ctx.fillStyle='#17434f';ctx.fillRect(-6,-39,12,2);
 // Front leg: bent knee, sock and a distinct running shoe.
 limb('#b9754d',8,[3,-26,7+frontFoot*.42,-16,frontFoot,-5]);
 limb('#fff3dc',6,[frontFoot,-8,frontFoot,-4]);
 ctx.fillStyle='#172744';ctx.beginPath();ctx.roundRect(frontFoot-5,-6,17,6,3);ctx.fill();ctx.fillStyle='#fff5de';ctx.fillRect(frontFoot-4,-3,15,2);
 ctx.fillStyle='#192a45';ctx.beginPath();ctx.roundRect(rearFoot-5,-6,15,6,3);ctx.fill();ctx.fillStyle='#e6e9dc';ctx.fillRect(rearFoot-4,-3,13,2);
 // Front arm pumps with stride; raised in flight.
 const elbowX=airborne?18:14+cycle*5, elbowY=airborne?-62:-46+cycle*4, handX=airborne?23:10+cycle*8, handY=airborne?-73:-36+cycle*4;
 limb('#b7744c',7,[8,-54,elbowX,elbowY,handX,handY]);
 ctx.fillStyle='#d69261';ctx.beginPath();ctx.arc(handX,handY,4,0,Math.PI*2);ctx.fill();
 // Neck, head and hair; profile is expressive and reads clearly at phone size.
 ctx.fillStyle='#a96541';ctx.fillRect(-4,-65,10,8);
 ctx.fillStyle='#c98859';ctx.beginPath();ctx.moveTo(-12,-82);ctx.quadraticCurveTo(-13,-94,0,-95);ctx.quadraticCurveTo(14,-95,14,-81);ctx.lineTo(17,-76);ctx.lineTo(13,-74);ctx.quadraticCurveTo(12,-63,2,-63);ctx.quadraticCurveTo(-12,-64,-12,-75);ctx.closePath();ctx.fill();
 ctx.fillStyle='#1b2536';ctx.beginPath();ctx.moveTo(-12,-78);ctx.quadraticCurveTo(-17,-95,-4,-98);ctx.quadraticCurveTo(8,-101,14,-89);ctx.lineTo(10,-85);ctx.quadraticCurveTo(5,-88,1,-86);ctx.lineTo(-5,-84);ctx.lineTo(-6,-76);ctx.closePath();ctx.fill();
 ctx.fillStyle='#a95e3e';ctx.beginPath();ctx.arc(-7,-77,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff9ec';ctx.beginPath();ctx.ellipse(8,-79,3.3,3.8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#182332';ctx.beginPath();ctx.arc(9,-78,1.5,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#704a38';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(5,-84);ctx.lineTo(11,-85);ctx.moveTo(6,-70);ctx.quadraticCurveTo(10,-68,13,-71);ctx.stroke();
 // Headband gives the silhouette a recognisable, colourful sports identity.
 ctx.strokeStyle='#50d5c1';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-11,-88);ctx.quadraticCurveTo(0,-92,12,-87);ctx.stroke();
 ctx.restore();
}
function hud(){let best=bestScore();$('attempt').textContent=Math.min(game.attempt,CONFIG.attempts)+' / '+CONFIG.attempts;$('best').textContent=best?best.toFixed(2)+' m':'—';$('speedFill').style.width=Math.round(game.speed/CONFIG.maxSpeed*100)+'%';$('phase').textContent=game.paused?'PAUSED':({ready:'READY',run:'SPRINT',air:'FLIGHT',result:'RESULT',complete:'FINISH'})[game.mode];$('aim').hidden=game.mode!=='air';$('aim').textContent=game.boosted?game.boostResult:(game.air>=CONFIG.peakMin&&game.air<=CONFIG.peakMax?'PEAK! TAP BOOST NOW':'IN THE AIR · WAIT FOR THE PEAK');$('jump').classList.toggle('boost',game.mode==='air'&&!game.boosted);$('jump').firstChild.nodeValue=game.mode==='air'?'BOOST':'JUMP';$('instruction').textContent=game.mode==='air'?(game.boosted?game.boostResult:'Tap BOOST near the peak!'):'Alternate LEFT and RIGHT to sprint';let msg=game.paused?'PAUSED':game.mode==='result'?(game.resultLabel+(game.scores[game.scores.length-1]===null?'':'  '+game.scores[game.scores.length-1].toFixed(2)+' m')):game.mode==='air'?(game.boostResult||'FLY!'):game.x>CONFIG.line-65?'JUMP BEFORE THE LINE!':'BUILD YOUR SPEED!';$('message').textContent=msg;}
function loop(ts){requestAnimationFrame(loop);const dt=last?Math.min((ts-last)/1000,.05):0;last=ts;update(game,dt);draw();hud();if(game.mode==='complete'&&!shownComplete)showComplete();}resize();requestAnimationFrame(loop);
}
