const roomList = document.querySelector('ul');

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
			roomLink.href = `/quiz/join/${room}/`;
			roomLink.textContent = room;
			listItem.appendChild(roomLink);
			roomList.appendChild(listItem);
		});
	}
};