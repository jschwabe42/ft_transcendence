
# Create your views here.
from users.models import Profile
from .models import Game, Dashboard
from django.contrib.auth.models import User
from django.http import HttpResponse

# For api
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# API for game creation
class CreateGameView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		opponent_username = request.data.get('opponent')
		if not opponent_username:
			return Response({"error": "Opponent username is required."}, status=status.HTTP_400_BAD_REQUEST)

		if opponent_username == request.user.username:
			return Response({"error": "You cannot play against yourself."}, status=status.HTTP_400_BAD_REQUEST)

		try:
			opponent = User.objects.get(username=opponent_username)
		except User.DoesNotExist:
			return Response({"error": "Opponent does not exist."}, status=status.HTTP_404_NOT_FOUND)

		# Retrieve user profiles
		user_profile = Profile.objects.get(user=request.user)
		opponent_profile = Profile.objects.get(user=opponent)

		# Create the game
		game = Game.objects.create(player1=user_profile.player, player2=opponent_profile.player)
		game.save()

		return Response({"game_id": game.id, "message": "Game created successfully."}, status=status.HTTP_201_CREATED)

class ScoreBoardView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		game_id = request.data.get('game_id')
		score1 = request.data.get('score1')
		score2 = request.data.get('score2')
		# print(game_id, score1, score2)
		if not game_id:
			return Response({"error": "game_id score1 and score2 are requirded"}, status=status.HTTP_400_BAD_REQUEST)
		
		try:
			game = Game.objects.get(id=game_id)
		except Game.DoesNotExist:
			return Response({"error": "Game not found."}, status=status.HTTP_404_NOT_FOUND)
		
		game = Game.objects.get(id=game_id)
		game.score1 = int(score1)
		game.score2 = int(score2)
		game.save()

		return Response({"scores": "Game successfully saved score."}, status=status.HTTP_200_OK)
	

class ControllKeySetting(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		game_id = request.data.get('game_id')
		user = request.user.username
		control1 = request.data.get('control1')
		control2 = request.data.get('control2')

		if not game_id or control1 is None or control2 is None:
			return Response({"error": "game_id, control1, and control2 are required."}, status=status.HTTP_400_BAD_REQUEST)

		try:
			game = Game.objects.get(id=game_id)
		except Game.DoesNotExist:
			return Response({"error": "Game not found."}, status=status.HTTP_404_NOT_FOUND)

		if user == game.player1.__str__():
			game.player1_control_settings = control1
		elif user == game.player2.__str__():
			game.player2_control_settings = control2
		else:
			return Response({"error": "You are not a player in this game."}, status=status.HTTP_403_FORBIDDEN)

		game.save()
		
		return Response(
			{"message": f"Control settings successfully updated for user {user}."},
			status=status.HTTP_200_OK
		)