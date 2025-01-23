import json
from channels.generic.websocket import AsyncWebsocketConsumer

class RoomListConsumer(AsyncWebsocketConsumer):
	"""
	Websocket consumer that broadcasts the updated room list to all connected clients.
	"""
	async def connect(self):
		await self.channel_layer.group_add("rooms", self.channel_name)
		await self.accept()
	
	async def disconnect(self, close_code):
		await self.channel_layer.group_discard("rooms", self.channel_name)

	async def update_room_list(self, event):
		"""
		Sends the updated room list to all the users in the group
		"""
		# print("Broadcasting room list update:", event)
		msg = {
			'type': 'update_room_list',  # This is the type of the message
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))



class RoomMembersConsumer(AsyncWebsocketConsumer):
	"""
	Websocket consumer for each room, for the room members list and game state.
	"""
	async def connect(self):
		self.room_id = self.scope['url_route']['kwargs']['room_id']  # Get room_id from URL
		self.room_group_name = f"room_{self.room_id}"  # Room-specific group

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

	async def update_room_members(self, event):
		"""
		Sends the updated room members list to all the users in the group
		"""
		msg = {
			'type': 'update_room_members',  # This is the type of the message
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))

	async def start_game(self, event):
		"""
		Sends the start game signal to all the users in the group
		"""
		msg = {
			'type': 'start_game',
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))

	async def countdown_start(self, event):
		"""
		Sends the countdown start signal to all the users in the group
		"""
		msg = {
			'type': 'countdown_start',
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))

	async def countdown_update(self, event):
		"""
		Sends the countdown update signal to all the users in the group
		"""
		msg = {
			'type': 'countdown_update',
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))

	async def countdown_end(self, event):
		"""
		Sends the countdown end signal to all the users in the group
		"""
		msg = {
			'type': 'countdown_end',
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))

	async def new_question(self, event):
		"""
		Sends the new question signal to all the users in the group
		"""
		msg = {
			'type': 'new_question',
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))

	async def solve_question(self, event):
		"""
		Sends the solve question signal to all the users in the group
		"""
		msg = {
			'type': 'solve_question',
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))

	async def clear_question(self, event):
		"""
		Sends the clear question signal to all the users in the group
		"""
		msg = {
			'type': 'clear_question',
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))

	async def end_game(self, event):
		"""
		Sends the end game signal to all the users in the group
		"""
		msg = {
			'type': 'end_game',
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))

	async def user_answers(self, event):
		"""
		Sends the user answers signal to all the users in the group
		"""
		msg = {
			'type': 'user_answers',
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))