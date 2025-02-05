from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
	re_path(r'pong/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'tournement/(?P<tournement_id>\d+)/$', consumers.TournementConsumer.as_asgi()),
	re_path(r"ws/game/$", consumers.BasePageConsumer.as_asgi()),
]
