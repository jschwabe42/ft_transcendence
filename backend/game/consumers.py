from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Game
from django.contrib.auth.models import User
import json
from asgiref.sync import sync_to_async
from .pong import PongGame
import asyncio

games = {}

class GameConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.game_id = self.scope['url_route']['kwargs']['game_id']
		self.room_group_name = f'game_{self.game_id}'

		# Stelle sicher, dass ein zentrales Spiel verwendet wird
		if self.game_id not in games:
			games[self.game_id] = PongGame("player1", "player2")
		self.game = games[self.game_id]

		# Gruppe hinzufügen
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
			await self.KeyboardInterrupt(user, game_id, key)



	async def KeyboardInterrupt(self, user, game_id, key):
		game = await sync_to_async(Game.objects.get)(id=game_id)
		user1_control = game.player1_control_settings
		user2_control = game.player2_control_settings
		user1 = await sync_to_async(lambda: game.player1.profile.user.username)()
		user2 = await sync_to_async(lambda: game.player2.profile.user.username)()

		if user1 == user:
			if user1_control == "w_s":
				if key == "KeyDownW":
					key = "KeyDownArrowUp"
				elif key == "KeyDownS":
					key = "KeyDownArrowDown"
				elif key == "KeyUpW":
					key = "KeyUpArrowUp"
				elif key == "KeyUpS":
					key = "KeyUpArrowDown"
			self.game.move_paddle("player1", key)
		elif user2 == user:
			if user2_control == "w_s":
				if key == "KeyDownW":
					key = "KeyDownArrowUp"
				elif key == "KeyDownS":
					key = "KeyDownArrowDown"
				elif key == "KeyUpW":
					key = "KeyUpArrowUp"
				elif key == "KeyUpS":
					key = "KeyUpArrowDown"
			self.game.move_paddle("player2", key)

 


	async def readyButton(self, event):
		use = event['use']
		user = event['user']
		await self.send(text_data=json.dumps({
			'use': use,
			'user': user,
		}))

	async def save_message(self, user, game_id):
		game = await sync_to_async(Game.objects.get)(id=game_id)
		# Use sync_to_async to access related fields in an async context
		user1 = await sync_to_async(lambda: game.player1.profile.user.username)()
		user2 = await sync_to_async(lambda: game.player2.profile.user.username)()

		# if not (game.player1_ready and game.player2_ready):
		# 	if user1 == user:
		# 		game.player1_ready = True
		# 	if user2 == user:
		# 		game.player2_ready = True
		# 	# create new task (calls start_game function)
		# 	if game.player1_ready and game.player2_ready:
		# 		asyncio.create_task(self.start_game_loop())
		# 	# Save the game changes
		# 	await sync_to_async(game.save)()
		
		
		# For testing to not start games
		if user1 == user:
			game.player1_ready = True
		if user2 == user:
			game.player2_ready = True
		if game.player1_ready and game.player2_ready:
			asyncio.create_task(self.start_game_loop())
		await sync_to_async(game.save)()


	async def start_game_loop(self):
		async def broadcast_callback(state):
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'game_state',
					'state': state,
				}
			)
		# start the gameloop
		await self.game.game_loop(broadcast_callback)

	# send Gamestats to clients
	async def game_state(self, event):
		state = event['state']
		await self.send(text_data=json.dumps({
			'use': 'game_state',
			'state': json.loads(state),
		}))
