from django.http import JsonResponse
from django.shortcuts import render
from .models import Room, Participant, RoomSettings, Answer
from django.utils import timezone
from django.utils.timezone import now
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import timezone
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.urls import reverse
from django.shortcuts import get_object_or_404
import json
import time
from .trivia import get_trivia_questions
from .game_logic import game_logic, countdown
import random

# Create your views here.
def index (request):
	return render(request, 'quiz/index.html')

@login_required
def create_room(request):
	"""
	Create a new room with the given name.
	Functions as API Endpoint. /quiz/create_room/
	Calls room_list_update() to broadcast the updated room list to all connected clients.
	Sets a room_leader if the room is created.
	"""
	if request.method == 'POST':
		room_name = request.POST.get('room_name', 'New Room').strip()
		# print(f"Received room name: {request.POST.get('room_name', 'New Room').strip()}")
		invalid_chars = set(' !?@#$%^&*()+=<>[]{}|\\/:;\'"')
		if any(char in invalid_chars for char in room_name):
			return JsonResponse({
				'success': False,
				'error': f"Room names cannot contain spaces or any of the following characters: {' '.join(invalid_chars)}"
			})
		room, created = Room.objects.get_or_create(name=room_name)
		room.update_activity()
		participant, created = Participant.objects.get_or_create(user=request.user, room=room)
		if created:
			room.leader = participant
			room.settings = RoomSettings.objects.create(room=room)
			room.save()
		room_list_update()
		participants = Participant.objects.filter(room=room)
		participants_data = [{'id': p.user.id, 'username': p.user.username} for p in participants]

		return JsonResponse({
			'success': True,
			'message': f"Room '{room.name}' created successfully!",
			'room_name': room.name,
			'room_id': room.id,
			'participants': participants_data
		})
	return JsonResponse({'success': False, 'error': 'Invalid request method.'})


def room_list(request):
	"""
	Returns the list of rooms in JSON format.
	Functions as API Endpoint. /quiz/api/room_list/
	"""
	rooms = Room.objects.all().order_by('-last_activity').values('id', 'name', 'last_activity', 'is_active')
	return JsonResponse({'rooms': list(rooms)})

# Uses the websocket to broadcast the updated room list to all connected clients.
def room_list_update():
	"""
	Uses the websocket to broadcast the updated room list to all connected clients.
	"""
	channel_layer = get_channel_layer()
	rooms = Room.objects.all().order_by('-last_activity').values('id', 'name', 'last_activity', 'is_active')

	for room in rooms:
		room['last_activity'] = room['last_activity'].astimezone(timezone.utc).isoformat()

	async_to_sync(channel_layer.group_send)(
		"rooms",
		{
			'type': 'update_room_list',
			'data': {
				'rooms': list(rooms)
			}
		}
	)

def room_member_update(room_id):
	"""
	Uses the websocket to broadcast the updated room members list to all connected clients. (Maybe change this later on to fetch the data inside the consumer)
	"""
	room = get_object_or_404(Room, id=room_id)
	participants = list(room.participants.values_list('user__username', flat=True))
	leader = room.leader.user.username if room.leader else None

	data = {
		'room_name': room.name,
		'participants': participants,
		'leader': leader,
	}

	channel_layer = get_channel_layer()
	
	async_to_sync(channel_layer.group_send)(
		f"room_{room_id}",
		{
			'type': 'update_room_members',
			'data': data,
		}
	)

@login_required
def join_room(request, room_id):
	"""
	Join the room with the given room_id.
	Functions as API Endpoint. /quiz/join_room/<int:room_id>/
	"""
	try:
		print(f"Joining room with id: {room_id}", flush=True)
		room = Room.objects.get(id=room_id)
		participant, created = Participant.objects.get_or_create(user=request.user, room=room)

		# Return the room details and participants
		participants = Participant.objects.filter(room=room)
		participants_data = [p.user.username for p in participants]
		room_member_update(room.id)
		print(f"Room is active? {room.is_active}", flush=True)
		return JsonResponse({
			'success': True,
			'room': {
				'id': room.id,
				'name': room.name,
				'last_activity': room.last_activity,
				'is_active': room.is_active,
				'leader': room.leader.user.username if room.leader else None,
				'current_user': request.user.username,
				'is_ingame': room.is_ingame,
			},
			'participants': participants_data
		})
	except Room.DoesNotExist:
		return JsonResponse({'success': False, 'error': 'Room does not exist!'})

@login_required
def leave_room(request, room_id):
	"""
	Leave the room with the given room_id.
	Functions as API Endpoint. /quiz/leave_room/<int:room_id>/
	"""
	try:
		room = Room.objects.get(id=room_id)
		participant = Participant.objects.filter(user=request.user, room=room).first()
		if participant:
			if room.leader == participant:
				remaining_participants = Participant.objects.filter(room=room).exclude(id=participant.id).order_by('joined_at', 'user__username')
				if remaining_participants.exists():
					room.leader = remaining_participants.first()
				else:
					room.leader = None
				room.save()
			participant.delete()
			if room.participants.count() == 0:
				room.delete()
				room_list_update()
			else:
				room_member_update(room.id)
		return JsonResponse({'success': True, 'message': 'Left room successfully!'})
	except Room.DoesNotExist:
		return JsonResponse({'success': False, 'error': 'Room does not exist!'})
	except Participant.DoesNotExist:
		return JsonResponse({'success': False, 'error': 'You are not a part of this room!'})
	
@login_required
def update_room_settings(request, room_id):
	"""
	Update the room settings for the room with the given room_id.
	Functions as API Endpoint. /quiz/update_room_settings/<int:room_id>/
	"""
	if request.method == 'POST':
		try:
			room = Room.objects.get(id=room_id)
			if room.leader.user != request.user:
				return JsonResponse({'success': False, 'error': 'You are not the leader of this room!'})
			data = json.loads(request.body)
			settings = data.get('settings', {})
			print(f"Data: {data}", flush=True)
			question_count = settings.get('question_count', 5)
			room.settings.question_count = question_count
			room.settings.save()
			print(f"Room settings updated: {room.settings.question_count}", flush=True)
			print(f"Success", flush=True)
			return JsonResponse({'success': True, 'message': 'Room settings updated successfully!'})
		except Room.DoesNotExist:
			return JsonResponse({'success': False, 'error': 'Room does not exist!'})
		except RoomSettings.DoesNotExist:
			return JsonResponse({'success': False, 'error': 'Room settings do not exist!'})
	return JsonResponse({'success': False, 'error': 'Invalid request method.'})

@login_required
def start_game(request, room_id):
	"""
	Start the game in the room with the given room_id.
	Functions as API Endpoint. /quiz/start_game/<str:room_name>/
	"""
	print(f"Starting game in room: {room_id}", flush=True)
	try:
		room = Room.objects.get(id=room_id)
		if room.leader.user != request.user:
			return JsonResponse({'success': False, 'error': 'You are not the leader of this room!'})
		room.is_ingame = True
		questions = get_trivia_questions(room.settings.question_count)
		if not questions:
			return JsonResponse({'success': False, 'error': 'Failed to retrieve trivia questions.'}, status=500)
		room.questions = questions
		room.save()
		room_list_update()
		# print(f"Game started in room: {room_id}", flush=True)
		# print(f"Current question: {room.current_question['question']}", flush=True)
		# print(f"Correct answer: {room.current_question['correct_answer']}", flush=True)
		# print(f"Shuffled answers: {room.shuffled_answers}", flush=True)
		# Send websocket with the question and shuffled answers
		channel_layer = get_channel_layer()
		async_to_sync(channel_layer.group_send)(
			f"room_{room_id}",
			{
				'type': 'start_game',
				'data': {
				}
			}
		)

		# countdown(20, room_id)
		game_logic(room_id)

		return JsonResponse({'success': True, 'message': 'Game started successfully!'})
	except Room.DoesNotExist:
		print(f"Room does not exist: {room_id}", flush=True)
		return JsonResponse({'success': False, 'error': 'Room does not exist!'})

@login_required
def submit_answer(request, room_id):
	"""
	Collects an answer from the user and saves it in the database.
	Functions as API Endpoint. /quiz/submit_answer/<int:room_id>/
	"""
	try:
		if request.method == 'POST':
			room = get_object_or_404(Room, id=room_id)
			participant = get_object_or_404(Participant, user=request.user, room=room)

			# print(f"Room: {room.name}, Participant: {participant.user.username}", flush=True)
			# print(f"Request body: {request.body}", flush=True)

			data = json.loads(request.body)
			# print(f"Data: {data}", flush=True)
			answer_given = data.get('answer', None)
			question = data.get('question', None)

			existing_answer = Answer.objects.filter(room=room, participant=participant, question=question).first()
			if existing_answer and existing_answer.answer_given != answer_given:
				existing_answer.delete()
				answer = Answer.objects.create(
					room=room,
					participant=participant,
					answer_given=answer_given,
					question=question,
				)
			elif not existing_answer:
				answer = Answer.objects.create(
					room=room,
					participant=participant,
					answer_given=answer_given,
					question=question,
				)

			return JsonResponse({'success': True, 'message': 'Answer submitted successfully!'})
		return JsonResponse({'success': False, 'error': 'Invalid request method.'})
	except Room.DoesNotExist:
		return JsonResponse({'success': False, 'error': 'Room does not exist!'})
	except Participant.DoesNotExist:
		return JsonResponse({'success': False, 'error': 'You are not a part of this room!'})
