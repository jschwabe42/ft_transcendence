let game_is_running = false;

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
			startGame();
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
};


///// Game
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;

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

	angle: 200,
}

let keys = {
	up_left: false,
	down_left: false,

	up_right: false,
	down_right: false,
}




// Keyboard press happend
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
			'key': "KeyUPArrowUp"
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
function keyboardPressed(user, key) {
	if (user == player1) {
		if (key == "KeyDownArrowUp")
			keys.up_left = true;
		if (key == "KeyDownArrowDown")
			keys.down_left = true;
		if (key == "KeyUPArrowUp")
			keys.up_left = false;
		if (key == "KeyUpArrowDown")
			keys.down_left = false;
	}
	if (user == player2) {
		if (key == "KeyDownArrowUp")
			keys.up_right = true;
		if (key == "KeyDownArrowDown")
			keys.down_right = true;
		if (key == "KeyUPArrowUp")
			keys.up_right = false;
		if (key == "KeyUpArrowDown")
			keys.down_right = false;
	}
}



function startGame() {
	game_is_running = true;
	console.log("Game started");
	ctx.fillStyle = "black";
	ctx.fillRect(rightpong.x, rightpong.y, rightpong.width, rightpong.height);
	ctx.fillRect(leftpong.x, leftpong.y, leftpong.width, leftpong.height);
	
	requestAnimationFrame(gameLoop);
}

function gameLoop() {
	if (!game_is_running)
		return;

	// console.log("Running")
	// Game logic updates
	updateGame();

	// render game
	renderGame();

	// request next frame
	requestAnimationFrame(gameLoop);
}

// Update
function updateGame() {
	updateRackets();
	updateBall();
}

function updateRackets() {
	if (keys.up_right && rightpong.y > 0) {
		rightpong.y -= rightpong.speed;
	}
	if (keys.down_right && rightpong.y + rightpong.height < ctx.canvas.height) {
		rightpong.y += rightpong.speed;
	}
	if (keys.up_left && leftpong.y > 0) {
		leftpong.y -= leftpong.speed;
	}
	if (keys.down_left && leftpong.y + leftpong.height < ctx.canvas.height) {
		leftpong.y += leftpong.speed;
	}
}

function updateBall() {
	// Update Ball
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