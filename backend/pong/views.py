import sys

from django.contrib.auth.decorators import login_required
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404, redirect, render

# Create your views here.
from .models import PongGame


# show recent games for now
@login_required
def recent_games(request):
	csrf_token_view(request)
	if request.method == 'POST':
		if 'player2_enter_game' in request.POST:
			game_id = request.POST.get('player2_enter_game')
			return redirect('pong:new_game', game_id=game_id)

	last_games = PongGame.objects.order_by('-played_at')[:10]
	return render(request, 'pong/overview.html', {'recent_games_list': last_games})


def start_game(request, game_id):
	game = get_object_or_404(PongGame, id=game_id)
	return render(request, 'pong/start_game.html', {'game': game, 'game_id': game_id})


def game_details(request, game_id):
	game = get_object_or_404(PongGame, pk=game_id)
	return render(request, 'pong/game_details.html', {'game': game})


def csrf_token_view(request):
	csrf_token = get_token(request)
	print('Token:')
	print(csrf_token)
	sys.stdout.flush()
