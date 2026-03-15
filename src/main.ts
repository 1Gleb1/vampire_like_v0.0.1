import './style.css'

async function renderPage(path: string) {
	const app = document.querySelector<HTMLDivElement>('#app')!

	if (path === '/game') {
		app.innerHTML = `
			<div id="ui"></div>
			<canvas id="game"></canvas>
		`

		try {
			await import('../src/app/index.ts')
		} catch (error) {
			console.error('Ошибка загрузки игры:', error)
			app.innerHTML = '<div>Ошибка загрузки игры</div>'
		}
	} else {
		app.innerHTML = `
      <div class='w-full h-screen'>
        <h1>Главная</h1>
        <button id="start-game">Начать игру</button>
      </div>
    `
		document.getElementById('start-game')?.addEventListener('click', () => {
			navigateTo('/game')
		})
	}
}

export function navigateTo(path: string) {
	window.history.pushState({}, '', path)
	renderPage(path)
}

window.addEventListener('popstate', () => {
	renderPage(window.location.pathname)
})

renderPage(window.location.pathname)
