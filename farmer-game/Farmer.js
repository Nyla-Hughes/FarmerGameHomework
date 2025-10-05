
export class Farmer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 34;
    this.h = 34;
    this.speed = 260;
    this.vx = 0;
    this.vy = 0;
    this.powerTimer = 0;
    this.hitTimer = 0;
    this.justBumped = false;
  }

  handleInput(input) {
    const L = input.keys.has('ArrowLeft') || input.keys.has('a');
    const R = input.keys.has('ArrowRight') || input.keys.has('d');
    const U = input.keys.has('ArrowUp') || input.keys.has('w');
    const D = input.keys.has('ArrowDown') || input.keys.has('s');
    this.vx = (R - L) * this.speed;
    this.vy = (D - U) * this.speed;
  }

  update(dt, game) {
    const ox = this.x, oy = this.y;
    this.x = game.clamp(this.x + this.vx * dt, 0, game.WIDTH - this.w);
    this.y = game.clamp(this.y + this.vy * dt, 0, game.HEIGHT - this.h);

    const collided = game.obstacles.some(o =>
  this.x < o.x + o.w &&
  this.x + this.w > o.x &&
  this.y < o.y + o.h &&
  this.y + this.h > o.y
);

if (collided) {
  this.x = ox;
  this.y = oy;
  this.justBumped = true;
} else {
  this.justBumped = false;
}


    if (this.powerTimer > 0) this.powerTimer = Math.max(0, this.powerTimer - dt);
    if (this.hitTimer > 0) this.hitTimer = Math.max(0, this.hitTimer - dt);
  }

  draw(ctx) {
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(this.x, this.y, this.w, this.h);

    ctx.fillStyle = '#c28e0e';
    ctx.fillRect(this.x + 4, this.y - 6, this.w - 8, 8);
    ctx.fillRect(this.x + 10, this.y - 18, this.w - 20, 12);

    if (this.powerTimer > 0) {
      ctx.beginPath();
      ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 60, 0, Math.PI * 2);
      ctx.strokeStyle = '#680c56ff';
      ctx.stroke();
    }
  }
}
