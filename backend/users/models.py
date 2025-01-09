from django.db import models
from django.contrib.auth.models import User
from PIL import Image
from django.utils import timezone

# Create your models here.


class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	player = models.OneToOneField('game.Player', on_delete=models.CASCADE, related_name='profile_player', null=True, blank=True)
	image = models.ImageField(default='default.jpg', upload_to='profile_pics')

	def get_name(self):
		return self.user.username

	def __str__(self):
		return f'{self.user.username} Profile'

	# resize uploaded images
	def save(self, *args, **kwargs):
		from game.models import Player  # Import Player model here to avoid circular import
		super().save(*args, **kwargs)
		if not self.player:
			player = Player.objects.create(profile=self, created_at=timezone.now())
			self.player = player
			self.save()
		img = Image.open(self.image.path)
	
		if img.height > 300 or img.width > 300:
			output_size = (300, 300)
			img.thumbnail(output_size)
			img.save(self.image.path)

	def matches_played(self):
		return self.player.matches_won + self.player.matches_lost
