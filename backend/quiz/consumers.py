from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Room, Participant
from django.contrib.auth.models import User
import json
from asgiref.sync import sync_to_async
from django.shortcuts import get_object_or_404

