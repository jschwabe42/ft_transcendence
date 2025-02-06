

export function CreateTournament(event, socket) {
	event.preventDefault();
	const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
	const userName = document.getElementById('username').getAttribute('data-username');

	console.log("Create Tournemet")

	fetch('/pong/api/create-tournament/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify({ username: userName }),
	})
		.then(response => response.json())
		.then(data => {
			if (data.tournament_id) {
				console.log("Created tournament", data.tournament_id);
				const touenement_data = {
					message: "create_tournament",
					host: userName,
					tournament_id: data.tournament_id,
				};
				socket.send(JSON.stringify(touenement_data));
				console.log("sended tournament info")
			} else {
				console.error("Createing tournament failed");
			}
		})
		.catch(error => {
			console.error('Error with API', error);
		});
}
