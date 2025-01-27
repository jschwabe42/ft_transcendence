from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
	# set the online status for a user
	re_path(r'ws/online-status/$', consumers.OnlineStatusConsumer.as_asgi()),
	# WIP: get the online status for a user by username
	# re_path(r'ws/user/(?P<query_user>[^/]+)$', consumers.UserProfileConsumer.as_asgi()),#@audit not working
]