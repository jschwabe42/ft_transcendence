from django.db import models
from django.forms import ValidationError

from .models import CustomUser

User = CustomUser


class BlockedUsers(models.Model):
	blocker = models.ForeignKey(User, models.CASCADE)
	blockee = models.ForeignKey(User, models.CASCADE, related_name='target_for_blocked_users')

	def __hash__(self):
		return hash((self.blocker, self.blockee))

	def __eq__(self, other):
		return (self.blocker, self.blockee) == (other.blocker, other.blockee)


class Block_Manager:
	@staticmethod
	# @follow-up check if this is used or not
	def is_blocked(origin):
		"""for all users, check if anyone has blocked origin"""
		return BlockedUsers.objects.filter(blockee=origin).exists()

	@staticmethod
	def is_blocked_by(blockee, blocker):
		"""check for a specific block: blockee si blocked by blocker"""
		return BlockedUsers.objects.filter(blocker=blocker, blockee=blockee).exists()

	@staticmethod
	def has_blocked(blocker, blockee):
		"""check for a specific block: blocker has blocked blockee"""
		return BlockedUsers.objects.filter(blocker=blocker, blockee=blockee).exists()

	@staticmethod
	def have_block(origin, target):
		"""check if either user has blocked the other"""
		return Block_Manager.is_blocked_by(
			blockee=origin, blocker=target
		) or Block_Manager.has_blocked(blocker=origin, blockee=target)

	@staticmethod
	def block_user(blocker, target_username):
		"""block a user"""
		target = Block_Manager.__get_existing_user_instance(target_username)
		if blocker == target:
			raise ValidationError('You cannot block yourself!')
		if Block_Manager.is_blocked_by(blockee=target, blocker=blocker):
			raise ValidationError('This user is already blocked')
		BlockedUsers.objects.create(blocker=blocker, blockee=target)

	@staticmethod
	def unblock_user(origin, target_username):
		"""unblock a user"""
		target = Block_Manager.__get_existing_user_instance(target_username)
		BlockedUsers.objects.filter(blocker=origin, blockee=target).delete()

	# internal
	def __get_existing_user_instance(string_target_friend):
		if not User.objects.filter(username=string_target_friend).exists():
			raise ValidationError('The target user does not exist!')
		return User.objects.get(username=string_target_friend)
