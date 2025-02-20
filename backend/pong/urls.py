from django.urls import path

from .api_views import ControlKeySetting, CreateGameView, CreateTournament, ScoreBoardView
from .views import game_data, ingame, tournament, tournament_data, personal_game_data

app_name = 'pong'
urlpatterns = [
	path('api/create-tournament/', CreateTournament.as_view(), name='api-create-tournament'),
	path('api/get-score/', ScoreBoardView.as_view(), name='api-get-score'),
	path('api/get-gameControl/', ControlKeySetting.as_view(), name='api-get-gameControl'),
	path('api/personal-game-data/<str:username>/', personal_game_data, name='personal_game_data'),
	path('api/create-game/', CreateGameView.as_view(), name='api-create-game'),
	path('api/tournament/', tournament, name='tournament'),
	path('api/tournament_data/', tournament_data, name='tournament_data'),
	path('api/game-data/', game_data, name='game_data'),
	path('api/ingame/', ingame, name='in-game'),
]
