import { loadRoomList, joinRoom, closeRoomListWebSocket } from '/static/quiz/js/room_list.js';
import { displayRoom, leaveRoom } from '/static/quiz/js/room_display.js';
import { clear_containers, home_view } from '/static/js/navbar.js';
import { loadDashboard } from '/static/dashboard/js/dashboard.js';
import { loadProfile } from '/static/dashboard/js/profile.js';
import { register_user } from '/static/users/js/register.js';
import { login_user } from '/static/users/js/login.js';
import { logout_user } from '/static/users/js/logout.js';

class Router {
	constructor() {
		this.routes = {};
		this.currentPath = window.location.pathname;
		window.addEventListener('popstate', () => {
			this.beforeRouteChange(window.location.pathname);
			this.handleRouteChange();
		});
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
		const dashboardPathRegex = /^\/dashboard\/([^\/]+)\/?$/;
		
		let match = path.match(quizPathRegex);
		if (match) {
			const roomName = match[1];
			const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
			if (currentRoom && currentRoom.room_name === roomName) {
				displayRoom(roomName);
			} else {
				this.navigateTo('/quiz/');
			}
			return;
		}

		match = path.match(dashboardPathRegex);
		if (match) {
			const username = match[1];
			loadProfile(username);
			return;
		}
		this.showNotFound();
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
		console.log("Current room: ", currentRoom);
		if (currentRoom) {
			const currentRoomPath = `/quiz/${currentRoom.room_name}/`;
			if (newPath !== currentRoomPath) {
				leaveRoom(currentRoom.room_id);
				// ! Theoretically wrong, however during testing it is possible to leave a room without removing the local storage
				localStorage.removeItem('currentRoom');
			}
		}
		if (newPath !== '/quiz/') {
			closeRoomListWebSocket();
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

/**
 * The Dashboard app view
 */
router.addRoute('/dashboard/', loadDashboard);

/**
 * The register user view
 */
router.addRoute('/register/', register_user);

/**
 * The login user view
 */
router.addRoute('/login/', login_user);

/**
 * THe logout user view
 */
router.addRoute('/logout/', logout_user);

router.handleRouteChange();
export default router;