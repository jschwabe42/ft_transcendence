const OnlineStatusWebSocket = new WebSocket('ws://' + window.location.host + '/ws/online-status/');

OnlineStatusWebSocket.onopen = function (e) {
	console.log('WebSocket opened', e);
	start_alive_interval();
};

OnlineStatusWebSocket.onclose = function (e) {
	console.log('WebSocket closed', e);
	kill_alive_interval();
};

OnlineStatusWebSocket.onerror = function (e) {
	console.error('WebSocket error', e);
	kill_alive_interval();
};

OnlineStatusWebSocket.onmessage = function (e) {
	// Handle messages from the server @follow-up
	console.log('WebSocket message received', e);
};

let alive_interval;

function start_alive_interval() {
	// @audit is this actually working?
	alive_interval = setInterval(function () {
		if (OnlineStatusWebSocket.readyState == WebSocket.OPEN) {
			OnlineStatusWebSocket.send(JSON.stringify({
				type: 'ping'
			}, 1000));
		}
	});
}

function kill_alive_interval() {
	clearInterval(alive_interval);
}
