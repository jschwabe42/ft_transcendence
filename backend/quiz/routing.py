from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
	re_path(r'ws/quiz/room/(?P<room_name>\w+)/$', consumers.QuizConsumer.as_asgi()),
	re_path(r'ws/quiz/home/$', consumers.RoomListConsumer.as_asgi()),
]
