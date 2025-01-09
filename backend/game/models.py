import datetime
from django.db import models

# Create your models here.

from django.forms import ValidationError
from django.utils import timezone

# for displaying games in admin panel

from django.contrib import admin

from users.models import Profile

# create game when starting a new game
# update game when finishing a game/goals are scored
class Game(models.Model):
    player1 = models.ForeignKey("Player", related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey("Player", related_name='games_as_player2', on_delete=models.CASCADE)
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

class Player(models.Model):
    profile = models.OneToOneField('users.Profile', on_delete=models.CASCADE, related_name='profile_for_player')
    created_at = models.DateTimeField("date created")
    matches_won = models.IntegerField(default=0)
    matches_lost = models.IntegerField(default=0)
    def __str__(self):
        return self.profile.get_name()
    @admin.display(
        boolean=True,
        ordering="created_at",
        description="Created recently?",
    )
    def was_created_recently(self):
        now = timezone.now()
        return now - datetime.timedelta(days=1) <= self.created_at <= now

    def matches_played(self):
        return self.matches_won + self.matches_lost

class Dashboard(models.Model):
    games_played = models.IntegerField(default=0)
    active_players = models.IntegerField(default=0)
    leaderboard = models.TextField()
    def __str__(self):
        return f"Dashboard: {self.games_played} games, {self.active_players} active players"

    def update_with_game(self, game):
        self.games_played += 1
        players = Player.objects.all().order_by("-matches_won")
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