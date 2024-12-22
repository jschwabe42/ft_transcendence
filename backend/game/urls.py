from django.urls import path
from . import views
from .api_views import CreateGameView, ScoreBoardView, ControllKeySetting

app_name = "game"
urlpatterns = [
	path("", views.recent_games, name="recent_games"),
	path("<int:game_id>/", views.game_details, name="game_details"),
	path("players/", views.players, name="players"),
	path("players/<int:player_id>/", views.player_details_by_id, name="player_details_by_id"),

	path('api/create-game/', CreateGameView.as_view(), name='api-create-game'),
	path('api/get-score/', ScoreBoardView.as_view(), name='api-get-score'),
	path('api/get-gameControl/', ControllKeySetting.as_view(), name='api-get-gameControl'),

	path("new/<int:game_id>/", views.start_game, name="new_game"),
	path("dashboard/", views.dashboard, name="dashboard"),
]