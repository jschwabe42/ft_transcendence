let game_is_running = false;
let game_first_start = true;
// set to starndard in the beginning
document.getElementById("player1").style.backgroundColor = "white";
document.getElementById("player2").style.backgroundColor = "white";
document.getElementById("winner").style.display = "none";

const gameData = document.querySelector("#game-data");
if (!gameData) {
	console.error("Game Data Not found");
	throw new Error("Game Data missing");
}
const player1 = gameData.getAttribute("player1")
const player2 = gameData.getAttribute("player2")

const game_id = gameData.getAttribute("game-id")
const gameSocket = new WebSocket('ws://' + window.location.host + '/new/' + game_id + '/');

gameSocket.onclose = function(e) {
	console.error('WebSocket geschlossen', e);
};

gameSocket.onopen = function(e) {
	console.log('WebSocket geöffnet');
};


const readyButton = document.querySelector("#user_ready");
readyButton.addEventListener("click", function () {
	const user = gameData.getAttribute("curr-user")

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
			let  is_ready_id = document.querySelector('#is_ready_id');
			is_ready_id.style.color = "green";
		}
	}
}

gameSocket.onmessage = function(e) {
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


///// Game
const canvas = document.getElementById("gameCanvas");
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


// Update from server
function updateGameFromServer(state) {
	ball.x = state.ball.x;
	ball.y = state.ball.y;

	leftpong.y = state.paddles.player1.y;
	rightpong.y = state.paddles.player2.y;

	if (scores.player1 != state.scores.player1 || scores.player2 != state.scores.player2) {
		document.getElementById("player1").innerText = state.scores.player1;
		document.getElementById("player2").innerText = state.scores.player2;
		sendGameScores(state.scores.player1, state.scores.player2);
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

function drawRackets () {
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
	const user = gameData.getAttribute("curr-user")
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
	const user = gameData.getAttribute("curr-user")
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
	const user = gameData.getAttribute("curr-user")
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
	const user = gameData.getAttribute("curr-user")
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