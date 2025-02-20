import router from '/static/js/router.js';
import { update_navbar } from '/static/js/navbar.js';

/**
 * Authentication module for handling user login and 2FA
 */

// Constants
const ENDPOINTS = {
  LOGIN: '/users/api/login/',
  VERIFY_2FA: '/users/api/2fa/verify/',
  OAUTH: '/users/oauth/',
  REGISTER: '/register/',
  DASHBOARD: '/dashboard/'
};

const SELECTORS = {
  CONTENT: 'user-app-content',
  FORM: 'login-form',
  USERNAME: 'id_username',
  PASSWORD: 'id_password',
  ERRORS: {
	USERNAME: 'username-errors',
	PASSWORD: 'password-errors'
  },
  LOADING: 'loading-overlay',
  MESSAGE: 'message-container',
  TWO_FA: {
	CONTAINER: '2fa-verification',
	INPUT: '2fa-code',
	SUBMIT: 'submit-2fa',
	CANCEL: 'cancel-2fa'
  },
  OAUTH_BUTTON: 'oauth-authenticate',
  REGISTER_LINK: '.register-link'
};

/**
 * Initialize and render the login interface
 */
export function login_user() {
  const container = document.getElementById(SELECTORS.CONTENT);
  if (!container) return;

  renderLoginForm(container);
  initEventListeners();
}

/**
 * Render the login form and related components
 */
function renderLoginForm(container) {
  container.innerHTML = `
	<form id="${SELECTORS.FORM}" class="form">
	  <fieldset class="form-group">
		<legend class="border-bottom mb-4" id="login-headline">${gettext("Login")}</legend>
		<div class="form-group">
		  <label for="${SELECTORS.USERNAME}">${gettext("Username:")}</label>
		  <input type="text" name="username" id="${SELECTORS.USERNAME}" class="form-control"
				 autocomplete="username" spellcheck="false">
		  <div id="${SELECTORS.ERRORS.USERNAME}" class="text-danger"></div>
		</div>

		<div class="form-group">
		  <label for="${SELECTORS.PASSWORD}">${gettext("Password:")}</label>
		  <input type="password" name="password" id="${SELECTORS.PASSWORD}" class="form-control"
				 autocomplete="current-password">
		  <div id="${SELECTORS.ERRORS.PASSWORD}" class="text-danger"></div>
		</div>

		<button class="btn btn-outline-info" id="login-signin-button" type="submit">${gettext("Sign In")}</button>
	  </fieldset>
	  <button class="btn btn-outline-info" id="${SELECTORS.OAUTH_BUTTON}">${gettext("OAuth2 using 42")}</button>
	  <div id="${SELECTORS.MESSAGE}"></div>
	  <div class="border-top pt-3">
		<small class="text-muted" id="register-link-container">
		  ${gettext("Want to create an Account?")} 
		  <span class="ml-2 register-link" id="account-register-link">${gettext("Register")}</span>
		</small>
	  </div>
	</form>
	<div id="${SELECTORS.LOADING}" class="loading-overlay" style="display: none;">
	  <div class="loading-spinner"></div>
	</div>
	<div id="${SELECTORS.TWO_FA.CONTAINER}" style="display: none;">
	  <h3>${gettext("Two-Factor Authentication")}</h3>
	  <p>${gettext("Please enter your 2FA code:")}</p>
	  <input type="text" id="${SELECTORS.TWO_FA.INPUT}" class="form-control" 
			 placeholder="${gettext("6-digit code")}" maxlength="6" 
			 pattern="[0-9]*" inputmode="numeric" autocomplete="one-time-code">
	  <button id="${SELECTORS.TWO_FA.SUBMIT}" class="btn btn-primary mt-3">${gettext("Verify")}</button>
	  <button id="${SELECTORS.TWO_FA.CANCEL}" class="btn btn-secondary mt-3">${gettext("Cancel")}</button>
	</div>
  `;
}

/**
 * Initialize all event listeners
 */
function initEventListeners() {
  // OAuth button
  const oauthButton = document.getElementById(SELECTORS.OAUTH_BUTTON);
  if (oauthButton) {
	oauthButton.addEventListener('click', (event) => {
	  event.preventDefault();
	  router.navigateTo(ENDPOINTS.OAUTH);
	});
  }

  // Login form
  const loginForm = document.getElementById(SELECTORS.FORM);
  if (loginForm) {
	loginForm.addEventListener('submit', handleLoginSubmit);
  }

  // Register link
  const registerLink = document.querySelector(SELECTORS.REGISTER_LINK);
  if (registerLink) {
	registerLink.addEventListener('click', () => {
	  router.navigateTo(ENDPOINTS.REGISTER);
	});
  }
}

/**
 * Handle login form submission
 */
async function handleLoginSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const loadingOverlay = document.getElementById(SELECTORS.LOADING);
  const messageContainer = document.getElementById(SELECTORS.MESSAGE);
  
  // Reset previous errors
  resetFormErrors();
  
  // Validate form fields
  if (!validateLoginForm(formData)) {
	return;
  }

  // Show loading indicator
  loadingOverlay.style.display = 'flex';
  
  try {
	const csrfToken = getCsrfToken();
	const response = await fetch(ENDPOINTS.LOGIN, {
	  method: 'POST',
	  body: formData,
	  headers: {
		'X-Requested-With': 'XMLHttpRequest',
		'X-CSRFToken': csrfToken,
	  },
	});

	const data = await response.json();
	messageContainer.innerHTML = '';
	loadingOverlay.style.display = 'none';

	if (data.success) {
	  if (data.requires_2fa) {
		show2FAForm(data.pre_auth_token, data.username);
	  } else {
		handleAuthSuccess(data);
	  }
	} else {
	  handleAuthError(data);
	}
  } catch (error) {
	loadingOverlay.style.display = 'none';
	messageContainer.innerHTML = `
	  <p class="text-danger">${gettext("Network error. Please try again.")}</p>
	`;
  }
}

/**
 * Reset form validation errors
 */
function resetFormErrors() {
  document.querySelectorAll('.text-danger').forEach(el => el.innerHTML = '');
  document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
}

/**
 * Validate login form fields
 * @returns {boolean} True if validation passes
 */
function validateLoginForm(formData) {
  let valid = true;

  if (!formData.get('username')) {
	document.getElementById(SELECTORS.ERRORS.USERNAME).innerHTML = 
	  gettext("Username is required");
	document.getElementById(SELECTORS.USERNAME).classList.add('is-invalid');
	valid = false;
  }

  if (!formData.get('password')) {
	document.getElementById(SELECTORS.ERRORS.PASSWORD).innerHTML = 
	  gettext("Password is required");
	document.getElementById(SELECTORS.PASSWORD).classList.add('is-invalid');
	valid = false;
  }

  if (!valid) {
	document.getElementById(SELECTORS.LOADING).style.display = 'none';
  }
  
  return valid;
}

/**
 * Get CSRF token from meta tag
 */
function getCsrfToken() {
  const tokenMeta = document.querySelector('meta[name="csrf-token"]');
  return tokenMeta ? tokenMeta.content : '';
}

/**
 * Display 2FA verification form
 */
function show2FAForm(preAuthToken, username) {
  // Hide login form and show 2FA form
  document.getElementById(SELECTORS.FORM).style.display = 'none';
  const twoFaForm = document.getElementById(SELECTORS.TWO_FA.CONTAINER);
  twoFaForm.style.display = 'block';
  
  // Focus on code input
  const codeInput = document.getElementById(SELECTORS.TWO_FA.INPUT);
  codeInput.value = '';
  codeInput.focus();
  
  // Handle Enter key for submission
  codeInput.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
	  e.preventDefault();
	  document.getElementById(SELECTORS.TWO_FA.SUBMIT).click();
	}
  });

  // Submit button handler
  document.getElementById(SELECTORS.TWO_FA.SUBMIT).onclick = () => {
	handle2FASubmit(preAuthToken, username);
  };

  // Cancel button handler
  document.getElementById(SELECTORS.TWO_FA.CANCEL).onclick = () => {
	document.getElementById(SELECTORS.FORM).style.display = 'block';
	twoFaForm.style.display = 'none';
	document.getElementById(SELECTORS.MESSAGE).innerHTML = '';
  };
}

/**
 * Handle 2FA code verification
 */
async function handle2FASubmit(preAuthToken, username) {
  const code = document.getElementById(SELECTORS.TWO_FA.INPUT).value;
  const messageContainer = document.getElementById(SELECTORS.MESSAGE);
  const loadingOverlay = document.getElementById(SELECTORS.LOADING);
  
  // Validate code format
  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
	messageContainer.innerHTML = `
	  <p class="text-danger">${gettext("Please enter a valid 6-digit code")}</p>
	`;
	return;
  }

  loadingOverlay.style.display = 'flex';
  
  try {
	const response = await fetch(ENDPOINTS.VERIFY_2FA, {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
		'X-CSRFToken': getCsrfToken(),
	  },
	  body: JSON.stringify({
		code: code,
		pre_auth_token: preAuthToken,
		username: username
	  }),
	});

	const data = await response.json();
	loadingOverlay.style.display = 'none';

	if (data.success) {
	  handleAuthSuccess(data);
	} else {
	  messageContainer.innerHTML = `
		<p class="text-danger">${data.message || gettext("Invalid 2FA code")}</p>
	  `;
	  // Clear input for retry
	  document.getElementById(SELECTORS.TWO_FA.INPUT).value = '';
	  document.getElementById(SELECTORS.TWO_FA.INPUT).focus();
	}
  } catch (error) {
	loadingOverlay.style.display = 'none';
	messageContainer.innerHTML = `
	  <p class="text-danger">${gettext("Verification failed. Please try again.")}</p>
	`;
  }
}

/**
 * Handle successful authentication (login or 2FA verification)
 */
function handleAuthSuccess(data) {
  // Update CSRF token if present
  if (data.csrf_token) {
	const csrfMeta = document.querySelector('meta[name="csrf-token"]');
	if (csrfMeta) {
	  csrfMeta.content = data.csrf_token;
	}
  }
  
  // Update username token if present
  if (data.username) {
	const usernameMeta = document.querySelector('meta[name="username-token"]');
	if (usernameMeta) {
	  usernameMeta.content = data.username;
	}
  }

  // Cookies are set by server (HttpOnly)
  update_navbar();
  router.navigateTo(ENDPOINTS.DASHBOARD);
}

/**
 * Handle authentication errors
 */
function handleAuthError(data) {
  const messageContainer = document.getElementById(SELECTORS.MESSAGE);
  
  if (data.errors) {
	// Field-specific errors
	for (const [field, errors] of Object.entries(data.errors)) {
	  const fieldSelector = SELECTORS.ERRORS[field.toUpperCase()];
	  if (!fieldSelector) continue;
	  
	  const errorContainer = document.getElementById(fieldSelector);
	  if (!errorContainer) continue;
	  
	  const errorList = document.createElement('ul');
	  errors.forEach(error => {
		const errorItem = document.createElement('li');
		errorItem.textContent = error.message;
		errorList.appendChild(errorItem);
	  });
	  
	  errorContainer.innerHTML = '';
	  errorContainer.appendChild(errorList);
	  
	  // Add invalid class to field
	  const fieldId = `id_${field}`;
	  const fieldElement = document.getElementById(fieldId);
	  if (fieldElement) {
		fieldElement.classList.add('is-invalid');
	  }
	}
  } else {
	// General error
	messageContainer.innerHTML = `
	  <p class="text-danger">${data.message || gettext("Authentication failed")}</p>
	`;
  }
}