import random
import json
import requests
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.timezone import now
from django.http import JsonResponse
from .models import Room, Participant, Answer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .trivia import get_trivia_questions
import os
import threading
from .game_logic import initialize_room, handle_submit_answer
# Known issue: Trying to create a room without being logged in

def quiz_home(request):
	rooms = Room.objects.filter(is_active=True)
	return render(request, 'quiz/quiz_home.html', {'rooms': rooms})

def create_room(request):
	if request.method == 'POST':
		room_name = request.POST.get('room_name', 'New Room').strip()
		invalid_chars = set(' !?@#$%^&*()+=<>[]{}|\\/:;\'"')
		if any(char in invalid_chars for char in room_name):
			return render(request, 'quiz/create_room.html', {'error': f"Room names cannot contain spaces or any of the following characters: {' '.join(invalid_chars)}", 'room_name': room_name})
		room, created = Room.objects.get_or_create(name=room_name)
		room.update_activity()
		# Participant.objects.get_or_create(user=request.user, room=room)
		participant, created = Participant.objects.get_or_create(user=request.user, room=room)
		if created:
			room.leader = participant
			room.save()
		broadcast_room_list_update()
		broadcast_room_update(room.name)
		return redirect('quiz:join_room', room_name=room.name)
	return render(request, 'quiz/create_room.html')

def join_room(request, room_name):
	room = get_object_or_404(Room, name=room_name)
	if room.is_active:
		participant, created = Participant.objects.get_or_create(user=request.user, room=room)
		room.update_activity()
		if created:
			broadcast_room_update(room_name)
		if room.game_started:
			return render(request, 'quiz/game.html', {'room': room})
		return render (request, 'quiz/room.html', {'room': room})
	return redirect('quiz:quiz_home')

def leave_room(request, room_name):
	room = get_object_or_404(Room, name=room_name)
	# Participant.objects.filter(user=request.user, room=room).delete()
	participant = Participant.objects.filter(user=request.user, room=room).first()
	if participant:
		if room.leader == participant:
			remaining_participants = room.participants.exclude(id=participant.id).order_by('joined_at', 'user__username')
			if remaining_participants.exists():
				room.leader = remaining_participants.first()
			else:
				room.leader = None
			room.save()
		participant.delete()
		if room.participants.count() == 0:
			room.is_active = False
			room.save()
			broadcast_room_list_update()
		else:
			broadcast_room_update(room_name)
	return redirect('quiz:quiz_home')

def broadcast_room_update(room_name):
	room = Room.objects.get(name=room_name)
	participants = [p.user.username for p in room.participants.all()]
	leader = room.leader.user.username if room.leader else None
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f"quiz_{room_name}",
		{
			"type": "chat_message",
			"participants": participants,
			"leader": leader,
		}
	)

def broadcast_room_list_update():
	active_rooms = Room.objects.filter(is_active=True).values_list('name', flat=True)
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		"quiz_home",
		{
			"type": "room_list_update",
			"rooms": list(active_rooms),
		}
	)

def game_view(request, room_name):
	room = get_object_or_404(Room, name=room_name)
	room = initialize_room(room)
	if not room.game_started:
		return render (request, 'quiz/room.html', {'room': room})
	return render(request, 'quiz/game.html', {'room': room, 'question': room.current_question, 'shuffled_answers': room.shuffled_answers})

def submit_answer(request, room_name):
	if request.method == 'POST':
		room = get_object_or_404(Room, name=room_name)
		participant = get_object_or_404(Participant, user=request.user, room=room)
		data = json.loads(request.body)
		answer = data.get('answer')
		print(f"Received answer: {answer} from user: {request.user.username}")
		# room = submit_answer(room, request.user, answer)
		handle_submit_answer(room, participant, answer)
		return JsonResponse({'status': 'ok'})

def get_correct_answer(request, room_name):
	room = get_object_or_404(Room, name=room_name)
	correct_answer = room.current_question['correct_answer']
	return JsonResponse({'correct_answer': correct_answer})

def start_timer(room_name):
	import time
	time.sleep(30)
	room = Room.objects.get(name=room_name)
	correct_answer = room.current_question['correct_answer']
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f"quiz_{room_name}",
		{
			"type": "show_correct_answer",
			"correct_answer": correct_answer,
		}
	)

def start_game(request, room_name):
	if request.method == 'POST':
		room = get_object_or_404(Room, name=room_name)
		room.game_started = True
		room.save()
		channel_layer = get_channel_layer()
		async_to_sync(channel_layer.group_send)(
			f"quiz_{room_name}",
			{
				"type": "game_start",
				"question": room.current_question,
				"shuffled_answers": room.shuffled_answers,
			}
		)
		# Start the timer in a separate thread
		# threading.Thread(target=start_timer, args=(room_name,)).start()
		return redirect('quiz:game_view', room_name=room_name)
	return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


# Add to crontab etc to periodically clean up empty rooms
# from django.utils.timezone import now
# from datetime import timedelta
# from .models import Room

# def check_inactive_rooms():
#     timeout = timedelta(minutes=15)  # Define inactivity period
#     for room in Room.objects.filter(is_active=True):
#         if now() - room.last_activity > timeout:
#             room.is_active = False
#             room.save()
