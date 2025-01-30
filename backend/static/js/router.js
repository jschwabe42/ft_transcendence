import { loadRoomList } from '/static/quiz/js/room_list.js';
import { displayRoom, leaveRoom } from '/static/quiz/js/room_display.js';
import { clear_containers, home_view } from '/static/js/navbar.js';

class Router {
	constructor() {
		this.routes = {};
		this.currentPath = window.location.pathname;
		window.addEventListener('popstate', () => this.handleRouteChange());
	}

	addRoute(path, handler) {
		console.log("Adding route: ", path);
		this.routes[path] = handler;
	}

	// ! ALWAYS use this function to navigate to a new page, it ensures that the router is used and cleanup is done correctly!
	navigateTo(path) {
		this.beforeRouteChange(path);
		window.history.pushState({}, '', path);
		this.handleRouteChange();
	}

	// This function is called when the URL changes, clears all containers!
	handleRouteChange() {
		console.log("Handling route change");
		console.log(window.location.pathname);

		const path = window.location.pathname;
		const handler = this.routes[path];
		clear_containers();
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
		document.getElementById('error-content').innerHTML = '<h2>Page not found!</h2>';
	}

	// ! This function is not used. If for some reason we want to use href WITHOUT an event listener (please don't), this
	//! function can be modified to USE navigateTo instead of handleRouteChange and then href would work.
	// Makes sure hrefs are handled via Router, also adds history so arrow keys work
	// interceptLinks() {
	// 	document.addEventListener('click', (event) => {
	// 		const target = event.target.closest('a');
	// 		if (target && target.href && target.origin === window.location.origin) {
	// 			event.preventDefault();
	// 			const path = target.pathname;
	// 			history.pushState(null, '', path);
	// 			// this.navigateTo(target.pathname);
	// 			this.handleRouteChange();
	// 		}
	// 	});
	// }

	beforeRouteChange(newPath) {
		const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
		if (currentRoom) {
			const currentRoomPath = `/quiz/${currentRoom.room_name}/`;
			if (newPath !== currentRoomPath) {
				leaveRoom(currentRoom.room_id);
			}
		}
	}
}

const router = new Router();

/**
 * The main view of the quiz app
 */
router.addRoute('/quiz/', loadRoomList);

/**
 * The Homepage
 */
router.addRoute('/', home_view);

router.handleRouteChange();
export default router;