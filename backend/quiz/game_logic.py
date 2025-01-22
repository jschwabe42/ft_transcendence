from .models import Room, Participant, RoomSettings, Answer
from django.http import JsonResponse
# from .views import countdown
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import time
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.timezone import now

def game_logic(room_id):
	"""
	Implements the game logic for the quiz game.
	"""
	room = Room.objects.get(id=room_id)
	print(f"Current Question: {room.current_question}", flush=True)
	countdown(3, room_id)
	send_question(room_id, room.current_question['question'], room.shuffled_answers)
	countdown(room.settings.time_per_qestion, room_id)
	collect_answers(room_id, room.current_question['question'])
	# Add a function here to check individual answers, updated scores etc.
	solve_question(room_id, room.current_question['question'], room.shuffled_answers, room.current_question['correct_answer'])
	countdown(5, room_id)
	clear_question(room_id)

def countdown(countdown_time, room_id):
	"""
	Countdown timer for the game.
	"""
	room = get_object_or_404(Room, id=room_id)
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f"room_{room_id}",
		{
			'type': 'countdown_start',
			'data': {
				'time': countdown_time
			}
		}
	)

	for i in range(countdown_time - 1, 0, -1):
		time.sleep(1)
		async_to_sync(channel_layer.group_send)(
			f"room_{room_id}",
			{
				'type': 'countdown_update',
				'data': {
					'time': i
				}
			}
		)

	time.sleep(1)
	async_to_sync(channel_layer.group_send)(
		f"room_{room_id}",
		{
			'type': 'countdown_end',
			'data': {
				'time': 0
			}
		}
	)

def collect_answers(room_id, question):
	"""
	Collects answers from all participants in the room.
	"""
	room = get_object_or_404(Room, id=room_id)
	participants = Participant.objects.filter(room=room)
	current_time = timezone.now()

	for participant in participants:
		answer = Answer.objects.filter(room=room, participant=participant, question=question).first()
		if answer:
			if answer.answered_at <= current_time - timezone.timedelta(seconds=room.settings.time_per_qestion):
				answer.is_disqualified = False
			else:
				answer.is_disqualified = True
			answer.save()
		else:
			Answer.objects.create(
				room=room,
				participant=participant,
				answer_given=None,
				question=question,
				is_disqualified=True
			)

def send_question(room_id, question, answers):
	"""
	Sends the question and answers to the participants in the room.
	"""
	room = get_object_or_404(Room, id=room_id)
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f"room_{room_id}",
		{
			'type': 'new_question',
			'data': {
				'question': question,
				'answers': answers
			}
		}
	)

def solve_question(room_id, question, answers, correct_answer):
	"""
	Sends the correct answer to the clients
	"""
	room = get_object_or_404(Room, id=room_id)
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f"room_{room_id}",
		{
			'type': 'solve_question',
			'data': {
				'question': question,
				'answers': answers,
				'correct_answer': correct_answer,
			}
		}
	)

def clear_question(room_id):
	"""
	Clears the current question from the client.
	"""
	room = get_object_or_404(Room, id=room_id)
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f"room_{room_id}",
		{
			'type': 'clear_question',
			'data': {}
		}
	)