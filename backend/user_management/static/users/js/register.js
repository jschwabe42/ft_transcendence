import router from '/static/js/router.js';

/*
 * Register a new user
 */
export function register_user() {
	const userAppContent = document.getElementById('user-app-content');

	userAppContent.innerHTML = `
	<form id="register-form" class="form">
		<fieldset class="form-group">
			<legend class="border-bottom mb-4" id="register-headline">${gettext("Join Today")}</legend>
			<div class="form-group">
				<label for="id_username">${gettext("Username:")}</label>
				<input type="text" name="username" id="id_username" class="form-control">
				<div id="username-errors" class="text-danger"></div>
			</div>

			<div class="form-group">
				<label for="id_email">${gettext("Email:")}</label>
				<input type="email" name="email" id="id_email" class="form-control">
				<div id="email-errors" class="text-danger"></div>
			</div>
			<div class="form-group">
				<label for="id_password1">${gettext("Password:")}</label>
				<input type="password" name="password1" id="id_password1" class="form-control">
				<div id="password1-errors" class="text-danger"></div>
			</div>
			<div class="form-group">
				<label for="id_password2">${gettext("Confirm Password:")}</label>
				<input type="password" name="password2" id="id_password2" class="form-control">
				<div id="password2-errors" class="text-danger"></div>
			</div>
			<button class="btn btn-outline-info" id="register-sign-up-button" type="submit">${gettext("Sign Up")}</button>
		</fieldset>
		<div id="message-container"></div>
		<div class="border-top pt-3">
			<small class="text-muted"  id="login-link-container">
				${gettext("Already have an account?")} <span class="ml-2 sign-in-link" id="sign-in-link">${gettext("Sign In")}</span>
			</small>
		</div>
	`;

	add_register_form_listener();

	document.querySelector('.sign-in-link').addEventListener('click', function () {
		router.navigateTo('/login/');
	});
}

function add_register_form_listener() {
	document.getElementById('register-form').addEventListener('submit', async function (event) {
		event.preventDefault();
		const form = event.target;
		const formData = new FormData(form);

		document.querySelectorAll('.text-danger').forEach(el => el.innerHTML = '');
		document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));

		let valid = true;

		const username = formData.get('username');
		const email = formData.get('email');
		const password1 = formData.get('password1');
		const password2 = formData.get('password2');

		if (!username) {
			valid = false;
			document.getElementById('id_username').classList.add('is-invalid');
			document.getElementById('username-errors').innerHTML = `${gettext("Username is required!")}`;
		}

		if (!email) {
			valid = false;
			document.getElementById('id_email').classList.add('is-invalid');
			document.getElementById('email-errors').innerHTML = `${gettext("Email is required!")}`;
		} else if (!validateEmail(email)) {
			valid = false;
			document.getElementById('id_email').classList.add('is-invalid');
			document.getElementById('email-errors').innerHTML = `${gettext("Invalid email address!")}`;
		}

		if (!password1) {
			valid = false;
			document.getElementById('id_password1').classList.add('is-invalid');
			document.getElementById('password1-errors').innerHTML = `${gettext("Password is required!")}`;
		}

		if (!password2) {
			valid = false;
			document.getElementById('id_password2').classList.add('is-invalid');
			document.getElementById('password2-errors').innerHTML = `${gettext("Password confirmation is required!")}`;
		} else if (password1 !== password2) {
			valid = false;
			document.getElementById('id_password2').classList.add('is-invalid');
			document.getElementById('password2-errors').innerHTML = `${gettext("Passwords do not match!")}`;
		}
		if (!valid) {
			return;
		}
		const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
		const response = await fetch('/users/api/register/', {
			method: 'POST',
			body: formData,
			headers: {
				'X-Requested-With': 'XMLHttpRequest',
				'X-CSRFToken': csrfToken,
			},
		});
		const data = await response.json();
		console.log('Response:', data);
		const messageContainer = document.getElementById('message-container');
		messageContainer.innerHTML = '';
		if (data.success) {
			messageContainer.innerHTML = '<p>' + data.message + '</p>';
			form.reset();
			router.navigateTo('/login/');
		} else {
			if (data.type) {
				if (data.type === 'username') {
					valid = false;
					document.getElementById('id_username').classList.add('is-invalid');
					document.getElementById('username-errors').innerHTML = data.message;
				}
				if (data.type === 'mail') {
					valid = false;
					document.getElementById('id_email').classList.add('is-invalid');
					document.getElementById('email-errors').innerHTML = data.message;
				}
				if (data.type === 'password') {
					valid = false;
					document.getElementById('id_password1').classList.add('is-invalid');
					document.getElementById('password1-errors').innerHTML = data.message;
				}
			} else {
				messageContainer.innerHTML = '<p>' + data.message + '</p>';
			}
		}
	});
}

function validateEmail(email) {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(String(email).toLowerCase());
}
