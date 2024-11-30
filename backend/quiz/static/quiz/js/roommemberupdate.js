const roomName = document.body.getAttribute('data-room-name'); // Get the room name from the data attribute
const participantsList = document.getElementById('participants');

const socket = new WebSocket(
	`ws://${window.location.host}/ws/quiz/room/${roomName}/`
);

socket.onmessage = function (e) {
	const data = JSON.parse(e.data);
	const participants = data.participants || [];

	participantsList.innerHTML = '';
	participants.forEach(participant => {
		const li = document.createElement('li');
		li.textContent = participant;
		participantsList.appendChild(li);
	});
};

socket.onclose = function (e) {
	console.error('Socket closed unexpectedly');
};