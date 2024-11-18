from django.shortcuts import get_object_or_404, render

# Create your views here.

from .models import Game, Player


# show recent games for now
def recent_games(request):
    return render(request, "pong/recent_games.html", {"recent_games_list": Game.objects.order_by("-played_at")[:10]})

def game_details(request, game_id):
    game = get_object_or_404(Game, pk=game_id)
    return render(request, "pong/game_details.html", {"game": game})

def players(request):
    return render(request, "pong/players.html", {"players_list": Player.objects.order_by("-created_at")[:10]})

def player_details(request, player_id):
    player = get_object_or_404(Player, pk=player_id)
    return render(request, "pong/player_details.html", {"player": player})
