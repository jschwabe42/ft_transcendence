from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.test import TestCase

from user_management.friends import Friends, Friends_Manager

# Create your tests here.


class FriendsManagerTest(TestCase):
	def setUp(self):
		# Create test users
		self.user1 = User.objects.create_user(username='user1', password='password1')
		self.user2 = User.objects.create_user(username='user2', password='password2')
		self.user3 = User.objects.create_user(username='user3', password='password3')

	def test_friends_request(self):
		# Test sending a friend request to another user
		Friends_Manager.friends_request(self.user1, 'user2')
		self.assertTrue(
			Friends.objects.filter(origin=self.user1, target=self.user2, accepted=False).exists()
		)
		# Test sending a friend request to oneself
		with self.assertRaises(ValidationError):
			Friends_Manager.friends_request(self.user1, 'user1')
		self.assertFalse(
			Friends.objects.filter(origin=self.user1, target=self.user1, accepted=False).exists()
		)
		self.assertFalse(
			Friends.objects.filter(origin=self.user1, target=self.user1, accepted=True).exists()
		)
		# Test sending a second friend request
		with self.assertRaises(ValidationError):
			Friends_Manager.friends_request(self.user1, 'user2')
		self.assertTrue(
			Friends.objects.filter(origin=self.user1, target=self.user2, accepted=False).exists()
		)
		self.assertFalse(
			Friends.objects.filter(origin=self.user1, target=self.user2, accepted=True).exists()
		)
		# Test sending a friend request to a non-existent user
		with self.assertRaises(ValidationError):
			Friends_Manager.friends_request(self.user1, 'nonexistentuser')

	def test_cancel_friends_request(self):
		# Test canceling a friend request
		Friends_Manager.friends_request(self.user1, 'user2')
		with self.assertRaises(ValidationError):
			Friends_Manager.cancel_friends_request(self.user2, 'user1')
		self.assertTrue(
			Friends.objects.filter(origin=self.user1, target=self.user2, accepted=False).exists()
		)
		Friends_Manager.cancel_friends_request(self.user1, 'user2')
		with self.assertRaises(ValidationError):
			Friends_Manager.cancel_friends_request(self.user2, 'nonexistentuser')
		self.assertFalse(Friends.objects.filter(origin=self.user1, target=self.user2).exists())

	def test_deny_friends_request(self):
		# Test denying a friend request
		Friends_Manager.friends_request(self.user1, 'user2')
		Friends_Manager.deny_friends_request(self.user2, 'user1')
		with self.assertRaises(ValidationError):
			Friends_Manager.deny_friends_request(self.user2, 'nonexistentuser')
		with self.assertRaises(ValidationError):
			Friends_Manager.deny_friends_request(self.user1, 'user2')
		self.assertFalse(Friends.objects.filter(origin=self.user1, target=self.user2).exists())

	def test_accept_request_as_target(self):
		# Test accepting a friend request
		Friends_Manager.friends_request(self.user1, 'user2')
		Friends_Manager.accept_request_as_target(self.user2, 'user1')
		with self.assertRaises(ValidationError):
			Friends_Manager.accept_request_as_target(self.user2, 'nonexistentuser')
		with self.assertRaises(ValueError):
			Friends_Manager.accept_request_as_target(self.user2, 'user3')
		self.assertTrue(
			Friends.objects.filter(origin=self.user1, target=self.user2, accepted=True).exists()
		)

	def test_remove_friend(self):
		# Test removing a friend
		Friends_Manager.friends_request(self.user1, 'user2')
		self.assertTrue(
			Friends.objects.filter(origin=self.user1, target=self.user2, accepted=False).exists()
		)
		Friends_Manager.accept_request_as_target(self.user2, 'user1')
		self.assertTrue(
			Friends.objects.filter(origin=self.user1, target=self.user2, accepted=True).exists()
		)
		Friends_Manager.remove_friend(self.user1, 'user2')
		self.assertFalse(
			Friends.objects.filter(origin=self.user1, target=self.user2, accepted=True).exists()
		)
		self.assertFalse(
			Friends.objects.filter(origin=self.user1, target=self.user2, accepted=False).exists()
		)
		# Test removing a friend by any party
		Friends_Manager.friends_request(self.user2, 'user1')
		Friends_Manager.accept_request_as_target(self.user1, 'user2')
		Friends_Manager.remove_friend(self.user1, 'user2')
		Friends_Manager.friends_request(self.user2, 'user1')
		Friends_Manager.accept_request_as_target(self.user1, 'user2')
		Friends_Manager.remove_friend(self.user2, 'user1')
		# Test removing a non-existent user
		with self.assertRaises(ValidationError):
			Friends_Manager.remove_friend(self.user1, 'nonexistentuser')
		with self.assertRaises(ValueError):
			Friends_Manager.remove_friend(self.user1, 'user3')
		with self.assertRaises(ValueError):
			Friends_Manager.remove_friend(self.user1, 'user2')
		self.assertFalse(Friends.objects.filter(origin=self.user1, target=self.user2).exists())
		self.assertFalse(Friends.objects.filter(origin=self.user2, target=self.user1).exists())

	def test_persistence(self):
		# Test persistence of friendships
		Friends_Manager.friends_request(self.user1, 'user2')
		Friends_Manager.accept_request_as_target(self.user2, 'user1')
		# Retrieve the friendship from the database
		friendship = Friends.objects.get(origin=self.user1, target=self.user2)
		self.assertIsNotNone(friendship)
		self.assertTrue(friendship.accepted)
		# Ensure the friendship is still present after a new request
		Friends_Manager.friends_request(self.user1, 'user3')
		self.assertTrue(
			Friends.objects.filter(origin=self.user1, target=self.user2, accepted=True).exists()
		)
		self.assertTrue(
			Friends.objects.filter(origin=self.user1, target=self.user3, accepted=False).exists()
		)
