from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext as _
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
	HTTP_200_OK,
	HTTP_201_CREATED,
	HTTP_400_BAD_REQUEST,
	HTTP_403_FORBIDDEN,
	HTTP_404_NOT_FOUND,
)
from rest_framework.views import APIView

from .models import PongGame, Tournament

User = get_user_model()


class CreateGameView(APIView):
	"""API for game creation: `/pong/api/create-game/`"""

	# For testing CLI comment permission_classes cause canot acces csrf_token
	permission_classes = [IsAuthenticated]

	def post(self, request):
		opponent_username = request.data.get('opponent')
		user_username = request.data.get('username')
		tournament_id = request.data.get('tournament', 0)
		if not opponent_username:
			return Response(
				{'error': _('Opponent username is required.')},
				status=HTTP_400_BAD_REQUEST,
			)

		if opponent_username == request.user.username and tournament_id == 0:
			return Response(
				{'error': _('You cannot play against yourself.')},
				status=HTTP_400_BAD_REQUEST,
			)

		try:
			opponent = User.objects.get(username=opponent_username)
		except User.DoesNotExist:
			return Response({'error': _('Opponent does not exist.')}, status=HTTP_404_NOT_FOUND)

		try:
			player = User.objects.get(username=user_username)
		except User.DoesNotExist:
			return Response({'error': _('User does not exist.')}, status=HTTP_404_NOT_FOUND)

		# Create the game
		if tournament_id != 0:
			tournament = Tournament.objects.get(id=tournament_id)
			if tournament.finalWinner != '':
				return
			if not tournament.openTournament:
				tournament.openTournament = True
				tournament.save()
		game = PongGame.objects.create(
			player1=player, player2=opponent, tournament_id=tournament_id
		)
		game.save()

		return Response(
			{'game_id': game.id, 'message': _('Game created successfully.')},
			status=HTTP_201_CREATED,
		)


class ScoreBoardView(APIView):
	"""API Endpoint: `/pong/api/get-score/`"""

	# For testing CLI comment permission_classes cause canot acces csrf_token
	# permission_classes = [IsAuthenticated]

	def post(self, request):
		game_id = request.data.get('game_id')
		score1 = request.data.get('score1')
		score2 = request.data.get('score2')

		if not game_id:
			return Response(
				{'error': _('game_id score1 and score2 are required')},
				status=HTTP_400_BAD_REQUEST,
			)

		try:
			game = PongGame.objects.get(id=game_id)
		except PongGame.DoesNotExist:
			return Response({'error': _('Game not found.')}, status=HTTP_404_NOT_FOUND)

		game.score1 = int(score1)
		game.score2 = int(score2)

		if game.score1 == 10 or game.score2 == 10:
			game.pending = False
			game.played_at = timezone.now()
			if game.tournament_id != 0:
				if game.score1 == 10:
					winner = game.player1.get_username()
				else:
					winner = game.player2.get_username()
				tournament_id = game.tournament_id
				tournament = Tournament.objects.get(id=tournament_id)
				if tournament.winner1 == '':
					tournament.winner1 = winner
				elif tournament.winner2 == '':
					tournament.winner2 = winner
				else:
					tournament.finalWinner = winner
				tournament.save()

		game.save()

		return Response({'scores': _('Game successfully saved score.')}, status=HTTP_200_OK)


class ControlKeySetting(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		game_id = request.data.get('game_id')
		username = request.data.get('username')

		control1 = request.data.get('control1')
		control2 = request.data.get('control2')

		if not game_id or control1 is None or control2 is None:
			return Response(
				{'error': _('game_id, control1, and control2 are required.')},
				status=HTTP_400_BAD_REQUEST,
			)

		try:
			game = PongGame.objects.get(id=game_id)
		except PongGame.DoesNotExist:
			return Response({'error': _('Game not found.')}, status=HTTP_404_NOT_FOUND)

		if username == game.player1.username:
			game.player1_control_settings = control1
		elif username == game.player2.username:
			game.player2_control_settings = control2
		else:
			return Response(
				{'error': _('You are not a player in this game.')},
				status=HTTP_403_FORBIDDEN,
			)

		game.save()

		return Response(
			{'message': f'{_("Control settings successfully updated for user")} {username}.'},
			status=HTTP_200_OK,
		)


class CreateTournament(APIView):
	"""API Endpoint: `/pong/api/create-tournament/`"""

	# permission_classes = [IsAuthenticated]

	def post(self, request):
		username = request.data.get('username')

		try:
			User.objects.get(username=username)
		except User.DoesNotExist:
			return Response({'error': _('user does not exist.')}, status=HTTP_404_NOT_FOUND)

		tournament = Tournament.objects.create(host=username)
		tournament.save()
		return Response(
			{
				'tournament_id': tournament.id,
				'message': _('Tournament created successfully.'),
			},
			status=HTTP_201_CREATED,
		)
