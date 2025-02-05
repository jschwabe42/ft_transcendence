import logging
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required

# Create your views here.
from users.models import Profile
from .models import Game, Dashboard, Player, Tournement
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.http import JsonResponse

import sys

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


def tournement(request):
	tournement_id = request.GET.get('tournement_id')
	if not tournement_id:
		return JsonResponse({'error': 'Tournement ID is required'}, status=400)
	try:
		tournement = Tournement.objects.get(id=tournement_id)
		tournement_data = {
			'host': tournement.host,
			'player1': tournement.player1,
			'player2': tournement.player2,
			'player3': tournement.player3,
			'created_at': tournement.created_at.isoformat() if tournement.created_at else None,
			'winner1': tournement.winner1,
			'winner2': tournement.winner2,
			'openTournement': tournement.openTournement,
			'playernum': tournement.playernum,
			'id': tournement.id,
		}
		return JsonResponse(tournement_data)
	except Tournement.DoesNotExist:
		return JsonResponse({'error': 'Tournement not found'}, status=404)