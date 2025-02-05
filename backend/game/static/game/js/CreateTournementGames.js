export function CreateTournementGames(event, socket, model) {
	event.preventDefault();

	if (model.host && model.player1 && model.player2 && model.player3) {

		Promise.all([
			CreateGamesAPI(model.host, model.player1),
			CreateGamesAPI(model.player2, model.player3)
		])
		.then(([gameid1, gameid2]) => {
			const games1 = [
				{ gameid: gameid1 },
				{ player1: model.host },
				{ player2: model.player1 }
			];
			const games2 = [
				{ gameid: gameid2 },
				{ player1: model.player2 },
				{ player2: model.player3 }
			];

			const games = [games1, games2];
			const dataToSend = {
				use: 'createGames',
				games: games
			};

			socket.send(JSON.stringify(dataToSend));
		})
		.catch(error => {
			console.error('Error creating games:', error);
		});
	} else {
		console.log("CreateTournementGames: Error - not 4 users there");
	}
}

function CreateGamesAPI(player1, player2) {
	const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
	return fetch('/game/api/create-game/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify({ opponent: player2, username: player1 }),
	})
	.then(response => response.json())
	.then(data => {
		if (data.game_id) {
			return data.game_id;
		} else {
			throw new Error("Creating game failed");
		}
	})
	.catch(error => {
		console.error('Error with API', error);
		throw error;
	});
}
