
document.getElementById("up_down").addEventListener("click", async function(event) {
	console.log("Access API");
	event.preventDefault(); 
	const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

	try {
		const response = await fetch('/game/api/get-gameControl/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrfToken,
			},
			body: JSON.stringify({
				'game_id': game_id,
				'control1': 'up down',
				'control2': 'up down',
			}),
		});
		if (response.ok) {
			const data = await response.json();
			console.log('Response data:', data);
		} else {
			const errorText = await response.text();
			console.error('Error message:', errorText);
		}
	} catch (error) {
		console.error('Request failed:', error);
	}
});

document.getElementById("ws").addEventListener("click", async function(event) {
	console.log("Access API");
	event.preventDefault(); 
	const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

	try {
		const response = await fetch('/game/api/get-gameControl/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrfToken,
			},
			body: JSON.stringify({
				'game_id': game_id,
				'control1': 'w_s',
				'control2': 'w_s',
			}),
		});
		if (response.ok) {
			const data = await response.json();
			console.log('Response data:', data);
		} else {
			const errorText = await response.text();
			console.error('Error message:', errorText);
		}
	} catch (error) {
		console.error('Request failed:', error);
	}
});
