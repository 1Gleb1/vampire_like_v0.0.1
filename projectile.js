export class Projectile {
	constructor(x, y, angle, speed, size, color, life = 60) {
		// life — время жизни в кадрах (~60 кадров = 1 секунда при 60 FPS)
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.speed = speed;
		this.size = size;
		this.color = color;
		this.life = life;
	}

	update() {
		this.x += Math.cos(this.angle) * this.speed;
		this.y += Math.sin(this.angle) * this.speed;
		this.life--;
	}

	isDead() {
		return this.life <= 0;
	}
}
