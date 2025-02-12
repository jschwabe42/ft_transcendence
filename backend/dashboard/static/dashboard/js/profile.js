import router from '/static/js/router.js';

export function loadProfile(username) {
	const dashboardAppContent = document.getElementById('dashboard-app-content');
	dashboardAppContent.innerHTML = `
	<div id="pv-profile-header">
		<img id="pv-profile-picture"></img>
		<h3 id="pv-profile-name"></h3>
	</div>
	<div id="pv-profile-content">
		<div id="pv-quiz-stats">
			<h4>${gettext("Quiz Stats")}</h4>
			<ul id="pv-quiz-stats-list"></ul>
		</div>
	</div>
	`;
	fetchData(username);
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
			if (data.success) {
				if (data.blocked === true) {
					displayBlockedProfile(data);
				}
				console.log('Profile:', data.profile);
				displayProfile(data.profile);
			} else {
				console.error('Failed to fetch profile');
			}
		})
		.catch(error => {
			console.error('Error:', error);
			dashboardAppContent.innerHTML = `<h3>Error loading profile for ${username}</h3>`;
		});
}

function displayProfile(profile) {
	const profilePicture = document.getElementById('pv-profile-picture');
	profilePicture.src = profile.image_url;
	profilePicture.alt = `${profile.username}${gettext("'s profile picture")}`;
	const profileName = document.getElementById('pv-profile-name');
	profileName.textContent = `${profile.username}${gettext("'s Profile")}`;

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
	const profilePicture = document.getElementById('pv-profile-picture');
	profilePicture.src = data.image_url;
	profilePicture.alt = `${data.username}${gettext("'s profile picture")}`;
	const profileName = document.getElementById('pv-profile-name');
	profileName.textContent = `${data.username}${gettext("'s Profile")}`;

	const profileContent = document.getElementById('pv-profile-content');
	const paragraph = document.createElement('p');
	paragraph.id = 'profile-is-blocked';
	paragraph.innerHTML = `${gettext("This user has blocked you. You cannot view their profile.")}`;
}
