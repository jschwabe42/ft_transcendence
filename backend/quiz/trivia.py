import requests
import json
import html
import os

def get_trivia_questions(amount):
	url = f"https://opentdb.com/api.php?amount={amount}"
	response = requests.get(url)

	if response.status_code == 200:
		data = response.json()
		for question in data['results']:
			question['question'] = html.unescape(question['question'])
			question['correct_answer'] = html.unescape(question['correct_answer'])
			question['incorrect_answers'] = [html.unescape(ans) for ans in question['incorrect_answers']]
		return data['results']
	else:
		print(f"Failed to retrieve data: {response.status_code}")
		return None

def store_trivia_questions(filename, amount):
	questions = get_trivia_questions(amount)
	if questions:
		with open(filename, 'w') as file:
			json.dump(questions, file, indent=4)
	else:
		print("No questions to store")

def load_trivia_questions(filename):
	if os.path.exists(filename):
		with open(filename, 'r') as file:
			questions = json.load(file)
		return questions
	else:
		print(f"{filename} does not exist")
		return None
