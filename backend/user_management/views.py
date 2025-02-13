import json
import re

from django.contrib.auth import (
	authenticate,
	get_user_model,
	login,
	logout,
	update_session_auth_hash,
)
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db.models import F
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.utils.translation import gettext as _
from pong.models import PongGame
from pong.utils import win_to_loss_ratio
from transcendence.decorators import login_required_redirect

from user_management.friends import Friends_Manager

from .blocked_users import Block_Manager, BlockedUsers

# from .consumers import UserProfileConsumer

User = get_user_model()


@login_required_redirect
def block_user(request, username):
	"""
	Block a user. This will return an error if the user is already blocked.
	API Endpoint: /users/api/block/
	"""

	try:
		Block_Manager.block_user(blocker=request.user, target_username=username)
		return JsonResponse({'success': True, 'message': _('User blocked successfully.')})
	except ValidationError:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


@login_required_redirect
def unblock_user(request, username):
	"""
	Unblock a user. This is successful even if the user was not blocked.
	API Endpoint: /users/api/unblock/
	"""

	try:
		Block_Manager.unblock_user(origin=request.user, target_username=username)
		return JsonResponse({'success': True, 'message': _('User unblocked successfully.')})
	except ValidationError:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


@login_required_redirect
def blocked_users(request):
	"""
	Shows for the request user, their blocked users.
	API Endpoint: /users/api/blocked/
	"""
	blocked_by_request_user = BlockedUsers.objects.filter(blocker=request.user)
	if blocked_by_request_user.count() == 0:
		return JsonResponse({'success': True, 'blocked_users': []})
	return JsonResponse(
		{
			'success': True,
			'blocked_users': [blocked.blockee.username for blocked in blocked_by_request_user],
		}
	)


def register(request):
	"""
	Registers a new user.
	API Endpoint: /users/api/register/
	"""
	if request.method == 'POST':
		username = request.POST.get('username')
		email = request.POST.get('email')
		password1 = request.POST.get('password1')
		password2 = request.POST.get('password2')

		if password1 != password2:
			return JsonResponse({'success': False, 'message': _('Passwords do not match.')})
		validation_response = validate_data(username, None, email)
		if validation_response:
			return validation_response
		# If not done automatically, ensure passwords are checked for lenght etc
		user = User.objects.create_user(
			username=username, email=email, password=password1, display_name=username
		)
		user.save()
		return JsonResponse({'success': True, 'message': _('Account created successfully.')})
	else:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


def login_view(request):
	"""
	Login a user.
	API Endpoint: /users/api/login/
	"""
	if request.method == 'POST':
		username = request.POST.get('username')
		password = request.POST.get('password')

		user = authenticate(request, username=username, password=password)
		if user is not None:
			login(request, user)
			new_csrf_token = get_token(request)
			return JsonResponse(
				{'success': True, 'message': _('Login successful.'), 'csrf_token': new_csrf_token}
			)
		else:
			return JsonResponse({'success': False, 'message': _('Invalid username or password!')})
	else:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


def logout_view(request):
	"""
	Logout a user.
	API Endpoint: /users/api/logout/
	"""
	if request.method == 'POST':
		logout(request)
		new_csrf_token = get_token(request)
		return JsonResponse(
			{'success': True, 'message': _('Logout successful.'), 'csrf_token': new_csrf_token}
		)
	else:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


@login_required_redirect
def get_account_details(request):
	"""
	Get the account details of the logged in user.
	API Endpoint: /users/api/get_account_details/
	"""
	if request.method == 'GET':
		user = request.user
		return JsonResponse(
			{
				'success': True,
				'username': user.username,
				'email': user.email,
				'display_name': user.display_name,
				'image_url': user.image.url,
			}
		)
	else:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


@login_required_redirect
def update_profile(request):
	"""
	Inputs new profile data.
	API Endpoint: /users/api/update_profile/
	"""
	if request.method == 'POST':
		user = request.user
		username = request.POST.get('username')
		email = request.POST.get('email')
		display_name = request.POST.get('display_name')
		password = request.POST.get('password')
		image = request.FILES.get('image')

		validation_response = validate_data(username, display_name, email, user)
		if validation_response:
			return validation_response

		if not authenticate(username=user.username, password=password):
			return JsonResponse({'success': False, 'message': _('Invalid password.')})
		if username:
			user.username = username
		if email:
			user.email = email
		if display_name:
			user.display_name = display_name
		if image:
			user.image = image
		user.save()
		return JsonResponse({'success': True, 'message': _('Profile updated successfully.')})
	return JsonResponse({'success': False, 'message': _('Invalid request method.')})


def validate_data(username, display_name, email, current_user=None):
	if email:
		try:
			validate_email(email)
		except ValidationError:
			return JsonResponse({'success': False, 'message': _('Invalid email address.')})
		if current_user:
			if User.objects.filter(email=email).exclude(id=current_user.id).exists():
				return JsonResponse(
					{'success': False, 'message': _('An Account with this email already exists.')}
				)
		else:
			if User.objects.filter(email=email).exists():
				return JsonResponse(
					{'success': False, 'message': _('An Account with this email already exists.')}
				)
	if username:
		if len(username.strip()) == 0 or not re.match(r'^\w+$', username):
			return JsonResponse(
				{
					'success': False,
					'message': _(
						'Invalid username. Username must contain only letters, numbers, and underscores, and cannot be empty or contain only whitespace.'
					),
				}
			)
		if current_user:
			if User.objects.filter(username=username).exclude(id=current_user.id).exists():
				return JsonResponse({'success': False, 'message': _('Username already taken.')})
		else:
			if User.objects.filter(username=username).exists():
				return JsonResponse({'success': False, 'message': _('Username already taken.')})
	if display_name:
		if len(display_name.strip()) == 0 or not re.match(r'^\w+$', display_name):
			return JsonResponse(
				{
					'success': False,
					'message': _(
						'Invalid display name. Display name must contain only letters, numbers, and underscores, and cannot be empty or contain only whitespace.'
					),
				}
			)
		if current_user:
			if User.objects.filter(display_name=display_name).exclude(id=current_user.id).exists():
				return JsonResponse({'success': False, 'message': _('Display name already taken.')})
		else:
			if User.objects.filter(display_name=display_name).exists():
				return JsonResponse({'success': False, 'message': _('Display name already taken.')})
	return None


@login_required_redirect
def change_password(request):
	"""
	Change the password of the logged in user.
	"""
	if request.method == 'POST':
		data = json.loads(request.body)
		current_password = data.get('current_password')
		new_password = data.get('new_password')

		user = request.user

		if not user.check_password(current_password):
			return JsonResponse({'success': False, 'message': _('Invalid current password.')})
		# If not done automatically, ensure passwords are checked for lenght etc
		user.set_password(new_password)
		user.save()
		update_session_auth_hash(request, user)
		return JsonResponse({'success': True, 'message': _('Password changed successfully.')})
	return JsonResponse({'success': False, 'message': _('Invalid request method.')})


def check_authentication(request):
	"""
	Check if the user is authenticated.
	API Endpoint: /users/api/check_authentication/
	"""
	return JsonResponse({'is_authenticated': request.user.is_authenticated})


@login_required_redirect
def public_profile(request, query_user):
	query_user_instance = User.objects.get(username=query_user)
	pong_games_finished = PongGame.objects.filter(
		player1=query_user_instance, pending=False
	) | PongGame.objects.filter(player2=query_user_instance, pending=False)
	pong_games_won = pong_games_finished.filter(
		player1=query_user_instance, score1__gt=F('score2')
	) | pong_games_finished.filter(player2=query_user_instance, score2__gt=F('score1'))
	# something to use the display_name in games (playing as display_name) @follow-up
	pong_games_lost = [game for game in pong_games_finished if game not in pong_games_won]
	pong_games_won = sorted(pong_games_won, key=lambda game: game.played_at, reverse=True)
	pong_games_lost = sorted(pong_games_lost, key=lambda game: game.played_at, reverse=True)
	# friends = Friends_Manager.fetch_friends_public(user_instance=query_user_instance)
	# if request.user == query_user_instance:
	# 	# privately manage own user profile
	# 	friend_requests_sent = Friends_Manager.fetch_sent(origin=query_user_instance)
	# 	friend_requests_received = Friends_Manager.fetch_received(target=query_user_instance)
	# else:
	# 	# UserProfileConsumer.connect(user_instance.username)#@audit not working (was DisplayOnlineStatus.js)
	# 	# check for the request user if he is an origin or a target of a request by the user_instance
	# 	friend_requests_sent = Friends_Manager.fetch_sent(origin=request.user)
	# 	friend_requests_received = Friends_Manager.fetch_received(target=request.user)

	pong_ratio = win_to_loss_ratio(
		query_user_instance.matches_won, query_user_instance.matches_lost
	)
	return render(
		request,
		'users/public_profile.html',
		{
			'request_user': request.user,
			'query_user': query_user_instance,
			'pong_matches_lost': query_user_instance.matches_lost,
			'pong_matches_won': query_user_instance.matches_won,
			'pong_win_loss_ratio': pong_ratio,
			'games_won': pong_games_won,
			'games_lost': pong_games_lost,
			# 'friends': friends,
			# 'friend_requests_sent': friend_requests_sent,
			# 'friend_requests_received': friend_requests_received,
		},
	)


# def list(request):
# 	users_players = User.objects.order_by('-date_joined')[:10]
# 	return render(request, 'users/list.html', {'players_list': users_players})


# TODO @follow-up merge into Friends_Manager/decide on friends management API
@login_required_redirect
def friends_users_active(request, username=None):
	"""
	wrapper for fetch_friends_public

	API Endpoint: /users/api/friends/active/<str:username>/ where username is optional
	"""
	if username is None:
		user = request.user
	else:
		user = User.objects.get(username=username)
	friends_of = Friends_Manager.fetch_friends_public(user_instance=user)
	return JsonResponse(
		{
			'success': True,
			'friends_users': [friend.username for friend in friends_of],
		}
	)


@login_required_redirect
def friends_requests(request):
	"""
	wrapper for fetch_received, fetch_sent

	API Endpoint: /users/api/friends/inactive/
	"""
	received = Friends_Manager.fetch_received(target=request.user)
	sent = Friends_Manager.fetch_sent(origin=request.user)
	return JsonResponse(
		{
			'success': True,
			'received': [sender.username for sender in received],
			'sent': [receiver.username for receiver in sent],
		}
	)


@login_required_redirect
def friends_send_request(request, username):
	"""
	API endpoint: `/users/api/friends/request/<str:username>/`
	"""
	try:
		Friends_Manager.friends_request(origin=request.user, target_username=username)
	except ValidationError as e:
		return JsonResponse({'success': False, 'message': str(e)})
	return JsonResponse({'success': True, 'message': _('Friend request sent successfully.')})


@login_required_redirect
def friends_cancel(request, username):
	"""
	API endpoint: `/users/api/friends/cancel/<str:username>/`
	"""
	try:
		Friends_Manager.cancel_friends_request(origin=request.user, target_username=username)
	except Exception as e:
		return JsonResponse({'success': False, 'message': str(e)})
	return JsonResponse({'success': True, 'message': _('Friend request cancelled.')})


@login_required_redirect
def friends_accept(request, username):
	"""
	API endpoint: `/users/api/friends/accept/<str:username>/`
	"""
	try:
		Friends_Manager.accept_request_as_target(target=request.user, origin_username=username)
	except Exception as e:
		return JsonResponse({'success': False, 'message': str(e)})
	return JsonResponse({'success': True, 'message': _('Friend request accepted successfully.')})


@login_required_redirect
def friends_deny(request, username):
	"""
	API endpoint: `/users/api/friends/deny/<str:username>/`
	"""
	try:
		Friends_Manager.deny_friends_request(target=request.user, origin_username=username)
	except Exception as e:
		return JsonResponse({'success': False, 'message': str(e)})
	return JsonResponse({'success': True, 'message': _('Friend request denied.')})


@login_required_redirect
def friends_remove(request, username):
	"""
	API endpoint: `/users/api/friends/remove/<str:username>/`
	"""
	try:
		Friends_Manager.remove_friend(remover=request.user, target_username=username)
	except Exception as e:
		return JsonResponse({'success': False, 'message': str(e)})
	return JsonResponse({'success': True, 'message': _('Friendship ended.')})
