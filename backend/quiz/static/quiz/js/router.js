import { loadRoomList } from './room_list.js';

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
			this.showNotFound();
		}
	}

	showNotFound() {
		document.getElementById('quiz-app-content').innerHTML = '<h2>Page not found!</h2>';
	}
}

const router = new Router();

router.addRoute('/quiz/', loadRoomList);
router.handleRouteChange();
