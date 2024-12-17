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

	if (data.type === 'game_start') {
		window.location.href = `/quiz/room/${roomName}/ingame/`;
	}
};

function submitAnswer(answer, button) {
	// alert("Hello fran mig");
	const url = button.getAttribute('data-answer-url');
	fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
		},
		body: JSON.stringify({ answer: answer })
	}).then(response => {
		if (response.ok) {
			alert("Answer submitted!");
		} else {
			alert("Failed to submit answer.");
		}
	}).catch(error => {
		console.error('Error:', error);
		alert("Error trying to submit answer.");
	});
}

function colorAnswers(correctAnswer) {
	const answers = document.querySelectorAll("#answers li");
	answers.forEach(answer => {
		if (answer.textContent === correctAnswer) {
			answer.classList.add("correct");
		} else {
			answer.classList.add("incorrect");
		}
	});
}

const chatSocket = new WebSocket(
	'ws://' + window.location.host + '/ws/quiz/room/' + roomName + '/'
);

chatSocket.onmessage = function(e) {
	const data = JSON.parse(e.data);
	if (data.correct_answer) {
		colorAnswers(data.correct_answer);
	}
};

chatSocket.onclose = function(e) {
	console.error('Chat socket closed unexpectedly');
};


// socket.onclose = function (e) {
// 	console.error('Socket closed unexpectedly');
// };