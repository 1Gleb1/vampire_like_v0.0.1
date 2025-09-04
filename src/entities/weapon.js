import { Projectile } from './projectile.js';

export class Weapon {
	constructor(type, speed, size, color) {
		this.type = type;
		this.speed = speed;
		this.size = size;
		this.color = color;
		this.damage = 20;
		this.customAngles = [0];
		this.fanSpread = Math.PI / 6; // default 30°
		this.fanCount = 5;
	}

	fire(x, y, projectiles, targetX, targetY) {
		if (this.type === 'aim') {
			const angle = Math.atan2(targetY - y, targetX - x);
			projectiles.push(
				new Projectile(x, y, angle, this.speed, this.size, this.color)
			);
		} else if (this.type === 'multi') {
			this.customAngles.forEach(a =>
				projectiles.push(
					new Projectile(x, y, a, this.speed, this.size, this.color)
				)
			);
		} else if (this.type === 'fan') {
			const centerAngle = Math.atan2(targetY - y, targetX - x);
			const spread = this.fanSpread;
			const count = this.fanCount;
			for (let i = 0; i < count; i++) {
				const angle = centerAngle - spread / 2 + (spread / (count - 1)) * i;
				projectiles.push(
					new Projectile(x, y, angle, this.speed, this.size, this.color)
				);
			}
		} else if (this.type === 'splash') {
			for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
				projectiles.push(
					new Projectile(x, y, a, this.speed, this.size, this.color)
				);
			}
		} else if (this.type === 'beam') {
			const angle = Math.atan2(targetY - y, targetX - x);
			projectiles.push(
				new Projectile(x, y, angle, this.speed * 2, this.size, this.color)
			);
		} else if (this.type === 'four') {
			const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
			angles.forEach(a =>
				projectiles.push(
					new Projectile(x, y, a, this.speed, this.size, this.color)
				)
			);
		}
	}

	addDirection(angle) {
		this.type = 'multi';
		this.customAngles = this.customAngles || [0];
		this.customAngles.push(angle);
	}

	setFourDirections() {
		this.type = 'four';
	}

	setFanShot() {
		this.type = 'fan';
	}

	increaseFanCount(delta = 1) {
		this.fanCount = Math.max(2, this.fanCount + delta);
	}

	increaseFanSpread(delta = Math.PI / 18) {
		this.fanSpread = Math.min(Math.PI, this.fanSpread + delta);
	}

	addExtraBullet() {
		this.type = 'multi';
		this.customAngles = this.customAngles || [0];
		this.customAngles.push(0.1);
	}
}
