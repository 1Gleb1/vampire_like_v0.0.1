import { MAP_HEIGHT, MAP_WIDTH } from "../../core/constants";
import { difficultyLevel } from "../../shared/lib/state";
import { Projectile } from "../projectile";
import { NormalAnimation } from "./animations";
import { BatAnimation } from "./animations/batAnimation";

type EnemyType = "normal" | "fast" | "shooter";

export class Enemy {
  public x: number;
  public y: number;
  public type: EnemyType;
  public size: number;
  private speed: number;
  private maxHp: number;
  public hp: number;
  public color: string;
  private fireRate: number;
  private lastShot: number;
  private normalAnimation: NormalAnimation;
  private batAnimation: BatAnimation;
  private facingAngle: number;

  constructor(x: number, y: number, type: EnemyType = "normal") {
    this.x = x;
    this.y = y;
    this.type = type;

    // Устанавливаем размер в зависимости от типа
    switch (type) {
      case "fast":
        this.size = 35;
        break;
      case "shooter":
        this.size = 20;
        break;
      default: // 'normal'
        this.size = 25;
    }

    // Базовая скорость
    let speedBase: number;
    switch (type) {
      case "fast":
        speedBase = 3;
        break;
      case "shooter":
        speedBase = 1.2;
        break;
      default: // 'normal'
        speedBase = 1.5;
    }

    // Базовое здоровье
    let hpBase: number;
    switch (type) {
      case "fast":
        hpBase = 20;
        break;
      case "shooter":
        hpBase = 30;
        break;
      default: // 'normal'
        hpBase = 40;
    }

    const speedScale = 1 + (difficultyLevel - 1) * 0.05;
    const hpScale = 1 + (difficultyLevel - 1) * 0.1;

    this.speed = speedBase * speedScale;
    this.maxHp = Math.round(hpBase * hpScale);
    this.hp = this.maxHp;

    // Цвет в зависимости от типа
    switch (type) {
      case "fast":
        this.color = "orange";
        break;
      case "shooter":
        this.color = "purple";
        break;
      default: // 'normal'
        this.color = "red";
    }

    const fireBase = 1500;
    const fireScale = Math.max(600, fireBase - (difficultyLevel - 1) * 75);
    this.fireRate = type === "shooter" ? fireScale : 0;
    this.lastShot = 0;

    this.batAnimation = new BatAnimation();
    this.normalAnimation = new NormalAnimation();
    this.facingAngle = 0;
  }

  public move(player: { x: number; y: number }): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    this.facingAngle = Math.atan2(dy, dx);

    if (dist > 0) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }

    // Ограничения по границам карты
    if (this.x < this.size) this.x = this.size;
    if (this.x > MAP_WIDTH - this.size) this.x = MAP_WIDTH - this.size;
    if (this.y < this.size) this.y = this.size;
    if (this.y > MAP_HEIGHT - this.size) this.y = MAP_HEIGHT - this.size;
  }

  public shoot(player: { x: number; y: number }, projectiles: Projectile[]): void {
    if (this.type !== "shooter") return;

    const now = Date.now();
    if (now - this.lastShot > this.fireRate) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      projectiles.push(new Projectile(this.x, this.y, angle, 7, 5, "pink"));
      this.lastShot = now;
    }
  }

  public draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    if (this.type === "fast") {
      this.batAnimation.update();
      this.batAnimation.draw(
        ctx,
        this.x,
        this.y,
        this.size,
        camX,
        camY,
        this.facingAngle,
      );
    } else if (this.type === "normal") {
      this.normalAnimation.update();
      this.normalAnimation.draw(
        ctx,
        this.x,
        this.y,
        this.size,
        camX,
        camY,
        this.facingAngle,
      );
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x - camX, this.y - camY, this.size, 0, Math.PI * 2);
      ctx.fill();

      const eyeDistance = this.size * 0.55;
      const eyeRadius = Math.max(3, this.size * 0.2);
      const eyeX = this.x - camX + Math.cos(this.facingAngle) * eyeDistance;
      const eyeY = this.y - camY + Math.sin(this.facingAngle) * eyeDistance;

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Получаем максимальное здоровье для отображения полоски
    const maxHp = this.getBaseHpForType(this.type);
    const hpBarWidth = 50;
    const hpBarHeight = 6;
    const hpBarX = this.x - camX - hpBarWidth / 2;
    const hpBarY = this.y - camY - this.size - 10;

    // Фон полоски здоровья
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    // Заполнение полоски здоровья
    const hpPercentage = Math.max(0, Math.min(1, this.hp / maxHp));
    const fillWidth = hpBarWidth * hpPercentage;

    // Цвет в зависимости от процента здоровья
    if (hpPercentage > 0.5) {
      ctx.fillStyle = "#00ff00";
    } else if (hpPercentage > 0.25) {
      ctx.fillStyle = "#ffff00";
    } else {
      ctx.fillStyle = "#ff0000";
    }

    ctx.fillRect(hpBarX, hpBarY, fillWidth, hpBarHeight);

    // Раскомментируйте, если нужна обводка
    // ctx.strokeStyle = 'white';
    // ctx.lineWidth = 1;
    // ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    // Раскомментируйте, если нужен текст с количеством HP
    // ctx.fillStyle = 'white';
    // ctx.font = '10px sans-serif';
    // ctx.textAlign = 'center';
    // ctx.textBaseline = 'middle';
    // ctx.fillText(`${this.hp}/${maxHp}`, hpBarX + hpBarWidth / 2, hpBarY + hpBarHeight / 2 + 0.5);
  }

  public update(player: { x: number; y: number }, projectiles: Projectile[]): void {
    this.move(player);
    this.shoot(player, projectiles);
  }

  // Вспомогательный метод для получения базового HP по типу
  private getBaseHpForType(type: EnemyType): number {
    switch (type) {
      case "fast":
        return 20;
      case "shooter":
        return 30;
      default: // 'normal'
        return 40;
    }
  }
}

export function spawnEnemy(type: EnemyType = "normal", enemies: Enemy[]): void {
  const mapSize = 4000;
  const side = Math.random() < 0.5 ? 0 : 1;

  let x: number, y: number;

  if (side) {
    // Вертикальные стороны (левая или правая)
    x = Math.random() < 0.5 ? 0 : mapSize;
    y = Math.random() * mapSize;
  } else {
    // Горизонтальные стороны (верхняя или нижняя)
    x = Math.random() * mapSize;
    y = Math.random() < 0.5 ? 0 : mapSize;
  }

  enemies.push(new Enemy(x, y, type));
}
