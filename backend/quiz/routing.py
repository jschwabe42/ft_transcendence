from django.urls import path
from .consumers import RoomListConsumer
from .consumers import RoomMembersConsumer

websocket_urlpatterns = [
	# General room list consumer
	path('ws/rooms/', RoomListConsumer.as_asgi()),
	# Room-specific consumer for room members list and game state
	path('ws/rooms/<str:room_id>/', RoomMembersConsumer.as_asgi()),
]