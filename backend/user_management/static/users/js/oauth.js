import router from '/static/js/router.js';
import { update_navbar } from '/static/js/navbar.js';

export async function oauth_flow() {
	const response = await fetch(`/users/oauth/`, {
		method: "POST",
		headers: {
			'Content-Type': "application/json",
			'X-CSRFToken': localStorage.getItem('csrftoken'),
		},
	});
	const data = await response.json();
	if (response.ok) {
		window.location.href = data.location;
	} else {
		console.error("Error during OAuth authorization");
		update_navbar();
		router.navigateTo('/login/');
	}
}
