import router from '/static/js/router.js';
import { update_navbar, clear_containers } from '/static/js/navbar.js';

export async function oauth_flow() {
	const response = await fetch(`/users/api/oauth/`, {
		method: "POST",
		headers: {
			'Content-Type': "application/json",
			'X-CSRFToken': localStorage.getItem('csrftoken'),
		},
	});
	const data = await response.json();
	if (response.ok) {
		console.warn(data.location);
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
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');
	const error = urlParams.get('error');
	const state = urlParams.get('state');

	try {
		if (error) {
			console.warn("OAuth error:", error);
			throw new Error(error);
		} else if (code && state) {
			const response = await fetch(`/users/api/oauth-callback/?code=${code}&state=${state}`, {
				method: "POST",
				headers: {
					'Content-Type': "application/json",
					'X-CSRFToken': localStorage.getItem('csrftoken'),
				},
			});
			const data = await response.json();
			if (response.ok) {
				console.warn("OAuth callback success:", data);
				localStorage.setItem('csrftoken', data.csrftoken);
				router.navigateTo('/dashboard/');
				window.location.reload();
			} else {
				throw new Error(data.error);
			}
		}
	} catch (error) {
		const error_description = urlParams.get('error_description');
		if (!error_description) {
			display_oauth_error(error);
		}
		display_oauth_error(error, error_description);
	}
}
