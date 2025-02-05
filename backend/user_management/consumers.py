import json
import sys

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer


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
		user = self.scope['user']
		user.online = True
		user.save()
		print(f'{user.username} is kept alive')
		sys.stdout.flush()

	@sync_to_async
	def kill(self):
		# update last interaction
		user = self.scope['user']
		user.online = False
		user.save()
		print(f'{user.username} was disconnected')


# @audit not working
# class UserProfileConsumer(AsyncWebsocketConsumer):
# @follow-up build something working?
