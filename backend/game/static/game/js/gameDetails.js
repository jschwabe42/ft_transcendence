export function gameDetails(params) {
	console.log("Game ID:", params.game_id);

	fetch(`/game/api/ingame/?game_id=${params.game_id}`)
		.then(response => response.json())
		.then(model => {
			console.log(model);
			document.getElementById('pong-app-content').innerHTML = `
				<h1>HelloWorld</h1>
			`;
		})
		.catch(error => {
			console.error("Fehler beim Laden der Daten:", error);
		});
	
}