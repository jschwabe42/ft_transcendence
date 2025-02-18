import router from '/static/js/router.js';

let gameModel = {};

export function DisplayPong(params) {
	console.log("Game ID:", params.game_id);

	fetch(`/pong/api/ingame/?game_id=${params.game_id}`)
		.then(response => response.json())
		.then(model => {
			console.log(model);
			gameModel = model;
			document.getElementById('pong-app-content').innerHTML = `
				<main role="main" class="container">
					<div class="ready-bar">
						<button class="ready" type="button" id="user_ready">${gettext("Ready")}</button>

						<form id="w-s" method="POST">
							{% csrf_token %}
							<button class="ready" type="submit" id="ws">
								<span class="vertical-text">WS</span>
							</button>
						</form>

						<form id="up-down" method="POST">
							{% csrf_token %}
							<button class="ready" type="button" id="up_down">
								<span class="vertical-text">▲<br>▼</span>
							</button>
						</form>

						<p class="is_ready Text" id="is_ready_id">${gettext("Ready")}:</p>

						<!-- Player 1 Status -->
						<p class="is_ready" id="ready_player_one" style="display: ${model.player1_ready ? 'block' : 'none'};">${model.player1}</p>
						
						<!-- Player 2 Status -->
						<p class="is_ready" id="ready_player_two" style="display: ${model.player2_ready ? 'block' : 'none'};">${model.player2}</p>
					</div>

					<div id="gameContainer">
						<canvas class="gameCanvas" id="game_Canvas" width="800" height="600"></canvas>
					</div>

					<div class="score">
						<div class="player">
							<p>${model.player1}</p>
							<p id="player1">${model.score1}</p>
						</div>
						<div class="player">
							<p>${model.player2}</p>
							<p id="player2">${model.score2}</p>
						</div>
					</div>
					<button id="winner" class="navigate-button" style="display: none;" 
						data-path="${model.tournament_id === 0 ? '/pong/' : '/pong/tournament/' + model.tournament_id}">
						${gettext("back to menu")}
					</button>
				</main>
			`;
			renderGameData();
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

function renderGameData() {
	const user = document.querySelector('meta[name="username-token"]').content;
	let game_is_running = false;

	const player1 = gameModel.player1;
	const player2 = gameModel.player2;
	const game_id = gameModel.game_id;

	const gameSocket = new WebSocket('ws://' + window.location.host + '/pong/' + game_id + '/');

	gameSocket.onclose = function (e) {
		console.error('WebSocket geschlossen', e);
	};

	gameSocket.onopen = function (e) {
		console.log('WebSocket opend');
	};

	const readyButton = document.querySelector("#user_ready");
	readyButton.addEventListener("click", function () {
		console.log("Use: Ready Button got Pressed");
		console.log("User: ", user);

		gameSocket.send(JSON.stringify({
			'use': 'ready_button',
			'user': user,
			'game_id': game_id
		}));
	});

	function ready_button(player) {
		if (game_is_running == false) {
			const ready1 = document.querySelector('#ready_player_one');
			const ready2 = document.querySelector('#ready_player_two');

			if (player == player1) {
				ready1.style.display = 'block';
			}
			if (player == player2)
				ready2.style.display = 'block';

			if (ready1.style.display == 'block' && ready2.style.display == 'block') {
				let is_ready_id = document.querySelector('#is_ready_id');
				is_ready_id.style.color = "green";
			}
		}
	}

	gameSocket.onmessage = function (e) {
		const data = JSON.parse(e.data);
		if (data.use == "ready_button")
			ready_button(data.user)
		if (data.use == "KeyboardEvent") {
			keyboardPressed(data.user, data.key)
		}
		if (data.use == "game_state") {
			updateGameFromServer(data.state);
		}
	};
	const canvas = document.getElementById("game_Canvas");
	const ctx = canvas.getContext("2d");
	const canvasHeight = canvas.height;
	const canvasWidth = canvas.width;

	let scores = {
		player1: 0,
		player2: 0,
	}

	let leftpong = {
		height: 180,
		width: 20,
		x: 0,
		y: (canvasHeight / 2) - (200 / 2),  // 180 for the height
		speed: 10,
	}

	let rightpong = {
		height: 180,
		width: 20,
		x: canvasWidth - 20, // 20 for the width
		y: (canvasHeight / 2) - (180 / 2), // 180 for the height
		speed: 10,
	}

	let ball = {
		x: canvasWidth / 2,
		y: canvasHeight / 2,
		radius: 10,
		speed: 3,
		color: "black",

		vSpeed: 10,
		hSpeed: 10,

		angle: 110,
	}

	async function sendGameScores(score1, score2, game_id) {
		console.log("Access API Scores");
		let csrfToken = document.querySelector('meta[name="csrf-token"]').content;
		try {
			const response = await fetch('/pong/api/get-score/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				body: JSON.stringify({
					'game_id': game_id,
					'score1': score1,
					'score2': score2,
				}),
			});
			if (response.ok) {
				const data = await response.json();
				console.log('Response data:', data);
			} else {
				const errorText = await response.text();
				console.error('Error message:', errorText);
			}
		} catch (error) {
			console.error('Request failed:', error);
		}
	}

	// Update from server
	function updateGameFromServer(state) {
		ball.x = state.ball.x;
		ball.y = state.ball.y;

		leftpong.y = state.paddles.player1.y;
		rightpong.y = state.paddles.player2.y;

		if (scores.player1 != state.scores.player1 || scores.player2 != state.scores.player2) {
			document.getElementById("player1").innerText = state.scores.player1;
			document.getElementById("player2").innerText = state.scores.player2;
			sendGameScores(state.scores.player1, state.scores.player2, gameModel.game_id);
		}
		scores.player1 = state.scores.player1;
		scores.player2 = state.scores.player2;
		if (state.winner.player1 || state.winner.player2)
			if (state.winner.player1) {
				document.getElementById("player1").style.backgroundColor = "green";
				document.getElementById("winner").style.display = "block";
				console.log("Player1 Won");
			}
		if (state.winner.player2) {
			document.getElementById("winner").style.display = "block";
			document.getElementById("player2").style.backgroundColor = "green";
			console.log("Player2 Won");
		}



		renderGame();
	}


	// render
	function renderGame() {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		drawRackets();
		drawBall();
	}

	function drawRackets() {
		ctx.fillStyle = "black";
		ctx.fillRect(rightpong.x, rightpong.y, rightpong.width, rightpong.height);
		ctx.fillRect(leftpong.x, leftpong.y, leftpong.width, leftpong.height);
	}

	function drawBall() {
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
		ctx.fillStyle = ball.color;
		ctx.fill();
		ctx.closePath();
	}

	// Keyboard listener arrows:
	document.addEventListener('keydown', (event) => {
		if (event.key === "ArrowUp") {
			gameSocket.send(JSON.stringify({
				'use': 'KeyboardEvent',
				'user': user,
				'game_id': game_id,
				'key': "KeyDownArrowUp"
			}));
		}
		if (event.key === "ArrowDown") {
			gameSocket.send(JSON.stringify({
				'use': 'KeyboardEvent',
				'user': user,
				'game_id': game_id,
				'key': "KeyDownArrowDown"
			}));
		}
	});
	document.addEventListener('keyup', (event) => {
		if (event.key === "ArrowUp") {
			gameSocket.send(JSON.stringify({
				'use': 'KeyboardEvent',
				'user': user,
				'game_id': game_id,
				'key': "KeyUpArrowUp"
			}));
		}
		if (event.key === "ArrowDown") {
			gameSocket.send(JSON.stringify({
				'use': 'KeyboardEvent',
				'user': user,
				'game_id': game_id,
				'key': "KeyUpArrowDown"
			}));
		}
	});
	// w s
	document.addEventListener('keydown', (event) => {
		if (event.key === "w") {
			gameSocket.send(JSON.stringify({
				'use': 'KeyboardEvent',
				'user': user,
				'game_id': game_id,
				'key': "KeyDownW"
			}));
		}
		if (event.key === "s") {
			gameSocket.send(JSON.stringify({
				'use': 'KeyboardEvent',
				'user': user,
				'game_id': game_id,
				'key': "KeyDownS"
			}));
		}
	});
	document.addEventListener('keyup', (event) => {
		if (event.key === "w") {
			gameSocket.send(JSON.stringify({
				'use': 'KeyboardEvent',
				'user': user,
				'game_id': game_id,
				'key': "KeyUpW"
			}));
		}
		if (event.key === "s") {
			gameSocket.send(JSON.stringify({
				'use': 'KeyboardEvent',
				'user': user,
				'game_id': game_id,
				'key': "KeyUpS"
			}));
		}
	});

	document.getElementById("ws").addEventListener("click", async function (event) {
		console.log("Access API");
		event.preventDefault();
		let csrfToken = document.querySelector('meta[name="csrf-token"]').content;

		try {
			const response = await fetch('/pong/api/get-gameControl/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				body: JSON.stringify({
					'game_id': gameModel.game_id,
					'control1': 'w_s',
					'control2': 'w_s',
				}),
			});
			if (response.ok) {
				const data = await response.json();
				console.log('Response data:', data);
			} else {
				const errorText = await response.text();
				console.error('Error message:', errorText);
			}
		} catch (error) {
			console.error('Request failed:', error);
		}
	});

	document.getElementById("up_down").addEventListener("click", async function (event) {
		console.log("Access API");
		event.preventDefault();
		let csrfToken = document.querySelector('meta[name="csrf-token"]').content;

		try {
			const response = await fetch('/pong/api/get-gameControl/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				body: JSON.stringify({
					'game_id': gameModel.game_id,
					'control1': 'up down',
					'control2': 'up down',
				}),
			});
			if (response.ok) {
				const data = await response.json();
				console.log('Response data:', data);
			} else {
				const errorText = await response.text();
				console.error('Error message:', errorText);
			}
		} catch (error) {
			console.error('Request failed:', error);
		}
	});
}
