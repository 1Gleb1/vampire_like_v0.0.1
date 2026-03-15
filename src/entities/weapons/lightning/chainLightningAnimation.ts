import lightning1 from "../../../shared/assets/chain_lightning/frames/lightning_skill_frame1.png";
import lightning2 from "../../../shared/assets/chain_lightning/frames/lightning_skill_frame2.png";
import lightning3 from "../../../shared/assets/chain_lightning/frames/lightning_skill_frame3.png";
import lightning4 from "../../../shared/assets/chain_lightning/frames/lightning_skill_frame4.png";

const LightningAnimationFrames = [lightning1, lightning2, lightning3, lightning4];

export class ChainLightningAnimation {
  private frames: HTMLImageElement[] = [];
  private currentFrame: number = 0;
  private frameCount: number = 4;
  private frameDuration: number = 100;
  private lastFrameTime: number = 0;
  private isLoaded: boolean = false;

  constructor() {
    this.loadImages();
  }

  private async loadImages(): Promise<void> {
    try {
      const imagePromises: Promise<HTMLImageElement>[] = [];

      // Исправляем индексацию: начинаем с 0 и идем до длины массива
      for (let i = 0; i < LightningAnimationFrames.length; i++) {
        const img = new Image();
        img.src = LightningAnimationFrames[i]; // Правильная индексация

        imagePromises.push(
          new Promise<HTMLImageElement>((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
          }),
        );
      }

      this.frames = await Promise.all(imagePromises);
      this.isLoaded = true;
    } catch (error) {
      console.error("Failed to load chain lightning images:", error);
    }
  }

  public update(): void {
    if (!this.isLoaded) return;

    const now = Date.now();
    if (now - this.lastFrameTime >= this.frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.lastFrameTime = now;
    }
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    camX: number,
    camY: number,
  ): void {
    if (!this.isLoaded || this.frames.length === 0) {
      ctx.fillStyle = "yellow"; // Временное решение
      ctx.beginPath();
      ctx.arc(startX - camX, startY - camY, 20, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const currentImage = this.frames[this.currentFrame];
    if (!currentImage) return;

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    const centerX = (startX + endX) / 2 - camX;
    const centerY = (startY + endY) / 2 - camY;

    ctx.save();

    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    // Фиксированная высота 32 пикселя для изображения молнии
    ctx.drawImage(currentImage, -distance / 2, -16, distance, 32);

    ctx.restore();
  }

  public reset(): void {
    this.currentFrame = 0;
    this.lastFrameTime = Date.now();
  }
}
