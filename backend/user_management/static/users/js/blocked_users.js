export function fetchBlockedRelationshipsUser() {
	fetch(`/users/api/blocked-users/`)
		.then(response => response.json())
		.then(data => {
			console.log(data);
		});
}

export function blockUser(username) {
	fetch(`/users/api/block/${username}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken')
		},
	})
		.then(response => response.json())
		.then(data => {
			console.log(data);
		});
}

export function unblockUser(username) {
	fetch(`/users/api/unblock/${username}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken')
		},
	})
		.then(response => response.json())
		.then(data => {
			console.log(data);
		});
}