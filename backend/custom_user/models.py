from django.contrib.auth.models import AbstractUser
from django.db import models
from PIL import Image


class CustomUser(AbstractUser):
	player = models.OneToOneField(
		'game.Player',
		on_delete=models.CASCADE,
		related_name='user_player',
		null=True,
		blank=True,
	)
	image = models.ImageField(default='default.jpg', upload_to='profile_pics')
	online = models.BooleanField(default=False)
	# @follow-up
	# display_name = models.CharField(max_length=50, default='')

	def __str__(self):
		return self.username

	# resize uploaded images
	def save(self, *args, **kwargs):
		from game.models import (
			Player,
		)  # Import Player model here to avoid circular import

		super().save(*args, **kwargs)
		if not self.player:
			player = Player.objects.create(display_name=self.username)
			self.player = player
			self.save()
		img = Image.open(self.image.path)

		if img.height > 300 or img.width > 300:
			output_size = (300, 300)
			img.thumbnail(output_size)
			img.save(self.image.path)
