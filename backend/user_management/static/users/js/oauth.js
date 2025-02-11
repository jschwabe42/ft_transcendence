export async function oauth_flow() {
	const response = await fetch(`/users/oauth/`, {
		method: "POST",
		headers: {
			'Content-Type': "application/json",
			'X-CSRFToken': localStorage.getItem('csrftoken'),
		},
	});

	console.log(response);
	const data = await response.json();
	console.log(data);
	if (response.ok) {
		window.location.href = data.location;
	} else {
		console.error("Error during OAuth authorization");
	}
}