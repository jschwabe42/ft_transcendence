import router from '/static/js/router.js';

document.getElementById('home-link').addEventListener('click', function(event) {
	event.preventDefault();
	router.navigateTo('/');
});

document.getElementById('transcendence-link').addEventListener('click', function(event) {
	event.preventDefault();
	router.navigateTo('/');
});

document.getElementById('quiz-link').addEventListener('click', function(event) {
	event.preventDefault();
	router.navigateTo('/quiz/');
});

export function clear_containers() {
	document.getElementById('home-content').innerHTML = '';
	document.getElementById('chat-app-content').innerHTML = '';
	document.getElementById('about-content').innerHTML = '';
	document.getElementById('quiz-app-content').innerHTML = '';
	document.getElementById('pong-app-content').innerHTML = '';
	document.getElementById('user-app-content').innerHTML = '';
}
