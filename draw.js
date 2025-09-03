import {
	camera,
	ctx,
	enemies,
	isPaused,
	MAP_HEIGHT,
	MAP_WIDTH,
	particles,
	player,
	projectiles,
} from './state.js';
import { drawUpgradeCards, showGameOver, updateHud } from './ui.js';

export function draw() {
	if (player.hp <= 0) {
		showGameOver();
		return;
	}
	if (isPaused) {
		drawUpgradeCards();
		return;
	}

	ctx.clearRect(0, 0, camera.canvas.width, camera.canvas.height);

	const camX = player.x - camera.canvas.width / 2;
	const camY = player.y - camera.canvas.height / 2;

	ctx.fillStyle = '#222';
	ctx.fillRect(-camX, -camY, MAP_WIDTH, MAP_HEIGHT);

	ctx.fillStyle = player.color;
	ctx.beginPath();
	ctx.arc(player.x - camX, player.y - camY, player.size, 0, Math.PI * 2);
	ctx.fill();

	if (player.hasChainLightning) {
		const isOnCooldown =
			Date.now() - player.lastChainLightning < player.chainLightningCooldown;
		ctx.strokeStyle = isOnCooldown
			? 'rgba(255, 0, 0, 0.3)'
			: 'rgba(0, 255, 255, 0.3)';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(
			player.x - camX,
			player.y - camY,
			player.chainLightningRadius,
			0,
			Math.PI * 2
		);
		ctx.stroke();

		if (!isOnCooldown) {
			ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(
				player.x - camX,
				player.y - camY,
				player.chainLightningBounceRadius,
				0,
				Math.PI * 2
			);
			ctx.stroke();
		}
	}

	enemies.forEach(e => {
		ctx.fillStyle = e.color;
		ctx.beginPath();
		ctx.arc(e.x - camX, e.y - camY, e.size, 0, Math.PI * 2);
		ctx.fill();

		const maxHp = e.type === 'fast' ? 20 : e.type === 'shooter' ? 30 : 40;
		const hpBarWidth = e.size * 2;
		const hpBarHeight = 4;
		const hpBarX = e.x - camX - hpBarWidth / 2;
		const hpBarY = e.y - camY - e.size - 10;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

		const hpPercentage = e.hp / maxHp;
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
		ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
	});

	projectiles.forEach(p => {
		ctx.fillStyle = p.color;
		ctx.beginPath();
		ctx.arc(p.x - camX, p.y - camY, p.size, 0, Math.PI * 2);
		ctx.fill();
	});

	particles.forEach(part => {
		ctx.fillStyle = part.color;
		ctx.beginPath();
		ctx.arc(part.x - camX, part.y - camY, 2, 0, Math.PI * 2);
		ctx.fill();
	});

	if (
		player.lastChainEffect &&
		Date.now() - player.lastChainEffect.timestamp < 500
	) {
		ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
		ctx.lineWidth = 3;
		player.lastChainEffect.chains.forEach(chain => {
			for (let i = 0; i < chain.length - 1; i++) {
				const current = chain[i];
				const next = chain[i + 1];
				ctx.beginPath();
				ctx.moveTo(current.x - camX, current.y - camY);
				ctx.lineTo(next.x - camX, next.y - camY);
				ctx.stroke();
			}
			if (chain.length > 0) {
				const first = chain[0];
				ctx.beginPath();
				ctx.moveTo(player.x - camX, player.y - camY);
				ctx.lineTo(first.x - camX, first.y - camY);
				ctx.stroke();
			}
		});
	}

	updateHud(enemies.length);
}
