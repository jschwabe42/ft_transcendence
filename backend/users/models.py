from django.db import models
from django.contrib.auth.models import User
from PIL import Image
from django.forms import ValidationError
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

class Friends(models.Model):
	origin = models.ForeignKey(User, models.CASCADE)
	target = models.ForeignKey(User, models.CASCADE, related_name='target_for_friends')

	def __hash__(self):
		return hash((self.origin, self.target))
	# not sure how to test initialization @follow-up
	# friendship exists
	# not sure if this will work but for now we just assume
	# Friends(User1, User2) != Friends(User2, User1)
	# @follow-up
	def __eq__(self, other):
		return (self.origin, self.target) == (other.origin, other.target)

# need to always check origin user of a request
class Friends_Manager(models.Model):
	friendships_active = set()
	friendships_inactive = set()

	def friends_request(self, origin, target_friend):
		if target_friend == origin:
			raise ValidationError('You cannot befriend yourself!')
		current_set = Friends(origin, target_friend)
		if current_set not in self.friendships_active and current_set not in self.friendships_inactive:
			self.friendships_inactive.add(Friends(origin, target_friend))

	# is this ok like this? @follow-up
	def cancel_or_deny_request(self, origin_or_target):
		for friendship in self.friendships_inactive:
			if friendship.acontains(origin_or_target):
				self.friendships_inactive.remove(friendship)

	# this needs more work @todo
	# What does this take? the User having to accept or Friends' instance
	def accept_request_as_target(self, target_friend):
		for friendship in self.friendships_inactive:
			if friendship.acontains(target_friend):
				origin, destination = friendship
				if destination == target_friend:
					self.friendships_active.add(Friends(origin, target_friend))
					self.friendships_inactive.remove(friendship)

	# taking an instance seems quite logical
	def accept_request_with_instance(self, maybe_friendship):
		self.friendships_inactive.remove(maybe_friendship)
		self.friendships_active.add(maybe_friendship)

	def cancel_or_deny_with_instance(self, maybe_friendship):
		self.friendships_inactive.remove(maybe_friendship)

	def is_inactive(self, maybe_exists):
		return self.friendships_inactive.__contains__(maybe_exists)
	
	def is_active(self, maybe_exists):
		return self.friendships_active.__contains__(maybe_exists)

	def remove_friendship_with_instance(self, probably_exists):
		if self.is_active(probably_exists):
			self.friendships_active.remove(probably_exists)
		elif self.is_inactive(probably_exists):
			self.cancel_or_deny_with_instance(probably_exists)
		else:
			raise ValidationError("cannot delete non-existent friendship")

