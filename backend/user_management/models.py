from typing import Optional

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import models
from PIL import Image


class CustomUser(AbstractUser):
	image = models.ImageField(default='default.jpg', upload_to='profile_pics')
	online = models.BooleanField(default=False)
	# display_name is used for tournaments @follow-up
	display_name = models.CharField(
		'display_name',
		max_length=150,
		unique=True,
		help_text=('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
		validators=[UnicodeUsernameValidator()],
		error_messages={
			'unique': 'A user with that display name already exists.',
		},
		blank=True,  # this will be initialized in the signal
	)
	# for storing oauth identity
	oauth_id: Optional[str] = models.CharField(max_length=150, blank=True, null=True)

	## Game statistics
	# The statistics for the pong game
	matches_won = models.IntegerField(default=0)
	matches_lost = models.IntegerField(default=0)

	def __str__(self):
		return self.username

	# resize uploaded images
	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)
		img = Image.open(self.image.path)

		if img.height > 300 or img.width > 300:
			output_size = (300, 300)
			img.thumbnail(output_size)
			img.save(self.image.path)


class Player(models.Model):
	# The statistics for the quiz game
	quiz_games_played = models.IntegerField(default=0)
	quiz_games_won = models.IntegerField(default=0)
	quiz_total_score = models.BigIntegerField(default=0)
	quiz_high_score = models.IntegerField(default=0)
	quiz_questions_asked = models.IntegerField(default=0)
	quiz_correct_answers = models.IntegerField(default=0)
