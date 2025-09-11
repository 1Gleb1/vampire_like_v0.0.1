import { Particle } from './particle.js';
import { showUpgradeCards } from '../ui/ui.js';
import { triggerScreenBlink } from '../shared/lib/state.js';

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

	checkCollisions(enemies, player, particles) {
		if (
			this.x < 0 ||
			this.x > 4000 ||
			this.y < 0 ||
			this.y > 4000 ||
			this.isDead()
		) {
			return true;
		}

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

	isDead() {
		return this.life <= 0;
	}

	draw(ctx, camX, camY) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x - camX, this.y - camY, this.size, 0, Math.PI * 2);
		ctx.fill();
	}
}
