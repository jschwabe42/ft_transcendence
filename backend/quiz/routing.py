from django.urls import path, re_path
from .consumers import RoomListConsumer
from .consumers import RoomMembersConsumer

websocket_urlpatterns = [
	# General room list consumer
	path('ws/rooms/', RoomListConsumer.as_asgi()),
	# Room-specific consumer for room members list and game state
	re_path(r'ws/rooms/(?P<room_id>\w+)/$', RoomMembersConsumer.as_asgi()),
]