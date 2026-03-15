import {Player} from "../entities";


export interface UpgradeEffect {
	name: string;
	effect: (player: Player) => void;
}

interface SpellCategory {
	flag: keyof Player; // Ключ игрока, который указывает на наличие заклинания
	base: UpgradeEffect;
	modifications: UpgradeEffect[];
}

interface SpellCategories {
	[key: string]: SpellCategory;
}

const spellCategories: SpellCategories = {
	chainLightning: {
		flag: 'hasChainLightning',
		base: {
			name: 'Цепная молния',
			effect: (player: Player) => {
				player.hasChainLightning = true;
			},
		},
		modifications: [
			{
				name: '+1 цель молнии',
				effect: (player: Player) => {
					player.chainLightningTargets += 1;
				},
			},
			{
				name: 'Усиленная молния',
				effect: (player: Player) => {
					player.chainLightningDamage += 15;
				},
			},
			{
				name: 'Радиус срабатывания молнии',
				effect: (player: Player) => {
					player.chainLightningRadius += 50;
				},
			},
			{
				name: 'Радиус отскока молнии',
				effect: (player: Player) => {
					player.chainLightningBounceRadius += 50;
				},
			},
			{
				name: 'Перезарядка молнии',
				effect: (player: Player) => {
					player.chainLightningCooldown = Math.max(
							1000,
							player.chainLightningCooldown - 500
					);
				},
			},
			{
				name: 'Длинная цепь',
				effect: (player: Player) => {
					player.chainLightningMaxLength += 3;
				},
			},
		],
	},
	fanShot: {
		flag: 'hasFanShot',
		base: {
			name: 'Стрельба веером',
			effect: (player: Player) => {
				player.hasFanShot = true;
				if (player.weapons && player.weapons[0]) {
					player.weapons[0].setFanShot();
				}
			},
		},
		modifications: [
			{
				name: '+1 пуля веера',
				effect: (player: Player) => {
					const w = player.weapons && player.weapons[0];
					if (w && typeof w.increaseFanCount === 'function') {
						w.increaseFanCount(1);
					}
				},
			},
			{
				name: 'Шире веер',
				effect: (player: Player) => {
					const w = player.weapons && player.weapons[0];
					if (w && typeof w.increaseFanSpread === 'function') {
						w.increaseFanSpread(Math.PI / 18);
					}
				},
			},
			{
				name: 'Быстрые пули (веер)',
				effect: (player: Player) => {
					const w = player.weapons && player.weapons[0];
					if (w) {
						w.speed += 1;
					}
				},
			},
		],
	},
	rotatingBlade: {
		flag: 'hasRotatingBlade',
		base: {
			name: 'Вращающееся лезвие',
			effect: (player: Player) => {
				player.hasRotatingBlade = true;
			},
		},
		modifications: [],
	},
};

const basicUpgrades: UpgradeEffect[] = [
	{
		name: 'Автоматическая стрельба',
		effect: (player: Player) => {
			player.fireRate = Math.max(50, player.fireRate - 100);
		},
	},
	{
		name: 'Увеличение HP',
		effect: (player: Player) => {
			player.maxHp += 20;
			player.hp += 20;
		},
	},
	{
		name: 'Скорость движения',
		effect: (player: Player) => {
			player.speed += 0.5;
		}
	},
	// {
	// 	name: 'Скорость пули',
	// 	effect: (player: Player) => {
	// 		player.weapons.forEach(w => (w.speed += 1));
	// 	},
	// },
];

export function getAvailableUpgrades(player: Player): UpgradeEffect[] {
	const availableUpgrades: UpgradeEffect[] = [...basicUpgrades];

	Object.values(spellCategories).forEach((spellCategory: SpellCategory) => {
		const flag = spellCategory.flag;

		if (spellCategory.base && flag && !player[flag]) {
			availableUpgrades.push(spellCategory.base);
		} else if (spellCategory.modifications && flag && player[flag]) {
			availableUpgrades.push(...spellCategory.modifications);
		}
	});

	return availableUpgrades;
}

export const allUpgrades: UpgradeEffect[] = basicUpgrades;
