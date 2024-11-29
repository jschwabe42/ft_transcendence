from django.urls import path
from . import consumers

websocket_urlpatterns = [
	path('ws/quiz/<str:room_name>/', consumers.QuizConsumer.as_asgi()),
]
