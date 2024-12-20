import random
from .models import Room
from .trivia import get_trivia_questions

def initialize_room(room):
	if not room.questions:
		room.questions = get_trivia_questions(amount=10)
		room.save()
	current_question = room.questions[0] if room.questions else None
	if current_question and not room.current_question:
		answers = current_question['incorrect_answers'] + [current_question['correct_answer']]
		random.shuffle(answers)
		room.current_question = current_question
		room.shuffled_answers = answers
		room.save()
	return room

def submit_answer(room, user, answer):
	if not hasattr(room, 'answers'):
		room.answers = {}
	room.answers[user.username] = answer
	room.save()
	return room