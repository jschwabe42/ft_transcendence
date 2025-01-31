import json
import sys
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async


class OnlineStatusConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		print('a user has connected')
		sys.stdout.flush()
		if self.scope['user'].is_authenticated:
			await self.keep_alive()

	async def disconnect(self, code):
		if self.scope['user'].is_authenticated:
			await self.kill()

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)  # noqa

	@sync_to_async
	def keep_alive(self):
		# update last interaction
		user_profile = self.scope['user'].profile
		user_profile.online = True
		user_profile.save()
		print(f'{user_profile.user.username} is kept alive')
		sys.stdout.flush()

	@sync_to_async
	def kill(self):
		# update last interaction
		user_profile = self.scope['user'].profile
		user_profile.online = False
		user_profile.save()
		print(f'{user_profile.user.username} was disconnected')


# @audit not working
# class UserProfileConsumer(AsyncWebsocketConsumer):
# @follow-up build something working?
