"""
ASGI config for transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from chat import routing as chat_routing
from django.core.asgi import get_asgi_application
from pong_game import routing as pong_routing
from quiz import routing as quiz_routing
from users import routing as user_status_routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')

application = ProtocolTypeRouter(
	{
		'http': get_asgi_application(),
		'websocket': AuthMiddlewareStack(
			URLRouter(
				chat_routing.websocket_urlpatterns
				+ pong_routing.websocket_urlpatterns
				+ quiz_routing.websocket_urlpatterns
				+ user_status_routing.websocket_urlpatterns,
			)
		),
	}
)
