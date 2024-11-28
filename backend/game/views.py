from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required

# Create your views here.
from users.models import Profile
from .models import Game, Dashboard
from django.contrib.auth.models import User
from django.http import HttpResponse

# show recent games for now
@login_required
def recent_games(request):
	if 'player2_enter_game' in request.POST:
		game_id = request.POST.get('player2_enter_game')
		game = Game.objects.get(id=game_id)
		game.pending = False
		game.save()
		return redirect('game:new_game', game_id=game_id)

	last_games = Game.objects.order_by("-played_at")[:10]
	return render(request, "game/recent_games.html", {"recent_games_list": last_games})



def start_game(request, game_id):
	game = get_object_or_404(Game, id=game_id)
	return render(request, "game/start_game.html", {"game": game, "game_id": game_id})
	# return render(request, "game/new_game.html")

def game_details(request, game_id):
	game = get_object_or_404(Game, pk=game_id)
	return render(request, "game/game_details.html", {"game": game})

def players(request):
	return render(request, "game/players.html", {"players_list": Profile.objects.order_by("-created_at")[:10]})

def player_details(request, player_id):
	player = get_object_or_404(Profile, pk=player_id)
	return render(request, "game/player_details.html", {"player": player})

def dashboard(request):
	return render(request, "game/dashboard.html", {"dashboard": Dashboard.get_instance()})
