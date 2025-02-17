import router from '/static/js/router.js';
import { update_navbar } from '/static/js/navbar.js';

/**
 * Login a user
 */
export function login_user() {
	const userAppContent = document.getElementById('user-app-content');

	userAppContent.innerHTML = `
		<form id="login-form" class="form">
			<fieldset class="form-group">
				<legend class="border-bottom mb-4" id="login-headline">${gettext("Login")}</legend>
				<div class="form-group">
					<label for="id_username">${gettext("Username:")}</label>
					<input type="text" name="username" id="id_username" class="form-control">
					<div id="username-errors" class="text-danger"></div>
				</div>

				<div class="form-group">
					<label for="id_password">${gettext("Password:")}</label>
					<input type="password" name="password" id="id_password" class="form-control">
					<div id="password-errors" class="text-danger"></div>
				</div>

				<button class="btn btn-outline-info" id="login-signin-button" type="submit">${gettext("Sign In")}</button>
			</fieldset>
			<button class="btn btn-outline-info" id="oauth-authenticate">${gettext("OAuth2 using 42")}</button>
			<div id="message-container"></div>
			<div class="border-top pt-3">
				<small class="text-muted" id="register-link-container">
					${gettext("Want to create an Account?")} <span class="ml-2 register-link" id="account-register-link">${gettext("Register")}</span>
				</small>
			</div>
		</form>
		<div id="loading-overlay" class="loading-overlay" style="display: none;">
			<div class="loading-spinner"></div>
		</div>
		<!-- 2FA Verification Section -->
		<div id="2fa-verification" style="display: none;">
			<h3>${gettext("Two-Factor Authentication")}</h3>
			<p>${gettext("Please enter your 2FA code:")}</p>
			<input type="text" id="2fa-code" class="form-control" placeholder="${gettext("6-digit code")}">
			<button id="submit-2fa" class="btn btn-primary mt-3">${gettext("Verify")}</button>
			<button id="cancel-2fa" class="btn btn-secondary mt-3">${gettext("Cancel")}</button>
		</div>
	`;

	document.getElementById('oauth-authenticate').addEventListener('click', function (event) {
		event.preventDefault();
		router.navigateTo('/users/oauth/');
	});
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

		// Show the loading screen
		document.getElementById('loading-overlay').style.display = 'flex';

		document.querySelectorAll('.text-danger').forEach(el => el.innerHTML = '');
		document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));

		let valid = true;

		if (!formData.get('username')) {
			document.getElementById('username-errors').innerHTML = `${gettext("Username is required")}`;
			document.getElementById('id_username').classList.add('is-invalid');
			valid = false;
		}

		if (!formData.get('password')) {
			document.getElementById('password-errors').innerHTML = `${gettext("Password is required")}`;
			document.getElementById('id_password').classList.add('is-invalid');
			valid = false;
		}

		if (!valid) {
			document.getElementById('loading-overlay').style.display = 'none';
			return;
		}

		const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
		try {
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

			document.getElementById('loading-overlay').style.display = 'none';

			if (data.success) {
				if (data.requires_2fa) {
					// Show 2FA verification form
					show2FAForm(data.pre_auth_token);
				} else {
					// Normal login success
					handleLoginSuccess(data);
				}
			} else {
				handleLoginError(data);
			}
		} catch (error) {
			document.getElementById('loading-overlay').style.display = 'none';
			document.getElementById('message-container').innerHTML = `
				<p class="text-danger">${gettext("Network error. Please try again.")}</p>
			`;
		}
	});
}

function show2FAForm(preAuthToken) {
	// Hide login form and show 2FA verification
	document.getElementById('login-form').style.display = 'none';
	const twoFaSection = document.getElementById('2fa-verification');
	twoFaSection.style.display = 'block';

	// Handle 2FA verification
	document.getElementById('submit-2fa').onclick = async () => {
		const code = document.getElementById('2fa-code').value;
		if (!code || code.length !== 6) {
			document.getElementById('message-container').innerHTML = `
				<p class="text-danger">${gettext("Please enter a valid 6-digit code")}</p>
			`;
			return;
		}

		document.getElementById('loading-overlay').style.display = 'flex';
		
		try {
			const response = await fetch('/users/api/2fa/verify/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
					'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content,
				},
				body: JSON.stringify({
					code: code,
					pre_auth_token: preAuthToken
				}),
			});

			const data = await response.json();
			document.getElementById('loading-overlay').style.display = 'none';

			if (data.success) {
				handleLoginSuccess(data);
			} else {
				document.getElementById('message-container').innerHTML = `
					<p class="text-danger">${data.message || gettext("Invalid 2FA code")}</p>
				`;
			}
		} catch (error) {
			document.getElementById('loading-overlay').style.display = 'none';
			document.getElementById('message-container').innerHTML = `
				<p class="text-danger">${gettext("Verification failed. Please try again.")}</p>
			`;
		}
	};

	// Cancel button handler
	document.getElementById('cancel-2fa').onclick = () => {
		document.getElementById('login-form').style.display = 'block';
		twoFaSection.style.display = 'none';
		document.getElementById('message-container').innerHTML = '';
	};
}

function handleLoginSuccess(data) {
	// Set cookies if tokens are present
	if (data.access_token && data.refresh_token) {
		document.cookie = `access_token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax`;
		document.cookie = `refresh_token=${data.refresh_token}; Path=/; HttpOnly; SameSite=Lax`;
	}

	// Update UI and navigate
	update_navbar();
	router.navigateTo('/dashboard/');
}

function handleLoginError(data) {
	const messageContainer = document.getElementById('message-container');
	if (data.errors) {
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
	} else {
		messageContainer.innerHTML = `
			<p class="text-danger">${data.message || gettext("Invalid username or password")}</p>
		`;
	}
}