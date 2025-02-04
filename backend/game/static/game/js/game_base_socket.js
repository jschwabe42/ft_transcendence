import router from '/static/js/router.js';
import { CreateGameForm } from './CreateGame.js';

export function game_base() {
	const socket = new WebSocket("ws://localhost:8000/ws/game/");
	const userName = document.getElementById('username').getAttribute('data-username');

	// open socket
	socket.onopen = () => {
		console.log("WebSocket-Verbindung hergestellt.");
		socket.send(JSON.stringify({ message: "Hallo, Server!" }));
	};

	console.log("WebSocket-basierte Base Page");

	fetch('/game/api/game-data/')
		.then(response => response.json())
		.then(games => {
			console.log(games);
			const recentGames = games
				.filter(game => !game.pending)
				.map(game => `
					<button class="ChatButtonBackground navigate-button" data-path="/game/game-details/${game.game_id}">
						${game.player1} vs ${game.player2} (${game.score1}-${game.score2})
					</button>
				`).join('');

			const pendingGames = games
				.filter(game => game.pending)
				.map(game => `
					<button class="ChatButtonBackground navigate-button" data-path="/game/pong/${game.game_id}">
						${game.player1} vs ${game.player2} (pending)
					</button>
				`).join('');

			document.getElementById('pong-app-content').innerHTML = `
				<h2>Recent Games</h2>
				<div>${recentGames || '<p>No games have been played yet.</p>'}</div>

				<h2>Pending Games</h2>
				<div id="pendingGamesContainer">${pendingGames || '<p>No pending games.</p>'}</div>

				<h3>Play new Game</h3>
				<form id="create-game-form">
					<input id="opp_name" type="text" name="opp_name" placeholder="Enter opponent's Username" />
					<button class="add_user" type="submit">Play Game +</button>
				</form>
				<button class="navigate-button" data-path="/game/page2">Go to Page 2</button>
				<button class="navigate-button" data-path="/game/page1">Go to Page 1</button>
				<button class="navigate-button" data-path="/game/game-details/1">Game Details</button>
			`;

			document.getElementById("create-game-form").addEventListener("submit", function(event) {
				event.preventDefault();
				CreateGameForm(event, socket);
			});
		})
		.catch(error => console.error("Fehler beim Laden der Daten:", error));

	// create Websocket
	// recv message from server
	socket.onmessage = (event) => {
		console.log("received data", event.data);
		const message = JSON.parse(event.data);
		if (message.message === "game_created") {
			console.log(message.game_id);
			console.log(message.player1);
			console.log(message.player2);
			if (userName == message.player1 || userName == message.player2)
			{
				const newGameHTML = `
					<button class="ChatButtonBackground navigate-button" data-path="/game/pong/${message.game_id}">
						${message.player1} vs ${message.player2} (pending)
					</button>
				`;

				const pendingGamesContainer = document.getElementById('pendingGamesContainer');
				pendingGamesContainer.insertAdjacentHTML('afterbegin', newGameHTML);
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
