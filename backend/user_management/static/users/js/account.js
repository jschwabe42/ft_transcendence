import router from '/static/js/router.js';

/**
 * The account page
 */

export function display_account() {
	const userAppContent = document.getElementById('user-app-content');

	userAppContent.innerHTML = `
	<div id="account-head-container">
		<img id="account-image" src="" alt="Your Profile Picture">
		<h3 id="account-username-head"></h3>
		<p id="account-email-head"></p>
	</div>
	`;

	get_account_details();
}

function get_account_details() {
	fetch('/users/api/get_account_details/')
		.then(response => response.json())
		.then(data => {
			console.log(data.username);
			console.log(data.email);
			console.log(data.display_name);
			console.log(data.image_url);
		});
}