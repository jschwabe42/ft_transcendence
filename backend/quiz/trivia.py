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
