import { Projectile } from '../projectile.ts';
import { fireShotgunPattern } from './fan/index.ts';

type WeaponType = 'aim' | 'multi' | 'fan' | 'splash' | 'beam' | 'four';

export class Weapon {
	private type: WeaponType;
	public speed: number;
	private size: number;
	private color: string;
	private damage: number;
	private customAngles: number[];
	private fanSpread: number;
	private fanCount: number;

	constructor(
			type: WeaponType,
			speed: number,
			size: number,
			color: string
	) {
		this.type = type;
		this.speed = speed;
		this.size = size;
		this.color = color;
		this.damage = 20;
		this.customAngles = [0];
		this.fanSpread = Math.PI / 6; // default 30°
		this.fanCount = 5;
	}

	public fire(
			x: number,
			y: number,
			projectiles: Projectile[],
			targetX: number,
			targetY: number
	): void {
		if (this.type === 'aim') {
			const angle = Math.atan2(targetY - y, targetX - x);
			projectiles.push(
					new Projectile(x, y, angle, this.speed, this.size, this.color)
			);
		} else if (this.type === 'multi') {
			this.customAngles.forEach(angle =>
					projectiles.push(
							new Projectile(x, y, angle, this.speed, this.size, this.color)
					)
			);
		} else if (this.type === 'fan') {
			fireShotgunPattern(x, y, targetX, targetY, projectiles, {
				spread: this.fanSpread,
				count: this.fanCount,
				speed: this.speed,
				size: this.size,
				color: this.color,
			});
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
			const angles: number[] = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
			angles.forEach(angle =>
					projectiles.push(
							new Projectile(x, y, angle, this.speed, this.size, this.color)
					)
			);
		}
	}

	public addDirection(angle: number): void {
		this.type = 'multi';

		// Инициализируем customAngles, если вдруг он undefined
		if (!this.customAngles) {
			this.customAngles = [0];
		}

		this.customAngles.push(angle);
	}

	public setFourDirections(): void {
		this.type = 'four';
	}

	public setFanShot(): void {
		this.type = 'fan';
	}

	public increaseFanCount(delta: number = 1): void {
		this.fanCount = Math.max(2, this.fanCount + delta);
	}

	public increaseFanSpread(delta: number = Math.PI / 18): void {
		this.fanSpread = Math.min(Math.PI, this.fanSpread + delta);
	}

	public addExtraBullet(): void {
		this.type = 'multi';

		// Инициализируем customAngles, если вдруг он undefined
		if (!this.customAngles) {
			this.customAngles = [0];
		}

		this.customAngles.push(0.1);
	}

	// Геттеры для доступа к свойствам (опционально)
	public getDamage(): number {
		return this.damage;
	}

	public getType(): WeaponType {
		return this.type;
	}
}
