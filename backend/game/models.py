from django.db import models

# Create your models here.

from django.utils import timezone

# for displaying games in admin panel

from django.contrib import admin


# create game when starting a new game
# update game when finishing a game/goals are scored
class Game(models.Model):
	player1 = models.ForeignKey('Player', related_name='games_as_player1', on_delete=models.CASCADE)
	player2 = models.ForeignKey('Player', related_name='games_as_player2', on_delete=models.CASCADE)
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
	@admin.display(
		boolean=True,
		ordering='played_at',
		description='Played recently?',
	)
	def __str__(self):
		return f'{self.player1} vs {self.player2} ({self.score1}-{self.score2})'


class Player(models.Model):
	profile = models.OneToOneField(
		'users.Profile', on_delete=models.CASCADE, related_name='profile_for_player'
	)
	matches_won = models.IntegerField(default=0)
	matches_lost = models.IntegerField(default=0)

	def __str__(self):
		return self.profile.user.username

	def win_to_loss_ratio(self):
		if self.matches_lost == 0:
			return self.matches_won
		if self.matches_lost == 0:
			return self.matches_won
		return round(self.matches_won / self.matches_lost, 2)
