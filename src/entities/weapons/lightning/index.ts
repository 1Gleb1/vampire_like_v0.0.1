import { ChainLightningAnimation } from "../../chainLightningAnimation.ts";
import type { Enemy } from "../../enemy/enemy.ts";
import { Particle } from "../../particle.ts";

export interface ChainEffect {
  chains: { x: number; y: number }[][];
  timestamp: number;
}

export interface LightningState {
  hasChainLightning: boolean;
  chainLightningCooldown: number;
  lastChainLightning: number;
  chainLightningRadius: number;
  chainLightningDamage: number;
  chainLightningTargets: number;
  chainLightningBounceRadius: number;
  chainLightningMaxLength: number;
  xp: number;
}

interface CastLightningParams {
  casterX: number;
  casterY: number;
  state: LightningState;
  enemies: Enemy[];
  particles: Particle[];
  now?: number;
}

export function castChainLightning({
  casterX,
  casterY,
  state,
  enemies,
  particles,
  now = Date.now(),
}: CastLightningParams): ChainEffect | null {
  if (!state.hasChainLightning) return null;
  if (now - state.lastChainLightning < state.chainLightningCooldown) return null;

  const initialEnemies: Enemy[] = [];
  const hitEnemies = new Set<Enemy>();

  for (let targetIndex = 0; targetIndex < state.chainLightningTargets; targetIndex++) {
    let nearestEnemy: Enemy | null = null;
    let nearestDistance = Infinity;

    enemies.forEach((enemy) => {
      if (hitEnemies.has(enemy)) return;
      const distance = Math.hypot(casterX - enemy.x, casterY - enemy.y);
      if (distance <= state.chainLightningRadius && distance < nearestDistance) {
        nearestEnemy = enemy;
        nearestDistance = distance;
      }
    });

    if (!nearestEnemy) break;
    initialEnemies.push(nearestEnemy);
    hitEnemies.add(nearestEnemy);
  }

  if (initialEnemies.length === 0) return null;

  const effect: ChainEffect = { chains: [], timestamp: now };

  initialEnemies.forEach((initialEnemy) => {
    const chainEnemies: { x: number; y: number }[] = [];
    let currentEnemy: Enemy | null = initialEnemy;
    let chainCount = 0;

    while (currentEnemy && chainCount < state.chainLightningMaxLength) {
      chainEnemies.push({ x: currentEnemy.x, y: currentEnemy.y });
      currentEnemy.hp -= state.chainLightningDamage;

      const particleCount = state.chainLightningTargets > 1 ? 20 : 15;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(currentEnemy.x, currentEnemy.y, "#00ffff"));
      }

      if (currentEnemy.hp <= 0) {
        const enemyIndex = enemies.indexOf(currentEnemy);
        if (enemyIndex > -1) {
          enemies.splice(enemyIndex, 1);
          state.xp += 10;
          for (let k = 0; k < 10; k++) {
            particles.push(new Particle(currentEnemy.x, currentEnemy.y, currentEnemy.color));
          }
        }
      }

      let nextEnemy: Enemy | null = null;
      let nextDistance = Infinity;

      enemies.forEach((enemy) => {
        if (hitEnemies.has(enemy)) return;
        const distance = Math.hypot(currentEnemy!.x - enemy.x, currentEnemy!.y - enemy.y);
        if (distance <= state.chainLightningBounceRadius && distance < nextDistance) {
          nextEnemy = enemy;
          nextDistance = distance;
        }
      });

      currentEnemy = nextEnemy;
      if (currentEnemy) hitEnemies.add(currentEnemy);
      chainCount++;
    }

    effect.chains.push(chainEnemies);
  });

  state.lastChainLightning = now;
  return effect;
}

export function drawChainLightningEffects(
  ctx: CanvasRenderingContext2D,
  animation: ChainLightningAnimation,
  lastChainEffect: ChainEffect | null,
  playerX: number,
  playerY: number,
  camX: number,
  camY: number,
): void {
  if (!lastChainEffect || Date.now() - lastChainEffect.timestamp >= 500) return;

  animation.update();
  lastChainEffect.chains.forEach((chain) => {
    for (let i = 0; i < chain.length - 1; i++) {
      const current = chain[i];
      const next = chain[i + 1];
      animation.draw(ctx, current.x, current.y, next.x, next.y, camX, camY);
    }

    if (chain.length > 0) {
      const first = chain[0];
      animation.draw(ctx, playerX, playerY, first.x, first.y, camX, camY);
    }
  });
}
