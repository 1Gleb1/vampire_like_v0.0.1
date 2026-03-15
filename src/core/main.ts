import { draw } from '../systems/draw.ts';
import { initInput } from '../systems/input.ts';
import { update } from '../systems/update.ts';
import { bindUpgradeClick } from '../ui/ui.ts';
import { resizeCanvas } from '../shared/lib/state.ts';

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
