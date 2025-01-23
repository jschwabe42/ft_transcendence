
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
	const questionContainer = document.getElementById('question-container');
	const answerOptions = document.getElementById('answer-options');
	const quizQuestionContainer = document.getElementById('quiz-questions');

	questionContainer.innerHTML = question;
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
			button.style.backgroundColor = 'green';
		} else {
			button.style.backgroundColor = 'red';
		}
	});
}

/**
 * Clears the question and answer options.
 */
export function clearQuestionAndAnswers() {
	const questionContainer = document.getElementById('question-container');
	const answerOptions = document.getElementById('answer-options');
	const quizQuestionContainer = document.getElementById('quiz-questions');

	questionContainer.innerHTML = '';
	answerOptions.innerHTML = '';
	quizQuestionContainer.style.display = 'none';
}

export function displayUserAnswers(answersData) {
	const answerOptions = document.getElementById('answer-options');
	answersData.forEach(data => {
		const answerButton = [...answerOptions.children].find(button => button.getAttribute('data-answer') === data.answer);
		if (answerButton) {
			const userInfo = document.createElement('div');
			userInfo.className = 'user-info';
			// Add to below line with css later
			// <img src="${data.profile_image}" alt="${data.username}'s profile picture" class="profile-picture">
			userInfo.innerHTML = `
				<span class="username">${data.username}</span>
			`;
			// answerButton.appendChild(userInfo);
			answerButton.parentNode.insertBefore(userInfo, answerButton.nextSibling);
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
