from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import UserRegisterForm, UserUpdateForm, ProfileUpdateForm
from django.db.models import F
from .models import Profile, User
from game.models import Game
from .consumers import UserProfileConsumer


def register(request):
	if request.method == 'POST':
		form = UserRegisterForm(request.POST)
		if form.is_valid():
			user = form.save()  # Only saves the User instance; Profile creation is handled by the signal
			username = form.cleaned_data.get('username')
			messages.success(request, f'Your account has been created! You can now log in!')
			return redirect('users:login')
	else:
		form = UserRegisterForm()
	
	return render(request, 'users/register.html', {'form': form})



from django.contrib.auth import logout
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm

#costum Logout, couse Idk I am stupid to get the normal working
def custom_logout(request):
	logout(request)  # Logs out the user
	return render(request, 'users/logout.html') # Redirects the user to the login page

@login_required
def account(request):
	if request.method == 'POST':
		u_form = UserUpdateForm(request.POST, instance=request.user)
		p_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)
		mod_pwd_form = PasswordChangeForm(request.user, request.POST)
		if u_form.is_valid() and p_form.is_valid() and mod_pwd_form.is_valid():
			u_form.save()
			p_form.save()
			user = mod_pwd_form.save()
			update_session_auth_hash(request, user)
			messages.success(request, f'Your account has been updated')
			return redirect('account')

	else:
		u_form = UserUpdateForm(instance=request.user)
		p_form = ProfileUpdateForm(instance=request.user.profile)
		mod_pwd_form = PasswordChangeForm(request.user)

	context = {
		'u_form': u_form,
		'p_form': p_form,
		'mod_pwd_form': mod_pwd_form,
	}

	return render(request, 'users/account.html', context)

from .models import Friends_Manager

@login_required
def public_profile(request, query_user):
	user_instance = User.objects.get(username=query_user)
	user_profile = Profile.objects.get(user=user_instance)
	games = Game.objects.filter(player1=user_profile.player) | Game.objects.filter(player2=user_profile.player)
	games_won = games.filter(player1=user_profile.player, score1__gt=F('score2')) | games.filter(player2=user_profile.player, score2__gt=F('score1'))
	games_lost = [game for game in games if game not in games_won]
	games_won = sorted(games_won, key=lambda game: game.played_at, reverse=True)
	games_lost = sorted(games_lost, key=lambda game: game.played_at, reverse=True)
	friends = Friends_Manager.fetch_friends_public(user_instance=user_instance)
	if request.user == user_instance:
		# privately manage own user profile
		friend_requests_sent = Friends_Manager.fetch_sent(origin=user_instance)
		friend_requests_received = Friends_Manager.fetch_received(target=user_instance)
	else:
		# UserProfileConsumer.connect(user_instance.username)#@audit not working (DisplayOnlineStatus.js)
		# check for the request user if he is an origin or a target of a request by the user_instance
		friend_requests_sent = Friends_Manager.fetch_sent(origin=request.user)
		friend_requests_received = Friends_Manager.fetch_received(target=request.user)
	return render(request, 'users/public_profile.html', {'request_user': request.user, 'user_profile': user_profile, 'games_won': games_won, 'games_lost': games_lost, 'friends': friends, 'friend_requests_sent': friend_requests_sent, 'friend_requests_received': friend_requests_received})

# @follow-up some way of displaying errors to the user (without template?, e.g. HttpResponses)
# (we are returning raw errors that are meant for development)
@login_required
def friend_request(request, target_username):
	"""/user/target_username/friend-request"""
	Friends_Manager.friends_request(origin=request.user, target_username=target_username)
	return redirect('/user/' + target_username)

@login_required
def cancel_friend_request(request, target_username):
	"""/user/target_username/cancel-friend-request"""
	Friends_Manager.cancel_friends_request(origin=request.user, target_username=target_username)
	return redirect('/user/' + request.user.username)

@login_required
def deny_friend_request(request, origin_username):
	"""/user/origin_username/deny-friend-request"""
	Friends_Manager.deny_friends_request(target=request.user, origin_username=origin_username)
	return redirect('/user/' + request.user.username)

@login_required
def accept_friend_request(request, origin_username):
	"""/user/origin_username/accept-friend-request"""
	Friends_Manager.accept_request_as_target(target=request.user, origin_username=origin_username)
	return redirect('/user/' + request.user.username)

@login_required
def remove_friend(request, other_username):
	"""/user/other_username/remove-friend"""
	Friends_Manager.remove_friend(remover=request.user, target_username=other_username)
	return redirect('/user/' + request.user.username)

def list(request):
	users_players = User.objects.order_by("-date_joined")[:10]
	return render(request, "users/list.html", {"players_list": users_players})