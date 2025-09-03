const spellCategories = {
	chainLightning: {
		base: {
			name: 'Цепная молния',
			effect: player => {
				player.hasChainLightning = true;
			},
		},
		modifications: [
			{
				name: '+1 цель молнии',
				effect: player => {
					player.chainLightningTargets += 1;
				},
			},
			{
				name: 'Усиленная молния',
				effect: player => {
					player.chainLightningDamage += 15;
				},
			},
			{
				name: 'Радиус срабатывания молнии',
				effect: player => {
					player.chainLightningRadius += 50;
				},
			},
			{
				name: 'Радиус отскока молнии',
				effect: player => {
					player.chainLightningBounceRadius = 150;
				},
			},
			{
				name: 'Перезарядка молнии',
				effect: player => {
					player.chainLightningCooldown = Math.max(
						1000,
						player.chainLightningCooldown - 500
					);
				},
			},
			{
				name: 'Длинная цепь',
				effect: player => {
					player.chainLightningMaxLength += 3;
				},
			},
		],
	},
};

const basicUpgrades = [
	{ name: 'Стрельба веером', effect: player => player.weapons[0].setFanShot() },
	{
		name: 'Автоматическая стрельба',
		effect: player => (player.fireRate = Math.max(50, player.fireRate - 100)),
	},
	{
		name: 'Увеличение HP',
		effect: player => {
			player.maxHp += 20;
			player.hp += 20;
		},
	},
	{ name: 'Скорость движения', effect: player => (player.speed += 0.5) },
	// {
	// 	name: 'Скорость пули',
	// 	effect: player => player.weapons.forEach(w => (w.speed += 1)),
	// },
];

export function getAvailableUpgrades(player) {
	const availableUpgrades = [...basicUpgrades];

	Object.values(spellCategories).forEach(spellCategory => {
		if (spellCategory.base && !player.hasChainLightning) {
			availableUpgrades.push(spellCategory.base);
		} else if (spellCategory.modifications && player.hasChainLightning) {
			availableUpgrades.push(...spellCategory.modifications);
		}
	});

	return availableUpgrades;
}

export const allUpgrades = basicUpgrades;
