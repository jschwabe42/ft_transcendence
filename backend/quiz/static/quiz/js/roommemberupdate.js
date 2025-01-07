const roomName = document.body.getAttribute('data-room-name'); // Get the room name from the data attribute
const participantsList = document.getElementById('participants');

const socket = new WebSocket(
	`ws://${window.location.host}/ws/quiz/room/${roomName}/`
);

document.getElementById('start-game')?.addEventListener('click', () => {
	socket.send(JSON.stringify({
		type: 'start_game',
		room_name: roomName,
	}));
});


socket.onmessage = function (e) {
	const data = JSON.parse(e.data);
	console.log('Server response:', data);
	const participants = data.participants || [];
	// console.log('hello');
	const leader = data.leader || null;

	if (data.participants) {
		console.log('Leader:', leader);
		participantsList.innerHTML = '';
		participants.forEach(participant => {
			const li = document.createElement('li');
			li.innerHTML = participant === leader ? `${participant} <span>🎮</span>` : participant;
			
			participantsList.appendChild(li);
		});
	}

	// Potential remove this
	// if (data.type === 'game_start') {
	// 	console.log('Game start message received, redirecting...');
	// 	if (typeof roomName !== 'undefined') {
	// 		console.log(`Redirecting to: /quiz/room/${roomName}/ingame/`); // Log the redirection URL
	// 		window.location.href = `/quiz/room/${roomName}/ingame/`;
	// 	} else {
	// 		console.error('roomName is not defined');
	// 	}
	// }
};

	// // Potential remove this
	// if (data.type === 'game_start') {
	// 	window.location.href = `start_game/${roomName}/`;
	// }

// socket.onclose = function (e) {
// 	console.error('Socket closed unexpectedly');
// };