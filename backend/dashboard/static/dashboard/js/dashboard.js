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

function displayProfiles(profile_names) {
	const profileList = document.getElementById('profile-list');
	profileList.innerHTML = '';
	profile_names.forEach(username => {
		const listItem = document.createElement('li');
		listItem.textContent = username;
		listItem.style.cursor = 'pointer';
		listItem.addEventListener('click', () => {
			router.navigateTo(`/dashboard/${username}/`);
		});
		profileList.appendChild(listItem);
	});
}

function fetchAndLoadProfiles() {
	fetch('/dashboard/api/profile_list/')
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				displayProfiles(data.profile_names);
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