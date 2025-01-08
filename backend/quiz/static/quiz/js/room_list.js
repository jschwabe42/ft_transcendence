document.addEventListener('DOMContentLoaded', function () {
	const quizAppContent = document.getElementById('quiz-app-content');
	const roomListContainer = document.createElement('div');
	roomListContainer.id = 'room-list';
	roomListContainer.innerHTML = '<h2>Available Rooms</h2><p>Loading rooms...</p>';
	quizAppContent.prepend(roomListContainer);

	const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
	const wsUrl = `${protocol}${window.location.host}/ws/rooms/`;
	const socket = new WebSocket(wsUrl);

	/**
	 * @function loadRooms
	 * @brief Fetches the list of rooms from the server and displays them on the page
	 */
	async function loadRooms() {
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
	 * @function displayRooms
	 * @brief Displays the list of rooms on the page by injecting them into the DOM
	 */
	function displayRooms(rooms) {
		if (rooms.length === 0) {
			roomListContainer.innerHTML = '<p>No rooms available. Create a new room to get started.</p>';
			return;
		}
		const roomItems = rooms.map(room => `
			<div class="room border p-2 my-2">
				<strong>${room.name}</strong> 
				- Last activity: ${new Date(room.last_activity).toLocaleString()}
				${room.is_active ? '(Active)' : '(Inactive)'}
				<button class="join-button" data-room-id="${room.id}">Join</button>
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
	 * @function joinRoom
	 * @brief Sends a request to the server to join the specified room
	 * @param {string} roomId - The ID of the room to join
	 * @throws {Error} If an error occurs while joining the room
	 * @async
	 */
	function joinRoom(roomId) {
		const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
		fetch(`/quiz/join_room/${roomId}/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': csrfToken
			},
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				console.log('Joined room successfully');
				loadRoomView(data.room_name);
			} else {
				console.error('Failed to join room:', data.error);
			}
		})
		.catch(error => {
			console.error('An error occurred while joining room:', error);
		});
	}

	/**
	 * @function loadRoomView
	 * @brief Loads and displays the room view for the given room
	 * @param {string} roomName - The name of the room to load
	 */
	function loadRoomView(roomName) {
		quizAppContent.innerHTML = '';
		import('./room_view.js').then(module => {
			module.displayRoomView(roomName);
		}).catch(error => {
			console.error('An error occurred while loading room view:', error);
		});
	}

	loadRooms();

	socket.onopen = function () {
		console.log('WebSocket connection established');
	};

	// Receives updated room list from the server and displays it
	socket.onmessage = function (event) {
		const socket_data = JSON.parse(event.data);
		if (socket_data.type === 'update_room_list') {
			displayRooms(socket_data.data.rooms);
		}
	}

});
