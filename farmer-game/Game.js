import { Farmer } from './Farmer.js';
import { Crop } from './Crop.js';

export const WIDTH = 900, HEIGHT = 540, TILE = 30;
const GAME_LEN = 60, GOAL = 15;
const State = { MENU:'MENU', PLAYING:'PLAYING', PAUSED:'PAUSED', GAME_OVER:'GAME_OVER', WIN:'WIN' };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const aabb = (a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

class Entity { constructor(x,y,w,h){ this.x=x; this.y=y; this.w=w; this.h=h; this.dead=false; } }

class Scarecrow extends Entity {
  constructor(x,y){ super(x,y,26,46); }
  draw(ctx){
    const {x,y,w,h}=this;
    ctx.fillStyle='#9b7653'; ctx.fillRect(x+w/2-3,y,6,h);
    ctx.fillStyle='#c28e0e'; ctx.beginPath(); ctx.arc(x+w/2,y+10,10,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#6b4f2a'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(x,y+18); ctx.lineTo(x+w,y+18); ctx.stroke();
  }
}

class PowerUp extends Entity {
  constructor(x,y){ super(x,y,22,22); }
  draw(ctx){
    const {x,y,w,h}=this;
    ctx.fillStyle='#65186aff'; ctx.beginPath(); ctx.arc(x+w/2,y+h/2,10,0,Math.PI*2); ctx.fill();
  }
}

// using bind so `this` stays the input object 
class Input{
  constructor(game){
    this.game=game; this.keys=new Set();
    this._down=this.down.bind(this);
    this._up=this.up.bind(this);
    window.addEventListener('keydown',this._down);
    window.addEventListener('keyup',this._up);
  }
  down(e){ if(e.key==='p'||e.key==='P') this.game.togglePause(); this.keys.add(e.key); }
  up(e){ this.keys.delete(e.key); }
  dispose(){
    window.removeEventListener('keydown',this._down);
    window.removeEventListener('keyup',this._up);
  }
}

 //@classdesc Main controller for state, updates, rendering, and UI (Q3)
export class Game {
  constructor(canvas){
    this.WIDTH = WIDTH; this.HEIGHT = HEIGHT; this.clamp = clamp;
    this.canvas=canvas; this.ctx=canvas.getContext('2d');
    this.state=State.MENU;

    this.player=new Farmer(WIDTH/2-17, HEIGHT-80);
    this.crops=[]; this.obstacles=[]; this.powerUps=[];
    this.lastTime=0; this.timeLeft=GAME_LEN;
    this.spawnEvery=1;
    this._s=0; this._p=0; this.score=0; this.goal=GOAL;

    this.input=new Input(this);

    const get=id=>document.getElementById(id);
    this.ui={ score:get('score'), time:get('time'), goal:get('goal'),
              status:get('status'), start:get('btnStart'), reset:get('btnReset') };
    this.ui.goal && (this.ui.goal.textContent=String(this.goal));

    this._onStart = this.start.bind(this);
    this._onReset = this.reset.bind(this);
    this.ui.start?.addEventListener('click', this._onStart);
    this.ui.reset?.addEventListener('click', this._onReset);

    // arrow fn keeps `this` bound to Game instance 
    this.tick = (ts) => {
      const dt = Math.min((ts - this.lastTime) / 1000, 0.033);
      this.lastTime = ts;
      this.update(dt);
      this.render();
      requestAnimationFrame(this.tick);
    };

    this.render();
  }

  start(){
    if (this.state===State.MENU || this.state===State.GAME_OVER || this.state===State.WIN){
      this.reset();
      this.state=State.PLAYING;
      this.ui.status && (this.ui.status.textContent='Playing…');
      this.lastTime=performance.now();
      requestAnimationFrame(this.tick);
    } else if (this.state===State.PAUSED){
      this.state=State.PLAYING;
      this.ui.status && (this.ui.status.textContent='Playing…');
    }
  }

  reset(){
    this.state=State.MENU;
    this.player=new Farmer(WIDTH/2-17, HEIGHT-80);
    this.crops.length=0; this.obstacles.length=0; this.powerUps.length=0;
    this.score=0; this.timeLeft=GAME_LEN; this._s=0; this._p=0;
    this.lastTime=performance.now();
    this.obstacles.push(new Scarecrow(200,220), new Scarecrow(650,160));
    this.syncUI();
    this.ui.status && (this.ui.status.textContent='Menu');
  }

  togglePause(){
    this.state = this.state===State.PLAYING ? State.PAUSED :
                 (this.state===State.PAUSED ? State.PLAYING : this.state);
    this.ui.status && (this.ui.status.textContent = this.state===State.PAUSED ? 'Paused' : 'Playing…');
  }

  syncUI(){
    this.ui.score && (this.ui.score.textContent=String(this.score));
    this.ui.time && (this.ui.time.textContent=Math.ceil(this.timeLeft));
    this.ui.goal && (this.ui.goal.textContent=String(this.goal));
  }

  spawnCrop(){
    const gx = Math.floor(Math.random() * ((WIDTH - 2*TILE) / TILE)) * TILE + TILE;
    const gy = Math.floor(Math.random() * ((HEIGHT - 2*TILE) / TILE)) * TILE + TILE;
    const r = Math.random();
    const type = r < 0.7 ? 'wheat' : r < 0.93 ? 'pumpkin' : 'golden';
    this.crops.push(new Crop(gx, gy, type));
  }

  spawnPowerUp(){
    const x = Math.random() * (WIDTH - 60) + 30;
    const y = Math.random() * (HEIGHT - 60) + 30;
    this.powerUps.push(new PowerUp(x,y));
  }

  update(dt){
    if (this.state!==State.PLAYING) return;

    this.timeLeft = clamp(this.timeLeft - dt, 0, GAME_LEN);
    this.spawnEvery = Math.max(0.45, this.spawnEvery - dt * 0.005);

    if (this.timeLeft<=0){
      this.state = this.score>=this.goal ? State.WIN : State.GAME_OVER;
      this.ui.status && (this.ui.status.textContent = this.state===State.WIN ? 'You Win!' : 'Game Over');
      this.syncUI(); return;
    }

    this.player.handleInput(this.input);
    this.player.update(dt, this);

    if (this.player.justBumped && this.player.hitTimer <= 0) {
  this.score = Math.max(0, this.score - 5);
  this.player.hitTimer = 1.0;
  this.syncUI();
}


    this._s += dt;
    while(this._s >= this.spawnEvery){ this._s -= this.spawnEvery; this.spawnCrop(); }

    this._p += dt;
    if (this._p >= 8){ this._p = 0; if (Math.random()<0.6) this.spawnPowerUp(); }

    for (const c of this.crops){
      if (aabb(this.player,c)){ c.dead=true; this.score += c.value; }
      else if (this.player.powerTimer>0){
        const dx=(this.player.x+this.player.w/2)-(c.x+c.w/2);
        const dy=(this.player.y+this.player.h/2)-(c.y+c.h/2);
        if (dx*dx+dy*dy < 60*60){ c.dead=true; this.score+=c.value; }
      }
    }
    for (const p of this.powerUps){
      if (aabb(this.player,p)){ p.dead=true; this.player.powerTimer=5; }
    }

    this.crops = this.crops.filter(c=>!c.dead);
    this.powerUps = this.powerUps.filter(p=>!p.dead);

    if (this.score>=this.goal){
      this.state=State.WIN; this.ui.status && (this.ui.status.textContent='You Win!');
    }
    this.syncUI();
  }

  render(){
    const ctx=this.ctx; if(!ctx) return;
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    ctx.fillStyle='#316016ff'; ctx.fillRect(0,0,WIDTH,HEIGHT);

    ctx.strokeStyle='#3d7627ff'; ctx.lineWidth=1;
    for(let y=TILE; y<HEIGHT; y+=TILE){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(WIDTH,y); ctx.stroke(); }
    for(let x=TILE; x<WIDTH; x+=TILE){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,HEIGHT); ctx.stroke(); }

    for(const c of this.crops) c.draw(ctx);
    for(const o of this.obstacles) o.draw(ctx);
    for(const p of this.powerUps) p.draw(ctx);
    this.player.draw(ctx);

    ctx.fillStyle='#f2e8e8ff'; ctx.font='16px system-ui,sans-serif';
    if (this.state===State.MENU) ctx.fillText('Press Start to play',20,28);
    else if (this.state===State.PAUSED) ctx.fillText('Paused (P to resume)',20,28);
    else if (this.state===State.GAME_OVER) ctx.fillText('Time up! Reset to menu',20,28);
    else if (this.state===State.WIN) ctx.fillText('Harvest complete! Reset to play again',20,28);
  }

  dispose(){
    this.ui.start?.removeEventListener('click', this._onStart);
    this.ui.reset?.removeEventListener('click', this._onReset);
    this.input.dispose();
  }
}
