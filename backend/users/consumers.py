from django.utils import timezone
import json
import sys
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

class OnlineStatusConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		# can we close if the user is anonymous? @follow-up
		await self.accept()
		print('a user has connected')
		sys.stdout.flush()
		await self.keep_alive()

	async def disconnect(self, code):
		# anonymous users do not have a profile afaik @follow-up
		await self.kill()
		# close? @follow-up
		print('a user has disconnected')
		sys.stdout.flush()

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		print(text_data)
		# how do we interact correctly?
		sys.stdout.flush()

	@sync_to_async
	def keep_alive(self):
		# update last interaction
		user_profile = self.scope["user"].profile
		user_profile.online = True
		user_profile.last_interaction = timezone.now()
		user_profile.save()
		print('a user has been kept alive')
		sys.stdout.flush()

	@sync_to_async
	def kill(self):
		# update last interaction
		user_profile = self.scope["user"].profile
		user_profile.online = False
		user_profile.save()