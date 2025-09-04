import {
	canvas,
	isPaused,
	keys,
	setMouse,
	setPaused,
} from '../shared/lib/state.js';

export function initInput() {
	canvas.addEventListener('mousemove', e => {
		const rect = canvas.getBoundingClientRect();
		setMouse(e.clientX - rect.left, e.clientY - rect.top);
	});
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape') {
			setPaused(!isPaused);
			return;
		}
		if (!isPaused) keys[e.key] = true;
	});
	document.addEventListener('keyup', e => (keys[e.key] = false));

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			setPaused(true);
			for (const k in keys) keys[k] = false;
		}
	});
}
