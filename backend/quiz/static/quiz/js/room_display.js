/**
 * Display the room view for the user.
 */
export function displayRoom(roomName) {
	const quizAppContent = document.getElementById('quiz-app-content');
	quizAppContent.innerHTML = `
		<h2>Welcome to ${roomName}</h2>
		<p>You have successfully joined the room!</p>
		<p>Here you can start participating in the quiz.</p>
	`;
}
