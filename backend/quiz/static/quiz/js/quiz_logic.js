/**
 * Sends a Post request to the server to submit an answer.
 */
export function submitAnswer(roomId, question, answer) {
	const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
	fetch(`/quiz/submit_answer/${roomId}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken
		},
		body: JSON.stringify({question: question, answer: answer })
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			console.log('Answer submitted successfully');
		} else {
			console.error('Error submitting answer:', data.error);
		}
	})
	.catch(error => {
		console.error('An error occurred:', error);
	});
}

/**
 * Displays the question and answer options.
 */
export function displayQuestion(question, answers) {
	const answerOptions = document.getElementById('answer-options');
	const room_header = document.getElementById('room-header');
	const room_paragraph = document.getElementById('room-description');

	room_header.innerHTML = question;
	room_paragraph.innerHTML = '';
	// room_paragraph.innerHTML = question;
	answerOptions.innerHTML = '';

	answers.forEach((answer, index) => {
		const button = document.createElement('button');
		button.className = 'answer-option btn btn-primary';
		button.id = 'answers';
		button.setAttribute('data-answer', answer);
		button.innerText = answer;
		button.addEventListener('click', function () {
			const answer = this.getAttribute('data-answer');
			const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
			submitAnswer(currentRoom.room_id, question, answer);

			const previouslySelected = document.querySelector('.answer-option.selected');
			if (previouslySelected) {
				previouslySelected.classList.remove('selected');
			}
			this.classList.add('selected');
		});
		answerOptions.appendChild(button);
	});
	quizQuestionContainer.style.display = 'block';
}

/**
 * Displays the correct answer (colours the buttons).
 */
export function displayCorrectAnswer(correctAnswer) {
	const answerButtons = document.querySelectorAll('.answer-option');

	answerButtons.forEach(button => {
		button.disabled = true;
		const answer = button.getAttribute('data-answer');
		if (answer === correctAnswer) {
			button.style.setProperty('background-color', 'green', 'important');
			// button.style.setProperty('border-color', 'green', 'important');
			button.style.setProperty('border-color', button.classList.contains('selected') ? '#006400' : 'green', 'important'); 
		} else {
			button.style.setProperty('background-color', 'red', 'important');
			// button.style.setProperty('border-color', 'red', 'important');
			button.style.setProperty('border-color', button.classList.contains('selected') ? '#8B0000' : 'red', 'important');
		}
	});
}

/**
 * Clears the question and answer options.
 */
export function clearQuestionAndAnswers() {

	const answerOptions = document.getElementById('answer-options');
	const room_header = document.getElementById('room-header');
	const room_paragraph = document.getElementById('room-description');

	room_header.innerText = '';
	room_paragraph.innerText = '';
	answerOptions.innerHTML = '';
}

export function displayUserAnswers(answersData) {
	const answerOptions = document.getElementById('answer-options');

	const groupedAnswers = answersData.reduce((acc, data) => {
		if (!acc[data.answer]) {
			acc[data.answer] = [];
		}
		acc[data.answer].push(data);
		return acc;
	}, {});

	Object.entries(groupedAnswers).forEach(([answer, users]) => {
		const answerButton = [...answerOptions.children].find(button => button.getAttribute('data-answer') === answer);

		if (answerButton) {
			let buttonContainer = answerButton.closest('.button-container');
			if (!buttonContainer) {
				buttonContainer = document.createElement('div');
				buttonContainer.className = 'button-container';

				answerButton.parentNode.insertBefore(buttonContainer, answerButton);
				buttonContainer.appendChild(answerButton);
			}

			let userList = buttonContainer.querySelector('.user-list');
			if (!userList) {
				userList = document.createElement('div');
				userList.className = 'user-list';
				buttonContainer.appendChild(userList);
			} else {
				userList.innerHTML = '';
			}

			users.forEach(user => {
				const userInfo = document.createElement('div');
				userInfo.className = 'user-info';
				userInfo.innerHTML = `
					<span class="username">${user.username}: +${user.score_difference} ${gettext("points")}</span>
				`;
				userList.appendChild(userInfo);
			});
		}
	});
}


export function displayScore(participantData) {
	participantData.forEach(data => {
		const participantLi = document.getElementById(`participant-${data.username}`);
		if (participantLi) {
			const scoreSpan = participantLi.querySelector('.score-list');
			if (scoreSpan) {
				scoreSpan.innerHTML = `(${data.score} ${gettext("points")})`;
			} else {
				const newScoreSpan = document.createElement('span');
				newScoreSpan.className = 'score-list';
				newScoreSpan.innerText = `(${data.score} ${gettext("points")})`;
				participantLi.appendChild(newScoreSpan);
			}
		}
	});
}
