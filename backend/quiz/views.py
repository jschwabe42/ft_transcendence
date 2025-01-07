from django.http import JsonResponse
from django.shortcuts import render
from .models import Room, Participant
from django.utils.timezone import now

# Create your views here.
def index (request):
	return render(request, 'quiz/index.html')

def create_room(request):
	if request.method == 'POST':
		room_name = request.POST.get('room_name', 'New Room').strip()
		print(f"Received room name: {room_name}")
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
		# broadcast_room_list_update()
		# broadcast_room_update(room.name)
		return JsonResponse({
			'success': True,
			'message': f"Room '{room.name}' created successfully!",
			'room_name': room.name
		})
	return JsonResponse({'success': False, 'error': 'Invalid request method.'})
