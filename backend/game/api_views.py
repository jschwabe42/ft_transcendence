
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
		game = Game.objects.create(player1=user_profile, player2=opponent_profile)
		game.save()

		return Response({"game_id": game.id, "message": "Game created successfully."}, status=status.HTTP_201_CREATED)