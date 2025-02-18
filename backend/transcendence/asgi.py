"""
ASGI config for transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')

import django
django.setup()

from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from chat import routing as chat_routing
from pong import routing as pong_routing
from quiz import routing as quiz_routing
from user_management import routing as user_status_routing
from django.contrib.staticfiles.handlers import ASGIStaticFilesHandler

django_application = get_asgi_application()

application = ProtocolTypeRouter(
	{
		"http": ASGIStaticFilesHandler(django_application),
		"websocket": AuthMiddlewareStack(
			URLRouter(
				chat_routing.websocket_urlpatterns
				+ pong_routing.websocket_urlpatterns
				+ quiz_routing.websocket_urlpatterns
				+ user_status_routing.websocket_urlpatterns,
			)
		),
	}
)
