import router from '/static/js/router.js';

export function loadDashboard() {
	const dashboardAppContent = document.getElementById('dashboard-app-content');
	dashboardAppContent.innerHTML = `
	<p>Dashboard</p>
	`;
}
