import { Weapon } from './weapon.js';

export const allUpgrades = [
	{ name: 'Стрельба веером', effect: player => player.weapons[0].setFanShot() },
	{
		name: 'Автоматическая стрельба',
		effect: player => (player.fireRate = Math.max(50, player.fireRate - 100)),
	},
	{
		name: 'Сфера вокруг',
		effect: player => player.weapons.push(new Weapon('splash', 5, 5, 'orange')),
	},

	// Защита
	{
		name: 'Увеличение HP',
		effect: player => {
			player.maxHp += 20;
			player.hp += 20;
		},
	},
	// { name: 'Самовосстановление', effect: player => (player.selfHeal = true) },
	// { name: 'Щит', effect: player => (player.hasShield = true) },

	// Скорость
	{ name: 'Скорость движения', effect: player => (player.speed += 0.5) },
	{
		name: 'Скорость пули',
		effect: player => player.weapons.forEach(w => (w.speed += 1)),
	},

	// Особые способности
	// {
	// 	name: 'Взрыв при убийстве',
	// 	effect: player => (player.hasExplosion = true),
	// },
	// { name: 'Замедление врагов', effect: player => (player.slowEnemies = true) },
	// { name: 'Привлечение XP', effect: player => (player.xpMagnet = true) },
];
