/**
 * Display the room view for the user.
 */
export function displayRoom(roomName) {
	listener();
	const quizAppContent = document.getElementById('quiz-app-content');
	quizAppContent.innerHTML = `
		<h2>Welcome to ${roomName}</h2>
		<p>You have successfully joined the room!</p>
		<p>Here you can start participating in the quiz.</p>
		<ul id="participants-list"></ul>
	`;
	const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
	if (currentRoom && currentRoom.room_name === roomName) {
		updateParticipantsList(currentRoom.participants, currentRoom.leader);
		initRoomWebSocket(currentRoom.room_id);
	} else {
		console.error('Room details not found');
	}
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
		li.innerHTML = participant === leader ? `${participant} <span>🎮</span>` : participant;
		participantsList.appendChild(li);
	});
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
	};

	socket.onclose = function() {
		// Might be redundant to leave room here if beforeunload works correctly
		const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
		if (currentRoom) {
			leaveRoom(currentRoom.room_id);
		}
		console.log('Room Specific WebSocket connection closed');
	};

	socket.onerror = function(error) {
		console.error('Room Specific WebSocket error:', error);
	};
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