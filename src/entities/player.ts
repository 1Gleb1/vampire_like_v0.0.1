import { MAP_HEIGHT, MAP_WIDTH } from "../core/constants.js";
import { showUpgradeCards } from "../ui/ui.ts";
import { ChainLightningAnimation } from "./chainLightningAnimation.ts";
import type { Enemy } from "./enemy/enemy.ts";
import { Particle } from "./particle.ts";
import {
  castChainLightning,
  type ChainEffect,
  drawChainLightningEffects,
} from "./weapons/lightning/index.ts";
import {
  drawRotatingBlades,
  type RotatingBlade,
  type RotatingBladesState,
  updateRotatingBlades,
} from "./weapons/rotatingBlades/index.ts";
import { Weapon } from "./weapons/weapon.ts";

export interface KeysPressed {
  [key: string]: boolean;
}

interface Camera {
  x: number;
  y: number;
}

export class Player {
  public x: number;
  public y: number;
  public size: number;
  private color: string;
  public speed: number;
  public hp: number;
  public maxHp: number;
  public xp: number;
  public level: number;
  public fireRate: number;
  private lastShot: number;
  public weapons: Weapon[];

  public hasFanShot: boolean;

  public hasChainLightning: boolean;
  public chainLightningCooldown: number;
  public lastChainLightning: number;
  public chainLightningRadius: number;
  public chainLightningDamage: number;
  private lastChainEffect: ChainEffect | null;

  public chainLightningTargets: number;
  public chainLightningBounceRadius: number;
  public chainLightningMaxLength: number;

  public hasRotatingBlade: boolean;
  private rotatingBlades: RotatingBlade[];
  private rotatingBladeSize: number;

  private chainLightningAnimation: ChainLightningAnimation;

  constructor() {
    this.x = 2000;
    this.y = 2000;
    this.size = 20;
    this.color = "cyan";
    this.speed = 3;
    this.hp = 100;
    this.maxHp = 100;
    this.xp = 0;
    this.level = 1;
    this.fireRate = 400;
    this.lastShot = 0;
    this.weapons = [new Weapon("aim", 7, 5, "yellow")];

    this.hasFanShot = false;

    this.hasChainLightning = true;
    this.chainLightningCooldown = 3000;
    this.lastChainLightning = 0;
    this.chainLightningRadius = 150;
    this.chainLightningDamage = 3000;
    this.lastChainEffect = null;

    this.chainLightningTargets = 1;
    this.chainLightningBounceRadius = 100;
    this.chainLightningMaxLength = 5;

    this.hasRotatingBlade = false;
    this.rotatingBlades = [];
    this.rotatingBladeSize = 8;

    this.chainLightningAnimation = new ChainLightningAnimation();
  }

  public move(keys: KeysPressed): void {
    if (keys["ц"] || keys["w"] || keys["ArrowUp"]) this.y -= this.speed;
    if (keys["ы"] || keys["s"] || keys["ArrowDown"]) this.y += this.speed;
    if (keys["ф"] || keys["a"] || keys["ArrowLeft"]) this.x -= this.speed;
    if (keys["в"] || keys["d"] || keys["ArrowRight"]) this.x += this.speed;

    // Ограничения по границам карты
    if (this.x < this.size) this.x = this.size;
    if (this.x > MAP_WIDTH - this.size) this.x = MAP_WIDTH - this.size;
    if (this.y < this.size) this.y = this.size;
    if (this.y > MAP_HEIGHT - this.size) this.y = MAP_HEIGHT - this.size;
  }

  public shoot(projectiles: any[], mouseX: number, mouseY: number, camera: Camera): void {
    const now = Date.now();
    if (now - this.lastShot > this.fireRate) {
      this.weapons.forEach((w) =>
        w.fire(this.x, this.y, projectiles, mouseX + camera.x, mouseY + camera.y),
      );
      this.lastShot = now;
    }
  }

  public castChainLightning(enemies: Enemy[], particles: Particle[]): boolean {
    const effect = castChainLightning({
      casterX: this.x,
      casterY: this.y,
      state: this,
      enemies,
      particles,
    });

    if (!effect) return false;
    this.lastChainEffect = effect;
    this.chainLightningAnimation.reset();
    return true;
  }

  public updateRotatingBlades(enemies: Enemy[], particles: Particle[]): void {
    updateRotatingBlades({
      state: this as unknown as RotatingBladesState,
      enemies,
      particles,
      onLevelUp: () => showUpgradeCards(),
    });
  }

  public draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - camX, this.y - camY, this.size, 0, Math.PI * 2);
    ctx.fill();

    if (this.hasRotatingBlade && Array.isArray(this.rotatingBlades)) {
      drawRotatingBlades(ctx, this.rotatingBlades, this.rotatingBladeSize || 8, camX, camY);
    }

    if (this.hasChainLightning) {
      const isOnCooldown = Date.now() - this.lastChainLightning < this.chainLightningCooldown;
      ctx.strokeStyle = isOnCooldown ? "rgba(255, 0, 0, 0.3)" : "rgba(0, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x - camX, this.y - camY, this.chainLightningRadius, 0, Math.PI * 2);
      ctx.stroke();

      if (!isOnCooldown) {
        ctx.strokeStyle = "rgba(255, 255, 0, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x - camX, this.y - camY, this.chainLightningBounceRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    drawChainLightningEffects(
      ctx,
      this.chainLightningAnimation,
      this.lastChainEffect,
      this.x,
      this.y,
      camX,
      camY,
    );
  }

  public update(
    keys: KeysPressed,
    projectiles: any[],
    mouseX: number,
    mouseY: number,
    camera: Camera,
    enemies: Enemy[],
    particles: Particle[],
  ): void {
    this.move(keys);
    this.shoot(projectiles, mouseX, mouseY, camera);
    this.castChainLightning(enemies, particles);
    this.updateRotatingBlades(enemies, particles);
  }
}
