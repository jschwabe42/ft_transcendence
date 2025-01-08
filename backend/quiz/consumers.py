import json
from channels.generic.websocket import AsyncWebsocketConsumer

class RoomConsumer(AsyncWebsocketConsumer):
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
