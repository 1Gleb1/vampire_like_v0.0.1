export class ChainLightningAnimation {
	constructor() {
		this.frames = [];
		this.currentFrame = 0;
		this.frameCount = 5;
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
				img.src = `assets/chain_lightning/Frames/Explosion_${i}.png`;
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
			ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(startX - camX, startY - camY);
			ctx.lineTo(endX - camX, endY - camY);
			ctx.stroke();
			return;
		}

		const currentImage = this.frames[this.currentFrame];
		if (!currentImage) return;

		const dx = endX - startX;
		const dy = endY - startY;
		const distance = Math.hypot(dx, dy);
		const angle = Math.atan2(dy, dx);

		const segmentWidth = 32;
		const segments = Math.max(1, Math.ceil(distance / segmentWidth));

		for (let i = 0; i < segments; i++) {
			const t1 = i / segments;
			const t2 = (i + 1) / segments;

			const x1 = startX + dx * t1;
			const y1 = startY + dy * t1;
			const x2 = startX + dx * t2;
			const y2 = startY + dy * t2;

			const randomOffset = 5;
			const offsetX1 = (Math.random() - 0.5) * randomOffset;
			const offsetY1 = (Math.random() - 0.5) * randomOffset;
			const offsetX2 = (Math.random() - 0.5) * randomOffset;
			const offsetY2 = (Math.random() - 0.5) * randomOffset;

			const drawX1 = x1 + offsetX1 - camX;
			const drawY1 = y1 + offsetY1 - camY;
			const drawX2 = x2 + offsetX2 - camX;
			const drawY2 = y2 + offsetY2 - camY;

			const segmentDx = drawX2 - drawX1;
			const segmentDy = drawY2 - drawY1;
			const segmentAngle = Math.atan2(segmentDy, segmentDx);
			const segmentLength = Math.hypot(segmentDx, segmentDy);

			ctx.save();

			ctx.translate(drawX1, drawY1);
			ctx.rotate(segmentAngle);

			ctx.drawImage(currentImage, -segmentLength / 2, -16, segmentLength, 32);

			ctx.restore();
		}
	}

	reset() {
		this.currentFrame = 0;
		this.lastFrameTime = Date.now();
	}
}
