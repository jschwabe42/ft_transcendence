<h1 align="center">
	<p>Transcendence</p>
</h1>
<h2 align="center">
	<p>A modern Webapp</p>
</h2>

>## <p align="center"> <sup>A team project created by: [Jonas](https://github.com/Jonstep101010),  [Jan](https://github.com/Jano844),  [Alex](https://github.com/aceauses),  [Moe](https://github.com/mben-has),  and me.</sup>
</p>

<p align="center">
Created using
	<a href="https://skillicons.dev">
		<img src="https://skillicons.dev/icons?i=docker" />
		<img src="https://skillicons.dev/icons?i=python" />
		<img src="https://skillicons.dev/icons?i=html" />
		<img src="https://skillicons.dev/icons?i=css" />
		<img src="https://skillicons.dev/icons?i=js" />
		<img src="https://skillicons.dev/icons?i=django" />
		<img src="https://skillicons.dev/icons?i=postgres" />
	</a>
</p>

---

## The project:
- Creating a modern webapp allowing a user to play Pong with other people.
- The entire website must be a single-page application.
- Must be compatible with the latest stable version of at least Mozilla Firefox.
- The website must run using Docker and must be launchable via a single command line.
- Further modules may be used to enhance the project.

## The modules:
### Basics:
- The entire page (bar changing the language) is a single-page application with working Back and Forward buttons.
- The website is compatible with at least Firefox and Chromium based browsers.
- Sensitive data stored inside the database is hashed for security.
- The website is protected agains SQL injections.
- HTTPS and WSS are used for secure connections.
- A pong game is implemented.

### Technical:
- Django is used as a backend framework.
- For the frontend bootstrap toolkit is used for design.
- PostgresSQL is used as the backends database.

### User Management:
- A user can created an account and securely log in/out.
- Users can update their profile data, such as email, username, password and profile picture.
- Other users can be added as friends and be blocked if necessary.
- Each users profile is visible and shows some details as well as game statistics for the pong and quiz game.
- Users can log in using remote authentication using their 42 account.
- Two-Factor Authentication can be used to secure ones account.
- JSON Web Tokens are used for security.

### Pong:
- Two players on the same device can play against each other in a practice mode, one using the arrow keys and another W and S.
- Players can play against each other remotely with the pong game being processed server side.
- A tournament can be created, pitting players against each other in a tournament tree until only the winner remains.

### Quiz:
- A player can create a game room in the quiz app which other users can join.
- The room leader can change settings such as the amount of questions, the time per question or the topic of the quiz.
- Players are scored on correct answers as well as their time to answer.
- Each user can view theirs and other users win statistics as well as question statistics in the user dashboard.

### Other:
- In addition to English, German and Swedish language options have been implemented.
- User are automatically brought to their locale, unless they change the websites language, which can easily be done in the navigation bar.
- Other languages can easily be added if necessary thanks to Django's locale options.

## Installation and Usage:
1. Close the repository and enter it:
```shell
git clone https://github.com/itseugen/ft_transcendence
cd ft_transcendence
```
2. Get the environment variables:
```shell
make genenv
```
Enter passwords and the data you want to use

3. Start the containers and visit the website:
```shell
make
```
```
https://127.0.0.1:8000/
```

## Enhancements:
The project could easily be enhanced if desired. It was not done, as it would be outside the scope of the project and the current website fulfills all requirements to reach a full score. <br>
Features to add could be:
- A Chat-App for not only DMs but also groups, with Game and Tournament invites.
- More statistics and game customisation options.
- An Online status for each user.
- And many more...

---
<sub><sup>This project is part of my studies at 42 Heilbronn</sup></sub>