import router from '/static/js/router.js';
import { update_navbar, clear_containers } from '/static/js/navbar.js';

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
		console.warn(data.location);
		update_navbar();
		window.location.href = data.location;
	} else {
		console.error("Error during OAuth authorization");
	}
}

function display_oauth_error(error, error_description) {
	clear_containers();
	document.getElementById('error-content').innerHTML = `
	<h2>${gettext("OAuth Error")}</h2>
	<p>${gettext(error.message)}</p>
	<p>${gettext(error_description)}</p>
	<a href="/login/">${gettext("Back to Login")}</a>
	`;
}

export async function oauth_callback() {
	console.warn(window.location.search);
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');
	const error = urlParams.get('error');
	const state = urlParams.get('state');

	try {
		if (error) {
			console.warn("OAuth error:", error);
			throw new Error(error);
			// alert(error)
		} else if (code && state) {
			// Process the authorization code (e.g., exchange it for an access token)
		} else {
			console.warn("No code or error received in OAuth callback");
			throw new Error(error);
		}
	} catch (error) {
		display_oauth_error(error, urlParams.get('error_description'));
	}
	const response = await fetch(`/users/api/callback/?code=${code}&state=${state}`, {
		method: "GET",
		headers: {
			'Content-Type': "application/json",
			'X-CSRFToken': localStorage.getItem('csrftoken'),
		},
	});
	const data = await response.json();
	if (response.ok) {
		console.warn("OAuth callback success:", data);
		update_navbar();
		router.navigateTo('/dashboard/');
	} else {
		display_oauth_error(error);
	}
}
