from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # example: URL for chatroom with room_id
    re_path(r'ws/chat/(?P<room_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]
