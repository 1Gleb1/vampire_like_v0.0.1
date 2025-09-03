import { MAP_HEIGHT, MAP_WIDTH } from './main.js';
import { Particle } from './particle.js';
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

		this.hasChainLightning = false;
		this.chainLightningCooldown = 3000;
		this.lastChainLightning = 0;
		this.chainLightningRadius = 150;
		this.chainLightningDamage = 30;
		this.lastChainEffect = null;

		this.chainLightningTargets = 1;
		this.chainLightningBounceRadius = 100;
		this.chainLightningMaxLength = 5;
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

	castChainLightning(enemies, particles) {
		if (!this.hasChainLightning) return false;

		const now = Date.now();
		if (now - this.lastChainLightning < this.chainLightningCooldown)
			return false;

		const initialEnemies = [];
		const hitEnemies = new Set();

		for (
			let targetIndex = 0;
			targetIndex < this.chainLightningTargets;
			targetIndex++
		) {
			let nearestEnemy = null;
			let nearestDistance = Infinity;

			enemies.forEach(enemy => {
				if (hitEnemies.has(enemy)) return;

				const distance = Math.hypot(this.x - enemy.x, this.y - enemy.y);
				if (
					distance <= this.chainLightningRadius &&
					distance < nearestDistance
				) {
					nearestEnemy = enemy;
					nearestDistance = distance;
				}
			});

			if (nearestEnemy) {
				initialEnemies.push(nearestEnemy);
				hitEnemies.add(nearestEnemy);
			} else {
				break;
			}
		}

		if (initialEnemies.length === 0) return false;

		this.lastChainEffect = {
			chains: [],
			timestamp: now,
		};

		initialEnemies.forEach((initialEnemy, chainIndex) => {
			const chainEnemies = [];
			let currentEnemy = initialEnemy;
			let chainCount = 0;

			while (currentEnemy && chainCount < this.chainLightningMaxLength) {
				chainEnemies.push({
					x: currentEnemy.x,
					y: currentEnemy.y,
				});

				currentEnemy.hp -= this.chainLightningDamage;

				const particleCount = this.chainLightningTargets > 1 ? 20 : 15;
				for (let i = 0; i < particleCount; i++) {
					particles.push(
						new Particle(currentEnemy.x, currentEnemy.y, '#00ffff')
					);
				}

				if (currentEnemy.hp <= 0) {
					const enemyIndex = enemies.indexOf(currentEnemy);
					if (enemyIndex > -1) {
						enemies.splice(enemyIndex, 1);
						this.xp += 10;
						for (let k = 0; k < 10; k++) {
							particles.push(
								new Particle(currentEnemy.x, currentEnemy.y, currentEnemy.color)
							);
						}
					}
				}

				let nextEnemy = null;
				let nextDistance = Infinity;

				enemies.forEach(enemy => {
					if (hitEnemies.has(enemy)) return;

					const distance = Math.hypot(
						currentEnemy.x - enemy.x,
						currentEnemy.y - enemy.y
					);
					if (
						distance <= this.chainLightningBounceRadius &&
						distance < nextDistance
					) {
						nextEnemy = enemy;
						nextDistance = distance;
					}
				});

				currentEnemy = nextEnemy;
				if (currentEnemy) hitEnemies.add(currentEnemy);
				chainCount++;
			}

			this.lastChainEffect.chains.push(chainEnemies);
		});

		this.lastChainLightning = now;
		return true;
	}
}
