import logging
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required

# Create your views here.
from users.models import Profile
from .models import Game, Dashboard, Player
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.http import JsonResponse


from django.middleware.csrf import get_token
import sys

# def game(request):
# 	return render(request, "game/index.html")

def game_data(request):
	try:
		games = Game.objects.order_by("-played_at")[:10]
		data = []
		
		for game in games:
			game_data = {
				'player1': str(game.player1),  # Convert to string if it's a ForeignKey
				'player2': str(game.player2),
				'score1': game.score1,
				'score2': game.score2,
				'started_at': game.started_at.isoformat() if game.started_at else None,
				'played_at': game.played_at.isoformat() if game.played_at else None,
				'pending': game.pending,
				'player1_ready': game.player1_ready,
				'player2_ready': game.player2_ready,
				'player1_control_settings': game.player1_control_settings,
				'player2_control_settings': game.player2_control_settings,
				'game_id': game.id,
			}
			data.append(game_data)
		
		return JsonResponse(data, safe=False)
		
	except Game.DoesNotExist:
		return JsonResponse({'error': 'No Games Found'}, status=404)

def ingame(request):
	game_id = request.GET.get('game_id')
	if not game_id:
		return JsonResponse({'error': 'Game ID is required'}, status=400)
	try:
		game = Game.objects.get(id=game_id)
		game_data = {
			'player1': str(game.player1),
			'player2': str(game.player2),
			'score1': game.score1,
			'score2': game.score2,
			'started_at': game.started_at.isoformat() if game.started_at else None,
			'played_at': game.played_at.isoformat() if game.played_at else None,
			'pending': game.pending,
			'player1_ready': game.player1_ready,
			'player2_ready': game.player2_ready,
			'player1_control_settings': game.player1_control_settings,
			'player2_control_settings': game.player2_control_settings,
			'game_id': game.id,
		}
		return JsonResponse(game_data)
	except Game.DoesNotExist:
		return JsonResponse({'error': 'Game not found'}, status=404)


# def game_details(request, game_id):
# 	game = get_object_or_404(Game, pk=game_id)
# 	return render(request, "game/game_details.html", {"game": game})

# def players(request):
# 	return render(request, "game/players.html", {"players_list": Player.objects.order_by("-created_at")[:10]})

# def player_details_by_id(request, player_id):
# 	player = get_object_or_404(Player, pk=player_id)
# 	return render(request, "game/player_details.html", {"player": player})

# def dashboard(request):
# 	return render(request, "game/dashboard.html", {"dashboard": Dashboard.get_instance()})
