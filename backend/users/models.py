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
	# not sure how to test initialization @follow-up
	# friendship exists
	# not sure if this will work but for now we just assume
	# Friends(User1, User2) != Friends(User2, User1)
	# @follow-up
	def __eq__(self, other):
		return (self.origin, self.target) == (other.origin, other.target)

	def has_target(self, some_user):
		return self.target == some_user

	def has_origin(self, some_user):
		return self.origin == some_user


# need to always check origin user of a request
class Friends_Manager:
	def __get_existing_user_instance(string_target_friend):
		if not User.objects.filter(username=string_target_friend).exists():
			raise ValidationError('The target user does not exist!')
		return User.objects.get(username=string_target_friend)

	def __delete_friendship(friendship):
		if friendship:
			friendship.delete()

	@staticmethod
	# origin should be the request user, target is their request
	def friends_request(origin, string_target_friend):
		"""User instance, target username"""
		target_friend = Friends_Manager.__get_existing_user_instance(string_target_friend)
		if target_friend == origin:
			raise ValidationError('You cannot befriend yourself!')
		if Friends.objects.filter(origin=target_friend, target=origin).exists():
			# handle redirect to accept as the target? (reversed_set in inactive) @follow-up
			raise ValidationError('there is already a friends request from this user for you to accept.')
		if Friends.objects.filter(origin=origin, target=target_friend).exists():
			raise ValidationError('There is already a request or friendship between these users')
		Friends.objects.create(origin=origin, target=target_friend, accepted=False)

	@staticmethod
	# cancel the request as origin
	def cancel_friends_request(origin, string_target_friend):
		"""User instance, target username"""
		target_friend = Friends_Manager.__get_existing_user_instance(string_target_friend)
		Friends_Manager.__delete_friendship(Friends.objects.filter(origin=origin, target=target_friend, accepted=False).first())

	def deny_friends_request(self, target):
		"""User instance: deny"""
		for friendship in self.friendships_inactive:
			if friendship.has_target(target):
				self.__cancel_or_deny_friendship(friendship)

	def accept_request_as_target(self, target_friend):
		"""User instance: accept"""
		for friendship in self.friendships_inactive:
			if friendship.has_target(target_friend):
				origin, destination = friendship# is this necessary? @audit
				self.__accept_friendship(Friends(origin, destination))

	# view should either send as user either direct or instance
	def remove_friend(self, remover, string_user_to_unfriend):
		"""User: part of a friendship, only works on active friendships"""
		if not User.objects.exists(string_user_to_unfriend):
			raise ValidationError('the user you are trying to befriend does not exist!')
		user_to_unfriend = User.objects.get(string_user_to_unfriend)
		self.__remove_active_friendship(remover, user_to_unfriend)


	# @todo some way to check for outstanding friend requests/instances and interacting with those as a user

	# internal 
	def __accept_friendship(self, instance):
		self.friendships_active.add(instance)
		self.friendships_inactive.remove(instance)

	def __cancel_or_deny_friendship(self, instance):
		self.friendships_inactive.remove(instance)

	def __send_friendship_request(self, instance):
		self.friendships_inactive.add(instance)

	def __remove_active_friendship(self, remover, user_to_unfriend):
		friendship = Friends(remover, user_to_unfriend)
		reverse_friendship = Friends(user_to_unfriend, remover)
		for instance in self.friendships_active:
			if instance == friendship or instance == reverse_friendship:
				self.friendships_active.remove(instance)

	# @audit does this even work
	# def __is_inactive(self, maybe_exists):
	# 	return self.friendships_inactive.__contains__(maybe_exists)

	# def __is_active(self, maybe_exists):
	# 	return self.friendships_active.__contains__(maybe_exists)

	# def __remove_friendship_with_instance(self, probably_exists):
	# 	if self.is_active(probably_exists):
	# 		self.friendships_active.remove(probably_exists)
	# 	elif self.is_inactive(probably_exists):
	# 		self.cancel_or_deny_friendship(probably_exists)
	# 	else:
	# 		raise ValidationError("cannot delete non-existent friendship")

