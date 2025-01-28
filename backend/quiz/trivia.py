import requests
import json
import html
import os
from .models import Room, Participant, RoomSettings, Answer

def get_trivia_questions(settings):
	url = f"https://opentdb.com/api.php?amount={settings.question_count}"

	if settings.difficulty != 'any':
		url += f"&difficulty={settings.difficulty}"

	if settings.category != 0:
		url += f"&category={settings.category}"

	print(f"URL: {url}", flush=True)

	response = requests.get(url)

	if response.status_code == 200:
		data = response.json()
		for question in data['results']:
			question['question'] = html.unescape(question['question'])
			question['correct_answer'] = html.unescape(question['correct_answer'])
			question['incorrect_answers'] = [html.unescape(ans) for ans in question['incorrect_answers']]
		return data['results']
	else:
		print(f"Failed to retrieve data: {response.status_code}", flush=True)
		return None