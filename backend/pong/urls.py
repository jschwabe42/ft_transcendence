from django.urls import path
from . import views
from .api_views import CreateGameView, ScoreBoardView, ControllKeySetting, CreateTournement

app_name = 'pong'
urlpatterns = [
	# path("players/", views.players, name="players"),
	# path("players/<int:player_id>/", views.player_details_by_id, name="player_details_by_id"),
	# path("dashboard/", views.dashboard, name="dashboard"),
	path('api/create-tournement/', CreateTournement.as_view(), name='api-create-tournement'),
	path('api/tournement/', views.tournement, name='tournement'),
	path('api/get-score/', ScoreBoardView.as_view(), name='api-get-score'),
	path('api/get-gameControl/', ControllKeySetting.as_view(), name='api-get-gameControl'),
	path('api/create-game/', CreateGameView.as_view(), name='api-create-game'),
	path('api/game-data/', views.game_data, name='game_data'),
	path('api/ingame/', views.ingame, name='in-game'),
	# re_path(r'^.*$', views.game, name="game"),
]
