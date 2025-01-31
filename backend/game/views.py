from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required

# Create your views here.
from .models import Game
from django.middleware.csrf import get_token
import sys


# show recent games for now
@login_required
def recent_games(request):
	csrf_token_view(request)
	if request.method == 'POST':
		if 'player2_enter_game' in request.POST:
			game_id = request.POST.get('player2_enter_game')
			return redirect('game:new_game', game_id=game_id)

	last_games = Game.objects.order_by('-played_at')[:10]
	return render(request, 'game/base.html', {'recent_games_list': last_games})


def start_game(request, game_id):
	game = get_object_or_404(Game, id=game_id)
	return render(request, 'game/start_game.html', {'game': game, 'game_id': game_id})


def game_details(request, game_id):
	game = get_object_or_404(Game, pk=game_id)
	return render(request, 'game/game_details.html', {'game': game})


def csrf_token_view(request):
	csrf_token = get_token(request)
	print('Token:')
	print(csrf_token)
	sys.stdout.flush()
