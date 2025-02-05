import random
import time

# from .views import countdown
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.timezone import now

from .models import Answer, Participant, Room


def game_logic(room_id):
	"""
	Implements the game logic for the quiz game.
	"""
	room = Room.objects.get(id=room_id)

	countdown(3, room_id)

	for i in range(room.settings.question_count):
		room.current_question = room.questions[i]

		incorrect_answers = room.questions[i]['incorrect_answers']
		correct_answer = room.questions[i]['correct_answer']

		if set(incorrect_answers + [correct_answer]) == {'True', 'False'}:
			room.shuffled_answers = ['True', 'False']
		else:
			room.shuffled_answers = random.sample(
				incorrect_answers + [correct_answer], len(incorrect_answers) + 1
			)

		room.question_start = now()
		room.save()
		# print(f"Current Question: {room.current_question}", flush=True)
		send_question(room_id, room.current_question['question'], room.shuffled_answers)
		countdown_question_time(room.settings.time_per_question, room_id)
		# countdown(5, room_id)
		collect_answers(room_id, room.current_question['question'])
		solve_question(
			room_id,
			room.current_question['question'],
			room.shuffled_answers,
			room.current_question['correct_answer'],
		)
		process_answers(room_id, room.current_question['question'])
		countdown(5, room_id)
		clear_question(room_id)
		delete_answers(room_id)
	end_game(room_id)
	reset_scores(room_id)


def countdown(countdown_time, room_id):
	"""
	Countdown timer for the game.
	"""
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f'room_{room_id}', {'type': 'countdown_start', 'data': {'time': countdown_time}}
	)

	for i in range(countdown_time - 1, 0, -1):
		time.sleep(1)
		async_to_sync(channel_layer.group_send)(
			f'room_{room_id}', {'type': 'countdown_update', 'data': {'time': i}}
		)

	time.sleep(1)
	async_to_sync(channel_layer.group_send)(
		f'room_{room_id}', {'type': 'countdown_end', 'data': {'time': 0}}
	)


def collect_answers(room_id, question):
	"""
	Collects answers from all participants in the room.
	"""
	room = get_object_or_404(Room, id=room_id)
	participants = Participant.objects.filter(room=room)

	max_points = 1000
	min_points = 500

	for participant in participants:
		answer = Answer.objects.filter(
			room=room, participant=participant, question=question
		).first()
		if answer:
			if (
				answer.answered_at
				<= room.question_start + timezone.timedelta(seconds=room.settings.time_per_question)
				and answer.answered_at >= room.question_start
			):
				answer.is_disqualified = False
				if answer.answer_given == room.current_question['correct_answer']:
					time_diff = (answer.answered_at - room.question_start).total_seconds()
					score = max_points - (
						(max_points - min_points) * (time_diff / room.settings.time_per_question)
					)
					participant.score += int(score)
					participant.score_difference = int(score)
				else:
					participant.score_difference = 0
			else:
				answer.is_disqualified = True
				participant.score -= 100
				participant.score_difference = -100
			answer.save()
			participant.save()
		else:
			Answer.objects.create(
				room=room,
				participant=participant,
				answer_given=None,
				question=question,
				is_disqualified=True,
			)
			participant.score -= 100
			participant.score_difference = -100
			participant.save()


def send_question(room_id, question, answers):
	"""
	Sends the question and answers to the participants in the room.
	"""
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f'room_{room_id}',
		{'type': 'new_question', 'data': {'question': question, 'answers': answers}},
	)


def solve_question(room_id, question, answers, correct_answer):
	"""
	Sends the correct answer to the clients
	"""
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f'room_{room_id}',
		{
			'type': 'solve_question',
			'data': {
				'question': question,
				'answers': answers,
				'correct_answer': correct_answer,
			},
		},
	)


def clear_question(room_id):
	"""
	Clears the current question from the client.
	"""
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f'room_{room_id}', {'type': 'clear_question', 'data': {}}
	)


def end_game(room_id):
	"""
	Ends the game and returns the user to the room view.
	"""
	room = get_object_or_404(Room, id=room_id)
	participants = Participant.objects.filter(room=room)

	winner = None
	highest_score = -1

	for participant in participants:
		participant.player.quiz_high_score = max(participant.player.quiz_high_score, participant.score)
		participant.player.quiz_games_played += 1
		participant.player.quiz_total_score += participant.score
		participant.player.save()

		if participant.score > highest_score:
			highest_score = participant.score
			winner = participant

	if winner and highest_score > 0:
		winner.player.quiz_games_won += 1
		winner.player.save()

	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(f'room_{room_id}', {'type': 'end_game', 'data': {}})
	room.is_ingame = False
	room.save()
	room.update_activity()


def process_answers(room_id, question):
	"""
	Processes the answers given by the participants, updates the scores and sends all answers to the clients.
	"""
	room = get_object_or_404(Room, id=room_id)
	participants = Participant.objects.filter(room=room)
	answers_data = []
	participants_data = []

	for participant in participants:
		answer = Answer.objects.filter(
			room=room, participant=participant, question=question
		).first()
		if answer and not answer.is_disqualified:
			answers_data.append({
				'username': participant.player.user.username,
				'profile_image': participant.player.user.image.url,
				'answer': answer.answer_given,
				'score_difference': participant.score_difference,
				# Potentially add the new score here
				# 'score': participant.score,
				# Potentially add the is disqualified here to display the users who were disqualified to everyone
			})
			participant.player.quiz_questions_asked += 1
			print(f"Question: {question}", flush=True)
			if answer.answer_given == room.current_question['correct_answer']:
				participant.player.quiz_correct_answers += 1
			participant.player.save()

		participants_data.append(
			{
				'username': participant.player.user.username,
				'score': participant.score,
				'score_difference': participant.score_difference,
			}
		)

	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f'room_{room_id}',
		{
			'type': 'user_answers',
			'data': {
				'answers': answers_data,
				'participants_data': participants_data,
			},
		},
	)


def delete_answers(room_id):
	"""
	Deletes all answers for a given room.
	"""
	room = get_object_or_404(Room, id=room_id)
	answers = Answer.objects.filter(room=room)
	answers.delete()


def reset_scores(room_id):
	"""
	Resets the scores of all participants in the room.
	"""
	room = get_object_or_404(Room, id=room_id)
	participants = Participant.objects.filter(room=room)
	for participant in participants:
		participant.score = 0
		participant.save()


def all_users_answered(room_id):
	"""
	Checks if all users have answered the current question.
	"""
	room = get_object_or_404(Room, id=room_id)
	total_participants = room.participants.count()
	answers_received = Answer.objects.filter(
		room=room, question=room.current_question['question']
	).count()
	return answers_received >= total_participants


def countdown_question_time(countdown_time, room_id):
	"""
	Countdown timer for the game.
	"""
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f'room_{room_id}', {'type': 'countdown_start', 'data': {'time': countdown_time}}
	)
	time.sleep(1)

	for i in range(countdown_time - 1, 0, -1):
		if all_users_answered(room_id):
			break
		async_to_sync(channel_layer.group_send)(
			f'room_{room_id}', {'type': 'countdown_update', 'data': {'time': i}}
		)
		time.sleep(1)

	async_to_sync(channel_layer.group_send)(
		f'room_{room_id}', {'type': 'countdown_end', 'data': {'time': 0}}
	)
