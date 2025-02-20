import router from '/static/js/router.js';

document.addEventListener('DOMContentLoaded', function() {
	update_navbar();

	setup_language();

	document.getElementById('home-link').addEventListener('click', function(event) {
		event.preventDefault();
		router.navigateTo('/');
	});
	
	document.getElementById('transcendence-link').addEventListener('click', function(event) {
		event.preventDefault();
		router.navigateTo('/');
	});

	document.getElementById('pong-link').addEventListener('click', function(event) {
		event.preventDefault();
		router.navigateTo('/pong/');
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
	<h2>${gettext("Welcome to the Transcendence Webpage")}</h2>
	<p>${gettext("This is a webpage created for the Transcendence project.")}</p>
	<br>
	<h3>${gettext("Features:")}</h3>
	<p>17/19 ${gettext("points. (Minor Module = 1 point, Major Module = 2 points!)")}<br>
	${gettext("14 points are sufficient for the basic requirements with 19 giving 125%!")}</p>
	<h5>${gettext("Minimal Requirements (no points, all need to be fullfilled):")}</h5>
	<ul>
		<li>${gettext("Your website must be a single page application, the Back and Forward buttons of the browser need to work.")} ✅</li>
		<li>${gettext("Your website must be compatible with the latest version of Google Chrome.")} ✅</li>
		<li>${gettext("Everything needs to be launched with a single command line. (make)")} ✅</li>
		<li>${gettext("Any password stored in the database must be hashed.")} ✅</li>
		<li>${gettext("Your website must be protected against SQL injections/XSS.")} ❗❓</li>
		<li>${gettext("HTTPS must be enabled and WSS needs to be used instead of ws.")} ✅</li>
		<li>${gettext("A pong game needs to be implemented. (See issues).")} ✅</li>
	</ul>
	<br>
	<h5>${gettext("Modules:")}</h5>
	<ul>
		<li>${gettext("Major: Use a Framwork as backend. 2 points!")} ✅</li>
		<li>${gettext("Minor: Use a frontend framework or toolkit. 1 point!")} ✅</li>
		<li>${gettext("Minor: Use a database for the backend. 1 point!")} ✅</li>
		<li>${gettext("Major: User Management. Pong Match history and Online status missing!")} ❗</li>
		<li>${gettext("Major: Remote authentication. 2 points!")} ✅</li>
		<li>${gettext("Major: Remote players. 2 points!")} ✅</li>
		<li>${gettext("Major: Multiple players. 2 points! (Technically, since it isn't 100% specified which game)")} ✅</li>
		<li>${gettext("Major: Add another game with user history and matchmaking. 2 points!")} ✅</li>
		<li>${gettext("Minor: Game Customization options. 1 point!")} ✅</li>
		<li>${gettext("Minor: User and Game stats dashboard. A way to display pong game outcomes is missing. Pong/Tournament data needs to be added. A graph should be added (but i could argue that point if necessary)")} ❗</li>
		<li>${gettext("Major: 2FA and JWT. The branch is not yet merged.")} ❗</li>
		<li>${gettext("Minor: Expanding Browser Compability (Chrome, Edge, Firefox?). 1 point!")} ✅</li>
		<li>${gettext("Minor: Multiple language support (Some things still need translations!). 1 point!")} ✅</li>
		<li>${gettext("Major: Server side pong. Already implemented, as soon as the pong bugs are fixed, this can be marked done.")} ✅</li>
		<li>${gettext("Major: Pong gameplay via CLI. Already implemented AFAIK, as soon as the pong bugs are fixed, this can be marked done.")} ❗</li>
		</ul>
	<br>
	<h3>${gettext("About:")}</h3>
	<p>${gettext("This project is part of the core curriculum of 42 and serves as its final project.")}<br>${gettext("This is our take on it.")}</p>
	<a class="index-base-link" href="https://github.com/transcendence-inc/ft_transcendence" target="_blank">${gettext("Our Projects GitHub Repository")}</a><br><br>
	<h3>${gettext("The team:")}</h3>
	<ul id="home-team-list">
		<li><a class="index-base-link" href="https://github.com/Jonstep101010" target="_blank">Jonstep</a></li>
		<li><a class="index-base-link" href="https://github.com/Jano844" target="_blank">Jano</a></li>
		<li><a class="index-base-link" href="https://github.com/aceauses" target="_blank">Aceauses</a></li>
		<li><a class="index-base-link" href="https://github.com/mben-has" target="_blank">mben-has</a></li>
		<li><a class="index-base-link" href="https://github.com/itseugen" target="_blank">Eugen</a></li>
	</ul>
	<br>
	<h3>${gettext("Ressources used:")}</h3>
	<ul id="home-ressources-list">
		<li>The timer inside the quiz app is a modified version of <a class="index-base-link" href="https://www.youtube.com/watch?v=LSJm-oS827M" target="_blank">this tutorial</a>.</li>
		<li>The quiz app uses the <a class="index-base-link" href="https://opentdb.com/" target="_blank">open trivia database</a> to fetch quiz questions and answers.</li>
		<li>Most Icons used are from <a class="index-base-link" href="https://icons.getbootstrap.com/" target="_blank">bootstrap icons</a>.</li>
		<li>For the frontend <a class="index-base-link" href="https://getbootstrap.com/" target="_blank">bootstrap toolkit</a> is used.</li>
		<li>For the backend <a class="index-base-link" href="https://www.djangoproject.com/" target="_blank">Django</a> is used.</li>
		<li>The database uses <a class="index-base-link" href="https://www.postgresql.org/" target="_blank">PostgresSQL</a>.</li>
		<li>For translations <a class="index-base-link" href="https://www.gnu.org/software/gettext/" target="_blank">gettext</a> is used.</li>
		<li>In the Pong Tournament this <a class="index-base-link" href="https://dribbble.com/shots/15810672-Looping-Ping-Pong-Animation" target="_blank">Gif</a> is used.</li>
		
	</ul>
	<br>
	<h3>${gettext("Libraries used:")}</h3>
	<ul id="home-ressources-list">
		<li><a class="index-base-link" href="https://www.psycopg.org/" target="_blank">Psycopg</a></li>
		<li><a class="index-base-link" href="https://django-debug-toolbar.readthedocs.io/en/latest/" target="_blank">Django Debug Toolbar</a></li>
		<li><a class="index-base-link" href="https://pypi.org/project/pillow/" target="_blank">Pillow</a></li>
		<li><a class="index-base-link" href="https://pypi.org/project/crispy-bootstrap4/" target="_blank">crispy-bootstrap4</a></li>
		<li><a class="index-base-link" href="https://django-crispy-forms.readthedocs.io/en/latest/" target="_blank">Django Crispy Forms</a></li>
		<li><a class="index-base-link" href="https://channels.readthedocs.io/en/latest/" target="_blank">Django Channels</a></li>
		<li><a class="index-base-link" href="https://github.com/django/daphne" target="_blank">Daphne</a></li>
		<li><a class="index-base-link" href="https://www.django-rest-framework.org/" target="_blank">Django Rest Framework</a></li>
		<li><a class="index-base-link" href="https://www.django-rest-framework.org/api-guide/requests/#requests" target="_blank">Requests</a></li>
	</ul>
	`;
}

export function update_navbar() {
	fetch('/users/api/check_authentication/')
	.then(response => response.json())
	.then(data => {
		const navbars = document.getElementById('navbar-right');
		if (data.is_authenticated) {
			const username = document.querySelector('meta[name="username-token"]').content;
			navbars.innerHTML = `
			<a class="nav-item nav-link" href="/dashboard/${username}" id="personal-profile-link">${username}</a>
			<a class="nav-item nav-link" href="/account/" id="account-link">${gettext("Account")}</a>
			<a class="nav-item nav-link" href="/logout/" id="logout-link">${gettext("Logout")}</a>
			`;
			document.getElementById('personal-profile-link').addEventListener('click', function(event) {
				event.preventDefault();
				router.navigateTo(`/dashboard/${username}`);
			});
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
			<a class="nav-item nav-link" href="/login/" id="login-link">${gettext("Login")}</a>
			<a class="nav-item nav-link" href="/register/" id="register-link">${gettext("Register")}</a>
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

function setup_language() {
	const languages = [
		{code: 'en', name: 'English', flag: '/media/flags/en.svg'},
		{code: 'sv', name: 'Svenska', flag: '/media/flags/sv.svg'},
		{code: 'de', name: 'Deutsch', flag: '/media/flags/de.svg'},
	];

	const currentLanguageCode = document.documentElement.lang || 'en';
	const currentLanguage = languages.find(language => language.code === currentLanguageCode);

	const currentLanguageFlag = document.getElementById('current-language-flag');
	currentLanguageFlag.src = currentLanguage.flag;
	currentLanguageFlag.alt = currentLanguage.code;

	const languageOptions = document.getElementById('language-options');
	languages.forEach(language => {
		if (language.code !== currentLanguageCode) {
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.className = 'dropdown-item language-option';
			a.href = '';
			a.dataset.lang = language.code;
			a.innerHTML = `<img src="${language.flag}" alt="${language.code}" height="30"> ${language.name}`;
			li.appendChild(a);
			languageOptions.appendChild(li);
		}
	});

	document.querySelectorAll('.language-option').forEach(option => {
		option.addEventListener('click', function(event) {
			event.preventDefault();
			const selectedLanguage = option.getAttribute('data-lang');
			const formData = new FormData();
			formData.append('language', selectedLanguage);
			formData.append('next', window.location.pathname);
			const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
			formData.append('csrfmiddlewaretoken', csrfToken);

			console.log('Setting language to', selectedLanguage);

			fetch('/i18n/setlang/', {
				method: 'POST',
				credentials: 'same-origin',
				body: formData,
			})
			.then(response => {
				if (response.ok) {
					console.log('Language set successfully');
					window.location.reload();
				} else {
					console.error('Failed to set language');
				}
			})
			.catch(error => {
				console.error('Failed to set language:', error);
			});
		});
	});
}