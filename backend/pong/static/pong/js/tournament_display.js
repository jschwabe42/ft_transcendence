import router from '/static/js/router.js';
import { CreateTournamentGames } from './tournament_api.js';
import { CreateFinalGame } from './tournament_api.js';


export function DisplayTournament(params) {
	let tournamentModel = {}
	let tournament_id = params.tournament_id
	console.log(params.tournament_id)
	console.log("Tournament: ID", params.tournament_id);
	const tournamentSocket = new WebSocket('ws://' + window.location.host + '/tournament/' + params.tournament_id + '/');

	fetch(`/pong/api/tournament/?tournament_id=${params.tournament_id}`)
		.then(response => response.json())
		.then(model => {
			console.log(model);
			tournamentModel = model;
			document.getElementById('pong-app-content').innerHTML = `
				<h1 id="header">Welcome to Tournament ${params.tournament_id}</h1>

				<div class="bracket-container">
					<div class="round-quarter-finals">
						<div class="round round-1">
							<div id="host" class="player1">${model.host}</div>
							<div id="player1" class="player2">${model.player1}</div>
						</div>

						<div class="round round-2">
							<div id="player2" class="player3">${model.player2}</div>
							<div id="player3" class="player4">${model.player3}</div>
						</div>
					</div>

					<div class="finals">
						<div class="round round-3">
							<div id='winner1' class="semifinalist1">${model.winner1}</div>
							<div id='winner2' class="semifinalist2">${model.winner2}</div>
						</div>
					</div>
					<div class="annouce-winner">
						<div id='finalWinner' class="finalist">${model.finalWinner}</div>
					</div>
				</div>
				

				<form id="create-tournament-games" style="display: none;" >
					<button class="add_user" type="submit">Play Tournament Games +</button>
				</form>

				<form id="create-final" style="display: none;" >
					<button class="add_user" type="submit">Start Final Game</button>
				</form>

				<button class="navigate-button" data-path="/pong/">Go to Menu</button>
			`;
			renderTournamentData(tournamentSocket, tournamentModel);
			document.getElementById("create-tournament-games").addEventListener("submit", function (event) {
				event.preventDefault();
				CreateTournamentGames(event, tournamentSocket, tournamentModel, tournament_id)
				document.getElementById("create-tournament-games").style.display = "none";
			});
			document.getElementById("create-final").addEventListener("submit", function (event) {
				event.preventDefault();
				let error = 'test'
				error = CreateFinalGame(event, tournamentSocket, tournamentModel, tournament_id)
				if (error == "error")
					document.getElementById("create-final").style.display = "none";
			});
		})
		.catch(error => {
			console.error("Fehler beim Laden der Daten:", error);
		});


	document.getElementById('pong-app-content').addEventListener('click', (event) => {
		const button = event.target.closest('.navigate-button');
		if (button && button.dataset.path) {
			const path = button.dataset.path;
			console.log("Navigating to:", path);
			router.navigateTo(path);
		}
	});
}

function renderTournamentData(tournamentSocket, tournamentModel) {
	const user = document.getElementById('username').getAttribute('data-username');

	tournamentSocket.onopen = function (e) {
		console.log('WebSocket opend');
		tournamentSocket.send(JSON.stringify({ "use": "sync" }));
	};

	tournamentSocket.onmessage = function (e) {
		const data = JSON.parse(e.data);
		if (data.use == "join") {
			tournamentModel[data.field] = data.username
			document.getElementById(data.field).innerHTML = `<strong>${data.field.replace("player", "Player ")}:</strong> ${data.username}`;
		}
		if (data.playerNum == 4 && user == tournamentModel.host && data.winner1 == "" && data.winner2 == "") {
			document.getElementById("create-tournament-games").style.display = "block";
		}
		if (data.winner1 != "" && data.winner2 != "" && user == tournamentModel.host && data.finalWinner == "") {
			document.getElementById("create-final").style.display = "block";
		}
		if (data.use === "sync") {
			updateUIWithTournamentData(data, tournamentModel);
		}
		if (data.use === "createGames" && data.data?.games) {
			const gameDetails = data.data.games.map((game, index) => ({
				gameid: game[0].gameid,
				player1: game[1].player1,
				player2: game[2].player2
			}));
			// redirect Users to Games
			if (user == gameDetails[0].player1 || user == gameDetails[0].player2) {
				let path = '/pong/' + gameDetails[0].gameid
				router.navigateTo(path)
			}
			if (user == gameDetails[1].player1 || user == gameDetails[1].player2) {
				let path = '/pong/' + gameDetails[1].gameid
				router.navigateTo(path)
			}
		}
		if (data.use == 'createFinal')
		{
			console.log(data.player1, data.player2)
			if (user == data.player1 || user == data.player2) {
				let path = '/pong/' + data.game_id
				router.navigateTo(path)
			}
		}
	};

	tournamentSocket.onclose = function (e) {
		console.error('WebSocket geschlossen:', e);
	};

	tournamentSocket.onerror = function (e) {
		console.error('WebSocket error:', error);
	};
}

function updateUIWithTournamentData(data, tournamentModel) {
	tournamentModel.winner1 = data.winner1
	tournamentModel.winner2 = data.winner2
	tournamentModel.finalWinner = data.finalWinner
	console.log("sync")
	console.log(data)
	document.getElementById("host").innerHTML = ` ${data.host}`;
	document.getElementById("player1").innerHTML = ` ${data.player1}`;
	document.getElementById("player2").innerHTML = ` ${data.player2}`;
	document.getElementById("player3").innerHTML = ` ${data.player3}`;
	document.getElementById("winner1").innerText = ` ${data.winner1}`;
	document.getElementById("winner2").innerText = ` ${data.winner2}`;
	document.getElementById("finalWinner").innerText =` ${data.finalWinner}`;
		
	if (data.playerNum === 4)
		document.getElementById("header").style.color = "green";
}
