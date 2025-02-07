import router from '/static/js/router.js';

document.addEventListener('DOMContentLoaded', function() {
	update_navbar();

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
	
	document.getElementById('dashboard-link').addEventListener('click', function(event) {
		event.preventDefault();
		router.navigateTo('/dashboard/');
	});
	
	document.getElementById('register-link').addEventListener('click', function(event) {
		event.preventDefault();
		router.navigateTo('/register/');
	});
	
	document.getElementById('login-link').addEventListener('click', function(event) {
		event.preventDefault();
		router.navigateTo('/login/');
	});
	
	document.getElementById('logout-link').addEventListener('click', function(event) {
		event.preventDefault();
		router.navigateTo('/logout/');
	});
	
	document.getElementById('account-link').addEventListener('click', function(event) {
		event.preventDefault();
		router.navigateTo('/account/');
	});
});


export function clear_containers() {
	document.getElementById('home-content').innerHTML = '';
	document.getElementById('chat-app-content').innerHTML = '';
	document.getElementById('about-content').innerHTML = '';
	document.getElementById('quiz-app-content').innerHTML = '';
	document.getElementById('pong-app-content').innerHTML = '';
	document.getElementById('user-app-content').innerHTML = '';
	document.getElementById('error-content').innerHTML = '';
	document.getElementById('dashboard-app-content').innerHTML = '';
}

export function home_view() {
	const home = document.getElementById('home-content');
	home.innerHTML = `
	<h2>Welcome to the Transcendence Webpage</h2>
	`;
}

export function update_navbar() {
	fetch('/users/api/check_authentication/')
	.then(response => response.json())
	.then(data => {
		const navbars = document.getElementById('navbar-right');
		if (data.is_authenticated) {
			navbars.innerHTML = `
			<a class="nav-item nav-link" href="/account/" id="account-link">Account</a>
			<a class="nav-item nav-link" href="/logout/" id="logout-link">Logout</a>
			`;
			document.getElementById('account-link').addEventListener('click', function(event) {
				event.preventDefault();
				router.navigateTo('/account/');
			});
			document.getElementById('logout-link').addEventListener('click', function(event) {
				event.preventDefault();
				router.navigateTo('/logout/');
			});
		} else {
			navbars.innerHTML = `
			<a class="nav-item nav-link" href="/login/" id="login-link">Login</a>
			<a class="nav-item nav-link" href="/register/" id="register-link">Register</a>
			`;
			document.getElementById('register-link').addEventListener('click', function(event) {
				event.preventDefault();
				router.navigateTo('/register/');
			});
			
			document.getElementById('login-link').addEventListener('click', function(event) {
				event.preventDefault();
				router.navigateTo('/login/');
			});
		}
	});
}