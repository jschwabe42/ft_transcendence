import datetime
from django.db import models
from django.contrib.auth.models import User

# Create your models here.

from django.forms import ValidationError
from django.utils import timezone

# for displaying games in admin panel

from django.contrib import admin
from users.models import Profile

# create game when starting a new game
# update game when finishing a game/goals are scored
class Game(models.Model):
    player1 = models.ForeignKey("users.Profile", related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey("users.Profile", related_name='games_as_player2', on_delete=models.CASCADE)
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
    # calculate duration of game from start to finish
    started_at = models.DateTimeField(default=timezone.now)
    played_at = models.DateTimeField(default=timezone.now)
    pending = models.BooleanField(default=True)

    player1_ready = models.BooleanField(default=False)
    player2_ready = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.player1} vs {self.player2} ({self.score1}-{self.score2})"

    #For displaying in admin page
    @admin.display(
        boolean=True,
        ordering="played_at",
        description="Played recently?",
    )

    def was_played_recently(self):
        now = timezone.now()
        return now - datetime.timedelta(days=1) <= self.played_at <= now
    def end(self):
        self.played_at = timezone.now()
        if self.score1 > self.score2:
            self.player1.matches_won += 1
            self.player2.matches_lost += 1
        elif self.score1 < self.score2:
            self.player1.matches_lost += 1
            self.player2.matches_won += 1
        self.player1.save()
        self.player2.save()
        self.save()
        
        # update Dashboard
        Dashboard.get_instance().update_with_game(self)
    def score(self, player):
        if player == self.player1:
            self.score1 += 1
        elif player == self.player2:
            self.score2 += 1
        self.save()
    def get_duration(self):
        return self.played_at - self.started_at


class Dashboard(models.Model):
    games_played = models.IntegerField(default=0)
    active_players = models.IntegerField(default=0)
    leaderboard = models.TextField()
    def __str__(self):
        return f"Dashboard: {self.games_played} games, {self.active_players} active players"

    def update_with_game(self, game):
        self.games_played += 1
        players = Profile.objects.all().order_by("-matches_won")
        self.leaderboard = "\n".join([f"{player.name}: {player.matches_won}" for player in players])
        self.save()

    def save(self, *args, **kwargs):
        if not self.pk and Dashboard.objects.exists():
            raise ValidationError('There is already one Dashboard instance')
        return super(Dashboard, self).save(*args, **kwargs)

    @classmethod
    def get_instance(cls):
        instance, created = cls.objects.get_or_create(pk=1)
        return instance