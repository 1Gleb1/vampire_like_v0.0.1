export class ChainLightningAnimation {
	constructor() {
		this.frames = [];
		this.currentFrame = 0;
		this.frameCount = 4;
		this.frameDuration = 100;
		this.lastFrameTime = 0;
		this.isLoaded = false;
		this.loadImages();
	}

	async loadImages() {
		try {
			const imagePromises = [];
			for (let i = 1; i <= this.frameCount; i++) {
				const img = new Image();
				img.src = `./assets/chain_lightning/frames/lightning_skill1_frame${i}.png`;
				imagePromises.push(
					new Promise((resolve, reject) => {
						img.onload = () => resolve(img);
						img.onerror = reject;
					})
				);
			}

			this.frames = await Promise.all(imagePromises);
			this.isLoaded = true;
		} catch (error) {
			console.error('Failed to load chain lightning images:', error);
		}
	}

	update() {
		if (!this.isLoaded) return;

		const now = Date.now();
		if (now - this.lastFrameTime >= this.frameDuration) {
			this.currentFrame = (this.currentFrame + 1) % this.frameCount;
			this.lastFrameTime = now;
		}
	}

	draw(ctx, startX, startY, endX, endY, camX, camY) {
		if (!this.isLoaded || this.frames.length === 0) {
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(this.x - camX, this.y - camY, this.size, 0, Math.PI * 2);
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

		ctx.drawImage(currentImage, -distance / 2, -16, distance, 32);

		ctx.restore();
	}

	reset() {
		this.currentFrame = 0;
		this.lastFrameTime = Date.now();
	}
}
