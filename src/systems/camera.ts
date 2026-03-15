import { Player } from "../entities";

export class Camera {
  private player: Player;
  public canvas: HTMLCanvasElement;
  public x: number;
  public y: number;
  private offsetRadius: number;

  constructor(player: Player, canvas: HTMLCanvasElement) {
    this.player = player;
    this.canvas = canvas;
    this.x = player.x - canvas.width / 2;
    this.y = player.y - canvas.height / 2;

    this.offsetRadius = 50;
  }

  public update(): void {
    const targetX = this.player.x - this.canvas.width / 2;
    const targetY = this.player.y - this.canvas.height / 2;

    // Плавное следование за игроком (интерполяция)
    this.x += (targetX - this.x) * 0.05;
    this.y += (targetY - this.y) * 0.05;

    // Коррекция позиции, если игрок выходит за пределы зоны "свободного движения"
    const dx = this.player.x - (this.x + this.canvas.width / 2);
    const dy = this.player.y - (this.y + this.canvas.height / 2);
    const dist = Math.hypot(dx, dy);

    if (dist > this.offsetRadius) {
      this.x += dx - (dx / dist) * this.offsetRadius;
      this.y += dy - (dy / dist) * this.offsetRadius;
    }
  }

  // Геттеры для доступа к позиции камеры
  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  // Сеттеры для возможности ручной установки позиции (опционально)
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  // Метод для получения области видимости камеры
  public getViewport(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  // Метод для проверки, виден ли объект на экране
  public isVisible(objX: number, objY: number, objSize: number = 0): boolean {
    return (
      objX + objSize > this.x &&
      objX - objSize < this.x + this.canvas.width &&
      objY + objSize > this.y &&
      objY - objSize < this.y + this.canvas.height
    );
  }
}
