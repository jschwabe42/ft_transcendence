const roomList = document.querySelector('#room-list');

const socket = new WebSocket(
	`ws://${window.location.host}/ws/quiz/home/`
);

socket.onmessage = function (event) {
	const data = JSON.parse(event.data);
	if (data.type == 'room_list_update') {
		roomList.innerHTML = '';
		data.rooms.forEach(room => {
			const listItem = document.createElement('li');
			const roomLink = document.createElement('a');
			roomLink.href = `/quiz/room/${room}/`;
			roomLink.textContent = room;

			// if (room.game_started) {
			// 	roomLink.innerHTML = `<a href="/quiz/game/${room.name}">Join ${room.name} (Game In Progress)</a>`;
			// } else {
			// 	roomLink.innerHTML = `<a href="/quiz/join/${room.name}">${room.name}</a>`;
			// }

			listItem.appendChild(roomLink);
			roomList.appendChild(listItem);
		});
	}
};