function drawStem(ctx, x, y, w, h) {
  ctx.strokeStyle = '#af9126ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h);
  ctx.lineTo(x + w / 2, y);
  ctx.stroke();
}

// Pumpkin crop drawing inspired by https://editor.p5js.org/KevinWorkman/sketches/Rhpew5JsV
function drawPumpkin(ctx, x, y, w, h) {
  ctx.strokeStyle = '#008000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - h / 2);
  ctx.lineTo(x + w / 2, y - h);
  ctx.stroke();

  ctx.fillStyle = '#ff6400';
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.ellipse(x + w / 2, y, w * 1.2, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(x + w / 2, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(x + w / 2, y, w * 0.8, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export class Crop {
  constructor(x, y, type = 'wheat') {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 20;
    this.type = type;
    this.value = type === 'golden' ? 5 : type === 'pumpkin' ? 3 : 1;
    this.dead = false;
  }

  update(dt) {}

  draw(ctx) {
    const { x, y, w, h } = this;

    if (this.type === 'wheat') {
      drawStem(ctx, x, y, w, h);
      ctx.fillStyle = '#af9126ff';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (this.type === 'pumpkin') {
      drawPumpkin(ctx, x, y, w, h);
      return;
    }

    if (this.type === 'golden') {
      ctx.fillStyle = '#f3d547';
      ctx.beginPath();
      ctx.arc(x + w / 2, y, 10, 0, Math.PI * 4);
      ctx.fill();
      return;
    }
  }
}