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
	upgradeCards,
} from '../shared/lib/state.js';
import {
	drawPauseOverlay,
	drawUpgradeCards,
	showGameOver,
	updateHud,
} from '../ui/ui.js';

export function draw() {
	if (player.hp <= 0) {
		showGameOver();
		return;
	}
	if (isPaused) {
		if (player.hp > 0) {
			if (typeof upgradeCards !== 'undefined' && upgradeCards.length > 0) {
				drawUpgradeCards();
			} else {
				drawPauseOverlay();
			}
		}
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

	player.draw(ctx, camX, camY);

	enemies.forEach(e => {
		e.draw(ctx, camX, camY);
	});

	projectiles.forEach(p => {
		p.draw(ctx, camX, camY);
	});

	particles.forEach(part => {
		part.draw(ctx, camX, camY);
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
			const color =
				blink.color === 'yellow'
					? '255,255,0'
					: blink.color === 'red'
					? '255,0,0'
					: blink.color === 'cyan'
					? '0,255,255'
					: '255,255,255';
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


	updateHud(enemies.length);
}
