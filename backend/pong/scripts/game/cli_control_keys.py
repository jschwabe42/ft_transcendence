from argparse import ArgumentParser
import requests

def update_score(api_url, token, username, control1, control2, game_id):
	print('Test')

	headers = {
		'Content-Type': 'application/json',
		'Authorization': 'Token ' + token,
	}
	data = {
		'username': username,
		'control1': control1,
		'control2': control2,
		'game_id': game_id,
	}

	try:
		response = requests.post(api_url, json=data, headers=headers)
		if response.status_code == 200:
			print('Game created successfully!')
		else:
			try:
				json_response = response.json()
				print("Respuesta JSON:", json_response)
				error_message = json_response.get('error', json_response.get('detail', 'Something went wrong.'))
				print(f'Error: {error_message}')
			except ValueError:
				# If parsing fails, print the raw text.
				print("Error: No se pudo parsear la respuesta como JSON.")
				print("Contenido de la respuesta:", response.text)
	except requests.exceptions.RequestException as e:
		print(f'Failed to connect to the API: {e}')

def main():
	parser = ArgumentParser(description='CLI tool to create a game using the CreateGame API.')
	parser.add_argument(
		'--url',
		required=True,
		help='The API endpoint URL (e.g., http://localhost:8000/pong/api/get-gameControl/).'
	)
	parser.add_argument('--token', required=True, help='Your API authentication token.')
	parser.add_argument('--username', required=True, help='user to change the control')
	parser.add_argument('--control1', required=True, help='control of player1')
	parser.add_argument('--control2', required=True, help='control of player2')
	parser.add_argument('--game_id', required=True, help='game_id')

	args = parser.parse_args()

	update_score(args.url, args.token, args.username.strip(), args.control1, args.control2, args.game_id)

if __name__ == '__main__':
	main()

# python3 cli_control_keys.py --url http://localhost:8000/pong/api/get-gameControl/ --token your_token --username Jsanger --control1 w_s --control2 w_s make--game_id id
