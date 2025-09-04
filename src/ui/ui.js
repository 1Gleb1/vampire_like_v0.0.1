import {
	canvas,
	ctx,
	difficultyLevel,
	isPaused,
	nextDifficultyAt,
	player,
	setPaused,
	setUpgradeCards,
	ui,
	upgradeCards,
} from '../shared/lib/state.js';
import { getAvailableUpgrades } from '../systems/upgrades.js';

export function showUpgradeCards() {
	setPaused(true);
	const availableUpgrades = getAvailableUpgrades(player);
	const shuffled = availableUpgrades.sort(() => 0.5 - Math.random());
	const selection = shuffled.slice(0, 3);
	upgradeCards.length = 0;
	upgradeCards.push(...selection);
	drawUpgradeCards();
}

export function showGameOver() {
	ctx.fillStyle = 'rgba(0,0,0,0.8)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'red';
	ctx.font = '48px sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText('ПОРАЖЕНИЕ', canvas.width / 2, canvas.height / 2 - 20);
	ctx.font = '24px sans-serif';
	ctx.fillText(
		'Обновите страницу, чтобы начать заново',
		canvas.width / 2,
		canvas.height / 2 + 20
	);
}

export function bindUpgradeClick() {
	canvas.addEventListener('click', e => {
		if (!isPaused) return;
		const rect = canvas.getBoundingClientRect();
		const mx = e.clientX - rect.left;
		const my = e.clientY - rect.top;

		const cardWidth = 150;
		const cardSpacing = 30;
		const totalWidth =
			upgradeCards.length * cardWidth + (upgradeCards.length - 1) * cardSpacing;
		const startX = (canvas.width - totalWidth) / 2;

		upgradeCards.forEach((card, index) => {
			const x = startX + index * (cardWidth + cardSpacing);
			const y = canvas.height / 2 - 60;
			const w = cardWidth;
			const h = 120;
			if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
				card.effect(player);
				setPaused(false);
				setUpgradeCards([]);
			}
		});
	});
}

export function drawUpgradeCards() {
	ctx.fillStyle = 'rgba(32, 32, 32, 0.66)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const cardWidth = 150;
	const cardSpacing = 30;
	const totalWidth =
		upgradeCards.length * cardWidth + (upgradeCards.length - 1) * cardSpacing;
	const startX = (canvas.width - totalWidth) / 2;

	upgradeCards.forEach((card, index) => {
		const x = startX + index * (cardWidth + cardSpacing);
		const y = canvas.height / 2 - 60;
		const w = cardWidth;
		const h = 120;

		ctx.fillStyle = 'white';
		ctx.fillRect(x, y, w, h);
		ctx.fillStyle = 'black';
		ctx.font = '16px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText(card.name, x + w / 2, y + 60);
	});
}

export function drawPauseOverlay() {
	ctx.fillStyle = 'rgba(0,0,0,0.6)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.font = '48px sans-serif';
	ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2 - 40);

	ctx.font = '20px sans-serif';
	ctx.fillText(
		'Нажмите Esc, чтобы продолжить',
		canvas.width / 2,
		canvas.height / 2 + 4
	);
}

export function updateHud(enemiesCount) {
	const secondsLeft = Math.max(
		0,
		Math.ceil((nextDifficultyAt - Date.now()) / 1000)
	);
	ui.innerHTML = `<div>HP: ${player.hp}/${player.maxHp} | Level: ${
		player.level
	} | XP: ${player.xp} / ${player.level * 50} | Enemies: ${enemiesCount}${
		player.hasChainLightning
			? ` | Chain Lightning: ${
					Date.now() - player.lastChainLightning >=
					player.chainLightningCooldown
						? 'Ready'
						: 'Cooldown'
			  }`
			: ''
	}</div><div>Difficulty: ${difficultyLevel} | Next in: ${secondsLeft}s</div>`;
}
