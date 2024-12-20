const roomName = document.body.getAttribute('data-room-name'); // Get the room name from the data attribute
const participantsList = document.getElementById('participants');

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
