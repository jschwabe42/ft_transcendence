import logging
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required

# Create your views here.
from users.models import Profile
from .models import Game, Dashboard, Player
from django.contrib.auth.models import User
from django.http import HttpResponse


from django.middleware.csrf import get_token
import sys

# show recent games for now
@login_required
def recent_games(request):
	csrf_token_view(request)
	this_user = request.user
	if request.method == "POST":
		if 'opp_name' in request.POST:
			opponent = request.POST.get('opp_name', '').strip()
			if opponent:
				if User.objects.filter(username=opponent).exists():
					opp = User.objects.get(username=opponent)
					if opp != this_user:
						user_profile = Profile.objects.get(user=this_user)
						opp_profile = Profile.objects.get(user=opp)
						game = Game.objects.create(player1=user_profile, player2=opp_profile)
						game.save()
						return redirect('game:new_game', game_id=game.id)
					else:
						logging.error("You cannot play against yourself.")
						return render(request, "game/recent_games.html", {"error_message": "You cannot play against yourself."})
				else:
					logging.error("Invalid Username")
					return render(request, "game/recent_games.html", {"error_message": "Invalid opponent username."})
			else:
				logging.error("No Input")
				return render(request, "game/recent_games.html", {"error_message": "Please enter an opponent username."})
		if 'player2_enter_game' in request.POST:
			game_id = request.POST.get('player2_enter_game')
			return redirect('game:new_game', game_id=game_id)

	last_games = Game.objects.order_by("-played_at")[:10]
	return render(request, "game/base.html", {"recent_games_list": last_games })


def start_game(request, game_id):
	game = get_object_or_404(Game, id=game_id)
	return render(request, "game/start_game.html", {"game": game, "game_id": game_id})

def game_details(request, game_id):
	game = get_object_or_404(Game, pk=game_id)
	return render(request, "game/game_details.html", {"game": game})

def players(request):
	return render(request, "game/players.html", {"players_list": Player.objects.order_by("-created_at")[:10]})

def player_details_by_id(request, player_id):
	player = get_object_or_404(Player, pk=player_id)
	return render(request, "game/player_details.html", {"player": player})

def dashboard(request):
	return render(request, "game/dashboard.html", {"dashboard": Dashboard.get_instance()})

def csrf_token_view(request):
	csrf_token = get_token(request)
	print("Token:")
	print(csrf_token)
	sys.stdout.flush()