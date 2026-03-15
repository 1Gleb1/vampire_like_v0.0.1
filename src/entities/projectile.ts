import { Particle } from './particle.ts';
import { showUpgradeCards } from '../ui/ui.ts';
import { triggerScreenBlink } from '../shared/lib/state.ts';
import { Enemy } from './enemy.ts';
import { Player } from './player.ts';

type ProjectileColor = 'yellow' | 'pink' | string; // string для других возможных цветов

export class Projectile {
	private x: number;
	private y: number;
	private angle: number;
	private speed: number;
	private size: number;
	private color: ProjectileColor;
	private life: number;

	constructor(
			x: number,
			y: number,
			angle: number,
			speed: number,
			size: number,
			color: ProjectileColor,
			life: number = 60
	) {
		// life — время жизни в кадрах (~60 кадров = 1 секунда при 60 FPS)
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.speed = speed;
		this.size = size;
		this.color = color;
		this.life = life;
	}

	public update(): void {
		this.x += Math.cos(this.angle) * this.speed;
		this.y += Math.sin(this.angle) * this.speed;
		this.life--;
	}

	public checkCollisions(
			enemies: Enemy[],
			player: Player,
			particles: Particle[]
	): boolean {
		// Проверка выхода за границы карты или смерти снаряда
		if (
				this.x < 0 ||
				this.x > 4000 ||
				this.y < 0 ||
				this.y > 4000 ||
				this.isDead()
		) {
			return true;
		}

		// Снаряд игрока (желтый)
		if (this.color === 'yellow') {
			for (let j = enemies.length - 1; j >= 0; j--) {
				const enemy = enemies[j];
				if (
						Math.hypot(this.x - enemy.x, this.y - enemy.y) <
						this.size + enemy.size
				) {
					enemy.hp -= 20;

					if (enemy.hp <= 0) {
						enemies.splice(j, 1);
						player.xp += 10;

						for (let k = 0; k < 10; k++) {
							particles.push(new Particle(enemy.x, enemy.y, enemy.color));
						}

						if (player.xp >= player.level * 50) {
							player.level++;
							player.xp = 0;
							showUpgradeCards();
						}
					}
					return true;
				}
			}
		}

		// Снаряд врага (розовый)
		if (this.color === 'pink') {
			if (
					Math.hypot(this.x - player.x, this.y - player.y) <
					this.size + player.size
			) {
				player.hp -= 5;
				triggerScreenBlink('red', 250);
				return true;
			}
		}

		return false;
	}

	public isDead(): boolean {
		return this.life <= 0;
	}

	public draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x - camX, this.y - camY, this.size, 0, Math.PI * 2);
		ctx.fill();
	}
}
