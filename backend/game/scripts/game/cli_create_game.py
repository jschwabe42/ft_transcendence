import argparse
import requests


## Try to get the csrf_token but how?
# from django.test import RequestFactory
# from django.middleware.csrf import get_token
# from django.contrib.auth.models import User

# request = RequestFactory().get('/some-url/')
# csrf_token = get_token(request)

def create_game(api_url, csrfToken, username, opponent):

	headers = {
		"Content-Type": "application/json",
		'X-CSRFToken': csrfToken,
	}
	data = {
		"username": username,
		"opponent": opponent,
	}

	try:
		response = requests.post(api_url, json=data, headers=headers)
		if response.status_code == 201:
			print("Game created successfully!")
			print(f"Game ID: {response.json().get('game_id')}")
		else:
			error_message = response.json().get('error', 'Something went wrong.')
			print(f"Error: {error_message}")
	except requests.exceptions.RequestException as e:
		print(f"Failed to connect to the API: {e}")


def main():
	parser = argparse.ArgumentParser(description="CLI tool to create a game using the CreateGame API.")
	parser.add_argument("--url", required=True, help="The API endpoint URL (e.g., http://localhost:8000/game/api/create-game/).")
	parser.add_argument("--token", required=True, help="Your API authentication token.")
	parser.add_argument("--username", required=True, help="Your username.")
	parser.add_argument("--opponent", required=True, help="The opponent's username.")

	args = parser.parse_args()

	create_game(args.url, args.token, args.username, args.opponent)


if __name__ == "__main__":
	main()

#how to get this fucking Token?

# python3 pong_start.py --url http://localhost:8000/game/api/create-game/ \
#                           --token your_token \
#                           --username Jsanger \
#                           --opponent NewUser
