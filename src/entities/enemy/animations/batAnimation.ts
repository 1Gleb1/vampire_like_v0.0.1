import Bat1 from "../../../shared/assets/bat_black_red/frames/Bat1.png";
import Bat2 from "../../../shared/assets/bat_black_red/frames/Bat2.png";
import Bat3 from "../../../shared/assets/bat_black_red/frames/Bat3.png";
import Bat4 from "../../../shared/assets/bat_black_red/frames/Bat4.png";
const BatAnimationFrames = [Bat1, Bat2, Bat3, Bat4];

export class BatAnimation {
  private frames: HTMLImageElement[] = [];
  private currentFrame: number = 0;
  private frameCount: number = BatAnimationFrames.length; // Используем длину массива
  private frameDuration: number = 150;
  private lastFrameTime: number = 0;
  private isLoaded: boolean = false;

  constructor() {
    this.loadImages();
  }

  private async loadImages(): Promise<void> {
    try {
      const imagePromises: Promise<HTMLImageElement>[] = [];

      // Используем BatAnimationFrames напрямую
      for (let i = 0; i < BatAnimationFrames.length; i++) {
        const img = new Image();
        img.src = BatAnimationFrames[i]; // Здесь уже строка с путем

        imagePromises.push(
          new Promise<HTMLImageElement>((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
          }),
        );
      }

      this.frames = await Promise.all(imagePromises);
      this.isLoaded = true;
      console.log("Bat animation loaded successfully", this.frames.length);
    } catch (error) {
      console.error("Failed to load bat images:", error);
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
    x: number,
    y: number,
    size: number,
    camX: number,
    camY: number,
  ): void {
    if (!this.isLoaded || this.frames.length === 0) {
      // Отрисовка заглушки, если изображения не загружены
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.arc(x - camX, y - camY, size, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const currentImage = this.frames[this.currentFrame];
    if (!currentImage) return;

    // Сохраняем пропорции изображения
    const imageAspectRatio = currentImage.width / currentImage.height;
    const drawWidth = size * 2;
    const drawHeight = (size * 2) / imageAspectRatio;

    const drawX = x - camX - drawWidth / 2;
    const drawY = y - camY - drawHeight / 2;

    ctx.drawImage(currentImage, drawX, drawY, drawWidth, drawHeight);
  }

  public reset(): void {
    this.currentFrame = 0;
    this.lastFrameTime = Date.now();
  }
}
