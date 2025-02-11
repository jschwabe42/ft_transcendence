from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

User = get_user_model()


class Chat(models.Model):
	message = models.CharField(max_length=255)
	date_posted = models.DateTimeField(default=timezone.now)
	author = models.ForeignKey(User, on_delete=models.CASCADE)

	def __str__(self):
		return f'{self.author.username}: {self.message}'


class Group(models.Model):
	groupName = models.CharField(max_length=255)
	date_created = models.DateTimeField(default=timezone.now)
	members = models.ManyToManyField(
		User,
		related_name='chat_groups',  # Use a unique related_name
	)

	def __str__(self):
		return self.groupName


class Message(models.Model):
	group = models.ForeignKey(
		Group, on_delete=models.CASCADE, related_name='messages'
	)  # Link to Group
	author = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to User model
	content = models.TextField()  # Content of the message
	date_posted = models.DateTimeField(default=timezone.now)

	def __str__(self):
		return f'{self.author.username}: {self.content[:20]}...'  # Preview of the message
