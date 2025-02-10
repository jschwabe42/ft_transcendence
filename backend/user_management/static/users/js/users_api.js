/**
 * endpoints nested in `/users/api/`
 * handles endpoints:
 *
 * `blocked-users/`, `block/:username/`, `unblock/:username/`
 */
export function UsersApiHandler(match) {
	const path = match[1];
	const endpoint = match[2];
	if (endpoint === '') {
		if (path === 'blocked-users')
			fetch(`/users/api/blocked-users/`)
				.then(response => response.json())
		else
			Response.error('Invalid endpoint:', endpoint);
	} else {
		function blockDefaultHeaders() {
			return {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken')
			};
		}
		switch (path) {
			case 'block':
				fetch(`/users/api/block/${username = endpoint}`, {
					method: 'POST',
					headers: blockDefaultHeaders(),
				})
				break;
			case 'unblock':
				fetch(`/users/api/unblock/${username = endpoint}`, {
					method: 'POST',
					headers: blockDefaultHeaders(),
				})
					.then(response => response.json());
				break;
			default:
				Response.error('Invalid path:', path);
		}
	}
}