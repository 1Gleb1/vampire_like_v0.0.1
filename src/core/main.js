import { draw } from '../systems/draw.js';
import { initInput } from '../systems/input.js';
import { update } from '../systems/update.js';
import { bindUpgradeClick } from '../ui/ui.js';
import { resizeCanvas } from '../shared/lib/state.js';

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
