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
		console.warn(data.location);
		update_navbar();
		window.location.href = data.location;
	} else {
		console.error("Error during OAuth authorization");
		update_navbar();
		router.navigateTo('/login/');
		// oauth_error();
	}
}

export async function oauth_callback() {
	console.warn(window.location.search);
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');
	const error = urlParams.get('error');
	const state = urlParams.get('state');

	if (error) {
		console.error("OAuth error:", error);
		//router.navigateTo('/login/');
		window.location.href = '/login/';
		throw new Error(error);
		// Handle the error (e.g., display an error message)
	} else if (code) {
		console.log("Authorization code:", code);
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
			// update_navbar();
			// router.navigateTo('/dashboard/');
			// window.location.href = '/dashboard/';
		} else {
			console.error("OAuth callback error:", data);
			// window.location.href = '/login/';
			throw new Error(error);
			// router.navigateTo('/login/');
		}
		// Process the authorization code (e.g., exchange it for an access token)
	} else {
		console.warn("No code or error received in OAuth callback");
		throw new Error(error);
		// Handle the case where no code or error is present
	}
}

function oauth_error() {
	// show some sort of error page to the user
	// Response.redirect('/login/');
}
