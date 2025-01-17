from django.test import TestCase
from django.contrib.auth.models import User
from .models import Friends, Friends_Manager
from django.core.exceptions import ValidationError

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
		self.assertTrue(Friends.objects.filter(origin=self.user1, target=self.user2, accepted=False).exists())
		# Test sending a friend request to oneself
		with self.assertRaises(ValidationError):
			Friends_Manager.friends_request(self.user1, 'user1')
		# Test sending a friend request to a non-existent user
		with self.assertRaises(ValidationError):
			Friends_Manager.friends_request(self.user1, 'nonexistentuser')
