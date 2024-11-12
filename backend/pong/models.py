import datetime
from django.db import models

# Create your models here.

from django.db import models
from django.utils import timezone

# for displaying games in admin panel

from django.contrib import admin

class Game(models.Model):
    player1 = models.CharField(max_length=200)
    player2 = models.CharField(max_length=200)
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
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
