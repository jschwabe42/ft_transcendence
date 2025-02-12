import router from '/static/js/router.js';

export function loadProfile(username) {
	const dashboardAppContent = document.getElementById('dashboard-app-content');
	dashboardAppContent.innerHTML = `
	<div id="pv-profile-header">
		<img id="pv-profile-picture"></img>
		<h3 id="pv-profile-name"></h3>
	</div>
	<div id="pv-profile-settings-content" style="visibility: hidden;">
		<button id="pv-show-blocked-users" class="btn btn-primary">${gettext("Blocked Users")}</button>
		<div id="pv-blocked-users-list" style="visibility: hidden;"></div>
	</div>
	<div id="pv-profile-content">
		<div id="pv-quiz-stats">
			<h4>${gettext("Quiz Stats")}</h4>
			<ul id="pv-quiz-stats-list"></ul>
		</div>
	</div>
	`;
	fetchData(username);
	document.getElementById('pv-show-blocked-users').addEventListener('click', function () {
		const blockedUsersList = document.getElementById('pv-blocked-users-list');
		if (blockedUsersList.style.visibility === 'hidden') {
			addBlockedUsersList();
		} else {
			blockedUsersList.style.visibility = 'hidden';
			blockedUsersList.innerHTML = '';
		}
	});
}

function fetchData(username) {
	fetch(`/dashboard/api/get_profile/${username}/`)
		.then(response => {
			if (response.redirected) {
				router.navigateTo('/login/');
				return;
			}
			return response.json();
		})
		.then(data => {
			console.log('Data:', data);
			if (data.success) {
				if (data.blocked === true) {
					displayBlockedProfile(data);
				} else {
					console.log('Profile:', data.profile);
					displayProfile(data.profile);
				}
			} else {
				console.error('Failed to fetch profile');
			}
		})
		.catch(error => {
			console.error('Error:', error);
			dashboardAppContent.innerHTML = `<h3>${gettext("Error loading profile for")} ${username}</h3>`;
		});
}

function displayProfile(profile) {
	const profilePicture = document.getElementById('pv-profile-picture');
	profilePicture.src = profile.image_url;
	profilePicture.alt = `${profile.username}${gettext("'s profile picture")}`;
	const profileName = document.getElementById('pv-profile-name');
	profileName.textContent = `${profile.username}${gettext("'s Profile")}`;

	if (profile.is_requests_profile === false) {
		const profileHeader = document.getElementById('pv-profile-header');
		const blockButton = document.createElement('button');
		blockButton.id = 'pv-block-button';
		blockButton.className = 'btn btn-danger';
		profileHeader.appendChild(blockButton);

		if (profile.is_user_blocked_by_requester === true) {
			blockButton.textContent = gettext('Unblock');
		} else {
			blockButton.textContent = gettext('Block');
		}
		blockButton.addEventListener('click', function () {
			if (blockButton.textContent === gettext('Block')) {
				blockUser(profile.username);
			} else {
				unblockUser(profile.username);
			}
		});
	} else {
		addSettingsButton();
		document.getElementById('pv-profile-settings-content').style.visibility = 'visible';
	}

	const quizStatsList = document.getElementById('pv-quiz-stats-list');
	quizStatsList.innerHTML = `
		<li>${gettext("Games Played:")} ${profile.quiz_games_played}</li>
		<li>${gettext("Games Won:")} ${profile.quiz_games_won}</li>
		<li>${gettext("Total Score:")} ${profile.quiz_total_score}</li>
		<li>${gettext("High Score:")} ${profile.quiz_high_score}</li>
		<li>${gettext("Questions Asked:")} ${profile.quiz_questions_asked}</li>
		<li>${gettext("Correct Answers:")} ${profile.quiz_correct_answers}</li>
	`;
}

function displayBlockedProfile(data) {
	console.log('Blocked:', data);
	const profilePicture = document.getElementById('pv-profile-picture');
	profilePicture.src = data.image_url;
	profilePicture.alt = `${data.username}${gettext("'s profile picture")}`;
	const profileName = document.getElementById('pv-profile-name');
	profileName.textContent = `${data.username}${gettext("'s Profile")}`;

	const profileContent = document.getElementById('pv-profile-content');
	profileContent.innerHTML = '';
	const paragraph = document.createElement('p');
	paragraph.id = 'profile-is-blocked';
	paragraph.innerHTML = `${gettext("This user has blocked you. You cannot view their profile.")}`;
	profileContent.appendChild(paragraph);

	const profileHeader = document.getElementById('pv-profile-header');
	const blockButton = document.createElement('button');
	blockButton.id = 'pv-block-button';
	blockButton.className = 'btn btn-danger';
	profileHeader.appendChild(blockButton);

	if (data.is_user_blocked_by_requester === true) {
		blockButton.textContent = gettext('Unblock');
	} else {
		blockButton.textContent = gettext('Block');
	}
	blockButton.addEventListener('click', function () {
		if (blockButton.textContent === gettext('Block')) {
			blockUser(data.username);
		} else {
			unblockUser(data.username);
		}
	});

}

function blockUser(username) {
	const csfrToken = document.querySelector('meta[name="csrf-token"]').content;

	fetch(`/users/api/block/${username}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csfrToken,
		}
	})
	.then(response => response.json())
	.then(data => {
		alert(data.message);
		if (data.success) {
			console.log('User blocked');
			const blockButton = document.getElementById('pv-block-button');
			blockButton.textContent = gettext('Unblock');
		} else {
			console.error('Failed to block user');
		}
	})
	.catch(error => {
		console.error('Error:', error);
	});
}

function unblockUser(username) {
	const csfrToken = document.querySelector('meta[name="csrf-token"]').content;

	fetch(`/users/api/unblock/${username}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csfrToken,
		}
	})
	.then(response => response.json())
	.then(data => {
		alert(data.message);
		if (data.success) {
			console.log('User unblocked');
			const blockButton = document.getElementById('pv-block-button');
			blockButton.textContent = gettext('Block');
		} else {
			console.error('Failed to unblock user');
		}
	})
	.catch(error => {
		console.error('Error:', error);
	});
}

function addSettingsButton() {
	const profileHeader = document.getElementById('pv-profile-header');
	const settingsButton = document.createElement('button');

	settingsButton.id = 'pv-settings-button';
	settingsButton.className = 'btn btn-primary';
	settingsButton.innerHTML = `
		<i class="bi bi-gear-fill"></i>
		<span class="sr-only">${gettext("Settings")}</span>
	`;
	profileHeader.appendChild(settingsButton);

	settingsButton.addEventListener('click', function () {
		router.navigateTo('/account/');
	});
}

function addBlockedUsersList(profile) {
	const csfrToken = document.querySelector('meta[name="csrf-token"]').content;

	fetch(`/users/api/blocked/`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csfrToken,
		}
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			console.log('Blocked users:', data.blocked_users);
			const blockedUsersList = document.getElementById('pv-blocked-users-list');
			blockedUsersList.style.visibility = 'visible';
			blockedUsersList.innerHTML = '';
			if (data.blocked_users.length === 0) {
				const noBlockedUsers = document.createElement('p');
				noBlockedUsers.textContent = gettext('No blocked users');
				blockedUsersList.appendChild(noBlockedUsers);
			}
			else {
				data.blocked_users.forEach(username => {
					const userItem = document.createElement('div');
					userItem.className = 'pv-blocked-user-item';
					userItem.innerHTML = `
						<span>${username}</span>
						<button class="btn btn-danger pv-unblock-button" data-username="${username}">${gettext("Unblock")}</button>
					`;
					blockedUsersList.appendChild(userItem);
				});
			}
			const unblockButtons = document.querySelectorAll('.pv-unblock-button');
			unblockButtons.forEach(button => {
				button.addEventListener('click', function () {
					const username = button.getAttribute('data-username');
					if (button.textContent === gettext('Unblock')) {
						console.log("HEllo");
						fetch(`/users/api/unblock/${username}/`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csfrToken,
							}
						})
						.then(response => response.json())
						.then(data => {
							alert(data.message);
							if (data.success) {
								console.log('User unblocked');
								button.textContent = gettext('Block');
							} else {
								console.error('Failed to unblock user');
							}
						})
						.catch(error => {
							console.error('Error:', error);
						});
					} else {
						fetch(`/users/api/block/${username}/`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csfrToken,
							}
						})
						.then(response => response.json())
						.then(data => {
							alert(data.message);
							if (data.success) {
								console.log('User blocked');
								button.textContent = gettext('Unblock');
							} else {
								console.error('Failed to block user');
							}
						})
						.catch(error => {
							console.error('Error:', error);
						});
					}
				});
			});
		}
	});
}