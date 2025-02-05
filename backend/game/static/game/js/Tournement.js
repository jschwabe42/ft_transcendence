import router from '/static/js/router.js';

let tournementModel = {}

export function Tournement(params) {
	console.log("Tournement: ID", params.tournement_id);
	// const userName = document.getElementById('username').getAttribute('data-username');




	fetch(`/game/api/tournement/?tournement_id=${params.tournement_id}`)
		.then(response => response.json())
		.then(model => {
			console.log(model);
			tournementModel = model;
			document.getElementById('pong-app-content').innerHTML = `
				<h1>Welcome to Tournement ${params.tournement_id}</h1>

				<p id="host"><strong>Host	:</strong> ${model.host}</p>
				<p id="player1"><strong >Player1:</strong> ${model.player1}</p>
				<p id="player2"><strong>Player2:</strong> ${model.player2}</p>
				<p id="player3"><strong>Player3:</strong> ${model.player3}</p>

				<button class="navigate-button" data-path="/game/">Go to Menu</button>
			`;
			renderTournementData();
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



function renderTournementData()
{
	const tournement_id = tournementModel.id;
	console.log(tournement_id)
	const tournementSocket = new WebSocket('ws://' + window.location.host + '/tournement/' + tournement_id + '/');

	
	tournementSocket.onopen = function(e) {
		console.log('WebSocket opend');
	};
	
	tournementSocket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		if (data.use == "join")
			document.getElementById(data.field).innerHTML = `<strong>${data.field.replace("player", "Player ")}:</strong> ${data.username}`;
	};


	tournementSocket.onclose = function(e) {
		console.error('WebSocket geschlossen:', e);
		setTimeout(() => {
			console.log("Reconnecting WebSocket...");
			renderTournementData();
		}, 3000);
	};

	tournementSocket.onerror = function(e) {
		console.error('WebSocket error:', error);
	};
}