export class BatAnimation {
	constructor() {
		this.frames = [];
		this.currentFrame = 0;
		this.frameCount = 4;
		this.frameDuration = 150;
		this.lastFrameTime = 0;
		this.isLoaded = false;
		this.loadImages();
	}

	async loadImages() {
		try {
			const imagePromises = [];
			for (let i = 1; i <= this.frameCount; i++) {
				const img = new Image();
				img.src = `./assets/bat_black_red/frames/Bat${i}.png`;
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
			console.error('Failed to load bat images:', error);
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

	draw(ctx, x, y, size, camX, camY) {
		if (!this.isLoaded || this.frames.length === 0) {
			ctx.fillStyle = 'orange';
			ctx.beginPath();
			ctx.arc(x - camX, y - camY, size, 0, Math.PI * 2);
			ctx.fill();
			return;
		}

		const currentImage = this.frames[this.currentFrame];
		if (!currentImage) return;

		const imageAspectRatio = currentImage.width / currentImage.height;
		let drawWidth = size * 2;
		let drawHeight = (size * 2) / imageAspectRatio;

		const drawX = x - camX - drawWidth / 2;
		const drawY = y - camY - drawHeight / 2;

		ctx.drawImage(currentImage, drawX, drawY, drawWidth, drawHeight);
	}

	reset() {
		this.currentFrame = 0;
		this.lastFrameTime = Date.now();
	}
}
