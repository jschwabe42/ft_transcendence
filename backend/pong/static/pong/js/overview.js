import router from '/static/js/router.js';
import { CreateGameForm } from './pong_api.js';
import { CreateTournament } from './tournament_api.js';

export function PongOverview() {
	const socket = new WebSocket("ws://localhost:8000/ws/pong/");
	const userName = document.getElementById('username').getAttribute('data-username');

	// open socket
	socket.onopen = () => {
		console.log("WebSocket-Verbindung hergestellt.");
		socket.send(JSON.stringify({ message: "Hallo, Server!" }));
	};

	console.log("WebSocket-basierte Base Page");

	fetch('/pong/api/game-data/')
		.then(response => response.json())
		.then(games => {
			console.log(games);
			const recentGames = games
				.filter(game => !game.pending)
				.map(game => `
					<button class="ChatButtonBackground navigate-button" data-path="/pong/game-details/${game.game_id}">
						${game.player1} vs ${game.player2} (${game.score1}-${game.score2})
					</button>
				`).join('');

			const pendingGames = games
				.filter(game => game.pending && (game.player1 === userName || game.player2 === userName))
				.map(game => `
					<button class="ChatButtonBackground navigate-button" data-path="/pong/${game.game_id}">
						${game.player1} vs ${game.player2} 
						(${game.tournament_id !== 0 ? `pending Tournament game #${game.tournament_id}` : 'pending'})
					</button>
				`).join('');

			document.getElementById('pong-app-content').innerHTML = `
				<div class="header-container">
					<h2>Recent Games</h2>
					<button class="navigate-button" data-path="/pong/practice/">Practice Game</button>
				</div>
				<div>${recentGames || '<p>No games have been played yet.</p>'}</div>

				<h2>Pending Games</h2>
				<div id="pendingGamesContainer">${pendingGames || '<p>No pending games.</p>'}</div>

				<h2>Open Tournaments</h2>
				<div id="pendingTournamentsContainer"></div>

				<h3>Play new Game</h3>
				<form id="create-game-form">
					<input id="opp_name" type="text" name="opp_name" placeholder="Enter opponent's Username" />
					<button class="add_user" type="submit">Play Game +</button>
				</form>

				<h3>Create Tournament</h3>
				<form id="create-tournament-form">
					<button class="add_user" type="submit">Create Tournament</button>
				</form>
			`;

			document.getElementById("create-game-form").addEventListener("submit", function (event) {
				event.preventDefault();
				CreateGameForm(event, socket);
			});

			document.getElementById("create-tournament-form").addEventListener("submit", function (event) {
				event.preventDefault();
				CreateTournament(event, socket);
			});
			return fetch('/pong/api/tournament_data/');
		})
		.then(response => response.json())
		.then(tournaments => {
			console.log(tournaments);
	
			const openTournaments = tournaments
				.filter(tournament => tournament.openTournament == false || tournament.host === userName)
				.map(tournament => `
					<button class="ChatButtonBackground navigate-button" data-path="/pong/tournament/${tournament.tournament_id}">
						Join Open Tournament #${tournament.tournament_id}
					</button>
				`).join('');
	
			document.getElementById('pendingTournamentsContainer').innerHTML = `
				<div>${openTournaments || '<p>No open tournaments.</p>'}</div>
			`;
		})
		.catch(error => console.error("Fehler beim Laden der Daten:", error));

	// create Websocket
	// recv message from server
	socket.onmessage = (event) => {
		console.log("received data", event.data);
		const message = JSON.parse(event.data);
		if (message.message === "game_created") {
			if (userName == message.player1 || userName == message.player2) {
				const newGameHTML = `
					<button class="ChatButtonBackground navigate-button" data-path="/pong/${message.game_id}">
						${message.player1} vs ${message.player2} (pending)
					</button>
				`;
				const pendingGamesContainer = document.getElementById('pendingGamesContainer');
				pendingGamesContainer.insertAdjacentHTML('afterbegin', newGameHTML);
			}
		}
		if (message.message === "create_tournament") {
			const newGameHTML = `
					<button class="ChatButtonBackground navigate-button" data-path="/pong/tournament/${message.tournament_id}">
						Join Open Tournament id=${message.tournament_id}
					</button>
				`;
			const pendingGamesContainer = document.getElementById('pendingTournamentsContainer');
			pendingGamesContainer.insertAdjacentHTML('afterbegin', newGameHTML);
			let path = "/pong/tournament/" + message.tournament_id;

			if (message.host == userName)
				router.navigateTo(path)
		}
	};

	socket.onclose = () => {
		console.log("WebSocket-Verbindung geschlossen.");
	};

	socket.onerror = (error) => {
		console.error("WebSocket-Fehler:", error);
	};

	document.getElementById('pong-app-content').addEventListener('click', (event) => {
		const button = event.target.closest('.navigate-button');
		if (button && button.dataset.path) {
			const path = button.dataset.path;
			console.log("Navigating to:", path);
			router.navigateTo(path);
		}
	});
}
