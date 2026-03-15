import { Projectile } from '../../projectile.ts';

interface FanShotConfig {
	spread: number;
	count: number;
	speed: number;
	size: number;
	color: string;
}

export function fireShotgunPattern(
	x: number,
	y: number,
	targetX: number,
	targetY: number,
	projectiles: Projectile[],
	config: FanShotConfig,
): void {
	const centerAngle = Math.atan2(targetY - y, targetX - x);
	const spread = config.spread;
	const count = config.count;

	for (let i = 0; i < count; i++) {
		const angle = centerAngle - spread / 2 + (spread / (count - 1)) * i;
		projectiles.push(
			new Projectile(x, y, angle, config.speed, config.size, config.color),
		);
	}
}
