import argparse
import requests


def update_score(api_url, csrfToken, username, contol1, contol2, game_id):

	print("Test")

	headers = {
		"Content-Type": "application/json",
		'X-CSRFToken': csrfToken,
	}
	data = {
		"username": username,
		"control1": contol1,
		"control2": contol2,
		"game_id": game_id,
	}

	try:
		response = requests.post(api_url, json=data, headers=headers)
		if response.status_code == 200:
			print("Game created successfully!")
			# print(f"Game ID: {response.json().get('game_id')}")
		else:
			error_message = response.json().get('error', 'Something went wrong.')
			print(f"Error: {error_message}")
	except requests.exceptions.RequestException as e:
		print(f"Failed to connect to the API: {e}")


def main():
	parser = argparse.ArgumentParser(description="CLI tool to create a game using the CreateGame API.")
	parser.add_argument("--url", required=True, help="The API endpoint URL (e.g., http://localhost:8000/game/api/get-gameControl/).")
	parser.add_argument("--token", required=True, help="Your API authentication token.")
	parser.add_argument("--username", required=True, help="user to change the controll")
	parser.add_argument("--control1", required=True, help="score of player1")
	parser.add_argument("--control2", required=True, help="score of player2")
	parser.add_argument("--game_id", required=True, help="game_id")

	args = parser.parse_args()

	update_score(args.url, args.token, args.username, args.control1, args.control2, args.game_id)


if __name__ == "__main__":
	main()

# python3 cli_control_keys.py --url http://localhost:8000/game/api/get-gameControl/ \
#                           --token your_token \
#                           --username Jsanger \
#                           --control1 w_s \
#                           --control2 w_s \
#                           --game_id id