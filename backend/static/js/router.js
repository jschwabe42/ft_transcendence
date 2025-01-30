import { loadRoomList } from '/static/quiz/js/room_list.js';
import { displayRoom } from '/static/quiz/js/room_display.js';
import { clear_containers } from '/static/js/navbar.js';

class Router {
	constructor() {
		this.routes = {};
		this.currentPath = window.location.pathname;
		window.addEventListener('popstate', () => this.handleRouteChange());
		this.interceptLinks();
	}

	addRoute(path, handler) {
		console.log("Adding route: ", path);
		this.routes[path] = handler;
	}

	navigateTo(path) {
		window.history.pushState({}, '', path);
		this.handleRouteChange();
	}

	// This function is called when the URL changes, clears all containers!
	handleRouteChange() {
		console.log("Handling route change");
		console.log(window.location.pathname);

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
		clear_containers();
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

	// Makes sure hrefs are handled via Router, also adds history so arrow keys work
	interceptLinks() {
		document.addEventListener('click', (event) => {
			const target = event.target.closest('a');
			if (target && target.href && target.origin === window.location.origin) {
				event.preventDefault();
				const path = target.pathname;
				history.pushState(null, '', path);
				// this.navigateTo(target.pathname);
				this.handleRouteChange();
			}
		});
	}
}

const router = new Router();

/**
 * The main view of the quiz app
 */
router.addRoute('/quiz/', loadRoomList);

router.addRoute('/', clear_containers);

router.handleRouteChange();
export default router;