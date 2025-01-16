import { loadRoomList } from './room_list.js';
import { displayRoom } from './room_display.js';

class Router {
	constructor() {
		this.routes = {};
		this.currentPath = window.location.pathname;
	}

	addRoute(path, handler) {
		console.log("Adding route: ", path);
		this.routes[path] = handler;
	}

	navigateTo(path) {
		window.history.pushState({}, '', path);
		this.handleRouteChange();
	}

	handleRouteChange() {
		console.log(window.location.pathname);  // Log the current pathname

		const path = window.location.pathname;
		const handler = this.routes[path];
		if (handler) {
			handler();
		} else {
			// this.showNotFound();
			this.handleDynamicRoute(path);
		}
	}

	handleDynamicRoute(path) {
		const quizPathRegex = /^\/quiz\/([^\/]+)\/?$/;
		const match = path.match(quizPathRegex);
		if (match) {
			const roomName = match[1];
			displayRoom(roomName);
		} else {
			this.showNotFound();
		}
	}

	showNotFound() {
		document.getElementById('quiz-app-content').innerHTML = '<h2>Page not found!</h2>';
	}
}

const router = new Router();

/**
 * The main view of the quiz app
 */
router.addRoute('/quiz/', loadRoomList);

router.handleRouteChange();
export default router;