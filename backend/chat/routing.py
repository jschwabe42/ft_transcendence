from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Beispiel: URL für einen Chatraum mit einer room_id
    re_path(r'ws/chat/(?P<room_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]
