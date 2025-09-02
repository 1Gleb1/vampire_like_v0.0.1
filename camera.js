export class Camera {
	constructor(player, canvas) {
		this.player = player;
		this.canvas = canvas;
		this.x = player.x - canvas.width / 2;
		this.y = player.y - canvas.height / 2;
		this.offsetRadius = 50;
	}

	update() {
		const targetX = this.player.x - this.canvas.width / 2;
		const targetY = this.player.y - this.canvas.height / 2;
		this.x += (targetX - this.x) * 0.05;
		this.y += (targetY - this.y) * 0.05;

		const dx = this.player.x - (this.x + this.canvas.width / 2);
		const dy = this.player.y - (this.y + this.canvas.height / 2);
		const dist = Math.hypot(dx, dy);
		if (dist > this.offsetRadius) {
			this.x += dx - (dx / dist) * this.offsetRadius;
			this.y += dy - (dy / dist) * this.offsetRadius;
		}
	}
}
