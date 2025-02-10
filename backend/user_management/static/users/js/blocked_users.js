export function fetchBlockedRelationships() {
	fetch(`/users/api/blocked/`)
		.then(response => response.json())
		.then(data => {
			console.log(data);
		});
}

export function fetchBlockedRelationshipsUser() {
	fetch(`/users/api/blocked-users/`)
		.then(response => response.json())
		.then(data => {
			console.log(data);
		});
}