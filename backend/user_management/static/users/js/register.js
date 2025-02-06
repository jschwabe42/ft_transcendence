import router from '/static/js/router.js';

/*
 * Register a new user
 */
export function register_user() {
	const userAppContent = document.getElementById('user-app-content');

	userAppContent.innerHTML = `
	<form id="register-form" class="form">
		<fieldset class="form-group">
			<legend class="border-bottom mb-4">Join Today</legend>
			<div class="form-group">
				<label for="id_username">Username:</label>
				<input type="text" name="username" id="id_username" class="form-control">
				<div id="username-errors" class="text-danger"></div>
			</div>

			<div class="form-group">
				<label for="id_email">Email:</label>
				<input type="email" name="email" id="id_email" class="form-control">
				<div id="email-errors" class="text-danger"></div>
			</div>
			<div class="form-group">
				<label for="id_password1">Password:</label>
				<input type="password" name="password1" id="id_password1" class="form-control">
				<div id="password1-errors" class="text-danger"></div>
			</div>
			<div class="form-group">
				<label for="id_password2">Confirm Password:</label>
				<input type="password" name="password2" id="id_password2" class="form-control">
				<div id="password2-errors" class="text-danger"></div>
			</div>
			<button class="btn btn-outline-info" type="submit">Sign Up</button>
		</fieldset>
		<div id="message-container"></div>
		<div class="border-top pt-3">
			<small class="text-muted">
				Already have an account? <span class="ml-2 sign-in-link">Sign In</span>
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
			document.getElementById('username-errors').innerHTML = 'Username is required!';
		}

		if (!email) {
			valid = false;
			document.getElementById('id_email').classList.add('is-invalid');
			document.getElementById('email-errors').innerHTML = 'Email is required!';
		} else if (!validateEmail(email)) {
			valid = false;
			document.getElementById('id_email').classList.add('is-invalid');
			document.getElementById('email-errors').innerHTML = 'Invalid email address!';
		}

		if (!password1) {
			valid = false;
			document.getElementById('id_password1').classList.add('is-invalid');
			document.getElementById('password1-errors').innerHTML = 'Password is required!';
		}

		if (!password2) {
			valid = false;
			document.getElementById('id_password2').classList.add('is-invalid');
			document.getElementById('password2-errors').innerHTML = 'Password confirmation is required!';
		} else if (password1 !== password2) {
			valid = false;
			document.getElementById('id_password2').classList.add('is-invalid');
			document.getElementById('password2-errors').innerHTML = 'Passwords do not match!';
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
			for (const [field, errors] of Object.entries(data.errors)) {
				const errorList = document.createElement('ul');
				errors.forEach(error => {
					const errorItem = document.createElement('li');
					errorItem.textContent = error.message;
					errorList.appendChild(errorItem);
				});
				const fieldContainer = document.getElementById(field + '-errors');
				fieldContainer.innerHTML = '';
				fieldContainer.appendChild(errorList);
				document.getElementById('id_' + field).classList.add('is-invalid');
			}
		}
	});
}

function validateEmail(email) {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(String(email).toLowerCase());
}