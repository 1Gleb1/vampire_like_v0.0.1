import { spawnEnemy } from '../entities/enemy.js';
import {
	camera,
	difficultyLevel,
	enemies,
	isPaused,
	keys,
	maybeIncreaseDifficulty,
	mouseX,
	mouseY,
	particles,
	player,
	projectiles,
	triggerScreenBlink,
} from '../shared/lib/state.js';
import { showGameOver } from '../ui/ui.js';

export function update() {
	if (isPaused) return;

	maybeIncreaseDifficulty();

	if (player.hp <= 0) {
		showGameOver();
		return;
	}

	player.update(keys, projectiles, mouseX, mouseY, camera, enemies, particles);
	camera.update();

	enemies.forEach(e => {
		e.update(player, projectiles);
		if (Math.hypot(player.x - e.x, player.y - e.y) < player.size + e.size) {
			player.hp -= e.type === 'fast' ? 1 : 2;
			triggerScreenBlink('red', 250);
		}
	});

	for (let i = projectiles.length - 1; i >= 0; i--) {
		const p = projectiles[i];
		p.update();
		if (p.checkCollisions(enemies, player, particles)) {
			projectiles.splice(i, 1);
		}
	}

	for (let i = particles.length - 1; i >= 0; i--) {
		const part = particles[i];
		part.update();
		if (part.life <= 0) particles.splice(i, 1);
	}

	const spawnChance = 0.02 + (difficultyLevel - 1) * 0.005;
	if (Math.random() < Math.min(spawnChance, 0.15)) {
		const typeRand = Math.random();
		const shooterOdds = 0.15 + (difficultyLevel - 1) * 0.02;
		const fastOdds = 0.35 + (difficultyLevel - 1) * 0.02;
		const type =
			typeRand < shooterOdds
				? 'shooter'
				: typeRand < fastOdds
				? 'fast'
				: 'normal';
		spawnEnemy(type, enemies);
	}
}
