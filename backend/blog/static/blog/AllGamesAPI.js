document.getElementById("create-game-form").addEventListener("submit", async function(event) {
	console.log("Access API");
	event.preventDefault();
	const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
	const oppName = document.getElementById("opp_name").value;
	const response = await fetch('/game/api/create-game/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify({ opponent: oppName }),
	});;
	const data = await response.json();
	if (response.ok) {
		window.location.href = '/game/new/' + data.game_id + '/'; // redirect to game
	} else {
		console.error('Request failed with status:', response.status);
		const errorText = await response.text();
		console.error('Error message:', errorText);
	}
});
