import { MAP_WIDTH, MAP_HEIGHT } from './constants.js';
import { Player } from './player.js';
import { Camera } from './camera.js';

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
export const ui = document.getElementById('ui');

export let mouseX = 0;
export let mouseY = 0;

export function setMouse(x, y) {
	mouseX = x;
	mouseY = y;
}

export function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

export const player = new Player();
export const camera = new Camera(player, canvas);

export const enemies = [];
export const projectiles = [];
export const particles = [];
export const keys = {};

export let isPaused = false;
export function setPaused(val) {
	isPaused = val;
}

export let upgradeCards = [];
export function setUpgradeCards(cards) {
	upgradeCards = cards;
}

export { MAP_WIDTH, MAP_HEIGHT };


