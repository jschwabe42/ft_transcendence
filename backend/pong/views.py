from django.shortcuts import get_object_or_404, render

# Create your views here.

from .models import Game


# show recent games for now
def recent_games(request):
    return render(request, "pong/recent_games.html", {"recent_games_list": Game.objects.order_by("-played_at")[:10]})

def game_details(request, game_id):
    game = get_object_or_404(Game, pk=game_id)
    return render(request, "pong/game_details.html", {"game": game})