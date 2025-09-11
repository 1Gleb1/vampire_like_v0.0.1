export class Particle {
	constructor(x, y, color) {
		this.x = x;
		this.y = y;
		this.vx = (Math.random() - 0.5) * 2;
		this.vy = (Math.random() - 0.5) * 2;
		this.life = 30;
		this.color = color;
	}

	update() {
		this.x += this.vx;
		this.y += this.vy;
		this.life--;
	}

	draw(ctx, camX, camY) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x - camX, this.y - camY, 2, 0, Math.PI * 2);
		ctx.fill();
	}
}
