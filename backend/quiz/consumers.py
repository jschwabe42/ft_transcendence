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
		message = text_data_json['message']
		username = text_data_json['username']

		room = await sync_to_async(Room.objects.get)(name=self.room_name)
		leader = room.leader.user.username if room.leader else None

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'chat_message',
				'message': message,
				'username': username,
				'leader': leader,
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