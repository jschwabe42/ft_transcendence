import datetime
from django.db import models

# Create your models here.

from django.utils import timezone

# for displaying games in admin panel

from django.contrib import admin

# create game when starting a new game
# update game when finishing a game/goals are scored
class Game(models.Model):
    player1 = models.CharField(max_length=200)
    player2 = models.CharField(max_length=200)
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

