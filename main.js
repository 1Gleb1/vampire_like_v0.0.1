import { Camera } from './camera.js';
import { spawnEnemy } from './enemy.js';
import { Particle } from './particle.js';
import { Player } from './player.js';
import { getAvailableUpgrades } from './upgrades.js';

let mouseX = 0;
let mouseY = 0;

export const MAP_WIDTH = 4000;
export const MAP_HEIGHT = 4000;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const ui = document.getElementById('ui');

const player = new Player();
const camera = new Camera(player, canvas);

const enemies = [];
const projectiles = [];
const particles = [];
const keys = {};

let isPaused = false;
let upgradeCards = [];

canvas.addEventListener('mousemove', e => {
	const rect = canvas.getBoundingClientRect();
	mouseX = e.clientX - rect.left;
	mouseY = e.clientY - rect.top;
});
document.addEventListener('keydown', e => {
	if (!isPaused) keys[e.key] = true;
});
document.addEventListener('keyup', e => (keys[e.key] = false));

function showUpgradeCards() {
	isPaused = true;
	upgradeCards = [];

	const availableUpgrades = getAvailableUpgrades(player);

	const shuffled = availableUpgrades.sort(() => 0.5 - Math.random());
	upgradeCards = shuffled.slice(0, 3);
	drawUpgradeCards();
}

function showGameOver() {
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
			isPaused = false;
		}
	});
});

function drawUpgradeCards() {
	ctx.fillStyle = 'rgba(0,0,0,0.8)';
	const camX = canvas.width / 2;
	const camY = canvas.height / 2;

	ctx.fillRect(-camX, -camY, MAP_WIDTH, MAP_HEIGHT);

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

function update() {
	if (isPaused) return;

	if (player.hp <= 0) {
		isPaused = true;
		showGameOver();
		return;
	}

	player.move(keys);
	player.shoot(projectiles, mouseX, mouseY, camera);

	player.castChainLightning(enemies, particles);

	camera.update();

	enemies.forEach(e => {
		e.move(player);
		e.shoot(player, projectiles);
		if (Math.hypot(player.x - e.x, player.y - e.y) < player.size + e.size) {
			player.hp -= e.type === 'fast' ? 1 : 2;
		}
	});

	for (let i = projectiles.length - 1; i >= 0; i--) {
		const p = projectiles[i];
		p.update();
		if (
			p.x < 0 ||
			p.x > MAP_WIDTH ||
			p.y < 0 ||
			p.y > MAP_HEIGHT ||
			p.isDead()
		) {
			projectiles.splice(i, 1);
		}

		for (let j = enemies.length - 1; j >= 0; j--) {
			const e = enemies[j];
			if (
				p.color === 'yellow' &&
				Math.hypot(p.x - e.x, p.y - e.y) < p.size + e.size
			) {
				e.hp -= 20;
				projectiles.splice(i, 1);
				if (e.hp <= 0) {
					enemies.splice(j, 1);
					player.xp += 10;
					for (let k = 0; k < 10; k++)
						particles.push(new Particle(e.x, e.y, e.color));

					if (player.xp >= player.level * 50) {
						player.level++;
						player.xp = 0;
						showUpgradeCards();
					}
				}
				break;
			}
		}
		if (p.isDead() || p.x < 0 || p.x > 4000 || p.y < 0 || p.y > 4000) {
			projectiles.splice(i, 1);
		}

		if (
			p.color === 'pink' &&
			Math.hypot(p.x - player.x, p.y - player.y) < p.size + player.size
		) {
			player.hp -= 5;
			projectiles.splice(i, 1);
		}

		if (p.x < 0 || p.x > 4000 || p.y < 0 || p.y > 4000)
			projectiles.splice(i, 1);
	}

	for (let i = particles.length - 1; i >= 0; i--) {
		const part = particles[i];
		part.update();
		if (part.life <= 0) particles.splice(i, 1);
	}

	if (Math.random() < 0.02) {
		const typeRand = Math.random();
		const type =
			typeRand < 0.15 ? 'shooter' : typeRand < 0.35 ? 'fast' : 'normal';
		spawnEnemy(type, enemies);
	}
}

function draw() {
	if (isPaused && player.hp <= 0) {
		showGameOver();
		return;
	}
	if (isPaused) {
		drawUpgradeCards();
		return;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// центр экрана
	const camX = player.x - canvas.width / 2;
	const camY = player.y - canvas.height / 2;

	// фон карты
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

		player.lastChainEffect.chains.forEach((chain, chainIndex) => {
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

	ui.innerHTML = `HP: ${player.hp}/${player.maxHp} | Level: ${
		player.level
	} | XP: ${player.xp} | Enemies: ${enemies.length}${
		player.hasChainLightning
			? ` | Chain Lightning: ${
					Date.now() - player.lastChainLightning >=
					player.chainLightningCooldown
						? 'Ready'
						: 'Cooldown'
			  }`
			: ''
	}`;
}

function loop() {
	update();
	draw();
	requestAnimationFrame(loop);
}

loop();
