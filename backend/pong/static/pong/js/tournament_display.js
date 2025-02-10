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

				<p id="host"><strong>Host	:</strong> ${model.host}</p>
				<p id="player1"><strong >Player1:</strong> ${model.player1}</p>
				<p id="player2"><strong>Player2:</strong> ${model.player2}</p>
				<p id="player3"><strong>Player3:</strong> ${model.player3}</p>
				<p id="playerNum"><strong></strong> ${model.playernum}</p>

				<h1 id='winner1'></h1>
				<h1 id='winner2'></h1>
				<h1 id='finalWinner'></h1>

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
			document.getElementById("playerNum").innerHTML = data.playerNum
		}
		if (data.playerNum == 4 && user == tournamentModel.host && data.winner1 == "" && data.winner2 == "") {
			document.getElementById("header").style.color = "green";
			document.getElementById("create-tournament-games").style.display = "block";
		}
		if (data.use === "sync") {
			console.log(data)
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
	const user = document.getElementById('username').getAttribute('data-username');
	document.getElementById("host").innerHTML = `<strong>Host:</strong> ${data.host}`;
	document.getElementById("player1").innerHTML = `<strong>Player1:</strong> ${data.player1}`;
	document.getElementById("player2").innerHTML = `<strong>Player2:</strong> ${data.player2}`;
	document.getElementById("player3").innerHTML = `<strong>Player3:</strong> ${data.player3}`;
	document.getElementById("playerNum").innerHTML = data.playerNum;
	document.getElementById("winner1").innerText = data.winner1;
	document.getElementById("winner2").innerText = data.winner2;
	document.getElementById("finalWinner").innerText = data.finalWinner


	if (data.finalWinner && data.finalWinner != "") {
		console.log(data.finalWinner)
		document.getElementById("finalWinner").innerText = data.finalWinner
	}
	else
	{
		if (data.winner1 && data.winner1 != "")
			document.getElementById("winner1").innerText = data.winner1;
			tournamentModel.winner1 = data.winner1;
		if (data.winner2 && data.winner2 != "")
			document.getElementById("winner2").innerText = data.winner2;
			tournamentModel.winner2 = data.winner2;
		if (data.winner1 && data.winner1 != "", data.winner2 && data.winner2 != "" && user == data.host)
			document.getElementById("create-final").style.display = "block";
			
		if (data.playerNum === 4)
			document.getElementById("header").style.color = "green";
	}

}
