let game_is_running = false;
let game_first_start = true;

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

	vSpeed: 10,
	hSpeed: 10,

	angle: 110,
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
	// console.log("")
	if (!game_is_running)
		return;

	// console.log("Running")
	// Game logic updates
	updateGame();

	// render game
	renderGame();

	// request next frame
	game_first_start = false;
	requestAnimationFrame(gameLoop);
}

let lastTime = 0;
let accumulatedTime = 0;
const timeStep = 1000 / 60;

function gameLoop(timestamp) {
	if (!game_is_running) return;

	// to give a time dependent loop so the clients dont get out of sync
	if (!lastTime) lastTime = timestamp;
	const deltaTime = timestamp - lastTime;
	lastTime = timestamp;
	accumulatedTime += deltaTime;
	while (accumulatedTime >= timeStep) {
		updateGame();
		accumulatedTime -= timeStep;
	}

	renderGame();

	requestAnimationFrame(gameLoop);
	game_first_start = false;
}

// Update
function updateGame() {
	console.log("Update Game Loop");
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

function to_rad(angle) {
	return (angle / 180) * Math.PI;
}


function updateBall() {
	moveX = Math.cos(to_rad(ball.angle)) * ball.hSpeed;
	moveY = Math.sin(to_rad(ball.angle)) * ball.vSpeed;

	
	if (hit_racket())
		return ;

	if (ball.x > 0 && ball.x < ctx.canvas.width)
		ball.x += moveX; // moves if ball is in canvas
	else { // hit goal
		ball.x = canvasWidth / 2;
		ball.y = canvasHeight / 2;
		let randomAngle = Math.random() * 360;
		// console.log(randomAngle);
		if ((randomAngle >= 80 && randomAngle <= 100) || (randomAngle >= 260 && randomAngle <= 280)) {
			randomAngle = 70;
		}
		ball.angle = 70;
		// ball.angle = randomAngle;
	}
	if (ball.y > 0 && ball.y < ctx.canvas.height)
		ball.y += moveY;  // moves if ball is in canvas
	else { // hit top or buttom wall
		ball.vSpeed *= -1;
		moveY = Math.sin(to_rad(ball.angle)) * ball.vSpeed;
		ball.y += moveY;
	}
}

function hit_racket()
{
	if (ball.x > 0 + leftpong.width && ball.x < ctx.canvas.width - rightpong.width)
		return false;
	if ((ball.y < leftpong.y && ball.x < canvasWidth / 2) || (ball.y < rightpong.y && ball.x > canvasWidth / 2))
		return false
	if ((ball.y > leftpong.y + leftpong.height && ball.x < canvasWidth / 2) || (ball.y > rightpong.y + rightpong.height && ball.x > canvasWidth / 2))
		return false
	console.log("hit_racket")
	ball.hSpeed *= -1;
	moveX = Math.cos(to_rad(ball.angle)) * ball.hSpeed;
	ball.x += moveX;
	ball.angle += 5;
	if ((ball.angle >= 80 && ball.angle <= 100)) {
		if (ball.angle <= 90) {
			ball.angle += 10;
			console.log("Adjust angle += 10", ball.angle)
		}
		else {
			ball.angle -= 10;
			console.log("Adjust angle -= 10", ball.angle)
		}
	}
	if ((ball.angle >= 260 && ball.angle <= 280)) {
		if (ball.angle <= 270) {
			ball.angle -= 10;
			console.log("Adjust angle -= 10", ball.angle)
		}
		else {
			console.log("Adjust angle += 10", ball.angle)
			ball.angle += 10;
		}
	}
	return true
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