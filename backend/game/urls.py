from django.urls import path
from . import views

app_name = "game"
urlpatterns = [
    path("", views.recent_games, name="recent_games"),
    path("<int:game_id>/", views.game_details, name="game_details"),
    path("players/", views.players, name="players"),
    path("players/<int:player_id>/", views.player_details, name="player_details"),
    path("dashboard/", views.dashboard, name="dashboard"),
]