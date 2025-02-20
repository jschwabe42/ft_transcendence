from django.http import JsonResponse
from django.db.models import Q

from .models import PongGame, Tournament


def game_data(request):
	try:
		games = PongGame.objects.order_by('-played_at')[:10]
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
				'tournament_id': game.tournament_id,
			}
			data.append(game_data)

		return JsonResponse(data, safe=False)

	except PongGame.DoesNotExist:
		return JsonResponse({'error': 'No Games Found'}, status=404)

def personal_game_data(request, username):
	"""
	Api call that returns the last 10 games played by the user.
	API URL: api/personal-game-data/<str:username>
	"""
	try:
		games = PongGame.objects.filter(
			Q(player1__username=username) | Q(player2__username=username)
		).order_by('-played_at')[:10]

		data = []

		for game in games:
			game_data = {
				'player1': str(game.player1),  # Convert to string if it's a ForeignKey
				'player2': str(game.player2),
				'score1': game.score1,
				'score2': game.score2,
				'started_at': game.started_at.isoformat() if game.started_at else None,
				'played_at': game.played_at.isoformat() if game.played_at else None,
				'game_id': game.id,
				'tournament_id': game.tournament_id,
			}
			data.append(game_data)

		return JsonResponse(data, safe=False)

	except PongGame.DoesNotExist:
		return JsonResponse({'error': 'No Games Found'})


def ingame(request):
	game_id = request.GET.get('game_id')
	if not game_id:
		return JsonResponse({'error': 'Game ID is required'}, status=400)
	try:
		game = PongGame.objects.get(id=game_id)
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
			'tournament_id': game.tournament_id,
		}
		return JsonResponse(game_data)
	except PongGame.DoesNotExist:
		return JsonResponse({'error': 'Game not found'}, status=404)


def tournament(request):
	tournament_id = request.GET.get('tournament_id')
	if not tournament_id:
		return JsonResponse({'error': 'Tournament ID is required'}, status=400)
	try:
		tournament = Tournament.objects.get(id=tournament_id)
		tournament_data = {
			'host': tournament.host,
			'player1': tournament.player1,
			'player2': tournament.player2,
			'player3': tournament.player3,
			'created_at': tournament.created_at.isoformat() if tournament.created_at else None,
			'winner1': tournament.winner1,
			'winner2': tournament.winner2,
			'finalWinner': tournament.finalWinner,
			'openTournament': tournament.openTournament,
			'playernum': tournament.playernum,
			'id': tournament.id,
		}
		return JsonResponse(tournament_data)
	except Tournament.DoesNotExist:
		return JsonResponse({'error': 'Tournament not found'}, status=404)


def tournament_data(request):
	try:
		tournaments = Tournament.objects.filter(finalWinner='').order_by('-created_at')[:10]
		tournaments_data = []

		for tournament in tournaments:
			tournament_data = {
				'tournament_id': tournament.id,
				'host': tournament.host,
				'player1': tournament.player1,
				'player2': tournament.player2,
				'player3': tournament.player3,
				'created_at': tournament.created_at.isoformat(),
				'winner1': tournament.winner1,
				'winner2': tournament.winner2,
				'finalWinner': tournament.finalWinner,
				'openTournament': tournament.openTournament,
				'playernum': tournament.playernum,
			}
			tournaments_data.append(tournament_data)

		return JsonResponse(tournaments_data, safe=False)

	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)
