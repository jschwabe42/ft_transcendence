
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
	answersData.forEach(data => {
		const answerButton = [...answerOptions.children].find(button => button.getAttribute('data-answer') === data.answer);
		if (answerButton) {
			let buttonContainer = answerButton.parentNode;
			if (!buttonContainer.classList.contains('button-container')) {
				buttonContainer = document.createElement('div');
				buttonContainer.className = 'button-container';
				answerButton.parentNode.insertBefore(buttonContainer, answerButton);
				buttonContainer.appendChild(answerButton);
			}

			const userInfo = document.createElement('div');
			userInfo.className = 'user-info';
			// Add to below line with css later
			// <img src="${data.profile_image}" alt="${data.username}'s profile picture" class="profile-picture">
			userInfo.innerHTML = `
				<span class="username">${data.username}: +${data.score_difference} points</span>
			`;
			buttonContainer.appendChild(userInfo);
		}
	});
}

export function displayScore(participantData) {
	participantData.forEach(data => {
		const participantLi = document.getElementById(`participant-${data.username}`);
		if (participantLi) {
			const scoreSpan = participantLi.querySelector('.score-list');
			if (scoreSpan) {
				scoreSpan.innerHTML = `(${data.score} points)`;
			} else {
				const newScoreSpan = document.createElement('span');
				newScoreSpan.className = 'score-list';
				newScoreSpan.innerText = `(${data.score} points)`;
				participantLi.appendChild(newScoreSpan);
			}
		}
	});
}
