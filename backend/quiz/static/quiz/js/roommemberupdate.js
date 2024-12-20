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
};

// socket.onclose = function (e) {
// 	console.error('Socket closed unexpectedly');
// };