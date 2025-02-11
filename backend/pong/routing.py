from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
	re_path(r'pong/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
	re_path(r'tournament/(?P<tournament_id>\d+)/$', consumers.TournamentConsumer.as_asgi()),
	re_path(r'ws/pong/$', consumers.BasePageConsumer.as_asgi()),
]
