from django.contrib import messages
from django.contrib.auth import (
	authenticate,
	get_user_model,
	login,
	logout,
	update_session_auth_hash,
)
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.db.models import F
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import redirect, render
from pong.models import PongGame
from pong.utils import win_to_loss_ratio

from user_management.friends import Friends_Manager

from .forms import ProfileUpdateForm, UserUpdateForm

# from .consumers import UserProfileConsumer

User = get_user_model()


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
			return JsonResponse({'success': False, 'message': 'Passwords do not match.'})
		if (
			User.objects.filter(username=username).exists()
			or User.objects.filter(display_name=username).exists()
		):
			return JsonResponse({'success': False, 'message': 'Username already taken.'})
		if User.objects.filter(email=email).exists():
			return JsonResponse(
				{'success': False, 'message': 'An Account with this email already exists.'}
			)
		user = User.objects.create_user(
			username=username, email=email, password=password1, display_name=username
		)
		user.save()
		return JsonResponse({'success': True, 'message': 'Account created successfully.'})
	else:
		return JsonResponse({'success': False, 'message': 'Invalid request method.'})


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
				{'success': True, 'message': 'Login successful.', 'csrf_token': new_csrf_token}
			)
		else:
			return JsonResponse({'success': False, 'message': 'Invalid username or password!'})
	else:
		return JsonResponse({'success': False, 'message': 'Invalid request method.'})


def logout_view(request):
	"""
	Logout a user.
	API Endpoint: /users/api/logout/
	"""
	if request.method == 'POST':
		logout(request)
		new_csrf_token = get_token(request)
		return JsonResponse(
			{'success': True, 'message': 'Logout successful.', 'csrf_token': new_csrf_token}
		)
	else:
		return JsonResponse({'success': False, 'message': 'Invalid request method.'})

@login_required
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
		return JsonResponse({'success': False, 'message': 'Invalid request method.'})

@login_required
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

		if not authenticate(username=user.username, password=password):
			return JsonResponse({'success': False, 'message': 'Invalid password.'})
		if username:
			user.username = username
		if email:
			user.email = email
		if display_name:
			user.display_name = display_name
		if image:
			user.image = image
		user.save()
		return JsonResponse({'success': True, 'message': 'Profile updated successfully.'})
	return JsonResponse({'success': False, 'message': 'Invalid request method.'})


@login_required
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
	friends = Friends_Manager.fetch_friends_public(user_instance=query_user_instance)
	if request.user == query_user_instance:
		# privately manage own user profile
		friend_requests_sent = Friends_Manager.fetch_sent(origin=query_user_instance)
		friend_requests_received = Friends_Manager.fetch_received(target=query_user_instance)
	else:
		# UserProfileConsumer.connect(user_instance.username)#@audit not working (was DisplayOnlineStatus.js)
		# check for the request user if he is an origin or a target of a request by the user_instance
		friend_requests_sent = Friends_Manager.fetch_sent(origin=request.user)
		friend_requests_received = Friends_Manager.fetch_received(target=request.user)

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
			'friends': friends,
			'friend_requests_sent': friend_requests_sent,
			'friend_requests_received': friend_requests_received,
		},
	)


# @follow-up some way of displaying errors to the user (without template?, e.g. HttpResponses)
# (we are returning raw errors that are meant for development)
@login_required
def friend_request(request, target_username):
	"""/user/target_username/friend-request"""
	Friends_Manager.friends_request(origin=request.user, target_username=target_username)
	return redirect('/users/user/' + target_username)


@login_required
def cancel_friend_request(request, target_username):
	"""/user/target_username/cancel-friend-request"""
	Friends_Manager.cancel_friends_request(origin=request.user, target_username=target_username)
	return redirect('/users/user/' + request.user.username)


@login_required
def deny_friend_request(request, origin_username):
	"""/user/origin_username/deny-friend-request"""
	Friends_Manager.deny_friends_request(target=request.user, origin_username=origin_username)
	return redirect('/users/user/' + request.user.username)


@login_required
def accept_friend_request(request, origin_username):
	"""/user/origin_username/accept-friend-request"""
	Friends_Manager.accept_request_as_target(target=request.user, origin_username=origin_username)
	return redirect('/users/user/' + request.user.username)


@login_required
def remove_friend(request, other_username):
	"""/user/other_username/remove-friend"""
	Friends_Manager.remove_friend(remover=request.user, target_username=other_username)
	return redirect('/users/user/' + request.user.username)


def list(request):
	users_players = User.objects.order_by('-date_joined')[:10]
	return render(request, 'users/list.html', {'players_list': users_players})
