import { loadRoomList, joinRoom, closeRoomListWebSocket } from '/static/quiz/js/room_list.js';
import { displayRoom, leaveRoom } from '/static/quiz/js/room_display.js';
import { clear_containers, home_view } from '/static/js/navbar.js';
import { loadDashboard } from '/static/dashboard/js/dashboard.js';
import { loadProfile } from '/static/dashboard/js/profile.js';
import { register_user } from '/static/users/js/register.js';
import { login_user } from '/static/users/js/login.js';
import { logout_user } from '/static/users/js/logout.js';
import { display_account } from '/static/users/js/account.js';
import { UsersApiHandler } from '/static/users/js/users_api.js';

import { PongOverview, closeRoomOverviewWebSocket } from '/static/pong/js/overview.js';
import { DisplayPong, closePongInGameWebSocket, removeKeyEventListener } from '/static/pong/js/pong_display_ingame.js';
import { PongResult } from '/static/pong/js/pong_result.js';
import { DisplayTournament, closeTournamentWebSocket } from '/static/pong/js/tournament_display.js';
import { PongPractice } from '/static/pong/js/pong_practice.js';
import { oauth_flow, oauth_callback } from '/static/users/js/oauth.js';


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

	showNotFound() {
		clear_containers();
		document.getElementById('error-content').innerHTML = `
		<h2>${gettext("Page not found!")}</h2>
		<p>${gettext("Please ensure the current URL is correct.")}</p>`;
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
		const pongPathRegex = /^\/pong\/([^\/]+)\/?$/;
		const pongDetailsPathRegex = /^\/pong\/game-details\/([^\/]+)\/?$/;
		const tournamentPathRegex = /^\/pong\/tournament\/([^\/]+)\/?$/;
		const usersApiPathRegex = /^\/users\/api\/(.*)$/;
		const oauthCallbackRegex = /^\/users\/oauth-callback\/?(\?(.*))?$/;
		const oauthAuthorizeRegex = /^\/users\/oauth\/?$/;
		let match = path.match(oauthAuthorizeRegex);
		if (match) {
			console.warn("OAuth authorize: ", match);
			oauth_flow();
			return;
		}

		match = path.match(oauthCallbackRegex);
		if (match) {
			oauth_callback();
			return;
		}

		match = path.match(quizPathRegex);
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
		match = path.match(pongPathRegex);
		if (match) {
			const gameId = match[1];
			DisplayPong({ game_id: gameId });
			return;
		}

		match = path.match(pongDetailsPathRegex);
		if (match) {
			const gameId = match[1];
			PongResult({ game_id: gameId });
			return;
		}

		match = path.match(tournamentPathRegex);
		if (match) {
			const tournamentId = match[1];
			DisplayTournament({ tournament_id: tournamentId });
			return;
		}

		match = path.match(usersApiPathRegex);
		if (match) {
			try {
				UsersApiHandler(match);
				return;
			} catch (error) { }
		}

		this.showNotFound();
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
		if (newPath !== '/pong/') {
			closeRoomOverviewWebSocket();
		}

		const pongPathPattern = /^\/pong\/\d+$/;
		if (!pongPathPattern.test(newPath)) {
			removeKeyEventListener();
			closePongInGameWebSocket();
		}
		
		const tournamentPathPattern = /^\/pong\/tournament\/\d+$/;
		if (!tournamentPathPattern.test(newPath)) {
			closeTournamentWebSocket();
		}
	}
}

const router = new Router();

/**
 * The main view of the quiz app
 */
router.addRoute('/quiz/', loadRoomList);

/**
 * The main view of the pong app
 */
router.addRoute('/pong/', PongOverview);

/**
 * Pong Practice
 */
router.addRoute('/pong/practice/', PongPractice);

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

/**
 * The account view
 */
router.addRoute('/account/', display_account);

router.handleRouteChange();
export default router;
