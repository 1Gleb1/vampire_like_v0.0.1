import { canvas, keys, setMouse, isPaused } from './state.js';

export function initInput() {
	canvas.addEventListener('mousemove', e => {
		const rect = canvas.getBoundingClientRect();
		setMouse(e.clientX - rect.left, e.clientY - rect.top);
	});
	document.addEventListener('keydown', e => {
		if (!isPaused) keys[e.key] = true;
	});
	document.addEventListener('keyup', e => (keys[e.key] = false));
}


