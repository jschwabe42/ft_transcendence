import router from '/static/js/router.js';

/**
 * Account Management Module
 * Handles profile information, password changes, and 2FA operations
 * with enhanced security for critical operations
 */

// Constants
const ENDPOINTS = {
	ACCOUNT_DETAILS: '/users/api/get_account_details/',
	UPDATE_PROFILE: '/users/api/update_profile/',
	CHANGE_PASSWORD: '/users/api/change_password/',
	TWO_FA: {
		STATUS: '/users/api/2fa/status/',
		ENABLE: '/users/api/2fa/enable/',
		CONFIRM: '/users/api/2fa/confirm/',
		DISABLE: '/users/api/2fa/disable/',
		VERIFY: '/users/api/2fa/verify/'
	}
};

const SELECTORS = {
	CONTAINER: 'user-app-content',
	PROFILE: {
		USERNAME: 'username',
		EMAIL: 'email',
		USERNAME_HEADER: 'account-username-head',
		EMAIL_HEADER: 'account-email-head',
		IMAGE: 'account-image',
		IMAGE_UPLOAD: 'image-upload',
		EDIT_USERNAME: 'edit-username',
		EDIT_EMAIL: 'edit-email',
		UPDATE_BUTTON: 'update-profile-data',
		PASSWORD_INPUT: 'profile-password-input',
		PASSWORD_CONTAINER: 'password-input-container',
		SUBMIT_UPDATE: 'submit-profile-update'
	},
	PASSWORD: {
		CHANGE_BUTTON: 'change-password',
		FIELDS_CONTAINER: 'password-fields',
		CURRENT: 'current-password',
		NEW: 'new-password',
		REPEAT: 'repeat-password',
		UPDATE_BUTTON: 'update-password'
	},
	TWO_FA: {
		STATUS_TEXT: 'two-fact-status-text',
		TOGGLE_BUTTON: 'toggle-two-fact',
		SETUP_CONTAINER: 'two-fact-setup',
		DISABLE_CONTAINER: 'two-fact-disable',
		QR_CODE: 'two-fact-qr-code',
		SECRET: 'two-fact-secret',
		SETUP_CODE: 'two-fact-code',
		CONFIRM_BUTTON: 'confirm-two-fact',
		DISABLE_CODE: 'two-fact-disable-code',
		CONFIRM_DISABLE: 'confirm-disable-two-fact',
		CANCEL_DISABLE: 'cancel-disable-two-fact'
	},
	PASSWORD_2FA: {
		CONTAINER: 'password-2fa-container',
		CODE_INPUT: 'password-2fa-code',
		VERIFY_BUTTON: 'verify-password-2fa',
		CANCEL_BUTTON: 'cancel-password-2fa'
	}
};

// Global state
const state = {
	userData: null,
	pendingPasswordChange: null,
	has2FA: false
};


/**
 * Initialize the account management page
 */
export function display_account() {
	renderAccountPage();
	initEventListeners();
	fetchAccountDetails();
}

/**
 * Render the account management interface
 */
function renderAccountPage() {
	const userAppContent = document.getElementById(SELECTORS.CONTAINER);
	if (!userAppContent) return;

	userAppContent.innerHTML = `
	<div id="account-head-container">
	  <div id="account-image-container">
		<img id="${SELECTORS.PROFILE.IMAGE}" src="" alt="${gettext("Your Profile Picture")}">
		<i class="bi bi-pen-fill edit-icon"></i>
		<input type="file" id="${SELECTORS.PROFILE.IMAGE_UPLOAD}" style="display: none;" accept="image/*">
	  </div>
	  <div id="account-head-info">
		<h3 id="${SELECTORS.PROFILE.USERNAME_HEADER}"></h3>
		<p id="${SELECTORS.PROFILE.EMAIL_HEADER}"></p>
	  </div>
	</div>
	<hr class="account-head-divider">

	<div class="profile-info">
	  <h3 id="profile-info-head">${gettext("Profile Info:")}</h3>
	  <div id="profile-details">
		<p class="profile-field">
		  <span class="profile-field-label">${gettext("Username:")}</span>
		  <span id="${SELECTORS.PROFILE.USERNAME}"></span> 
		  <i class="bi bi-pencil-square" id="${SELECTORS.PROFILE.EDIT_USERNAME}"></i>
		</p>
		<p class="profile-field">
		  <span class="profile-field-label">${gettext("Email:")}</span>
		  <span id="${SELECTORS.PROFILE.EMAIL}"></span> 
		  <i class="bi bi-pencil-square" id="${SELECTORS.PROFILE.EDIT_EMAIL}"></i>
		</p>
		<button id="${SELECTORS.PROFILE.UPDATE_BUTTON}" class="btn btn-primary">${gettext("Update Profile Data")}</button>
		<div id="${SELECTORS.PROFILE.PASSWORD_CONTAINER}" style="visibility: hidden;">
		  <input type="password" id="${SELECTORS.PROFILE.PASSWORD_INPUT}" class="form-control" 
				 placeholder="${gettext("Enter your password")}" autocomplete="current-password">
		  <button id="${SELECTORS.PROFILE.SUBMIT_UPDATE}" class="btn btn-primary">${gettext("Submit")}</button>
		</div>
	  </div>
	  
	  <div id="profile-password">
		<button id="${SELECTORS.PASSWORD.CHANGE_BUTTON}" class="btn btn-primary">${gettext("Change Password")}</button>
		<div id="${SELECTORS.PASSWORD.FIELDS_CONTAINER}" style="display: none;">
		  <input type="password" id="${SELECTORS.PASSWORD.CURRENT}" class="form-control" 
				 placeholder="${gettext("Current Password")}" autocomplete="current-password">
		  <input type="password" id="${SELECTORS.PASSWORD.NEW}" class="form-control" 
				 placeholder="${gettext("New Password")}" autocomplete="new-password">
		  <input type="password" id="${SELECTORS.PASSWORD.REPEAT}" class="form-control" 
				 placeholder="${gettext("Repeat New Password")}" autocomplete="new-password">
		  <button id="${SELECTORS.PASSWORD.UPDATE_BUTTON}" class="btn btn-primary">${gettext("Save")}</button>
		</div>
		<!-- 2FA Verification for Password Change -->
		<div id="${SELECTORS.PASSWORD_2FA.CONTAINER}" style="display: none;" class="mt-3 p-3 border rounded">
		  <h4>${gettext("Two-Factor Authentication Required")}</h4>
		  <p>${gettext("Please enter your 2FA code to complete this security-sensitive operation:")}</p>
		  <input type="text" id="${SELECTORS.PASSWORD_2FA.CODE_INPUT}" class="form-control" 
				 placeholder="${gettext("Enter 2FA Code")}" maxlength="6" pattern="[0-9]*" inputmode="numeric">
		  <div class="mt-2">
			<button id="${SELECTORS.PASSWORD_2FA.VERIFY_BUTTON}" class="btn btn-primary">${gettext("Verify")}</button>
			<button id="${SELECTORS.PASSWORD_2FA.CANCEL_BUTTON}" class="btn btn-secondary">${gettext("Cancel")}</button>
		  </div>
		</div>
	  </div>
	  
	  <div id="profile-two-fact">
		<h3 id="two-fact-info-head">${gettext("Two-Factor Authentication (2FA):")}</h3>
		<div id="two-fact-status">
		  <p>${gettext("Status:")} <span id="${SELECTORS.TWO_FA.STATUS_TEXT}">${gettext("Disabled")}</span></p>
		</div>
		<button id="${SELECTORS.TWO_FA.TOGGLE_BUTTON}" class="btn btn-primary">${gettext("Enable 2FA")}</button>

		<!-- 2FA Disable Section -->
		<div id="${SELECTORS.TWO_FA.DISABLE_CONTAINER}" style="display: none;" class="mt-3 p-3 border rounded">
		  <p>${gettext("Enter your 2FA code to disable:")}</p>
		  <input type="text" id="${SELECTORS.TWO_FA.DISABLE_CODE}" class="form-control" 
				 placeholder="${gettext("Enter 2FA Code")}" maxlength="6" pattern="[0-9]*" inputmode="numeric">
		  <div class="mt-2">
			<button id="${SELECTORS.TWO_FA.CONFIRM_DISABLE}" class="btn btn-danger">${gettext("Confirm Disable")}</button>
			<button id="${SELECTORS.TWO_FA.CANCEL_DISABLE}" class="btn btn-secondary">${gettext("Cancel")}</button>
		  </div>
		</div>
		
		<!-- 2FA Setup Section -->
		<div id="${SELECTORS.TWO_FA.SETUP_CONTAINER}" style="display: none;" class="mt-3 p-3 border rounded">
		  <p>${gettext("Scan the QR code below with your authenticator app:")}</p>
		  <img id="${SELECTORS.TWO_FA.QR_CODE}" src="" alt="QR Code" class="mb-3">
		  <p>${gettext("Or enter this code manually:")} <code id="${SELECTORS.TWO_FA.SECRET}" class="user-select-all"></code></p>
		  <p>${gettext("Enter the code from your authenticator app to enable 2FA:")}</p>
		  <input type="text" id="${SELECTORS.TWO_FA.SETUP_CODE}" class="form-control" 
				 placeholder="${gettext("Enter 2FA Code")}" maxlength="6" pattern="[0-9]*" inputmode="numeric">
		  <button id="${SELECTORS.TWO_FA.CONFIRM_BUTTON}" class="btn btn-primary mt-2">${gettext("Confirm")}</button>
		</div>
	  </div>
	</div>
  `;
}

/**
 * Initialize all event listeners
 */
function initEventListeners() {
	// Profile image upload
	const profileImg = document.getElementById(SELECTORS.PROFILE.IMAGE);
	const imageUpload = document.getElementById(SELECTORS.PROFILE.IMAGE_UPLOAD);

	if (profileImg && imageUpload) {
		profileImg.addEventListener('click', () => imageUpload.click());
		imageUpload.addEventListener('change', handleImageUpload);
	}

	// Initialize other event handlers
	initPasswordChangeHandlers();
	init2FAHandlers();
}

/**
 * Initialize password change related event handlers
 */
function initPasswordChangeHandlers() {
	const changeBtn = document.getElementById(SELECTORS.PASSWORD.CHANGE_BUTTON);
	const updateBtn = document.getElementById(SELECTORS.PASSWORD.UPDATE_BUTTON);
	const verifyBtn = document.getElementById(SELECTORS.PASSWORD_2FA.VERIFY_BUTTON);
	const cancelBtn = document.getElementById(SELECTORS.PASSWORD_2FA.CANCEL_BUTTON);

	if (changeBtn) {
		changeBtn.addEventListener('click', togglePasswordFields);
	}

	if (updateBtn) {
		updateBtn.addEventListener('click', handlePasswordChange);
	}

	if (verifyBtn) {
		verifyBtn.addEventListener('click', verifyPasswordChange2FA);
	}

	if (cancelBtn) {
		cancelBtn.addEventListener('click', cancelPasswordChange2FA);
	}
}

/**
 * Initialize Two-Factor Authentication related event handlers
 */
function init2FAHandlers() {
	const toggleBtn = document.getElementById(SELECTORS.TWO_FA.TOGGLE_BUTTON);
	const confirmBtn = document.getElementById(SELECTORS.TWO_FA.CONFIRM_BUTTON);
	const disableBtn = document.getElementById(SELECTORS.TWO_FA.CONFIRM_DISABLE);
	const cancelDisableBtn = document.getElementById(SELECTORS.TWO_FA.CANCEL_DISABLE);

	if (toggleBtn) {
		toggleBtn.addEventListener('click', handle2FAToggle);
	}

	if (confirmBtn) {
		confirmBtn.addEventListener('click', confirm2FASetup);
	}

	if (disableBtn) {
		disableBtn.addEventListener('click', disable2FA);
	}

	if (cancelDisableBtn) {
		cancelDisableBtn.addEventListener('click', cancel2FADisable);
	}
}

/**
 * Fetch user's account details and 2FA status
 */
function fetchAccountDetails() {
	// Get account details
	fetch(ENDPOINTS.ACCOUNT_DETAILS)
		.then(handleRedirectResponse)
		.then(data => {
			if (!data) return;

			state.userData = data;
			updateAccountUI(data);
			setupProfileEditing(data);

			// Check if OAuth user and adjust UI
			if (data.is_oauth) {
				const passwordSection = document.getElementById('profile-password');
				if (passwordSection) {
					passwordSection.style.visibility = 'hidden';
				}
			}
		})
		.catch(error => {
			showNotification(gettext("Failed to load account details"), 'error');
			console.error('Error fetching account details:', error);
		});

	// Get 2FA status
	fetch(ENDPOINTS.TWO_FA.STATUS)
		.then(response => response.json())
		.then(data => {
			state.has2FA = data.enabled;
			update2FAStatusUI(data.enabled);
		})
		.catch(error => {
			console.error('Error fetching 2FA status:', error);
		});
}

/**
 * Handle response with potential redirect
 */
function handleRedirectResponse(response) {
	if (response.redirected) {
		router.navigateTo('/login/');
		return null;
	}
	return response.json();
}

/**
 * Update the account UI with user data
 */
function updateAccountUI(data) {
	// Update header section
	document.getElementById(SELECTORS.PROFILE.USERNAME_HEADER).textContent = data.username;
	document.getElementById(SELECTORS.PROFILE.EMAIL_HEADER).textContent = data.email;
	document.getElementById(SELECTORS.PROFILE.IMAGE).src = data.image_url;

	// Update profile section
	document.getElementById(SELECTORS.PROFILE.USERNAME).textContent = data.username;
	document.getElementById(SELECTORS.PROFILE.EMAIL).textContent = data.email;
}

/**
 * Update 2FA status in the UI
 */
function update2FAStatusUI(enabled) {
	const statusText = document.getElementById(SELECTORS.TWO_FA.STATUS_TEXT);
	const toggleButton = document.getElementById(SELECTORS.TWO_FA.TOGGLE_BUTTON);

	if (enabled) {
		statusText.textContent = gettext("Enabled");
		toggleButton.textContent = gettext("Disable 2FA");
	} else {
		statusText.textContent = gettext("Disabled");
		toggleButton.textContent = gettext("Enable 2FA");
	}
}

/**
 * Setup profile editing functionality
 */
function setupProfileEditing(data) {
	// Setup edit buttons
	document.getElementById(SELECTORS.PROFILE.EDIT_USERNAME).onclick = () => {
		editField(SELECTORS.PROFILE.USERNAME, data.username);
	};

	document.getElementById(SELECTORS.PROFILE.EDIT_EMAIL).onclick = () => {
		editField(SELECTORS.PROFILE.EMAIL, data.email);
	};

	// Setup update button
	const updateBtn = document.getElementById(SELECTORS.PROFILE.UPDATE_BUTTON);
	const submitBtn = document.getElementById(SELECTORS.PROFILE.SUBMIT_UPDATE);

	if (data.is_oauth) {
		updateBtn.onclick = () => updateProfile(data, null, true);
	} else {
		updateBtn.onclick = togglePasswordInput;
		submitBtn.addEventListener('click', () => {
			const password = document.getElementById(SELECTORS.PROFILE.PASSWORD_INPUT).value;
			if (!password) {
				showNotification(gettext("Password is required"), 'error');
				return;
			}
			updateProfile(data, password, false);
		});
	}
}

/**
 * Toggle password fields visibility
 */
function togglePasswordFields() {
	const fieldsContainer = document.getElementById(SELECTORS.PASSWORD.FIELDS_CONTAINER);
	const twoFAContainer = document.getElementById(SELECTORS.PASSWORD_2FA.CONTAINER);

	// Hide 2FA container if visible
	if (twoFAContainer) {
		twoFAContainer.style.display = 'none';
	}

	// Toggle password fields
	if (fieldsContainer) {
		fieldsContainer.style.display = fieldsContainer.style.display === 'none' ? 'block' : 'none';

		// Clear fields if hiding
		if (fieldsContainer.style.display === 'none') {
			clearPasswordFields();
		}
	}
}

/**
 * Clear password input fields
 */
function clearPasswordFields() {
	const fields = [
		SELECTORS.PASSWORD.CURRENT,
		SELECTORS.PASSWORD.NEW,
		SELECTORS.PASSWORD.REPEAT
	];

	fields.forEach(field => {
		const element = document.getElementById(field);
		if (element) element.value = '';
	});
}

/**
 * Handle password change request
 */
/**
 * Handle password change request
 */
function handlePasswordChange() {
	const currentPassword = document.getElementById(SELECTORS.PASSWORD.CURRENT).value;
	const newPassword = document.getElementById(SELECTORS.PASSWORD.NEW).value;
	const repeatPassword = document.getElementById(SELECTORS.PASSWORD.REPEAT).value;

	// Validate inputs
	if (!currentPassword || !newPassword || !repeatPassword) {
		showNotification(gettext("All password fields are required"), 'error');
		return;
	}

	if (newPassword !== repeatPassword) {
		showNotification(gettext("New passwords do not match"), 'error');
		return;
	}

	// Submit the initial password change request
	const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
	fetch(ENDPOINTS.CHANGE_PASSWORD, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify({
			current_password: currentPassword,
			new_password: newPassword,
		}),
	})
		.then(handleRedirectResponse)
		.then(data => {
			if (!data) return;

			if (data.requires_2fa) {
				// Store pending password change with change_id from server
				state.pendingPasswordChange = {
					currentPassword,
					newPassword,
					change_id: data.change_id
				};

				// Show 2FA verification
				document.getElementById(SELECTORS.PASSWORD.FIELDS_CONTAINER).style.display = 'none';
				document.getElementById(SELECTORS.PASSWORD_2FA.CONTAINER).style.display = 'block';
				document.getElementById(SELECTORS.PASSWORD_2FA.CODE_INPUT).focus();
			} else if (data.success) {
				// Password changed successfully (no 2FA required)
				showNotification(data.message, 'success');
				document.getElementById(SELECTORS.PASSWORD.FIELDS_CONTAINER).style.display = 'none';
				clearPasswordFields();
			} else {
				// Error occurred
				showNotification(data.message, 'error');
			}
		})
		.catch(error => {
			showNotification(gettext("Failed to change password"), 'error');
			console.error('Password change error:', error);
		});
}

/**
 * Verify 2FA code for password change
 */
/**
 * Verify 2FA code for password change
 */
function verifyPasswordChange2FA() {
	const code = document.getElementById(SELECTORS.PASSWORD_2FA.CODE_INPUT).value;

	if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
		showNotification(gettext("Please enter a valid 6-digit code"), 'error');
		return;
	}

	if (!state.pendingPasswordChange) {
		showNotification(gettext("No pending password change"), 'error');
		return;
	}

	const { currentPassword, newPassword, change_id } = state.pendingPasswordChange;
	const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

	// Submit password change with 2FA code directly to the password change endpoint
	fetch(ENDPOINTS.CHANGE_PASSWORD, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify({
			current_password: currentPassword,
			new_password: newPassword,
			two_fa_code: code,
			change_id: change_id
		}),
	})
		.then(handleRedirectResponse)
		.then(data => {
			if (!data) return;

			if (data.success) {
				showNotification(data.message, 'success');
				document.getElementById(SELECTORS.PASSWORD_2FA.CONTAINER).style.display = 'none';
				clearPasswordFields();
				state.pendingPasswordChange = null;
			} else {
				showNotification(data.message, 'error');

				// If account is locked due to too many attempts
				if (data.locked) {
					document.getElementById(SELECTORS.PASSWORD_2FA.CONTAINER).style.display = 'none';
					state.pendingPasswordChange = null;
				}
			}
		})
		.catch(error => {
			showNotification(gettext("Failed to verify and update password"), 'error');
			console.error('Password change verification error:', error);
		});
}

/**
 * Show a notification message
 */
function showNotification(message, type = 'info') {
	// Validate type parameter - only allow predefined values
	const allowedTypes = ['info', 'success', 'error', 'warning'];
	const safeType = allowedTypes.includes(type) ? type : 'info';

	// Sanitize message
	const sanitizedMessage = document.createTextNode(message);

	const notification = document.createElement('div');
	notification.className = `app-notification app-notification-${safeType}`;

	// Use predefined SVG content based on validated type
	const icon = document.createElement('span');
	icon.className = 'notification-icon';

	// Safe SVG insertion based on validated type
	let svgContent;
	switch (safeType) {
		case 'success':
			svgContent = 'checkmark';
			break;
		case 'error':
			svgContent = 'error';
			break;
		case 'warning':
			svgContent = 'warning';
			break;
		default:
			svgContent = 'info';
	}

	// Create SVG element programmatically instead of using innerHTML
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '16');
	svg.setAttribute('height', '16');
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('fill', 'none');
	svg.setAttribute('stroke', 'currentColor');
	svg.setAttribute('stroke-width', '2');
	svg.setAttribute('stroke-linecap', 'round');
	svg.setAttribute('stroke-linejoin', 'round');

	// Add appropriate paths based on type
	if (svgContent === 'checkmark') {
		const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path1.setAttribute('d', 'M22 11.08V12a10 10 0 1 1-5.93-9.14');
		const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
		polyline.setAttribute('points', '22 4 12 14.01 9 11.01');
		svg.appendChild(path1);
		svg.appendChild(polyline);
	} else if (svgContent === 'error') {
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttribute('cx', '12');
		circle.setAttribute('cy', '12');
		circle.setAttribute('r', '10');
		const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line1.setAttribute('x1', '15');
		line1.setAttribute('y1', '9');
		line1.setAttribute('x2', '9');
		line1.setAttribute('y2', '15');
		const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line2.setAttribute('x1', '9');
		line2.setAttribute('y1', '9');
		line2.setAttribute('x2', '15');
		line2.setAttribute('y2', '15');
		svg.appendChild(circle);
		svg.appendChild(line1);
		svg.appendChild(line2);
	} else if (svgContent === 'warning') {
		const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path1.setAttribute('d', 'M12 2L2 21h20L12 2zm0 3l7.5 12h-15L12 5z');
		svg.appendChild(path1);
	} else {
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttribute('cx', '12');
		circle.setAttribute('cy', '12');
		circle.setAttribute('r', '10');
		const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line1.setAttribute('x1', '12');
		line1.setAttribute('y1', '16');
		line1.setAttribute('x2', '12');
		line1.setAttribute('y2', '12');
		const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line2.setAttribute('x1', '12');
		line2.setAttribute('y1', '8');
		line2.setAttribute('x2', '12');
		line2.setAttribute('y2', '8');
		svg.appendChild(circle);
		svg.appendChild(line1);
		svg.appendChild(line2);
	}



	icon.appendChild(svg);

	const textContainer = document.createElement('div');
	textContainer.className = 'notification-content';
	textContainer.appendChild(sanitizedMessage);

	notification.appendChild(icon);
	notification.appendChild(textContainer);

	// Safely get or create container
	let container = document.getElementById('app-notification-container');
	if (!container) {
		container = document.createElement('div');
		container.id = 'app-notification-container';
		document.body.appendChild(container);
	}

	// Check if we already have 3 notifications - remove oldest if needed
	const existingNotifications = container.querySelectorAll('.app-notification');
	if (existingNotifications.length >= 3) {
		safelyDismissNotification(existingNotifications[0]);
	}

	container.appendChild(notification);

	// Use a WeakMap to store timeouts to prevent memory leaks
	const timeouts = new WeakMap();

	setTimeout(() => {
		if (notification.parentNode) {
			notification.classList.add('notification-active');
		}
	}, 10);

	const dismissTimeout = setTimeout(() => {
		safelyDismissNotification(notification);
	}, 4000);

	timeouts.set(notification, dismissTimeout);

	// Use a closure to prevent potential event handler exploitation
	const clickHandler = (() => {
		let isHandled = false;
		return function () {
			if (isHandled) return;
			isHandled = true;

			const timeout = timeouts.get(notification);
			if (timeout) clearTimeout(timeout);
			safelyDismissNotification(notification);
		};
	})();

	notification.addEventListener('click', clickHandler);

	return notification;
}

function safelyDismissNotification(notification) {
	if (!notification || !notification.parentNode) return;

	notification.classList.add('notification-dismissing');

	// Use only one transitionend listener
	const handleTransition = (event) => {
		if (event.propertyName !== 'opacity') return;
		if (notification.parentNode) {
			notification.removeEventListener('transitionend', handleTransition);
			notification.remove();
		}
	};

	notification.addEventListener('transitionend', handleTransition);
}


/**
 * Cancel 2FA disable operation
 */
function cancel2FADisable() {
	document.getElementById(SELECTORS.TWO_FA.DISABLE_CONTAINER).style.display = 'none';
	document.getElementById(SELECTORS.TWO_FA.DISABLE_CODE).value = '';
}
/**
 * Handle image upload
 */
function handleImageUpload(event) {
	const file = event.target.files[0];
	if (!file) return;

	// Validate file type
	if (!file.type.match('image.*')) {
		showNotification(gettext("Please select an image file"), 'error');
		return;
	}

	// Preview image
	const reader = new FileReader();
	reader.onload = function (e) {
		document.getElementById(SELECTORS.PROFILE.IMAGE).src = e.target.result;
	};
	reader.readAsDataURL(file);
}

/**
 * Handle 2FA toggle button click
 */
function handle2FAToggle() {
	const statusText = document.getElementById(SELECTORS.TWO_FA.STATUS_TEXT);
	const isEnabled = statusText.textContent === gettext("Enabled");

	if (isEnabled) {
		// Show disable confirmation
		document.getElementById(SELECTORS.TWO_FA.DISABLE_CONTAINER).style.display = 'block';
		document.getElementById(SELECTORS.TWO_FA.SETUP_CONTAINER).style.display = 'none';
		document.getElementById(SELECTORS.TWO_FA.DISABLE_CODE).focus();
	} else {
		// Initiate 2FA setup
		startTwoFactorSetup();
	}
}

/**
 * Start the 2FA setup process
 */
function startTwoFactorSetup() {
	const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

	fetch(ENDPOINTS.TWO_FA.ENABLE, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
			'X-CSRFToken': csrfToken,
		},
		credentials: 'include',
	})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				document.getElementById(SELECTORS.TWO_FA.QR_CODE).src = data.qr_code_url;
				document.getElementById(SELECTORS.TWO_FA.SECRET).textContent = data.secret;
				document.getElementById(SELECTORS.TWO_FA.SETUP_CONTAINER).style.display = 'block';
				document.getElementById(SELECTORS.TWO_FA.DISABLE_CONTAINER).style.display = 'none';
			} else {
				showNotification(data.message, 'error');
			}
		})
		.catch(error => {
			showNotification(gettext("Failed to start 2FA setup"), 'error');
			console.error('2FA setup error:', error);
		});
}

/**
 * Submit the password change request to the server
 */
function submitPasswordChange(currentPassword, newPassword) {
	const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

	fetch(ENDPOINTS.CHANGE_PASSWORD, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify({
			current_password: currentPassword,
			new_password: newPassword,
		}),
	})
		.then(handleRedirectResponse)
		.then(data => {
			if (!data) return;

			if (data.success) {
				showNotification(data.message, 'success');
				document.getElementById(SELECTORS.PASSWORD.FIELDS_CONTAINER).style.display = 'none';
				clearPasswordFields();
			} else {
				showNotification(data.message, 'error');
			}
		})
		.catch(error => {
			showNotification(gettext("Failed to change password"), 'error');
			console.error('Password change error:', error);
		});
}

/**
 * Cancel the 2FA verification for password change
 */
function cancelPasswordChange2FA() {
	document.getElementById(SELECTORS.PASSWORD_2FA.CONTAINER).style.display = 'none';
	document.getElementById(SELECTORS.PASSWORD_2FA.CODE_INPUT).value = '';
	state.pendingPasswordChange = null;
}

/**
 * Verify a 2FA code
 * @returns {Promise<boolean>} True if verification successful
 */
function verify2FACode(code) {
	const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

	return fetch(ENDPOINTS.TWO_FA.VERIFY, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify({ code }),
	})
		.then(response => response.json())
		.then(data => data.success);
}

/**
 * Toggle password input visibility for profile update
 */
function togglePasswordInput() {
	const container = document.getElementById(SELECTORS.PROFILE.PASSWORD_CONTAINER);
	const isVisible = container.style.visibility === 'visible';

	container.style.visibility = isVisible ? 'hidden' : 'visible';

	if (isVisible) {
		document.getElementById(SELECTORS.PROFILE.PASSWORD_INPUT).value = '';
	} else {
		document.getElementById(SELECTORS.PROFILE.PASSWORD_INPUT).focus();
	}
}

/**
 * Edit a profile field (username/email)
 */
function editField(fieldId, value) {
	const span = document.getElementById(fieldId);
	const isEditing = span.querySelector('input') !== null;

	if (isEditing) {
		span.innerHTML = value;
	} else {
		span.innerHTML = `<input type="text" id="edit-text-${fieldId}" value="${value}" class="form-control">`;
		document.getElementById(`edit-text-${fieldId}`).focus();
	}
}

/**
 * Update user profile
 */
function updateProfile(originalData, password, isOAuthUser) {
	const username = getEditedFieldValue(SELECTORS.PROFILE.USERNAME, originalData.username);
	const email = getEditedFieldValue(SELECTORS.PROFILE.EMAIL, originalData.email);
	const imageInput = document.getElementById(SELECTORS.PROFILE.IMAGE_UPLOAD);
	const image = imageInput.files[0];

	// Check if any changes were made
	if (username === originalData.username && email === originalData.email && !image) {
		showNotification(gettext("No changes detected"), 'info');
		return;
	}

	// Validate password for non-OAuth users
	if (!isOAuthUser && !password) {
		showNotification(gettext("Password is required to update profile"), 'error');
		return;
	}

	// Create form data
	const formData = new FormData();
	formData.append('username', username);
	formData.append('email', email);

	if (!isOAuthUser) {
		formData.append('password', password);
	}

	if (image) {
		formData.append('image', image);
	}

	// Send update request
	const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
	fetch(ENDPOINTS.UPDATE_PROFILE, {
		method: 'POST',
		body: formData,
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			'X-CSRFToken': csrfToken,
		},
	})
		.then(handleRedirectResponse)
		.then(data => {
			if (!data) return;

			if (data.success) {
				showNotification(data.message, 'success');
				resetEditableFields(originalData);
				fetchAccountDetails(); // Refresh data
			} else {
				showNotification(data.message, 'error');
			}
		});
}

/**
 * Get the value of an edited field
 */
function getEditedFieldValue(fieldId, defaultValue) {
	const editInput = document.getElementById(`edit-text-${fieldId}`);
	return editInput ? editInput.value : defaultValue;
}

/**
 * Reset editable fields to their original state
 */
function resetEditableFields(originalData) {
	editField(SELECTORS.PROFILE.USERNAME, originalData.username);
	editField(SELECTORS.PROFILE.EMAIL, originalData.email);

	// Hide password input if visible
	const passwordContainer = document.getElementById(SELECTORS.PROFILE.PASSWORD_CONTAINER);
	if (passwordContainer) {
		passwordContainer.style.visibility = 'hidden';
		document.getElementById(SELECTORS.PROFILE.PASSWORD_INPUT).value = '';
	}
}

/**
 * Confirm 2FA setup with verification code
 */
function confirm2FASetup() {
	const code = document.getElementById(SELECTORS.TWO_FA.SETUP_CODE).value;

	if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
		showNotification(gettext("Please enter a valid 6-digit code"), 'error');
		return;
	}

	const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

	fetch(ENDPOINTS.TWO_FA.CONFIRM, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
		},
		credentials: 'include',
		body: JSON.stringify({ code }),
	})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				update2FAStatusUI(true);
				showNotification(data.message, 'success');
				document.getElementById(SELECTORS.TWO_FA.SETUP_CONTAINER).style.display = 'none';
				state.has2FA = true;
			} else {
				showNotification(data.message, 'error');
			}
		})
		.catch(error => {
			showNotification(gettext("Failed to confirm 2FA setup"), 'error');
			console.error('2FA confirmation error:', error);
		});
}

/**
 * Disable 2FA with verification code
 */
function disable2FA() {
	const code = document.getElementById(SELECTORS.TWO_FA.DISABLE_CODE).value;

	if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
		showNotification(gettext("Please enter a valid 6-digit code"), 'error');
		return;
	}

	const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

	fetch(ENDPOINTS.TWO_FA.DISABLE, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
			'X-CSRFToken': csrfToken,
		},
		credentials: 'include',
		body: JSON.stringify({ code }),
	})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				update2FAStatusUI(false);
				showNotification(data.message, 'success');
				document.getElementById(SELECTORS.TWO_FA.DISABLE_CONTAINER).style.display = 'none';
				document.getElementById(SELECTORS.TWO_FA.DISABLE_CODE).value = '';
				state.has2FA = false;
			} else {
				showNotification(data.message, 'error');
			}
		})
		.catch(error => {
			showNotification(gettext("Failed to disable 2FA"), 'error');
			console.error('2FA disable error:', error);
		});
}