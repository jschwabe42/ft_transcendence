export function PongResult(params) {
	console.log("Game ID:", params.game_id);

	fetch(`/pong/api/ingame/?game_id=${params.game_id}`)
	.then(response => {
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response.json();
	})
	.then(model => {
		console.log("API Response:", model);

		const contentElement = document.getElementById('pong-app-content');
		if (!contentElement) {
			console.error("Element mit ID 'pong-app-content' nicht gefunden.");
			return;
		}

		contentElement.innerHTML = `
			<div class="profile-container" style="text-align: center;">
				<h1>${model.score1} - ${model.score2}</h1>
				<p class="profile-date" style="text-align: center;">
					${new Date(model.played_at).toLocaleDateString()} @ ${new Date(model.played_at).toLocaleTimeString()}
				</p>
			</div>
			<div class="games-container" style="display: flex; justify-content: center;">
				<div class="player-one" style="display: flex; justify-content: center; padding-right: 100px;">
					<h3>
						<a href="/users/user/${model.player1}">
							${model.player1}
						</a>
					</h3>
				</div>
				<div class="player-two" style="display: flex; justify-content: center; padding-left: 100px;">
					<h3>
						<a href="/users/user/${model.player2}">
							${model.player2}
						</a>
					</h3>
				</div>
			</div>
		`;
	})
	.catch(error => {
		console.error("Fehler beim Laden der Daten:", error);
	});
}