from django.db import models
from django.contrib.auth.models import User
from PIL import Image
from django.forms import ValidationError

# Create your models here.


class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	player = models.OneToOneField(
		'game.Player',
		on_delete=models.CASCADE,
		related_name='profile_player',
		null=True,
		blank=True,
	)
	image = models.ImageField(default='default.jpg', upload_to='profile_pics')
	online = models.BooleanField(default=False)

	# The statistics for the quiz game
	quiz_games_played = models.IntegerField(default=0)
	quiz_games_won = models.IntegerField(default=0)
	quiz_total_score = models.BigIntegerField(default=0)
	quiz_high_score = models.IntegerField(default=0)
	quiz_questions_asked = models.IntegerField(default=0)
	quiz_correct_answers = models.IntegerField(default=0)

	def get_name(self):
		return self.user.username

	def __str__(self):
		return f'{self.user.username} Profile'

	# resize uploaded images
	def save(self, *args, **kwargs):
		from game.models import (
			Player,
		)  # Import Player model here to avoid circular import

		super().save(*args, **kwargs)
		if not self.player:
			player = Player.objects.create(profile=self)
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
	# origin_username and target_username are their usernames
	@staticmethod
	def friends_request(origin, target_username):
		"""User instance, target username"""
		target_friend = Friends_Manager.__get_existing_user_instance(target_username)
		if target_friend == origin:
			raise ValidationError('You cannot befriend yourself!')
		if Friends.objects.filter(origin=target_friend, target=origin).exists():
			raise ValidationError(
				'there is already a friends request from this user for you to accept.'
			)
		if Friends.objects.filter(origin=origin, target=target_friend, accepted=True).exists():
			raise ValidationError('There is already a friendship between these users')
		elif Friends.objects.filter(origin=origin, target=target_friend, accepted=False).exists():
			raise ValidationError(
				'you cannot request the same user again, wait for your request to be handled'
			)
		Friends.objects.create(origin=origin, target=target_friend, accepted=False)

	# cancel the request as origin
	@staticmethod
	def cancel_friends_request(origin, target_username):
		"""User instance, target username"""
		target = Friends_Manager.__get_existing_user_instance(target_username)
		try:
			Friends_Manager.__delete_instance(
				Friends.objects.filter(origin=origin, target=target, accepted=False).first()
			)
		except ValueError:
			raise ValidationError('you did not send the friend request, you can only deny it!')

	# deny request as target
	@staticmethod
	def deny_friends_request(target, origin_username):
		"""User instance (target), origin username: deny"""
		origin = Friends_Manager.__get_existing_user_instance(origin_username)
		try:
			Friends_Manager.__delete_instance(
				Friends.objects.filter(origin=origin, target=target, accepted=False).first()
			)
		except ValueError:
			raise ValidationError('you sent the friend request, you can only cancel it!')

	# accept request as target
	@staticmethod
	def accept_request_as_target(target, origin_username):
		"""User instance (target), origin username: accept"""
		origin = Friends_Manager.__get_existing_user_instance(origin_username)
		Friends_Manager.__create_friendship(
			Friends.objects.filter(origin=origin, target=target, accepted=False).first()
		)

	# delete a friendship from either side
	@staticmethod
	def remove_friend(remover, target_username):
		"""either User instance, other username: remove"""
		target = Friends_Manager.__get_existing_user_instance(target_username)
		Friends_Manager.__delete_instance(
			friendship=Friends.objects.filter(origin=remover, target=target, accepted=True).first()
			or Friends.objects.filter(origin=target, target=remover, accepted=True).first()
		)

	# get user instances of friends
	def fetch_friends_public(user_instance):
		"""User instance: get active friends (accepted friendships)"""
		friends = set()
		accepted_friendships_incoming = Friends.objects.filter(target=user_instance, accepted=True)
		for friendship in accepted_friendships_incoming:
			friends.add(friendship.origin)
		accepted_friendships_outgoing = Friends.objects.filter(origin=user_instance, accepted=True)
		for friendship in accepted_friendships_outgoing:
			friends.add(friendship.target)
		return friends

	# this is only called in a user (self-serving) context
	def fetch_received(target):
		"""receiver User instance: get inactive (not yet accepted)"""
		origin_users = set()
		requests_received = Friends_Manager.__get_requests_received(user_instance=target)
		for received in requests_received:
			origin_users.add(received.origin)
		return origin_users

	# requests can be accepted/denied
	def __get_requests_received(user_instance):
		return Friends.objects.filter(target=user_instance, accepted=False)

	# this can be called by sender/origin user to cancel the request
	def fetch_sent(origin):
		"""sender User instance: get inactive (not yet accepted)"""
		target_users_cancelable = set()
		requests_sent = Friends_Manager.__get_requests_sent(user_instance=origin)
		for sent in requests_sent:
			target_users_cancelable.add(sent.target)
		return target_users_cancelable

	# requests can be canceled
	def __get_requests_sent(user_instance):
		return Friends.objects.filter(origin=user_instance, accepted=False)

	# internal
	def __get_existing_user_instance(string_target_friend):
		if not User.objects.filter(username=string_target_friend).exists():
			raise ValidationError('The target user does not exist!')
		return User.objects.get(username=string_target_friend)

	def __delete_instance(friendship):
		if friendship:
			friendship.delete()
		else:
			raise ValueError('the friendship you are trying to delete does not exist')

	def __create_friendship(friendship):
		if friendship:
			friendship.accepted = True
			friendship.save()
			# some sort of confirmation for the user @todo
		else:
			raise ValueError('the request you are trying to accept does not exist')
