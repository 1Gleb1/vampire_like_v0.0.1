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
} from '../shared/lib/state.ts';
import { getAvailableUpgrades, type UpgradeEffect } from '../systems/upgrades.ts';

export function showUpgradeCards(): void {
	setPaused(true);
	const availableUpgrades = getAvailableUpgrades(player);
	const shuffled = availableUpgrades.sort(() => 0.5 - Math.random());
	const selection = shuffled.slice(0, 3);

	// Очищаем массив upgradeCards
	upgradeCards.length = 0;
	upgradeCards.push(...selection);

	drawUpgradeCards();
}

export function showGameOver(): void {
	ctx.fillStyle = 'rgba(0,0,0,0.8)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'red';
	ctx.font = '48px sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText('ПОРАЖЕНИЕ', canvas.width / 2, canvas.height / 2 - 60);

	// Кнопка "Начать заново"
	const restartBtnX = canvas.width / 2 - 150;
	const restartBtnY = canvas.height / 2 + 20;
	const restartBtnW = 140;
	const restartBtnH = 50;

	ctx.fillStyle = '#4CAF50';
	ctx.fillRect(restartBtnX, restartBtnY, restartBtnW, restartBtnH);
	ctx.fillStyle = 'white';
	ctx.font = '20px sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('Начать заново', restartBtnX + restartBtnW/2, restartBtnY + restartBtnH/2);

	// Кнопка "На главную"
	const mainMenuBtnX = canvas.width / 2 + 10;
	const mainMenuBtnY = canvas.height / 2 + 20;
	const mainMenuBtnW = 140;
	const mainMenuBtnH = 50;

	ctx.fillStyle = '#2196F3';
	ctx.fillRect(mainMenuBtnX, mainMenuBtnY, mainMenuBtnW, mainMenuBtnH);
	ctx.fillStyle = 'white';
	ctx.fillText('На главную', mainMenuBtnX + mainMenuBtnW/2, mainMenuBtnY + mainMenuBtnH/2);

	// Сохраняем координаты кнопок для обработки кликов
	window.gameOverButtons = {
		restart: { x: restartBtnX, y: restartBtnY, w: restartBtnW, h: restartBtnH },
		mainMenu: { x: mainMenuBtnX, y: mainMenuBtnY, w: mainMenuBtnW, h: mainMenuBtnH }
	};
}

export function bindUpgradeClick(): void {
	canvas.addEventListener('click', (e: MouseEvent) => {
		const rect = canvas.getBoundingClientRect();
		const mx = e.clientX - rect.left;
		const my = e.clientY - rect.top;

		// Проверяем клики по кнопкам на экране поражения
		if (window.gameOverButtons) {
			const { restart, mainMenu } = window.gameOverButtons;

			// Кнопка "Начать заново" - перезагрузка страницы
			if (mx >= restart.x && mx <= restart.x + restart.w &&
					my >= restart.y && my <= restart.y + restart.h) {
				window.location.reload();
				return;
			}

			// Кнопка "На главную" - переход на главную страницу
			if (mx >= mainMenu.x && mx <= mainMenu.x + mainMenu.w &&
					my >= mainMenu.y && my <= mainMenu.y + mainMenu.h) {
				window.location.href = '/';
				return;
			}
		}

		if (!isPaused) return;

		const cardWidth = 150;
		const cardSpacing = 30;
		const totalWidth =
				upgradeCards.length * cardWidth + (upgradeCards.length - 1) * cardSpacing;
		const startX = (canvas.width - totalWidth) / 2;

		upgradeCards.forEach((card: UpgradeEffect, index: number) => {
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

export function drawUpgradeCards(): void {
	ctx.fillStyle = 'rgba(32, 32, 32, 0.66)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const cardWidth = 150;
	const cardSpacing = 30;
	const totalWidth =
			upgradeCards.length * cardWidth + (upgradeCards.length - 1) * cardSpacing;
	const startX = (canvas.width - totalWidth) / 2;

	upgradeCards.forEach((card: UpgradeEffect, index: number) => {
		const x = startX + index * (cardWidth + cardSpacing);
		const y = canvas.height / 2 - 60;
		const w = cardWidth;
		const h = 120;

		// Фон карточки
		ctx.fillStyle = 'white';
		ctx.fillRect(x, y, w, h);

		// Текст карточки
		ctx.fillStyle = 'black';
		ctx.font = '16px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(card.name, x + w / 2, y + h / 2);
	});
}

export function drawPauseOverlay(): void {
	ctx.fillStyle = 'rgba(0,0,0,0.6)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '48px sans-serif';
	ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2 - 40);

	ctx.font = '20px sans-serif';
	ctx.fillText(
			'Нажмите Esc, чтобы продолжить',
			canvas.width / 2,
			canvas.height / 2 + 4
	);
}

export function updateHud(enemiesCount: number): void {
	const secondsLeft = Math.max(
			0,
			Math.ceil((nextDifficultyAt - Date.now()) / 1000)
	);

	const chainLightningStatus = player.hasChainLightning
			? Date.now() - player.lastChainLightning >= player.chainLightningCooldown
					? 'Ready'
					: 'Cooldown'
			: '';

	const chainLightningHtml = player.hasChainLightning
			? ` | Chain Lightning: ${chainLightningStatus}`
			: '';

	ui.innerHTML = `<div>HP: ${player.hp}/${player.maxHp} | Level: ${
			player.level
	} | XP: ${player.xp} / ${player.level * 50} | Enemies: ${enemiesCount}${chainLightningHtml}</div>
	<div>Difficulty: ${difficultyLevel} | Next in: ${secondsLeft}s</div>`;
}

// Добавляем объявление типа для window
declare global {
	interface Window {
		gameOverButtons?: {
			restart: { x: number; y: number; w: number; h: number };
			mainMenu: { x: number; y: number; w: number; h: number };
		};
	}
}
