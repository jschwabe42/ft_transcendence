/**
 * endpoints nested in `/users/api/`
 * handles endpoints `blocked-users/`, `block/:username/`, `unblock/:username/`
 */

import { blockUser, unblockUser, fetchBlockedRelationshipsUser } from "blocked_users.js";

// const blockedUsersPathRegex = /^\/users\/api\/block\/([^\/]+)\/?$/;
// const unblockedUsersPathRegex = /^\/users\/api\/unblock\/([^\/]+)\/?$/;

export function UsersApiHandler(match) {
	const path = match[1];
	const endpoint = match[2];
	if (endpoint === '') {
		if (path === 'blocked-users')
			fetchBlockedRelationshipsUser();
		else
			console.error('Invalid endpoint:', endpoint);
	} else {
		switch (path) {
			case 'block':
				blockUser(endpoint);
				break;
			case 'unblock':
				unblockUser(endpoint);
				break;
			default:
				console.error('Invalid path:', path);
		}
	}
}