from django.shortcuts import render, redirect, get_object_or_404
from django.utils.timezone import now
from .models import Room, Participant
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def quiz_home(request):
	rooms = Room.objects.filter(is_active=True)
	return render(request, 'quiz/quiz_home.html', {'rooms': rooms})

def create_room(request):
	if request.method == 'POST':
		room_name = request.POST.get('room_name', 'New Room')
		room, created = Room.objects.get_or_create(name=room_name)
		room.update_activity()

		Participant.objects.get_or_create(user=request.user, room=room)
		return redirect('quiz:join_room', room_name=room.name)
	return render(request, 'quiz/create_room.html')

def join_room(request, room_name):
	room = get_object_or_404(Room, name=room_name)
	if room.is_active:
		Participant.objects.get_or_create(user=request.user, room=room)
		room.update_activity()
		# if created:
		# 	channel_layer = get_channel_layer()
		# 	async_to_sync(channel_layer.group_send)(
		# 		f'quiz_{room_name}',
		# 		{
		# 			'type': 'chat_message',
		# 			'message': f'{request.user.username} joined the room!'
		# 		}
		# 	)
		return render (request, 'quiz/room.html', {'room': room})
	return redirect('quiz:quiz_home')

def leave_room(request, room_name):
	room = get_object_or_404(Room, name=room_name)
	Participant.objects.filter(user=request.user, room=room).delete()
	if room.participants.count() == 0:
		room.is_active = False
		room.save()
	return redirect('quiz:quiz_home')

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
