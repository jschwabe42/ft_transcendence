from django.urls import path
from .views import get_csrf_token
from .api_views import ControlKeySetting, CreateGameView, CreateTournament, ScoreBoardView
from .views import game_data, ingame, tournament, tournament_data

app_name = 'pong'
urlpatterns = [
	path('api/create-tournament/', CreateTournament.as_view(), name='api-create-tournament'),
	path('api/get-score/', ScoreBoardView.as_view(), name='api-get-score'),
	path('api/get-gameControl/', ControlKeySetting.as_view(), name='api-get-gameControl'),
	path('api/create-game/', CreateGameView.as_view(), name='api-create-game'),
	path('api/tournament/', tournament, name='tournament'),
	path('api/tournament_data/', tournament_data, name='tournament_data'),
	path('api/game-data/', game_data, name='game_data'),
	path('api/ingame/', ingame, name='in-game'),
	path('get-csrf-token/', get_csrf_token, name='get_csrf_token'),
]
