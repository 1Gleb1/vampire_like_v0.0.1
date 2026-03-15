export class Particle {
	private x: number;
	private y: number;
	private vx: number;
	private vy: number;
	public life: number;
	private color: string;

	constructor(x: number, y: number, color: string) {
		this.x = x;
		this.y = y;
		this.vx = (Math.random() - 0.5) * 2;
		this.vy = (Math.random() - 0.5) * 2;
		this.life = 30;
		this.color = color;
	}

	public update(): void {
		this.x += this.vx;
		this.y += this.vy;
		this.life--;
	}

	public draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x - camX, this.y - camY, 2, 0, Math.PI * 2);
		ctx.fill();
	}

	// Геттер для проверки жизненного цикла частицы
	public isAlive(): boolean {
		return this.life > 0;
	}
}
