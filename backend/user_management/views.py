from django.contrib import messages
from django.contrib.auth import get_user_model, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.db.models import F
from django.shortcuts import redirect, render
from pong_game.models import Game

from user_management.friends import Friends_Manager
from user_management.models import Player

from .forms import ProfileUpdateForm, UserRegisterForm, UserUpdateForm

# from .consumers import UserProfileConsumer

User = get_user_model()


def register(request):
	if request.method == 'POST':
		form = UserRegisterForm(request.POST)
		if form.is_valid():
			form.save()
			messages.success(request, 'Your account has been created! You can now log in!')
			return redirect('users:login')
	else:
		form = UserRegisterForm()

	return render(request, 'users/register.html', {'form': form})


# costum Logout, couse Idk I am stupid to get the normal working
def custom_logout(request):
	logout(request)  # Logs out the user
	return render(request, 'users/logout.html')  # Redirects the user to the login page


@login_required
def account(request):
	if request.method == 'POST':
		u_form = UserUpdateForm(request.POST, instance=request.user)
		p_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
		# @follow-up check if the user is allowed to change the password
		# , and only ask for the password if needed (@todo extract to a separate view!)
		mod_pwd_form = PasswordChangeForm(request.user, request.POST)
		if u_form.is_valid() and p_form.is_valid() and mod_pwd_form.is_valid():
			u_form.save()
			p_form.save()
			user = mod_pwd_form.save()
			update_session_auth_hash(request, user)
			messages.success(request, 'Your account has been updated')
			return redirect('users:account')

	else:
		u_form = UserUpdateForm(instance=request.user)
		p_form = ProfileUpdateForm(instance=request.user)
		mod_pwd_form = PasswordChangeForm(request.user)

	context = {
		'u_form': u_form,
		'p_form': p_form,
		'mod_pwd_form': mod_pwd_form,
	}

	return render(request, 'users/account.html', context)


@login_required
def public_profile(request, query_user):
	query_user_instance = User.objects.get(username=query_user)
	query_player = Player.objects.get(user=query_user_instance)
	games = Game.objects.filter(player1=query_player) | Game.objects.filter(player2=query_player)
	games_won = games.filter(player1=query_player, score1__gt=F('score2')) | games.filter(
		player2=query_player, score2__gt=F('score1')
	)
	# something to use the display_name in games (playing as display_name) @follow-up
	games_lost = [game for game in games if game not in games_won]
	games_won = sorted(games_won, key=lambda game: game.played_at, reverse=True)
	games_lost = sorted(games_lost, key=lambda game: game.played_at, reverse=True)
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
	return render(
		request,
		'users/public_profile.html',
		{
			'request_user': request.user,
			'query_user': query_user_instance,
			'pong_matches_lost': query_player.matches_lost,
			'pong_matches_won': query_player.matches_won,
			'pong_win_loss_ratio': query_player.win_to_loss_ratio(),
			'games_won': games_won,
			'games_lost': games_lost,
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
