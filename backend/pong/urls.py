from django.urls import path
from . import views

app_name = "pong"
urlpatterns = [
    path("", views.recent_games, name="recent_games"),
    path("<int:game_id>/", views.game_details, name="game_details"),
]