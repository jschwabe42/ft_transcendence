import router from '/static/js/router.js';

/**
 * Login a user
 */
export function login_user() {
	const userAppContent = document.getElementById('user-app-content');

	userAppContent.innerHTML = `
	<form id="login-form" class="form">
		<fieldset class="form-group">
			<legend class="border-bottom mb-4">Login</legend>
			<div class="form-group">
				<label for="id_username">Username:</label>
				<input type="text" name="username" id="id_username" class="form-control">
				<div id="username-errors" class="text-danger"></div>
			</div>

			<div class="form-group">
				<label for="id_password">Password:</label>
				<input type="password" name="password" id="id_password" class="form-control">
				<div id="password-errors" class="text-danger"></div>
			</div>

			<button class="btn btn-outline-info" type="submit">Sign In</button>
		</fieldset>
		<div id="message-container"></div>
		<div class="border-top pt-3">
			<small class="text-muted">
				Want to create an Account? <span class="ml-2 register-link" id="register-link">Register</span>
			</small>
		</div>
	`;

	add_login_form_listener();

	document.querySelector('.register-link').addEventListener('click', function () {
		router.navigateTo('/register/');
	});
}

function add_login_form_listener() {
	document.getElementById('login-form').addEventListener('submit', async function (event) {
		event.preventDefault();
		const form = event.target;
		const formData = new FormData(form);

		document.querySelectorAll('.text-danger').forEach(el => el.innerHTML = '');
		document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));

		let valid = true;

		if (!formData.get('username')) {
			document.getElementById('username-errors').innerHTML = 'Username is required';
			document.getElementById('id_username').classList.add('is-invalid');
			valid = false;
		}

		if (!formData.get('password')) {
			document.getElementById('password-errors').innerHTML = 'Password is required';
			document.getElementById('id_password').classList.add('is-invalid');
			valid = false;
		}

		if (!valid) {
			return;
		}
		const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
		const response = await fetch('/users/api/login/', {
			method: 'POST',
			body: formData,
			headers: {
				'X-Requested-With': 'XMLHttpRequest',
				'X-CSRFToken': csrfToken,
			},
		});

		const data = await response.json();
		const messageContainer = document.getElementById('message-container');
		messageContainer.innerHTML = '';
		if (data.success) {
			messageContainer.innerHTML = '<p>' + data.message + '</p>';
			form.reset();
			if (data.csrf_token) {
				document.querySelector('meta[name="csrf-token"]').value = data.csrf_token;
			}
			router.navigateTo('/dashboard/');
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
