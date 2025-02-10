import router from '/static/js/router.js';

/**
 * The account page
 */

export function display_account() {
	const userAppContent = document.getElementById('user-app-content');

	userAppContent.innerHTML = `
	<div id="account-head-container">
		<div id="account-image-container">
			<img id="account-image" src="" alt="${gettext("Your Profile Picture")}">
			<i class="bi bi-pen-fill edit-icon"></i>
			<input type="file" id="image-upload" style="display: none;">
		</div>
		<div id="account-head-info">
			<h3 id="account-username-head"></h3>
			<p id="account-email-head"></p>
		</div>
	</div>
	<hr class="account-head-divider">

	<div class="profile-info">
		<h3 id="profile-info-head">${gettext("Profile Info:")}</h3>
		<div id="profile-details">
			<p class="profile-field">
				<span class="profile-field-label">${gettext("Username:")}</span>
				<span id="username"></span> <i class="bi bi-pencil-square" id="edit-username"></i>
			</p>
			<p class="profile-field">
				<span class="profile-field-label">${gettext("Email:")}</span>
				<span id="email"></span> <i class="bi bi-pencil-square" id="edit-email"></i>
			</p>
			<p class="profile-field" id="last-profile-field">
				<span class="profile-field-label">${gettext("Display Name:")}</span>
				<span id="display_name"></span> <i class="bi bi-pencil-square" id="edit-display_name"></i>
			</p>
			<button id="update-profile-data" class="btn btn-primary">${gettext("Update Profile Data")}</button>
			<div id="password-input-container" style="visibility: hidden;">
				<input type="password" id="profile-password-input" class="form-control" placeholder="${gettext("Enter your password")}">
				<button id="submit-profile-update" class="btn btn-primary">${gettext("Submit")}</button>
			</div>
		</div>
		<div id="profile-password">
			<button id="change-password" class="btn btn-primary">${gettext("Change Password")}</button>
			<div id="password-fields" style="display: none;">
				<input type="password" id="current-password" class="form-control" placeholder="${gettext("Current Password")}">
				<input type="password" id="new-password" class="form-control" placeholder="${gettext("New Password")}">
				<input type="password" id="repeat-password" class="form-control" placeholder="${gettext("Repeat New Password")}">
				<button id="update-password" class="btn btn-primary">${gettext("Save")}</button>
			</div>
		</div>
	</div>
	`;

	get_account_details();

	document.getElementById('account-image').addEventListener('click', () => {
		document.getElementById('image-upload').click();
	});
	document.getElementById('image-upload').addEventListener('change', upload_image);

	change_password();
}

function get_account_details() {
	fetch('/users/api/get_account_details/')
		.then(response => {
			if (response.redirected) {
				router.navigateTo('/login/');
				return;
			}
			return response.json();
		})
		.then(data => {
			document.getElementById('account-username-head').textContent = `${data.username}${gettext("'s profile")}`;
			document.getElementById('account-email-head').textContent = data.email;
			document.getElementById('account-image').src = data.image_url;

			document.getElementById('username').textContent = data.username;
			document.getElementById('email').textContent = data.email;
			document.getElementById('display_name').textContent = data.display_name;

			document.getElementById('edit-username').addEventListener('click', () => {
				edit_field('username', data.username);
			});
			document.getElementById('edit-email').addEventListener('click', () => {
				edit_field('email', data.email);
			});
			document.getElementById('edit-display_name').addEventListener('click', () => {
				edit_field('display_name', data.display_name);
			});

			document.getElementById('update-profile-data').addEventListener('click', () => {
				const passwordInputContainer = document.getElementById('password-input-container');
				const style = passwordInputContainer.style.visibility;
				if (style === 'hidden') {
					passwordInputContainer.style.visibility = 'visible';
				}
				else {
					passwordInputContainer.style.visibility = 'hidden';
				}
			});

			document.getElementById('submit-profile-update').addEventListener('click', () => {
				const password = document.getElementById('profile-password-input').value;
				if (!password) {
					alert(`${gettext("Password is required.")}`);
					return;
				}
				update_profile(data, password);
				const passwordInputContainer = document.getElementById('password-input-container');
				passwordInputContainer.style.visibility = 'hidden';
			});
		});
}

function edit_field(field, value) {
	const span = document.getElementById(field);
	const isEditing = span.querySelector('input') !== null;
	if (isEditing) {
		span.innerHTML = value;
	} else {
		span.innerHTML = `<input type="text" id="edit-text-${field}" value="${value}" class="form-control">`;
	}
}

function update_profile(originalData, password) {
	const username = document.getElementById('edit-text-username') ? document.getElementById('edit-text-username').value : originalData.username;
	const email = document.getElementById('edit-text-email') ? document.getElementById('edit-text-email').value : originalData.email;
	const display_name = document.getElementById('edit-text-display_name') ? document.getElementById('edit-text-display_name').value : originalData.display_name;
	const image = document.getElementById('image-upload').files[0];

	if (username === originalData.username && email === originalData.email && display_name === originalData.display_name && !image) {
		alert(`${gettext("No changes detected.")}`);
		return;
	}
	if (!password) {
		alert(`${gettext("Password is required to update profile data.")}`);
		return;
	}

	const formData = new FormData();
	formData.append('username', username);
	formData.append('email', email);
	formData.append('display_name', display_name);
	formData.append('password', password);
	if (image) {
		formData.append('image', image);
	}

	const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
	fetch('/users/api/update_profile/', {
		method: 'POST',
		body: formData,
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			'X-CSRFToken': csrfToken,
		},
	})
		.then(response => {
			if (response.redirected) {
				router.navigateTo('/login/');
				return;
			}
			return response.json();
		})
		.then(data => {
			if (data.success) {
				alert(data.message);
				edit_field('username', originalData.username);
				edit_field('email', originalData.email);
				edit_field('display_name', originalData.display_name);
				get_account_details();
			} else {
				alert(data.message);
			}
	});
}

function upload_image(event) {
	const file = event.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			document.getElementById('account-image').src = e.target.result;
		};
		reader.readAsDataURL(file);
	}
}

function change_password(event) {
	document.getElementById('change-password').addEventListener('click', () => {
		const style = document.getElementById('password-fields').style.display;
		if (style === 'none') {
			document.getElementById('password-fields').style.display = 'block';
		}
		else {
			document.getElementById('password-fields').style.display = 'none';
		}
	});

	document.getElementById('update-password').addEventListener('click', () => {
		const current_password = document.getElementById('current-password').value;
		const new_password = document.getElementById('new-password').value;
		const repeat_password = document.getElementById('repeat-password').value;


		if(!current_password || !new_password || !repeat_password) {
			alert(`${gettext("All fields are required.")}`);
			return;
		}
		if (new_password !== repeat_password) {
			alert(`${gettext("New password and repeat password do not match.")}`);
			return;
		}
			const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
		
			fetch('/users/api/change_password/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
					'X-CSRFToken': csrfToken,
				},
				body: JSON.stringify({
					current_password: current_password,
					new_password: new_password,
				}),
			})
			.then(response => {
				if (response.redirected) {
					router.navigateTo('/login/');
					return;
				}
				return response.json();
			})
			.then(data => {
				if (data.success) {
					alert(data.message);
					document.getElementById('password-fields').style.display = 'none';
					document.getElementById('current-password').value = '';
					document.getElementById('new-password').value = '';
					document.getElementById('repeat-password').value = '';
				} else {
					alert(data.message)
				}
			});
	});
}