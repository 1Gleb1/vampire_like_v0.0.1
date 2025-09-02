// ui.js — всё, что связано с интерфейсом (апгрейды, меню и т.п.)

let hoveredCardIndex = -1;

/**
 * Рисует выбор апгрейдов
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {Array<{name: string}>} upgrades
 */
export function drawUpgradeCards(ctx, canvas, upgrades) {
	const cardWidth = Math.min(250, canvas.width / 4);
	const cardHeight = 140;
	const spacing = 40;

	const totalWidth =
		upgrades.length * cardWidth + (upgrades.length - 1) * spacing;
	const startX = (canvas.width - totalWidth) / 2;
	const y = canvas.height / 2 - cardHeight / 2;

	// фон затемнения
	ctx.fillStyle = 'rgba(0,0,0,0.6)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	upgrades.forEach((upgrade, i) => {
		const x = startX + i * (cardWidth + spacing);

		// фон карточки
		ctx.fillStyle =
			i === hoveredCardIndex ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.8)';
		ctx.fillRect(x, y, cardWidth, cardHeight);

		// рамка
		ctx.strokeStyle = i === hoveredCardIndex ? 'yellow' : 'white';
		ctx.lineWidth = 3;
		ctx.strokeRect(x, y, cardWidth, cardHeight);

		// название апгрейда
		ctx.fillStyle = 'white';
		ctx.font = 'bold 20px Arial';
		ctx.fillText(upgrade.name, x + cardWidth / 2, y + cardHeight / 2);
	});
}

/**
 * Обновляет hoveredCardIndex при движении мыши
 */
export function handleUpgradeMouseMove(e, canvas, upgrades) {
	const cardWidth = Math.min(250, canvas.width / 4);
	const cardHeight = 140;
	const spacing = 40;

	const totalWidth =
		upgrades.length * cardWidth + (upgrades.length - 1) * spacing;
	const startX = (canvas.width - totalWidth) / 2;
	const y = canvas.height / 2 - cardHeight / 2;

	hoveredCardIndex = -1;

	upgrades.forEach((_, i) => {
		const x = startX + i * (cardWidth + spacing);
		if (
			e.offsetX >= x &&
			e.offsetX <= x + cardWidth &&
			e.offsetY >= y &&
			e.offsetY <= y + cardHeight
		) {
			hoveredCardIndex = i;
		}
	});
}

/**
 * Возвращает выбранный апгрейд (или null, если клик мимо)
 */
export function handleUpgradeClick(upgrades) {
	if (hoveredCardIndex !== -1) {
		return upgrades[hoveredCardIndex];
	}
	return null;
}
