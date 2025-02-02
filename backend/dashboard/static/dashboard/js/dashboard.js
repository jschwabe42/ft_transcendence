import router from '/static/js/router.js';

export function loadDashboard() {
	const dashboardAppContent = document.getElementById('dashboard-app-content');
	dashboardAppContent.innerHTML = `
		<button id="refresh-button" class="btn btn-primary">Refresh</button>
		<ul id="profile-list"></ul>
	`;
	fetchAndLoadProfiles();
	addEventListeners();

}

function displayProfiles(profiles) {
	const profileList = document.getElementById('profile-list');
	profileList.innerHTML = '';
	profiles.forEach(profile => {
		console.log('Profile:', profile);
		const listItem = document.createElement('div');
		listItem.style.cursor = 'pointer';

		const profileContainer = document.createElement('div');
		profileContainer.className = 'profile-container';

		const profileImage = document.createElement('img');
		profileImage.src = profile.image_url;
		profileImage.className = 'profile-image';
		profileImage.alt = `${profile.username}'s profile picture`;

		const profileName = document.createElement('span');
		profileName.className = 'profile-name';
		profileName.textContent = profile.username;

		const navigateToProfile = () => {
			router.navigateTo(`/dashboard/${profile.username}/`);
		};

		profileContainer.addEventListener('click', navigateToProfile);

		profileContainer.appendChild(profileImage);
		profileContainer.appendChild(profileName);
		listItem.appendChild(profileContainer);
		profileList.appendChild(listItem);
	});
}

function fetchAndLoadProfiles() {
	fetch('/dashboard/api/profile_list/')
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				displayProfiles(data.profiles);
			} else {
				console.error('Failed to fetch profiles');
			}
		})
		.catch (error => {
			console.error('Error:', error);
		});
}

function addEventListeners() {
	const refreshButton = document.getElementById('refresh-button');
	refreshButton.addEventListener('click', fetchAndLoadProfiles);
}