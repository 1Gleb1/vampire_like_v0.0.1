import { resizeCanvas } from './state.js';
import { initInput } from './input.js';
import { update } from './update.js';
import { draw } from './draw.js';
import { bindUpgradeClick } from './ui.js';

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
initInput();
bindUpgradeClick();

function loop() {
	update();
	draw();
	requestAnimationFrame(loop);
}

loop();
