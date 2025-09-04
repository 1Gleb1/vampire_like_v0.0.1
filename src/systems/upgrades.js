const spellCategories = {
	chainLightning: {
		flag: 'hasChainLightning',
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
					player.chainLightningBounceRadius += 50;
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
	fanShot: {
		flag: 'hasFanShot',
		base: {
			name: 'Стрельба веером',
			effect: player => {
				player.hasFanShot = true;
				if (player.weapons && player.weapons[0]) player.weapons[0].setFanShot();
			},
		},
		modifications: [
			{
				name: '+1 пуля веера',
				effect: player => {
					const w = player.weapons && player.weapons[0];
					if (w && typeof w.increaseFanCount === 'function')
						w.increaseFanCount(1);
				},
			},
			{
				name: 'Шире веер',
				effect: player => {
					const w = player.weapons && player.weapons[0];
					if (w && typeof w.increaseFanSpread === 'function')
						w.increaseFanSpread(Math.PI / 18);
				},
			},
			{
				name: 'Быстрые пули (веер)',
				effect: player => {
					const w = player.weapons && player.weapons[0];
					if (w) w.speed += 1;
				},
			},
		],
	},
	rotatingBlade: {
		flag: 'hasRotatingBlade',
		base: {
			name: 'Вращающееся лезвие',
			effect: player => {
				player.hasRotatingBlade = true;
			},
		},
		modifications: [],
	},
};

const basicUpgrades = [
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
		const flag = spellCategory.flag;
		if (spellCategory.base && flag && !player[flag]) {
			availableUpgrades.push(spellCategory.base);
		} else if (spellCategory.modifications && flag && player[flag]) {
			availableUpgrades.push(...spellCategory.modifications);
		}
	});

	return availableUpgrades;
}

export const allUpgrades = basicUpgrades;
