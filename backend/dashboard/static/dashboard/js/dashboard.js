import router from '/static/js/router.js';

export function loadDashboard() {
	const dashboardAppContent = document.getElementById('dashboard-app-content');
	dashboardAppContent.innerHTML = `
		<p>Dashboard</p>
		<ul id="profile-list"></ul>
	`;

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

function displayProfiles(profile_names) {
	const profileList = document.getElementById('profile-list');
	profile_names.forEach(username => {
		const listItem = document.createElement('li');
		listItem.textContent = username;
		profileList.appendChild(listItem);
	});
}