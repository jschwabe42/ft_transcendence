import router from '/static/js/router.js';
import { CreateGameForm } from './pong_api.js';
import { CreateTournament } from './tournament_api.js';

export function PongOverview() {
	const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
	const socket = new WebSocket(protocol + window.location.host + '/ws/pong/');
	const userName = document.querySelector('meta[name="username-token"]').content;

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
						(${game.tournament_id !== 0 ? `${gettext("pending Tournament game")} #${game.tournament_id}` : 'pending'})
					</button>
				`).join('');

			document.getElementById('pong-app-content').innerHTML = `
				<div class="header-container">
					<h2>${gettext("Recent Games")}</h2>
					<button class="navigate-button" data-path="/pong/practice/">${gettext("Practice Game")}</button>
				</div>
				<button id="refresh-button">${gettext("Refresh")}</button>
				<div>${recentGames || gettext("No games have been played yet.")}</div >

				<h2>${gettext("Pending Games")}</h2>
				<div id="pendingGamesContainer">${pendingGames || gettext("No pending games.")}</div>

				<h2>${gettext("Open Tournaments")}</h2>
				<div id="pendingTournamentsContainer"></div>

				<h3>${gettext("Play new Game")}</h3>
				<form id="create-game-form">
					<input id="opp_name" type="text" name="opp_name" placeholder=${gettext("Enter opponent username")} />
					<button class="add_user" type="submit">${gettext("Play Game +")}</button>
				</form>
				<p id="game-creation-fail" class="pong-error-message"></p>

				<h3>${gettext("Create Tournament")}</h3>
				<form id="create-tournament-form">
					<button class="add_user" type="submit">${gettext("Create Tournament")}</button>
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
			document.getElementById("refresh-button").addEventListener("click", () => {
				PongOverview();
			});
			return fetch('/pong/api/tournament_data/');
		})
		.then(response => response.json())
		.then(tournaments => {
			console.log(tournaments);

			const openTournaments = tournaments
				.filter(tournament => tournament.openTournament == true || tournament.host === userName)
				.map(tournament => `
					<button class="ChatButtonBackground navigate-button" data-path="/pong/tournament/${tournament.tournament_id}">
						${gettext("Join Open Tournament")} #${tournament.tournament_id}
					</button>
				`).join('');

			document.getElementById('pendingTournamentsContainer').innerHTML = `
					<div> ${openTournaments || gettext("No open tournaments.")}</div>
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
				const pendingGamesContainer = document.getElementById('pendingGamesContainer');
				if (!document.querySelector(`[data-path="/pong/${message.game_id}"]`)) {
					const newGameHTML = `
						<button class="ChatButtonBackground navigate-button" data-path="/pong/${message.game_id}">
							${message.player1} vs ${message.player2} (${gettext("pending")})
						</button>
					`;
					pendingGamesContainer.insertAdjacentHTML('afterbegin', newGameHTML);
				}
			}
		}
		if (message.message === "create_tournament") {
			const pendingTournamentsContainer = document.getElementById('pendingTournamentsContainer');
		
			if (!document.querySelector(`[data-path="/pong/tournament/${message.tournament_id}"]`)) {
				const newTournamentHTML = `
					<button class="ChatButtonBackground navigate-button" data-path="/pong/tournament/${message.tournament_id}">
						${gettext("Join Open Tournament")} id = ${message.tournament_id}
					</button>
				`;
				pendingTournamentsContainer.insertAdjacentHTML('afterbegin', newTournamentHTML);
			}
		
			if (message.host == userName) {
				let path = "/pong/tournament/" + message.tournament_id;
				router.navigateTo(path);
			}
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
