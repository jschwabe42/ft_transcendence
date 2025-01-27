from django.utils import timezone
import json
import sys
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from asgiref.sync import async_to_sync

class OnlineStatusConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		print('a user has connected')
		sys.stdout.flush()
		if self.scope["user"].is_authenticated:
			await self.keep_alive()

	async def disconnect(self, code):
		if self.scope["user"].is_authenticated:
			await self.kill()

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)

	@sync_to_async
	def keep_alive(self):
		# update last interaction
		user_profile = self.scope["user"].profile
		user_profile.online = True
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

# @audit not working
class UserProfileConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.username = self.scope['url_route']['kwargs']['username']
		self.visitor_group_name = f"visitors_{self.username}"

		await self.channel_layer.group_add(
			self.visitor_group_name,
			self.channel_name
		)
		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.visitor_group_name,
			self.channel_name
		)

	# send out online status to all visitors
	async def update_online_status(self, event):
		msg = {
			'type': 'update_online_status',  # This is the type of the message
			'data': event['data']
		}
		await self.send(text_data=json.dumps(msg))


# Uses the websocket to broadcast the updated user status to all connected clients.
# fate tbd ;(( @follow-up
# from channels.layers import get_channel_layer
# def visitor_list_update():
# 	channel_layer = get_channel_layer()
# 	visitors = list(Profile.objects.filter(online=True))

# 	async_to_sync(channel_layer.group_send)(
# 		"visitors",
# 		{
# 			'type': 'update_room_list',
# 			'data': {
# 				'visitors': visitors
# 			}
# 		}
# 	)