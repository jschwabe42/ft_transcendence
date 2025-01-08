from django.http import JsonResponse
from django.shortcuts import render
from .models import Room, Participant
from django.utils import timezone
from django.utils.timezone import now
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import timezone

# Create your views here.
def index (request):
	return render(request, 'quiz/index.html')

def create_room(request):
	if request.method == 'POST':
		room_name = request.POST.get('room_name', 'New Room').strip()
		print(f"Received room name: {request.POST.get('room_name', 'New Room').strip()}")
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
			room.save()
		room_list_update()
		return JsonResponse({
			'success': True,
			'message': f"Room '{room.name}' created successfully!",
			'room_name': room.name
		})
	return JsonResponse({'success': False, 'error': 'Invalid request method.'})

def room_list(request):
	rooms = Room.objects.all().order_by('-last_activity').values('id', 'name', 'last_activity', 'is_active')
	return JsonResponse({'rooms': list(rooms)})

# Uses the websocket to broadcast the updated room list to all connected clients.
def room_list_update():
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