let profileWebsocket;

/**
 * gets called upon displaying the public profile of a user
 * updates if there is a status change
 * 
 */
function initProfileWebsocket(username) {
	profileWebsocket = new WebSocket(`ws://${window.location.host}/ws/user/${username}/`);

	profileWebsocket.onopen = function () {
		console.log('Connected to profile websocket for:', username);
	};

	profileWebsocket.onmessage = function (event) {
		const socket_data = JSON.parse(event.data);
		if (socket_data.type !== 'countdown_update')
			console.log('Received message:', socket_data);
		if (socket_data.type === 'update_online_status') {
			console.log('Received online status update:', socket_data);
			// @follow-up update online status
		}
	};
	profileWebsocket.onclose = function () {
		console.log('Profile connection closed for:', username);
	};

	profileWebsocket.onerror = function (error) {
		console.error('Profile WebSocket error:', error);
		console.error('Profile WebSocket error for:', username);
	};
}