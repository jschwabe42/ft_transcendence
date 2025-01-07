document.addEventListener('DOMContentLoaded', function() {
	const appContent = document.getElementById('quiz-app-content');
	appContent.innerHTML = `
		<div>
			<h2> Create a new room</h2>
			<button id="show-create-room-form" class="btn btn-primary">Create Room</button>
			<div id="create-room-form-con" class="mt-3" style="display: none;">
				<form id="create-room-form">
					<div class="mb-3">
						<label for="roomName" class="form-label">Room Name</label>
						<input type="text" id="roomName" name="room_name" class="form-control" placeholder="Enter room name" required>
					</div>
					<button type="submit" class="btn btn-success">Submit</button>
				</form>
			</div>
			<div id="create-room-feedback" class="mt-3"></div>
		</div>
		`;

		const showFormBtn = document.getElementById('show-create-room-form');
		const formContainer = document.getElementById('create-room-form-con');
		showFormBtn.addEventListener('click', function () {
			formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
		});

		const createRoomForm = document.getElementById('create-room-form');
		const feedbackDiv = document.getElementById('create-room-feedback');
		createRoomForm.addEventListener('submit', function (event) {
			event.preventDefault();

		const roomName = createRoomForm.room_name.value;

		feedbackDiv.innerHTML = '';

		// const createRoomUrl = "{% url 'quiz:create_room' %}";  // Generate URL using Django's {% url %} tag
		// console.log(createRoomUrl);

		const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

		fetch('/quiz/create_room/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': csrfToken
			},
			body: `room_name=${encodeURIComponent(roomName)}`
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				feedbackDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
				createRoomForm.reset(); // Reset form on success
			} else {
				feedbackDiv.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
			}
		})
		.catch(error => {
			feedbackDiv.innerHTML = `<div class="alert alert-danger">An error occurred: ${error}</div>`;
		});
		});
});