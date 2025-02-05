import router from '/static/js/router.js';
import { CreateTournementGames } from './CreateTournementGames.js';


export function Tournement(params) {
	let tournementModel = {}
	console.log("Tournement: ID", params.tournement_id);
	const tournementSocket = new WebSocket('ws://' + window.location.host + '/tournement/' + params.tournement_id + '/');

	fetch(`/game/api/tournement/?tournement_id=${params.tournement_id}`)
		.then(response => response.json())
		.then(model => {
			console.log(model);
			tournementModel = model;
			document.getElementById('pong-app-content').innerHTML = `
				<h1 id="header">Welcome to Tournement ${params.tournement_id}</h1>

				<p id="host"><strong>Host	:</strong> ${model.host}</p>
				<p id="player1"><strong >Player1:</strong> ${model.player1}</p>
				<p id="player2"><strong>Player2:</strong> ${model.player2}</p>
				<p id="player3"><strong>Player3:</strong> ${model.player3}</p>
				<p id="playerNum"><strong></strong> ${model.playernum}</p>

				<form id="create-tournement-games" style="display: none;" >
					<button class="add_user" type="submit">Play Tournement Games +</button>
				</form>

				<button class="navigate-button" data-path="/game/">Go to Menu</button>
			`;
			renderTournementData(tournementSocket, tournementModel);
			document.getElementById("create-tournement-games").addEventListener("submit", function(event) {
				event.preventDefault();
				CreateTournementGames(event, tournementSocket, tournementModel)
				// console.log(event, tournementSocket, "button Pressed");
			});
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



function renderTournementData(tournementSocket, tournementModel)
{
	const user = document.getElementById('username').getAttribute('data-username');

	
	tournementSocket.onopen = function(e) {
		console.log('WebSocket opend');
		tournementSocket.send(JSON.stringify({ "use": "sync" }));
	};
	
	tournementSocket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		if (data.use == "join") {
			tournementModel[data.field] = data.username
			document.getElementById(data.field).innerHTML = `<strong>${data.field.replace("player", "Player ")}:</strong> ${data.username}`;
			document.getElementById("playerNum").innerHTML = data.playerNum
		}
		if (data.playerNum == 4 && user == tournementModel.host) {
			document.getElementById("header").style.color = "green";
			document.getElementById("create-tournement-games").style.display = "block";
		}
		if (data.use === "sync") {
			updateUIWithTournementData(data);
		}
		if (data.use == "createGames")
		{
			console("test")
		}
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

function updateUIWithTournementData(data) {
	document.getElementById("host").innerHTML = `<strong>Host:</strong> ${data.host}`;
	document.getElementById("player1").innerHTML = `<strong>Player1:</strong> ${data.player1}`;
	document.getElementById("player2").innerHTML = `<strong>Player2:</strong> ${data.player2}`;
	document.getElementById("player3").innerHTML = `<strong>Player3:</strong> ${data.player3}`;
	document.getElementById("playerNum").innerHTML = data.playerNum;
	
	if (data.playerNum === 4) {
		document.getElementById("header").style.color = "green";
	}
}