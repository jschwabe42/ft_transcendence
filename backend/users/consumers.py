from django.utils import timezone
import json
import sys
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

class OnlineStatusConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		print('a user has connected')
		sys.stdout.flush()
		await self.keep_alive()

	async def disconnect(self, code):
		await self.kill()
		sys.stdout.flush()

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)

	@sync_to_async
	def keep_alive(self):
		# update last interaction
		user_profile = self.scope["user"].profile
		user_profile.online = True
		user_profile.last_interaction = timezone.now()
		user_profile.save()
		print(f'{user_profile.user.username} is kept alive')
		sys.stdout.flush()

	@sync_to_async
	def kill(self):
		# update last interaction
		user_profile = self.scope["user"].profile
		user_profile.online = False
		user_profile.save()
		print(f'{user_profile.user.username} was disconnected')