

export function CreateTournement(event, socket) {
	event.preventDefault();
	const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
	const userName = document.getElementById('username').getAttribute('data-username');

	console.log("Create Tournemet")

	fetch('/game/api/create-tournement/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify({username: userName }),
	})
	.then(response => response.json())
	.then(data => {
		if (data.tournement_id) {
			console.log("Created tournement", data.tournement_id);
			const touenement_data = {
				message: "create_tournement",
				host: userName,
				tournement_id: data.tournement_id,
			};
			socket.send(JSON.stringify(touenement_data));
			console.log("sended tournement info")
		} else {
			console.error("Createing tournement failed");
		}
	})
	.catch(error => {
		console.error('Error with API', error);
	});
}
