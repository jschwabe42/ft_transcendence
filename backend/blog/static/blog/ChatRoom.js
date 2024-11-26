
// Wenn Butten eines Chats gedrueckt wird, groupName ist die variabele des namens, welcher weitergegeben Wurde
document.querySelectorAll('#Info_Button').forEach(button => {
	button.addEventListener('click', function() {
		console.log("Info Button Pressed")

		const contentSection = document.querySelector('.content-section');
		if (contentSection.style.display === 'none') {
			contentSection.style.display = 'block';
		} else {
			contentSection.style.display = 'none';
		}
	});
});


document.querySelectorAll('#New_Chat').forEach(button => {
	button.addEventListener('click', function() {
		console.log("New Group Button Pressed")

		const contentSection = document.querySelector('.content-section');
		if (contentSection.style.display === 'none') {
			contentSection.style.display = 'block';
		} else {
			contentSection.style.display = 'none';
		}
	});
});



// document.querySelector('#Info_Button').addEventListener('click', function() {
// 	let currentUrl = window.location.href;
// 	let newUrl = currentUrl + "add/";  // Füge den Parameter hinzu

// 	// Navigiere zur neuen URL
// 	window.location.href = newUrl;
// })

