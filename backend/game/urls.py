from django.urls import path
from . import views

app_name = "game"
urlpatterns = [
    path("", views.games, name="games"),
    path("<int:game_id>/", views.game_details, name="game_details"),
    path("players/", views.players, name="players"),
    # @follow-up still needed?
    # path("players/<int:player_id>/", views.player_details, name="player_details"),
    path("players/<str:player_name>/", views.player_details, name="player_details"),
    path("dashboard/", views.dashboard, name="dashboard"),
]