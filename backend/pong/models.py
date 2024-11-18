import datetime
from django.db import models

# Create your models here.

from django.utils import timezone

# for displaying games in admin panel

from django.contrib import admin

# create game when starting a new game
# update game when finishing a game/goals are scored
class Game(models.Model):
    player1 = models.ForeignKey("Player", related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey("Player", related_name='games_as_player2', on_delete=models.CASCADE)
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
    # calculate duration of game from start to finish
    started_at = models.DateTimeField("date started")
    played_at = models.DateTimeField("date finished")
    def __str__(self):
        return f"{self.player1} vs {self.player2} ({self.score1}-{self.score2})"
    @admin.display(
        boolean=True,
        ordering="played_at",
        description="Played recently?",
    )
    def was_played_recently(self):
        now = timezone.now()
        return now - datetime.timedelta(days=1) <= self.played_at <= now
    def start(self):
        self.started_at = timezone.now()
    def end(self):
        self.played_at = timezone.now()
        self.save()
    def score(self, player):
        if player == self.player1:
            self.score1 += 1
        elif player == self.player2:
            self.score2 += 1
        self.save()
    def get_duration(self):
        return self.played_at - self.started_at

class Player(models.Model):
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField("date created")
    matches_won = models.IntegerField(default=0)
    matches_lost = models.IntegerField(default=0)
    def __str__(self):
        return self.name
    @admin.display(
        boolean=True,
        ordering="created_at",
        description="Created recently?",
    )
    def was_created_recently(self):
        now = timezone.now()
        return now - datetime.timedelta(days=1) <= self.created_at <= now
