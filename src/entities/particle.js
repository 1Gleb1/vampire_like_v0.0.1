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
}
