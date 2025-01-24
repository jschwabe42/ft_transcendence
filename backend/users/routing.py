from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # WIP: online status for user interaction
	re_path(r'ws/online-status/$', consumers.OnlineStatusConsumer.as_asgi()),
	re_path(r'ws/user/(?P<query_user>[^/]+)$', consumers.UserProfileConsumer.as_asgi()),
]