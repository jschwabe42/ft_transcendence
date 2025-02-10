export function fetchBlockedRelationships() {
	fetch(`/users/api/blocked/`)
		.then(response => response.json())
		.then(data => {
			console.log(data);
		});
}