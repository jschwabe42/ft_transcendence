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
	const ready1 = document.querySelector('#ready_player_one');
	const ready2 = document.querySelector('#ready_player_two');

	if (player == player1) {
		ready1.style.display = 'block';
	}
	if (player == player2)
		ready2.style.display = 'block';

	if (ready1.style.display == 'block' && ready2.style.display == 'block') {
		const letsGoElement = document.createElement('p');
		letsGoElement.textContent = 'Let’s go!';
		document.body.appendChild(letsGoElement);
	
		letsGoElement.style.color = 'green';
		letsGoElement.style.fontSize = '20px';
	}
}

gameSocket.onmessage = function(e) {
	const data = JSON.parse(e.data);
	// console.log('Message from Server:', data.use);
	// console.log('Message from Server:', data.user);
	if (data.use == "ready_button") 
		ready_button(data.user)
};