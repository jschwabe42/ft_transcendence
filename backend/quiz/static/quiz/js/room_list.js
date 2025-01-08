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
			</div>
		`).join('');
		roomListContainer.innerHTML = `<h2>Available Rooms</h2>${roomItems}`;
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
