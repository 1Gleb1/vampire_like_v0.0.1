import type { Enemy } from "../../enemy/enemy.ts";
import { Particle } from "../../particle.ts";

export interface RotatingBlade {
  angle: number;
  x: number;
  y: number;
}

export interface RotatingBladesState {
  hasRotatingBlade: boolean;
  rotatingBlades: RotatingBlade[];
  rotatingBladeCount: number;
  rotatingBladeRadius: number;
  rotatingBladeSpeed: number;
  rotatingBladeSize: number;
  rotatingBladeDamage: number;
  rotatingBladeAngle: number;
  rotatingBladeHitCooldownMs: number;
  rotatingBladeLastHitAt: Map<Enemy, number>;
  x: number;
  y: number;
  xp: number;
  level: number;
}

interface UpdateRotatingBladesParams {
  state: RotatingBladesState;
  enemies: Enemy[];
  particles: Particle[];
  onLevelUp: () => void;
  now?: number;
}

export function updateRotatingBlades({
  state,
  enemies,
  particles,
  onLevelUp,
  now = Date.now(),
}: UpdateRotatingBladesParams): void {
  if (!state.hasRotatingBlade) return;

  if (!Array.isArray(state.rotatingBlades)) state.rotatingBlades = [];
  if (state.rotatingBlades.length !== state.rotatingBladeCount) {
    state.rotatingBlades = [];
    for (let i = 0; i < state.rotatingBladeCount; i++) {
      state.rotatingBlades.push({
        angle: (i / state.rotatingBladeCount) * Math.PI * 2,
        x: state.x,
        y: state.y,
      });
    }
  }

  state.rotatingBladeAngle += state.rotatingBladeSpeed;

  for (let i = 0; i < state.rotatingBlades.length; i++) {
    const blade = state.rotatingBlades[i];
    const ang = blade.angle + state.rotatingBladeAngle;
    blade.x = state.x + Math.cos(ang) * state.rotatingBladeRadius;
    blade.y = state.y + Math.sin(ang) * state.rotatingBladeRadius;

    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      const dist = Math.hypot(blade.x - enemy.x, blade.y - enemy.y);
      if (dist >= state.rotatingBladeSize + enemy.size) continue;

      const lastHit = state.rotatingBladeLastHitAt.get(enemy) || 0;
      if (now - lastHit < state.rotatingBladeHitCooldownMs) continue;
      state.rotatingBladeLastHitAt.set(enemy, now);

      enemy.hp -= state.rotatingBladeDamage;
      for (let k = 0; k < 6; k++) particles.push(new Particle(enemy.x, enemy.y, enemy.color));
      if (enemy.hp <= 0) {
        enemies.splice(j, 1);
        state.xp += 10;
        for (let k = 0; k < 10; k++) particles.push(new Particle(enemy.x, enemy.y, enemy.color));
        if (state.xp >= state.level * 50) {
          state.level++;
          state.xp = 0;
          onLevelUp();
        }
      }
    }
  }
}

export function drawRotatingBlades(
  ctx: CanvasRenderingContext2D,
  rotatingBlades: RotatingBlade[],
  bladeSize: number,
  camX: number,
  camY: number,
): void {
  ctx.fillStyle = "gray";
  rotatingBlades.forEach((blade) => {
    ctx.beginPath();
    ctx.arc(blade.x - camX, blade.y - camY, bladeSize, 0, Math.PI * 2);
    ctx.fill();
  });
}
