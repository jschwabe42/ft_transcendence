from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Room, Participant
from django.contrib.auth.models import User
import json
from asgiref.sync import sync_to_async

class QuizConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f'quiz_{self.room_name}'

		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()
		participants = await self.get_participants(self.room_name)
		# room = await sync_to_async(Room.objects.get)(name=self.room_name)
		# leader = room.leader.user.username if room.leader else None
		leader = await self.get_leader(self.room_name)
		await self.send(text_data=json.dumps({
			'participants': participants,
			'leader': leader,
		}))

	async def disconnect(self, close_code):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		msg_type = text_data_json.get('type', '')

		room = await sync_to_async(Room.objects.select_related('leader').get)(name=self.room_name)
		# leader = room.leader.user.username if room.leader else None

		leader_user = await sync_to_async(lambda: getattr(room.leader, 'user', None))()
		leader_username = leader_user.username if leader_user else None

		if msg_type == 'start_game':
			if self.scope["user"].username == leader_username:
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						"type": "game_start",
					}
				)

		if msg_type == 'chat_message':
			message = text_data_json.get('message', '')
			username = text_data_json.get('username', '')
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'chat_message',
					'message': message,
					'username': username,
					'leader': leader_username,
				}
			)

	async def chat_message(self, event):
		message = event.get('message', '')
		participants = event.get('participants', [])
		leader = event.get('leader', None)
		# Send message to WebSocket
		await self.send(text_data=json.dumps({
			'message': message,
			'participants': participants,
			'leader': leader,
		}))

	async def game_start(self, event):
		await self.send(text_data=json.dumps({
			'type': 'game_start',
		}))

	@sync_to_async
	def get_participants(self, room_name):
		room = Room.objects.get(name=room_name)
		return [participant.user.username for participant in room.participants.all()]
	
	@sync_to_async
	def get_leader(self, room_name):
		room = Room.objects.get(name=room_name)
		return room.leader.user.username if room.leader else None




class RoomListConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.group_name = 'quiz_home'
		await self.channel_layer.group_add(self.group_name, self.channel_name)
		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.group_name, self.channel_name)

	async def room_list_update(self, event):
		rooms = event.get('rooms', [])
		await self.send(text_data=json.dumps({
			'type': 'room_list_update',
			'rooms': rooms,
		}))