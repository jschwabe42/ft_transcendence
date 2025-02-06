

export function page1() {
	console.log("Test Page1");
	fetch('/spa_game/api/page-data/')
		.then(response => response.json())
		.then(model => {
			console.log(model);

			const gamesList = model.map(game => `
				<div>
					<p>${game.game} ${game.active ? 'Ja' : 'Nein'} ${game.id}</p>
				</div>
			`).join('');

			document.getElementById('pong-app-content').innerHTML = `
				<h1>Willkommen auf Seite 1</h1>
				${gamesList}
				<a href="/spa_game/page2" data-link>Gehe zu Seite 2</a>
			`;
		})
		.catch(error => {
			console.error("Fehler beim Laden der Daten:", error);
		});
}


export function page2() {
	console.log("Test Page2");
	document.getElementById('pong-app-content').innerHTML = `
		<h1>Willkommen auf Seite 2</h1>
		<a href="/pong/page1" data-link>Gehe zu Seite 1</a>
	`;
}
