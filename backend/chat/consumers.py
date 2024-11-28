from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message, Group
from django.contrib.auth.models import User
import json
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		# room_id aus den URL-Parametern extrahieren
		room_id = self.scope['url_route']['kwargs']['room_id']

		# Wir verwenden room_id als Gruppennamen
		self.room_group_name = str(room_id)

		# Den Benutzer der Gruppe (basierend auf der Raum-ID) hinzufügen
		await self.channel_layer.group_add(
			self.room_group_name,  # Der Gruppenname ist jetzt die room_id
			self.channel_name  # Der Kanalname für die aktuelle WebSocket-Verbindung
		)
		# Die Verbindung akzeptieren (der Client kann Nachrichten senden/empfangen)
		await self.accept()

	async def disconnect(self, close_code):
		# room_id aus den URL-Parametern extrahieren
		room_id = self.scope['url_route']['kwargs']['room_id']

		# Entferne den Benutzer aus der Gruppe, die mit dieser room_id verbunden ist
		await self.channel_layer.group_discard(
			str(room_id),  # Die Gruppenname ist jetzt die room_id
			self.channel_name  # Der Kanalname für diese WebSocket-Verbindung
		)


	# Hier kommt die JSON aus dem Javascript an
	async def receive(self, text_data):
		#auslesen der Json und in variablen abspeichern
		text_data_json = json.loads(text_data)
		use = text_data_json['use']

		# If its a Chatmessage
		if use == "chat_message":
			print("Recieve")
			message = text_data_json['message']
			username = text_data_json['username']
			room_name = text_data_json['room_name']
			room_id = text_data_json['room_id']

			print(f"Empfangen: Nachricht='{message}', Benutzer='{username}', Raum='{room_name}', Raum_ID'{room_id}'")
			await self.save_message(username, message, room_name, room_id)

			# Nachricht an die Gruppe senden
			# Nachricht an die Gruppe mit der Raum-ID senden
			await self.channel_layer.group_send(
				str(room_id),  # Die Raum-ID als Gruppenname, der zur Identifikation der Gruppe verwendet wird
				{
					'type': 'chat_message',  # Der Typ der Nachricht, die später verarbeitet wird
					'message': message,
					'username': username,
					'room_name': room_name,  # optional, falls du den Namen des Raums brauchst
					'room_id': room_id,
				}
			)
		else:
			message = text_data_json['message']
			room_name = text_data_json['room_name']
			room_id = text_data_json['room_id']
			username = text_data_json['username']

			print(f"Empfangen: Nachricht='{message}', Raum='{room_name}', Raum_ID'{room_id}'")

			await self.save_new_user(username, message, room_name, room_id)

	async def chat_message(self, event):
		message = event['message']
		username = event['username']
		room_name = event['room_name']
		room_id = event['room_id']

		await self.send(text_data=json.dumps({
			'message': message,
			'username': username,
			'room_name': room_name,  # falls benötigt
			'room_id': room_id
		}))

	async def save_message(self, username, message, room_name, room_id):
		# Benutzer aus der Datenbank abrufen
		user = await sync_to_async(User.objects.get)(username=username)
		group = await sync_to_async(Group.objects.get)(id=room_id)

		# Nachricht in der Datenbank speichern
		await sync_to_async(Message.objects.create)(
			group=group,
			author=user,
			content=message,
		)

	async def save_new_user(self, username, message, room_name, room_id):

		try:
			user = await sync_to_async(User.objects.get)(username=message)
			print("User exists")

			group = await sync_to_async(Group.objects.get)(id=room_id)
			members = await sync_to_async(lambda: list(group.members.all()))()
			if user in members:
				print("User already is Part of the Group")
			else:
				print("User is not part of the Group")
				await sync_to_async(group.members.add)(user)

		except User.DoesNotExist:
			print("User doesnt Exist")
