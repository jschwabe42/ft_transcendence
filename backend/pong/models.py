from django.db import models
from django.utils import timezone
from django.contrib import admin
from user_management.models import CustomUser


# create game when starting a new game
# update game when finishing a game/goals are scored
class PongGame(models.Model):
	player1 = models.ForeignKey(
		CustomUser, related_name='games_as_player1', on_delete=models.CASCADE
	)
	player2 = models.ForeignKey(
		CustomUser, related_name='games_as_player2', on_delete=models.CASCADE
	)
	score1 = models.IntegerField(default=0)
	score2 = models.IntegerField(default=0)
	# calculate duration of game from start to finish
	started_at = models.DateTimeField(default=timezone.now)
	played_at = models.DateTimeField(default=timezone.now)
	pending = models.BooleanField(default=True)

	player1_ready = models.BooleanField(default=False)
	player2_ready = models.BooleanField(default=False)

	player1_control_settings = models.CharField(max_length=255, default='up down')
	player2_control_settings = models.CharField(max_length=255, default='up down')
	# obtain from each player the User object and display its username
	tournement_id = models.IntegerField(default=0)

	@admin.display(
		boolean=True,
		ordering='played_at',
		description='Played recently?',
	)
	def __str__(self):
		return f'{self.player1} vs {self.player2} ({self.score1}-{self.score2})'


class Tournement(models.Model):
	host = models.CharField(max_length=255, default='')
	player1 = models.CharField(max_length=255, default='')
	player2 = models.CharField(max_length=255, default='')
	player3 = models.CharField(max_length=255, default='')

	created_at = models.DateTimeField(default=timezone.now)

	winner1 = models.CharField(max_length=255, default='')
	winner2 = models.CharField(max_length=255, default='')

	openTournement = models.BooleanField(default=True)
	playernum = models.IntegerField(default=1)
