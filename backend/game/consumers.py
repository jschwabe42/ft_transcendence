from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Game
from django.contrib.auth.models import User
import json
from asgiref.sync import sync_to_async
from .pong import PongGame
import asyncio

class GameConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.game_id = self.scope['url_route']['kwargs']['game_id']
		self.room_group_name = f'game_{self.game_id}'
		self.game = PongGame("player1", "player2")

		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)
		self.game.running = False

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		use = text_data_json['use']

		if use == 'ready_button':
			user = text_data_json['user']
			game_id = text_data_json['game_id']
			await self.save_message(user, game_id)
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'readyButton',
					'use': use,
					'user': user,
				}
			)

		if use == 'KeyboardEvent':
			user = text_data_json['user']
			game_id = text_data_json['game_id']
			key = text_data_json['key']
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'KeyboardEvent',
					'use': use,
					'user': user,
					'key': key,
				}
			)

	async def readyButton(self, event):
		use = event['use']
		user = event['user']
		await self.send(text_data=json.dumps({
			'use': use,
			'user': user,
		}))

	async def KeyboardEvent(self, event):
		use = event['use']
		user = event['user']
		key = event['key']
		await self.send(text_data=json.dumps({
			'use': use,
			'user': user,
			'key': key,
		}))

	async def save_message(self, user, game_id):
		game = await sync_to_async(Game.objects.get)(id=game_id)
		# Use sync_to_async to access related fields in an async context
		user1 = await sync_to_async(lambda: game.player1.user.username)()
		user2 = await sync_to_async(lambda: game.player2.user.username)()

		if user1 == user:
			game.player1_ready = True
		if user2 == user:
			game.player2_ready = True

		## Wenn der 2. Ready Drueckt
		# asyncio.create_task(self.start_game_loop())

		# Save the game changes
		await sync_to_async(game.save)()
