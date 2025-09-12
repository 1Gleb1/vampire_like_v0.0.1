import { MAP_HEIGHT, MAP_WIDTH } from '../core/constants.js';
import { difficultyLevel } from '../shared/lib/state.js';
import { BatAnimation } from './batAnimation.js';
import { Projectile } from './projectile.js';

export class Enemy {
	constructor(x, y, type = 'normal') {
		this.x = x;
		this.y = y;
		this.type = type;
		this.size = type === 'fast' ? 35 : type === 'shooter' ? 20 : 25;
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

		this.batAnimation = new BatAnimation();
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
			projectiles.push(new Projectile(this.x, this.y, angle, 7, 5, 'pink'));
			this.lastShot = now;
		}
	}

	draw(ctx, camX, camY) {
		if (this.type === 'fast') {
			this.batAnimation.update();
			this.batAnimation.draw(ctx, this.x, this.y, this.size, camX, camY);
		} else {
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(this.x - camX, this.y - camY, this.size, 0, Math.PI * 2);
			ctx.fill();
		}

		const maxHp =
			this.maxHp ??
			(this.type === 'fast' ? 20 : this.type === 'shooter' ? 30 : 40);
		const hpBarWidth = 50;
		const hpBarHeight = 6;
		const hpBarX = this.x - camX - hpBarWidth / 2;
		const hpBarY = this.y - camY - this.size - 10;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

		const hpPercentage = Math.max(0, Math.min(1, this.hp / maxHp));
		const fillWidth = hpBarWidth * hpPercentage;
		ctx.fillStyle =
			hpPercentage > 0.5
				? '#00ff00'
				: hpPercentage > 0.25
				? '#ffff00'
				: '#ff0000';
		ctx.fillRect(hpBarX, hpBarY, fillWidth, hpBarHeight);

		ctx.strokeStyle = 'white';
		ctx.lineWidth = 1;
		// ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

		ctx.fillStyle = 'white';
		ctx.font = '10px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		// ctx.fillText(`${this.hp}/${maxHp}`, hpBarX + hpBarWidth / 2, hpBarY + hpBarHeight / 2 + 0.5);
	}

	update(player, projectiles) {
		this.move(player);
		this.shoot(player, projectiles);
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
