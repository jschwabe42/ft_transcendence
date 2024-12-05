from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

class Room(models.Model):
	name = models.CharField(max_length=100, unique=True)
	# participants = models.ManyToManyField(User, related_name="quiz_rooms", blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	last_activity = models.DateTimeField(default=now)
	is_active = models.BooleanField(default=True)
	leader= models.OneToOneField(
		'Participant',
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="leader_of",
	)

	def update_activity(self):
		self.last_activity = now()
		self.save()

	def __str__(self):
		return self.name

class Participant(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='participants')
	joined_at = models.DateTimeField(auto_now_add=True)