import { MAP_HEIGHT, MAP_WIDTH } from './main.js';
import { Weapon } from './weapon.js';

export class Player {
	constructor() {
		this.x = 2000;
		this.y = 2000;
		this.size = 20;
		this.color = 'cyan';
		this.speed = 3;
		this.hp = 100;
		this.maxHp = 100;
		this.xp = 0;
		this.level = 1;
		this.fireRate = 400;
		this.lastShot = 0;
		this.weapons = [new Weapon('aim', 7, 5, 'yellow')];
	}

	move(keys) {
		if (keys['ц'] || keys['w'] || keys['ArrowUp']) this.y -= this.speed;
		if (keys['ы'] || keys['s'] || keys['ArrowDown']) this.y += this.speed;
		if (keys['ф'] || keys['a'] || keys['ArrowLeft']) this.x -= this.speed;
		if (keys['в'] || keys['d'] || keys['ArrowRight']) this.x += this.speed;

		// Ограничения по границам карты
		if (this.x < this.size) this.x = this.size;
		if (this.x > MAP_WIDTH - this.size) this.x = MAP_WIDTH - this.size;
		if (this.y < this.size) this.y = this.size;
		if (this.y > MAP_HEIGHT - this.size) this.y = MAP_HEIGHT - this.size;
	}

	shoot(projectiles, mouseX, mouseY, camera) {
		const now = Date.now();
		if (now - this.lastShot > this.fireRate) {
			this.weapons.forEach(w =>
				w.fire(
					this.x,
					this.y,
					projectiles,
					mouseX + camera.x,
					mouseY + camera.y
				)
			);
			this.lastShot = now;
		}
	}
}
