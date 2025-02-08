export function CreateTournamentPongGames(event, socket, model, tour_id) {
	event.preventDefault();

	if (model.host && model.player1 && model.player2 && model.player3) {
		const CreateGamesAPI = (player1, player2, tour_id) => {
			const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
			return fetch('/pong/api/create-game/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				body: JSON.stringify({ opponent: player2, username: player1, tournament: tour_id }),
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
		};

		Promise.all([
			CreateGamesAPI(model.host, model.player1, tour_id),
			CreateGamesAPI(model.player2, model.player3, tour_id)
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
		console.log("CreateTournamentPongGames: Error - not 4 users there");
	}
}

export function CreateTournament(event, socket) {
	event.preventDefault();
	const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
	const userName = document.getElementById('username').getAttribute('data-username');

	console.log("Create Tournemet")

	fetch('/pong/api/create-tournament/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify({ username: userName }),
	})
		.then(response => response.json())
		.then(data => {
			if (data.tournament_id) {
				console.log("Created tournament", data.tournament_id);
				const touenement_data = {
					message: "create_tournament",
					host: userName,
					tournament_id: data.tournament_id,
				};
				socket.send(JSON.stringify(touenement_data));
				console.log("sended tournament info")
			} else {
				console.error("Createing tournament failed");
			}
		})
		.catch(error => {
			console.error('Error with API', error);
		});
}
