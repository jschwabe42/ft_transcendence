from django.urls import path

from . import views
from .api_views import ControlKeySetting, CreateGameView, ScoreBoardView

app_name = 'pong'
urlpatterns = [
	path('', views.recent_games, name='recent_games'),
	path('<int:game_id>/', views.game_details, name='game_details'),
	path('api/create-game/', CreateGameView.as_view(), name='api-create-game'),
	path('api/get-score/', ScoreBoardView.as_view(), name='api-get-score'),
	path('api/get-gameControl/', ControlKeySetting.as_view(), name='api-get-gameControl'),
	path('new/<int:game_id>/', views.start_game, name='new_game'),
]
