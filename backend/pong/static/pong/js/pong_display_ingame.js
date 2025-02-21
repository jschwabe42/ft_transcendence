import router from '/static/js/router.js';

let gameModel = {};
let gameSocket = null;

export function DisplayPong(params) {
	const pongContainer = document.getElementById('pong-app-content');
    // Add the active class immediately
    // pongContainer.classList.add('active');

	fetch(`/pong/api/ingame/?game_id=${params.game_id}`)
		.then(response => response.json())
		.then(model => {
		gameModel = model;
		pongContainer.innerHTML = `
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
				<button id="winner" class="navigate-button"" 
					data-path="${model.tournament_id === 0 ? '/pong/' : '/pong/tournament/' + model.tournament_id}">
					${gettext("Back to Menu")}
				</button>
			</main>
		</div>
		`;
		const backToMenuButton = document.getElementById('winner');
		backToMenuButton.onclick = () => {
			if (backToMenuButton.dataset.path) {
				closeWebSocketNavigateTo(backToMenuButton.dataset.path);
			}
		};
		renderGameData();
	})
	.catch(error => {
	});
}

function renderGameData() {
	const user = document.querySelector('meta[name="username-token"]').content;
	let game_is_running = false;

	const player1 = gameModel.player1;
	const player2 = gameModel.player2;
	const game_id = gameModel.game_id;

	const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
	gameSocket = new WebSocket(protocol + window.location.host + '/pong/' + game_id + '/');

	gameSocket.onclose = function (e) {
		console.log("Pong In-Game Websocket Closed");
	};

	gameSocket.onopen = function (e) {
		console.log("Pong In-Game Websocket Connected");
	};

	const readyButton = document.querySelector("#user_ready");
	readyButton.addEventListener("click", function () {

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
			} else {
				const errorText = await response.text();
			}
		} catch (error) {
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
			}
		if (state.winner.player2) {
			document.getElementById("winner").style.display = "block";
			document.getElementById("player2").style.backgroundColor = "green";
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
	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("keyup", handleKeyUp);

	document.getElementById("ws").addEventListener("click", async function (event) {
		event.preventDefault();
		let csrfToken = document.querySelector('meta[name="csrf-token"]').content;
		let username = document.querySelector('meta[name="username-token"]').content;
		console.log(username)
		try {
			const response = await fetch('/pong/api/get-gameControl/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				body: JSON.stringify({
					'game_id': gameModel.game_id,
					'username': username,
					'control1': 'w_s',
					'control2': 'w_s',
				}),
			});
			if (response.ok) {
				const data = await response.json();
			} else {
				const errorText = await response.text();
			}
		} catch (error) {
		}
	});

	document.getElementById("up_down").addEventListener("click", async function (event) {
		event.preventDefault();
		let csrfToken = document.querySelector('meta[name="csrf-token"]').content;
		let username = document.querySelector('meta[name="username-token"]').content;
		try {
			const response = await fetch('/pong/api/get-gameControl/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				body: JSON.stringify({
					'game_id': gameModel.game_id,
					'username': username,
					'control1': 'up down',
					'control2': 'up down',
				}),
			});
			if (response.ok) {
				const data = await response.json();
			} else {
				const errorText = await response.text();
			}
		} catch (error) {
		}
	});
}

function closeWebSocketNavigateTo(path) {
	if (gameSocket) {
		gameSocket.close();
		gameSocket = null;

		setTimeout(function() {
			router.navigateTo(path);
		}, 200);
	}
}

export function closePongInGameWebSocket() {
	if (gameSocket) {
		gameSocket.close();
		gameSocket = null;
	}
}

function handleKeyUp(event) {
	const user = document.querySelector('meta[name="username-token"]').content;
	const game_id = gameModel.game_id;
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
}

function handleKeyDown(event) {
	const user = document.querySelector('meta[name="username-token"]').content;
	const game_id = gameModel.game_id;
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
}

export function removeKeyEventListener() {
	document.removeEventListener("keydown", handleKeyDown);
	document.removeEventListener("keyup", handleKeyUp);
}
