from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

class Room(models.Model):
	id = models.BigAutoField(primary_key=True)
	name = models.CharField(max_length=100, unique=True)
	# participants = models.ManyToManyField(User, related_name="quiz_rooms", blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	last_activity = models.DateTimeField(default=now)
	is_active = models.BooleanField(default=True)
	game_started = models.BooleanField(default=False)
	leader= models.OneToOneField(
		'Participant',
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="leader_of",
	)
	settings = models.OneToOneField('RoomSettings', on_delete=models.CASCADE, null=True, blank=True, related_name='room_settings')
	current_question = models.JSONField(null=True, blank=True)
	shuffled_answers = models.JSONField(null=True, blank=True)
	questions = models.JSONField(null=True, blank=True)
	is_ingame = models.BooleanField(default=False)

	def update_activity(self):
		self.last_activity = now()
		self.save()

	def __str__(self):
		return self.name

class Participant(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='participants')
	joined_at = models.DateTimeField(auto_now_add=True)

class Answer(models.Model):
	room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='answers')
	participant = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name='answers')
	answer_given = models.JSONField()
	answered_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.participant.user.username} answered {self.answer_given} in {self.room.name}"

class RoomSettings(models.Model):
	room = models.OneToOneField(Room, on_delete=models.CASCADE, related_name='room_settings')

	# Number of questions asked to the users
	question_count = models.PositiveSmallIntegerField(default=5)

	def __str__(self):
		return f"Settings for room {self.room.name}"