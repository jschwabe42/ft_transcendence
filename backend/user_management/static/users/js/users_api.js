/**
 * endpoints nested in `/users/api/`
 * handles endpoints:
 *
 * `blocked/`, `block/:username/`, `unblock/:username/`
 */
export function UsersApiHandler(match) {
	const path = match[1];
	const endpoint = match[2];
	if (path === 'blocked' && endpoint === "") {
		fetch(`/users/api/blocked/`)
	} else if (endpoint !== undefined) {
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
			case 'unblock':
				fetch(`/users/api/unblock/${username = endpoint}`, {
					method: 'POST',
					headers: blockDefaultHeaders(),
				})
			default:
				return;
		}
	}
}