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
	screenBlinks,
} from '../shared/lib/state.js';
import { drawUpgradeCards, showGameOver, updateHud } from '../ui/ui.js';

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

	const gridSize = 150;
	const startX = Math.max(0, Math.floor(camX / gridSize) * gridSize);
	const startY = Math.max(0, Math.floor(camY / gridSize) * gridSize);
	const endX = Math.min(
		MAP_WIDTH,
		Math.ceil((camX + camera.canvas.width) / gridSize) * gridSize
	);
	const endY = Math.min(
		MAP_HEIGHT,
		Math.ceil((camY + camera.canvas.height) / gridSize) * gridSize
	);

	ctx.fillStyle = '#222';
	ctx.strokeStyle = '#444';
	ctx.lineWidth = 1;

	for (let gx = startX; gx < endX; gx += gridSize) {
		for (let gy = startY; gy < endY; gy += gridSize) {
			const drawX = gx - camX;
			const drawY = gy - camY;
			const drawWidth = Math.min(gridSize, MAP_WIDTH - gx);
			const drawHeight = Math.min(gridSize, MAP_HEIGHT - gy);
			ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
			ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
		}
	}

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

		const maxHp = e.maxHp ?? (e.type === 'fast' ? 20 : e.type === 'shooter' ? 30 : 40);
		const hpBarWidth = 50;
		const hpBarHeight = 6;
		const hpBarX = e.x - camX - hpBarWidth / 2;
		const hpBarY = e.y - camY - e.size - 10;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

		const hpPercentage = Math.max(0, Math.min(1, e.hp / maxHp));
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
		// ctx.fillText(`${e.hp}/${maxHp}`, hpBarX + hpBarWidth / 2, hpBarY + hpBarHeight / 2 + 0.5); // колличество здоровья у врага
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

	if (screenBlinks.length > 0) {
		const now = Date.now();
		const cx = camera.canvas.width / 2;
		const cy = camera.canvas.height / 2;
		for (let i = screenBlinks.length - 1; i >= 0; i--) {
			const blink = screenBlinks[i];
			const t = (now - blink.start) / blink.duration;
			if (t >= 1) {
				screenBlinks.splice(i, 1);
				continue;
			}
			const ease = 1 - Math.pow(1 - t, 3);
			const maxRadius = Math.hypot(camera.canvas.width, camera.canvas.height);
			const radius = ease * maxRadius;
			const alpha = 0.3 * (1 - ease); 
			const color = blink.color === 'yellow' ? '255,255,0' : blink.color === 'red' ? '255,0,0' : blink.color === 'cyan' ? '0,255,255' : '255,255,255';
			const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
			gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
			gradient.addColorStop(0.5, `rgba(${color}, ${alpha * 0.4})`);
			gradient.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(cx, cy, radius, 0, Math.PI * 2);
			ctx.fill();
		}
	}

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
