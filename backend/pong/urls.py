from django.urls import path

from .api_views import ControlKeySetting, CreateGameView, CreateTournament, ScoreBoardView
from .views import game_data, ingame, tournament

app_name = 'pong'
urlpatterns = [
	path('api/create-tournament/', CreateTournament.as_view(), name='api-create-tournament'),
	path('api/tournament/', tournament, name='tournament'),
	path('api/get-score/', ScoreBoardView.as_view(), name='api-get-score'),
	path('api/get-gameControl/', ControlKeySetting.as_view(), name='api-get-gameControl'),
	path('api/create-game/', CreateGameView.as_view(), name='api-create-game'),
	path('api/game-data/', game_data, name='game_data'),
	path('api/ingame/', ingame, name='in-game'),
]
