

export function PongPractice() {
	const contentElement = document.getElementById('pong-app-content');
	contentElement.classList.add("active");

	if (contentElement) {
		contentElement.innerHTML = `
			<div class="pong-container">
			<main role="main" class="container">
				<div class="ready-bar">
					<div>
						<h1 style="color: white;">${gettext("Practice Game")}</h1>
						<p style="color: white;">${gettext("Left Paddels: W S; Right Paddels: UP DOWN;")}</p>
					</div>
					<div>
						<button id="start-game">${gettext("Start Game")}</button>
					</div>
				</div>

				<div id="gameContainer">
					<canvas class="gameCanvas" id="game_Canvas" width="800" height="600"></canvas>
				</div>

				<div class="score">
					<div class="player">
						<p>${gettext("player")}1</p>
						<p id="player1">0</p>
					</div>
					<div class="player">
						<p>${gettext("player")}2</p>
						<p id="player2">0</p>
					</div>
				</div>
			</main>
		</div>
		`;
		RenderPracticeGame();
	}
}

function RenderPracticeGame() {
	const canvas = document.getElementById("game_Canvas");
	const ctx = canvas.getContext("2d");
	const canvasHeight = canvas.height;
	const canvasWidth = canvas.width;

	let game_is_running = false;

	let scores = {
		player1: 0,
		player2: 0,
	}

	let leftpong = {
		height: 180,
		width: 20,
		x: 0,
		y: (canvasHeight / 2) - (200 / 2),
		speed: 10,
	}

	let rightpong = {
		height: 180,
		width: 20,
		x: canvasWidth - 20,
		y: (canvasHeight / 2) - (180 / 2),
		speed: 10,
	}

	let ball = {
		x: canvasWidth / 2,
		y: canvasHeight / 2,
		radius: 10,
		speed: 2,
		color: "black",
		vSpeed: 2,
		hSpeed: 2,
		angle: 110,
		hitCooldown: 0,
	}

	let keys = {
		w: false,
		s: false,
		ArrowUp: false,
		ArrowDown: false
	};

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


	function updatePaddles() {
		const speed = 10; // paddle speed

		if (keys.w && leftpong.y > 0) {
			leftpong.y -= speed;
		}
		if (keys.s && leftpong.y + leftpong.height < canvasHeight) {
			leftpong.y += speed;
		}
		if (keys.ArrowUp && rightpong.y > 0) {
			rightpong.y -= speed;
		}
		if (keys.ArrowDown && rightpong.y + rightpong.height < canvasHeight) {
			rightpong.y += speed;
		}
	}

	// Game loop
	function gameLoop() {
		if (game_is_running == true) {
			renderGame();
			updateBall();
			updatePaddles();
			requestAnimationFrame(gameLoop);
		}
	}

	function updateBall() {
		ball.x += ball.hSpeed * ball.speed;
		ball.y += ball.vSpeed * ball.speed;
	
		if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
			ball.vSpeed *= -1;
		}
	
		if (ball.hitCooldown <= 0) {
			if (
				(ball.x - ball.radius <= leftpong.x + leftpong.width &&
					ball.y >= leftpong.y &&
					ball.y <= leftpong.y + leftpong.height) ||
				(ball.x + ball.radius >= rightpong.x &&
					ball.y >= rightpong.y &&
					ball.y <= rightpong.y + rightpong.height)
			) {
				ball.hSpeed *= -1;
				ball.hitCooldown = 10;
			}
		} else {
			ball.hitCooldown--;
		}
		if (ball.x - ball.radius <= 0) {
			scores.player2++;
			document.getElementById("player2").innerText = scores.player2;
			resetBall();
		} else if (ball.x + ball.radius >= canvas.width) {
			scores.player1++;
			document.getElementById("player1").innerText = scores.player1;
			resetBall();
		}
		if (ball.speed <= 5)
			ball.speed += 0.005;
	}

	function resetBall() {
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		ball.hSpeed = 2;
		ball.vSpeed = Math.random() * 2.5 + 0.5;
		if (Math.random() > 0.5) {
			ball.hSpeed *= -1;
		}
		if (Math.random() > 0.5) {
			ball.vSpeed *= -1;
		}
		ball.speed = 2;
	}

	document.getElementById("start-game").addEventListener("click", () => {
		if (!game_is_running) {
			game_is_running = true;
			document.getElementById("start-game").innerText = gettext("Pause Game");
			gameLoop();
		}
		else {
			game_is_running = false;
			document.getElementById("start-game").innerText = gettext("Start Game");
		}
	});
	document.addEventListener("keydown", (event) => {
		if (keys.hasOwnProperty(event.key)) {
			keys[event.key] = true;
		}
	});
	document.addEventListener("keyup", (event) => {
		if (keys.hasOwnProperty(event.key)) {
			keys[event.key] = false;
		}
	});
}