import { Particle } from './particle.js';
import { spawnEnemy } from './enemy.js';
import {
	MAP_WIDTH,
	MAP_HEIGHT,
	player,
	camera,
	enemies,
	projectiles,
	particles,
	keys,
	isPaused,
	mouseX,
	mouseY,
} from './state.js';
import { showGameOver, showUpgradeCards } from './ui.js';

export function update() {
	if (isPaused) return;

	if (player.hp <= 0) {
		showGameOver();
		return;
	}

	player.move(keys);
	player.shoot(projectiles, mouseX, mouseY, camera);
	player.castChainLightning(enemies, particles);
	camera.update();

	enemies.forEach(e => {
		e.move(player);
		e.shoot(player, projectiles);
		if (Math.hypot(player.x - e.x, player.y - e.y) < player.size + e.size) {
			player.hp -= e.type === 'fast' ? 1 : 2;
		}
	});

	for (let i = projectiles.length - 1; i >= 0; i--) {
		const p = projectiles[i];
		p.update();
		if (
			p.x < 0 ||
			p.x > MAP_WIDTH ||
			p.y < 0 ||
			p.y > MAP_HEIGHT ||
			p.isDead()
		) {
			projectiles.splice(i, 1);
		}

		for (let j = enemies.length - 1; j >= 0; j--) {
			const e = enemies[j];
			if (
				p.color === 'yellow' &&
				Math.hypot(p.x - e.x, p.y - e.y) < p.size + e.size
			) {
				e.hp -= 20;
				projectiles.splice(i, 1);
				if (e.hp <= 0) {
					enemies.splice(j, 1);
					player.xp += 10;
					for (let k = 0; k < 10; k++) particles.push(new Particle(e.x, e.y, e.color));

					if (player.xp >= player.level * 50) {
						player.level++;
						player.xp = 0;
						showUpgradeCards();
					}
				}
				break;
			}
		}
		if (p.isDead() || p.x < 0 || p.x > 4000 || p.y < 0 || p.y > 4000) {
			projectiles.splice(i, 1);
		}

		if (
			p.color === 'pink' &&
			Math.hypot(p.x - player.x, p.y - player.y) < p.size + player.size
		) {
			player.hp -= 5;
			projectiles.splice(i, 1);
		}

		if (p.x < 0 || p.x > 4000 || p.y < 0 || p.y > 4000) projectiles.splice(i, 1);
	}

	for (let i = particles.length - 1; i >= 0; i--) {
		const part = particles[i];
		part.update();
		if (part.life <= 0) particles.splice(i, 1);
	}

	if (Math.random() < 0.02) {
		const typeRand = Math.random();
		const type = typeRand < 0.15 ? 'shooter' : typeRand < 0.35 ? 'fast' : 'normal';
		spawnEnemy(type, enemies);
	}
}


