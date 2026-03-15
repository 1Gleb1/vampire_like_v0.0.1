import { Camera } from '../../systems/camera.ts';
import { MAP_HEIGHT, MAP_WIDTH } from '../../core/constants.js';
import {Enemy, Particle, Player, Projectile} from '../../entities';
import type {KeysPressed} from "../../entities/player.ts";
import type {UpgradeEffect} from "../../systems/upgrades.ts";

export const canvas = document.getElementById('game') as HTMLCanvasElement;
export const ctx = (canvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
export const ui = document.getElementById('ui') as HTMLDivElement;

export let mouseX = 0;
export let mouseY = 0;

export function setMouse(x: number, y: number) {
    mouseX = x;
    mouseY = y;
}

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

export const player = new Player();
export const camera = new Camera(player, canvas);

export const enemies: Enemy[] = [];
export const projectiles: Projectile[] = [];
export const particles: Particle[] = [];
export const keys: KeysPressed = {};

export let isPaused = false;
export function setPaused(val: boolean) {
    isPaused = val;
}

export let upgradeCards: UpgradeEffect[] = [];
export function setUpgradeCards(cards: UpgradeEffect[]) {
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

interface ScreenBlink {
    start: number;
    duration: number;
    color: string;
}

export const screenBlinks: ScreenBlink[] = [];
export function triggerScreenBlink(color = 'white', duration = 400) {
    screenBlinks.push({ start: Date.now(), duration, color });
}


