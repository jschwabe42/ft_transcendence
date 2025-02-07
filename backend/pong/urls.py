from django.urls import path

from . import views
from .api_views import ControllKeySetting, CreateGameView, CreateTournament, ScoreBoardView

app_name = 'pong'
urlpatterns = [
	path('api/create-tournament/', CreateTournament.as_view(), name='api-create-tournament'),
	path('api/tournament/', views.tournament, name='tournament'),
	path('api/get-score/', ScoreBoardView.as_view(), name='api-get-score'),
	path('api/get-gameControl/', ControllKeySetting.as_view(), name='api-get-gameControl'),
	path('api/create-game/', CreateGameView.as_view(), name='api-create-game'),
	path('api/game-data/', views.game_data, name='game_data'),
	path('api/ingame/', views.ingame, name='in-game'),
]
