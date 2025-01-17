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
	accepted = models.BooleanField(default=False)

	def __hash__(self):
		return hash((self.origin, self.target))
	def __eq__(self, other):
		return (self.origin, self.target) == (other.origin, other.target)
	

class Friends_Manager:

	# origin should be the request user, target is their request
	@staticmethod
	def friends_request(origin_user, target_username):
		"""User instance, target username"""
		target_friend = Friends_Manager.__get_existing_user_instance(target_username)
		if target_friend == origin_user:
			raise ValidationError('You cannot befriend yourself!')
		if Friends.objects.filter(origin=target_friend, target=origin_user).exists():
			# handle redirect to accept as the target? (reversed_set in inactive) @follow-up
			raise ValidationError('there is already a friends request from this user for you to accept.')
		if Friends.objects.filter(origin=origin_user, target=target_friend, accepted=True).exists():
			raise ValidationError('There is already a friendship between these users')
		Friends.objects.create(origin=origin_user, target=target_friend, accepted=False)

	# cancel the request as origin
	@staticmethod
	def cancel_friends_request(origin_user, target_username):
		"""User instance, target username"""
		target_user = Friends_Manager.__get_existing_user_instance(target_username)
		Friends_Manager.__delete_friendship(Friends.objects.filter(origin=origin_user, target=target_user, accepted=False).first())

	# deny request as target
	@staticmethod
	def deny_friends_request(target_user, origin_username):
		"""User instance (target), origin username: deny"""
		origin_user = Friends_Manager.__get_existing_user_instance(origin_username)
		Friends_Manager.__delete_friendship(Friends.objects.filter(origin=origin_user, target=target_user, accepted=False).first())

	# accept request as target
	@staticmethod
	def accept_request_as_target(target_user, origin_username):
		"""User instance (target), origin username: accept"""
		origin_user = Friends_Manager.__get_existing_user_instance(origin_username)
		Friends_Manager.__create_friendship(Friends.objects.filter(origin=origin_user, target=target_user, accepted=False).first())

	# @todo some way to check for outstanding friend requests/instances and interacting with those as a user (for views access/UX)

	# internal 
	def __get_existing_user_instance(string_target_friend):
		if not User.objects.filter(username=string_target_friend).exists():
			raise ValidationError('The target user does not exist!')
		return User.objects.get(username=string_target_friend)

	def __delete_friendship(friendship):
		if friendship:
			friendship.delete()

	def __create_friendship(friendship):
		if friendship:
			friendship.accepted = True
			friendship.save()
			# some sort of confirmation for the user @todo
		else:
			raise ValueError('the request you are trying to accept does not exist')
