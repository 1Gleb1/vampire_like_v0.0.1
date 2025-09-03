import { MAP_HEIGHT, MAP_WIDTH } from './constants.js';
import { difficultyLevel } from './state.js';
import { Projectile } from './projectile.js';

export class Enemy {
	constructor(x, y, type = 'normal') {
		this.x = x;
		this.y = y;
		this.type = type;
		this.size = type === 'fast' ? 15 : type === 'shooter' ? 20 : 25;
		const speedBase = type === 'fast' ? 3 : type === 'shooter' ? 1.2 : 1.5;
		const hpBase = type === 'fast' ? 20 : type === 'shooter' ? 30 : 40;
		const speedScale = 1 + (difficultyLevel - 1) * 0.05;
		const hpScale = 1 + (difficultyLevel - 1) * 0.1; 
		this.speed = speedBase * speedScale;
		this.maxHp = Math.round(hpBase * hpScale);
		this.hp = this.maxHp;
		this.color =
			type === 'fast' ? 'orange' : type === 'shooter' ? 'purple' : 'red';
		const fireBase = 1500;
		const fireScale = Math.max(600, fireBase - (difficultyLevel - 1) * 75);
		this.fireRate = type === 'shooter' ? fireScale : 0;
		this.lastShot = 0;
	}

	move(player) {
		const dx = player.x - this.x;
		const dy = player.y - this.y;
		const dist = Math.hypot(dx, dy);
		this.x += (dx / dist) * this.speed;
		this.y += (dy / dist) * this.speed;

		// Ограничения по границам карты
		if (this.x < this.size) this.x = this.size;
		if (this.x > MAP_WIDTH - this.size) this.x = MAP_WIDTH - this.size;
		if (this.y < this.size) this.y = this.size;
		if (this.y > MAP_HEIGHT - this.size) this.y = MAP_HEIGHT - this.size;
	}

	shoot(player, projectiles) {
		if (this.type !== 'shooter') return;
		const now = Date.now();
		if (now - this.lastShot > this.fireRate) {
			const angle = Math.atan2(player.y - this.y, player.x - this.x);
			projectiles.push(new Projectile(this.x, this.y, angle, 4, 5, 'pink'));
			this.lastShot = now;
		}
	}
}


export function spawnEnemy(type = 'normal', enemies) {
	const mapSize = 4000;
	const side = Math.random() < 0.5 ? 0 : 1;
	const x = side ? Math.random() * mapSize : Math.random() < 0.5 ? 0 : mapSize;
	const y = side
		? Math.random() < 0.5
			? 0
			: mapSize
		: Math.random() * mapSize;
	enemies.push(new Enemy(x, y, type));
}
