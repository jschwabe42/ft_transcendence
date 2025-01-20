import router from './router.js';
/**
 * Display the room view for the user.
 */
export function displayRoom(roomName) {
	listener();
	const quizAppContent = document.getElementById('quiz-app-content');
	quizAppContent.innerHTML = `
		<h2 id="room-header">Welcome to ${roomName}</h2>
		<p id="room-description">You have successfully joined the room!<br>Here you can start participating in the quiz.</p>
		<ul id="participants-list"></ul>
		<button id="leave-room-button" class="btn btn-danger">Leave Room</button>
		
		<button id="settings-button" class="btn btn-primary" style="display: none;">Settings</button>

		<div id="settings-menu" style="display: none;">
		<label for="question-count">Number of Questions:</label>
		<select id="question-count">
		<option value="3">3</option>
				<option value="5" selected>5</option>
				<option value="10">10</option>
				<option value="15">15</option>
				<option value="20">20</option>
				</select>
				<button id="save-settings-button" class="btn btn-success">Save</button>
				<div id="popup-message" class="popup-message" style="display: none;">Settings saved successfully!</div>
		</div>

		<button id="start-game-button" class="btn btn-primary" style="display: none;">Start Game</button>
	`;
	const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
	if (currentRoom && currentRoom.room_name === roomName) {
		updateParticipantsList(currentRoom.participants, currentRoom.leader);
		initRoomWebSocket(currentRoom.room_id);
		console.log('Current room:', currentRoom);
		console.log('Current user:', currentRoom.current_user);
		console.log('Leader:', currentRoom.leader);
		if (currentRoom.is_ingame === true) {
			startGame();
		}
		if (currentRoom.leader === currentRoom.current_user) {
			document.getElementById('settings-button').style.display = 'block';
			document.getElementById('start-game-button').style.display = 'block';
		}
	} else {
		console.error('Room details not found');
	}

	const leaveRoomButton = document.getElementById('leave-room-button');
	leaveRoomButton.addEventListener('click', function () {
		leaveRoom(currentRoom.room_id);
		router.navigateTo('/quiz/');
	});

	const settingsButton = document.getElementById('settings-button');
	settingsButton.addEventListener('click', function () {
		const settingsMenu = document.getElementById('settings-menu');
		settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'block' : 'none';
	});

	const saveSettingsButton = document.getElementById('save-settings-button');
	saveSettingsButton.addEventListener('click', function () {
		const questionCount = document.getElementById('question-count').value;
		updateRoomSettings(currentRoom.room_id, questionCount);
	});

	const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
	const startGameButton = document.getElementById('start-game-button');
	startGameButton.addEventListener('click', () => {
		console.log('Starting game...');
		fetch(`/quiz/start_game/${currentRoom.room_id}/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrfToken
			}
		});
	});
}

/**
 * Stupid function name I just realized, maybe change later.
 * Sets the html for the participants as well as adding a leader symbol.
 */
function updateParticipantsList(participants, leader) {
	const participantsList = document.getElementById('participants-list');
	participantsList.innerHTML = '';
	const headerP = document.createElement('p');
	headerP.innerText = 'Participants:';
	participantsList.appendChild(headerP);
	participants.forEach(participant => {
		const li = document.createElement('li');
		li.innerHTML = participant === leader ? `${participant} <span>👑</span>` : participant;
		participantsList.appendChild(li);
	});

	// Update the leader in the local storage and show settings button if applicable
	const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
	if (currentRoom) {
		currentRoom.leader = leader;
		localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
	}
	const currentUser = currentRoom.current_user;
	if (currentRoom.current_user === currentRoom.leader) {
		document.getElementById('settings-button').style.display = 'block';
	} else {
		document.getElementById('settings-button').style.display = 'none';
	}
}

/**
 * Loads the room specific WebSocket connection.
 * Also calls leave Room on close, might be redundant or false, right now functions as a fallback to beforeunload.
 */
function initRoomWebSocket(room_id) {
	const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
	const wsUrl = `${protocol}${window.location.host}/ws/rooms/${room_id}/`;
	const socket = new WebSocket(wsUrl);

	socket.onopen = function () {
		console.log('Room Specific WebSocket connection established');
		console.log('Connected to room:', wsUrl);
	};
	
	socket.onmessage = function (event) {
		const socket_data = JSON.parse(event.data);
		console.log('Received message:', socket_data);
		if (socket_data.type === 'update_room_members') {
			updateParticipantsList(socket_data.data.participants, socket_data.data.leader);
		}
		if (socket_data.type === 'start_game') {
			startGame();
		}
	};

	socket.onclose = function() {
		// Might be redundant to leave room here if beforeunload works correctly
		// const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
		// if (currentRoom) {
		// 	leaveRoom(currentRoom.room_id);
		// }
		console.log('Room Specific WebSocket connection closed');
	};

	socket.onerror = function(error) {
		console.error('Room Specific WebSocket error:', error);
	};
}

/**
 * Update the room settings.
 */
function updateRoomSettings(roomId, questionCount) {
	const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
	fetch(`/quiz/update_room_settings/${roomId}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken
		},
		body: JSON.stringify({ question_count: questionCount })
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			console.log('Room settings updated successfully');
			showPopupMessage('Settings saved successfully!');
		} else {
			console.error('Error updating room settings:', data.error);
		}
	})
	.catch(error => {
		console.error('An error occurred:', error);
	});
}

function showPopupMessage(message) {
	const popupMessage = document.getElementById('popup-message');
	popupMessage.innerText = message;
	popupMessage.style.display = 'block';
	setTimeout(() => {
		popupMessage.style.display = 'none';
	}, 5000);
}

/**
 * Sets a different header, hides the buttons.
 */
function startGame() {
	document.getElementById('room-header').innerText = 'Quiz in Progress';
	document.getElementById('room-description').innerText = 'The quiz has started! Good luck!';
	document.getElementById('settings-button').style.display = 'none';
	document.getElementById('start-game-button').style.display = 'none';
}

/**
 * Sends a POST request to the server to leave the room.
 */
function leaveRoom(room_id) {
	const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
	console.log("Calling leave room API");
	fetch(`/quiz/leave_room/${room_id}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-CSRFToken': csrfToken
		},
		body: `room_id=${encodeURIComponent(room_id)}`
	})
	.then(response=>response.json())
	.then(data => {
		if (data.success) {
			console.log('Left room successfully');
		} else {
			console.error('Error leaving room:', data.error);
		}
	})
	.catch(error => {
		console.error('An error occurred:', error);
	});
}

/**
 * The listener to make sure a user leaves the room when they close the tab.
 * Might change the event to something else, but beforeunload seems to work fine.
 */
function listener() {
	window.addEventListener('beforeunload', function (event) {
		const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
		if (currentRoom) {
			leaveRoom(currentRoom.room_id);
		}
	});
}