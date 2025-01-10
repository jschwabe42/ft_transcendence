import argparse
import requests


def update_score(api_url, csrfToken, score1, score2, game_id):
	# print(score1)
	# print(score2)
	# print(game_id)
	if (score1 > 10 or score2 > 10):
		print("10 is the max score")
		return

	headers = {
		"Content-Type": "application/json",
		'X-CSRFToken': csrfToken,
	}
	data = {
		"score1": score1,
		"score2": score2,
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
	parser.add_argument("--url", required=True, help="The API endpoint URL (e.g., http://localhost:8000/game/api/get-score/).")
	parser.add_argument("--token", required=True, help="Your API authentication token.")
	parser.add_argument("--score_player1", required=True, help="score of player1")
	parser.add_argument("--score_player2", required=True, help="score of player2")
	parser.add_argument("--game_id", required=True, help="game_id")

	args = parser.parse_args()

	update_score(args.url, args.token, args.score_player1, args.score_player2, args.game_id)


if __name__ == "__main__":
	main()

# python3 cli_update_score.py --url http://localhost:8000/game/api/get-score/ \
#                           --token your_token \
#                           --score_player1 5 \
#                           --score_player2 8 \
#                           --game_id id
