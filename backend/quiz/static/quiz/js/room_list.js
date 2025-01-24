import router from './router.js';

/**
 * The main function of the file, sets the base html and calls the other functions
 */
export function loadRoomList() {
	const quizAppContent = document.getElementById('quiz-app-content');
	quizAppContent.innerHTML = `
	<div class="container">
		<div class="row">
			<div class="col-md-6 room-list-column">
				<div id="room-list" class="list-group"></div>
			</div>
			<div class="col-md-6 text.end">
				<h2> Create a new room</h2>
				<button id="show-create-room-form" class="btn btn-primary">Create Room</button>
				<div id="create-room-form-con" class="mt-3" style="display: none;">
					<form id="create-room-form">
						<div class="mb-3">
							<label for="roomName" class="form-label">Room Name</label>
							<input type="text" id="roomName" name="room_name" class="form-control" placeholder="Enter room name" required>
						</div>
						<button type="submit" class="btn btn-success">Submit</button>
					</form>
				</div>
			</div>
			<div id="create-room-feedback" class="mt-3"></div>
		</div>
	</div>
	`;

	initCreateRoomForm();
	initWebSocket();
	loadRooms();
}

/**
 * Initializes the create room form and handles form submission
 */
function initCreateRoomForm() {
	const showFormBtn = document.getElementById('show-create-room-form');
	const formContainer = document.getElementById('create-room-form-con');
	showFormBtn.addEventListener('click', function () {
		formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
	});

	const createRoomForm = document.getElementById('create-room-form');
	const feedbackDiv = document.getElementById('create-room-feedback');
	createRoomForm.addEventListener('submit', function (event) {
		event.preventDefault();

	const roomName = createRoomForm.room_name.value;
	feedbackDiv.innerHTML = '';
	const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

	fetch('/quiz/create_room/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-CSRFToken': csrfToken
		},
		body: `room_name=${encodeURIComponent(roomName)}`
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			feedbackDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
			createRoomForm.reset(); // Reset form on success
			// loadRoomView(data.room_name);
			joinRoom(data.room_id);
		} else {
			feedbackDiv.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
		}
	})
	.catch(error => {
		feedbackDiv.innerHTML = `<div class="alert alert-danger">An error occurred: ${error}</div>`;
	});
	});
}

/**
 * Initializes the WebSocket connection for the room list
 */
function initWebSocket() {
	const roomListContainer = document.getElementById('room-list');
	roomListContainer.innerHTML = '<p>Loading rooms...</p>';
	// const quizAppContent = document.getElementById('quiz-app-content');
	// const roomListContainer = document.createElement('div');
	// roomListContainer.id = 'room-list';
	// roomListContainer.innerHTML = '<h2>Available Rooms</h2><p>Loading rooms...</p>';
	// quizAppContent.prepend(roomListContainer);

	const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
	const wsUrl = `${protocol}${window.location.host}/ws/rooms/`;
	const socket = new WebSocket(wsUrl);
	socket.onopen = function () {
		console.log('WebSocket connection established');
	};

	// Receives updated room list from the server and displays it
	socket.onmessage = function (event) {
		const socket_data = JSON.parse(event.data);
		if (socket_data.type === 'update_room_list') {
			displayRooms(socket_data.data.rooms);
		}
	};
}

/**
 * Calls the room_list api to get the list of rooms and displays them. Could theoretically later be replaced by the router receiving the room list from the server
 */
async function loadRooms() {
	const roomListContainer = document.getElementById('room-list');
	try {
		const response = await fetch('/quiz/api/room_list/');
		if (!response.ok) {
			throw new Error('An error occurred while fetching rooms');
		}
		const data = await response.json();
		displayRooms(data.rooms);
	} catch (error) {
		roomListContainer.innerHTML = '<p>Error loading rooms. Please try again later.</p>';
	}
}

/**
 * Takes the rooms from loadfRooms/webseocket and displays them.
 */
function displayRooms(rooms) {
	const roomListContainer = document.getElementById('room-list');
	if (rooms.length === 0) {
		roomListContainer.innerHTML = '<p>No rooms available. Create a new room to get started.</p>';
		return;
	}
	const roomItems = rooms.map(room => `
		<div class="room border p-2 my-2">
			<strong>${room.name}</strong> 
			- Last activity: ${new Date(room.last_activity).toLocaleString()}
			${room.is_active ? '(Active)' : '(Inactive)'}
			<button id="join-button" class="join-button btn btn-primary" data-room-id="${room.id}">Join</button>
		</div>
	`).join('');
	roomListContainer.innerHTML = `<h2>Available Rooms</h2>${roomItems}`;
	
	document.querySelectorAll('.join-button').forEach(button => {
		button.addEventListener('click', function () {
			const roomId = button.getAttribute('data-room-id');
			joinRoom(roomId);
		});
	});
}

/**
 * Add functionality to the join button, and calls the router to navigate to the room specific view.
 */
function joinRoom(roomId) {
	const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
	fetch(`/quiz/join_room/${roomId}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-CSRFToken': csrfToken
		},
		body: `room_id=${roomId}`
	})

	.then(response => response.json())
	.then(data => {
		if (data.success) {
			const room_name = data.room.name;
			const room_id = data.room.id;
			const leader = data.room.leader;
			const participants = data.participants;
			const current_user = data.room.current_user;
			const is_ingame = data.room.is_ingame;
			localStorage.setItem('currentRoom', JSON.stringify({ room_id, room_name, leader, participants, current_user, is_ingame }));
			router.navigateTo(`/quiz/${room_name}/`);
		} else {
			alert(data.error);
		}
	})
	.catch(error => {
		alert(`An error occurred: ${error}`);
	});
}