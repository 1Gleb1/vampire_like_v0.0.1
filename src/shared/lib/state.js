import { Camera } from '../../systems/camera.js';
import { MAP_HEIGHT, MAP_WIDTH } from '../../core/constants.js';
import { Player } from '../../entities/player.js';

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

export { MAP_HEIGHT, MAP_WIDTH };

export let difficultyLevel = 1;
export let nextDifficultyAt = Date.now() + 30000;
export function resetDifficulty() {
    difficultyLevel = 1;
    nextDifficultyAt = Date.now() + 30000;
}
export function maybeIncreaseDifficulty(now = Date.now()) {
    if (now >= nextDifficultyAt) {
        difficultyLevel++;
        nextDifficultyAt = now + 30000;
        triggerScreenBlink('yellow', 600);
    }
}

export const screenBlinks = [];
export function triggerScreenBlink(color = 'white', duration = 400) {
    screenBlinks.push({ start: Date.now(), duration, color });
}


